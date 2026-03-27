using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AuthService.Models.Counselor;

namespace AuthService.Services
{
    public interface IWorkflowOrchestrationService
    {
        // Workflow State Management
        Task<WorkflowStateDto?> GetWorkflowBySessionIdAsync(Guid sessionId);
        Task<WorkflowStateDto> InitializeWorkflowAsync(InitializeWorkflowRequest request, Guid tenantId, Guid userId);
        Task<WorkflowStateDto> UpdateWorkflowStageAsync(Guid sessionId, UpdateWorkflowStageRequest request, Guid userId);
        Task<DependencyCheckResult> CheckDependenciesAsync(Guid sessionId);
        Task<WorkflowProgressDto> GetWorkflowProgressAsync(Guid sessionId);

        // Stage Transitions
        Task<List<StageTransitionDto>> GetStageTransitionsAsync(Guid sessionId);

        // Blocking Issues
        Task<List<BlockingIssue>> GetBlockingIssuesAsync(Guid sessionId);
        Task<bool> ResolveBlockingIssueAsync(Guid sessionId, string stageName, Guid userId);
    }
}
