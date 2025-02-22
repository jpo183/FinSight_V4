import BaseQueryService from '../common/baseQueryService';

class SalesAiQueryService extends BaseQueryService {
  /**
   * Analyze a sales-specific query
   * @param {string} query 
   * @returns {Promise<Object>}
   */
  static async analyzeQuery(query) {
    // Use base query functionality with sales domain
    console.log('API URL:', process.env.REACT_APP_API_URL);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    return super.analyzeQuery(query, 'sales');
  }

  /**
   * Get sales-specific example queries
   * @returns {Array<Object>}
   */
  static getSalesExampleQueries() {
    // Combine base examples with sales-specific ones
    return [
      ...this.getBaseExampleQueries(),
      {
        text: "Show me total pipeline value",
        description: "Total value of all open deals",
        type: "salesMetric"
      },
      // ... other sales-specific examples
    ];
  }

  /**
   * Validate a sales query before sending to server
   * @param {string} query 
   * @returns {{isValid: boolean, error?: string}}
   */
  static validateSalesQuery(query) {
    if (!query || typeof query !== 'string') {
      return { isValid: false, error: 'Query is required' };
    }
    if (query.length < 3) {
      return { isValid: false, error: 'Query is too short' };
    }
    if (query.length > 500) {
      return { isValid: false, error: 'Query is too long' };
    }
    return { isValid: true };
  }
}

export default SalesAiQueryService; 