import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  AppBar,
  Toolbar,
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

import GoalSettingForm from '../../components/kpi/goals/GoalSettingForm';

const GoalManagementPage = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [kpiDefinitions, setKpiDefinitions] = useState([]);
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openGoalForm, setOpenGoalForm] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
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

  const handleOpenGoalForm = (goal = null) => {
    setCurrentGoal(goal);
    setOpenGoalForm(true);
  };

  const handleCloseGoalForm = () => {
    setOpenGoalForm(false);
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
      handleCloseGoalForm();
      
      return true;
    } catch (error) {
      console.error('Error submitting goal:', error);
      setNotification({
        open: true,
        message: 'Error saving goal',
        severity: 'error'
      });
      return false;
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
    } catch (error) {
      console.error('Error deleting goal:', error);
      setNotification({
        open: true,
        message: 'Error deleting goal',
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  // Helper function to get KPI name from ID
  const getKpiName = (kpiId) => {
    const kpi = kpiDefinitions.find(k => k.id === kpiId);
    return kpi ? kpi.name : 'Unknown KPI';
  };

  // Helper function to get entity name from ID
  const getEntityName = (entityId) => {
    const entity = entities.find(e => e.id === entityId);
    return entity ? entity.name : 'Unknown Entity';
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
            Goal Management
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenGoalForm()}
            >
              Add New Goal
            </Button>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
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
                            onClick={() => handleOpenGoalForm(goal)}
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
          )}
          
          {/* Goal Form Dialog */}
          <Dialog
            open={openGoalForm}
            onClose={handleCloseGoalForm}
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
              <Button onClick={handleCloseGoalForm}>Cancel</Button>
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
      </Container>
    </>
  );
};

export default GoalManagementPage; 