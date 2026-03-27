using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services;

public interface IReportService
{
    Task<byte[]> GenerateExaminationReportAsync(Guid examinationId, string format, Guid tenantId);
    Task<byte[]> GenerateInvestigationOrderAsync(Guid examinationId, string investigationType, Guid tenantId);
    Task<byte[]> GenerateReferralLetterAsync(Guid examinationId, Guid specialistId, Guid tenantId);
    Task<byte[]> GenerateMedicalCertificateAsync(Guid examinationId, int numberOfDays, Guid tenantId);
}

public class ReportService : IReportService
{
    private readonly AppDbContext _context;
    private readonly ILogger<ReportService> _logger;

    public ReportService(AppDbContext context, ILogger<ReportService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<byte[]> GenerateExaminationReportAsync(Guid examinationId, string format, Guid tenantId)
    {
        try
        {
            var examination = await _context.ClinicalExaminations
                .Include(e => e.Patient)
                .Include(e => e.ExaminingDoctor)
                .FirstOrDefaultAsync(e => e.Id == examinationId && e.TenantId == tenantId);

            if (examination == null)
            {
                throw new InvalidOperationException($"Examination {examinationId} not found");
            }

            // TODO: Implement report generation (PDF/DOCX) using QuestPDF or DocX library
            _logger.LogWarning("Report generation not yet implemented - returning placeholder for format {Format}", format);
            
            var reportContent = System.Text.Encoding.UTF8.GetBytes(
                $"COMPREHENSIVE EXAMINATION REPORT\n\n" +
                $"Patient Information:\n" +
                $"  Name: {examination.Patient?.FirstName} {examination.Patient?.LastName}\n" +
                $"  MRN: {examination.Patient?.MedicalRecordNumber}\n" +
                $"  Date of Birth: {examination.Patient?.DateOfBirth:yyyy-MM-dd}\n\n" +
                $"Examination Details:\n" +
                $"  Date: {examination.ExaminationDate:yyyy-MM-dd HH:mm}\n" +
                $"  Examining Doctor: Dr. {examination.ExaminingDoctor?.FirstName} {examination.ExaminingDoctor?.LastName}\n\n" +
                $"Chief Complaint:\n{examination.ChiefComplaint}\n\n" +
                $"Examination Notes:\n{examination.ExaminationNotes}\n\n" +
                $"Diagnosis:\n{examination.Diagnosis}\n\n" +
                $"Treatment Plan:\n{examination.TreatmentPlan}\n\n" +
                $"Prescription:\n{examination.Prescription}\n\n" +
                $"Follow-up Date: {examination.FollowUpDate:yyyy-MM-dd}\n\n" +
                $"--\n" +
                $"Generated on: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC\n" +
                $"Format: {format.ToUpper()}"
            );

            return reportContent;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating examination report for {ExaminationId}", examinationId);
            throw;
        }
    }

    public async Task<byte[]> GenerateInvestigationOrderAsync(Guid examinationId, string investigationType, Guid tenantId)
    {
        try
        {
            var examination = await _context.ClinicalExaminations
                .Include(e => e.Patient)
                .Include(e => e.ExaminingDoctor)
                .FirstOrDefaultAsync(e => e.Id == examinationId && e.TenantId == tenantId);

            if (examination == null)
            {
                throw new InvalidOperationException($"Examination {examinationId} not found");
            }

            // TODO: Implement investigation order with barcode
            _logger.LogWarning("Investigation order generation not yet implemented");
            
            var orderContent = System.Text.Encoding.UTF8.GetBytes(
                $"INVESTIGATION ORDER\n\n" +
                $"Order No: {Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}\n" +
                $"Date: {DateTime.UtcNow:yyyy-MM-dd HH:mm}\n\n" +
                $"Patient: {examination.Patient?.FirstName} {examination.Patient?.LastName}\n" +
                $"MRN: {examination.Patient?.MedicalRecordNumber}\n\n" +
                $"Investigation: {investigationType}\n\n" +
                $"Ordered by: Dr. {examination.ExaminingDoctor?.FirstName} {examination.ExaminingDoctor?.LastName}\n\n" +
                $"[BARCODE PLACEHOLDER]\n\n" +
                $"Clinical Notes: {examination.ChiefComplaint}"
            );

            return orderContent;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating investigation order for {ExaminationId}", examinationId);
            throw;
        }
    }

    public async Task<byte[]> GenerateReferralLetterAsync(Guid examinationId, Guid specialistId, Guid tenantId)
    {
        try
        {
            var examination = await _context.ClinicalExaminations
                .Include(e => e.Patient)
                .Include(e => e.ExaminingDoctor)
                .FirstOrDefaultAsync(e => e.Id == examinationId && e.TenantId == tenantId);

            var specialist = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == specialistId && u.TenantId == tenantId);

            if (examination == null || specialist == null)
            {
                throw new InvalidOperationException("Examination or specialist not found");
            }

            // TODO: Implement formal referral letter template
            _logger.LogWarning("Referral letter generation not yet implemented");
            
            var letterContent = System.Text.Encoding.UTF8.GetBytes(
                $"REFERRAL LETTER\n\n" +
                $"Date: {DateTime.UtcNow:yyyy-MM-dd}\n\n" +
                $"To: Dr. {specialist.FirstName} {specialist.LastName}\n\n" +
                $"Dear Colleague,\n\n" +
                $"Re: {examination.Patient?.FirstName} {examination.Patient?.LastName} (MRN: {examination.Patient?.MedicalRecordNumber})\n\n" +
                $"I am referring this patient for your expert opinion and management.\n\n" +
                $"Clinical History:\n{examination.ChiefComplaint}\n\n" +
                $"Findings:\n{examination.ExaminationNotes}\n\n" +
                $"Current Diagnosis:\n{examination.Diagnosis}\n\n" +
                $"I would appreciate your assessment and recommendations.\n\n" +
                $"Thank you for your attention.\n\n" +
                $"Yours sincerely,\n\n" +
                $"Dr. {examination.ExaminingDoctor?.FirstName} {examination.ExaminingDoctor?.LastName}\n" +
                $"Date: {examination.ExaminationDate:yyyy-MM-dd}"
            );

            return letterContent;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating referral letter for {ExaminationId}", examinationId);
            throw;
        }
    }

