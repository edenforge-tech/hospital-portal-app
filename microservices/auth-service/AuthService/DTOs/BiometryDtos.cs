using System;

namespace AuthService.DTOs
{
    public class BiometryRecordDto
    {
        public Guid? Id { get; set; }
        public Guid PatientId { get; set; }
        public string? PatientName { get; set; }
        public string? PatientCode { get; set; }
        public string Eye { get; set; } = null!;
        
        // Primary Measurements
        public decimal AxialLength { get; set; }
        public decimal K1 { get; set; }
        public decimal K2 { get; set; }
        public int K1Axis { get; set; }
        public decimal Acd { get; set; }
        
        // Optional Measurements
        public decimal? LensThickness { get; set; }
        public decimal? WhiteToWhite { get; set; }
        public decimal? Snr { get; set; }
        
        // Device
        public string Device { get; set; } = null!;
        public string? DeviceModel { get; set; }
        
        // Target & Results
        public decimal TargetRefraction { get; set; }
        public decimal? CalculatedIol { get; set; }
        public string? SelectedFormula { get; set; }
        public List<BiometryIOLCalculationResultDto>? IolCalculations { get; set; }
        
        // Exam Info
        public DateTime ExaminationDate { get; set; }
        public Guid ExaminerId { get; set; }
        public string? ExaminerName { get; set; }
        public Guid? BranchId { get; set; }
        
        public string? Notes { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string Status { get; set; } = "active";
    }

    public class IOLCalculationRequestDto
    {
        public decimal AxialLength { get; set; }
        public decimal K1 { get; set; }
        public decimal K2 { get; set; }
        public decimal Acd { get; set; }
        public decimal? LensThickness { get; set; }
        public decimal TargetRefraction { get; set; }
        public decimal? AConstant { get; set; }
    }

    public class BiometryIOLCalculationResultDto
    {
        public string Formula { get; set; } = null!;
        public decimal IolPower { get; set; }
        public decimal PredictedRefraction { get; set; }
        public decimal? AConstant { get; set; }
        public decimal? SurgeonFactor { get; set; }
    }

    public class BiometryStatisticsDto
    {
        public int TotalRecords { get; set; }
        public int ThisWeek { get; set; }
        public int OdCount { get; set; }
        public int OsCount { get; set; }
        public decimal AverageAxialLength { get; set; }
        public decimal AverageIolPower { get; set; }
    }
}
