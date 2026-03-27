using AuthService.Context;
using AuthService.Models.Domain;
using AuthService.Models.Domain.Dtos;
using AuthService.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.Net.Http;

namespace AuthService.Services;

/// <summary>
/// Service for exporting imaging studies to PDF reports
/// </summary>
public interface IImagingExportService
{
    Task<ImagingReportResponse> GenerateImagingReportAsync(Guid orderId, ExportOptions options, Guid userId, Guid tenantId);
    Task<ImagingReportResponse> GenerateComparisonReportAsync(Guid comparisonId, ExportOptions options, Guid userId, Guid tenantId);
}

public class ExportOptions
{
    public bool IncludeAnnotations { get; set; } = true;
    public bool IncludeMeasurements { get; set; } = true;
    public bool IncludeComparisons { get; set; } = true;
    public bool IncludePatientDemographics { get; set; } = false; // HIPAA: false for de-identification
    public string ReportTemplate { get; set; } = "standard"; // standard, summary, detailed
}

public class ImagingReportResponse
{
    public Guid ReportId { get; set; }
    public string ReportUrl { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; }
    public long FileSizeBytes { get; set; }
}

public class ImagingExportService : IImagingExportService
{
    private readonly AppDbContext _context;
    private readonly ILogger<ImagingExportService> _logger;
    private readonly IBlobStorageService _blobStorageService;
    private readonly IHttpClientFactory _httpClientFactory;

    public ImagingExportService(
        AppDbContext context,
        ILogger<ImagingExportService> logger,
        IBlobStorageService blobStorageService,
        IHttpClientFactory httpClientFactory)
    {
        _context = context;
        _logger = logger;
        _blobStorageService = blobStorageService;
        _httpClientFactory = httpClientFactory;
        
        // Configure QuestPDF license (Community edition for development)
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public async Task<ImagingReportResponse> GenerateImagingReportAsync(
        Guid orderId, 
        ExportOptions options, 
        Guid userId, 
        Guid tenantId)
    {
        _logger.LogInformation("Generating imaging report for order {OrderId}", orderId);

        // Load order with all related data
        var order = await _context.ImagingOrders
            .Include(o => o.Patient)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.TenantId == tenantId);

        if (order == null)
        {
            throw new KeyNotFoundException($"Imaging order {orderId} not found");
        }

        // Load images separately (not a navigation property on ImagingOrder)
        var images = await _context.ImagingImages
            .Where(i => i.ImagingOrderId == orderId && i.TenantId == tenantId && i.DeletedAt == null)
            .Include(i => i.Annotations)
            .ToListAsync();

        // Load comparisons if requested
        List<ImagingComparison>? comparisons = null;
        if (options.IncludeComparisons)
        {
            comparisons = await _context.ImagingComparisons
                .Where(c => c.PatientId == order.PatientId && c.TenantId == tenantId)
                .OrderByDescending(c => c.CreatedAt)
                .Take(5) // Limit to last 5 comparisons
                .ToListAsync();
        }

        // Generate PDF document
        var pdfBytes = await GeneratePdfDocumentAsync(order, images, comparisons, options);

        // Upload to Azure Blob Storage
        var fileName = $"imaging_report_{order.Id}_{DateTime.UtcNow:yyyyMMddHHmmss}.pdf";
        using var pdfStream = new MemoryStream(pdfBytes);
        var reportUrl = await _blobStorageService.UploadFileAsync(
            fileName,
            pdfStream,
            "application/pdf",
            "imaging-reports"
        );

        _logger.LogInformation("Imaging report generated successfully: {ReportUrl}", reportUrl);

        return new ImagingReportResponse
        {
            ReportId = Guid.NewGuid(),
            ReportUrl = reportUrl,
            FileName = fileName,
            GeneratedAt = DateTime.UtcNow,
            FileSizeBytes = pdfBytes.Length
        };
    }

