using System;

namespace AuthService.Models.Domain
{
    public class Tenant
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public string? TenantCode { get; set; }
        public string? RegistrationNumber { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? Pincode { get; set; }
        public string? Country { get; set; } = "India";
        public string? Status { get; set; } = "Active"; // Active, Inactive, Suspended
        public string? SubscriptionTier { get; set; } = "Basic"; // Basic, Pro, Enterprise
        public int MaxBranches { get; set; } = 1;
        public int MaxUsers { get; set; } = 50;
        public bool IsActive { get; set; } = true;
        
        // Regional settings
        public string? PrimaryRegion { get; set; }
        public string? DefaultCurrency { get; set; } = "USD";
        
        // Compliance properties
        public bool HipaaCompliant { get; set; } = false;
        public bool NabhAccredited { get; set; } = false;
        public bool GdprCompliant { get; set; } = false;
        public bool DpaCompliant { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public Guid? CreatedBy { get; set; }
        public Guid? UpdatedBy { get; set; }
    }
}