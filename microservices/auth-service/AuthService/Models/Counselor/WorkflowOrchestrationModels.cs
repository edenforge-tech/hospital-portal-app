using System;
using System.Collections.Generic;

namespace AuthService.Models.Counselor
{
    // ==================== Workflow State DTOs ====================
    
    public class WorkflowStateDto
    {
        public Guid Id { get; set; }
        public Guid SessionId { get; set; }
        public Guid PatientId { get; set; }
        public string CurrentState { get; set; } = "SessionStarted";
        public List<string>? StagesCompleted { get; set; }
        public List<string>? StagesPending { get; set; }
        public List<string>? StagesBlocked { get; set; }
        public int ProgressPercentage { get; set; }
        public int MilestonesAchieved { get; set; }
        public bool HasBlockingIssues { get; set; }
        public int BlockingIssueCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class InitializeWorkflowRequest
    {
        public Guid SessionId { get; set; }
        public Guid PatientId { get; set; }
    }

    public class UpdateWorkflowStageRequest
    {
        public string TargetState { get; set; } = null!;
        public string? TriggeredBy { get; set; } = "UserAction";
        public string? TransitionNotes { get; set; }
    }

    public class DependencyCheckResult
    {
        public bool AllDependenciesMet { get; set; }
        public List<string> MissingDependencies { get; set; } = new();
        public List<BlockingIssue> BlockingIssues { get; set; } = new();
    }

    public class BlockingIssue
    {
        public string StageName { get; set; } = null!;
        public string IssueDescription { get; set; } = null!;
        public string Severity { get; set; } = "Medium"; // Low, Medium, High, Critical
    }

    public class WorkflowProgressDto
    {
        public Guid SessionId { get; set; }
        public string CurrentState { get; set; } = null!;
        public int ProgressPercentage { get; set; }
        public int MilestonesAchieved { get; set; }
        public int TotalMilestones { get; set; }
        public Dictionary<string, DateTime?> MilestoneTimestamps { get; set; } = new();
        public bool IsReadyForSurgery { get; set; }
    }

    // ==================== Stage Transition DTOs ====================
    
    public class StageTransitionDto
    {
        public Guid Id { get; set; }
        public Guid WorkflowId { get; set; }
        public Guid SessionId { get; set; }
        public string FromState { get; set; } = null!;
        public string ToState { get; set; } = null!;
        public string? TriggeredBy { get; set; }
        public string? TransitionNotes { get; set; }
        public DateTime TransitionedAt { get; set; }
    }
}
