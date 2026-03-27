using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AuthService.Models.Counselor;

namespace AuthService.Services
{
    public interface IPreOpTestManagementService
    {
        // Protocols
        Task<List<PreOpTestProtocolDto>> GetAllProtocolsAsync(Guid tenantId, bool? isActive = null, string? surgeryType = null);
        Task<PreOpTestProtocolDto?> GetProtocolByIdAsync(Guid id, Guid tenantId);
        Task<PreOpTestProtocolDto?> GetProtocolByCodeAsync(string protocolCode, Guid tenantId);
        Task<PreOpTestProtocolDto> CreateProtocolAsync(CreatePreOpTestProtocolRequest request, Guid tenantId, Guid userId);
        Task<PreOpTestProtocolDto?> UpdateProtocolAsync(Guid id, UpdatePreOpTestProtocolRequest request, Guid tenantId, Guid userId);
        Task<bool> DeleteProtocolAsync(Guid id, Guid tenantId);

        // Test Orders
        Task<OrderListResponse> GetAllOrdersAsync(Guid tenantId, Guid? branchId = null, Guid? sessionId = null, Guid? patientId = null, string? status = null, int pageNumber = 1, int pageSize = 50);
        Task<PreOpTestOrderDetailsDto?> GetOrderByIdAsync(Guid id, Guid tenantId);
        Task<PreOpTestOrderDetailsDto?> GetOrderByNumberAsync(string orderNumber, Guid tenantId);
        Task<PreOpTestOrderDto> CreateOrderAsync(CreatePreOpTestOrderRequest request, Guid tenantId, Guid userId);
        Task<PreOpTestOrderDto?> UpdateOrderAsync(Guid id, UpdatePreOpTestOrderRequest request, Guid tenantId);
        Task<PreOpTestOrderDto?> MarkResultsReceivedAsync(Guid id, MarkResultsReceivedRequest request, Guid tenantId);
        Task<PreOpTestOrderDto?> ClearForSurgeryAsync(Guid id, Guid tenantId);
        Task<bool> CancelOrderAsync(Guid id, Guid tenantId);

        // Test Results
        Task<List<PreOpTestResultDto>> GetOrderResultsAsync(Guid orderId, Guid tenantId);
        Task<PreOpTestResultDto?> GetResultByIdAsync(Guid id, Guid tenantId);
        Task<PreOpTestResultDto> CreateResultAsync(CreatePreOpTestResultRequest request, Guid tenantId);
        Task<PreOpTestResultDto?> UpdateResultAsync(Guid id, UpdatePreOpTestResultRequest request, Guid tenantId);
        Task<bool> DeleteResultAsync(Guid id, Guid tenantId);

        // Fitness Clearances
        Task<List<PreOpFitnessClearanceDto>> GetOrderClearancesAsync(Guid orderId, Guid tenantId);
        Task<PreOpFitnessClearanceDto?> GetClearanceByIdAsync(Guid id, Guid tenantId);
        Task<PreOpFitnessClearanceDto> CreateClearanceAsync(CreatePreOpFitnessClearanceRequest request, Guid tenantId);
        Task<PreOpFitnessClearanceDto?> UpdateClearanceAsync(Guid id, UpdateFitnessClearanceRequest request, Guid tenantId);
        Task<PreOpFitnessClearanceDto?> GrantClearanceAsync(Guid id, GrantClearanceRequest request, Guid tenantId, Guid userId);
        Task<bool> DeleteClearanceAsync(Guid id, Guid tenantId);

        // Summary
        Task<PreOpTestOrderSummary> GetOrderSummaryAsync(Guid orderId, Guid tenantId);
    }
}
