using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AuthService.Models.Counselor;
using AuthService.Models.Domain;

namespace AuthService.Services
{
    /// <summary>
    /// Manages counselor communication logs, callbacks, and overdue tracking.
    /// Exposes: comm-logs CRUD, callback lifecycle, overdue sessions, quick-book OT.
    /// </summary>
    public interface ICounselorCommunicationService
    {
        // ── Communication Logs ────────────────────────────────────────────────
        Task<IEnumerable<CommLogDto>> GetCommLogsAsync(Guid sessionId, Guid tenantId);
        Task<CommLogDto> AddCommLogAsync(Guid sessionId, CreateCommLogRequest request, Guid tenantId, Guid counselorId);

        // ── Callback Requests ────────────────────────────────────────────────
        Task<IEnumerable<CallbackRequestDto>> GetCallbacksAsync(Guid tenantId, Guid? branchId, DateTime? date, string? status);
        Task<CallbackRequestDto> GetCallbacksBySessionAsync(Guid sessionId, Guid tenantId);
        Task<CallbackRequestDto> ScheduleCallbackAsync(Guid sessionId, ScheduleCallbackRequest request, Guid tenantId, Guid createdByUserId);
        Task<CallbackRequestDto> CompleteCallbackAsync(Guid callbackId, CompleteCallbackRequest request, Guid tenantId, Guid completedByUserId);
        Task<CallbackRequestDto> RescheduleCallbackAsync(Guid callbackId, RescheduleCallbackRequest request, Guid tenantId, Guid updatedByUserId);

        // ── Overdue Sessions ─────────────────────────────────────────────────
        Task<IEnumerable<OverdueSessionDto>> GetOverdueSessionsAsync(Guid tenantId, Guid? branchId, int overdueThresholdDays = 7);

        // ── Quick-Book Surgery from Session ──────────────────────────────────
        Task<QuickBookSurgeryResponse> QuickBookFromSessionAsync(Guid sessionId, QuickBookFromSessionRequest request, Guid tenantId, Guid bookedByUserId);
    }
}
