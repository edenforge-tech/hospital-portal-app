using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AuthService.Context;
using AuthService.Models;
using System.Security.Claims;
using System.Text.Json;

namespace AuthService.Controllers
{
    /// <summary>
    /// Filter Presets Controller - Phase 4.2: Advanced Filters & Saved Views
    /// Manages saved filter presets for users across different entity types
    /// </summary>
    [ApiController]
    [Route("api/filters")]
    [Authorize]
    public class FilterPresetsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<FilterPresetsController> _logger;

        public FilterPresetsController(
            AppDbContext context,
            ILogger<FilterPresetsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        private Guid GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.Parse(userIdClaim ?? throw new UnauthorizedAccessException("User ID not found"));
        }

        private Guid GetTenantId()
        {
            var tenantIdClaim = User.FindFirst("TenantId")?.Value;
            return Guid.Parse(tenantIdClaim ?? throw new UnauthorizedAccessException("Tenant ID not found"));
        }

        /// <summary>
        /// Get all filter presets for current user and entity type
        /// </summary>
        /// <param name="entityType">Entity type (counseling_session, follow_up, queue, etc.)</param>
        [HttpGet("presets")]
        [ProducesResponseType(typeof(List<FilterPresetDto>), 200)]
        public async Task<IActionResult> GetPresets([FromQuery] string entityType)
        {
            try
            {
                var userId = GetUserId();
                var tenantId = GetTenantId();

                var presets = await _context.FilterPresets
                    .Where(fp => fp.UserId == userId && 
                                 fp.TenantId == tenantId && 
                                 fp.DeletedAt == null &&
                                 fp.Status == "active")
                    .Where(fp => string.IsNullOrEmpty(entityType) || fp.EntityType == entityType)
                    .OrderByDescending(fp => fp.IsDefault)
                    .ThenBy(fp => fp.Name)
                    .Select(fp => new FilterPresetDto
                    {
                        Id = fp.Id,
                        UserId = fp.UserId,
                        TenantId = fp.TenantId,
                        Name = fp.Name,
                        Filters = JsonSerializer.Deserialize<object>(fp.Filters, (JsonSerializerOptions?)null) ?? new { },
                        EntityType = fp.EntityType,
                        IsDefault = fp.IsDefault,
                        Status = fp.Status,
                        CreatedAt = fp.CreatedAt,
                        UpdatedAt = fp.UpdatedAt
                    })
                    .ToListAsync();

                return Ok(presets);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving filter presets");
                return StatusCode(500, new { message = "Error retrieving filter presets", error = ex.Message });
            }
        }

