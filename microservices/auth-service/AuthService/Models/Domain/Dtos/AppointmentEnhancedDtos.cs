using System;
using System.Collections.Generic;

namespace AuthService.Models.Domain.Dtos
{
    // ================= Conflict Detection =================
    
    public class ConflictCheckRequest
    {
        public Guid? AppointmentId { get; set; } // Null for new appointments
        public Guid DoctorId { get; set; }
        public Guid? PatientId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public int DurationMinutes { get; set; }
    }

    public class ConflictCheckResponse
    {
        public bool HasConflicts { get; set; }
        public List<AppointmentConflictDto> Conflicts { get; set; } = new();
        public List<TimeSlotDto> SuggestedAlternatives { get; set; } = new();
    }

    public class AppointmentConflictDto
    {
        public string ConflictType { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public Guid? ConflictingAppointmentId { get; set; }
        public DateTime? ConflictingAppointmentDate { get; set; }
        public TimeSpan? ConflictingStartTime { get; set; }
        public string Severity { get; set; } = "medium";
    }

    // ================= Doctor Availability =================
    
    public class DoctorAvailabilityRequest
    {
        public Guid DoctorId { get; set; }
        public DateTime Date { get; set; }
        public bool IncludeBlocked { get; set; } = true;
    }

    public class DoctorAvailabilityResponse
    {
        public Guid DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public List<TimeSlotDto> AvailableSlots { get; set; } = new();
        public List<WorkingHoursDto> WorkingHours { get; set; } = new();
        public List<BreakTimeDto> BreakTimes { get; set; } = new();
        public List<BlockedTimeDto> BlockedTimes { get; set; } = new();
    }

    public class TimeSlotDto
    {
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsAvailable { get; set; }
        public int DurationMinutes { get; set; }
        public string? ConflictReason { get; set; }
    }

    public class WorkingHoursDto
    {
        public Guid Id { get; set; }
        public int? DayOfWeek { get; set; } // 0=Sunday, 6=Saturday
        public DateTime? SpecificDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsRecurring { get; set; }
    }

    public class BreakTimeDto
    {
        public Guid Id { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string? Reason { get; set; }
    }

    public class BlockedTimeDto
    {
        public Guid Id { get; set; }
        public DateTime? SpecificDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string Type { get; set; } = "blocked"; // blocked, meeting, emergency, personal
    }

    public class ManageAvailabilityRequest
    {
        public Guid DoctorId { get; set; }
        public string AvailabilityType { get; set; } = "working_hours"; // working_hours, break, blocked
        public DateTime? SpecificDate { get; set; }
        public int? DayOfWeek { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string? Reason { get; set; }
        public bool IsRecurring { get; set; } = false;
    }

    // ================= Suggested Time Slots =================
    
    public class SuggestedSlotsRequest
    {
        public Guid DoctorId { get; set; }
        public DateTime PreferredDate { get; set; }
        public int DurationMinutes { get; set; } = 30;
        public string Priority { get; set; } = "normal";
        public int MaxSuggestions { get; set; } = 5;
    }

    public class SuggestedSlotsResponse
    {
        public List<SuggestedSlotDto> Suggestions { get; set; } = new();
    }

    public class SuggestedSlotDto
    {
        public DateTime Date { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public int Score { get; set; } // 0-100, higher is better
        public string Reason { get; set; } = string.Empty;
    }

    // ================= Appointment Statistics =================
    
    public class AppointmentStatsRequest
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public Guid? DoctorId { get; set; }
        public Guid? DepartmentId { get; set; }
    }

    public class AppointmentStatsResponse
    {
        public int TotalToday { get; set; }
        public int CompletedToday { get; set; }
        public int ScheduledToday { get; set; }
        public int ConfirmedToday { get; set; }
        public int InProgressToday { get; set; }
        public int CancelledToday { get; set; }
        public int NoShowToday { get; set; }
        public decimal AverageDurationMinutes { get; set; }
        public decimal UtilizationRate { get; set; }
        public string MostBookedTimeSlot { get; set; } = string.Empty;
        public List<DepartmentStatsDto> DepartmentBreakdown { get; set; } = new();
        public List<DoctorStatsDto> DoctorBreakdown { get; set; } = new();
    }

    public class DepartmentStatsDto
    {
        public Guid DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public int TotalAppointments { get; set; }
        public int CompletedAppointments { get; set; }
        public int CancelledAppointments { get; set; }
    }

    public class DoctorStatsDto
    {
        public Guid DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public int TotalAppointments { get; set; }
        public int CompletedAppointments { get; set; }
        public decimal UtilizationRate { get; set; }
    }

    // ================= Recurring Appointments =================
    
    public class CreateRecurringRequest
    {
        public Guid PatientId { get; set; }
        public Guid DoctorId { get; set; }
        public DateTime StartDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public int DurationMinutes { get; set; }
        public string RecurringPattern { get; set; } = "weekly"; // daily, weekly, monthly
        public int Occurrences { get; set; } = 1;
        public DateTime? EndDate { get; set; }
        public string AppointmentType { get; set; } = "checkup";
        public string? Notes { get; set; }
    }

    public class RecurringAppointmentsResponse
    {
        public int Created { get; set; }
        public int Conflicts { get; set; }
        public List<AppointmentResponse> Appointments { get; set; } = new();
        public List<AppointmentConflictDto> ConflictDetails { get; set; } = new();
    }

    // ================= Reminders =================
    
    public class SendReminderRequest
    {
        public Guid AppointmentId { get; set; }
        public string ReminderType { get; set; } = "email"; // email, sms, both
    }

    public class ReminderResponse
    {
        public Guid ReminderId { get; set; }
        public Guid AppointmentId { get; set; }
        public string ReminderType { get; set; } = string.Empty;
        public string DeliveryStatus { get; set; } = string.Empty;
        public DateTime ScheduledTime { get; set; }
        public DateTime? SentAt { get; set; }
    }

    public class UpcomingRemindersResponse
    {
        public List<ReminderResponse> Reminders { get; set; } = new();
    }

    // ================= Bulk Operations =================
    
    public class BulkUpdateAppointmentsRequest
    {
        public List<Guid> AppointmentIds { get; set; } = new();
        public string? NewStatus { get; set; }
        public Guid? NewDoctorId { get; set; }
        public DateTime? NewDate { get; set; }
        public TimeSpan? NewStartTime { get; set; }
    }

    public class BulkCancelAppointmentsRequest
    {
        public List<Guid> AppointmentIds { get; set; } = new();
        public string Reason { get; set; } = string.Empty;
        public bool SendNotifications { get; set; } = true;
    }

    public class BulkOperationResponse
    {
        public int SuccessCount { get; set; }
        public int FailureCount { get; set; }
        public List<string> Errors { get; set; } = new();
        public List<AppointmentResponse> UpdatedAppointments { get; set; } = new();
    }

    // ================= Calendar View =================
    
    public class CalendarDataRequest
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public List<Guid>? DoctorIds { get; set; }
        public List<Guid>? DepartmentIds { get; set; }
        public List<string>? Statuses { get; set; }
    }

    public class CalendarDataResponse
    {
        public List<AppointmentResponse> Appointments { get; set; } = new();
        public Dictionary<string, int> StatusCounts { get; set; } = new();
    }

    // ================= Reschedule =================
    
    public class RescheduleAppointmentRequest
    {
        public Guid AppointmentId { get; set; }
        public DateTime NewDate { get; set; }
        public TimeSpan NewStartTime { get; set; }
        public string? Reason { get; set; }
        public bool CheckConflicts { get; set; } = true;
    }
}
