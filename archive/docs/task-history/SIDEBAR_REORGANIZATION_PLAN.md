# Sidebar Navigation - Reorganization Plan

**Date**: January 31, 2026  
**Purpose**: Identify missing modules, reorganize navigation hierarchy for better workflow and user experience

---

## 📋 Current Structure Analysis

### Current Main Sections (9 sections)

1. **Dashboard** (1 item)
2. **Patient Management** (4 items)
3. **Clinical Operations** (34 items - TOO LARGE!)
4. **Admin Management** (20 items)
5. **Operations** (7 items)
6. **Diagnostic & Imaging** (8 items)
7. **Finance** (5 items)
8. **Advanced Services** (3 items)
9. **System & Reports** (3 items)

**Total**: 85 menu items across 9 sections

---

## 🚨 Issues Identified

### 1. **Clinical Operations Section - Overcrowded**
- **Current**: 34 items in one section
- **Problem**: 
  - Too many items to navigate
  - Eye Examination sub-items (12 items) not properly grouped
  - Specialty Clinics (8 items) scattered
  - Doctor's Desk buried in the middle
  - Pharmacy, Prescriptions, Laboratory mixed with examination items

### 2. **Missing Modules in Sidebar**
Based on backend API (162 endpoints) and database (96 tables), these are **NOT visible** in sidebar:

#### **Completely Missing:**
- ❌ **IPD (Inpatient Department)** - Major module with admissions, ward management, bed allocation
- ❌ **OPD Workflow** - Check-in, Token system, Visit queue (Days 1-10 implementation exists but no menu)
- ❌ **Diagnostics Lab** - Separate from clinical examinations (lab tests, sample tracking)
- ❌ **Consent Management** - Surgical/procedure consent forms
- ❌ **Staff Scheduling** - Doctor/nurse roster, shift management
- ❌ **Bed Management** - Ward allocation, bed availability
- ❌ **Discharge Management** - Discharge summaries, follow-up scheduling
- ❌ **Health Records** - EMR/EHR central repository
- ❌ **Master Data** - Service catalog, ICD codes, CPT codes, drug formulary
- ❌ **Communication** - Internal messaging, announcements
- ❌ **Feedback & Surveys** - Patient satisfaction, staff feedback

#### **Partially Visible (need proper placement):**
- ⚠️ **Laboratory** - Listed under Clinical Operations (should be separate Diagnostic section)
- ⚠️ **Pharmacy** - Listed under Clinical Operations (should be under Operations or separate)
- ⚠️ **Prescriptions** - Mixed with examinations (should be with Pharmacy)
- ⚠️ **OPD Billing** - Under Finance (should have own OPD Management section)

### 3. **Incorrect Grouping/Hierarchy**

#### **Operations Section - Inconsistent**
- Operation Theater, OT Schedule (duplicated)
- Eye Camps (should be under Programs/Community Services)
- Ambulance (should be under Emergency/Transport)

#### **Diagnostic & Imaging - Ophthalmology-Heavy**
- Only eye-specific diagnostics

#### **Finance Section - Incomplete**
- Missing: Expense management, Vendor payments, Cashier, Day-end closing

#### **Admin Management - Too Broad**
- Mixing organizational hierarchy with HR with security
- HR Management has 7 sub-items but buried under Admin

---

## ✅ Proposed Reorganization

### **New Structure (12 Main Sections)**

---

### **1. 🏠 Dashboard** (Keep as-is)
- Overview
- Quick Actions (NEW)
- Today's Summary (NEW)

---

### **2. 🏥 OPD Management** (NEW SECTION)

#### **Registration & Check-In**
- Patient Registration (from Patient Management)
- Walk-In Check-In (NEW - Day 1-2 implementation)
- Appointment Check-In (NEW - Day 1-2)
- Token System (NEW - Day 6 implementation)
- Visit Queue (NEW)

#### **OPD Consultation**
- Doctor's Desk (from Clinical Operations)
- Patient Queue (from Clinical Operations)

#### **OPD Billing**
- Billing & Invoicing (from Finance - Day 7 implementation)
- Payment Collection (NEW - Day 7: 6 payment modes)
- Bill Locking (NEW - Day 5 implementation)
- Outstanding Bills

---

### **3. 👥 Patient Management** (Reorganized)

#### **Patient Records**
- Patient Directory (current: Patients)
- Patient Search (built-in to directory)
- Health Records (NEW - EMR/EHR)
- Medical History (NEW)

#### **Appointments**
- Appointment Calendar (current: Appointments)
- Slot Management (NEW - Day 9 implementation)
- Walk-In Booking (NEW - Day 9 implementation)
- Appointment Conflicts (NEW - Day 9 conflict detection)

#### **Patient Engagement**
- Patient Portal (move from Advanced Services)
- Referrals (keep from current)
- Feedback & Surveys (NEW)

---

### **4. 🩺 Clinical Services** (Split from Clinical Operations)

#### **Examinations**
- General Examinations (keep)
- Vital Signs (NEW)
- Clinical Notes (NEW)

