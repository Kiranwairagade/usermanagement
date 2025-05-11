import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import roleService from '../../services/roleService';
import PermissionCheck from '../common/PermissionCheck';
import './MasterStyles.css';

// Define all possible modules from the sidebar
const sidebarModules = {
  // Masters modules
  'categories': ['view', 'create', 'edit', 'delete'],
  'brands': ['view', 'create', 'edit', 'delete'],
  'suppliers': ['view', 'create', 'edit', 'delete'],
  'products': ['view', 'create', 'edit', 'delete'],
  'employees': ['view', 'create', 'edit', 'delete'],
  'roles': ['view', 'create', 'edit', 'delete'],
  
  // Operations modules
  'production-orders': ['view', 'create', 'edit', 'delete', 'approve', 'reject'],
  'material-receipt': ['view', 'create', 'edit', 'delete', 'confirm'],
  'quality-check': ['view', 'create', 'edit', 'delete', 'approve', 'reject'],
  
  // Storage modules
  'inventory-management': ['view', 'create', 'edit', 'delete'],
  'stock-transfers': ['view', 'create', 'edit', 'delete', 'approve'],
  'stock-adjustments': ['view', 'create', 'edit', 'delete', 'approve'],
  
  // Admin modules
  'user-management': ['view', 'create', 'edit', 'delete'],
  'chatbot': ['view', 'configure']
};

// Organize modules by categories to match sidebar structure
const moduleCategories = {
  'Masters': ['categories', 'brands', 'suppliers', 'products', 'employees', 'roles'],
  'Operations': ['production-orders', 'material-receipt', 'quality-check'],
  'Storage': ['inventory-management', 'stock-transfers', 'stock-adjustments'],
  'Admin': ['user-management', 'chatbot']
};

