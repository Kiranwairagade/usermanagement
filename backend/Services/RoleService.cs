using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class RoleService : IRoleService
    {
        private readonly ApplicationDbContext _context;

        public RoleService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<RoleDto>> GetAllRolesAsync()
        {
            // Fetch roles with their permissions
            var roles = await _context.Roles
                .Include(r => r.RolePermissions)
                .ToListAsync();
            
            // Map to DTOs
            return roles.Select(r => new RoleDto
            {
                RoleId = r.RoleId,
                RoleName = r.RoleName,
                Description = r.Description,
                IsActive = r.IsActive,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt,
                Permissions = MapRolePermissionsToPermissionDtos(r.RolePermissions)
            }).ToList();
        }

        public async Task<RoleDto?> GetRoleByIdAsync(int id)
        {
            var role = await _context.Roles
                .Include(r => r.RolePermissions)
                .FirstOrDefaultAsync(r => r.RoleId == id);
                
            if (role == null) return null;

            return new RoleDto
            {
                RoleId = role.RoleId,
                RoleName = role.RoleName,
                Description = role.Description,
                IsActive = role.IsActive,
                CreatedAt = role.CreatedAt,
                UpdatedAt = role.UpdatedAt,
                Permissions = MapRolePermissionsToPermissionDtos(role.RolePermissions)
            };
        }

        public async Task<List<PermissionDto>> GetRolePermissionsAsync(int id)
        {
            var role = await _context.Roles
                .Include(r => r.RolePermissions)
                .FirstOrDefaultAsync(r => r.RoleId == id);
                
            if (role == null) return null;

            return MapRolePermissionsToPermissionDtos(role.RolePermissions);
        }

        public async Task<RoleDto> CreateRoleAsync(CreateRoleDto dto)
        {
            var role = new Role
            {
                RoleName = dto.RoleName,
                Description = dto.Description,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow,
                // No longer storing permissions as JSON
                Permissions = "[]" // Keep empty default for backward compatibility
            };

            _context.Roles.Add(role);
            await _context.SaveChangesAsync();

            // Now create the role permissions
            if (dto.Permissions != null && dto.Permissions.Any())
            {
                await CreateRolePermissions(role.RoleId, dto.Permissions);
            }

            // Fetch the newly created role with its permissions
            var createdRole = await _context.Roles
                .Include(r => r.RolePermissions)
                .FirstOrDefaultAsync(r => r.RoleId == role.RoleId);
                
            return new RoleDto
            {
                RoleId = createdRole.RoleId,
                RoleName = createdRole.RoleName,
                Description = createdRole.Description,
                IsActive = createdRole.IsActive,
                CreatedAt = createdRole.CreatedAt,
                UpdatedAt = createdRole.UpdatedAt,
                Permissions = MapRolePermissionsToPermissionDtos(createdRole.RolePermissions)
            };
        }

        public async Task<RoleDto?> UpdateRoleAsync(int id, UpdateRoleDto dto)
        {
            var role = await _context.Roles
                .Include(r => r.RolePermissions)
                .FirstOrDefaultAsync(r => r.RoleId == id);
                
            if (role == null) return null;

            role.RoleName = dto.RoleName;
            role.Description = dto.Description;
            role.IsActive = dto.IsActive;
            role.UpdatedAt = DateTime.UtcNow;

            // Update permissions
            // First remove existing permissions
            _context.RolePermissions.RemoveRange(role.RolePermissions);
            
            // Then add the new ones
            if (dto.Permissions != null && dto.Permissions.Any())
            {
                await CreateRolePermissions(role.RoleId, dto.Permissions);
            }

            _context.Roles.Update(role);
            await _context.SaveChangesAsync();

            // Fetch the updated role with its permissions
            var updatedRole = await _context.Roles
                .Include(r => r.RolePermissions)
                .FirstOrDefaultAsync(r => r.RoleId == id);
                
            return new RoleDto
            {
                RoleId = updatedRole.RoleId,
                RoleName = updatedRole.RoleName,
                Description = updatedRole.Description,
                IsActive = updatedRole.IsActive,
                CreatedAt = updatedRole.CreatedAt,
                UpdatedAt = updatedRole.UpdatedAt,
                Permissions = MapRolePermissionsToPermissionDtos(updatedRole.RolePermissions)
            };
        }

        public async Task<bool> UpdateRolePermissionsAsync(UpdateRolePermissionsDto dto)
        {
            var role = await _context.Roles
                .Include(r => r.RolePermissions)
                .FirstOrDefaultAsync(r => r.RoleId == dto.RoleId);
                
            if (role == null) return false;

            // Remove existing permissions
            _context.RolePermissions.RemoveRange(role.RolePermissions);
            await _context.SaveChangesAsync();

            // Add new permissions
            if (dto.Permissions != null && dto.Permissions.Any())
            {
                await CreateRolePermissions(role.RoleId, dto.Permissions);
            }

            return true;
        }

        public async Task<bool> DeleteRoleAsync(int id)
        {
            var role = await _context.Roles
                .Include(r => r.RolePermissions)
                .FirstOrDefaultAsync(r => r.RoleId == id);
                
            if (role == null) return false;

            // Remove role permissions first
            _context.RolePermissions.RemoveRange(role.RolePermissions);
            
            // Then remove the role
            _context.Roles.Remove(role);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<UserRoleDto>> GetUserRolesAsync(int userId)
        {
            // First fetch the data from the database
            var userRoles = await _context.UserRoles
                .Include(ur => ur.User)
                .Include(ur => ur.Role)
                .Where(ur => ur.UserId == userId)
                .ToListAsync();
                
            // Then map to DTOs in memory
            return userRoles.Select(ur => new UserRoleDto
            {
                UserRoleId = ur.UserRoleId,
                UserId = ur.UserId,
                UserName = ur.User.Username,
                RoleId = ur.RoleId,
                RoleName = ur.Role.RoleName,
                AssignedAt = ur.AssignedAt
            }).ToList();
        }

        public async Task<UserRoleDto?> AssignRoleToUserAsync(AssignUserRoleDto dto)
        {
            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null) return null;

            var role = await _context.Roles.FindAsync(dto.RoleId);
            if (role == null) return null;

            var existingAssignment = await _context.UserRoles
                .FirstOrDefaultAsync(ur => ur.UserId == dto.UserId && ur.RoleId == dto.RoleId);
            if (existingAssignment != null) return null;

            var userRole = new UserRole
            {
                UserId = dto.UserId,
                RoleId = dto.RoleId,
                AssignedAt = DateTime.UtcNow
            };

            _context.UserRoles.Add(userRole);
            await _context.SaveChangesAsync();

            return new UserRoleDto
            {
                UserRoleId = userRole.UserRoleId,
                UserId = userRole.UserId,
                UserName = user.Username,
                RoleId = userRole.RoleId,
                RoleName = role.RoleName,
                AssignedAt = userRole.AssignedAt
            };
        }

        public async Task<bool> RemoveRoleFromUserAsync(int userRoleId)
        {
            var userRole = await _context.UserRoles.FindAsync(userRoleId);
            if (userRole == null) return false;

            _context.UserRoles.Remove(userRole);
            await _context.SaveChangesAsync();
            return true;
        }

        // Helper method to create role permissions
        private async Task CreateRolePermissions(int roleId, List<PermissionDto> permissions)
        {
            var rolePermissions = new List<RolePermission>();
            
            foreach (var permission in permissions)
            {
                // Get the action type (view, create, edit, delete)
                string action = permission.Action.ToLower();
                
                // Create a new RolePermission
                var rolePermission = new RolePermission
                {
                    RoleId = roleId,
                    ModuleName = permission.ModuleName,
                    Action = action,
                    IsAllowed = permission.IsAllowed,
                    // Set the specific permission flag based on action
                    CanView = action == "view",
                    CanCreate = action == "create",
                    CanEdit = action == "edit",
                    CanDelete = action == "delete"
                };
                
                rolePermissions.Add(rolePermission);
            }
            
            // Add all permissions at once
            _context.RolePermissions.AddRange(rolePermissions);
            await _context.SaveChangesAsync();
        }

        // Helper method to map RolePermissions to PermissionDtos
        private List<PermissionDto> MapRolePermissionsToPermissionDtos(ICollection<RolePermission> rolePermissions)
        {
            var permissionDtos = new List<PermissionDto>();
            
            foreach (var rolePermission in rolePermissions)
            {
                permissionDtos.Add(new PermissionDto
                {
                    ModuleName = rolePermission.ModuleName,
                    Action = rolePermission.Action,
                    IsAllowed = rolePermission.IsAllowed
                });
            }
            
            return permissionDtos;
        }
    }
}