using CounsellingApi.Models;
using CounsellingApi.Models.Entities;

namespace CounsellingApi.Repositories;

public interface ICounsellingRepository
{
    Task<PatientCounselling?> Get(Guid id);
    Task<PatientCounselling?> GetByPatient(Guid patientId);
    Task<(List<PatientCounselling> Items, int Total)> GetList(GetListQuery query);
    Task Add(PatientCounselling entity);
    Task Update(PatientCounselling entity);

    // Audit trail
    Task<List<AuditLog>> GetAuditLogs(Guid counsellingId);

    // Price overrides
    Task AddPriceOverride(SessionPriceOverride entity);
    Task<List<SessionPriceOverride>> GetPriceOverrides(Guid counsellingId);
    Task<List<SessionPriceOverride>> GetUnsentStaffOverrides(Guid counsellingId);
    Task MarkNotificationSent(Guid overrideId);
    Task<bool> SoftDeletePriceOverride(Guid overrideId, string performedBy);
    Task<SessionPriceOverride?> UpdatePriceOverride(Guid overrideId, decimal overriddenPrice, string reason, string? remarks, string performedBy);
}
