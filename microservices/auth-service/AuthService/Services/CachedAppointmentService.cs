/*
TEMPORARILY DISABLED DUE TO INTERFACE MISMATCH
using AuthService.Models.Domain;
using Microsoft.Extensions.Caching.Memory;

namespace AuthService.Services;

public class CachedAppointmentService : IAppointmentService
{
    private readonly IAppointmentService _appointmentService;
    private readonly IMemoryCache _cache;
    private readonly ILogger<CachedAppointmentService> _logger;
    private readonly MemoryCacheEntryOptions _cacheOptions;

    public CachedAppointmentService(
        IAppointmentService appointmentService,
        IMemoryCache cache,
        ILogger<CachedAppointmentService> logger)
    {
        _appointmentService = appointmentService;
        _cache = cache;
        _logger = logger;
        _cacheOptions = new MemoryCacheEntryOptions()
            .SetSlidingExpiration(TimeSpan.FromMinutes(5))
            .SetAbsoluteExpiration(TimeSpan.FromHours(1));
    }

    public async Task<List<Appointment>> GetAllAppointmentsAsync(
        Guid tenantId,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        int page = 1,
        int pageSize = 10)
    {
        var cacheKey = $"appointments_{tenantId}_{fromDate}_{toDate}_{page}_{pageSize}";
        
        if (!_cache.TryGetValue(cacheKey, out List<Appointment> appointments))
        {
            appointments = await _appointmentService.GetAllAppointmentsAsync(tenantId, fromDate, toDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            _cache.Set(cacheKey, appointments, _cacheOptions);
            _logger.LogInformation("Appointments cached for tenant {TenantId}, page {Page}", tenantId, page);
        }
        else
        {
            _logger.LogInformation("Appointments retrieved from cache for tenant {TenantId}, page {Page}", tenantId, page);
        }

        return appointments;
    }

    public async Task<List<Appointment>> GetDoctorAppointmentsAsync(
        Guid doctorId,
        Guid tenantId,
        DateTime? fromDate = null,
        int page = 1,
        int pageSize = 10)
    {
        var cacheKey = $"doctor_appointments_{doctorId}_{tenantId}_{fromDate}_{page}_{pageSize}";

        if (!_cache.TryGetValue(cacheKey, out List<Appointment> appointments))
        {
            appointments = await _appointmentService.GetDoctorAppointmentsAsync(doctorId, tenantId, fromDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            _cache.Set(cacheKey, appointments, _cacheOptions);
            _logger.LogInformation("Doctor appointments cached for {DoctorId}, page {Page}", doctorId, page);
        }
        else
        {
            _logger.LogInformation("Doctor appointments retrieved from cache for {DoctorId}, page {Page}", doctorId, page);
        }

        return appointments;
    }

    public async Task<List<Appointment>> GetPatientAppointmentsAsync(
        Guid patientId,
        Guid tenantId,
        int page = 1,
        int pageSize = 10)
    {
        var cacheKey = $"patient_appointments_{patientId}_{tenantId}_{page}_{pageSize}";

        if (!_cache.TryGetValue(cacheKey, out List<Appointment> appointments))
        {
            appointments = await _appointmentService.GetPatientAppointmentsAsync(patientId, tenantId)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            _cache.Set(cacheKey, appointments, _cacheOptions);
            _logger.LogInformation("Patient appointments cached for {PatientId}, page {Page}", patientId, page);
        }
        else
        {
            _logger.LogInformation("Patient appointments retrieved from cache for {PatientId}, page {Page}", patientId, page);
        }

        return appointments;
    }

    public async Task<Appointment?> GetAppointmentByIdAsync(Guid id, Guid tenantId)
    {
        var cacheKey = $"appointment_{id}_{tenantId}";

        if (!_cache.TryGetValue(cacheKey, out Appointment? appointment))
        {
            appointment = await _appointmentService.GetAppointmentByIdAsync(id, tenantId);

            if (appointment != null)
            {
                _cache.Set(cacheKey, appointment, _cacheOptions);
                _logger.LogInformation("Appointment {Id} cached", id);
            }
        }
        else
        {
            _logger.LogInformation("Appointment {Id} retrieved from cache", id);
        }

        return appointment;
    }

    public async Task<Appointment> CreateAppointmentAsync(Appointment appointment)
    {
        var result = await _appointmentService.CreateAppointmentAsync(appointment);
        await InvalidateAppointmentCacheAsync(appointment);
        return result;
    }

    public async Task<Appointment?> UpdateAppointmentAsync(Appointment appointment)
    {
        var result = await _appointmentService.UpdateAppointmentAsync(appointment);
        await InvalidateAppointmentCacheAsync(appointment);
        return result;
    }

    public async Task<Appointment?> CancelAppointmentAsync(Guid id, Guid tenantId, string reason)
    {
        var result = await _appointmentService.CancelAppointmentAsync(id, tenantId, reason);
        if (result != null)
        {
            await InvalidateAppointmentCacheAsync(result);
        }
        return result;
    }

    public async Task<bool> DeleteAppointmentAsync(Guid id, Guid tenantId)
    {
        var result = await _appointmentService.DeleteAppointmentAsync(id, tenantId);
        if (result)
        {
            _cache.Remove($"appointment_{id}_{tenantId}");
        }
        return result;
    }

    public Task<bool> IsSlotAvailableAsync(Guid doctorId, DateTime appointmentDate, int durationMinutes)
    {
        return _appointmentService.IsSlotAvailableAsync(doctorId, appointmentDate, durationMinutes);
    }

    private async Task InvalidateAppointmentCacheAsync(Appointment appointment)
    {
        // Remove specific appointment cache
        _cache.Remove($"appointment_{appointment.Id}_{appointment.TenantId}");

        // Remove any cached lists that might contain this appointment
        var cacheKeys = new[]
        {
            $"appointments_{appointment.TenantId}",
            $"doctor_appointments_{appointment.DoctorId}_{appointment.TenantId}",
            $"patient_appointments_{appointment.PatientId}_{appointment.TenantId}"
        };

        foreach (var partialKey in cacheKeys)
        {
            var keys = _cache.GetKeys<string>()
                .Where(k => k.StartsWith(partialKey))
                .ToList();

            foreach (var key in keys)
            {
                _cache.Remove(key);
            }
        }
    }
}

public static class MemoryCacheExtensions
{
    public static IEnumerable<string> GetKeys<T>(this IMemoryCache memoryCache)
    {
        var field = typeof(MemoryCache).GetProperty("EntriesCollection", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
        var collection = field?.GetValue(memoryCache) as dynamic;
        var items = new List<string>();
        
        if (collection != null)
        {
            foreach (var item in collection)
            {
                var methodInfo = item.GetType().GetProperty("Key");
                var val = methodInfo.GetValue(item);
                if (val is string key)
                {
                    items.Add(key);
                }
            }
        }
        
        return items;
    }
}
*/