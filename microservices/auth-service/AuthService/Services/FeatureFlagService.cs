using AuthService.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Linq;

namespace AuthService.Services
{
    /// <summary>
    /// Reads FeatureFlags:MasterData from appsettings.json.
    /// 
    /// appsettings.json structure expected:
    /// {
    ///   "FeatureFlags": {
    ///     "MasterData": {
    ///       "Enabled": true,
    ///       "EnabledGroups": {
    ///         "PatientSetup": true,
    ///         "Clinical": true,
    ///         ...
    ///       }
    ///     }
    ///   }
    /// }
    /// </summary>
    public class FeatureFlagService : IFeatureFlagService
    {
        private readonly IConfiguration _config;

        public FeatureFlagService(IConfiguration config)
        {
            _config = config;
        }

        public bool IsMasterDataEnabled()
            => _config.GetValue<bool>("FeatureFlags:MasterData:Enabled", false);

        public bool IsMasterDataGroupEnabled(string groupKey)
        {
            if (!IsMasterDataEnabled()) return false;
            return _config.GetValue<bool>($"FeatureFlags:MasterData:EnabledGroups:{groupKey}", false);
        }

        public IReadOnlyList<string> GetEnabledMasterDataGroups()
        {
            if (!IsMasterDataEnabled()) return [];

            var section = _config.GetSection("FeatureFlags:MasterData:EnabledGroups");
            return section.GetChildren()
                .Where(c => c.Value == "true" || c.Value == "True")
                .Select(c => c.Key)
                .ToList();
        }
    }
}
