using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AuthService.Models.Domain;

namespace AuthService.Models
{
    /// <summary>
    /// Retinopathy screening record for diabetic retinopathy grading
    /// </summary>
    [Table("retinopathy_screenings")]
    public class RetinopathyScreening
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Column("tenant_id")]
        [Required]
        public Guid TenantId { get; set; }

        [Column("patient_id")]
        [Required]
        public Guid PatientId { get; set; }

        [Column("branch_id")]
        public Guid? BranchId { get; set; }

        [Column("eye")]
        [MaxLength(10)]
        [Required]
        public string Eye { get; set; } = "OD"; // OD (Right), OS (Left), OU (Both)

        // Screening Details
        [Column("screening_date")]
        [Required]
        public DateTime ScreeningDate { get; set; }

        [Column("screener_id")]
        public Guid? ScreenerId { get; set; }

        [Column("device")]
        [MaxLength(100)]
        public string? Device { get; set; }

        [Column("device_model")]
        [MaxLength(100)]
        public string? DeviceModel { get; set; }

        // DR Grading
        [Column("dr_grade")]
        [MaxLength(50)]
        [Required]
        public string DrGrade { get; set; } = "None"; // None, Mild NPDR, Moderate NPDR, Severe NPDR, PDR

        [Column("macular_edema")]
        [MaxLength(50)]
        public string? MacularEdema { get; set; } // None, Mild, Moderate, Severe

        [Column("hemorrhages_count")]
        public int? HemorrhagesCount { get; set; }

        [Column("microaneurysms_count")]
        public int? MicroaneurysmsCount { get; set; }

        [Column("hard_exudates")]
        public bool HardExudates { get; set; }

        [Column("soft_exudates")]
        public bool SoftExudates { get; set; }

        [Column("neovascularization")]
        public bool Neovascularization { get; set; }

        [Column("venous_beading")]
        public bool VenousBeading { get; set; }

        [Column("irma")]
        public bool Irma { get; set; } // Intraretinal Microvascular Abnormalities

        // Image References
        [Column("image_paths")]
        public string? ImagePaths { get; set; } // JSON array of image file paths

        [Column("thumbnail_path")]
        [MaxLength(500)]
        public string? ThumbnailPath { get; set; }

        // Recommendations
        [Column("referral_required")]
        public bool ReferralRequired { get; set; }

        [Column("follow_up_months")]
        public int? FollowUpMonths { get; set; } // 3, 6, 12 months

        [Column("treatment_recommended")]
        [MaxLength(200)]
        public string? TreatmentRecommended { get; set; }

        [Column("notes")]
        public string? Notes { get; set; }

        // AI Analysis (Optional)
        [Column("ai_grade")]
        [MaxLength(50)]
        public string? AiGrade { get; set; }

        [Column("ai_confidence")]
        public decimal? AiConfidence { get; set; }

        [Column("grader_agreement")]
        public bool? GraderAgreement { get; set; } // Human grader agrees with AI

        // Audit Fields
        [Column("created_at")]
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        [Column("created_by_user_id")]
        public Guid? CreatedByUserId { get; set; }

        [Column("updated_by_user_id")]
        public Guid? UpdatedByUserId { get; set; }

        [Column("status")]
        [MaxLength(50)]
        public string Status { get; set; } = "active";

        // Navigation Properties
        [ForeignKey("TenantId")]
        public virtual AuthService.Models.Domain.Tenant? Tenant { get; set; }

        [ForeignKey("PatientId")]
        public virtual Patient? Patient { get; set; }

        [ForeignKey("BranchId")]
        public virtual AuthService.Models.Domain.Branch? Branch { get; set; }
    }
}
