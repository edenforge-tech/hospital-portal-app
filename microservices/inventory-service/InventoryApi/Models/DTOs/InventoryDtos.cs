namespace InventoryApi.Models.DTOs;

// ── Shared ────────────────────────────────────────────────────────────────────
public record PagedResult<T>(IReadOnlyList<T> Items, int Total, int Page, int PageSize);

// ── Vendor ────────────────────────────────────────────────────────────────────
public record VendorDto(
    Guid     Id,
    string   Name,
    string?  ContactPerson,
    string?  Phone,
    string?  Email,
    string?  GstNumber,
    string?  PanNumber,
    string?  DrugLicenseNumber,
    string?  DrugLicense20B,
    string?  DrugLicense21B,
    string?  CinNumber,
    string?  SwiftCode,
    decimal? LatePaymentInterestRate,
    bool     IsColdChainVendor,
    DateTime? DrugLicenseExpiry,
    string?  ApmcRegistration,
    string?  FoodLicenseNumber,
    string?  ImportExportCode,
    decimal  CreditDays,
    decimal  OutstandingBalance,
    string   Status
);

public record CreateVendorRequest(
    string   Name,
    string?  ContactPerson,
    string?  Phone,
    string?  Email,
    string?  Address,
    string?  GstNumber,
    string?  PanNumber,
    string?  DrugLicenseNumber,
    string?  DrugLicense20B,
    string?  DrugLicense21B,
    string?  CinNumber,
    string?  SwiftCode,
    decimal? LatePaymentInterestRate,
    bool     IsColdChainVendor,
    DateTime? DrugLicenseExpiry,
    string?  ApmcRegistration,
    string?  FoodLicenseNumber,
    string?  ImportExportCode,
    string?  BankName,
    string?  BankAccountNumber,
    string?  BankIfscCode,
    decimal  CreditDays = 30
);

// ── Item ──────────────────────────────────────────────────────────────────────
public record ItemDto(
    Guid     Id,
    Guid?    CategoryId,
    string   ItemName,
    string?  GenericName,
    string?  Brand,
    string?  HsnCode,
    string   Unit,
    string?  ScheduleType,
    bool     RequiresColdStorage,
    bool     IsBarcodeTracked,
    string   ItemType,
    decimal  ReorderLevel,
    decimal  ReorderQuantity,
    string?  DefaultGstRate,
    Guid?    LinkedInjectorItemId,
    bool     IsSerialized,
    bool     IsAssetItem,
    string?  MdrClassification,
    string   Status
);

public record CreateItemRequest(
    string   ItemName,
    string?  GenericName,
    string?  Brand,
    Guid?    CategoryId,
    string?  HsnCode,
    string   Unit,
    string?  ScheduleType,
    bool     RequiresColdStorage,
    bool     IsBarcodeTracked,
    string   ItemType,
    decimal  ReorderLevel,
    decimal  ReorderQuantity,
    string?  DefaultGstRate,
    Guid?    LinkedInjectorItemId,
    bool     IsSerialized = false,
    bool     IsAssetItem  = false,
    string?  MdrClassification = null
);

// ── Purchase Invoice ───────────────────────────────────────────────────────────
public record PurchaseInvoiceDto(
    Guid     Id,
    Guid     VendorId,
    string   VendorName,
    Guid     StoreId,
    string   StoreName,
    string   InvoiceNumber,
    DateTime InvoiceDate,
    string?  DeliveryChallNumber,
    DateTime? DeliveryChallDate,
    string?  VendorOrderNumber,
    string?  VendorSapNumber,
    string   BillingMode,
    string?  PatientName,
    string?  PatientIpNo,
    decimal  GrossAmount,
    decimal  DiscountAmount,
    decimal  TaxableAmount,
    decimal  TotalGst,
    decimal  TcsPercent,
    decimal  TcsAmount,
    decimal  NetAmount,
    decimal  PaidAmount,
    decimal  BalanceAmount,
    string   ApprovalStatus,
    DateTime CreatedAt,
    List<PurchaseItemDto> Items,
    string?   GrnNumber         = null,
    string?   InvoiceType       = null,
    string?   PaymentMode       = null,
    int?      CreditPeriod      = null,
    DateTime? DueDate           = null,
    string?   Reference         = null,
    string?   PurchaseCategory  = null
);

