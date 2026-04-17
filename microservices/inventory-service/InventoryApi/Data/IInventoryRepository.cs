using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Data;

/// <summary>Thin generic read/write repository — specific queries live in services.</summary>
public interface IInventoryRepository
{
    Task<T?> FindAsync<T>(Guid id, CancellationToken ct = default) where T : class;
    Task<T> AddAsync<T>(T entity, CancellationToken ct = default) where T : class;
    Task SaveChangesAsync(CancellationToken ct = default);

    IQueryable<StoreMaster>              Stores            { get; }
    IQueryable<Vendor>                   Vendors           { get; }
    IQueryable<ItemMaster>               Items             { get; }
    IQueryable<PurchaseCategory>         Categories        { get; }
    IQueryable<PurchaseInvoice>          Invoices          { get; }
    IQueryable<PurchaseItem>             PurchaseItems     { get; }
    IQueryable<InvoiceGstSummary>        GstSummaries      { get; }
    IQueryable<GrnSequence>              GrnSequences      { get; }
    IQueryable<GrnHeader>                GrnHeaders        { get; }
    IQueryable<GrnItem>                  GrnItems          { get; }
    IQueryable<PurchaseReturn>           PurchaseReturns   { get; }
    IQueryable<StockBatch>               StockBatches      { get; }
    IQueryable<StockLedger>              StockLedger       { get; }
    IQueryable<StockTransfer>            StockTransfers    { get; }
    IQueryable<PharmacyBill>             PharmacyBills     { get; }
    IQueryable<PharmacyBillItem>         PharmacyBillItems { get; }
    IQueryable<SurgeryConsumable>        SurgeryConsumables{ get; }
    IQueryable<PurchaseRequisition>      Requisitions      { get; }
    IQueryable<VendorPayment>            VendorPayments    { get; }
    IQueryable<VendorOutstandingLedger>  OutstandingLedger { get; }
    IQueryable<ApprovalLog>              ApprovalLogs      { get; }
}

public sealed class EfInventoryRepository : IInventoryRepository
{
    private readonly InventoryDbContext _db;

    public EfInventoryRepository(InventoryDbContext db) => _db = db;

    public Task<T?> FindAsync<T>(Guid id, CancellationToken ct = default) where T : class
        => _db.Set<T>().FindAsync([id], ct).AsTask()!;

    public async Task<T> AddAsync<T>(T entity, CancellationToken ct = default) where T : class
    {
        await _db.Set<T>().AddAsync(entity, ct);
        return entity;
    }

    public Task SaveChangesAsync(CancellationToken ct = default)
        => _db.SaveChangesAsync(ct);

    public IQueryable<StoreMaster>             Stores             => _db.Stores.AsNoTracking();
    public IQueryable<Vendor>                  Vendors            => _db.Vendors.AsNoTracking();
    public IQueryable<ItemMaster>              Items              => _db.Items.AsNoTracking();
    public IQueryable<PurchaseCategory>        Categories         => _db.PurchaseCategories.AsNoTracking();
    public IQueryable<PurchaseInvoice>         Invoices           => _db.PurchaseInvoices.AsNoTracking();
    public IQueryable<PurchaseItem>            PurchaseItems      => _db.PurchaseItems.AsNoTracking();
    public IQueryable<InvoiceGstSummary>       GstSummaries       => _db.InvoiceGstSummaries.AsNoTracking();
    public IQueryable<GrnSequence>             GrnSequences       => _db.GrnSequences.AsNoTracking();
    public IQueryable<GrnHeader>               GrnHeaders         => _db.GrnHeaders.AsNoTracking();
    public IQueryable<GrnItem>                 GrnItems           => _db.GrnItems.AsNoTracking();
    public IQueryable<PurchaseReturn>          PurchaseReturns    => _db.PurchaseReturns.AsNoTracking();
    public IQueryable<StockBatch>              StockBatches       => _db.StockBatches.AsNoTracking();
    public IQueryable<StockLedger>             StockLedger        => _db.StockLedgers.AsNoTracking();
    public IQueryable<StockTransfer>           StockTransfers     => _db.StockTransfers.AsNoTracking();
    public IQueryable<PharmacyBill>            PharmacyBills      => _db.PharmacyBills.AsNoTracking();
    public IQueryable<PharmacyBillItem>        PharmacyBillItems  => _db.PharmacyBillItems.AsNoTracking();
    public IQueryable<SurgeryConsumable>       SurgeryConsumables => _db.SurgeryConsumables.AsNoTracking();
    public IQueryable<PurchaseRequisition>     Requisitions       => _db.PurchaseRequisitions.AsNoTracking();
    public IQueryable<VendorPayment>           VendorPayments     => _db.VendorPayments.AsNoTracking();
    public IQueryable<VendorOutstandingLedger> OutstandingLedger  => _db.VendorOutstandingLedgers.AsNoTracking();
    public IQueryable<ApprovalLog>             ApprovalLogs       => _db.ApprovalLogs.AsNoTracking();
}
