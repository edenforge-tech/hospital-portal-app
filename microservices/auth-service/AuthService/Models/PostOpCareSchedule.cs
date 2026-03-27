using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AuthService.Models.Domain;
using AuthService.Models.Identity;

namespace AuthService.Models
{
    /// <summary>
    /// Post-operative care schedule template for tracking recovery visits
    /// </summary>
    [Table("post_op_care_schedules")]
    public class PostOpCareSchedule
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

        [Column("surgery_id")]
        public Guid? SurgeryId { get; set; }

        [Required]
        [Column("surgery_type")]
        [MaxLength(100)]
        public string SurgeryType { get; set; } = null!; // Phacoemulsification, Vitrectomy, LASIK, etc.

        [Required]
        [Column("surgery_date")]
        public DateTime SurgeryDate { get; set; }

        [Required]
        [Column("surgery_eye")]
        [MaxLength(10)]
        public string SurgeryEye { get; set; } = null!; // OD, OS, OU

        [Required]
        [Column("surgeon_id")]
        public Guid SurgeonId { get; set; }

        [Column("instructions")]
        public string? Instructions { get; set; } // JSON array of instructions

        [Column("restrictions")]
        public string? Restrictions { get; set; } // JSON array of restrictions

        // Standard audit fields
        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [Required]
        [Column("created_by_user_id")]
        public Guid CreatedByUserId { get; set; }

        [Column("updated_by_user_id")]
        public Guid? UpdatedByUserId { get; set; }

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Navigation properties
        [ForeignKey("TenantId")]
        public virtual Domain.Tenant? Tenant { get; set; }

        [ForeignKey("PatientId")]
        public virtual Domain.Patient? Patient { get; set; }

        [ForeignKey("SurgeonId")]
        public virtual Identity.AppUser? Surgeon { get; set; }
    }
}
