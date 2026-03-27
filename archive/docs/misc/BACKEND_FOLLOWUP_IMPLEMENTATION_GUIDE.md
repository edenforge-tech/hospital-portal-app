# Backend Implementation Guide - Follow-up Management System

**Date:** January 28, 2026  
**Status:** Models & DTOs Complete ✅ | Services & Controllers Pending ⏳  
**Total Endpoints:** 14 across 4 controllers

---

## ✅ COMPLETED: Database Models & DTOs

### Entity Models Created (7 files):
1. ✅ [FollowUpAppointment.cs](../microservices/auth-service/AuthService/Models/FollowUpAppointment.cs) - Follow-up scheduling
2. ✅ [PostOpCareSchedule.cs](../microservices/auth-service/AuthService/Models/PostOpCareSchedule.cs) - Post-op care templates
3. ✅ [PostOpVisit.cs](../microservices/auth-service/AuthService/Models/PostOpVisit.cs) - Individual visit tracking
4. ✅ [PostOpMedication.cs](../microservices/auth-service/AuthService/Models/PostOpMedication.cs) - Post-op medications
5. ✅ [TreatmentAdherence.cs](../microservices/auth-service/AuthService/Models/TreatmentAdherence.cs) - Chronic treatment tracking
6. ✅ [MedicationAdherence.cs](../microservices/auth-service/AuthService/Models/MedicationAdherence.cs) - Medication compliance
7. ✅ [PatientReminder.cs](../microservices/auth-service/AuthService/Models/PatientReminder.cs) - Multi-channel reminders

### DTOs Created (4 files):
1. ✅ [FollowUpDtos.cs](../microservices/auth-service/AuthService/DTOs/FollowUp/FollowUpDtos.cs) - CRUD DTOs
2. ✅ [PostOpCareDtos.cs](../microservices/auth-service/AuthService/DTOs/FollowUp/PostOpCareDtos.cs) - Post-op DTOs
3. ✅ [AdherenceDtos.cs](../microservices/auth-service/AuthService/DTOs/FollowUp/AdherenceDtos.cs) - Adherence DTOs
4. ✅ [ReminderDtos.cs](../microservices/auth-service/AuthService/DTOs/FollowUp/ReminderDtos.cs) - Reminder DTOs

### AppDbContext Updated:
✅ Added 7 new DbSets in [AppDbContext.cs](../microservices/auth-service/AuthService/Context/AppDbContext.cs) lines 126-133

---

## ⏳ PENDING: Service Layer (Step 1)

### IFollowUpService.cs
**Location:** `microservices/auth-service/AuthService/Services/IFollowUpService.cs`

```csharp
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AuthService.DTOs.FollowUp;

namespace AuthService.Services
{
    public interface IFollowUpService
    {
        Task<List<FollowUpAppointmentDto>> GetFollowUpsAsync(FollowUpFiltersDto filters);
        Task<FollowUpAppointmentDto?> GetFollowUpByIdAsync(Guid id);
        Task<FollowUpAppointmentDto> CreateFollowUpAsync(CreateFollowUpDto dto, Guid userId);
        Task<FollowUpAppointmentDto> UpdateFollowUpAsync(Guid id, UpdateFollowUpDto dto, Guid userId);
        Task<FollowUpAppointmentDto> CompleteFollowUpAsync(Guid id, string outcome, Guid userId);
        Task<FollowUpAppointmentDto> RescheduleFollowUpAsync(Guid id, DateTime newDate, string? newTime, Guid userId);
        Task<bool> DeleteFollowUpAsync(Guid id, Guid userId);
    }
}
```

### IPostOpCareService.cs
**Location:** `microservices/auth-service/AuthService/Services/IPostOpCareService.cs`

```csharp
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AuthService.DTOs.FollowUp;

namespace AuthService.Services
{
    public interface IPostOpCareService
    {
        Task<List<PostOpCareDto>> GetActivePostOpPatientsAsync();
        Task<PostOpCareDto?> GetPostOpCareByPatientIdAsync(Guid patientId);
        Task<PostOpCareDto> CreatePostOpCareScheduleAsync(Guid patientId, Guid surgeryId, Guid userId);
        Task<PostOpVisitDto> CompleteVisitAsync(Guid visitId, CompleteVisitDto dto, Guid userId);
        Task UpdateMedicationAdherenceAsync(Guid scheduleId, List<UpdateMedicationAdherenceDto> medications, Guid userId);
    }
}
```

### IAdherenceService.cs
**Location:** `microservices/auth-service/AuthService/Services/IAdherenceService.cs`

```csharp
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AuthService.DTOs.FollowUp;

namespace AuthService.Services
{
    public interface IAdherenceService
    {
        Task<TreatmentAdherenceDto?> GetPatientAdherenceAsync(Guid patientId);
        Task<List<HighRiskAdherenceDto>> GetHighRiskPatientsAsync();
        Task<TreatmentAdherenceDto> UpdateAdherenceAsync(Guid adherenceId, Guid userId);
        Task<List<string>> GenerateRecommendationsAsync(Guid adherenceId);
    }
}
```

