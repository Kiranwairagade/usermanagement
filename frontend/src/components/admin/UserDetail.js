import React, { useEffect, useState } from 'react';
import { getUserById, getUserPermissions } from '../../services/userService';
import masterModules from '../../config/modules';
import './UserDetail.css';

const UserDetail = ({ userId, onClose, onEdit }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      const userData = await getUserById(userId);
      if (!userData) {
        setError('User data not found');
        setLoading(false);
        return;
      }

      const permissionsData = await getUserPermissions(userId);
      let permissionsArray = [];
      if (permissionsData?.userPermissions) {
        if (permissionsData.userPermissions.$values) {
          permissionsArray = permissionsData.userPermissions.$values;
        } else if (Array.isArray(permissionsData.userPermissions)) {
          permissionsArray = permissionsData.userPermissions;
        }
      }

      const userWithPermissions = {
        ...userData,
        userPermissions: permissionsArray,
      };

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

  if (loading) return <div className="loading-container"><div className="loading">Loading user details...</div></div>;
  if (error) return <div className="error-container"><div className="error">{error}</div></div>;
  if (!user) return <div className="not-found-container"><div className="not-found">User not found</div></div>;

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
            <h3>User Permissions</h3>
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
                  {masterModules.map(module => (
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

        </div>
      </div>
    </div>
  );
};

export default UserDetail;
