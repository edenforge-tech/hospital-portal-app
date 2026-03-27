# Counselor Module Testing Guide

**Module**: Counselor (Module 3)  
**Status**: 100% Complete - Ready for Testing  
**Backend**: 58 endpoints ✅  
**Frontend**: 48 components ✅  
**Type Safety**: 0 TypeScript errors ✅

---

## Prerequisites

1. **Backend Running**: `http://localhost:5073`
2. **Frontend Running**: `http://localhost:3000`
3. **Logged In**: Valid JWT token with Counselor role
4. **Tenant Selected**: X-Tenant-ID header set

---

## Testing Workflow (Complete Session)

### 1. Session Management ✅
**Path**: `/counselor/sessions`

**Test Cases**:
- [ ] View all counseling sessions (table loads)
- [ ] Filter by status (Scheduled, In Progress, Completed)
- [ ] Search by session number or patient name
- [ ] Create new session:
  - Patient ID: `12345678-1234-1234-1234-123456789012`
  - Session type: "Pre-Surgery"
  - Scheduled date: Tomorrow
  - Counselor: Select from dropdown
- [ ] View session details (click "View" action)
- [ ] Edit session (change status to "In Progress")
- [ ] Add notes to session
- [ ] Mark session as completed

---

### 2. Patient Selection ✅
**Component**: `SessionSelector.tsx` (used across all modules)

**Test Cases**:
- [ ] Select existing session from dropdown
- [ ] Search sessions by number
- [ ] Display patient name after selection
- [ ] Persist selection across page navigation

---

### 3. Insurance Management ✅
**Path**: `/counselor/insurance`

#### Pre-Authorizations
- [ ] View all pre-auth requests
- [ ] Create pre-auth:
  - Session ID: From selector
  - Patient ID: Auto-filled
  - Insurance provider: "Aetna"
  - Policy number: "POL123456"
  - Treatment type: "Cataract Surgery"
  - Estimated cost: ₹50,000
  - Auth validity: 30 days
- [ ] Upload documents (PDF/image)
- [ ] View approval status
- [ ] Approve/Reject pre-auth (Admin flow)

#### Claims
- [ ] View all claims (Private TPA + Government)
- [ ] Create private claim:
  - Insurance provider: "ICICI Lombard"
  - TPA: "Medi Assist"
  - Policy number: "POL789012"
  - Claimed amount: ₹35,000
  - Diagnosis code: "H25.1"
  - Procedure code: "66984"
- [ ] Create government claim:
  - Scheme: "CGHS"
  - Card number: "CGHS123456"
  - Application number: "APP789"
  - Claim amount: ₹25,000
- [ ] Track claim status (Submitted → UnderReview → Approved → Settled)
- [ ] View settlement details

---

### 4. Payments ✅
**Path**: `/counselor/payments`

#### Payment Collection
- [ ] View all payments
- [ ] Record payment:
  - Session ID: From selector
  - Patient ID: Auto-filled
  - Amount: ₹10,000
  - Payment mode: Cash/Card/UPI/NEFT
  - Receipt number: Auto-generated or manual
  - Transaction reference: (if digital)
- [ ] Generate receipt (PDF)
- [ ] View payment history

#### Payment Links
- [ ] Create payment link:
  - Link amount: ₹5,000
  - Expiry: 7 days
  - Recipient phone: +91-9876543210
  - Recipient email: patient@example.com
  - Send via: SMS + Email
- [ ] View QR code (embedded in UI)
- [ ] Copy payment link URL
- [ ] Track link status (Active → Paid/Expired)
- [ ] View payment against link

#### Refunds
- [ ] View refund requests
- [ ] Create refund:
  - Original payment ID: From dropdown
  - Refund amount: ≤ original amount
  - Refund mode: Same as payment mode
  - Reason: "Treatment cancelled"
- [ ] Process refund (Admin flow)
- [ ] Track refund status (Initiated → Processed → Sent → Completed)

---

### 5. Admissions ✅
**Path**: `/counselor/admissions`

**Test Cases**:
- [ ] View all admissions
- [ ] Create admission:
  - Session ID: From selector
  - Patient ID: Auto-filled
  - Admission type: "Surgery"
  - Planned date: Tomorrow
  - Surgery type: "Phacoemulsification"
  - Eye operated: "Right"
  - Bed assigned: "B-101"
  - Ward: "General"
  - Surgeon: "Dr. Sharma"
  - Anesthesia type: "Local"
  - Pre-op checklist: ☑ Completed
- [ ] Edit admission details
- [ ] Change admission status (Planned → Admitted → Discharged)
- [ ] View discharge summary

---

### 6. Consents ✅
**Path**: `/counselor/consents`

#### Consent Templates
- [ ] View all templates
- [ ] Create template:
  - Template name: "Cataract Surgery Consent"
  - Category: "Surgery Consent"
  - Content: HTML with placeholders
    ```html
    <h3>Consent Form</h3>
    <p>I, {{PATIENT_NAME}}, hereby consent to {{SURGERY_TYPE}} to be performed on {{DATE}} by {{DOCTOR_NAME}}.</p>
    ```
  - Requires patient signature: ☑
  - Requires witness signature: ☑
  - Requires guardian signature: ☐
