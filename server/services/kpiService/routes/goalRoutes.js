// server/services/kpiService/routes/goalRoutes.js
const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const { authenticate } = require('../../../middleware/auth'); // Adjust path as needed

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all goals
router.get('/', goalController.getGoals);

// Get a specific goal
router.get('/:id', goalController.getGoal);

// Create a new goal
router.post('/', goalController.createGoal);

// Update a goal
router.put('/:id', goalController.updateGoal);

// Delete a goal
router.delete('/:id', goalController.deleteGoal);

module.exports = router;