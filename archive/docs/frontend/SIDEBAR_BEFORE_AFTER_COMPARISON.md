# Sidebar Navigation - Before vs After Comparison

**Date**: January 31, 2026  
**Current Status**: 85 items across 9 sections  
**Proposed Status**: 120+ items across 12 sections (35+ new features added)

---

## 📊 Overall Structure Comparison

### **BEFORE (Current - 9 Sections)**
```
1. Dashboard (1 item)
2. Patient Management (4 items)
3. Clinical Operations (34 items) ⚠️ OVERCROWDED
4. Admin Management (20 items)
5. Operations (7 items)
6. Diagnostic & Imaging (8 items)
7. Finance (5 items)
8. Advanced Services (3 items)
9. System & Reports (3 items)

Total: 85 items
Longest section: 34 items (Clinical Operations)
```

### **AFTER (Proposed - 12 Sections)**
```
1. Dashboard (3 items)
2. OPD Management (12 items) ⭐ NEW SECTION
3. Patient Management (9 items)
4. Clinical Services (10 items)
5. Ophthalmology (23 items) ⭐ NEW SECTION
6. Diagnostics & Imaging (15 items)
7. IPD Management (9 items) ⭐ NEW SECTION
8. Operation Theater (8 items)
9. Finance & Billing (15 items)
10. Operations & Support (12 items)
11. Administration (24 items)
12. Security & Compliance (12 items) ⭐ NEW SECTION

Total: 152 items (67 new items added)
Longest section: 24 items (Administration)
Average: 12.7 items per section
```

---

## 🆕 Section 1: Dashboard

### **BEFORE**
```
📊 Dashboard
  └─ Overview
```

### **AFTER**
```
📊 Dashboard
  ├─ Overview
  ├─ Quick Actions ⭐ NEW
  └─ Today's Summary ⭐ NEW
```

**Changes**: +2 items  
**New Features**: Quick access shortcuts, daily statistics dashboard

---

## 🚨 Section 2: OPD Management (NEW SECTION)

### **BEFORE**
```
❌ MISSING COMPLETELY!

Your implemented features (Days 1-10) have NO menu items:
- Check-in system ✅ Implemented (Day 1-2) but not in menu
- Token generation ✅ Implemented (Day 6) but not in menu
- Billing workflow ✅ Implemented (Day 4-8) but not in menu
- Payment modes ✅ Implemented (Day 7) but not in menu
- Bill locking ✅ Implemented (Day 5) but not in menu
```

### **AFTER**
```
🏥 OPD Management ⭐ NEW SECTION

  Registration & Check-In
  ├─ Patient Registration ⭐ (moved from Patient Management)
  ├─ Walk-In Check-In ⭐ NEW (Day 1-2 implementation)
  ├─ Appointment Check-In ⭐ NEW (Day 1-2 implementation)
  ├─ Token System ⭐ NEW (Day 6: QR codes, thermal print)
  └─ Visit Queue ⭐ NEW (real-time queue display)

  OPD Consultation
  ├─ Doctor's Desk (moved from Clinical Operations)
  └─ Patient Queue (moved from Clinical Operations)

  OPD Billing
  ├─ Billing & Invoicing ⭐ NEW (Day 7: itemized billing)
  ├─ Payment Collection ⭐ NEW (Day 7: 6 payment modes)
  ├─ Bill Locking ⭐ NEW (Day 5: lock/unlock with reason)
  └─ Outstanding Bills ⭐ NEW
```

**Changes**: +12 items (ALL NEW!)  
**New Features**: Complete OPD workflow from check-in to payment  
**Backend APIs**: All implemented ✅  
**Frontend**: Implemented ✅ but needs menu integration

---

## 👥 Section 3: Patient Management

### **BEFORE**
```
👥 Patient Management
  ├─ Patients
  ├─ Appointments
  ├─ Patient Portal
  └─ Referrals
```

### **AFTER**
```
👥 Patient Management

  Patient Records
  ├─ Patient Directory (was: Patients)
  ├─ Patient Search (built into directory)
  ├─ Health Records (EMR/EHR) ⭐ NEW
  └─ Medical History ⭐ NEW

  Appointments
  ├─ Appointment Calendar (was: Appointments)
  ├─ Slot Management ⭐ NEW (Day 9: real-time availability)
  ├─ Walk-In Booking ⭐ NEW (Day 9: walk-in dialog)
  └─ Appointment Conflicts ⭐ NEW (Day 9: conflict detection)

  Patient Engagement
  ├─ Patient Portal (moved from Advanced Services)
  ├─ Referrals (kept)
  └─ Feedback & Surveys ⭐ NEW
```

