# Module 30: Patient Directory Hub - Sequential Implementation Plan

**Document Created:** February 6, 2026  
**Last Updated:** February 6, 2026 (Cross-Verification & Priority Adjustments)  
**Module Status:** 35% Complete (Enhancement Plan)  
**Estimated Timeline:** 4-6 weeks (if working exclusively on Module 30)

**📋 IMPORTANT:** Complete detailed FE/BE/DB implementation plan now available:  
**See:** [PATIENT_DIRECTORY_IMPLEMENTATION_PLAN.md](PATIENT_DIRECTORY_IMPLEMENTATION_PLAN.md)

---

## 🔗 **QUICK NAVIGATION**

- **Gap Analysis:** [MODULE_30_GAP_ANALYSIS.md](MODULE_30_GAP_ANALYSIS.md) - Current state analysis  
- **Implementation Plan:** [PATIENT_DIRECTORY_IMPLEMENTATION_PLAN.md](PATIENT_DIRECTORY_IMPLEMENTATION_PLAN.md) ⭐ **START HERE**  
- **40 Module Structure:** [COMPLETE_40_MODULE_STRUCTURE.md](COMPLETE_40_MODULE_STRUCTURE.md) - Hospital-wide architecture

---

## 🔍 **CROSS-VERIFICATION UPDATES (Feb 6, 2026)**

### ✅ **Navigation Setup - VERIFIED & OPTIMAL**
- **Location:** `apps/hospital-portal-web/src/components/Sidebar.tsx` (Line 136-137)
- **Route:** `/dashboard/patients` → PatientDirectoryHub component
- **Placement:** Patient Management section (2nd major section)
- **Assessment:** ✅ **No changes needed** - Matches Epic/Cerner/Meditech best practices
- **See:** MODULE_30_GAP_ANALYSIS.md § 1️⃣ Navigation Setup for full analysis

### 🔴 **CRITICAL: Duplicate Prevention NOT IMPLEMENTED**
- **Status:** ❌ Missing (high risk for billing errors, HIPAA violations)
- **Evidence:** 
  - No UNIQUE constraint on `medical_record_number` in database
  - No duplicate checking in `PatientsController.cs` CreatePatient method (Line 79)
  - BranchService HAS duplicate prevention, but PatientsController does NOT
- **Priority Change:** **MOVED FROM WEEK 6 TO WEEK 1 (Day 1-2)**
- **See:** MODULE_30_GAP_ANALYSIS.md § 2️⃣ Duplicate Prevention for implementation details

### 📊 **UX Best Practices Analysis Complete**
- **Search-First Approach:** ✅ Current implementation correct
- **Quick Actions:** Need to expand from 2 to 9 actions (see gap analysis)
- **Tab Organization:** Recommend frequency-based ordering (hot/warm/cold zones)
- **Visual Indicators:** Add status dots (checked in, allergy alerts, etc.)
- **Keyboard Shortcuts:** Not implemented (see gap analysis for recommended shortcuts)
- **See:** MODULE_30_GAP_ANALYSIS.md § 3️⃣ UX Best Practices for full recommendations

---

## 📋 **EXECUTIVE SUMMARY**

### Current State
- ✅ **Backend:** 90% complete (missing vitals, consents, communications APIs)
- 🔄 **Frontend Hub:** 60% complete (basic search, list, details working)
- 🔄 **Frontend Modal:** 35% complete (14/20+ tabs, mostly mock data)
- ❌ **Data Integrity:** Duplicate prevention MISSING 🔴 **CRITICAL**

### Goals
1. **🔴 CRITICAL:** Implement duplicate patient prevention (MOVED TO WEEK 1)
2. Replace ALL mock data with real API integration
3. Add 6+ missing tabs (Timeline, Vitals, Diagnoses, Allergies, Procedures, Communications, Consents, Referrals)
4. Enhance search with advanced filters
5. Add patient comparison, export, and merge features

### Approach
**Enhancement over rebuild** - leverage existing 596-line PatientDirectoryHub and 2193-line PatientDetailsModal components instead of starting from scratch.

---

## 🎯 **PHASE 1: CRITICAL FIXES & API VERIFICATION (Week 1-2)** 🔴

### **Week 1: CRITICAL - Duplicate Prevention + Backend API Verification**

#### **Day 1-2: 🔴 CRITICAL - Implement Duplicate Patient Prevention** 🔨
**Objective:** Prevent duplicate patient records (HIPAA compliance, data integrity)

**Priority:** 🔴 **CRITICAL** (moved from Week 6 due to cross-verification findings)

**Database Schema Changes:**
```sql
-- 1. Add unique constraint on medical_record_number within tenant
CREATE UNIQUE INDEX idx_patients_mrn_unique 
ON patients(tenant_id, medical_record_number) 
WHERE deleted_at IS NULL;

-- 2. Add index for duplicate detection queries (name + DOB)
CREATE INDEX idx_patients_duplicate_check 
ON patients(tenant_id, first_name, last_name, date_of_birth) 
WHERE deleted_at IS NULL;

-- 3. Add index for phone number duplicate check
CREATE INDEX idx_patients_phone_duplicate_check 
ON patients(tenant_id, contact_number) 
WHERE deleted_at IS NULL AND contact_number IS NOT NULL;
```

**Backend Implementation:**
1. **Create `Services/PatientDuplicateDetectionService.cs`** (~200 lines)
   ```csharp
   public interface IPatientDuplicateDetectionService
   {
       Task<DuplicateCheckResult> CheckDuplicatesAsync(
           string firstName, 
           string lastName, 
           DateTime dateOfBirth, 
           string? contactNumber, 
           Guid tenantId
       );
   }

   public class DuplicateCheckResult
   {
       public bool IsDuplicate { get; set; }
       public string Message { get; set; } = "";
       public List<PatientDuplicateMatch> Matches { get; set; } = new();
   }

   public class PatientDuplicateMatch
   {
       public Guid Id { get; set; }
       public string MedicalRecordNumber { get; set; } = "";
       public string Name { get; set; } = "";
       public DateTime DateOfBirth { get; set; }
       public string? ContactNumber { get; set; }
       public string MatchType { get; set; } = ""; // "ExactNameDOB", "SamePhone", "SimilarName"
       public decimal MatchConfidence { get; set; } // 0.0 - 1.0
   }
   ```

2. **Duplicate Detection Logic** (3 levels):
   ```csharp
   // Level 1: Exact match (first name + last name + DOB)
   var exactMatches = await _context.Patients
       .Where(p => p.TenantId == tenantId && p.DeletedAt == null)
       .Where(p => 
           p.FirstName.ToLower() == firstName.ToLower() &&
           p.LastName.ToLower() == lastName.ToLower() &&
           p.DateOfBirth.Date == dateOfBirth.Date
       )
       .ToListAsync();

   // Level 2: Phone number match
   if (!string.IsNullOrWhiteSpace(contactNumber))
   {
       var phoneMatches = await _context.Patients
           .Where(p => p.TenantId == tenantId && p.DeletedAt == null)
           .Where(p => p.ContactNumber == contactNumber)
           .ToListAsync();
   }

   // Level 3: Fuzzy match (Levenshtein distance < 3 on full name + same DOB)
   // Use for typo detection (e.g., "John Smith" vs "Jon Smith")
   var fuzzyMatches = await _context.Patients
       .Where(p => p.TenantId == tenantId && p.DeletedAt == null)
       .Where(p => p.DateOfBirth.Date == dateOfBirth.Date)
       .ToListAsync()
       .Where(p => LevenshteinDistance(
           p.FirstName + p.LastName, 
           firstName + lastName
       ) < 3)
       .ToList();
   ```

3. **Update `PatientsController.cs` CreatePatient method:**
   ```csharp
   [HttpPost]
   [RequirePermission("patient.create")]
   public async Task<ActionResult<PatientResponse>> CreatePatient([FromBody] CreatePatientRequest request)
   {
       var tenantId = User.FindFirst("TenantId")?.Value;
       if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

       // ✅ NEW: Check for duplicates BEFORE creating patient
       var duplicateCheck = await _duplicateDetectionService.CheckDuplicatesAsync(
           request.FirstName,
           request.LastName,
           request.DateOfBirth,
           request.ContactNumber,
           Guid.Parse(tenantId)
       );

       if (duplicateCheck.IsDuplicate && duplicateCheck.Matches.Any(m => m.MatchConfidence > 0.8))
       {
           return BadRequest(new {
               error = "Possible duplicate patient detected",
               message = duplicateCheck.Message,
               matches = duplicateCheck.Matches
           });
       }

       // Continue with patient creation...
       var patient = new Patient { /* ... */ };
       var createdPatient = await _patientService.CreatePatientAsync(patient);
       return CreatedAtAction(nameof(GetPatient), new { id = createdPatient.Id }, MapToResponse(createdPatient));
   }
   ```

