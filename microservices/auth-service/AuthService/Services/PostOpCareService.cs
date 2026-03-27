using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using AuthService.Context;
using AuthService.DTOs.FollowUp;
using AuthService.Models;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services
{
    public class PostOpCareService : IPostOpCareService
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public PostOpCareService(AppDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        private Guid GetCurrentTenantId()
        {
            var tenantIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("tenant_id");
            return tenantIdClaim != null ? Guid.Parse(tenantIdClaim.Value) : Guid.Empty;
        }

        public async Task<List<PostOpCareDto>> GetActivePostOpPatientsAsync()
        {
            var tenantId = GetCurrentTenantId();
            var cutoffDate = DateTime.UtcNow.AddMonths(-6); // Active if surgery within last 6 months

            var schedules = await _context.PostOpCareSchedules
                .Include(s => s.Patient)
                .Include(s => s.Surgeon)
                .Where(s => s.TenantId == tenantId && s.DeletedAt == null && s.SurgeryDate >= cutoffDate)
                .ToListAsync();

            var result = new List<PostOpCareDto>();

            foreach (var schedule in schedules)
            {
                var visits = await _context.PostOpVisits
                    .Where(v => v.PostOpCareScheduleId == schedule.Id && v.DeletedAt == null)
                    .OrderBy(v => v.ScheduledDate)
                    .ToListAsync();

                var medications = await _context.Set<PostOpMedication>()
                    .Where(m => m.PostOpCareScheduleId == schedule.Id && m.DeletedAt == null)
                    .ToListAsync();

                result.Add(MapToDto(schedule, visits, medications));
            }

            return result;
        }

        public async Task<PostOpCareDto?> GetPostOpCareByPatientIdAsync(Guid patientId)
        {
            var tenantId = GetCurrentTenantId();

            var schedule = await _context.PostOpCareSchedules
                .Include(s => s.Patient)
                .Include(s => s.Surgeon)
                .Where(s => s.TenantId == tenantId && s.PatientId == patientId && s.DeletedAt == null)
                .OrderByDescending(s => s.SurgeryDate)
                .FirstOrDefaultAsync();

            if (schedule == null)
                return null;

            var visits = await _context.PostOpVisits
                .Where(v => v.PostOpCareScheduleId == schedule.Id && v.DeletedAt == null)
                .OrderBy(v => v.ScheduledDate)
                .ToListAsync();

            var medications = await _context.Set<PostOpMedication>()
                .Where(m => m.PostOpCareScheduleId == schedule.Id && m.DeletedAt == null)
                .ToListAsync();

            return MapToDto(schedule, visits, medications);
        }

        public async Task<PostOpCareDto> CreatePostOpCareScheduleAsync(Guid patientId, string surgeryType, DateTime surgeryDate, string surgeryEye, Guid surgeonId, Guid userId)
        {
            var tenantId = GetCurrentTenantId();

            var schedule = new PostOpCareSchedule
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                PatientId = patientId,
                SurgeryType = surgeryType,
                SurgeryDate = surgeryDate,
                SurgeryEye = surgeryEye,
                SurgeonId = surgeonId,
                Instructions = JsonSerializer.Serialize(GetDefaultInstructions(surgeryType)),
                Restrictions = JsonSerializer.Serialize(GetDefaultRestrictions(surgeryType)),
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = userId
            };

            _context.PostOpCareSchedules.Add(schedule);

            // Create default visit schedule
            var visits = GetDefaultVisitSchedule(schedule.Id, surgeryDate, tenantId, userId);
            _context.PostOpVisits.AddRange(visits);

            await _context.SaveChangesAsync();

            return await GetPostOpCareByPatientIdAsync(patientId) ?? MapToDto(schedule, visits, new List<PostOpMedication>());
        }

        public async Task<PostOpVisitDto> CompleteVisitAsync(Guid visitId, CompleteVisitDto dto, Guid userId)
        {
            var tenantId = GetCurrentTenantId();

            var visit = await _context.PostOpVisits
                .FirstOrDefaultAsync(v => v.Id == visitId && v.TenantId == tenantId && v.DeletedAt == null);

            if (visit == null)
                throw new Exception("Visit not found");

            visit.Completed = true;
            visit.CompletedDate = DateTime.UtcNow;
            visit.Findings = dto.Findings;
            visit.VisualAcuity = dto.VisualAcuity;
            visit.IOP = dto.IOP;
            visit.Complications = dto.Complications;
            visit.ExaminerId = userId;
            visit.UpdatedAt = DateTime.UtcNow;
            visit.UpdatedByUserId = userId;

            await _context.SaveChangesAsync();

            return new PostOpVisitDto
            {
                Id = visit.Id,
                VisitName = visit.VisitName,
                ScheduledDate = visit.ScheduledDate,
                Completed = visit.Completed,
                CompletedDate = visit.CompletedDate,
                Findings = visit.Findings,
                VisualAcuity = visit.VisualAcuity,
                IOP = visit.IOP,
                Complications = visit.Complications
            };
        }

        public async Task UpdateMedicationAdherenceAsync(Guid medicationId, string adherence, Guid userId)
        {
            var tenantId = GetCurrentTenantId();

            var medication = await _context.Set<PostOpMedication>()
                .FirstOrDefaultAsync(m => m.Id == medicationId && m.TenantId == tenantId && m.DeletedAt == null);

            if (medication == null)
                throw new Exception("Medication not found");

            medication.Adherence = adherence;
            medication.UpdatedAt = DateTime.UtcNow;
            medication.UpdatedByUserId = userId;

            await _context.SaveChangesAsync();
        }

        private List<string> GetDefaultInstructions(string surgeryType)
        {
            return new List<string>
            {
                "Use prescribed eye drops as directed",
                "Avoid rubbing the operated eye",
                "Wear eye shield at night for 1 week",
                "Avoid heavy lifting (>10 kg) for 2 weeks",
                "No swimming for 2 weeks"
            };
        }

        private List<string> GetDefaultRestrictions(string surgeryType)
        {
            return new List<string>
            {
                "No water in eye for 1 week",
                "No eye makeup for 2 weeks",
                "No driving until cleared",
                "Avoid dusty environments"
            };
        }

        private List<PostOpVisit> GetDefaultVisitSchedule(Guid scheduleId, DateTime surgeryDate, Guid tenantId, Guid userId)
        {
            return new List<PostOpVisit>
            {
                new PostOpVisit
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    PostOpCareScheduleId = scheduleId,
                    VisitName = "Day 1 Post-Op",
                    ScheduledDate = surgeryDate.AddDays(1),
                    Completed = false,
                    CreatedAt = DateTime.UtcNow,
                    CreatedByUserId = userId
                },
                new PostOpVisit
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    PostOpCareScheduleId = scheduleId,
                    VisitName = "1 Week Post-Op",
                    ScheduledDate = surgeryDate.AddDays(7),
                    Completed = false,
                    CreatedAt = DateTime.UtcNow,
                    CreatedByUserId = userId
                },
                new PostOpVisit
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    PostOpCareScheduleId = scheduleId,
                    VisitName = "1 Month Post-Op",
                    ScheduledDate = surgeryDate.AddMonths(1),
                    Completed = false,
                    CreatedAt = DateTime.UtcNow,
                    CreatedByUserId = userId
                },
                new PostOpVisit
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    PostOpCareScheduleId = scheduleId,
                    VisitName = "3 Months Post-Op",
                    ScheduledDate = surgeryDate.AddMonths(3),
                    Completed = false,
                    CreatedAt = DateTime.UtcNow,
                    CreatedByUserId = userId
                }
            };
        }

        private PostOpCareDto MapToDto(PostOpCareSchedule schedule, List<PostOpVisit> visits, List<PostOpMedication> medications)
        {
            return new PostOpCareDto
            {
                Id = schedule.Id,
                PatientId = schedule.PatientId,
                PatientName = schedule.Patient?.FirstName + " " + schedule.Patient?.LastName ?? "Unknown",
                SurgeryType = schedule.SurgeryType,
                SurgeryDate = schedule.SurgeryDate,
                SurgeryEye = schedule.SurgeryEye,
                SurgeonName = schedule.Surgeon?.FirstName + " " + schedule.Surgeon?.LastName ?? "Unknown",
                CareSchedule = visits.Select(v => new PostOpVisitDto
                {
                    Id = v.Id,
                    VisitName = v.VisitName,
                    ScheduledDate = v.ScheduledDate,
                    Completed = v.Completed,
                    CompletedDate = v.CompletedDate,
                    Findings = v.Findings,
                    VisualAcuity = v.VisualAcuity,
                    IOP = v.IOP,
                    Complications = v.Complications
                }).ToList(),
                Medications = medications.Select(m => new PostOpMedicationDto
                {
                    Id = m.Id,
                    MedicationName = m.MedicationName,
                    Dosage = m.Dosage,
                    Frequency = m.Frequency,
                    StartDate = m.StartDate,
                    EndDate = m.EndDate,
                    Adherence = m.Adherence,
                    LastRefillDate = m.LastRefillDate
                }).ToList(),
                Instructions = !string.IsNullOrEmpty(schedule.Instructions) 
                    ? JsonSerializer.Deserialize<List<string>>(schedule.Instructions) ?? new List<string>()
                    : new List<string>(),
                Restrictions = !string.IsNullOrEmpty(schedule.Restrictions)
                    ? JsonSerializer.Deserialize<List<string>>(schedule.Restrictions) ?? new List<string>()
                    : new List<string>()
            };
        }

        // ── Counselor View ────────────────────────────────────────────────────

        public async Task<List<CounselorPostOpViewDto>> GetCounselorViewAsync(Guid tenantId, Guid? branchId, int days = 30)
        {
            var cutoff = DateTime.UtcNow.AddDays(-days);

            var query = _context.OTSchedules
                .Where(s => s.TenantId == tenantId
                         && s.Status == "Completed"
                         && s.DeletedAt == null
                         && s.ScheduledDate >= cutoff);

            if (branchId.HasValue)
                query = query.Where(s => s.BranchId == branchId.Value);

            var schedules = await query
                .OrderByDescending(s => s.SurgeryCompletedAt ?? s.ScheduledDate)
                .ToListAsync();

            if (!schedules.Any())
                return new List<CounselorPostOpViewDto>();

            // ── Patient lookup ────────────────────────────────────────────────
            var patientIds = schedules
                .Where(s => s.PatientId.HasValue)
                .Select(s => s.PatientId!.Value)
                .Distinct()
                .ToList();

            var patientMap = patientIds.Any()
                ? await _context.Patients
                    .Where(p => patientIds.Contains(p.Id) && p.DeletedAt == null)
                    .ToDictionaryAsync(p => p.Id, p => p)
                : new Dictionary<Guid, Patient>();

            // ── Surgeon lookup ────────────────────────────────────────────────
            var surgeonIds = schedules.Select(s => s.SurgeonId).Distinct().ToList();
            var surgeonMap = surgeonIds.Any()
                ? await _context.Users
                    .Where(u => surgeonIds.Contains(u.Id))
                    .Select(u => new { u.Id, u.FirstName, u.LastName })
                    .ToDictionaryAsync(u => u.Id, u => $"Dr. {u.FirstName} {u.LastName}".Trim())
                : new Dictionary<Guid, string>();

            // ── PostOpCareSchedule lookup (by patient, most recent) ──────────
            var postOpMap = patientIds.Any()
                ? await _context.PostOpCareSchedules
                    .Where(p => patientIds.Contains(p.PatientId) && p.TenantId == tenantId && p.DeletedAt == null)
                    .OrderByDescending(p => p.SurgeryDate)
                    .ToListAsync()
                : new List<PostOpCareSchedule>();

            // Build a patientId → most-recent PostOpCareSchedule map
            var postOpByPatient = postOpMap
                .GroupBy(p => p.PatientId)
                .ToDictionary(g => g.Key, g => g.First());

            // ── PostOpVisit lookup ────────────────────────────────────────────
            var postOpIds = postOpMap.Select(p => p.Id).ToList();
            var visitsBySchedule = postOpIds.Any()
                ? (await _context.PostOpVisits
                    .Where(v => postOpIds.Contains(v.PostOpCareScheduleId) && v.DeletedAt == null)
                    .OrderBy(v => v.ScheduledDate)
                    .ToListAsync())
                    .GroupBy(v => v.PostOpCareScheduleId)
                    .ToDictionary(g => g.Key, g => g.ToList())
                : new Dictionary<Guid, List<PostOpVisit>>();

            // ── PostOpMedication lookup ───────────────────────────────────────
            var medsBySchedule = postOpIds.Any()
                ? (await _context.Set<PostOpMedication>()
                    .Where(m => postOpIds.Contains(m.PostOpCareScheduleId) && m.DeletedAt == null)
                    .ToListAsync())
                    .GroupBy(m => m.PostOpCareScheduleId)
                    .ToDictionary(g => g.Key, g => g.ToList())
                : new Dictionary<Guid, List<PostOpMedication>>();

            // ── Build result ──────────────────────────────────────────────────
            var result = new List<CounselorPostOpViewDto>();

            foreach (var s in schedules)
            {
                patientMap.TryGetValue(s.PatientId ?? Guid.Empty, out var patient);
                surgeonMap.TryGetValue(s.SurgeonId, out var surgeonName);

                PostOpCareSchedule? postOpSched = null;
                if (s.PatientId.HasValue)
                    postOpByPatient.TryGetValue(s.PatientId.Value, out postOpSched);

                var completedAt = s.SurgeryCompletedAt ?? s.ScheduledDate;
                var daysSince = (int)(DateTime.UtcNow - completedAt).TotalDays;

                List<PostOpVisitDto> visits = new();
                List<PostOpMedicationDto> meds = new();
                List<string> instructions = new();
                List<string> restrictions = new();

                if (postOpSched != null)
                {
                    if (visitsBySchedule.TryGetValue(postOpSched.Id, out var rawVisits))
                        visits = rawVisits.Select(v => new PostOpVisitDto
                        {
                            Id = v.Id,
                            VisitName = v.VisitName,
                            ScheduledDate = v.ScheduledDate,
                            Completed = v.Completed,
                            CompletedDate = v.CompletedDate,
                            Findings = v.Findings,
                            VisualAcuity = v.VisualAcuity,
                            IOP = v.IOP,
                            Complications = v.Complications
                        }).ToList();

                    if (medsBySchedule.TryGetValue(postOpSched.Id, out var rawMeds))
                        meds = rawMeds.Select(m => new PostOpMedicationDto
                        {
                            Id = m.Id,
                            MedicationName = m.MedicationName,
                            Dosage = m.Dosage,
                            Frequency = m.Frequency,
                            StartDate = m.StartDate,
                            EndDate = m.EndDate,
                            Adherence = m.Adherence,
                            LastRefillDate = m.LastRefillDate
                        }).ToList();

                    if (!string.IsNullOrEmpty(postOpSched.Instructions))
                        instructions = JsonSerializer.Deserialize<List<string>>(postOpSched.Instructions) ?? new();
                    if (!string.IsNullOrEmpty(postOpSched.Restrictions))
                        restrictions = JsonSerializer.Deserialize<List<string>>(postOpSched.Restrictions) ?? new();
                }

                result.Add(new CounselorPostOpViewDto
                {
                    OtScheduleId = s.Id,
                    ScheduleNumber = s.ScheduleNumber,
                    PatientId = s.PatientId,
                    PatientName = patient != null ? $"{patient.FirstName} {patient.LastName}".Trim() : "Unknown Patient",
                    PatientPhone = patient?.ContactNumber,
                    Mrn = patient?.MedicalRecordNumber,
                    SurgeryType = s.SurgeryType,
                    EyeOperated = s.EyeOperated,
                    SurgeryDate = s.ScheduledDate,
                    SurgeryCompletedAt = s.SurgeryCompletedAt,
                    Outcome = s.Outcome,
                    Complications = s.Complications,
                    SurgeonName = surgeonName ?? "Unknown",
                    DaysSinceSurgery = daysSince,
                    HasPostOpCare = postOpSched != null,
                    PostOpScheduleId = postOpSched?.Id,
                    Visits = visits,
                    Medications = meds,
                    Instructions = instructions,
                    Restrictions = restrictions,
                });
            }

            return result;
        }

        public async Task<string> BuildInstructionsMessageAsync(Guid postOpScheduleId, Guid tenantId)
        {
            var schedule = await _context.PostOpCareSchedules
                .Include(s => s.Patient)
                .Where(s => s.Id == postOpScheduleId && s.TenantId == tenantId && s.DeletedAt == null)
                .FirstOrDefaultAsync();

            if (schedule == null)
                throw new KeyNotFoundException("Post-op care schedule not found.");

            var patientName = schedule.Patient != null
                ? $"{schedule.Patient.FirstName} {schedule.Patient.LastName}".Trim()
                : "Patient";

            var instructionsList = !string.IsNullOrEmpty(schedule.Instructions)
                ? JsonSerializer.Deserialize<List<string>>(schedule.Instructions) ?? new List<string>()
                : new List<string>();

            var restrictionsList = !string.IsNullOrEmpty(schedule.Restrictions)
                ? JsonSerializer.Deserialize<List<string>>(schedule.Restrictions) ?? new List<string>()
                : new List<string>();

            var sb = new System.Text.StringBuilder();
            sb.AppendLine($"Dear {patientName},");
            sb.AppendLine($"Post-surgery instructions for your {schedule.SurgeryType} ({schedule.SurgeryEye}) on {schedule.SurgeryDate:dd MMM yyyy}:");

            if (instructionsList.Any())
            {
                sb.AppendLine("Instructions:");
                for (int i = 0; i < instructionsList.Count; i++)
                    sb.AppendLine($"{i + 1}. {instructionsList[i]}");
            }

            if (restrictionsList.Any())
            {
                sb.AppendLine("Restrictions:");
                for (int i = 0; i < restrictionsList.Count; i++)
                    sb.AppendLine($"{i + 1}. {restrictionsList[i]}");
            }

            sb.AppendLine("If you have any concerns, please contact the hospital immediately.");

            return sb.ToString().Trim();
        }
    }
}
