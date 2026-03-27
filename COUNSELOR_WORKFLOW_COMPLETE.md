# Complete Counselor Module Workflow

## Overview
The Counselor Module manages patient education, consent, insurance processing, and surgery scheduling. **Counselors do NOT collect payments** - they explain costs and direct patients to the billing desk.

---

## 7-Stage Patient Journey

### **Stage 1: Queue Management**
**Template:** `QUEUE_TEMPLATE`  
**Widgets:** Queue List, Active Session, Session Notes

**Counselor Actions:**
1. Monitor waiting patients in queue (token number, wait time, priority)
2. Click "Call Next Patient" to select next patient
3. System creates counseling session automatically
4. Patient entry in queue changes to "In Session"

**Patient State:** Waiting → In Session  
**API Calls:**
- `GET /api/counseling/queue` - Fetch waiting patients
- `POST /api/counseling/queue/{id}/start-session` - Create session

---

### **Stage 2: Initial Consultation**
**Template:** `INITIAL_CONSULTATION_TEMPLATE`  
**Widgets:** Patient Summary, Clinical Review, Package Selection, IOL Recommendation, Session Notes

**Counselor Actions:**
1. Review patient medical history and diagnosis
2. Explain surgical options and treatment packages
3. Discuss IOL (Intraocular Lens) options
4. Patient selects preferred package
5. Click "Proceed to Insurance Discussion"

**Patient State:** Initial Consultation → Package Selected  
**API Calls:**
- `GET /api/counseling/sessions/{id}` - Load session data
- `PATCH /api/counseling/sessions/{id}` - Save package selection
  ```json
  {
    "packageDiscussed": true,
    "selectedPackage": "premium_package_id",
    "selectedIOL": "advanced_iol_id",
    "status": "InProgress"
  }
  ```

**Outcome:** Patient understands treatment options and costs

---

### **Stage 3: Insurance & Cost Discussion** ✅ **NEW - Corrected Workflow**
**Template:** `INSURANCE_DISCUSSION_TEMPLATE` (NO payment collection)  
**Widgets:** Patient Summary, Package Selection, Insurance Pre-Auth, Payment Summary, Session Notes

**Counselor Actions:**
1. **Review selected package and total costs**
   - Display package price, IOL upgrade costs, tax breakdown
   - Explain what's included vs. additional charges

2. **Submit Insurance Pre-Authorization**
   - Fill insurance details (policy number, provider, coverage limit)
   - Click "Submit Pre-Auth Request"
   - Track status: Draft → Submitted → Approved/Rejected/Pending

3. **Document insurance coverage**
   - Insurance pays: ₹X
   - Patient responsibility: ₹Y
   - Update session notes with coverage details

4. **Explain billing process**
   - "Please proceed to Billing Desk for payment"
   - "Billing Counter 3 handles advance payments"
   - Add note: "Patient directed to billing for ₹50,000 advance"

**Patient State:** Package Selected → Insurance Processed  
**API Calls:**
- `POST /api/counseling/insurance/submit-preauth` - Submit insurance request
- `GET /api/counseling/insurance/{preauthId}` - Check approval status
- `PATCH /api/counseling/sessions/{id}` - Update session with insurance details

**Critical Note:** 🚫 **Counselors do NOT collect payments**  
Payment collection happens at billing desk (separate module)

---

### **Stage 4: Consent Signing**
**Template:** `PRE_SURGERY_TEMPLATE`  
**Widgets:** Patient Summary, Consent Form Viewer, Document Viewer, Session Notes

**Counselor Actions:**
1. Explain surgical procedure, risks, and complications
2. Review consent documents with patient
3. Patient signs consent digitally or on paper
4. Upload signed consent to patient record
5. Click "Proceed to Surgery Scheduling"

**Patient State:** Insurance Processed → Consent Obtained  
**API Calls:**
- `GET /api/counseling/consent-forms` - Fetch required consent forms
- `POST /api/counseling/sessions/{id}/upload-consent` - Upload signed document
- `PATCH /api/counseling/sessions/{id}` - Mark consent as obtained

