using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain
{
    /// <summary>
    /// Tracks inter-department coordination requests raised by counselors for surgery patients.
    /// Maps to: dept_coordination_requests table
    /// </summary>
    [Table("dept_coordination_requests")]
    public class DeptCoordinationRequest
    {
        [Column("id")]
        public Guid Id { get; set; }

        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Column("branch_id")]
        public Guid? BranchId { get; set; }

        // Links
        [Column("session_id")]
        public Guid? SessionId { get; set; }

        [Column("schedule_id")]
        public Guid? ScheduleId { get; set; }

        [Column("patient_id")]
        public Guid PatientId { get; set; }

        // Department & Status
        [Column("department")]
        [MaxLength(50)]
        public string Department { get; set; } = null!;
        // Values: Admissions, Billing, Lab, Surgeon, Anesthesia

        [Column("request_status")]
        [MaxLength(20)]
        public string RequestStatus { get; set; } = "Pending";
        // Values: Pending, Sent, InProgress, Completed, Rejected, Cancelled

        [Column("request_message")]
        public string? RequestMessage { get; set; }

        [Column("response_message")]
        public string? ResponseMessage { get; set; }

        [Column("response_data", TypeName = "jsonb")]
        public string? ResponseData { get; set; }

        // Actors
        [Column("requested_by")]
        public Guid? RequestedBy { get; set; }

        [Column("responded_by")]
        public Guid? RespondedBy { get; set; }

        [Column("requested_at")]
        public DateTime? RequestedAt { get; set; }

        [Column("responded_at")]
        public DateTime? RespondedAt { get; set; }

        // Extended fields (migration 73)
        [Column("request_type")]
        [MaxLength(50)]
        public string RequestType { get; set; } = "manual";

        [Column("auto_created")]
        public bool AutoCreated { get; set; } = false;

        [Column("priority")]
        [MaxLength(20)]
        public string Priority { get; set; } = "normal";
        // Values: normal, urgent, critical

        [Column("external_ref")]
        [MaxLength(100)]
        public string? ExternalRef { get; set; }

        [Column("confirmed_at")]
        public DateTime? ConfirmedAt { get; set; }

        [Column("confirmed_by")]
        public Guid? ConfirmedBy { get; set; }

        [Column("workflow_step")]
        public int? WorkflowStep { get; set; }

        // Standard columns
        [Column("status")]
        [MaxLength(30)]
        public string Status { get; set; } = "active";

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }

        [Column("created_by_user_id")]
        public Guid? CreatedByUserId { get; set; }

        [Column("updated_by_user_id")]
        public Guid? UpdatedByUserId { get; set; }

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }
    }
}
