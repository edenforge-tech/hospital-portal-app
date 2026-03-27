# 🚀 PHASE 3 - CLINICAL WORKFLOWS & PRESCRIPTIONS MODULE

**Start Date:** January 28, 2026 (Immediately after Phase 2 completion)  
**Estimated Duration:** 2-3 weeks  
**Status:** Ready to begin ✅  
**Prerequisites:** ✅ Phase 1 Complete (30 examination modules), ✅ Phase 2 Complete (6 patient management modules)

---

## 📋 Phase 3 Objectives

Transform the eye hospital system from **patient management** to **complete clinical workflows** by implementing:

1. **Prescriptions Module** - Eye-specific medication prescriptions (drops, ointments, oral medications)
2. **Laboratory Orders & Results** - Blood tests, A-scan, biometry orders with result tracking
3. **Pharmacy Management** - Inventory, dispensing, stock alerts
4. **Eye Imaging Integration** - Structured storage for OCT, fundus, visual field, topography
5. **Clinical Decision Support** - Drug interaction checks, contraindication alerts

---

## 🎯 Module Breakdown

### Module 1: Prescriptions System (Week 1, 5-6 days)

#### Frontend Components (~3,500 lines)

**1. PrescriptionCreator.tsx** (~1,200 lines)
- **Location:** `apps/hospital-portal-web/src/components/prescriptions/PrescriptionCreator.tsx`
- **Features:**
  - Eye-specific medication templates (drops, ointments, oral)
  - Auto-fill from examination findings
  - Dosage calculator (drops per day → bottle duration)
  - OD/OS/OU selection for topical medications
  - Tapering schedules (e.g., prednisolone post-op: 4x → 3x → 2x → 1x)
  - Drug interaction checker (real-time alerts)
  - Contraindication warnings (e.g., "Pilocarpine contraindicated in uveitis")
  - ICD-10 diagnosis linking
  - E-prescription signature
  - Print/Email/SMS prescription

**2. PrescriptionHistory.tsx** (~800 lines)
- **Location:** `apps/hospital-portal-web/src/components/prescriptions/PrescriptionHistory.tsx`
- **Features:**
  - Timeline view of all patient prescriptions
  - Filter by medication name, date range, prescriber
  - Refill tracking (refill count, last refill date, next refill due)
  - Adherence visualization (bar chart: prescribed vs. actual refills)
  - Medication discontinuation tracking
  - Allergy warnings (red banner if patient allergic to prescribed drug)

**3. MedicationDatabase.tsx** (~1,000 lines)
- **Location:** `apps/hospital-portal-web/src/components/prescriptions/MedicationDatabase.tsx`
- **Features:**
  - Eye medication catalog (200+ drugs):
    - **Anti-glaucoma:** Latanoprost, Timolol, Brimonidine, Dorzolamide
    - **Anti-inflammatory:** Prednisolone acetate, Fluorometholone, Ketorolac
    - **Anti-infective:** Moxifloxacin, Tobramycin, Gatifloxacin
    - **Cycloplegics:** Atropine, Cyclopentolate, Tropicamide
    - **Anti-VEGF:** Ranibizumab, Aflibercept, Bevacizumab
    - **Mydriatics:** Phenylephrine, Tropicamide
  - Generic + brand name search
  - Dosage forms (drops, ointment, gel, tablets)
  - Standard dosages (1 drop BID OD = "One drop twice daily in right eye")
  - Side effects database
  - Pregnancy category (A, B, C, D, X)
  - Drug interaction matrix (200x200 interactions)