**Changes**: 4 → 9 items (+5 new)  
**Items Moved In**: Patient Portal (from Advanced Services)  
**Items Moved Out**: None  
**New Features**: Health records, slot management (Day 9), walk-in booking (Day 9), conflict detection (Day 9), surveys

---

## 🩺 Section 4: Clinical Services (Split from Clinical Operations)

### **BEFORE** (Part of Clinical Operations - 34 items)
```
🩺 Clinical Operations (34 ITEMS - TOO MANY!)
  ├─ Examinations
  ├─ [12 Eye Examination items scattered]
  ├─ Doctor's Desk
  ├─ Patient Queue
  ├─ [8 Specialty Clinic items]
  ├─ Pharmacy
  ├─ Prescriptions
  ├─ Laboratory
  ├─ Documents
  ├─ Document Sharing
  ├─ Quality
  └─ Emergency
```

### **AFTER** (Split into 3 sections)
```
🩺 Clinical Services (General Clinical Work)

  Examinations
  ├─ General Examinations (kept)
  ├─ Vital Signs ⭐ NEW
  └─ Clinical Notes ⭐ NEW

  Prescriptions & Pharmacy
  ├─ Prescriptions (moved from Clinical Operations)
  ├─ Pharmacy (moved from Clinical Operations)
  └─ Drug Administration ⭐ NEW

  Laboratory
  ├─ Lab Orders (was: Laboratory)
  ├─ Sample Collection ⭐ NEW
  └─ Lab Results ⭐ NEW

  Documents
  ├─ Medical Documents (was: Documents)
  ├─ Document Sharing (kept)
  └─ Consent Forms ⭐ NEW
```

**Changes**: 10 items (6 moved, 4 new)  
**Items Moved In**: Prescriptions, Pharmacy, Laboratory, Documents (from Clinical Operations)  
**Items Moved Out**: Eye examinations → Ophthalmology, Specialty clinics → Ophthalmology  
**New Features**: Vital signs, clinical notes, drug administration, sample collection, lab results, consent forms

---

## 👁️ Section 5: Ophthalmology (NEW SECTION - Eye Hospital Focus)

### **BEFORE** (Scattered in Clinical Operations)
```
Part of Clinical Operations:
  Eye Examination (section header)
  ├─ Visual Acuity
  ├─ Retinoscopy
  ├─ Refraction (Manual)
  ├─ Auto-Refractometry
  ├─ Keratometry
  ├─ Pachymetry
  ├─ Tonometry (IOP)
  ├─ Color Vision
  ├─ Contrast Sensitivity
  ├─ Visual Field Screening
  ├─ Spectacle Dispensing
  └─ Contact Lens Services

  Specialty Clinics (section header)
  ├─ Retina Clinic
  ├─ Glaucoma Clinic
  ├─ Cataract Clinic
  ├─ Cornea Clinic
  ├─ Pediatric Clinic
  ├─ Neuro-Ophthalmology Clinic
  ├─ Oculoplasty Clinic
  └─ Low Vision Clinic
```

### **AFTER** (Dedicated Section)
```
👁️ Ophthalmology ⭐ NEW SECTION

  Basic Eye Examination
  ├─ Visual Acuity (moved)
  ├─ Retinoscopy (moved)
  ├─ Refraction (Manual) (moved)
  ├─ Auto-Refractometry (moved)
  ├─ Keratometry (moved)
  ├─ Pachymetry (moved)
  ├─ Tonometry (IOP) (moved)
  ├─ Color Vision (moved)
  ├─ Contrast Sensitivity (moved)
  └─ Visual Field Screening (moved)

  Optical Services
  ├─ Spectacle Dispensing (moved)
  ├─ Contact Lens Services (moved)
  └─ Optical Shop (moved from Advanced Services)

  Specialty Clinics
  ├─ Retina Clinic (moved)
  ├─ Glaucoma Clinic (moved)
  ├─ Cataract Clinic (moved)
  ├─ Cornea Clinic (moved)
  ├─ Pediatric Ophthalmology (moved)
  ├─ Neuro-Ophthalmology (moved)
  ├─ Oculoplasty (moved)
  ├─ Low Vision Clinic (moved)
  ├─ Anterior Segment Clinic ⭐ NEW
  └─ Uvea & Ocular Oncology ⭐ NEW
```

