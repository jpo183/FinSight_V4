const express = require('express');
const router = express.Router();
const { 
  BaseQueryService, 
  SalesSchema, 
  SalesPrompts 
} = require('../services/aiQueryService');
const { openai } = require('../config/openai');
const { pool } = require('../config/database');

// POST endpoint for AI queries
router.post('/analyze', async (req, res) => {
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

  } catch (error) {
    console.error('Error processing AI query:', error);
    res.status(500).json({ 
      error: 'Error processing query',
      details: error.message 
    });
  }
});

// Update route handler to use both schema and prompts
router.post('/sales/analyze', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        error: 'Query is required' 
      });
    }

    const result = await BaseQueryService.processQuery(query, {
      domain: 'sales',
      schema: SalesSchema,
      prompts: SalesPrompts
    });

    res.json(result);

  } catch (error) {
    console.error('Error processing AI query:', error);
    res.status(500).json({ 
      error: 'Error processing query',
      details: error.message 
    });
  }
});

module.exports = router; 