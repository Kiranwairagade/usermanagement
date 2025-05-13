import React, { useState, useEffect } from 'react';
import { 
  getDetailedUserPermissions, 
  updateDetailedUserPermissions 
} from '../services/userService';
import { 
  masterModules, 
  operationsModules, 
  storageModules, 
  adminModules 
} from '../config/modules';

const UserPermissionsManager = ({ userId, onUpdateComplete }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Combine all modules
  const allModules = [
    ...masterModules,
    ...operationsModules,
    ...storageModules,
    ...adminModules
  ];

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);
        const userPermissions = await getDetailedUserPermissions(userId);
        
        // Create a permissions array with all available modules
        const permissionsMap = {};
        
        // Map existing permissions to an object for easy lookup
        userPermissions.forEach(perm => {
          permissionsMap[perm.moduleName] = perm;
        });
        
        // Create the full permissions array with all modules
        const fullPermissions = allModules.map(module => {
          // Convert module name format for lookup
          const moduleName = module;
          const existingPerm = permissionsMap[moduleName];
          
          if (existingPerm) {
            return {
              userId: userId,
              moduleName: moduleName,
              canCreate: existingPerm.canCreate,
              canRead: existingPerm.canRead,
              canUpdate: existingPerm.canUpdate,
              canDelete: existingPerm.canDelete
            };
          } else {
            return {
              userId: userId,
              moduleName: moduleName,
              canCreate: false,
              canRead: false,
              canUpdate: false,
              canDelete: false
            };
          }
        });
        
        setPermissions(fullPermissions);
        setLoading(false);
      } catch (err) {
        setError('Failed to load permissions');
        setLoading(false);
        console.error(err);
      }
    };
    
    if (userId) {
      fetchPermissions();
    }
  }, [userId]);

  const handlePermissionChange = (moduleIndex, permType, value) => {
    const updatedPermissions = [...permissions];
    updatedPermissions[moduleIndex][permType] = value;
    setPermissions(updatedPermissions);
  };

  const handleSavePermissions = async () => {
    try {
      setSaving(true);
      await updateDetailedUserPermissions(userId, permissions);
      setMessage('Permissions saved successfully');
      if (onUpdateComplete) {
        onUpdateComplete();
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to save permissions');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Group the modules by their category
  const getModuleCategory = (moduleName) => {
    if (masterModules.includes(moduleName)) return 'Master';
    if (operationsModules.includes(moduleName)) return 'Operations';
    if (storageModules.includes(moduleName)) return 'Storage';
    if (adminModules.includes(moduleName)) return 'Admin';
    return 'Other';
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
    const category = getModuleCategory(perm.moduleName);
    if (!acc[category]) acc[category] = [];
    acc[category].push(perm);
    return acc;
  }, {});

  if (loading) {
    return <div className="text-center p-4">Loading permissions...</div>;
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Manage User Permissions</h2>
      
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      {/* Iterate through categories */}
      {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
        <div key={category} className="mb-8">
          <h3 className="text-lg font-semibold mb-3">{category} Modules</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left py-3 px-4 font-semibold">Module</th>
                  <th className="text-center py-3 px-4 font-semibold">View</th>
                  <th className="text-center py-3 px-4 font-semibold">Create</th>
                  <th className="text-center py-3 px-4 font-semibold">Edit</th>
                  <th className="text-center py-3 px-4 font-semibold">Delete</th>
                </tr>
              </thead>
              <tbody>
                {categoryPermissions.map((perm, index) => {
                  // Get the global index of this permission in the full permissions array
                  const globalIndex = permissions.findIndex(p => p.moduleName === perm.moduleName);
                  
                  return (
                    <tr key={perm.moduleName} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-3 px-4 border-b">{perm.moduleName}</td>
                      <td className="py-3 px-4 border-b text-center">
                        <input
                          type="checkbox"
                          checked={perm.canRead}
                          onChange={(e) => handlePermissionChange(globalIndex, 'canRead', e.target.checked)}
                          className="form-checkbox h-5 w-5 text-blue-600"
                        />
                      </td>
                      <td className="py-3 px-4 border-b text-center">
                        <input
                          type="checkbox"
                          checked={perm.canCreate}
                          onChange={(e) => handlePermissionChange(globalIndex, 'canCreate', e.target.checked)}
                          className="form-checkbox h-5 w-5 text-blue-600"
                        />
                      </td>
                      <td className="py-3 px-4 border-b text-center">
                        <input
                          type="checkbox"
                          checked={perm.canUpdate}
                          onChange={(e) => handlePermissionChange(globalIndex, 'canUpdate', e.target.checked)}
                          className="form-checkbox h-5 w-5 text-blue-600"
                        />
                      </td>
                      <td className="py-3 px-4 border-b text-center">
                        <input
                          type="checkbox"
                          checked={perm.canDelete}
                          onChange={(e) => handlePermissionChange(globalIndex, 'canDelete', e.target.checked)}
                          className="form-checkbox h-5 w-5 text-blue-600"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSavePermissions}
          disabled={saving}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {saving ? 'Saving...' : 'Save Permissions'}
        </button>
      </div>
    </div>
  );
};

export default UserPermissionsManager;