4. **Add duplicate check endpoint:**
   ```csharp
   [HttpPost("check-duplicates")]
   [RequirePermission("patient.view")]
   public async Task<ActionResult<DuplicateCheckResult>> CheckDuplicates([FromBody] DuplicateCheckRequest request)
   {
       var tenantId = User.FindFirst("TenantId")?.Value;
       if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

       var result = await _duplicateDetectionService.CheckDuplicatesAsync(
           request.FirstName,
           request.LastName,
           request.DateOfBirth,
           request.ContactNumber,
           Guid.Parse(tenantId)
       );

       return Ok(result);
   }
   ```

**Frontend Implementation:**
1. **Update `PatientFormModal.tsx`** (add duplicate check before submit)
   ```typescript
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();

     // ✅ NEW: Check for duplicates BEFORE submission
     try {
       const duplicateCheck = await api.post('/patients/check-duplicates', {
         firstName: formData.firstName,
         lastName: formData.lastName,
         dateOfBirth: formData.dateOfBirth,
         contactNumber: formData.contactNumber
       });

       if (duplicateCheck.data.isDuplicate && duplicateCheck.data.matches.length > 0) {
         // Show confirmation dialog with possible duplicates
         const confirmed = await showDuplicateConfirmation(duplicateCheck.data.matches);
         if (!confirmed) {
           return; // User cancelled
         }
       }

       // Continue with patient creation...
       const response = await patientApi.create(formData);
       // ...
     } catch (error) {
       setError(error.response?.data?.message || 'Failed to create patient');
     }
   };
   ```

2. **Create `DuplicatePatientWarningDialog.tsx`** (~150 lines)
   - Show list of potential duplicates
   - Allow user to select existing patient OR create new anyway
   - Display match confidence percentage

**Testing:**
1. Test exact match (same name + DOB)
2. Test phone number match
3. Test fuzzy match (typo detection)
4. Test unique constraint on MRN
5. Test frontend duplicate warning dialog

**Deliverables:**
- ✅ Database indexes created
- ✅ PatientDuplicateDetectionService implemented
- ✅ PatientsController updated with duplicate checking
- ✅ Frontend duplicate warning dialog
- ✅ Unit tests (5 test cases)

**Estimated Time:** 2 days (16 hours)

---

#### **Day 3-4: Verify Existing Backend APIs** ✅
**Objective:** Confirm which backend APIs exist and are functional

**Tasks:**
1. ✅ **VERIFIED - Patients API** (7 endpoints in `PatientsController.cs`)
   - GET /api/patients - List all patients ✅
   - GET /api/patients/search - Multi-field search ✅
   - GET /api/patients/{id} - Get patient details ✅
   - POST /api/patients - Create patient ✅
   - PUT /api/patients/{id} - Update patient ✅
   - DELETE /api/patients/{id} - Soft delete ✅
   - POST /api/patients/{id}/photo - Upload photo ✅

2. ✅ **VERIFIED - Appointments API** (`AppointmentsController.cs`)
   - Full CRUD endpoints exist
   - No verification needed (already confirmed in gap analysis)

3. ✅ **VERIFIED - Visits/Examinations API** (`VisitsController.cs`, `ExaminationsController.cs`)
   - GET /api/visits, GET /api/examinations
   - GET /api/examinations/patient/{patientId}
   - Full CRUD endpoints exist

4. ✅ **VERIFIED - Prescriptions API** (`PrescriptionsController.cs`)
   - Full CRUD endpoints exist
   - No verification needed

5. ✅ **VERIFIED - Imaging API** (`OctImagingController.cs`)
   - OCT imaging (eye hospital specific)
   - Full CRUD endpoints exist

6. ✅ **VERIFIED - Billing API** (`BillItemsController.cs`)
   - GET /api/billitems/bill/{billId} - Get all items for a bill ✅
   - GET /api/billitems/{id} - Get bill item by ID ✅
   - POST /api/billitems - Add item to bill ✅
   - PUT /api/billitems/{id} - Update bill item ✅
   - DELETE /api/billitems/{id} - Remove bill item ✅

7. ✅ **VERIFIED - Documents API** (`PatientDocumentUpload` model exists)
   - `PatientDocumentUpload.cs` domain model exists
   - Backend schema: `patient_document_uploads` table exists
   - **NEED TO VERIFY:** Controller endpoints (likely exists, need to search for `DocumentsController` or `PatientDocumentsController`)

8. ❌ **MISSING - Lab Reports API**
   - Lab test catalog might exist (based on sequential plan docs)
   - Lab order/results management needs verification
   - **ACTION:** Search for `LabOrdersController`, `LabTestsController`, `LabResultsController`

**Deliverables:**
- ✅ API verification checklist (completed above)
- 🔄 List of missing APIs to create (lab reports, vitals, consents, communications, referrals)

---

#### **Day 3-4: Create Missing Backend APIs - Part 1 (Vitals)** 🔨

**Objective:** Create Vitals API for tracking vital signs over time

**Database Schema** (if not exists):
```sql
CREATE TABLE IF NOT EXISTS vitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id),
    visit_id UUID REFERENCES visits(id), -- Optional: link to visit
    
    -- Vital sign measurements
    systolic_bp INTEGER, -- mmHg
    diastolic_bp INTEGER, -- mmHg
    pulse_rate INTEGER, -- bpm
    temperature DECIMAL(4,1), -- Celsius
    weight DECIMAL(5,2), -- kg
    height DECIMAL(5,2), -- cm
    bmi DECIMAL(4,1), -- calculated
    respiratory_rate INTEGER, -- breaths/min
    spo2 INTEGER, -- oxygen saturation %
    
    -- Additional measurements (eye hospital specific)
    intraocular_pressure_od INTEGER, -- IOP right eye (mmHg)
    intraocular_pressure_os INTEGER, -- IOP left eye (mmHg)
    
    -- Metadata
    measured_by_user_id UUID NOT NULL,
    measured_at TIMESTAMP NOT NULL DEFAULT NOW(),
    notes TEXT,
    
    -- Standard audit columns
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP,
    
    FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (measured_by_user_id) REFERENCES AspNetUsers(id)
);

CREATE INDEX idx_vitals_patient ON vitals(patient_id, measured_at DESC);
CREATE INDEX idx_vitals_tenant ON vitals(tenant_id);
```

**Backend Files to Create:**

1. **`Models/Domain/Vitals.cs`** (~100 lines)
```csharp
[Table("vitals")]
public class Vitals
{
    [Column("id")]
    public Guid Id { get; set; }
    
    [Column("tenant_id")]
    public required Guid TenantId { get; set; }
    
    [Column("patient_id")]
    public required Guid PatientId { get; set; }
    
    [Column("visit_id")]
    public Guid? VisitId { get; set; }
    
    // Vital measurements (map all columns)
    [Column("systolic_bp")]
    public int? SystolicBp { get; set; }
    
    [Column("diastolic_bp")]
    public int? DiastolicBp { get; set; }
    
    [Column("pulse_rate")]
    public int? PulseRate { get; set; }
    
    [Column("temperature")]
    public decimal? Temperature { get; set; }
    
    [Column("weight")]
    public decimal? Weight { get; set; }
    
    [Column("height")]
    public decimal? Height { get; set; }
    
    [Column("bmi")]
    public decimal? Bmi { get; set; }
    
    [Column("respiratory_rate")]
    public int? RespiratoryRate { get; set; }
    
    [Column("spo2")]
    public int? Spo2 { get; set; }
    
    [Column("intraocular_pressure_od")]
    public int? IntraocularPressureOd { get; set; }
    
    [Column("intraocular_pressure_os")]
    public int? IntraocularPressureOs { get; set; }
    
    [Column("measured_by_user_id")]
    public required Guid MeasuredByUserId { get; set; }
    
    [Column("measured_at")]
    public DateTime MeasuredAt { get; set; } = DateTime.UtcNow;
    
    [Column("notes")]
    public string? Notes { get; set; }
    
    // Navigation properties
    public virtual Patient? Patient { get; set; }
    public virtual AppUser? MeasuredBy { get; set; }
}
```

