const express = require('express');
const router = express.Router();
const { openai } = require('../lib/openai');
const { pool } = require('../db');
const BaseQueryService = require('../services/aiQueryService/base/baseQuery');
const SalesSchema = require('../services/aiQueryService/schemas/sales/tables');
const SalesPrompts = require('../services/aiQueryService/prompts/sales/deals');

console.log('[aiQuery] Initializing routes');

// POST endpoint for AI queries
router.post('/analyze', async (req, res) => {
  console.log('\n[aiQuery] Route handler start ================');
  console.log('[aiQuery] POST /analyze received');
  console.log('[aiQuery] Request body:', req.body);
  
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        error: 'Query is required' 
      });
    }

    // Generate SQL using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a SQL expert. Generate precise SQL queries based on natural language questions about sales data."
        },
        {
          role: "user",
          content: `Given this schema: ${JSON.stringify(SalesSchema, null, 2)}, 
                    generate a SQL query to answer: "${query}"`
        }
      ],
      response_format: { type: "json_object" }
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);

    // Execute the generated SQL
    const queryResult = await pool.query(aiResponse.sql);

    // Send back both the SQL and the results
    res.json({
      query: query,
      sql: aiResponse.sql,
      explanation: aiResponse.explanation,
      columns: aiResponse.columns,
      results: queryResult.rows
    });

    console.log('[aiQuery] Query processed successfully');
    console.log('[aiQuery] Route handler end ==================\n');

  } catch (error) {
    console.error('\n[aiQuery] Error in route handler ================');
    console.error('[aiQuery] Error details:', error);
    console.error('[aiQuery] Stack trace:', error.stack);
    console.error('[aiQuery] Error handler end ==================\n');
    
    res.status(500).json({ 
      error: error.message,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }
});

// Update route handler to use both schema and prompts
router.post('/sales/analyze', async (req, res) => {
  console.log('\n[aiQuery] Route handler start ================');
  console.log('[aiQuery] POST /sales/analyze received');
  console.log('[aiQuery] Request body:', req.body);
  
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        error: 'Query is required' 
      });
    }

    // Generate SQL using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a SQL expert. Generate SQL queries based on natural language questions about sales data. 
                   Return responses in this format:
                   {
                     "sql": "SELECT ... FROM ...",
                     "explanation": "This query...",
                     "columns": ["column1", "column2"]
                   }`
        },
        {
          role: "user",
          content: `Given this schema: ${JSON.stringify(SalesSchema, null, 2)}, 
                    generate a SQL query to answer: "${query}"`
        }
      ],
      temperature: 0.7,
    });

    // Parse the response as JSON
    const aiResponse = JSON.parse(completion.choices[0].message.content);

    // Execute the generated SQL
    const queryResult = await pool.query(aiResponse.sql);

    res.json({
      query: query,
      sql: aiResponse.sql,
      explanation: aiResponse.explanation,
      columns: aiResponse.columns,
      results: queryResult.rows
    });

    console.log('[aiQuery] Query processed successfully');

  } catch (error) {
    console.error('[aiQuery] Error:', error);
    
    // Enhanced error response
    res.status(500).json({ 
      error: error.message,
      type: error.type,
      details: error.error || {},
      timestamp: new Date().toISOString()
    });
  }
});

console.log('[aiQuery] Routes initialized');

module.exports = router; 