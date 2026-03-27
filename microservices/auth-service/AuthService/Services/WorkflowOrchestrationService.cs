using System;
using System.Linq;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using AuthService.Context;
using AuthService.Models.Counselor;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services
{
    public class WorkflowOrchestrationService : IWorkflowOrchestrationService
    {
        private readonly AppDbContext _context;
        private readonly IBranchCacheService _branchCache;

        // 18 Workflow States
        private static readonly string[] WorkflowStates = new[]
        {
            "SessionStarted", "AssessmentInProgress", "PackageBuilt", "DocumentsCollected",
            "TestsOrdered", "TestsCompleted", "FitnessClearanceObtained", "OTBooked",
            "PaymentInitiated", "PaymentCompleted", "InsuranceProcessing", "InsuranceApproved",
            "ConsentsSigned", "AdmissionScheduled", "ReadyForSurgery", "SessionCompleted",
            "OnHold", "Cancelled"
        };

        public WorkflowOrchestrationService(AppDbContext context, IBranchCacheService branchCache)
        {
            _context = context;
            _branchCache = branchCache;
        }

        // ==================== Workflow State Management ====================

        public async Task<WorkflowStateDto?> GetWorkflowBySessionIdAsync(Guid sessionId)
        {
            var workflow = await _context.CounselingWorkflowStates
                .FirstOrDefaultAsync(w => w.SessionId == sessionId && w.DeletedAt == null);
            
            return workflow != null ? ToWorkflowDto(workflow) : null;
        }

        public async Task<WorkflowStateDto> InitializeWorkflowAsync(InitializeWorkflowRequest request, Guid tenantId, Guid userId)
        {
            var branch = await _branchCache.GetDefaultBranchForTenantAsync(tenantId);
            if (branch == null)
                throw new InvalidOperationException("Branch not found for tenant");

            var workflow = new CounselingWorkflowState
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                BranchId = branch.Id,
                SessionId = request.SessionId,
                PatientId = request.PatientId,
                CurrentState = "SessionStarted",
                StagesPending = new[] { "Assessment", "PackageCreation", "DocumentCollection", "TestOrders", "OTBooking", "Payment", "Insurance", "Consents", "Admission" },
                StagesCompleted = Array.Empty<string>(),
                StagesBlocked = Array.Empty<string>(),
                ProgressPercentage = 0,
                MilestonesAchieved = 0,
                TotalMilestones = 16,
                HasBlockingIssues = false,
                BlockingIssueCount = 0,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = userId
            };

            _context.CounselingWorkflowStates.Add(workflow);

            // Create initial transition record
            var transition = new WorkflowStageTransition
            {
                Id = Guid.NewGuid(),
                TenantId = workflow.TenantId,
                WorkflowId = workflow.Id,
                SessionId = request.SessionId,
                FromState = "None",
                ToState = "SessionStarted",
                TriggeredBy = "SystemEvent",
                TriggerDetails = "Workflow initialized",
                TransitionedAt = DateTime.UtcNow,
                TransitionedByUserId = userId
            };

            _context.WorkflowStageTransitions.Add(transition);
            await _context.SaveChangesAsync();

            return ToWorkflowDto(workflow);
        }

        public async Task<WorkflowStateDto> UpdateWorkflowStageAsync(Guid sessionId, UpdateWorkflowStageRequest request, Guid userId)
        {
            var workflow = await _context.CounselingWorkflowStates
                .FirstOrDefaultAsync(w => w.SessionId == sessionId && w.DeletedAt == null);

            if (workflow == null)
                throw new InvalidOperationException("Workflow not found");

            string previousState = workflow.CurrentState;
            workflow.CurrentState = request.TargetState;
            workflow.UpdatedAt = DateTime.UtcNow;
            workflow.UpdatedByUserId = userId;

            // Update milestone timestamps based on state
            UpdateMilestoneTimestamp(workflow, request.TargetState);

            // Update progress
            workflow.MilestonesAchieved = CalculateMilestonesAchieved(workflow);
            workflow.ProgressPercentage = (workflow.MilestonesAchieved * 100) / workflow.TotalMilestones;

            // Create transition record
            var transition = new WorkflowStageTransition
            {
                Id = Guid.NewGuid(),
                TenantId = workflow.TenantId,
                WorkflowId = workflow.Id,
                SessionId = sessionId,
                FromState = previousState,
                ToState = request.TargetState,
                TriggeredBy = request.TriggeredBy,
                TransitionNotes = request.TransitionNotes,
                TransitionedAt = DateTime.UtcNow,
                TransitionedByUserId = userId
            };

            _context.WorkflowStageTransitions.Add(transition);
            await _context.SaveChangesAsync();

            return ToWorkflowDto(workflow);
        }

        public async Task<DependencyCheckResult> CheckDependenciesAsync(Guid sessionId)
        {
            // TODO: Implement comprehensive dependency checking across all 9 previous modules
            // For now, return basic result
            return new DependencyCheckResult
            {
                AllDependenciesMet = true,
                MissingDependencies = new List<string>(),
                BlockingIssues = new List<BlockingIssue>()
            };
        }

        public async Task<WorkflowProgressDto> GetWorkflowProgressAsync(Guid sessionId)
        {
            var workflow = await _context.CounselingWorkflowStates
                .FirstOrDefaultAsync(w => w.SessionId == sessionId && w.DeletedAt == null);

            if (workflow == null)
                throw new InvalidOperationException("Workflow not found");

            return new WorkflowProgressDto
            {
                SessionId = workflow.SessionId,
                CurrentState = workflow.CurrentState,
                ProgressPercentage = workflow.ProgressPercentage,
                MilestonesAchieved = workflow.MilestonesAchieved,
                TotalMilestones = workflow.TotalMilestones,
                MilestoneTimestamps = new Dictionary<string, DateTime?>
                {
                    ["AssessmentCompleted"] = workflow.AssessmentCompletedAt,
                    ["PackageBuilt"] = workflow.PackageBuiltAt,
                    ["DocumentsCollected"] = workflow.DocumentsCollectedAt,
                    ["TestsOrdered"] = workflow.TestsOrderedAt,
                    ["TestsCompleted"] = workflow.TestsCompletedAt,
                    ["FitnessObtained"] = workflow.FitnessObtainedAt,
                    ["OTBooked"] = workflow.OtBookedAt,
                    ["PaymentInitiated"] = workflow.PaymentInitiatedAt,
                    ["PaymentCompleted"] = workflow.PaymentCompletedAt,
                    ["InsuranceProcessed"] = workflow.InsuranceProcessedAt,
                    ["ConsentsSigned"] = workflow.ConsentsSignedAt,
                    ["AdmissionScheduled"] = workflow.AdmissionScheduledAt,
                    ["ReadyForSurgery"] = workflow.ReadyForSurgeryAt,
                    ["SessionCompleted"] = workflow.SessionCompletedAt
                },
                IsReadyForSurgery = workflow.CurrentState == "ReadyForSurgery" || workflow.CurrentState == "SessionCompleted"
            };
        }

        // ==================== Stage Transitions ====================

        public async Task<List<StageTransitionDto>> GetStageTransitionsAsync(Guid sessionId)
        {
            var transitions = await _context.WorkflowStageTransitions
                .Where(t => t.SessionId == sessionId)
                .OrderByDescending(t => t.TransitionedAt)
                .ToListAsync();

            return transitions.Select(ToTransitionDto).ToList();
        }

        // ==================== Blocking Issues ====================

        public async Task<List<BlockingIssue>> GetBlockingIssuesAsync(Guid sessionId)
        {
            // TODO: Implement blocking issue detection logic
            return new List<BlockingIssue>();
        }

        public async Task<bool> ResolveBlockingIssueAsync(Guid sessionId, string stageName, Guid userId)
        {
            var workflow = await _context.CounselingWorkflowStates
                .FirstOrDefaultAsync(w => w.SessionId == sessionId && w.DeletedAt == null);

            if (workflow == null) return false;

            workflow.BlockingIssueCount = Math.Max(0, workflow.BlockingIssueCount - 1);
            workflow.HasBlockingIssues = workflow.BlockingIssueCount > 0;
            workflow.UpdatedAt = DateTime.UtcNow;
            workflow.UpdatedByUserId = userId;

            await _context.SaveChangesAsync();
            return true;
        }

        // ==================== Helper Methods ====================

        private void UpdateMilestoneTimestamp(CounselingWorkflowState workflow, string state)
        {
            var now = DateTime.UtcNow;

            switch (state)
            {
                case "AssessmentInProgress":
                    workflow.AssessmentCompletedAt = now;
                    break;
                case "PackageBuilt":
                    workflow.PackageBuiltAt = now;
                    break;
                case "DocumentsCollected":
                    workflow.DocumentsCollectedAt = now;
                    break;
                case "TestsOrdered":
                    workflow.TestsOrderedAt = now;
                    break;
                case "TestsCompleted":
                    workflow.TestsCompletedAt = now;
                    break;
                case "FitnessClearanceObtained":
                    workflow.FitnessObtainedAt = now;
                    break;
                case "OTBooked":
                    workflow.OtBookedAt = now;
                    break;
                case "PaymentInitiated":
                    workflow.PaymentInitiatedAt = now;
                    break;
                case "PaymentCompleted":
                    workflow.PaymentCompletedAt = now;
                    break;
                case "InsuranceProcessing":
                    workflow.InsuranceProcessedAt = now;
                    break;
                case "ConsentsSigned":
                    workflow.ConsentsSignedAt = now;
                    break;
                case "AdmissionScheduled":
                    workflow.AdmissionScheduledAt = now;
                    break;
                case "ReadyForSurgery":
                    workflow.ReadyForSurgeryAt = now;
                    break;
                case "SessionCompleted":
                    workflow.SessionCompletedAt = now;
                    break;
            }
        }

        private int CalculateMilestonesAchieved(CounselingWorkflowState workflow)
        {
            int count = 0;
            if (workflow.AssessmentCompletedAt.HasValue) count++;
            if (workflow.PackageBuiltAt.HasValue) count++;
            if (workflow.DocumentsCollectedAt.HasValue) count++;
            if (workflow.TestsOrderedAt.HasValue) count++;
            if (workflow.TestsCompletedAt.HasValue) count++;
            if (workflow.FitnessObtainedAt.HasValue) count++;
            if (workflow.OtBookedAt.HasValue) count++;
            if (workflow.PaymentInitiatedAt.HasValue) count++;
            if (workflow.PaymentCompletedAt.HasValue) count++;
            if (workflow.InsuranceProcessedAt.HasValue) count++;
            if (workflow.ConsentsSignedAt.HasValue) count++;
            if (workflow.AdmissionScheduledAt.HasValue) count++;
            if (workflow.ReadyForSurgeryAt.HasValue) count++;
            if (workflow.SessionCompletedAt.HasValue) count++;
            return count;
        }

        private WorkflowStateDto ToWorkflowDto(CounselingWorkflowState workflow)
        {
            return new WorkflowStateDto
            {
                Id = workflow.Id,
                SessionId = workflow.SessionId,
                PatientId = workflow.PatientId,
                CurrentState = workflow.CurrentState,
                StagesCompleted = workflow.StagesCompleted?.ToList(),
                StagesPending = workflow.StagesPending?.ToList(),
                StagesBlocked = workflow.StagesBlocked?.ToList(),
                ProgressPercentage = workflow.ProgressPercentage,
                MilestonesAchieved = workflow.MilestonesAchieved,
                HasBlockingIssues = workflow.HasBlockingIssues,
                BlockingIssueCount = workflow.BlockingIssueCount,
                CreatedAt = workflow.CreatedAt,
                UpdatedAt = workflow.UpdatedAt
            };
        }

        private StageTransitionDto ToTransitionDto(WorkflowStageTransition transition)
        {
            return new StageTransitionDto
            {
                Id = transition.Id,
                WorkflowId = transition.WorkflowId,
                SessionId = transition.SessionId,
                FromState = transition.FromState,
                ToState = transition.ToState,
                TriggeredBy = transition.TriggeredBy,
                TransitionNotes = transition.TransitionNotes,
                TransitionedAt = transition.TransitionedAt
            };
        }
    }
}
