using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("ProductCategories")]
    public class Category
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CategoryId { get; set; }

        [Required(ErrorMessage = "Category name is required.")]
        [StringLength(100)]
        public string CategoryName { get; set; } = string.Empty;

        [StringLength(255)]
        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation property
        public List<Product> Products { get; set; } = new List<Product>();
    }
}
