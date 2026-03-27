# 🧪 Phase 3 Prescriptions Module - Manual Testing Guide

**Last Updated**: January 28, 2026  
**Status**: Ready for Testing  
**Environment**: Development (localhost)

---

## ✅ Pre-Test Checklist

- [x] Backend running on http://localhost:5073
- [x] Frontend running on http://localhost:3000  
- [x] JWT token available in `$global:token`
- [x] Browser DevTools open (F12)
- [x] Network tab cleared
- [x] Prescriptions page route created (`/prescriptions`)
- [x] Sidebar link added for Prescriptions

---

## 📋 Test Execution Instructions

### How to Use This Guide

1. **Open browser** to http://localhost:3000
2. **Login** with admin@test.com / Admin123! / DEMO
3. **Open DevTools** (F12) and go to Network tab
4. **Follow each test** step-by-step
5. **Record results** in this document (checkboxes)
6. **Take screenshots** if issues found
7. **Document any bugs** in the Issues section at the end

---

## 🎯 Test Suite

### Test 1: Login & Navigation ✅

**Objective**: Verify authentication and navigation to prescriptions page

**Steps**:
1. [ ] Navigate to http://localhost:3000
2. [ ] Enter credentials:
   - Email: admin@test.com
   - Password: Admin123!
   - Tenant Code: DEMO
3. [ ] Click "Login"
4. [ ] Wait for redirect to dashboard
5. [ ] Look for "Prescriptions" in sidebar (under Clinical Operations, after Pharmacy)
6. [ ] Click "Prescriptions"
7. [ ] Verify URL is `/prescriptions`

**Expected Results**:
- [ ] Login successful without errors
- [ ] Dashboard loads
- [ ] "Prescriptions" link visible in sidebar
- [ ] Clicking link navigates to `/prescriptions`
- [ ] Page loads without console errors

**Actual Results**:
```
[Document your observations here]
```

**Status**: ⬜ Pass | ⬜ Fail

---

### Test 2: Prescription List Loading ✅

**Objective**: Verify API integration and loading states

**Steps**:
1. [ ] Clear Network tab in DevTools
2. [ ] Navigate to `/prescriptions`
3. [ ] Observe loading skeleton (should see 5 table rows with gray pulse animation)
4. [ ] Wait for API call to complete (check Network tab)
5. [ ] Observe final state (either data or empty state)

**Expected Results**:
- [ ] Loading skeleton displays immediately
- [ ] Network tab shows: `GET http://localhost:5073/api/prescriptions/doctor/{doctorId}`
- [ ] Request includes headers:
  - [ ] `Authorization: Bearer {token}`
  - [ ] `X-Tenant-ID: {tenant-uuid}`
- [ ] **IF prescriptions exist**: Table shows prescription data
- [ ] **IF no prescriptions**: Empty state shows:
  - [ ] FileText icon (📄)
  - [ ] "No prescriptions found"
  - [ ] "Create your first prescription to get started"
  - [ ] "New Prescription" button

**API Response Structure** (if successful):
```json
{
  "data": [
    {
      "id": "uuid",
      "patientId": "uuid",
      "patientName": "John Doe",
      "diagnosis": "Bacterial conjunctivitis",
      "status": "active",
      "prescriptionDate": "2026-01-28T...",
      "isPrinted": false,
      "medications": [...]
    }
  ]
}
```

**Actual Results**:
```
API Status Code: ___
Response Time: ___ ms
Number of prescriptions: ___
Empty state shown: Yes / No
```

**Status**: ⬜ Pass | ⬜ Fail | ⬜ Partial

**Screenshots**: [Attach if needed]

---

### Test 3: Create Prescription - Step 1 (Patient & Diagnosis) ✅

**Objective**: Test patient selection and diagnosis entry

**Steps**:
1. [ ] Click "New Prescription" button
2. [ ] Modal opens with title "Create Prescription"
3. [ ] Verify Step 1 indicator is active
4. [ ] Click "Patient" dropdown
5. [ ] Select a patient (e.g., "John Doe")
6. [ ] Enter diagnosis: "Bacterial conjunctivitis"
7. [ ] Enter instructions: "Apply as directed. Complete full course."
8. [ ] Enter duration: "7" days
9. [ ] Click "Next"

