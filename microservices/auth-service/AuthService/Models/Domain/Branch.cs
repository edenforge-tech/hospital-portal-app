using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain
{
    /// <summary>
    /// Comprehensive Branch entity for HIPAA, NABH, GDPR-compliant healthcare facility management
    /// Total Properties: 100+ (covering all healthcare standards and operational requirements)
    /// </summary>
    [Table("branch")]
    public class Branch
    {
        // ============================================================================
        // CORE IDENTIFICATION FIELDS
        // ============================================================================
        public Guid Id { get; set; }
        public int BranchId { get; set; }
        public Guid TenantId { get; set; }
        public Guid OrganizationId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? BranchCode { get; set; }
        
        [NotMapped] // Column does not exist in database
        public string? LocationCode { get; set; }
        
        public string? Description { get; set; }
        public string Status { get; set; } = "Active"; // Active, Inactive, Pending, Suspended
        public string OperationalStatus { get; set; } = "Operational"; // Operational, Closed, Under Maintenance
        public string? Region { get; set; }
        
        // ============================================================================
        // BRANCH TYPE & CLASSIFICATION
        // ============================================================================
        public bool IsVirtual { get; set; } = false;
        public bool IsMainBranch { get; set; } = false;
        public string? LicenseNumber { get; set; }
        
        // ============================================================================
        // ADDRESS FIELDS (Individual columns for queries + JSONB for flexibility)
        // ============================================================================
        public string? Address { get; set; } // JSONB in database
        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? City { get; set; }
        public string? StateProvince { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
        public string? CountryCode { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        
        // ============================================================================
        // CONTACT INFORMATION (Individual + JSONB)
        // ============================================================================
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Fax { get; set; }
        public string? ContactInfo { get; set; } // JSONB for additional contacts
        
        // ============================================================================
        // OPERATIONAL SETTINGS
        // ============================================================================
        public string? Timezone { get; set; }
        public string? CurrencyCode { get; set; }
        public string LanguagePrimary { get; set; } = "en";
        public TimeSpan? OperationalHoursStart { get; set; }
        public TimeSpan? OperationalHoursEnd { get; set; }
        public string? OperatingHours { get; set; } // JSONB for flexible hours (weekday/weekend)
        public bool EmergencySupport24x7 { get; set; } = true;
        
        // ============================================================================
        // STATISTICS
        // ============================================================================
        public int TotalDepartments { get; set; } = 0;
        public int TotalStaff { get; set; } = 0;
        
        // ============================================================================
        // STRUCTURED DATA (JSONB columns for flexible data)
        // ============================================================================
        public string? Facilities { get; set; } // JSONB - equipment, amenities
        public string? CapacityInfo { get; set; } // JSONB - beds, rooms, patients
        public string? BranchSettings { get; set; } // JSONB - custom configurations
        
        // ============================================================================
        // HIPAA COMPLIANCE FIELDS
        // ============================================================================
        public bool HipaaCoveredEntity { get; set; } = false;
        public bool BusinessAssociate { get; set; } = false;
        public bool PhiStorageApproved { get; set; } = false;
        public bool EncryptionAtRest { get; set; } = true;
        public bool EncryptionInTransit { get; set; } = true;
        public string AccessControlLevel { get; set; } = "Standard"; // Standard, Restricted, High-Security, Maximum-Security
        public DateTime? LastSecurityAuditDate { get; set; }
        public DateTime? NextSecurityAuditDate { get; set; }
        public string HipaaComplianceStatus { get; set; } = "Pending"; // Compliant, Pending, Non-Compliant, Under-Review
        public DateTime? HipaaCertificationDate { get; set; }
        public DateTime? HipaaCertificationExpiry { get; set; }
        public Guid? PrivacyOfficerId { get; set; }
        public Guid? SecurityOfficerId { get; set; }
        
        // ============================================================================
        // NABH (National Accreditation Board for Hospitals) ACCREDITATION
        // ============================================================================
        public bool NabhAccredited { get; set; } = false;
        public string? NabhAccreditationLevel { get; set; } // Pre-Entry, Entry, Full, Gold
        public string? NabhCertificateNumber { get; set; }
        public DateTime? NabhAccreditationDate { get; set; }
        public DateTime? NabhAccreditationExpiry { get; set; }
        public DateTime? NabhLastAuditDate { get; set; }
        public DateTime? NabhNextAuditDate { get; set; }
        
        // ============================================================================
        // QUALITY CERTIFICATIONS
        // ============================================================================
        public bool IsoCertified { get; set; } = false;
        public string? IsoCertificateNumber { get; set; }
        public bool JciAccredited { get; set; } = false;
        public string? QualityCertifications { get; set; } // JSONB array of certifications
        
        // ============================================================================
        // PATIENT SAFETY & INFECTION CONTROL
        // ============================================================================
        public bool InfectionControlCertified { get; set; } = false;
        public bool PatientSafetyCertified { get; set; } = false;
        public bool FireSafetyCertified { get; set; } = false;
        public bool DisasterPreparednessPlan { get; set; } = false;
        
        // ============================================================================
        // GDPR/DPA COMPLIANCE
        // ============================================================================
        public bool GdprCompliant { get; set; } = false;
        public bool DpaRegistered { get; set; } = false;
        public Guid? DataProtectionOfficerId { get; set; }
        public string DataRetentionPolicy { get; set; } = "7years"; // 1year, 3years, 5years, 7years, 10years, indefinite
        public bool RightToErasureEnabled { get; set; } = true;
        
        // ============================================================================
        // ACCESSIBILITY (ADA/Disability Act Compliance)
        // ============================================================================
        public bool WheelchairAccessible { get; set; } = true;
        public string? AccessibilityFeatures { get; set; } // JSONB - ramps, elevators, parking, etc.
        
        // ============================================================================
        // EMERGENCY SERVICES
        // ============================================================================
        public bool EmergencyServicesAvailable { get; set; } = false;
        public string? TraumaCenterLevel { get; set; } // Level I, Level II, Level III, Level IV, Level V
        public bool AmbulanceServices { get; set; } = false;
        public bool HelipadAvailable { get; set; } = false;
        
        // ============================================================================
        // MEDICAL SPECIALTIES & SERVICES
        // ============================================================================
        public string? MedicalSpecialties { get; set; } // JSONB array - Cardiology, Neurology, etc.
        public bool TelemedicineEnabled { get; set; } = false;
        public bool PharmacyOnSite { get; set; } = false;
        public bool LaboratoryServices { get; set; } = false;
        public string? ImagingServices { get; set; } // JSONB - X-ray, MRI, CT scan, etc.
        
        // ============================================================================
        // CAPACITY MANAGEMENT
        // ============================================================================
        public int BedCapacityTotal { get; set; } = 0;
        public int BedCapacityIcu { get; set; } = 0;
        public int BedCapacityGeneral { get; set; } = 0;
        public int BedCapacityEmergency { get; set; } = 0;
        public decimal CurrentOccupancyRate { get; set; } = 0.00m; // Percentage 0-100
        public bool AcceptsNewPatients { get; set; } = true;
        
        // ============================================================================
        // INSURANCE & BILLING
        // ============================================================================
        public string? InsuranceProvidersAccepted { get; set; } // JSONB array
        public string? BillingTypesAccepted { get; set; } // JSONB array - Cash, Insurance, Government
        public bool PaymentPlansAvailable { get; set; } = true;
        
        // ============================================================================
        // STAFF MANAGEMENT (Leadership Roles)
        // ============================================================================
        public Guid? BranchManagerId { get; set; }
        public Guid? MedicalDirectorId { get; set; }
        public Guid? NursingSupervisorId { get; set; }
        
        // ============================================================================
        // STAFF COUNTS BY CATEGORY
        // ============================================================================
        public int TotalPhysicians { get; set; } = 0;
        public int TotalNurses { get; set; } = 0;
        public int TotalAdministrativeStaff { get; set; } = 0;
        
        // ============================================================================
        // AUDIT FIELDS (Soft Delete Support)
        // ============================================================================
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public Guid? CreatedBy { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? DeletedAt { get; set; }
        public Guid? DeletedBy { get; set; }
        
        // ============================================================================
        // NAVIGATION PROPERTIES
        // ============================================================================
        public Tenant? Tenant { get; set; }
        public Organization? Organization { get; set; }
        
        // ============================================================================
        // COMPUTED PROPERTIES (Not mapped to database)
        // ============================================================================
        public bool IsActive => Status == "Active" && DeletedAt == null;
        public bool IsOperational => OperationalStatus == "Operational" && IsActive;
        public bool IsCompliant => HipaaComplianceStatus == "Compliant" && GdprCompliant;
        public bool HasEmergencyServices => EmergencyServicesAvailable || EmergencySupport24x7;
        public int TotalBedCapacity => BedCapacityIcu + BedCapacityGeneral + BedCapacityEmergency;
        public int AvailableBeds => (int)(TotalBedCapacity * (1 - CurrentOccupancyRate / 100));
        public bool RequiresSecurityAudit => NextSecurityAuditDate.HasValue && NextSecurityAuditDate.Value <= DateTime.UtcNow.AddDays(30);
        public bool RequiresNabhAudit => NabhNextAuditDate.HasValue && NabhNextAuditDate.Value <= DateTime.UtcNow.AddDays(30);
    }
}