**Changes**: 20 → 23 items (+3 new, all others moved)  
**Items Moved In**: 12 eye exams (from Clinical Operations), 8 specialty clinics (from Clinical Operations), Optical Shop (from Advanced Services)  
**Items Moved Out**: None  
**New Features**: 2 additional specialty clinics  
**Benefit**: All eye-related services in one logical section

---

## 🔬 Section 6: Diagnostics & Imaging

### **BEFORE**
```
🔬 Diagnostic & Imaging (8 items, Ophthalmology-only)
  ├─ Fundus Imaging
  ├─ OCT Imaging
  ├─ Electrophysiology
  ├─ Biometry
  ├─ Corneal Topography
  ├─ DR Screening
  ├─ Ultrasound (A/B-Scan)
  └─ Visual Field / Perimetry
```

### **AFTER**
```
🔬 Diagnostics & Imaging (15 items)

  Ophthalmology Imaging (kept)
  ├─ Fundus Imaging (kept)
  ├─ OCT Imaging (kept)
  ├─ Corneal Topography (kept)
  ├─ DR Screening (kept)
  ├─ Ultrasound (A/B-Scan) (kept)
  ├─ Visual Field / Perimetry (kept)
  ├─ Biometry (kept)
  └─ Electrophysiology (kept)

  General Diagnostics ⭐ NEW
  ├─ X-Ray ⭐ NEW
  ├─ Ultrasound (General) ⭐ NEW
  ├─ CT Scan ⭐ NEW
  └─ MRI ⭐ NEW

  Pathology ⭐ NEW
  ├─ Histopathology ⭐ NEW
  ├─ Microbiology ⭐ NEW
  └─ Cytology ⭐ NEW
```

**Changes**: 8 → 15 items (+7 new)  
**Items Moved In**: None  
**Items Moved Out**: None  
**New Features**: General imaging (X-Ray, CT, MRI, general ultrasound), Pathology services  
**Backend**: Needs implementation for general diagnostics

---

## 🏥 Section 7: IPD Management (NEW SECTION - MISSING!)

### **BEFORE**
```
❌ COMPLETELY MISSING!

No inpatient management features in sidebar at all.
Backend APIs exist for admissions, wards, discharge but no frontend/menu.
```

### **AFTER**
```
🏥 IPD Management ⭐ NEW SECTION (All items NEW)

  Admissions
  ├─ Admit Patient ⭐ NEW
  ├─ Admission List ⭐ NEW
  └─ Transfer Patient ⭐ NEW

  Ward Management
  ├─ Ward Overview ⭐ NEW
  ├─ Bed Allocation ⭐ NEW
  ├─ Bed Availability ⭐ NEW
  └─ Nursing Station ⭐ NEW

  Discharge
  ├─ Discharge Summary ⭐ NEW
  ├─ Discharge List ⭐ NEW
  └─ Follow-Up Scheduling ⭐ NEW
```

**Changes**: 0 → 9 items (ALL NEW!)  
**Items Moved In**: None (new section)  
**Items Moved Out**: None  
**New Features**: Complete inpatient workflow - admission, ward management, discharge  
**Backend**: Partially implemented (needs completion)  
**Frontend**: Not implemented (needs creation)  
**Priority**: HIGH (major missing functionality)

---

## ⚕️ Section 8: Operation Theater (Reorganized from Operations)

### **BEFORE** (Part of Operations section)
```
⚙️ Operations (7 items, mixed purposes)
  ├─ Operation Theater
  ├─ OT Schedule
  ├─ Eye Camps
  ├─ Ambulance Services
  ├─ CSSD (Sterilization)
  ├─ Biomedical Engineering
  └─ Stores & Inventory
```

### **AFTER** (Dedicated OT section)
```
⚕️ Operation Theater (8 items)

  OT Management
  ├─ OT Dashboard ⭐ NEW
  ├─ Surgery Schedule (was: OT Schedule)
  ├─ OT Booking ⭐ NEW
  └─ Surgery List (was: Operation Theater)

  Surgical Services
  ├─ Pre-Op Assessment ⭐ NEW
  ├─ Intra-Op Notes ⭐ NEW
  └─ Post-Op Care ⭐ NEW

  CSSD
  ├─ Sterilization (was: CSSD)
  └─ Instrument Tracking ⭐ NEW
```

**Changes**: 3 → 8 items (+5 new, 3 moved)  
**Items Moved In**: Operation Theater, OT Schedule, CSSD (from Operations)  
**Items Moved Out**: Eye Camps, Ambulance, Biomedical, Stores (to Operations & Support)  
**New Features**: OT dashboard, OT booking, pre-op/intra-op/post-op workflows, instrument tracking

