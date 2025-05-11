using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.DTOs;
using backend.Models;
using backend.Data;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserPermissionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserPermissionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 🔹 POST: Create or Update a single permission
        [HttpPost]
        public async Task<IActionResult> SetPermission(CreateUserPermissionDto dto)
        {
            var userExists = await _context.Users.AnyAsync(u => u.UserId == dto.UserId);
            if (!userExists)
                return NotFound(new { message = $"User with ID {dto.UserId} not found" });

            var existing = await _context.UserPermissions
                .FirstOrDefaultAsync(p => p.UserId == dto.UserId && p.ModuleName == dto.ModuleName);

            if (existing != null)
            {
                existing.CanCreate = dto.CanCreate;
                existing.CanRead = dto.CanRead;
                existing.CanUpdate = dto.CanUpdate;
                existing.CanDelete = dto.CanDelete;
            }
            else
            {
                var permission = new UserPermission
                {
                    UserId = dto.UserId,
                    ModuleName = dto.ModuleName,
                    CanCreate = dto.CanCreate,
                    CanRead = dto.CanRead,
                    CanUpdate = dto.CanUpdate,
                    CanDelete = dto.CanDelete
                };
                _context.UserPermissions.Add(permission);
            }

            await _context.SaveChangesAsync();
            await UpdateSimplePermissionsList(dto.UserId);

            return Ok(new { message = "Permissions saved." });
        }

        // 🔹 GET: All permissions for a user
        [HttpGet("{userId}")]
        public async Task<ActionResult<IEnumerable<UserPermissionDto>>> GetUserPermissions(int userId)
        {
            var userExists = await _context.Users.AnyAsync(u => u.UserId == userId);
            if (!userExists)
                return NotFound(new { message = $"User with ID {userId} not found" });

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

            return Ok(permissions);
        }

        // 🔹 PUT: Replace all permissions for a user
        [HttpPut("{userId}")]
        public async Task<IActionResult> UpdateUserPermissions(int userId, [FromBody] List<CreateUserPermissionDto> permissions)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = $"User with ID {userId} not found" });

            var existingPermissions = await _context.UserPermissions
                .Where(p => p.UserId == userId)
                .ToListAsync();

            _context.UserPermissions.RemoveRange(existingPermissions);

            foreach (var perm in permissions)
            {
                _context.UserPermissions.Add(new UserPermission
                {
                    UserId = userId,
                    ModuleName = perm.ModuleName,
                    CanCreate = perm.CanCreate,
                    CanRead = perm.CanRead,
                    CanUpdate = perm.CanUpdate,
                    CanDelete = perm.CanDelete
                });
            }

            await _context.SaveChangesAsync();
            await UpdateSimplePermissionsList(userId);

            return Ok(new { message = "All permissions updated." });
        }

        // 🔹 DELETE: Specific permission by ID
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePermission(int id)
        {
            var permission = await _context.UserPermissions.FindAsync(id);
            if (permission == null)
                return NotFound();

            int userId = permission.UserId;

            _context.UserPermissions.Remove(permission);
            await _context.SaveChangesAsync();

            await UpdateSimplePermissionsList(userId);

            return Ok(new { message = "Permission deleted." });
        }

        // 🔹 Private helper: Update User.Permissions field with allowed module names
        private async Task UpdateSimplePermissionsList(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                var permissions = await _context.UserPermissions
                    .Where(p => p.UserId == userId)
                    .ToListAsync();

                user.Permissions = permissions
                    .Where(p => p.CanRead || p.CanCreate || p.CanUpdate || p.CanDelete)
                    .Select(p => p.ModuleName)
                    .Distinct()
                    .ToList();

                user.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        // Add this GET API to get simple allowed permissions list
[HttpGet("simple/{userId}")]
public async Task<ActionResult<List<string>>> GetSimplePermissions(int userId)
{
    var user = await _context.Users.FindAsync(userId);
    if (user == null)
        return NotFound(new { message = "User not found" });

    return Ok(user.Permissions ?? new List<string>());
}

    }
}
