const express = require('express');
const aiQueryRouter = require('./routes/aiQuery');

// ... other imports and middleware ...

app.use('/api/ai-query', aiQueryRouter); 