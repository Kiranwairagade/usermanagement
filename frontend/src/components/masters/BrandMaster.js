import React, { useEffect, useState } from 'react';
import {
  getAllBrands,
  addBrand,
  deleteBrand,
  updateBrand,
} from '../../services/brandService';
import PermissionCheck from '../common/PermissionCheck';
import './MasterStyles.css';

const BrandMaster = () => {
  const [brands, setBrands] = useState([]);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandDescription, setNewBrandDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  
  // Search and Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState('all');
  const [filteredBrands, setFilteredBrands] = useState([]);

  useEffect(() => {
    loadBrands();
  }, []);

  useEffect(() => {
    applySearchAndFilter();
  }, [searchTerm, filterField, brands]);

  const loadBrands = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllBrands();
      if (Array.isArray(data)) {
        setBrands(data);
      } else if (Array.isArray(data?.$values)) {
        setBrands(data.$values);
      } else {
        setBrands([]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching brands:', error);
      setError('Failed to load brands');
      setBrands([]);
      setIsLoading(false);
    }
  };

  const applySearchAndFilter = () => {
    let results = [...brands];
    
    // Apply search
    if (searchTerm.trim()) {
      results = results.filter(brand => {
        const searchLower = searchTerm.toLowerCase();
        return (
          brand.brandName?.toLowerCase().includes(searchLower) ||
          brand.description?.toLowerCase().includes(searchLower) ||
          brand.brandId?.toString().includes(searchLower)
        );
      });
    }
    
    // Apply filter
    if (filterField !== 'all') {
      results = results.filter(brand => {
        if (filterField === 'withDescription') {
          return brand.description && brand.description.trim() !== '';
        } else if (filterField === 'withoutDescription') {
          return !brand.description || brand.description.trim() === '';
        }
        return true;
      });
    }
    
    setFilteredBrands(results);
    setCurrentPage(1); // Reset to first page when search or filter changes
  };

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) {
      alert('Brand name is required!');
      return;
    }

    try {
      const added = await addBrand({
        brandName: newBrandName,
        description: newBrandDescription,
      });

      if (added) {
        setNewBrandName('');
        setNewBrandDescription('');
        loadBrands();
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('You do not have permission to add brands.');
      } else {
        console.error('Error adding brand:', error);
        alert('Failed to add brand. Please try again.');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      try {
        await deleteBrand(id);
        loadBrands();
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          alert('You do not have permission to delete brands.');
        } else {
          console.error('Error deleting brand:', error);
          alert('Failed to delete brand. Please try again.');
        }
      }
    }
  };

  const handleEdit = (brand) => {
    setEditingId(brand.brandId);
    setEditedName(brand.brandName);
    setEditedDescription(brand.description || '');
  };

  const handleUpdate = async (id) => {
    if (!editedName.trim()) {
      alert('Brand name is required!');
      return;
    }

    try {
      const updated = await updateBrand(id, {
        brandName: editedName,
        description: editedDescription,
      });

      if (updated) {
        setEditingId(null);
        loadBrands();
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('You do not have permission to update brands.');
      } else {
        console.error('Error updating brand:', error);
        alert('Failed to update brand. Please try again.');
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
      <p>You don't have permission to {action} brands.</p>
    </div>
  );

  const totalPages = Math.ceil(filteredBrands.length / pageSize);
  const paginatedBrands = filteredBrands.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="master-container">
      <div className="master-header">
        <h1>Brand Master</h1>
        
        <div className="search-filter-container">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search brands..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <button onClick={() => setSearchTerm('')}>Clear</button>
          </div>
          
          <div className="filter-container">
            <select value={filterField} onChange={handleFilterChange}>
              <option value="all">All Brands</option>
              <option value="withDescription">With Description</option>
              <option value="withoutDescription">Without Description</option>
            </select>
          </div>
        </div>
        
        <PermissionCheck 
          moduleName="brands" 
          action="create"
          fallback={permissionDeniedMessage('add')}
        >
          <div className="add-section">
            <input
              type="text"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              placeholder="Brand name"
            />
            <input
              type="text"
              value={newBrandDescription}
              onChange={(e) => setNewBrandDescription(e.target.value)}
              placeholder="Brand description"
            />
            <button onClick={handleAddBrand} className="add-btn">
              Add Brand
            </button>
          </div>
        </PermissionCheck>
      </div>

      <div className="master-table">
        {isLoading ? (
          <p>Loading brands...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Brand ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBrands.length > 0 ? (
                  paginatedBrands.map((brand) => (
                    <tr key={brand.brandId}>
                      <td>{brand.brandId}</td>
                      <td>
                        {editingId === brand.brandId ? (
                          <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                          />
                        ) : (
                          brand.brandName
                        )}
                      </td>
                      <td>
                        {editingId === brand.brandId ? (
                          <input
                            type="text"
                            value={editedDescription}
                            onChange={(e) => setEditedDescription(e.target.value)}
                          />
                        ) : (
                          brand.description || '-'
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          {editingId === brand.brandId ? (
                            <>
                              <PermissionCheck 
                                moduleName="brands" 
                                action="edit"
                                showAlways={true}
                                onUnauthorized={handleUnauthorized}
                              >
                                <button className="save-btn" onClick={() => handleUpdate(brand.brandId)}>Save</button>
                              </PermissionCheck>
                              <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <PermissionCheck 
                                moduleName="brands" 
                                action="edit"
                                showAlways={true}
                                onUnauthorized={handleUnauthorized}
                              >
                                <button className="edit-btn" onClick={() => handleEdit(brand)}>Edit</button>
                              </PermissionCheck>
                              <PermissionCheck 
                                moduleName="brands" 
                                action="delete"
                                showAlways={true}
                                onUnauthorized={handleUnauthorized}
                              >
                                <button className="delete-btn" onClick={() => handleDelete(brand.brandId)}>Delete</button>
                              </PermissionCheck>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-results">
                      {searchTerm || filterField !== 'all' 
                        ? "No brands match your search criteria."
                        : "No brands found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {filteredBrands.length > pageSize && (
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

export default BrandMaster;