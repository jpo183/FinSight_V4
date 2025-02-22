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

// Move CORS before body parsing
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add raw body logging
app.use((req, res, next) => {
  let data = '';
  req.on('data', chunk => {
    data += chunk;
  });
  req.on('end', () => {
    console.log('[Raw Body]:', data);
  });
  next();
});

// Add detailed request logging middleware
app.use((req, res, next) => {
  console.log('\n[Request Start] ================');
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('[Request] Headers:', JSON.stringify(req.headers, null, 2));
  console.log('[Request] Raw Body:', req.rawBody);
  console.log('[Request] Parsed Body:', req.body);
  console.log('[Request] Query:', req.query);
  console.log('[Request] Params:', req.params);
  console.log('[Request End] ==================\n');
  next();
});

// Add response logging
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function(data) {
    console.log('\n[Response Start] ================');
    console.log(`[${new Date().toISOString()}] Response for ${req.method} ${req.path}`);
    console.log('[Response] Data:', data);
    console.log('[Response End] ==================\n');
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

// Mount routes
console.log('\n[Server] Starting route registration...');
app.use('/api', aiQueryRouter);
console.log('[Server] Routes registered successfully');

// Add route debugging
app.get('/debug/routes', (req, res) => {
  const routes = app._router.stack
    .filter(r => r.route)
    .map(r => ({
      path: r.route.path,
      methods: Object.keys(r.route.methods),
      stack: r.route.stack.length
    }));
  res.json({ routes });
});

// Add a test endpoint
app.get('/api/test', (req, res) => {
  console.log('[API] Test endpoint hit');
  res.json({ message: 'API is working' });
});

module.exports = { app, corsOptions }; 