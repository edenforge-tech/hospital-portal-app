using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services;

public interface IExaminationService
{
    Task<List<ClinicalExamination>> GetAllExaminationsAsync(Guid tenantId);
    Task<List<ClinicalExamination>> GetPatientExaminationsAsync(Guid patientId, Guid tenantId);
    Task<ClinicalExamination?> GetExaminationByIdAsync(Guid id, Guid tenantId);
    Task<ClinicalExamination> CreateExaminationAsync(ClinicalExamination examination);
    Task<ClinicalExamination?> UpdateExaminationAsync(ClinicalExamination examination);
    Task<bool> DeleteExaminationAsync(Guid id, Guid tenantId);
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
}