public record PurchaseItemDto(
    Guid     Id,
    Guid     ItemId,
    string   ItemName,
    decimal  OrderedQuantity,
    decimal  ReceivedQuantity,
    decimal  RejectedQuantity,
    decimal  FreeQuantity,
    string?  BatchNumber,
    DateTime? ExpiryDate,
    string?  Barcode,
    decimal  OriginalMrp,
    decimal  Mrp,
    decimal  PurchaseRate,
    decimal  DiscountPercent,
    bool     IsFullDiscount,
    string?  HsnCode,
    decimal  GstPercent,
    decimal  CgstPercent,
    decimal  SgstPercent,
    decimal  IgstPercent,
    decimal  NetAmount,
    string?  PatientName,
    string?  PatientIpNo,
    string?  ItemRemarks,
    // Extended display fields (A3)
    decimal  Packing,
    decimal  UnitsPerPack,
    decimal  SellingPrice,
    decimal  MrpOnPack,
    decimal  TransferMrp,
    bool     IsAssetItem,
    bool     TaxOnFree,
    bool     IsReplacement
);

public record CreateInvoiceRequest(
    Guid     VendorId,
    Guid     StoreId,
    string   InvoiceNumber,
    DateTime InvoiceDate,
    string?  DeliveryChallNumber,
    DateTime? DeliveryChallDate,
    string?  VendorOrderNumber,
    string?  VendorDeliveryNoteNumber,
    string?  VendorSapNumber,
    string?  VendorBatchRef,
    string   BillingMode,
    string?  PatientName,
    string?  PatientIpNo,
    decimal  TcsPercent,
    string?  Remarks,
    List<CreatePurchaseItemRequest> Items,
    // Extended fields (A1) — all optional for backwards compatibility
    string?  InvoiceType        = null,  // "Invoice" | "PackingSlip"
    string?  PaymentMode        = null,  // "Cash" | "Credit" | "Cheque" | "Online"
    int?     CreditPeriod       = null,
    DateTime? DueDate           = null,
    string?  Reference          = null,
    string?  PurchaseCategory   = null
);

public record CreatePurchaseItemRequest(
    Guid     ItemId,
    decimal  OrderedQuantity,
    decimal  FreeQuantity,
    string?  BatchNumber,
    DateTime? ExpiryDate,
    string?  Barcode,
    decimal  OriginalMrp,
    decimal  Mrp,
    decimal  PurchaseRate,
    decimal  DiscountPercent,
    bool     IsFullDiscount,
    string?  HsnCode,
    decimal  GstPercent,
    decimal  CgstPercent,
    decimal  SgstPercent,
    decimal  IgstPercent,
    string?  PatientName,
    string?  PatientIpNo,
    Guid?    SurgeryId,
    string?  ItemRemarks,
    // Extended GST form fields (A2) — all optional
    decimal  SellingPrice   = 0,
    decimal  Packing        = 0,
    decimal  UnitsPerPack   = 0,
    decimal  MrpOnPack      = 0,
    decimal  TransferMrp    = 0,
    bool     IsAssetItem    = false,
    bool     TaxOnFree      = false,
    bool     IsReplacement  = false
);

public record UpdateInvoiceRequest(
    string?   InvoiceNumber    = null,
    DateTime? InvoiceDate      = null,
    string?   InvoiceType      = null,
    string?   PaymentMode      = null,
    int?      CreditPeriod     = null,
    DateTime? DueDate          = null,
    string?   Reference        = null,
    string?   PurchaseCategory = null
);

public record UpdateInvoiceItemDto(
    Guid?     Id               = null,
    Guid      ItemId           = default,
    decimal   OrderedQuantity  = 1,
    decimal   ReceivedQuantity = 0,
    decimal   FreeQuantity     = 0,
    string?   BatchNumber      = null,
    DateTime? ExpiryDate       = null,
    string?   Barcode          = null,
    decimal   OriginalMrp      = 0,
    decimal   Mrp              = 0,
    decimal   PurchaseRate     = 0,
    decimal   DiscountPercent  = 0,
    bool      IsFullDiscount   = false,
    string?   HsnCode          = null,
    decimal   GstPercent       = 0,
    decimal   CgstPercent      = 0,
    decimal   SgstPercent      = 0,
    decimal   IgstPercent      = 0,
    string?   ItemRemarks      = null
);