**4. DrugInteractionChecker.tsx** (~500 lines)
- **Location:** `apps/hospital-portal-web/src/components/prescriptions/DrugInteractionChecker.tsx`
- **Features:**
  - Real-time interaction checking as medications added
  - Severity levels:
    - 🔴 **Contraindicated:** "DO NOT prescribe together"
    - 🟠 **Major:** "Requires dose adjustment or close monitoring"
    - 🟡 **Moderate:** "Use with caution"
    - 🟢 **Minor:** "Usually safe"
  - Examples:
    - Timolol + Beta-blocker oral → "Additive bradycardia risk"
    - Pilocarpine + Atropine → "Antagonistic effects"
    - Multiple topical drops → "Administer 5 minutes apart"

#### Backend Implementation (~2,000 lines)

**5. Medication Entity Model**
```csharp
[Table("medications")]
public class Medication
{
    [Column("id")] public Guid Id { get; set; }
    [Column("generic_name")] public string GenericName { get; set; }
    [Column("brand_names")] public string BrandNames { get; set; } // JSON array
    [Column("category")] public string Category { get; set; } // Anti-glaucoma, Anti-inflammatory, etc.
    [Column("dosage_forms")] public string DosageForms { get; set; } // JSON: ["0.5% drops", "1% ointment"]
    [Column("standard_dosages")] public string StandardDosages { get; set; } // JSON array
    [Column("side_effects")] public string SideEffects { get; set; }
    [Column("contraindications")] public string Contraindications { get; set; }
    [Column("pregnancy_category")] public string PregnancyCategory { get; set; }
    [Column("interactions")] public string Interactions { get; set; } // JSON array of drug IDs
    // ... standard audit fields
}
```

**6. Prescription Entity Model**
```csharp
[Table("prescriptions")]
public class Prescription
{
    [Column("id")] public Guid Id { get; set; }
    [Column("tenant_id")] public Guid TenantId { get; set; }
    [Column("patient_id")] public Guid PatientId { get; set; }
    [Column("appointment_id")] public Guid? AppointmentId { get; set; }
    [Column("examination_id")] public Guid? ExaminationId { get; set; }
    [Column("prescriber_id")] public Guid PrescriberId { get; set; }
    [Column("diagnosis_icd10")] public string DiagnosisICD10 { get; set; } // JSON array
    [Column("prescription_date")] public DateTime PrescriptionDate { get; set; }
    [Column("valid_until")] public DateTime? ValidUntil { get; set; }
    [Column("notes")] public string? Notes { get; set; }
    [Column("signature_data")] public string? SignatureData { get; set; } // Base64 e-signature
    [Column("status")] public string Status { get; set; } // active, discontinued, completed
    // ... standard audit fields
}
```

**7. PrescriptionItem Entity Model**
```csharp
[Table("prescription_items")]
public class PrescriptionItem
{
    [Column("id")] public Guid Id { get; set; }
    [Column("prescription_id")] public Guid PrescriptionId { get; set; }
    [Column("medication_id")] public Guid MedicationId { get; set; }
    [Column("medication_name")] public string MedicationName { get; set; }
    [Column("dosage_form")] public string DosageForm { get; set; } // "0.5% drops"
    [Column("dosage")] public string Dosage { get; set; } // "1 drop"
    [Column("frequency")] public string Frequency { get; set; } // "BID" (twice daily)
    [Column("route")] public string Route { get; set; } // "Topical OD", "Topical OS", "Oral"
    [Column("duration_days")] public int DurationDays { get; set; }
    [Column("quantity")] public decimal Quantity { get; set; } // 1 bottle
    [Column("refills_allowed")] public int RefillsAllowed { get; set; }
    [Column("refills_remaining")] public int RefillsRemaining { get; set; }
    [Column("instructions")] public string Instructions { get; set; }
    [Column("tapering_schedule")] public string? TaperingSchedule { get; set; } // JSON
    // ... standard audit fields
}
```

**8. API Endpoints (8 endpoints)**
- `GET /api/prescriptions?patientId={id}` - Patient prescription history
- `GET /api/prescriptions/{id}` - Single prescription detail
- `POST /api/prescriptions` - Create new prescription
- `PUT /api/prescriptions/{id}` - Update prescription
- `POST /api/prescriptions/{id}/discontinue` - Mark discontinued
- `POST /api/prescriptions/{id}/refill` - Refill request
- `GET /api/medications?search={query}` - Medication search/autocomplete
- `POST /api/prescriptions/check-interactions` - Drug interaction check

