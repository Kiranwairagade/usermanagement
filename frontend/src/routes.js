// import React from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import Login from './components/auth/Login';
// import Signup from './components/auth/Signup';
// import Dashboard from './components/admin/Dashboard';
// import UserManagement from './components/admin/UserManagement';
// import ProductMaster from './components/masters/ProductMaster';
// import CategoryMaster from './components/masters/CategoryMaster';
// import BrandMaster from './components/masters/BrandMaster';
// import SupplierMaster from './components/masters/SupplierMaster';
// import RolePermissions from './components/masters/RolePermissions';
// import RoleMaster from './components/masters/RoleMaster';
// import Chatbot from './components/common/Chatbot';
// import { useAuth } from './contexts/AuthContext';
// import ProtectedRoute from './components/common/ProtectedRoute';
// import ProtectedMasterRoute from './components/common/ProtectedMasterRoute';
// import AccessDenied from './components/common/AccessDenied';

// const AppRoutes = () => {
//   const { isAuthenticated } = useAuth();

//   return (
//     <Routes>
//       {/* Public routes */}
//       <Route 
//         path="/login" 
//         element={isAuthenticated ? <Navigate to="/" /> : <Login />} 
//       />
//       <Route 
//         path="/signup" 
//         element={isAuthenticated ? <Navigate to="/" /> : <Signup />} 
//       />
      
//       {/* Protected routes */}
//       <Route 
//         path="/" 
//         element={
//           <ProtectedRoute>
//             <Dashboard />
//           </ProtectedRoute>
//         } 
//       />
      
//       {/* Admin routes */}
//       <Route 
//         path="/user-management" 
//         element={
//           <ProtectedRoute>
//             <UserManagement />
//           </ProtectedRoute>
//         } 
//       />
      
//       {/* Master modules with permission checks */}
//       <Route 
//         path="/products" 
//         element={
//           <ProtectedMasterRoute 
//             component={ProductMaster} 
//             moduleName="products" 
//             action="view" 
//           />
//         } 
//       />
      
//       <Route 
//         path="/categories" 
//         element={
//           <ProtectedMasterRoute 
//             component={CategoryMaster} 
//             moduleName="categories" 
//             action="view" 
//           />
//         } 
//       />
      
//       <Route 
//         path="/brands" 
//         element={
//           <ProtectedMasterRoute 
//             component={BrandMaster} 
//             moduleName="brands" 
//             action="view" 
//           />
//         } 
//       />
      
//       <Route 
//         path="/suppliers" 
//         element={
//           <ProtectedMasterRoute 
//             component={SupplierMaster} 
//             moduleName="suppliers" 
//             action="view" 
//           />
//         } 
//       />
      
//       <Route 
//         path="/roles" 
//         element={
//           <ProtectedMasterRoute 
//             component={RoleMaster} 
//             moduleName="roles" 
//             action="view" 
//           />
//         } 
//       />

//       <Route 
//         path="/chatbot" 
//         element={
//           <ProtectedRoute>
//             <Chatbot />
//           </ProtectedRoute>
//         } 
//       />
      
//       {/* Access denied route */}
//       <Route path="/access-denied" element={<AccessDenied />} />
      
//       {/* Fallback route */}
//       <Route path="*" element={<Navigate to="/" />} />
//     </Routes>
//   );
// };

// export default AppRoutes;