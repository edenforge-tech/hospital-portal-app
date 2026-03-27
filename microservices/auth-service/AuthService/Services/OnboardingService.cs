using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AuthService.Context;
using AuthService.Models.Onboarding;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AuthService.Services
{
    public class OnboardingService : IOnboardingService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<OnboardingService> _logger;

        public OnboardingService(AppDbContext context, ILogger<OnboardingService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<OnboardingWorkflowDto> CreateWorkflowAsync(CreateOnboardingWorkflowRequest request, Guid tenantId, Guid createdByUserId)
        {
            try
            {
                // Validate user exists
                var user = await _context.Users.FindAsync(request.UserId);
                if (user == null)
                {
                    throw new ArgumentException($"User with ID {request.UserId} not found");
                }

                // Check if workflow already exists for user
                var existingWorkflow = await _context.Set<OnboardingWorkflow>()
                    .FirstOrDefaultAsync(w => w.UserId == request.UserId && w.TenantId == tenantId && w.Status != OnboardingWorkflowStatus.Cancelled);
                
                if (existingWorkflow != null)
                {
                    throw new InvalidOperationException($"Active onboarding workflow already exists for user {user.UserName}");
                }

                // Create workflow
                var workflow = new OnboardingWorkflow
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    UserId = request.UserId,
                    UserName = user.UserName ?? string.Empty,
                    WorkflowName = request.WorkflowName,
                    Status = OnboardingWorkflowStatus.InProgress,
                    StartDate = request.StartDate,
                    ExpectedCompletionDate = request.ExpectedCompletionDate,
                    ProgressPercentage = 0,
                    MentorId = request.MentorId,
                    CurrentAccessLevel = AccessLevel.None,
                    Notes = request.Notes,
                    CreatedAt = DateTime.UtcNow,
                    CreatedByUserId = createdByUserId
                };

                // Get mentor name if provided
                if (request.MentorId.HasValue)
                {
                    var mentor = await _context.Users.FindAsync(request.MentorId.Value);
                    workflow.MentorName = mentor?.UserName;
                }

                _context.Set<OnboardingWorkflow>().Add(workflow);

                // Create checklist items
                var checklistItems = new List<OnboardingChecklistItem>();
                foreach (var itemRequest in request.ChecklistItems)
                {
                    var item = new OnboardingChecklistItem
                    {
                        Id = Guid.NewGuid(),
                        WorkflowId = workflow.Id,
                        TenantId = tenantId,
                        Title = itemRequest.Title,
                        Description = itemRequest.Description,
                        Status = ChecklistItemStatus.Pending,
                        OrderIndex = itemRequest.OrderIndex,
                        IsRequired = itemRequest.IsRequired,
                        Category = itemRequest.Category,
                        DaysFromStart = itemRequest.DaysFromStart,
                        DueDate = request.StartDate.AddDays(itemRequest.DaysFromStart),
                        CreatedAt = DateTime.UtcNow
                    };
                    checklistItems.Add(item);
                }

                _context.Set<OnboardingChecklistItem>().AddRange(checklistItems);

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Created onboarding workflow {workflow.Id} for user {user.UserName}");

                return await GetWorkflowByIdAsync(workflow.Id, tenantId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating onboarding workflow");
                throw;
            }
        }

        public async Task<OnboardingWorkflowDto> GetWorkflowByIdAsync(Guid workflowId, Guid tenantId)
        {
            var workflow = await _context.Set<OnboardingWorkflow>()
                .FirstOrDefaultAsync(w => w.Id == workflowId && w.TenantId == tenantId);

            if (workflow == null)
            {
                throw new KeyNotFoundException($"Workflow with ID {workflowId} not found");
            }

            var checklistItems = await _context.Set<OnboardingChecklistItem>()
                .Where(i => i.WorkflowId == workflowId && i.TenantId == tenantId)
                .OrderBy(i => i.OrderIndex)
                .ToListAsync();

            return await MapToDto(workflow, checklistItems);
        }

        public async Task<OnboardingWorkflowDto> GetWorkflowByUserIdAsync(Guid userId, Guid tenantId)
        {
            var workflow = await _context.Set<OnboardingWorkflow>()
                .FirstOrDefaultAsync(w => w.UserId == userId && w.TenantId == tenantId && w.Status != OnboardingWorkflowStatus.Cancelled);

            if (workflow == null)
            {
                throw new KeyNotFoundException($"No active workflow found for user {userId}");
            }

            var checklistItems = await _context.Set<OnboardingChecklistItem>()
                .Where(i => i.WorkflowId == workflow.Id && i.TenantId == tenantId)
                .OrderBy(i => i.OrderIndex)
                .ToListAsync();

            return await MapToDto(workflow, checklistItems);
        }

        public async Task<List<OnboardingWorkflowDto>> GetAllWorkflowsAsync(Guid tenantId, OnboardingWorkflowStatus? status = null)
        {
            var query = _context.Set<OnboardingWorkflow>()
                .Where(w => w.TenantId == tenantId);

            if (status.HasValue)
            {
                query = query.Where(w => w.Status == status.Value);
            }

            var workflows = await query.OrderByDescending(w => w.CreatedAt).ToListAsync();

            var dtos = new List<OnboardingWorkflowDto>();
            foreach (var workflow in workflows)
            {
                var checklistItems = await _context.Set<OnboardingChecklistItem>()
                    .Where(i => i.WorkflowId == workflow.Id && i.TenantId == tenantId)
                    .OrderBy(i => i.OrderIndex)
                    .ToListAsync();

                dtos.Add(await MapToDto(workflow, checklistItems));
            }

            return dtos;
        }

        public async Task<OnboardingWorkflowDto> UpdateProgressAsync(Guid workflowId, UpdateProgressRequest request, Guid tenantId, Guid updatedByUserId)
        {
            var workflow = await _context.Set<OnboardingWorkflow>()
                .FirstOrDefaultAsync(w => w.Id == workflowId && w.TenantId == tenantId);

            if (workflow == null)
            {
                throw new KeyNotFoundException($"Workflow with ID {workflowId} not found");
            }

            workflow.ProgressPercentage = Math.Clamp(request.ProgressPercentage, 0, 100);
            workflow.Notes = request.Notes;
            workflow.UpdatedAt = DateTime.UtcNow;
            workflow.UpdatedByUserId = updatedByUserId;

            // Auto-complete workflow if progress reaches 100%
            if (workflow.ProgressPercentage == 100 && workflow.Status != OnboardingWorkflowStatus.Completed)
            {
                workflow.Status = OnboardingWorkflowStatus.Completed;
                workflow.ActualCompletionDate = DateTime.UtcNow;
                _logger.LogInformation($"Workflow {workflowId} auto-completed at 100% progress");
            }

            await _context.SaveChangesAsync();

            return await GetWorkflowByIdAsync(workflowId, tenantId);
        }

        public async Task<OnboardingWorkflowDto> CancelWorkflowAsync(Guid workflowId, Guid tenantId, Guid cancelledByUserId)
        {
            var workflow = await _context.Set<OnboardingWorkflow>()
                .FirstOrDefaultAsync(w => w.Id == workflowId && w.TenantId == tenantId);

            if (workflow == null)
            {
                throw new KeyNotFoundException($"Workflow with ID {workflowId} not found");
            }

            workflow.Status = OnboardingWorkflowStatus.Cancelled;
            workflow.UpdatedAt = DateTime.UtcNow;
            workflow.UpdatedByUserId = cancelledByUserId;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Workflow {workflowId} cancelled by user {cancelledByUserId}");

            return await GetWorkflowByIdAsync(workflowId, tenantId);
        }

        public async Task<ChecklistItemDto> CompleteChecklistItemAsync(Guid workflowId, Guid itemId, CompleteChecklistItemRequest request, Guid tenantId, Guid completedByUserId)
        {
            var item = await _context.Set<OnboardingChecklistItem>()
                .FirstOrDefaultAsync(i => i.Id == itemId && i.WorkflowId == workflowId && i.TenantId == tenantId);

            if (item == null)
            {
                throw new KeyNotFoundException($"Checklist item with ID {itemId} not found");
            }

            item.Status = ChecklistItemStatus.Completed;
            item.CompletedAt = DateTime.UtcNow;
            item.CompletedByUserId = completedByUserId;
            item.CompletionNotes = request.CompletionNotes;
            item.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Recalculate workflow progress
            await RecalculateProgressAsync(workflowId, tenantId);

            _logger.LogInformation($"Checklist item {itemId} completed in workflow {workflowId}");

            // Get completed by user name
            var completedByUser = await _context.Users.FindAsync(completedByUserId);

            return new ChecklistItemDto
            {
                Id = item.Id,
                Title = item.Title,
                Description = item.Description,
                Status = item.Status.ToString(),
                OrderIndex = item.OrderIndex,
                IsRequired = item.IsRequired,
                DueDate = item.DueDate,
                CompletedAt = item.CompletedAt,
                CompletedByUserName = completedByUser?.UserName,
                CompletionNotes = item.CompletionNotes,
                Category = item.Category,
                IsOverdue = item.DueDate.HasValue && item.DueDate.Value < DateTime.UtcNow && item.Status != ChecklistItemStatus.Completed,
                DaysFromStart = item.DaysFromStart
            };
        }

        public async Task<ChecklistItemDto> SkipChecklistItemAsync(Guid workflowId, Guid itemId, Guid tenantId, Guid skippedByUserId)
        {
            var item = await _context.Set<OnboardingChecklistItem>()
                .FirstOrDefaultAsync(i => i.Id == itemId && i.WorkflowId == workflowId && i.TenantId == tenantId);

            if (item == null)
            {
                throw new KeyNotFoundException($"Checklist item with ID {itemId} not found");
            }

            if (item.IsRequired)
            {
                throw new InvalidOperationException("Cannot skip required checklist items");
            }

            item.Status = ChecklistItemStatus.Skipped;
            item.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Recalculate workflow progress
            await RecalculateProgressAsync(workflowId, tenantId);

            _logger.LogInformation($"Checklist item {itemId} skipped in workflow {workflowId}");

            return new ChecklistItemDto
            {
                Id = item.Id,
                Title = item.Title,
                Description = item.Description,
                Status = item.Status.ToString(),
                OrderIndex = item.OrderIndex,
                IsRequired = item.IsRequired,
                DueDate = item.DueDate,
                CompletedAt = item.CompletedAt,
                Category = item.Category,
                IsOverdue = false,
                DaysFromStart = item.DaysFromStart
            };
        }

        public async Task<List<ChecklistItemDto>> GetChecklistItemsAsync(Guid workflowId, Guid tenantId)
        {
            var items = await _context.Set<OnboardingChecklistItem>()
                .Where(i => i.WorkflowId == workflowId && i.TenantId == tenantId)
                .OrderBy(i => i.OrderIndex)
                .ToListAsync();

            var dtos = new List<ChecklistItemDto>();
            foreach (var item in items)
            {
                string? completedByUserName = null;
                if (item.CompletedByUserId.HasValue)
                {
                    var user = await _context.Users.FindAsync(item.CompletedByUserId.Value);
                    completedByUserName = user?.UserName;
                }

                dtos.Add(new ChecklistItemDto
                {
                    Id = item.Id,
                    Title = item.Title,
                    Description = item.Description,
                    Status = item.Status.ToString(),
                    OrderIndex = item.OrderIndex,
                    IsRequired = item.IsRequired,
                    DueDate = item.DueDate,
                    CompletedAt = item.CompletedAt,
                    CompletedByUserName = completedByUserName,
                    CompletionNotes = item.CompletionNotes,
                    Category = item.Category,
                    IsOverdue = item.DueDate.HasValue && item.DueDate.Value < DateTime.UtcNow && item.Status != ChecklistItemStatus.Completed,
                    DaysFromStart = item.DaysFromStart
                });
            }

            return dtos;
        }

        public async Task<OnboardingWorkflowDto> AssignMentorAsync(Guid workflowId, AssignMentorRequest request, Guid tenantId, Guid assignedByUserId)
        {
            var workflow = await _context.Set<OnboardingWorkflow>()
                .FirstOrDefaultAsync(w => w.Id == workflowId && w.TenantId == tenantId);

            if (workflow == null)
            {
                throw new KeyNotFoundException($"Workflow with ID {workflowId} not found");
            }

            var mentor = await _context.Users.FindAsync(request.MentorId);
            if (mentor == null)
            {
                throw new ArgumentException($"Mentor with ID {request.MentorId} not found");
            }

            workflow.MentorId = request.MentorId;
            workflow.MentorName = mentor.UserName;
            workflow.UpdatedAt = DateTime.UtcNow;
            workflow.UpdatedByUserId = assignedByUserId;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Assigned mentor {mentor.UserName} to workflow {workflowId}");

            return await GetWorkflowByIdAsync(workflowId, tenantId);
        }

        public async Task<OnboardingWorkflowDto> GrantProgressiveAccessAsync(Guid workflowId, GrantAccessRequest request, Guid tenantId, Guid grantedByUserId)
        {
            var workflow = await _context.Set<OnboardingWorkflow>()
                .FirstOrDefaultAsync(w => w.Id == workflowId && w.TenantId == tenantId);

            if (workflow == null)
            {
                throw new KeyNotFoundException($"Workflow with ID {workflowId} not found");
            }

            var now = DateTime.UtcNow;

            // Grant access based on level
            switch (request.AccessLevel)
            {
                case AccessLevel.Day1:
                    workflow.CurrentAccessLevel = AccessLevel.Day1;
                    workflow.Day1AccessGrantedAt = now;
                    _logger.LogInformation($"Granted Day 1 access to user {workflow.UserId} in workflow {workflowId}");
                    break;

                case AccessLevel.Day7:
                    if (workflow.CurrentAccessLevel < AccessLevel.Day1)
                    {
                        throw new InvalidOperationException("Must grant Day 1 access before Day 7 access");
                    }
                    workflow.CurrentAccessLevel = AccessLevel.Day7;
                    workflow.Day7AccessGrantedAt = now;
                    _logger.LogInformation($"Granted Day 7 access to user {workflow.UserId} in workflow {workflowId}");
                    break;

                case AccessLevel.Day30:
                    if (workflow.CurrentAccessLevel < AccessLevel.Day7)
                    {
                        throw new InvalidOperationException("Must grant Day 7 access before Day 30 access");
                    }
                    workflow.CurrentAccessLevel = AccessLevel.Day30;
                    workflow.Day30AccessGrantedAt = now;
                    _logger.LogInformation($"Granted Day 30 (full) access to user {workflow.UserId} in workflow {workflowId}");
                    break;

                default:
                    throw new ArgumentException($"Invalid access level: {request.AccessLevel}");
            }

            workflow.Notes += $"\n[{now:yyyy-MM-dd HH:mm:ss}] {request.AccessLevel} access granted by user {grantedByUserId}. {request.Notes}";
            workflow.UpdatedAt = now;
            workflow.UpdatedByUserId = grantedByUserId;

            await _context.SaveChangesAsync();

            return await GetWorkflowByIdAsync(workflowId, tenantId);
        }

        public async Task<AccessLevelProgress> GetAccessProgressAsync(Guid workflowId, Guid tenantId)
        {
            var workflow = await _context.Set<OnboardingWorkflow>()
                .FirstOrDefaultAsync(w => w.Id == workflowId && w.TenantId == tenantId);

            if (workflow == null)
            {
                throw new KeyNotFoundException($"Workflow with ID {workflowId} not found");
            }

            var daysSinceStart = (DateTime.UtcNow - workflow.StartDate).Days;

            var progress = new AccessLevelProgress
            {
                Day1Granted = workflow.Day1AccessGrantedAt.HasValue,
                Day1GrantedAt = workflow.Day1AccessGrantedAt,
                Day7Granted = workflow.Day7AccessGrantedAt.HasValue,
                Day7GrantedAt = workflow.Day7AccessGrantedAt,
                Day30Granted = workflow.Day30AccessGrantedAt.HasValue,
                Day30GrantedAt = workflow.Day30AccessGrantedAt
            };

            // Determine next milestone
            if (!progress.Day1Granted)
            {
                progress.NextMilestone = "Day 1 Access";
                progress.DaysUntilNextMilestone = Math.Max(0, 1 - daysSinceStart);
            }
            else if (!progress.Day7Granted)
            {
                progress.NextMilestone = "Day 7 Access";
                progress.DaysUntilNextMilestone = Math.Max(0, 7 - daysSinceStart);
            }
            else if (!progress.Day30Granted)
            {
                progress.NextMilestone = "Day 30 Full Access";
                progress.DaysUntilNextMilestone = Math.Max(0, 30 - daysSinceStart);
            }
            else
            {
                progress.NextMilestone = "All milestones completed";
                progress.DaysUntilNextMilestone = 0;
            }

            return progress;
        }

        public async Task<OnboardingStatsDto> GetOnboardingStatsAsync(Guid tenantId)
        {
            var workflows = await _context.Set<OnboardingWorkflow>()
                .Where(w => w.TenantId == tenantId)
                .ToListAsync();

            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1);

            var stats = new OnboardingStatsDto
            {
                TotalActiveWorkflows = workflows.Count(w => w.Status == OnboardingWorkflowStatus.InProgress),
                CompletedThisMonth = workflows.Count(w => w.Status == OnboardingWorkflowStatus.Completed && w.ActualCompletionDate >= startOfMonth),
                OverdueWorkflows = workflows.Count(w => w.Status == OnboardingWorkflowStatus.InProgress && w.ExpectedCompletionDate.HasValue && w.ExpectedCompletionDate.Value < now),
                AverageCompletionDays = (int)workflows
                    .Where(w => w.Status == OnboardingWorkflowStatus.Completed && w.ActualCompletionDate.HasValue)
                    .Select(w => (w.ActualCompletionDate!.Value - w.StartDate).Days)
                    .DefaultIfEmpty(0)
                    .Average(),
                StatusBreakdown = workflows.GroupBy(w => w.Status.ToString())
                    .ToDictionary(g => g.Key, g => g.Count()),
                AccessLevelBreakdown = workflows.GroupBy(w => w.CurrentAccessLevel.ToString())
                    .ToDictionary(g => g.Key, g => g.Count())
            };

            // Get recent workflows (last 10)
            var recentWorkflows = workflows
                .OrderByDescending(w => w.CreatedAt)
                .Take(10)
                .ToList();

            foreach (var workflow in recentWorkflows)
            {
                var checklistItems = await _context.Set<OnboardingChecklistItem>()
                    .Where(i => i.WorkflowId == workflow.Id && i.TenantId == tenantId)
                    .OrderBy(i => i.OrderIndex)
                    .ToListAsync();

                stats.RecentWorkflows.Add(await MapToDto(workflow, checklistItems));
            }

            return stats;
        }

        // ==================== PRIVATE HELPER METHODS ====================

        private async Task RecalculateProgressAsync(Guid workflowId, Guid tenantId)
        {
            var items = await _context.Set<OnboardingChecklistItem>()
                .Where(i => i.WorkflowId == workflowId && i.TenantId == tenantId)
                .ToListAsync();

            if (items.Count == 0) return;

            var completedCount = items.Count(i => i.Status == ChecklistItemStatus.Completed || i.Status == ChecklistItemStatus.Skipped);
            var progressPercentage = (int)Math.Round((double)completedCount / items.Count * 100);

            var workflow = await _context.Set<OnboardingWorkflow>()
                .FirstOrDefaultAsync(w => w.Id == workflowId && w.TenantId == tenantId);

            if (workflow != null)
            {
                workflow.ProgressPercentage = progressPercentage;
                workflow.UpdatedAt = DateTime.UtcNow;

                // Auto-complete if all items done
                if (progressPercentage == 100 && workflow.Status == OnboardingWorkflowStatus.InProgress)
                {
                    workflow.Status = OnboardingWorkflowStatus.Completed;
                    workflow.ActualCompletionDate = DateTime.UtcNow;
                    _logger.LogInformation($"Workflow {workflowId} auto-completed - all checklist items done");
                }

                await _context.SaveChangesAsync();
            }
        }

        private async Task<OnboardingWorkflowDto> MapToDto(OnboardingWorkflow workflow, List<OnboardingChecklistItem> checklistItems)
        {
            var totalItems = checklistItems.Count;
            var completedItems = checklistItems.Count(i => i.Status == ChecklistItemStatus.Completed);
            var pendingItems = checklistItems.Count(i => i.Status == ChecklistItemStatus.Pending || i.Status == ChecklistItemStatus.InProgress);
            var overdueItems = checklistItems.Count(i => i.DueDate.HasValue && i.DueDate.Value < DateTime.UtcNow && i.Status != ChecklistItemStatus.Completed && i.Status != ChecklistItemStatus.Skipped);

            var checklistItemDtos = new List<ChecklistItemDto>();
            foreach (var item in checklistItems)
            {
                string? completedByUserName = null;
                if (item.CompletedByUserId.HasValue)
                {
                    var user = await _context.Users.FindAsync(item.CompletedByUserId.Value);
                    completedByUserName = user?.UserName;
                }

                checklistItemDtos.Add(new ChecklistItemDto
                {
                    Id = item.Id,
                    Title = item.Title,
                    Description = item.Description,
                    Status = item.Status.ToString(),
                    OrderIndex = item.OrderIndex,
                    IsRequired = item.IsRequired,
                    DueDate = item.DueDate,
                    CompletedAt = item.CompletedAt,
                    CompletedByUserName = completedByUserName,
                    CompletionNotes = item.CompletionNotes,
                    Category = item.Category,
                    IsOverdue = item.DueDate.HasValue && item.DueDate.Value < DateTime.UtcNow && item.Status != ChecklistItemStatus.Completed,
                    DaysFromStart = item.DaysFromStart
                });
            }

            var accessProgress = await GetAccessProgressAsync(workflow.Id, workflow.TenantId);

            return new OnboardingWorkflowDto
            {
                Id = workflow.Id,
                UserId = workflow.UserId,
                UserName = workflow.UserName,
                WorkflowName = workflow.WorkflowName,
                Status = workflow.Status.ToString(),
                StartDate = workflow.StartDate,
                ExpectedCompletionDate = workflow.ExpectedCompletionDate,
                ActualCompletionDate = workflow.ActualCompletionDate,
                ProgressPercentage = workflow.ProgressPercentage,
                MentorId = workflow.MentorId,
                MentorName = workflow.MentorName,
                CurrentAccessLevel = workflow.CurrentAccessLevel.ToString(),
                AccessProgress = accessProgress,
                ChecklistItems = checklistItemDtos,
                TotalItems = totalItems,
                CompletedItems = completedItems,
                PendingItems = pendingItems,
                OverdueItems = overdueItems,
                Notes = workflow.Notes,
                CreatedAt = workflow.CreatedAt
            };
        }
    }
}
