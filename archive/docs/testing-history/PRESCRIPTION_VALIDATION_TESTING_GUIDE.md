# Prescription Validation Testing Guide (Steps 8-10)
**Phase 3: Clinical Examination - Prescription Validation**  
**Date**: February 19, 2026  
**Components**: ICD10SearchDialog, MedicationsTab, PrescriptionValidationModal  
**Status**: Ready for Testing

---

## 🎯 Testing Objectives

- **Step 8**: Test PrescriptionValidationModal with all validation scenarios and override workflows
- **Step 9**: Integration testing across examination workflow
- **Step 10**: End-to-end testing with real clinical scenarios

---

## 📋 Test Prerequisites

### Services Running
✅ **Backend API**: http://localhost:5073 (PID 36712)  
✅ **Frontend**: http://localhost:3000 (PID 30988)  
✅ **Database**: Azure PostgreSQL (hospitalportal-db-server)

### Test Credentials
- **Email**: admin@test.com  
- **Password**: Admin123!  
- **Tenant ID**: 155fe198-6ae5-4a01-9254-ead5b427247e

### Database Seeded Data
- **32 ICD-10 Diagnosis Codes** (ophthalmology-specific)
- **10 Ophthalmic Medications** (with contraindications)
- **14 Drug-Drug Interactions** (various severity levels)
- **3 Test Patients** (with allergies and conditions)

---

## 🧪 Step 8: PrescriptionValidationModal Testing

### Test Scenario 1: Valid Prescription ✅
**Objective**: Verify validation passes when no issues detected

**Steps**:
1. Navigate to examination page: http://localhost:3000/dashboard/optometrist/exam
2. Click "Medications" tab
3. Add medication:
   - **Drug**: Carboxymethylcellulose (artificial tear)
   - **Dosage**: 0.5%
   - **Frequency**: Four times daily (QID)
   - **Eye Specificity**: OU (Both Eyes)
   - **OU Instructions**: "Instill 1 drop in both eyes 4 times daily"
   - **Duration**: 30 Days
4. Click "Validate & Add"

**Expected Result**:
- ✅ Validation modal opens
- ✅ Green success banner: "Prescription is safe to prescribe"
- ✅ No errors or warnings
- ✅ "Add Medication" button (green) enabled
- ✅ Clicking adds medication to list without override reason

**API Endpoint**: `POST /api/prescriptionvalidation/validate`

---

### Test Scenario 2: Patient Allergy Conflict ❌
**Objective**: Verify critical error blocks prescription for patient allergies

**Prerequisite**: Patient must have documented allergy (e.g., Timolol allergy)

**Steps**:
1. Select patient with known Timolol allergy
2. Add medication:
   - **Drug**: Timolol
   - **Dosage**: 0.5%
   - **Frequency**: Twice daily (BD)
   - **Eye Specificity**: OU
   - **Duration**: 30 Days
3. Click "Validate & Add"

**Expected Result**:
- ❌ Validation modal opens with **red error banner**
- ❌ **Critical Error Section** appears:
  - Error Type: "Allergy"
  - Medication: "Timolol"
  - Message: "Patient has documented allergy to Timolol"
  - Severity: "Critical"
  - Conflicts With: "Patient Allergy Record"
  - Recommendation: "Do not prescribe - consider alternative medication"
- ❌ **Override Reason Textarea** required (red border)
- ❌ "Override & Proceed" button (orange) shown
- ❌ Cannot add without entering override reason
- ✅ Entering reason (e.g., "Patient consent obtained, monitoring in place") enables proceed

**API Response**:
```json
{
  "isValid": false,
  "requiresOverride": true,
  "errors": [{
    "errorType": "allergy",
    "medicationName": "Timolol",
    "severity": "Critical",
    "conflictsWith": "Patient Allergy Record",
    "message": "Patient has documented allergy to Timolol",
    "recommendation": "Do not prescribe - consider alternative"
  }]
}
```

