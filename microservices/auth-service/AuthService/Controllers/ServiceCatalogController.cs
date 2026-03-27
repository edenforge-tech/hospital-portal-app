using AuthService.DTOs.Billing;
using AuthService.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous] // Global catalog — no tenant context needed
public class ServiceCatalogController : ControllerBase
{
    private readonly IServiceCatalogService _serviceCatalogService;
    private readonly ILogger<ServiceCatalogController> _logger;

    public ServiceCatalogController(
        IServiceCatalogService serviceCatalogService,
        ILogger<ServiceCatalogController> logger)
    {
        _serviceCatalogService = serviceCatalogService;
        _logger = logger;
    }

    /// <summary>Full catalog tree: categories → services → variants</summary>
    [HttpGet("full")]
    public async Task<ActionResult<FullCatalogResponse>> GetFull()
    {
        try
        {
            var catalog = await _serviceCatalogService.GetFullCatalogAsync();
            return Ok(catalog);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving full service catalog");
            return StatusCode(500, new { error = "Failed to retrieve catalog" });
        }
    }

    /// <summary>Flat list of active categories</summary>
    [HttpGet("categories")]
    public async Task<ActionResult<List<ServiceCategoryDto>>> GetCategories()
    {
        try
        {
            var cats = await _serviceCatalogService.GetCategoriesAsync();
            return Ok(cats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving categories");
            return StatusCode(500, new { error = "Failed to retrieve categories" });
        }
    }

    /// <summary>IOL options available for a given service variant</summary>
    [HttpGet("variants/{variantId}/iol")]
    public async Task<ActionResult<List<IolMasterDto>>> GetVariantIolOptions(Guid variantId)
    {
        try
        {
            var iolOptions = await _serviceCatalogService.GetVariantIolOptionsAsync(variantId);
            return Ok(iolOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving IOL options for variant {VariantId}", variantId);
            return StatusCode(500, new { error = "Failed to retrieve IOL options" });
        }
    }

    /// <summary>Branch-specific price overrides for variants</summary>
    [HttpGet("branch/{branchId}/pricing")]
    [Authorize]
    public async Task<ActionResult<List<BranchVariantPricingDto>>> GetBranchPricing(Guid branchId)
    {
        try
        {
            var pricing = await _serviceCatalogService.GetBranchPricingAsync(branchId);
            return Ok(pricing);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving branch pricing for branch {BranchId}", branchId);
            return StatusCode(500, new { error = "Failed to retrieve branch pricing" });
        }
    }
}
