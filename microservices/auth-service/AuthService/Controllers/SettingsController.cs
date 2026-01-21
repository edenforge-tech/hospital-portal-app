using AuthService.Authorization;
using AuthService.Context;
using AuthService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SettingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SettingsController(AppDbContext context)
        {
            _context = context;
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
    }
}
