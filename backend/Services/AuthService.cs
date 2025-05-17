using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            if (string.IsNullOrWhiteSpace(request.Email))
                throw new ArgumentException("Email cannot be empty.");

            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                throw new InvalidOperationException("Email is already registered.");

            var user = new User
            {
                FirstName = request.FirstName ?? throw new ArgumentNullException(nameof(request.FirstName)),
                LastName = request.LastName ?? throw new ArgumentNullException(nameof(request.LastName)),
                Email = request.Email,
                PasswordHash = HashPassword(request.Password ?? throw new ArgumentNullException(nameof(request.Password))),
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            try
            {
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while saving user to the database.", ex);
            }

            var token = GenerateJwtToken(user);

            return new AuthResponse
            {
                UserId = user.UserId,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName
            };
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Email))
                throw new ArgumentException("Invalid login request.");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive);

            if (user == null || !VerifyPasswordHash(request.Password ?? "", user.PasswordHash))
                throw new UnauthorizedAccessException("Invalid email or password.");

            var token = GenerateJwtToken(user);

            return new AuthResponse
            {
                UserId = user.UserId,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Token = token  
            };
        }
        public async Task<UserDto?> GetUserByIdAsync(int userId)
{
    var user = await _context.Users
        .Include(u => u.Role) // Include Role if you have navigation property
        .FirstOrDefaultAsync(u => u.UserId == userId);

    if (user == null)
        return null;

    // Load or generate user permissions here if needed
    var permissions = new List<string>();

    return new UserDto(
        user.UserId,
        user.Username ?? string.Empty,
        user.Email ?? string.Empty,
        user.FirstName ?? string.Empty,
        user.LastName ?? string.Empty,
        user.IsActive,
        user.RoleId, // Add RoleId
        user.Role?.RoleName, // Add RoleName
        permissions,
        user.CreatedAt,
        user.UpdatedAt
    );
}
        public async Task<UserDto?> GetUserByEmailAsync(string email)
{
    if (string.IsNullOrWhiteSpace(email))
        return null;

    var user = await _context.Users
        .Include(u => u.Role) // Include Role if you have navigation property
        .FirstOrDefaultAsync(u => u.Email == email);
    
    if (user == null)
        return null;

    var permissions = new List<string>();
    return new UserDto(
        user.UserId,
        user.Username ?? string.Empty,
        user.Email ?? string.Empty,
        user.FirstName ?? string.Empty,
        user.LastName ?? string.Empty,
        user.IsActive,
        user.RoleId, // Add RoleId
        user.Role?.RoleName, // Add RoleName
        permissions,
        user.CreatedAt,
        user.UpdatedAt
    );
}

        private string GenerateJwtToken(User user)
        {
            var jwtKey = _configuration["Jwt:Key"];
            if (string.IsNullOrWhiteSpace(jwtKey))
                throw new InvalidOperationException("JWT key is not configured in app settings.");

            var key = Encoding.ASCII.GetBytes(jwtKey);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email ?? ""),
                new Claim(ClaimTypes.GivenName, user.FirstName ?? ""),
                new Claim(ClaimTypes.Surname, user.LastName ?? "")
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        private bool VerifyPasswordHash(string password, string storedHash)
        {
            return BCrypt.Net.BCrypt.Verify(password, storedHash);
        }
    }
}
