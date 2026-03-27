# Counselor Workflow - Test Plan & Next Steps

## 📋 Current Status (Based on Screenshots)

### ✅ WORKING CORRECTLY
1. **Patient Queue** - Displays 9 patients with wait times (81 min, 30 min, 79 min)
2. **Active Session Widget** - Shows session CS-20260301-3132-003, timer running (00:00:00)
3. **Patient Summary** - Displays Michael Johnson, MRN: "Not assigned", Y / Male, Ø B+
4. **Clinical Summary** - Shows diagnosis, referral info, IOP, visual acuity, medications
5. **Package Selection** - Shows 3 packages (Premium ₹125,000, Standard ₹75,000, Budget ₹45,000)
6. **IOL Recommendation** - Shows biometry data, IOL types (Monofocal, Multifocal, Toric)
7. **Session Notes** - Auto-save functionality working (Saved 06:58 pm)

### 🔍 READY TO TEST - Stage Progression
**Current Stage**: Step 1 of 8 (Initial Consultation) - 13% complete

---

## 🎯 Complete 8-Stage Counselor Workflow

### Stage 1: Initial Consultation (Currently Active ✅)
**Widgets**: Patient Summary, Active Session, Clinical Summary, Package Selection, IOL Recommendation, Session Notes

**Test Actions**:
1. ✅ Select patient from queue → Patient loads in workspace
2. ✅ Review clinical summary data
3. ✅ View package options
4. ✅ View IOL recommendations
5. 🔲 Take session notes → **TEST: Type notes and verify auto-save**
6. 🔲 Click "Complete Stage" button → **TEST: Advance to Stage 2**

---

### Stage 2: Clinical Review
**Expected Widgets**: Patient Summary, Active Session, Clinical Summary (detailed), Examination History

**Test Actions**:
1. 🔲 Review patient's full clinical history
2. 🔲 Check previous examination results
3. 🔲 Verify diagnostic data (IOP, Visual Acuity, Cataract Grade)
4. 🔲 Add clinical notes if needed
5. 🔲 Complete Stage → Advance to Stage 3

---

### Stage 3: Package Selection
**Expected Widgets**: Package Selection (interactive), Payment Summary, Insurance Check

**Test Actions**:
1. 🔲 Select a package (Premium/Standard/Budget)
   - Click package card
   - Verify selection highlights
   - Check package customization options
2. 🔲 Add optional upgrades:
   - Toric IOL Upgrade (+₹25,000)
   - Room Upgrade (+₹15,000)
   - Extended Care (+₹10,000)
   - Transport Service (+₹5,000)
3. 🔲 Verify package total calculates correctly
4. 🔲 Click "Proceed to Financial Counseling"
5. 🔲 Complete Stage → Advance to Stage 4

**Expected Result**: Package selection saved to session

---

### Stage 4: IOL Selection
**Expected Widgets**: IOL Recommendation (interactive), Biometry Data, IOL Comparison

**Test Actions**:
1. 🔲 Review biometry data:
   - K1: 43.5 D
   - K2: 44.2 D
   - Axial Length: 23.45 mm
   - Target Power: 21.5 D
2. 🔲 Select IOL type:
   - **Monofocal IOL** (Recommended)
   - **Multifocal IOL**
   - **Toric IOL**
   - **Premium Multifocal Toric**
3. 🔲 Click "Select IOL" button
4. 🔲 View "Compare Details"
5. 🔲 Complete Stage → Advance to Stage 5

**Expected Result**: IOL selection saved to session

---

### Stage 5: Financial Counseling
**Expected Widgets**: Payment Summary, Payment Collection, Insurance Pre-Auth, Document Viewer

**Test Actions**:
1. 🔲 Review payment summary (package + IOL + customizations)
2. 🔲 Check insurance coverage if applicable
3. 🔲 Process advance payment
4. 🔲 Generate payment receipt
5. 🔲 Explain payment schedule
6. 🔲 Complete Stage → Advance to Stage 6

**Expected Result**: Payment recorded, receipt generated

---

### Stage 6: Consent Signing / Pre-Surgery Planning
**Expected Widgets**: Consent Forms, Document Viewer, E-Signature

**Test Actions**:
1. 🔲 Present surgical consent form
2. 🔲 Explain procedure risks and benefits
3. 🔲 Get patient signature (digital/physical)
4. 🔲 Upload signed consent
5. 🔲 Document pre-surgery instructions
6. 🔲 Complete Stage → Advance to Stage 7