2. **`Models/Domain/Dtos/VitalsDtos.cs`** (~80 lines)
```csharp
public class CreateVitalsRequest
{
    [Required]
    public Guid PatientId { get; set; }
    public Guid? VisitId { get; set; }
    
    public int? SystolicBp { get; set; }
    public int? DiastolicBp { get; set; }
    public int? PulseRate { get; set; }
    public decimal? Temperature { get; set; }
    public decimal? Weight { get; set; }
    public decimal? Height { get; set; }
    // ... (all vital fields)
    public string? Notes { get; set; }
}

public class UpdateVitalsRequest : CreateVitalsRequest
{
    [Required]
    public Guid Id { get; set; }
}

public class VitalsResponse
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string PatientName { get; set; } = null!;
    public DateTime MeasuredAt { get; set; }
    public string MeasuredByName { get; set; } = null!;
    
    // All vital measurements
    public int? SystolicBp { get; set; }
    public int? DiastolicBp { get; set; }
    // ... (all fields)
    public string? Notes { get; set; }
}
```

3. **`Services/Interfaces/IVitalsService.cs`** (~20 lines)
```csharp
public interface IVitalsService
{
    Task<List<VitalsResponse>> GetPatientVitalsAsync(Guid patientId, Guid tenantId);
    Task<VitalsResponse?> GetVitalsById Async(Guid id, Guid tenantId);
    Task<VitalsResponse> CreateVitalsAsync(CreateVitalsRequest request, Guid tenantId, Guid userId);
    Task<VitalsResponse?> UpdateVitalsAsync(Guid id, UpdateVitalsRequest request, Guid tenantId, Guid userId);
    Task<bool> DeleteVitalsAsync(Guid id, Guid tenantId);
}
```

4. **`Services/VitalsService.cs`** (~200 lines)
```csharp
public class VitalsService : IVitalsService
{
    private readonly AppDbContext _context;
    private readonly ILogger<VitalsService> _logger;
    
    // Implement all methods with:
    // - Tenant filtering
    // - BMI auto-calculation (if weight + height provided)
    // - Include Patient, MeasuredBy navigation
    // - Order by measured_at DESC
}
```

5. **`Controllers/VitalsController.cs`** (~250 lines)
```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VitalsController : ControllerBase
{
    [HttpGet("patient/{patientId}")]
    [RequirePermission("vitals.view")]
    public async Task<ActionResult<List<VitalsResponse>>> GetPatientVitals(Guid patientId)
    
    [HttpGet("{id}")]
    [RequirePermission("vitals.view")]
    public async Task<ActionResult<VitalsResponse>> GetById(Guid id)
    
    [HttpPost]
    [RequirePermission("vitals.create")]
    public async Task<ActionResult<VitalsResponse>> Create([FromBody] CreateVitalsRequest request)
    
    [HttpPut("{id}")]
    [RequirePermission("vitals.update")]
    public async Task<ActionResult<VitalsResponse>> Update(Guid id, [FromBody] UpdateVitalsRequest request)
    
    [HttpDelete("{id}")]
    [RequirePermission("vitals.delete")]
    public async Task<ActionResult> Delete(Guid id)
}
```

6. **Register in `Program.cs`**
```csharp
builder.Services.AddScoped<IVitalsService, VitalsService>();
```

7. **Add to `AppDbContext.cs`**
```csharp
public DbSet<Vitals> Vitals { get; set; }

protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Vitals>(entity => {
        entity.ToTable("vitals");
        entity.Property(e => e.Id).HasColumnName("id");
        // ... (map all columns)
    });
}
```

**Deliverables:**
- ✅ Vitals API with 5 endpoints (GET patient vitals, GET by ID, POST create, PUT update, DELETE)
- ✅ Vitals database table with migration
- ✅ Service registered and tested

---

#### **Day 5: Create Missing Backend APIs - Part 2 (Lab Reports)** 🔨

**Objective:** Verify if Lab Reports API exists, create if missing

**Investigation Tasks:**
1. Search for `LabOrdersController`, `LabTestsController`, `LabResultsController`
2. Check database for `lab_orders`, `lab_tests`, `lab_results` tables
3. If missing, create full lab reports infrastructure

**IF LAB API EXISTS:**
- Document endpoints
- Verify data structure matches `LabReport` interface in frontend
- Test endpoints with Swagger

**IF LAB API MISSING - Create:**

**Database Schema:**
```sql
CREATE TABLE lab_test_catalog (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    test_code VARCHAR(50) UNIQUE NOT NULL,
    test_name VARCHAR(200) NOT NULL,
    category VARCHAR(100), -- Blood, Urine, Imaging, etc.
    description TEXT,
    normal_range VARCHAR(200),
    unit VARCHAR(50),
    specimen_type VARCHAR(100),
    preparation_instructions TEXT,
    processing_time_hours INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE lab_orders (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    visit_id UUID,
    ordered_by_user_id UUID NOT NULL,
    ordered_at TIMESTAMP DEFAULT NOW(),
    urgency VARCHAR(20), -- routine, urgent, stat
    clinical_indication TEXT,
    status VARCHAR(50), -- ordered, sample_collected, in_progress, completed, cancelled
    sample_collected_at TIMESTAMP,
    completed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE lab_order_items (
    id UUID PRIMARY KEY,
    lab_order_id UUID NOT NULL REFERENCES lab_orders(id),
    lab_test_id UUID NOT NULL REFERENCES lab_test_catalog(id),
    status VARCHAR(50),
    result_value VARCHAR(500),
    result_unit VARCHAR(50),
    result_status VARCHAR(20), -- normal, high, low, critical
    result_entered_by_user_id UUID,
    result_entered_at TIMESTAMP,
    notes TEXT
);
```

**Backend Files:**
- `Models/Domain/LabTestCatalog.cs`
- `Models/Domain/LabOrder.cs`
- `Models/Domain/LabOrderItem.cs`
- `Models/Domain/Dtos/LabOrderDtos.cs`
- `Services/Interfaces/ILabOrderService.cs`
- `Services/LabOrderService.cs`
- `Controllers/LabOrdersController.cs`

**Endpoints to Create:**
- `GET /api/lab-orders/patient/{patientId}` - Get patient lab history
- `GET /api/lab-orders/{id}` - Get lab order details with items
- `POST /api/lab-orders` - Create lab order
- `PUT /api/lab-orders/{id}/items/{itemId}/result` - Enter test result
- `GET /api/lab-test-catalog` - Get available tests

**Deliverables:**
- ✅ Lab Reports API (if missing) OR verification documentation (if exists)
- ✅ Tested with Swagger

---

### **Week 2: Connect Frontend Tabs to Real Backend APIs**

#### **Day 6-7: Replace Mock Data in Existing Tabs - Part 1** 🔌

**Objective:** Connect Visits, Appointments, Examinations tabs to real APIs

**Files to Modify:**
1. **`apps/hospital-portal-web/src/lib/api.ts`** (if missing API functions)
   - Add `visitsApi` if not exists
   - Verify `appointmentsApi` exists (should already be there)
   - Verify `examinationApi` exists (should already be there)

2. **`PatientDetailsModal.tsx` - Visits Tab** (lines ~560-700)
   - **Current:** Mock data (15 visits)
   - **Change:**
```tsx
// BEFORE (Mock):
const mockVisits = [
  { date: '2026-01-28', type: 'Follow-up', doctor: 'Dr. Smith', ... },
  // ... 14 more
];

// AFTER (Real API):
const [visits, setVisits] = useState<Visit[]>([]);
const [loadingVisits, setLoadingVisits] = useState(false);

useEffect(() => {
  if (activeTab === 'visits' && patient?.id) {
    loadVisits();
  }
}, [activeTab, patient?.id]);

const loadVisits = async () => {
  setLoadingVisits(true);
  try {
    const response = await visitsApi.getByPatient(patient.id);
    setVisits(response.data);
  } catch (error) {
    console.error('Failed to load visits:', error);
  } finally {
    setLoadingVisits(false);
  }
};

// Render: Show loading skeleton, handle empty state
{loadingVisits ? (
  <div>Loading visits...</div>
) : visits.length === 0 ? (
  <div>No visits recorded</div>
) : (
  visits.map(visit => ...)
)}
```

3. **`PatientDetailsModal.tsx` - Appointments Tab** (lines ~700-850)
   - **Current:** Mock upcoming appointments
   - **Change:** Connect to `appointmentsApi.getByPatient(patientId)`
   - Handle loading state
   - Handle empty state

4. **`PatientDetailsModal.tsx` - Examinations Tab** (lines ~1100-1300)
   - **Current:** Mock exam data
   - **Change:** Connect to `examinationApi.getByPatient(patientId)` (ALREADY EXISTS)
   - This API is already being called in `loadPatientData()` at line ~115
   - Just need to render `examinations` state in the tab instead of mock data

