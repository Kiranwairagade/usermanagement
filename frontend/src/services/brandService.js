// src/services/brandService.js
import axios from 'axios';

const BASE_URL = 'http://localhost:5207/api'; // Replace with your actual API URL

export const getAllBrands = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/brands`);
    return response.data;
  } catch (error) {
    console.error("Error fetching brands:", error);
    return null;
  }
};

export const addBrand = async (brandData) => {
  try {
    const response = await axios.post(`${BASE_URL}/brands`, brandData);
    return response.data;
  } catch (error) {
    console.error("Error adding brand:", error);
    return null;
  }
};

export const deleteBrand = async (brandId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/brands/${brandId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting brand:", error);
    return null;
  }
};

export const updateBrand = async (brandId, brandData) => {
  try {
    const response = await axios.put(`${BASE_URL}/brands/${brandId}`, brandData);
    return response.data;
  } catch (error) {
    console.error("Error updating brand:", error);
    return null;
  }
};
