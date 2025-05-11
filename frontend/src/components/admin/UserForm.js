import React, { useEffect, useState } from 'react';
import { masterModules, operationsModules, storageModules, adminModules } from '../../config/modules';
import roleService from '../../services/roleService';
import './UserForm.css';

const permissions = ['Create', 'Read', 'Update', 'Delete'];

// Modal component for permission management
const PermissionModal = ({ show, onClose, userPermissions, onSave }) => {
  const [modalPermissions, setModalPermissions] = useState([]);
  const [activeTab, setActiveTab] = useState('masters');
  
  // Combine all modules into one array
  const allModules = [...masterModules, ...operationsModules, ...storageModules, ...adminModules];
  
  useEffect(() => {
    setModalPermissions([...userPermissions]);
  }, [userPermissions]);
  
  if (!show) return null;
  
  // Helper function to check if a permission is checked
  const isPermissionChecked = (module, action) => {
    const modulePermission = modalPermissions.find(p => p.moduleName === module);
    if (!modulePermission) return false;
    
    switch (action) {
      case 'Create': return modulePermission.canCreate || false;
      case 'Read': return modulePermission.canRead || false;
      case 'Update': return modulePermission.canUpdate || false;
      case 'Delete': return modulePermission.canDelete || false;
      default: return false;
    }
  };
  
  // Handle permission checkbox change
  const handleCheckboxChange = (module, action) => {
    setModalPermissions(prev => {
      // Find if this module permission already exists
      const existingIndex = prev.findIndex(p => p.moduleName === module);
      let updatedPermissions = [...prev];
      
      if (existingIndex >= 0) {
        // Update existing permission
        const updated = {
          ...updatedPermissions[existingIndex],
        };
        
        // Toggle the specific permission
        switch (action) {
          case 'Create': updated.canCreate = !updated.canCreate; break;
          case 'Read': updated.canRead = !updated.canRead; break;
          case 'Update': updated.canUpdate = !updated.canUpdate; break;
          case 'Delete': updated.canDelete = !updated.canDelete; break;
          default: break;
        }
        
        updatedPermissions[existingIndex] = updated;
      } else {
        // Create new permission for this module
        const newPermission = {
          moduleName: module,
          canCreate: action === 'Create' ? true : false,
          canRead: action === 'Read' ? true : false,
          canUpdate: action === 'Update' ? true : false,
          canDelete: action === 'Delete' ? true : false,
        };
        
        updatedPermissions.push(newPermission);
      }
      
      return updatedPermissions;
    });
  };
  
  // New function to handle selecting all permissions for a specific action
  const handleSelectAllForAction = (action) => {
    // Check if all modules in current tab already have this permission
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
    
    // If all already have permission, we'll remove it from all; otherwise add to all
    const shouldAdd = !allModulesHavePermission;
    
    setModalPermissions(prev => {
      let updatedPermissions = [...prev];
      
      modulesToCheck.forEach(module => {
        const existingIndex = updatedPermissions.findIndex(p => p.moduleName === module);
        
        if (existingIndex >= 0) {
          // Update existing permission
          const updated = { ...updatedPermissions[existingIndex] };
          
          // Set the specific permission based on shouldAdd
          switch (action) {
            case 'Create': updated.canCreate = shouldAdd; break;
            case 'Read': updated.canRead = shouldAdd; break;
            case 'Update': updated.canUpdate = shouldAdd; break;
            case 'Delete': updated.canDelete = shouldAdd; break;
            default: break;
          }
          
          updatedPermissions[existingIndex] = updated;
        } else if (shouldAdd) {
          // Only create new permission if we're adding
          const newPermission = {
            moduleName: module,
            canCreate: action === 'Create' ? true : false,
            canRead: action === 'Read' ? true : false,
            canUpdate: action === 'Update' ? true : false,
            canDelete: action === 'Delete' ? true : false,
          };
          
          updatedPermissions.push(newPermission);
        }
      });
      
      return updatedPermissions;
    });
  };
  
  // New function to select all permissions for current tab modules
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
    
    // Check if all modules already have all permissions
    const allModulesHaveAllPermissions = modulesToCheck.every(module => 
      isPermissionChecked(module, 'Create') && 
      isPermissionChecked(module, 'Read') && 
      isPermissionChecked(module, 'Update') && 
      isPermissionChecked(module, 'Delete')
    );
    
    // If all already have all permissions, we'll remove all; otherwise add all
    const shouldAdd = !allModulesHaveAllPermissions;
    
    setModalPermissions(prev => {
      let updatedPermissions = [...prev];
      
      modulesToCheck.forEach(module => {
        const existingIndex = updatedPermissions.findIndex(p => p.moduleName === module);
        
        if (existingIndex >= 0) {
          // Update existing permission
          updatedPermissions[existingIndex] = {
            ...updatedPermissions[existingIndex],
            canCreate: shouldAdd,
            canRead: shouldAdd,
            canUpdate: shouldAdd,
            canDelete: shouldAdd
          };
        } else if (shouldAdd) {
          // Create new permission
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
  
  // Function to handle save and close
  const handleSave = () => {
    onSave(modalPermissions);
    onClose();
  };
  
  // Get current modules based on active tab
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
          <button className="close-btn" onClick={onClose}>&times;</button>
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
    role: 'Custom', // Default role
    userPermissions: [],
  });
  
  // State for available roles from database
  const [availableRoles, setAvailableRoles] = useState([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10); // Default page size
  
  // Get current users
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  
  // Change page
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    if (onPageChange) {
      onPageChange(pageNumber);
    }
  };

  // Combine all modules into one array
  const allModules = [...masterModules, ...operationsModules, ...storageModules, ...adminModules];

  // Fetch roles from database
  useEffect(() => {
    const fetchRoles = async () => {
      setIsLoadingRoles(true);
      try {
        const roles = await roleService.getAllRoles();
        // Transform roles data as needed
        setAvailableRoles([
          { id: 'custom', name: 'Custom' }, // Always keep Custom option
          ...roles.map(role => ({ id: role.id, name: role.name }))
        ]);
      } catch (error) {
        console.error('Failed to fetch roles:', error);
      } finally {
        setIsLoadingRoles(false);
      }
    };
    
    fetchRoles();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setFormData({
        firstName: selectedUser.firstName || '',
        lastName: selectedUser.lastName || '',
        username: selectedUser.username || '',
        email: selectedUser.email || '',
        password: '',
        confirmPassword: '',
        isActive: selectedUser.isActive ?? true,
        role: selectedUser.role || 'Custom',
        userPermissions: selectedUser.userPermissions || [],
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        isActive: true,
        role: 'Custom',
        userPermissions: [],
      });
    }
  }, [selectedUser]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle role change
  const handleRoleChange = async (e) => {
    const selectedRoleValue = e.target.value;
    
    // Update the form data with the new role
    setFormData(prev => {
      const updatedData = {
        ...prev,
        role: selectedRoleValue,
      };
      
      return updatedData;
    });
    
    // If Custom role is selected, don't fetch permissions
    if (selectedRoleValue === 'Custom') {
      return;
    }
    
    // Fetch role permissions for selected role
    try {
      const roleData = await roleService.getRoleById(selectedRoleValue);
      
      if (roleData && roleData.rolePermissions) {
        setFormData(prev => ({
          ...prev,
          userPermissions: roleData.rolePermissions
        }));
      }
    } catch (error) {
      console.error('Failed to fetch role permissions:', error);
    }
  };

  const handleCheckboxChange = (module, action) => {
    // If using a predefined role, switch to Custom when manually changing permissions
    if (formData.role !== 'Custom') {
      setFormData(prev => ({
        ...prev,
        role: 'Custom'
      }));
    }
    
    setFormData(prev => {
      // Find if this module permission already exists
      const existingIndex = prev.userPermissions.findIndex(p => p.moduleName === module);
      let updatedPermissions = [...prev.userPermissions];
      
      if (existingIndex >= 0) {
        // Update existing permission
        const updated = {
          ...updatedPermissions[existingIndex],
        };
        
        // Toggle the specific permission
        switch (action) {
          case 'Create': updated.canCreate = !updated.canCreate; break;
          case 'Read': updated.canRead = !updated.canRead; break;
          case 'Update': updated.canUpdate = !updated.canUpdate; break;
          case 'Delete': updated.canDelete = !updated.canDelete; break;
          default: break;
        }
        
        updatedPermissions[existingIndex] = updated;
      } else {
        // Create new permission for this module
        const newPermission = {
          moduleName: module,
          canCreate: action === 'Create' ? true : false,
          canRead: action === 'Read' ? true : false,
          canUpdate: action === 'Update' ? true : false,
          canDelete: action === 'Delete' ? true : false,
        };
        
        updatedPermissions.push(newPermission);
      }
      
      return {
        ...prev,
        userPermissions: updatedPermissions
      };
    });
  };

  // Helper function to check if a permission is checked
  const isPermissionChecked = (module, action) => {
    const modulePermission = formData.userPermissions.find(p => p.moduleName === module);
    if (!modulePermission) return false;
    
    switch (action) {
      case 'Create': return modulePermission.canCreate || false;
      case 'Read': return modulePermission.canRead || false;
      case 'Update': return modulePermission.canUpdate || false;
      case 'Delete': return modulePermission.canDelete || false;
      default: return false;
    }
  };

  // New function to handle selecting all permissions for a specific action
  const handleSelectAllForAction = (action) => {
    // Switch to Custom role when manually changing permissions
    if (formData.role !== 'Custom') {
      setFormData(prev => ({
        ...prev,
        role: 'Custom'
      }));
    }
    
    // Check if all modules already have this permission
    const allModulesHavePermission = allModules.every(module => 
      isPermissionChecked(module, action)
    );
    
    // If all already have permission, we'll remove it from all; otherwise add to all
    const shouldAdd = !allModulesHavePermission;
    
    setFormData(prev => {
      let updatedPermissions = [...prev.userPermissions];
      
      allModules.forEach(module => {
        const existingIndex = updatedPermissions.findIndex(p => p.moduleName === module);
        
        if (existingIndex >= 0) {
          // Update existing permission
          const updated = { ...updatedPermissions[existingIndex] };
          
          // Set the specific permission based on shouldAdd
          switch (action) {
            case 'Create': updated.canCreate = shouldAdd; break;
            case 'Read': updated.canRead = shouldAdd; break;
            case 'Update': updated.canUpdate = shouldAdd; break;
            case 'Delete': updated.canDelete = shouldAdd; break;
            default: break;
          }
          
          updatedPermissions[existingIndex] = updated;
        } else if (shouldAdd) {
          // Only create new permission if we're adding
          const newPermission = {
            moduleName: module,
            canCreate: action === 'Create' ? true : false,
            canRead: action === 'Read' ? true : false,
            canUpdate: action === 'Update' ? true : false,
            canDelete: action === 'Delete' ? true : false,
          };
          
          updatedPermissions.push(newPermission);
        }
      });
      
      return {
        ...prev,
        userPermissions: updatedPermissions
      };
    });
  };

  // New function to select all permissions for All Modules
  const handleSelectAll = () => {
    // Switch to Custom role when manually changing permissions
    if (formData.role !== 'Custom') {
      setFormData(prev => ({
        ...prev,
        role: 'Custom'
      }));
    }
    
    // Check if all modules already have all permissions
    const allModulesHaveAllPermissions = allModules.every(module => 
      isPermissionChecked(module, 'Create') && 
      isPermissionChecked(module, 'Read') && 
      isPermissionChecked(module, 'Update') && 
      isPermissionChecked(module, 'Delete')
    );
    
    // If all already have all permissions, we'll remove all; otherwise add all
    const shouldAdd = !allModulesHaveAllPermissions;
    
    const newPermissions = allModules.map(module => ({
      moduleName: module,
      canCreate: shouldAdd,
      canRead: shouldAdd,
      canUpdate: shouldAdd,
      canDelete: shouldAdd
    }));
    
    setFormData(prev => ({
      ...prev,
      userPermissions: newPermissions
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedUser && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    const payload = { ...formData };

    if (selectedUser) {
      delete payload.password;
      delete payload.confirmPassword;
    }

    onSubmitForm(payload);
  };

  // Pagination component
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

  // State to manage the permission modal
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // Function to handle updates from the permission modal
  const handlePermissionUpdate = (updatedPermissions) => {
    setFormData(prev => ({
      ...prev,
      userPermissions: updatedPermissions,
      role: 'Custom' // Switch to custom role when permissions are manually updated
    }));
  };
  
  // Function to generate permission summary text
  const getPermissionSummary = () => {
    const totalModules = masterModules.length + operationsModules.length + 
                         storageModules.length + adminModules.length;
    
    const modulesWithPermissions = formData.userPermissions.length;
    
    if (modulesWithPermissions === 0) {
      return "No permissions assigned";
    } 
    
    if (formData.role !== 'Custom') {
      return `${formData.role} role permissions`;
    }
    
    const fullAccessCount = formData.userPermissions.filter(p => 
      p.canCreate && p.canRead && p.canUpdate && p.canDelete
    ).length;
    
    const readOnlyCount = formData.userPermissions.filter(p => 
      !p.canCreate && p.canRead && !p.canUpdate && !p.canDelete
    ).length;
    
    const partialAccessCount = modulesWithPermissions - fullAccessCount - readOnlyCount;
    
    let summary = [];
    if (fullAccessCount > 0) {
      summary.push(`${fullAccessCount} modules with full access`);
    }
    if (readOnlyCount > 0) {
      summary.push(`${readOnlyCount} modules with read-only access`);
    }
    if (partialAccessCount > 0) {
      summary.push(`${partialAccessCount} modules with partial access`);
    }
    
    return summary.join(', ');
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
                  <td>{user.role || 'Custom'}</td>
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
            ) : (
              <select 
                name="role" 
                value={formData.role} 
                onChange={handleRoleChange}
              >
                {availableRoles.map(role => (
                  <option key={role.id} value={role.id === 'custom' ? 'Custom' : role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            )}
            {formData.role !== 'Custom' && (
              <p className="role-info">
                Selecting a predefined role will set default permissions. You can customize further by selecting 'Custom'.
              </p>
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
                Manage Permissions
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
      
      {/* Permission Modal */}
      <PermissionModal
        show={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        userPermissions={formData.userPermissions}
        onSave={handlePermissionUpdate}
      />
    </div>
  );
};

export default UserForm;