require('dotenv').config();
const axios = require('axios');
const { pool } = require('../db/index');

const TEST_OWNER_IDS = [
  '368861769',  // Known inactive owner
  '190929822'   // Known active owner
];

const hubspotApi = axios.create({
  baseURL: 'https://api.hubspot.com/crm/v3',
  headers: {
    'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

async function testOwners() {
  try {
    console.log('=== Starting Owner Test ===\n');

    // First, check current database state
    const client = await pool.connect();
    try {
      console.log('1. Checking current database state:');
      const dbResult = await client.query(
        'SELECT owner_id, owner_name, owner_email FROM owners WHERE owner_id = ANY($1)',
        [TEST_OWNER_IDS]
      );
      console.log('Owners in database:', dbResult.rows);
    } finally {
      client.release();
    }

    // Get all owners
    console.log('\n2. Fetching owners:');
    const response = await hubspotApi.get('/owners', {
      params: {
        limit: 100,
        archived: true  // This should include both active and inactive owners
      }
    });

    // Filter for our test IDs
    const foundOwners = response.data.results.filter(owner => 
      TEST_OWNER_IDS.includes(owner.id)
    );

    console.log('\nFound owners:', JSON.stringify(foundOwners, null, 2));
    
    // Summary
    console.log('\nSummary:');
    TEST_OWNER_IDS.forEach(id => {
      const owner = foundOwners.find(o => o.id === id);
      console.log(`Owner ${id}: ${owner ? 'Found' : 'Not found'}`);
      if (owner) {
        console.log(`- Name: ${owner.firstName} ${owner.lastName}`);
        console.log(`- Email: ${owner.email}`);
        console.log(`- Status: ${owner.archived ? 'Inactive' : 'Active'}`);
      }
    });

  } catch (error) {
    console.error('Test failed:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  } finally {
    pool.end();
  }
}

// Run the test
console.log('Starting owner test...');
testOwners(); 