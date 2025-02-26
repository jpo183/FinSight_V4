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
  Divider
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

import goalService from '../../../services/kpi/goalService';
import kpiService from '../../../services/kpi/kpiService';

// This would be replaced with your actual sales data service
import salesDataService from '../../../services/salesDataService';

const SalesDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesKpi, setSalesKpi] = useState(null);
  const [salesGoal, setSalesGoal] = useState(null);
  const [currentSales, setCurrentSales] = useState(null);
  const [monthlySales, setMonthlySales] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Get the Sales KPI definition
        const kpiDefinitions = await kpiService.getKpiDefinitions({ domain: 'Sales' });
        const totalSalesKpi = kpiDefinitions.find(kpi => kpi.name === 'Total Annual Sales');
        setSalesKpi(totalSalesKpi);
        
        if (!totalSalesKpi) {
          throw new Error('Sales KPI not found');
        }
        
        // 2. Get the 2025 Sales Goal
        const goals = await goalService.getGoals({
          kpi_id: totalSalesKpi.kpi_id,
          entity_type: 'department',
          time_period: 'yearly'
        });
        
        const salesGoal2025 = goals.find(goal => 
          new Date(goal.end_date).getFullYear() === 2025
        );
        
        setSalesGoal(salesGoal2025);
        
        if (!salesGoal2025) {
          throw new Error('2025 Sales Goal not found');
        }
        
        // 3. Get current YTD sales data
        // This would be replaced with your actual sales data service
        const salesData = await salesDataService.getCurrentYearSales();
        setCurrentSales(salesData.ytdTotal);
        setMonthlySales(salesData.monthlyData);
        
        // 4. Calculate progress percentage
        const targetValue = parseFloat(salesGoal2025.target_value);
        const currentValue = parseFloat(salesData.ytdTotal);
        
        // Calculate what percentage of the year has elapsed
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31);
        const yearProgress = (now - startOfYear) / (endOfYear - startOfYear);
        
        // Calculate what percentage of the goal has been achieved
        const achievedPercentage = (currentValue / targetValue) * 100;
        
        // Calculate progress relative to time elapsed
        // If we're at 25% of the year but have achieved 30% of the goal, we're ahead
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
      <Paper sx={{ p: 3, bgcolor: 'error.light' }}>
        <Typography color="error">Error: {error}</Typography>
      </Paper>
    );
  }

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Sales Department Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Annual Sales Goal Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                2025 Annual Sales Goal
              </Typography>
              <Typography variant="h3" color="primary">
                {formatCurrency(salesGoal.target_value)}
              </Typography>
              {salesGoal.stretch_target && (
                <Typography variant="body2" color="textSecondary">
                  Stretch Goal: {formatCurrency(salesGoal.stretch_target)}
                </Typography>
              )}
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
                {formatCurrency(currentSales)}
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
                data={monthlySales}
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
                data={monthlySales}
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