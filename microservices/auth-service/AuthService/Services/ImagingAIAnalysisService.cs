// ImagingAIAnalysisService - AI-powered progression detection for medical imaging
// Integrates with Azure Cognitive Services / Custom Vision for retinal disease progression

using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace AuthService.Services;

public interface IImagingAIAnalysisService
{
    Task<AIProgressionAnalysis> AnalyzeProgressionAsync(AnalyzeProgressionRequest request);
    Task<List<AIProgressionAnalysis>> GetPatientAnalysisHistoryAsync(Guid patientId, Guid tenantId);
    Task<AIConfidenceMetrics> GetConfidenceMetricsAsync(Guid analysisId);
}

public class ImagingAIAnalysisService : IImagingAIAnalysisService
{
    private readonly AppDbContext _context;
    private readonly ILogger<ImagingAIAnalysisService> _logger;
    private readonly IConfiguration _configuration;

    public ImagingAIAnalysisService(
        AppDbContext context,
        ILogger<ImagingAIAnalysisService> logger,
        IConfiguration configuration)
    {
        _context = context;
        _logger = logger;
        _configuration = configuration;
    }

    public async Task<AIProgressionAnalysis> AnalyzeProgressionAsync(AnalyzeProgressionRequest request)
    {
        try
        {
            _logger.LogInformation(
                "Starting AI progression analysis for patient {PatientId}, baseline: {BaselineId}, followup: {FollowupId}",
                request.PatientId, request.BaselineImageId, request.FollowupImageId);

            // Retrieve images from database
            var baselineImage = await _context.ImagingImages
                .FirstOrDefaultAsync(i => i.Id == request.BaselineImageId && i.TenantId == request.TenantId)
                ?? throw new Exception($"Baseline image {request.BaselineImageId} not found");

            var followupImage = await _context.ImagingImages
                .FirstOrDefaultAsync(i => i.Id == request.FollowupImageId && i.TenantId == request.TenantId)
                ?? throw new Exception($"Follow-up image {request.FollowupImageId} not found");

            // Call AI analysis service (Azure Cognitive Services or custom ML model)
            var aiResult = await InvokeAIModelAsync(baselineImage, followupImage, request);

            // Calculate progression metrics
            var progressionMetrics = CalculateProgressionMetrics(aiResult);

            // Determine clinical significance based on AI confidence and change magnitude
            var clinicalSignificance = DetermineClinicalSignificance(
                aiResult.ProgressionDetected,
                aiResult.ConfidenceScore,
                progressionMetrics);

            // Create analysis record
            var analysis = new AIProgressionAnalysis
            {
                Id = Guid.NewGuid(),
                TenantId = request.TenantId,
                PatientId = request.PatientId,
                BaselineImageId = request.BaselineImageId,
                FollowupImageId = request.FollowupImageId,
                AnalyzedAt = DateTime.UtcNow,
                ProgressionDetected = aiResult.ProgressionDetected,
                ConfidenceScore = aiResult.ConfidenceScore,
                ClinicalSignificance = clinicalSignificance,
                DetectedRegions = JsonSerializer.Serialize(aiResult.DetectedRegions),
                ProgressionMetrics = JsonSerializer.Serialize(progressionMetrics),
                ModelVersion = aiResult.ModelVersion,
                ProcessingTimeMs = aiResult.ProcessingTimeMs,
                Status = "active",
                CreatedAt = DateTime.UtcNow
            };

            await _context.AIProgressionAnalyses.AddAsync(analysis);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "AI analysis completed. Progression detected: {ProgressionDetected}, Confidence: {ConfidenceScore:F2}, Significance: {Significance}",
                analysis.ProgressionDetected, analysis.ConfidenceScore, analysis.ClinicalSignificance);

            return analysis;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to analyze progression for patient {PatientId}", request.PatientId);
            throw;
        }
    }

    public async Task<List<AIProgressionAnalysis>> GetPatientAnalysisHistoryAsync(Guid patientId, Guid tenantId)
    {
        return await _context.AIProgressionAnalyses
            .Where(a => a.PatientId == patientId && a.TenantId == tenantId)
            .OrderByDescending(a => a.AnalyzedAt)
            .Take(50) // Limit to most recent 50 analyses
            .ToListAsync();
    }

    public async Task<AIConfidenceMetrics> GetConfidenceMetricsAsync(Guid analysisId)
    {
        var analysis = await _context.AIProgressionAnalyses.FindAsync(analysisId)
            ?? throw new Exception($"Analysis {analysisId} not found");

        var metrics = new AIConfidenceMetrics
        {
            AnalysisId = analysis.Id,
            OverallConfidence = analysis.ConfidenceScore,
            ModelVersion = analysis.ModelVersion,
            ProcessingTimeMs = analysis.ProcessingTimeMs
        };

        // Deserialize detected regions to calculate per-region confidence
        if (!string.IsNullOrEmpty(analysis.DetectedRegions))
        {
            var regions = JsonSerializer.Deserialize<List<DetectedRegion>>(analysis.DetectedRegions);
            if (regions != null && regions.Any())
            {
                metrics.RegionConfidences = regions
                    .Select(r => new RegionConfidence
                    {
                        RegionName = r.RegionName,
                        Confidence = r.Confidence,
                        ChangeType = r.ChangeType
                    })
                    .ToList();

                metrics.AverageRegionConfidence = regions.Average(r => r.Confidence);
                metrics.MinRegionConfidence = regions.Min(r => r.Confidence);
                metrics.MaxRegionConfidence = regions.Max(r => r.Confidence);
            }
        }

        return metrics;
    }

    // AI Model Integration (placeholder - replace with actual Azure Cognitive Services call)
    private async Task<AIModelResult> InvokeAIModelAsync(
        dynamic baselineImage,
        dynamic followupImage,
        AnalyzeProgressionRequest request)
    {
        // TODO: Replace with actual Azure Cognitive Services / Custom Vision API call
        // Example: POST https://<endpoint>.cognitiveservices.azure.com/customvision/v3.0/Prediction/<projectId>/detect/iterations/<modelVersion>/image
        
        // Simulate AI processing delay
        await Task.Delay(1500);

        // Mock AI result (replace with actual model predictions)
        var result = new AIModelResult
        {
            ProgressionDetected = true,
            ConfidenceScore = 0.87, // 87% confidence
            ModelVersion = "retinal-progression-v2.3",
            ProcessingTimeMs = 1450,
            DetectedRegions = new List<DetectedRegion>
            {
                new DetectedRegion
                {
                    RegionName = "Optic Disc",
                    BoundingBox = new BoundingBox { X = 120, Y = 150, Width = 80, Height = 80 },
                    ChangeType = "cupping_increased",
                    Confidence = 0.92,
                    AreaChangePixels = 245
                },
                new DetectedRegion
                {
                    RegionName = "RNFL (Inferior Quadrant)",
                    BoundingBox = new BoundingBox { X = 200, Y = 180, Width = 60, Height = 40 },
                    ChangeType = "thinning",
                    Confidence = 0.85,
                    AreaChangePixels = 180
                },
                new DetectedRegion
                {
                    RegionName = "Macula",
                    BoundingBox = new BoundingBox { X = 300, Y = 200, Width = 50, Height = 50 },
                    ChangeType = "minimal_change",
                    Confidence = 0.78,
                    AreaChangePixels = 15
                }
            }
        };

        // Calculate overall confidence (weighted by region confidences)
        result.ConfidenceScore = result.DetectedRegions.Any()
            ? result.DetectedRegions.Average(r => r.Confidence)
            : 0.5;

        return result;
    }

    private Dictionary<string, object> CalculateProgressionMetrics(AIModelResult aiResult)
    {
        var metrics = new Dictionary<string, object>();

        if (aiResult.DetectedRegions.Any())
        {
            // Total area changed
            var totalAreaChanged = aiResult.DetectedRegions.Sum(r => r.AreaChangePixels);
            metrics["TotalAreaChangedPixels"] = totalAreaChanged;

            // Number of regions affected
            var affectedRegions = aiResult.DetectedRegions.Count(r => r.ChangeType != "minimal_change");
            metrics["AffectedRegionsCount"] = affectedRegions;

            // Change types distribution
            var changeTypes = aiResult.DetectedRegions
                .GroupBy(r => r.ChangeType)
                .ToDictionary(g => g.Key, g => g.Count());
            metrics["ChangeTypesDistribution"] = changeTypes;

            // Severity score (0-100)
            var severityScore = Math.Min(100, (totalAreaChanged / 10.0) + (affectedRegions * 20));
            metrics["SeverityScore"] = Math.Round(severityScore, 2);
        }

        return metrics;
    }

    private string DetermineClinicalSignificance(
        bool progressionDetected,
        double confidenceScore,
        Dictionary<string, object> metrics)
    {
        if (!progressionDetected || confidenceScore < 0.5)
            return "none";

        // Extract severity score
        var severityScore = metrics.ContainsKey("SeverityScore")
            ? Convert.ToDouble(metrics["SeverityScore"])
            : 0;

        // Determine significance based on confidence and severity
        if (confidenceScore >= 0.9 && severityScore >= 70)
            return "critical";
        if (confidenceScore >= 0.8 && severityScore >= 50)
            return "significant";
        if (confidenceScore >= 0.7 && severityScore >= 30)
            return "moderate";
        if (confidenceScore >= 0.6 && severityScore >= 15)
            return "mild";

        return "none";
    }
}

