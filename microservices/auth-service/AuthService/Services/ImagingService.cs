using AuthService.Context;
using AuthService.Models.Domain;
using AuthService.Models.Domain.Dtos;
using AuthService.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using System.IO;

namespace AuthService.Services;

public interface IImagingService
{
    Task<ImagingOrderResponse> CreateOrderAsync(CreateImagingOrderRequest request, Guid orderingDoctorId, Guid tenantId);
    Task<List<ImagingOrderResponse>> GetPatientOrdersAsync(Guid patientId, Guid tenantId);
    Task<List<ImagingOrderResponse>> GetSessionOrdersAsync(Guid sessionId, Guid tenantId);
    Task<ImagingOrderResponse?> GetOrderByIdAsync(Guid orderId, Guid tenantId);
    Task<ImagingOrderResponse?> UpdateOrderStatusAsync(Guid orderId, UpdateImagingOrderStatusRequest request, Guid tenantId, Guid userId);
    Task<List<ImagingOrderResponse>> GetOrdersByStatusAsync(string status, Guid tenantId);
    
    // Phase 7: Image management
    Task<List<ImageUploadResponse>> UploadImagesAsync(Guid orderId, List<IFormFile> files, string modality, Guid userId, Guid tenantId);
    Task<List<ImagingImageResponse>> GetOrderImagesAsync(Guid orderId, Guid tenantId);
    
    // Phase 7: Annotation management
    Task<ImagingAnnotationResponse> CreateAnnotationAsync(Guid imageId, CreateAnnotationRequest request, Guid userId, Guid tenantId);
    Task<List<ImagingAnnotationResponse>> GetImageAnnotationsAsync(Guid imageId, Guid tenantId);
    Task<ImagingAnnotationResponse?> UpdateAnnotationAsync(Guid annotationId, UpdateAnnotationRequest request, Guid userId, Guid tenantId);
    Task<bool> DeleteAnnotationAsync(Guid annotationId, Guid userId, Guid tenantId);
    
    // Phase 7: Comparison management
    Task<ImagingComparisonResponse> CreateComparisonAsync(CreateComparisonRequest request, Guid userId, Guid tenantId);
    Task<List<ImagingComparisonResponse>> GetPatientComparisonsAsync(Guid patientId, Guid tenantId);
}

public class ImagingService : IImagingService
{
    private readonly AppDbContext _context;
    private readonly ILogger<ImagingService> _logger;
    private readonly IBlobStorageService _blobStorageService;

    public ImagingService(
        AppDbContext context, 
        ILogger<ImagingService> logger,
        IBlobStorageService blobStorageService)
    {
        _context = context;
        _logger = logger;
        _blobStorageService = blobStorageService;
    }

    /// <summary>Loads a name→userId map for a given set of user IDs.</summary>
    private async Task<Dictionary<Guid, string>> LoadUserNamesAsync(IEnumerable<Guid> ids)
    {
        var distinctIds = ids.Where(id => id != Guid.Empty).Distinct().ToList();
        if (distinctIds.Count == 0) return new Dictionary<Guid, string>();
        return await _context.Users
            .Where(u => distinctIds.Contains(u.Id))
            .ToDictionaryAsync(
                u => u.Id,
                u => $"{u.FirstName} {u.LastName}".Trim());
    }

    /// <summary>
    /// Normalizes eye shorthand codes (OD/OS/OU) to the DB-expected values (Right/Left/Both).
    /// The CHECK constraint on imaging_orders requires 'Right', 'Left', or 'Both'.
    /// </summary>
    private static string? NormalizeLaterality(string? laterality) => laterality?.ToUpperInvariant() switch
    {
        "OD" or "RE" => "Right",
        "OS" or "LE" => "Left",
        "OU" or "BE" or "BOTH" => "Both",
        "RIGHT" => "Right",
        "LEFT" => "Left",
        _ => laterality,
    };