**Expected Result**: Consent form signed and uploaded

---

### Stage 7: Scheduling / Admission Planning
**Expected Widgets**: Surgery Scheduler, Calendar, Admission Instructions

**Test Actions**:
1. 🔲 Check doctor availability
2. 🔲 Check OT availability
3. 🔲 Schedule surgery date & time
4. 🔲 Book admission (Day Care / IPD)
5. 🔲 Print admission instructions
6. 🔲 Send SMS/Email confirmation
7. 🔲 Complete Stage → Advance to Stage 8

**Expected Result**: Surgery scheduled, admission confirmed

---

### Stage 8: Follow-up / Completion
**Expected Widgets**: Follow-up Scheduler, Session Summary, Next Appointment

**Test Actions**:
1. 🔲 Schedule post-op follow-up appointments
2. 🔲 Print discharge instructions
3. 🔲 Review complete counseling summary
4. 🔲 Mark session as "Completed"
5. 🔲 Close patient workspace

**Expected Result**: Session completed, patient moves to "Completed" status

---

## 🧪 Integration Tests

### Test 1: Complete Stage Button
**Location**: Active Session Widget → "Complete Stage" button

**Test Steps**:
1. Click "Complete Stage" button on Step 1
2. **Expected**: Modal/confirmation dialog appears
3. Confirm stage completion
4. **Expected**: 
   - Progress bar updates (1/8 → 2/8)
   - Percentage updates (13% → 25%)
   - Stage name changes (Initial Consultation → Clinical Review)
   - Widgets reload for new stage
   - Step indicator updates (1 becomes green checkmark, 2 becomes active)

**API Call Expected**: 
```javascript
onAction({
  type: 'COMPLETE_STAGE',
  payload: { currentStage: 'initial' },
  timestamp: new Date()
})
```

**Backend Missing**: 
- ⚠️ No direct API endpoint found for stage progression
- Current `UpdateCounselingSessionRequest` only has `Status` field, not `Stage`
- Need to add: `PUT /api/counseling/sessions/{id}/advance-stage` or similar

---

### Test 2: Package Selection Flow
**Location**: Package Selection Widget

**Test Steps**:
1. Click "Standard Package" card
2. **Expected**: Card highlights with blue border, checkmark appears
3. Click "Proceed to Financial Counseling" button
4. **Expected**:
   - Session data updates with selected package
   - Stage auto-advances to Stage 5 (Financial)
   - Package details appear in Payment Summary widget

---

### Test 3: Session Notes Auto-Save
**Location**: Session Notes Widget

**Test Steps**:
1. Type text in session notes textarea
2. Wait 3 seconds
3. **Expected**: "Saved [timestamp]" appears
4. Refresh page
5. **Expected**: Notes persist and reload

**API Call**: `PUT /api/counseling/sessions/{id}/notes`

---

### Test 4: Queue Real-Time Updates (SignalR)
**Pre-requisite**: SignalR Phase 4.1 implementation

**Test Steps**:
1. Open counselor page in two browser tabs
2. In Tab 1: Click "Call Next Patient"
3. **Expected in Tab 2**:
   - Queue count updates automatically
   - Patient moves from "Waiting" to "Called"
   - Toast notification appears
4. In Tab 1: Start session
5. **Expected in Tab 2**:
   - Patient moves to "In Progress"
   - Queue stats update

---

## 🐛 Known Issues to Fix

### Issue 1: Stage Progression API Missing ❌
**Problem**: No backend endpoint to update session stage  
**Impact**: "Complete Stage" button doesn't work  
**Solution Needed**:
```csharp
// Add to UpdateCounselingSessionRequest
public string? SessionStage { get; set; } // initial, clinical-review, package-selection, etc.
```

```csharp
// Add to CounselingController
[HttpPost("sessions/{id}/advance-stage")]
public async Task<IActionResult> AdvanceStage(Guid id)
{
    // Logic to move from current stage to next stage
}
```

---

### Issue 2: Widget Template Transitions ⚠️
**Problem**: When stage advances, widgets need to reload for new stage  
**Current**: Templates defined in `widget-templates.ts`  
**Test**: Verify workspace.applyTemplate() gets called after stage change

---

