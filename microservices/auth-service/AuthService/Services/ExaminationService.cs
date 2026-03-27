using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace AuthService.Services;

public interface IExaminationService
{
    Task<List<ClinicalExamination>> GetAllExaminationsAsync(Guid tenantId);
    Task<List<ClinicalExamination>> GetPatientExaminationsAsync(Guid patientId, Guid tenantId);
    Task<ClinicalExamination?> GetExaminationByIdAsync(Guid id, Guid tenantId);
    Task<ClinicalExamination> CreateExaminationAsync(ClinicalExamination examination);
    Task<ClinicalExamination?> UpdateExaminationAsync(ClinicalExamination examination);
    Task<bool> DeleteExaminationAsync(Guid id, Guid tenantId);
    Task<ClinicalExamination?> SignExaminationAsync(Guid id, Guid doctorId, Guid tenantId);
    Task<(bool Success, string Message, string? DigitalSignature, Guid? FollowUpAppointmentId)> FinalizeExaminationAsync(
        Guid examinationId, 
        Guid doctorId, 
        Guid tenantId, 
        string pin, 
        DateTime? followUpDate = null, 
        string? followUpReason = null);
}

public class ExaminationService : IExaminationService
{
    private readonly AppDbContext _context;
    private readonly ILogger<ExaminationService> _logger;

