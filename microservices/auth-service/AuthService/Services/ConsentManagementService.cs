using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using AuthService.Context;
using AuthService.Models.Counselor;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services
{
    public class ConsentManagementService : IConsentManagementService
    {
        private readonly AppDbContext _context;
        private readonly IBranchCacheService _branchCache;

        public ConsentManagementService(AppDbContext context, IBranchCacheService branchCache)
        {
            _context = context;
            _branchCache = branchCache;
        }

        // ==================== Consent Templates ====================

        public async Task<List<ConsentTemplateDto>> GetAllTemplatesAsync()
        {
            var templates = await _context.ConsentFormTemplates
                .Where(t => t.DeletedAt == null && t.IsActive)
                .OrderBy(t => t.TemplateName)
                .ToListAsync();

            return templates.Select(ToTemplateDto).ToList();
        }

        public async Task<ConsentTemplateDto?> GetTemplateByIdAsync(Guid id)
        {
            var template = await _context.ConsentFormTemplates
                .FirstOrDefaultAsync(t => t.Id == id && t.DeletedAt == null);
            
            return template != null ? ToTemplateDto(template) : null;
        }

        public async Task<ConsentTemplateDto> CreateTemplateAsync(CreateConsentTemplateRequest request, Guid tenantId, Guid userId)
        {
            var template = new ConsentFormTemplate
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                TemplateName = request.TemplateName,
                ConsentCategory = request.ConsentCategory,
                Description = request.Description,
                TemplateHtml = request.TemplateHtml,
                RequiresPatientSignature = request.RequiresPatientSignature,
                RequiresWitnessSignature = request.RequiresWitnessSignature,
                RequiresGuardianSignature = request.RequiresGuardianSignature,
                ComplianceStandards = request.ComplianceStandards?.ToArray(),
                Version = request.Version,
                EffectiveFrom = DateTime.UtcNow,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = userId
            };

            _context.ConsentFormTemplates.Add(template);
            await _context.SaveChangesAsync();

            return ToTemplateDto(template);
        }

        public async Task<bool> DeleteTemplateAsync(Guid id)
        {
            var template = await _context.ConsentFormTemplates.FindAsync(id);
            if (template == null) return false;

            template.DeletedAt = DateTime.UtcNow;
            template.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }

        // ==================== Patient Consents ====================

        public async Task<ConsentListResponse> GetAllConsentsAsync(int page, int pageSize, Guid? sessionId)
        {
            var query = _context.CounselingConsents
                .Where(c => c.DeletedAt == null);

            if (sessionId.HasValue)
                query = query.Where(c => c.SessionId == sessionId.Value);

            var totalRecords = await query.CountAsync();
            var consents = await query
                .OrderByDescending(c => c.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var consentDtos = consents.Select(ToConsentDto).ToList();

            // Hydrate patient names and MRNs
            var patientIds = consentDtos.Select(c => c.PatientId).Distinct().ToList();
            if (patientIds.Any())
            {
                var patientData = await _context.Patients
                    .Where(p => patientIds.Contains(p.Id))
                    .Select(p => new { p.Id, FullName = p.FirstName + " " + p.LastName, p.MedicalRecordNumber })
                    .ToListAsync();
                
                var patientNames = patientData.ToDictionary(p => p.Id, p => p.FullName);
                var patientMrns = patientData.ToDictionary(p => p.Id, p => p.MedicalRecordNumber);

                foreach (var consent in consentDtos)
                {
                    consent.PatientName = patientNames.GetValueOrDefault(consent.PatientId);
                    consent.PatientMrn = patientMrns.GetValueOrDefault(consent.PatientId);
                }
            }

            return new ConsentListResponse
            {
                TotalRecords = totalRecords,
                Consents = consentDtos
            };
        }

        public async Task<PatientConsentDto?> GetConsentByIdAsync(Guid id)
        {
            var consent = await _context.CounselingConsents
                .FirstOrDefaultAsync(c => c.Id == id && c.DeletedAt == null);
            
            if (consent == null) return null;

            var consentDto = ToConsentDto(consent);

            // Hydrate patient name and MRN
            var patient = await _context.Patients
                .Where(p => p.Id == consentDto.PatientId)
                .Select(p => new { p.FirstName, p.LastName, p.MedicalRecordNumber })
                .FirstOrDefaultAsync();
            
            if (patient != null)
            {
                consentDto.PatientName = patient.FirstName + " " + patient.LastName;
                consentDto.PatientMrn = patient.MedicalRecordNumber;
            }

            return consentDto;
        }

        public async Task<PatientConsentDto> RenderConsentAsync(RenderConsentRequest request, Guid tenantId, Guid userId)
        {
            var template = await _context.ConsentFormTemplates.FindAsync(request.TemplateId);
            if (template == null)
                throw new InvalidOperationException("Consent template not found");

            var branch = await _branchCache.GetDefaultBranchForTenantAsync(tenantId);
            if (branch == null)
                throw new InvalidOperationException("Branch not found for tenant");

            // Replace placeholders in template HTML
            string renderedHtml = template.TemplateHtml;
            foreach (var placeholder in request.PlaceholderValues)
            {
                renderedHtml = renderedHtml.Replace($"{{{{{placeholder.Key}}}}}", placeholder.Value);
            }

            var consent = new CounselingConsent
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                BranchId = branch.Id,
                TemplateId = request.TemplateId,
                SessionId = request.SessionId,
                PatientId = request.PatientId,
                PackageId = request.PackageId,
                RenderedHtml = renderedHtml,
                ConsentStatus = "Draft",
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = userId
            };

            _context.CounselingConsents.Add(consent);
            await _context.SaveChangesAsync();

            return ToConsentDto(consent);
        }

        public async Task<PatientConsentDto> SignConsentAsync(Guid id, SignConsentRequest request, Guid userId)
        {
            var consent = await _context.CounselingConsents
                .FirstOrDefaultAsync(c => c.Id == id && c.DeletedAt == null);

            if (consent == null)
                throw new InvalidOperationException("Consent not found");

            if (consent.ConsentStatus == "Signed")
                throw new InvalidOperationException("Consent already signed");

            // Patient signature
            if (!string.IsNullOrEmpty(request.PatientSignatureBase64))
            {
                consent.PatientSignatureBase64 = request.PatientSignatureBase64;
                consent.PatientSignedAt = DateTime.UtcNow;
            }

            // Witness signature
            if (!string.IsNullOrEmpty(request.WitnessSignatureBase64))
            {
                consent.WitnessName = request.WitnessName;
                consent.WitnessSignatureBase64 = request.WitnessSignatureBase64;
                consent.WitnessSignedAt = DateTime.UtcNow;
            }

            // Guardian signature (for minors)
            if (!string.IsNullOrEmpty(request.GuardianSignatureBase64))
            {
                consent.GuardianName = request.GuardianName;
                consent.GuardianRelation = request.GuardianRelation;
                consent.GuardianSignatureBase64 = request.GuardianSignatureBase64;
                consent.GuardianSignedAt = DateTime.UtcNow;
            }

            // Check if all required signatures are present
            var template = await _context.ConsentFormTemplates.FindAsync(consent.TemplateId);
            bool allSignaturesComplete = true;

            if (template != null)
            {
                if (template.RequiresPatientSignature && string.IsNullOrEmpty(consent.PatientSignatureBase64))
                    allSignaturesComplete = false;
                if (template.RequiresWitnessSignature && string.IsNullOrEmpty(consent.WitnessSignatureBase64))
                    allSignaturesComplete = false;
                if (template.RequiresGuardianSignature && string.IsNullOrEmpty(consent.GuardianSignatureBase64))
                    allSignaturesComplete = false;
            }

            if (allSignaturesComplete)
                consent.ConsentStatus = "Signed";

            consent.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return ToConsentDto(consent);
        }

        public async Task<PatientConsentDto> RevokeConsentAsync(Guid id, RevokeConsentRequest request, Guid userId)
        {
            var consent = await _context.CounselingConsents
                .FirstOrDefaultAsync(c => c.Id == id && c.DeletedAt == null);

            if (consent == null)
                throw new InvalidOperationException("Consent not found");

            consent.ConsentStatus = "Revoked";
            consent.RevokedAt = DateTime.UtcNow;
            consent.RevocationReason = request.RevocationReason;
            consent.RevokedByUserId = userId;
            consent.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return ToConsentDto(consent);
        }

        public async Task<string?> GenerateConsentPdfAsync(Guid id)
        {
            var consent = await _context.CounselingConsents.FindAsync(id);
            if (consent == null) return null;

            // TODO: Integrate PDF generation library (iTextSharp, PuppeteerSharp)
            // For now, return placeholder URL
            consent.PdfUrl = $"https://storage.example.com/consents/{id}.pdf";
            consent.PdfGeneratedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return consent.PdfUrl;
        }

        // ==================== Helper Methods ====================

        private ConsentTemplateDto ToTemplateDto(ConsentFormTemplate template)
        {
            return new ConsentTemplateDto
            {
                Id = template.Id,
                TemplateName = template.TemplateName,
                ConsentCategory = template.ConsentCategory,
                Description = template.Description,
                TemplateHtml = template.TemplateHtml,
                RequiresPatientSignature = template.RequiresPatientSignature,
                RequiresWitnessSignature = template.RequiresWitnessSignature,
                RequiresGuardianSignature = template.RequiresGuardianSignature,
                Version = template.Version,
                IsActive = template.IsActive,
                CreatedAt = template.CreatedAt
            };
        }

        private PatientConsentDto ToConsentDto(CounselingConsent consent)
        {
            return new PatientConsentDto
            {
                Id = consent.Id,
                TemplateId = consent.TemplateId,
                SessionId = consent.SessionId,
                PatientId = consent.PatientId,
                PackageId = consent.PackageId,
                RenderedHtml = consent.RenderedHtml,
                IsPatientSigned = !string.IsNullOrEmpty(consent.PatientSignatureBase64),
                PatientSignedAt = consent.PatientSignedAt,
                IsWitnessSigned = !string.IsNullOrEmpty(consent.WitnessSignatureBase64),
                WitnessSignedAt = consent.WitnessSignedAt,
                IsGuardianSigned = !string.IsNullOrEmpty(consent.GuardianSignatureBase64),
                GuardianSignedAt = consent.GuardianSignedAt,
                ConsentStatus = consent.ConsentStatus,
                PdfUrl = consent.PdfUrl,
                CreatedAt = consent.CreatedAt
            };
        }
    }
}
