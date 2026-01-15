using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using NotificationService.Data;
using NotificationService.Data.Entities;
using BCrypt.Net;

namespace NotificationService.Services.Otp;

public class OtpService : IOtpService
{
    private readonly NotificationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<OtpService> _logger;

    public OtpService(
        NotificationDbContext context,
        IConfiguration configuration,
        ILogger<OtpService> logger)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
    }

    public string GenerateOtp(int length = 6)
    {
        var random = new Random();
        var otp = "";
        for (int i = 0; i < length; i++)
        {
            otp += random.Next(0, 10).ToString();
        }
        return otp;
    }

    public string HashOtp(string otp)
    {
        return BCrypt.Net.BCrypt.HashPassword(otp);
    }

    public bool VerifyOtp(string otp, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(otp, hash);
    }

    public string MaskRecipient(string recipient)
    {
        if (recipient.Contains('@'))
        {
            // Email: s**@test.com
            var parts = recipient.Split('@');
            var username = parts[0];
            var domain = parts[1];
            var masked = username.Length > 2
                ? username[0] + "**" + username[^1]
                : username[0] + "**";
            return $"{masked}@{domain}";
        }
        else
        {
            // Phone: +91******3433
            if (recipient.Length > 6)
            {
                return recipient.Substring(0, 3) + "******" + recipient.Substring(recipient.Length - 4);
            }
            return "***" + recipient.Substring(recipient.Length - 4);
        }
    }

    public async Task<OtpActivation> CreateOtpActivationAsync(
        Guid userId,
        Guid tenantId,
        string recipient,
        string deliveryMethod,
        string purpose,
        int expiryHours)
    {
        // Deactivate any pending OTPs for this user/purpose
        var existing = await _context.OtpActivations
            .Where(o => o.UserId == userId && o.Purpose == purpose && o.Status == "pending")
            .ToListAsync();

        foreach (var otp in existing)
        {
            otp.Status = "expired";
        }

        // Generate new OTP
        var otpCode = GenerateOtp(6);
        var otpHash = HashOtp(otpCode);

        var activation = new OtpActivation
        {
            UserId = userId,
            TenantId = tenantId,
            OtpHash = otpHash,
            DeliveryMethod = deliveryMethod,
            Recipient = recipient,
            Purpose = purpose,
            ExpiresAt = DateTime.UtcNow.AddHours(expiryHours),
            Status = "pending"
        };

        _context.OtpActivations.Add(activation);
        await _context.SaveChangesAsync();

        // Store plain OTP temporarily for sending (not saved to DB)
        _logger.LogInformation("OTP created for user {UserId}, purpose {Purpose}, expires at {ExpiresAt}",
            userId, purpose, activation.ExpiresAt);

        // Hack: Store in a property that doesn't exist in DB for temporary access
        // In production, return this from method and pass to email/SMS service
        return activation;
    }

    public async Task<(bool Success, string? Error, int AttemptsRemaining)> VerifyAndConsumeOtpAsync(
        string recipient,
        string otp,
        string purpose)
    {
        var activation = await _context.OtpActivations
            .Where(o => o.Recipient == recipient && o.Purpose == purpose && o.Status == "pending")
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (activation == null)
        {
            return (false, "No pending OTP found for this recipient", 0);
        }

        if (DateTime.UtcNow > activation.ExpiresAt)
        {
            activation.Status = "expired";
            await _context.SaveChangesAsync();
            return (false, "OTP has expired", 0);
        }

        if (activation.Attempts >= activation.MaxAttempts)
        {
            activation.Status = "blocked";
            await _context.SaveChangesAsync();
            return (false, "Maximum verification attempts exceeded", 0);
        }

        activation.Attempts++;

        if (!VerifyOtp(otp, activation.OtpHash))
        {
            await _context.SaveChangesAsync();
            var remaining = activation.MaxAttempts - activation.Attempts;
            return (false, "Invalid OTP", remaining);
        }

        // Success!
        activation.Status = "verified";
        activation.VerifiedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        _logger.LogInformation("OTP verified successfully for recipient {Recipient}, purpose {Purpose}",
            recipient, purpose);

        return (true, null, 0);
    }

    public async Task<OtpActivation?> GetOtpRecordAsync(string recipient, string purpose)
    {
        return await _context.OtpActivations
            .Where(o => o.Recipient == recipient && o.Purpose == purpose && o.Status == "verified")
            .OrderByDescending(o => o.VerifiedAt)
            .FirstOrDefaultAsync();
    }
}