---

### Test Scenario 3: Contraindication (Asthmatic + Timolol) ❌
**Objective**: Verify contraindication detection for respiratory conditions

**Prerequisite**: Patient diagnosis includes asthma/COPD

**Steps**:
1. Select asthmatic patient
2. Add medication:
   - **Drug**: Timolol (non-selective beta blocker)
   - **Dosage**: 0.5%
   - **Frequency**: Twice daily (BD)
   - **Eye Specificity**: OU
   - **Duration**: 30 Days
3. Click "Validate & Add"

**Expected Result**:
- ❌ Red error banner
- ❌ Critical Error: "Contraindication"
  - Message: "Timolol contraindicated in patients with asthma/COPD"
  - Severity: "Critical"
  - Conflicts With: "Respiratory Condition"
  - Recommendation: "Use selective beta blocker (e.g., Betaxolol) or alternative class"
- ❌ Override reason required

**Database Check**:
```sql
SELECT contraindications FROM ophth_medication WHERE generic_name = 'Timolol';
-- Result: ["Asthma", "COPD", "Heart block", "Bradycardia"]
```

---

### Test Scenario 4: Critical Drug-Drug Interaction ❌
**Objective**: Verify critical interaction detected between medications

**Steps**:
1. Add first medication:
   - **Drug**: Timolol
   - **Dosage**: 0.5%
   - **Frequency**: Twice daily (BD)
   - **Eye Specificity**: OU
   - **Duration**: 30 Days
2. Add medication to list (skip validation for first)
3. Add second medication:
   - **Drug**: Brimonidine
   - **Dosage**: 0.2%
   - **Frequency**: Twice daily (BD)
   - **Eye Specificity**: OU
   - **Duration**: 30 Days
4. Click "Validate & Add"

**Expected Result**:
- ❌ Red error banner
- ❌ Critical Error: "Critical Interaction"
  - Drug 1: Timolol
  - Drug 2: Brimonidine
  - Severity: "Critical"
  - Message: "Risk of severe hypotension and bradycardia"
  - Recommendation: "Avoid combination or monitor closely with cardiology consult"
- ❌ Override reason required

**Database Interaction Record**:
```sql
SELECT * FROM drug_interaction 
WHERE drug1_name = 'Timolol' AND drug2_name = 'Brimonidine';
-- Result: severity = 'Critical', description = 'Risk of severe hypotension...'
```

---

### Test Scenario 5: Moderate Interaction (Warning Only) ⚠️
**Objective**: Verify moderate interaction shows warning but allows override

**Steps**:
1. Add first medication: Prednisolone Acetate 1%
2. Add second medication: Moxifloxacin 0.5%
3. Click "Validate & Add"

**Expected Result**:
- ⚠️ **Yellow warning banner**: "Warnings detected - review before prescribing"
- ⚠️ **Warning Section**:
  - Warning Type: "Interaction"
  - Severity: "Moderate"
  - Message: "Concurrent use may increase risk of intraocular pressure elevation"
  - Can Override: True
  - Recommendation: "Monitor IOP closely if concurrent use necessary"
- ⚠️ "Acknowledge & Proceed" button (yellow) enabled
- ✅ Can add without override reason (but reason textarea available)

---

### Test Scenario 6: Duplicate Prescription ⚠️
**Objective**: Verify duplicate detection within 30-day window

**Steps**:
1. Add medication: Latanoprost 0.005% (OU, 30 days)
2. Save prescription
3. Same day, add same medication again (different dosage or eye)
4. Click "Validate & Add"

**Expected Result**:
- ⚠️ Yellow warning banner
- ⚠️ **Warning Section**:
  - Warning Type: "Duplicate"
  - Message: "Patient has active prescription for Latanoprost within last 30 days"
  - Severity: "Moderate"
  - Can Override: True
  - Recommendation: "Verify if refill or new prescription needed"
