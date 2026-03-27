using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Models.Training
{
    public enum TrainingStatus
    {
        NotStarted,
        InProgress,
        Completed,
        Expired,
        Overdue
    }

    public enum CredentialStatus
    {
        Valid,
        Expiring,
        Expired,
        Suspended,
        Revoked
    }

    public class TrainingCourse
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid TenantId { get; set; }

        [Required]
        [StringLength(200)]
        public string CourseName { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public bool IsMandatory { get; set; }

        public int ValidityPeriodDays { get; set; } // 0 = one-time, >0 = requires renewal

        public string? CourseProvider { get; set; }

        public int? DurationHours { get; set; }

        public string? CourseUrl { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public Guid CreatedByUserId { get; set; }

        public Guid UpdatedByUserId { get; set; }

        public DateTime? DeletedAt { get; set; }

        public string Status { get; set; } = "active";
    }

    public class TrainingAssignment
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid TenantId { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid CourseId { get; set; }

        [Required]
        public DateTime AssignedDate { get; set; }

        public DateTime? DueDate { get; set; }

        public TrainingStatus TrainingStatus { get; set; }

        public DateTime? CompletionDate { get; set; }

        public DateTime? ExpiryDate { get; set; }

        public string? CompletionCertificateUrl { get; set; }

        public string? Notes { get; set; }

        public Guid? AssignedByUserId { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public Guid CreatedByUserId { get; set; }

        public Guid UpdatedByUserId { get; set; }

        public DateTime? DeletedAt { get; set; }

        public string Status { get; set; } = "active";
    }

    public class UserCredential
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid TenantId { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        [StringLength(200)]
        public string CredentialName { get; set; } = string.Empty;

        public string? CredentialType { get; set; } // License, Certificate, Accreditation

        public string? IssuingAuthority { get; set; }

        public string? CredentialNumber { get; set; }

        public DateTime IssuedDate { get; set; }

        public DateTime? ExpiryDate { get; set; }

        public CredentialStatus CredentialStatus { get; set; }

        public bool IsRequired { get; set; }

        public string? DocumentUrl { get; set; }

        public DateTime? SuspendedAt { get; set; }

        public Guid? SuspendedByUserId { get; set; }

        public string? SuspensionReason { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public Guid CreatedByUserId { get; set; }

        public Guid UpdatedByUserId { get; set; }

        public DateTime? DeletedAt { get; set; }

        public string Status { get; set; } = "active";
    }

    // DTOs
    public class AssignTrainingRequest
    {
        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid CourseId { get; set; }

        public DateTime? DueDate { get; set; }

        public string? Notes { get; set; }
    }

    public class RecordCompletionRequest
    {
        [Required]
        public DateTime CompletionDate { get; set; }

        public string? CertificateUrl { get; set; }
    }

    public class TrainingAssignmentDto
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }

        public string UserName { get; set; } = string.Empty;

        public Guid CourseId { get; set; }

        public string CourseName { get; set; } = string.Empty;

        public bool IsMandatory { get; set; }

        public DateTime AssignedDate { get; set; }

        public DateTime? DueDate { get; set; }

        public TrainingStatus TrainingStatus { get; set; }

        public DateTime? CompletionDate { get; set; }

        public DateTime? ExpiryDate { get; set; }

        public bool IsOverdue { get; set; }

        public int? DaysUntilDue { get; set; }

        public int? DaysUntilExpiry { get; set; }
    }

    public class ComplianceReportDto
    {
        public Guid UserId { get; set; }

        public string UserName { get; set; } = string.Empty;

        public int TotalAssignments { get; set; }

        public int CompletedTrainings { get; set; }

        public int OverdueTrainings { get; set; }

        public int ExpiringCredentialsCount { get; set; }

        public int ExpiredCredentials { get; set; }

        public double CompliancePercentage { get; set; }

        public bool IsCompliant { get; set; }

        public List<TrainingAssignmentDto> OverdueAssignments { get; set; } = new();

        public List<UserCredentialDto> ExpiringCredentials { get; set; } = new();
    }

    public class UserCredentialDto
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }

        public string CredentialName { get; set; } = string.Empty;

        public string? CredentialType { get; set; }

        public string? IssuingAuthority { get; set; }

        public DateTime IssuedDate { get; set; }

        public DateTime? ExpiryDate { get; set; }

        public CredentialStatus CredentialStatus { get; set; }

        public bool IsRequired { get; set; }

        public int? DaysUntilExpiry { get; set; }
    }

    public class TrainingStatisticsDto
    {
        public int TotalUsers { get; set; }

        public int CompliantUsers { get; set; }

        public int NonCompliantUsers { get; set; }

        public int TotalAssignments { get; set; }

        public int CompletedAssignments { get; set; }

        public int OverdueAssignments { get; set; }

        public int ExpiringCredentials { get; set; }

        public double OverallComplianceRate { get; set; }

        public Dictionary<TrainingStatus, int> AssignmentsByStatus { get; set; } = new();
    }
}