public record UpdateInvoiceItemsRequest(List<UpdateInvoiceItemDto> Items);

// ── GRN ───────────────────────────────────────────────────────────────────────
public record GrnHeaderDto(
    Guid     Id,
    Guid     InvoiceId,
    string   InvoiceNumber,
    Guid     StoreId,
    string?  GrnNumber,
    DateTime GrnDate,
    string   GrnStatus,
    string?  Remarks,
    List<GrnItemDto> Items,
    // Extended display fields (A4)
    Guid     VendorId,
    string   VendorName,
    DateTime InvoiceDate,
    DateTime? DueDate,
    decimal  NetAmount,
    decimal  TotalAmount,
    string?  PurchaseCategory  = null,
    string?  PaymentMode       = null,
    string?  StoreName         = null
);

public record GrnItemDto(
    Guid     Id,
    Guid     PurchaseItemId,
    Guid     ItemId,
    string   ItemName,
    decimal  AcceptedQuantity,
    decimal  RejectedQuantity,
    string?  RejectionReason,
    bool     IsVerified,
    string?  Barcode,
    // Extended purchase item display fields (A5)
    decimal  OrderedQuantity,
    string?  BatchNumber,
    DateTime? ExpiryDate,
    decimal  PurchaseRate,
    decimal  Mrp,
    decimal  CgstPercent,
    decimal  SgstPercent,
    decimal  IgstPercent,
    decimal  CgstAmount,
    decimal  SgstAmount,
    decimal  IgstAmount,
    decimal  Packing,
    decimal  FreeQuantity,
    decimal  PurchaseCost
);

public record CreateGrnRequest(
    Guid     InvoiceId,
    Guid     StoreId,
    DateTime GrnDate,
    string?  Remarks,
    List<CreateGrnItemRequest> Items
);

public record CreateGrnItemRequest(
    Guid     PurchaseItemId,
    Guid     ItemId,
    decimal  AcceptedQuantity,
    decimal  RejectedQuantity,
    string?  RejectionReason,
    string?  Barcode
);

// ── Stock ─────────────────────────────────────────────────────────────────────
public record StockSummaryDto(
    Guid     StoreId,
    string   StoreName,
    Guid     ItemId,
    string   ItemName,
    string?  GenericName,
    string   Unit,
    decimal  TotalAvailable,
    DateTime? NearestExpiry,
    int      BatchCount,
    decimal  ReorderLevel,
    bool     BelowReorder
);

public record StockBatchDto(
    Guid     Id,
    Guid     ItemId,
    string   ItemName,
    string   BatchNumber,
    DateTime? ExpiryDate,
    string?  Barcode,
    decimal  Mrp,
    decimal  PurchaseRate,
    decimal  QuantityAvailable
);

/// <summary>
/// Returned by GET inventory/stock/cold-chain-alerts.
/// Identifies stock batches that require refrigeration but are stored in a
/// non-refrigerated store, which is a compliance violation.
/// </summary>
public record ColdChainAlertDto(
    Guid      BatchId,
    Guid      ItemId,
    string    ItemName,
    Guid      StoreId,
    string    StoreName,
    string    StoreType,
    string    BatchNumber,
    DateTime? ExpiryDate,
    decimal   QuantityAvailable
);

public record StockTransferRequest(
    Guid     FromStoreId,
    Guid     ToStoreId,
    DateTime TransferDate,
    string?  Remarks,
    List<TransferItemRequest> Items
);

public record TransferItemRequest(
    Guid     ItemId,
    Guid     StockBatchId,
    decimal  TransferQuantity
);

public record CancelTransferRequest(string? Reason);

// ── Pharmacy Bill ─────────────────────────────────────────────────────────────
public record CreatePharmacyBillRequest(
    Guid     StoreId,
    Guid?    PatientId,
    string?  PatientName,
    string?  PatientIpOpNo,
    Guid?    PrescribedByDoctorId,
    string   PaymentMode,
    decimal  PaidAmount,
    string?  Remarks,
    List<CreateBillItemRequest> Items
);

public record CreateBillItemRequest(
    Guid     ItemId,
    Guid?    StockBatchId,
    decimal  Quantity,
    decimal  DiscountPercent,
    string?  Barcode
);

