namespace AuthService.Models.Department;

public class Department
{
    public Guid Id { get; set; }
    public string DepartmentCode { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public string DepartmentType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Active";
    public Guid? ParentDepartmentId { get; set; }
    public Guid? DepartmentHeadId { get; set; }
    public TimeSpan? OperatingHoursStart { get; set; }
    public TimeSpan? OperatingHoursEnd { get; set; }
    public string? DaysOfOperation { get; set; }
    public bool Is24x7 { get; set; }
    public decimal? AnnualBudget { get; set; }
    public string? BudgetCurrency { get; set; }
    public bool RequiresApproval { get; set; }
    public int? ApprovalLevel { get; set; }
    public decimal? AutoApprovalThreshold { get; set; }
    public int? MaxConcurrentPatients { get; set; }
    public int? WaitingRoomCapacity { get; set; }
    public Guid TenantId { get; set; }
    public Guid? BranchId { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedBy { get; set; }
}

public class DepartmentDto
{
    public Guid Id { get; set; }
    public string DepartmentCode { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public string DepartmentType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Active";
    public Guid? ParentDepartmentId { get; set; }
    public string? ParentDepartmentName { get; set; }
    public Guid? DepartmentHeadId { get; set; }
    public string? DepartmentHeadName { get; set; }
    public int StaffCount { get; set; }
    public int SubDepartmentsCount { get; set; }
    public Guid? BranchId { get; set; }
    public string? BranchName { get; set; }
}

public class DepartmentFormData
{
    public string DepartmentCode { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public string DepartmentType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Active";
    public Guid? ParentDepartmentId { get; set; }
    public Guid? DepartmentHeadId { get; set; }
    public TimeSpan? OperatingHoursStart { get; set; }
    public TimeSpan? OperatingHoursEnd { get; set; }
    public string? DaysOfOperation { get; set; }
    public bool Is24x7 { get; set; }
    public decimal? AnnualBudget { get; set; }
    public string? BudgetCurrency { get; set; }
    public bool RequiresApproval { get; set; }
    public int? ApprovalLevel { get; set; }
    public decimal? AutoApprovalThreshold { get; set; }
    public int? MaxConcurrentPatients { get; set; }
    public int? WaitingRoomCapacity { get; set; }
    public Guid? BranchId { get; set; }
}

public class DepartmentHierarchy
{
    public Guid Id { get; set; }
    public string DepartmentCode { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public string DepartmentType { get; set; } = string.Empty;
    public string Status { get; set; } = "Active";
    public Guid? ParentDepartmentId { get; set; }
    public string? DepartmentHeadName { get; set; }
    public int StaffCount { get; set; }
    public List<DepartmentHierarchy> SubDepartments { get; set; } = new();
}

public class DepartmentDetails
{
    public Guid Id { get; set; }
    public string DepartmentCode { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public string DepartmentType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Active";
    public Guid? ParentDepartmentId { get; set; }
    public string? ParentDepartmentName { get; set; }
    public Guid? DepartmentHeadId { get; set; }
    public string? DepartmentHeadName { get; set; }
    public string? OperatingHours { get; set; }
    public string? DaysOfOperation { get; set; }
    public bool Is24x7 { get; set; }
    public decimal? AnnualBudget { get; set; }
    public string? BudgetCurrency { get; set; }
    public bool RequiresApproval { get; set; }
    public int? ApprovalLevel { get; set; }
    public decimal? AutoApprovalThreshold { get; set; }
    public int? MaxConcurrentPatients { get; set; }
    public int? WaitingRoomCapacity { get; set; }
    public Guid? BranchId { get; set; }
    public string? BranchName { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CreatedByName { get; set; }
}

public class DepartmentStaff
{
    public Guid Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Designation { get; set; }
    public string UserType { get; set; } = string.Empty;
    public string UserStatus { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
    public string? AccessLevel { get; set; }
}

public class DepartmentMetrics
{
    public int ActivePatients { get; set; }
    public int TotalAppointments { get; set; }
    public decimal AverageWaitTimeMinutes { get; set; }
    public decimal UtilizationRate { get; set; }
}

public class DepartmentFilters
{
    public string? Search { get; set; }
    public string? Status { get; set; }
    public string? Type { get; set; }
    public Guid? ParentDepartmentId { get; set; }
    public Guid? BranchId { get; set; }
}
