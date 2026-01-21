using System;
using AuthService.Models.Domain;

namespace AuthService.Models
{
    public class SystemSetting
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public string Category { get; set; } = string.Empty; // general, email, security, hipaa, backup, integrations
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string DataType { get; set; } = "string"; // string, number, boolean, json
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public Guid CreatedByUserId { get; set; }
        public Guid UpdatedByUserId { get; set; }

        // Navigation properties
        public Domain.Tenant? Tenant { get; set; }
    }
}
