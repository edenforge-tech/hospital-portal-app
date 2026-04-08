using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Configuration;

namespace IpManagementService.Services;

/// <summary>
/// Abstraction over Azure Blob Storage for pre-op document uploads.
/// First Azure Blob implementation in the IP Management service.
/// </summary>
public interface IAzureBlobStorageService
{
    Task<(string FileUrl, long FileSizeBytes)> UploadAsync(
        Stream content, string fileName, string contentType);

    Task DeleteAsync(string fileUrl);
}

public class AzureBlobStorageService : IAzureBlobStorageService
{
    private readonly IConfiguration _config;
    private BlobContainerClient? _container;
    private readonly object _lock = new();

    public AzureBlobStorageService(IConfiguration config)
    {
        // Do NOT touch the connection string here — it may be a placeholder
        // in local development. The client is created lazily on first use.
        _config = config;
    }

    /// <summary>
    /// Returns (and lazily creates) the BlobContainerClient.
    /// Throws <see cref="InvalidOperationException"/> with a clear message when
    /// the connection string is missing or is still the placeholder value.
    /// </summary>
    private BlobContainerClient GetContainer()
    {
        if (_container is not null) return _container;

        lock (_lock)
        {
            if (_container is not null) return _container;

            var connectionString = _config["AzureBlobStorage:ConnectionString"];
            if (string.IsNullOrWhiteSpace(connectionString) ||
                connectionString.StartsWith('<'))
            {
                throw new InvalidOperationException(
                    "AzureBlobStorage:ConnectionString is not configured. " +
                    "Set a real Azure Storage connection string in local.settings.json.");
            }

            var containerName = _config["AzureBlobStorage:ContainerName"]
                ?? "preop-documents";

            var client = new BlobContainerClient(connectionString, containerName);
            client.CreateIfNotExists(PublicAccessType.None);
            _container = client;
        }

        return _container;
    }

    /// <summary>
    /// Uploads a file stream to Azure Blob Storage.
    /// The blob name is: preop/{tenantId}/{journeyId}/{guid}/{fileName}
    /// Callers are responsible for constructing the prefix and passing the full fileName.
    /// </summary>
    public async Task<(string FileUrl, long FileSizeBytes)> UploadAsync(
        Stream content, string fileName, string contentType)
    {
        if (string.IsNullOrWhiteSpace(fileName))
            throw new ArgumentException("fileName is required.", nameof(fileName));

        // Sanitise: remove any characters that are invalid in blob names
        var safeName = SanitizeBlobName(fileName);

        var blobClient = GetContainer().GetBlobClient(safeName);

        var uploadOptions = new BlobUploadOptions
        {
            HttpHeaders = new BlobHttpHeaders
            {
                ContentType        = contentType ?? "application/octet-stream",
                ContentDisposition = $"inline; filename=\"{Path.GetFileName(fileName)}\"",
            },
        };

        var result = await blobClient.UploadAsync(content, uploadOptions);

        // Blob URI (no SAS — access is controlled via the API layer)
        var fileUrl = blobClient.Uri.ToString();
        var info    = await blobClient.GetPropertiesAsync();

        return (fileUrl, info.Value.ContentLength);
    }

    /// <summary>Deletes a blob by its full URL.</summary>
    public async Task DeleteAsync(string fileUrl)
    {
        if (string.IsNullOrWhiteSpace(fileUrl)) return;

        // Extract the blob name from the URL
        if (!Uri.TryCreate(fileUrl, UriKind.Absolute, out var uri)) return;

        var container = GetContainer();
        var blobName = uri.AbsolutePath.TrimStart('/');
        // Remove container name prefix if present
        var prefix = container.Name + "/";
        if (blobName.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            blobName = blobName[prefix.Length..];

        var blobClient = container.GetBlobClient(blobName);
        await blobClient.DeleteIfExistsAsync(DeleteSnapshotsOption.IncludeSnapshots);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private static string SanitizeBlobName(string name)
    {
        // Replace backslashes with forward slashes (Azure Blob path separator)
        return name.Replace('\\', '/');
    }
}
