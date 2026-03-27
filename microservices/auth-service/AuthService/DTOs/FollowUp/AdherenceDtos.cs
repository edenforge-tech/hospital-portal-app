using System;
using System.Collections.Generic;

namespace AuthService.DTOs.FollowUp
{
    public class TreatmentAdherenceDto
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = null!;
        public string Condition { get; set; } = null!;
        public string TreatmentPlan { get; set; } = null!;
        public DateTime StartDate { get; set; }
        public List<MedicationAdherenceDto> Medications { get; set; } = new();
        public AppointmentAdherenceDto Appointments { get; set; } = new();
        public List<string> Recommendations { get; set; } = new();
        public string RiskLevel { get; set; } = null!;
    }

    public class MedicationAdherenceDto
    {
        public Guid Id { get; set; }
        public string MedicationName { get; set; } = null!;
        public string PrescribedDosage { get; set; } = null!;
        public decimal AdherencePercentage { get; set; }
        public int MissedDoses { get; set; }
        public DateTime? LastTakenDate { get; set; }
    }

    public class AppointmentAdherenceDto
    {
        public int Scheduled { get; set; }
        public int Completed { get; set; }
        public int Missed { get; set; }
        public decimal AdherenceRate { get; set; }
    }

    public class HighRiskAdherenceDto
    {
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = null!;
        public string Condition { get; set; } = null!;
        public decimal AdherenceRate { get; set; }
        public string RiskLevel { get; set; } = null!;
        public List<string> Recommendations { get; set; } = new();
    }
}
