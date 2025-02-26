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
        
        // Generate predictable test data for each KPI
        const mockData = {};
        kpiConfigs.forEach((kpi, index) => {
          // Use the KPI ID to generate predictable values
          const kpiId = kpi.id;
          const baseValue = 100000 + (index * 10000); // Increases by 10k for each KPI
          const baseTarget = baseValue * 1.2; // Always 20% higher than value
          
          // Generate weekly data (last 12 weeks)
          const weeklyData = Array(12).fill().map((_, i) => {
            // Weekly values with some variation
            const weekFactor = 0.8 + (Math.sin(i / 6 * Math.PI) * 0.3); // Creates a wave pattern
            return {
              name: `Week ${i+1}`,
              value: Math.floor((baseValue / 52) * weekFactor * 4), // 4 weeks worth of value
              target: Math.floor((baseTarget / 52) * weekFactor * 4) // 4 weeks worth of target
            };
          });
          
          // Generate monthly data (12 months)
          const monthlyData = Array(12).fill().map((_, i) => {
            // Monthly values with seasonal variation
            const monthFactor = 0.7 + (Math.sin((i / 11) * Math.PI) * 0.4); // Creates a seasonal pattern
            return {
              name: `Month ${i+1}`,
              value: Math.floor((baseValue / 12) * monthFactor),
              target: Math.floor((baseTarget / 12) * monthFactor)
            };
          });
          
          // Generate quarterly data (4 quarters)
          const quarterlyData = Array(4).fill().map((_, i) => {
            // Quarterly values with some variation
            const quarterFactor = 0.9 + (Math.sin(i / 2 * Math.PI) * 0.2); // Creates a wave pattern
            return {
              name: `Q${i+1}`,
              value: Math.floor((baseValue / 4) * quarterFactor),
              target: Math.floor((baseTarget / 4) * quarterFactor)
            };
          });
          
          // Generate yearly data (3 years)
          const yearlyData = Array(3).fill().map((_, i) => {
            // Yearly values with growth trend
            const yearFactor = 0.8 + (i * 0.1); // Each year grows by 10%
            return {
              name: `${new Date().getFullYear() - 2 + i}`,
              value: Math.floor(baseValue * yearFactor),
              target: Math.floor(baseTarget * yearFactor)
            };
          });
          
          mockData[kpiId] = {
            current: baseValue,
            target: baseTarget,
            progress: 80, // Fixed at 80% for all KPIs
            status: 'neutral',
            chartData: monthlyData, // Default to monthly data
            weeklyData: weeklyData,
            monthlyData: monthlyData,
            quarterlyData: quarterlyData,
            yearlyData: yearlyData,
            // Add a flag to indicate this is test data
            isTestData: true
          };
        });
        
        console.log('Generated test data:', mockData);
        
        // Create dynamic adapter
        console.log('Creating dynamic adapter...');
        const dynamicAdapter = createDynamicAdapter('Sales', kpiConfigs);
        console.log('Dynamic Adapter:', dynamicAdapter);
        
        setAdapter(dynamicAdapter);
        setData(mockData);
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