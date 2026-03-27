using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Models.PerformanceReview
{
    public enum ReviewType
    {
        Probation,
        Annual,
        MidYear,
        Quarterly,
        ProjectBased,
        ExitReview
    }

    public enum ReviewStatus
    {
        Draft,
        PendingLevel1,
        PendingLevel2,
        PendingLevel3,
        Approved,
        Rejected,
        Cancelled
    }

    public enum ProbationDecision
    {
        Pending,
        Confirmed,
        Extended,
        Terminated
    }

    public class PerformanceReview
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid TenantId { get; set; }

        [Required]
        public Guid EmployeeId { get; set; }

        [Required]
        public Guid ReviewerId { get; set; }

        [Required]
        public ReviewType ReviewType { get; set; }

        [Required]
        public ReviewStatus Status { get; set; }

        public DateTime ReviewPeriodStart { get; set; }

        public DateTime ReviewPeriodEnd { get; set; }

        public DateTime? SubmittedAt { get; set; }

        public DateTime? ApprovedAt { get; set; }

        // 13 Weighted Criteria (Probation Review)
        public int? QualityOfWorkScore { get; set; } // Weight: 15%
        public int? ProductivityScore { get; set; } // Weight: 10%
        public int? TechnicalSkillsScore { get; set; } // Weight: 10%
        public int? CommunicationScore { get; set; } // Weight: 8%
        public int? TeamworkScore { get; set; } // Weight: 8%
        public int? InitiativeScore { get; set; } // Weight: 7%
        public int? ProblemSolvingScore { get; set; } // Weight: 7%
        public int? AdaptabilityScore { get; set; } // Weight: 7%
        public int? AttendancePunctualityScore { get; set; } // Weight: 7%
        public int? ProfessionalismScore { get; set; } // Weight: 7%
        public int? LearningDevelopmentScore { get; set; } // Weight: 6%
        public int? PolicyComplianceScore { get; set; } // Weight: 5%
        public int? CustomerServiceScore { get; set; } // Weight: 3%

        public double? WeightedScore { get; set; } // Calculated weighted average

        public string? StrengthsComments { get; set; }

        public string? AreasForImprovementComments { get; set; }

        public string? GoalsForNextPeriod { get; set; }

        public string? ReviewerComments { get; set; }

        public string? EmployeeComments { get; set; }

        // Probation-specific
        public ProbationDecision? ProbationDecision { get; set; }

        public DateTime? ProbationExtensionDate { get; set; }

        public string? ProbationNotes { get; set; }

        // Approval chain
        public Guid? Level1ApproverId { get; set; }
        public DateTime? Level1ApprovedAt { get; set; }
        public string? Level1Comments { get; set; }

        public Guid? Level2ApproverId { get; set; }
        public DateTime? Level2ApprovedAt { get; set; }
        public string? Level2Comments { get; set; }

        public Guid? Level3ApproverId { get; set; }
        public DateTime? Level3ApprovedAt { get; set; }
        public string? Level3Comments { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public Guid CreatedByUserId { get; set; }

        public Guid UpdatedByUserId { get; set; }

        public DateTime? DeletedAt { get; set; }

        public string Status_Audit { get; set; } = "active";
    }

    // DTOs
    public class CreatePerformanceReviewRequest
    {
        [Required]
        public Guid EmployeeId { get; set; }

        [Required]
        public Guid ReviewerId { get; set; }

        [Required]
        public ReviewType ReviewType { get; set; }

        [Required]
        public DateTime ReviewPeriodStart { get; set; }

        [Required]
        public DateTime ReviewPeriodEnd { get; set; }
    }

    public class UpdateReviewScoresRequest
    {
        [Range(1, 5)]
        public int? QualityOfWorkScore { get; set; }

        [Range(1, 5)]
        public int? ProductivityScore { get; set; }

        [Range(1, 5)]
        public int? TechnicalSkillsScore { get; set; }

        [Range(1, 5)]
        public int? CommunicationScore { get; set; }

        [Range(1, 5)]
        public int? TeamworkScore { get; set; }

        [Range(1, 5)]
        public int? InitiativeScore { get; set; }

        [Range(1, 5)]
        public int? ProblemSolvingScore { get; set; }

        [Range(1, 5)]
        public int? AdaptabilityScore { get; set; }

        [Range(1, 5)]
        public int? AttendancePunctualityScore { get; set; }

        [Range(1, 5)]
        public int? ProfessionalismScore { get; set; }

        [Range(1, 5)]
        public int? LearningDevelopmentScore { get; set; }

        [Range(1, 5)]
        public int? PolicyComplianceScore { get; set; }

        [Range(1, 5)]
        public int? CustomerServiceScore { get; set; }

        public string? StrengthsComments { get; set; }

        public string? AreasForImprovementComments { get; set; }

        public string? GoalsForNextPeriod { get; set; }

        public string? ReviewerComments { get; set; }
    }

    public class SubmitForApprovalRequest
    {
        [Required]
        public Guid Level1ApproverId { get; set; }

        public Guid? Level2ApproverId { get; set; }

        public Guid? Level3ApproverId { get; set; }
    }

    public class ApproveReviewRequest
    {
        [Required]
        public int ApprovalLevel { get; set; } // 1, 2, or 3

        public string? Comments { get; set; }

        [Required]
        public bool Approved { get; set; }
    }

    public class CompleteProbationRequest
    {
        [Required]
        public ProbationDecision Decision { get; set; }

        public DateTime? ExtensionDate { get; set; }

        public string? Notes { get; set; }
    }

    public class PerformanceReviewDto
    {
        public Guid Id { get; set; }

        public Guid EmployeeId { get; set; }

        public string EmployeeName { get; set; } = string.Empty;

        public Guid ReviewerId { get; set; }

        public string ReviewerName { get; set; } = string.Empty;

        public ReviewType ReviewType { get; set; }

        public ReviewStatus Status { get; set; }

        public DateTime ReviewPeriodStart { get; set; }

        public DateTime ReviewPeriodEnd { get; set; }

        public double? WeightedScore { get; set; }

        public Dictionary<string, int?> Scores { get; set; } = new();

        public string? StrengthsComments { get; set; }

        public string? AreasForImprovementComments { get; set; }

        public string? GoalsForNextPeriod { get; set; }

        public string? ReviewerComments { get; set; }

        public string? EmployeeComments { get; set; }

        public ProbationDecision? ProbationDecision { get; set; }

        public DateTime? ProbationExtensionDate { get; set; }

        public List<ApprovalStepDto> ApprovalChain { get; set; } = new();

        public DateTime CreatedAt { get; set; }

        public DateTime? SubmittedAt { get; set; }

        public DateTime? ApprovedAt { get; set; }
    }

    public class ApprovalStepDto
    {
        public int Level { get; set; }

        public Guid? ApproverId { get; set; }

        public string? ApproverName { get; set; }

        public DateTime? ApprovedAt { get; set; }

        public string? Comments { get; set; }

        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
    }

    public class ReviewStatisticsDto
    {
        public int TotalReviews { get; set; }

        public int PendingReviews { get; set; }

        public int CompletedReviews { get; set; }

        public int OverdueReviews { get; set; }

        public double AverageWeightedScore { get; set; }

        public Dictionary<ReviewType, int> ReviewsByType { get; set; } = new();

        public Dictionary<ReviewStatus, int> ReviewsByStatus { get; set; } = new();

        public List<PerformanceReviewDto> RecentReviews { get; set; } = new();
    }
}
