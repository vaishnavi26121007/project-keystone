import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WorkOrderList from './pages/workorders/WorkOrderList';
import WorkOrderDetail from './pages/workorders/WorkOrderDetail';
import DispatchBoard from './pages/dispatcher/DispatchBoard';
import ClientsAndSites from './pages/admin/ClientsAndSites';
import PartsInventory from './pages/admin/PartsInventory';
import NewServiceRequest from './pages/client/NewServiceRequest';
import MyJobs from './pages/technician/MyJobs';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />

      {/* Authenticated routes - available to any logged-in role */}
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/work-orders" element={<ProtectedRoute><WorkOrderList /></ProtectedRoute>} />
      <Route path="/work-orders/:id" element={<ProtectedRoute><WorkOrderDetail /></ProtectedRoute>} />

      {/* Admin / Dispatcher only */}
      <Route
        path="/dispatch"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'DISPATCHER']}>
            <DispatchBoard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'DISPATCHER']}>
            <ClientsAndSites />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parts"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'DISPATCHER']}>
            <PartsInventory />
          </ProtectedRoute>
        }
      />

      {/* Client + Admin/Dispatcher (they can raise requests on a client's behalf) */}
      <Route
        path="/new-request"
        element={
          <ProtectedRoute allowedRoles={['CLIENT', 'ADMIN', 'DISPATCHER']}>
            <NewServiceRequest />
          </ProtectedRoute>
        }
      />

      {/* Technician only */}
      <Route
        path="/my-jobs"
        element={
          <ProtectedRoute allowedRoles={['TECHNICIAN']}>
            <MyJobs />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
