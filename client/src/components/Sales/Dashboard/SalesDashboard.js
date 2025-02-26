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

  // Add state for period-specific metrics
  const [currentMetrics, setCurrentMetrics] = useState({
    pipeline: {},
    customer: {},
    activity: {}
  });

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

  // Update metrics based on selected time range
  useEffect(() => {
    console.log('Updating metrics for time range:', timeRangeView);
    
    // Define period-specific metrics
    const pipelineMetrics = {
      annual: {
        opportunities: 45,
        opportunitiesGoal: 60,
        conversionRate: 28,
        conversionGoal: 35,
        avgDealSize: 55000,
        avgDealSizeGoal: 60000,
        stages: [
          { name: 'Prospecting', value: 25 },
          { name: 'Qualification', value: 20 },
          { name: 'Proposal', value: 30 },
          { name: 'Negotiation', value: 15 },
          { name: 'Closing', value: 10 }
        ]
      },
      quarterly: {
        'Q1': {
          opportunities: 12,
          opportunitiesGoal: 15,
          conversionRate: 26,
          conversionGoal: 35,
          avgDealSize: 52000,
          avgDealSizeGoal: 60000,
          stages: [
            { name: 'Prospecting', value: 30 },
            { name: 'Qualification', value: 25 },
            { name: 'Proposal', value: 25 },
            { name: 'Negotiation', value: 10 },
            { name: 'Closing', value: 10 }
          ]
        },
        'Q2': {
          opportunities: 15,
          opportunitiesGoal: 15,
          conversionRate: 30,
          conversionGoal: 35,
          avgDealSize: 58000,
          avgDealSizeGoal: 60000,
          stages: [
            { name: 'Prospecting', value: 20 },
            { name: 'Qualification', value: 20 },
            { name: 'Proposal', value: 30 },
            { name: 'Negotiation', value: 20 },
            { name: 'Closing', value: 10 }
          ]
        },
        'Q3': {
          opportunities: 10,
          opportunitiesGoal: 15,
          conversionRate: 25,
          conversionGoal: 35,
          avgDealSize: 53000,
          avgDealSizeGoal: 60000,
          stages: [
            { name: 'Prospecting', value: 35 },
            { name: 'Qualification', value: 25 },
            { name: 'Proposal', value: 20 },
            { name: 'Negotiation', value: 10 },
            { name: 'Closing', value: 10 }
          ]
        },
        'Q4': {
          opportunities: 8,
          opportunitiesGoal: 15,
          conversionRate: 32,
          conversionGoal: 35,
          avgDealSize: 60000,
          avgDealSizeGoal: 60000,
          stages: [
            { name: 'Prospecting', value: 15 },
            { name: 'Qualification', value: 15 },
            { name: 'Proposal', value: 30 },
            { name: 'Negotiation', value: 25 },
            { name: 'Closing', value: 15 }
          ]
        }
      },
      monthly: {
        'July': {
          opportunities: 3,
          opportunitiesGoal: 5,
          conversionRate: 24,
          conversionGoal: 35,
          avgDealSize: 51000,
          avgDealSizeGoal: 60000,
          stages: [
            { name: 'Prospecting', value: 40 },
            { name: 'Qualification', value: 30 },
            { name: 'Proposal', value: 15 },
            { name: 'Negotiation', value: 10 },
            { name: 'Closing', value: 5 }
          ]
        }
      }
    };
    
    const customerMetrics = {
      annual: {
        newLogos: 12,
        newLogosGoal: 20,
        retention: 92,
        retentionGoal: 95,
        nps: 68,
        npsGoal: 75
      },
      quarterly: {
        'Q1': {
          newLogos: 3,
          newLogosGoal: 5,
          retention: 91,
          retentionGoal: 95,
          nps: 65,
          npsGoal: 75
        },
        'Q2': {
          newLogos: 4,
          newLogosGoal: 5,
          retention: 93,
          retentionGoal: 95,
          nps: 70,
          npsGoal: 75
        },
        'Q3': {
          newLogos: 3,
          newLogosGoal: 5,
          retention: 92,
          retentionGoal: 95,
          nps: 68,
          npsGoal: 75
        },
        'Q4': {
          newLogos: 2,
          newLogosGoal: 5,
          retention: 94,
          retentionGoal: 95,
          nps: 72,
          npsGoal: 75
        }
      },
      monthly: {
        'July': {
          newLogos: 1,
          newLogosGoal: 2,
          retention: 92,
          retentionGoal: 95,
          nps: 67,
          npsGoal: 75
        }
      }
    };
    
    const activityMetrics = {
      annual: {
        meetings: 85,
        meetingsGoal: 100,
        calls: 320,
        callsGoal: 400,
        emails: 1250,
        emailsGoal: 1500
      },
      quarterly: {
        'Q1': {
          meetings: 22,
          meetingsGoal: 25,
          calls: 80,
          callsGoal: 100,
          emails: 320,
          emailsGoal: 375
        },
        'Q2': {
          meetings: 25,
          meetingsGoal: 25,
          calls: 95,
          callsGoal: 100,
          emails: 350,
          emailsGoal: 375
        },
        'Q3': {
          meetings: 20,
          meetingsGoal: 25,
          calls: 75,
          callsGoal: 100,
          emails: 300,
          emailsGoal: 375
        },
        'Q4': {
          meetings: 18,
          meetingsGoal: 25,
          calls: 70,
          callsGoal: 100,
          emails: 280,
          emailsGoal: 375
        }
      },
      monthly: {
        'July': {
          meetings: 6,
          meetingsGoal: 8,
          calls: 25,
          callsGoal: 33,
          emails: 100,
          emailsGoal: 125
        }
      }
    };
    
    // Set the current metrics based on the selected time range
    let pipelineData, customerData, activityData;
    
    if (timeRangeView === 'annual') {
      pipelineData = pipelineMetrics.annual;
      customerData = customerMetrics.annual;
      activityData = activityMetrics.annual;
    } else if (timeRangeView === 'quarterly') {
      pipelineData = pipelineMetrics.quarterly[selectedPeriod.quarter] || pipelineMetrics.annual;
      customerData = customerMetrics.quarterly[selectedPeriod.quarter] || customerMetrics.annual;
      activityData = activityMetrics.quarterly[selectedPeriod.quarter] || activityMetrics.annual;
    } else if (timeRangeView === 'monthly') {
      pipelineData = pipelineMetrics.monthly[selectedPeriod.month] || pipelineMetrics.annual;
      customerData = customerMetrics.monthly[selectedPeriod.month] || customerMetrics.annual;
      activityData = activityMetrics.monthly[selectedPeriod.month] || activityMetrics.annual;
    }
    
    console.log('Setting metrics for', timeRangeView, ':', {
      pipeline: pipelineData,
      customer: customerData,
      activity: activityData
    });
    
    setCurrentMetrics({
      pipeline: pipelineData,
      customer: customerData,
      activity: activityData
    });
  }, [timeRangeView, selectedPeriod]);

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

  // Get chart data based on the selected time range
  const getChartData = () => {
    console.log('getChartData called with timeRangeView:', timeRangeView);
    console.log('selectedPeriod:', selectedPeriod);
    console.log('salesData available:', !!salesData);
    
    if (!salesData) {
      console.log('No salesData available');
      return [];
    }
    
    if (timeRangeView === 'annual') {
      console.log('Returning annual data:', salesData.monthlyData);
      // Return monthly data for the whole year
      return salesData.monthlyData;
    } else if (timeRangeView === 'quarterly') {
      // Filter monthly data for the selected quarter
      const quarterMonths = {
        'Q1': ['January', 'February', 'March'],
        'Q2': ['April', 'May', 'June'],
        'Q3': ['July', 'August', 'September'],
        'Q4': ['October', 'November', 'December']
      };
      
      const filteredData = salesData.monthlyData.filter(item => 
        quarterMonths[selectedPeriod.quarter].includes(item.month)
      );
      console.log('Returning quarterly data for', selectedPeriod.quarter, ':', filteredData);
      return filteredData;
    } else if (timeRangeView === 'monthly') {
      // Return weekly data for the selected month
      console.log('Selected month:', selectedPeriod.month);
      
      // This would normally come from your API, but we'll mock it here
      const weeklyData = [
        { week: 'Week 1', sales: 42000, target: 45000, cumulativeSales: 42000, cumulativeTarget: 45000 },
        { week: 'Week 2', sales: 45000, target: 45000, cumulativeSales: 87000, cumulativeTarget: 90000 },
        { week: 'Week 3', sales: 46000, target: 45000, cumulativeSales: 133000, cumulativeTarget: 135000 },
        { week: 'Week 4', sales: 47000, target: 45000, cumulativeSales: 180000, cumulativeTarget: 180000 }
      ];
      
      console.log('Returning weekly data:', weeklyData);
      return weeklyData;
    }
    
    console.log('No matching time range view, returning empty array');
    return [];
  };
  
  // Get the appropriate X-axis key based on time range
  const getXAxisDataKey = () => {
    if (timeRangeView === 'monthly') {
      return 'week';
    }
    return 'month';
  };
  
  // Get chart title based on selected time range
  const getChartTitle = () => {
    if (timeRangeView === 'annual') {
      return 'Monthly Sales Performance';
    } else if (timeRangeView === 'quarterly') {
      return `${selectedPeriod.quarter} Sales Performance`;
    } else {
      return `${selectedPeriod.month} Weekly Sales Performance`;
    }
  };
  
  // Get trend chart title based on selected time range
  const getTrendChartTitle = () => {
    if (timeRangeView === 'annual') {
      return 'YTD Sales Trend';
    } else if (timeRangeView === 'quarterly') {
      return `${selectedPeriod.quarter} Cumulative Sales`;
    } else {
      return `${selectedPeriod.month} Cumulative Weekly Sales`;
    }
  };

  // Add effect to log when time range changes
  useEffect(() => {
    console.log('Time range changed to:', timeRangeView);
    console.log('Selected period:', selectedPeriod);
  }, [timeRangeView, selectedPeriod]);

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
                      {currentMetrics.pipeline.opportunities}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {formatPercentage((currentMetrics.pipeline.opportunities / currentMetrics.pipeline.opportunitiesGoal) * 100)} of goal
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
                      {formatPercentage(currentMetrics.pipeline.conversionRate)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Goal: {formatPercentage(currentMetrics.pipeline.conversionGoal)}
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
                      {formatCurrency(currentMetrics.pipeline.avgDealSize)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Goal: {formatCurrency(currentMetrics.pipeline.avgDealSizeGoal)}
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
                          data={currentMetrics.pipeline.stages}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {currentMetrics.pipeline.stages && currentMetrics.pipeline.stages.map((entry, index) => (
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
                      {currentMetrics.customer.newLogos}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Goal: {currentMetrics.customer.newLogosGoal}
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
                      {formatPercentage(currentMetrics.customer.retention)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Goal: {formatPercentage(currentMetrics.customer.retentionGoal)}
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
                      {currentMetrics.customer.nps}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Goal: {currentMetrics.customer.npsGoal}
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
                      {currentMetrics.activity.meetings}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Goal: {currentMetrics.activity.meetingsGoal}
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
                      {currentMetrics.activity.calls}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Goal: {currentMetrics.activity.callsGoal}
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
                      {currentMetrics.activity.emails}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Goal: {currentMetrics.activity.emailsGoal}
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
          key={`charts-${timeRangeView}-${selectedPeriod.quarter}-${selectedPeriod.month}`}
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
              {/* Sales Performance Chart */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    {getChartTitle()}
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    {console.log('Rendering bar chart with data:', getChartData())}
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getChartData()}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={getXAxisDataKey()} />
                        <YAxis />
                        <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="sales" name="Sales" fill="#8884d8" />
                        <Bar dataKey="target" name="Target" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
              
              {/* Trend Chart */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    {getTrendChartTitle()}
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    {console.log('Rendering line chart with data:', getChartData())}
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={getChartData()}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={getXAxisDataKey()} />
                        <YAxis />
                        <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey={timeRangeView === 'monthly' ? 'sales' : 'cumulativeSales'} 
                          name="Cumulative Sales" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey={timeRangeView === 'monthly' ? 'target' : 'cumulativeTarget'} 
                          name="Cumulative Target" 
                          stroke="#82ca9d" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
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
