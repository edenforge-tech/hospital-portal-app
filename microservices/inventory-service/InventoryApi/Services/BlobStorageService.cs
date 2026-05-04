using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Services;

public sealed class BlobStorageService : IBlobStorageService
{
    private static readonly HashSet<string> _allowedMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/webp", "application/pdf"
    };
    private const long MaxBytes = 10 * 1024 * 1024; // 10 MB

    private readonly BlobContainerClient _container;
    private readonly ILogger<BlobStorageService> _log;

    public BlobStorageService(IConfiguration config, ILogger<BlobStorageService> log)
    {
        _log = log;
        var connStr = config["BlobStorage:ConnectionString"]
                   ?? config["AzureWebJobsStorage"]
                   ?? "UseDevelopmentStorage=true";
        var container = config["BlobStorage:ContainerName"] ?? "payment-receipts";
        _container = new BlobContainerClient(connStr, container);
    }

    public async Task<(string Url, string BlobName, int SizeKb)> UploadAsync(
        Stream data, string originalFilename, string contentType,
        Guid tenantId, CancellationToken ct = default)
    {
        if (!_allowedMimeTypes.Contains(contentType))
            throw new ArgumentException(
                $"File type '{contentType}' is not allowed. Accepted: JPEG, PNG, WebP, PDF.");

        if (data.CanSeek && data.Length > MaxBytes)
            throw new InvalidOperationException(
                $"File size exceeds the maximum allowed limit of {MaxBytes / 1024 / 1024} MB.");

        await _container.CreateIfNotExistsAsync(PublicAccessType.None, cancellationToken: ct);

        var ext       = Path.GetExtension(originalFilename).ToLowerInvariant();
        var safeBase  = Path.GetFileNameWithoutExtension(originalFilename)
                           .Replace(" ", "_")
                           .Replace("..", "")
                           [..Math.Min(40, Path.GetFileNameWithoutExtension(originalFilename).Length)];
        var blobName  = $"{tenantId}/{DateTime.UtcNow:yyyy-MM}/{Guid.NewGuid()}_{safeBase}{ext}";

        var blobClient = _container.GetBlobClient(blobName);

        // Read into memory so we can measure size even on non-seekable streams
        using var ms = new MemoryStream();
        await data.CopyToAsync(ms, ct);
        if (ms.Length > MaxBytes)
            throw new InvalidOperationException(
                $"File size ({ms.Length / 1024} KB) exceeds the maximum allowed limit of {MaxBytes / 1024 / 1024} MB.");

        ms.Position = 0;
        await blobClient.UploadAsync(ms, new BlobHttpHeaders { ContentType = contentType }, cancellationToken: ct);

        _log.LogInformation("Uploaded payment proof blob: {BlobName} ({SizeKb} KB)", blobName, ms.Length / 1024);
        return (blobClient.Uri.ToString(), blobName, (int)(ms.Length / 1024));
    }

    public async Task DeleteAsync(string urlOrBlobName, CancellationToken ct = default)
    {
        // Accept either a full https://... URL or a bare blob name like tenant-id/yyyy-MM/...
        string blobName;
        if (urlOrBlobName.StartsWith("https://", StringComparison.OrdinalIgnoreCase)
            || urlOrBlobName.StartsWith("http://", StringComparison.OrdinalIgnoreCase))
        {
            // Extract blob name from URL: everything after the container segment
            var uri          = new Uri(urlOrBlobName);
            var containerUri = _container.Uri.AbsolutePath.TrimEnd('/');
            blobName = uri.AbsolutePath.TrimStart('/');
            // Strip container prefix if present
            if (blobName.StartsWith(containerUri.TrimStart('/')))
                blobName = blobName[(containerUri.Length + 1)..];
        }
        else
        {
            blobName = urlOrBlobName;
        }

        var blobClient = _container.GetBlobClient(blobName);
        await blobClient.DeleteIfExistsAsync(cancellationToken: ct);
        _log.LogInformation("Deleted blob: {BlobName}", blobName);
    }

    public async Task<(Stream Content, string ContentType)> DownloadAsync(string blobName, CancellationToken ct = default)
    {
        var blobClient = _container.GetBlobClient(blobName);
        var response   = await blobClient.DownloadStreamingAsync(cancellationToken: ct);
        var contentType = response.Value.Details.ContentType ?? "application/octet-stream";
        return (response.Value.Content, contentType);
    }
}
