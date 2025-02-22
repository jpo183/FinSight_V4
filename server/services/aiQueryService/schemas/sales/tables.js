const SALES_SCHEMA = {
  tables: {
    deals: {
      name: 'deals',
      description: 'Contains all deal/opportunity information',
      columns: {
        deal_id: { type: 'varchar(50)', description: 'Primary key - Unique identifier for the deal', isPrimary: true },
        company_id: { type: 'varchar(50)', description: 'Foreign key to companies table', references: 'companies.company_id' },
        deal_name: { type: 'varchar(255)', description: 'Name of the deal/opportunity' },
        amount: { type: 'numeric(15,2)', description: 'Total monetary value of the deal' },
        create_date: { type: 'timestamp', description: 'When the deal was created' },
        close_date: { type: 'timestamp', description: 'Expected or actual closing date' },
        last_modified_date: { type: 'timestamp', description: 'Last time the deal was updated' },
        deal_stage: { type: 'varchar(100)', description: 'Current stage in the sales pipeline' },
        pipeline: { type: 'varchar(100)', description: 'Sales pipeline the deal belongs to' },
        stage_probability: { type: 'numeric(5,2)', description: 'Probability of winning based on stage' },
        acv: { type: 'numeric(15,2)', description: 'Annual Contract Value' },
        arr: { type: 'numeric(15,2)', description: 'Annual Recurring Revenue' },
        mrr: { type: 'numeric(15,2)', description: 'Monthly Recurring Revenue' },
        owner_id: { type: 'varchar(50)', description: 'Foreign key to owners table', references: 'owners.owner_id' },
        is_closed: { type: 'boolean', description: 'Whether the deal is closed' },
        is_won: { type: 'boolean', description: 'Whether the deal was won' },
        fiscal_quarter: { type: 'varchar(10)', description: 'Fiscal quarter (Q1-Q4)' },
        fiscal_year: { type: 'integer', description: 'Fiscal year' }
      }
    },

    companies: {
      name: 'companies',
      description: 'Contains company/account information',
      columns: {
        company_id: { type: 'varchar(50)', description: 'Primary key - Unique identifier for the company', isPrimary: true },
        company_name: { type: 'varchar(255)', description: 'Name of the company' },
        industry: { type: 'varchar(100)', description: 'Industry classification' },
        type: { type: 'varchar(100)', description: 'Company type/category' },
        annual_revenue: { type: 'numeric(15,2)', description: 'Annual revenue of the company' },
        total_revenue: { type: 'numeric(15,2)', description: 'Total revenue from all deals' },
        created_date: { type: 'timestamp', description: 'When the company record was created' },
        last_modified_date: { type: 'timestamp', description: 'Last time the company was updated' },
        city: { type: 'varchar(100)', description: 'City location' },
        state: { type: 'varchar(100)', description: 'State/province location' },
        country: { type: 'varchar(100)', description: 'Country location' }
      }
    },

    owners: {
      name: 'owners',
      description: 'Contains sales rep/owner information',
      columns: {
        owner_id: { type: 'varchar(50)', description: 'Primary key - Unique identifier for the owner', isPrimary: true },
        owner_name: { type: 'varchar(255)', description: 'Full name of the owner' },
        owner_email: { type: 'varchar(255)', description: 'Email address of the owner' },
        team: { type: 'varchar(100)', description: 'Team or department' },
        created_date: { type: 'timestamp', description: 'When the owner record was created' },
        last_modified_date: { type: 'timestamp', description: 'Last time the owner was updated' }
      }
    }
  },

  relationships: [
    {
      from: 'deals.company_id',
      to: 'companies.company_id',
      type: 'many-to-one',
      description: 'Each deal belongs to one company'
    },
    {
      from: 'deals.owner_id',
      to: 'owners.owner_id',
      type: 'many-to-one',
      description: 'Each deal is owned by one sales rep'
    }
  ]
};

module.exports = SALES_SCHEMA; 