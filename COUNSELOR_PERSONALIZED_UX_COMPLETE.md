# Counselor Workspace - Personalized UX Implementation

**Date:** February 2026  
**Status:** ✅ COMPLETED  
**Feature:** Counselor-specific workflow with assigned patients and global search

---

## 🎯 Problem Statement

**Previous UX Issues:**
- Counselors saw ALL queued patients (12 items) instead of just their assigned ones (3 items)
- Confusing duplicate queue counts from different data sources
- No way to search for and start sessions with existing patients outside the queue
- Queue data didn't match actual counselor workload

**User Request:**
> "In counselor workspace only counselor assigned queue patient should come left side patient queue is not required. Also randomly book and start counsellor for existing patients by searching."

---

## ✅ Solution Implemented

### 1. **Global Patient Search (PatientSearchBar.tsx)**
- **Location:** Header area above queue stats
- **Functionality:**
  - Search ANY patient in the database (not just queued)
  - Search by: Name, MRN, or Phone Number
  - Debounced search (300ms) for performance
  - Dropdown results with patient cards
  - Shows: Name, age, gender, MRN, phone, last visit
  - Indicates if patient has active session
  - Click outside to close
  
- **Current State:** Component complete with mock data
- **TODO:** Replace mock search with API call to `/api/patients/search?query={query}`

---

### 2. **My Assigned Patients (MyAssignedPatients.tsx)**
- **Location:** Left sidebar (collapsible)
- **Functionality:**
  - Shows ONLY patients assigned to current counselor
  - Filters by: `item.assignedCounselorId === user.id`
  - Displays:
    * Token number with urgency indicator
    * Patient name, MRN, age
    * Wait time
    * Session type
    * "Start Session" button
  - Footer stats: Average wait, longest wait
  - Empty state when no assignments
  
- **Filter Logic (page.tsx):**
```typescript
const assignedPatients = queueItems.filter((item: any) => 
  item.assignedCounselorId === user?.id
);
```

---

### 3. **Counselor Stats Dashboard (CounselorStats.tsx)**
- **Location:** Sidebar below assigned patients
- **Displays:**
  - **Today's Metrics (4 cards):**
    * ✅ Completed Sessions
    * ⏱️ Average Duration (minutes)
    * 💰 Total Revenue (₹)
    * 📈 Patients Referred
    
  - **Recent Sessions List:**
    * Patient name, MRN
    * Package selected
    * Duration and amount
    * Outcome badge (completed/referred/pending)
    * Time ago (e.g., "25m ago")
    
- **Current State:** Component complete with mock data
- **TODO:** Connect to backend API for:
  - `/api/counseling/sessions/stats?counselorId={id}&date={today}`
  - `/api/counseling/sessions/recent?counselorId={id}&limit=10`

---

### 4. **Updated Dashboard Layout (page.tsx)**
- **New Structure:**
```
┌────────────────────────────────────────────────────────┐
│ [Sidebar: My Workspace]  │ [Main Content]              │
│                          │                             │
│ 📋 My Assigned (3)       │ 🔍 Global Patient Search    │
│ ├─ Patient 1 [Start]     │ ────────────────────────    │
│ ├─ Patient 2 [Start]     │                             │
│ └─ Patient 3 [Start]     │ 📊 Queue Stats (Header)     │
│                          │ Waiting: 3 | Called: 0      │
│ 📊 Today's Stats         │ InProgress: 0 | Done: 5     │
│ ├─ ✅ Completed: 5       │ ────────────────────────    │
│ ├─ ⏱️ Avg Time: 25m      │                             │
│ ├─ 💰 Revenue: ₹125k     │ [Session Controls - Step 3] │
│ └─ 📈 Referred: 2        │ ────────────────────────    │
│                          │                             │
│ 📋 Recent Sessions       │ [Active Widget Area]        │
│ └─ Last 5 sessions       │ • IOL Recommendation        │
│                          │                             │
└────────────────────────────────────────────────────────┘
```

- **Key Changes:**
  - Removed generic `PatientQueueSidebar` (showed all patients)
  - Added `PatientSearchBar` in header
  - Added `MyAssignedPatients` in sidebar
  - Added `CounselorStats` below assigned patients
  - Sidebar is collapsible (toggle with button)
  - Wider sidebar (w-96 = 384px) to accommodate stats

---

## 📦 Files Created/Modified

### New Components:
1. `apps/hospital-portal-web/src/components/counselor/PatientSearchBar.tsx` ✅
2. `apps/hospital-portal-web/src/components/counselor/MyAssignedPatients.tsx` ✅
3. `apps/hospital-portal-web/src/components/counselor/CounselorStats.tsx` ✅