---

### Module 2: Laboratory Orders & Results (Week 1-2, 3 days)

#### Frontend Components (~1,800 lines)

**9. LabOrderCreator.tsx** (~800 lines)
- **Location:** `apps/hospital-portal-web/src/components/lab/LabOrderCreator.tsx`
- **Features:**
  - Test catalog:
    - **Blood Tests:** CBC, FBS, HbA1c, Lipid Profile, LFT, RFT
    - **Eye-Specific:** A-scan, B-scan, Pachymetry, Keratometry
    - **Pre-Op Screening:** ECG, Chest X-ray, COVID-19 test
  - Urgency levels (Routine, Urgent, STAT)
  - Fasting requirements auto-display
  - Sample collection instructions
  - Print lab requisition form

**10. LabResultsViewer.tsx** (~1,000 lines)
- **Location:** `apps/hospital-portal-web/src/components/lab/LabResultsViewer.tsx`
- **Features:**
  - Result entry form (manual or import)
  - Normal range indicators (red if out of range)
  - Trend charts (HbA1c over time for diabetic patients)
  - Critical value alerts (auto-notify doctor)
  - PDF report generation
  - Patient portal integration (results visible after doctor approval)

#### Backend (~1,200 lines)

**11. LabTest Entity Model**
```csharp
[Table("lab_tests")]
public class LabTest
{
    [Column("id")] public Guid Id { get; set; }
    [Column("test_code")] public string TestCode { get; set; } // CBC, FBS, A-SCAN
    [Column("test_name")] public string TestName { get; set; }
    [Column("category")] public string Category { get; set; } // Hematology, Biochemistry, Imaging
    [Column("normal_range_min")] public decimal? NormalRangeMin { get; set; }
    [Column("normal_range_max")] public decimal? NormalRangeMax { get; set; }
    [Column("unit")] public string? Unit { get; set; } // mg/dL, mmHg, mm
    [Column("requires_fasting")] public bool RequiresFasting { get; set; }
    // ... standard fields
}
```

**12. LabOrder Entity Model**
```csharp
[Table("lab_orders")]
public class LabOrder
{
    [Column("id")] public Guid Id { get; set; }
    [Column("patient_id")] public Guid PatientId { get; set; }
    [Column("ordered_by_id")] public Guid OrderedById { get; set; }
    [Column("order_date")] public DateTime OrderDate { get; set; }
    [Column("urgency")] public string Urgency { get; set; } // routine, urgent, stat
    [Column("status")] public string Status { get; set; } // pending, collected, completed, cancelled
    [Column("collection_date")] public DateTime? CollectionDate { get; set; }
    [Column("result_date")] public DateTime? ResultDate { get; set; }
    // ... standard fields
}
```

**13. API Endpoints (6 endpoints)**
- `POST /api/lab-orders` - Create lab order
- `GET /api/lab-orders?patientId={id}` - Patient lab orders
- `POST /api/lab-orders/{id}/collect` - Mark sample collected
- `POST /api/lab-orders/{id}/results` - Enter results
- `GET /api/lab-orders/{id}/report` - Download PDF report
- `GET /api/lab-tests` - Available tests catalog

---

### Module 3: Pharmacy Management (Week 2, 4 days)

#### Frontend Components (~2,000 lines)

**14. PharmacyDispensing.tsx** (~1,000 lines)
- **Location:** `apps/hospital-portal-web/src/components/pharmacy/PharmacyDispensing.tsx`
- **Features:**
  - Pending prescriptions queue
  - Barcode scanning (prescription QR code)
  - Stock availability check (auto-suggest alternatives if out of stock)
  - Dispensing workflow:
    1. Scan/search prescription
    2. Verify patient identity
    3. Check stock
    4. Label generation (patient name, dosage, instructions)
    5. Counseling checklist (how to instill drops, side effects)
    6. Payment integration
    7. Mark dispensed
  - Partial dispensing (if full quantity unavailable)

