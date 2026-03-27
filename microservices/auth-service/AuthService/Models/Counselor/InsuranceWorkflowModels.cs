using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Models.Counselor
{
    // Pre-Authorization DTOs
    public class InsurancePreAuthDto
    {
        public Guid Id { get; set; }
        public Guid SessionId { get; set; }
        public Guid PatientId { get; set; }
        public string? PreAuthNumber { get; set; }
        public string? InsuranceType { get; set; }
        public string? InsuranceProvider { get; set; }
        public string? TPAName { get; set; }
        public string? PolicyNumber { get; set; }
        public string? PolicyHolderName { get; set; }
        public string SurgeryType { get; set; } = string.Empty;
        public string? PlannedProcedure { get; set; }
        public string? DiagnosisCode { get; set; }
        public string? ProcedureCode { get; set; }
        public string? EyeOperated { get; set; }
        public decimal RequestedAmount { get; set; }
        public decimal? ApprovedAmount { get; set; }
        public decimal CopayAmount { get; set; }
        public decimal DeductibleAmount { get; set; }
        public decimal? PatientPayable { get; set; }
        public Guid? PackageId { get; set; }
        public string? ItemizedBreakdown { get; set; }
        public string Status { get; set; } = "Draft";
        public DateTime? SubmittedToTPAAt { get; set; }
        public DateTime? ExpectedApprovalDate { get; set; }
        public DateTime? ActualApprovalDate { get; set; }
        public string? TPAApprovalNumber { get; set; }
        public string? TPAApprovalLetterUrl { get; set; }
        public string? TPAResponseNotes { get; set; }
        public string? TPADenialReason { get; set; }
        public string[]? QueriesRaised { get; set; }
        public string[]? QueryResponses { get; set; }
        public DateTime? ValidFrom { get; set; }
        public DateTime? ValidUntil { get; set; }
    }

    public class CreatePreAuthRequest
    {
        [Required]
        public Guid SessionId { get; set; }
        [Required]
        public Guid PatientId { get; set; }
        [MaxLength(50)]
        public string? InsuranceType { get; set; }
        [MaxLength(200)]
        public string? InsuranceProvider { get; set; }
        [MaxLength(200)]
        public string? TPAName { get; set; }
        [MaxLength(100)]
        public string? PolicyNumber { get; set; }
        [MaxLength(200)]
        public string? PolicyHolderName { get; set; }
        [Required]
        [MaxLength(100)]
        public string SurgeryType { get; set; } = string.Empty;
        public string? PlannedProcedure { get; set; }
        [MaxLength(50)]
        public string? DiagnosisCode { get; set; }
        [MaxLength(50)]
        public string? ProcedureCode { get; set; }
        [MaxLength(10)]
        public string? EyeOperated { get; set; }
        [Required]
        public decimal RequestedAmount { get; set; }
        public decimal? CopayAmount { get; set; }
        public decimal? DeductibleAmount { get; set; }
        public Guid? PackageId { get; set; }
        public string? ItemizedBreakdown { get; set; }
    }

    public class UpdatePreAuthRequest
    {
        public string? InsuranceProvider { get; set; }
        public string? TPAName { get; set; }
        public string? PolicyNumber { get; set; }
        public string? PlannedProcedure { get; set; }
        public decimal? RequestedAmount { get; set; }
        public decimal? CopayAmount { get; set; }
        public decimal? DeductibleAmount { get; set; }
        public string? ItemizedBreakdown { get; set; }
    }

    public class SubmitToTPARequest
    {
        public DateTime? ExpectedApprovalDate { get; set; }
        public string? SubmissionNotes { get; set; }
    }

    public class TPAResponseRequest
    {
        [Required]
        public string ActionType { get; set; } = string.Empty; // 'Approve', 'PartiallyApprove', 'Deny', 'QueryRaise'
        public decimal? ApprovedAmount { get; set; }
        public decimal? PatientPayable { get; set; }
        [MaxLength(100)]
        public string? TPAApprovalNumber { get; set; }
        public string? TPAApprovalLetterUrl { get; set; }
        public string? TPAResponseNotes { get; set; }
        public string? TPADenialReason { get; set; }
        public string[]? QueriesRaised { get; set; }
        public DateTime? ValidFrom { get; set; }
        public DateTime? ValidUntil { get; set; }
    }

    // Approval Workflow DTOs
    public class ApprovalWorkflowDto
    {
        public Guid Id { get; set; }
        public Guid PreAuthId { get; set; }
        public string StageName { get; set; } = string.Empty;
        public int StageSequence { get; set; }
        public Guid? ApproverUserId { get; set; }
        public string? ApproverRole { get; set; }
        public string? ActionTaken { get; set; }
        public DateTime? ActionTimestamp { get; set; }
        public string? Comments { get; set; }
        public string[]? DocumentsUploaded { get; set; }
        public bool IsCurrentStage { get; set; }
        public bool Completed { get; set; }
    }

    public class ProcessApprovalRequest
    {
        [Required]
        public string ActionTaken { get; set; } = string.Empty; // 'Approved', 'Rejected', 'QueryRaised'
        public string? Comments { get; set; }
        public string[]? DocumentsUploaded { get; set; }
    }

    // Insurance Document DTOs
    public class InsuranceDocumentDto
    {
        public Guid Id { get; set; }
        public Guid PreAuthId { get; set; }
        public string DocumentType { get; set; } = string.Empty;
        public string DocumentName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public long? FileSizeBytes { get; set; }
        public string? MimeType { get; set; }
        public DateTime UploadedAt { get; set; }
        public bool IsVerified { get; set; }
        public string? Notes { get; set; }
    }

    public class UploadInsuranceDocumentRequest
    {
        [Required]
        public Guid PreAuthId { get; set; }
        [Required]
        [MaxLength(50)]
        public string DocumentType { get; set; } = string.Empty;
        [Required]
        [MaxLength(200)]
        public string DocumentName { get; set; } = string.Empty;
        [Required]
        public string FileUrl { get; set; } = string.Empty;
        public long? FileSizeBytes { get; set; }
        [MaxLength(100)]
        public string? MimeType { get; set; }
        public string? Notes { get; set; }
    }

    // TPA Communication DTOs
    public class TPACommunicationDto
    {
        public Guid Id { get; set; }
        public Guid PreAuthId { get; set; }
        public DateTime CommunicationDate { get; set; }
        public string? CommunicationType { get; set; }
        public string? Direction { get; set; }
        public string? TPAContactName { get; set; }
        public string? TPAContactPhone { get; set; }
        public string? TPAContactEmail { get; set; }
        public string? Subject { get; set; }
        public string? Message { get; set; }
        public bool RequiresResponse { get; set; }
        public bool ResponseReceived { get; set; }
        public DateTime? ResponseDate { get; set; }
        public string? ResponseText { get; set; }
        public string[]? AttachmentsUrls { get; set; }
        public bool FollowUpRequired { get; set; }
        public DateTime? FollowUpDate { get; set; }
    }

    public class LogTPACommunicationRequest
    {
        [Required]
        public Guid PreAuthId { get; set; }
        [MaxLength(30)]
        public string? CommunicationType { get; set; }
        [MaxLength(20)]
        public string? Direction { get; set; }
        [MaxLength(200)]
        public string? TPAContactName { get; set; }
        [MaxLength(20)]
        public string? TPAContactPhone { get; set; }
        [MaxLength(200)]
        public string? TPAContactEmail { get; set; }
        [MaxLength(300)]
        public string? Subject { get; set; }
        public string? Message { get; set; }
        public bool RequiresResponse { get; set; }
        public string[]? AttachmentsUrls { get; set; }
        public bool FollowUpRequired { get; set; }
        public DateTime? FollowUpDate { get; set; }
    }

    public class PreAuthListResponse
    {
        public List<InsurancePreAuthDto> PreAuths { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
    }
}
