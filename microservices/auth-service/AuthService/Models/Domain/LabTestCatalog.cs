using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Models.Domain;

[Table("lab_test_catalog")]
public class LabTestCatalog
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("tenant_id")]
    public Guid? TenantId { get; set; }

    [Column("test_name")]
    [StringLength(200)]
    public required string TestName { get; set; }

    [Column("test_code")]
    [StringLength(50)]
    public string? TestCode { get; set; }

    [Column("category")]
    [StringLength(100)]
    public string? Category { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    [Column("price")]
    [Precision(10, 2)]
    public decimal? Price { get; set; }

    [Column("turnaround_hours")]
    public int? TurnaroundHours { get; set; }

    [Column("specimen_type")]
    [StringLength(100)]
    public string? SampleType { get; set; }

    [Column("is_pre_operative")]
    public bool IsPreOperative { get; set; } = false;

    [Column("test_type")]
    [StringLength(20)]
    public string TestType { get; set; } = "Lab"; // Lab | Imaging | Scan

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }
}
