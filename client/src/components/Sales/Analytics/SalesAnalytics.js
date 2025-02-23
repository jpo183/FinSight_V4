import React, { useState } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [aiCore] = useState(() => new AIInteractionCore());

  // Log component mount
  React.useEffect(() => {
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
  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    console.log('[SalesAnalytics] Submitting query:', query);
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('[SalesAnalytics] Calling AI Query Service...');
      const response = await SalesAiQueryService.analyzeQuery(query);
      console.log('[SalesAnalytics] Query response received:', response);
      
      setResult(response);
    } catch (err) {
      console.error('[SalesAnalytics] Query error:', err);
      setError(err.message);
    } finally {
      console.log('[SalesAnalytics] Query processing completed');
      setLoading(false);
    }
  };

  // Handle AI suggestion clicks
  const handleSuggestionClick = async (suggestion) => {
    console.log('[SalesAnalytics] AI suggestion clicked:', suggestion);
    // Handle the suggestion action
  };

  // Log state changes
  React.useEffect(() => {
    if (loading) {
      console.log('[SalesAnalytics] Loading state:', loading);
    }
  }, [loading]);

  React.useEffect(() => {
    if (error) {
      console.log('[SalesAnalytics] Error state:', error);
    }
  }, [error]);

  React.useEffect(() => {
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
        onSubmit={handleQuerySubmit}
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
            metadata={result.metadata}
            sql={result.sql}
          />
          <AIInteractionPanel
            suggestions={result.suggestions}
            onSuggestionClick={handleSuggestionClick}
            metadata={result.metadata}
            history={aiCore.getHistory()}
            domain="sales"
          />
        </>
      )}
    </Box>
  );
};

export default SalesAnalytics; 