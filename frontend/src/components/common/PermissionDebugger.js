import React from 'react';
import { usePermission } from '../../contexts/PermissionContext';
import { useAuth } from '../../contexts/AuthContext';
import masterModules from '../../config/modules';

const PermissionDebugger = () => {
  const { permissions, isLoading, hasPermission } = usePermission();
  const { currentUser, isAuthenticated } = useAuth();

  // ❗️ Only render in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (isLoading) {
    return <div className="permission-debugger loading">Loading permissions...</div>;
  }

  const actions = ['view', 'create', 'edit', 'delete'];
  const modules = masterModules.map(module => module.toLowerCase());

  return (
    <div className="permission-debugger">
      <h2>Permission Debugger</h2>
      
      <div className="user-info">
        <h3>User Information:</h3>
        <div>User: {currentUser?.username || currentUser?.email || 'Not logged in'}</div>
        <div>ID: {currentUser?.userId || currentUser?.id || 'N/A'}</div>
        <div>Role: {currentUser?.role || 'N/A'}</div>
        <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
      </div>

      <div className="permissions-table">
        <h3>Module Permissions:</h3>
        <table>
          <thead>
            <tr>
              <th>Module</th>
              {actions.map(action => (
                <th key={action}>{action}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map(module => (
              <tr key={module}>
                <td className="module-name">{module}</td>
                {actions.map(action => {
                  const hasAccess = hasPermission(module, action);
                  return (
                    <td 
                      key={`${module}-${action}`} 
                      className={hasAccess ? 'permission-granted' : 'permission-denied'}
                    >
                      {hasAccess ? '✓' : '✗'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="raw-permissions">
        <h3>Raw Permissions Data:</h3>
        <pre>
          {JSON.stringify(permissions, null, 2)}
        </pre>
      </div>

      <div className="user-permissions">
        <h3>User Permissions:</h3>
        <pre>
          {currentUser?.userPermissions ? 
            JSON.stringify(currentUser.userPermissions, null, 2) : 
            'No direct userPermissions found on currentUser'}
        </pre>
      </div>
    </div>
  );
};

export default PermissionDebugger;
