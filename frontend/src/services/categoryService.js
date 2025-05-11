import axios from 'axios';

const API_BASE_URL = 'http://localhost:5207/api/categories';

// Fetch all categories
export const getAllCategories = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

// Add a new category
export const addCategory = async (category) => {
  try {
    const response = await axios.post(API_BASE_URL, category);
    return response.status === 201 || response.status === 200;
  } catch (error) {
    console.error('Error adding category:', error);
    return false;
  }
};

// Delete a category by ID
export const deleteCategory = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.status === 200;
  } catch (error) {
    console.error('Error deleting category:', error);
    return false;
  }
};

// Update a category by ID
export const updateCategory = async (id, updatedCategory) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, updatedCategory);
    return response.status === 200;
  } catch (error) {
    console.error('Error updating category:', error);
    return false;
  }
};
