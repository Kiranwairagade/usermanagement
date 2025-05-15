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
    public interface IUserService
    {
        Task<UsersResponse> GetUsersAsync(int pageNumber, int pageSize, string? searchTerm);
        Task<UserDetailDto> GetUserByIdAsync(int id);
        Task<IEnumerable<UserPermissionDto>> GetUserPermissionsAsync(int userId);
        Task<bool> UpdateUserAsync(int id, UpdateUserRequest request);
        Task<int> CreateUserAsync(CreateUserRequest request); 
        Task<bool> DeleteUserAsync(int userId);
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
                    LastName = u.LastName,
                    IsActive = u.IsActive,
                    Permissions = u.Permissions ?? new List<string>()
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
                LastName = user.LastName,
                IsActive = user.IsActive,
                Permissions = user.Permissions ?? new List<string>()
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

        public async Task<int> CreateUserAsync(CreateUserRequest request)
        {
            // Check if username or email already exists
            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
                throw new InvalidOperationException("Username already exists.");

            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                throw new InvalidOperationException("Email already exists.");

            // Create new user
            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                IsActive = request.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Permissions = request.UserPermissions
                    .Where(p => p.CanRead || p.CanCreate || p.CanUpdate || p.CanDelete)
                    .Select(p => p.ModuleName)
                    .Distinct()
                    .ToList()
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Add permissions if provided
            if (request.UserPermissions != null && request.UserPermissions.Count > 0)
            {
                foreach (var perm in request.UserPermissions)
                {
                    var permission = new UserPermission
                    {
                        UserId = user.UserId,
                        ModuleName = perm.ModuleName,
                        CanCreate = perm.CanCreate,
                        CanRead = perm.CanRead,
                        CanUpdate = perm.CanUpdate,
                        CanDelete = perm.CanDelete
                    };
                    _context.UserPermissions.Add(permission);
                }
                await _context.SaveChangesAsync();
            }

            return user.UserId;
        }

        public async Task<bool> UpdateUserAsync(int id, UpdateUserRequest request)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                throw new KeyNotFoundException("User not found.");
            }

            // Check if username is being changed and if it already exists for another user
            if (user.Username != request.Username && 
                await _context.Users.AnyAsync(u => u.Username == request.Username && u.UserId != id))
            {
                throw new InvalidOperationException("Username already exists.");
            }

            // Check if email is being changed and if it already exists for another user
            if (user.Email != request.Email && 
                await _context.Users.AnyAsync(u => u.Email == request.Email && u.UserId != id))
            {
                throw new InvalidOperationException("Email already exists.");
            }

            user.Username = request.Username;
            user.Email = request.Email;
            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
            user.IsActive = request.IsActive;
            user.UpdatedAt = DateTime.UtcNow;

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

        public async Task<bool> DeleteUserAsync(int userId)
{
    var user = await _context.Users.FindAsync(userId);
    if (user == null)
        return false;

    _context.Users.Remove(user);
    await _context.SaveChangesAsync();
    return true;
}

    }
}