// ── Surgery Consumable ────────────────────────────────────────────────────────
public record IssueSurgeryConsumableRequest(
    Guid     StoreId,
    Guid?    SurgeryId,
    string   IolBillingMode,
    string?  PatientName,
    string?  PatientIpNo,
    List<IssueConsumableItemRequest> Items
);

public record IssueConsumableItemRequest(
    Guid     ItemId,
    Guid?    StockBatchId,
    decimal  Quantity,
    string?  Barcode,
    string?  Remarks
);

public record PlanConsumableRequest(
    Guid     StoreId,
    Guid?    SurgeryId,
    string   IolBillingMode,
    string?  PatientName,
    string?  PatientIpNo,
    List<PlanConsumableItemRequest> Items
);

public record PlanConsumableItemRequest(
    Guid     ItemId,
    decimal  PlannedQuantity,
    Guid?    StockBatchId = null,
    string?  Barcode = null,
    string?  Remarks = null
);

public record RaiseEscalationRequest(
    string Reason
);

public record PostConsumableReturnRequest(
    decimal ReturnedQuantity
);

// ── Approval ──────────────────────────────────────────────────────────────────
public record ApproveInvoiceRequest(
    string   Action,       // PrimaryApproval | FinalApproval | Rejection
    string?  Remarks
);

// ── Requisition ───────────────────────────────────────────────────────────────
public record CreateRequisitionRequest(
    Guid     StoreId,
    string   RequisitionType,
    string?  Remarks,
    List<CreateRequisitionItemRequest> Items
);

public record CreateRequisitionItemRequest(
    Guid     ItemId,
    decimal  RequiredQuantity,
    string?  PreferredVendor,
    string?  Remarks
);

// ── Vendor Payment ────────────────────────────────────────────────────────────
public record CreateVendorPaymentRequest(
    Guid     VendorId,
    Guid?    InvoiceId,
    string   PaymentReference,
    DateTime PaymentDate,
    decimal  Amount,
    string   PaymentMode,
    string?  ChequeNumber,
    string?  BankTransactionId,
    string?  Remarks
);

// ── GST Summary ───────────────────────────────────────────────────────────────
public record GstSummaryByRateDto(
    DateTime Month,
    decimal  GstRate,
    decimal  TaxableAmount,
    decimal  CgstAmount,
    decimal  SgstAmount,
    decimal  IgstAmount,
    decimal  TotalGstAmount
);

// ── Stock Ledger ──────────────────────────────────────────────────────────────
public record StockLedgerDto(
    Guid     Id,
    Guid     StoreId,
    Guid     ItemId,
    string   ItemName,
    Guid?    StockBatchId,
    string   TransactionType,
    string?  ReferenceId,
    string?  ReferenceNumber,
    decimal  QuantityIn,
    decimal  QuantityOut,
    decimal  BalanceQuantity,
    decimal  UnitRate,
    decimal  TotalValue,
    string?  Remarks,
    string?  PatientName,
    string?  PatientIpNo,
    DateTime TransactionDate,
    DateTime CreatedAt
);

public record CreateStockAdjustmentRequest(
    Guid     StoreId,
    Guid     ItemId,
    Guid?    StockBatchId,
    /// <summary>Positive = quantity added; negative = quantity removed.</summary>
    decimal  AdjustmentQuantity,
    decimal  UnitRate,
    string?  Remarks
);

// ── Purchase Return ───────────────────────────────────────────────────────────

/// <summary>
/// Create a purchase return. SourceType governs which linking IDs are required:
///   Invoice – InvoiceId must be set
///   GRN     – GrnId must be set
///   Manual  – neither is required, but Remarks explaining the reason is recommended
/// </summary>
public record CreatePurchaseReturnRequest(
    /// <summary>Invoice | GRN | Manual</summary>
    string   SourceType,
    Guid     VendorId,
    Guid?    InvoiceId,
    Guid?    GrnId,
    string?  PurchaseCategory,
    DateTime ReturnDate,
    string   ReturnReason,
    string?  PaymentMode,
    string?  Reference,
    string?  Remarks,
    List<CreateReturnItemRequest> Items
);

