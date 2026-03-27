# Eye Hospital Management System - Complete Implementation Plan

**Document Version:** 2.0  
**Last Updated:** January 25, 2026  
**Current System Completion:** 50% (Admin 100%, Clinical 35%)  
**Target Completion:** 95% in 28 weeks (Admin 4 weeks + Eye Hospital 24 weeks)  
**Ultimate Goal:** 100% World-Class System in 32 weeks

---

## 🎯 TL;DR: Implementation Strategy

Transform existing generic Hospital Portal (100% admin features, HIPAA-compliant, 162 endpoints) into specialized Eye Hospital Management System meeting all requirements.

**Current State:** Strong foundation with 40% eye-hospital features  
**Gaps:** Optometry/refraction (0%), optical shop (0%), IOL management (0%), structured imaging (40%), patient portal (0%), clinical templates (0%)  
**Approach:** 7 sequential phases over 28 weeks building on existing infrastructure

**Implementation Priority (User Mandate):**

1. **FIRST PRIORITY (Week 1, Day 1-2):** 🎨 **Modify Entire Project UI**
   - Tailwind CSS v4 upgrade with emerald green theme (#10b981)
   - Redesigned admin menu structure (16 → 11 items, 5 sections)
   - Google Fonts (Inter, Plus Jakarta Sans, IBM Plex Mono)
   - Responsive design (mobile/tablet/desktop)
   - Accessibility WCAG 2.1 AA compliance
   - **Rationale:** New UI foundation ensures all subsequent features built on consistent, world-class design system

2. **SECOND PRIORITY (Weeks 1-4):** 👥 **Complete Admin Management including HR**
   - 15 HR modules (Onboarding, Contracts, Licenses with auto-suspend, Probation with auto-confirm, Performance 360, Training, Attendance GPS+photo, Leave, India Payroll PF/ESI/PT/TDS, Benefits, Documents e-signing, Disciplinary/Exit, Background Verification, HR Analytics)
   - Users + Employees merge with Smart Creation Wizard (5 screens, 8 auto-actions)
   - Security Dashboard (Sessions, Devices, Emergency Access with post-review, Suspicious Activity)
   - MFA (SMS/Email/Authenticator) + Max Concurrent Sessions enforcement
   - Settings Service (6 tabs: General, Email, Security, Notifications, Integrations, Compliance)
   - Hierarchy Viewer (react-flow + d3.js, PNG/PDF/SVG/JSON export)
   - **Rationale:** Eye hospital staff (ophthalmologists, optometrists) need complete employment lifecycle, license tracking, surgical privileges management before clinical features can be used

3. **THIRD PRIORITY (Weeks 5-28):** 🏥 **Eye Hospital Clinical Modules**
   - Phase 1A-1B (Week 5-6): Eye Hospital Database Schema (12 tables) + Roles (7 eye-specific roles, 40 permissions)
   - Phase 2A-2B (Week 7-11): Optometry/Refraction + Optical Shop/Dispensing
   - Phase 3A-3B (Week 12-16): Ophthalmology Clinical Templates + Imaging (OCT/Fundus/VF with PACS)
   - Phase 4A-4B (Week 17-21): Cataract Surgery/IOL + Laser Treatments (LASIK/PRK/YAG)
   - Phase 5A-5B (Week 22-26): Patient Portal + Healthcare Compliance
   - Phase 6A-6B (Week 27-28): Design System Finalization + Testing/Documentation/Deployment
   - **Rationale:** Clinical specialization builds on admin foundation, requires HR infrastructure to manage specialized staff

**Prerequisites (Weeks 1-4):** Complete Admin Management first  
**Eye Hospital (Weeks 5-28):** 6 phases of specialized eye care features

---

## 📊 Executive Summary

### Current Status

**✅ COMPLETED (50%)**
- **Admin Management System:** 100% complete with 14 modules across 5 sections
- **Database Infrastructure:** 96 HIPAA-compliant tables with Row-Level Security
- **Backend API:** 162 endpoints for admin, basic appointments, patients, examinations
- **Multi-Tenancy:** 4-tier hierarchy (Tenant → Organization → Branch → Department)
- **Security:** RBAC+ABAC with 297 permissions, JWT auth, audit logging (28 triggers)
- **14 Standard Departments:** Doctor, Optometrist, Imaging, Optical, Pharmacy, Nurse, Front Office, Billing, Laboratory, Inventory, Admin, Counselor, Junior Doctor, Insurance

**⏳ IN PROGRESS (35%)**
- **Clinical Workflows:** Basic appointments (40%), patients (60%), examinations (30%)
- **Eye-Specific Features:** Generic clinical_examination table exists, no specialized templates
- **Financial:** Billing table structure exists, no invoice generation or payment processing

**⚠️ NOT STARTED (65%)**
- **Prescriptions Module:** 0%
- **Laboratory Orders & Results:** 0%
- **Pharmacy Management:** 0%
- **Eye Imaging (OCT/Fundus/Perimetry):** 0%
- **Optical Shop (Prescriptions/Sales/IOL):** 0%
- **Surgery/OT Scheduling:** 0%
- **Payment Gateway Integration:** 0%
- **SMS/WhatsApp Notifications:** 0%
- **Patient Portal:** 0%
- **Telemedicine:** 0%

### Gap Analysis: Generic Hospital → Eye Hospital

**What Exists (Generic):**
- `clinical_examination` table with basic fields
- `appointment` table for scheduling
- `patient` table for demographics
- `prescription` table (structure only, no eye-specific medication catalog)

**What's Missing (Eye Hospital Specialization):**
1. **Optometry/Refraction Module** - Visual acuity, refraction data, prescription generation
2. **Optical Shop** - Frame inventory, lens catalog, eyewear sales, contact lens fitting
3. **Ophthalmology Examination Templates** - Slit lamp, IOP, fundus, anterior segment, posterior segment,  specialized forms per sub-department
4. **Eye Imaging Integration** - OCT, fundus photography, B-scan, visual field testing, corneal topography
5. **Cataract Surgery & IOL Management** - IOL inventory, power calculation, surgical workflow
6. **Laser Treatments** - LASIK, PRK, retinal laser, YAG capsulotomy
7. **Patient Portal** - Self-service appointment booking, report access, secure messaging
8. **Telemedicine** - Video consultations with screen sharing for image review

---

## 🔬 COMPREHENSIVE GAP ANALYSIS & INDUSTRY STANDARDS COMPLIANCE

This section ensures the system meets **world-class healthcare**, **eye hospital specialization**, **security**, **compliance**, and **UX standards** before implementation.

### 🏥 Healthcare Interoperability Standards

#### **HL7 FHIR R4 (Fast Healthcare Interoperability Resources)** - Week 6
**Status:** ⚠️ **NOT IMPLEMENTED** (Critical for modern healthcare systems)

**Why It Matters:**
- Exchange patient data with other hospitals (referrals, consultations)
- Future-proof for regulatory requirements (TEFCA in USA, NHS Digital in UK, Ayushman Bharat Digital Mission in India)
- Enable integration with national health information exchanges

**FHIR Resources to Implement:**
- `Patient` - Demographics, contact information, insurance details
- `Practitioner` - Healthcare providers (ophthalmologists, optometrists)
- `Appointment` - Scheduling and booking
- `Observation` - Clinical measurements (visual acuity, IOP, refraction)
- `DiagnosticReport` - OCT, fundus photography, visual field reports
- `MedicationRequest` - Eye drop prescriptions
- `Procedure` - Cataract surgery, LASIK, intravitreal injections
- `ImagingStudy` - DICOM imaging metadata
- `Condition` - Diagnoses (glaucoma, cataract, diabetic retinopathy)
- `DocumentReference` - Consent forms, clinical documents

**FHIR API Endpoints:**
```
GET  /fhir/Patient/{id}
POST /fhir/Observation  (create VA measurement)
GET  /fhir/DiagnosticReport?patient={id}&category=imaging
POST /fhir/MedicationRequest (eye drop prescription)
GET  /fhir/Procedure?patient={id}&category=surgery
```

**Week 6 Deliverable:** ✅ FHIR REST API (10 resources) + auto-sync with internal database

---

#### **DICOM (Digital Imaging and Communications in Medicine)** - Enhanced Week 14
**Current Status:** ✅ Partially planned (Orthanc PACS Week 14)

**Enhanced Implementation - Ophthalmic Modalities:**
- **OP** - Ophthalmic Photography (fundus camera, external eye photos)
- **OPT** - Ophthalmic Tomography (OCT scans)
- **OPV** - Ophthalmic Visual Field (Humphrey, Octopus perimeters)
- **OPM** - Ophthalmic Mapping (corneal topography, pentacam)
- **OAM** - Ophthalmic Axial Measurements (biometry for IOL calculation)

**Critical DICOM Tags for Ophthalmology:**
```
(0022,0001) - Laterality: OD (Right Eye) / OS (Left Eye) / OU (Both Eyes)
(0022,0007) - Image Laterality
(0022,0014) - Ophthalmic Axial Length Measurements Sequence
(0022,0030) - Intraocular Pressure (IOP)
(0046,0012) - Visual Field Horizontal Extent
```

**DICOM Worklist (MPPS - Modality Performed Procedure Step):**
- Imaging technician sees scheduled OCT/fundus scans
- Auto-populate patient demographics from worklist
- Mark study status: Scheduled → In Progress → Completed

**Week 14 Enhanced Deliverable:** ✅ DICOM worklist, ✅ MPPS workflow, ✅ 5 ophthalmic modalities supported

---

#### **ICD-10-CM (International Classification of Diseases)** - Week 12
**Status:** ⚠️ **Mentioned but not detailed** (Critical for diagnosis coding, insurance claims)

**Ophthalmic ICD-10 Code Categories (H00-H59):**
- **H00-H05:** Eyelid, lacrimal system, orbit disorders
- **H10-H11:** Conjunctiva disorders
- **H15-H22:** Sclera, cornea, iris, ciliary body disorders
- **H25-H28:** Lens disorders (cataracts)
  - H25.1 - Age-related nuclear cataract
  - H26.9 - Unspecified cataract
- **H30-H36:** Choroid and retina disorders
  - H35.31 - Non-proliferative diabetic retinopathy (NPDR)
  - H35.32 - Proliferative diabetic retinopathy (PDR)
  - H35.30 - Age-related macular degeneration (AMD)
- **H40-H42:** Glaucoma
  - H40.11 - Primary open-angle glaucoma (POAG)
  - H40.20 - Angle-closure glaucoma
- **H43-H44:** Vitreous body and globe disorders
- **H46-H47:** Optic nerve and visual pathways disorders
- **H49-H52:** Ocular muscles, binocular movement, accommodation, refraction disorders
  - H52.0 - Hyperopia (farsightedness)
  - H52.1 - Myopia (nearsightedness)
  - H52.2 - Astigmatism
- **H53-H54:** Visual disturbances and blindness

**Auto-Coding Features:**
- Typeahead search: "diabetic ret" → suggests H35.31 (Mild NPDR), H35.32 (PDR) with descriptions
- Differential diagnosis suggester: Based on exam findings, suggest likely ICD-10 codes
- Bilateral coding: Auto-generate OD/OS codes (H40.11X1 right eye, H40.11X2 left eye)
- ICD-10 to CPT mapping: Suggest appropriate procedure codes based on diagnosis

**Week 12 Deliverable:** ✅ 500+ ophthalmic ICD-10 codes, ✅ Auto-complete, ✅ Bilateral coding

---

#### **CPT Codes (Current Procedural Terminology)** - Week 11
**Status:** ⚠️ **MISSING** (Critical for billing, insurance claims, revenue cycle)

**Common Ophthalmic CPT Codes (92000-92499):**

**Eye Examinations:**
- 92002 - Intermediate eye exam, new patient
- 92004 - Comprehensive eye exam, new patient
- 92012 - Intermediate eye exam, established patient
- 92014 - Comprehensive eye exam, established patient
- 92015 - Refraction (separate reimbursement)

**Diagnostic Testing:**
- 92025 - Computerized corneal topography
- 92083 - Visual field examination, automated (Humphrey)
- 92134 - OCT optic nerve, unilateral or bilateral
- 92250 - Fundus photography with interpretation
- 92136 - OCT anterior segment, unilateral or bilateral

**Anterior Segment Surgery (66000-66999):**
- 66984 - Cataract surgery with IOL insertion (most common)
- 66821 - YAG laser capsulotomy

**Posterior Segment Surgery (67000-67999):**
- 67028 - Intravitreal injection (anti-VEGF for AMD, diabetic macular edema)
- 67210 - Retinal laser photocoagulation (panretinal or focal)

**Implementation:**
- Link CPT codes to `surgical_schedule` and `appointment` tables
- Auto-populate billing with CPT codes based on appointment type
- CPT + ICD-10 bundling rules (some procedures only covered for specific diagnoses)
- Fee schedule management (different rates for insurance vs. cash patients)

**Week 11 Deliverable:** ✅ 200+ ophthalmic CPT codes, ✅ Auto-billing integration, ✅ Fee schedule

---

### 👁️ Eye Healthcare Clinical Standards

#### **Visual Acuity Measurement Standards** - Week 7
**Current Status:** ✅ Planned (Snellen, Decimal, LogMAR) - **Needs Enhancement**

**Enhanced Standards:**

**ETDRS Chart (Early Treatment Diabetic Retinopathy Study):**
- Gold standard for clinical trials (AMD, diabetic retinopathy)
- 5 letters per line, constant 0.1 log unit progression
- Letter-by-letter scoring (e.g., 85 letters = 20/20)

**Conversion Formula (Auto-Calculate):**
```
LogMAR = -log10(Decimal)
Decimal = Snellen Denominator / Snellen Numerator

Examples:
20/20 = 6/6   = 1.0 Decimal = 0.0 LogMAR
20/40 = 6/12  = 0.5 Decimal = 0.3 LogMAR
20/200 = 6/60 = 0.1 Decimal = 1.0 LogMAR
```

**Pediatric Visual Acuity:**
- Lea Symbols (apple, house, circle, square) for ages 3-5
- HOTV test for pre-literate children
- Cardiff Acuity Test for infants

**Low Vision Notation:**
- CF (Count Fingers) at specified distance
- HM (Hand Motion)
- LP (Light Perception)
- NLP (No Light Perception)

**Week 7 Enhanced Deliverable:** ✅ ETDRS support, ✅ Pediatric VA options, ✅ Low vision notation, ✅ Auto-conversion calculator

---

#### **Refraction Notation Standards** - Week 7

**Standardized Format:**
```
OD: -2.50 -1.00 × 180  (Sphere, Cylinder, Axis)
OS: -3.00 -0.75 × 175
Add: +2.50 (for bifocals/progressives)
PD: 32/32 (monocular) or 64 (binocular)
```

**Validation Rules:**
- Sphere: -20.00 to +20.00 (0.25 D steps)
- Cylinder: -6.00 to +6.00 (0.25 D steps)
- Axis: 1° to 180° (integers only)
- Add power: +0.75 to +3.50 (0.25 D steps)
- PD: 25-40mm per eye (monocular), 50-80mm (binocular)

**Transposition (Minus ↔ Plus Cylinder):**
```
Minus: -2.00 -1.00 × 180
Plus:  -3.00 +1.00 × 90
```
Auto-calculate based on user preference (US prefers minus cylinder)

---

#### **Glaucoma Staging & Progression Analysis** - Week 13
**Status:** ⚠️ **MISSING** (Critical for glaucoma management, progression tracking)

**Hodapp-Parrish-Anderson Classification (Visual Field Severity):**
- **Early:** MD (Mean Deviation) < -6 dB
- **Moderate:** MD -6 to -12 dB
- **Advanced:** MD > -12 dB

**RNFL Thickness Percentiles (OCT):**
- 🟢 Green: >95th percentile (normal)
- 🟡 Yellow: 5th-95th percentile (borderline)
- 🔴 Red: <5th percentile (abnormal, significant thinning)

**Glaucoma Progression Detection:**
- **Trend Analysis:** Plot IOP over time, compare to target IOP
- **RNFL Thinning Rate:** μm/year (significant if >2 μm/year)
- **Visual Field MD Slope:** dB/year (significant if >1 dB/year)
- **Alert System:** "⚠️ RNFL thinning rate -2.5 μm/year detected. Progression confirmed. Consider treatment adjustment."

**Week 13 Deliverable:** ✅ Glaucoma staging auto-calculation, ✅ Progression analysis dashboard, ✅ Alert system

---

#### **Diabetic Retinopathy Grading (ETDRS Classification)** - Week 15
**Status:** ⚠️ Mentioned for AI (Phase 7) but **needs manual grading NOW**

**ETDRS Severity Scale (5 Grades):**
1. **No DR:** No microaneurysms
2. **Mild NPDR:** Microaneurysms only
3. **Moderate NPDR:** More than just microaneurysms, less than severe NPDR
4. **Severe NPDR (4-2-1 Rule):**
   - Severe hemorrhages in all 4 quadrants, OR
   - Venous beading in 2+ quadrants, OR
   - IRMA (intraretinal microvascular abnormalities) in 1+ quadrant
5. **Proliferative DR (PDR):** Neovascularization (NVD, NVE), vitreous hemorrhage

**Diabetic Macular Edema (DME) Assessment:**
- **CI-DME:** Clinically insignificant (observation)
- **CSME:** Clinically significant (requires treatment)
  - Retinal thickening within 500 μm of fovea center
  - Hard exudates within 500 μm of fovea with adjacent thickening
  - >1 disc area of thickening within 1 disc diameter of fovea

**Fundus Examination Template:**
- Dropdown: Select DR grade (No DR, Mild NPDR, Moderate NPDR, Severe NPDR, PDR)
- Checkbox: CSME present?
- Auto-generate treatment plan: "Severe NPDR + CSME → Recommend PRP (panretinal photocoagulation) + anti-VEGF injection"

**Week 15 Deliverable:** ✅ DR grading dropdown, ✅ CSME assessment, ✅ Auto-treatment suggester

---

#### **IOL Power Calculation Formulas (Enhanced)** - Week 17
**Current:** SRK/T, Barrett, Haigis, Holladay mentioned - **Needs 3 more modern formulas**

**Additional Formulas for Accuracy:**
- **Hill-RBF (Radial Basis Function):** AI-based, trained on 1.6 million cases, best for extreme eyes (very short or very long axial length)
- **Kane Formula:** Published 2020, excellent accuracy for all AL ranges
- **EVO Formula:** Machine learning-based, recently published

**Personalized Lens Constant Optimization:**
- Track surgeon's outcomes: Predicted refraction vs. Actual refraction (post-op autorefraction)
- Adjust A-constant based on surgeon's historical data
  ```
  Example:
  Dr. Smith's outcomes: Avg prediction error = +0.50 D (hyperopic shift)
  System suggests: Reduce A-constant from 119.0 to 118.7
  ```

**Toric IOL Calculator (for Astigmatism):**
- Input: Keratometry (corneal astigmatism)
- Calculate: Required toric IOL power and axis
- Surgical planning: Mark axis on cornea pre-op

**Week 17 Enhanced Deliverable:** ✅ 7 IOL formulas (SRK/T, Barrett, Haigis, Holladay, Hill-RBF, Kane, EVO), ✅ Surgeon-specific optimization, ✅ Toric calculator

---

### 🔒 Security Standards & Best Practices (OWASP Top 10 Compliance)

#### **1. Injection Prevention** ✅ CRITICAL
**Implementation:**
- ✅ **SQL Injection Protection:**
  - Entity Framework Core parameterized queries (all database calls)
  - NO raw SQL with string concatenation
  - Server-side input validation on all API endpoints
  ```csharp
  // ✅ CORRECT (parameterized)
  var patients = await _context.Patients
      .Where(p => p.Name.Contains(searchTerm))
      .ToListAsync();
  
  // ❌ WRONG (vulnerable to SQL injection)
  var query = $"SELECT * FROM patients WHERE name LIKE '%{searchTerm}%'";
  ```

**Week 27 Testing:** OWASP ZAP automated scan + manual penetration testing

---

#### **2. Broken Authentication** ✅ CRITICAL
**Implementation:**
- ✅ **Password Security:**
  - Bcrypt hashing (cost factor 12) or Argon2id
  - Salted hashes (unique salt per user)
  - NO MD5, SHA1, or plain text storage
  
- ✅ **Session Management:**
  - Secure session cookies (`HttpOnly`, `Secure`, `SameSite=Strict`)
  - Session timeout: 30 minutes idle, 8 hours absolute
  - Regenerate session ID after login (prevent session fixation)
  
- ✅ **Multi-Factor Authentication (MFA):**
  - Required for admins, optional for users (configurable in Settings)
  - TOTP (Time-based One-Time Password) - RFC 6238 compliant
  - Backup codes (10 single-use codes)
  
- ✅ **Account Lockout:**
  - 5 failed login attempts → 15-minute lockout
  - CAPTCHA after 3 failed attempts (prevent brute force)

**Week 27 Testing:** Brute force attack simulation, session fixation tests

---

#### **3. Sensitive Data Exposure** ✅ CRITICAL (HIPAA PHI)
**Implementation:**
- ✅ **Encryption at Rest:**
  - Azure SQL TDE (Transparent Data Encryption) enabled
  - Azure Blob Storage encryption (AES-256)
  - Redis cache encryption
  
- ✅ **Encryption in Transit:**
  - TLS 1.3 enforced (disable TLS 1.0, 1.1, 1.2)
  - HSTS (HTTP Strict Transport Security) header
  - Certificate pinning for mobile apps
  
- ✅ **Data Masking (PHI Protection):**
  - SSN: Show only last 4 digits (XXX-XX-1234)
  - Email: Show first char + domain (j***@hospital.com)
  - Phone: Show last 4 digits (XXX-XXX-5678)
  
- ✅ **Secure Key Management:**
  - Azure Key Vault for all secrets (DB passwords, API keys, JWT secret)
  - Rotate keys every 90 days (automated)
  - Never commit secrets to Git (use .env files, excluded in .gitignore)

**Week 27 Testing:** SSL Labs scan (target A+ rating), data leakage checks

---

#### **4. Broken Access Control** ✅ CRITICAL (HIPAA)
**Implementation:**
- ✅ **Row-Level Security (PostgreSQL RLS):**
  - Every query auto-filtered by `tenant_id`
  - Users can ONLY access their tenant's data
  
- ✅ **Attribute-Based Access Control (ABAC):**
  - Check: User role + Department + Patient relationship
  - Example: Nurse in Ophthalmology can ONLY access Ophthalmology department patients
  
- ✅ **API Authorization:**
  - `[RequirePermission("patient.read")]` attribute on all endpoints
  - JWT claims verification
  - Deny by default (whitelist approach)
  
- ✅ **IDOR Prevention (Insecure Direct Object References):**
  ```csharp
  // ❌ WRONG: /api/patients/12345 (attacker can change ID)
  // ✅ RIGHT: Check ownership before returning data
  var patient = await _patientService.GetPatient(id, currentUserId);
  if (patient == null || patient.TenantId != currentTenantId)
      return Forbid();
  ```

**Week 27 Testing:** Privilege escalation attempts, horizontal/vertical access violations

---

#### **5. Security Misconfiguration** ✅ High Risk
**Implementation:**
- ✅ **Remove Default Credentials:**
  - No default admin/admin, root/root
  - Force password change on first login
  
- ✅ **Disable Unnecessary Features:**
  - Remove unused NuGet packages
  - Disable directory listing
  - Remove `X-Powered-By` header (hide ASP.NET version)
  
- ✅ **Error Handling:**
  - Production: Generic error messages ("An error occurred")
  - Development: Detailed stack traces (only in dev environment)
  - Log all errors to Azure Application Insights
  
- ✅ **Security Headers:**
  ```
  Content-Security-Policy: default-src 'self'
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(self), camera=(self)
  ```

**Week 27 Testing:** Security headers check (securityheaders.com)

---

#### **6. Cross-Site Scripting (XSS)** ✅ High Risk
**Implementation:**
- ✅ **Input Sanitization:**
  - Encode all user inputs before rendering (React auto-escapes)
  - DOMPurify library for rich text (examination notes, clinical templates)
  - Server-side validation: Regex for email, phone, alphanumeric fields
  
- ✅ **Content Security Policy (CSP):**
  - Whitelist allowed script sources
  - Disable inline JavaScript (use nonce or hash)
  - Report violations to logging endpoint
  
- ✅ **HttpOnly Cookies:**
  - Session cookies NOT accessible via JavaScript (prevent XSS cookie theft)

**Week 27 Testing:** XSS payloads injection (`<script>alert(1)</script>`), CSP bypass attempts

---

#### **7. Insufficient Logging & Monitoring** ✅ CRITICAL (HIPAA)
**Implementation:**
- ✅ **Comprehensive Audit Trail:**
  - WHO: User ID, username, role
  - WHAT: Action (created, updated, deleted, accessed, exported)
  - WHEN: Timestamp (UTC)
  - WHERE: IP address, device, location (city/country)
  - WHY: Reason (required for emergency access)
  - RESULT: Success or failure
  
- ✅ **Security Events to Log:**
  - Failed login attempts
  - Account lockouts
  - Password changes
  - Permission changes
  - Emergency access requests/approvals
  - Bulk data exports (>100 records)
  - After-hours access (outside 8 AM - 6 PM)
  - Impossible travel (login from Mumbai, then NYC 1 hour later)
  
- ✅ **Real-time Alerting:**
  - 5+ failed logins in 5 minutes → Alert security team via SMS
  - Bulk export attempt → Require manager approval
  - Impossible travel detected → Auto-suspend account, notify user
  
- ✅ **Log Retention:**
  - Minimum 7 years (HIPAA requirement for medical records audit trail)
  - Store in append-only Azure Blob Storage (prevent tampering)
  - Daily backup to secondary region (disaster recovery)

**Week 27 Testing:** Log completeness review, alert trigger tests, tamper detection

---

### 🎨 UX Best Practices (Nielsen's 10 Usability Heuristics)

#### **1. Visibility of System Status** ✅
**Implementation:**
- ✅ **Loading States:**
  - Skeleton screens (NOT spinners) for data fetching
  - Progress bars for long operations (file uploads, report generation)
  - "Saving..." indicator on form submission
  
- ✅ **Real-time Feedback:**
  - Toast notifications: "Patient created successfully ✓" (5s auto-dismiss)
  - Success animations (checkmark bounce effect)
  - Error shake animation on validation failure

**Week 1 Deliverable:** Loading states for all API calls, toast notification system

---

#### **2. Match Between System and Real World** ✅
**Implementation:**
- ✅ **Medical Terminology (Accurate):**
  - Use standard terms: "Visual Acuity" (not "VA score")
  - Tooltips for abbreviations: Hover "IOP" → "Intraocular Pressure (10-21 mmHg normal)"
  - Context-sensitive help icons
  
- ✅ **Natural Language:**
  - "Schedule appointment" (not "Create appointment record")
  - "Today's patients" (not "Patient list filtered by current date")

---

#### **3. User Control and Freedom** ✅
**Implementation:**
- ✅ **Undo/Redo:**
  - Soft delete (30-day recovery window before permanent deletion)
  - "Undo" button on destructive actions: "Prescription deleted. [Undo?]"
  
- ✅ **Cancel Actions:**
  - "Cancel" button on all forms (go back without saving)
  - Confirmation dialogs for irreversible actions: "Delete patient? This cannot be undone."
  - Unsaved changes warning: "You have unsaved changes. Leave anyway?"

---

#### **4. Consistency and Standards** ✅
**Implementation:**
- ✅ **Design System:**
  - Emerald green (#10b981) for primary actions (consistent across all pages)
  - Red (#ef4444) for destructive actions (delete, terminate)
  - Same button sizes: sm (32px), md (40px), lg (48px)
  
- ✅ **Terminology Consistency:**
  - "Patient" everywhere (NOT "Client" or "Customer")
  - "Appointment" (NOT "Visit" or "Consultation")
  - "Department" (NOT "Unit" or "Service")

---

#### **5. Error Prevention** ✅
**Implementation:**
- ✅ **Input Validation:**
  - Email: Regex pattern + DNS check
  - Phone: Format validation (10 digits India, E.164 international)
  - Date: Disable future dates for birth date, disable past dates for appointment
  
- ✅ **Constraints:**
  - Sphere: -20.00 to +20.00 (slider with min/max limits)
  - IOP: 5-50 mmHg (reject out-of-range values)
  - Axis: 1-180° (circular input picker, impossible to enter invalid value)
  
- ✅ **Confirmation Dialogs:**
  - "Are you sure you want to delete this patient?"
  - Type patient name to confirm deletion (for critical actions)

---

#### **6. Recognition Rather Than Recall** ✅
**Implementation:**
- ✅ **Auto-complete:**
  - Patient search: Typeahead by name, MRN, phone number
  - Medication search: Show 5 recently prescribed medications
  - Diagnosis: ICD-10 auto-complete with descriptions
  
- ✅ **Defaults:**
  - Pre-fill last used values (examination template)
  - Remember user preferences (date format, timezone, theme)

---

#### **7. Flexibility and Efficiency of Use** ✅
**Implementation:**
- ✅ **Keyboard Shortcuts:**
  - `Ctrl+K`: Global search (command palette)
  - `Ctrl+N`: New patient
  - `Ctrl+S`: Save form
  - `Esc`: Close modal
  - `Tab` / `Shift+Tab`: Navigate form fields
  
- ✅ **Bulk Actions:**
  - Select multiple patients → Send appointment reminders
  - Select multiple invoices → Mark as paid
  
- ✅ **Customization:**
  - Reorder dashboard widgets (drag-and-drop)
  - Hide/show table columns
  - Save custom filters: "My high-risk glaucoma patients"

**Week 1 Deliverable:** Global search (Ctrl+K), keyboard shortcuts documentation

---

#### **8. Aesthetic and Minimalist Design** ✅
**Implementation:**
- ✅ **Progressive Disclosure:**
  - Accordion sections (collapse advanced options)
  - "Show more" button for long lists
  - Stepper for multi-step forms (Smart Employee Creation Wizard: 5 screens)
  
- ✅ **Visual Hierarchy:**
  - Primary action: Large emerald button
  - Secondary action: Outlined button
  - Tertiary action: Text link
  
- ✅ **White Space:**
  - 16px padding on cards
  - 24px gap between sections
  - Generous line height (1.5) for readability

---

#### **9. Help Users Recognize, Diagnose, and Recover from Errors** ✅
**Implementation:**
- ✅ **Error Messages (Specific, Actionable, Friendly):**
  - ❌ Generic: "Invalid input"
  - ✅ Specific: "Email address already registered"
  - ✅ Actionable: "Password must be 12+ characters. Add 4 more."
  - ✅ Friendly: "Oops! We couldn't find that patient. Try searching by MRN."
  
- ✅ **Inline Validation:**
  - Real-time feedback on form fields (red border + message below)
  - Checkmark icon on valid input (green)
  
- ✅ **Error Recovery:**
  - Auto-save drafts every 30 seconds
  - Restore unsaved form data on page refresh
  - "Retry" button on network failures

---

#### **10. Help and Documentation** ✅
**Implementation:**
- ✅ **Contextual Help:**
  - Help icon (?) next to complex fields
  - Tooltip on hover (max 2 lines)
  - "Learn more" link to full documentation
  
- ✅ **Onboarding Tours:**
  - First-time login: Guided tour (intro.js library)
  - "What's new" modal on version updates
  
- ✅ **Video Tutorials:**
  - Embedded videos (3-5 min each)
  - 10 tutorials covering common workflows
  
- ✅ **Searchable Help Center:**
  - Algolia DocSearch integration
  - FAQ section
  - Troubleshooting guides

**Week 28 Deliverable:** Complete help documentation (200 pages), 10 video tutorials, in-app guided tours

---

### 👁️ Missing Eye Healthcare Features (To Be Added)

#### **Color Vision Testing Module** - Week 16 (Post-MVP)
**Status:** ⚠️ **NOT PLANNED** (Common in comprehensive eye exams)

**Tests to Implement:**
- **Ishihara Test (24 plates):**
  - Digital version with touch/mouse selection
  - Score: Number of plates correctly identified
  - Interpretation: Normal (>21/24), Red-Green deficiency (<17/24)
  
- **Farnsworth D-15 Test:**
  - Order 15 colored caps from light to dark
  - Plot on confusion chart → Identify deficiency type (protan, deutan, tritan)

**Week 16 Deliverable:** ✅ Digital Ishihara test (24 plates), ✅ Auto-scoring, ✅ Report generation

---

#### **Contrast Sensitivity Testing** - Week 16 (Post-MVP)
**Status:** ⚠️ **NOT PLANNED** (Important for early glaucoma, cataract detection)

**Tests:**
- **Pelli-Robson Chart:**
  - Large letters with decreasing contrast
  - Score: Log contrast sensitivity (0.0 to 2.0)
  - Normal: >1.65
  
- **CSV-1000 Test:**
  - Sine wave gratings at different spatial frequencies
  - Detects subtle vision loss before visual acuity changes

**Week 16 Deliverable:** ✅ Digital Pelli-Robson test, ✅ CSV-1000 simulator, ✅ Trend analysis

---

#### **Pediatric Eye Care Workflows** - Week 18 (Post-MVP)
**Status:** ⚠️ **NOT PLANNED** (Critical for eye hospitals with pediatric departments)

**Features:**
- **Red Reflex Test:** Normal/Abnormal (detect retinoblastoma, congenital cataracts)
- **Cover-Uncover Test:** Strabismus detection
- **Worth 4-Dot Test:** Binocular vision assessment
- **Cycloplegic Refraction:** For children (dilating drops to paralyze accommodation)
- **Growth Charts:** Track visual development by age

**Week 18 Deliverable:** ✅ Pediatric exam template, ✅ Red reflex documentation, ✅ Strabismus measurement tools

---

#### **Emergency Eye Care Protocols** - Week 19 (Post-MVP)
**Status:** ⚠️ **NOT PLANNED** (Critical for 24/7 eye hospitals)

**Emergency Templates:**
- **Acute Angle-Closure Glaucoma:**
  - Immediate IOP measurement
  - Emergency laser iridotomy protocol
  - Medication checklist (mannitol IV, acetazolamide, pilocarpine drops)
  
- **Chemical Burns:**
  - Immediate irrigation protocol (15 minutes continuous with saline)
  - pH testing (litmus paper, target pH 7)
  - Damage assessment (Roper-Hall classification Grade I-IV)
  
- **Ocular Trauma:**
  - Ruptured globe protocol (protective shield, NO pressure on eye)
  - Intraocular foreign body detection (CT scan order)
  - Tetanus prophylaxis
  
- **Central Retinal Artery Occlusion (CRAO):**
  - "Eye stroke" - 90-minute window for potential treatment
  - Ocular massage protocol
  - Anterior chamber paracentesis (lower IOP)
  - Immediate referral to neuro-ophthalmology

**Week 19 Deliverable:** ✅ Emergency protocol checklists, ✅ Triage system, ✅ Time-stamped workflow

---

### 📜 Compliance Enhancements

#### **21 CFR Part 11 (FDA Electronic Signatures)** - Week 2
**Status:** ⚠️ E-signing mentioned (DocuSign) but **not Part 11 compliant**

**FDA Requirements:**
- ✅ **Unique User Identity:** Every user has unique login (no shared accounts)
- ✅ **Authority Checks:** Verify user authorized to sign (role-based)
- ✅ **Audit Trail:** Log WHO signed, WHEN, WHERE (IP), WHAT document, hash of document
- ✅ **Non-Repudiation:** Signed documents cannot be altered (cryptographic hash stored)
- ✅ **Electronic Signature Types:**
  - Type 1: Username + password
  - Type 2: Biometric (optional - fingerprint on mobile)
  - Type 3: Cryptographic (digital certificate)

**Implementation:**
- Option 1: DocuSign (FDA 21 CFR Part 11 compliant SaaS)
- Option 2: Custom: HMAC signature + timestamp + SHA-256 hash of document

**Week 2 Enhanced Deliverable:** ✅ Part 11 compliant e-signature workflow, ✅ Audit trail, ✅ Tamper detection

---

#### **GDPR Compliance (If Serving EU Patients)** - Week 4
**Status:** ⚠️ **NOT MENTIONED** (Critical if treating European patients)

**GDPR Requirements:**
- ✅ **Right to Access:** Patient can download all their data (JSON export)
- ✅ **Right to Erasure ("Right to be Forgotten"):**
  - Anonymize patient data (replace name with "Patient #12345")
  - Keep medical records for legal requirement (7 years) but anonymized
- ✅ **Data Portability:** Export in machine-readable format (FHIR JSON)
- ✅ **Consent Management:**
  - Explicit consent for data processing
  - Separate consent for marketing emails
  - Easy withdrawal (single-click unsubscribe)
- ✅ **Data Breach Notification:**
  - Notify supervisory authority within 72 hours
  - Notify affected patients
  - Document breach in breach register

**Week 4 Deliverable:** ✅ GDPR consent forms, ✅ Data export API, ✅ Anonymization service

---

#### **SOC 2 Type II Certification** - Weeks 25-28 (Audit Preparation)
**Status:** ⚠️ **NOT MENTIONED** (Critical for enterprise clients, insurance companies)

**Trust Service Criteria:**
- **Security:** Implemented (OWASP compliance, encryption, access control)
- **Availability:** 99.9% uptime (Azure SLA, multi-region redundancy, disaster recovery)
- **Processing Integrity:** Data validation, error handling, reconciliation
- **Confidentiality:** Encryption, data masking, NDA with staff
- **Privacy:** HIPAA + GDPR compliance (consent, data minimization)

**Audit Process:**
- Engage SOC 2 auditor (Big 4 accounting firm: Deloitte, PwC, EY, KPMG)
- Provide evidence: Security policies, procedures, logs, penetration test reports
- Remediate findings
- Receive SOC 2 Type II report (12-month audit period)

**Week 28 Deliverable:** ✅ SOC 2 readiness assessment, ✅ Evidence collection, ✅ Auditor engagement

---

### ⚡ Performance & Scalability Targets

#### **Performance Benchmarks** - Week 27 Testing
**Targets:**
- **Page Load Time:**
  - First Contentful Paint (FCP): <1.5s
  - Largest Contentful Paint (LCP): <2.5s
  - Time to Interactive (TTI): <3.5s
  - Lighthouse Performance Score: >90
  
- **API Response Time:**
  - 50th percentile (median): <200ms
  - 95th percentile: <500ms
  - 99th percentile: <1000ms
  
- **Database Query Time:**
  - Simple SELECT: <50ms
  - Complex JOIN (3+ tables): <150ms
  - Report generation: <3s
  
- **Image Load Time:**
  - OCT scan (50MB DICOM): <10s
  - Fundus thumbnail (500KB JPEG): <2s
  
- **Concurrent Users:**
  - 500 users simultaneously (load test with k6)
  - No degradation under normal load
  - Graceful degradation under extreme load (queueing, rate limiting)

**Optimization Strategies:**
- ✅ Redis caching (permission checks, user sessions, frequently accessed data)
- ✅ Azure CDN (static assets, image thumbnails)
- ✅ Database indexing (composite indexes on frequent query patterns)
- ✅ Lazy loading (images, long lists, code splitting)
- ✅ React lazy imports (route-based code splitting)
- ✅ Compression (Brotli for text, WebP for images)
- ✅ Database connection pooling

**Week 27 Deliverable:** ✅ k6 load test passing (500 users), ✅ Lighthouse score >90, ✅ Performance monitoring dashboard

---

### 📱 Additional Enhancements

#### **Offline Mode (PWA - Progressive Web App)** - Week 28
**Status:** ⚠️ **NOT MENTIONED** (Critical for unreliable internet areas, rural clinics)

**Features:**
- ✅ **Service Worker:** Cache critical pages (dashboard, patient list, appointment scheduler)
- ✅ **IndexedDB:** Store offline data, queue changes
- ✅ **Sync on Reconnect:** Upload queued changes when internet restored
- ✅ **Offline Indicator:** Banner "⚠️ You are offline. Changes will sync when reconnected."

**Use Cases:**
- Doctor writes examination notes during power outage
- Rural clinic with intermittent internet connectivity
- Mobile clinic (eye camps, no WiFi)

**Week 28 Deliverable:** ✅ PWA manifest, ✅ Service worker caching strategy, ✅ Offline sync queue

---

## 📋 Final Gap Analysis Summary

### ✅ Critical Gaps (MUST FIX BEFORE LAUNCH):
1. ✅ **HL7 FHIR API** - Week 6 (interoperability with other hospitals, referrals)
2. ✅ **CPT Code Catalog** - Week 11 (billing, insurance claims, revenue cycle)
3. ✅ **IOL Power Calculation (7 formulas)** - Week 17 (accurate cataract surgery outcomes)
4. ✅ **Glaucoma Progression Analysis** - Week 13 (clinical decision support, prevent vision loss)
5. ✅ **Diabetic Retinopathy Grading** - Week 15 (standardized documentation, AI training data)
6. ✅ **21 CFR Part 11 E-Signatures** - Week 2 (regulatory compliance for surgical consents)
7. ✅ **OWASP Top 10 Security** - Weeks 1-4 (prevent data breaches, HIPAA violation fines)
8. ✅ **Performance Targets** - Week 27 (user satisfaction, doctor productivity)

### 🔶 High Priority (SHOULD HAVE):
9. ✅ **GDPR Compliance** - Week 4 (if treating European patients, medical tourism)
10. ✅ **Color Vision Testing** - Week 16 (comprehensive eye exams, professional driver licensing)
11. ✅ **Contrast Sensitivity** - Week 16 (early glaucoma detection, cataract assessment)
12. ✅ **Emergency Protocols** - Week 19 (24/7 operations, medico-legal protection)
13. ✅ **SOC 2 Type II** - Weeks 25-28 (enterprise hospital chains, insurance partnerships)

### 🔷 Medium Priority (NICE TO HAVE):
14. ✅ **Pediatric Workflows** - Week 18 (if hospital has pediatric ophthalmology department)
15. ✅ **Orthoptics Module** - Week 18 (strabismus management, binocular vision assessment)
16. ✅ **Offline Mode (PWA)** - Week 28 (rural clinics, eye camps, unreliable internet)

### ⏸️ Low Priority (FUTURE PHASES):
17. ⏸️ **Mobile Apps (iOS + Android)** - Weeks 29-32 (React Native, Phase 7)
18. ⏸️ **AI/ML (DR detection, glaucoma screening)** - Phase 7 (Google Health API, TensorFlow)
19. ⏸️ **Telemedicine** - Phase 7 (video consultations, rural outreach)
20. ⏸️ **Multi-language UI** - Phase 7 (Hindi, Arabic RTL, regional languages)

---

## ✅ 100% Implementation-Ready Checklist

**Standards Compliance:**
- ✅ HL7 FHIR R4 (10 resources for interoperability)
- ✅ DICOM (5 ophthalmic modalities: OP, OPT, OPV, OPM, OAM)
- ✅ ICD-10-CM (500+ ophthalmology diagnosis codes H00-H59)
- ✅ CPT Codes (200+ ophthalmology procedure codes 92000-92499, 66000-66999, 67000-67999)
- ⏸️ SNOMED CT (clinical terminology - future phase)
- ⏸️ LOINC (lab results - future phase)

**Security Standards:**
- ✅ OWASP Top 10 compliance (injection prevention, broken auth fix, XSS protection, etc.)
- ✅ TLS 1.3 encryption (in transit)
- ✅ AES-256 encryption (at rest: Azure SQL TDE, Blob Storage)
- ✅ Bcrypt/Argon2id password hashing (cost factor 12)
- ✅ JWT authentication (HS256 with 256-bit secret)
- ✅ RBAC + ABAC authorization (297 permissions)
- ✅ PostgreSQL RLS (row-level security, tenant isolation)
- ✅ Azure Key Vault (secrets management, 90-day key rotation)
- ✅ Security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
- ✅ Input validation (prevent injection, XSS)
- ✅ Rate limiting (prevent DDoS, brute force)

**Compliance:**
- ✅ HIPAA (PHI protection, audit logs, breach notification, 7-year retention)
- ✅ 21 CFR Part 11 (electronic signatures, audit trail, non-repudiation)
- ✅ NABH (National Accreditation Board for Hospitals & Healthcare Providers - India)
- ✅ WHO Patient Safety Standards (medication reconciliation, time-outs, error reporting)
- ✅ GDPR (if EU patients: consent, right to erasure, data portability)
- ✅ SOC 2 Type II (audit preparation for enterprise clients)

**Eye Healthcare Clinical Standards:**
- ✅ Visual Acuity (Snellen, LogMAR, ETDRS, Lea Symbols pediatric, low vision notation)
- ✅ Refraction Notation (sphere/cylinder/axis validation, minus-plus transposition)
- ✅ Glaucoma Staging (Hodapp-Parrish-Anderson, RNFL percentiles, progression analysis)
- ✅ Diabetic Retinopathy (ETDRS 5-grade classification, CSME assessment)
- ✅ IOL Power Calculation (7 formulas: SRK/T, Barrett, Haigis, Holladay, Hill-RBF, Kane, EVO)
- ✅ Color Vision Testing (Ishihara 24 plates, Farnsworth D-15)
- ✅ Contrast Sensitivity (Pelli-Robson, CSV-1000)
- ✅ Emergency Protocols (angle-closure glaucoma, chemical burns, ocular trauma, CRAO)

**UX Best Practices:**
- ✅ Nielsen's 10 Usability Heuristics (all implemented)
- ✅ WCAG 2.1 AA Accessibility (keyboard nav, screen reader support, 7:1 contrast AAA)
- ✅ Responsive Design (mobile <640px, tablet 640-1024px, desktop >1024px)
- ✅ Loading states (skeleton screens, progress bars, real-time feedback)
- ✅ Error prevention (validation, constraints, confirmation dialogs)
- ✅ Keyboard shortcuts (Ctrl+K search, Ctrl+N new, Ctrl+S save)
- ✅ Help documentation (tooltips, video tutorials, guided tours, searchable help center)

**Performance Targets:**
- ✅ Page load <2.5s (LCP - Largest Contentful Paint)
- ✅ API response <500ms (95th percentile)
- ✅ Database query <150ms (complex JOINs)
- ✅ OCT image load <10s (50MB DICOM file)
- ✅ 500 concurrent users (k6 load test target)
- ✅ Lighthouse score >90 (performance, accessibility, best practices, SEO)

**Technology Stack:**
- ✅ Backend: ASP.NET Core 8.0 + Entity Framework Core 9.0
- ✅ Frontend: Next.js 13.5.1 + React 18 + Tailwind CSS v4
- ✅ Database: PostgreSQL 17.6 (Azure Flexible Server)
- ✅ Cache: Azure Redis Premium P1 (5GB, 99.9% SLA)
- ✅ Storage: Azure Blob Storage (hot/cool/archive tiers)
- ✅ PACS: Orthanc (Docker container, DICOM server)
- ✅ Monitoring: Azure Application Insights + Log Analytics
- ✅ CI/CD: GitHub Actions (automated build, test, deploy)
- ✅ Package Manager: pnpm (NOT npm - workspace optimization)

**Documentation:**
- ✅ User guides (200+ pages covering all features)
- ✅ Video tutorials (10 videos, 3-5 min each, common workflows)
- ✅ API documentation (Swagger/OpenAPI auto-generated)
- ✅ In-app help (tooltips, contextual help icons, "Learn more" links)
- ✅ Troubleshooting guides (FAQ, common errors, contact support)

**🎯 READY FOR IMPLEMENTATION - START WEEK 1, DAY 1 (MONDAY) 🚀**

---

## �️ PREREQUISITES: Admin Management Complete (Weeks 1-4)

**CRITICAL:** Before starting eye hospital specialization, complete admin foundation with all HR modules, security enhancements, and organizational tools.

### Why Admin First?

Eye hospital features require robust HR infrastructure:
- **Ophthalmologist employment** needs contracts, licenses, probation tracking
- **Optometrist licenses** need auto-expiry alerts, renewal workflows
- **Surgical privileges** tracked via performance reviews and certifications
- **Laser equipment access** controlled via training module completion
- **Multi-branch operations** require hierarchy viewer for department management

### Admin Management Scope (4 Weeks) - Day-by-Day Sequential Plan

---

#### **WEEK 1: UI Foundation & People Management** 🎨

**Priority:** Redesign entire UI first, then build admin features on new foundation

**Day 1 (Monday): Tailwind v4 Migration + Design System** ⚡
- **Morning (4 hours):**
  - Upgrade Tailwind CSS v3 → v4 in `package.json` and `tailwind.config.ts`
  - Implement emerald green theme (#10b981 primary color palette)
  - Configure Google Fonts: Inter (UI), Plus Jakarta Sans (headings), IBM Plex Mono (clinical notes)
  - Update CSS variables for 5-color palette (emerald-50/100/500/600/700/800)
  - Add status colors: red-500 (critical), yellow-500 (warning), blue-500 (info), green-500 (success)
  
- **Afternoon (4 hours):**
  - Create reusable component library (shadcn/ui):
    - Button (primary/secondary/ghost, sm/md/lg sizes)
    - Card (with hover shadow transitions)
    - Table (sticky headers, zebra striping, sortable columns)
    - Form (floating labels, inline validation, required field asterisks)
    - Modal/Dialog (slide-in drawer for mobile, centered for desktop)
    - Toast notifications (top-right, 5s auto-dismiss, color-coded)
  - Replace all existing Heroicons with Lucide React icons
  - Configure responsive breakpoints (<640px mobile, 640-1024px tablet, >1024px desktop)

**Deliverables:** ✅ Tailwind v4 working, ✅ 6 reusable components, ✅ New color system applied

---

**Day 2 (Tuesday): Redesigned Admin Menu + Navigation** 🧭
- **Morning (4 hours):**
  - Implement new 5-section menu structure (Organization, People, Access Control, Security, Settings)
  - Reduce 16 flat menu items → 11 top-level with nested sub-menus
  - Desktop: Persistent sidebar with expanded sections
  - Tablet: Collapsible sidebar (icons-only, expand on hover)
  - Mobile: Bottom navigation bar + hamburger menu
  - Add breadcrumb navigation for deep pages
  
- **Afternoon (4 hours):**
  - Implement route structure:
    ```
    /admin/organization/hierarchy-viewer
    /admin/organization/tenants
    /admin/organization/organizations
    /admin/organization/branches
    /admin/organization/departments
    /admin/people/users-employees (merged page)
    /admin/people/hr/* (onboarding, contracts, licenses, probation, performance, training)
    /admin/access-control/roles-permissions (merged page)
    /admin/security/dashboard (merged: devices, sessions, emergency, suspicious)
    /admin/security/audit-logs
    /admin/settings (6 tabs: General, Email, Security, Notifications, Integrations, Compliance)
    ```
  - Add role-based navigation (Admin sees admin menu, Doctor sees clinical menu)

**Deliverables:** ✅ New menu structure live, ✅ All routes configured, ✅ Responsive navigation working

---

**Day 3 (Wednesday): Database Fixes + Accessibility** ♿
- **Morning (4 hours):**
  - **P0 Fixes:**
    - Add missing audit triggers (5 tables: `department`, `branch`, `organization`, `tenant`, `role`)
    - Create composite indexes for performance:
      - `idx_employee_tenant_status` on `employee(tenant_id, status)` WHERE deleted_at IS NULL
      - `idx_user_tenant_active` on `users(tenant_id, is_active)` WHERE deleted_at IS NULL
    - Add `is_clinical` BOOLEAN flag to `role` table (identifies clinical staff roles)
    - Create `clinical_staff_roles` view (auto-identifies Ophthalmologist, Optometrist, Nurse, etc.)
  
- **Afternoon (4 hours):**
  - **Accessibility (WCAG 2.1 AA):**
    - Keyboard navigation: Tab through all forms, Enter to submit, Esc to close modals
    - Screen reader: Add ARIA labels to all buttons, inputs, interactive elements
    - Color contrast: Ensure 7:1 ratio for all text (AAA level for medical data)
    - Focus indicators: 2px emerald-600 outline on focused elements
    - Live regions: Add `aria-live="polite"` for dynamic content updates (toasts, real-time dashboards)
    - Skip to content link for keyboard users
  - Test with Axe DevTools, fix all critical/serious issues

**Deliverables:** ✅ Database performance improved, ✅ Accessibility compliant, ✅ P0 bugs fixed

---

**Day 4 (Thursday): Users + Employees Merge** 👥
- **Morning (4 hours):**
  - Create unified "People Management" page `/admin/people/users-employees`
  - **Smart List View:**
    - Single table showing both users-only and employees
    - Columns: Photo, Name, Email, Role, Department, Employment Type, Status, Alerts
    - Status badges: 🟢 Active | 🟡 Probation | 🔴 Suspended | ⚪ Inactive | 🆕 Onboarding
    - Alert indicators: 🚨 License expires in 15 days | ⚠️ Probation review overdue | 🔔 Contract renewal due
  - Filters: By Role, By Department, By Status, By Alert Type
  - Search: Real-time search across name, email, phone
  
- **Afternoon (4 hours):**
  - **Unified Employee Profile Page** (left sidebar navigation):
    ```
    📋 Overview (quick stats, status, alerts)
    👤 Personal Info (edit name, contact, photo)
    💼 Employment Details (job title, department, manager, work schedule)
    🔐 Access & Permissions (roles, departments, login history)
    📄 Contracts (view/renew/terminate employment contracts)
    🎓 Licenses & Certifications (professional licenses, expiry tracking)
    🏆 Performance (reviews, goals, feedback)
    📚 Training (completed courses, pending requirements)
    ⏰ Probation (if applicable - progress tracker)
    🔔 Notifications (preference settings)
    📊 Activity Timeline (login history, role changes, department transfers)
    🗑️ Actions (suspend, reset password, terminate)
    ```
  - Quick Actions Toolbar: Reset Password | Send Email | View Audit Logs | Export Profile | Terminate Employment

**Deliverables:** ✅ Merged page working, ✅ Unified profile with 12 sidebar sections

---

**Day 5 (Friday): Smart Employee Creation Wizard + Onboarding Auto-Pilot** 🧙‍♂️
- **Morning (4 hours):**
  - **5-Screen Creation Wizard** (3-minute completion time):
    - **Screen 1 - Basic Info:** Name, email, phone, photo upload
    - **Screen 2 - Employment:** Role dropdown, Department, Employment Type (Full-time/Part-time/Contract), Start Date, Manager
    - **Screen 3 - Professional:** Upload license PDF, certifications (optional), specialization
    - **Screen 4 - Access:** Assign additional roles, set department permissions, configure MFA (SMS/Email/Authenticator App)
    - **Screen 5 - Review & Confirm:** Preview all info, click "Create & Start Onboarding"
  
- **Afternoon (4 hours):**
  - **Backend Auto-Actions (triggered by wizard):**
    ```csharp
    public async Task<EmployeeDto> CreateEmployeeWithOnboarding(CreateEmployeeWizardDto dto)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try {
            // 1. Create user account
            var user = await _userService.CreateUser(dto.Email, dto.Phone, dto.Role);
            
            // 2. Create employee record
            var employee = await _employeeService.CreateEmployee(dto, user.Id);
            
            // 3. Create professional_license entry (if uploaded)
            if (dto.LicensePdf != null)
                await _licenseService.CreateLicense(employee.Id, dto.LicensePdf, dto.LicenseNumber, dto.ExpiryDate);
            
            // 4. Assign to department
            await _departmentService.AssignEmployee(employee.Id, dto.DepartmentId);
            
            // 5. Start onboarding workflow (30-day checklist auto-created)
            await _onboardingService.StartOnboarding(employee.Id);
            
            // 6. Send welcome email with credentials
            await _emailService.SendWelcomeEmail(user.Email, user.TempPassword);
            
            // 7. Create first probation review task (3 months from start date)
            await _probationService.ScheduleReview(employee.Id, dto.StartDate.AddMonths(3));
            
            // 8. Log all actions to audit trail
            await _auditService.LogEmployeeCreation(employee.Id, HttpContext.GetCurrentUserId());
            
            await transaction.CommitAsync();
            return employee;
        }
        catch {
            await transaction.RollbackAsync();
            throw;
        }
    }
    ```
  
  - **Onboarding Auto-Pilot (30-day schedule):**
    - Day 1: Email sent "Welcome to Hospital" + login credentials
    - Day 1: Admin dashboard shows "Dr. Smith onboarding: 0/15 tasks complete"
    - Day 3: Auto-reminder to HR "Complete I-9 form verification"
    - Day 7: Auto-reminder to employee "Complete HIPAA training (due Day 14)"
    - Day 14: System checks if HIPAA training completed → auto-flag if missing
    - Day 30: Generate onboarding completion report → send to HR + manager
    - Day 90: Auto-create probation review task for manager

**Deliverables:** ✅ Wizard complete (5 screens), ✅ 8 auto-actions working, ✅ 30-day onboarding automated

**Week 1 End-of-Week Review:**
- ✅ Tailwind v4 + emerald theme applied to entire project
- ✅ New admin menu structure (16 → 11 items, 5 sections)
- ✅ Accessibility WCAG 2.1 AA compliant
- ✅ Users + Employees merged with unified profile
- ✅ Smart employee creation wizard (manual 8 steps → 1 wizard, 95% automated)
- 🎯 **Ready for Week 2: HR Core Modules**

---

#### **WEEK 2: HR Core (Tier 1) - 6 Modules** 📚

**Day 1 (Monday): Licenses Module (Enhanced with Auto-Expiry)** 📜
- **Morning (4 hours):**
  - Database migration: `professional_license` table enhancements
    ```sql
    ALTER TABLE professional_license ADD COLUMN auto_suspend_enabled BOOLEAN DEFAULT TRUE;
    ALTER TABLE professional_license ADD COLUMN grace_period_days INTEGER DEFAULT 7;
    ALTER TABLE professional_license ADD COLUMN notification_days_before INTEGER[] DEFAULT ARRAY[90, 60, 30, 15, 7];
    ALTER TABLE professional_license ADD COLUMN last_notification_sent_at TIMESTAMPTZ;
    ```
  - Backend: `LicenseService.cs`
    - `CheckExpiringLicenses()` - Daily cron job (runs at 6 AM)
    - `SendExpiryNotifications()` - Multi-channel (email + SMS + in-app notification)
    - `AutoSuspendExpiredLicenses()` - Runs 7 days after expiry, sets `user.is_active = FALSE`
  
- **Afternoon (4 hours):**
  - Frontend: `/admin/people/hr/licenses`
    - License list with status badges: 🟢 Valid | 🟡 Expiring Soon | 🔴 Expired | ⚪ Suspended
    - Alert timeline: "Expires in 15 days" | "Grace period (5 days left)" | "Auto-suspended"
    - Upload renewal: Drag-drop PDF, auto-extract expiry date via OCR (Tesseract.js)
    - Bulk actions: Notify all expiring, Export expiry report CSV
  - Email templates: 90-day, 60-day, 30-day, 15-day, 7-day, grace period, suspension notice

**Deliverables:** ✅ Auto-expiry working, ✅ Auto-suspension after 7 days, ✅ 6 notification templates

---

**Day 2 (Tuesday): Probation Module (Auto-Tracking + Manager Review)** ⏱️
- **Morning (4 hours):**
  - Database: `probation_period` table
    ```sql
    CREATE TABLE probation_period (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL REFERENCES employee(id),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        review_scheduled_date DATE,
        review_completed_date DATE,
        manager_id UUID REFERENCES employee(id),
        status VARCHAR(20) CHECK (status IN ('active', 'under_review', 'confirmed', 'extended', 'terminated')),
        review_outcome TEXT,
        auto_confirmation_enabled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );
    ```
  - Backend: `ProbationService.cs`
    - `AutoScheduleReview()` - Triggered 2 weeks before `end_date`
    - `SendReviewReminder()` - Email to manager + HR
    - `AutoConfirmProbation()` - If no review submitted by `end_date + 7 days`, auto-confirm employee
  
- **Afternoon (4 hours):**
  - Frontend: `/admin/people/hr/probation`
    - **Active Probation Dashboard:**
      - List: Employee, Start Date, End Date, Days Remaining, Manager, Status, Actions
      - Status: 🟡 Active | 🟠 Review Due | 🟢 Confirmed | 🔴 Extended | ⚪ Terminated
    - **Review Form (for managers):**
      - Performance Rating: 1-5 stars
      - Strengths (textarea)
      - Areas for Improvement (textarea)
      - Recommendation: Confirm | Extend (3 months) | Terminate
      - Final Comments
    - Auto-confirmation logic: If manager doesn't submit review within 7 days after probation end, system auto-confirms

**Deliverables:** ✅ Auto-tracking, ✅ Manager review workflow, ✅ Auto-confirmation fallback

---

**Day 3 (Wednesday): Performance Reviews Module (Goal Setting + 360 Feedback)** 🎯
- **Morning (4 hours):**
  - Database: `performance_review`, `performance_goal`, `performance_feedback_360`
  - Backend: `PerformanceReviewService.cs`
    - Quarterly review cycle (auto-create reviews every 3 months)
    - Goal tracking: Set goals → Mid-quarter check-in → End-quarter evaluation
    - 360-degree feedback: Manager + Peers + Self-assessment
  
- **Afternoon (4 hours):**
  - Frontend: `/admin/people/hr/performance`
    - **Goal Setting:**
      - SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)
      - Progress tracker: 0% → 25% → 50% → 75% → 100%
      - Alignment to company objectives
    - **360 Feedback Form:**
      - Self-assessment (employee fills)
      - Manager review (manager fills)
      - Peer feedback (3-5 peers, anonymous optional)
      - Aggregated view: Average scores, strengths/weaknesses word cloud
    - **Review Dashboard:**
      - Upcoming reviews (due this quarter)
      - Completed reviews (historical timeline)
      - Goal achievement rate (percentage chart)

**Deliverables:** ✅ Goal tracking, ✅ 360 feedback system, ✅ Quarterly automation

---

**Day 4 (Thursday): Training Module (Catalog + Enrollment + Completion)** 🎓
- **Morning (4 hours):**
  - Database: `training_course`, `training_enrollment`, `training_completion`
    - Course categories: HIPAA Compliance, Clinical Skills, Software Training, Leadership
    - Required vs Optional courses (role-based requirements)
    - Completion certificates (auto-generate PDF)
  
- **Afternoon (4 hours):**
  - Frontend: `/admin/people/hr/training`
    - **Course Catalog:**
      - Filter: By Category, By Duration, By Required/Optional
      - Course card: Title, Description, Duration, Instructor, Enroll Button
    - **Enrollment Workflow:**
      - Self-enroll (for optional courses)
      - Manager-assign (for required courses)
      - Auto-enroll (based on role - all doctors must complete HIPAA training)
    - **Completion Tracking:**
      - Progress bar: Videos watched, Quizzes completed, Final exam score
      - Certificate generation: Auto-generate PDF on 100% completion
      - Transcript: List of all completed courses with dates
    - **Admin View:**
      - Compliance dashboard: "85% of staff completed HIPAA training"
      - Overdue training: List of employees with pending required courses

**Deliverables:** ✅ Course catalog, ✅ Enrollment workflow, ✅ Auto-certificates

---

**Day 5 (Friday): Settings Service (6 Tabs: General, Email, Security, Notifications, Integrations, Compliance)** ⚙️
- **Full Day (8 hours):**
  - Database: `system_setting` table (key-value store with JSON support)
    ```sql
    CREATE TABLE system_setting (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenant(id),
        category VARCHAR(50) CHECK (category IN ('general', 'email', 'security', 'notifications', 'integrations', 'compliance')),
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value JSONB NOT NULL,
        is_encrypted BOOLEAN DEFAULT FALSE,
        updated_by_user_id UUID REFERENCES users(id),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    ```
  
  - Frontend: `/admin/settings` (6 tabs)
  
  **Tab 1: General Settings**
  - System Name (text input)
  - Logo Upload (drag-drop, 512x512 recommended)
  - Timezone (dropdown: UTC, America/New_York, Asia/Kolkata, etc.)
  - Default Language (dropdown: English, Hindi, Spanish, Arabic)
  - Date Format (MM/DD/YYYY vs DD/MM/YYYY)
  - Currency (USD, INR, EUR, AED)
  
  **Tab 2: Email Settings**
  - SMTP Server (host, port, username, password - encrypted)
  - From Address (e.g., noreply@hospital.com)
  - From Name (e.g., "Apollo Hospitals")
  - Email Templates:
    - Welcome Email (rich text editor)
    - Password Reset (Handlebars variables: {{name}}, {{resetLink}})
    - License Expiry Alert
    - Appointment Reminder
  - Test Email Button (send test to admin email)
  
  **Tab 3: Security Settings**
  - Session Timeout (dropdown: 15min, 30min, 1hr, 2hr, 4hr)
  - Password Policy:
    - Minimum Length (slider: 8-20 chars, default 12)
    - Require Uppercase ✓
    - Require Lowercase ✓
    - Require Digit ✓
    - Require Symbol ✓
    - Password Expiry (90 days, 180 days, Never)
  - MFA Enforcement:
    - Required for All Users ☑️
    - Required for Admins Only ☑️
    - Optional ☐
  - Max Concurrent Sessions (dropdown: 1, 2, 3, 5, Unlimited)
  - Emergency Access:
    - Enable Emergency Access Workflow ✓
    - Require Post-Review within 24 hours ✓
  
  **Tab 4: Notifications Settings**
  - WhatsApp (Twilio integration):
    - Account SID (encrypted)
    - Auth Token (encrypted)
    - From Number (+1234567890)
  - SMS (Twilio):
    - Same as WhatsApp or separate config
  - Push Notifications (Firebase Cloud Messaging):
    - Server Key (encrypted)
    - Sender ID
  - Notification Preferences (default):
    - Email ✓ | SMS ✓ | Push ✓ | WhatsApp ☐
  
  **Tab 5: Integrations Settings**
  - Payment Gateways:
    - Razorpay (API Key, Secret - encrypted)
    - Stripe (Publishable Key, Secret Key)
    - PayPal (Client ID, Secret)
  - External APIs:
    - Google Maps API Key (for branch locations)
    - Azure Communication Services (for telemedicine)
    - Orthanc PACS URL (for imaging)
  
  **Tab 6: Compliance Settings**
  - Audit Log Retention:
    - Keep audit logs for: 90 days | 180 days | 1 year | 3 years | 7 years (HIPAA compliant)
  - Breach Notification:
    - Auto-notify HIPAA officer on suspicious activity ✓
    - Email recipients (comma-separated)
  - Data Retention:
    - Soft-deleted records permanently delete after: 30 days | 90 days | Never
  - Consent Management:
    - Require patient consent for data sharing ✓
    - Consent expiry: 1 year (auto-expire and re-request)

**Deliverables:** ✅ Settings Service with 6 tabs, ✅ All configurations working, ✅ Encrypted sensitive data

**Week 2 End-of-Week Review:**
- ✅ 6 HR Core modules complete (Licenses, Probation, Performance, Training, Settings)
- ✅ Auto-expiry, auto-suspension, auto-confirmation workflows operational
- ✅ Settings Service with 50+ configuration options
- 🎯 **Ready for Week 3: HR Extended + Payroll**

---

#### **WEEK 3: HR Extended (Tier 2) + India Payroll** 💰

**Day 1 (Monday): Attendance Module (Web Clock In/Out, GPS + Photo Capture)** 📸
- **Morning (4 hours):**
  - Database: `attendance_record` table
    ```sql
    CREATE TABLE attendance_record (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL REFERENCES employee(id),
        clock_in_time TIMESTAMPTZ NOT NULL,
        clock_out_time TIMESTAMPTZ,
        clock_in_location POINT, -- GPS coordinates
        clock_in_photo_url VARCHAR(500), -- Azure Blob Storage URL
        clock_out_location POINT,
        clock_out_photo_url VARCHAR(500),
        work_hours_decimal NUMERIC(5,2),
        status VARCHAR(20) CHECK (status IN ('present', 'late', 'half_day', 'absent')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        deleted_at TIMESTAMPTZ -- 90-day retention, then hard delete
    );
    CREATE INDEX idx_attendance_employee_date ON attendance_record(employee_id, clock_in_time);
    ```
  
- **Afternoon (4 hours):**
  - Frontend: `/admin/people/hr/attendance`
    - **Web Clock-In Interface:**
      - Click "Clock In" → Request GPS permission → Capture photo (webcam) → Submit
      - Location verification: "Clocked in from Mumbai Branch (25m from office)"
      - Photo preview before submission
    - **Dashboard View:**
      - Today's Attendance: 147 Present | 12 Late | 3 Absent
      - Employee list with status badges
    - **90-Day Retention Policy:**
      - Soft delete after 90 days (`deleted_at` set)
      - Hard delete after 180 days (Azure Function runs nightly)

**Deliverables:** ✅ GPS tracking, ✅ Photo capture, ✅ 90-day retention automated

---

**Day 2 (Tuesday): Leave Management (Balance Tracking, Approval Workflow, Calendar)** 🗓️
- **Morning (4 hours):**
  - Database: `leave_balance`, `leave_request`, `leave_approval`
  - Backend: Leave accrual logic (1.5 days per month for India employees)
  - Approval workflow: Employee → Manager → HR (for > 7 days)
  
- **Afternoon (4 hours):**
  - Frontend: `/admin/people/hr/leave`
    - **Leave Balance Dashboard:**
      - Sick Leave: 8/12 days used
      - Casual Leave: 5/10 days used
      - Earned Leave: 15/21 days used
    - **Request Form:**
      - Leave Type dropdown
      - Date range picker
      - Reason (textarea)
      - Submit → Auto-email to manager
    - **Calendar View:**
      - Month view with team leaves color-coded
      - Conflict detection: "3 employees on leave same day"

**Deliverables:** ✅ Leave tracking, ✅ Approval workflow, ✅ Team calendar

---

**Day 3 (Wednesday): India Payroll - Part 1 (PF, ESI Calculations)** 🇮🇳
- **Full Day (8 hours):**
  - Database: `payroll_run`, `payroll_component`, `payroll_deduction`
  - **PF (Provident Fund) Calculation:**
    - Employee contribution: 12% of basic salary
    - Employer contribution: 12% (3.67% to EPF, 8.33% to EPS)
    - Example: Basic salary ₹50,000 → Employee PF ₹6,000 → Employer PF ₹6,000
  - **ESI (Employee State Insurance):**
    - Applicable if gross salary ≤ ₹21,000/month
    - Employee contribution: 0.75% of gross
    - Employer contribution: 3.25% of gross
    - Example: Gross ₹20,000 → Employee ESI ₹150 → Employer ESI ₹650
  - Frontend: Payroll calculator with real-time preview

**Deliverables:** ✅ PF calculation engine, ✅ ESI calculation engine, ✅ Payroll preview

---

**Day 4 (Thursday): India Payroll - Part 2 (Professional Tax, TDS Calculations)** 💸
- **Full Day (8 hours):**
  - **Professional Tax (state-wise slabs):**
    - Maharashtra: ₹200/month (if salary > ₹25,000)
    - Karnataka: ₹200/month (if salary > ₹15,000)
    - Other states: 0-300 based on slabs
  - **TDS (Tax Deducted at Source) - Income Tax:**
    - New regime vs Old regime calculator
    - Exemptions: 80C (₹1.5L), 80D (₹50K for health insurance)
    - Tax slabs (FY 2025-26):
      - 0-3L: 0%
      - 3-7L: 5%
      - 7-10L: 10%
      - 10-12L: 15%
      - 12-15L: 20%
      - >15L: 30%
  - Frontend: TDS declaration form (investment proofs upload)

**Deliverables:** ✅ Professional Tax calculator, ✅ TDS engine with new/old regime

---

**Day 5 (Friday): Benefits Administration (Insurance, PF Tracking, Reimbursements)** 🏥
- **Morning (4 hours):**
  - Database: `employee_benefit`, `reimbursement_claim`
  - Benefits catalog:
    - Health Insurance (family coverage)
    - Accident Insurance
    - Life Insurance
    - Gratuity tracking
  
- **Afternoon (4 hours):**
  - Frontend: `/admin/people/hr/benefits`
    - **Benefits Enrollment:**
      - Employee selects coverage (Self, Self+Spouse, Family)
      - Premium calculator
    - **Reimbursement Claims:**
      - Upload bills (medical, travel, mobile)
      - Approval workflow
      - Payment processing integration
    - **PF Statement:**
      - Month-wise contributions (employee + employer)
      - Download annual statement (PDF)

**Deliverables:** ✅ Benefits enrollment, ✅ Reimbursement workflow, ✅ PF statement generation

**Week 3 End-of-Week Review:**
- ✅ 5 HR Extended modules complete (Attendance, Leave, Payroll PF/ESI/PT/TDS, Benefits)
- ✅ India payroll fully compliant with labor laws
- ✅ GPS + photo attendance with 90-day retention
- 🎯 **Ready for Week 4: HR Advanced + Organization Tools**

---

#### **WEEK 4: HR Advanced (Tier 3) + Organization + Polish** 🏗️

**Day 1 (Monday): Document Management (Offer Letters, E-Signing with DocuSign/HelloSign)** 📝
- **Full Day (8 hours):**
  - Database: `employee_document`, `document_template`, `esignature_request`
  - Backend: DocuSign/HelloSign API integration
  - Frontend: `/admin/people/hr/documents`
    - **Document Templates:**
      - Offer Letter (auto-fill: name, role, salary, start date)
      - Employment Contract
      - Non-Disclosure Agreement (NDA)
      - Relieving Letter
    - **E-Signing Workflow:**
      1. HR generates document from template
      2. System sends to employee via DocuSign
      3. Employee signs electronically
      4. Signed PDF auto-stored in Azure Blob Storage
      5. Audit trail logged
    - **Document Repository:**
      - All employee documents in one place
      - Search, filter, bulk download

**Deliverables:** ✅ 4 document templates, ✅ E-signing integration, ✅ Auto-storage

---

**Day 2 (Tuesday): Disciplinary Actions + Exit Management** ⚖️
- **Morning (4 hours):**
  - Database: `disciplinary_action`, `exit_interview`, `clearance_checklist`
  - Disciplinary workflow: Verbal warning → Written warning → Suspension → Termination
  
- **Afternoon (4 hours):**
  - Frontend: `/admin/people/hr/disciplinary` and `/admin/people/hr/exit`
    - **Disciplinary Tracker:**
      - Incident logging
      - Warning letters (auto-generated)
      - Appeal process
    - **Exit Management:**
      - Resignation submission (employee self-service)
      - Exit interview form (feedback)
      - Clearance checklist (IT equipment return, knowledge transfer, final settlement)
      - Full-and-final settlement calculator

**Deliverables:** ✅ Disciplinary workflow, ✅ Exit process automation

---

**Day 3 (Wednesday): Hierarchy Viewer (react-flow + d3.js, PNG/PDF/SVG/JSON Export)** 🌳
- **Full Day (8 hours):**
  - **Interactive Org Chart:** `/admin/organization/hierarchy-viewer`
  - Libraries: `react-organizational-chart` + `d3.js`
  - Features:
    - **Visual Tree:**
      ```
      🏢 Apollo Hospitals (Tenant)
           |
      ┌────┴────┐
      │         │
  🏛️ India  🏛️ UAE
      |         |
  🏥 Mumbai 🏥 Dubai
      |         |
    [Depts]   [Depts]
      ```
    - Click node → Expand/collapse children
    - Right-click → Edit, Add Child, Move, Delete, View Details
    - Drag-and-drop → Move department to different branch (with confirmation)
    - Hover → Tooltip (staff count, capacity, contact)
    - Search → Highlight matching nodes, auto-expand tree
    - Zoom/Pan → Navigate large hierarchies
  
  - **Export Options:**
    - PNG (high-res 3000x2000, for presentations)
    - PDF (A4 landscape, for printing)
    - SVG (vector, for editing in Illustrator)
    - JSON (full tree data, for external tools)
  
  - **Right Panel - Quick Stats:**
    ```
    Selected: Mumbai Branch
    ├─ 📊 15 Departments
    ├─ 👥 247 Employees
    ├─ 🏥 150 Total Beds
    ├─ 💰 $2.5M Monthly Revenue
    └─ 📈 85% Utilization
    ```

**Deliverables:** ✅ Interactive org chart, ✅ 4 export formats, ✅ Drag-drop reorganization

---

**Day 4 (Thursday): Background Verification + HR Analytics Dashboard** 📊
- **Morning (4 hours):**
  - Database: `background_check`, `previous_employment_verification`
  - Third-party integration: Checkr, HireRight APIs (optional)
  - Frontend: `/admin/people/hr/background-verification`
    - Upload documents for verification
    - Status tracking: Initiated → In Progress → Verified → Discrepancy Found
  
- **Afternoon (4 hours):**
  - Frontend: `/admin/people/hr/analytics`
    - **HR Metrics Dashboard:**
      - Headcount trends (month-over-month)
      - Attrition rate (rolling 12 months)
      - Average time-to-hire (from job post to offer accepted)
      - Training completion rate by department
      - License expiry forecast (next 90 days)
    - Charts: Line graphs, bar charts, pie charts (using Chart.js)

**Deliverables:** ✅ Background check workflow, ✅ HR analytics dashboard with 5 KPIs

---

**Day 5 (Friday): Security Dashboard (Unified: Devices, Sessions, Emergency Access, Suspicious Activity) + MFA + Final Testing** 🛡️
- **Full Day (8 hours):**
  - **Security Dashboard:** `/admin/security/dashboard`
  
  **Top Section - Live Security Status (SignalR real-time):**
  ```
  ┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
  │ 🟢 System Secure │ 147 Active       │ 12 Emergency     │ 3 Suspicious     │
  │                  │ Sessions         │ Access Requests  │ Activities       │
  │ Last check: 2s   │ (5 new today)    │ (2 pending)      │ (flagged)        │
  └──────────────────┴──────────────────┴──────────────────┴──────────────────┘
  ```
  
  **Tab 1: Active Sessions (real-time with SignalR):**
  ```
  User            Device          Location         Login Time      Idle  Actions
  Dr. Smith       iPhone 13       Mumbai, India    09:15 AM        2m    [Terminate]
  Admin User      Windows PC      Delhi, India     08:30 AM        45m   [Terminate]
  ⚠️ Unknown      Linux Server    Russia           10:02 AM        1m    [Block Device]
  ```
  - Max Concurrent Sessions Enforcement: If user exceeds limit (e.g., 2 sessions), oldest session auto-terminated
  
  **Tab 2: Trusted Devices:**
  ```
  Device Name     User            Type        Last Login       Trust Score  Actions
  Work Laptop     Dr. Patel       Windows     Jan 24, 10:15    🟢 High 95%  [Revoke]
  Personal Phone  Nurse Sarah     iOS         Jan 23, 15:30    🟡 Medium 70% [Verify]
  ⚠️ New Device   Dr. Kumar       Android     Jan 24, 10:20    🔴 Low 20%   [Approve][Block]
  ```
  
  **Tab 3: Emergency Access:**
  ```
  Requestor       Reason                  Requested Scope        Risk    Status
  Dr. Emergency   "Code Blue - ICU Bed 5" Patient #12345 (1hr)  🟢 Low  [Approve][Reject]
  Admin Night     "After-hours support"   All Patients (4hrs)   🔴 High [Needs 2 Approvals]
  ```
  - **Emergency Access Workflow:**
    1. Doctor clicks "Request Emergency Access"
    2. Enters reason, selects scope (single patient or department), duration (1-4 hours)
    3. Risk assessment (auto-calculated based on scope + time)
    4. If risk = High, requires 2 approvals (e.g., Senior Doctor + Admin)
    5. Access granted for requested duration
    6. **Post-Review Required:** Within 24 hours, approver must review access logs and confirm legitimate use
    7. Audit log entry created with full trail
  
  **Tab 4: Suspicious Activity:**
  ```
  Event                           User        Time        Details
  🚨 Impossible Travel            Dr. Khan    10:15 AM    Login from Mumbai (last: NY 10 min ago)
  ⚠️ Bulk Export Attempt          Admin       09:30 AM    Tried exporting 500 patient records
  🔔 Failed Login (5 attempts)    Unknown     10:05 AM    IP: 192.168.1.100 (blocked)
  ```
  - ML-based anomaly detection:
    - Geographic anomalies (login from 2 cities within impossible timeframe)
    - Bulk data exports (>500 records)
    - After-hours access by non-emergency staff
    - Unusual data access (doctor accessing 100+ patient records in 1 hour)
  
  **Right Sidebar - Quick Actions:**
  - 🚨 Initiate Lockdown (disable all logins except super admin)
  - 📧 Send Security Alert (email all admins)
  - 🔒 Force All Users Logout
  - 📊 Generate Security Report
  
  **MFA Implementation:**
  - `/admin/people/users-employees/{id}/access` → "Configure MFA" button
  - Options: SMS (via Twilio), Email (TOTP code), Authenticator App (Google Authenticator, Authy - QR code)
  - Enforce MFA: Settings → Security → "Require MFA for All Users" toggle
  - Backup codes: Generate 10 one-time codes for account recovery
  
  **Final Testing:**
  - All 15 HR modules smoke tested
  - End-to-end workflow: Create employee → Onboarding → Probation → Performance review → License expiry → Auto-suspension
  - Security dashboard real-time updates verified (SignalR working)
  - Accessibility re-check (Axe DevTools - 0 critical issues)
  - Documentation: Update README.md with Week 1-4 completion status

**Deliverables:** ✅ Unified Security Dashboard (4 tabs), ✅ MFA with 3 options, ✅ Emergency Access with post-review, ✅ Max concurrent sessions enforced

**Week 4 End-of-Week Review:**
- ✅ 4 HR Advanced modules (Documents, Disciplinary/Exit, Hierarchy Viewer, Background Verification, HR Analytics)
- ✅ Unified Security Dashboard with real-time monitoring (SignalR)
- ✅ MFA enforcement + Emergency Access with post-review workflow
- ✅ Hierarchy Viewer with PNG/PDF/SVG/JSON export
- ✅ All 15 HR modules complete and tested
- ✅ Settings Service with 6 tabs (50+ config options)
- ✅ Max concurrent sessions enforcement
- ✅ Audit log retention policies configured
- ✅ Complete documentation updated
- 🎯 **Admin Management 100% COMPLETE - Ready for Week 5: Eye Hospital Phase 1A**

**📋 Week 4 Final Deliverables - Admin Management 100% Complete:**
- ✅ **UI/UX:** Tailwind v4 + emerald green theme applied to entire project
- ✅ **Accessibility:** WCAG 2.1 AA compliant (keyboard nav, screen readers, 7:1 contrast)
- ✅ **Navigation:** Redesigned menu (16 → 11 items, 5 sections: Organization, People, Access Control, Security, Settings)
- ✅ **15 HR Modules (3 tiers):**
  - **Tier 1:** Onboarding, Contracts, Licenses (auto-expiry + auto-suspend), Probation (auto-confirm), Performance (360 feedback), Training
  - **Tier 2:** Attendance (GPS + photo, 90-day retention), Leave, India Payroll (PF/ESI/PT/TDS complete), Benefits
  - **Tier 3:** Documents (e-signing), Disciplinary/Exit, Hierarchy Viewer (PNG/PDF/SVG/JSON export), Background Verification, HR Analytics
- ✅ **People Management:** Users + Employees merged, Smart Employee Creation Wizard (5 screens, 8 auto-actions), Unified Profile (12 sidebar sections)
- ✅ **Security Dashboard:** 4 tabs (Sessions, Devices, Emergency Access, Suspicious Activity) with real-time SignalR updates
- ✅ **MFA:** SMS/Email/Authenticator App support with backup codes
- ✅ **Emergency Access:** Workflow with risk assessment, dual approval for high-risk, 24-hour post-review required
- ✅ **Settings Service:** 6 tabs (General, Email, Security, Notifications, Integrations, Compliance) with 50+ configurations
- ✅ **Max Concurrent Sessions:** Enforcement (auto-terminate oldest session when limit exceeded)
- ✅ **Audit Log Retention:** Configurable (90 days to 7 years for HIPAA compliance)
- ✅ **Localization:** i18n infrastructure ready (English + Hindi + Kannada support)
- ✅ **Responsive Design:** Mobile (<640px), Tablet (640-1024px), Desktop (>1024px) layouts optimized
- ✅ **Database:** P0/P1 fixes applied (audit triggers, composite indexes, `is_clinical` flag on roles)
- ✅ **Demo Data:** 50 demo employees with realistic HR data across 6 branches
- ✅ **Documentation:** Complete user guides + video tutorials + in-app contextual help
- 🎯 **Admin Foundation Complete - Ready for Eye Hospital Phase 1A (Week 5)**

---

## 🎨 Redesigned Admin Menu Structure

**Before:** 16 flat items (confusing, hard to navigate)  
**After:** 5 sections, 11 top-level items, 6 new features (streamlined, intuitive)

```
🏠 ADMIN MANAGEMENT
├─ 📊 Overview                          [Dashboard with KPIs: headcount, attrition, license expiry]
│
├─ 🏢 ORGANIZATION                      [NEW SECTION]
│  ├─ Hierarchy Viewer ⭐               [NEW - Interactive org chart with react-flow + d3.js]
│  ├─ Tenants                          [Existing - Multi-tenant management]
│  ├─ Organizations                    [Existing - Regional organizations]
│  ├─ Branches                         [Existing - Enhanced with capacity tracking]
│  └─ Departments                      [Existing - Enhanced with access rules]
│
├─ 👥 PEOPLE                            [NEW SECTION]
│  ├─ Users & Employees ⭐              [MERGED - Was 2 separate pages, now unified]
│  │  ├─ Smart List View (status badges + alert indicators)
│  │  ├─ Smart Employee Creation Wizard (5 screens, 3 minutes)
│  │  └─ Unified Profile (12 sidebar sections)
│  │
│  ├─ HR Management ⭐                  [NEW - Consolidates all HR features]
│  │  ├─ Onboarding                   [NEW - 30-day auto-pilot workflow]
│  │  ├─ Contracts                    [NEW - E-signing with DocuSign/HelloSign]
│  │  ├─ Licenses                     [Enhanced - Auto-expiry + auto-suspend after 7 days]
│  │  ├─ Probation                    [NEW - Auto-tracking + auto-confirmation]
│  │  ├─ Performance Reviews          [NEW - Goal setting + 360 feedback]
│  │  ├─ Training                     [NEW - Catalog + enrollment + certificates]
│  │  ├─ Attendance                   [NEW - GPS + photo, 90-day retention]
│  │  ├─ Leave Management             [NEW - Balance tracking + approval workflow]
│  │  ├─ India Payroll                [NEW - PF/ESI/PT/TDS complete]
│  │  ├─ Benefits                     [NEW - Insurance + PF + reimbursements]
│  │  ├─ Documents                    [NEW - Templates + e-signing]
│  │  ├─ Disciplinary & Exit          [NEW - Warnings + exit clearance]
│  │  ├─ Background Verification      [NEW - Integration with Checkr/HireRight]
│  │  └─ HR Analytics                 [NEW - 5 KPIs dashboard]
│  │
│  └─ Bulk Operations                  [Existing - CSV import, bulk role assignment]
│
├─ 🔐 ACCESS CONTROL                    [NEW SECTION]
│  ├─ Roles & Permissions ⭐            [MERGED - Was 2 separate pages]
│  │  ├─ 3-Column Layout: Roles List | Permissions Matrix | Role Preview
│  │  ├─ Bulk Permission Toggle (click column header)
│  │  ├─ Permission Templates (HIPAA Privacy Officer, Eye Clinic Doctor)
│  │  └─ Conflict Detection (SoD violations)
│  │
│  ├─ Department Access Rules ⭐        [NEW - Moved from Departments page]
│  │  ├─ Configure which departments user can access
│  │  ├─ Approval requirements (requires manager approval?)
│  │  └─ Supervision rules (junior doctor needs supervision?)
│  │
│  └─ Access Requests ⭐                [NEW - Pending approvals workflow]
│     ├─ Request temporary access (duration-limited)
│     ├─ Risk assessment (low/medium/high)
│     └─ Approval workflow (auto-route based on risk)
│
├─ 🛡️ SECURITY                          [NEW SECTION]
│  ├─ Security Dashboard ⭐             [NEW - Merges Devices + Sessions + Emergency]
│  │  ├─ Tab 1: Active Sessions (real-time SignalR, max concurrent enforcement)
│  │  ├─ Tab 2: Trusted Devices (trust score, approve/block new devices)
│  │  ├─ Tab 3: Emergency Access (request/approve, risk assessment, 24hr post-review)
│  │  ├─ Tab 4: Suspicious Activity (impossible travel, bulk exports, failed logins)
│  │  └─ Right Sidebar: Quick Actions (lockdown, force logout, security report)
│  │
│  ├─ Audit Logs                       [Existing - Enhanced with retention policies]
│  │  ├─ Configurable retention (90 days - 7 years)
│  │  ├─ Advanced search (by user, action, date range, IP)
│  │  └─ Export for compliance audits
│  │
│  └─ Compliance Reports ⭐             [NEW - Automated HIPAA/NABH/WHO reports]
│     ├─ HIPAA Monthly Reports (PHI access, breach attempts, emergency access usage)
│     ├─ NABH Quarterly Audits (clinical doc completeness, medication errors, infection rates)
│     └─ WHO Patient Safety Indicators (falls, wrong-site surgery)
│
└─ ⚙️ SETTINGS                          [Existing - Enhanced from 4 to 6 tabs]
   ├─ General (system name, logo, timezone, language, date format, currency)
   ├─ Email (SMTP config, from address, email templates with Handlebars variables)
   ├─ Security (session timeout, password policy, MFA enforcement, max concurrent sessions)
   ├─ Notifications ⭐ [NEW - WhatsApp/SMS/Push config via Twilio/Firebase]
   ├─ Integrations ⭐ [NEW - Payment gateways, Google Maps, Azure Communication Services, Orthanc PACS]
   └─ Compliance ⭐ [NEW - Audit retention, breach notification, data retention, consent management]
```

**Count:**
- **Before:** 16 items (flat, no structure)
- **After:** 5 sections, 11 top-level items, 15+ sub-items
- **Removed Redundancy:** Users + Employees merged, Devices + Sessions + Emergency merged
- **Added:** 6 new major features (Hierarchy Viewer, HR Management, Access Requests, Security Dashboard, Compliance Reports, Notifications/Integrations/Compliance settings)

---

## 📱 Responsive Design Strategy

### Desktop (>1024px):
- **Sidebar:** Persistent, fully expanded with section headings
- **Layouts:** 3-column for data-heavy pages (list | details | preview)
- **Navigation:** Breadcrumb at top (Home > Admin > People > Users & Employees > Dr. Smith)
- **Modals:** Centered modal (max 800px width)
- **Tables:** Full-width with 8-10 columns visible

### Tablet (640-1024px):
- **Sidebar:** Collapsible (icons only, expand on hover or tap)
- **Layouts:** 2-column (list | details, hide preview)
- **Navigation:** Breadcrumb + hamburger menu icon (top-right)
- **Modals:** Centered modal (max 600px width)
- **Tables:** Horizontal scroll for >6 columns

### Mobile (<640px):
- **Sidebar:** Hidden, replaced with bottom navigation bar (5 icons)
- **Layouts:** Single column (stack list → details → preview vertically)
- **Navigation:** Hamburger menu (slide-in drawer from left)
- **Modals:** Full-screen slide-in drawer (bottom to top)
- **Tables:** Card view (each row becomes a card with stacked fields)
- **FAB (Floating Action Button):** Primary action at bottom-right (+ icon for "New Employee")

### Accessibility Enhancements:
- **Keyboard Navigation:**
  - Tab through all interactive elements in logical order
  - Enter to submit forms, Esc to close modals
  - Arrow keys to navigate table rows
  - Ctrl+K to open global search
  
- **Screen Reader:**
  - ARIA labels on all buttons (e.g., `aria-label="Close modal"`)
  - ARIA live regions for dynamic content (`aria-live="polite"` for toasts)
  - Semantic HTML (`<nav>`, `<main>`, `<aside>`, `<article>`)
  
- **Visual:**
  - Color contrast 7:1 (AAA level for medical data)
  - Focus indicators: 2px emerald-600 outline
  - Skip to content link (hidden, appears on Tab focus)
  - Reduced motion mode (`prefers-reduced-motion: reduce`)

---

---

## 🎯 Eye Hospital Implementation Roadmap (Weeks 5-28 | 24 Weeks)

### PHASE 1A: Eye Hospital Database Schema (Week 5-6)

Extend existing 144 tables with ophthalmology-specific structures.

**Database Migration: `migrations/20_eye_hospital_schema.sql`** - 12 New Tables:

1. **`refraction_test`** - Complete refraction data
   - OD/OS: sphere, cylinder, axis, add power, prism, base
   - Pupillary distance (PD): total, monocular (OD/OS), near PD
   - Vertex distance, working distance
   - Refraction type: subjective, objective, auto-refractor
   - Best corrected visual acuity (BCVA)

2. **`visual_acuity_measurement`** - Vision testing results
   - Distance VA (OD/OS/OU)
   - Near VA (OD/OS/OU)
   - Pinhole VA
   - Notation: Snellen (20/20), Decimal (1.0), LogMAR (0.0)
   - With/without correction

3. **`intraocular_pressure`** - IOP measurements
   - OD/OS values
   - Method: Goldmann, NCT (non-contact), iCare, Tonopen
   - Time of measurement (diurnal variation tracking)
   - Pachymetry (corneal thickness) for correction

4. **`slit_lamp_examination`** - Anterior segment findings
   - Lids & lashes: blepharitis, meibomian gland dysfunction
   - Conjunctiva: injection, chemosis, pinguecula, pterygium
   - Cornea: clarity, edema, scars, infiltrates, epithelial defects
   - Anterior chamber: depth, cells, flare
   - Iris: neovascularization, atrophy, transillumination
   - Lens: nuclear sclerosis, cortical, PSC cataracts (grading: 1-4)

5. **`fundus_examination`** - Posterior segment findings
   - Optic disc: size, color, cupping (C/D ratio), NVD
   - Macula: foveal reflex, edema, hemorrhage, exudates
   - Vessels: caliber, tortuosity, AV nicking, NVE
   - Periphery: breaks, tears, lattice, vitreous abnormalities
   - Diagnosis: diabetic retinopathy (NPDR/PDR), AMD, etc.

6. **`optical_inventory`** - Frames, lenses, coatings
   - Frame catalog: brand, model, type (full-rim/semi-rimless/rimless)
   - Frame specs: size (52-18-140), material, color, gender
   - Lens catalog: type (SV/bifocal/progressive), material, index
   - Coatings: anti-reflective, UV, blue-light, photochromic
   - Pricing: cost, MRP, margins

7. **`iol_catalog`** - Intraocular lenses for cataract surgery
   - Manufacturer, model, material (acrylic/silicone/PMMA)
   - IOL type: monofocal, multifocal, toric, extended depth of focus (EDOF)
   - Power range: +5.0 to +35.0 D (0.5 D steps)
   - A-constant, ACD constant (for IOL power calculation)
   - Optic diameter, overall length
   - Price, inventory tracking

8. **`laser_treatment`** - LASIK, PRK, YAG, retinal laser
   - Procedure type: LASIK, PRK, PTK, YAG capsulotomy, PRP (panretinal photocoagulation)
   - Eye: OD/OS
   - Pre-op refraction, corneal thickness
   - Ablation depth, optical zone, transition zone
   - Laser settings: energy, spot size, duration
   - Post-op outcomes, complications

9. **`contact_lens_fitting`** - CL trial and fitting
   - Brand, lens type: soft, RGP, toric, multifocal
   - Base curve (BC), diameter, power (OD/OS)
   - Over-refraction results
   - Fitting assessment: movement, centration, comfort
   - Teaching checklist: insertion, removal, care instructions

10. **`visual_field_test`** - Perimetry results
    - Machine: Humphrey, Octopus, FDT
    - Test strategy: 24-2, 10-2, 30-2, SITA Standard/Fast
    - OD/OS results
    - Mean deviation (MD), pattern standard deviation (PSD)
    - Visual field index (VFI)
    - Reliability indices: fixation losses, false positives, false negatives
    - DICOM file path (raw data)

11. **`oct_scan`** - Optical coherence tomography
    - Machine: Zeiss Cirrus, Heidelberg Spectralis, Topcon, Optovue
    - Scan type: macula cube, ONH cube, RNFL, angiography
    - OD/OS
    - Central retinal thickness (CRT)
    - Average RNFL thickness (by quadrant: superior, nasal, inferior, temporal)
    - GCC thickness (ganglion cell complex)
    - Cup-disc ratio
    - Signal strength (1-10)
    - DICOM series UID, file path

12. **`biometry`** - IOL power calculation measurements
    - Axial length (AL): IOLMaster, A-scan
    - Keratometry: K1, K2, steep axis
    - Anterior chamber depth (ACD)
    - Lens thickness (LT)
    - White-to-white distance
    - Target refraction: plano, -1.0, -2.0 (for IOL selection)
    - IOL power calculation results: SRK/T, Barrett Universal II, Haigis, Holladay 2

**Backend: Update `AppDbContext.cs`**
- Add 12 new DbSet properties
- Explicit column mappings using `HasColumnName()` for snake_case
- Navigation properties to link with patient, examination, appointment

---

### PHASE 1B: Eye Hospital Roles & Permissions (Week 6)

**Database Migration: `migrations/21_eye_hospital_roles.sql`**

Seed 7 eye-hospital specific roles with mapped permissions:

1. **Ophthalmologist** (Sub-specialties: Cataract, Retina, Glaucoma, Cornea, Pediatric)
   - All clinical permissions
   - Prescribe medications, order imaging, schedule surgery
   - Access to all examination modules

2. **Optometrist** (Sub-specialties: Refraction, Contact Lens, Low Vision)
   - Refraction testing, visual acuity, contact lens fitting
   - Optical prescription generation
   - Limited medication (only OTC lubricants)

3. **Ophthalmic Technician** (Roles: OCT, Fundus, Visual Field)
   - Imaging acquisition: OCT, fundus photography, visual field testing
   - Upload and tag images
   - Cannot interpret or report

4. **Optical Dispenser**
   - Frame selection, lens recommendation
   - Optical sales processing
   - Lens lab job tracking
   - Cannot prescribe

5. **Orthoptist** (Strabismus & Binocular Vision Specialist)
   - Ocular motility testing
   - Strabismus measurements
   - Vision therapy exercises

6. **Retina Specialist** (Medical & Surgical Retina)
   - Anti-VEGF injections (Lucentis, Eylea, Avastin)
   - Retinal laser (PRP, focal, grid)
   - Vitrectomy surgery

7. **Cataract Surgeon** (Phacoemulsification + IOL)
   - Cataract surgery scheduling
   - IOL selection and ordering
   - Pre-op/intra-op/post-op documentation

**40 New Permissions Mapped:**
- `refraction.create`, `refraction.read`, `refraction.update`
- `optical_sale.create`, `optical_sale.process`, `optical_inventory.manage`
- `oct_scan.upload`, `oct_scan.interpret`, `oct_scan.report`
- `fundus.upload`, `fundus.interpret`, `fundus.report`
- `visual_field.upload`, `visual_field.interpret`, `visual_field.report`
- `iol.select`, `iol.order`, `iol.calculate_power`
- `laser_treatment.authorize`, `laser_treatment.perform`, `laser_treatment.report`
- `contact_lens.fit`, `contact_lens.order`, `contact_lens.teach`
- `surgery.schedule`, `surgery.consent`, `surgery.intra_op_notes`, `surgery.post_op_follow_up`

**Integration:** Extend existing roles-permissions-enhanced.api.ts with new eye-specific permissions.

---

### PHASE 2A: Optometry & Refraction Module (Week 7-9)

Build complete vision testing system integrated with existing appointments and examinations.

**Backend:**
- **`OptometryController.cs`** - 15 endpoints
  - `POST /api/optometry/refraction` - Create refraction test
  - `GET /api/optometry/refraction/{patientId}` - Refraction history
  - `PUT /api/optometry/refraction/{id}` - Update refraction
  - `GET /api/optometry/visual-acuity/{patientId}` - VA history
  - `POST /api/optometry/contact-lens-fitting` - CL fitting record
  - `GET /api/optometry/contact-lens-fitting/{id}` - Fitting details
  - `POST /api/optometry/prescription/optical` - Generate optical Rx
  - `GET /api/optometry/prescription/optical/{id}` - Get optical Rx
  - `GET /api/optometry/refraction/compare` - Compare multiple refractions (progression)
  - `POST /api/optometry/auto-refraction/import` - Import from auto-refractor
  - `POST /api/optometry/visual-acuity` - Record VA measurement
  - `GET /api/optometry/patients-due-for-exam` - Due for annual eye exam
  - `POST /api/optometry/contact-lens/trial-lens` - Trial lens inventory
  - `GET /api/optometry/contact-lens/teaching-checklist/{fittingId}` - CL teaching
  - `DELETE /api/optometry/refraction/{id}` - Soft delete refraction

- **`OptometryService.cs`** - Business logic
  - Sphere/cylinder transposition (minus cyl ↔ plus cyl)
  - Vertex distance calculation (spectacle to contact lens conversion)
  - Contact lens power calculation from spectacle Rx
  - BCVA (best corrected visual acuity) tracking
  - Optical prescription generation with PD measurement

**Frontend:**
- **`apps/hospital-portal-web/src/app/(main)/optometry/page.tsx`** - Main optometry dashboard
  - Today's appointments with refraction status
  - Pending optical prescriptions
  - Contact lens fitting schedule

- **`src/app/(main)/optometry/refraction/[patientId]/page.tsx`** - Refraction testing interface
  - **RefractionTestForm** component:
    - Auto-refraction import (CSV/manual entry)
    - OD/OS input grids (sphere, cylinder, axis, add, prism, base)
    - Axis wheel visualization (0-180 degrees)
    - PD measurement input (monocular or binocular)
    - Vertex distance slider (8-15mm, default 12mm)
    - Manual override for subjective refinement
    - BCVA recording with Snellen/Decimal/LogMAR converter
    - Save as draft / Finalize button

  - **VisualAcuityChart** component:
    - Distance VA: Snellen chart display (20/20, 20/30, etc.)
    - Near VA: Jaeger chart (J1, J2, etc.)
    - Notation conversion: Snellen ↔ Decimal ↔ LogMAR
    - Pinhole improvement indicator

  - **ContactLensFittingWizard** (5 steps):
    1. Trial lens selection (brand, BC, diameter, power)
    2. Over-refraction measurement
    3. Fitting assessment (movement, centration, vision)
    4. Teaching checklist (insertion, removal, care, schedule)
    5. Final prescription and order

**Design System:**
- Emerald green primary (#10b981) for action buttons
- Clinical grays (#f9fafb backgrounds, #374151 text)
- Tailwind CSS v4 components
- shadcn/ui forms, modals, tables
- Lucide icons: Eye, Glasses, Contact

---

### PHASE 2B: Optical Shop & Dispensing (Week 9-11)

Implement eyewear sales and lens lab integration.

**Backend:**
- **`OpticalShopController.cs`** - 18 endpoints
  - Frame catalog CRUD
  - Lens selection wizard
  - Optical sale creation (frame + lenses + coatings)
  - Job tracking (order → surfacing → edging → quality check → delivery)
  - Pricing calculator (frame + lens base + coatings)
  - Inventory management (frame stock, lens stock)
  - Sales reports (daily, monthly, by branch)

- **`OpticalInventoryService.cs`** - Business logic
  - Frame compatibility check (bridge width, temple length for face shape)
  - Lens material selection based on prescription (high index for high myopia)
  - Coating upsell logic (recommend AR coating for computer users)
  - Surfacing lab integration API (if external lab used)
  - Delivery time estimation

**Frontend:**
- **`apps/hospital-portal-web/src/app/(main)/optical/page.tsx`**
  - Tabs: New Sale | Pending Jobs | Delivered | Inventory

- **`src/app/(main)/optical/sale/create/page.tsx`**
  - **FrameCatalog** component:
    - 3D frame viewer (if images available)
    - Face shape matching algorithm (round/oval/square/heart)
    - Filter: brand, material, price range, gender
    - Try-on simulation (upload selfie, overlay frame)

  - **LensSelectionWizard**:
    - Lens type: single vision, bifocal, progressive, occupational
    - Material: CR-39, polycarbonate, hi-index (1.56, 1.61, 1.67, 1.74)
    - Coating selection with pricing:
      - Anti-reflective (AR) - $50
      - UV protection - included
      - Blue light filter - $30
      - Scratch-resistant - $20
      - Photochromic (Transitions) - $120
    - Lens thickness visualization
    - Total price calculation

  - **JobTracker** component:
    - Order status workflow:
      1. Ordered → Awaiting lab
      2. Surfaced → Lenses ground to prescription
      3. Edged → Lenses cut to frame shape
      4. Quality Check → Verify prescription accuracy
      5. Delivered → Customer pickup

  - **POS Integration**: Links to existing billing system for payment

---

### PHASE 3A: Ophthalmology Examination Templates (Week 12-14)

Create structured clinical documentation system for eye exams.

**Backend:**
- **Extend `ExaminationsController.cs`** - 12 new endpoints
  - `POST /api/examinations/ophthalmology` - Create structured eye exam
  - `GET /api/examinations/templates/{specialty}` - Get exam template (cataract/glaucoma/retina/cornea)
  - `POST /api/examinations/slit-lamp` - Slit lamp findings
  - `POST /api/examinations/fundus` - Fundus findings
  - `PUT /api/examinations/iop` - IOP measurement
  - `GET /api/examinations/ophthalmology/{id}` - Get full exam
  - `POST /api/examinations/diagnosis` - Add diagnosis with ICD-10 code
  - `GET /api/examinations/differential-diagnosis` - Suggested diagnoses based on findings

- **`OphthalExaminationService.cs`**
  - Template engine: SOAP notes for cataract, glaucoma, retina, cornea workflows
  - Differential diagnosis suggester (AI-powered in Phase 7, rule-based initially)
  - ICD-10 code auto-assignment based on findings
  - Image annotation storage (linked to slit lamp/fundus diagrams)

**Frontend:**
- **`apps/hospital-portal-web/src/app/(main)/examinations/ophthalmology/page.tsx`**
  
  - **StructuredExamForm** component:
    - Dropdown cascades for common findings (e.g., Cataract → NS/Cortical/PSC → Grade 1-4)
    - Auto-complete for diagnoses (typeahead with ICD-10 codes)
    - Quick templates: "Normal Exam", "Diabetic Retinopathy", "Glaucoma Suspect"

  - **SlitLampDiagram** component:
    - Clickable eye diagram (anterior segment)
    - Annotation tools (freehand draw, shapes, text labels)
    - Pre-defined findings library (cataract, corneal opacity, AC cells)
    - Save annotations with exam

  - **FundusDrawingTool** component:
    - Optic disc drawing (annotate cupping, pallor, hemorrhages)
    - Macula annotation (edema, exudates, drusen)
    - Vessel sketching (tortuosity, AV nicking, NVE)
    - Save as image attached to exam

  - **IOPTrendChart** component:
    - Time-series graph of IOP measurements (OD/OS separate lines)
    - Diurnal variation curve (multiple readings per day)
    - Target IOP indicator line
    - Export to PDF for patient education

---

### PHASE 3B: Imaging Integration (OCT/Fundus/VF) (Week 14-16)

Implement diagnostic imaging workflows with PACS integration.

**Backend:**
- **`ImagingController.cs`** - 20 endpoints
  - `POST /api/imaging/oct/upload` - Upload OCT scan
  - `POST /api/imaging/fundus/upload` - Upload fundus photo
  - `POST /api/imaging/visual-field/upload` - Upload VF test
  - `GET /api/imaging/oct/{studyId}` - Retrieve OCT scan
  - `GET /api/imaging/compare` - Compare studies (progression analysis)
  - `POST /api/imaging/report` - Generate imaging report
  - `GET /api/imaging/pending-reports` - Studies awaiting interpretation
  - `POST /api/imaging/ai-analysis` - Trigger AI analysis (diabetic retinopathy grading)
  - `GET /api/imaging/dicom/download/{studyId}` - Download DICOM files
  - Upload endpoints for all modalities
  - Comparison tools (side-by-side, change detection)

- **`ImagingService.cs`**
  - **Orthanc PACS Integration** (deployed Week 14):
    - DICOM C-STORE receiver
    - Study metadata extraction
    - WADO (Web Access to DICOM Objects) for retrieval
  - OCT thickness calculator (ETDRS grid: central, inner ring, outer ring averages)
  - Fundus lesion detector (diabetic retinopathy auto-grading using AI - Phase 7)
  - Visual field analyzer: MD, PSD, VFI extraction from DICOM

**Frontend:**
- **`apps/hospital-portal-web/src/app/(main)/imaging/page.tsx`**
  
  - **OCTViewer** component:
    - B-scan display (cross-sectional retinal image)
    - En-face view (top-down view of retina)
    - Thickness map (color-coded heat map)
    - Layer segmentation overlay (ILM, GCL, INL, ONL, RPE layers)
    - RNFL deviation map (comparison to normative database)
    - Zoom, pan, brightness/contrast controls

  - **FundusViewer** component:
    - High-resolution fundus photo display
    - Zoom/pan with smooth transitions
    - Annotation tools (circle microaneurysms, mark exudates)
    - Disease highlighting (auto-detected lesions in yellow)
    - Side-by-side comparison for progression

  - **VisualFieldAnalyzer** component:
    - Grayscale plot (visual representation of sensitivity)
    - Numeric plot (dB values per point)
    - Probability plot (deviation from normal)
    - GHT (Glaucoma Hemifield Test) results
    - Reliability indices display

  - **ComparisonTool** component:
    - Side-by-side view (2-4 studies simultaneously)
    - Progression analysis with change detection
    - Time-series graphs (e.g., RNFL thickness over time)
    - Export comparison report to PDF

**PACS Setup (Orthanc):**
- Deploy Orthanc as Docker container on Azure App Service
- Configure DICOM port (4242) for C-STORE from imaging machines
- WADO-RS endpoint for web-based retrieval
- Azure Blob Storage backend for DICOM files (hybrid approach)

---

### PHASE 4A: Surgical Workflow - Cataract & IOL (Week 17-19)

Build complete cataract surgery management system.

**Backend:**
- **Extend `surgical_schedule` table**, create **`CataractSurgeryController.cs`** - 25 endpoints
  - Pre-op checklist (medical clearance, COVID test, consent signed)
  - Biometry data entry (AL, K1, K2, ACD, LT)
  - IOL calculation (SRK/T, Barrett Universal II, Haigis, Holladay 2 formulas)
  - IOL selection and ordering
  - Consent generation (e-signature)
  - OT scheduling (integrated with main appointments)
  - Intra-operative notes (phaco settings, complications, IOL power implanted)
  - Post-op follow-up (Day 1, Week 1, Month 1, Month 3)

- **`IOLCalculatorService.cs`**
  - **SRK/T Formula** (free, widely used):
    ```
    IOL Power = A - 2.5 * AL - 0.9 * K
    ```
  - **Barrett Universal II** (requires license ~$1000/year - premium accuracy)
  - **Haigis Formula** (free, uses 3 constants: a0, a1, a2)
  - **Holladay 2** (requires license ~$2000/year - most advanced)
  - Personalized lens constant optimization
  - Target refraction calculator (plano, -1.0, -2.0 for near/distance preference)

**Frontend:**
- **`apps/hospital-portal-web/src/app/(main)/surgery/cataract/page.tsx`**

  - **PreOpAssessment** component:
    - Medical clearance checklist (cardiac, diabetic, hypertension controlled)
    - Medications review (stop blood thinners 5 days prior)
    - Anesthesia consent
    - COVID-19 test result upload

  - **BiometryInput** component:
    - A-scan vs IOLMaster data entry
    - Axial length (OD/OS)
    - Keratometry (K1, K2, steep axis)
    - Anterior chamber depth
    - Lens thickness
    - Target refraction selection

  - **IOLCalculatorWidget** component:
    - Formula comparison table:
      | Formula | IOL Power (OD) | IOL Power (OS) | Predicted Refraction |
      |---------|----------------|----------------|----------------------|
      | SRK/T   | +22.0 D        | +21.5 D        | -0.25 D              |
      | Barrett | +21.5 D        | +21.0 D        | -0.10 D              |
      | Haigis  | +22.0 D        | +21.5 D        | -0.30 D              |
    - Target refraction selector (plano, -1.0 for monovision, -2.0 for near)
    - Recommended IOL highlighted
    - Print biometry report

  - **ConsentGenerator** component:
    - Pre-filled consent form with patient demographics
    - Video explanation of surgery (embedded YouTube/Vimeo link)
    - E-signature pad (sign on tablet/phone)
    - Witness signature (staff member)
    - Save as PDF

  - **OTScheduler** component:
    - Integrated with main appointments calendar
    - OT availability (Morning slot: 8am-12pm, Afternoon: 2pm-6pm)
    - Surgeon assignment
    - Anesthetist assignment
    - Estimated duration (30 minutes per eye)

  - **IntraOpForm** component:
    - Phacoemulsification settings:
      - Ultrasound power (%), time (seconds)
      - Fluid settings (bottle height, aspiration, vacuum)
    - IOL power implanted (confirm matches calculated)
    - Complications checklist (posterior capsule rupture, vitreous loss, zonular dialysis)
    - Surgeon notes (freetext)

  - **PostOpProtocol** component:
    - Medication schedule (antibiotic drops + steroid drops tapering)
    - Follow-up appointments auto-scheduled (Day 1, Week 1, Month 1)
    - Automated reminders (SMS/email to patient)
    - Post-op UCVA (uncorrected visual acuity) tracking
    - Complication monitoring (endophthalmitis, CME, high IOP)

---

### PHASE 4B: Laser Treatments (LASIK/PRK/YAG) (Week 19-21)

Implement refractive and therapeutic laser procedures.

**Backend:**
- **`LaserTreatmentController.cs`** - 18 endpoints
  - Candidacy assessment (age >18, stable refraction, corneal thickness >500µm)
  - Topography import (Pentacam, Orbscan)
  - Ablation planning (treatment zone, optical zone, astigmatism correction)
  - Consent generation (risks: dry eye, undercorrection, halos)
  - Treatment execution record
  - Post-op tracking (UCVA, BCVA, complications)

- **`LaserPlanningService.cs`**
  - Wavefront-guided ablation calculator
  - Epithelial thickness predictor (for PRK vs LASIK decision)
  - Corneal biomechanics analyzer (ectasia risk screening)
  - Nomogram adjustments (personalized for surgeon/laser platform)

**Frontend:**
- **`apps/hospital-portal-web/src/app/(main)/laser/page.tsx`**

  - **CandidacyChecker** component:
    - Contraindication screening checklist:
      - Age < 18 or >65
      - Unstable refraction (changed >0.5D in last year)
      - Corneal thickness < 500µm
      - Keratoconus or forme fruste keratoconus
      - Autoimmune disease, uncontrolled diabetes
    - Pass/fail indicator with explanation

  - **TopographyViewer** component:
    - Axial map (curvature)
    - Tangential map (power)
    - Elevation map (anterior/posterior)
    - Keratometry values (K-steep, K-flat, astigmatism axis)
    - Irregularity indices

  - **AblationPlanner** component:
    - Treatment zone selector (6.0-7.0mm, default 6.5mm)
    - Optical zone selector (5.5-6.5mm)
    - Transition zone visualization
    - Ablation depth calculator
    - Residual stromal bed thickness (RSB) indicator (must be >300µm)

  - **LaserLog** component:
    - Energy level (mJ)
    - Spot size (mm)
    - Pulse duration (femtoseconds for femto-LASIK)
    - Total treatment time
    - Complications: flap wrinkle, epithelial ingrowth, DLK (diffuse lamellar keratitis)

  - **PostLASIKFollowUp** component:
    - Uncorrected VA (UCVA) tracking (Day 1, Week 1, Month 1, Month 3, Month 6)
    - Flap status (well-positioned, wrinkle, dislocation)
    - Dry eye assessment (Schirmer test, TBUT)
    - Regression tracking (myopic regression over time)

---

### PHASE 5A: Patient Portal - Eye Hospital Edition (Week 22-24)

Create patient-facing portal with eye-specific features.

**Backend:**
- **`PatientPortalController.cs`** - 30 endpoints
  - Patient self-registration (email/phone OTP)
  - Appointment booking (select doctor, timeslot, reason)
  - Medical records access (prescriptions, lab results, imaging)
  - Prescription download (PDF)
  - Bill payment integration (Razorpay/Stripe)
  - Telehealth video consultation

- **`PatientEngagementService.cs`**
  - Appointment reminder SMS/WhatsApp (Twilio): 24hrs before, 1hr before
  - Medication adherence tracker (did you use eye drops today?)
  - Post-op instruction chatbot (FAQ about cataract surgery recovery)
  - Satisfaction survey automation (NPS score after visit)

**Frontend:**
- **`apps/hospital-portal-web/src/app/patient/`** - Separate patient-facing routes

  - **`/patient/login/page.tsx`**:
    - OTP-based authentication (phone number + 6-digit OTP)
    - No password required (patient-friendly)
    - Remember device (30 days)

  - **`/patient/dashboard/page.tsx`**:
    - Upcoming appointments card
    - Recent test results (OCT, fundus, VF thumbnails)
    - Pending bills
    - Quick actions: Book Appointment, View Prescriptions, Pay Bill

  - **`/patient/book-appointment/page.tsx`**:
    - Doctor selector (filter by specialty: Cataract, Retina, Glaucoma)
    - Timeslot picker (available slots highlighted in green)
    - Insurance verification (auto-check eligibility via TPA API)
    - Reason for visit (dropdown + freetext)
    - Confirmation SMS sent

  - **`/patient/medical-records/page.tsx`**:
    - Tabs: Prescriptions | Lab Results | Imaging | Visit Notes
    - PDF download for each document
    - OCT/fundus viewer (read-only, no editing)
    - Restricted access (only own records, no family members unless linked)

  - **`/patient/billing/page.tsx`**:
    - Invoice history (pending, paid, overdue)
    - Online payment button (redirects to Razorpay/Stripe checkout)
    - Receipt download (PDF with QR code for verification)
    - Payment history graph

  - **`/patient/telehealth/page.tsx`**:
    - Video consultation (Azure Communication Services)
    - Screen sharing (doctor shows OCT scan, explains findings)
    - Chat window (type questions during consultation)
    - Digital prescription issued at end of call

---

### PHASE 5B: Healthcare Compliance & Reporting (Week 24-26)

Finalize regulatory compliance automation.

**Backend:**
- **`ComplianceReportingService.cs`**
  - Scheduled HIPAA monthly reports:
    - PHI access summary (who accessed which patient records)
    - Breach attempts (failed logins, unauthorized access)
    - Emergency access usage (frequency, approval workflow compliance)
    - Encryption status (are all patient records encrypted at rest?)
  - NABH quarterly audits:
    - Clinical documentation completeness (% of exams with all required fields)
    - Medication errors (wrong drug, wrong dose, wrong eye OD vs OS)
    - Infection rates (post-op endophthalmitis, surgical site infections)
  - WHO standards tracking:
    - Patient safety indicators (falls, wrong-site surgery, medication errors)
    - Essential medicines availability (core eye medications in stock ≥90% time)

- **`BreachDetectionService.cs`**
  - ML-based anomaly detection:
    - Unusual data access (doctor accessing 100+ patient records in 1 hour)
    - Bulk exports (exporting >500 records to CSV)
    - Geographic anomalies (login from Mumbai and New York within 10 minutes - impossible travel)
    - After-hours access (login at 3am for non-emergency staff)

**Frontend:**
- **`apps/hospital-portal-web/src/app/(main)/admin/compliance/page.tsx`** (enhanced)

  - **ComplianceDashboard** component:
    - HIPAA score card (green: 100% compliant, yellow: 90-99%, red: <90%)
    - NABH score card (10 parameters, overall score)
    - WHO patient safety score
    - Last audit date, next audit due date

  - **BreachInvestigator** component:
    - Suspicious activity drilldown:
      - Event details (who, what, when, where, why flagged)
      - Investigation status (pending, investigating, resolved, escalated)
      - Actions taken (user notified, access revoked, reported to HIPAA officer)

  - **ScheduledReports** component:
    - Configure report frequency (daily, weekly, monthly, quarterly)
    - Email recipients (compliance officer, CIO, legal team)
    - Report templates (HIPAA, NABH, ISO 27001, GDPR)

  - **AuditChecklist** component:
    - Requirement tracking (checklist of 50+ HIPAA requirements)
    - Evidence upload (policies, procedures, training records)
    - Completion percentage
    - Gap analysis (what's missing?)

  - **RegulatoryCalendar** component:
    - Deadline tracker (NABH accreditation renewal, HIPAA audit due)
    - Notifications (email 30 days before deadline)
    - Task assignment (assign HIPAA training completion to all users)

---

### PHASE 6A: Design System Implementation (Week 26-27)

Apply consistent healthcare UI/UX across all eye hospital modules.

**Design System Specification:**

**Color Palette:**
```css
/* Emerald Green Primary (Clinical Trust) */
--primary-50: #f0fdf4;
--primary-100: #dcfce7;
--primary-500: #10b981;  /* Main primary */
--primary-600: #059669;  /* Hover state */
--primary-700: #047857;  /* Active state */
--primary-800: #065f46;  /* Dark mode primary */

/* Clinical Grays (Clean Medical Environment) */
--neutral-50: #f9fafb;   /* Backgrounds */
--neutral-100: #f3f4f6;  /* Cards */
--neutral-700: #374151;  /* Body text */
--neutral-900: #111827;  /* Headings */

/* Status Colors (Medical Alerts) */
--red-500: #ef4444;      /* Critical/Emergency */
--yellow-500: #eab308;   /* Warning */
--blue-500: #3b82f6;     /* Info */
--green-500: #22c55e;    /* Success/Normal */
```

**Typography:**
- **UI/Interface:** Inter (Google Fonts)
  - Body: 16px/1.5 line-height
  - Headings: 24px/32px/40px (H3/H2/H1)
- **Clinical Notes:** IBM Plex Mono (Monospace for structured data)
  - Examination findings, lab results
- **Headings:** Plus Jakarta Sans (Modern, professional)

**Component Library (shadcn/ui + Tailwind v4):**

1. **Button:**
   - Primary: emerald-600 background, white text
   - Secondary: outlined, emerald-600 border
   - Ghost: transparent, emerald-600 text (hover: emerald-50 bg)
   - Sizes: sm (32px), md (40px), lg (48px)

2. **Card:**
   - Background: white
   - Border: neutral-200 (1px)
   - Shadow: subtle (0 1px 3px rgba(0,0,0,0.1))
   - Hover: shadow-md (0 4px 6px rgba(0,0,0,0.1))

3. **Table:**
   - Sticky headers (position: sticky, top: 0)
   - Zebra striping (even rows: neutral-50 background)
   - Hover: neutral-100 background
   - Sortable columns (click header to sort)

4. **Form:**
   - Inline validation (real-time error messages)
   - Helper text below inputs (gray-500, 14px)
   - Required fields marked with red asterisk
   - Floating labels (Material Design style)

5. **Modal/Dialog:**
   - Slide-in drawer for mobile (<640px)
   - Centered modal for desktop
   - Backdrop: rgba(0,0,0,0.5)
   - Close on backdrop click (optional)

6. **Toast Notifications:**
   - Position: top-right
   - Auto-dismiss: 5 seconds (adjustable)
   - Grouping: stack multiple toasts
   - Colors: green (success), red (error), yellow (warning), blue (info)

**Icons (Lucide React):**
- Replace all with Lucide icons for consistency
- Eye/EyeOff: ophthalmology
- Glasses/Contact: optometry
- Activity: vitals, IOP
- FileText: prescriptions, reports
- Calendar: appointments
- User: patients
- Shield: security, compliance

**Responsive Breakpoints:**
- Mobile: <640px
  - Single column layout
  - FAB (Floating Action Button) for primary actions
  - Bottom navigation bar
- Tablet: 640-1024px
  - Two column layout
  - Collapsible sidebar (icons only, expand on hover)
- Desktop: >1024px
  - Three column layout (list | details | preview)
  - Persistent sidebar menu

**Accessibility (WCAG 2.1 AA):**
- Keyboard navigation: Tab through all forms, Enter to submit, Esc to close modals
- Screen reader: ARIA labels on all interactive elements, live regions for dynamic updates
- Color contrast: 7:1 for text (AAA level for medical data)
- Focus indicators: 2px emerald-600 outline on focused elements

---

### PHASE 6B: Testing, Documentation & Deployment (Week 27-28)

Finalize production readiness for complete eye hospital system.

**Testing:**

1. **Unit Tests (Expand to 200+)**
   - Backend: xUnit for all services (OptometryService, IOLCalculatorService, etc.)
   - Frontend: Jest + React Testing Library for components
   - Target: 90%+ code coverage for critical paths

2. **Integration Tests (50 new tests)**
   - Eye hospital workflows:
     - Refraction → Optical prescription → Eyewear sale
     - Appointment → Examination → Imaging → Diagnosis → Treatment plan
     - Cataract surgery: Pre-op → Biometry → IOL calculation → Surgery → Post-op
   - API integration: Backend ↔ Database with RLS enforcement
   - Third-party: Razorpay sandbox, Twilio test credentials, Azure Communication Services

3. **E2E Tests (25 tests - Playwright)**
   - **New Patient Journey:**
     1. Patient self-registers on portal
     2. Books appointment (select ophthalmologist, timeslot)
     3. Front desk confirms appointment
     4. Doctor conducts eye exam (refraction, slit lamp, fundus)
     5. Orders OCT scan
     6. Technician uploads OCT
     7. Doctor reviews OCT, diagnoses glaucoma
     8. Prescribes eye drops
     9. Pharmacy dispenses medication
     10. Billing generates invoice
     11. Patient pays online (Razorpay)
     12. Follow-up appointment auto-scheduled

   - **Cataract Surgery Journey:**
     1. Doctor orders biometry
     2. Technician enters AL, K readings
     3. IOL calculator runs (SRK/T, Barrett)
     4. Doctor selects IOL (+22.0 D)
     5. OT scheduled
     6. Consent e-signed by patient
     7. Surgery performed (intra-op notes recorded)
     8. Post-op follow-ups auto-scheduled (Day 1, Week 1, Month 1)

4. **Performance Testing (k6)**
   - Load: 500 concurrent users
   - Targets:
     - Page load < 2 seconds
     - API response < 500ms (95th percentile)
     - OCT image upload (50MB) < 10 seconds
     - Database query < 100ms
   - Optimization:
     - Redis caching for OCT thumbnails
     - CDN for fundus images (Azure CDN)
     - Database connection pooling
     - Lazy loading for imaging viewer components

5. **Security Testing (OWASP ZAP)**
   - Penetration testing for HIPAA compliance
   - SQL injection attempts (verify parameterized queries)
   - XSS (input sanitization on examination notes)
   - Authentication bypass attempts
   - Authorization bypass (verify RLS prevents cross-tenant data access)
   - Payment gateway webhook signature validation

**Documentation:**

1. **User Guides (PDF, 200+ pages total)**
   - **Ophthalmologist Guide** (60 pages):
     - Examination workflow (slit lamp, fundus, IOP recording)
     - Imaging interpretation (OCT, fundus, VF)
     - Diagnosis and treatment planning
     - Prescription generation
     - Surgical workflow (cataract, laser)
   
   - **Optometrist Guide** (50 pages):
     - Refraction testing procedure
     - Contact lens fitting workflow
     - Optical prescription generation
     - Patient education tips

   - **Optical Shop Manual** (40 pages):
     - Frame selection recommendations
     - Lens material and coating selection
     - POS system usage
     - Job tracking and delivery

   - **Patient Portal Tutorial** (30 pages):
     - Registration and login (OTP)
     - Appointment booking
     - Viewing medical records
     - Online bill payment
     - Telehealth consultation

2. **Video Tutorials (10 videos, 3-5 min each)**
   - Refraction Testing Workflow
   - OCT Upload and Interpretation
   - Cataract Surgery Documentation
   - Optical Sale Process
   - Patient Portal Appointment Booking
   - IOL Power Calculation
   - Visual Field Analysis
   - Emergency Access Workflow
   - Compliance Report Generation
   - Hierarchy Viewer and Department Management

3. **In-App Contextual Help**
   - Tooltips on hover (explain each form field)
   - Walkthroughs for new users (intro.js library)
   - Help icon (?) next to complex features
   - Search help articles (Algolia DocSearch)

4. **API Documentation**
   - Swagger/OpenAPI (auto-generated)
   - Postman collections for all 362 endpoints
   - Authentication guide (JWT token generation)
   - Webhook documentation (payment gateway callbacks)

**Deployment:**

1. **Azure Production Environment Setup**
   - **App Service:** Premium P2v3 (2 cores, 7GB RAM, auto-scaling 2-10 instances)
   - **Azure Database for PostgreSQL:** Flexible Server with HA (4 vCores, 16GB RAM, 256GB storage)
   - **Azure Blob Storage:** Hot tier for recent images (<90 days), Cool tier for archive (>90 days)
   - **Azure Redis Cache:** Premium P1 (6GB) for session management and permission caching
   - **Azure Key Vault:** Secrets management (DB connection strings, API keys, JWT secret)
   - **Azure CDN:** Verizon Premium for fundus/OCT thumbnails
   - **Orthanc PACS:** Docker container on separate App Service (DICOM storage)

2. **CI/CD Pipeline (GitHub Actions)**
   ```yaml
   name: Eye Hospital CI/CD
   on:
     push:
       branches: [main, staging, develop]
   
   jobs:
     test:
       - Run unit tests (xUnit, Jest)
       - Run integration tests
       - SonarQube code quality scan
       - Security scan (Snyk, OWASP Dependency-Check)
     
     build:
       - Build backend (dotnet publish)
       - Build frontend (pnpm build)
       - Build Docker images (Orthanc PACS)
     
     deploy-staging:
       - Deploy to staging environment
       - Run E2E tests (Playwright)
       - Manual approval required
     
     deploy-production:
       - Deploy to production (blue-green deployment)
       - Health check verification
       - Rollback on failure
   ```

3. **Monitoring (Application Insights + Log Analytics)**
   - Custom dashboards:
     - API performance (response times, error rates)
     - User activity (logins, appointments booked, prescriptions created)
     - Imaging uploads (OCT/fundus/VF counts, file sizes)
     - Payment transactions (success rate, failed payments)
   - Alerts:
     - HTTP 5xx errors > 5% → alert DevOps team
     - Database CPU > 80% for 10 minutes → scale up
     - Redis evictions > 1000/min → increase cache size
     - PACS storage > 80% → alert IT team

4. **Backup Strategy**
   - **Database:**
     - Automated nightly full backups (Azure PostgreSQL built-in)
     - 30-day retention for daily backups
     - Weekly full backups retained for 1 year → Azure Blob Archive tier
     - Point-in-time restore available (within 30 days)
   
   - **Imaging (DICOM):**
     - Orthanc auto-backs up to Azure Blob Storage (hot tier)
     - After 90 days, lifecycle policy moves to cool tier
     - After 1 year, move to archive tier
     - Quarterly DR drill: Restore full PACS from backup

5. **DR (Disaster Recovery) Plan**
   - RTO (Recovery Time Objective): 4 hours
   - RPO (Recovery Point Objective): 1 hour (database continuous backup)
   - Quarterly DR drills:
     1. Simulate Azure region failure
     2. Failover to secondary region (East US → West US)
     3. Restore database from geo-redundant backup
     4. Restore PACS from Azure Blob Archive
     5. Verify all critical workflows functional
     6. Document lessons learned

---

## 🔍 Further Considerations & Integration Decisions

### 1. Existing Admin Features Integration

**Decision:** Option A - Namespace Separation

**Implementation:**
- **Admin routes:** `/dashboard/admin/*` (unchanged)
- **Clinical routes:** `/dashboard/clinical/*` (new for ophthalmology)
- **Shared components:** Authentication, user management, audit logs

**Rationale:**
- Maintains separation of concerns
- Allows gradual rollout (admin stable while eye hospital modules are being built)
- Different user personas (Admin vs Doctor) have distinct workflows
- Easier to apply role-based navigation (Admin sees admin menu, Doctor sees clinical menu)

---

### 2. Data Migration Strategy for Existing Clinical Data

**Decision:** Option C - Archive old exams, start fresh with structured templates

**Implementation:**
- **Archive existing records:**
  ```sql
  -- Move current clinical_examination records to clinical_examination_legacy
  CREATE TABLE clinical_examination_legacy AS SELECT * FROM clinical_examination;
  -- Soft delete from main table
  UPDATE clinical_examination SET deleted_at = NOW();
  ```
- **No NLP auto-migration** (risk of incorrect field mapping)
- **Manual review UI** available for edge cases (doctor can view legacy notes, manually transcribe critical findings)

**Rationale:**
- Cleaner data quality for analytics
- Avoids risk of incorrect NLP interpretation of free-text notes
- Legacy data still accessible (read-only) for medico-legal purposes
- Starting fresh encourages adoption of structured templates

---

### 3. Imaging Storage Strategy

**Decision:** Option A for Phase 1-3, Option C (Hybrid) for Phase 4+

**Phase 1-3 (Week 5-16):**
- **Azure Blob Storage only**
- Lifecycle policies:
  - Hot tier: <90 days (frequent access)
  - Cool tier: 90 days - 1 year (occasional access)
  - Archive tier: >1 year (compliance retention, rarely accessed)
- Cost estimate: $10/month for 500GB (50 patients × 10MB/image × 10 images)

**Phase 4+ (Week 17+):**
- **Hybrid PACS + Azure Blob**
- **Orthanc PACS** for:
  - Raw DICOM files (OCT, fundus photography series)
  - DICOM C-STORE receiver from imaging machines
  - WADO-RS endpoints for retrieval
- **Azure Blob for:**
  - Metadata (JSON with patient_id, study_date, modality)
  - Thumbnails (JPEG compressed for quick preview)
  - Reports (PDF with radiologist interpretation)

**Rationale:**
- Start simple (Azure Blob) for cost-effectiveness
- Upgrade to PACS when imaging volume increases (>1000 studies/month)
- Hybrid approach balances compliance (DICOM standard) with performance (Azure CDN for thumbnails)

---

### 4. Localization Priority

**Decision:** Option A - Add i18n infrastructure in Week 26-27, translate critical strings only

**Implementation:**
- **Week 26-27:** Install `react-i18next`, configure language files
- **Initial languages:** English (default) + Hindi + Kannada
- **Translated sections (Priority):**
  - Login/registration pages
  - Patient portal (appointment booking, medical records)
  - Consent forms (cataract surgery, LASIK)
  - Prescription labels (medication instructions)
  - Error messages
- **Defer to Phase 7 (future):**
  - Admin panels (English-only initially)
  - Clinical examination templates (English-only medical terminology)
  - Compliance reports

**RTL Support for Arabic (Phase 7):**
- CSS direction: `dir="rtl"` toggle
- Flip layouts (sidebar right → left)
- Mirror icons (arrow-right becomes arrow-left)

**Rationale:**
- Patient-facing content has highest localization ROI (better patient experience)
- Clinical staff typically English-proficient in multi-language markets
- Infrastructure ready allows incremental translation (crowdsource via clinical staff)

---

### 5. AI/ML Integration Scope

**Decision:** Option C (Defer to Phase 7) + Option A (Integrate third-party APIs when ready)

**Phase 1-6 (Week 5-28):** No AI features
- Focus on core workflows and data collection
- Build clean, structured datasets (OCT scans, fundus images with diagnoses)

**Phase 7 (Future):**
- **Diabetic Retinopathy Detection:**
  - **Google Health API** (FDA-approved, 90%+ sensitivity/specificity)
  - Input: Color fundus photo
  - Output: DR grade (None, Mild, Moderate, Severe, Proliferative) + referral recommendation
  - Integration: POST /api/imaging/fundus/{id}/analyze → returns DR grade
  
- **Glaucoma Screening:**
  - **Heidelberg Engineering Spectralis AI** (built into OCT machines)
  - Input: OCT RNFL scan
  - Output: Glaucoma likelihood (low/medium/high)
  - Integration: Auto-triggered when OCT uploaded
  
- **Custom Models (Long-term):**
  - Train on proprietary dataset (requires 10,000+ labeled images)
  - Use TensorFlow/PyTorch for custom CNN models
  - Deploy on Azure ML for inference

**Rationale:**
- Third-party APIs proven accurate, FDA-approved (regulatory compliance)
- Custom models require massive datasets (not available in first 6 months)
- Focus Phase 1-6 on data collection, defer AI to Phase 7 when dataset sufficient

---

## 📊 Gap Summary & Prioritization

| Module | Current Status | Missing % | Timeline | Priority |
|--------|---------------|-----------|----------|----------|
| **Admin Management (HR, Security, Org)** | 50% | 50% | Week 1-4 | 🔴 Critical |
| **Optometry/Refraction** | 0% | 100% | Week 7-9 | 🔴 Critical |
| **Optical Shop** | 0% | 100% | Week 9-11 | 🔴 Critical |
| **Ophthalmology Clinical Templates** | 10% | 90% | Week 12-14 | 🔴 Critical |
| **Eye Imaging (OCT/Fundus/VF)** | 40% | 60% | Week 14-16 | 🔴 Critical |
| **Cataract Surgery & IOL** | 0% | 100% | Week 17-19 | 🔴 Critical |
| **Laser Treatments** | 0% | 100% | Week 19-21 | 🔴 Critical |
| **Patient Portal** | 0% | 100% | Week 22-24 | 🟡 High |
| **Compliance Automation** | 50% | 50% | Week 24-26 | 🟡 High |
| **Design System** | 60% | 40% | Week 26-27 | 🟡 High |
| **Testing & Deployment** | 70% | 30% | Week 27-28 | 🟡 High |
| **Localization (Hindi/Kannada)** | 0% | 100% | Week 26-27 | 🟢 Medium |
| **Telemedicine** | 0% | 100% | Future | 🟢 Low |
| **AI/ML (DR detection)** | 0% | 100% | Future | 🟢 Low |

---

## 🛠️ Technical Architecture (Updated for Eye Hospital)

### Phase 2: Core Clinical & Financial Workflows (Months 1-3)
**Target Completion:** 70% → **Pilot Deployment Ready**

#### Month 1: Clinical Core - Prescriptions & Laboratory

**Week 1-2: Prescription Module** ⚠️ **PRIORITY 1**

**Database Migration: `migrations/30_prescriptions_module.sql`**
```sql
-- Enhance prescription table with eye-specific fields
ALTER TABLE prescription ADD COLUMN prescription_type VARCHAR(20) CHECK (prescription_type IN ('topical_drops', 'oral_medication', 'ointment', 'injection'));
ALTER TABLE prescription ADD COLUMN eye_affected VARCHAR(10) CHECK (eye_affected IN ('OD', 'OS', 'OU')); -- Right/Left/Both
ALTER TABLE prescription ADD COLUMN instructions TEXT; -- Special instructions
ALTER TABLE prescription ADD COLUMN requires_approval BOOLEAN DEFAULT FALSE;
ALTER TABLE prescription ADD COLUMN approved_by_user_id UUID REFERENCES users(id);
ALTER TABLE prescription ADD COLUMN approved_at TIMESTAMPTZ;

-- Eye medication catalog
CREATE TABLE eye_medication_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    medication_name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(200),
    medication_type VARCHAR(50), -- antibiotic_drops, steroid_drops, anti_glaucoma, artificial_tears, oral
    dosage_forms TEXT[], -- ['0.5% drops', '1% ointment']
    standard_dosage VARCHAR(200),
    contraindications TEXT,
    drug_interactions TEXT[],
    manufacturer VARCHAR(200),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_user_id UUID REFERENCES users(id),
    updated_by_user_id UUID REFERENCES users(id)
);

CREATE INDEX idx_eye_medication_tenant ON eye_medication_catalog(tenant_id);
CREATE INDEX idx_eye_medication_type ON eye_medication_catalog(medication_type) WHERE is_active = TRUE;

-- Prescription items (multi-medication support)
CREATE TABLE prescription_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID NOT NULL REFERENCES prescription(id) ON DELETE CASCADE,
    medication_id UUID REFERENCES eye_medication_catalog(id),
    medication_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(200),
    frequency VARCHAR(100), -- "1 drop 4 times daily", "Twice daily"
    duration VARCHAR(100), -- "7 days", "2 weeks", "Continue until follow-up"
    quantity INTEGER,
    special_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prescription_item_prescription ON prescription_item(prescription_id);

-- Seed common eye medications
INSERT INTO eye_medication_catalog (tenant_id, medication_name, generic_name, medication_type, dosage_forms, standard_dosage, manufacturer, created_by_user_id)
SELECT 
    t.id,
    'Moxifloxacin Eye Drops',
    'Moxifloxacin Hydrochloride',
    'antibiotic_drops',
    ARRAY['0.5% drops'],
    '1 drop 4 times daily',
    'Alcon',
    (SELECT id FROM users WHERE email = 'admin@hospital.com' LIMIT 1)
FROM tenant t
UNION ALL
SELECT t.id, 'Prednisolone Acetate', 'Prednisolone', 'steroid_drops', ARRAY['1% drops'], '1 drop 4 times daily', 'Allergan', (SELECT id FROM users WHERE email = 'admin@hospital.com' LIMIT 1) FROM tenant t
UNION ALL
SELECT t.id, 'Timolol Maleate', 'Timolol', 'anti_glaucoma', ARRAY['0.5% drops'], '1 drop twice daily', 'Bausch & Lomb', (SELECT id FROM users WHERE email = 'admin@hospital.com' LIMIT 1) FROM tenant t
UNION ALL
SELECT t.id, 'Latanoprost', 'Latanoprost', 'anti_glaucoma', ARRAY['0.005% drops'], '1 drop once daily at night', 'Pfizer', (SELECT id FROM users WHERE email = 'admin@hospital.com' LIMIT 1) FROM tenant t
UNION ALL
SELECT t.id, 'Refresh Tears', 'Carboxymethylcellulose', 'artificial_tears', ARRAY['0.5% drops'], '1-2 drops as needed', 'Allergan', (SELECT id FROM users WHERE email = 'admin@hospital.com' LIMIT 1) FROM tenant t
UNION ALL
SELECT t.id, 'Acetazolamide', 'Acetazolamide', 'oral', ARRAY['250mg tablet'], '250mg twice daily', 'Teva', (SELECT id FROM users WHERE email = 'admin@hospital.com' LIMIT 1) FROM tenant t;
```

**Backend: `Controllers/PrescriptionsController.cs`** (10 endpoints)
```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PrescriptionsController : ControllerBase
{
    private readonly IPrescriptionService _prescriptionService;
    
    [HttpPost] // Create prescription with multiple medications
    [RequirePermission("prescription.create")]
    public async Task<ActionResult<PrescriptionDto>> CreatePrescription([FromBody] CreatePrescriptionDto dto)
    
    [HttpGet("{id}")] // Get prescription details with items
    [RequirePermission("prescription.view")]
    public async Task<ActionResult<PrescriptionDetailDto>> GetPrescription(Guid id)
    
    [HttpGet("patient/{patientId}")] // Get all prescriptions for patient
    [RequirePermission("prescription.view")]
    public async Task<ActionResult<List<PrescriptionDto>>> GetPatientPrescriptions(Guid patientId)
    
    [HttpPost("{id}/approve")] // Approve prescription (junior doctor → senior)
    [RequirePermission("prescription.approve")]
    public async Task<ActionResult> ApprovePrescription(Guid id)
    
    [HttpPost("{id}/print")] // Generate printable prescription PDF
    [RequirePermission("prescription.view")]
    public async Task<IActionResult> PrintPrescription(Guid id)
    
    [HttpGet("medications")] // Search medication catalog
    [RequirePermission("prescription.create")]
    public async Task<ActionResult<List<MedicationDto>>> SearchMedications([FromQuery] string search)
    
    [HttpPost("{id}/dispense")] // Mark as dispensed (pharmacy)
    [RequirePermission("pharmacy.dispense")]
    public async Task<ActionResult> MarkAsDispensed(Guid id, [FromBody] DispenseDto dto)
    
    [HttpGet("pending-approval")] // Get prescriptions pending approval
    [RequirePermission("prescription.approve")]
    public async Task<ActionResult<List<PrescriptionDto>>> GetPendingApprovals()
    
    [HttpPut("{id}")] // Edit prescription (only if not dispensed)
    [RequirePermission("prescription.edit")]
    public async Task<ActionResult> UpdatePrescription(Guid id, [FromBody] UpdatePrescriptionDto dto)
    
    [HttpDelete("{id}")] // Soft delete prescription
    [RequirePermission("prescription.delete")]
    public async Task<ActionResult> DeletePrescription(Guid id)
}
```

**Backend: `Services/PrescriptionService.cs`**
- Drug interaction checking (basic algorithm: check medication_catalog.drug_interactions array)
- Junior doctor validation (if user.role = "Junior Doctor", set requires_approval = true)
- PDF generation with QR code for verification
- Audit logging for all prescription actions

**Frontend: `apps/hospital-portal-web/src/app/(main)/prescriptions/page.tsx`**
- List view with filters: Date range, Doctor, Patient, Status (Draft/Pending Approval/Approved/Dispensed)
- Quick actions: View, Edit (if not dispensed), Approve, Print
- Search by patient name or prescription number

**Frontend: `src/app/(main)/prescriptions/create/page.tsx`**
- Patient selection autocomplete
- Medication search and add (multi-medication support)
- Eye affected dropdown (OD/OS/OU) per medication
- Dosage, frequency, duration inputs with presets
- Special instructions textarea
- Drug interaction warnings (real-time as medications added)
- Save as Draft / Submit for Approval / Finalize buttons

**Frontend: `src/app/(main)/prescriptions/[id]/page.tsx`**
- Prescription detail view with patient info
- Medications list with dosages
- Approval section (if pending, show Approve/Reject buttons for senior doctors)
- Print button → PDF download
- Audit trail (created by, approved by, dispensed by with timestamps)

**Acceptance Criteria:**
- ✅ Doctors can create prescriptions with 1-10 medications
- ✅ Junior doctor prescriptions auto-flagged for senior approval
- ✅ Drug interaction warnings displayed (if acetazolamide + sulfa drugs)
- ✅ Print generates branded PDF with QR code linking to prescription ID
- ✅ Pharmacists can mark as dispensed from pharmacy queue
- ✅ Full audit trail logged (created, approved, dispensed events)

**Demo Data Seeding:**
- 50 sample prescriptions across 20 patients
- Mix of single-medication (60%) and multi-medication (40%)
- 10 pending approval prescriptions
- 20 dispensed prescriptions

---

**Week 3-4: Laboratory Orders Module** ⚠️ **PRIORITY 2**

**Database Migration: `migrations/31_laboratory_module.sql`**
```sql
-- Laboratory test catalog
CREATE TABLE lab_test_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    test_code VARCHAR(50) UNIQUE NOT NULL,
    test_name VARCHAR(200) NOT NULL,
    department VARCHAR(100), -- 'Pathology', 'Microbiology', 'Biochemistry'
    sample_type VARCHAR(100), -- 'Blood', 'Urine', 'Tear Film'
    tat_hours INTEGER, -- Turnaround time
    reference_range_min DECIMAL(10,2),
    reference_range_max DECIMAL(10,2),
    unit VARCHAR(50),
    is_critical_value_test BOOLEAN DEFAULT FALSE,
    critical_low DECIMAL(10,2),
    critical_high DECIMAL(10,2),
    price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lab_test_tenant ON lab_test_catalog(tenant_id);
CREATE INDEX idx_lab_test_code ON lab_test_catalog(test_code);

-- Enhance lab_order table
ALTER TABLE lab_order ADD COLUMN priority VARCHAR(20) CHECK (priority IN ('routine', 'urgent', 'stat')) DEFAULT 'routine';
ALTER TABLE lab_order ADD COLUMN icd10_code VARCHAR(20); -- Diagnosis code for billing
ALTER TABLE lab_order ADD COLUMN clinical_notes TEXT;
ALTER TABLE lab_order ADD COLUMN sample_collected_at TIMESTAMPTZ;
ALTER TABLE lab_order ADD COLUMN sample_collected_by_user_id UUID REFERENCES users(id);
ALTER TABLE lab_order ADD COLUMN result_entered_at TIMESTAMPTZ;
ALTER TABLE lab_order ADD COLUMN result_entered_by_user_id UUID REFERENCES users(id);
ALTER TABLE lab_order ADD COLUMN approved_by_user_id UUID REFERENCES users(id); -- Pathologist approval
ALTER TABLE lab_order ADD COLUMN approved_at TIMESTAMPTZ;
ALTER TABLE lab_order ADD COLUMN is_critical_result BOOLEAN DEFAULT FALSE;
ALTER TABLE lab_order ADD COLUMN critical_notified_at TIMESTAMPTZ;

-- Lab test results (support multiple tests per order)
CREATE TABLE lab_test_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_order_id UUID NOT NULL REFERENCES lab_order(id) ON DELETE CASCADE,
    test_catalog_id UUID REFERENCES lab_test_catalog(id),
    test_name VARCHAR(200) NOT NULL,
    result_value VARCHAR(500),
    result_numeric DECIMAL(10,2),
    unit VARCHAR(50),
    reference_range VARCHAR(100),
    is_abnormal BOOLEAN DEFAULT FALSE,
    is_critical BOOLEAN DEFAULT FALSE,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lab_result_order ON lab_test_result(lab_order_id);
CREATE INDEX idx_lab_result_critical ON lab_test_result(is_critical) WHERE is_critical = TRUE;

-- Seed common eye-related lab tests
INSERT INTO lab_test_catalog (tenant_id, test_code, test_name, department, sample_type, tat_hours, reference_range_min, reference_range_max, unit, is_critical_value_test, critical_low, critical_high, price)
SELECT t.id, 'CBC', 'Complete Blood Count', 'Hematology', 'Blood', 24, 4000, 11000, 'cells/µL', TRUE, 2000, 20000, 500 FROM tenant t
UNION ALL
SELECT t.id, 'BSL-F', 'Blood Sugar - Fasting', 'Biochemistry', 'Blood', 4, 70, 100, 'mg/dL', TRUE, 50, 300, 150 FROM tenant t
UNION ALL
SELECT t.id, 'BSL-PP', 'Blood Sugar - Postprandial', 'Biochemistry', 'Blood', 4, 100, 140, 'mg/dL', TRUE, 60, 300, 150 FROM tenant t
UNION ALL
SELECT t.id, 'HBA1C', 'Glycosylated Hemoglobin', 'Biochemistry', 'Blood', 48, 4.0, 5.6, '%', FALSE, NULL, NULL, 800 FROM tenant t
UNION ALL
SELECT t.id, 'SCHIRMER', 'Schirmer Test (Dry Eye)', 'Ophthalmology', 'Tear Film', 1, 10, 15, 'mm/5min', FALSE, NULL, NULL, 300 FROM tenant t
UNION ALL
SELECT t.id, 'TBUT', 'Tear Break-Up Time', 'Ophthalmology', 'Tear Film', 1, 10, NULL, 'seconds', FALSE, NULL, NULL, 250 FROM tenant t;
```

**Backend: `Controllers/LabOrdersController.cs`** (13 endpoints)
```csharp
[HttpPost] // Create lab order with multiple tests
[HttpGet("{id}")] // Get lab order details
[HttpGet("patient/{patientId}")] // Get all lab orders for patient
[HttpPut("{id}/collect-sample")] // Mark sample as collected
[HttpPut("{id}/enter-results")] // Lab technician enters results
[HttpPost("{id}/approve")] // Pathologist approves results
[HttpGet("{id}/report")] // Generate lab report PDF
[HttpGet("pending")] // Get orders pending sample collection
[HttpGet("in-progress")] // Get orders with samples collected, awaiting results
[HttpGet("pending-approval")] // Get orders with results, awaiting pathologist approval
[HttpGet("critical-results")] // Get critical results requiring immediate notification
[HttpPut("{id}/notify-critical")] // Mark critical result as notified
[HttpDelete("{id}")] // Cancel lab order (only if sample not collected)
```

**Backend: `Controllers/LabTestCatalogController.cs`** (CRUD for test catalog)

**Backend: `Services/LabOrderService.cs`**
- Critical value detection algorithm (check if result_numeric < critical_low OR > critical_high)
- Auto-notification on critical results (send SMS/email to ordering doctor)
- Status workflow: Ordered → Sample Collected → In Progress → Results Entered → Approved → Completed
- PDF report generation with accreditation logos (NABL/CAP)

**Frontend: `src/app/(main)/laboratory/page.tsx`**
- Tabbed interface: Pending Orders / Sample Collection / Result Entry / Pending Approval / Completed
- Filters: Date range, Patient, Test, Priority, Department
- Critical results highlighted in red with alert icon

**Frontend: `src/app/(main)/laboratory/create/page.tsx`**
- Patient selection
- Multiple test selection from catalog (searchable dropdown)
- Priority selection (Routine/Urgent/STAT)
- ICD-10 code input (for billing/insurance)
- Clinical notes textarea

**Frontend: `src/app/(main)/laboratory/[id]/page.tsx`**
- Order details with patient info
- Test list with status per test
- Sample collection section (datetime picker, technician auto-filled)
- Result entry form (per test, with reference ranges displayed)
- Abnormal/Critical flags auto-calculated
- Pathologist approval button (only for critical results or department policy)
- Print lab report button

**Acceptance Criteria:**
- ✅ Doctors can order 1-20 tests in single order
- ✅ Lab technicians see pending sample collection queue
- ✅ Result entry validates against reference ranges, auto-flags abnormal
- ✅ Critical results (BSL < 50 or > 300) trigger auto-notification
- ✅ Pathologist approval required for critical results before report release
- ✅ Lab report PDF includes accreditation logos, QR code for verification
- ✅ Full audit trail (ordered, collected, resulted, approved)

**Demo Data:**
- 100 lab orders across 30 patients
- 60 completed orders
- 20 in-progress orders
- 10 pending sample collection
- 5 critical results

---

#### Month 2: Financial Core - Billing & Payments

**Week 5-6: Billing & Invoicing Module**

**Database Migration: `migrations/32_billing_invoicing.sql`**
```sql
-- Charge master (pricing catalog for services/procedures)
CREATE TABLE charge_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    branch_id UUID REFERENCES branch(id), -- Branch-specific pricing
    item_code VARCHAR(50) UNIQUE NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    category VARCHAR(100), -- 'consultation', 'procedure', 'investigation', 'pharmacy', 'optical'
    department_id UUID REFERENCES department(id),
    base_price DECIMAL(10,2) NOT NULL,
    tax_percentage DECIMAL(5,2) DEFAULT 0, -- GST/VAT
    is_insurance_covered BOOLEAN DEFAULT TRUE,
    insurance_price DECIMAL(10,2), -- Price for insurance claims
    cpt_code VARCHAR(20), -- Current Procedural Terminology (for US insurance)
    icd10_codes TEXT[], -- Associated diagnosis codes
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice table (enhanced from existing billing table)
ALTER TABLE invoice ADD COLUMN invoice_number VARCHAR(50) UNIQUE;
ALTER TABLE invoice ADD COLUMN patient_id UUID REFERENCES patient(id);
ALTER TABLE invoice ADD COLUMN appointment_id UUID REFERENCES appointment(id);
ALTER TABLE invoice ADD COLUMN invoice_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE invoice ADD COLUMN due_date DATE;
ALTER TABLE invoice ADD COLUMN subtotal DECIMAL(10,2);
ALTER TABLE invoice ADD COLUMN tax_amount DECIMAL(10,2);
ALTER TABLE invoice ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE invoice ADD COLUMN total_amount DECIMAL(10,2);
ALTER TABLE invoice ADD COLUMN paid_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE invoice ADD COLUMN balance_amount DECIMAL(10,2);
ALTER TABLE invoice ADD COLUMN invoice_status VARCHAR(20) CHECK (invoice_status IN ('draft', 'pending', 'partial_paid', 'fully_paid', 'overdue', 'cancelled'));
ALTER TABLE invoice ADD COLUMN payment_terms VARCHAR(100); -- 'Due on receipt', 'Net 30 days'
ALTER TABLE invoice ADD COLUMN notes TEXT;
ALTER TABLE invoice ADD COLUMN is_insurance_claim BOOLEAN DEFAULT FALSE;

-- Invoice line items
CREATE TABLE invoice_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoice(id) ON DELETE CASCADE,
    charge_master_id UUID REFERENCES charge_master(id),
    item_name VARCHAR(200) NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    tax_percentage DECIMAL(5,2),
    tax_amount DECIMAL(10,2),
    discount_percentage DECIMAL(5,2),
    discount_amount DECIMAL(10,2),
    line_total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice number sequence per tenant
CREATE SEQUENCE invoice_number_seq START 1000;

-- Function to generate invoice number (format: INV-YYYY-MM-####)
CREATE OR REPLACE FUNCTION generate_invoice_number(tenant_uuid UUID)
RETURNS VARCHAR AS $$
DECLARE
    new_number VARCHAR;
    seq_val INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 13) AS INTEGER)), 0) + 1
    INTO seq_val
    FROM invoice
    WHERE tenant_id = tenant_uuid
      AND invoice_number LIKE 'INV-' || TO_CHAR(NOW(), 'YYYY-MM') || '-%';
    
    new_number := 'INV-' || TO_CHAR(NOW(), 'YYYY-MM') || '-' || LPAD(seq_val::TEXT, 4, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Seed charge master items
INSERT INTO charge_master (tenant_id, item_code, item_name, category, base_price, tax_percentage)
SELECT t.id, 'CONS-OPHTH', 'Ophthalmologist Consultation', 'consultation', 800, 0 FROM tenant t
UNION ALL
SELECT t.id, 'CONS-OPTO', 'Optometrist Consultation', 'consultation', 500, 0 FROM tenant t
UNION ALL
SELECT t.id, 'REFRACTION', 'Refraction Test', 'investigation', 300, 0 FROM tenant t
UNION ALL
SELECT t.id, 'OCT', 'OCT Scan (Both Eyes)', 'investigation', 2500, 0 FROM tenant t
UNION ALL
SELECT t.id, 'FUNDUS', 'Fundus Photography', 'investigation', 1500, 0 FROM tenant t
UNION ALL
SELECT t.id, 'VISUAL-FIELD', 'Visual Field Test (Perimetry)', 'investigation', 2000, 0 FROM tenant t
UNION ALL
SELECT t.id, 'CATARACT-SURG', 'Cataract Surgery with IOL', 'procedure', 35000, 0 FROM tenant t
UNION ALL
SELECT t.id, 'LASIK', 'LASIK (Both Eyes)', 'procedure', 80000, 0 FROM tenant t;
```

**Backend: `Controllers/BillingController.cs`** (12 endpoints)
- Auto-generate invoice from appointment (fetch consultation fee + procedures performed)
- Auto-generate invoice from lab orders (fetch test prices from catalog)
- Auto-generate invoice from pharmacy (fetch dispensed medication prices)
- Manual invoice creation for walk-in patients
- Apply discounts (percentage or fixed amount)
- Mark invoice as sent to patient
- Cancel invoice (only if not paid)
- Generate aging report (outstanding balances > 30/60/90 days)

**Frontend: `src/app/(main)/billing/page.tsx`**
- Invoice list with filters: Status, Date range, Patient, Amount range
- Outstanding balance summary cards (Total Overdue, 30-60 days, 60-90 days, >90 days)
- Quick actions: View, Edit, Print, Record Payment, Cancel

**Frontend: `src/app/(main)/billing/create/page.tsx`**
- Patient selection
- Auto-populate from appointment (if creating post-consultation)
- Line items: Item search from charge master, quantity, unit price, discount, tax
- Subtotal, tax, discount, total auto-calculated
- Payment terms dropdown (Due on receipt, Net 7 days, Net 15 days, Net 30 days)
- Notes textarea
- Save as Draft / Finalize Invoice buttons

**Frontend: `src/app/(main)/billing/[id]/page.tsx`**
- Invoice detail with patient info
- Line items table
- Payment history (if partial payments)
- Print invoice button (PDF with QR code)
- Record Payment button → opens payment modal

**Acceptance Criteria:**
- ✅ Auto-generate invoices from appointments (consultation + procedures)
- ✅ Apply discounts and tax calculations correctly
- ✅ Invoice number auto-incremented per month (INV-2026-01-0001)
- ✅ Overdue invoices flagged after due date
- ✅ Aging report shows outstanding balances by time bucket
- ✅ Print invoice with organization branding, QR code

**Demo Data:**
- 200 invoices across 50 patients
- Mix of fully paid (60%), partial paid (20%), pending (15%), overdue (5%)

---

**Week 7-8: Payment Processing & Gateway Integration**

**Database Migration: `migrations/33_payment_gateway.sql`**
```sql
-- Payment table (enhanced)
ALTER TABLE payment ADD COLUMN payment_number VARCHAR(50) UNIQUE;
ALTER TABLE payment ADD COLUMN invoice_id UUID REFERENCES invoice(id);
ALTER TABLE payment ADD COLUMN payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'card', 'upi', 'net_banking', 'cheque', 'online_gateway'));
ALTER TABLE payment ADD COLUMN gateway_name VARCHAR(50); -- 'razorpay', 'stripe', 'paypal'
ALTER TABLE payment ADD COLUMN gateway_transaction_id VARCHAR(200);
ALTER TABLE payment ADD COLUMN gateway_payment_status VARCHAR(50); -- 'authorized', 'captured', 'failed', 'refunded'
ALTER TABLE payment ADD COLUMN gateway_response JSONB; -- Store full webhook response
ALTER TABLE payment ADD COLUMN payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled'));
ALTER TABLE payment ADD COLUMN reference_number VARCHAR(100); -- Cheque number, UTR number, etc.
ALTER TABLE payment ADD COLUMN paid_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE payment ADD COLUMN refund_amount DECIMAL(10,2);
ALTER TABLE payment ADD COLUMN refund_reason TEXT;
ALTER TABLE payment ADD COLUMN refunded_at TIMESTAMPTZ;

-- Payment gateway configuration per tenant
CREATE TABLE payment_gateway_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    gateway_name VARCHAR(50) NOT NULL, -- 'razorpay', 'stripe', 'paypal'
    is_active BOOLEAN DEFAULT FALSE,
    api_key_encrypted TEXT, -- Store encrypted
    api_secret_encrypted TEXT,
    webhook_secret_encrypted TEXT,
    test_mode BOOLEAN DEFAULT TRUE,
    supported_currencies TEXT[], -- ['INR', 'USD']
    config_json JSONB, -- Additional config
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, gateway_name)
);

-- Daily reconciliation records
CREATE TABLE payment_reconciliation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    branch_id UUID REFERENCES branch(id),
    reconciliation_date DATE NOT NULL,
    total_cash DECIMAL(10,2),
    total_card DECIMAL(10,2),
    total_upi DECIMAL(10,2),
    total_online DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    reconciled_by_user_id UUID REFERENCES users(id),
    reconciled_at TIMESTAMPTZ,
    notes TEXT,
    status VARCHAR(20) CHECK (status IN ('pending', 'reconciled', 'discrepancy')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_invoice ON payment(invoice_id);
CREATE INDEX idx_payment_gateway_txn ON payment(gateway_transaction_id);
CREATE INDEX idx_reconciliation_date ON payment_reconciliation(reconciliation_date, tenant_id);
```

**Backend: `Controllers/PaymentsController.cs`** (15 endpoints)
- Initiate online payment (creates Razorpay/Stripe order)
- Webhook endpoint for gateway callbacks (verify signature, update payment status)
- Record manual payment (cash/card/cheque)
- Process refund (full or partial)
- Get payment receipt PDF
- Daily reconciliation report
- Export payments to Excel (for accounting)

**Backend: `Services/PaymentGatewayService.cs`**
- **Razorpay Integration** (India):
  - Create order: `POST https://api.razorpay.com/v1/orders`
  - Verify signature: `HMAC-SHA256(order_id|payment_id, secret)`
  - Capture payment, refund API
- **Stripe Integration** (Global):
  - Create payment intent
  - Handle webhooks (payment_intent.succeeded, payment_intent.failed)
- **PayPal Integration** (Global):
  - Create order, capture payment

**Frontend: `src/app/(main)/payments/page.tsx`**
- Payment list with filters: Date range, Method, Status, Invoice
- Summary cards: Total Cash, Total Card, Total Online, Total Today
- Daily reconciliation section

**Frontend: `src/components/PaymentModal.tsx`**
- Invoice selection
- Amount input (pre-filled with balance amount, allow partial payment)
- Payment method selection
- If 'Online Gateway' → show payment gateway options (Razorpay/Stripe/PayPal) → redirect to gateway checkout
- If 'Cash/Card/Cheque' → reference number input → submit
- Auto-update invoice.paid_amount and invoice.balance_amount

**Frontend: `src/app/(main)/payments/reconciliation/page.tsx`**
- Date picker (default: today)
- Fetch all payments for selected date
- Group by payment method
- Show totals per method
- Input expected cash in drawer
- Calculate variance (expected vs actual)
- Mark as reconciled button

**Acceptance Criteria:**
- ✅ Online payment via Razorpay works end-to-end (create order → redirect → webhook → update status)
- ✅ Webhook signature validation prevents fraud
- ✅ Manual payments update invoice balance immediately
- ✅ Refunds processed and recorded (update payment.refund_amount, gateway API call)
- ✅ Daily reconciliation shows variance between expected and actual cash
- ✅ Payment receipt PDF with QR code, gateway transaction ID

**Demo Data:**
- 300 payments across 200 invoices
- Mix of cash (40%), card (30%), UPI (20%), online gateway (10%)
- 5 refunded payments

---

#### Month 3: Pharmacy & Enhanced Scheduling

**Week 9-10: Pharmacy Management Module**

**Database Migration: `migrations/34_pharmacy_management.sql`**
```sql
-- Pharmacy inventory
CREATE TABLE pharmacy_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    branch_id UUID NOT NULL REFERENCES branch(id),
    medication_catalog_id UUID REFERENCES eye_medication_catalog(id),
    medication_name VARCHAR(200) NOT NULL,
    batch_number VARCHAR(100),
    expiry_date DATE NOT NULL,
    quantity_in_stock INTEGER NOT NULL,
    reorder_level INTEGER DEFAULT 10,
    unit_price DECIMAL(10,2),
    mrp DECIMAL(10,2), -- Maximum Retail Price
    supplier_name VARCHAR(200),
    last_restocked_at TIMESTAMPTZ,
    status VARCHAR(20) CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dispensing records
CREATE TABLE dispensing_record (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    prescription_id UUID NOT NULL REFERENCES prescription(id),
    patient_id UUID NOT NULL REFERENCES patient(id),
    dispensed_by_user_id UUID REFERENCES users(id),
    dispensed_at TIMESTAMPTZ DEFAULT NOW(),
    total_amount DECIMAL(10,2),
    payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'paid')),
    invoice_id UUID REFERENCES invoice(id),
    notes TEXT
);

-- Dispensing items (line items)
CREATE TABLE dispensing_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispensing_record_id UUID NOT NULL REFERENCES dispensing_record(id) ON DELETE CASCADE,
    inventory_id UUID REFERENCES pharmacy_inventory(id),
    medication_name VARCHAR(200) NOT NULL,
    quantity_dispensed INTEGER NOT NULL,
    batch_number VARCHAR(100),
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Low stock alerts
CREATE OR REPLACE FUNCTION check_pharmacy_low_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quantity_in_stock <= NEW.reorder_level THEN
        NEW.status := 'low_stock';
    ELSIF NEW.quantity_in_stock = 0 THEN
        NEW.status := 'out_of_stock';
    ELSIF NEW.expiry_date < CURRENT_DATE THEN
        NEW.status := 'expired';
    ELSE
        NEW.status := 'in_stock';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_pharmacy_low_stock
BEFORE INSERT OR UPDATE ON pharmacy_inventory
FOR EACH ROW EXECUTE FUNCTION check_pharmacy_low_stock();

CREATE INDEX idx_pharmacy_inventory_branch ON pharmacy_inventory(branch_id, status);
CREATE INDEX idx_pharmacy_inventory_expiry ON pharmacy_inventory(expiry_date) WHERE expiry_date < CURRENT_DATE + INTERVAL '90 days';
CREATE INDEX idx_dispensing_prescription ON dispensing_record(prescription_id);

-- Seed pharmacy inventory
INSERT INTO pharmacy_inventory (tenant_id, branch_id, medication_catalog_id, medication_name, batch_number, expiry_date, quantity_in_stock, reorder_level, unit_price, mrp, supplier_name)
SELECT 
    t.id,
    b.id,
    m.id,
    m.medication_name,
    'BATCH-' || LPAD((RANDOM() * 1000)::INTEGER::TEXT, 4, '0'),
    CURRENT_DATE + INTERVAL '2 years',
    (50 + RANDOM() * 200)::INTEGER,
    10,
    (m.medication_name LIKE '%Latanoprost%' THEN 450 WHEN m.medication_name LIKE '%Timolol%' THEN 120 ELSE 80 END),
    (CASE WHEN m.medication_name LIKE '%Latanoprost%' THEN 550 WHEN m.medication_name LIKE '%Timolol%' THEN 150 ELSE 100 END),
    m.manufacturer
FROM tenant t
CROSS JOIN branch b
CROSS JOIN eye_medication_catalog m
WHERE b.tenant_id = t.id
LIMIT 100;
```

**Backend: `Controllers/PharmacyController.cs`** (14 endpoints)
- Get dispensing queue (prescriptions approved, not yet dispensed)
- Dispense prescription (creates dispensing_record, decrements inventory, generates invoice)
- Search inventory (by medication name, batch number)
- Add stock (purchase order received)
- Adjust stock (wastage, expired removal)
- Low stock alerts
- Expiry alerts (medications expiring in 30/60/90 days)
- Generate stock valuation report
- Drug interaction check (when dispensing)

**Frontend: `src/app/(main)/pharmacy/page.tsx`**
- **Tabs**: Dispensing Queue / Inventory / Low Stock / Expiring Soon
- **Dispensing Queue**: List of approved prescriptions, Quick Dispense button
- **Inventory**: Medication search, stock levels, batch numbers, expiry dates
- **Low Stock**: Medications below reorder level, Restock button
- **Expiring Soon**: Medications expiring in next 90 days, sorted by expiry date

**Frontend: `src/app/(main)/pharmacy/dispense/[prescriptionId]/page.tsx`**
- Prescription details with medications list
- For each medication:
  - Check inventory availability
  - If available: Select batch number (show available batches with expiry dates)
  - Input quantity to dispense (default: prescribed quantity)
  - Show unit price, calculate total
- Grand total calculation
- Payment status (Paid / Bill to Patient)
- Submit Dispense button → decrements inventory, creates invoice (if not paid)

**Frontend: `src/app/(main)/pharmacy/inventory/page.tsx`**
- Inventory list with search and filters
- Columns: Medication, Batch, Expiry Date, Quantity, Status, Actions
- Add Stock button → modal with medication selection, batch, expiry, quantity, supplier
- Adjust Stock button (for wastage/expired removal)

**Acceptance Criteria:**
- ✅ Pharmacists see pending prescriptions in dispensing queue
- ✅ Inventory auto-decremented on dispensing
- ✅ Low stock alerts generated when quantity <= reorder_level
- ✅ Expiry alerts for medications expiring in next 90 days
- ✅ Drug interaction warnings during dispensing (if multiple medications)
- ✅ Invoice auto-created if patient hasn't paid
- ✅ Stock valuation report (quantity × unit_price per medication)

**Demo Data:**
- 100 pharmacy inventory records across 3 branches
- 50 dispensing records
- 10 low stock items
- 5 items expiring in next 60 days

---

**Week 11-12: Appointment Calendar Enhancement** ⏳ **UPGRADE EXISTING**

**Database Migration: `migrations/35_appointment_enhancements.sql`**
```sql
-- Doctor availability schedule
CREATE TABLE doctor_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    doctor_user_id UUID NOT NULL REFERENCES users(id),
    branch_id UUID REFERENCES branch(id),
    department_id UUID REFERENCES department(id),
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INTEGER DEFAULT 15, -- 15 or 30 minute slots
    max_patients_per_slot INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    effective_from DATE,
    effective_until DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Doctor leave/unavailability
CREATE TABLE doctor_leave (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    doctor_user_id UUID NOT NULL REFERENCES users(id),
    leave_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_full_day BOOLEAN DEFAULT TRUE,
    reason VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointment waitlist
CREATE TABLE appointment_waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    patient_id UUID NOT NULL REFERENCES patient(id),
    doctor_user_id UUID REFERENCES users(id),
    department_id UUID REFERENCES department(id),
    preferred_date DATE,
    preferred_time_slot VARCHAR(20), -- 'morning', 'afternoon', 'evening'
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    notes TEXT,
    status VARCHAR(20) CHECK (status IN ('waiting', 'scheduled', 'cancelled')) DEFAULT 'waiting',
    added_at TIMESTAMPTZ DEFAULT NOW(),
    scheduled_appointment_id UUID REFERENCES appointment(id),
    scheduled_at TIMESTAMPTZ
);

-- Enhance appointment table
ALTER TABLE appointment ADD COLUMN slot_start_time TIME;
ALTER TABLE appointment ADD COLUMN slot_end_time TIME;
ALTER TABLE appointment ADD COLUMN is_walkin BOOLEAN DEFAULT FALSE;
ALTER TABLE appointment ADD COLUMN cancellation_reason TEXT;
ALTER TABLE appointment ADD COLUMN cancelled_by_user_id UUID REFERENCES users(id);
ALTER TABLE appointment ADD COLUMN rescheduled_from_appointment_id UUID REFERENCES appointment(id);
ALTER TABLE appointment ADD COLUMN check_in_time TIMESTAMPTZ;
ALTER TABLE appointment ADD COLUMN check_out_time TIMESTAMPTZ;
ALTER TABLE appointment ADD COLUMN actual_duration_minutes INTEGER;

CREATE INDEX idx_doctor_availability_doctor ON doctor_availability(doctor_user_id, day_of_week);
CREATE INDEX idx_appointment_slot ON appointment(appointment_date, slot_start_time);
CREATE INDEX idx_waitlist_status ON appointment_waitlist(status, preferred_date);
```

**Backend: `Controllers/AppointmentsController.cs`** (ENHANCE EXISTING - add 8 new endpoints)
- Get available time slots for doctor on specific date (checks availability schedule, existing appointments, leave)
- Book appointment with slot selection
- Reschedule appointment (creates new appointment, updates old one)
- Cancel appointment
- Add to waitlist
- Check-in patient (mark appointment as in-progress)
- Check-out patient (mark as completed, calculate actual duration)
- Get doctor's daily schedule (all appointments for selected date)

**Backend: `Controllers/DoctorAvailabilityController.cs`** (NEW - 6 endpoints)
- Create availability schedule for doctor
- Update availability schedule
- Mark doctor leave/unavailable dates
- Get doctor availability for date range
- Delete availability schedule

**Frontend: `src/app/(main)/appointments/page.tsx`** (ENHANCE EXISTING)
- **Replace basic list with FullCalendar**:
  - Month view (default)
  - Week view
  - Day view (time grid with 15-minute slots)
- **Color coding**: Scheduled (blue), Confirmed (green), In-Progress (yellow), Completed (gray), Cancelled (red), No-Show (orange)
- **Filters**: Doctor, Department, Branch, Status
- **Quick actions**: Click slot → create appointment, Click appointment → view details/reschedule/cancel

**Frontend: `src/app/(main)/appointments/create/page.tsx`** (ENHANCE EXISTING)
- Patient selection (search or create new)
- Doctor selection → fetch availability schedule
- Date picker (disable dates with no availability or doctor on leave)
- Time slot selection (show available slots as buttons, booked slots disabled)
- Appointment type dropdown (New Patient, Follow-up, Emergency, Post-Op)
- Department auto-filled based on doctor
- Reason for visit textarea
- Submit button → create appointment, send confirmation SMS/email

**Frontend: `src/app/(main)/appointments/[id]/page.tsx`** (ENHANCE EXISTING)
- Appointment details
- Patient info card
- Doctor info card
- Reschedule button → date + time slot picker
- Cancel button → cancellation reason modal
- Check-in button (for front office staff)
- Start Consultation button (for doctors) → redirects to examination page
- No-Show button
- Print appointment slip

**Frontend: `src/app/(main)/appointments/availability/page.tsx`** (NEW)
- Doctor selection
- Weekly schedule grid (Sun-Sat, time slots)
- Add availability button → day of week, start time, end time, slot duration, max patients per slot
- Mark leave button → date picker, full day or time range

**Acceptance Criteria:**
- ✅ FullCalendar displays appointments in Month/Week/Day views
- ✅ Drag-and-drop rescheduling works (creates new appointment, marks old as rescheduled)
- ✅ Time slot selection shows only available slots (checks doctor availability, existing appointments, leave)
- ✅ Conflict detection prevents double-booking
- ✅ Waitlist management (add patient to waitlist if no slots available)
- ✅ Check-in/check-out workflow tracks patient flow
- ✅ SMS/email confirmation sent on booking (requires Twilio/SendGrid integration - Phase 3)

**Demo Data:**
- 500 appointments across 10 doctors over 3 months
- Mix of past (300), today (20), future (180)
- 10 appointments on waitlist
- Doctor availability schedules for 10 doctors

---

### Phase 3: Advanced Clinical & Infrastructure (Months 4-6)
**Target Completion:** 85% → **Full Clinical Deployment Ready**

#### Month 4: Imaging, Optical & Insurance

**Week 13-14: Imaging/Radiology Module** ⚠️ **EYE-SPECIFIC**

**Database Migration: `migrations/36_imaging_module.sql`**
```sql
-- Imaging study types catalog
CREATE TABLE imaging_study_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    study_code VARCHAR(50) UNIQUE NOT NULL,
    study_name VARCHAR(200) NOT NULL,
    modality VARCHAR(50), -- 'OCT', 'Fundus_Photography', 'B-Scan', 'Visual_Field', 'Corneal_Topography'
    body_part VARCHAR(100) DEFAULT 'Eye',
    typical_duration_minutes INTEGER,
    requires_dilation BOOLEAN DEFAULT FALSE,
    price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhance imaging_study table
ALTER TABLE imaging_study ADD COLUMN study_type_id UUID REFERENCES imaging_study_type(id);
ALTER TABLE imaging_study ADD COLUMN modality VARCHAR(50);
ALTER TABLE imaging_study ADD COLUMN eye_examined VARCHAR(10) CHECK (eye_examined IN ('OD', 'OS', 'OU'));
ALTER TABLE imaging_study ADD COLUMN is_dilation_required BOOLEAN DEFAULT FALSE;
ALTER TABLE imaging_study ADD COLUMN dilation_time TIMESTAMPTZ;
ALTER TABLE imaging_study ADD COLUMN image_acquired_at TIMESTAMPTZ;
ALTER TABLE imaging_study ADD COLUMN image_file_path TEXT; -- Azure Blob Storage path
ALTER TABLE imaging_study ADD COLUMN thumbnail_path TEXT;
ALTER TABLE imaging_study ADD COLUMN file_size_mb DECIMAL(8,2);
ALTER TABLE imaging_study ADD COLUMN dicom_series_uid VARCHAR(200);
ALTER TABLE imaging_study ADD COLUMN findings TEXT;
ALTER TABLE imaging_study ADD COLUMN is_critical_finding BOOLEAN DEFAULT FALSE;
ALTER TABLE imaging_study ADD COLUMN reported_by_user_id UUID REFERENCES users(id);
ALTER TABLE imaging_study ADD COLUMN reported_at TIMESTAMPTZ;
ALTER TABLE imaging_study ADD COLUMN report_status VARCHAR(20) CHECK (report_status IN ('pending', 'preliminary', 'final', 'amended'));

-- OCT-specific data
CREATE TABLE oct_scan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    imaging_study_id UUID NOT NULL REFERENCES imaging_study(id) ON DELETE CASCADE,
    scan_pattern VARCHAR(100), -- 'Macular Cube', 'ONH Cube', 'RNFL', 'Angiography'
    central_retinal_thickness DECIMAL(6,2), -- in microns
    average_rnfl_thickness DECIMAL(6,2),
    cup_disc_ratio DECIMAL(4,2),
    retinal_volume DECIMAL(8,2),
    signal_strength INTEGER CHECK (signal_strength BETWEEN 1 AND 10),
    interpretation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visual field test data
CREATE TABLE visual_field_test (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    imaging_study_id UUID NOT NULL REFERENCES imaging_study(id) ON DELETE CASCADE,
    test_strategy VARCHAR(100), -- '24-2 SITA Standard', '10-2', '30-2'
    mean_deviation DECIMAL(6,2), -- in dB
    pattern_standard_deviation DECIMAL(6,2),
    visual_field_index INTEGER CHECK (visual_field_index BETWEEN 0 AND 100),
    fixation_losses_percent DECIMAL(5,2),
    false_positives_percent DECIMAL(5,2),
    false_negatives_percent DECIMAL(5,2),
    reliability VARCHAR(20) CHECK (reliability IN ('excellent', 'good', 'fair', 'poor')),
    interpretation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fundus image metadata
CREATE TABLE fundus_image (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    imaging_study_id UUID NOT NULL REFERENCES imaging_study(id) ON DELETE CASCADE,
    image_type VARCHAR(50), -- 'Color', 'Red-Free', 'Autofluorescence', 'Fluorescein_Angiography'
    field_of_view VARCHAR(50), -- '30 degree', '45 degree', '90 degree'
    optic_disc_visibility VARCHAR(20) CHECK (optic_disc_visibility IN ('clear', 'partial', 'not_visible')),
    macula_visibility VARCHAR(20) CHECK (macula_visibility IN ('clear', 'partial', 'not_visible')),
    abnormalities TEXT[], -- ['Microaneurysms', 'Hemorrhages', 'Exudates']
    interpretation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_imaging_study_modality ON imaging_study(modality, report_status);
CREATE INDEX idx_imaging_study_critical ON imaging_study(is_critical_finding) WHERE is_critical_finding = TRUE;

-- Seed imaging study types
INSERT INTO imaging_study_type (tenant_id, study_code, study_name, modality, requires_dilation, price)
SELECT t.id, 'OCT-MACULA', 'OCT Macular Scan', 'OCT', FALSE, 2500 FROM tenant t
UNION ALL
SELECT t.id, 'OCT-RNFL', 'OCT RNFL Analysis', 'OCT', FALSE, 2500 FROM tenant t
UNION ALL
SELECT t.id, 'OCT-ANGIO', 'OCT Angiography', 'OCT', FALSE, 4000 FROM tenant t
UNION ALL
SELECT t.id, 'FUNDUS-COLOR', 'Color Fundus Photography', 'Fundus_Photography', TRUE, 1500 FROM tenant t
UNION ALL
SELECT t.id, 'FUNDUS-FFA', 'Fluorescein Angiography', 'Fundus_Photography', TRUE, 5000 FROM tenant t
UNION ALL
SELECT t.id, 'VF-24-2', 'Visual Field 24-2', 'Visual_Field', FALSE, 2000 FROM tenant t
UNION ALL
SELECT t.id, 'VF-10-2', 'Visual Field 10-2 (Macular)', 'Visual_Field', FALSE, 2000 FROM tenant t
UNION ALL
SELECT t.id, 'BSCAN', 'B-Scan Ultrasound', 'B-Scan', FALSE, 1800 FROM tenant t
UNION ALL
SELECT t.id, 'TOPO', 'Corneal Topography', 'Corneal_Topography', FALSE, 2200 FROM tenant t;
```

**Backend: `Controllers/ImagingController.cs`** (12 endpoints)
- Create imaging order (doctor orders OCT/fundus/visual field)
- Get imaging order details
- Upload image files (Azure Blob Storage integration)
- Update study findings (radiologist/ophthalmologist)
- Mark as critical finding → auto-notify ordering doctor
- Approve report (finalize)
- Get pending reports queue
- Search images by patient/date/modality
- Download DICOM files (placeholder for Phase 5)
- Delete imaging study

**Backend: `Services/ImagingService.cs`**
- Azure Blob Storage integration for image upload
- Image thumbnail generation
- Critical finding auto-notification
- DICOM metadata extraction (Phase 5 - external library integration)

**Frontend: `src/app/(main)/imaging/page.tsx`**
- **Tabs**: Pending Orders / Reporting / Completed
- **Pending Orders**: List of imaging orders awaiting acquisition
- **Reporting**: Studies acquired, awaiting radiologist report
- **Completed**: Finalized reports
- Filters: Modality, Date range, Patient, Doctor, Critical Findings only

**Frontend: `src/app/(main)/imaging/order/[id]/page.tsx`**
- Order details (patient, study type, ordering doctor)
- Upload image files button (Azure Blob upload)
- View uploaded images (thumbnail grid, click to enlarge)
- **OCT-specific**: Input central retinal thickness, RNFL, cup-disc ratio
- **Visual Field-specific**: Input mean deviation, PSD, VFI, reliability
- **Fundus-specific**: Input abnormalities (checkbox list)
- Findings textarea
- Mark as Critical checkbox
- Report status dropdown (Preliminary/Final)
- Submit Report button

**Frontend: `src/app/(main)/imaging/viewer/[id]/page.tsx`**
- Image viewer with zoom, pan, brightness/contrast controls
- Multi-image comparison (side-by-side view for OD vs OS)
- Measurement tools (ruler, angle, area - Phase 5)
- Export to PDF with annotations

**Acceptance Criteria:**
- ✅ Doctors can order OCT/fundus/visual field studies
- ✅ Imaging technicians upload images to Azure Blob Storage
- ✅ OCT/VF/fundus-specific data entry fields functional
- ✅ Critical findings auto-notify ordering doctor via SMS/email
- ✅ Radiologist can finalize reports
- ✅ Image viewer displays uploaded images with zoom/pan
- ✅ Export imaging report to PDF with findings

**Demo Data:**
- 200 imaging studies across 50 patients
- Mix of OCT (40%), Fundus (30%), Visual Field (20%), B-Scan (10%)
- 10 critical findings

---

**Week 15-16: Optical Services Module** ⚠️ **EYE-SPECIFIC**

**Database Migration: `migrations/37_optical_services.sql`**
```sql
-- Optical prescription (separate from clinical examination)
CREATE TABLE optical_prescription (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    patient_id UUID NOT NULL REFERENCES patient(id),
    examination_id UUID REFERENCES clinical_examination(id),
    prescribed_by_user_id UUID NOT NULL REFERENCES users(id),
    prescription_date DATE DEFAULT CURRENT_DATE,
    
    -- Right Eye (OD) - Distance
    od_sph DECIMAL(5,2), -- Sphere (-20.00 to +20.00)
    od_cyl DECIMAL(5,2), -- Cylinder
    od_axis INTEGER CHECK (od_axis BETWEEN 0 AND 180),
    od_add DECIMAL(4,2), -- Addition for bifocals/progressives
    od_prism DECIMAL(4,2),
    od_base VARCHAR(20), -- 'In', 'Out', 'Up', 'Down'
    
    -- Left Eye (OS) - Distance
    os_sph DECIMAL(5,2),
    os_cyl DECIMAL(5,2),
    os_axis INTEGER CHECK (os_axis BETWEEN 0 AND 180),
    os_add DECIMAL(4,2),
    os_prism DECIMAL(4,2),
    os_base VARCHAR(20),
    
    -- Additional measurements
    pupillary_distance DECIMAL(4,1), -- PD in mm (e.g., 63.0)
    pd_right DECIMAL(4,1), -- Monocular PD
    pd_left DECIMAL(4,1),
    near_pd DECIMAL(4,1),
    vertex_distance DECIMAL(4,1) DEFAULT 12.0, -- in mm
    
    -- Lens recommendations
    lens_type VARCHAR(50), -- 'single_vision', 'bifocal', 'progressive', 'occupational'
    lens_material VARCHAR(50), -- 'CR-39', 'polycarbonate', 'high_index_1.67', 'trivex'
    coating_recommended TEXT[], -- ['anti_reflective', 'uv_protection', 'blue_light', 'scratch_resistant']
    tint_recommended VARCHAR(100),
    
    -- Contact lens (if applicable)
    is_contact_lens_prescription BOOLEAN DEFAULT FALSE,
    od_bc DECIMAL(4,2), -- Base Curve
    od_diameter DECIMAL(4,2),
    od_power DECIMAL(5,2),
    os_bc DECIMAL(4,2),
    os_diameter DECIMAL(4,2),
    os_power DECIMAL(5,2),
    contact_lens_brand VARCHAR(100),
    
    prescription_valid_until DATE,
    notes TEXT,
    status VARCHAR(20) CHECK (status IN ('active', 'expired', 'superseded')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_user_id UUID REFERENCES users(id),
    deleted_at TIMESTAMPTZ
);

-- Frame inventory
CREATE TABLE frame_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    branch_id UUID REFERENCES branch(id),
    frame_code VARCHAR(50) UNIQUE NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    frame_type VARCHAR(50), -- 'full_rim', 'semi_rimless', 'rimless'
    frame_material VARCHAR(50), -- 'metal', 'plastic', 'titanium', 'acetate'
    frame_shape VARCHAR(50), -- 'rectangular', 'round', 'cat_eye', 'aviator', 'wayfarer'
    color VARCHAR(100),
    size VARCHAR(20), -- '52-18-140' (lens width - bridge - temple length)
    gender VARCHAR(20) CHECK (gender IN ('unisex', 'male', 'female', 'kids')),
    quantity_in_stock INTEGER DEFAULT 0,
    cost_price DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    supplier VARCHAR(200),
    barcode VARCHAR(100),
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lens inventory/catalog
CREATE TABLE lens_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    lens_code VARCHAR(50) UNIQUE NOT NULL,
    lens_type VARCHAR(50), -- 'single_vision', 'bifocal', 'progressive'
    lens_material VARCHAR(50),
    index_value DECIMAL(4,2), -- 1.50, 1.56, 1.61, 1.67, 1.74
    coating TEXT[], -- ['anti_reflective', 'uv_protection', 'blue_light', 'photochromic']
    tint VARCHAR(100),
    base_price DECIMAL(10,2),
    coating_price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact lens inventory
CREATE TABLE contact_lens_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    branch_id UUID REFERENCES branch(id),
    lens_brand VARCHAR(100),
    lens_type VARCHAR(50), -- 'daily', 'monthly', 'yearly', 'RGP', 'toric', 'multifocal'
    power_range_min DECIMAL(5,2),
    power_range_max DECIMAL(5,2),
    base_curve DECIMAL(4,2),
    diameter DECIMAL(4,2),
    quantity_in_stock INTEGER,
    cost_price DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    expiry_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optical sales (eyewear/contact lenses)
CREATE TABLE optical_sale (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    sale_number VARCHAR(50) UNIQUE,
    patient_id UUID NOT NULL REFERENCES patient(id),
    prescription_id UUID REFERENCES optical_prescription(id),
    sale_date DATE DEFAULT CURRENT_DATE,
    sale_type VARCHAR(50) CHECK (sale_type IN ('eyeglasses', 'contact_lenses', 'accessories')),
    
    -- Eyeglasses details
    frame_id UUID REFERENCES frame_inventory(id),
    frame_name VARCHAR(200),
    frame_price DECIMAL(10,2),
    lens_id UUID REFERENCES lens_catalog(id),
    lens_price DECIMAL(10,2),
    coating_price DECIMAL(10,2),
    
    -- Contact lenses
    contact_lens_id UUID REFERENCES contact_lens_inventory(id),
    contact_lens_boxes INTEGER,
    
    subtotal DECIMAL(10,2),
    discount_amount DECIMAL(10,2),
    tax_amount DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    
    payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'partial', 'paid')),
    delivery_status VARCHAR(20) CHECK (delivery_status IN ('pending', 'ready', 'delivered')),
    expected_delivery_date DATE,
    delivered_at TIMESTAMPTZ,
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_user_id UUID REFERENCES users(id),
    invoice_id UUID REFERENCES invoice(id)
);

CREATE INDEX idx_optical_prescription_patient ON optical_prescription(patient_id, prescription_date DESC);
CREATE INDEX idx_optical_sale_patient ON optical_sale(patient_id);
CREATE INDEX idx_frame_inventory_branch ON frame_inventory(branch_id, is_active);

-- Seed frame inventory
INSERT INTO frame_inventory (tenant_id, branch_id, frame_code, brand, model, frame_type, frame_material, color, size, gender, quantity_in_stock, cost_price, selling_price)
SELECT 
    t.id, 
    b.id,
    'RAY-BAN-5228-' || ROW_NUMBER() OVER(),
    'Ray-Ban',
    'RB5228',
    'full_rim',
    'acetate',
    (ARRAY['Black', 'Tortoise', 'Blue', 'Red'])[FLOOR(RANDOM() * 4 + 1)],
    '52-17-140',
    'unisex',
    FLOOR(RANDOM() * 10 + 1)::INTEGER,
    1500,
    3500
FROM tenant t
CROSS JOIN branch b
WHERE b.tenant_id = t.id
LIMIT 50;
```

**Backend: `Controllers/OpticalController.cs`** (15 endpoints)
- Create optical prescription
- Get optical prescription details
- Get patient's prescription history
- Search frames (by brand, type, size, price range)
- Search lenses (by type, material, coating)
- Create optical sale (eyeglasses or contact lenses)
- Get pending deliveries
- Mark as delivered
- Update frame inventory
- Update contact lens inventory
- Get sales report (daily, monthly)
- IOL power calculation (for cataract surgery - Phase 3)

**Backend: `Services/OpticalService.cs`**
- Prescription validation (sphere, cylinder, axis ranges)
- Lens price calculation (base + coatings)
- Inventory management (decrement on sale)
- IOL power calculation formulas (SRK/T, Haigis, Holladay - Phase 3)

**Frontend: `src/app/(main)/optical/prescriptions/page.tsx`**
- Patient optical prescription history
- Create new prescription button
- View/print prescription

**Frontend: `src/app/(main)/optical/prescriptions/create/page.tsx`**
- Patient selection
- **Input grid**: OD/OS columns, Sph/Cyl/Axis/Add/Prism/Base rows
- PD input (total or monocular)
- Lens type selection
- Lens material and coating recommendations
- Contact lens section (if applicable)
- Prescription validity (default: 1 year from today)
- Save & Print button

**Frontend: `src/app/(main)/optical/sales/page.tsx`**
- **Tabs**: New Sale / Pending Deliveries / Completed Sales
- New Sale: List of patients with recent prescriptions, "Create Sale" button
- Pending Deliveries: Sales awaiting frame/lens readiness
- Completed Sales: Delivered eyewear

**Frontend: `src/app/(main)/optical/sales/create/page.tsx`**
- Patient selection → fetch latest optical prescription (auto-populate)
- Sale type: Eyeglasses / Contact Lenses / Accessories
- **If Eyeglasses**:
  - Frame selection (browse inventory with filters, show images)
  - Lens selection (type, material, coating)
  - Price calculation (frame + lenses + coatings)
- **If Contact Lenses**:
  - Contact lens selection from inventory
  - Number of boxes
- Discount input
- Expected delivery date
- Payment status
- Save Sale button → create invoice, decrement inventory

**Frontend: `src/app/(main)/optical/inventory/page.tsx`**
- **Tabs**: Frames / Lenses / Contact Lenses
- Frame inventory with image thumbnails
- Add/edit frame button
- Low stock alerts

**Acceptance Criteria:**
- ✅ Optometrists create optical prescriptions with sphere, cylinder, axis, PD
- ✅ Frame inventory browsing with filters (brand, type, price)
- ✅ Optical sales workflow: prescription → frame + lens selection → invoice generation
- ✅ Inventory auto-decremented on sale
- ✅ Pending delivery tracking
- ✅ Print optical prescription with patient-friendly format
- ✅ Contact lens fitting and sales

**Demo Data:**
- 100 optical prescriptions across 40 patients
- 50 frame inventory items
- 30 optical sales (20 eyeglasses, 10 contact lenses)

---

**Week 17-18: Insurance Management Module**

(Similar detailed structure for insurance eligibility, claims submission, TPA integration, ICD-10/CPT coding)

**Week 19-20: OT Scheduling & Management Module** ⚠️ **EYE-SPECIFIC**

(Detailed structure for cataract surgery workflow, IOL inventory, IOL power calculation, surgical scheduling, pre-op/post-op checklists)

---

#### Month 5-6: Communication & Reporting

**Week 21-22: SMS/WhatsApp/Email Notifications** ⚠️ **CRITICAL INFRASTRUCTURE**

**Database Migration: `migrations/40_notification_system.sql`**
```sql
-- Notification templates
CREATE TABLE notification_template (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    template_code VARCHAR(50) UNIQUE NOT NULL,
    template_name VARCHAR(200),
    channel VARCHAR(20) CHECK (channel IN ('sms', 'whatsapp', 'email', 'push')),
    subject VARCHAR(200), -- For email
    body_template TEXT, -- Variables: {{patient_name}}, {{appointment_date}}, {{doctor_name}}
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification log
CREATE TABLE notification_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    template_id UUID REFERENCES notification_template(id),
    recipient_type VARCHAR(20), -- 'patient', 'doctor', 'staff'
    recipient_id UUID, -- patient_id or user_id
    recipient_phone VARCHAR(20),
    recipient_email VARCHAR(200),
    channel VARCHAR(20),
    subject VARCHAR(200),
    body TEXT,
    status VARCHAR(20) CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    gateway_message_id VARCHAR(200), -- Twilio SID or SendGrid ID
    gateway_response JSONB,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notification_log_status ON notification_log(status, created_at);
CREATE INDEX idx_notification_log_recipient ON notification_log(recipient_id, channel);

-- Twilio configuration per tenant
CREATE TABLE communication_gateway_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    gateway_type VARCHAR(50), -- 'twilio_sms', 'twilio_whatsapp', 'sendgrid_email', 'azure_communication'
    is_active BOOLEAN DEFAULT FALSE,
    account_sid TEXT, -- Encrypted
    auth_token_encrypted TEXT,
    from_phone_number VARCHAR(20),
    from_email VARCHAR(200),
    whatsapp_number VARCHAR(20),
    config_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed notification templates
INSERT INTO notification_template (tenant_id, template_code, template_name, channel, subject, body_template)
SELECT t.id, 'APPT_REMINDER_24H', 'Appointment Reminder - 24 Hours', 'sms', NULL, 
'Dear {{patient_name}}, this is a reminder for your appointment with Dr. {{doctor_name}} tomorrow at {{appointment_time}}. Please arrive 15 minutes early. Call {{hospital_phone}} to reschedule. -{{hospital_name}}' FROM tenant t
UNION ALL
SELECT t.id, 'APPT_REMINDER_1H', 'Appointment Reminder - 1 Hour', 'sms', NULL,
'Dear {{patient_name}}, your appointment with Dr. {{doctor_name}} is in 1 hour at {{appointment_time}}. See you soon! -{{hospital_name}}' FROM tenant t
UNION ALL
SELECT t.id, 'PRESCRIPTION_READY', 'Prescription Ready for Pickup', 'sms', NULL,
'Dear {{patient_name}}, your prescription is ready for pickup at {{branch_name}}. Please collect during working hours. -{{hospital_name}}' FROM tenant t
UNION ALL
SELECT t.id, 'LAB_RESULT_READY', 'Lab Results Available', 'email', 'Your Lab Results Are Ready',
'Dear {{patient_name}},\n\nYour lab results for tests ordered on {{order_date}} are now available. Please log in to the patient portal to view your results or visit {{hospital_name}} to collect a printed copy.\n\nBest regards,\nLaboratory Team' FROM tenant t
UNION ALL
SELECT t.id, 'PAYMENT_RECEIPT', 'Payment Received', 'email', 'Payment Receipt - {{invoice_number}}',
'Dear {{patient_name}},\n\nThank you for your payment of {{currency}}{{amount}} for invoice {{invoice_number}}. Your receipt is attached.\n\nPayment Details:\nMethod: {{payment_method}}\nDate: {{payment_date}}\nTransaction ID: {{transaction_id}}\n\nBest regards,\n{{hospital_name}}' FROM tenant t
UNION ALL
SELECT t.id, 'OTP_PASSWORD_RESET', 'Password Reset OTP', 'sms', NULL,
'Your password reset OTP is: {{otp}}. Valid for 10 minutes. Do not share this code. -{{hospital_name}}' FROM tenant t;
```

**Backend: `Controllers/NotificationsController.cs`**
- Send notification (manual trigger)
- Get notification logs (with filters)
- Resend failed notifications
- Get notification templates
- Update template

**Backend: `Services/NotificationService.cs`**
- **Twilio SMS Integration**:
  ```csharp
  TwilioClient.Init(accountSid, authToken);
  var message = MessageResource.Create(
      body: bodyText,
      from: new PhoneNumber(twilioPhoneNumber),
      to: new PhoneNumber(recipientPhone)
  );
  ```
- **Twilio WhatsApp Integration**:
  ```csharp
  from: new PhoneNumber("whatsapp:+14155238886"),
  to: new PhoneNumber("whatsapp:" + recipientPhone)
  ```
- **SendGrid Email Integration**:
  ```csharp
  var client = new SendGridClient(apiKey);
  var msg = new SendGridMessage()
  {
      From = new EmailAddress(fromEmail),
      Subject = subject,
      PlainTextContent = bodyText
  };
  msg.AddTo(new EmailAddress(recipientEmail));
  await client.SendEmailAsync(msg);
  ```
- Template variable replacement ({{patient_name}}, {{appointment_date}}, etc.)
- Background job scheduling (Hangfire or Azure Functions)

**Backend: `BackgroundJobs/NotificationJobs.cs`**
- **DailyAppointmentReminderJob** (runs at 9:00 AM daily):
  - Fetch all appointments for tomorrow
  - Send SMS reminder to patients
- **HourlyAppointmentReminderJob** (runs every hour):
  - Fetch appointments starting in next hour
  - Send SMS reminder
- **CriticalLabResultNotificationJob** (runs every 15 minutes):
  - Fetch critical lab results added in last 15 minutes
  - Send SMS/email to ordering doctor

**Frontend: `src/app/(main)/notifications/page.tsx`**
- Notification log list with filters (Date, Channel, Status, Recipient)
- Resend button for failed notifications
- View gateway response (for debugging)

**Frontend: `src/app/(main)/notifications/templates/page.tsx`**
- Template list
- Edit template button → WYSIWYG editor with variable picker
- Test send button (send to test phone/email)

**Frontend: `src/app/(main)/settings/communication/page.tsx`**
- Twilio configuration (Account SID, Auth Token, Phone Number, WhatsApp Number)
- SendGrid configuration (API Key, From Email)
- Test connection button

**Acceptance Criteria:**
- ✅ Appointment reminders sent 24 hours and 1 hour before appointment time
- ✅ SMS sent via Twilio successfully (delivery status tracked)
- ✅ WhatsApp messages sent (requires approved Twilio WhatsApp template)
- ✅ Email sent via SendGrid with attachments (PDF receipts)
- ✅ Failed notifications logged with error messages
- ✅ Template variables replaced correctly
- ✅ Background jobs run on schedule (Hangfire dashboard visible)

---

**Week 23-24: Reporting & Analytics Foundation**

(Pre-built reports: Daily census, Revenue by department, Appointment analytics, Prescription trends, Lab test volumes, Top-selling eyewear)

---

### Phase 4: Reporting, Localization & Polish (Months 7-9)
**Target Completion:** 95% → **Global Deployment Ready**

#### Month 7: Inventory & Nursing (Weeks 25-28)
- Inventory Management Module (stock tracking, purchase orders, suppliers, low stock alerts, expiration tracking, reorder automation)
- Nursing Workflows (MAR - Medication Administration Records, Patient care plans, Vitals logging with IOP for eye patients)

#### Month 8: Reporting & Localization (Weeks 29-32)
- Custom Report Builder (drag-and-drop designer, SQL query generator, save/share reports, security: SQL injection prevention)
- Multi-Language Support (English, Hindi/Spanish, Arabic/French, i18n library, RTL support, language switcher)

#### Month 9: Onboarding & Polish (Weeks 33-36)
- Onboarding Wizard (Organization → Branches → Departments → Users, bulk user import via CSV, data validation)
- Comprehensive Testing (unit, integration, E2E tests, performance optimization with Redis caching, query optimization, security audit, penetration testing)
- Documentation (user manuals, admin guides, API documentation, training videos, knowledge base)

---

### Phase 5: Advanced Features (Months 10-12) - **OPTIONAL**
**Target Completion:** 100% → **World-Class Competitive System**

#### Month 10: Patient Engagement (Weeks 37-40)
- **Patient Portal**: Self-registration, appointment booking, view medical records, download prescriptions/lab reports, secure messaging with doctors
- **Telemedicine Integration**: Video consultations (Twilio Video or Azure Communication Services), screen sharing for OCT/fundus image review, digital prescriptions

#### Month 11: Mobile Apps (Weeks 41-44)
- **Native Mobile Apps (iOS + Android)**: React Native or Flutter
  - Doctor app: Appointments, prescriptions, patient records
  - Pharmacy app: Dispensing queue, inventory
  - Front office app: Registration, billing

#### Month 12: AI & Analytics (Weeks 45-48)
- **Predictive Analytics & AI Decision Support (MVP)**:
  - Appointment no-show prediction (ML model)
  - Inventory forecasting (time series analysis)
  - Clinical decision support: Diabetic retinopathy detection from fundus images (TensorFlow, basic CNN model)
  - Glaucoma risk assessment from OCT/visual field data

---

## 🛠️ Technical Architecture

### Database Schema Summary

**Total Tables:** 144 (96 existing + 48 new in Phases 2-5)

**Eye Hospital-Specific Tables Added:**

**Prescriptions:**
- `eye_medication_catalog` - Eye drop/medication catalog
- `prescription_item` - Multi-medication support

**Laboratory:**
- `lab_test_catalog` - Test catalog with reference ranges
- `lab_test_result` - Multi-test results per order

**Billing & Payments:**
- `charge_master` - Service/procedure pricing
- `invoice_item` - Invoice line items
- `payment_gateway_config` - Razorpay/Stripe/PayPal config
- `payment_reconciliation` - Daily reconciliation

**Pharmacy:**
- `pharmacy_inventory` - Medication stock by branch
- `dispensing_record` - Dispensing transactions
- `dispensing_item` - Dispensed items

**Appointments:**
- `doctor_availability` - Weekly schedule
- `doctor_leave` - Unavailable dates
- `appointment_waitlist` - Waitlist management

**Imaging:**
- `imaging_study_type` - OCT/Fundus/VF catalog
- `oct_scan` - OCT-specific measurements
- `visual_field_test` - Perimetry data
- `fundus_image` - Fundus metadata

**Optical:**
- `optical_prescription` - Sphere/Cylinder/Axis/PD
- `frame_inventory` - Eyewear frames
- `lens_catalog` - Lens types and coatings
- `contact_lens_inventory` - Contact lens stock
- `optical_sale` - Eyewear sales

**Surgery/OT:**
- `ot_equipment` - Surgical instruments, IOL inventory
- `iol_inventory` - IOL catalog (Phase 3 Week 19-20)
- `anesthesia_record` - Anesthesia documentation

**Notifications:**
- `notification_template` - SMS/email templates
- `notification_log` - Sent notifications tracking
- `communication_gateway_config` - Twilio/SendGrid config

### Backend Services Summary

**Total Controllers:** 38 existing + 18 new = **56 controllers**

**New Controllers (Phases 2-5):**
1. `PrescriptionsController.cs` (10 endpoints)
2. `LabOrdersController.cs` (13 endpoints)
3. `LabTestCatalogController.cs` (6 endpoints)
4. `BillingController.cs` (12 endpoints)
5. `PaymentsController.cs` (15 endpoints)
6. `PharmacyController.cs` (14 endpoints)
7. `DoctorAvailabilityController.cs` (6 endpoints)
8. `ImagingController.cs` (12 endpoints)
9. `OpticalController.cs` (15 endpoints)
10. `InsuranceController.cs` (10 endpoints)
11. `ClaimsController.cs` (8 endpoints)
12. `SurgeryController.cs` (12 endpoints)
13. `OTManagementController.cs` (10 endpoints)
14. `NotificationsController.cs` (8 endpoints)
15. `InventoryController.cs` (12 endpoints)
16. `NursingController.cs` (10 endpoints)
17. `ReportsController.cs` (15 endpoints)
18. `PatientPortalController.cs` (12 endpoints - Phase 5)

**Total Endpoints:** 162 existing + ~200 new = **~362 endpoints**

### Frontend Pages Summary

**Total Pages:** 41 existing + 30 new = **~71 pages**

**New Pages (Phases 2-5):**
1. `/prescriptions` - List/create/view prescriptions
2. `/laboratory` - Lab orders, result entry, reports
3. `/billing` - Invoice management
4. `/payments` - Payment processing, reconciliation
5. `/pharmacy` - Dispensing queue, inventory
6. `/imaging` - Imaging orders, reporting, viewer
7. `/optical/prescriptions` - Optical prescriptions
8. `/optical/sales` - Eyewear sales
9. `/optical/inventory` - Frame/lens inventory
10. `/insurance` - Eligibility, claims
11. `/surgery` - OT scheduling, IOL management
12. `/notifications` - Notification logs, templates
13. `/inventory` - Stock management, purchase orders
14. `/nursing` - MAR, care plans
15. `/reports` - Pre-built + custom reports
16. `/patient-portal` - Patient self-service (Phase 5)

### Third-Party Integrations

**Payment Gateways:**
- **Razorpay** (India): `https://api.razorpay.com/v1/`
- **Stripe** (Global): `https://api.stripe.com/v1/`
- **PayPal** (Global): `https://api.paypal.com/v2/`

**Communication Services:**
- **Twilio** (SMS/WhatsApp): `https://api.twilio.com/2010-04-01/`
- **SendGrid** (Email): `https://api.sendgrid.com/v3/`
- **Azure Communication Services** (alternative for video)

**Cloud Services:**
- **Azure Blob Storage**: Medical images, documents, reports
- **Azure Redis Cache**: Session management, permission caching
- **Azure Key Vault**: Secrets management (API keys, connection strings)
- **Azure Monitor**: Logging, alerts, performance monitoring

**Medical Standards (Phase 5):**
- **DICOM**: Medical imaging format
- **HL7/FHIR**: Healthcare data interoperability
- **ICD-10**: Diagnosis codes
- **CPT**: Procedure codes

---

## 📅 Milestones & Deliverables

### Month 3 Milestone (End of Phase 2)
**Deliverables:**
- ✅ Prescriptions Module (with eye drop catalog)
- ✅ Laboratory Orders & Results (with OCT/VF integration)
- ✅ Billing & Invoicing (auto-generation from appointments/labs)
- ✅ Payment Gateway Integration (Razorpay live)
- ✅ Pharmacy Management (dispensing queue, inventory)
- ✅ Appointment Calendar Enhancement (FullCalendar, drag-drop, time slots)

**System Completion:** 70% (up from 50%)  
**Production Readiness:** ✅ **Pilot Deployment Ready** (select 1-2 branches for trial)  
**Demo Data:** 1,000+ records (patients, appointments, prescriptions, lab orders, invoices, payments)

**Success Metrics:**
- 500+ appointments scheduled via new calendar
- 200+ prescriptions created with approval workflow
- 100+ lab orders processed end-to-end
- 300+ invoices generated and paid
- 50+ pharmacy dispensing transactions
- Zero data integrity issues (referential integrity checks pass)

---

### Month 6 Milestone (End of Phase 3)
**Deliverables:**
- ✅ Imaging/Radiology Module (OCT, fundus, visual field, B-scan)
- ✅ Optical Services (prescriptions, eyewear sales, IOL management)
- ✅ Insurance Management (eligibility, claims, TPA integration)
- ✅ OT Scheduling & Management (cataract surgery workflow)
- ✅ SMS/WhatsApp/Email Notifications (appointment reminders, critical results)
- ✅ Pre-Built Reports & Analytics (revenue, appointments, prescriptions, lab, inventory)

**System Completion:** 85% (up from 70%)  
**Production Readiness:** ✅ **Full Clinical Deployment Ready** (all branches)  
**Demo Data:** 3,000+ records including 200 imaging studies, 100 optical sales, 50 surgeries

**Success Metrics:**
- 200+ OCT/fundus scans uploaded and reported
- 100+ optical prescriptions created and eyewear sold
- 50+ cataract surgeries scheduled with IOL power calculation
- 1,000+ SMS/WhatsApp notifications sent successfully
- Insurance claims submission functional (even if TPA approval pending)
- 20+ pre-built reports used by management

---

### Month 9 Milestone (End of Phase 4)
**Deliverables:**
- ✅ Inventory Management Module (stock tracking, purchase orders, low stock alerts)
- ✅ Nursing Workflows (MAR, care plans, vitals logging with IOP)
- ✅ Custom Report Builder (drag-and-drop, save/share reports)
- ✅ Multi-Language Support (English + 2 languages, RTL for Arabic)
- ✅ Onboarding Wizard (tenant setup, bulk user import)
- ✅ Comprehensive Testing (90%+ code coverage, security audit, performance optimization)
- ✅ Documentation (user manuals, API docs, training videos)

**System Completion:** 95% (up from 85%)  
**Production Readiness:** ✅ **Global Deployment Ready** (multi-language, multi-currency)  
**Demo Data:** 5,000+ records, multi-language content

**Success Metrics:**
- Onboarding wizard used to create 5+ new tenants
- Bulk user import processes 100+ users via CSV
- System available in 3 languages (user preference saved)
- 100+ custom reports created by users
- 90%+ unit test coverage
- Security audit findings remediated
- Performance: Page load < 2 seconds, API response < 500ms (95th percentile)

---

### Month 12 Milestone (End of Phase 5 - OPTIONAL)
**Deliverables:**
- ✅ Patient Portal (appointment booking, report access, secure messaging)
- ✅ Telemedicine Integration (video consultations, screen sharing)
- ✅ Native Mobile Apps (iOS + Android for doctors, pharmacy, front office)
- ✅ Predictive Analytics & AI Decision Support (diabetic retinopathy detection MVP, no-show prediction)

**System Completion:** 100%  
**Production Readiness:** ✅ **World-Class Competitive System**  
**Demo Data:** Full production-like data

**Success Metrics:**
- 50+ video consultations conducted
- 500+ patients registered on patient portal
- Mobile apps downloaded and active (100+ users)
- AI diabetic retinopathy detection accuracy > 85% (basic CNN model)
- Appointment no-show prediction accuracy > 70%

---

## 🧪 Testing Strategy

### Unit Testing (Throughout Phases 2-4)
- **Backend**: xUnit for ASP.NET Core services and controllers
- **Frontend**: Jest + React Testing Library for components
- **Target Coverage**: 90%+ for critical paths (prescriptions, billing, pharmacy)

**Critical Path Unit Tests:**
- Prescription approval workflow (junior doctor → senior doctor)
- Drug interaction checking
- Invoice calculation (subtotal, tax, discount)
- Payment gateway webhook signature validation
- Inventory decrement on dispensing/sales
- OCT/visual field data validation
- IOL power calculation formulas

### Integration Testing (Weeks 20, 28, 36)
- **API Integration Tests**: Postman/Newman collections
- **Database Integration Tests**: Test RLS policies, triggers, stored procedures
- **Third-Party Integration Tests**: Razorpay sandbox, Twilio test credentials, SendGrid test mode

**Key Integration Test Scenarios:**
- End-to-end appointment booking → consultation → prescription → pharmacy dispensing → billing → payment
- Lab order → sample collection → result entry → pathologist approval → notification
- Imaging order → image upload → radiologist reporting → critical finding notification
- Optical prescription → frame selection → eyewear sale → inventory update → invoice → payment

### End-to-End (E2E) Testing (Week 35)
- **Playwright** or **Cypress** for frontend workflows
- **Test Scenarios**:
  - Patient registration → appointment booking → doctor consultation → prescription → pharmacy pickup
  - Walk-in patient → examination → lab order → imaging order → billing → payment
  - Insurance patient → eligibility check → consultation → claim submission

### Performance Testing (Week 36)
- **Load Testing**: Apache JMeter or k6
- **Targets**:
  - 500 concurrent users
  - Page load < 2 seconds
  - API response < 500ms (95th percentile)
  - Database query < 100ms
- **Optimization**:
  - Redis caching for permissions, user profiles
  - Database index optimization (186 indexes already created)
  - CDN for static assets (Azure CDN)

### Security Testing (Week 36)
- **Penetration Testing**: OWASP ZAP or Burp Suite
- **Vulnerabilities to Check**:
  - SQL injection (parameterized queries verification)
  - XSS (input sanitization)
  - CSRF (anti-forgery tokens)
  - Authentication bypass
  - Authorization bypass (RBAC/ABAC enforcement)
  - JWT token expiration and refresh
  - Payment gateway webhook signature validation

---

## 📊 Resource Requirements

### Recommended Team Structure

**For Phase 2-3 (Months 1-6):**
- **2 Backend Developers** (ASP.NET Core) - Controllers, services, database migrations
- **2 Frontend Developers** (Next.js, React, TypeScript) - Pages, components, API integration
- **1 Full-Stack Developer** - Integration work, third-party APIs, troubleshooting
- **1 QA Engineer** (from Month 2) - Test planning, automated testing, bug tracking
- **0.5 DevOps Engineer** - Azure infrastructure, CI/CD, monitoring
- **0.5 Project Manager** - Sprint planning, stakeholder communication, risk management

**Total: 5.5-6 FTEs**

**For Phase 4 (Months 7-9):**
- Same team + 1 additional Frontend Developer for multi-language UI
- **Total: 6.5-7 FTEs**

**For Phase 5 (Months 10-12 - OPTIONAL):**
- +1 Mobile Developer (React Native or Flutter)
- +1 ML Engineer (for AI features)
- **Total: 8.5-9 FTEs**

### Sprint Cadence

- **2-week sprints** (preferred for predictable velocity)
- Sprint planning: Monday morning
- Daily standups: 15 minutes
- Mid-sprint review: Wednesday (Week 2)
- Sprint review & demo: Friday (Week 2)
- Sprint retrospective: Friday afternoon
- Demo to stakeholders: End of each month

### Development Environment

**Backend:**
- Visual Studio 2022 or JetBrains Rider
- .NET 8 SDK
- PostgreSQL 17.6 (local or Azure Dev instance)
- Postman for API testing
- Docker for containerization (optional)

**Frontend:**
- VS Code with extensions (ESLint, Prettier, Tailwind IntelliSense)
- Node.js 20+ LTS
- pnpm package manager
- Chrome DevTools, React DevTools

**Shared:**
- Git + GitHub (or Azure DevOps Repos)
- Slack or Microsoft Teams for communication
- Azure DevOps Boards or Jira for task tracking
- Confluence or Notion for documentation

---

## ⚠️ Risk Management

### High-Risk Dependencies

**1. Payment Gateway Integration (Week 7-8)** - **CRITICAL**
- **Risk**: API complexity, webhook reliability, compliance (PCI-DSS)
- **Mitigation**:
  - Use official SDKs (Razorpay .NET SDK, Stripe.NET)
  - Test in sandbox mode extensively
  - Implement retry logic for webhook processing
  - Store encrypted credentials in Azure Key Vault
  - Plan 20% buffer time
- **Fallback**: Manual payment recording if gateway down

**2. SMS/WhatsApp Integration (Week 21-22)** - **HIGH**
- **Risk**: Twilio WhatsApp template approval delays (1-3 weeks), cost overruns if high volume
- **Mitigation**:
  - Apply for WhatsApp template approval in Week 15 (before implementation)
  - Start with SMS, add WhatsApp later
  - Implement rate limiting (max 100 SMS per hour per branch)
  - Monitor costs via Twilio dashboard
- **Fallback**: Email notifications only

**3. Azure Blob Storage Integration (Week 13-14)** - **MEDIUM**
- **Risk**: Large file uploads (OCT scans 50-100 MB), storage costs
- **Mitigation**:
  - Implement chunked upload for files > 10 MB
  - Compress images (JPEG quality 85%, PNG to JPEG conversion)
  - Set blob lifecycle policies (move to cool storage after 90 days)
  - Implement CDN for frequently accessed images
- **Fallback**: Local file storage (not HIPAA-compliant long-term)

**4. DICOM Integration (Phase 5)** - **LOW (OPTIONAL)**
- **Risk**: DICOM standard complexity, specialized libraries ($$$)
- **Mitigation**:
  - Defer to Phase 5
  - Use open-source libraries (Fellow Oak DICOM for .NET)
  - Allocate 4 weeks for DICOM viewer implementation
- **Fallback**: Store DICOM as files, view in external DICOM viewer

**5. HL7/FHIR Interoperability (Phase 5)** - **LOW (OPTIONAL)**
- **Risk**: Healthcare system integration complexity, vendor-specific implementations
- **Mitigation**:
  - Defer to Phase 5 or beyond
  - Focus on FHIR R4 standard
  - Partner with HL7 integration vendors if needed
- **Fallback**: Manual data exchange via CSV/Excel

### Technical Debt Risks

**1. Performance Degradation** (as data grows to 100,000+ records)
- **Mitigation**:
  - Implement pagination everywhere (max 50 records per page)
  - Add database indexes proactively (already 186 indexes exist)
  - Redis caching for frequently accessed data
  - Quarterly performance reviews and optimization sprints

**2. Security Vulnerabilities** (as features added rapidly)
- **Mitigation**:
  - Weekly code reviews with security checklist
  - Automated security scanning (SonarQube, GitHub Dependabot)
  - Penetration testing in Week 36
  - HIPAA compliance audit before production

**3. Browser Compatibility Issues** (especially for older browsers)
- **Mitigation**:
  - Support modern browsers only (Chrome/Edge 100+, Firefox 90+, Safari 15+)
  - Polyfills for critical features
  - Responsive design testing on mobile (iOS Safari, Android Chrome)

---

## 📈 Success Metrics

### Business Metrics

**Month 3 (Phase 2 Complete):**
- 500+ appointments booked via new calendar
- 200+ prescriptions processed (80% electronic, 20% manual fallback)
- 100+ lab orders completed end-to-end
- 50+ pharmacy transactions
- $50,000+ revenue tracked in billing module
- 5+ branches actively using system

**Month 6 (Phase 3 Complete):**
- 200+ OCT/fundus scans reported
- 100+ optical prescriptions and eyewear sales
- 50+ surgeries scheduled
- 1,000+ SMS/email notifications sent (90% delivery rate)
- 20+ pre-built reports used by management
- 80% reduction in manual paperwork (compared to baseline)

**Month 9 (Phase 4 Complete):**
- 10+ new tenants onboarded via wizard
- System available in 3 languages (30%+ non-English usage)
- 100+ custom reports created by users
- Zero HIPAA compliance violations
- 95%+ user satisfaction score

### Technical Metrics

**Code Quality:**
- 90%+ unit test coverage
- 0 critical security vulnerabilities (SonarQube)
- <5% code duplication
- <10 technical debt hours per sprint

**Performance:**
- Page load < 2 seconds (95th percentile)
- API response < 500ms (95th percentile)
- Database query < 100ms (95th percentile)
- 99.9% uptime (Azure SLA)

**Adoption:**
- 500+ active users (doctors, nurses, staff)
- 5,000+ patient records
- 10,000+ appointments scheduled
- 50,000+ audit log entries (indicates active usage)

---

## 🎓 Training & Documentation

### User Manuals (Week 34-35)

**Target Audiences:**
1. **Doctors**: Appointments, prescriptions, clinical examinations, imaging review
2. **Optometrists**: Refraction, optical prescriptions, eyewear sales
3. **Pharmacists**: Dispensing queue, inventory management
4. **Lab Technicians**: Sample collection, result entry
5. **Front Office Staff**: Patient registration, appointment booking, billing
6. **Cashiers**: Payment processing, daily reconciliation
7. **Administrators**: User management, roles, permissions, settings

**Format:**
- PDF manuals (20-30 pages each)
- Interactive web documentation (Docusaurus or GitBook)
- In-app help tooltips (context-sensitive)

### Training Videos (Week 35)

**Topics (10-15 minutes each):**
1. System Overview & Navigation
2. Patient Registration & Appointment Booking
3. Doctor Workflow: Consultation → Prescription → Billing
4. Pharmacy Dispensing Workflow
5. Laboratory Order Processing
6. Optical Prescription & Eyewear Sales
7. Imaging Order & Reporting
8. Billing & Payment Processing
9. Admin: User & Role Management
10. Reports & Analytics

**Platform:** YouTube (unlisted) or Azure Media Services

### Knowledge Base (Week 35)

**Common Issues & Solutions:**
- How to reset user password?
- How to reschedule an appointment?
- What to do if payment gateway fails?
- How to handle expired medications?
- How to mark a patient as VIP?
- How to export data to Excel?
- How to add a new branch/department?

**Platform:** Zendesk or Freshdesk

### API Documentation (Week 36)

**Tools:** Swagger/OpenAPI (already integrated), Postman collections
- All 362 endpoints documented with examples
- Authentication guide (JWT token generation)
- Error codes reference (400, 401, 403, 404, 500)
- Rate limiting policies
- Webhook documentation (payment gateway, notifications)

---

## 🚀 Deployment Strategy

### CI/CD Pipeline (Setup in Month 1, Week 1)

**GitHub Actions or Azure DevOps Pipelines:**

```yaml
# .github/workflows/backend-ci-cd.yml
name: Backend CI/CD
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup .NET 8
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: 8.0.x
      - name: Restore dependencies
        run: dotnet restore
      - name: Build
        run: dotnet build --no-restore
      - name: Run unit tests
        run: dotnet test --no-build --verbosity normal --collect:"XPlat Code Coverage"
      - name: SonarQube scan
        run: dotnet sonarscanner begin /k:"hospital-portal" /d:sonar.host.url="https://sonarcloud.io"
      - name: Publish to Azure App Service (Production)
        if: github.ref == 'refs/heads/main'
        run: dotnet publish -c Release -o ./publish && az webapp deploy --name hospital-portal-api --resource-group production-rg --src-path ./publish
```

**Deployment Environments:**
1. **Development**: Auto-deploy on commit to `develop` branch
2. **Staging**: Auto-deploy on commit to `staging` branch, manual approval required
3. **Production**: Manual deployment on merge to `main` branch, requires 2 approvals

### Azure Infrastructure (Month 9, Week 33)

**Azure Resources:**
- **App Service Plan**: Standard S2 (2 cores, 3.5 GB RAM) for backend
- **App Service**: Next.js frontend (separate app service or Azure Static Web Apps)
- **Azure Database for PostgreSQL**: Flexible Server, General Purpose 2 vCores
- **Azure Blob Storage**: General Purpose v2, Hot tier
- **Azure Redis Cache**: Standard C1 (1 GB)
- **Azure Key Vault**: Secrets management
- **Azure Monitor + Log Analytics**: Logging and alerts
- **Azure Application Insights**: Performance monitoring
- **Azure Communication Services**: Telemedicine video (Phase 5)

**Estimated Monthly Cost (Production):**
- App Service (S2): $146/month
- PostgreSQL (2 vCores): $140/month
- Blob Storage (500 GB): $10/month
- Redis Cache (C1): $76/month
- Key Vault: $5/month
- Monitor + Insights: $20/month
- **Total: ~$400-500/month** (single tenant, 500 users)

**Multi-Tenant Scaling:**
- Shared infrastructure (all tenants on same App Service + Database)
- RLS ensures tenant isolation
- Horizontal scaling: Add more App Service instances (Azure autoscale)
- Database scaling: Scale up to 4/8 vCores as needed

### Database Migration Strategy

**Production Deployment:**
1. Backup existing database
2. Run migration scripts in transaction (ROLLBACK on error)
3. Validate data integrity post-migration (run test queries)
4. Smoke test critical workflows (appointment booking, prescription creation)
5. Monitor error logs for 24 hours
6. Rollback plan: Restore from backup if critical issues

**Zero-Downtime Deployments:**
- Use Azure App Service deployment slots (swap staging → production)
- Database migrations applied to production during low-traffic hours (2-4 AM)
- Feature flags for gradual rollout (enable new features per tenant)

---

## 📞 Support & Maintenance (Post-Launch)

### Support Tiers

**Tier 1: Help Desk** (Email + Phone)
- Response time: 4 hours
- User access issues, password resets, basic navigation help
- Knowledge base article sharing

**Tier 2: Technical Support**
- Response time: 2 hours
- Application errors, data inconsistencies, integration issues
- Log analysis, bug reproduction

**Tier 3: Engineering Escalation**
- Response time: 1 hour (critical), 4 hours (high)
- Code fixes, database repairs, infrastructure issues
- Hotfix deployment

### Monitoring & Alerts

**Azure Monitor Alerts:**
- CPU > 80% for 10 minutes
- Memory > 90% for 5 minutes
- Database connections > 90% of pool
- HTTP 5xx errors > 10 per minute
- Payment gateway webhook failures
- SMS/email sending failures

**On-Call Rotation:**
- 24/7 on-call engineer (rotating weekly)
- PagerDuty or Azure Monitor action groups for alerts
- Escalation path: On-call → Tech Lead → CTO

### Maintenance Windows

**Weekly Maintenance:** Sunday 2-4 AM (low traffic)
- Database index rebuilding
- Log archival (move logs > 90 days to cold storage)
- Security patch application (if critical)

**Monthly Maintenance:** First Sunday of month, 2-6 AM
- Azure service updates
- SSL certificate renewals
- Performance optimization (query tuning, index analysis)
- Backup restoration testing

---

## 🎉 Conclusion

The Eye Hospital Management System has a **solid 50% foundation** with exceptional admin/HR infrastructure (100% complete). The remaining **9-12 months** of work focuses on clinical workflows specific to eye hospitals:

### Immediate Priority (Phase 2 - Months 1-3):
- ✅ Prescriptions (eye drops catalog, approval workflow)
- ✅ Laboratory (OCT integration, critical value alerts)
- ✅ Billing & Payments (Razorpay integration, daily reconciliation)
- ✅ Pharmacy (dispensing queue, inventory with expiry tracking)
- ✅ Enhanced Appointments (FullCalendar, time slots, waitlist)

### Key Differentiators for Eye Hospitals:
- OCT/fundus photography/visual field integration
- Optical prescriptions (sphere, cylinder, axis, PD)
- IOL inventory and power calculation
- Cataract surgery workflow
- Specialized roles (Ophthalmologist, Optometrist, Ophthalmic Technician)
- Eye-specific medication catalog (antibiotic/steroid drops, anti-glaucoma)

### Realistic Timeline:
- **70% complete** by Month 3 (Pilot deployment)
- **85% complete** by Month 6 (Full clinical deployment)
- **95% complete** by Month 9 (Global deployment ready)
- **100% complete** by Month 12 (World-class competitive system with patient portal, telemedicine, mobile apps, AI)

**Recommended Team:** 5.5-6 FTEs for Phases 2-3, 6.5-7 FTEs for Phase 4, 8.5-9 FTEs for Phase 5

**Total Investment:** ~$500K-750K in development costs (9 months × 6 FTEs × $10K/month blended rate) + ~$500/month Azure infrastructure

---

## 📋 Appendix: 14 Standard Departments with Eye Hospital Sub-Departments

1. **STD_DOCTOR** - Doctor
   - Retina & Vitreous
   - Glaucoma
   - Cornea
   - Cataract
   - Pediatric Ophthalmology
   - Oculoplasty
   - Neuro-Ophthalmology
   - General Ophthalmology

2. **STD_OPTOMETRIST** - Optometrist
   - Refraction Services
   - Contact Lens Clinic
   - Low Vision Aids
   - Orthoptics

3. **STD_IMAGING** - Scan/Imaging
   - OCT Imaging
   - Fundus Photography
   - B-Scan Ultrasound
   - Visual Field Testing (Perimetry)

4. **STD_OPTICAL** - Optical
   - Spectacle Sales
   - Lens Laboratory
   - Sunglasses & Accessories

5. **STD_PHARMACY** - Pharmacy
6. **STD_NURSE** - Nurse/OT Management
7. **STD_FRONT_OFFICE** - Front Office
8. **STD_BILLING** - Billing Management
9. **STD_LABORATORY** - Laboratory
10. **STD_INVENTORY** - Inventory
11. **STD_ADMIN** - Admin Management
12. **STD_COUNSELOR** - Counselor
13. **STD_JUNIOR_DOCTOR** - Junior Doctor
14. **STD_INSURANCE** - Insurance

---

**End of Eye Hospital Implementation Plan**

This document serves as the **single source of truth** for all eye hospital implementation work from Month 1 through Month 12. All team members should reference this plan for sprint planning, feature scoping, and milestone tracking.

**Document Owner:** Project Manager  
**Review Cadence:** Updated monthly after sprint retrospectives  
**Distribution:** All team members, stakeholders, product owners
