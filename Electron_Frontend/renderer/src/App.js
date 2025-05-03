/**
 * App.js
 * 
 * Main entry point for the SPAR (System Performance Analytics & Reporting) application.
 * This component configures the application routing using React Router, defining both 
 * public and protected routes.
 */
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

/**
 * App Component
 * 
 * Defines the application's routing structure with two categories of routes:
 * 1. Public routes: Login and registration screens accessible to unauthenticated users
 * 2. Protected routes: Main application screens that require authentication
 * 
 * All protected routes are wrapped in the ProtectedRoute component, which verifies
 * user authentication before allowing access.
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes - Accessible without authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes - Require authentication */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Device Details Route - Shows general info about the selected device */}
        <Route path="/dashboard/device/:deviceId" element={
          <ProtectedRoute>
            <Layout>
              <DeviceDetails />
            </Layout>
          </ProtectedRoute>
        } />

        {/* CPU Metrics Route - Shows CPU usage and related metrics */}
        <Route path="/dashboard/device/:deviceId/cpu" element={
          <ProtectedRoute>
            <Layout>
              <CpuMetrics />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Memory Metrics Route - Shows RAM usage and related metrics */}
        <Route path="/dashboard/device/:deviceId/memory" element={
          <ProtectedRoute>
            <Layout>
              <MemoryMetrics />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Disk Metrics Route - Shows storage usage and related metrics */}
        <Route path="/dashboard/device/:deviceId/disk" element={
          <ProtectedRoute>
            <Layout>
              <DiskMetrics />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Battery Metrics Route - Shows battery status and related metrics */}
        <Route path="/dashboard/device/:deviceId/battery" element={
          <ProtectedRoute>
            <Layout>
              <BatteryMetrics />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Process Metrics Route - Shows running processes and related metrics */}
        <Route path="/dashboard/device/:deviceId/processes" element={<ProcessMetrics />} />

        {/* Default Route - Redirects to login page */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
