using CounsellingApi.Models;
using CounsellingApi.Models.Entities;
using CounsellingApi.Repositories;

namespace CounsellingApi.Services;

/// <summary>
/// Core business logic for the counselling workflow.
/// All state transitions are validated by <see cref="StateMachineService"/> before being persisted.
/// Every mutating operation appends an audit log entry via <see cref="AuditService"/>.
/// </summary>
public class CounsellingService
{
    private readonly ICounsellingRepository _repo;
    private readonly StateMachineService _state;
    private readonly AuditService _audit;
    private readonly INotificationSender _notifier;

    public CounsellingService(
        ICounsellingRepository repo,
        StateMachineService state,
        AuditService audit,
        INotificationSender notifier)
    {
        _repo     = repo;
        _state    = state;
        _audit    = audit;
        _notifier = notifier;
    }

    /// <summary>
    /// Starts counselling for a patient (Pending → Processed).
    /// Creates a new record if none exists, locks it to the acting user.
    /// </summary>
    public async Task<Guid> Start(Guid patientId, Guid tenantId, string user)
    {
        var record = await _repo.GetByPatient(patientId);

        if (record == null)
        {
            // Bootstrap a new counselling record in Pending state, then transition immediately.
            record = new PatientCounselling
            {
                Id               = Guid.NewGuid(),
                TenantId         = tenantId,
                PatientId        = patientId,
                Status           = "Pending",
                CreatedAt        = DateTime.UtcNow,
                UpdatedAt        = DateTime.UtcNow,
                CreatedByUserId  = user,
                UpdatedByUserId  = user,
                RecordStatus     = "active"
            };

            _state.Validate(record.Status, "Processed");

            record.PreviousStatus = record.Status;
            record.Status         = "Processed";
            record.IsLocked       = true;
            record.LockedBy       = user;

            await _repo.Add(record);
        }
        else
        {
            _state.Validate(record.Status, "Processed");

            record.PreviousStatus  = record.Status;
            record.Status          = "Processed";
            record.IsLocked        = true;
            record.LockedBy        = user;
            record.UpdatedByUserId = user;
            record.UpdatedAt       = DateTime.UtcNow;

            await _repo.Update(record);
        }

        // Use patientId (the auth-service session UUID) as the audit key — this is the
        // same ID the frontend passes when querying history, ensuring StartCounselling
        // is returned alongside all other entries (Save, Decision, Schedule, etc.).
        await _audit.Log(patientId, "StartCounselling", user);
        return record.Id;
    }

    /// <summary>
    /// Saves in-progress package selection without changing the workflow state.
    /// </summary>
    public async Task Save(Guid id, SaveCounsellingRequest request)
    {
        var record = await _repo.Get(id)
            ?? throw new KeyNotFoundException($"Counselling record {id} not found.");

        if (request.PackageId.HasValue)
            record.PackageId = request.PackageId;

        if (request.PackageDetails != null)
            record.PackageDetails = request.PackageDetails;

        if (request.PaymentType != null)
            record.PaymentType = request.PaymentType;

        if (request.InsuranceCompany != null)
            record.InsuranceCompany = request.InsuranceCompany;

        if (request.InvestigationIds != null)
            record.InvestigationIds = request.InvestigationIds;

        if (request.IsPackageEdited.HasValue)
            record.IsPackageEdited = request.IsPackageEdited.Value;

        record.UpdatedByUserId = request.PerformedBy;
        record.UpdatedAt       = DateTime.UtcNow;

        await _repo.Update(record);
        await _audit.Log(id, "SaveCounselling", request.PerformedBy);

        // Log individual field changes for full audit trail (HIPAA) — one DB round-trip
        if (request.FieldChanges?.Count > 0)
        {
            await _audit.LogFieldChangeBatch(
                id,
                request.FieldChanges.Select(c => (c.FieldName, c.OldValue, c.NewValue)),
                request.PerformedBy);
        }
    }

    /// <summary>
    /// Records the patient's decision and advances state accordingly.
    /// "Interested"    — from Processed → Done
    /// "NotInterested" — from Processed or Done → RepeatCounselling
    /// "NeedsTime"     — from Processed or Done → RepeatCounselling
    /// </summary>
    public async Task Decision(Guid id, string decision, string user,
        string? followUpDate = null, string? followUpReason = null)
    {
        var record = await _repo.Get(id)
            ?? throw new KeyNotFoundException($"Counselling record {id} not found.");

        // NeedsTime maps to RepeatCounselling in the state machine
        var effectiveDecision = decision == "Interested" ? "Interested" : "NotInterested";
        var next = effectiveDecision == "Interested" ? "Done" : "RepeatCounselling";
        _state.Validate(record.Status, next);

        record.PreviousStatus      = record.Status;
        record.Status              = next;
        record.DecisionType        = decision;   // preserve original (NeedsTime stays as NeedsTime)
        record.DecisionTimestamp   = DateTime.UtcNow;
        record.UpdatedByUserId     = user;
        record.UpdatedAt           = DateTime.UtcNow;

        if (followUpDate != null)   record.FollowUpDate   = followUpDate;
        if (followUpReason != null) record.FollowUpReason = followUpReason;

        await _repo.Update(record);
        await _audit.Log(id, "Decision", user);

        // Fire notifications to staff who requested price overrides — Done path only.
        if (next == "Done")
            await SendPendingOverrideNotifications(record);
    }

