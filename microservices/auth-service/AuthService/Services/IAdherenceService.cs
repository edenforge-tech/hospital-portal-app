using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AuthService.DTOs.FollowUp;

namespace AuthService.Services
{
    public interface IAdherenceService
    {
        Task<TreatmentAdherenceDto?> GetPatientAdherenceAsync(Guid patientId);
        Task<List<HighRiskAdherenceDto>> GetHighRiskPatientsAsync();
        Task<TreatmentAdherenceDto> UpdateAdherenceAsync(Guid adherenceId, Guid userId);
    }
}
