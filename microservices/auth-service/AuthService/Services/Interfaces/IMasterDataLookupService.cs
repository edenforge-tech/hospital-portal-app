using AuthService.Models.MasterData;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AuthService.Services.Interfaces
{
    /// <summary>
    /// Feature-flag-aware lookup for master data values.
    /// All methods fall back to a hardcoded list when the feature flag is off.
    /// </summary>
    public interface IMasterDataLookupService
    {
        /// <summary>Returns active labels for an entity type, falling back to <paramref name="fallback"/>.</summary>
        Task<IReadOnlyList<string>> GetLabelsAsync(
            Guid tenantId,
            string entityType,
            IReadOnlyList<string> fallback);

        /// <summary>Returns active code→label map for an entity type, falling back to <paramref name="fallback"/>.</summary>
        Task<IReadOnlyDictionary<string, string>> GetCodeLabelMapAsync(
            Guid tenantId,
            string entityType,
            IReadOnlyDictionary<string, string> fallback);

        /// <summary>Returns full MasterValue objects for an entity type (no fallback — returns empty list if flag off).</summary>
        Task<IReadOnlyList<MasterValue>> GetValuesAsync(
            Guid tenantId,
            string entityType,
            IReadOnlyList<string>? labelFallback = null);
    }
}
