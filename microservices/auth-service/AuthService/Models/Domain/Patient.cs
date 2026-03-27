using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain;

[Table("patients")]
public class Patient
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("tenant_id")]
    public required Guid TenantId { get; set; }

    [Column("branch_id")]
    public Guid? BranchId { get; set; }

    [Column("medical_record_number")]
    [StringLength(50)]
    public required string MedicalRecordNumber { get; set; }

    // Extended Demographics (Phase 6)
    [Column("title")]
    [StringLength(10)]
    public string? Title { get; set; } // Dr, Mr, Ms, Mrs, Master, Miss

    [Column("first_name")]
    [StringLength(100)]
    public required string FirstName { get; set; }

    [Column("middle_name")]
    [StringLength(100)]
    public string? MiddleName { get; set; }

    [Column("last_name")]
    [StringLength(100)]
    public required string LastName { get; set; }

    [Column("date_of_birth")]
    public required DateTime DateOfBirth { get; set; }

    [Column("nationality")]
    [StringLength(100)]
    public string? Nationality { get; set; }

    [Column("occupation")]
    [StringLength(200)]
    public string? Occupation { get; set; }

    [Column("marital_status")]
    [StringLength(50)]
    public string? MaritalStatus { get; set; } // Single, Married, Divorced, Widowed, Separated

    [Column("religion")]
    [StringLength(100)]
    public string? Religion { get; set; }

    [Column("language_preference")]
    [StringLength(50)]
    public string? LanguagePreference { get; set; }

    [Column("gender")]
    [StringLength(20)]
    public required string Gender { get; set; }

    [Column("contact_number")]
    [StringLength(20)]
    public string? ContactNumber { get; set; }

    [Column("email")]
    [StringLength(255)]
    [EmailAddress]
    public string? Email { get; set; }

    [Column("address")]
    [StringLength(500)]
    public string? Address { get; set; }

    // Structured Address Fields (Phase 5)
    [Column("address_line_1")]
    [StringLength(200)]
    public string? AddressLine1 { get; set; }

    [Column("address_line_2")]
    [StringLength(200)]
    public string? AddressLine2 { get; set; }

    [Column("country")]
    [StringLength(100)]
    public string? Country { get; set; }

    [Column("district")]
    [StringLength(100)]
    public string? District { get; set; }

    [Column("landmark")]
    [StringLength(200)]
    public string? Landmark { get; set; }

    [Column("pin_code")]
    [StringLength(20)]
    public string? PinCode { get; set; }

    [Column("blood_group")]
    [StringLength(10)]
    public string? BloodGroup { get; set; }

    [Column("allergies")]
    public string? Allergies { get; set; }

    // Enhanced Medical History (Phase 4)
    [Column("chronic_conditions")]
    public string? ChronicConditions { get; set; }

    [Column("current_medications")]
    public string? CurrentMedications { get; set; }

    [Column("past_surgeries")]
    public string? PastSurgeries { get; set; }

    [Column("family_medical_history")]
    public string? FamilyMedicalHistory { get; set; }

    [Column("known_allergies_details")]
    public string? KnownAllergiesDetails { get; set; }

    [Column("immunization_records")]
    public string? ImmunizationRecords { get; set; }

    [Column("disability_status")]
    [StringLength(100)]
    public string? DisabilityStatus { get; set; }

    [Column("special_needs")]
    public string? SpecialNeeds { get; set; }

    // Additional Medical/Lifestyle Fields (Phase 8)
    [Column("exercise_habits")]
    [StringLength(100)]
    public string? ExerciseHabits { get; set; }

    [Column("diet_type")]
    [StringLength(100)]
    public string? DietType { get; set; }

    [Column("smoking_status")]
    [StringLength(50)]
    public string? SmokingStatus { get; set; } // Never, Former, Current - Light, Current - Heavy

    [Column("alcohol_use")]
    [StringLength(50)]
    public string? AlcoholUse { get; set; } // None, Occasional, Moderate, Heavy

    [Column("lifestyle_notes")]
    public string? LifestyleNotes { get; set; }

    // Patient Photo (Phase 7)
    [Column("photo_url")]
    [StringLength(500)]
    public string? PhotoUrl { get; set; }

    [Column("photo_thumbnail_url")]
    [StringLength(500)]
    public string? PhotoThumbnailUrl { get; set; }

    [Column("photo_uploaded_at")]
    public DateTime? PhotoUploadedAt { get; set; }

    // Emergency Contact Information
    [Column("emergency_contact_name")]
    [StringLength(200)]
    public string? EmergencyContactName { get; set; }

    [Column("emergency_contact_phone")]
    [StringLength(20)]
    public string? EmergencyContactPhone { get; set; }

    [Column("emergency_contact_relationship")]
    [StringLength(100)]
    public string? EmergencyContactRelationship { get; set; }

    [Column("emergency_contact_email")]
    [StringLength(255)]
    [EmailAddress]
    public string? EmergencyContactEmail { get; set; }

    [Column("emergency_contact_address")]
    [StringLength(500)]
    public string? EmergencyContactAddress { get; set; }

    // Insurance Information
    [Column("insurance_provider")]
    [StringLength(200)]
    public string? InsuranceProvider { get; set; }

    [Column("insurance_policy_number")]
    [StringLength(100)]
    public string? InsurancePolicyNumber { get; set; }

    [Column("insurance_group_number")]
    [StringLength(100)]
    public string? InsuranceGroupNumber { get; set; }

    [Column("insurance_valid_from")]
    public DateTime? InsuranceValidFrom { get; set; }

    [Column("insurance_valid_to")]
    public DateTime? InsuranceValidTo { get; set; }

    [Column("insurance_status")]
    [StringLength(50)]
    public string? InsuranceStatus { get; set; }

    // Identity Documents
    [Column("health_id")]
    [StringLength(50)]
    public string? HealthId { get; set; }

    [Column("aadhaar_number")]
    [StringLength(12)]
    [RegularExpression(@"^\d{12}$", ErrorMessage = "Aadhaar must be 12 digits")]
    public string? AadhaarNumber { get; set; }

    [Column("national_id")]
    [StringLength(50)]
    public string? NationalId { get; set; }

    [Column("passport_number")]
    [StringLength(50)]
    public string? PassportNumber { get; set; }

    [Column("driving_license")]
    [StringLength(50)]
    public string? DrivingLicense { get; set; }

    [Column("id_proof_type")]
    [StringLength(50)]
    public string? IdProofType { get; set; }

    // Guardian Information (for minors and legally incapacitated patients)
    [Column("guardian_name")]
    [StringLength(100)]
    public string? GuardianName { get; set; }

    [Column("guardian_relationship")]
    [StringLength(50)]
    public string? GuardianRelationship { get; set; }

    [Column("guardian_phone")]
    [StringLength(20)]
    public string? GuardianPhone { get; set; }

    [Column("guardian_email")]
    [StringLength(100)]
    [EmailAddress(ErrorMessage = "Invalid guardian email format")]
    public string? GuardianEmail { get; set; }

    [Column("guardian_address")]
    public string? GuardianAddress { get; set; }

    [Column("guardian_id_proof")]
    [StringLength(100)]
    public string? GuardianIdProof { get; set; }

    // Audit Fields
    [Column("created_by_user_id")]
    public Guid? CreatedByUserId { get; set; }

    [Column("updated_by_user_id")]
    public Guid? UpdatedByUserId { get; set; }

    [Column("status")]
    [StringLength(50)]
    public string Status { get; set; } = "Active";

    [Column("deceased_date")]
    public DateTime? DeceasedDate { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }
}