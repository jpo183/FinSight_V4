import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Button,
  Menu,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import * as XLSX from 'xlsx';

/**
 * A reusable table component for displaying query results
 * @param {Object} props
 * @param {Array} props.data - Array of objects containing the data
 * @param {Object} props.metadata - Optional metadata about the results
 * @param {string} props.emptyMessage - Message to display when no data
 * @param {string} props.sql - SQL query used to generate the results
 */
const ResultsTable = ({ 
  data = [], 
  metadata = {}, 
  emptyMessage = "No results found",
  sql = null  // Add new prop for SQL
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleExportClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Export to CSV
  const exportToCsv = () => {
    if (!data.length) return;
    
    const columns = Object.keys(data[0]);
    const csvContent = [
      // Header row
      columns.join(','),
      // Data rows
      ...data.map(row => 
        columns.map(col => {
          const value = row[col];
          // Handle special characters and commas in the data
          return typeof value === 'string' ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${metadata.title || 'query_results'}.csv`;
    link.click();
    handleClose();
  };

  // Export to JSON
  const exportToJson = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${metadata.title || 'query_results'}.json`;
    link.click();
    handleClose();
  };

  // Export to Excel using XLSX
  const exportToExcel = () => {
    if (!data.length) return;
    
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Query Results');
    
    // Generate Excel file and trigger download
    XLSX.writeFile(wb, `${metadata.title || 'query_results'}.xlsx`);
    
    handleClose();
  };

  // Update the validation function to handle both metric and deal data
  const validateData = (data) => {
    console.log('[ResultsTable] Validating data structure:', data);
    
    if (!Array.isArray(data)) {
      console.error('[ResultsTable] Invalid data: not an array');
      return false;
    }
    
    if (data.length === 0) {
      console.log('[ResultsTable] Empty data array');
      return true;
    }
    
    // Check if this is metric-based data
    const isMetricData = data.every(row => 
      'Metric' in row && 'Value' in row
    );
    
    // Check if this is deal data
    const isDealData = data.every(row => 
      'deal_name' in row || 'Deal Name' in row || 
      'amount' in row || 'Amount' in row
    );
    
    if (!isMetricData && !isDealData) {
      console.error('[ResultsTable] Invalid data structure: neither metric nor deal format');
      return false;
    }
    
    return true;
  };

  // Update the main render logic
  if (!validateData(data)) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography color="error">
          Invalid data structure provided
        </Typography>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  // Extract columns from the first data item
  const columns = Object.keys(data[0]);

  // Add these helper functions at the top of the component
  const isNumeric = (value) => !isNaN(value) && value !== '';

  const isCurrencyMetric = (metric) => {
    const currencyIndicators = ['value', 'amount', 'revenue', 'price', 'cost'];
    return currencyIndicators.some(indicator => 
      metric.toLowerCase().includes(indicator)
    );
  };

  const isPercentageMetric = (metric) => {
    const percentageIndicators = ['rate', 'percentage', 'ratio', 'probability'];
    return percentageIndicators.some(indicator => 
      metric.toLowerCase().includes(indicator)
    );
  };

  // Update formatCellValue to handle both data types
  const formatCellValue = (value, column, rowData) => {
    console.log('[ResultsTable] Formatting cell value:', {
      value,
      column,
      rowData
    });

    if (value === null || value === undefined) return '-';

    // Handle Value column for metric-based results
    if (column === 'Value' && 'Metric' in rowData) {
      if (isNumeric(value)) {
        const numValue = Number(value);
        
        // Handle currency values
        if (isCurrencyMetric(rowData.Metric)) {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(numValue);
        }
        
        // Handle percentage values
        if (isPercentageMetric(rowData.Metric)) {
          return new Intl.NumberFormat('en-US', {
            style: 'percent',
            minimumFractionDigits: 1
          }).format(numValue / 100);
        }
        
        // Regular number formatting
        return new Intl.NumberFormat('en-US').format(numValue);
      }
    }

    // Handle Amount/amount columns for deal data
    if (column.toLowerCase() === 'amount' && isNumeric(value)) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(Number(value));
    }

    // Handle date fields
    if (column.toLowerCase().includes('date') && value) {
      try {
        return new Date(value).toLocaleDateString();
      } catch (e) {
        return value;
      }
    }

    // Handle structured data objects
    if (typeof value === 'object' && value !== null) {
      return Object.entries(value)
        .filter(([key]) => key !== 'deal_id' && key !== 'id')
        .map(([key, val]) => {
          if (typeof val === 'number' || !isNaN(val)) {
            if (key.includes('amount') || key.includes('revenue') || key.includes('price')) {
              return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(Number(val));
            }
          }
          return val;
        })
        .filter(Boolean)
        .join(' - ');
    }

    return value.toString();
  };

  // Format column header
  const formatColumnHeader = (column) => {
    return column
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Add this helper at the top of the component
  const formatSql = (sql) => {
    if (!sql) return null;
    
    console.log('[ResultsTable] Formatting SQL:', sql);
    
    if (Array.isArray(sql)) {
      return sql.map((query, index) => ({
        index,
        query: query.trim()
      }));
    }
    
    return [{ index: 0, query: sql.trim() }];
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      {metadata.title && (
        <Box sx={{ 
          p: 2, 
          borderBottom: 1, 
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box>
            <Typography variant="h6">{metadata.title}</Typography>
            {metadata.description && (
              <Typography variant="body2" color="text.secondary">
                {metadata.description}
              </Typography>
            )}
          </Box>
          {data.length > 0 && (
            <Box>
              <Button
                startIcon={<FileDownloadIcon />}
                onClick={handleExportClick}
                variant="outlined"
                size="small"
              >
                Export
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
              >
                <MenuItem onClick={exportToCsv}>
                  <DownloadIcon sx={{ mr: 1 }} fontSize="small" />
                  Export as CSV
                </MenuItem>
                <MenuItem onClick={exportToJson}>
                  <DownloadIcon sx={{ mr: 1 }} fontSize="small" />
                  Export as JSON
                </MenuItem>
                <MenuItem onClick={exportToExcel}>
                  <DownloadIcon sx={{ mr: 1 }} fontSize="small" />
                  Export as Excel
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Box>
      )}
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column}>
                <Typography variant="subtitle2">
                  {formatColumnHeader(column)}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column) => (
                <TableCell key={`${rowIndex}-${column}`}>
                  {formatCellValue(row[column], column, row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Debug SQL Section - Moved from SalesAnalytics */}
      {sql && (
        <Box sx={{ mt: 3 }}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="caption" color="text.secondary">
                Search Construct Information
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="caption" color="text.secondary">
                Generated SQL Queries:
              </Typography>
              {formatSql(sql).map(({ index, query }) => (
                <Paper 
                  key={index}
                  sx={{ 
                    p: 1, 
                    mb: 1,
                    bgcolor: 'grey.100',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem'
                  }}
                >
                  {`/* Query ${index + 1} */`}<br />
                  {query}
                </Paper>
              ))}
            </AccordionDetails>
          </Accordion>
        </Box>
      )}
    </TableContainer>
  );
};

export default ResultsTable; 