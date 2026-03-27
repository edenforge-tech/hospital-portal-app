using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AuthService.Authorization;
using AuthService.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AuthService.Controllers
{
    /// <summary>
    /// Aggregates all investigation orders for a patient (lab + imaging + pre-op)
    /// into a single unified response. Frontend calls this instead of 3 separate queries.
    /// </summary>
    [ApiController]
    [Route("api/patient-investigations")]
    [Authorize]
    public class PatientInvestigationsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<PatientInvestigationsController> _logger;

        public PatientInvestigationsController(AppDbContext context, ILogger<PatientInvestigationsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        private Guid GetTenantId()
        {
            var claim = User.FindFirst("TenantId")?.Value;
            return Guid.TryParse(claim, out var id) ? id : Guid.Empty;
        }

        /// <summary>
        /// GET /api/patient-investigations?patientId={id}&amp;includeCompleted=false
        /// Returns all investigation orders for a patient from all 3 sources:
        ///   lab (counselor_lab_order_items), imaging (imaging_orders), preop (preop_test_orders)
        /// </summary>
        [HttpGet]
        [RequirePermission("counseling_sessions.read")]
        public async Task<IActionResult> GetPatientInvestigations(
            [FromQuery] Guid patientId,
            [FromQuery] bool includeCompleted = false)
        {
            if (patientId == Guid.Empty)
                return BadRequest(new { message = "patientId is required" });

            var tenantId = GetTenantId();

            try
            {
                // ── 1. Counselor lab order items ───────────────────────────────────
                var labQuery = _context.CounselorLabOrderItems
                    .Where(i => i.PatientId == patientId && i.TenantId == tenantId && i.DeletedAt == null);

                if (!includeCompleted)
                    labQuery = labQuery.Where(i => i.Status != "Completed" && i.Status != "Cancelled");

                var labItems = await labQuery.OrderByDescending(i => i.OrderedAt).ToListAsync();

                // ── 2. Imaging orders ──────────────────────────────────────────────
                var imagingQuery = _context.ImagingOrders
                    .Where(o => o.PatientId == patientId && o.TenantId == tenantId);

                if (!includeCompleted)
                    imagingQuery = imagingQuery.Where(o =>
                        o.Status != "Completed" && o.Status != "Cancelled" && o.Status != "Reviewed");

                var imagingItems = await imagingQuery.OrderByDescending(o => o.OrderedAt).ToListAsync();

                // ── 3. Pre-op test orders (with protocol for test name) ─────────────
                var preopQuery = _context.PreOpTestOrders
                    .Include(o => o.Protocol)
                    .Where(o => o.PatientId == patientId && o.TenantId == tenantId && o.DeletedAt == null);

                if (!includeCompleted)
                    preopQuery = preopQuery.Where(o => o.Status != "Completed" && o.Status != "Cancelled");

                var preopItems = await preopQuery.OrderByDescending(o => o.OrderedAt).ToListAsync();

                // ── Resolve user display names ─────────────────────────────────────
                var userIds = labItems.Select(i => i.OrderedByUserId)
                    .Concat(imagingItems.Select(o => o.OrderingDoctorId))
                    .Concat(preopItems.Select(o => o.OrderedByUserId))
                    .Where(id => id != Guid.Empty)
                    .Distinct()
                    .ToList();

                var userNames = userIds.Count > 0
                    ? await _context.Users
                        .Where(u => userIds.Contains(u.Id))
                        .ToDictionaryAsync(u => u.Id, u => $"{u.FirstName} {u.LastName}".Trim())
                    : new Dictionary<Guid, string>();

                // ── Build unified response ─────────────────────────────────────────
                var result = new List<object>();

                foreach (var item in labItems)
                {
                    userNames.TryGetValue(item.OrderedByUserId, out var name);
                    result.Add(new
                    {
                        id = item.Id,
                        testName = item.TestName,
                        testCode = item.TestCode,
                        category = "Lab",
                        price = item.Price ?? 0m,
                        urgency = item.Urgency,
                        status = item.Status,
                        orderedAt = item.OrderedAt,
                        resultReceivedAt = item.CompletedAt,
                        documentUrl = (string?)null,
                        orderedByName = !string.IsNullOrWhiteSpace(name) ? name : null,
                        laterality = (string?)null,
                        sourceType = "lab",
                    });
                }

                foreach (var order in imagingItems)
                {
                    userNames.TryGetValue(order.OrderingDoctorId, out var name);
                    result.Add(new
                    {
                        id = order.Id,
                        testName = order.ImagingType,
                        testCode = (string?)null,
                        category = "Imaging",
                        price = 0m,
                        urgency = order.Urgency,
                        status = order.Status,
                        orderedAt = order.OrderedAt,
                        resultReceivedAt = order.CompletedAt
                            ?? (order.ImageStoragePath != null ? order.OrderedAt : (DateTime?)null),
                        documentUrl = order.ImageStoragePath,
                        orderedByName = !string.IsNullOrWhiteSpace(name) ? name : null,
                        laterality = order.Laterality,
                        sourceType = "imaging",
                    });
                }

                foreach (var order in preopItems)
                {
                    userNames.TryGetValue(order.OrderedByUserId, out var name);
                    result.Add(new
                    {
                        id = order.Id,
                        testName = order.Protocol?.ProtocolName ?? order.OrderNumber ?? "Pre-Op Test",
                        testCode = (string?)null,
                        category = order.Protocol?.SurgeryType ?? "Pre-Op",
                        price = 0m,
                        urgency = "Routine",
                        status = order.Status,
                        orderedAt = order.OrderedAt,
                        resultReceivedAt = order.ResultsReceivedAt,
                        documentUrl = order.DocumentUrl,
                        orderedByName = !string.IsNullOrWhiteSpace(name) ? name : null,
                        laterality = (string?)null,
                        sourceType = "preop",
                    });
                }

                // Sort all results by orderedAt descending
                var sorted = result
                    .Cast<dynamic>()
                    .OrderByDescending(o => (DateTime)o.orderedAt)
                    .Cast<object>()
                    .ToList();

                _logger.LogInformation(
                    "Patient investigations aggregated for patient {PatientId}: {Lab} lab, {Imaging} imaging, {Preop} pre-op",
                    patientId, labItems.Count, imagingItems.Count, preopItems.Count);

                return Ok(sorted);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error aggregating investigations for patient {PatientId}", patientId);
                return StatusCode(500, new { message = "Error retrieving patient investigations", error = ex.Message });
            }
        }
    }
}
