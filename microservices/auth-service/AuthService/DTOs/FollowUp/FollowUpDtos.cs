using System;
using System.Collections.Generic;

namespace AuthService.DTOs.FollowUp
{
    public class FollowUpAppointmentDto
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = null!;
        public string PatientMRN { get; set; } = null!;
        public string FollowUpType { get; set; } = null!;
        public string? RelatedProcedure { get; set; }
        public DateTime? ProcedureDate { get; set; }
        public DateTime ScheduledDate { get; set; }
        public string? ScheduledTime { get; set; }
        public string Status { get; set; } = null!;
        public string Priority { get; set; } = null!;
        public Guid AssignedDoctorId { get; set; }
        public string AssignedDoctorName { get; set; } = null!;
        public Guid DepartmentId { get; set; }
        public string DepartmentName { get; set; } = null!;
        public string? Notes { get; set; }
        public int RemindersSent { get; set; }
        public DateTime? LastReminderDate { get; set; }
        public DateTime? CompletedDate { get; set; }
        public string? Outcome { get; set; }
    }

    public class CreateFollowUpDto
    {
        public Guid PatientId { get; set; }
        public string FollowUpType { get; set; } = null!;
        public string? RelatedProcedure { get; set; }
        public DateTime? ProcedureDate { get; set; }
        public DateTime ScheduledDate { get; set; }
        public string? ScheduledTime { get; set; }
        public string Priority { get; set; } = "routine";
        public Guid AssignedDoctorId { get; set; }
        public Guid DepartmentId { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateFollowUpDto
    {
        public DateTime? ScheduledDate { get; set; }
        public string? ScheduledTime { get; set; }
        public string? Status { get; set; }
        public string? Priority { get; set; }
        public string? Notes { get; set; }
        public string? Outcome { get; set; }
    }

    public class FollowUpFiltersDto
    {
        public string? Status { get; set; }
        public string? Priority { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public Guid? DepartmentId { get; set; }
        public Guid? DoctorId { get; set; }
    }
}
