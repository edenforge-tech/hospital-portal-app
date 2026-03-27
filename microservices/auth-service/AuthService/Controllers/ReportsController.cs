using AuthService.Authorization;
using AuthService.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly IReportsService _reportsService;
        private readonly ILogger<ReportsController> _logger;

        public ReportsController(IReportsService reportsService, ILogger<ReportsController> logger)
        {
            _reportsService = reportsService;
            _logger = logger;
        }

        /// <summary>
        /// Get daily OPD report
        /// </summary>
        [HttpGet("opd/daily")]
        [RequirePermission("reports.view")]
        public async Task<IActionResult> GetDailyOpdReport(
            [FromQuery] Guid branchId,
            [FromQuery] DateTime? date)
        {
            try
            {
                var targetDate = date ?? DateTime.UtcNow.Date;
                var report = await _reportsService.GetDailyOpdReportAsync(branchId, targetDate);

                return Ok(new
                {
                    success = true,
                    data = report
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating daily OPD report");
                return StatusCode(500, new { success = false, message = "Error generating daily OPD report" });
            }
        }

        /// <summary>
        /// Get weekly OPD report
        /// </summary>
        [HttpGet("opd/weekly")]
        [RequirePermission("reports.view")]
        public async Task<IActionResult> GetWeeklyOpdReport(
            [FromQuery] Guid branchId,
            [FromQuery] DateTime? date)
        {
            try
            {
                var targetDate = date ?? DateTime.UtcNow.Date;
                var report = await _reportsService.GetWeeklyOpdReportAsync(branchId, targetDate);

                return Ok(new
                {
                    success = true,
                    data = report
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating weekly OPD report");
                return StatusCode(500, new { success = false, message = "Error generating weekly OPD report" });
            }
        }

        /// <summary>
        /// Get monthly OPD report
        /// </summary>
        [HttpGet("opd/monthly")]
        [RequirePermission("reports.view")]
        public async Task<IActionResult> GetMonthlyOpdReport(
            [FromQuery] Guid branchId,
            [FromQuery] DateTime? date)
        {
            try
            {
                var targetDate = date ?? DateTime.UtcNow.Date;
                var report = await _reportsService.GetMonthlyOpdReportAsync(branchId, targetDate);

                return Ok(new
                {
                    success = true,
                    data = report
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating monthly OPD report");
                return StatusCode(500, new { success = false, message = "Error generating monthly OPD report" });
            }
        }
    }
}
