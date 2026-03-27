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
        public string? NpiNumber { get; set; } // National Provider Identifier
        public DateTime? ProfessionalRegistrationDate { get; set; }
        
        // Organization fields
        public Guid? OrganizationId { get; set; }
        public Guid? BranchId { get; set; }
        
        // Custom fields
        public string UserType { get; set; } = "Staff"; // Staff, Patient, Admin
        public string UserStatus { get; set; } = "pending_activation"; // pending_invitation, pending_activation, active, locked, inactive, deleted
        public DateTime? InitialPasswordCreatedAt { get; set; }
        public DateTime? LastPasswordChangeAt { get; set; }
        public DateTime? PasswordExpiresAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public bool MustChangePasswordOnLogin { get; set; } = true;

        // Activation and password reset fields (new)
        public string? ActivationStatus { get; set; } = "active"; // created, invitation_sent, email_verified, password_set, terms_accepted, mfa_enrolled, active, locked, inactive, deleted
        public string? OneTimePasswordHash { get; set; }
        public DateTime? OtpExpiresAt { get; set; }
        public bool MustResetPassword { get; set; } = false;
        public string? PasswordResetToken { get; set; }
        public DateTime? ResetTokenExpiresAt { get; set; }
        public DateTime? LastPasswordChange { get; set; }
        
        // Email verification
        public bool EmailVerified { get; set; } = false;
        public string? EmailVerificationToken { get; set; }
        public DateTime? EmailVerificationSentAt { get; set; }
        
        // Account lockout tracking
        public int FailedLoginAttempts { get; set; } = 0;
        public DateTime? LockedUntil { get; set; }
        public string? LastLoginIp { get; set; }
        
        // HIPAA Compliance tracking (added for activation flow)
        public bool AcceptedTerms { get; set; } = false;
        public DateTime? AcceptedTermsAt { get; set; }
        public bool AcceptedPrivacy { get; set; } = false;
        public DateTime? AcceptedPrivacyAt { get; set; }
        public bool AcceptedHipaa { get; set; } = false;
        public DateTime? AcceptedHipaaAt { get; set; }
        public string? ComplianceAcceptanceIp { get; set; }
        
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        public Guid? CreatedBy { get; set; }
        public Guid? UpdatedBy { get; set; }

        // Navigation properties
        public ICollection<AppUserRole> UserRoles { get; set; } = new List<AppUserRole>();
        public ICollection<UserAttribute> UserAttributes { get; set; } = new List<UserAttribute>();
    }
}