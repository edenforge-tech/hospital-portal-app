using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AuthService.Authorization;
using AuthService.Context;
using AuthService.Hubs;
using AuthService.Models.Counselor;
using AuthService.Models.Domain;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PreOpTestManagementController : ControllerBase
    {
        private readonly IPreOpTestManagementService _service;
        private readonly ILogger<PreOpTestManagementController> _logger;
        private readonly AppDbContext _context;
        private readonly IHubContext<QueueHub> _queueHub;

        public PreOpTestManagementController(
            IPreOpTestManagementService service,
            ILogger<PreOpTestManagementController> logger,
            AppDbContext context,
            IHubContext<QueueHub> queueHub)
        {
            _service = service;
            _logger = logger;
            _context = context;
            _queueHub = queueHub;
        }

        private Guid GetTenantId()
        {
            var tenantIdClaim = User.FindFirst("TenantId")?.Value;
            return Guid.TryParse(tenantIdClaim, out var tenantId) ? tenantId : Guid.Empty;
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
        }

        // ==================== PROTOCOLS ====================

        [HttpGet("protocols")]
        [RequirePermission("preop_protocols.read")]
        public async Task<IActionResult> GetAllProtocols([FromQuery] bool? isActive = null, [FromQuery] string? surgeryType = null)
        {
            try
            {
                var tenantId = GetTenantId();
                var protocols = await _service.GetAllProtocolsAsync(tenantId, isActive, surgeryType);
                return Ok(protocols);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving pre-op test protocols");
                return StatusCode(500, new { message = "Error retrieving protocols", error = ex.Message });
            }
        }

        [HttpGet("protocols/{id}")]
        [RequirePermission("preop_protocols.read")]
        public async Task<IActionResult> GetProtocolById(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var protocol = await _service.GetProtocolByIdAsync(id, tenantId);
                
                if (protocol == null)
                    return NotFound(new { message = "Protocol not found" });

                return Ok(protocol);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving protocol {Id}", id);
                return StatusCode(500, new { message = "Error retrieving protocol", error = ex.Message });
            }
        }

        [HttpGet("protocols/by-code/{protocolCode}")]
        [RequirePermission("preop_protocols.read")]
        public async Task<IActionResult> GetProtocolByCode(string protocolCode)
        {
            try
            {
                var tenantId = GetTenantId();
                var protocol = await _service.GetProtocolByCodeAsync(protocolCode, tenantId);
                
                if (protocol == null)
                    return NotFound(new { message = "Protocol not found" });

                return Ok(protocol);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving protocol by code {Code}", protocolCode);
                return StatusCode(500, new { message = "Error retrieving protocol", error = ex.Message });
            }
        }

        [HttpPost("protocols")]
        [RequirePermission("preop_protocols.create")]
        public async Task<IActionResult> CreateProtocol([FromBody] CreatePreOpTestProtocolRequest request)
        {
            try
            {
                var tenantId = GetTenantId();
                var userId = GetCurrentUserId();
                var protocol = await _service.CreateProtocolAsync(request, tenantId, userId);
                return CreatedAtAction(nameof(GetProtocolById), new { id = protocol.Id }, protocol);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating protocol");
                return StatusCode(500, new { message = "Error creating protocol", error = ex.Message });
            }
        }

        [HttpPut("protocols/{id}")]
        [RequirePermission("preop_protocols.update")]
        public async Task<IActionResult> UpdateProtocol(Guid id, [FromBody] UpdatePreOpTestProtocolRequest request)
        {
            try
            {
                var tenantId = GetTenantId();
                var userId = GetCurrentUserId();
                var protocol = await _service.UpdateProtocolAsync(id, request, tenantId, userId);
                
                if (protocol == null)
                    return NotFound(new { message = "Protocol not found" });

                return Ok(protocol);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating protocol {Id}", id);
                return StatusCode(500, new { message = "Error updating protocol", error = ex.Message });
            }
        }

        [HttpDelete("protocols/{id}")]
        [RequirePermission("preop_protocols.delete")]
        public async Task<IActionResult> DeleteProtocol(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var deleted = await _service.DeleteProtocolAsync(id, tenantId);
                
                if (!deleted)
                    return NotFound(new { message = "Protocol not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting protocol {Id}", id);
                return StatusCode(500, new { message = "Error deleting protocol", error = ex.Message });
            }
        }

        // ==================== TEST ORDERS ====================

        [HttpGet("orders")]
        [RequirePermission("preop_orders.read")]
        public async Task<IActionResult> GetAllOrders(
            [FromQuery] Guid? branchId = null, 
            [FromQuery] Guid? sessionId = null, 
            [FromQuery] Guid? patientId = null, 
            [FromQuery] string? status = null, 
            [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = 50)
        {
            try
            {
                var tenantId = GetTenantId();
                var response = await _service.GetAllOrdersAsync(tenantId, branchId, sessionId, patientId, status, pageNumber, pageSize);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving pre-op test orders");
                return StatusCode(500, new { message = "Error retrieving orders", error = ex.Message });
            }
        }

        [HttpGet("orders/{id}")]
        [RequirePermission("preop_orders.read")]
        public async Task<IActionResult> GetOrderById(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var order = await _service.GetOrderByIdAsync(id, tenantId);
                
                if (order == null)
                    return NotFound(new { message = "Order not found" });

                return Ok(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving order {Id}", id);
                return StatusCode(500, new { message = "Error retrieving order", error = ex.Message });
            }
        }

        [HttpGet("orders/by-number/{orderNumber}")]
        [RequirePermission("preop_orders.read")]
        public async Task<IActionResult> GetOrderByNumber(string orderNumber)
        {
            try
            {
                var tenantId = GetTenantId();
                var order = await _service.GetOrderByNumberAsync(orderNumber, tenantId);
                
                if (order == null)
                    return NotFound(new { message = "Order not found" });

                return Ok(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving order by number {OrderNumber}", orderNumber);
                return StatusCode(500, new { message = "Error retrieving order", error = ex.Message });
            }
        }

        [HttpPost("orders")]
        [RequirePermission("preop_orders.create")]
        public async Task<IActionResult> CreateOrder([FromBody] CreatePreOpTestOrderRequest request)
        {
            try
            {
                var tenantId = GetTenantId();
                var userId = GetCurrentUserId();
                var order = await _service.CreateOrderAsync(request, tenantId, userId);
                return CreatedAtAction(nameof(GetOrderById), new { id = order.Id }, order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating order");
                return StatusCode(500, new { message = "Error creating order", error = ex.Message });
            }
        }

        [HttpPut("orders/{id}")]
        [RequirePermission("preop_orders.update")]
        public async Task<IActionResult> UpdateOrder(Guid id, [FromBody] UpdatePreOpTestOrderRequest request)
        {
            try
            {
                var tenantId = GetTenantId();
                var order = await _service.UpdateOrderAsync(id, request, tenantId);
                
                if (order == null)
                    return NotFound(new { message = "Order not found" });

                return Ok(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating order {Id}", id);
                return StatusCode(500, new { message = "Error updating order", error = ex.Message });
            }
        }

        [HttpPost("orders/{id}/mark-results-received")]
        [RequirePermission("preop_orders.update")]
        public async Task<IActionResult> MarkResultsReceived(Guid id, [FromBody] MarkResultsReceivedRequest request)
        {
            try
            {
                var tenantId = GetTenantId();
                var order = await _service.MarkResultsReceivedAsync(id, request, tenantId);
                
                if (order == null)
                    return NotFound(new { message = "Order not found" });

                return Ok(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking results received for order {Id}", id);
                return StatusCode(500, new { message = "Error marking results received", error = ex.Message });
            }
        }

        [HttpPost("orders/{id}/clear-for-surgery")]
        [RequirePermission("preop_orders.update")]
        public async Task<IActionResult> ClearForSurgery(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var order = await _service.ClearForSurgeryAsync(id, tenantId);
                
                if (order == null)
                    return NotFound(new { message = "Order not found" });

                return Ok(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing order {Id} for surgery", id);
                return StatusCode(500, new { message = "Error clearing order for surgery", error = ex.Message });
            }
        }

        [HttpDelete("orders/{id}")]
        [RequirePermission("preop_orders.delete")]
        public async Task<IActionResult> CancelOrder(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var cancelled = await _service.CancelOrderAsync(id, tenantId);
                
                if (!cancelled)
                    return NotFound(new { message = "Order not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling order {Id}", id);
                return StatusCode(500, new { message = "Error cancelling order", error = ex.Message });
            }
        }

        [HttpGet("orders/{orderId}/summary")]
        [RequirePermission("preop_orders.read")]
        public async Task<IActionResult> GetOrderSummary(Guid orderId)
        {
            try
            {
                var tenantId = GetTenantId();
                var summary = await _service.GetOrderSummaryAsync(orderId, tenantId);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving order summary for {OrderId}", orderId);
                return StatusCode(500, new { message = "Error retrieving order summary", error = ex.Message });
            }
        }

        // ==================== TEST RESULTS ====================

        [HttpGet("orders/{orderId}/results")]
        [RequirePermission("preop_results.read")]
        public async Task<IActionResult> GetOrderResults(Guid orderId)
        {
            try
            {
                var tenantId = GetTenantId();
                var results = await _service.GetOrderResultsAsync(orderId, tenantId);
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving results for order {OrderId}", orderId);
                return StatusCode(500, new { message = "Error retrieving results", error = ex.Message });
            }
        }

        [HttpGet("results/{id}")]
        [RequirePermission("preop_results.read")]
        public async Task<IActionResult> GetResultById(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var result = await _service.GetResultByIdAsync(id, tenantId);
                
                if (result == null)
                    return NotFound(new { message = "Result not found" });

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving result {Id}", id);
                return StatusCode(500, new { message = "Error retrieving result", error = ex.Message });
            }
        }

        [HttpPost("results")]
        [RequirePermission("preop_results.create")]
        public async Task<IActionResult> CreateResult([FromBody] CreatePreOpTestResultRequest request)
        {
            try
            {
                var tenantId = GetTenantId();
                var result = await _service.CreateResultAsync(request, tenantId);
                return CreatedAtAction(nameof(GetResultById), new { id = result.Id }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating result");
                return StatusCode(500, new { message = "Error creating result", error = ex.Message });
            }
        }

        [HttpPut("results/{id}")]
        [RequirePermission("preop_results.update")]
        public async Task<IActionResult> UpdateResult(Guid id, [FromBody] UpdatePreOpTestResultRequest request)
        {
            try
            {
                var tenantId = GetTenantId();
                var result = await _service.UpdateResultAsync(id, request, tenantId);
                
                if (result == null)
                    return NotFound(new { message = "Result not found" });

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating result {Id}", id);
                return StatusCode(500, new { message = "Error updating result", error = ex.Message });
            }
        }

        [HttpDelete("results/{id}")]
        [RequirePermission("preop_results.delete")]
        public async Task<IActionResult> DeleteResult(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var deleted = await _service.DeleteResultAsync(id, tenantId);
                
                if (!deleted)
                    return NotFound(new { message = "Result not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting result {Id}", id);
                return StatusCode(500, new { message = "Error deleting result", error = ex.Message });
            }
        }

        // ==================== FITNESS CLEARANCES ====================

        [HttpGet("orders/{orderId}/clearances")]
        [RequirePermission("preop_clearances.read")]
        public async Task<IActionResult> GetOrderClearances(Guid orderId)
        {
            try
            {
                var tenantId = GetTenantId();
                var clearances = await _service.GetOrderClearancesAsync(orderId, tenantId);
                return Ok(clearances);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving clearances for order {OrderId}", orderId);
                return StatusCode(500, new { message = "Error retrieving clearances", error = ex.Message });
            }
        }

        [HttpGet("clearances/{id}")]
        [RequirePermission("preop_clearances.read")]
        public async Task<IActionResult> GetClearanceById(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var clearance = await _service.GetClearanceByIdAsync(id, tenantId);
                
                if (clearance == null)
                    return NotFound(new { message = "Clearance not found" });

                return Ok(clearance);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving clearance {Id}", id);
                return StatusCode(500, new { message = "Error retrieving clearance", error = ex.Message });
            }
        }

        [HttpPost("clearances")]
        [RequirePermission("preop_clearances.create")]
        public async Task<IActionResult> CreateClearance([FromBody] CreatePreOpFitnessClearanceRequest request)
        {
            try
            {
                var tenantId = GetTenantId();
                var clearance = await _service.CreateClearanceAsync(request, tenantId);
                return CreatedAtAction(nameof(GetClearanceById), new { id = clearance.Id }, clearance);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating clearance");
                return StatusCode(500, new { message = "Error creating clearance", error = ex.Message });
            }
        }

        [HttpPut("clearances/{id}")]
        [RequirePermission("preop_clearances.update")]
        public async Task<IActionResult> UpdateClearance(Guid id, [FromBody] UpdateFitnessClearanceRequest request)
        {
            try
            {
                var tenantId = GetTenantId();
                var clearance = await _service.UpdateClearanceAsync(id, request, tenantId);
                
                if (clearance == null)
                    return NotFound(new { message = "Clearance not found" });

                return Ok(clearance);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating clearance {Id}", id);
                return StatusCode(500, new { message = "Error updating clearance", error = ex.Message });
            }
        }

        [HttpPost("clearances/{id}/grant")]
        [RequirePermission("preop_clearances.grant")]
        public async Task<IActionResult> GrantClearance(Guid id, [FromBody] GrantClearanceRequest request)
        {
            try
            {
                var tenantId = GetTenantId();
                var userId = GetCurrentUserId();
                var clearance = await _service.GrantClearanceAsync(id, request, tenantId, userId);
                
                if (clearance == null)
                    return NotFound(new { message = "Clearance not found" });

                return Ok(clearance);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error granting clearance for {Id}", id);
                return StatusCode(500, new { message = "Error granting clearance", error = ex.Message });
            }
        }

        [HttpDelete("clearances/{id}")]
        [RequirePermission("preop_clearances.delete")]
        public async Task<IActionResult> DeleteClearance(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var deleted = await _service.DeleteClearanceAsync(id, tenantId);
                
                if (!deleted)
                    return NotFound(new { message = "Clearance not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting clearance {Id}", id);
                return StatusCode(500, new { message = "Error deleting clearance", error = ex.Message });
            }
        }

        // ==================== LAB TEST CATALOG ====================

        /// <summary>Get the lab test catalog for building orders (includes prices)</summary>
        [HttpGet("lab-catalog")]
        [RequirePermission("counseling_sessions.read")]
        public async Task<IActionResult> GetLabCatalog([FromQuery] bool? preOperativeOnly = null)
        {
            try
            {
                var tenantId = GetTenantId();
                var query = _context.LabTestCatalog
                    .Where(t => t.DeletedAt == null && t.IsActive);

                if (preOperativeOnly == true)
                    query = query.Where(t => t.IsPreOperative);

                var catalog = await query.OrderBy(t => t.Category).ThenBy(t => t.TestName).ToListAsync();
                return Ok(catalog);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving lab catalog");
                return StatusCode(500, new { message = "Error retrieving lab catalog", error = ex.Message });
            }
        }

        /// <summary>
        /// Create a lab order from counseling session, notifying lab technicians via SignalR
        /// </summary>
        [HttpPost("lab-orders")]
        [RequirePermission("counseling_sessions.update")]
        public async Task<IActionResult> CreateLabOrder([FromBody] CreateCounselorLabOrderRequest request)
        {
            var tenantId = GetTenantId();
            if (tenantId == Guid.Empty) return Unauthorized("Tenant ID not found");
            var userId = GetCurrentUserId();

            try
            {
                var items = new List<CounselorLabOrderItem>();
                foreach (var test in request.Tests ?? new List<LabOrderTestItem>())
                {
                    items.Add(new CounselorLabOrderItem
                    {
                        Id = Guid.NewGuid(),
                        TenantId = tenantId,
                        SessionId = request.SessionId,
                        PatientId = request.PatientId,
                        OrderedByUserId = userId,
                        LabTestCatalogId = test.CatalogId,
                        TestName = test.TestName,
                        TestCode = test.TestCode,
                        Price = test.Price,
                        Urgency = request.Urgency ?? "Routine",
                        Notes = request.Notes,
                        Status = "Pending",
                        OrderedAt = DateTime.UtcNow,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                }

                _context.CounselorLabOrderItems.AddRange(items);
                await _context.SaveChangesAsync();

                // Notify lab technicians via SignalR
                var notificationGroupName = $"lab_tech_{tenantId}";
                await _queueHub.Clients.Group(notificationGroupName).SendAsync("LabOrderReceived", new
                {
                    PatientId = request.PatientId,
                    SessionId = request.SessionId,
                    TestCount = items.Count,
                    Urgency = request.Urgency ?? "Routine",
                    OrderedAt = DateTime.UtcNow,
                    Items = items.Select(i => new { i.TestName, i.TestCode, i.Price })
                });

                _logger.LogInformation(
                    "Lab order ({TestCount} tests) created for patient {PatientId} via counseling session {SessionId}",
                    items.Count, request.PatientId, request.SessionId);

                return Ok(new { OrderedCount = items.Count, Items = items });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating lab order for patient {PatientId}", request.PatientId);
                return StatusCode(500, new { message = "Error creating lab order", error = ex.Message });
            }
        }

        /// <summary>Get all counselor lab orders for a specific counseling session</summary>
        [HttpGet("lab-orders/by-session/{sessionId}")]
        [RequirePermission("counseling_sessions.read")]
        public async Task<IActionResult> GetLabOrdersBySession(Guid sessionId)
        {
            try
            {
                var tenantId = GetTenantId();
                var items = await _context.CounselorLabOrderItems
                    .Where(i => i.SessionId == sessionId
                             && i.TenantId == tenantId
                             && i.DeletedAt == null)
                    .OrderBy(i => i.OrderedAt)
                    .Select(i => new
                    {
                        i.Id,
                        i.TestName,
                        i.TestCode,
                        i.Price,
                        i.Status,
                        i.Urgency,
                        i.Notes,
                        i.OrderedAt,
                        i.CompletedAt,
                        i.LabTestCatalogId,
                        OrderedByUserId = i.OrderedByUserId,
                    })
                    .ToListAsync();

                // Load user names for all ordering users in one DB round-trip
                var userIds = items.Select(i => i.OrderedByUserId).Where(id => id != Guid.Empty).Distinct().ToList();
                var userNames = await _context.Users
                    .Where(u => userIds.Contains(u.Id))
                    .ToDictionaryAsync(u => u.Id, u => $"{u.FirstName} {u.LastName}".Trim());

                var result = items.Select(i => new
                {
                    i.Id,
                    i.TestName,
                    i.TestCode,
                    i.Price,
                    i.Status,
                    i.Urgency,
                    i.Notes,
                    i.OrderedAt,
                    i.CompletedAt,
                    i.LabTestCatalogId,
                    OrderedByUserName = userNames.TryGetValue(i.OrderedByUserId, out var n) ? n : null,
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving lab orders for session {SessionId}", sessionId);
                return StatusCode(500, new { message = "Error retrieving lab orders", error = ex.Message });
            }
        }

        /// <summary>Mark a counselor lab order item as results received</summary>
        [HttpPatch("lab-orders/{id}/mark-received")]
        [RequirePermission("counseling_sessions.update")]
        public async Task<IActionResult> MarkLabOrderReceived(Guid id, [FromBody] MarkLabReceivedRequest? request = null)
        {
            try
            {
                var tenantId = GetTenantId();

                var item = await _context.CounselorLabOrderItems
                    .FirstOrDefaultAsync(i => i.Id == id && i.TenantId == tenantId && i.DeletedAt == null);

                if (item == null)
                    return NotFound(new { message = "Lab order item not found" });

                item.Status = "Completed";
                item.CompletedAt = DateTime.UtcNow;
                item.UpdatedAt = DateTime.UtcNow;
                if (!string.IsNullOrWhiteSpace(request?.DocumentUrl))
                    item.Notes = string.IsNullOrWhiteSpace(item.Notes)
                        ? $"DocumentUrl:{request.DocumentUrl}"
                        : $"{item.Notes} | DocumentUrl:{request.DocumentUrl}";

                await _context.SaveChangesAsync();

                _logger.LogInformation("Lab order item {Id} marked as received", id);
                return Ok(new { id = item.Id, status = item.Status, completedAt = item.CompletedAt });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking lab order item {Id} as received", id);
                return StatusCode(500, new { message = "Error marking lab order as received", error = ex.Message });
            }
        }

        /// <summary>Get all counselor lab orders for a specific patient across all sessions</summary>
        [HttpGet("lab-orders/by-patient/{patientId}")]
        [RequirePermission("counseling_sessions.read")]
        public async Task<IActionResult> GetLabOrdersByPatient(Guid patientId)
        {
            try
            {
                var tenantId = GetTenantId();
                var items = await _context.CounselorLabOrderItems
                    .Where(i => i.PatientId == patientId && i.TenantId == tenantId && i.DeletedAt == null)
                    .OrderBy(i => i.OrderedAt)
                    .Select(i => new
                    {
                        i.Id,
                        i.TestName,
                        i.TestCode,
                        i.Price,
                        i.Status,
                        i.Urgency,
                        i.Notes,
                        i.OrderedAt,
                        i.CompletedAt,
                        i.LabTestCatalogId,
                        OrderedByUserId = i.OrderedByUserId,
                    })
                    .ToListAsync();

                var userIds = items.Select(i => i.OrderedByUserId).Where(id => id != Guid.Empty).Distinct().ToList();
                var userNames = await _context.Users
                    .Where(u => userIds.Contains(u.Id))
                    .ToDictionaryAsync(u => u.Id, u => $"{u.FirstName} {u.LastName}".Trim());

                var result = items.Select(i => new
                {
                    i.Id,
                    i.TestName,
                    i.TestCode,
                    i.Price,
                    i.Status,
                    i.Urgency,
                    i.Notes,
                    i.OrderedAt,
                    i.CompletedAt,
                    i.LabTestCatalogId,
                    OrderedByUserName = userNames.TryGetValue(i.OrderedByUserId, out var n) ? n : null,
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving lab orders for patient {PatientId}", patientId);
                return StatusCode(500, new { message = "Error retrieving lab orders", error = ex.Message });
            }
        }

        /// <summary>Soft-delete a single counselor lab order item</summary>
        [HttpDelete("lab-orders/{id}")]
        [RequirePermission("counseling_sessions.update")]
        public async Task<IActionResult> DeleteLabOrderItem(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var userId = GetCurrentUserId();

                var item = await _context.CounselorLabOrderItems
                    .FirstOrDefaultAsync(i => i.Id == id && i.TenantId == tenantId && i.DeletedAt == null);

                if (item == null)
                    return NotFound(new { message = "Lab order item not found" });

                item.DeletedAt = DateTime.UtcNow;
                item.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Lab order item {Id} soft-deleted by user {UserId}", id, userId);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting lab order item {Id}", id);
                return StatusCode(500, new { message = "Error deleting lab order", error = ex.Message });
            }
        }
    }
}

public class MarkLabReceivedRequest
{
    public string? DocumentUrl { get; set; }
}

public class CreateCounselorLabOrderRequest
{
    [Required]
    public Guid PatientId { get; set; }

    [Required]
    public Guid SessionId { get; set; }

    public List<LabOrderTestItem> Tests { get; set; } = new();

    public string? Urgency { get; set; }

    public string? Notes { get; set; }
}

public class LabOrderTestItem
{
    public Guid? CatalogId { get; set; }

    [Required]
    public string TestName { get; set; } = null!;

    public string? TestCode { get; set; }

    public decimal? Price { get; set; }
}