---

## 💰 Section 9: Finance & Billing (Expanded)

### **BEFORE**
```
💰 Finance (5 items)
  ├─ Financial Dashboard
  ├─ OPD Billing
  ├─ Invoicing & Billing
  ├─ Insurance Claims
  └─ Financial Reports
```

### **AFTER**
```
💰 Finance & Billing (15 items)

  Billing
  ├─ OPD Billing (moved to OPD Management section)
  ├─ IPD Billing ⭐ NEW
  └─ Invoicing (was: Invoicing & Billing)

  Payments & Collections
  ├─ Payment Collection ⭐ NEW
  ├─ Refunds ⭐ NEW
  ├─ Outstanding Payments ⭐ NEW
  └─ Cashier Dashboard ⭐ NEW

  Financial Management
  ├─ Financial Dashboard (kept)
  ├─ Revenue Reports (was: Financial Reports)
  ├─ Expense Management ⭐ NEW
  └─ Vendor Payments ⭐ NEW

  Insurance
  ├─ Insurance Claims (kept)
  ├─ TPA Management ⭐ NEW
  └─ Pre-Authorization ⭐ NEW

  Credit & Installments
  ├─ Credit Management ⭐ NEW (backend exists)
  ├─ Installment Plans ⭐ NEW (backend exists)
  └─ Aging Analysis ⭐ NEW (backend exists)
```

**Changes**: 5 → 15 items (+10 new)  
**Items Moved In**: None  
**Items Moved Out**: OPD Billing (to OPD Management)  
**New Features**: IPD billing, cashier operations, credit management, TPA, pre-authorization, expenses, vendor payments  
**Backend**: Credit/Installment APIs exist ✅, others need implementation

---

## 🏗️ Section 10: Operations & Support (Reorganized)

### **BEFORE** (Part of Operations section - 4 items)
```
Part of Operations:
  ├─ Eye Camps
  ├─ Ambulance Services
  ├─ Biomedical Engineering
  └─ Stores & Inventory
```

### **AFTER**
```
🏗️ Operations & Support (12 items)

  Transport Services
  ├─ Ambulance Services (moved from Operations)
  └─ Vehicle Tracking ⭐ NEW

  Supply Chain
  ├─ Stores & Inventory (moved from Operations)
  ├─ Purchase Orders ⭐ NEW
  ├─ Stock Management ⭐ NEW
  └─ Vendor Management ⭐ NEW

  Facilities
  ├─ Biomedical Engineering (moved from Operations)
  ├─ Maintenance ⭐ NEW
  └─ Housekeeping ⭐ NEW

  Community Programs
  ├─ Eye Camps (moved from Operations)
  └─ Outreach Programs ⭐ NEW
```

**Changes**: 4 → 12 items (+8 new, 4 moved)  
**Items Moved In**: Ambulance, Stores, Biomedical, Eye Camps (from Operations)  
**Items Moved Out**: OT items (to Operation Theater)  
**New Features**: Vehicle tracking, purchase orders, stock management, vendor management, maintenance, housekeeping, outreach programs

---

## ⚙️ Section 11: Administration (Reorganized & Expanded)

### **BEFORE** (Admin Management - 20 items)
```
⚙️ Admin Management (20 items, mixed hierarchy)
  ├─ Overview
  
  Organization (section header)
  ├─ Hierarchy Viewer
  ├─ Tenants
  ├─ Organizations
  ├─ Branches
  ├─ Departments
  
  People (section header)
  ├─ Users & Employees
  ├─ HR Management (expandable with 7 sub-items):
  │   ├─ Onboarding
  │   ├─ Licenses
  │   ├─ Performance
  │   ├─ Training
  │   ├─ Attendance
  │   ├─ Leave Management
  │   └─ Payroll
  ├─ Bulk Operations
  
  Access Control (section header)
  ├─ Roles & Permissions
  ├─ Department Access
  ├─ Access Requests
  
  Security (section header)
  ├─ Security Dashboard
  ├─ Audit Logs
  ├─ Compliance Reports
  
  Settings
  └─ System Settings
```

