using InventoryApi.Models.DTOs;

namespace InventoryApi.Services;

/// <summary>
/// Provider-agnostic interface for extracting invoice data from uploaded documents.
/// Implementations: OpenAiInvoiceExtractionService (primary), Azure fallback-ready.
/// </summary>
public interface IInvoiceExtractionService
{
    /// <summary>
    /// Extracts structured invoice data from a raw byte stream (PDF or image).
    /// Returns a normalised preview with confidence metadata per field.
    /// </summary>
    Task<InvoiceExtractionPreview> ExtractAsync(
        Stream       fileStream,
        string       originalFilename,
        string       contentType,
        string       sessionId,
        string?      documentUrl,
        Guid         tenantId,
        CancellationToken ct = default);
}