- ✅ Can proceed with acknowledgment

---

### Test Scenario 7: Multiple Issues (Errors + Warnings) ❌⚠️
**Objective**: Verify modal displays multiple issues correctly

**Steps**:
1. Select patient with Timolol allergy
2. Add existing medication: Prednisolone Acetate 1%
3. Add second medication: Timolol 0.5%
4. Click "Validate & Add"

**Expected Result**:
- ❌ Red error banner (due to allergy)
- ❌ **Errors Section**: Allergy to Timolol
- ⚠️ **Warnings Section**: Duplicate prescription for Prednisolone
- 🔵 **Interactions Section**: None (or moderate if applicable)
- ❌ Override reason **required** (critical error takes precedence)
- ❌ "Override & Proceed" button shown

---

### Test Scenario 8: Cancel Workflow ✅
**Objective**: Verify canceling validation clears pending medication

**Steps**:
1. Add any medication and click "Validate & Add"
2. Validation modal opens
3. Click "Cancel" button

**Expected Result**:
- ✅ Modal closes
- ✅ Medication NOT added to prescribed list
- ✅ Form remains filled (can edit and retry)
- ✅ No override reason saved
- ✅ Validation state cleared

---

### Test Scenario 9: Override Reason Validation ✅
**Objective**: Verify override reason is required for critical issues

**Steps**:
1. Trigger critical error (allergy or contraindication)
2. Modal opens with red error
3. Click "Override & Proceed" without entering reason

**Expected Result**:
- ❌ Alert/validation message: "Override reason is required for critical issues"
- ❌ Medication not added
- ❌ Modal remains open
- ✅ After entering reason (min 10 characters), proceed works
- ✅ Override reason logged in console (production: audit log)

---

## 🔗 Step 9: Integration Testing

### Integration Test 1: Complete Examination Flow
**Objective**: Test end-to-end workflow from queue to prescription

**Steps**:
1. **Queue Selection**: 
   - Navigate to queue TV: http://localhost:3000/dashboard/frontdesk/queue-tv
   - Select patient from waiting list
   - Click "Call Patient" → Status changes to "In Examination"

2. **Examination Start**:
   - Navigate to exam page
   - Verify patient details loaded
   - Check all tabs present: Chief Complaint, History, Vision, Refraction, Diagnosis, Medications, Summary

3. **Diagnosis Entry** (ICD10SearchDialog):
   - Click "Diagnosis" tab
   - Click "Search ICD-10 Diagnosis Codes" button
   - Search for "cataract"
   - Select "H25.11 - Age-related nuclear cataract, right eye"
   - Select laterality: **OD**
   - Mark as **Primary Diagnosis**
   - Verify diagnosis added to list
   - Repeat for left eye (H25.12, OS)

4. **Prescription Entry** (MedicationsTab with Validation):
   - Click "Medications" tab
   - Review current medications (if any)
   - Add new prescription:
     - Drug: Moxifloxacin 0.5%
     - Dosage: 0.5%
     - Frequency: Four times daily (QID)
     - Eye Specificity: **OU** (Both Eyes)
     - OU Instructions: "Instill 1 drop in both eyes 4 times daily starting 3 days before surgery"
     - Duration: 7 Days
   - Click "Validate & Add"
   - Validation modal opens → Verify no errors
   - Click "Add Medication"
   - Verify medication appears in prescribed list with OU badge

5. **Second Medication** (With Validation):
   - Add Prednisolone Acetate 1%
   - Frequency: Four times daily (QID)
   - Eye Specificity: **OU**
   - OU Instructions: "Instill 1 drop in both eyes starting 1 day after surgery, taper as directed"
   - Duration: 30 Days
   - Click "Validate & Add"
   - Check for interactions with Moxifloxacin
   - Proceed if warnings only

6. **Summary & Save**:
   - Click "Summary" tab
   - Review all entered data
   - Click "Save Examination"
   - Verify success message

