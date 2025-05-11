// // src/services/moduleService.js
// import axios from 'axios';
// import { getAuthHeaders } from '../utils/auth';
// import { API_BASE_URL } from '../config/constants';

// const moduleService = {
//   /**
//    * Fetch all available modules with their actions
//    * @returns {Promise<Array>} - A promise that resolves to an array of module objects
//    */
//   getAllModules: async () => {
//     try {
//       // Get auth headers with token
//       const headers = getAuthHeaders();
      
//       // Make the API call
//       const response = await axios.get(`${API_BASE_URL}/modules`, { headers });
      
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching modules:', error);
      
//       // For demo purposes only - return default modules if API fails
//       // In production, you would want to handle this error properly
//       return [
//         {
//           name: 'dashboard',
//           displayName: 'Dashboard',
//           actions: ['view']
//         },
//         {
//           name: 'brands',
//           displayName: 'Brands',
//           actions: ['view', 'create', 'edit', 'delete']
//         },
//         {
//           name: 'categories',
//           displayName: 'Categories',
//           actions: ['view', 'create', 'edit', 'delete']
//         },
//         {
//           name: 'products',
//           displayName: 'Products',
//           actions: ['view', 'create', 'edit', 'delete']
//         },
//         {
//           name: 'suppliers',
//           displayName: 'Suppliers',
//           actions: ['view', 'create', 'edit', 'delete']
//         },
//         {
//           name: 'users',
//           displayName: 'Users',
//           actions: ['view', 'create', 'edit', 'delete']
//         },
//         {
//           name: 'roles',
//           displayName: 'Roles',
//           actions: ['view', 'create', 'edit', 'delete']
//         },
//         {
//           name: 'reports',
//           displayName: 'Reports',
//           actions: ['view', 'export']
//         },
//         {
//           name: 'chatbot',
//           displayName: 'ChatBot',
//           actions: ['view', 'use']
//         }
//       ];
//     }
//   },

//   /**
//    * Get module details by module name
//    * @param {string} moduleName - The name of the module to fetch
//    * @returns {Promise<Object>} - A promise that resolves to the module object
//    */
//   getModuleByName: async (moduleName) => {
//     try {
//       const headers = getAuthHeaders();
//       const response = await axios.get(`${API_BASE_URL}/modules/${moduleName}`, { headers });
//       return response.data;
//     } catch (error) {
//       console.error(`Error fetching module ${moduleName}:`, error);
//       throw error;
//     }
//   },
  
//   /**
//    * Get all module actions for a specific module
//    * @param {string} moduleName - The name of the module
//    * @returns {Promise<Array>} - A promise that resolves to an array of actions
//    */
//   getModuleActions: async (moduleName) => {
//     try {
//       const headers = getAuthHeaders();
//       const response = await axios.get(`${API_BASE_URL}/modules/${moduleName}/actions`, { headers });
//       return response.data;
//     } catch (error) {
//       console.error(`Error fetching actions for module ${moduleName}:`, error);
      
//       // Fallback default actions by module
//       const defaultActions = {
//         'dashboard': ['view'],
//         'brands': ['view', 'create', 'edit', 'delete'],
//         'categories': ['view', 'create', 'edit', 'delete'],
//         'products': ['view', 'create', 'edit', 'delete'],
//         'suppliers': ['view', 'create', 'edit', 'delete'],
//         'users': ['view', 'create', 'edit', 'delete'],
//         'roles': ['view', 'create', 'edit', 'delete'],
//         'reports': ['view', 'export'],
//         'chatbot': ['view', 'use']
//       };
      
//       return defaultActions[moduleName] || ['view'];
//     }
//   }
// };

// export default moduleService;