### IReminderService.cs
**Location:** `microservices/auth-service/AuthService/Services/IReminderService.cs`

```csharp
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AuthService.DTOs.FollowUp;

namespace AuthService.Services
{
    public interface IReminderService
    {
        Task<List<PatientReminderDto>> GetRemindersAsync(ReminderFiltersDto filters);
        Task<PatientReminderDto> CreateReminderAsync(CreateReminderDto dto, Guid userId);
        Task<PatientReminderDto> SendReminderAsync(Guid reminderId, List<string> channels, Guid userId);
        Task<PatientReminderDto> AcknowledgeReminderAsync(Guid reminderId);
        Task<int> ProcessScheduledRemindersAsync(); // Background job
    }
}
```

---

## ⏳ PENDING: Controllers (Step 2)

### FollowUpsController.cs
**Location:** `microservices/auth-service/AuthService/Controllers/FollowUpsController.cs`

**Endpoints:**
1. `GET /api/follow-ups?status={status}&priority={priority}` - List follow-ups
2. `POST /api/follow-ups` - Create follow-up
3. `PUT /api/follow-ups/{id}/complete` - Mark completed
4. `PUT /api/follow-ups/{id}/reschedule` - Reschedule

**Permissions Required:**
- `followup.read` - View follow-ups
- `followup.create` - Schedule new follow-ups
- `followup.update` - Modify/complete follow-ups
- `followup.delete` - Cancel follow-ups

**Example:**
```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FollowUpsController : ControllerBase
{
    private readonly IFollowUpService _followUpService;

    [HttpGet]
    [RequirePermission("followup.read")]
    public async Task<IActionResult> GetFollowUps([FromQuery] FollowUpFiltersDto filters)
    {
        var followUps = await _followUpService.GetFollowUpsAsync(filters);
        return Ok(new { data = followUps, count = followUps.Count });
    }

    [HttpPost("{id}/complete")]
    [RequirePermission("followup.update")]
    public async Task<IActionResult> CompleteFollowUp(Guid id, [FromBody] CompleteFollowUpDto dto)
    {
        var userId = GetCurrentUserId();
        var result = await _followUpService.CompleteFollowUpAsync(id, dto.Outcome, userId);
        return Ok(result);
    }
    
    // ... other endpoints
}
```

### PostOpCareController.cs
**Endpoints:**
1. `GET /api/post-op-care/active` - Active post-op patients
2. `POST /api/post-op-care/{scheduleId}/visits/{visitId}/complete` - Complete visit
3. `PUT /api/post-op-care/{scheduleId}/medications/adherence` - Update medication adherence

### AdherenceController.cs
**Endpoints:**
1. `GET /api/adherence/patients/{patientId}` - Patient adherence metrics
2. `GET /api/adherence/high-risk` - High-risk patients
3. `POST /api/adherence/{id}/recommendations` - Generate recommendations

### RemindersController.cs
**Endpoints:**
1. `GET /api/reminders?status={status}` - List reminders
2. `POST /api/reminders` - Create reminder
3. `POST /api/reminders/{id}/send` - Send reminder
4. `PUT /api/reminders/{id}/acknowledge` - Acknowledge reminder

---

## ⏳ PENDING: Database Migration (Step 3)

### Migration File
**Command:** `dotnet ef migrations add AddFollowUpManagementTables`

**SQL Generated:** Create 7 tables with:
- ✅ UUID primary keys (`id`)
- ✅ Tenant foreign key (`tenant_id`)
- ✅ Standard audit columns (`created_at`, `updated_at`, `created_by_user_id`, `deleted_at`)
- ✅ Indexes on `tenant_id`, `patient_id`, `status`, `scheduled_date`
- ✅ RLS policies for multi-tenancy

### Indexes to Create:
```sql
CREATE INDEX idx_followup_tenant_status ON follow_up_appointments(tenant_id, status);
CREATE INDEX idx_followup_patient_date ON follow_up_appointments(patient_id, scheduled_date);
CREATE INDEX idx_postop_patient ON post_op_care_schedules(patient_id);
CREATE INDEX idx_reminder_scheduled ON patient_reminders(scheduled_date, status);
```

### RLS Policies:
```sql
-- Follow-up appointments tenant isolation
CREATE POLICY tenant_isolation_followup ON follow_up_appointments
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Post-op care tenant isolation
CREATE POLICY tenant_isolation_postop ON post_op_care_schedules
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- (Repeat for all 7 tables)
```

---

## ⏳ PENDING: Service Registration (Step 4)

### Program.cs Addition
**Location:** `microservices/auth-service/AuthService/Program.cs`

```csharp
// Follow-up Management Services (Phase 2)
builder.Services.AddScoped<IFollowUpService, FollowUpService>();
builder.Services.AddScoped<IPostOpCareService, PostOpCareService>();
builder.Services.AddScoped<IAdherenceService, AdherenceService>();
builder.Services.AddScoped<IReminderService, ReminderService>();
```