public record CreateReturnItemRequest(
    Guid     ItemId,
    Guid?    StockBatchId,
    decimal  ReturnQuantity,
    decimal  FreeQuantity,
    decimal  PurchaseRate,
    string?  ReturnCause,
    string?  BatchNumber,
    DateOnly? ExpiryDate,
    // GST — optional; if not supplied, inherited from source invoice item
    string?  HsnCode        = null,
    decimal  GstPercent     = 0,
    decimal  CgstPercent    = 0,
    decimal  SgstPercent    = 0,
    decimal  IgstPercent    = 0
);

public record RecordCreditNoteRequest(
    string   CreditNoteNumber,
    decimal  CreditNoteAmount,
    DateOnly CreditNoteDate
);

/// <summary>Optional body for DELETE /purchase-returns/{id} — reason is REQUIRED when status is CreditNoteReceived.</summary>
public record CancelReturnRequest(string? CancellationReason);

// ── Vendor Payment List ───────────────────────────────────────────────────────
public record VendorPaymentDto(
    Guid      Id,
    Guid      VendorId,
    Guid?     InvoiceId,
    string    PaymentReference,
    DateTime  PaymentDate,
    decimal   Amount,
    string    PaymentMode,
    string?   ChequeNumber,
    string?   BankTransactionId,
    string?   Remarks,
    DateTime  CreatedAt
);

// ── Procurement Policy DTOs ────────────────────────────────────────────────

public record SavePolicyDraftRequest
{
    public Guid     BranchId                    { get; init; }
    public string   PolicyName                  { get; init; } = string.Empty;
    public decimal  DirectPoLimit               { get; init; }
    public decimal  RfqMandatoryFrom            { get; init; }
    public decimal  DualApprovalFrom            { get; init; }
    public int      MinVendorQuotes             { get; init; }
    public bool     EmergencyBypassAllowed      { get; init; }
    public int      EmergencyBypassExpiryHours  { get; init; }
    public string?  Notes                       { get; init; }
    public Guid?    PolicyId                    { get; init; }
};

public record PublishPolicyRequest(
    string?   ChangeNotes = null,
    DateTime? EffectiveFrom = null,
    DateTime? EffectiveTo = null
);

public record SimulatePolicyRequest(
    Guid    BranchId,
    decimal Amount
);

public record SimulatePolicyResult(
    decimal  Amount,
    string   RecommendedPath,
    bool     NeedsRfq,
    bool     CanDirectPo,
    bool     NeedsDualApproval,
    int      MinVendorQuotes,
    int?     EmergencyBypassExpiryHours
);

// ── RFQ DTOs ───────────────────────────────────────────────────────────────

public record CreateRfqRequest(
    Guid              BranchId,
    string            Title,
    List<RfqItemRequest> Items,
    List<Guid>        VendorIds,
    Guid?             RequisitionId = null,
    DateTime?         ResponseDeadline = null,
    string?           Notes = null
);

public record RfqItemRequest(
    Guid    ItemId,
    decimal RequestedQty,
    string  Unit,
    string? Specifications = null
);

public record SubmitQuoteRequest(
    Guid                    VendorId,
    List<QuoteItemRequest>  Items,
    DateTime?               ValidUntil = null,
    string?                 VendorNotes = null
);

public record QuoteItemRequest(
    Guid    ItemId,
    decimal QuotedQty,
    decimal UnitPrice,
    decimal GstPercent,
    decimal TotalAmount,
    string? Remarks = null
);

public record AwardRfqRequest(
    Guid VendorId
);

public record CancelRfqRequest(
    string Reason
);

public record RequestClarificationRequest(
    string Notes
);

public record RankQuoteEntry(
    Guid    QuoteId,
    int     RankPosition,
    decimal? Score = null,
    string?  Notes = null
);

public record RankQuotesRequest(
    List<RankQuoteEntry> Rankings
);

public record DisqualifyQuoteRequest(
    string Reason
);

public record ReasonRequest(
    string Reason
);

public record SubmitForApprovalRequest(
    Guid ProposedVendorId
);

public record RecordPaymentRequest(
    decimal Amount,
    string  PaymentMode
);

// ── Purchase Order DTOs ────────────────────────────────────────────────────

