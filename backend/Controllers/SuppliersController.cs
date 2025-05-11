using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Data;
using System;
using System.Linq;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SuppliersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public SuppliersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/suppliers
        [HttpGet]
        public IActionResult GetAllSuppliers()
        {
            try
            {
                var suppliers = _context.Suppliers
                    .Select(s => new
                    {
                        supplierId = s.SupplierId,
                        name = s.Name,
                        email = s.Email,
                        phone = s.Phone,
                        address = s.Address,
                        createdAt = s.CreatedAt,
                        updatedAt = s.UpdatedAt
                    })
                    .ToList();

                return Ok(suppliers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/suppliers/{id}
        [HttpGet("{id}")]
        public IActionResult GetSupplierById(int id)
        {
            var supplier = _context.Suppliers.FirstOrDefault(s => s.SupplierId == id);
            if (supplier == null)
                return NotFound("Supplier not found.");

            return Ok(new
            {
                supplierId = supplier.SupplierId,
                name = supplier.Name,
                email = supplier.Email,
                phone = supplier.Phone,
                address = supplier.Address,
                createdAt = supplier.CreatedAt,
                updatedAt = supplier.UpdatedAt
            });
        }

        // POST: api/suppliers
        [HttpPost]
        public IActionResult AddSupplier([FromBody] Supplier supplier)
        {
            if (string.IsNullOrWhiteSpace(supplier.Name))
                return BadRequest("Supplier name is required.");

            supplier.CreatedAt = DateTime.UtcNow;
            supplier.UpdatedAt = DateTime.UtcNow;
            _context.Suppliers.Add(supplier);
            _context.SaveChanges();

            return Ok(new
            {
                supplierId = supplier.SupplierId,
                name = supplier.Name,
                email = supplier.Email,
                phone = supplier.Phone,
                address = supplier.Address,
                createdAt = supplier.CreatedAt,
                updatedAt = supplier.UpdatedAt
            });
        }

        // PUT: api/suppliers/{id}
        [HttpPut("{id}")]
        public IActionResult UpdateSupplier(int id, [FromBody] Supplier updatedSupplier)
        {
            var supplier = _context.Suppliers.FirstOrDefault(s => s.SupplierId == id);
            if (supplier == null)
                return NotFound("Supplier not found.");

            if (string.IsNullOrWhiteSpace(updatedSupplier.Name))
                return BadRequest("Supplier name is required.");

            supplier.Name = updatedSupplier.Name;
            supplier.Email = updatedSupplier.Email;
            supplier.Phone = updatedSupplier.Phone;
            supplier.Address = updatedSupplier.Address;
            supplier.UpdatedAt = DateTime.UtcNow;
            _context.SaveChanges();

            return Ok(new
            {
                supplierId = supplier.SupplierId,
                name = supplier.Name,
                email = supplier.Email,
                phone = supplier.Phone,
                address = supplier.Address,
                createdAt = supplier.CreatedAt,
                updatedAt = supplier.UpdatedAt
            });
        }

        // DELETE: api/suppliers/{id}
        [HttpDelete("{id}")]
        public IActionResult DeleteSupplier(int id)
        {
            var supplier = _context.Suppliers.FirstOrDefault(s => s.SupplierId == id);
            if (supplier == null)
                return NotFound("Supplier not found.");

            _context.Suppliers.Remove(supplier);
            _context.SaveChanges();
            return Ok("Supplier deleted successfully");
        }
    }
}