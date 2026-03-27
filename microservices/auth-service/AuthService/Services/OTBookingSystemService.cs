using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using AuthService.Context;
using AuthService.Data;
using AuthService.Models.Counselor;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AuthService.Services
{
    public class OTBookingSystemService : IOTBookingSystemService
    {
        private readonly AppDbContext _context;
        private readonly IDeptCoordinationService _deptCoordination;
        private readonly INotificationService _notificationService;
        private readonly ILogger<OTBookingSystemService> _logger;

        public OTBookingSystemService(
            AppDbContext context,
            IDeptCoordinationService deptCoordination,
            INotificationService notificationService,
            ILogger<OTBookingSystemService> logger)
        {
            _context = context;
            _deptCoordination = deptCoordination;
            _notificationService = notificationService;
            _logger = logger;
        }

        // Theater Management
        public async Task<List<OTTheaterDto>> GetAllTheatersAsync(Guid tenantId, Guid? branchId = null, string? specialization = null)
        {
            var query = _context.OTTheaters
                .Where(t => t.TenantId == tenantId && t.DeletedAt == null);

            if (branchId.HasValue)
                query = query.Where(t => t.BranchId == branchId.Value);

            if (!string.IsNullOrEmpty(specialization))
                query = query.Where(t => t.Specialization == specialization);

            var theaters = await query.OrderBy(t => t.TheaterName).ToListAsync();
            return theaters.Select(ToTheaterDto).ToList();
        }

        public async Task<OTTheaterDto?> GetTheaterByIdAsync(Guid theaterId, Guid tenantId)
        {
            var theater = await _context.OTTheaters
                .FirstOrDefaultAsync(t => t.Id == theaterId && t.TenantId == tenantId && t.DeletedAt == null);
            return theater != null ? ToTheaterDto(theater) : null;
        }

        public async Task<OTTheaterDto?> GetTheaterByCodeAsync(string theaterCode, Guid tenantId)
        {
            var theater = await _context.OTTheaters
                .FirstOrDefaultAsync(t => t.TheaterCode == theaterCode && t.TenantId == tenantId && t.DeletedAt == null);
            return theater != null ? ToTheaterDto(theater) : null;
        }

        public async Task<OTTheaterDto> CreateTheaterAsync(CreateTheaterRequest request, Guid tenantId, Guid createdByUserId)
        {
            if (!string.IsNullOrEmpty(request.EquipmentList))
            {
                try { JsonDocument.Parse(request.EquipmentList); }
                catch { throw new ArgumentException("Invalid JSON for equipment list"); }
            }

            var theater = new OTTheater
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                BranchId = request.BranchId,
                TheaterName = request.TheaterName,
                TheaterCode = request.TheaterCode,
                FloorNumber = request.FloorNumber,
                LocationDescription = request.LocationDescription,
                Specialization = request.Specialization,
                SurgeryTypesSupported = request.SurgeryTypesSupported,
                EquipmentList = request.EquipmentList,
                MaxSurgeriesPerDay = request.MaxSurgeriesPerDay,
                StandardSurgeryDurationMinutes = request.StandardSurgeryDurationMinutes,
                CleaningTimeBetweenSurgeriesMinutes = request.CleaningTimeBetweenSurgeriesMinutes,
                OperationStartTime = request.OperationStartTime ?? new TimeSpan(8, 0, 0),
                OperationEndTime = request.OperationEndTime ?? new TimeSpan(18, 0, 0),
                OperatingDays = request.OperatingDays,
                IsActive = true,
                IsOperational = true,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = createdByUserId
            };

            _context.OTTheaters.Add(theater);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Created OT theater {TheaterId} - {TheaterName}", theater.Id, theater.TheaterName);
            return ToTheaterDto(theater);
        }

        public async Task<OTTheaterDto> UpdateTheaterAsync(Guid theaterId, UpdateTheaterRequest request, Guid tenantId, Guid updatedByUserId)
        {
            var theater = await _context.OTTheaters
                .FirstOrDefaultAsync(t => t.Id == theaterId && t.TenantId == tenantId && t.DeletedAt == null)
                ?? throw new KeyNotFoundException("Theater not found");

            if (!string.IsNullOrEmpty(request.EquipmentList))
            {
                try { JsonDocument.Parse(request.EquipmentList); }
                catch { throw new ArgumentException("Invalid JSON for equipment list"); }
            }

            if (request.TheaterName != null) theater.TheaterName = request.TheaterName;
            if (request.FloorNumber.HasValue) theater.FloorNumber = request.FloorNumber;
            if (request.LocationDescription != null) theater.LocationDescription = request.LocationDescription;
            if (request.Specialization != null) theater.Specialization = request.Specialization;
            if (request.SurgeryTypesSupported != null) theater.SurgeryTypesSupported = request.SurgeryTypesSupported;
            if (request.EquipmentList != null) theater.EquipmentList = request.EquipmentList;
            if (request.MaxSurgeriesPerDay.HasValue) theater.MaxSurgeriesPerDay = request.MaxSurgeriesPerDay.Value;
            if (request.StandardSurgeryDurationMinutes.HasValue) theater.StandardSurgeryDurationMinutes = request.StandardSurgeryDurationMinutes.Value;
            if (request.CleaningTimeBetweenSurgeriesMinutes.HasValue) theater.CleaningTimeBetweenSurgeriesMinutes = request.CleaningTimeBetweenSurgeriesMinutes.Value;
            if (request.OperationStartTime.HasValue) theater.OperationStartTime = request.OperationStartTime.Value;
            if (request.OperationEndTime.HasValue) theater.OperationEndTime = request.OperationEndTime.Value;
            if (request.OperatingDays != null) theater.OperatingDays = request.OperatingDays;
            if (request.IsActive.HasValue) theater.IsActive = request.IsActive.Value;
            if (request.IsOperational.HasValue) theater.IsOperational = request.IsOperational.Value;
            if (request.MaintenanceMode.HasValue) theater.MaintenanceMode = request.MaintenanceMode.Value;
            if (request.MaintenanceReason != null) theater.MaintenanceReason = request.MaintenanceReason;

            theater.UpdatedAt = DateTime.UtcNow;
            theater.UpdatedByUserId = updatedByUserId;

            await _context.SaveChangesAsync();
            _logger.LogInformation("Updated OT theater {TheaterId}", theaterId);
            return ToTheaterDto(theater);
        }

        public async Task DeleteTheaterAsync(Guid theaterId, Guid tenantId, Guid deletedByUserId)
        {
            var theater = await _context.OTTheaters
                .FirstOrDefaultAsync(t => t.Id == theaterId && t.TenantId == tenantId && t.DeletedAt == null)
                ?? throw new KeyNotFoundException("Theater not found");

            theater.DeletedAt = DateTime.UtcNow;
            theater.UpdatedByUserId = deletedByUserId;
            await _context.SaveChangesAsync();
            _logger.LogInformation("Deleted OT theater {TheaterId}", theaterId);
        }

        // Schedule Management
        public async Task<ScheduleListResponse> GetSchedulesAsync(ScheduleFilters filters, Guid tenantId, int pageNumber = 1, int pageSize = 50)
        {
            var query = _context.OTSchedules
                .Include(s => s.Theater)
                .Where(s => s.TenantId == tenantId && s.DeletedAt == null);

            if (filters.TheaterId.HasValue)
                query = query.Where(s => s.TheaterId == filters.TheaterId.Value);

            if (filters.BranchId.HasValue)
                query = query.Where(s => s.BranchId == filters.BranchId.Value);

            if (filters.SurgeonId.HasValue)
                query = query.Where(s => s.SurgeonId == filters.SurgeonId.Value);

            if (filters.StartDate.HasValue)
                query = query.Where(s => s.ScheduledDate >= filters.StartDate.Value);

            if (filters.EndDate.HasValue)
                query = query.Where(s => s.ScheduledDate <= filters.EndDate.Value);

            if (!string.IsNullOrEmpty(filters.Statuses))
            {
                var statusList = filters.Statuses.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                query = query.Where(s => statusList.Contains(s.Status));
            }
            else if (!string.IsNullOrEmpty(filters.Status))
                query = query.Where(s => s.Status == filters.Status);

            if (!string.IsNullOrEmpty(filters.SurgeryType))
                query = query.Where(s => s.SurgeryType == filters.SurgeryType);

            var totalCount = await query.CountAsync();
            var schedules = await query
                .OrderBy(s => s.ScheduledDate)
                .ThenBy(s => s.StartTime)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Enrich with patient data
            var patientIds = schedules
                .Where(s => s.PatientId.HasValue)
                .Select(s => s.PatientId!.Value)
                .Distinct()
                .ToList();

            var patientMap = patientIds.Any()
                ? await _context.Patients
                    .Where(p => patientIds.Contains(p.Id) && p.DeletedAt == null)
                    .ToDictionaryAsync(p => p.Id, p => p)
                : new Dictionary<Guid, Patient>();

            // Enrich with surgeon names
            var surgeonIds = schedules.Select(s => s.SurgeonId).Distinct().ToList();
            var surgeonMap = surgeonIds.Any()
                ? await _context.Users
                    .Where(u => surgeonIds.Contains(u.Id))
                    .Select(u => new { u.Id, u.FirstName, u.LastName })
                    .ToDictionaryAsync(u => u.Id, u => $"{u.FirstName} {u.LastName}".Trim())
                : new Dictionary<Guid, string>();

            // Enrich with counseling session data (PatientType, PackageAmount, RecommendedProcedures)
            var sessionIds = schedules
                .Where(s => s.SessionId.HasValue)
                .Select(s => s.SessionId!.Value)
                .Distinct()
                .ToList();
            var sessionMap = sessionIds.Any()
                ? await _context.CounselingSession
                    .Where(cs => sessionIds.Contains(cs.Id) && cs.DeletedAt == null)
                    .Select(cs => new { cs.Id, cs.PatientType, cs.PackageAmount, cs.RecommendedProcedures })
                    .ToDictionaryAsync(
                        cs => cs.Id,
                        cs => (PatientType: cs.PatientType, PackageAmount: cs.PackageAmount, RecommendedProcedures: cs.RecommendedProcedures))
                : null;

            return new ScheduleListResponse
            {
                Schedules = schedules.Select(s => {
                    (string PatientType, decimal? PackageAmount, string? RecommendedProcedures)? sessionData = null;
                    if (sessionMap != null && s.SessionId.HasValue && sessionMap.TryGetValue(s.SessionId.Value, out var sd))
                        sessionData = sd;
                    return ToScheduleDto(s, patientMap, surgeonMap, sessionData);
                }).ToList(),
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<OTScheduleDto?> GetScheduleByIdAsync(Guid scheduleId, Guid tenantId)
        {
            var schedule = await _context.OTSchedules
                .Include(s => s.Theater)
                .FirstOrDefaultAsync(s => s.Id == scheduleId && s.TenantId == tenantId && s.DeletedAt == null);
            return schedule != null ? ToScheduleDto(schedule) : null;
        }

        public async Task<OTScheduleDto?> GetScheduleByNumberAsync(string scheduleNumber, Guid tenantId)
        {
            var schedule = await _context.OTSchedules
                .Include(s => s.Theater)
                .FirstOrDefaultAsync(s => s.ScheduleNumber == scheduleNumber && s.TenantId == tenantId && s.DeletedAt == null);
            return schedule != null ? ToScheduleDto(schedule) : null;
        }

        public async Task<List<OTScheduleDto>> GetSchedulesByDateAsync(Guid theaterId, DateTime date, Guid tenantId)
        {
            var schedules = await _context.OTSchedules
                .Include(s => s.Theater)
                .Where(s => s.TheaterId == theaterId && s.ScheduledDate.Date == date.Date
                    && s.TenantId == tenantId && s.DeletedAt == null)
                .OrderBy(s => s.StartTime)
                .ToListAsync();
            return schedules.Select(s => ToScheduleDto(s)).ToList();
        }

        public async Task<List<OTScheduleDto>> GetSurgeonScheduleAsync(Guid surgeonId, DateTime startDate, DateTime endDate, Guid tenantId)
        {
            var schedules = await _context.OTSchedules
                .Include(s => s.Theater)
                .Where(s => s.SurgeonId == surgeonId
                    && s.ScheduledDate >= startDate && s.ScheduledDate <= endDate
                    && s.TenantId == tenantId && s.DeletedAt == null)
                .OrderBy(s => s.ScheduledDate)
                .ThenBy(s => s.StartTime)
                .ToListAsync();
            return schedules.Select(s => ToScheduleDto(s)).ToList();
        }

        public async Task<BookingResultDto> CreateScheduleAsync(CreateScheduleRequest request, Guid tenantId, Guid createdByUserId)
        {
            var result = new BookingResultDto { Success = true };

            // Validate theater exists
            var theater = await _context.OTTheaters.FirstOrDefaultAsync(t => t.Id == request.TheaterId && t.TenantId == tenantId && t.DeletedAt == null);
            if (theater == null)
            {
                result.Success = false;
                result.Errors.Add("Theater not found");
                return result;
            }

            // Check theater availability
            var availabilityCheck = await CheckTheaterAvailabilityAsync(request.TheaterId, request.ScheduledDate, request.StartTime, request.EndTime, tenantId);
            if (!availabilityCheck.IsAvailable)
            {
                result.Success = false;
                result.Errors.AddRange(availabilityCheck.ConflictReasons);
                return result;
            }

            // Check surgeon availability
            var surgeonCheck = await CheckSurgeonAvailabilityAsync(request.SurgeonId, request.ScheduledDate, request.StartTime, request.EndTime, tenantId);
            if (!surgeonCheck.IsAvailable)
            {
                result.Warnings.AddRange(surgeonCheck.ConflictReasons);
            }

            // Validate equipment JSON
            if (!string.IsNullOrEmpty(request.EquipmentReserved))
            {
                try { JsonDocument.Parse(request.EquipmentReserved); }
                catch { throw new ArgumentException("Invalid JSON for equipment reserved"); }
            }

            var schedule = new OTSchedule
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                BranchId = theater.BranchId,
                TheaterId = request.TheaterId,
                SessionId = request.SessionId,
                BookingId = request.BookingId,
                PatientId = request.PatientId,
                ScheduledDate = request.ScheduledDate,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                DurationMinutes = (int)(request.EndTime - request.StartTime).TotalMinutes,
                SurgeryType = request.SurgeryType,
                ProcedureDescription = request.ProcedureDescription,
                EyeOperated = request.EyeOperated,
                SurgeonId = request.SurgeonId,
                AnesthesiologistId = request.AnesthesiologistId,
                OTTechnicianId = request.OTTechnicianId,
                NursingStaffIds = request.NursingStaffIds,
                EquipmentReserved = request.EquipmentReserved,
                IOLReservedId = request.IOLReservedId,
                Status = "Booked",
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = createdByUserId
            };

            _context.OTSchedules.Add(schedule);
            await _context.SaveChangesAsync();

            result.ScheduleId = schedule.Id;
            result.ScheduleNumber = schedule.ScheduleNumber;
            result.Message = "OT schedule created successfully";
            _logger.LogInformation("Created OT schedule {ScheduleId} - {ScheduleNumber}", schedule.Id, schedule.ScheduleNumber);

            return result;
        }

        public async Task<OTScheduleDto> UpdateScheduleAsync(Guid scheduleId, UpdateScheduleRequest request, Guid tenantId, Guid updatedByUserId)
        {
            var schedule = await _context.OTSchedules
                .FirstOrDefaultAsync(s => s.Id == scheduleId && s.TenantId == tenantId && s.DeletedAt == null)
                ?? throw new KeyNotFoundException("Schedule not found");

            if (schedule.Status != "Booked")
                throw new InvalidOperationException("Only booked schedules can be updated");

            if (!string.IsNullOrEmpty(request.EquipmentReserved))
            {
                try { JsonDocument.Parse(request.EquipmentReserved); }
                catch { throw new ArgumentException("Invalid JSON for equipment reserved"); }
            }

            if (request.ScheduledDate.HasValue) schedule.ScheduledDate = request.ScheduledDate.Value;
            if (request.StartTime.HasValue) schedule.StartTime = request.StartTime.Value;
            if (request.EndTime.HasValue) schedule.EndTime = request.EndTime.Value;
            if (request.StartTime.HasValue && request.EndTime.HasValue)
                schedule.DurationMinutes = (int)(request.EndTime.Value - request.StartTime.Value).TotalMinutes;
            if (request.SurgeryType != null) schedule.SurgeryType = request.SurgeryType;
            if (request.ProcedureDescription != null) schedule.ProcedureDescription = request.ProcedureDescription;
            if (request.EyeOperated != null) schedule.EyeOperated = request.EyeOperated;
            if (request.SurgeonId.HasValue) schedule.SurgeonId = request.SurgeonId.Value;
            if (request.AnesthesiologistId.HasValue) schedule.AnesthesiologistId = request.AnesthesiologistId;
            if (request.OTTechnicianId.HasValue) schedule.OTTechnicianId = request.OTTechnicianId;
            if (request.NursingStaffIds != null) schedule.NursingStaffIds = request.NursingStaffIds;
            if (request.EquipmentReserved != null) schedule.EquipmentReserved = request.EquipmentReserved;
            if (request.IOLReservedId.HasValue) schedule.IOLReservedId = request.IOLReservedId;

            schedule.UpdatedAt = DateTime.UtcNow;
            schedule.UpdatedByUserId = updatedByUserId;

            await _context.SaveChangesAsync();
            _logger.LogInformation("Updated OT schedule {ScheduleId}", scheduleId);
            return ToScheduleDto(schedule);
        }

        public async Task<BookingResultDto> ConfirmBookingAsync(Guid scheduleId, ConfirmBookingRequest request, Guid tenantId, Guid confirmedByUserId)
        {
            var schedule = await _context.OTSchedules
                .FirstOrDefaultAsync(s => s.Id == scheduleId && s.TenantId == tenantId && s.DeletedAt == null)
                ?? throw new KeyNotFoundException("Schedule not found");

            if (schedule.Status != "Booked")
                throw new InvalidOperationException("Only booked schedules can be confirmed");

            schedule.Status = "Confirmed";
            schedule.BookingConfirmedByUserId = confirmedByUserId;
            schedule.ConfirmationTimestamp = DateTime.UtcNow;
            schedule.UpdatedAt = DateTime.UtcNow;
            schedule.UpdatedByUserId = confirmedByUserId;

            await _context.SaveChangesAsync();
            _logger.LogInformation("Confirmed OT schedule {ScheduleId}", scheduleId);

            // Auto-create dept coordination requests for all 9 departments (idempotent)
            var patientId = schedule.PatientId ?? Guid.Empty;
            if (patientId != Guid.Empty)
            {
                try
                {
                    await _deptCoordination.AutoCreateForScheduleAsync(
                        scheduleId, patientId, schedule.SessionId,
                        tenantId, schedule.BranchId, confirmedByUserId);
                }
                catch (Exception ex)
                {
                    // Non-fatal — log and continue; counselor can manually send later
                    _logger.LogWarning(ex, "Failed to auto-create dept requests for schedule {ScheduleId}", scheduleId);
                }

                // Notify counselors in the branch that a booking was confirmed
                try
                {
                    _ = _notificationService.NotifyRoleAsync(
                        tenantId,
                        "counselor",
                        "SurgeryConfirmed",
                        $"OT booking confirmed — pre-admission workflow started",
                        $"{{\"scheduleId\":\"{scheduleId}\",\"patientId\":\"{patientId}\"}}");
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to send confirmation notification for schedule {ScheduleId}", scheduleId);
                }
            }

            return new BookingResultDto
            {
                Success = true,
                ScheduleId = scheduleId,
                ScheduleNumber = schedule.ScheduleNumber,
                Message = "Booking confirmed successfully"
            };
        }

        public async Task<BookingResultDto> StartSurgeryAsync(Guid scheduleId, Guid tenantId, Guid startedByUserId)
        {
            var schedule = await _context.OTSchedules
                .FirstOrDefaultAsync(s => s.Id == scheduleId && s.TenantId == tenantId && s.DeletedAt == null)
                ?? throw new KeyNotFoundException("Schedule not found");

            if (schedule.Status != "Confirmed")
                throw new InvalidOperationException("Only confirmed schedules can be started");

            schedule.Status = "InProgress";
            schedule.SurgeryStartedAt = DateTime.UtcNow;
            schedule.UpdatedAt = DateTime.UtcNow;
            schedule.UpdatedByUserId = startedByUserId;

            await _context.SaveChangesAsync();
            _logger.LogInformation("Started surgery for schedule {ScheduleId}", scheduleId);

            return new BookingResultDto
            {
                Success = true,
                ScheduleId = scheduleId,
                ScheduleNumber = schedule.ScheduleNumber,
                Message = "Surgery started successfully"
            };
        }

        public async Task<BookingResultDto> CompleteSurgeryAsync(Guid scheduleId, CompleteSurgeryRequest request, Guid tenantId, Guid completedByUserId)
        {
            var schedule = await _context.OTSchedules
                .FirstOrDefaultAsync(s => s.Id == scheduleId && s.TenantId == tenantId && s.DeletedAt == null)
                ?? throw new KeyNotFoundException("Schedule not found");

            if (schedule.Status != "InProgress")
                throw new InvalidOperationException("Only in-progress surgeries can be completed");

            schedule.Status = "Completed";
            schedule.SurgeryCompletedAt = request.CompletedAt;
            schedule.ActualDurationMinutes = request.ActualDurationMinutes 
                ?? (schedule.SurgeryStartedAt.HasValue 
                    ? (int)(request.CompletedAt - schedule.SurgeryStartedAt.Value).TotalMinutes 
                    : schedule.DurationMinutes);
            schedule.Complications = request.Complications;
            schedule.Outcome = request.Outcome;
            schedule.UpdatedAt = DateTime.UtcNow;
            schedule.UpdatedByUserId = completedByUserId;

            await _context.SaveChangesAsync();
            _logger.LogInformation("Completed surgery for schedule {ScheduleId}", scheduleId);

            return new BookingResultDto
            {
                Success = true,
                ScheduleId = scheduleId,
                ScheduleNumber = schedule.ScheduleNumber,
                Message = "Surgery completed successfully"
            };
        }

        public async Task<BookingResultDto> CancelScheduleAsync(Guid scheduleId, CancelScheduleRequest request, Guid tenantId, Guid cancelledByUserId)
        {
            var schedule = await _context.OTSchedules
                .FirstOrDefaultAsync(s => s.Id == scheduleId && s.TenantId == tenantId && s.DeletedAt == null)
                ?? throw new KeyNotFoundException("Schedule not found");

            if (schedule.Status == "Completed" || schedule.Status == "Cancelled")
                throw new InvalidOperationException("Cannot cancel completed or already cancelled schedules");

            schedule.Status = "Cancelled";
            schedule.CancelledAt = DateTime.UtcNow;
            schedule.CancelledByUserId = cancelledByUserId;
            schedule.CancellationReason = request.CancellationReason;
            schedule.UpdatedAt = DateTime.UtcNow;
            schedule.UpdatedByUserId = cancelledByUserId;

            await _context.SaveChangesAsync();
            _logger.LogInformation("Cancelled OT schedule {ScheduleId}", scheduleId);

            return new BookingResultDto
            {
                Success = true,
                ScheduleId = scheduleId,
                ScheduleNumber = schedule.ScheduleNumber,
                Message = "Schedule cancelled successfully"
            };
        }

        public async Task<BookingResultDto> RescheduleBookingAsync(Guid scheduleId, RescheduleRequest request, Guid tenantId, Guid updatedByUserId)
        {
            var schedule = await _context.OTSchedules
                .FirstOrDefaultAsync(s => s.Id == scheduleId && s.TenantId == tenantId && s.DeletedAt == null)
                ?? throw new KeyNotFoundException("Schedule not found");

            if (schedule.Status == "Completed" || schedule.Status == "Cancelled")
                throw new InvalidOperationException("Cannot reschedule completed or cancelled schedules");

            // Check availability at new time
            var availabilityCheck = await CheckTheaterAvailabilityAsync(
                schedule.TheaterId, request.NewScheduledDate, request.NewStartTime, request.NewEndTime, tenantId, scheduleId);
            
            if (!availabilityCheck.IsAvailable)
            {
                return new BookingResultDto
                {
                    Success = false,
                    Errors = availabilityCheck.ConflictReasons
                };
            }

            schedule.ScheduledDate = request.NewScheduledDate;
            schedule.StartTime = request.NewStartTime;
            schedule.EndTime = request.NewEndTime;
            schedule.DurationMinutes = (int)(request.NewEndTime - request.NewStartTime).TotalMinutes;
            schedule.Status = "Rescheduled";
            schedule.UpdatedAt = DateTime.UtcNow;
            schedule.UpdatedByUserId = updatedByUserId;

            await _context.SaveChangesAsync();
            _logger.LogInformation("Rescheduled OT schedule {ScheduleId}", scheduleId);

            return new BookingResultDto
            {
                Success = true,
                ScheduleId = scheduleId,
                ScheduleNumber = schedule.ScheduleNumber,
                Message = "Schedule rescheduled successfully"
            };
        }

        // Availability Checking

        // NOTE: This method writes to OTBookingValidation.ChecksPassed (legacy JSONB checklist).
        // The new per-item completion system uses the ot_admission_checklist_completions table,
        // exposed via PreAdmissionChecklistController (POST /pre-admission-checklist/workflow).
        // Both systems coexist; this endpoint continues to serve legacy callers.
        // Do not remove until all clients have migrated to the new workflow endpoint.
        public async Task<UpdateChecklistResponse> UpdateChecklistAsync(Guid scheduleId, UpdateChecklistRequest request, Guid tenantId, Guid updatedByUserId)
        {
            var schedule = await _context.OTSchedules
                .FirstOrDefaultAsync(s => s.Id == scheduleId && s.TenantId == tenantId && s.DeletedAt == null)
                ?? throw new KeyNotFoundException("Schedule not found");

            // Upsert OTBookingValidation — checklist items live in ChecksPassed JSONB
            var validation = await _context.OTBookingValidations
                .FirstOrDefaultAsync(v => v.ScheduleId == scheduleId && v.TenantId == tenantId);

            var checklist = new Dictionary<string, bool>();
            if (validation != null && !string.IsNullOrEmpty(validation.ChecksPassed))
            {
                try
                {
                    checklist = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, bool>>(
                        validation.ChecksPassed, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true })
                        ?? new Dictionary<string, bool>();
                }
                catch { /* start fresh if JSON is malformed */ }
            }

            // Merge only the fields that were provided in the request
            if (request.PreOpTestsDone.HasValue)    checklist["preOpTestsDone"]    = request.PreOpTestsDone.Value;
            if (request.ConsentSigned.HasValue)     checklist["consentSigned"]     = request.ConsentSigned.Value;
            if (request.FinancialCleared.HasValue)  checklist["financialCleared"]  = request.FinancialCleared.Value;
            if (request.BedReserved.HasValue)       checklist["bedReserved"]       = request.BedReserved.Value;
            if (request.OtSlotConfirmed.HasValue)   checklist["otSlotConfirmed"]   = request.OtSlotConfirmed.Value;
            if (request.PreOpMedsPrescribed.HasValue) checklist["preOpMedsPrescribed"] = request.PreOpMedsPrescribed.Value;
            if (request.PatientInstructed.HasValue) checklist["patientInstructed"] = request.PatientInstructed.Value;
            if (request.InventoryConfirmed.HasValue) checklist["inventoryConfirmed"] = request.InventoryConfirmed.Value;

            var checklistJson = System.Text.Json.JsonSerializer.Serialize(checklist);
            var doneCount = checklist.Count(kv => kv.Value);
            var totalCount = 8; // fixed 8-item checklist
            var progressPercent = (int)Math.Round((double)doneCount / totalCount * 100);

            if (validation == null)
            {
                validation = new Models.Domain.OTBookingValidation
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    ScheduleId = scheduleId,
                    SessionId = schedule.SessionId ?? Guid.Empty,
                    ValidationTimestamp = DateTime.UtcNow,
                    ValidatedByUserId = updatedByUserId,
                    ChecksPassed = checklistJson,
                    CanProceed = progressPercent == 100,
                    CreatedAt = DateTime.UtcNow,
                };
                _context.OTBookingValidations.Add(validation);
            }
            else
            {
                validation.ChecksPassed = checklistJson;
                validation.CanProceed = progressPercent == 100;
                validation.ValidationTimestamp = DateTime.UtcNow;
                validation.ValidatedByUserId = updatedByUserId;
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("Updated checklist for schedule {ScheduleId}: {Progress}%", scheduleId, progressPercent);

            return new UpdateChecklistResponse
            {
                Success = true,
                Message = "Checklist updated",
                Checklist = checklist,
                ProgressPercent = progressPercent,
            };
        }

        public async Task<BookingResultDto> RecordNoShowAsync(Guid scheduleId, NoShowRequest request, Guid tenantId, Guid recordedByUserId)
        {
            var schedule = await _context.OTSchedules
                .FirstOrDefaultAsync(s => s.Id == scheduleId && s.TenantId == tenantId && s.DeletedAt == null)
                ?? throw new KeyNotFoundException("Schedule not found");

            if (schedule.Status == "Completed")
                throw new InvalidOperationException("Cannot record no-show on a completed surgery");

            var action = request.Action.ToLower();

            var now = DateTime.UtcNow;

            if (action == "cancel")
            {
                schedule.Status = "Cancelled";
                schedule.CancelledAt = now;
                schedule.CancelledByUserId = recordedByUserId;
                schedule.CancellationReason = $"No-Show: {request.Notes ?? "Patient did not arrive"}";

                // Auto-create dept coordination requests for Billing + Admissions on cancel
                var notifyDepts = new[] { "Billing", "Admissions" };
                foreach (var dept in notifyDepts)
                {
                    _context.DeptCoordinationRequests.Add(new Models.Domain.DeptCoordinationRequest
                    {
                        Id = Guid.NewGuid(),
                        TenantId = tenantId,
                        ScheduleId = scheduleId,
                        SessionId = schedule.SessionId,
                        PatientId = schedule.PatientId.GetValueOrDefault(),
                        Department = dept,
                        RequestStatus = "Pending",
                        RequestMessage = $"Surgery booking {schedule.ScheduleNumber} cancelled due to no-show. Please update records and notify {dept} team.",
                        RequestedBy = recordedByUserId,
                        RequestedAt = now,
                        CreatedAt = now,
                        UpdatedAt = now,
                        CreatedByUserId = recordedByUserId,
                        UpdatedByUserId = recordedByUserId,
                    });
                }
            }
            else
            {
                // 'reschedule' or 'hold' — mark as NoShow, pending further action
                schedule.Status = "NoShow";
                schedule.CancellationReason = request.Notes;
            }

            schedule.UpdatedAt = now;
            schedule.UpdatedByUserId = recordedByUserId;

            await _context.SaveChangesAsync();
            _logger.LogInformation("Recorded no-show (action={Action}) for schedule {ScheduleId}", action, scheduleId);

            return new BookingResultDto
            {
                Success = true,
                ScheduleId = scheduleId,
                ScheduleNumber = schedule.ScheduleNumber,
                Message = action == "cancel" ? "Surgery booking cancelled due to no-show"
                        : action == "reschedule" ? "Marked as no-show — please reschedule"
                        : "Placed on hold due to no-show",
            };
        }

        // ── Stock / IOL Availability ──────────────────────────────────────────

        public async Task<StockAvailabilityDto> GetStockAvailabilityAsync(Guid scheduleId, Guid tenantId)
        {
            var validation = await _context.OTBookingValidations
                .FirstOrDefaultAsync(v => v.ScheduleId == scheduleId && v.TenantId == tenantId);

            if (validation == null)
                return new StockAvailabilityDto
                {
                    ScheduleId = scheduleId,
                    StockCheckStatus = "Pending",
                };

            return new StockAvailabilityDto
            {
                ScheduleId = scheduleId,
                StockCheckStatus = validation.StockCheckStatus ?? "Pending",
                IolModel = validation.IolModel,
                IolPower = validation.IolPower,
                IolSide = validation.IolSide,
                IolCatalogId = validation.IolMasterId,
                StockNotes = validation.StockNotes,
                ConfirmedByUserId = validation.StockConfirmedBy,
                ConfirmedAt = validation.StockConfirmedAt,
            };
        }

        public async Task<StockAvailabilityDto> ConfirmStockAsync(Guid scheduleId, ConfirmStockRequest request, Guid tenantId, Guid confirmedByUserId)
        {
            var schedule = await _context.OTSchedules
                .FirstOrDefaultAsync(s => s.Id == scheduleId && s.TenantId == tenantId && s.DeletedAt == null)
                ?? throw new KeyNotFoundException("Schedule not found");

            var validation = await _context.OTBookingValidations
                .FirstOrDefaultAsync(v => v.ScheduleId == scheduleId && v.TenantId == tenantId);

            if (validation == null)
            {
                validation = new OTBookingValidation
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    ScheduleId = scheduleId,
                    SessionId = schedule.SessionId ?? Guid.Empty,
                    ChecksPassed = "{}",
                    ValidationTimestamp = DateTime.UtcNow,
                };
                _context.OTBookingValidations.Add(validation);
            }

            validation.StockCheckStatus = request.Status;
            validation.StockNotes = request.Notes ?? validation.StockNotes;

            if (request.Status == "Confirmed")
            {
                validation.StockConfirmedBy = confirmedByUserId;
                validation.StockConfirmedAt = DateTime.UtcNow;
                validation.IolModel = request.IolModel ?? validation.IolModel;
                validation.IolPower = request.IolPower ?? validation.IolPower;
                validation.IolSide = request.IolSide ?? validation.IolSide;
                validation.IolMasterId = request.IolCatalogId ?? validation.IolMasterId;
            }

            validation.ValidationTimestamp = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Stock status set to {Status} for schedule {ScheduleId} by user {UserId}",
                request.Status, scheduleId, confirmedByUserId);

            return new StockAvailabilityDto
            {
                ScheduleId = scheduleId,
                StockCheckStatus = validation.StockCheckStatus ?? "Pending",
                IolModel = validation.IolModel,
                IolPower = validation.IolPower,
                IolSide = validation.IolSide,
                IolCatalogId = validation.IolMasterId,
                StockNotes = validation.StockNotes,
                ConfirmedByUserId = validation.StockConfirmedBy,
                ConfirmedAt = validation.StockConfirmedAt,
            };
        }

        public async Task<AvailabilityCheckDto> CheckTheaterAvailabilityAsync(Guid theaterId, DateTime date, TimeSpan startTime, TimeSpan endTime, Guid tenantId, Guid? excludeScheduleId = null)
        {
            var result = new AvailabilityCheckDto { IsAvailable = true };

            // Check theater exists and is operational
            var theater = await _context.OTTheaters.FirstOrDefaultAsync(t => t.Id == theaterId && t.TenantId == tenantId && t.DeletedAt == null);
            if (theater == null)
            {
                result.IsAvailable = false;
                result.ConflictReasons.Add("Theater not found");
                return result;
            }

            if (!theater.IsOperational || theater.MaintenanceMode)
            {
                result.IsAvailable = false;
                result.ConflictReasons.Add("Theater is not operational or in maintenance mode");
                return result;
            }

            // Check overlapping schedules
            var query = _context.OTSchedules
                .Where(s => s.TheaterId == theaterId
                    && s.ScheduledDate.Date == date.Date
                    && s.TenantId == tenantId
                    && s.DeletedAt == null
                    && s.Status != "Cancelled");

            if (excludeScheduleId.HasValue)
                query = query.Where(s => s.Id != excludeScheduleId.Value);

            var existingSchedules = await query.ToListAsync();

            foreach (var existing in existingSchedules)
            {
                if ((startTime >= existing.StartTime && startTime < existing.EndTime) ||
                    (endTime > existing.StartTime && endTime <= existing.EndTime) ||
                    (startTime <= existing.StartTime && endTime >= existing.EndTime))
                {
                    result.IsAvailable = false;
                    result.ConflictReasons.Add($"Time slot overlaps with existing schedule {existing.ScheduleNumber}");
                }
            }

            return result;
        }

        public async Task<AvailabilityCheckDto> CheckSurgeonAvailabilityAsync(Guid surgeonId, DateTime date, TimeSpan startTime, TimeSpan endTime, Guid tenantId)
        {
            var result = new AvailabilityCheckDto { IsAvailable = true };

            var existingSchedules = await _context.OTSchedules
                .Where(s => s.SurgeonId == surgeonId
                    && s.ScheduledDate.Date == date.Date
                    && s.TenantId == tenantId
                    && s.DeletedAt == null
                    && s.Status != "Cancelled")
                .ToListAsync();

            foreach (var existing in existingSchedules)
            {
                if ((startTime >= existing.StartTime && startTime < existing.EndTime) ||
                    (endTime > existing.StartTime && endTime <= existing.EndTime) ||
                    (startTime <= existing.StartTime && endTime >= existing.EndTime))
                {
                    result.IsAvailable = false;
                    result.ConflictReasons.Add($"Surgeon has conflicting schedule {existing.ScheduleNumber}");
                }
            }

            return result;
        }

        public async Task<List<TimeSlotDto>> GetAvailableSlotsAsync(Guid theaterId, DateTime date, Guid tenantId)
        {
            var theater = await _context.OTTheaters.FirstOrDefaultAsync(t => t.Id == theaterId && t.TenantId == tenantId && t.DeletedAt == null)
                ?? throw new KeyNotFoundException("Theater not found");

            var existingSchedules = await _context.OTSchedules
                .Where(s => s.TheaterId == theaterId
                    && s.ScheduledDate.Date == date.Date
                    && s.TenantId == tenantId
                    && s.DeletedAt == null
                    && s.Status != "Cancelled")
                .OrderBy(s => s.StartTime)
                .ToListAsync();

            var availableSlots = new List<TimeSlotDto>();
            var currentTime = theater.OperationStartTime;
            var endTime = theater.OperationEndTime;
            var slotDuration = theater.StandardSurgeryDurationMinutes + theater.CleaningTimeBetweenSurgeriesMinutes;

            foreach (var schedule in existingSchedules)
            {
                if (currentTime < schedule.StartTime)
                {
                    availableSlots.Add(new TimeSlotDto
                    {
                        Date = date,
                        StartTime = currentTime,
                        EndTime = schedule.StartTime,
                        DurationMinutes = (int)(schedule.StartTime - currentTime).TotalMinutes
                    });
                }
                currentTime = schedule.EndTime.Add(TimeSpan.FromMinutes(theater.CleaningTimeBetweenSurgeriesMinutes));
            }

            if (currentTime < endTime)
            {
                availableSlots.Add(new TimeSlotDto
                {
                    Date = date,
                    StartTime = currentTime,
                    EndTime = endTime,
                    DurationMinutes = (int)(endTime - currentTime).TotalMinutes
                });
            }

            return availableSlots;
        }

        // Validation
        public async Task<BookingValidationDto> ValidateBookingAsync(ValidateBookingRequest request, Guid tenantId, Guid validatedByUserId)
        {
            var schedule = await _context.OTSchedules.FirstOrDefaultAsync(s => s.Id == request.ScheduleId && s.TenantId == tenantId)
                ?? throw new KeyNotFoundException("Schedule not found");

            var checks = new ValidationSummaryDto
            {
                OTAvailable = true,
                SurgeonAvailable = true,
                AnesthesiaAvailable = schedule.AnesthesiologistId.HasValue,
                IOLReserved = schedule.IOLReservedId.HasValue,
                PreOpTestsCleared = false,
                FitnessClearanceObtained = false,
                PaymentReceived = false,
                BedReserved = false,
                ConsentSigned = false,
                InsuranceApproved = false
            };

            checks.AllChecksPassed = checks.OTAvailable && checks.SurgeonAvailable && checks.AnesthesiaAvailable;

            var validation = new OTBookingValidation
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                ScheduleId = request.ScheduleId,
                SessionId = request.SessionId,
                ValidationTimestamp = DateTime.UtcNow,
                ValidatedByUserId = validatedByUserId,
                ChecksPassed = JsonSerializer.Serialize(checks),
                CanProceed = checks.AllChecksPassed,
                RequiresAttention = !checks.AllChecksPassed,
                CreatedAt = DateTime.UtcNow
            };

            _context.OTBookingValidations.Add(validation);
            await _context.SaveChangesAsync();

            return ToValidationDto(validation);
        }

        public async Task<BookingValidationDto?> GetValidationStatusAsync(Guid scheduleId, Guid tenantId)
        {
            var validation = await _context.OTBookingValidations
                .Where(v => v.ScheduleId == scheduleId && v.TenantId == tenantId)
                .OrderByDescending(v => v.ValidationTimestamp)
                .FirstOrDefaultAsync();

            return validation != null ? ToValidationDto(validation) : null;
        }

        // Equipment Management
        public async Task<List<EquipmentAvailabilityDto>> GetTheaterEquipmentAsync(Guid theaterId, Guid tenantId)
        {
            var equipment = await _context.OTEquipmentAvailability
                .Where(e => e.TheaterId == theaterId && e.TenantId == tenantId && e.DeletedAt == null)
                .OrderBy(e => e.EquipmentName)
                .ToListAsync();

            return equipment.Select(ToEquipmentDto).ToList();
        }

        public async Task<EquipmentAvailabilityDto> UpdateEquipmentStatusAsync(Guid equipmentId, UpdateEquipmentStatusRequest request, Guid tenantId, Guid updatedByUserId)
        {
            var equipment = await _context.OTEquipmentAvailability
                .FirstOrDefaultAsync(e => e.Id == equipmentId && e.TenantId == tenantId && e.DeletedAt == null)
                ?? throw new KeyNotFoundException("Equipment not found");

            equipment.CurrentStatus = request.CurrentStatus;
            if (request.IsFunctional.HasValue) equipment.IsFunctional = request.IsFunctional.Value;
            if (request.Notes != null) equipment.Notes = request.Notes;
            equipment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return ToEquipmentDto(equipment);
        }

        // Collision Management
        public async Task<CollisionLogDto> LogCollisionAsync(Guid theaterId, DateTime collisionDate, TimeSpan collisionTime, 
            string collisionType, string? attemptedScheduleData, Guid? existingScheduleId, Guid tenantId, Guid detectedByUserId)
        {
            var collision = new OTCollisionLog
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                TheaterId = theaterId,
                CollisionDate = collisionDate,
                CollisionTime = collisionTime,
                ExistingScheduleId = existingScheduleId,
                AttemptedScheduleData = attemptedScheduleData,
                CollisionType = collisionType,
                DetectedByUserId = detectedByUserId,
                DetectedAt = DateTime.UtcNow,
                Resolved = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.OTCollisionLogs.Add(collision);
            await _context.SaveChangesAsync();
            _logger.LogWarning("Logged OT collision {CollisionId} - Type: {CollisionType}", collision.Id, collisionType);

            return ToCollisionDto(collision);
        }

        public async Task<List<CollisionLogDto>> GetCollisionsAsync(Guid? theaterId, DateTime? startDate, DateTime? endDate, bool? resolved, Guid tenantId)
        {
            var query = _context.OTCollisionLogs
                .Include(c => c.Theater)
                .Where(c => c.TenantId == tenantId);

            if (theaterId.HasValue)
                query = query.Where(c => c.TheaterId == theaterId.Value);

            if (startDate.HasValue)
                query = query.Where(c => c.CollisionDate >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(c => c.CollisionDate <= endDate.Value);

            if (resolved.HasValue)
                query = query.Where(c => c.Resolved == resolved.Value);

            var collisions = await query.OrderByDescending(c => c.DetectedAt).ToListAsync();
            return collisions.Select(ToCollisionDto).ToList();
        }

        public async Task<CollisionLogDto> ResolveCollisionAsync(Guid collisionId, ResolveCollisionRequest request, Guid tenantId)
        {
            var collision = await _context.OTCollisionLogs
                .FirstOrDefaultAsync(c => c.Id == collisionId && c.TenantId == tenantId)
                ?? throw new KeyNotFoundException("Collision log not found");

            collision.Resolved = true;
            collision.ResolvedAt = DateTime.UtcNow;
            collision.ResolutionAction = request.ResolutionAction;
            collision.ResolutionNotes = request.ResolutionNotes;

            await _context.SaveChangesAsync();
            _logger.LogInformation("Resolved OT collision {CollisionId}", collisionId);

            return ToCollisionDto(collision);
        }

        // Helper methods
        private OTTheaterDto ToTheaterDto(OTTheater theater) => new OTTheaterDto
        {
            Id = theater.Id,
            TenantId = theater.TenantId,
            BranchId = theater.BranchId,
            TheaterName = theater.TheaterName,
            TheaterCode = theater.TheaterCode,
            FloorNumber = theater.FloorNumber,
            LocationDescription = theater.LocationDescription,
            Specialization = theater.Specialization,
            SurgeryTypesSupported = theater.SurgeryTypesSupported,
            EquipmentList = theater.EquipmentList,
            MaxSurgeriesPerDay = theater.MaxSurgeriesPerDay,
            StandardSurgeryDurationMinutes = theater.StandardSurgeryDurationMinutes,
            CleaningTimeBetweenSurgeriesMinutes = theater.CleaningTimeBetweenSurgeriesMinutes,
            OperationStartTime = theater.OperationStartTime,
            OperationEndTime = theater.OperationEndTime,
            OperatingDays = theater.OperatingDays,
            IsActive = theater.IsActive,
            IsOperational = theater.IsOperational,
            MaintenanceMode = theater.MaintenanceMode,
            MaintenanceReason = theater.MaintenanceReason
        };

        private OTScheduleDto ToScheduleDto(OTSchedule schedule, Dictionary<Guid, Patient>? patientMap = null, Dictionary<Guid, string>? surgeonMap = null, (string PatientType, decimal? PackageAmount, string? RecommendedProcedures)? sessionData = null)
        {
            Patient? patient = null;
            if (patientMap != null && schedule.PatientId.HasValue)
                patientMap.TryGetValue(schedule.PatientId.Value, out patient);

            int? age = null;
            if (patient?.DateOfBirth != null)
                age = (int)((DateTime.UtcNow - patient.DateOfBirth).TotalDays / 365.25);

            string? surgeonName = null;
            surgeonMap?.TryGetValue(schedule.SurgeonId, out surgeonName);

            return new OTScheduleDto
            {
                Id = schedule.Id,
                TheaterId = schedule.TheaterId,
                TheaterName = schedule.Theater?.TheaterName,
                SessionId = schedule.SessionId,
                BookingId = schedule.BookingId,
                PatientId = schedule.PatientId,
                ScheduleNumber = schedule.ScheduleNumber,
                ScheduledDate = schedule.ScheduledDate,
                StartTime = schedule.StartTime,
                EndTime = schedule.EndTime,
                DurationMinutes = schedule.DurationMinutes,
                SurgeryType = schedule.SurgeryType,
                ProcedureDescription = schedule.ProcedureDescription,
                EyeOperated = schedule.EyeOperated,
                SurgeonId = schedule.SurgeonId,
                SurgeonName = surgeonName,
                AnesthesiologistId = schedule.AnesthesiologistId,
                OTTechnicianId = schedule.OTTechnicianId,
                NursingStaffIds = schedule.NursingStaffIds,
                EquipmentReserved = schedule.EquipmentReserved,
                IOLReservedId = schedule.IOLReservedId,
                Status = schedule.Status,
                ConfirmationTimestamp = schedule.ConfirmationTimestamp,
                CancelledAt = schedule.CancelledAt,
                CancellationReason = schedule.CancellationReason,
                SurgeryStartedAt = schedule.SurgeryStartedAt,
                SurgeryCompletedAt = schedule.SurgeryCompletedAt,
                ActualDurationMinutes = schedule.ActualDurationMinutes,
                Complications = schedule.Complications,
                Outcome = schedule.Outcome,
                // Patient info
                PatientName = patient != null ? $"{patient.FirstName} {patient.LastName}".Trim() : null,
                Mrn = patient?.MedicalRecordNumber,
                PatientPhone = patient?.ContactNumber,
                Age = age,
                Gender = patient?.Gender,
                // Counseling session info
                PatientType = sessionData?.PatientType,
                PackageAmount = sessionData?.PackageAmount,
                RecommendedProcedures = sessionData?.RecommendedProcedures,
            };
        }

        private BookingValidationDto ToValidationDto(OTBookingValidation validation) => new BookingValidationDto
        {
            Id = validation.Id,
            ScheduleId = validation.ScheduleId,
            SessionId = validation.SessionId,
            ValidationTimestamp = validation.ValidationTimestamp,
            ChecksPassed = validation.ChecksPassed,
            BlockingIssues = validation.BlockingIssues,
            WarningIssues = validation.WarningIssues,
            CanProceed = validation.CanProceed,
            RequiresAttention = validation.RequiresAttention
        };

        private EquipmentAvailabilityDto ToEquipmentDto(OTEquipmentAvailability equipment) => new EquipmentAvailabilityDto
        {
            Id = equipment.Id,
            TheaterId = equipment.TheaterId,
            EquipmentName = equipment.EquipmentName,
            EquipmentModel = equipment.EquipmentModel,
            EquipmentSerialNumber = equipment.EquipmentSerialNumber,
            IsFunctional = equipment.IsFunctional,
            CurrentStatus = equipment.CurrentStatus,
            LastServicedAt = equipment.LastServicedAt,
            NextServiceDue = equipment.NextServiceDue,
            MaintenanceSchedule = equipment.MaintenanceSchedule,
            ServiceProvider = equipment.ServiceProvider,
            TotalUsageHours = equipment.TotalUsageHours,
            LastUsedAt = equipment.LastUsedAt,
            Notes = equipment.Notes
        };

        private CollisionLogDto ToCollisionDto(OTCollisionLog collision) => new CollisionLogDto
        {
            Id = collision.Id,
            TheaterId = collision.TheaterId,
            TheaterName = collision.Theater?.TheaterName,
            CollisionDate = collision.CollisionDate,
            CollisionTime = collision.CollisionTime,
            ExistingScheduleId = collision.ExistingScheduleId,
            AttemptedScheduleData = collision.AttemptedScheduleData,
            CollisionType = collision.CollisionType,
            DetectedAt = collision.DetectedAt,
            Resolved = collision.Resolved,
            ResolvedAt = collision.ResolvedAt,
            ResolutionAction = collision.ResolutionAction,
            ResolutionNotes = collision.ResolutionNotes
        };
    }
}
