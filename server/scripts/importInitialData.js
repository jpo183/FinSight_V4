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
    let dealsWithCompanies = 0;
    let dealsWithoutCompanies = 0;
    let failedAssociationFetches = 0;

    console.log('\n=== Processing Deal-Company Associations ===');
    for (const deal of allDeals) {
      console.log(`\nFetching associations for deal: ${deal.id} - ${deal.properties.dealname}`);
      
      try {
        const v4Api = axios.create({
          baseURL: 'https://api.hubspot.com/crm/v4',
          headers: {
            'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        
        const associationsResponse = await v4Api.get(`/objects/deals/${deal.id}/associations/company`);
        const associatedCompanies = associationsResponse.data.results || [];
        console.log(`Found ${associatedCompanies.length} companies for deal: ${deal.properties.dealname}`);
        
        if (associatedCompanies.length > 0) {
          deal.companyId = associatedCompanies[0].toObjectId;
          console.log(`DEBUG: Deal ${deal.id} (${deal.properties.dealname}) associated with company: ${deal.companyId}`);
          dealsWithCompanies++;
          associatedCompanies.forEach(company => {
            companyIds.add(company.toObjectId);
          });
        } else {
          dealsWithoutCompanies++;
          console.log('⚠️ No companies found for this deal');
        }
      } catch (error) {
        failedAssociationFetches++;
        console.error('❌ Error fetching associations:', error.message);
        console.error('Deal ID:', deal.id);
        console.error('Deal Name:', deal.properties.dealname);
        if (error.response) {
          console.error('Response Status:', error.response.status);
          console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        }
      }
    }

    console.log('\n=== Deal-Company Association Summary ===');
    console.log(`Total Deals: ${allDeals.length}`);
    console.log(`Deals with Companies: ${dealsWithCompanies}`);
    console.log(`Deals without Companies: ${dealsWithoutCompanies}`);
    console.log(`Failed Association Fetches: ${failedAssociationFetches}`);
    console.log(`Unique Companies Found: ${companyIds.size}`);

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
    console.log(`Total owners to fetch: ${ownerIds.length}`);
    const owners = [];
    
    // Batch requests in groups of 10 to avoid rate limits
    for (let i = 0; i < ownerIds.length; i += 10) {
      const batch = ownerIds.slice(i, i + 10);
      console.log(`\nProcessing batch ${Math.floor(i/10) + 1} of ${Math.ceil(ownerIds.length/10)}`);
      
      const promises = batch.map(id => 
        makeRateLimitedRequest(() => 
          hubspotApi.get(`/owners/${id}`)
        )
      );
      
      try {
        const responses = await Promise.all(promises);
        console.log(`Successfully received ${responses.length} responses for current batch`);
        
        const batchOwners = responses.map(r => r.data);
        owners.push(...batchOwners);
        
        // Add debug logging for inactive owners
        batchOwners.forEach(owner => {
          if (owner.archived) {
            console.log(`Found inactive owner: ${owner.id} - ${owner.firstName} ${owner.lastName}`);
          }
        });
      } catch (error) {
        console.error(`\nError fetching batch of owners:`, error.message);
        continue;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\nFetch summary:`);
    console.log(`- Total owners requested: ${ownerIds.length}`);
    console.log(`- Successfully fetched: ${owners.length}`);
    console.log(`- Active owners: ${owners.filter(o => !o.archived).length}`);
    console.log(`- Inactive owners: ${owners.filter(o => o.archived).length}`);
    
    return owners;
  } catch (error) {
    console.error('\nFatal error fetching owners:', error);
    throw error;
  }
}

async function saveToDatabase(deals, companies, owners) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // First, insert owners
    console.log('\n=== Processing Owners ===');
    for (const owner of owners) {
      const ownerData = {
        id: owner.id,
        name: `${owner.firstName} ${owner.lastName}`.trim(),
        email: owner.email,
        team: owner.teams?.[0]?.name || null,
        created: owner.createdAt,
        modified: owner.updatedAt
      };
      console.log('\nOwner data to insert:', JSON.stringify(ownerData, null, 2));
      
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
        ownerData.id,
        ownerData.name,
        ownerData.email,
        ownerData.team,
        ownerData.created,
        ownerData.modified
      ]);
      console.log(`✓ Saved owner: ${ownerData.email}`);
    }

    // Then companies
    console.log('\n=== Processing Companies ===');
    for (const company of companies) {
      const companyData = {
        id: company.id,
        name: company.properties.name,
        industry: company.properties.industry || null,
        type: company.properties.type || null,
        annual_revenue: company.properties.annualrevenue || null,
        total_revenue: company.properties.total_revenue || null,
        created: company.properties.createdate,
        modified: company.properties.hs_lastmodifieddate,
        city: company.properties.city || null,
        state: company.properties.state || null,
        country: company.properties.country || null
      };
      console.log('\nCompany data to insert:', JSON.stringify(companyData, null, 2));
      
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
        companyData.id,
        companyData.name,
        companyData.industry,
        companyData.type,
        companyData.annual_revenue,
        companyData.total_revenue,
        companyData.created,
        companyData.modified,
        companyData.city,
        companyData.state,
        companyData.country
      ]);
      console.log(`✓ Saved company: ${companyData.name}`);
    }

    // Then deals
    console.log('\n=== Processing Deals ===');
    for (const deal of deals) {
      console.log(`\nDEBUG: About to save deal ${deal.id} with company: ${deal.companyId}`);
      const dealData = {
        id: deal.id,
        company_id: deal.companyId || null,
        name: deal.properties.dealname,
        amount: deal.properties.amount || null,
        create_date: deal.properties.createdate,
        close_date: deal.properties.closedate,
        modified_date: deal.properties.hs_lastmodifieddate,
        stage: deal.properties.dealstage,
        pipeline: deal.properties.pipeline,
        probability: deal.properties.hs_deal_stage_probability || null,
        acv: deal.properties.hs_acv || null,
        arr: deal.properties.hs_arr || null,
        mrr: deal.properties.hs_mrr || null,
        owner_id: deal.properties.hubspot_owner_id,
        is_closed: deal.properties.dealstage?.includes('closed'),
        is_won: deal.properties.dealstage?.includes('won'),
        fiscal_quarter: `Q${Math.ceil(new Date(deal.properties.closedate).getMonth() / 3)}`,
        fiscal_year: new Date(deal.properties.closedate).getFullYear()
      };
      console.log('\nDEBUG: Deal data to insert:', JSON.stringify({
        id: dealData.id,
        company_id: dealData.company_id,
        name: dealData.name
      }, null, 2));
      
      await client.query(`
        INSERT INTO deals (
          deal_id, company_id, deal_name, amount, 
          create_date, close_date, last_modified_date,
          deal_stage, pipeline, stage_probability,
          acv, arr, mrr, owner_id,
          is_closed, is_won, fiscal_quarter, fiscal_year
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (deal_id) DO UPDATE SET
          company_id = EXCLUDED.company_id,
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
        dealData.id,
        dealData.company_id,
        dealData.name,
        dealData.amount,
        dealData.create_date,
        dealData.close_date,
        dealData.modified_date,
        dealData.stage,
        dealData.pipeline,
        dealData.probability,
        dealData.acv,
        dealData.arr,
        dealData.mrr,
        dealData.owner_id,
        dealData.is_closed,
        dealData.is_won,
        dealData.fiscal_quarter,
        dealData.fiscal_year
      ]);
      console.log(`✓ Saved deal: ${dealData.name}`);
    }

    await client.query('COMMIT');
    console.log('\n=== Database Save Summary ===');
    console.log(`✓ Saved ${owners.length} owners`);
    console.log(`✓ Saved ${companies.length} companies`);
    console.log(`✓ Saved ${deals.length} deals`);
    console.log('Database save completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error saving to database:', error);
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