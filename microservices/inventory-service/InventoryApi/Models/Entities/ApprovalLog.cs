namespace InventoryApi.Models.Entities;

public class ApprovalLog
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid InvoiceId { get; set; }
    public Guid UserId { get; set; }
    /// <summary>PrimaryApproval | FinalApproval | Rejection | Override</summary>
    public string Action { get; set; } = string.Empty;
    public string? Remarks { get; set; }
    public DateTime ActionAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string Status { get; set; } = "active";

    // Navigation
    public PurchaseInvoice? Invoice { get; set; }
}
