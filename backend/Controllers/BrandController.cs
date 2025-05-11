using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Data;
using System.Linq;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BrandsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BrandsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/brands
        [HttpGet]
        public IActionResult GetAllBrands()
        {
            var brands = _context.Brands
                .Select(b => new
                {
                    b.BrandId,
                    b.BrandName,
                    b.Description
                })
                .ToList();

            return Ok(brands);
        }

        // POST: api/brands
        [HttpPost]
        public IActionResult AddBrand([FromBody] Brand brand)
        {
            if (string.IsNullOrWhiteSpace(brand.BrandName))
                return BadRequest("Brand name is required.");

            brand.CreatedAt = DateTime.Now;
            brand.UpdatedAt = DateTime.Now;

            _context.Brands.Add(brand);
            _context.SaveChanges();

            return Ok(brand);
        }

        // PUT: api/brands/{id}
        [HttpPut("{id}")]
        public IActionResult UpdateBrand(int id, [FromBody] Brand updatedBrand)
        {
            var brand = _context.Brands.FirstOrDefault(b => b.BrandId == id);
            if (brand == null)
                return NotFound("Brand not found.");

            if (string.IsNullOrWhiteSpace(updatedBrand.BrandName))
                return BadRequest("Brand name is required.");

            brand.BrandName = updatedBrand.BrandName;
            brand.Description = updatedBrand.Description;
            brand.UpdatedAt = DateTime.Now;

            _context.SaveChanges();

            return Ok(brand);
        }

        // DELETE: api/brands/{id}
        [HttpDelete("{id}")]
        public IActionResult DeleteBrand(int id)
        {
            var brand = _context.Brands.FirstOrDefault(b => b.BrandId == id);
            if (brand == null)
                return NotFound("Brand not found");

            _context.Brands.Remove(brand);
            _context.SaveChanges();

            return Ok("Brand deleted successfully");
        }
    }
}
