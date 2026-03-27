using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AuthService.Models.Counselor;

namespace AuthService.Services
{
    public interface IOTBookingSystemService
    {
        // Theater Management
        Task<List<OTTheaterDto>> GetAllTheatersAsync(Guid tenantId, Guid? branchId = null, string? specialization = null);
        Task<OTTheaterDto?> GetTheaterByIdAsync(Guid theaterId, Guid tenantId);
        Task<OTTheaterDto?> GetTheaterByCodeAsync(string theaterCode, Guid tenantId);
        Task<OTTheaterDto> CreateTheaterAsync(CreateTheaterRequest request, Guid tenantId, Guid createdByUserId);
        Task<OTTheaterDto> UpdateTheaterAsync(Guid theaterId, UpdateTheaterRequest request, Guid tenantId, Guid updatedByUserId);
        Task DeleteTheaterAsync(Guid theaterId, Guid tenantId, Guid deletedByUserId);

        // Schedule Management
        Task<ScheduleListResponse> GetSchedulesAsync(ScheduleFilters filters, Guid tenantId, int pageNumber = 1, int pageSize = 50);
        Task<OTScheduleDto?> GetScheduleByIdAsync(Guid scheduleId, Guid tenantId);
        Task<OTScheduleDto?> GetScheduleByNumberAsync(string scheduleNumber, Guid tenantId);
        Task<List<OTScheduleDto>> GetSchedulesByDateAsync(Guid theaterId, DateTime date, Guid tenantId);
        Task<List<OTScheduleDto>> GetSurgeonScheduleAsync(Guid surgeonId, DateTime startDate, DateTime endDate, Guid tenantId);
        Task<BookingResultDto> CreateScheduleAsync(CreateScheduleRequest request, Guid tenantId, Guid createdByUserId);
        Task<OTScheduleDto> UpdateScheduleAsync(Guid scheduleId, UpdateScheduleRequest request, Guid tenantId, Guid updatedByUserId);
        Task<BookingResultDto> ConfirmBookingAsync(Guid scheduleId, ConfirmBookingRequest request, Guid tenantId, Guid confirmedByUserId);
        Task<BookingResultDto> StartSurgeryAsync(Guid scheduleId, Guid tenantId, Guid startedByUserId);
        Task<BookingResultDto> CompleteSurgeryAsync(Guid scheduleId, CompleteSurgeryRequest request, Guid tenantId, Guid completedByUserId);
        Task<BookingResultDto> CancelScheduleAsync(Guid scheduleId, CancelScheduleRequest request, Guid tenantId, Guid cancelledByUserId);
        Task<BookingResultDto> RescheduleBookingAsync(Guid scheduleId, RescheduleRequest request, Guid tenantId, Guid updatedByUserId);
        Task<UpdateChecklistResponse> UpdateChecklistAsync(Guid scheduleId, UpdateChecklistRequest request, Guid tenantId, Guid updatedByUserId);
        Task<BookingResultDto> RecordNoShowAsync(Guid scheduleId, NoShowRequest request, Guid tenantId, Guid recordedByUserId);

        // Stock / IOL Availability
        Task<StockAvailabilityDto> GetStockAvailabilityAsync(Guid scheduleId, Guid tenantId);
        Task<StockAvailabilityDto> ConfirmStockAsync(Guid scheduleId, ConfirmStockRequest request, Guid tenantId, Guid confirmedByUserId);

        // Availability Checking
        Task<AvailabilityCheckDto> CheckTheaterAvailabilityAsync(Guid theaterId, DateTime date, TimeSpan startTime, TimeSpan endTime, Guid tenantId, Guid? excludeScheduleId = null);
        Task<AvailabilityCheckDto> CheckSurgeonAvailabilityAsync(Guid surgeonId, DateTime date, TimeSpan startTime, TimeSpan endTime, Guid tenantId);
        Task<List<TimeSlotDto>> GetAvailableSlotsAsync(Guid theaterId, DateTime date, Guid tenantId);

        // Validation
        Task<BookingValidationDto> ValidateBookingAsync(ValidateBookingRequest request, Guid tenantId, Guid validatedByUserId);
        Task<BookingValidationDto?> GetValidationStatusAsync(Guid scheduleId, Guid tenantId);

        // Equipment Management
        Task<List<EquipmentAvailabilityDto>> GetTheaterEquipmentAsync(Guid theaterId, Guid tenantId);
        Task<EquipmentAvailabilityDto> UpdateEquipmentStatusAsync(Guid equipmentId, UpdateEquipmentStatusRequest request, Guid tenantId, Guid updatedByUserId);

        // Collision Management
        Task<CollisionLogDto> LogCollisionAsync(Guid theaterId, DateTime collisionDate, TimeSpan collisionTime, string collisionType, string? attemptedScheduleData, Guid? existingScheduleId, Guid tenantId, Guid detectedByUserId);
        Task<List<CollisionLogDto>> GetCollisionsAsync(Guid? theaterId, DateTime? startDate, DateTime? endDate, bool? resolved, Guid tenantId);
        Task<CollisionLogDto> ResolveCollisionAsync(Guid collisionId, ResolveCollisionRequest request, Guid tenantId);
    }
}
