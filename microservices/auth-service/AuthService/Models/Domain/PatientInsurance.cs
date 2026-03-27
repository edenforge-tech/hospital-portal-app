using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain;

[Table("patient_insurance")]
public class PatientInsurance
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
    [Column("provider_name")]
    [MaxLength(300)]
    public string ProviderName { get; set; } = string.Empty;

    [Required]
    [Column("policy_number")]
    [MaxLength(100)]
    public string PolicyNumber { get; set; } = string.Empty;

    [Column("group_number")]
    [MaxLength(100)]
    public string? GroupNumber { get; set; }

    [Column("policy_type")]
    [MaxLength(50)]
    public string PolicyType { get; set; } = "primary"; // primary, secondary, tertiary

    [Column("plan_name")]
    [MaxLength(200)]
    public string? PlanName { get; set; }

    [Column("subscriber_name")]
    [MaxLength(200)]
    public string? SubscriberName { get; set; }

    [Column("subscriber_id")]
    [MaxLength(100)]
    public string? SubscriberId { get; set; }

    [Column("subscriber_relation")]
    [MaxLength(50)]
    public string SubscriberRelation { get; set; } = "self"; // self, spouse, child, parent, other

    [Column("start_date")]
    public DateTime? StartDate { get; set; }

    [Column("end_date")]
    public DateTime? EndDate { get; set; }

    [Column("copay_amount")]
    public decimal? CopayAmount { get; set; }

    [Column("deductible_amount")]
    public decimal? DeductibleAmount { get; set; }

    [Column("deductible_met")]
    public decimal? DeductibleMet { get; set; }

    [Column("out_of_pocket_max")]
    public decimal? OutOfPocketMax { get; set; }

    [Column("out_of_pocket_met")]
    public decimal? OutOfPocketMet { get; set; }

    [Column("coverage_details")]
    [MaxLength(4000)]
    public string? CoverageDetails { get; set; }

    [Column("pre_auth_required")]
    public bool PreAuthRequired { get; set; } = false;

    [Column("pre_auth_number")]
    [MaxLength(100)]
    public string? PreAuthNumber { get; set; }

    [Column("contact_phone")]
    [MaxLength(30)]
    public string? ContactPhone { get; set; }

    [Column("notes")]
    [MaxLength(1000)]
    public string? Notes { get; set; }

    [Required]
    [Column("status")]
    [MaxLength(20)]
    public string Status { get; set; } = "active"; // active, inactive, expired, pending_verification

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

    [ForeignKey("PatientId")]
    public virtual Patient? Patient { get; set; }
}
