using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Data;

public class InventoryDbContext : DbContext
{
    public InventoryDbContext(DbContextOptions<InventoryDbContext> options) : base(options) { }

    // ── Store & Item Masters ──────────────────────────────────────────────────
    public DbSet<StoreMaster> Stores => Set<StoreMaster>();
    public DbSet<PurchaseCategory> PurchaseCategories => Set<PurchaseCategory>();
    public DbSet<ItemMaster> Items => Set<ItemMaster>();

    // ── Vendors ───────────────────────────────────────────────────────────────
    public DbSet<Vendor> Vendors => Set<Vendor>();
    public DbSet<VendorPayment> VendorPayments => Set<VendorPayment>();
    public DbSet<VendorOutstandingLedger> VendorOutstandingLedgers => Set<VendorOutstandingLedger>();

    // ── Purchase / GRN ────────────────────────────────────────────────────────
    public DbSet<PurchaseInvoice> PurchaseInvoices => Set<PurchaseInvoice>();
    public DbSet<PurchaseItem> PurchaseItems => Set<PurchaseItem>();
    public DbSet<InvoiceGstSummary> InvoiceGstSummaries => Set<InvoiceGstSummary>();
    public DbSet<GrnSequence> GrnSequences => Set<GrnSequence>();
    public DbSet<GrnHeader> GrnHeaders => Set<GrnHeader>();
    public DbSet<GrnItem> GrnItems => Set<GrnItem>();
    public DbSet<PurchaseReturn> PurchaseReturns => Set<PurchaseReturn>();
    public DbSet<PurchaseReturnItem> PurchaseReturnItems => Set<PurchaseReturnItem>();

    // ── Stock ─────────────────────────────────────────────────────────────────
    public DbSet<StockBatch> StockBatches => Set<StockBatch>();
    public DbSet<StockLedger> StockLedgers => Set<StockLedger>();
    public DbSet<StockTransfer> StockTransfers => Set<StockTransfer>();
    public DbSet<StockTransferItem> StockTransferItems => Set<StockTransferItem>();

    // ── Approvals ─────────────────────────────────────────────────────────────
    public DbSet<ApprovalLog> ApprovalLogs => Set<ApprovalLog>();

    // ── Billing & Issue ───────────────────────────────────────────────────────
    public DbSet<PharmacyBill> PharmacyBills => Set<PharmacyBill>();
    public DbSet<PharmacyBillItem> PharmacyBillItems => Set<PharmacyBillItem>();
    public DbSet<SurgeryConsumable> SurgeryConsumables => Set<SurgeryConsumable>();

    // ── Requisitions ──────────────────────────────────────────────────────────
    public DbSet<PurchaseRequisition> PurchaseRequisitions => Set<PurchaseRequisition>();
    public DbSet<PurchaseRequisitionItem> PurchaseRequisitionItems => Set<PurchaseRequisitionItem>();

    // ── Procurement Policy ────────────────────────────────────────────────────
    public DbSet<BranchProcurementPolicy> BranchProcurementPolicies => Set<BranchProcurementPolicy>();
    public DbSet<BranchProcurementPolicyVersion> BranchProcurementPolicyVersions => Set<BranchProcurementPolicyVersion>();

    // ── RFQ ───────────────────────────────────────────────────────────────────
    public DbSet<RfqHeader> RfqHeaders => Set<RfqHeader>();
    public DbSet<RfqItem> RfqItems => Set<RfqItem>();
    public DbSet<RfqVendorInvite> RfqVendorInvites => Set<RfqVendorInvite>();
    public DbSet<VendorQuote> VendorQuotes => Set<VendorQuote>();
    public DbSet<VendorQuoteItem> VendorQuoteItems => Set<VendorQuoteItem>();

    // ── Purchase Orders ───────────────────────────────────────────────────────
    public DbSet<PurchaseOrder> PurchaseOrders => Set<PurchaseOrder>();
    public DbSet<PurchaseOrderItem> PurchaseOrderItems => Set<PurchaseOrderItem>();

    // ── Vendor Acknowledgment ──────────────────────────────────────────────────
    public DbSet<VendorAcknowledgment> VendorAcknowledgments => Set<VendorAcknowledgment>();

    // ── Procurement Audit ─────────────────────────────────────────────────────
    public DbSet<ProcurementTransitionLog> ProcurementTransitionLogs => Set<ProcurementTransitionLog>();

