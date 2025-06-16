import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import ProtectedRoute from './components/common/ProtectedRoute';

import Login from './components/auth/Login';
import Signup from './components/auth/Signup';

import Dashboard from './components/admin/Dashboard';
import UserManagement from './components/admin/UserManagement';
import ActivityLog from './components/admin/ActivityLogPage';          // ✅ NEW IMPORT

// Master components
import ProductMaster from './components/masters/ProductMaster';
import CategoryMaster from './components/masters/CategoryMaster';
import BrandMaster from './components/masters/BrandMaster';
import SupplierMaster from './components/masters/SupplierMaster';
import RoleMaster from './components/masters/RoleMaster';
import RolePermissions from './components/masters/RolePermissions';

// Operations components
import ProductionOrders from './components/operations/ProductionOrders';
import MaterialReceipt from './components/operations/MaterialReceipt';
import QualityCheck from './components/operations/QualityCheck';

// Storage components
import InventoryManagement from './components/storage/InventoryManagement';
import StockTransfers from './components/storage/StockTransfers';
import StockAdjustments from './components/storage/StockAdjustments';

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
          <Route path="/dashboard" element={<ProtectedRoute component={Dashboard} moduleName="dashboard" action="view" />} />
          <Route path="/chatbot" element={<ProtectedRoute component={Chatbot} moduleName="chatbot" action="view" />} />
          <Route path="/activity-log" element={                       /* ✅ NEW ROUTE */
            <ProtectedRoute 
              component={ActivityLog} 
              moduleName="activity-log" 
              action="view" 
            />
          } />

          {/* Admin Routes */}
          <Route 
            path="/user-management" 
            element={<ProtectedRoute component={UserManagement} moduleName="user-management" action="view" />} 
          />

          {/* Master Routes */}
          <Route path="/products"   element={<ProtectedRoute component={ProductMaster}   moduleName="products"   action="view" />} />
          <Route path="/categories" element={<ProtectedRoute component={CategoryMaster} moduleName="categories" action="view" />} />
          <Route path="/brands"     element={<ProtectedRoute component={BrandMaster}    moduleName="brands"     action="view" />} />
          <Route path="/suppliers"  element={<ProtectedRoute component={SupplierMaster} moduleName="suppliers"  action="view" />} />
          <Route path="/roles"      element={<ProtectedRoute component={RoleMaster}     moduleName="roles"      action="view" />} />
          <Route path="/role-permissions" element={<ProtectedRoute component={RolePermissions} moduleName="role-permissions" action="view" />} />

          {/* Operations Routes */}
          <Route path="/production-orders" element={<ProtectedRoute component={ProductionOrders} moduleName="production-orders" action="view" />} />
          <Route path="/material-receipt"  element={<ProtectedRoute component={MaterialReceipt}  moduleName="material-receipt"  action="view" />} />
          <Route path="/quality-check"     element={<ProtectedRoute component={QualityCheck}     moduleName="quality-check"     action="view" />} />

          {/* Storage Routes */}
          <Route path="/inventory-management" element={<ProtectedRoute component={InventoryManagement} moduleName="inventory-management" action="view" />} />
          <Route path="/stock-transfers"      element={<ProtectedRoute component={StockTransfers}      moduleName="stock-transfers"      action="view" />} />
          <Route path="/stock-adjustments"    element={<ProtectedRoute component={StockAdjustments}    moduleName="stock-adjustments"    action="view" />} />

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
