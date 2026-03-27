using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using AuthService.Services.Interfaces;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

namespace AuthService.Services;

/// <summary>
/// Azure Blob Storage service implementation for file uploads
/// Handles patient photo uploads with thumbnail generation
/// </summary>
public class BlobStorageService : IBlobStorageService
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly ILogger<BlobStorageService> _logger;
    private readonly IConfiguration _configuration;

    public BlobStorageService(
        BlobServiceClient blobServiceClient,
        ILogger<BlobStorageService> logger,
        IConfiguration configuration)
    {
        _blobServiceClient = blobServiceClient;
        _logger = logger;
        _configuration = configuration;
    }

    /// <summary>
    /// Uploads a file to Azure Blob Storage
    /// </summary>
    public async Task<string> UploadFileAsync(
        string fileName, 
        Stream fileStream, 
        string contentType, 
        string containerName = "patient-photos")
    {
        try
        {
            // Get container client (creates container if doesn't exist)
            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.None);

            // Generate unique blob name with timestamp to avoid conflicts
            var uniqueFileName = $"{Path.GetFileNameWithoutExtension(fileName)}_{DateTime.UtcNow:yyyyMMddHHmmss}{Path.GetExtension(fileName)}";
            var blobClient = containerClient.GetBlobClient(uniqueFileName);

            // Set content type for proper browser rendering
            var blobHttpHeaders = new BlobHttpHeaders
            {
                ContentType = contentType
            };

            // Upload file
            await blobClient.UploadAsync(fileStream, new BlobUploadOptions
            {
                HttpHeaders = blobHttpHeaders,
                Conditions = null
            });

            _logger.LogInformation("File uploaded to blob storage: {BlobName} in container {ContainerName}", 
                uniqueFileName, containerName);

            return blobClient.Uri.ToString();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file {FileName} to blob storage", fileName);
            throw;
        }
    }

    /// <summary>
    /// Uploads patient photo with automatic thumbnail generation
    /// Folder structure: patient-photos/{tenantId}/{patientId}/photo.jpg
    /// Thumbnails: patient-photos/{tenantId}/{patientId}/thumb_photo.jpg
    /// </summary>
    public async Task<(string photoUrl, string thumbnailUrl)> UploadPatientPhotoAsync(
        string fileName, 
        Stream fileStream, 
        string contentType, 
        Guid tenantId, 
        Guid patientId)
    {
        try
        {
            var containerName = "patient-photos";
            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.None);

            // Create tenant/patient folder structure
            var folderPath = $"{tenantId}/{patientId}";
            var photoFileName = $"{folderPath}/{Path.GetFileName(fileName)}";
            var thumbnailFileName = $"{folderPath}/thumb_{Path.GetFileName(fileName)}";

            // Upload original photo
            var photoBlobClient = containerClient.GetBlobClient(photoFileName);
            fileStream.Position = 0; // Reset stream position
            
            var blobHttpHeaders = new BlobHttpHeaders { ContentType = contentType };
            await photoBlobClient.UploadAsync(fileStream, new BlobUploadOptions
            {
                HttpHeaders = blobHttpHeaders,
                Conditions = null
            });

            var photoUrl = photoBlobClient.Uri.ToString();

            // Generate and upload thumbnail (150x150)
            fileStream.Position = 0; // Reset stream for thumbnail generation
            var thumbnailUrl = await GenerateAndUploadThumbnailAsync(
                fileStream, 
                containerClient, 
                thumbnailFileName, 
                contentType);

            _logger.LogInformation(
                "Patient photo uploaded successfully for patient {PatientId} in tenant {TenantId}. Photo: {PhotoUrl}, Thumbnail: {ThumbnailUrl}",
                patientId, tenantId, photoUrl, thumbnailUrl);

            return (photoUrl, thumbnailUrl);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, 
                "Error uploading patient photo for patient {PatientId} in tenant {TenantId}", 
                patientId, tenantId);
            throw;
        }
    }

    /// <summary>
    /// Generates 150x150 thumbnail and uploads to blob storage
    /// Uses SixLabors.ImageSharp for image processing
    /// </summary>
    private async Task<string> GenerateAndUploadThumbnailAsync(
        Stream imageStream, 
        BlobContainerClient containerClient, 
        string thumbnailFileName, 
        string contentType)
    {
        try
        {
            using var image = await Image.LoadAsync(imageStream);
            
            // Resize to 150x150 thumbnail
            image.Mutate(x => x.Resize(new ResizeOptions
            {
                Size = new Size(150, 150),
                Mode = ResizeMode.Crop
            }));

            // Save to memory stream
            using var thumbnailStream = new MemoryStream();
            await image.SaveAsJpegAsync(thumbnailStream);
            thumbnailStream.Position = 0;

            // Upload thumbnail
            var thumbnailBlobClient = containerClient.GetBlobClient(thumbnailFileName);
            var blobHttpHeaders = new BlobHttpHeaders { ContentType = contentType };
            
            await thumbnailBlobClient.UploadAsync(thumbnailStream, new BlobUploadOptions
            {
                HttpHeaders = blobHttpHeaders,
                Conditions = null
            });

            return thumbnailBlobClient.Uri.ToString();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating thumbnail for {FileName}", thumbnailFileName);
            throw;
        }
    }

    /// <summary>
    /// Deletes a blob from storage
    /// </summary>
    public async Task<bool> DeleteFileAsync(string blobUrl)
    {
        try
        {
            var uri = new Uri(blobUrl);
            var blobClient = _blobServiceClient.GetBlobContainerClient(uri.Segments[1].Trim('/'))
                .GetBlobClient(string.Join("", uri.Segments.Skip(2)));

            var result = await blobClient.DeleteIfExistsAsync();
            
            if (result.Value)
            {
                _logger.LogInformation("Blob deleted successfully: {BlobUrl}", blobUrl);
            }

            return result.Value;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting blob {BlobUrl}", blobUrl);
            return false;
        }
    }

    /// <summary>
    /// Checks if blob exists
    /// </summary>
    public async Task<bool> BlobExistsAsync(string blobUrl)
    {
        try
        {
            var uri = new Uri(blobUrl);
            var blobClient = _blobServiceClient.GetBlobContainerClient(uri.Segments[1].Trim('/'))
                .GetBlobClient(string.Join("", uri.Segments.Skip(2)));

            return await blobClient.ExistsAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking blob existence {BlobUrl}", blobUrl);
            return false;
        }
    }

    /// <summary>
    /// Gets blob properties (size, content type, etc.)
    /// </summary>
    public async Task<BlobProperties?> GetBlobPropertiesAsync(string blobUrl)
    {
        try
        {
            var uri = new Uri(blobUrl);
            var blobClient = _blobServiceClient.GetBlobContainerClient(uri.Segments[1].Trim('/'))
                .GetBlobClient(string.Join("", uri.Segments.Skip(2)));

            var properties = await blobClient.GetPropertiesAsync();
            return properties.Value;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting blob properties {BlobUrl}", blobUrl);
            return null;
        }
    }
}
