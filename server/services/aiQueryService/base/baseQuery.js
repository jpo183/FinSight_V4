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
          content: `${prompts.roleContext.primaryRole}

Schema: ${JSON.stringify(schema, null, 2)}

Previous Context: ${JSON.stringify(this.getConversationContext())}

You MUST respond with JSON format only.

Remember:
1. Use previous context to understand follow-up questions
2. Maintain consistency with previous queries
3. If previous context exists, use it to enhance the current query
4. For incomplete queries, use context to fill in missing information (e.g. if owner context exists, use that owner)`
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

      if (aiResponse.queryType === 'analysis') {
        const results = [];
        for (let i = 0; i < aiResponse.sql.length; i++) {
          const queryResults = await this.executeSQL(aiResponse.sql[i]);
          results.push({
            metric: aiResponse.metrics[i],
            data: queryResults
          });
        }
        aiResponse.results = results;
      }

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
      content: `You are an API that returns responses in JSON format for sales data queries.

IMPORTANT CONTEXT RULES:
1. ALWAYS use previous context to complete incomplete queries
2. If a query is missing details (owner, status, etc.), use the context
3. Update context only when new information is provided
4. Maintain owner context unless explicitly changed
5. For partial queries like "Calculate total value of deals won by", use the owner from context

SQL RULES:
1. When ordering by amount, ALWAYS include "AND amount IS NOT NULL"
2. When using MAX(amount), use COALESCE(amount, 0) to handle nulls
3. For deal lookups, exclude null amounts with "AND amount IS NOT NULL"

Given this database schema: ${JSON.stringify(schema, null, 2)}

Previous Context: ${JSON.stringify(this.getConversationContext())}

You MUST return responses in this exact JSON format:
{
  "sql": string | null,
  "explanation": string | null,
  "queryType": string | null,
  "timePeriod": {"start": null, "end": null},
  "filters": [],
  "results": [],
  "error": string | null
}

Remember: ALWAYS use ILIKE with wildcards for names (e.g., owner_name ILIKE '%shannon%')

ANALYSIS RULES:
1. For suggestion/analysis requests, return multiple SQL queries in an array
2. Each query should focus on a specific metric:
   - Win/loss ratio
   - Average deal sizes (won vs lost)
   - Sales cycle duration
   - Industry success rates
   - Common stages where deals are lost
3. Format response as:
{
  "sql": string[] | null,  // Array of SQL queries
  "metrics": string[] | null,  // Description of each metric
  "explanation": string | null,
  "queryType": "analysis",
  "results": [],
  "error": string | null
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
      
      // Only proceed with SQL transformation if we have SQL
      if (response.sql) {
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