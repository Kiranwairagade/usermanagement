import React, { useEffect, useState } from 'react';
import {
  getAllSuppliers,
  addSupplier,
  deleteSupplier,
  updateSupplier,
} from '../../services/supplierService';
import PermissionCheck from '../common/PermissionCheck';
import './MasterStyles.css';

const SupplierMaster = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierEmail, setNewSupplierEmail] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [newSupplierAddress, setNewSupplierAddress] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [editedAddress, setEditedAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  
  // Search and Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState('all');
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    applySearchAndFilter();
  }, [searchTerm, filterField, suppliers]);

  const loadSuppliers = async () => {
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
      setError('Failed to load suppliers');
      if (error.response?.status === 401 || error.response?.status === 403) {
        setError('You do not have permission to view suppliers');
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
    setCurrentPage(1); // Reset to first page when search or filter changes
  };

  const handleAddSupplier = async () => {
    if (
      !newSupplierName.trim() ||
      !newSupplierEmail.trim() ||
      !newSupplierPhone.trim() ||
      !newSupplierAddress.trim()
    ) {
      alert('All fields are required!');
      return;
    }

    try {
      const added = await addSupplier({
        Name: newSupplierName,
        Email: newSupplierEmail,
        Phone: newSupplierPhone,
        Address: newSupplierAddress,
      });

      if (added) {
        setNewSupplierName('');
        setNewSupplierEmail('');
        setNewSupplierPhone('');
        setNewSupplierAddress('');
        loadSuppliers();
      } else {
        alert('Failed to add supplier. Please check console for details.');
      }
    } catch (error) {
      console.error('Error in handleAddSupplier:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('You do not have permission to add suppliers.');
      } else {
        alert('An error occurred while adding the supplier.');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await deleteSupplier(id);
        loadSuppliers();
      } catch (error) {
        console.error('Error deleting supplier:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          alert('You do not have permission to delete suppliers.');
        } else {
          alert('Failed to delete supplier.');
        }
      }
    }
  };

  const handleEdit = (supplier) => {
    setEditingId(supplier.supplierId);
    setEditedName(supplier.name);
    setEditedEmail(supplier.email);
    setEditedPhone(supplier.phone);
    setEditedAddress(supplier.address);
  };

  const handleUpdate = async (id) => {
    if (
      !editedName.trim() ||
      !editedEmail.trim() ||
      !editedPhone.trim() ||
      !editedAddress.trim()
    ) {
      alert('All fields are required!');
      return;
    }

    try {
      const updated = await updateSupplier(id, {
        Name: editedName,
        Email: editedEmail,
        Phone: editedPhone,
        Address: editedAddress,
      });

      if (updated) {
        setEditingId(null);
        loadSuppliers();
      } else {
        alert('Failed to update supplier. Please check console for details.');
      }
    } catch (error) {
      console.error('Error updating supplier:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('You do not have permission to update suppliers.');
      } else {
        alert('An error occurred while updating the supplier.');
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
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

  const totalPages = Math.ceil(filteredSuppliers.length / pageSize);
  const paginatedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
          fallback={permissionDeniedMessage('add')}
        >
          <div className="add-section">
            <input
              type="text"
              value={newSupplierName}
              onChange={(e) => setNewSupplierName(e.target.value)}
              placeholder="Supplier name"
            />
            <input
              type="email"
              value={newSupplierEmail}
              onChange={(e) => setNewSupplierEmail(e.target.value)}
              placeholder="Supplier email"
            />
            <input
              type="text"
              value={newSupplierPhone}
              onChange={(e) => setNewSupplierPhone(e.target.value)}
              placeholder="Supplier phone"
            />
            <input
              type="text"
              value={newSupplierAddress}
              onChange={(e) => setNewSupplierAddress(e.target.value)}
              placeholder="Supplier address"
            />
            <button onClick={handleAddSupplier} className="add-btn">
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
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                          />
                        ) : (
                          supplier.name
                        )}
                      </td>
                      <td>
                        {editingId === supplier.supplierId ? (
                          <input
                            type="email"
                            value={editedEmail}
                            onChange={(e) => setEditedEmail(e.target.value)}
                          />
                        ) : (
                          supplier.email || '-'
                        )}
                      </td>
                      <td>
                        {editingId === supplier.supplierId ? (
                          <input
                            type="text"
                            value={editedPhone}
                            onChange={(e) => setEditedPhone(e.target.value)}
                          />
                        ) : (
                          supplier.phone || '-'
                        )}
                      </td>
                      <td>
                        {editingId === supplier.supplierId ? (
                          <input
                            type="text"
                            value={editedAddress}
                            onChange={(e) => setEditedAddress(e.target.value)}
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
                                showAlways={true}
                                onUnauthorized={handleUnauthorized}
                              >
                                <button className="save-btn" onClick={() => handleUpdate(supplier.supplierId)}>Save</button>
                              </PermissionCheck>
                              <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <PermissionCheck 
                                moduleName="suppliers" 
                                action="edit"
                                showAlways={true}
                                onUnauthorized={handleUnauthorized}
                              >
                                <button className="edit-btn" onClick={() => handleEdit(supplier)}>Edit</button>
                              </PermissionCheck>
                              <PermissionCheck 
                                moduleName="suppliers" 
                                action="delete"
                                showAlways={true}
                                onUnauthorized={handleUnauthorized}
                              >
                                <button className="delete-btn" onClick={() => handleDelete(supplier.supplierId)}>Delete</button>
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