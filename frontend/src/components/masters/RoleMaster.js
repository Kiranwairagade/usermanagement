import React, { useEffect, useState } from 'react';
import { usePermission } from '../../contexts/PermissionContext';
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

const RoleMaster = () => {
  const { hasPermission } = usePermission();
  const [roles, setRoles] = useState([]);
  const [roleData, setRoleData] = useState({
    roleName: '',
    description: '',
    isActive: true,
    permissions: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentRoleId, setCurrentRoleId] = useState(null);
  
  // Search and Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState('all');
  const [filteredRoles, setFilteredRoles] = useState([]);

  // Permissions handling
  const [selectedCategory, setSelectedCategory] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({
    Masters: false,
    Operations: false,
    Storage: false,
    Admin: false
  });

  // Check permission helper
  const checkPermission = (module, action) => {
    const normalizedModule = module.toLowerCase().replace(/\s+/g, '-');
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
    const normalizedAction = actionMap[action.toLowerCase()] || action.toLowerCase();
    return hasPermission(normalizedModule, normalizedAction);
  };

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    applySearchAndFilter();
  }, [searchTerm, filterField, roles]);

  const loadRoles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await roleService.getAllRoles();
      if (Array.isArray(data)) {
        setRoles(data);
      } else if (data && typeof data === 'object') {
        const arrayData = Object.values(data).find(val => Array.isArray(val));
        setRoles(arrayData || []);
      } else {
        setRoles([]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setError('Failed to load roles');
      setRoles([]);
      setIsLoading(false);
    }
  };

  const applySearchAndFilter = () => {
    let results = [...roles];
    
    if (searchTerm.trim()) {
      results = results.filter(role => {
        const searchLower = searchTerm.toLowerCase();
        return (
          role.roleName?.toLowerCase().includes(searchLower) ||
          role.description?.toLowerCase().includes(searchLower) ||
          role.roleId?.toString().includes(searchLower)
        );
      });
    }
    
    if (filterField !== 'all') {
      results = results.filter(role => {
        if (filterField === 'active') return role.isActive === true;
        if (filterField === 'inactive') return role.isActive === false;
        return true;
      });
    }
    
    setFilteredRoles(results);
    setCurrentPage(1);
  };

  const handleOpenModal = (mode, role = null) => {
    if (!checkPermission('roles', mode === 'view' ? 'view' : mode === 'edit' ? 'edit' : 'create')) {
      alert(`You don't have permission to ${mode} roles.`);
      return;
    }

    if (role) {
      const permissions = Array.isArray(role.permissions) ? role.permissions : [];
      setRoleData({
        roleName: role.roleName || '',
        description: role.description || '',
        isActive: role.isActive ?? true,
        permissions: permissions
      });
      setCurrentRoleId(role.roleId);
    } else {
      setRoleData({
        roleName: '',
        description: '',
        isActive: true,
        permissions: []
      });
      setCurrentRoleId(null);
    }
    
    setModalMode(mode);
    setShowModal(true);
    setSelectedCategory('');
    setExpandedCategories({
      Masters: false,
      Operations: false,
      Storage: false,
      Admin: false
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setRoleData({
      roleName: '',
      description: '',
      isActive: true,
      permissions: []
    });
    setCurrentRoleId(null);
  };

  const handleDelete = async (id) => {
    if (!checkPermission('roles', 'delete')) {
      alert('You do not have permission to delete roles.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await roleService.deleteRole(id);
        loadRoles();
      } catch (error) {
        if (error.response?.status === 403) {
          alert('Your permissions have changed. Please refresh the page.');
        } else {
          console.error('Error deleting role:', error);
          alert('Failed to delete role. Please try again.');
        }
      }
    }
  };

  const handleSaveRole = async () => {
    const requiredPermission = modalMode === 'add' ? 'create' : 'edit';
    if (!checkPermission('roles', requiredPermission)) {
      alert(`You don't have permission to ${requiredPermission} roles.`);
      return;
    }

    if (!roleData.roleName.trim()) {
      alert('Role name is required!');
      return;
    }

    try {
      const roleToSave = {
        roleName: roleData.roleName,
        description: roleData.description,
        isActive: roleData.isActive,
        permissions: roleData.permissions
      };

      if (modalMode === 'add') {
        await roleService.createRole(roleToSave);
      } else {
        await roleService.updateRole(currentRoleId, roleToSave);
      }
      
      handleCloseModal();
      loadRoles();
    } catch (error) {
      if (error.response?.status === 403) {
        alert(`Your permissions have changed. Please refresh the page.`);
      } else {
        console.error(`Error saving role:`, error);
        alert(`Failed to save role. Please try again.`);
      }
    }
  };

  const handleCategoryToggle = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
    setSelectedCategory(expandedCategories[category] ? '' : category);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRoleData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddPermission = (moduleName, action) => {
    const permissions = Array.isArray(roleData.permissions) ? [...roleData.permissions] : [];
    const existingIndex = permissions.findIndex(
      p => p.moduleName === moduleName && p.action === action
    );

    if (existingIndex >= 0) {
      permissions[existingIndex].isAllowed = !permissions[existingIndex].isAllowed;
    } else {
      permissions.push({
        moduleName,
        action,
        isAllowed: true
      });
    }

    setRoleData(prev => ({
      ...prev,
      permissions
    }));
  };

  const handleRemovePermission = (index) => {
    const permissions = [...roleData.permissions];
    permissions.splice(index, 1);
    setRoleData(prev => ({
      ...prev,
      permissions
    }));
  };

  const isPermissionSelected = (moduleName, action) => {
    return roleData.permissions?.some(
      p => p.moduleName === moduleName && p.action === action && p.isAllowed
    ) || false;
  };

  const toggleAllModulePermissions = (moduleName, select) => {
    const permissions = [...roleData.permissions].filter(p => p.moduleName !== moduleName);
    
    if (select) {
      sidebarModules[moduleName].forEach(action => {
        permissions.push({
          moduleName,
          action,
          isAllowed: true
        });
      });
    }

    setRoleData(prev => ({
      ...prev,
      permissions
    }));
  };

  // Helper functions
  const formatModuleName = (name) => {
    return name.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString() : '-';
  };

  // Pagination
  const totalPages = Math.ceil(filteredRoles.length / pageSize);
  const paginatedRoles = filteredRoles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="master-container">
      <div className="master-header">
        <h1>Role Master</h1>
        
        <div className="search-filter-container">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={() => setSearchTerm('')}>Clear</button>
          </div>
          
          <div className="filter-container">
            <select value={filterField} onChange={(e) => setFilterField(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="active">Active Roles</option>
              <option value="inactive">Inactive Roles</option>
            </select>
          </div>
        </div>
        
        <PermissionCheck 
          moduleName="roles" 
          action="create"
          fallback={null}
        >
          <div className="add-button-container">
            <button onClick={() => handleOpenModal('add')} className="add-btn">
              Add New Role
            </button>
          </div>
        </PermissionCheck>
      </div>

      <div className="master-table">
        {isLoading ? (
          <p>Loading roles...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Role ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Updated At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRoles.length > 0 ? (
                  paginatedRoles.map((role) => (
                    <tr key={role.roleId}>
                      <td>{role.roleId}</td>
                      <td>{role.roleName}</td>
                      <td>{role.description || '-'}</td>
                      <td>
                        <span className={role.isActive ? 'status-active' : 'status-inactive'}>
                          {role.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{formatDate(role.createdAt)}</td>
                      <td>{formatDate(role.updatedAt)}</td>
                      <td>
                        <div className="action-buttons">
                          <PermissionCheck 
                            moduleName="roles" 
                            action="view"
                            showAlways={true}
                            onUnauthorized={() => alert("You don't have permission to view roles")}
                          >
                            <button 
                              className="view-btn" 
                              onClick={() => handleOpenModal('view', role)}
                            >
                              View
                            </button>
                          </PermissionCheck>
                          <PermissionCheck 
                            moduleName="roles" 
                            action="edit"
                            fallback={null}
                          >
                            <button 
                              className="edit-btn" 
                              onClick={() => handleOpenModal('edit', role)}
                            >
                              Edit
                            </button>
                          </PermissionCheck>
                          <PermissionCheck 
                            moduleName="roles" 
                            action="delete"
                            fallback={null}
                          >
                            <button 
                              className="delete-btn" 
                              onClick={() => handleDelete(role.roleId)}
                            >
                              Delete
                            </button>
                          </PermissionCheck>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-results">
                      {searchTerm || filterField !== 'all' 
                        ? "No roles match your search criteria."
                        : "No roles found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {filteredRoles.length > pageSize && (
              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={page === currentPage ? 'active' : ''}
                  >
                    {page}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Role Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-lg">
            <div className="modal-header">
              <h2>
                {modalMode === 'add' ? 'Add New Role' : 
                 modalMode === 'edit' ? 'Edit Role' : 'View Role Details'}
              </h2>
              <button className="close-btn" onClick={handleCloseModal}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="roleName">Role Name {modalMode !== 'view' && '*'}</label>
                <input
                  id="roleName"
                  name="roleName"
                  type="text"
                  value={roleData.roleName}
                  onChange={handleInputChange}
                  placeholder="Enter role name"
                  required
                  disabled={modalMode === 'view'}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={roleData.description}
                  onChange={handleInputChange}
                  placeholder="Enter role description"
                  rows="3"
                  disabled={modalMode === 'view'}
                />
              </div>
              
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={roleData.isActive}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                  />
                  Active
                </label>
              </div>

              {modalMode === 'view' && currentRoleId && (
                <>
                  <div className="form-group">
                    <label>Role ID</label>
                    <input type="text" value={currentRoleId} disabled />
                  </div>
                  <div className="form-group">
                    <label>Created At</label>
                    <input 
                      type="text" 
                      value={formatDate(roles.find(r => r.roleId === currentRoleId)?.createdAt)} 
                      disabled 
                    />
                  </div>
                  <div className="form-group">
                    <label>Updated At</label>
                    <input 
                      type="text" 
                      value={formatDate(roles.find(r => r.roleId === currentRoleId)?.updatedAt)} 
                      disabled 
                    />
                  </div>
                </>
              )}
              
              <div className="permissions-section">
                <h3>Role Permissions</h3>
                
                {modalMode !== 'view' && (
                  <div className="permissions-container-categories">
                    <div className="categories-list">
                      {Object.keys(moduleCategories).map(category => (
                        <div 
                          key={category} 
                          className={`category-item ${expandedCategories[category] ? 'active' : ''}`}
                          onClick={() => handleCategoryToggle(category)}
                        >
                          <span>{category}</span>
                          <span className="arrow">{expandedCategories[category] ? '▼' : '►'}</span>
                        </div>
                      ))}
                    </div>
                    
                    {selectedCategory && (
                      <div className="modules-permissions-table">
                        <h4>{selectedCategory} Modules</h4>
                        <table className="permissions-matrix-table">
                          <thead>
                            <tr>
                              <th>Module</th>
                              {Array.from(
                                new Set(
                                  moduleCategories[selectedCategory].flatMap(
                                    moduleName => sidebarModules[moduleName]
                                  )
                                )
                              ).sort().map(action => (
                                <th key={action}>
                                  {action.charAt(0).toUpperCase() + action.slice(1)}
                                </th>
                              ))}
                              <th>Select All</th>
                            </tr>
                          </thead>
                          <tbody>
                            {moduleCategories[selectedCategory].map(moduleName => {
                              const allActions = Array.from(
                                new Set(
                                  moduleCategories[selectedCategory].flatMap(
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
                                        <input
                                          type="checkbox"
                                          checked={isPermissionSelected(moduleName, action)}
                                          onChange={() => handleAddPermission(moduleName, action)}
                                          disabled={modalMode === 'view'}
                                        />
                                      ) : (
                                        <span className="not-applicable">-</span>
                                      )}
                                    </td>
                                  ))}
                                  <td className="select-all-cell">
                                    <button 
                                      className="select-all-btn"
                                      onClick={() => toggleAllModulePermissions(moduleName, true)}
                                      disabled={modalMode === 'view'}
                                    >
                                      Select All
                                    </button>
                                    <button 
                                      className="clear-all-btn"
                                      onClick={() => toggleAllModulePermissions(moduleName, false)}
                                      disabled={modalMode === 'view'}
                                    >
                                      Clear
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
                
                {roleData.permissions?.length > 0 && (
                  <div className="selected-permissions-summary">
                    <h4>Selected Permissions</h4>
                    <table className="permissions-table">
                      <thead>
                        <tr>
                          <th>Module</th>
                          <th>Action</th>
                          <th>Status</th>
                          {modalMode !== 'view' && <th>Remove</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {roleData.permissions.map((permission, index) => (
                          <tr key={index}>
                            <td>{formatModuleName(permission.moduleName)}</td>
                            <td>{permission.action.charAt(0).toUpperCase() + permission.action.slice(1)}</td>
                            <td>
                              {modalMode !== 'view' ? (
                                <select
                                  value={permission.isAllowed}
                                  onChange={(e) => {
                                    const updatedPermissions = [...roleData.permissions];
                                    updatedPermissions[index].isAllowed = e.target.value === 'true';
                                    setRoleData({
                                      ...roleData,
                                      permissions: updatedPermissions
                                    });
                                  }}
                                >
                                  <option value={true}>Allowed</option>
                                  <option value={false}>Denied</option>
                                </select>
                              ) : (
                                <span className={permission.isAllowed ? 'status-active' : 'status-inactive'}>
                                  {permission.isAllowed ? 'Allowed' : 'Denied'}
                                </span>
                              )}
                            </td>
                            {modalMode !== 'view' && (
                              <td>
                                <button 
                                  onClick={() => handleRemovePermission(index)}
                                  className="remove-btn"
                                >
                                  Remove
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={handleCloseModal} className="cancel-btn">
                {modalMode === 'view' ? 'Close' : 'Cancel'}
              </button>
              {modalMode !== 'view' && (
                <button 
                  onClick={handleSaveRole} 
                  className="save-btn"
                  disabled={!checkPermission('roles', modalMode === 'add' ? 'create' : 'edit')}
                >
                  Save Role
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleMaster;