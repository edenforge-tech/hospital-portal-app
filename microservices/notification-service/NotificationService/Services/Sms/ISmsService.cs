namespace NotificationService.Services.Sms;

public interface ISmsService
{
    Task<(bool Success, string? MessageId, string? Error)> SendActivationOtpAsync(
        string toPhoneNumber,
        string otpCode,
        int expiryHours);

    Task<(bool Success, string? MessageId, string? Error)> SendMfaLoginOtpAsync(
        string toPhoneNumber,
        string otpCode,
        int expiryMinutes);
}
