using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace AuthService.Services
{
    public interface IEmergencyAccessService
    {
        Task<EmergencyAccess> RequestEmergencyAccessAsync(Guid userId, string reason, string emergencyType, Guid? patientId, int durationMinutes, List<string> grantedPermissions);
        Task<EmergencyAccess> ApproveEmergencyAccessAsync(Guid requestId, Guid approverId, string notes);
        Task<EmergencyAccess> RejectEmergencyAccessAsync(Guid requestId, Guid rejectorId, string reason);
        Task RevokeEmergencyAccessAsync(Guid requestId, Guid revokerId, string reason);
        Task<List<EmergencyAccess>> GetActiveEmergencyAccessAsync(Guid userId);
        Task<List<EmergencyAccess>> GetPendingApprovalsAsync(Guid approverId);
        Task AuditEmergencyUseAsync(Guid accessId, string action, Guid resourceId, string resourceType);
        Task<int> AutoRevokeExpiredAsync();
        Task NotifySupervisorsAsync(Guid accessId);
        Task<EmergencyAccess> ReviewEmergencyAccessAsync(Guid accessId, Guid reviewerId, string reviewStatus, string notes);
    }

    public class EmergencyAccessService : IEmergencyAccessService
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAuditService _auditService;

        public EmergencyAccessService(AppDbContext context, IHttpContextAccessor httpContextAccessor, IAuditService auditService)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _auditService = auditService;
        }

        private Guid GetCurrentTenantId()
        {
            var tenantId = _httpContextAccessor?.HttpContext?.Items["TenantId"] as Guid?;
            return tenantId ?? Guid.Parse("11111111-1111-1111-1111-111111111111");
        }

        public async Task<EmergencyAccess> RequestEmergencyAccessAsync(
            Guid userId, 
            string reason, 
            string emergencyType, 
            Guid? patientId, 
            int durationMinutes, 
            List<string> grantedPermissions)
        {
            var tenantId = GetCurrentTenantId();

            // Validate duration (max 240 minutes = 4 hours)
            if (durationMinutes > 240)
                throw new ArgumentException("Emergency access duration cannot exceed 240 minutes (4 hours)");

            if (durationMinutes < 15)
                throw new ArgumentException("Emergency access duration must be at least 15 minutes");

            var emergencyAccess = new EmergencyAccess
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                UserId = userId,
                AccessCode = GenerateAccessCode(),
                Reason = reason,
                EmergencyType = emergencyType,
                PatientId = patientId,
                GrantedPermissions = JsonSerializer.Serialize(grantedPermissions),
                Scope = grantedPermissions.Contains("*") ? "Full" : "Specific",
                StartTime = DateTime.UtcNow,
                DurationMinutes = durationMinutes,
                EndTime = DateTime.UtcNow.AddMinutes(durationMinutes),
                Status = "pending",
                RequiresApproval = true,
                AutoRevokeEnabled = true,
                RequiresReview = true,
                RiskLevel = "High",
                SuspiciousActivity = false,
                NotificationSent = false,
                AuditTrail = JsonSerializer.Serialize(new List<object>
                {
                    new { 
                        Timestamp = DateTime.UtcNow, 
                        Action = "Created", 
                        UserId = userId 
                    }
                }),
                ActionsPerformed = JsonSerializer.Serialize(new List<object>()),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.EmergencyAccesses.Add(emergencyAccess);
            await _context.SaveChangesAsync();

            // Log emergency access request
            await _auditService.LogSecurityEventAsync(
                userId,
                "EmergencyAccessRequested",
                "High",
                new Dictionary<string, object>
                {
                    { "AccessId", emergencyAccess.Id },
                    { "Reason", reason },
                    { "EmergencyType", emergencyType },
                    { "Duration", durationMinutes }
                }
            );

            // Notify supervisors
            await NotifySupervisorsAsync(emergencyAccess.Id);

            return emergencyAccess;
        }

        public async Task<EmergencyAccess> ApproveEmergencyAccessAsync(Guid requestId, Guid approverId, string notes)
        {
            var emergencyAccess = await _context.EmergencyAccesses.FindAsync(requestId);
            if (emergencyAccess == null)
                throw new ArgumentException("Emergency access request not found");

            if (emergencyAccess.Status != "pending")
                throw new InvalidOperationException($"Cannot approve request with status '{emergencyAccess.Status}'");

            emergencyAccess.Status = "approved";
            emergencyAccess.ApprovedBy = approverId;
            emergencyAccess.ApprovedAt = DateTime.UtcNow;
            emergencyAccess.ApprovalNotes = notes;
            emergencyAccess.UpdatedAt = DateTime.UtcNow;

            // Update audit trail
            var auditTrail = JsonSerializer.Deserialize<List<object>>(emergencyAccess.AuditTrail ?? "[]") ?? new List<object>();
            auditTrail.Add(new
            {
                Timestamp = DateTime.UtcNow,
                Action = "Approved",
                UserId = approverId,
                Notes = notes
            });
            emergencyAccess.AuditTrail = JsonSerializer.Serialize(auditTrail);

            await _context.SaveChangesAsync();

            // Log approval
            await _auditService.LogSecurityEventAsync(
                approverId,
                "EmergencyAccessApproved",
                "High",
                new Dictionary<string, object>
                {
                    { "AccessId", requestId },
                    { "RequestedBy", emergencyAccess.UserId },
                    { "ApprovedBy", approverId }
                }
            );

            return emergencyAccess;
        }

        public async Task<EmergencyAccess> RejectEmergencyAccessAsync(Guid requestId, Guid rejectorId, string reason)
        {
            var emergencyAccess = await _context.EmergencyAccesses.FindAsync(requestId);
            if (emergencyAccess == null)
                throw new ArgumentException("Emergency access request not found");

            if (emergencyAccess.Status != "pending")
                throw new InvalidOperationException($"Cannot reject request with status '{emergencyAccess.Status}'");

            emergencyAccess.Status = "rejected";
            emergencyAccess.RejectedBy = rejectorId;
            emergencyAccess.RejectedAt = DateTime.UtcNow;
            emergencyAccess.RejectionReason = reason;
            emergencyAccess.UpdatedAt = DateTime.UtcNow;

            // Update audit trail
            var auditTrail = JsonSerializer.Deserialize<List<object>>(emergencyAccess.AuditTrail ?? "[]") ?? new List<object>();
            auditTrail.Add(new
            {
                Timestamp = DateTime.UtcNow,
                Action = "Rejected",
                UserId = rejectorId,
                Reason = reason
            });
            emergencyAccess.AuditTrail = JsonSerializer.Serialize(auditTrail);

            await _context.SaveChangesAsync();

            // Log rejection
            await _auditService.LogSecurityEventAsync(
                rejectorId,
                "EmergencyAccessRejected",
                "Medium",
                new Dictionary<string, object>
                {
                    { "AccessId", requestId },
                    { "RequestedBy", emergencyAccess.UserId },
                    { "RejectedBy", rejectorId },
                    { "Reason", reason }
                }
            );

            return emergencyAccess;
        }

        public async Task RevokeEmergencyAccessAsync(Guid requestId, Guid revokerId, string reason)
        {
            var emergencyAccess = await _context.EmergencyAccesses.FindAsync(requestId);
            if (emergencyAccess == null)
                throw new ArgumentException("Emergency access request not found");

            emergencyAccess.Status = "revoked";
            emergencyAccess.RevokedAt = DateTime.UtcNow;
            emergencyAccess.RevokedBy = revokerId;
            emergencyAccess.RevocationReason = reason;
            emergencyAccess.UpdatedAt = DateTime.UtcNow;

            // Update audit trail
            var auditTrail = JsonSerializer.Deserialize<List<object>>(emergencyAccess.AuditTrail ?? "[]") ?? new List<object>();
            auditTrail.Add(new
            {
                Timestamp = DateTime.UtcNow,
                Action = "Revoked",
                UserId = revokerId,
                Reason = reason
            });
            emergencyAccess.AuditTrail = JsonSerializer.Serialize(auditTrail);

            await _context.SaveChangesAsync();

            // Log revocation
            await _auditService.LogSecurityEventAsync(
                revokerId,
                "EmergencyAccessRevoked",
                "High",
                new Dictionary<string, object>
                {
                    { "AccessId", requestId },
                    { "RevokedBy", revokerId },
                    { "Reason", reason }
                }
            );
        }

        public async Task<List<EmergencyAccess>> GetActiveEmergencyAccessAsync(Guid userId)
        {
            var tenantId = GetCurrentTenantId();

            return await _context.EmergencyAccesses
                .Where(ea => ea.UserId == userId
                    && ea.TenantId == tenantId
                    && ea.Status == "approved"
                    && ea.EndTime > DateTime.UtcNow)
                .OrderByDescending(ea => ea.StartTime)
                .ToListAsync();
        }

        public async Task<List<EmergencyAccess>> GetPendingApprovalsAsync(Guid approverId)
        {
            var tenantId = GetCurrentTenantId();

            // In a real system, you'd check if approverId has supervisor/admin role
            return await _context.EmergencyAccesses
                .Where(ea => ea.TenantId == tenantId
                    && ea.Status == "pending"
                    && ea.RequiresApproval)
                .OrderBy(ea => ea.CreatedAt)
                .ToListAsync();
        }

        public async Task AuditEmergencyUseAsync(Guid accessId, string action, Guid resourceId, string resourceType)
        {
            var emergencyAccess = await _context.EmergencyAccesses.FindAsync(accessId);
            if (emergencyAccess == null)
                return;

            // Add to actions performed
            var actionsPerformed = JsonSerializer.Deserialize<List<object>>(emergencyAccess.ActionsPerformed ?? "[]") ?? new List<object>();
            actionsPerformed.Add(new
            {
                Timestamp = DateTime.UtcNow,
                Action = action,
                ResourceId = resourceId,
                ResourceType = resourceType
            });
            emergencyAccess.ActionsPerformed = JsonSerializer.Serialize(actionsPerformed);
            emergencyAccess.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Log to audit system
            await _auditService.LogSecurityEventAsync(
                emergencyAccess.UserId,
                "EmergencyAccessUsed",
                "High",
                new Dictionary<string, object>
                {
                    { "AccessId", accessId },
                    { "Action", action },
                    { "ResourceId", resourceId },
                    { "ResourceType", resourceType }
                }
            );
        }

        public async Task<int> AutoRevokeExpiredAsync()
        {
            var expiredAccesses = await _context.EmergencyAccesses
                .Where(ea => ea.Status == "approved"
                    && ea.AutoRevokeEnabled
                    && ea.EndTime < DateTime.UtcNow)
                .ToListAsync();

            foreach (var access in expiredAccesses)
            {
                access.Status = "expired";
                access.UpdatedAt = DateTime.UtcNow;

                // Update audit trail
                var auditTrail = JsonSerializer.Deserialize<List<object>>(access.AuditTrail ?? "[]") ?? new List<object>();
                auditTrail.Add(new
                {
                    Timestamp = DateTime.UtcNow,
                    Action = "AutoRevoked",
                    Reason = "Duration expired"
                });
                access.AuditTrail = JsonSerializer.Serialize(auditTrail);
            }

            await _context.SaveChangesAsync();
            return expiredAccesses.Count();
        }

        public async Task NotifySupervisorsAsync(Guid accessId)
        {
            var emergencyAccess = await _context.EmergencyAccesses.FindAsync(accessId);
            if (emergencyAccess == null)
                return;

            // Get supervisors (users with admin/supervisor roles in same tenant)
            var tenantId = emergencyAccess.TenantId;
            var supervisorRoles = await _context.Roles
                .Where(r => r.TenantId == tenantId 
                    && (r.Name == "Admin" || r.Name == "Supervisor" || r.Name == "Compliance Officer"))
                .Select(r => r.Id)
                .ToListAsync();

            var supervisors = await _context.UserRoles
                .Where(ur => supervisorRoles.Contains(ur.RoleId))
                .Select(ur => ur.UserId.ToString())
                .Distinct()
                .ToListAsync();

            // Store notified users
            emergencyAccess.NotifiedUsers = JsonSerializer.Serialize(supervisors);
            emergencyAccess.NotificationSent = true;
            emergencyAccess.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // In a real system, you'd send emails/push notifications here
        }

        public async Task<EmergencyAccess> ReviewEmergencyAccessAsync(Guid accessId, Guid reviewerId, string reviewStatus, string notes)
        {
            var emergencyAccess = await _context.EmergencyAccesses.FindAsync(accessId);
            if (emergencyAccess == null)
                throw new ArgumentException("Emergency access not found");

            if (!emergencyAccess.RequiresReview)
                throw new InvalidOperationException("This emergency access does not require review");

            emergencyAccess.ReviewedBy = reviewerId;
            emergencyAccess.ReviewedAt = DateTime.UtcNow;
            emergencyAccess.ReviewStatus = reviewStatus;
            emergencyAccess.ReviewNotes = notes;
            emergencyAccess.UpdatedAt = DateTime.UtcNow;

            // Update audit trail
            var auditTrail = JsonSerializer.Deserialize<List<object>>(emergencyAccess.AuditTrail ?? "[]") ?? new List<object>();
            auditTrail.Add(new
            {
                Timestamp = DateTime.UtcNow,
                Action = "Reviewed",
                UserId = reviewerId,
                Status = reviewStatus,
                Notes = notes
            });
            emergencyAccess.AuditTrail = JsonSerializer.Serialize(auditTrail);

            await _context.SaveChangesAsync();

            // Log review
            await _auditService.LogSecurityEventAsync(
                reviewerId,
                "EmergencyAccessReviewed",
                "Medium",
                new Dictionary<string, object>
                {
                    { "AccessId", accessId },
                    { "ReviewStatus", reviewStatus },
                    { "ReviewedBy", reviewerId }
                }
            );

            return emergencyAccess;
        }

        private string GenerateAccessCode()
        {
            // Generate a unique 8-character access code
            return Guid.NewGuid().ToString("N")[..8].ToUpper();
        }
    }
}
