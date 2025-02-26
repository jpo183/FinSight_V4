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
        <Route path="/sales/dashboard" element={<SalesDashboard />} />
        <Route path="/sales/kpi/manage" element={<KpiManagementPage />} />
      </Routes>
    </Router>
  );
}

export default App;
