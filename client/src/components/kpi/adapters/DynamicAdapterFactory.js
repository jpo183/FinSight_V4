import React from 'react';
import { Grid, Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import { 
  BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, 
  Pie as RechartsPie, Cell as RechartsCell, XAxis, YAxis, 
  CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from 'recharts';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Helper function to format values based on format type
const formatValue = (value, format) => {
  if (!value && value !== 0) return 'N/A';
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(value);
    
    case 'percentage':
      return `${value.toFixed(1)}%`;
    
    case 'number':
      return new Intl.NumberFormat('en-US').format(value);
    
    default:
      return value.toString();
  }
};

// Helper function to get section title
const getSectionTitle = (sectionId) => {
  const titles = {
    revenue: 'Revenue Metrics',
    pipeline: 'Pipeline Metrics',
    customers: 'Customer Metrics',
    activity: 'Activity Metrics'
  };
  return titles[sectionId] || sectionId;
};

// Metric Card Component
const MetricCard = ({ title, value, target, format, progress, status }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h3" color="primary">
        {formatValue(value, format)}
      </Typography>
      {target && (
        <Typography variant="body2" color="textSecondary">
          Target: {formatValue(target, format)}
        </Typography>
      )}
      {progress !== undefined && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(progress, 100)} 
              color={status === 'positive' ? "success" : "primary"}
            />
          </Box>
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="textSecondary">
              {`${progress.toFixed(1)}%`}
            </Typography>
          </Box>
        </Box>
      )}
    </CardContent>
  </Card>
);

