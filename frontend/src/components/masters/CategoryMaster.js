import React, { useEffect, useState } from 'react';
import {
  getAllCategories,
  addCategory,
  deleteCategory,
  updateCategory,
} from '../../services/categoryService';
import PermissionCheck from '../common/PermissionCheck';
import './MasterStyles.css';

const CategoryMaster = () => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
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
  const [filteredCategories, setFilteredCategories] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    applySearchAndFilter();
  }, [searchTerm, filterField, categories]);

  const loadCategories = async () => {
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
      if (error.response?.status === 401 || error.response?.status === 403) {
        setError('You do not have permission to view categories');
      } else {
        setError('Failed to load categories');
        console.error('Error loading categories:', error);
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
    setCurrentPage(1); // Reset to first page when search or filter changes
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Category name is required!');
      return;
    }

    try {
      const added = await addCategory({
        categoryName: newCategoryName,
        description: newCategoryDescription,
      });

      if (added) {
        setNewCategoryName('');
        setNewCategoryDescription('');
        loadCategories();
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('You do not have permission to add categories.');
      } else {
        console.error('Error adding category:', error);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id);
        loadCategories();
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          alert('You do not have permission to delete categories.');
        } else {
          console.error('Error deleting category:', error);
        }
      }
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat.categoryId);
    setEditedName(cat.name);
    setEditedDescription(cat.description || '');
  };

  const handleUpdate = async (id) => {
    if (!editedName.trim()) {
      alert('Category name is required!');
      return;
    }

    try {
      const updated = await updateCategory(id, {
        categoryName: editedName,
        description: editedDescription,
      });

      if (updated) {
        setEditingId(null);
        loadCategories();
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('You do not have permission to update categories.');
      } else {
        console.error('Error updating category:', error);
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
      <p>You don't have permission to {action} categories.</p>
    </div>
  );

  const totalPages = Math.ceil(filteredCategories.length / pageSize);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
          fallback={permissionDeniedMessage('add')}
        >
          <div className="add-section">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category name"
            />
            <input
              type="text"
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
              placeholder="Category description"
            />
            <button onClick={handleAddCategory} className="add-btn">
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
                  paginatedCategories.map((cat) => (
                    <tr key={cat.categoryId}>
                      <td>{cat.categoryId}</td>
                      <td>
                        {editingId === cat.categoryId ? (
                          <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                          />
                        ) : (
                          cat.name
                        )}
                      </td>
                      <td>
                        {editingId === cat.categoryId ? (
                          <input
                            type="text"
                            value={editedDescription}
                            onChange={(e) => setEditedDescription(e.target.value)}
                          />
                        ) : (
                          cat.description || '-'
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          {editingId === cat.categoryId ? (
                            <>
                              <PermissionCheck 
                                moduleName="categories" 
                                action="edit"
                                showAlways={true}
                                onUnauthorized={handleUnauthorized}
                              >
                                <button className="save-btn" onClick={() => handleUpdate(cat.categoryId)}>Save</button>
                              </PermissionCheck>
                              <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <PermissionCheck 
                                moduleName="categories" 
                                action="edit"
                                showAlways={true}
                                onUnauthorized={handleUnauthorized}
                              >
                                <button className="edit-btn" onClick={() => handleEdit(cat)}>Edit</button>
                              </PermissionCheck>
                              <PermissionCheck 
                                moduleName="categories" 
                                action="delete"
                                showAlways={true}
                                onUnauthorized={handleUnauthorized}
                              >
                                <button className="delete-btn" onClick={() => handleDelete(cat.categoryId)}>Delete</button>
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