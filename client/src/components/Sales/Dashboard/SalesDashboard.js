import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  LinearProgress,
  Card,
  CardContent,
  Button,
  AppBar,
  Toolbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Tabs,
  Tab
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import DateRangeIcon from '@mui/icons-material/DateRange';
import EventIcon from '@mui/icons-material/Event';

// Import our services
import salesDataService from '../../../services/salesDataService';

// Helper function to format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Helper function to format percentage
const formatPercentage = (value) => {
  return `${value.toFixed(1)}%`;
};

const SalesDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [progress, setProgress] = useState({
    achieved: 0,
    yearProgress: 0,
    relativeProgress: 0
  });
  
  // Time range state
  const [timeRangeView, setTimeRangeView] = useState('annual');
  const [selectedPeriod, setSelectedPeriod] = useState({
    quarter: 'Q3', // Default to current quarter
    month: 'July'  // Default to current month
  });
  
  // Mock KPI data for the summary table
  const [kpiSummary, setKpiSummary] = useState([
    { 
      id: 1, 
      name: 'Total Sales YTD', 
      category: 'Revenue',
      value: 0, 
      goal: 2500000, 
      unit: 'currency',
      trend: 'up',
      trendData: [5, 10, 5, 20, 8, 15, 25],
      // Add period-specific data
      periods: {
        annual: { value: 0, goal: 2500000 },
        quarterly: {
          'Q1': { value: 450000, goal: 500000 },
          'Q2': { value: 680000, goal: 650000 },
          'Q3': { value: 520000, goal: 700000 },
          'Q4': { value: 0, goal: 650000 }
        },
        monthly: {
          'January': { value: 120000, goal: 150000, weeks: [28000, 32000, 30000, 30000] },
          'February': { value: 145000, goal: 160000, weeks: [35000, 38000, 36000, 36000] },
          'March': { value: 185000, goal: 190000, weeks: [45000, 48000, 46000, 46000] },
          'April': { value: 210000, goal: 200000, weeks: [50000, 55000, 52000, 53000] },
          'May': { value: 230000, goal: 220000, weeks: [55000, 58000, 57000, 60000] },
          'June': { value: 240000, goal: 230000, weeks: [58000, 62000, 60000, 60000] },
          'July': { value: 180000, goal: 220000, weeks: [42000, 45000, 46000, 47000] }
        }
      }
    },
    { 
      id: 2, 
      name: 'Upsells', 
      category: 'Revenue',
      value: 450000, 
      goal: 600000, 
      unit: 'currency',
      trend: 'up',
      trendData: [10, 15, 13, 20, 22, 25, 30],
      periods: {
        annual: { value: 450000, goal: 600000 },
        quarterly: {
          'Q1': { value: 120000, goal: 140000 },
          'Q2': { value: 180000, goal: 160000 },
          'Q3': { value: 150000, goal: 170000 },
          'Q4': { value: 0, goal: 130000 }
        },
        monthly: {
          'January': { value: 35000, goal: 40000, weeks: [8000, 9000, 9000, 9000] },
          'February': { value: 40000, goal: 45000, weeks: [9500, 10000, 10500, 10000] },
          'March': { value: 45000, goal: 55000, weeks: [11000, 11500, 11000, 11500] },
          'April': { value: 55000, goal: 50000, weeks: [13000, 14000, 14000, 14000] },
          'May': { value: 60000, goal: 55000, weeks: [14500, 15000, 15500, 15000] },
          'June': { value: 65000, goal: 55000, weeks: [16000, 16500, 16000, 16500] },
          'July': { value: 50000, goal: 55000, weeks: [12000, 12500, 12500, 13000] }
        }
      }
    },
    { 
      id: 3, 
      name: 'New Logos', 
      category: 'Customers',
      value: 12, 
      goal: 20, 
      unit: 'number',
      trend: 'flat',
      trendData: [8, 9, 8, 10, 9, 10, 12]
    },
    { 
      id: 4, 
      name: 'Win Rate', 
      category: 'Pipeline',
      value: 32, 
      goal: 40, 
      unit: 'percentage',
      trend: 'down',
      trendData: [40, 38, 35, 30, 32, 31, 32]
    },
    { 
      id: 5, 
      name: 'Meetings Set', 
      category: 'Activity',
      value: 85, 
      goal: 100, 
      unit: 'number',
      trend: 'up',
      trendData: [60, 65, 70, 75, 80, 82, 85]
    }
  ]);
  
  // Mock goal for now - this would come from your KPI system later
  const salesGoal = {
    year: 2025,
    targetValue: 2500000,
    name: 'Annual Sales Target'
  };

  // Add state for accordion expansion
  const [expanded, setExpanded] = useState({
    revenue: true,
    pipeline: false,
    customers: false,
    activity: false,
    charts: true
  });

  // Add state for filters
  const [filters, setFilters] = useState({
    region: 'all',
    product: 'all'
  });

  // Add state for showing filter panel
  const [showFilters, setShowFilters] = useState(false);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded({...expanded, [panel]: isExpanded});
  };

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value
    });
  };
  
  // Handle time range view change
  const handleTimeRangeChange = (event, newValue) => {
    if (newValue !== null) {
      setTimeRangeView(newValue);
    }
  };
  
  // Handle period selection change
  const handlePeriodChange = (event) => {
    setSelectedPeriod({
      ...selectedPeriod,
      [event.target.name]: event.target.value
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current sales data from our service
        const data = await salesDataService.getCurrentYearSales();
        setSalesData(data);
        
        // Update the Total Sales YTD in our KPI summary
        setKpiSummary(prevSummary => {
          const updatedSummary = [...prevSummary];
          const salesKpi = updatedSummary.find(kpi => kpi.id === 1);
          if (salesKpi) {
            salesKpi.value = data.ytdTotal;
            salesKpi.periods.annual.value = data.ytdTotal;
          }
          return updatedSummary;
        });
        
        // Calculate progress percentages
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31);
        
        const yearProgress = ((now - startOfYear) / (endOfYear - startOfYear)) * 100;
        const achieved = (data.ytdTotal / salesGoal.targetValue) * 100;
        const relativeProgress = achieved / yearProgress;
        
        setProgress({
          achieved,
          yearProgress,
          relativeProgress
        });
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load sales data. Please try again later.');
        setLoading(false);
        console.error('Error fetching sales data:', err);
      }
    };
    
    fetchData();
  }, []);
  
  // Get table rows based on the selected time range
  const getTableRows = () => {
    return kpiSummary.map((kpi) => {
      // Get the appropriate value and goal based on the selected time range
      let value, goal;
      
      if (timeRangeView === 'annual') {
        value = kpi.periods?.annual?.value || 0;
        goal = kpi.periods?.annual?.goal || 0;
      } else if (timeRangeView === 'quarterly') {
        value = kpi.periods?.quarterly?.[selectedPeriod.quarter]?.value || 0;
        goal = kpi.periods?.quarterly?.[selectedPeriod.quarter]?.goal || 0;
      } else if (timeRangeView === 'monthly') {
        value = kpi.periods?.monthly?.[selectedPeriod.month]?.value || 0;
        goal = kpi.periods?.monthly?.[selectedPeriod.month]?.goal || 0;
      }
      
      // If periods data isn't available, fall back to the main value and goal
      if (value === 0 && goal === 0) {
        value = kpi.value || 0;
        goal = kpi.goal || 0;
      }
      
      const percentOfGoal = calculatePercentage(value, goal);
      const isAhead = percentOfGoal >= progress.yearProgress;
      
      return (
        <TableRow 
          key={kpi.id}
          sx={{ 
            '&:last-child td, &:last-child th': { border: 0 },
            backgroundColor: isAhead ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'
          }}
        >
          <TableCell component="th" scope="row">
            {kpi.name}
          </TableCell>
          <TableCell>{kpi.category}</TableCell>
          <TableCell align="right">{formatValue(value, kpi.unit)}</TableCell>
          <TableCell align="right">{formatValue(goal, kpi.unit)}</TableCell>
          <TableCell align="right">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(percentOfGoal, 100)} 
                sx={{ width: 60, mr: 1, height: 8, borderRadius: 5 }}
                color={isAhead ? "success" : "error"}
              />
              {formatPercentage(percentOfGoal)}
            </Box>
          </TableCell>
          <TableCell align="center">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {getTrendIcon(kpi.trend)}
            </Box>
          </TableCell>
        </TableRow>
      );
    });
  };
  
  // Helper function to format values based on their unit
  const formatValue = (value, unit) => {
    if (!value && value !== 0) return 'N/A';
    
    switch(unit) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatPercentage(value);
      default:
        return value.toString();
    }
  };
  
  // Helper function to calculate percentage
  const calculatePercentage = (value, goal) => {
    if (!goal || goal === 0) return 0;
    return (value / goal) * 100;
  };
  
  // Helper function to get trend icon
  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up':
        return <TrendingUpIcon color="success" />;
      case 'down':
        return <TrendingDownIcon color="error" />;
      default:
        return <TrendingFlatIcon color="action" />;
    }
  };

  if (loading) {
    return (
      <>
        <AppBar position="static">
          <Toolbar>
            <Button color="inherit" onClick={() => navigate('/sales')}>
              Back to Sales
            </Button>
            <Button color="inherit" onClick={() => navigate('/dashboard')}>
              Back to Main
            </Button>
          </Toolbar>
        </AppBar>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <AppBar position="static">
          <Toolbar>
            <Button color="inherit" onClick={() => navigate('/sales')}>
              Back to Sales
            </Button>
            <Button color="inherit" onClick={() => navigate('/dashboard')}>
              Back to Main
            </Button>
          </Toolbar>
        </AppBar>
        <Box sx={{ mt: 4 }}>
          <Paper sx={{ p: 3, bgcolor: 'error.light' }}>
            <Typography variant="h6" color="error">
              Error Loading Dashboard
            </Typography>
            <Typography>{error}</Typography>
          </Paper>
        </Box>
      </>
    );
  }

  // Mock data for additional sections
  const pipelineData = {
    opportunities: 45,
    opportunitiesGoal: 60,
    conversionRate: 28,
    conversionGoal: 35,
    avgDealSize: 55000,
    avgDealSizeGoal: 60000,
    stages: [
      { name: 'Prospecting', value: 15 },
      { name: 'Qualification', value: 10 },
      { name: 'Proposal', value: 8 },
      { name: 'Negotiation', value: 7 },
      { name: 'Closed Won', value: 5 }
    ]
  };

  const customerData = {
    newLogos: 12,
    newLogosGoal: 20,
    retention: 92,
    retentionGoal: 95,
    nps: 68,
    npsGoal: 75
  };

  const activityData = {
    meetings: 85,
    meetingsGoal: 100,
    calls: 320,
    callsGoal: 400,
    emails: 1250,
    emailsGoal: 1500
  };

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" onClick={() => navigate('/sales')}>
            Back to Sales
          </Button>
          <Button color="inherit" onClick={() => navigate('/dashboard')}>
            Back to Main
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button 
            color="inherit" 
            onClick={() => navigate('/sales/kpi/manage')}
          >
            Manage KPIs
          </Button>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ mt: 4, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Sales Performance Dashboard</Typography>
          <Button 
            variant="outlined" 
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
        </Box>
        
        {/* Filter Panel */}
        {showFilters && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="region-label">Region</InputLabel>
                  <Select
                    labelId="region-label"
                    id="region"
                    name="region"
                    value={filters.region}
                    label="Region"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="all">All Regions</MenuItem>
                    <MenuItem value="north">North</MenuItem>
                    <MenuItem value="south">South</MenuItem>
                    <MenuItem value="east">East</MenuItem>
                    <MenuItem value="west">West</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="product-label">Product</InputLabel>
                  <Select
                    labelId="product-label"
                    id="product"
                    name="product"
                    value={filters.product}
                    label="Product"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="all">All Products</MenuItem>
                    <MenuItem value="product1">Product A</MenuItem>
                    <MenuItem value="product2">Product B</MenuItem>
                    <MenuItem value="product3">Product C</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
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
        
        {/* KPI Summary Table */}
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table aria-label="KPI summary table">
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Current</TableCell>
                <TableCell align="right">Goal</TableCell>
                <TableCell align="right">% of Goal</TableCell>
                <TableCell align="center">Trend</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getTableRows()}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Revenue Metrics Section */}
        <Accordion 
          expanded={expanded.revenue} 
          onChange={handleAccordionChange('revenue')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="revenue-metrics-content"
            id="revenue-metrics-header"
          >
            <Typography variant="h6">Revenue Metrics</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {/* Annual Goal Card */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {salesGoal.year} {salesGoal.name}
                    </Typography>
                    <Typography variant="h3" color="primary">
                      {formatCurrency(salesGoal.targetValue)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Annual target
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Current YTD Sales Card */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Current YTD Sales
                    </Typography>
                    <Typography variant="h3" color="secondary">
                      {formatCurrency(salesData.ytdTotal)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {progress.achieved.toFixed(1)}% of annual goal
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Progress Status Card */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Goal Progress
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(progress.achieved, 100)} 
                          color={progress.relativeProgress >= 1 ? "success" : "primary"}
                          sx={{ height: 10, borderRadius: 5 }}
                        />
                      </Box>
                      <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="textSecondary">
                          {`${progress.achieved.toFixed(1)}%`}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Year Progress: {progress.yearProgress.toFixed(1)}%
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color={progress.relativeProgress >= 1 ? "success.main" : "error.main"}
                      fontWeight="bold"
                    >
                      {progress.relativeProgress >= 1 
                        ? `${((progress.relativeProgress - 1) * 100).toFixed(1)}% ahead of target` 
                        : `${((1 - progress.relativeProgress) * 100).toFixed(1)}% behind target`}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
        
        {/* Pipeline Metrics Section */}
        <Accordion 
          expanded={expanded.pipeline} 
          onChange={handleAccordionChange('pipeline')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="pipeline-metrics-content"
            id="pipeline-metrics-header"
          >
            <Typography variant="h6">Pipeline Metrics</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Open Opportunities
                    </Typography>
                    <Typography variant="h3" color="primary">
                      {pipelineData.opportunities}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {formatPercentage((pipelineData.opportunities / pipelineData.opportunitiesGoal) * 100)} of goal
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Conversion Rate
                    </Typography>
                    <Typography variant="h3" color="secondary">
                      {formatPercentage(pipelineData.conversionRate)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Goal: {formatPercentage(pipelineData.conversionGoal)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Avg. Deal Size
                    </Typography>
                    <Typography variant="h3" color="primary">
                      {formatCurrency(pipelineData.avgDealSize)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Goal: {formatCurrency(pipelineData.avgDealSizeGoal)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Pipeline by Stage
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pipelineData.stages}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pipelineData.stages.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
        
        {/* Customer Metrics Section */}
        <Accordion 
          expanded={expanded.customers} 
          onChange={handleAccordionChange('customers')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="customer-metrics-content"
            id="customer-metrics-header"
          >
            <Typography variant="h6">Customer Metrics</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      New Logos
                    </Typography>
                    <Typography variant="h3" color="primary">
                      {customerData.newLogos}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Goal: {customerData.newLogosGoal}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Customer Retention
                    </Typography>
                    <Typography variant="h3" color="secondary">
                      {formatPercentage(customerData.retention)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Goal: {formatPercentage(customerData.retentionGoal)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Net Promoter Score
                    </Typography>
                    <Typography variant="h3" color="primary">
                      {customerData.nps}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Goal: {customerData.npsGoal}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
        
        {/* Activity Metrics Section */}
        <Accordion 
          expanded={expanded.activity} 
          onChange={handleAccordionChange('activity')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="activity-metrics-content"
            id="activity-metrics-header"
          >
            <Typography variant="h6">Activity Metrics</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Meetings Set
                    </Typography>
                    <Typography variant="h3" color="primary">
                      {activityData.meetings}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Goal: {activityData.meetingsGoal}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Calls Made
                    </Typography>
                    <Typography variant="h3" color="secondary">
                      {activityData.calls}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Goal: {activityData.callsGoal}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Emails Sent
                    </Typography>
                    <Typography variant="h3" color="primary">
                      {activityData.emails}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Goal: {activityData.emailsGoal}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
        
        {/* Charts Section */}
        <Accordion 
          expanded={expanded.charts} 
          onChange={handleAccordionChange('charts')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="charts-content"
            id="charts-header"
          >
            <Typography variant="h6">Performance Charts</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {/* Monthly Sales Chart */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Monthly Sales Performance
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={salesData.monthlyData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="sales" name="Sales" fill="#8884d8" />
                      <Bar dataKey="target" name="Monthly Target" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              {/* YTD Trend Chart */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    YTD Sales Trend
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={salesData.monthlyData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="cumulativeSales" 
                        name="Cumulative Sales" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="cumulativeTarget" 
                        name="Cumulative Target" 
                        stroke="#82ca9d" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Box>
    </>
  );
};

export default SalesDashboard;
