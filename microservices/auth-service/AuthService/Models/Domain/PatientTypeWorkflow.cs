using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain
{
    /// <summary>
    /// Configuration for different patient types (Cash, Insurance, Government Schemes, etc.)
    /// Stores billing rules, advance payment requirements, required documents per type
    /// </summary>
    [Table("patient_type_configurations")]
    public class PatientTypeConfiguration
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        // Patient Type
        [Required]
        [Column("patient_type")]
        [MaxLength(50)]
        public string PatientType { get; set; } = string.Empty; // Cash, Insurance, CoPay, ESH, CGHS, Arograshree, SGHS, Camp

        [Required]
        [Column("display_name")]
        [MaxLength(100)]
        public string DisplayName { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        // Configuration JSON: { requires_advance_payment, advance_percentage, required_documents, etc. }
        [Required]
        [Column("configuration_json", TypeName = "jsonb")]
        public string ConfigurationJson { get; set; } = "{}";

        // Status
        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("display_order")]
        public int DisplayOrder { get; set; } = 0;

        // Audit Fields
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("created_by_user_id")]
        public Guid? CreatedByUserId { get; set; }

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [Column("updated_by_user_id")]
        public Guid? UpdatedByUserId { get; set; }
    }

    /// <summary>
    /// Document checklist for counseling sessions based on patient type
    /// Tracks upload and verification status of required documents
    /// </summary>
    [Table("patient_type_document_checklist")]
    public class PatientTypeDocumentChecklist
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        // Session Link
        [Required]
        [Column("session_id")]
        public Guid SessionId { get; set; }

        [Required]
        [Column("patient_type")]
        [MaxLength(50)]
        public string PatientType { get; set; } = string.Empty;

        // Document Details
        [Required]
        [Column("document_name")]
        [MaxLength(200)]
        public string DocumentName { get; set; } = string.Empty;

        [Column("document_description")]
        public string? DocumentDescription { get; set; }

        [Column("is_mandatory")]
        public bool IsMandatory { get; set; } = true;

        // Upload Status
        [Column("is_uploaded")]
        public bool IsUploaded { get; set; } = false;

        [Column("uploaded_file_path")]
        [MaxLength(500)]
        public string? UploadedFilePath { get; set; }

        [Column("uploaded_at")]
        public DateTime? UploadedAt { get; set; }

        [Column("uploaded_by_user_id")]
        public Guid? UploadedByUserId { get; set; }

        // Verification
        [Column("is_verified")]
        public bool IsVerified { get; set; } = false;

        [Column("verified_by_user_id")]
        public Guid? VerifiedByUserId { get; set; }

        [Column("verified_at")]
        public DateTime? VerifiedAt { get; set; }

        [Column("verification_notes")]
        public string? VerificationNotes { get; set; }

        [Column("rejection_reason")]
        public string? RejectionReason { get; set; }

        // Status: Pending, Uploaded, Verified, Rejected
        [Column("status")]
        [MaxLength(30)]
        public string Status { get; set; } = "Pending";

        // Audit Fields
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Navigation Properties
        [ForeignKey("SessionId")]
        public virtual CounselingSession? CounselingSession { get; set; }
    }
}
