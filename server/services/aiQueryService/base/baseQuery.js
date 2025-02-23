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
      console.log('🔄 processQuery started with:', { query, domain });
      console.log('📚 Current conversation history:', this.conversationHistory);

      // Build conversation history with JSON requirement and context
      const messages = [
        {
          role: "system",
          content: `You are a Sales Operations Director analyzing sales data. Respond in two parts:
          1. A natural language explanation of the data
          2. The supporting data in a simple format

Previous Context: ${JSON.stringify(this.getConversationContext())}

RESPONSE FORMAT:
{
  "explanation": "Clear, natural language explanation of the findings",
  "data": [], // Raw data array
  "sql": "SQL used for transparency",
  "error": null
}

Example response:
{
  "explanation": "Shannon's average lost deal size is $15,860 while won deals average $7,871. This suggests she's more effective at closing smaller deals.",
  "data": [{"type": "won", "average": 7871}, {"type": "lost", "average": 15860}],
  "sql": "SELECT...",
  "error": null
}`
        }
      ];

      // Add conversation history if it exists
      if (this.conversationHistory?.length > 0) {
        console.log('🔍 Adding conversation history to context');
        const relevantHistory = this.conversationHistory.slice(-5);
        console.log('📜 Relevant history:', relevantHistory);
        messages.push(...relevantHistory);
      }

      // Add current query with context hint
      messages.push({
        role: "user",
        content: `Given the previous context, analyze this query: ${query}`
      });

      console.log('📤 Sending messages to OpenAI:', messages);

      // Generate SQL using OpenAI with conversation context
      const aiResponse = await this.generateSQL(messages, {
        domain,
        schema,
        queryType: this.detectQueryType(query, prompts.queryPatterns),
        prompts
      });

      // If AI returns an error, return it without trying to execute SQL
      if (aiResponse.error) {
        console.log('⚠️ AI returned error:', aiResponse.error);
        return {
          query,
          sql: null,
          explanation: aiResponse.error,
          results: [],
          metadata: {
            conversationContext: this.getConversationContext()
          }
        };
      }

      // Only try to execute SQL if we have it
      if (aiResponse.queryType === 'analysis') {
        console.log('📊 Processing analysis results');
        const results = await this.executeSQL(aiResponse.sql);
        return {
          query,
          sql: aiResponse.sql,
          explanation: aiResponse.explanation,
          results: results.map((result, index) => ({
            metric: aiResponse.metrics[index],
            data: result
          })),
          metadata: {
            ...aiResponse.metadata,
            conversationContext: this.getConversationContext()
          }
        };
      } else {
        // Handle single query results (existing logic)
        let results = [];
        if (aiResponse.sql) {
          console.log('✨ Executing SQL:', aiResponse.sql);
          results = await this.executeSQL(aiResponse.sql);
        }

        // Store this exchange in conversation history
        console.log('💾 Updating conversation history');
        this.conversationHistory = this.conversationHistory || [];
        this.conversationHistory.push(
          { 
            role: "user", 
            content: query,
            timestamp: new Date().toISOString(),
            context: this.getConversationContext()
          },
          { 
            role: "assistant", 
            content: JSON.stringify({
              sql: aiResponse.sql,
              results: results,
              context: this.getConversationContext()
            }),
            timestamp: new Date().toISOString()
          }
        );

        console.log('📚 Updated conversation history:', this.conversationHistory);

        return {
          query,
          sql: aiResponse.sql,
          explanation: aiResponse.explanation,
          results: results,
          metadata: {
            ...aiResponse.metadata,
            conversationContext: this.getConversationContext()
          }
        };
      }
    } catch (error) {
      console.error(`❌ Error processing ${domain} query:`, error);
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
      content: `You are a Sales Operations Director analyzing sales data. Respond in two parts:
      1. A natural language explanation of the data
      2. The supporting data in a simple format

Previous Context: ${JSON.stringify(this.getConversationContext())}

RESPONSE FORMAT:
{
  "explanation": "Clear, natural language explanation of the findings",
  "data": [], // Raw data array
  "sql": "SQL used for transparency",
  "error": null
}

Example response:
{
  "explanation": "Shannon's average lost deal size is $15,860 while won deals average $7,871. This suggests she's more effective at closing smaller deals.",
  "data": [{"type": "won", "average": 7871}, {"type": "lost", "average": 15860}],
  "sql": "SELECT...",
  "error": null
}`
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
      
      // Add missing required fields for analysis responses
      if (response.queryType === 'analysis') {
        response.timePeriod = response.timePeriod || {"start": null, "end": null};
        response.filters = response.filters || [];
      }

      // Check required fields based on query type
      const requiredFields = response.queryType === 'analysis' 
        ? ['sql', 'metrics', 'explanation', 'queryType', 'timePeriod', 'filters', 'results', 'error']
        : ['sql', 'explanation', 'queryType', 'timePeriod', 'filters', 'results', 'error'];
      
      const missingFields = requiredFields.filter(field => !(field in response));
      
      if (missingFields.length > 0) {
        throw new Error(`Response missing required fields: ${missingFields.join(', ')}`);
      }

      // If there's an error but the format is valid, return the response
      if (response.error) {
        return {
          sql: null,
          explanation: response.error,
          queryType: null,
          timePeriod: {"start": null, "end": null},
          filters: [],
          results: [],
          error: response.error
        };
      }
      
      // Handle SQL transformation for both single queries and arrays
      if (response.sql) {
        console.log('🔍 Starting SQL transformation');
        console.log('📝 Original SQL:', response.sql);
        
        const nameFields = ['owner_name', 'contact_name', 'company_name'];
        
        if (Array.isArray(response.sql)) {
          // Handle array of queries
          response.sql = response.sql.map(query => {
            let transformedQuery = query;
            nameFields.forEach(field => {
              const pattern = new RegExp(`((?:\\w+\\.)?)${field}\\s*=\\s*'([^']+)'`, 'gi');
              transformedQuery = transformedQuery.replace(pattern, (match, alias, value) => {
                const searchTerms = value.toLowerCase().trim().split(/\s+/);
                const conditions = searchTerms.map(term => `${alias}${field} ILIKE '%${term}%'`);
                return `(${conditions.join(' OR ')})`;
              });
            });
            return transformedQuery;
          });
        } else {
          // Handle single query (existing logic)
          nameFields.forEach(field => {
            const pattern = new RegExp(`((?:\\w+\\.)?)${field}\\s*=\\s*'([^']+)'`, 'gi');
            response.sql = response.sql.replace(pattern, (match, alias, value) => {
              const searchTerms = value.toLowerCase().trim().split(/\s+/);
              const conditions = searchTerms.map(term => `${alias}${field} ILIKE '%${term}%'`);
              return `(${conditions.join(' OR ')})`;
            });
          });
        }

        console.log('\n📝 Final SQL:', response.sql);
      }

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
   * Execute SQL query or queries
   * @private
   */
  static async executeSQL(sql) {
    const client = await pool.connect();
    try {
      if (Array.isArray(sql)) {
        // Handle multiple queries
        const results = [];
        for (const query of sql) {
          console.log('🔍 Executing query:', query);
          const result = await client.query(query);
          results.push(result.rows[0]); // Get first row of each result
        }
        return results;
      } else {
        // Handle single query (existing logic)
        console.log('🔍 Executing single query:', sql);
        const result = await client.query(sql);
        return result.rows;
      }
    } finally {
      client.release();
    }
  }

  /**
   * Get current conversation context
   * @private
   */
  static getConversationContext() {
    console.log('🔍 Getting conversation context');
    const context = {
      dealStatus: null,
      owner: null,
      timePeriod: null,
      lastQuery: null
    };

    if (this.conversationHistory?.length > 0) {
      console.log('📚 Analyzing history for context');
      // Get last 3 exchanges for recent context
      const recentHistory = this.conversationHistory.slice(-3);
      
      for (const message of recentHistory) {
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

        // Store last query for context
        if (message.role === 'user') {
          context.lastQuery = message.content;
        }
      }
    }

    console.log('📤 Extracted context:', context);
    return context;
  }
}

module.exports = BaseQueryService; 