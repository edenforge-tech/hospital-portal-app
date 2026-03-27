using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AuthService.Models.Domain;
using AuthService.Models.Identity;

namespace AuthService.Models
{
    /// <summary>
    /// Individual post-operative visit record with clinical findings
    /// </summary>
    [Table("post_op_visits")]
    public class PostOpVisit
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Required]
        [Column("post_op_care_schedule_id")]
        public Guid PostOpCareScheduleId { get; set; }

        [Required]
        [Column("visit_name")]
        [MaxLength(50)]
        public string VisitName { get; set; } = null!; // Day 1 Post-Op, 1 Week Post-Op, 1 Month Post-Op, etc.

        [Required]
        [Column("scheduled_date")]
        public DateTime ScheduledDate { get; set; }

        [Required]
        [Column("completed")]
        public bool Completed { get; set; } = false;

        [Column("completed_date")]
        public DateTime? CompletedDate { get; set; }

        [Column("findings")]
        public string? Findings { get; set; }

        [Column("visual_acuity")]
        [MaxLength(50)]
        public string? VisualAcuity { get; set; }

        [Column("iop")]
        public decimal? IOP { get; set; } // Intraocular Pressure in mmHg

        [Column("complications")]
        public string? Complications { get; set; }

        [Column("examiner_id")]
        public Guid? ExaminerId { get; set; }

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

        [ForeignKey("PostOpCareScheduleId")]
        public virtual PostOpCareSchedule? PostOpCareSchedule { get; set; }

        [ForeignKey("ExaminerId")]
        public virtual Identity.AppUser? Examiner { get; set; }
    }
}
