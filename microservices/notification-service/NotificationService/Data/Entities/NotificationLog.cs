using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NotificationService.Data.Entities;

[Table("notification_logs")]
public class NotificationLog
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("user_id")]
    public Guid? UserId { get; set; }

    [Column("tenant_id")]
    public Guid? TenantId { get; set; }

    [Column("otp_activation_id")]
    public Guid? OtpActivationId { get; set; }

    [Required]
    [Column("notification_type")]
    [MaxLength(20)]
    public string NotificationType { get; set; } = string.Empty; // 'email', 'sms'

    [Required]
    [Column("recipient")]
    [MaxLength(255)]
    public string Recipient { get; set; } = string.Empty;

    [Column("purpose")]
    [MaxLength(50)]
    public string? Purpose { get; set; }

    [Column("subject")]
    [MaxLength(500)]
    public string? Subject { get; set; }

    [Column("body")]
    public string? Body { get; set; }

    [Column("provider")]
    [MaxLength(50)]
    public string? Provider { get; set; } // 'resend', 'twilio'

    [Column("provider_message_id")]
    [MaxLength(255)]
    public string? ProviderMessageId { get; set; }

    [Required]
    [Column("status")]
    [MaxLength(20)]
    public string Status { get; set; } = "queued"; // 'queued', 'sent', 'delivered', 'failed', 'bounced'

    [Column("error_message")]
    public string? ErrorMessage { get; set; }

    [Column("cost_usd", TypeName = "decimal(10,6)")]
    public decimal? CostUsd { get; set; }

    [Column("sent_at")]
    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    [Column("delivered_at")]
    public DateTime? DeliveredAt { get; set; }
}
