using AuthService.Models.Identity;
using AuthService.Models.Domain;
using AuthService.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;

namespace AuthService.Context
{
    public class AppDbContext : IdentityDbContext<
        AppUser, 
        AppRole, 
        Guid, 
        AppUserClaim, 
        AppUserRole, 
        AppUserLogin, 
        AppRoleClaim, 
        AppUserToken>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AppDbContext(
            DbContextOptions<AppDbContext> options,
            IHttpContextAccessor httpContextAccessor) : base(options)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        /// <summary>
        /// Sets the tenant context for Row-Level Security (RLS) in PostgreSQL
        /// This ensures the database filters queries based on tenant_id
        /// </summary>
        private async Task SetTenantContextAsync()
        {
            var tenantId = GetCurrentTenantId();
            
            // Set PostgreSQL session variable for RLS policies
            if (Database.IsRelational() && !string.IsNullOrEmpty(Database.GetConnectionString()))
            {
                await Database.ExecuteSqlRawAsync(
                    $"SELECT set_config('app.current_tenant_id', '{tenantId}', false)");
            }
        }

        public DbSet<Tenant> Tenants { get; set; }
        public DbSet<Organization> Organizations { get; set; }
        public DbSet<Branch> Branches { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<UserDepartment> UserDepartments { get; set; }
        public DbSet<UserBranch> UserBranches { get; set; }
        public DbSet<PasswordResetRequest> PasswordResetRequests { get; set; }
        public DbSet<UserActivationLog> UserActivationLogs { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<SystemAlert> SystemAlerts { get; set; }
        public DbSet<FailedLoginAttempt> FailedLoginAttempts { get; set; }
        public DbSet<ActivationAuditLog> ActivationAuditLogs { get; set; }
        public DbSet<UserAttribute> UserAttributes { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<ClinicalExamination> ClinicalExaminations { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<PatientDocumentUpload> PatientDocumentUploads { get; set; }
        public DbSet<DocumentAccessAudit> DocumentAccessAudits { get; set; }
        public DbSet<AdminConfiguration> AdminConfigurations { get; set; }
        public DbSet<SystemSetting> SystemSettings { get; set; }
        
        // Device & Session Management (Tasks 7-12 Backend Implementation)
        public DbSet<Device> Devices { get; set; }
        public DbSet<UserSession> UserSessions { get; set; }
        public DbSet<AccessPolicy> AccessPolicies { get; set; }
        public DbSet<EmergencyAccess> EmergencyAccesses { get; set; }
        
        // Department Access Approval & Audit (Phase 1 Critical Features - Dec 9, 2025)
        public DbSet<DepartmentAccessRequest> DepartmentAccessRequests { get; set; }
        public DbSet<DepartmentAccessAuditLog> DepartmentAccessAuditLogs { get; set; }
        
        // Advanced Access Management - Admin Configuration (Dec 9, 2025)
        public DbSet<AuthService.Models.Department.DepartmentAccessRule> DepartmentAccessRules { get; set; }
        public DbSet<AuthService.Models.Department.SupervisedUser> SupervisedUsers { get; set; }
        public DbSet<AuthService.Models.Department.SupervisorAssignment> SupervisorAssignments { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // ✅ FIX: PostgreSQL DateTime UTC Compatibility
            // Configure all DateTime properties to use UTC kind
            // This prevents "Cannot write DateTime with Kind=Unspecified to PostgreSQL type 'timestamp with time zone'"
            var dateTimeConverter = new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateTime, DateTime>(
                v => DateTime.SpecifyKind(v, DateTimeKind.Utc),
                v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

            var nullableDateTimeConverter = new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateTime?, DateTime?>(
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v);

            foreach (var entityType in builder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(DateTime))
                    {
                        property.SetValueConverter(dateTimeConverter);
                    }
                    else if (property.ClrType == typeof(DateTime?))
                    {
                        property.SetValueConverter(nullableDateTimeConverter);
                    }
                }
            }

            // Configure Identity tables
            builder.Entity<AppUser>(entity =>
            {
                entity.ToTable("users");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.TenantId).HasColumnName("tenant_id");
                entity.Property(e => e.UserName).HasColumnName("user_name");
                entity.Property(e => e.NormalizedUserName).HasColumnName("normalized_user_name");
                entity.Property(e => e.Email).HasColumnName("email");
                entity.Property(e => e.NormalizedEmail).HasColumnName("normalized_email");
                entity.Property(e => e.EmailConfirmed).HasColumnName("email_confirmed");
                entity.Property(e => e.PasswordHash).HasColumnName("password_hash");
                entity.Property(e => e.SecurityStamp).HasColumnName("security_stamp");
                entity.Property(e => e.ConcurrencyStamp).HasColumnName("concurrency_stamp");
                entity.Property(e => e.PhoneNumber).HasColumnName("phone_number");
                entity.Property(e => e.PhoneNumberConfirmed).HasColumnName("phone_number_confirmed");
                entity.Property(e => e.TwoFactorEnabled).HasColumnName("two_factor_enabled");
                entity.Property(e => e.LockoutEnd).HasColumnName("lockout_end");
                entity.Property(e => e.LockoutEnabled).HasColumnName("lockout_enabled");
                entity.Property(e => e.AccessFailedCount).HasColumnName("access_failed_count");
                
                // New activation and password reset columns
                entity.Property(e => e.ActivationStatus).HasColumnName("activation_status");
                entity.Property(e => e.OneTimePasswordHash).HasColumnName("one_time_password_hash");
                entity.Property(e => e.OtpExpiresAt).HasColumnName("otp_expires_at");
                entity.Property(e => e.MustResetPassword).HasColumnName("must_reset_password");
                entity.Property(e => e.PasswordResetToken).HasColumnName("password_reset_token");
                entity.Property(e => e.ResetTokenExpiresAt).HasColumnName("reset_token_expires_at");
                entity.Property(e => e.LastPasswordChange).HasColumnName("last_password_change");
                entity.Property(e => e.EmailVerified).HasColumnName("email_verified");
                entity.Property(e => e.EmailVerificationToken).HasColumnName("email_verification_token");
                entity.Property(e => e.EmailVerificationSentAt).HasColumnName("email_verification_sent_at");
                entity.Property(e => e.FailedLoginAttempts).HasColumnName("failed_login_attempts");
                entity.Property(e => e.LockedUntil).HasColumnName("locked_until");
                entity.Property(e => e.LastLoginIp).HasColumnName("last_login_ip");
                
                // Professional fields
                entity.Property(e => e.Designation).HasColumnName("designation");
                entity.Property(e => e.LicenseNumber).HasColumnName("license_number");
                entity.Property(e => e.NpiNumber).HasColumnName("npi_number");
                entity.Property(e => e.ProfessionalRegistrationDate).HasColumnName("professional_registration_date");
                
                // HIPAA Compliance acceptance tracking
                entity.Property(e => e.AcceptedTerms).HasColumnName("accepted_terms");
                entity.Property(e => e.AcceptedTermsAt).HasColumnName("accepted_terms_at");
                entity.Property(e => e.AcceptedPrivacy).HasColumnName("accepted_privacy");
                entity.Property(e => e.AcceptedPrivacyAt).HasColumnName("accepted_privacy_at");
                entity.Property(e => e.AcceptedHipaa).HasColumnName("accepted_hipaa");
                entity.Property(e => e.AcceptedHipaaAt).HasColumnName("accepted_hipaa_at");
                entity.Property(e => e.ComplianceAcceptanceIp).HasColumnName("compliance_acceptance_ip");
                
                entity.HasIndex(e => new { e.TenantId, e.UserName }).IsUnique();
                entity.HasIndex(e => new { e.TenantId, e.Email }).IsUnique();
            });

            builder.Entity<AppRole>(entity =>
            {
                entity.ToTable("app_roles");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.TenantId).HasColumnName("tenant_id");
                entity.Property(e => e.Name).HasColumnName("name");
            });

            builder.Entity<AppUserRole>(entity =>
            {
                entity.ToTable("app_user_roles");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.RoleId).HasColumnName("role_id");
                entity.Property(e => e.BranchId).HasColumnName("branch_id");
                entity.HasOne(e => e.User)
                    .WithMany(u => u.UserRoles)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Role)
                    .WithMany(r => r.UserRoles)
                    .HasForeignKey(e => e.RoleId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<AppRoleClaim>(entity =>
            {
                entity.ToTable("app_role_claims");
            });

            builder.Entity<AppUserClaim>(entity =>
            {
                entity.ToTable("app_user_claims");
            });

            builder.Entity<AppUserLogin>(entity =>
            {
                entity.ToTable("app_user_logins");
            });

            builder.Entity<AppUserToken>(entity =>
            {
                entity.ToTable("app_user_tokens");
            });

            builder.Entity<Tenant>(entity =>
            {
                entity.ToTable("tenant");
                entity.Property(e => e.Id).HasColumnName("id").ValueGeneratedOnAdd();
                entity.HasKey(e => e.Id);
                
                // Map properties to actual database columns (snake_case)
                entity.Property(e => e.Name).HasColumnName("name");
                entity.Property(e => e.TenantCode).HasColumnName("tenant_code");
                entity.Property(e => e.TenantType).HasColumnName("tenant_type");
                entity.Property(e => e.Email).HasColumnName("company_email");
                entity.Property(e => e.Phone).HasColumnName("company_phone");
                entity.Property(e => e.Status).HasColumnName("status");
                entity.Property(e => e.SubscriptionTier).HasColumnName("subscription_type");
                entity.Property(e => e.MaxBranches).HasColumnName("max_branches");
                entity.Property(e => e.MaxUsers).HasColumnName("max_users");
                entity.Property(e => e.HipaaCompliant).HasColumnName("hipaa_compliant");
                entity.Property(e => e.NabhAccredited).HasColumnName("nabh_accredited");
                entity.Property(e => e.GdprCompliant).HasColumnName("gdpr_compliant");
                entity.Property(e => e.DpaCompliant).HasColumnName("dpa_compliant");
                entity.Property(e => e.PrimaryRegion).HasColumnName("primary_region");
                entity.Property(e => e.DefaultCurrency).HasColumnName("default_currency");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");
                entity.Property(e => e.IsActive).HasColumnName("is_active");
                
                // Address fields
                entity.Property(e => e.Address).HasColumnName("address");
                entity.Property(e => e.City).HasColumnName("city");
                entity.Property(e => e.State).HasColumnName("state");
                entity.Property(e => e.Country).HasColumnName("country");
                entity.Property(e => e.Pincode).HasColumnName("pincode");
                
                // Ignore properties that don't have database columns
                entity.Ignore(e => e.RegistrationNumber);
                entity.Ignore(e => e.CreatedBy);
            });

            // Organization Entity Configuration - Simplified to match actual database schema (11 columns)
            builder.Entity<Organization>(entity =>
            {
                entity.ToTable("organization");
                
                // Primary Key
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
                
                // Auto-increment Organization ID
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").ValueGeneratedOnAdd();
                
                // Foreign Key to Tenant
                entity.Property(e => e.TenantId).HasColumnName("tenant_id").IsRequired();
                
                // Basic Information
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(128).IsRequired();
                entity.Property(e => e.OrganizationCode).HasColumnName("organization_code").HasMaxLength(16);
                entity.Property(e => e.OrganizationName).HasColumnName("organization_name").HasMaxLength(128);
                
                // Location
                entity.Property(e => e.CountryCode).HasColumnName("country_code").HasMaxLength(4);
                entity.Property(e => e.StateProvince).HasColumnName("state_province").HasMaxLength(64);
                entity.Property(e => e.City).HasColumnName("city").HasMaxLength(64);
                entity.Property(e => e.Address).HasColumnName("address").HasMaxLength(255);
                entity.Property(e => e.PostalCode).HasColumnName("postal_code").HasMaxLength(16);
                
                // Contact Information
                entity.Property(e => e.Email).HasColumnName("email").HasMaxLength(128);
                entity.Property(e => e.Phone).HasColumnName("phone").HasMaxLength(32);
                entity.Property(e => e.Website).HasColumnName("website").HasMaxLength(500);
                entity.Property(e => e.PrimaryContactName).HasColumnName("primary_contact_name").HasMaxLength(200);
                entity.Property(e => e.PrimaryContactEmail).HasColumnName("primary_contact_email").HasMaxLength(200);
                entity.Property(e => e.PrimaryContactPhone).HasColumnName("primary_contact_phone").HasMaxLength(50);
                
                // Business Information
                entity.Property(e => e.Description).HasColumnName("description");
                entity.Property(e => e.OperationalSince).HasColumnName("operational_since");
                
                // Configuration
                entity.Property(e => e.CurrencyCode).HasColumnName("currency_code").HasMaxLength(8);
                entity.Property(e => e.LanguageCode).HasColumnName("language_code").HasMaxLength(8);
                entity.Property(e => e.Timezone).HasColumnName("timezone").HasMaxLength(64).HasDefaultValue("UTC");
                entity.Property(e => e.DateFormat).HasColumnName("date_format").HasMaxLength(32);
                entity.Property(e => e.TimeFormat).HasColumnName("time_format").HasMaxLength(16);
                entity.Property(e => e.NumberFormat).HasColumnName("number_format").HasMaxLength(32);
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(16).HasDefaultValue("Active");
                
                // Regulatory & Compliance
                entity.Property(e => e.RegulatoryBody).HasColumnName("regulatory_body").HasMaxLength(128);
                entity.Property(e => e.LicenseNumber).HasColumnName("license_number").HasMaxLength(64);
                entity.Property(e => e.AccreditationStatus).HasColumnName("accreditation_status").HasMaxLength(64);
                
                // Branding
                entity.Property(e => e.LogoUrl).HasColumnName("logo_url").HasMaxLength(512);
                entity.Property(e => e.PrimaryColor).HasColumnName("primary_color").HasMaxLength(16);
                entity.Property(e => e.SecondaryColor).HasColumnName("secondary_color").HasMaxLength(16);
                
                // Relationships
                entity.HasOne(e => e.Tenant)
                    .WithMany()
                    .HasForeignKey(e => e.TenantId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                // Indexes
                entity.HasIndex(e => e.TenantId);
                entity.HasIndex(e => e.OrganizationCode);
                entity.HasIndex(e => e.Status);
            });

            // Branch Entity Configuration - Comprehensive HIPAA/NABH/GDPR-compliant healthcare facility
            builder.Entity<Branch>(entity =>
            {
                entity.ToTable("branch");
                
                // ============================================================================
                // PRIMARY KEYS & IDENTIFICATION
                // ============================================================================
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
                entity.Property(e => e.BranchId).HasColumnName("branch_id").ValueGeneratedOnAdd();
                
                // ============================================================================
                // FOREIGN KEYS
                // ============================================================================
                entity.Property(e => e.TenantId).HasColumnName("tenant_id").IsRequired();
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                
                // ============================================================================
                // CORE FIELDS
                // ============================================================================
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(128).IsRequired();
                entity.Property(e => e.BranchCode).HasColumnName("branch_code").HasMaxLength(16);
                // LocationCode column removed - not in database
                // entity.Property(e => e.LocationCode).HasColumnName("location_code");
                entity.Property(e => e.Description).HasColumnName("description");
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(16).HasDefaultValue("Active");
                entity.Property(e => e.OperationalStatus).HasColumnName("operational_status").HasMaxLength(50).HasDefaultValue("Operational");
                entity.Property(e => e.Region).HasColumnName("region").HasMaxLength(50);
                
                // ============================================================================
                // BRANCH TYPE
                // ============================================================================
                entity.Property(e => e.BranchType).HasColumnName("branch_type").HasMaxLength(50);
                entity.Property(e => e.IsVirtual).HasColumnName("is_virtual").HasDefaultValue(false);
                entity.Property(e => e.IsMainBranch).HasColumnName("is_main_branch").HasDefaultValue(false);
                entity.Property(e => e.LicenseNumber).HasColumnName("license_number").HasMaxLength(64);
                
                // ============================================================================
                // ADDRESS FIELDS (Mix of individual columns and JSONB)
                // ============================================================================
                entity.Property(e => e.Address).HasColumnName("address").HasColumnType("jsonb");
                entity.Property(e => e.AddressLine1).HasColumnName("address_line_1").HasMaxLength(255);
                entity.Property(e => e.AddressLine2).HasColumnName("address_line_2").HasMaxLength(255);
                entity.Property(e => e.City).HasColumnName("city").HasMaxLength(64);
                entity.Property(e => e.StateProvince).HasColumnName("state_province").HasMaxLength(100);
                entity.Property(e => e.PostalCode).HasColumnName("postal_code").HasMaxLength(16);
                entity.Property(e => e.Country).HasColumnName("country").HasMaxLength(100);
                entity.Property(e => e.CountryCode).HasColumnName("country_code").HasMaxLength(4);
                entity.Property(e => e.Latitude).HasColumnName("latitude").HasColumnType("numeric");
                entity.Property(e => e.Longitude).HasColumnName("longitude").HasColumnType("numeric");
                
                // ============================================================================
                // CONTACT INFORMATION
                // ============================================================================
                entity.Property(e => e.Phone).HasColumnName("phone").HasMaxLength(20);
                entity.Property(e => e.Email).HasColumnName("email").HasMaxLength(255);
                entity.Property(e => e.Fax).HasColumnName("fax").HasMaxLength(20);
                entity.Property(e => e.Website).HasColumnName("website").HasMaxLength(500);
                entity.Property(e => e.ContactInfo).HasColumnName("contact_info").HasColumnType("jsonb");
                
                // ============================================================================
                // OPERATIONAL SETTINGS
                // ============================================================================
                entity.Property(e => e.Timezone).HasColumnName("timezone").HasMaxLength(64);
                entity.Property(e => e.CurrencyCode).HasColumnName("currency_code").HasMaxLength(8);
                entity.Property(e => e.LanguagePrimary).HasColumnName("language_primary").HasMaxLength(10).HasDefaultValue("en");
                entity.Property(e => e.OperationalHoursStart).HasColumnName("operational_hours_start");
                entity.Property(e => e.OperationalHoursEnd).HasColumnName("operational_hours_end");
                entity.Property(e => e.OperatingHours).HasColumnName("operating_hours").HasColumnType("jsonb");
                entity.Property(e => e.EmergencySupport24x7).HasColumnName("emergency_support_24_7").HasDefaultValue(true);
                
                // ============================================================================
                // STATISTICS
                // ============================================================================
                entity.Property(e => e.TotalDepartments).HasColumnName("total_departments").HasDefaultValue(0);
                entity.Property(e => e.TotalStaff).HasColumnName("total_staff").HasDefaultValue(0);
                
                // ============================================================================
                // STRUCTURED DATA (JSONB)
                // ============================================================================
                entity.Property(e => e.Facilities).HasColumnName("facilities").HasColumnType("jsonb");
                entity.Property(e => e.CapacityInfo).HasColumnName("capacity_info").HasColumnType("jsonb");
                entity.Property(e => e.BranchSettings).HasColumnName("branch_settings").HasColumnType("jsonb");
                
                // ============================================================================
                // HIPAA COMPLIANCE
                // ============================================================================
                entity.Property(e => e.HipaaCoveredEntity).HasColumnName("hipaa_covered_entity").HasDefaultValue(false);
                entity.Property(e => e.BusinessAssociate).HasColumnName("business_associate").HasDefaultValue(false);
                entity.Property(e => e.PhiStorageApproved).HasColumnName("phi_storage_approved").HasDefaultValue(false);
                entity.Property(e => e.EncryptionAtRest).HasColumnName("encryption_at_rest").HasDefaultValue(true);
                entity.Property(e => e.EncryptionInTransit).HasColumnName("encryption_in_transit").HasDefaultValue(true);
                entity.Property(e => e.AccessControlLevel).HasColumnName("access_control_level").HasMaxLength(50).HasDefaultValue("Standard");
                entity.Property(e => e.LastSecurityAuditDate).HasColumnName("last_security_audit_date");
                entity.Property(e => e.NextSecurityAuditDate).HasColumnName("next_security_audit_date");
                entity.Property(e => e.HipaaComplianceStatus).HasColumnName("hipaa_compliance_status").HasMaxLength(50).HasDefaultValue("Pending");
                entity.Property(e => e.HipaaCertificationDate).HasColumnName("hipaa_certification_date");
                entity.Property(e => e.HipaaCertificationExpiry).HasColumnName("hipaa_certification_expiry");
                entity.Property(e => e.PrivacyOfficerId).HasColumnName("privacy_officer_id");
                entity.Property(e => e.SecurityOfficerId).HasColumnName("security_officer_id");
                
                // ============================================================================
                // NABH ACCREDITATION
                // ============================================================================
                entity.Property(e => e.NabhAccredited).HasColumnName("nabh_accredited").HasDefaultValue(false);
                entity.Property(e => e.NabhAccreditationLevel).HasColumnName("nabh_accreditation_level").HasMaxLength(50);
                entity.Property(e => e.NabhCertificateNumber).HasColumnName("nabh_certificate_number").HasMaxLength(50);
                entity.Property(e => e.NabhAccreditationDate).HasColumnName("nabh_accreditation_date");
                entity.Property(e => e.NabhAccreditationExpiry).HasColumnName("nabh_accreditation_expiry");
                entity.Property(e => e.NabhLastAuditDate).HasColumnName("nabh_last_audit_date");
                entity.Property(e => e.NabhNextAuditDate).HasColumnName("nabh_next_audit_date");
                
                // ============================================================================
                // QUALITY CERTIFICATIONS
                // ============================================================================
                entity.Property(e => e.IsoCertified).HasColumnName("iso_certified").HasDefaultValue(false);
                entity.Property(e => e.IsoCertificateNumber).HasColumnName("iso_certificate_number").HasMaxLength(50);
                entity.Property(e => e.JciAccredited).HasColumnName("jci_accredited").HasDefaultValue(false);
                entity.Property(e => e.QualityCertifications).HasColumnName("quality_certifications").HasColumnType("jsonb");
                
                // ============================================================================
                // PATIENT SAFETY
                // ============================================================================
                entity.Property(e => e.InfectionControlCertified).HasColumnName("infection_control_certified").HasDefaultValue(false);
                entity.Property(e => e.PatientSafetyCertified).HasColumnName("patient_safety_certified").HasDefaultValue(false);
                entity.Property(e => e.FireSafetyCertified).HasColumnName("fire_safety_certified").HasDefaultValue(false);
                entity.Property(e => e.DisasterPreparednessPlan).HasColumnName("disaster_preparedness_plan").HasDefaultValue(false);
                
                // ============================================================================
                // GDPR/DPA COMPLIANCE
                // ============================================================================
                entity.Property(e => e.GdprCompliant).HasColumnName("gdpr_compliant").HasDefaultValue(false);
                entity.Property(e => e.DpaRegistered).HasColumnName("dpa_registered").HasDefaultValue(false);
                entity.Property(e => e.DataProtectionOfficerId).HasColumnName("data_protection_officer_id");
                entity.Property(e => e.DataRetentionPolicy).HasColumnName("data_retention_policy").HasMaxLength(50).HasDefaultValue("7years");
                entity.Property(e => e.RightToErasureEnabled).HasColumnName("right_to_erasure_enabled").HasDefaultValue(true);
                
                // ============================================================================
                // ACCESSIBILITY
                // ============================================================================
                entity.Property(e => e.WheelchairAccessible).HasColumnName("wheelchair_accessible").HasDefaultValue(true);
                entity.Property(e => e.AccessibilityFeatures).HasColumnName("accessibility_features").HasColumnType("jsonb");
                
                // ============================================================================
                // EMERGENCY SERVICES
                // ============================================================================
                entity.Property(e => e.EmergencyServicesAvailable).HasColumnName("emergency_services_available").HasDefaultValue(false);
                entity.Property(e => e.TraumaCenterLevel).HasColumnName("trauma_center_level").HasMaxLength(50);
                entity.Property(e => e.AmbulanceServices).HasColumnName("ambulance_services").HasDefaultValue(false);
                entity.Property(e => e.HelipadAvailable).HasColumnName("helipad_available").HasDefaultValue(false);
                
                // ============================================================================
                // MEDICAL SERVICES
                // ============================================================================
                entity.Property(e => e.MedicalSpecialties).HasColumnName("medical_specialties").HasColumnType("jsonb");
                entity.Property(e => e.TelemedicineEnabled).HasColumnName("telemedicine_enabled").HasDefaultValue(false);
                entity.Property(e => e.PharmacyOnSite).HasColumnName("pharmacy_on_site").HasDefaultValue(false);
                entity.Property(e => e.LaboratoryServices).HasColumnName("laboratory_services").HasDefaultValue(false);
                entity.Property(e => e.ImagingServices).HasColumnName("imaging_services").HasColumnType("jsonb");
                
                // ============================================================================
                // CAPACITY MANAGEMENT
                // ============================================================================
                entity.Property(e => e.BedCapacityTotal).HasColumnName("bed_capacity_total").HasDefaultValue(0);
                entity.Property(e => e.BedCapacityIcu).HasColumnName("bed_capacity_icu").HasDefaultValue(0);
                entity.Property(e => e.BedCapacityGeneral).HasColumnName("bed_capacity_general").HasDefaultValue(0);
                entity.Property(e => e.BedCapacityEmergency).HasColumnName("bed_capacity_emergency").HasDefaultValue(0);
                entity.Property(e => e.CurrentOccupancyRate).HasColumnName("current_occupancy_rate").HasColumnType("decimal(5,2)").HasDefaultValue(0.00m);
                entity.Property(e => e.AcceptsNewPatients).HasColumnName("accepts_new_patients").HasDefaultValue(true);
                
                // ============================================================================
                // INSURANCE & BILLING
                // ============================================================================
                entity.Property(e => e.InsuranceProvidersAccepted).HasColumnName("insurance_providers_accepted").HasColumnType("jsonb");
                entity.Property(e => e.BillingTypesAccepted).HasColumnName("billing_types_accepted").HasColumnType("jsonb");
                entity.Property(e => e.PaymentPlansAvailable).HasColumnName("payment_plans_available").HasDefaultValue(true);
                
                // ============================================================================
                // STAFF MANAGEMENT
                // ============================================================================
                entity.Property(e => e.BranchManagerId).HasColumnName("branch_manager_id");
                entity.Property(e => e.MedicalDirectorId).HasColumnName("medical_director_id");
                entity.Property(e => e.NursingSupervisorId).HasColumnName("nursing_supervisor_id");
                entity.Property(e => e.TotalPhysicians).HasColumnName("total_physicians").HasDefaultValue(0);
                entity.Property(e => e.TotalNurses).HasColumnName("total_nurses").HasDefaultValue(0);
                entity.Property(e => e.TotalAdministrativeStaff).HasColumnName("total_administrative_staff").HasDefaultValue(0);
                
                // ============================================================================
                // AUDIT FIELDS
                // ============================================================================
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()");
                entity.Property(e => e.CreatedBy).HasColumnName("created_by");
                entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");
                entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
                entity.Property(e => e.DeletedBy).HasColumnName("deleted_by");
                
                // ============================================================================
                // RELATIONSHIPS
                // ============================================================================
                entity.HasOne(e => e.Tenant)
                    .WithMany()
                    .HasForeignKey(e => e.TenantId)
                    .OnDelete(DeleteBehavior.Cascade);
                    
                entity.HasOne(e => e.Organization)
                    .WithMany(o => o.Branches)
                    .HasForeignKey(e => e.OrganizationId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                // ============================================================================
                // INDEXES FOR PERFORMANCE
                // ============================================================================
                entity.HasIndex(e => e.TenantId);
                entity.HasIndex(e => e.OrganizationId);
                entity.HasIndex(e => e.BranchCode);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.OperationalStatus);
                entity.HasIndex(e => e.HipaaComplianceStatus);
                entity.HasIndex(e => e.NabhAccredited);
                entity.HasIndex(e => e.EmergencyServicesAvailable);
                entity.HasIndex(e => e.AcceptsNewPatients);
                entity.HasIndex(e => e.DeletedAt); // For soft delete queries
                
                // ============================================================================
                // COMPUTED PROPERTIES (Ignore - not stored in database)
                // ============================================================================
                entity.Ignore(e => e.IsActive);
                entity.Ignore(e => e.IsOperational);
                entity.Ignore(e => e.IsCompliant);
                entity.Ignore(e => e.HasEmergencyServices);
                entity.Ignore(e => e.TotalBedCapacity);
                entity.Ignore(e => e.AvailableBeds);
                entity.Ignore(e => e.RequiresSecurityAudit);
                entity.Ignore(e => e.RequiresNabhAudit);
            });

            // Department Entity Configuration - Healthcare department with hierarchical structure
            builder.Entity<Department>(entity =>
            {
                entity.ToTable("department");

                // ============================================================================
                // PRIMARY KEYS & IDENTIFICATION
                // ============================================================================
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");

                // ============================================================================
                // CORE DEPARTMENT FIELDS
                // ============================================================================
                entity.Property(e => e.DepartmentCode).HasColumnName("department_code").HasMaxLength(50).IsRequired();
                entity.Property(e => e.DepartmentName).HasColumnName("department_name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.DepartmentType).HasColumnName("department_type").HasMaxLength(100);
                entity.Property(e => e.Description).HasColumnName("description");
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50).HasDefaultValue("Active");

                // ============================================================================
                // HIERARCHICAL STRUCTURE
                // ============================================================================
                entity.Property(e => e.ParentDepartmentId).HasColumnName("parent_department_id");

                // ============================================================================
                // DEPARTMENT LEADERSHIP
                // ============================================================================
                entity.Property(e => e.DepartmentHeadId).HasColumnName("department_head_id");

                // ============================================================================
                // OPERATIONAL HOURS
                // ============================================================================
                entity.Property(e => e.OperatingHoursStart).HasColumnName("operating_hours_start");
                entity.Property(e => e.OperatingHoursEnd).HasColumnName("operating_hours_end");
                entity.Property(e => e.DaysOfOperation).HasColumnName("days_of_operation");
                entity.Property(e => e.Is24x7).HasColumnName("is_24x7").HasDefaultValue(false);

                // ============================================================================
                // BUDGET & FINANCIAL
                // ============================================================================
                entity.Property(e => e.AnnualBudget).HasColumnName("annual_budget").HasColumnType("decimal(18,2)");
                entity.Property(e => e.BudgetCurrency).HasColumnName("budget_currency").HasMaxLength(3);

                // ============================================================================
                // APPROVAL WORKFLOW
                // ============================================================================
                entity.Property(e => e.RequiresApproval).HasColumnName("requires_approval").HasDefaultValue(false);
                entity.Property(e => e.ApprovalLevel).HasColumnName("approval_level");
                entity.Property(e => e.AutoApprovalThreshold).HasColumnName("auto_approval_threshold").HasColumnType("decimal(18,2)");

                // ============================================================================
                // CAPACITY MANAGEMENT
                // ============================================================================
                entity.Property(e => e.MaxConcurrentPatients).HasColumnName("max_concurrent_patients");
                entity.Property(e => e.WaitingRoomCapacity).HasColumnName("waiting_room_capacity");

                // ============================================================================
                // FOREIGN KEYS
                // ============================================================================
                entity.Property(e => e.TenantId).HasColumnName("tenant_id").IsRequired();
                entity.Property(e => e.BranchId).HasColumnName("branch_id");

                // ============================================================================
                // AUDIT FIELDS
                // ============================================================================
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                entity.Property(e => e.CreatedBy).HasColumnName("created_by");
                entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");
                entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
                entity.Property(e => e.DeletedBy).HasColumnName("deleted_by");
                entity.Property(e => e.ChangeReason).HasColumnName("change_reason");

                // ============================================================================
                // RELATIONSHIPS
                // ============================================================================
                entity.HasOne(e => e.ParentDepartment)
                    .WithMany(e => e.SubDepartments)
                    .HasForeignKey(e => e.ParentDepartmentId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Tenant)
                    .WithMany()
                    .HasForeignKey(e => e.TenantId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Branch)
                    .WithMany()
                    .HasForeignKey(e => e.BranchId)
                    .OnDelete(DeleteBehavior.SetNull);

                // ============================================================================
                // INDEXES FOR PERFORMANCE
                // ============================================================================
                entity.HasIndex(e => e.TenantId);
                entity.HasIndex(e => e.BranchId);
                entity.HasIndex(e => e.DepartmentCode);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.ParentDepartmentId);
                entity.HasIndex(e => e.DeletedAt); // For soft delete queries

                // ============================================================================
                // COMPUTED PROPERTIES (Ignore - not stored in database)
                // ============================================================================
                entity.Ignore(e => e.Name); // Alias property, not stored
            });

            builder.Entity<Permission>(entity =>
            {
                entity.ToTable("permissions"); // Fixed: Azure DB uses plural 'permissions'
                entity.Property(e => e.Id).HasColumnName("id").ValueGeneratedOnAdd();
                entity.HasIndex(e => new { e.TenantId, e.Code }).IsUnique();
            });

            builder.Entity<RolePermission>(entity =>
            {
                entity.ToTable("role_permission");
                entity.Property(e => e.Id).HasColumnName("id").ValueGeneratedOnAdd();
                entity.HasOne(e => e.Role)
                    .WithMany(r => r.RolePermissions)
                    .HasForeignKey(e => e.RoleId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Permission)
                    .WithMany(p => p.RolePermissions)
                    .HasForeignKey(e => e.PermissionId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<UserAttribute>(entity =>
            {
                entity.ToTable("user_attribute");
                entity.Property(e => e.Id).HasColumnName("id").ValueGeneratedOnAdd();
                entity.HasOne(e => e.User)
                    .WithMany(u => u.UserAttributes)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<FailedLoginAttempt>(entity =>
            {
                entity.ToTable("failed_login_attempt");
                entity.Property(e => e.Id).HasColumnName("id").ValueGeneratedOnAdd();
                entity.Property(e => e.EmailOrUsername).HasColumnName("email_or_username");
                entity.Property(e => e.TenantId).HasColumnName("tenant_id");
                entity.Property(e => e.IpAddress).HasColumnName("ip_address");
                entity.Property(e => e.AttemptedAt).HasColumnName("attempted_at");
                entity.Property(e => e.Reason).HasColumnName("reason");
            });

            builder.Entity<AuditLog>(entity =>
            {
                entity.ToTable("audit_log");
                entity.Property(e => e.Id).HasColumnName("id").ValueGeneratedOnAdd();
                entity.Property(e => e.TenantId).HasColumnName("tenant_id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.UserName).HasColumnName("UserName"); // PascalCase in DB
                entity.Property(e => e.Action).HasColumnName("action");
                entity.Property(e => e.ResourceType).HasColumnName("resource_type");
                entity.Property(e => e.ResourceId).HasColumnName("resource_id");
                entity.Property(e => e.EntityType).HasColumnName("EntityType"); // PascalCase in DB
                entity.Property(e => e.EntityId).HasColumnName("EntityId"); // PascalCase in DB
                entity.Property(e => e.Description).HasColumnName("Description"); // PascalCase in DB
                entity.Property(e => e.OldValues).HasColumnName("old_values");
                entity.Property(e => e.NewValues).HasColumnName("new_values");
                entity.Property(e => e.Changes).HasColumnName("Changes"); // PascalCase in DB
                entity.Property(e => e.IpAddress).HasColumnName("ip_address");
                entity.Property(e => e.UserAgent).HasColumnName("user_agent");
                entity.Property(e => e.Status).HasColumnName("status");
                entity.Property(e => e.Reason).HasColumnName("reason");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.Timestamp).HasColumnName("Timestamp"); // PascalCase in DB
            });

            builder.Entity<SystemAlert>(entity =>
            {
                entity.ToTable("system_alert");
                entity.Property(e => e.Id).HasColumnName("id").ValueGeneratedOnAdd();
                entity.Property(e => e.AlertType).HasColumnName("alert_type");
                entity.Property(e => e.Severity).HasColumnName("severity");
                entity.Property(e => e.Title).HasColumnName("title");
                entity.Property(e => e.Description).HasColumnName("description");
                entity.Property(e => e.Count).HasColumnName("count");
                entity.Property(e => e.IsDismissed).HasColumnName("is_dismissed");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.DismissedAt).HasColumnName("dismissed_at");
            });

            builder.Entity<SystemSetting>(entity =>
            {
                entity.ToTable("system_settings");
                entity.Property(e => e.Id).HasColumnName("id").ValueGeneratedOnAdd();
                entity.Property(e => e.TenantId).HasColumnName("tenant_id");
                entity.Property(e => e.Category).HasColumnName("category");
                entity.Property(e => e.Key).HasColumnName("key");
                entity.Property(e => e.Value).HasColumnName("value");
                entity.Property(e => e.DataType).HasColumnName("data_type");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
                entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
                entity.HasIndex(e => new { e.TenantId, e.Category, e.Key }).IsUnique();
            });

            builder.Entity<Patient>(entity =>
            {
                entity.ToTable("patient");
                entity.Property(e => e.Id).HasColumnName("id").ValueGeneratedOnAdd();
            });

            builder.Entity<ClinicalExamination>(entity =>
            {
                entity.ToTable("clinical_examination");
                entity.Property(e => e.Id).HasColumnName("id").ValueGeneratedOnAdd();
            });

            builder.Entity<Appointment>(entity =>
            {
                entity.ToTable("appointment");
                entity.Property(e => e.Id).HasColumnName("id").ValueGeneratedOnAdd();
            });

            builder.Entity<PatientDocumentUpload>(entity =>
            {
                entity.ToTable("patient_document_uploads");
                entity.Property(e => e.Id).HasColumnName("id").ValueGeneratedOnAdd();
                entity.Property(e => e.TenantId).HasColumnName("tenant_id");
                entity.Property(e => e.PatientId).HasColumnName("patient_id");
                entity.Property(e => e.DocumentType).HasColumnName("document_type");
                entity.Property(e => e.DocumentTitle).HasColumnName("document_title");
                entity.Property(e => e.FileUrl).HasColumnName("file_url");
                entity.Property(e => e.FileSize).HasColumnName("file_size");
                entity.Property(e => e.MimeType).HasColumnName("mime_type");
                entity.Property(e => e.UploadedBy).HasColumnName("uploaded_by");
                entity.Property(e => e.UploadedAt).HasColumnName("uploaded_at");
                entity.Property(e => e.SharedToDepartments).HasColumnName("shared_to_departments");
                entity.Property(e => e.SharedToRoles).HasColumnName("shared_to_roles");
                entity.Property(e => e.IsPublic).HasColumnName("is_public");
                entity.Property(e => e.DataClassification).HasColumnName("data_classification");
                entity.Property(e => e.RetentionDays).HasColumnName("retention_days");
                entity.Property(e => e.Status).HasColumnName("status");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
                entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
                entity.Property(e => e.DeletedByUserId).HasColumnName("deleted_by_user_id");
                entity.HasIndex(e => new { e.TenantId, e.PatientId });
            });

            builder.Entity<DocumentAccessAudit>(entity =>
            {
                entity.ToTable("document_access_audit");
                entity.Property(e => e.Id).HasColumnName("id").ValueGeneratedOnAdd();
                entity.Property(e => e.TenantId).HasColumnName("tenant_id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.UserEmail).HasColumnName("user_email");
                entity.Property(e => e.UserRole).HasColumnName("user_role");
                entity.Property(e => e.DocumentId).HasColumnName("document_id");
                entity.Property(e => e.DocumentType).HasColumnName("document_type");
                entity.Property(e => e.DocumentTitle).HasColumnName("document_title");
                entity.Property(e => e.PatientId).HasColumnName("patient_id");
                entity.Property(e => e.Action).HasColumnName("action");
                entity.Property(e => e.ActionResult).HasColumnName("action_result");
                entity.Property(e => e.AccessGranted).HasColumnName("access_granted");
                entity.Property(e => e.DenialReason).HasColumnName("denial_reason");
                entity.Property(e => e.PermissionUsed).HasColumnName("permission_used");
                entity.Property(e => e.IpAddress).HasColumnName("ip_address");
                entity.Property(e => e.UserAgent).HasColumnName("user_agent");
                entity.Property(e => e.RequestPath).HasColumnName("request_path");
                entity.Property(e => e.RequestMethod).HasColumnName("request_method");
                entity.Property(e => e.ResponseTimeMs).HasColumnName("response_time_ms");
                entity.Property(e => e.AccessedAt).HasColumnName("accessed_at");
                entity.HasIndex(e => new { e.TenantId, e.UserId, e.AccessedAt });
            });

            builder.Entity<ActivationAuditLog>(entity =>
            {
                entity.ToTable("activation_audit_log");
                entity.Property(e => e.Id).HasColumnName("id").ValueGeneratedOnAdd();
                entity.Property(e => e.TenantId).HasColumnName("tenant_id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.ActivationStep).HasColumnName("activation_step").HasMaxLength(50);
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20);
                entity.Property(e => e.ErrorMessage).HasColumnName("error_message");
                entity.Property(e => e.IpAddress).HasColumnName("ip_address").HasMaxLength(45);
                entity.Property(e => e.UserAgent).HasColumnName("user_agent");
                entity.Property(e => e.DeviceInfo).HasColumnName("device_info");
                entity.Property(e => e.GeolocationInfo).HasColumnName("geolocation_info");
                entity.Property(e => e.Timestamp).HasColumnName("timestamp");
                entity.Property(e => e.CompletedAt).HasColumnName("completed_at");
                entity.Property(e => e.RequestData).HasColumnName("request_data");
                entity.Property(e => e.ResponseData).HasColumnName("response_data");
                entity.Property(e => e.ResponseTimeMs).HasColumnName("response_time_ms");
                entity.Property(e => e.SuspiciousActivity).HasColumnName("suspicious_activity").HasDefaultValue(false);
                entity.Property(e => e.ComplianceNotes).HasColumnName("compliance_notes");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.HasIndex(e => new { e.TenantId, e.UserId });
                entity.HasIndex(e => e.Timestamp);
            });

            builder.Entity<AdminConfiguration>(entity =>
            {
                entity.ToTable("admin_configurations");
                entity.Property(e => e.Id).HasColumnName("id").ValueGeneratedOnAdd();
                entity.Property(e => e.TenantId).HasColumnName("tenant_id");
                entity.Property(e => e.ConfigKey).HasColumnName("config_key");
                entity.Property(e => e.ConfigValue).HasColumnName("config_value");
                entity.Property(e => e.ConfigType).HasColumnName("config_type");
                entity.Property(e => e.ConfigCategory).HasColumnName("config_category");
                entity.Property(e => e.Description).HasColumnName("description");
                entity.Property(e => e.DisplayName).HasColumnName("display_name");
                entity.Property(e => e.EditableByRoles).HasColumnName("editable_by_roles");
                entity.Property(e => e.VisibleToRoles).HasColumnName("visible_to_roles");
                entity.Property(e => e.IsSystemConfig).HasColumnName("is_system_config");
                entity.Property(e => e.IsSensitive).HasColumnName("is_sensitive");
                entity.Property(e => e.ValidationRules).HasColumnName("validation_rules");
                entity.Property(e => e.AllowedValues).HasColumnName("allowed_values");
                entity.Property(e => e.MinValue).HasColumnName("min_value");
                entity.Property(e => e.MaxValue).HasColumnName("max_value");
                entity.Property(e => e.PreviousValue).HasColumnName("previous_value");
                entity.Property(e => e.ChangeReason).HasColumnName("change_reason");
                entity.Property(e => e.RequiresRestart).HasColumnName("requires_restart");
                entity.Property(e => e.Status).HasColumnName("status");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
                entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
                entity.Property(e => e.DeletedByUserId).HasColumnName("deleted_by_user_id");
                entity.HasIndex(e => new { e.TenantId, e.ConfigKey }).IsUnique();
            });

            // UserDepartment Entity Configuration (department_access table - Migration 03)
            builder.Entity<UserDepartment>(entity =>
            {
                entity.ToTable("department_access");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.TenantId).HasColumnName("tenant_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.DepartmentId).HasColumnName("department_id").IsRequired();
                entity.Property(e => e.BranchId).HasColumnName("branch_id");
                entity.Property(e => e.AccessType).HasColumnName("access_type").HasMaxLength(20).HasDefaultValue("Secondary");
                // IsPrimary is computed from AccessType == 'Primary' - not a database column
                
                // Granular Permissions (Migration 03)
                entity.Property(e => e.CanView).HasColumnName("can_view").HasDefaultValue(true);
                entity.Property(e => e.CanCreate).HasColumnName("can_create").HasDefaultValue(false);
                entity.Property(e => e.CanEdit).HasColumnName("can_edit").HasDefaultValue(false);
                entity.Property(e => e.CanDelete).HasColumnName("can_delete").HasDefaultValue(false);
                entity.Property(e => e.CanApprove).HasColumnName("can_approve").HasDefaultValue(false);
                entity.Property(e => e.CanExport).HasColumnName("can_export").HasDefaultValue(false);
                
                // Time-bound Access
                entity.Property(e => e.AccessStartDate).HasColumnName("access_start_date");
                entity.Property(e => e.AccessEndDate).HasColumnName("access_end_date");
                
                // Approval Workflow
                entity.Property(e => e.ApprovedBy).HasColumnName("approved_by");
                entity.Property(e => e.ApprovedAt).HasColumnName("approved_at");
                entity.Property(e => e.ApprovalNotes).HasColumnName("approval_notes").HasMaxLength(500);
                
                // Audit Columns (match migration 03 schema)
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50).HasDefaultValue("Active");
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()");
                entity.Property(e => e.CreatedBy).HasColumnName("created_by");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");
                entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
                entity.Property(e => e.RevokedBy).HasColumnName("deleted_by");
                
                // Indexes
                entity.HasIndex(e => new { e.TenantId, e.UserId, e.DepartmentId });
                entity.HasIndex(e => e.DepartmentId);
                entity.HasIndex(e => e.BranchId);
            });

            // UserBranch Entity Configuration (Many-to-Many: User <-> Branch)
            builder.Entity<UserBranch>(entity =>
            {
                entity.ToTable("user_branches");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.TenantId).HasColumnName("tenant_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.BranchId).HasColumnName("branch_id").IsRequired();
                entity.Property(e => e.IsDefault).HasColumnName("is_default").HasDefaultValue(false);
                entity.Property(e => e.AssignedAt).HasColumnName("assigned_at");
                entity.Property(e => e.AssignedByUserId).HasColumnName("assigned_by_user_id");
                entity.Property(e => e.EffectiveFrom).HasColumnName("effective_from");
                entity.Property(e => e.EffectiveUntil).HasColumnName("effective_until");
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("active");
                entity.Property(e => e.Notes).HasColumnName("notes");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
                entity.HasIndex(e => new { e.TenantId, e.UserId, e.BranchId });
                entity.HasIndex(e => e.BranchId);
            });

            // Enable Row-Level Security filters
            // TEMPORARILY DISABLED FOR TESTING
            // builder.Entity<AppUser>().HasQueryFilter(u => u.TenantId == GetCurrentTenantId());
            // builder.Entity<AppRole>().HasQueryFilter(r => r.TenantId == GetCurrentTenantId());
            // builder.Entity<Permission>().HasQueryFilter(p => p.TenantId == GetCurrentTenantId());
            // builder.Entity<Branch>().HasQueryFilter(b => b.TenantId == GetCurrentTenantId());
            // builder.Entity<Organization>().HasQueryFilter(o => o.TenantId == GetCurrentTenantId());
            // builder.Entity<Department>().HasQueryFilter(d => d.TenantId == GetCurrentTenantId());
            // builder.Entity<UserDepartment>().HasQueryFilter(ud => ud.TenantId == GetCurrentTenantId());
            // builder.Entity<UserBranch>().HasQueryFilter(ub => ub.TenantId == GetCurrentTenantId());
            // builder.Entity<PatientDocumentUpload>().HasQueryFilter(d => d.TenantId == GetCurrentTenantId());
            // builder.Entity<DocumentAccessAudit>().HasQueryFilter(a => a.TenantId == GetCurrentTenantId());
            // builder.Entity<AdminConfiguration>().HasQueryFilter(c => c.TenantId == GetCurrentTenantId());
            
            // ============================================================================
            // DEVICE & SESSION MANAGEMENT (Tasks 7-12)
            // ============================================================================
            
            builder.Entity<Device>(entity =>
            {
                entity.ToTable("device");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.TenantId).HasColumnName("tenant_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.DeviceId).HasColumnName("device_id").HasMaxLength(255).IsRequired();
                entity.Property(e => e.DeviceName).HasColumnName("device_name").HasMaxLength(200);
                entity.Property(e => e.DeviceType).HasColumnName("device_type").HasMaxLength(50);
                entity.Property(e => e.OS).HasColumnName("operating_system").HasMaxLength(100);
                entity.Property(e => e.Browser).HasColumnName("browser").HasMaxLength(100);
                entity.Property(e => e.IPAddress).HasColumnName("ip_address").HasMaxLength(45);
                entity.Property(e => e.Location).HasColumnName("location").HasMaxLength(200);
                entity.Property(e => e.TrustLevel).HasColumnName("trust_level").HasMaxLength(20).HasDefaultValue("Untrusted");
                entity.Property(e => e.IsBlocked).HasColumnName("is_blocked").HasDefaultValue(false);
                entity.Property(e => e.BlockReason).HasColumnName("block_reason").HasMaxLength(500);
                entity.Property(e => e.IsPrimaryDevice).HasColumnName("is_primary_device").HasDefaultValue(false);
                entity.Property(e => e.RegisteredAt).HasColumnName("registered_at");
                entity.Property(e => e.LastSeenAt).HasColumnName("last_seen_at");
                entity.Property(e => e.LastLoginAt).HasColumnName("last_login_at");
                entity.Property(e => e.TotalLogins).HasColumnName("total_logins").HasDefaultValue(0);
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("active");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
                
                entity.HasIndex(e => e.DeviceId);
                entity.HasIndex(e => new { e.UserId, e.IsBlocked });
                entity.HasIndex(e => new { e.TenantId, e.UserId });
            });
            
            builder.Entity<UserSession>(entity =>
            {
                entity.ToTable("user_session");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.TenantId).HasColumnName("tenant_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.DeviceId).HasColumnName("device_id");
                entity.Property(e => e.SessionId).HasColumnName("session_id").HasMaxLength(255).IsRequired();
                entity.Property(e => e.TokenId).HasColumnName("token_id").HasMaxLength(255);
                entity.Property(e => e.RefreshToken).HasColumnName("refresh_token").HasMaxLength(500);
                entity.Property(e => e.LoginTime).HasColumnName("login_time");
                entity.Property(e => e.LastActivityTime).HasColumnName("last_activity_time");
                entity.Property(e => e.ExpiresAt).HasColumnName("expires_at");
                entity.Property(e => e.LogoutTime).HasColumnName("logout_time");
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
                entity.Property(e => e.IPAddress).HasColumnName("ip_address").HasMaxLength(45);
                entity.Property(e => e.UserAgent).HasColumnName("user_agent").HasMaxLength(500);
                entity.Property(e => e.Location).HasColumnName("location").HasMaxLength(200);
                entity.Property(e => e.SessionType).HasColumnName("session_type").HasMaxLength(20).HasDefaultValue("Web");
                entity.Property(e => e.LoginMethod).HasColumnName("login_method").HasMaxLength(50);
                entity.Property(e => e.SuspiciousActivity).HasColumnName("suspicious_activity").HasDefaultValue(false);
                entity.Property(e => e.TerminationReason).HasColumnName("termination_reason").HasMaxLength(200);
                entity.Property(e => e.TerminatedBy).HasColumnName("terminated_by");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                
                entity.HasIndex(e => e.SessionId);
                entity.HasIndex(e => new { e.UserId, e.IsActive });
                entity.HasIndex(e => e.ExpiresAt);
                entity.HasIndex(e => new { e.TenantId, e.UserId });
            });
            
            builder.Entity<AccessPolicy>(entity =>
            {
                entity.ToTable("access_policy");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.TenantId).HasColumnName("tenant_id").IsRequired();
                entity.Property(e => e.PolicyName).HasColumnName("policy_name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.PolicyCode).HasColumnName("policy_code").HasMaxLength(100);
                entity.Property(e => e.PolicyType).HasColumnName("policy_type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(500);
                entity.Property(e => e.Conditions).HasColumnName("conditions").HasColumnType("jsonb");
                entity.Property(e => e.Actions).HasColumnName("actions").HasColumnType("jsonb");
                entity.Property(e => e.Resources).HasColumnName("resources").HasColumnType("jsonb");
                entity.Property(e => e.Effect).HasColumnName("effect").HasMaxLength(10).HasDefaultValue("Deny");
                entity.Property(e => e.Priority).HasColumnName("priority").HasDefaultValue(100);
                entity.Property(e => e.AppliesToRoles).HasColumnName("applies_to_roles").HasColumnType("jsonb");
                entity.Property(e => e.AppliesToDepartments).HasColumnName("applies_to_departments").HasColumnType("jsonb");
                entity.Property(e => e.AppliesToUsers).HasColumnName("applies_to_users").HasColumnType("jsonb");
                entity.Property(e => e.EffectiveFrom).HasColumnName("effective_from");
                entity.Property(e => e.EffectiveUntil).HasColumnName("effective_until");
                entity.Property(e => e.TimeOfDayStart).HasColumnName("time_of_day_start");
                entity.Property(e => e.TimeOfDayEnd).HasColumnName("time_of_day_end");
                entity.Property(e => e.DaysOfWeek).HasColumnName("days_of_week").HasMaxLength(100);
                entity.Property(e => e.IsSystemPolicy).HasColumnName("is_system_policy").HasDefaultValue(false);
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
                entity.Property(e => e.EvaluationCount).HasColumnName("evaluation_count").HasDefaultValue(0);
                entity.Property(e => e.LastEvaluatedAt).HasColumnName("last_evaluated_at");
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("active");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.CreatedBy).HasColumnName("created_by_user_id");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                entity.Property(e => e.UpdatedBy).HasColumnName("updated_by_user_id");
                entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
                
                entity.HasIndex(e => e.PolicyCode);
                entity.HasIndex(e => new { e.TenantId, e.IsActive });
                entity.HasIndex(e => e.Priority);
            });
            
            builder.Entity<EmergencyAccess>(entity =>
            {
                entity.ToTable("emergency_access");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.TenantId).HasColumnName("tenant_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.AccessCode).HasColumnName("access_code").HasMaxLength(50);
                entity.Property(e => e.Reason).HasColumnName("reason").HasMaxLength(1000).IsRequired();
                entity.Property(e => e.EmergencyType).HasColumnName("emergency_type").HasMaxLength(100);
                entity.Property(e => e.PatientId).HasColumnName("patient_id");
                entity.Property(e => e.GrantedPermissions).HasColumnName("granted_permissions").HasColumnType("jsonb");
                entity.Property(e => e.Scope).HasColumnName("scope").HasMaxLength(50).HasDefaultValue("Limited");
                entity.Property(e => e.StartTime).HasColumnName("start_time");
                entity.Property(e => e.EndTime).HasColumnName("end_time");
                entity.Property(e => e.DurationMinutes).HasColumnName("duration_minutes").HasDefaultValue(60);
                entity.Property(e => e.AutoRevokeEnabled).HasColumnName("auto_revoke_enabled").HasDefaultValue(true);
                entity.Property(e => e.RequiresApproval).HasColumnName("requires_approval").HasDefaultValue(true);
                entity.Property(e => e.ApprovedBy).HasColumnName("approved_by");
                entity.Property(e => e.ApprovedAt).HasColumnName("approved_at");
                entity.Property(e => e.ApprovalNotes).HasColumnName("approval_notes").HasMaxLength(500);
                entity.Property(e => e.RejectedBy).HasColumnName("rejected_by");
                entity.Property(e => e.RejectedAt).HasColumnName("rejected_at");
                entity.Property(e => e.RejectionReason).HasColumnName("rejection_reason").HasMaxLength(500);
                entity.Property(e => e.RevokedAt).HasColumnName("revoked_at");
                entity.Property(e => e.RevokedBy).HasColumnName("revoked_by");
                entity.Property(e => e.RevocationReason).HasColumnName("revocation_reason").HasMaxLength(500);
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("pending");
                entity.Property(e => e.AuditTrail).HasColumnName("audit_trail").HasColumnType("jsonb");
                entity.Property(e => e.ActionsPerformed).HasColumnName("actions_performed").HasColumnType("jsonb");
                entity.Property(e => e.NotificationSent).HasColumnName("notification_sent").HasDefaultValue(false);
                entity.Property(e => e.NotifiedUsers).HasColumnName("notified_users").HasColumnType("jsonb");
                entity.Property(e => e.RequiresReview).HasColumnName("requires_review").HasDefaultValue(true);
                entity.Property(e => e.ReviewedBy).HasColumnName("reviewed_by");
                entity.Property(e => e.ReviewedAt).HasColumnName("reviewed_at");
                entity.Property(e => e.ReviewNotes).HasColumnName("review_notes").HasMaxLength(500);
                entity.Property(e => e.ReviewStatus).HasColumnName("review_status").HasMaxLength(50);
                entity.Property(e => e.RiskLevel).HasColumnName("risk_level").HasMaxLength(20).HasDefaultValue("High");
                entity.Property(e => e.SuspiciousActivity).HasColumnName("suspicious_activity").HasDefaultValue(false);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                
                entity.HasIndex(e => e.AccessCode);
                entity.HasIndex(e => new { e.UserId, e.Status });
                entity.HasIndex(e => new { e.StartTime, e.EndTime });
                entity.HasIndex(e => new { e.TenantId, e.Status });
            });
        }

        private Guid GetCurrentTenantId()
        {
            // Try HttpContext.Items (set during login)
            var tenantId = _httpContextAccessor?.HttpContext?.Items["TenantId"] as Guid?;
            
            // Try JWT claims (for authenticated API calls)
            if (tenantId == null)
            {
                var tenantIdClaim = _httpContextAccessor?.HttpContext?.User?.FindFirst("tenant_id")?.Value;
                if (!string.IsNullOrEmpty(tenantIdClaim) && Guid.TryParse(tenantIdClaim, out var parsedTenantId))
                {
                    tenantId = parsedTenantId;
                }
            }
            
            // Try X-Tenant-ID header
            if (tenantId == null)
            {
                var tenantIdHeader = _httpContextAccessor?.HttpContext?.Request.Headers["X-Tenant-ID"].FirstOrDefault();
                if (!string.IsNullOrEmpty(tenantIdHeader) && Guid.TryParse(tenantIdHeader, out var parsedTenantId))
                {
                    tenantId = parsedTenantId;
                }
            }
            
            return tenantId ?? Guid.Parse("11111111-1111-1111-1111-111111111111"); // Default to test tenant
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            // Set tenant context for RLS before executing queries
            await SetTenantContextAsync();
            
            foreach (var entry in ChangeTracker.Entries<AppUser>()
                .Where(e => e.State == EntityState.Modified))
            {
                entry.Property(p => p.UpdatedAt).CurrentValue = DateTime.UtcNow;
            }

            foreach (var entry in ChangeTracker.Entries<AppRole>()
                .Where(e => e.State == EntityState.Modified))
            {
                entry.Property(p => p.UpdatedAt).CurrentValue = DateTime.UtcNow;
            }

            return await base.SaveChangesAsync(cancellationToken);
        }
    }
}
