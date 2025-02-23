import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Stack,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

/**
 * A reusable component for AI interactions with query results
 * @param {Object} props
 * @param {Array} props.suggestions - AI generated suggestions
 * @param {Function} props.onSuggestionClick - Handler for suggestion clicks
 * @param {Object} props.metadata - Query context and metadata
 * @param {Array} props.history - Conversation history
 * @param {string} props.domain - Domain identifier (sales, support, etc.)
 */
const AIInteractionPanel = ({
  suggestions = [],
  onSuggestionClick,
  metadata = {},
  history = [],
  domain = 'general'
}) => {
  console.log('[AIInteractionPanel] Rendering with suggestions:', suggestions);

  return (
    <Paper sx={{ mt: 2, p: 2 }}>
      {/* AI Suggestions Section */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <AutoAwesomeIcon sx={{ mr: 1 }} color="primary" />
          AI Suggestions
        </Typography>
        
        {suggestions.length > 0 ? (
          <Stack spacing={2}>
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outlined"
                onClick={() => onSuggestionClick(suggestion)}
                sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
              >
                {suggestion.text}
                <Chip 
                  label={suggestion.type} 
                  size="small" 
                  sx={{ ml: 1 }}
                  color="primary"
                  variant="outlined"
                />
              </Button>
            ))}
          </Stack>
        ) : (
          <Typography color="text.secondary">
            No suggestions available for this query.
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Conversation History */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2" color="text.secondary">
            Conversation History
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1}>
            {history.map((item, index) => (
              <Box key={index} sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </Typography>
                <Typography>
                  {item.type === 'query' ? '🔍 ' : '💡 '}
                  {item.data.text || item.data.query}
                </Typography>
              </Box>
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Context Information */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2" color="text.secondary">
            Analysis Context
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1}>
            <Typography variant="caption">
              Domain: {domain}
            </Typography>
            <Typography variant="caption">
              Query Type: {metadata.queryType}
            </Typography>
            {metadata.timePeriod && (
              <Typography variant="caption">
                Time Period: {metadata.timePeriod}
              </Typography>
            )}
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default AIInteractionPanel; 