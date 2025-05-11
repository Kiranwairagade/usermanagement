using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Data;
using System.Linq;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CategoriesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/categories
        [HttpGet]
        public IActionResult GetAllCategories()
        {
            var categories = _context.Categories
                .Select(c => new
                {
                    c.CategoryId,
                    Name = c.CategoryName,
                    c.Description
                })
                .ToList();

            return Ok(categories);
        }

        // POST: api/categories
        [HttpPost]
        public IActionResult AddCategory([FromBody] Category category)
        {
            if (string.IsNullOrWhiteSpace(category.CategoryName))
                return BadRequest("Category name is required.");

            category.CreatedAt = DateTime.Now;
            category.UpdatedAt = DateTime.Now;

            _context.Categories.Add(category);
            _context.SaveChanges();

            return Ok(category);
        }

        // PUT: api/categories/{id}
        [HttpPut("{id}")]
        public IActionResult UpdateCategory(int id, [FromBody] Category updatedCategory)
        {
            var category = _context.Categories.FirstOrDefault(c => c.CategoryId == id);
            if (category == null)
                return NotFound("Category not found.");

            if (string.IsNullOrWhiteSpace(updatedCategory.CategoryName))
                return BadRequest("Category name is required.");

            category.CategoryName = updatedCategory.CategoryName;
            category.Description = updatedCategory.Description;
            category.UpdatedAt = DateTime.Now;

            _context.SaveChanges();

            return Ok(category);
        }

        // DELETE: api/categories/{id}
        [HttpDelete("{id}")]
        public IActionResult DeleteCategory(int id)
        {
            var category = _context.Categories.FirstOrDefault(c => c.CategoryId == id);
            if (category == null)
                return NotFound("Category not found");

            _context.Categories.Remove(category);
            _context.SaveChanges();

            return Ok("Category deleted successfully");
        }
    }
}
