// Models/UserPermission.cs
namespace backend.Models
{
    public class UserPermission
    {
        public int UserId { get; set; }
        public string ModuleName { get; set; } = string.Empty;
        public bool CanCreate { get; set; }
        public bool CanRead { get; set; }
        public bool CanUpdate { get; set; }
        public bool CanDelete { get; set; }

        public User User { get; set; } = null!;
    }
}
