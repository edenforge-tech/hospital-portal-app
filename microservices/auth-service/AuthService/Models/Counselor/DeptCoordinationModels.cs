using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Models.Counselor
{
    // ============================================================================
    // DEPT COORDINATION REQUESTS - DTOs
    // ============================================================================

    public class DeptCoordinationRequestDto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid? BranchId { get; set; }
        public Guid? SessionId { get; set; }
        public Guid? ScheduleId { get; set; }
        public Guid PatientId { get; set; }
        public string? PatientName { get; set; }

        /// <summary>Admissions, Billing, Lab, Surgeon, Anesthesia, OT, Pharmacy, Radiology, Nursing</summary>
        public string Department { get; set; } = null!;
        public string RequestStatus { get; set; } = "Pending";  // Pending, Sent, InProgress, Completed, Rejected, Cancelled
        public string? RequestMessage { get; set; }
        public string? ResponseMessage { get; set; }
        public string? ResponseData { get; set; }  // JSONB string

        public Guid? RequestedBy { get; set; }
        public string? RequestedByName { get; set; }
        public Guid? RespondedBy { get; set; }
        public string? RespondedByName { get; set; }
        public DateTime? RequestedAt { get; set; }
        public DateTime? RespondedAt { get; set; }

        // Extended (migration 73)
        public string RequestType { get; set; } = "manual";
        public bool AutoCreated { get; set; }
        public string Priority { get; set; } = "normal";
        public string? ExternalRef { get; set; }
        public DateTime? ConfirmedAt { get; set; }
        public Guid? ConfirmedBy { get; set; }
        public int? WorkflowStep { get; set; }

        public string Status { get; set; } = "active";
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateDeptCoordinationRequestDto
    {
        [Required]
        public Guid PatientId { get; set; }

        public Guid? SessionId { get; set; }
        public Guid? ScheduleId { get; set; }

        [Required]
        [MaxLength(50)]
        /// <summary>Admissions, Billing, Lab, Surgeon, Anesthesia, OT, Pharmacy, Radiology, Nursing</summary>
        public string Department { get; set; } = null!;

        public string? RequestMessage { get; set; }

        /// <summary>Optional extra data (e.g. lab tests list as JSON array).</summary>
        public string? RequestData { get; set; }

        /// <summary>manual (default) or auto</summary>
        public string RequestType { get; set; } = "manual";

        /// <summary>normal (default), urgent, critical</summary>
        public string Priority { get; set; } = "normal";

        /// <summary>Which pre-admission workflow step this request belongs to (1-6). Optional.</summary>
        public int? WorkflowStep { get; set; }
    }

    public class UpdateDeptCoordinationRequestDto
    {
        [MaxLength(20)]
        public string? RequestStatus { get; set; }  // Sent, InProgress, Completed, Rejected, Cancelled

        public string? ResponseMessage { get; set; }

        /// <summary>JSONB extra response data (e.g. confirmed results, approval details).</summary>
        public string? ResponseData { get; set; }

        /// <summary>External reference (bed number, OT slot, etc.) when a dept confirms externally.</summary>
        public string? ExternalRef { get; set; }
    }

    /// <summary>
    /// Workflow status summary for a schedule — one record per dept, step-grouped.
    /// </summary>
    public class DeptWorkflowStatusDto
    {
        public Guid ScheduleId { get; set; }
        public int TotalSteps { get; set; } = 6;
        public int StepsCompleted { get; set; }
        public bool OnHold { get; set; }
        public string? HoldReason { get; set; }
        public bool AllDeptsClear { get; set; }

        /// <summary>Key = dept name (9 possible), Value = status for this schedule.</summary>
        public Dictionary<string, DeptStatusInfo> Departments { get; set; } = new();
    }

    public class DeptCoordinationSummaryDto
    {
        /// <summary>Key = department name, Value = latest request status for that dept.</summary>
        public Dictionary<string, DeptStatusInfo> Departments { get; set; } = new();
    }

    public class DeptStatusInfo
    {
        public string Status { get; set; } = "None";   // None, Pending, Sent, InProgress, Completed, Rejected
        public DateTime? LastUpdated { get; set; }
        public string? LatestMessage { get; set; }
        public Guid? LatestRequestId { get; set; }
    }

    public class DeptCoordinationListResponse
    {
        public List<DeptCoordinationRequestDto> Requests { get; set; } = new();
        public int TotalCount { get; set; }
    }
}
