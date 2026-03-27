using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AuthService.DTOs.FollowUp;

namespace AuthService.Services
{
    public interface IPostOpCareService
    {
        Task<List<PostOpCareDto>> GetActivePostOpPatientsAsync();
        Task<PostOpCareDto?> GetPostOpCareByPatientIdAsync(Guid patientId);
        Task<PostOpCareDto> CreatePostOpCareScheduleAsync(Guid patientId, string surgeryType, DateTime surgeryDate, string surgeryEye, Guid surgeonId, Guid userId);
        Task<PostOpVisitDto> CompleteVisitAsync(Guid visitId, CompleteVisitDto dto, Guid userId);
        Task UpdateMedicationAdherenceAsync(Guid medicationId, string adherence, Guid userId);

        /// <summary>Counselor read-only view: completed surgeries from last N days with linked post-op data.</summary>
        Task<List<CounselorPostOpViewDto>> GetCounselorViewAsync(Guid tenantId, Guid? branchId, int days = 30);

        /// <summary>Build a formatted SMS message from post-op instructions for the given schedule.</summary>
        Task<string> BuildInstructionsMessageAsync(Guid postOpScheduleId, Guid tenantId);
    }
}