**Deliverables:**
- ✅ Visits tab showing real data from VisitsController
- ✅ Appointments tab showing real data from AppointmentsController
- ✅ Examinations tab showing real data from ExaminationsController
- ✅ Loading states for all tabs
- ✅ Empty states with helpful messages

**Estimated LOC Changes:** ~150-200 lines (replacing mock arrays with API calls + loading/empty states)

---

#### **Day 8-9: Replace Mock Data in Existing Tabs - Part 2** 🔌

**Objective:** Connect Prescriptions, Lab Reports, Billing tabs to real APIs

**Files to Modify:**

1. **`PatientDetailsModal.tsx` - Prescriptions Tab** (lines ~1600-1750)
   - **Current:** Mock pharmacy data
   - **Change:** Connect to `prescriptionsApi` (need to verify if `getByPatient` method exists)
   - **Add to `api.ts` if missing:**
```typescript
export const prescriptionsApi = {
  getAll: () => getApi().get('/prescriptions'),
  getByPatient: (patientId: string) => getApi().get(`/prescriptions/patient/${patientId}`),
  getById: (id: string) => getApi().get(`/prescriptions/${id}`),
  create: (data: any) => getApi().post('/prescriptions', data),
  update: (id: string, data: any) => getApi().put(`/prescriptions/${id}`, data),
  delete: (id: string) => getApi().delete(`/prescriptions/${id}`)
};
```

2. **`PatientDetailsModal.tsx` - Lab Reports Tab** (lines ~1300-1600)
   - **Current:** Sophisticated mock `LabReport[]` array (6 tests with results)
   - **Change:** Connect to lab orders API (created in Day 5)
   - **Add to `api.ts`:**
```typescript
export const labOrdersApi = {
  getByPatient: (patientId: string) => getApi().get(`/lab-orders/patient/${patientId}`),
  getById: (id: string) => getApi().get(`/lab-orders/${id}`),
  create: (data: any) => getApi().post('/lab-orders', data),
  updateResult: (orderId: string, itemId: string, result: any) => 
    getApi().put(`/lab-orders/${orderId}/items/${itemId}/result`, result)
};
```

3. **`PatientDetailsModal.tsx` - Billing Tab** (lines ~850-1000)
   - **Current:** Mock billing data
   - **Change:** Connect to billing API (BillItemsController verified existing)
   - **Add to `api.ts`:**
```typescript
export const billingApi = {
  getBillsByPatient: (patientId: string) => getApi().get(`/bills/patient/${patientId}`),
  getBillItems: (billId: string) => getApi().get(`/billitems/bill/${billId}`),
  createBill: (data: any) => getApi().post('/bills', data),
  addBillItem: (data: any) => getApi().post('/billitems', data)
};
```
   - **Note:** Need to verify if `/api/bills` endpoint exists (only `BillItemsController` confirmed, might need `BillsController`)

**Deliverables:**
- ✅ Prescriptions tab showing real prescriptions from backend
- ✅ Lab Reports tab showing real lab orders + results
- ✅ Billing tab showing real invoices/bills (if API exists)
- ✅ All tabs with loading + empty states

**Estimated LOC Changes:** ~200-250 lines

---

#### **Day 10: Replace Mock Data in Remaining Tabs** 🔌

**Objective:** Connect Documents, Notes, Surgery, Optical, Pharmacy tabs

**Files to Modify:**

1. **`PatientDetailsModal.tsx` - Documents Tab** (lines ~1750-1850)
   - **Current:** Mock documents
   - **Change:** Connect to patient documents API
   - **Add to `api.ts`:**
