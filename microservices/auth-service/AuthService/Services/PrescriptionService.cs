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
    public class PrescriptionService : IPrescriptionService
    {
        private readonly AppDbContext _context;
        private readonly IDrugInteractionService _drugInteractionService;

        public PrescriptionService(AppDbContext context, IDrugInteractionService drugInteractionService)
        {
            _context = context;
            _drugInteractionService = drugInteractionService;
        }

        public async Task<PrescriptionDto> CreatePrescriptionAsync(CreatePrescriptionRequest request, Guid doctorId, Guid tenantId)
        {
            // Validate patient exists and belongs to tenant
            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.Id == request.PatientId && p.TenantId == tenantId && p.DeletedAt == null);

            if (patient == null)
                throw new InvalidOperationException("Patient not found or does not belong to this tenant");

            // Check drug interactions
            var medicationNames = request.Medications.Select(m => m.MedicationName).ToList();
            var interactionResult = await _drugInteractionService.CheckInteractionsAsync(medicationNames);

            // Check patient allergies
            var allergyResult = await _drugInteractionService.CheckPatientAllergiesAsync(request.PatientId, medicationNames, tenantId);

            // Create prescription
            var prescription = new Models.Prescription.Prescription
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                PatientId = request.PatientId,
                DoctorId = doctorId,
                PrescriptionDate = DateTime.UtcNow,
                Diagnosis = request.Diagnosis,
                Instructions = request.Instructions,
                DurationDays = request.DurationDays,
                FollowUpDate = request.FollowUpDate,
                Status = "active",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Add medications
            foreach (var medRequest in request.Medications)
            {
                var medication = new PrescriptionMedication
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    PrescriptionId = prescription.Id,
                    MedicationName = medRequest.MedicationName,
                    GenericName = medRequest.GenericName,
                    Dosage = medRequest.Dosage,
                    Form = medRequest.Form,
                    Route = medRequest.Route,
                    Frequency = medRequest.Frequency,
                    DurationDays = medRequest.DurationDays,
                    Quantity = medRequest.Quantity,
                    Instructions = medRequest.Instructions,
                    RefillsAllowed = medRequest.RefillsAllowed,
                    RefillsRemaining = medRequest.RefillsAllowed,
                    IsCritical = medRequest.IsCritical,
                    StartDate = medRequest.StartDate ?? DateTime.UtcNow,
                    EndDate = (medRequest.StartDate ?? DateTime.UtcNow).AddDays(medRequest.DurationDays),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                prescription.Medications.Add(medication);
            }

            _context.Prescriptions.Add(prescription);
            await _context.SaveChangesAsync();

            return await GetPrescriptionByIdAsync(prescription.Id, tenantId) 
                ?? throw new InvalidOperationException("Failed to retrieve created prescription");
        }

        public async Task<PrescriptionDto?> GetPrescriptionByIdAsync(Guid id, Guid tenantId)
        {
            var prescription = await _context.Prescriptions
                .Include(p => p.Patient)
                .Include(p => p.Doctor)
                .Include(p => p.DispensedByUser)
                .Include(p => p.Medications)
                .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId && p.DeletedAt == null);

            if (prescription == null)
                return null;

            return MapToDto(prescription);
        }

        public async Task<List<PrescriptionDto>> GetPrescriptionsByPatientAsync(Guid patientId, Guid tenantId, string? status = null)
        {
            var query = _context.Prescriptions
                .Include(p => p.Patient)
                .Include(p => p.Doctor)
                .Include(p => p.DispensedByUser)
                .Include(p => p.Medications)
                .Where(p => p.PatientId == patientId && p.TenantId == tenantId && p.DeletedAt == null);

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(p => p.Status == status.ToLower());
            }

            var prescriptions = await query
                .OrderByDescending(p => p.PrescriptionDate)
                .ToListAsync();

            return prescriptions.Select(MapToDto).ToList();
        }

        public async Task<List<PrescriptionDto>> GetPrescriptionsByDoctorAsync(Guid doctorId, Guid tenantId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            var query = _context.Prescriptions
                .Include(p => p.Patient)
                .Include(p => p.Doctor)
                .Include(p => p.DispensedByUser)
                .Include(p => p.Medications)
                .Where(p => p.DoctorId == doctorId && p.TenantId == tenantId && p.DeletedAt == null);

            if (fromDate.HasValue)
            {
                query = query.Where(p => p.PrescriptionDate >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(p => p.PrescriptionDate <= toDate.Value);
            }

            var prescriptions = await query
                .OrderByDescending(p => p.PrescriptionDate)
                .ToListAsync();

            return prescriptions.Select(MapToDto).ToList();
        }

        public async Task<PrescriptionDto> UpdatePrescriptionAsync(Guid id, UpdatePrescriptionRequest request, Guid tenantId)
        {
            var prescription = await _context.Prescriptions
                .Include(p => p.Medications)
                .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId && p.DeletedAt == null);

            if (prescription == null)
                throw new InvalidOperationException("Prescription not found");

            // Prevent modification if already dispensed
            if (prescription.DispensedDate.HasValue)
                throw new InvalidOperationException("Cannot modify prescription that has already been dispensed");

            // Update fields
            if (!string.IsNullOrEmpty(request.Diagnosis))
                prescription.Diagnosis = request.Diagnosis;

            if (!string.IsNullOrEmpty(request.Instructions))
                prescription.Instructions = request.Instructions;

            if (request.DurationDays.HasValue)
                prescription.DurationDays = request.DurationDays.Value;

            if (request.FollowUpDate.HasValue)
                prescription.FollowUpDate = request.FollowUpDate;

            prescription.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetPrescriptionByIdAsync(id, tenantId) 
                ?? throw new InvalidOperationException("Failed to retrieve updated prescription");
        }

        public async Task<PrescriptionDto> DispensePrescriptionAsync(Guid id, DispensePrescriptionRequest request, Guid userId, Guid tenantId)
        {
            var prescription = await _context.Prescriptions
                .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId && p.DeletedAt == null);

            if (prescription == null)
                throw new InvalidOperationException("Prescription not found");

            if (prescription.DispensedDate.HasValue)
                throw new InvalidOperationException("Prescription has already been dispensed");

            prescription.DispensedDate = DateTime.UtcNow;
            prescription.DispensedByUserId = userId;
            prescription.PharmacyId = request.PharmacyId;
            prescription.PharmacyName = request.PharmacyName;
            prescription.PharmacyContact = request.PharmacyContact;
            prescription.Status = "completed";
            prescription.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetPrescriptionByIdAsync(id, tenantId) 
                ?? throw new InvalidOperationException("Failed to retrieve dispensed prescription");
        }

        public async Task<PrescriptionDto> CancelPrescriptionAsync(Guid id, string reason, Guid tenantId)
        {
            var prescription = await _context.Prescriptions
                .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId && p.DeletedAt == null);

            if (prescription == null)
                throw new InvalidOperationException("Prescription not found");

            if (prescription.DispensedDate.HasValue)
                throw new InvalidOperationException("Cannot cancel prescription that has been dispensed");

            prescription.Status = "cancelled";
            prescription.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetPrescriptionByIdAsync(id, tenantId) 
                ?? throw new InvalidOperationException("Failed to retrieve cancelled prescription");
        }

        public async Task<PrescriptionDto> PrintPrescriptionAsync(Guid id, Guid tenantId)
        {
            var prescription = await _context.Prescriptions
                .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId && p.DeletedAt == null);

            if (prescription == null)
                throw new InvalidOperationException("Prescription not found");

            prescription.IsPrinted = true;
            prescription.PrintedAt = DateTime.UtcNow;
            prescription.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetPrescriptionByIdAsync(id, tenantId) 
                ?? throw new InvalidOperationException("Failed to retrieve prescription");
        }

        public async Task<bool> DeletePrescriptionAsync(Guid id, Guid tenantId)
        {
            var prescription = await _context.Prescriptions
                .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId && p.DeletedAt == null);

            if (prescription == null)
                return false;

            // Soft delete
            prescription.DeletedAt = DateTime.UtcNow;
            prescription.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }

        private PrescriptionDto MapToDto(Models.Prescription.Prescription prescription)
        {
            return new PrescriptionDto
            {
                Id = prescription.Id,
                TenantId = prescription.TenantId,
                PatientId = prescription.PatientId,
                PatientName = prescription.Patient != null 
                    ? $"{prescription.Patient.FirstName} {prescription.Patient.LastName}" 
                    : null,
                DoctorId = prescription.DoctorId,
                DoctorName = prescription.Doctor != null 
                    ? $"{prescription.Doctor.FirstName} {prescription.Doctor.LastName}" 
                    : null,
                PrescriptionDate = prescription.PrescriptionDate,
                Diagnosis = prescription.Diagnosis,
                Instructions = prescription.Instructions,
                DurationDays = prescription.DurationDays,
                FollowUpDate = prescription.FollowUpDate,
                Status = prescription.Status,
                IsPrinted = prescription.IsPrinted,
                PrintedAt = prescription.PrintedAt,
                DispensedAt = prescription.DispensedDate,
                DispensedByUserId = prescription.DispensedByUserId,
                DispensedByUserName = prescription.DispensedByUser != null 
                    ? $"{prescription.DispensedByUser.FirstName} {prescription.DispensedByUser.LastName}" 
                    : null,
                PharmacyId = prescription.PharmacyId,
                PharmacyName = prescription.PharmacyName,
                PharmacyContact = prescription.PharmacyContact,
                Medications = prescription.Medications.Select(m => new PrescriptionMedicationDto
                {
                    Id = m.Id,
                    PrescriptionId = m.PrescriptionId,
                    MedicationName = m.MedicationName,
                    GenericName = m.GenericName,
                    Dosage = m.Dosage,
                    Form = m.Form,
                    Route = m.Route,
                    Frequency = m.Frequency,
                    DurationDays = m.DurationDays,
                    Quantity = m.Quantity,
                    Instructions = m.Instructions,
                    RefillsAllowed = m.RefillsAllowed,
                    RefillsRemaining = m.RefillsRemaining,
                    IsCritical = m.IsCritical,
                    StartDate = m.StartDate,
                    EndDate = m.EndDate
                }).ToList(),
                CreatedAt = prescription.CreatedAt,
                UpdatedAt = prescription.UpdatedAt
            };
        }
    }
}
