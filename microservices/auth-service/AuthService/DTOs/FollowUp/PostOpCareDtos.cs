using System;
using System.Collections.Generic;

namespace AuthService.DTOs.FollowUp
{
    public class PostOpCareDto
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = null!;
        public string SurgeryType { get; set; } = null!;
        public DateTime SurgeryDate { get; set; }
        public string SurgeryEye { get; set; } = null!;
        public string SurgeonName { get; set; } = null!;
        public List<PostOpVisitDto> CareSchedule { get; set; } = new();
        public List<PostOpMedicationDto> Medications { get; set; } = new();
        public List<string> Instructions { get; set; } = new();
        public List<string> Restrictions { get; set; } = new();
    }

    public class PostOpVisitDto
    {
        public Guid Id { get; set; }
        public string VisitName { get; set; } = null!;
        public DateTime ScheduledDate { get; set; }
        public bool Completed { get; set; }
        public DateTime? CompletedDate { get; set; }
        public string? Findings { get; set; }
        public string? VisualAcuity { get; set; }
        public decimal? IOP { get; set; }
        public string? Complications { get; set; }
    }

    public class PostOpMedicationDto
    {
        public Guid Id { get; set; }
        public string MedicationName { get; set; } = null!;
        public string Dosage { get; set; } = null!;
        public string Frequency { get; set; } = null!;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Adherence { get; set; } = "unknown";
        public DateTime? LastRefillDate { get; set; }
    }

    public class CompleteVisitDto
    {
        public string? Findings { get; set; }
        public string? VisualAcuity { get; set; }
        public decimal? IOP { get; set; }
        public string? Complications { get; set; }
    }

    public class UpdateMedicationAdherenceDto
    {
        public Guid MedicationId { get; set; }
        public string Adherence { get; set; } = null!;
        public DateTime? LastRefillDate { get; set; }
    }

    /// <summary>
    /// Counselor read-only view of a completed surgery + linked post-op care data.
    /// </summary>
    public class CounselorPostOpViewDto
    {
        // From OT schedule
        public Guid OtScheduleId { get; set; }
        public string? ScheduleNumber { get; set; }

        // Patient
        public Guid? PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string? PatientPhone { get; set; }
        public string? Mrn { get; set; }

        // Surgery
        public string SurgeryType { get; set; } = string.Empty;
        public string? EyeOperated { get; set; }
        public DateTime SurgeryDate { get; set; }
        public DateTime? SurgeryCompletedAt { get; set; }
        public string? Outcome { get; set; }
        public string? Complications { get; set; }
        public string SurgeonName { get; set; } = string.Empty;

        // Computed
        public int DaysSinceSurgery { get; set; }

        // Post-op care (may be empty if not yet created)
        public bool HasPostOpCare { get; set; }
        public Guid? PostOpScheduleId { get; set; }
        public List<PostOpVisitDto> Visits { get; set; } = new();
        public List<PostOpMedicationDto> Medications { get; set; } = new();
        public List<string> Instructions { get; set; } = new();
        public List<string> Restrictions { get; set; } = new();
    }

    public class SendPostOpInstructionsRequest
    {
        /// <summary>Patient phone number (E.164 format preferred, e.g. +919999999999).</summary>
        public string PatientPhone { get; set; } = string.Empty;
        /// <summary>Optional message body override; if null, built from post-op instructions list.</summary>
        public string? CustomMessage { get; set; }
    }
}
