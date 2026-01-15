namespace NotificationService.Models.Requests;

public class SendActivationOtpRequest
{
    public Guid UserId { get; set; }
    public Guid TenantId { get; set; } // Added for multi-tenancy
    public string DeliveryMethod { get; set; } = string.Empty; // "email" or "sms"
    public string Recipient { get; set; } = string.Empty; // email or phone number
}

public class VerifyOtpRequest
{
    public string Recipient { get; set; } = string.Empty; // email or phone
    public string Otp { get; set; } = string.Empty;
}

public class ResendOtpRequest
{
    public Guid UserId { get; set; }
    public string? DeliveryMethod { get; set; } // Optional: switch from email to sms
}
