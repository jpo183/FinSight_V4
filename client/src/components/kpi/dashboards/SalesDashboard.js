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
import salesService from '../../components/kpi/services/salesService';
import TemplateDashboard from '../../components/kpi/dashboards/TemplateDashboard';
import createDynamicAdapter from '../../components/kpi/adapters/DynamicAdapterFactory';
import { fetchKPIs } from '../services/kpiService';
import { fetchSalesData } from '../services/salesService';

const SalesDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [adapter, setAdapter] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const initDashboard = async () => {
      try {
        // Fetch KPI configurations for Sales domain
        const kpiConfigs = await kpiService.getDomainKpis('Sales');
        
        // Fetch sales data using the salesService
        const salesData = await salesService.fetchSalesData();
        
        // Create dynamic adapter
        const dynamicAdapter = createDynamicAdapter('Sales', kpiConfigs);
        
        setAdapter(dynamicAdapter);
        setData(salesData);
      } catch (error) {
        console.error('Error initializing dashboard:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    initDashboard();
  }, []);
  
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