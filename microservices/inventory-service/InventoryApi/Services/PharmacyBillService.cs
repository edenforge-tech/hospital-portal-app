using InventoryApi.Data;
using InventoryApi.Models.DTOs;
using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Services;

public interface IPharmacyBillService
{
    Task<PagedResult<object>> ListBillsAsync(Guid tenantId, Guid? storeId, int page, int pageSize, CancellationToken ct);
    Task<PharmacyBill> CreateBillAsync(Guid tenantId, Guid userId, CreatePharmacyBillRequest req, CancellationToken ct);
    Task<PharmacyBill?> GetBillAsync(Guid tenantId, Guid billId, CancellationToken ct);
    Task<PharmacyBill> ConfirmBillAsync(Guid tenantId, Guid billId, Guid userId, CancellationToken ct);
    Task<PharmacyBill> RecordPaymentAsync(Guid tenantId, Guid billId, Guid userId, decimal amount, string paymentMode, CancellationToken ct);
    Task<bool> CancelBillAsync(Guid tenantId, Guid billId, Guid userId, CancellationToken ct);
}

public sealed class PharmacyBillService : IPharmacyBillService
{
    private readonly InventoryDbContext _db;
    private readonly IStockService _stock;

    public PharmacyBillService(InventoryDbContext db, IStockService stock)
    {
        _db = db;
        _stock = stock;
    }

    public async Task<PagedResult<object>> ListBillsAsync(
        Guid tenantId, Guid? storeId, int page, int pageSize, CancellationToken ct)
    {
        var q = _db.PharmacyBills
            .Where(b => b.TenantId == tenantId && b.DeletedAt == null);

        if (storeId.HasValue)
            q = q.Where(b => b.StoreId == storeId.Value);

        var total = await q.CountAsync(ct);
        var items = await q
            .OrderByDescending(b => b.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(b => (object)new
            {
                b.Id,
                b.BillNumber,
                b.StoreId,
                b.PatientId,
                b.PatientName,
                b.BillDate,
                b.NetAmount,
                b.PaymentMode,
                b.BillStatus,
                b.CreatedAt
            })
            .ToListAsync(ct);

        return new PagedResult<object>(items, total, page, pageSize);
    }

    public async Task<PharmacyBill> CreateBillAsync(Guid tenantId, Guid userId, CreatePharmacyBillRequest req, CancellationToken ct)
    {
        // Generate bill number
        var count = await _db.PharmacyBills
            .CountAsync(b => b.TenantId == tenantId && b.StoreId == req.StoreId, ct);
        var billNumber = $"PHR/{req.StoreId.ToString("N")[..4].ToUpper()}/{DateTime.UtcNow:yyyyMMdd}/{count + 1:D4}";

        var bill = new PharmacyBill
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            StoreId = req.StoreId,
            PatientId = req.PatientId,
            BillNumber = billNumber,
            BillDate = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc),
            PatientName = req.PatientName,
            PatientIpOpNo = req.PatientIpOpNo,
            PrescribedByDoctorId = req.PrescribedByDoctorId,
            PaymentMode = req.PaymentMode,
            BillStatus = "StockValidated",   // staged: stock verified but not yet deducted
            Remarks = req.Remarks,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedByUserId = userId,
            UpdatedByUserId = userId
        };
        _db.PharmacyBills.Add(bill);

        decimal grossAmount = 0, gstAmount = 0, discountAmount = 0;

        foreach (var lineReq in req.Items)
        {
            // Validate stock availability without deducting
            var availableBatch = await _db.StockBatches
                .Where(b => b.TenantId == tenantId && b.StoreId == req.StoreId
                         && b.ItemId == lineReq.ItemId && b.DeletedAt == null && b.IsActive
                         && b.QuantityAvailable > 0)
                .OrderBy(b => b.ExpiryDate)
                .FirstOrDefaultAsync(ct)
                ?? throw new InvalidOperationException($"Insufficient stock for item {lineReq.ItemId}.");

            var mrp = availableBatch.Mrp;
            var sellingRate = Math.Round(mrp * (1 - lineReq.DiscountPercent / 100m), 2);
            var taxable = Math.Round(sellingRate * lineReq.Quantity / 1.05m, 2);
            var gst = Math.Round(sellingRate * lineReq.Quantity - taxable, 2);

            _db.PharmacyBillItems.Add(new PharmacyBillItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                BillId = bill.Id,
                ItemId = lineReq.ItemId,
                StockBatchId = lineReq.StockBatchId ?? availableBatch.Id,
                Quantity = lineReq.Quantity,
                Mrp = mrp,
                SellingRate = sellingRate,
                DiscountPercent = lineReq.DiscountPercent,
                GstPercent = 5,
                TaxableAmount = taxable,
                GstAmount = gst,
                NetAmount = Math.Round(sellingRate * lineReq.Quantity, 2),
                Barcode = lineReq.Barcode,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedByUserId = userId
            });

