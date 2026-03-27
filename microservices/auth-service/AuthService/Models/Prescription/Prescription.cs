using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AuthService.Models.Domain;
using AuthService.Models.Identity;

namespace AuthService.Models.Prescription
{
    [Table("prescription")]
    public class Prescription
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

        [Required]
        [Column("doctor_id")]
        public Guid DoctorId { get; set; }

        [Required]
        [Column("prescription_date")]
        public DateTime PrescriptionDate { get; set; }

        [Required]
        [Column("diagnosis")]
        public string Diagnosis { get; set; } = string.Empty;

        [Column("instructions")]
        public string? Instructions { get; set; }

        [Column("duration_days")]
        public int? DurationDays { get; set; }

        [Column("follow_up_date")]
        public DateTime? FollowUpDate { get; set; }

        [Required]
        [Column("status")]
        [MaxLength(50)]
        public string Status { get; set; } = "active"; // active, completed, cancelled, expired

        [Column("pharmacy_id")]
        public Guid? PharmacyId { get; set; }

        [Column("pharmacy_name")]
        [MaxLength(200)]
        public string? PharmacyName { get; set; }

        [Column("pharmacy_contact")]
        [MaxLength(100)]
        public string? PharmacyContact { get; set; }

        [Column("dispensed_date")]
        public DateTime? DispensedDate { get; set; }

        [Column("dispensed_by_user_id")]
        public Guid? DispensedByUserId { get; set; }

        [Column("notes")]
        public string? Notes { get; set; }

        [Column("is_printed")]
        public bool IsPrinted { get; set; } = false;

        [Column("printed_at")]
        public DateTime? PrintedAt { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("created_by_user_id")]
        public Guid? CreatedByUserId { get; set; }

        [Column("updated_by_user_id")]
        public Guid? UpdatedByUserId { get; set; }

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Navigation properties
        public virtual Patient? Patient { get; set; }
        public virtual AppUser? Doctor { get; set; }
        public virtual AppUser? DispensedByUser { get; set; }
        public virtual ICollection<PrescriptionMedication> Medications { get; set; } = new List<PrescriptionMedication>();
    }
}
