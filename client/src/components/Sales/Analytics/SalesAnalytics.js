import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper,
  CircularProgress,
  Alert,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SalesAiQueryService from '../../../services/sales/aiQueryService';
import ResultsTable from '../../Common/DataTable/ResultsTable';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AIInteractionPanel from '../../Common/AI/AIInteractionPanel';
import AIInteractionCore from '../../../services/ai/core/AIInteractionCore';

const SalesAnalytics = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Initialize AICore as a ref so it persists between renders
  const aiCore = useRef(new AIInteractionCore());

  // Log component mount
  useEffect(() => {
    console.log('[SalesAnalytics] Component mounted');
    return () => console.log('[SalesAnalytics] Component unmounted');
  }, []);

  // Handle query input changes
  const handleQueryChange = (e) => {
    const newQuery = e.target.value;
    console.log('[SalesAnalytics] Query input changed:', newQuery);
    setQuery(newQuery);
  };

  // Handle example query selection
  const handleExampleClick = (example) => {
    console.log('[SalesAnalytics] Example query selected:', example);
    setQuery(example);
  };

  // Handle query submission
  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    console.log('[SalesAnalytics] Submitting query:', query);
    
    try {
      console.log('[SalesAnalytics] Calling AI Query Service...');
      const response = await SalesAiQueryService.analyzeQuery(query, 'sales');
      console.log('[SalesAnalytics] Query response received:', response);
      
      // Add query to AI conversation history
      aiCore.current.addToHistory('query', {
        text: query,
        timestamp: new Date(),
        response: response
      });

      // Generate AI suggestions based on the response
      const suggestions = await aiCore.current.analyzeResults(response);
      
      setResult({
        ...response,
        suggestions // Add suggestions to result
      });
    } catch (err) {
      console.log('[SalesAnalytics] Query error:', err);
      setError(err.message);
    } finally {
      console.log('[SalesAnalytics] Query processing completed');
      setLoading(false);
    }
  };

  // Handle AI suggestion clicks
  const handleSuggestionClick = async (suggestion) => {
    console.log('[SalesAnalytics] AI suggestion clicked:', suggestion);
    
    // Get the last query and extract context
    const lastQuery = aiCore.current.getLastQuery();
    console.log('[SalesAnalytics] Last query:', lastQuery);
    
    // Extract name from last query using similar pattern to backend
    const nameMatch = lastQuery.match(/(?:about |for |did |by )(\w+)(?:'s|\s|$)/i);
    const context = nameMatch ? nameMatch[1].toLowerCase() : '';
    console.log('[SalesAnalytics] Extracted context:', context);
    
    // Generate appropriate follow-up query based on action type
    let followUpQuery = '';
    switch (suggestion.action) {
      case 'compare_reps':
        followUpQuery = `Compare sales performance between ${context} and other reps`;
        break;
      case 'trend_analysis':
        followUpQuery = `Show monthly trend of deals won by ${context}`;
        break;
      case 'value_analysis':
        followUpQuery = `Calculate total value of deals won by ${context}`;
        break;
      default:
        followUpQuery = lastQuery;
    }

    console.log('[SalesAnalytics] Generated follow-up query:', followUpQuery);
    
    // Submit the follow-up query
    await submitQuery(followUpQuery);
  };

  const submitQuery = async (queryText) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('[SalesAnalytics] Submitting query:', queryText);
      const response = await SalesAiQueryService.analyzeQuery(queryText, 'sales');
      console.log('[SalesAnalytics] Query response received:', response);
      
      // Add to conversation history
      aiCore.current.addToHistory('query', {
        text: queryText,
        timestamp: new Date(),
        response: response
      });

      // Generate AI suggestions based on the response
      const suggestions = await aiCore.current.analyzeResults(response);
      
      // Update UI with results
      setResult({
        sql: response.sql,
        explanation: response.explanation,
        results: response.results,
        suggestions: suggestions
      });
    } catch (error) {
      console.log('[SalesAnalytics] Query error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      console.log('[SalesAnalytics] Query processing completed');
    }
  };

  // Log state changes
  useEffect(() => {
    if (loading) {
      console.log('[SalesAnalytics] Loading state:', loading);
    }
  }, [loading]);

  useEffect(() => {
    if (error) {
      console.log('[SalesAnalytics] Error state:', error);
    }
  }, [error]);

  useEffect(() => {
    if (result) {
      console.log('[SalesAnalytics] Result state updated:', {
        sql: result.sql,
        explanation: result.explanation,
        resultCount: result.results?.length
      });
    }
  }, [result]);

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Sales Analytics
      </Typography>
      
      {/* Query Input */}
      <Paper 
        component="form" 
        onSubmit={onSubmit}
        sx={{ p: 3, mb: 3 }}
      >
        <Typography variant="h6" gutterBottom>
          Ask a question about your sales data
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            value={query}
            onChange={handleQueryChange}
            placeholder="Example: Show me total pipeline value for Q1"
            variant="outlined"
            disabled={loading}
          />
          <Button 
            type="submit"
            variant="contained" 
            disabled={!query.trim() || loading}
            endIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          >
            Ask
          </Button>
        </Box>

        {/* Example Queries */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Example questions:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
            {[
              "Show deals closing this month",
              "What's our average deal size?",
              "Show pipeline by owner"
            ].map((example, index) => (
              <Button 
                key={index}
                size="small"
                variant="outlined"
                onClick={() => handleExampleClick(example)}
                sx={{ textTransform: 'none' }}
              >
                {example}
              </Button>
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Results Display */}
      {result && (
        <>
          <ResultsTable 
            data={result.results}
            metadata={{
              title: 'Query Results',
              description: result.explanation
            }}
            sql={result.sql}
          />
          <AIInteractionPanel
            suggestions={result.suggestions || []}
            onSuggestionClick={handleSuggestionClick}
            metadata={result.metadata}
            history={aiCore.current.getHistory()}
            domain="sales"
          />
        </>
      )}
    </Box>
  );
};

export default SalesAnalytics; 