            grossAmount    += Math.Round(mrp * lineReq.Quantity, 2);
            discountAmount += Math.Round((mrp - sellingRate) * lineReq.Quantity, 2);
            gstAmount      += gst;
        }

        bill.GrossAmount    = grossAmount;
        bill.DiscountAmount = discountAmount;
        bill.GstAmount      = gstAmount;
        bill.NetAmount      = Math.Round(grossAmount - discountAmount, 2);
        bill.PaidAmount     = 0;
        bill.BalanceAmount  = bill.NetAmount;

        await _db.SaveChangesAsync(ct);
        return bill;
    }

    public async Task<PharmacyBill> ConfirmBillAsync(Guid tenantId, Guid billId, Guid userId, CancellationToken ct)
    {
        var bill = await _db.PharmacyBills.Include(b => b.Items)
            .FirstOrDefaultAsync(b => b.Id == billId && b.TenantId == tenantId && b.DeletedAt == null, ct)
            ?? throw new KeyNotFoundException("Bill not found.");

        if (bill.BillStatus != "StockValidated")
            throw new InvalidOperationException($"Expected status 'StockValidated', found '{bill.BillStatus}'.");

        // Now deduct stock using FEFO
        foreach (var item in bill.Items)
        {
            var batch = await _stock.DeductFefoAsync(
                tenantId, bill.StoreId, item.ItemId, item.Quantity,
                userId, "PHARMACY_ISSUE", bill.Id.ToString(), bill.BillNumber, ct);
            item.StockBatchId = batch.Id;
            item.UpdatedAt = DateTime.UtcNow;
        }

        bill.BillStatus = "Billed";
        bill.UpdatedAt = DateTime.UtcNow;
        bill.UpdatedByUserId = userId;
        await _db.SaveChangesAsync(ct);
        return bill;
    }

    public async Task<PharmacyBill> RecordPaymentAsync(
        Guid tenantId, Guid billId, Guid userId, decimal amount, string paymentMode, CancellationToken ct)
    {
        var bill = await _db.PharmacyBills
            .FirstOrDefaultAsync(b => b.Id == billId && b.TenantId == tenantId && b.DeletedAt == null, ct)
            ?? throw new KeyNotFoundException("Bill not found.");

        if (bill.BillStatus is "Cancelled" or "Returned")
            throw new InvalidOperationException($"Cannot record payment for a '{bill.BillStatus}' bill.");

        bill.PaidAmount += amount;
        bill.BalanceAmount = Math.Max(0, bill.NetAmount - bill.PaidAmount);
        bill.PaymentMode = paymentMode;
        if (bill.PaidAmount >= bill.NetAmount)
            bill.BillStatus = "PaidOrSettled";
        bill.UpdatedAt = DateTime.UtcNow;
        bill.UpdatedByUserId = userId;
        await _db.SaveChangesAsync(ct);
        return bill;
    }

    public async Task<PharmacyBill?> GetBillAsync(Guid tenantId, Guid billId, CancellationToken ct)
        => await _db.PharmacyBills
            .Include(b => b.Items)
            .FirstOrDefaultAsync(b => b.Id == billId && b.TenantId == tenantId && b.DeletedAt == null, ct);

    public async Task<bool> CancelBillAsync(Guid tenantId, Guid billId, Guid userId, CancellationToken ct)
    {
        var bill = await _db.PharmacyBills.Include(b => b.Items)
            .FirstOrDefaultAsync(b => b.Id == billId && b.TenantId == tenantId && b.DeletedAt == null, ct);
        if (bill is null || bill.BillStatus == "Cancelled") return false;

        // Reverse stock deductions
        foreach (var item in bill.Items)
        {
            if (item.StockBatchId is null) continue;
            var batch = await _db.StockBatches.FindAsync([item.StockBatchId.Value], ct);
            if (batch is null) continue;
            batch.QuantityOut -= item.Quantity;
            batch.QuantityAvailable += item.Quantity;
            batch.UpdatedAt = DateTime.UtcNow;
        }

        bill.BillStatus = "Cancelled";
        bill.UpdatedAt = DateTime.UtcNow;
        bill.UpdatedByUserId = userId;
        await _db.SaveChangesAsync(ct);
        return true;
    }
}
