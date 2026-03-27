using AuthService.DTOs;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OctImagingController : ControllerBase
    {
        private readonly IOctImagingService _octService;

        public OctImagingController(IOctImagingService octService)
        {
            _octService = octService;
        }

        [HttpGet]
        public async Task<ActionResult<object>> GetAll(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] string? scanType = null,
            [FromQuery] Guid? patientId = null,
            [FromQuery] Guid? branchId = null)
        {
            var (scans, totalCount) = await _octService.GetAllAsync(page, pageSize, search, scanType, patientId, branchId);

            return Ok(new
            {
                Data = scans,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<OctImagingScanDto>> GetById(Guid id)
        {
            var scan = await _octService.GetByIdAsync(id);

            if (scan == null)
                return NotFound(new { Message = $"OCT scan with ID {id} not found" });

            return Ok(scan);
        }

        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<List<OctImagingScanDto>>> GetByPatient(Guid patientId)
        {
            var scans = await _octService.GetByPatientAsync(patientId);
            return Ok(scans);
        }

        [HttpGet("statistics")]
        public async Task<ActionResult<OctStatisticsDto>> GetStatistics([FromQuery] Guid? branchId = null)
        {
            var statistics = await _octService.GetStatisticsAsync(branchId);
            return Ok(statistics);
        }

        [HttpPost]
        public async Task<ActionResult<OctImagingScanDto>> Create([FromBody] OctImagingScanDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdScan = await _octService.CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = createdScan.Id },
                createdScan);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<OctImagingScanDto>> Update(Guid id, [FromBody] OctImagingScanDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updatedScan = await _octService.UpdateAsync(id, dto);
                return Ok(updatedScan);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            var deleted = await _octService.DeleteAsync(id);

            if (!deleted)
                return NotFound(new { Message = $"OCT scan with ID {id} not found" });

            return Ok(new { Message = "OCT scan deleted successfully" });
        }

        [HttpGet("search")]
        public async Task<ActionResult<List<OctImagingScanDto>>> Search([FromQuery] string q)
        {
            if (string.IsNullOrEmpty(q))
                return BadRequest(new { Message = "Search query cannot be empty" });

            var scans = await _octService.SearchAsync(q);
            return Ok(scans);
        }
    }
}
