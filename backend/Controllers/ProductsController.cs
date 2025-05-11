using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Services;
using Microsoft.Extensions.Logging;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly ILogger<ProductsController> _logger;

        public ProductsController(IProductService productService, ILogger<ProductsController> logger)
        {
            _productService = productService;
            _logger = logger;
        }

        // GET: api/products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductDTO>>> GetProducts()
        {
            try
            {
                _logger.LogInformation("Getting all products");
                var products = await _productService.GetAllProductsAsync();
                var productDtos = products.Select(p => new ProductDTO
                {
                    ProductId = p.ProductId,
                    Name = p.Name,
                    Price = p.Price,
                    Category = p.Category,
                    Stock = p.Stock
                }).ToList();

                _logger.LogInformation($"Returning {productDtos.Count} products");
                // Make sure we return the array directly
                return Ok(productDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting all products");
                return StatusCode(500, new { error = "Internal server error", message = ex.Message });
            }
        }

        // GET: api/products/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDTO>> GetProduct(int id)
        {
            try
            {
                _logger.LogInformation($"Getting product with ID {id}");
                var product = await _productService.GetProductByIdAsync(id);

                var productDto = new ProductDTO
                {
                    ProductId = product.ProductId,
                    Name = product.Name,
                    Price = product.Price,
                    Category = product.Category,
                    Stock = product.Stock
                };

                return Ok(productDto);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogInformation(ex.Message);
                return NotFound(new { error = "Not Found", message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error occurred while getting product with ID {id}");
                return StatusCode(500, new { error = "Internal server error", message = ex.Message });
            }
        }

        // POST: api/products
        [HttpPost]
        public async Task<ActionResult<ProductDTO>> CreateProduct(CreateProductDTO productDto)
        {
            try
            {
                _logger.LogInformation("Creating new product");

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdProduct = await _productService.CreateProductAsync(productDto);

                var createdProductDto = new ProductDTO
                {
                    ProductId = createdProduct.ProductId,
                    Name = createdProduct.Name,
                    Price = createdProduct.Price,
                    Category = createdProduct.Category,
                    Stock = createdProduct.Stock
                };

                _logger.LogInformation($"Product created with ID {createdProduct.ProductId}");
                return CreatedAtAction(nameof(GetProduct), new { id = createdProduct.ProductId }, createdProductDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating a product");
                return StatusCode(500, new { error = "Internal server error", message = ex.Message });
            }
        }

        // PUT: api/products/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, UpdateProductDTO productDto)
        {
            try
            {
                _logger.LogInformation($"Updating product with ID {id}");

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedProduct = await _productService.UpdateProductAsync(id, productDto);

                var updatedProductDto = new ProductDTO
                {
                    ProductId = updatedProduct.ProductId,
                    Name = updatedProduct.Name,
                    Price = updatedProduct.Price,
                    Category = updatedProduct.Category,
                    Stock = updatedProduct.Stock
                };

                _logger.LogInformation($"Product updated with ID {id}");
                return Ok(updatedProductDto);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogInformation(ex.Message);
                return NotFound(new { error = "Not Found", message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error occurred while updating product with ID {id}");
                return StatusCode(500, new { error = "Internal server error", message = ex.Message });
            }
        }

        // DELETE: api/products/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                _logger.LogInformation($"Deleting product with ID {id}");
                var result = await _productService.DeleteProductAsync(id);

                if (!result)
                {
                    _logger.LogInformation($"Product with ID {id} not found for deletion");
                    return NotFound(new { error = "Not Found", message = $"Product with ID {id} not found." });
                }

                _logger.LogInformation($"Product with ID {id} deleted successfully");
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error occurred while deleting product with ID {id}");
                return StatusCode(500, new { error = "Internal server error", message = ex.Message });
            }
        }
    }
}