**Expected Results**:
- [ ] Modal opens smoothly
- [ ] Patient dropdown shows list of patients
- [ ] Can search/filter patients
- [ ] Diagnosis field accepts text
- [ ] Instructions field accepts text
- [ ] Duration accepts numbers only
- [ ] "Next" button enabled after filling required fields
- [ ] Clicking "Next" advances to Step 2

**Validation Tests**:
- [ ] Try clicking "Next" without selecting patient → Should show error
- [ ] Try clicking "Next" without diagnosis → Should show error

**Actual Results**:
```
[Document observations]
```

**Status**: ⬜ Pass | ⬜ Fail

---

### Test 4: Medication Autocomplete Search ✅

**Objective**: Verify medication search API integration and debouncing

**Steps**:
1. [ ] In prescription wizard Step 2, click "Add Medication"
2. [ ] Clear Network tab
3. [ ] Type "m" in medication name field
4. [ ] **Wait 100ms** - should NOT see API call yet (debounce working)
5. [ ] Type "o" (now "mo")
6. [ ] **Wait 100ms** - still no API call
7. [ ] Type "x" (now "mox")
8. [ ] **Wait 400ms** - should see API call NOW
9. [ ] Observe dropdown results
10. [ ] Select "Moxifloxacin" from dropdown

**Expected Results**:
- [ ] No API call until 300ms after typing stops (debounce)
- [ ] Loading indicator shows "Searching..." during API call
- [ ] Network tab shows: `GET /api/medications/search?query=mox`
- [ ] Response includes medications matching "mox":
  - [ ] Moxifloxacin
  - [ ] Moxeza
- [ ] Dropdown displays results with:
  - [ ] Medication name
  - [ ] Generic name
  - [ ] Category (e.g., "Antibiotic")
  - [ ] Form (e.g., "Eye Drops")
- [ ] Selecting medication populates form fields

