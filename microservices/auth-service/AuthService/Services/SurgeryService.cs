using AuthService.Context;
using AuthService.DTOs;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services
{
    /// <summary>
    /// Service implementation for surgery recommendation and management
    /// </summary>
    public class SurgeryService : ISurgeryService
    {
        private readonly AppDbContext _context;

        public SurgeryService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<SurgeryRequestResponseDto> CreateSurgeryRecommendationAsync(
            SurgeryRecommendationDto dto,
            Guid doctorId,
            Guid tenantId,
            Guid branchId)
        {
            // Get patient details
            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.Id == dto.PatientId && p.TenantId == tenantId);

            if (patient == null)
            {
                throw new Exception("Patient not found");
            }

            // Create surgery request
            var surgeryRequest = new SurgeryRequest
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                BranchId = branchId,
                SurgeonId = doctorId,
                PatientName = $"{patient.FirstName} {patient.LastName}",
                PatientMobile = patient.ContactNumber ?? "",
                ProcedureType = $"{dto.SurgeryType} - {dto.ProcedureType} ({dto.Eye})",
                RequestType = "doctor-recommendation",
                Urgency = dto.Urgency,
                PreferredDate = dto.PreferredDate,
                PreferredTime = dto.PreferredTime,
                Notes = BuildNotesFromRecommendation(dto),
                SpecialInstructions = dto.SpecialInstructions,
                Status = "pending",
                RequestDate = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedByUserId = doctorId,
                UpdatedByUserId = doctorId
            };

            _context.SurgeryRequests.Add(surgeryRequest);
            await _context.SaveChangesAsync();

            return MapToResponseDto(surgeryRequest, dto.PreOpChecklist);
        }

        public async Task<IOLCalculationResultDto> CalculateIOLPowerAsync(IOLCalculationDto dto)
        {
            var result = new IOLCalculationResultDto();
            var warnings = new List<string>();

            // Validate axial length and provide warnings
            if (dto.AxialLength < 22.0m)
            {
                warnings.Add("Short axial length (<22mm). Hoffer Q formula recommended for accuracy.");
                result.RecommendedFormula = "Hoffer Q";
            }
            else if (dto.AxialLength > 27.0m)
            {
                warnings.Add("Long axial length (>27mm). Barrett Universal II or Haigis formula recommended.");
                result.RecommendedFormula = "Barrett Universal II";
            }

            // Calculate average keratometry
            decimal kavg = (dto.K1 + dto.K2) / 2.0m;

            // Calculate powers for each formula
            foreach (var formula in dto.Formulas)
            {
                decimal power = formula switch
                {
                    "SRK/T" => CalculateSRKT(dto.AxialLength, kavg, dto.AConstant, dto.TargetRefraction),
                    "Barrett Universal II" => CalculateBarrett(dto.AxialLength, kavg, dto.AnteriorChamberDepth, dto.AConstant, dto.TargetRefraction),
                    "Haigis" => CalculateHaigis(dto.AxialLength, kavg, dto.AnteriorChamberDepth, dto.AConstant, dto.TargetRefraction),
                    "Holladay 1" => CalculateHolladay1(dto.AxialLength, kavg, dto.AConstant, dto.TargetRefraction),
                    "Hoffer Q" => CalculateHofferQ(dto.AxialLength, kavg, dto.AConstant, dto.TargetRefraction),
                    _ => 0.0m
                };

                result.CalculatedPowers[formula] = Math.Round(power, 2);
            }

            result.Warnings = warnings;
            return await Task.FromResult(result);
        }

        public async Task<List<string>> GeneratePreOpChecklistAsync(PreOpChecklistDto dto)
        {
            var checklist = new List<string>();

            // Surgery-specific items
            switch (dto.SurgeryType)
            {
                case "Cataract":
                    checklist.AddRange(new[]
                    {
                        "Biometry (IOLMaster or A-scan)",
                        "Dilated fundus examination",
                        "ECG (if patient age >60 years)",
                        "Blood tests: CBC, RBS, HbA1c (if diabetic)",
                        "Blood pressure check",
                        "Physician clearance (if systemic disease)",
                        "Informed consent - surgery risks & benefits",
                        "Informed consent - IOL type and refractive target",
                        "Stop anticoagulants (if on Warfarin/Aspirin - as per physician advice)",
                        "Fasting 6 hours before surgery"
                    });
                    break;

                case "Glaucoma":
                    checklist.AddRange(new[]
                    {
                        "Visual field testing (Humphrey 24-2)",
                        "OCT RNFL analysis",
                        "Gonioscopy (angle assessment)",
                        "Pachymetry (corneal thickness)",
                        "Dilated fundus examination",
                        "Blood tests: CBC, PT/INR (if on anticoagulants)",
                        "Blood pressure check",
                        "ECG (if patient age >60 years)",
                        "Physician clearance (if systemic disease)",
                        "Informed consent - surgery risks including vision loss, infection",
                        "Stop anticoagulants as per physician advice (high bleeding risk)",
                        "Fasting 6 hours before surgery"
                    });
                    break;

                case "Vitreoretinal":
                    checklist.AddRange(new[]
                    {
                        "B-scan ultrasonography",
                        "OCT macula (high resolution)",
                        "Fundus photography (wide-field if available)",
                        "Fluorescein angiography (if needed)",
                        "Visual field testing (if needed)",
                        "Blood tests: CBC, RBS, HbA1c (if diabetic)",
                        "Blood pressure check (critical for diabetic retinopathy)",
                        "ECG (if patient age >60 years)",
                        "Physician clearance (especially for diabetics)",
                        "Informed consent - surgery risks including vision loss, retinal detachment",
                        "Stop anticoagulants as per physician advice (high bleeding risk)",
                        "Fasting 8 hours before surgery (longer surgery duration)"
                    });
                    break;

                case "Corneal":
                    checklist.AddRange(new[]
                    {
                        "Corneal topography",
                        "Specular microscopy (endothelial cell count)",
                        "Pachymetry (corneal thickness)",
                        "Anterior segment OCT (if available)",
                        "Dilated fundus examination",
                        "Blood tests: CBC, HIV, HBsAg, HCV (donor tissue screening)",
                        "ECG (if patient age >60 years)",
                        "Physician clearance (if systemic disease)",
                        "Informed consent - graft rejection risks, prolonged recovery",
                        "Informed consent - immune suppression medications",
                        "Stop contact lens wear (2 weeks before topography)",
                        "Fasting 6 hours before surgery"
                    });
                    break;
            }

            // Add patient-specific items
            if (dto.PatientAge > 60)
            {
                if (!checklist.Contains("ECG (if patient age >60 years)"))
                {
                    checklist.Add("ECG (patient age >60 years)");
                }
            }

            if (dto.HasDiabetes)
            {
                if (!checklist.Any(c => c.Contains("HbA1c")))
                {
                    checklist.Add("HbA1c test (diabetic patient)");
                }
                checklist.Add("Ensure HbA1c <8% before surgery");
            }

            if (dto.HasHypertension)
            {
                checklist.Add("Blood pressure control check (target <140/90)");
            }

            if (dto.OnAnticoagulants)
            {
                checklist.Add("PT/INR check before surgery");
                checklist.Add("Coordinate with physician for anticoagulant management");
            }

            // Add custom items
            checklist.AddRange(dto.AdditionalItems);

            return await Task.FromResult(checklist.Distinct().ToList());
        }

        public async Task<bool> ReferToCounselorAsync(CounselorReferralDto dto, Guid userId)
        {
            var surgeryRequest = await _context.SurgeryRequests.FindAsync(dto.SurgeryRequestId);

            if (surgeryRequest == null)
            {
                return false;
            }

            // Update surgery request with counselor referral notes
            surgeryRequest.Notes = string.IsNullOrEmpty(surgeryRequest.Notes)
                ? $"Counselor Referral: {dto.ReferralNotes}"
                : $"{surgeryRequest.Notes}\n\nCounselor Referral: {dto.ReferralNotes}";

            if (dto.IsPriorityReferral)
            {
                surgeryRequest.Urgency = "urgent";
            }

            surgeryRequest.UpdatedAt = DateTime.UtcNow;
            surgeryRequest.UpdatedByUserId = userId;

            await _context.SaveChangesAsync();

            // TODO: Create actual referral record in counselor queue (when counselor module is implemented)
            // For now, just update the surgery request

            return true;
        }

        public async Task<List<SurgeryRequestResponseDto>> GetByPatientAsync(Guid patientId)
        {
            var patient = await _context.Patients.FindAsync(patientId);
            if (patient == null)
            {
                return new List<SurgeryRequestResponseDto>();
            }

            var requests = await _context.SurgeryRequests
                .Where(sr => sr.PatientName.Contains(patient.FirstName) || sr.PatientMobile == patient.ContactNumber)
                .OrderByDescending(sr => sr.RequestDate)
                .ToListAsync();

            return requests.Select(r => MapToResponseDto(r, ExtractPreOpChecklistFromNotes(r.Notes))).ToList();
        }

        public async Task<SurgeryRequestResponseDto?> GetByIdAsync(Guid id)
        {
            var request = await _context.SurgeryRequests.FindAsync(id);
            return request == null ? null : MapToResponseDto(request, ExtractPreOpChecklistFromNotes(request.Notes));
        }

        public async Task<bool> UpdateStatusAsync(Guid id, string status, Guid userId)
        {
            var request = await _context.SurgeryRequests.FindAsync(id);
            if (request == null)
            {
                return false;
            }

            request.Status = status;
            request.UpdatedAt = DateTime.UtcNow;
            request.UpdatedByUserId = userId;

            await _context.SaveChangesAsync();
            return true;
        }

        #region IOL Calculation Formulas

        private decimal CalculateSRKT(decimal al, decimal kavg, decimal aconst, decimal targetRef)
        {
            // SRK/T formula (simplified approximation)
            decimal lc = aconst - 3.0m;
            decimal cornealHeight = kavg * 0.3375m;
            decimal retinalThickness = 0.65696m - 0.02029m * al;
            decimal expectedELP = lc + cornealHeight + retinalThickness;
            
            decimal power = (1336.0m / (al - expectedELP)) - (1.336m / ((1.336m / (kavg / 1000.0m)) - expectedELP));
            power = power - targetRef;

            return power;
        }

        private decimal CalculateBarrett(decimal al, decimal kavg, decimal acd, decimal aconst, decimal targetRef)
        {
            // Barrett Universal II (simplified approximation)
            decimal lensConstant = aconst - 3.5m;
            decimal iolPosition = lensConstant + 0.1m * acd + 0.05m * al;
            
            decimal power = (1336.0m / (al - iolPosition)) - (1.336m / ((1.336m / (kavg / 1000.0m)) - iolPosition));
            power = power - targetRef;

            return power;
        }

        private decimal CalculateHaigis(decimal al, decimal kavg, decimal acd, decimal aconst, decimal targetRef)
        {
            // Haigis formula (simplified approximation)
            decimal a0 = aconst - 118.4m + 0.62467m;
            decimal a1 = 0.4m;
            decimal a2 = 0.1m;
            
            decimal iolPosition = a0 + a1 * acd + a2 * al;
            
            decimal power = (1336.0m / (al - iolPosition)) - (1.336m / ((1.336m / (kavg / 1000.0m)) - iolPosition));
            power = power - targetRef;

            return power;
        }

        private decimal CalculateHolladay1(decimal al, decimal kavg, decimal aconst, decimal targetRef)
        {
            // Holladay 1 formula (simplified approximation)
            decimal sf = aconst - 0.5663m;
            decimal iolPosition = 1.336m * kavg / 1000.0m + sf;
            
            decimal power = (1336.0m / (al - iolPosition)) - (1.336m / ((1.336m / (kavg / 1000.0m)) - iolPosition));
            power = power - targetRef;

            return power;
        }

        private decimal CalculateHofferQ(decimal al, decimal kavg, decimal aconst, decimal targetRef)
        {
            // Hoffer Q formula (simplified approximation)
            decimal pACD = aconst - 3.0m + 0.3m * al;
            
            decimal power = (1336.0m / (al - pACD)) - (1.336m / ((1.336m / (kavg / 1000.0m)) - pACD));
            power = power - targetRef;

            return power;
        }

        #endregion

        #region Helper Methods

        private string BuildNotesFromRecommendation(SurgeryRecommendationDto dto)
        {
            var notes = $"Surgery Type: {dto.SurgeryType}\n";
            notes += $"Procedure: {dto.ProcedureType}\n";
            notes += $"Eye: {dto.Eye}\n";
            notes += $"Package: {dto.PackageType} (₹{dto.PackagePrice:N0})\n";

            if (!string.IsNullOrEmpty(dto.DiagnosisCode))
            {
                notes += $"Diagnosis: {dto.DiagnosisCode} - {dto.DiagnosisDescription}\n";
            }

            if (dto.IOLPower.HasValue)
            {
                notes += $"IOL Power: {dto.IOLPower}D (Formula: {dto.IOLFormula})\n";
                notes += $"IOL Type: {dto.IOLType}\n";
            }

            if (dto.PreOpChecklist.Any())
            {
                notes += "\nPre-operative Checklist:\n";
                notes += string.Join("\n", dto.PreOpChecklist.Select(item => $"- {item}"));
            }

            if (!string.IsNullOrEmpty(dto.Notes))
            {
                notes += $"\n\nAdditional Notes: {dto.Notes}";
            }

            return notes;
        }

        private List<string> ExtractPreOpChecklistFromNotes(string? notes)
        {
            if (string.IsNullOrEmpty(notes))
            {
                return new List<string>();
            }

            var checklistStart = notes.IndexOf("Pre-operative Checklist:");
            if (checklistStart == -1)
            {
                return new List<string>();
            }

            var checklistSection = notes.Substring(checklistStart);
            var items = checklistSection
                .Split('\n')
                .Where(line => line.Trim().StartsWith("- "))
                .Select(line => line.Trim().Substring(2))
                .ToList();

            return items;
        }

        private SurgeryRequestResponseDto MapToResponseDto(SurgeryRequest request, List<string> preOpChecklist)
        {
            // Extract patient ID from notes if available (for now, use empty Guid as placeholder)
            // In production, you'd store patient_id in surgery_request table
            Guid patientId = Guid.Empty;

            // Extract surgery type from procedure type
            string surgeryType = "Unknown";
            if (request.ProcedureType.Contains("Cataract")) surgeryType = "Cataract";
            else if (request.ProcedureType.Contains("Glaucoma")) surgeryType = "Glaucoma";
            else if (request.ProcedureType.Contains("Vitreoretinal")) surgeryType = "Vitreoretinal";
            else if (request.ProcedureType.Contains("Corneal")) surgeryType = "Corneal";

            // Extract eye from procedure type
            string eye = "OU";
            if (request.ProcedureType.Contains("(OD)")) eye = "OD";
            else if (request.ProcedureType.Contains("(OS)")) eye = "OS";

            // Extract package type from notes
            string packageType = "Standard";
            decimal? packagePrice = null;
            if (request.Notes != null && request.Notes.Contains("Package:"))
            {
                var packageLine = request.Notes.Split('\n').FirstOrDefault(l => l.Contains("Package:"));
                if (packageLine != null)
                {
                    if (packageLine.Contains("Premium")) packageType = "Premium";
                    else if (packageLine.Contains("Custom")) packageType = "Custom";

                    // Extract price
                    var priceMatch = System.Text.RegularExpressions.Regex.Match(packageLine, @"₹([\d,]+)");
                    if (priceMatch.Success)
                    {
                        packagePrice = decimal.Parse(priceMatch.Groups[1].Value.Replace(",", ""));
                    }
                }
            }

            return new SurgeryRequestResponseDto
            {
                Id = request.Id,
                PatientId = patientId,
                PatientName = request.PatientName,
                SurgeryType = surgeryType,
                ProcedureType = request.ProcedureType,
                Eye = eye,
                PackageType = packageType,
                PackagePrice = packagePrice,
                Status = request.Status,
                Urgency = request.Urgency,
                PreferredDate = request.PreferredDate,
                RequestDate = request.RequestDate,
                PreOpChecklist = preOpChecklist,
                CounselorReferralSent = request.Notes?.Contains("Counselor Referral:") ?? false
            };
        }

        #endregion
    }
}
