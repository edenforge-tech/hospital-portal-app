using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AuthService.DTOs.FollowUp;

namespace AuthService.Services
{
    public interface IReminderService
    {
        Task<List<PatientReminderDto>> GetRemindersAsync(ReminderFiltersDto filters);
        Task<PatientReminderDto> CreateReminderAsync(CreateReminderDto dto, Guid userId);
        Task<PatientReminderDto> SendReminderAsync(Guid reminderId, List<string> channels, Guid userId);
        Task<PatientReminderDto> AcknowledgeReminderAsync(Guid reminderId);
        Task<int> ProcessScheduledRemindersAsync(); // Background job
    }
}
