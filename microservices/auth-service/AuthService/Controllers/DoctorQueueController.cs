using AuthService.Authorization;
using AuthService.Models.Domain;
using AuthService.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers;

/// <summary>
/// Doctor-specific queue management endpoints
/// </summary>
[ApiController]
[Route("api/Queue")]
[Authorize]
public class DoctorQueueController : ControllerBase
{
    private readonly IDoctorQueueService _doctorQueueService;
    private readonly IExaminationDraftService _draftService;
    private readonly IOptometryService _optometryService;
    private readonly ILogger<DoctorQueueController> _logger;

    public DoctorQueueController(
        IDoctorQueueService doctorQueueService,
        IExaminationDraftService draftService,
        IOptometryService optometryService,
        ILogger<DoctorQueueController> logger)
    {
        _doctorQueueService = doctorQueueService;
        _draftService = draftService;
        _optometryService = optometryService;
        _logger = logger;
    }

    /// <summary>
    /// Get doctor's patient queue with mixed priority algorithm
    /// </summary>
    [HttpGet("doctor")]
    [RequirePermission("queue.view")]
    public async Task<ActionResult<List<QueueItem>>> GetDoctorQueue([FromQuery] string? date = null)
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized("Tenant ID not found");

        try
        {
            var queue = await _doctorQueueService.GetDoctorQueueAsync(Guid.Parse(tenantId), date);
            return Ok(queue);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving doctor queue");
            return StatusCode(500, "Failed to retrieve queue");
        }
    }

    /// <summary>
    /// Get today's queue statistics for doctor
    /// </summary>
    [HttpGet("doctor/stats/{doctorId}")]
    [RequirePermission("queue.view")]
    public async Task<ActionResult<object>> GetDoctorStats(Guid doctorId)
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        try
        {
            var stats = await _doctorQueueService.GetDoctorStatsAsync(doctorId, Guid.Parse(tenantId));
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving doctor stats for {DoctorId}", doctorId);
            return StatusCode(500, "Failed to retrieve statistics");
        }
    }

    /// <summary>
    /// Call next patient by priority
    /// </summary>
    [HttpPost("doctor/call-next")]
    [RequirePermission("queue.manage")]
    public async Task<ActionResult<QueueItem>> CallNextPatient([FromBody] CallNextRequest request)
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        try
        {
            var nextPatient = await _doctorQueueService.CallNextPatientAsync(request.DoctorId, Guid.Parse(tenantId));
            
            if (nextPatient == null)
            {
                return NotFound("No patients waiting in queue");
            }

            return Ok(nextPatient);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling next patient");
            return StatusCode(500, "Failed to call next patient");
        }
    }

    /// <summary>
    /// Start consultation for a patient
    /// </summary>
    [HttpPost("{queueItemId}/start-consultation")]
    [RequirePermission("queue.manage")]
    public async Task<ActionResult<QueueItem>> StartConsultation(Guid queueItemId, [FromBody] ConsultationRequest request)
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        try
        {
            var queueItem = await _doctorQueueService.StartConsultationAsync(queueItemId, request.DoctorId, Guid.Parse(tenantId));
            
            if (queueItem == null)
            {
                return NotFound($"Queue item {queueItemId} not found");
            }

            return Ok(queueItem);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting consultation for queue item {QueueItemId}", queueItemId);
            return StatusCode(500, "Failed to start consultation");
        }
    }

    /// <summary>
    /// Complete consultation
    /// </summary>
    [HttpPost("{queueItemId}/complete-consultation")]
    [RequirePermission("queue.manage")]
    public async Task<ActionResult<QueueItem>> CompleteConsultation(Guid queueItemId)
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        try
        {
            var queueItem = await _doctorQueueService.CompleteConsultationAsync(queueItemId, Guid.Parse(tenantId));
            
            if (queueItem == null)
            {
                return NotFound($"Queue item {queueItemId} not found");
            }

            return Ok(queueItem);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error completing consultation for queue item {QueueItemId}", queueItemId);
            return StatusCode(500, "Failed to complete consultation");
        }
    }

    /// <summary>
    /// Skip patient with reason
    /// </summary>
    [HttpPost("{queueItemId}/skip")]
    [RequirePermission("queue.manage")]
    public async Task<ActionResult<QueueItem>> SkipPatient(Guid queueItemId, [FromBody] SkipPatientRequest request)
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        try
        {
            var queueItem = await _doctorQueueService.SkipPatientAsync(queueItemId, request.Reason, Guid.Parse(tenantId));
            
            if (queueItem == null)
            {
                return NotFound($"Queue item {queueItemId} not found");
            }

            return Ok(queueItem);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error skipping patient for queue item {QueueItemId}", queueItemId);
            return StatusCode(500, "Failed to skip patient");
        }
    }

    /// <summary>
    /// Refer patient to specialist
    /// </summary>
    [HttpPost("{queueItemId}/refer-specialist")]
    [RequirePermission("queue.manage")]
    public async Task<ActionResult<QueueItem>> ReferToSpecialist(Guid queueItemId, [FromBody] ReferToSpecialistRequest request)
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        try
        {
            var queueItem = await _doctorQueueService.ReferToSpecialistAsync(
                queueItemId, 
                request.SpecialistId, 
                request.Notes, 
                Guid.Parse(tenantId));
            
            if (queueItem == null)
            {
                return NotFound($"Queue item {queueItemId} not found");
            }

            return Ok(queueItem);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error referring patient to specialist for queue item {QueueItemId}", queueItemId);
            return StatusCode(500, "Failed to refer to specialist");
        }
    }

    /// <summary>
    /// Refer patient to imaging (OCT, VF, etc.)
    /// </summary>
    [HttpPost("{queueItemId}/refer-imaging")]
    [RequirePermission("queue.manage")]
    public async Task<ActionResult<QueueItem>> ReferToImaging(Guid queueItemId, [FromBody] ReferToImagingRequest request)
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        try
        {
            var queueItem = await _doctorQueueService.ReferToImagingAsync(
                queueItemId, 
                request.InvestigationType, 
                Guid.Parse(tenantId));
            
            if (queueItem == null)
            {
                return NotFound($"Queue item {queueItemId} not found");
            }

            return Ok(queueItem);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error referring patient to imaging for queue item {QueueItemId}", queueItemId);
            return StatusCode(500, "Failed to refer to imaging");
        }
    }

    /// <summary>
    /// Refer patient to optical counselor
    /// </summary>
    [HttpPost("{queueItemId}/refer-counselor")]
    [RequirePermission("queue.manage")]
    public async Task<ActionResult<QueueItem>> ReferToCounselor(Guid queueItemId, [FromBody] ReferToCounselorRequest request)
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        try
        {
            var queueItem = await _doctorQueueService.ReferToCounselorAsync(
                queueItemId, 
                request.Reason, 
                Guid.Parse(tenantId));
            
            if (queueItem == null)
            {
                return NotFound($"Queue item {queueItemId} not found");
            }

            return Ok(queueItem);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error referring patient to counselor for queue item {QueueItemId}", queueItemId);
            return StatusCode(500, "Failed to refer to counselor");
        }
    }
}

// DTOs for requests
public class CallNextRequest
{
    public Guid DoctorId { get; set; }
}

public class ConsultationRequest
{
    public Guid DoctorId { get; set; }
}

public class SkipPatientRequest
{
    public string Reason { get; set; } = "";
}

public class ReferToSpecialistRequest
{
    public Guid SpecialistId { get; set; }
    public string Notes { get; set; } = "";
}

public class ReferToImagingRequest
{
    public string InvestigationType { get; set; } = ""; // OCT, VF, etc.
}

public class ReferToCounselorRequest
{
    public string Reason { get; set; } = "";
}
