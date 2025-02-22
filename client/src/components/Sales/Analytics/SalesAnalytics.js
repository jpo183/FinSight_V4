import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SalesAiQueryService from '../../../services/sales/aiQueryService';
import ResultsTable from '../../Common/DataTable/ResultsTable';

const SalesAnalytics = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await SalesAiQueryService.analyzeQuery(query);
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
            onChange={(e) => setQuery(e.target.value)}
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
                onClick={() => setQuery(example)}
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
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Results
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {/* SQL Query */}
          <Typography variant="subtitle2" color="text.secondary">
            Generated SQL:
          </Typography>
          <Paper 
            sx={{ 
              p: 2, 
              mb: 2, 
              bgcolor: 'grey.100',
              fontFamily: 'monospace'
            }}
          >
            {result.sql}
          </Paper>

          {/* Explanation */}
          <Typography variant="subtitle2" color="text.secondary">
            Explanation:
          </Typography>
          <Typography paragraph>
            {result.explanation}
          </Typography>

          {/* Results Table */}
          <Typography variant="subtitle2" color="text.secondary">
            Data:
          </Typography>
          <ResultsTable 
            data={result.results}
            metadata={{
              title: 'Query Results',
              description: result.explanation
            }}
          />
        </Paper>
      )}
    </Box>
  );
};

export default SalesAnalytics; 