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
  TextField
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

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
      trendData: [5, 10, 5, 20, 8, 15, 25]
    },
    { 
      id: 2, 
      name: 'Upsells', 
      category: 'Revenue',
      value: 450000, 
      goal: 600000, 
      unit: 'currency',
      trend: 'up',
      trendData: [10, 15, 13, 20, 22, 25, 30]
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
    timeRange: 'ytd',
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
          }
          return updatedSummary;
        });
        
        // Calculate progress percentage
        const targetValue = salesGoal.targetValue;
        const currentValue = data.ytdTotal;
        
        // Calculate what percentage of the year has elapsed
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31);
        const yearProgress = (now - startOfYear) / (endOfYear - startOfYear);
        
        // Calculate what percentage of the goal has been achieved
        const achievedPercentage = (currentValue / targetValue) * 100;
        
        // Calculate progress relative to time elapsed
        const relativeProgress = achievedPercentage / (yearProgress * 100);
        
        setProgress({
          achieved: achievedPercentage,
          yearProgress: yearProgress * 100,
          relativeProgress: relativeProgress
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Format value based on unit type
  const formatValue = (value, unit) => {
    switch (unit) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatPercentage(value);
      default:
        return value.toString();
    }
  };
  
  // Get trend icon based on trend direction
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon sx={{ color: 'success.main' }} />;
      case 'down':
        return <TrendingDownIcon sx={{ color: 'error.main' }} />;
      default:
        return <TrendingFlatIcon sx={{ color: 'info.main' }} />;
    }
  };
  
  // Calculate percentage of goal
  const calculatePercentage = (value, goal) => {
    return (value / goal) * 100;
  };

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
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="time-range-label">Time Range</InputLabel>
                  <Select
                    labelId="time-range-label"
                    id="time-range"
                    name="timeRange"
                    value={filters.timeRange}
                    label="Time Range"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="ytd">Year to Date</MenuItem>
                    <MenuItem value="q1">Q1</MenuItem>
                    <MenuItem value="q2">Q2</MenuItem>
                    <MenuItem value="q3">Q3</MenuItem>
                    <MenuItem value="q4">Q4</MenuItem>
                    <MenuItem value="custom">Custom</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
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
              <Grid item xs={12} sm={4}>
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
                    <MenuItem value="productA">Product A</MenuItem>
                    <MenuItem value="productB">Product B</MenuItem>
                    <MenuItem value="productC">Product C</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        )}
        
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
              {kpiSummary.map((kpi) => {
                const percentOfGoal = calculatePercentage(kpi.value, kpi.goal);
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
                    <TableCell align="right">{formatValue(kpi.value, kpi.unit)}</TableCell>
                    <TableCell align="right">{formatValue(kpi.goal, kpi.unit)}</TableCell>
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
              })}
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
