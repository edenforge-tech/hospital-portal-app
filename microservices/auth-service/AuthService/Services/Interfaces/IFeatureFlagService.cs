using System.Collections.Generic;

namespace AuthService.Services.Interfaces
{
    /// <summary>
    /// Feature flag abstraction — reads from appsettings.json FeatureFlags section.
    /// Allows per-group master data rollout without code deploys.
    /// </summary>
    public interface IFeatureFlagService
    {
        /// <summary>Returns true if the master data module is globally enabled.</summary>
        bool IsMasterDataEnabled();

        /// <summary>
        /// Returns true if the specified master data group is enabled
        /// (e.g. "PatientSetup", "Clinical", "Pharmacy").
        /// Falls back to false if the group is not listed.
        /// </summary>
        bool IsMasterDataGroupEnabled(string groupKey);

        /// <summary>Returns all group keys that are currently enabled.</summary>
        IReadOnlyList<string> GetEnabledMasterDataGroups();
    }
}
