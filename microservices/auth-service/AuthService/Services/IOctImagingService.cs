using AuthService.DTOs;

namespace AuthService.Services
{
    public interface IOctImagingService
    {
        Task<(List<OctImagingScanDto> Scans, int TotalCount)> GetAllAsync(
            int page = 1,
            int pageSize = 10,
            string? search = null,
            string? scanType = null,
            Guid? patientId = null,
            Guid? branchId = null);

        Task<OctImagingScanDto?> GetByIdAsync(Guid id);
        Task<List<OctImagingScanDto>> GetByPatientAsync(Guid patientId);
        Task<OctStatisticsDto> GetStatisticsAsync(Guid? branchId = null);
        Task<OctImagingScanDto> CreateAsync(OctImagingScanDto dto);
        Task<OctImagingScanDto> UpdateAsync(Guid id, OctImagingScanDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<List<OctImagingScanDto>> SearchAsync(string query);
    }
}
