using AuthService.Models.Training;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AuthService.Services
{
    public interface ITrainingManagementService
    {
        Task<TrainingAssignmentDto> AssignTrainingAsync(AssignTrainingRequest request, Guid tenantId, Guid currentUserId);
        
        Task<TrainingAssignmentDto> RecordCompletionAsync(Guid assignmentId, RecordCompletionRequest request, Guid tenantId, Guid currentUserId);
        
        Task<ComplianceReportDto> GetUserComplianceReportAsync(Guid userId, Guid tenantId);
        
        Task<List<ComplianceReportDto>> GetTenantComplianceReportAsync(Guid tenantId);
        
        Task<List<UserCredentialDto>> GetExpiringCredentialsAsync(Guid tenantId, int daysAhead = 30);
        
        Task AutoSuspendExpiredCredentialsAsync(Guid tenantId);
        
        Task<List<TrainingAssignmentDto>> GetUserAssignmentsAsync(Guid userId, Guid tenantId);
        
        Task<TrainingStatisticsDto> GetTrainingStatisticsAsync(Guid tenantId);
    }
}
