using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AuthService.Models.Identity;

namespace AuthService.Models.Domain
{
    /// <summary>
    /// Configurable consultation charges per doctor/department/specialty
    /// Priority-based lookup: DoctorSpecific > SpecialtyBased > DepartmentWide > Default
    /// Supports follow-up fees, emergency consultations, and home visits
    /// </summary>
    [Table("consultation_charges")]
    public class ConsultationCharge
    {
        // ============================================================================
        // CORE IDENTIFICATION
        // ============================================================================
        [Key]
        public Guid Id { get; set; }
        
        [Required]
        public Guid TenantId { get; set; }
        
        [Required]
        public Guid BranchId { get; set; }
        
        // ============================================================================
        // CHARGE TYPE & ASSOCIATION
        // ============================================================================
        [Required]
        [MaxLength(50)]
        public string ChargeType { get; set; } = string.Empty; // DoctorSpecific, DepartmentWide, SpecialtyBased, Default
        
        public Guid? DoctorId { get; set; } // For DoctorSpecific charges
        
        public Guid? DepartmentId { get; set; } // For DepartmentWide charges
        
        [MaxLength(100)]
        public string? Specialty { get; set; } // For SpecialtyBased charges (Ophthalmology, Retina, Glaucoma, etc.)
        
        // ============================================================================
        // FEE STRUCTURE
        // ============================================================================
        [Column(TypeName = "decimal(15,2)")]
        public decimal ConsultationFee { get; set; }
        
        [Column(TypeName = "decimal(15,2)")]
        public decimal? FollowUpFee { get; set; }
        
        [Column(TypeName = "decimal(15,2)")]
        public decimal? EmergencyConsultationFee { get; set; }
        
        [Column(TypeName = "decimal(15,2)")]
        public decimal? HomeVisitFee { get; set; }
        
        // ============================================================================
        // FOLLOW-UP POLICY
        // ============================================================================
        public int ValidityDays { get; set; } = 30; // Free follow-ups valid for X days
        
        public int? FreeFollowUpsCount { get; set; } // Number of free follow-ups allowed
        
        // ============================================================================
        // PAYMENT OPTIONS
        // ============================================================================
        public bool AcceptsCash { get; set; } = true;
        
        public bool AcceptsCard { get; set; } = true;
        
        public bool AcceptsInsurance { get; set; } = true;
        
        // ============================================================================
        // EFFECTIVE DATE RANGE
        // ============================================================================
        public DateTime? EffectiveFrom { get; set; }
        
        public DateTime? EffectiveTo { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        // ============================================================================
        // AUDIT FIELDS
        // ============================================================================
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public Guid? CreatedByUserId { get; set; }
        
        public Guid? UpdatedByUserId { get; set; }
        
        public DateTime? DeletedAt { get; set; }
        
        [MaxLength(50)]
        public string Status { get; set; } = "active";
        
        // ============================================================================
        // NAVIGATION PROPERTIES
        // ============================================================================
        [ForeignKey("TenantId")]
        public virtual Tenant? Tenant { get; set; }
        
        [ForeignKey("BranchId")]
        public virtual Branch? Branch { get; set; }
        
        [ForeignKey("DoctorId")]
        public virtual AppUser? Doctor { get; set; }
        
        [ForeignKey("DepartmentId")]
        public virtual Department? Department { get; set; }
    }
}
