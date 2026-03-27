using System;
using System.Collections.Generic;

namespace AuthService.DTOs
{
    public class RetinopathyScreeningDto
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public string? PatientName { get; set; }
        public string? PatientCode { get; set; }
        public Guid? BranchId { get; set; }
        public string Eye { get; set; } = "OD";
        public DateTime ScreeningDate { get; set; }
        public Guid? ScreenerId { get; set; }
        public string? ScreenerName { get; set; }
        public string? Device { get; set; }
        public string? DeviceModel { get; set; }
        public string DrGrade { get; set; } = "None";
        public string? MacularEdema { get; set; }
        public int? HemorrhagesCount { get; set; }
        public int? MicroaneurysmsCount { get; set; }
        public bool HardExudates { get; set; }
        public bool SoftExudates { get; set; }
        public bool Neovascularization { get; set; }
        public bool VenousBeading { get; set; }
        public bool Irma { get; set; }
        public List<string>? ImagePaths { get; set; }
        public string? ThumbnailPath { get; set; }
        public bool ReferralRequired { get; set; }
        public int? FollowUpMonths { get; set; }
        public string? TreatmentRecommended { get; set; }
        public string? Notes { get; set; }
        public string? AiGrade { get; set; }
        public decimal? AiConfidence { get; set; }
        public bool? GraderAgreement { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string Status { get; set; } = "active";
    }

    public class RetinopathyStatisticsDto
    {
        public int TotalScreenings { get; set; }
        public int ThisWeek { get; set; }
        public int NoneCount { get; set; }
        public int MildNpdrCount { get; set; }
        public int ModerateNpdrCount { get; set; }
        public int SevereNpdrCount { get; set; }
        public int PdrCount { get; set; }
        public int ReferralRequiredCount { get; set; }
        public decimal ReferralRate { get; set; }
        public decimal AiAccuracy { get; set; }
    }
}
