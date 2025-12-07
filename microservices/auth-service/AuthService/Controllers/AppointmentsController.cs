using AuthService.Authorization;
using AuthService.Models.Domain;
using AuthService.Models.Domain.Dtos;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentService _appointmentService;
    private readonly ILogger<AppointmentsController> _logger;

    public AppointmentsController(
        IAppointmentService appointmentService,
        ILogger<AppointmentsController> logger)
    {
        _appointmentService = appointmentService;
        _logger = logger;
    }

    [HttpGet]
    [RequirePermission("appointment.view")]
    public async Task<ActionResult<PagedResult<AppointmentResponse>>> GetAllAppointments(
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        var result = await _appointmentService.GetAllAppointmentsAsync(
            Guid.Parse(tenantId), fromDate, toDate, status, page, pageSize);
        
        return Ok(new PagedResult<AppointmentResponse>
        {
            Items = result.Items.Select(a => MapToResponse(a)),
            TotalCount = result.TotalCount,
            CurrentPage = result.CurrentPage,
            PageSize = result.PageSize
        });
    }

    [HttpGet("doctor/{doctorId}")]
    [RequirePermission("appointment.view")]
    public async Task<ActionResult<PagedResult<AppointmentResponse>>> GetDoctorAppointments(
        Guid doctorId,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        var result = await _appointmentService.GetDoctorAppointmentsAsync(
            doctorId, Guid.Parse(tenantId), fromDate, toDate, status, page, pageSize);
        
        return Ok(new PagedResult<AppointmentResponse>
        {
            Items = result.Items.Select(a => MapToResponse(a)),
            TotalCount = result.TotalCount,
            CurrentPage = result.CurrentPage,
            PageSize = result.PageSize
        });
    }

    [HttpGet("patient/{patientId}")]
    [RequirePermission("appointment.view")]
    public async Task<ActionResult<PagedResult<AppointmentResponse>>> GetPatientAppointments(
        Guid patientId,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        var result = await _appointmentService.GetPatientAppointmentsAsync(
            patientId, Guid.Parse(tenantId), fromDate, toDate, status, page, pageSize);
        
        return Ok(new PagedResult<AppointmentResponse>
        {
            Items = result.Items.Select(a => MapToResponse(a)),
            TotalCount = result.TotalCount,
            CurrentPage = result.CurrentPage,
            PageSize = result.PageSize
        });
    }

    [HttpGet("{id}")]
    [RequirePermission("appointment.view")]
    public async Task<ActionResult<AppointmentResponse>> GetAppointment(Guid id)
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        var appointment = await _appointmentService.GetAppointmentByIdAsync(id, Guid.Parse(tenantId));
        if (appointment == null) return NotFound();

        return Ok(MapToResponse(appointment));
    }

    [HttpPost]
    [RequirePermission("appointment.create")]
    public async Task<ActionResult<AppointmentResponse>> CreateAppointment([FromBody] CreateAppointmentRequest request)
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        var appointment = new Appointment
        {
            TenantId = Guid.Parse(tenantId),
            PatientId = request.PatientId,
            DoctorId = request.DoctorId,
            AppointmentDate = request.AppointmentDate,
            AppointmentType = request.AppointmentType,
            DurationMinutes = request.DurationMinutes,
            Notes = request.Notes,
            Status = "Scheduled"
        };

        try
        {
            var createdAppointment = await _appointmentService.CreateAppointmentAsync(appointment);
            return CreatedAtAction(
                nameof(GetAppointment), 
                new { id = createdAppointment.Id }, 
                MapToResponse(createdAppointment));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [RequirePermission("appointment.update")]
    public async Task<ActionResult<AppointmentResponse>> UpdateAppointment(
        Guid id,
        [FromBody] UpdateAppointmentRequest request)
    {
        if (id != request.Id) return BadRequest();

        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        var existingAppointment = await _appointmentService.GetAppointmentByIdAsync(id, Guid.Parse(tenantId));
        if (existingAppointment == null) return NotFound();

        existingAppointment.AppointmentDate = request.AppointmentDate;
        existingAppointment.AppointmentType = request.AppointmentType;
        existingAppointment.DurationMinutes = request.DurationMinutes;
        existingAppointment.Notes = request.Notes;

        try
        {
            var updatedAppointment = await _appointmentService.UpdateAppointmentAsync(existingAppointment);
            return Ok(MapToResponse(updatedAppointment!));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/cancel")]
    [RequirePermission("appointment.cancel")]
    public async Task<ActionResult<AppointmentResponse>> CancelAppointment(
        Guid id,
        [FromBody] CancelAppointmentRequest request)
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        var cancelledAppointment = await _appointmentService.CancelAppointmentAsync(
            id, Guid.Parse(tenantId), request.CancellationReason);

        if (cancelledAppointment == null) return NotFound();

        return Ok(MapToResponse(cancelledAppointment));
    }

    [HttpDelete("{id}")]
    [RequirePermission("appointment.delete")]
    public async Task<ActionResult> DeleteAppointment(Guid id)
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        var result = await _appointmentService.DeleteAppointmentAsync(id, Guid.Parse(tenantId));
        if (!result) return NotFound();

        return NoContent();
    }

    private static AppointmentResponse MapToResponse(Appointment appointment)
    {
        return new AppointmentResponse
        {
            Id = appointment.Id,
            PatientId = appointment.PatientId,
            PatientName = appointment.Patient != null 
                ? $"{appointment.Patient.FirstName} {appointment.Patient.LastName}"
                : "Unknown Patient",
            DoctorId = appointment.DoctorId,
            DoctorName = appointment.Doctor != null
                ? $"Dr. {appointment.Doctor.FirstName} {appointment.Doctor.LastName}"
                : "Unknown Doctor",
            AppointmentDate = appointment.AppointmentDate,
            AppointmentType = appointment.AppointmentType,
            DurationMinutes = appointment.DurationMinutes,
            Status = appointment.Status,
            Notes = appointment.Notes,
            CancellationReason = appointment.CancellationReason,
            ReminderSent = appointment.ReminderSent,
            CreatedAt = appointment.CreatedAt,
            UpdatedAt = appointment.UpdatedAt
        };
    }
}