**API Response Structure**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Moxifloxacin",
      "genericName": "Moxifloxacin",
      "category": "Antibiotic",
      "form": "Eye Drops",
      "standardDosages": ["0.5%"]
    }
  ]
}
```

**Timing Tests**:
- [ ] Type "tim" and measure time to API call ≈ 300ms
- [ ] Clear and type "lat" → verify previous search cancelled

**Actual Results**:
```
Debounce working: Yes / No
API call timing: ___ ms
Number of results: ___
```

**Status**: ⬜ Pass | ⬜ Fail

---

### Test 5: Drug Interaction Checking ⚠️

**Objective**: Verify drug interaction API and warning UI

**Steps**:
1. [ ] In prescription wizard Step 2
2. [ ] Add first medication:
   - [ ] Search "moxifloxacin"
   - [ ] Select from dropdown
   - [ ] Dosage: "0.5%"
   - [ ] Frequency: "TID (3 times daily)"
   - [ ] Duration: "7" days
   - [ ] Quantity: "1"
   - [ ] Instructions: "1 drop in affected eye(s)"
   - [ ] Click "Add to Prescription"
3. [ ] Verify medication appears in list
4. [ ] Add second medication:
   - [ ] Search "ciprofloxacin"
   - [ ] Select from dropdown
   - [ ] Dosage: "0.3%"
   - [ ] Frequency: "QID (4 times daily)"
   - [ ] Duration: "7" days
   - [ ] Quantity: "1"
   - [ ] Instructions: "1 drop in affected eye(s)"
   - [ ] Click "Add to Prescription"
5. [ ] **IMMEDIATELY** observe interaction warning panel
6. [ ] Clear Network tab and observe API call

**Expected Results**:
- [ ] After adding second medication, API call triggers:
  - Network: `POST /api/prescriptions/check-interactions`
- [ ] Request body:
  ```json
  {
    "patientId": "patient-uuid",
    "medicationNames": ["Moxifloxacin", "Ciprofloxacin"]
  }
  ```
- [ ] Interaction warning panel appears:
  - [ ] Title: "Drug Interactions Found (1)"
  - [ ] Severity badge: "High" (red background)
  - [ ] Drug names: "Moxifloxacin ↔ Ciprofloxacin"
  - [ ] Description: "Both are fluoroquinolone antibiotics..."
  - [ ] Clinical Management: "Avoid concurrent use unless..."
  - [ ] Icon: AlertTriangle (⚠️)
- [ ] Can still proceed to Step 3 (warning, not blocker)
- [ ] Click "Next" to Step 3

**API Response Structure**:
```json
{
  "drugInteractions": [
    {
      "drug1Name": "Moxifloxacin",
      "drug2Name": "Ciprofloxacin",
      "severity": "high",
      "description": "Both are fluoroquinolone antibiotics. Concurrent use may increase risk of adverse effects.",
      "clinicalManagement": "Avoid concurrent use unless absolutely necessary. Monitor for adverse effects."
    }
  ],
  "allergyWarnings": []
}
```

**Additional Tests**:
- [ ] Remove one medication → warning disappears
- [ ] Re-add medication → warning reappears
- [ ] Try medium severity interaction (if available)
- [ ] Try low severity interaction (if available)

**Actual Results**:
```
API call timing: ___ ms
Interaction detected: Yes / No
Severity displayed: ___
Can proceed: Yes / No
```

**Status**: ⬜ Pass | ⬜ Fail

---

### Test 6: Prescription Creation (Step 3 - Review & Submit) ✅

**Objective**: Verify prescription creation API and success handling

**Steps**:
1. [ ] After Step 2, click "Next" to Step 3
2. [ ] Review summary:
   - [ ] Patient name displayed
   - [ ] Diagnosis displayed
   - [ ] Instructions displayed
   - [ ] Duration displayed
   - [ ] Medications list displayed
   - [ ] Drug interactions summary (if any)
3. [ ] Clear Network tab
4. [ ] Click "Create Prescription"
5. [ ] Observe button state change (loading/disabled)
6. [ ] Wait for API call to complete
7. [ ] Observe toast notification
8. [ ] Verify modal closes
9. [ ] Verify new prescription appears in list

**Expected Results**:
- [ ] Summary shows all entered data correctly
- [ ] "Create Prescription" button disables on click
- [ ] Loading spinner shows on button
- [ ] Network tab shows: `POST /api/prescriptions`
- [ ] Request body includes:
  ```json
  {
    "patientId": "uuid",
    "diagnosis": "Bacterial conjunctivitis",
    "instructions": "Apply as directed...",
    "treatmentDurationDays": 7,
    "medications": [
      {
        "medicationName": "Moxifloxacin",
        "dosage": "0.5%",
        "frequency": "TID",
        "durationDays": 7,
        ...
      }
    ]
  }
  ```
- [ ] Response status: 200 or 201
- [ ] Success toast appears: "Prescription created successfully"
- [ ] Toast auto-dismisses after 4 seconds
- [ ] Modal closes automatically
- [ ] Prescription list refreshes
- [ ] New prescription visible in table:
  - [ ] Status: "active"
  - [ ] isPrinted: false (printer icon gray)
  - [ ] Created date: today

**Error Scenarios to Test**:
- [ ] Stop backend server mid-creation → Should show error toast
- [ ] Try creating duplicate → Observe behavior
- [ ] Cancel modal during creation → Should abort

**Actual Results**:
```
API Status Code: ___
Response Time: ___ ms
Toast appeared: Yes / No
Prescription created: Yes / No
Prescription ID: ___
```

**Status**: ⬜ Pass | ⬜ Fail

---

### Test 7: Print Prescription ✅

**Objective**: Verify print functionality and state update

**Steps**:
1. [ ] From prescription list, find an active prescription
2. [ ] Note the prescription ID
3. [ ] Note current isPrinted state (should be false)
4. [ ] Clear Network tab
5. [ ] Click printer icon button
6. [ ] Observe API call
7. [ ] Observe toast notification
8. [ ] Observe icon state change

**Expected Results**:
- [ ] Network tab shows: `POST /api/prescriptions/{id}/print`
- [ ] Response status: 200
- [ ] Success toast: "Prescription marked as printed"
- [ ] Printer icon changes state:
  - Before: Gray/outline
  - After: Blue/filled or checkmark overlay
- [ ] isPrinted flag = true in database
- [ ] printedAt timestamp populated

**Database Verification** (using test_phase3_database.ps1):
```powershell
.\test_phase3_database.ps1
# Select option 6, enter prescription ID
# Verify is_printed = true, printed_at is set
```

**Additional Tests**:
- [ ] Print same prescription again → Should still work (idempotent)
- [ ] Print completed prescription → Should work
- [ ] Print cancelled prescription → Should work or show warning

**Actual Results**:
```
API call successful: Yes / No
Toast appeared: Yes / No
Icon updated: Yes / No
Database verified: Yes / No
```

**Status**: ⬜ Pass | ⬜ Fail

---

### Test 8: Dispense Prescription ✅

**Objective**: Verify dispense workflow and status change

**Steps**:
1. [ ] Find an active prescription (not cancelled)
2. [ ] Click "Dispense" button
3. [ ] Dispense modal opens
4. [ ] Fill pharmacy name: "Central Pharmacy"
5. [ ] Verify medications list shows all medications from prescription
6. [ ] Select medications to dispense (check all)
7. [ ] Fill counseling notes: "Instructed patient on proper administration technique"
8. [ ] Check all checklist items:
   - [ ] Verified patient identity
   - [ ] Checked for drug allergies
   - [ ] Provided medication counseling
   - [ ] Patient acknowledged instructions
9. [ ] Clear Network tab
10. [ ] Click "Confirm Dispense"
11. [ ] Observe API call
12. [ ] Observe toast notification
13. [ ] Observe status change in list

**Expected Results**:
- [ ] Modal opens with prescription details
- [ ] All medications listed with checkboxes
- [ ] Pharmacy name field required
- [ ] Counseling notes field optional but recommended
- [ ] All checklist items must be checked
- [ ] "Confirm Dispense" disabled until requirements met
- [ ] Network tab shows: `POST /api/prescriptions/{id}/dispense`
- [ ] Request body:
  ```json
  {
    "pharmacyName": "Central Pharmacy",
    "dispensedMedicationIds": ["med-uuid-1", "med-uuid-2"],
    "counselingNotes": "Instructed patient..."
  }
  ```
- [ ] Response status: 200
- [ ] Success toast: "Prescription dispensed successfully"
- [ ] Modal closes
- [ ] Prescription status changes:
  - Before: "active"
  - After: "completed"
- [ ] Dispense button disabled on completed prescription
- [ ] dispensedDate populated in database
- [ ] pharmacyName stored in database

**Validation Tests**:
- [ ] Try dispense without pharmacy name → Error
- [ ] Try dispense without checking items → Error  
- [ ] Partial dispense (select only some meds) → Should work

**Database Verification**:
```powershell
.\test_phase3_database.ps1
# Option 6, enter prescription ID
# Verify status = 'completed', dispensed_date, pharmacy_name
```

**Actual Results**:
```
API call successful: Yes / No
Status changed: active → completed
Database updated: Yes / No
```

**Status**: ⬜ Pass | ⬜ Fail

---

### Test 9: Cancel Prescription ⚠️

**Objective**: Verify cancel functionality with confirmation

**Steps**:
1. [ ] Find an active prescription
2. [ ] Note prescription ID
3. [ ] Click "Cancel" button (red X icon)
4. [ ] Confirmation dialog appears
5. [ ] Read confirmation message
6. [ ] Click "Cancel" (abort action)
7. [ ] Verify prescription still active
8. [ ] Click "Cancel" button again
9. [ ] Click "Confirm" (proceed with cancellation)
10. [ ] Clear Network tab before confirming
11. [ ] Observe API call
12. [ ] Observe toast notification
13. [ ] Observe status change

**Expected Results**:
- [ ] Confirmation dialog shows: "Are you sure you want to cancel this prescription?"
- [ ] Two buttons: "Cancel" (abort) and "Confirm" (proceed)
- [ ] Clicking "Cancel" closes dialog, no API call
- [ ] Clicking "Confirm" triggers API call:
  - Network: `POST /api/prescriptions/{id}/cancel`
- [ ] Response status: 200
- [ ] Success toast: "Prescription cancelled successfully"
- [ ] Prescription status changes:
  - Before: "active" or "completed"
  - After: "cancelled"
- [ ] Cancel button disabled on cancelled prescription
- [ ] Cannot dispense cancelled prescription

**Additional Tests**:
- [ ] Try cancelling already cancelled prescription → Should be disabled
- [ ] Verify status badge color changes (red for cancelled)

**Database Verification**:
```powershell
# Verify status = 'cancelled' in database
```

**Actual Results**:
```
Confirmation shown: Yes / No
API call on confirm: Yes / No
Status changed to cancelled: Yes / No
```

**Status**: ⬜ Pass | ⬜ Fail

---

### Test 10: Search & Filter ✅

**Objective**: Verify client-side filtering works correctly

**Steps**:
1. [ ] Ensure prescription list has multiple prescriptions (create if needed)
2. [ ] **Search by patient name**:
   - [ ] Type partial patient name in search box
   - [ ] Observe list filters instantly
   - [ ] Clear search
   - [ ] Verify list resets
3. [ ] **Filter by status**:
   - [ ] Select "Active" from status dropdown
   - [ ] Verify only active prescriptions show
   - [ ] Select "Completed"
   - [ ] Verify only completed prescriptions show
   - [ ] Select "Cancelled"
   - [ ] Verify only cancelled prescriptions show
   - [ ] Select "All"
   - [ ] Verify all prescriptions show
4. [ ] **Combined filter**:
   - [ ] Enter patient name + select status
   - [ ] Verify both filters apply
5. [ ] **Empty state**:
   - [ ] Enter search term with no matches
   - [ ] Verify empty state shows: "Try adjusting your filters"

**Expected Results**:
- [ ] Search is case-insensitive
- [ ] Search filters instantly (no debounce needed here)
- [ ] Status filter updates immediately
- [ ] Filters work in combination
- [ ] Empty state changes message based on filters:
  - No filters: "Create your first prescription to get started"
  - With filters: "Try adjusting your filters"
- [ ] Pagination updates based on filtered results

**Actual Results**:
```
Search working: Yes / No
Status filter working: Yes / No
Combined filters working: Yes / No
Empty state appropriate: Yes / No
```

**Status**: ⬜ Pass | ⬜ Fail

---

### Test 11: Error Handling & Resilience ⚠️

**Objective**: Verify graceful error handling when API fails

**Steps**:
1. [ ] Navigate to prescriptions page (ensure it loads)
2. [ ] Open terminal where backend is running
3. [ ] Press Ctrl+C to stop backend
4. [ ] Wait for backend to stop
5. [ ] In browser, try to create new prescription
6. [ ] Observe error toast
7. [ ] Check console for errors
8. [ ] Refresh prescriptions page
9. [ ] Observe fallback behavior
10. [ ] Restart backend (`dotnet run`)
11. [ ] Wait for backend to start
12. [ ] Refresh page
13. [ ] Verify real data loads

**Expected Results**:
- [ ] API failure shows error toast (not just console error)
- [ ] Error toast shows meaningful message:
  - NOT: "Network Error" or "Error"
  - YES: "Failed to create prescription. Please try again."
- [ ] Console logs full error for debugging
- [ ] Buttons disabled during submission (prevent duplicate clicks)
- [ ] Loading skeleton shows while loading
- [ ] After backend restart, data loads successfully
- [ ] **Fallback behavior** (development mode):
  - Prescription list falls back to mock data
  - User can still interact with UI
  - Toast warns user of offline mode

**Error Messages to Verify**:
- [ ] Create prescription failure: "Failed to create prescription"
- [ ] Load prescriptions failure: "Failed to load prescriptions. Please try again."
- [ ] Medication search failure: "Failed to search medications"
- [ ] Drug interaction check failure: "Failed to check drug interactions"
- [ ] Print failure: "Failed to mark prescription as printed"
- [ ] Dispense failure: "Failed to dispense prescription"
- [ ] Cancel failure: "Failed to cancel prescription"

**Actual Results**:
```
Error toasts shown: Yes / No
Console errors logged: Yes / No
Fallback to mock data: Yes / No
Recovery after restart: Yes / No
```

**Status**: ⬜ Pass | ⬜ Fail

---

## 🔄 End-to-End Integration Tests

### E2E Test 1: Complete Workflow ✅

**Objective**: Full prescription lifecycle from creation to dispensing

**Steps**:
1. [ ] **Create** prescription with 1 medication
2. [ ] **Verify in database** (use helper script)
3. [ ] **Print** prescription
4. [ ] **Verify print flag** in database
5. [ ] **Dispense** prescription
6. [ ] **Verify status change** in database
7. [ ] Verify audit logs recorded

**Database Queries** (use `test_phase3_database.ps1`):

```powershell
# After creation
.\test_phase3_database.ps1
# Option 6: Check Prescription by ID
# Enter the prescription ID from UI
# Verify: status = 'active', is_printed = false

