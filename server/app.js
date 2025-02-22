const express = require('express');
const cors = require('cors');
const app = express();
const aiQueryRouter = require('./routes/aiQuery');

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://finsight-v4-frontend.onrender.com'  // Production frontend URL
    : 'http://localhost:3000',  // Development frontend URL
  methods: ['GET', 'POST', 'OPTIONS'],
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

// Log route registration
console.log('[Server] Registering routes...');
app.use('/api/sales/analyze', aiQueryRouter);
console.log('[Server] Routes registered');

// Add body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add a test endpoint
app.get('/api/test', (req, res) => {
  console.log('[API] Test endpoint hit');
  res.json({ message: 'API is working' });
});

module.exports = { app, corsOptions }; 