using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain
{
    /// <summary>
    /// Protocol templates defining required pre-op tests by surgery type
    /// Stores JSONB list of required tests with urgency and mandatory flags
    /// </summary>
    [Table("preop_test_protocols")]
    public class PreOpTestProtocol
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        // Protocol Details
        [Required]
        [Column("protocol_name")]
        [MaxLength(200)]
        public string ProtocolName { get; set; } = string.Empty;

        [Column("protocol_code")]
        [MaxLength(50)]
        public string? ProtocolCode { get; set; }

        [Required]
        [Column("surgery_type")]
        [MaxLength(100)]
        public string SurgeryType { get; set; } = string.Empty; // Cataract, Retinal, Glaucoma, etc.

        [Column("description")]
        public string? Description { get; set; }

        // Required Tests: [{"test_name": "ECG", "test_code": "ECG-001", "is_mandatory": true, "urgency": "Urgent"}]
        [Required]
        [Column("required_tests", TypeName = "jsonb")]
        public string RequiredTests { get; set; } = "[]";

        [Column("test_validity_days")]
        public int TestValidityDays { get; set; } = 30;

        // Status
        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("version")]
        public int Version { get; set; } = 1;

        // Audit Fields
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("created_by_user_id")]
        public Guid? CreatedByUserId { get; set; }

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [Column("updated_by_user_id")]
        public Guid? UpdatedByUserId { get; set; }

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Navigation Properties
        public virtual ICollection<PreOpTestOrder> Orders { get; set; } = new List<PreOpTestOrder>();
    }

    /// <summary>
    /// Pre-operative test orders created by counselors during counseling sessions
    /// Links to Lab module for actual test execution
    /// </summary>
    [Table("preop_test_orders")]
    public class PreOpTestOrder
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Column("branch_id")]
        public Guid? BranchId { get; set; }

        // Links
        [Required]
        [Column("session_id")]
        public Guid SessionId { get; set; }

        [Required]
        [Column("patient_id")]
        public Guid PatientId { get; set; }

        [Required]
        [Column("protocol_id")]
        public Guid ProtocolId { get; set; }

        [Column("lab_order_id")]
        public Guid? LabOrderId { get; set; } // Links to Lab module order

        // Order Details
        [Column("order_number")]
        [MaxLength(50)]
        public string? OrderNumber { get; set; } // Auto-generated: PREOP-BRANCH-YYYYMMDD-XXXX

        [Required]
        [Column("ordered_by_user_id")]
        public Guid OrderedByUserId { get; set; }

        [Column("ordered_at")]
        public DateTime OrderedAt { get; set; } = DateTime.UtcNow;

        // Results Status
        [Column("results_received")]
        public bool ResultsReceived { get; set; } = false;

        [Column("results_received_at")]
        public DateTime? ResultsReceivedAt { get; set; }

        [Column("results_within_normal")]
        public bool? ResultsWithinNormal { get; set; }

        [Column("cleared_for_surgery")]
        public bool ClearedForSurgery { get; set; } = false;

        // Notes
        [Column("special_instructions")]
        public string? SpecialInstructions { get; set; }

        [Column("counselor_notes")]
        public string? CounselorNotes { get; set; }

        [Column("document_url")]
        public string? DocumentUrl { get; set; }

        // Status: Ordered, InProgress, Completed, Cancelled
        [Column("status")]
        [MaxLength(30)]
        public string Status { get; set; } = "Ordered";

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

        [ForeignKey("ProtocolId")]
        public virtual PreOpTestProtocol? Protocol { get; set; }

        public virtual ICollection<PreOpTestResult> Results { get; set; } = new List<PreOpTestResult>();
        public virtual ICollection<PreOpFitnessClearance> FitnessClearances { get; set; } = new List<PreOpFitnessClearance>();
    }

    /// <summary>
    /// Individual test results from Lab module
    /// Stores values, normal ranges, abnormality flags, clinical significance
    /// </summary>
    [Table("preop_test_results")]
    public class PreOpTestResult
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        // Links
        [Required]
        [Column("order_id")]
        public Guid OrderId { get; set; }

        [Column("lab_test_result_id")]
        public Guid? LabTestResultId { get; set; } // Links to Lab module test result

        // Test Details
        [Required]
        [Column("test_name")]
        [MaxLength(200)]
        public string TestName { get; set; } = string.Empty;

        [Column("test_code")]
        [MaxLength(50)]
        public string? TestCode { get; set; }

        [Column("result_value")]
        [MaxLength(500)]
        public string? ResultValue { get; set; }

        [Column("result_unit")]
        [MaxLength(50)]
        public string? ResultUnit { get; set; }

        [Column("normal_range")]
        [MaxLength(200)]
        public string? NormalRange { get; set; }

        // Flags
        [Column("is_abnormal")]
        public bool IsAbnormal { get; set; } = false;

        [Column("severity")]
        [MaxLength(20)]
        public string? Severity { get; set; } // Normal, BorderlineHigh, BorderlineLow, Abnormal, Critical

        [Column("requires_clearance")]
        public bool RequiresClearance { get; set; } = false;

        // Interpretation
        [Column("interpretation")]
        public string? Interpretation { get; set; }

        [Column("clinical_significance")]
        public string? ClinicalSignificance { get; set; }

        // Status
        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "active";

        // Audit Fields
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Navigation Properties
        [ForeignKey("OrderId")]
        public virtual PreOpTestOrder? Order { get; set; }
    }

    /// <summary>
    /// Medical fitness clearances for abnormal test results
    /// Manages referrals to specialists and clearance workflow
    /// </summary>
    [Table("preop_fitness_clearances")]
    public class PreOpFitnessClearance
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Column("branch_id")]
        public Guid? BranchId { get; set; }

        // Links
        [Required]
        [Column("order_id")]
        public Guid OrderId { get; set; }

        [Required]
        [Column("session_id")]
        public Guid SessionId { get; set; }

        [Required]
        [Column("patient_id")]
        public Guid PatientId { get; set; }

        // Clearance Request
        [Column("clearance_type")]
        [MaxLength(50)]
        public string? ClearanceType { get; set; } // Cardiac, Pulmonary, Endocrine, Nephrology, General Physician, Anesthesia

        [Column("abnormal_tests")]
        public string? AbnormalTests { get; set; } // Comma-separated list

        [Required]
        [Column("reason_for_clearance")]
        public string ReasonForClearance { get; set; } = string.Empty;

        // Referral
        [Column("referred_to_specialty")]
        [MaxLength(100)]
        public string? ReferredToSpecialty { get; set; }

        [Column("referred_to_doctor_id")]
        public Guid? ReferredToDoctorId { get; set; }

        [Column("referral_date")]
        public DateTime? ReferralDate { get; set; }

        // Clearance Status
        [Column("clearance_obtained")]
        public bool ClearanceObtained { get; set; } = false;

        [Column("cleared_by_doctor_id")]
        public Guid? ClearedByDoctorId { get; set; }

        [Column("cleared_at")]
        public DateTime? ClearedAt { get; set; }

        [Column("clearance_notes")]
        public string? ClearanceNotes { get; set; }

        [Column("clearance_valid_until")]
        public DateTime? ClearanceValidUntil { get; set; }

        // Conditions
        [Column("surgery_clearance_conditions")]
        public string? SurgeryClearanceConditions { get; set; } // e.g., "Patient to continue medications on surgery day"

        [Column("anesthesia_precautions")]
        public string? AnesthesiaPrecautions { get; set; }

        // Status: Pending, Referred, Cleared, ConditionallyCleared, Denied
        [Column("status")]
        [MaxLength(30)]
        public string Status { get; set; } = "Pending";

        [Column("priority")]
        [MaxLength(20)]
        public string Priority { get; set; } = "Normal"; // Routine, Urgent, Emergency

        // Audit Fields
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Navigation Properties
        [ForeignKey("OrderId")]
        public virtual PreOpTestOrder? Order { get; set; }

        [ForeignKey("SessionId")]
        public virtual CounselingSession? CounselingSession { get; set; }
    }
}