**Required Consents:**
- Surgical procedure consent
- Anesthesia consent
- IOL implantation consent
- HIPAA privacy acknowledgment

---

### **Stage 5: Surgery Scheduling**
**Template:** `PRE_SURGERY_TEMPLATE`  
**Widgets:** Patient Summary, Surgery Scheduler, Doctor Availability, Session Notes

**Counselor Actions:**
1. Check surgeon availability calendar
2. Check operation theater (OT) slot availability
3. Coordinate with patient's schedule
4. Book surgery date and time
5. Assign surgical team (surgeon, anesthesiologist, nurses)
6. Provide pre-op instructions

**Patient State:** Consent Obtained → Surgery Scheduled  
**API Calls:**
- `GET /api/counseling/doctors/availability?date=2026-03-15` - Check surgeon schedule
- `GET /api/counseling/operation-theater/slots` - Check OT availability
- `POST /api/counseling/surgeries/schedule` - Book surgery slot
  ```json
  {
    "sessionId": "session_uuid",
    "patientId": "patient_uuid",
    "surgeonId": "doctor_uuid",
    "scheduledDate": "2026-03-20T09:00:00Z",
    "operationTheaterId": "ot_uuid",
    "estimatedDuration": 120
  }
  ```

**Outcome:** Surgery confirmed for specific date/time

---

### **Stage 6: Admission Planning**
**Template:** `ADMISSION_TEMPLATE`  
**Widgets:** Patient Summary, Admission Checklist, Pre-Op Instructions, Session Notes

**Counselor Actions:**
1. Explain admission process and timing
2. Provide pre-operative instructions:
   - Fasting requirements (NPO 8 hours before)
   - Medication adjustments
   - What to bring to hospital
3. Review post-operative care expectations
4. Confirm emergency contact information
5. Click "Complete Counseling Session"

**Patient State:** Surgery Scheduled → Ready for Admission  
**API Calls:**
- `GET /api/counseling/admission/checklist` - Pre-admission requirements
- `PATCH /api/counseling/sessions/{id}` - Update admission readiness

**Deliverables:**
- Pre-op instruction sheet (printed/emailed)
- Admission checklist
- Emergency contact verified

---

### **Stage 7: Session Completion**
**Template:** `FOLLOWUP_TEMPLATE`  
**Widgets:** Session Summary, Next Steps, Session Notes

**Counselor Actions:**
1. Review entire counseling session summary
2. Verify all required steps completed:
   - ✅ Package selected
   - ✅ Insurance submitted
   - ✅ Patient directed to billing
   - ✅ Consent signed
   - ✅ Surgery scheduled
   - ✅ Pre-op instructions provided
3. Click "Mark Session Complete"
4. Print/email session summary for patient
5. Patient moves to "Counseled - Awaiting Surgery" status

**Patient State:** Ready for Admission → Counseling Complete  
**API Calls:**
- `POST /api/counseling/sessions/{id}/complete` - Mark session complete
- `GET /api/counseling/sessions/{id}/summary` - Generate session summary

**Next Steps for Patient:**
1. Visit Billing Desk (Counter 3) for advance payment
2. Complete pre-admission tests (if required)
3. Arrive on surgery day as scheduled
4. Post-surgery follow-up appointments

---

## Cross-Department Workflow Integration

### **Patient Journey Across All Departments:**

```
1. FRONT DESK (Registration)
   └─> Register patient → Create MRN → Assign branch
        ↓
2. QUEUE MANAGEMENT
   └─> Add to counselor queue → Assign token number
        ↓
3. COUNSELOR MODULE (This Module)
   └─> [Stage 1-7 as documented above]
        ↓
4. BILLING/FINANCE (Separate Module)
   └─> Collect advance payment → Generate receipt → Process insurance
        ↓
5. PRE-ADMISSION (Separate Module)
   └─> Lab tests → Medical clearance → Admission paperwork
        ↓
6. ADMISSION/IPD (Separate Module)
   └─> Admit patient → Assign bed → Pre-op preparation
        ↓
7. SURGERY/OT (Separate Module)
   └─> Perform surgery → Recovery room → Post-op monitoring
        ↓
8. DISCHARGE (Separate Module)
   └─> Final billing → Discharge summary → Follow-up scheduling
        ↓
9. FOLLOW-UP
   └─> Post-op visits → Vision checks → Complication management
```

