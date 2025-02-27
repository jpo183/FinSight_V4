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

// This import path is incorrect - it has 'components' twice
// Change from:
// import salesService from '../../components/kpi/services/salesService';
// To:
import salesService from '../services/salesService';

import TemplateDashboard from './TemplateDashboard';
import createDynamicAdapter from '../adapters/DynamicAdapterFactory';

// These imports are fine
// import { fetchKPIs } from '../services/kpiService';
// import { fetchSalesData } from '../services/salesService';

const SalesDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [adapter, setAdapter] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const initDashboard = async () => {
      try {
        console.log('Initializing Sales Dashboard');
        
        // Fetch KPI configurations from localStorage
        const storedKpis = localStorage.getItem('salesKpis');
        console.log('Raw KPIs from localStorage:', storedKpis);
        
        const kpiConfigs = storedKpis ? JSON.parse(storedKpis) : [];
        console.log('Parsed KPI Configs:', kpiConfigs);
        
        // Fetch goals from localStorage (or would be from API in production)
        const storedGoals = localStorage.getItem('salesGoals');
        const goals = storedGoals ? JSON.parse(storedGoals) : [];
        console.log('Goals loaded:', goals);
        
        // Initialize empty data structure
        const dashboardData = {};
        
        // Fetch real data for each KPI
        for (const kpi of kpiConfigs) {
          try {
            // Use the salesDataService to fetch real data
            const kpiData = await salesService.getSalesData(kpi.id, 'monthly');
            
            // Find goal for this KPI if it exists
            const kpiGoal = goals.find(goal => goal.kpi_id === kpi.id && goal.status === 'active');
            const targetValue = kpiGoal ? parseFloat(kpiGoal.target_value) : null;
            
            // Calculate current value from the data
            const currentValue = kpiData.data.length > 0 ? 
              kpiData.data.reduce((sum, item) => sum + (item.value || 0), 0) : 0;
            
            // Calculate progress
            const progress = targetValue && targetValue > 0 ? 
              Math.round((currentValue / targetValue) * 100) : null;
            
            // Determine status based on progress
            let status = 'neutral';
            if (progress !== null) {
              status = progress >= 100 ? 'positive' : 
                      progress >= 80 ? 'neutral' : 'negative';
            }
            
            // Structure the data for the dashboard
            dashboardData[kpi.id] = {
              current: currentValue,
              target: targetValue,
              progress: progress,
              status: status,
              chartData: kpiData.data || [],
              weeklyData: [], // Will be populated when needed
              monthlyData: kpiData.data || [],
              quarterlyData: [], // Will be populated when needed
              yearlyData: [] // Will be populated when needed
            };
          } catch (kpiError) {
            console.error(`Error fetching data for KPI ${kpi.id}:`, kpiError);
            // Add empty data structure for this KPI
            dashboardData[kpi.id] = {
              current: 0,
              target: null,
              progress: null,
              status: 'neutral',
              chartData: [],
              weeklyData: [],
              monthlyData: [],
              quarterlyData: [],
              yearlyData: []
            };
          }
        }
        
        console.log('Fetched dashboard data:', dashboardData);
        
        // Create dynamic adapter
        console.log('Creating dynamic adapter...');
        const dynamicAdapter = createDynamicAdapter('Sales', kpiConfigs);
        console.log('Dynamic Adapter:', dynamicAdapter);
        
        setAdapter(dynamicAdapter);
        setData(dashboardData);
        console.log('Dashboard state updated');
      } catch (error) {
        console.error('Error initializing dashboard:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    initDashboard();
  }, []);
  
  if (adapter) {
    console.log('Adapter sections:', adapter.getSections());
    console.log('Adapter primary metric:', adapter.getPrimaryMetric());
    
    // Log each section's charts
    adapter.getSections().forEach(section => {
      console.log(`Section ${section.id} charts:`, adapter.getChartsForSection(section.id));
    });
  }
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="error">
          {error}
        </Typography>
      </Box>
    );
  }
  
  if (!data || !adapter) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="error">
          No data available. Please configure KPIs in the KPI Management page.
        </Typography>
      </Box>
    );
  }
  
  return (
    <TemplateDashboard 
      domainAdapter={adapter} 
      data={data} 
    />
  );
};

export default SalesDashboard; 