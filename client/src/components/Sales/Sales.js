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
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TimelineIcon from '@mui/icons-material/Timeline';
import PeopleIcon from '@mui/icons-material/People';

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

const Sales = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 2, maxWidth: '750px', margin: '0 auto' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Sales
      </Typography>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <NavigationCard
            title="AI Analytics"
            icon={<QueryStatsIcon sx={{ fontSize: 36 }} />}
            path="/sales/analytics"
            description="Ask questions about your sales data"
          />
        </Grid>
        <Grid item xs={6}>
          <NavigationCard
            title="Dashboard"
            icon={<DashboardIcon sx={{ fontSize: 36 }} />}
            path="/sales/dashboard"
            description="View key sales metrics and KPIs"
          />
        </Grid>
        <Grid item xs={6}>
          <NavigationCard
            title="Pipeline"
            icon={<TimelineIcon sx={{ fontSize: 36 }} />}
            path="/sales/pipeline"
            description="Track deals and opportunities"
            disabled={true}
          />
        </Grid>
        <Grid item xs={6}>
          <NavigationCard
            title="Team"
            icon={<PeopleIcon sx={{ fontSize: 36 }} />}
            path="/sales/team"
            description="Sales team performance"
            disabled={true}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Sales; 