using AuthService.Models.BulkOperations;

namespace AuthService.Services
{
    public interface IBulkOperationsService
    {
        // User Bulk Operations
        Task<BulkOperationResponse<BulkUserCreate>> BulkCreateUsersAsync(BulkCreateUsersRequest request);
        Task<BulkOperationResponse<object>> BulkUpdateUsersAsync(BulkUpdateUsersRequest request);
        Task<BulkOperationResponse<int>> BulkDeleteUsersAsync(BulkDeleteRequest request);

        // Role Assignment Operations
        Task<BulkOperationResponse<object>> BulkAssignRolesAsync(BulkRoleAssignmentRequest request);
        Task<BulkOperationResponse<object>> BulkRemoveRolesAsync(BulkRoleAssignmentRequest request);

        // Permission Assignment Operations
        Task<BulkOperationResponse<object>> BulkAssignPermissionsAsync(BulkPermissionAssignmentRequest request);
        Task<BulkOperationResponse<object>> BulkRemovePermissionsAsync(BulkPermissionAssignmentRequest request);

        // Status Change Operations
        Task<BulkOperationResponse<object>> BulkChangeStatusAsync(BulkStatusChangeRequest request);

        // Import/Export Operations
        Task<BulkOperationResponse<object>> BulkImportAsync(BulkImportRequest request);
        Task<BulkExportResponse> BulkExportAsync(BulkExportRequest request);

        // Validation
        Task<BulkValidationResult> ValidateBulkOperationAsync<T>(BulkOperationRequest<T> request);

        // Progress Tracking
        Task<BulkOperationProgress?> GetOperationProgressAsync(string jobId);
        Task<List<BulkOperationJob>> GetActiveJobsAsync();
        Task<BulkOperationJob?> GetJobDetailsAsync(string jobId);

        // Generic Operations
        Task<BulkOperationResponse<T>> ExecuteBulkOperationAsync<T>(BulkOperationRequest<T> request);

        // Job Management
        Task<bool> CancelJobAsync(string jobId);
        Task<List<BulkOperationJob>> GetJobHistoryAsync(DateTime? fromDate = null, DateTime? toDate = null);
    }
}
