# Phase 2: Auto-Save Draft - End-to-End Test Plan
**Date**: February 19, 2026  
**Status**: Ready for Testing  
**Servers**: ✅ Backend (5073) + Frontend (3000) Running

---

## 🎯 Test Objectives

Verify complete examination draft auto-save functionality:
1. ✅ Auto-save triggers every 30 seconds
2. ✅ Debounced save 2 seconds after typing stops
3. ✅ Save on page leave/navigation
4. ✅ Resume draft modal appears on reload
5. ✅ Draft data restoration works correctly
6. ✅ Draft deletion after final save
7. ✅ Backend API integration (POST/GET/DELETE)

---

## 📋 Pre-Test Checklist

### Servers Running
- [x] Backend: http://localhost:5073 (PID: 22272)
- [x] Frontend: http://localhost:3000 (PID: 4472)

### Database Ready
- [x] `examination_drafts` table exists
- [x] ExaminationDraft entity mapped in AppDbContext
- [x] 24-hour expiration policy configured

### Code Complete
- [x] useAutoSave hook (196 lines)
- [x] examinationDraftApi client (100 lines)
- [x] ResumeDraftModal component (186 lines)
- [x] DoctorComprehensiveExam integration (complete)
- [x] ExaminationDraftController backend (356 lines)

---

## 🧪 Test Scenarios

### **TEST 1: Auto-Save on Typing (Debounce)**
**Expected**: Draft saves 2 seconds after user stops typing

