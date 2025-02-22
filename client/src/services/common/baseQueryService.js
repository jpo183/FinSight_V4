import axios from 'axios';

class BaseQueryService {
  /**
   * Send a base query to the AI service
   * @param {string} query - The natural language query
   * @param {string} domain - Domain specific identifier (sales, support, etc.)
   * @returns {Promise<{query: string, sql: string, explanation: string, results: any[]}>}
   */
  static async analyzeQuery(query, domain) {
    try {
      const validation = this.validateBaseQuery(query);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const response = await axios.post(`/api/ai-query/${domain}/analyze`, {
        query,
        domain,
        queryType: this.detectQueryType(query)
      });

      return this.formatResponse(response.data);
    } catch (error) {
      throw new Error(this.handleQueryError(error));
    }
  }

  /**
   * Detect the type of query being asked
   * @param {string} query 
   * @returns {string} queryType
   */
  static detectQueryType(query) {
    const patterns = {
      timeBased: /(last|this|previous|next)\s+(month|quarter|year|week)|Q[1-4]|YTD|MTD/i,
      userBased: /(assigned to|owned by|owner|team)/i,
      statusBased: /(open|closed|active|inactive|pending|current)/i,
      metrics: /(count|total|average|sum|mean|median)/i,
      comparison: /(compare|versus|vs|difference between)/i,
      trend: /(trend|over time|timeline|progression)/i
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(query)) {
        return type;
      }
    }
    
    return 'general';
  }

  /**
   * Get example queries that work across all domains
   * @returns {Array<{text: string, description: string, type: string}>}
   */
  static getBaseExampleQueries() {
    return [
      {
        text: "Show me data from last month",
        description: "Time-based analysis for the previous month",
        type: "timeBased"
      },
      {
        text: "Compare this year vs last year",
        description: "Year-over-year comparison",
        type: "comparison"
      },
      {
        text: "Show everything assigned to John Smith",
        description: "Items owned by specific user",
        type: "userBased"
      },
      {
        text: "What's currently active?",
        description: "Active items across the system",
        type: "statusBased"
      },
      {
        text: "Show me trends over the last 6 months",
        description: "Time-based trend analysis",
        type: "trend"
      }
    ];
  }

  /**
   * Validate base query parameters
   * @param {string} query 
   * @returns {{isValid: boolean, error?: string}}
   */
  static validateBaseQuery(query) {
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

  /**
   * Format dates consistently across all queries
   * @param {string} dateStr 
   * @returns {string}
   */
  static formatDate(dateStr) {
    return new Date(dateStr).toISOString();
  }

  /**
   * Handle common time period calculations
   * @param {string} period - e.g., 'last_month', 'this_quarter', 'ytd'
   * @returns {{start: string, end: string}}
   */
  static calculateTimePeriod(period) {
    const now = new Date();
    switch (period) {
      case 'last_month':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return {
          start: this.formatDate(lastMonth),
          end: this.formatDate(new Date(now.getFullYear(), now.getMonth(), 0))
        };
      // Add more period calculations as needed
      default:
        return {
          start: this.formatDate(now),
          end: this.formatDate(now)
        };
    }
  }

  /**
   * Format response consistently across all queries
   * @param {Object} data 
   * @returns {Object}
   */
  static formatResponse(data) {
    return {
      query: data.query,
      sql: data.sql,
      explanation: data.explanation,
      results: data.results || [],
      metadata: {
        queryType: data.queryType,
        timePeriod: data.timePeriod,
        filters: data.filters,
        aggregations: data.aggregations
      }
    };
  }

  /**
   * Handle errors consistently
   * @param {Error} error 
   * @returns {string}
   */
  static handleQueryError(error) {
    if (error.response) {
      return error.response.data.error || 'Error analyzing query';
    } else if (error.request) {
      return 'No response from server';
    }
    return 'Error setting up request';
  }
}

export default BaseQueryService; 