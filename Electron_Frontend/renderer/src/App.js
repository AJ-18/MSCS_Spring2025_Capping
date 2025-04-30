import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import DeviceDetails from './components/DeviceDetails';
import CpuMetrics from './components/metrics/CpuMetrics';
import MemoryMetrics from './components/metrics/MemoryMetrics';
import DiskMetrics from './components/metrics/DiskMetrics';
import BatteryMetrics from './components/metrics/BatteryMetrics';
import ProcessMetrics from './components/metrics/ProcessMetrics';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/device/:deviceId" element={
          <ProtectedRoute>
            <Layout>
              <DeviceDetails />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/dashboard/device/:deviceId/cpu" element={
          <ProtectedRoute>
            <Layout>
              <CpuMetrics />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/dashboard/device/:deviceId/memory" element={
          <ProtectedRoute>
            <Layout>
              <MemoryMetrics />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/dashboard/device/:deviceId/disk" element={
          <ProtectedRoute>
            <Layout>
              <DiskMetrics />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/dashboard/device/:deviceId/battery" element={
          <ProtectedRoute>
            <Layout>
              <BatteryMetrics />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/dashboard/device/:deviceId/processes" element={<ProcessMetrics />} />

        {/* Add more metric routes here */}
        
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