# After printing
# Option 6 again
# Verify: is_printed = true, printed_at IS NOT NULL

# After dispensing
# Option 6 again
# Verify: status = 'completed', dispensed_date IS NOT NULL, pharmacy_name set

# Check audit logs
# Option 8: View Audit Logs
# Verify 3 entries: CREATE, UPDATE (print), UPDATE (dispense)
```

**Expected Database State**:

**After Creation**:
```sql
id: <uuid>
status: 'active'
is_printed: false
printed_at: NULL
dispensed_date: NULL
pharmacy_name: NULL
created_at: <timestamp>
created_by_user_id: <admin-uuid>
```

**After Print**:
```sql
is_printed: true
printed_at: <timestamp>
updated_at: <timestamp>
updated_by_user_id: <admin-uuid>
```

**After Dispense**:
```sql
status: 'completed'
dispensed_date: <timestamp>
pharmacy_name: 'Central Pharmacy'
updated_at: <timestamp>
updated_by_user_id: <admin-uuid>
```

**Actual Results**:
```
Creation successful: Yes / No
Database record created: Yes / No
Print updated database: Yes / No
Dispense updated database: Yes / No
Audit logs created: Yes / No (count: ___)
```

**Status**: ⬜ Pass | ⬜ Fail

---

### E2E Test 2: Drug Interaction Database Validation ✅

**Objective**: Verify interaction checking against database

**Steps**:
1. [ ] Query database for interactions:
   ```powershell
   .\test_phase3_database.ps1
   # Option 3: Count Drug Interactions
   ```
2. [ ] Note a high-severity interaction (e.g., Moxifloxacin + Ciprofloxacin)
3. [ ] Create prescription with those two drugs
4. [ ] Verify API returns same interaction
5. [ ] Compare severity, description, management

**Database Query** (manual if needed):
```sql
SELECT * FROM drug_interaction 
WHERE (drug1_name = 'Moxifloxacin' AND drug2_name = 'Ciprofloxacin')
   OR (drug1_name = 'Ciprofloxacin' AND drug2_name = 'Moxifloxacin');
