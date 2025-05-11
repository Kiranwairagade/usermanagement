using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public interface IPermissionService
    {
        Task<List<UserPermission>> GetUserPermissionsAsync(int userId);
        Task<List<string>> GetUserPermissionNamesAsync(int userId);
        Task UpdateUserPermissionsAsync(int userId, List<UserPermission> permissions);
        Task<bool> HasPermissionAsync(int userId, string moduleName, string action);
        Task<Dictionary<string, bool>> GetUserPermissionsMapAsync(int userId);
    }

    public class PermissionService : IPermissionService
    {
        private readonly ApplicationDbContext _context;

        public PermissionService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<UserPermission>> GetUserPermissionsAsync(int userId)
        {
            return await _context.UserPermissions
                .Where(p => p.UserId == userId)
                .ToListAsync();
        }

        public async Task<List<string>> GetUserPermissionNamesAsync(int userId)
        {
            var permissions = await _context.UserPermissions
                .Where(p => p.UserId == userId)
                .ToListAsync();

            var permissionNames = new List<string>();

            foreach (var perm in permissions)
            {
                if (perm.CanRead) permissionNames.Add($"{perm.ModuleName}:read");
                if (perm.CanCreate) permissionNames.Add($"{perm.ModuleName}:create");
                if (perm.CanUpdate) permissionNames.Add($"{perm.ModuleName}:update");
                if (perm.CanDelete) permissionNames.Add($"{perm.ModuleName}:delete");
            }

            return permissionNames;
        }

        public async Task UpdateUserPermissionsAsync(int userId, List<UserPermission> permissions)
        {
            var existingPermissions = await _context.UserPermissions
                .Where(p => p.UserId == userId)
                .ToListAsync();

            _context.UserPermissions.RemoveRange(existingPermissions);

            foreach (var permission in permissions)
            {
                permission.UserId = userId;
                _context.UserPermissions.Add(permission);
            }

            await _context.SaveChangesAsync();
        }

        public async Task<bool> HasPermissionAsync(int userId, string moduleName, string action)
        {
            // First check direct user permissions
            var directPermission = await _context.UserPermissions
                .FirstOrDefaultAsync(p => 
                    p.UserId == userId && 
                    p.ModuleName == moduleName && 
                    (action == "read" && p.CanRead ||
                     action == "create" && p.CanCreate ||
                     action == "update" && p.CanUpdate ||
                     action == "delete" && p.CanDelete));

            if (directPermission != null)
                return true;

            // If no direct permission found, check role permissions
            var userRoleIds = await _context.UserRoles
                .Where(ur => ur.UserId == userId)
                .Select(ur => ur.RoleId)
                .ToListAsync();

            if (userRoleIds.Any())
            {
                // Map permission action to corresponding boolean field
                var rolePermission = await _context.RolePermissions
                    .FirstOrDefaultAsync(rp => 
                        userRoleIds.Contains(rp.RoleId) && 
                        rp.ModuleName == moduleName && 
                        ((action == "read" && rp.CanView) ||
                         (action == "create" && rp.CanCreate) ||
                         (action == "update" && rp.CanEdit) ||
                         (action == "delete" && rp.CanDelete)));
                
                if (rolePermission != null)
                    return true;
            }

            return false;
        }
        
        public async Task<Dictionary<string, bool>> GetUserPermissionsMapAsync(int userId)
        {
            var permissionsMap = new Dictionary<string, bool>();
            
            // Get direct user permissions
            var directPermissions = await _context.UserPermissions
                .Where(p => p.UserId == userId)
                .ToListAsync();
                
            foreach (var permission in directPermissions)
            {
                if (permission.CanRead) permissionsMap[$"{permission.ModuleName}.read"] = true;
                if (permission.CanCreate) permissionsMap[$"{permission.ModuleName}.create"] = true;
                if (permission.CanUpdate) permissionsMap[$"{permission.ModuleName}.update"] = true;
                if (permission.CanDelete) permissionsMap[$"{permission.ModuleName}.delete"] = true;
            }
            
            // Get role-based permissions
            var userRoleIds = await _context.UserRoles
                .Where(ur => ur.UserId == userId)
                .Select(ur => ur.RoleId)
                .ToListAsync();
                
            if (userRoleIds.Any())
            {
                var rolePermissions = await _context.RolePermissions
                    .Where(rp => userRoleIds.Contains(rp.RoleId))
                    .ToListAsync();
                    
                foreach (var permission in rolePermissions)
                {
                    // Map the database structure to permission actions
                    if (permission.CanView)
                        AddRolePermission(permissionsMap, permission.ModuleName, "read");
                    if (permission.CanCreate)
                        AddRolePermission(permissionsMap, permission.ModuleName, "create");
                    if (permission.CanEdit)
                        AddRolePermission(permissionsMap, permission.ModuleName, "update");
                    if (permission.CanDelete)
                        AddRolePermission(permissionsMap, permission.ModuleName, "delete");
                }
            }
            
            return permissionsMap;
        }

        private void AddRolePermission(Dictionary<string, bool> permissionsMap, string moduleName, string action)
        {
            var key = $"{moduleName}.{action}";
            
            // Only add role permission if not already defined by direct user permission
            if (!permissionsMap.ContainsKey(key))
            {
                permissionsMap[key] = true;
            }
        }
    }
}