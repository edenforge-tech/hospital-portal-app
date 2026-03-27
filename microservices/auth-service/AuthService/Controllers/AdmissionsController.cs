using System;
using System.Security.Claims;
using System.Threading.Tasks;
using AuthService.Models.Counselor;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers
{
    [Route("api/admissions")]
    [ApiController]
    [Authorize]
    public class AdmissionsController : ControllerBase
    {
        private readonly IAdmissionManagementService _admissionService;

        public AdmissionsController(IAdmissionManagementService admissionService)
        {
            _admissionService = admissionService;
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
        }

        private Guid GetTenantId()
        {
            var tenantIdClaim = User.FindFirst("TenantId")?.Value 
                             ?? User.FindFirst("tenant_id")?.Value;
            
            if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var tenantId))
            {
                throw new UnauthorizedAccessException("Tenant ID not found in user claims");
            }
            
            return tenantId;
        }

        // ==================== Patient Admissions ====================

        [HttpGet]
        public async Task<IActionResult> GetAllAdmissions([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] Guid? sessionId = null, [FromQuery] string? admissionType = null)
        {
            var result = await _admissionService.GetAllAdmissionsAsync(page, pageSize, sessionId, admissionType);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAdmissionById(Guid id)
        {
            var admission = await _admissionService.GetAdmissionByIdAsync(id);
            return admission != null ? Ok(admission) : NotFound();
        }

        [HttpPost]
        public async Task<IActionResult> CreateAdmission([FromBody] CreateAdmissionRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var tenantId = GetTenantId();
                var admission = await _admissionService.CreateAdmissionAsync(request, tenantId, userId);
                return CreatedAtAction(nameof(GetAdmissionById), new { id = admission.Id }, admission);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAdmission(Guid id, [FromBody] UpdateAdmissionRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var admission = await _admissionService.UpdateAdmissionAsync(id, request, userId);
                return Ok(admission);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("{id}/assign-bed")]
        public async Task<IActionResult> AssignBed(Guid id, [FromBody] AssignBedRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var admission = await _admissionService.AssignBedAsync(id, request, userId);
                return Ok(admission);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("{id}/discharge")]
        public async Task<IActionResult> DischargeAdmission(Guid id, [FromBody] DischargeAdmissionRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var admission = await _admissionService.DischargeAdmissionAsync(id, request, userId);
                return Ok(admission);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> CancelAdmission(Guid id, [FromBody] string cancellationReason)
        {
            try
            {
                var userId = GetCurrentUserId();
                var admission = await _admissionService.CancelAdmissionAsync(id, cancellationReason, userId);
                return Ok(admission);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAdmission(Guid id)
        {
            var result = await _admissionService.DeleteAdmissionAsync(id);
            return result ? NoContent() : NotFound();
        }

        // ==================== Bed Reservations ====================

        [HttpPost("bed-reservations")]
        public async Task<IActionResult> CreateBedReservation([FromBody] CreateBedReservationRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var tenantId = GetTenantId();
                var reservation = await _admissionService.CreateBedReservationAsync(request, tenantId, userId);
                return CreatedAtAction(nameof(GetAdmissionById), new { id = reservation.Id }, reservation);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("bed-reservations/{id}/release")]
        public async Task<IActionResult> ReleaseBedReservation(Guid id)
        {
            var result = await _admissionService.ReleaseBedReservationAsync(id);
            return result ? Ok(new { message = "Bed released successfully" }) : NotFound();
        }

        [HttpGet("available-beds")]
        public async Task<IActionResult> GetAvailableBeds([FromQuery] DateTime date, [FromQuery] string? bedType = null)
        {
            var beds = await _admissionService.GetAvailableBedsAsync(date, bedType);
            return Ok(beds);
        }
    }
}
