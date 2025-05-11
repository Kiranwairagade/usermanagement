using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public interface IUserService
    {
        Task<UsersResponse> GetUsersAsync(int pageNumber, int pageSize, string? searchTerm);
        Task<UserDetailDto> GetUserByIdAsync(int id);
        Task<IEnumerable<UserPermissionDto>> GetUserPermissionsAsync(int userId);
        Task<bool> UpdateUserAsync(int id, UpdateUserRequest request);
    }

    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;

        public UserService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<UsersResponse> GetUsersAsync(int pageNumber, int pageSize, string? searchTerm)
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Where(u => u.Username.Contains(searchTerm) || u.Email.Contains(searchTerm));
            }

            var users = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new UserDetailDto
                {
                    UserId = u.UserId,
                    Username = u.Username,
                    Email = u.Email,
                    FirstName = u.FirstName,
                    LastName = u.LastName
                })
                .ToListAsync();

            var totalCount = await query.CountAsync();

            return new UsersResponse
            {
                Users = users,
                TotalCount = totalCount
            };
        }

        public async Task<UserDetailDto> GetUserByIdAsync(int id)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null)
            {
                throw new KeyNotFoundException("User not found.");
            }

            return new UserDetailDto
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName
            };
        }

        public async Task<IEnumerable<UserPermissionDto>> GetUserPermissionsAsync(int userId)
        {
            var permissions = await _context.UserPermissions
                .Where(p => p.UserId == userId)
                .Select(p => new UserPermissionDto
                {
                    UserId = p.UserId,
                    ModuleName = p.ModuleName,
                    CanCreate = p.CanCreate,
                    CanRead = p.CanRead,
                    CanUpdate = p.CanUpdate,
                    CanDelete = p.CanDelete
                })
                .ToListAsync();

            return permissions;
        }

        public async Task<bool> UpdateUserAsync(int id, UpdateUserRequest request)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                throw new KeyNotFoundException("User not found.");
            }

            user.Username = request.Username;
            user.Email = request.Email;
            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
            user.IsActive = request.IsActive;

            // Update permissions if provided
            if (request.UserPermissions != null && request.UserPermissions.Count > 0)
            {
                // Remove existing permissions
                var existingPermissions = await _context.UserPermissions
                    .Where(p => p.UserId == id)
                    .ToListAsync();

                _context.UserPermissions.RemoveRange(existingPermissions);

                // Add new permissions
                foreach (var perm in request.UserPermissions)
                {
                    var permission = new UserPermission
                    {
                        UserId = id,
                        ModuleName = perm.ModuleName,
                        CanCreate = perm.CanCreate,
                        CanRead = perm.CanRead,
                        CanUpdate = perm.CanUpdate,
                        CanDelete = perm.CanDelete
                    };
                    _context.UserPermissions.Add(permission);
                }

                // Update permissions list in user object
                user.Permissions = request.UserPermissions
                    .Where(p => p.CanRead || p.CanCreate || p.CanUpdate || p.CanDelete)
                    .Select(p => p.ModuleName)
                    .Distinct()
                    .ToList();
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}