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
      // Build conversation history with JSON requirement
      const messages = [
        {
          role: "system",
          content: `${prompts.roleContext.primaryRole}\n\nSchema: ${JSON.stringify(schema, null, 2)}\n\nYou MUST respond with JSON format only.`
        }
      ];

      // Add conversation history if it exists
      if (this.conversationHistory?.length > 0) {
        messages.push(...this.conversationHistory.slice(-5));
      }

      // Add current query
      messages.push({
        role: "user",
        content: `Analyze this query and respond with JSON: ${query}`
      });

      // Generate SQL using OpenAI with conversation context
      const aiResponse = await this.generateSQL(messages, {
        domain,
        schema,
        queryType: this.detectQueryType(query, prompts.queryPatterns),
        prompts
      });

      // Store this exchange in conversation history
      this.conversationHistory = this.conversationHistory || [];
      this.conversationHistory.push(
        { role: "user", content: query },
        { role: "assistant", content: `Generated SQL: ${aiResponse.sql}\nResults: ${JSON.stringify(aiResponse.results)}` }
      );

      return {
        query,
        sql: aiResponse.sql,
        explanation: aiResponse.explanation,
        results: await this.executeSQL(aiResponse.sql),
        metadata: {
          ...aiResponse.metadata,
          conversationContext: this.getConversationContext()
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
  static async generateSQL(messages, { domain, schema, queryType, prompts }) {
    console.log('💫 generateSQL started');
    
    const systemMessage = {
      role: "system",
      content: `You are an API that always returns responses in the exact following JSON format:
{
  "sql": string | null,
  "explanation": string | null,
  "queryType": string | null,
  "timePeriod": {"start": null, "end": null},
  "filters": [],
  "results": [],
  "error": string | null
}

For every query, you must output a valid JSON object with all of these keys present. If you do not have data for a key, set its value to null (or an empty array for "filters" and "results") as appropriate. Even when an error occurs or there is insufficient data, fill in the "error" field with the error message but still include all the other keys exactly as specified. Do not include any additional text outside of this JSON structure.

Given this database schema: ${JSON.stringify(schema, null, 2)}

Remember: ALWAYS use ILIKE with wildcards for names (e.g., owner_name ILIKE '%shannon%')`
    };

    const queryMessage = {
      role: "user",
      content: messages[messages.length - 1].content
    };

    console.log('🤖 Calling OpenAI');
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [systemMessage, queryMessage],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    console.log('📥 Received OpenAI response');
    const responseText = completion.choices[0].message.content.trim();
    console.log('📝 Raw response:', responseText);
    
    try {
      const response = JSON.parse(responseText);
      
      // Check if we have a valid response structure
      if (!response.sql && !response.error) {
        throw new Error('Response missing required fields');
      }

      // If there's an error in the response, throw it
      if (response.error) {
        throw new APIError(response.error, 400);
      }
      
      console.log('🔍 Starting SQL transformation');
      console.log('📝 Original SQL:', response.sql);
      
      // Define name fields that should use ILIKE
      const nameFields = [
        'owner_name',
        'contact_name',
        'company_name',
      ];
      
      nameFields.forEach(field => {
        console.log(`\n🔎 Processing field: ${field}`);
        const pattern = new RegExp(`((?:\\w+\\.)?)${field}\\s*=\\s*'([^']+)'`, 'gi');
        
        // Test if pattern matches before replacement
        const matches = response.sql.match(pattern);
        console.log('🔍 Pattern matches:', matches);
        
        response.sql = response.sql.replace(pattern, (match, alias, value) => {
          console.log(`✨ Found match: "${match}"`);
          console.log(`📌 Table alias: "${alias || 'none'}"`);
          console.log(`📌 Search value: "${value}"`);
          
          const searchTerms = value.toLowerCase().trim().split(/\s+/);
          const conditions = searchTerms.map(term => `${alias}${field} ILIKE '%${term}%'`);
          
          const result = `(${conditions.join(' OR ')})`;
          console.log(`🔄 Transformed to: ${result}`);
          return result;
        });
      });

      console.log('\n📝 Final SQL:', response.sql);
      return response;
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      console.error('Raw response:', responseText);
      throw new APIError('Invalid response format from AI service', 500);
    }
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

  static getConversationContext() {
    // Extract relevant context from conversation history
    const context = {
      dealStatus: null,
      owner: null,
      timePeriod: null
    };

    if (this.conversationHistory?.length > 0) {
      // Analyze history to extract context
      for (const message of this.conversationHistory) {
        if (message.content.includes('is_won = FALSE')) {
          context.dealStatus = 'lost';
        } else if (message.content.includes('is_won = TRUE')) {
          context.dealStatus = 'won';
        }
        
        // Extract owner name from ILIKE patterns
        const ownerMatch = message.content.match(/owner_name ILIKE '%([^%]+)%'/);
        if (ownerMatch) {
          context.owner = ownerMatch[1];
        }
      }
    }

    return context;
  }
}

module.exports = BaseQueryService; 