import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getUserPermissions } from '../services/userService';
import { masterModules, operationsModules, storageModules, adminModules } from '../config/modules';

const PermissionContext = createContext();

export const usePermission = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermission must be used within a PermissionProvider");
  }
  return context;
};

export const PermissionProvider = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const allModules = [
    ...masterModules,
    ...operationsModules,
    ...storageModules,
    ...adminModules
  ];

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
        // This could return an array or an object with a userPermissions property
        const userData = await getUserPermissions(userId);
        console.log("Received user data:", userData);

        const formattedPermissions = {};

        // Give full access to Admin users
        if (currentUser?.role === 'Admin') {
          allModules.forEach(module => {
            const key = module.toLowerCase().replace(/\s+/g, '-');
            formattedPermissions[key] = { view: true, create: true, edit: true, delete: true };
          });

          setPermissions(formattedPermissions);
          setIsLoading(false);
          return;
        }

        // Handle different possible response formats
        let permissionsArray = [];
        
        if (userData) {
          if (Array.isArray(userData)) {
            // Direct array response
            permissionsArray = userData;
          } else if (userData.userPermissions) {
            // Object with userPermissions property
            if (userData.userPermissions.$values) {
              // Handle .NET serialization format
              permissionsArray = userData.userPermissions.$values;
            } else if (Array.isArray(userData.userPermissions)) {
              permissionsArray = userData.userPermissions;
            }
          }
        }

        // Process permissions array into our format
        permissionsArray.forEach(perm => {
          if (!perm.moduleName) return;
          
          const moduleName = perm.moduleName.toLowerCase().replace(/\s+/g, '-');
          formattedPermissions[moduleName] = {
            view: !!perm.canRead,
            create: !!perm.canCreate,
            edit: !!perm.canUpdate,
            delete: !!perm.canDelete
          };
        });

        // Default permission modules for all authenticated users
      formattedPermissions['user-management'] = formattedPermissions['user-management'] || { view: true };
      formattedPermissions['chatbot'] = formattedPermissions['chatbot'] || { view: true };
      formattedPermissions['dashboard'] = formattedPermissions['dashboard'] || { view: true };


        console.log("Formatted permissions:", formattedPermissions);
        setPermissions(formattedPermissions);
      } catch (err) {
        console.error("Failed to fetch permissions:", err);
        setError(err);
        // Default permissions on error
        setPermissions({
          'user-management': { view: true },
          'chatbot': { view: true }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, [currentUser, isAuthenticated]);

  const hasPermission = (resourceType, action) => {
    if (!resourceType) return false;
    
    const resource = resourceType.toLowerCase().replace(/\s+/g, '-');
    const actionMap = {
      view: 'view',
      read: 'view',
      create: 'create',
      add: 'create',
      edit: 'edit',
      update: 'edit',
      delete: 'delete',
      remove: 'delete'
    };
    
    const mappedAction = action && actionMap[action.toLowerCase()] ? actionMap[action.toLowerCase()] : action?.toLowerCase();
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