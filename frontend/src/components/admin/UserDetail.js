import React, { useEffect, useState } from 'react';
import { getUserWithPermissions } from '../../services/userService';
import { masterModules, operationsModules, storageModules, adminModules } from '../../config/modules';
import './UserDetail.css';

const UserDetail = ({ userId, onClose, onEdit }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    } else {
      setError('User ID is required');
      setLoading(false);
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      // Use the combined function to get user with permissions
      const userWithPermissions = await getUserWithPermissions(userId);
      
      if (!userWithPermissions) {
        setError('User data not found');
        setLoading(false);
        return;
      }

      setUser(userWithPermissions);
      setError(null);
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError('Failed to load user details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date) ? 'Invalid Date' : date.toLocaleDateString();
  };

  const hasPermission = (module, action) => {
    if (!user || !user.userPermissions) return false;
    const moduleLower = module.toLowerCase();
    const modulePermission = user.userPermissions.find(p =>
      p.moduleName?.toLowerCase() === moduleLower
    );
    if (!modulePermission) return false;
    switch (action) {
      case 'Create': return modulePermission.canCreate || false;
      case 'Read': return modulePermission.canRead || false;
      case 'Update': return modulePermission.canUpdate || false;
      case 'Delete': return modulePermission.canDelete || false;
      default: return false;
    }
  };

  // Get current modules based on active tab
  const getCurrentModules = () => {
    switch(activeTab) {
      case 'masters': return masterModules;
      case 'operations': return operationsModules;
      case 'storage': return storageModules;
      case 'admin': return adminModules;
      case 'all': return [...masterModules, ...operationsModules, ...storageModules, ...adminModules];
      default: return masterModules;
    }
  };

  // Calculate permission statistics for summary
  const getPermissionStats = () => {
    if (!user || !user.userPermissions) return { total: 0, full: 0, read: 0, partial: 0, none: 0 };
    
    const allModules = [...masterModules, ...operationsModules, ...storageModules, ...adminModules];
    
    // Count modules with different permission levels
    let full = 0, read = 0, partial = 0, none = 0;
    
    allModules.forEach(module => {
      const modulePermission = user.userPermissions.find(p => 
        p.moduleName?.toLowerCase() === module.toLowerCase()
      );
      
      if (!modulePermission) {
        none++;
      } else if (modulePermission.canCreate && modulePermission.canRead && 
                modulePermission.canUpdate && modulePermission.canDelete) {
        full++;
      } else if (!modulePermission.canCreate && modulePermission.canRead && 
                !modulePermission.canUpdate && !modulePermission.canDelete) {
        read++;
      } else {
        partial++;
      }
    });
    
    return {
      total: allModules.length,
      full,
      read,
      partial,
      none
    };
  };

  const togglePermissionsModal = () => {
    setShowPermissionsModal(!showPermissionsModal);
  };

  if (loading) return <div className="loading-container"><div className="loading">Loading user details...</div></div>;
  if (error) return <div className="error-container"><div className="error">{error}</div></div>;
  if (!user) return <div className="not-found-container"><div className="not-found">User not found</div></div>;

  const permStats = getPermissionStats();

  return (
    <div className="user-detail-container">
      <div className="user-detail-header">
        <h2>User Details</h2>
        <div className="user-detail-actions">
          <button className="btn btn-edit" onClick={() => onEdit(user)}>Edit</button>
          <button className="btn btn-close" onClick={onClose}>Close</button>
        </div>
      </div>

      <div className="user-detail-row vertical-layout">
        <div className="user-detail-column">
          <div className="user-profile-card">
            <div className="user-avatar-name">
              <div className="user-avatar">
                {user.firstName && user.lastName ?
                  `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` :
                  user.username?.substring(0, 2) || 'U'}
              </div>
              <h3 className="user-fullname">
                {`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'No Name'}
              </h3>
            </div>

            <div className="user-detail-info">
              <div className="info-grid two-column">
                <div className="info-item">
                  <span className="info-label">User ID</span>
                  <span className="info-value">{user.userId || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Username</span>
                  <span className="info-value">{user.username || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-value">{user.email || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status</span>
                  <span className={`info-value status-${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Role</span>
                  <span className="info-value">{user.role || 'Custom'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Created</span>
                  <span className="info-value">{formatDate(user.createdAt)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Last Updated</span>
                  <span className="info-value">{formatDate(user.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="user-permissions-section">
            <div className="permissions-header">
              <h3>User Permissions</h3>
              <button 
                className="btn btn-view"
                onClick={togglePermissionsModal}
              >
                View Permissions
              </button>
            </div>
            
            {/* Permission Stats */}
            <div className="permission-stats">
              <div className="stat-box">
                <div className="stat-value">{permStats.total}</div>
                <div className="stat-label">Total Modules</div>
              </div>
              <div className="stat-box stat-full">
                <div className="stat-value">{permStats.full}</div>
                <div className="stat-label">Full Access</div>
              </div>
              <div className="stat-box stat-read">
                <div className="stat-value">{permStats.read}</div>
                <div className="stat-label">Read Only</div>
              </div>
              <div className="stat-box stat-partial">
                <div className="stat-value">{permStats.partial}</div>
                <div className="stat-label">Partial Access</div>
              </div>
              <div className="stat-box stat-none">
                <div className="stat-value">{permStats.none}</div>
                <div className="stat-label">No Access</div>
              </div>
            </div>
          </div>
          
          {/* Permissions Modal */}
          {showPermissionsModal && (
            <div className="permissions-modal-overlay">
              <div className="permissions-modal">
                <div className="permissions-modal-header">
                  <h3>User Permissions - {user.username || 'User'}</h3>
                  <button 
                    className="btn-modal-close" 
                    onClick={togglePermissionsModal}
                  >
                    ×
                  </button>
                </div>
                <div className="permissions-modal-content">
                  {/* Module Tabs */}
                  <div className="permission-tabs">
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
                  
                  <div className="permissions-table-container">
                    <table className="permissions-table">
                      <thead>
                        <tr>
                          <th>Module</th>
                          <th>Create</th>
                          <th>Read</th>
                          <th>Update</th>
                          <th>Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getCurrentModules().map(module => (
                          <tr key={module}>
                            <td className="module-name">{module}</td>
                            <td>{hasPermission(module, 'Create') ? <span className="permission-granted">✓</span> : <span className="permission-denied">✗</span>}</td>
                            <td>{hasPermission(module, 'Read') ? <span className="permission-granted">✓</span> : <span className="permission-denied">✗</span>}</td>
                            <td>{hasPermission(module, 'Update') ? <span className="permission-granted">✓</span> : <span className="permission-denied">✗</span>}</td>
                            <td>{hasPermission(module, 'Delete') ? <span className="permission-granted">✓</span> : <span className="permission-denied">✗</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="permissions-modal-footer">
                  <button className="btn btn-close" onClick={togglePermissionsModal}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetail;