using System.Net;
using System.Text.Json;
using AuthService.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Middleware;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;
    private readonly IWebHostEnvironment _env;

    public ErrorHandlingMiddleware(
        RequestDelegate next,
        ILogger<ErrorHandlingMiddleware> logger,
        IWebHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var problemDetails = new ProblemDetails();

        switch (exception)
        {
            case SlotUnavailableException ex:
                problemDetails.Status = (int)HttpStatusCode.Conflict;
                problemDetails.Title = "Time slot unavailable";
                problemDetails.Detail = ex.Message;
                problemDetails.Type = "https://hospital.api/errors/slot-unavailable";
                _logger.LogWarning(ex, "Time slot conflict for doctor {DoctorId} at {AppointmentDate}", 
                    ex.DoctorId, ex.AppointmentDate);
                break;

            case DoctorNotFoundException ex:
                problemDetails.Status = (int)HttpStatusCode.NotFound;
                problemDetails.Title = "Doctor not found";
                problemDetails.Detail = ex.Message;
                problemDetails.Type = "https://hospital.api/errors/doctor-not-found";
                _logger.LogWarning(ex, "Doctor {DoctorId} not found in tenant {TenantId}", 
                    ex.DoctorId, ex.TenantId);
                break;

            case PatientNotFoundException ex:
                problemDetails.Status = (int)HttpStatusCode.NotFound;
                problemDetails.Title = "Patient not found";
                problemDetails.Detail = ex.Message;
                problemDetails.Type = "https://hospital.api/errors/patient-not-found";
                _logger.LogWarning(ex, "Patient {PatientId} not found in tenant {TenantId}", 
                    ex.PatientId, ex.TenantId);
                break;

            case AppointmentNotFoundException ex:
                problemDetails.Status = (int)HttpStatusCode.NotFound;
                problemDetails.Title = "Appointment not found";
                problemDetails.Detail = ex.Message;
                problemDetails.Type = "https://hospital.api/errors/appointment-not-found";
                _logger.LogWarning(ex, "Appointment {AppointmentId} not found in tenant {TenantId}", 
                    ex.AppointmentId, ex.TenantId);
                break;

            case InvalidAppointmentStateException ex:
                problemDetails.Status = (int)HttpStatusCode.Conflict;
                problemDetails.Title = "Invalid appointment state";
                problemDetails.Detail = ex.Message;
                problemDetails.Type = "https://hospital.api/errors/invalid-appointment-state";
                _logger.LogWarning(ex, "Invalid state transition for appointment {AppointmentId}: {CurrentState} -> {Operation}", 
                    ex.AppointmentId, ex.CurrentState, ex.AttemptedOperation);
                break;

            case AppointmentException ex:
                problemDetails.Status = (int)HttpStatusCode.BadRequest;
                problemDetails.Title = "Appointment error";
                problemDetails.Detail = ex.Message;
                problemDetails.Type = "https://hospital.api/errors/appointment-error";
                _logger.LogWarning(ex, "Appointment error: {Message}", ex.Message);
                break;

            default:
                problemDetails.Status = (int)HttpStatusCode.InternalServerError;
                problemDetails.Title = "An unexpected error occurred";
                problemDetails.Detail = _env.IsDevelopment() ? exception.ToString() : "Internal server error";
                problemDetails.Type = "https://hospital.api/errors/internal-error";
                _logger.LogError(exception, "An unexpected error occurred");
                break;
        }

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = problemDetails.Status.Value;

        return context.Response.WriteAsync(JsonSerializer.Serialize(problemDetails));
    }
}