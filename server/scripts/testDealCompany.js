require('dotenv').config();
const axios = require('axios');
const { pool } = require('../db/pool');

const TEST_DEAL_ID = '29118912099';
const TEST_COMPANY_ID = '20268113298';

async function testDealCompanyRelationship() {
  try {
    console.log('\n=== Starting Test for Deal-Company Relationship ===');
    
    // 1. Check HubSpot API
    const hubspotApi = axios.create({
      baseURL: 'https://api.hubspot.com/crm/v3',
      headers: {
        'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const v4Api = axios.create({
      baseURL: 'https://api.hubspot.com/crm/v4',
      headers: {
        'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // 2. Get Deal Details
    console.log('\n1. Fetching Deal from HubSpot:');
    const dealResponse = await hubspotApi.get(`/objects/deals/${TEST_DEAL_ID}`);
    console.log('Deal exists in HubSpot:', dealResponse.data);

    // 3. Get Company Details
    console.log('\n2. Fetching Company from HubSpot:');
    const companyResponse = await hubspotApi.get(`/objects/companies/${TEST_COMPANY_ID}`);
    console.log('Company exists in HubSpot:', companyResponse.data);

    // 4. Get Association
    console.log('\n3. Checking Deal-Company Association:');
    const associationResponse = await v4Api.get(`/objects/deals/${TEST_DEAL_ID}/associations/company`);
    console.log('Association in HubSpot:', associationResponse.data);

    // 5. Check Database State
    console.log('\n4. Checking Database State:');
    const client = await pool.connect();
    try {
      // Check deals table
      const dealQuery = await client.query('SELECT * FROM deals WHERE deal_id = $1', [TEST_DEAL_ID]);
      console.log('\nDeal in Database:', dealQuery.rows[0] || 'Not found');

      // Check companies table
      const companyQuery = await client.query('SELECT * FROM companies WHERE company_id = $1', [TEST_COMPANY_ID]);
      console.log('\nCompany in Database:', companyQuery.rows[0] || 'Not found');

      // Check deal-company relationship
      const relationshipQuery = await client.query(
        'SELECT * FROM deals WHERE deal_id = $1 AND company_id = $2',
        [TEST_DEAL_ID, TEST_COMPANY_ID]
      );
      console.log('\nDeal-Company Relationship in Database:', relationshipQuery.rows[0] || 'Not found');
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error in test:', error);
    if (error.response) {
      console.error('API Response Error:', {
        status: error.response.status,
        data: error.response.data
      });
    }
  }
}

testDealCompanyRelationship().then(() => process.exit()); 