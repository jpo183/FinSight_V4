import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Box, Paper, Grid, TableContainer,
  Table, TableHead, TableBody, TableRow, TableCell, Accordion,
  AccordionSummary, AccordionDetails, Card, CardContent, LinearProgress, Divider
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const TemplateDashboard = ({ 
  domainAdapter,  // Contains domain-specific logic and data
  data            // The actual data for the dashboard
}) => {
  console.log('TemplateDashboard rendering with adapter:', domainAdapter);
  console.log('TemplateDashboard data:', data);

  // State for time range and period selection
  const [timeRangeView, setTimeRangeView] = useState('annual');
  const [selectedPeriod, setSelectedPeriod] = useState({ quarter: 'Q3', month: 'July' });
  const [expanded, setExpanded] = useState(domainAdapter.getSections().map(s => s.id));

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
  const handleAccordionChange = (sectionId) => (event, isExpanded) => {
    setExpanded(prev => 
      isExpanded 
        ? [...prev, sectionId] 
        : prev.filter(id => id !== sectionId)
    );
  };

  // Get filtered data based on time range
  const filteredData = domainAdapter.filterDataByTimeRange(
    data, 
    timeRangeView, 
    selectedPeriod
  );

  console.log('Sections to render:', domainAdapter.getSections());

  // Check if any of the data is test data
  const isTestData = Object.values(data).some(item => item.isTestData);

  // Get sections from adapter
  const sections = domainAdapter.getSections();
  console.log('Sections to render:', sections);

  return (
    <>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {isTestData && (
          <Box 
            sx={{ 
              bgcolor: 'warning.light', 
              color: 'warning.contrastText', 
              p: 2, 
              mb: 2,
              borderRadius: 1
            }}
          >
            <Typography variant="body1">
              <strong>Test Mode:</strong> This dashboard is displaying test data. Real data will be shown when connected to your data source.
            </Typography>
          </Box>
        )}
        
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
        
        {/* Render each section as an accordion */}
        {sections.map(section => {
          const sectionCharts = domainAdapter.getChartsForSection(section.id);
          
          // Skip rendering if no charts in this section
          if (!sectionCharts || sectionCharts.length === 0) return null;
          
          const isExpanded = expanded.includes(section.id);
          
          return (
            <Accordion 
              key={section.id} 
              expanded={isExpanded}
              onChange={handleAccordionChange(section.id)}
              sx={{ 
                mb: 2,
                '&:before': { display: 'none' }, // Remove the default divider
                boxShadow: 2
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${section.id}-content`}
                id={`${section.id}-header`}
                sx={{ 
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                  '&.Mui-expanded': {
                    minHeight: 56,
                  }
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {section.name}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {sectionCharts.map(chart => (
                    <Grid item xs={12} md={6} lg={4} key={chart.id}>
                      {renderChart(chart, data[chart.id], domainAdapter)}
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </>
  );
};

// Render the primary metric
const renderPrimaryMetric = (adapter, data) => {
  const primaryMetric = adapter.getPrimaryMetric();
  if (!primaryMetric) return null;
  
  const metricData = data[primaryMetric.id];
  if (!metricData) return null;
  
  return (
    <Box sx={{ mb: 4 }}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {primaryMetric.name}
          </Typography>
          <Typography variant="h3" component="div" sx={{ mb: 1 }}>
            {adapter.formatValue(primaryMetric.id, metricData.current)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Target: {adapter.formatValue(primaryMetric.id, metricData.target)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={metricData.progress} 
                color={metricData.status === 'positive' ? 'success' : metricData.status === 'negative' ? 'error' : 'primary'}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
            <Box sx={{ minWidth: 35 }}>
              <Typography variant="body2" color="text.secondary">{`${Math.round(metricData.progress)}%`}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

// Helper function to render the appropriate chart component
const renderChart = (chart, chartData, adapter) => {
  if (!chartData) {
    console.warn(`No data found for chart: ${chart.id} - ${chart.name}`);
    return (
      <Card elevation={2} sx={{ height: '100%', minHeight: 250 }}>
        <CardContent>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {chart.name}
          </Typography>
          <Typography variant="body2" color="error">
            No data available
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  switch(chart.type.toLowerCase()) {
    case 'card':
      return <MetricCard metric={chart} data={chartData} adapter={adapter} />;
    case 'barchart':
      return <BarChartCard metric={chart} data={chartData} adapter={adapter} />;
    case 'linechart':
      return <LineChartCard metric={chart} data={chartData} adapter={adapter} />;
    case 'piechart':
      return <PieChartCard metric={chart} data={chartData} adapter={adapter} />;
    default:
      console.warn(`Unknown chart type: ${chart.type} for chart: ${chart.name}`);
      return <MetricCard metric={chart} data={chartData} adapter={adapter} />;
  }
};

// Metric Card Component
const MetricCard = ({ metric, data, adapter }) => {
  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {metric.name}
        </Typography>
        <Typography variant="h4" component="div" sx={{ mb: 1 }}>
          {adapter.formatValue(metric.id, data.current)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Target: {adapter.formatValue(metric.id, data.target)}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={data.progress} 
              color={data.status === 'positive' ? 'success' : data.status === 'negative' ? 'error' : 'primary'}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="text.secondary">{`${Math.round(data.progress)}%`}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// Bar Chart Card Component
const BarChartCard = ({ metric, data, adapter }) => {
  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {metric.name}
        </Typography>
        <Typography variant="h4" component="div" sx={{ mb: 1 }}>
          {adapter.formatValue(metric.id, data.current)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Target: {adapter.formatValue(metric.id, data.target)}
        </Typography>
        <Box sx={{ height: 200, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => adapter.formatValue(metric.id, value)} />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Actual" />
              <Bar dataKey="target" fill="#82ca9d" name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

// Line Chart Card Component
const LineChartCard = ({ metric, data, adapter }) => {
  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {metric.name}
        </Typography>
        <Typography variant="h4" component="div" sx={{ mb: 1 }}>
          {adapter.formatValue(metric.id, data.current)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Target: {adapter.formatValue(metric.id, data.target)}
        </Typography>
        <Box sx={{ height: 200, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => adapter.formatValue(metric.id, value)} />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" name="Actual" />
              <Line type="monotone" dataKey="target" stroke="#82ca9d" name="Target" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

// Pie Chart Card Component
const PieChartCard = ({ metric, data, adapter }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  // Create pie data from chart data
  const pieData = data.chartData.map((item, index) => ({
    name: item.name,
    value: item.value,
    color: COLORS[index % COLORS.length]
  }));
  
  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {metric.name}
        </Typography>
        <Typography variant="h4" component="div" sx={{ mb: 1 }}>
          {adapter.formatValue(metric.id, data.current)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Target: {adapter.formatValue(metric.id, data.target)}
        </Typography>
        <Box sx={{ height: 200, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => adapter.formatValue(metric.id, value)} />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TemplateDashboard;
