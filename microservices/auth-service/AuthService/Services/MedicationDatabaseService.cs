using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using AuthService.Context;
using AuthService.DTOs.Prescription;
using AuthService.Models.Prescription;
using AuthService.Services.Interfaces;

namespace AuthService.Services
{
    public class MedicationDatabaseService : IMedicationDatabaseService
    {
        private readonly AppDbContext _context;

        public MedicationDatabaseService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<MedicationSearchDto>> SearchMedicationsAsync(string query, string? category = null, int pageSize = 20)
        {
            if (string.IsNullOrWhiteSpace(query))
                return new List<MedicationSearchDto>();

            var normalizedQuery = query.ToLower().Trim();

            var queryable = _context.MedicationMaster
                .Where(m => m.IsActive);

            // Filter by category if provided
            if (!string.IsNullOrEmpty(category))
            {
                queryable = queryable.Where(m => m.Category.ToLower() == category.ToLower());
            }

            // Search by name, generic name, or brand names
            queryable = queryable.Where(m =>
                m.Name.ToLower().Contains(normalizedQuery) ||
                m.GenericName.ToLower().Contains(normalizedQuery) ||
                m.BrandNames.Any(b => b.ToLower().Contains(normalizedQuery)));

            var medications = await queryable
                .OrderBy(m => m.Name)
                .Take(pageSize)
                .ToListAsync();

            return medications.Select(MapToDto).ToList();
        }

        public async Task<MedicationSearchDto?> GetMedicationByIdAsync(Guid id)
        {
            var medication = await _context.MedicationMaster
                .FirstOrDefaultAsync(m => m.Id == id);

            if (medication == null)
                return null;

            return MapToDto(medication);
        }

        public async Task<MedicationSearchDto?> GetMedicationByNameAsync(string name)
        {
            var normalizedName = name.ToLower().Trim();

            var medication = await _context.MedicationMaster
                .FirstOrDefaultAsync(m => m.Name.ToLower() == normalizedName && m.IsActive);

            if (medication == null)
                return null;

            return MapToDto(medication);
        }

        public async Task<List<MedicationSearchDto>> GetMedicationsByCategoryAsync(string category)
        {
            var normalizedCategory = category.ToLower().Trim();

            var medications = await _context.MedicationMaster
                .Where(m => m.Category.ToLower() == normalizedCategory && m.IsActive)
                .OrderBy(m => m.Name)
                .ToListAsync();

            return medications.Select(MapToDto).ToList();
        }

        public async Task<List<string>> GetAllCategoriesAsync()
        {
            var categories = await _context.MedicationMaster
                .Where(m => m.IsActive)
                .Select(m => m.Category)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();

            return categories;
        }

        public async Task<List<string>> GetStandardDosagesAsync(string medicationName)
        {
            var normalizedName = medicationName.ToLower().Trim();

            var medication = await _context.MedicationMaster
                .FirstOrDefaultAsync(m => m.Name.ToLower() == normalizedName && m.IsActive);

            if (medication == null || medication.StandardDosages == null)
                return new List<string>();

            return medication.StandardDosages.ToList();
        }

        public async Task<MedicationSearchDto> AddMedicationAsync(MedicationSearchDto medication)
        {
            // Check if medication already exists
            var existing = await _context.MedicationMaster
                .FirstOrDefaultAsync(m => m.Name.ToLower() == medication.Name.ToLower());

            if (existing != null)
                throw new InvalidOperationException("Medication with this name already exists");

            var newMedication = new MedicationMaster
            {
                Id = Guid.NewGuid(),
                Name = medication.Name,
                GenericName = medication.GenericName,
                BrandNames = medication.BrandNames?.ToArray() ?? Array.Empty<string>(),
                Category = medication.Category,
                Form = medication.Form,
                Route = medication.Route,
                StandardDosages = medication.StandardDosages?.ToArray() ?? Array.Empty<string>(),
                Contraindications = medication.Contraindications,
                SideEffects = medication.SideEffects,
                PregnancyCategory = medication.PregnancyCategory,
                RequiresPrescription = medication.RequiresPrescription,
                IsControlledSubstance = medication.IsControlledSubstance,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.MedicationMaster.Add(newMedication);
            await _context.SaveChangesAsync();

            return MapToDto(newMedication);
        }

        public async Task<MedicationSearchDto> UpdateMedicationAsync(Guid id, MedicationSearchDto medication)
        {
            var existing = await _context.MedicationMaster
                .FirstOrDefaultAsync(m => m.Id == id);

            if (existing == null)
                throw new InvalidOperationException("Medication not found");

            // Update fields
            existing.Name = medication.Name;
            existing.GenericName = medication.GenericName;
            existing.BrandNames = medication.BrandNames?.ToArray() ?? Array.Empty<string>();
            existing.Category = medication.Category;
            existing.Form = medication.Form;
            existing.Route = medication.Route;
            existing.StandardDosages = medication.StandardDosages?.ToArray() ?? Array.Empty<string>();
            existing.Contraindications = medication.Contraindications;
            existing.SideEffects = medication.SideEffects;
            existing.PregnancyCategory = medication.PregnancyCategory;
            existing.RequiresPrescription = medication.RequiresPrescription;
            existing.IsControlledSubstance = medication.IsControlledSubstance;
            existing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToDto(existing);
        }

        public async Task<bool> DeactivateMedicationAsync(Guid id)
        {
            var medication = await _context.MedicationMaster
                .FirstOrDefaultAsync(m => m.Id == id);

            if (medication == null)
                return false;

            medication.IsActive = false;
            medication.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }

        private MedicationSearchDto MapToDto(MedicationMaster medication)
        {
            return new MedicationSearchDto
            {
                Id = medication.Id,
                Name = medication.Name,
                GenericName = medication.GenericName,
                BrandNames = medication.BrandNames?.ToList() ?? new List<string>(),
                Category = medication.Category,
                Form = medication.Form,
                Route = medication.Route,
                StandardDosages = medication.StandardDosages?.ToList() ?? new List<string>(),
                Contraindications = medication.Contraindications,
                SideEffects = medication.SideEffects,
                PregnancyCategory = medication.PregnancyCategory,
                RequiresPrescription = medication.RequiresPrescription,
                IsControlledSubstance = medication.IsControlledSubstance
            };
        }
    }
}
