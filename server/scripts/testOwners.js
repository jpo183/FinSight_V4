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

    // Use the search endpoint to find owners
    console.log('\n2. Searching for owners:');
    const searchResponse = await hubspotApi.post('/owners/search', {
      filterGroups: [{
        filters: [{
          propertyName: 'id',
          operator: 'IN',
          values: TEST_OWNER_IDS
        }]
      }],
      properties: ['firstname', 'lastname', 'email', 'archived'],
      limit: 100
    });

    console.log('Search Response:', JSON.stringify(searchResponse.data, null, 2));

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