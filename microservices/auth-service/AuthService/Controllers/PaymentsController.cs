using System;
using System.Security.Claims;
using System.Threading.Tasks;
using AuthService.Models.Counselor;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers
{
    [Route("api/payments")]
    [ApiController]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentProcessingService _paymentService;

        public PaymentsController(IPaymentProcessingService paymentService)
        {
            _paymentService = paymentService;
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

        // ==================== Payment Transactions ====================

        [HttpGet]
        public async Task<IActionResult> GetAllPayments([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] Guid? sessionId = null)
        {
            try
            {
                var result = await _paymentService.GetAllPaymentsAsync(page, pageSize, sessionId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ERROR in GetAllPayments: {ex.Message}");
                Console.WriteLine($"   Stack Trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"   Inner Exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, new { error = ex.Message, details = ex.InnerException?.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPaymentById(Guid id)
        {
            var payment = await _paymentService.GetPaymentByIdAsync(id);
            return payment != null ? Ok(payment) : NotFound();
        }

        [HttpGet("transaction/{transactionNumber}")]
        public async Task<IActionResult> GetPaymentByTransactionNumber(string transactionNumber)
        {
            var payment = await _paymentService.GetPaymentByTransactionNumberAsync(transactionNumber);
            return payment != null ? Ok(payment) : NotFound();
        }

        [HttpPost]
        public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var tenantId = GetTenantId();
                var payment = await _paymentService.CreatePaymentAsync(request, tenantId, userId);
                return CreatedAtAction(nameof(GetPaymentById), new { id = payment.Id }, payment);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("{id}/process")]
        public async Task<IActionResult> ProcessPayment(Guid id, [FromBody] ProcessPaymentRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var payment = await _paymentService.ProcessPaymentAsync(id, request, userId);
                return Ok(payment);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("{id}/refund")]
        public async Task<IActionResult> ProcessRefund(Guid id, [FromBody] RefundPaymentRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var payment = await _paymentService.ProcessRefundAsync(id, request, userId);
                return Ok(payment);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePayment(Guid id)
        {
            var result = await _paymentService.DeletePaymentAsync(id);
            return result ? NoContent() : NotFound();
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetPaymentSummary([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate, [FromQuery] Guid? branchId)
        {
            var summary = await _paymentService.GetPaymentSummaryAsync(startDate, endDate, branchId);
            return Ok(summary);
        }

        // ==================== Payment Links ====================

        [HttpPost("links")]
        public async Task<IActionResult> GeneratePaymentLink([FromBody] CreatePaymentLinkRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var tenantId = GetTenantId();
                var link = await _paymentService.GeneratePaymentLinkAsync(request, tenantId, userId);
                return CreatedAtAction(nameof(GetPaymentLinkById), new { id = link.Id }, link);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("links/{id}")]
        public async Task<IActionResult> GetPaymentLinkById(Guid id)
        {
            var link = await _paymentService.GetPaymentLinkByIdAsync(id);
            return link != null ? Ok(link) : NotFound();
        }

        [HttpGet("links/{id}/status")]
        public async Task<IActionResult> GetPaymentLinkStatus(Guid id)
        {
            try
            {
                var status = await _paymentService.GetPaymentLinkStatusAsync(id);
                return Ok(status);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("links/{id}/expire")]
        public async Task<IActionResult> ExpirePaymentLink(Guid id)
        {
            var result = await _paymentService.ExpirePaymentLinkAsync(id);
            return result ? Ok(new { message = "Payment link expired successfully" }) : NotFound();
        }

        // ==================== Government Scheme Claims ====================

        [HttpGet("gov-claims")]
        public async Task<IActionResult> GetAllGovernmentClaims([FromQuery] Guid? sessionId, [FromQuery] string? schemeType)
        {
            var claims = await _paymentService.GetAllGovernmentClaimsAsync(sessionId, schemeType);
            return Ok(claims);
        }

        [HttpGet("gov-claims/{id}")]
        public async Task<IActionResult> GetGovernmentClaimById(Guid id)
        {
            var claim = await _paymentService.GetGovernmentClaimByIdAsync(id);
            return claim != null ? Ok(claim) : NotFound();
        }

        [HttpPost("gov-claims")]
        public async Task<IActionResult> CreateGovernmentClaim([FromBody] CreateGovernmentClaimRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var tenantId = GetTenantId();
                var claim = await _paymentService.CreateGovernmentClaimAsync(request, tenantId, userId);
                return CreatedAtAction(nameof(GetGovernmentClaimById), new { id = claim.Id }, claim);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("gov-claims/{id}/submit")]
        public async Task<IActionResult> SubmitGovernmentClaim(Guid id, [FromBody] SubmitGovernmentClaimRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var claim = await _paymentService.SubmitGovernmentClaimAsync(id, request, userId);
                return Ok(claim);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("gov-claims/{id}/approve")]
        public async Task<IActionResult> ProcessClaimApproval(Guid id, [FromBody] ProcessClaimApprovalRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var claim = await _paymentService.ProcessClaimApprovalAsync(id, request, userId);
                return Ok(claim);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("gov-claims/{id}/payment-received")]
        public async Task<IActionResult> RecordClaimPayment(Guid id, [FromBody] ClaimPaymentReceivedRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var claim = await _paymentService.RecordClaimPaymentAsync(id, request, userId);
                return Ok(claim);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpDelete("gov-claims/{id}")]
        public async Task<IActionResult> DeleteGovernmentClaim(Guid id)
        {
            var result = await _paymentService.DeleteGovernmentClaimAsync(id);
            return result ? NoContent() : NotFound();
        }
    }
}
