using System;
using System.Collections.Generic;

namespace AuthService.DTOs.FollowUp
{
    public class PatientReminderDto
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = null!;
        public string ReminderType { get; set; } = null!;
        public string Message { get; set; } = null!;
        public DateTime ScheduledDate { get; set; }
        public List<string> Channels { get; set; } = new();
        public string Status { get; set; } = null!;
        public DateTime? SentDate { get; set; }
        public bool Acknowledged { get; set; }
        public DateTime? AcknowledgedDate { get; set; }
        public string? FailureReason { get; set; }
    }

    public class CreateReminderDto
    {
        public Guid PatientId { get; set; }
        public string ReminderType { get; set; } = null!;
        public string Message { get; set; } = null!;
        public DateTime ScheduledDate { get; set; }
        public List<string> Channels { get; set; } = new();
    }

    public class SendReminderDto
    {
        public Guid ReminderId { get; set; }
        public List<string> Channels { get; set; } = new();
    }

    public class ReminderFiltersDto
    {
        public string? Status { get; set; }
        public string? ReminderType { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }
}
