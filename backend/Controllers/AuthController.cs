using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
        {
            var response = await _authService.RegisterAsync(request);

            if (response == null)
            {
                return BadRequest(new { message = "Email is already in use" });
            }

            return Ok(response);
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            var response = await _authService.LoginAsync(request);

            if (response == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            return Ok(response);
        }

        [HttpGet("user-info")]
        public async Task<ActionResult<UserDto>> GetUserInfo()
        {
            var userEmail = User.Identity?.Name;
            if (string.IsNullOrEmpty(userEmail))
            {
                return Unauthorized(new { message = "User is not authenticated" });
            }

            var user = await _authService.GetUserByEmailAsync(userEmail);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(user);
        }
        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            var userEmail = User.Identity?.Name;
            if (string.IsNullOrEmpty(userEmail))
            {
                return Unauthorized(new { message = "User is not authenticated" });
            }

            var user = await _authService.GetUserByEmailAsync(userEmail);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(user);
        }
    }
}