    public async Task<ImagingReportResponse> GenerateComparisonReportAsync(
        Guid comparisonId,
        ExportOptions options,
        Guid userId,
        Guid tenantId)
    {
        _logger.LogInformation("Generating comparison report for {ComparisonId}", comparisonId);

        var comparison = await _context.ImagingComparisons
            .Include(c => c.Patient)
            .Include(c => c.BaselineImage)
            .Include(c => c.FollowupImage)
            .FirstOrDefaultAsync(c => c.Id == comparisonId && c.TenantId == tenantId);

        if (comparison == null)
        {
            throw new KeyNotFoundException($"Imaging comparison {comparisonId} not found");
        }

        // Load annotations separately
        if (comparison.BaselineImage != null)
        {
            comparison.BaselineImage.Annotations = await _context.ImagingAnnotations
                .Where(a => a.ImagingImageId == comparison.BaselineImageId)
                .ToListAsync();
        }

        if (comparison.FollowupImage != null)
        {
            comparison.FollowupImage.Annotations = await _context.ImagingAnnotations
                .Where(a => a.ImagingImageId == comparison.FollowupImageId)
                .ToListAsync();
        }

        if (comparison == null)
        {
            throw new KeyNotFoundException($"Imaging comparison {comparisonId} not found");
        }

        // Generate PDF for comparison
        var pdfBytes = await GenerateComparisonPdfAsync(comparison, options);

        // Upload to Azure Blob Storage
        var fileName = $"comparison_report_{comparison.Id}_{DateTime.UtcNow:yyyyMMddHHmmss}.pdf";
        using var pdfStream = new MemoryStream(pdfBytes);
        var reportUrl = await _blobStorageService.UploadFileAsync(
            fileName,
            pdfStream,
            "application/pdf",
            "imaging-reports"
        );

        _logger.LogInformation("Comparison report generated successfully: {ReportUrl}", reportUrl);

        return new ImagingReportResponse
        {
            ReportId = Guid.NewGuid(),
            ReportUrl = reportUrl,
            FileName = fileName,
            GeneratedAt = DateTime.UtcNow,
            FileSizeBytes = pdfBytes.Length
        };
    }

