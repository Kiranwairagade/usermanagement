// src/services/productService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5207/api/products';

export const getProducts = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    
    // Debug the response to see exactly what we're getting
    console.log('API Response:', response.data);
    
    // Handle different response formats
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && typeof response.data === 'object') {
      // If data is wrapped in an object, try to find an array property
      const possibleArrays = Object.values(response.data).filter(Array.isArray);
      if (possibleArrays.length > 0) {
        // Return the first array found in the response
        return possibleArrays[0];
      }
      // If no arrays found but it's an object, it might be a single product
      if (response.data.productId || response.data.id) {
        return [response.data];
      }
    }
    
    // If all else fails, return empty array
    console.error('Unexpected data format from API:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await axios.post(API_BASE_URL, productData);
    console.log('Create product response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, productData);
    console.log('Update product response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating product with id ${id}:`, error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/${id}`);
    return true; // Return true on successful deletion
  } catch (error) {
    console.error(`Error deleting product with id ${id}:`, error);
    throw error;
  }
};