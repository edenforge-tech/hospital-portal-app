using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain;

[Table("patient_communications")]
public class PatientCommunication
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Required]
    [Column("tenant_id")]
    public Guid TenantId { get; set; }

    [Required]
    [Column("patient_id")]
    public Guid PatientId { get; set; }

    [Required]
    [Column("communication_type")]
    [MaxLength(30)]
    public string CommunicationType { get; set; } = "sms"; // sms, email, phone, in_person, portal_message

    [Required]
    [Column("direction")]
    [MaxLength(20)]
    public string Direction { get; set; } = "outbound"; // inbound, outbound

    [Column("subject")]
    [MaxLength(300)]
    public string? Subject { get; set; }

    [Column("message")]
    [MaxLength(4000)]
    public string? Message { get; set; }

    [Column("recipient")]
    [MaxLength(200)]
    public string? Recipient { get; set; }

    [Column("sender")]
    [MaxLength(200)]
    public string? Sender { get; set; }

    [Column("sent_at")]
    public DateTime? SentAt { get; set; }

    [Column("delivered_at")]
    public DateTime? DeliveredAt { get; set; }

    [Column("read_at")]
    public DateTime? ReadAt { get; set; }

    [Column("sent_by_user_id")]
    public Guid? SentByUserId { get; set; }

    [Column("priority")]
    [MaxLength(20)]
    public string Priority { get; set; } = "normal"; // low, normal, high, urgent

    [Column("category")]
    [MaxLength(50)]
    public string? Category { get; set; } // appointment_reminder, lab_result, prescription, billing, general

    [Column("notes")]
    [MaxLength(1000)]
    public string? Notes { get; set; }

    [Required]
    [Column("status")]
    [MaxLength(20)]
    public string Status { get; set; } = "sent"; // draft, sent, delivered, read, failed, bounced

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("created_by_user_id")]
    public Guid? CreatedByUserId { get; set; }

    [Column("updated_by_user_id")]
    public Guid? UpdatedByUserId { get; set; }

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    [ForeignKey("PatientId")]
    public virtual Patient? Patient { get; set; }
}