        /// <summary>
        /// Get a specific filter preset by ID
        /// </summary>
        [HttpGet("presets/{id}")]
        [ProducesResponseType(typeof(FilterPresetDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetPreset(Guid id)
        {
            try
            {
                var userId = GetUserId();
                var tenantId = GetTenantId();

                var preset = await _context.FilterPresets
                    .Where(fp => fp.Id == id && 
                                 fp.UserId == userId && 
                                 fp.TenantId == tenantId && 
                                 fp.DeletedAt == null)
                    .FirstOrDefaultAsync();

                if (preset == null)
                    return NotFound(new { message = "Filter preset not found" });

                var dto = new FilterPresetDto
                {
                    Id = preset.Id,
                    UserId = preset.UserId,
                    TenantId = preset.TenantId,
                    Name = preset.Name,
                    Filters = JsonSerializer.Deserialize<object>(preset.Filters, (JsonSerializerOptions?)null) ?? new { },
                    EntityType = preset.EntityType,
                    IsDefault = preset.IsDefault,
                    Status = preset.Status,
                    CreatedAt = preset.CreatedAt,
                    UpdatedAt = preset.UpdatedAt
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving filter preset {Id}", id);
                return StatusCode(500, new { message = "Error retrieving filter preset", error = ex.Message });
            }
        }

        /// <summary>
        /// Create a new filter preset
        /// </summary>
        [HttpPost("presets")]
        [ProducesResponseType(typeof(FilterPresetDto), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> CreatePreset([FromBody] CreateFilterPresetRequest request)
        {
            try
            {
                var userId = GetUserId();
                var tenantId = GetTenantId();

                // If this is set as default, unset other defaults for same entity type
                if (request.IsDefault)
                {
                    var existingDefaults = await _context.FilterPresets
                        .Where(fp => fp.UserId == userId && 
                                     fp.TenantId == tenantId && 
                                     fp.EntityType == request.EntityType && 
                                     fp.IsDefault && 
                                     fp.DeletedAt == null)
                        .ToListAsync();

                    foreach (var existing in existingDefaults)
                    {
                        existing.IsDefault = false;
                        existing.UpdatedAt = DateTime.UtcNow;
                        existing.UpdatedByUserId = userId;
                    }
                }

                var preset = new FilterPreset
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    TenantId = tenantId,
                    Name = request.Name,
                    Filters = JsonSerializer.Serialize(request.Filters),
                    EntityType = request.EntityType,
                    IsDefault = request.IsDefault,
                    Status = "active",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    CreatedByUserId = userId,
                    UpdatedByUserId = userId
                };

                _context.FilterPresets.Add(preset);
                await _context.SaveChangesAsync();

                var dto = new FilterPresetDto
                {
                    Id = preset.Id,
                    UserId = preset.UserId,
                    TenantId = preset.TenantId,
                    Name = preset.Name,
                    Filters = request.Filters,
                    EntityType = preset.EntityType,
                    IsDefault = preset.IsDefault,
                    Status = preset.Status,
                    CreatedAt = preset.CreatedAt,
                    UpdatedAt = preset.UpdatedAt
                };

                _logger.LogInformation("Filter preset created: {Name} for entity {EntityType}", preset.Name, preset.EntityType);
                return CreatedAtAction(nameof(GetPreset), new { id = preset.Id }, dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating filter preset");
                return StatusCode(500, new { message = "Error creating filter preset", error = ex.Message });
            }
        }

        /// <summary>
        /// Update an existing filter preset
        /// </summary>
        [HttpPatch("presets/{id}")]
        [ProducesResponseType(typeof(FilterPresetDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> UpdatePreset(Guid id, [FromBody] UpdateFilterPresetRequest request)
        {
            try
            {
                var userId = GetUserId();
                var tenantId = GetTenantId();

                var preset = await _context.FilterPresets
                    .Where(fp => fp.Id == id && 
                                 fp.UserId == userId && 
                                 fp.TenantId == tenantId && 
                                 fp.DeletedAt == null)
                    .FirstOrDefaultAsync();

                if (preset == null)
                    return NotFound(new { message = "Filter preset not found" });

                // Update fields if provided
                if (!string.IsNullOrEmpty(request.Name))
                    preset.Name = request.Name;

                if (request.Filters != null)
                    preset.Filters = JsonSerializer.Serialize(request.Filters);

                if (request.IsDefault.HasValue)
                {
                    // If setting as default, unset other defaults
                    if (request.IsDefault.Value)
                    {
                        var existingDefaults = await _context.FilterPresets
                            .Where(fp => fp.UserId == userId && 
                                         fp.TenantId == tenantId && 
                                         fp.EntityType == preset.EntityType && 
                                         fp.IsDefault && 
                                         fp.Id != id &&
                                         fp.DeletedAt == null)
                            .ToListAsync();

                        foreach (var existing in existingDefaults)
                        {
                            existing.IsDefault = false;
                            existing.UpdatedAt = DateTime.UtcNow;
                        }
                    }
                    preset.IsDefault = request.IsDefault.Value;
                }

                if (!string.IsNullOrEmpty(request.Status))
                    preset.Status = request.Status;

                preset.UpdatedAt = DateTime.UtcNow;
                preset.UpdatedByUserId = userId;

                await _context.SaveChangesAsync();

                var dto = new FilterPresetDto
                {
                    Id = preset.Id,
                    UserId = preset.UserId,
                    TenantId = preset.TenantId,
                    Name = preset.Name,
                    Filters = JsonSerializer.Deserialize<object>(preset.Filters, (JsonSerializerOptions?)null) ?? new { },
                    EntityType = preset.EntityType,
                    IsDefault = preset.IsDefault,
                    Status = preset.Status,
                    CreatedAt = preset.CreatedAt,
                    UpdatedAt = preset.UpdatedAt
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating filter preset {Id}", id);
                return StatusCode(500, new { message = "Error updating filter preset", error = ex.Message });
            }
        }

        /// <summary>
        /// Delete a filter preset (soft delete)
        /// </summary>
        [HttpDelete("presets/{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeletePreset(Guid id)
        {
            try
            {
                var userId = GetUserId();
                var tenantId = GetTenantId();

                var preset = await _context.FilterPresets
                    .Where(fp => fp.Id == id && 
                                 fp.UserId == userId && 
                                 fp.TenantId == tenantId && 
                                 fp.DeletedAt == null)
                    .FirstOrDefaultAsync();

                if (preset == null)
                    return NotFound(new { message = "Filter preset not found" });

                // Soft delete
                preset.DeletedAt = DateTime.UtcNow;
                preset.UpdatedAt = DateTime.UtcNow;
                preset.UpdatedByUserId = userId;
                preset.Status = "archived";

                await _context.SaveChangesAsync();

                _logger.LogInformation("Filter preset deleted: {Id}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting filter preset {Id}", id);
                return StatusCode(500, new { message = "Error deleting filter preset", error = ex.Message });
            }
        }

        /// <summary>
        /// Get the default filter preset for a specific entity type
        /// </summary>
        [HttpGet("presets/default/{entityType}")]
        [ProducesResponseType(typeof(FilterPresetDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetDefaultPreset(string entityType)
        {
            try
            {
                var userId = GetUserId();
                var tenantId = GetTenantId();

                var preset = await _context.FilterPresets
                    .Where(fp => fp.UserId == userId && 
                                 fp.TenantId == tenantId && 
                                 fp.EntityType == entityType && 
                                 fp.IsDefault && 
                                 fp.DeletedAt == null &&
                                 fp.Status == "active")
                    .FirstOrDefaultAsync();

                if (preset == null)
                    return NotFound(new { message = "No default filter preset found" });

                var dto = new FilterPresetDto
                {
                    Id = preset.Id,
                    UserId = preset.UserId,
                    TenantId = preset.TenantId,
                    Name = preset.Name,
                    Filters = JsonSerializer.Deserialize<object>(preset.Filters, (JsonSerializerOptions?)null) ?? new { },
                    EntityType = preset.EntityType,
                    IsDefault = preset.IsDefault,
                    Status = preset.Status,
                    CreatedAt = preset.CreatedAt,
                    UpdatedAt = preset.UpdatedAt
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving default filter preset for {EntityType}", entityType);
                return StatusCode(500, new { message = "Error retrieving default filter preset", error = ex.Message });
            }
        }
    }
}
