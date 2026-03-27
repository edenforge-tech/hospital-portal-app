using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using AuthService.Context;
using AuthService.DTOs.Visit;
using AuthService.DTOs.Billing;
using AuthService.Models.Domain;
using AuthService.Services.Interfaces;

namespace AuthService.Services;

public class VisitService : IVisitService
{
    private readonly AppDbContext _context;
    private readonly IOpdBillService _opdBillService;
    private readonly ILogger<VisitService> _logger;

    public VisitService(
        AppDbContext context,
        IOpdBillService opdBillService,
        ILogger<VisitService> logger)
    {
        _context = context;
        _opdBillService = opdBillService;
        _logger = logger;
    }

    public async Task<VisitDto?> GetByIdAsync(Guid id)
    {
        var visit = await _context.Visits
            .Include(v => v.Patient)
            .Include(v => v.Appointment)
            .Include(v => v.Branch)
            .Include(v => v.Consultant)
            .Include(v => v.Department)
            .Include(v => v.OpdBill)
            .Include(v => v.CheckedInByUser)
            .Include(v => v.AssignedToUser)
            .Include(v => v.CompletedByUser)
            .Where(v => v.Id == id && v.DeletedAt == null)
            .FirstOrDefaultAsync();

        return visit == null ? null : MapToDto(visit);
    }

    public async Task<VisitDto?> GetByAppointmentIdAsync(Guid appointmentId)
    {
        var visit = await _context.Visits
            .Include(v => v.Patient)
            .Include(v => v.Appointment)
            .Include(v => v.Branch)
            .Include(v => v.Consultant)
            .Include(v => v.Department)
            .Include(v => v.OpdBill)
            .Where(v => v.AppointmentId == appointmentId && v.DeletedAt == null)
            .FirstOrDefaultAsync();

        return visit == null ? null : MapToDto(visit);
    }

