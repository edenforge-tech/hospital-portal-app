namespace InventoryApi.Models.Entities;

public class VendorBankAccount
{
    public Guid   Id                { get; set; }
    public Guid   TenantId          { get; set; }
    public Guid   VendorId          { get; set; }

    public string AccountHolderName { get; set; } = string.Empty;
    public string BankName          { get; set; } = string.Empty;
    public string AccountNumber     { get; set; } = string.Empty;
    public string IfscCode          { get; set; } = string.Empty;
    /// <summary>current | savings | cc | od</summary>
    public string AccountType       { get; set; } = "current";
    /// <summary>When true this is the default account pre-filled on new payments.</summary>
    public bool   IsPrimary         { get; set; }
    /// <summary>Optional short label the user can give the account e.g. "Main operating".</summary>
    public string? Nickname         { get; set; }

    // ── Standard audit columns ────────────────────────────────────────────────
    public DateTime  CreatedAt          { get; set; }
    public DateTime  UpdatedAt          { get; set; }
    public Guid?     CreatedByUserId    { get; set; }
    public Guid?     UpdatedByUserId    { get; set; }
    public DateTime? DeletedAt          { get; set; }
    public string    Status             { get; set; } = "active";

    // ── Navigation ────────────────────────────────────────────────────────────
    public Vendor? Vendor { get; set; }
}