```

**Expected Results**:
- [ ] Interaction exists in database
- [ ] Bidirectional check works (drug1-drug2 OR drug2-drug1)
- [ ] API severity matches database severity
- [ ] API description matches database description
- [ ] API clinical management matches database

**Actual Results**:
```
Interaction in DB: Yes / No
Bidirectional check works: Yes / No
API matches DB: Yes / No
```

**Status**: ⬜ Pass | ⬜ Fail

---

### E2E Test 3: Medication Search Database Validation ✅

**Objective**: Verify search results match database

**Steps**:
1. [ ] Query database for medications:
   ```powershell
   .\test_phase3_database.ps1
   # Option 2: Count Medications
   ```
2. [ ] Note total count (should be 44)
3. [ ] Test full-text search:
   ```powershell
   # Option 4: Test Medication Search
   # Enter "moxi"
   ```
4. [ ] In UI, search for "moxi"
5. [ ] Compare results

**Database Query**:
```sql
SELECT * FROM medication_master 
WHERE to_tsvector('english', name || ' ' || generic_name) @@ to_tsquery('english', 'moxi:*')
  AND is_active = true
ORDER BY name;
```

**Expected Results**:
- [ ] 44 total active medications in database
- [ ] Search for "moxi" returns:
  - [ ] Moxifloxacin
  - [ ] Moxeza
- [ ] UI results match database query results
- [ ] Full-text search uses GIN index (fast)

**Performance Test**:
- [ ] Search response time < 100ms

**Actual Results**:
```
Total medications: ___
Search results match: Yes / No
Response time: ___ ms
```

**Status**: ⬜ Pass | ⬜ Fail

---

### E2E Test 4: Multi-Tenant Isolation (RLS) ⚠️

**Objective**: Verify Row-Level Security prevents cross-tenant data access

**Steps**:
1. [ ] Create prescription as DEMO tenant
2. [ ] Note prescription ID
3. [ ] Query database with DEMO tenant context:
   ```sql
   SET app.current_tenant_id = '<demo-tenant-uuid>';
   SELECT * FROM prescription WHERE id = '<prescription-id>';
   ```
4. [ ] Verify prescription visible
5. [ ] Query with different tenant:
   ```sql
   SET app.current_tenant_id = '00000000-0000-0000-0000-000000000000';
   SELECT * FROM prescription WHERE id = '<prescription-id>';
   ```
6. [ ] Verify prescription HIDDEN (RLS blocking)

**Expected Results**:
- [ ] Prescription visible with correct tenant_id
- [ ] Prescription hidden with wrong tenant_id
- [ ] RLS policy enforces tenant isolation
- [ ] API automatically sets tenant context via X-Tenant-ID header

**Actual Results**:
```
Prescription visible with correct tenant: Yes / No
Prescription hidden with wrong tenant: Yes / No
RLS working: Yes / No
```

**Status**: ⬜ Pass | ⬜ Fail

---

### E2E Test 5: Audit Trail Validation ✅

**Objective**: Verify all changes are audited

**Steps**:
1. [ ] Create prescription
2. [ ] Note prescription ID and user ID
3. [ ] Query audit log:
   ```powershell
   .\test_phase3_database.ps1
   # Option 8: View Audit Logs
   ```
4. [ ] Verify CREATE entry exists
5. [ ] Print prescription
6. [ ] Query audit log again
7. [ ] Verify UPDATE entry for print
8. [ ] Dispense prescription
9. [ ] Query audit log again
10. [ ] Verify UPDATE entry for dispense

**Expected Audit Log Entries**:

**Entry 1 - CREATE**:
```
table_name: 'prescription'
operation_type: 'INSERT'
record_id: <prescription-uuid>
changed_by_user_id: <admin-uuid>
old_values: NULL
new_values: {"diagnosis": "...", "status": "active", ...}
```

**Entry 2 - PRINT**:
```
operation_type: 'UPDATE'
old_values: {"is_printed": false}
new_values: {"is_printed": true, "printed_at": "..."}
```

**Entry 3 - DISPENSE**:
```
operation_type: 'UPDATE'
old_values: {"status": "active", "dispensed_date": null}
new_values: {"status": "completed", "dispensed_date": "...", "pharmacy_name": "..."}
```

**Actual Results**:
```
CREATE audit entry: Yes / No
PRINT audit entry: Yes / No
DISPENSE audit entry: Yes / No
User IDs correct: Yes / No
Timestamps accurate: Yes / No
```

**Status**: ⬜ Pass | ⬜ Fail

---

## 📊 Test Summary

### Overall Results

**Frontend UI Tests** (10 tests):
- [ ] Login & Navigation
- [ ] Prescription List Loading
- [ ] Create Prescription Step 1
- [ ] Medication Autocomplete
- [ ] Drug Interaction Checking
- [ ] Prescription Creation
- [ ] Print Prescription
- [ ] Dispense Prescription
- [ ] Cancel Prescription
- [ ] Search & Filter
- [ ] Error Handling

**Total**: ___ / 11 Passed

**End-to-End Tests** (5 tests):
- [ ] Complete Workflow
- [ ] Drug Interaction Validation
- [ ] Medication Search Validation
- [ ] Multi-Tenant Isolation (RLS)
- [ ] Audit Trail Validation

**Total**: ___ / 5 Passed

**Overall Pass Rate**: ___ / 16 (___%%)

---

## 🐛 Issues Found

### Critical Issues
_(Issues that prevent core functionality)_

1. **[CRITICAL]** [Issue description]
   - **Steps to Reproduce**: ...
   - **Expected**: ...
   - **Actual**: ...
   - **Impact**: ...

### Major Issues
_(Issues that significantly impact usability)_

1. **[MAJOR]** [Issue description]
   - **Steps to Reproduce**: ...
   - **Expected**: ...
   - **Actual**: ...
   - **Impact**: ...

### Minor Issues
_(UI/UX improvements, non-blocking bugs)_

1. **[MINOR]** [Issue description]
   - **Steps to Reproduce**: ...
   - **Expected**: ...
   - **Actual**: ...
   - **Impact**: ...

### Enhancements
_(Nice-to-have improvements)_

1. **[ENHANCEMENT]** [Suggestion]
   - **Description**: ...
   - **Benefit**: ...

---

## ✅ Test Completion Checklist

- [ ] All frontend UI tests executed
- [ ] All end-to-end tests executed
- [ ] All issues documented
- [ ] Screenshots captured for failures
- [ ] Database state verified
- [ ] Audit logs validated
- [ ] Performance acceptable (< 2s for API calls)
- [ ] Error handling graceful
- [ ] Multi-tenant isolation working
- [ ] Test results shared with team

---

## 📝 Notes & Observations

```
[Add any additional observations, performance notes, or recommendations here]
```

---

**Test Execution Started**: ___:___ on _______  
**Test Execution Completed**: ___:___ on _______  
**Total Duration**: ___ hours ___ minutes  
**Tester**: _______________  
**Environment**: Development (localhost)  
**Status**: ⬜ All Pass | ⬜ Some Failures | ⬜ Blocked