    public async Task<List<VisitListDto>> GetByPatientIdAsync(Guid patientId, int page = 1, int pageSize = 20)
    {
        var visits = await _context.Visits
            .Include(v => v.Patient)
            .Include(v => v.Consultant)
            .Where(v => v.PatientId == patientId && v.DeletedAt == null)
            .OrderByDescending(v => v.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return visits.Select(MapToListDto).ToList();
    }

    public async Task<List<VisitListDto>> GetByBranchIdAsync(Guid branchId, DateTime? date = null, string? status = null, int page = 1, int pageSize = 50)
    {
        var query = _context.Visits
            .Include(v => v.Patient)
            .Include(v => v.Consultant)
            .Include(v => v.AssignedToUser)
            .Where(v => v.BranchId == branchId && v.DeletedAt == null);

        if (date.HasValue)
        {
            var startOfDay = date.Value.Date;
            var endOfDay = startOfDay.AddDays(1);
            query = query.Where(v => v.CreatedAt >= startOfDay && v.CreatedAt < endOfDay);
        }

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(v => v.Status == status);
        }

        var visits = await query
            .OrderByDescending(v => v.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return visits.Select(MapToListDto).ToList();
    }

    public async Task<List<VisitQueueDto>> GetQueueAsync(Guid branchId, string? station = null, Guid? assignedTo = null)
    {
        var query = _context.Visits
            .Include(v => v.Patient)
            .Include(v => v.AssignedToUser)
            .Include(v => v.Appointment)
            .Where(v => v.BranchId == branchId 
                && v.DeletedAt == null
                && v.Status != "completed"
                && v.Status != "cancelled");

        if (!string.IsNullOrEmpty(station))
        {
            query = query.Where(v => v.CurrentStation == station);
        }

        if (assignedTo.HasValue)
        {
            query = query.Where(v => v.AssignedTo == assignedTo);
        }

        var visits = await query
            .OrderBy(v => v.IsEmergency ? 0 : 1)
            .ThenBy(v => v.CheckedInAt)
            .ToListAsync();

        return visits.Select(v => new VisitQueueDto
        {
            Id = v.Id,
            TokenNumber = v.TokenNumber,
            PatientName = $"{v.Patient?.FirstName} {v.Patient?.LastName}".Trim(),
            PatientMrn = v.Patient?.MedicalRecordNumber ?? "",
            VisitType = v.VisitType,
            Status = v.Status,
            CheckedInAt = v.CheckedInAt,
            WaitingMinutes = v.CheckedInAt.HasValue 
                ? (int)(DateTime.UtcNow - v.CheckedInAt.Value).TotalMinutes 
                : 0,
            CurrentStation = v.CurrentStation,
            AssignedTo = v.AssignedTo,
            AssignedToName = v.AssignedToUser != null 
                ? $"{v.AssignedToUser.FirstName} {v.AssignedToUser.LastName}".Trim() 
                : null,
            IsEmergency = v.IsEmergency,
            Priority = v.Appointment?.Priority ?? "normal"
        }).ToList();
    }

    public async Task<CheckInValidationDto> ValidateCheckInAsync(Guid appointmentId)
    {
        var result = new CheckInValidationDto();

        // 1. Check appointment exists
        var appointment = await _context.Appointments
            .Include(a => a.Patient)
            .Where(a => a.Id == appointmentId && a.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (appointment == null)
        {
            result.AppointmentValid = false;
            result.AppointmentMessage = "Appointment not found";
            return result;
        }

        result.AppointmentValid = true;
        result.AppointmentMessage = "Appointment found";

        // 2. Check patient exists
        if (appointment.Patient == null)
        {
            result.PatientValid = false;
            result.PatientMessage = "Patient not found";
            return result;
        }

        result.PatientValid = true;
        result.PatientMessage = "Patient registered";

        // 3. Check bill exists
        var bill = await _context.OpdBills
            .Where(b => b.AppointmentId == appointmentId && b.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (bill == null)
        {
            result.BillValid = false;
            result.BillMessage = "Bill not generated";
            return result;
        }

        result.BillValid = true;
        result.BillMessage = $"Bill #{bill.BillNumber}";
        result.BillId = bill.Id;

        // 4. Check payment status
        if (bill.IsFreeVisit)
        {
            result.PaymentValid = true;
            result.PaymentMessage = "Free visit - no payment required";
            result.AmountDue = 0;
        }
        else if (bill.IsCredit && bill.CreditApprovedBy != null)
        {
            result.PaymentValid = true;
            result.PaymentMessage = "Credit approved";
            result.AmountDue = bill.BalanceDue;
        }
        else if (bill.Status == "paid")
        {
            result.PaymentValid = true;
            result.PaymentMessage = "Payment complete";
            result.AmountDue = 0;
        }
        else
        {
            result.PaymentValid = false;
            result.PaymentMessage = $"Payment pending: ₹{bill.BalanceDue:N2}";
            result.AmountDue = bill.BalanceDue;
        }

        return result;
    }

    public async Task<CheckInResultDto> CheckInAsync(CheckInRequestDto request, Guid userId)
    {
        var result = new CheckInResultDto();

        // Validate check-in requirements
        var validation = await ValidateCheckInAsync(request.AppointmentId);
        result.Validation = validation;

        // If not emergency and validation fails
        if (!request.IsEmergency && !validation.CanCheckIn)
        {
            result.Success = false;
            result.Message = GetValidationFailureMessage(validation);
            return result;
        }

        // If emergency but basic validation fails
        if (request.IsEmergency && !validation.CanEmergencyCheckIn)
        {
            result.Success = false;
            result.Message = GetValidationFailureMessage(validation);
            return result;
        }

        // Get appointment details
        var appointment = await _context.Appointments
            .Include(a => a.Patient)
            .Where(a => a.Id == request.AppointmentId)
            .FirstOrDefaultAsync();

        if (appointment == null)
        {
            result.Success = false;
            result.Message = "Appointment not found";
            return result;
        }

        // Check if already checked in
        var existingVisit = await _context.Visits
            .Where(v => v.AppointmentId == request.AppointmentId && v.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (existingVisit != null)
        {
            result.Success = false;
            result.Message = "Patient already checked in for this appointment";
            result.Visit = MapToDto(existingVisit);
            return result;
        }

        // Get bill (might not exist for emergency)
        var bill = await _context.OpdBills
            .Where(b => b.AppointmentId == request.AppointmentId && b.DeletedAt == null)
            .FirstOrDefaultAsync();

        // Get branchId from bill, or use first available branch as fallback
        var branchId = bill?.BranchId;
        if (branchId == null || branchId == Guid.Empty)
        {
            // Fallback: get first active branch for tenant
            var fallbackBranch = await _context.Branches
                .Where(b => b.TenantId == appointment.TenantId && b.DeletedAt == null)
                .FirstOrDefaultAsync();
            branchId = fallbackBranch?.Id ?? Guid.Empty;
        }

        // Generate token
        var tokenNumber = await GenerateTokenAsync(branchId.Value);
        var tokenParts = tokenNumber.Split('-');
        var tokenSequence = int.Parse(tokenParts.Last());

        // Create Visit
        var visit = new Visit
        {
            Id = Guid.NewGuid(),
            TenantId = appointment.TenantId,
            PatientId = appointment.PatientId,
            AppointmentId = appointment.Id,
            OpdBillId = bill?.Id,
            BranchId = branchId.Value,
            ConsultantId = appointment.DoctorId,
            DepartmentId = appointment.DepartmentId,
            VisitType = appointment.AppointmentType?.ToLower() ?? "new",
            VisitCategory = bill?.IsFreeVisit == true ? "free" : "paid",
            Status = "checked_in",
            TokenNumber = tokenNumber,
            TokenSequence = tokenSequence,
            CheckedInAt = DateTime.UtcNow,
            CheckedInBy = userId,
            CurrentStation = "reception",
            IsEmergency = request.IsEmergency,
            EmergencyAuthorizedBy = request.IsEmergency ? userId : null,
            EmergencyReason = request.EmergencyReason,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow,
            CreatedByUserId = userId
        };

        _context.Visits.Add(visit);

        // Update appointment status
        appointment.Status = "checked_in";
        appointment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Patient checked in: Visit {VisitId}, Token {Token}, Emergency: {IsEmergency}",
            visit.Id, tokenNumber, request.IsEmergency);

        // Reload with relations
        var createdVisit = await GetByIdAsync(visit.Id);
        
        result.Success = true;
        result.Message = "Check-in successful";
        result.Visit = createdVisit;
        result.TokenNumber = tokenNumber;

        return result;
    }

    public async Task<VisitDto?> SendToAsync(SendToRequestDto request, Guid userId)
    {
        var visit = await _context.Visits
            .Where(v => v.Id == request.VisitId && v.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (visit == null)
        {
            return null;
        }

        visit.CurrentStation = request.Station;
        visit.AssignedTo = request.AssignToUserId;
        visit.AssignedAt = DateTime.UtcNow;
        visit.UpdatedAt = DateTime.UtcNow;
        visit.UpdatedByUserId = userId;

        // Update status based on station
        visit.Status = request.Station switch
        {
            "optometrist" => "with_optometrist",
            "doctor" => "with_doctor",
            "pharmacy" => "at_pharmacy",
            "optical" => "at_optical",
            "completed" => "completed",
            _ => "in_progress"
        };

        await _context.SaveChangesAsync();

        _logger.LogInformation("Visit {VisitId} sent to {Station}, assigned to {AssignedTo}",
            visit.Id, request.Station, request.AssignToUserId);

        return await GetByIdAsync(visit.Id);
    }

    public async Task<VisitDto?> AssignToStaffAsync(Guid visitId, Guid staffId, Guid userId)
    {
        var visit = await _context.Visits
            .Where(v => v.Id == visitId && v.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (visit == null)
        {
            return null;
        }

        visit.AssignedTo = staffId;
        visit.AssignedAt = DateTime.UtcNow;
        visit.UpdatedAt = DateTime.UtcNow;
        visit.UpdatedByUserId = userId;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(visit.Id);
    }

    public async Task<VisitDto?> CompleteVisitAsync(CompleteVisitRequestDto request, Guid userId)
    {
        var visit = await _context.Visits
            .Where(v => v.Id == request.VisitId && v.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (visit == null)
        {
            return null;
        }

        visit.Status = "completed";
        visit.CompletedAt = DateTime.UtcNow;
        visit.CompletedBy = userId;
        visit.Outcome = request.Outcome;
        visit.OutcomeNotes = request.OutcomeNotes;
        visit.UpdatedAt = DateTime.UtcNow;
        visit.UpdatedByUserId = userId;

        // Update appointment status
        var appointment = await _context.Appointments
            .Where(a => a.Id == visit.AppointmentId)
            .FirstOrDefaultAsync();

        if (appointment != null)
        {
            appointment.Status = "Completed";
            appointment.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Visit {VisitId} completed with outcome: {Outcome}",
            visit.Id, request.Outcome);

        return await GetByIdAsync(visit.Id);
    }

    public async Task<string> GenerateTokenAsync(Guid branchId)
    {
        var today = DateTime.UtcNow.Date;
        
        // Get or create token sequence for today
        var tokenSeq = await _context.TokenSequences
            .Where(t => t.BranchId == branchId && t.SequenceDate == today)
            .FirstOrDefaultAsync();

        if (tokenSeq == null)
        {
            // Get branch prefix
            var branch = await _context.Branches
                .Where(b => b.Id == branchId)
                .FirstOrDefaultAsync();

            var prefix = branch?.BranchCode?.ToUpper() ?? "GEN";
            if (prefix.Length > 3) prefix = prefix.Substring(0, 3);

            tokenSeq = new TokenSequence
            {
                Id = Guid.NewGuid(),
                TenantId = branch?.TenantId ?? Guid.Empty,
                BranchId = branchId,
                SequenceDate = today,
                CurrentSequence = 0,
                BranchPrefix = prefix,
                CreatedAt = DateTime.UtcNow
            };
            _context.TokenSequences.Add(tokenSeq);
        }

        // Increment sequence
        tokenSeq.CurrentSequence++;
        tokenSeq.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Format: HYD-001
        return $"{tokenSeq.BranchPrefix}-{tokenSeq.CurrentSequence:D3}";
    }

    public async Task<int> GetTodayVisitCountAsync(Guid branchId)
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        return await _context.Visits
            .Where(v => v.BranchId == branchId 
                && v.DeletedAt == null
                && v.CreatedAt >= today 
                && v.CreatedAt < tomorrow)
            .CountAsync();
    }

    public async Task<int> GetWaitingCountAsync(Guid branchId, string? station = null)
    {
        var query = _context.Visits
            .Where(v => v.BranchId == branchId 
                && v.DeletedAt == null
                && v.Status != "completed" 
                && v.Status != "cancelled");

        if (!string.IsNullOrEmpty(station))
        {
            query = query.Where(v => v.CurrentStation == station);
        }

        return await query.CountAsync();
    }

    /// <summary>
    /// Mark visit as walkout (patient left before completion)
    /// </summary>
    public async Task<VisitDto?> MarkWalkoutAsync(Guid visitId, string reason, Guid userId)
    {
        var visit = await _context.Visits
            .Include(v => v.Patient)
            .Include(v => v.Consultant)
            .Where(v => v.Id == visitId && v.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (visit == null)
        {
            throw new InvalidOperationException("Visit not found");
        }

        if (visit.Status == "completed")
        {
            throw new InvalidOperationException("Cannot mark completed visit as walkout");
        }

        visit.Status = "walkout";
        visit.WalkoutReason = reason;
        visit.WalkoutAt = DateTime.UtcNow;
        visit.UpdatedAt = DateTime.UtcNow;
        visit.UpdatedByUserId = userId;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Visit {VisitId} marked as walkout. Reason: {Reason}", visitId, reason);
        return MapToDto(visit);
    }

    /// <summary>
    /// Create emergency override for visit (allows check-in without payment)
    /// </summary>
    public async Task<VisitDto?> CreateEmergencyOverrideAsync(Guid visitId, string reason, Guid authorizedBy)
    {
        var visit = await _context.Visits
            .Include(v => v.Patient)
            .Include(v => v.Consultant)
            .Where(v => v.Id == visitId && v.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (visit == null)
        {
            throw new InvalidOperationException("Visit not found");
        }

        // EmergencyOverride column removed - using IsEmergency + OverrideReason instead
        visit.OverrideReason = reason;
        visit.IsEmergency = true;
        visit.EmergencyReason = reason;
        visit.EmergencyAuthorizedBy = authorizedBy;
        visit.UpdatedAt = DateTime.UtcNow;
        visit.UpdatedByUserId = authorizedBy;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Emergency override created for visit {VisitId} by user {AuthorizedBy}", visitId, authorizedBy);
        return MapToDto(visit);
    }

    // ============ Private Helpers ============

    private VisitDto MapToDto(Visit visit)
    {
        return new VisitDto
        {
            Id = visit.Id,
            TenantId = visit.TenantId,
            PatientId = visit.PatientId,
            PatientName = visit.Patient != null 
                ? $"{visit.Patient.FirstName} {visit.Patient.LastName}".Trim() 
                : null,
            PatientMrn = visit.Patient?.MedicalRecordNumber,
            AppointmentId = visit.AppointmentId,
            OpdBillId = visit.OpdBillId,
            BillNumber = visit.OpdBill?.BillNumber,
            BranchId = visit.BranchId,
            BranchName = visit.Branch?.Name,
            ConsultantId = visit.ConsultantId,
            ConsultantName = visit.Consultant != null 
                ? $"{visit.Consultant.FirstName} {visit.Consultant.LastName}".Trim() 
                : null,
            DepartmentId = visit.DepartmentId,
            DepartmentName = visit.Department?.Name,
            VisitType = visit.VisitType,
            VisitCategory = visit.VisitCategory,
            Status = visit.Status,
            TokenNumber = visit.TokenNumber,
            TokenSequence = visit.TokenSequence,
            CheckedInAt = visit.CheckedInAt,
            CheckedInBy = visit.CheckedInBy,
            CheckedInByName = visit.CheckedInByUser != null 
                ? $"{visit.CheckedInByUser.FirstName} {visit.CheckedInByUser.LastName}".Trim() 
                : null,
            CurrentStation = visit.CurrentStation,
            AssignedTo = visit.AssignedTo,
            AssignedToName = visit.AssignedToUser != null 
                ? $"{visit.AssignedToUser.FirstName} {visit.AssignedToUser.LastName}".Trim() 
                : null,
            AssignedAt = visit.AssignedAt,
            CompletedAt = visit.CompletedAt,
            CompletedBy = visit.CompletedBy,
            CompletedByName = visit.CompletedByUser != null 
                ? $"{visit.CompletedByUser.FirstName} {visit.CompletedByUser.LastName}".Trim() 
                : null,
            Outcome = visit.Outcome,
            OutcomeNotes = visit.OutcomeNotes,
            IsEmergency = visit.IsEmergency,
            EmergencyReason = visit.EmergencyReason,
            Notes = visit.Notes,
            CreatedAt = visit.CreatedAt,
            UpdatedAt = visit.UpdatedAt
        };
    }

    private VisitListDto MapToListDto(Visit visit)
    {
        return new VisitListDto
        {
            Id = visit.Id,
            PatientId = visit.PatientId,
            PatientName = visit.Patient != null 
                ? $"{visit.Patient.FirstName} {visit.Patient.LastName}".Trim() 
                : "",
            PatientMrn = visit.Patient?.MedicalRecordNumber ?? "",
            TokenNumber = visit.TokenNumber,
            VisitType = visit.VisitType,
            Status = visit.Status,
            CurrentStation = visit.CurrentStation,
            AssignedToName = visit.AssignedToUser != null 
                ? $"{visit.AssignedToUser.FirstName} {visit.AssignedToUser.LastName}".Trim() 
                : null,
            ConsultantName = visit.Consultant != null 
                ? $"{visit.Consultant.FirstName} {visit.Consultant.LastName}".Trim() 
                : null,
            CheckedInAt = visit.CheckedInAt,
            IsEmergency = visit.IsEmergency,
            CreatedAt = visit.CreatedAt
        };
    }

    private string GetValidationFailureMessage(CheckInValidationDto validation)
    {
        if (!validation.PatientValid) return validation.PatientMessage ?? "Patient validation failed";
        if (!validation.AppointmentValid) return validation.AppointmentMessage ?? "Appointment validation failed";
        if (!validation.BillValid) return validation.BillMessage ?? "Bill validation failed";
        if (!validation.PaymentValid) return validation.PaymentMessage ?? "Payment validation failed";
        return "Unknown validation error";
    }
}
