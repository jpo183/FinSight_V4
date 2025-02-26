import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Paper,
  Button,
  Breadcrumbs
} from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';

// Import our KPI management components
import GoalSettingForm from '../../components/kpi/goals/GoalSettingForm';
import goalService from '../../services/kpi/goalService';
import kpiService from '../../services/kpi/kpiService';

const KpiManagementPage = () => {
  const [tabValue, setTabValue] = useState(0);
  
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {/* Navigation breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link 
            to="/" 
            style={{ 
              display: 'flex', 
              alignItems: 'center',
              color: 'inherit',
              textDecoration: 'none'
            }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          <Link
            to="/sales/dashboard"
            style={{ 
              display: 'flex', 
              alignItems: 'center',
              color: 'inherit',
              textDecoration: 'none'
            }}
          >
            <DashboardIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Sales Dashboard
          </Link>
          <Typography
            sx={{ display: 'flex', alignItems: 'center' }}
            color="text.primary"
          >
            KPI Management
          </Typography>
        </Breadcrumbs>
        
        {/* Navigation buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button 
            component={Link} 
            to="/"
            variant="outlined"
            startIcon={<HomeIcon />}
          >
            Main Menu
          </Button>
          <Button 
            component={Link} 
            to="/sales/dashboard" 
            variant="contained"
            startIcon={<DashboardIcon />}
          >
            Sales Dashboard
          </Button>
        </Box>
        
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
          <Box>
            <Typography variant="h6" gutterBottom>
              Define New KPIs
            </Typography>
            <Typography>
              KPI definition form would go here
            </Typography>
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
  );
};

export default KpiManagementPage; 