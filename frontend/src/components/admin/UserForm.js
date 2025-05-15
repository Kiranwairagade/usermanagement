import React, { useEffect, useState } from 'react';
import { masterModules, operationsModules, storageModules, adminModules } from '../../config/modules';
import roleService from '../../services/roleService';
import './UserForm.css';

const permissions = ['Create', 'Read', 'Update', 'Delete'];

const PermissionModal = ({ show, onClose, userPermissions, onSave, roleBasedPermissions = [], isRoleAssigned = false }) => {
  const [modalPermissions, setModalPermissions] = useState([]);
  const [activeTab, setActiveTab] = useState('masters');

  const allModules = [...masterModules, ...operationsModules, ...storageModules, ...adminModules];

  useEffect(() => {
    setModalPermissions([...userPermissions]);
  }, [userPermissions]);

  if (!show) return null;

  const isPermissionChecked = (module, action) => {
    // Check user-specific permissions first
    const modulePermission = modalPermissions.find(p => p.moduleName === module);
    if (modulePermission) {
      switch (action) {
        case 'Create': return modulePermission.canCreate || false;
        case 'Read': return modulePermission.canRead || false;
        case 'Update': return modulePermission.canUpdate || false;
        case 'Delete': return modulePermission.canDelete || false;
        default: return false;
      }
    }

    // If role is assigned, check role-based permissions
    if (isRoleAssigned) {
      const rolePermission = roleBasedPermissions.find(p => p.moduleName === module);
      if (rolePermission) {
        switch (action) {
          case 'Create': return rolePermission.canCreate || false;
          case 'Read': return rolePermission.canRead || false;
          case 'Update': return rolePermission.canUpdate || false;
          case 'Delete': return rolePermission.canDelete || false;
          default: return false;
        }
      }
    }
    
    return false;
  };

  const handleCheckboxChange = (module, action) => {
    setModalPermissions(prev => {
      const existingIndex = prev.findIndex(p => p.moduleName === module);
      let updatedPermissions = [...prev];

      if (existingIndex >= 0) {
        const updated = {...updatedPermissions[existingIndex]};
        
        switch (action) {
          case 'Create': updated.canCreate = !updated.canCreate; break;
          case 'Read': updated.canRead = !updated.canRead; break;
          case 'Update': updated.canUpdate = !updated.canUpdate; break;
          case 'Delete': updated.canDelete = !updated.canDelete; break;
          default: break;
        }
        
        updatedPermissions[existingIndex] = updated;
      } else {
        const newPermission = {
          moduleName: module,
          canCreate: action === 'Create',
          canRead: action === 'Read',
          canUpdate: action === 'Update',
          canDelete: action === 'Delete',
        };
        updatedPermissions.push(newPermission);
      }
      
      return updatedPermissions;
    });
  };

  const handleSelectAllForAction = (action) => {
    let modulesToCheck = [];
    switch(activeTab) {
      case 'masters': modulesToCheck = masterModules; break;
      case 'operations': modulesToCheck = operationsModules; break;
      case 'storage': modulesToCheck = storageModules; break;
      case 'admin': modulesToCheck = adminModules; break;
      case 'all': modulesToCheck = allModules; break;
      default: modulesToCheck = masterModules;
    }

    const allModulesHavePermission = modulesToCheck.every(module => 
      isPermissionChecked(module, action)
    );

    const shouldAdd = !allModulesHavePermission;

    setModalPermissions(prev => {
      let updatedPermissions = [...prev];
      
      modulesToCheck.forEach(module => {
        const existingIndex = updatedPermissions.findIndex(p => p.moduleName === module);
        
        if (existingIndex >= 0) {
          const updated = {...updatedPermissions[existingIndex]};
          switch (action) {
            case 'Create': updated.canCreate = shouldAdd; break;
            case 'Read': updated.canRead = shouldAdd; break;
            case 'Update': updated.canUpdate = shouldAdd; break;
            case 'Delete': updated.canDelete = shouldAdd; break;
            default: break;
          }
          updatedPermissions[existingIndex] = updated;
        } else if (shouldAdd) {
          const newPermission = {
            moduleName: module,
            canCreate: action === 'Create',
            canRead: action === 'Read',
            canUpdate: action === 'Update',
            canDelete: action === 'Delete',
          };
          updatedPermissions.push(newPermission);
        }
      });
      
      return updatedPermissions;
    });
  };

  const handleSelectAll = () => {
    let modulesToCheck = [];
    switch(activeTab) {
      case 'masters': modulesToCheck = masterModules; break;
      case 'operations': modulesToCheck = operationsModules; break;
      case 'storage': modulesToCheck = storageModules; break;
      case 'admin': modulesToCheck = adminModules; break;
      case 'all': modulesToCheck = allModules; break;
      default: modulesToCheck = masterModules;
    }

    const allModulesHaveAllPermissions = modulesToCheck.every(module => 
      isPermissionChecked(module, 'Create') && 
      isPermissionChecked(module, 'Read') && 
      isPermissionChecked(module, 'Update') && 
      isPermissionChecked(module, 'Delete')
    );

    const shouldAdd = !allModulesHaveAllPermissions;

    setModalPermissions(prev => {
      let updatedPermissions = [...prev];
      
      modulesToCheck.forEach(module => {
        const existingIndex = updatedPermissions.findIndex(p => p.moduleName === module);
        
        if (existingIndex >= 0) {
          updatedPermissions[existingIndex] = {
            ...updatedPermissions[existingIndex],
            canCreate: shouldAdd,
            canRead: shouldAdd,
            canUpdate: shouldAdd,
            canDelete: shouldAdd
          };
        } else if (shouldAdd) {
          updatedPermissions.push({
            moduleName: module,
            canCreate: shouldAdd,
            canRead: shouldAdd,
            canUpdate: shouldAdd,
            canDelete: shouldAdd
          });
        }
      });
      
      return updatedPermissions;
    });
  };

  const handleSave = () => {
    onSave(modalPermissions);
    onClose();
  };

  const getCurrentModules = () => {
    switch(activeTab) {
      case 'masters': return masterModules;
      case 'operations': return operationsModules;
      case 'storage': return storageModules;
      case 'admin': return adminModules;
      case 'all': return allModules;
      default: return masterModules;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="permission-modal">
        <div className="modal-header">
          <h3>Manage Permissions</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-tabs">
          <button 
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Modules
          </button>
          <button 
            className={`tab-button ${activeTab === 'masters' ? 'active' : ''}`}
            onClick={() => setActiveTab('masters')}
          >
            Masters
          </button>
          <button 
            className={`tab-button ${activeTab === 'operations' ? 'active' : ''}`}
            onClick={() => setActiveTab('operations')}
          >
            Operations
          </button>
          <button 
            className={`tab-button ${activeTab === 'storage' ? 'active' : ''}`}
            onClick={() => setActiveTab('storage')}
          >
            Storage
          </button>
          <button 
            className={`tab-button ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            Admin
          </button>
        </div>
        
        <div className="modal-body">
          <div className="permissions-controls">
            <button 
              type="button" 
              className="select-all-btn"
              onClick={handleSelectAll}
            >
              Select All Permissions
            </button>
          </div>
          
          <table className="permissions-table">
            <thead>
              <tr>
                <th>Module</th>
                {permissions.map(action => (
                  <th key={action} className="action-header">
                    {action}
                    <div className="select-all-action">
                      <button 
                        type="button" 
                        className="select-all-action-btn"
                        onClick={() => handleSelectAllForAction(action)}
                      >
                        Select All
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {getCurrentModules().map(module => (
                <tr key={module}>
                  <td>{module}</td>
                  {permissions.map(action => (
                    <td key={action}>
                      <input
                        type="checkbox"
                        checked={isPermissionChecked(module, action)}
                        onChange={() => handleCheckboxChange(module, action)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn btn-save" onClick={handleSave}>Save Permissions</button>
        </div>
      </div>
    </div>
  );
};

const UserForm = ({ selectedUser = null, onSubmitForm, onCancel, isLoading, error, users = [], onPageChange, onEditUser }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    isActive: true,
    role: 'custom',
    userPermissions: [],
    roleId: null,
    roleBasedPermissions: []
  });

  const [availableRoles, setAvailableRoles] = useState([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [rolesError, setRolesError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  // New state to track if role-based permissions should be saved as user permissions
  const [saveRolePermissions, setSaveRolePermissions] = useState(true);

  const allModules = [...masterModules, ...operationsModules, ...storageModules, ...adminModules];
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    if (onPageChange) onPageChange(pageNumber);
  };

  const mapRolePermissions = (permissions) => {
    if (!Array.isArray(permissions)) return [];

    const groupedByModule = permissions.reduce((acc, perm) => {
      if (!perm.moduleName) return acc;
      
      if (!acc[perm.moduleName]) {
        acc[perm.moduleName] = {
          moduleName: perm.moduleName,
          canCreate: false,
          canRead: false,
          canUpdate: false,
          canDelete: false
        };
      }
      
      if (perm.action === 'create' || perm.canCreate) {
        acc[perm.moduleName].canCreate = true;
      }
      if (perm.action === 'read' || perm.action === 'view' || perm.canRead || perm.canView) {
        acc[perm.moduleName].canRead = true;
      }
      if (perm.action === 'update' || perm.action === 'edit' || perm.canUpdate || perm.canEdit) {
        acc[perm.moduleName].canUpdate = true;
      }
      if (perm.action === 'delete' || perm.canDelete) {
        acc[perm.moduleName].canDelete = true;
      }
      
      return acc;
    }, {});

    return Object.values(groupedByModule);
  };

  useEffect(() => {
    const fetchRoles = async () => {
      setIsLoadingRoles(true);
      setRolesError(null);
      try {
        const response = await roleService.getAllRoles();

        let rolesData = [];
        if (Array.isArray(response)) {
          rolesData = response;
        } else if (response?.$values) {
          rolesData = response.$values;
        } else if (response?.roles) {
          rolesData = Array.isArray(response.roles) ? response.roles : response.roles.$values || [];
        }
        
        const transformedRoles = [
          { id: 'custom', name: 'Custom' }
        ];
        
        rolesData.forEach(role => {
          if (role) {
            const roleId = role.roleId?.toString() || role.id?.toString() || '';
            transformedRoles.push({
              id: roleId,
              name: role.roleName || role.name || 'Unknown Role'
            });
          }
        });
        
        setAvailableRoles(transformedRoles);
      } catch (error) {
        console.error('Failed to fetch roles:', error);
        setRolesError('Failed to load roles. Please try again.');
      } finally {
        setIsLoadingRoles(false);
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      const roleId = selectedUser.roleId ||
        (selectedUser.role && availableRoles.find(r => r.name === selectedUser.role)?.id) ||
        'custom';

      setFormData({
        firstName: selectedUser.firstName || '',
        lastName: selectedUser.lastName || '',
        username: selectedUser.username || '',
        email: selectedUser.email || '',
        password: '',
        confirmPassword: '',
        isActive: selectedUser.isActive ?? true,
        role: roleId,
        roleId: roleId,
        userPermissions: selectedUser.userPermissions || [],
        roleBasedPermissions: selectedUser.roleBasedPermissions || []
      });
      
      // Fetch role permissions if the user has a role assigned
      if (roleId !== 'custom') {
        fetchRolePermissions(roleId);
      }
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        isActive: true,
        role: 'custom',
        roleId: null,
        userPermissions: [],
        roleBasedPermissions: []
      });
    }
  }, [selectedUser, availableRoles]);

  const fetchRolePermissions = async (roleId) => {
    if (roleId === 'custom') return;

    try {
      // Fetch role permissions from backend
      const rolePermissions = await roleService.getRolePermissions(roleId);
      
      // Map the permissions to our format
      const mappedPermissions = mapRolePermissions(rolePermissions);

      // Update form data with the role's permissions
      setFormData(prev => ({
        ...prev,
        roleBasedPermissions: mappedPermissions
      }));
    } catch (error) {
      console.error('Failed to fetch role permissions:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRoleChange = async (e) => {
    const selectedRoleValue = e.target.value;

    // Update form data with selected role
    setFormData(prev => ({
      ...prev,
      role: selectedRoleValue,
      roleId: selectedRoleValue !== 'custom' ? selectedRoleValue : null,
      // Clear role-based permissions when switching to custom
      roleBasedPermissions: selectedRoleValue === 'custom' ? [] : prev.roleBasedPermissions
    }));

    if (selectedRoleValue === 'custom') return;

    try {
      // Fetch role permissions from backend
      const rolePermissions = await roleService.getRolePermissions(selectedRoleValue);
      
      // Map the permissions to our format
      const mappedPermissions = mapRolePermissions(rolePermissions);

      // Update form data with the role's permissions
      setFormData(prev => ({
        ...prev,
        roleBasedPermissions: mappedPermissions
      }));
    } catch (error) {
      console.error('Failed to fetch role permissions:', error);
      // Optionally show an error message to the user
    }
  };

  const isPermissionChecked = (module, action) => {
    // Check user-specific permissions first
    const userPermission = formData.userPermissions.find(p => p.moduleName === module);
    if (userPermission) {
      switch (action) {
        case 'Create': return userPermission.canCreate || false;
        case 'Read': return userPermission.canRead || false;
        case 'Update': return userPermission.canUpdate || false;
        case 'Delete': return userPermission.canDelete || false;
        default: return false;
      }
    }

    // If no user-specific permission, check role-based permissions
    if (formData.role !== 'custom') {
      const rolePermission = formData.roleBasedPermissions.find(p => p.moduleName === module);
      if (rolePermission) {
        switch (action) {
          case 'Create': return rolePermission.canCreate || false;
          case 'Read': return rolePermission.canRead || false;
          case 'Update': return rolePermission.canUpdate || false;
          case 'Delete': return rolePermission.canDelete || false;
          default: return false;
        }
      }
    }

    return false;
  };

  const handlePermissionUpdate = (updatedPermissions) => {
    setFormData(prev => ({
      ...prev,
      userPermissions: updatedPermissions,
      // Only switch to custom if we weren't already custom
      ...(prev.role !== 'custom' ? {
        role: 'custom',
        roleId: null,
        roleBasedPermissions: []
      } : {})
    }));
  };

  const getPermissionSummary = () => {
    const totalPermissions = [
      ...formData.userPermissions,
      ...(formData.role !== 'custom' ? formData.roleBasedPermissions : [])
    ];

    if (totalPermissions.length === 0) {
      return "No permissions assigned";
    } 

    if (formData.role !== 'custom') {
      const selectedRole = availableRoles.find(role => role.id === formData.role);
      const customCount = formData.userPermissions.length;
      
      if (customCount > 0) {
        return `${selectedRole?.name || 'Role'} permissions + ${customCount} custom permissions`;
      }
      return `${selectedRole?.name || 'Role'} permissions`;
    }

    const fullAccessCount = formData.userPermissions.filter(p => 
      p.canCreate && p.canRead && p.canUpdate && p.canDelete
    ).length;

    const readOnlyCount = formData.userPermissions.filter(p => 
      !p.canCreate && p.canRead && !p.canUpdate && !p.canDelete
    ).length;

    const partialAccessCount = formData.userPermissions.length - fullAccessCount - readOnlyCount;

    let summary = [];
    if (fullAccessCount > 0) summary.push(`${fullAccessCount} full access`);
    if (readOnlyCount > 0) summary.push(`${readOnlyCount} read-only`);
    if (partialAccessCount > 0) summary.push(`${partialAccessCount} partial access`);

    return `Custom: ${summary.join(', ')}`;
  };

  // Function to combine role permissions with user permissions for submission
  const combinePermissions = () => {
    // If custom role is selected, we only use user permissions
    if (formData.role === 'custom') {
      return formData.userPermissions;
    }
    
    // If role is assigned and we want to save role permissions
    if (saveRolePermissions) {
      // Combine role-based permissions with any custom user permissions
      const combinedPermissions = [...formData.userPermissions];
      
      // Add role permissions that don't conflict with user permissions
      formData.roleBasedPermissions.forEach(rolePerm => {
        const existingIndex = combinedPermissions.findIndex(p => p.moduleName === rolePerm.moduleName);
        
        if (existingIndex < 0) {
          combinedPermissions.push({ ...rolePerm });
        }
      });
      
      return combinedPermissions;
    }
    
    // If we don't want to save role permissions to user permissions table
    return formData.userPermissions;
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  if (!selectedUser && formData.password !== formData.confirmPassword) {
    alert('Passwords do not match!');
    return;
  }

  // Combine permissions if role is assigned
  const combinedPermissions = combinePermissions();

  const payload = { 
    ...formData,
    // Use combined permissions for the user
    userPermissions: combinedPermissions,
    // Include role ID if not 'custom'
    roleId: formData.role !== 'custom' ? formData.role : null,
    // Convert permissions to backend format
    permissions: [
      // User-specific permissions (including combined permissions from role if applicable)
      ...combinedPermissions.flatMap(perm => {
        const permissions = [];
        if (perm.canCreate) permissions.push({ 
          moduleName: perm.moduleName, 
          action: 'create',
          isUserPermission: true
        });
        if (perm.canRead) permissions.push({ 
          moduleName: perm.moduleName, 
          action: 'read',
          isUserPermission: true
        });
        if (perm.canUpdate) permissions.push({ 
          moduleName: perm.moduleName, 
          action: 'update',
          isUserPermission: true
        });
        if (perm.canDelete) permissions.push({ 
          moduleName: perm.moduleName, 
          action: 'delete',
          isUserPermission: true
        });
        return permissions;
      })
    ]
  };

  // For existing users, don't send password fields
  if (selectedUser) {
    delete payload.password;
    delete payload.confirmPassword;
  }

  onSubmitForm(payload);
};

  const Pagination = ({ usersPerPage, totalUsers, paginate, currentPage }) => {
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(totalUsers / usersPerPage); i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="pagination">
        <button 
          onClick={() => paginate(currentPage - 1)} 
          disabled={currentPage === 1}
          className="page-link"
        >
          &laquo; Prev
        </button>
        
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`page-link ${currentPage === number ? 'active' : ''}`}
          >
            {number}
          </button>
        ))}
        
        <button 
          onClick={() => paginate(currentPage + 1)} 
          disabled={currentPage === Math.ceil(totalUsers / usersPerPage)}
          className="page-link"
        >
          Next &raquo;
        </button>
      </div>
    );
  };

  return (
    <div className="user-form-container">
      {users.length > 0 && (
        <div className="users-list-container">
          <h3>Users List</h3>
          <table className="users-list-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user, index) => (
                <tr key={user.id || index}>
                  <td>{user.username}</td>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.roleName || user.role || 'Custom'}</td>
                  <td>{user.isActive ? 'Active' : 'Inactive'}</td>
                  <td>
                    <button onClick={() => onEditUser(user)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination 
            usersPerPage={usersPerPage} 
            totalUsers={users.length} 
            paginate={paginate} 
            currentPage={currentPage}
          />
        </div>
      )}

      <form className="user-form" onSubmit={handleSubmit}>
        <h2>{selectedUser ? 'Edit User' : 'Add User'}</h2>

        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <input name="firstName" value={formData.firstName} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input name="lastName" value={formData.lastName} onChange={handleInputChange} required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Username</label>
            <input name="username" value={formData.username} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" value={formData.email} onChange={handleInputChange} required />
          </div>
        </div>

        {!selectedUser && (
          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label>Role</label>
            {isLoadingRoles ? (
              <div>Loading roles...</div>
            ) : rolesError ? (
              <div className="error">{rolesError}</div>
            ) : (
              <select 
                name="role" 
                value={formData.role}
                onChange={handleRoleChange}
              >
                {availableRoles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            )}
            {formData.role !== 'custom' && (
              <div className="role-options">
                <p className="role-info">
                  Selecting a role will apply its permissions to this user.
                </p>
                <div className="checkbox-group role-permissions-option">
                  <input
                    type="checkbox"
                    id="saveRolePermissions"
                    checked={saveRolePermissions}
                    onChange={(e) => setSaveRolePermissions(e.target.checked)}
                  />
                  <label htmlFor="saveRolePermissions">
                    Save role permissions to user permissions table
                  </label>
                </div>
              </div>
            )}
          </div>
          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
              />
              <label>Is Active</label>
            </div>
          </div>
        </div>

        <div className="permissions-summary-container">
          <div className="permissions-summary">
            <h3>Permissions</h3>
            <div className="permissions-summary-content">
              <p>{getPermissionSummary()}</p>
              <button 
                type="button" 
                className="manage-permissions-btn"
                onClick={() => setShowPermissionModal(true)}
              >
                Manage Custom Permissions
              </button>
            </div>
          </div>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="form-actions">
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : selectedUser ? 'Update User' : 'Create User'}
          </button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
      
      <PermissionModal
        show={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        userPermissions={formData.userPermissions}
        roleBasedPermissions={formData.roleBasedPermissions}
        isRoleAssigned={formData.role !== 'custom'}
        onSave={handlePermissionUpdate}
      />
    </div>
  );
};

export default UserForm;