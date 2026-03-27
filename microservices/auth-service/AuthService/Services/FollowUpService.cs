using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AuthService.Context;
using AuthService.DTOs.FollowUp;
using AuthService.Models;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services
{
    public class FollowUpService : IFollowUpService
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public FollowUpService(AppDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        private Guid GetCurrentTenantId()
        {
            var tenantIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("tenant_id");
            return tenantIdClaim != null ? Guid.Parse(tenantIdClaim.Value) : Guid.Empty;
        }

        public async Task<List<FollowUpAppointmentDto>> GetFollowUpsAsync(FollowUpFiltersDto filters)
        {
            var tenantId = GetCurrentTenantId();
            
            var query = _context.FollowUpAppointments
                .Include(f => f.Patient)
                .Include(f => f.AssignedDoctor)
                .Include(f => f.Department)
                .Where(f => f.TenantId == tenantId && f.DeletedAt == null);

            if (!string.IsNullOrEmpty(filters.Status))
                query = query.Where(f => f.Status == filters.Status);

            if (!string.IsNullOrEmpty(filters.Priority))
                query = query.Where(f => f.Priority == filters.Priority);

            if (filters.FromDate.HasValue)
                query = query.Where(f => f.ScheduledDate >= filters.FromDate.Value);

            if (filters.ToDate.HasValue)
                query = query.Where(f => f.ScheduledDate <= filters.ToDate.Value);

            if (filters.DepartmentId.HasValue)
                query = query.Where(f => f.DepartmentId == filters.DepartmentId.Value);

            if (filters.DoctorId.HasValue)
                query = query.Where(f => f.AssignedDoctorId == filters.DoctorId.Value);

            var followUps = await query.OrderBy(f => f.ScheduledDate).ToListAsync();

            return followUps.Select(MapToDto).ToList();
        }

        public async Task<FollowUpAppointmentDto?> GetFollowUpByIdAsync(Guid id)
        {
            var tenantId = GetCurrentTenantId();
            
            var followUp = await _context.FollowUpAppointments
                .Include(f => f.Patient)
                .Include(f => f.AssignedDoctor)
                .Include(f => f.Department)
                .FirstOrDefaultAsync(f => f.Id == id && f.TenantId == tenantId && f.DeletedAt == null);

            return followUp != null ? MapToDto(followUp) : null;
        }

        public async Task<FollowUpAppointmentDto> CreateFollowUpAsync(CreateFollowUpDto dto, Guid userId)
        {
            var tenantId = GetCurrentTenantId();

            var followUp = new FollowUpAppointment
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                PatientId = dto.PatientId,
                FollowUpType = dto.FollowUpType,
                RelatedProcedure = dto.RelatedProcedure,
                ProcedureDate = dto.ProcedureDate,
                ScheduledDate = dto.ScheduledDate,
                ScheduledTime = dto.ScheduledTime,
                Priority = dto.Priority,
                AssignedDoctorId = dto.AssignedDoctorId,
                DepartmentId = dto.DepartmentId,
                Notes = dto.Notes,
                Status = "scheduled",
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = userId
            };

            _context.FollowUpAppointments.Add(followUp);
            await _context.SaveChangesAsync();

            return await GetFollowUpByIdAsync(followUp.Id) ?? MapToDto(followUp);
        }

        public async Task<FollowUpAppointmentDto> UpdateFollowUpAsync(Guid id, UpdateFollowUpDto dto, Guid userId)
        {
            var tenantId = GetCurrentTenantId();
            
            var followUp = await _context.FollowUpAppointments
                .FirstOrDefaultAsync(f => f.Id == id && f.TenantId == tenantId && f.DeletedAt == null);

            if (followUp == null)
                throw new Exception("Follow-up not found");

            if (dto.ScheduledDate.HasValue)
                followUp.ScheduledDate = dto.ScheduledDate.Value;

            if (dto.ScheduledTime != null)
                followUp.ScheduledTime = dto.ScheduledTime;

            if (dto.Status != null)
                followUp.Status = dto.Status;

            if (dto.Priority != null)
                followUp.Priority = dto.Priority;

            if (dto.Notes != null)
                followUp.Notes = dto.Notes;

            if (dto.Outcome != null)
                followUp.Outcome = dto.Outcome;

            followUp.UpdatedAt = DateTime.UtcNow;
            followUp.UpdatedByUserId = userId;

            await _context.SaveChangesAsync();

            return await GetFollowUpByIdAsync(id) ?? MapToDto(followUp);
        }

        public async Task<FollowUpAppointmentDto> CompleteFollowUpAsync(Guid id, string outcome, Guid userId)
        {
            var tenantId = GetCurrentTenantId();
            
            var followUp = await _context.FollowUpAppointments
                .FirstOrDefaultAsync(f => f.Id == id && f.TenantId == tenantId && f.DeletedAt == null);

            if (followUp == null)
                throw new Exception("Follow-up not found");

            followUp.Status = "completed";
            followUp.CompletedDate = DateTime.UtcNow;
            followUp.Outcome = outcome;
            followUp.UpdatedAt = DateTime.UtcNow;
            followUp.UpdatedByUserId = userId;

            await _context.SaveChangesAsync();

            return await GetFollowUpByIdAsync(id) ?? MapToDto(followUp);
        }

        public async Task<FollowUpAppointmentDto> RescheduleFollowUpAsync(Guid id, DateTime newDate, string? newTime, Guid userId)
        {
            var tenantId = GetCurrentTenantId();
            
            var followUp = await _context.FollowUpAppointments
                .FirstOrDefaultAsync(f => f.Id == id && f.TenantId == tenantId && f.DeletedAt == null);

            if (followUp == null)
                throw new Exception("Follow-up not found");

            followUp.ScheduledDate = newDate;
            followUp.ScheduledTime = newTime;
            followUp.Status = "scheduled";
            followUp.UpdatedAt = DateTime.UtcNow;
            followUp.UpdatedByUserId = userId;

            await _context.SaveChangesAsync();

            return await GetFollowUpByIdAsync(id) ?? MapToDto(followUp);
        }

        public async Task<bool> DeleteFollowUpAsync(Guid id, Guid userId)
        {
            var tenantId = GetCurrentTenantId();
            
            var followUp = await _context.FollowUpAppointments
                .FirstOrDefaultAsync(f => f.Id == id && f.TenantId == tenantId && f.DeletedAt == null);

            if (followUp == null)
                return false;

            // Soft delete
            followUp.DeletedAt = DateTime.UtcNow;
            followUp.UpdatedByUserId = userId;

            await _context.SaveChangesAsync();
            return true;
        }

        private FollowUpAppointmentDto MapToDto(FollowUpAppointment followUp)
        {
            return new FollowUpAppointmentDto
            {
                Id = followUp.Id,
                PatientId = followUp.PatientId,
                PatientName = followUp.Patient?.FirstName + " " + followUp.Patient?.LastName ?? "Unknown",
                PatientMRN = followUp.Patient?.MedicalRecordNumber ?? "",
                FollowUpType = followUp.FollowUpType,
                RelatedProcedure = followUp.RelatedProcedure,
                ProcedureDate = followUp.ProcedureDate,
                ScheduledDate = followUp.ScheduledDate,
                ScheduledTime = followUp.ScheduledTime,
                Status = followUp.Status,
                Priority = followUp.Priority,
                AssignedDoctorId = followUp.AssignedDoctorId,
                AssignedDoctorName = followUp.AssignedDoctor?.FirstName + " " + followUp.AssignedDoctor?.LastName ?? "Unknown",
                DepartmentId = followUp.DepartmentId,
                DepartmentName = followUp.Department?.Name ?? "Unknown",
                Notes = followUp.Notes,
                RemindersSent = followUp.RemindersSent,
                LastReminderDate = followUp.LastReminderDate,
                CompletedDate = followUp.CompletedDate,
                Outcome = followUp.Outcome
            };
        }
    }
}
