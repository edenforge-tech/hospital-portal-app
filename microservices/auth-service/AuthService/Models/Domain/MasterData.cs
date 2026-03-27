using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain
{
    /// <summary>
    /// Insurance Provider Master Data
    /// </summary>
    [Table("insurance_providers")]
    public class InsuranceProvider
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }
        
        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }
        
        [Required]
        [Column("provider_name")]
        public string ProviderName { get; set; } = string.Empty;
        
        [Required]
        [Column("provider_code")]
        public string ProviderCode { get; set; } = string.Empty;
        
        [Required]
        [Column("provider_type")]
        public string ProviderType { get; set; } = string.Empty;
        
        [Column("contact_number")]
        public string? ContactNumber { get; set; }
        
        [Column("contact_email")]
        public string? ContactEmail { get; set; }
        
        [Column("website_url")]
        public string? WebsiteUrl { get; set; }
        
        [Column("is_active")]
        public bool IsActive { get; set; } = true;
        
        [Column("display_order")]
        public int? DisplayOrder { get; set; }
        
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
        
        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
        
        [Column("created_by_user_id")]
        public Guid? CreatedByUserId { get; set; }
        
        [Column("updated_by_user_id")]
        public Guid? UpdatedByUserId { get; set; }
        
        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }
    }

    /// <summary>
    /// TPA (Third Party Administrator) Provider Master Data
    /// </summary>
    [Table("tpa_providers")]
    public class TpaProvider
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }
        
        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }
        
        [Required]
        [Column("tpa_name")]
        public string TpaName { get; set; } = string.Empty;
        
        [Required]
        [Column("tpa_code")]
        public string TpaCode { get; set; } = string.Empty;
        
        [Column("contact_number")]
        public string? ContactNumber { get; set; }
        
        [Column("contact_email")]
        public string? ContactEmail { get; set; }
        
        [Column("website_url")]
        public string? WebsiteUrl { get; set; }
        
        [Column("helpline_number")]
        public string? HelplineNumber { get; set; }
        
        [Column("is_active")]
        public bool IsActive { get; set; } = true;
        
        [Column("display_order")]
        public int? DisplayOrder { get; set; }
        
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
        
        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
        
        [Column("created_by_user_id")]
        public Guid? CreatedByUserId { get; set; }
        
        [Column("updated_by_user_id")]
        public Guid? UpdatedByUserId { get; set; }
        
        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }
    }

    // SurgeryType entity removed — replaced by ServiceVariant in ServiceCatalogV2.cs

    /// <summary>
    /// Anesthesia Types Master Data
    /// </summary>
    [Table("anesthesia_types")]
    public class AnesthesiaType
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }
        
        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }
        
        [Required]
        [Column("anesthesia_name")]
        public string AnesthesiaName { get; set; } = string.Empty;
        
        [Required]
        [Column("anesthesia_code")]
        public string AnesthesiaCode { get; set; } = string.Empty;
        
        [Required]
        [Column("anesthesia_category")]
        public string AnesthesiaCategory { get; set; } = string.Empty;
        
        [Column("description")]
        public string? Description { get; set; }
        
        [Column("typical_duration_minutes")]
        public int? TypicalDurationMinutes { get; set; }
        
        [Column("recovery_time_minutes")]
        public int? RecoveryTimeMinutes { get; set; }
        
        [Column("additional_cost")]
        public decimal? AdditionalCost { get; set; }
        
        [Column("contraindications")]
        public string? Contraindications { get; set; }
        
        [Column("special_requirements")]
        public string? SpecialRequirements { get; set; }
        
        [Column("is_active")]
        public bool IsActive { get; set; } = true;
        
        [Column("display_order")]
        public int? DisplayOrder { get; set; }
        
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
        
        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
        
        [Column("created_by_user_id")]
        public Guid? CreatedByUserId { get; set; }
        
        [Column("updated_by_user_id")]
        public Guid? UpdatedByUserId { get; set; }
        
        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }
    }

    /// <summary>
    /// Government Healthcare Schemes Master Data
    /// </summary>
    [Table("government_schemes")]
    public class GovernmentScheme
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }
        
        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }
        
        [Required]
        [Column("scheme_name")]
        public string SchemeName { get; set; } = string.Empty;
        
        [Required]
        [Column("scheme_code")]
        public string SchemeCode { get; set; } = string.Empty;
        
        [Required]
        [Column("scheme_type")]
        public string SchemeType { get; set; } = string.Empty;
        
        [Column("implementing_authority")]
        public string? ImplementingAuthority { get; set; }
        
        [Column("scheme_description")]
        public string? SchemeDescription { get; set; }
        
        [Column("eligibility_criteria")]
        public string? EligibilityCriteria { get; set; }
        
        [Column("coverage_details")]
        public string? CoverageDetails { get; set; }
        
        [Column("max_coverage_amount")]
        public decimal? MaxCoverageAmount { get; set; }
        
        [Column("requires_beneficiary_id")]
        public bool RequiresBeneficiaryId { get; set; } = true;
        
        [Column("beneficiary_id_type")]
        public string? BeneficiaryIdType { get; set; }
        
        [Column("claim_submission_url")]
        public string? ClaimSubmissionUrl { get; set; }
        
        [Column("helpline_number")]
        public string? HelplineNumber { get; set; }
        
        [Column("is_active")]
        public bool IsActive { get; set; } = true;
        
        [Column("effective_from")]
        public DateTime? EffectiveFrom { get; set; }
        
        [Column("effective_until")]
        public DateTime? EffectiveUntil { get; set; }
        
        [Column("display_order")]
        public int? DisplayOrder { get; set; }
        
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
        
        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
        
        [Column("created_by_user_id")]
        public Guid? CreatedByUserId { get; set; }
        
        [Column("updated_by_user_id")]
        public Guid? UpdatedByUserId { get; set; }
        
        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }
    }
}
