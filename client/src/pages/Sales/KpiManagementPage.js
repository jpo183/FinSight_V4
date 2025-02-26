import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Paper,
  Button,
  AppBar,
  Toolbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  FormHelperText,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Import our KPI management components
import GoalSettingForm from '../../components/kpi/goals/GoalSettingForm';
import goalService from '../../services/kpi/goalService';
import kpiService from '../../services/kpi/kpiService';

const KpiManagementPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();
  
  // State for KPI definition form
  const [kpi, setKpi] = useState({
    name: '',
    domain: 'Sales',
    description: '',
    data_type: 'currency',
    unit: 'USD',
    // Dashboard display settings
    dashboardSection: 'none',
    visualizationType: 'card',
    showInTable: true,
    isPrimaryMetric: false
  });
  
  // Mock data for initial testing
  const kpiDefinitions = [
    { kpi_id: 1, name: 'Total Annual Sales', domain: 'Sales', data_type: 'currency', unit: 'USD' },
    { kpi_id: 2, name: 'Average Deal Size', domain: 'Sales', data_type: 'currency', unit: 'USD' },
    { kpi_id: 3, name: 'Win Rate', domain: 'Sales', data_type: 'percentage', unit: '%' }
  ];
  
  const entities = [
    { id: 1, name: 'Sales Department', type: 'department' },
    { id: 1, name: 'North Region', type: 'team' },
    { id: 2, name: 'South Region', type: 'team' }
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleSubmitGoal = async (goalData) => {
    // In a real implementation, this would call the API
    console.log('Submitting goal:', goalData);
    // Mock implementation for testing
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ ...goalData, goal_id: Math.floor(Math.random() * 1000) });
      }, 500);
    });
  };

  // Handle KPI definition form changes
  const handleKpiChange = (field, value) => {
    setKpi({
      ...kpi,
      [field]: value
    });
  };

  // Handle KPI definition form submission
  const handleSubmitKpi = async (event) => {
    event.preventDefault();
    try {
      // In a real implementation, this would call the API
      console.log('Submitting KPI definition:', kpi);
      // Mock implementation for testing
      setTimeout(() => {
        alert('KPI definition saved successfully!');
        // Reset form
        setKpi({
          name: '',
          domain: 'Sales',
          description: '',
          data_type: 'currency',
          unit: 'USD',
          dashboardSection: 'none',
          visualizationType: 'card',
          showInTable: true,
          isPrimaryMetric: false
        });
      }, 500);
    } catch (error) {
      console.error('Error saving KPI definition:', error);
      alert('Error saving KPI definition. Please try again.');
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" onClick={() => navigate('/sales/dashboard')}>
            Back to Sales Dashboard
          </Button>
          <Button color="inherit" onClick={() => navigate('/dashboard')}>
            Back to Main
          </Button>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
            Sales KPI Management
          </Typography>
          
          <Paper sx={{ mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Set Goals" />
              <Tab label="Define KPIs" />
              <Tab label="View History" />
            </Tabs>
          </Paper>
          
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Create or Update Sales Goals
              </Typography>
              <GoalSettingForm 
                onSubmit={handleSubmitGoal}
                kpiDefinitions={kpiDefinitions}
                entities={entities}
              />
            </Box>
          )}
          
          {tabValue === 1 && (
            <Box component="form" onSubmit={handleSubmitKpi}>
              <Typography variant="h6" gutterBottom>
                Define New KPIs
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="KPI Name"
                    value={kpi.name}
                    onChange={(e) => handleKpiChange('name', e.target.value)}
                    margin="normal"
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={kpi.description}
                    onChange={(e) => handleKpiChange('description', e.target.value)}
                    margin="normal"
                    multiline
                    rows={3}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Domain</InputLabel>
                    <Select
                      value={kpi.domain}
                      onChange={(e) => handleKpiChange('domain', e.target.value)}
                    >
                      <MenuItem value="Sales">Sales</MenuItem>
                      <MenuItem value="Marketing">Marketing</MenuItem>
                      <MenuItem value="Support">Support</MenuItem>
                      <MenuItem value="Finance">Finance</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Data Type</InputLabel>
                    <Select
                      value={kpi.data_type}
                      onChange={(e) => handleKpiChange('data_type', e.target.value)}
                    >
                      <MenuItem value="currency">Currency</MenuItem>
                      <MenuItem value="percentage">Percentage</MenuItem>
                      <MenuItem value="number">Number</MenuItem>
                      <MenuItem value="text">Text</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Unit"
                    value={kpi.unit}
                    onChange={(e) => handleKpiChange('unit', e.target.value)}
                    margin="normal"
                    helperText="e.g., USD, %, units"
                  />
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 4 }} />
              
              <Typography variant="h6" gutterBottom>
                Dashboard Display Settings
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Dashboard Section</InputLabel>
                    <Select
                      value={kpi.dashboardSection}
                      onChange={(e) => handleKpiChange('dashboardSection', e.target.value)}
                    >
                      <MenuItem value="revenue">Revenue Metrics</MenuItem>
                      <MenuItem value="pipeline">Pipeline Metrics</MenuItem>
                      <MenuItem value="customers">Customer Metrics</MenuItem>
                      <MenuItem value="activity">Activity Metrics</MenuItem>
                      <MenuItem value="none">Don't Show on Dashboard</MenuItem>
                    </Select>
                    <FormHelperText>Select where this KPI should appear on the dashboard</FormHelperText>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Visualization Type</InputLabel>
                    <Select
                      value={kpi.visualizationType}
                      onChange={(e) => handleKpiChange('visualizationType', e.target.value)}
                    >
                      <MenuItem value="card">Metric Card</MenuItem>
                      <MenuItem value="barChart">Bar Chart</MenuItem>
                      <MenuItem value="lineChart">Line Chart</MenuItem>
                      <MenuItem value="pieChart">Pie Chart</MenuItem>
                      <MenuItem value="none">No Visualization</MenuItem>
                    </Select>
                    <FormHelperText>How should this KPI be visualized on the dashboard?</FormHelperText>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Show in Summary Table</InputLabel>
                    <Select
                      value={kpi.showInTable ? 'yes' : 'no'}
                      onChange={(e) => handleKpiChange('showInTable', e.target.value === 'yes')}
                    >
                      <MenuItem value="yes">Yes</MenuItem>
                      <MenuItem value="no">No</MenuItem>
                    </Select>
                    <FormHelperText>Should this KPI appear in the dashboard summary table?</FormHelperText>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Primary Dashboard Metric</InputLabel>
                    <Select
                      value={kpi.isPrimaryMetric ? 'yes' : 'no'}
                      onChange={(e) => handleKpiChange('isPrimaryMetric', e.target.value === 'yes')}
                    >
                      <MenuItem value="yes">Yes</MenuItem>
                      <MenuItem value="no">No</MenuItem>
                    </Select>
                    <FormHelperText>Is this the main KPI for the dashboard?</FormHelperText>
                  </FormControl>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  size="large"
                >
                  Save KPI Definition
                </Button>
              </Box>
            </Box>
          )}
          
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                KPI History and Performance
              </Typography>
              <Typography>
                Historical KPI data would go here
              </Typography>
            </Box>
          )}
        </Box>
      </Container>
    </>
  );
};

export default KpiManagementPage; 