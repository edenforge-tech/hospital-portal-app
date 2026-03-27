using AuthService.Models.PerformanceReview;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AuthService.Services
{
    public interface IPerformanceReviewService
    {
        Task<PerformanceReviewDto> CreateReviewAsync(CreatePerformanceReviewRequest request, Guid tenantId, Guid currentUserId);
        
        Task<PerformanceReviewDto?> GetReviewByIdAsync(Guid reviewId, Guid tenantId);
        
        Task<List<PerformanceReviewDto>> GetReviewsByEmployeeIdAsync(Guid employeeId, Guid tenantId);
        
        Task<List<PerformanceReviewDto>> GetPendingReviewsAsync(Guid tenantId, Guid? reviewerId = null);
        
        Task<PerformanceReviewDto> UpdateReviewScoresAsync(Guid reviewId, UpdateReviewScoresRequest request, Guid tenantId, Guid currentUserId);
        
        Task<double> CalculateWeightedScoreAsync(Guid reviewId, Guid tenantId);
        
        Task<PerformanceReviewDto> SubmitForApprovalAsync(Guid reviewId, SubmitForApprovalRequest request, Guid tenantId, Guid currentUserId);
        
        Task<PerformanceReviewDto> ApproveReviewAsync(Guid reviewId, ApproveReviewRequest request, Guid tenantId, Guid currentUserId);
        
        Task<PerformanceReviewDto> CompleteProbationAsync(Guid reviewId, CompleteProbationRequest request, Guid tenantId, Guid currentUserId);
        
        Task<ReviewStatisticsDto> GetReviewStatisticsAsync(Guid tenantId);
        
        Task<bool> DeleteReviewAsync(Guid reviewId, Guid tenantId, Guid currentUserId);
    }
}
