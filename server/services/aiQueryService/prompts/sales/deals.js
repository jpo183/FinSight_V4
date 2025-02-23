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
        terms: ['won', 'closed won', 'successful', 'closed', 'landed', 'closed successfully'],
        sqlCondition: 'is_won = TRUE',
        followUps: [
          'What is the total value of these won deals?',
          'When were these deals won?',
          'How does this win rate compare to other reps?'
        ],
        contextMaintenance: {
          valueQuery: 'SELECT SUM(d.amount) FROM deals d JOIN owners o ON d.owner_id = o.owner_id WHERE d.is_won = TRUE',
          timeQuery: 'SELECT close_date, COUNT(*) FROM deals d JOIN owners o ON d.owner_id = o.owner_id WHERE d.is_won = TRUE',
          comparisonQuery: 'SELECT o.owner_name, COUNT(*) FROM deals d JOIN owners o ON d.owner_id = o.owner_id WHERE d.is_won = TRUE'
        }
      },
      lost: {
        terms: ['lost', 'lose', 'closed lost', 'unsuccessful', 'failed', 'dropped'],
        sqlCondition: 'is_won = FALSE',
        followUps: [
          'What is the total value of these lost deals?',
          'When were these deals lost?',
          'What stages did these lost deals reach?'
        ],
        contextMaintenance: {
          valueQuery: 'SELECT SUM(d.amount) FROM deals d JOIN owners o ON d.owner_id = o.owner_id WHERE d.is_won = FALSE',
          timeQuery: 'SELECT close_date, COUNT(*) FROM deals d JOIN owners o ON d.owner_id = o.owner_id WHERE d.is_won = FALSE',
          comparisonQuery: 'SELECT o.owner_name, COUNT(*) FROM deals d JOIN owners o ON d.owner_id = o.owner_id WHERE d.is_won = FALSE'
        }
      }
    },
    conversationRules: [
      'When analyzing deals for a specific status (won/lost), maintain that status in all follow-up queries',
      'Keep the same is_won condition (TRUE/FALSE) when calculating values, trends, or comparisons',
      'Preserve the original owner name in all follow-up queries',
      'Use the same time period constraints across the conversation if specified',
      'Maintain all relevant filters (status, owner, time period) unless explicitly changed by the user'
    ],
    examples: [
      {
        initial: "How many deals did Shannon lose?",
        followUp: "What's the total value of these lost deals?",
        context: { status: 'lost', owner: 'Shannon', maintain: ['is_won = FALSE', "owner_name ILIKE '%shannon%'"] }
      },
      {
        initial: "Show deals won by John",
        followUp: "What's the trend over time?",
        context: { status: 'won', owner: 'John', maintain: ['is_won = TRUE', "owner_name ILIKE '%john%'"] }
      }
    ]
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
  },

  roleContext: {
    primaryRole: "You are a Sales Operations Director and CFO with deep expertise in sales analytics.",
    responsibilities: [
      "Track and analyze sales performance metrics",
      "Monitor deal pipeline and revenue forecasting",
      "Understand win/loss patterns and their financial impact",
      "Analyze sales rep performance and deal ownership"
    ],
    contextualKnowledge: [
      "Lost deals are as important as won deals for analysis",
      "Deal ownership transitions affect pipeline metrics",
      "Deal stages indicate probability of closing",
      "Historical patterns predict future performance"
    ],
    conversationStyle: [
      "Maintain context of won/lost status throughout analysis",
      "Consider both sales and financial implications",
      "Track ownership and accountability in responses",
      "Preserve historical context for trend analysis"
    ]
  }
};

module.exports = SALES_PROMPTS; 