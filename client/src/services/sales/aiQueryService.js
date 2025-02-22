import BaseQueryService from '../common/baseQueryService';

console.log('[AiQueryService] Environment:', process.env.NODE_ENV);
console.log('[AiQueryService] Raw API URL:', process.env.REACT_APP_API_URL);

const API_URL = process.env.REACT_APP_API_URL;
console.log('[AiQueryService] Configured API_URL:', API_URL);

class SalesAiQueryService extends BaseQueryService {
  /**
   * Analyze a sales-specific query
   * @param {string} query 
   * @returns {Promise<Object>}
   */
  static async analyzeQuery(query) {
    console.log('[AiQueryService] Starting query analysis:', query);
    console.log('[AiQueryService] Using API URL:', API_URL);

    try {
      const response = await fetch(`${API_URL}/sales/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });

      console.log('[AiQueryService] Raw response:', response);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[AiQueryService] API error:', errorData);
        throw new Error(errorData.error || 'Failed to analyze query');
      }

      const data = await response.json();
      console.log('[AiQueryService] Processed response:', data);
      return data;

    } catch (error) {
      console.error('[AiQueryService] Service error:', error);
      throw error;
    }
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