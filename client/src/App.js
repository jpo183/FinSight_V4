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
import GoalManagementPage from './pages/Sales/GoalManagementPage';
import KpiDefinitionsPage from './pages/Sales/KpiDefinitionsPage';
import { Box } from '@mui/material';

// We'll create these other pages later
// import KpiValuesPage from './pages/Sales/KpiValuesPage';
// import KpiHistoryPage from './pages/Sales/KpiHistoryPage';

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
        <Route path="/sales/dashboard" element={
          <AppLayout>
            <SalesDashboard />
          </AppLayout>
        } />
        <Route path="/sales/kpi-management" element={
          <AppLayout>
            <KpiManagementPage />
          </AppLayout>
        } />
        <Route path="/sales/goal-management" element={
          <AppLayout>
            <GoalManagementPage />
          </AppLayout>
        } />
        <Route path="/sales/kpi-definitions" element={
          <AppLayout>
            <KpiDefinitionsPage />
          </AppLayout>
        } />
        {/* We'll add these routes later
        <Route path="/sales/kpi-values" element={
          <AppLayout>
            <KpiValuesPage />
          </AppLayout>
        } />
        <Route path="/sales/kpi-history" element={
          <AppLayout>
            <KpiHistoryPage />
          </AppLayout>
        } />
        */}
        <Route path="/config" element={
          <AppLayout>
            <Config />
          </AppLayout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
