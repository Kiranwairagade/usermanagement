import React, { useEffect, useState } from 'react';
import { usePermission } from '../../contexts/PermissionContext';
import {
  getAllSuppliers,
  addSupplier,
  deleteSupplier,
  updateSupplier,
} from '../../services/supplierService';
import PermissionCheck from '../common/PermissionCheck';
import './MasterStyles.css';

const SupplierMaster = () => {
  const { hasPermission } = usePermission();
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  
  // Search and Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState('all');
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);

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
    loadSuppliers();
  }, []);

  useEffect(() => {
    applySearchAndFilter();
  }, [searchTerm, filterField, suppliers]);

  const loadSuppliers = async () => {
    if (!checkPermission('suppliers', 'view')) {
      setError('You do not have permission to view suppliers');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllSuppliers();
      
      if (Array.isArray(data)) {
        setSuppliers(data);
      } else if (Array.isArray(data?.$values)) {
        setSuppliers(data.$values);
      } else {
        console.error('Expected array but got:', typeof data);
        setSuppliers([]);
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
      if (error.response?.status === 403) {
        setError('Your permissions have changed. Please refresh the page.');
      } else {
        setError('Failed to load suppliers');
      }
      setSuppliers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applySearchAndFilter = () => {
    let results = [...suppliers];
    
    // Apply search
    if (searchTerm.trim()) {
      results = results.filter(supplier => {
        const searchLower = searchTerm.toLowerCase();
        return (
          supplier.name?.toLowerCase().includes(searchLower) ||
          supplier.email?.toLowerCase().includes(searchLower) ||
          supplier.phone?.toLowerCase().includes(searchLower) ||
          supplier.address?.toLowerCase().includes(searchLower) ||
          supplier.supplierId?.toString().includes(searchLower)
        );
      });
    }
    
    // Apply filter
    if (filterField !== 'all') {
      results = results.filter(supplier => {
        if (filterField === 'withEmail') {
          return supplier.email && supplier.email.trim() !== '';
        } else if (filterField === 'withoutEmail') {
          return !supplier.email || supplier.email.trim() === '';
        } else if (filterField === 'withPhone') {
          return supplier.phone && supplier.phone.trim() !== '';
        } else if (filterField === 'withoutPhone') {
          return !supplier.phone || supplier.phone.trim() === '';
        }
        return true;
      });
    }
    
    setFilteredSuppliers(results);
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSupplier = async () => {
    if (!checkPermission('suppliers', 'create')) {
      alert('You do not have permission to add suppliers.');
      return;
    }

    const { name, email, phone, address } = formData;
    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      alert('All fields are required!');
      return;
    }

    try {
      const added = await addSupplier({
        Name: name,
        Email: email,
        Phone: phone,
        Address: address,
      });

      if (added) {
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: ''
        });
        loadSuppliers();
      }
    } catch (error) {
      console.error('Error adding supplier:', error);
      if (error.response?.status === 403) {
        alert('Your permissions have changed. Please refresh the page.');
      } else {
        alert('An error occurred while adding the supplier.');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!checkPermission('suppliers', 'delete')) {
      alert('You do not have permission to delete suppliers.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await deleteSupplier(id);
        loadSuppliers();
      } catch (error) {
        console.error('Error deleting supplier:', error);
        if (error.response?.status === 403) {
          alert('Your permissions have changed. Please refresh the page.');
        } else {
          alert('Failed to delete supplier.');
        }
      }
    }
  };

  const handleEdit = (supplier) => {
    if (!checkPermission('suppliers', 'edit')) {
      alert('You do not have permission to edit suppliers.');
      return;
    }

    setEditingId(supplier.supplierId);
    setFormData({
      name: supplier.name,
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || ''
    });
  };

  const handleUpdate = async (id) => {
    const { name, email, phone, address } = formData;
    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      alert('All fields are required!');
      return;
    }

    try {
      const updated = await updateSupplier(id, {
        Name: name,
        Email: email,
        Phone: phone,
        Address: address,
      });

      if (updated) {
        setEditingId(null);
        loadSuppliers();
      }
    } catch (error) {
      console.error('Error updating supplier:', error);
      if (error.response?.status === 403) {
        alert('Your permissions have changed. Please refresh the page.');
      } else {
        alert('An error occurred while updating the supplier.');
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: ''
    });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterField(e.target.value);
  };

  const handleUnauthorized = (module, action) => {
    alert(`You don't have permission to ${action} ${module}.`);
  };

  const permissionDeniedMessage = (action) => (
    <div className="permission-denied">
      <p>You don't have permission to {action} suppliers.</p>
    </div>
  );

  // Pagination
  const totalPages = Math.ceil(filteredSuppliers.length / pageSize);
  const paginatedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="master-container">
      <div className="master-header">
        <h1>Supplier Master</h1>
        
        <div className="search-filter-container">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <button onClick={() => setSearchTerm('')}>Clear</button>
          </div>
          
          <div className="filter-container">
            <select value={filterField} onChange={handleFilterChange}>
              <option value="all">All Suppliers</option>
              <option value="withEmail">With Email</option>
              <option value="withoutEmail">Without Email</option>
              <option value="withPhone">With Phone</option>
              <option value="withoutPhone">Without Phone</option>
            </select>
          </div>
        </div>
        
        <PermissionCheck 
          moduleName="suppliers" 
          action="create"
          fallback={null}
        >
          <div className="add-section">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Supplier name"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Supplier email"
            />
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Supplier phone"
            />
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Supplier address"
            />
            <button 
              onClick={handleAddSupplier} 
              className="add-btn"
              disabled={!checkPermission('suppliers', 'create')}
            >
              Add Supplier
            </button>
          </div>
        </PermissionCheck>
      </div>

      <div className="master-table">
        {isLoading ? (
          <p>Loading suppliers...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Supplier ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSuppliers.length > 0 ? (
                  paginatedSuppliers.map((supplier) => (
                    <tr key={supplier.supplierId}>
                      <td>{supplier.supplierId}</td>
                      <td>
                        {editingId === supplier.supplierId ? (
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                          />
                        ) : (
                          supplier.name
                        )}
                      </td>
                      <td>
                        {editingId === supplier.supplierId ? (
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                        ) : (
                          supplier.email || '-'
                        )}
                      </td>
                      <td>
                        {editingId === supplier.supplierId ? (
                          <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                          />
                        ) : (
                          supplier.phone || '-'
                        )}
                      </td>
                      <td>
                        {editingId === supplier.supplierId ? (
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                          />
                        ) : (
                          supplier.address || '-'
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          {editingId === supplier.supplierId ? (
                            <>
                              <PermissionCheck 
                                moduleName="suppliers" 
                                action="edit"
                                fallback={null}
                              >
                                <button 
                                  className="save-btn" 
                                  onClick={() => handleUpdate(supplier.supplierId)}
                                >
                                  Save
                                </button>
                              </PermissionCheck>
                              <button className="cancel-btn" onClick={handleCancel}>
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <PermissionCheck 
                                moduleName="suppliers" 
                                action="edit"
                                fallback={null}
                              >
                                <button 
                                  className="edit-btn" 
                                  onClick={() => handleEdit(supplier)}
                                >
                                  Edit
                                </button>
                              </PermissionCheck>
                              <PermissionCheck 
                                moduleName="suppliers" 
                                action="delete"
                                fallback={null}
                              >
                                <button 
                                  className="delete-btn" 
                                  onClick={() => handleDelete(supplier.supplierId)}
                                >
                                  Delete
                                </button>
                              </PermissionCheck>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-results">
                      {searchTerm || filterField !== 'all' 
                        ? "No suppliers match your search criteria."
                        : "No suppliers found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {filteredSuppliers.length > pageSize && (
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
    </div>
  );
};

export default SupplierMaster;