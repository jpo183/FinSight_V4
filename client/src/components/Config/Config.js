import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import { configService } from '../../services/api';

const Config = () => {
  const [config, setConfig] = useState({
    apiKey: '',
    hostUrl: '',
    databaseUrl: '',
    hubspotApiKey: '',
    openaiApiKey: '',
  });

  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    // Load existing configuration when component mounts
    const loadConfig = async () => {
      try {
        const data = await configService.getConfig();
        setConfig(data);
      } catch (error) {
        setNotification({
          open: true,
          message: 'Error loading configuration',
          severity: 'error'
        });
      }
    };
    loadConfig();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await configService.saveConfig(config);
      setNotification({
        open: true,
        message: 'Configuration saved successfully!',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: 'Error saving configuration',
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
  };

  return (
    <Box sx={{ maxWidth: 600, margin: '40px auto', padding: '0 20px' }}>
      <Typography variant="h4" gutterBottom>
        Configuration Settings
      </Typography>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="API Key"
                name="apiKey"
                value={config.apiKey}
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                label="Host URL"
                name="hostUrl"
                value={config.hostUrl}
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                label="Database URL"
                name="databaseUrl"
                value={config.databaseUrl}
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                label="HubSpot API Key"
                name="hubspotApiKey"
                value={config.hubspotApiKey}
                onChange={handleChange}
                fullWidth
                required
                type="password"
              />
              <TextField
                label="OpenAI API Key"
                name="openaiApiKey"
                value={config.openaiApiKey}
                onChange={handleChange}
                fullWidth
                required
                type="password"
              />
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                sx={{ mt: 2 }}
              >
                Save Configuration
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Config; 