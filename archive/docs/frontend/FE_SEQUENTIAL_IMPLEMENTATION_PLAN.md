# Frontend Phase-Wise Implementation Plan
**Hospital Portal - Eye Hospital Management System**  
**Generated**: January 26, 2026  
**Duration**: 14 Weeks  
**Team Size**: 4 Frontend Developers  
**Total Effort**: 58 Developer-Weeks

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Phase 1A: Core Examination Suite (Weeks 1-2)](#phase-1a-core-examination-suite-weeks-1-2)
4. [Phase 1B: Clinical Specialty Departments (Weeks 3-5)](#phase-1b-clinical-specialty-departments-weeks-3-5)
5. [Phase 2: Diagnostic & Imaging Services (Weeks 6-8)](#phase-2-diagnostic--imaging-services-weeks-6-8)
6. [Phase 3: Operations & Hospital Services (Weeks 9-11)](#phase-3-operations--hospital-services-weeks-9-11)
7. [Phase 4: Advanced Services & Digital Health (Weeks 12-14)](#phase-4-advanced-services--digital-health-weeks-12-14)
8. [Testing & Deployment Strategy](#testing--deployment-strategy)
9. [Technical Implementation Details](#technical-implementation-details)
10. [Risk Mitigation & Success Criteria](#risk-mitigation--success-criteria)

---

## Executive Summary

### Current State
- **Existing FE Coverage**: ~40% (Admin-heavy with 24 fully implemented modules)
- **Clinical Modules**: 8 partially implemented (appointments, patients, examinations - basic features only)
- **Missing Modules**: 70+ modules required for 100% role coverage
- **Critical Gap**: Core Examination Suite (12 optometry modules) - 0% implemented, needed by ALL 43 clinical roles

### Database Foundation (Already Implemented)
- **102 Roles**: 43 clinical, 20 admin, 12 diagnostic, 15 operations, 12 support
- **145 Permissions**: MODULE:RESOURCE:ACTION pattern, fully seeded
- **182 Department Types**: 19 eye hospital specialties + 163 others
- **94 Role→Department Mappings**: Default assignments configured

### Implementation Strategy
**CORE-FIRST APPROACH**: Build 12 core examination modules (Phase 1A) that ALL doctors need before building specialty-specific features (Phase 1B-4). This ensures every clinical role can perform basic eye exams immediately.

**Architecture Pattern**:
```
ALL DOCTORS = Core 12 Modules + Specialty-Specific Modules

Examples:
- RETINA_SPECIALIST = Core 12 + Fundus Viewer + OCT + Anti-VEGF + Laser
- GLAUCOMA_SPECIALIST = Core 12 + IOP Tracking + Visual Field Analysis + OCT RNFL
- CATARACT_SURGEON = Core 12 + IOL Calculator + Biometry + Surgery Scheduler
- OPTOMETRIST = Core 12 only (but uses most extensively)
```

---

## Current State Analysis

### Existing FE Modules (40% Complete)

#### ✅ **Admin Management Modules** (24 modules - Fully Implemented)
1. **User Management** - Create, edit, delete users
2. **Role Management** - Role hierarchy, permission assignment
3. **Permission Management** - Granular permission control
4. **Department Management** - Department hierarchy, type classification
5. **Branch Management** - Multi-branch support
6. **Tenant Management** - Multi-tenancy configuration
7. **Organization Management** - Organization hierarchy
8. **Employee Management** - Employee profiles, department assignment
9. **Attendance Management** - Time tracking
10. **Leave Management** - Leave application, approval workflow
11. **Payroll Management** - Salary processing
12. **Performance Management** - Appraisals, KPIs
13. **Training Management** - Training records
14. **Onboarding Management** - New employee onboarding
15. **Audit Logs** - System activity tracking
16. **Session Management** - Active sessions monitoring
17. **Device Management** - Device authorization
18. **Emergency Access** - Break-glass access logging
19. **License Management** - License activation, renewal
20. **Bulk Operations** - Bulk user import, role assignment
21. **Role Hierarchy** - Organizational structure
22. **System Settings** - Global configuration
23. **Admin Overview** - Dashboard with KPIs
24. **Settings** - User preferences

#### 🟡 **Clinical Modules** (8 modules - Partially Implemented)
1. **Appointments** - Calendar view ✅, specialty-specific slots ❌
2. **Patients** - Demographics ✅, eye-specific history ❌
3. **Examinations** - Basic records ✅, slit lamp/fundus/OCT ❌
4. **Pharmacy** - Basic inventory ✅, prescription integration ❌
5. **Laboratory** - Test orders ✅, equipment integration ❌
6. **Front Desk** - Patient registration ✅, queue management ❌
7. **Emergency** - Basic triage ✅, trauma protocols ❌
8. **Referrals** - Basic referral form ✅, tracking workflow ❌

#### ❌ **Missing Modules** (70+ modules - 0% Implemented)
**CRITICAL**: Core Examination Suite (12 modules) - needed by ALL doctors  
**HIGH**: Clinical Specialty Departments (8 departments)  
**HIGH**: Diagnostic & Imaging (6 modules)  
**MEDIUM**: Operations & Hospital Services (7 modules)  
**MEDIUM**: Advanced Services (6 modules)

### Role-to-Module Coverage Matrix

| Role Category | Total Roles | Current FE Coverage | Core Modules Status | Missing Features |
|--------------|-------------|---------------------|---------------------|------------------|
| **Clinical Roles** | 43 | 5-20% | ❌ 0/12 Core | Core Suite + Specialty modules |
| **Admin Roles** | 20 | 90-100% | N/A | Minor enhancements only |
| **Diagnostic Roles** | 12 | 10-30% | ⚠️ 2/12 Core | Imaging workflows, device integration |
| **Operations Roles** | 15 | 15-40% | N/A | OT management, Eye camps, Ambulance |
| **Support Roles** | 12 | 50-80% | N/A | Social services, Genetic counseling |

**Critical Finding**: 65% of roles (67/102) have <10% FE support, 35% (35/102) have 0% FE support.

---

## Pre-Development Setup (Week 0)

### Environment Preparation
**Tasks**:
- [ ] Verify backend operational: `http://localhost:5073/swagger` (162 endpoints)
- [ ] Install frontend dependencies: `pnpm install`
- [ ] Verify frontend runs: `pnpm dev` → `http://localhost:3000`
- [ ] Test database connectivity (Azure PostgreSQL)
- [ ] Review existing components and hooks

### Architecture & Design
**Tasks**:
- [ ] Review permission system: `src/hooks/use-permissions.ts`, `ProtectedRoute`
- [ ] Design state management strategy (Zustand stores for clinical data)
- [ ] Create folder structure for new modules:
  ```
  src/
    app/dashboard/
      examination/       ← Core Suite (12 modules)
      clinical/          ← Specialty departments (8 modules)
      diagnostic/        ← Imaging & tests (6 modules)
      operations/        ← Hospital ops (7 modules)
      advanced/          ← Digital health (6 modules)
    components/
      examination/       ← Core Suite components
      clinical/          ← Specialty components
      diagnostic/        ← Imaging components
      operations/        ← Operations components
      shared/            ← Reusable components
  ```
- [ ] Define TypeScript interfaces for all examination modules

### API Integration Setup
**Tasks**:
- [ ] Create API client: `src/lib/api/examination.api.ts`
- [ ] Document all 162 backend endpoints
- [ ] Create React Query hooks for data fetching
- [ ] Test API endpoints with sample data

### Shared Components Library
**Build 5 Core Shared Components**:
1. **NumericInput.tsx** - For VA, IOP, refraction values with validation
2. **EyeSelectorToggle.tsx** - OD (right) / OS (left) / OU (both) selector
3. **ClinicalDataCard.tsx** - Standardized card for exam data display
4. **ProgressionChart.tsx** - Line chart for IOP, VA trends over time
5. **ImageUploadZone.tsx** - Drag-drop for fundus, slit lamp images

### Clinical Workflow Validation
**Tasks**:
- [ ] Workshop with Optometrist + Ophthalmologist (2 hours)
- [ ] Validate UI mockups for Visual Acuity, Refraction, Tonometry
- [ ] Document typical examination workflows
- [ ] Define normal value ranges and validation rules

---

## Phase 1A: Core Examination Suite (Weeks 1-2)
**Goal**: Build 12 optometry modules that ALL doctors need  
**Effort**: 10 developer-weeks  
**Output**: Eye Examination section in sidebar with 12 working modules  
**Priority**: HIGHEST - Unblocks all 43 clinical roles

### Overview
The Core Examination Suite consists of 12 optometry modules that form the foundation for ALL clinical examinations. Every doctor (Retina Specialist, Glaucoma Specialist, Cataract Surgeon, etc.) performs these tests before moving to specialty-specific workflows.

**Critical Success Factor**: This phase MUST be completed before Phase 1B begins, as specialty modules depend on Core Suite data.

---

### Module 1: Visual Acuity Testing

**Purpose**: Measure distance and near vision using standardized charts  
**Used By**: 100% of patient encounters (ALL 43 clinical roles)

**Technical Implementation**:
- [ ] Create module structure
  ```
  src/app/dashboard/examination/visual-acuity/page.tsx
  src/components/examination/VisualAcuityForm.tsx
  src/components/examination/VisualAcuityHistory.tsx
  src/components/examination/ChartSelector.tsx (Snellen, LogMAR, Lea, Cardiff)
  ```

**Features**:
- [ ] Distance Visual Acuity (OD, OS, OU)
  - Snellen chart (6/6, 6/9, 6/12, 6/18, 6/24, 6/60)
  - LogMAR chart (0.0, 0.1, 0.2, etc.)
  - ETDRS chart (85 letters = 6/6)
- [ ] Near Visual Acuity (N5, N6, N8, N10, N12, N18, N24, N36)
- [ ] Pinhole Visual Acuity (to differentiate refractive error from pathology)
- [ ] Best Corrected Visual Acuity (BCVA) - with spectacles/contact lenses
- [ ] Pediatric Charts:
  - Lea Symbols (for pre-literate children)
  - Cardiff Cards (for toddlers)
  - HOTV chart (for young children)
- [ ] Low Vision Charts (for VA <6/60)
- [ ] Color coding: Green (normal 6/6-6/9), Yellow (mild impairment 6/12-6/18), Red (severe <6/60)

**Data Model**:
```typescript
interface VisualAcuityData {
  patientId: string;
  examinationDate: Date;
  examinerId: string;
  
  // Distance VA
  distanceVA: {
    OD: { value: string; chart: 'Snellen' | 'LogMAR' | 'ETDRS' };
    OS: { value: string; chart: 'Snellen' | 'LogMAR' | 'ETDRS' };
    OU?: { value: string; chart: 'Snellen' | 'LogMAR' | 'ETDRS' };
  };
  
  // Near VA
  nearVA: {
    OD: { value: string; distance: '33cm' | '40cm' };
    OS: { value: string; distance: '33cm' | '40cm' };
  };
  
  // Pinhole VA
  pinholeVA?: {
    OD: { value: string; improved: boolean };
    OS: { value: string; improved: boolean };
  };
  
  // BCVA (with correction)
  bcva?: {
    OD: { value: string; correctionType: 'Spectacles' | 'Contact Lens' };
    OS: { value: string; correctionType: 'Spectacles' | 'Contact Lens' };
  };
  
  notes?: string;
}
```

**API Integration**:
- GET `/api/clinical/examination/visual-acuity/:patientId` - Retrieve VA history
- POST `/api/clinical/examination/visual-acuity` - Save new VA measurement
- GET `/api/clinical/examination/visual-acuity/:patientId/trend` - Get VA trend over time

**Permission Requirements**:
- `CLINICAL:EXAMINATION:VIEW` - View VA data
- `CLINICAL:EXAMINATION:EDIT` - Record VA measurement

**Components**:
- `VisualAcuityForm.tsx` - Main data entry form with eye selector
- `ChartSelector.tsx` - Switch between Snellen/LogMAR/ETDRS/Lea/Cardiff
- `VisualAcuityHistory.tsx` - Table showing previous measurements
- `VATrendChart.tsx` - Line chart showing VA improvement/decline over time

**Testing**:
- [ ] Unit tests for VA value validation (can't be negative, must match chart format)
- [ ] Integration test: Save VA → retrieve → display in history
- [ ] Edge case: Very low VA (<1/60) - handle "counting fingers", "hand movements", "light perception"

---

### Module 2: Retinoscopy

**Purpose**: Objective refraction technique using streak/spot retinoscope  
**Used By**: OPTOMETRIST, GENERAL_OPHTHALMOLOGIST, PEDIATRIC_OPHTHALMOLOGIST (70% of clinical roles)

**Technical Implementation**:
- [ ] Create module structure
  ```
  src/app/dashboard/examination/retinoscopy/page.tsx
  src/components/examination/RetinoscopyWorksheet.tsx
  src/components/examination/WorkingDistanceCalculator.tsx
  ```

**Features**:
- [ ] Retinoscopy Type Selector:
  - Streak retinoscopy (most common)
  - Spot retinoscopy (older technique)
- [ ] Working Distance Calculator
  - Standard: 67cm (working distance correction: -1.50D)
  - Custom: 50cm (-2.00D), 100cm (-1.00D)
  - Auto-adjust sphere power based on working distance
- [ ] Neutralization Point Entry (OD/OS separately)
  - Sphere power at neutralization
  - Cylinder power (if with/against motion persists)
  - Axis of cylinder (0-180°)
- [ ] Neutralization Guide (With/Against motion indicators)
  - "With" motion → add plus power
  - "Against" motion → add minus power
  - Neutralized → record power
- [ ] Pediatric Considerations:
  - Cycloplegic retinoscopy (after atropine/cyclopentolate)
  - Non-cycloplegic retinoscopy (for older children)

**Data Model**:
```typescript
interface RetinoscopyData {
  patientId: string;
  examinationDate: Date;
  examinerId: string;
  
  retinoscopyType: 'Streak' | 'Spot';
  workingDistance: number; // in cm
  workingDistanceCorrection: number; // in D
  
  isCycloplegic: boolean;
  cyclop legicAgent?: 'Atropine' | 'Cyclopentolate' | 'Tropicamide';
  
  OD: {
    sphere: number; // in D
    cylinder?: number; // in D
    axis?: number; // 0-180°
    correctedSphere: number; // sphere - workingDistanceCorrection
  };
  
  OS: {
    sphere: number;
    cylinder?: number;
    axis?: number;
    correctedSphere: number;
  };
  
  notes?: string;
}
```

**API Integration**:
- POST `/api/clinical/examination/retinoscopy` - Save retinoscopy results
- GET `/api/clinical/examination/retinoscopy/:patientId` - Retrieve results

**Permission Requirements**: `CLINICAL:EXAMINATION:EDIT`

---

### Module 3: Refraction (Manual / Subjective)

**Purpose**: Subjective refraction using trial frame and lenses  
**Used By**: 70% of clinical roles (all who prescribe spectacles)

**Technical Implementation**:
- [ ] Create module structure
  ```
  src/app/dashboard/examination/refraction/page.tsx
  src/components/examination/RefractionForm.tsx
  src/components/examination/JacksonCrossCylinder.tsx
  src/components/examination/DuochromeTest.tsx
  ```
- [ ] **1:00 PM - 5:00 PM**: Build Refraction Form
  - Sphere/Cylinder/Axis entry (OD/OS)
  - Visual acuity with correction
  - Add power for presbyopia
  - Binocular balancing
- [ ] **EOD**: Create PR

**Developer 4 - Shared Components & Navigation**
- [ ] **9:30 AM - 11:00 AM**: Update sidebar navigation
  - Add "Eye Examination" section
  - Add Visual Acuity, Retinoscopy, Refraction menu items
  - Add permission checks: `CLINICAL:EXAMINATION:VIEW`
- [ ] **11:00 AM - 1:00 PM**: Build EyeSelectorToggle component
  ```tsx
  <EyeSelectorToggle 
    value="OD" 
    onChange={(eye) => setSelectedEye(eye)} 
  />
  // Options: OD (Right) | OS (Left) | OU (Both)
  ```
- [ ] **2:00 PM - 5:00 PM**: Build NumericInput with validation
  ```tsx
  <NumericInput 
    label="IOP (mmHg)" 
    min={0} 
    max={50} 
    step={0.1}
    showNormalRange={true}
    normalRange={[10, 21]}
  />
  ```
- [ ] **EOD**: Create PR for shared components

#### Tuesday (Day 2) - Code Review & Next 3 Modules
**9:00 AM - Daily Standup**
- Demo yesterday's work (5 min each)
- Identify blockers

**9:30 AM - 10:30 AM - Code Review Session (All Developers)**
- [ ] Review Visual Acuity, Retinoscopy, Refraction PRs
- [ ] Team Lead provides feedback
- [ ] Developers address comments

### Module 4: Auto-Refractometry

**Purpose**: Objective refraction using automated devices  
**Used By**: OPTOMETRIST, REFRACTIONIST, TECHNICIAN (80% of clinics)

**Technical Implementation**:
- [ ] Create module structure
  ```
  src/app/dashboard/examination/auto-refraction/page.tsx
  src/components/examination/AutoRefractorImport.tsx
  src/components/examination/DeviceSelector.tsx
  src/components/examination/ManualDataEntry.tsx
  ```

**Features**:
- [ ] Device Integration (future enhancement)
  - Nidek AR-1/AR-360
  - Topcon KR-800/KR-1W
  - Zeiss i.Profiler
  - Manual data entry (if device not connected)
- [ ] Auto-Refractor Data Entry
  - Sphere/Cylinder/Axis (OD/OS)
  - Pupil diameter
  - Keratometry (K1/K2) - if auto-kerato-refractometer
  - Vertex distance (12mm standard)
- [ ] Comparison with Manual Refraction
  - Side-by-side view: Auto-Rx vs. Subjective Rx
  - Highlight differences
  - Track over-minus syndrome
- [ ] Pediatric Cycloplegic Refraction
  - Pre-cycloplegia auto-refraction
  - Post-cycloplegia auto-refraction
  - Accommodation difference calculation

**Data Model**:
```typescript
interface AutoRefractionData {
  patientId: string;
  examinationDate: Date;
  examinerId: string;
  device: {
    manufacturer: 'Nidek' | 'Topcon' | 'Zeiss' | 'Marco' | 'Manual';
    model: string;
  };
  OD: {
    sphere: number;
    cylinder: number;
    axis: number;
    pupilDiameter?: number;
  };
  OS: {
    sphere: number;
    cylinder: number;
    axis: number;
    pupilDiameter?: number;
  };
  keratometry?: {
    OD: { K1: number; K2: number; axis: number };
    OS: { K1: number; K2: number; axis: number };
  };
  isCycloplegic: boolean;
  cyclop legicAgent?: 'Atropine 1%' | 'Cyclopentolate 1%' | 'Tropicamide 1%';
  notes?: string;
}
```

**API Integration**:
- POST `/api/clinical/examination/auto-refraction` - Save auto-refraction
- GET `/api/clinical/examination/auto-refraction/:patientId` - Retrieve auto-refraction

**Permission Requirements**: `CLINICAL:EXAMINATION:VIEW`, `CLINICAL:EXAMINATION:EDIT`

---

### Module 5: Keratometry

**Purpose**: Measure corneal curvature (K1/K2) for astigmatism and IOL calculation  
**Used By**: OPTOMETRIST, CATARACT_SURGEON, CORNEA_SPECIALIST

**Technical Implementation**:
- [ ] Create module structure
  ```
  src/app/dashboard/examination/keratometry/page.tsx
  src/components/examination/KeratometryForm.tsx
  src/components/examination/AstigmatismCalculator.tsx
  src/components/examination/IOLIntegration.tsx
  ```

**Features**:
- [ ] Manual Keratometry Entry
  - K1 (flat meridian) - typically 42-44D
  - K2 (steep meridian) - typically 43-45D
  - Axis of steep meridian (0-180°)
  - Mires quality assessment
- [ ] Corneal Astigmatism Calculation
  - Magnitude: K2 - K1
  - Type: With-the-rule (WTR), Against-the-rule (ATR), Oblique
  - Impact on vision (>0.75D significant)
- [ ] IOL Calculation Data (for Cataract Surgery)
  - K1/K2 values auto-populate in IOL calculator
  - Average K: (K1 + K2) / 2
  - Toric IOL needed if astigmatism >0.75D
- [ ] Contact Lens Base Curve Calculation
  - Base curve = Flat K - 0.50D (for soft lenses)
  - Steep K fitting for RGP lenses (keratoconus)

**Data Model**:
```typescript
interface KeratometryData {
  patientId: string;
  examinationDate: Date;
  examinerId: string;
  OD: {
    K1: number;
    K2: number;
    axis: number;
    astigmatism: number;
    astigmatismType: 'WTR' | 'ATR' | 'Oblique';
    averageK: number;
  };
  OS: {
    K1: number;
    K2: number;
    axis: number;
    astigmatism: number;
    astigmatismType: 'WTR' | 'ATR' | 'Oblique';
    averageK: number;
  };
  miresQuality: 'Good' | 'Fair' | 'Poor' | 'Distorted';
  forIOLCalculation: boolean;
  forContactLensFitting: boolean;
  notes?: string;
}
```

**API Integration**:
- POST `/api/clinical/examination/keratometry` - Save keratometry
- GET `/api/clinical/examination/keratometry/:patientId` - Retrieve keratometry

---

### Module 6: Pachymetry

**Purpose**: Measure corneal thickness (central and peripheral)  
**Used By**: GLAUCOMA_SPECIALIST, CORNEA_SPECIALIST, OPTOMETRIST

**Technical Implementation**:
- [ ] Create module structure
  ```
  src/app/dashboard/examination/pachymetry/page.tsx
  src/components/examination/PachymetryForm.tsx
  src/components/examination/ThicknessMap.tsx
  src/components/examination/GlaucomaCorrectionCalculator.tsx
  ```

**Features**:
- [ ] Central Corneal Thickness (CCT) Entry
  - Normal range: 500-600 μm
  - Thin cornea (<500 μm): Glaucoma risk, keratoconus suspect
  - Thick cornea (>600 μm): IOP over-estimation
- [ ] Peripheral Pachymetry (4 quadrants)
  - Superior, Inferior, Nasal, Temporal thickness
  - Thickness map visualization (color-coded)
- [ ] Glaucoma IOP Correction Factor
  - Correction formula for IOP readings
- [ ] Pre-LASIK Screening
  - Minimum residual stromal bed: 250 μm post-LASIK
  - Flag if CCT <500 μm
- [ ] Corneal Edema Monitoring
  - Serial pachymetry to track edema
  - Post-op cataract surgery monitoring

**Data Model**:
```typescript
interface PachymetryData {
  patientId: string;
  examinationDate: Date;
  examinerId: string;
  device: 'Ultrasound' | 'OCT' | 'Scheimpflug' | 'Specular Microscopy';
  OD: {
    centralThickness: number;
    peripheralThickness?: {
      superior: number;
      inferior: number;
      nasal: number;
      temporal: number;
    };
    thinnestPoint?: number;
  };
  OS: {
    centralThickness: number;
    peripheralThickness?: {
      superior: number;
      inferior: number;
      nasal: number;
      temporal: number;
    };
    thinnestPoint?: number;
  };
  glaucomaRiskOD: boolean;
  glaucomaRiskOS: boolean;
  lasikSuitableOD: boolean;
  lasikSuitableOS: boolean;
  iopCorrectionFactorOD?: number;
  iopCorrectionFactorOS?: number;
  notes?: string;
}
```

**API Integration**:
- POST `/api/clinical/examination/pachymetry` - Save pachymetry
- GET `/api/clinical/examination/pachymetry/:patientId` - Retrieve pachymetry

---

### Module 7: Tonometry (IOP Measurement) - CRITICAL

**Purpose**: Measure intraocular pressure for glaucoma detection  
**Used By**: ALL DOCTORS, OPTOMETRIST (100% of patient encounters aged >40)

**Technical Implementation**:
- [ ] Create module structure
  ```
  src/app/dashboard/examination/tonometry/page.tsx
  src/components/examination/TonometryForm.tsx
  src/components/examination/IOPTrendChart.tsx
  src/components/examination/MethodSelector.tsx
  src/components/examination/DiurnalIOPTracker.tsx
  ```

**Features**:
- [ ] IOP Measurement Entry
  - OD IOP (in mmHg)
  - OS IOP (in mmHg)
  - Normal range: 10-21 mmHg
  - Alert if IOP >21 mmHg (glaucoma suspect)
  - Alert if IOP <10 mmHg (hypotony)
- [ ] Tonometry Method Selector
  - Goldmann Applanation Tonometry (GAT) - Gold standard
  - Non-Contact Tonometry (NCT / Air-puff)
  - Rebound Tonometry (iCare)
  - Tonopen
- [ ] Time of Measurement & Diurnal Tracking
  - Morning, afternoon, evening readings
  - Diurnal IOP tracking
- [ ] CCT Correction Integration
  - Apply IOP correction from pachymetry
  - Corrected IOP calculation
- [ ] Historical IOP Trend Chart
  - Line chart showing IOP over last 5-10 visits
  - Medication changes markers
  - Surgical interventions markers
  - Target IOP line
- [ ] Glaucoma Suspect Flagging
  - IOP >21 mmHg on 2+ occasions → Flag for referral
  - Auto-suggest visual field test, OCT RNFL

**Data Model**:
```typescript
interface TonometryData {
  patientId: string;
  examinationDate: Date;
  examinerId: string;
  method: 'Goldmann' | 'NCT' | 'Rebound' | 'Tonopen' | 'Perkins';
  measurementTime: Date;
  OD: {
    measuredIOP: number;
    correctedIOP?: number;
    repeatMeasurements?: number[];
  };
  OS: {
    measuredIOP: number;
    correctedIOP?: number;
    repeatMeasurements?: number[];
  };
  cctCorrectionApplied: boolean;
  cctOD?: number;
  cctOS?: number;
  glaucomaSuspectOD: boolean;
  glaucomaSuspectOS: boolean;
  hypotonyOD: boolean;
  hypotonyOS: boolean;
  isGlaucomaPatient: boolean;
  targetIOPOD?: number;
  targetIOPOS?: number;
  onGlaucomaMedication: boolean;
  notes?: string;
}
```

**API Integration**:
- POST `/api/clinical/examination/tonometry` - Save IOP measurement
- GET `/api/clinical/examination/tonometry/:patientId` - Retrieve latest IOP
- GET `/api/clinical/examination/tonometry/:patientId/trend` - Get IOP history

---

### Modules 8-12: Additional Core Suite Modules

The remaining core modules (Color Vision, Contrast Sensitivity, Visual Field Screening, Spectacle Dispensing, Contact Lens Services) follow the same pattern:

- **Module structure**: Page + Form components + Supporting components
- **Data Model**: TypeScript interfaces matching backend DTOs
- **API Integration**: GET/POST endpoints
- **Permission Requirements**: `CLINICAL:EXAMINATION:VIEW/EDIT`
- **Features**: Clinical functionality specific to each exam type

---

## Milestone M0: Phase 1A Completion (End of Week 2)

**Deliverables**:
- ✅ 12 core examination modules complete
- ✅ 25+ optometry components built
- ✅ Eye Examination sidebar section added
- ✅ Integration with backend (162 endpoints)
- ✅ Permission-based access control
- ✅ ALL 43 clinical roles can now perform basic eye exams

**Testing Checklist**:
- [ ] Unit tests for all 12 modules (80% coverage)
- [ ] Integration test: Complete patient examination workflow
- [ ] Permission test: Each role can access appropriate modules
- [ ] Cross-module integration testing
- [ ] Data persistence validation

**Demo Script**:
1. Select patient from patient list
2. Perform Visual Acuity test → Save
3. Perform Retinoscopy → Save
4. Perform Refraction → Save
5. Perform Keratometry → Save
6. Perform Tonometry (IOP) → View trend chart
7. Generate Spectacle Prescription
8. View complete examination summary

**Success Criteria**:
- Optometrist can complete full examination workflow in <15 minutes
- All data flows correctly between modules
- No critical bugs in core functionality
- Stakeholder approval to proceed to Phase 1B

---

## Phase 1B: Clinical Specialty Departments (Weeks 3-5)

**STATUS: 67% COMPLETE (6 of 9 modules)** ✅  
**Last Updated**: January 27, 2026  
**Goal**: Add specialty-specific modules on top of Core Suite  
**Effort**: 18 developer-weeks  
**Output**: 9 clinical department modules + Doctor's Desk

---

### ✅ **Module 1: Doctor's Desk** (100% COMPLETE)
**Implemented**: January 2026  
**Components**: 3 files, 1,950 lines  
**Purpose**: Central optometry-to-ophthalmology handoff dashboard

**Files Created**:
- `apps/hospital-portal-web/src/app/dashboard/doctors-desk/page.tsx` (650 lines)
- `apps/hospital-portal-web/src/app/dashboard/doctors-desk/[id]/page.tsx` (450 lines)
- `apps/hospital-portal-web/src/components/specialty-clinics/doctors-desk/ClinicalNotes.tsx` (850 lines)

**Features Implemented**:
- Patient queue with optometry referrals (12 diverse patients)
- 4 statistics cards, 4 quick actions
- Optometry summary integration (pulls data from Phase 1A modules)
- Chief complaint, HPI, exam findings recorder
- ICD-10 diagnosis coding integration
- Treatment plan documentation

**Permission**: `CLINICAL:EXAMINATION:VIEW`

---

### ✅ **Module 2: Retina Clinic** (100% COMPLETE)
**Implemented**: January 2026  
**Components**: 5 files, 2,200 lines  
**Purpose**: Diabetic retinopathy, AMD, retinal detachment management

**Files Created**:
- `RetinaClinicPage.tsx` - 8 patients with PDR, AMD, RD (600 lines)
- `FundusImageViewer.tsx` - ETDRS DR grading, AMD classification (500 lines)
- `OCTAnalysis.tsx` - CRT measurements, ETDRS grid, pathology detection (550 lines)
- `AntiVEGFTracker.tsx` - Injection history, treatment protocols, response (350 lines)
- `LaserTreatmentPlanner.tsx` - PRP for PDR, focal laser for DME (200 lines)

**Clinical Features**:
- ETDRS Diabetic Retinopathy Severity Scale (No DR → PDR)
- AMD Classification (Early/Intermediate/Advanced)
- Central Retinal Thickness measurement (normal 250-280μm)
- Anti-VEGF protocols (Avastin, Lucentis, Eylea dosing)
- PRP laser planning for PDR

**Permission**: `CLINICAL:RETINA:VIEW`

---

### ✅ **Module 3: Glaucoma Clinic** (100% COMPLETE)
**Implemented**: January 2026  
**Components**: 6 files, 2,500 lines  
**Purpose**: IOP management, visual field analysis, optic nerve assessment

**Files Created**:
- `GlaucomaClinicPage.tsx` - 15 patients, IOP control status (450 lines)
- `IOPTracker.tsx` - Serial IOP, target assessment, diurnal variation (400 lines)
- `VisualFieldAnalysis.tsx` - MD/PSD/VFI indices, GPA progression (550 lines)
- `OpticNerveAssessment.tsx` - CDR, RNFL thickness, GCC, staging (450 lines)
- `GlaucomaMedications.tsx` - 7 medication classes, escalation algorithm (400 lines)
- `GlaucomaSurgeryPlanner.tsx` - Trabeculectomy, tube shunt, MIGS (250 lines)

**Clinical Features**:
- IOP target calculation and tracking
- Guided Progression Analysis (GPA) for visual fields
- Cup-to-Disc Ratio (CDR) measurement (0.3-0.9 scale)
- 7 medication classes with mechanism of action
- Surgical intervention thresholds

**Permission**: `CLINICAL:GLAUCOMA:VIEW`

---

### ✅ **Module 4: Cataract Clinic** (100% COMPLETE)
**Implemented**: January 2026  
**Components**: 6 files, 3,100 lines  
**Purpose**: Cataract grading, IOL calculation, surgery planning

**Files Created**:
- `CataractClinicPage.tsx` - 18 patients, LOCS III grading (550 lines)
- `LOCSIIIGrading.tsx` - NO/NC/C/P scales (0.1-6.9) (600 lines)
- `BiometryAnalysis.tsx` - AL, keratometry, ACD, device integration (450 lines)
- `IOLCalculator.tsx` - 8 formulas, IOL types, toric calculator (750 lines)
- `CataractSurgeryPlanner.tsx` - Phaco technique, complications tracking (500 lines)
- `PostOpFollowUp.tsx` - Day 1/7/30 protocol, complications (250 lines)

**Clinical Features**:
- LOCS III grading system (Nuclear, Cortical, PSC)
- 8 IOL calculation formulas (Barrett, SRK/T, Hoffer Q, Holladay, Haigis, T2, Hill-RBF, Olsen)
- Toric IOL calculator for astigmatism >0.75D
- IOL power optimization for target refraction
- Surgery complication registry

**Permission**: `CLINICAL:CATARACT:VIEW`

---

### ✅ **Module 5: Cornea Clinic** (100% COMPLETE)
**Implemented**: January 2026  
**Components**: 6 files, 3,835 lines  
**Purpose**: Keratoconus screening, CXL protocols, ulcer management, keratoplasty

**Files Created**:
- `CorneaClinicPage.tsx` - 3 patients (keratoconus, Fuchs', ulcer) (400 lines)
- `TopographyAnalysis.tsx` - 4 KC indices, Amsler-Krumeich + ABCD staging (850 lines)
- `KeratoconusTracker.tsx` - Progression analysis, CXL eligibility, Dresden protocol (700 lines)
- `CornealUlcerManagement.tsx` - Serial size tracking, culture/sensitivity, intensive therapy (650 lines)
- `KeratoplastyPlanning.tsx` - PKP/DALK/DSEK/DMEK, donor tissue quality (685 lines)
- `PostKeratoplastyFollowUp.tsx` - Rejection monitoring, suture management (550 lines)

**Clinical Features**:
- 4 keratoconus indices (KI >1.07, CKI >1.03, IHA >10, IHD >0.04)
- Amsler-Krumeich staging (1-4) + ABCD grading system
- CXL eligibility criteria (pachymetry ≥400μm, progression >0.5D/year)
- Dresden protocol (3 mW/cm² × 30 min = 5.4 J/cm²)
- Keratoplasty type selection algorithm
- Endothelial cell count monitoring (>2500 cells/mm² for donor tissue)

**Permission**: `CLINICAL:CORNEA:VIEW`

---

### ✅ **Module 6: Pediatric Clinic** (100% COMPLETE)
**Implemented**: January 27, 2026  
**Components**: 8 files, 2,815 lines  
**Purpose**: Cycloplegic refraction, amblyopia management, strabismus assessment, developmental tracking

**Files Created**:
- `PediatricClinicPage.tsx` - 6 age-diverse patients (9m-12y) (520 lines)
- `PediatricExaminationPage.tsx` - 4-tab patient interface (110 lines)
- `CycloplegicRefraction.tsx` - Latent hyperopia detection, spectacle assessment (480 lines)
- `AmbliopiaScreening.tsx` - VA tracking, occlusion therapy, treatment response (535 lines)
- `StrabismusAssessment.tsx` - Cover test, Hirschberg, prism measurements, surgery candidacy (630 lines)
- `DevelopmentalMilestones.tsx` - Age milestones (0-18y), expected VA by age, red flags (540 lines)

**Clinical Features**:
- **Cycloplegic Refraction**: 5 agent options with age-based recommendations, latent hyperopia calculation (pre vs post-cycloplegic comparison), automated spectacle prescription algorithm (Required/Recommended/Optional based on anisometropia >1.00D, hyperopia >+3.00D)
- **Amblyopia Screening**: Visual acuity progress tracking, amblyopia classification (anisometropic/strabismic/deprivation/mixed), occlusion therapy management (patching hours/day based on severity), treatment response assessment (lines improved, percent improvement), critical age warnings (treatment efficacy decreases after 8-9 years)
- **Strabismus Assessment**: Cover test results (distance & near), Hirschberg test (corneal light reflex), prism measurements (quantify deviation in PD), stereopsis testing (Titmus fly, depth perception), automated surgery candidacy (>15 PD constant = candidate)
- **Developmental Milestones**: Age-appropriate checklists (0-3m, 3-6m, 6-12m, 1-2y, 2-3y, 3-5y, 5-8y, 8-12y, 12-18y), expected VA by age (6m: 6/60, 1y: 6/36, 3y: 6/18, 6+y: 6/6), red flag screening (leukocoria, constant turn, no fixation, photophobia) with severity grading

**Permission**: `CLINICAL:PEDIATRIC:VIEW`

---

### ⏳ **Module 7: Neuro-Ophthalmology Clinic** (IN PROGRESS - 0%)
**Target**: January 27, 2026  
**Estimated**: 6 files, ~2,800 lines  
**Purpose**: Optic neuropathy, RAPD testing, cranial nerve examination, visual field defects

**Planned Components**:
- `NeuroClinicPage.tsx` - Patient queue with neuro conditions
- `OpticNeuropathyAssessment.tsx` - AION, NAION, optic neuritis, papilledema
- `RAPDTesting.tsx` - Relative Afferent Pupillary Defect (swinging flashlight test)
- `CranialNerveExam.tsx` - CN III, IV, VI assessment (extraocular movements, diplopia charting)
- `NeuroVisualField.tsx` - Hemianopia, quadrantanopia, bitemporal defects
- `PupilReactions.tsx` - Direct/consensual, APD grading, Adie's pupil, Horner's syndrome

---

### ⏳ **Module 8: Oculoplasty Clinic** (PENDING - 0%)
**Estimated**: 5 files, ~2,400 lines  
**Purpose**: Ptosis grading, eyelid lesions, lacrimal disorders, orbital disease

**Planned Components**:
- `OculoplastyClinicPage.tsx`
- `PtosisAssessment.tsx` - MRD1/MRD2, levator function
- `EyelidLesions.tsx` - Chalazion, stye, tumors
- `LacrimalDisorders.tsx` - Dacryocystitis, dry eye
- `OrbitalImaging.tsx` - CT/MRI integration

---

### ⏳ **Module 9: Low Vision Clinic** (PENDING - 0%)
**Estimated**: 5 files, ~2,100 lines  
**Purpose**: Low vision aids, rehabilitation, functional vision assessment

**Planned Components**:
- `LowVisionClinicPage.tsx`
- `VisualFunctionAssessment.tsx`
- `LowVisionAids.tsx` - Magnifiers, CCTV, optical aids
- `RehabilitationPlan.tsx`
- `IndependenceMeasures.tsx`

---

### **Phase 1B Summary**
| Module | Status | Components | Lines | Completion Date |
|--------|--------|------------|-------|----------------|
| 1. Doctor's Desk | ✅ 100% | 3 | 1,950 | Jan 2026 |
| 2. Retina Clinic | ✅ 100% | 5 | 2,200 | Jan 2026 |
| 3. Glaucoma Clinic | ✅ 100% | 6 | 2,500 | Jan 2026 |
| 4. Cataract Clinic | ✅ 100% | 6 | 3,100 | Jan 2026 |
| 5. Cornea Clinic | ✅ 100% | 6 | 3,835 | Jan 2026 |
| 6. Pediatric Clinic | ✅ 100% | 8 | 2,815 | Jan 27, 2026 |
| 7. Neuro-Ophthalmology | ⏳ 0% | - | - | In Progress |
| 8. Oculoplasty | ⏳ 0% | - | - | Pending |
| 9. Low Vision | ⏳ 0% | - | - | Pending |
| **TOTAL** | **67%** | **34** | **16,400** | **6 of 9** |

**Milestone M1-Partial** (Current State):
- ✅ 6 of 9 specialty modules complete (67%)
- ✅ 34 specialty components built
- ✅ Doctor's Desk operational (optometry → ophthalmology handoff)
- ✅ ~16,400 lines of clinical code
- ⏳ 3 modules remaining (Neuro, Oculoplasty, Low Vision)

---

## Phase 2: Diagnostic & Imaging Services (Weeks 6-8)

**Goal**: Connect imaging workflows to clinical modules  
**Effort**: 12 developer-weeks  
**Output**: 6 diagnostic modules

**Diagnostic Modules**:
1. **IOL Inventory Management** - Stock tracking, surgeon preferences, auto-check stock
2. **Fundus Imaging & Photography** - Image archival, AI-assisted DR grading, report generation
3. **Retinopathy Screening** - Population screening, AI grading, referral generation
4. **Biometry & IOL Calculation** - Biometry data entry, multi-formula IOL calculator, toric calculator
5. **OCT Imaging Management** - RNFL mapping, macular thickness analysis, integration with Glaucoma/Retina
6. **Electrophysiology Lab** - ERG/VEP testing, waveform display

**Technical Pattern**:
```
src/app/dashboard/diagnostic/
  iol-inventory/page.tsx
  fundus-imaging/page.tsx
  retinopathy-screening/page.tsx
  biometry/page.tsx
  oct-imaging/page.tsx
  electrophysiology/page.tsx
```

**Milestone M2** (End of Week 8):
- ✅ 6 diagnostic modules complete
- ✅ Imaging workflows integrated with clinical modules
- ✅ Biometry → Cataract Surgery workflow validated
- ✅ 12+ diagnostic role workflows enabled

---

## Phase 3: Operations & Hospital Services (Weeks 9-11)

**Goal**: Complete operational workflows  
**Effort**: 10 developer-weeks  
**Output**: 7 operational modules

**Operational Modules**:
1. **OT Management** - Surgery scheduling, equipment tracking, sterilization logs
2. **CSSD** - Sterilization cycle tracking, instrument set management
3. **Eye Camp Coordination** - Camp planning, screening data entry, surgery selection
4. **Ambulance Services** - Fleet management, trip scheduling, fuel tracking
5. **Stores & Inventory** - General inventory management (not clinical)
6. **Genetic Counseling** - Hereditary disease registry, pedigree charting
7. **Ocular Prosthetics** - Artificial eye fitting records
8. **Social Services** - Charity care applications, financial assistance

**Milestone M3** (End of Week 11):
- ✅ 7 operational modules complete
- ✅ Eye camp workflow validated
- ✅ OT management integrated with clinical modules
- ✅ 15+ operational role workflows enabled

---

## Phase 4: Advanced Services & Digital Health (Weeks 12-14)

**Goal**: Modern digital health capabilities  
**Effort**: 8 developer-weeks  
**Output**: 6 advanced modules

**Advanced Modules**:
1. **Tele-Ophthalmology Portal** - Remote consultation, store-and-forward imaging, e-prescription
2. **Medical Coding & Billing** - ICD-10/CPT coding, insurance claims
3. **Infection Control** - Post-op endophthalmitis registry, hand hygiene monitoring
4. **Quality & Accreditation** - NABH compliance checklists, quality indicators
5. **Diet & Nutrition** - Diabetic diet planning, pre-op fasting protocols
6. **Clinical Photography** - Slit lamp photography, fluorescein angiography

**Milestone M4** (End of Week 14):
- ✅ 6 advanced modules complete
- ✅ Tele-ophthalmology portal operational
- ✅ NABH accreditation support
- ✅ 100% role coverage (all 102 roles)

---

## Testing & Deployment (Weeks 15-17)

### Week 15: Staging Deployment
- Deploy to staging environment
- Smoke testing, load testing, functional testing
- User Acceptance Testing (UAT)
- Bug fixes

### Week 16: Production Deployment (Pilot)
- Deploy to production
- 50 pilot users
- Monitor, collect feedback
- Fix critical bugs

### Week 17: Full Rollout
- Training sessions
- Create 15,000+ user accounts
- Full-time support
- Monitor adoption metrics
- Retrospective

---

## Technical Implementation Details

### Routing Structure
```
apps/hospital-portal-web/src/app/dashboard/
  examination/          ← Phase 1A (12 core modules)
  clinical/             ← Phase 1B (8 specialty modules)
  diagnostic/           ← Phase 2 (6 diagnostic modules)
  operations/           ← Phase 3 (7 operational modules)
  advanced/             ← Phase 4 (6 advanced modules)
```

### State Management
```typescript
// Zustand store for clinical data
interface ClinicalStore {
  currentPatient: Patient | null;
  visualAcuity: VisualAcuityData | null;
  refraction: RefractionData | null;
  tonometry: TonometryData | null;
  setCurrentPatient: (patient: Patient) => void;
  updateVisualAcuity: (data: VisualAcuityData) => void;
}
```

### API Integration
```typescript
// API client pattern
export const examinationApi = {
  getVisualAcuity: (patientId: string) => 
    getApi().get(`/clinical/examination/visual-acuity/${patientId}`),
  saveVisualAcuity: (data: VisualAcuityData) =>
    getApi().post('/clinical/examination/visual-acuity', data),
};
```

### Permission Integration
```typescript
// Permission-based access control
import { useHasPermission } from '@/hooks/use-permissions';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function RetinaDepartmentPage() {
  const canView = useHasPermission('CLINICAL:RETINA:VIEW');
  const canEdit = useHasPermission('CLINICAL:RETINA:EDIT');
  
  return (
    <ProtectedRoute requiredPermission="CLINICAL:RETINA:VIEW">
      {/* Module content */}
    </ProtectedRoute>
  );
}
```

---

## Success Criteria (Week 17)

**Coverage Metrics**:
- ✅ Role Coverage: 100% (all 102 roles)
- ✅ Department Coverage: 100% (all 182 departments)
- ✅ Permission Coverage: 100% (all 145 permissions)

**Adoption Metrics**:
- ✅ Clinical Staff Login Rate: >85% within first month
- ✅ Core Suite Usage: >90% of doctors use VA, Refraction, IOP modules
- ✅ Specialty Module Usage: >70% of specialists use their department modules
- ✅ OT Scheduling Adoption: >80% of surgeries pre-booked via system

**Performance Metrics**:
- ✅ Page Load Time: <2 seconds for clinical dashboards
- ✅ Image Load Time: Fundus photos <3 seconds, OCT scans <5 seconds
- ✅ API Response Time: <500ms for GET, <1s for POST
- ✅ Concurrent Users: Support 500+ simultaneous users

**Quality Metrics**:
- ✅ Bug Density: <2 critical bugs per module
- ✅ Permission Accuracy: 0 unauthorized access incidents
- ✅ HIPAA Compliance: 100% PHI access logged
- ✅ Data Integrity: 0 data loss incidents

---

**END OF PHASE-WISE IMPLEMENTATION PLAN**

This plan provides a structured, phase-based approach to building the complete Hospital Portal frontend in 14 weeks (+ 3 weeks deployment), covering all 70+ modules with 100% role coverage.
  src/app/dashboard/examination/visual-field-screening/page.tsx
  src/components/examination/ConfrontationField.tsx
  src/components/examination/AmslerGrid.tsx
  ```
- [ ] **1:00 PM - 5:00 PM**: Build Visual Field Screening interface
  - Confrontation field testing (digital grid)
  - Amsler grid test (distortion detection)
  - Frequency doubling technology (FDT) placeholder
  - Glaucoma suspect flagging
- [ ] **EOD**: Create PR

**Developer 4 - Patient Examination Dashboard**
- [ ] **9:30 AM - 5:00 PM**: Create unified exam dashboard
  ```
  src/app/dashboard/examination/patient/[patientId]/page.tsx
  ```
  - Shows all 12 modules in tabs
  - Quick view of last examination date for each module
  - "Complete Examination" workflow (step-by-step through all 12)
  - Export complete exam report to PDF
- [ ] **EOD**: Create PR

#### Tuesday (Day 7) - Spectacle Dispensing & Contact Lens
**Developer 1 - Spectacle Dispensing Module**
- [ ] **9:30 AM - 12:00 PM**: Create module structure
  ```
  src/app/dashboard/examination/spectacle-dispensing/page.tsx
  src/components/examination/PrescriptionGenerator.tsx
  src/components/examination/FrameSelector.tsx
  src/components/examination/LensOptions.tsx
  ```
- [ ] **1:00 PM - 5:00 PM**: Build Spectacle Dispensing interface
  - Auto-populate prescription from refraction module
  - Pupillary distance (PD) measurement
  - Frame selection (catalog integration placeholder)
  - Lens material: CR-39, Polycarbonate, High-Index
  - Coatings: Anti-reflective, UV, Blue-light filter, Photochromic
  - Price calculation
  - Dispensing tracking & warranty
- [ ] **EOD**: Create PR

**Developer 2 - Contact Lens Services Module**
- [ ] **9:30 AM - 12:00 PM**: Create module structure
  ```
  src/app/dashboard/examination/contact-lens/page.tsx
  src/components/examination/ContactLensFitting.tsx
  src/components/examination/LensTrialLog.tsx
  src/components/examination/ComplicationTracker.tsx
  ```
- [ ] **1:00 PM - 5:00 PM**: Build Contact Lens interface
  - Soft lens trial & fitting
  - RGP lens fitting (keratoconus, post-RK)
  - Toric lens for astigmatism (auto-calculate from keratometry)
  - Multifocal lens for presbyopia
  - Ortho-K lens management
  - Complication tracking (GPC, infection, corneal staining)
- [ ] **EOD**: Create PR

**Developer 3 & 4 - Integration & Testing**
- [ ] **9:30 AM - 12:00 PM**: Code review session for Day 6 PRs
- [ ] **1:00 PM - 5:00 PM**: Integration testing
  - Test data flow: Refraction → Keratometry → Contact Lens Fitting
  - Test data flow: Refraction → Spectacle Dispensing
  - Test data flow: Visual Acuity → Color Vision → Contrast Sensitivity → Visual Field Screening (complete screening workflow)

#### Wednesday (Day 8) - Core Suite Integration & Polish
**All Developers - Integration Day**
- [ ] **9:30 AM - 12:00 PM**: Merge all Week 2 PRs
- [ ] **1:00 PM - 3:00 PM**: Build complete examination workflow
  ```tsx
  // src/app/dashboard/examination/complete-exam/page.tsx
  // Step-by-step wizard through all 12 modules
  Step 1: Visual Acuity → Step 2: Retinoscopy → Step 3: Refraction → ...
  → Step 12: Contact Lens/Spectacle Dispensing
  ```
- [ ] **3:00 PM - 5:00 PM**: Build examination summary dashboard
  - Show all 12 modules in card grid
  - Click any card to drill into full module
  - Export complete report (PDF with all 12 modules)

#### Thursday (Day 9) - Testing & Documentation
**Developer 1 & 2 - Unit Testing**
- [ ] Write unit tests for all 12 core modules (80% coverage minimum)
- [ ] Test edge cases:
  - Invalid IOP values (negative, >50)
  - Invalid refraction (sphere >20D)
  - Missing data handling

**Developer 3 - Integration Testing**
- [ ] Test complete patient examination workflow (end-to-end)
- [ ] Test data persistence (save, reload, edit)
- [ ] Test multi-user scenario (2 doctors examining different patients)

**Developer 4 - Documentation**
- [ ] Create user guide for Core Examination Suite
- [ ] Create developer documentation (how to add new exam module)
- [ ] Create API documentation for examination endpoints
- [ ] Record video demo (10 min) of complete examination workflow

#### Friday (Day 10) - Week 2 Demo & Phase 1A Completion
**10:00 AM - 11:30 AM - Phase 1A Demo**
- [ ] Demo complete Core Examination Suite (all 12 modules)
- [ ] Demo to: Hospital Admin, Chief Ophthalmologist, 2-3 Optometrists
- [ ] Collect clinical feedback
- [ ] Identify any critical bugs or missing features

**11:30 AM - 12:30 PM - Retrospective**
- [ ] Review what worked well in Weeks 1-2
- [ ] Identify bottlenecks
- [ ] Plan improvements for Phase 1B

**1:00 PM - 5:00 PM - Phase 1A Hardening**
- [ ] Fix critical bugs from demo feedback
- [ ] Polish UI/UX (loading states, error messages, animations)
- [ ] Prepare for Phase 1B (clinical specialty modules)

**EOD Week 2 - Milestone M0 Achieved ✅**
- [ ] All 12 core examination modules complete
- [ ] ALL 43 clinical roles can now perform basic eye exams
- [ ] Core Suite tested and demo'd to stakeholders
- [ ] Ready to build specialty modules on top of this foundation

---

## Phase 1B: Clinical Specialty Departments (Weeks 3-5)
**Goal**: Add specialty-specific modules on top of Core Suite + Doctor's Desk  
**Effort**: 18 developer-weeks (3.6 devs × 5 weeks)  
**Output**: 1 Doctor's Desk hub + 8 clinical specialty dashboards (Retina, Cornea, Glaucoma, Cataract, Pediatric, Neuro, Oculoplasty, Low Vision)

**Phase 1B Status**: ✅ Module 1-3 Complete | 🟡 Module 4 In Progress | ⏳ Modules 5-9 Pending

### ✅ Module 1: Doctor's Desk (COMPLETE - January 27, 2026)
**Purpose**: Central hub where ophthalmologists review optometry data, perform clinical examination, and route patients to treatment pathways

**Components Implemented** (1,950 lines):
1. ✅ **PatientQueuePage.tsx** (450 lines) - Patient waiting list with urgency sorting, red flags, statistics
2. ✅ **DoctorDeskPage.tsx** (300 lines) - Individual patient examination interface with Phase 1A data review
3. ✅ **DoctorExaminationForm.tsx** (1,200 lines) - Comprehensive clinical examination form (History, Slit Lamp, Fundus, Diagnosis, Treatment)

**Features Delivered**:
- Patient queue management with urgency-based sorting (Emergency > Urgent > Routine)
- Red flag detection system (sudden vision loss, high IOP, visual field defects)
- Phase 1A optometry data review (VA, Refraction, IOP, Keratometry, Pachymetry)
- 5-section clinical examination (History, Slit Lamp, Fundus, Diagnosis, Treatment)
- Multi-pathway treatment routing:
  - Medical Management → Pharmacy (Phase 2)
  - Optical Prescription → Spectacle/Contact Lens (Phase 1A)
  - Specialty Referral → 8 Specialty Clinics (Phase 1B Modules 2-9)
  - Surgery Recommendation → Counselor (Phase 2)
  - Investigations → Imaging (Phase 2)

**Integration Points**:
- Reads ALL Phase 1A examination data (12 modules)
- Routes to Phase 1A optical modules (Spectacles, Contact Lens)
- Routes to Phase 1B specialty clinics (Retina, Glaucoma, Cataract, etc.)
- Prepared for Phase 2 routing (Pharmacy, Surgery, Imaging)

**Sidebar Navigation**: ✅ Added "Doctor's Desk" section with "Patient Queue" menu item

---

### ✅ Module 2: Retina Clinic (COMPLETE - January 27, 2026)
**Purpose**: Diabetic retinopathy management, anti-VEGF therapy, fundus photography, and macular disease tracking

**Components Implemented** (2,200 lines):
1. ✅ **RetinaClinicPage.tsx** (450 lines) - Patient queue dashboard with DR grading overview
2. ✅ **RetinaExaminationPage.tsx** (350 lines) - Individual patient retina examination interface
3. ✅ **DRGradingForm.tsx** (900 lines) - ETDRS diabetic retinopathy classification system
4. ✅ **AntiVEGFManagement.tsx** (350 lines) - Anti-VEGF injection tracking and scheduling
5. ✅ **FundusImageGallery.tsx** (150 lines) - Fundus photography image gallery

**Features Delivered**:

**Dashboard (RetinaClinicPage)**:
- Statistics Cards: Total Patients (24), Urgent Cases (3), Injections Today (8), New DR Cases (2)
- Quick Actions: Anti-VEGF Schedule, Fundus Gallery, OCT Scans, DR Reports
- Patient Queue with clinical summary grid: DR Grade, Visual Acuity (OD/OS), CME Status, Last Visit, Next Injection
- Color-coded urgency badges (Emergency, Urgent, Routine)
- Navigation to individual patient examination

**DR Grading Form (ETDRS Classification)**:
- **6 DR Severity Levels** per eye: No DR → Mild NPDR → Moderate NPDR → Severe NPDR → PDR → Advanced PDR
- **DME Classification**: Absent, Non-Center Involving, Center-Involving
- **11 Retinal Findings** per eye (OD/OS):
  - Standard findings: Microaneurysms, Dot/Blot Hemorrhages, Hard Exudates, Cotton Wool Spots, IRMA, Venous Beading
  - Critical findings (red-coded): Neovascularization, NVD (Disc), NVE (Elsewhere), Vitreous Hemorrhage, Traction Detachment
- **4-2-1 Rule** for Severe NPDR detection (Hemorrhages in 4 quadrants, Venous beading in 2+ quadrants, IRMA in 1+ quadrant)
- **Treatment Plan** checkboxes: Observation, Medical Management, Anti-VEGF, Laser PRP, Focal Laser, Vitrectomy
- Follow-up interval selector (1 week to 1 year)
- Previous DR grade comparison alert

**Anti-VEGF Management**:
- **Lifetime injection counter** across all visits
- **Eye selection**: OD, OS, OU
- **5 Anti-VEGF drugs**: Ranibizumab (Lucentis), Bevacizumab (Avastin), Aflibercept (Eylea), Brolucizumab (Beovu), Faricimab (Vabysmo)
- **Dose entry** (default 0.5mg)
- **Pre-injection assessment grid**: VA OD, VA OS, IOP OD, IOP OS
- **Post-injection assessment grid** (1 week follow-up): VA OD, VA OS, IOP OD, IOP OS
- **Injection protocols**: Monthly PRN, Treat & Extend, Fixed Monthly, Bimonthly
- **Next injection date picker**
- **Complications tracker**: Endophthalmitis, retinal detachment, hemorrhage, etc.

**Fundus Image Gallery**:
- 3-column responsive grid layout
- Eye-coded badges (OD=blue, OS=green)
- Image metadata (date, type, findings)
- Upload functionality (canEdit permission check)
- Empty state messaging

**Integration Points**:
- Pulls Phase 1A VA data for treatment response tracking
- Integrates with Phase 1A IOP module for pre/post-injection monitoring
- Prepared for Phase 2 OCT integration (macular thickness, RNFL)
- HbA1c tracking for diabetic control correlation

**Sidebar Navigation**: ✅ Added "Specialty Clinics" section header + "Retina Clinic" menu item (Eye icon, CLINICAL:RETINA:VIEW)

---

### ✅ Module 3: Glaucoma Clinic (COMPLETE - January 27, 2026)
**Purpose**: IOP management, visual field progression analysis, gonioscopy assessment, and medication optimization

**Components Implemented** (2,500 lines):
1. ✅ **GlaucomaClinicPage.tsx** (450 lines) - Patient queue dashboard with IOP-based triage
2. ✅ **GlaucomaExaminationPage.tsx** (400 lines) - Individual patient glaucoma examination interface
3. ✅ **IOPTrackingChart.tsx** (600 lines) - IOP trend visualization with target goal management
4. ✅ **VisualFieldAnalysis.tsx** (700 lines) - Visual field progression analysis and blindness projection
5. ✅ **GonioscopyAssessment.tsx** (600 lines) - Anterior chamber angle grading (Shaffer system)
6. ✅ **GlaucomaMedicationTracker.tsx** (700 lines) - Medication management and MMT detection

**Features Delivered**:

**Dashboard (GlaucomaClinicPage)**:
- Statistics Cards: Total Patients (18), High IOP >21 (3), VF Progression (2), New Diagnoses (1)
- Quick Actions: IOP Trends, Visual Fields, Gonioscopy, Medications
- **Target IOP-Based Color Coding** (intelligent alert system):
  - Red: IOP >Target + 6 mmHg (critical intervention needed)
  - Orange: IOP >Target + 3 mmHg (urgent adjustment needed)
  - Green: IOP ≤Target (at goal ✓)
  - Yellow: IOP >Target but <+3 mmHg (caution, monitor closely)
- Patient Queue Clinical Summary: IOP (OD/OS), Target IOP, C/D Ratio, Mean Deviation (MD), Medications
- 3 mock patients covering different glaucoma types: POAG, NTG, AACG
- Navigation to individual patient examination

**IOP Tracking Chart**:
- **Line chart** with dual bars (OD=blue, OS=green) showing IOP over time
- **Target IOP reference line** (dashed red, horizontal)
- **CCT Correction Toggle** (pachymetry-adjusted IOP: ±0.7 mmHg per 10 microns from 545)
- **Time period selector**: 3 months, 6 months, 1 year, All
- **Medication change markers** on timeline (vertical events)
- **Statistics panel**:
  - Average IOP (OD/OS)
  - % At Goal (≤Target IOP)
  - IOP Fluctuation (max - min range)
- **Clinical interpretation alerts**:
  - Poor IOP Control: <50% at goal → Escalate therapy or surgery
  - High Fluctuation: >10 mmHg range → Check compliance, 24-hour IOP monitoring
- Export to PDF button

**Visual Field Analysis**:
- **Current Status Cards**: MD, VFI, PSD, Severity (Early/Moderate/Severe) for OD/OS
- **GHT Results** (Glaucoma Hemifield Test): Within/Borderline/Outside Normal Limits
- **Test Reliability Indices**: False Positives, False Negatives, Fixation Losses per eye
- **MD Progression Chart**: Line graph with severity zones (green/yellow/orange/red)
- **Progression Analysis**:
  - **MD Slope** (dB/year) with trend indicators (TrendingDown/TrendingUp icons)
  - **VFI Slope** (%/year) 
  - **Time to 0% VFI** projection (if progressing)
- **Clinical Recommendations**:
  - Rapid Progression (<-1 dB/year): Escalate therapy, laser/surgery, test every 3-4 months
  - Moderate Progression (-0.5 to -1 dB/year): Re-evaluate treatment, test every 4-6 months
  - Stable: Continue current treatment, annual monitoring
- Visual Field Map placeholder (gray-scale, pattern deviation - Phase 2 device integration)

**Gonioscopy Assessment (Shaffer Grading)**:
- **Quadrant-by-quadrant grading** (Superior, Inferior, Nasal, Temporal) for OD/OS
- **Shaffer Classification**: Grade 0 (Closed 0°) → Grade 1 (10°) → Grade 2 (20°) → Grade 3 (30°) → Grade 4 (40°)
- **Pigmentation levels**: None, Mild, Moderate, Heavy
- **PAS tracking** (Peripheral Anterior Synechiae): Present/Absent with clock hours
- **Iris Configuration**: Steep, Regular, Plateau
- **NVA checkbox** (Neovascularization of Angle - critical for neovascular glaucoma)
- **Schwalbe's Line visibility**, **Angle Recession** (trauma)
- **Automated Risk Assessment Algorithm**:
  - **High Risk - Angle Closure**: ≥2 closed quadrants or ≥1 closed + PAS → Urgent LPI indicated
  - **Moderate Risk - Narrow Angles**: ≥3 narrow quadrants or ≥2 narrow + Plateau iris → Consider LPI
  - **High Risk - Neovascular Glaucoma**: NVA present → Urgent PRP + anti-VEGF + drainage device if uncontrolled
  - **Low Risk - Open Angles**: Routine glaucoma management
- Color-coded angle grade badges (red to blue scale)

**Glaucoma Medication Tracker**:
- **Active Medications Table**:
  - Drug Name, Class, Eye (OD/OS/OU), Dosage, Frequency (QD/BID/TID/QID), Start Date, IOP Reduction, Compliance %, Side Effects
- **5 Drug Classes**:
  - Prostaglandin analogs (Latanoprost, Travoprost, Bimatoprost, Tafluprost)
  - Beta-blockers (Timolol, Betaxolol, Levobunolol, Carteolol)
  - Alpha-agonists (Brimonidine, Apraclonidine)
  - Carbonic anhydrase inhibitors (Dorzolamide, Brinzolamide, Acetazolamide)
  - Combination drops (Cosopt, Combigan, Simbrinza)
- **Summary Statistics**:
  - Active Medications count
  - Average Compliance %
  - Total IOP Reduction (estimated)
  - Monthly Cost (₹ estimation)
- **MMT Alert** (Maximum Medical Therapy ≥3 drugs):
  - Red alert box with surgical options: SLT, Trabeculectomy, Glaucoma Drainage Device, MIGS
- **Medication Timeline** visualization (horizontal bars showing duration)
- **Compliance tracking** (color-coded: Green ≥80%, Yellow 60-79%, Red <60%)
- **Side Effects monitoring** per drug
- **Contraindications checker**: Beta-blockers (asthma, COPD, bradycardia), Alpha-agonists (cardiovascular disease), CAIs (kidney stones), Prostaglandins (iris pigmentation)
- **Next Medication Suggestions**: Based on current regimen and IOP control

**Integration Points**:
- Pulls Phase 1A IOP data from Tonometry module for historical trend analysis
- CCT values from Pachymetry module for IOP correction
- Visual field baseline from Phase 1A Amsler Grid/Confrontation testing
- Prepared for Phase 2 OCT RNFL integration (structural progression)
- Prepared for Phase 2 perimetry device integration (automated visual field import)

**Sidebar Navigation**: ✅ Added "Glaucoma Clinic" menu item to Specialty Clinics section (Droplet icon, CLINICAL:GLAUCOMA:VIEW)

---

### 🟡 Module 4: Cataract Clinic (IN PROGRESS - January 27, 2026)
**Purpose**: LOCS III cataract grading, IOL power calculation (multi-formula), biometry integration, and surgery workflow management

**Planned Components** (~2,800 lines estimated):
1. ⏳ **CataractClinicPage.tsx** (~450 lines) - Patient queue dashboard with surgery readiness indicators
2. ⏳ **CataractExaminationPage.tsx** (~400 lines) - Individual patient cataract assessment interface
3. ⏳ **LOCSIIIGradingForm.tsx** (~800 lines) - Lens Opacities Classification System III grading
4. ⏳ **IOLCalculator.tsx** (~800 lines) - Multi-formula IOL power calculator (SRK-T, Barrett Universal II, Haigis, Holladay)
5. ⏳ **BiometryIntegration.tsx** (~600 lines) - Biometry data entry and device integration
6. ⏳ **SurgeryWorkflow.tsx** (~700 lines) - Pre-op checklist, surgery scheduling, post-op tracking

**Features to Implement**:

**Dashboard (CataractClinicPage)**:
- Statistics: Total Patients, Surgery Pending, IOL Calculated, Biometry Done
- Quick Actions: IOL Calculator, Surgery Schedule, Biometry Queue, Post-Op Reviews
- Patient Queue with clinical summary: LOCS III Grade, Visual Acuity, IOL Power, Surgery Date
- Surgery readiness indicators (all pre-op steps completed ✓)
- Color-coded priority (mature cataract, only eye, visual rehabilitation needed)

**LOCS III Grading Form**:
- **4 Categories** for each eye (OD/OS):
  - **Nuclear Opalescence** (NO): Grade 0.1-6.9 (increment 0.1)
  - **Nuclear Color** (NC): Grade 0.1-6.9 (increment 0.1)
  - **Cortical Cataract** (C): Grade 0.1-5.9 (percentage of cortical involvement)
  - **Posterior Subcapsular Cataract** (P): Grade 0.1-5.9 (percentage of PSC)
- Visual reference images for each grade
- Overall cataract severity: Early (<2.0), Moderate (2.0-4.0), Advanced (>4.0)
- Surgical indication checkbox (VA <6/18, glare disability, patient desire)
- Pupil dilation status (pre-op requirement)
- Lens diagram with opacity mapping

**IOL Power Calculator** (CRITICAL COMPONENT):
- **Input Fields**:
  - Axial Length (AL) in mm (from biometry)
  - K1 (flattest keratometry) in D
  - K2 (steepest keratometry) in D
  - Average K (auto-calculated)
  - Anterior Chamber Depth (ACD) in mm
  - Lens Thickness (LT) in mm (for Haigis formula)
  - White-to-White (WTW) in mm
  - Patient Age
  - Target Refraction: Plano (distance), -1.0D (intermediate), -2.5D (near)
- **IOL Calculation Formulas** (multi-formula comparison):
  - **SRK-T** (standard, good for average AL 22-26mm)
  - **Barrett Universal II** ⭐ (gold standard, best overall accuracy)
  - **Haigis** (good for short/long eyes)
  - **Holladay 1** (good for average eyes)
  - **Hoffer Q** (best for short eyes <22mm)
  - **Optional: T2, Olsen, Hill-RBF** (premium formulas)
- **IOL Power Table Output**:
  - Recommended IOL power for target refraction
  - ± 0.5D, ± 1.0D, ± 1.5D options
  - Expected post-op refraction for each power
  - Show all formulas side-by-side for comparison
- **Toric IOL Calculator** (for astigmatism correction):
  - Corneal astigmatism calculation
  - Surgically induced astigmatism (SIA) adjustment
  - Toric IOL power + axis recommendation
- **Premium IOL Options**:
  - Monofocal (standard)
  - Multifocal (distance + near)
  - Extended Depth of Focus (EDOF)
  - Toric (astigmatism correction)
- **IOL Constant Management**: A-constant, Surgeon Factor adjustments
- **Validation Warnings**:
  - AL <20mm or >26mm: Use Hoffer Q or Barrett
  - High K (>48D) or Low K (<40D): Double-check measurements
  - High astigmatism (>1.5D): Consider toric IOL

**Biometry Integration**:
- **Manual Data Entry** (when device not connected):
  - Optical biometry (IOLMaster, Lenstar)
  - A-scan ultrasound biometry
  - Enter AL, K1, K2, ACD, LT, WTW, pupil size
- **Device Integration** (future Phase 2):
  - Auto-import from IOLMaster 700, Lenstar LS900
  - Show measurement quality indicators
- **Biometry Validation**:
  - Compare OD vs OS (flag if AL difference >0.3mm - possible error)
  - Check for axial length outliers
  - Verify keratometry matches manual keratometry from Phase 1A
- **Historical Biometry Tracking**: Show previous measurements, detect progression (rare but important for axial myopia)

**Surgery Workflow**:
- **Pre-Op Checklist** (must complete before surgery):
  - [ ] Visual Acuity documented
  - [ ] LOCS III grading done
  - [ ] Biometry completed
  - [ ] IOL power calculated
  - [ ] IOL ordered and in stock (link to IOL Inventory - Phase 2)
  - [ ] Dilated fundus exam (rule out retinal pathology)
  - [ ] IOP measured (Phase 1A integration)
  - [ ] Informed consent signed
  - [ ] Anesthesia clearance (medical fitness)
  - [ ] Pre-op medications prescribed (dilating drops, antibiotics)
- **Surgery Scheduling** (integrate with Phase 3 OT Management):
  - Book OT slot (date, time, surgeon, anesthetist)
  - Equipment checklist: Phaco machine, IOL, viscoelastic, BSS, cannulas
  - Nursing staff assignment
  - Confirm patient arrival time
- **Intra-Op Notes** (brief surgery summary):
  - Surgery type: Phacoemulsification, ECCE, SICS, Femto-assisted
  - IOL implanted (manufacturer, model, power)
  - Complications: PCR, zonular dialysis, vitreous loss, dropped nucleus
  - Surgeon notes
- **Post-Op Review Schedule**:
  - **Day 1**: VA, IOP, anterior chamber reaction, wound integrity
  - **Week 1**: VA improvement, refraction (early), IOP check
  - **Month 1**: Final VA, refraction (stable), IOP, fundus exam
  - **Month 3**: Final refraction, check for complications (PCO, CME, endophthalmitis)
- **Post-Op Complications Tracking**:
  - Posterior Capsule Opacification (PCO) - most common, treated with YAG laser
  - Cystoid Macular Edema (CME) - treated with NSAIDs, steroids
  - Endophthalmitis - emergency, requires vitrectomy + intravitreal antibiotics
  - Retinal Detachment - surgical emergency
  - Refractive Surprise - residual refractive error (may need glasses or IOL exchange)
- **YAG Laser Capsulotomy Tracker** (for PCO treatment):
  - Date, energy, number of shots
  - Post-YAG VA improvement
  - Post-YAG IOP spike monitoring

**Integration Points**:
- Pulls Phase 1A Keratometry data for IOL calculation
- Pulls Phase 1A VA data for pre/post-op comparison
- Pulls Phase 1A IOP data for post-op IOP spike monitoring
- Links to Phase 2 IOL Inventory for stock management
- Links to Phase 3 OT Management for surgery scheduling
- Prepared for Phase 2 biometry device integration (auto-import)
- Prepared for Phase 2 OCT integration (macular pathology screening)

**Sidebar Navigation**: ⏳ To be added - "Cataract Clinic" menu item to Specialty Clinics section (Layers icon, CLINICAL:CATARACT:VIEW)

---

### Week 3: Retina & Cornea Specialty Clinics

#### Monday (Day 11) - Retina Department Foundation
**Developer 1 (Leads Retina) - Fundus Viewer Component**
- [ ] **9:30 AM - 12:00 PM**: Research image viewer libraries
  - Cornerstone.js (DICOM viewer)
  - OpenSeadragon (high-res image viewer)
  - Custom canvas-based viewer
- [ ] **1:00 PM - 5:00 PM**: Build FundusPhotographyViewer component
  ```tsx
  <FundusPhotographyViewer 
    imageUrl={fundusImageUrl}
    annotations={annotations} // DR grading, lesions, hemorrhages
    zoomable={true}
    comparisons={[previousImage]} // side-by-side comparison
  />
  ```
- [ ] **EOD**: Create PR

**Developer 2 (Supports Retina) - Retina Dashboard Structure**
- [ ] **9:30 AM - 12:00 PM**: Create module structure
  ```
  src/app/dashboard/clinical/retina/page.tsx
  src/components/clinical/retina/RetinaDashboard.tsx
  src/components/clinical/retina/DRGradingForm.tsx
  src/components/clinical/retina/AntiVEGFScheduler.tsx
  ```
- [ ] **1:00 PM - 5:00 PM**: Build Retina Dashboard layout
  - Patient fundus image gallery
  - Latest diabetic retinopathy (DR) grading
  - Upcoming anti-VEGF injection appointments
  - OCT scans (placeholder for Phase 2)
- [ ] **EOD**: Create PR

**Developer 3 (Leads Cornea) - Cornea Dashboard Structure**
- [ ] **9:30 AM - 12:00 PM**: Create module structure
  ```
  src/app/dashboard/clinical/cornea/page.tsx
  src/components/clinical/cornea/CorneaDashboard.tsx
  src/components/clinical/cornea/SlitLampFindings.tsx
  src/components/clinical/cornea/TopographyViewer.tsx (placeholder)
  ```
- [ ] **1:00 PM - 5:00 PM**: Build Slit Lamp Findings interface
  - Cornea, Conjunctiva, Anterior chamber depth
  - Lens (cataract grading: LOCS III)
  - Anterior segment photo upload
- [ ] **EOD**: Create PR

**Developer 4 - Shared Clinical Components**
- [ ] **9:30 AM - 5:00 PM**: Build reusable clinical components
  - **AppointmentScheduler.tsx** (generic, reused by retina, cornea, glaucoma)
  - **PatientHistoryTimeline.tsx** (shows all visits chronologically)
  - **ImageGalleryGrid.tsx** (for fundus, slit lamp, OCT images)
- [ ] **EOD**: Create PR

#### Tuesday-Thursday (Days 12-14) - Complete Retina & Cornea
**Developer 1 - Retina Module Features**
- [ ] Diabetic Retinopathy Grading Form (ETDRS classification)
  - No DR, Mild NPDR, Moderate NPDR, Severe NPDR, PDR
  - Macular edema: Absent, Present (non-center-involving), Present (center-involving)
- [ ] Anti-VEGF Injection Scheduler
  - Injection history (drug, date, eye)
  - Schedule next injection (monthly, PRN protocol)
  - Track visual acuity response
- [ ] Laser Photocoagulation Records
  - Panretinal photocoagulation (PRP)
  - Focal/grid laser for macular edema
  - Number of spots, power, duration
- [ ] Integration with Fundus Imaging (Phase 2 prep)

**Developer 2 - Retina Module Testing & Polish**
- [ ] Unit tests for DR grading logic
- [ ] Integration tests: Patient → Fundus images → DR grading → Anti-VEGF schedule
- [ ] Permission checks: `CLINICAL:RETINA:VIEW`, `CLINICAL:RETINA:EDIT`

**Developer 3 - Cornea Module Features**
- [ ] Corneal Topography Viewer (placeholder - full implementation in Phase 2)
  - Show topography maps (if available)
  - Manual keratoconus grading (Amsler-Krumeich)
- [ ] Keratoconus Progression Tracking
  - K-max value over time
  - Thickness at thinnest point
- [ ] Contact Lens Fitting Records (integrate with Core Suite contact lens module)
- [ ] Corneal Transplant Registry
  - PKP, DALK, DSAEK, DMEK
  - Donor cornea details
  - Post-op follow-up schedule

**Developer 4 - Navigation & Integration**
- [ ] Update sidebar: Add Retina, Cornea to Clinical Departments section
- [ ] Create specialty dashboard selector
  ```tsx
  // src/app/dashboard/clinical/page.tsx
  // Shows all 8 specialty departments as cards
  // Click to navigate to specific specialty
  ```
- [ ] Test integration: Core Suite → Retina/Cornea modules

#### Friday (Day 15) - Week 3 Demo
**10:00 AM - 11:00 AM - Week 3 Demo**
- [ ] Demo Retina Department (Fundus viewer, DR grading, Anti-VEGF scheduler)
- [ ] Demo Cornea Department (Slit lamp findings, Keratoconus tracking, Transplant registry)
- [ ] Demo to: Retina Specialist, Cornea Specialist, Hospital Admin

---

### Week 4: Glaucoma & Cataract Surgery

#### Monday-Wednesday (Days 16-18) - Glaucoma Department
**Developer 1 - IOP Tracking & Visual Field Integration**
- [ ] Build IOP Trend Chart (enhanced version of Core Suite tonometry)
  ```tsx
  <IOPTrendChart 
    iopHistory={iopData} 
    medications={glaucomaMeds}
    surgeries={glaucomaSurgeries}
  />
  ```
  - Show IOP over time (line chart)
  - Overlay medication changes (vertical markers)
  - Overlay surgeries (trabeculectomy, tube shunt)
  - Target IOP line (customizable per patient)
- [ ] Visual Field Progression Analysis
  - Import perimetry results (placeholder for device integration)
  - Show visual field progression over time
  - Mean deviation (MD), pattern standard deviation (PSD)
  - Glaucoma Hemifield Test (GHT) results

**Developer 2 - Glaucoma Medication & Surgery Management**
- [ ] Glaucoma Medication Tracker
  - Current medications (eye drops, oral)
  - Compliance tracking
  - Side effects monitoring
- [ ] Glaucoma Surgery Scheduler
  - Trabeculectomy, tube shunt, laser (SLT, ALT)
  - Pre-op assessment checklist
  - Post-op IOP monitoring protocol

**Developer 3 - Cataract Surgery Dashboard**
- [ ] Create module structure
  ```
  src/app/dashboard/clinical/cataract/page.tsx
  src/components/clinical/cataract/CataractDashboard.tsx
  src/components/clinical/cataract/IOLCalculator.tsx (CRITICAL)
  src/components/clinical/cataract/BiometryIntegration.tsx
  src/components/clinical/cataract/SurgeryWorkflow.tsx
  ```
- [ ] Build IOL Power Calculator (most complex component)
  - Input: Axial length (AL), K1, K2, ACD (from biometry)
  - Formulas: SRK-T, Holladay 1, Haigis, **Barrett Universal II** (gold standard)
  - Output: Recommended IOL power for target refraction (plano, -1.0, -2.5)
  - Show multiple IOL options (± 0.5D, ± 1.0D)

**Developer 4 - Cataract Pre-Op & Post-Op**
- [ ] Pre-Op Assessment Checklist
  - Visual acuity
  - IOP
  - Dilated fundus examination
  - Biometry done? ✓
  - IOL power calculated? ✓
  - Consent signed? ✓
  - Anesthesia clearance? ✓
  - Medications (dilating drops, antibiotics)
- [ ] Surgery Scheduler (integrate with OT Management in Phase 3)
  - Book OT slot
  - Assign surgeon, anesthetist, OT nurse
  - Equipment checklist (phaco machine, IOL, viscoelastic)
- [ ] Post-Op Review Tracking
  - Day 1, Week 1, Month 1, Month 3 reviews
  - Visual acuity improvement
  - Complications (PCO, endophthalmitis, CME)

#### Thursday-Friday (Days 19-20) - Testing & Demo
**All Developers - Integration Testing**
- [ ] Test Glaucoma workflow: IOP measurement (Core Suite) → IOP Trend (Glaucoma) → Medication adjustment → Surgery if needed
- [ ] Test Cataract workflow: Keratometry (Core Suite) → Biometry (Phase 2 placeholder) → IOL Calculator → Surgery Scheduler → Post-op review

**10:00 AM - 11:00 AM - Week 4 Demo**
- [ ] Demo Glaucoma Department
- [ ] Demo Cataract Surgery Management (especially IOL calculator)
- [ ] Demo to: Glaucoma Specialist, Cataract Surgeon, OT Coordinator

---

### Week 5: Pediatric, Neuro-Ophthalmology, Oculoplasty, Low Vision

#### Monday-Tuesday (Days 21-22) - Pediatric Ophthalmology
**Developer 1 - Strabismus Assessment**
- [ ] Hirschberg test (corneal light reflex)
- [ ] Cover test (uncover, alternate cover)
- [ ] Prism cover test (measure deviation in prism diopters)
- [ ] Angle of deviation chart (esotropia, exotropia, hypertropia, hypotropia)

**Developer 2 - Amblyopia & Orthoptics**
- [ ] Amblyopia tracking
  - Visual acuity improvement over time
  - Patching compliance log
  - Atropine penalization protocol
- [ ] Orthoptic Exercises Log
  - Near point of convergence (NPC)
  - Accommodation exercises
  - Vergence training
  - Parent/patient compliance tracking

**Developer 3 - Neuro-Ophthalmology Module**
- [ ] Visual Field Defects Mapping
  - Hemianopia, quadrantanopia, altitudinal defects
  - Integration with visual field screening (Core Suite)
- [ ] Pupil Reaction Testing
  - Direct, consensual light reflex
  - Relative afferent pupillary defect (RAPD)
  - Anisocoria measurement
- [ ] Cranial Nerve Assessment
  - CN II-VII examination findings
  - Extraocular muscle movements (H-test)

**Developer 4 - Oculoplasty & Low Vision**
- [ ] Oculoplasty Module:
  - Eyelid surgery registry (ptosis repair, ectropion, entropion, blepharoplasty)
  - Ptosis grading (margin-reflex distance, levator function)
  - Orbital imaging integration (CT/MRI upload placeholder)
  - Lacrimal duct procedures (DCR, probing)
- [ ] Low Vision Module:
  - Low vision devices registry (magnifiers, telescopes, CCTV)
  - Magnification aids tracking (dispensed, returned)
  - Rehabilitation plan management
  - Activities of Daily Living (ADL) assessment

#### Wednesday-Friday (Days 23-25) - Integration, Testing, Phase 1B Demo
**All Developers - Final Integration & Testing**
- [ ] **Day 23**: Merge all specialty modules, integration testing
- [ ] **Day 24**: Bug fixes, UI polish, documentation
- [ ] **Day 25 Morning**: Final testing, demo prep

**2:00 PM - 4:00 PM - Phase 1B Completion Demo (Friday, Day 25)**
- [ ] Demo all 8 clinical specialty departments
- [ ] Demo integration with Core Examination Suite
- [ ] Demo to: All department heads (Retina, Cornea, Glaucoma, Cataract, Pediatric, Neuro, Oculoplasty specialists), Hospital Admin, Chief Ophthalmologist
- [ ] Collect feedback for refinements

**EOD Week 5 - Milestone M1 Achieved ✅**
- [ ] 8 clinical department dashboards complete
- [ ] 35+ specialty role workflows enabled
- [ ] Integration with Core Suite validated
- [ ] Ready for Phase 2 (Diagnostic & Imaging)

---

## Phase 2: Diagnostic & Imaging Services (Weeks 6-8)
**Goal**: Connect imaging workflows to clinical modules  
**Effort**: 12 developer-weeks  
**Output**: 6 diagnostic modules + integration with clinical departments

---

### Week 6: IOL Inventory & Fundus Imaging

#### Monday-Wednesday (Days 26-28) - IOL Inventory Management
**Developer 3 (Leads Operations) - IOL Inventory Module**
- [ ] Create module structure
  ```
  src/app/dashboard/diagnostic/iol-inventory/page.tsx
  src/components/operations/IOLInventoryDashboard.tsx
  src/components/operations/IOLStockManagement.tsx
  src/components/operations/SupplierOrderForm.tsx
  ```
- [ ] Build IOL Inventory Dashboard
  - Stock levels by IOL power (-10.0D to +30.0D, 0.5D steps)
  - Stock by manufacturer (Alcon, J&J Vision, Zeiss, Bausch+Lomb)
  - IOL type: Monofocal, Toric, Multifocal, EDOF
  - Expiry date alerts
  - Low stock alerts (< 2 units per power)
- [ ] IOL Power Distribution Chart
  - Bar chart showing stock count per power
  - Highlight most commonly used powers (typically +20 to +24)
- [ ] Surgeon Preference Tracking
  - Which IOL model each surgeon prefers
  - Auto-suggest IOL during cataract surgery planning
- [ ] Integration with Cataract Surgery Module (Week 4)
  - When IOL power calculated → check if in stock
  - Reserve IOL for scheduled surgery
  - Mark as "used" after surgery

**Developer 1 & 2 - Fundus Imaging Workflow**
- [ ] Create module structure
  ```
  src/app/dashboard/diagnostic/fundus-imaging/page.tsx
  src/components/diagnostic/FundusPhotographyWorkflow.tsx
  src/components/diagnostic/FundusImageArchival.tsx
  src/components/diagnostic/FundusImageViewer.tsx (enhanced from Week 3)
  ```
- [ ] Build Fundus Photography Workflow
  - Patient selection
  - Image capture (upload from fundus camera)
  - 7-field diabetic retinopathy imaging protocol
  - Macula-centered, optic disc-centered images
  - Stereo photography for optic nerve head assessment
- [ ] AI-Assisted DR Grading Integration (placeholder)
  - Upload image → AI grades as No DR, Mild NPDR, Moderate NPDR, Severe NPDR, PDR
  - Doctor reviews and confirms/overrides AI grading
  - Integration with Retina Department (Week 3)
- [ ] Before/After Comparison Views
  - Side-by-side comparison of fundus images (different dates)
  - Overlay images with opacity slider
  - Annotation tools (mark hemorrhages, exudates, neovascularization)

**Developer 4 - Report Generation**
- [ ] Build FundusReportGenerator component
  - Include fundus images
  - Include DR grading
  - Include recommendations (follow-up interval, laser, anti-VEGF)
  - Export to PDF
- [ ] Build IOLInventoryReport component
  - Stock summary
  - Expiry alerts
  - Reorder recommendations
  - Export to Excel

#### Thursday-Friday (Days 29-30) - Testing & Demo
**All Developers**
- [ ] Integration testing: IOL Inventory ↔ Cataract Surgery Module
- [ ] Integration testing: Fundus Imaging ↔ Retina Department
- [ ] Demo to: IOL Coordinator, Fundus Photographer, Retina Specialist, Inventory Manager

---

### Week 7: Retinopathy Screening & Biometry

#### Monday-Wednesday (Days 31-33) - Retinopathy Screening
**Developer 1 & 2 - Retinopathy Screening Module**
- [ ] Create module structure
  ```
  src/app/dashboard/diagnostic/retinopathy-screening/page.tsx
  src/components/diagnostic/RetinopathyGradingForm.tsx
  src/components/diagnostic/ScreeningWorkflow.tsx
  src/components/diagnostic/ReferralGenerator.tsx
  ```
- [ ] Build Diabetic Retinopathy Screening Workflow
  - Patient check-in (diabetic patients only)
  - Fundus photo capture (integrate with Fundus Imaging)
  - AI-assisted grading (or manual grading by screener)
  - ETDRS classification: No DR, Mild, Moderate, Severe NPDR, PDR
  - Maculopathy assessment: Absent, Present
- [ ] Referral Generation
  - Auto-generate referral if:
    - Severe NPDR or PDR detected
    - Macular edema present
    - Ungradable images
  - Referral to: Retina Specialist (from Retina Department)
  - Annual screening reminder (for No DR/Mild NPDR patients)

**Developer 3 - Biometry & IOL Calculation Module**
- [ ] Create module structure
  ```
  src/app/dashboard/diagnostic/biometry/page.tsx
  src/components/diagnostic/BiometryDataEntry.tsx
  src/components/diagnostic/BiometryCalculator.tsx
  src/components/diagnostic/IOLFormulaSelector.tsx
  ```
- [ ] Build Biometry Data Entry
  - Axial Length (AL) - mm
  - Keratometry (K1, K2) - D (auto-populate from Core Suite Keratometry)
  - Anterior Chamber Depth (ACD) - mm
  - Lens Thickness (LT) - mm
  - White-to-white (WTW) - mm
  - Device: IOLMaster, Lenstar, A-scan ultrasound
- [ ] Build IOL Power Calculator (integrate with Week 4 Cataract module)
  - Formulas:
    - SRK-T (older formula, still used)
    - Holladay 1
    - Haigis
    - **Barrett Universal II** (most accurate for extreme eyes)
    - Hill-RBF (optional)
  - Target refraction: Plano (0.00), -0.50, -1.00, -1.50, -2.00, -2.50
  - Show IOL power ± 0.5D, ± 1.0D for each formula
  - Toric IOL Calculator (if corneal astigmatism >0.75D)
  - Multifocal IOL Assessment (patient suitability checklist)
- [ ] Integration with Cataract Surgery Module
  - Biometry data auto-populates IOL calculator
  - Recommended IOL power transferred to surgery planning

**Developer 4 - A-Constant Library Management**
- [ ] Build A-Constant Manager
  - Store A-constants for different IOL models
  - Allow customization per surgeon (surgeon factor)
  - Import A-constant updates from manufacturers

#### Thursday-Friday (Days 34-35) - Testing & Demo
**All Developers**
- [ ] Integration testing: Biometry → IOL Calculator → Cataract Surgery
- [ ] Integration testing: Retinopathy Screening → Referral → Retina Department
- [ ] Demo to: Retinopathy Screener, Biometry Technician, Cataract Surgeon

---

### Week 8: OCT Imaging & Electrophysiology

#### Monday-Wednesday (Days 36-38) - OCT Imaging Management
**Developer 1 & 2 - OCT Imaging Module**
- [ ] Create module structure
  ```
  src/app/dashboard/diagnostic/oct-imaging/page.tsx
  src/components/diagnostic/OCTScanViewer.tsx
  src/components/diagnostic/RNFLThicknessMap.tsx
  src/components/diagnostic/MacularThicknessAnalysis.tsx
  ```
- [ ] Build OCT Scan Upload & Viewer
  - Upload OCT scans (DICOM or proprietary formats)
  - OCT scan viewer (cross-sectional B-scan display)
  - Layer segmentation: ILM, GCL, IPL, INL, OPL, ONL, RPE
  - Thickness measurement tools
- [ ] RNFL Thickness Mapping (for Glaucoma)
  - TSNIT graph (Temporal, Superior, Nasal, Inferior, Temporal)
  - Quadrant analysis (superior, inferior, nasal, temporal)
  - Comparison to normative database (green = normal, yellow = borderline, red = abnormal)
  - Integration with Glaucoma Department (Week 4)
- [ ] Macular Thickness Analysis (for Retina)
  - ETDRS grid (9 sectors)
  - Central subfield thickness (CST)
  - Detect macular edema (CST >300 μm)
  - Integration with Retina Department (Week 3)
- [ ] Anterior Segment OCT (optional)
  - Angle assessment (for angle-closure glaucoma)
  - Corneal thickness profile (integrate with Pachymetry from Core Suite)

**Developer 3 - Electrophysiology Lab Module**
- [ ] Create module structure
  ```
  src/app/dashboard/diagnostic/electrophysiology/page.tsx
  src/components/diagnostic/ERGVEPWorkflow.tsx
  src/components/diagnostic/WaveformViewer.tsx
  src/components/diagnostic/TestProtocolSelector.tsx
  ```
- [ ] Build ERG (Electroretinography) Testing
  - Flash ERG, Pattern ERG
  - Waveform display (a-wave, b-wave)
  - Amplitude & implicit time measurement
  - Interpretation: Normal, Reduced, Extinguished
  - Diseases: Retinitis pigmentosa, cone dystrophy, CSNB
- [ ] Build VEP (Visual Evoked Potential) Testing
  - Pattern VEP, Flash VEP
  - P100 latency & amplitude
  - Interpretation: Optic neuritis, compressive lesions
- [ ] Build EOG (Electrooculography) Testing (optional)
  - Arden ratio
  - Best vitelliform macular dystrophy diagnosis

**Developer 4 - Integration & Report Generation**
- [ ] Build OCTReportGenerator
  - Include OCT scans
  - Include RNFL/macular thickness analysis
  - Include comparison to previous scans
  - Export to PDF
- [ ] Build ERGVEPReportGenerator
  - Include waveforms
  - Include measurements
  - Include interpretation
  - Export to PDF

#### Thursday-Friday (Days 39-40) - Phase 2 Completion
**All Developers**
- [ ] Integration testing: OCT → Glaucoma Department (RNFL)
- [ ] Integration testing: OCT → Retina Department (Macular thickness)
- [ ] Integration testing: ERG/VEP → Retina Department (hereditary diseases)
- [ ] **Friday 2:00 PM**: Phase 2 Completion Demo
  - Demo all 6 diagnostic modules
  - Demo integration with clinical departments
  - Demo to: Imaging Technician, Lab Manager, Diagnostic Staff

**EOD Week 8 - Milestone M2 Achieved ✅**
- [ ] 6 diagnostic modules complete
- [ ] Imaging workflows integrated with clinical modules
- [ ] Biometry → Cataract Surgery workflow validated
- [ ] Ready for Phase 3 (Operations)

---

## Phase 3: Operations & Hospital Services (Weeks 9-11)
**Goal**: Complete operational workflows for hospital management  
**Effort**: 10 developer-weeks  
**Output**: 7 operational modules

---

### Week 9: OT Management & CSSD

#### Monday-Wednesday (Days 41-43) - OT Management
**Developer 3 (Leads Operations) - OT Management Module**
- [ ] Create module structure
  ```
  src/app/dashboard/operations/ot-management/page.tsx
  src/components/operations/OTScheduler.tsx
  src/components/operations/SurgeryList.tsx
  src/components/operations/EquipmentTracker.tsx
  src/components/operations/SterilizationLog.tsx
  ```
- [ ] Build Surgery Scheduler
  - OT slot booking (morning list: 8 AM - 1 PM, afternoon list: 2 PM - 6 PM)
  - Assign surgeon, anesthetist, OT nurse, OT technician
  - Surgery type: Cataract (phaco), Retina (VR), Glaucoma (trabeculectomy), Cornea (PKP)
  - Estimated duration (cataract: 30 min, VR: 90 min, etc.)
  - Conflict detection (surgeon double-booked, OT already occupied)
- [ ] Build Surgery List View
  - Today's surgery list (morning/afternoon)
  - Tomorrow's list
  - Weekly view
  - Filter by: Surgeon, Surgery type, OT room
- [ ] Build Pre-Op Checklist
  - Patient consent signed ✓
  - Anesthesia clearance ✓
  - Pre-op medications given ✓
  - NBM status confirmed ✓
  - IOL available (for cataract - integrate with IOL Inventory)
  - Equipment ready ✓

**Developer 1 & 2 - OT Equipment & Consumables**
- [ ] Build Equipment Tracker
  - Phacoemulsification machine
  - Vitrectomy machine
  - Surgical microscope
  - Laser (YAG, SLT, PRP)
  - Sterilization status (autoclaved, expiry date)
- [ ] Build Consumables Tracker
  - IOLs used per surgery
  - Viscoelastic usage
  - Surgical blades, sutures
  - Gloves, gowns, drapes
  - Integration with Stores & Inventory (Phase 3, Week 11)
- [ ] Build Post-Op Recovery Notes
  - Patient stable ✓
  - Visual acuity post-op
  - IOP post-op
  - Complications (none, PCR, vitreous loss, etc.)
  - Discharge time

**Developer 4 - CSSD Module**
- [ ] Create module structure
  ```
  src/app/dashboard/operations/cssd/page.tsx
  src/components/operations/SterilizationCycleTracker.tsx
  src/components/operations/InstrumentSetManagement.tsx
  src/components/operations/BiologicalIndicatorLog.tsx
  ```
- [ ] Build Sterilization Cycle Tracker
  - Autoclave cycles (date, time, temperature, pressure)
  - Load contents (instrument sets, linens, drapes)
  - Biological indicator results (pass/fail)
  - Sterilization expiry tracking (valid for 7 days, 30 days depending on packaging)
- [ ] Build Instrument Set Management
  - Cataract set (phaco handpiece, I/A handpiece, forceps, scissors, etc.)
  - Vitreoretinal set (vitrectomy cutters, endolaser probe, etc.)
  - Glaucoma set (trabeculectomy instruments)
  - Set assignment to surgeries
  - Instrument maintenance log (repairs, replacements)

#### Thursday-Friday (Days 44-45) - Testing & Demo
**All Developers**
- [ ] Integration testing: Cataract Surgery (Week 4) → OT Scheduler → IOL Inventory → CSSD
- [ ] Integration testing: OT Equipment → CSSD Sterilization
- [ ] Demo to: OT Coordinator, OT Manager, OT Technician, CSSD Supervisor

---

### Week 10: Eye Camp Coordination & Ambulance Services

#### Monday-Wednesday (Days 46-48) - Eye Camp Coordination
**Developer 2 & 3 - Eye Camp Module**
- [ ] Create module structure
  ```
  src/app/dashboard/operations/eye-camps/page.tsx
  src/components/operations/CampPlanningCalendar.tsx
  src/components/operations/CampLocationMaster.tsx
  src/components/operations/CampScreeningDataEntry.tsx
  src/components/operations/CampOutcomeReport.tsx
  ```
- [ ] Build Camp Planning Calendar
  - Schedule eye camps (date, location)
  - Location master (villages, schools, industrial sites, slums)
  - Camp type: Screening only, Screening + surgeries
  - Team assignment (doctors, nurses, optometrists, volunteers)
  - Transportation logistics (number of vehicles, drivers)
- [ ] Build Screening Data Entry (Mobile-Friendly)
  - Patient registration (name, age, gender, village)
  - Visual acuity screening (6/6, 6/9, 6/12, 6/18, 6/24, 6/60, <6/60)
  - IOP screening (tonometry)
  - Refraction screening (auto-refractor if available)
  - Cataract grading (immature, mature, hypermature)
  - Surgery eligibility (yes/no)
  - Spectacle prescription
- [ ] Build Camp Outcome Report
  - Total screened
  - Cataracts detected
  - Surgeries performed
  - Spectacles dispensed
  - Follow-up patients (post-op day 1, week 1)
  - Export to Excel/PDF for government reporting (NPCB format)

**Developer 1 - Ambulance Services Module**
- [ ] Create module structure
  ```
  src/app/dashboard/operations/ambulance/page.tsx
  src/components/operations/AmbulanceTripScheduler.tsx
  src/components/operations/DriverRoster.tsx
  src/components/operations/FuelMaintenanceLog.tsx
  ```
- [ ] Build Ambulance Trip Scheduler
  - Patient pickup (from home to hospital)
  - Patient discharge (from hospital to home)
  - Referral transfers (to tertiary hospital)
  - Emergency calls
  - Trip assignment to driver + ambulance vehicle
- [ ] Build Driver Roster
  - Driver availability (day shift, night shift)
  - Driver on-duty log
  - Trip history per driver
- [ ] Build Fuel & Maintenance Log
  - Fuel consumption per trip
  - Vehicle maintenance schedule (service, repairs)
  - Ambulance inspection checklist

**Developer 4 - Volunteer & Donation Management**
- [ ] Build Volunteer Management (for eye camps)
  - Volunteer registration
  - Role assignment (registration, screening assistant, post-op care)
  - Attendance tracking
- [ ] Build Donation Tracking (optional, for camps)
  - Donor details (individuals, corporates, NGOs)
  - Donation amount/kind
  - Utilization tracking (spectacles purchased, medicines procured)

#### Thursday-Friday (Days 49-50) - Testing & Demo
**All Developers**
- [ ] Integration testing: Eye Camp → Patient registration → Screening → Surgery referral → Ambulance transport
- [ ] Mobile testing: Camp Screening Data Entry on tablet/phone
- [ ] Demo to: Eye Camp Coordinator, Outreach Coordinator, Ambulance Coordinator, Social Worker

---

### Week 11: Genetic Counseling, Prosthetics, Social Services

#### Monday-Wednesday (Days 51-53) - Specialized Services
**Developer 1 - Genetic Counseling Module**
- [ ] Create module structure
  ```
  src/app/dashboard/operations/genetic-counseling/page.tsx
  src/components/operations/GeneticPedigreeChart.tsx
  src/components/operations/HereditaryDiseaseRegistry.tsx
  src/components/operations/GeneticTestingCoordination.tsx
  ```
- [ ] Build Genetic Pedigree Chart
  - Family tree visualization (patient, parents, siblings, children)
  - Affected individuals (retinitis pigmentosa, Stargardt, etc.)
  - Carrier status
  - Inheritance pattern (autosomal dominant, recessive, X-linked)
- [ ] Build Hereditary Eye Disease Registry
  - Retinitis pigmentosa (RP)
  - Stargardt disease
  - Cone-rod dystrophy
  - Leber congenital amaurosis (LCA)
  - Best vitelliform macular dystrophy
  - ERG/VEP results (integrate with Electrophysiology from Week 8)
- [ ] Build Genetic Testing Coordination
  - Genetic test order (gene panel, whole exome sequencing)
  - Lab coordination (send sample, track results)
  - Counseling session notes
  - Follow-up tracking

**Developer 2 - Ocular Prosthetics Module**
- [ ] Create module structure
  ```
  src/app/dashboard/operations/prosthetics/page.tsx
  src/components/operations/ProsthesisFittingLog.tsx
  src/components/operations/ProsthesisInventory.tsx
  ```
- [ ] Build Prosthesis Fitting Log
  - Artificial eye fitting records
  - Prosthesis customization (color, size, shape)
  - Patient satisfaction tracking (comfort, appearance)
  - Re-fitting schedule (every 6-12 months)
- [ ] Build Prosthesis Inventory
  - Stock of prosthetic eyes (by size, color)
  - Custom orders (for unusual iris colors, scleral patterns)

**Developer 3 - Social Services & Charity Care Module**
- [ ] Create module structure
  ```
  src/app/dashboard/operations/social-services/page.tsx
  src/components/operations/CharityCareApplication.tsx
  src/components/operations/FinancialAssistanceTracker.tsx
  src/components/operations/GovernmentSchemeIntegration.tsx
  ```
- [ ] Build Charity Care Application
  - Patient financial assessment (income, family size)
  - Free surgery approval workflow (social worker review → admin approval)
  - Partial waiver (50%, 75%, 100%)
  - Donor fund utilization
- [ ] Build Financial Assistance Tracker
  - Total patients assisted per month
  - Total amount waived
  - Donor fund balance
  - Government scheme claims (PM-JAY, state schemes)
- [ ] Build Government Scheme Integration
  - PM-JAY (Ayushman Bharat) eligibility check
  - State schemes (varies by state)
  - Insurance claim submission

**Developer 4 - Integration & Reporting**
- [ ] Build Eye Camp to Hospital Referral Workflow
  - Patients flagged for surgery at camp → transferred to hospital OT scheduler
  - Ambulance coordination for patient transport
  - Follow-up tracking (post-op visits)
- [ ] Build Social Services Report
  - Monthly charity care report
  - Eye camp outcome report (integrate with Week 10)
  - Export to PDF/Excel

#### Thursday-Friday (Days 54-55) - Phase 3 Completion
**All Developers**
- [ ] Integration testing: Eye Camp → Referral → OT Scheduler → Ambulance
- [ ] Integration testing: Charity Care → Free Surgery Approval → OT Scheduler
- [ ] **Friday 2:00 PM**: Phase 3 Completion Demo
  - Demo all 7 operational modules
  - Demo to: Operations team, Hospital Admin, Social Worker

**EOD Week 11 - Milestone M3 Achieved ✅**
- [ ] 7 operational modules complete
- [ ] Eye camp coordination workflow validated
- [ ] OT management integrated with clinical modules
- [ ] Ready for Phase 4 (Advanced Services)

---

## Phase 4: Advanced Services & Digital Health (Weeks 12-14)
**Goal**: Modern digital health capabilities  
**Effort**: 8 developer-weeks  
**Output**: 6 advanced modules

---

### Week 12: Tele-Ophthalmology & Medical Coding

#### Monday-Wednesday (Days 56-58) - Tele-Ophthalmology Portal
**Developer 1 & 2 - Tele-Ophthalmology Module**
- [ ] Create module structure
  ```
  src/app/dashboard/advanced/tele-ophthalmology/page.tsx
  src/components/advanced/TeleConsultationPortal.tsx
  src/components/advanced/RemoteScreeningUpload.tsx
  src/components/advanced/VideoConsultation.tsx
  ```
- [ ] Build Remote Consultation Scheduling
  - Schedule tele-consult (date, time, patient)
  - Assign ophthalmologist
  - Patient notification (SMS, email, WhatsApp)
- [ ] Build Fundus Photo Upload from Peripheral Centers
  - Rural vision technician uploads fundus photo from satellite clinic
  - AI-assisted screening (DR, glaucoma suspect)
  - Store-and-forward model (async review by ophthalmologist)
- [ ] Build E-Prescription Generation
  - Ophthalmologist reviews remote images → creates e-prescription
  - Prescription sent to patient (digital)
  - Prescription sent to peripheral pharmacy (if available)
- [ ] Build Video Consultation Integration (optional)
  - WebRTC-based video call
  - Screen sharing (show fundus images during call)
  - Chat functionality
- [ ] Build Referral to Base Hospital
  - If complex case, generate referral
  - Integrate with Ambulance Services (for patient transport)

**Developer 3 - Medical Coding & Billing Module**
- [ ] Create module structure
  ```
  src/app/dashboard/advanced/medical-coding/page.tsx
  src/components/advanced/ICDCodingInterface.tsx
  src/components/advanced/CPTCodingInterface.tsx
  src/components/advanced/InsuranceClaimGenerator.tsx
  ```
- [ ] Build ICD-10 Coding Interface
  - Eye disease codes (H00-H59)
  - Search ICD-10 codes (e.g., "cataract" → H25, H26, H28)
  - Auto-suggest based on diagnosis
  - Diagnosis → ICD-10 code mapping
- [ ] Build CPT Code Mapping
  - Procedure codes (e.g., cataract surgery → 66984)
  - Search CPT codes
  - Procedure → CPT code mapping
- [ ] Build Insurance Claim Generation
  - Patient details + diagnosis (ICD-10) + procedure (CPT) → claim form
  - TPA (Third-Party Administrator) integration (placeholder)
  - Claim submission tracking (pending, approved, rejected)
  - DRG classification for inpatient billing

**Developer 4 - Coding Audit & Reporting**
- [ ] Build Coding Audit Trail
  - Track who coded what (coder name, date)
  - Track changes to codes (audit log)
- [ ] Build Coding Quality Report
  - Coding accuracy (spot checks by senior coder)
  - Claim approval rate
  - Revenue per coder

#### Thursday-Friday (Days 59-60) - Testing & Demo
**All Developers**
- [ ] Integration testing: Tele-ophthalmology → Core Suite modules (VA, refraction via remote)
- [ ] Integration testing: Medical Coding → Cataract Surgery → Insurance Claim
- [ ] Demo to: Tele-Ophthalmologist, Rural Vision Technician, Medical Coder, Finance Manager

---

### Week 13: Infection Control & Quality Accreditation

#### Monday-Wednesday (Days 61-63) - Infection Control
**Developer 1 - Infection Control Module**
- [ ] Create module structure
  ```
  src/app/dashboard/advanced/infection-control/page.tsx
  src/components/advanced/InfectionTrackingDashboard.tsx
  src/components/advanced/EndophthalmitisRegistry.tsx
  src/components/advanced/HandHygieneMonitoring.tsx
  ```
- [ ] Build Hospital-Acquired Infection Tracker
  - Surgical site infections (SSI)
  - Post-op endophthalmitis (most critical in ophthalmology)
  - Post-injection endophthalmitis (after anti-VEGF)
  - Corneal infection (after contact lens wear, trauma)
- [ ] Build Endophthalmitis Registry
  - Patient details, surgery date, presentation date
  - Clinical findings (hypopyon, vitritis, pain, vision loss)
  - Microbiology (vitreous tap culture, organism identified)
  - Treatment (intravitreal antibiotics, vitrectomy)
  - Outcome (vision recovery, enucleation)
  - Root cause analysis (contaminated IOL, unsterile instruments, etc.)
- [ ] Build Hand Hygiene Compliance Monitoring
  - Observer reports (random spot checks)
  - Compliance percentage (target: >90%)
  - Non-compliance incidents
- [ ] Build Sterilization Audit Reports
  - CSSD sterilization cycle compliance (integrate with CSSD from Week 9)
  - Biological indicator failures
  - Corrective actions

**Developer 2 - Quality & Accreditation Module**
- [ ] Create module structure
  ```
  src/app/dashboard/advanced/quality-accreditation/page.tsx
  src/components/advanced/NABHComplianceChecklists.tsx
  src/components/advanced/QualityIndicatorDashboard.tsx
  src/components/advanced/AuditScheduleManagement.tsx
  ```
- [ ] Build NABH Compliance Checklists
  - Patient care standards (consent, identification, safety)
  - Infection control standards (hand hygiene, sterilization)
  - Medication management standards (labeling, storage)
  - Facility standards (cleanliness, equipment maintenance)
  - Checklist completion tracking
- [ ] Build Quality Indicator Dashboard
  - SSI rate (target: <1%)
  - Patient satisfaction score (target: >90%)
  - Cataract surgical rate (CSR) - surgeries per million population per year
  - Average wait time for cataract surgery
  - Post-op visual acuity outcomes (% achieving 6/18 or better)
  - Complication rate (PCR, endophthalmitis, retinal detachment)
- [ ] Build Audit Schedule Management
  - Internal audits (monthly)
  - External audits (NABH, government)
  - Audit findings (non-conformances)
  - Corrective/preventive actions (CAPA)
  - Audit report generation

**Developer 3 - Patient Safety Incident Reporting**
- [ ] Build Incident Reporting System
  - Near-miss incidents (wrong IOL picked, prevented by checklist)
  - Adverse events (wrong eye surgery, medication error)
  - Incident investigation
  - Root cause analysis (RCA)
  - CAPA tracking
- [ ] Build Document Control System
  - SOPs (Standard Operating Procedures)
  - Policy documents
  - Version control (updated SOPs supersede old ones)
  - Staff acknowledgment (staff sign off on reading SOPs)

**Developer 4 - Integration & Dashboards**
- [ ] Integrate infection data with OT Management (Week 9)
  - Post-op infection → link to specific surgery → identify root cause (surgeon, OT, sterilization)
- [ ] Build Executive Quality Dashboard
  - High-level KPIs for Hospital Admin, Chief Ophthalmologist
  - Trends over time (infection rate, patient satisfaction, surgical outcomes)
  - Alerts for breaches (infection rate spike, audit finding)

#### Thursday-Friday (Days 64-65) - Testing & Demo
**All Developers**
- [ ] Integration testing: OT Management → Endophthalmitis Registry → Root Cause Analysis
- [ ] Integration testing: Quality Indicators → NABH Checklists
- [ ] Demo to: Infection Control Nurse, Quality Manager, Hospital Admin

---

### Week 14: Diet & Nutrition, Clinical Photography, Final Polish

#### Monday-Tuesday (Days 66-67) - Final Modules
**Developer 1 - Diet & Nutrition Module**
- [ ] Create module structure
  ```
  src/app/dashboard/advanced/diet-nutrition/page.tsx
  src/components/advanced/DietPlanningModule.tsx
  src/components/advanced/DiabeticDietPlan.tsx
  ```
- [ ] Build Diabetic Diet Planning
  - For diabetic retinopathy patients
  - Carbohydrate counting
  - Glycemic index education
  - Meal plans (breakfast, lunch, dinner, snacks)
- [ ] Build Pre-Op Fasting Protocols
  - NPO (nil per os) timing before surgery
  - Clear liquids allowed until 2 hours before
  - Solid food stopped 6 hours before
- [ ] Build Post-Op Nutrition Guidelines
  - Anti-inflammatory diet (omega-3, antioxidants)
  - Vitamin A for corneal health
  - Vitamin C for wound healing
- [ ] Build BMI Tracking
  - For obese patients (anesthesia risk assessment)
  - Weight loss recommendations before surgery

**Developer 2 - Clinical Photography (Advanced) Module**
- [ ] Create module structure
  ```
  src/app/dashboard/advanced/clinical-photography/page.tsx
  src/components/advanced/SlitLampPhotography.tsx
  src/components/advanced/FluoresceinAngiography.tsx
  ```
- [ ] Build Slit Lamp Photography
  - Anterior segment photography (cornea, iris, lens)
  - External eye photography (eyelids, conjunctiva)
  - Image annotation tools
- [ ] Build Fluorescein Angiography (FA)
  - Image upload (early, mid, late phase)
  - Timeline view (progression of dye)
  - Identify leakage, neovascularization, blocked fluorescence
  - Integration with Retina Department (Week 3)
- [ ] Build Indocyanine Green Angiography (optional)
  - For choroidal imaging
  - Polypoidal choroidal vasculopathy (PCV) diagnosis
- [ ] Build Before/After Surgery Comparison
  - Eyelid surgery (ptosis repair) before/after
  - Corneal transplant before/after
  - Medical illustration integration (for consent, education)

**Developer 3 & 4 - Final Integration & Testing**
- [ ] **Day 66**: Integration testing for all Phase 4 modules
- [ ] **Day 67**: Bug fixes, UI polish

#### Wednesday-Friday (Days 68-70) - Final Testing, Demo, Handoff
**All Developers**
- [ ] **Day 68 (Wednesday)**: End-to-end testing
  - Test complete patient journey: Registration → Examination (Core Suite) → Specialty consult → Imaging → Surgery → Post-op
  - Test eye camp workflow: Camp planning → Screening → Referral → Surgery → Follow-up
  - Test tele-ophthalmology workflow: Remote screening → Consult → Referral
- [ ] **Day 69 (Thursday)**: Documentation & Training Material
  - Update user guides for all modules
  - Record video tutorials (5-10 min per major module)
  - Create quick reference guides (cheat sheets)
  - Prepare training slides for hospital staff
- [ ] **Day 70 (Friday) - FINAL DEMO (Phase 4 Completion)**
  - **10:00 AM - 12:00 PM**: Comprehensive demo to all stakeholders
    - Hospital Administrator
    - Chief Ophthalmologist
    - All department heads (8 specialties)
    - Diagnostic staff, Operations staff
    - IT Head, Finance Manager, HR Manager
  - Demo flow:
    1. Core Examination Suite (12 modules) - 15 min
    2. Clinical Specialty Departments (8 departments) - 20 min
    3. Diagnostic & Imaging (6 modules) - 15 min
    4. Operations & Hospital Services (7 modules) - 15 min
    5. Advanced Services (6 modules) - 10 min
    6. Q&A - 15 min
  - Collect final feedback
  - Document change requests for future sprints

**EOD Week 14 - Milestone M4 Achieved ✅**
- [ ] All 70+ modules complete
- [ ] 100% role coverage (all 102 roles have workflows)
- [ ] End-to-end workflows validated
- [ ] Ready for staging deployment

---

## Testing & Deployment Strategy

### Week 15: Staging Deployment & Testing
**Goal**: Deploy to staging environment, intensive testing

#### Monday-Wednesday (Days 71-73) - Staging Deployment
**Developer 1 & 4 - DevOps & Deployment**
- [ ] Set up staging environment (Azure)
  - Frontend: Azure Static Web Apps or App Service
  - Backend: Already running on Azure (localhost:5073 → Azure App Service)
  - Database: Azure PostgreSQL (already set up)
- [ ] Deploy frontend to staging
  - Build production bundle: `pnpm build`
  - Deploy to `https://staging.hospitalportal.com`
  - Configure environment variables (API URL)
- [ ] Set up CI/CD pipeline (Azure DevOps or GitHub Actions)
  - Auto-deploy on merge to `staging` branch
  - Run tests before deployment
  - Rollback on failure

**Developer 2 & 3 - Data Migration & Testing**
- [ ] Migrate test data to staging
  - 100 patients
  - 500 appointments
  - 200 examinations (all 12 core modules)
  - 50 surgeries
  - 10 eye camps
- [ ] Smoke testing (critical paths)
  - User login → Dashboard → Core Examination → Save
  - User login → Retina Department → View fundus images
  - User login → OT Management → Schedule surgery
- [ ] Load testing
  - Simulate 100 concurrent users
  - Measure response times (target: <2 sec)

#### Thursday-Friday (Days 74-75) - Intensive Testing
**All Developers + QA Team (if available)**
- [ ] **Functional Testing** (Day 74 morning)
  - Test all 70+ modules
  - Test all user roles (102 roles)
  - Test all permissions (145 permissions)
- [ ] **Integration Testing** (Day 74 afternoon)
  - Test cross-module workflows
  - Test data consistency
  - Test concurrent edits (2 doctors editing same patient)
- [ ] **User Acceptance Testing (UAT)** (Day 75)
  - Invite 10-15 hospital staff (doctors, nurses, optometrists, coordinators)
  - Provide UAT script (step-by-step tasks)
  - Collect feedback
  - Document bugs (prioritize: Critical, High, Medium, Low)
- [ ] **Bug Bash** (Day 75 afternoon)
  - All developers fix critical + high priority bugs
  - Re-test fixed bugs

---

### Week 16: Production Deployment (Pilot)
**Goal**: Deploy to production, pilot with 50 users

#### Monday (Day 76) - Production Deployment
**Developer 1 & 4**
- [ ] Deploy to production: `https://hospitalportal.com`
- [ ] Final smoke test on production
- [ ] Enable monitoring (Application Insights, error tracking)

**Developer 2 & 3**
- [ ] Create production user accounts (50 pilot users)
  - 10 doctors (various specialties)
  - 5 optometrists
  - 5 nurses
  - 5 front desk staff
  - 5 OT staff
  - 5 diagnostic staff
  - 5 operations staff
  - 5 admin staff
  - 5 eye camp coordinators
- [ ] Send login credentials + quick start guide

#### Tuesday-Friday (Days 77-80) - Pilot Phase Support
**All Developers (On-call support)**
- [ ] Monitor production logs (errors, slow queries)
- [ ] Respond to user questions (email, Slack, phone)
- [ ] Fix critical bugs immediately (hotfix deployments)
- [ ] Collect user feedback daily
- [ ] Daily standup: Review feedback, prioritize fixes

**Friday (Day 80) - Pilot Phase Review**
- [ ] Analyze pilot metrics:
  - Active users (target: >40/50)
  - Daily logins (target: >30/day)
  - Modules used most (Core Suite, OT Management, Retina)
  - Modules used least (identify adoption issues)
- [ ] Categorize feedback:
  - Bugs (fix immediately)
  - Usability issues (plan improvements)
  - Feature requests (plan for Sprint 2)
- [ ] Decision: Go/No-Go for full rollout

---

### Week 17: Full Production Rollout
**Goal**: Deploy to all hospitals, 15,000+ users

#### Monday-Tuesday (Days 81-82) - Training Sessions
**All Developers + IT Team**
- [ ] Conduct training sessions (via Zoom or in-person):
  - **Session 1 (Day 81 AM)**: Clinical Staff (Doctors, Optometrists, Nurses) - Core Examination Suite + Specialty Modules
  - **Session 2 (Day 81 PM)**: Diagnostic Staff (Imaging, Lab, Biometry) - Diagnostic Modules
  - **Session 3 (Day 82 AM)**: Operations Staff (OT, CSSD, Eye Camps, Ambulance) - Operations Modules
  - **Session 4 (Day 82 PM)**: Admin Staff (HR, Finance, Compliance, Quality) - Admin + Advanced Modules
- [ ] Provide recorded training videos for self-paced learning
- [ ] Distribute user guides (PDF, online help)

#### Wednesday (Day 83) - Full Rollout
**Developer 1 & 4**
- [ ] Create user accounts for all 15,000+ users (bulk import from CSV)
- [ ] Send email announcement: "Hospital Portal is now live!"
- [ ] Provide support channels (helpdesk email, phone, Slack)

**Developer 2 & 3**
- [ ] Monitor production performance
  - Watch for spikes in errors
  - Watch for slow queries (optimize if needed)
  - Watch for server load (scale up if needed)

#### Thursday-Friday (Days 84-85) - Post-Rollout Support
**All Developers (Full-time support)**
- [ ] Respond to user questions (expect high volume first 2 days)
- [ ] Fix critical bugs (hotfix deployments)
- [ ] Monitor adoption metrics (daily active users, logins per module)
- [ ] Celebrate success! 🎉

**Friday (Day 85) - Retrospective & Handoff**
- [ ] **2:00 PM - 4:00 PM**: Team retrospective
  - What went well in 17 weeks?
  - What could have been better?
  - Lessons learned
  - Recognition & celebration
- [ ] **4:00 PM - 5:00 PM**: Handoff to support team
  - Knowledge transfer
  - Document common issues & fixes
  - Escalation process (when to involve developers)

**EOD Week 17 - Milestone M6 Achieved ✅**
- [ ] Production deployment complete
- [ ] 15,000+ users onboarded
- [ ] 100% role coverage validated
- [ ] Support team ready

---

## Daily Standup Template

**Time**: 9:00 AM (15 minutes)  
**Attendees**: All 4 developers + Team Lead

**Format**:
1. **What did you accomplish yesterday?** (2 min per developer)
2. **What will you work on today?** (2 min per developer)
3. **Any blockers or dependencies?** (2 min per developer)
4. **Team Lead summary & prioritization** (3 min)

**Example**:
```
Developer 2:
- Yesterday: Completed Visual Acuity module, created PR
- Today: Fix code review feedback, start Retinoscopy module
- Blockers: Waiting for API endpoint for VA history (Developer 1 to provide)

Team Lead:
- Great progress on Visual Acuity! Developer 1, please prioritize VA history endpoint today.
- Everyone: Remember to write unit tests before creating PR (Definition of Done).
```

---

## Risk Mitigation Checkpoints

### Week 2 (End of Phase 1A)
**Risk**: Core Suite modules incomplete or buggy  
**Checkpoint**: Demo to stakeholders, collect feedback  
**Mitigation**: Extend Phase 1A by 1 week if critical modules missing

### Week 5 (End of Phase 1B)
**Risk**: Specialty modules don't integrate with Core Suite  
**Checkpoint**: Integration testing, validate data flow  
**Mitigation**: Dedicate Week 6 Day 1-2 for integration fixes if needed

### Week 8 (End of Phase 2)
**Risk**: Imaging modules too complex (OCT viewer, fundus viewer)  
**Checkpoint**: Performance testing (large DICOM files)  
**Mitigation**: Use lightweight image libraries, lazy loading, CDN

### Week 11 (End of Phase 3)
**Risk**: Eye camp module not adopted (staff prefer Excel)  
**Checkpoint**: UAT with eye camp coordinators  
**Mitigation**: Simplify UI, make mobile-friendly, provide training

### Week 14 (End of Phase 4)
**Risk**: Too many modules, overwhelming navigation  
**Checkpoint**: Navigation usability testing  
**Mitigation**: Add search in sidebar, role-based menu filtering

### Week 15 (Staging)
**Risk**: Performance issues (slow load times, API timeouts)  
**Checkpoint**: Load testing (100 concurrent users)  
**Mitigation**: Optimize queries, add caching, scale infrastructure

### Week 17 (Production)
**Risk**: User adoption low (staff don't use system)  
**Checkpoint**: Monitor daily active users, module usage  
**Mitigation**: Intensive training, incentivize usage, simplify workflows

---

## Success Criteria (Validated at Week 17)

### Coverage Metrics
- ✅ **Role Coverage**: 100% (all 102 roles have workflows)
- ✅ **Department Coverage**: 100% (all 182 departments supported)
- ✅ **Permission Coverage**: 100% (all 145 permissions enforced)

### Adoption Metrics (Week 17)
- ✅ **Clinical Staff Login Rate**: >85% within first month
- ✅ **Core Suite Usage**: >90% of doctors use VA, Refraction, IOP modules
- ✅ **Specialty Module Usage**: >70% of specialists use their department modules
- ✅ **OT Scheduling Adoption**: >80% of surgeries pre-booked via system
- ✅ **Eye Camp Coordination**: 100% of camps tracked in system (replace Excel)

### Performance Metrics
- ✅ **Page Load Time**: <2 seconds for clinical dashboards
- ✅ **Image Load Time**: Fundus photos <3 seconds, OCT scans <5 seconds
- ✅ **API Response Time**: <500ms for GET, <1s for POST
- ✅ **Concurrent Users**: Support 500+ simultaneous users (peak OPD hours)

### Quality Metrics
- ✅ **Bug Density**: <2 critical bugs per module
- ✅ **Permission Accuracy**: 0 unauthorized access incidents
- ✅ **HIPAA Compliance**: 100% PHI access logged
- ✅ **Data Integrity**: 0 data loss incidents

---

## Appendix A: Git Branching Strategy

### Branch Structure
```
main                    ← Production (protected)
  └─ staging           ← Staging environment (protected)
       └─ develop      ← Integration branch (protected)
            ├─ feature/core-visual-acuity
            ├─ feature/core-refraction
            ├─ feature/retina-dashboard
            ├─ feature/glaucoma-iop-tracking
            └─ ...
```

### Workflow
1. Create feature branch from `develop`: `git checkout -b feature/core-visual-acuity`
2. Work on feature, commit regularly
3. Create PR to merge into `develop`
4. Team Lead reviews, provides feedback
5. Address feedback, merge into `develop`
6. At end of week, merge `develop` → `staging` (for testing)
7. At end of phase, merge `staging` → `main` (for production)

---

## Appendix B: Code Review Checklist

**Before Creating PR**:
- [ ] All TypeScript errors resolved
- [ ] No console.log statements (use proper logging)
- [ ] Unit tests written (80% coverage)
- [ ] Manual testing completed (checklist below)
- [ ] Permission checks implemented
- [ ] API integration tested
- [ ] Loading states added
- [ ] Error handling added
- [ ] Responsive design (mobile-friendly)

**Manual Testing Checklist**:
- [ ] Happy path: Can save and retrieve data?
- [ ] Edge cases: Invalid input handled gracefully?
- [ ] Empty state: UI looks good with no data?
- [ ] Error state: Network failure handled?
- [ ] Permission test: Unauthorized user blocked?

**Reviewer Checklist**:
- [ ] Code follows project conventions
- [ ] No code duplication (DRY principle)
- [ ] Components are reusable
- [ ] Logic is in services, not components (separation of concerns)
- [ ] Security: No sensitive data exposed
- [ ] Performance: No unnecessary re-renders

---

## Appendix C: Component Naming Conventions

**Pages** (routes): `PascalCase.tsx` or `page.tsx` (Next.js App Router)
- `src/app/dashboard/examination/visual-acuity/page.tsx`

**Components**: `PascalCase.tsx`
- `VisualAcuityForm.tsx`, `IOPTrendChart.tsx`, `FundusViewer.tsx`

**Hooks**: `camelCase.ts` with `use` prefix
- `useVisualAcuity.ts`, `usePermissions.ts`, `useClinicalStore.ts`

**API Clients**: `camelCase.api.ts`
- `examination.api.ts`, `retina.api.ts`, `ot-management.api.ts`

**Types/Interfaces**: `PascalCase.ts` or `types.ts`
- `VisualAcuityData`, `RefractionData`, `IOPMeasurement`

**Stores (Zustand)**: `kebab-case-store.ts`
- `clinical-store.ts`, `iol-inventory-store.ts`, `ot-schedule-store.ts`

---

## Appendix D: Development Best Practices

### TypeScript
- ✅ Use strict mode: `"strict": true` in `tsconfig.json`
- ✅ Avoid `any` type (use `unknown` if type truly unknown)
- ✅ Define interfaces for all API responses
- ✅ Use enums for fixed values (e.g., `EyeSide.OD`, `EyeSide.OS`)

### React
- ✅ Use functional components (no class components)
- ✅ Use hooks (useState, useEffect, useQuery, etc.)
- ✅ Avoid prop drilling (use Context or Zustand for global state)
- ✅ Memoize expensive computations (useMemo, useCallback)
- ✅ Keep components small (<300 lines)

### Performance
- ✅ Lazy load images (fundus, OCT scans)
- ✅ Paginate large lists (patients, appointments)
- ✅ Debounce search inputs (wait 300ms before API call)
- ✅ Use React Query for data fetching (auto-caching, stale-while-revalidate)

### Security
- ✅ Always check permissions before rendering (ProtectedRoute, useHasPermission)
- ✅ Sanitize user input (prevent XSS)
- ✅ Use HTTPS in production
- ✅ Never store JWT in localStorage (use httpOnly cookies if possible)

### Accessibility
- ✅ Add ARIA labels for screen readers
- ✅ Ensure keyboard navigation works (Tab, Enter, Escape)
- ✅ Use semantic HTML (button, nav, main, aside)
- ✅ Contrast ratio >4.5:1 for text

---

**End of Sequential Implementation Plan**

This plan provides a day-by-day, developer-by-developer guide to building the complete Hospital Portal frontend in 17 weeks (14 weeks development + 3 weeks deployment). Each developer knows exactly what to build each day, ensuring steady progress and timely delivery.

**Key Takeaways**:
1. **Week 1-2**: Foundation (Core Suite) - highest priority
2. **Week 3-5**: Clinical specialties (build on Core Suite)
3. **Week 6-8**: Diagnostic & imaging (integrate with clinical)
4. **Week 9-11**: Operations (OT, camps, ambulance)
5. **Week 12-14**: Advanced services (tele-ophth, quality, coding)
6. **Week 15-17**: Deploy, test, train, rollout

**Total**: 70+ modules, 100+ components, 100% role coverage, ready for 15,000+ users. 🚀
