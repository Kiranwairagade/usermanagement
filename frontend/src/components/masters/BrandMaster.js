import React, { useEffect, useState } from 'react';
import { usePermission } from '../../contexts/PermissionContext';
import {
  getAllBrands,
  addBrand,
  deleteBrand,
  updateBrand,
} from '../../services/brandService';
import PermissionCheck from '../common/PermissionCheck';
import './MasterStyles.css';

const BrandMaster = () => {
  const { hasPermission } = usePermission();
  const [brands, setBrands] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  
  // Search and Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState('all');
  const [filteredBrands, setFilteredBrands] = useState([]);

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
    loadBrands();
  }, []);

  useEffect(() => {
    applySearchAndFilter();
  }, [searchTerm, filterField, brands]);

  const loadBrands = async () => {
    if (!checkPermission('brands', 'view')) {
      setError('You do not have permission to view brands');
      setIsLoading(false);
      return;
    }

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
    } catch (error) {
      console.error('Error loading brands:', error);
      if (error.response?.status === 403) {
        setError('Your permissions have changed. Please refresh the page.');
      } else {
        setError('Failed to load brands');
      }
    } finally {
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
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddBrand = async () => {
    if (!checkPermission('brands', 'create')) {
      alert('You do not have permission to add brands.');
      return;
    }

    if (!formData.name.trim()) {
      alert('Brand name is required!');
      return;
    }

    try {
      const added = await addBrand({
        brandName: formData.name,
        description: formData.description,
      });

      if (added) {
        setFormData({
          name: '',
          description: ''
        });
        await loadBrands();
      }
    } catch (error) {
      console.error('Error adding brand:', error);
      if (error.response?.status === 403) {
        alert('Your permissions have changed. Please refresh the page.');
      } else {
        alert('An error occurred while adding the brand.');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!checkPermission('brands', 'delete')) {
      alert('You do not have permission to delete brands.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this brand?')) {
      try {
        await deleteBrand(id);
        await loadBrands();
      } catch (error) {
        console.error('Error deleting brand:', error);
        if (error.response?.status === 403) {
          alert('Your permissions have changed. Please refresh the page.');
        } else {
          alert('Failed to delete brand.');
        }
      }
    }
  };

  const handleEdit = (brand) => {
    if (!checkPermission('brands', 'edit')) {
      alert('You do not have permission to edit brands.');
      return;
    }

    setEditingId(brand.brandId);
    setFormData({
      name: brand.brandName,
      description: brand.description || ''
    });
  };

  const handleUpdate = async (id) => {
    if (!formData.name.trim()) {
      alert('Brand name is required!');
      return;
    }

    try {
      const updated = await updateBrand(id, {
        brandName: formData.name,
        description: formData.description,
      });

      if (updated) {
        setEditingId(null);
        await loadBrands();
      }
    } catch (error) {
      console.error('Error updating brand:', error);
      if (error.response?.status === 403) {
        alert('Your permissions have changed. Please refresh the page.');
      } else {
        alert('An error occurred while updating the brand.');
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: ''
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
      <p>You don't have permission to {action} brands.</p>
    </div>
  );

  // Pagination
  const totalPages = Math.ceil(filteredBrands.length / pageSize);
  const paginatedBrands = filteredBrands.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
          fallback={null}
        >
          <div className="add-section">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Brand name"
            />
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brand description"
            />
            <button 
              onClick={handleAddBrand} 
              className="add-btn"
              disabled={!checkPermission('brands', 'create')}
            >
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
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                          />
                        ) : (
                          brand.brandName
                        )}
                      </td>
                      <td>
                        {editingId === brand.brandId ? (
                          <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
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
                                fallback={null}
                              >
                                <button 
                                  className="save-btn" 
                                  onClick={() => handleUpdate(brand.brandId)}
                                >
                                  Save
                                </button>
                              </PermissionCheck>
                              <button 
                                className="cancel-btn" 
                                onClick={handleCancel}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <PermissionCheck 
                                moduleName="brands" 
                                action="edit"
                                fallback={null}
                              >
                                <button 
                                  className="edit-btn" 
                                  onClick={() => handleEdit(brand)}
                                >
                                  Edit
                                </button>
                              </PermissionCheck>
                              <PermissionCheck 
                                moduleName="brands" 
                                action="delete"
                                fallback={null}
                              >
                                <button 
                                  className="delete-btn" 
                                  onClick={() => handleDelete(brand.brandId)}
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