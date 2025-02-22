require('dotenv').config();
const axios = require('axios');
const { pool } = require('../db/index');

const TEST_OWNER_IDS = [
  '368861769',  // Known inactive owner
  '190929822'   // Known active owner (add any other IDs you want to test)
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

    // Then fetch from HubSpot
    console.log('\n2. Fetching owners from HubSpot:');
    for (const ownerId of TEST_OWNER_IDS) {
      try {
        console.log(`\nFetching owner ${ownerId}:`);
        const response = await hubspotApi.get(`/owners/${ownerId}`);
        console.log('Response:', {
          id: response.data.id,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          archived: response.data.archived,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
          teams: response.data.teams
        });
      } catch (error) {
        console.log(`Error fetching owner ${ownerId}:`, error.message);
        if (error.response) {
          console.log('Status:', error.response.status);
          console.log('Data:', error.response.data);
        }
      }
    }

    // Try alternative endpoint
    console.log('\n3. Trying CRM API endpoint:');
    for (const ownerId of TEST_OWNER_IDS) {
      try {
        console.log(`\nFetching owner ${ownerId} via CRM API:`);
        const response = await hubspotApi.get(`/crm/v3/owners/${ownerId}`, {
          params: {
            archived: true
          }
        });
        console.log('Response:', {
          id: response.data.id,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          archived: response.data.archived,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
          teams: response.data.teams
        });
      } catch (error) {
        console.log(`Error fetching owner ${ownerId}:`, error.message);
        if (error.response) {
          console.log('Status:', error.response.status);
          console.log('Data:', error.response.data);
        }
      }
    }

    // Try v4 API as well
    console.log('\n4. Trying v4 API endpoint:');
    const v4Api = axios.create({
      baseURL: 'https://api.hubspot.com/crm/v4',
      headers: {
        'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    for (const ownerId of TEST_OWNER_IDS) {
      try {
        console.log(`\nFetching owner ${ownerId} via v4 API:`);
        const response = await v4Api.get(`/owners/${ownerId}`);
        console.log('Response:', response.data);
      } catch (error) {
        console.log(`Error fetching owner ${ownerId}:`, error.message);
        if (error.response) {
          console.log('Status:', error.response.status);
          console.log('Data:', error.response.data);
        }
      }
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    pool.end();
  }
}

// Run the test
console.log('Starting owner test...');
testOwners(); 