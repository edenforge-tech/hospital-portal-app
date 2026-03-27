using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using AuthService.Context;
using AuthService.Models.Counselor;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services
{
    public class AdmissionManagementService : IAdmissionManagementService
    {
        private readonly AppDbContext _context;
        private readonly IBranchCacheService _branchCache;
        private readonly INotificationService _notificationService;
        private readonly ILogger<AdmissionManagementService> _logger;

        public AdmissionManagementService(
            AppDbContext context, 
            IBranchCacheService branchCache,
            INotificationService notificationService,
            ILogger<AdmissionManagementService> logger)
        {
            _context = context;
            _branchCache = branchCache;
            _notificationService = notificationService;
            _logger = logger;
        }

        // ==================== Patient Admissions ====================

        public async Task<AdmissionListResponse> GetAllAdmissionsAsync(int page, int pageSize, Guid? sessionId, string? admissionType)
        {
            var query = _context.PatientAdmissions
                .Where(a => a.DeletedAt == null);

            if (sessionId.HasValue)
                query = query.Where(a => a.SessionId == sessionId.Value);

            if (!string.IsNullOrEmpty(admissionType))
                query = query.Where(a => a.AdmissionType == admissionType);

            var totalRecords = await query.CountAsync();
            var admissions = await query
                .OrderByDescending(a => a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new AdmissionListResponse
            {
                TotalRecords = totalRecords,
                Admissions = admissions.Select(ToAdmissionDto).ToList()
            };
        }

        public async Task<PatientAdmissionDto?> GetAdmissionByIdAsync(Guid id)
        {
            var admission = await _context.PatientAdmissions
                .FirstOrDefaultAsync(a => a.Id == id && a.DeletedAt == null);
            
            return admission != null ? ToAdmissionDto(admission) : null;
        }

        public async Task<PatientAdmissionDto> CreateAdmissionAsync(CreateAdmissionRequest request, Guid tenantId, Guid userId)
        {
            // Get branch for this tenant
            var branch = await _branchCache.GetDefaultBranchForTenantAsync(tenantId);
            if (branch == null) throw new InvalidOperationException("Branch not found for tenant");

            var admission = new PatientAdmission
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                BranchId = branch.Id,
                SessionId = request.SessionId,
                PatientId = request.PatientId,
                OtScheduleId = request.OtScheduleId,
                AdmissionNumber = GenerateAdmissionNumber(),
                AdmissionType = request.AdmissionType,
                AdmissionDate = request.AdmissionDate,
                AdmissionTime = request.AdmissionTime,
                SurgeryType = request.SurgeryType,
                SurgeryDate = request.SurgeryDate,
                EyeOperated = request.EyeOperated,
                ScheduledDischargeTime = request.ScheduledDischargeTime,
                AttendantName = request.AttendantName,
                AttendantPhone = request.AttendantPhone,
                AttendantRelation = request.AttendantRelation,
                AdmittingDoctorId = request.AdmittingDoctorId,
                AdmissionDepositPaid = request.AdmissionDepositPaid,
                AdmissionStatus = "Scheduled",
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = userId
            };

            _context.PatientAdmissions.Add(admission);
            await _context.SaveChangesAsync();

            // Trigger department auto-notifications for surgery booking
            await SendDepartmentNotificationsAsync(admission, tenantId);

            return ToAdmissionDto(admission);
        }

        public async Task<PatientAdmissionDto> UpdateAdmissionAsync(Guid id, UpdateAdmissionRequest request, Guid userId)
        {
            var admission = await _context.PatientAdmissions
                .FirstOrDefaultAsync(a => a.Id == id && a.DeletedAt == null);

            if (admission == null)
                throw new InvalidOperationException("Admission not found");

            if (request.AdmissionDate.HasValue)
                admission.AdmissionDate = request.AdmissionDate.Value;

            if (request.AdmissionTime.HasValue)
                admission.AdmissionTime = request.AdmissionTime;

            if (request.ScheduledDischargeTime.HasValue)
                admission.ScheduledDischargeTime = request.ScheduledDischargeTime;

            if (!string.IsNullOrEmpty(request.AdmissionStatus))
                admission.AdmissionStatus = request.AdmissionStatus;

            if (!string.IsNullOrEmpty(request.SurgeryType))
                admission.SurgeryType = request.SurgeryType;

            if (request.SurgeryDate.HasValue)
                admission.SurgeryDate = request.SurgeryDate;

            admission.AdmissionDepositPaid = request.AdmissionDepositPaid;
            admission.UpdatedAt = DateTime.UtcNow;
            admission.UpdatedByUserId = userId;

            await _context.SaveChangesAsync();
            return ToAdmissionDto(admission);
        }

        public async Task<PatientAdmissionDto> AssignBedAsync(Guid id, AssignBedRequest request, Guid userId)
        {
            var admission = await _context.PatientAdmissions
                .FirstOrDefaultAsync(a => a.Id == id && a.DeletedAt == null);

            if (admission == null)
                throw new InvalidOperationException("Admission not found");

            // Check bed availability
            var existingReservation = await _context.BedReservations
                .FirstOrDefaultAsync(r => r.BedId == request.BedId && r.ReservationStatus == "Occupied");

            if (existingReservation != null)
                throw new InvalidOperationException("Bed is already occupied");

            admission.BedId = request.BedId;
            admission.BedAssignedAt = DateTime.UtcNow;
            admission.AdmissionStatus = "Admitted";
            admission.UpdatedAt = DateTime.UtcNow;
            admission.UpdatedByUserId = userId;

            // Create bed reservation
            var reservation = new BedReservation
            {
                Id = Guid.NewGuid(),
                TenantId = admission.TenantId,
                BranchId = admission.BranchId,
                AdmissionId = admission.Id,
                PatientId = admission.PatientId,
                BedId = request.BedId,
                ReservationStartDate = DateTime.UtcNow,
                ReservationStatus = "Occupied",
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = userId
            };

            _context.BedReservations.Add(reservation);
            await _context.SaveChangesAsync();

            return ToAdmissionDto(admission);
        }

        public async Task<PatientAdmissionDto> DischargeAdmissionAsync(Guid id, DischargeAdmissionRequest request, Guid userId)
        {
            var admission = await _context.PatientAdmissions
                .FirstOrDefaultAsync(a => a.Id == id && a.DeletedAt == null);

            if (admission == null)
                throw new InvalidOperationException("Admission not found");

            if (admission.AdmissionStatus != "UnderCare" && admission.AdmissionStatus != "PostOperative" && admission.AdmissionStatus != "ReadyForDischarge")
                throw new InvalidOperationException("Cannot discharge admission in current status");

            admission.ActualDischargeDate = request.ActualDischargeDate ?? DateTime.UtcNow;
            admission.ActualDischargeTime = request.ActualDischargeTime ?? DateTime.UtcNow.TimeOfDay;
            admission.DischargeSummaryUrl = request.DischargeSummaryUrl;
            admission.DischargeInstructions = request.DischargeInstructions;
            admission.DischargedByUserId = request.DischargedByUserId;
            admission.FinalBillAmount = request.FinalBillAmount;
            admission.FinalSettlementStatus = request.FinalSettlementStatus;
            admission.AdmissionStatus = "Discharged";
            admission.UpdatedAt = DateTime.UtcNow;
            admission.UpdatedByUserId = userId;

            // Release bed reservation
            if (admission.BedId.HasValue)
            {
                var reservation = await _context.BedReservations
                    .FirstOrDefaultAsync(r => r.AdmissionId == admission.Id && r.ReservationStatus == "Occupied");

                if (reservation != null)
                {
                    reservation.ReservationStatus = "Released";
                    reservation.ReservationEndDate = DateTime.UtcNow;
                    reservation.UpdatedAt = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();
            return ToAdmissionDto(admission);
        }

        public async Task<PatientAdmissionDto> CancelAdmissionAsync(Guid id, string cancellationReason, Guid userId)
        {
            var admission = await _context.PatientAdmissions
                .FirstOrDefaultAsync(a => a.Id == id && a.DeletedAt == null);

            if (admission == null)
                throw new InvalidOperationException("Admission not found");

            admission.AdmissionStatus = "Cancelled";
            admission.CancellationReason = cancellationReason;
            admission.CancelledAt = DateTime.UtcNow;
            admission.CancelledByUserId = userId;
            admission.UpdatedAt = DateTime.UtcNow;
            admission.UpdatedByUserId = userId;

            // Release bed reservation if exists
            if (admission.BedId.HasValue)
            {
                var reservation = await _context.BedReservations
                    .FirstOrDefaultAsync(r => r.AdmissionId == admission.Id && r.ReservationStatus != "Released");

                if (reservation != null)
                {
                    reservation.ReservationStatus = "Cancelled";
                    reservation.CancellationReason = cancellationReason;
                    reservation.UpdatedAt = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();
            return ToAdmissionDto(admission);
        }

        public async Task<bool> DeleteAdmissionAsync(Guid id)
        {
            var admission = await _context.PatientAdmissions.FindAsync(id);
            if (admission == null) return false;

            admission.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        // ==================== Bed Reservations ====================

        public async Task<BedReservationDto> CreateBedReservationAsync(CreateBedReservationRequest request, Guid tenantId, Guid userId)
        {
            var branch = await _branchCache.GetDefaultBranchForTenantAsync(tenantId);
            if (branch == null)
                throw new InvalidOperationException("Branch not found for tenant");

            var reservation = new BedReservation
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                BranchId = branch.Id,
                AdmissionId = request.AdmissionId,
                PatientId = request.PatientId,
                BedId = request.BedId,
                ReservationStartDate = request.ReservationStartDate,
                ReservationEndDate = request.ReservationEndDate,
                ReservationStatus = "Reserved",
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = userId
            };

            _context.BedReservations.Add(reservation);
            await _context.SaveChangesAsync();

            return ToBedReservationDto(reservation);
        }

        public async Task<bool> ReleaseBedReservationAsync(Guid id)
        {
            var reservation = await _context.BedReservations.FindAsync(id);
            if (reservation == null) return false;

            reservation.ReservationStatus = "Released";
            reservation.ReservationEndDate = DateTime.UtcNow;
            reservation.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<AvailableBed>> GetAvailableBedsAsync(DateTime date, string? bedType)
        {
            // TODO: Integrate with BedInventory table from Module 2
            // For now, return mock data
            return new List<AvailableBed>();
        }

        // ==================== Helper Methods ====================

        private string GenerateAdmissionNumber()
        {
            return $"ADM{DateTime.UtcNow:yyyyMMdd}{new Random().Next(1000, 9999)}";
        }

        /// <summary>
        /// Send automatic notifications to all relevant departments when surgery is booked
        /// </summary>
        private async Task SendDepartmentNotificationsAsync(PatientAdmission admission, Guid tenantId)
        {
            try
            {
                // Get patient and doctor info for notification details
                var patient = await _context.Patients.FindAsync(admission.PatientId);
                var doctor = admission.AdmittingDoctorId.HasValue 
                    ? await _context.Users.FindAsync(admission.AdmittingDoctorId.Value) 
                    : null;

                var patientName = patient != null ? $"{patient.FirstName} {patient.LastName}" : "Unknown Patient";
                var doctorName = doctor != null ? $"Dr. {doctor.FirstName} {doctor.LastName}" : "Unknown Doctor";
                var surgeryDate = admission.SurgeryDate?.ToString("MMM dd, yyyy") ?? "TBD";

                var notificationMessage = $"New surgery booking: {patientName} - {admission.SurgeryType} scheduled for {surgeryDate}";
                var notificationDetails = $@"
                    Admission #: {admission.AdmissionNumber}
                    Patient: {patientName} (MRN: {patient?.MedicalRecordNumber})
                    Surgery Type: {admission.SurgeryType}
                    Eye: {admission.EyeOperated}
                    Date: {surgeryDate}
                    Admission Type: {admission.AdmissionType}
                    Admitting Doctor: {doctorName}
                ";

                // Notify 8 departments in parallel
                var notificationTasks = new List<Task>
                {
                    // 1. OT Team (Operation Theater)
                    _notificationService.NotifyRoleAsync(
                        tenantId, 
                        "ot_staff", 
                        "SurgeryBooking", 
                        $"OT Schedule: {notificationMessage}",
                        notificationDetails
                    ),

                    // 2. Pharmacy
                    _notificationService.NotifyRoleAsync(
                        tenantId, 
                        "pharmacist", 
                        "SurgeryBooking", 
                        $"Prepare medications: {notificationMessage}",
                        notificationDetails
                    ),

                    // 3. IPD (In-Patient Department)
                    _notificationService.NotifyRoleAsync(
                        tenantId, 
                        "ipd_staff", 
                        "SurgeryBooking", 
                        $"Bed arrangement needed: {notificationMessage}",
                        notificationDetails
                    ),

                    // 4. Billing Department
                    _notificationService.NotifyRoleAsync(
                        tenantId, 
                        "billing_staff", 
                        "SurgeryBooking", 
                        $"Cost estimate required: {notificationMessage}",
                        notificationDetails
                    ),

                    // 5. Insurance Department
                    _notificationService.NotifyRoleAsync(
                        tenantId, 
                        "insurance_staff", 
                        "SurgeryBooking", 
                        $"Pre-authorization needed: {notificationMessage}",
                        notificationDetails
                    ),

                    // 6. Laboratory
                    _notificationService.NotifyRoleAsync(
                        tenantId, 
                        "lab_technician", 
                        "SurgeryBooking", 
                        $"Pre-op tests required: {notificationMessage}",
                        notificationDetails
                    ),

                    // 7. Anesthesia Department
                    _notificationService.NotifyRoleAsync(
                        tenantId, 
                        "anesthesiologist", 
                        "SurgeryBooking", 
                        $"Anesthesia evaluation needed: {notificationMessage}",
                        notificationDetails
                    ),

                    // 8. Assigned Doctor
                    admission.AdmittingDoctorId.HasValue 
                        ? _notificationService.SendUserNotificationAsync(
                            admission.AdmittingDoctorId.Value,
                            "SurgeryBooking",
                            $"Your surgery scheduled: {patientName} - {admission.SurgeryType}",
                            notificationDetails
                        )
                        : Task.CompletedTask
                };

                await Task.WhenAll(notificationTasks);

                _logger.LogInformation(
                    "Department notifications sent for admission {AdmissionNumber} - Patient: {PatientName}, Surgery: {SurgeryType}",
                    admission.AdmissionNumber,
                    patientName,
                    admission.SurgeryType
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, 
                    "Failed to send department notifications for admission {AdmissionId}",
                    admission.Id
                );
                // Don't throw - notification failure shouldn't break admission creation
            }
        }

        private PatientAdmissionDto ToAdmissionDto(PatientAdmission admission)
        {
            return new PatientAdmissionDto
            {
                Id = admission.Id,
                SessionId = admission.SessionId,
                PatientId = admission.PatientId,
                OtScheduleId = admission.OtScheduleId,
                AdmissionNumber = admission.AdmissionNumber,
                AdmissionType = admission.AdmissionType,
                AdmissionDate = admission.AdmissionDate,
                AdmissionTime = admission.AdmissionTime,
                SurgeryType = admission.SurgeryType,
                SurgeryDate = admission.SurgeryDate,
                EyeOperated = admission.EyeOperated,
                BedId = admission.BedId,
                BedAssignedAt = admission.BedAssignedAt,
                ScheduledDischargeTime = admission.ScheduledDischargeTime,
                AdmissionStatus = admission.AdmissionStatus,
                ActualDischargeDate = admission.ActualDischargeDate,
                ActualDischargeTime = admission.ActualDischargeTime,
                DischargeSummaryUrl = admission.DischargeSummaryUrl,
                AttendantName = admission.AttendantName,
                AdmittingDoctorId = admission.AdmittingDoctorId,
                AdmissionDepositPaid = admission.AdmissionDepositPaid,
                FinalBillAmount = admission.FinalBillAmount,
                FinalSettlementStatus = admission.FinalSettlementStatus,
                CreatedAt = admission.CreatedAt
            };
        }

        private BedReservationDto ToBedReservationDto(BedReservation reservation)
        {
            return new BedReservationDto
            {
                Id = reservation.Id,
                AdmissionId = reservation.AdmissionId,
                PatientId = reservation.PatientId,
                BedId = reservation.BedId,
                RoomNumber = reservation.RoomNumber,
                ReservationStartDate = reservation.ReservationStartDate,
                ReservationEndDate = reservation.ReservationEndDate,
                ReservationStatus = reservation.ReservationStatus,
                CreatedAt = reservation.CreatedAt
            };
        }
    }
}