**Steps:**
1. Login to hospital portal (http://localhost:3000)
2. Navigate to Doctor's Desk queue
3. Click "Start Examination" on any patient
4. Type any text in "Chief Complaint" field
5. Stop typing and wait 2 seconds
6. **Verify**: Toast notification appears: "Draft saved at HH:MM:SS AM/PM"
7. **Verify**: Console log shows: `⌨️ AutoSave: Debounce triggered`
8. Check footer status: "Last saved: HH:MM AM/PM"

**Pass Criteria:**
- ✅ Toast appears within 2-3 seconds
- ✅ Console shows debounce trigger
- ✅ Footer updates with timestamp
- ✅ No errors in console

**Backend Verification:**
```powershell
# Check backend logs for:
# "Created new draft {DraftId} for patient {PatientId}"
# or "Updating existing draft {DraftId} for patient {PatientId}"
```

---

### **TEST 2: Periodic Auto-Save (30 Second Interval)**
**Expected**: Draft saves automatically every 30 seconds even without user interaction

**Steps:**
1. Continue from TEST 1 (examination form open)
2. Make a small change (add 1 character to any field)
3. Wait exactly 30 seconds without touching keyboard
4. **Verify**: Toast notification appears: "Draft saved at HH:MM:SS"
5. **Verify**: Console log shows: `⏰ AutoSave: Timer triggered`
6. Wait another 30 seconds
7. **Verify**: Another save occurs automatically

**Pass Criteria:**
- ✅ First save at ~30 seconds
- ✅ Second save at ~60 seconds
- ✅ Console shows timer triggers
- ✅ Footer timestamp updates each time

---

### **TEST 3: Save on Page Leave (Unmount)**
**Expected**: Draft saves when navigating away from examination page

**Steps:**
1. With examination form open and some data entered
2. Click browser back button or navigate to another page
3. **Verify**: Console shows: `👋 AutoSave: Component unmounting, saving...`
4. **Verify**: Final save completes before navigation
5. Check Network tab (F12) for POST request to `/api/Examinations/draft`

**Pass Criteria:**
- ✅ Unmount save triggered
- ✅ API request sent before page change
- ✅ 200/201 response from backend

---

### **TEST 4: Resume Draft Modal**
**Expected**: Modal appears when returning to patient with existing draft

**Steps:**
1. After TEST 1-3 (draft exists in database)
2. Navigate back to Doctor Queue
3. Click "Start Examination" on **same patient**
4. **Verify**: ResumeDraftModal appears immediately
5. **Verify**: Modal shows:
   - "Resume Previous Draft?" title
   - Last saved timestamp (e.g., "Feb 19, 2026 at 02:30:45 PM")
   - Expiry timestamp (24 hours from creation)
   - Two buttons: "Resume Draft" (blue) and "Start Fresh" (red)

**Pass Criteria:**
- ✅ Modal appears before form loads
- ✅ Timestamps display correctly in Indian format
- ✅ No console errors
- ✅ Page doesn't freeze

---

### **TEST 5: Resume Draft - Restore Data**
**Expected**: Clicking "Resume Draft" restores all saved form data

**Steps:**
1. With ResumeDraftModal open (from TEST 4)
2. Click "Resume Draft" button
3. **Verify**: Modal closes
4. **Verify**: Toast shows: "📋 Draft restored successfully"
5. **Verify**: Form fields populate with previously entered data:
   - Chief Complaint matches
   - Any entered Visual Acuity data appears
   - IOP values restored
   - All 8 sections restored if filled
6. Check footer: "Last saved: [timestamp from draft]"

**Pass Criteria:**
- ✅ All fields restored accurately
- ✅ No data loss
- ✅ Form functional after restore
- ✅ Auto-save continues working

---

### **TEST 6: Start Fresh - Delete Draft**
**Expected**: Clicking "Start Fresh" deletes draft and shows empty form

**Steps:**
1. Navigate to patient with draft (modal appears)
2. Click "Start Fresh" button
3. **Verify**: Modal closes
4. **Verify**: Toast shows: "🆕 Starting fresh examination"
5. **Verify**: Form loads with empty fields
6. **Verify**: Backend DELETE request sent (check Network tab)
7. **Verify**: Console shows: `Deleted draft {DraftId} for patient {PatientId}`

**Pass Criteria:**
- ✅ Draft deleted from database
- ✅ Empty form displayed
- ✅ No errors
- ✅ Can save new draft

---

### **TEST 7: Complete Examination - Auto Delete Draft**
**Expected**: Saving final examination deletes draft automatically

**Steps:**
1. Fill out examination form completely:
   - All 9 tabs with some data
   - Add diagnosis (required field)
2. Click "Save & Complete" button at bottom
3. **Verify**: Examination saves successfully
4. **Verify**: Toast shows: "✅ Examination saved successfully"
5. **Verify**: Console shows: `✅ Draft deleted after successful save`
6. Navigate back to same patient
7. **Verify**: NO draft modal appears (draft was deleted)

**Pass Criteria:**
- ✅ Examination saved
- ✅ Draft deleted
- ✅ No modal on return
- ✅ Clean database state

---

### **TEST 8: Backend API Integration**
**Expected**: All 5 backend endpoints respond correctly

#### **8.1: POST /api/Examinations/draft (Create)**
```bash
# Open browser DevTools → Network tab
# Trigger auto-save (type something)
# Look for POST request to: http://localhost:5073/api/Examinations/draft
# Status: 201 Created
# Response body: { id, patientId, doctorId, data: "{...}", createdAt, expiresAt, ... }
```

#### **8.2: GET /api/Examinations/draft/{patientId} (Retrieve)**
```bash
# Refresh page with existing draft
# Look for GET request to: http://localhost:5073/api/Examinations/draft/{patientId}
# Status: 200 OK
# Response body: { id, patientId, data: "{...}", ... }
```

#### **8.3: DELETE /api/Examinations/draft/{patientId} (Remove)**
```bash
# Click "Start Fresh" or save final examination
# Look for DELETE request to: http://localhost:5073/api/Examinations/draft/{patientId}
# Status: 204 No Content
```

#### **8.4: GET /api/Examinations/drafts (List All)**
```bash
# Use Swagger UI: http://localhost:5073/swagger
# Navigate to: GET /api/Examinations/drafts
# Click "Try it out" → "Execute"
# Should return array of all drafts for current doctor
```

#### **8.5: POST /api/Examinations/drafts/cleanup (Admin)**
```bash
# Use Swagger UI (requires system.admin permission)
# POST /api/Examinations/drafts/cleanup
# Response: { deletedCount: N, cleanupTime: "...", message: "..." }
```

**Pass Criteria:**
- ✅ All endpoints return expected status codes
- ✅ Response bodies match TypeScript interfaces
- ✅ No 400/500 errors
- ✅ Tenant isolation working (can't see other tenants' drafts)

---

### **TEST 9: Manual Save Button**
**Expected**: "Save Now" button triggers immediate save

**Steps:**
1. With examination form open
2. Make a small change
3. **Verify**: "Save Now" button appears in footer (not disabled)
4. **Verify**: Button shows "(Unsaved changes)" next to it
5. Click "Save Now" button
6. **Verify**: Button becomes disabled
7. **Verify**: Toast appears immediately
8. **Verify**: Button text changes (no longer shows unsaved)

**Pass Criteria:**
- ✅ Button enabled when changes exist
- ✅ Immediate save on click
- ✅ Button disabled during save
- ✅ UI updates after save

---

### **TEST 10: Expiry Warning**
**Expected**: Modal shows warning when draft expires soon (<2 hours)

**Setup Required:**
```sql
-- Manually update draft expiry to test warning
UPDATE examination_drafts
SET expires_at = NOW() + INTERVAL '1 hour'
WHERE patient_id = 'your-test-patient-id';
```

**Steps:**
1. Update draft expiry in database
2. Refresh examination page
3. **Verify**: ResumeDraftModal shows orange warning banner
4. **Verify**: Warning text: "This draft will expire soon. Resume now to avoid losing your work."
5. **Verify**: AlertTriangle icon displayed

**Pass Criteria:**
- ✅ Warning banner visible
- ✅ Orange color scheme
- ✅ Correct messaging

---

### **TEST 11: Expired Draft (Auto-Cleanup)**
**Expected**: Expired drafts don't appear, GET returns 404

**Setup Required:**
```sql
-- Manually expire a draft
UPDATE examination_drafts
SET expires_at = NOW() - INTERVAL '1 hour'
WHERE patient_id = 'your-test-patient-id';
```

**Steps:**
1. Update draft expiry to past time
2. Navigate to patient
3. **Verify**: NO modal appears (expired draft filtered out)
4. **Verify**: Console shows: `No draft found for patient {PatientId}`
5. Run cleanup endpoint (admin)
6. **Verify**: Expired draft removed from database

**Pass Criteria:**
- ✅ Expired drafts not displayed
- ✅ No errors
- ✅ Cleanup removes expired entries

---

### **TEST 12: Multi-User Isolation**
**Expected**: Doctors only see their own drafts

**Steps:**
1. Login as Doctor A
2. Start examination for Patient X
3. Enter data, let it auto-save
4. Logout
5. Login as Doctor B
6. Navigate to Patient X examination
7. **Verify**: NO draft modal appears (Doctor B can't see Doctor A's draft)
8. Login back as Doctor A
9. Navigate to Patient X
10. **Verify**: Draft modal DOES appear (own draft visible)

**Pass Criteria:**
- ✅ Drafts scoped to individual doctors
- ✅ No cross-user draft access
- ✅ Tenant isolation working

---

## 🔍 Debugging & Verification

### Browser Console Logs to Watch
```javascript
// Auto-save hook logs:
💾 AutoSave: Saving draft...
⏰ AutoSave: Timer triggered
⌨️ AutoSave: Debounce triggered
✅ AutoSave: Save successful
❌ AutoSave: Save failed
⏭️ AutoSave: Skipping save (no changes)
👋 AutoSave: Component unmounting, saving...
```

### Backend Logs to Watch
```csharp
// ExaminationDraftController logs:
"Creating new draft {DraftId} for patient {PatientId}"
"Updating existing draft {DraftId} for patient {PatientId}"
"Retrieved draft {DraftId} for patient {PatientId}"
"Deleted draft {DraftId} for patient {PatientId}"
"No draft found for patient {PatientId}"
```

### Network Tab Verification
```
POST   /api/Examinations/draft              → 201 Created (new) or 200 OK (update)
GET    /api/Examinations/draft/{patientId}  → 200 OK or 404 Not Found
DELETE /api/Examinations/draft/{patientId}  → 204 No Content
GET    /api/Examinations/drafts             → 200 OK (array)
```

### Database Queries
```sql
-- Check all drafts for current session
SELECT id, patient_id, doctor_id, 
       completion_percentage,
       created_at, updated_at, expires_at,
       LENGTH(data) as data_size_bytes
FROM examination_drafts
WHERE tenant_id = 'your-tenant-id'
ORDER BY updated_at DESC;

-- Check specific draft data
SELECT data FROM examination_drafts WHERE id = 'draft-id';

-- Count expired drafts
SELECT COUNT(*) FROM examination_drafts WHERE expires_at < NOW();
```

---

## ✅ Success Criteria Summary

**All Tests Must Pass:**
- [ ] TEST 1: Debounce save (2s after typing)
- [ ] TEST 2: Periodic save (30s interval)
- [ ] TEST 3: Unmount save (page leave)
- [ ] TEST 4: Resume modal appears
- [ ] TEST 5: Draft restoration works
- [ ] TEST 6: Start fresh deletes draft
- [ ] TEST 7: Final save deletes draft
- [ ] TEST 8: All 5 API endpoints functional
- [ ] TEST 9: Manual save button works
- [ ] TEST 10: Expiry warning displays
- [ ] TEST 11: Expired drafts filtered
- [ ] TEST 12: Multi-user isolation

**Performance Requirements:**
- ✅ Auto-save completes < 500ms
- ✅ Modal loads < 200ms
- ✅ No UI freezing during saves
- ✅ Console clean (no errors)

**Security Requirements:**
- ✅ JWT authentication required
- ✅ Tenant isolation enforced
- ✅ Doctor can only access own drafts
- ✅ Proper authorization checks

---

## 🐛 Known Issues / Edge Cases

### Issue 1: Multiple Rapid Saves
**Scenario**: User types very fast, triggering multiple debounce saves  
**Expected**: Only last save executes, previous ones cancelled  
**Status**: ✅ Handled by useAutoSave debounce logic

### Issue 2: Network Failure During Save
**Scenario**: API request fails (backend down, network issue)  
**Expected**: Error logged, no crash, retry on next interval  
**Status**: ✅ Try-catch blocks in place, silent failure

### Issue 3: Large Form Data (>1MB)
**Scenario**: User adds extensive notes, images, etc.  
**Expected**: JSONB field can handle large data  
**Status**: ⚠️ Monitor database performance with large drafts

### Issue 4: Browser Refresh During Save
**Scenario**: User refreshes while save in-flight  
**Expected**: Save may not complete, but next save will work  
**Status**: ✅ Acceptable - data saved on next interaction

---

## 📊 Test Results Template

```markdown
## Test Execution Results
**Date**: [Fill Date]  
**Tester**: [Your Name]  
**Environment**: Local Development (Win 11, Node 23.5.0, .NET 8.0)

| Test | Status | Notes |
|------|--------|-------|
| TEST 1: Debounce Save | ⏳ | |
| TEST 2: Periodic Save | ⏳ | |
| TEST 3: Unmount Save | ⏳ | |
| TEST 4: Resume Modal | ⏳ | |
| TEST 5: Restore Data | ⏳ | |
| TEST 6: Start Fresh | ⏳ | |
| TEST 7: Final Save Delete | ⏳ | |
| TEST 8: API Integration | ⏳ | |
| TEST 9: Manual Save | ⏳ | |
| TEST 10: Expiry Warning | ⏳ | |
| TEST 11: Expired Cleanup | ⏳ | |
| TEST 12: Multi-User | ⏳ | |

**Overall Status**: ⏳ In Progress  
**Pass Rate**: 0/12 (0%)

**Critical Issues Found**: None  
**Minor Issues Found**: None  
**Recommendations**: None
```

---

## 🚀 Next Steps After Testing

### If All Tests Pass ✅
1. Mark Phase 2 as 100% complete
2. Create deployment checklist
3. Move to Phase 3: ICD-10 Diagnosis + Prescriptions
4. Document lessons learned

### If Tests Fail ❌
1. Document failure details (screenshots, logs, network traces)
2. Prioritize by severity (critical → high → medium → low)
3. Fix issues systematically
4. Retest after each fix
5. Update test plan with new edge cases

---

## 📚 Additional Resources

- **Frontend Code**: `apps/hospital-portal-web/src/hooks/useAutoSave.ts`
- **Backend Code**: `microservices/auth-service/AuthService/Controllers/ExaminationDraftController.cs`
- **Database Schema**: `migrations/module1_phase3_manual_schema.sql`
- **API Docs**: http://localhost:5073/swagger (when backend running)
- **Test Credentials**: See `TEST_CREDENTIALS.md`

---

**Ready to test! Start with TEST 1 and work sequentially through all scenarios.** 🧪
