using System;

namespace AuthService.Models.Domain
{
    public class AIProgressionAnalysis
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid PatientId { get; set; }
        public Guid BaselineImageId { get; set; }
        public Guid FollowupImageId { get; set; }
        public DateTime AnalyzedAt { get; set; }
        public bool ProgressionDetected { get; set; }
        public double ConfidenceScore { get; set; }
        public string ClinicalSignificance { get; set; } = string.Empty;
        public string? DetectedRegions { get; set; }
        public string? ProgressionMetrics { get; set; }
        public string ModelVersion { get; set; } = string.Empty;
        public int ProcessingTimeMs { get; set; }
        public string Status { get; set; } = "active";
        public DateTime CreatedAt { get; set; }
    }
}
