import axios from 'axios';

const API_URL = '/api/kpi';

export const kpiService = {
  // Get all KPI definitions
  getKpiDefinitions: async (filters = {}) => {
    const response = await axios.get(`${API_URL}/kpi-definitions`, { params: filters });
    return response.data;
  },
  
  // Get a specific KPI definition
  getKpiDefinition: async (kpiId) => {
    const response = await axios.get(`${API_URL}/kpi-definitions/${kpiId}`);
    return response.data;
  },
  
  // Create a new KPI definition
  createKpiDefinition: async (kpiData) => {
    const response = await axios.post(`${API_URL}/kpi-definitions`, kpiData);
    return response.data;
  },
  
  // Update an existing KPI definition
  updateKpiDefinition: async (kpiId, kpiData) => {
    const response = await axios.put(`${API_URL}/kpi-definitions/${kpiId}`, kpiData);
    return response.data;
  },
  
  // Delete a KPI definition
  deleteKpiDefinition: async (kpiId) => {
    const response = await axios.delete(`${API_URL}/kpi-definitions/${kpiId}`);
    return response.data;
  }
};

export default kpiService; 