using AuthService.Authorization;
using AuthService.Context;
using AuthService.Models.Domain;
using AuthService.Models.Domain.Dtos;
using AuthService.Services;
using AuthService.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PatientsController : ControllerBase
{
    private readonly IPatientService _patientService;
    private readonly IBlobStorageService _blobStorageService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<PatientsController> _logger;
    private readonly IPatientDuplicateDetectionService _duplicateDetectionService;
    private readonly AppDbContext _context;

    public PatientsController(
        IPatientService patientService,
        IBlobStorageService blobStorageService,
        IConfiguration configuration,
        ILogger<PatientsController> logger,
        IPatientDuplicateDetectionService duplicateDetectionService,
        AppDbContext context)
    {
        _patientService = patientService;
        _blobStorageService = blobStorageService;
        _configuration = configuration;
        _logger = logger;
        _duplicateDetectionService = duplicateDetectionService;
        _context = context;
    }

    [HttpGet]
    [RequirePermission("patient.view")]
    public async Task<ActionResult<List<PatientResponse>>> GetAllPatients()
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        var patients = await _patientService.GetAllPatientsAsync(Guid.Parse(tenantId));
        
        return Ok(patients.Select(p => MapToResponse(p)));
    }

    [HttpGet("search")]
    [RequirePermission("patient.view")]
    public async Task<ActionResult<List<PatientResponse>>> SearchPatients(
        [FromQuery] string searchTerm,
        [FromQuery] string? searchType = null)
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        if (string.IsNullOrWhiteSpace(searchTerm))
            return Ok(new List<PatientResponse>());

        var patients = await _patientService.SearchPatientsAsync(searchTerm, searchType, Guid.Parse(tenantId));
        
        return Ok(patients.Select(p => MapToResponse(p)));
    }

    [HttpGet("{id}")]
    [RequirePermission("patient.view")]
    public async Task<ActionResult<PatientResponse>> GetPatient(Guid id)
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        var patient = await _patientService.GetPatientByIdAsync(id, Guid.Parse(tenantId));
        if (patient == null) return NotFound();

        return Ok(MapToResponse(patient));
    }

    /// <summary>
    /// Check for duplicate patients before creating a new patient
    /// </summary>
    [HttpPost("check-duplicates")]
    [RequirePermission("patient.view")]
    public async Task<ActionResult<DuplicateCheckResult>> CheckDuplicates([FromBody] DuplicateCheckRequest request)
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        var result = await _duplicateDetectionService.CheckDuplicatesAsync(
            request,
            Guid.Parse(tenantId)
        );

        return Ok(result);
    }

    [HttpPost]
    [RequirePermission("patient.create")]
    public async Task<ActionResult<PatientResponse>> CreatePatient([FromBody] CreatePatientRequest request)
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        // Check for duplicates BEFORE creating patient
        var duplicateCheck = await _duplicateDetectionService.CheckDuplicatesAsync(
            new DuplicateCheckRequest
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                DateOfBirth = request.DateOfBirth,
                ContactNumber = request.ContactNumber,
                Email = request.Email
            },
            Guid.Parse(tenantId)
        );

        // If high-confidence duplicate found (>= 95%), reject creation
        if (duplicateCheck.IsDuplicate && duplicateCheck.Matches.Any(m => m.MatchConfidence >= 0.95m))
        {
            return BadRequest(new
            {
                error = "Duplicate patient detected",
                message = "A patient with very similar details already exists. Please review before creating.",
                duplicates = duplicateCheck.Matches
            });
        }

        var patient = new Patient
        {
            TenantId = Guid.Parse(tenantId),
            MedicalRecordNumber = GenerateMedicalRecordNumber(),
            
            // Phase 6: Extended Demographics
            Title = request.Title,
            FirstName = request.FirstName,
            MiddleName = request.MiddleName,
            LastName = request.LastName,
            DateOfBirth = request.DateOfBirth,
            Nationality = request.Nationality,
            Occupation = request.Occupation,
            MaritalStatus = request.MaritalStatus,
            Religion = request.Religion,
            LanguagePreference = request.LanguagePreference,
            Gender = request.Gender,
            
            // Contact Information
            ContactNumber = request.ContactNumber,
            Email = request.Email,
            Address = request.Address,
            
            // Phase 5: Structured Address
            AddressLine1 = request.AddressLine1,
            AddressLine2 = request.AddressLine2,
            Country = request.Country,
            District = request.District,
            Landmark = request.Landmark,
            PinCode = request.PinCode,
            
            // Medical Information
            BloodGroup = request.BloodGroup,
            Allergies = request.Allergies,
            
            // Phase 4: Enhanced Medical History
            ChronicConditions = request.ChronicConditions,
            CurrentMedications = request.CurrentMedications,
            PastSurgeries = request.PastSurgeries,
            FamilyMedicalHistory = request.FamilyMedicalHistory,
            KnownAllergiesDetails = request.KnownAllergiesDetails,
            ImmunizationRecords = request.ImmunizationRecords,
            DisabilityStatus = request.DisabilityStatus,
            SpecialNeeds = request.SpecialNeeds,
            
            // Phase 8: Lifestyle Fields
            ExerciseHabits = request.ExerciseHabits,
            DietType = request.DietType,
            SmokingStatus = request.SmokingStatus,
            AlcoholUse = request.AlcoholUse,
            LifestyleNotes = request.LifestyleNotes,
            
            // Phase 2: Identity Documents
            HealthId = request.HealthId,
            AadhaarNumber = request.AadhaarNumber,
            NationalId = request.NationalId,
            PassportNumber = request.PassportNumber,
            DrivingLicense = request.DrivingLicense,
            IdProofType = request.IdProofType,
            
            // Phase 3: Guardian Information
            GuardianName = request.GuardianName,
            GuardianRelationship = request.GuardianRelationship,
            GuardianPhone = request.GuardianPhone,
            GuardianEmail = request.GuardianEmail,
            GuardianAddress = request.GuardianAddress,
            GuardianIdProof = request.GuardianIdProof,
            
            // Phase 1: Emergency Contact & Insurance
            EmergencyContactName = request.EmergencyContactName,
            EmergencyContactPhone = request.EmergencyContactPhone,
            EmergencyContactRelationship = request.EmergencyContactRelationship,
            EmergencyContactAddress = request.EmergencyContactAddress,
            EmergencyContactEmail = request.EmergencyContactEmail,
            InsuranceProvider = request.InsuranceProvider,
            InsurancePolicyNumber = request.InsurancePolicyNumber,
            InsuranceGroupNumber = request.InsuranceGroupNumber,
            InsuranceStatus = request.InsuranceStatus,
            InsuranceValidFrom = request.InsuranceValidFrom,
            InsuranceValidTo = request.InsuranceValidTo,
            
            Status = "Active"
        };

        var createdPatient = await _patientService.CreatePatientAsync(patient);
        return CreatedAtAction(nameof(GetPatient), new { id = createdPatient.Id }, MapToResponse(createdPatient));
    }

    [HttpPut("{id}")]
    [RequirePermission("patient.update")]
    public async Task<ActionResult<PatientResponse>> UpdatePatient(Guid id, [FromBody] UpdatePatientRequest request)
    {
        if (id != request.Id) return BadRequest();

        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        // Check for duplicates when updating (exclude current patient)
        var duplicateCheck = await _duplicateDetectionService.CheckDuplicatesAsync(
            new DuplicateCheckRequest
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                DateOfBirth = request.DateOfBirth,
                ContactNumber = request.ContactNumber,
                Email = request.Email
            },
            Guid.Parse(tenantId),
            excludePatientId: id // Exclude current patient from duplicate check
        );

        if (duplicateCheck.IsDuplicate && duplicateCheck.Matches.Any(m => m.MatchConfidence >= 0.95m))
        {
            return BadRequest(new
            {
                error = "Duplicate patient detected",
                message = "Updated details match another existing patient.",
                duplicates = duplicateCheck.Matches
            });
        }

        var patient = new Patient
        {
            Id = request.Id,
            TenantId = Guid.Parse(tenantId),
            MedicalRecordNumber = GenerateMedicalRecordNumber(),
            FirstName = request.FirstName,
            LastName = request.LastName,
            DateOfBirth = request.DateOfBirth,
            Gender = request.Gender,
            ContactNumber = request.ContactNumber,
            Email = request.Email,
            Address = request.Address,
            BloodGroup = request.BloodGroup,
            Allergies = request.Allergies
        };

        var updatedPatient = await _patientService.UpdatePatientAsync(patient);
        if (updatedPatient == null) return NotFound();

        return Ok(MapToResponse(updatedPatient));
    }

    [HttpDelete("{id}")]
    [RequirePermission("patient.delete")]
    public async Task<ActionResult> DeletePatient(Guid id)
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        var result = await _patientService.DeletePatientAsync(id, Guid.Parse(tenantId));
        if (!result) return NotFound();

        return NoContent();
    }

    /// <summary>
    /// Upload patient photo to Azure Blob Storage
    /// </summary>
    [HttpPost("{id}/photo")]
    [RequirePermission("patient.edit")]
    public async Task<ActionResult> UploadPatientPhoto(Guid id, IFormFile photo)
    {
        try
        {
            var tenantId = User.FindFirst("TenantId")?.Value;
            if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

            // Validate file
            if (photo == null || photo.Length == 0)
                return BadRequest("No photo file provided");

            var maxSizeMB = _configuration.GetValue<int>("AzureBlobStorage:MaxFileSizeMB");
            if (photo.Length > maxSizeMB * 1024 * 1024)
                return BadRequest($"File size exceeds {maxSizeMB}MB limit");

            var allowedTypes = _configuration.GetSection("AzureBlobStorage:AllowedContentTypes").Get<string[]>();
            if (allowedTypes != null && !allowedTypes.Contains(photo.ContentType))
                return BadRequest("Invalid file type. Only JPEG, PNG, and WEBP allowed");

            // Get patient
            var patient = await _patientService.GetPatientByIdAsync(id, Guid.Parse(tenantId));
            if (patient == null)
                return NotFound();

            // Delete old photo if exists
            if (!string.IsNullOrEmpty(patient.PhotoUrl))
            {
                await _blobStorageService.DeleteFileAsync(patient.PhotoUrl);
                if (!string.IsNullOrEmpty(patient.PhotoThumbnailUrl))
                    await _blobStorageService.DeleteFileAsync(patient.PhotoThumbnailUrl);
            }

            // Upload to Azure Blob Storage
            using var stream = photo.OpenReadStream();
            var (photoUrl, thumbnailUrl) = await _blobStorageService.UploadPatientPhotoAsync(
                photo.FileName, stream, photo.ContentType, Guid.Parse(tenantId), id);

            // Update patient record
            patient.PhotoUrl = photoUrl;
            patient.PhotoThumbnailUrl = thumbnailUrl;
            patient.PhotoUploadedAt = DateTime.UtcNow;
            await _patientService.UpdatePatientAsync(patient);

            _logger.LogInformation("Photo uploaded successfully for patient {PatientId}", id);

            return Ok(new
            {
                photoUrl,
                thumbnailUrl,
                uploadedAt = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading photo for patient {PatientId}", id);
            return StatusCode(500, "Error uploading photo");
        }
    }

    /// <summary>
    /// Delete patient photo from Azure Blob Storage
    /// </summary>
    [HttpDelete("{id}/photo")]
    [RequirePermission("patient.edit")]
    public async Task<ActionResult> DeletePatientPhoto(Guid id)
    {
        try
        {
            var tenantId = User.FindFirst("TenantId")?.Value;
            if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

            var patient = await _patientService.GetPatientByIdAsync(id, Guid.Parse(tenantId));
            if (patient == null)
                return NotFound();

            if (!string.IsNullOrEmpty(patient.PhotoUrl))
            {
                await _blobStorageService.DeleteFileAsync(patient.PhotoUrl);

                if (!string.IsNullOrEmpty(patient.PhotoThumbnailUrl))
                    await _blobStorageService.DeleteFileAsync(patient.PhotoThumbnailUrl);

                patient.PhotoUrl = null;
                patient.PhotoThumbnailUrl = null;
                patient.PhotoUploadedAt = null;
                await _patientService.UpdatePatientAsync(patient);

                _logger.LogInformation("Photo deleted successfully for patient {PatientId}", id);
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting photo for patient {PatientId}", id);
            return StatusCode(500, "Error deleting photo");
        }
    }

    [HttpGet("{id}/vitals/latest")]
    [RequirePermission("patient.view")]
    public async Task<ActionResult> GetLatestVitals(Guid id)
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        var vitals = await _context.PatientVitalSigns
            .Where(v => v.PatientId == id && v.TenantId == Guid.Parse(tenantId) && v.DeletedAt == null)
            .OrderByDescending(v => v.MeasurementDate)
            .Select(v => new
            {
                bloodPressure = v.BloodPressureSystolic != null && v.BloodPressureDiastolic != null
                    ? $"{v.BloodPressureSystolic}/{v.BloodPressureDiastolic} mmHg"
                    : null,
                heartRate = v.HeartRate,
                temperature = v.Temperature,
                weight = v.WeightKg,
                height = v.HeightCm,
                bmi = v.Bmi,
                oxygenSaturation = v.OxygenSaturation,
                respiratoryRate = v.RespiratoryRate,
                recordedAt = v.MeasurementDate
            })
            .FirstOrDefaultAsync();

        if (vitals == null) return NotFound();
        return Ok(vitals);
    }

    private static PatientResponse MapToResponse(Patient patient)
    {
        return new PatientResponse
        {
            Id = patient.Id,
            MedicalRecordNumber = patient.MedicalRecordNumber,
            Title = patient.Title,
            FirstName = patient.FirstName,
            MiddleName = patient.MiddleName,
            LastName = patient.LastName,
            DateOfBirth = patient.DateOfBirth,
            Nationality = patient.Nationality,
            Occupation = patient.Occupation,
            MaritalStatus = patient.MaritalStatus,
            Religion = patient.Religion,
            LanguagePreference = patient.LanguagePreference,
            Gender = patient.Gender,
            ContactNumber = patient.ContactNumber,
            Email = patient.Email,
            Address = patient.Address,
            AddressLine1 = patient.AddressLine1,
            AddressLine2 = patient.AddressLine2,
            Country = patient.Country,
            District = patient.District,
            Landmark = patient.Landmark,
            PinCode = patient.PinCode,
            BloodGroup = patient.BloodGroup,
            Allergies = patient.Allergies,
            EmergencyContactName = patient.EmergencyContactName,
            EmergencyContactPhone = patient.EmergencyContactPhone,
            EmergencyContactRelationship = patient.EmergencyContactRelationship,
            EmergencyContactEmail = patient.EmergencyContactEmail,
            EmergencyContactAddress = patient.EmergencyContactAddress,
            GuardianName = patient.GuardianName,
            GuardianRelationship = patient.GuardianRelationship,
            GuardianPhone = patient.GuardianPhone,
            GuardianEmail = patient.GuardianEmail,
            GuardianAddress = patient.GuardianAddress,
            PhotoUrl = patient.PhotoUrl,
            PhotoThumbnailUrl = patient.PhotoThumbnailUrl,
            PhotoUploadedAt = patient.PhotoUploadedAt,
            BranchId = patient.BranchId,
            CreatedAt = patient.CreatedAt,
            UpdatedAt = patient.UpdatedAt
        };
    }

    private static string GenerateMedicalRecordNumber()
    {
        // Format: MRN-YYYY-MM-XXXXX
        return $"MRN-{DateTime.UtcNow:yyyy-MM}-{Guid.NewGuid().ToString().Substring(0, 5).ToUpper()}";
    }
}