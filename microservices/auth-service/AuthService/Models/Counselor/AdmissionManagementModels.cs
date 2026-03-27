using System;
using System.Collections.Generic;

namespace AuthService.Models.Counselor
{
    // ==================== Patient Admission DTOs ====================
    
    public class PatientAdmissionDto
    {
        public Guid Id { get; set; }
        public Guid SessionId { get; set; }
        public Guid PatientId { get; set; }
        public Guid? OtScheduleId { get; set; }
        public string? AdmissionNumber { get; set; }
        public string AdmissionType { get; set; } = null!; // DayCare, IPD, Emergency
        public DateTime AdmissionDate { get; set; }
        public TimeSpan? AdmissionTime { get; set; }
        public string? SurgeryType { get; set; }
        public DateTime? SurgeryDate { get; set; }
        public string? EyeOperated { get; set; }
        public Guid? BedId { get; set; }
        public DateTime? BedAssignedAt { get; set; }
        public TimeSpan? ScheduledDischargeTime { get; set; }
        public string AdmissionStatus { get; set; } = "Scheduled";
        public DateTime? ActualDischargeDate { get; set; }
        public TimeSpan? ActualDischargeTime { get; set; }
        public string? DischargeSummaryUrl { get; set; }
        public string? AttendantName { get; set; }
        public Guid? AdmittingDoctorId { get; set; }
        public decimal AdmissionDepositPaid { get; set; }
        public decimal? FinalBillAmount { get; set; }
        public string? FinalSettlementStatus { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateAdmissionRequest
    {
        public Guid SessionId { get; set; }
        public Guid PatientId { get; set; }
        public Guid? OtScheduleId { get; set; }
        public string AdmissionType { get; set; } = null!; // DayCare, IPD, Emergency
        public DateTime AdmissionDate { get; set; }
        public TimeSpan? AdmissionTime { get; set; }
        public string? SurgeryType { get; set; }
        public DateTime? SurgeryDate { get; set; }
        public string? EyeOperated { get; set; } // OD, OS, OU
        public TimeSpan? ScheduledDischargeTime { get; set; } // For day-care
        public string? AttendantName { get; set; }
        public string? AttendantPhone { get; set; }
        public string? AttendantRelation { get; set; }
        public Guid? AdmittingDoctorId { get; set; }
        public decimal AdmissionDepositPaid { get; set; }
    }

    public class UpdateAdmissionRequest
    {
        public DateTime? AdmissionDate { get; set; }
        public TimeSpan? AdmissionTime { get; set; }
        public TimeSpan? ScheduledDischargeTime { get; set; }
        public string? AdmissionStatus { get; set; }
        public string? SurgeryType { get; set; }
        public DateTime? SurgeryDate { get; set; }
        public decimal AdmissionDepositPaid { get; set; }
    }

    public class AssignBedRequest
    {
        public Guid BedId { get; set; }
    }

    public class DischargeAdmissionRequest
    {
        public DateTime? ActualDischargeDate { get; set; }
        public TimeSpan? ActualDischargeTime { get; set; }
        public string? DischargeSummaryUrl { get; set; }
        public string? DischargeInstructions { get; set; }
        public Guid DischargedByUserId { get; set; }
        public decimal FinalBillAmount { get; set; }
        public string FinalSettlementStatus { get; set; } = "Completed"; // Pending, Partial, Completed
    }

    // ==================== Bed Reservation DTOs ====================
    
    public class BedReservationDto
    {
        public Guid Id { get; set; }
        public Guid AdmissionId { get; set; }
        public Guid PatientId { get; set; }
        public Guid BedId { get; set; }
        public string? RoomNumber { get; set; }
        public DateTime ReservationStartDate { get; set; }
        public DateTime? ReservationEndDate { get; set; }
        public string ReservationStatus { get; set; } = "Reserved";
        public DateTime CreatedAt { get; set; }
    }

    public class CreateBedReservationRequest
    {
        public Guid AdmissionId { get; set; }
        public Guid PatientId { get; set; }
        public Guid BedId { get; set; }
        public Guid? WardId { get; set; }
        public string? RoomNumber { get; set; }
        public DateTime ReservationStartDate { get; set; }
        public DateTime? ReservationEndDate { get; set; }
    }

    // ==================== Response Models ====================
    
    public class AdmissionListResponse
    {
        public int TotalRecords { get; set; }
        public List<PatientAdmissionDto> Admissions { get; set; } = new();
    }

    public class AvailableBed
    {
        public Guid BedId { get; set; }
        public string BedNumber { get; set; } = null!;
        public string? WardName { get; set; }
        public string? RoomNumber { get; set; }
        public string BedType { get; set; } = null!; // General, ICU, Private
        public decimal DailyCharge { get; set; }
    }
}