---

## Widget Templates Comparison

### **🆕 INSURANCE_DISCUSSION_TEMPLATE** (For Counselors)
**Purpose:** Explain costs and insurance, NO payment collection

**Widgets:**
1. Patient Summary - View patient demographics and MRN
2. Active Session - Current counseling session details
3. Package Selection - Review selected treatment package
4. Insurance Pre-Auth - Submit and track insurance approval
5. **Payment Summary** - Show cost breakdown (read-only)
6. Session Notes - Document insurance discussion

**Missing (by design):** ❌ Payment Collection Widget

---

### **FINANCIAL_COUNSELING_TEMPLATE** (For Billing Staff)
**Purpose:** Collect payments, process transactions

**Widgets:**
1. Patient Summary
2. Active Session
3. Payment Summary - Cost breakdown
4. **Payment Collection** - Accept payments (cash/card/UPI)
5. Insurance Pre-Auth - View insurance status
6. Package Selection - View selected package
7. Document Viewer - View invoices/receipts
8. Session Notes

**Key Difference:** ✅ Includes Payment Collection Widget

---

## Counselor vs Billing: Role Separation

| Task | Counselor | Billing Desk |
|------|-----------|--------------|
| Explain treatment options | ✅ Yes | ❌ No |
| Select surgical package | ✅ Yes (with patient) | ❌ No |
| Submit insurance pre-auth | ✅ Yes | ✅ Yes (can also do) |
| Explain costs and coverage | ✅ Yes | ✅ Yes |
| **Collect advance payment** | ❌ **NO** | ✅ **YES** |
| Generate receipt | ❌ No | ✅ Yes |
| Process refunds | ❌ No | ✅ Yes |
| Sign consent forms | ✅ Yes | ❌ No |
| Schedule surgery | ✅ Yes | ❌ No |
| Provide pre-op instructions | ✅ Yes | ❌ No |

**Why This Separation?**
- **Compliance:** Separates clinical counseling from financial transactions
- **Audit Trail:** Clear accountability for payment handling
- **Patient Trust:** Counselors focus on education, not money collection
- **HIPAA:** Medical discussions separate from billing records

---

## Technical Implementation Details

### **Action Handlers in Counselor Page**

```typescript
onAction={async (action) => {
  if (action.type === 'PROCEED_TO_PAYMENT') {
    // Save package selection
    await updateSessionMutation.mutateAsync({
      id: workspace.activeSessionId,
      data: { 
        packageDiscussed: true, 
        status: 'InProgress' 
      }
    });
    
    // Switch to INSURANCE template (NOT financial)
    workspace.applyTemplate('insurance'); // ✅ Correct
    // workspace.applyTemplate('financial'); // ❌ Wrong - has payment collection
  }
}
```

### **Widget Template Structure**

```typescript
export const INSURANCE_DISCUSSION_TEMPLATE: WidgetTemplate = {
  id: 'insurance',
  name: 'Insurance & Cost Discussion',
  description: 'Insurance pre-auth, cost explanation (payment at billing desk)',
  stage: 'financial', // Maps to 'financial' stage in session workflow
  icon: Shield,
  widgets: [
    { widgetId: 'patient-summary', size: 'small', isPinned: true, order: 1 },
    { widgetId: 'active-session', size: 'small', isPinned: true, order: 2 },
    { widgetId: 'package-selection', size: 'medium', isPinned: false, order: 3 },
    { widgetId: 'insurance-preauth', size: 'large', isPinned: false, order: 4 },
    { widgetId: 'payment-summary', size: 'medium', isPinned: false, order: 5 },
    { widgetId: 'session-notes', size: 'medium', isPinned: false, order: 6 },
    // NO payment-collection widget
  ],
};
```

