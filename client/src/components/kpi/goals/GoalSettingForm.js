import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Grid,
  InputAdornment,
  Snackbar,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const GoalSettingForm = ({ onSubmit, initialData = null, kpiDefinitions = [], entities = [] }) => {
  const [formData, setFormData] = useState({
    kpi_id: '',
    entity_type: 'department', // Default to department for our sales dashboard
    entity_id: '',
    time_period: 'yearly',
    start_date: new Date(new Date().getFullYear(), 0, 1), // January 1st of current year
    end_date: new Date(new Date().getFullYear(), 11, 31), // December 31st of current year
    target_value: '',
    stretch_target: '',
    minimum_target: '',
    status: 'draft'
  });
  
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // If editing an existing goal, populate the form
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        start_date: new Date(initialData.start_date),
        end_date: new Date(initialData.end_date)
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name) => (date) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await onSubmit(formData);
      setNotification({
        open: true,
        message: initialData ? 'Goal updated successfully' : 'Goal created successfully',
        severity: 'success'
      });
      
      if (!initialData) {
        // Reset form if creating a new goal
        setFormData({
          kpi_id: '',
          entity_type: 'department',
          entity_id: '',
          time_period: 'yearly',
          start_date: new Date(new Date().getFullYear(), 0, 1),
          end_date: new Date(new Date().getFullYear(), 11, 31),
          target_value: '',
          stretch_target: '',
          minimum_target: '',
          status: 'draft'
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Get unit for selected KPI
  const selectedKpi = kpiDefinitions.find(kpi => kpi.kpi_id === formData.kpi_id);
  const unit = selectedKpi?.unit || '';
  const dataType = selectedKpi?.data_type || '';

  // Determine if we should show currency symbol
  const showCurrency = dataType === 'currency';

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {initialData ? 'Edit Goal' : 'Create New Goal'}
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>KPI</InputLabel>
                <Select
                  name="kpi_id"
                  value={formData.kpi_id}
                  onChange={handleChange}
                  label="KPI"
                >
                  {kpiDefinitions.map(kpi => (
                    <MenuItem key={kpi.kpi_id} value={kpi.kpi_id}>
                      {kpi.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Entity Type</InputLabel>
                <Select
                  name="entity_type"
                  value={formData.entity_type}
                  onChange={handleChange}
                  label="Entity Type"
                >
                  <MenuItem value="organization">Organization</MenuItem>
                  <MenuItem value="department">Department</MenuItem>
                  <MenuItem value="team">Team</MenuItem>
                  <MenuItem value="individual">Individual</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Entity</InputLabel>
                <Select
                  name="entity_id"
                  value={formData.entity_id}
                  onChange={handleChange}
                  label="Entity"
                >
                  {entities
                    .filter(entity => entity.type === formData.entity_type)
                    .map(entity => (
                      <MenuItem key={entity.id} value={entity.id}>
                        {entity.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Time Period</InputLabel>
                <Select
                  name="time_period"
                  value={formData.time_period}
                  onChange={handleChange}
                  label="Time Period"
                >
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Start Date"
                value={formData.start_date}
                onChange={handleDateChange('start_date')}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <DatePicker
                label="End Date"
                value={formData.end_date}
                onChange={handleDateChange('end_date')}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                required
                label="Target Value"
                name="target_value"
                value={formData.target_value}
                onChange={handleChange}
                type="number"
                InputProps={{
                  startAdornment: showCurrency ? (
                    <InputAdornment position="start">$</InputAdornment>
                  ) : null,
                  endAdornment: !showCurrency && unit ? (
                    <InputAdornment position="end">{unit}</InputAdornment>
                  ) : null,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Stretch Target"
                name="stretch_target"
                value={formData.stretch_target}
                onChange={handleChange}
                type="number"
                InputProps={{
                  startAdornment: showCurrency ? (
                    <InputAdornment position="start">$</InputAdornment>
                  ) : null,
                  endAdornment: !showCurrency && unit ? (
                    <InputAdornment position="end">{unit}</InputAdornment>
                  ) : null,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Minimum Target"
                name="minimum_target"
                value={formData.minimum_target}
                onChange={handleChange}
                type="number"
                InputProps={{
                  startAdornment: showCurrency ? (
                    <InputAdornment position="start">$</InputAdornment>
                  ) : null,
                  endAdornment: !showCurrency && unit ? (
                    <InputAdornment position="end">{unit}</InputAdornment>
                  ) : null,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  {initialData ? 'Update Goal' : 'Create Goal'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Paper>
    </LocalizationProvider>
  );
};

export default GoalSettingForm;
