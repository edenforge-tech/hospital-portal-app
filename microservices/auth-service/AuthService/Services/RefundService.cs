using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AuthService.Services
{
    /// <summary>
    /// Service for refund management - requests, authorization, and processing
    /// </summary>
    public class RefundService : IRefundService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<RefundService> _logger;

        public RefundService(AppDbContext context, ILogger<RefundService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<Refund> RequestRefundAsync(Guid billId, decimal amount, string reason, Guid requestedBy)
        {
            try
            {
                _logger.LogInformation("Requesting refund for BillId: {BillId}, Amount: {Amount}", billId, amount);

                // Fetch the bill to validate and get tenant/patient info
                var bill = await _context.OpdBills
                    .Where(b => b.Id == billId && b.DeletedAt == null)
                    .FirstOrDefaultAsync();

                if (bill == null)
                {
                    throw new InvalidOperationException($"Bill with ID {billId} not found");
                }

                // Validate refund amount
                if (amount <= 0 || amount > bill.AmountPaid)
                {
                    throw new InvalidOperationException($"Invalid refund amount. Amount paid: {bill.AmountPaid}");
                }

                // Check if bill is already refunded
                if (bill.RefundStatus == "completed")
                {
                    throw new InvalidOperationException("Bill has already been fully refunded");
                }

                // Get visit ID if exists
                var visit = await _context.Visits
                    .Where(v => v.OpdBillId == billId && v.DeletedAt == null)
                    .FirstOrDefaultAsync();

                var refund = new Refund
                {
                    Id = Guid.NewGuid(),
                    BillId = billId,
                    PatientId = bill.PatientId,
                    VisitId = visit?.Id,
                    RefundAmount = amount,
                    RefundReason = reason,
                    RequestedByUserId = requestedBy,
                    RequestedAt = DateTime.UtcNow,
                    Status = "pending",
                    TenantId = bill.TenantId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Refunds.Add(refund);

                // Update bill refund status
                bill.RefundStatus = "requested";
                bill.RefundAmount = amount;
                bill.RefundReason = reason;
                bill.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Refund request created successfully. RefundId: {RefundId}", refund.Id);
                return refund;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error requesting refund for BillId: {BillId}", billId);
                throw;
            }
        }

        public async Task<Refund?> GetRefundByIdAsync(Guid refundId)
        {
            return await _context.Refunds
                .Include(r => r.Bill)
                .Include(r => r.Patient)
                .Include(r => r.RequestedByUser)
                .Include(r => r.AuthorizedByUser)
                .Where(r => r.Id == refundId)
                .FirstOrDefaultAsync();
        }

        public async Task<List<Refund>> GetRefundsByBillIdAsync(Guid billId)
        {
            return await _context.Refunds
                .Include(r => r.RequestedByUser)
                .Include(r => r.AuthorizedByUser)
                .Where(r => r.BillId == billId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Refund>> GetRefundsByPatientIdAsync(Guid patientId)
        {
            return await _context.Refunds
                .Include(r => r.Bill)
                .Include(r => r.RequestedByUser)
                .Include(r => r.AuthorizedByUser)
                .Where(r => r.PatientId == patientId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Refund>> GetPendingRefundsAsync(Guid tenantId)
        {
            return await _context.Refunds
                .Include(r => r.Bill)
                .Include(r => r.Patient)
                .Include(r => r.RequestedByUser)
                .Where(r => r.TenantId == tenantId && r.Status == "pending")
                .OrderBy(r => r.RequestedAt)
                .ToListAsync();
        }

        public async Task<Refund> AuthorizeRefundAsync(Guid refundId, bool approved, Guid authorizedBy, string? notes = null)
        {
            try
            {
                var refund = await _context.Refunds
                    .Include(r => r.Bill)
                    .Where(r => r.Id == refundId)
                    .FirstOrDefaultAsync();

                if (refund == null)
                {
                    throw new InvalidOperationException($"Refund with ID {refundId} not found");
                }

                if (refund.Status != "pending")
                {
                    throw new InvalidOperationException($"Refund is not in pending status. Current status: {refund.Status}");
                }

                refund.Status = approved ? "approved" : "rejected";
                refund.AuthorizedByUserId = authorizedBy;
                refund.AuthorizedAt = DateTime.UtcNow;
                
                if (!string.IsNullOrEmpty(notes))
                {
                    refund.Notes = notes;
                }

                // Update bill status
                if (refund.Bill != null)
                {
                    refund.Bill.RefundStatus = approved ? "approved" : "rejected";
                    refund.Bill.UpdatedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Refund {RefundId} {Status} by {AuthorizedBy}", 
                    refundId, refund.Status, authorizedBy);

                return refund;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error authorizing refund {RefundId}", refundId);
                throw;
            }
        }

        public async Task<Refund> CompleteRefundAsync(Guid refundId, string refundMode, string? notes = null)
        {
            try
            {
                var refund = await _context.Refunds
                    .Include(r => r.Bill)
                    .Where(r => r.Id == refundId)
                    .FirstOrDefaultAsync();

                if (refund == null)
                {
                    throw new InvalidOperationException($"Refund with ID {refundId} not found");
                }

                if (refund.Status != "approved")
                {
                    throw new InvalidOperationException($"Refund must be approved before completion. Current status: {refund.Status}");
                }

                refund.Status = "completed";
                refund.RefundMode = refundMode;
                
                if (!string.IsNullOrEmpty(notes))
                {
                    refund.Notes = (refund.Notes ?? "") + "\n" + notes;
                }

                // Update bill
                if (refund.Bill != null)
                {
                    refund.Bill.RefundStatus = "completed";
                    refund.Bill.AmountPaid -= refund.RefundAmount;
                    refund.Bill.BalanceDue += refund.RefundAmount;
                    refund.Bill.UpdatedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Refund {RefundId} completed via {RefundMode}", refundId, refundMode);
                return refund;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error completing refund {RefundId}", refundId);
                throw;
            }
        }

        public async Task<Refund> RejectRefundAsync(Guid refundId, Guid rejectedBy, string reason)
        {
            return await AuthorizeRefundAsync(refundId, false, rejectedBy, reason);
        }

        public async Task<RefundStatistics> GetRefundStatisticsAsync(Guid tenantId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                var query = _context.Refunds
                    .Where(r => r.TenantId == tenantId);

                if (fromDate.HasValue)
                {
                    query = query.Where(r => r.CreatedAt >= fromDate.Value);
                }

                if (toDate.HasValue)
                {
                    query = query.Where(r => r.CreatedAt <= toDate.Value);
                }

                var refunds = await query.ToListAsync();

                return new RefundStatistics
                {
                    TotalRequests = refunds.Count,
                    PendingRequests = refunds.Count(r => r.Status == "pending"),
                    ApprovedRequests = refunds.Count(r => r.Status == "approved"),
                    CompletedRequests = refunds.Count(r => r.Status == "completed"),
                    RejectedRequests = refunds.Count(r => r.Status == "rejected"),
                    TotalRefundAmount = refunds.Sum(r => r.RefundAmount),
                    CompletedRefundAmount = refunds.Where(r => r.Status == "completed").Sum(r => r.RefundAmount)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting refund statistics for TenantId: {TenantId}", tenantId);
                throw;
            }
        }
    }
}
