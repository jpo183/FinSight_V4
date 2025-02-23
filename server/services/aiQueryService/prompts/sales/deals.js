const SALES_PROMPTS = {
  commonQueries: {
    pipelineValue: {
      description: 'Total value of deals in the pipeline',
      example: [
        'Show me total pipeline value',
        'What is our pipeline worth for Q1?',
        'Show pipeline value for deals owned by John'
      ],
      sqlPattern: {
        basic: 'SELECT SUM(amount) FROM deals WHERE is_closed = false',
        withQuarter: 'SELECT SUM(amount) FROM deals WHERE is_closed = false AND fiscal_quarter = :quarter AND fiscal_year = :year',
        byOwner: 'SELECT SUM(amount) FROM deals d JOIN owners o ON d.owner_id = o.owner_id WHERE is_closed = false AND o.owner_name ILIKE :owner_name'
      },
      parameters: {
        quarter: 'Fiscal quarter (e.g., "Q1", "Q2")',
        year: 'Fiscal year (e.g., 2024)',
        owner_name: 'Name of the deal owner'
      }
    },
    dealsByStage: {
      description: 'Distribution of deals across pipeline stages',
      example: [
        'How many deals do we have in each stage?',
        'Show deal count and value by stage for Q1 2024',
        'What deals are in negotiation stage?'
      ],
      sqlPattern: {
        basic: 'SELECT deal_stage, COUNT(*) as deal_count, SUM(amount) as total_value FROM deals GROUP BY deal_stage',
        withTimeframe: 'SELECT deal_stage, COUNT(*) as deal_count, SUM(amount) as total_value FROM deals WHERE fiscal_quarter = :quarter AND fiscal_year = :year GROUP BY deal_stage',
        specificStage: 'SELECT deal_name, amount, close_date FROM deals WHERE deal_stage = :stage_name'
      },
      parameters: {
        quarter: 'Fiscal quarter',
        year: 'Fiscal year',
        stage_name: 'Name of pipeline stage (e.g., "negotiation", "closed won")'
      }
    }
  },

  terminology: {
    ownerMappings: [
      { terms: ['rep', 'reps'], table: 'owners' },
      { terms: ['sales rep', 'sales reps'], table: 'owners' },
      { terms: ['representative', 'representatives'], table: 'owners' }
    ],
    nameSearchRules: [
      'Use ILIKE for case-insensitive partial matches',
      'Consider both full names and parts of names',
      'Handle first name only searches',
      'Use OR conditions to check multiple name parts'
    ]
  },

  contextRules: {
    dealStatus: {
      won: {
        terms: ['won', 'closed won', 'successful', 'landed', 'closed successfully'],
        sqlCondition: 'is_won = TRUE',
        followUps: [
          'What is the total value of these won deals?',
          'When were these deals won?',
          'How does this win rate compare to other reps?'
        ]
      },
      lost: {
        terms: ['lost', 'closed lost', 'unsuccessful', 'failed', 'dropped'],
        sqlCondition: 'is_won = FALSE',
        followUps: [
          'What is the total value of these lost deals?',
          'When were these deals lost?',
          'What stages did these lost deals reach?'
        ]
      }
    }
  },

  queryPatterns: {
    timeBased: {
      description: 'Queries involving time periods',
      examples: [
        'Show deals closed last month',
        'What\'s our pipeline for Q1 2024?'
      ],
      timeColumns: ['create_date', 'close_date', 'last_modified_date']
    },
    userBased: {
      description: 'Queries involving owners/users',
      examples: [
        'Show deals owned by John',
        'Which sales reps have the most deals?',
        'Show me all reps and their total pipeline',
        'What\'s the average deal size per rep?',
        'Show me deals for rep Shannon'
      ],
      userColumns: ['owner_id', 'owner_name']
    },
    statusBased: {
      description: 'Queries about deal status',
      examples: [
        'Show all open deals',
        'What deals are closing this month?',
        'How many deals did Shannon lose?',
        'Show me deals won by John',
        'What deals did we lose last quarter?'
      ],
      statusColumns: ['is_closed', 'is_won', 'deal_stage'],
      contextPreservation: [
        'Maintain win/loss context from original query in follow-up suggestions',
        'Use same is_won condition for related queries about the same deals',
        'Keep deal status context when analyzing values or timeframes'
      ]
    },
    metrics: {
      description: 'Numerical/statistical queries',
      examples: [
        'What\'s our average deal size?',
        'Show total revenue by quarter'
      ],
      metricColumns: ['amount', 'acv', 'arr', 'mrr', 'stage_probability']
    }
  }
};

module.exports = SALES_PROMPTS; 