// ... previous imports ...

async function fetchDealsWithCompanies() {
  try {
    // Limit to just one page of results (max 100 deals)
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
      associations: ['company'],
      limit: 5  // Just get 5 deals for testing
    };

    const response = await hubspotApi.post('/objects/deals/search', searchCriteria);
    const deals = response.data.results;
    const companyIds = new Set();

    // Process each deal and collect company IDs
    deals.forEach(deal => {
      if (deal.associations?.companies?.results) {
        deal.associations.companies.results.forEach(company => {
          companyIds.add(company.id);
        });
      }
    });

    // Fetch company details for all collected company IDs
    const companies = await fetchCompanyDetails(Array.from(companyIds));

    return {
      deals,
      companies
    };
  } catch (error) {
    console.error('Error fetching deals:', error);
    throw error;
  }
}

// Add more detailed logging
async function runImport() {
  try {
    console.log('Starting test import...');
    const { deals, companies } = await fetchDealsWithCompanies();
    console.log('Fetched data:');
    console.log(`- ${deals.length} deals`);
    console.log(`- ${companies.length} companies`);
    
    console.log('\nSample deal:', JSON.stringify(deals[0], null, 2));
    console.log('\nSample company:', JSON.stringify(companies[0], null, 2));
    
    console.log('\nSaving to database...');
    await saveToDatabase(deals, companies);
    console.log('Test import completed successfully');
  } catch (error) {
    console.error('Test import failed:', error);
  } finally {
    pool.end();
  }
} 