### **Database Session State Tracking**

```sql
-- counseling_session table columns relevant to workflow
session_stage VARCHAR -- Current stage: queue, initial, financial, consent, etc.
status VARCHAR -- Overall status: Pending, InProgress, Completed
package_discussed BOOLEAN -- Stage 2 complete
insurance_submitted BOOLEAN -- Stage 3 complete
consent_obtained BOOLEAN -- Stage 4 complete
surgery_scheduled_at TIMESTAMP -- Stage 5 complete
admission_ready BOOLEAN -- Stage 6 complete
completed_at TIMESTAMP -- Stage 7 complete
```

---

## Testing Checklist

### **End-to-End Test: Complete Patient Flow**

1. **Queue Test**
   - [ ] Patient appears in queue with correct token and wait time
   - [ ] "Call Next Patient" creates new session
   - [ ] Queue item status changes to "In Session"

2. **Initial Consultation Test**
   - [ ] Patient summary loads correctly
   - [ ] Clinical review widget displays medical history
   - [ ] Package selection allows choosing treatment option
   - [ ] "Proceed to Insurance Discussion" saves selection

3. **Insurance Discussion Test** ✅ **NEW**
   - [ ] Insurance template loads (NOT financial template)
   - [ ] Payment summary shows cost breakdown (read-only)
   - [ ] Insurance pre-auth form allows submission
   - [ ] NO payment collection widget visible
   - [ ] Session notes auto-save works

4. **Consent Signing Test**
   - [ ] Consent forms load in document viewer
   - [ ] Upload consent document functionality works
   - [ ] Session updates with consent obtained flag

5. **Surgery Scheduling Test**
   - [ ] Doctor availability calendar displays
   - [ ] OT slot booking works
   - [ ] Surgery confirmation generated

6. **Admission Planning Test**
   - [ ] Pre-op instruction sheet generates
   - [ ] Admission checklist displays
   - [ ] Patient receives printed instructions

7. **Session Completion Test**
   - [ ] Session summary generates correctly
   - [ ] All stages marked complete
   - [ ] Patient status updates to "Counseling Complete"
   - [ ] Session notes contain "Patient directed to billing desk"

---

## API Endpoints Used

### **Queue Management**
- `GET /api/counseling/queue` - List waiting patients
- `POST /api/counseling/queue/{id}/start-session` - Start counseling session
- `PATCH /api/counseling/queue/{id}` - Update queue item status

### **Session Management**
- `GET /api/counseling/sessions/{id}` - Get session details
- `PATCH /api/counseling/sessions/{id}` - Update session data
- `POST /api/counseling/sessions/{id}/complete` - Complete session
- `GET /api/counseling/sessions/{id}/summary` - Generate session summary

### **Insurance Processing**
- `POST /api/counseling/insurance/submit-preauth` - Submit pre-authorization
- `GET /api/counseling/insurance/{id}` - Get pre-auth status
- `PATCH /api/counseling/insurance/{id}` - Update insurance data

### **Surgery Scheduling**
- `GET /api/counseling/doctors/availability` - Check doctor schedule
- `GET /api/counseling/operation-theater/slots` - Check OT availability
- `POST /api/counseling/surgeries/schedule` - Book surgery

### **Documents & Consent**
- `GET /api/counseling/consent-forms` - Fetch consent templates
- `POST /api/counseling/sessions/{id}/upload-consent` - Upload signed consent
- `GET /api/counseling/documents/{id}` - Download document

---

## Common Issues & Solutions

### **Issue 1: Payment Collection Widget Appears**
**Symptom:** Counselors see payment collection screen after package selection

**Root Cause:** Using 'financial' template instead of 'insurance' template

