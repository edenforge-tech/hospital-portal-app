using System;
using System.Collections.Generic;

namespace AuthService.Models.BulkOperations
{
    /// <summary>
    /// Bulk operation types
    /// </summary>
    public enum BulkOperationType
    {
        Create,
        Update,
        Delete,
        Activate,
        Deactivate,
        Import,
        Export
    }

    /// <summary>
    /// Entity types for bulk operations
    /// </summary>
    public enum BulkEntityType
    {
        Users,
        Roles,
        Permissions,
        Departments,
        Branches,
        Organizations,
        DocumentTypes,
        AccessRules,
        Configurations
    }

    /// <summary>
    /// Bulk operation request
    /// </summary>
    public class BulkOperationRequest<T>
    {
        public BulkOperationType OperationType { get; set; }
        public BulkEntityType EntityType { get; set; }
        public List<T> Items { get; set; } = new List<T>();
        public Dictionary<string, object>? Options { get; set; }
        public bool ContinueOnError { get; set; } = false;
        public bool ValidateBeforeExecute { get; set; } = true;
    }

    /// <summary>
    /// Bulk operation response
    /// </summary>
    public class BulkOperationResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int TotalRequested { get; set; }
        public int SuccessCount { get; set; }
        public int FailureCount { get; set; }
        public int SkippedCount { get; set; }
        public List<BulkOperationItemResult<T>> Results { get; set; } = new List<BulkOperationItemResult<T>>();
        public List<string> Errors { get; set; } = new List<string>();
        public DateTime StartedAt { get; set; }
        public DateTime CompletedAt { get; set; }
        public TimeSpan Duration => CompletedAt - StartedAt;
    }

    /// <summary>
    /// Individual item result in bulk operation
    /// </summary>
    public class BulkOperationItemResult<T>
    {
        public bool Success { get; set; }
        public T? Item { get; set; }
        public string? ItemIdentifier { get; set; }
        public string? ErrorMessage { get; set; }
        public int ItemIndex { get; set; }
    }

    /// <summary>
    /// Bulk user creation request
    /// </summary>
    public class BulkCreateUsersRequest
    {
        public List<BulkUserCreate> Users { get; set; } = new List<BulkUserCreate>();
        public bool SendWelcomeEmail { get; set; } = true;
        public bool RequirePasswordChange { get; set; } = true;
    }

    public class BulkUserCreate
    {
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public List<string> Roles { get; set; } = new List<string>();
        public List<Guid> DepartmentIds { get; set; } = new List<Guid>();
        public Guid? BranchId { get; set; }
    }

    /// <summary>
    /// Bulk role assignment request
    /// </summary>
    public class BulkRoleAssignmentRequest
    {
        public List<Guid> UserIds { get; set; } = new List<Guid>();
        public List<Guid> RoleIds { get; set; } = new List<Guid>();
        public bool ReplaceExisting { get; set; } = false;
    }

    /// <summary>
    /// Bulk permission assignment request
    /// </summary>
    public class BulkPermissionAssignmentRequest
    {
        public List<Guid> RoleIds { get; set; } = new List<Guid>();
        public List<string> PermissionCodes { get; set; } = new List<string>();
        public bool ReplaceExisting { get; set; } = false;
    }

    /// <summary>
    /// Bulk user update request
    /// </summary>
    public class BulkUpdateUsersRequest
    {
        public List<Guid> UserIds { get; set; } = new List<Guid>();
        public string? Status { get; set; }
        public Guid? BranchId { get; set; }
        public List<Guid>? DepartmentIds { get; set; }
        public Dictionary<string, object>? CustomFields { get; set; }
    }

    /// <summary>
    /// Bulk delete request
    /// </summary>
    public class BulkDeleteRequest
    {
        public BulkEntityType EntityType { get; set; }
        public List<Guid> Ids { get; set; } = new List<Guid>();
        public bool SoftDelete { get; set; } = true;
        public string? DeletionReason { get; set; }
    }

    /// <summary>
    /// Bulk activation/deactivation request
    /// </summary>
    public class BulkStatusChangeRequest
    {
        public BulkEntityType EntityType { get; set; }
        public List<Guid> Ids { get; set; } = new List<Guid>();
        public string NewStatus { get; set; } = string.Empty;
        public string? Reason { get; set; }
    }

    /// <summary>
    /// Bulk import request
    /// </summary>
    public class BulkImportRequest
    {
        public BulkEntityType EntityType { get; set; }
        public string FileFormat { get; set; } = "csv"; // csv, json, xml
        public string FileContent { get; set; } = string.Empty;
        public bool ValidateOnly { get; set; } = false;
        public bool SkipDuplicates { get; set; } = true;
        public Dictionary<string, string>? FieldMapping { get; set; }
    }

    /// <summary>
    /// Bulk export request
    /// </summary>
    public class BulkExportRequest
    {
        public BulkEntityType EntityType { get; set; }
        public string FileFormat { get; set; } = "csv";
        public List<Guid>? Ids { get; set; }
        public Dictionary<string, object>? Filters { get; set; }
        public List<string>? FieldsToInclude { get; set; }
    }

    /// <summary>
    /// Bulk export response
    /// </summary>
    public class BulkExportResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string FileFormat { get; set; } = string.Empty;
        public string FileContent { get; set; } = string.Empty;
        public string? FileName { get; set; }
        public int RecordCount { get; set; }
        public long FileSizeBytes { get; set; }
    }

    /// <summary>
    /// Bulk validation result
    /// </summary>
    public class BulkValidationResult
    {
        public bool IsValid { get; set; }
        public int TotalItems { get; set; }
        public int ValidItems { get; set; }
        public int InvalidItems { get; set; }
        public List<BulkValidationError> Errors { get; set; } = new List<BulkValidationError>();
        public List<BulkValidationWarning> Warnings { get; set; } = new List<BulkValidationWarning>();
    }

    /// <summary>
    /// Bulk validation error
    /// </summary>
    public class BulkValidationError
    {
        public int ItemIndex { get; set; }
        public string? ItemIdentifier { get; set; }
        public string Field { get; set; } = string.Empty;
        public string ErrorMessage { get; set; } = string.Empty;
        public string? ErrorCode { get; set; }
    }

    /// <summary>
    /// Bulk validation warning
    /// </summary>
    public class BulkValidationWarning
    {
        public int ItemIndex { get; set; }
        public string? ItemIdentifier { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    /// <summary>
    /// Bulk operation progress
    /// </summary>
    public class BulkOperationProgress
    {
        public Guid OperationId { get; set; }
        public BulkOperationType OperationType { get; set; }
        public BulkEntityType EntityType { get; set; }
        public string Status { get; set; } = "pending"; // pending, running, completed, failed
        public int TotalItems { get; set; }
        public int ProcessedItems { get; set; }
        public int SuccessCount { get; set; }
        public int FailureCount { get; set; }
        public double ProgressPercentage => TotalItems > 0 ? (ProcessedItems / (double)TotalItems * 100) : 0;
        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string? CurrentItem { get; set; }
        public List<string> RecentErrors { get; set; } = new List<string>();
    }

    /// <summary>
    /// Bulk operation job
    /// </summary>
    public class BulkOperationJob
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public BulkOperationType OperationType { get; set; }
        public BulkEntityType EntityType { get; set; }
        public string Status { get; set; } = "queued";
        public int TotalItems { get; set; }
        public int ProcessedItems { get; set; }
        public int SuccessCount { get; set; }
        public int FailureCount { get; set; }
        public string? ResultFilePath { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
}
