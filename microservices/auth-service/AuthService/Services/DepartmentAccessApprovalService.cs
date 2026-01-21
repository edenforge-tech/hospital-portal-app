using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services;

/// <summary>
/// Manages department access approval workflow (request/approve/reject)
/// Implements approval requirements from section 3.2 Department Access Hierarchy
/// </summary>
public interface IDepartmentAccessApprovalService
{
    Task<AccessRequestResult> RequestAccessAsync(AccessRequestDto request, Guid requesterId);
    Task<List<AccessRequestSummary>> GetPendingApprovalsAsync(Guid approverId, Guid tenantId);
    Task<List<AccessRequestSummary>> GetUserRequestsAsync(Guid userId, Guid tenantId);
    Task<ApprovalResult> ApproveRequestAsync(Guid requestId, Guid approverId, string notes);
    Task<ApprovalResult> RejectRequestAsync(Guid requestId, Guid approverId, string reason);
    Task<ApprovalResult> CancelRequestAsync(Guid requestId, Guid requesterId);
}

public class DepartmentAccessApprovalService : IDepartmentAccessApprovalService
{
    private readonly AppDbContext _context;
    private readonly IDepartmentAccessValidationService _validationService;
    private readonly IDepartmentAccessAuditService _auditService;
    private readonly ILogger<DepartmentAccessApprovalService> _logger;

    public DepartmentAccessApprovalService(
        AppDbContext context,
        IDepartmentAccessValidationService validationService,
        IDepartmentAccessAuditService auditService,
        ILogger<DepartmentAccessApprovalService> logger)
    {
        _context = context;
        _validationService = validationService;
        _auditService = auditService;
        _logger = logger;
    }

