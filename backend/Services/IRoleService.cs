using System.Collections.Generic;
using System.Threading.Tasks;
using backend.DTOs;

namespace backend.Services
{
    public interface IRoleService
    {
        Task<List<RoleDto>> GetAllRolesAsync();
        Task<RoleDto?> GetRoleByIdAsync(int id);
        Task<List<PermissionDto>> GetRolePermissionsAsync(int id);
        Task<RoleDto> CreateRoleAsync(CreateRoleDto dto);
        Task<RoleDto?> UpdateRoleAsync(int id, UpdateRoleDto dto);
        Task<bool> UpdateRolePermissionsAsync(UpdateRolePermissionsDto dto);
        Task<bool> DeleteRoleAsync(int id);
        Task<List<UserRoleDto>> GetUserRolesAsync(int userId);
        Task<UserRoleDto?> AssignRoleToUserAsync(AssignUserRoleDto dto);
        Task<bool> RemoveRoleFromUserAsync(int userRoleId);
    }
}