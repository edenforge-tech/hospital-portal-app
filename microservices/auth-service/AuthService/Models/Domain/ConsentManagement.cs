using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain
{
    [Table("consent_form_templates")]
    public class ConsentFormTemplate
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        // Template Details
        [Required]
        [Column("template_name")]
        [MaxLength(200)]
        public string TemplateName { get; set; } = null!;

        // Category: SurgeryConsent, AnesthesiaConsent, DataSharingConsent, PhotographyConsent, ResearchConsent, GeneralTreatmentConsent
        [Required]
        [Column("consent_category")]
        [MaxLength(50)]
        public string ConsentCategory { get; set; } = null!;

        [Column("description")]
        public string? Description { get; set; }

        // Template HTML with placeholders: {{PATIENT_NAME}}, {{SURGERY_TYPE}}, {{SURGEON_NAME}}, etc.
        [Required]
        [Column("template_html")]
        public string TemplateHtml { get; set; } = null!;

        // Signature Requirements
        [Column("requires_patient_signature")]
        public bool RequiresPatientSignature { get; set; } = true;

        [Column("requires_witness_signature")]
        public bool RequiresWitnessSignature { get; set; } = true;

        [Column("requires_guardian_signature")]
        public bool RequiresGuardianSignature { get; set; } = false;

        // Legal Compliance
        [Column("compliance_standards")]
        public string[]? ComplianceStandards { get; set; } // HIPAA, GDPR, MCI

        [Column("version")]
        [MaxLength(20)]
        public string? Version { get; set; }

        [Column("effective_from")]
        public DateTime? EffectiveFrom { get; set; }

        [Column("effective_to")]
        public DateTime? EffectiveTo { get; set; }

        // Status
        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        // Audit Fields
        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Required]
        [Column("created_by_user_id")]
        public Guid CreatedByUserId { get; set; }

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }
    }

    [Table("counseling_consents")]
    public class CounselingConsent
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Required]
        [Column("branch_id")]
        public Guid BranchId { get; set; }

        // Template Link
        [Required]
        [Column("template_id")]
        public Guid TemplateId { get; set; }

        // Session & Patient Links
        [Required]
        [Column("session_id")]
        public Guid SessionId { get; set; }

        [Required]
        [Column("patient_id")]
        public Guid PatientId { get; set; }

        [Column("package_id")]
        public Guid? PackageId { get; set; }

        // Rendered HTML (with actual values filled in)
        [Required]
        [Column("rendered_html")]
        public string RenderedHtml { get; set; } = null!;

        // Digital Signatures (HTML5 Canvas base64 PNG)
        [Column("patient_signature_base64")]
        public string? PatientSignatureBase64 { get; set; }

        [Column("patient_signed_at")]
        public DateTime? PatientSignedAt { get; set; }

        [Column("witness_name")]
        [MaxLength(200)]
        public string? WitnessName { get; set; }

        [Column("witness_signature_base64")]
        public string? WitnessSignatureBase64 { get; set; }

        [Column("witness_signed_at")]
        public DateTime? WitnessSignedAt { get; set; }

        [Column("guardian_name")]
        [MaxLength(200)]
        public string? GuardianName { get; set; }

        [Column("guardian_relationship")]
        [MaxLength(50)]
        public string? GuardianRelation { get; set; }

        [Column("guardian_signature_base64")]
        public string? GuardianSignatureBase64 { get; set; }

        [Column("guardian_signed_at")]
        public DateTime? GuardianSignedAt { get; set; }

        // PDF Generation
        [Column("pdf_url")]
        public string? PdfUrl { get; set; }

        [Column("pdf_generated_at")]
        public DateTime? PdfGeneratedAt { get; set; }

        // Status: Draft, Signed, Revoked
        [Column("consent_status")]
        [MaxLength(20)]
        public string ConsentStatus { get; set; } = "Draft";

        // Revocation
        [Column("revoked_at")]
        public DateTime? RevokedAt { get; set; }

        [Column("revocation_reason")]
        public string? RevocationReason { get; set; }

        [Column("revoked_by_user_id")]
        public Guid? RevokedByUserId { get; set; }

        // Audit Fields
        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Required]
        [Column("created_by_user_id")]
        public Guid CreatedByUserId { get; set; }

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }
    }
}