    public async Task<AccessRequestResult> RequestAccessAsync(AccessRequestDto request, Guid requesterId)
    {
        var result = new AccessRequestResult();

        try
        {
            // Validate the request first
            var validation = await _validationService.ValidateDepartmentAccessAsync(
                request.UserId, request.DepartmentId, request.TenantId);

            if (!validation.IsValid)
            {
                result.Success = false;
                result.Errors = validation.Errors;
                return result;
            }

            // Check if user already has access
            var existingAccess = await _context.UserDepartments
                .AnyAsync(ud => ud.UserId == request.UserId 
                    && ud.DepartmentId == request.DepartmentId 
                    && ud.DeletedAt == null);

            if (existingAccess)
            {
                result.Success = false;
                result.Errors.Add("User already has access to this department");
                return result;
            }

            // Check if pending request already exists
            var pendingRequest = await _context.Set<DepartmentAccessRequest>()
                .AnyAsync(dar => dar.UserId == request.UserId 
                    && dar.DepartmentId == request.DepartmentId 
                    && dar.Status == "Pending"
                    && dar.DeletedAt == null);

            if (pendingRequest)
            {
                result.Success = false;
                result.Errors.Add("A pending access request already exists for this department");
                return result;
            }

            // Create access request
            var accessRequest = new DepartmentAccessRequest
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                DepartmentId = request.DepartmentId,
                TenantId = request.TenantId,
                BranchId = request.BranchId,
                RequestType = "New",
                Justification = request.Justification,
                RequestedAccessType = request.RequestedAccessType,
                RequestedCanView = request.Permissions.CanView,
                RequestedCanCreate = request.Permissions.CanCreate,
                RequestedCanEdit = request.Permissions.CanEdit,
                RequestedCanDelete = request.Permissions.CanDelete,
                RequestedCanApprove = request.Permissions.CanApprove,
                RequestedCanExport = request.Permissions.CanExport,
                RequestedAccessStartDate = request.StartDate,
                RequestedAccessEndDate = request.EndDate,
                Status = validation.RequiresApproval ? "Pending" : "Approved",
                Priority = request.Priority ?? "Normal",
                AutoApproved = !validation.RequiresApproval,
                AutoApprovalReason = !validation.RequiresApproval ? "No approval required per department access rules" : null,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = requesterId
            };

            _context.Set<DepartmentAccessRequest>().Add(accessRequest);
            await _context.SaveChangesAsync();

            // Audit log
            await _auditService.LogAccessChangeAsync(new AccessAuditDto
            {
                UserId = request.UserId,
                DepartmentId = request.DepartmentId,
                TenantId = request.TenantId,
                Action = "Requested",
                ActionCategory = "Workflow",
                NewState = new
                {
                    request.RequestedAccessType,
                    request.Permissions
                },
                PerformedBy = requesterId,
                ComplianceNote = validation.ComplianceNote,
                ApprovalRequestId = accessRequest.Id
            });

            // If auto-approved, create the access immediately
            if (!validation.RequiresApproval)
            {
                await CreateDepartmentAccessFromRequestAsync(accessRequest, requesterId);
            }

            result.Success = true;
            result.RequestId = accessRequest.Id;
            result.RequestNumber = accessRequest.RequestNumber;
            result.RequiresApproval = validation.RequiresApproval;
            result.ApproverRoles = validation.ApproverRoles;
            result.Message = validation.RequiresApproval 
                ? $"Access request submitted. Awaiting approval from {string.Join(" or ", validation.ApproverRoles)}"
                : "Access granted automatically";

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating access request for user {UserId} to department {DeptId}", 
                request.UserId, request.DepartmentId);
            result.Success = false;
            result.Errors.Add("An error occurred while processing the request");
            return result;
        }
    }

    public async Task<List<AccessRequestSummary>> GetPendingApprovalsAsync(Guid approverId, Guid tenantId)
    {
        // Get approver's roles
        var approverRoles = await _context.UserRoles
            .Where(ur => ur.UserId == approverId)
            .Join(_context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name)
            .ToListAsync();

        // Get pending requests that the approver can handle
        var requests = await _context.Set<DepartmentAccessRequest>()
            .Where(dar => dar.TenantId == tenantId 
                && dar.Status == "Pending" 
                && dar.DeletedAt == null)
            .Include(dar => dar.User)
            .Include(dar => dar.Department)
            .OrderBy(dar => dar.CreatedAt)
            .ToListAsync();

        var summaries = new List<AccessRequestSummary>();

        foreach (var req in requests)
        {
            // Check if approver has permission to approve this request
            var approverRolesList = await _validationService.GetApproverRolesAsync(req.DepartmentId, tenantId);
            var canApprove = approverRoles.Any(role => approverRolesList.Contains(role));

            if (canApprove)
            {
                summaries.Add(new AccessRequestSummary
                {
                    Id = req.Id,
                    RequestNumber = req.RequestNumber,
                    UserId = req.UserId,
                    UserName = req.User?.UserName ?? "Unknown",
                    UserEmail = req.User?.Email ?? "",
                    DepartmentId = req.DepartmentId,
                    DepartmentName = req.Department?.DepartmentName ?? "Unknown",
                    DepartmentCode = req.Department?.DepartmentCode ?? "",
                    RequestType = req.RequestType,
                    Justification = req.Justification,
                    RequestedAccessType = req.RequestedAccessType,
                    RequestedPermissions = new AccessPermissions
                    {
                        CanView = req.RequestedCanView,
                        CanCreate = req.RequestedCanCreate,
                        CanEdit = req.RequestedCanEdit,
                        CanDelete = req.RequestedCanDelete,
                        CanApprove = req.RequestedCanApprove,
                        CanExport = req.RequestedCanExport
                    },
                    Status = req.Status,
                    Priority = req.Priority,
                    CreatedAt = req.CreatedAt,
                    DaysPending = (DateTime.UtcNow - req.CreatedAt).Days
                });
            }
        }

        return summaries;
    }

    public async Task<List<AccessRequestSummary>> GetUserRequestsAsync(Guid userId, Guid tenantId)
    {
        var requests = await _context.Set<DepartmentAccessRequest>()
            .Where(dar => dar.UserId == userId 
                && dar.TenantId == tenantId 
                && dar.DeletedAt == null)
            .Include(dar => dar.Department)
            .Include(dar => dar.ReviewedByUser)
            .OrderByDescending(dar => dar.CreatedAt)
            .ToListAsync();

        return requests.Select(req => new AccessRequestSummary
        {
            Id = req.Id,
            RequestNumber = req.RequestNumber,
            UserId = req.UserId,
            DepartmentId = req.DepartmentId,
            DepartmentName = req.Department?.DepartmentName ?? "Unknown",
            DepartmentCode = req.Department?.DepartmentCode ?? "",
            RequestType = req.RequestType,
            Justification = req.Justification,
            RequestedAccessType = req.RequestedAccessType,
            RequestedPermissions = new AccessPermissions
            {
                CanView = req.RequestedCanView,
                CanCreate = req.RequestedCanCreate,
                CanEdit = req.RequestedCanEdit,
                CanDelete = req.RequestedCanDelete,
                CanApprove = req.RequestedCanApprove,
                CanExport = req.RequestedCanExport
            },
            Status = req.Status,
            Priority = req.Priority,
            CreatedAt = req.CreatedAt,
            ReviewedAt = req.ReviewedAt,
            ReviewedBy = req.ReviewedByUser?.UserName,
            ReviewNotes = req.ReviewNotes,
            RejectionReason = req.RejectionReason,
            DaysPending = req.Status == "Pending" ? (DateTime.UtcNow - req.CreatedAt).Days : 0
        }).ToList();
    }

    public async Task<ApprovalResult> ApproveRequestAsync(Guid requestId, Guid approverId, string notes)
    {
        var result = new ApprovalResult();

        try
        {
            var request = await _context.Set<DepartmentAccessRequest>()
                .Include(dar => dar.User)
                .Include(dar => dar.Department)
                .FirstOrDefaultAsync(dar => dar.Id == requestId && dar.DeletedAt == null);

            if (request == null)
            {
                result.Success = false;
                result.Message = "Request not found";
                return result;
            }

            if (request.Status != "Pending")
            {
                result.Success = false;
                result.Message = $"Request cannot be approved (current status: {request.Status})";
                return result;
            }

            // Get approver role
            var approverRole = await _context.UserRoles
                .Where(ur => ur.UserId == approverId)
                .Join(_context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name)
                .FirstOrDefaultAsync();

            // Verify approver has permission
            var approverRoles = await _validationService.GetApproverRolesAsync(request.DepartmentId, request.TenantId);
            if (!approverRoles.Contains(approverRole))
            {
                result.Success = false;
                result.Message = $"Your role ({approverRole}) is not authorized to approve this request";
                return result;
            }

            // Update request status
            request.Status = "Approved";
            request.ReviewedBy = approverId;
            request.ReviewedAt = DateTime.UtcNow;
            request.ReviewerRole = approverRole;
            request.ReviewNotes = notes;
            request.UpdatedAt = DateTime.UtcNow;
            request.UpdatedBy = approverId;

            await _context.SaveChangesAsync();

            // Create the actual department access
            await CreateDepartmentAccessFromRequestAsync(request, approverId);

            // Audit log
            await _auditService.LogAccessChangeAsync(new AccessAuditDto
            {
                UserId = request.UserId,
                DepartmentId = request.DepartmentId,
                TenantId = request.TenantId,
                Action = "Approved",
                ActionCategory = "Workflow",
                PerformedBy = approverId,
                PerformedByRole = approverRole,
                Justification = notes,
                ApprovalRequestId = requestId,
                WasApproved = true,
                ApprovedBy = approverId,
                ApprovedAt = DateTime.UtcNow
            });

            result.Success = true;
            result.Message = $"Access request approved. {request.User?.UserName} now has access to {request.Department?.DepartmentName}";
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving request {RequestId}", requestId);
            result.Success = false;
            result.Message = "An error occurred while approving the request";
            return result;
        }
    }

    public async Task<ApprovalResult> RejectRequestAsync(Guid requestId, Guid approverId, string reason)
    {
        var result = new ApprovalResult();

        try
        {
            var request = await _context.Set<DepartmentAccessRequest>()
                .Include(dar => dar.User)
                .Include(dar => dar.Department)
                .FirstOrDefaultAsync(dar => dar.Id == requestId && dar.DeletedAt == null);

            if (request == null)
            {
                result.Success = false;
                result.Message = "Request not found";
                return result;
            }

            if (request.Status != "Pending")
            {
                result.Success = false;
                result.Message = $"Request cannot be rejected (current status: {request.Status})";
                return result;
            }

            // Get approver role
            var approverRole = await _context.UserRoles
                .Where(ur => ur.UserId == approverId)
                .Join(_context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name)
                .FirstOrDefaultAsync();

            // Update request status
            request.Status = "Rejected";
            request.ReviewedBy = approverId;
            request.ReviewedAt = DateTime.UtcNow;
            request.ReviewerRole = approverRole;
            request.RejectionReason = reason;
            request.UpdatedAt = DateTime.UtcNow;
            request.UpdatedBy = approverId;

            await _context.SaveChangesAsync();

            // Audit log
            await _auditService.LogAccessChangeAsync(new AccessAuditDto
            {
                UserId = request.UserId,
                DepartmentId = request.DepartmentId,
                TenantId = request.TenantId,
                Action = "Rejected",
                ActionCategory = "Workflow",
                PerformedBy = approverId,
                PerformedByRole = approverRole,
                Justification = reason,
                ApprovalRequestId = requestId,
                WasApproved = false
            });

            result.Success = true;
            result.Message = $"Access request rejected: {reason}";
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting request {RequestId}", requestId);
            result.Success = false;
            result.Message = "An error occurred while rejecting the request";
            return result;
        }
    }

    public async Task<ApprovalResult> CancelRequestAsync(Guid requestId, Guid requesterId)
    {
        var result = new ApprovalResult();

        try
        {
            var request = await _context.Set<DepartmentAccessRequest>()
                .FirstOrDefaultAsync(dar => dar.Id == requestId && dar.CreatedBy == requesterId && dar.DeletedAt == null);

            if (request == null)
            {
                result.Success = false;
                result.Message = "Request not found or you don't have permission to cancel it";
                return result;
            }

            if (request.Status != "Pending")
            {
                result.Success = false;
                result.Message = $"Request cannot be cancelled (current status: {request.Status})";
                return result;
            }

            request.Status = "Cancelled";
            request.UpdatedAt = DateTime.UtcNow;
            request.UpdatedBy = requesterId;

            await _context.SaveChangesAsync();

            result.Success = true;
            result.Message = "Access request cancelled";
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling request {RequestId}", requestId);
            result.Success = false;
            result.Message = "An error occurred while cancelling the request";
            return result;
        }
    }

    private async Task CreateDepartmentAccessFromRequestAsync(DepartmentAccessRequest request, Guid creatorId)
    {
        var departmentAccess = new UserDepartment
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            DepartmentId = request.DepartmentId,
            TenantId = request.TenantId,
            BranchId = request.BranchId,
            AccessType = request.RequestedAccessType,
            CanView = request.RequestedCanView,
            CanCreate = request.RequestedCanCreate,
            CanEdit = request.RequestedCanEdit,
            CanDelete = request.RequestedCanDelete,
            CanApprove = request.RequestedCanApprove,
            CanExport = request.RequestedCanExport,
            AccessStartDate = request.RequestedAccessStartDate,
            AccessEndDate = request.RequestedAccessEndDate,
            ApprovedBy = request.ReviewedBy,
            ApprovedAt = request.ReviewedAt,
            ApprovalNotes = request.ReviewNotes ?? request.AutoApprovalReason,
            Status = "active",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = creatorId
        };

        _context.UserDepartments.Add(departmentAccess);
        await _context.SaveChangesAsync();
    }
}

