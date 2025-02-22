const { openai } = require('../../../lib/openai');
const { pool } = require('../../../db');
const { APIError } = require('../../../middleware/errorHandler');

class BaseQueryService {
  /**
   * Process a natural language query
   * @param {string} query - The user's query
   * @param {Object} options - Query processing options
   * @param {string} options.domain - Domain identifier (sales, support, etc.)
   * @param {Object} options.schema - Domain-specific schema
   * @param {Object} options.prompts - Domain-specific prompts
   */
  static async processQuery(query, { domain, schema, prompts }) {
    try {
      // Detect query type and pattern
      const queryType = this.detectQueryType(query, prompts.queryPatterns);
      
      // Find matching prompt examples
      const matchingPrompts = this.findMatchingPrompts(query, prompts.commonQueries);
      
      // Generate SQL using OpenAI
      const aiResponse = await this.generateSQL(query, {
        domain,
        schema,
        queryType,
        matchingPrompts
      });
      
      // Validate the generated SQL
      await this.validateSQL(aiResponse.sql, schema);
      
      // Execute the query
      const results = await this.executeSQL(aiResponse.sql);

      return {
        query,
        sql: aiResponse.sql,
        explanation: aiResponse.explanation,
        results,
        metadata: {
          queryType: aiResponse.queryType,
          timePeriod: aiResponse.timePeriod,
          filters: aiResponse.filters,
          matchedPatterns: matchingPrompts.map(p => p.description)
        }
      };
    } catch (error) {
      console.error(`Error processing ${domain} query:`, error);
      throw error;
    }
  }

  /**
   * Detect the type of query being asked
   * @private
   */
  static detectQueryType(query, queryPatterns) {
    for (const [type, pattern] of Object.entries(queryPatterns)) {
      for (const example of pattern.examples) {
        if (query.toLowerCase().includes(example.toLowerCase())) {
          return type;
        }
      }
    }
    return 'general';
  }

  /**
   * Find matching prompt examples
   * @private
   */
  static findMatchingPrompts(query, commonQueries) {
    const matches = [];
    for (const [key, queryInfo] of Object.entries(commonQueries)) {
      if (Array.isArray(queryInfo.example)) {
        for (const example of queryInfo.example) {
          if (query.toLowerCase().includes(example.toLowerCase())) {
            matches.push({
              type: key,
              description: queryInfo.description,
              sqlPattern: queryInfo.sqlPattern
            });
          }
        }
      }
    }
    return matches;
  }

  /**
   * Generate SQL using OpenAI
   * @private
   */
  static async generateSQL(query, { domain, schema, queryType, matchingPrompts }) {
    const prompt = `
      Given this database schema: ${JSON.stringify(schema, null, 2)}
      
      And these relevant query patterns: ${JSON.stringify(matchingPrompts, null, 2)}
      
 
      And these name search rules:
      - Always use ILIKE with wildcards (%name%) for name searches
      - Never use exact matches (=) for names
      - Example: owner_name ILIKE '%Shannon%' instead of owner_name = 'Shannon'

      Generate a SQL query to answer: "${query}"
      
      The query appears to be a ${queryType} type query.
      
      Requirements:
      1. Use the provided SQL patterns if they match the query intent
      2. Ensure the query is safe and injection-free
      3. Use proper table aliases
      4. Include appropriate JOINs based on the schema relationships
      5. Handle NULL values appropriately
      
      Provide the response in this JSON format:
      {
        "sql": "THE SQL QUERY",
        "explanation": "BRIEF EXPLANATION OF WHAT THE QUERY DOES",
        "queryType": "${queryType}",
        "timePeriod": {"start": "ISO_DATE", "end": "ISO_DATE"} // if applicable
        "filters": ["LIST", "OF", "APPLIED", "FILTERS"]
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a SQL expert specializing in ${domain} analytics.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content);
  }

  /**
   * Validate SQL before execution
   * @private
   */
  static async validateSQL(sql, schema) {
    // Basic SQL injection prevention
    const disallowedPatterns = [
      /;.*;/i,                 // Multiple statements
      /UNION\s+ALL/i,         // UNION attacks
      /ALTER\s+TABLE/i,       // Table alterations
      /DROP\s+TABLE/i,        // Table dropping
      /DELETE\s+FROM/i,       // Delete operations
      /UPDATE\s+\w+\s+SET/i,  // Update operations
      /INSERT\s+INTO/i,       // Insert operations
      /EXEC\s*\(/i,           // Execution attempts
      /xp_cmdshell/i          // Command shell
    ];

    for (const pattern of disallowedPatterns) {
      if (pattern.test(sql)) {
        throw new Error('Invalid SQL operation detected');
      }
    }

    // Ensure it's a SELECT statement
    if (!sql.trim().toUpperCase().startsWith('SELECT')) {
      throw new Error('Only SELECT statements are allowed');
    }

    // Validate table names against schema
    const tableNames = Object.keys(schema.tables);
    const sqlTableNames = sql.match(/from\s+(\w+)|join\s+(\w+)/gi) || [];
    for (const tableName of sqlTableNames) {
      const cleanName = tableName.replace(/from\s+|join\s+/i, '').trim();
      if (!tableNames.includes(cleanName)) {
        throw new Error(`Invalid table name: ${cleanName}`);
      }
    }
  }

  /**
   * Execute SQL query
   * @private
   */
  static async executeSQL(sql) {
    const client = await pool.connect();
    try {
      const result = await client.query(sql);
      return result.rows;
    } finally {
      client.release();
    }
  }
}

module.exports = BaseQueryService; 