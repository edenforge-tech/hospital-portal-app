using AuthService.Authorization;
using AuthService.Context;
using AuthService.Models;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using System.Net.Mail;
using System.Net;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SettingsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly INotificationService _notificationService;
        private readonly ILogger<SettingsController> _logger;

        public SettingsController(
            AppDbContext context,
            INotificationService notificationService,
            ILogger<SettingsController> logger)
        {
            _context = context;
            _notificationService = notificationService;
            _logger = logger;
        }

        private bool TryGetTenantId(out Guid tenantId)
        {
            tenantId = Guid.Empty;
            if (!HttpContext.Items.TryGetValue("TenantId", out var t)) return false;
            if (t is Guid g) { tenantId = g; return true; }
            return false;
        }

        private bool TryGetUserId(out Guid userId)
        {
            userId = Guid.Empty;
            var userIdClaim = User.FindFirst("sub")?.Value 
                ?? User.FindFirst("user_id")?.Value
                ?? User.FindFirst("UserId")?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim)) return false;
            return Guid.TryParse(userIdClaim, out userId);
        }

        /// <summary>
        /// Get all settings
        /// </summary>
        [HttpGet]
        [RequirePermission("settings.view")]
        public async Task<IActionResult> GetAll()
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "TenantId missing" });

            var settings = await _context.SystemSettings
                .Where(s => s.TenantId == tenantId)
                .Select(s => new
                {
                    id = s.Id,
                    category = s.Category,
                    key = s.Key,
                    value = s.Value,
                    dataType = s.DataType
                })
                .ToListAsync();

            // Group by category
            var grouped = settings
                .GroupBy(s => s.category)
                .ToDictionary(
                    g => g.Key,
                    g => g.ToDictionary(s => s.key, s => ParseValue(s.value, s.dataType))
                );

            return Ok(grouped);
        }

        /// <summary>
        /// Get settings by category
        /// </summary>
        [HttpGet("{category}")]
        [RequirePermission("settings.view")]
        public async Task<IActionResult> GetByCategory(string category)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "TenantId missing" });

            var settings = await _context.SystemSettings
                .Where(s => s.TenantId == tenantId && s.Category == category)
                .Select(s => new
                {
                    key = s.Key,
                    value = s.Value,
                    dataType = s.DataType
                })
                .ToListAsync();

            var result = settings.ToDictionary(s => s.key, s => ParseValue(s.value, s.dataType));

            return Ok(result);
        }

        /// <summary>
        /// Update settings by category
        /// </summary>
        [HttpPut("{category}")]
        [RequirePermission("settings.manage")]
        public async Task<IActionResult> Update(string category, [FromBody] Dictionary<string, object> settings)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "TenantId missing" });

            if (!TryGetUserId(out var userId))
                return BadRequest(new { message = "UserId missing" });

            foreach (var kvp in settings)
            {
                var existing = await _context.SystemSettings
                    .FirstOrDefaultAsync(s => 
                        s.TenantId == tenantId && 
                        s.Category == category && 
                        s.Key == kvp.Key);

                if (existing != null)
                {
                    // Update existing setting
                    existing.Value = SerializeValue(kvp.Value);
                    existing.DataType = GetDataType(kvp.Value);
                    existing.UpdatedAt = DateTime.UtcNow;
                    existing.UpdatedByUserId = userId;
                }
                else
                {
                    // Create new setting
                    var newSetting = new SystemSetting
                    {
                        Id = Guid.NewGuid(),
                        TenantId = tenantId,
                        Category = category,
                        Key = kvp.Key,
                        Value = SerializeValue(kvp.Value),
                        DataType = GetDataType(kvp.Value),
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        CreatedByUserId = userId,
                        UpdatedByUserId = userId
                    };
                    _context.SystemSettings.Add(newSetting);
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Settings updated successfully" });
        }

        /// <summary>
        /// Reset category settings to defaults
        /// </summary>
        [HttpPost("{category}/reset")]
        [RequirePermission("settings.manage")]
        public async Task<IActionResult> Reset(string category)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "TenantId missing" });

            if (!TryGetUserId(out var userId))
                return BadRequest(new { message = "UserId missing" });

            var settings = await _context.SystemSettings
                .Where(s => s.TenantId == tenantId && s.Category == category)
                .ToListAsync();

            _context.SystemSettings.RemoveRange(settings);

            // Add defaults
            var defaults = GetDefaultSettings(category, tenantId, userId);
            _context.SystemSettings.AddRange(defaults);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Settings reset to defaults successfully" });
        }

        // Helper methods
        private object ParseValue(string value, string dataType)
        {
            return dataType switch
            {
                "boolean" => bool.Parse(value),
                "number" => int.Parse(value),
                "json" => JsonSerializer.Deserialize<object>(value),
                _ => value
            };
        }

        private string SerializeValue(object value)
        {
            if (value is bool || value is int || value is double || value is string)
                return value.ToString();
            
            return JsonSerializer.Serialize(value);
        }

        private string GetDataType(object value)
        {
            return value switch
            {
                bool => "boolean",
                int or double => "number",
                string => "string",
                _ => "json"
            };
        }

        private List<SystemSetting> GetDefaultSettings(string category, Guid tenantId, Guid userId)
        {
            var now = DateTime.UtcNow;
            var defaults = new List<SystemSetting>();

            var defaultValues = category switch
            {
                "general" => new Dictionary<string, (string value, string type)>
                {
                    ["systemName"] = ("Hospital Portal", "string"),
                    ["timezone"] = ("UTC", "string"),
                    ["language"] = ("en", "string"),
                    ["maintenanceMode"] = ("false", "boolean")
                },
                "email" => new Dictionary<string, (string value, string type)>
                {
                    ["smtpHost"] = ("", "string"),
                    ["smtpPort"] = ("587", "number"),
                    ["smtpUsername"] = ("", "string"),
                    ["smtpPassword"] = ("", "string"),
                    ["fromEmail"] = ("", "string"),
                    ["fromName"] = ("", "string"),
                    ["enableTLS"] = ("true", "boolean")
                },
                "security" => new Dictionary<string, (string value, string type)>
                {
                    ["sessionTimeout"] = ("30", "number"),
                    ["passwordMinLength"] = ("8", "number"),
                    ["passwordRequireUppercase"] = ("true", "boolean"),
                    ["passwordRequireLowercase"] = ("true", "boolean"),
                    ["passwordRequireNumbers"] = ("true", "boolean"),
                    ["passwordRequireSymbols"] = ("true", "boolean"),
                    ["maxLoginAttempts"] = ("5", "number"),
                    ["lockoutDuration"] = ("15", "number")
                },
                "hipaa" => new Dictionary<string, (string value, string type)>
                {
                    ["auditLogRetention"] = ("7", "number"),
                    ["dataEncryption"] = ("true", "boolean"),
                    ["accessLogging"] = ("true", "boolean"),
                    ["breachNotification"] = ("true", "boolean"),
                    ["complianceOfficer"] = ("", "string")
                },
                "backup" => new Dictionary<string, (string value, string type)>
                {
                    ["autoBackup"] = ("true", "boolean"),
                    ["backupFrequency"] = ("daily", "string"),
                    ["backupRetention"] = ("30", "number"),
                    ["backupLocation"] = ("", "string"),
                    ["encryptionEnabled"] = ("true", "boolean")
                },
                "integrations" => new Dictionary<string, (string value, string type)>
                {
                    ["apiEnabled"] = ("true", "boolean"),
                    ["webhookUrl"] = ("", "string"),
                    ["apiRateLimit"] = ("1000", "number"),
                    ["externalAuth"] = ("false", "boolean"),
                    ["ssoEnabled"] = ("false", "boolean")
                },
                _ => new Dictionary<string, (string value, string type)>()
            };

            foreach (var kvp in defaultValues)
            {
                defaults.Add(new SystemSetting
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    Category = category,
                    Key = kvp.Key,
                    Value = kvp.Value.value,
                    DataType = kvp.Value.type,
                    CreatedAt = now,
                    UpdatedAt = now,
                    CreatedByUserId = userId,
                    UpdatedByUserId = userId
                });
            }

            return defaults;
        }

        #region Phase 3: Settings Testing Tools

        /// <summary>
        /// Test SMTP configuration
        /// </summary>
        [HttpPost("test-smtp")]
        [RequirePermission("settings.manage")]
        public async Task<IActionResult> TestSmtp([FromBody] TestSmtpRequest request)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "TenantId missing" });

            try
            {
                using var client = new SmtpClient(request.SmtpHost, request.SmtpPort);
                client.EnableSsl = request.EnableTLS;
                client.Credentials = new NetworkCredential(request.SmtpUsername, request.SmtpPassword);
                client.Timeout = 10000; // 10 seconds

                var message = new MailMessage
                {
                    From = new MailAddress(request.FromEmail, request.FromName),
                    Subject = "Hospital Portal - SMTP Test",
                    Body = $"This is a test email from Hospital Portal.\n\nSent at: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC\nTenant ID: {tenantId}",
                    IsBodyHtml = false
                };
                message.To.Add(request.TestRecipient);

                await client.SendMailAsync(message);

                return Ok(new
                {
                    success = true,
                    message = $"Test email sent successfully to {request.TestRecipient}",
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SMTP test failed for tenant {TenantId}", tenantId);
                return Ok(new
                {
                    success = false,
                    message = "SMTP test failed",
                    error = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// Test webhook configuration
        /// </summary>
        [HttpPost("test-webhook")]
        [RequirePermission("settings.manage")]
        public async Task<IActionResult> TestWebhook([FromBody] TestWebhookRequest request)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "TenantId missing" });

            try
            {
                using var httpClient = new HttpClient();
                httpClient.Timeout = TimeSpan.FromSeconds(10);

                var payload = new
                {
                    @event = "test",
                    tenantId = tenantId.ToString(),
                    message = "This is a test webhook from Hospital Portal",
                    timestamp = DateTime.UtcNow
                };

                var content = new StringContent(
                    JsonSerializer.Serialize(payload),
                    System.Text.Encoding.UTF8,
                    "application/json"
                );

                var response = await httpClient.PostAsync(request.WebhookUrl, content);
                var responseBody = await response.Content.ReadAsStringAsync();

                return Ok(new
                {
                    success = response.IsSuccessStatusCode,
                    statusCode = (int)response.StatusCode,
                    message = response.IsSuccessStatusCode ? "Webhook test successful" : "Webhook returned an error",
                    response = responseBody.Length > 500 ? responseBody.Substring(0, 500) + "..." : responseBody,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Webhook test failed for tenant {TenantId}", tenantId);
                return Ok(new
                {
                    success = false,
                    message = "Webhook test failed",
                    error = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// Preview impact of setting changes before applying
        /// </summary>
        [HttpPost("impact-preview")]
        [RequirePermission("settings.view")]
        public async Task<IActionResult> PreviewImpact([FromBody] Dictionary<string, object> proposedChanges)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "TenantId missing" });

            var impacts = new List<object>();

            foreach (var change in proposedChanges)
            {
                var parts = change.Key.Split('.');
                if (parts.Length != 2) continue;

                var category = parts[0];
                var key = parts[1];

                var existing = await _context.SystemSettings
                    .FirstOrDefaultAsync(s => s.TenantId == tenantId && s.Category == category && s.Key == key);

                var impact = AnalyzeSettingImpact(category, key, existing?.Value, change.Value?.ToString());
                impacts.Add(new
                {
                    setting = change.Key,
                    oldValue = existing?.Value,
                    newValue = change.Value,
                    impact = impact.severity,
                    description = impact.description,
                    affectedUsers = impact.affectedUsers,
                    requiresRestart = impact.requiresRestart
                });
            }

            return Ok(new { changes = impacts, totalImpact = impacts.Count });
        }

        /// <summary>
        /// Get settings change history
        /// </summary>
        [HttpGet("history")]
        [RequirePermission("settings.view")]
        public async Task<IActionResult> GetHistory([FromQuery] int limit = 50)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "TenantId missing" });

            var history = await _context.Set<Models.Domain.SettingsChangeHistory>()
                .Where(h => h.TenantId == tenantId)
                .OrderByDescending(h => h.ChangedAt)
                .Take(limit)
                .Select(h => new
                {
                    id = h.Id,
                    category = h.Category,
                    settingKey = h.SettingKey,
                    oldValue = h.OldValue,
                    newValue = h.NewValue,
                    changedBy = h.ChangedByUserId,
                    changedAt = h.ChangedAt,
                    changeReason = h.ChangeReason
                })
                .ToListAsync();

            return Ok(history);
        }

        /// <summary>
        /// Rollback to previous setting value
        /// </summary>
        [HttpPost("rollback/{historyId}")]
        [RequirePermission("settings.manage")]
        public async Task<IActionResult> RollbackSetting(Guid historyId)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "TenantId missing" });

            if (!TryGetUserId(out var userId))
                return BadRequest(new { message = "UserId missing" });

            var historyRecord = await _context.Set<Models.Domain.SettingsChangeHistory>()
                .FirstOrDefaultAsync(h => h.Id == historyId && h.TenantId == tenantId);

            if (historyRecord == null)
                return NotFound(new { message = "History record not found" });

            var setting = await _context.SystemSettings
                .FirstOrDefaultAsync(s => 
                    s.TenantId == tenantId && 
                    s.Category == historyRecord.Category && 
                    s.Key == historyRecord.SettingKey);

            if (setting != null)
            {
                // Create new history entry for rollback
                var rollbackHistory = new Models.Domain.SettingsChangeHistory
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    Category = historyRecord.Category,
                    SettingKey = historyRecord.SettingKey,
                    OldValue = setting.Value,
                    NewValue = historyRecord.OldValue,
                    ChangedByUserId = userId,
                    ChangedAt = DateTime.UtcNow,
                    ChangeReason = $"Rollback to value from {historyRecord.ChangedAt:yyyy-MM-dd HH:mm:ss}",
                    CreatedAt = DateTime.UtcNow,
                    Status = "active"
                };

                _context.Set<Models.Domain.SettingsChangeHistory>().Add(rollbackHistory);

                // Apply rollback
                setting.Value = historyRecord.OldValue;
                setting.UpdatedAt = DateTime.UtcNow;
                setting.UpdatedByUserId = userId;

                await _context.SaveChangesAsync();

                // Notify admins
                try
                {
                    await _notificationService.NotifySystemAlertAsync(
                        tenantId,
                        "settings_rollback",
                        "medium",
                        $"Setting {historyRecord.Category}.{historyRecord.SettingKey} rolled back to previous value"
                    );
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send rollback notification");
                }

                return Ok(new
                {
                    message = "Setting rolled back successfully",
                    setting = $"{historyRecord.Category}.{historyRecord.SettingKey}",
                    oldValue = rollbackHistory.OldValue,
                    newValue = rollbackHistory.NewValue
                });
            }

            return NotFound(new { message = "Setting not found" });
        }

        /// <summary>
        /// Export settings configuration
        /// </summary>
        [HttpGet("export")]
        [RequirePermission("settings.view")]
        public async Task<IActionResult> ExportSettings([FromQuery] string? category = null)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "TenantId missing" });

            var query = _context.SystemSettings.Where(s => s.TenantId == tenantId);

            if (!string.IsNullOrEmpty(category))
                query = query.Where(s => s.Category == category);

            var settings = await query
                .Select(s => new
                {
                    category = s.Category,
                    key = s.Key,
                    value = s.Value,
                    dataType = s.DataType
                })
                .ToListAsync();

            var export = new
            {
                tenantId = tenantId,
                exportedAt = DateTime.UtcNow,
                category = category ?? "all",
                settings = settings.GroupBy(s => s.category)
                    .ToDictionary(
                        g => g.Key,
                        g => g.ToDictionary(s => s.key, s => new { value = s.value, type = s.dataType })
                    )
            };

            return Ok(export);
        }

        /// <summary>
        /// Import settings configuration
        /// </summary>
        [HttpPost("import")]
        [RequirePermission("settings.manage")]
        public async Task<IActionResult> ImportSettings([FromBody] ImportSettingsRequest request)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "TenantId missing" });

            if (!TryGetUserId(out var userId))
                return BadRequest(new { message = "UserId missing" });

            var imported = 0;
            var skipped = 0;
            var errors = new List<string>();

            foreach (var categoryGroup in request.Settings)
            {
                foreach (var setting in categoryGroup.Value)
                {
                    try
                    {
                        var existing = await _context.SystemSettings
                            .FirstOrDefaultAsync(s => 
                                s.TenantId == tenantId && 
                                s.Category == categoryGroup.Key && 
                                s.Key == setting.Key);

                        if (existing != null && !request.OverwriteExisting)
                        {
                            skipped++;
                            continue;
                        }

                        if (existing != null)
                        {
                            existing.Value = setting.Value.ToString();
                            existing.DataType = setting.Type;
                            existing.UpdatedAt = DateTime.UtcNow;
                            existing.UpdatedByUserId = userId;
                        }
                        else
                        {
                            var newSetting = new SystemSetting
                            {
                                Id = Guid.NewGuid(),
                                TenantId = tenantId,
                                Category = categoryGroup.Key,
                                Key = setting.Key,
                                Value = setting.Value.ToString(),
                                DataType = setting.Type,
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow,
                                CreatedByUserId = userId,
                                UpdatedByUserId = userId
                            };
                            _context.SystemSettings.Add(newSetting);
                        }

                        imported++;
                    }
                    catch (Exception ex)
                    {
                        errors.Add($"{categoryGroup.Key}.{setting.Key}: {ex.Message}");
                    }
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Settings imported",
                imported,
                skipped,
                errors = errors.Count > 0 ? errors : null
            });
        }

        #endregion

        #region Helper Methods

        private (string severity, string description, int affectedUsers, bool requiresRestart) AnalyzeSettingImpact(
            string category, string key, string? oldValue, string? newValue)
        {
            // Analyze impact based on setting type
            var impact = (category, key) switch
            {
                ("security", "sessionTimeout") => ("high", "All active user sessions may be terminated", 100, false),
                ("security", "maxLoginAttempts") => ("medium", "Login lockout behavior will change", 50, false),
                ("email", _) => ("low", "Email delivery settings will be updated", 0, false),
                ("general", "maintenanceMode") when newValue == "true" => 
                    ("critical", "System will enter maintenance mode - all users will be logged out", 1000, true),
                ("general", "timezone") => ("medium", "Time display will change for all users", 200, false),
                ("hipaa", _) => ("high", "HIPAA compliance settings will be modified", 100, false),
                ("backup", "autoBackup") when newValue == "false" => 
                    ("high", "Automatic backups will be disabled - data loss risk", 0, false),
                ("integrations", "apiEnabled") when newValue == "false" => 
                    ("high", "API integrations will be disabled", 20, false),
                _ => ("low", "Setting will be updated", 0, false)
            };

            return impact;
        }

        #endregion
    }

    #region Request Models

    public class TestSmtpRequest
    {
        public string SmtpHost { get; set; } = "";
        public int SmtpPort { get; set; } = 587;
        public string SmtpUsername { get; set; } = "";
        public string SmtpPassword { get; set; } = "";
        public string FromEmail { get; set; } = "";
        public string FromName { get; set; } = "";
        public bool EnableTLS { get; set; } = true;
        public string TestRecipient { get; set; } = "";
    }

    public class TestWebhookRequest
    {
        public string WebhookUrl { get; set; } = "";
    }

    public class ImportSettingsRequest
    {
        public Dictionary<string, List<ImportSetting>> Settings { get; set; } = new();
        public bool OverwriteExisting { get; set; } = false;
    }

    public class ImportSetting
    {
        public string Key { get; set; } = "";
        public object Value { get; set; } = "";
        public string Type { get; set; } = "string";
    }

    #endregion
}
