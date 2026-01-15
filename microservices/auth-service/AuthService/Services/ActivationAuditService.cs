using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text.Json;
using System.Threading.Tasks;

namespace AuthService.Services
{
    public interface IActivationAuditService
    {
        Task LogStepAsync(
            Guid userId,
            Guid tenantId,
            string activationStep,
            string status,
            string? errorMessage = null,
            object? requestData = null,
            object? responseData = null,
            int? responseTimeMs = null
        );

        Task<bool> DetectSuspiciousActivity(Guid userId, string ipAddress);
    }

    public class ActivationAuditService : IActivationAuditService
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<ActivationAuditService> _logger;

        public ActivationAuditService(
            AppDbContext context,
            IHttpContextAccessor httpContextAccessor,
            ILogger<ActivationAuditService> logger)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        public async Task LogStepAsync(
            Guid userId,
            Guid tenantId,
            string activationStep,
            string status,
            string? errorMessage = null,
            object? requestData = null,
            object? responseData = null,
            int? responseTimeMs = null)
        {
            try
            {
                var httpContext = _httpContextAccessor.HttpContext;
                var ipAddress = httpContext?.Connection?.RemoteIpAddress?.ToString() ?? "unknown";
                var userAgent = httpContext?.Request?.Headers["User-Agent"].ToString();

                // Check for suspicious activity
                var isSuspicious = await DetectSuspiciousActivity(userId, ipAddress);

                var auditLog = new ActivationAuditLog
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    UserId = userId,
                    ActivationStep = activationStep,
                    Status = status,
                    ErrorMessage = errorMessage,
                    IpAddress = ipAddress,
                    UserAgent = userAgent,
                    DeviceInfo = ExtractDeviceInfo(userAgent),
                    Timestamp = DateTime.UtcNow,
                    CompletedAt = status == "success" ? DateTime.UtcNow : null,
                    RequestData = requestData != null ? JsonSerializer.Serialize(SanitizeData(requestData)) : null,
                    ResponseData = responseData != null ? JsonSerializer.Serialize(SanitizeData(responseData)) : null,
                    ResponseTimeMs = responseTimeMs,
                    SuspiciousActivity = isSuspicious,
                    ComplianceNotes = isSuspicious ? "Flagged: Multiple failed attempts or unusual pattern" : null,
                    CreatedAt = DateTime.UtcNow
                };

                _context.ActivationAuditLogs.Add(auditLog);
                await _context.SaveChangesAsync();

                _logger.LogInformation(
                    "Activation audit: UserId={UserId}, Step={Step}, Status={Status}, IP={IP}",
                    userId, activationStep, status, ipAddress
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log activation audit for user {UserId}", userId);
            }
        }

        public async Task<bool> DetectSuspiciousActivity(Guid userId, string ipAddress)
        {
            // Check for multiple failed attempts in last 15 minutes
            var recentFailures = await _context.ActivationAuditLogs
                .CountAsync(a => 
                    a.UserId == userId &&
                    a.Status == "failed" &&
                    a.Timestamp > DateTime.UtcNow.AddMinutes(-15)
                );

            if (recentFailures >= 3)
            {
                _logger.LogWarning(
                    "Suspicious activation activity detected: UserId={UserId}, IP={IP}, FailureCount={Count}",
                    userId, ipAddress, recentFailures
                );
                return true;
            }

            return false;
        }

        private string? ExtractDeviceInfo(string? userAgent)
        {
            if (string.IsNullOrEmpty(userAgent))
                return null;

            // Simple device detection (can be enhanced with UAParser library)
            var info = new
            {
                IsMobile = userAgent.Contains("Mobile", StringComparison.OrdinalIgnoreCase),
                IsTablet = userAgent.Contains("Tablet", StringComparison.OrdinalIgnoreCase),
                OS = ExtractOS(userAgent),
                Browser = ExtractBrowser(userAgent)
            };

            return JsonSerializer.Serialize(info);
        }

        private string ExtractOS(string userAgent)
        {
            if (userAgent.Contains("Windows")) return "Windows";
            if (userAgent.Contains("Mac OS")) return "MacOS";
            if (userAgent.Contains("Android")) return "Android";
            if (userAgent.Contains("iOS") || userAgent.Contains("iPhone") || userAgent.Contains("iPad")) return "iOS";
            if (userAgent.Contains("Linux")) return "Linux";
            return "Unknown";
        }

        private string ExtractBrowser(string userAgent)
        {
            if (userAgent.Contains("Edge")) return "Edge";
            if (userAgent.Contains("Chrome")) return "Chrome";
            if (userAgent.Contains("Safari")) return "Safari";
            if (userAgent.Contains("Firefox")) return "Firefox";
            return "Unknown";
        }

        private object SanitizeData(object data)
        {
            // Remove sensitive fields before logging
            var json = JsonSerializer.Serialize(data);
            var dict = JsonSerializer.Deserialize<Dictionary<string, object>>(json);

            if (dict != null)
            {
                var sensitiveFields = new[] { "password", "otp", "token", "secret", "apiKey" };
                foreach (var field in sensitiveFields)
                {
                    if (dict.ContainsKey(field))
                    {
                        dict[field] = "***REDACTED***";
                    }
                }
            }

            return dict ?? new object();
        }
    }
}
