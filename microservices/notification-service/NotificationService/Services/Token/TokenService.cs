using System;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using NotificationService.Data;
using Microsoft.EntityFrameworkCore;

namespace NotificationService.Services.Token
{
    public class TokenService : ITokenService
    {
        private readonly ILogger<TokenService> _logger;
        private readonly NotificationDbContext _context;
        private const string EncryptionKey = "HOSPITAL_PORTAL_ACTIVATION_TOKEN_KEY_2026"; // 32 bytes for AES-256
        private const int TokenExpiryHours = 48; // For activation tokens
        private const int EmailVerificationExpiryHours = 24; // For email verification

        public TokenService(
            ILogger<TokenService> logger,
            NotificationDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        public string GenerateActivationToken(string email, string userId)
        {
            try
            {
                var tokenData = new ActivationTokenData
                {
                    Email = email,
                    UserId = userId,
                    ExpiresAt = DateTime.UtcNow.AddHours(TokenExpiryHours),
                    Nonce = Guid.NewGuid().ToString()
                };

                var json = JsonSerializer.Serialize(tokenData);
                var encrypted = Encrypt(json);
                var base64 = Convert.ToBase64String(encrypted)
                    .Replace("+", "-")
                    .Replace("/", "_")
                    .Replace("=", ""); // URL-safe

                _logger.LogInformation(
                    "Generated activation token for email {Email}, expires at {ExpiresAt}",
                    email,
                    tokenData.ExpiresAt
                );

                return base64;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating activation token for {Email}", email);
                throw;
            }
        }

        public async Task<(bool IsValid, string? Email, string? UserId, string? TenantId, string? Error)> ValidateActivationTokenAsync(string token)
        {
            try
            {
                // Restore padding
                var base64 = token.Replace("-", "+").Replace("_", "/");
                var padding = (4 - (base64.Length % 4)) % 4;
                base64 += new string('=', padding);

                var encrypted = Convert.FromBase64String(base64);
                var json = Decrypt(encrypted);
                var tokenData = JsonSerializer.Deserialize<ActivationTokenData>(json);

                if (tokenData == null)
                {
                    return (false, null, null, null, "Invalid token format");
                }

                // Check expiry
                if (DateTime.UtcNow > tokenData.ExpiresAt)
                {
                    _logger.LogWarning(
                        "Activation token expired for {Email}. Expired at {ExpiresAt}",
                        tokenData.Email,
                        tokenData.ExpiresAt
                    );
                    return (false, null, null, null, "Activation link has expired. Please request a new activation email.");
                }

                // Verify OTP exists and is not expired
                var otpRecord = await _context.OtpActivations
                    .Where(o => o.Recipient == tokenData.Email && o.Purpose == "user_activation")
                    .OrderByDescending(o => o.CreatedAt)
                    .FirstOrDefaultAsync();

                if (otpRecord == null)
                {
                    return (false, null, null, null, "No activation request found. Please contact administrator.");
                }

                if (otpRecord.ExpiresAt < DateTime.UtcNow)
                {
                    return (false, null, null, null, "Activation expired. Please request a new activation email.");
                }

                // Get tenant_id from the OTP record
                var tenantId = otpRecord.TenantId.ToString();

                _logger.LogInformation(
                    "Validated activation token for {Email}, UserId: {UserId}, TenantId: {TenantId}, expires at {ExpiresAt}",
                    tokenData.Email,
                    tokenData.UserId,
                    tenantId,
                    tokenData.ExpiresAt
                );

                return (true, tokenData.Email, tokenData.UserId, tenantId, null);
            }
            catch (FormatException)
            {
                _logger.LogWarning("Invalid token format received");
                return (false, null, null, null, "Invalid activation link");
            }
            catch (CryptographicException)
            {
                _logger.LogWarning("Token decryption failed - tampered or corrupted");
                return (false, null, null, null, "Invalid activation link");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating activation token");
                return (false, null, null, null, "Error validating activation link");
            }
        }

        private byte[] Encrypt(string plainText)
        {
            using var aes = Aes.Create();
            aes.Key = Encoding.UTF8.GetBytes(EncryptionKey.Substring(0, 32)); // 256-bit key
            aes.GenerateIV();

            using var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
            using var ms = new System.IO.MemoryStream();
            
            // Prepend IV to encrypted data
            ms.Write(aes.IV, 0, aes.IV.Length);
            
            using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
            using (var sw = new System.IO.StreamWriter(cs))
            {
                sw.Write(plainText);
            }

            return ms.ToArray();
        }

        private string Decrypt(byte[] cipherText)
        {
            using var aes = Aes.Create();
            aes.Key = Encoding.UTF8.GetBytes(EncryptionKey.Substring(0, 32));

            // Extract IV from beginning of cipherText
            var iv = new byte[aes.IV.Length];
            Array.Copy(cipherText, 0, iv, 0, iv.Length);
            aes.IV = iv;

            using var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
            using var ms = new System.IO.MemoryStream(cipherText, iv.Length, cipherText.Length - iv.Length);
            using var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read);
            using var sr = new System.IO.StreamReader(cs);
            
            return sr.ReadToEnd();
        }

