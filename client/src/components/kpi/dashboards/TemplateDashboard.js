import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Box, Paper, Grid, TableContainer,
  Table, TableHead, TableBody, TableRow, TableCell, Accordion,
  AccordionSummary, AccordionDetails, Card, CardContent, LinearProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import DateRangeIcon from '@mui/icons-material/DateRange';
import EventIcon from '@mui/icons-material/Event';

const TemplateDashboard = ({ 
  domainAdapter,  // Contains domain-specific logic and data
  data            // The actual data for the dashboard
}) => {
  // State for time range and period selection
  const [timeRangeView, setTimeRangeView] = useState('annual');
  const [selectedPeriod, setSelectedPeriod] = useState({ quarter: 'Q3', month: 'July' });
  const [expanded, setExpanded] = useState({
    revenue: true,
    pipeline: false,
    customers: false,
    activity: false,
    charts: false
  });

  // Handle time range change
  const handleTimeRangeChange = (event, newValue) => {
    if (newValue !== null) {
      setTimeRangeView(newValue);
    }
  };

  // Handle period change
  const handlePeriodChange = (event) => {
    setSelectedPeriod({
      ...selectedPeriod,
      [event.target.name]: event.target.value
    });
  };

  // Handle accordion expansion
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded({
      ...expanded,
      [panel]: isExpanded
    });
  };

  // Get filtered data based on time range
  const filteredData = domainAdapter.filterDataByTimeRange(
    data, 
    timeRangeView, 
    selectedPeriod
  );

  return (
    <>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Time Range Toggle */}
        <Paper sx={{ mb: 3, p: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, gap: 2 }}>
            <Typography variant="subtitle1" sx={{ minWidth: 120 }}>Time Range View:</Typography>
            
            <ToggleButtonGroup
              value={timeRangeView}
              exclusive
              onChange={handleTimeRangeChange}
              aria-label="time range view"
              size="small"
            >
              <ToggleButton value="annual" aria-label="annual view">
                <CalendarViewMonthIcon sx={{ mr: 1 }} />
                Annual
              </ToggleButton>
              <ToggleButton value="quarterly" aria-label="quarterly view">
                <DateRangeIcon sx={{ mr: 1 }} />
                Quarterly
              </ToggleButton>
              <ToggleButton value="monthly" aria-label="monthly view">
                <EventIcon sx={{ mr: 1 }} />
                Monthly
              </ToggleButton>
            </ToggleButtonGroup>
            
            {timeRangeView === 'quarterly' && (
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="quarter-select-label">Quarter</InputLabel>
                <Select
                  labelId="quarter-select-label"
                  id="quarter-select"
                  name="quarter"
                  value={selectedPeriod.quarter}
                  label="Quarter"
                  onChange={handlePeriodChange}
                >
                  <MenuItem value="Q1">Q1</MenuItem>
                  <MenuItem value="Q2">Q2</MenuItem>
                  <MenuItem value="Q3">Q3</MenuItem>
                  <MenuItem value="Q4">Q4</MenuItem>
                </Select>
              </FormControl>
            )}
            
            {timeRangeView === 'monthly' && (
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="month-select-label">Month</InputLabel>
                <Select
                  labelId="month-select-label"
                  id="month-select"
                  name="month"
                  value={selectedPeriod.month}
                  label="Month"
                  onChange={handlePeriodChange}
                >
                  <MenuItem value="January">January</MenuItem>
                  <MenuItem value="February">February</MenuItem>
                  <MenuItem value="March">March</MenuItem>
                  <MenuItem value="April">April</MenuItem>
                  <MenuItem value="May">May</MenuItem>
                  <MenuItem value="June">June</MenuItem>
                  <MenuItem value="July">July</MenuItem>
                  <MenuItem value="August">August</MenuItem>
                  <MenuItem value="September">September</MenuItem>
                  <MenuItem value="October">October</MenuItem>
                  <MenuItem value="November">November</MenuItem>
                  <MenuItem value="December">December</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </Paper>
        
        {/* Primary Metric Section */}
        <Paper 
          elevation={3} 
          sx={{ 
            mb: 4, 
            p: 3, 
            borderTop: '4px solid #1976d2',
            background: 'linear-gradient(to right, rgba(25, 118, 210, 0.05), rgba(25, 118, 210, 0.1))'
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            {domainAdapter.getPrimaryMetricName(timeRangeView, selectedPeriod)}
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="subtitle1" color="textSecondary">Current</Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  {domainAdapter.formatPrimaryMetric(filteredData.primaryMetric.current)}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="subtitle1" color="textSecondary">Target</Typography>
                <Typography variant="h3">
                  {domainAdapter.formatPrimaryMetric(filteredData.primaryMetric.target)}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="subtitle1" color="textSecondary">Progress</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(filteredData.primaryMetric.progress, 100)} 
                      color={filteredData.primaryMetric.relativeProgress >= 1 ? "success" : "primary"}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color="textSecondary">
                      {`${filteredData.primaryMetric.progress.toFixed(1)}%`}
                    </Typography>
                  </Box>
                </Box>
                
                {timeRangeView === 'annual' && (
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Time Elapsed: {filteredData.primaryMetric.yearProgress.toFixed(1)}%
                  </Typography>
                )}
                
                <Typography 
                  variant="body1" 
                  color={filteredData.primaryMetric.relativeProgress >= 1 ? "success.main" : "error.main"}
                  fontWeight="bold"
                >
                  {filteredData.primaryMetric.relativeProgress >= 1 
                    ? `${((filteredData.primaryMetric.relativeProgress - 1) * 100).toFixed(1)}% ahead of target` 
                    : `${((1 - filteredData.primaryMetric.relativeProgress) * 100).toFixed(1)}% behind target`}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        {/* KPI Summary Table */}
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table aria-label="KPI summary table">
            <TableHead>
              <TableRow>
                {domainAdapter.tableHeaders.map(header => (
                  <TableCell key={header.id} align={header.align || 'left'}>
                    {header.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {domainAdapter.getTableRows(filteredData).map((row, index) => (
                <TableRow key={index}>
                  {domainAdapter.tableHeaders.map(header => (
                    <TableCell key={`${index}-${header.id}`} align={header.align || 'left'}>
                      {domainAdapter.formatTableCell(row[header.id], header.format)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Domain-specific sections rendered dynamically */}
        {domainAdapter.sections.map(section => (
          <Accordion 
            key={section.id}
            expanded={expanded[section.id] || false}
            onChange={handleAccordionChange(section.id)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{section.title}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {section.getContent(filteredData, timeRangeView, selectedPeriod)}
            </AccordionDetails>
          </Accordion>
        ))}
        
        {/* Charts Section */}
        <Accordion
          expanded={expanded.charts}
          onChange={handleAccordionChange('charts')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Performance Charts</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {domainAdapter.charts.map(chart => (
                <Grid item xs={12} key={chart.id}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      {chart.getTitle(timeRangeView, selectedPeriod)}
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      {chart.render(filteredData, timeRangeView, selectedPeriod)}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Box>
    </>
  );
};

export default TemplateDashboard;
