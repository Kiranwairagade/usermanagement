// DTOs/UserPermissionDtos.cs
namespace backend.DTOs
{
    public class CreateUserPermissionDto
    {
        public int UserId { get; set; }
        public string ModuleName { get; set; } = string.Empty;
        public bool CanCreate { get; set; }
        public bool CanRead { get; set; }
        public bool CanUpdate { get; set; }
        public bool CanDelete { get; set; }
    }
}
