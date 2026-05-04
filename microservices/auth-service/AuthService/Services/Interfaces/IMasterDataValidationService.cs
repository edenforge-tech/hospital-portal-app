using System;
using System.Threading.Tasks;

namespace AuthService.Services.Interfaces
{
    /// <summary>
    /// Validates whether a master value can safely be deleted,
    /// checking system-lock flag and cross-table reference counts.
    /// </summary>
    public interface IMasterDataValidationService
    {
        /// <summary>
        /// Returns null if deletion is safe, or a <see cref="DeleteBlockReason"/> describing why it's blocked.
        /// </summary>
        Task<DeleteBlockReason?> CanDeleteAsync(Guid tenantId, Guid masterValueId, string entityType, string label);
    }
}
