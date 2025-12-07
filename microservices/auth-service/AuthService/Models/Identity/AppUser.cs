using Microsoft.AspNetCore.Identity;
using System;
using AuthService.Models.Domain;

namespace AuthService.Models.Identity
{
    public class AppUser : IdentityUser<Guid>
    {
        public Guid TenantId { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? Qualifications { get; set; }
        public string? Specialization { get; set; }
        public string? EmployeeId { get; set; }
        
        // Professional fields
        public string? Designation { get; set; }
        public string? LicenseNumber { get; set; }
        public DateTime? ProfessionalRegistrationDate { get; set; }
        
        // Organization fields
        public Guid? OrganizationId { get; set; }
        public Guid? BranchId { get; set; }
        
        // Custom fields
        public string UserType { get; set; } = "Staff"; // Staff, Patient, Admin
        public string UserStatus { get; set; } = "PendingFirstLogin"; // Active, Inactive, Locked, PendingFirstLogin
        public DateTime? InitialPasswordCreatedAt { get; set; }
        public DateTime? LastPasswordChangeAt { get; set; }
        public DateTime? PasswordExpiresAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public bool MustChangePasswordOnLogin { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? DeletedAt { get; set; }
        public Guid? CreatedBy { get; set; }
        public Guid? UpdatedBy { get; set; }

        // Navigation properties
        public ICollection<AppUserRole> UserRoles { get; set; } = new List<AppUserRole>();
        public ICollection<UserAttribute> UserAttributes { get; set; } = new List<UserAttribute>();
    }
}