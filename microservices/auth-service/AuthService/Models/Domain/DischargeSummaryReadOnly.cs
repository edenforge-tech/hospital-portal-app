using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain
{
    /// <summary>
    /// Read-only projection of the discharge_summary table (owned by ip-management-service).
    /// Added to auth-service AppDbContext so the Follow-up Center endpoint can show
    /// discharge context without a circular dependency.
    /// NO EF migrations are generated for this entity — the table was created by migration 85.
    /// </summary>
    [Table("discharge_summary")]
    public class DischargeSummaryReadOnly
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Column("patient_journey_id")]
        public Guid PatientJourneyId { get; set; }

        [Column("discharge_date", TypeName = "date")]
        public DateTime? DischargeDate { get; set; }

        [Column("condition_at_discharge")]
        [MaxLength(20)]
        public string? ConditionAtDischarge { get; set; } // Good / Stable / Fair / Guarded

        [Column("procedures_performed", TypeName = "jsonb")]
        public string? ProceduresPerformed { get; set; } // JSON array string

        [Column("summary_status")]
        [MaxLength(20)]
        public string? SummaryStatus { get; set; } // Draft / Final

        [Column("final_bill_amount", TypeName = "decimal(12,2)")]
        public decimal? FinalBillAmount { get; set; }

        [Column("finalized_at")]
        public DateTime? FinalizedAt { get; set; }

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }
    }
}
