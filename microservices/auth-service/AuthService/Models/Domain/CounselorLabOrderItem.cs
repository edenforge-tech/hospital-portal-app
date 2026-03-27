using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Models.Domain;

/// <summary>
/// Individual test orders placed by a counselor from the lab catalog.
/// Separate from protocol-based PreOpTestOrder to support free test selection.
/// </summary>
[Table("counselor_lab_order_items")]
public class CounselorLabOrderItem
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("tenant_id")]
    public Guid TenantId { get; set; }

    [Column("session_id")]
    public Guid SessionId { get; set; }

    [Column("patient_id")]
    public Guid PatientId { get; set; }

    [Column("ordered_by_user_id")]
    public Guid OrderedByUserId { get; set; }

    [Column("lab_test_catalog_id")]
    public Guid? LabTestCatalogId { get; set; }

    [Column("test_name")]
    [StringLength(200)]
    public required string TestName { get; set; }

    [Column("test_code")]
    [StringLength(50)]
    public string? TestCode { get; set; }

    [Column("price")]
    [Precision(10, 2)]
    public decimal? Price { get; set; }

    [Column("urgency")]
    [StringLength(20)]
    public string Urgency { get; set; } = "Routine";

    [Column("status")]
    [StringLength(30)]
    public string Status { get; set; } = "Pending"; // Pending, InProgress, Completed, Cancelled

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("test_type")]
    [StringLength(20)]
    public string TestType { get; set; } = "Lab"; // Lab | Imaging | Scan

    [Column("eye")]
    [StringLength(10)]
    public string? Eye { get; set; }

    [Column("ordered_at")]
    public DateTime OrderedAt { get; set; } = DateTime.UtcNow;

    [Column("completed_at")]
    public DateTime? CompletedAt { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }
}