const RolePermissions = () => {
  const { roleId } = useParams();
  const navigate = useNavigate();
  
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // For UI expansion state
  const [expandedCategories, setExpandedCategories] = useState({
    Masters: true,
    Operations: false,
    Storage: false,
    Admin: false
  });

  useEffect(() => {
    loadRoleWithPermissions();
  }, [roleId]);

  const loadRoleWithPermissions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get role details
      const roleData = await roleService.getRoleById(roleId);
      setRole(roleData);
      
      // Get role permissions
      const permissionsData = await roleService.getRolePermissions(roleId);
      setPermissions(permissionsData);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading role permissions:', error);
      setError('Failed to load role permissions');
      setIsLoading(false);
    }
  };

  const handleCategoryToggle = (category) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category]
    });
  };

  // Format module name for display
  const formatModuleName = (name) => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const isPermissionAllowed = (moduleName, action) => {
    const permission = permissions.find(
      p => p.moduleName === moduleName && p.action === action
    );
    return permission ? permission.isAllowed : false;
  };

  const handlePermissionToggle = (moduleName, action) => {
    setHasChanges(true);
    
    // Check if permission exists already
    const existingPermIndex = permissions.findIndex(
      p => p.moduleName === moduleName && p.action === action
    );
    
    if (existingPermIndex >= 0) {
      // Toggle existing permission
      const updatedPermissions = [...permissions];
      updatedPermissions[existingPermIndex] = {
        ...updatedPermissions[existingPermIndex],
        isAllowed: !updatedPermissions[existingPermIndex].isAllowed
      };
      setPermissions(updatedPermissions);
    } else {
      // Add new permission
      setPermissions([
        ...permissions,
        {
          moduleName,
          action,
          isAllowed: true,
          roleId: parseInt(roleId)
        }
      ]);
    }
  };

  // Toggle all permissions for a module
  const toggleAllModulePermissions = (moduleName, select) => {
    setHasChanges(true);
    const moduleActions = sidebarModules[moduleName];
    const updatedPermissions = [...permissions];
    
    moduleActions.forEach(action => {
      const permIndex = permissions.findIndex(
        p => p.moduleName === moduleName && p.action === action
      );
      
      if (permIndex >= 0) {
        // Update existing permission
        updatedPermissions[permIndex] = {
          ...updatedPermissions[permIndex],
          isAllowed: select
        };
      } else if (select) {
        // Add new permission only if selecting
        updatedPermissions.push({
          moduleName,
          action,
          isAllowed: true,
          roleId: parseInt(roleId)
        });
      }
    });
    
    setPermissions(updatedPermissions);
  };

  const savePermissions = async () => {
    try {
      setIsSaving(true);
      
      // Format permissions for the API
      const permissionsData = {
        roleId: parseInt(roleId),
        permissions: permissions.map(p => ({
          moduleName: p.moduleName,
          action: p.action,
          isAllowed: p.isAllowed
        }))
      };
      
      await roleService.updateRolePermissions(permissionsData);
      
      setIsSaving(false);
      setHasChanges(false);
      alert('Permissions saved successfully!');
    } catch (error) {
      console.error('Error saving permissions:', error);
      setIsSaving(false);
      alert('Failed to save permissions. Please try again.');
    }
  };

  const handleGoBack = () => {
    if (hasChanges) {
      const confirm = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (confirm) {
        navigate('/admin/roles');
      }
    } else {
      navigate('/admin/roles');
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!role) {
    return <div className="error">Role not found</div>;
  }

  return (
    <div className="master-container">
      <div className="master-header">
        <h1>Role Permissions: {role.roleName}</h1>
        <div className="header-buttons">
          <button onClick={handleGoBack} className="back-btn">
            Back to Roles
          </button>
          <PermissionCheck 
            moduleName="roles" 
            action="edit"
            fallback={<p>You don't have permission to edit role permissions.</p>}
          >
            <button 
              onClick={savePermissions} 
              className="save-btn"
              disabled={isSaving || !hasChanges}
            >
              {isSaving ? 'Saving...' : 'Save Permissions'}
            </button>
          </PermissionCheck>
        </div>
      </div>

      <div className="role-info">
        <div className="info-item">
          <strong>Role ID:</strong> {role.roleId}
        </div>
        <div className="info-item">
          <strong>Description:</strong> {role.description || '-'}
        </div>
        <div className="info-item">
          <strong>Status:</strong> 
          <span className={role.isActive ? 'status-active' : 'status-inactive'}>
            {role.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="permissions-container">
        {Object.keys(moduleCategories).map(category => (
          <div className="permission-category" key={category}>
            <div 
              className={`category-header ${expandedCategories[category] ? 'expanded' : ''}`}
              onClick={() => handleCategoryToggle(category)}
            >
              <h3>{category}</h3>
              <span className="arrow">{expandedCategories[category] ? '▼' : '►'}</span>
            </div>
            
            {expandedCategories[category] && (
              <div className="category-modules">
                <table className="permissions-table">
                  <thead>
                    <tr>
                      <th>Module</th>
                      {Array.from(
                        new Set(
                          moduleCategories[category].flatMap(
                            moduleName => sidebarModules[moduleName]
                          )
                        )
                      ).sort().map(action => (
                        <th key={action}>
                          {action.charAt(0).toUpperCase() + action.slice(1)}
                        </th>
                      ))}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {moduleCategories[category].map(moduleName => {
                      const allActions = Array.from(
                        new Set(
                          moduleCategories[category].flatMap(
                            m => sidebarModules[m]
                          )
                        )
                      ).sort();
                      
                      return (
                        <tr key={moduleName}>
                          <td>{formatModuleName(moduleName)}</td>
                          {allActions.map(action => (
                            <td key={`${moduleName}-${action}`} className="permission-checkbox-cell">
                              {sidebarModules[moduleName].includes(action) ? (
                                <PermissionCheck 
                                  moduleName="roles" 
                                  action="edit"
                                  showAlways={true}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isPermissionAllowed(moduleName, action)}
                                    onChange={() => handlePermissionToggle(moduleName, action)}
                                  />
                                </PermissionCheck>
                              ) : (
                                <span className="not-applicable">-</span>
                              )}
                            </td>
                          ))}
                          <td className="select-all-cell">
                            <PermissionCheck 
                              moduleName="roles" 
                              action="edit"
                              showAlways={true}
                            >
                              <button 
                                className="select-all-btn"
                                onClick={() => toggleAllModulePermissions(moduleName, true)}
                              >
                                Select All
                              </button>
                              <button 
                                className="clear-all-btn"
                                onClick={() => toggleAllModulePermissions(moduleName, false)}
                              >
                                Clear
                              </button>
                            </PermissionCheck>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RolePermissions;