using AuthService.DTOs;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace AuthService.Controllers
{
    /// <summary>
    /// Controller for managing IOL (Intraocular Lens) inventory and stock
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class IOLInventoryController : ControllerBase
    {
        private readonly IIOLInventoryService _iolInventoryService;

        public IOLInventoryController(IIOLInventoryService iolInventoryService)
        {
            _iolInventoryService = iolInventoryService;
        }

        /// <summary>
        /// Get all IOL inventory items with pagination and filters
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50,
            [FromQuery] string? search = null,
            [FromQuery] string? type = null,
            [FromQuery] string? manufacturer = null,
            [FromQuery] bool? lowStock = null,
            [FromQuery] Guid? branchId = null)
        {
            try
            {
                var result = await _iolInventoryService.GetAllAsync(page, pageSize, search, type, manufacturer, lowStock, branchId);
                return Ok(new { data = result.Data, total = result.Total, page, pageSize });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving IOL inventory", error = ex.Message });
            }
        }

        /// <summary>
        /// Get a specific IOL inventory item by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var item = await _iolInventoryService.GetByIdAsync(id);
                if (item == null)
                    return NotFound(new { message = "IOL inventory item not found" });

                return Ok(item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving IOL inventory item", error = ex.Message });
            }
        }

        /// <summary>
        /// Get IOL inventory statistics
        /// </summary>
        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics([FromQuery] Guid? branchId = null)
        {
            try
            {
                var stats = await _iolInventoryService.GetStatisticsAsync(branchId);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving statistics", error = ex.Message });
            }
        }

        /// <summary>
        /// Get low stock items
        /// </summary>
        [HttpGet("low-stock")]
        public async Task<IActionResult> GetLowStock([FromQuery] Guid? branchId = null)
        {
            try
            {
                var items = await _iolInventoryService.GetLowStockAsync(branchId);
                return Ok(items);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving low stock items", error = ex.Message });
            }
        }

        /// <summary>
        /// Get list of manufacturers
        /// </summary>
        [HttpGet("manufacturers")]
        public async Task<IActionResult> GetManufacturers()
        {
            try
            {
                var manufacturers = await _iolInventoryService.GetManufacturersAsync();
                return Ok(manufacturers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving manufacturers", error = ex.Message });
            }
        }

        /// <summary>
        /// Search IOL inventory items
        /// </summary>
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string q)
        {
            try
            {
                var items = await _iolInventoryService.SearchAsync(q);
                return Ok(items);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error searching inventory", error = ex.Message });
            }
        }

        /// <summary>
        /// Create a new IOL inventory item
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] IOLInventoryItemDto dto)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
                var item = await _iolInventoryService.CreateAsync(dto, userId);
                return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating IOL inventory item", error = ex.Message });
            }
        }

        /// <summary>
        /// Update an existing IOL inventory item
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] IOLInventoryItemDto dto)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
                var item = await _iolInventoryService.UpdateAsync(id, dto, userId);
                return Ok(item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating IOL inventory item", error = ex.Message });
            }
        }

        /// <summary>
        /// Delete an IOL inventory item (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var result = await _iolInventoryService.DeleteAsync(id);
                if (!result)
                    return NotFound(new { message = "IOL inventory item not found" });

                return Ok(new { message = "IOL inventory item deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting IOL inventory item", error = ex.Message });
            }
        }

        /// <summary>
        /// Adjust stock for an IOL inventory item (add, use, return, damage, etc.)
        /// </summary>
        [HttpPost("adjust-stock")]
        public async Task<IActionResult> AdjustStock([FromBody] StockAdjustmentDto adjustment)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
                var result = await _iolInventoryService.AdjustStockAsync(adjustment, userId);
                if (!result)
                    return NotFound(new { message = "IOL inventory item not found" });

                return Ok(new { message = "Stock adjusted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error adjusting stock", error = ex.Message });
            }
        }
    }
}
