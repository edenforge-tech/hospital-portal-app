using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AuthService.Services.Interfaces;
using AuthService.DTOs.Prescription;
using AuthService.Authorization;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MedicationsController : ControllerBase
    {
        private readonly IMedicationDatabaseService _medicationService;
        private readonly ILogger<MedicationsController> _logger;

        public MedicationsController(
            IMedicationDatabaseService medicationService,
            ILogger<MedicationsController> logger)
        {
            _medicationService = medicationService;
            _logger = logger;
        }

        /// <summary>
        /// Search medications for autocomplete (supports partial matching)
        /// </summary>
        [HttpGet("search")]
        [RequirePermission("medication.search")]
        [ProducesResponseType(typeof(List<MedicationSearchDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> SearchMedications(
            [FromQuery] string query,
            [FromQuery] string? category = null,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(query))
                    return BadRequest(new { error = "Search query is required" });

                if (pageSize < 1 || pageSize > 100)
                    pageSize = 20;

                var medications = await _medicationService.SearchMedicationsAsync(query, category, pageSize);

                return Ok(medications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching medications with query: {Query}", query);
                return StatusCode(500, new { error = "An error occurred while searching medications" });
            }
        }

        /// <summary>
        /// Get medication by ID
        /// </summary>
        [HttpGet("{id}")]
        [RequirePermission("medication.search")]
        [ProducesResponseType(typeof(MedicationSearchDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetMedication(Guid id)
        {
            try
            {
                var medication = await _medicationService.GetMedicationByIdAsync(id);

                if (medication == null)
                    return NotFound(new { error = "Medication not found" });

                return Ok(medication);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving medication {MedicationId}", id);
                return StatusCode(500, new { error = "An error occurred while retrieving the medication" });
            }
        }

        /// <summary>
        /// Get medication by exact name
        /// </summary>
        [HttpGet("by-name/{name}")]
        [RequirePermission("medication.search")]
        [ProducesResponseType(typeof(MedicationSearchDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetMedicationByName(string name)
        {
            try
            {
                var medication = await _medicationService.GetMedicationByNameAsync(name);

                if (medication == null)
                    return NotFound(new { error = "Medication not found" });

                return Ok(medication);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving medication by name: {Name}", name);
                return StatusCode(500, new { error = "An error occurred while retrieving the medication" });
            }
        }

        /// <summary>
        /// Get medications by category
        /// </summary>
        [HttpGet("category/{category}")]
        [RequirePermission("medication.search")]
        [ProducesResponseType(typeof(List<MedicationSearchDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetMedicationsByCategory(string category)
        {
            try
            {
                var medications = await _medicationService.GetMedicationsByCategoryAsync(category);

                return Ok(medications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving medications for category: {Category}", category);
                return StatusCode(500, new { error = "An error occurred while retrieving medications" });
            }
        }

        /// <summary>
        /// Get all medication categories
        /// </summary>
        [HttpGet("categories")]
        [RequirePermission("medication.search")]
        [ProducesResponseType(typeof(List<string>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetCategories()
        {
            try
            {
                var categories = await _medicationService.GetAllCategoriesAsync();

                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving medication categories");
                return StatusCode(500, new { error = "An error occurred while retrieving categories" });
            }
        }

        /// <summary>
        /// Get standard dosages for a medication
        /// </summary>
        [HttpGet("{medicationName}/dosages")]
        [RequirePermission("medication.search")]
        [ProducesResponseType(typeof(List<string>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetStandardDosages(string medicationName)
        {
            try
            {
                var dosages = await _medicationService.GetStandardDosagesAsync(medicationName);

                return Ok(dosages);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving dosages for medication: {Name}", medicationName);
                return StatusCode(500, new { error = "An error occurred while retrieving dosages" });
            }
        }

        /// <summary>
        /// Add new medication to database (admin only)
        /// </summary>
        [HttpPost]
        [RequirePermission("medication.admin")]
        [ProducesResponseType(typeof(MedicationSearchDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> AddMedication([FromBody] MedicationSearchDto medication)
        {
            try
            {
                var createdMedication = await _medicationService.AddMedicationAsync(medication);

                _logger.LogInformation("Medication added: {MedicationName} (ID: {MedicationId})",
                    createdMedication.Name, createdMedication.Id);

                return CreatedAtAction(nameof(GetMedication), new { id = createdMedication.Id }, createdMedication);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Invalid medication creation: {Message}", ex.Message);
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding medication");
                return StatusCode(500, new { error = "An error occurred while adding the medication" });
            }
        }

        /// <summary>
        /// Update medication (admin only)
        /// </summary>
        [HttpPut("{id}")]
        [RequirePermission("medication.admin")]
        [ProducesResponseType(typeof(MedicationSearchDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateMedication(Guid id, [FromBody] MedicationSearchDto medication)
        {
            try
            {
                var updatedMedication = await _medicationService.UpdateMedicationAsync(id, medication);

                _logger.LogInformation("Medication updated: {MedicationId}", id);

                return Ok(updatedMedication);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Medication {MedicationId} not found for update", id);
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating medication {MedicationId}", id);
                return StatusCode(500, new { error = "An error occurred while updating the medication" });
            }
        }

        /// <summary>
        /// Deactivate medication (admin only - soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        [RequirePermission("medication.admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeactivateMedication(Guid id)
        {
            try
            {
                var result = await _medicationService.DeactivateMedicationAsync(id);

                if (!result)
                    return NotFound(new { error = "Medication not found" });

                _logger.LogInformation("Medication deactivated: {MedicationId}", id);

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deactivating medication {MedicationId}", id);
                return StatusCode(500, new { error = "An error occurred while deactivating the medication" });
            }
        }
    }
}
