using AuthService.Models;
using AuthService.Models.Identity;
using System.Collections.Generic;
using System.Security.Claims;

namespace AuthService.Services
{
    public interface IJwtService
    {
        string GenerateToken(AppUser user, List<string> roles, List<string> permissions);
        string GenerateRefreshToken();
        bool ValidateToken(string token);
        ClaimsPrincipal GetPrincipalFromToken(string token);
    }
}