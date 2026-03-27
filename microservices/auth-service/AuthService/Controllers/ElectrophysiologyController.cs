using AuthService.DTOs;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ElectrophysiologyController : ControllerBase
    {
        private readonly IElectrophysiologyService _electroService;

        public ElectrophysiologyController(IElectrophysiologyService electroService)
        {
            _electroService = electroService;
        }

        [HttpGet]
        public async Task<ActionResult<object>> GetAll(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] string? testType = null,
            [FromQuery] Guid? patientId = null,
            [FromQuery] Guid? branchId = null)
        {
            var (tests, totalCount) = await _electroService.GetAllAsync(page, pageSize, search, testType, patientId, branchId);

            return Ok(new
            {
                Data = tests,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ElectrophysiologyTestDto>> GetById(Guid id)
        {
            var test = await _electroService.GetByIdAsync(id);

            if (test == null)
                return NotFound(new { Message = $"Electrophysiology test with ID {id} not found" });

            return Ok(test);
        }

        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<List<ElectrophysiologyTestDto>>> GetByPatient(Guid patientId)
        {
            var tests = await _electroService.GetByPatientAsync(patientId);
            return Ok(tests);
        }

        [HttpGet("statistics")]
        public async Task<ActionResult<ElectrophysiologyStatisticsDto>> GetStatistics([FromQuery] Guid? branchId = null)
        {
            var statistics = await _electroService.GetStatisticsAsync(branchId);
            return Ok(statistics);
        }

        [HttpPost]
        public async Task<ActionResult<ElectrophysiologyTestDto>> Create([FromBody] ElectrophysiologyTestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdTest = await _electroService.CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = createdTest.Id },
                createdTest);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ElectrophysiologyTestDto>> Update(Guid id, [FromBody] ElectrophysiologyTestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updatedTest = await _electroService.UpdateAsync(id, dto);
                return Ok(updatedTest);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            var deleted = await _electroService.DeleteAsync(id);

            if (!deleted)
                return NotFound(new { Message = $"Electrophysiology test with ID {id} not found" });

            return Ok(new { Message = "Electrophysiology test deleted successfully" });
        }

        [HttpGet("search")]
        public async Task<ActionResult<List<ElectrophysiologyTestDto>>> Search([FromQuery] string q)
        {
            if (string.IsNullOrEmpty(q))
                return BadRequest(new { Message = "Search query cannot be empty" });

            var tests = await _electroService.SearchAsync(q);
            return Ok(tests);
        }
    }
}
