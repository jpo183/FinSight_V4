import axios from 'axios';

const API_URL = '/api/kpi';

export const goalService = {
  // Get all goals
  getGoals: async (filters = {}) => {
    const response = await axios.get(`${API_URL}/goals`, { params: filters });
    return response.data;
  },
  
  // Get a specific goal
  getGoal: async (goalId) => {
    const response = await axios.get(`${API_URL}/goals/${goalId}`);
    return response.data;
  },
  
  // Create a new goal
  createGoal: async (goalData) => {
    const response = await axios.post(`${API_URL}/goals`, goalData);
    return response.data;
  },
  
  // Update an existing goal
  updateGoal: async (goalId, goalData) => {
    const response = await axios.put(`${API_URL}/goals/${goalId}`, goalData);
    return response.data;
  },
  
  // Delete a goal
  deleteGoal: async (goalId) => {
    const response = await axios.delete(`${API_URL}/goals/${goalId}`);
    return response.data;
  }
};

export default goalService;
