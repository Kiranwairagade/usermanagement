// using System.Collections.Generic;

// namespace backend.DTOs
// {
//     // Extending the CreateRoleDto to include permissions
//     public class CreateRoleWithPermissionsDto : CreateRoleDto
//     {
//         public new List<AssignRolePermissionDto> Permissions { get; set; } = new List<AssignRolePermissionDto>();
//     }

//     public class AssignRolePermissionDto
//     {
//         public string PermissionName { get; set; } = string.Empty;  
//         public string ModuleName { get; set; } = string.Empty;
//         public bool CanView { get; set; }
//         public bool CanCreate { get; set; }
//         public bool CanEdit { get; set; }
//         public bool CanDelete { get; set; }
//     }

//     public class RolePermissionDto
//     {
//         public int Id { get; set; }
//         public int RoleId { get; set; }
//         public string ModuleName { get; set; }
//         public bool CanView { get; set; }
//         public bool CanCreate { get; set; }
//         public bool CanEdit { get; set; }
//         public bool CanDelete { get; set; }
//         public string Action { get; set; }
//         public bool IsAllowed { get; set; }
//     }
    
    

// }