using System;
using System.Collections.Generic;

namespace AuthService.Models.Domain
{
    /// <summary>
    /// Organization domain entity representing a business unit within a tenant.
    /// Updated to match database schema from migration 01_alter_organization_table.sql
    /// </summary>
    public class Organization
    {
        // Primary Key
        public Guid Id { get; set; }
        
        // Auto-increment ID
        public int OrganizationId { get; set; }
        
        // Foreign Key to Tenant
        public Guid TenantId { get; set; }
        
        // Basic Information
        public string Name { get; set; } = string.Empty;
        public string? OrganizationCode { get; set; }
        public string? OrganizationName { get; set; } // Separate display name
        
        // Location
        public string? CountryCode { get; set; }
        public string? StateProvince { get; set; }
        public string? City { get; set; }
        public string? Address { get; set; }
        public string? PostalCode { get; set; }
        
        // Contact Information
        public string? Email { get; set; }
        public string? Phone { get; set; }
        
        // Configuration
        public string? CurrencyCode { get; set; }
        public string? LanguageCode { get; set; }
        public string Timezone { get; set; } = "UTC";
        public string? DateFormat { get; set; } = "DD-MM-YYYY";
        public string? TimeFormat { get; set; } = "24h";
        public string? NumberFormat { get; set; } = "en-US";
        public string Status { get; set; } = "Active";
        
        // Regulatory & Compliance
        public string? RegulatoryBody { get; set; }
        public string? LicenseNumber { get; set; }
        public string? AccreditationStatus { get; set; }
        
        // Branding
        public string? LogoUrl { get; set; }
        public string? PrimaryColor { get; set; }
        public string? SecondaryColor { get; set; }
        
        // Navigation properties
        public Tenant? Tenant { get; set; }
        public ICollection<Branch>? Branches { get; set; }
    }
}
