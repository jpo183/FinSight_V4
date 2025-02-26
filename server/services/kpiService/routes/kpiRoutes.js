const express = require('express');
const router = express.Router();
const kpiController = require('../controllers/kpiController');
const { authenticate } = require('../../../middleware/auth'); // Adjust path as needed

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all KPI definitions
router.get('/', kpiController.getKpiDefinitions);

// Get a specific KPI definition
router.get('/:id', kpiController.getKpiDefinition);

// Create a new KPI definition
router.post('/', kpiController.createKpiDefinition);

// Update a KPI definition
router.put('/:id', kpiController.updateKpiDefinition);

// Delete a KPI definition
router.delete('/:id', kpiController.deleteKpiDefinition);

module.exports = router; 