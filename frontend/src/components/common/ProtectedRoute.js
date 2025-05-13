import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermission } from '../../contexts/PermissionContext';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Component for routes that require specific permissions
 * @param {Object} props - Component props
 * @param {React.ComponentType} props.component - The component to render if authorized
 * @param {string} props.moduleName - Module name to check permission for ('products', 'categories', etc.)
 * @param {string} props.action - Action to check ('view', 'create', 'edit', 'delete')
 */
const ProtectedRoute = ({ component: Component, moduleName, action = 'view', ...rest }) => {
  const { isAuthenticated, loading } = useAuth();
  const { hasPermission, isLoading } = usePermission();
  const location = useLocation();

  // Show loading while checking auth or permissions
  if (loading || isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Checking permissions...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Ensure moduleName is defined before transforming
  if (!moduleName) {
    console.error("ProtectedRoute: 'moduleName' prop is required but was not provided.");
    return (
      <div className="error">
        <h2>Configuration Error</h2>
        <p>ProtectedRoute requires a 'moduleName' prop.</p>
      </div>
    );
  }

  // Normalize module name
  const normalizedModuleName = moduleName.toLowerCase().replace(/\s+/g, '-');

  // Check if user has permission
  const hasAccess = hasPermission(normalizedModuleName, action);
  console.log(`Protection check for ${normalizedModuleName}.${action}: ${hasAccess}`);

  if (!hasAccess) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to access the {moduleName} module.</p>
        <button onClick={() => window.history.back()}>Go Back</button>
      </div>
    );
  }

  // Render the protected component
  return <Component {...rest} />;
};

export default ProtectedRoute;
