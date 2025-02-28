import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  AppBar,
  Toolbar,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';

const KpiValuesPage = () => {
  const navigate = useNavigate();
  const [kpiDefinitions, setKpiDefinitions] = useState([]);
  const [manualKpis, setManualKpis] = useState([]);
  const [kpiValues, setKpiValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKpi, setSelectedKpi] = useState('');
  const [periodType, setPeriodType] = useState('monthly');
  const [periodValue, setPeriodValue] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [editingValueId, setEditingValueId] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Load KPI definitions and values on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load KPI definitions from localStorage
        const storedKpis = localStorage.getItem('salesKpis');
        const kpis = storedKpis ? JSON.parse(storedKpis) : [];
        setKpiDefinitions(kpis);
        
        // Filter for manual KPIs only
        const manualKpisOnly = kpis.filter(kpi => kpi.source === 'manual' || !kpi.source);
        setManualKpis(manualKpisOnly);
        
        // Load KPI values from localStorage
        const storedValues = localStorage.getItem('salesKpiValues');
        const values = storedValues ? JSON.parse(storedValues) : [];
        setKpiValues(values);
      } catch (error) {
        console.error('Error loading data:', error);
        setNotification({
          open: true,
          message: 'Error loading data',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Generate period options based on selected period type
  const getPeriodOptions = () => {
    switch (periodType) {
      case 'weekly':
        return Array.from({ length: 52 }, (_, i) => ({
          value: (i + 1).toString(),
          label: `Week ${i + 1}`
        }));
      case 'monthly':
        return [
          { value: '1', label: 'January' },
          { value: '2', label: 'February' },
          { value: '3', label: 'March' },
          { value: '4', label: 'April' },
          { value: '5', label: 'May' },
          { value: '6', label: 'June' },
          { value: '7', label: 'July' },
          { value: '8', label: 'August' },
          { value: '9', label: 'September' },
          { value: '10', label: 'October' },
          { value: '11', label: 'November' },
          { value: '12', label: 'December' }
        ];
      case 'quarterly':
        return [
          { value: '1', label: 'Q1' },
          { value: '2', label: 'Q2' },
          { value: '3', label: 'Q3' },
          { value: '4', label: 'Q4' }
        ];
      case 'yearly':
        return [{ value: year, label: year }];
      default:
        return [];
    }
  };

  // Get years for dropdown (current year and 5 years before/after)
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, i) => ({
      value: (currentYear - 5 + i).toString(),
      label: (currentYear - 5 + i).toString()
    }));
  };

  // Format period for display
  const formatPeriod = (type, value, year) => {
    switch (type) {
      case 'weekly':
        return `Week ${value}, ${year}`;
      case 'monthly':
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return `${monthNames[parseInt(value) - 1]} ${year}`;
      case 'quarterly':
        return `Q${value} ${year}`;
      case 'yearly':
        return year;
      default:
        return '';
    }
  };

  // Get KPI name from ID
  const getKpiName = (kpiId) => {
    const kpi = kpiDefinitions.find(k => k.id === kpiId);
    return kpi ? kpi.name : 'Unknown KPI';
  };

  // Get KPI unit from ID
  const getKpiUnit = (kpiId) => {
    const kpi = kpiDefinitions.find(k => k.id === kpiId);
    return kpi ? kpi.unit : '';
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedKpi || !periodType || !periodValue || !year || value === '') {
      setNotification({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }
    
    try {
      // Create a copy of the values array
      const updatedValues = [...kpiValues];
      
      // Create a unique ID for the period
      const periodId = `${selectedKpi}-${periodType}-${periodValue}-${year}`;
      
      if (editingValueId) {
        // Editing existing value
        const index = updatedValues.findIndex(v => v.id === editingValueId);
        if (index !== -1) {
          updatedValues[index] = {
            ...updatedValues[index],
            kpi_id: selectedKpi,
            period_type: periodType,
            period_value: periodValue,
            year: year,
            value: value,
            notes: notes,
            updated_at: new Date().toISOString()
          };
        }
        setNotification({
          open: true,
          message: 'KPI value updated successfully',
          severity: 'success'
        });
      } else {
        // Check for duplicate entries
        const existingValue = kpiValues.find(v => 
          v.kpi_id === selectedKpi && 
          v.period_type === periodType && 
          v.period_value === periodValue && 
          v.year === year
        );
        
        if (existingValue) {
          setNotification({
            open: true,
            message: 'A value for this KPI and period already exists. Edit the existing value instead.',
            severity: 'error'
          });
          return;
        }
        
        // Creating new value
        const newValue = {
          id: Date.now().toString(),
          kpi_id: selectedKpi,
          period_type: periodType,
          period_value: periodValue,
          year: year,
          value: value,
          notes: notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        updatedValues.push(newValue);
        setNotification({
          open: true,
          message: 'KPI value added successfully',
          severity: 'success'
        });
      }
      
      // Save to localStorage
      localStorage.setItem('salesKpiValues', JSON.stringify(updatedValues));
      
      // Update state
      setKpiValues(updatedValues);
      
      // Reset form
      resetForm();
    } catch (error) {
      console.error('Error saving KPI value:', error);
      setNotification({
        open: true,
        message: 'Error saving KPI value',
        severity: 'error'
      });
    }
  };

  // Handle edit button click
  const handleEdit = (valueId) => {
    const valueToEdit = kpiValues.find(v => v.id === valueId);
    if (valueToEdit) {
      setSelectedKpi(valueToEdit.kpi_id);
      setPeriodType(valueToEdit.period_type);
      setPeriodValue(valueToEdit.period_value);
      setYear(valueToEdit.year);
      setValue(valueToEdit.value);
      setNotes(valueToEdit.notes || '');
      setEditingValueId(valueId);
    }
  };

  // Handle delete button click
  const handleDelete = (valueId) => {
    try {
      // Filter out the value to delete
      const updatedValues = kpiValues.filter(v => v.id !== valueId);
      
      // Save to localStorage
      localStorage.setItem('salesKpiValues', JSON.stringify(updatedValues));
      
      // Update state
      setKpiValues(updatedValues);
      
      setNotification({
        open: true,
        message: 'KPI value deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting KPI value:', error);
      setNotification({
        open: true,
        message: 'Error deleting KPI value',
        severity: 'error'
      });
    }
  };

  // Reset form fields
  const resetForm = () => {
    setSelectedKpi('');
    setPeriodType('monthly');
    setPeriodValue('');
    setYear(new Date().getFullYear().toString());
    setValue('');
    setNotes('');
    setEditingValueId(null);
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" onClick={() => navigate('/sales/kpi-management')}>
            Back to KPI Management
          </Button>
          <Button color="inherit" onClick={() => navigate('/sales/dashboard')}>
            Back to Sales Dashboard
          </Button>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
            Manual KPI Values Entry
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {editingValueId ? 'Edit KPI Value' : 'Enter New KPI Value'}
                </Typography>
                
                <Box component="form" onSubmit={handleSubmit} noValidate>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>KPI</InputLabel>
                    <Select
                      value={selectedKpi}
                      onChange={(e) => setSelectedKpi(e.target.value)}
                      label="KPI"
                    >
                      {manualKpis.length === 0 ? (
                        <MenuItem disabled>No manual KPIs defined</MenuItem>
                      ) : (
                        manualKpis.map((kpi) => (
                          <MenuItem key={kpi.id} value={kpi.id}>
                            {kpi.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Period Type</InputLabel>
                    <Select
                      value={periodType}
                      onChange={(e) => {
                        setPeriodType(e.target.value);
                        setPeriodValue('');
                      }}
                      label="Period Type"
                    >
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="quarterly">Quarterly</MenuItem>
                      <MenuItem value="yearly">Yearly</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Period</InputLabel>
                    <Select
                      value={periodValue}
                      onChange={(e) => setPeriodValue(e.target.value)}
                      label="Period"
                    >
                      {getPeriodOptions().map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Year</InputLabel>
                    <Select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      label="Year"
                    >
                      {getYearOptions().map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Value"
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    required
                    InputProps={{
                      endAdornment: selectedKpi && (
                        <InputAdornment position="end">
                          {getKpiUnit(selectedKpi)}
                        </InputAdornment>
                      )
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Notes"
                    multiline
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      variant="outlined"
                      onClick={resetForm}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                    >
                      {editingValueId ? 'Update Value' : 'Save Value'}
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Entered KPI Values
                </Typography>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>KPI</TableCell>
                          <TableCell>Period</TableCell>
                          <TableCell>Value</TableCell>
                          <TableCell>Last Updated</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {kpiValues.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              No KPI values entered yet.
                            </TableCell>
                          </TableRow>
                        ) : (
                          kpiValues.map((kpiValue) => (
                            <TableRow key={kpiValue.id}>
                              <TableCell>{getKpiName(kpiValue.kpi_id)}</TableCell>
                              <TableCell>
                                {formatPeriod(kpiValue.period_type, kpiValue.period_value, kpiValue.year)}
                              </TableCell>
                              <TableCell>
                                {kpiValue.value} {getKpiUnit(kpiValue.kpi_id)}
                              </TableCell>
                              <TableCell>
                                {new Date(kpiValue.updated_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <IconButton
                                  color="primary"
                                  onClick={() => handleEdit(kpiValue.id)}
                                  size="small"
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  color="error"
                                  onClick={() => handleDelete(kpiValue.id)}
                                  size="small"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Grid>
          </Grid>
          
          {/* Notification */}
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
        </Box>
      </Container>
    </>
  );
};

export default KpiValuesPage;
