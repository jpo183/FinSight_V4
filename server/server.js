const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});