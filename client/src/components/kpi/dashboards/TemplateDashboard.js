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
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
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
  
  // Get primary metric
  const primaryMetric = domainAdapter.getPrimaryMetric();
  console.log('Primary metric:', primaryMetric);
  
  // State to track expanded sections (default all expanded)
  const [expanded, setExpanded] = useState(sections.map(s => s.id));
  
  // Time period state
  const [timePeriod, setTimePeriod] = useState('monthly');
  const [specificPeriod, setSpecificPeriod] = useState('');
  
  // State for goal setting dialog
  const [openGoalDialog, setOpenGoalDialog] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState(null);
  const [kpiDefinitions, setKpiDefinitions] = useState([]);
  const [entities, setEntities] = useState([]);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [goalsByKpi, setGoalsByKpi] = useState({});
  
  // Error state
  const [error, setError] = useState(null);
  
  // Add this new state for year
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  
  // Load KPI definitions and entities
  useEffect(() => {
    try {
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
        const goalsMap = {};
        goals.forEach(goal => {
          if (goal.status === 'active') {
            goalsMap[goal.kpi_id] = goal;
          }
        });
        setGoalsByKpi(goalsMap);
      }
      
      // Add this to debug KPI values
      const storedValues = localStorage.getItem('salesKpiValues');
      if (storedValues) {
        console.log('Found stored KPI values:', JSON.parse(storedValues));
      }
    } catch (err) {
      console.error("Error in useEffect:", err);
      setError(err);
    }
  }, []);
  
  // Set specific period options based on time period
  useEffect(() => {
    if (timePeriod === 'weekly') {
      setSpecificPeriod('1');
    } else if (timePeriod === 'monthly') {
      setSpecificPeriod('1');
    } else if (timePeriod === 'quarterly') {
      setSpecificPeriod('1');
    } else if (timePeriod === 'yearly') {
      setSpecificPeriod(new Date().getFullYear().toString());
    }
  }, [timePeriod]);
  
  // Handle time period change
  const handleTimePeriodChange = (event, newPeriod) => {
    if (newPeriod !== null) {
      setTimePeriod(newPeriod);
    }
  };
  
  // Handle specific period change
  const handleSpecificPeriodChange = (event) => {
    setSpecificPeriod(event.target.value);
  };
  
  // Add this new handler for year changes
  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };
  
  // Get time period options based on selected period type
  const getTimePeriodOptions = () => {
    if (timePeriod === 'weekly') {
      return Array.from({ length: 52 }, (_, i) => ({
        value: (i + 1).toString(),
        label: `Week ${i + 1}`
      }));
    } else if (timePeriod === 'monthly') {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return months.map((month, i) => ({
        value: (i + 1).toString(),
        label: month
      }));
    } else if (timePeriod === 'quarterly') {
      return Array.from({ length: 4 }, (_, i) => ({
        value: (i + 1).toString(),
        label: `Q${i + 1}`
      }));
    } else if (timePeriod === 'yearly') {
      const currentYear = new Date().getFullYear();
      return Array.from({ length: 3 }, (_, i) => ({
        value: (currentYear - 2 + i).toString(),
        label: (currentYear - 2 + i).toString()
      }));
    }
    return [];
  };
  
  // Add this function to get year options
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, i) => ({
      value: (currentYear - 5 + i).toString(),
      label: (currentYear - 5 + i).toString()
    }));
  };
  
  // Process data based on selected time period
  const processData = (data) => {
    if (!data) {
      console.warn('No data provided to processData');
      return {};
    }
    
    const processedData = {};
    
    // Load KPI values from localStorage
    let storedKpiValues = [];
    try {
      const storedValues = localStorage.getItem('salesKpiValues');
      if (storedValues) {
        storedKpiValues = JSON.parse(storedValues);
        console.log('Processing stored KPI values:', storedKpiValues);
      }
    } catch (error) {
      console.error('Error parsing stored KPI values:', error);
    }
    
    // Process each KPI
    Object.entries(data).forEach(([kpiId, kpiData]) => {
      if (!kpiData) {
        console.warn(`No data for KPI: ${kpiId}`);
        return;
      }
      
      try {
        // Start with a safe copy of the KPI data
        processedData[kpiId] = {
          ...kpiData,
          chartData: [],
          current: kpiData.current || 0,
          target: kpiData.target || null,
          progress: kpiData.progress || null,
          status: kpiData.status || 'neutral'
        };
        
        // Find manual values for this KPI
        let kpiValues = storedKpiValues.filter(v => 
          v.kpi_id === kpiId && 
          v.year === selectedYear
        );
        
        // If we have manual values, use them
        if (kpiValues.length > 0) {
          console.log(`Found ${kpiValues.length} manual values for KPI ${kpiId}`);
          
          // Filter by period type
          kpiValues = kpiValues.filter(v => v.period_type === timePeriod);
          
          // Convert to chart data format
          const chartData = kpiValues.map(v => ({
            name: v.period_value,
            value: parseFloat(v.value),
            year: v.year
          }));
          
          // Sort by period value
          chartData.sort((a, b) => parseInt(a.name) - parseInt(b.name));
          
          processedData[kpiId].chartData = chartData;
          
          // For specific period selection, filter to just that period
          if (specificPeriod && timePeriod !== 'quarterly' && timePeriod !== 'yearly') {
            const filteredChartData = chartData.filter(item => item.name === specificPeriod);
            if (filteredChartData.length > 0) {
              processedData[kpiId].current = filteredChartData[0].value;
            }
          } 
          // For quarterly, aggregate monthly data
          else if (timePeriod === 'quarterly') {
            // Get all monthly data for this year
            const monthlyData = storedKpiValues.filter(v => 
              v.kpi_id === kpiId && 
              v.period_type === 'monthly' &&
              v.year === selectedYear
            );
            
            // Group by quarter
            const quarterlyData = {};
            monthlyData.forEach(item => {
              const month = parseInt(item.period_value);
              const quarter = Math.ceil(month / 3);
              if (!quarterlyData[quarter]) {
                quarterlyData[quarter] = 0;
              }
              quarterlyData[quarter] += parseFloat(item.value);
            });
            
            // Convert to chart data
            const aggregatedChartData = Object.entries(quarterlyData).map(([quarter, value]) => ({
              name: quarter,
              value: value,
              year: selectedYear
            }));
            
            // Sort by quarter
            aggregatedChartData.sort((a, b) => parseInt(a.name) - parseInt(b.name));
            
            processedData[kpiId].chartData = aggregatedChartData;
            
            // If specific quarter is selected, use that value
            if (specificPeriod) {
              const filteredQuarterData = aggregatedChartData.filter(item => item.name === specificPeriod);
              if (filteredQuarterData.length > 0) {
                processedData[kpiId].current = filteredQuarterData[0].value;
              }
            } else if (aggregatedChartData.length > 0) {
              // Use the most recent quarter as current
              processedData[kpiId].current = aggregatedChartData[aggregatedChartData.length - 1].value;
            }
          }
          // For yearly, aggregate all monthly data
          else if (timePeriod === 'yearly') {
            // Get all monthly data for this year
            const monthlyData = storedKpiValues.filter(v => 
              v.kpi_id === kpiId && 
              v.period_type === 'monthly' &&
              v.year === selectedYear
            );
            
            // Sum all values
            let yearlyTotal = 0;
            monthlyData.forEach(item => {
              yearlyTotal += parseFloat(item.value);
            });
            
            // Create yearly chart data
            const yearlyChartData = [{
              name: selectedYear,
              value: yearlyTotal,
              year: selectedYear
            }];
            
            processedData[kpiId].chartData = yearlyChartData;
            processedData[kpiId].current = yearlyTotal;
          }
          // Otherwise use the most recent value as current
          else if (chartData.length > 0) {
            processedData[kpiId].current = chartData[chartData.length - 1].value;
          }
        } 
        // Otherwise use the built-in data
        else {
          let dataSource = [];
          
          // Select the right data array based on time period
          if (timePeriod === 'weekly' && kpiData.weeklyData) {
            dataSource = [...kpiData.weeklyData];
          } else if (timePeriod === 'monthly' && kpiData.monthlyData) {
            dataSource = [...kpiData.monthlyData];
          } else if (timePeriod === 'quarterly' && kpiData.quarterlyData) {
            dataSource = [...kpiData.quarterlyData];
          } else if (timePeriod === 'yearly' && kpiData.yearlyData) {
            dataSource = [...kpiData.yearlyData];
          } else if (kpiData.chartData) {
            dataSource = [...kpiData.chartData];
          }
          
          // Filter by year if applicable
          if (selectedYear && dataSource.length > 0) {
            dataSource = dataSource.filter(item => 
              item && (!item.year || item.year === selectedYear)
            );
          }
          
          // Filter by specific period if selected
          if (specificPeriod && dataSource.length > 0) {
            if (timePeriod === 'yearly') {
              dataSource = dataSource.filter(item => item && item.name === specificPeriod);
            } else {
              const periodIndex = parseInt(specificPeriod, 10) - 1;
              if (periodIndex >= 0 && periodIndex < dataSource.length) {
                dataSource = [dataSource[periodIndex]];
              }
            }
          }
          
          processedData[kpiId].chartData = dataSource;
        }
        
        // Get target from goals if available
        if (goalsByKpi[kpiId]) {
          processedData[kpiId].target = parseFloat(goalsByKpi[kpiId].target_value);
        }
        
        // Recalculate progress if we have both current and target
        if (processedData[kpiId].current !== null && 
            processedData[kpiId].target !== null && 
            processedData[kpiId].target > 0) {
          processedData[kpiId].progress = Math.round((processedData[kpiId].current / processedData[kpiId].target) * 100);
          
          // Update status based on progress
          if (processedData[kpiId].progress >= 100) {
            processedData[kpiId].status = 'positive';
          } else if (processedData[kpiId].progress >= 80) {
            processedData[kpiId].status = 'neutral';
          } else {
            processedData[kpiId].status = 'negative';
          }
        }
      } catch (error) {
        console.error(`Error processing data for KPI ${kpiId}:`, error);
        // Provide fallback data
        processedData[kpiId] = {
          ...kpiData,
          chartData: [],
          current: kpiData.current || 0,
          target: kpiData.target || null,
          progress: null,
          status: 'neutral'
        };
      }
    });
    
    return processedData;
  };
  
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
  
  // Handle submitting the goal form
  const handleSubmitGoal = async (goalData) => {
    try {
      // For now, just store in localStorage
      const storedGoals = localStorage.getItem('salesGoals');
      const goals = storedGoals ? JSON.parse(storedGoals) : [];
      
      // Check if we're updating an existing goal
      const existingIndex = goals.findIndex(g => g.id === goalData.id);
      
      if (existingIndex >= 0) {
        // Update existing goal
        goals[existingIndex] = goalData;
      } else {
        // Add new goal with generated ID
        goalData.id = Date.now().toString();
        goals.push(goalData);
      }
      
      // Save back to localStorage
      localStorage.setItem('salesGoals', JSON.stringify(goals));
      
      // Update the goals by KPI map
      setGoalsByKpi(prev => ({
        ...prev,
        [goalData.kpi_id]: goalData
      }));
      
      // Close the dialog
      handleCloseGoalDialog();
      
      // Refresh the dashboard data
      // In a real app, you'd probably refetch data from the server
      // For now, we'll just force a re-render
      setTimePeriod(prev => prev);
      
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };
  
  // Toggle section expansion
  const handleToggleSection = (sectionId) => {
    setExpanded(prev => {
      if (prev.includes(sectionId)) {
        return prev.filter(id => id !== sectionId);
      } else {
        return [...prev, sectionId];
      }
    });
  };
  
  // Process the data based on selected time period
  const processedData = processData(data);
  
  // Get primary metric data
  const primaryMetricData = primaryMetric && processedData[primaryMetric.id];
  
  // Get table rows from adapter
  const tableRows = domainAdapter.getTableRows(processedData);
  
  // Render a chart based on its type
  const renderChart = (chart, data, adapter) => {
    if (!data) {
      console.warn(`No data available for chart: ${chart.id}`);
      return null;
    }
    
    // Ensure chartData exists and has at least one item
    if (!data.chartData || data.chartData.length === 0) {
      console.warn(`No chart data available for chart: ${chart.id}`);
      return (
        <Card elevation={2} sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {chart.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              No data available for the selected time period.
            </Typography>
          </CardContent>
        </Card>
      );
    }
    
    const chartType = chart.type.toLowerCase();
    
    // Add a Set Goal button to each chart
    const chartComponent = (
      <Box sx={{ position: 'relative' }}>
        {chartType === 'card' && <CardComponent metric={chart} data={data} adapter={adapter} />}
        {chartType === 'barchart' && <BarChartCard metric={chart} data={data} adapter={adapter} />}
        {chartType === 'linechart' && <LineChartCard metric={chart} data={data} adapter={adapter} />}
        {chartType === 'piechart' && <PieChartCard metric={chart} data={data} adapter={adapter} />}
      </Box>
    );
    
    return chartComponent;
  };
  
  // If there's an error, show error UI
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" color="error">
          Dashboard Error
        </Typography>
        <Typography variant="body1">
          There was an error loading the dashboard. Please try refreshing the page.
        </Typography>
        <pre>{error.message}</pre>
      </Box>
    );
  }
  
  // Render the dashboard UI
  return (
    <Box sx={{ p: 3 }}>
      {/* Dashboard Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {domainAdapter.dashboardTitle}
        </Typography>
        
        {isTestData && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
            <Typography variant="body1">
              This dashboard is displaying test data. In a production environment, this would be replaced with real data from your systems.
            </Typography>
          </Paper>
        )}
        
        {/* Primary Metric Card - NEW COMPONENT */}
        {primaryMetric && primaryMetricData && (
          <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  {primaryMetric.name}
                </Typography>
                <Typography variant="h3" component="div">
                  {domainAdapter.formatValue(primaryMetric.id, primaryMetricData.current)}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  Target: {primaryMetricData.target ? 
                    domainAdapter.formatValue(primaryMetric.id, primaryMetricData.target) : 
                    'Not set'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={primaryMetricData.progress !== null ? Math.min(primaryMetricData.progress, 100) : 0} 
                      color="inherit"
                      sx={{ height: 10, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.3)' }}
                    />
                  </Box>
                  <Box sx={{ minWidth: 50 }}>
                    <Typography variant="h6">
                      {primaryMetricData.progress !== null ? 
                        `${Math.round(primaryMetricData.progress)}%` : 
                        'N/A'}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {primaryMetricData.progress >= 100 ? 
                    'Target achieved!' : 
                    primaryMetricData.progress >= 80 ? 
                      'On track to meet target' : 
                      'Needs attention to meet target'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        )}
        
        {/* KPI Summary Table - NEW COMPONENT */}
        {tableRows && tableRows.length > 0 && (
          <Paper sx={{ width: '100%', mb: 3, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {domainAdapter.tableHeaders.map((header) => (
                      <TableCell
                        key={header.id}
                        align={header.align || 'left'}
                        sx={{ fontWeight: 'bold' }}
                      >
                        {header.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableRows.map((row, index) => (
                    <TableRow key={index} hover>
                      {domainAdapter.tableHeaders.map((header) => {
                        if (header.id === 'status') {
                          // Render status as a trend icon
                          const status = row[header.id] || 'neutral';
                          const statusColors = {
                            positive: 'success.main',
                            negative: 'error.main',
                            neutral: 'info.main'
                          };
                          const statusIcons = {
                            positive: <TrendingUpIcon />,
                            negative: <TrendingDownIcon />,
                            neutral: <TrendingFlatIcon />
                          };
                          return (
                            <TableCell key={header.id} align={header.align || 'center'}>
                              <Box sx={{ 
                                display: 'flex',
                                justifyContent: 'center',
                                color: statusColors[status]
                              }}>
                                {statusIcons[status]}
                              </Box>
                            </TableCell>
                          );
                        }
                        
                        // For other cells, format the value
                        return (
                          <TableCell key={header.id} align={header.align || 'left'}>
                            {header.format ? 
                              domainAdapter.formatTableCell(row[header.id], header.format, row) : 
                              row[header.id]}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
        
        {/* Time Period Controls */}
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Typography variant="body1">Time Period:</Typography>
            </Grid>
            <Grid item>
              <ToggleButtonGroup
                value={timePeriod}
                exclusive
                onChange={handleTimePeriodChange}
                size="small"
              >
                <ToggleButton value="weekly">Weekly</ToggleButton>
                <ToggleButton value="monthly">Monthly</ToggleButton>
                <ToggleButton value="quarterly">Quarterly</ToggleButton>
                <ToggleButton value="yearly">Yearly</ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="specific-period-label">Period</InputLabel>
                <Select
                  labelId="specific-period-label"
                  id="specific-period"
                  value={specificPeriod}
                  label="Period"
                  onChange={handleSpecificPeriodChange}
                >
                  {getTimePeriodOptions().map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
        
        {/* In the filter controls section, add the year dropdown */}
        <Box sx={{ mb: 3 }}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              {/* ... existing time period controls ... */}
              
              {/* Add this new Grid item for year selection */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="year-label">Year</InputLabel>
                  <Select
                    labelId="year-label"
                    id="year-select"
                    value={selectedYear}
                    label="Year"
                    onChange={handleYearChange}
                  >
                    {getYearOptions().map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Box>
      
      {/* Dashboard Sections */}
      {sections.map((section, index) => (
        <React.Fragment key={section.id}>
          {index > 0 && <Divider sx={{ my: 3 }} />}
          <Accordion 
            expanded={expanded.includes(section.id)}
            onChange={() => handleToggleSection(section.id)}
            sx={{ 
              mb: 2,
              bgcolor: index % 2 === 0 ? 'background.paper' : 'background.default',
              '&:before': { display: 'none' } // Remove the default divider
            }}
          >
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{ 
                borderLeft: 4, 
                borderColor: 'primary.main',
                pl: 2
              }}
            >
              <Typography variant="h6">{section.name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                {section.kpis.map(kpi => {
                  const kpiData = processedData[kpi.id];
                  if (!kpiData) return null;
                  
                  // Get charts for this KPI
                  const charts = domainAdapter.getChartsForSection(section.id, kpi.id);
                  
                  return charts.map((chart, index) => (
                    <Grid item xs={12} md={6} lg={4} key={`${kpi.id}-${index}`}>
                      <Box 
                        sx={{ 
                          border: 1, 
                          borderColor: 'divider',
                          borderRadius: 2,
                          boxShadow: 2,
                          p: 1,
                          height: '100%',
                          transition: 'all 0.3s',
                          '&:hover': {
                            boxShadow: 4,
                            borderColor: 'primary.main',
                          }
                        }}
                      >
                        {renderChart(chart, kpiData, domainAdapter)}
                      </Box>
                    </Grid>
                  ));
                })}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </React.Fragment>
      ))}
      
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
    </Box>
  );
};

// Add this debugging function
const safeLog = (label, obj) => {
  try {
    console.log(`${label}:`, JSON.stringify(obj));
  } catch (e) {
    console.log(`${label} (circular reference):`, obj);
  }
};

// Card Component
const CardComponent = ({ metric, data, adapter }) => {
  console.log('CardComponent rendering with data:', data);
  console.log('CardComponent metric:', metric);
  console.log('CardComponent progress value:', data.progress);
  
  // Format the progress value safely with extensive logging
  const formatProgress = (progress) => {
    console.log('formatProgress called with:', progress);
    console.log('progress type:', typeof progress);
    
    if (progress === null || progress === undefined) {
      console.log('Progress is null or undefined, returning "No target set"');
      return 'No target set';
    }
    
    try {
      const result = `${Math.round(progress)}%`;
      console.log('Formatted progress result:', result);
      return result;
    } catch (error) {
      console.error('Error formatting progress:', error);
      return 'N/A';
    }
  };

  // Log before rendering
  console.log('About to render CardComponent');

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
              {(() => {
                try {
                  return formatProgress(data.progress);
                } catch (e) {
                  console.error('Error in formatProgress render:', e);
                  return 'Error';
                }
              })()}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// Bar Chart Card Component
const BarChartCard = ({ metric, data, adapter }) => {
  console.log('BarChartCard rendering with data:', data);
  
  // Format the progress value safely
  const formatProgress = (progress) => {
    if (progress === null || progress === undefined) {
      return 'No target set';
    }
    try {
      return `${Math.round(progress)}%`;
    } catch (error) {
      console.error('Error formatting progress:', error);
      return 'N/A';
    }
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
              {(() => {
                try {
                  return formatProgress(data.progress);
                } catch (e) {
                  console.error('Error in formatProgress render:', e);
                  return 'Error';
                }
              })()}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ height: 200, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
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
  console.log('LineChartCard rendering with data:', data);
  
  // State to toggle between cumulative and regular view
  const [showCumulative, setShowCumulative] = useState(true);
  
  // Check if we have chart data
  if (!data.chartData || data.chartData.length === 0) {
    console.warn('No chart data available for chart:', metric.id);
    return (
      <Card elevation={2} sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {metric.name}
          </Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No data available
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }
  
  // Prepare data for the chart - ensure we have both value and target
  // and calculate cumulative values
  const chartData = data.chartData.map((item, index, array) => {
    // Calculate cumulative value
    let cumulativeValue = item.value;
    if (showCumulative && index > 0) {
      cumulativeValue = array.slice(0, index + 1).reduce((sum, curr) => sum + curr.value, 0);
    }
    
    // Make sure we have a target value for each data point
    return {
      ...item,
      value: item.value,
      cumulativeValue: cumulativeValue,
      target: data.target || null
    };
  });
  
  // Format period labels based on period type
  const formatPeriodLabel = (period) => {
    // Get period type from the first data point if available
    const periodType = data.periodType || 'monthly';
    
    if (periodType === 'monthly') {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const monthIndex = parseInt(period) - 1;
      return monthIndex >= 0 && monthIndex < months.length ? months[monthIndex] : period;
    } else if (periodType === 'quarterly') {
      return `Q${period}`;
    } else if (periodType === 'yearly') {
      return period;
    } else if (periodType === 'weekly') {
      return `Week ${period}`;
    }
    return period;
  };
  
  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color="text.secondary">
            {metric.name}
          </Typography>
          <Button 
            size="small" 
            variant="outlined"
            onClick={() => setShowCumulative(!showCumulative)}
          >
            {showCumulative ? 'Show Individual' : 'Show Cumulative'}
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Current: {adapter.formatValue(metric.id, data.current)} | 
          Target: {data.target !== null ? adapter.formatValue(metric.id, data.target) : 'Not set'}
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tickFormatter={formatPeriodLabel}
                label={{ 
                  value: 'Period', 
                  position: 'insideBottomRight', 
                  offset: -10 
                }} 
              />
              <YAxis 
                label={{ 
                  value: metric.unit || '', 
                  angle: -90, 
                  position: 'insideLeft' 
                }} 
              />
              <Tooltip 
                formatter={(value) => adapter.formatValue(metric.id, value)}
                labelFormatter={(label) => `Period: ${formatPeriodLabel(label)}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={showCumulative ? "cumulativeValue" : "value"}
                name={showCumulative ? "Cumulative" : "Individual"}
                stroke="#8884d8"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
              {data.target !== null && (
                <Line
                  type="monotone"
                  dataKey="target"
                  name="Target"
                  stroke="#82ca9d"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

// Pie Chart Card Component
const PieChartCard = ({ metric, data, adapter }) => {
  console.log('PieChartCard rendering with data:', data);
  
  // Format the progress value safely
  const formatProgress = (progress) => {
    if (progress === null || progress === undefined) {
      return 'No target set';
    }
    try {
      return `${Math.round(progress)}%`;
    } catch (error) {
      console.error('Error formatting progress:', error);
      return 'N/A';
    }
  };
  
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
              {(() => {
                try {
                  return formatProgress(data.progress);
                } catch (e) {
                  console.error('Error in formatProgress render:', e);
                  return 'Error';
                }
              })()}
            </Typography>
          </Box>
        </Box>
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

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dashboard error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" color="error">
            Dashboard Error
          </Typography>
          <Typography variant="body1">
            Something went wrong. Please try refreshing the page.
          </Typography>
          <pre>{this.state.error?.message}</pre>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Wrap your export with the error boundary
export default function SafeTemplateDashboard(props) {
  return (
    <ErrorBoundary>
      <TemplateDashboard {...props} />
    </ErrorBoundary>
  );
}
