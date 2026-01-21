namespace NotificationService.Services.Email;

public interface IEmailService
{
    Task<(bool Success, string? MessageId, string? Error)> SendActivationOtpAsync(
        string toEmail,
        string userName,
        string otpCode,
            int expiryHours,
            string userId);

    Task<(bool Success, string? MessageId, string? Error)> SendMfaLoginOtpAsync(
        string toEmail,
        string userName,
        string otpCode,
        int expiryMinutes);

    Task<(bool Success, string? MessageId, string? Error)> SendMfaResetNotificationAsync(
        string toEmail,
        string userName,
        string resetByAdmin,
        DateTime resetAt);
}
