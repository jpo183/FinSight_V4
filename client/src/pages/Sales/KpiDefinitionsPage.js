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
  FormHelperText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const KpiDefinitionsPage = () => {
  const navigate = useNavigate();
  const [kpiList, setKpiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingKpiId, setEditingKpiId] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // State for KPI definition form
  const [kpi, setKpi] = useState({
    name: '',
    domain: 'Sales',
    description: '',
    dataType: 'currency',
    unit: 'USD',
    // Dashboard display settings
    dashboardSection: 'revenue',
    visualizationType: 'card',
    showInTable: true,
    isPrimaryMetric: false,
    // Data source
    source: 'manual' // Default to manual entry
  });

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        // Fetch KPIs from localStorage
        const storedKpis = localStorage.getItem('salesKpis');
        if (storedKpis) {
          const parsedKpis = JSON.parse(storedKpis);
          setKpiList(parsedKpis);
        }
      } catch (error) {
        console.error('Error fetching KPIs:', error);
        setNotification({
          open: true,
          message: 'Error loading KPIs',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchKpis();
  }, []);

  const handleKpiChange = (e) => {
    const { name, value } = e.target;
    setKpi({
      ...kpi,
      [name]: value
    });
  };

  const handleBooleanChange = (e) => {
    const { name, value } = e.target;
    setKpi({
      ...kpi,
      [name]: value === 'true'
    });
  };

  const handleSubmitKpi = async (e) => {
    e.preventDefault();
    try {
      // Create a copy of the KPI list
      const updatedKpis = [...kpiList];
      
      if (editingKpiId) {
        // Editing existing KPI
        const index = updatedKpis.findIndex(k => k.id === editingKpiId);
        if (index !== -1) {
          updatedKpis[index] = { ...kpi, id: editingKpiId };
        }
        setNotification({
          open: true,
          message: 'KPI updated successfully',
          severity: 'success'
        });
      } else {
        // Creating new KPI
        const newKpi = {
          ...kpi,
          id: Date.now().toString(), // Generate a unique ID
          created_at: new Date().toISOString()
        };
        updatedKpis.push(newKpi);
        setNotification({
          open: true,
          message: 'KPI created successfully',
          severity: 'success'
        });
      }
      
      // Save to localStorage
      localStorage.setItem('salesKpis', JSON.stringify(updatedKpis));
      
      // Update state
      setKpiList(updatedKpis);
      
      // Reset form
      resetKpiForm();
    } catch (error) {
      console.error('Error submitting KPI:', error);
      setNotification({
        open: true,
        message: 'Error saving KPI',
        severity: 'error'
      });
    }
  };

  const handleEditKpi = (kpiId) => {
    const kpiToEdit = kpiList.find(k => k.id === kpiId);
    if (kpiToEdit) {
      setKpi(kpiToEdit);
      setEditingKpiId(kpiId);
    }
  };

  const handleDeleteKpi = (kpiId) => {
    try {
      // Filter out the KPI to delete
      const updatedKpis = kpiList.filter(k => k.id !== kpiId);
      
      // Save to localStorage
      localStorage.setItem('salesKpis', JSON.stringify(updatedKpis));
      
      // Update state
      setKpiList(updatedKpis);
      
      setNotification({
        open: true,
        message: 'KPI deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting KPI:', error);
      setNotification({
        open: true,
        message: 'Error deleting KPI',
        severity: 'error'
      });
    }
  };

  const resetKpiForm = () => {
    setKpi({
      name: '',
      domain: 'Sales',
      description: '',
      dataType: 'currency',
      unit: 'USD',
      dashboardSection: 'revenue',
      visualizationType: 'card',
      showInTable: true,
      isPrimaryMetric: false,
      source: 'manual'
    });
    setEditingKpiId(null);
  };

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
            Define KPIs
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {editingKpiId ? 'Edit KPI' : 'Create New KPI'}
                </Typography>
                <Box component="form" onSubmit={handleSubmitKpi} noValidate>
                  <TextField
                    fullWidth
                    margin="normal"
                    required
                    label="KPI Name"
                    name="name"
                    value={kpi.name}
                    onChange={handleKpiChange}
                  />
                  
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Description"
                    name="description"
                    value={kpi.description}
                    onChange={handleKpiChange}
                    multiline
                    rows={2}
                  />
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Data Type</InputLabel>
                    <Select
                      name="dataType"
                      value={kpi.dataType}
                      onChange={handleKpiChange}
                      label="Data Type"
                    >
                      <MenuItem value="currency">Currency</MenuItem>
                      <MenuItem value="percentage">Percentage</MenuItem>
                      <MenuItem value="number">Number</MenuItem>
                      <MenuItem value="time">Time</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Unit"
                    name="unit"
                    value={kpi.unit}
                    onChange={handleKpiChange}
                  />
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Data Source</InputLabel>
                    <Select
                      name="source"
                      value={kpi.source}
                      onChange={handleKpiChange}
                      label="Data Source"
                    >
                      <MenuItem value="manual">Manual Entry</MenuItem>
                      <MenuItem value="automated">Automated (Database Query)</MenuItem>
                    </Select>
                    <FormHelperText>How data will be collected for this KPI</FormHelperText>
                  </FormControl>
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Dashboard Section</InputLabel>
                    <Select
                      name="dashboardSection"
                      value={kpi.dashboardSection}
                      onChange={handleKpiChange}
                      label="Dashboard Section"
                    >
                      <MenuItem value="revenue">Revenue</MenuItem>
                      <MenuItem value="sales">Sales</MenuItem>
                      <MenuItem value="performance">Performance</MenuItem>
                      <MenuItem value="customers">Customers</MenuItem>
                      <MenuItem value="none">None</MenuItem>
                    </Select>
                    <FormHelperText>Section where this KPI will appear on the dashboard</FormHelperText>
                  </FormControl>
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Visualization Type</InputLabel>
                    <Select
                      name="visualizationType"
                      value={kpi.visualizationType}
                      onChange={handleKpiChange}
                      label="Visualization Type"
                    >
                      <MenuItem value="card">Card</MenuItem>
                      <MenuItem value="barchart">Bar Chart</MenuItem>
                      <MenuItem value="linechart">Line Chart</MenuItem>
                      <MenuItem value="piechart">Pie Chart</MenuItem>
                    </Select>
                    <FormHelperText>How this KPI will be visualized on the dashboard</FormHelperText>
                  </FormControl>
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Show in Table</InputLabel>
                    <Select
                      name="showInTable"
                      value={kpi.showInTable.toString()}
                      onChange={handleBooleanChange}
                      label="Show in Table"
                    >
                      <MenuItem value="true">Yes</MenuItem>
                      <MenuItem value="false">No</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Primary Metric</InputLabel>
                    <Select
                      name="isPrimaryMetric"
                      value={kpi.isPrimaryMetric.toString()}
                      onChange={handleBooleanChange}
                      label="Primary Metric"
                    >
                      <MenuItem value="true">Yes</MenuItem>
                      <MenuItem value="false">No</MenuItem>
                    </Select>
                    <FormHelperText>Is this a primary metric for the dashboard?</FormHelperText>
                  </FormControl>
                  
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      variant="outlined"
                      onClick={resetKpiForm}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                    >
                      {editingKpiId ? 'Update KPI' : 'Create KPI'}
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Defined KPIs
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
                          <TableCell>Name</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Source</TableCell>
                          <TableCell>Section</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {kpiList.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              No KPIs defined yet. Create your first KPI.
                            </TableCell>
                          </TableRow>
                        ) : (
                          kpiList.map((kpi) => (
                            <TableRow key={kpi.id}>
                              <TableCell>{kpi.name}</TableCell>
                              <TableCell>{kpi.dataType}</TableCell>
                              <TableCell>{kpi.source || 'manual'}</TableCell>
                              <TableCell>{kpi.dashboardSection}</TableCell>
                              <TableCell>
                                <IconButton onClick={() => handleEditKpi(kpi.id)}>
                                  <EditIcon />
                                </IconButton>
                                <IconButton onClick={() => handleDeleteKpi(kpi.id)}>
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

export default KpiDefinitionsPage; 