### **AFTER** (Split into Administration + Security sections)
```
⚙️ Administration (24 items)

  Organization
  ├─ Organization Overview ⭐ NEW
  ├─ Tenants (kept)
  ├─ Organizations (kept)
  ├─ Branches (kept)
  ├─ Departments (kept)
  └─ Hierarchy Viewer (kept)

  Human Resources
  ├─ Employees (was: Users & Employees)
  ├─ Onboarding (from HR Management)
  ├─ Attendance (from HR Management)
  ├─ Leave Management (from HR Management)
  ├─ Performance (from HR Management)
  ├─ Training (from HR Management)
  ├─ Payroll (from HR Management)
  └─ Staff Scheduling ⭐ NEW

  Access Control
  ├─ Users Management (was: Users & Employees)
  ├─ Roles & Permissions (kept)
  ├─ Department Access (kept)
  └─ Access Requests (kept)

  Licensing
  ├─ System License (from HR Management sub-menu)
  ├─ User Licenses ⭐ NEW
  └─ Feature Flags ⭐ NEW

  Master Data ⭐ NEW
  ├─ Service Catalog ⭐ NEW (backend exists)
  ├─ ICD-10 Codes ⭐ NEW
  ├─ CPT Codes ⭐ NEW
  ├─ Drug Formulary ⭐ NEW
  └─ Insurance Plans ⭐ NEW
```

**Changes**: 20 → 24 items (+9 new, -5 moved to Security)  
**Items Moved In**: HR sub-items (promoted from nested menu)  
**Items Moved Out**: Security Dashboard, Audit Logs, Compliance Reports, Bulk Operations (to Security & Compliance)  
**New Features**: Organization overview, staff scheduling, user licenses, feature flags, master data management (5 items)  
**Backend**: Service Catalog exists ✅, others need implementation

---

## 🔒 Section 12: Security & Compliance (NEW SECTION)

### **BEFORE**
```
Part of Admin Management:
  Security (section header)
  ├─ Security Dashboard
  ├─ Audit Logs
  └─ Compliance Reports

Part of System & Reports:
  ├─ Notifications

Part of Admin Management:
  └─ Bulk Operations

Part of Clinical Operations:
  ├─ Quality
  └─ Emergency

Part of Advanced Services:
  └─ Telemedicine
```

### **AFTER**
```
🔒 Security & Compliance ⭐ NEW SECTION (12 items)

  Security
  ├─ Security Dashboard (moved from Admin)
  ├─ Active Sessions ⭐ NEW
  ├─ Login History ⭐ NEW
  └─ Password Policy ⭐ NEW

  Audit & Compliance
  ├─ Audit Logs (moved from Admin)
  ├─ Compliance Reports (moved from Admin)
  ├─ HIPAA Compliance ⭐ NEW
  └─ Data Privacy ⭐ NEW

  System
  ├─ System Settings (moved from Admin)
  ├─ Notifications (moved from System & Reports)
  ├─ Bulk Operations (moved from Admin)
  ├─ Analytics (moved from System & Reports)
  └─ Reports (moved from System & Reports)

  Advanced
  ├─ Telemedicine (moved from Advanced Services)
  ├─ Emergency (moved from Clinical Operations)
  └─ Quality Management (moved from Clinical Operations)
```

**Changes**: 0 → 12 items (ALL moved from other sections + 4 new)  
**Items Moved In**: Security (3 items from Admin), System & Reports (3 items), Advanced Services (1 item), Clinical Operations (2 items)  
**Items Moved Out**: None  
**New Features**: Active sessions, login history, password policy, HIPAA compliance  
**Benefit**: Centralized security, compliance, and system administration

---

## 🗑️ Removed Sections

### **System & Reports** (Distributed)
```
BEFORE:
  System & Reports (3 items)
  ├─ Analytics
  ├─ Reports
  └─ Notifications

AFTER:
  → All moved to Security & Compliance (System sub-section)
```

### **Advanced Services** (Distributed)
```
BEFORE:
  Advanced Services (3 items)
  ├─ Telemedicine
  ├─ Optical Shop
  └─ Patient Portal

AFTER:
  → Telemedicine: Security & Compliance (Advanced sub-section)
  → Optical Shop: Ophthalmology (Optical Services sub-section)
  → Patient Portal: Patient Management (Patient Engagement sub-section)
```

---

## 📈 Summary Statistics

### **Items Added by Section**

