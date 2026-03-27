using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Search
{
    public enum SearchScope
    {
        User,
        Role,
        Permission,
        Department,
        Organization,
        Branch,
        Patient,
        Appointment,
        License,
        Contract,
        Leave,
        Shift,
        Attendance,
        Payroll,
        All
    }

    public enum SearchOperator
    {
        Equals,
        Contains,
        StartsWith,
        EndsWith,
        GreaterThan,
        LessThan,
        GreaterThanOrEqual,
        LessThanOrEqual,
        In,
        NotIn,
        IsNull,
        IsNotNull,
        Between
    }

    public class SavedSearch
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid TenantId { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        [StringLength(200)]
        public string SearchName { get; set; } = string.Empty;

        [Required]
        public string Criteria { get; set; } = "{}"; // JSONB stored as string

        [Required]
        public SearchScope Scope { get; set; }

        public bool IsGlobal { get; set; } // Accessible by all users in tenant

        public bool IsFavorite { get; set; }

        public int ExecutionCount { get; set; }

        public DateTime? LastExecutedAt { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public Guid CreatedByUserId { get; set; }

        public Guid UpdatedByUserId { get; set; }

        public DateTime? DeletedAt { get; set; }
    }

    // DTOs
    public class ExecuteSearchRequest
    {
        [Required]
        public SearchScope Scope { get; set; }

        [Required]
        public List<SearchCriterion> Criteria { get; set; } = new();

        public int PageNumber { get; set; } = 1;

        public int PageSize { get; set; } = 20;

        public string? SortBy { get; set; }

        public bool SortDescending { get; set; }
    }

    public class SearchCriterion
    {
        [Required]
        public string Field { get; set; } = string.Empty;

        [Required]
        public SearchOperator Operator { get; set; }

        public object? Value { get; set; }

        public object? ValueSecondary { get; set; } // For Between operator
    }

    public class SearchResultDto
    {
        public List<object> Results { get; set; } = new();

        public int TotalCount { get; set; }

        public int PageNumber { get; set; }

        public int PageSize { get; set; }

        public int TotalPages { get; set; }

        public SearchScope Scope { get; set; }

        public double ExecutionTimeMs { get; set; }
    }

    public class SavedSearchDto
    {
        public Guid Id { get; set; }

        public string SearchName { get; set; } = string.Empty;

        public SearchScope Scope { get; set; }

        public List<SearchCriterion> Criteria { get; set; } = new();

        public bool IsGlobal { get; set; }

        public bool IsFavorite { get; set; }

        public int ExecutionCount { get; set; }

        public DateTime? LastExecutedAt { get; set; }

        public DateTime CreatedAt { get; set; }

        public string CreatedByUserName { get; set; } = string.Empty;
    }

    public class CreateSavedSearchRequest
    {
        [Required]
        [StringLength(200)]
        public string SearchName { get; set; } = string.Empty;

        [Required]
        public SearchScope Scope { get; set; }

        [Required]
        public List<SearchCriterion> Criteria { get; set; } = new();

        public bool IsGlobal { get; set; }

        public bool IsFavorite { get; set; }
    }

    public class SearchPresetDto
    {
        public string PresetId { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public SearchScope Scope { get; set; }

        public List<SearchCriterion> Criteria { get; set; } = new();

        public string Category { get; set; } = string.Empty;
    }

    public class UpdateFavoriteRequest
    {
        [Required]
        public bool IsFavorite { get; set; }
    }
}