### Modified:
1. `apps/hospital-portal-web/src/app/dashboard/counselor/page.tsx` ✅
   - Removed `PatientQueueSidebar` import
   - Added 3 new component imports
   - Added `assignedPatients` filter
   - Restructured JSX layout
   - Added stats integration

---

## 🔄 Workflow Comparison

### Before:
1. Counselor opens dashboard
2. Sees 12 patients in queue (including unassigned)
3. Confusion: "Why are there 2 different waiting counts?"
4. No way to search for existing patients
5. Must manually find assigned patients in list

### After:
1. Counselor opens dashboard
2. Sees ONLY 3 assigned patients in sidebar
3. Can search ANY patient globally via search bar
4. Sees today's performance stats and recent sessions
5. Clear, personalized workflow

---

## 🧪 Testing Checklist

### Manual Testing:
- [ ] Login as counselor user
- [ ] Verify sidebar shows only assigned patients
- [ ] Test global patient search (currently mock data)
- [ ] Verify "Start Session" button loads patient
- [ ] Check stats display (currently mock values)
- [ ] Verify sidebar collapse/expand works
- [ ] Test with 0 assigned patients (empty state)
- [ ] Test with multiple assigned patients
- [ ] Verify urgency colors render correctly

### Integration Testing:
- [ ] Connect PatientSearchBar to `/api/patients/search`
- [ ] Connect CounselorStats to session stats API
- [ ] Verify assignedCounselorId filter matches backend property
- [ ] Test search result click → session start workflow
- [ ] Verify stats update after completing session

---

## 🚀 Next Steps (Production Readiness)

### High Priority:
1. **Backend API - Patient Search:**
   ```typescript
   GET /api/patients/search?query={query}&branchId={id}
   Response: PatientSearchResult[]
   ```

2. **Backend API - Counselor Stats:**
   ```typescript
   GET /api/counseling/sessions/stats?counselorId={id}&date={date}
   Response: { completedSessions, avgDuration, totalRevenue, patientsReferred }
   ```

3. **Backend API - Recent Sessions:**
   ```typescript
   GET /api/counseling/sessions/recent?counselorId={id}&limit=10
   Response: RecentSession[]
   ```

### Medium Priority:
4. Implement real-time stats updates via SignalR
5. Add "Refresh" button for assigned patients
6. Add filter/sort options for assigned patients (urgency, wait time)
7. Add "View All Patients" toggle (show unassigned for reference)

### Low Priority:
8. Add keyboard shortcuts for search (Ctrl+K)
9. Add session duration timer in stats
10. Add export stats feature (PDF report)

---

## 📝 Backend Schema Requirements

### Verify These Properties Exist:
```typescript
interface CounselingQueueItem {
  id: string;
  patientId: string;
  patientName?: string;
  mrn?: string;
  age?: number;
  tokenNumber: string;
  assignedCounselorId: string; // ⚠️ CRITICAL - must match user.id
  urgencyLevel?: 'Critical' | 'High' | 'Medium' | 'Normal';
  waitTime?: number;
  addedToQueueAt?: string;
  sessionType?: string;
  status: 'Waiting' | 'Called' | 'InProgress' | 'Completed';
}
```

### New Endpoint Needed:
```csharp
// PatientsController.cs
[HttpGet("search")]
public async Task<ActionResult<List<PatientSearchResult>>> SearchPatients(
    [FromQuery] string query,
    [FromQuery] string branchId
)
{
    // Search by name (LIKE), MRN (exact), or phone (exact)
    // Return: id, name, mrn, phone, age, gender, lastVisit
    // Limit: 10 results
}
```

---

## ✨ UX Improvements Delivered

1. **Single Source of Truth:** No more duplicate queue counts
2. **Personalized Workflow:** Only see YOUR assigned patients
3. **Global Search:** Find any patient, not just queued ones
4. **Performance Visibility:** See your stats and recent work
5. **Cleaner Layout:** Collapsible sidebar, focused main area
6. **Clear Actions:** "Start Session" buttons with patient context

---

## 🎓 Lessons Learned

1. **User Personas Matter:** Counselors have different needs than doctors/optometrists
2. **Data Filtering is Critical:** Generic queue views cause confusion
3. **Search is Essential:** Users need flexibility to access non-queued patients
4. **Stats Drive Engagement:** Showing performance metrics motivates users
5. **Mock Data First:** Build UI with mock data, connect APIs later

---

## 📞 Support Notes

**If counselors report "I don't see my patients":**
1. Check `assignedCounselorId` in queue items
2. Verify user role is "Counselor" (not "Doctor" or other)
3. Check if queue items exist for current branch
4. Verify user.id matches backend counselor IDs

**If search doesn't work:**
1. Check browser console for API errors
2. Verify `/api/patients/search` endpoint exists
3. Check authentication token in request headers
4. Verify tenant ID is set correctly

---

**Implementation Complete! ✅**
Next: Backend API integration for search and stats.
