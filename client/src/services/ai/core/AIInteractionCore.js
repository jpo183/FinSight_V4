/**
 * AIInteractionCore.js
 * Core service for handling AI interactions after initial query results
 */

class AIInteractionCore {
  /**
   * Initialize the interaction core with conversation context
   * @param {Object} initialContext - Initial query context and results
   */
  constructor(initialContext = {}) {
    console.log('[AIInteractionCore] Initializing with context:', initialContext);
    this.conversationHistory = [];
    this.currentContext = initialContext;
    this.interactionCount = 0;
    this.history = [];
    this.suggestions = [];
    this.lastQuery = null;
  }

  /**
   * Process results and generate follow-up suggestions
   * @param {Object} queryResults - Results from initial query
   * @returns {Promise<Array>} Array of suggested follow-up actions
   */
  async analyzeResults(queryResults) {
    console.log('[AIInteractionCore] Analyzing results:', queryResults);
    
    try {
      // Store results in conversation history
      this.addToHistory('results', queryResults);

      // Generate suggestions based on result patterns
      const suggestions = await this.generateSuggestions(queryResults);
      console.log('[AIInteractionCore] Generated suggestions:', suggestions);

      return suggestions;
    } catch (error) {
      console.error('[AIInteractionCore] Error analyzing results:', error);
      throw error;
    }
  }

  /**
   * Generate contextual suggestions based on data patterns
   * @param {Object} data - Query results data
   * @returns {Promise<Array>} Suggested follow-up actions
   */
  async generateSuggestions(data) {
    console.log('[AIInteractionCore] Generating suggestions for data:', data);
    
    const suggestions = [];
    
    // Handle analysis queries
    if (data.queryType === 'analysis') {
      // Add analysis-specific suggestions
      suggestions.push({
        type: 'time_analysis',
        text: 'Would you like to see how these metrics trend over time?',
        action: 'trend_analysis'
      });
      
      suggestions.push({
        type: 'comparison',
        text: 'Would you like to compare with team averages?',
        action: 'team_comparison'
      });

      // If we have deal stages, suggest stage-specific analysis
      if (data.results.some(r => r.metric?.toLowerCase().includes('stage'))) {
        suggestions.push({
          type: 'stage_analysis',
          text: 'Would you like to analyze conversion rates between stages?',
          action: 'stage_analysis'
        });
      }
    } else {
      // Handle single queries (existing logic)
      const sqlString = Array.isArray(data.sql) ? data.sql[0] : data.sql;
      
      if (sqlString?.toLowerCase().includes('count') && 
          sqlString?.toLowerCase().includes('owner_name')) {
        suggestions.push({
          type: 'comparison',
          text: 'Would you like to compare with other sales reps?',
          action: 'compare_reps'
        });
        
        suggestions.push({
          type: 'time_analysis',
          text: 'Would you like to see how this changed over time?',
          action: 'trend_analysis'
        });
        
        suggestions.push({
          type: 'value_analysis',
          text: 'Would you like to see the total value of these deals?',
          action: 'value_analysis'
        });
      }
    }

    console.log('[AIInteractionCore] Generated suggestions:', suggestions);
    return suggestions;
  }

  /**
   * Detect patterns in the data that could prompt follow-up questions
   * @param {Object} data - Query results data
   * @returns {Array<string>} Detected patterns
   */
  detectDataPatterns(data) {
    console.log('[AIInteractionCore] Detecting patterns in data');
    const patterns = [];

    try {
      // Ensure we have results to analyze
      if (!data || !data.results || !Array.isArray(data.results)) {
        console.log('[AIInteractionCore] No valid results to analyze');
        return patterns;
      }

      // Check for temporal data
      if (this.hasTemporalData(data.results)) {
        patterns.push('temporal');
      }

      // Check for hierarchical data
      if (this.hasHierarchicalData(data.results)) {
        patterns.push('hierarchical');
      }

      // Check for numerical metrics
      if (this.hasMetrics(data.results)) {
        patterns.push('metrics');
      }

      console.log('[AIInteractionCore] Detected patterns:', patterns);
      return patterns;
    } catch (error) {
      console.error('[AIInteractionCore] Error detecting patterns:', error);
      return patterns;
    }
  }

  /**
   * Add interaction to conversation history
   * @param {string} type - Type of interaction
   * @param {Object} data - Interaction data
   */
  addToHistory(type, data) {
    console.log('[AIInteractionCore] Adding to history:', { type, data });
    
    this.conversationHistory.push({
      id: this.interactionCount++,
      timestamp: new Date().toISOString(),
      type,
      data
    });

    console.log('[AIInteractionCore] Updated history length:', this.conversationHistory.length);
  }

  /**
   * Check if data contains temporal elements
   * @private
   */
  hasTemporalData(results) {
    if (!Array.isArray(results)) return false;
    
    return results.some(item => 
      Object.values(item).some(value => 
        value instanceof Date || 
        (typeof value === 'string' && !isNaN(Date.parse(value)))
      )
    );
  }

  /**
   * Check if data contains hierarchical elements
   * @private
   */
  hasHierarchicalData(results) {
    if (!Array.isArray(results)) return false;

    return results.some(item =>
      Object.keys(item).some(key => 
        key.includes('_id') || 
        key.includes('parent') || 
        key.includes('child')
      )
    );
  }

  /**
   * Check if data contains numerical metrics
   * @private
   */
  hasMetrics(results) {
    if (!Array.isArray(results)) return false;

    return results.some(item =>
      Object.values(item).some(value => 
        typeof value === 'number'
      )
    );
  }

  /**
   * Get current conversation context
   * @returns {Object} Current context
   */
  getContext() {
    console.log('[AIInteractionCore] Getting current context');
    return this.currentContext;
  }

  /**
   * Get conversation history
   * @returns {Array} Conversation history
   */
  getHistory() {
    console.log('[AIInteractionCore] Getting conversation history');
    return this.conversationHistory;
  }

  getLastQuery() {
    // Get the last query from history
    const lastQueryItem = this.history.find(item => item.type === 'query');
    return lastQueryItem?.data?.text || '';
  }

  analyzeResults(data) {
    console.log('[AIInteractionCore] Analyzing results:', data);
    
    // Store the query
    this.lastQuery = data.query;
    
    // Add to history
    this.addToHistory('query', {
      text: data.query,
      timestamp: new Date(),
      response: data
    });

    // Add results to history
    this.addToHistory('results', {
      query: data.query,
      sql: data.sql,
      explanation: data.explanation,
      results: data.results,
      metadata: data.metadata
    });

    // Generate suggestions
    this.suggestions = this.generateSuggestions(data);
    
    return this.suggestions;
  }
}

export default AIInteractionCore; 