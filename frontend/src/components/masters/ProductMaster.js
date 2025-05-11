import React, { useEffect, useState } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../services/productService';
import PermissionCheck from '../common/PermissionCheck';
import './MasterStyles.css';

const ProductMaster = () => {
  const [products, setProducts] = useState([]);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newStock, setNewStock] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [editedPrice, setEditedPrice] = useState('');
  const [editedCategory, setEditedCategory] = useState('');
  const [editedStock, setEditedStock] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  
  // Search and Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applySearchAndFilter();
  }, [searchTerm, filterField, products]);

  const loadProducts = async () => {
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
      setError('Failed to load products: ' + (error.message || 'Unknown error'));
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
    setCurrentPage(1); // Reset to first page when search or filter changes
  };

  const handleAddProduct = async () => {
    if (!newName.trim() || !newPrice.trim() || !newCategory.trim() || !newStock.trim()) {
      alert('All fields are required!');
      return;
    }

    try {
      const added = await createProduct({
        Name: newName,
        Price: parseFloat(newPrice),
        Category: newCategory,
        Stock: parseInt(newStock),
      });

      if (added) {
        setNewName('');
        setNewPrice('');
        setNewCategory('');
        setNewStock('');
        await loadProducts();
      } else {
        alert('Failed to add product. Please try again.');
      }
    } catch (error) {
      alert('An error occurred while adding the product: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        await loadProducts();
      } catch (error) {
        alert('Failed to delete product: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.productId);
    setEditedName(product.name);
    setEditedPrice(product.price);
    setEditedCategory(product.category);
    setEditedStock(product.stock);
  };

  const handleUpdate = async (id) => {
    if (!editedName.trim() || !editedPrice || !editedCategory.trim() || !editedStock) {
      alert('All fields are required!');
      return;
    }

    try {
      const updatedData = {
        Name: editedName,
        Price: parseFloat(editedPrice),
        Category: editedCategory,
        Stock: parseInt(editedStock),
      };

      const updated = await updateProduct(id, updatedData);
      if (updated) {
        setEditingId(null);
        await loadProducts();
      } else {
        alert('Failed to update product. Please try again.');
      }
    } catch (error) {
      alert('An error occurred while updating the product: ' + (error.message || 'Unknown error'));
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
      <p>You don't have permission to {action} products.</p>
    </div>
  );

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
          fallback={permissionDeniedMessage('add')}
        >
          <div className="add-section">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Product Name"
            />
            <input
              type="number"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="Price"
              step="0.01"
            />
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Category"
            />
            <input
              type="number"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              placeholder="Stock"
            />
            <button onClick={handleAddProduct} className="add-btn">
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
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                          />
                        ) : (
                          product.name
                        )}
                      </td>
                      <td>
                        {editingId === product.productId ? (
                          <input
                            type="number"
                            value={editedPrice}
                            onChange={(e) => setEditedPrice(e.target.value)}
                            step="0.01"
                          />
                        ) : (
                          product.price
                        )}
                      </td>
                      <td>
                        {editingId === product.productId ? (
                          <input
                            type="text"
                            value={editedCategory}
                            onChange={(e) => setEditedCategory(e.target.value)}
                          />
                        ) : (
                          product.category
                        )}
                      </td>
                      <td>
                        {editingId === product.productId ? (
                          <input
                            type="number"
                            value={editedStock}
                            onChange={(e) => setEditedStock(e.target.value)}
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
                                showAlways={true}
                                onUnauthorized={handleUnauthorized}
                              >
                                <button className="save-btn" onClick={() => handleUpdate(product.productId)}>
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
                                moduleName="products"
                                action="edit"
                                showAlways={true}
                                onUnauthorized={handleUnauthorized}
                              >
                                <button className="edit-btn" onClick={() => handleEdit(product)}>
                                  Edit
                                </button>
                              </PermissionCheck>
                              <PermissionCheck
                                moduleName="products"
                                action="delete"
                                showAlways={true}
                                onUnauthorized={handleUnauthorized}
                              >
                                <button className="delete-btn" onClick={() => handleDelete(product.productId)}>
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