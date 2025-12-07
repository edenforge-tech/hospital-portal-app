using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services;

public interface IAppointmentService
{
    Task<PagedResult<Appointment>> GetAllAppointmentsAsync(
        Guid tenantId, 
        DateTime? fromDate = null, 
        DateTime? toDate = null,
        string? status = null,
        int page = 1, 
        int pageSize = 10);
    Task<PagedResult<Appointment>> GetDoctorAppointmentsAsync(
        Guid doctorId, 
        Guid tenantId, 
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? status = null,
        int page = 1, 
        int pageSize = 10);
    Task<PagedResult<Appointment>> GetPatientAppointmentsAsync(
        Guid patientId, 
        Guid tenantId,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? status = null,
        int page = 1, 
        int pageSize = 10);
    Task<Appointment?> GetAppointmentByIdAsync(Guid id, Guid tenantId);
    Task<Appointment> CreateAppointmentAsync(Appointment appointment);
    Task<Appointment?> UpdateAppointmentAsync(Appointment appointment);
    Task<Appointment?> CancelAppointmentAsync(Guid id, Guid tenantId, string reason);
    Task<bool> DeleteAppointmentAsync(Guid id, Guid tenantId);
    Task<bool> IsDoctorAvailable(Guid doctorId, DateTime appointmentDate, int durationMinutes, Guid? excludeAppointmentId = null);
}

public class AppointmentService : IAppointmentService
{
    private readonly AppDbContext _context;
    private readonly ILogger<AppointmentService> _logger;

    public AppointmentService(AppDbContext context, ILogger<AppointmentService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<PagedResult<Appointment>> GetAllAppointmentsAsync(
        Guid tenantId, 
        DateTime? fromDate = null, 
        DateTime? toDate = null,
        string? status = null,
        int page = 1, 
        int pageSize = 10)
    {
        var query = _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
            .Where(a => a.TenantId == tenantId);

        if (fromDate.HasValue)
            query = query.Where(a => a.AppointmentDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(a => a.AppointmentDate <= toDate.Value);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(a => a.Status == status);

        var totalCount = await query.CountAsync();
        
        var items = await query
            .OrderBy(a => a.AppointmentDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<Appointment>
        {
            Items = items,
            TotalCount = totalCount,
            CurrentPage = page,
            PageSize = pageSize
        };
    }

    public async Task<PagedResult<Appointment>> GetDoctorAppointmentsAsync(
        Guid doctorId, 
        Guid tenantId, 
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? status = null,
        int page = 1, 
        int pageSize = 10)
    {
        var query = _context.Appointments
            .Include(a => a.Patient)
            .Where(a => a.DoctorId == doctorId && a.TenantId == tenantId);

        if (fromDate.HasValue)
            query = query.Where(a => a.AppointmentDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(a => a.AppointmentDate <= toDate.Value);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(a => a.Status == status);

        var totalCount = await query.CountAsync();
        
        var items = await query
            .OrderBy(a => a.AppointmentDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<Appointment>
        {
            Items = items,
            TotalCount = totalCount,
            CurrentPage = page,
            PageSize = pageSize
        };
    }

    public async Task<PagedResult<Appointment>> GetPatientAppointmentsAsync(
        Guid patientId, 
        Guid tenantId,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? status = null,
        int page = 1, 
        int pageSize = 10)
    {
        var query = _context.Appointments
            .Include(a => a.Doctor)
            .Where(a => a.PatientId == patientId && a.TenantId == tenantId);

        if (fromDate.HasValue)
            query = query.Where(a => a.AppointmentDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(a => a.AppointmentDate <= toDate.Value);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(a => a.Status == status);

        var totalCount = await query.CountAsync();
        
        var items = await query
            .OrderByDescending(a => a.AppointmentDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<Appointment>
        {
            Items = items,
            TotalCount = totalCount,
            CurrentPage = page,
            PageSize = pageSize
        };
    }

    public async Task<Appointment?> GetAppointmentByIdAsync(Guid id, Guid tenantId)
    {
        return await _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
            .FirstOrDefaultAsync(a => a.Id == id && a.TenantId == tenantId);
    }

    public async Task<Appointment> CreateAppointmentAsync(Appointment appointment)
    {
        if (appointment.Id == Guid.Empty)
        {
            appointment.Id = Guid.NewGuid();
        }

        if (!await IsDoctorAvailable(
            appointment.DoctorId, 
            appointment.AppointmentDate, 
            appointment.DurationMinutes))
        {
            throw new InvalidOperationException("Doctor is not available at the selected time.");
        }

        appointment.Status = "Scheduled";
        appointment.CreatedAt = DateTime.UtcNow;
        appointment.UpdatedAt = DateTime.UtcNow;

        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();
        
        return appointment;
    }

    public async Task<Appointment?> UpdateAppointmentAsync(Appointment appointment)
    {
        var existingAppointment = await _context.Appointments
            .FirstOrDefaultAsync(a => a.Id == appointment.Id && a.TenantId == appointment.TenantId);

        if (existingAppointment == null)
        {
            return null;
        }

        if (!await IsDoctorAvailable(
            appointment.DoctorId, 
            appointment.AppointmentDate, 
            appointment.DurationMinutes,
            appointment.Id))
        {
            throw new InvalidOperationException("Doctor is not available at the selected time.");
        }

        appointment.UpdatedAt = DateTime.UtcNow;
        _context.Entry(existingAppointment).CurrentValues.SetValues(appointment);
        await _context.SaveChangesAsync();
        
        return existingAppointment;
    }

    public async Task<Appointment?> CancelAppointmentAsync(Guid id, Guid tenantId, string reason)
    {
        var appointment = await _context.Appointments
            .FirstOrDefaultAsync(a => a.Id == id && a.TenantId == tenantId);

        if (appointment == null)
        {
            return null;
        }

        appointment.Status = "Cancelled";
        appointment.CancellationReason = reason;
        appointment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return appointment;
    }

    public async Task<bool> DeleteAppointmentAsync(Guid id, Guid tenantId)
    {
        var appointment = await _context.Appointments
            .FirstOrDefaultAsync(a => a.Id == id && a.TenantId == tenantId);

        if (appointment == null)
        {
            return false;
        }

        _context.Appointments.Remove(appointment);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> IsDoctorAvailable(Guid doctorId, DateTime appointmentDate, int durationMinutes, Guid? excludeAppointmentId = null)
    {
        var endTime = appointmentDate.AddMinutes(durationMinutes);

        var conflictingAppointments = await _context.Appointments
            .Where(a => a.DoctorId == doctorId &&
                       a.Status != "Cancelled" &&
                       a.AppointmentDate < endTime &&
                       a.AppointmentDate.AddMinutes(a.DurationMinutes) > appointmentDate)
            .ToListAsync();

        if (excludeAppointmentId.HasValue)
        {
            conflictingAppointments = conflictingAppointments
                .Where(a => a.Id != excludeAppointmentId.Value)
                .ToList();
        }

        return !conflictingAppointments.Any();
    }
}