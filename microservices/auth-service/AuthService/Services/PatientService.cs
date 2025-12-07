using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services;

public interface IPatientService
{
    Task<List<Patient>> GetAllPatientsAsync(Guid tenantId);
    Task<Patient?> GetPatientByIdAsync(Guid id, Guid tenantId);
    Task<Patient> CreatePatientAsync(Patient patient);
    Task<Patient?> UpdatePatientAsync(Patient patient);
    Task<bool> DeletePatientAsync(Guid id, Guid tenantId);
}

public class PatientService : IPatientService
{
    private readonly AppDbContext _context;
    private readonly ILogger<PatientService> _logger;

    public PatientService(AppDbContext context, ILogger<PatientService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<Patient>> GetAllPatientsAsync(Guid tenantId)
    {
        return await _context.Patients
            .Where(p => p.TenantId == tenantId)
            .OrderBy(p => p.LastName)
            .ThenBy(p => p.FirstName)
            .ToListAsync();
    }

    public async Task<Patient?> GetPatientByIdAsync(Guid id, Guid tenantId)
    {
        return await _context.Patients
            .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId);
    }

    public async Task<Patient> CreatePatientAsync(Patient patient)
    {
        if (patient.Id == Guid.Empty)
        {
            patient.Id = Guid.NewGuid();
        }

        patient.CreatedAt = DateTime.UtcNow;
        patient.UpdatedAt = DateTime.UtcNow;

        _context.Patients.Add(patient);
        await _context.SaveChangesAsync();
        
        return patient;
    }

    public async Task<Patient?> UpdatePatientAsync(Patient patient)
    {
        var existingPatient = await _context.Patients
            .FirstOrDefaultAsync(p => p.Id == patient.Id && p.TenantId == patient.TenantId);

        if (existingPatient == null)
        {
            return null;
        }

        patient.UpdatedAt = DateTime.UtcNow;
        _context.Entry(existingPatient).CurrentValues.SetValues(patient);
        await _context.SaveChangesAsync();
        
        return existingPatient;
    }

    public async Task<bool> DeletePatientAsync(Guid id, Guid tenantId)
    {
        var patient = await _context.Patients
            .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId);

        if (patient == null)
        {
            return false;
        }

        _context.Patients.Remove(patient);
        await _context.SaveChangesAsync();
        return true;
    }
}