using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AuthService.Services;
using AuthService.Models.Domain;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AuthService.Controllers
{
    /// <summary>
    /// Phase 8: AI-Powered Progression Detection Controller
    /// Provides endpoints for AI analysis of retinal disease progression
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ImagingAIController : ControllerBase
    {
        private readonly IImagingAIAnalysisService _aiService;
        private readonly ILogger<ImagingAIController> _logger;

        public ImagingAIController(
            IImagingAIAnalysisService aiService,
            ILogger<ImagingAIController> logger)
        {
            _aiService = aiService;
            _logger = logger;
        }

        /// <summary>
        /// Analyze progression between baseline and follow-up images using AI
        /// </summary>
        /// <param name="request">Analysis request with baseline and follow-up image IDs</param>
        /// <returns>AI analysis results with progression detection and confidence scores</returns>
        [HttpPost("analyze-progression")]
        [Authorize(Roles = "Admin,Doctor,Ophthalmologist,Optometrist")]
        [ProducesResponseType(typeof(AIProgressionAnalysis), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> AnalyzeProgression([FromBody] AnalyzeProgressionRequest request)
        {
            try
            {
                // Get tenant from authenticated user claims
                var tenantIdClaim = User.Claims.FirstOrDefault(c => c.Type == "TenantId");
                if (tenantIdClaim == null || !Guid.TryParse(tenantIdClaim.Value, out var tenantId))
                {
                    return BadRequest(new { error = "Tenant ID not found in user claims" });
                }

                request.TenantId = tenantId;

                // Validate input
                if (request.BaselineImageId == Guid.Empty || request.FollowupImageId == Guid.Empty)
                {
                    return BadRequest(new { error = "Both baseline and follow-up image IDs are required" });
                }

                if (request.BaselineImageId == request.FollowupImageId)
                {
                    return BadRequest(new { error = "Baseline and follow-up images must be different" });
                }

                _logger.LogInformation(
                    "AI progression analysis requested by {UserId} for patient {PatientId}",
                    User.Identity?.Name, request.PatientId);

                var analysis = await _aiService.AnalyzeProgressionAsync(request);

                return Ok(new
                {
                    success = true,
                    message = "AI analysis completed successfully",
                    analysis = new
                    {
                        analysis.Id,
                        analysis.ProgressionDetected,
                        analysis.ConfidenceScore,
                        analysis.ClinicalSignificance,
                        analysis.DetectedRegions,
                        analysis.ProgressionMetrics,
                        analysis.ModelVersion,
                        analysis.ProcessingTimeMs,
                        analysis.AnalyzedAt
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to analyze progression");
                return BadRequest(new { error = "Failed to analyze progression", details = ex.Message });
            }
        }

        /// <summary>
        /// Get AI analysis history for a specific patient
        /// </summary>
        /// <param name="patientId">Patient UUID</param>
        /// <returns>List of AI analyses for the patient</returns>
        [HttpGet("patient/{patientId}/history")]
        [Authorize(Roles = "Admin,Doctor,Ophthalmologist,Optometrist,Nurse")]
        [ProducesResponseType(typeof(List<AIProgressionAnalysis>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetPatientAnalysisHistory(Guid patientId)
        {
            try
            {
                // Get tenant from authenticated user claims
                var tenantIdClaim = User.Claims.FirstOrDefault(c => c.Type == "TenantId");
                if (tenantIdClaim == null || !Guid.TryParse(tenantIdClaim.Value, out var tenantId))
                {
                    return BadRequest(new { error = "Tenant ID not found in user claims" });
                }

                var analyses = await _aiService.GetPatientAnalysisHistoryAsync(patientId, tenantId);

                return Ok(new
                {
                    success = true,
                    count = analyses.Count,
                    analyses = analyses.Select(a => new
                    {
                        a.Id,
                        a.BaselineImageId,
                        a.FollowupImageId,
                        a.AnalyzedAt,
                        a.ProgressionDetected,
                        a.ConfidenceScore,
                        a.ClinicalSignificance,
                        a.ModelVersion,
                        a.ProcessingTimeMs
                    })
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve patient AI analysis history");
                return BadRequest(new { error = "Failed to retrieve analysis history", details = ex.Message });
            }
        }

        /// <summary>
        /// Get detailed confidence metrics for a specific analysis
        /// </summary>
        /// <param name="analysisId">Analysis UUID</param>
        /// <returns>Confidence metrics including per-region breakdowns</returns>
        [HttpGet("analysis/{analysisId}/confidence")]
        [Authorize(Roles = "Admin,Doctor,Ophthalmologist,Optometrist")]
        [ProducesResponseType(typeof(AIConfidenceMetrics), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetConfidenceMetrics(Guid analysisId)
        {
            try
            {
                var metrics = await _aiService.GetConfidenceMetricsAsync(analysisId);

                return Ok(new
                {
                    success = true,
                    metrics
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve confidence metrics for analysis {AnalysisId}", analysisId);
                return BadRequest(new { error = "Failed to retrieve confidence metrics", details = ex.Message });
            }
        }

        /// <summary>
        /// Get AI model information and supported analysis types
        /// </summary>
        /// <returns>Model metadata and capabilities</returns>
        [HttpGet("model-info")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(AIModelInfo), StatusCodes.Status200OK)]
        public IActionResult GetModelInfo()
        {
            var modelInfo = new AIModelInfo
            {
                ModelVersion = "retinal-progression-v2.3",
                LastUpdated = new DateTime(2026, 2, 15),
                SupportedAnalysisTypes = new List<string>
                {
                    "progression",
                    "RNFL_thickness",
                    "glaucoma_risk"
                },
                SupportedImagingModalities = new List<string>
                {
                    "Fundus Photography",
                    "OCT (Optical Coherence Tomography)",
                    "Visual Field"
                },
                DetectableConditions = new List<string>
                {
                    "Glaucoma progression",
                    "Diabetic retinopathy",
                    "Macular degeneration",
                    "RNFL thinning",
                    "Optic disc cupping"
                },
                AverageProcessingTimeMs = 1200,
                MinimumConfidenceThreshold = 0.6
            };

            return Ok(modelInfo);
        }

        /// <summary>
        /// Batch analyze multiple image pairs (for retrospective studies)
        /// </summary>
        /// <param name="batchRequest">Batch analysis request with multiple image pairs</param>
        /// <returns>List of AI analyses</returns>
        [HttpPost("analyze-batch")]
        [Authorize(Roles = "Admin,Doctor,Ophthalmologist,ResearchScientist")]
        [ProducesResponseType(typeof(List<AIProgressionAnalysis>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> AnalyzeBatchProgression([FromBody] BatchAnalysisRequest batchRequest)
        {
            try
            {
                // Get tenant from authenticated user claims
                var tenantIdClaim = User.Claims.FirstOrDefault(c => c.Type == "TenantId");
                if (tenantIdClaim == null || !Guid.TryParse(tenantIdClaim.Value, out var tenantId))
                {
                    return BadRequest(new { error = "Tenant ID not found in user claims" });
                }

                if (batchRequest.ImagePairs == null || !batchRequest.ImagePairs.Any())
                {
                    return BadRequest(new { error = "At least one image pair is required" });
                }

                if (batchRequest.ImagePairs.Count > 50)
                {
                    return BadRequest(new { error = "Maximum 50 image pairs per batch" });
                }

                _logger.LogInformation(
                    "Batch AI analysis requested for {Count} image pairs",
                    batchRequest.ImagePairs.Count);

                var analyses = new List<AIProgressionAnalysis>();

                foreach (var pair in batchRequest.ImagePairs)
                {
                    var request = new AnalyzeProgressionRequest
                    {
                        TenantId = tenantId,
                        PatientId = pair.PatientId,
                        BaselineImageId = pair.BaselineImageId,
                        FollowupImageId = pair.FollowupImageId,
                        AnalysisType = batchRequest.AnalysisType
                    };

                    try
                    {
                        var analysis = await _aiService.AnalyzeProgressionAsync(request);
                        analyses.Add(analysis);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to analyze pair: baseline {BaselineId}, followup {FollowupId}",
                            pair.BaselineImageId, pair.FollowupImageId);
                        // Continue with next pair
                    }
                }

                return Ok(new
                {
                    success = true,
                    totalRequested = batchRequest.ImagePairs.Count,
                    successfulAnalyses = analyses.Count,
                    failedAnalyses = batchRequest.ImagePairs.Count - analyses.Count,
                    analyses = analyses.Select(a => new
                    {
                        a.Id,
                        a.PatientId,
                        a.ProgressionDetected,
                        a.ConfidenceScore,
                        a.ClinicalSignificance
                    })
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process batch AI analysis");
                return BadRequest(new { error = "Failed to process batch analysis", details = ex.Message });
            }
        }
    }

    #region DTOs

    public class AIModelInfo
    {
        public string ModelVersion { get; set; } = string.Empty;
        public DateTime LastUpdated { get; set; }
        public List<string> SupportedAnalysisTypes { get; set; } = new();
        public List<string> SupportedImagingModalities { get; set; } = new();
        public List<string> DetectableConditions { get; set; } = new();
        public int AverageProcessingTimeMs { get; set; }
        public double MinimumConfidenceThreshold { get; set; }
    }

    public class BatchAnalysisRequest
    {
        public List<ImagePair> ImagePairs { get; set; } = new();
        public string AnalysisType { get; set; } = "progression";
    }

    public class ImagePair
    {
        public Guid PatientId { get; set; }
        public Guid BaselineImageId { get; set; }
        public Guid FollowupImageId { get; set; }
    }

    #endregion
}