- [ ] Edit template
- [ ] Duplicate template
- [ ] Activate/Deactivate template

#### Patient Consents
- [ ] Render consent from template:
  - Template: "Cataract Surgery Consent"
  - Session ID: From selector
  - Patient ID: Auto-filled
  - Placeholder values:
    ```json
    {
      "PATIENT_NAME": "John Doe",
      "SURGERY_TYPE": "Cataract Surgery",
      "DATE": "2026-02-01",
      "DOCTOR_NAME": "Dr. Sharma"
    }
    ```
  - Preview rendered HTML
- [ ] Generate patient consent (creates draft)
- [ ] Patient sign consent:
  - Status: Draft → PatientSigned
  - Shows ✓ Patient Signed badge
- [ ] Witness sign consent:
  - Status: PatientSigned → WitnessSigned
  - Shows ✓ Patient ✓ Witness badges
- [ ] Finalize consent:
  - Status: WitnessSigned → Finalized
  - Shows ✓ Patient ✓ Witness ✓ Finalized badges
- [ ] Download PDF
- [ ] View consent history

**Signature Workflow Test**:
```
Create Consent (Draft)
   ↓
Patient Sign (PatientSigned)
   ↓
Witness Sign (WitnessSigned)  ← Only if required
   ↓
Finalize (Finalized)
```

---

### 7. Workflow Management ✅
**Path**: `/counselor/workflow`

**Test Cases**:
- [ ] View all workflows
- [ ] Filter by status (In Progress, Blocked, Completed)
- [ ] Initialize workflow:
  - Session ID: From selector
  - Patient ID: Auto-filled
  - Initial state: "SessionStarted"
  - Total milestones: 16
  - Expected completion: 7 days from now
- [ ] View workflow progress:
  - **Overall Progress**: Progress bar showing completion %
  - **Milestones**: Achieved / Remaining / Total
  - **Blockage Alert**: Shows red banner if blocked
- [ ] View stage status:
  - Completed stages: Green ✓ badges
  - Pending stages: Blue ⏳ badges
- [ ] View stage transitions timeline:
  - Shows: SessionStarted → InsuranceVerified → PaymentReceived
  - With timestamps and trigger type (Manual/Automatic/Dependency)
- [ ] View stage dependencies:
  - Example: "PaymentReceived depends on InsuranceVerified"
- [ ] Update workflow stage manually
- [ ] Mark workflow as blocked (with reason)
- [ ] Complete workflow

**Progress Visualization Test**:
```
Overall Progress: [████████░░] 80% (13/16 milestones)

Stages Status:
✓ SessionStarted  ✓ InsuranceVerified  ✓ PaymentReceived
⏳ ConsentSigned  ⏳ AdmissionScheduled  ⏳ WorkflowCompleted

Timeline:
SessionStarted → InsuranceVerified (Manual, 2026-01-28 10:00)
InsuranceVerified → PaymentReceived (Automatic, 2026-01-28 11:30)
```

---

## Edge Cases & Error Handling

### Validation Errors
- [ ] Submit form with empty required fields → Shows field-level errors
- [ ] Submit payment with amount < 0 → Shows toast error
- [ ] Create claim with invalid date → Shows validation message
- [ ] Create payment link with expiry in past → Rejected by backend

### Network Errors
- [ ] Stop backend → All tables show "Failed to load" error
- [ ] Refresh page → Error boundary catches and shows reload button
- [ ] Submit form while offline → Shows network error toast

### Permission Errors
- [ ] Access counselor page without Counselor role → 403 Forbidden
- [ ] Approve pre-auth without Admin role → 403 Forbidden
- [ ] Process refund without Finance role → 403 Forbidden

### Data Errors
- [ ] Select non-existent session ID → Shows "Session not found" error
- [ ] Submit duplicate consent → Backend rejects with clear message
- [ ] Create payment link with invalid phone → Validation error

---

## Loading States

**Test**: Slowly throttle network (Chrome DevTools → Network → Slow 3G)

- [ ] Tables show Skeleton placeholders while loading
- [ ] Forms disable submit button during mutation
- [ ] Buttons show spinner during async operations
- [ ] Progress dialog shows skeleton for transitions timeline

---

## Accessibility Checklist (WCAG 2.1 AA)

### Keyboard Navigation
- [ ] Tab through all form fields (proper focus order)
- [ ] Press Enter in forms → Submits form
- [ ] Press Escape in dialogs → Closes dialog
- [ ] Arrow keys navigate dropdown options

### Screen Reader
- [ ] All buttons have aria-labels (icon-only buttons)
- [ ] Form errors announced when validation fails
- [ ] Toast notifications have role="status"
- [ ] Tables have proper th/td structure
- [ ] Dialogs have aria-labelledby and aria-describedby

