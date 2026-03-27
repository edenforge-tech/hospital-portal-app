using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using AuthService.Context;
using AuthService.Models.Counselor;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services
{
    public class PaymentProcessingService : IPaymentProcessingService
    {
        private readonly AppDbContext _context;
        private readonly IBranchCacheService _branchCache;

        public PaymentProcessingService(AppDbContext context, IBranchCacheService branchCache)
        {
            _context = context;
            _branchCache = branchCache;
        }

        // ==================== Payment Transactions ====================

        public async Task<PaymentListResponse> GetAllPaymentsAsync(int page, int pageSize, Guid? sessionId)
        {
            var query = _context.PaymentTransactions
                .Where(p => p.DeletedAt == null);

            if (sessionId.HasValue)
                query = query.Where(p => p.SessionId == sessionId.Value);

            var totalRecords = await query.CountAsync();
            var payments = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var paymentDtos = payments.Select(ToPaymentDto).ToList();

            // Hydrate patient names and MRNs
            var patientIds = paymentDtos.Select(p => p.PatientId).Distinct().ToList();
            if (patientIds.Any())
            {
                var patientData = await _context.Patients
                    .Where(p => patientIds.Contains(p.Id))
                    .Select(p => new { p.Id, FullName = p.FirstName + " " + p.LastName, p.MedicalRecordNumber })
                    .ToListAsync();
                
                var patientNames = patientData.ToDictionary(p => p.Id, p => p.FullName);
                var patientMrns = patientData.ToDictionary(p => p.Id, p => p.MedicalRecordNumber);

                foreach (var payment in paymentDtos)
                {
                    payment.PatientName = patientNames.GetValueOrDefault(payment.PatientId);
                    payment.PatientMrn = patientMrns.GetValueOrDefault(payment.PatientId);
                }
            }

            return new PaymentListResponse
            {
                TotalRecords = totalRecords,
                Payments = paymentDtos
            };
        }

        public async Task<PaymentTransactionDto?> GetPaymentByIdAsync(Guid id)
        {
            var payment = await _context.PaymentTransactions
                .FirstOrDefaultAsync(p => p.Id == id && p.DeletedAt == null);
            
            if (payment == null) return null;

            var paymentDto = ToPaymentDto(payment);

            // Hydrate patient name and MRN
            var patient = await _context.Patients
                .Where(p => p.Id == paymentDto.PatientId)
                .Select(p => new { p.FirstName, p.LastName, p.MedicalRecordNumber })
                .FirstOrDefaultAsync();
            
            if (patient != null)
            {
                paymentDto.PatientName = patient.FirstName + " " + patient.LastName;
                paymentDto.PatientMrn = patient.MedicalRecordNumber;
            }

            return paymentDto;
        }

        public async Task<PaymentTransactionDto?> GetPaymentByTransactionNumberAsync(string transactionNumber)
        {
            var payment = await _context.PaymentTransactions
                .FirstOrDefaultAsync(p => p.TransactionNumber == transactionNumber && p.DeletedAt == null);
            
            return payment != null ? ToPaymentDto(payment) : null;
        }

        public async Task<PaymentTransactionDto> CreatePaymentAsync(CreatePaymentRequest request, Guid tenantId, Guid userId)
        {
            var branch = await _branchCache.GetDefaultBranchForTenantAsync(tenantId);
            if (branch == null)
                throw new InvalidOperationException("Branch not found for tenant");

            var payment = new PaymentTransaction
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                BranchId = branch.Id,
                SessionId = request.SessionId,
                PatientId = request.PatientId,
                PackageId = request.PackageId,
                TransactionNumber = GenerateTransactionNumber(),
                TransactionDate = DateTime.UtcNow,
                TotalBillAmount = request.TotalBillAmount,
                DiscountAmount = request.DiscountAmount,
                NetPayableAmount = request.TotalBillAmount - request.DiscountAmount,
                AmountPaid = 0,
                BalanceDue = request.TotalBillAmount - request.DiscountAmount,
                PaymentMethod = request.PaymentMethod,
                PaymentStatus = "Pending",
                GovernmentSchemeClaimId = request.GovernmentSchemeClaimId,
                InsurancePreAuthId = request.InsurancePreAuthId,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = userId
            };

            // Handle Mixed Payment Breakdown
            if (request.PaymentMethod == "Mixed" && request.MixedPaymentBreakdown != null)
            {
                payment.PaymentBreakdown = JsonSerializer.Serialize(request.MixedPaymentBreakdown);
            }

            // Handle Card Payment Details
            if (request.PaymentMethod == "Card")
            {
                payment.CardLastFour = request.CardLastFour;
                payment.CardType = request.CardType;
                payment.CardApprovalCode = request.CardApprovalCode;
            }

            // Handle UPI Details
            if (request.PaymentMethod == "UPI")
            {
                payment.UpiTransactionId = request.UpiTransactionId;
                payment.UpiVpa = request.UpiVpa;
            }

            // Handle Cheque Details
            if (request.PaymentMethod == "Cheque")
            {
                payment.ChequeNumber = request.ChequeNumber;
                payment.ChequeDate = request.ChequeDate;
                payment.ChequeBankName = request.ChequeBankName;
                payment.ChequeClearanceStatus = "Pending";
            }

            // Handle Bank Transfer
            if (request.PaymentMethod == "BankTransfer")
            {
                payment.BankReferenceNumber = request.BankReferenceNumber;
                payment.BankName = request.BankName;
                payment.TransferDate = request.TransferDate;
            }

            _context.PaymentTransactions.Add(payment);
            await _context.SaveChangesAsync();

            return ToPaymentDto(payment);
        }

        public async Task<PaymentTransactionDto> ProcessPaymentAsync(Guid id, ProcessPaymentRequest request, Guid userId)
        {
            var payment = await _context.PaymentTransactions
                .FirstOrDefaultAsync(p => p.Id == id && p.DeletedAt == null);

            if (payment == null)
                throw new InvalidOperationException("Payment not found");

            payment.PaymentStatus = request.PaymentStatus;
            payment.AmountPaid = request.ActualAmountPaid;
            payment.BalanceDue = payment.NetPayableAmount - request.ActualAmountPaid;
            payment.UpdatedAt = DateTime.UtcNow;
            payment.UpdatedByUserId = userId;

            // Handle Online Payment Gateway Response
            if (!string.IsNullOrEmpty(request.RazorpayPaymentId))
            {
                payment.RazorpayPaymentId = request.RazorpayPaymentId;
                payment.RazorpaySignature = request.RazorpaySignature;
                payment.GatewayResponse = request.GatewayResponse;
            }

            // Generate Receipt if payment completed
            if (request.PaymentStatus == "Completed")
            {
                payment.ReceiptNumber = GenerateReceiptNumber();
                payment.ReceiptGeneratedAt = DateTime.UtcNow;
                // TODO: Generate PDF receipt and upload to cloud storage
            }

            await _context.SaveChangesAsync();
            return ToPaymentDto(payment);
        }

        public async Task<PaymentTransactionDto> ProcessRefundAsync(Guid id, RefundPaymentRequest request, Guid userId)
        {
            var payment = await _context.PaymentTransactions
                .FirstOrDefaultAsync(p => p.Id == id && p.DeletedAt == null);

            if (payment == null)
                throw new InvalidOperationException("Payment not found");

            if (payment.PaymentStatus != "Completed")
                throw new InvalidOperationException("Can only refund completed payments");

            payment.RefundAmount = request.RefundAmount;
            payment.RefundDate = DateTime.UtcNow;
            payment.RefundReason = request.RefundReason;
            payment.RefundReferenceNumber = request.RefundReferenceNumber;
            payment.PaymentStatus = "Refunded";
            payment.UpdatedAt = DateTime.UtcNow;
            payment.UpdatedByUserId = userId;

            await _context.SaveChangesAsync();
            return ToPaymentDto(payment);
        }

        public async Task<bool> DeletePaymentAsync(Guid id)
        {
            var payment = await _context.PaymentTransactions.FindAsync(id);
            if (payment == null) return false;

            payment.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<PaymentSummary> GetPaymentSummaryAsync(DateTime? startDate, DateTime? endDate, Guid? branchId)
        {
            var query = _context.PaymentTransactions
                .Where(p => p.DeletedAt == null && p.PaymentStatus == "Completed");

            if (startDate.HasValue)
                query = query.Where(p => p.TransactionDate >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(p => p.TransactionDate <= endDate.Value);

            if (branchId.HasValue)
                query = query.Where(p => p.BranchId == branchId.Value);

            var payments = await query.ToListAsync();

            return new PaymentSummary
            {
                TotalRevenue = payments.Sum(p => p.AmountPaid),
                CashAmount = payments.Where(p => p.PaymentMethod == "Cash").Sum(p => p.AmountPaid),
                CardAmount = payments.Where(p => p.PaymentMethod == "Card").Sum(p => p.AmountPaid),
                UpiAmount = payments.Where(p => p.PaymentMethod == "UPI").Sum(p => p.AmountPaid),
                InsuranceAmount = payments.Where(p => p.PaymentMethod == "Insurance").Sum(p => p.AmountPaid),
                GovernmentSchemeAmount = payments.Where(p => p.PaymentMethod == "GovernmentScheme").Sum(p => p.AmountPaid),
                TotalTransactions = payments.Count,
                PendingPayments = await _context.PaymentTransactions
                    .Where(p => p.DeletedAt == null && p.PaymentStatus == "Pending")
                    .CountAsync()
            };
        }

        // ==================== Payment Links ====================

        public async Task<PaymentLinkDto> GeneratePaymentLinkAsync(CreatePaymentLinkRequest request, Guid tenantId, Guid userId)
        {
            var paymentLink = new PaymentLink
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                TransactionId = request.TransactionId,
                SessionId = request.SessionId,
                PatientId = request.PatientId,
                PaymentLinkId = Guid.NewGuid().ToString("N").Substring(0, 16).ToUpper(), // Generate unique ID
                LinkAmount = request.LinkAmount,
                Currency = "INR",
                SentVia = request.SentVia,
                RecipientPhone = request.RecipientPhone,
                RecipientEmail = request.RecipientEmail,
                LinkStatus = "Active",
                ExpiresAt = DateTime.UtcNow.AddHours(request.ValidityHours),
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = userId
            };

            // TODO: Integrate with Razorpay to generate actual payment link
            paymentLink.ShortUrl = $"https://pay.example.com/{paymentLink.PaymentLinkId}";
            paymentLink.FullUrl = $"https://pay.example.com/payment/{paymentLink.PaymentLinkId}";
            paymentLink.QrCodeUrl = $"https://qr.example.com/{paymentLink.PaymentLinkId}.png";

            _context.PaymentLinks.Add(paymentLink);
            await _context.SaveChangesAsync();

            // TODO: Send SMS/Email/WhatsApp with payment link

            return ToPaymentLinkDto(paymentLink);
        }

        public async Task<PaymentLinkDto?> GetPaymentLinkByIdAsync(Guid id)
        {
            var link = await _context.PaymentLinks.FindAsync(id);
            return link != null ? ToPaymentLinkDto(link) : null;
        }

        public async Task<PaymentLinkStatusResponse> GetPaymentLinkStatusAsync(Guid id)
        {
            var link = await _context.PaymentLinks.FindAsync(id);
            if (link == null)
                throw new InvalidOperationException("Payment link not found");

            bool isExpired = link.ExpiresAt < DateTime.UtcNow;

            return new PaymentLinkStatusResponse
            {
                LinkId = link.Id,
                Status = link.LinkStatus,
                IsPaid = link.LinkStatus == "Paid",
                PaidAt = link.PaidAt,
                IsExpired = isExpired
            };
        }

        public async Task<bool> ExpirePaymentLinkAsync(Guid id)
        {
            var link = await _context.PaymentLinks.FindAsync(id);
            if (link == null) return false;

            link.LinkStatus = "Expired";
            await _context.SaveChangesAsync();
            return true;
        }

        // ==================== Government Scheme Claims ====================

        public async Task<List<GovernmentSchemeClaimDto>> GetAllGovernmentClaimsAsync(Guid? sessionId, string? schemeType)
        {
            var query = _context.GovernmentSchemeClaims
                .Where(c => c.DeletedAt == null);

            if (sessionId.HasValue)
                query = query.Where(c => c.SessionId == sessionId.Value);

            if (!string.IsNullOrEmpty(schemeType))
                query = query.Where(c => c.SchemeType == schemeType);

            var claims = await query.OrderByDescending(c => c.CreatedAt).ToListAsync();
            return claims.Select(ToGovernmentClaimDto).ToList();
        }

        public async Task<GovernmentSchemeClaimDto?> GetGovernmentClaimByIdAsync(Guid id)
        {
            var claim = await _context.GovernmentSchemeClaims
                .FirstOrDefaultAsync(c => c.Id == id && c.DeletedAt == null);
            
            return claim != null ? ToGovernmentClaimDto(claim) : null;
        }

        public async Task<GovernmentSchemeClaimDto> CreateGovernmentClaimAsync(CreateGovernmentClaimRequest request, Guid tenantId, Guid userId)
        {
            var branch = await _branchCache.GetDefaultBranchForTenantAsync(tenantId);
            if (branch == null)
                throw new InvalidOperationException("Branch not found for tenant");

            var claim = new GovernmentSchemeClaim
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                BranchId = branch.Id,
                SessionId = request.SessionId,
                PatientId = request.PatientId,
                PackageId = request.PackageId,
                ClaimNumber = GenerateClaimNumber(),
                SchemeType = request.SchemeType,
                BeneficiaryId = request.BeneficiaryId,
                BeneficiaryName = request.BeneficiaryName,
                SurgeryType = request.SurgeryType,
                ProcedureCode = request.ProcedureCode,
                TotalBillAmount = request.TotalBillAmount,
                PatientCopayAmount = request.PatientCopayAmount,
                ClaimStatus = "Draft",
                RequiredDocuments = request.RequiredDocuments?.ToArray(),
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = userId
            };

            _context.GovernmentSchemeClaims.Add(claim);
            await _context.SaveChangesAsync();

            return ToGovernmentClaimDto(claim);
        }

        public async Task<GovernmentSchemeClaimDto> SubmitGovernmentClaimAsync(Guid id, SubmitGovernmentClaimRequest request, Guid userId)
        {
            var claim = await _context.GovernmentSchemeClaims
                .FirstOrDefaultAsync(c => c.Id == id && c.DeletedAt == null);

            if (claim == null)
                throw new InvalidOperationException("Claim not found");

            claim.SubmissionReferenceNumber = request.SubmissionReferenceNumber;
            claim.SubmittedDocumentsUrls = request.SubmittedDocumentUrls.ToArray();
            claim.SubmittedToAuthorityAt = DateTime.UtcNow;
            claim.SubmittedByUserId = userId;
            claim.ClaimStatus = "SubmittedToAuthority";
            claim.UpdatedAt = DateTime.UtcNow;
            claim.UpdatedByUserId = userId;

            await _context.SaveChangesAsync();
            return ToGovernmentClaimDto(claim);
        }

        public async Task<GovernmentSchemeClaimDto> ProcessClaimApprovalAsync(Guid id, ProcessClaimApprovalRequest request, Guid userId)
        {
            var claim = await _context.GovernmentSchemeClaims
                .FirstOrDefaultAsync(c => c.Id == id && c.DeletedAt == null);

            if (claim == null)
                throw new InvalidOperationException("Claim not found");

            claim.ClaimStatus = request.ClaimStatus;
            claim.AuthorityApprovalNumber = request.AuthorityApprovalNumber;
            claim.AuthorityApprovalDate = request.AuthorityApprovalDate;
            claim.ApprovedAmount = request.ApprovedAmount;
            claim.RejectionReason = request.RejectionReason;
            claim.UpdatedAt = DateTime.UtcNow;
            claim.UpdatedByUserId = userId;

            await _context.SaveChangesAsync();
            return ToGovernmentClaimDto(claim);
        }

        public async Task<GovernmentSchemeClaimDto> RecordClaimPaymentAsync(Guid id, ClaimPaymentReceivedRequest request, Guid userId)
        {
            var claim = await _context.GovernmentSchemeClaims
                .FirstOrDefaultAsync(c => c.Id == id && c.DeletedAt == null);

            if (claim == null)
                throw new InvalidOperationException("Claim not found");

            claim.PaymentReceivedDate = request.PaymentReceivedDate;
            claim.PaymentReferenceNumber = request.PaymentReferenceNumber;
            claim.PaymentMode = request.PaymentMode;
            claim.ClaimStatus = "PaymentReceived";
            claim.UpdatedAt = DateTime.UtcNow;
            claim.UpdatedByUserId = userId;

            await _context.SaveChangesAsync();
            return ToGovernmentClaimDto(claim);
        }

        public async Task<bool> DeleteGovernmentClaimAsync(Guid id)
        {
            var claim = await _context.GovernmentSchemeClaims.FindAsync(id);
            if (claim == null) return false;

            claim.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        // ==================== Helper Methods ====================

        private string GenerateTransactionNumber()
        {
            return $"TXN{DateTime.UtcNow:yyyyMMddHHmmss}{new Random().Next(1000, 9999)}";
        }

        private string GenerateReceiptNumber()
        {
            return $"RCT{DateTime.UtcNow:yyyyMMdd}{new Random().Next(10000, 99999)}";
        }

        private string GenerateClaimNumber()
        {
            return $"CLM{DateTime.UtcNow:yyyyMMdd}{new Random().Next(1000, 9999)}";
        }

        private PaymentTransactionDto ToPaymentDto(PaymentTransaction payment)
        {
            return new PaymentTransactionDto
            {
                Id = payment.Id,
                SessionId = payment.SessionId,
                PatientId = payment.PatientId,
                PackageId = payment.PackageId,
                TransactionNumber = payment.TransactionNumber,
                TransactionDate = payment.TransactionDate,
                TotalBillAmount = payment.TotalBillAmount,
                DiscountAmount = payment.DiscountAmount,
                NetPayableAmount = payment.NetPayableAmount,
                AmountPaid = payment.AmountPaid,
                BalanceDue = payment.BalanceDue,
                PaymentMethod = payment.PaymentMethod,
                PaymentBreakdown = payment.PaymentBreakdown,
                PaymentStatus = payment.PaymentStatus,
                ReceiptNumber = payment.ReceiptNumber,
                ReceiptGeneratedAt = payment.ReceiptGeneratedAt,
                ReceiptUrl = payment.ReceiptUrl,
                Reconciled = payment.Reconciled,
                CreatedAt = payment.CreatedAt
            };
        }

        private PaymentLinkDto ToPaymentLinkDto(PaymentLink link)
        {
            return new PaymentLinkDto
            {
                Id = link.Id,
                TransactionId = link.TransactionId,
                SessionId = link.SessionId,
                PatientId = link.PatientId,
                PaymentLinkId = link.PaymentLinkId,
                ShortUrl = link.ShortUrl,
                FullUrl = link.FullUrl,
                QrCodeUrl = link.QrCodeUrl,
                LinkAmount = link.LinkAmount,
                LinkStatus = link.LinkStatus,
                ExpiresAt = link.ExpiresAt,
                PaidAt = link.PaidAt,
                SentVia = link.SentVia,
                CreatedAt = link.CreatedAt
            };
        }

        private GovernmentSchemeClaimDto ToGovernmentClaimDto(GovernmentSchemeClaim claim)
        {
            return new GovernmentSchemeClaimDto
            {
                Id = claim.Id,
                SessionId = claim.SessionId,
                PatientId = claim.PatientId,
                PackageId = claim.PackageId,
                ClaimNumber = claim.ClaimNumber,
                SchemeType = claim.SchemeType,
                BeneficiaryId = claim.BeneficiaryId,
                BeneficiaryName = claim.BeneficiaryName,
                SurgeryType = claim.SurgeryType,
                TotalBillAmount = claim.TotalBillAmount,
                SchemeCoveredAmount = claim.SchemeCoveredAmount,
                PatientCopayAmount = claim.PatientCopayAmount,
                ClaimStatus = claim.ClaimStatus,
                AuthorityApprovalNumber = claim.AuthorityApprovalNumber,
                AuthorityApprovalDate = claim.AuthorityApprovalDate,
                ApprovedAmount = claim.ApprovedAmount,
                CreatedAt = claim.CreatedAt
            };
        }
    }
}
