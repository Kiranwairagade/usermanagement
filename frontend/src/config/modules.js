// src/config/modules.js

// Master modules
const masterModules = [
  "Categories",
  "Brands",
  "Suppliers",
  "Products",
  "Roles"
];

// Operations modules
const operationsModules = [
  "Production Orders",
  "Material Receipt",
  "Quality Check"
];

// Storage modules
const storageModules = [
  "Inventory Management",
  "Stock Transfers",
  "Stock Adjustments"
];

// Admin modules
const adminModules = [
  "User Management",
  'ChatBot',
  'Activity Log'
];

// Export all modules by category
export { masterModules, operationsModules, storageModules, adminModules };

// Export default for backward compatibility with existing code
export default masterModules;