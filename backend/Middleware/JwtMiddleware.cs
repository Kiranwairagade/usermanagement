
// JwtMiddleware.cs (Fixed async warning)
using backend.Services; 
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

public class JwtMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IConfiguration _configuration;

    public JwtMiddleware(RequestDelegate next, IConfiguration configuration)
    {
        _next = next;
        _configuration = configuration;
    }

    public async Task Invoke(HttpContext context, IAuthService authService)
    {
        var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

        if (!string.IsNullOrEmpty(token))
            await AttachUserToContext(context, authService, token);

        await _next(context);
    }

    private async Task AttachUserToContext(HttpContext context, IAuthService authService, string token)
    {
        await Task.Run(() =>
        {
            try
            {
                var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? "");
                var tokenHandler = new JwtSecurityTokenHandler();

                var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                }, out _);

                var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var emailClaim = principal.FindFirst(ClaimTypes.Email)?.Value;

                if (!string.IsNullOrEmpty(emailClaim))
                {
                    var claims = new List<Claim>(principal.Claims)
                {
                    new Claim(ClaimTypes.Name, emailClaim)
                };

                    context.User = new ClaimsPrincipal(new ClaimsIdentity(claims, "jwt"));
                }
            }
            catch (Exception)
            {
                // Optional: Log exception
            }
        });
    }
}