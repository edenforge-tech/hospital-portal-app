namespace InventoryApi.Services;

/// <summary>
/// Computes GST/TCS splits for purchase invoice lines.
/// All calculations are pure (no DB access) — safe to unit-test.
/// </summary>
public interface ITaxService
{
    GstSplit ComputeGst(decimal taxableAmount, decimal gstPercent, bool isInterState);
    decimal  ComputeTcsAmount(decimal netAmount, decimal tcsPercent);
    IReadOnlyList<GstRateSummary> SummariseByRate(IEnumerable<GstLineInput> lines, bool isInterState);
}

public record GstSplit(
    decimal CgstPercent,
    decimal SgstPercent,
    decimal IgstPercent,
    decimal CgstAmount,
    decimal SgstAmount,
    decimal IgstAmount,
    decimal TotalGst
);

public record GstRateSummary(
    decimal GstRate,
    decimal TaxableAmount,
    decimal CgstAmount,
    decimal SgstAmount,
    decimal IgstAmount,
    decimal TotalGst
);

public record GstLineInput(
    decimal TaxableAmount,
    decimal GstPercent
);

public sealed class TaxService : ITaxService
{
    public GstSplit ComputeGst(decimal taxableAmount, decimal gstPercent, bool isInterState)
    {
        var totalGst = Math.Round(taxableAmount * gstPercent / 100m, 2);

        if (isInterState)
        {
            return new GstSplit(
                CgstPercent: 0, SgstPercent: 0,
                IgstPercent: gstPercent,
                CgstAmount: 0, SgstAmount: 0,
                IgstAmount: totalGst,
                TotalGst: totalGst);
        }

        var halfRate = gstPercent / 2m;
        var half = Math.Round(totalGst / 2m, 2);
        var remainder = totalGst - 2 * half; // rounding adjustment goes to CGST
        return new GstSplit(
            CgstPercent: halfRate, SgstPercent: halfRate,
            IgstPercent: 0,
            CgstAmount: half + remainder, SgstAmount: half,
            IgstAmount: 0,
            TotalGst: totalGst);
    }

    public decimal ComputeTcsAmount(decimal netAmount, decimal tcsPercent)
        => tcsPercent <= 0 ? 0 : Math.Round(netAmount * tcsPercent / 100m, 2);

    /// <summary>
    /// Aggregates lines by GST rate to produce the multi-rate GST summary
    /// (gap #4 — Ganga Pharma 0% + 5% + 12% + 18% on the same invoice).
    /// </summary>
    public IReadOnlyList<GstRateSummary> SummariseByRate(IEnumerable<GstLineInput> lines, bool isInterState)
    {
        return lines
            .GroupBy(l => l.GstPercent)
            .Select(g =>
            {
                var taxable = g.Sum(x => x.TaxableAmount);
                var split   = ComputeGst(taxable, g.Key, isInterState);
                return new GstRateSummary(
                    g.Key, taxable,
                    split.CgstAmount, split.SgstAmount, split.IgstAmount,
                    split.TotalGst);
            })
            .OrderBy(r => r.GstRate)
            .ToList();
    }
}
