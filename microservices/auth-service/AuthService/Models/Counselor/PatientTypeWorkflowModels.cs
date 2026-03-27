using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Models.Counselor
{
    // ==================== PATIENT TYPE CONFIGURATION DTOs ====================

    public class PatientTypeConfigurationDto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public string PatientType { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string ConfigurationJson { get; set; } = "{}";
        public bool IsActive { get; set; }
        public int DisplayOrder { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid? CreatedByUserId { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedByUserId { get; set; }
    }

    public class CreatePatientTypeConfigRequest
    {
        [Required]
        [MaxLength(50)]
        public string PatientType { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string DisplayName { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public string ConfigurationJson { get; set; } = "{}";

        public bool IsActive { get; set; } = true;

        public int DisplayOrder { get; set; } = 0;
    }

    public class UpdatePatientTypeConfigRequest
    {
        [MaxLength(100)]
        public string? DisplayName { get; set; }

        public string? Description { get; set; }

        public string? ConfigurationJson { get; set; }

        public bool? IsActive { get; set; }

        public int? DisplayOrder { get; set; }
    }

    // ==================== DOCUMENT CHECKLIST DTOs ====================

    public class DocumentChecklistDto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid SessionId { get; set; }
        public string PatientType { get; set; } = string.Empty;
        public string DocumentName { get; set; } = string.Empty;
        public string? DocumentDescription { get; set; }
        public bool IsMandatory { get; set; }
        public bool IsUploaded { get; set; }
        public string? UploadedFilePath { get; set; }
        public DateTime? UploadedAt { get; set; }
        public Guid? UploadedByUserId { get; set; }
        public bool IsVerified { get; set; }
        public Guid? VerifiedByUserId { get; set; }
        public DateTime? VerifiedAt { get; set; }
        public string? VerificationNotes { get; set; }
        public string? RejectionReason { get; set; }
        public string Status { get; set; } = "Pending";
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Display Names
        public string? UploadedByUserName { get; set; }
        public string? VerifiedByUserName { get; set; }
    }

    public class CreateDocumentChecklistRequest
    {
        [Required]
        public Guid SessionId { get; set; }

        [Required]
        [MaxLength(50)]
        public string PatientType { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string DocumentName { get; set; } = string.Empty;

        public string? DocumentDescription { get; set; }

        public bool IsMandatory { get; set; } = true;
    }

    public class UploadDocumentRequest
    {
        [Required]
        [MaxLength(500)]
        public string FilePath { get; set; } = string.Empty;
    }

    public class VerifyDocumentChecklistRequest
    {
        [Required]
        public bool IsVerified { get; set; }

        public string? VerificationNotes { get; set; }

        public string? RejectionReason { get; set; }
    }

    public class UpdateDocumentChecklistRequest
    {
        [MaxLength(200)]
        public string? DocumentName { get; set; }

        public string? DocumentDescription { get; set; }

        public bool? IsMandatory { get; set; }
    }

    // ==================== CHECKLIST GENERATION DTOs ====================

    public class GenerateChecklistRequest
    {
        [Required]
        public Guid SessionId { get; set; }

        [Required]
        [MaxLength(50)]
        public string PatientType { get; set; } = string.Empty;
    }

    public class GenerateChecklistResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int DocumentsGenerated { get; set; }
        public List<DocumentChecklistDto> Checklist { get; set; } = new();
    }

    // ==================== CHECKLIST STATUS DTOs ====================

    public class ChecklistStatusSummary
    {
        public Guid SessionId { get; set; }
        public string PatientType { get; set; } = string.Empty;
        public int TotalDocuments { get; set; }
        public int MandatoryDocuments { get; set; }
        public int UploadedDocuments { get; set; }
        public int VerifiedDocuments { get; set; }
        public int RejectedDocuments { get; set; }
        public int PendingDocuments { get; set; }
        public bool AllMandatoryUploaded { get; set; }
        public bool AllMandatoryVerified { get; set; }
        public bool ReadyForNextStep { get; set; }
        public List<string> MissingMandatoryDocs { get; set; } = new();
    }

    public class ChecklistListResponse
    {
        public List<DocumentChecklistDto> Items { get; set; } = new();
        public ChecklistStatusSummary Summary { get; set; } = new();
    }
}
