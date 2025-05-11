using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Services
{
    public interface IProductService
    {
        Task<IEnumerable<Product>> GetAllProductsAsync();
        Task<Product> GetProductByIdAsync(int id);
        Task<Product> CreateProductAsync(CreateProductDTO productDTO);
        Task<Product> UpdateProductAsync(int id, UpdateProductDTO productDTO);
        Task<bool> DeleteProductAsync(int id);
    }

    public class ProductService : IProductService
    {
        private readonly ApplicationDbContext _context;

        public ProductService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Product>> GetAllProductsAsync()
        {
            return await _context.Products.ToListAsync();
        }

        public async Task<Product> GetProductByIdAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
            {
                throw new KeyNotFoundException($"Product with ID {id} not found.");
            }

            return product;
        }

        public async Task<Product> CreateProductAsync(CreateProductDTO productDTO)
        {
            var product = new Product
            {
                Name = productDTO.Name,
                Price = productDTO.Price,
                Category = productDTO.Category,
                Stock = productDTO.Stock,
                CreatedAt = DateTime.UtcNow
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return product;
        }

        public async Task<Product> UpdateProductAsync(int id, UpdateProductDTO productDTO)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
            {
                throw new KeyNotFoundException($"Product with ID {id} not found.");
            }

            product.Name = productDTO.Name;
            product.Price = productDTO.Price;
            product.Category = productDTO.Category;
            product.Stock = productDTO.Stock;
            product.UpdatedAt = DateTime.UtcNow;

            _context.Products.Update(product);
            await _context.SaveChangesAsync();

            return product;
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
            {
                return false;
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}