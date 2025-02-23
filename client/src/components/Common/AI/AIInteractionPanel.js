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
  console.log('[AIInteractionPanel] Current history:', history);

  // Safely format timestamp
  const formatTimestamp = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch (error) {
      console.error('[AIInteractionPanel] Error formatting timestamp:', error);
      return 'Invalid time';
    }
  };

  // Safely get message text
  const getMessageText = (item) => {
    if (!item || !item.data) return 'No message';
    return item.data.text || item.data.query || 'Message content unavailable';
  };

  return (
    <Paper sx={{ mt: 2, p: 2 }}>
      {/* AI Suggestions Section */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <AutoAwesomeIcon sx={{ mr: 1 }} color="primary" />
          AI Suggestions
        </Typography>
        
        {Array.isArray(suggestions) && suggestions.length > 0 ? (
          <Stack spacing={2}>
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outlined"
                onClick={() => onSuggestionClick && onSuggestionClick(suggestion)}
                sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
              >
                {suggestion?.text || 'No suggestion text'}
                {suggestion?.type && (
                  <Chip 
                    label={suggestion.type} 
                    size="small" 
                    sx={{ ml: 1 }}
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Button>
            ))}
          </Stack>
        ) : (
          <Typography color="text.secondary">
            Analyzing your query results...
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Conversation History - Only show if there's history */}
      {Array.isArray(history) && history.length > 0 && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2" color="text.secondary">
              Conversation History ({history.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1}>
              {history.map((item, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    p: 1, 
                    bgcolor: item.type === 'query' ? 'grey.50' : 'primary.50',
                    borderRadius: 1 
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {formatTimestamp(item?.timestamp)}
                  </Typography>
                  <Typography>
                    {item?.type === 'query' ? '🔍 ' : '💡 '}
                    {getMessageText(item)}
                  </Typography>
                  {item.type === 'results' && item.data.results && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Result: {JSON.stringify(item.data.results)}
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Context Information - Only show if there's metadata */}
      {metadata && Object.keys(metadata).length > 0 && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2" color="text.secondary">
              Analysis Context
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1}>
              <Typography variant="caption">
                Domain: {domain || 'Not specified'}
              </Typography>
              {metadata.queryType && (
                <Typography variant="caption">
                  Query Type: {metadata.queryType}
                </Typography>
              )}
              {metadata?.timePeriod && (
                <Typography variant="caption">
                  Time Period: {metadata.timePeriod.start || 'All time'}
                </Typography>
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>
      )}
    </Paper>
  );
};

export default AIInteractionPanel; 