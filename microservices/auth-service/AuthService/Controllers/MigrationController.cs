using AuthService.Context;
using AuthService.Scripts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MigrationController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<MigrationController> _logger;

    public MigrationController(AppDbContext context, ILogger<MigrationController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Add 8 missing departments to all tenants
    /// </summary>
    [HttpPost("add-missing-departments")]
    [AllowAnonymous] // Remove this and add [Authorize] for production
    public async Task<IActionResult> AddMissingDepartmentsEndpoint()
    {
        try
        {
            _logger.LogInformation("Starting migration to add 8 missing departments");
            
            await Scripts.AddMissingDepartments.ExecuteAsync(_context);
            
            _logger.LogInformation("Migration completed successfully");
            
            return Ok(new 
            { 
                success = true, 
                message = "Migration completed successfully. Check server logs for details." 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Migration failed");
            return StatusCode(500, new 
            { 
                success = false, 
                message = "Migration failed", 
                error = ex.Message 
            });
        }
    }
}
