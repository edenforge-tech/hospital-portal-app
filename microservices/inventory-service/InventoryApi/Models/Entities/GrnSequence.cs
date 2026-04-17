namespace InventoryApi.Models.Entities;

/// <summary>GRN numbers are sequential per store per year: GRN/STORE/2025-26/0001</summary>
public class GrnSequence
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid StoreId { get; set; }
    public string FinancialYear { get; set; } = string.Empty; // e.g. "2025-26"
    public int LastSequence { get; set; } = 0;
    public DateTime UpdatedAt { get; set; }
}