#### **Prescriptions & Pharmacy**
- Prescriptions (from Clinical Operations)
- Pharmacy (from Clinical Operations)
- Drug Administration (NEW)

#### **Laboratory**
- Lab Orders (current: Laboratory)
- Sample Collection (NEW)
- Lab Results (NEW)

#### **Documents**
- Medical Documents (current: Documents)
- Document Sharing (keep)
- Consent Forms (NEW)

---

### **5. 👁️ Ophthalmology** (NEW SECTION - Eye Hospital Specific)

#### **Basic Eye Examination**
- Visual Acuity (from Clinical Operations)
- Retinoscopy
- Refraction (Manual)
- Auto-Refractometry
- Keratometry
- Pachymetry
- Tonometry (IOP)
- Color Vision
- Contrast Sensitivity
- Visual Field Screening

#### **Optical Services**
- Spectacle Dispensing
- Contact Lens Services
- Optical Shop (from Advanced Services)

#### **Specialty Clinics**
- Retina Clinic
- Glaucoma Clinic
- Cataract Clinic
- Cornea Clinic
- Pediatric Ophthalmology
- Neuro-Ophthalmology
- Oculoplasty
- Low Vision Clinic

---

### **6. 🔬 Diagnostics & Imaging** (Expanded)

#### **Ophthalmology Imaging**
- Fundus Imaging
- OCT Imaging
- Corneal Topography
- DR Screening
- Ultrasound (A/B-Scan)
- Visual Field / Perimetry
- Biometry
- Electrophysiology

---

### **7. 🏥 IPD Management** (NEW SECTION - MISSING!)

#### **Admissions**
- Admit Patient (NEW)
- Admission List (NEW)
- Transfer Patient (NEW)

#### **Ward Management**
- Ward Overview (NEW)
- Bed Allocation (NEW)
- Bed Availability (NEW)
- Nursing Station (NEW)

#### **Discharge**
- Discharge Summary (NEW)
- Discharge List (NEW)
- Follow-Up Scheduling (NEW)

---

### **8. ⚕️ Operation Theater** (Reorganized from Operations)

#### **OT Management**
- OT Dashboard (NEW)
- Surgery Schedule (current: OT Schedule)
- OT Booking (NEW)
- Surgery List (current: Operation Theater)

#### **Surgical Services**
- Pre-Op Assessment (NEW)
- Intra-Op Notes (NEW)
- Post-Op Care (NEW)

#### **CSSD**
- Sterilization (current: CSSD)
- Instrument Tracking (NEW)

---

### **9. 💰 Finance & Billing** (Expanded)

#### **Billing**
- OPD Billing (move to OPD Management section)
- IPD Billing (NEW)
- Invoicing (current: Invoicing & Billing)

#### **Payments & Collections**
- Payment Collection (NEW)
- Refunds (NEW)
- Outstanding Payments (NEW)
- Cashier Dashboard (NEW)

#### **Financial Management**
- Financial Dashboard (keep)
- Revenue Reports (current: Financial Reports)
- Expense Management (NEW)
- Vendor Payments (NEW)

#### **Insurance**
- Insurance Claims (keep)
- TPA Management (NEW)
- Pre-Authorization (NEW)

#### **Credit & Installments**
- Credit Management (NEW - from backend)
- Installment Plans (NEW)
- Aging Analysis (NEW - from backend)

---

### **10. 🏗️ Operations & Support** (Reorganized)

#### **Transport Services**
- Ambulance Services (from Operations)
- Vehicle Tracking (NEW)

#### **Supply Chain**
- Stores & Inventory (keep)
- Purchase Orders (NEW)
- Stock Management (NEW)
- Vendor Management (NEW)

#### **Facilities**
- Biomedical Engineering (keep)
- Maintenance (NEW)
- Housekeeping (NEW)

#### **Community Programs**
- Eye Camps (from Operations)
- Outreach Programs (NEW)

---

### **11. ⚙️ Administration** (Reorganized)

#### **Organization**
- Organization Overview (NEW)
- Tenants (keep)
- Organizations (keep)
- Branches (keep)
- Departments (keep)
- Hierarchy Viewer (keep)

#### **Human Resources**
- Employees (current: Users & Employees)
- Onboarding (from HR Management)
- Attendance (from HR Management)
- Leave Management (from HR Management)
- Performance (from HR Management)
- Training (from HR Management)
- Payroll (from HR Management)
- Staff Scheduling (NEW)

#### **Access Control**
- Users Management (current: Users & Employees)
- Roles & Permissions (keep)
- Department Access (keep)
- Access Requests (keep)

#### **Licensing**
- System License (current: Licenses)
- User Licenses (NEW)
- Feature Flags (NEW)

#### **Master Data** (NEW)
- Service Catalog (exists in backend)
- ICD-10 Codes (NEW)
- CPT Codes (NEW)
- Drug Formulary (NEW)
- Insurance Plans (NEW)

---

### **12. 🔒 Security & Compliance** (NEW SECTION)

