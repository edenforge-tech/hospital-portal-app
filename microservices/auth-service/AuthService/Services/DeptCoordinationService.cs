using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AuthService.Context;
using AuthService.Models.Counselor;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AuthService.Services
{
    public interface IDeptCoordinationService
    {
        Task<DeptCoordinationListResponse> GetByScheduleIdAsync(Guid scheduleId, Guid tenantId);
        Task<DeptCoordinationListResponse> GetBySessionIdAsync(Guid sessionId, Guid tenantId);
        Task<DeptCoordinationRequestDto?> GetByIdAsync(Guid id, Guid tenantId);
        Task<DeptCoordinationRequestDto> CreateRequestAsync(CreateDeptCoordinationRequestDto dto, Guid userId, Guid tenantId, Guid? branchId);
        Task<DeptCoordinationRequestDto?> RespondToRequestAsync(Guid id, UpdateDeptCoordinationRequestDto dto, Guid userId, Guid tenantId);
        Task<DeptCoordinationSummaryDto> GetDeptStatusSummaryAsync(Guid scheduleId, Guid tenantId);

        /// <summary>Auto-create one dept request per dept (9 depts) for a newly confirmed schedule.</summary>
        Task<List<DeptCoordinationRequestDto>> AutoCreateForScheduleAsync(
            Guid scheduleId, Guid patientId, Guid? sessionId, Guid tenantId, Guid? branchId, Guid createdByUserId);

        /// <summary>Get step-grouped workflow status (9 depts, 6 steps) for a schedule.</summary>
        Task<DeptWorkflowStatusDto> GetWorkflowStatusAsync(Guid scheduleId, Guid tenantId);
    }

    public class DeptCoordinationService : IDeptCoordinationService
    {
        private readonly AppDbContext _context;
        private readonly INotificationService _notificationService;
        private readonly ILogger<DeptCoordinationService> _logger;

        // All 9 departments supported after migration 73
        private static readonly string[] AllDepartments =
        {
            "Admissions", "Billing", "Lab", "Surgeon", "Anesthesia",
            "OT", "Pharmacy", "Radiology", "Nursing"
        };

        // Maps each dept to the counselor role(s) that should be notified on a response
        private static readonly Dictionary<string, string> DeptRoleNotifyMap = new()
        {
            { "Admissions",  "counselor" },
            { "Billing",     "counselor" },
            { "Lab",         "counselor" },
            { "Surgeon",     "counselor" },
            { "Anesthesia",  "counselor" },
            { "OT",          "counselor" },
            { "Pharmacy",    "counselor" },
            { "Radiology",   "counselor" },
            { "Nursing",     "counselor" },
        };

        public DeptCoordinationService(
            AppDbContext context,
            INotificationService notificationService,
            ILogger<DeptCoordinationService> logger)
        {
            _context = context;
            _notificationService = notificationService;
            _logger = logger;
        }

        public async Task<DeptCoordinationListResponse> GetByScheduleIdAsync(Guid scheduleId, Guid tenantId)
        {
            var requests = await _context.DeptCoordinationRequests
                .Where(r => r.ScheduleId == scheduleId && r.TenantId == tenantId && r.DeletedAt == null)
                .OrderBy(r => r.Department)
                .ThenByDescending(r => r.CreatedAt)
                .ToListAsync();

            return await EnrichAndMapAsync(requests, tenantId);
        }

        public async Task<DeptCoordinationListResponse> GetBySessionIdAsync(Guid sessionId, Guid tenantId)
        {
            var requests = await _context.DeptCoordinationRequests
                .Where(r => r.SessionId == sessionId && r.TenantId == tenantId && r.DeletedAt == null)
                .OrderBy(r => r.Department)
                .ThenByDescending(r => r.CreatedAt)
                .ToListAsync();

            return await EnrichAndMapAsync(requests, tenantId);
        }

        public async Task<DeptCoordinationRequestDto?> GetByIdAsync(Guid id, Guid tenantId)
        {
            var request = await _context.DeptCoordinationRequests
                .FirstOrDefaultAsync(r => r.Id == id && r.TenantId == tenantId && r.DeletedAt == null);

            if (request == null) return null;

            var result = await EnrichAndMapAsync(new List<DeptCoordinationRequest> { request }, tenantId);
            return result.Requests.FirstOrDefault();
        }

        public async Task<DeptCoordinationRequestDto> CreateRequestAsync(
            CreateDeptCoordinationRequestDto dto, Guid userId, Guid tenantId, Guid? branchId)
        {
            var entity = new DeptCoordinationRequest
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                BranchId = branchId,
                SessionId = dto.SessionId,
                ScheduleId = dto.ScheduleId,
                PatientId = dto.PatientId,
                Department = dto.Department,
                RequestStatus = "Sent",
                RequestMessage = dto.RequestMessage,
                RequestType = dto.RequestType ?? "manual",
                AutoCreated = false,
                Priority = dto.Priority ?? "normal",
                WorkflowStep = dto.WorkflowStep,
                RequestedBy = userId,
                RequestedAt = DateTime.UtcNow,
                Status = "active",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedByUserId = userId,
                UpdatedByUserId = userId
            };

            _context.DeptCoordinationRequests.Add(entity);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created dept coordination request {Id} for dept {Dept}", entity.Id, entity.Department);

            var result = await GetByIdAsync(entity.Id, tenantId);
            return result!;
        }

        public async Task<DeptCoordinationRequestDto?> RespondToRequestAsync(
            Guid id, UpdateDeptCoordinationRequestDto dto, Guid userId, Guid tenantId)
        {
            var entity = await _context.DeptCoordinationRequests
                .FirstOrDefaultAsync(r => r.Id == id && r.TenantId == tenantId && r.DeletedAt == null);

            if (entity == null) return null;

            if (dto.RequestStatus != null) entity.RequestStatus = dto.RequestStatus;
            if (dto.ResponseMessage != null) entity.ResponseMessage = dto.ResponseMessage;
            if (dto.ResponseData != null) entity.ResponseData = dto.ResponseData;
            if (dto.ExternalRef != null) entity.ExternalRef = dto.ExternalRef;
            entity.RespondedBy = userId;
            entity.RespondedAt = DateTime.UtcNow;
            entity.UpdatedAt = DateTime.UtcNow;
            entity.UpdatedByUserId = userId;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated dept coordination request {Id} to status {Status}", id, dto.RequestStatus);

            // Notify counselors in the tenant that a dept has responded
            if (!string.IsNullOrEmpty(dto.RequestStatus) && entity.TenantId != Guid.Empty)
            {
                var notifyRole = DeptRoleNotifyMap.TryGetValue(entity.Department, out var r) ? r : "counselor";
                _ = _notificationService.NotifyRoleAsync(
                    entity.TenantId,
                    notifyRole,
                    "DeptCoordResponse",
                    $"{entity.Department} responded: {dto.RequestStatus}",
                    $"{{\"scheduleId\":\"{entity.ScheduleId}\",\"requestId\":\"{entity.Id}\",\"department\":\"{entity.Department}\",\"status\":\"{dto.RequestStatus}\"}}");
            }

            return await GetByIdAsync(id, tenantId);
        }

        public async Task<DeptCoordinationSummaryDto> GetDeptStatusSummaryAsync(Guid scheduleId, Guid tenantId)
        {
            var requests = await _context.DeptCoordinationRequests
                .Where(r => r.ScheduleId == scheduleId && r.TenantId == tenantId && r.DeletedAt == null)
                .OrderByDescending(r => r.UpdatedAt)
                .ToListAsync();

            var summary = new DeptCoordinationSummaryDto();

            foreach (var dept in AllDepartments)
            {
                var latest = requests.FirstOrDefault(r => r.Department == dept);
                if (latest == null)
                {
                    summary.Departments[dept] = new DeptStatusInfo { Status = "None" };
                }
                else
                {
                    summary.Departments[dept] = new DeptStatusInfo
                    {
                        Status = latest.RequestStatus,
                        LastUpdated = latest.UpdatedAt,
                        LatestMessage = latest.ResponseMessage ?? latest.RequestMessage,
                        LatestRequestId = latest.Id
                    };
                }
            }

            return summary;
        }

        public async Task<List<DeptCoordinationRequestDto>> AutoCreateForScheduleAsync(
            Guid scheduleId, Guid patientId, Guid? sessionId, Guid tenantId, Guid? branchId, Guid createdByUserId)
        {
            // Only create requests that don't already exist for this schedule
            var existing = await _context.DeptCoordinationRequests
                .Where(r => r.ScheduleId == scheduleId && r.TenantId == tenantId && r.DeletedAt == null)
                .Select(r => r.Department)
                .ToListAsync();

            var toCreate = AllDepartments.Where(d => !existing.Contains(d)).ToList();

            if (!toCreate.Any())
                return new List<DeptCoordinationRequestDto>();

            var now = DateTime.UtcNow;
            var entities = toCreate.Select(dept => new DeptCoordinationRequest
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                BranchId = branchId,
                SessionId = sessionId,
                ScheduleId = scheduleId,
                PatientId = patientId,
                Department = dept,
                RequestStatus = "Sent",
                RequestMessage = $"Surgery confirmed. Auto-notification to {dept} department.",
                RequestType = "auto",
                AutoCreated = true,
                Priority = "normal",
                RequestedBy = createdByUserId,
                RequestedAt = now,
                Status = "active",
                CreatedAt = now,
                UpdatedAt = now,
                CreatedByUserId = createdByUserId,
                UpdatedByUserId = createdByUserId
            }).ToList();

            _context.DeptCoordinationRequests.AddRange(entities);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Auto-created {Count} dept coordination requests for schedule {ScheduleId}",
                entities.Count, scheduleId);

            return entities.Select(e => new DeptCoordinationRequestDto
            {
                Id = e.Id,
                TenantId = e.TenantId,
                BranchId = e.BranchId,
                SessionId = e.SessionId,
                ScheduleId = e.ScheduleId,
                PatientId = e.PatientId,
                Department = e.Department,
                RequestStatus = e.RequestStatus,
                RequestMessage = e.RequestMessage,
                RequestType = e.RequestType,
                AutoCreated = e.AutoCreated,
                Priority = e.Priority,
                WorkflowStep = e.WorkflowStep,
                RequestedBy = e.RequestedBy,
                RequestedAt = e.RequestedAt,
                Status = e.Status,
                CreatedAt = e.CreatedAt,
                UpdatedAt = e.UpdatedAt
            }).ToList();
        }

        public async Task<DeptWorkflowStatusDto> GetWorkflowStatusAsync(Guid scheduleId, Guid tenantId)
        {
            var requests = await _context.DeptCoordinationRequests
                .Where(r => r.ScheduleId == scheduleId && r.TenantId == tenantId && r.DeletedAt == null)
                .OrderByDescending(r => r.UpdatedAt)
                .ToListAsync();

            var deptStatuses = new Dictionary<string, DeptStatusInfo>();
            foreach (var dept in AllDepartments)
            {
                var latest = requests.FirstOrDefault(r => r.Department == dept);
                deptStatuses[dept] = latest == null
                    ? new DeptStatusInfo { Status = "None" }
                    : new DeptStatusInfo
                    {
                        Status = latest.RequestStatus,
                        LastUpdated = latest.UpdatedAt,
                        LatestMessage = latest.ResponseMessage ?? latest.RequestMessage,
                        LatestRequestId = latest.Id
                    };
            }

            var completedDepts = deptStatuses.Count(kv => kv.Value.Status == "Completed");
            var allClear = completedDepts == AllDepartments.Length;

            // Check schedule-level hold flag
            var schedule = await _context.OTSchedules
                .Where(s => s.Id == scheduleId && s.TenantId == tenantId && s.DeletedAt == null)
                .Select(s => new { s.WorkflowOnHold, s.WorkflowHoldReason, s.WorkflowStepsCompleted })
                .FirstOrDefaultAsync();

            return new DeptWorkflowStatusDto
            {
                ScheduleId = scheduleId,
                TotalSteps = 6,
                StepsCompleted = schedule?.WorkflowStepsCompleted ?? 0,
                OnHold = schedule?.WorkflowOnHold ?? false,
                HoldReason = schedule?.WorkflowHoldReason,
                AllDeptsClear = allClear,
                Departments = deptStatuses
            };
        }

        // ────────────────────────────────────────────────────────────────────
        // Private helpers
        // ────────────────────────────────────────────────────────────────────

        private async Task<DeptCoordinationListResponse> EnrichAndMapAsync(
            List<DeptCoordinationRequest> requests, Guid tenantId)
        {
            if (!requests.Any())
                return new DeptCoordinationListResponse { Requests = new(), TotalCount = 0 };

            // Collect user IDs for names
            var userIds = requests
                .SelectMany(r => new[] { r.RequestedBy, r.RespondedBy })
                .Where(id => id.HasValue)
                .Select(id => id!.Value)
                .Distinct()
                .ToList();

            var userMap = userIds.Any()
                ? await _context.Users
                    .Where(u => userIds.Contains(u.Id))
                    .Select(u => new { u.Id, u.FirstName, u.LastName })
                    .ToDictionaryAsync(u => u.Id, u => $"{u.FirstName} {u.LastName}".Trim())
                : new Dictionary<Guid, string>();

            // Patient names
            var patientIds = requests.Select(r => r.PatientId).Distinct().ToList();
            var patientMap = await _context.Patients
                .Where(p => patientIds.Contains(p.Id))
                .Select(p => new { p.Id, Name = p.FirstName + " " + p.LastName })
                .ToDictionaryAsync(p => p.Id, p => p.Name.Trim());

            var dtos = requests.Select(r => new DeptCoordinationRequestDto
            {
                Id = r.Id,
                TenantId = r.TenantId,
                BranchId = r.BranchId,
                SessionId = r.SessionId,
                ScheduleId = r.ScheduleId,
                PatientId = r.PatientId,
                PatientName = patientMap.TryGetValue(r.PatientId, out var pn) ? pn : null,
                Department = r.Department,
                RequestStatus = r.RequestStatus,
                RequestMessage = r.RequestMessage,
                ResponseMessage = r.ResponseMessage,
                ResponseData = r.ResponseData,
                RequestType = r.RequestType,
                AutoCreated = r.AutoCreated,
                Priority = r.Priority,
                ExternalRef = r.ExternalRef,
                ConfirmedAt = r.ConfirmedAt,
                ConfirmedBy = r.ConfirmedBy,
                WorkflowStep = r.WorkflowStep,
                RequestedBy = r.RequestedBy,
                RequestedByName = r.RequestedBy.HasValue && userMap.TryGetValue(r.RequestedBy.Value, out var rbn) ? rbn : null,
                RespondedBy = r.RespondedBy,
                RespondedByName = r.RespondedBy.HasValue && userMap.TryGetValue(r.RespondedBy.Value, out var rsbn) ? rsbn : null,
                RequestedAt = r.RequestedAt,
                RespondedAt = r.RespondedAt,
                Status = r.Status,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt
            }).ToList();

            return new DeptCoordinationListResponse { Requests = dtos, TotalCount = dtos.Count };
        }
    }
}
