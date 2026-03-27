using System;
using System.Collections.Generic;

namespace AuthService.DTOs
{
    // OCT Imaging DTOs
    public class OctImagingScanDto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid PatientId { get; set; }
        public string? PatientName { get; set; }
        public string? PatientCode { get; set; }
        public string PatientMRN { get; set; } = string.Empty;
        public Guid? BranchId { get; set; }
        public string Eye { get; set; } = "OD";
        public DateTime ScanDate { get; set; }
        public Guid? TechnicianId { get; set; }
        public string? TechnicianName { get; set; }
        public string? Device { get; set; }
        public string? DeviceModel { get; set; }
        public string ScanType { get; set; } = "Macula";
        public string? ScanPattern { get; set; }
        public string? ScanSize { get; set; }
        public decimal? CentralThickness { get; set; }
        public decimal? AverageThickness { get; set; }
        public decimal? Volume { get; set; }
        public decimal? RnflAverage { get; set; }
        public decimal? GclThickness { get; set; }
        public bool PathologyDetected { get; set; }
        public string? PathologyType { get; set; }
        public bool FluidDetected { get; set; }
        public string? FluidType { get; set; }
        public List<string>? ImagePaths { get; set; }
        public string? DataFilePath { get; set; }
        public string? ThumbnailPath { get; set; }
        public int? SignalStrength { get; set; }
        public int? QualityScore { get; set; }
        public string? Diagnosis { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string Status { get; set; } = "active";
    }

    public class OctStatisticsDto
    {
        public int TotalScans { get; set; }
        public int ThisWeek { get; set; }
        public int MaculaScans { get; set; }
        public int OpticDiscScans { get; set; }
        public int AnteriorSegmentScans { get; set; }
        public int WidefieldScans { get; set; }
        public int PathologyDetectedCount { get; set; }
        public decimal PathologyRate { get; set; }
        public decimal AverageSignalStrength { get; set; }
    }

    // Electrophysiology DTOs
    public class ElectrophysiologyTestDto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid PatientId { get; set; }
        public string? PatientName { get; set; }
        public string? PatientCode { get; set; }
        public string PatientMRN { get; set; } = string.Empty;
        public Guid? BranchId { get; set; }
        public DateTime TestDate { get; set; }
        public Guid? TechnicianId { get; set; }
        public string? TechnicianName { get; set; }
        public string? Device { get; set; }
        public string TestType { get; set; } = "ERG";
        public string? TestProtocol { get; set; }
        public string EyeTested { get; set; } = "OU";
        public string? Eye { get; set; }
        public decimal? ScotopicAWave { get; set; }
        public decimal? ScotopicBWave { get; set; }
        public decimal? PhotopicAWave { get; set; }
        public decimal? PhotopicBWave { get; set; }
        public decimal? FlickerResponse { get; set; }
        public decimal? P100Latency { get; set; }
        public decimal? P100Amplitude { get; set; }
        public decimal? ArdenRatio { get; set; }
        public decimal? LightPeak { get; set; }
        public decimal? DarkTrough { get; set; }
        public string? Interpretation { get; set; }
        public string? AbnormalityType { get; set; }
        public string? WaveformData { get; set; }
        public List<string>? ImagePaths { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string Status { get; set; } = "active";
    }

    public class ElectrophysiologyStatisticsDto
    {
        public int TotalTests { get; set; }
        public int ThisWeek { get; set; }
        public int ErgTests { get; set; }
        public int VepTests { get; set; }
        public int EogTests { get; set; }
        public int NormalCount { get; set; }
        public int AbnormalCount { get; set; }
        public decimal AbnormalRate { get; set; }
    }
}