    public ExaminationService(AppDbContext context, ILogger<ExaminationService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<ClinicalExamination>> GetAllExaminationsAsync(Guid tenantId)
    {
        return await _context.ClinicalExaminations
            .Include(e => e.Patient)
            .Include(e => e.ExaminingDoctor)
            .Where(e => e.TenantId == tenantId)
            .OrderByDescending(e => e.ExaminationDate)
            .ToListAsync();
    }

    public async Task<List<ClinicalExamination>> GetPatientExaminationsAsync(Guid patientId, Guid tenantId)
    {
        return await _context.ClinicalExaminations
            .Include(e => e.ExaminingDoctor)
            .Where(e => e.PatientId == patientId && e.TenantId == tenantId)
            .OrderByDescending(e => e.ExaminationDate)
            .ToListAsync();
    }

    public async Task<ClinicalExamination?> GetExaminationByIdAsync(Guid id, Guid tenantId)
    {
        return await _context.ClinicalExaminations
            .Include(e => e.Patient)
            .Include(e => e.ExaminingDoctor)
            .FirstOrDefaultAsync(e => e.Id == id && e.TenantId == tenantId);
    }

    public async Task<ClinicalExamination> CreateExaminationAsync(ClinicalExamination examination)
    {
        if (examination.Id == Guid.Empty)
        {
            examination.Id = Guid.NewGuid();
        }

        examination.ExaminationDate = DateTime.UtcNow;
        examination.CreatedAt = DateTime.UtcNow;
        examination.UpdatedAt = DateTime.UtcNow;

        _context.ClinicalExaminations.Add(examination);
        await _context.SaveChangesAsync();
        
        return examination;
    }

    public async Task<ClinicalExamination?> UpdateExaminationAsync(ClinicalExamination examination)
    {
        var existingExamination = await _context.ClinicalExaminations
            .FirstOrDefaultAsync(e => e.Id == examination.Id && e.TenantId == examination.TenantId);

        if (existingExamination == null)
        {
            return null;
        }

        examination.UpdatedAt = DateTime.UtcNow;
        _context.Entry(existingExamination).CurrentValues.SetValues(examination);
        await _context.SaveChangesAsync();
        
        return existingExamination;
    }

    public async Task<bool> DeleteExaminationAsync(Guid id, Guid tenantId)
    {
        var examination = await _context.ClinicalExaminations
            .FirstOrDefaultAsync(e => e.Id == id && e.TenantId == tenantId);

        if (examination == null)
        {
            return false;
        }

        _context.ClinicalExaminations.Remove(examination);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<ClinicalExamination?> SignExaminationAsync(Guid id, Guid doctorId, Guid tenantId)
    {
        var examination = await _context.ClinicalExaminations
            .FirstOrDefaultAsync(e => e.Id == id && e.TenantId == tenantId);

        if (examination == null)
        {
            return null;
        }

        examination.IsSigned = true;
        examination.SignedByUserId = doctorId;
        examination.SignedAt = DateTime.UtcNow;
        examination.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        _logger.LogInformation("Examination {ExaminationId} signed by doctor {DoctorId}", id, doctorId);

        return examination;
    }

    public async Task<(bool Success, string Message, string? DigitalSignature, Guid? FollowUpAppointmentId)> FinalizeExaminationAsync(
        Guid examinationId, 
        Guid doctorId, 
        Guid tenantId, 
        string pin, 
        DateTime? followUpDate = null, 
        string? followUpReason = null)
    {
        // TODO: Add PIN verification against stored pin_hash in AppUser table
        // For production: Add pin_hash column to users table and verify here
        
        // Basic PIN validation
        if (string.IsNullOrWhiteSpace(pin) || pin.Length < 4 || pin.Length > 6 || !pin.All(char.IsDigit))
        {
            return (false, "Invalid PIN format. Must be 4-6 digits.", null, null);
        }

        // Get examination with related data
        var examination = await _context.ClinicalExaminations
            .Include(e => e.Patient)
            .Include(e => e.ExaminingDoctor)
            .FirstOrDefaultAsync(e => e.Id == examinationId && e.TenantId == tenantId);

        if (examination == null)
        {
            return (false, "Examination not found.", null, null);
        }

        // Check if already signed
        if (examination.IsSigned)
        {
            return (false, "Examination is already finalized and cannot be modified.", null, null);
        }

        // Validate consultation completeness
        if (string.IsNullOrWhiteSpace(examination.ChiefComplaint))
        {
            return (false, "Chief complaint is required before finalization.", null, null);
        }

        if (string.IsNullOrWhiteSpace(examination.Diagnosis))
        {
            return (false, "At least one diagnosis is required before finalization.", null, null);
        }

        // Generate digital signature (SHA256 hash)
        var signatureData = new
        {
            ExaminationId = examination.Id,
            PatientId = examination.PatientId,
            DoctorId = doctorId,
            ExaminationDate = examination.ExaminationDate,
            ChiefComplaint = examination.ChiefComplaint,
            Diagnosis = examination.Diagnosis,
            TreatmentPlan = examination.TreatmentPlan,
            Prescription = examination.Prescription,
            Pin = pin,
            Timestamp = DateTime.UtcNow.ToString("o")
        };

        var signatureJson = JsonSerializer.Serialize(signatureData);
        var signatureBytes = Encoding.UTF8.GetBytes(signatureJson);
        var hashBytes = SHA256.HashData(signatureBytes);
        var digitalSignature = Convert.ToBase64String(hashBytes);

        // Update examination
        examination.IsSigned = true;
        examination.SignedByUserId = doctorId;
        examination.SignedAt = DateTime.UtcNow;
        examination.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Examination {ExaminationId} finalized by doctor {DoctorId} with digital signature", 
            examinationId, 
            doctorId);

        // Create follow-up appointment if requested
        Guid? followUpAppointmentId = null;
        if (followUpDate.HasValue)
        {
            try
            {
                var followUpAppointment = new Appointment
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    PatientId = examination.PatientId,
                    DoctorId = doctorId,
                    AppointmentDate = followUpDate.Value,
                    DurationMinutes = 30, // Default 30-minute follow-up
                    Status = "Scheduled",
                    AppointmentType = "Follow-up",
                    ReasonForVisit = followUpReason ?? "Follow-up consultation",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Appointments.Add(followUpAppointment);
                await _context.SaveChangesAsync();
                
                followUpAppointmentId = followUpAppointment.Id;
                _logger.LogInformation(
                    "Follow-up appointment {AppointmentId} created for examination {ExaminationId}", 
                    followUpAppointmentId, 
                    examinationId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create follow-up appointment for examination {ExaminationId}", examinationId);
                // Don't fail the finalization if follow-up creation fails
            }
        }

        return (true, "Examination finalized successfully.", digitalSignature, followUpAppointmentId);
    }
}