// Chart rendering function
const renderChart = (type, data, dataKeys) => {
  switch (type) {
    case 'barChart':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            {dataKeys.map((key, index) => (
              <Bar key={key} dataKey={key} fill={COLORS[index % COLORS.length]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    
    case 'lineChart':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            {dataKeys.map((key, index) => (
              <Line 
                key={key} 
                type="monotone" 
                dataKey={key} 
                stroke={COLORS[index % COLORS.length]} 
                activeDot={{ r: 8 }} 
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    
    case 'pieChart':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <RechartsPie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <RechartsCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </RechartsPie>
            <Legend />
          </RechartsPieChart>
        </ResponsiveContainer>
      );
    
    default:
      return <div>Unsupported chart type</div>;
  }
};

// Create a dynamic domain adapter based on KPI configurations
const createDynamicAdapter = (domain, kpiConfigs) => {
  console.log('Creating dynamic adapter for domain:', domain);
  console.log('KPI configs received:', kpiConfigs);
  
  // Filter KPIs by domain and those that should be shown on dashboard
  const dashboardKpis = kpiConfigs.filter(kpi => 
    kpi.domain === domain && kpi.dashboardSection !== 'none'
  );
  
  console.log('KPIs filtered for dashboard:', dashboardKpis);
  
  // Group KPIs by section
  const kpisBySection = {};
  dashboardKpis.forEach(kpi => {
    if (!kpisBySection[kpi.dashboardSection]) {
      kpisBySection[kpi.dashboardSection] = [];
    }
    kpisBySection[kpi.dashboardSection].push(kpi);
  });
  
  console.log('KPIs grouped by section:', kpisBySection);
  
  // Find primary metric
  const primaryMetric = dashboardKpis.find(kpi => kpi.isPrimaryMetric) || dashboardKpis[0];
  console.log('Primary metric:', primaryMetric);
  
  // Create chart configurations
  const chartConfigs = kpiConfigs
    .filter(kpi => kpi.visualizationType && ['barChart', 'lineChart', 'pieChart'].includes(kpi.visualizationType))
    .map(kpi => ({
      id: kpi.id,
      name: kpi.name,
      type: kpi.visualizationType,
      dataKeys: ['current', 'target'] // Default data keys
    }));
  
  return {
    // Basic adapter properties
    dashboardTitle: `${domain} Dashboard`,
    
    // Primary metric methods
    getPrimaryMetricName: (timeRangeView, selectedPeriod) => {
      if (!primaryMetric) return `${domain} Performance`;
      
      if (timeRangeView === 'annual') return `Annual ${primaryMetric.name}`;
      if (timeRangeView === 'quarterly') return `${selectedPeriod.quarter} ${primaryMetric.name}`;
      return `${selectedPeriod.month} ${primaryMetric.name}`;
    },
    
    formatPrimaryMetric: (value) => {
      if (!primaryMetric) return value.toString();
      return formatValue(value, primaryMetric.format);
    },
    
    // Table configuration
    tableHeaders: [
      { id: 'metric', label: 'Metric', align: 'left' },
      { id: 'current', label: 'Current', align: 'right', format: 'dynamic' },
      { id: 'target', label: 'Target', align: 'right', format: 'dynamic' },
      { id: 'progress', label: 'Progress', align: 'right', format: 'percentage' },
      { id: 'status', label: 'Status', align: 'center' }
    ],
    
    getTableRows: (data) => {
      return kpiConfigs
        .filter(kpi => kpi.showInTable)
        .map(kpi => ({
          metric: kpi.name,
          current: data[kpi.id]?.current || 0,
          target: data[kpi.id]?.target || 0,
          progress: data[kpi.id]?.progress || 0,
          status: data[kpi.id]?.status || 'neutral',
          format: kpi.format // Pass the format for dynamic formatting
        }));
    },
    
    formatTableCell: (value, format, row) => {
      if (format === 'dynamic' && row && row.format) {
        return formatValue(value, row.format);
      }
      return formatValue(value, format);
    },
    
    // Data filtering
    filterDataByTimeRange: (data, timeRangeView, selectedPeriod) => {
      if (!data) return {
        primaryMetric: {
          current: 0,
          target: 0,
          progress: 0,
          yearProgress: 0,
          relativeProgress: 0
        }
      };
      
      // Calculate year progress percentage
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const yearProgress = ((now - startOfYear) / (1000 * 60 * 60 * 24)) / 365 * 100;
      
      // Get primary metric data
      let primaryMetricData = { current: 0, target: 0 };
      if (primaryMetric && data[primaryMetric.id]) {
        primaryMetricData = data[primaryMetric.id];
      }
      
      // Calculate progress
      const progress = primaryMetricData.target ? 
        (primaryMetricData.current / primaryMetricData.target) * 100 : 0;
      
      // Calculate relative progress
      const relativeProgress = timeRangeView === 'annual' ? 
        (progress / yearProgress) : (progress / 100);
      
      return {
        ...data,
        primaryMetric: {
          current: primaryMetricData.current,
          target: primaryMetricData.target,
          progress: progress,
          yearProgress: timeRangeView === 'annual' ? yearProgress : 100,
          relativeProgress: relativeProgress
        }
      };
    },
    
    // Generate sections from KPI configurations
    sections: Object.keys(kpisBySection).map(sectionId => ({
      id: sectionId,
      title: getSectionTitle(sectionId),
      getContent: (data, timeRangeView, selectedPeriod) => (
        <Grid container spacing={3}>
          {kpisBySection[sectionId]
            .filter(kpi => kpi.visualizationType === 'card' || kpi.visualizationType === 'none')
            .map(kpi => (
              <Grid item xs={12} md={4} key={kpi.id}>
                <MetricCard 
                  title={kpi.name}
                  value={data[kpi.id]?.current || 0}
                  target={data[kpi.id]?.target || 0}
                  format={kpi.format}
                  progress={data[kpi.id]?.progress || 0}
                  status={data[kpi.id]?.status || 'neutral'}
                />
              </Grid>
            ))}
        </Grid>
      )
    })),
    
    // Generate charts from chart configurations
    charts: chartConfigs.map(chart => ({
      id: chart.id,
      getTitle: (timeRangeView, selectedPeriod) => {
        const kpi = kpiConfigs.find(k => k.id === chart.id);
        if (!kpi) return chart.name;
        
        if (timeRangeView === 'annual') return `Annual ${kpi.name}`;
        if (timeRangeView === 'quarterly') return `${selectedPeriod.quarter} ${kpi.name}`;
        return `${selectedPeriod.month} ${kpi.name}`;
      },
      render: (data, timeRangeView, selectedPeriod) => {
        const kpi = kpiConfigs.find(k => k.id === chart.id);
        if (!kpi || !data[kpi.id]?.chartData) {
          return <Typography>No data available</Typography>;
        }
        
        return renderChart(
          chart.type, 
          data[kpi.id].chartData, 
          chart.dataKeys
        );
      }
    }))
  };
};

export default createDynamicAdapter; 