using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AuthService.Models.Domain;

namespace AuthService.Models
{
    [Table("biometry_records")]
    public class BiometryRecord
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Required]
        [Column("patient_id")]
        public Guid PatientId { get; set; }

        [Column("branch_id")]
        public Guid? BranchId { get; set; }

        [Required]
        [Column("eye")]
        [MaxLength(2)]
        public string Eye { get; set; } = null!; // "OD" or "OS"

        // Primary Measurements
        [Required]
        [Column("axial_length")]
        public decimal AxialLength { get; set; }

        [Required]
        [Column("k1")]
        public decimal K1 { get; set; } // Flat K

        [Required]
        [Column("k2")]
        public decimal K2 { get; set; } // Steep K

        [Required]
        [Column("k1_axis")]
        public int K1Axis { get; set; }

        [Required]
        [Column("acd")]
        public decimal Acd { get; set; } // Anterior Chamber Depth

        // Optional Measurements
        [Column("lens_thickness")]
        public decimal? LensThickness { get; set; }

        [Column("white_to_white")]
        public decimal? WhiteToWhite { get; set; }

        [Column("snr")]
        public decimal? Snr { get; set; } // Signal to Noise Ratio

        // Device Information
        [Required]
        [Column("device")]
        [MaxLength(100)]
        public string Device { get; set; } = null!;

        [Column("device_model")]
        [MaxLength(100)]
        public string? DeviceModel { get; set; }

        // Target & Results
        [Required]
        [Column("target_refraction")]
        public decimal TargetRefraction { get; set; }

        [Column("calculated_iol")]
        public decimal? CalculatedIol { get; set; }

        [Column("selected_formula")]
        [MaxLength(50)]
        public string? SelectedFormula { get; set; }

        // IOL Calculations stored as JSON
        [Column("iol_calculations")]
        public string? IolCalculations { get; set; }

        // Examination Info
        [Required]
        [Column("examination_date")]
        public DateTime ExaminationDate { get; set; }

        [Required]
        [Column("examiner_id")]
        public Guid ExaminerId { get; set; }

        // Audit Fields
        [Column("notes")]
        public string? Notes { get; set; }

        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("created_by_user_id")]
        public Guid? CreatedByUserId { get; set; }

        [Column("updated_by_user_id")]
        public Guid? UpdatedByUserId { get; set; }

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        [Required]
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
