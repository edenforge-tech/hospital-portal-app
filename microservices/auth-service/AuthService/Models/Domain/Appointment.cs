using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AuthService.Models.Identity;

namespace AuthService.Models.Domain;

[Table("appointments")]
public class Appointment
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("tenant_id")]
    public required Guid TenantId { get; set; }

    [Column("patient_id")]
    public required Guid PatientId { get; set; }

    [Column("doctor_id")]
    public required Guid DoctorId { get; set; }

    [Column("appointment_date")]
    public required DateTime AppointmentDate { get; set; }

    [Column("appointment_type")]
    [StringLength(50)]
    public required string AppointmentType { get; set; }

    [Column("duration_minutes")]
    public required int DurationMinutes { get; set; }

    [Column("status")]
    [StringLength(20)]
    public required string Status { get; set; } // Scheduled, Confirmed, Cancelled, Completed

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("cancellation_reason")]
    public string? CancellationReason { get; set; }

    [Column("reminder_sent")]
    public bool ReminderSent { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    // Navigation properties
    public virtual Patient? Patient { get; set; }
    public virtual AppUser? Doctor { get; set; }
}