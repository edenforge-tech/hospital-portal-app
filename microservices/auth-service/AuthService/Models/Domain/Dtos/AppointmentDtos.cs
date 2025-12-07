using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Models.Domain.Dtos;

public class CreateAppointmentRequest
{
    [Required]
    public Guid PatientId { get; set; }

    [Required]
    public Guid DoctorId { get; set; }

    [Required]
    public DateTime AppointmentDate { get; set; }

    [Required]
    [StringLength(50)]
    public string AppointmentType { get; set; } = null!;

    [Required]
    [Range(15, 480)] // 15 minutes to 8 hours
    public int DurationMinutes { get; set; }

    public string? Notes { get; set; }
}

public class UpdateAppointmentRequest
{
    [Required]
    public Guid Id { get; set; }

    [Required]
    public DateTime AppointmentDate { get; set; }

    [Required]
    [StringLength(50)]
    public string AppointmentType { get; set; } = null!;

    [Required]
    [Range(15, 480)]
    public int DurationMinutes { get; set; }

    public string? Notes { get; set; }
}

public class CancelAppointmentRequest
{
    [Required]
    public string CancellationReason { get; set; } = null!;
}

public class AppointmentResponse
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string PatientName { get; set; } = null!;
    public Guid DoctorId { get; set; }
    public string DoctorName { get; set; } = null!;
    public DateTime AppointmentDate { get; set; }
    public string AppointmentType { get; set; } = null!;
    public int DurationMinutes { get; set; }
    public string Status { get; set; } = null!;
    public string? Notes { get; set; }
    public string? CancellationReason { get; set; }
    public bool ReminderSent { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}