**Expected Result**:
- ✅ All data persists across tabs
- ✅ Diagnoses show ICD-10 codes and laterality
- ✅ Medications show eye-specificity and instructions
- ✅ Validation runs for each medication
- ✅ No data loss on navigation
- ✅ Save succeeds with 200 response

---

### Integration Test 2: Eye-Specificity Scenarios
**Objective**: Test OD/OS/OU/Systemic paths independently

**Test 2a: OD Only (Right Eye)**
1. Add medication: Tobramycin + Dexamethasone
2. Select **OD** (Right Eye)
3. Enter OD Instructions: "Instill 1 drop in right eye every 4 hours for infection"
4. Validate and add
5. Verify OD badge and OD-specific instructions display

**Test 2b: OS Only (Left Eye)**
1. Add medication: Gatifloxacin 0.5%
2. Select **OS** (Left Eye)
3. Enter OS Instructions: "Instill 1 drop in left eye three times daily"
4. Validate and add
5. Verify OS badge and OS-specific instructions display

**Test 2c: OU (Both Eyes)**
1. Add medication: Carboxymethylcellulose 1%
2. Select **OU** (Both Eyes)
3. Enter OU Instructions: "Instill 1 drop in both eyes as needed for dryness"
4. Validate and add
5. Verify OU badge and OU-specific instructions display

**Test 2d: Systemic (Oral/IV)**
1. Add medication: Prednisolone (oral steroid)
2. Select **Systemic** (Oral/IV)
3. Enter General Instructions: "Take 40mg orally once daily with food"
4. Validate and add
5. Verify Systemic badge displays, no eye-specific instructions shown

---

### Integration Test 3: Multi-Patient Testing
**Objective**: Test validation with different patient profiles

**Patient Profile A: Ramesh Kumar (Healthy)**
- Age: 45
- Gender: Male
- Allergies: None
- Active Medications: None
- **Expected**: All validations pass, no warnings

**Patient Profile B: Lakshmi Devi (Asthmatic)**
- Age: 62
- Gender: Female
- Allergies: Sulfa drugs
- Conditions: Asthma
- **Expected**: 
  - Timolol contraindicated (respiratory)
  - Sulfonamide antibiotics trigger allergy warning

**Patient Profile C: Suresh Reddy (Cardiac)**
- Age: 70
- Gender: Male
- Allergies: Penicillin
- Conditions: Hypertension, Bradycardia
- Active Medications: Amlodipine, Metoprolol
- **Expected**:
  - Timolol contraindicated (bradycardia)
  - Drug interactions with systemic beta blockers

---

## 🎬 Step 10: End-to-End Testing

### E2E Test 1: Cataract Surgery Pre/Post-Op Flow
**Clinical Scenario**: 68-year-old patient scheduled for cataract surgery

**Pre-Operative Prescriptions**:
1. **Moxifloxacin 0.5%** (OU, QID, 3 days)  
   → OUI: "Start 3 days before surgery"
2. **Ketorolac 0.5%** (OU, QID, 3 days)  
   → OU Instructions: "Start 3 days before surgery for inflammation prevention"

**Post-Operative Prescriptions**:
1. **Prednisolone Acetate 1%** (OU, QID then taper, 30 days)  
   → OU Instructions: "Start day after surgery: Week 1 QID, Week 2 TID, Week 3 BD, Week 4 OD"
2. **Moxifloxacin 0.5%** (OU, QID, 7 days)  
   → OU Instructions: "Continue for 7 days post-op"

**Validation Checks**:
- ✅ No contraindications
- ⚠️ Moderate interaction: Steroid + NSAID (acceptable, monitor IOP)
- ⚠️ Duplicate: Moxifloxacin (pre-op continued post-op - acknowledge)

