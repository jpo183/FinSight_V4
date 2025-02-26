import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Box, Paper, Grid, TableContainer,
  Table, TableHead, TableBody, TableRow, TableCell, Accordion,
  AccordionSummary, AccordionDetails, Card, CardContent, LinearProgress, Divider,
  ToggleButtonGroup, ToggleButton, FormControl, InputLabel, Select, MenuItem,
  Button, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
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
import GoalSettingForm from '../goals/GoalSettingForm';

const TemplateDashboard = ({ 
  domainAdapter,  // Contains domain-specific logic and data
  data            // The actual data for the dashboard
}) => {
  console.log('TemplateDashboard rendering with adapter:', domainAdapter);
  console.log('TemplateDashboard data:', data);

  // Check if any of the data is test data
  const isTestData = Object.values(data).some(item => item.isTestData);

  // Get sections from adapter
  const sections = domainAdapter.getSections();
  console.log('Sections to render:', sections);

  // State to track expanded sections (default all expanded)
  const [expanded, setExpanded] = useState(sections.map(s => s.id));
  
  // Time period state
  const [timeRange, setTimeRange] = useState('monthly');
  const [timeValue, setTimeValue] = useState(1); // Default to first period
  
  // State for goal setting dialog
  const [openGoalDialog, setOpenGoalDialog] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState(null);
  const [kpiDefinitions, setKpiDefinitions] = useState([]);
  const [entities, setEntities] = useState([]);
  const [currentGoal, setCurrentGoal] = useState(null);
  
  // Load KPI definitions and entities
  useEffect(() => {
    // Load KPI definitions from localStorage
    const storedKpis = localStorage.getItem('salesKpis');
    const kpis = storedKpis ? JSON.parse(storedKpis) : [];
    setKpiDefinitions(kpis);
    
    // Mock entities for now
    setEntities([
      { id: 'sales', name: 'Sales Department', type: 'department' },
      { id: 'marketing', name: 'Marketing Department', type: 'department' },
      { id: 'north', name: 'North Region', type: 'team' },
      { id: 'south', name: 'South Region', type: 'team' },
      { id: 'east', name: 'East Region', type: 'team' },
      { id: 'west', name: 'West Region', type: 'team' },
      { id: 'user1', name: 'John Doe', type: 'individual' },
      { id: 'user2', name: 'Jane Smith', type: 'individual' },
      { id: 'org', name: 'Entire Organization', type: 'organization' }
    ]);
    
    // Load goals to find existing ones
    const storedGoals = localStorage.getItem('salesGoals');
    const goals = storedGoals ? JSON.parse(storedGoals) : [];
    
    // Set current goals for KPIs
    if (goals.length > 0) {
      const goalsByKpi = {};
      goals.forEach(goal => {
        if (goal.status === 'active') {
          goalsByKpi[goal.kpi_id] = goal;
        }
      });
      setCurrentGoals(goalsByKpi);
    }
  }, []);
  
  // Get time period options based on selected range
  const getTimePeriodOptions = () => {
    switch(timeRange) {
      case 'weekly':
        return Array(12).fill().map((_, i) => ({ value: i+1, label: `Week ${i+1}` }));
      case 'monthly':
        return [
          { value: 1, label: 'January' },
          { value: 2, label: 'February' },
          { value: 3, label: 'March' },
          { value: 4, label: 'April' },
          { value: 5, label: 'May' },
          { value: 6, label: 'June' },
          { value: 7, label: 'July' },
          { value: 8, label: 'August' },
          { value: 9, label: 'September' },
          { value: 10, label: 'October' },
          { value: 11, label: 'November' },
          { value: 12, label: 'December' }
        ];
      case 'quarterly':
        return [
          { value: 1, label: 'Q1' },
          { value: 2, label: 'Q2' },
          { value: 3, label: 'Q3' },
          { value: 4, label: 'Q4' }
        ];
      case 'yearly':
        const currentYear = new Date().getFullYear();
        return [
          { value: currentYear-2, label: `${currentYear-2}` },
          { value: currentYear-1, label: `${currentYear-1}` },
          { value: currentYear, label: `${currentYear}` }
        ];
      default:
        return [];
    }
  };
  
  // Process data based on selected time period
  const processedData = React.useMemo(() => {
    const result = {};
    Object.entries(data).forEach(([kpiId, kpiData]) => {
      if (!kpiData) return;
      
      // Create a copy of the data
      result[kpiId] = { ...kpiData };
      
      // Update chart data based on selected time range
      if (timeRange === 'weekly' && kpiData.weeklyData) {
        result[kpiId].chartData = kpiData.weeklyData;
        // Filter to specific week if needed
        if (timeValue) {
          const weekData = kpiData.weeklyData.find(d => d.name === `Week ${timeValue}`);
          if (weekData) {
            result[kpiId].current = weekData.value;
            result[kpiId].target = weekData.target;
            result[kpiId].progress = Math.round((weekData.value / weekData.target) * 100);
          }
        }
      } else if (timeRange === 'monthly' && kpiData.monthlyData) {
        result[kpiId].chartData = kpiData.monthlyData;
        // Filter to specific month if needed
        if (timeValue) {
          const monthData = kpiData.monthlyData.find(d => d.name === `Month ${timeValue}`);
          if (monthData) {
            result[kpiId].current = monthData.value;
            result[kpiId].target = monthData.target;
            result[kpiId].progress = Math.round((monthData.value / monthData.target) * 100);
          }
        }
      } else if (timeRange === 'quarterly' && kpiData.quarterlyData) {
        result[kpiId].chartData = kpiData.quarterlyData;
        // Filter to specific quarter if needed
        if (timeValue) {
          const quarterData = kpiData.quarterlyData.find(d => d.name === `Q${timeValue}`);
          if (quarterData) {
            result[kpiId].current = quarterData.value;
            result[kpiId].target = quarterData.target;
            result[kpiId].progress = Math.round((quarterData.value / quarterData.target) * 100);
          }
        }
      } else if (timeRange === 'yearly' && kpiData.yearlyData) {
        result[kpiId].chartData = kpiData.yearlyData;
        // Filter to specific year if needed
        if (timeValue) {
          const yearData = kpiData.yearlyData.find(d => d.name === `${timeValue}`);
          if (yearData) {
            result[kpiId].current = yearData.value;
            result[kpiId].target = yearData.target;
            result[kpiId].progress = Math.round((yearData.value / yearData.target) * 100);
          }
        }
      }
    });
    return result;
  }, [data, timeRange, timeValue]);
  
  // Reset time value when time range changes
  useEffect(() => {
    const options = getTimePeriodOptions();
    if (options.length > 0) {
      setTimeValue(options[0].value);
    }
  }, [timeRange]);
  
  const handleAccordionChange = (sectionId) => (event, isExpanded) => {
    setExpanded(prev => 
      isExpanded 
        ? [...prev, sectionId] 
        : prev.filter(id => id !== sectionId)
    );
  };
  
  const handleTimeRangeChange = (event, newTimeRange) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
    }
  };
  
  const handleTimeValueChange = (event) => {
    setTimeValue(event.target.value);
  };
  
  // Get table rows from adapter
  const tableRows = domainAdapter.getTableRows ? domainAdapter.getTableRows(processedData) : [];
  const tableHeaders = domainAdapter.tableHeaders || [];
  
  // Handle opening the goal setting dialog
  const handleOpenGoalDialog = (kpiId) => {
    const kpi = kpiDefinitions.find(k => k.id === kpiId);
    setSelectedKpi(kpi);
    
    // Check if there's an existing goal
    const storedGoals = localStorage.getItem('salesGoals');
    const goals = storedGoals ? JSON.parse(storedGoals) : [];
    const existingGoal = goals.find(g => g.kpi_id === kpiId && g.status === 'active');
    
    setCurrentGoal(existingGoal || null);
    setOpenGoalDialog(true);
  };
  
  // Handle closing the goal setting dialog
  const handleCloseGoalDialog = () => {
    setOpenGoalDialog(false);
    setSelectedKpi(null);
    setCurrentGoal(null);
  };
  
  // Handle submitting a goal
  const handleSubmitGoal = async (goalData) => {
    try {
      // Load existing goals
      const storedGoals = localStorage.getItem('salesGoals');
      const goals = storedGoals ? JSON.parse(storedGoals) : [];
      
      let updatedGoals = [...goals];
      
      if (currentGoal) {
        // Editing existing goal
        const index = updatedGoals.findIndex(g => g.id === currentGoal.id);
        if (index !== -1) {
          updatedGoals[index] = { ...goalData, id: currentGoal.id };
        }
      } else {
        // Creating new goal
        const newGoal = {
          ...goalData,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        updatedGoals.push(newGoal);
      }
      
      // Save to localStorage
      localStorage.setItem('salesGoals', JSON.stringify(updatedGoals));
      
      // Close the dialog
      handleCloseGoalDialog();
      
      // Reload the page to refresh data
      window.location.reload();
    } catch (err) {
      console.error('Error saving goal:', err);
      alert('Failed to save goal. Please try again.');
    }
  };
  
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
        
        {/* Time period selector */}
        <Paper sx={{ mb: 3, p: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, gap: 2 }}>
            <Typography variant="subtitle1" sx={{ minWidth: 120 }}>Time Period:</Typography>
            
            <ToggleButtonGroup
              value={timeRange}
              exclusive
              onChange={handleTimeRangeChange}
              aria-label="time range"
              size="small"
            >
              <ToggleButton value="weekly" aria-label="weekly">
                Weekly
              </ToggleButton>
              <ToggleButton value="monthly" aria-label="monthly">
                Monthly
              </ToggleButton>
              <ToggleButton value="quarterly" aria-label="quarterly">
                Quarterly
              </ToggleButton>
              <ToggleButton value="yearly" aria-label="yearly">
                Yearly
              </ToggleButton>
            </ToggleButtonGroup>
            
            <FormControl sx={{ minWidth: 120 }} size="small">
              <InputLabel id="time-period-select-label">Period</InputLabel>
              <Select
                labelId="time-period-select-label"
                id="time-period-select"
                value={timeValue}
                label="Period"
                onChange={handleTimeValueChange}
              >
                {getTimePeriodOptions().map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
            {domainAdapter.getPrimaryMetricName(timeRange, processedData[domainAdapter.getPrimaryMetric().id])}
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="subtitle1" color="textSecondary">Current</Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  {domainAdapter.formatPrimaryMetric(processedData[domainAdapter.getPrimaryMetric().id].current)}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="subtitle1" color="textSecondary">Target</Typography>
                <Typography variant="h3">
                  {domainAdapter.formatPrimaryMetric(processedData[domainAdapter.getPrimaryMetric().id].target)}
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
                      value={Math.min(processedData[domainAdapter.getPrimaryMetric().id].progress, 100)} 
                      color={processedData[domainAdapter.getPrimaryMetric().id].relativeProgress >= 1 ? "success" : "primary"}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color="textSecondary">
                      {`${processedData[domainAdapter.getPrimaryMetric().id].progress.toFixed(1)}%`}
                    </Typography>
                  </Box>
                </Box>
                
                <Typography 
                  variant="body1" 
                  color={processedData[domainAdapter.getPrimaryMetric().id].relativeProgress >= 1 ? "success.main" : "error.main"}
                  fontWeight="bold"
                >
                  {processedData[domainAdapter.getPrimaryMetric().id].relativeProgress >= 1 
                    ? `${((processedData[domainAdapter.getPrimaryMetric().id].relativeProgress - 1) * 100).toFixed(1)}% ahead of target` 
                    : `${((1 - processedData[domainAdapter.getPrimaryMetric().id].relativeProgress) * 100).toFixed(1)}% behind target`}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        {/* KPI Summary Table */}
        {tableRows.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Summary
            </Typography>
            <TableContainer component={Paper} elevation={2}>
              <Table aria-label="summary table" size="small">
                <TableHead>
                  <TableRow>
                    {tableHeaders.map((header, index) => (
                      <TableCell 
                        key={index}
                        align={header.align || 'left'}
                        sx={{ 
                          fontWeight: 'bold',
                          backgroundColor: 'primary.light',
                          color: 'primary.contrastText'
                        }}
                      >
                        {header.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableRows.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {tableHeaders.map((header, cellIndex) => (
                        <TableCell 
                          key={cellIndex}
                          align={header.align || 'left'}
                        >
                          {domainAdapter.formatTableCell(
                            row[header.id], 
                            header.format, 
                            row.formatInfo
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        
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
                      {renderChart(chart, processedData[chart.id], domainAdapter)}
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
      
      {/* Goal Setting Dialog */}
      <Dialog
        open={openGoalDialog}
        onClose={handleCloseGoalDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentGoal ? 'Edit Goal' : 'Set Goal'} for {selectedKpi?.name || ''}
        </DialogTitle>
        <DialogContent>
          {selectedKpi && (
            <GoalSettingForm
              onSubmit={handleSubmitGoal}
              initialData={currentGoal ? {
                ...currentGoal,
                kpi_id: selectedKpi.id
              } : {
                kpi_id: selectedKpi.id,
                entity_type: 'department',
                entity_id: 'sales',
                time_period: 'yearly',
                start_date: new Date(new Date().getFullYear(), 0, 1),
                end_date: new Date(new Date().getFullYear(), 11, 31),
                target_value: '',
                stretch_target: '',
                minimum_target: '',
                status: 'active'
              }}
              kpiDefinitions={kpiDefinitions}
              entities={entities}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseGoalDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>
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
const renderChart = (chart, data, adapter) => {
  if (!data) {
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
  
  const chartType = chart.type.toLowerCase();
  
  // Add a Set Goal button to each chart
  const chartComponent = (
    <Box sx={{ position: 'relative' }}>
      {chartType === 'card' && <MetricCard metric={chart} data={data} adapter={adapter} />}
      {chartType === 'barchart' && <BarChartCard metric={chart} data={data} adapter={adapter} />}
      {chartType === 'linechart' && <LineChartCard metric={chart} data={data} adapter={adapter} />}
      {chartType === 'piechart' && <PieChartCard metric={chart} data={data} adapter={adapter} />}
      
      <Button
        variant="outlined"
        size="small"
        startIcon={<EditIcon />}
        onClick={() => handleOpenGoalDialog(chart.id)}
        sx={{ position: 'absolute', top: 10, right: 10 }}
      >
        {data.target !== null ? 'Edit Goal' : 'Set Goal'}
      </Button>
    </Box>
  );
  
  return chartComponent;
};

// Metric Card Component
const MetricCard = ({ metric, data, adapter }) => {
  // Format the progress value safely
  const formatProgress = (progress, target) => {
    if (progress === null || target === null) {
      return 'No target set';
    }
    return `${progress.toFixed(0)}%`;
  };

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
          Target: {data.target !== null ? adapter.formatValue(metric.id, data.target) : 'Not set'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={data.progress !== null ? Math.min(data.progress, 100) : 0} 
              color={data.status === 'positive' ? 'success' : data.status === 'negative' ? 'error' : 'primary'}
            />
          </Box>
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="text.secondary">
              {formatProgress(data.progress, data.target)}
            </Typography>
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
          Target: {data.target !== null ? adapter.formatValue(metric.id, data.target) : 'Not set'}
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
          Target: {data.target !== null ? adapter.formatValue(metric.id, data.target) : 'Not set'}
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
          Target: {data.target !== null ? adapter.formatValue(metric.id, data.target) : 'Not set'}
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
