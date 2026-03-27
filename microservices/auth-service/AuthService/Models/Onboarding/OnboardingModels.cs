using System;
using System.Collections.Generic;

namespace AuthService.Models.Onboarding
{
    // ==================== ENUMS ====================
    
    public enum OnboardingWorkflowStatus
    {
        NotStarted,
        InProgress,
        Completed,
        Cancelled
    }

    public enum ChecklistItemStatus
    {
        Pending,
        InProgress,
        Completed,
        Skipped
    }

    public enum AccessLevel
    {
        None,
        Day1,      // Basic read-only access on Day 1
        Day7,      // Limited write access after 7 days
        Day30,     // Full access after 30 days probation
        Custom     // Custom access configuration
    }

    // ==================== DOMAIN ENTITIES ====================

    /// <summary>
    /// Onboarding workflow for new employees
    /// </summary>
    public class OnboardingWorkflow
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string WorkflowName { get; set; } = string.Empty;
        public OnboardingWorkflowStatus Status { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? ExpectedCompletionDate { get; set; }
        public DateTime? ActualCompletionDate { get; set; }
        public int ProgressPercentage { get; set; }
        public Guid? MentorId { get; set; }
        public string? MentorName { get; set; }
        public AccessLevel CurrentAccessLevel { get; set; }
        public DateTime? Day1AccessGrantedAt { get; set; }
        public DateTime? Day7AccessGrantedAt { get; set; }
        public DateTime? Day30AccessGrantedAt { get; set; }
        public string Notes { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public Guid CreatedByUserId { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedByUserId { get; set; }
    }

    /// <summary>
    /// Individual checklist items within onboarding workflow
    /// </summary>
    public class OnboardingChecklistItem
    {
        public Guid Id { get; set; }
        public Guid WorkflowId { get; set; }
        public Guid TenantId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public ChecklistItemStatus Status { get; set; }
        public int OrderIndex { get; set; }
        public bool IsRequired { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? CompletedAt { get; set; }
        public Guid? CompletedByUserId { get; set; }
        public string? CompletionNotes { get; set; }
        public string Category { get; set; } = string.Empty; // "HR", "IT", "Training", "Compliance"
        public int DaysFromStart { get; set; } // When this item should be due (relative to start date)
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    /// <summary>
    /// Access level configuration for progressive access
    /// </summary>
    public class AccessLevelConfiguration
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public AccessLevel Level { get; set; }
        public string LevelName { get; set; } = string.Empty;
        public List<string> PermissionCodes { get; set; } = new List<string>();
        public int DaysFromStart { get; set; }
        public bool RequiresApproval { get; set; }
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    // ==================== DTOs ====================

    /// <summary>
    /// Request to create a new onboarding workflow
    /// </summary>
    public class CreateOnboardingWorkflowRequest
    {
        public Guid UserId { get; set; }
        public string WorkflowName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime? ExpectedCompletionDate { get; set; }
        public Guid? MentorId { get; set; }
        public List<CreateChecklistItemRequest> ChecklistItems { get; set; } = new List<CreateChecklistItemRequest>();
        public string Notes { get; set; } = string.Empty;
    }

    public class CreateChecklistItemRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsRequired { get; set; }
        public int OrderIndex { get; set; }
        public string Category { get; set; } = string.Empty;
        public int DaysFromStart { get; set; }
    }

    /// <summary>
    /// Response with workflow details
    /// </summary>
    public class OnboardingWorkflowDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string WorkflowName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime? ExpectedCompletionDate { get; set; }
        public DateTime? ActualCompletionDate { get; set; }
        public int ProgressPercentage { get; set; }
        public Guid? MentorId { get; set; }
        public string? MentorName { get; set; }
        public string CurrentAccessLevel { get; set; } = string.Empty;
        public AccessLevelProgress AccessProgress { get; set; } = new AccessLevelProgress();
        public List<ChecklistItemDto> ChecklistItems { get; set; } = new List<ChecklistItemDto>();
        public int TotalItems { get; set; }
        public int CompletedItems { get; set; }
        public int PendingItems { get; set; }
        public int OverdueItems { get; set; }
        public string Notes { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class AccessLevelProgress
    {
        public bool Day1Granted { get; set; }
        public DateTime? Day1GrantedAt { get; set; }
        public bool Day7Granted { get; set; }
        public DateTime? Day7GrantedAt { get; set; }
        public bool Day30Granted { get; set; }
        public DateTime? Day30GrantedAt { get; set; }
        public string NextMilestone { get; set; } = string.Empty;
        public int DaysUntilNextMilestone { get; set; }
    }

    public class ChecklistItemDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public bool IsRequired { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string? CompletedByUserName { get; set; }
        public string? CompletionNotes { get; set; }
        public string Category { get; set; } = string.Empty;
        public bool IsOverdue { get; set; }
        public int DaysFromStart { get; set; }
    }

    /// <summary>
    /// Request to update workflow progress
    /// </summary>
    public class UpdateProgressRequest
    {
        public int ProgressPercentage { get; set; }
        public string Notes { get; set; } = string.Empty;
    }

    /// <summary>
    /// Request to complete a checklist item
    /// </summary>
    public class CompleteChecklistItemRequest
    {
        public string CompletionNotes { get; set; } = string.Empty;
    }

    /// <summary>
    /// Request to assign mentor
    /// </summary>
    public class AssignMentorRequest
    {
        public Guid MentorId { get; set; }
    }

    /// <summary>
    /// Request to grant progressive access
    /// </summary>
    public class GrantAccessRequest
    {
        public AccessLevel AccessLevel { get; set; }
        public string Notes { get; set; } = string.Empty;
    }

    /// <summary>
    /// Onboarding statistics for dashboard
    /// </summary>
    public class OnboardingStatsDto
    {
        public int TotalActiveWorkflows { get; set; }
        public int CompletedThisMonth { get; set; }
        public int OverdueWorkflows { get; set; }
        public int AverageCompletionDays { get; set; }
        public Dictionary<string, int> StatusBreakdown { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> AccessLevelBreakdown { get; set; } = new Dictionary<string, int>();
        public List<OnboardingWorkflowDto> RecentWorkflows { get; set; } = new List<OnboardingWorkflowDto>();
    }
}
