namespace NotificationService.Models.Requests;

public class EnrollTotpRequest
{
    public Guid UserId { get; set; }
}

public class VerifyEnrollmentRequest
{
    public Guid UserId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Method { get; set; } = "totp"; // 'totp', 'sms', 'email'
}

public class SendMfaLoginOtpRequest
{
    public Guid UserId { get; set; }
    public string Method { get; set; } = string.Empty; // 'sms' or 'email'
}

public class VerifyMfaLoginRequest
{
    public Guid UserId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Method { get; set; } = string.Empty; // 'totp', 'sms', 'email', 'backup_code'
}

public class DisableMfaRequest
{
    public Guid UserId { get; set; }
    public string Password { get; set; } = string.Empty;
    public string CurrentCode { get; set; } = string.Empty;
}

public class RegenerateBackupCodesRequest
{
    public Guid UserId { get; set; }
    public Guid AdminUserId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string AdminMfaCode { get; set; } = string.Empty;
}
