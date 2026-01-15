namespace AuthService.Models.Department;

/// <summary>
/// Supervised User - Junior doctors requiring supervision (NABH Compliance)
/// Used in Admin UI: /admin/supervised-access
/// </summary>
public class SupervisedUser
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid? BranchId { get; set; }
    
    // User Information
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Qualification { get; set; } // "MBBS", "BDS", "Intern"
    public int? YearsOfExperience { get; set; }
    
    // Supervision Settings
    public Guid? AssignedSupervisorId { get; set; }
    public string? SupervisorName { get; set; }
    public string OversightLevel { get; set; } = "Close"; // Close, Moderate, Light
    public bool RequiresCoSignature { get; set; }
    public DateTime? SupervisionStartDate { get; set; }
    public DateTime? SupervisionEndDate { get; set; }
    
    // Compliance Tracking
    public int ComplianceScore { get; set; } // 0-100%
    public DateTime? LastComplianceCheck { get; set; }
    public string? ComplianceNotes { get; set; }
    
    // Activity Tracking
    public int TotalActivities { get; set; }
    public int SupervisedActivities { get; set; }
    public int PendingApprovals { get; set; }
    public DateTime? LastActivityDate { get; set; }
    
    // Status
    public string Status { get; set; } = "Active"; // Active, On Leave, Graduated, Inactive
    
    // Audit Trail
    public DateTime CreatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
}

/// <summary>
/// Supervisor Assignment - Capacity tracking for supervisors
/// </summary>
public class SupervisorAssignment
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid? BranchId { get; set; }
    
    // Supervisor Information
    public Guid SupervisorUserId { get; set; }
    public string SupervisorName { get; set; } = string.Empty;
    public string? Specialty { get; set; }
    
    // Capacity Management
    public int MaxSupervisees { get; set; } // Max 5
    public int CurrentSupervisees { get; set; }
    public int AvailableSlots { get; set; }
    
    // Supervision Statistics
    public int TotalSupervised { get; set; }
    public int ActiveSupervisions { get; set; }
    public int CompletedSupervisions { get; set; }
    public decimal AverageComplianceScore { get; set; }
    
    // Status
    public bool IsActive { get; set; }
    public string Status { get; set; } = "Active"; // Active, On Leave, Full Capacity, Inactive
    
    // Audit Trail
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// DTO for displaying supervised users in list view
/// </summary>
public class SupervisedUserDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Qualification { get; set; }
    public int? YearsOfExperience { get; set; }
    public Guid? AssignedSupervisorId { get; set; }
    public string? SupervisorName { get; set; }
    public string OversightLevel { get; set; } = "Close";
    public bool RequiresCoSignature { get; set; }
    public int ComplianceScore { get; set; }
    public int PendingApprovals { get; set; }
    public string Status { get; set; } = "Active";
    public DateTime? SupervisionStartDate { get; set; }
    public DateTime? SupervisionEndDate { get; set; }
}

/// <summary>
/// DTO for creating/updating supervised users
/// </summary>
public class SupervisedUserFormData
{
    public Guid UserId { get; set; }
    public Guid? AssignedSupervisorId { get; set; }
    public string OversightLevel { get; set; } = "Close";
    public bool RequiresCoSignature { get; set; }
    public DateTime? SupervisionStartDate { get; set; }
    public DateTime? SupervisionEndDate { get; set; }
    public string? ComplianceNotes { get; set; }
}

/// <summary>
/// Detailed view of a supervised user
/// </summary>
public class SupervisedUserDetails
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Qualification { get; set; }
    public int? YearsOfExperience { get; set; }
    
    public Guid? AssignedSupervisorId { get; set; }
    public string? SupervisorName { get; set; }
    public string? SupervisorEmail { get; set; }
    public string? SupervisorSpecialty { get; set; }
    
    public string OversightLevel { get; set; } = "Close";
    public bool RequiresCoSignature { get; set; }
    public DateTime? SupervisionStartDate { get; set; }
    public DateTime? SupervisionEndDate { get; set; }
    
    public int ComplianceScore { get; set; }
    public DateTime? LastComplianceCheck { get; set; }
    public string? ComplianceNotes { get; set; }
    
    public int TotalActivities { get; set; }
    public int SupervisedActivities { get; set; }
    public int PendingApprovals { get; set; }
    public DateTime? LastActivityDate { get; set; }
    
    public string Status { get; set; } = "Active";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// DTO for supervisor capacity display
/// </summary>
public class SupervisorCapacityDto
{
    public Guid SupervisorUserId { get; set; }
    public string SupervisorName { get; set; } = string.Empty;
    public string? Specialty { get; set; }
    public int MaxSupervisees { get; set; }
    public int CurrentSupervisees { get; set; }
    public int AvailableSlots { get; set; }
    public decimal UtilizationPercentage { get; set; }
    public decimal AverageComplianceScore { get; set; }
    public bool IsActive { get; set; }
    public string Status { get; set; } = "Active";
    public List<SupervisedUserDto> CurrentSupervisedUsers { get; set; } = new();
}

/// <summary>
/// Statistics for supervised access tracking
/// </summary>
public class SupervisedAccessStats
{
    public int TotalSupervisedUsers { get; set; }
    public int ActiveSupervisedUsers { get; set; }
    public int TotalSupervisors { get; set; }
    public int ActiveSupervisors { get; set; }
    public int TotalPendingApprovals { get; set; }
    public decimal AverageComplianceScore { get; set; }
    public int UsersRequiringCoSignature { get; set; }
    public Dictionary<string, int> UsersByOversightLevel { get; set; } = new();
    public Dictionary<string, int> UsersByQualification { get; set; } = new();
}

/// <summary>
/// Filters for querying supervised users
/// </summary>
public class SupervisedUserFilters
{
    public string? Search { get; set; }
    public Guid? SupervisorId { get; set; }
    public string? OversightLevel { get; set; }
    public bool? RequiresCoSignature { get; set; }
    public string? Status { get; set; }
    public int? MinComplianceScore { get; set; }
}
