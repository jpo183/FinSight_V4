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
  Button
} from '@mui/material';
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
  Line
} from 'recharts';
import { Link } from 'react-router-dom';

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

const SalesDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [progress, setProgress] = useState({
    achieved: 0,
    yearProgress: 0,
    relativeProgress: 0
  });

  // Mock goal for now - this would come from your KPI system later
  const salesGoal = {
    year: 2025,
    targetValue: 2500000,
    name: 'Annual Sales Target'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current sales data from our service
        const data = await salesDataService.getCurrentYearSales();
        setSalesData(data);
        
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, bgcolor: 'error.light' }}>
          <Typography variant="h6" color="error">
            Error Loading Dashboard
          </Typography>
          <Typography>{error}</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Sales Performance Dashboard</Typography>
        <Button 
          component={Link} 
          to="/sales/kpi/manage" 
          variant="contained" 
          color="primary"
        >
          Manage KPIs & Goals
        </Button>
      </Box>
      
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
                <Tooltip formatter={(value) => formatCurrency(value)} />
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
                <Tooltip formatter={(value) => formatCurrency(value)} />
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
    </Box>
  );
};

export default SalesDashboard;
