import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getUserPermissions } from '../services/userService'; // Adjust the path if necessary

// Create Context
const PermissionContext = createContext();

// Custom Hook
export const usePermission = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermission must be used within a PermissionProvider");
  }
  return context;
};

// Provider Component
export const PermissionProvider = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // Added error state

 // fetchPermissions function in useEffect
// In PermissionContext.js - Update the fetchPermissions function
useEffect(() => {
  const fetchPermissions = async () => {
    if (!currentUser || !isAuthenticated) {
      setPermissions({});
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const userId = currentUser.userId || currentUser.id;

      if (!userId) {
        console.error("No user ID found in currentUser object:", currentUser);
        setPermissions({});
        setIsLoading(false);
        return;
      }

      console.log("Fetching permissions for userId:", userId);
      const userData = await getUserPermissions(userId);
      console.log("Received user data:", userData);

      // Format permissions
      const formattedPermissions = {};

      if (currentUser?.role === 'Admin') {
        // Simplified: Grant all permissions.
        ['products', 'categories', 'brands', 'suppliers', 'roles','users'].forEach(module => {
          formattedPermissions[module] = { view: true, create: true, edit: true, delete: true };
        });
        setPermissions(formattedPermissions);
        setIsLoading(false);
        return;
      }

      // Extract permissions from the nested structure
      let permissionsArray = [];
      
      if (userData?.userPermissions) {
        // Handle case where userPermissions might be an object with $values
        if (userData.userPermissions.$values) {
          permissionsArray = userData.userPermissions.$values;
        } 
        // Handle case where userPermissions is already an array
        else if (Array.isArray(userData.userPermissions)) {
          permissionsArray = userData.userPermissions;
        }
      }
      
      // Process permissions
      permissionsArray.forEach(perm => {
        // Convert moduleName to lowercase for consistency
        const moduleName = perm.moduleName?.toLowerCase();
        if (moduleName) {
          formattedPermissions[moduleName] = {
            view: !!perm.canRead,
            create: !!perm.canCreate,
            edit: !!perm.canUpdate,
            delete: !!perm.canDelete,
          };
        }
      });

      // Ensure 'users' module has view permission for authenticated users
      if (!formattedPermissions['users']) {
        formattedPermissions['users'] = { view: true };
      }

      console.log("Formatted permissions:", formattedPermissions);
      setPermissions(formattedPermissions);
    } catch (err) {
      setError(err);
      console.error("Failed to fetch permissions:", err);
      setPermissions({ users: { view: true } }); // Basic default
    } finally {
      setIsLoading(false);
    }
  };

  fetchPermissions();
}, [currentUser, isAuthenticated]);

  const hasPermission = (resourceType, action) => {
    if (!resourceType || !action) return false;

    const resource = resourceType.toLowerCase();
    const actionMap = {
      'view': 'view',
      'read': 'view',
      'create': 'create',
      'add': 'create',
      'edit': 'edit',
      'update': 'edit',
      'delete': 'delete',
      'remove': 'delete'
    };
    const mappedAction = actionMap[action.toLowerCase()] || action.toLowerCase();

    const permission = !!permissions[resource]?.[mappedAction];
    console.log(`Checking permission: ${resource}.${mappedAction} - Result: ${permission}`);
    return permission;
  };

  return (
    <PermissionContext.Provider value={{ permissions, hasPermission, isLoading, error }}>
      {children}
    </PermissionContext.Provider>
  );
};

export default PermissionContext;
