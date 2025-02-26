import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navigation/Navbar';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Config from './components/Config/Config';
import Sales from './components/Sales/Sales';
import SalesAnalytics from './components/Sales/Analytics/SalesAnalytics';
import SalesDashboard from './components/kpi/dashboards/SalesDashboard';
import KpiManagementPage from './pages/Sales/KpiManagementPage';
import { Box } from '@mui/material';
import GoalManagement from './components/kpi/goals/GoalManagement';
import { Link } from 'react-router-dom';
import { ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Dashboard as DashboardIcon, Settings as SettingsIcon, BarChart as BarChartIcon, Flag as TargetIcon } from '@mui/icons-material';

const AppLayout = ({ children }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Navbar />
    <Box component="main" sx={{ flexGrow: 1 }}>
      {children}
    </Box>
  </Box>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={
          <AppLayout>
            <Dashboard />
          </AppLayout>
        } />
        <Route path="/sales" element={
          <AppLayout>
            <Sales />
          </AppLayout>
        } />
        <Route path="/sales/analytics" element={
          <AppLayout>
            <SalesAnalytics />
          </AppLayout>
        } />
        <Route path="/config" element={
          <AppLayout>
            <Config />
          </AppLayout>
        } />
        <Route path="/sales/dashboard" element={
          <AppLayout>
            <SalesDashboard />
          </AppLayout>
        } />
        <Route path="/sales/kpi/manage" element={
          <AppLayout>
            <KpiManagementPage />
          </AppLayout>
        } />
        <Route path="/kpi-management" element={<GoalManagement />} />
      </Routes>
    </Router>
  );
}

export default App;
