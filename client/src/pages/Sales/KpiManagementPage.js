import React, { useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Button,
  AppBar,
  Toolbar,
  Grid,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import FlagIcon from '@mui/icons-material/Flag';
import HistoryIcon from '@mui/icons-material/History';
import InputIcon from '@mui/icons-material/Input';

const KpiManagementPage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log('KpiManagementPage mounted');
  }, []);
  
  const menuItems = [
    {
      title: 'Define KPIs',
      description: 'Create and manage KPI definitions',
      icon: <SettingsIcon fontSize="large" />,
      path: '/sales/kpi-definitions'
    },
    {
      title: 'Manage Goals',
      description: 'Set and edit goals for KPIs',
      icon: <FlagIcon fontSize="large" />,
      path: '/sales/goal-management'
    },
    {
      title: 'Enter KPI Values',
      description: 'Manually enter values for KPIs',
      icon: <InputIcon fontSize="large" />,
      path: '/sales/kpi-values'
    },
    {
      title: 'View History',
      description: 'View historical KPI data and performance',
      icon: <HistoryIcon fontSize="large" />,
      path: '/sales/kpi-history'
    }
  ];

  console.log('Rendering KpiManagementPage with menuItems:', menuItems);

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
          
          <Grid container spacing={3}>
            {menuItems.map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                    <Box sx={{ mb: 2 }}>
                      {item.icon}
                    </Box>
                    <Typography gutterBottom variant="h5" component="h2">
                      {item.title}
                    </Typography>
                    <Typography>
                      {item.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      fullWidth 
                      variant="contained"
                      onClick={() => navigate(item.path)}
                    >
                      Go to {item.title}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default KpiManagementPage; 