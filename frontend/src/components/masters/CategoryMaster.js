import React, { useEffect, useState } from 'react';
import { usePermission } from '../../contexts/PermissionContext';
import {
  getAllCategories,
  addCategory,
  deleteCategory,
  updateCategory,
} from '../../services/categoryService';
import PermissionCheck from '../common/PermissionCheck';
import './MasterStyles.css';

const CategoryMaster = () => {
  const { hasPermission } = usePermission();
  const [categories, setCategories] = useState([]);
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
  const [filteredCategories, setFilteredCategories] = useState([]);

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
    loadCategories();
  }, []);

  useEffect(() => {
    applySearchAndFilter();
  }, [searchTerm, filterField, categories]);

  const loadCategories = async () => {
    if (!checkPermission('categories', 'view')) {
      setError('You do not have permission to view categories');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllCategories();

      if (Array.isArray(data?.$values)) {
        setCategories(data.$values);
      } else if (Array.isArray(data)) {
        setCategories(data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      if (error.response?.status === 403) {
        setError('Your permissions have changed. Please refresh the page.');
      } else {
        setError('Failed to load categories');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const applySearchAndFilter = () => {
    let results = [...categories];
    
    // Apply search
    if (searchTerm.trim()) {
      results = results.filter(category => {
        const searchLower = searchTerm.toLowerCase();
        return (
          category.name?.toLowerCase().includes(searchLower) ||
          category.description?.toLowerCase().includes(searchLower) ||
          category.categoryId?.toString().includes(searchLower)
        );
      });
    }
    
    // Apply filter
    if (filterField !== 'all') {
      results = results.filter(category => {
        if (filterField === 'withDescription') {
          return category.description && category.description.trim() !== '';
        } else if (filterField === 'withoutDescription') {
          return !category.description || category.description.trim() === '';
        }
        return true;
      });
    }
    
    setFilteredCategories(results);
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCategory = async () => {
    if (!checkPermission('categories', 'create')) {
      alert('You do not have permission to add categories.');
      return;
    }

    if (!formData.name.trim()) {
      alert('Category name is required!');
      return;
    }

    try {
      const added = await addCategory({
        categoryName: formData.name,
        description: formData.description,
      });

      if (added) {
        setFormData({
          name: '',
          description: ''
        });
        await loadCategories();
      }
    } catch (error) {
      console.error('Error adding category:', error);
      if (error.response?.status === 403) {
        alert('Your permissions have changed. Please refresh the page.');
      } else {
        alert('An error occurred while adding the category.');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!checkPermission('categories', 'delete')) {
      alert('You do not have permission to delete categories.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id);
        await loadCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        if (error.response?.status === 403) {
          alert('Your permissions have changed. Please refresh the page.');
        } else {
          alert('Failed to delete category.');
        }
      }
    }
  };

  const handleEdit = (category) => {
    if (!checkPermission('categories', 'edit')) {
      alert('You do not have permission to edit categories.');
      return;
    }

    setEditingId(category.categoryId);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
  };

  const handleUpdate = async (id) => {
    if (!formData.name.trim()) {
      alert('Category name is required!');
      return;
    }

    try {
      const updated = await updateCategory(id, {
        categoryName: formData.name,
        description: formData.description,
      });

      if (updated) {
        setEditingId(null);
        await loadCategories();
      }
    } catch (error) {
      console.error('Error updating category:', error);
      if (error.response?.status === 403) {
        alert('Your permissions have changed. Please refresh the page.');
      } else {
        alert('An error occurred while updating the category.');
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
      <p>You don't have permission to {action} categories.</p>
    </div>
  );

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / pageSize);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="master-container">
      <div className="master-header">
        <h1>Category Master</h1>
        
        <div className="search-filter-container">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <button onClick={() => setSearchTerm('')}>Clear</button>
          </div>
          
          <div className="filter-container">
            <select value={filterField} onChange={handleFilterChange}>
              <option value="all">All Categories</option>
              <option value="withDescription">With Description</option>
              <option value="withoutDescription">Without Description</option>
            </select>
          </div>
        </div>
        
        <PermissionCheck 
          moduleName="categories" 
          action="create"
          fallback={null}
        >
          <div className="add-section">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Category name"
            />
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Category description"
            />
            <button 
              onClick={handleAddCategory} 
              className="add-btn"
              disabled={!checkPermission('categories', 'create')}
            >
              Add Category
            </button>
          </div>
        </PermissionCheck>
      </div>

      <div className="master-table">
        {isLoading ? (
          <p>Loading categories...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Category ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCategories.length > 0 ? (
                  paginatedCategories.map((category) => (
                    <tr key={category.categoryId}>
                      <td>{category.categoryId}</td>
                      <td>
                        {editingId === category.categoryId ? (
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                          />
                        ) : (
                          category.name
                        )}
                      </td>
                      <td>
                        {editingId === category.categoryId ? (
                          <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                          />
                        ) : (
                          category.description || '-'
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          {editingId === category.categoryId ? (
                            <>
                              <PermissionCheck 
                                moduleName="categories" 
                                action="edit"
                                fallback={null}
                              >
                                <button 
                                  className="save-btn" 
                                  onClick={() => handleUpdate(category.categoryId)}
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
                                moduleName="categories" 
                                action="edit"
                                fallback={null}
                              >
                                <button 
                                  className="edit-btn" 
                                  onClick={() => handleEdit(category)}
                                >
                                  Edit
                                </button>
                              </PermissionCheck>
                              <PermissionCheck 
                                moduleName="categories" 
                                action="delete"
                                fallback={null}
                              >
                                <button 
                                  className="delete-btn" 
                                  onClick={() => handleDelete(category.categoryId)}
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
                        ? "No categories match your search criteria."
                        : "No categories found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {filteredCategories.length > pageSize && (
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

export default CategoryMaster;