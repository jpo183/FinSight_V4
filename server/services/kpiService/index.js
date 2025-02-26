const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Import routes
const kpiRoutes = require('./routes/kpiRoutes');
const goalRoutes = require('./routes/goalRoutes');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/kpi-definitions', kpiRoutes);
app.use('/api/goals', goalRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.KPI_SERVICE_PORT || 3002;
app.listen(PORT, () => {
  console.log(`KPI Service running on port ${PORT}`);
});

module.exports = app; 