---

## 🧪 Testing Checklist

### Via Swagger UI (`http://localhost:5073/swagger`)

**Follow-ups:**
- [ ] GET /api/follow-ups (empty list initially)
- [ ] POST /api/follow-ups (create Day 1 post-op for patient)
- [ ] GET /api/follow-ups?status=scheduled (verify appears)
- [ ] PUT /api/follow-ups/{id}/complete (mark completed, add outcome)
- [ ] GET /api/follow-ups?status=completed (verify status change)

**Post-Op Care:**
- [ ] POST /api/post-op-care (create schedule for cataract surgery patient)
- [ ] GET /api/post-op-care/active (verify patient appears)
- [ ] POST /api/post-op-care/{id}/visits/{visitId}/complete (complete Day 1 visit with VA & IOP)
- [ ] Verify visit marked as completed with clinical data

**Adherence:**
- [ ] GET /api/adherence/patients/{patientId} (view glaucoma patient adherence)
- [ ] Verify medication and appointment adherence calculations
- [ ] GET /api/adherence/high-risk (list patients <70% adherence)
- [ ] POST /api/adherence/{id}/recommendations (get AI-generated recommendations)

**Reminders:**
- [ ] POST /api/reminders (create SMS reminder for tomorrow)
- [ ] GET /api/reminders?status=pending (verify appears)
- [ ] POST /api/reminders/{id}/send (simulate sending SMS)
- [ ] Verify status changes to "sent" with sent_date populated
- [ ] PUT /api/reminders/{id}/acknowledge (patient confirms receipt)

### Database Validation:
```powershell
$env:PGPASSWORD='NewPass@2026!'; psql -h hospitalportal-db-server.postgres.database.azure.com -U postgres -d hospitalportal -c "SELECT COUNT(*) FROM follow_up_appointments;"
```

Expected: Count increases after POST operations

---

## 📊 Implementation Metrics

| Component | Files | Lines | Status |
|-----------|-------|-------|--------|
| Entity Models | 7 | ~700 | ✅ Complete |
| DTOs | 4 | ~300 | ✅ Complete |
| Service Interfaces | 4 | ~200 | ⏳ Pending |
| Service Implementations | 4 | ~1,500 | ⏳ Pending |
| Controllers | 4 | ~800 | ⏳ Pending |
| Migration | 1 | ~400 | ⏳ Pending |
| **Total** | **24 files** | **~3,900 lines** | **30% Complete** |

---

## 🚀 Quick Start Implementation

### Step 1: Build Current State
```powershell
cd "c:\Users\Sam Aluri\Downloads\Hospital Portal\microservices\auth-service\AuthService"
dotnet build
```

Expected Errors: None (models & DTOs compile successfully)

### Step 2: Create Services (Manual Implementation Required)
Create 4 service implementation files following the interface patterns above. Each service needs:
- Constructor with `AppDbContext`, `IHttpContextAccessor`
- Get tenant ID from context
- Filter all queries by `tenant_id` (RLS handles this automatically)
- Map entities to DTOs using manual mapping or AutoMapper
- Handle soft deletes (`deleted_at IS NULL`)
- Audit trail updates (`updated_by_user_id`, `updated_at`)

### Step 3: Create Controllers
Create 4 controller files with proper attributes:
- `[ApiController]`, `[Route("api/[controller]")]`, `[Authorize]`
- `[RequirePermission("...")]` on each endpoint
- Standard response format: `{ data: {...}, message: "...", success: true }`
- Proper HTTP status codes (200, 201, 400, 404, 500)

### Step 4: Run Migration
```powershell
dotnet ef migrations add AddFollowUpManagementTables
dotnet ef database update
```

### Step 5: Test via Swagger
```powershell
dotnet run
```
Navigate to `http://localhost:5073/swagger`

---

## 🔒 Security Considerations

1. **Tenant Isolation:** All queries automatically filtered by RLS
2. **Permission Checks:** Every endpoint has `[RequirePermission]` attribute
3. **Input Validation:** DTOs use `[Required]`, `[MaxLength]` annotations
4. **Soft Deletes:** Never hard delete - set `deleted_at` timestamp
5. **Audit Trail:** Track `created_by_user_id`, `updated_by_user_id`

---

## 📞 Next Steps After Backend Complete

1. ✅ Update frontend to use real APIs (remove mock data)
2. ✅ Implement SMS/Email reminder sending (Twilio, SendGrid integration)
3. ✅ Add background job for automated reminders (Hangfire)
4. ✅ Create adherence calculation algorithm
5. ✅ Build post-op care schedule templates (cataract, LASIK, vitrectomy)

---

**Implementation Status:** 30% Complete (Models & DTOs done)  
**Estimated Time to Complete:** 4-6 hours (Services, Controllers, Migration, Testing)