**15. PharmacyInventory.tsx** (~1,000 lines)
- **Location:** `apps/hospital-portal-web/src/components/pharmacy/PharmacyInventory.tsx`
- **Features:**
  - Stock levels (current quantity, reorder level, max stock)
  - Expiry tracking (alert 90 days before expiry)
  - Batch/lot number tracking
  - Stock movements (received, dispensed, returned, expired)
  - Purchase order generation
  - Inventory valuation (FIFO/LIFO)
  - Controlled substance tracking (compliance logs)

#### Backend (~1,500 lines)

**16. PharmacyInventory Entity Model**
```csharp
[Table("pharmacy_inventory")]
public class PharmacyInventory
{
    [Column("id")] public Guid Id { get; set; }
    [Column("medication_id")] public Guid MedicationId { get; set; }
    [Column("branch_id")] public Guid BranchId { get; set; }
    [Column("batch_number")] public string BatchNumber { get; set; }
    [Column("expiry_date")] public DateTime ExpiryDate { get; set; }
    [Column("quantity_in_stock")] public decimal QuantityInStock { get; set; }
    [Column("reorder_level")] public decimal ReorderLevel { get; set; }
    [Column("unit_cost")] public decimal UnitCost { get; set; }
    [Column("selling_price")] public decimal SellingPrice { get; set; }
    // ... standard fields
}
```

**17. API Endpoints (7 endpoints)**
- `GET /api/pharmacy/inventory` - Current stock levels
- `POST /api/pharmacy/dispense` - Dispense medication
- `GET /api/pharmacy/pending-prescriptions` - Pending dispensing queue
- `POST /api/pharmacy/stock-in` - Receive stock
- `POST /api/pharmacy/stock-adjustment` - Manual adjustment
- `GET /api/pharmacy/expiry-alerts` - Expiring stock
- `GET /api/pharmacy/low-stock-alerts` - Below reorder level

---

### Module 4: Eye Imaging Integration (Week 2-3, 5 days)

#### Frontend Components (~2,500 lines)

**18. ImagingViewer.tsx** (~1,500 lines)
- **Location:** `apps/hospital-portal-web/src/components/imaging/ImagingViewer.tsx`
- **Features:**
  - DICOM viewer integration (Cornerstone.js library)
  - Side-by-side comparison (OD vs OS, current vs previous)
  - Measurement tools (disc-to-cup ratio, RNFL thickness)
  - Annotations (arrows, text, circles)
  - Zoom, pan, window/level adjustments
  - Supported modalities:
    - **OCT:** Retinal layer segmentation, thickness maps
    - **Fundus:** Diabetic retinopathy grading overlays
    - **Visual Field:** Grayscale pattern recognition
    - **Topography:** Corneal curvature maps
  - Report generation (images + interpretations)

**19. ImagingOrders.tsx** (~1,000 lines)
- **Location:** `apps/hospital-portal-web/src/components/imaging/ImagingOrders.tsx`
- **Features:**
  - Order creation (select modality, urgency, laterality OD/OS/OU)
  - Worklist for imaging technicians
  - Study status tracking (Scheduled → In Progress → Completed)
  - Auto-link to appointment
  - Study comparison tool (select 2-3 previous studies)

#### Backend (~1,800 lines)