| Section | Before | After | New Items | % Growth |
|---------|--------|-------|-----------|----------|
| Dashboard | 1 | 3 | +2 | +200% |
| **OPD Management** | **0** | **12** | **+12** | **NEW** |
| Patient Management | 4 | 9 | +5 | +125% |
| Clinical Services | 6* | 10 | +4 | +67% |
| **Ophthalmology** | **20*** | **23** | **+3** | **NEW** |
| Diagnostics & Imaging | 8 | 15 | +7 | +88% |
| **IPD Management** | **0** | **9** | **+9** | **NEW** |
| Operation Theater | 3* | 8 | +5 | +167% |
| Finance & Billing | 5 | 15 | +10 | +200% |
| Operations & Support | 4* | 12 | +8 | +200% |
| Administration | 20 | 24 | +4 | +20% |
| **Security & Compliance** | **9*** | **12** | **+3** | **NEW** |

**Total**: 85 items → 152 items (+67 new items, +79% growth)

*Items were previously scattered in other sections

### **Missing Features Now Added (35+ items)**

**OPD Workflow** (12 items):
- ✅ Walk-In Check-In (Day 1-2 ✅)
- ✅ Appointment Check-In (Day 1-2 ✅)
- ✅ Token System (Day 6 ✅)
- ✅ Visit Queue
- ✅ Doctor's Desk
- ✅ Billing & Invoicing (Day 7 ✅)
- ✅ Payment Collection (Day 7 ✅)
- ✅ Bill Locking (Day 5 ✅)
- ✅ Outstanding Bills
- ✅ Slot Management (Day 9 ✅)
- ✅ Walk-In Booking (Day 9 ✅)
- ✅ Conflict Detection (Day 9 ✅)

**IPD Management** (9 items):
- ❌ Admit Patient
- ❌ Admission List
- ❌ Transfer Patient
- ❌ Ward Overview
- ❌ Bed Allocation
- ❌ Bed Availability
- ❌ Nursing Station
- ❌ Discharge Summary
- ❌ Follow-Up Scheduling

**Master Data** (5 items):
- ✅ Service Catalog (backend exists)
- ❌ ICD-10 Codes
- ❌ CPT Codes
- ❌ Drug Formulary
- ❌ Insurance Plans

**Other** (9 items):
- ❌ Health Records (EMR/EHR)
- ❌ Staff Scheduling
- ❌ HIPAA Compliance Dashboard
- ❌ Active Sessions
- ❌ IPD Billing
- ❌ TPA Management
- ❌ Credit Management (backend exists)
- ❌ General Diagnostics (X-Ray, CT, MRI)
- ❌ Pathology

**Legend**:
- ✅ = Backend implemented, just needs menu integration
- ❌ = Needs both backend and frontend implementation

---

## 🎯 Key Improvements

### **1. OPD Workflow Now Visible**
- **Before**: 10 days of implementation hidden (no menu items)
- **After**: Complete OPD section with all features accessible

### **2. Reduced Cognitive Load**
- **Before**: Clinical Operations = 34 items (overwhelming)
- **After**: Split into 3 sections (10, 23, 15 items) - easier to navigate

### **3. Logical Grouping**
- **Before**: Eye Camps in Operations, Optical Shop in Advanced Services
- **After**: Eye Camps in Community Programs, Optical Shop in Ophthalmology

### **4. Role-Based Clarity**
- **Front Desk**: Clear OPD Management section
- **Doctors**: Clinical Services + Ophthalmology sections
- **Billing**: Dedicated Finance & Billing section
- **IT/Security**: Security & Compliance section

### **5. Scalability**
- **Before**: Largest section = 34 items (hard to add more)
- **After**: Largest section = 24 items (room for growth)

---

## ✅ Implementation Checklist

### **Phase 1: Quick Wins (Week 1)**
- [ ] Create OPD Management section (all features implemented, just add menu)
- [ ] Split Clinical Operations → Clinical Services + Ophthalmology + Diagnostics
- [ ] Move Patient Portal, Optical Shop to correct sections
- [ ] Update Sidebar.tsx with new structure

### **Phase 2: Backend API Development (Week 2-3)**
- [ ] IPD Management APIs (admissions, wards, discharge)
- [ ] Master Data APIs (ICD-10, CPT, drug formulary)
- [ ] General Diagnostics APIs (X-Ray, CT, MRI)
- [ ] Credit Management frontend (backend exists)

### **Phase 3: Frontend Development (Week 4-6)**
- [ ] IPD Management UI components
- [ ] Health Records (EMR) interface
- [ ] Staff Scheduling module
- [ ] HIPAA Compliance dashboard
- [ ] Master Data management screens

### **Phase 4: Testing & Refinement (Week 7+)**
- [ ] User testing with real workflows
- [ ] Performance optimization
- [ ] Documentation updates
- [ ] Training materials

---

**Estimated Implementation Time**: 6-8 weeks for full migration

