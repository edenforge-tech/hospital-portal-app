using System;
using System.Threading.Tasks;

namespace NotificationService.Services.Token
{
    public interface ITokenService
    {
        /// <summary>
        /// Generate encrypted activation token with 48-hour expiry
        /// </summary>
        string GenerateActivationToken(string email, string userId);

        /// <summary>
        /// Validate activation token and return user email/id/tenantId if valid
        /// </summary>
        Task<(bool IsValid, string? Email, string? UserId, string? TenantId, string? Error)> ValidateActivationTokenAsync(string token);
        
        /// <summary>
        /// Generate email verification token with 24-hour expiry
        /// </summary>
        string GenerateEmailVerificationToken(string email, string userId);
        
        /// <summary>
        /// Validate email verification token and return user email/id if valid
        /// </summary>
        Task<(bool IsValid, string? Email, string? UserId, string? Error)> ValidateEmailVerificationTokenAsync(string token);
    }
}
