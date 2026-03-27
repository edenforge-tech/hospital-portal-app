using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain;

[Table("patient_vital_signs")]
public class PatientVitalSigns
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("tenant_id")]
    public Guid TenantId { get; set; }

    [Column("patient_id")]
    public Guid PatientId { get; set; }

    [Column("encounter_id")]
    public Guid? EncounterId { get; set; }

    [Column("measurement_date")]
    public DateTime MeasurementDate { get; set; }

    [Column("blood_pressure_systolic")]
    public int? BloodPressureSystolic { get; set; }

    [Column("blood_pressure_diastolic")]
    public int? BloodPressureDiastolic { get; set; }

    [Column("heart_rate")]
    public int? HeartRate { get; set; }

    [Column("temperature")]
    public decimal? Temperature { get; set; }

    [Column("temperature_unit")]
    [StringLength(1)]
    public string? TemperatureUnit { get; set; }

    [Column("respiratory_rate")]
    public int? RespiratoryRate { get; set; }

    [Column("oxygen_saturation")]
    public int? OxygenSaturation { get; set; }

    [Column("weight_kg")]
    public decimal? WeightKg { get; set; }

    [Column("height_cm")]
    public decimal? HeightCm { get; set; }

    [Column("bmi")]
    public decimal? Bmi { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }
}
