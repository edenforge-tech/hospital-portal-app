using AuthService.Context;
using AuthService.Models.BulkOperations;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;
using System.Collections.Concurrent;
using System.Text;
using System.Text.Json;

namespace AuthService.Services
{
    public class BulkOperationsService : IBulkOperationsService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<BulkOperationsService> _logger;
        private static readonly ConcurrentDictionary<string, BulkOperationJob> _activeJobs = new();

        public BulkOperationsService(AppDbContext context, ILogger<BulkOperationsService> logger)
        {
            _context = context;
            _logger = logger;
        }

        // User Bulk Operations
        public async Task<BulkOperationResponse<BulkUserCreate>> BulkCreateUsersAsync(BulkCreateUsersRequest request)
        {
            var startTime = DateTime.UtcNow;
            var results = new List<BulkOperationItemResult<BulkUserCreate>>();

            try
            {
                foreach (var userRequest in request.Users)
                {
                    try
                    {
                        // Check for duplicate email
                        var existingUser = await _context.Users
                            .FirstOrDefaultAsync(u => u.Email == userRequest.Email);

                        if (existingUser != null)
                        {
                            results.Add(new BulkOperationItemResult<BulkUserCreate>
                            {
                                Item = userRequest,
                                Success = false,
                                ErrorMessage = "User with this email already exists"
                            });
                            continue;
                        }

                        // Create user
                        var user = new User
                        {
                            TenantId = request.TenantId,
                            Username = userRequest.Username,
                            Email = userRequest.Email,
                            FirstName = userRequest.FirstName,
                            LastName = userRequest.LastName,
                            PhoneNumber = userRequest.PhoneNumber,
                            Status = "Active",
                            CreatedAt = DateTime.UtcNow,
                            CreatedBy = request.CreatedBy
                        };

                        _context.Users.Add(user);
                        await _context.SaveChangesAsync();

                        results.Add(new BulkOperationItemResult<BulkUserCreate>
                        {
                            Item = userRequest,
                            Success = true,
                            ItemId = user.Id
                        });
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error creating user {Email}", userRequest.Email);
                        results.Add(new BulkOperationItemResult<BulkUserCreate>
                        {
                            Item = userRequest,
                            Success = false,
                            ErrorMessage = ex.Message
                        });
                    }
                }

                return new BulkOperationResponse<BulkUserCreate>
                {
                    TotalItems = request.Users.Count,
                    SuccessCount = results.Count(r => r.Success),
                    FailureCount = results.Count(r => !r.Success),
                    Results = results,
                    Duration = DateTime.UtcNow - startTime
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk create users");
                throw;
            }
        }

        public async Task<BulkOperationResponse<object>> BulkUpdateUsersAsync(BulkUpdateUsersRequest request)
        {
            var startTime = DateTime.UtcNow;
            var results = new List<BulkOperationItemResult<object>>();

            try
            {
                var users = await _context.Users
                    .Where(u => request.UserIds.Contains(u.Id))
                    .ToListAsync();

                foreach (var user in users)
                {
                    try
                    {
                        // Apply updates
                        if (!string.IsNullOrWhiteSpace(request.Status))
                            user.Status = request.Status;

                        if (request.DepartmentId.HasValue)
                            user.DepartmentId = request.DepartmentId.Value;

                        if (request.BranchId.HasValue)
                            user.BranchId = request.BranchId.Value;

                        user.UpdatedAt = DateTime.UtcNow;
                        user.UpdatedBy = request.UpdatedBy;

                        results.Add(new BulkOperationItemResult<object>
                        {
                            Item = new { UserId = user.Id, user.Email },
                            Success = true,
                            ItemId = user.Id
                        });
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error updating user {UserId}", user.Id);
                        results.Add(new BulkOperationItemResult<object>
                        {
                            Item = new { UserId = user.Id, user.Email },
                            Success = false,
                            ErrorMessage = ex.Message
                        });
                    }
                }

                await _context.SaveChangesAsync();

                return new BulkOperationResponse<object>
                {
                    TotalItems = request.UserIds.Count,
                    SuccessCount = results.Count(r => r.Success),
                    FailureCount = results.Count(r => !r.Success),
                    Results = results,
                    Duration = DateTime.UtcNow - startTime
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk update users");
                throw;
            }
        }

        public async Task<BulkOperationResponse<int>> BulkDeleteUsersAsync(BulkDeleteRequest request)
        {
            var startTime = DateTime.UtcNow;
            var results = new List<BulkOperationItemResult<int>>();

            try
            {
                var users = await _context.Users
                    .Where(u => request.Ids.Contains(u.Id))
                    .ToListAsync();

                foreach (var user in users)
                {
                    try
                    {
                        if (request.SoftDelete)
                        {
                            user.Status = "Deleted";
                            user.UpdatedAt = DateTime.UtcNow;
                            user.UpdatedBy = request.DeletedBy;
                        }
                        else
                        {
                            _context.Users.Remove(user);
                        }

                        results.Add(new BulkOperationItemResult<int>
                        {
                            Item = user.Id,
                            Success = true,
                            ItemId = user.Id
                        });
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error deleting user {UserId}", user.Id);
                        results.Add(new BulkOperationItemResult<int>
                        {
                            Item = user.Id,
                            Success = false,
                            ErrorMessage = ex.Message
                        });
                    }
                }

                await _context.SaveChangesAsync();

                return new BulkOperationResponse<int>
                {
                    TotalItems = request.Ids.Count,
                    SuccessCount = results.Count(r => r.Success),
                    FailureCount = results.Count(r => !r.Success),
                    Results = results,
                    Duration = DateTime.UtcNow - startTime
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk delete users");
                throw;
            }
        }

        // Role Assignment Operations
        public async Task<BulkOperationResponse<object>> BulkAssignRolesAsync(BulkRoleAssignmentRequest request)
        {
            var startTime = DateTime.UtcNow;
            var results = new List<BulkOperationItemResult<object>>();

            try
            {
                var users = await _context.Users
                    .Include(u => u.UserRoles)
                    .Where(u => request.UserIds.Contains(u.Id))
                    .ToListAsync();

                var roles = await _context.Roles
                    .Where(r => request.RoleIds.Contains(r.Id))
                    .ToListAsync();

                foreach (var user in users)
                {
                    foreach (var role in roles)
                    {
                        try
                        {
                            // Check if assignment already exists
                            var existingAssignment = user.UserRoles?
                                .FirstOrDefault(ur => ur.RoleId == role.Id);

                            if (existingAssignment == null)
                            {
                                var userRole = new UserRole
                                {
                                    UserId = user.Id,
                                    RoleId = role.Id,
                                    AssignedAt = DateTime.UtcNow,
                                    AssignedBy = request.AssignedBy
                                };

                                _context.UserRoles.Add(userRole);
                            }

                            results.Add(new BulkOperationItemResult<object>
                            {
                                Item = new { user.Id, UserId = user.Id, RoleId = role.Id },
                                Success = true
                            });
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error assigning role {RoleId} to user {UserId}", role.Id, user.Id);
                            results.Add(new BulkOperationItemResult<object>
                            {
                                Item = new { UserId = user.Id, RoleId = role.Id },
                                Success = false,
                                ErrorMessage = ex.Message
                            });
                        }
                    }
                }

                await _context.SaveChangesAsync();

                return new BulkOperationResponse<object>
                {
                    TotalItems = request.UserIds.Count * request.RoleIds.Count,
                    SuccessCount = results.Count(r => r.Success),
                    FailureCount = results.Count(r => !r.Success),
                    Results = results,
                    Duration = DateTime.UtcNow - startTime
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk assign roles");
                throw;
            }
        }

        public async Task<BulkOperationResponse<object>> BulkRemoveRolesAsync(BulkRoleAssignmentRequest request)
        {
            var startTime = DateTime.UtcNow;
            var results = new List<BulkOperationItemResult<object>>();

            try
            {
                var userRoles = await _context.UserRoles
                    .Where(ur => request.UserIds.Contains(ur.UserId) && request.RoleIds.Contains(ur.RoleId))
                    .ToListAsync();

                foreach (var userRole in userRoles)
                {
                    try
                    {
                        _context.UserRoles.Remove(userRole);

                        results.Add(new BulkOperationItemResult<object>
                        {
                            Item = new { userRole.UserId, userRole.RoleId },
                            Success = true
                        });
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error removing role {RoleId} from user {UserId}", userRole.RoleId, userRole.UserId);
                        results.Add(new BulkOperationItemResult<object>
                        {
                            Item = new { userRole.UserId, userRole.RoleId },
                            Success = false,
                            ErrorMessage = ex.Message
                        });
                    }
                }

                await _context.SaveChangesAsync();

                return new BulkOperationResponse<object>
                {
                    TotalItems = userRoles.Count,
                    SuccessCount = results.Count(r => r.Success),
                    FailureCount = results.Count(r => !r.Success),
                    Results = results,
                    Duration = DateTime.UtcNow - startTime
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk remove roles");
                throw;
            }
        }

        // Permission Assignment Operations
        public async Task<BulkOperationResponse<object>> BulkAssignPermissionsAsync(BulkPermissionAssignmentRequest request)
        {
            var startTime = DateTime.UtcNow;
            var results = new List<BulkOperationItemResult<object>>();

            try
            {
                var roles = await _context.Roles
                    .Include(r => r.RolePermissions)
                    .Where(r => request.RoleIds.Contains(r.Id))
                    .ToListAsync();

                var permissions = await _context.Permissions
                    .Where(p => request.PermissionIds.Contains(p.Id))
                    .ToListAsync();

                foreach (var role in roles)
                {
                    foreach (var permission in permissions)
                    {
                        try
                        {
                            var existingAssignment = role.RolePermissions?
                                .FirstOrDefault(rp => rp.PermissionId == permission.Id);

                            if (existingAssignment == null)
                            {
                                var rolePermission = new RolePermission
                                {
                                    RoleId = role.Id,
                                    PermissionId = permission.Id,
                                    AssignedAt = DateTime.UtcNow,
                                    AssignedBy = request.AssignedBy
                                };

                                _context.RolePermissions.Add(rolePermission);
                            }

                            results.Add(new BulkOperationItemResult<object>
                            {
                                Item = new { RoleId = role.Id, PermissionId = permission.Id },
                                Success = true
                            });
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error assigning permission {PermissionId} to role {RoleId}", permission.Id, role.Id);
                            results.Add(new BulkOperationItemResult<object>
                            {
                                Item = new { RoleId = role.Id, PermissionId = permission.Id },
                                Success = false,
                                ErrorMessage = ex.Message
                            });
                        }
                    }
                }

                await _context.SaveChangesAsync();

                return new BulkOperationResponse<object>
                {
                    TotalItems = request.RoleIds.Count * request.PermissionIds.Count,
                    SuccessCount = results.Count(r => r.Success),
                    FailureCount = results.Count(r => !r.Success),
                    Results = results,
                    Duration = DateTime.UtcNow - startTime
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk assign permissions");
                throw;
            }
        }

        public async Task<BulkOperationResponse<object>> BulkRemovePermissionsAsync(BulkPermissionAssignmentRequest request)
        {
            var startTime = DateTime.UtcNow;
            var results = new List<BulkOperationItemResult<object>>();

            try
            {
                var rolePermissions = await _context.RolePermissions
                    .Where(rp => request.RoleIds.Contains(rp.RoleId) && request.PermissionIds.Contains(rp.PermissionId))
                    .ToListAsync();

                foreach (var rolePermission in rolePermissions)
                {
                    try
                    {
                        _context.RolePermissions.Remove(rolePermission);

                        results.Add(new BulkOperationItemResult<object>
                        {
                            Item = new { rolePermission.RoleId, rolePermission.PermissionId },
                            Success = true
                        });
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error removing permission {PermissionId} from role {RoleId}", rolePermission.PermissionId, rolePermission.RoleId);
                        results.Add(new BulkOperationItemResult<object>
                        {
                            Item = new { rolePermission.RoleId, rolePermission.PermissionId },
                            Success = false,
                            ErrorMessage = ex.Message
                        });
                    }
                }

                await _context.SaveChangesAsync();

                return new BulkOperationResponse<object>
                {
                    TotalItems = rolePermissions.Count,
                    SuccessCount = results.Count(r => r.Success),
                    FailureCount = results.Count(r => !r.Success),
                    Results = results,
                    Duration = DateTime.UtcNow - startTime
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk remove permissions");
                throw;
            }
        }

        // Status Change Operations
        public async Task<BulkOperationResponse<object>> BulkChangeStatusAsync(BulkStatusChangeRequest request)
        {
            var startTime = DateTime.UtcNow;
            var results = new List<BulkOperationItemResult<object>>();

            try
            {
                switch (request.EntityType)
                {
                    case BulkEntityType.Users:
                        var users = await _context.Users.Where(u => request.Ids.Contains(u.Id)).ToListAsync();
                        foreach (var user in users)
                        {
                            user.Status = request.NewStatus;
                            user.UpdatedAt = DateTime.UtcNow;
                            user.UpdatedBy = request.UpdatedBy;
                            results.Add(new BulkOperationItemResult<object> { Item = user.Id, Success = true });
                        }
                        break;

                    case BulkEntityType.Roles:
                        var roles = await _context.Roles.Where(r => request.Ids.Contains(r.Id)).ToListAsync();
                        foreach (var role in roles)
                        {
                            role.Status = request.NewStatus;
                            role.UpdatedAt = DateTime.UtcNow;
                            role.UpdatedBy = request.UpdatedBy;
                            results.Add(new BulkOperationItemResult<object> { Item = role.Id, Success = true });
                        }
                        break;

                    case BulkEntityType.Departments:
                        var departments = await _context.Departments.Where(d => request.Ids.Contains(d.Id)).ToListAsync();
                        foreach (var department in departments)
                        {
                            department.Status = request.NewStatus;
                            department.UpdatedAt = DateTime.UtcNow;
                            department.UpdatedBy = request.UpdatedBy;
                            results.Add(new BulkOperationItemResult<object> { Item = department.Id, Success = true });
                        }
                        break;

                    case BulkEntityType.Branches:
                        var branches = await _context.Branches.Where(b => request.Ids.Contains(b.Id)).ToListAsync();
                        foreach (var branch in branches)
                        {
                            branch.Status = request.NewStatus;
                            branch.UpdatedAt = DateTime.UtcNow;
                            branch.UpdatedBy = request.UpdatedBy;
                            results.Add(new BulkOperationItemResult<object> { Item = branch.Id, Success = true });
                        }
                        break;

                    case BulkEntityType.DocumentTypes:
                        var documentTypes = await _context.DocumentTypes.Where(dt => request.Ids.Contains(dt.Id)).ToListAsync();
                        foreach (var docType in documentTypes)
                        {
                            docType.Status = request.NewStatus;
                            docType.UpdatedAt = DateTime.UtcNow;
                            docType.UpdatedBy = request.UpdatedBy;
                            results.Add(new BulkOperationItemResult<object> { Item = docType.Id, Success = true });
                        }
                        break;

                    case BulkEntityType.Configurations:
                        var configurations = await _context.SystemConfigurations.Where(c => request.Ids.Contains(c.Id)).ToListAsync();
                        foreach (var config in configurations)
                        {
                            config.Status = request.NewStatus;
                            config.UpdatedAt = DateTime.UtcNow;
                            config.UpdatedBy = request.UpdatedBy;
                            results.Add(new BulkOperationItemResult<object> { Item = config.Id, Success = true });
                        }
                        break;

                    default:
                        throw new InvalidOperationException($"Unsupported entity type: {request.EntityType}");
                }

                await _context.SaveChangesAsync();

                return new BulkOperationResponse<object>
                {
                    TotalItems = request.Ids.Count,
                    SuccessCount = results.Count(r => r.Success),
                    FailureCount = results.Count(r => !r.Success),
                    Results = results,
                    Duration = DateTime.UtcNow - startTime
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk status change");
                throw;
            }
        }

        // Import/Export Operations
        public async Task<BulkOperationResponse<object>> BulkImportAsync(BulkImportRequest request)
        {
            var startTime = DateTime.UtcNow;
            var jobId = Guid.NewGuid().ToString();

            try
            {
                // Register job
                var job = new BulkOperationJob
                {
                    JobId = jobId,
                    OperationType = BulkOperationType.Import,
                    EntityType = request.EntityType,
                    Status = "Processing",
                    StartedAt = DateTime.UtcNow,
                    TotalItems = 0 // Will be updated after parsing
                };
                _activeJobs[jobId] = job;

                // Parse file based on format
                var data = request.Format.ToLower() switch
                {
                    "csv" => ParseCsvImport(request.FileContent, request.FieldMapping),
                    "json" => ParseJsonImport(request.FileContent),
                    "xml" => ParseXmlImport(request.FileContent),
                    _ => throw new InvalidOperationException("Unsupported format")
                };

                job.TotalItems = data.Count;

                var results = new List<BulkOperationItemResult<object>>();

                // Process data based on entity type
                foreach (var item in data)
                {
                    try
                    {
                        // This would need specific handling per entity type
                        // Placeholder implementation
                        results.Add(new BulkOperationItemResult<object>
                        {
                            Item = item,
                            Success = true
                        });

                        job.ProcessedItems++;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error importing item");
                        results.Add(new BulkOperationItemResult<object>
                        {
                            Item = item,
                            Success = false,
                            ErrorMessage = ex.Message
                        });
                    }
                }

                job.Status = "Completed";
                job.CompletedAt = DateTime.UtcNow;
                job.SuccessCount = results.Count(r => r.Success);
                job.FailureCount = results.Count(r => !r.Success);

                return new BulkOperationResponse<object>
                {
                    TotalItems = data.Count,
                    SuccessCount = results.Count(r => r.Success),
                    FailureCount = results.Count(r => !r.Success),
                    Results = results,
                    Duration = DateTime.UtcNow - startTime
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk import");
                if (_activeJobs.TryGetValue(jobId, out var job))
                {
                    job.Status = "Failed";
                    job.CompletedAt = DateTime.UtcNow;
                }
                throw;
            }
        }

        public async Task<BulkExportResponse> BulkExportAsync(BulkExportRequest request)
        {
            try
            {
                byte[] data;
                string contentType;
                string fileName;

                switch (request.EntityType)
                {
                    case BulkEntityType.Users:
                        var users = await _context.Users.ToListAsync();
                        data = ExportData(users, request.Format);
                        fileName = $"users_export.{request.Format.ToLower()}";
                        break;

                    case BulkEntityType.Roles:
                        var roles = await _context.Roles.ToListAsync();
                        data = ExportData(roles, request.Format);
                        fileName = $"roles_export.{request.Format.ToLower()}";
                        break;

                    case BulkEntityType.Departments:
                        var departments = await _context.Departments.ToListAsync();
                        data = ExportData(departments, request.Format);
                        fileName = $"departments_export.{request.Format.ToLower()}";
                        break;

                    case BulkEntityType.Branches:
                        var branches = await _context.Branches.ToListAsync();
                        data = ExportData(branches, request.Format);
                        fileName = $"branches_export.{request.Format.ToLower()}";
                        break;

                    default:
                        throw new InvalidOperationException($"Export not supported for entity type: {request.EntityType}");
                }

                contentType = request.Format.ToLower() switch
                {
                    "csv" => "text/csv",
                    "json" => "application/json",
                    "xml" => "application/xml",
                    _ => "application/octet-stream"
                };

                return new BulkExportResponse
                {
                    Data = data,
                    FileName = fileName,
                    ContentType = contentType
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk export");
                throw;
            }
        }

        // Validation
        public async Task<BulkValidationResult> ValidateBulkOperationAsync<T>(BulkOperationRequest<T> request)
        {
            var errors = new List<BulkValidationError>();
            var warnings = new List<BulkValidationWarning>();

            try
            {
                // Generic validation
                if (request.Items == null || !request.Items.Any())
                {
                    errors.Add(new BulkValidationError
                    {
                        Field = "Items",
                        Message = "No items provided for bulk operation"
                    });
                }

                if (request.Items != null && request.Items.Count > 10000)
                {
                    warnings.Add(new BulkValidationWarning
                    {
                        Field = "Items",
                        Message = "Large bulk operation may take significant time to process"
                    });
                }

                return new BulkValidationResult
                {
                    IsValid = errors.Count == 0,
                    Errors = errors,
                    Warnings = warnings
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating bulk operation");
                return new BulkValidationResult
                {
                    IsValid = false,
                    Errors = new List<BulkValidationError>
                    {
                        new BulkValidationError { Field = "Validation", Message = ex.Message }
                    }
                };
            }
        }

        // Progress Tracking
        public async Task<BulkOperationProgress?> GetOperationProgressAsync(string jobId)
        {
            if (_activeJobs.TryGetValue(jobId, out var job))
            {
                return new BulkOperationProgress
                {
                    JobId = job.JobId,
                    Status = job.Status,
                    TotalItems = job.TotalItems,
                    ProcessedItems = job.ProcessedItems,
                    SuccessCount = job.SuccessCount,
                    FailureCount = job.FailureCount,
                    ProgressPercentage = job.TotalItems > 0 ? (int)((double)job.ProcessedItems / job.TotalItems * 100) : 0,
                    StartedAt = job.StartedAt
                };
            }

            return null;
        }

        public async Task<List<BulkOperationJob>> GetActiveJobsAsync()
        {
            return _activeJobs.Values
                .Where(j => j.Status == "Processing" || j.Status == "Queued")
                .ToList();
        }

        public async Task<BulkOperationJob?> GetJobDetailsAsync(string jobId)
        {
            return _activeJobs.TryGetValue(jobId, out var job) ? job : null;
        }

        // Generic Operations
        public async Task<BulkOperationResponse<T>> ExecuteBulkOperationAsync<T>(BulkOperationRequest<T> request)
        {
            var startTime = DateTime.UtcNow;
            var results = new List<BulkOperationItemResult<T>>();

            try
            {
                // Validate first
                var validationResult = await ValidateBulkOperationAsync(request);
                if (!validationResult.IsValid)
                {
                    return new BulkOperationResponse<T>
                    {
                        TotalItems = request.Items?.Count ?? 0,
                        SuccessCount = 0,
                        FailureCount = request.Items?.Count ?? 0,
                        Results = results,
                        Duration = DateTime.UtcNow - startTime
                    };
                }

                // Execute operation (placeholder - would need specific implementation per type)
                foreach (var item in request.Items ?? new List<T>())
                {
                    results.Add(new BulkOperationItemResult<T>
                    {
                        Item = item,
                        Success = true
                    });
                }

                return new BulkOperationResponse<T>
                {
                    TotalItems = request.Items?.Count ?? 0,
                    SuccessCount = results.Count(r => r.Success),
                    FailureCount = results.Count(r => !r.Success),
                    Results = results,
                    Duration = DateTime.UtcNow - startTime
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in generic bulk operation");
                throw;
            }
        }

        // Job Management
        public async Task<bool> CancelJobAsync(string jobId)
        {
            if (_activeJobs.TryGetValue(jobId, out var job))
            {
                job.Status = "Cancelled";
                job.CompletedAt = DateTime.UtcNow;
                return true;
            }

            return false;
        }

        public async Task<List<BulkOperationJob>> GetJobHistoryAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            var jobs = _activeJobs.Values.AsEnumerable();

            if (fromDate.HasValue)
                jobs = jobs.Where(j => j.StartedAt >= fromDate.Value);

            if (toDate.HasValue)
                jobs = jobs.Where(j => j.StartedAt <= toDate.Value);

            return jobs.OrderByDescending(j => j.StartedAt).ToList();
        }

        // Helper Methods
        private List<Dictionary<string, object>> ParseCsvImport(byte[] fileContent, Dictionary<string, string>? fieldMapping)
        {
            var csv = Encoding.UTF8.GetString(fileContent);
            var lines = csv.Split('\n');
            var result = new List<Dictionary<string, object>>();

            if (lines.Length < 2) return result;

            var headers = lines[0].Split(',').Select(h => h.Trim()).ToArray();

            for (int i = 1; i < lines.Length; i++)
            {
                if (string.IsNullOrWhiteSpace(lines[i])) continue;

                var fields = lines[i].Split(',');
                var item = new Dictionary<string, object>();

                for (int j = 0; j < Math.Min(headers.Length, fields.Length); j++)
                {
                    var key = fieldMapping != null && fieldMapping.ContainsKey(headers[j])
                        ? fieldMapping[headers[j]]
                        : headers[j];
                    item[key] = fields[j].Trim();
                }

                result.Add(item);
            }

            return result;
        }

        private List<Dictionary<string, object>> ParseJsonImport(byte[] fileContent)
        {
            var json = Encoding.UTF8.GetString(fileContent);
            return JsonSerializer.Deserialize<List<Dictionary<string, object>>>(json) 
                ?? new List<Dictionary<string, object>>();
        }

        private List<Dictionary<string, object>> ParseXmlImport(byte[] fileContent)
        {
            // Simplified XML parsing
            _logger.LogWarning("XML import not fully implemented");
            return new List<Dictionary<string, object>>();
        }

        private byte[] ExportData<T>(List<T> data, string format)
        {
            return format.ToLower() switch
            {
                "json" => Encoding.UTF8.GetBytes(JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true })),
                "csv" => ExportToCsv(data),
                "xml" => ExportToXml(data),
                _ => Encoding.UTF8.GetBytes(JsonSerializer.Serialize(data))
            };
        }

        private byte[] ExportToCsv<T>(List<T> data)
        {
            if (!data.Any()) return Array.Empty<byte>();

            var csv = new StringBuilder();
            var properties = typeof(T).GetProperties();

            // Headers
            csv.AppendLine(string.Join(",", properties.Select(p => p.Name)));

            // Data
            foreach (var item in data)
            {
                var values = properties.Select(p => p.GetValue(item)?.ToString() ?? "");
                csv.AppendLine(string.Join(",", values));
            }

            return Encoding.UTF8.GetBytes(csv.ToString());
        }

        private byte[] ExportToXml<T>(List<T> data)
        {
            // Simplified XML export
            var json = JsonSerializer.Serialize(data);
            return Encoding.UTF8.GetBytes($"<!-- XML export not fully implemented -->\n{json}");
        }
    }
}
