# 🎟️ Visit Queue Implementation Guide

## ✅ Quick Fix Completed (Jan 29, 2026)

### What Was Fixed
1. **Calendar now shows checked-in appointments** - Appointments no longer disappear after check-in
2. **Purple color indicator** - Checked-in appointments show in purple (#8B5CF6)
3. **Visual checkmark** - ✓ prefix added to patient names for checked-in appointments
4. **Ticket emoji badge** - 🎟️ shown on checked-in appointment cards
5. **Legend updated** - Calendar legend includes "Checked In" status

### Files Modified
- `apps/hospital-portal-web/src/components/appointments/EnhancedAppointmentCalendar.tsx`
- `apps/hospital-portal-web/src/components/appointments/AppointmentCalendar.tsx`

---

## 📋 Next Priority: Visit Queue Dashboard

### Overview
Create a real-time dashboard showing today's checked-in patients waiting for consultation.

### User Story
```
AS a front desk staff OR doctor
I WANT to see all checked-in patients in a queue
SO THAT I can call the next patient for consultation
```

### Data Flow
```
Check-In (Front Desk)
    ↓
Visit Record Created (status: "checked_in", token_number: 1)
    ↓
Visit Queue Dashboard (Auto-refreshes)
    ↓
Doctor Calls Patient (status → "in_progress")
    ↓
Consultation Complete (status → "completed")
```

---

## 🎨 UI Design

### Visit Queue Page Layout
```
┌──────────────────────────────────────────────────────────────┐
│ 🏥 Visit Queue - January 29, 2026                            │
├──────────────────────────────────────────────────────────────┤
│ 📊 Summary Stats                                             │
│ ┌────────────┬────────────┬────────────┬────────────┐       │
│ │ 🪑 Waiting │ 👨‍⚕️ Active │ ✅ Done    │ ⏱️ Avg Wait │       │
│ │     12     │      5     │     23     │   18 mins  │       │
│ └────────────┴────────────┴────────────┴────────────┘       │
├──────────────────────────────────────────────────────────────┤
│ 🔍 Filters                                                   │
│ [All Departments ▼] [All Status ▼] [🔄 Auto-refresh: ON]   │
├──────────────────────────────────────────────────────────────┤
│ Waiting Queue (12)                                           │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ 🎟️ #1  👤 John Doe (MRN: 12345)                         │  │
│ │ 🏥 B-Scan Ultrasound                                     │  │
│ │ ⏰ Checked in: 10:15 AM (15 mins ago)                   │  │
│ │ 📋 Bill: OPD-2026-000008 (₹500 paid)                   │  │
│ │ [📢 Call Patient] [▶️ Start Consultation]               │  │
│ └────────────────────────────────────────────────────────┘  │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ 🎟️ #2  👤 Jane Smith (MRN: 12346)                       │  │
│ │ 🏥 General Medicine                                      │  │
│ │ ⏰ Checked in: 10:20 AM (10 mins ago)                   │  │
│ │ 📋 Bill: OPD-2026-000009 (₹350 paid)                   │  │
│ │ [📢 Call Patient] [▶️ Start Consultation]               │  │
│ └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔧 Implementation Steps

### Phase 1: API Integration (Backend Ready ✅)
**Endpoint:** `GET /api/visits?status=checked_in&date=2026-01-29`

**Response:**
```json
{
  "visits": [
    {
      "id": "guid",
      "tokenNumber": 1,
      "patientId": "guid",
      "patientName": "John Doe",
      "patientMrn": "12345",
      "departmentId": "guid",
      "departmentName": "B-Scan Ultrasound",
      "opdBillId": "guid",
      "billNumber": "OPD-2026-000008",
      "checkedInAt": "2026-01-29T10:15:00Z",
      "status": "checked_in",
      "appointmentId": "guid"
    }
  ]
}
```

### Phase 2: Frontend Component Structure
```
apps/hospital-portal-web/src/
├── app/
│   └── dashboard/
│       └── visit-queue/
│           └── page.tsx              ← Main queue page
├── components/
│   └── visits/
│       ├── VisitQueue.tsx            ← Queue container component
│       ├── VisitCard.tsx             ← Individual visit card
│       ├── VisitStats.tsx            ← Summary statistics
│       ├── CallPatientModal.tsx      ← Call patient dialog
│       └── StartConsultationModal.tsx ← Start consultation dialog
└── lib/
    └── api/
        └── visits.api.ts             ← Already exists, add getQueue()
```

### Phase 3: Key Features

#### 1. Auto-Refresh (30-second interval)
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    fetchVisitQueue();
  }, 30000);
  return () => clearInterval(interval);
}, []);
```

#### 2. Call Patient Function
```typescript
const callPatient = async (visitId: string, tokenNumber: number) => {
  // Show notification
  toast.info(`Calling Token #${tokenNumber}`);
  
  // Optional: Audio announcement
  const audio = new Audio('/sounds/patient-call.mp3');
  await audio.play();
  
  // Optional: Display on TV screen via WebSocket
  websocket.send({ type: 'CALL_PATIENT', token: tokenNumber });
};
```

#### 3. Start Consultation Function
```typescript
const startConsultation = async (visitId: string) => {
  await visitsApi.updateVisitStatus(visitId, {
    status: 'in_progress',
    currentStation: 'consultation_room_1'
  });
  
  // Refresh queue
  await fetchVisitQueue();
  
  toast.success('Consultation started');
};
```

#### 4. Real-Time Wait Time Calculation
```typescript
const calculateWaitTime = (checkedInAt: string) => {
  const now = new Date();
  const checkedIn = new Date(checkedInAt);
  const diffMs = now.getTime() - checkedIn.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  return diffMins < 60 
    ? `${diffMins} mins` 
    : `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;
};
```

---

## 🎯 API Endpoints to Add (Backend)

### 1. Get Visit Queue
```http
GET /api/visits/queue?date=2026-01-29&departmentId=xxx&status=checked_in
```

### 2. Update Visit Status
```http
PATCH /api/visits/{visitId}/status
{
  "status": "in_progress",
  "currentStation": "consultation_room_1"
}
```

### 3. Call Patient (Optional)
```http
POST /api/visits/{visitId}/call
{
  "callType": "audio|display|both"
}
```

---

## 📊 Backend Changes Needed

### VisitsController.cs - New Endpoints

```csharp
[HttpGet("queue")]
[RequirePermission("visit.view")]
public async Task<IActionResult> GetQueue(
    [FromQuery] DateTime? date = null,
    [FromQuery] Guid? departmentId = null,
    [FromQuery] string? status = null)
{
    var tenantId = GetTenantId();
    var visits = await _visitService.GetQueueAsync(
        tenantId, 
        date ?? DateTime.UtcNow.Date, 
        departmentId, 
        status ?? "checked_in"
    );
    return Ok(visits);
}

[HttpPatch("{visitId}/status")]
[RequirePermission("visit.update")]
public async Task<IActionResult> UpdateVisitStatus(
    Guid visitId, 
    [FromBody] UpdateVisitStatusDto request)
{
    var userId = GetUserId();
    await _visitService.UpdateVisitStatusAsync(visitId, request, userId);
    return Ok(new { message = "Visit status updated" });
}
```

### VisitService.cs - New Methods

```csharp
public async Task<List<VisitQueueDto>> GetQueueAsync(
    Guid tenantId, 
    DateTime date, 
    Guid? departmentId, 
    string status)
{
    var query = _context.Visits
        .Include(v => v.Patient)
        .Include(v => v.Department)
        .Include(v => v.OpdBill)
        .Where(v => v.TenantId == tenantId 
            && v.DeletedAt == null 
            && v.CheckedInAt.Date == date.Date 
            && v.Status == status);
    
    if (departmentId.HasValue)
        query = query.Where(v => v.DepartmentId == departmentId.Value);
    
    return await query
        .OrderBy(v => v.TokenNumber)
        .Select(v => new VisitQueueDto
        {
            Id = v.Id,
            TokenNumber = v.TokenNumber,
            PatientId = v.PatientId,
            PatientName = $"{v.Patient.FirstName} {v.Patient.LastName}",
            PatientMrn = v.Patient.MedicalRecordNumber,
            DepartmentId = v.DepartmentId,
            DepartmentName = v.Department.DepartmentName,
            OpdBillId = v.OpdBillId,
            BillNumber = v.OpdBill.BillNumber,
            CheckedInAt = v.CheckedInAt,
            Status = v.Status,
            AppointmentId = v.AppointmentId,
            WaitTimeMinutes = (int)(DateTime.UtcNow - v.CheckedInAt).TotalMinutes
        })
        .ToListAsync();
}
```

---

## 🚀 Development Timeline

### Immediate (Quick Fix) - ✅ COMPLETED
- [x] Calendar shows checked-in appointments
- [x] Purple color indicator
- [x] Visual checkmark and badge

### Phase 1 (1-2 hours)
- [ ] Create VisitQueue.tsx component
- [ ] Create VisitCard.tsx component
- [ ] Add GET /api/visits/queue endpoint
- [ ] Basic queue display with token numbers

### Phase 2 (1-2 hours)
- [ ] Add auto-refresh (30-second interval)
- [ ] Add wait time calculation
- [ ] Add department filter
- [ ] Add summary statistics

### Phase 3 (1-2 hours)
- [ ] Add "Start Consultation" button
- [ ] Add PATCH /api/visits/{id}/status endpoint
- [ ] Add status update logic
- [ ] Add success notifications

### Phase 4 (Optional - Future)
- [ ] Add "Call Patient" audio notification
- [ ] Add WebSocket for real-time updates
- [ ] Add TV display screen integration
- [ ] Add queue position estimation

---

## 🔗 Navigation Integration

Add to sidebar (apps/hospital-portal-web/src/components/layout/Sidebar.tsx):

```typescript
{
  name: 'Visit Queue',
  href: '/dashboard/visit-queue',
  icon: Users,
  badge: waitingCount, // Show number of waiting patients
  permissions: ['visit.view']
}
```

---

## 📝 Next Steps

1. **Review this plan** with team
2. **Prioritize features** (basic queue vs full features)
3. **Start with Phase 1** (basic queue display)
4. **Test with real data** from today's check-ins
5. **Iterate based on feedback** from front desk staff

---

## ✅ Testing Checklist

- [ ] Visit queue loads with today's checked-in patients
- [ ] Token numbers display correctly (1, 2, 3...)
- [ ] Wait time calculates accurately
- [ ] "Start Consultation" changes status to in_progress
- [ ] Auto-refresh works every 30 seconds
- [ ] Department filter works
- [ ] Empty state shows when no patients waiting
- [ ] Mobile responsive design
- [ ] Permissions enforced (visit.view, visit.update)

---

**Created:** January 29, 2026  
**Status:** Quick Fix Deployed ✅ | Visit Queue Planned 📋  
**Next Review:** After Phase 1 completion
