require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createTables } = require('./db/schema');
const { errorHandler, APIError } = require('./middleware/errorHandler');
const { pool } = require('./config/database');
const { app, corsOptions } = require('./app');  // Import app instead of creating new one

const PORT = process.env.PORT || 3001;

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

// Test tables existence and structure
app.get('/api/test-tables', async (req, res, next) => {
  try {
    // Check both tables
    const tableCheck = await pool.query(`
      SELECT 
        table_name, 
        column_name, 
        data_type
      FROM information_schema.columns
      WHERE table_name IN ('deals', 'companies')
      ORDER BY table_name, ordinal_position;
    `);

    // Check if we got any results
    if (tableCheck.rows.length === 0) {
      throw new APIError('Tables not found', 404);
    }

    // Organize results by table
    const tables = tableCheck.rows.reduce((acc, row) => {
      if (!acc[row.table_name]) {
        acc[row.table_name] = [];
      }
      acc[row.table_name].push({
        column: row.column_name,
        type: row.data_type
      });
      return acc;
    }, {});

    res.json({
      message: 'Tables exist',
      tables: tables,
      status: 'success'
    });
  } catch (error) {
    next(new APIError('Error checking tables: ' + error.message, 500));
  }
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Test database connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Database connected:', res.rows[0]);
  }
});

app.listen(PORT, () => {
  console.log(`[Server] Environment: ${process.env.NODE_ENV}`);
  console.log(`[Server] Running on port ${PORT}`);
  console.log(`[Server] CORS enabled for: ${corsOptions.origin}`);
  console.log(`[Server] Database URL: ${process.env.DB_CONNECTION_STRING?.replace(/:[^:@]*@/, ':****@')}`);
});