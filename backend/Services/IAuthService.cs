using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<UserDto?> GetUserByIdAsync(int userId);
        Task<UserDto?> GetUserByEmailAsync(string email);
    }
}
