namespace InventoryApi.Services;

public interface IBlobStorageService
{
    /// <summary>
    /// Uploads a stream to blob storage under the configured container.
    /// Returns the public URL of the uploaded blob and its size in kilobytes.
    /// Throws <see cref="ArgumentException"/> if the MIME type is not allowed.
    /// Throws <see cref="InvalidOperationException"/> if the stream exceeds the size limit.
    /// </summary>
    Task<(string Url, string BlobName, int SizeKb)> UploadAsync(
        Stream      data,
        string      originalFilename,
        string      contentType,
        Guid        tenantId,
        CancellationToken ct = default);
    /// <summary>
    /// Deletes a blob by its full URL or blob name.
    /// No-ops silently if the blob does not exist.
    /// </summary>
    Task DeleteAsync(string urlOrBlobName, CancellationToken ct = default);

    /// <summary>
    /// Downloads a blob by its blob name and returns the content as a stream with its MIME type.
    /// The caller is responsible for disposing the returned stream.
    /// </summary>
    Task<(Stream Content, string ContentType)> DownloadAsync(string blobName, CancellationToken ct = default);
}