        public string GenerateEmailVerificationToken(string email, string userId)
        {
            try
            {
                var tokenData = new EmailVerificationTokenData
                {
                    Email = email,
                    UserId = userId,
                    ExpiresAt = DateTime.UtcNow.AddHours(EmailVerificationExpiryHours),
                    Nonce = Guid.NewGuid().ToString()
                };

                var json = JsonSerializer.Serialize(tokenData);
                var encrypted = Encrypt(json);
                var base64 = Convert.ToBase64String(encrypted)
                    .Replace("+", "-")
                    .Replace("/", "_")
                    .Replace("=", ""); // URL-safe

                _logger.LogInformation(
                    "Generated email verification token for {Email}, expires at {ExpiresAt}",
                    email,
                    tokenData.ExpiresAt
                );

                return base64;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating email verification token for {Email}", email);
                throw;
            }
        }

        public async Task<(bool IsValid, string? Email, string? UserId, string? Error)> ValidateEmailVerificationTokenAsync(string token)
        {
            try
            {
                // Restore padding
                var base64 = token.Replace("-", "+").Replace("_", "/");
                var padding = (4 - (base64.Length % 4)) % 4;
                base64 += new string('=', padding);

                var encrypted = Convert.FromBase64String(base64);
                var json = Decrypt(encrypted);
                var tokenData = JsonSerializer.Deserialize<EmailVerificationTokenData>(json);

                if (tokenData == null)
                {
                    return (false, null, null, "Invalid token format");
                }

                // Check expiry
                if (DateTime.UtcNow > tokenData.ExpiresAt)
                {
                    _logger.LogWarning(
                        "Email verification token expired for {Email}. Expired at {ExpiresAt}",
                        tokenData.Email,
                        tokenData.ExpiresAt
                    );
                    return (false, null, null, "Email verification link has expired. Please request a new verification email.");
                }

                _logger.LogInformation(
                    "Validated email verification token for {Email}",
                    tokenData.Email
                );

                return (true, tokenData.Email, tokenData.UserId, null);
            }
            catch (FormatException)
            {
                _logger.LogWarning("Invalid email verification token format received");
                return (false, null, null, "Invalid verification link");
            }
            catch (CryptographicException)
            {
                _logger.LogWarning("Email verification token decryption failed - tampered or corrupted");
                return (false, null, null, "Invalid verification link");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating email verification token");
                return (false, null, null, "Error validating verification link");
            }
        }

        private class ActivationTokenData
        {
            public string Email { get; set; } = string.Empty;
            public string UserId { get; set; } = string.Empty;
            public DateTime ExpiresAt { get; set; }
            public string Nonce { get; set; } = string.Empty; // Prevent replay attacks
        }

        private class EmailVerificationTokenData
        {
            public string Email { get; set; } = string.Empty;
            public string UserId { get; set; } = string.Empty;
            public DateTime ExpiresAt { get; set; }
            public string Nonce { get; set; } = string.Empty;
        }
    }
}
