using IpManagementService.Data;
using IpManagementService.Models.Dtos;
using Microsoft.EntityFrameworkCore;

namespace IpManagementService.Services;

public class IntraOpPresetService
{
    private readonly IpManagementDbContext _db;

    public IntraOpPresetService(IpManagementDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Returns presets visible to the given tenant:
    /// global system presets (tenant_id IS NULL) UNION tenant-specific presets.
    /// Optionally filtered by fieldName (procedure|findings|complications|anesthesia_notes).
    /// </summary>
    public async Task<List<IntraOpPresetDto>> GetPresetsAsync(Guid tenantId, string? fieldName = null)
    {
        var query = _db.IntraOpNotePresets
            .Where(p => p.DeletedAt == null && p.Status == "active")
            .Where(p => p.TenantId == null || p.TenantId == tenantId);

        if (!string.IsNullOrWhiteSpace(fieldName))
            query = query.Where(p => p.FieldName == fieldName);

        var rows = await query
            .OrderBy(p => p.FieldName)
            .ThenBy(p => p.DisplayOrder)
            .ThenBy(p => p.OptionLabel)
            .ToListAsync();

        return rows.Select(p => new IntraOpPresetDto(
            p.Id,
            p.FieldName,
            p.OptionLabel,
            p.DisplayOrder
        )).ToList();
    }
}
