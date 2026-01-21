using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services;

/// <summary>
/// Validates department access requests based on business rules, role restrictions, and compliance requirements
/// Implements the 14 department-specific access guidelines from requirements
/// </summary>
public interface IDepartmentAccessValidationService
{
    Task<ValidationResult> ValidateDepartmentAccessAsync(Guid userId, Guid targetDepartmentId, Guid tenantId);
    Task<ValidationResult> ValidateDepartmentCombinationAsync(Guid userId, List<Guid> departmentIds, Guid tenantId);
    Task<bool> RequiresApprovalWorkflowAsync(Guid userId, Guid departmentId, Guid tenantId);
    Task<List<string>> GetApproverRolesAsync(Guid departmentId, Guid tenantId);
    Task<Dictionary<string, AccessPermissions>> GetRecommendedPermissionsAsync(string userRole, string targetDepartmentCode);
}

public class DepartmentAccessValidationService : IDepartmentAccessValidationService
{
    private readonly AppDbContext _context;
    private readonly ILogger<DepartmentAccessValidationService> _logger;

    public DepartmentAccessValidationService(AppDbContext context, ILogger<DepartmentAccessValidationService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ValidationResult> ValidateDepartmentAccessAsync(Guid userId, Guid targetDepartmentId, Guid tenantId)
    {
        var result = new ValidationResult { IsValid = true };

        try
        {
            // Get user details including roles and current departments
            var user = await _context.Users
                .Where(u => u.Id == userId && u.TenantId == tenantId)
                .FirstOrDefaultAsync();

            if (user == null)
            {
                result.IsValid = false;
                result.Errors.Add("User not found");
                return result;
            }

            // Get user's primary role
            var userRole = await _context.UserRoles
                .Where(ur => ur.UserId == userId)
                .Join(_context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name)
                .FirstOrDefaultAsync();

            if (string.IsNullOrEmpty(userRole))
            {
                result.IsValid = false;
                result.Errors.Add("User must have at least one role assigned");
                return result;
            }

            // Get target department details
            var targetDepartment = await _context.Departments
                .Where(d => d.Id == targetDepartmentId && d.TenantId == tenantId && d.DeletedAt == null)
                .FirstOrDefaultAsync();

            if (targetDepartment == null)
            {
                result.IsValid = false;
                result.Errors.Add("Target department not found");
                return result;
            }

            // Get user's current departments
            var currentDepartments = await _context.UserDepartments
                .Where(ud => ud.UserId == userId && ud.TenantId == tenantId && ud.DeletedAt == null)
                .Include(ud => ud.Department)
                .Select(ud => ud.Department!.DepartmentCode)
                .ToListAsync();

            // Apply department-specific access rules
            var accessRule = GetDepartmentAccessRule(targetDepartment.DepartmentCode);
            
            if (accessRule != null)
            {
                // Check if user's primary department is restricted
                var primaryDept = await _context.UserDepartments
                    .Where(ud => ud.UserId == userId && ud.AccessType == "Primary" && ud.DeletedAt == null)
                    .Include(ud => ud.Department)
                    .Select(ud => ud.Department!.DepartmentCode)
                    .FirstOrDefaultAsync();

                if (!string.IsNullOrEmpty(primaryDept) && accessRule.RestrictedFromDepartments.Contains(primaryDept))
                {
                    result.IsValid = false;
                    result.Errors.Add($"Access to {targetDepartment.DepartmentName} is restricted for users in {primaryDept} department");
                    result.RequiresApproval = accessRule.ConfigurableAccess;
                    result.ComplianceNote = accessRule.ComplianceNote;
                    return result;
                }

                // Check role-based restrictions
                if (accessRule.RestrictedRoles.Contains(userRole))
                {
                    result.IsValid = false;
                    result.Errors.Add($"Role '{userRole}' is not permitted to access {targetDepartment.DepartmentName}");
                    result.ComplianceNote = accessRule.ComplianceNote;
                    return result;
                }

                // Check if configurable access requires approval
                if (accessRule.ConfigurableAccess && !accessRule.PermittedDepartments.Any(pd => currentDepartments.Contains(pd)))
                {
                    result.RequiresApproval = true;
                    result.ApproverRoles = accessRule.ApproverRoles;
                    result.Warnings.Add($"Access to {targetDepartment.DepartmentName} requires approval from {string.Join(" or ", accessRule.ApproverRoles)}");
                }
            }

            // Check if department itself requires approval
            if (targetDepartment.RequiresApproval)
            {
                result.RequiresApproval = true;
                result.ApproverRoles = await GetApproverRolesAsync(targetDepartmentId, tenantId);
                result.Warnings.Add($"{targetDepartment.DepartmentName} requires approval workflow");
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating department access for user {UserId} to department {DepartmentId}", userId, targetDepartmentId);
            result.IsValid = false;
            result.Errors.Add("An error occurred during validation");
            return result;
        }
    }

    public async Task<ValidationResult> ValidateDepartmentCombinationAsync(Guid userId, List<Guid> departmentIds, Guid tenantId)
    {
        var result = new ValidationResult { IsValid = true };

        // Validate each department individually
        foreach (var deptId in departmentIds)
        {
            var individualResult = await ValidateDepartmentAccessAsync(userId, deptId, tenantId);
            if (!individualResult.IsValid)
            {
                result.IsValid = false;
                result.Errors.AddRange(individualResult.Errors);
            }
            if (individualResult.RequiresApproval)
            {
                result.RequiresApproval = true;
                result.ApproverRoles.AddRange(individualResult.ApproverRoles);
            }
            result.Warnings.AddRange(individualResult.Warnings);
        }

        // Check for conflicting department combinations
        var departments = await _context.Departments
            .Where(d => departmentIds.Contains(d.Id) && d.TenantId == tenantId && d.DeletedAt == null)
            .Select(d => d.DepartmentCode)
            .ToListAsync();

        var conflicts = CheckDepartmentConflicts(departments);
        if (conflicts.Any())
        {
            result.Warnings.AddRange(conflicts.Select(c => 
                $"Warning: {c.Dept1} and {c.Dept2} combination may violate separation of duties - {c.Reason}"));
        }

        return result;
    }

    public async Task<bool> RequiresApprovalWorkflowAsync(Guid userId, Guid departmentId, Guid tenantId)
    {
        var validationResult = await ValidateDepartmentAccessAsync(userId, departmentId, tenantId);
        return validationResult.RequiresApproval;
    }

    public async Task<List<string>> GetApproverRolesAsync(Guid departmentId, Guid tenantId)
    {
        var department = await _context.Departments
            .Where(d => d.Id == departmentId && d.TenantId == tenantId)
            .FirstOrDefaultAsync();

        if (department == null) return new List<string>();

        var accessRule = GetDepartmentAccessRule(department.DepartmentCode);
        if (accessRule != null && accessRule.ApproverRoles.Any())
        {
            return accessRule.ApproverRoles;
        }

        // Default approvers for departments requiring approval
        return new List<string> { "Organization Administrator", "Branch Administrator", "System Administrator" };
    }

    public async Task<Dictionary<string, AccessPermissions>> GetRecommendedPermissionsAsync(string userRole, string targetDepartmentCode)
    {
        await Task.CompletedTask; // Make async to match interface
        
        var recommendations = new Dictionary<string, AccessPermissions>();
        var accessRule = GetDepartmentAccessRule(targetDepartmentCode);

        if (accessRule == null) return recommendations;

        // Return role-based permission recommendations
        foreach (var mapping in accessRule.RolePermissionMappings)
        {
            recommendations[mapping.Key] = mapping.Value;
        }

        return recommendations;
    }

    #region Private Helper Methods

    /// <summary>
    /// Returns department-specific access rules based on the 14 standard departments
    /// Implements requirements from section 3.2 Department Access Hierarchy & Rules
    /// </summary>
    private DepartmentValidationRule? GetDepartmentAccessRule(string departmentCode)
    {
        var rules = new Dictionary<string, DepartmentValidationRule>
        {
            // 1. Doctor Department
            ["STD_DOCTOR"] = new DepartmentValidationRule
            {
                DepartmentCode = "STD_DOCTOR",
                PermittedDepartments = new() { "STD_IMAGING", "STD_LABORATORY", "STD_PHARMACY", "STD_NURSE", "STD_BILLING" },
                RestrictedFromDepartments = new(),
                RestrictedRoles = new() { "Receptionist", "Billing Clerk" },
                ConfigurableAccess = true,
                ApproverRoles = new() { "Organization Administrator", "Branch Administrator" },
                ComplianceNote = "HIPAA: Audit trails required for all patient record access. NABH: Qualified physician oversight for prescriptions.",
                RolePermissionMappings = new()
                {
                    ["Doctor"] = new AccessPermissions { CanView = true, CanCreate = true, CanEdit = true, CanDelete = false, CanApprove = true, CanExport = true },
                    ["Senior Doctor"] = new AccessPermissions { CanView = true, CanCreate = true, CanEdit = true, CanDelete = true, CanApprove = true, CanExport = true },
                    ["Junior Doctor"] = new AccessPermissions { CanView = true, CanCreate = true, CanEdit = false, CanDelete = false, CanApprove = false, CanExport = false }
                }
            },

            // 2. Optometrist Department
            ["STD_OPTOMETRIST"] = new DepartmentValidationRule
            {
                DepartmentCode = "STD_OPTOMETRIST",
                PermittedDepartments = new() { "STD_IMAGING", "STD_OPTICAL", "STD_FRONT_OFFICE", "STD_COUNSELOR" },
                RestrictedFromDepartments = new() { "STD_DOCTOR" }, // Cannot access advanced medical records
                RestrictedRoles = new() { "Billing Clerk", "Receptionist" },
                ConfigurableAccess = true,
                ApproverRoles = new() { "Organization Administrator", "Branch Administrator" },
                ComplianceNote = "Scope of practice varies by region. Cannot prescribe medical treatments beyond scope.",
                RolePermissionMappings = new()
                {
                    ["Optometrist"] = new AccessPermissions { CanView = true, CanCreate = true, CanEdit = true, CanDelete = false, CanApprove = false, CanExport = true }
                }
            },

            // 3. Counselor Department
            ["STD_COUNSELOR"] = new DepartmentValidationRule
            {
                DepartmentCode = "STD_COUNSELOR",
                PermittedDepartments = new() { "STD_FRONT_OFFICE", "STD_BILLING", "STD_INSURANCE", "STD_OPTICAL", "STD_PHARMACY" },
                RestrictedFromDepartments = new() { "STD_DOCTOR", "STD_OPTOMETRIST" }, // Cannot modify clinical records
                RestrictedRoles = new() { "Doctor", "Nurse" },
                ConfigurableAccess = false,
                ComplianceNote = "PII/PHI access must be logged. NABH: Informed consent documentation required.",
                RolePermissionMappings = new()
                {
                    ["Counselor"] = new AccessPermissions { CanView = true, CanCreate = true, CanEdit = false, CanDelete = false, CanApprove = false, CanExport = false }
                }
            },

            // 4. Front Office Department
            ["STD_FRONT_OFFICE"] = new DepartmentValidationRule
            {
                DepartmentCode = "STD_FRONT_OFFICE",
                PermittedDepartments = new() { "STD_BILLING", "STD_INSURANCE", "STD_COUNSELOR" },
                RestrictedFromDepartments = new() { "STD_DOCTOR", "STD_OPTOMETRIST", "STD_COUNSELOR", "STD_LABORATORY", "STD_PHARMACY" },
                RestrictedRoles = new() { "Doctor", "Nurse", "Pharmacist" },
                ConfigurableAccess = false,
                ComplianceNote = "HIPAA: Minimal PHI access principle. View-only: contact info, appointment history.",
                RolePermissionMappings = new()
                {
                    ["Receptionist"] = new AccessPermissions { CanView = true, CanCreate = true, CanEdit = true, CanDelete = false, CanApprove = false, CanExport = false }
                }
            },

            // 5. Scan/Imaging Department
            ["STD_IMAGING"] = new DepartmentValidationRule
            {
                DepartmentCode = "STD_IMAGING",
                PermittedDepartments = new() { "STD_FRONT_OFFICE", "STD_LABORATORY", "STD_BILLING" },
                RestrictedFromDepartments = new() { "STD_DOCTOR", "STD_NURSE", "STD_JUNIOR_DOCTOR" }, // Cannot modify clinical interpretations
                RestrictedRoles = new() { "Receptionist", "Billing Clerk" },
                ConfigurableAccess = false,
                ComplianceNote = "DICOM compliance required. NABH: Trained personnel certification mandatory.",
                RolePermissionMappings = new()
                {
                    ["Imaging Technician"] = new AccessPermissions { CanView = true, CanCreate = true, CanEdit = true, CanDelete = false, CanApprove = false, CanExport = true }
                }
            },

            // 6. Nurse (OT Management) Department
            ["STD_NURSE"] = new DepartmentValidationRule
            {
                DepartmentCode = "STD_NURSE",
                PermittedDepartments = new() { "STD_DOCTOR", "STD_PHARMACY", "STD_INVENTORY", "STD_LABORATORY" },
                RestrictedFromDepartments = new(),
                RestrictedRoles = new() { "Receptionist", "Billing Clerk" },
                ConfigurableAccess = true,
                ComplianceNote = "NABH: Medication administration requires physician orders. Surgical documentation for accreditation.",
                RolePermissionMappings = new()
                {
                    ["Nurse"] = new AccessPermissions { CanView = true, CanCreate = true, CanEdit = true, CanDelete = false, CanApprove = false, CanExport = false },
                    ["Nurse Manager"] = new AccessPermissions { CanView = true, CanCreate = true, CanEdit = true, CanDelete = false, CanApprove = true, CanExport = true }
                }
            },

            // 7. Junior Doctor Department
            ["STD_JUNIOR_DOCTOR"] = new DepartmentValidationRule
            {
                DepartmentCode = "STD_JUNIOR_DOCTOR",
                PermittedDepartments = new() { "STD_IMAGING", "STD_LABORATORY", "STD_PHARMACY", "STD_NURSE" },
                RestrictedFromDepartments = new(),
                RestrictedRoles = new() { "Receptionist", "Billing Clerk", "Pharmacist" },
                ConfigurableAccess = true,
                ApproverRoles = new() { "Senior Doctor", "Consultant", "Department Head" },
                ComplianceNote = "All critical actions require senior physician approval. Supervision required per training program accreditation.",
                RolePermissionMappings = new()
                {
                    ["Junior Doctor"] = new AccessPermissions { CanView = true, CanCreate = true, CanEdit = false, CanDelete = false, CanApprove = false, CanExport = false }
                }
            },

            // 8. Pharmacy Department
            ["STD_PHARMACY"] = new DepartmentValidationRule
            {
                DepartmentCode = "STD_PHARMACY",
                PermittedDepartments = new() { "STD_DOCTOR", "STD_OPTOMETRIST", "STD_BILLING", "STD_INVENTORY", "STD_NURSE" },
                RestrictedFromDepartments = new(),
                RestrictedRoles = new() { "Receptionist", "Billing Clerk" },
                ConfigurableAccess = false,
                ComplianceNote = "Controlled substance regulations. NABH: Medication error prevention protocols. Cannot modify prescriptions without consultation.",
                RolePermissionMappings = new()
                {
                    ["Pharmacist"] = new AccessPermissions { CanView = true, CanCreate = false, CanEdit = false, CanDelete = false, CanApprove = true, CanExport = true },
                    ["Clinical Pharmacist"] = new AccessPermissions { CanView = true, CanCreate = true, CanEdit = true, CanDelete = false, CanApprove = true, CanExport = true }
                }
            },

            // 9. Optical Department
            ["STD_OPTICAL"] = new DepartmentValidationRule
            {
                DepartmentCode = "STD_OPTICAL",
                PermittedDepartments = new() { "STD_OPTOMETRIST", "STD_DOCTOR", "STD_BILLING", "STD_INVENTORY" },
                RestrictedFromDepartments = new(),
                RestrictedRoles = new() { "Doctor", "Nurse" },
                ConfigurableAccess = false,
                ComplianceNote = "Optical product quality standards. Cannot modify prescriptions or perform refractions.",
                RolePermissionMappings = new()
                {
                    ["Optical Staff"] = new AccessPermissions { CanView = true, CanCreate = true, CanEdit = true, CanDelete = false, CanApprove = false, CanExport = false }
                }
            },

            // 10. Insurance Department
            ["STD_INSURANCE"] = new DepartmentValidationRule
            {
                DepartmentCode = "STD_INSURANCE",
                PermittedDepartments = new() { "STD_BILLING", "STD_COUNSELOR", "STD_FRONT_OFFICE", "STD_DOCTOR" },
                RestrictedFromDepartments = new(),
                RestrictedRoles = new() { "Doctor", "Nurse" },
                ConfigurableAccess = false,
                ComplianceNote = "HIPAA transaction standards. Fraud prevention. Cannot modify clinical documentation.",
                RolePermissionMappings = new()
                {
                    ["Insurance Coordinator"] = new AccessPermissions { CanView = true, CanCreate = true, CanEdit = true, CanDelete = false, CanApprove = false, CanExport = true }
                }
            },

            // 11. Billing Management Department
            ["STD_BILLING"] = new DepartmentValidationRule
            {
                DepartmentCode = "STD_BILLING",
                PermittedDepartments = new() { "STD_INSURANCE", "STD_FRONT_OFFICE", "STD_PHARMACY", "STD_OPTICAL" },
                RestrictedFromDepartments = new(),
                RestrictedRoles = new() { "Doctor", "Nurse" },
                ConfigurableAccess = false,
                ComplianceNote = "HIPAA/False Claims Act compliance. Proper coding standards (ICD-10, CPT). Cannot alter clinical notes.",
                RolePermissionMappings = new()
                {
                    ["Billing Clerk"] = new AccessPermissions { CanView = true, CanCreate = true, CanEdit = true, CanDelete = false, CanApprove = false, CanExport = true }
                }
            },

            // 12. Inventory Department
            ["STD_INVENTORY"] = new DepartmentValidationRule
            {
                DepartmentCode = "STD_INVENTORY",
                PermittedDepartments = new() { "STD_PHARMACY", "STD_OPTICAL", "STD_NURSE", "STD_LABORATORY", "STD_BILLING", "STD_ADMIN" },
                RestrictedFromDepartments = new(),
                RestrictedRoles = new(),
                ConfigurableAccess = true,
                ApproverRoles = new() { "Organization Administrator", "Branch Administrator" },
                ComplianceNote = "Controlled substance inventory tracking. FDA/regulatory compliance. Expiration management.",
                RolePermissionMappings = new()
                {
                    ["Inventory Manager"] = new AccessPermissions { CanView = true, CanCreate = true, CanEdit = true, CanDelete = false, CanApprove = true, CanExport = true }
                }
            },

            // 13. Admin Management Department
            ["STD_ADMIN"] = new DepartmentValidationRule
            {
                DepartmentCode = "STD_ADMIN",
                PermittedDepartments = new(), // Full system access
                RestrictedFromDepartments = new(),
                RestrictedRoles = new() { "Doctor", "Nurse", "Receptionist", "Billing Clerk" },
                ConfigurableAccess = true,
                ApproverRoles = new() { "System Administrator", "Organization Administrator" },
                ComplianceNote = "HIPAA: Administrative safeguards. Principle of least privilege. Separation of duties. Clinical data access requires authorization.",
                RolePermissionMappings = new()
                {
                    ["System Administrator"] = new AccessPermissions { CanView = true, CanCreate = true, CanEdit = true, CanDelete = true, CanApprove = true, CanExport = true }
                }
            },

            // 14. Laboratory Department
            ["STD_LABORATORY"] = new DepartmentValidationRule
            {
                DepartmentCode = "STD_LABORATORY",
                PermittedDepartments = new() { "STD_DOCTOR", "STD_JUNIOR_DOCTOR", "STD_NURSE", "STD_BILLING", "STD_INVENTORY" },
                RestrictedFromDepartments = new(),
                RestrictedRoles = new() { "Receptionist", "Billing Clerk" },
                ConfigurableAccess = false,
                ComplianceNote = "CLIA regulations. NABH: Quality control documentation. Critical value reporting protocols.",
                RolePermissionMappings = new()
                {
                    ["Lab Technician"] = new AccessPermissions { CanView = true, CanCreate = true, CanEdit = true, CanDelete = false, CanApprove = false, CanExport = false },
                    ["Pathologist"] = new AccessPermissions { CanView = true, CanCreate = true, CanEdit = true, CanDelete = false, CanApprove = true, CanExport = true }
                }
            }
        };

        return rules.TryGetValue(departmentCode, out var rule) ? rule : null;
    }

    private List<DepartmentConflict> CheckDepartmentConflicts(List<string> departmentCodes)
    {
        var conflicts = new List<DepartmentConflict>();

        // Define separation of duties conflicts
        var conflictRules = new List<(string Dept1, string Dept2, string Reason)>
        {
            ("STD_BILLING", "STD_DOCTOR", "Separation of duties: Clinical and financial responsibilities should be separate"),
            ("STD_BILLING", "STD_PHARMACY", "Separation of duties: Medication dispensing and billing should be separate"),
            ("STD_INVENTORY", "STD_BILLING", "Separation of duties: Procurement and financial approval conflict"),
            ("STD_ADMIN", "STD_DOCTOR", "Separation of duties: Administrative and clinical privileges should be separate without proper authorization")
        };

        foreach (var (dept1, dept2, reason) in conflictRules)
        {
            if (departmentCodes.Contains(dept1) && departmentCodes.Contains(dept2))
            {
                conflicts.Add(new DepartmentConflict { Dept1 = dept1, Dept2 = dept2, Reason = reason });
            }
        }

        return conflicts;
    }

    #endregion
}

#region Supporting Classes

public class ValidationResult
{
    public bool IsValid { get; set; } = true;
    public List<string> Errors { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
    public bool RequiresApproval { get; set; }
    public List<string> ApproverRoles { get; set; } = new();
    public string? ComplianceNote { get; set; }
}

public class DepartmentValidationRule
{
    public string DepartmentCode { get; set; } = string.Empty;
    public List<string> PermittedDepartments { get; set; } = new();
    public List<string> RestrictedFromDepartments { get; set; } = new();
    public List<string> RestrictedRoles { get; set; } = new();
    public bool ConfigurableAccess { get; set; }
    public List<string> ApproverRoles { get; set; } = new();
    public string ComplianceNote { get; set; } = string.Empty;
    public Dictionary<string, AccessPermissions> RolePermissionMappings { get; set; } = new();
}

public class AccessPermissions
{
    public bool CanView { get; set; }
    public bool CanCreate { get; set; }
    public bool CanEdit { get; set; }
    public bool CanDelete { get; set; }
    public bool CanApprove { get; set; }
    public bool CanExport { get; set; }
}

public class DepartmentConflict
{
    public string Dept1 { get; set; } = string.Empty;
    public string Dept2 { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
}

#endregion
