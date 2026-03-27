using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Models.Counselor
{
    // ==================== PRE-OP TEST PROTOCOL DTOs ====================

    public class PreOpTestProtocolDto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public string ProtocolName { get; set; } = string.Empty;
        public string? ProtocolCode { get; set; }
        public string SurgeryType { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string RequiredTests { get; set; } = "[]";
        public int TestValidityDays { get; set; }
        public bool IsActive { get; set; }
        public int Version { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid? CreatedByUserId { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedByUserId { get; set; }
    }

    public class CreatePreOpTestProtocolRequest
    {
        [Required]
        [MaxLength(200)]
        public string ProtocolName { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? ProtocolCode { get; set; }

        [Required]
        [MaxLength(100)]
        public string SurgeryType { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public string RequiredTests { get; set; } = "[]";

        public int TestValidityDays { get; set; } = 30;

        public bool IsActive { get; set; } = true;
    }

    public class UpdatePreOpTestProtocolRequest
    {
        [MaxLength(200)]
        public string? ProtocolName { get; set; }

        public string? Description { get; set; }

        public string? RequiredTests { get; set; }

        public int? TestValidityDays { get; set; }

        public bool? IsActive { get; set; }
    }

    // ==================== PRE-OP TEST ORDER DTOs ====================

    public class PreOpTestOrderDto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid? BranchId { get; set; }
        public Guid SessionId { get; set; }
        public Guid PatientId { get; set; }
        public Guid ProtocolId { get; set; }
        public Guid? LabOrderId { get; set; }
        public string? OrderNumber { get; set; }
        public Guid OrderedByUserId { get; set; }
        public DateTime OrderedAt { get; set; }
        public bool ResultsReceived { get; set; }
        public DateTime? ResultsReceivedAt { get; set; }
        public bool? ResultsWithinNormal { get; set; }
        public bool ClearedForSurgery { get; set; }
        public string? SpecialInstructions { get; set; }
        public string? CounselorNotes { get; set; }
        public string? DocumentUrl { get; set; }
        public string Status { get; set; } = "Ordered";
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Display Names
        public string? PatientName { get; set; }
        public string? OrderedByUserName { get; set; }
        public string? ProtocolName { get; set; }
    }

    public class PreOpTestOrderDetailsDto : PreOpTestOrderDto
    {
        public List<PreOpTestResultDto> Results { get; set; } = new();
        public List<PreOpFitnessClearanceDto> FitnessClearances { get; set; } = new();
    }

    public class CreatePreOpTestOrderRequest
    {
        [Required]
        public Guid SessionId { get; set; }

        [Required]
        public Guid PatientId { get; set; }

        [Required]
        public Guid ProtocolId { get; set; }

        public Guid? BranchId { get; set; }

        public string? SpecialInstructions { get; set; }

        public string? CounselorNotes { get; set; }
    }

    public class UpdatePreOpTestOrderRequest
    {
        public Guid? LabOrderId { get; set; }

        public string? SpecialInstructions { get; set; }

        public string? CounselorNotes { get; set; }

        public string? Status { get; set; }
    }

    public class MarkResultsReceivedRequest
    {
        [Required]
        public bool ResultsWithinNormal { get; set; }
        public string? DocumentUrl { get; set; }
    }

    // ==================== PRE-OP TEST RESULT DTOs ====================

    public class PreOpTestResultDto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid OrderId { get; set; }
        public Guid? LabTestResultId { get; set; }
        public string TestName { get; set; } = string.Empty;
        public string? TestCode { get; set; }
        public string? ResultValue { get; set; }
        public string? ResultUnit { get; set; }
        public string? NormalRange { get; set; }
        public bool IsAbnormal { get; set; }
        public string? Severity { get; set; }
        public bool RequiresClearance { get; set; }
        public string? Interpretation { get; set; }
        public string? ClinicalSignificance { get; set; }
        public string Status { get; set; } = "active";
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreatePreOpTestResultRequest
    {
        [Required]
        public Guid OrderId { get; set; }

        public Guid? LabTestResultId { get; set; }

        [Required]
        [MaxLength(200)]
        public string TestName { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? TestCode { get; set; }

        [MaxLength(500)]
        public string? ResultValue { get; set; }

        [MaxLength(50)]
        public string? ResultUnit { get; set; }

        [MaxLength(200)]
        public string? NormalRange { get; set; }

        public bool IsAbnormal { get; set; } = false;

        [MaxLength(20)]
        public string? Severity { get; set; }

        public bool RequiresClearance { get; set; } = false;

        public string? Interpretation { get; set; }

        public string? ClinicalSignificance { get; set; }
    }

    public class UpdatePreOpTestResultRequest
    {
        [MaxLength(500)]
        public string? ResultValue { get; set; }

        [MaxLength(50)]
        public string? ResultUnit { get; set; }

        [MaxLength(200)]
        public string? NormalRange { get; set; }

        public bool? IsAbnormal { get; set; }

        [MaxLength(20)]
        public string? Severity { get; set; }

        public bool? RequiresClearance { get; set; }

        public string? Interpretation { get; set; }

        public string? ClinicalSignificance { get; set; }
    }

    // ==================== FITNESS CLEARANCE DTOs ====================

    public class PreOpFitnessClearanceDto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid? BranchId { get; set; }
        public Guid OrderId { get; set; }
        public Guid SessionId { get; set; }
        public Guid PatientId { get; set; }
        public string? ClearanceType { get; set; }
        public string? AbnormalTests { get; set; }
        public string ReasonForClearance { get; set; } = string.Empty;
        public string? ReferredToSpecialty { get; set; }
        public Guid? ReferredToDoctorId { get; set; }
        public DateTime? ReferralDate { get; set; }
        public bool ClearanceObtained { get; set; }
        public Guid? ClearedByDoctorId { get; set; }
        public DateTime? ClearedAt { get; set; }
        public string? ClearanceNotes { get; set; }
        public DateTime? ClearanceValidUntil { get; set; }
        public string? SurgeryClearanceConditions { get; set; }
        public string? AnesthesiaPrecautions { get; set; }
        public string Status { get; set; } = "Pending";
        public string Priority { get; set; } = "Normal";
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Display Names
        public string? PatientName { get; set; }
        public string? ReferredToDoctorName { get; set; }
        public string? ClearedByDoctorName { get; set; }
    }

    public class CreatePreOpFitnessClearanceRequest
    {
        [Required]
        public Guid OrderId { get; set; }

        [Required]
        public Guid SessionId { get; set; }

        [Required]
        public Guid PatientId { get; set; }

        public Guid? BranchId { get; set; }

        [MaxLength(50)]
        public string? ClearanceType { get; set; }

        public string? AbnormalTests { get; set; }

        [Required]
        public string ReasonForClearance { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? ReferredToSpecialty { get; set; }

        public Guid? ReferredToDoctorId { get; set; }

        [MaxLength(20)]
        public string Priority { get; set; } = "Normal";
    }

    public class UpdateFitnessClearanceRequest
    {
        public string? ReferredToSpecialty { get; set; }

        public Guid? ReferredToDoctorId { get; set; }

        public DateTime? ReferralDate { get; set; }

        public string? Status { get; set; }

        public string? Priority { get; set; }
    }

    public class GrantClearanceRequest
    {
        [Required]
        public bool ClearanceObtained { get; set; }

        public string? ClearanceNotes { get; set; }

        public DateTime? ClearanceValidUntil { get; set; }

        public string? SurgeryClearanceConditions { get; set; }

        public string? AnesthesiaPrecautions { get; set; }
    }

    // ==================== SUMMARY DTOs ====================

    public class PreOpTestOrderSummary
    {
        public Guid OrderId { get; set; }
        public string? OrderNumber { get; set; }
        public int TotalTests { get; set; }
        public int CompletedTests { get; set; }
        public int AbnormalTests { get; set; }
        public int TestsRequiringClearance { get; set; }
        public int PendingClearances { get; set; }
        public int ObtainedClearances { get; set; }
        public bool AllTestsCompleted { get; set; }
        public bool AllClearancesObtained { get; set; }
        public bool ClearedForSurgery { get; set; }
    }

    public class OrderListResponse
    {
        public List<PreOpTestOrderDto> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
}
