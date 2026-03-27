using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AuthService.Services
{
    /// <summary>
    /// Service interface for checking item availability across branches
    /// Phase 3 Enhancement - Feb 25, 2026
    /// </summary>
    public interface IInventoryAvailabilityService
    {
        /// <summary>
        /// Get availability status for an IOL at a specific branch
        /// </summary>
        Task<ItemAvailability> GetIolAvailabilityAsync(Guid tenantId, Guid branchId, Guid iolCatalogId);
        
        /// <summary>
        /// Get availability status for an IOL across all branches in tenant
        /// </summary>
        Task<List<BranchAvailability>> GetIolAvailabilityAcrossBranchesAsync(Guid tenantId, Guid iolCatalogId);
        
        /// <summary>
        /// Check if inter-branch transfer is available for an item
        /// </summary>
        Task<TransferEligibility> CheckTransferEligibilityAsync(Guid tenantId, Guid fromBranchId, Guid toBranchId, Guid iolCatalogId, int requestedQuantity);
        
        /// <summary>
        /// Get estimated availability time if item needs to be ordered
        /// </summary>
        Task<int> GetEstimatedAvailabilityDaysAsync(Guid tenantId, Guid branchId, Guid iolCatalogId);
    }
    
    /// <summary>
    /// Availability status for a single item at a branch
    /// </summary>
    public class ItemAvailability
    {
        public Guid ItemId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public Guid BranchId { get; set; }
        public string BranchName { get; set; } = string.Empty;
        public int StockOnHand { get; set; }
        public int ReservedQuantity { get; set; }
        public int AvailableQuantity { get; set; }
        public AvailabilityStatus Status { get; set; }
        public bool RequiresOrder { get; set; }
        public int? EstimatedAvailabilityDays { get; set; }
        public bool CanTransferFromOtherBranch { get; set; }
        public string? AvailabilityMessage { get; set; }
    }
    
    /// <summary>
    /// Availability status across multiple branches
    /// </summary>
    public class BranchAvailability
    {
        public Guid BranchId { get; set; }
        public string BranchName { get; set; } = string.Empty;
        public string BranchCode { get; set; } = string.Empty;
        public int AvailableQuantity { get; set; }
        public AvailabilityStatus Status { get; set; }
        public bool IsCurrentBranch { get; set; }
        public decimal? TransferCost { get; set; }
        public int? TransferTimeDays { get; set; }
    }
    
    /// <summary>
    /// Transfer eligibility check result
    /// </summary>
    public class TransferEligibility
    {
        public bool IsEligible { get; set; }
        public string? RejectionReason { get; set; }
        public Guid? TransferPolicyId { get; set; }
        public decimal? TransferCost { get; set; }
        public int EstimatedTransferDays { get; set; }
        public bool RequiresApproval { get; set; }
        public Guid? ApprovalAuthority { get; set; }
    }
    
    /// <summary>
    /// Availability status enum
    /// </summary>
    public enum AvailabilityStatus
    {
        /// <summary>
        /// 🟢 In stock at current branch (>5 units)
        /// </summary>
        Available = 0,
        
        /// <summary>
        /// 🟡 Low stock at current branch (1-5 units)
        /// </summary>
        LowStock = 1,
        
        /// <summary>
        /// 🟠 Available at other branches (transfer possible)
        /// </summary>
        AvailableAtOtherBranch = 2,
        
        /// <summary>
        /// 🔴 Out of stock (order required)
        /// </summary>
        OutOfStock = 3
    }
}