    /// <summary>
    /// Normalizes urgency strings to the DB-expected values (Routine/Urgent/STAT).
    /// The CHECK constraint on imaging_orders requires exactly 'Routine', 'Urgent', or 'STAT'.
    /// </summary>
    private static string NormalizeUrgency(string? urgency) => urgency?.ToUpperInvariant() switch
    {
        "ROUTINE" => "Routine",
        "URGENT" => "Urgent",
        "STAT" or "EMERGENCY" => "STAT",
        _ => "Routine",
    };

    public async Task<ImagingOrderResponse> CreateOrderAsync(
        CreateImagingOrderRequest request, 
        Guid orderingDoctorId, 
        Guid tenantId)
    {
        var order = new ImagingOrder
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PatientId = request.PatientId,
            ExaminationId = request.ExaminationId,
            SessionId = request.SessionId,
            ImagingType = request.ImagingType,
            Laterality = NormalizeLaterality(request.Laterality),
            Urgency = NormalizeUrgency(request.Urgency),
            ClinicalIndication = request.ClinicalIndication,
            OrderingDoctorId = orderingDoctorId,
            Status = "Pending",
            OrderedAt = DateTime.UtcNow,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedByUserId = orderingDoctorId
        };

        _context.ImagingOrders.Add(order);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Imaging order {OrderId} created for patient {PatientId} by doctor {DoctorId}", 
            order.Id, 
            request.PatientId, 
            orderingDoctorId);

        // Reload with navigation properties
        var createdOrder = await _context.ImagingOrders
            .Include(o => o.Patient)
            .FirstOrDefaultAsync(o => o.Id == order.Id);

        var names = await LoadUserNamesAsync([orderingDoctorId]);
        names.TryGetValue(orderingDoctorId, out var doctorName);
        return MapToResponse(createdOrder!, doctorName);
    }

    public async Task<List<ImagingOrderResponse>> GetPatientOrdersAsync(Guid patientId, Guid tenantId)
    {
        var orders = await _context.ImagingOrders
            .Include(o => o.Patient)
            .Where(o => o.PatientId == patientId && o.TenantId == tenantId)
            .OrderByDescending(o => o.OrderedAt)
            .ToListAsync();

        var names = await LoadUserNamesAsync(orders.Select(o => o.OrderingDoctorId));
        return orders.Select(o => {
            names.TryGetValue(o.OrderingDoctorId, out var n);
            return MapToResponse(o, n);
        }).ToList();
    }

    public async Task<List<ImagingOrderResponse>> GetSessionOrdersAsync(Guid sessionId, Guid tenantId)
    {
        var orders = await _context.ImagingOrders
            .Include(o => o.Patient)
            .Where(o => o.SessionId == sessionId && o.TenantId == tenantId)
            .OrderByDescending(o => o.OrderedAt)
            .ToListAsync();

        var names = await LoadUserNamesAsync(orders.Select(o => o.OrderingDoctorId));
        return orders.Select(o => {
            names.TryGetValue(o.OrderingDoctorId, out var n);
            return MapToResponse(o, n);
        }).ToList();
    }

    public async Task<ImagingOrderResponse?> GetOrderByIdAsync(Guid orderId, Guid tenantId)
    {
        var order = await _context.ImagingOrders
            .Include(o => o.Patient)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.TenantId == tenantId);

        if (order == null) return null;
        var names = await LoadUserNamesAsync([order.OrderingDoctorId]);
        names.TryGetValue(order.OrderingDoctorId, out var n);
        return MapToResponse(order, n);
    }

    public async Task<ImagingOrderResponse?> UpdateOrderStatusAsync(
        Guid orderId, 
        UpdateImagingOrderStatusRequest request, 
        Guid tenantId, 
        Guid userId)
    {
        var order = await _context.ImagingOrders
            .Include(o => o.Patient)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.TenantId == tenantId);

        if (order == null)
        {
            return null;
        }

        order.Status = request.Status;
        order.CompletedAt = request.CompletedAt;
        order.ResultSummary = request.ResultSummary;
        order.DicomStudyId = request.DicomStudyId;
        order.ImageStoragePath = request.ImageStoragePath;
        order.UpdatedAt = DateTime.UtcNow;
        order.UpdatedByUserId = userId;

        // If status is "Reviewed", set reviewed info
        if (request.Status == "Reviewed")
        {
            order.ReviewedByUserId = userId;
            order.ReviewedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Imaging order {OrderId} status updated to {Status} by user {UserId}", 
            orderId, 
            request.Status, 
            userId);

        var names = await LoadUserNamesAsync([order.OrderingDoctorId]);
        names.TryGetValue(order.OrderingDoctorId, out var n);
        return MapToResponse(order, n);
    }

    public async Task<List<ImagingOrderResponse>> GetOrdersByStatusAsync(string status, Guid tenantId)
    {
        var orders = await _context.ImagingOrders
            .Include(o => o.Patient)
            .Where(o => o.Status == status && o.TenantId == tenantId)
            .OrderByDescending(o => o.OrderedAt)
            .ToListAsync();

        var names = await LoadUserNamesAsync(orders.Select(o => o.OrderingDoctorId));
        return orders.Select(o => {
            names.TryGetValue(o.OrderingDoctorId, out var n);
            return MapToResponse(o, n);
        }).ToList();
    }

    private ImagingOrderResponse MapToResponse(ImagingOrder order, string? doctorName = null)
    {
        return new ImagingOrderResponse
        {
            Id = order.Id,
            PatientId = order.PatientId,
            PatientName = order.Patient != null 
                ? $"{order.Patient.FirstName} {order.Patient.LastName}"
                : "Unknown Patient",
            ExaminationId = order.ExaminationId,
            SessionId = order.SessionId,
            ImagingType = order.ImagingType,
            Laterality = order.Laterality,
            Urgency = order.Urgency,
            ClinicalIndication = order.ClinicalIndication,
            OrderingDoctorId = order.OrderingDoctorId,
            OrderingDoctorName = !string.IsNullOrWhiteSpace(doctorName) ? doctorName : "Unknown",
            Status = order.Status,
            OrderedAt = order.OrderedAt,
            CompletedAt = order.CompletedAt,
            ReviewedByUserId = order.ReviewedByUserId,
            ReviewedAt = order.ReviewedAt,
            ResultSummary = order.ResultSummary,
            DicomStudyId = order.DicomStudyId,
            ImageStoragePath = order.ImageStoragePath,
            Notes = order.Notes,
            CreatedAt = order.CreatedAt,
            UpdatedAt = order.UpdatedAt
        };
    }

    // Phase 7: Image Management Methods

    public async Task<List<ImageUploadResponse>> UploadImagesAsync(
        Guid orderId, 
        List<IFormFile> files, 
        string modality, 
        Guid userId, 
        Guid tenantId)
    {
        // Validate order exists and belongs to tenant
        var order = await _context.ImagingOrders
            .FirstOrDefaultAsync(o => o.Id == orderId && o.TenantId == tenantId);

        if (order == null)
            throw new InvalidOperationException("Imaging order not found");

        var uploadedImages = new List<ImageUploadResponse>();

        foreach (var file in files)
        {
            // Validate file
            if (file.Length == 0)
                continue;

            if (file.Length > 52428800) // 50MB
                throw new InvalidOperationException($"File {file.FileName} exceeds maximum size of 50MB");

            var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "application/dicom", "application/pdf" };
            if (!allowedTypes.Contains(file.ContentType.ToLower()))
                throw new InvalidOperationException($"File type {file.ContentType} not allowed");

            try
            {
                // Upload to Azure Blob Storage
                var fileName = $"{orderId}/{Guid.NewGuid()}_{file.FileName}";
                using var fileStream = file.OpenReadStream();
                var imageUrl = await _blobStorageService.UploadFileAsync(
                    fileName, 
                    fileStream,
                    file.ContentType,
                    "imaging-files");

                // Generate thumbnail (256x256) for gallery view
                string? thumbnailUrl = null;
                if (file.ContentType.StartsWith("image/"))
                {
                    var thumbnailFileName = $"{orderId}/thumbnails/{Guid.NewGuid()}_{file.FileName}";
                    using var thumbnailStream = await GenerateThumbnailAsync(file, 256, 256);
                    if (thumbnailStream != null)
                    {
                        thumbnailUrl = await _blobStorageService.UploadFileAsync(
                            thumbnailFileName, 
                            thumbnailStream,
                            file.ContentType,
                            "imaging-files");
                    }
                }

                // Get image dimensions if it's an image
                int? width = null, height = null;
                if (file.ContentType.StartsWith("image/"))
                {
                    using var dimStream = file.OpenReadStream();
                    using var image = await SixLabors.ImageSharp.Image.LoadAsync(dimStream);
                    width = image.Width;
                    height = image.Height;
                }

                // Save to database
                var imagingImage = new ImagingImage
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    ImagingOrderId = orderId,
                    ImageUrl = imageUrl,
                    ThumbnailUrl = thumbnailUrl,
                    FileName = file.FileName,
                    FileSize = file.Length,
                    ContentType = file.ContentType,
                    Width = width,
                    Height = height,
                    Modality = modality,
                    UploadedByUserId = userId,
                    UploadedAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    CreatedByUserId = userId,
                    Status = "active"
                };

                _context.ImagingImages.Add(imagingImage);
                await _context.SaveChangesAsync();

                uploadedImages.Add(new ImageUploadResponse
                {
                    Id = imagingImage.Id,
                    ImagingOrderId = orderId,
                    ImageUrl = imageUrl,
                    ThumbnailUrl = thumbnailUrl,
                    FileName = file.FileName,
                    FileSize = file.Length,
                    ContentType = file.ContentType,
                    Width = width,
                    Height = height,
                    Modality = modality,
                    UploadedAt = imagingImage.UploadedAt
                });

                _logger.LogInformation(
                    "Uploaded image {FileName} for order {OrderId} by user {UserId}",
                    file.FileName, orderId, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to upload image {FileName} for order {OrderId}", file.FileName, orderId);
                throw;
            }
        }

        // Update order status if still pending
        if (order.Status == "Pending")
        {
            order.Status = "In-Progress";
            order.UpdatedAt = DateTime.UtcNow;
            order.UpdatedByUserId = userId;
            await _context.SaveChangesAsync();
        }

        return uploadedImages;
    }

    public async Task<List<ImagingImageResponse>> GetOrderImagesAsync(Guid orderId, Guid tenantId)
    {
        var images = await _context.ImagingImages
            .Include(i => i.Annotations!.Where(a => a.DeletedAt == null))
            .Where(i => i.ImagingOrderId == orderId && i.TenantId == tenantId && i.DeletedAt == null)
            .OrderBy(i => i.UploadedAt)
            .ToListAsync();

        return images.Select(i => new ImagingImageResponse
        {
            Id = i.Id,
            ImagingOrderId = i.ImagingOrderId,
            ImageUrl = i.ImageUrl,
            ThumbnailUrl = i.ThumbnailUrl,
            FileName = i.FileName,
            FileSize = i.FileSize,
            ContentType = i.ContentType,
            Width = i.Width,
            Height = i.Height,
            Modality = i.Modality,
            DicomMetadata = i.DicomMetadata,
            UploadedByUserId = i.UploadedByUserId,
            UploadedByUserName = "User", // TODO: Load from navigation
            UploadedAt = i.UploadedAt,
            Annotations = i.Annotations?.Select(MapAnnotationToResponse).ToList()
        }).ToList();
    }

    private async Task<MemoryStream?> GenerateThumbnailAsync(IFormFile file, int width, int height)
    {
        try
        {
            using var inputStream = file.OpenReadStream();
            using var image = await SixLabors.ImageSharp.Image.LoadAsync(inputStream);
            
            image.Mutate(x => x.Resize(new SixLabors.ImageSharp.Processing.ResizeOptions
            {
                Size = new SixLabors.ImageSharp.Size(width, height),
                Mode = SixLabors.ImageSharp.Processing.ResizeMode.Max
            }));

            var outputStream = new MemoryStream();
            await image.SaveAsJpegAsync(outputStream);
            outputStream.Position = 0;
            return outputStream;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to generate thumbnail for {FileName}", file.FileName);
            return null;
        }
    }

    // Phase 7: Annotation Management Methods

    public async Task<ImagingAnnotationResponse> CreateAnnotationAsync(
        Guid imageId, 
        CreateAnnotationRequest request, 
        Guid userId, 
        Guid tenantId)
    {
        // Validate image exists
        var image = await _context.ImagingImages
            .FirstOrDefaultAsync(i => i.Id == imageId && i.TenantId == tenantId);

        if (image == null)
            throw new InvalidOperationException("Image not found");

        var annotation = new ImagingAnnotation
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            ImagingImageId = imageId,
            AnnotationType = request.AnnotationType,
            ToolName = request.ToolName,
            Coordinates = request.Coordinates,
            MeasurementValue = request.MeasurementValue,
            MeasurementUnit = request.MeasurementUnit,
            TextContent = request.TextContent,
            Color = request.Color ?? "#00FF00",
            LineWidth = request.LineWidth ?? 2,
            FontSize = request.FontSize ?? 14,
            AnnotationMetadata = request.AnnotationMetadata,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Status = "active"
        };

        _context.ImagingAnnotations.Add(annotation);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Created annotation {AnnotationType} on image {ImageId} by user {UserId}",
            request.AnnotationType, imageId, userId);

        return MapAnnotationToResponse(annotation);
    }

    public async Task<List<ImagingAnnotationResponse>> GetImageAnnotationsAsync(Guid imageId, Guid tenantId)
    {
        var annotations = await _context.ImagingAnnotations
            .Where(a => a.ImagingImageId == imageId && a.TenantId == tenantId && a.DeletedAt == null)
            .OrderBy(a => a.CreatedAt)
            .ToListAsync();

        return annotations.Select(MapAnnotationToResponse).ToList();
    }

    public async Task<ImagingAnnotationResponse?> UpdateAnnotationAsync(
        Guid annotationId, 
        UpdateAnnotationRequest request, 
        Guid userId, 
        Guid tenantId)
    {
        var annotation = await _context.ImagingAnnotations
            .FirstOrDefaultAsync(a => a.Id == annotationId && a.TenantId == tenantId && a.DeletedAt == null);

        if (annotation == null)
            return null;

        // Update only provided fields
        if (!string.IsNullOrEmpty(request.AnnotationType))
            annotation.AnnotationType = request.AnnotationType;
        if (!string.IsNullOrEmpty(request.Coordinates))
            annotation.Coordinates = request.Coordinates;
        if (request.MeasurementValue.HasValue)
            annotation.MeasurementValue = request.MeasurementValue;
        if (!string.IsNullOrEmpty(request.MeasurementUnit))
            annotation.MeasurementUnit = request.MeasurementUnit;
        if (request.TextContent != null)
            annotation.TextContent = request.TextContent;
        if (!string.IsNullOrEmpty(request.Color))
            annotation.Color = request.Color;
        if (request.LineWidth.HasValue)
            annotation.LineWidth = request.LineWidth.Value;
        if (request.FontSize.HasValue)
            annotation.FontSize = request.FontSize.Value;

        annotation.UpdatedAt = DateTime.UtcNow;
        annotation.UpdatedByUserId = userId;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated annotation {AnnotationId} by user {UserId}", annotationId, userId);

        return MapAnnotationToResponse(annotation);
    }

    public async Task<bool> DeleteAnnotationAsync(Guid annotationId, Guid userId, Guid tenantId)
    {
        var annotation = await _context.ImagingAnnotations
            .FirstOrDefaultAsync(a => a.Id == annotationId && a.TenantId == tenantId && a.DeletedAt == null);

        if (annotation == null)
            return false;

        // Soft delete
        annotation.DeletedAt = DateTime.UtcNow;
        annotation.UpdatedAt = DateTime.UtcNow;
        annotation.UpdatedByUserId = userId;
        annotation.Status = "deleted";

        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted annotation {AnnotationId} by user {UserId}", annotationId, userId);

        return true;
    }

    private ImagingAnnotationResponse MapAnnotationToResponse(ImagingAnnotation annotation)
    {
        return new ImagingAnnotationResponse
        {
            Id = annotation.Id,
            ImagingImageId = annotation.ImagingImageId,
            AnnotationType = annotation.AnnotationType,
            ToolName = annotation.ToolName,
            Coordinates = annotation.Coordinates,
            MeasurementValue = annotation.MeasurementValue,
            MeasurementUnit = annotation.MeasurementUnit,
            TextContent = annotation.TextContent,
            Color = annotation.Color,
            LineWidth = annotation.LineWidth,
            FontSize = annotation.FontSize,
            AnnotationMetadata = annotation.AnnotationMetadata,
            CreatedByUserId = annotation.CreatedByUserId,
            CreatedByUserName = "User", // TODO: Load from navigation
            CreatedAt = annotation.CreatedAt,
            UpdatedAt = annotation.UpdatedAt
        };
    }

    // Phase 7: Comparison Management Methods

    public async Task<ImagingComparisonResponse> CreateComparisonAsync(
        CreateComparisonRequest request, 
        Guid userId, 
        Guid tenantId)
    {
        // Validate both images exist and belong to same tenant/patient
        var baselineImage = await _context.ImagingImages
            .Include(i => i.ImagingOrder)
            .FirstOrDefaultAsync(i => i.Id == request.BaselineImageId && i.TenantId == tenantId);

        var followupImage = await _context.ImagingImages
            .Include(i => i.ImagingOrder)
            .FirstOrDefaultAsync(i => i.Id == request.FollowupImageId && i.TenantId == tenantId);

        if (baselineImage == null || followupImage == null)
            throw new InvalidOperationException("One or both images not found");

        if (baselineImage.ImagingOrder?.PatientId != followupImage.ImagingOrder?.PatientId)
            throw new InvalidOperationException("Images must belong to the same patient");

        var comparison = new ImagingComparison
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PatientId = request.PatientId,
            BaselineImageId = request.BaselineImageId,
            FollowupImageId = request.FollowupImageId,
            ComparisonType = request.ComparisonType,
            Findings = request.Findings,
            ChangePercentage = request.ChangePercentage,
            ClinicalSignificance = request.ClinicalSignificance,
            QuantitativeMetrics = request.QuantitativeMetrics,
            ReviewedByUserId = userId,
            ReviewedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedByUserId = userId,
            Status = "active"
        };

        _context.ImagingComparisons.Add(comparison);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Created comparison for patient {PatientId} between images {BaselineId} and {FollowupId}",
            request.PatientId, request.BaselineImageId, request.FollowupImageId);

        return await MapComparisonToResponseAsync(comparison);
    }

    public async Task<List<ImagingComparisonResponse>> GetPatientComparisonsAsync(Guid patientId, Guid tenantId)
    {
        var comparisons = await _context.ImagingComparisons
            .Include(c => c.Patient)
            .Include(c => c.BaselineImage)
            .Include(c => c.FollowupImage)
            .Where(c => c.PatientId == patientId && c.TenantId == tenantId && c.DeletedAt == null)
            .OrderByDescending(c => c.ReviewedAt)
            .ToListAsync();

        var responses = new List<ImagingComparisonResponse>();
        foreach (var comparison in comparisons)
        {
            responses.Add(await MapComparisonToResponseAsync(comparison));
        }
        return responses;
    }

    private async Task<ImagingComparisonResponse> MapComparisonToResponseAsync(ImagingComparison comparison)
    {
        // Load related images if not already loaded
        if (comparison.BaselineImage == null)
        {
            comparison.BaselineImage = await _context.ImagingImages
                .FirstOrDefaultAsync(i => i.Id == comparison.BaselineImageId);
        }
        if (comparison.FollowupImage == null)
        {
            comparison.FollowupImage = await _context.ImagingImages
                .FirstOrDefaultAsync(i => i.Id == comparison.FollowupImageId);
        }

        return new ImagingComparisonResponse
        {
            Id = comparison.Id,
            PatientId = comparison.PatientId,
            PatientName = comparison.Patient != null 
                ? $"{comparison.Patient.FirstName} {comparison.Patient.LastName}"
                : "Unknown",
            BaselineImageId = comparison.BaselineImageId,
            FollowupImageId = comparison.FollowupImageId,
            ComparisonType = comparison.ComparisonType,
            TimeIntervalDays = comparison.TimeIntervalDays,
            Findings = comparison.Findings,
            ChangePercentage = comparison.ChangePercentage,
            ClinicalSignificance = comparison.ClinicalSignificance,
            QuantitativeMetrics = comparison.QuantitativeMetrics,
            ReviewedByUserId = comparison.ReviewedByUserId,
            ReviewedByUserName = "Doctor", // TODO: Load from navigation
            ReviewedAt = comparison.ReviewedAt,
            BaselineImage = comparison.BaselineImage != null 
                ? new ImagingImageResponse
                {
                    Id = comparison.BaselineImage.Id,
                    ImagingOrderId = comparison.BaselineImage.ImagingOrderId,
                    ImageUrl = comparison.BaselineImage.ImageUrl,
                    ThumbnailUrl = comparison.BaselineImage.ThumbnailUrl,
                    FileName = comparison.BaselineImage.FileName,
                    FileSize = comparison.BaselineImage.FileSize,
                    ContentType = comparison.BaselineImage.ContentType,
                    Width = comparison.BaselineImage.Width,
                    Height = comparison.BaselineImage.Height,
                    Modality = comparison.BaselineImage.Modality,
                    DicomMetadata = comparison.BaselineImage.DicomMetadata,
                    UploadedByUserId = comparison.BaselineImage.UploadedByUserId,
                    UploadedAt = comparison.BaselineImage.UploadedAt
                }
                : null,
            FollowupImage = comparison.FollowupImage != null 
                ? new ImagingImageResponse
                {
                    Id = comparison.FollowupImage.Id,
                    ImagingOrderId = comparison.FollowupImage.ImagingOrderId,
                    ImageUrl = comparison.FollowupImage.ImageUrl,
                    ThumbnailUrl = comparison.FollowupImage.ThumbnailUrl,
                    FileName = comparison.FollowupImage.FileName,
                    FileSize = comparison.FollowupImage.FileSize,
                    ContentType = comparison.FollowupImage.ContentType,
                    Width = comparison.FollowupImage.Width,
                    Height = comparison.FollowupImage.Height,
                    Modality = comparison.FollowupImage.Modality,
                    DicomMetadata = comparison.FollowupImage.DicomMetadata,
                    UploadedByUserId = comparison.FollowupImage.UploadedByUserId,
                    UploadedAt = comparison.FollowupImage.UploadedAt
                }
                : null
        };
    }
}
