// client/src/services/salesDataService.js

// This is a mock service that would be replaced with your actual sales data API
const salesDataService = {
  getCurrentYearSales: async () => {
    // In a real implementation, this would call your existing sales data API
    // For now, we'll return mock data directly without making an API call
    
    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Mock monthly data
    const monthlyData = [
      { month: 'Jan', sales: 120000, target: 100000, cumulativeSales: 120000, cumulativeTarget: 100000 },
      { month: 'Feb', sales: 150000, target: 120000, cumulativeSales: 270000, cumulativeTarget: 220000 },
      { month: 'Mar', sales: 180000, target: 150000, cumulativeSales: 450000, cumulativeTarget: 370000 },
      { month: 'Apr', sales: 160000, target: 170000, cumulativeSales: 610000, cumulativeTarget: 540000 },
      { month: 'May', sales: 210000, target: 180000, cumulativeSales: 820000, cumulativeTarget: 720000 },
      { month: 'Jun', sales: 190000, target: 190000, cumulativeSales: 1010000, cumulativeTarget: 910000 }
      // Add more months as needed
    ];
    
    // Calculate YTD total
    const ytdTotal = monthlyData.reduce((sum, month) => sum + month.sales, 0);
    
    // Return mock data directly
    return {
      year: currentYear,
      ytdTotal,
      monthlyData
    };
  },
  
  // Add more methods as needed for other sales data
  getQuarterlySales: async (year) => {
    // Mock implementation for quarterly sales data
    return {
      year,
      quarters: [
        { quarter: 'Q1', sales: 450000, target: 370000 },
        { quarter: 'Q2', sales: 560000, target: 540000 },
        { quarter: 'Q3', sales: 610000, target: 600000 },
        { quarter: 'Q4', sales: 680000, target: 650000 }
      ]
    };
  },
  
  getSalesByProduct: async (startDate, endDate) => {
    // Mock implementation for sales by product
    return {
      period: { start: startDate, end: endDate },
      products: [
        { name: 'Product A', sales: 320000 },
        { name: 'Product B', sales: 280000 },
        { name: 'Product C', sales: 190000 },
        { name: 'Product D', sales: 150000 }
      ]
    };
  }
};

export default salesDataService;
