namespace InventoryApi.Models.Entities;

public class VendorQuote
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid RfqId { get; set; }
    public Guid VendorId { get; set; }
    public string QuoteNumber { get; set; } = string.Empty;
    /// <summary>Submitted | UnderReview | ClarificationRequested | Revised | Shortlisted | Ranked | Won | Lost | Disqualified</summary>
    public string QuoteStatus { get; set; } = "Submitted";
    public decimal TotalAmount { get; set; }
    public DateTime QuoteDate { get; set; }
    public DateTime? ValidUntil { get; set; }
    public string? VendorNotes { get; set; }
    public string? EvaluationNotes { get; set; }
    public decimal? EvaluationScore { get; set; }
    public int? RankPosition { get; set; }
    public string? ClarificationNotes { get; set; }
    public DateTime? ClarificationRequestedAt { get; set; }
    public DateTime? RevisedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string Status { get; set; } = "active";

    // Navigation
    public RfqHeader? Rfq { get; set; }
    public Vendor? Vendor { get; set; }
    public ICollection<VendorQuoteItem> Items { get; set; } = [];
}
