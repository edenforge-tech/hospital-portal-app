using AuthService.Models;
using AuthService.Models.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace AuthService.Services
{
    public interface IPasswordPolicyService
    {
        PasswordValidationResult ValidatePassword(string password);
        Task<bool> IsPasswordReusedAsync(AppUser user, string newPassword);
        bool IsPasswordExpired(AppUser user);
    }

    public class PasswordPolicyService : IPasswordPolicyService
    {
        private readonly IConfiguration _configuration;

        public PasswordPolicyService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public PasswordValidationResult ValidatePassword(string password)
        {
            var result = new PasswordValidationResult();

            if (string.IsNullOrWhiteSpace(password))
            {
                result.IsValid = false;
                result.Errors.Add("Password cannot be empty");
                return result;
            }

            // Minimum length
            int minLength = int.Parse(_configuration["PasswordPolicy:MinimumLength"] ?? "12");
            if (password.Length < minLength)
            {
                result.Errors.Add($"Password must be at least {minLength} characters long");
            }

            // Uppercase
            if (!Regex.IsMatch(password, @"[A-Z]"))
            {
                result.Errors.Add("Password must contain at least one uppercase letter (A-Z)");
            }

            // Lowercase
            if (!Regex.IsMatch(password, @"[a-z]"))
            {
                result.Errors.Add("Password must contain at least one lowercase letter (a-z)");
            }

            // Digit
            if (!Regex.IsMatch(password, @"[0-9]"))
            {
                result.Errors.Add("Password must contain at least one digit (0-9)");
            }

            // Special character
            if (!Regex.IsMatch(password, @"[!@#$%^&*\-_+=\[\]{};:'"",.<>?/\\|`~]"))
            {
                result.Errors.Add("Password must contain at least one special character (!@#$%^&*-_+=)");
            }

            result.IsValid = result.Errors.Count == 0;
            return result;
        }

        public async Task<bool> IsPasswordReusedAsync(AppUser user, string newPassword)
        {
            // Implementation would check password history
            // For now, return false (no reuse check)
            return await Task.FromResult(false);
        }

        public bool IsPasswordExpired(AppUser user)
        {
            if (user.PasswordExpiresAt == null) return false;
            return DateTime.UtcNow > user.PasswordExpiresAt;
        }
    }

    public class PasswordValidationResult
    {
        public bool IsValid { get; set; } = true;
        public List<string> Errors { get; set; } = new List<string>();
    }
}