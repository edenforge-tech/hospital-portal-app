using AuthService.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AuthService.Services
{
    /// <summary>
    /// Service for checking IOL and medical supply availability across branches
    /// Phase 3 Enhancement - Feb 25, 2026
    /// 
    /// NOTE: This is a SIMPLIFIED implementation using simulated inventory data.
    /// Production version should integrate with actual inventory management system.
    /// </summary>
    public class InventoryAvailabilityService : IInventoryAvailabilityService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<InventoryAvailabilityService> _logger;
        
        public InventoryAvailabilityService(
            AppDbContext context,
            ILogger<InventoryAvailabilityService> logger)
        {
            _context = context;
            _logger = logger;
        }
        
        public async Task<ItemAvailability> GetIolAvailabilityAsync(Guid tenantId, Guid branchId, Guid iolCatalogId)
        {
            try
            {
                _logger.LogInformation("Checking IOL availability for {IolId} at branch {BranchId}", iolCatalogId, branchId);
                
                // Get IOL details
                var iol = await _context.IolMasters
                    .FirstOrDefaultAsync(i => i.Id == iolCatalogId && i.IsActive);
                
                if (iol == null)
                {
                    throw new InvalidOperationException($"IOL {iolCatalogId} not found");
                }
                
                // Get branch details
                var branch = await _context.Branches
                    .FirstOrDefaultAsync(b => b.Id == branchId && b.TenantId == tenantId);
                
                // MOCK INVENTORY DATA (Replace with actual inventory system integration)
                // Simulate stock levels based on IOL price range (look up from iol_prices table)
                var iolPrice = await _context.IolPrices
                    .Where(p => p.IolMasterId == iolCatalogId
                             && p.BranchId == null
                             && p.EffectiveTo == null
                             && p.IsActive
                             && p.DeletedAt == null)
                    .OrderByDescending(p => p.EffectiveFrom)
                    .Select(p => p.Amount)
                    .FirstOrDefaultAsync();
                var simulatedStock = SimulateStockLevel(iolPrice);
                
                var availability = new ItemAvailability
                {
                    ItemId = iolCatalogId,
                    ItemName = $"{iol.ModelName} - {iol.BrandManufacturer}",
                    BranchId = branchId,
                    BranchName = branch?.Name ?? "Unknown Branch",
                    StockOnHand = simulatedStock.TotalStock,
                    ReservedQuantity = simulatedStock.Reserved,
                    AvailableQuantity = simulatedStock.Available
                };
                
                // Determine availability status
                if (availability.AvailableQuantity > 5)
                {
                    availability.Status = AvailabilityStatus.Available;
                    availability.RequiresOrder = false;
                    availability.AvailabilityMessage = $"✅ {availability.AvailableQuantity} units available at your branch";
                }
                else if (availability.AvailableQuantity > 0)
                {
                    availability.Status = AvailabilityStatus.LowStock;
                    availability.RequiresOrder = false;
                    availability.AvailabilityMessage = $"⚠️ Low stock: Only {availability.AvailableQuantity} units available";
                }
                else
                {
                    // Check if available at other branches
                    var otherBranchesHaveStock = await CheckOtherBranchesAsync(tenantId, branchId, iolCatalogId);
                    
                    if (otherBranchesHaveStock)
                    {
                        availability.Status = AvailabilityStatus.AvailableAtOtherBranch;
                        availability.CanTransferFromOtherBranch = true;
                        availability.RequiresOrder = false;
                        availability.EstimatedAvailabilityDays = 2; // 2 days for inter-branch transfer
                        availability.AvailabilityMessage = "🟡 Available at other branches (2-day transfer)";
                    }
                    else
                    {
                        availability.Status = AvailabilityStatus.OutOfStock;
                        availability.RequiresOrder = true;
                        availability.EstimatedAvailabilityDays = await GetEstimatedAvailabilityDaysAsync(tenantId, branchId, iolCatalogId);
                        availability.AvailabilityMessage = $"🔴 Out of stock (order required, {availability.EstimatedAvailabilityDays} days)";
                    }
                }
                
                return availability;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking IOL availability for {IolId}", iolCatalogId);
                throw;
            }
        }
        
        public async Task<List<BranchAvailability>> GetIolAvailabilityAcrossBranchesAsync(Guid tenantId, Guid iolCatalogId)
        {
            try
            {
                _logger.LogInformation("Checking IOL availability across all branches for {IolId}", iolCatalogId);
                
                var branches = await _context.Branches
                    .Where(b => b.TenantId == tenantId && b.DeletedAt == null && b.IsActive)
                    .ToListAsync();
                
                var availabilityList = new List<BranchAvailability>();
                
                foreach (var branch in branches)
                {
                    // Simulate stock for each branch (replace with actual inventory queries)
                    var simulatedStock = SimulateStockLevel(branch.Id.GetHashCode() % 100);
                    
                    var status = simulatedStock.Available > 5 
                        ? AvailabilityStatus.Available 
                        : simulatedStock.Available > 0 
                            ? AvailabilityStatus.LowStock 
                            : AvailabilityStatus.OutOfStock;
                    
                    availabilityList.Add(new BranchAvailability
                    {
                        BranchId = branch.Id,
                        BranchName = branch.Name,
                        BranchCode = branch.BranchCode ?? string.Empty,
                        AvailableQuantity = simulatedStock.Available,
                        Status = status,
                        IsCurrentBranch = false, // Caller should set this
                        TransferCost = status != AvailabilityStatus.OutOfStock ? 500m : null, // ₹500 flat transfer cost
                        TransferTimeDays = status != AvailabilityStatus.OutOfStock ? 2 : null
                    });
                }
                
                return availabilityList.OrderByDescending(a => a.AvailableQuantity).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking IOL availability across branches for {IolId}", iolCatalogId);
                throw;
            }
        }
        
        public async Task<TransferEligibility> CheckTransferEligibilityAsync(
            Guid tenantId, 
            Guid fromBranchId, 
            Guid toBranchId, 
            Guid iolCatalogId, 
            int requestedQuantity)
        {
            try
            {
                _logger.LogInformation("Checking transfer eligibility from {FromBranch} to {ToBranch} for {IolId}", 
                    fromBranchId, toBranchId, iolCatalogId);
                
                // Check if source branch has stock
                var sourceAvailability = await GetIolAvailabilityAsync(tenantId, fromBranchId, iolCatalogId);
                
                if (sourceAvailability.AvailableQuantity < requestedQuantity)
                {
                    return new TransferEligibility
                    {
                        IsEligible = false,
                        RejectionReason = $"Insufficient stock at source branch (requested: {requestedQuantity}, available: {sourceAvailability.AvailableQuantity})"
                    };
                }
                
                // Check if branches belong to same tenant
                var sourceBranch = await _context.Branches.FindAsync(fromBranchId);
                var targetBranch = await _context.Branches.FindAsync(toBranchId);
                
                if (sourceBranch?.TenantId != targetBranch?.TenantId)
                {
                    return new TransferEligibility
                    {
                        IsEligible = false,
                        RejectionReason = "Inter-tenant transfers are not allowed"
                    };
                }
                
                // Transfer is eligible
                return new TransferEligibility
                {
                    IsEligible = true,
                    TransferCost = 500m, // Flat ₹500 transfer cost
                    EstimatedTransferDays = 2,
                    RequiresApproval = requestedQuantity > 10, // Approval needed for large transfers
                    ApprovalAuthority = null // TODO: Get branch manager from staff assignments
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking transfer eligibility from {FromBranch} to {ToBranch}", fromBranchId, toBranchId);
                throw;
            }
        }
        
        public async Task<int> GetEstimatedAvailabilityDaysAsync(Guid tenantId, Guid branchId, Guid iolCatalogId)
        {
            try
            {
                // Simulate lead time based on IOL origin
                var iol = await _context.IolMasters
                    .FirstOrDefaultAsync(i => i.Id == iolCatalogId && i.IsActive);
                
                if (iol == null) return 14; // Default 14 days
                
                // Indian IOLs: 5-7 days, Imported IOLs: 10-14 days
                return iol.Origin == "Indian" ? 7 : 14;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting estimated availability days for {IolId}", iolCatalogId);
                return 14; // Default fallback
            }
        }
        
        // ============================================================================
        // PRIVATE HELPER METHODS
        // ============================================================================
        
        /// <summary>
        /// Check if other branches have stock (simplified - simulated data)
        /// </summary>
        private async Task<bool> CheckOtherBranchesAsync(Guid tenantId, Guid currentBranchId, Guid iolCatalogId)
        {
            try
            {
                // In production, query actual inventory tables
                // For now, simulate 60% chance other branches have stock
                var branches = await _context.Branches
                    .Where(b => b.TenantId == tenantId && b.Id != currentBranchId && b.IsActive)
                    .ToListAsync();
                
                // Simulate: larger tenants (more branches) have higher probability of stock elsewhere
                return branches.Count > 1 && new Random().Next(100) < 60;
            }
            catch
            {
                return false;
            }
        }
        
        /// <summary>
        /// Simulate stock levels based on item value (MOCK DATA - Replace with actual inventory system)
        /// Logic: Higher priced items typically have lower stock
        /// </summary>
        private (int TotalStock, int Reserved, int Available) SimulateStockLevel(decimal itemPrice)
        {
            var random = new Random(DateTime.Now.Millisecond);
            
            // Simulate based on price range
            if (itemPrice > 100000) // Premium IOLs (>₹1 lakh)
            {
                var total = random.Next(2, 8);
                var reserved = random.Next(0, Math.Min(2, total));
                return (total, reserved, total - reserved);
            }
            else if (itemPrice > 50000) // Mid-range IOLs (₹50K-₹1L)
            {
                var total = random.Next(5, 15);
                var reserved = random.Next(0, Math.Min(5, total));
                return (total, reserved, total - reserved);
            }
            else // Budget IOLs (<₹50K)
            {
                var total = random.Next(10, 30);
                var reserved = random.Next(0, Math.Min(8, total));
                return (total, reserved, total - reserved);
            }
        }
    }
}
