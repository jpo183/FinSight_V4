// server/services/kpiService/controllers/goalController.js
const db = require('../../../db'); // Adjust this path to your database connection

const goalController = {
  // Get all goals with optional filtering
  getGoals: async (req, res) => {
    try {
      const { 
        kpi_id, 
        entity_type, 
        entity_id, 
        status, 
        time_period 
      } = req.query;
      
      let query = 'SELECT * FROM goals WHERE 1=1';
      const params = [];
      
      // Add filters if provided
      if (kpi_id) {
        query += ' AND kpi_id = $' + (params.length + 1);
        params.push(kpi_id);
      }
      
      if (entity_type) {
        query += ' AND entity_type = $' + (params.length + 1);
        params.push(entity_type);
      }
      
      if (entity_id) {
        query += ' AND entity_id = $' + (params.length + 1);
        params.push(entity_id);
      }
      
      if (status) {
        query += ' AND status = $' + (params.length + 1);
        params.push(status);
      }
      
      if (time_period) {
        query += ' AND time_period = $' + (params.length + 1);
        params.push(time_period);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const result = await db.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching goals:', error);
      res.status(500).json({ error: 'Failed to fetch goals' });
    }
  },
  
  // Get a specific goal by ID
  getGoal: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query('SELECT * FROM goals WHERE goal_id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Goal not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching goal:', error);
      res.status(500).json({ error: 'Failed to fetch goal' });
    }
  },
  
  // Create a new goal
  createGoal: async (req, res) => {
    try {
      const {
        kpi_id,
        entity_type,
        entity_id,
        time_period,
        start_date,
        end_date,
        target_value,
        stretch_target,
        minimum_target,
        status
      } = req.body;
      
      // Validate required fields
      if (!kpi_id || !entity_type || !entity_id || !time_period || !start_date || !end_date || !target_value) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Get the current user ID from the authenticated request
      const created_by = req.user.id;
      
      const query = `
        INSERT INTO goals (
          kpi_id, entity_type, entity_id, time_period, start_date, end_date,
          target_value, stretch_target, minimum_target, status, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;
      
      const values = [
        kpi_id,
        entity_type,
        entity_id,
        time_period,
        start_date,
        end_date,
        target_value,
        stretch_target || null,
        minimum_target || null,
        status || 'draft',
        created_by
      ];
      
      const result = await db.query(query, values);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating goal:', error);
      res.status(500).json({ error: 'Failed to create goal' });
    }
  },
  
  // Update an existing goal
  updateGoal: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        kpi_id,
        entity_type,
        entity_id,
        time_period,
        start_date,
        end_date,
        target_value,
        stretch_target,
        minimum_target,
        status
      } = req.body;
      
      // Validate required fields
      if (!kpi_id || !entity_type || !entity_id || !time_period || !start_date || !end_date || !target_value) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Check if goal exists
      const checkResult = await db.query('SELECT * FROM goals WHERE goal_id = $1', [id]);
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Goal not found' });
      }
      
      const query = `
        UPDATE goals
        SET kpi_id = $1,
            entity_type = $2,
            entity_id = $3,
            time_period = $4,
            start_date = $5,
            end_date = $6,
            target_value = $7,
            stretch_target = $8,
            minimum_target = $9,
            status = $10,
            updated_at = CURRENT_TIMESTAMP
        WHERE goal_id = $11
        RETURNING *
      `;
      
      const values = [
        kpi_id,
        entity_type,
        entity_id,
        time_period,
        start_date,
        end_date,
        target_value,
        stretch_target || null,
        minimum_target || null,
        status,
        id
      ];
      
      const result = await db.query(query, values);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating goal:', error);
      res.status(500).json({ error: 'Failed to update goal' });
    }
  },
  
  // Delete a goal
  deleteGoal: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if goal exists
      const checkResult = await db.query('SELECT * FROM goals WHERE goal_id = $1', [id]);
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Goal not found' });
      }
      
      await db.query('DELETE FROM goals WHERE goal_id = $1', [id]);
      res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
      console.error('Error deleting goal:', error);
      res.status(500).json({ error: 'Failed to delete goal' });
    }
  }
};

module.exports = goalController;