using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AuthService.DTOs.Prescription;

namespace AuthService.Services.Interfaces
{
    public interface IPrescriptionService
    {
        /// <summary>
        /// Create a new prescription with medications
        /// </summary>
        Task<PrescriptionDto> CreatePrescriptionAsync(CreatePrescriptionRequest request, Guid doctorId, Guid tenantId);

        /// <summary>
        /// Get prescription by ID with all related data
        /// </summary>
        Task<PrescriptionDto?> GetPrescriptionByIdAsync(Guid id, Guid tenantId);

        /// <summary>
        /// Get all prescriptions for a patient
        /// </summary>
        Task<List<PrescriptionDto>> GetPrescriptionsByPatientAsync(Guid patientId, Guid tenantId, string? status = null);

        /// <summary>
        /// Get all prescriptions created by a doctor
        /// </summary>
        Task<List<PrescriptionDto>> GetPrescriptionsByDoctorAsync(Guid doctorId, Guid tenantId, DateTime? fromDate = null, DateTime? toDate = null);

        /// <summary>
        /// Update prescription details
        /// </summary>
        Task<PrescriptionDto> UpdatePrescriptionAsync(Guid id, UpdatePrescriptionRequest request, Guid tenantId);

        /// <summary>
        /// Mark prescription as dispensed
        /// </summary>
        Task<PrescriptionDto> DispensePrescriptionAsync(Guid id, DispensePrescriptionRequest request, Guid userId, Guid tenantId);

        /// <summary>
        /// Cancel prescription
        /// </summary>
        Task<PrescriptionDto> CancelPrescriptionAsync(Guid id, string reason, Guid tenantId);

        /// <summary>
        /// Mark prescription as printed
        /// </summary>
        Task<PrescriptionDto> PrintPrescriptionAsync(Guid id, Guid tenantId);

        /// <summary>
        /// Soft delete prescription
        /// </summary>
        Task<bool> DeletePrescriptionAsync(Guid id, Guid tenantId);
    }
}
