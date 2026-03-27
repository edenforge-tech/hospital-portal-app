using AuthService.DTOs;

namespace AuthService.Services
{
    public interface IElectrophysiologyService
    {
        Task<(List<ElectrophysiologyTestDto> Tests, int TotalCount)> GetAllAsync(
            int page = 1,
            int pageSize = 10,
            string? search = null,
            string? testType = null,
            Guid? patientId = null,
            Guid? branchId = null);

        Task<ElectrophysiologyTestDto?> GetByIdAsync(Guid id);
        Task<List<ElectrophysiologyTestDto>> GetByPatientAsync(Guid patientId);
        Task<ElectrophysiologyStatisticsDto> GetStatisticsAsync(Guid? branchId = null);
        Task<ElectrophysiologyTestDto> CreateAsync(ElectrophysiologyTestDto dto);
        Task<ElectrophysiologyTestDto> UpdateAsync(Guid id, ElectrophysiologyTestDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<List<ElectrophysiologyTestDto>> SearchAsync(string query);
    }
}
