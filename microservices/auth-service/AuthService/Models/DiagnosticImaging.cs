using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AuthService.Models.Domain;

namespace AuthService.Models
{
    /// <summary>
    /// OCT imaging scan record for optical coherence tomography
    /// </summary>
    [Table("oct_imaging_scans")]
    public class OctImagingScan
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
        public string Eye { get; set; } = "OD";

        // Scan Details
        [Column("scan_date")]
        [Required]
        public DateTime ScanDate { get; set; }

        [Column("technician_id")]
        public Guid? TechnicianId { get; set; }

        [Column("device")]
        [MaxLength(100)]
        public string? Device { get; set; }

        [Column("device_model")]
        [MaxLength(100)]
        public string? DeviceModel { get; set; }

        [Column("scan_type")]
        [MaxLength(50)]
        [Required]
        public string ScanType { get; set; } = "Macula"; // Macula, Optic Disc, Anterior Segment, Widefield

        [Column("scan_pattern")]
        [MaxLength(50)]
        public string? ScanPattern { get; set; } // Raster, Radial, Line, Circle

        [Column("scan_size")]
        [MaxLength(50)]
        public string? ScanSize { get; set; } // 6x6mm, 3x3mm, etc.

        // Measurements
        [Column("central_thickness")]
        public decimal? CentralThickness { get; set; }

        [Column("average_thickness")]
        public decimal? AverageThickness { get; set; }

        [Column("volume")]
        public decimal? Volume { get; set; }

        [Column("rnfl_average")]
        public decimal? RnflAverage { get; set; } // Retinal Nerve Fiber Layer

        [Column("gcl_thickness")]
        public decimal? GclThickness { get; set; } // Ganglion Cell Layer

        // Findings
        [Column("pathology_detected")]
        public bool PathologyDetected { get; set; }

        [Column("pathology_type")]
        [MaxLength(200)]
        public string? PathologyType { get; set; }

        [Column("fluid_detected")]
        public bool FluidDetected { get; set; }

        [Column("fluid_type")]
        [MaxLength(100)]
        public string? FluidType { get; set; } // Intraretinal, Subretinal, Sub-RPE

        // Image/Data Storage
        [Column("image_paths")]
        public string? ImagePaths { get; set; } // JSON array

        [Column("data_file_path")]
        [MaxLength(500)]
        public string? DataFilePath { get; set; }

        [Column("thumbnail_path")]
        [MaxLength(500)]
        public string? ThumbnailPath { get; set; }

        // Quality
        [Column("signal_strength")]
        public int? SignalStrength { get; set; } // 0-10

        [Column("quality_score")]
        public int? QualityScore { get; set; }

        // Clinical
        [Column("diagnosis")]
        [MaxLength(500)]
        public string? Diagnosis { get; set; }

        [Column("notes")]
        public string? Notes { get; set; }

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

    /// <summary>
    /// Electrophysiology test record for ERG, VEP, EOG tests
    /// </summary>
    [Table("electrophysiology_tests")]
    public class ElectrophysiologyTest
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

        // Test Details
        [Column("test_date")]
        [Required]
        public DateTime TestDate { get; set; }

        [Column("technician_id")]
        public Guid? TechnicianId { get; set; }

        [Column("device")]
        [MaxLength(100)]
        public string? Device { get; set; }

        [Column("test_type")]
        [MaxLength(50)]
        [Required]
        public string TestType { get; set; } = "ERG"; // ERG, VEP, EOG

        [Column("test_protocol")]
        [MaxLength(100)]
        public string? TestProtocol { get; set; }

        [Column("eye_tested")]
        [MaxLength(10)]
        [Required]
        public string EyeTested { get; set; } = "OU"; // OD, OS, OU

        // ERG Results
        [Column("scotopic_a_wave")]
        public decimal? ScotopicAWave { get; set; }

        [Column("scotopic_b_wave")]
        public decimal? ScotopicBWave { get; set; }

        [Column("photopic_a_wave")]
        public decimal? PhotopicAWave { get; set; }

        [Column("photopic_b_wave")]
        public decimal? PhotopicBWave { get; set; }

        [Column("flicker_response")]
        public decimal? FlickerResponse { get; set; }

        // VEP Results
        [Column("p100_latency")]
        public decimal? P100Latency { get; set; }

        [Column("p100_amplitude")]
        public decimal? P100Amplitude { get; set; }

        // EOG Results
        [Column("arden_ratio")]
        public decimal? ArdenRatio { get; set; }

        [Column("light_peak")]
        public decimal? LightPeak { get; set; }

        [Column("dark_trough")]
        public decimal? DarkTrough { get; set; }

        // Interpretation
        [Column("interpretation")]
        [MaxLength(100)]
        public string? Interpretation { get; set; } // Normal, Abnormal, Borderline

        [Column("abnormality_type")]
        [MaxLength(200)]
        public string? AbnormalityType { get; set; }

        // Data Storage
        [Column("waveform_data")]
        public string? WaveformData { get; set; } // JSON

        [Column("image_paths")]
        public string? ImagePaths { get; set; } // JSON array

        [Column("notes")]
        public string? Notes { get; set; }

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