#region DTOs

public class AccessRequestDto
{
    public Guid UserId { get; set; }
    public Guid DepartmentId { get; set; }
    public Guid TenantId { get; set; }
    public Guid? BranchId { get; set; }
    public string Justification { get; set; } = string.Empty;
    public string RequestedAccessType { get; set; } = "Secondary";
    public AccessPermissions Permissions { get; set; } = new();
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Priority { get; set; }
}

public class AccessRequestResult
{
    public bool Success { get; set; }
    public Guid? RequestId { get; set; }
    public string? RequestNumber { get; set; }
    public bool RequiresApproval { get; set; }
    public List<string> ApproverRoles { get; set; } = new();
    public string Message { get; set; } = string.Empty;
    public List<string> Errors { get; set; } = new();
}

public class AccessRequestSummary
{
    public Guid Id { get; set; }
    public string RequestNumber { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public Guid DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string DepartmentCode { get; set; } = string.Empty;
    public string RequestType { get; set; } = string.Empty;
    public string Justification { get; set; } = string.Empty;
    public string RequestedAccessType { get; set; } = string.Empty;
    public AccessPermissions RequestedPermissions { get; set; } = new();
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewedBy { get; set; }
    public string? ReviewNotes { get; set; }
    public string? RejectionReason { get; set; }
    public int DaysPending { get; set; }
}

public class ApprovalResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}

#endregion