**20. ImagingStudy Entity Model**
```csharp
[Table("imaging_studies")]
public class ImagingStudy
{
    [Column("id")] public Guid Id { get; set; }
    [Column("patient_id")] public Guid PatientId { get; set; }
    [Column("study_type")] public string StudyType { get; set; } // OCT, Fundus, VF, Topography
    [Column("laterality")] public string Laterality { get; set; } // OD, OS, OU
    [Column("study_date")] public DateTime StudyDate { get; set; }
    [Column("dicom_series_uid")] public string? DicomSeriesUid { get; set; }
    [Column("file_path")] public string FilePath { get; set; } // Azure Blob Storage URL
    [Column("interpretation")] public string? Interpretation { get; set; }
    [Column("interpreted_by_id")] public Guid? InterpretedById { get; set; }
    [Column("status")] public string Status { get; set; } // pending, completed, reported
    // ... standard fields
}
```

**21. API Endpoints (5 endpoints)**
- `POST /api/imaging/studies` - Create imaging order
- `GET /api/imaging/studies?patientId={id}` - Patient studies
- `GET /api/imaging/studies/{id}/images` - Study images (presigned URLs)
- `POST /api/imaging/studies/{id}/interpret` - Add interpretation
- `GET /api/imaging/worklist` - Technician worklist

---

### Module 5: Clinical Decision Support (Week 3, 2 days)

#### Frontend Components (~800 lines)

**22. DrugAllergyChecker.tsx** (~400 lines)
- **Location:** `apps/hospital-portal-web/src/components/clinical-decision/DrugAllergyChecker.tsx`
- **Features:**
  - Auto-check allergies before prescribing
  - Alert: "⚠️ Patient allergic to Penicillin. Suggested alternative: Azithromycin"
  - Cross-reactivity warnings (e.g., "Sulfa allergy may react with Dorzolamide")

**23. ContraindicationAlerts.tsx** (~400 lines)
- **Features:**
  - Disease-specific contraindications
  - Examples:
    - Pilocarpine → Contraindicated if: Uveitis, Iritis, Retinal detachment risk
    - Beta-blockers (Timolol) → Contraindicated if: Asthma, COPD, Heart block
    - Atropine → Contraindicated if: Narrow angles
  - Auto-check patient diagnosis + medication history
  - Override option with mandatory reason (logged in audit trail)

---

## 🗄️ Database Schema Summary

### New Tables (8 tables):
1. `medications` (200+ eye medications)
2. `prescriptions` (prescription header)
3. `prescription_items` (individual medications)
4. `lab_tests` (test catalog)
5. `lab_orders` (order header)
6. `lab_order_items` (individual tests)
7. `pharmacy_inventory` (stock management)
8. `imaging_studies` (DICOM metadata)

### Schema Compliance:
- ✅ UUID primary keys
- ✅ Tenant foreign key (`tenant_id`)
- ✅ Standard audit columns
- ✅ RLS policies
- ✅ Soft delete support

---

## 📊 Phase 3 Implementation Metrics

| Component | Files | Lines | Completion |
|-----------|-------|-------|------------|
| Frontend Components | 13 | ~10,000 | 0% |
| Backend Models | 8 | ~1,200 | 0% |
| Backend Services | 5 | ~3,000 | 0% |
| Backend Controllers | 5 | ~2,000 | 0% |
| Database Migration | 1 | ~600 | 0% |
| **Total** | **32 files** | **~16,800 lines** | **0%** |

---

## 🧪 Testing Scenarios

### Prescriptions:
1. Create prescription with 3 medications (Latanoprost, Timolol, Prednisolone)
2. Check drug interactions → Alert: "Administer drops 5 minutes apart"
3. Add patient allergy to Sulfa → Alert when prescribing Dorzolamide
4. Create tapering schedule for Prednisolone (4x daily → taper to 1x over 4 weeks)
5. Patient requests refill → Verify refills remaining > 0
6. E-sign prescription → Base64 signature stored
7. Print prescription → PDF with QR code

### Lab Orders:
1. Order pre-op blood tests (CBC, FBS, ECG)
2. Order A-scan for IOL calculation
3. Enter results → HbA1c = 9.5% (above normal) → Red flag
4. Doctor views trend chart → Increasing HbA1c over 6 months
5. Critical value (e.g., K+ 6.5 mEq/L) → Auto-notify doctor via SMS

