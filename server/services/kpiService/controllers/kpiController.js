const db = require('../../../db'); // Adjust this path to your database connection

const kpiController = {
  // Get all KPI definitions
  getKpiDefinitions: async (req, res) => {
    try {
      const { domain, is_active } = req.query;
      
      let query = 'SELECT * FROM kpi_definitions WHERE 1=1';
      const params = [];
      
      // Add filters if provided
      if (domain) {
        query += ' AND domain = $' + (params.length + 1);
        params.push(domain);
      }
      
      if (is_active !== undefined) {
        query += ' AND is_active = $' + (params.length + 1);
        params.push(is_active === 'true');
      }
      
      query += ' ORDER BY name ASC';
      
      const result = await db.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching KPI definitions:', error);
      res.status(500).json({ error: 'Failed to fetch KPI definitions' });
    }
  },
  
  // Get a specific KPI definition
  getKpiDefinition: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query('SELECT * FROM kpi_definitions WHERE kpi_id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'KPI definition not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching KPI definition:', error);
      res.status(500).json({ error: 'Failed to fetch KPI definition' });
    }
  },
  
  // Create a new KPI definition
  createKpiDefinition: async (req, res) => {
    try {
      const {
        name,
        description,
        domain,
        unit,
        data_type,
        source_type,
        calculation_method,
        is_active
      } = req.body;
      
      // Validate required fields
      if (!name || !domain || !data_type || !source_type) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Get the current user ID from the authenticated request
      const created_by = req.user.id;
      
      const query = `
        INSERT INTO kpi_definitions (
          name, description, domain, unit, data_type, source_type,
          calculation_method, is_active, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      
      const values = [
        name,
        description || null,
        domain,
        unit || null,
        data_type,
        source_type,
        calculation_method || null,
        is_active !== undefined ? is_active : true,
        created_by
      ];
      
      const result = await db.query(query, values);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating KPI definition:', error);
      res.status(500).json({ error: 'Failed to create KPI definition' });
    }
  },
  
  // Update a KPI definition
  updateKpiDefinition: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        domain,
        unit,
        data_type,
        source_type,
        calculation_method,
        is_active
      } = req.body;
      
      // Validate required fields
      if (!name || !domain || !data_type || !source_type) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Check if KPI definition exists
      const checkResult = await db.query('SELECT * FROM kpi_definitions WHERE kpi_id = $1', [id]);
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'KPI definition not found' });
      }
      
      const query = `
        UPDATE kpi_definitions
        SET name = $1,
            description = $2,
            domain = $3,
            unit = $4,
            data_type = $5,
            source_type = $6,
            calculation_method = $7,
            is_active = $8,
            updated_at = CURRENT_TIMESTAMP
        WHERE kpi_id = $9
        RETURNING *
      `;
      
      const values = [
        name,
        description || null,
        domain,
        unit || null,
        data_type,
        source_type,
        calculation_method || null,
        is_active !== undefined ? is_active : true,
        id
      ];
      
      const result = await db.query(query, values);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating KPI definition:', error);
      res.status(500).json({ error: 'Failed to update KPI definition' });
    }
  },
  
  // Delete a KPI definition
  deleteKpiDefinition: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if KPI definition exists
      const checkResult = await db.query('SELECT * FROM kpi_definitions WHERE kpi_id = $1', [id]);
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'KPI definition not found' });
      }
      
      // Check if there are any goals using this KPI
      const goalsResult = await db.query('SELECT COUNT(*) FROM goals WHERE kpi_id = $1', [id]);
      if (parseInt(goalsResult.rows[0].count) > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete KPI definition that is being used by goals' 
        });
      }
      
      await db.query('DELETE FROM kpi_definitions WHERE kpi_id = $1', [id]);
      res.json({ message: 'KPI definition deleted successfully' });
    } catch (error) {
      console.error('Error deleting KPI definition:', error);
      res.status(500).json({ error: 'Failed to delete KPI definition' });
    }
  }
};

module.exports = kpiController; 