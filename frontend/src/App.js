import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import ProtectedRoute from './components/common/ProtectedRoute';
import ProtectedMasterRoute from './components/common/ProtectedMasterRoute';

import Login from './components/auth/Login';
import Signup from './components/auth/Signup';

import Dashboard from './components/admin/Dashboard';
import UserManagement from './components/admin/UserManagement';

import ProductMaster from './components/masters/ProductMaster';
import CategoryMaster from './components/masters/CategoryMaster';
import BrandMaster from './components/masters/BrandMaster';
import SupplierMaster from './components/masters/SupplierMaster';
import RoleMaster from './components/masters/RoleMaster';
import RolePermissions from './components/masters/RolePermissions';

import Chatbot from './components/common/Chatbot';
import AccessDenied from './components/common/AccessDenied';

import './App.css';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app-container">
      <Navbar />
      {isAuthenticated && <Sidebar />}
      <main className="content-container">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/dashboard" />} />
          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/chatbot" element={<Chatbot />} />
          </Route>

          {/* Master Routes with permission checks */}
          <Route 
            path="/products" 
            element={
              <ProtectedMasterRoute 
                component={ProductMaster} 
                moduleName="products" 
                action="view" 
              />
            } 
          />
          <Route 
            path="/categories" 
            element={
              <ProtectedMasterRoute 
                component={CategoryMaster} 
                moduleName="categories" 
                action="view" 
              />
            } 
          />
          <Route 
            path="/brands" 
            element={
              <ProtectedMasterRoute 
                component={BrandMaster} 
                moduleName="brands" 
                action="view" 
              />
            } 
          />
          <Route 
            path="/suppliers" 
            element={
              <ProtectedMasterRoute 
                component={SupplierMaster} 
                moduleName="suppliers" 
                action="view" 
              />
            } 
          />
          <Route 
            path="/roles" 
            element={
              <ProtectedMasterRoute 
                component={RoleMaster} 
                moduleName="roles" 
                action="view" 
              />
            } 
          />
          <Route 
            path="/role-permissions" 
            element={
              <ProtectedMasterRoute 
                component={RolePermissions} 
                moduleName="role-permissions" 
                action="view" 
              />
            } 
          />

          {/* Access Denied */}
          <Route path="/access-denied" element={<AccessDenied />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
