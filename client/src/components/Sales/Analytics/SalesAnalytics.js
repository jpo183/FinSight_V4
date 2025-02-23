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
  const [conversationContext, setConversationContext] = useState(null);
  
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

  // Handle query submission with context
  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    console.log('[SalesAnalytics] Submitting query with context:', {
      query,
      context: conversationContext
    });
    
    try {
      // Pass conversation history to the AI service
      const history = aiCore.current.getHistory();
      const response = await SalesAiQueryService.analyzeQuery(query, 'sales', {
        conversationHistory: history,
        currentContext: conversationContext
      });
      
      console.log('[SalesAnalytics] Query response received:', response);
      
      // Update conversation context from response
      setConversationContext(response.metadata?.conversationContext || null);
      
      // Add to AI conversation history
      aiCore.current.addToHistory('query', {
        text: query,
        timestamp: new Date(),
        response: response,
        context: response.metadata?.conversationContext
      });

      const suggestions = await aiCore.current.analyzeResults(response);
      
      setResult({
        ...response,
        suggestions
      });
    } catch (err) {
      console.error('[SalesAnalytics] Query error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced suggestion handling with context
  const onSuggestionClick = async (suggestion) => {
    const history = aiCore.current.getHistory();
    const currentContext = history[history.length - 1]?.data?.context;
    
    console.log('[SalesAnalytics] Processing suggestion with context:', {
      suggestion,
      context: currentContext
    });

    let followUpQuery = generateFollowUpQuery(suggestion, currentContext);
    await submitQuery(followUpQuery, currentContext);
  };

  // Helper to generate context-aware follow-up queries
  const generateFollowUpQuery = (suggestion, context) => {
    const { dealStatus, owner } = context || {};
    
    console.log('[SalesAnalytics] Generating follow-up with context:', {
      dealStatus,
      owner
    });

    switch (suggestion.type) {
      case 'value_analysis':
        return `Calculate total value of deals ${dealStatus || 'won'} by ${owner || ''}`.trim();
      case 'time_analysis':
        return `Show trend of ${dealStatus || ''} deals ${owner ? `by ${owner}` : ''} over time`.trim();
      case 'comparison':
        return `Compare ${dealStatus || ''} deals ${owner ? `by ${owner}` : ''} with other reps`.trim();
      default:
        return suggestion.text;
    }
  };

  // Enhanced query submission with context
  const submitQuery = async (queryText, context) => {
    setLoading(true);
    setError(null);
    
    try {
      const history = aiCore.current.getHistory();
      const response = await SalesAiQueryService.analyzeQuery(queryText, 'sales', {
        conversationHistory: history,
        currentContext: context
      });
      
      setConversationContext(response.metadata?.conversationContext || null);
      
      aiCore.current.addToHistory('query', {
        text: queryText,
        timestamp: new Date(),
        response: response,
        context: response.metadata?.conversationContext
      });

      const suggestions = await aiCore.current.analyzeResults(response);
      
      setResult({
        ...response,
        suggestions
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
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

  // Add this helper function at the top of the component
  const transformResultsData = (results) => {
    console.log('[SalesAnalytics] Transforming raw results:', results);
    
    return results.map(item => {
      // Extract the first value from data object
      const rawValue = Object.values(item.data)[0];
      
      // Format based on metric type
      let formattedValue = rawValue;
      
      if (item.metric.includes('duration')) {
        formattedValue = `${Math.round(rawValue)} days`;
      } else if (item.metric.includes('deals')) {
        const count = item.data.count || rawValue;
        const avg = item.data.average;
        formattedValue = avg ? 
          `${count} deals, avg ${new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(avg)}` :
          `${count} deals`;
      }
      
      return {
        Metric: item.metric,
        Value: formattedValue
      };
    });
  };

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

      {/* Add Context Display */}
      {conversationContext && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" color="text.secondary">
            Current Context:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            {conversationContext.dealStatus && (
              <Typography variant="body2">
                Deal Status: <strong>{conversationContext.dealStatus}</strong>
              </Typography>
            )}
            {conversationContext.owner && (
              <Typography variant="body2">
                Owner: <strong>{conversationContext.owner}</strong>
              </Typography>
            )}
          </Box>
        </Paper>
      )}

      {/* Results Display */}
      {result && (
        <>
          <ResultsTable 
            data={transformResultsData(result.results)}
            metadata={{
              title: 'Analysis Results',
              description: result.explanation,
              context: conversationContext
            }}
            sql={Array.isArray(result.sql) ? result.sql : [result.sql]}
          />
          <AIInteractionPanel
            suggestions={result.suggestions || []}
            onSuggestionClick={onSuggestionClick}
            metadata={result.metadata}
            history={aiCore.current.getHistory()}
            context={conversationContext} // Pass context to AI panel
            domain="sales"
          />
        </>
      )}
    </Box>
  );
};

export default SalesAnalytics; 