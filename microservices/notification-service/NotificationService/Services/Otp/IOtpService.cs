using NotificationService.Data.Entities;

namespace NotificationService.Services.Otp;

public interface IOtpService
{
    string GenerateOtp(int length = 6);
    string HashOtp(string otp);
    bool VerifyOtp(string otp, string hash);
    string MaskRecipient(string recipient);
    Task<OtpActivation> CreateOtpActivationAsync(Guid userId, Guid tenantId, string recipient, string deliveryMethod, string purpose, int expiryHours);
    Task<(bool Success, string? Error, int AttemptsRemaining)> VerifyAndConsumeOtpAsync(string recipient, string otp, string purpose);
    Task<OtpActivation?> GetOtpRecordAsync(string recipient, string purpose);
}
