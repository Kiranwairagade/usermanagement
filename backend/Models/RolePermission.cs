namespace backend.Models
{
    public class RolePermission
    {
        public int RolePermissionId { get; set; } // Primary key
        public int RoleId { get; set; }
        public string ModuleName { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty; // Stores the action name (view/create/edit/delete)
        public bool IsAllowed { get; set; } // Whether the permission is allowed or denied
        
        // Specific permission flags
        public bool CanView { get; set; }
        public bool CanCreate { get; set; }
        public bool CanEdit { get; set; }
        public bool CanDelete { get; set; }
        
        // Navigation property
        public Role Role { get; set; } = null!;
    }
}