    private async Task<byte[]> GeneratePdfDocumentAsync(
        ImagingOrder order,
        List<ImagingImage> images,
        List<ImagingComparison>? comparisons,
        ExportOptions options)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(11).FontFamily("Arial"));

                // Header
                page.Header().Element(c => ComposeHeader(c, order, options));

                // Content
                page.Content().Element(c => ComposeContent(c, order, images, comparisons, options));

                // Footer
                page.Footer().Element(c => ComposeFooter(c));
            });
        });

        return document.GeneratePdf();
    }

    private void ComposeHeader(IContainer container, ImagingOrder order, ExportOptions options)
    {
        container.Column(column =>
        {
            column.Item().BorderBottom(1).BorderColor(Colors.Blue.Medium).PaddingBottom(10).Row(row =>
            {
                row.RelativeItem().Column(col =>
                {
                    col.Item().Text("IMAGING REPORT").FontSize(20).Bold().FontColor(Colors.Blue.Darken2);
                    col.Item().Text($"Order ID: {order.Id}").FontSize(10).FontColor(Colors.Grey.Darken2);
                });

                row.ConstantItem(120).AlignRight().Column(col =>
                {
                    col.Item().Text($"Date: {DateTime.UtcNow:yyyy-MM-dd}").FontSize(9);
                    col.Item().Text($"Time: {DateTime.UtcNow:HH:mm:ss} UTC").FontSize(9);
                });
            });

            // Patient Demographics (optional for HIPAA de-identification)
            if (options.IncludePatientDemographics && order.Patient != null)
            {
                column.Item().PaddingTop(15).Row(row =>
                {
                    row.RelativeItem().Column(col =>
                    {
                        col.Item().Text("PATIENT INFORMATION").FontSize(12).Bold();
                        col.Item().PaddingTop(5).Text($"Name: {order.Patient.FirstName} {order.Patient.LastName}");
                        col.Item().Text($"MRN: {order.Patient.MedicalRecordNumber ?? "N/A"}");
                        col.Item().Text($"DOB: {order.Patient.DateOfBirth:yyyy-MM-dd}");
                    });

                    row.ConstantItem(200).Column(col =>
                    {
                        col.Item().Text("STUDY INFORMATION").FontSize(12).Bold();
                        col.Item().PaddingTop(5).Text($"Type: {order.ImagingType}");
                        col.Item().Text($"Ordered: {order.OrderedAt:yyyy-MM-dd}");
                        col.Item().Text($"Status: {order.Status}");
                    });
                });
            }
            else
            {
                column.Item().PaddingTop(15).Column(col =>
                {
                    col.Item().Text("STUDY INFORMATION").FontSize(12).Bold();
                    col.Item().PaddingTop(5).Text($"Type: {order.ImagingType}");
                    col.Item().Text($"Ordered: {order.OrderedAt:yyyy-MM-dd}");
                    col.Item().Text($"Status: {order.Status}");
                    col.Item().Text("[Patient demographics omitted for de-identification]").FontSize(9).Italic().FontColor(Colors.Grey.Medium);
                });
            }
        });
    }

    private void ComposeContent(
        IContainer container,
        ImagingOrder order,
        List<ImagingImage> images,
        List<ImagingComparison>? comparisons,
        ExportOptions options)
    {
        container.Column(column =>
        {
            column.Spacing(15);

            // Images Section
            column.Item().Element(c => ComposeImagesSection(c, order, images, options));

            // Measurements Table
            if (options.IncludeMeasurements)
            {
                column.Item().Element(c => ComposeMeasurementsTable(c, images));
            }

            // Comparisons Section
            if (options.IncludeComparisons && comparisons != null && comparisons.Any())
            {
                column.Item().Element(c => ComposeComparisonsSection(c, comparisons));
            }

            // Findings
            if (!string.IsNullOrWhiteSpace(order.ResultSummary))
            {
                column.Item().Element(c => ComposeFindingsSection(c, order));
            }
        });
    }

    private void ComposeImagesSection(IContainer container, ImagingOrder order, List<ImagingImage> images, ExportOptions options)
    {
        container.Column(column =>
        {
            column.Item().Text("IMAGES").FontSize(14).Bold().FontColor(Colors.Blue.Darken1);
            column.Item().PaddingBottom(5).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);

            if (images == null || !images.Any())
            {
                column.Item().PaddingTop(10).Text("No images available").Italic().FontColor(Colors.Grey.Medium);
                return;
            }

            column.Item().PaddingTop(10).Text($"Total Images: {images.Count}").FontSize(10);

            foreach (var image in images.Take(4)) // Limit to first 4 images to fit page
            {
                column.Item().PaddingTop(10).Row(row =>
                {
                    row.RelativeItem().Column(col =>
                    {
                        col.Item().Text($"Image ID: {image.Id}").FontSize(9).FontColor(Colors.Grey.Darken1);
                        col.Item().Text($"Modality: {image.Modality ?? "N/A"}").FontSize(9);
                        col.Item().Text($"Acquired: {image.CreatedAt:yyyy-MM-dd HH:mm}").FontSize(9);
                        
                        if (options.IncludeAnnotations && image.Annotations != null && image.Annotations.Any())
                        {
                            col.Item().PaddingTop(5).Text($"Annotations: {image.Annotations.Count}").FontSize(9).FontColor(Colors.Blue.Medium);
                        }
                    });
                });
            }

            if (images.Count > 4)
            {
                column.Item().PaddingTop(10).Text($"[{images.Count - 4} additional images not shown]")
                    .FontSize(9).Italic().FontColor(Colors.Grey.Medium);
            }
        });
    }

    private void ComposeMeasurementsTable(IContainer container, List<ImagingImage> images)
    {
        var annotations = images
            .SelectMany(i => i.Annotations ?? new List<ImagingAnnotation>())
            .Where(a => a.MeasurementValue.HasValue)
            .ToList();

        if (annotations == null || !annotations.Any())
        {
            return;
        }

        container.Column(column =>
        {
            column.Item().Text("MEASUREMENTS").FontSize(14).Bold().FontColor(Colors.Blue.Darken1);
            column.Item().PaddingBottom(5).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);

            column.Item().PaddingTop(10).Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(100); // Type
                    columns.RelativeColumn(); // Value
                    columns.ConstantColumn(80); // Unit
                    columns.ConstantColumn(120); // Date
                });

                // Header
                table.Header(header =>
                {
                    header.Cell().Background(Colors.Blue.Lighten4).Padding(5).Text("Type").Bold();
                    header.Cell().Background(Colors.Blue.Lighten4).Padding(5).Text("Value").Bold();
                    header.Cell().Background(Colors.Blue.Lighten4).Padding(5).Text("Unit").Bold();
                    header.Cell().Background(Colors.Blue.Lighten4).Padding(5).Text("Date").Bold();
                });

                // Data rows
                foreach (var annotation in annotations.Take(20)) // Limit to 20 measurements
                {
                    table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(5)
                        .Text(annotation.AnnotationType).FontSize(9);
                    table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(5)
                        .Text(annotation.MeasurementValue?.ToString("F2") ?? "N/A").FontSize(9);
                    table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(5)
                        .Text(annotation.MeasurementUnit ?? "").FontSize(9);
                    table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(5)
                        .Text(annotation.CreatedAt.ToString("yyyy-MM-dd")).FontSize(9);
                }
            });
        });
    }

    private void ComposeComparisonsSection(IContainer container, List<ImagingComparison> comparisons)
    {
        container.Column(column =>
        {
            column.Item().Text("COMPARISONS").FontSize(14).Bold().FontColor(Colors.Blue.Darken1);
            column.Item().PaddingBottom(5).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);

            foreach (var comparison in comparisons)
            {
                column.Item().PaddingTop(10).Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Text($"{comparison.ComparisonType} - {comparison.CreatedAt:yyyy-MM-dd}")
                            .FontSize(11).Bold();
                        row.ConstantItem(80).Text($"[{comparison.ClinicalSignificance}]")
                            .FontSize(9).FontColor(GetSignificanceColor(comparison.ClinicalSignificance));
                    });

                    if (!string.IsNullOrWhiteSpace(comparison.Findings))
                    {
                        col.Item().PaddingTop(5).PaddingLeft(10)
                            .Text(comparison.Findings).FontSize(9).LineHeight(1.3f);
                    }
                });
            }
        });
    }

    private void ComposeFindingsSection(IContainer container, ImagingOrder order)
    {
        container.Column(column =>
        {
            column.Item().Text("FINDINGS").FontSize(14).Bold().FontColor(Colors.Blue.Darken1);
            column.Item().PaddingBottom(5).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
            column.Item().PaddingTop(10).Text(order.ResultSummary ?? "No findings documented")
                .FontSize(10).LineHeight(1.4f);
        });
    }

    private void ComposeFooter(IContainer container)
    {
        container.Column(column =>
        {
            column.Item().BorderTop(1).BorderColor(Colors.Grey.Lighten2).PaddingTop(5).Row(row =>
            {
                row.RelativeItem().Text($"Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC")
                    .FontSize(8).FontColor(Colors.Grey.Medium);
                row.ConstantItem(150).AlignRight().Text("Page ")
                    .FontSize(8).FontColor(Colors.Grey.Medium);
            });

            column.Item().PaddingTop(5).Text("HIPAA Notice: This report contains protected health information. Unauthorized disclosure is prohibited.")
                .FontSize(7).Italic().FontColor(Colors.Grey.Medium).AlignCenter();
        });
    }

    private async Task<byte[]> GenerateComparisonPdfAsync(ImagingComparison comparison, ExportOptions options)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape()); // Landscape for side-by-side
                page.Margin(2, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(11).FontFamily("Arial"));

                // Header
                page.Header().Element(c => ComposeComparisonHeader(c, comparison, options));

                // Content
                page.Content().Element(c => ComposeComparisonContent(c, comparison, options));

                // Footer
                page.Footer().Element(c => ComposeFooter(c));
            });
        });

        return document.GeneratePdf();
    }

    private void ComposeComparisonHeader(IContainer container, ImagingComparison comparison, ExportOptions options)
    {
        container.Column(column =>
        {
            column.Item().BorderBottom(1).BorderColor(Colors.Blue.Medium).PaddingBottom(10).Row(row =>
            {
                row.RelativeItem().Column(col =>
                {
                    col.Item().Text("IMAGING COMPARISON REPORT").FontSize(18).Bold().FontColor(Colors.Blue.Darken2);
                    col.Item().Text($"Comparison Type: {comparison.ComparisonType}").FontSize(11);
                    col.Item().Text($"Clinical Significance: {comparison.ClinicalSignificance}").FontSize(11)
                        .FontColor(GetSignificanceColor(comparison.ClinicalSignificance));
                });

                row.ConstantItem(120).AlignRight().Column(col =>
                {
                    col.Item().Text($"Date: {DateTime.UtcNow:yyyy-MM-dd}").FontSize(9);
                    col.Item().Text($"Time: {DateTime.UtcNow:HH:mm:ss} UTC").FontSize(9);
                });
            });
        });
    }

    private void ComposeComparisonContent(IContainer container, ImagingComparison comparison, ExportOptions options)
    {
        container.Column(column =>
        {
            // Side-by-side image info
            column.Item().PaddingTop(15).Row(row =>
            {
                row.RelativeItem().Column(col =>
                {
                    col.Item().Text("BASELINE IMAGE").FontSize(12).Bold().FontColor(Colors.Blue.Darken1);
                    col.Item().PaddingTop(5).Text($"Image ID: {comparison.BaselineImageId}").FontSize(9);
                    if (comparison.BaselineImage != null)
                    {
                        col.Item().Text($"Date: {comparison.BaselineImage.CreatedAt:yyyy-MM-dd}").FontSize(9);
                        if (options.IncludeAnnotations && comparison.BaselineImage.Annotations != null)
                        {
                            col.Item().Text($"Annotations: {comparison.BaselineImage.Annotations.Count}").FontSize(9);
                        }
                    }
                });

                row.ConstantItem(50); // Spacer

                row.RelativeItem().Column(col =>
                {
                    col.Item().Text("FOLLOW-UP IMAGE").FontSize(12).Bold().FontColor(Colors.Green.Darken1);
                    col.Item().PaddingTop(5).Text($"Image ID: {comparison.FollowupImageId}").FontSize(9);
                    if (comparison.FollowupImage != null)
                    {
                        col.Item().Text($"Date: {comparison.FollowupImage.CreatedAt:yyyy-MM-dd}").FontSize(9);
                        if (options.IncludeAnnotations && comparison.FollowupImage.Annotations != null)
                        {
                            col.Item().Text($"Annotations: {comparison.FollowupImage.Annotations.Count}").FontSize(9);
                        }
                    }
                });
            });

            // Findings
            if (!string.IsNullOrWhiteSpace(comparison.Findings))
            {
                column.Item().PaddingTop(20).Column(col =>
                {
                    col.Item().Text("COMPARISON FINDINGS").FontSize(14).Bold().FontColor(Colors.Blue.Darken1);
                    col.Item().PaddingBottom(5).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                    col.Item().PaddingTop(10).Text(comparison.Findings).FontSize(10).LineHeight(1.4f);
                });
            }
        });
    }

    private string GetSignificanceColor(string? significance)
    {
        return significance?.ToLower() switch
        {
            "critical" => Colors.Red.Darken2,
            "significant" => Colors.Orange.Darken1,
            "moderate" => Colors.Yellow.Darken2,
            "mild" => Colors.Blue.Medium,
            "none" => Colors.Grey.Medium,
            _ => Colors.Grey.Medium
        };
    }
}
