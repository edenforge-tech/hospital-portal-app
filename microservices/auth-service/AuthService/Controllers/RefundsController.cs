using System;
using System.Threading.Tasks;
using AuthService.Authorization;
using AuthService.Models.Domain;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace AuthService.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class RefundsController : ControllerBase
    {
        private readonly IRefundService _refundService;
        private readonly ILogger<RefundsController> _logger;

        public RefundsController(IRefundService refundService, ILogger<RefundsController> logger)
        {
            _refundService = refundService;
            _logger = logger;
        }

        /// <summary>
        /// Request a refund for an OPD bill
        /// </summary>
        [HttpPost("request")]
        [RequirePermission("opd_bill.refund")]
        public async Task<ActionResult<Refund>> RequestRefund([FromBody] RefundRequest request)
        {
            try
            {
                var userIdClaim = User.FindFirst("user_id")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "Invalid user claims" });
                }

                var refund = await _refundService.RequestRefundAsync(
                    request.BillId,
                    request.Amount,
                    request.Reason,
                    userId
                );

                return Ok(refund);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error requesting refund");
                return StatusCode(500, new { message = "Error requesting refund", error = ex.Message });
            }
        }

        /// <summary>
        /// Get refund by ID
        /// </summary>
        [HttpGet("{id:guid}")]
        [RequirePermission("opd_bill.view")]
        public async Task<ActionResult<Refund>> GetRefundById(Guid id)
        {
            try
            {
                var refund = await _refundService.GetRefundByIdAsync(id);
                if (refund == null)
                {
                    return NotFound(new { message = "Refund not found" });
                }
                return Ok(refund);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting refund {RefundId}", id);
                return StatusCode(500, new { message = "Error retrieving refund", error = ex.Message });
            }
        }

        /// <summary>
        /// Get all refunds for a bill
        /// </summary>
        [HttpGet("bill/{billId:guid}")]
        [RequirePermission("opd_bill.view")]
        public async Task<ActionResult> GetRefundsByBillId(Guid billId)
        {
            try
            {
                var refunds = await _refundService.GetRefundsByBillIdAsync(billId);
                return Ok(refunds);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting refunds for bill {BillId}", billId);
                return StatusCode(500, new { message = "Error retrieving refunds", error = ex.Message });
            }
        }

        /// <summary>
        /// Get all refunds for a patient
        /// </summary>
        [HttpGet("patient/{patientId:guid}")]
        [RequirePermission("patient.view")]
        public async Task<ActionResult> GetRefundsByPatientId(Guid patientId)
        {
            try
            {
                var refunds = await _refundService.GetRefundsByPatientIdAsync(patientId);
                return Ok(refunds);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting refunds for patient {PatientId}", patientId);
                return StatusCode(500, new { message = "Error retrieving refunds", error = ex.Message });
            }
        }

        /// <summary>
        /// Get pending refunds for authorization
        /// </summary>
        [HttpGet("pending")]
        [RequirePermission("opd_bill.refund.authorize")]
        public async Task<ActionResult> GetPendingRefunds()
        {
            try
            {
                var tenantIdClaim = User.FindFirst("tenant_id")?.Value;
                if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var tenantId))
                {
                    return Unauthorized(new { message = "Invalid tenant claims" });
                }

                var refunds = await _refundService.GetPendingRefundsAsync(tenantId);
                return Ok(refunds);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting pending refunds");
                return StatusCode(500, new { message = "Error retrieving pending refunds", error = ex.Message });
            }
        }

        /// <summary>
        /// Authorize or reject a refund
        /// </summary>
        [HttpPost("{id:guid}/authorize")]
        [RequirePermission("opd_bill.refund.authorize")]
        public async Task<ActionResult<Refund>> AuthorizeRefund(Guid id, [FromBody] RefundAuthorizationRequest request)
        {
            try
            {
                var userIdClaim = User.FindFirst("user_id")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "Invalid user claims" });
                }

                var refund = await _refundService.AuthorizeRefundAsync(
                    id,
                    request.Approved,
                    userId,
                    request.Notes
                );

                return Ok(refund);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error authorizing refund {RefundId}", id);
                return StatusCode(500, new { message = "Error authorizing refund", error = ex.Message });
            }
        }

        /// <summary>
        /// Complete refund processing
        /// </summary>
        [HttpPost("{id:guid}/complete")]
        [RequirePermission("opd_bill.refund")]
        public async Task<ActionResult<Refund>> CompleteRefund(Guid id, [FromBody] RefundCompletionRequest request)
        {
            try
            {
                var refund = await _refundService.CompleteRefundAsync(
                    id,
                    request.RefundMode,
                    request.Notes
                );

                return Ok(refund);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error completing refund {RefundId}", id);
                return StatusCode(500, new { message = "Error completing refund", error = ex.Message });
            }
        }

        /// <summary>
        /// Get refund statistics for tenant
        /// </summary>
        [HttpGet("statistics")]
        [RequirePermission("opd_bill.view")]
        public async Task<ActionResult<RefundStatistics>> GetRefundStatistics([FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
        {
            try
            {
                var tenantIdClaim = User.FindFirst("tenant_id")?.Value;
                if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var tenantId))
                {
                    return Unauthorized(new { message = "Invalid tenant claims" });
                }

                var stats = await _refundService.GetRefundStatisticsAsync(tenantId, fromDate, toDate);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting refund statistics");
                return StatusCode(500, new { message = "Error retrieving refund statistics", error = ex.Message });
            }
        }
    }

    // Request DTOs
    public class RefundRequest
    {
        public Guid BillId { get; set; }
        public decimal Amount { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    public class RefundAuthorizationRequest
    {
        public bool Approved { get; set; }
        public string? Notes { get; set; }
    }

    public class RefundCompletionRequest
    {
        public string RefundMode { get; set; } = string.Empty; // cash, card, upi, bank_transfer
        public string? Notes { get; set; }
    }
}
