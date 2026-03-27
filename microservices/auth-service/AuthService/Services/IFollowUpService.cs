using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AuthService.DTOs.FollowUp;

namespace AuthService.Services
{
    public interface IFollowUpService
    {
        Task<List<FollowUpAppointmentDto>> GetFollowUpsAsync(FollowUpFiltersDto filters);
        Task<FollowUpAppointmentDto?> GetFollowUpByIdAsync(Guid id);
        Task<FollowUpAppointmentDto> CreateFollowUpAsync(CreateFollowUpDto dto, Guid userId);
        Task<FollowUpAppointmentDto> UpdateFollowUpAsync(Guid id, UpdateFollowUpDto dto, Guid userId);
        Task<FollowUpAppointmentDto> CompleteFollowUpAsync(Guid id, string outcome, Guid userId);
        Task<FollowUpAppointmentDto> RescheduleFollowUpAsync(Guid id, DateTime newDate, string? newTime, Guid userId);
        Task<bool> DeleteFollowUpAsync(Guid id, Guid userId);
    }
}
