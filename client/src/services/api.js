import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const configService = {
  getConfig: async () => {
    const response = await axios.get(`${API_BASE_URL}/config`);
    return response.data;
  },

  saveConfig: async (configData) => {
    const response = await axios.post(`${API_BASE_URL}/config`, configData);
    return response.data;
  }
}; 