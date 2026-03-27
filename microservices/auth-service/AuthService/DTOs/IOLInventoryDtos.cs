using System;

namespace AuthService.DTOs
{
    public class IOLInventoryItemDto
    {
        public Guid? Id { get; set; }
        public Guid? BranchId { get; set; }
        
        // IOL Details
        public string Model { get; set; } = null!;
        public string Manufacturer { get; set; } = null!;
        public string Sku { get; set; } = null!;
        public string Type { get; set; } = null!;
        public string Material { get; set; } = "Acrylic";
        
        // Optical Properties
        public decimal AConstant { get; set; }
        public decimal PowerRangeMin { get; set; }
        public decimal PowerRangeMax { get; set; }
        public decimal PowerIncrement { get; set; }
        public decimal OpticDiameter { get; set; }
        public decimal OverallDiameter { get; set; }
        
        // For Toric IOLs
        public string? CylinderPowerRange { get; set; }
        public string? Toricity { get; set; }
        
        // Stock Management
        public int CurrentStock { get; set; }
        public int MinimumStock { get; set; }
        public int ReorderQuantity { get; set; }
        public string? Location { get; set; }
        
        // Pricing
        public decimal UnitPrice { get; set; }
        public decimal? SupplierCost { get; set; }
        
        // Supplier Info
        public Guid? SupplierId { get; set; }
        public string? SupplierName { get; set; }
        public int? LeadTimeDays { get; set; }
        
        // Usage Tracking
        public int TotalUsed { get; set; }
        public DateTime? LastUsedDate { get; set; }
        
        // Additional Info
        public string? Notes { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string? BatchNumber { get; set; }
        
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string Status { get; set; } = "active";
    }

    public class StockAdjustmentDto
    {
        public Guid ItemId { get; set; }
        public int Quantity { get; set; }
        public string Type { get; set; } = null!;
        public string Reason { get; set; } = null!;
        public Guid? PatientId { get; set; }
        public Guid? SurgeryId { get; set; }
        public string? BatchNumber { get; set; }
        public DateTime? ExpiryDate { get; set; }
    }

    public class IOLStatisticsDto
    {
        public int TotalItems { get; set; }
        public int TotalStock { get; set; }
        public int LowStockCount { get; set; }
        public decimal TotalValue { get; set; }
        public int MonofocalCount { get; set; }
        public int MultifocalCount { get; set; }
        public int ToricCount { get; set; }
        public int EdofCount { get; set; }
        public int MonthlyUsage { get; set; }
        public List<TopUsedModel>? TopUsedModels { get; set; }
    }

    public class TopUsedModel
    {
        public string Model { get; set; } = null!;
        public int Count { get; set; }
    }
}