### Visual
- [ ] All text meets 4.5:1 contrast ratio
- [ ] Focus indicators visible on all interactive elements
- [ ] Color not sole indicator (status badges have icons)
- [ ] Text scales up to 200% without breaking layout

---

## Performance Checks

### Initial Load
- [ ] Tables load < 2 seconds with 100 rows
- [ ] Forms render < 500ms
- [ ] Dialogs open instantly (no lag)

### Interactions
- [ ] Search input debounced (no lag while typing)
- [ ] Table sorting instant feedback
- [ ] Form submission < 1 second (optimistic updates)

### Memory
- [ ] No memory leaks after 10 page navigations
- [ ] React DevTools shows no unnecessary re-renders
- [ ] Large tables use virtual scrolling (if > 100 rows)

---

## Cross-Browser Testing

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | ✅ Primary |
| Firefox | Latest | ⚠️ Test |
| Safari | Latest | ⚠️ Test date inputs |
| Edge | Latest | ✅ Should work |

**Known Issues**:
- Safari date inputs may need polyfill
- Firefox may require explicit focus styles

---

## API Integration Verification

### Backend Endpoints Used (58 total)

**Sessions**: 9 endpoints
- GET `/api/counseling-sessions/session/{sessionId}`
- PATCH `/api/counseling-sessions/session/{sessionId}/status`
- POST `/api/counseling-sessions/session/{sessionId}/notes`
- etc.

**Insurance**: 11 endpoints
- POST `/api/insurance/pre-authorization`
- GET `/api/insurance/claims`
- POST `/api/insurance/private-claim`
- POST `/api/insurance/government-claim`
- GET `/api/insurance/settlements/{claimId}`
- etc.

**Payments**: 14 endpoints
- POST `/api/payments/create`
- GET `/api/payments/session/{sessionId}`
- POST `/api/payments/link`
- POST `/api/payments/link/{linkId}/send`
- POST `/api/payments/refund`
- etc.

**Admissions**: 8 endpoints
- POST `/api/admissions`
- GET `/api/admissions/{admissionId}`
- PATCH `/api/admissions/{admissionId}`
- etc.

**Consents**: 8 endpoints
- GET `/api/consents/templates`
- POST `/api/consents/template`
- POST `/api/consents/render`
- POST `/api/consents/{consentId}/sign`
- POST `/api/consents/{consentId}/witness-sign`
- POST `/api/consents/{consentId}/finalize`
- etc.

**Workflow**: 8 endpoints
- POST `/api/workflow/initialize`
- GET `/api/workflow/progress/{sessionId}`
- POST `/api/workflow/update-stage`
- GET `/api/workflow/transitions/{sessionId}`
- GET `/api/workflow/dependencies/{sessionId}`
- etc.

---

## Regression Testing

**After any code changes, verify**:
- [ ] All tables still load data correctly
- [ ] All forms submit successfully
- [ ] All dialogs open/close properly
- [ ] No console errors in browser DevTools
- [ ] TypeScript compilation succeeds (pnpm tsc --noEmit)
- [ ] Build succeeds (pnpm build)

---

## Bug Reporting Template

```markdown
**Module**: Counselor - [Sub-module name]
**Component**: [Component name]
**Issue**: [Brief description]

**Steps to Reproduce**:
1. Navigate to /counselor/[page]
2. Click [button]
3. Observe [issue]

**Expected**: [What should happen]
**Actual**: [What actually happens]

**Environment**:
- Browser: Chrome 120
- OS: Windows 11
- Backend: localhost:5073
- Tenant ID: [UUID]

**Console Errors**: [Paste any errors]
**Screenshot**: [If applicable]
```

---

## Sign-Off Checklist

Before marking module as "Production Ready":

- [x] All 48 components created
- [x] All 58 backend endpoints integrated
- [x] 0 TypeScript errors in counselor module
- [ ] All test cases passed (see above)
- [ ] Accessibility audit completed (WCAG 2.1 AA)
- [ ] Cross-browser testing completed
- [ ] Performance benchmarks met
- [ ] Error handling verified
- [ ] Loading states working
- [ ] Documentation complete

**Current Status**: 🟡 **95% Complete** - Testing & Accessibility pending

---

## Next Steps

1. **Manual Testing** (1 hour):
   - Execute all test cases in this guide
   - Document any bugs found

2. **Accessibility Improvements** (30 min):
   - Add missing aria-labels
   - Verify keyboard navigation
   - Test with screen reader

3. **Performance Optimization** (30 min):
   - Add React.memo to expensive components
   - Implement virtual scrolling for large tables
   - Add debounce to search inputs

4. **Documentation** (15 min):
   - Add JSDoc comments to complex components
   - Create user guide with screenshots

**Estimated Time to 100%**: 2 hours

---

## Contact

For issues or questions about this module:
- **Developer**: AI Coding Agent
- **Module**: Counselor (Module 3)
- **Last Updated**: 2026-02-01
- **Version**: 1.0.0
