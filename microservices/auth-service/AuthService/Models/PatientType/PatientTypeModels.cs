using System;
using System.Collections.Generic;
using System.Text.Json;

namespace AuthService.Models.PatientType
{
    /// <summary>
    /// DTO for patient type configuration
    /// </summary>
    public class PatientTypeConfigDto
    {
        public Guid Id { get; set; }
        public string PatientType { get; set; } = null!;
        public string DisplayName { get; set; } = null!;
        public string? Description { get; set; }
        public JsonElement Configuration { get; set; } // JSONB configuration data
        public bool IsActive { get; set; }
        public int DisplayOrder { get; set; }
    }

    /// <summary>
    /// Simplified configuration data structure
    /// </summary>
    public class PatientTypeConfigData
    {
        public bool RequiresAdvancePayment { get; set; }
        public int? AdvancePercentage { get; set; }
        public List<string> RequiredDocuments { get; set; } = new();
        public bool RequiresPreAuthorization { get; set; }
        public bool ZeroAdvancePayment { get; set; }
        public string? BillingMode { get; set; }
        public int? MaxPreAuthWaitHours { get; set; }
        public bool SkipInsurance { get; set; }
        public string? ApprovalAuthority { get; set; }
        public bool ZeroCostSurgery { get; set; }
        public string? Sponsor { get; set; }
        public int? PatientPaysPercentage { get; set; }
        public string? CopayDueAt { get; set; }
    }
}
