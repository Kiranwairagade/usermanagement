// src/hooks/usePermissions.js
import { useContext } from 'react';
import { PermissionContext } from '../contexts/PermissionContext';

/**
 * Custom hook to access permission context
 * @returns {Object} The permission context
 */
const usePermissions = () => {
  const context = useContext(PermissionContext);
  
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  
  return context;
};

export default usePermissions;