    private async Task SendPendingOverrideNotifications(PatientCounselling record)
    {
        var pending = await _repo.GetUnsentStaffOverrides(record.Id);
        foreach (var ov in pending)
        {
            await _notifier.SendFinalizationNotice(record, ov);
            await _repo.MarkNotificationSent(ov.Id);
        }
    }

    /// <summary>Records a counsellor price override for the session.</summary>
    public async Task AddPriceOverride(Guid counsellingId, CreatePriceOverrideRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Reason))
            throw new ArgumentException("Reason is required for a price override.");

        var entity = new SessionPriceOverride
        {
            Id                  = Guid.NewGuid(),
            TenantId            = req.TenantId,
            CounsellingId       = counsellingId,
            VariantId           = req.VariantId,
            VariantName         = req.VariantName,
            BasePrice           = req.BasePrice,
            OverriddenPrice     = req.OverriddenPrice,
            PriceType           = req.PriceType,
            Reason              = req.Reason,
            Remarks             = req.Remarks,
            RequestedByType     = req.RequestedByType,
            RequestedByUserId   = req.RequestedByUserId,
            RequestedByName     = req.RequestedByName,
            RequestedByContact  = req.RequestedByContact,
            NotificationSent    = false,
            CreatedAt           = DateTime.UtcNow,
            UpdatedAt           = DateTime.UtcNow,
            CreatedByUserId     = req.PerformedBy,
            UpdatedByUserId     = req.PerformedBy
        };

        await _repo.AddPriceOverride(entity);
        await _audit.Log(counsellingId, "PriceOverride", req.PerformedBy);
    }

    public async Task<bool> SoftDeletePriceOverride(Guid overrideId, string performedBy)
        => await _repo.SoftDeletePriceOverride(overrideId, performedBy);

    public async Task<SessionPriceOverride?> UpdatePriceOverride(Guid overrideId, UpdatePriceOverrideRequest req)
    {
        if (req.OverriddenPrice <= 0)
            throw new ArgumentException("overriddenPrice must be positive.");
        if (string.IsNullOrWhiteSpace(req.Reason))
            throw new ArgumentException("Reason is required.");
        return await _repo.UpdatePriceOverride(overrideId, req.OverriddenPrice, req.Reason, req.Remarks, req.PerformedBy);
    }

    /// <summary>Returns all price overrides recorded for a session, newest first.</summary>
    public async Task<List<SessionPriceOverride>> GetPriceOverrides(Guid counsellingId)
        => await _repo.GetPriceOverrides(counsellingId);
    

    /// <summary>
    /// Sets a tentative surgery/follow-up date on the counselling record.
    /// When the current status is Done the record is flagged as rescheduled
    /// (status does NOT change — this is a schedule adjustment only).
    /// </summary>
    public async Task Schedule(Guid id, DateTime scheduledDate, string user)
    {
        var record = await _repo.Get(id)
            ?? throw new KeyNotFoundException($"Counselling record {id} not found.");

        record.ScheduledDate   = scheduledDate;
        record.UpdatedByUserId = user;
        record.UpdatedAt       = DateTime.UtcNow;

        // If already Done, flag as rescheduled (not a status change).
        if (record.Status == "Done")
            record.IsRescheduled = true;

        await _repo.Update(record);
        await _audit.Log(id, "Schedule", user);
    }

    /// <summary>
    /// Updates the selected surgery package details on the counselling record.
    /// When the record is currently Done, automatically snapshots the existing
    /// package and transitions the status to AddOnSurgery (upgrade workflow).
    /// </summary>
    public async Task UpdatePackage(Guid id, Guid packageId, string? packageDetails, string user)
    {
        var record = await _repo.Get(id)
            ?? throw new KeyNotFoundException($"Counselling record {id} not found.");

        // When a Done session receives a package change, treat it as an upgrade:
        // snapshot the current package then transition to AddOnSurgery.
        if (record.Status == "Done")
        {
            record.PreviousPackageDetails = record.PackageDetails;

            // Extract the numeric amount from the existing JSON blob (stored as { rate: ... })
            if (!string.IsNullOrEmpty(record.PackageDetails))
            {
                try
                {
                    var doc = System.Text.Json.JsonDocument.Parse(record.PackageDetails);
                    if (doc.RootElement.TryGetProperty("rate", out var rateProp) &&
                        rateProp.TryGetDecimal(out var prevAmount))
                    {
                        record.PreviousPackageAmount = prevAmount;
                    }
                }
                catch { /* non-critical — leave null if blob is malformed */ }
            }

            record.PreviousStatus = record.Status;
            record.Status          = "AddOnSurgery";
        }

        record.PackageId       = packageId;
        record.PackageDetails  = packageDetails;
        record.IsPackageEdited = true;
        record.UpdatedByUserId = user;
        record.UpdatedAt       = DateTime.UtcNow;

        await _repo.Update(record);
        await _audit.Log(id, "UpdatePackage", user);
    }

    /// <summary>
    /// Re-opens counselling from Done back to Processed so the user can change
    /// the selected procedure. State machine: Done → Processed.
    /// </summary>
    public async Task ReEvaluate(Guid id, string user)
    {
        var record = await _repo.Get(id)
            ?? throw new KeyNotFoundException($"Counselling record {id} not found.");

        _state.Validate(record.Status, "Processed");

        record.PreviousStatus  = record.Status;
        record.Status          = "Processed";
        record.IsLocked        = true;
        record.LockedBy        = user;
        record.UpdatedByUserId = user;
        record.UpdatedAt       = DateTime.UtcNow;

        await _repo.Update(record);
        await _audit.Log(id, "ReEvaluate", user);
    }

    /// <summary>
    /// Transitions a Done session to AddOnSurgery — triggered when the counsellor
    /// applies a price override or package upgrade after the initial Done decision.
    /// State machine: Done → AddOnSurgery.
    /// </summary>
    public async Task AddOnSurgery(Guid id, string? reason, string user)
    {
        var record = await _repo.Get(id)
            ?? throw new KeyNotFoundException($"Counselling record {id} not found.");

        _state.Validate(record.Status, "AddOnSurgery");

        record.PreviousStatus  = record.Status;
        record.Status          = "AddOnSurgery";
        record.IsPackageEdited = true;
        record.AddonReason     = reason;
        record.UpdatedByUserId = user;
        record.UpdatedAt       = DateTime.UtcNow;

        await _repo.Update(record);
        await _audit.Log(id, "AddOnSurgery", user);
    }

    /// <summary>
    /// Returns the full audit trail for a counselling session, newest-first.
    /// </summary>
    public async Task<List<AuditLogDto>> GetHistory(Guid id)
    {
        var logs = await _repo.GetAuditLogs(id);
        return logs.Select(l => new AuditLogDto
        {
            Id              = l.Id,
            ChangeType      = l.ActionType,
            FieldName       = l.FieldName,
            OldValue        = l.OldValue,
            NewValue        = l.NewValue,
            ChangedAt       = l.PerformedAt,
            ChangedByUserId = l.PerformedBy,
        }).ToList();
    }

    /// <summary>
    /// Returns the current snapshot of a counselling record by its ID (or by patient ID fallback).
    /// Returns null when no record exists — the frontend treats absence gracefully.
    /// Used by the session page on load to restore decision, package, schedule, and payment details.
    /// </summary>
    public async Task<CounsellingRecordDto?> GetById(Guid id)
    {
        var record = await _repo.Get(id);
        if (record == null) return null;

        return new CounsellingRecordDto
        {
            Id                  = record.Id,
            PatientId           = record.PatientId,
            TenantId            = record.TenantId,
            Status              = record.Status,
            PreviousStatus      = record.PreviousStatus,
            IsLocked            = record.IsLocked,
            LockedBy            = record.LockedBy,
            DecisionType        = record.DecisionType,
            DecisionTimestamp   = record.DecisionTimestamp,
            ScheduledDate       = record.ScheduledDate,
            PackageId           = record.PackageId,
            PackageDetails      = record.PackageDetails,
            PaymentType         = record.PaymentType,
            InsuranceCompany    = record.InsuranceCompany,
            IsRescheduled       = record.IsRescheduled,
            InvestigationIds    = record.InvestigationIds,
            IsPackageEdited     = record.IsPackageEdited,
            FollowUpDate        = record.FollowUpDate,
            FollowUpReason      = record.FollowUpReason,
            CreatedAt           = record.CreatedAt,
            UpdatedAt           = record.UpdatedAt,
        };
    }
}
