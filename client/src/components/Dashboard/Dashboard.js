import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography,
  CardActionArea 
} from '@mui/material';
import SellIcon from '@mui/icons-material/Sell';
import ConstructionIcon from '@mui/icons-material/Construction';

const NavigationCard = ({ title, icon, path, description, disabled = false }) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardActionArea 
        onClick={() => !disabled && navigate(path)}
        sx={{ 
          opacity: disabled ? 0.7 : 1,
          cursor: disabled ? 'default' : 'pointer',
          aspectRatio: '1/1',
        }}
      >
        <CardContent sx={{ 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center', 
          gap: 2,
          padding: 2
        }}>
          {icon}
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const Dashboard = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 2, maxWidth: '750px', margin: '0 auto' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Dashboard
      </Typography>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <NavigationCard
            title="Sales"
            icon={<SellIcon sx={{ fontSize: 36 }} />}
            path="/sales"
            description="View and manage sales data"
          />
        </Grid>
        <Grid item xs={6}>
          <NavigationCard
            title="Analytics"
            icon={<ConstructionIcon sx={{ fontSize: 36 }} />}
            path="/analytics"
            description="Coming Soon"
            disabled={true}
          />
        </Grid>
        <Grid item xs={6}>
          <NavigationCard
            title="Reports"
            icon={<ConstructionIcon sx={{ fontSize: 36 }} />}
            path="/reports"
            description="Coming Soon"
            disabled={true}
          />
        </Grid>
        <Grid item xs={6}>
          <NavigationCard
            title="Settings"
            icon={<ConstructionIcon sx={{ fontSize: 36 }} />}
            path="/settings"
            description="Coming Soon"
            disabled={true}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;