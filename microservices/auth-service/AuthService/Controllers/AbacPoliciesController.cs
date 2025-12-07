using AuthService.Authorization.Policies;
using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AbacPoliciesController : ControllerBase
    {
        private readonly IAbacPolicyHandler _policyHandler;
        private readonly AppDbContext _context;

        public AbacPoliciesController(IAbacPolicyHandler policyHandler, AppDbContext context)
        {
            _policyHandler = policyHandler;
            _context = context;
        }

        /// <summary>
        /// Evaluate a policy for the current user
        /// </summary>
        [HttpPost("evaluate")]
        public async Task<IActionResult> EvaluatePolicy([FromBody] EvaluatePolicyRequest request)
        {
            var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());

            var context = new PolicyEvaluationContext
            {
                UserId = userId,
                CurrentTime = DateTime.UtcNow,
                IPAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "",
                Location = request.Location ?? "",
                Attributes = request.Attributes ?? new Dictionary<string, object>(),
                RiskScore = request.RiskScore ?? 0
            };

            var decision = await _policyHandler.EvaluatePolicyAsync(request.PolicyId, context);
            return Ok(new { decision });
        }

        /// <summary>
        /// Evaluate all applicable policies for an action
        /// </summary>
        [HttpPost("evaluate-all")]
        public async Task<IActionResult> EvaluateAllPolicies([FromBody] EvaluateAllRequest request)
        {
            var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());

            var context = new PolicyEvaluationContext
            {
                UserId = userId,
                CurrentTime = DateTime.UtcNow,
                IPAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "",
                Location = request.Location ?? "",
                Attributes = request.Attributes ?? new Dictionary<string, object>(),
                RiskScore = request.RiskScore ?? 0
            };

            var finalDecision = await _policyHandler.EvaluateAllPoliciesAsync(
                userId,
                request.Action,
                request.Resource,
                context
            );

            return Ok(new { decision = finalDecision });
        }

        /// <summary>
        /// Get all applicable policies for a user action
        /// </summary>
        [HttpGet("applicable")]
        public async Task<IActionResult> GetApplicablePolicies(
            [FromQuery] string? action,
            [FromQuery] string? resource)
        {
            var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());

            var policies = await _policyHandler.GetApplicablePoliciesAsync(
                userId,
                action ?? "",
                resource ?? ""
            );

            return Ok(new { policies });
        }

        /// <summary>
        /// Get all policies (admin only)
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllPolicies([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var query = _context.AccessPolicies
                .Where(p => p.DeletedAt == null)
                .OrderByDescending(p => p.Priority)
                .ThenBy(p => p.PolicyName);

            var total = await query.CountAsync();
            var policies = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new { policies, total, page, pageSize });
        }

        /// <summary>
        /// Get a specific policy by ID (admin only)
        /// </summary>
        [HttpGet("{policyId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPolicy(Guid policyId)
        {
            var policy = await _context.AccessPolicies
                .Where(p => p.Id == policyId && p.DeletedAt == null)
                .FirstOrDefaultAsync();

            if (policy == null)
                return NotFound(new { message = "Policy not found" });

            return Ok(new { policy });
        }

        /// <summary>
        /// Create a new policy (admin only)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreatePolicy([FromBody] CreatePolicyRequest request)
        {
            var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());
            var tenantId = Guid.Parse(User.FindFirst("tenant_id")?.Value ?? throw new UnauthorizedAccessException());

            var policy = new AccessPolicy
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                PolicyName = request.Name,
                Description = request.Description,
                Effect = request.Effect,
                Priority = request.Priority,
                Actions = request.Actions,
                Resources = request.Resources,
                Conditions = request.Conditions,
                AppliesToRoles = request.AppliesToRoles,
                AppliesToDepartments = request.AppliesToDepartments,
                AppliesToUsers = request.AppliesToUsers,
                EffectiveFrom = request.EffectiveFrom,
                EffectiveUntil = request.EffectiveTo,
                IsActive = request.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Status = "active"
            };

            _context.AccessPolicies.Add(policy);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPolicy), new { policyId = policy.Id }, new { policy });
        }

        /// <summary>
        /// Update a policy (admin only)
        /// </summary>
        [HttpPut("{policyId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdatePolicy(Guid policyId, [FromBody] UpdatePolicyRequest request)
        {
            var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());

            var policy = await _context.AccessPolicies
                .Where(p => p.Id == policyId && p.DeletedAt == null)
                .FirstOrDefaultAsync();

            if (policy == null)
                return NotFound(new { message = "Policy not found" });

            policy.PolicyName = request.Name ?? policy.PolicyName;
            policy.Description = request.Description ?? policy.Description;
            policy.Effect = request.Effect ?? policy.Effect;
            policy.Priority = request.Priority ?? policy.Priority;
            policy.Actions = request.Actions ?? policy.Actions;
            policy.Resources = request.Resources ?? policy.Resources;
            policy.Conditions = request.Conditions ?? policy.Conditions;
            policy.AppliesToRoles = request.AppliesToRoles ?? policy.AppliesToRoles;
            policy.AppliesToDepartments = request.AppliesToDepartments ?? policy.AppliesToDepartments;
            policy.AppliesToUsers = request.AppliesToUsers ?? policy.AppliesToUsers;
            policy.EffectiveFrom = request.EffectiveFrom ?? policy.EffectiveFrom;
            policy.EffectiveUntil = request.EffectiveTo ?? policy.EffectiveUntil;
            policy.IsActive = request.IsActive ?? policy.IsActive;
            policy.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { policy });
        }

        /// <summary>
        /// Delete a policy (soft delete - admin only)
        /// </summary>
        [HttpDelete("{policyId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletePolicy(Guid policyId)
        {
            var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());

            var policy = await _context.AccessPolicies
                .Where(p => p.Id == policyId && p.DeletedAt == null)
                .FirstOrDefaultAsync();

            if (policy == null)
                return NotFound(new { message = "Policy not found" });

            policy.DeletedAt = DateTime.UtcNow;
            policy.UpdatedAt = DateTime.UtcNow;
            policy.Status = "deleted";

            await _context.SaveChangesAsync();

            return Ok(new { message = "Policy deleted successfully" });
        }
    }

    public class EvaluatePolicyRequest
    {
        public Guid PolicyId { get; set; }
        public string? Location { get; set; }
        public Dictionary<string, object>? Attributes { get; set; }
        public int? RiskScore { get; set; }
    }

    public class EvaluateAllRequest
    {
        public string Action { get; set; } = string.Empty;
        public string Resource { get; set; } = string.Empty;
        public string? Location { get; set; }
        public Dictionary<string, object>? Attributes { get; set; }
        public int? RiskScore { get; set; }
    }

    public class CreatePolicyRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Effect { get; set; } = "deny";
        public int Priority { get; set; } = 100;
        public string Actions { get; set; } = "[]";
        public string Resources { get; set; } = "[]";
        public string Conditions { get; set; } = "{}";
        public string? AppliesToRoles { get; set; }
        public string? AppliesToDepartments { get; set; }
        public string? AppliesToUsers { get; set; }
        public DateTime? EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
        public bool IsActive { get; set; } = true;
        public bool RequiresMFA { get; set; } = false;
    }

    public class UpdatePolicyRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Effect { get; set; }
        public int? Priority { get; set; }
        public string? Actions { get; set; }
        public string? Resources { get; set; }
        public string? Conditions { get; set; }
        public string? AppliesToRoles { get; set; }
        public string? AppliesToDepartments { get; set; }
        public string? AppliesToUsers { get; set; }
        public DateTime? EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
        public bool? IsActive { get; set; }
        public bool? RequiresMFA { get; set; }
    }
}
