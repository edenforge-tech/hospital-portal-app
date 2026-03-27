using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Models.Domain.Dtos;

public class CreateExaminationRequest
{
    [Required]
    public Guid PatientId { get; set; }

    [Required]
    [StringLength(500)]
    public string ChiefComplaint { get; set; } = null!;

    public string? ExaminationNotes { get; set; }

    [StringLength(500)]
    public string? Diagnosis { get; set; }

    public string? TreatmentPlan { get; set; }

    public string? Prescription { get; set; }

    public DateTime? FollowUpDate { get; set; }
}

public class UpdateExaminationRequest : CreateExaminationRequest
{
    [Required]
    public Guid Id { get; set; }
}

public class ExaminationResponse
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string PatientName { get; set; } = null!;
    public DateTime ExaminationDate { get; set; }
    public string ChiefComplaint { get; set; } = null!;
    public string? ExaminationNotes { get; set; }
    public string? Diagnosis { get; set; }
    public string? TreatmentPlan { get; set; }
    public string? Prescription { get; set; }
    public DateTime? FollowUpDate { get; set; }
    public string ExaminingDoctorName { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class FinalizeExaminationRequest
{
    [Required]
    [StringLength(6, MinimumLength = 4)]
    public string Pin { get; set; } = null!;

    public DateTime? FollowUpDate { get; set; }

    public string? FollowUpReason { get; set; }
}

public class FinalizeExaminationResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = null!;
    public string DigitalSignature { get; set; } = null!;
    public DateTime SignedAt { get; set; }
    public Guid? FollowUpAppointmentId { get; set; }
}