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
    public class ReminderService : IReminderService
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ReminderService(AppDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        private Guid GetCurrentTenantId()
        {
            var tenantIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("tenant_id");
            return tenantIdClaim != null ? Guid.Parse(tenantIdClaim.Value) : Guid.Empty;
        }

        public async Task<List<PatientReminderDto>> GetRemindersAsync(ReminderFiltersDto filters)
        {
            var tenantId = GetCurrentTenantId();

            var query = _context.PatientReminders
                .Include(r => r.Patient)
                .Where(r => r.TenantId == tenantId && r.DeletedAt == null);

            if (!string.IsNullOrEmpty(filters.Status))
                query = query.Where(r => r.Status == filters.Status);

            if (!string.IsNullOrEmpty(filters.ReminderType))
                query = query.Where(r => r.ReminderType == filters.ReminderType);

            if (filters.FromDate.HasValue)
                query = query.Where(r => r.ScheduledDate >= filters.FromDate.Value);

            if (filters.ToDate.HasValue)
                query = query.Where(r => r.ScheduledDate <= filters.ToDate.Value);

            var reminders = await query.OrderBy(r => r.ScheduledDate).ToListAsync();

            return reminders.Select(MapToDto).ToList();
        }

        public async Task<PatientReminderDto> CreateReminderAsync(CreateReminderDto dto, Guid userId)
        {
            var tenantId = GetCurrentTenantId();

            var reminder = new PatientReminder
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                PatientId = dto.PatientId,
                ReminderType = dto.ReminderType,
                Message = dto.Message,
                ScheduledDate = dto.ScheduledDate,
                Channels = JsonSerializer.Serialize(dto.Channels),
                Status = "pending",
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = userId
            };

            _context.PatientReminders.Add(reminder);
            await _context.SaveChangesAsync();

            return MapToDto(reminder);
        }

        public async Task<PatientReminderDto> SendReminderAsync(Guid reminderId, List<string> channels, Guid userId)
        {
            var tenantId = GetCurrentTenantId();

            var reminder = await _context.PatientReminders
                .Include(r => r.Patient)
                .FirstOrDefaultAsync(r => r.Id == reminderId && r.TenantId == tenantId && r.DeletedAt == null);

            if (reminder == null)
                throw new Exception("Reminder not found");

            // TODO: Integrate with actual SMS/Email/Phone services (Twilio, SendGrid, etc.)
            // For now, simulate sending
            var sendSuccess = SimulateSendReminder(channels);

            if (sendSuccess)
            {
                reminder.Status = "sent";
                reminder.SentDate = DateTime.UtcNow;
                reminder.Channels = JsonSerializer.Serialize(channels);
            }
            else
            {
                reminder.Status = "failed";
                reminder.FailureReason = "Simulated failure - SMS service not integrated";
                reminder.RetryCount++;
            }

            reminder.UpdatedAt = DateTime.UtcNow;
            reminder.UpdatedByUserId = userId;

            await _context.SaveChangesAsync();

            return MapToDto(reminder);
        }

        public async Task<PatientReminderDto> AcknowledgeReminderAsync(Guid reminderId)
        {
            var tenantId = GetCurrentTenantId();

            var reminder = await _context.PatientReminders
                .Include(r => r.Patient)
                .FirstOrDefaultAsync(r => r.Id == reminderId && r.TenantId == tenantId && r.DeletedAt == null);

            if (reminder == null)
                throw new Exception("Reminder not found");

            reminder.Acknowledged = true;
            reminder.AcknowledgedDate = DateTime.UtcNow;
            reminder.Status = "acknowledged";
            reminder.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToDto(reminder);
        }

        public async Task<int> ProcessScheduledRemindersAsync()
        {
            var tenantId = GetCurrentTenantId();
            var now = DateTime.UtcNow;

            var pendingReminders = await _context.PatientReminders
                .Where(r => r.TenantId == tenantId &&
                           r.Status == "pending" &&
                           r.ScheduledDate <= now &&
                           r.DeletedAt == null)
                .ToListAsync();

            int processed = 0;

            foreach (var reminder in pendingReminders)
            {
                var channels = !string.IsNullOrEmpty(reminder.Channels)
                    ? JsonSerializer.Deserialize<List<string>>(reminder.Channels) ?? new List<string>()
                    : new List<string>();

                var sendSuccess = SimulateSendReminder(channels);

                if (sendSuccess)
                {
                    reminder.Status = "sent";
                    reminder.SentDate = DateTime.UtcNow;
                    processed++;
                }
                else
                {
                    reminder.Status = "failed";
                    reminder.FailureReason = "Automated send failed";
                    reminder.RetryCount++;
                }

                reminder.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return processed;
        }

        private bool SimulateSendReminder(List<string> channels)
        {
            // TODO: Replace with actual SMS/Email/Phone integration
            // For demo purposes, always return true
            return true;
        }

        private PatientReminderDto MapToDto(PatientReminder reminder)
        {
            return new PatientReminderDto
            {
                Id = reminder.Id,
                PatientId = reminder.PatientId,
                PatientName = reminder.Patient?.FirstName + " " + reminder.Patient?.LastName ?? "Unknown",
                ReminderType = reminder.ReminderType,
                Message = reminder.Message,
                ScheduledDate = reminder.ScheduledDate,
                Channels = !string.IsNullOrEmpty(reminder.Channels)
                    ? JsonSerializer.Deserialize<List<string>>(reminder.Channels) ?? new List<string>()
                    : new List<string>(),
                Status = reminder.Status,
                SentDate = reminder.SentDate,
                Acknowledged = reminder.Acknowledged,
                AcknowledgedDate = reminder.AcknowledgedDate,
                FailureReason = reminder.FailureReason
            };
        }
    }
}
