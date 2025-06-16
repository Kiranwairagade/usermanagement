using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class ActivityLog
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string UserEmail { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Module { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Action { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        public string? Details { get; set; } // JSON string for additional data

        [Required]
        public DateTime DateTime { get; set; } = DateTime.UtcNow;

        [MaxLength(45)]
        public string? IpAddress { get; set; }

        [MaxLength(500)]
        public string? UserAgent { get; set; }

        public bool IsSuccess { get; set; } = true;

        [MaxLength(1000)]
        public string? ErrorMessage { get; set; }
    }
}