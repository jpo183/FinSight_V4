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
    const patterns = this.detectDataPatterns(data);
    
    console.log('[AIInteractionCore] Detected patterns:', patterns);

    // Add time-based suggestions if applicable
    if (patterns.includes('temporal')) {
      suggestions.push({
        type: 'time_comparison',
        text: 'Would you like to see how this compares to previous periods?',
        action: 'compare_time_periods'
      });
    }

    // Add drill-down suggestions if data has hierarchy
    if (patterns.includes('hierarchical')) {
      suggestions.push({
        type: 'drill_down',
        text: 'Would you like to see more detailed breakdown?',
        action: 'drill_down'
      });
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
}

export default AIInteractionCore; 