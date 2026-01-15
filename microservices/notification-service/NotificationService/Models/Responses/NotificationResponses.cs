namespace NotificationService.Models.Responses;

public class SendOtpResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public Guid? OtpId { get; set; }
    public string? Otp { get; set; }  // The actual OTP code for admin to share
    public DateTime? ExpiresAt { get; set; }
    public string? DeliveryMethod { get; set; }
    public string? MaskedRecipient { get; set; }
}

public class VerifyOtpResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public Guid? UserId { get; set; }
    public bool RequirePasswordSetup { get; set; }
    public string? TempToken { get; set; }
    public int? AttemptsRemaining { get; set; }
}

public class EnrollTotpResponse
{
    public bool Success { get; set; }
    public string Secret { get; set; } = string.Empty;
    public string QrCodeUrl { get; set; } = string.Empty;
    public string QrCodeDataUrl { get; set; } = string.Empty; // Alias for frontend compatibility
    public List<string> BackupCodes { get; set; } = new();
}

public class VerifyMfaResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Token { get; set; }
    public string? RefreshToken { get; set; }
    public int? AttemptsRemaining { get; set; }
}

public class BackupCodesResponse
{
    public bool Success { get; set; }
    public List<string> Codes { get; set; } = new();
    public DateTime GeneratedAt { get; set; }
    public string Message { get; set; } = string.Empty;
}
