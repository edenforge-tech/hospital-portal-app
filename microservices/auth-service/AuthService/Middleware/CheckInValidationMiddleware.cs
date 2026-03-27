using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using AuthService.Context;

namespace AuthService.Middleware;

/// <summary>
/// Middleware to enforce check-in requirements for clinical endpoints.
/// Blocks access to examinations, prescriptions, and lab reports if patient is not checked in.
/// Supports emergency override via X-Emergency-Override header.
/// </summary>
public class CheckInValidationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<CheckInValidationMiddleware> _logger;

    // Endpoints that require check-in validation
    private static readonly HashSet<string> RestrictedEndpoints = new(StringComparer.OrdinalIgnoreCase)
    {
        "/api/examinations",
        "/api/prescriptions",
        "/api/labreports",
        "/api/clinical-examinations"
    };

    public CheckInValidationMiddleware(RequestDelegate next, ILogger<CheckInValidationMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, AppDbContext dbContext)
    {
        var path = context.Request.Path.Value ?? string.Empty;
        var method = context.Request.Method;

        // Only validate POST, PUT, PATCH requests to restricted endpoints
        if (!IsRestrictedEndpoint(path) || !IsModifyingRequest(method))
        {
            await _next(context);
            return;
        }

        // Check for emergency override header
        if (context.Request.Headers.TryGetValue("X-Emergency-Override", out var overrideHeader))
        {
            var overrideReason = overrideHeader.ToString();
            if (!string.IsNullOrWhiteSpace(overrideReason) && overrideReason.Length >= 10)
            {
                // Log the emergency override
                await LogEmergencyOverride(context, dbContext, overrideReason, path);
                await _next(context);
                return;
            }
        }

        // Extract patient ID from request body or query parameters
        var patientId = await ExtractPatientId(context);

        if (string.IsNullOrEmpty(patientId))
        {
            _logger.LogWarning("Check-in validation skipped: No patient ID found in request to {Path}", path);
            await _next(context);
            return;
        }

        // Validate check-in status
        var isCheckedIn = await IsPatientCheckedIn(dbContext, patientId);

        if (!isCheckedIn)
        {
            _logger.LogWarning("Access denied: Patient {PatientId} not checked in for endpoint {Path}", patientId, path);
            
            // Log the enforcement attempt
            await LogEnforcementAttempt(context, dbContext, patientId, path);

            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.ContentType = "application/json";

            var errorResponse = new
            {
                error = "CheckInRequired",
                message = "Patient must be checked in before accessing this clinical service.",
                patientId = patientId,
                endpoint = path,
                timestamp = DateTime.UtcNow,
                emergencyOverrideAvailable = true,
                emergencyOverrideInstructions = "Authorized users can bypass this requirement by including 'X-Emergency-Override' header with a detailed reason (minimum 10 characters)."
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(errorResponse, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            }));

            return;
        }

        // Patient is checked in, proceed with the request
        await _next(context);
    }

    private bool IsRestrictedEndpoint(string path)
    {
        return RestrictedEndpoints.Any(endpoint => path.StartsWith(endpoint, StringComparison.OrdinalIgnoreCase));
    }

    private bool IsModifyingRequest(string method)
    {
        return method == HttpMethods.Post || 
               method == HttpMethods.Put || 
               method == HttpMethods.Patch;
    }

    private async Task<string?> ExtractPatientId(HttpContext context)
    {
        // Try query parameter first
        if (context.Request.Query.TryGetValue("patientId", out var queryPatientId))
        {
            return queryPatientId.ToString();
        }

        // Try route parameter
        if (context.Request.RouteValues.TryGetValue("patientId", out var routePatientId))
        {
            return routePatientId?.ToString();
        }

        // Try reading from request body (for POST/PUT requests)
        if (context.Request.ContentType?.Contains("application/json") == true && context.Request.Body.CanSeek)
        {
            context.Request.EnableBuffering();
            var body = await new StreamReader(context.Request.Body).ReadToEndAsync();
            context.Request.Body.Position = 0;

            try
            {
                var jsonDocument = JsonDocument.Parse(body);
                if (jsonDocument.RootElement.TryGetProperty("patientId", out var patientIdElement))
                {
                    return patientIdElement.GetString();
                }
                if (jsonDocument.RootElement.TryGetProperty("patient_id", out var patientIdSnakeCase))
                {
                    return patientIdSnakeCase.GetString();
                }
            }
            catch (JsonException ex)
            {
                _logger.LogWarning(ex, "Failed to parse request body as JSON for patient ID extraction");
            }
        }

        return null;
    }

    private async Task<bool> IsPatientCheckedIn(AppDbContext dbContext, string patientId)
    {
        try
        {
            // Check if patient has an active visit (checked in today)
            var today = DateTime.UtcNow.Date;
            var hasActiveVisit = await dbContext.Set<dynamic>()
                .FromSqlRaw(@"
                    SELECT 1 
                    FROM visits 
                    WHERE patient_id = {0}::uuid 
                      AND checked_in_at::date = {1}
                      AND completed_at IS NULL
                      AND deleted_at IS NULL
                    LIMIT 1", patientId, today)
                .AnyAsync();

            return hasActiveVisit;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking patient check-in status for patient {PatientId}", patientId);
            // In case of error, allow the request to proceed (fail-open for availability)
            return true;
        }
    }

    private async Task LogEmergencyOverride(HttpContext context, AppDbContext dbContext, string reason, string endpoint)
    {
        try
        {
            var userId = context.User?.FindFirst("sub")?.Value ?? 
                        context.User?.FindFirst("userId")?.Value ?? 
                        "unknown";

            var userRole = context.User?.FindFirst("role")?.Value ?? "unknown";

            _logger.LogWarning(
                "EMERGENCY OVERRIDE: User {UserId} (Role: {UserRole}) bypassed check-in requirement. Endpoint: {Endpoint}, Reason: {Reason}",
                userId, userRole, endpoint, reason);

            // TODO: Insert into audit_log table when implemented
            // await dbContext.Database.ExecuteSqlRawAsync(@"
            //     INSERT INTO audit_log (user_id, action, resource_type, resource_id, details, created_at)
            //     VALUES ({0}::uuid, 'EMERGENCY_OVERRIDE', 'CHECK_IN_GATE', {1}, {2}, NOW())",
            //     userId, endpoint, JsonSerializer.Serialize(new { reason, userRole }));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log emergency override");
        }
    }

    private async Task LogEnforcementAttempt(HttpContext context, AppDbContext dbContext, string patientId, string endpoint)
    {
        try
        {
            var userId = context.User?.FindFirst("sub")?.Value ?? 
                        context.User?.FindFirst("userId")?.Value ?? 
                        "anonymous";

            _logger.LogInformation(
                "CHECK-IN ENFORCEMENT: Blocked access to {Endpoint} for patient {PatientId} by user {UserId}",
                endpoint, patientId, userId);

            // TODO: Insert into audit_log table when implemented
            // await dbContext.Database.ExecuteSqlRawAsync(@"
            //     INSERT INTO audit_log (user_id, action, resource_type, resource_id, details, created_at)
            //     VALUES ({0}::uuid, 'CHECK_IN_GATE_BLOCKED', 'PATIENT', {1}::uuid, {2}, NOW())",
            //     userId, patientId, JsonSerializer.Serialize(new { endpoint }));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log enforcement attempt");
        }
    }
}