**Test Steps**:
1. Add all 4 medications sequentially
2. Verify validation for each
3. Review warnings for duplicate Moxifloxacin
4. Acknowledge and proceed
5. Print prescription
6. Verify all medications, eye-specificity, and instructions present

---

### E2E Test 2: Glaucoma Management Multi-Drug
**Clinical Scenario**: Glaucoma patient requiring aggressive IOP control

**Medications**:
1. **Latanoprost 0.005%** (OU, HS - at bedtime, ongoing)
2. **Timolol 0.5%** (OU, BD, ongoing)
3. **Dorzolamide 2%** (OU, TDS, ongoing)
4. **Brimonidine 0.2%** (OU, BD, ongoing)

**Validation Checks**:
- ⚠️ **Critical Interaction**: Timolol + Brimonidine (cardiovascular risk)
- ⚠️ Sulfa allergy check for Dorzolamide
- ✅ Standard glaucoma regimen, but requires monitoring

**Test Steps**:
1. Add Latanoprost → Passes
2. Add Timolol → Passes
3. Add Dorzolamide → Check sulfa allergy
4. Add Brimonidine → **Critical interaction detected**
5. Review interaction details
6. Enter override reason: "Standard glaucoma regimen, patient monitored by cardiology, BP stable"
7. Proceed with override
8. Save prescription
9. Verify override reason logged

---

### E2E Test 3: Pediatric Prescription (Age-Based)
**Clinical Scenario**: 8-year-old with conjunctivitis

**Medications**:
1. **Moxifloxacin 0.5%** (OU, QID, 7 days)
2. **Olopatadine 0.2%** (OU, BD, 14 days - for allergic component)

**Validation Checks**:
- ✅ Pediatric-safe medications
- ✅ No interactions
- ✅ Age-appropriate dosing

---

## 📊 Validation API Performance Testing

### Performance Test 1: Response Time Benchmarks
**Objective**: Measure validation API latency

**Test Method**:
```javascript
// Browser DevTools Console
const start = performance.now();
await fetch('http://localhost:5073/api/prescriptionvalidation/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
  body: JSON.stringify({
    patientId: 'patient-id-here',
    medications: [
      { medicationName: 'Timolol', eyeSpecificity: 'OU', dosage: '0.5%', frequency: 'BD', durationDays: 30 }
    ],
    checkAllergies: true,
    checkInteractions: true,
    checkContraindications: true,
    checkDuplicates: true
  })
});
const end = performance.now();
console.log(`Validation took ${end - start}ms`);
```

**Target Performance**:
- ✅ Single medication: <200ms
- ✅ 2-3 medications: <500ms
- ✅ 4+ medications: <1000ms

---

## 🐛 Known Issues & Edge Cases

### Issue 1: Validation Without Patient ID
- **Behavior**: Skips validation, adds medication directly
- **Expected**: Correct (validation requires patient context)
- **UI**: Shows "Safety checks enabled" indicator only when patientId present

### Issue 2: Edit Existing Medication
- **Behavior**: Re-validates entire prescription (existing + edited)
- **Expected**: Correct (ensures no new conflicts introduced)
- **Note**: May show duplicate warning if editing without changing med name

### Issue 3: Multiple Override Reasons
- **Current**: Only last override reason logged
- **Recommendation**: Store array of overrides with timestamps in production

### Issue 4: Validation While Offline
- **Behavior**: API call fails, offers to add without validation
- **Expected**: Correct fallback
- **Recommendation**: Add retry logic and offline queuing in production

---

## ✅ Test Completion Checklist

### Step 8: PrescriptionValidationModal
- [ ] Test Scenario 1: Valid prescription
- [ ] Test Scenario 2: Allergy conflict
- [ ] Test Scenario 3: Contraindication (asthma + Timolol)
- [ ] Test Scenario 4: Critical drug interaction
- [ ] Test Scenario 5: Moderate interaction (warning)
- [ ] Test Scenario 6: Duplicate prescription
- [ ] Test Scenario 7: Multiple issues combined
- [ ] Test Scenario 8: Cancel workflow
- [ ] Test Scenario 9: Override reason validation

