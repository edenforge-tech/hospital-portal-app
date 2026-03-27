using System.ComponentModel.DataAnnotations;

namespace AuthService.DTOs
{
    /// <summary>
    /// DTO for creating a surgery recommendation
    /// </summary>
    public class SurgeryRecommendationDto
    {
        [Required]
        public Guid PatientId { get; set; }

        [Required]
        [MaxLength(100)]
        public string SurgeryType { get; set; } = string.Empty; // Cataract, Glaucoma, Vitreoretinal, Corneal

        [Required]
        [MaxLength(200)]
        public string ProcedureType { get; set; } = string.Empty; // Specific procedure

        [Required]
        [MaxLength(10)]
        public string Eye { get; set; } = string.Empty; // OD, OS, OU

        [MaxLength(200)]
        public string? DiagnosisCode { get; set; } // ICD-10 code

        [MaxLength(500)]
        public string? DiagnosisDescription { get; set; }

        [MaxLength(50)]
        public string PackageType { get; set; } = "Standard"; // Standard, Premium, Custom

        public decimal? PackagePrice { get; set; }

        [MaxLength(50)]
        public string? IOLFormula { get; set; } // SRK/T, Barrett, Haigis, etc.

        public decimal? IOLPower { get; set; }

        [MaxLength(100)]
        public string? IOLType { get; set; } // Monofocal, Multifocal, Toric

        public List<string> PreOpChecklist { get; set; } = new();

        [MaxLength(50)]
        public string Urgency { get; set; } = "routine"; // routine, urgent, emergency

        [MaxLength(2000)]
        public string? Notes { get; set; }

        [MaxLength(2000)]
        public string? SpecialInstructions { get; set; }

        public DateTime? PreferredDate { get; set; }

        [MaxLength(20)]
        public string? PreferredTime { get; set; }
    }

    /// <summary>
    /// DTO for IOL power calculation request
    /// </summary>
    public class IOLCalculationDto
    {
        [Required]
        public Guid PatientId { get; set; }

        [Required]
        [MaxLength(10)]
        public string Eye { get; set; } = string.Empty; // OD, OS

        [Range(15.0, 35.0)]
        public decimal AxialLength { get; set; }

        [Range(35.0, 52.0)]
        public decimal K1 { get; set; }

        [Range(35.0, 52.0)]
        public decimal K2 { get; set; }

        [Range(1.5, 5.0)]
        public decimal AnteriorChamberDepth { get; set; }

        [Range(2.0, 7.0)]
        public decimal? LensThickness { get; set; }

        [Range(9.0, 14.0)]
        public decimal? WhiteToWhite { get; set; }

        [Range(115.0, 122.0)]
        public decimal AConstant { get; set; } = 118.4m;

        [Range(-3.0, 1.0)]
        public decimal TargetRefraction { get; set; } = 0.0m; // Plano

        public List<string> Formulas { get; set; } = new() { "SRK/T", "Barrett Universal II", "Haigis", "Holladay 1", "Hoffer Q" };
    }

    /// <summary>
    /// DTO for IOL calculation results
    /// </summary>
    public class IOLCalculationResultDto
    {
        public Dictionary<string, decimal> CalculatedPowers { get; set; } = new();
        public string RecommendedFormula { get; set; } = "Barrett Universal II";
        public List<string> Warnings { get; set; } = new();
    }

    /// <summary>
    /// DTO for pre-operative checklist generation
    /// </summary>
    public class PreOpChecklistDto
    {
        [Required]
        [MaxLength(100)]
        public string SurgeryType { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string ProcedureType { get; set; } = string.Empty;

        public int PatientAge { get; set; }

        public bool HasDiabetes { get; set; }

        public bool HasHypertension { get; set; }

        public bool OnAnticoagulants { get; set; }

        public List<string> AdditionalItems { get; set; } = new();
    }

    /// <summary>
    /// DTO for counselor referral
    /// </summary>
    public class CounselorReferralDto
    {
        [Required]
        public Guid SurgeryRequestId { get; set; }

        [MaxLength(2000)]
        public string? ReferralNotes { get; set; }

        public bool IsPriorityReferral { get; set; } = false;
    }

    /// <summary>
    /// DTO for surgery request response
    /// </summary>
    public class SurgeryRequestResponseDto
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string SurgeryType { get; set; } = string.Empty;
        public string ProcedureType { get; set; } = string.Empty;
        public string Eye { get; set; } = string.Empty;
        public string PackageType { get; set; } = string.Empty;
        public decimal? PackagePrice { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Urgency { get; set; } = string.Empty;
        public DateTime? PreferredDate { get; set; }
        public DateTime RequestDate { get; set; }
        public List<string> PreOpChecklist { get; set; } = new();
        public bool CounselorReferralSent { get; set; }
    }
}
