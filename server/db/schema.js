const db = require('./index');

const createTables = async () => {
  try {
    // Create companies table
    await db.query(`
      CREATE TABLE IF NOT EXISTS companies (
        company_id VARCHAR(50) PRIMARY KEY,
        company_name VARCHAR(255),
        industry VARCHAR(100),
        type VARCHAR(100),
        annual_revenue DECIMAL(15,2),
        total_revenue DECIMAL(15,2),
        created_date TIMESTAMP,
        last_modified_date TIMESTAMP,
        city VARCHAR(100),
        state VARCHAR(50),
        country VARCHAR(100)
      );
    `);

    // Create deals table
    await db.query(`
      CREATE TABLE IF NOT EXISTS deals (
        deal_id VARCHAR(50) PRIMARY KEY,
        company_id VARCHAR(50) REFERENCES companies(company_id),
        deal_name VARCHAR(255),
        amount DECIMAL(15,2),
        create_date TIMESTAMP,
        close_date TIMESTAMP,
        last_modified_date TIMESTAMP,
        deal_stage VARCHAR(100),
        pipeline VARCHAR(100),
        stage_probability DECIMAL(5,2),
        acv DECIMAL(15,2),
        arr DECIMAL(15,2),
        mrr DECIMAL(15,2),
        owner_id VARCHAR(50),
        is_closed BOOLEAN,
        is_won BOOLEAN,
        fiscal_quarter VARCHAR(10),
        fiscal_year INTEGER
      );
    `);

    // Create indexes
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_deals_company ON deals(company_id);
      CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(deal_stage);
      CREATE INDEX IF NOT EXISTS idx_deals_date ON deals(close_date);
      CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
    `);

    console.log('Tables and indexes created successfully');
  } catch (err) {
    console.error('Error creating tables:', err);
    throw err;
  }
};

module.exports = { createTables }; 