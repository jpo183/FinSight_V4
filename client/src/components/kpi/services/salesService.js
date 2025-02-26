import axios from 'axios';

// This service handles fetching sales-related data for dashboards
const salesService = {
  // Fetch sales dashboard data
  fetchSalesData: async () => {
    try {
      // In a real implementation, this would call your API
      // For now, we'll return mock data
      return mockSalesData();
    } catch (error) {
      console.error('Error fetching sales data:', error);
      throw error;
    }
  }
};

// Helper function to generate mock data for testing
const mockSalesData = () => {
  // Generate some random sales data
  const data = {
    revenue: {
      current: Math.floor(Math.random() * 1000000),
      target: 1000000,
      progress: Math.floor(Math.random() * 100),
      status: 'neutral'
    },
    pipeline: {
      opportunities: {
        current: Math.floor(Math.random() * 100),
        target: 100,
        progress: Math.floor(Math.random() * 100)
      },
      conversionRate: {
        current: Math.floor(Math.random() * 100),
        target: 30,
        progress: Math.floor(Math.random() * 100)
      },
      stages: [
        { name: 'Prospecting', value: 30 },
        { name: 'Qualification', value: 25 },
        { name: 'Proposal', value: 20 },
        { name: 'Negotiation', value: 15 },
        { name: 'Closed Won', value: 10 }
      ]
    },
    customers: {
      new: {
        current: Math.floor(Math.random() * 100),
        target: 100,
        progress: Math.floor(Math.random() * 100)
      },
      total: Math.floor(Math.random() * 1000),
      active: Math.floor(Math.random() * 800),
      churn: Math.floor(Math.random() * 10)
    },
    activity: {
      meetings: Math.floor(Math.random() * 100),
      meetingsGoal: 100,
      calls: Math.floor(Math.random() * 500),
      callsGoal: 500,
      emails: Math.floor(Math.random() * 1000),
      emailsGoal: 1000
    },
    chartData: Array(12).fill().map((_, i) => ({
      month: `Month ${i+1}`,
      sales: Math.floor(Math.random() * 100000),
      target: 80000,
      cumulativeSales: Math.floor(Math.random() * 1000000),
      cumulativeTarget: 800000
    }))
  };
  
  return data;
};

export default salesService;
