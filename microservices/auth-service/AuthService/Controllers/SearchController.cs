using AuthService.Models.Search;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace AuthService.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SearchController : ControllerBase
    {
        private readonly ISearchService _searchService;
        private readonly ILogger<SearchController> _logger;

        public SearchController(ISearchService searchService, ILogger<SearchController> logger)
        {
            _searchService = searchService;
            _logger = logger;
        }

        /// <summary>
        /// Execute a dynamic search
        /// </summary>
        [HttpPost("execute")]
        public async Task<ActionResult<SearchResultDto>> ExecuteSearch([FromBody] ExecuteSearchRequest request)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException("TenantId not found"));
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException("UserId not found"));

                var result = await _searchService.ExecuteSearchAsync(request, tenantId, userId);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid search request");
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing search");
                return StatusCode(500, new { error = "An error occurred while executing the search" });
            }
        }

        /// <summary>
        /// Save a search for later use
        /// </summary>
        [HttpPost("save")]
        public async Task<ActionResult<SavedSearchDto>> SaveSearch([FromBody] CreateSavedSearchRequest request)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException("TenantId not found"));
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException("UserId not found"));

                var result = await _searchService.SaveSearchAsync(request, tenantId, userId);
                return CreatedAtAction(nameof(GetSavedSearch), new { id = result.Id }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving search");
                return StatusCode(500, new { error = "An error occurred while saving the search" });
            }
        }

        /// <summary>
        /// Get saved search by ID
        /// </summary>
        [HttpGet("saved/{id}")]
        public async Task<ActionResult<SavedSearchDto>> GetSavedSearch(Guid id)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException("TenantId not found"));
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException("UserId not found"));

                var search = await _searchService.GetSavedSearchByIdAsync(id, userId, tenantId);

                if (search == null)
                {
                    return NotFound(new { error = "Saved search not found" });
                }

                return Ok(search);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving saved search {SearchId}", id);
                return StatusCode(500, new { error = "An error occurred while retrieving the search" });
            }
        }

        /// <summary>
        /// Get user's saved searches
        /// </summary>
        [HttpGet("saved")]
        public async Task<ActionResult> GetUserSavedSearches([FromQuery] SearchScope? scope = null)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException("TenantId not found"));
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException("UserId not found"));

                var searches = await _searchService.GetUserSavedSearchesAsync(userId, tenantId, scope);
                return Ok(searches);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving saved searches");
                return StatusCode(500, new { error = "An error occurred while retrieving saved searches" });
            }
        }

        /// <summary>
        /// Get predefined search presets
        /// </summary>
        [HttpGet("presets")]
        public async Task<ActionResult> GetSearchPresets([FromQuery] SearchScope? scope = null)
        {
            try
            {
                var presets = await _searchService.GetSearchPresetsAsync(scope);
                return Ok(presets);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving search presets");
                return StatusCode(500, new { error = "An error occurred while retrieving search presets" });
            }
        }

        /// <summary>
        /// Delete a saved search
        /// </summary>
        [HttpDelete("saved/{id}")]
        public async Task<ActionResult> DeleteSavedSearch(Guid id)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException("TenantId not found"));
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException("UserId not found"));

                var result = await _searchService.DeleteSavedSearchAsync(id, userId, tenantId);

                if (!result)
                {
                    return NotFound(new { error = "Saved search not found" });
                }

                return Ok(new { message = "Search deleted successfully" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting saved search {SearchId}", id);
                return StatusCode(500, new { error = "An error occurred while deleting the search" });
            }
        }

        /// <summary>
        /// Update favorite status of a saved search
        /// </summary>
        [HttpPut("saved/{id}/favorite")]
        public async Task<ActionResult> UpdateFavoriteStatus(Guid id, [FromBody] UpdateFavoriteRequest request)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException("TenantId not found"));
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException("UserId not found"));

                var result = await _searchService.UpdateFavoriteStatusAsync(id, request.IsFavorite, userId, tenantId);

                if (!result)
                {
                    return NotFound(new { error = "Saved search not found" });
                }

                return Ok(new { message = "Favorite status updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating favorite status for search {SearchId}", id);
                return StatusCode(500, new { error = "An error occurred while updating the favorite status" });
            }
        }

        /// <summary>
        /// Execute a saved search
        /// </summary>
        [HttpPost("saved/{id}/execute")]
        public async Task<ActionResult<SearchResultDto>> ExecuteSavedSearch(Guid id, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException("TenantId not found"));
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException("UserId not found"));

                var result = await _searchService.ExecuteSavedSearchAsync(id, pageNumber, pageSize, userId, tenantId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing saved search {SearchId}", id);
                return StatusCode(500, new { error = "An error occurred while executing the saved search" });
            }
        }
    }
}
