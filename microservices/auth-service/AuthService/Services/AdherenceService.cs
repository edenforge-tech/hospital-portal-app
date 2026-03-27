using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using AuthService.Context;
using AuthService.DTOs.FollowUp;
using AuthService.Models;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services
{
    public class AdherenceService : IAdherenceService
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AdherenceService(AppDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        private Guid GetCurrentTenantId()
        {
            var tenantIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("tenant_id");
            return tenantIdClaim != null ? Guid.Parse(tenantIdClaim.Value) : Guid.Empty;
        }

        public async Task<TreatmentAdherenceDto?> GetPatientAdherenceAsync(Guid patientId)
        {
            var tenantId = GetCurrentTenantId();

            var adherence = await _context.TreatmentAdherences
                .Include(a => a.Patient)
                .Where(a => a.TenantId == tenantId && a.PatientId == patientId && a.DeletedAt == null)
                .OrderByDescending(a => a.StartDate)
                .FirstOrDefaultAsync();

            if (adherence == null)
                return null;

            var medications = await _context.MedicationAdherences
                .Where(m => m.TreatmentAdherenceId == adherence.Id && m.DeletedAt == null)
                .ToListAsync();

            return MapToDto(adherence, medications);
        }

        public async Task<List<HighRiskAdherenceDto>> GetHighRiskPatientsAsync()
        {
            var tenantId = GetCurrentTenantId();

            var highRiskAdherences = await _context.TreatmentAdherences
                .Include(a => a.Patient)
                .Where(a => a.TenantId == tenantId && 
                           a.RiskLevel == "high" && 
                           a.DeletedAt == null &&
                           a.EndDate == null) // Active treatments only
                .ToListAsync();

            return highRiskAdherences.Select(a => new HighRiskAdherenceDto
            {
                PatientId = a.PatientId,
                PatientName = a.Patient?.FirstName + " " + a.Patient?.LastName ?? "Unknown",
                Condition = a.Condition,
                AdherenceRate = a.AdherenceRate,
                RiskLevel = a.RiskLevel,
                Recommendations = !string.IsNullOrEmpty(a.Recommendations)
                    ? JsonSerializer.Deserialize<List<string>>(a.Recommendations) ?? new List<string>()
                    : new List<string>()
            }).ToList();
        }

        public async Task<TreatmentAdherenceDto> UpdateAdherenceAsync(Guid adherenceId, Guid userId)
        {
            var tenantId = GetCurrentTenantId();

            var adherence = await _context.TreatmentAdherences
                .FirstOrDefaultAsync(a => a.Id == adherenceId && a.TenantId == tenantId && a.DeletedAt == null);

            if (adherence == null)
                throw new Exception("Adherence record not found");

            // Recalculate adherence rate
            if (adherence.ScheduledAppointments > 0)
            {
                adherence.AdherenceRate = ((decimal)adherence.CompletedAppointments / adherence.ScheduledAppointments) * 100;
            }

            // Update risk level based on adherence rate
            adherence.RiskLevel = adherence.AdherenceRate >= 90 ? "low" :
                                 adherence.AdherenceRate >= 70 ? "medium" : "high";

            // Generate recommendations
            var recommendations = GenerateRecommendations(adherence);
            adherence.Recommendations = JsonSerializer.Serialize(recommendations);
            adherence.LastReviewDate = DateTime.UtcNow;
            adherence.UpdatedAt = DateTime.UtcNow;
            adherence.UpdatedByUserId = userId;

            await _context.SaveChangesAsync();

            var medications = await _context.MedicationAdherences
                .Where(m => m.TreatmentAdherenceId == adherence.Id && m.DeletedAt == null)
                .ToListAsync();

            return MapToDto(adherence, medications);
        }

        private List<string> GenerateRecommendations(TreatmentAdherence adherence)
        {
            var recommendations = new List<string>();

            if (adherence.AdherenceRate < 70)
            {
                recommendations.Add("High priority: Schedule missed appointments immediately");
                recommendations.Add("Consider simplifying medication regimen");
                recommendations.Add("Discuss transportation assistance if needed");
            }
            else if (adherence.AdherenceRate < 90)
            {
                recommendations.Add("Review drop instillation technique");
                recommendations.Add("Set daily medication reminders");
                recommendations.Add("Schedule follow-up within 2 weeks");
            }
            else
            {
                recommendations.Add("Continue current treatment plan");
                recommendations.Add("Routine follow-up as scheduled");
            }

            // Condition-specific recommendations
            if (adherence.Condition.Contains("Glaucoma") || adherence.Condition.Contains("POAG"))
            {
                if (adherence.AdherenceRate < 80)
                    recommendations.Add("Risk of vision loss if treatment delayed - urgent intervention needed");
            }

            if (adherence.Condition.Contains("DME") || adherence.Condition.Contains("Diabetic Macular Edema"))
            {
                if (adherence.MissedAppointments > 1)
                    recommendations.Add("Risk of irreversible vision loss - contact patient immediately");
            }

            return recommendations;
        }

        private TreatmentAdherenceDto MapToDto(TreatmentAdherence adherence, List<MedicationAdherence> medications)
        {
            return new TreatmentAdherenceDto
            {
                Id = adherence.Id,
                PatientId = adherence.PatientId,
                PatientName = adherence.Patient?.FirstName + " " + adherence.Patient?.LastName ?? "Unknown",
                Condition = adherence.Condition,
                TreatmentPlan = adherence.TreatmentPlan,
                StartDate = adherence.StartDate,
                Medications = medications.Select(m => new MedicationAdherenceDto
                {
                    Id = m.Id,
                    MedicationName = m.MedicationName,
                    PrescribedDosage = m.PrescribedDosage,
                    AdherencePercentage = m.AdherencePercentage,
                    MissedDoses = m.MissedDoses,
                    LastTakenDate = m.LastTakenDate
                }).ToList(),
                Appointments = new AppointmentAdherenceDto
                {
                    Scheduled = adherence.ScheduledAppointments,
                    Completed = adherence.CompletedAppointments,
                    Missed = adherence.MissedAppointments,
                    AdherenceRate = adherence.AdherenceRate
                },
                Recommendations = !string.IsNullOrEmpty(adherence.Recommendations)
                    ? JsonSerializer.Deserialize<List<string>>(adherence.Recommendations) ?? new List<string>()
                    : new List<string>(),
                RiskLevel = adherence.RiskLevel
            };
        }
    }
}
