using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using AuthService.Context;
using AuthService.Models.Counselor;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AuthService.Services
{
    public class PreOpTestManagementService : IPreOpTestManagementService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<PreOpTestManagementService> _logger;

        public PreOpTestManagementService(AppDbContext context, ILogger<PreOpTestManagementService> logger)
        {
            _context = context;
            _logger = logger;
        }

        // ==================== PROTOCOLS ====================

        public async Task<List<PreOpTestProtocolDto>> GetAllProtocolsAsync(Guid tenantId, bool? isActive = null, string? surgeryType = null)
        {
            try
            {
                var query = _context.Set<PreOpTestProtocol>()
                    .Where(p => p.TenantId == tenantId && p.DeletedAt == null);

                if (isActive.HasValue)
                    query = query.Where(p => p.IsActive == isActive.Value);

                if (!string.IsNullOrEmpty(surgeryType))
                    query = query.Where(p => p.SurgeryType == surgeryType);

                var protocols = await query
                    .OrderBy(p => p.SurgeryType)
                    .ThenBy(p => p.ProtocolName)
                    .ToListAsync();

                return protocols.Select(p => ToDto(p)).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving pre-op test protocols");
                throw;
            }
        }

        public async Task<PreOpTestProtocolDto?> GetProtocolByIdAsync(Guid id, Guid tenantId)
        {
            try
            {
                var protocol = await _context.Set<PreOpTestProtocol>()
                    .Where(p => p.Id == id && p.TenantId == tenantId && p.DeletedAt == null)
                    .FirstOrDefaultAsync();

                return protocol != null ? ToDto(protocol) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving protocol {Id}", id);
                throw;
            }
        }

        public async Task<PreOpTestProtocolDto?> GetProtocolByCodeAsync(string protocolCode, Guid tenantId)
        {
            try
            {
                var protocol = await _context.Set<PreOpTestProtocol>()
                    .Where(p => p.ProtocolCode == protocolCode && p.TenantId == tenantId && p.DeletedAt == null)
                    .FirstOrDefaultAsync();

                return protocol != null ? ToDto(protocol) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving protocol by code {Code}", protocolCode);
                throw;
            }
        }

        public async Task<PreOpTestProtocolDto> CreateProtocolAsync(CreatePreOpTestProtocolRequest request, Guid tenantId, Guid userId)
        {
            try
            {
                // Validate JSON
                try
                {
                    JsonDocument.Parse(request.RequiredTests);
                }
                catch (JsonException)
                {
                    throw new InvalidOperationException("Invalid JSON in RequiredTests");
                }

                var protocol = new PreOpTestProtocol
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    ProtocolName = request.ProtocolName,
                    ProtocolCode = request.ProtocolCode,
                    SurgeryType = request.SurgeryType,
                    Description = request.Description,
                    RequiredTests = request.RequiredTests,
                    TestValidityDays = request.TestValidityDays,
                    IsActive = request.IsActive,
                    CreatedAt = DateTime.UtcNow,
                    CreatedByUserId = userId
                };

                _context.Set<PreOpTestProtocol>().Add(protocol);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created pre-op test protocol {Id}: {Name}", protocol.Id, protocol.ProtocolName);
                return ToDto(protocol);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating pre-op test protocol");
                throw;
            }
        }

        public async Task<PreOpTestProtocolDto?> UpdateProtocolAsync(Guid id, UpdatePreOpTestProtocolRequest request, Guid tenantId, Guid userId)
        {
            try
            {
                var protocol = await _context.Set<PreOpTestProtocol>()
                    .Where(p => p.Id == id && p.TenantId == tenantId && p.DeletedAt == null)
                    .FirstOrDefaultAsync();

                if (protocol == null) return null;

                if (request.ProtocolName != null) protocol.ProtocolName = request.ProtocolName;
                if (request.Description != null) protocol.Description = request.Description;
                
                if (request.RequiredTests != null)
                {
                    try
                    {
                        JsonDocument.Parse(request.RequiredTests);
                        protocol.RequiredTests = request.RequiredTests;
                        protocol.Version++;
                    }
                    catch (JsonException)
                    {
                        throw new InvalidOperationException("Invalid JSON in RequiredTests");
                    }
                }

                if (request.TestValidityDays.HasValue) protocol.TestValidityDays = request.TestValidityDays.Value;
                if (request.IsActive.HasValue) protocol.IsActive = request.IsActive.Value;

                protocol.UpdatedAt = DateTime.UtcNow;
                protocol.UpdatedByUserId = userId;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Updated pre-op test protocol {Id}", id);
                return ToDto(protocol);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating pre-op test protocol {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeleteProtocolAsync(Guid id, Guid tenantId)
        {
            try
            {
                var protocol = await _context.Set<PreOpTestProtocol>()
                    .Where(p => p.Id == id && p.TenantId == tenantId && p.DeletedAt == null)
                    .FirstOrDefaultAsync();

                if (protocol == null) return false;

                protocol.DeletedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Soft deleted pre-op test protocol {Id}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting pre-op test protocol {Id}", id);
                throw;
            }
        }

        // ==================== TEST ORDERS ====================

        public async Task<OrderListResponse> GetAllOrdersAsync(Guid tenantId, Guid? branchId = null, Guid? sessionId = null, Guid? patientId = null, string? status = null, int pageNumber = 1, int pageSize = 50)
        {
            try
            {
                var query = _context.Set<PreOpTestOrder>()
                    .Where(o => o.TenantId == tenantId && o.DeletedAt == null);

                if (branchId.HasValue)
                    query = query.Where(o => o.BranchId == branchId.Value);

                if (sessionId.HasValue)
                    query = query.Where(o => o.SessionId == sessionId.Value);

                if (patientId.HasValue)
                    query = query.Where(o => o.PatientId == patientId.Value);

                if (!string.IsNullOrEmpty(status))
                    query = query.Where(o => o.Status == status);

                var totalCount = await query.CountAsync();

                var orders = await query
                    .OrderByDescending(o => o.OrderedAt)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var orderDtos = orders.Select(o => ToDto(o)).ToList();

                return new OrderListResponse
                {
                    Items = orderDtos,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving pre-op test orders");
                throw;
            }
        }

        public async Task<PreOpTestOrderDetailsDto?> GetOrderByIdAsync(Guid id, Guid tenantId)
        {
            try
            {
                var order = await _context.Set<PreOpTestOrder>()
                    .Include(o => o.Results.Where(r => r.DeletedAt == null))
                    .Include(o => o.FitnessClearances.Where(c => c.DeletedAt == null))
                    .Where(o => o.Id == id && o.TenantId == tenantId && o.DeletedAt == null)
                    .FirstOrDefaultAsync();

                return order != null ? ToDetailsDto(order) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving order {Id}", id);
                throw;
            }
        }

        public async Task<PreOpTestOrderDetailsDto?> GetOrderByNumberAsync(string orderNumber, Guid tenantId)
        {
            try
            {
                var order = await _context.Set<PreOpTestOrder>()
                    .Include(o => o.Results.Where(r => r.DeletedAt == null))
                    .Include(o => o.FitnessClearances.Where(c => c.DeletedAt == null))
                    .Where(o => o.OrderNumber == orderNumber && o.TenantId == tenantId && o.DeletedAt == null)
                    .FirstOrDefaultAsync();

                return order != null ? ToDetailsDto(order) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving order by number {OrderNumber}", orderNumber);
                throw;
            }
        }

        public async Task<PreOpTestOrderDto> CreateOrderAsync(CreatePreOpTestOrderRequest request, Guid tenantId, Guid userId)
        {
            try
            {
                var order = new PreOpTestOrder
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    BranchId = request.BranchId,
                    SessionId = request.SessionId,
                    PatientId = request.PatientId,
                    ProtocolId = request.ProtocolId,
                    OrderedByUserId = userId,
                    OrderedAt = DateTime.UtcNow,
                    SpecialInstructions = request.SpecialInstructions,
                    CounselorNotes = request.CounselorNotes,
                    Status = "Ordered",
                    CreatedAt = DateTime.UtcNow
                };

                _context.Set<PreOpTestOrder>().Add(order);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created pre-op test order {Id}: {OrderNumber}", order.Id, order.OrderNumber);
                return ToDto(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating pre-op test order");
                throw;
            }
        }

        public async Task<PreOpTestOrderDto?> UpdateOrderAsync(Guid id, UpdatePreOpTestOrderRequest request, Guid tenantId)
        {
            try
            {
                var order = await _context.Set<PreOpTestOrder>()
                    .Where(o => o.Id == id && o.TenantId == tenantId && o.DeletedAt == null)
                    .FirstOrDefaultAsync();

                if (order == null) return null;

                if (request.LabOrderId.HasValue) order.LabOrderId = request.LabOrderId.Value;
                if (request.SpecialInstructions != null) order.SpecialInstructions = request.SpecialInstructions;
                if (request.CounselorNotes != null) order.CounselorNotes = request.CounselorNotes;
                if (request.Status != null) order.Status = request.Status;

                order.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Updated pre-op test order {Id}", id);
                return ToDto(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating pre-op test order {Id}", id);
                throw;
            }
        }

        public async Task<PreOpTestOrderDto?> MarkResultsReceivedAsync(Guid id, MarkResultsReceivedRequest request, Guid tenantId)
        {
            try
            {
                var order = await _context.Set<PreOpTestOrder>()
                    .Where(o => o.Id == id && o.TenantId == tenantId && o.DeletedAt == null)
                    .FirstOrDefaultAsync();

                if (order == null) return null;

                order.ResultsReceived = true;
                order.ResultsReceivedAt = DateTime.UtcNow;
                order.ResultsWithinNormal = request.ResultsWithinNormal;
                if (!string.IsNullOrEmpty(request.DocumentUrl))
                    order.DocumentUrl = request.DocumentUrl;
                order.Status = "Completed";
                order.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Marked results received for order {Id}", id);
                return ToDto(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking results received for order {Id}", id);
                throw;
            }
        }

        public async Task<PreOpTestOrderDto?> ClearForSurgeryAsync(Guid id, Guid tenantId)
        {
            try
            {
                var order = await _context.Set<PreOpTestOrder>()
                    .Where(o => o.Id == id && o.TenantId == tenantId && o.DeletedAt == null)
                    .FirstOrDefaultAsync();

                if (order == null) return null;

                order.ClearedForSurgery = true;
                order.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Cleared order {Id} for surgery", id);
                return ToDto(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing order {Id} for surgery", id);
                throw;
            }
        }

        public async Task<bool> CancelOrderAsync(Guid id, Guid tenantId)
        {
            try
            {
                var order = await _context.Set<PreOpTestOrder>()
                    .Where(o => o.Id == id && o.TenantId == tenantId && o.DeletedAt == null)
                    .FirstOrDefaultAsync();

                if (order == null) return false;

                order.Status = "Cancelled";
                order.DeletedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Cancelled pre-op test order {Id}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling pre-op test order {Id}", id);
                throw;
            }
        }

        // ==================== TEST RESULTS ====================

        public async Task<List<PreOpTestResultDto>> GetOrderResultsAsync(Guid orderId, Guid tenantId)
        {
            try
            {
                var results = await _context.Set<PreOpTestResult>()
                    .Where(r => r.OrderId == orderId && r.TenantId == tenantId && r.DeletedAt == null)
                    .OrderBy(r => r.TestName)
                    .ToListAsync();

                return results.Select(r => ToDto(r)).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving results for order {OrderId}", orderId);
                throw;
            }
        }

        public async Task<PreOpTestResultDto?> GetResultByIdAsync(Guid id, Guid tenantId)
        {
            try
            {
                var result = await _context.Set<PreOpTestResult>()
                    .Where(r => r.Id == id && r.TenantId == tenantId && r.DeletedAt == null)
                    .FirstOrDefaultAsync();

                return result != null ? ToDto(result) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving result {Id}", id);
                throw;
            }
        }

        public async Task<PreOpTestResultDto> CreateResultAsync(CreatePreOpTestResultRequest request, Guid tenantId)
        {
            try
            {
                var result = new PreOpTestResult
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    OrderId = request.OrderId,
                    LabTestResultId = request.LabTestResultId,
                    TestName = request.TestName,
                    TestCode = request.TestCode,
                    ResultValue = request.ResultValue,
                    ResultUnit = request.ResultUnit,
                    NormalRange = request.NormalRange,
                    IsAbnormal = request.IsAbnormal,
                    Severity = request.Severity,
                    RequiresClearance = request.RequiresClearance,
                    Interpretation = request.Interpretation,
                    ClinicalSignificance = request.ClinicalSignificance,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Set<PreOpTestResult>().Add(result);
                await _context.SaveChangesAsync();

                // Update order status if all results received
                var order = await _context.Set<PreOpTestOrder>().FindAsync(request.OrderId);
                if (order != null && order.Status == "Ordered")
                {
                    order.Status = "InProgress";
                    await _context.SaveChangesAsync();
                }

                _logger.LogInformation("Created pre-op test result {Id} for order {OrderId}", result.Id, result.OrderId);
                return ToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating pre-op test result");
                throw;
            }
        }

        public async Task<PreOpTestResultDto?> UpdateResultAsync(Guid id, UpdatePreOpTestResultRequest request, Guid tenantId)
        {
            try
            {
                var result = await _context.Set<PreOpTestResult>()
                    .Where(r => r.Id == id && r.TenantId == tenantId && r.DeletedAt == null)
                    .FirstOrDefaultAsync();

                if (result == null) return null;

                if (request.ResultValue != null) result.ResultValue = request.ResultValue;
                if (request.ResultUnit != null) result.ResultUnit = request.ResultUnit;
                if (request.NormalRange != null) result.NormalRange = request.NormalRange;
                if (request.IsAbnormal.HasValue) result.IsAbnormal = request.IsAbnormal.Value;
                if (request.Severity != null) result.Severity = request.Severity;
                if (request.RequiresClearance.HasValue) result.RequiresClearance = request.RequiresClearance.Value;
                if (request.Interpretation != null) result.Interpretation = request.Interpretation;
                if (request.ClinicalSignificance != null) result.ClinicalSignificance = request.ClinicalSignificance;

                result.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Updated pre-op test result {Id}", id);
                return ToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating pre-op test result {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeleteResultAsync(Guid id, Guid tenantId)
        {
            try
            {
                var result = await _context.Set<PreOpTestResult>()
                    .Where(r => r.Id == id && r.TenantId == tenantId && r.DeletedAt == null)
                    .FirstOrDefaultAsync();

                if (result == null) return false;

                result.DeletedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Soft deleted pre-op test result {Id}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting pre-op test result {Id}", id);
                throw;
            }
        }

        // ==================== FITNESS CLEARANCES ====================

        public async Task<List<PreOpFitnessClearanceDto>> GetOrderClearancesAsync(Guid orderId, Guid tenantId)
        {
            try
            {
                var clearances = await _context.Set<PreOpFitnessClearance>()
                    .Where(c => c.OrderId == orderId && c.TenantId == tenantId && c.DeletedAt == null)
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();

                return clearances.Select(c => ToDto(c)).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving clearances for order {OrderId}", orderId);
                throw;
            }
        }

        public async Task<PreOpFitnessClearanceDto?> GetClearanceByIdAsync(Guid id, Guid tenantId)
        {
            try
            {
                var clearance = await _context.Set<PreOpFitnessClearance>()
                    .Where(c => c.Id == id && c.TenantId == tenantId && c.DeletedAt == null)
                    .FirstOrDefaultAsync();

                return clearance != null ? ToDto(clearance) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving clearance {Id}", id);
                throw;
            }
        }

        public async Task<PreOpFitnessClearanceDto> CreateClearanceAsync(CreatePreOpFitnessClearanceRequest request, Guid tenantId)
        {
            try
            {
                var clearance = new PreOpFitnessClearance
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    BranchId = request.BranchId,
                    OrderId = request.OrderId,
                    SessionId = request.SessionId,
                    PatientId = request.PatientId,
                    ClearanceType = request.ClearanceType,
                    AbnormalTests = request.AbnormalTests,
                    ReasonForClearance = request.ReasonForClearance,
                    ReferredToSpecialty = request.ReferredToSpecialty,
                    ReferredToDoctorId = request.ReferredToDoctorId,
                    Priority = request.Priority,
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow
                };

                if (request.ReferredToDoctorId.HasValue)
                {
                    clearance.Status = "Referred";
                    clearance.ReferralDate = DateTime.UtcNow;
                }

                _context.Set<PreOpFitnessClearance>().Add(clearance);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created fitness clearance {Id} for order {OrderId}", clearance.Id, clearance.OrderId);
                return ToDto(clearance);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating fitness clearance");
                throw;
            }
        }

        public async Task<PreOpFitnessClearanceDto?> UpdateClearanceAsync(Guid id, UpdateFitnessClearanceRequest request, Guid tenantId)
        {
            try
            {
                var clearance = await _context.Set<PreOpFitnessClearance>()
                    .Where(c => c.Id == id && c.TenantId == tenantId && c.DeletedAt == null)
                    .FirstOrDefaultAsync();

                if (clearance == null) return null;

                if (request.ReferredToSpecialty != null) clearance.ReferredToSpecialty = request.ReferredToSpecialty;
                if (request.ReferredToDoctorId.HasValue) clearance.ReferredToDoctorId = request.ReferredToDoctorId.Value;
                if (request.ReferralDate.HasValue) clearance.ReferralDate = request.ReferralDate.Value;
                if (request.Status != null) clearance.Status = request.Status;
                if (request.Priority != null) clearance.Priority = request.Priority;

                clearance.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Updated fitness clearance {Id}", id);
                return ToDto(clearance);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating fitness clearance {Id}", id);
                throw;
            }
        }

        public async Task<PreOpFitnessClearanceDto?> GrantClearanceAsync(Guid id, GrantClearanceRequest request, Guid tenantId, Guid userId)
        {
            try
            {
                var clearance = await _context.Set<PreOpFitnessClearance>()
                    .Where(c => c.Id == id && c.TenantId == tenantId && c.DeletedAt == null)
                    .FirstOrDefaultAsync();

                if (clearance == null) return null;

                clearance.ClearanceObtained = request.ClearanceObtained;
                clearance.ClearedByDoctorId = userId;
                clearance.ClearedAt = DateTime.UtcNow;
                clearance.ClearanceNotes = request.ClearanceNotes;
                clearance.ClearanceValidUntil = request.ClearanceValidUntil;
                clearance.SurgeryClearanceConditions = request.SurgeryClearanceConditions;
                clearance.AnesthesiaPrecautions = request.AnesthesiaPrecautions;
                clearance.Status = request.ClearanceObtained ? "Cleared" : "Denied";
                clearance.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Granted clearance for {Id}: {Status}", id, clearance.Status);
                return ToDto(clearance);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error granting clearance for {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeleteClearanceAsync(Guid id, Guid tenantId)
        {
            try
            {
                var clearance = await _context.Set<PreOpFitnessClearance>()
                    .Where(c => c.Id == id && c.TenantId == tenantId && c.DeletedAt == null)
                    .FirstOrDefaultAsync();

                if (clearance == null) return false;

                clearance.DeletedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Soft deleted fitness clearance {Id}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting fitness clearance {Id}", id);
                throw;
            }
        }

        // ==================== SUMMARY ====================

        public async Task<PreOpTestOrderSummary> GetOrderSummaryAsync(Guid orderId, Guid tenantId)
        {
            try
            {
                var order = await _context.Set<PreOpTestOrder>()
                    .Include(o => o.Results.Where(r => r.DeletedAt == null))
                    .Include(o => o.FitnessClearances.Where(c => c.DeletedAt == null))
                    .Where(o => o.Id == orderId && o.TenantId == tenantId && o.DeletedAt == null)
                    .FirstOrDefaultAsync();

                if (order == null)
                {
                    throw new InvalidOperationException("Order not found");
                }

                var totalTests = order.Results.Count;
                var completedTests = order.Results.Count(r => !string.IsNullOrEmpty(r.ResultValue));
                var abnormalTests = order.Results.Count(r => r.IsAbnormal);
                var testsRequiringClearance = order.Results.Count(r => r.RequiresClearance);
                var pendingClearances = order.FitnessClearances.Count(c => c.Status == "Pending" || c.Status == "Referred");
                var obtainedClearances = order.FitnessClearances.Count(c => c.ClearanceObtained);

                var allTestsCompleted = totalTests > 0 && completedTests == totalTests;
                var allClearancesObtained = testsRequiringClearance == 0 || (order.FitnessClearances.Count > 0 && pendingClearances == 0);

                return new PreOpTestOrderSummary
                {
                    OrderId = orderId,
                    OrderNumber = order.OrderNumber,
                    TotalTests = totalTests,
                    CompletedTests = completedTests,
                    AbnormalTests = abnormalTests,
                    TestsRequiringClearance = testsRequiringClearance,
                    PendingClearances = pendingClearances,
                    ObtainedClearances = obtainedClearances,
                    AllTestsCompleted = allTestsCompleted,
                    AllClearancesObtained = allClearancesObtained,
                    ClearedForSurgery = order.ClearedForSurgery
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating order summary for {OrderId}", orderId);
                throw;
            }
        }

        // ==================== HELPER METHODS ====================

        private PreOpTestProtocolDto ToDto(PreOpTestProtocol protocol)
        {
            return new PreOpTestProtocolDto
            {
                Id = protocol.Id,
                TenantId = protocol.TenantId,
                ProtocolName = protocol.ProtocolName,
                ProtocolCode = protocol.ProtocolCode,
                SurgeryType = protocol.SurgeryType,
                Description = protocol.Description,
                RequiredTests = protocol.RequiredTests,
                TestValidityDays = protocol.TestValidityDays,
                IsActive = protocol.IsActive,
                Version = protocol.Version,
                CreatedAt = protocol.CreatedAt,
                CreatedByUserId = protocol.CreatedByUserId,
                UpdatedAt = protocol.UpdatedAt,
                UpdatedByUserId = protocol.UpdatedByUserId
            };
        }

        private PreOpTestOrderDto ToDto(PreOpTestOrder order)
        {
            return new PreOpTestOrderDto
            {
                Id = order.Id,
                TenantId = order.TenantId,
                BranchId = order.BranchId,
                SessionId = order.SessionId,
                PatientId = order.PatientId,
                ProtocolId = order.ProtocolId,
                LabOrderId = order.LabOrderId,
                OrderNumber = order.OrderNumber,
                OrderedByUserId = order.OrderedByUserId,
                OrderedAt = order.OrderedAt,
                ResultsReceived = order.ResultsReceived,
                ResultsReceivedAt = order.ResultsReceivedAt,
                ResultsWithinNormal = order.ResultsWithinNormal,
                ClearedForSurgery = order.ClearedForSurgery,
                SpecialInstructions = order.SpecialInstructions,
                CounselorNotes = order.CounselorNotes,
                DocumentUrl = order.DocumentUrl,
                Status = order.Status,
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt
            };
        }

        private PreOpTestOrderDetailsDto ToDetailsDto(PreOpTestOrder order)
        {
            return new PreOpTestOrderDetailsDto
            {
                Id = order.Id,
                TenantId = order.TenantId,
                BranchId = order.BranchId,
                SessionId = order.SessionId,
                PatientId = order.PatientId,
                ProtocolId = order.ProtocolId,
                LabOrderId = order.LabOrderId,
                OrderNumber = order.OrderNumber,
                OrderedByUserId = order.OrderedByUserId,
                OrderedAt = order.OrderedAt,
                ResultsReceived = order.ResultsReceived,
                ResultsReceivedAt = order.ResultsReceivedAt,
                ResultsWithinNormal = order.ResultsWithinNormal,
                ClearedForSurgery = order.ClearedForSurgery,
                SpecialInstructions = order.SpecialInstructions,
                CounselorNotes = order.CounselorNotes,
                DocumentUrl = order.DocumentUrl,
                Status = order.Status,
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt,
                Results = order.Results.Select(r => ToDto(r)).ToList(),
                FitnessClearances = order.FitnessClearances.Select(c => ToDto(c)).ToList()
            };
        }

        private PreOpTestResultDto ToDto(PreOpTestResult result)
        {
            return new PreOpTestResultDto
            {
                Id = result.Id,
                TenantId = result.TenantId,
                OrderId = result.OrderId,
                LabTestResultId = result.LabTestResultId,
                TestName = result.TestName,
                TestCode = result.TestCode,
                ResultValue = result.ResultValue,
                ResultUnit = result.ResultUnit,
                NormalRange = result.NormalRange,
                IsAbnormal = result.IsAbnormal,
                Severity = result.Severity,
                RequiresClearance = result.RequiresClearance,
                Interpretation = result.Interpretation,
                ClinicalSignificance = result.ClinicalSignificance,
                Status = result.Status,
                CreatedAt = result.CreatedAt,
                UpdatedAt = result.UpdatedAt
            };
        }

        private PreOpFitnessClearanceDto ToDto(PreOpFitnessClearance clearance)
        {
            return new PreOpFitnessClearanceDto
            {
                Id = clearance.Id,
                TenantId = clearance.TenantId,
                BranchId = clearance.BranchId,
                OrderId = clearance.OrderId,
                SessionId = clearance.SessionId,
                PatientId = clearance.PatientId,
                ClearanceType = clearance.ClearanceType,
                AbnormalTests = clearance.AbnormalTests,
                ReasonForClearance = clearance.ReasonForClearance,
                ReferredToSpecialty = clearance.ReferredToSpecialty,
                ReferredToDoctorId = clearance.ReferredToDoctorId,
                ReferralDate = clearance.ReferralDate,
                ClearanceObtained = clearance.ClearanceObtained,
                ClearedByDoctorId = clearance.ClearedByDoctorId,
                ClearedAt = clearance.ClearedAt,
                ClearanceNotes = clearance.ClearanceNotes,
                ClearanceValidUntil = clearance.ClearanceValidUntil,
                SurgeryClearanceConditions = clearance.SurgeryClearanceConditions,
                AnesthesiaPrecautions = clearance.AnesthesiaPrecautions,
                Status = clearance.Status,
                Priority = clearance.Priority,
                CreatedAt = clearance.CreatedAt,
                UpdatedAt = clearance.UpdatedAt
            };
        }
    }
}
