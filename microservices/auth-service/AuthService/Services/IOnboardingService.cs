using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AuthService.Models.Onboarding;

namespace AuthService.Services
{
    public interface IOnboardingService
    {
        // Workflow Management
        Task<OnboardingWorkflowDto> CreateWorkflowAsync(CreateOnboardingWorkflowRequest request, Guid tenantId, Guid createdByUserId);
        Task<OnboardingWorkflowDto> GetWorkflowByIdAsync(Guid workflowId, Guid tenantId);
        Task<OnboardingWorkflowDto> GetWorkflowByUserIdAsync(Guid userId, Guid tenantId);
        Task<List<OnboardingWorkflowDto>> GetAllWorkflowsAsync(Guid tenantId, OnboardingWorkflowStatus? status = null);
        Task<OnboardingWorkflowDto> UpdateProgressAsync(Guid workflowId, UpdateProgressRequest request, Guid tenantId, Guid updatedByUserId);
        Task<OnboardingWorkflowDto> CancelWorkflowAsync(Guid workflowId, Guid tenantId, Guid cancelledByUserId);
        
        // Checklist Items
        Task<ChecklistItemDto> CompleteChecklistItemAsync(Guid workflowId, Guid itemId, CompleteChecklistItemRequest request, Guid tenantId, Guid completedByUserId);
        Task<ChecklistItemDto> SkipChecklistItemAsync(Guid workflowId, Guid itemId, Guid tenantId, Guid skippedByUserId);
        Task<List<ChecklistItemDto>> GetChecklistItemsAsync(Guid workflowId, Guid tenantId);
        
        // Mentor Assignment
        Task<OnboardingWorkflowDto> AssignMentorAsync(Guid workflowId, AssignMentorRequest request, Guid tenantId, Guid assignedByUserId);
        
        // Progressive Access
        Task<OnboardingWorkflowDto> GrantProgressiveAccessAsync(Guid workflowId, GrantAccessRequest request, Guid tenantId, Guid grantedByUserId);
        Task<AccessLevelProgress> GetAccessProgressAsync(Guid workflowId, Guid tenantId);
        
        // Statistics
        Task<OnboardingStatsDto> GetOnboardingStatsAsync(Guid tenantId);
    }
}
