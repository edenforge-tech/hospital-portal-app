using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain
{
    /// <summary>
    /// Individual communication events between counselor and patient.
    /// Records every call, SMS, email, or in-person interaction.
    /// Maps to: counselor_communication_log table  (Migration 69)
    /// </summary>
    [Table("counselor_communication_log")]
    public class CounselorCommunicationLog
    {
        [Column("id")]
        public Guid Id { get; set; }

        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Column("session_id")]
        public Guid SessionId { get; set; }

        [Column("patient_id")]
        public Guid PatientId { get; set; }

        [Column("counselor_id")]
        public Guid CounselorId { get; set; }

        [Column("channel")]
        [MaxLength(30)]
        public string Channel { get; set; } = "Phone";
        // Phone | SMS | WhatsApp | Email | InPerson | VideoCall

        [Column("direction")]
        [MaxLength(10)]
        public string Direction { get; set; } = "Outbound";
        // Outbound | Inbound

        [Column("communication_at")]
        public DateTime CommunicationAt { get; set; } = DateTime.UtcNow;

        [Column("outcome")]
        [MaxLength(60)]
        public string Outcome { get; set; } = "Answered";
        // Answered | AnsweredInterested | AnsweredNotInterested | AnsweredCallbackNeeded
        // NoAnswer | Voicemail | Busy | WrongNumber | DeclinedContact | MessageSent

        [Column("call_duration_minutes")]
        public int? CallDurationMinutes { get; set; }

        [Column("message_body")]
        public string? MessageBody { get; set; }

        [Column("response_summary")]
        public string? ResponseSummary { get; set; }

        [Column("next_action")]
        [MaxLength(60)]
        public string? NextAction { get; set; }
        // ScheduleCallback | SendDocuments | EscalateToManager | WaitForPatient | BookSurgery | NoFurtherAction

        [Column("next_action_date", TypeName = "date")]
        public DateTime? NextActionDate { get; set; }

        [Column("template_id")]
        public Guid? TemplateId { get; set; }

        // Standard audit columns (HIPAA)
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("created_by_user_id")]
        public Guid CreatedByUserId { get; set; }

        [Column("updated_by_user_id")]
        public Guid UpdatedByUserId { get; set; }

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "active";

        // Navigation Properties
        public virtual CounselingSession? Session { get; set; }
    }

    /// <summary>
    /// Scheduled callback/follow-up call requests with lifecycle tracking.
    /// Maps to: counselor_callback_requests table  (Migration 70)
    /// </summary>
    [Table("counselor_callback_requests")]
    public class CounselorCallbackRequest
    {
        [Column("id")]
        public Guid Id { get; set; }

        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Column("session_id")]
        public Guid SessionId { get; set; }

        [Column("patient_id")]
        public Guid PatientId { get; set; }

        [Column("branch_id")]
        public Guid BranchId { get; set; }

        [Column("assigned_to_user_id")]
        public Guid AssignedToUserId { get; set; }

        [Column("callback_type")]
        [MaxLength(30)]
        public string CallbackType { get; set; } = "General";
        // PreSurgery | PostSurgery | General | Financial | FearAnxiety | DelayReason | InsuranceFollowup | DecisionPending

        [Column("channel")]
        [MaxLength(30)]
        public string Channel { get; set; } = "Phone";

        [Column("callback_date", TypeName = "date")]
        public DateTime CallbackDate { get; set; }

        [Column("callback_time")]
        public TimeSpan? CallbackTime { get; set; }

        [Column("callback_notes")]
        public string? CallbackNotes { get; set; }

        [Column("patient_preferred_time")]
        [MaxLength(60)]
        public string? PatientPreferredTime { get; set; }

        [Column("callback_status")]
        [MaxLength(20)]
        public string CallbackStatus { get; set; } = "Scheduled";
        // Scheduled | Completed | Missed | Rescheduled | Cancelled

        [Column("completed_at")]
        public DateTime? CompletedAt { get; set; }

        [Column("completed_by_user_id")]
        public Guid? CompletedByUserId { get; set; }

        [Column("outcome_notes")]
        public string? OutcomeNotes { get; set; }

        [Column("outcome")]
        [MaxLength(60)]
        public string? Outcome { get; set; }

        [Column("rescheduled_to_id")]
        public Guid? RescheduledToId { get; set; }

        [Column("rescheduled_from_id")]
        public Guid? RescheduledFromId { get; set; }

        [Column("reminder_sent_at")]
        public DateTime? ReminderSentAt { get; set; }

        [Column("patient_reminder_sent_at")]
        public DateTime? PatientReminderSentAt { get; set; }

        [Column("priority")]
        public short Priority { get; set; } = 2;

        // Standard audit columns (HIPAA)
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("created_by_user_id")]
        public Guid CreatedByUserId { get; set; }

        [Column("updated_by_user_id")]
        public Guid UpdatedByUserId { get; set; }

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "active";

        // Navigation Properties
        public virtual CounselingSession? Session { get; set; }
    }

    /// <summary>
    /// Reusable SMS/Email/WhatsApp message templates with placeholder substitution.
    /// Supports {{PATIENT_NAME}}, {{SURGERY_DATE}}, {{COUNSELOR_NAME}}, etc.
    /// Maps to: communication_message_templates table  (Migration 71)
    /// </summary>
    [Table("communication_message_templates")]
    public class CommunicationMessageTemplate
    {
        [Column("id")]
        public Guid Id { get; set; }

        [Column("tenant_id")]
        public Guid? TenantId { get; set; }

        [Column("template_name")]
        [MaxLength(120)]
        public string TemplateName { get; set; } = null!;

        [Column("template_category")]
        [MaxLength(60)]
        public string TemplateCategory { get; set; } = "General";

        [Column("channel")]
        [MaxLength(30)]
        public string Channel { get; set; } = "SMS";

        [Column("subject")]
        [MaxLength(200)]
        public string? Subject { get; set; }

        [Column("body")]
        public string Body { get; set; } = null!;

        [Column("delay_reason_target")]
        [MaxLength(60)]
        public string? DelayReasonTarget { get; set; }

        [Column("patient_type_target")]
        [MaxLength(30)]
        public string? PatientTypeTarget { get; set; }

        [Column("estimated_read_time_sec")]
        public int? EstimatedReadTimeSec { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("is_global")]
        public bool IsGlobal { get; set; } = false;

        [Column("requires_approval")]
        public bool RequiresApproval { get; set; } = false;

        // Standard audit columns (HIPAA)
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

        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "active";
    }
}