    public async Task<byte[]> GenerateMedicalCertificateAsync(Guid examinationId, int numberOfDays, Guid tenantId)
    {
        try
        {
            var examination = await _context.ClinicalExaminations
                .Include(e => e.Patient)
                .Include(e => e.ExaminingDoctor)
                .FirstOrDefaultAsync(e => e.Id == examinationId && e.TenantId == tenantId);

            if (examination == null)
            {
                throw new InvalidOperationException($"Examination {examinationId} not found");
            }

            var endDate = examination.ExaminationDate.AddDays(numberOfDays);

            // TODO: Implement formal medical certificate template
            _logger.LogWarning("Medical certificate generation not yet implemented");
            
            var certificateContent = System.Text.Encoding.UTF8.GetBytes(
                $"MEDICAL CERTIFICATE\n\n" +
                $"Certificate No: MC-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 6).ToUpper()}\n\n" +
                $"This is to certify that:\n\n" +
                $"  {examination.Patient?.FirstName} {examination.Patient?.LastName}\n" +
                $"  Date of Birth: {examination.Patient?.DateOfBirth:yyyy-MM-dd}\n" +
                $"  Address: {examination.Patient?.Address}\n\n" +
                $"was examined by me on {examination.ExaminationDate:yyyy-MM-dd}.\n\n" +
                $"Diagnosis: {examination.Diagnosis}\n\n" +
                $"I recommend {numberOfDays} day(s) of medical leave from " +
                $"{examination.ExaminationDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd}.\n\n\n" +
                $"Dr. {examination.ExaminingDoctor?.FirstName} {examination.ExaminingDoctor?.LastName}\n" +
                $"Registration No: [REGISTRATION_NUMBER]\n" +
                $"Date: {DateTime.UtcNow:yyyy-MM-dd}\n\n" +
                $"[SIGNATURE PLACEHOLDER]"
            );

            return certificateContent;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating medical certificate for {ExaminationId}", examinationId);
            throw;
        }
    }
}
