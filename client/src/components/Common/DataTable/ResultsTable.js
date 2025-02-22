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
  MenuItem
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as XLSX from 'xlsx';

/**
 * A reusable table component for displaying query results
 * @param {Object} props
 * @param {Array} props.data - Array of objects containing the data
 * @param {Object} props.metadata - Optional metadata about the results
 * @param {string} props.emptyMessage - Message to display when no data
 */
const ResultsTable = ({ 
  data = [], 
  metadata = {}, 
  emptyMessage = "No results found" 
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

  // Format cell value based on type
  const formatCellValue = (value) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') {
      // Check if it's a currency value based on column name
      if (columns.some(col => 
        col.toLowerCase().includes('amount') || 
        col.toLowerCase().includes('revenue') ||
        col.toLowerCase().includes('value')
      )) {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      }
      return new Intl.NumberFormat('en-US').format(value);
    }
    if (value instanceof Date) {
      return value.toLocaleDateString();
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
                  {formatCellValue(row[column])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ResultsTable; 