using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace AuthService.Authorization.Policies
{
    /// <summary>
    /// Context for ABAC policy evaluation containing all relevant attributes
    /// </summary>
    public class PolicyEvaluationContext
    {
        public Guid UserId { get; set; }
        public DateTime CurrentTime { get; set; } = DateTime.UtcNow;
        public string IPAddress { get; set; } = string.Empty;
        public string? Location { get; set; }
        public Dictionary<string, object> Attributes { get; set; } = new();
        public int RiskScore { get; set; } = 0;
    }

    /// <summary>
    /// Result of policy evaluation
    /// </summary>
    public class PolicyDecision
    {
        public bool IsAllowed { get; set; }
        public string Effect { get; set; } = "Deny"; // Allow or Deny
        public int Priority { get; set; }
        public string? PolicyName { get; set; }
        public string? Reason { get; set; }
    }

    public interface IAbacPolicyHandler
    {
        Task<bool> EvaluatePolicyAsync(Guid policyId, PolicyEvaluationContext context);
        Task<List<AccessPolicy>> GetApplicablePoliciesAsync(Guid userId, string action, string resource);
        Task<PolicyDecision> EvaluateAllPoliciesAsync(Guid userId, string action, string resource, PolicyEvaluationContext context);
        Task<bool> CheckTimeConstraintsAsync(AccessPolicy policy, DateTime currentTime);
        Task<bool> CheckLocationConstraintsAsync(AccessPolicy policy, string ipAddress);
        Task<bool> CheckContextConstraintsAsync(AccessPolicy policy, Dictionary<string, object> context);
        PolicyDecision ResolveConflicts(List<PolicyDecision> decisions);
    }

    public class AbacPolicyHandler : IAbacPolicyHandler
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AbacPolicyHandler(AppDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        private Guid GetCurrentTenantId()
        {
            var tenantId = _httpContextAccessor?.HttpContext?.Items["TenantId"] as Guid?;
            return tenantId ?? Guid.Parse("11111111-1111-1111-1111-111111111111");
        }

        public async Task<bool> EvaluatePolicyAsync(Guid policyId, PolicyEvaluationContext context)
        {
            var policy = await _context.AccessPolicies.FindAsync(policyId);
            if (policy == null || !policy.IsActive)
                return false;

            // Check if policy is within effective date range
            if (policy.EffectiveFrom.HasValue && context.CurrentTime < policy.EffectiveFrom.Value)
                return false;

            if (policy.EffectiveUntil.HasValue && context.CurrentTime > policy.EffectiveUntil.Value)
                return false;

            // Check time constraints
            if (!await CheckTimeConstraintsAsync(policy, context.CurrentTime))
                return false;

            // Check location constraints
            if (!await CheckLocationConstraintsAsync(policy, context.IPAddress))
                return false;

            // Check context constraints
            if (!await CheckContextConstraintsAsync(policy, context.Attributes))
                return false;

            // Update evaluation count
            policy.EvaluationCount++;
            policy.LastEvaluatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return policy.Effect == "Allow";
        }

        public async Task<List<AccessPolicy>> GetApplicablePoliciesAsync(Guid userId, string action, string resource)
        {
            var tenantId = GetCurrentTenantId();

            // Get user's roles and departments
            var userRoles = await _context.UserRoles
                .Where(ur => ur.UserId == userId)
                .Select(ur => ur.RoleId.ToString())
                .ToListAsync();

            var userDepartments = await _context.UserDepartments
                .Where(ud => ud.UserId == userId && ud.AccessType == "Primary")
                .Select(ud => ud.DepartmentId.ToString())
                .ToListAsync();

            // Get all active policies for this tenant
            var allPolicies = await _context.AccessPolicies
                .Where(p => p.TenantId == tenantId && p.IsActive)
                .ToListAsync();

            var applicablePolicies = new List<AccessPolicy>();

            foreach (var policy in allPolicies)
            {
                // Check if policy applies to this user
                bool appliesToUser = false;

                // Check if applies to specific users
                if (!string.IsNullOrEmpty(policy.AppliesToUsers))
                {
                    try
                    {
                        var userList = JsonSerializer.Deserialize<List<string>>(policy.AppliesToUsers);
                        if (userList != null && userList.Contains(userId.ToString()))
                            appliesToUser = true;
                    }
                    catch { }
                }

                // Check if applies to user's roles
                if (!appliesToUser && !string.IsNullOrEmpty(policy.AppliesToRoles))
                {
                    try
                    {
                        var roleList = JsonSerializer.Deserialize<List<string>>(policy.AppliesToRoles);
                        if (roleList != null && roleList.Any(r => userRoles.Contains(r)))
                            appliesToUser = true;
                    }
                    catch { }
                }

                // Check if applies to user's departments
                if (!appliesToUser && !string.IsNullOrEmpty(policy.AppliesToDepartments))
                {
                    try
                    {
                        var deptList = JsonSerializer.Deserialize<List<string>>(policy.AppliesToDepartments);
                        if (deptList != null && deptList.Any(d => userDepartments.Contains(d)))
                            appliesToUser = true;
                    }
                    catch { }
                }

                if (!appliesToUser)
                    continue;

                // Check if policy applies to this action
                if (!string.IsNullOrEmpty(policy.Actions))
                {
                    try
                    {
                        var actionList = JsonSerializer.Deserialize<List<string>>(policy.Actions);
                        if (actionList != null && !actionList.Contains(action) && !actionList.Contains("*"))
                            continue;
                    }
                    catch { continue; }
                }

                // Check if policy applies to this resource
                if (!string.IsNullOrEmpty(policy.Resources))
                {
                    try
                    {
                        var resourceList = JsonSerializer.Deserialize<List<string>>(policy.Resources);
                        if (resourceList != null)
                        {
                            bool matchesResource = false;
                            foreach (var resourcePattern in resourceList)
                            {
                                if (resourcePattern == "*" || 
                                    resource.StartsWith(resourcePattern.TrimEnd('*')) ||
                                    resource == resourcePattern)
                                {
                                    matchesResource = true;
                                    break;
                                }
                            }
                            if (!matchesResource)
                                continue;
                        }
                    }
                    catch { continue; }
                }

                applicablePolicies.Add(policy);
            }

            // Sort by priority (higher priority first)
            return applicablePolicies.OrderByDescending(p => p.Priority).ToList();
        }

        public async Task<PolicyDecision> EvaluateAllPoliciesAsync(Guid userId, string action, string resource, PolicyEvaluationContext context)
        {
            var applicablePolicies = await GetApplicablePoliciesAsync(userId, action, resource);

            if (!applicablePolicies.Any())
            {
                // No policies found - default deny
                return new PolicyDecision
                {
                    IsAllowed = false,
                    Effect = "Deny",
                    Priority = 0,
                    Reason = "No applicable policies found"
                };
            }

            var decisions = new List<PolicyDecision>();

            foreach (var policy in applicablePolicies)
            {
                bool policyPasses = await EvaluatePolicyAsync(policy.Id, context);

                decisions.Add(new PolicyDecision
                {
                    IsAllowed = policyPasses && policy.Effect == "Allow",
                    Effect = policy.Effect ?? "Deny",
                    Priority = policy.Priority,
                    PolicyName = policy.PolicyName,
                    Reason = policyPasses ? $"Policy '{policy.PolicyName}' passed" : $"Policy '{policy.PolicyName}' failed"
                });
            }

            return ResolveConflicts(decisions);
        }

        public async Task<bool> CheckTimeConstraintsAsync(AccessPolicy policy, DateTime currentTime)
        {
            // Check day of week constraint
            if (!string.IsNullOrEmpty(policy.DaysOfWeek))
            {
                try
                {
                    var allowedDays = JsonSerializer.Deserialize<List<string>>(policy.DaysOfWeek);
                    if (allowedDays != null && allowedDays.Any())
                    {
                        var currentDay = currentTime.DayOfWeek.ToString();
                        if (!allowedDays.Contains(currentDay))
                            return false;
                    }
                }
                catch { }
            }

            // Check time of day constraint
            if (policy.TimeOfDayStart.HasValue && policy.TimeOfDayEnd.HasValue)
            {
                var currentTimeOfDay = currentTime.TimeOfDay;
                var startTime = policy.TimeOfDayStart.Value;
                var endTime = policy.TimeOfDayEnd.Value;

                // Handle cases where end time is before start time (crosses midnight)
                if (endTime < startTime)
                {
                    if (!(currentTimeOfDay >= startTime || currentTimeOfDay <= endTime))
                        return false;
                }
                else
                {
                    if (currentTimeOfDay < startTime || currentTimeOfDay > endTime)
                        return false;
                }
            }

            return await Task.FromResult(true);
        }

        public async Task<bool> CheckLocationConstraintsAsync(AccessPolicy policy, string ipAddress)
        {
            // Check conditions for location-based constraints
            if (!string.IsNullOrEmpty(policy.Conditions))
            {
                try
                {
                    var conditions = JsonSerializer.Deserialize<Dictionary<string, object>>(policy.Conditions);
                    if (conditions != null)
                    {
                        // Check if IP whitelist exists
                        if (conditions.ContainsKey("allowedIPs"))
                        {
                            var allowedIPs = JsonSerializer.Deserialize<List<string>>(conditions["allowedIPs"].ToString() ?? "[]");
                            if (allowedIPs != null && allowedIPs.Any())
                            {
                                if (!allowedIPs.Contains(ipAddress))
                                    return false;
                            }
                        }

                        // Check if IP blacklist exists
                        if (conditions.ContainsKey("blockedIPs"))
                        {
                            var blockedIPs = JsonSerializer.Deserialize<List<string>>(conditions["blockedIPs"].ToString() ?? "[]");
                            if (blockedIPs != null && blockedIPs.Contains(ipAddress))
                                return false;
                        }
                    }
                }
                catch { }
            }

            return await Task.FromResult(true);
        }

        public async Task<bool> CheckContextConstraintsAsync(AccessPolicy policy, Dictionary<string, object> context)
        {
            // Check conditions for context-based constraints
            if (!string.IsNullOrEmpty(policy.Conditions))
            {
                try
                {
                    var conditions = JsonSerializer.Deserialize<Dictionary<string, object>>(policy.Conditions);
                    if (conditions != null)
                    {
                        foreach (var condition in conditions)
                        {
                            // Skip IP-related conditions (handled by CheckLocationConstraintsAsync)
                            if (condition.Key == "allowedIPs" || condition.Key == "blockedIPs")
                                continue;

                            // Check if context has this attribute
                            if (!context.ContainsKey(condition.Key))
                                return false;

                            // Check if context value matches condition value
                            var contextValue = context[condition.Key]?.ToString() ?? "";
                            var conditionValue = condition.Value?.ToString() ?? "";

                            if (contextValue != conditionValue)
                                return false;
                        }
                    }
                }
                catch { }
            }

            return await Task.FromResult(true);
        }

        public PolicyDecision ResolveConflicts(List<PolicyDecision> decisions)
        {
            if (!decisions.Any())
            {
                return new PolicyDecision
                {
                    IsAllowed = false,
                    Effect = "Deny",
                    Priority = 0,
                    Reason = "No policies evaluated"
                };
            }

            // DENY-OVERRIDE: If any policy denies, the final decision is deny
            var denyDecision = decisions.FirstOrDefault(d => d.Effect == "Deny" && !d.IsAllowed);
            if (denyDecision != null)
            {
                return new PolicyDecision
                {
                    IsAllowed = false,
                    Effect = "Deny",
                    Priority = denyDecision.Priority,
                    PolicyName = denyDecision.PolicyName,
                    Reason = $"Access denied by policy '{denyDecision.PolicyName}' (deny-override)"
                };
            }

            // If no deny, check for allow policies
            var allowDecision = decisions
                .Where(d => d.Effect == "Allow" && d.IsAllowed)
                .OrderByDescending(d => d.Priority)
                .FirstOrDefault();

            if (allowDecision != null)
            {
                return new PolicyDecision
                {
                    IsAllowed = true,
                    Effect = "Allow",
                    Priority = allowDecision.Priority,
                    PolicyName = allowDecision.PolicyName,
                    Reason = $"Access allowed by policy '{allowDecision.PolicyName}'"
                };
            }

            // Default deny if no explicit allow
            return new PolicyDecision
            {
                IsAllowed = false,
                Effect = "Deny",
                Priority = 0,
                Reason = "No policy explicitly allowed access (default deny)"
            };
        }
    }
}
