import React from 'react';
import { Navigate } from 'react-router-dom';
import usePermissions from '../../hooks/usePermissions';

/**
 * Component to protect modules based on permissions
 * @param {Object} props - Component props
 * @param {React.Component} props.component - The component to render if user has permission
 * @param {string} props.moduleName - The name of the module to check permissions for
 * @param {string} props.action - The action type (create, read, update, delete)
 * @param {Object} props.redirectPath - Where to redirect if permission is denied
 * @returns {React.Component} - The protected component or redirect
 */
const ProtectedModule = ({
  component: Component, 
  moduleName, 
  action = 'read', 
  redirectPath = '/unauthorized',
  ...rest
}) => {
  const { hasPermission } = usePermissions();
  
  // Check if user has the required permission
  if (!hasPermission(moduleName, action)) {
    return <Navigate to={redirectPath} />;
  }
  
  // User has permission, render the component
  return <Component {...rest} />;
};

export default ProtectedModule;