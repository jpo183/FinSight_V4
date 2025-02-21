import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/dashboard');
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <Card sx={{ minWidth: 300, textAlign: 'center' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            FinSight Login
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleLogin}
            sx={{ mt: 2 }}
          >
            Enter Dashboard
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login; 