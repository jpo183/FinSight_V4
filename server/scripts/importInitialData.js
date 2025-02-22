require('dotenv').config();
const axios = require('axios');
const { pool } = require('../db/index');

console.log('Script starting...');
console.log('HUBSPOT_API_KEY:', process.env.HUBSPOT_API_KEY ? 'Present' : 'Missing');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Present' : 'Missing');

const hubspotApi = axios.create({
  baseURL: 'https://api.hubspot.com/crm/v3',
  headers: {
    'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

const RATE_LIMIT_DELAY = 10000; // 10 seconds

async function makeRateLimitedRequest(requestFn) {
  while (true) {
    try {
      return await requestFn();
    } catch (error) {
      if (error.response?.status === 429) {
        console.log('Rate limit hit, waiting 10 seconds...');
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
        continue;
      }
      throw error;
    }
  }
}

async function fetchDealsWithCompanies() {
  try {
    console.log('Fetching deals from HubSpot...');
    let after = undefined;
    let allDeals = [];
    
    while (true) {
      console.log(`Making API request with after: ${after || 'initial'}`);
      
      const searchCriteria = {
        filterGroups: [{
          filters: [{
            propertyName: 'createdate',
            operator: 'GTE',
            value: '2024-01-01T00:00:00.000Z'
          }]
        }],
        properties: [
          'dealname',
          'amount',
          'dealstage',
          'createdate',
          'closedate',
          'pipeline',
          'hs_lastmodifieddate',
          'hubspot_owner_id',
          'hs_deal_stage_probability',
          'hs_acv',
          'hs_arr',
          'hs_mrr'
        ],
        limit: 100,
        ...(after ? { after } : {})
      };
      
      const response = await hubspotApi.post('/objects/deals/search', searchCriteria);
      const deals = response.data.results;
      
      if (deals.length === 0) break;
      
      allDeals.push(...deals);
      after = response.data.paging?.next?.after;
      
      console.log(`Fetched ${allDeals.length} deals so far...`);
      console.log(`Next page token: ${after || 'none'}`);
      
      if (!after) break;
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Get associated company IDs directly from the deal
    const companyIds = new Set();
    for (const deal of allDeals) {
      console.log(`Fetching associations for deal: ${deal.properties.dealname}`);
      
      // Create a new axios instance for v4 API calls
      const v4Api = axios.create({
        baseURL: 'https://api.hubspot.com/crm/v4',
        headers: {
          'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      const associationsResponse = await v4Api.get(`/objects/deals/${deal.id}/associations/company`);
      console.log('Association response:', JSON.stringify(associationsResponse.data, null, 2));
      
      const associatedCompanies = associationsResponse.data.results || [];
      console.log(`Found ${associatedCompanies.length} companies for deal: ${deal.properties.dealname}`);
      
      associatedCompanies.forEach(company => {
        companyIds.add(company.toObjectId);
      });
    }

    console.log(`Found ${companyIds.size} unique companies`);
    console.log('Company IDs:', Array.from(companyIds));

    // Fetch company details for all collected company IDs
    const companies = await fetchCompanyDetails(Array.from(companyIds));

    // After fetching deals, collect unique owner IDs
    const ownerIds = new Set();
    allDeals.forEach(deal => {
      if (deal.properties.hubspot_owner_id) {
        ownerIds.add(deal.properties.hubspot_owner_id);
      }
    });

    console.log(`Found ${ownerIds.size} unique owners`);
    const owners = await fetchOwnerDetails(Array.from(ownerIds));

    return {
      deals: allDeals,
      companies,
      owners
    };
  } catch (error) {
    console.error('Error fetching deals:', error);
    throw error;
  }
}

async function fetchCompanyDetails(companyIds) {
  try {
    console.log('Fetching company details...');
    const companies = [];
    
    // Batch requests in smaller groups
    for (let i = 0; i < companyIds.length; i += 5) {
      const batch = companyIds.slice(i, i + 5);
      console.log(`Fetching batch ${i/5 + 1} of ${Math.ceil(companyIds.length/5)} (${batch.length} companies)...`);
      
      const promises = batch.map(id => 
        makeRateLimitedRequest(() => 
          hubspotApi.get(`/objects/companies/${id}`, {
            params: {
              properties: [
                'name',
                'industry',
                'type',
                'annualrevenue',
                'total_revenue',
                'city',
                'state',
                'country',
                'createdate',
                'hs_lastmodifieddate'
              ]
            }
          })
        )
      );
      
      const responses = await Promise.all(promises);
      companies.push(...responses.map(r => r.data));
      
      // Add a delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`Successfully fetched ${companies.length} companies`);
    return companies;
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
}

async function fetchOwnerDetails(ownerIds) {
  try {
    console.log('Fetching owner details...');
    const owners = [];
    
    // Batch requests in groups of 10 to avoid rate limits
    for (let i = 0; i < ownerIds.length; i += 10) {
      const batch = ownerIds.slice(i, i + 10);
      console.log(`Fetching batch of ${batch.length} owners...`);
      
      const promises = batch.map(id => 
        hubspotApi.get(`/owners/${id}`)
      );
      
      const responses = await Promise.all(promises);
      owners.push(...responses.map(r => r.data));
    }

    console.log(`Successfully fetched ${owners.length} owners`);
    return owners;
  } catch (error) {
    console.error('Error fetching owners:', error);
    throw error;
  }
}

async function saveToDatabase(deals, companies, owners) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // First, insert owners
    for (const owner of owners) {
      console.log('Saving owner:', owner.email);
      await client.query(`
        INSERT INTO owners (
          owner_id, owner_name, owner_email, team,
          created_date, last_modified_date
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (owner_id) DO UPDATE SET
          owner_name = EXCLUDED.owner_name,
          owner_email = EXCLUDED.owner_email,
          team = EXCLUDED.team,
          last_modified_date = EXCLUDED.last_modified_date
      `, [
        owner.id,
        `${owner.firstName} ${owner.lastName}`.trim(),
        owner.email,
        owner.teams?.[0]?.name || null,
        owner.createdAt,
        owner.updatedAt
      ]);
    }

    // Then companies
    for (const company of companies) {
      console.log('Saving company:', company?.properties?.name);
      await client.query(`
        INSERT INTO companies (
          company_id, company_name, industry, type, 
          annual_revenue, total_revenue, created_date, 
          last_modified_date, city, state, country
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (company_id) DO UPDATE SET
          company_name = EXCLUDED.company_name,
          industry = EXCLUDED.industry,
          type = EXCLUDED.type,
          annual_revenue = EXCLUDED.annual_revenue,
          total_revenue = EXCLUDED.total_revenue,
          last_modified_date = EXCLUDED.last_modified_date,
          city = EXCLUDED.city,
          state = EXCLUDED.state,
          country = EXCLUDED.country
      `, [
        company.id,
        company.properties.name,
        company.properties.industry,
        company.properties.type,
        company.properties.annualrevenue,
        company.properties.total_revenue,
        company.properties.createdate,
        company.properties.hs_lastmodifieddate,
        company.properties.city,
        company.properties.state,
        company.properties.country
      ]);
    }

    // Then deals (now with just the owner_id reference)
    for (const deal of deals) {
      console.log('Saving deal:', deal.properties.dealname);
      const companyId = deal.associations?.companies?.results[0]?.id;
      
      await client.query(`
        INSERT INTO deals (
          deal_id, company_id, deal_name, amount, 
          create_date, close_date, last_modified_date,
          deal_stage, pipeline, stage_probability,
          acv, arr, mrr, owner_id,
          is_closed, is_won, fiscal_quarter, fiscal_year
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (deal_id) DO UPDATE SET
          deal_name = EXCLUDED.deal_name,
          amount = EXCLUDED.amount,
          close_date = EXCLUDED.close_date,
          last_modified_date = EXCLUDED.last_modified_date,
          deal_stage = EXCLUDED.deal_stage,
          pipeline = EXCLUDED.pipeline,
          stage_probability = EXCLUDED.stage_probability,
          acv = EXCLUDED.acv,
          arr = EXCLUDED.arr,
          mrr = EXCLUDED.mrr,
          owner_id = EXCLUDED.owner_id,
          is_closed = EXCLUDED.is_closed,
          is_won = EXCLUDED.is_won
      `, [
        deal.id,
        companyId,
        deal.properties.dealname,
        deal.properties.amount,
        deal.properties.createdate,
        deal.properties.closedate,
        deal.properties.hs_lastmodifieddate,
        deal.properties.dealstage,
        deal.properties.pipeline,
        deal.properties.hs_deal_stage_probability,
        deal.properties.hs_acv,
        deal.properties.hs_arr,
        deal.properties.hs_mrr,
        deal.properties.hubspot_owner_id,
        deal.properties.dealstage?.includes('closed'),
        deal.properties.dealstage?.includes('won'),
        `Q${Math.ceil(new Date(deal.properties.closedate).getMonth() / 3)}`,
        new Date(deal.properties.closedate).getFullYear()
      ]);
    }

    await client.query('COMMIT');
    console.log('Database save completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving to database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Add more detailed logging
async function runImport() {
  try {
    console.log('Starting test import...');
    const { deals, companies, owners } = await fetchDealsWithCompanies();
    console.log('Fetched data:');
    console.log(`- ${deals.length} deals`);
    console.log(`- ${companies.length} companies`);
    console.log(`- ${owners.length} owners`);
    
    console.log('\nSample deal:', JSON.stringify(deals[0], null, 2));
    console.log('\nSample company:', JSON.stringify(companies[0], null, 2));
    console.log('\nSample owner:', JSON.stringify(owners[0], null, 2));
    
    console.log('\nSaving to database...');
    await saveToDatabase(deals, companies, owners);
    console.log('Test import completed successfully');
  } catch (error) {
    console.error('Test import failed:', error);
  } finally {
    pool.end();
  }
}

// Actually run the import
console.log('Calling runImport()...');
runImport(); 