**Solution:**
```typescript
// ❌ Wrong
workspace.applyTemplate('financial');

// ✅ Correct
workspace.applyTemplate('insurance');
```

### **Issue 2: Session Notes Not Saving**
**Symptom:** Notes disappear when switching templates

**Root Cause:** Auto-save not triggered or debounce delay

**Solution:**
- Session notes widget includes auto-save every 5 seconds
- Debounce prevents excessive API calls
- Check browser console for save confirmation

### **Issue 3: Insurance Pre-Auth Status Not Updating**
**Symptom:** Status stuck at "Draft" after submission

**Root Cause:** Backend processing delay or missing webhook

**Solution:**
- Add "Refresh Status" button to manually poll
- Implement SignalR real-time updates
- Show submission confirmation message

### **Issue 4: Surgery Scheduling Conflicts**
**Symptom:** Booking fails due to OT unavailability

**Root Cause:** Double-booking or outdated availability data

**Solution:**
- Implement optimistic locking on OT slots
- Refresh availability before final confirmation
- Show alternative time slots if first choice unavailable

---

## Future Enhancements

### **Phase 1 (Current)**
- ✅ Basic queue management
- ✅ Package selection
- ✅ Insurance pre-auth submission
- ✅ Session notes auto-save
- ✅ Widget-based architecture

### **Phase 2 (Next 2-4 Weeks)**
- [ ] Real-time SignalR queue updates
- [ ] Digital consent signing with e-signature
- [ ] Surgery scheduler with drag-and-drop calendar
- [ ] Pre-op instruction template builder
- [ ] Package comparison modal

### **Phase 3 (1-2 Months)**
- [ ] Video call integration for remote counseling
- [ ] AI-powered package recommendation engine
- [ ] Automated insurance eligibility verification
- [ ] Multi-language support for instructions
- [ ] SMS/Email notifications for scheduled surgeries

### **Phase 4 (3-6 Months)**
- [ ] Analytics dashboard (counseling bottlenecks, conversion rates)
- [ ] Patient feedback surveys
- [ ] Integration with external insurance portals
- [ ] Mobile app for counselors
- [ ] Voice-to-text session notes

---

## Summary: Counselor Workflow at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│              COUNSELOR MODULE - 7 STAGES                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. [QUEUE] Call Next Patient                               │
│       ↓                                                      │
│  2. [INITIAL] Review + Package Selection                    │
│       ↓                                                      │
│  3. [INSURANCE] Submit Pre-Auth + Explain Costs ✅ NEW      │
│       ↓   (NO PAYMENT COLLECTION - Direct to Billing)       │
│  4. [CONSENT] Sign Surgical Consent                         │
│       ↓                                                      │
│  5. [SCHEDULE] Book Surgery Date/Time                       │
│       ↓                                                      │
│  6. [ADMISSION] Provide Pre-Op Instructions                 │
│       ↓                                                      │
│  7. [COMPLETE] Session Summary + Next Steps                 │
│                                                              │
│  Patient → Billing Desk (Separate Module) → Pre-Admission  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Key Principle:** Counselors educate and prepare patients for surgery. Billing desk handles all financial transactions. This maintains role clarity, compliance, and patient trust.

---

## Files Modified (Implementation Complete)

1. **widget-templates.ts**
   - ✅ Added `Shield` icon import
   - ✅ Created `INSURANCE_DISCUSSION_TEMPLATE`
   - ✅ Added 'insurance' to `WIDGET_TEMPLATES` registry

2. **counselor/page.tsx**
   - ✅ Changed `workspace.applyTemplate('financial')` → `workspace.applyTemplate('insurance')`
   - ✅ Updated toast message to "Moving to insurance discussion"

**Status:** Implementation complete and ready for testing 🎉

---

## Contact & Support

**Module Owner:** Counseling Department Lead  
**Technical Lead:** [Your Name]  
**Documentation:** This file (COUNSELOR_WORKFLOW_COMPLETE.md)  
**Last Updated:** March 1, 2026  
**Version:** 1.0.0
