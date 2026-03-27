using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using AuthService.Models.Identity;

namespace AuthService.Models.Domain
{
    // Employment Type Lookup (12 types defined in 01_employment_tables.sql)
    public class EmploymentTypeLookup
    {
        public Guid Id { get; set; }
        public string TypeCode { get; set; } = string.Empty; // permanent, contract, part_time, etc.
        public string TypeName { get; set; } = string.Empty; // "Permanent Staff", "Contract", etc.
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public int DisplayOrder { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid? CreatedByUserId { get; set; }
    }

    // Employment Category Lookup (5 categories)
    public class EmploymentCategoryLookup
    {
        public Guid Id { get; set; }
        public string CategoryCode { get; set; } = string.Empty; // staff, patient, vendor, external, system
        public string CategoryName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public int DisplayOrder { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid? CreatedByUserId { get; set; }
    }

    // Employee Table - Hybrid with AspNetUsers (matches 01_employment_tables.sql)
    public class Employee
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        
        // Foreign Keys
        public Guid UserId { get; set; }  // Links to AspNetUsers
        public Guid? EmploymentTypeId { get; set; }
        public Guid? BranchId { get; set; }
        public Guid? DepartmentId { get; set; }
        public Guid? ManagerId { get; set; }
        
        // Employment Details
        public string? EmployeeNumber { get; set; }
        public DateTime HireDate { get; set; } // hire_date in DB
        public string EmploymentStatus { get; set; } = "active";
        public string? JobTitle { get; set; }
        
        // Probation & Contract
        public DateTime? ProbationEndDate { get; set; }
        public DateTime? ConfirmationDate { get; set; }
        public DateTime? ContractEndDate { get; set; }
        public DateTime? ResignationDate { get; set; }
        public DateTime? TerminationDate { get; set; }
        public DateTime? LastWorkingDate { get; set; }
        
        // Emergency Contact
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactRelationship { get; set; }
        public string? EmergencyContactPhone { get; set; }
        public string? EmergencyContactEmail { get; set; }
        public string? EmergencyContactAddress { get; set; }
        
        // Compensation & Benefits
        public string? SalaryGrade { get; set; }
        public decimal? BaseSalary { get; set; } // base_salary in DB
        public string? Currency { get; set; }
        public string? BenefitsPackage { get; set; } // JSONB in DB
        public string? PayrollFrequency { get; set; }
        public string? BankAccountNumber { get; set; }
        public string? BankName { get; set; }
        public string? BankBranch { get; set; }
        public string? TaxId { get; set; }
        
        // Work Schedule
        public string? WorkSchedule { get; set; } // JSONB in DB
        public decimal? WeeklyHours { get; set; }
        public string? ShiftPattern { get; set; }
        
        // Additional Info
        public string? MaritalStatus { get; set; }
        public int? DependentsCount { get; set; }
        public string? BloodGroup { get; set; }
        public string? Allergies { get; set; }
        public string? MedicalConditions { get; set; }
        
        // Standard Audit Fields
        public string Status { get; set; } = "active";
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        public Guid? CreatedByUserId { get; set; }
        public Guid? UpdatedByUserId { get; set; }
        public Guid? DeletedByUserId { get; set; } // deleted_by in DB
        
        // Navigation Properties
        public AppUser? User { get; set; }
        public EmploymentTypeLookup? EmploymentType { get; set; }
        public Branch? Branch { get; set; }
        public Department? Department { get; set; }
        public Employee? Manager { get; set; }
    }

    // Employment Contract Table
    public class EmploymentContract
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid EmployeeId { get; set; }
        
        public string ContractType { get; set; } = string.Empty; // fixed_term, permanent, probationary
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? ContractTerms { get; set; }
        public string? DocumentUrl { get; set; }
        public bool AutoRenewal { get; set; }
        public int? RenewalNoticeDays { get; set; }
        public string RenewalStatus { get; set; } = "pending"; // pending, approved, renewed, expired
        
        // Audit Fields
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? CreatedByUserId { get; set; }
        public Guid? UpdatedByUserId { get; set; }
        public DateTime? DeletedAt { get; set; }
        public Guid? DeletedByUserId { get; set; }
        public string Status { get; set; } = "active";
        
        // Navigation
        public Employee? Employee { get; set; }
    }

    // Professional License Table
    public class ProfessionalLicense
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid? UserId { get; set; } // Links to users table (nullable - license can exist before assignment)
        
        // License Details
        public string LicenseType { get; set; } = string.Empty; // medical_council, nursing_council, pharmacy_council
        public string? LicenseCategory { get; set; } // medical_doctor, registered_nurse, pharmacist, specialist
        public string? LicenseNumber { get; set; }
        public string? IssuingAuthority { get; set; }
        public string? IssuingCountry { get; set; }
        public string? IssuingState { get; set; }
        
        // Dates
        public DateTime? IssueDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public DateTime? RenewalDate { get; set; }
        
        // Renewal Management
        public int RenewalReminderDays { get; set; } = 90;
        public DateTime? LastReminderSentAt { get; set; }
        public string RenewalStatus { get; set; } = "active"; // active, expiring, expired, renewed, suspended
        
        // Verification
        public string VerificationStatus { get; set; } = "pending"; // pending, verified, rejected, expired
        public DateTime? VerifiedAt { get; set; }
        public Guid? VerifiedByUserId { get; set; }
        public string? VerificationNotes { get; set; }
        
        // Document Management
        public string? DocumentUrl { get; set; }
        public string? RenewalDocumentUrl { get; set; }
        
        // Scope of Practice
        public string? ScopeOfPractice { get; set; }
        public string? Restrictions { get; set; }
        public string? Specializations { get; set; } // JSONB in DB, string in model
        
        // Audit Fields
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? CreatedByUserId { get; set; }
        public Guid? UpdatedByUserId { get; set; }
        public DateTime? DeletedAt { get; set; }
        public Guid? DeletedByUserId { get; set; }
        public string Status { get; set; } = "active";
        
        // Computed Property
        public int? DaysUntilExpiry
        {
            get
            {
                if (!ExpiryDate.HasValue) return null;
                return (int)(ExpiryDate.Value - DateTime.UtcNow).TotalDays;
            }
        }
        
        // Navigation
        public AppUser? User { get; set; }
        public AppUser? VerifiedByUser { get; set; }
    }

    // Probation Tracking Table
    public class ProbationTracking
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid EmployeeId { get; set; }
        
        public DateTime ProbationStartDate { get; set; }
        public DateTime ProbationEndDate { get; set; }
        public string ProbationStatus { get; set; } = "in_progress"; // in_progress, passed, failed, extended
        public DateTime? ConfirmationDate { get; set; }
        public Guid? ReviewedByUserId { get; set; }
        public string? ReviewNotes { get; set; }
        public int? ExtensionDays { get; set; }
        
        // Audit Fields
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? CreatedByUserId { get; set; }
        public Guid? UpdatedByUserId { get; set; }
        public DateTime? DeletedAt { get; set; }
        public Guid? DeletedByUserId { get; set; }
        public string Status { get; set; } = "active";
        
        // Navigation
        public Employee? Employee { get; set; }
        public AppUser? ReviewedBy { get; set; }
    }
}
