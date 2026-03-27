using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AuthService.Models.Counselor;

namespace AuthService.Services
{
    public interface IPaymentProcessingService
    {
        // Payment Transactions
        Task<PaymentListResponse> GetAllPaymentsAsync(int page, int pageSize, Guid? sessionId);
        Task<PaymentTransactionDto?> GetPaymentByIdAsync(Guid id);
        Task<PaymentTransactionDto?> GetPaymentByTransactionNumberAsync(string transactionNumber);
        Task<PaymentTransactionDto> CreatePaymentAsync(CreatePaymentRequest request, Guid tenantId, Guid userId);
        Task<PaymentTransactionDto> ProcessPaymentAsync(Guid id, ProcessPaymentRequest request, Guid userId);
        Task<PaymentTransactionDto> ProcessRefundAsync(Guid id, RefundPaymentRequest request, Guid userId);
        Task<bool> DeletePaymentAsync(Guid id);
        Task<PaymentSummary> GetPaymentSummaryAsync(DateTime? startDate, DateTime? endDate, Guid? branchId);

        // Payment Links
        Task<PaymentLinkDto> GeneratePaymentLinkAsync(CreatePaymentLinkRequest request, Guid tenantId, Guid userId);
        Task<PaymentLinkDto?> GetPaymentLinkByIdAsync(Guid id);
        Task<PaymentLinkStatusResponse> GetPaymentLinkStatusAsync(Guid id);
        Task<bool> ExpirePaymentLinkAsync(Guid id);

        // Government Scheme Claims
        Task<List<GovernmentSchemeClaimDto>> GetAllGovernmentClaimsAsync(Guid? sessionId, string? schemeType);
        Task<GovernmentSchemeClaimDto?> GetGovernmentClaimByIdAsync(Guid id);
        Task<GovernmentSchemeClaimDto> CreateGovernmentClaimAsync(CreateGovernmentClaimRequest request, Guid tenantId, Guid userId);
        Task<GovernmentSchemeClaimDto> SubmitGovernmentClaimAsync(Guid id, SubmitGovernmentClaimRequest request, Guid userId);
        Task<GovernmentSchemeClaimDto> ProcessClaimApprovalAsync(Guid id, ProcessClaimApprovalRequest request, Guid userId);
        Task<GovernmentSchemeClaimDto> RecordClaimPaymentAsync(Guid id, ClaimPaymentReceivedRequest request, Guid userId);
        Task<bool> DeleteGovernmentClaimAsync(Guid id);
    }
}
