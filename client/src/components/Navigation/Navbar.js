import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const Navbar = () => {
  const navigate = useNavigate();
  const [salesMenu, setSalesMenu] = React.useState(null);

  const handleSalesMenuOpen = (event) => {
    setSalesMenu(event.currentTarget);
  };

  const handleSalesMenuClose = () => {
    setSalesMenu(null);
  };

  const navigateToSalesPage = (path) => {
    navigate(path);
    handleSalesMenuClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          FinSight
        </Typography>
        <Box>
          <Button color="inherit" onClick={() => navigate('/dashboard')}>
            Dashboard
          </Button>
          
          {/* Sales dropdown menu */}
          <Button 
            color="inherit" 
            onClick={handleSalesMenuOpen}
            endIcon={<ArrowDropDownIcon />}
          >
            Sales
          </Button>
          <Menu
            anchorEl={salesMenu}
            open={Boolean(salesMenu)}
            onClose={handleSalesMenuClose}
          >
            <MenuItem onClick={() => navigateToSalesPage('/sales')}>Sales Home</MenuItem>
            <MenuItem onClick={() => navigateToSalesPage('/sales/dashboard')}>Sales Dashboard</MenuItem>
            <MenuItem onClick={() => navigateToSalesPage('/sales/analytics')}>Sales Analytics</MenuItem>
            <MenuItem onClick={() => navigateToSalesPage('/sales/kpi/manage')}>Manage KPIs</MenuItem>
          </Menu>
          
          <Button color="inherit" onClick={() => navigate('/config')}>
            Config
          </Button>
          <Button color="inherit" onClick={() => navigate('/')}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 