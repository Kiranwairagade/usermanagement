import React, { useState, useEffect } from 'react';
import { deleteUser } from '../../services/userService';
import './UserTable.css';
import axios from 'axios';

const UserTable = ({ onEdit, onView, onAddNew, setSelectedUser, refreshTrigger }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(6);
  
  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]);
  
  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter]);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5207/api/users');
      const userList = res.data?.users?.$values || [];
      setUsers(userList);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };
  
  const filterUsers = () => {
    let results = [...users];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(user => 
        (user.username && user.username.toLowerCase().includes(term)) ||
        (user.firstName && user.firstName.toLowerCase().includes(term)) ||
        (user.lastName && user.lastName.toLowerCase().includes(term)) ||
        (user.email && user.email.toLowerCase().includes(term))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      results = results.filter(user => user.isActive === isActive);
    }
    
    setFilteredUsers(results);
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        setUsers((prev) => prev.filter((user) => user.userId !== userId));
        alert('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already applied via useEffect
  };
  
  // Get current users for pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredUsers.length / usersPerPage)));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className="master-container">
      <div className="master-header">
        <h1>User Management</h1>
        
        <div className="search-filter-container">
          <div className="search-container">
            <form onSubmit={handleSearch}>
              <input 
                type="text" 
                placeholder="Search by name, username, or email" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit">Search</button>
            </form>
          </div>
          
          <div className="filter-container">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div className="add-section">
            <button onClick={onAddNew}>Add New User</button>
          </div>
        </div>
      </div>

      <div className="master-table">
        {loading ? (
          <div className="no-results">Loading users...</div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Full Name</th>
                  
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <tr key={user.userId}>
                      <td>{user.userId ?? 'N/A'}</td>
                      <td>{user.username ?? 'N/A'}</td>
                      <td>{user.email ?? 'N/A'}</td>
                      <td>{`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'N/A'}</td>
                      
                      <td className="action-buttons">
                        <button className="edit-btn" onClick={() => onView(user)}>View</button>
                        <button className="edit-btn" onClick={() => onEdit(user)}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDelete(user.userId)}>Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-results">No users found matching your criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {filteredUsers.length > 0 && (
              <div className="pagination">
                <button onClick={prevPage} disabled={currentPage === 1}>
                  &laquo; Prev
                </button>
                
                {[...Array(Math.ceil(filteredUsers.length / usersPerPage))].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={currentPage === i + 1 ? 'active' : ''}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button 
                  onClick={nextPage} 
                  disabled={currentPage === Math.ceil(filteredUsers.length / usersPerPage)}
                >
                  Next &raquo;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserTable;