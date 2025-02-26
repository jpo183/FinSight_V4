import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
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
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import GoalSettingForm from './GoalSettingForm';

const GoalManagement = () => {
  const [goals, setGoals] = useState([]);
  const [kpiDefinitions, setKpiDefinitions] = useState([]);
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Load goals and KPI definitions
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load KPI definitions from localStorage
        const storedKpis = localStorage.getItem('salesKpis');
        const kpis = storedKpis ? JSON.parse(storedKpis) : [];
        setKpiDefinitions(kpis);
        
        // Load goals from localStorage
        const storedGoals = localStorage.getItem('salesGoals');
        const goals = storedGoals ? JSON.parse(storedGoals) : [];
        setGoals(goals);
        
        // Mock entities for now
        setEntities([
          { id: 'sales', name: 'Sales Department', type: 'department' },
          { id: 'marketing', name: 'Marketing Department', type: 'department' },
          { id: 'north', name: 'North Region', type: 'team' },
          { id: 'south', name: 'South Region', type: 'team' },
          { id: 'east', name: 'East Region', type: 'team' },
          { id: 'west', name: 'West Region', type: 'team' },
          { id: 'user1', name: 'John Doe', type: 'individual' },
          { id: 'user2', name: 'Jane Smith', type: 'individual' },
          { id: 'org', name: 'Entire Organization', type: 'organization' }
        ]);
        
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleOpenForm = (goal = null) => {
    setCurrentGoal(goal);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setCurrentGoal(null);
  };

  const handleOpenDeleteDialog = (goal) => {
    setGoalToDelete(goal);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setGoalToDelete(null);
  };

  const handleSubmitGoal = async (goalData) => {
    try {
      // Create a copy of the goals array
      const updatedGoals = [...goals];
      
      if (currentGoal) {
        // Editing existing goal
        const index = updatedGoals.findIndex(g => g.id === currentGoal.id);
        if (index !== -1) {
          updatedGoals[index] = { ...goalData, id: currentGoal.id };
        }
        setNotification({
          open: true,
          message: 'Goal updated successfully',
          severity: 'success'
        });
      } else {
        // Creating new goal
        const newGoal = {
          ...goalData,
          id: Date.now().toString(), // Generate a unique ID
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        updatedGoals.push(newGoal);
        setNotification({
          open: true,
          message: 'Goal created successfully',
          severity: 'success'
        });
      }
      
      // Save to localStorage
      localStorage.setItem('salesGoals', JSON.stringify(updatedGoals));
      
      // Update state
      setGoals(updatedGoals);
      
      // Close the form
      handleCloseForm();
    } catch (err) {
      console.error('Error saving goal:', err);
      setNotification({
        open: true,
        message: `Error: ${err.message || 'Failed to save goal'}`,
        severity: 'error'
      });
    }
  };

  const handleDeleteGoal = async () => {
    try {
      if (!goalToDelete) return;
      
      // Filter out the goal to delete
      const updatedGoals = goals.filter(g => g.id !== goalToDelete.id);
      
      // Save to localStorage
      localStorage.setItem('salesGoals', JSON.stringify(updatedGoals));
      
      // Update state
      setGoals(updatedGoals);
      
      setNotification({
        open: true,
        message: 'Goal deleted successfully',
        severity: 'success'
      });
      
      // Close the dialog
      handleCloseDeleteDialog();
    } catch (err) {
      console.error('Error deleting goal:', err);
      setNotification({
        open: true,
        message: `Error: ${err.message || 'Failed to delete goal'}`,
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Helper function to get KPI name by ID
  const getKpiName = (kpiId) => {
    const kpi = kpiDefinitions.find(k => k.id === kpiId);
    return kpi ? kpi.name : 'Unknown KPI';
  };

  // Helper function to get entity name by ID
  const getEntityName = (entityId) => {
    const entity = entities.find(e => e.id === entityId);
    return entity ? entity.name : 'Unknown Entity';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Goal Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          Add New Goal
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>KPI</TableCell>
              <TableCell>Entity</TableCell>
              <TableCell>Time Period</TableCell>
              <TableCell>Target Value</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {goals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No goals defined yet. Click "Add New Goal" to create one.
                </TableCell>
              </TableRow>
            ) : (
              goals.map((goal) => (
                <TableRow key={goal.id}>
                  <TableCell>{getKpiName(goal.kpi_id)}</TableCell>
                  <TableCell>{getEntityName(goal.entity_id)}</TableCell>
                  <TableCell>{goal.time_period}</TableCell>
                  <TableCell>{goal.target_value}</TableCell>
                  <TableCell>{goal.status}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenForm(goal)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleOpenDeleteDialog(goal)}
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
      
      {/* Goal Form Dialog */}
      <Dialog
        open={openForm}
        onClose={handleCloseForm}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentGoal ? 'Edit Goal' : 'Create New Goal'}
        </DialogTitle>
        <DialogContent>
          <GoalSettingForm
            onSubmit={handleSubmitGoal}
            initialData={currentGoal}
            kpiDefinitions={kpiDefinitions}
            entities={entities}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancel</Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this goal? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteGoal} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      
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
  );
};

export default GoalManagement;
