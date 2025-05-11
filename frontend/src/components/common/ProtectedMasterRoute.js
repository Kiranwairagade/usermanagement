// src/components/common/ProtectedMasterRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermission } from '../../contexts/PermissionContext';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Component for master module routes that require specific permissions
 * @param {Object} props - Component props
 * @param {React.ComponentType} props.component - The component to render if authorized
 * @param {string} props.moduleName - Module name to check permission for ('products', 'categories', etc.)
 * @param {string} props.action - Action to check ('view', 'create', 'edit', 'delete')
 */
const ProtectedMasterRoute = ({ component: Component, moduleName, action = 'view' }) => {
  const { isAuthenticated, loading } = useAuth();
  const { hasPermission, isLoading } = usePermission();
  const location = useLocation();

  // Loading state
  if (loading || isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Checking permissions...</p>
      </div>
    );
  }

  // Handle unauthenticated users
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check module permission
  const module = moduleName.toLowerCase();
  const hasAccess = hasPermission(module, action);
  console.log(`Protection check for ${module}.${action}: ${hasAccess}`);

  // Handle unauthorized access
  if (!hasAccess) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to access the {moduleName} module.</p>
        <button onClick={() => window.history.back()}>Go Back</button>
      </div>
    );
  }

  // User is authenticated and has permission, render the component
  return <Component />;
};

export default ProtectedMasterRoute;