    // ── Vendor Performance ────────────────────────────────────────────────────
    public DbSet<VendorPerformanceRecord> VendorPerformanceRecords => Set<VendorPerformanceRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ─── StoreMaster ──────────────────────────────────────────────────────
        modelBuilder.Entity<StoreMaster>(entity =>
        {
            entity.ToTable("inv_store_master");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.BranchId).HasColumnName("branch_id");
            entity.Property(e => e.StoreName).HasColumnName("store_name").HasMaxLength(200);
            entity.Property(e => e.StoreType).HasColumnName("store_type").HasMaxLength(50);
            entity.Property(e => e.IsActive).HasColumnName("is_active");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);
            entity.Property<uint>("xmin").HasColumnType("xid").IsRowVersion();
        });

        // ─── PurchaseCategory ─────────────────────────────────────────────────
        modelBuilder.Entity<PurchaseCategory>(entity =>
        {
            entity.ToTable("inv_purchase_categories");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.CategoryName).HasColumnName("category_name").HasMaxLength(200);
            entity.Property(e => e.CategoryType).HasColumnName("category_type").HasMaxLength(50);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);
        });

        // ─── ItemMaster ───────────────────────────────────────────────────────
        modelBuilder.Entity<ItemMaster>(entity =>
        {
            entity.ToTable("inv_item_master");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.CategoryId).HasColumnName("category_id");
            entity.Property(e => e.ItemName).HasColumnName("item_name").HasMaxLength(300);
            entity.Property(e => e.GenericName).HasColumnName("generic_name").HasMaxLength(300);
            entity.Property(e => e.Brand).HasColumnName("brand").HasMaxLength(200);
            entity.Property(e => e.HsnCode).HasColumnName("hsn_code").HasMaxLength(20);
            entity.Property(e => e.Unit).HasColumnName("unit").HasMaxLength(50);
            entity.Property(e => e.ScheduleType).HasColumnName("schedule_type").HasMaxLength(10);
            entity.Property(e => e.RequiresColdStorage).HasColumnName("requires_cold_storage");
            entity.Property(e => e.IsBarcodeTracked).HasColumnName("is_barcode_tracked");
            entity.Property(e => e.ItemType).HasColumnName("item_type").HasMaxLength(50);
            entity.Property(e => e.ReorderLevel).HasColumnName("reorder_level").HasColumnType("numeric(12,3)");
            entity.Property(e => e.ReorderQuantity).HasColumnName("reorder_quantity").HasColumnType("numeric(12,3)");
            entity.Property(e => e.ReorderSuppressed).HasColumnName("reorder_suppressed");
            entity.Property(e => e.ReorderSuppressedUntil).HasColumnName("reorder_suppressed_until");
            entity.Property(e => e.LastReorderTriggeredAt).HasColumnName("last_reorder_triggered_at");
            entity.Property(e => e.DefaultGstRate).HasColumnName("default_gst_rate").HasMaxLength(10);
            entity.Property(e => e.LinkedInjectorItemId).HasColumnName("linked_injector_item_id");
            entity.Property(e => e.IsSerialized).HasColumnName("is_serialized");
            entity.Property(e => e.IsAssetItem).HasColumnName("is_asset_item");
            entity.Property(e => e.MdrClassification).HasColumnName("mdr_classification").HasMaxLength(20);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);
            entity.Property<uint>("xmin").HasColumnType("xid").IsRowVersion();

            entity.HasOne(e => e.Category)
                  .WithMany(c => c.Items)
                  .HasForeignKey(e => e.CategoryId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.LinkedInjectorItem)
                  .WithMany()
                  .HasForeignKey(e => e.LinkedInjectorItemId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // ─── Vendor ───────────────────────────────────────────────────────────
        modelBuilder.Entity<Vendor>(entity =>
        {
            entity.ToTable("inv_vendors");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(300);
            entity.Property(e => e.ContactPerson).HasColumnName("contact_person").HasMaxLength(200);
            entity.Property(e => e.Phone).HasColumnName("phone").HasMaxLength(30);
            entity.Property(e => e.Email).HasColumnName("email").HasMaxLength(200);
            entity.Property(e => e.Address).HasColumnName("address");
            entity.Property(e => e.GstNumber).HasColumnName("gst_number").HasMaxLength(20);
            entity.Property(e => e.PanNumber).HasColumnName("pan_number").HasMaxLength(15);
            entity.Property(e => e.DrugLicenseNumber).HasColumnName("drug_license_number").HasMaxLength(100);
            entity.Property(e => e.DrugLicense20B).HasColumnName("drug_license_20b").HasMaxLength(50);
            entity.Property(e => e.DrugLicense21B).HasColumnName("drug_license_21b").HasMaxLength(50);
            entity.Property(e => e.CinNumber).HasColumnName("cin_number").HasMaxLength(21);
            entity.Property(e => e.SwiftCode).HasColumnName("swift_code").HasMaxLength(11);
            entity.Property(e => e.LatePaymentInterestRate).HasColumnName("late_payment_interest_rate").HasColumnType("numeric(5,2)");
            entity.Property(e => e.IsColdChainVendor).HasColumnName("is_cold_chain_vendor");
            entity.Property(e => e.DrugLicenseExpiry).HasColumnName("drug_license_expiry");
            entity.Property(e => e.ApmcRegistration).HasColumnName("apmc_registration").HasMaxLength(100);
            entity.Property(e => e.FoodLicenseNumber).HasColumnName("food_license_number").HasMaxLength(100);
            entity.Property(e => e.ImportExportCode).HasColumnName("import_export_code").HasMaxLength(50);
            entity.Property(e => e.BankName).HasColumnName("bank_name").HasMaxLength(200);
            entity.Property(e => e.BankAccountNumber).HasColumnName("bank_account_number").HasMaxLength(50);
            entity.Property(e => e.BankIfscCode).HasColumnName("bank_ifsc_code").HasMaxLength(20);
            entity.Property(e => e.CreditDays).HasColumnName("credit_days").HasColumnType("numeric(5,0)");
            entity.Property(e => e.OutstandingBalance).HasColumnName("outstanding_balance").HasColumnType("numeric(14,2)");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);
            entity.Property<uint>("xmin").HasColumnType("xid").IsRowVersion();
        });

        // ─── PurchaseInvoice ──────────────────────────────────────────────────
        modelBuilder.Entity<PurchaseInvoice>(entity =>
        {
            entity.ToTable("inv_purchase_invoices");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.VendorId).HasColumnName("vendor_id");
            entity.Property(e => e.StoreId).HasColumnName("store_id");
            entity.Property(e => e.InvoiceNumber).HasColumnName("invoice_number").HasMaxLength(100);
            entity.Property(e => e.InvoiceDate).HasColumnName("invoice_date");
            entity.Property(e => e.DeliveryChallNumber).HasColumnName("delivery_chall_number").HasMaxLength(100);
            entity.Property(e => e.DeliveryChallDate).HasColumnName("delivery_chall_date");
            entity.Property(e => e.VendorOrderNumber).HasColumnName("vendor_order_number").HasMaxLength(100);
            entity.Property(e => e.VendorDeliveryNoteNumber).HasColumnName("vendor_delivery_note_number").HasMaxLength(100);
            entity.Property(e => e.VendorSapNumber).HasColumnName("vendor_sap_number").HasMaxLength(100);
            entity.Property(e => e.VendorBatchRef).HasColumnName("vendor_batch_ref").HasMaxLength(100);
            entity.Property(e => e.GrnNumber).HasColumnName("grn_number").HasMaxLength(100);
            entity.Property(e => e.GrnDate).HasColumnName("grn_date").HasColumnType("date");
            entity.Property(e => e.GrossAmount).HasColumnName("gross_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.DiscountAmount).HasColumnName("discount_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.TaxableAmount).HasColumnName("taxable_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.CgstAmount).HasColumnName("cgst_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.SgstAmount).HasColumnName("sgst_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.IgstAmount).HasColumnName("igst_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.TotalGst).HasColumnName("total_gst").HasColumnType("numeric(14,2)");
            entity.Property(e => e.TcsPercent).HasColumnName("tcs_percent").HasColumnType("numeric(5,2)");
            entity.Property(e => e.TcsAmount).HasColumnName("tcs_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.NetAmount).HasColumnName("net_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.PaidAmount).HasColumnName("paid_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.BalanceAmount).HasColumnName("balance_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.BillingMode).HasColumnName("billing_mode").HasMaxLength(20);
            entity.Property(e => e.PatientName).HasColumnName("patient_name").HasMaxLength(200);
            entity.Property(e => e.PatientIpNo).HasColumnName("patient_ip_no").HasMaxLength(50);
            entity.Property(e => e.ApprovalStatus).HasColumnName("approval_status").HasMaxLength(30);
            entity.Property(e => e.PrimaryApprovedBy).HasColumnName("primary_approved_by");
            entity.Property(e => e.PrimaryApprovedAt).HasColumnName("primary_approved_at");
            entity.Property(e => e.FinalApprovedBy).HasColumnName("final_approved_by");
            entity.Property(e => e.FinalApprovedAt).HasColumnName("final_approved_at");
            entity.Property(e => e.Remarks).HasColumnName("remarks");
            entity.Property(e => e.InvoiceType).HasColumnName("invoice_type").HasMaxLength(20);
            entity.Property(e => e.PaymentMode).HasColumnName("payment_mode").HasMaxLength(30);
            entity.Property(e => e.CreditPeriod).HasColumnName("credit_period");
            entity.Property(e => e.DueDate).HasColumnName("due_date");
            entity.Property(e => e.Reference).HasColumnName("reference").HasMaxLength(200);
            entity.Property(e => e.PurchaseCategory).HasColumnName("purchase_category").HasMaxLength(100);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);
            entity.Property<uint>("xmin").HasColumnType("xid").IsRowVersion();

            entity.HasOne(e => e.Vendor)
                  .WithMany(v => v.PurchaseInvoices)
                  .HasForeignKey(e => e.VendorId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Store)
                  .WithMany()
                  .HasForeignKey(e => e.StoreId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ─── PurchaseItem ─────────────────────────────────────────────────────
        modelBuilder.Entity<PurchaseItem>(entity =>
        {
            entity.ToTable("inv_purchase_items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.InvoiceId).HasColumnName("invoice_id");
            entity.Property(e => e.ItemId).HasColumnName("item_id");
            entity.Property(e => e.OrderedQuantity).HasColumnName("ordered_quantity").HasColumnType("numeric(12,3)");
            entity.Property(e => e.ReceivedQuantity).HasColumnName("received_quantity").HasColumnType("numeric(12,3)");
            entity.Property(e => e.RejectedQuantity).HasColumnName("rejected_quantity").HasColumnType("numeric(12,3)");
            entity.Property(e => e.FreeQuantity).HasColumnName("free_quantity").HasColumnType("numeric(12,3)");
            entity.Property(e => e.BatchNumber).HasColumnName("batch_number").HasMaxLength(100);
            entity.Property(e => e.ExpiryDate).HasColumnName("expiry_date").HasColumnType("date");
            entity.Property(e => e.Barcode).HasColumnName("barcode").HasMaxLength(100);
            entity.Property(e => e.OriginalMrp).HasColumnName("original_mrp").HasColumnType("numeric(12,2)");
            entity.Property(e => e.Mrp).HasColumnName("mrp").HasColumnType("numeric(12,2)");
            entity.Property(e => e.PurchaseRate).HasColumnName("purchase_rate").HasColumnType("numeric(12,2)");
            entity.Property(e => e.DiscountPercent).HasColumnName("discount_percent").HasColumnType("numeric(6,3)");
            entity.Property(e => e.DiscountAmount).HasColumnName("discount_amount").HasColumnType("numeric(12,2)");
            entity.Property(e => e.IsFullDiscount).HasColumnName("is_full_discount");
            entity.Property(e => e.HsnCode).HasColumnName("hsn_code").HasMaxLength(20);
            entity.Property(e => e.GstPercent).HasColumnName("gst_percent").HasColumnType("numeric(5,2)");
            entity.Property(e => e.CgstPercent).HasColumnName("cgst_percent").HasColumnType("numeric(5,2)");
            entity.Property(e => e.SgstPercent).HasColumnName("sgst_percent").HasColumnType("numeric(5,2)");
            entity.Property(e => e.IgstPercent).HasColumnName("igst_percent").HasColumnType("numeric(5,2)");
            entity.Property(e => e.GstAmount).HasColumnName("gst_amount").HasColumnType("numeric(12,2)");
            entity.Property(e => e.TaxableAmount).HasColumnName("taxable_amount").HasColumnType("numeric(12,2)");
            entity.Property(e => e.NetAmount).HasColumnName("net_amount").HasColumnType("numeric(12,2)");
            entity.Property(e => e.PatientName).HasColumnName("patient_name").HasMaxLength(200);
            entity.Property(e => e.PatientIpNo).HasColumnName("patient_ip_no").HasMaxLength(50);
            entity.Property(e => e.SurgeryId).HasColumnName("surgery_id");
            entity.Property(e => e.ItemRemarks).HasColumnName("item_remarks");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);

            entity.HasOne(e => e.Invoice)
                  .WithMany(i => i.Items)
                  .HasForeignKey(e => e.InvoiceId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Item)
                  .WithMany()
                  .HasForeignKey(e => e.ItemId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ─── InvoiceGstSummary ────────────────────────────────────────────────
        modelBuilder.Entity<InvoiceGstSummary>(entity =>
        {
            entity.ToTable("inv_invoice_gst_summary");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.InvoiceId).HasColumnName("invoice_id");
            entity.Property(e => e.GstRate).HasColumnName("gst_rate").HasColumnType("numeric(5,2)");
            entity.Property(e => e.TaxableAmount).HasColumnName("taxable_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.CgstAmount).HasColumnName("cgst_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.SgstAmount).HasColumnName("sgst_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.IgstAmount).HasColumnName("igst_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.TotalGstAmount).HasColumnName("total_gst_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);

            entity.HasOne(e => e.Invoice)
                  .WithMany(i => i.GstSummaries)
                  .HasForeignKey(e => e.InvoiceId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ─── GrnSequence ──────────────────────────────────────────────────────
        modelBuilder.Entity<GrnSequence>(entity =>
        {
            entity.ToTable("inv_grn_sequences");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.StoreId).HasColumnName("store_id");
            entity.Property(e => e.FinancialYear).HasColumnName("financial_year").HasMaxLength(10);
            entity.Property(e => e.LastSequence).HasColumnName("last_sequence");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property<uint>("xmin").HasColumnType("xid").IsRowVersion();

            entity.HasIndex(e => new { e.TenantId, e.StoreId, e.FinancialYear })
                  .IsUnique()
                  .HasDatabaseName("idx_grn_sequences_unique");
        });

        // ─── GrnHeader ────────────────────────────────────────────────────────
        modelBuilder.Entity<GrnHeader>(entity =>
        {
            entity.ToTable("inv_grn_headers");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.InvoiceId).HasColumnName("invoice_id");
            entity.Property(e => e.StoreId).HasColumnName("store_id");
            entity.Property(e => e.GrnNumber).HasColumnName("grn_number").HasMaxLength(50);
            entity.Property(e => e.GrnDate).HasColumnName("grn_date").HasColumnType("date");
            entity.Property(e => e.GrnStatus).HasColumnName("grn_status").HasMaxLength(30);
            entity.Property(e => e.Remarks).HasColumnName("remarks");
            entity.Property(e => e.InspectedBy).HasColumnName("inspected_by");
            entity.Property(e => e.InspectedAt).HasColumnName("inspected_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);
            entity.Property<uint>("xmin").HasColumnType("xid").IsRowVersion();

            entity.HasOne(e => e.Invoice)
                  .WithMany(i => i.GrnHeaders)
                  .HasForeignKey(e => e.InvoiceId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Store)
                  .WithMany()
                  .HasForeignKey(e => e.StoreId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => new { e.TenantId, e.GrnNumber })
                  .IsUnique()
                  .HasFilter("deleted_at IS NULL")
                  .HasDatabaseName("idx_grn_headers_number_unique");
        });

        // ─── GrnItem ──────────────────────────────────────────────────────────
        modelBuilder.Entity<GrnItem>(entity =>
        {
            entity.ToTable("inv_grn_items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.GrnHeaderId).HasColumnName("grn_header_id");
            entity.Property(e => e.PurchaseItemId).HasColumnName("purchase_item_id");
            entity.Property(e => e.ItemId).HasColumnName("item_id");
            entity.Property(e => e.AcceptedQuantity).HasColumnName("accepted_quantity").HasColumnType("numeric(12,3)");
            entity.Property(e => e.RejectedQuantity).HasColumnName("rejected_quantity").HasColumnType("numeric(12,3)");
            entity.Property(e => e.RejectionReason).HasColumnName("rejection_reason");
            entity.Property(e => e.IsVerified).HasColumnName("is_verified");
            entity.Property(e => e.Barcode).HasColumnName("barcode").HasMaxLength(100);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);

            entity.HasOne(e => e.GrnHeader)
                  .WithMany(h => h.GrnItems)
                  .HasForeignKey(e => e.GrnHeaderId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.PurchaseItem)
                  .WithMany()
                  .HasForeignKey(e => e.PurchaseItemId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Item)
                  .WithMany()
                  .HasForeignKey(e => e.ItemId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ─── PurchaseReturn ───────────────────────────────────────────────────
        modelBuilder.Entity<PurchaseReturn>(entity =>
        {
            entity.ToTable("inv_purchase_returns");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.InvoiceId).HasColumnName("invoice_id");
            entity.Property(e => e.VendorId).HasColumnName("vendor_id");
            entity.Property(e => e.SourceType).HasColumnName("source_type").HasMaxLength(20);
            entity.Property(e => e.GrnId).HasColumnName("grn_id");
            entity.Property(e => e.PurchaseCategory).HasColumnName("purchase_category").HasMaxLength(100);
            entity.Property(e => e.ReturnNumber).HasColumnName("return_number").HasMaxLength(50);
            entity.Property(e => e.ReturnDate).HasColumnName("return_date").HasColumnType("date");
            entity.Property(e => e.ReturnReason).HasColumnName("return_reason").HasMaxLength(50);
            entity.Property(e => e.TotalAmount).HasColumnName("total_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.Remarks).HasColumnName("remarks");
            entity.Property(e => e.SettlementStatus).HasColumnName("settlement_status").HasMaxLength(30);
            entity.Property(e => e.CreditNoteNumber).HasColumnName("credit_note_number").HasMaxLength(100);
            entity.Property(e => e.CreditNoteAmount).HasColumnName("credit_note_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.CreditNoteDate).HasColumnName("credit_note_date");
            entity.Property(e => e.PaymentMode).HasColumnName("payment_mode").HasMaxLength(50);
            entity.Property(e => e.Reference).HasColumnName("reference").HasMaxLength(200);
            entity.Property(e => e.SentToVendorAt).HasColumnName("sent_to_vendor_at");
            entity.Property(e => e.SettledAt).HasColumnName("settled_at");
            entity.Property(e => e.TaxableAmount).HasColumnName("taxable_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.CgstAmount).HasColumnName("cgst_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.SgstAmount).HasColumnName("sgst_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.IgstAmount).HasColumnName("igst_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.TcsPercent).HasColumnName("tcs_percent").HasColumnType("numeric(5,2)");
            entity.Property(e => e.TcsAmount).HasColumnName("tcs_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.NetReturnAmount).HasColumnName("net_return_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.ItcReversalAmount).HasColumnName("itc_reversal_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.CancellationReason).HasColumnName("cancellation_reason");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);

            entity.HasOne(e => e.Invoice)
                  .WithMany()
                  .HasForeignKey(e => e.InvoiceId)
                  .IsRequired(false)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Vendor)
                  .WithMany()
                  .HasForeignKey(e => e.VendorId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ─── PurchaseReturnItem ───────────────────────────────────────────────
        modelBuilder.Entity<PurchaseReturnItem>(entity =>
        {
            entity.ToTable("inv_purchase_return_items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.ReturnId).HasColumnName("return_id");
            entity.Property(e => e.ItemId).HasColumnName("item_id");
            entity.Property(e => e.StockBatchId).HasColumnName("stock_batch_id");
            entity.Property(e => e.ReturnQuantity).HasColumnName("return_quantity").HasColumnType("numeric(12,3)");
            entity.Property(e => e.FreeQuantity).HasColumnName("free_quantity").HasColumnType("numeric(12,3)");
            entity.Property(e => e.PurchaseRate).HasColumnName("purchase_rate").HasColumnType("numeric(12,2)");
            entity.Property(e => e.Amount).HasColumnName("amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.ReturnCause).HasColumnName("return_cause").HasMaxLength(50);
            entity.Property(e => e.BatchNumber).HasColumnName("batch_number").HasMaxLength(100);
            entity.Property(e => e.ExpiryDate).HasColumnName("expiry_date");
            entity.Property(e => e.HsnCode).HasColumnName("hsn_code").HasMaxLength(20);
            entity.Property(e => e.GstPercent).HasColumnName("gst_percent").HasColumnType("numeric(5,2)");
            entity.Property(e => e.CgstPercent).HasColumnName("cgst_percent").HasColumnType("numeric(5,2)");
            entity.Property(e => e.SgstPercent).HasColumnName("sgst_percent").HasColumnType("numeric(5,2)");
            entity.Property(e => e.IgstPercent).HasColumnName("igst_percent").HasColumnType("numeric(5,2)");
            entity.Property(e => e.TaxableAmount).HasColumnName("taxable_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.CgstAmount).HasColumnName("cgst_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.SgstAmount).HasColumnName("sgst_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.IgstAmount).HasColumnName("igst_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.NetAmount).HasColumnName("net_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);

            entity.HasOne(e => e.Return)
                  .WithMany(r => r.ReturnItems)
                  .HasForeignKey(e => e.ReturnId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ─── StockBatch ───────────────────────────────────────────────────────
        modelBuilder.Entity<StockBatch>(entity =>
        {
            entity.ToTable("inv_stock_batches");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.StoreId).HasColumnName("store_id");
            entity.Property(e => e.ItemId).HasColumnName("item_id");
            entity.Property(e => e.InvoiceId).HasColumnName("invoice_id");
            entity.Property(e => e.PurchaseItemId).HasColumnName("purchase_item_id");
            entity.Property(e => e.BatchNumber).HasColumnName("batch_number").HasMaxLength(100);
            entity.Property(e => e.ExpiryDate).HasColumnName("expiry_date").HasColumnType("date");
            entity.Property(e => e.Barcode).HasColumnName("barcode").HasMaxLength(100);
            entity.Property(e => e.RequiresColdStorage).HasColumnName("requires_cold_storage");
            entity.Property(e => e.Mrp).HasColumnName("mrp").HasColumnType("numeric(12,2)");
            entity.Property(e => e.PurchaseRate).HasColumnName("purchase_rate").HasColumnType("numeric(12,2)");
            entity.Property(e => e.QuantityIn).HasColumnName("quantity_in").HasColumnType("numeric(12,3)");
            entity.Property(e => e.QuantityOut).HasColumnName("quantity_out").HasColumnType("numeric(12,3)");
            entity.Property(e => e.QuantityAvailable).HasColumnName("quantity_available").HasColumnType("numeric(12,3)");
            entity.Property(e => e.IsActive).HasColumnName("is_active");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);
            entity.Property<uint>("xmin").HasColumnType("xid").IsRowVersion();

            entity.HasOne(e => e.Store)
                  .WithMany(s => s.StockBatches)
                  .HasForeignKey(e => e.StoreId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Item)
                  .WithMany(i => i.StockBatches)
                  .HasForeignKey(e => e.ItemId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Invoice)
                  .WithMany()
                  .HasForeignKey(e => e.InvoiceId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => new { e.TenantId, e.StoreId, e.ItemId, e.BatchNumber })
                  .HasDatabaseName("idx_stock_batches_lookup");
        });

        // ─── StockLedger ──────────────────────────────────────────────────────
        modelBuilder.Entity<StockLedger>(entity =>
        {
            entity.ToTable("inv_stock_ledger");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.StoreId).HasColumnName("store_id");
            entity.Property(e => e.ItemId).HasColumnName("item_id");
            entity.Property(e => e.StockBatchId).HasColumnName("stock_batch_id");
            entity.Property(e => e.TransactionType).HasColumnName("transaction_type").HasMaxLength(50);
            entity.Property(e => e.ReferenceId).HasColumnName("reference_id").HasMaxLength(100);
            entity.Property(e => e.ReferenceNumber).HasColumnName("reference_number").HasMaxLength(100);
            entity.Property(e => e.QuantityIn).HasColumnName("quantity_in").HasColumnType("numeric(12,3)");
            entity.Property(e => e.QuantityOut).HasColumnName("quantity_out").HasColumnType("numeric(12,3)");
            entity.Property(e => e.BalanceQuantity).HasColumnName("balance_quantity").HasColumnType("numeric(12,3)");
            entity.Property(e => e.UnitRate).HasColumnName("unit_rate").HasColumnType("numeric(12,2)");
            entity.Property(e => e.TotalValue).HasColumnName("total_value").HasColumnType("numeric(14,2)");
            entity.Property(e => e.Remarks).HasColumnName("remarks");
            entity.Property(e => e.PatientName).HasColumnName("patient_name").HasMaxLength(200);
            entity.Property(e => e.PatientIpNo).HasColumnName("patient_ip_no").HasMaxLength(50);
            entity.Property(e => e.TransactionDate).HasColumnName("transaction_date").HasColumnType("date");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);

            entity.HasOne(e => e.Store)
                  .WithMany(s => s.StockLedgers)
                  .HasForeignKey(e => e.StoreId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Item)
                  .WithMany(i => i.StockLedgers)
                  .HasForeignKey(e => e.ItemId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.StockBatch)
                  .WithMany(b => b.Ledgers)
                  .HasForeignKey(e => e.StockBatchId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => new { e.TenantId, e.StoreId, e.ItemId, e.TransactionDate })
                  .HasDatabaseName("idx_stock_ledger_lookup");
        });

        // ─── StockTransfer ────────────────────────────────────────────────────
        modelBuilder.Entity<StockTransfer>(entity =>
        {
            entity.ToTable("inv_stock_transfers");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.FromStoreId).HasColumnName("from_store_id");
            entity.Property(e => e.ToStoreId).HasColumnName("to_store_id");
            entity.Property(e => e.TransferNumber).HasColumnName("transfer_number").HasMaxLength(50);
            entity.Property(e => e.TransferDate).HasColumnName("transfer_date");
            entity.Property(e => e.TransferStatus).HasColumnName("transfer_status").HasMaxLength(30);
            entity.Property(e => e.Remarks).HasColumnName("remarks");
            entity.Property(e => e.ApprovedBy).HasColumnName("approved_by");
            entity.Property(e => e.ApprovedAt).HasColumnName("approved_at");
            entity.Property(e => e.DispatchedBy).HasColumnName("dispatched_by");
            entity.Property(e => e.DispatchedAt).HasColumnName("dispatched_at");
            entity.Property(e => e.ReceivedBy).HasColumnName("received_by");
            entity.Property(e => e.ReceivedAt).HasColumnName("received_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);

            entity.HasOne(e => e.FromStore)
                  .WithMany()
                  .HasForeignKey(e => e.FromStoreId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ToStore)
                  .WithMany()
                  .HasForeignKey(e => e.ToStoreId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ─── StockTransferItem ────────────────────────────────────────────────
        modelBuilder.Entity<StockTransferItem>(entity =>
        {
            entity.ToTable("inv_stock_transfer_items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.TransferId).HasColumnName("transfer_id");
            entity.Property(e => e.ItemId).HasColumnName("item_id");
            entity.Property(e => e.StockBatchId).HasColumnName("stock_batch_id");
            entity.Property(e => e.TransferQuantity).HasColumnName("transfer_quantity").HasColumnType("numeric(12,3)");
            entity.Property(e => e.UnitRate).HasColumnName("unit_rate").HasColumnType("numeric(12,2)");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);

            entity.HasOne(e => e.Transfer)
                  .WithMany(t => t.Items)
                  .HasForeignKey(e => e.TransferId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ─── ApprovalLog ──────────────────────────────────────────────────────
        modelBuilder.Entity<ApprovalLog>(entity =>
        {
            entity.ToTable("inv_approval_logs");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.InvoiceId).HasColumnName("invoice_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.Action).HasColumnName("action").HasMaxLength(50);
            entity.Property(e => e.Remarks).HasColumnName("remarks");
            entity.Property(e => e.ActionAt).HasColumnName("action_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);

            entity.HasOne(e => e.Invoice)
                  .WithMany(i => i.ApprovalLogs)
                  .HasForeignKey(e => e.InvoiceId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ─── PharmacyBill ─────────────────────────────────────────────────────
        modelBuilder.Entity<PharmacyBill>(entity =>
        {
            entity.ToTable("inv_pharmacy_bills");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.StoreId).HasColumnName("store_id");
            entity.Property(e => e.PatientId).HasColumnName("patient_id");
            entity.Property(e => e.BillNumber).HasColumnName("bill_number").HasMaxLength(50);
            entity.Property(e => e.BillDate).HasColumnName("bill_date").HasColumnType("date");
            entity.Property(e => e.PatientName).HasColumnName("patient_name").HasMaxLength(200);
            entity.Property(e => e.PatientIpOpNo).HasColumnName("patient_ip_op_no").HasMaxLength(50);
            entity.Property(e => e.PrescribedByDoctorId).HasColumnName("prescribed_by_doctor_id");
            entity.Property(e => e.GrossAmount).HasColumnName("gross_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.DiscountAmount).HasColumnName("discount_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.GstAmount).HasColumnName("gst_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.NetAmount).HasColumnName("net_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.PaymentMode).HasColumnName("payment_mode").HasMaxLength(30);
            entity.Property(e => e.PaidAmount).HasColumnName("paid_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.BalanceAmount).HasColumnName("balance_amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.BillStatus).HasColumnName("bill_status").HasMaxLength(20);
            entity.Property(e => e.Remarks).HasColumnName("remarks");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);
            entity.Property<uint>("xmin").HasColumnType("xid").IsRowVersion();

            entity.HasOne(e => e.Store)
                  .WithMany()
                  .HasForeignKey(e => e.StoreId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ─── PharmacyBillItem ─────────────────────────────────────────────────
        modelBuilder.Entity<PharmacyBillItem>(entity =>
        {
            entity.ToTable("inv_pharmacy_bill_items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.BillId).HasColumnName("bill_id");
            entity.Property(e => e.ItemId).HasColumnName("item_id");
            entity.Property(e => e.StockBatchId).HasColumnName("stock_batch_id");
            entity.Property(e => e.Quantity).HasColumnName("quantity").HasColumnType("numeric(12,3)");
            entity.Property(e => e.Mrp).HasColumnName("mrp").HasColumnType("numeric(12,2)");
            entity.Property(e => e.SellingRate).HasColumnName("selling_rate").HasColumnType("numeric(12,2)");
            entity.Property(e => e.DiscountPercent).HasColumnName("discount_percent").HasColumnType("numeric(6,3)");
            entity.Property(e => e.GstPercent).HasColumnName("gst_percent").HasColumnType("numeric(5,2)");
            entity.Property(e => e.TaxableAmount).HasColumnName("taxable_amount").HasColumnType("numeric(12,2)");
            entity.Property(e => e.GstAmount).HasColumnName("gst_amount").HasColumnType("numeric(12,2)");
            entity.Property(e => e.NetAmount).HasColumnName("net_amount").HasColumnType("numeric(12,2)");
            entity.Property(e => e.Barcode).HasColumnName("barcode").HasMaxLength(100);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);

            entity.HasOne(e => e.Bill)
                  .WithMany(b => b.Items)
                  .HasForeignKey(e => e.BillId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ─── SurgeryConsumable ────────────────────────────────────────────────
        modelBuilder.Entity<SurgeryConsumable>(entity =>
        {
            entity.ToTable("inv_surgery_consumables");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.StoreId).HasColumnName("store_id");
            entity.Property(e => e.SurgeryId).HasColumnName("surgery_id");
            entity.Property(e => e.ItemId).HasColumnName("item_id");
            entity.Property(e => e.StockBatchId).HasColumnName("stock_batch_id");
            entity.Property(e => e.IolBillingMode).HasColumnName("iol_billing_mode").HasMaxLength(20);
            entity.Property(e => e.PatientName).HasColumnName("patient_name").HasMaxLength(200);
            entity.Property(e => e.PatientIpNo).HasColumnName("patient_ip_no").HasMaxLength(50);
            entity.Property(e => e.Quantity).HasColumnName("quantity").HasColumnType("numeric(12,3)");
            entity.Property(e => e.UnitRate).HasColumnName("unit_rate").HasColumnType("numeric(12,2)");
            entity.Property(e => e.Amount).HasColumnName("amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.Barcode).HasColumnName("barcode").HasMaxLength(100);
            entity.Property(e => e.Remarks).HasColumnName("remarks");
            entity.Property(e => e.ConsumableStatus).HasColumnName("consumable_status").HasMaxLength(30);
            entity.Property(e => e.EscalationReason).HasColumnName("escalation_reason");
            entity.Property(e => e.ReturnedQuantity).HasColumnName("returned_quantity").HasColumnType("numeric(12,3)");
            entity.Property(e => e.ReturnedAt).HasColumnName("returned_at");
            entity.Property(e => e.ClosedAt).HasColumnName("closed_at");
            entity.Property(e => e.IssuedAt).HasColumnName("issued_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);

            entity.HasOne(e => e.Store)
                  .WithMany()
                  .HasForeignKey(e => e.StoreId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ─── PurchaseRequisition ──────────────────────────────────────────────
        modelBuilder.Entity<PurchaseRequisition>(entity =>
        {
            entity.ToTable("inv_purchase_requisitions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.StoreId).HasColumnName("store_id");
            entity.Property(e => e.RequisitionNumber).HasColumnName("requisition_number").HasMaxLength(50);
            entity.Property(e => e.RequisitionDate).HasColumnName("requisition_date").HasColumnType("date");
            entity.Property(e => e.RequestedByUserId).HasColumnName("requested_by_user_id");
            entity.Property(e => e.RequisitionType).HasColumnName("requisition_type").HasMaxLength(20);
            entity.Property(e => e.RequisitionStatus).HasColumnName("requisition_status").HasMaxLength(20);
            entity.Property(e => e.Remarks).HasColumnName("remarks");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);

            entity.HasOne(e => e.Store)
                  .WithMany()
                  .HasForeignKey(e => e.StoreId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ─── PurchaseRequisitionItem ──────────────────────────────────────────
        modelBuilder.Entity<PurchaseRequisitionItem>(entity =>
        {
            entity.ToTable("inv_purchase_requisition_items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.RequisitionId).HasColumnName("requisition_id");
            entity.Property(e => e.ItemId).HasColumnName("item_id");
            entity.Property(e => e.RequiredQuantity).HasColumnName("required_quantity").HasColumnType("numeric(12,3)");
            entity.Property(e => e.CurrentStock).HasColumnName("current_stock").HasColumnType("numeric(12,3)");
            entity.Property(e => e.PreferredVendor).HasColumnName("preferred_vendor").HasMaxLength(200);
            entity.Property(e => e.Remarks).HasColumnName("remarks");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);

            entity.HasOne(e => e.Requisition)
                  .WithMany(r => r.Items)
                  .HasForeignKey(e => e.RequisitionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ─── VendorPayment ────────────────────────────────────────────────────
        modelBuilder.Entity<VendorPayment>(entity =>
        {
            entity.ToTable("inv_vendor_payments");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.VendorId).HasColumnName("vendor_id");
            entity.Property(e => e.InvoiceId).HasColumnName("invoice_id");
            entity.Property(e => e.PaymentReference).HasColumnName("payment_reference").HasMaxLength(100);
            entity.Property(e => e.PaymentDate).HasColumnName("payment_date").HasColumnType("date");
            entity.Property(e => e.Amount).HasColumnName("amount").HasColumnType("numeric(14,2)");
            entity.Property(e => e.PaymentMode).HasColumnName("payment_mode").HasMaxLength(20);
            entity.Property(e => e.ChequeNumber).HasColumnName("cheque_number").HasMaxLength(50);
            entity.Property(e => e.BankTransactionId).HasColumnName("bank_transaction_id").HasMaxLength(100);
            entity.Property(e => e.Remarks).HasColumnName("remarks");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);

            entity.HasOne(e => e.Vendor)
                  .WithMany(v => v.VendorPayments)
                  .HasForeignKey(e => e.VendorId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Invoice)
                  .WithMany()
                  .HasForeignKey(e => e.InvoiceId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // ─── VendorOutstandingLedger ──────────────────────────────────────────
        modelBuilder.Entity<VendorOutstandingLedger>(entity =>
        {
            entity.ToTable("inv_vendor_outstanding_ledger");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.VendorId).HasColumnName("vendor_id");
            entity.Property(e => e.InvoiceId).HasColumnName("invoice_id");
            entity.Property(e => e.PaymentId).HasColumnName("payment_id");
            entity.Property(e => e.ReturnId).HasColumnName("return_id");
            entity.Property(e => e.EntryType).HasColumnName("entry_type").HasMaxLength(20);
            entity.Property(e => e.Debit).HasColumnName("debit").HasColumnType("numeric(14,2)");
            entity.Property(e => e.Credit).HasColumnName("credit").HasColumnType("numeric(14,2)");
            entity.Property(e => e.RunningBalance).HasColumnName("running_balance").HasColumnType("numeric(14,2)");
            entity.Property(e => e.ReferenceNumber).HasColumnName("reference_number").HasMaxLength(100);
            entity.Property(e => e.EntryDate).HasColumnName("entry_date");
            entity.Property(e => e.Remarks).HasColumnName("remarks");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);

            entity.HasOne(e => e.Vendor)
                  .WithMany(v => v.OutstandingLedgers)
                  .HasForeignKey(e => e.VendorId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Invoice)
                  .WithMany()
                  .HasForeignKey(e => e.InvoiceId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Payment)
                  .WithMany()
                  .HasForeignKey(e => e.PaymentId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => new { e.TenantId, e.VendorId, e.EntryDate })
                  .HasDatabaseName("idx_vendor_outstanding_lookup");
        });

        // ─── BranchProcurementPolicy ──────────────────────────────────────────
        modelBuilder.Entity<BranchProcurementPolicy>(entity =>
        {
            entity.ToTable("inv_branch_procurement_policies");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.BranchId).HasColumnName("branch_id");
            entity.Property(e => e.PolicyName).HasColumnName("policy_name").HasMaxLength(300);
            entity.Property(e => e.PolicyStatus).HasColumnName("policy_status").HasMaxLength(50);
            entity.Property(e => e.DirectPoLimit).HasColumnName("direct_po_limit").HasColumnType("numeric(15,2)");
            entity.Property(e => e.RfqMandatoryFrom).HasColumnName("rfq_mandatory_from").HasColumnType("numeric(15,2)");
            entity.Property(e => e.DualApprovalFrom).HasColumnName("dual_approval_from").HasColumnType("numeric(15,2)");
            entity.Property(e => e.MinVendorQuotes).HasColumnName("min_vendor_quotes");
            entity.Property(e => e.EmergencyBypassAllowed).HasColumnName("emergency_bypass_allowed");
            entity.Property(e => e.EmergencyBypassExpiryHours).HasColumnName("emergency_bypass_expiry_hours");
            entity.Property(e => e.PublishedAt).HasColumnName("published_at");
            entity.Property(e => e.PublishedByUserId).HasColumnName("published_by_user_id");
            entity.Property(e => e.EffectiveFrom).HasColumnName("effective_from");
            entity.Property(e => e.EffectiveTo).HasColumnName("effective_to");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);
        });

        // ─── BranchProcurementPolicyVersion ──────────────────────────────────
        modelBuilder.Entity<BranchProcurementPolicyVersion>(entity =>
        {
            entity.ToTable("inv_branch_procurement_policy_versions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.PolicyId).HasColumnName("policy_id");
            entity.Property(e => e.VersionNumber).HasColumnName("version_number");
            entity.Property(e => e.DirectPoLimit).HasColumnName("direct_po_limit").HasColumnType("numeric(15,2)");
            entity.Property(e => e.RfqMandatoryFrom).HasColumnName("rfq_mandatory_from").HasColumnType("numeric(15,2)");
            entity.Property(e => e.DualApprovalFrom).HasColumnName("dual_approval_from").HasColumnType("numeric(15,2)");
            entity.Property(e => e.MinVendorQuotes).HasColumnName("min_vendor_quotes");
            entity.Property(e => e.EmergencyBypassAllowed).HasColumnName("emergency_bypass_allowed");
            entity.Property(e => e.EmergencyBypassExpiryHours).HasColumnName("emergency_bypass_expiry_hours");
            entity.Property(e => e.ChangeNotes).HasColumnName("change_notes");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);

            entity.HasOne(e => e.Policy)
                  .WithMany(p => p.Versions)
                  .HasForeignKey(e => e.PolicyId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ─── RfqHeader ────────────────────────────────────────────────────────
        modelBuilder.Entity<RfqHeader>(entity =>
        {
            entity.ToTable("inv_rfq_headers");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.BranchId).HasColumnName("branch_id");
            entity.Property(e => e.RequisitionId).HasColumnName("requisition_id");
            entity.Property(e => e.RfqNumber).HasColumnName("rfq_number").HasMaxLength(50);
            entity.Property(e => e.Title).HasColumnName("title").HasMaxLength(300);
            entity.Property(e => e.RfqStatus).HasColumnName("rfq_status").HasMaxLength(50);
            entity.Property(e => e.PublishedAt).HasColumnName("published_at");
            entity.Property(e => e.ResponseDeadline).HasColumnName("response_deadline");
            entity.Property(e => e.AwardedAt).HasColumnName("awarded_at");
            entity.Property(e => e.AwardedToVendorId).HasColumnName("awarded_to_vendor_id");
            entity.Property(e => e.CancellationReason).HasColumnName("cancellation_reason");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);

            entity.HasOne(e => e.Requisition)
                  .WithMany()
                  .HasForeignKey(e => e.RequisitionId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.AwardedToVendor)
                  .WithMany()
                  .HasForeignKey(e => e.AwardedToVendorId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // ─── RfqItem ──────────────────────────────────────────────────────────
        modelBuilder.Entity<RfqItem>(entity =>
        {
            entity.ToTable("inv_rfq_items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.RfqId).HasColumnName("rfq_id");
            entity.Property(e => e.ItemId).HasColumnName("item_id");
            entity.Property(e => e.RequestedQty).HasColumnName("requested_qty").HasColumnType("numeric(15,3)");
            entity.Property(e => e.Unit).HasColumnName("unit").HasMaxLength(50);
            entity.Property(e => e.Specifications).HasColumnName("specifications");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);

            entity.HasOne(e => e.Rfq)
                  .WithMany(r => r.Items)
                  .HasForeignKey(e => e.RfqId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Item)
                  .WithMany()
                  .HasForeignKey(e => e.ItemId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ─── RfqVendorInvite ──────────────────────────────────────────────────
        modelBuilder.Entity<RfqVendorInvite>(entity =>
        {
            entity.ToTable("inv_rfq_vendor_invites");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.RfqId).HasColumnName("rfq_id");
            entity.Property(e => e.VendorId).HasColumnName("vendor_id");
            entity.Property(e => e.InviteStatus).HasColumnName("invite_status").HasMaxLength(50);
            entity.Property(e => e.InvitedAt).HasColumnName("invited_at");
            entity.Property(e => e.ViewedAt).HasColumnName("viewed_at");
            entity.Property(e => e.RespondedAt).HasColumnName("responded_at");
            entity.Property(e => e.DeclineReason).HasColumnName("decline_reason");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);

            entity.HasOne(e => e.Rfq)
                  .WithMany(r => r.VendorInvites)
                  .HasForeignKey(e => e.RfqId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Vendor)
                  .WithMany()
                  .HasForeignKey(e => e.VendorId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ─── VendorQuote ──────────────────────────────────────────────────────
        modelBuilder.Entity<VendorQuote>(entity =>
        {
            entity.ToTable("inv_vendor_quotes");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.RfqId).HasColumnName("rfq_id");
            entity.Property(e => e.VendorId).HasColumnName("vendor_id");
            entity.Property(e => e.QuoteNumber).HasColumnName("quote_number").HasMaxLength(50);
            entity.Property(e => e.QuoteStatus).HasColumnName("quote_status").HasMaxLength(50);
            entity.Property(e => e.TotalAmount).HasColumnName("total_amount").HasColumnType("numeric(15,2)");
            entity.Property(e => e.QuoteDate).HasColumnName("quote_date");
            entity.Property(e => e.ValidUntil).HasColumnName("valid_until");
            entity.Property(e => e.VendorNotes).HasColumnName("vendor_notes");
            entity.Property(e => e.EvaluationNotes).HasColumnName("evaluation_notes");
            entity.Property(e => e.EvaluationScore).HasColumnName("evaluation_score").HasColumnType("numeric(5,2)");
            entity.Property(e => e.RankPosition).HasColumnName("rank_position");
            entity.Property(e => e.ClarificationNotes).HasColumnName("clarification_notes");
            entity.Property(e => e.ClarificationRequestedAt).HasColumnName("clarification_requested_at");
            entity.Property(e => e.RevisedAt).HasColumnName("revised_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);

            entity.HasOne(e => e.Rfq)
                  .WithMany(r => r.VendorQuotes)
                  .HasForeignKey(e => e.RfqId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Vendor)
                  .WithMany()
                  .HasForeignKey(e => e.VendorId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ─── VendorQuoteItem ──────────────────────────────────────────────────
        modelBuilder.Entity<VendorQuoteItem>(entity =>
        {
            entity.ToTable("inv_vendor_quote_items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.QuoteId).HasColumnName("quote_id");
            entity.Property(e => e.ItemId).HasColumnName("item_id");
            entity.Property(e => e.QuotedQty).HasColumnName("quoted_qty").HasColumnType("numeric(15,3)");
            entity.Property(e => e.UnitPrice).HasColumnName("unit_price").HasColumnType("numeric(15,4)");
            entity.Property(e => e.GstPercent).HasColumnName("gst_percent").HasColumnType("numeric(5,2)");
            entity.Property(e => e.TotalAmount).HasColumnName("total_amount").HasColumnType("numeric(15,2)");
            entity.Property(e => e.Remarks).HasColumnName("remarks");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);

            entity.HasOne(e => e.Quote)
                  .WithMany(q => q.Items)
                  .HasForeignKey(e => e.QuoteId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Item)
                  .WithMany()
                  .HasForeignKey(e => e.ItemId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ─── PurchaseOrder ────────────────────────────────────────────────────
        modelBuilder.Entity<PurchaseOrder>(entity =>
        {
            entity.ToTable("inv_purchase_orders");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.BranchId).HasColumnName("branch_id");
            entity.Property(e => e.RequisitionId).HasColumnName("requisition_id");
            entity.Property(e => e.RfqId).HasColumnName("rfq_id");
            entity.Property(e => e.SourceType).HasColumnName("source_type").HasMaxLength(50);
            entity.Property(e => e.PoNumber).HasColumnName("po_number").HasMaxLength(50);
            entity.Property(e => e.VendorId).HasColumnName("vendor_id");
            entity.Property(e => e.PoStatus).HasColumnName("po_status").HasMaxLength(50);
            entity.Property(e => e.TotalAmount).HasColumnName("total_amount").HasColumnType("numeric(15,2)");
            entity.Property(e => e.GstAmount).HasColumnName("gst_amount").HasColumnType("numeric(15,2)");
            entity.Property(e => e.NetAmount).HasColumnName("net_amount").HasColumnType("numeric(15,2)");
            entity.Property(e => e.PoDate).HasColumnName("po_date");
            entity.Property(e => e.ExpectedDeliveryDate).HasColumnName("expected_delivery_date");
            entity.Property(e => e.SentToVendorAt).HasColumnName("sent_to_vendor_at");
            entity.Property(e => e.ActualDeliveryDate).HasColumnName("actual_delivery_date");
            entity.Property(e => e.ReceivedAt).HasColumnName("received_at");
            entity.Property(e => e.L1ApprovedByUserId).HasColumnName("l1_approved_by_user_id");
            entity.Property(e => e.L1ApprovedAt).HasColumnName("l1_approved_at");
            entity.Property(e => e.L2ApprovedByUserId).HasColumnName("l2_approved_by_user_id");
            entity.Property(e => e.L2ApprovedAt).HasColumnName("l2_approved_at");
            entity.Property(e => e.RejectedByUserId).HasColumnName("rejected_by_user_id");
            entity.Property(e => e.RejectedAt).HasColumnName("rejected_at");
            entity.Property(e => e.RejectionReason).HasColumnName("rejection_reason");
            entity.Property(e => e.IsEmergency).HasColumnName("is_emergency");
            entity.Property(e => e.EmergencyBypassExpiry).HasColumnName("emergency_bypass_expiry");
            entity.Property(e => e.Terms).HasColumnName("terms");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);

            entity.HasOne(e => e.Vendor)
                  .WithMany()
                  .HasForeignKey(e => e.VendorId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Requisition)
                  .WithMany()
                  .HasForeignKey(e => e.RequisitionId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Rfq)
                  .WithMany()
                  .HasForeignKey(e => e.RfqId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => new { e.TenantId, e.PoStatus })
                  .HasDatabaseName("idx_inv_po_status_lookup")
                  .HasFilter("deleted_at IS NULL");
        });

        // ─── PurchaseOrderItem ────────────────────────────────────────────────
        modelBuilder.Entity<PurchaseOrderItem>(entity =>
        {
            entity.ToTable("inv_purchase_order_items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.PoId).HasColumnName("po_id");
            entity.Property(e => e.ItemId).HasColumnName("item_id");
            entity.Property(e => e.OrderedQty).HasColumnName("ordered_qty").HasColumnType("numeric(15,3)");
            entity.Property(e => e.ReceivedQty).HasColumnName("received_qty").HasColumnType("numeric(15,3)");
            entity.Property(e => e.UnitPrice).HasColumnName("unit_price").HasColumnType("numeric(15,4)");
            entity.Property(e => e.GstPercent).HasColumnName("gst_percent").HasColumnType("numeric(5,2)");
            entity.Property(e => e.TotalAmount).HasColumnName("total_amount").HasColumnType("numeric(15,2)");
            entity.Property(e => e.Unit).HasColumnName("unit").HasMaxLength(50);
            entity.Property(e => e.RequiredBy).HasColumnName("required_by");
            entity.Property(e => e.Remarks).HasColumnName("remarks");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);

            entity.HasOne(e => e.PurchaseOrder)
                  .WithMany(p => p.Items)
                  .HasForeignKey(e => e.PoId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Item)
                  .WithMany()
                  .HasForeignKey(e => e.ItemId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ─── ProcurementTransitionLog ─────────────────────────────────────────
        modelBuilder.Entity<ProcurementTransitionLog>(entity =>
        {
            entity.ToTable("inv_procurement_transition_logs");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.EntityType).HasColumnName("entity_type").HasMaxLength(100);
            entity.Property(e => e.EntityId).HasColumnName("entity_id");
            entity.Property(e => e.FromStatus).HasColumnName("from_status").HasMaxLength(100);
            entity.Property(e => e.ToStatus).HasColumnName("to_status").HasMaxLength(100);
            entity.Property(e => e.Reason).HasColumnName("reason");
            entity.Property(e => e.ActorUserId).HasColumnName("actor_user_id");
            entity.Property(e => e.TransitionedAt).HasColumnName("transitioned_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);

            entity.HasIndex(e => new { e.EntityType, e.EntityId })
                  .HasDatabaseName("idx_inv_ptl_entity_lookup");
        });

        // ─── VendorPerformanceRecord ───────────────────────────────────────────
        modelBuilder.Entity<VendorPerformanceRecord>(entity =>
        {
            entity.ToTable("inv_vendor_performance");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.VendorId).HasColumnName("vendor_id");
            entity.Property(e => e.PoId).HasColumnName("po_id");
            entity.Property(e => e.StoreId).HasColumnName("store_id");
            entity.Property(e => e.ExpectedDeliveryDate).HasColumnName("expected_delivery_date");
            entity.Property(e => e.ActualDeliveryDate).HasColumnName("actual_delivery_date");
            entity.Property(e => e.OnTimeDelivery).HasColumnName("on_time_delivery");
            entity.Property(e => e.DaysLate).HasColumnName("days_late");
            entity.Property(e => e.TotalOrdered).HasColumnName("total_ordered").HasColumnType("numeric(15,3)");
            entity.Property(e => e.TotalReceived).HasColumnName("total_received").HasColumnType("numeric(15,3)");
            entity.Property(e => e.FulfillmentRate).HasColumnName("fulfillment_rate").HasColumnType("numeric(6,2)");
            entity.Property(e => e.Rating).HasColumnName("rating").HasColumnType("numeric(3,1)");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);

            entity.HasOne(e => e.Vendor)
                  .WithMany(v => v.PerformanceRecords)
                  .HasForeignKey(e => e.VendorId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.PurchaseOrder)
                  .WithMany()
                  .HasForeignKey(e => e.PoId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => new { e.TenantId, e.VendorId })
                  .HasDatabaseName("idx_inv_vp_vendor")
                  .HasFilter("deleted_at IS NULL");
        });

        // ─── PurchaseRequisition (PolicyId column) ────────────────────────────
        modelBuilder.Entity<PurchaseRequisition>(entity =>
        {
            entity.Property(e => e.PolicyId).HasColumnName("policy_id");
        });

        // ─── VendorAcknowledgment ─────────────────────────────────────────────
        modelBuilder.Entity<VendorAcknowledgment>(entity =>
        {
            entity.ToTable("inv_vendor_acknowledgments");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.VendorId).HasColumnName("vendor_id");
            entity.Property(e => e.EntityType).HasColumnName("entity_type").HasMaxLength(50);
            entity.Property(e => e.EntityId).HasColumnName("entity_id");
            entity.Property(e => e.AckStatus).HasColumnName("ack_status").HasMaxLength(50);
            entity.Property(e => e.Channel).HasColumnName("channel").HasMaxLength(50);
            entity.Property(e => e.ContactTarget).HasColumnName("contact_target").HasMaxLength(300);
            entity.Property(e => e.AcknowledgedAt).HasColumnName("acknowledged_at");
            entity.Property(e => e.AcknowledgedByUserId).HasColumnName("acknowledged_by_user_id");
            entity.Property(e => e.AckNotes).HasColumnName("ack_notes");
            entity.Property(e => e.DeclineReason).HasColumnName("decline_reason");
            entity.Property(e => e.ExpiresAt).HasColumnName("expires_at");
            entity.Property(e => e.RemindersSent).HasColumnName("reminders_sent");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);

            entity.HasOne(e => e.Vendor)
                  .WithMany()
                  .HasForeignKey(e => e.VendorId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => new { e.TenantId, e.EntityType, e.EntityId })
                  .HasDatabaseName("idx_inv_vack_entity")
                  .HasFilter("deleted_at IS NULL");

            entity.HasIndex(e => new { e.TenantId, e.AckStatus })
                  .HasDatabaseName("idx_inv_vack_status")
                  .HasFilter("deleted_at IS NULL");
        });

    }
}