#region DTOs and Models

public class AnalyzeProgressionRequest
{
    public Guid TenantId { get; set; }
    public Guid PatientId { get; set; }
    public Guid BaselineImageId { get; set; }
    public Guid FollowupImageId { get; set; }
    public string? AnalysisType { get; set; } = "progression"; // progression, RNFL_thickness, glaucoma_risk
}

public class AIModelResult
{
    public bool ProgressionDetected { get; set; }
    public double ConfidenceScore { get; set; }
    public string ModelVersion { get; set; } = string.Empty;
    public int ProcessingTimeMs { get; set; }
    public List<DetectedRegion> DetectedRegions { get; set; } = new();
}

public class DetectedRegion
{
    public string RegionName { get; set; } = string.Empty; // Optic Disc, RNFL, Macula, etc.
    public BoundingBox BoundingBox { get; set; } = new();
    public string ChangeType { get; set; } = string.Empty; // thinning, cupping_increased, minimal_change
    public double Confidence { get; set; } // 0-1
    public int AreaChangePixels { get; set; }
}

public class BoundingBox
{
    public int X { get; set; }
    public int Y { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
}

public class AIConfidenceMetrics
{
    public Guid AnalysisId { get; set; }
    public double OverallConfidence { get; set; }
    public double AverageRegionConfidence { get; set; }
    public double MinRegionConfidence { get; set; }
    public double MaxRegionConfidence { get; set; }
    public List<RegionConfidence> RegionConfidences { get; set; } = new();
    public string ModelVersion { get; set; } = string.Empty;
    public int ProcessingTimeMs { get; set; }
}

public class RegionConfidence
{
    public string RegionName { get; set; } = string.Empty;
    public double Confidence { get; set; }
    public string ChangeType { get; set; } = string.Empty;
}

#endregion
