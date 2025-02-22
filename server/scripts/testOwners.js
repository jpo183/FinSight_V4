require('dotenv').config();
const axios = require('axios');
const { pool } = require('../db/index');

const hubspotApi = axios.create({
  baseURL: 'https://api.hubspot.com/crm/v3',
  headers: {
    'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

async function importAllOwners() {
  try {
    console.log('=== Starting Owner Import ===\n');

    // Get active owners
    console.log('1. Fetching active owners:');
    const activeResponse = await hubspotApi.get('/owners', {
      params: {
        limit: 100,
        archived: false
      }
    });

    // Get inactive owners
    console.log('\n2. Fetching inactive owners:');
    const inactiveResponse = await hubspotApi.get('/owners', {
      params: {
        limit: 100,
        archived: true
      }
    });

    // Combine results
    const allOwners = [
      ...activeResponse.data.results,
      ...inactiveResponse.data.results
    ];

    console.log(`\nTotal owners found: ${allOwners.length}`);
    console.log(`Active: ${activeResponse.data.results.length}`);
    console.log(`Inactive: ${inactiveResponse.data.results.length}`);

    // Save to database
    console.log('\n3. Saving owners to database:');
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      for (const owner of allOwners) {
        const ownerData = {
          id: owner.id,
          name: `${owner.firstName} ${owner.lastName}`.trim(),
          email: owner.email,
          team: owner.teams?.[0]?.name || null,
          created: owner.createdAt,
          modified: owner.updatedAt
        };

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

        console.log(`✓ Saved owner: ${ownerData.name} (${ownerData.id})`);
      }

      await client.query('COMMIT');
      console.log('\n=== Import Summary ===');
      console.log(`Successfully imported ${allOwners.length} owners`);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Import failed:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  } finally {
    pool.end();
  }
}

// Run the import
console.log('Starting owner import...');
importAllOwners(); 