#### **Security**
- Security Dashboard (keep)
- Active Sessions (NEW)
- Login History (NEW)
- Password Policy (NEW)

#### **Audit & Compliance**
- Audit Logs (keep)
- Compliance Reports (keep)
- HIPAA Compliance (NEW)
- Data Privacy (NEW)

#### **System**
- System Settings (keep)
- Notifications (from System & Reports)
- Bulk Operations (from Admin)
- Analytics (from System & Reports)
- Reports (from System & Reports)

#### **Advanced**
- Telemedicine (from Advanced Services)
- Emergency (from Clinical Operations)
- Quality Management (current: Quality)

---

## 📊 Summary of Changes

### **Additions (New Sections)**
1. **OPD Management** - Critical for OPD workflow (Days 1-10 implemented but not in menu)
2. **Ophthalmology** - Eye hospital-specific services (12 examination types + 8 specialty clinics)
3. **IPD Management** - Completely missing (admissions, wards, discharge)
4. **Security & Compliance** - Separated from Admin for clarity

### **Restructuring**
- **Clinical Operations** (34 items) → Split into:
  - **Clinical Services** (general clinical work)
  - **Ophthalmology** (eye-specific services)
  - **Diagnostics & Imaging** (expanded)

- **Admin Management** (20 items) → Split into:
  - **Administration** (org, HR, access control, master data)
  - **Security & Compliance** (audit, security, system)

- **Operations** (7 items) → Reorganized into:
  - **Operation Theater** (surgical services)
  - **Operations & Support** (transport, supply chain, facilities)

### **New Items Added (35+ new menu items)**
- OPD Workflow components (7 items)
- IPD Management (9 items)
- Master Data Management (5 items)
- Staff Scheduling, Bed Management, Health Records
- Credit Management, TPA, Pre-Authorization
- HIPAA Compliance, Data Privacy, Active Sessions

### **Items Moved**
- Patient Portal: Advanced Services → Patient Management
- Optical Shop: Advanced Services → Ophthalmology
- Pharmacy, Prescriptions, Laboratory: Clinical Operations → Clinical Services
- Eye Camps: Operations → Operations & Support (Community Programs)
- Ambulance: Operations → Operations & Support (Transport)
- Bulk Operations: Admin → Security & Compliance (System)
- Emergency: Clinical Operations → Security & Compliance (Advanced)

---

## 🎯 Benefits

### **1. Workflow-Based Organization**
- **OPD Flow**: Registration → Check-In → Token → Queue → Consultation → Billing
- **IPD Flow**: Admission → Ward → OT (if needed) → Discharge
- **Clinical Flow**: Examination → Lab/Imaging → Prescription → Pharmacy

### **2. Role-Based Navigation**
- **Front Desk**: OPD Management section
- **Doctors**: Clinical Services, Ophthalmology sections
- **Nurses**: IPD Management, Clinical Services
- **Billing**: Finance & Billing section
- **Admin**: Administration, Security & Compliance

### **3. Reduced Cognitive Load**
- No section > 15 items (current: Clinical Operations has 34!)
- Logical grouping by function
- Eye-specific services clearly separated from general clinical

### **4. Scalability**
- Easy to add new features within existing sections
- Clear hierarchy for sub-modules
- Section-level permissions map cleanly to roles

---

## 🛠️ Implementation Steps

### **Phase 1: Immediate (Week 1)**
1. Create OPD Management section with Days 1-10 features
2. Split Clinical Operations into 3 sections (Clinical Services, Ophthalmology, Diagnostics)
3. Move misplaced items (Patient Portal, Optical, Pharmacy, etc.)

### **Phase 2: Short-term (Week 2-3)**
4. Create IPD Management section (requires backend implementation)
5. Expand Finance section with Credit, TPA features
6. Add Master Data sub-section to Administration

### **Phase 3: Medium-term (Week 4-6)**
7. Create Security & Compliance section
8. Add missing items: Staff Scheduling, Bed Management, Health Records
9. Implement General Diagnostics (X-Ray, CT, MRI)

### **Phase 4: Long-term (Week 7+)**
10. User testing and feedback
11. Refinement based on actual usage patterns
12. Documentation and training materials

---

## 📝 Next Actions

**Immediate** (Today):
- [ ] Review and approve this reorganization plan
- [ ] Prioritize which sections to implement first
- [ ] Update Sidebar.tsx with new structure

**This Week**:
- [ ] Implement Phase 1 changes
- [ ] Create missing route files for new sections
- [ ] Update permission mappings
- [ ] Test navigation flow with different user roles

**Next Week**:
- [ ] Implement backend APIs for IPD Management
- [ ] Create frontend components for missing modules
- [ ] Update documentation

---

**Questions for Decision:**
1. Should we implement all 12 sections at once, or phase it (Phase 1-4)?
2. Priority: OPD Management (Days 1-10 are implemented) or IPD Management (not implemented)?
3. Keep Advanced Services section or distribute items to other sections?
4. Rename "Clinical Services" to something else? (suggestions: Clinical Care, Medical Services)

