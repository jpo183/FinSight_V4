require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createTables } = require('./db/schema');
const { errorHandler } = require('./middleware/errorHandler');
const { pool } = require('./db/index');
const { APIError } = require('./middleware/APIError');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
createTables()
  .then(() => console.log('Database initialized'))
  .catch(err => console.error('Database initialization failed:', err));

// Config routes
app.get('/api/config', (req, res) => {
  // TODO: Retrieve configuration from database
  res.json({
    apiKey: process.env.API_KEY || '',
    hostUrl: process.env.HOST_URL || '',
    databaseUrl: process.env.DATABASE_URL || '',
    hubspotApiKey: process.env.HUBSPOT_API_KEY || '',
    openaiApiKey: process.env.OPENAI_API_KEY || ''
  });
});

app.post('/api/config', (req, res) => {
  const { apiKey, hostUrl, databaseUrl, hubspotApiKey, openaiApiKey } = req.body;
  // TODO: Save configuration to database
  res.json({ 
    message: 'Configuration saved successfully',
    data: { apiKey, hostUrl, databaseUrl, hubspotApiKey, openaiApiKey }
  });
});

// Test database connection
app.get('/api/test-db', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      message: 'Database connected successfully',
      timestamp: result.rows[0].now,
      status: 'success'
    });
  } catch (error) {
    next(new APIError('Database connection failed', 500));
  }
});

const port = process.env.PORT || 3001;

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});