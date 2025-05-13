import React from 'react';
import { usePermission } from '../../contexts/PermissionContext';

const PermissionCheck = ({
  moduleName,
  action,
  children,
  fallback = null,
  debug = false,
  showAlways = true,
  onUnauthorized = null
}) => {
  const { hasPermission, isLoading } = usePermission();

  if (isLoading) {
    return debug ? <div>Loading permissions...</div> : null;
  }

  if (debug) {
    console.log(`PermissionCheck for ${moduleName}.${action}`);
  }

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

  const normalizedModuleName = moduleName.toLowerCase().replace(/\s+/g, '-');
  const mappedAction = actionMap[action.toLowerCase()] || action.toLowerCase();
  const permitted = hasPermission(normalizedModuleName, mappedAction);

  if (showAlways) {
    return React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          onClick: (e) => {
            if (!permitted) {
              e.preventDefault();
              e.stopPropagation();
              if (onUnauthorized) {
                onUnauthorized(moduleName, mappedAction);
              } else {
                alert(`You don't have permission to ${action} ${moduleName}.`);
              }
              return;
            }
            if (child.props.onClick) {
              child.props.onClick(e);
            }
          }
        });
      }
      return child;
    });
  }

  return permitted ? children : fallback || (debug ?
    <div style={{ color: 'red', padding: '5px', fontSize: '12px' }}>
      Permission denied: {moduleName}.{action}
    </div> : null);
};

export default PermissionCheck;