### Step 9: Integration Testing
- [ ] Integration Test 1: Complete examination flow
- [ ] Integration Test 2: Eye-specificity scenarios (OD/OS/OU/Systemic)
- [ ] Integration Test 3: Multi-patient testing (healthy, asthmatic, cardiac)

### Step 10: E2E Testing
- [ ] E2E Test 1: Cataract surgery pre/post-op
- [ ] E2E Test 2: Glaucoma multi-drug management
- [ ] E2E Test 3: Pediatric prescription
- [ ] Performance testing (API response times)

---

## 📝 Test Results Log

### Session: February 19, 2026
**Tester**: [Your Name]  
**Environment**: Development (localhost)  
**Backend**: http://localhost:5073  
**Frontend**: http://localhost:3000

| Test ID | Scenario | Status | Notes | Duration |
|---------|----------|--------|-------|----------|
| S8-T1 | Valid prescription | ⏳ | Pending | - |
| S8-T2 | Allergy conflict | ⏳ | Pending | - |
| S8-T3 | Contraindication | ⏳ | Pending | - |
| S8-T4 | Critical interaction | ⏳ | Pending | - |
| S8-T5 | Moderate interaction | ⏳ | Pending | - |
| S8-T6 | Duplicate prescription | ⏳ | Pending | - |
| S8-T7 | Multiple issues | ⏳ | Pending | - |
| S8-T8 | Cancel workflow | ⏳ | Pending | - |
| S8-T9 | Override validation | ⏳ | Pending | - |
| S9-T1 | Complete exam flow | ⏳ | Pending | - |
| S9-T2 | Eye-specificity | ⏳ | Pending | - |
| S9-T3 | Multi-patient | ⏳ | Pending | - |
| S10-T1 | Cataract surgery | ⏳ | Pending | - |
| S10-T2 | Glaucoma management | ⏳ | Pending | - |
| S10-T3 | Pediatric case | ⏳ | Pending | - |
| S10-T4 | Performance | ⏳ | Pending | - |

**Legend**: ✅ Pass | ❌ Fail | ⚠️ Warning | ⏳ Pending | 🔄 In Progress

---

## 🚀 Quick Start Testing

### Open Three Browser Tabs:
1. **Frontend**: http://localhost:3000/dashboard/optometrist/exam
2. **Backend Swagger**: http://localhost:5073/swagger
3. **DevTools**: F12 → Network tab (monitor API calls)

### Login:
- Email: admin@test.com
- Password: Admin123!

### Start with Scenario 1 (Valid Prescription):
1. Click "Medications" tab
2. Add Carboxymethylcellulose 0.5%
3. Select OU
4. Add instructions
5. Click "Validate & Add"
6. Verify green success modal
7. Add medication
8. ✓ Check result in Network tab

### Continue with remaining scenarios sequentially.

---

## 📞 Support & Troubleshooting

### Validation Not Triggering:
- ✓ Check patientId is set in component props
- ✓ Verify "Safety checks enabled" indicator visible
- ✓ Check browser console for errors

### Modal Not Opening:
- ✓ Check `showValidationModal` state in React DevTools
- ✓ Verify PrescriptionValidationModal component rendered
- ✓ Check `validationResult` state populated

### API Returning 401 Unauthorized:
- ✓ Verify JWT token in localStorage
- ✓ Check token expiry (refresh login)
- ✓ Verify Authorization header in Network tab

### Database Connection Issues:
- ✓ Check Azure PostgreSQL firewall rules
- ✓ Verify connection string in appsettings.json
- ✓ Test with psql CLI

---

**End of Testing Guide**  
**Next Steps**: Begin Step 8 testing with Scenario 1, document results, proceed to Steps 9-10.