### Pharmacy:
1. Scan prescription QR code → Auto-load prescription
2. Check stock → Latanoprost in stock (50 bottles), expiry 6 months
3. Dispense 1 bottle → Stock reduces to 49
4. Print medication label with instructions
5. Counseling checklist → Technician confirms drop instillation technique explained
6. Low stock alert → Timolol below reorder level (5 bottles) → Generate PO

### Imaging:
1. Order OCT scan for glaucoma patient (OU)
2. Imaging tech sees worklist → Perform scan
3. Upload DICOM images to Azure Blob Storage
4. Doctor views images in DICOM viewer
5. Measure RNFL thickness → 65 μm (thinning detected)
6. Add interpretation → "RNFL thinning consistent with glaucoma progression"

---

## 🔗 Integration Points

### Connects to Existing:
- **Phase 1 Examination Modules:** Auto-fill prescriptions from exam findings
- **Phase 2 Appointments:** Link prescriptions to appointments
- **Phase 2 Follow-ups:** Lab results trigger follow-up scheduling
- **Pharmacy:** Prescription dispensing updates adherence tracking

### External Integrations:
- **DICOM Server:** Orthanc PACS for imaging storage
- **Drug Database:** RxNorm API for medication info
- **Lab Interface:** HL7 messages for automated result import
- **Payment Gateway:** Razorpay/Stripe for pharmacy billing

---

## 🚀 Quick Start (Week-by-Week)

### Week 1 (Days 1-6): Prescriptions + Lab Orders
**Monday-Wednesday:** Prescriptions Module
- Build PrescriptionCreator, MedicationDatabase, DrugInteractionChecker
- Implement backend (Prescription, PrescriptionItem models)
- Test drug interactions, contraindications, e-signatures

**Thursday-Saturday:** Lab Orders
- Build LabOrderCreator, LabResultsViewer
- Implement backend (LabOrder, LabTest models)
- Test result entry, critical value alerts, PDF reports

### Week 2 (Days 7-11): Pharmacy + Imaging Start
**Monday-Thursday:** Pharmacy Management
- Build PharmacyDispensing, PharmacyInventory
- Implement stock management (FIFO, expiry tracking)
- Test dispensing workflow, low stock alerts

**Friday:** Imaging Orders
- Build ImagingOrders component
- Implement ImagingStudy model
- Test order creation, worklist

### Week 3 (Days 12-16): Imaging Viewer + Clinical Decision Support
**Monday-Wednesday:** DICOM Viewer
- Integrate Cornerstone.js
- Build measurement tools, annotations
- Test side-by-side comparison

**Thursday-Friday:** Clinical Decision Support
- Build DrugAllergyChecker, ContraindicationAlerts
- Test allergy cross-checking, override logging

**Saturday (Day 16):** Integration Testing
- End-to-end workflow: Examination → Prescription → Lab Orders → Pharmacy → Imaging
- Performance testing (load 1000 prescriptions)
- Security testing (tenant isolation, permission checks)

---

## ✅ Definition of Done

Phase 3 complete when:
- [ ] 200+ eye medications in database with interactions
- [ ] Prescription creation with e-signature working
- [ ] Drug allergy/contraindication alerts functional
- [ ] Lab orders created and results entered
- [ ] Pharmacy dispensing reduces stock levels
- [ ] Expiry alerts working (90-day threshold)
- [ ] DICOM viewer displays OCT/Fundus images
- [ ] All 26 API endpoints tested via Swagger
- [ ] Frontend integrated with real backend APIs
- [ ] Zero critical bugs in QA testing

---

**Phase 3 Readiness:** ✅ Ready to start immediately  
**Estimated Completion:** February 15, 2026 (18 days from Jan 28)

