import axios from 'axios';

const salesDataService = {
  getCurrentYearSales: async () => {
    // This would make an API call to your existing sales data endpoint
    const response = await axios.get('/api/sales/current-year');
    
    // Transform the data into the format needed by the KPI dashboard
    const monthlyData = response.data.months.map(month => ({
      month: month.name,
      sales: month.total,
      target: month.target,
      cumulativeSales: month.ytd_total,
      cumulativeTarget: month.ytd_target
    }));
    
    return {
      year: response.data.year,
      ytdTotal: response.data.ytd_total,
      monthlyData
    };
  },
  
  // Other methods to get different views of sales data
  getQuarterlySales: async (year) => {
    const response = await axios.get(`/api/sales/quarterly/${year}`);
    // Transform and return data
  },
  
  getSalesByProduct: async (startDate, endDate) => {
    const response = await axios.get('/api/sales/by-product', {
      params: { startDate, endDate }
    });
    // Transform and return data
  }
};

export default salesDataService;