```typescript
export const patientDocumentsApi = {
  getByPatient: (patientId: string) => getApi().get(`/patient-documents/${patientId}`),
  upload: (patientId: string, file: File, documentType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    return getApi().post(`/patient-documents/${patientId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (id: string) => getApi().delete(`/patient-documents/${id}`)
};
```

2. **`PatientDetailsModal.tsx` - Notes Tab** (lines ~1850-1950)
   - **Current:** Mock clinical notes timeline
   - **Change:** Clinical notes might be part of examinations API (ExaminationNotes field)
   - Could also create dedicated `ClinicalNotesController` if needed
   - For now, fetch from examinations and display `notes` field

3. **`PatientDetailsModal.tsx` - Surgery Tab** (lines ~1450-1550)
   - **Current:** Mock surgery history
   - **Change:** Connect to surgery/procedures API (need to verify if exists)
   - Might be integrated with appointments (surgery appointments)

4. **`PatientDetailsModal.tsx` - Optical Tab** (lines ~1550-1600)
   - **Current:** Mock optical prescription data
   - **Change:** Eye hospital specific - might need custom API
   - Could be part of prescriptions with type filtering

5. **`PatientDetailsModal.tsx` - Pharmacy Tab** (lines ~1600-1750)
   - **Current:** Mock medication dispensing data
   - **Change:** Pharmacy dispensing records API (need to verify)

**Deliverables:**
- ✅ Documents tab with real patient documents
- ✅ Notes tab showing examination notes
- 🔄 Surgery/Optical/Pharmacy tabs (depends on API availability)

**Estimated LOC Changes:** ~150-200 lines

---

## 🎯 **PHASE 2: ADD MISSING TABS (Week 3-4)**

### **Week 3: Create Critical Missing Tabs**

#### **Day 11-12: Create Timeline/Overview Tab** 📊

**Objective:** Aggregate all patient activity into chronological timeline

**New Component:** `apps/hospital-portal-web/src/components/patients/tabs/TimelineTab.tsx` (~400 lines)

**Data Sources to Aggregate:**
1. Appointments (from appointments API)
2. Visits (from visits API)
3. Prescriptions (from prescriptions API)
4. Lab orders (from lab orders API)
5. Documents uploaded (from documents API)
6. Vitals recorded (from vitals API)

**UI Structure:**
```tsx
export function TimelineTab({ patientId }: { patientId: string }) {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch all data in parallel
  useEffect(() => {
    loadTimeline();
  }, [patientId]);
  
  const loadTimeline = async () => {
    const [appointments, visits, prescriptions, labs, vitals] = await Promise.all([
      appointmentsApi.getByPatient(patientId),
      visitsApi.getByPatient(patientId),
      prescriptionsApi.getByPatient(patientId),
      labOrdersApi.getByPatient(patientId),
      vitalsApi.getByPatient(patientId)
    ]);
    
    // Merge and sort by date DESC
    const events = [
      ...appointments.data.map(a => ({ type: 'appointment', date: a.date, ...a })),
      ...visits.data.map(v => ({ type: 'visit', date: v.visitDate, ...v })),
      // etc.
    ].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setTimeline(events);
    setLoading(false);
  };
  
  // Render: Vertical timeline with icons
  return (
    <div className="relative border-l-2 border-gray-300 ml-4">
      {timeline.map((event, idx) => (
        <div key={idx} className="mb-8 ml-8 relative">
          {/* Timeline dot */}
          <div className="absolute -left-10 w-4 h-4 bg-blue-500 rounded-full" />
          
          {/* Event card */}
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              {event.type === 'appointment' && <Calendar className="w-5 h-5 text-green-600" />}
              {event.type === 'visit' && <Stethoscope className="w-5 h-5 text-blue-600" />}
              {/* etc. */}
              <h4 className="font-semibold">{event.title}</h4>
            </div>
            <p className="text-sm text-gray-600">{event.date}</p>
            <p className="text-sm mt-2">{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Integration into PatientDetailsModal:**
- Add Timeline tab to tabs array
- Import and render `<TimelineTab patientId={patient.id} />` when `activeTab === 'timeline'`

**Deliverables:**
- ✅ Timeline tab showing chronological patient activity
- ✅ Icons for each event type
- ✅ Filter by event type (appointments, visits, labs, etc.)

**Estimated LOC:** ~400 lines

---

#### **Day 13-14: Create Vitals Tab with Charts** 📈

**Objective:** Display vital signs over time with trend charts

**New Component:** `apps/hospital-portal-web/src/components/patients/tabs/VitalsTab.tsx` (~350 lines)

**Dependencies:**
- Install charting library: `pnpm add recharts` (or use Chart.js)

**UI Structure:**
- Last recorded vitals (card at top)
- Charts: BP (line), Pulse (line), Weight (line), BMI (line)
- Vitals history table (all recordings)
- "Record New Vitals" button

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export function VitalsTab({ patientId }: { patientId: string }) {
  const [vitals, setVitals] = useState<Vitals[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadVitals();
  }, [patientId]);
  
  const loadVitals = async () => {
    const response = await vitalsApi.getByPatient(patientId);
    setVitals(response.data);
    setLoading(false);
  };
  
  // Prepare chart data (last 10 recordings)
  const chartData = vitals.slice(0, 10).reverse().map(v => ({
    date: new Date(v.measuredAt).toLocaleDateString(),
    systolic: v.systolicBp,
    diastolic: v.diastolicBp,
    pulse: v.pulseRate,
    weight: v.weight,
    bmi: v.bmi
  }));
  
  return (
    <div className="space-y-6">
      {/* Latest Vitals Card */}
      {vitals[0] && (
        <div className="grid grid-cols-4 gap-4">
          <VitalCard label="Blood Pressure" value={`${vitals[0].systolicBp}/${vitals[0].diastolicBp}`} unit="mmHg" />
          <VitalCard label="Pulse" value={vitals[0].pulseRate} unit="bpm" />
          <VitalCard label="Weight" value={vitals[0].weight} unit="kg" />
          <VitalCard label="BMI" value={vitals[0].bmi} />
        </div>
      )}
      
      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium mb-3">Blood Pressure Trend</h4>
          <LineChart width={400} height={250} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="systolic" stroke="#ef4444" name="Systolic" />
            <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" name="Diastolic" />
          </LineChart>
        </div>
        
        {/* Weight/BMI chart */}
      </div>
      
      {/* Vitals History Table */}
      <div>
        <h4 className="font-medium mb-3">Vitals History</h4>
        <table className="min-w-full">
          <thead>
            <tr>
              <th>Date</th>
              <th>BP</th>
              <th>Pulse</th>
              <th>Temp</th>
              <th>Weight</th>
              <th>BMI</th>
              <th>Measured By</th>
            </tr>
          </thead>
          <tbody>
            {vitals.map(v => (
              <tr key={v.id}>
                <td>{new Date(v.measuredAt).toLocaleString()}</td>
                <td>{v.systolicBp}/{v.diastolicBp}</td>
                <td>{v.pulseRate}</td>
                <td>{v.temperature}</td>
                <td>{v.weight} kg</td>
                <td>{v.bmi}</td>
                <td>{v.measuredByName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

**Deliverables:**
- ✅ Vitals tab with latest vitals display
- ✅ Line charts for BP, pulse, weight, BMI trends
- ✅ Vitals history table
- ✅ "Record New Vitals" button (future enhancement)

**Estimated LOC:** ~350 lines

---

#### **Day 15: Create Diagnoses Tab** 🏥

**Objective:** List all diagnoses from patient visits (ICD-10 coded)

**New Component:** `DiagnosesTab.tsx` (~200 lines)

**Data Source:**
- Examinations API (diagnosis field in `ClinicalExamination`)
- Group by diagnosis code, show frequency
- Link back to visit/examination where diagnosis was made

**UI Structure:**
```tsx
export function DiagnosesTab({ patientId }: { patientId: string }) {
  const [examinations, setExaminations] = useState<Examination[]>([]);
  
  // Extract unique diagnoses with visit count
  const diagnoses = useMemo(() => {
    const diagnosisMap = new Map();
    examinations.forEach(exam => {
      if (exam.diagnosis) {
        const existing = diagnosisMap.get(exam.diagnosis) || { count: 0, visits: [] };
        diagnosisMap.set(exam.diagnosis, {
          count: existing.count + 1,
          visits: [...existing.visits, exam]
        });
      }
    });
    return Array.from(diagnosisMap.entries()).map(([diagnosis, data]) => ({
      diagnosis,
      count: data.count,
      visits: data.visits,
      latestDate: data.visits[data.visits.length - 1].examinationDate
    }));
  }, [examinations]);
  
  return (
    <div className="space-y-4">
      {diagnoses.map(({ diagnosis, count, visits, latestDate }) => (
        <div key={diagnosis} className="border rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-lg">{diagnosis}</h4>
              <p className="text-sm text-gray-600">
                Diagnosed {count} time{count > 1 ? 's' : ''} • Latest: {new Date(latestDate).toLocaleDateString()}
              </p>
            </div>
            <Badge>{count} visits</Badge>
          </div>
          
          {/* Expandable: List of visits with this diagnosis */}
          <div className="mt-3 space-y-2">
            {visits.map(visit => (
              <div key={visit.id} className="text-sm bg-gray-50 p-2 rounded">
                <p>{new Date(visit.examinationDate).toLocaleDateString()} - Dr. {visit.examiningDoctorName}</p>
                <p className="text-gray-600">{visit.treatmentPlan}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Deliverables:**
- ✅ Diagnoses tab showing all unique diagnoses
- ✅ Visit count per diagnosis
- ✅ Expandable to see all visits with that diagnosis

**Estimated LOC:** ~200 lines

---

### **Week 4: Create Remaining Missing Tabs**

#### **Day 16: Create Allergies Tab** ⚠️

**Objective:** Dedicated allergy management (currently in Details tab)

**New Component:** `AllergiesTab.tsx` (~200 lines)

**Data Source:**
- Patient `allergies` field (comma-separated or structured)
- Allergy history from examinations (if recorded)

**UI:**
- List of known allergies (drug, food, environmental)
- Severity indicator (mild, moderate, severe)
- Date first recorded
- Last reaction date
- "Add Allergy" button

**Integration:**
- Move allergy display from Details tab to dedicated Allergies tab
- Enhance with structured allergy data (if backend supports)

**Deliverables:**
- ✅ Allergies tab with structured allergy list
- ✅ Severity indicators
- ✅ Add/edit/delete allergy functionality (future enhancement)

**Estimated LOC:** ~200 lines

---

#### **Day 17: Create Procedures Tab** 🔪

**Objective:** Surgical and procedural history

**New Component:** `ProceduresTab.tsx` (~200 lines)

**Data Source:**
- Patient `pastSurgeries` field (current implementation)
- Surgery appointments (if appointment type = 'Surgery')
- Procedure records (if dedicated table exists)

**UI:**
- List of procedures/surgeries
- Date performed
- Surgeon name
- Outcome
- Complications (if any)

**Deliverables:**
- ✅ Procedures tab showing surgical history
- ✅ Integration with Surgery appointments

**Estimated LOC:** ~200 lines

---

#### **Day 18-19: Create Communications Tab** 📧

**Objective:** SMS, email, phone call logs

**Backend API Needed:**
- `CommunicationsController` with endpoints:
  - GET /api/communications/patient/{patientId}
  - POST /api/communications (log new communication)

**Database Schema:**
```sql
CREATE TABLE patient_communications (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    communication_type VARCHAR(50), -- sms, email, phone_call, whatsapp
    direction VARCHAR(20), -- inbound, outbound
    subject VARCHAR(200),
    message TEXT,
    sent_by_user_id UUID,
    sent_at TIMESTAMP,
    status VARCHAR(50), -- sent, delivered, failed, read
    metadata JSONB, -- email headers, SMS gateway response, etc.
    created_at TIMESTAMP
);
```

**New Component:** `CommunicationsTab.tsx` (~250 lines)

**UI:**
- Filter by communication type (SMS, Email, Phone)
- Timeline of communications
- Status indicators (sent, delivered, read)
- "Send SMS", "Send Email" buttons

**Deliverables:**
- ✅ Communications API (backend)
- ✅ Communications tab (frontend)
- ✅ Display communication history
- 🔄 Send new communication (future enhancement)

**Estimated LOC:** Backend ~200 lines, Frontend ~250 lines

---

#### **Day 20: Create Consents Tab** 📝

**Objective:** HIPAA consents, treatment consents, photo consents

**Backend API Needed:**
- `ConsentsController` with endpoints:
  - GET /api/consents/patient/{patientId}
  - POST /api/consents (record new consent)
  - PUT /api/consents/{id}/sign (e-signature)

**Database Schema:**
```sql
CREATE TABLE patient_consents (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    consent_type VARCHAR(100), -- hipaa_privacy, treatment_consent, photo_consent, surgery_consent
    consent_title VARCHAR(200),
    consent_text TEXT,
    signed_by_patient BOOLEAN DEFAULT false,
    patient_signature_url VARCHAR(500), -- e-signature or scanned image
    signed_at TIMESTAMP,
    witness_user_id UUID,
    witness_signature_url VARCHAR(500),
    expiry_date DATE,
    status VARCHAR(50), -- active, expired, revoked
    created_at TIMESTAMP
);
```

**New Component:** `ConsentsTab.tsx` (~250 lines)

**UI:**
- List of consents (HIPAA, Treatment, Photo, Surgery)
- Status: Signed, Pending, Expired
- View consent document (PDF or text)
- "Request Signature" button
- Expiry date tracking

**Deliverables:**
- ✅ Consents API (backend)
- ✅ Consents tab (frontend)
- ✅ List existing consents with status
- 🔄 E-signature collection (future enhancement)

**Estimated LOC:** Backend ~200 lines, Frontend ~250 lines

---

## 🎯 **PHASE 3: ENHANCE PATIENT DIRECTORY HUB (Week 5)**

### **Day 21-22: Add Advanced Search Filters** 🔍

**Objective:** Enhance search beyond name/MRN to include age, gender, city, diagnosis, last visit

**File to Modify:** `PatientDirectoryHub.tsx` (lines 1-100)

**Current Search:** Simple text input filtering name, MRN, phone, email

**Enhanced Search UI:**
```tsx
// Add state for advanced filters
const [filters, setFilters] = useState({
  searchQuery: '',
  ageMin: '',
  ageMax: '',
  gender: '',
  city: '',
  diagnosis: '',
  lastVisitFrom: '',
  lastVisitTo: ''
});

// Advanced Search Panel (collapsible)
<div className="p-4 border-b bg-gray-50">
  <button onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}>
    Advanced Search {showAdvancedSearch ? '▲' : '▼'}
  </button>
  
  {showAdvancedSearch && (
    <div className="grid grid-cols-3 gap-4 mt-4">
      <div>
        <label>Age Range</label>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={filters.ageMin} onChange={...} />
          <input type="number" placeholder="Max" value={filters.ageMax} onChange={...} />
        </div>
      </div>
      
      <div>
        <label>Gender</label>
        <select value={filters.gender} onChange={...}>
          <option value="">All</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
      
      <div>
        <label>City</label>
        <input placeholder="City" value={filters.city} onChange={...} />
      </div>
      
      <div>
        <label>Diagnosis</label>
        <input placeholder="Search diagnosis" value={filters.diagnosis} onChange={...} />
      </div>
      
      <div>
        <label>Last Visit</label>
        <div className="flex gap-2">
          <input type="date" value={filters.lastVisitFrom} onChange={...} />
          <input type="date" value={filters.lastVisitTo} onChange={...} />
        </div>
      </div>
      
      <div className="flex items-end">
        <button onClick={() => setFilters({ ...initialFilters })} className="text-sm text-blue-600">
          Clear Filters
        </button>
      </div>
    </div>
  )}
</div>
```

**Filtering Logic:**
```tsx
const filteredPatients = useMemo(() => {
  return patients.filter(patient => {
    // Text search (existing)
    if (filters.searchQuery && !matchesSearch(patient, filters.searchQuery)) return false;
    
    // Age filter
    const age = calculateAge(patient.dateOfBirth);
    if (filters.ageMin && age < parseInt(filters.ageMin)) return false;
    if (filters.ageMax && age > parseInt(filters.ageMax)) return false;
    
    // Gender filter
    if (filters.gender && patient.gender !== filters.gender) return false;
    
    // City filter
    if (filters.city && !patient.city?.toLowerCase().includes(filters.city.toLowerCase())) return false;
    
    // Diagnosis filter (requires fetching patient diagnoses - might need backend support)
    // Last visit filter (requires fetching visit dates - might need backend support)
    
    return true;
  });
}, [patients, filters]);
```

**Backend Enhancement (Optional):**
If filtering by diagnosis/last visit becomes slow (client-side filtering large datasets), enhance backend API:
```csharp
// PatientsController.cs - Enhance GET /api/patients
[HttpGet]
public async Task<ActionResult<List<PatientResponse>>> GetPatients(
    [FromQuery] string? searchTerm,
    [FromQuery] int? ageMin,
    [FromQuery] int? ageMax,
    [FromQuery] string? gender,
    [FromQuery] string? city,
    [FromQuery] string? diagnosis, // requires JOIN on examinations
    [FromQuery] DateTime? lastVisitFrom,
    [FromQuery] DateTime? lastVisitTo // requires JOIN on visits
)
{
    // Apply filters at database level for performance
}
```

**Deliverables:**
- ✅ Advanced search panel (collapsible)
- ✅ Client-side filtering for age, gender, city
- 🔄 Backend filtering for diagnosis, last visit (if needed for performance)

**Estimated LOC:** ~150-200 lines

---

### **Day 23: Extend Quick Actions Toolbar** ⚡

**Objective:** Add more action buttons beyond "Book Appointment" and "New Patient"

**Current Quick Actions (2 buttons):**
- Book Appointment
- New Patient

**Extended Quick Actions (8+ buttons):**
- Book Appointment ✅
- New Patient ✅
- **Upload Document** 🆕
- **Generate Report** (PDF summary) 🆕
- **Send SMS** 🆕
- **Send Email** 🆕
- **Export to CCD** (XML) 🆕
- **Mark as VIP** 🆕
- **Merge Patient** 🆕

**File to Modify:** `PatientDirectoryHub.tsx` (lines 320-350 - header section)

**Implementation:**
```tsx
<div className="flex items-center gap-3">
  {/* Existing buttons */}
  <button onClick={() => router.push('/dashboard/patients/book')} className="...">
    <CalendarPlus className="w-5 h-5" />
    Book Appointment
  </button>
  
  <button onClick={() => setShowRegistrationModal(true)} className="...">
    <User className="w-5 h-5" />
    + New Patient
  </button>
  
  {/* NEW: Upload Document */}
  <button
    onClick={() => selectedPatient && setShowUploadDialog(true)}
    disabled={!selectedPatient}
    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300"
  >
    <Upload className="w-5 h-5" />
    Upload Doc
  </button>
  
  {/* NEW: Generate Report */}
  <button
    onClick={() => selectedPatient && generatePatientReport(selectedPatient)}
    disabled={!selectedPatient}
    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300"
  >
    <FileText className="w-5 h-5" />
    Generate Report
  </button>
  
  {/* NEW: More Actions Dropdown */}
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="px-4 py-2 border rounded-lg hover:bg-gray-100">
        <MoreVertical className="w-5 h-5" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem onClick={() => sendSMS()}>
        <MessageSquare className="w-4 h-4 mr-2" />
        Send SMS
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => sendEmail()}>
        <Mail className="w-4 h-4 mr-2" />
        Send Email
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => exportToCCD()}>
        <Download className="w-4 h-4 mr-2" />
        Export to CCD (XML)
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => mergePatient()}>
        <Merge className="w-4 h-4 mr-2" />
        Merge Patient
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</div>
```

**Deliverables:**
- ✅ Upload Document quick action
- ✅ Generate Report quick action
- ✅ More Actions dropdown (SMS, Email, Export, Merge)

**Estimated LOC:** ~100 lines

---

### **Day 24-25: Patient Comparison Feature** 🔄

**Objective:** Select 2+ patients and view side-by-side comparison

**New Component:** `PatientComparisonView.tsx` (~400 lines)

**UX Flow:**
1. User selects multiple patients (checkboxes in patient list)
2. "Compare Selected" button appears
3. Opens comparison view (modal or new page)
4. Shows demographics, vitals, diagnoses, medications side-by-side

**Implementation:**

**Modify PatientDirectoryHub.tsx:**
```tsx
const [selectedPatientIds, setSelectedPatientIds] = useState<Set<string>>(new Set());
const [showComparison, setShowComparison] = useState(false);

// Add checkbox to patient list items
<input
  type="checkbox"
  checked={selectedPatientIds.has(patient.id)}
  onChange={(e) => {
    const newSet = new Set(selectedPatientIds);
    if (e.target.checked) {
      newSet.add(patient.id);
    } else {
      newSet.delete(patient.id);
    }
    setSelectedPatientIds(newSet);
  }}
/>

// Show comparison button when 2+ patients selected
{selectedPatientIds.size >= 2 && (
  <button
    onClick={() => setShowComparison(true)}
    className="fixed bottom-6 right-6 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-lg"
  >
    Compare {selectedPatientIds.size} Patients
  </button>
)}

// Comparison Modal
{showComparison && (
  <PatientComparisonView
    patientIds={Array.from(selectedPatientIds)}
    onClose={() => setShowComparison(false)}
  />
)}
```

**PatientComparisonView Component:**
```tsx
export function PatientComparisonView({ patientIds, onClose }: Props) {
  const [patients, setPatients] = useState<Patient[]>([]);
  
  useEffect(() => {
    // Fetch all selected patients
    Promise.all(patientIds.map(id => patientApi.getById(id)))
      .then(responses => setPatients(responses.map(r => r.data)));
  }, [patientIds]);
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[95%] h-[90%] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Patient Comparison</h2>
          <button onClick={onClose}><X /></button>
        </div>
        
        {/* Comparison Table */}
        <div className="flex-1 overflow-auto p-6">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-3 bg-gray-100">Field</th>
                {patients.map(p => (
                  <th key={p.id} className="text-left p-3 bg-blue-50">
                    {p.firstName} {p.lastName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <Row label="MRN" values={patients.map(p => p.medicalRecordNumber)} />
              <Row label="Age" values={patients.map(p => calculateAge(p.dateOfBirth))} />
              <Row label="Gender" values={patients.map(p => p.gender)} />
              <Row label="Blood Group" values={patients.map(p => p.bloodGroup)} />
              <Row label="Allergies" values={patients.map(p => p.allergies)} />
              <Row label="Medications" values={patients.map(p => p.currentMedications)} />
              {/* Add more comparison rows */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

**Deliverables:**
- ✅ Multi-select checkboxes in patient list
- ✅ "Compare Selected" button
- ✅ Side-by-side comparison view
- ✅ Demographics, vitals, allergies, medications comparison

**Estimated LOC:** ~400 lines

---

## 🎯 **PHASE 4: EXPORT & MERGE FEATURES (Week 6)**

### **Day 26-27: Patient Export (PDF Summary)** 📄

**Objective:** Generate comprehensive PDF summary of patient record

**Dependencies:**
- Install PDF library: `pnpm add jspdf jspdf-autotable`

**New Component:** `PatientExportDialog.tsx` (~200 lines)

**Implementation:**
```tsx
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function PatientExportDialog({ patient, onClose }: Props) {
  const [includeOptions, setIncludeOptions] = useState({
    demographics: true,
    vitals: true,
    allergies: true,
    medications: true,
    diagnoses: true,
    visits: true,
    labReports: true,
    documents: false
  });
  
  const generatePDF = async () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Patient Medical Summary', 20, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
    
    let yPos = 40;
    
    // Demographics
    if (includeOptions.demographics) {
      doc.setFontSize(14);
      doc.text('Patient Demographics', 20, yPos);
      yPos += 10;
      doc.setFontSize(10);
      doc.text(`Name: ${patient.firstName} ${patient.lastName}`, 20, yPos);
      yPos += 6;
      doc.text(`MRN: ${patient.medicalRecordNumber}`, 20, yPos);
      yPos += 6;
      doc.text(`DOB: ${patient.dateOfBirth} (${calculateAge(patient.dateOfBirth)} years)`, 20, yPos);
      yPos += 6;
      doc.text(`Gender: ${patient.gender}`, 20, yPos);
      yPos += 10;
    }
    
    // Vitals (table)
    if (includeOptions.vitals) {
      const vitals = await vitalsApi.getByPatient(patient.id);
      doc.setFontSize(14);
      doc.text('Vital Signs (Last 10 Recordings)', 20, yPos);
      yPos += 10;
      
      autoTable(doc, {
        startY: yPos,
        head: [['Date', 'BP', 'Pulse', 'Temp', 'Weight', 'BMI']],
        body: vitals.data.slice(0, 10).map(v => [
          new Date(v.measuredAt).toLocaleDateString(),
          `${v.systolicBp}/${v.diastolicBp}`,
          v.pulseRate,
          v.temperature,
          v.weight,
          v.bmi
        ])
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 10;
    }
    
    // Add more sections (allergies, medications, diagnoses, visits, labs)
    
    // Save PDF
    doc.save(`Patient_${patient.medicalRecordNumber}_Summary.pdf`);
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px]">
        <h3 className="text-xl font-bold mb-4">Export Patient Summary</h3>
        
        <div className="space-y-2 mb-6">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={includeOptions.demographics} onChange={...} />
            Demographics
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={includeOptions.vitals} onChange={...} />
            Vital Signs
          </label>
          {/* More checkboxes */}
        </div>
        
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button onClick={generatePDF} className="px-4 py-2 bg-blue-600 text-white rounded">
            Generate PDF
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Deliverables:**
- ✅ PDF export dialog with section selection
- ✅ Generate PDF with demographics, vitals, allergies, meds, diagnoses, visits, labs
- ✅ Download as `Patient_MRN_Summary.pdf`

**Estimated LOC:** ~200 lines

---

### **Day 28: Patient Export (CCD XML)** 📝

**Objective:** Export patient data in Continuity of Care Document (CCD) XML format

**CCD Standard:** HL7 CCD-A specification for patient data exchange

**Implementation:**
```tsx
const generateCCD = async () => {
  const ccdXml = `<?xml version="1.0" encoding="UTF-8"?>
<ClinicalDocument xmlns="urn:hl7-org:v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <realmCode code="US"/>
  <typeId root="2.16.840.1.113883.1.3" extension="POCD_HD000040"/>
  <templateId root="2.16.840.1.113883.10.20.22.1.2"/>
  <id root="${patient.id}"/>
  <code code="34133-9" codeSystem="2.16.840.1.113883.6.1" displayName="Summarization of Episode Note"/>
  <title>Patient Summary - ${patient.firstName} ${patient.lastName}</title>
  <effectiveTime value="${new Date().toISOString()}"/>
  <confidentialityCode code="N" codeSystem="2.16.840.1.113883.5.25"/>
  
  <!-- Patient Information -->
  <recordTarget>
    <patientRole>
      <id extension="${patient.medicalRecordNumber}" root="2.16.840.1.113883.19.5"/>
      <patient>
        <name>
          <given>${patient.firstName}</given>
          <family>${patient.lastName}</family>
        </name>
        <administrativeGenderCode code="${patient.gender}" codeSystem="2.16.840.1.113883.5.1"/>
        <birthTime value="${patient.dateOfBirth}"/>
      </patient>
    </patientRole>
  </recordTarget>
  
  <!-- Allergies Section -->
  <component>
    <section>
      <templateId root="2.16.840.1.113883.10.20.22.2.6.1"/>
      <code code="48765-2" codeSystem="2.16.840.1.113883.6.1" displayName="Allergies"/>
      <title>Allergies</title>
      <text>${patient.allergies || 'No known allergies'}</text>
    </section>
  </component>
  
  <!-- Medications Section -->
  <!-- Diagnoses Section -->
  <!-- Vitals Section -->
  <!-- Encounters Section -->
  
</ClinicalDocument>`;

  // Download as XML file
  const blob = new Blob([ccdXml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Patient_${patient.medicalRecordNumber}_CCD.xml`;
  link.click();
};
```

**Deliverables:**
- ✅ CCD XML export functionality
- ✅ Includes demographics, allergies, medications, diagnoses, vitals, encounters
- ✅ HL7 CCD-A compliant format

**Estimated LOC:** ~150 lines

---

### **Day 29-30: Patient Merge Capability** 🔀

**Objective:** Detect duplicate patients and merge records

**New Component:** `PatientMergeWizard.tsx` (~500 lines)

**Backend API Needed:**
```csharp
// PatientsController.cs
[HttpPost("detect-duplicates")]
public async Task<ActionResult<List<DuplicateGroup>>> DetectDuplicates()
{
    // Find patients with similar names, DOB, or contact info
    // Return groups of potential duplicates
}

[HttpPost("merge")]
public async Task<ActionResult> MergePatients([FromBody] MergeRequest request)
{
    // Merge patient2 into patient1
    // Update all related records (visits, prescriptions, etc.)
    // Soft delete patient2
    // Log merge action in audit trail
}
```

**Duplicate Detection Logic:**
- Same first name + last name + DOB
- Same phone number
- Similar name (Levenshtein distance < 3) + same DOB

**Merge Wizard UX:**
1. **Step 1:** Select primary patient (keep this record)
2. **Step 2:** Select duplicate patient (will be merged)
3. **Step 3:** Review data conflicts (choose which values to keep)
4. **Step 4:** Confirm merge + enter reason
5. **Step 5:** Execute merge + show success

**Implementation:**
```tsx
export function PatientMergeWizard({ onClose }: Props) {
  const [step, setStep] = useState(1);
  const [primaryPatient, setPrimaryPatient] = useState<Patient | null>(null);
  const [duplicatePatient, setDuplicatePatient] = useState<Patient | null>(null);
  const [resolvedData, setResolvedData] = useState<any>({});
  const [reason, setReason] = useState('');
  
  const executeMerge = async () => {
    await patientsApi.merge({
      primaryPatientId: primaryPatient.id,
      duplicatePatientId: duplicatePatient.id,
      resolvedData,
      reason
    });
    
    alert('✓ Patients merged successfully');
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[800px] h-[90%] overflow-hidden flex flex-col">
        {/* Stepper Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Merge Patients</h2>
          <div className="flex items-center gap-4">
            <Step number={1} active={step === 1} completed={step > 1} label="Select Primary" />
            <Step number={2} active={step === 2} completed={step > 2} label="Select Duplicate" />
            <Step number={3} active={step === 3} completed={step > 3} label="Resolve Conflicts" />
            <Step number={4} active={step === 4} label="Confirm" />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {step === 1 && <SelectPrimaryPatient onChange={setPrimaryPatient} />}
          {step === 2 && <SelectDuplicatePatient onChange={setDuplicatePatient} />}
          {step === 3 && (
            <ResolveConflicts
              patient1={primaryPatient}
              patient2={duplicatePatient}
              onResolve={setResolvedData}
            />
          )}
          {step === 4 && (
            <ConfirmMerge
              primary={primaryPatient}
              duplicate={duplicatePatient}
              resolved={resolvedData}
              reason={reason}
              onReasonChange={setReason}
            />
          )}
        </div>
        
        {/* Footer */}
        <div className="flex justify-between p-6 border-t">
          <button onClick={onClose}>Cancel</button>
          <div className="flex gap-3">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)}>Back</button>
            )}
            {step < 4 && (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
              >
                Next
              </button>
            )}
            {step === 4 && (
              <button onClick={executeMerge} className="bg-red-600 text-white">
                Merge Patients
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Deliverables:**
- ✅ Duplicate detection API
- ✅ Patient merge API
- ✅ Merge wizard with 4-step flow
- ✅ Conflict resolution UI
- ✅ Audit logging for merge action

**Estimated LOC:** Backend ~300 lines, Frontend ~500 lines

---

## 🎯 **PHASE 5: TESTING & POLISH (Week 7)**

### **Day 31-33: Comprehensive Testing**

**Objective:** Test all 20+ tabs, search, comparison, export, merge features

**Testing Checklist:**

**Patient Directory Hub:**
- ✅ Patient list loads from API
- ✅ Search by name, MRN, phone, email
- ✅ Advanced search filters (age, gender, city)
- ✅ Patient selection changes right panel
- ✅ Photo display works (sidebar + main panel)
- ✅ Check-in workflow
- ✅ Quick Actions (8+ buttons)
- ✅ Multi-select for comparison

**Patient Details Modal (20+ Tabs):**
1. ✅ Details Tab - Shows patient demographics
2. ✅ Timeline Tab - Chronological activity
3. ✅ Vitals Tab - Charts + history
4. ✅ Visits Tab - Real visit data
5. ✅ Appointments Tab - Real appointment data
6. ✅ Examinations Tab - Real examination data
7. ✅ Diagnoses Tab - Unique diagnoses with visit count
8. ✅ Medications Tab - Active medications
9. ✅ Allergies Tab - Structured allergy list
10. ✅ Lab Reports Tab - Real lab orders + results
11. ✅ Prescriptions Tab - Real prescriptions
12. ✅ Procedures Tab - Surgical history
13. ✅ Imaging Tab - OCT imaging (eye hospital)
14. ✅ Documents Tab - Real patient documents
15. ✅ Billing Tab - Real bills/invoices
16. ✅ Notes Tab - Clinical notes
17. ✅ Insurance Tab - Insurance data
18. ✅ Communications Tab - SMS/email/call logs
19. ✅ Consents Tab - HIPAA/treatment consents
20. ✅ Eye History Tab - Eye-specific data (if applicable)
21. ✅ Surgery Tab - Surgical procedures
22. ✅ Optical Tab - Optical prescriptions
23. ✅ Pharmacy Tab - Medication dispensing

**Advanced Features:**
- ✅ Advanced search filters
- ✅ Patient comparison (2+ patients)
- ✅ PDF export
- ✅ CCD XML export
- ✅ Patient merge

**Check-In Gating:**
- ✅ Examinations tab locked if not checked in
- ✅ Lab Reports tab locked if not checked in
- ✅ Prescriptions tab locked if not checked in
- ✅ Emergency override works + audit logged
- ✅ Override reason required

**Performance:**
- ✅ Large patient list (1000+ patients) loads fast
- ✅ Lazy loading for tabs (don't fetch data until tab opened)
- ✅ Debounced search input
- ✅ Charts render smoothly

---

### **Day 34-35: Bug Fixes & Performance Optimization**

**Tasks:**
1. Fix any bugs found in testing
2. Optimize API calls (reduce redundant fetches)
3. Add loading skeletons for better UX
4. Implement tab lazy loading (fetch data only when tab shown)
5. Add error boundaries for graceful error handling
6. Optimize chart rendering (vitals tab)

**Performance Optimizations:**
```tsx
// Lazy load tab data
const TabContent = React.lazy(() => import('./tabs/TimelineTab'));

{activeTab === 'timeline' && (
  <Suspense fallback={<LoadingSkeleton />}>
    <TabContent patientId={patient.id} />
  </Suspense>
)}

// Debounced search
const debouncedSearch = useDebounce(searchQuery, 300);

// Memoize expensive calculations
const filteredPatients = useMemo(() => {
  // filtering logic
}, [patients, filters]);

// Virtual scrolling for large patient lists
import { useVirtualizer } from '@tanstack/react-virtual';
```

---

## 📊 **DELIVERABLES SUMMARY**

### **Backend APIs (New/Enhanced):**
1. ✅ Vitals API (5 endpoints) - **~600 LOC**
2. 🔄 Lab Reports API (if missing) - **~800 LOC**
3. ✅ Communications API - **~500 LOC**
4. ✅ Consents API - **~500 LOC**
5. 🔄 Patient Merge API (2 endpoints) - **~300 LOC**
6. 🔄 Enhanced Patients API (advanced search) - **~200 LOC**

**Total Backend:** ~2,900 LOC

---

### **Frontend Components (New/Enhanced):**

**New Components:**
1. TimelineTab.tsx - **~400 LOC**
2. VitalsTab.tsx - **~350 LOC**
3. DiagnosesTab.tsx - **~200 LOC**
4. AllergiesTab.tsx - **~200 LOC**
5. ProceduresTab.tsx - **~200 LOC**
6. CommunicationsTab.tsx - **~250 LOC**
7. ConsentsTab.tsx - **~250 LOC**
8. PatientComparisonView.tsx - **~400 LOC**
9. PatientExportDialog.tsx - **~350 LOC** (PDF + CCD XML)
10. PatientMergeWizard.tsx - **~500 LOC**

**Total New Components:** ~3,100 LOC

**Enhanced Components:**
1. PatientDirectoryHub.tsx modifications:
   - Advanced search panel - **~150 LOC**
   - Extended quick actions - **~100 LOC**
   - Multi-select for comparison - **~50 LOC**
   - **Subtotal:** ~300 LOC

2. PatientDetailsModal.tsx modifications:
   - Replace mock data in 10+ tabs - **~300 LOC**
   - Add new tabs integration - **~200 LOC**
   - Loading/empty states - **~100 LOC**
   - **Subtotal:** ~600 LOC

**Total Enhanced Components:** ~900 LOC

**Total Frontend:** ~4,000 LOC

---

## 🎯 **FINAL STATUS**

### **Module 30 Completion:**
- **Before:** 35% complete
- **After:** **100% complete** ✅

### **Total Estimated Work:**
- **Backend:** ~2,900 LOC (7-10 days)
- **Frontend:** ~4,000 LOC (15-20 days)
- **Testing/Polish:** ~3 days
- **Total:** ~6-7 weeks (for one developer working exclusively on Module 30)

### **Parallel Work (If team available):**
- Backend developer: Week 1-2 (APIs)
- Frontend developer 1: Week 2-4 (Tab replacements + new tabs)
- Frontend developer 2: Week 3-5 (Advanced features: search, comparison, export, merge)
- QA: Week 6-7 (Testing + bug fixes)

**Compressed Timeline with Team: 4-5 weeks**

---

## ✅ **SUCCESS CRITERIA**

**Module 30 is COMPLETE when:**
1. ✅ All 20+ tabs implemented and working
2. ✅ ALL mock data replaced with real API calls
3. ✅ Advanced search filters functional
4. ✅ Patient comparison working (2+ patients)
5. ✅ PDF + CCD XML export working
6. ✅ Patient merge capability functional
7. ✅ Check-in gating + emergency override working
8. ✅ All features tested with real patient data
9. ✅ Performance optimized (lazy loading, debounced search)
10. ✅ Documentation updated

---

**END OF SEQUENTIAL IMPLEMENTATION PLAN**