### Issue 3: Session Data Persistence ⚠️
**Problem**: Package/IOL selections need to be saved to session  
**Test**: Verify `UpdateCounselingSessionRequest` includes:
- `RecommendedIol` ✅ (Already exists)
- `IolPower` ✅ (Already exists)
- Need: `SelectedPackageId`
- Need: `PackageCustomizations` (JSON)

---

## 📊 Testing Checklist

### Priority 1: Critical Path (Must Work)
- [ ] Stage 1 → Stage 2 progression
- [ ] Package selection saves to session
- [ ] IOL selection saves to session
- [ ] Session notes auto-save
- [ ] Session completion workflow

### Priority 2: Data Integrity
- [ ] All widget data persists across page refresh
- [ ] Queue status updates correctly
- [ ] Session timer accurate
- [ ] Payment calculations correct

### Priority 3: Real-Time Features
- [ ] SignalR queue updates work
- [ ] Multi-tab session sync
- [ ] Toast notifications appear

### Priority 4: Error Handling
- [ ] Network errors handled gracefully
- [ ] Invalid data rejected with clear messages
- [ ] Session timeout warning
- [ ] Unsaved changes warning

---

## 🚀 Next Immediate Actions

### Action 1: Implement Stage Progression (Backend)
**File**: `CounselingWorkflowModels.cs`
```csharp
public class AdvanceStageRequest
{
    public string CurrentStage { get; set; } = null!;
    public string? Notes { get; set; }
}
```

**File**: `CounselingController.cs`
```csharp
[HttpPost("sessions/{id}/advance-stage")]
public async Task<IActionResult> AdvanceStage(Guid id, [FromBody] AdvanceStageRequest request)
{
    // Validate current stage
    // Move to next stage
    // Update CounselingWorkflowState table
    // Return updated session
}
```

---

### Action 2: Wire Up Complete Stage Button (Frontend)
**File**: `counselor/page.tsx`

Add handler for COMPLETE_STAGE action:
```typescript
if (action.type === 'COMPLETE_STAGE') {
  // Call API to advance stage
  await updateSessionStage(sessionId, action.payload.currentStage);
  // Reload widgets for next stage
  workspace.applyTemplate(getNextStageTemplate(currentStage));
}
```

---

### Action 3: Test Package Selection Save
**File**: `PackageSelectionWidget.tsx`

Verify "Proceed to Financial Counseling" button calls:
```typescript
onAction?.({
  type: 'PACKAGE_SELECTED',
  payload: {
    packageId: selected,
    packageType: 'Standard',
    basePrice: 75000,
    totalPrice: calculateTotal()
  }
})
```

---

## 📝 Test Execution Order

**Day 1** - Basic Flow:
1. Test Stage 1 widgets loading ✅ DONE
2. Test session notes auto-save
3. Implement stage progression API
4. Test Stage 1 → Stage 2 transition

**Day 2** - Package & IOL Flow:
1. Test package selection widget interaction
2. Test IOL selection widget interaction
3. Test data persistence
4. Test Stage 3 → Stage 4 → Stage 5

**Day 3** - Financial & Consent:
1. Test payment summary calculations
2. Test consent form workflow
3. Test document upload
4. Test Stage 5 → Stage 6 → Stage 7

**Day 4** - Scheduling & Completion:
1. Test surgery scheduler
2. Test admission planning
3. Test follow-up scheduling
4. Test session completion

**Day 5** - Real-Time & Polish:
1. Test SignalR queue updates
2. Test multi-tab sync
3. Test error scenarios
4. Fix any remaining UI bugs

---

## 🎉 Success Criteria

### Complete Workflow Test Passed When:
1. ✅ Patient loaded from queue
2. ✅ All 8 stages can be progressed through
3. ✅ Data persists at each stage
4. ✅ Widgets load correctly for each stage
5. ✅ Session completes and moves patient to "Completed"
6. ✅ Queue updates in real-time
7. ✅ No console errors or warnings
8. ✅ Performance is smooth (<500ms page transitions)

---

## 📞 Ready to Start Testing?

**FIRST TEST TO RUN RIGHT NOW:**

1. **Verify Session Notes Auto-Save**:
   - Scroll to Session Notes widget (bottom of page)
   - Click in text area
   - Type: "Test patient counseling session for Michael Johnson"
   - Wait 3 seconds
   - Look for "Saved [time]" indicator
   - Open browser DevTools → Network tab
   - Look for PUT request to `/api/counseling/sessions/.../notes`

**Let me know the result and we'll proceed to the next test!** 🚀