public record CreatePurchaseOrderRequest(
    Guid                        BranchId,
    Guid                        VendorId,
    string                      SourceType,
    List<PurchaseOrderItemRequest> Items,
    Guid?                       RequisitionId = null,
    Guid?                       RfqId = null,
    DateTime?                   ExpectedDeliveryDate = null,
    bool                        IsEmergency = false,
    string?                     Terms = null,
    string?                     Notes = null
);

public record PurchaseOrderItemRequest(
    Guid      ItemId,
    decimal   OrderedQty,
    decimal   UnitPrice,
    decimal   GstPercent,
    decimal   TotalAmount,
    string    Unit,
    DateTime? RequiredBy = null,
    string?   Remarks = null
);

public record ApprovePurchaseOrderRequest(
    string? Remarks = null
);

public record RejectPurchaseOrderRequest(
    string Reason
);

public record CancelPurchaseOrderRequest(
    string Reason
);

/// <summary>Request body for PUT /purchase-orders/{id} (Draft only).</summary>
public record UpdatePurchaseOrderRequest(
    Guid                           BranchId,
    Guid                           VendorId,
    List<PurchaseOrderItemRequest>  Items,
    DateTime?                      ExpectedDeliveryDate = null,
    bool                           IsEmergency          = false,
    string?                        Terms                = null,
    string?                        Notes                = null
);

/// <summary>Optional body for POST /purchase-orders/{id}/send-to-vendor.</summary>
public record SendToVendorRequest(
    string? Channel       = null,   // "Email" | "WhatsApp" | "SMS" | "Call" | "Other"
    string? ContactTarget = null,   // email address or phone number
    string? Notes         = null
);

// ── Week 2: Requisition Policy-Path & Conversion DTOs ────────────────────────

public record EvaluatePolicyPathResult(
    Guid     RequisitionId,
    string   RecommendedPath,       // "DirectPO" | "RFQ"
    decimal  EstimatedValue,
    decimal? DirectPoLimit,
    decimal? RfqMandatoryFrom,
    decimal? DualApprovalFrom,
    int?     MinVendorQuotes,
    bool     RequiresDualApproval,
    string   Reason,
    Guid?    PolicyId,
    string?  PolicyName
);

public record ConvertToRfqRequest
{
    public string?       Title            { get; init; }
    public Guid          BranchId         { get; init; }
    public List<Guid>?   VendorIds        { get; init; }
    public DateTime?     ResponseDeadline { get; init; }
}

public record ConvertToPOItemOverride
{
    public Guid    ItemId     { get; init; }
    public decimal OrderedQty { get; init; }
    public decimal UnitPrice  { get; init; }
    public decimal GstPercent { get; init; }
    public string  Unit       { get; init; } = "Nos";
}

public record ConvertToPORequest
{
    public Guid                          BranchId             { get; init; }
    public Guid                          VendorId             { get; init; }
    public string?                       VendorName           { get; init; }
    public List<ConvertToPOItemOverride>? Items               { get; init; }
    public DateTime?                     ExpectedDeliveryDate { get; init; }
    public bool                          IsEmergency          { get; init; }
    public string?                       Notes                { get; init; }
    public string?                       Terms                { get; init; }
}
// ── Week 3: PO Receipt, Vendor Performance & Dashboard ─────────────────────

public record RecordPoReceiptItemLine
{
    public Guid      ItemId      { get; init; }
    public decimal   ReceivedQty { get; init; }
    public string?   BatchNumber { get; init; }
    public DateTime? ExpiryDate  { get; init; }
    public decimal?  Mrp         { get; init; }
    public string?   Barcode     { get; init; }
}

public record RecordPoReceiptRequest
{
    public Guid                          StoreId            { get; init; }
    public List<RecordPoReceiptItemLine> Items              { get; init; } = [];
    public DateTime?                     ActualDeliveryDate { get; init; }
    public string?                       Notes              { get; init; }
}

public record VendorPerformanceSummaryDto(
    Guid    VendorId,
    string  VendorName,
    int     TotalOrders,
    decimal OnTimeDeliveryRate,   // 0–100 %
    decimal AvgFulfillmentRate,   // 0–100 %
    decimal? AvgRating            // 1–5 or null
);

public record InventoryDashboardSummary(
    int     PendingRequisitions,
    int     OpenRfqs,
    int     PendingPoCount,
    int     LowStockCount,
    decimal ThisMonthPoSpend,
    decimal OnTimeDeliveryRate    // 0–100 %
);