import React, { useEffect, useState } from 'react';
import { usePermission } from '../../contexts/PermissionContext';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../services/productService';
import PermissionCheck from '../common/PermissionCheck';
import './MasterStyles.css';

const ProductMaster = () => {
  const { hasPermission } = usePermission();
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  
  // Search and Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState([]);

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
    loadProducts();
  }, []);

  useEffect(() => {
    applySearchAndFilter();
  }, [searchTerm, filterField, products]);

  const loadProducts = async () => {
    if (!checkPermission('products', 'view')) {
      setError('You do not have permission to view products');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getProducts();
      
      if (Array.isArray(data) && data.length > 0) {
        const normalizedProducts = data.map(product => ({
          productId: product.productId || product.ProductId || product.id || product.Id,
          name: product.name || product.Name,
          price: product.price || product.Price,
          category: product.category || product.Category,
          stock: product.stock || product.Stock
        }));
        setProducts(normalizedProducts);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      if (error.response?.status === 403) {
        setError('Your permissions have changed. Please refresh the page.');
      } else {
        setError('Failed to load products: ' + (error.message || 'Unknown error'));
      }
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applySearchAndFilter = () => {
    let results = [...products];
    
    // Apply search
    if (searchTerm.trim()) {
      results = results.filter(product => {
        const searchLower = searchTerm.toLowerCase();
        return (
          product.name?.toLowerCase().includes(searchLower) ||
          product.category?.toLowerCase().includes(searchLower) ||
          product.productId?.toString().includes(searchLower) ||
          product.price?.toString().includes(searchLower) ||
          product.stock?.toString().includes(searchLower)
        );
      });
    }
    
    // Apply filter
    if (filterField !== 'all') {
      results = results.filter(product => {
        if (filterField === 'inStock') {
          return product.stock > 0;
        } else if (filterField === 'outOfStock') {
          return product.stock <= 0;
        } else if (filterField === 'lowStock') {
          return product.stock > 0 && product.stock <= 10;
        }
        return true;
      });
    }
    
    setFilteredProducts(results);
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddProduct = async () => {
    if (!checkPermission('products', 'create')) {
      alert('You do not have permission to add products.');
      return;
    }

    const { name, price, category, stock } = formData;
    if (!name.trim() || !price.trim() || !category.trim() || !stock.trim()) {
      alert('All fields are required!');
      return;
    }

    try {
      const added = await createProduct({
        Name: name,
        Price: parseFloat(price),
        Category: category,
        Stock: parseInt(stock),
      });

      if (added) {
        setFormData({
          name: '',
          price: '',
          category: '',
          stock: ''
        });
        await loadProducts();
      }
    } catch (error) {
      console.error('Error adding product:', error);
      if (error.response?.status === 403) {
        alert('Your permissions have changed. Please refresh the page.');
      } else {
        alert('An error occurred while adding the product: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const handleDelete = async (id) => {
    if (!checkPermission('products', 'delete')) {
      alert('You do not have permission to delete products.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        await loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        if (error.response?.status === 403) {
          alert('Your permissions have changed. Please refresh the page.');
        } else {
          alert('Failed to delete product: ' + (error.message || 'Unknown error'));
        }
      }
    }
  };

  const handleEdit = (product) => {
    if (!checkPermission('products', 'edit')) {
      alert('You do not have permission to edit products.');
      return;
    }

    setEditingId(product.productId);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString()
    });
  };

  const handleUpdate = async (id) => {
    const { name, price, category, stock } = formData;
    if (!name.trim() || !price.trim() || !category.trim() || !stock.trim()) {
      alert('All fields are required!');
      return;
    }

    try {
      const updatedData = {
        Name: name,
        Price: parseFloat(price),
        Category: category,
        Stock: parseInt(stock),
      };

      const updated = await updateProduct(id, updatedData);
      if (updated) {
        setEditingId(null);
        await loadProducts();
      }
    } catch (error) {
      console.error('Error updating product:', error);
      if (error.response?.status === 403) {
        alert('Your permissions have changed. Please refresh the page.');
      } else {
        alert('An error occurred while updating the product: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      name: '',
      price: '',
      category: '',
      stock: ''
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
      <p>You don't have permission to {action} products.</p>
    </div>
  );

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="master-container">
      <div className="master-header">
        <h1>Product Master</h1>
        
        <div className="search-filter-container">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <button onClick={() => setSearchTerm('')}>Clear</button>
          </div>
          
          <div className="filter-container">
            <select value={filterField} onChange={handleFilterChange}>
              <option value="all">All Products</option>
              <option value="inStock">In Stock</option>
              <option value="outOfStock">Out of Stock</option>
              <option value="lowStock">Low Stock</option>
            </select>
          </div>
        </div>
        
        <PermissionCheck 
          moduleName="products" 
          action="create"
          fallback={null}
        >
          <div className="add-section">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Product Name"
            />
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Price"
              step="0.01"
              min="0"
            />
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              placeholder="Category"
            />
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              placeholder="Stock"
              min="0"
            />
            <button 
              onClick={handleAddProduct} 
              className="add-btn"
              disabled={!checkPermission('products', 'create')}
            >
              Add Product
            </button>
          </div>
        </PermissionCheck>
      </div>

      <div className="master-table">
        {isLoading ? (
          <p>Loading products...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product) => (
                    <tr key={product.productId}>
                      <td>{product.productId}</td>
                      <td>
                        {editingId === product.productId ? (
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                          />
                        ) : (
                          product.name
                        )}
                      </td>
                      <td>
                        {editingId === product.productId ? (
                          <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            step="0.01"
                            min="0"
                          />
                        ) : (
                          `$${parseFloat(product.price).toFixed(2)}`
                        )}
                      </td>
                      <td>
                        {editingId === product.productId ? (
                          <input
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                          />
                        ) : (
                          product.category
                        )}
                      </td>
                      <td>
                        {editingId === product.productId ? (
                          <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleInputChange}
                            min="0"
                          />
                        ) : (
                          product.stock
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          {editingId === product.productId ? (
                            <>
                              <PermissionCheck
                                moduleName="products"
                                action="edit"
                                fallback={null}
                              >
                                <button 
                                  className="save-btn" 
                                  onClick={() => handleUpdate(product.productId)}
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
                                moduleName="products"
                                action="edit"
                                fallback={null}
                              >
                                <button 
                                  className="edit-btn" 
                                  onClick={() => handleEdit(product)}
                                >
                                  Edit
                                </button>
                              </PermissionCheck>
                              <PermissionCheck
                                moduleName="products"
                                action="delete"
                                fallback={null}
                              >
                                <button 
                                  className="delete-btn" 
                                  onClick={() => handleDelete(product.productId)}
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
                        ? "No products match your search criteria."
                        : "No products found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {filteredProducts.length > pageSize && (
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

export default ProductMaster;