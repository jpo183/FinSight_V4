const express = require('express');
const cors = require('cors');
const app = express();
const aiQueryRouter = require('./routes/aiQuery');

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-production-domain.com' 
    : 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Add CORS logging middleware
app.use((req, res, next) => {
  console.log('[CORS] Request Origin:', req.headers.origin);
  console.log('[CORS] Request Method:', req.method);
  console.log('[CORS] Request Headers:', req.headers);
  next();
});

// Enable CORS with options
app.use(cors(corsOptions));

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('[Request] Headers:', req.headers);
  console.log('[Request] Body:', req.body);
  console.log('[Request] Query:', req.query);
  next();
});

// Add response logging
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function(data) {
    console.log('[Response] Data:', data);
    return originalJson.call(this, data);
  };
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Error] Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: err.message,
    path: req.path,
    method: req.method
  });
});

app.use('/api/ai-query', aiQueryRouter);

module.exports = { app, corsOptions }; 