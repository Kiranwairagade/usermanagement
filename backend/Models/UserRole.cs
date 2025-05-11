using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class UserRole
    {
        [Key]
    public int UserRoleId { get; set; }

        
        
        public int UserId { get; set; }
        
        public int RoleId { get; set; }
        
        [ForeignKey("UserId")]
        public User User { get; set; }
        
        [ForeignKey("RoleId")]
        public Role Role { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime AssignedAt { get; set; } = DateTime.Now;
    }
}