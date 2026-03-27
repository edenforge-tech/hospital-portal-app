using AuthService.Models.PerformanceReview;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace AuthService.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PerformanceReviewController : ControllerBase
    {
        private readonly IPerformanceReviewService _service;
        private readonly ILogger<PerformanceReviewController> _logger;

        public PerformanceReviewController(IPerformanceReviewService service, ILogger<PerformanceReviewController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpPost]
        public async Task<ActionResult<PerformanceReviewDto>> CreateReview([FromBody] CreatePerformanceReviewRequest request)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException());
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());

                var result = await _service.CreateReviewAsync(request, tenantId, userId);
                return CreatedAtAction(nameof(GetReview), new { id = result.Id }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating performance review");
                return StatusCode(500, new { error = "An error occurred while creating the review" });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PerformanceReviewDto>> GetReview(Guid id)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException());
                var review = await _service.GetReviewByIdAsync(id, tenantId);

                if (review == null)
                    return NotFound(new { error = "Review not found" });

                return Ok(review);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving review {ReviewId}", id);
                return StatusCode(500, new { error = "An error occurred while retrieving the review" });
            }
        }

        [HttpGet("employee/{employeeId}")]
        public async Task<ActionResult> GetReviewsByEmployee(Guid employeeId)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException());
                var reviews = await _service.GetReviewsByEmployeeIdAsync(employeeId, tenantId);
                return Ok(reviews);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving reviews for employee {EmployeeId}", employeeId);
                return StatusCode(500, new { error = "An error occurred while retrieving reviews" });
            }
        }

        [HttpGet("pending")]
        public async Task<ActionResult> GetPendingReviews([FromQuery] Guid? reviewerId = null)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException());
                var reviews = await _service.GetPendingReviewsAsync(tenantId, reviewerId);
                return Ok(reviews);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving pending reviews");
                return StatusCode(500, new { error = "An error occurred while retrieving pending reviews" });
            }
        }

        [HttpPut("{id}/scores")]
        public async Task<ActionResult<PerformanceReviewDto>> UpdateScores(Guid id, [FromBody] UpdateReviewScoresRequest request)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException());
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());

                var result = await _service.UpdateReviewScoresAsync(id, request, tenantId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating review scores {ReviewId}", id);
                return StatusCode(500, new { error = "An error occurred while updating scores" });
            }
        }

        [HttpPost("{id}/submit")]
        public async Task<ActionResult<PerformanceReviewDto>> SubmitForApproval(Guid id, [FromBody] SubmitForApprovalRequest request)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException());
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());

                var result = await _service.SubmitForApprovalAsync(id, request, tenantId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting review {ReviewId} for approval", id);
                return StatusCode(500, new { error = "An error occurred while submitting for approval" });
            }
        }

        [HttpPost("{id}/approve")]
        public async Task<ActionResult<PerformanceReviewDto>> ApproveReview(Guid id, [FromBody] ApproveReviewRequest request)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException());
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());

                var result = await _service.ApproveReviewAsync(id, request, tenantId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { error = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving review {ReviewId}", id);
                return StatusCode(500, new { error = "An error occurred while approving the review" });
            }
        }

        [HttpPost("{id}/probation/complete")]
        public async Task<ActionResult<PerformanceReviewDto>> CompleteProbation(Guid id, [FromBody] CompleteProbationRequest request)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException());
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());

                var result = await _service.CompleteProbationAsync(id, request, tenantId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error completing probation for review {ReviewId}", id);
                return StatusCode(500, new { error = "An error occurred while completing probation" });
            }
        }

        [HttpGet("statistics")]
        public async Task<ActionResult<ReviewStatisticsDto>> GetStatistics()
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException());
                var stats = await _service.GetReviewStatisticsAsync(tenantId);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving review statistics");
                return StatusCode(500, new { error = "An error occurred while retrieving statistics" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteReview(Guid id)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException());
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());

                var result = await _service.DeleteReviewAsync(id, tenantId, userId);

                if (!result)
                    return NotFound(new { error = "Review not found" });

                return Ok(new { message = "Review deleted successfully" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting review {ReviewId}", id);
                return StatusCode(500, new { error = "An error occurred while deleting the review" });
            }
        }

        [HttpGet("{id}/weighted-score")]
        public async Task<ActionResult> GetWeightedScore(Guid id)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException());
                var score = await _service.CalculateWeightedScoreAsync(id, tenantId);
                return Ok(new { reviewId = id, weightedScore = score });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating weighted score for review {ReviewId}", id);
                return StatusCode(500, new { error = "An error occurred while calculating the score" });
            }
        }
    }
}
