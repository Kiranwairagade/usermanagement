using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class RoleDto
    {
        public int RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<PermissionDto> Permissions { get; set; } = new List<PermissionDto>();
    }

    public class CreateRoleDto
    {
        [Required]
        public string RoleName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public List<PermissionDto>? Permissions { get; set; }
    }

    public class UpdateRoleDto
    {
        [Required]
        public string RoleName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public List<PermissionDto>? Permissions { get; set; }
    }

    public class PermissionDto
    {
        [Required]
        public string ModuleName { get; set; } = string.Empty;
        
        [Required]
        public string Action { get; set; } = string.Empty;
        
        public bool IsAllowed { get; set; } = true;
    }

    public class UserRoleDto
    {
        public int UserRoleId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public DateTime? AssignedAt { get; set; }
    }

    public class AssignUserRoleDto
    {
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public int RoleId { get; set; }
    }
}