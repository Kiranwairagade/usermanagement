import React, { useState } from 'react';
import UserTable from './UserTable';
import { createUser, updateUser } from '../../services/userService';

const UsersPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', or 'create'

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleAddNewUser = () => {
    setSelectedUser(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveUser = async (userData) => {
    try {
      if (modalMode === 'create') {
        await createUser(userData);
      } else if (modalMode === 'edit' && selectedUser) {
        await updateUser(selectedUser.userId, userData);
      }
      
      setIsModalOpen(false);
      // Refresh user table
      // You would need to pass a refresh function to the UserTable component
      // or implement some state management to trigger a refresh
    } catch (error) {
      console.error('Error saving user:', error);
      alert(`Failed to save user: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="users-page">
      <h1>User Management</h1>
      
      <UserTable 
        onView={handleViewUser}
        onEdit={handleEditUser}
        onAddNew={handleAddNewUser}
      />
      
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>
              {modalMode === 'view' ? 'User Details' : 
               modalMode === 'edit' ? 'Edit User' : 'Create New User'}
            </h2>
            
            {/* Add your form or view components here */}
            {/* For example: */}
            {modalMode === 'view' && selectedUser && (
              <div className="user-details">
                <p><strong>ID:</strong> {selectedUser.userId}</p>
                <p><strong>Username:</strong> {selectedUser.username}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Name:</strong> {`${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim()}</p>
                <p><strong>Permissions:</strong> {selectedUser.permissions?.join(', ') || 'None'}</p>
              </div>
            )}
            
            {/* Add edit/create form here */}
            
            <div className="modal-actions">
              <button className="btn-cancel" onClick={handleCloseModal}>
                {modalMode === 'view' ? 'Close' : 'Cancel'}
              </button>
              
              {modalMode !== 'view' && (
                <button className="btn-save" onClick={() => handleSaveUser({})}>
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;