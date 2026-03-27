using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AuthService.Models.Counselor;

namespace AuthService.Services
{
    public interface IAdmissionManagementService
    {
        // Patient Admissions
        Task<AdmissionListResponse> GetAllAdmissionsAsync(int page, int pageSize, Guid? sessionId, string? admissionType);
        Task<PatientAdmissionDto?> GetAdmissionByIdAsync(Guid id);
        Task<PatientAdmissionDto> CreateAdmissionAsync(CreateAdmissionRequest request, Guid tenantId, Guid userId);
        Task<PatientAdmissionDto> UpdateAdmissionAsync(Guid id, UpdateAdmissionRequest request, Guid userId);
        Task<PatientAdmissionDto> AssignBedAsync(Guid id, AssignBedRequest request, Guid userId);
        Task<PatientAdmissionDto> DischargeAdmissionAsync(Guid id, DischargeAdmissionRequest request, Guid userId);
        Task<PatientAdmissionDto> CancelAdmissionAsync(Guid id, string cancellationReason, Guid userId);
        Task<bool> DeleteAdmissionAsync(Guid id);

        // Bed Reservations
        Task<BedReservationDto> CreateBedReservationAsync(CreateBedReservationRequest request, Guid tenantId, Guid userId);
        Task<bool> ReleaseBedReservationAsync(Guid id);
        Task<List<AvailableBed>> GetAvailableBedsAsync(DateTime date, string? bedType);
    }
}
