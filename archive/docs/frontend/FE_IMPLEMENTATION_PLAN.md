# Frontend Implementation Plan for Eye Hospital Portal
**Generated**: January 25, 2026  
**Database Status**: 102 Roles | 145 Permissions | 182 Departments | 94 Role-Department Mappings

---

## Executive Summary

### Current State
- **Backend**: ✅ 100% Complete (162 endpoints, all roles/permissions seeded)
- **Frontend**: 🟡 ~40% Complete (Admin-heavy, Clinical-light)
- **Gap**: **60 clinical/operational modules missing** for eye hospital-specific workflows

### Database Inventory
```sql
Total Roles: 102
├─ Clinical Roles: 43 (Medical, Nursing, Allied Health)
├─ Administrative: 20 (Management, HR, Finance)
├─ Diagnostic: 12 (Lab, Imaging, Screening)
├─ Operations: 15 (OT, Pharmacy, CSSD, Ambulance)
└─ Support: 12 (IT, Security, Facility, Training)

Total Departments: 182 unique types
├─ Eye Hospital Specialty Departments: 19 (Retina, Cornea, Glaucoma, Cataract, etc.)
├─ Diagnostic Services: 12 (Fundus Imaging, OCT, Biometry, ERG/VEP, etc.)
├─ Hospital Operations: 14 (OT, CSSD, Pharmacy, Ambulance, Stores, etc.)
└─ General Hospital: 137 (Existing admin, clinical, support)

Total Permissions: 145 (MODULE:RESOURCE:ACTION pattern)
```

---

## 1. Existing Frontend Modules Analysis

### ✅ FULLY IMPLEMENTED (24 Modules - Admin Focus)
| Module | Path | Roles Supported | Status |
|--------|------|-----------------|--------|
| **Admin Management** | | | |
| Users | `/dashboard/admin/users` | SUPER_ADMIN, HOSPITAL_ADMIN, HR_MANAGER | ✅ |
| Roles | `/dashboard/admin/roles` | SUPER_ADMIN, HOSPITAL_ADMIN | ✅ |
| Permissions | `/dashboard/admin/permissions` | SUPER_ADMIN | ✅ |
| Departments | `/dashboard/admin/departments` | HOSPITAL_ADMIN, DEPT_HEAD | ✅ |
| Branches | `/dashboard/admin/branches` | SUPER_ADMIN, HOSPITAL_ADMIN | ✅ |
| Tenants | `/dashboard/admin/tenants` | SUPER_ADMIN | ✅ |
| Organizations | `/dashboard/admin/organizations` | SUPER_ADMIN, HOSPITAL_ADMIN | ✅ |
| **HR & Employee Management** | | | |
| Employees | `/dashboard/admin/employees` | HR_MANAGER, HOSPITAL_ADMIN | ✅ |
| Attendance | `/dashboard/admin/attendance` | HR_MANAGER, DEPT_HEAD | ✅ |
| Leave Management | `/dashboard/admin/leave` | HR_MANAGER, MANAGER | ✅ |
| Payroll | `/dashboard/admin/payroll` | HR_MANAGER, FINANCE_MANAGER | ✅ |
| Performance | `/dashboard/admin/performance` | HR_MANAGER, DEPT_HEAD | ✅ |
| Performance Reviews | `/dashboard/admin/performance-reviews` | HR_MANAGER, MANAGER | ✅ |
| Training | `/dashboard/admin/training` | HR_MANAGER, L&D_MANAGER | ✅ |
| Onboarding | `/dashboard/admin/onboarding` | HR_MANAGER | ✅ |
| **Security & Compliance** | | | |
| Audit Logs | `/dashboard/admin/audit-logs` | SUPER_ADMIN, COMPLIANCE_OFFICER | ✅ |
| Sessions | `/dashboard/admin/sessions` | SUPER_ADMIN, SECURITY_OFFICER | ✅ |
| Devices | `/dashboard/admin/devices` | IT_MANAGER, SECURITY_OFFICER | ✅ |
| Emergency Access | `/dashboard/admin/emergency-access` | SUPER_ADMIN, EMERGENCY_PHYSICIAN | ✅ |
| Licenses | `/dashboard/admin/licenses` | SUPER_ADMIN, HOSPITAL_ADMIN | ✅ |
| **System Management** | | | |
| Bulk Operations | `/dashboard/admin/bulk-operations` | SUPER_ADMIN, HOSPITAL_ADMIN | ✅ |
| Hierarchy | `/dashboard/admin/hierarchy` | HOSPITAL_ADMIN | ✅ |
| Settings | `/dashboard/admin/settings` | SUPER_ADMIN, HOSPITAL_ADMIN | ✅ |
| Overview | `/dashboard/admin/overview` | ALL ADMIN ROLES | ✅ |

### 🟡 PARTIALLY IMPLEMENTED (8 Modules - Basic Clinical)
| Module | Path | Current Features | Missing Eye Hospital Features | Roles Supported |
|--------|------|------------------|------------------------------|-----------------|
| **Appointments** | `/dashboard/appointments` | ✅ Calendar view<br>✅ Scheduling<br>✅ Status management | ❌ Specialty-specific slots<br>❌ OPD vs. Surgery separation<br>❌ Pre-op clearance workflow<br>❌ IOL selection integration<br>❌ Camp appointment tracking | RECEPTIONIST, APPOINTMENT_COORDINATOR, DOCTOR, NURSING |
| **Patients** | `/dashboard/patients` | ✅ Basic demographics<br>✅ Medical history<br>✅ Appointment history | ❌ Eye-specific history (IOP, Refraction, Fundus)<br>❌ Diabetic retinopathy tracking<br>❌ Glaucoma progression charts<br>❌ Surgery history (IOL implanted)<br>❌ Vision acuity tracking | RECEPTIONIST, DOCTOR, NURSE, OPTOMETRIST |
| **Examinations** | `/dashboard/examinations` | ✅ Basic exam records | ❌ Slit lamp findings<br>❌ Fundus photography integration<br>❌ OCT scans linking<br>❌ Refractometry data<br>❌ Visual field testing | DOCTOR, OPTOMETRIST, ORTHOPTIST, TECHNICIAN |
| **Pharmacy** | `/dashboard/pharmacy` | ✅ Inventory<br>✅ Dispensing | ❌ Eye drops categorization<br>❌ Prescription integration with IOL formula<br>❌ Pre-op medication protocols | PHARMACIST, PHARMACY_MANAGER |
| **Laboratory** | `/dashboard/laboratory` | ✅ Test orders<br>✅ Results | ❌ Fundus imaging workflow<br>❌ OCT scan management<br>❌ Biometry calculations<br>❌ ERG/VEP/EOG testing<br>❌ A-scan/B-scan USG | LAB_TECHNICIAN, LAB_MANAGER, IMAGING_TECHNICIAN |
| **Frontdesk** | `/dashboard/frontdesk` | ✅ Queue management<br>✅ Registration | ❌ OPD token system<br>❌ Eye screening station integration<br>❌ Vision acuity pre-screening<br>❌ Camp patient registration | FRONT_DESK_EXECUTIVE, RECEPTIONIST |
| **Emergency** | `/dashboard/emergency` | ✅ Emergency access logs | ❌ Trauma case workflow<br>❌ Chemical injury protocols<br>❌ Acute glaucoma management<br>❌ Corneal perforation alerts | EMERGENCY_PHYSICIAN, DOCTOR, NURSE |
| **Referrals** | `/dashboard/referrals` | ✅ Basic referral tracking | ❌ Specialty-specific referrals (Retina, Cornea, Glaucoma)<br>❌ Camp-to-hospital referral workflow<br>❌ Tele-ophthalmology consultation | DOCTOR, REFERRAL_COORDINATOR |

### ❌ MISSING (60+ Modules - Eye Hospital Critical)

---

## 2. Critical Missing Modules (Prioritized)

### 🔴 **PHASE 1: Clinical Specialty Departments** (Priority: CRITICAL)
**Timeline**: Weeks 1-3 | **Users Affected**: 15,000+ clinical staff

| Module | Required For Roles | Key Features | Backend API Status |
|--------|-------------------|--------------|-------------------|
| **Retina Department** | RETINA_SPECIALIST, VITREORETINAL_SURGEON | Fundus photography viewer<br>OCT scan integration<br>Diabetic retinopathy grading<br>ARMD tracking<br>Anti-VEGF injection scheduler<br>Laser photocoagulation records | ✅ Backend Ready |
| **Cornea Department** | CORNEA_SPECIALIST, CONTACT_LENS_SPECIALIST | Slit lamp findings<br>Corneal topography maps<br>Keratoconus progression<br>Contact lens fitting records<br>Corneal transplant registry<br>Chemical injury protocols | ✅ Backend Ready |
| **Glaucoma Department** | GLAUCOMA_SPECIALIST | IOP tracking & charting<br>Visual field progression analysis<br>OCT RNFL thickness trends<br>Glaucoma surgery scheduling<br>Medication compliance tracking | ✅ Backend Ready |
| **Cataract Surgery Management** | CATARACT_SURGEON, OT_COORDINATOR | Pre-op assessment checklist<br>IOL power calculation (SRK-T, Barrett, Hill-RBF)<br>Biometry data integration<br>Surgery scheduler (phacoemulsification)<br>Post-op review tracking<br>Complications registry | ✅ Backend Ready |
| **Oculoplasty Department** | OCULOPLASTY_SURGEON | Eyelid surgery registry<br>Ptosis grading<br>Orbital imaging integration<br>Lacrimal duct procedures<br>Socket surgery tracking | ✅ Backend Ready |
| **Pediatric Ophthalmology** | PEDIATRIC_OPHTHALMOLOGIST, ORTHOPTIST | Strabismus assessment (Hirschberg, cover test)<br>Amblyopia tracking<br>Orthoptic exercises log<br>Pediatric refraction records<br>Vision screening charts (Lea Symbols, Cardiff) | ✅ Backend Ready |
| **Neuro-Ophthalmology** | NEURO_OPHTHALMOLOGIST | Visual field defects mapping<br>Pupil reaction testing<br>Cranial nerve assessment<br>Perimetry integration<br>MRI/CT scan linking | ✅ Backend Ready |
| **Low Vision Services** | LOW_VISION_SPECIALIST, ORIENTATION_MOBILITY_SPECIALIST | Low vision devices registry<br>Magnification aids tracking<br>Rehabilitation plan management<br>Visual acuity assessment (low vision charts)<br>ADL (Activities of Daily Living) assessment | ✅ Backend Ready |

**Impact**: **43 clinical roles** currently have NO specialty-specific UI.

---

### 🟠 **PHASE 1.5: Optometry Services** (Priority: CRITICAL - Core Clinical)
**Timeline**: Week 2-3 (Parallel with Phase 1) | **Users Affected**: 3,000+ optometrists

**NOTE**: These modules form the **CORE EXAMINATION SUITE** shared by ALL doctor roles (Ophthalmologists, Optometrists, etc.). Each specialty doctor gets these PLUS their specialty-specific modules.

| Sub-Module | Required For Roles | Key Features | Backend API Status |
|-----------|-------------------|--------------|-------------------|
| **Visual Acuity Testing** | ALL DOCTORS, OPTOMETRIST, ORTHOPTIST | Distance VA (Snellen, LogMAR charts)<br>Near VA testing<br>Pinhole acuity<br>Best corrected visual acuity (BCVA)<br>Pediatric charts (Lea Symbols, Cardiff)<br>Low vision charts<br>VA progression tracking | ✅ Backend Ready |
| **Retinoscopy** | OPTOMETRIST, REFRACTIONIST | Retinoscopy findings entry<br>Working distance calculator<br>Streak vs. Spot retinoscopy<br>Neutralization point recording<br>Pediatric retinoscopy protocols | ✅ Backend Ready |
| **Refractometry (Manual)** | OPTOMETRIST, ALL DOCTORS | Subjective refraction workflow<br>Sphere/Cylinder/Axis entry<br>Jackson cross-cylinder technique<br>Duochrome test<br>Binocular balancing<br>Presbyopia add calculation | ✅ Backend Ready |
| **Auto-Refractometry** | OPTOMETRIST, REFRACTIONIST, TECHNICIAN | Auto-refractor data import<br>Device integration (Nidek, Topcon, Zeiss)<br>Objective refraction values<br>Quick refraction screening<br>Pediatric cycloplegic refraction | ✅ Backend Ready |
| **Keratometry** | OPTOMETRIST, CATARACT_SURGEON, CORNEA_SPECIALIST | Manual keratometry readings<br>K1/K2 values (flat/steep meridian)<br>Corneal astigmatism calculation<br>Pre-op IOL calculation data<br>Contact lens fitting base curve | ✅ Backend Ready |
| **Pachymetry** | OPTOMETRIST, GLAUCOMA_SPECIALIST, CORNEA_SPECIALIST | Central corneal thickness (CCT)<br>Peripheral pachymetry<br>Pre-LASIK screening<br>Glaucoma IOP correction factor<br>Corneal edema monitoring | ✅ Backend Ready |
| **Tonometry (IOP Measurement)** | ALL DOCTORS, OPTOMETRIST | Goldmann applanation tonometry<br>Non-contact tonometry (NCT)<br>Rebound tonometry (iCare)<br>IOP diurnal variation tracking<br>IOP after medication response<br>Glaucoma suspect flagging | ✅ Backend Ready |
| **Color Vision Testing** | OPTOMETRIST, NEURO_OPHTHALMOLOGIST | Ishihara plates<br>Farnsworth D-15 test<br>Hardy-Rand-Rittler (HRR) test<br>Color deficiency classification<br>Occupational screening (pilots, drivers) | ✅ Backend Ready |
| **Contrast Sensitivity** | OPTOMETRIST, RETINA_SPECIALIST, NEURO_OPHTHALMOLOGIST | Pelli-Robson chart<br>CSV-1000 testing<br>Frequency-specific contrast<br>Cataract pre-op assessment<br>Neurological vision loss evaluation | ✅ Backend Ready |
| **Visual Field Screening (Basic)** | OPTOMETRIST, ALL DOCTORS | Confrontation field testing<br>Amsler grid testing<br>Frequency doubling technology (FDT)<br>Glaucoma suspect referral<br>Neurological defect detection | ✅ Backend Ready |
| **Spectacle Dispensing** | OPTOMETRIST, OPTICAL_MANAGER | Prescription generation<br>Frame selection & measurements<br>Pupillary distance (PD) measurement<br>Lens material selection (CR-39, polycarbonate, high-index)<br>Coatings (AR, UV, blue-cut, photochromic)<br>Dispensing tracking & warranty | ✅ Backend Ready |
| **Contact Lens Services** | OPTOMETRIST, CONTACT_LENS_SPECIALIST | Soft lens trial & fitting<br>RGP lens fitting (keratoconus, post-RK)<br>Toric lens for astigmatism<br>Multifocal lens for presbyopia<br>Ortho-K lens management<br>Contact lens complications (GPC, infection) | ✅ Backend Ready |

**Impact**: **ALL 43 clinical roles** need these core optometry modules. This is the foundation for eye examination workflows.

---

### 🟠 **PHASE 2: Diagnostic & Imaging Services** (Priority: HIGH)
**Timeline**: Weeks 4-6 | **Users Affected**: 8,000+ diagnostic staff

| Module | Required For Roles | Key Features | Backend API Status |
|--------|-------------------|--------------|-------------------|
| **IOL Inventory & Management** | IOL_COORDINATOR, INVENTORY_MANAGER | IOL stock management (Alcon, J&J Vision, Zeiss)<br>IOL power distribution chart<br>Surgeon preference tracking<br>Expiry date alerts<br>Premium IOL billing integration<br>Supplier order management | ✅ Backend Ready |
| **Fundus Imaging & Photography** | FUNDUS_PHOTOGRAPHER, CLINICAL_PHOTOGRAPHER | Fundus camera workflow (7-field imaging)<br>Retinal image archival & viewer<br>Diabetic retinopathy AI grading integration<br>Before/after comparison views<br>Report generation with images<br>External eye photography (slit lamp) | ✅ Backend Ready |
| **Retinopathy Screening** | RETINOPATHY_SCREENER | Diabetic retinopathy screening workflow<br>Grading system (ETDRS classification)<br>Referral generation for proliferative DR<br>Annual screening reminders<br>Fundus photo analysis<br>Maculopathy assessment | ✅ Backend Ready |
| **Biometry & IOL Calculations** | BIOMETRY_TECHNICIAN | Biometry data entry (Axial Length, K1, K2, ACD)<br>IOL power calculation (SRK-T, Holladay, Haigis, Barrett Universal II)<br>Toric IOL calculator<br>Multifocal IOL assessment<br>Integration with cataract surgery module<br>A-constant library management | ✅ Backend Ready |
| **OCT Imaging Management** | IMAGING_TECHNICIAN | OCT scan upload & viewer<br>RNFL thickness mapping<br>Macular thickness analysis<br>Anterior segment OCT<br>Corneal thickness measurement<br>Report generation with scans | ✅ Backend Ready |
| **Electrophysiology Lab** | ELECTROPHYSIOLOGY_TECH | ERG (Electroretinography) testing<br>VEP (Visual Evoked Potential) recording<br>EOG (Electrooculography) workflow<br>Waveform analysis & reporting<br>Hereditary retinal disease tracking<br>Pediatric testing protocols | ✅ Backend Ready |

**Impact**: **12 diagnostic roles** lack dedicated workflows. Imaging data is disconnected from clinical modules.

---

### 🟡 **PHASE 3: Operations & Hospital Services** (Priority: MEDIUM)
**Timeline**: Weeks 7-9 | **Users Affected**: 6,000+ operational staff

| Module | Required For Roles | Key Features | Backend API Status |
|--------|-------------------|--------------|-------------------|
| **OT (Operation Theatre) Management** | OT_COORDINATOR, OT_MANAGER, OT_TECHNICIAN | Surgery scheduling (pre-book slots)<br>OT roster management (morning/afternoon lists)<br>Equipment sterilization tracking<br>Consumables usage logging<br>Surgeon-wise surgery count<br>Complication tracking<br>Pre-op checklist (anesthesia clearance, consent, NBM status)<br>Post-op recovery notes | ✅ Backend Ready |
| **CSSD (Central Sterile Supply Department)** | CSSD_SUPERVISOR, CSSD_TECHNICIAN | Sterilization cycle tracking (autoclaves)<br>Instrument set management (cataract, vitreoretinal sets)<br>Biological indicator testing<br>Equipment maintenance logs<br>Expiry date tracking for sterilized packs<br>Linen & drape inventory | ✅ Backend Ready |
| **Eye Camp Coordination** | EYE_CAMP_COORDINATOR, OUTREACH_COORDINATOR | Camp planning & scheduling<br>Location master (villages, schools, industrial sites)<br>Patient screening data entry<br>Surgery-eligible patient selection<br>Transportation logistics<br>Volunteer management<br>Camp outcome reporting (screening count, surgeries, follow-ups) | ✅ Backend Ready |
| **Ambulance Services** | AMBULANCE_COORDINATOR, AMBULANCE_DRIVER | Ambulance fleet management<br>Trip scheduling (patient pickup, discharge)<br>Driver rostering<br>Fuel & maintenance tracking<br>Emergency call logging<br>Referral hospital transfers | ✅ Backend Ready |
| **Stores & Inventory** | STORES_MANAGER, INVENTORY_OFFICER | General inventory (surgical consumables, gloves, masks)<br>Indent & purchase order management<br>Stock expiry alerts<br>Vendor management<br>Department-wise consumption reports<br>Minimum stock level alerts | ✅ Backend Ready |
| **Genetic Counseling** | GENETIC_COUNSELOR | Hereditary eye disease registry<br>Family history pedigree charting<br>Genetic testing coordination (RP, Stargardt, CRB1)<br>Counseling session notes<br>Referral to genetic labs<br>Follow-up tracking | ✅ Backend Ready |
| **Ocular Prosthetics** | OCULAR_PROSTHETICS_SPECIALIST | Artificial eye fitting records<br>Prosthesis customization notes (color, size)<br>Patient satisfaction tracking<br>Re-fitting schedules<br>Inventory of prosthetic eyes | ✅ Backend Ready |
| **Social Services & Charity Care** | SOCIAL_WORKER | Financial assistance applications<br>Charity fund tracking<br>Free surgery approval workflow<br>Government scheme integration (PM-JAY, state schemes)<br>Donor management<br>Patient counseling notes | ✅ Backend Ready |

**Impact**: **15 operational roles** missing critical workflows. Eye camp coordination completely absent (critical for outreach hospitals like Aravind).

---

### 🔵 **PHASE 4: Advanced Services & Digital Health** (Priority: LOW)
**Timeline**: Weeks 10-12 | **Users Affected**: 3,000+ specialized staff

| Module | Required For Roles | Key Features | Backend API Status |
|--------|-------------------|--------------|-------------------|
| **Tele-Ophthalmology Portal** | TELE_OPHTHALMOLOGIST, RURAL_VISION_TECHNICIAN | Remote consultation scheduling<br>Fundus photo upload from peripheral centers<br>AI-assisted screening (DR, glaucoma suspect)<br>E-prescription generation<br>Referral to base hospital<br>Video consultation integration<br>Store-and-forward image review | ✅ Backend Ready |
| **Medical Coding & Billing** | MEDICAL_CODER | ICD-10 coding for eye diseases (H00-H59)<br>CPT code mapping for procedures<br>Insurance claim generation<br>Coding audit trail<br>DRG classification for inpatient billing<br>TPA (Third-Party Administrator) integration | ✅ Backend Ready |
| **Infection Control** | INFECTION_CONTROL_NURSE | Hospital-acquired infection tracking<br>Post-op endophthalmitis registry<br>Hand hygiene compliance monitoring<br>Sterilization audit reports<br>Antibiotic resistance tracking<br>Outbreak investigation workflows | ✅ Backend Ready |
| **Quality & Accreditation** | QUALITY_MANAGER | NABH compliance checklists<br>Quality indicator dashboards (SSI rate, patient satisfaction)<br>Audit schedule management<br>Non-conformance tracking (NCR)<br>Corrective/preventive actions (CAPA)<br>Document control (SOPs, policies)<br>Patient safety incident reporting | ✅ Backend Ready |
| **Diet & Nutrition** | DIETITIAN | Diabetic diet planning (for DR patients)<br>Pre-op fasting protocols<br>Post-op nutrition guidelines<br>BMI tracking for obese patients (risk for anaesthesia)<br>Meal planning for inpatients | ✅ Backend Ready |
| **Clinical Photography (Advanced)** | CLINICAL_PHOTOGRAPHER | Slit lamp photography<br>Anterior segment imaging<br>Gonioscopy photography<br>Fluorescein angiography<br>Indocyanine green angiography<br>Before/after surgery comparison images<br>Medical illustration integration | ✅ Backend Ready |

**Impact**: **12 specialized roles** lack modern digital tools. Tele-ophthalmology critical for Tier 2/3 hospitals.

---

## 3. Role-to-Module Coverage Matrix

### 3.1 Core vs. Specialty Modules Pattern

**CRITICAL PATTERN**: All doctor roles share a **CORE EXAMINATION SUITE** (12 optometry modules) + their **SPECIALTY-SPECIFIC MODULES**.

```
┌─────────────────────────────────────────────────────────────────┐
│ CORE EXAMINATION SUITE (Shared by ALL Doctors + Optometrists)  │
├─────────────────────────────────────────────────────────────────┤
│ 1. Visual Acuity Testing      7. Tonometry (IOP)              │
│ 2. Retinoscopy                8. Color Vision Testing          │
│ 3. Refractometry (Manual)     9. Contrast Sensitivity          │
│ 4. Auto-Refractometry        10. Visual Field Screening        │
│ 5. Keratometry               11. Spectacle Dispensing          │
│ 6. Pachymetry                12. Contact Lens Services         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        ┌──────────────────────────────────────────────┐
        │  SPECIALTY-SPECIFIC MODULES (Role-dependent)  │
        └──────────────────────────────────────────────┘
```

**Examples**:
- **RETINA_SPECIALIST** = Core 12 + Fundus Viewer + OCT + Anti-VEGF + Laser
- **GLAUCOMA_SPECIALIST** = Core 12 + IOP Tracking + Visual Field Analysis + OCT RNFL + Glaucoma Surgery
- **CATARACT_SURGEON** = Core 12 + IOL Calculator + Biometry + Surgery Scheduler + OT Management
- **OPTOMETRIST** = Core 12 only (but uses them most extensively)
- **PEDIATRIC_OPHTHALMOLOGIST** = Core 12 + Strabismus Assessment + Orthoptic Exercises + Pediatric Refraction

### 3.2 Clinical Roles Coverage (43 Total)

| Role | Current FE Coverage | Core Modules Status | Specialty Modules Missing |
|------|---------------------|-------------------|---------------------------|
| CHIEF_OPHTHALMOLOGIST | 20% (Admin only) | ❌ 0/12 Core | All specialty dashboards, surgery oversight, quality metrics |
| RETINA_SPECIALIST | 5% (Basic appointments) | ❌ 0/12 Core | Fundus viewer, OCT integration, Anti-VEGF scheduler, Laser records |
| CORNEA_SPECIALIST | 5% | ❌ 0/12 Core | Topography viewer, Transplant registry, Keratoconus tracking |
| GLAUCOMA_SPECIALIST | 5% | ❌ 0/12 Core | IOP tracking charts, Visual field progression, OCT RNFL analysis, Glaucoma surgery |
| CATARACT_SURGEON | 10% (Appointments + Patients) | ❌ 0/12 Core | IOL calculator, Biometry integration, Surgery scheduler, OT management |
| PEDIATRIC_OPHTHALMOLOGIST | 5% | ❌ 0/12 Core | Pediatric VA charts, Strabismus assessment, Orthoptic exercises, Cycloplegic refraction |
| NEURO_OPHTHALMOLOGIST | 5% | ❌ 0/12 Core | Visual field defects mapping, Cranial nerve exam, Pupil testing, MRI/CT integration |
| OCULOPLASTY_SURGEON | 5% | ❌ 0/12 Core | Eyelid surgery registry, Ptosis grading, Orbital imaging, Lacrimal procedures |
| VITREORETINAL_SURGEON | 5% | ❌ 0/12 Core | VR surgery scheduler, Laser photocoagulation, Retinal detachment tracking |
| LOW_VISION_SPECIALIST | 0% | ❌ 0/12 Core | Low vision devices, Magnification aids, Rehabilitation plans, ADL assessment |
| OPTOMETRIST | 15% (Examinations basic) | ⚠️ 2/12 Core (VA, basic refraction only) | **MISSING 10/12 CORE**: Retinoscopy, Auto-refractometry, Keratometry, Pachymetry, Tonometry, Color vision, Contrast sensitivity, VF screening, Spectacle dispensing, Contact lens |
| ORTHOPTIST | 0% | Orthoptic exercises module, squint assessment |
| CONTACT_LENS_SPECIALIST | 0% | Contact lens services module |
| CHIEF_NURSING_OFFICER | 30% (Admin + HR) | Clinical nursing dashboards, OT nursing, patient care protocols |
| NURSE | 25% (Patients, Emergency) | Specialty-specific nursing workflows (pre-op, post-op, OT) |
| INFECTION_CONTROL_NURSE | 10% (Admin only) | Infection control module, endophthalmitis tracking |
| ANESTHESIOLOGIST | 5% | Anesthesia assessment, pre-op clearance, OT integration |
| BIOMETRY_TECHNICIAN | 0% | Biometry & IOL calculation module (COMPLETE ABSENCE) |
| FUNDUS_PHOTOGRAPHER | 0% | Fundus imaging module (COMPLETE ABSENCE) |
| IMAGING_TECHNICIAN | 15% (Laboratory basic) | OCT imaging, A-scan/B-scan USG workflows |
| ELECTROPHYSIOLOGY_TECH | 0% | ERG/VEP/EOG lab module (COMPLETE ABSENCE) |
| RETINOPATHY_SCREENER | 0% | Retinopathy screening module (COMPLETE ABSENCE) |
| CLINICAL_PHOTOGRAPHER | 0% | Clinical photography module (COMPLETE ABSENCE) |
| IOL_COORDINATOR | 0% | IOL inventory module (COMPLETE ABSENCE) |
| OT_COORDINATOR | 10% (Basic scheduling) | OT management module, equipment tracking, sterilization logs |
| OT_TECHNICIAN | 5% | OT equipment dashboard, consumables tracking |
| CSSD_SUPERVISOR | 0% | CSSD module (COMPLETE ABSENCE) |
| CSSD_TECHNICIAN | 0% | CSSD module (COMPLETE ABSENCE) |
| EYE_CAMP_COORDINATOR | 0% | Eye camp coordination module (COMPLETE ABSENCE) |
| OUTREACH_COORDINATOR | 0% | Outreach management module |
| GENETIC_COUNSELOR | 0% | Genetic counseling module (COMPLETE ABSENCE) |
| TELE_OPHTHALMOLOGIST | 0% | Tele-ophthalmology portal (COMPLETE ABSENCE) |
| RURAL_VISION_TECHNICIAN | 0% | Remote screening portal |
| OCULAR_PROSTHETICS_SPECIALIST | 0% | Prosthetics module (COMPLETE ABSENCE) |
| SOCIAL_WORKER | 5% (Admin) | Social services module, charity care workflow |
| DIETITIAN | 0% | Diet & nutrition module (COMPLETE ABSENCE) |
| MEDICAL_CODER | 0% | Medical coding & billing module (COMPLETE ABSENCE) |
| QUALITY_MANAGER | 10% (Admin, Audit Logs) | Quality & accreditation module, NABH compliance |
| INFECTION_CONTROL_NURSE | 10% | Infection tracking module |
| CHIEF_PHARMACIST | 40% (Pharmacy + Admin) | Eye drops categorization, IOL-linked prescriptions |
| PHARMACIST | 35% (Pharmacy basic) | Specialty pharmacy workflows |
| LAB_TECHNICIAN | 25% (Laboratory basic) | Fundus imaging, OCT, biometry integration |
| LAB_MANAGER | 30% (Laboratory + Admin) | Imaging department oversight |

**Summary**: 
- **28 roles (65%)** have <10% FE coverage
- **15 roles (35%)** have COMPLETE ABSENCE (0% coverage)
- Only **5 roles** have >40% coverage (all admin/HR roles)

---

## 4. Permission Integration Strategy

### Existing Permission System (Found in FE)
```typescript
// File: apps/hospital-portal-web/src/hooks/use-permissions.ts
export function useHasPermission(permissionCode: string): boolean {
  const { permissions } = useCachedAuthStore();
  return permissions.includes(permissionCode);
}

// Usage in components:
const canViewRetinaDashboard = useHasPermission('CLINICAL:RETINA:VIEW');
const canScheduleSurgery = useHasPermission('CLINICAL:SURGERY:SCHEDULE');
```

### Permission Pattern (145 Permissions)
**Format**: `MODULE:RESOURCE:ACTION`

**Examples from Database**:
```
CLINICAL:ANESTHESIA:MANAGE
CLINICAL:RETINA:VIEW
CLINICAL:RETINA:EDIT
CLINICAL:CORNEA:MANAGE
CLINICAL:GLAUCOMA:MANAGE
CLINICAL:IOL:MANAGE
CLINICAL:IMAGING:VIEW
DIAGNOSTIC:OCT:UPLOAD
DIAGNOSTIC:FUNDUS:VIEW
OPERATIONS:OT:SCHEDULE
OPERATIONS:CSSD:MANAGE
HOSPITAL_OPS:EYE_CAMP:COORDINATE
HOSPITAL_OPS:AMBULANCE:DISPATCH
PHARMACY:EYE_DROPS:DISPENSE
```

### How to Apply to New Modules

#### Example 1: Retina Department Dashboard
```tsx
// apps/hospital-portal-web/src/app/dashboard/clinical/retina/page.tsx
'use client';
import { useHasPermission } from '@/hooks/use-permissions';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function RetinaDepartmentPage() {
  const canView = useHasPermission('CLINICAL:RETINA:VIEW');
  const canEdit = useHasPermission('CLINICAL:RETINA:EDIT');
  const canScheduleInjection = useHasPermission('CLINICAL:RETINA:SCHEDULE_INJECTION');

  return (
    <ProtectedRoute requiredPermission="CLINICAL:RETINA:VIEW">
      <div>
        {/* Fundus Viewer - Read-only for viewers */}
        <FundusPhotographyViewer readOnly={!canEdit} />
        
        {/* Anti-VEGF Scheduler - Only for authorized roles */}
        {canScheduleInjection && <AntiVEGFScheduler />}
        
        {/* OCT Integration */}
        <OCTScanIntegration canUpload={canEdit} />
      </div>
    </ProtectedRoute>
  );
}
```

#### Example 2: IOL Inventory Module
```tsx
// apps/hospital-portal-web/src/app/dashboard/operations/iol-inventory/page.tsx
import { useHasPermission } from '@/hooks/use-permissions';

export default function IOLInventoryPage() {
  const canView = useHasPermission('CLINICAL:IOL:VIEW');
  const canManage = useHasPermission('CLINICAL:IOL:MANAGE');
  const canOrder = useHasPermission('OPERATIONS:INVENTORY:PURCHASE');

  return (
    <ProtectedRoute requiredPermission="CLINICAL:IOL:VIEW">
      <div>
        {/* Stock Display - All with VIEW permission */}
        <IOLStockDashboard />
        
        {/* Stock Adjustment - Only IOL_COORDINATOR, INVENTORY_MANAGER */}
        {canManage && <IOLStockAdjustment />}
        
        {/* Purchase Orders - Only INVENTORY_MANAGER */}
        {canOrder && <SupplierOrderManagement />}
      </div>
    </ProtectedRoute>
  );
}
```

#### Example 3: OT Management Module
```tsx
// apps/hospital-portal-web/src/app/dashboard/operations/ot-management/page.tsx
export default function OTManagementPage() {
  const canSchedule = useHasPermission('OPERATIONS:OT:SCHEDULE');
  const canManageSterilization = useHasPermission('OPERATIONS:OT:STERILIZATION');
  const canViewAll = useHasPermission('OPERATIONS:OT:VIEW_ALL');

  return (
    <ProtectedRoute requiredPermission="OPERATIONS:OT:VIEW">
      {/* OT Schedule - Surgeons can view own, coordinators view all */}
      <SurgeryScheduler 
        viewAll={canViewAll} 
        canSchedule={canSchedule} 
      />
      
      {/* Sterilization Tracking - Only OT_TECHNICIAN, OT_MANAGER */}
      {canManageSterilization && <SterilizationTracker />}
    </ProtectedRoute>
  );
}
```

---

## 5. Component Reuse Strategy

### Existing Reusable Components (Found in Codebase)

#### UI Components (Shadcn/Tailwind)
```
✅ Button, Input, Card, Table, Dialog, Label
✅ DateRangePicker, SearchFilter, StatusBadge
✅ AdvancedFilters, EmptyState
✅ ActionButtons (EditButton, DeleteButton, etc.)
```

#### Domain Components
```
✅ AppointmentCalendar.tsx - Reuse for specialty-specific appointment views
✅ PatientsManagement.tsx - Extend for eye-specific patient history
✅ DepartmentForm.tsx - Reuse for specialty department creation
✅ UserPermissionOverride.tsx - Apply to clinical role permission overrides
✅ PHIAccessTracker.tsx - Reuse for HIPAA audit in clinical modules
```

### New Components Needed (60+ Modules)

#### Core Examination Components (HIGHEST Priority)
```
🔨 VisualAcuityChart.tsx - Distance/Near VA testing with chart selection (Snellen, LogMAR, Lea, Cardiff)
🔨 RetinoscopyWorksheet.tsx - Retinoscopy findings entry with working distance calculator
🔨 RefractionForm.tsx - Manual subjective refraction (Sphere/Cylinder/Axis/VA, duochrome, cross-cylinder)
🔨 AutoRefractorImport.tsx - Auto-refractor data import with device integration
🔨 KeratometryEntry.tsx - K1/K2 readings with astigmatism calculation
🔨 PachymetryRecorder.tsx - Central/peripheral corneal thickness measurement
🔨 TonometryRecorder.tsx - IOP measurement (Goldmann, NCT, Rebound) with diurnal tracking
🔨 ColorVisionTest.tsx - Ishihara, D-15, HRR test interface
🔨 ContrastSensitivityChart.tsx - Pelli-Robson, CSV-1000 testing
🔨 VisualFieldScreening.tsx - Confrontation, Amsler grid, FDT screening
🔨 SpectacleDispensing.tsx - Prescription generation, frame selection, PD measurement, lens selection
🔨 ContactLensFitting.tsx - Soft/RGP lens trial, toric/multifocal selection, complication tracking
```

#### Clinical Specialty Components (High Priority)
```
🔨 FundusPhotographyViewer.tsx - Image viewer with DR grading overlay
🔨 OCTScanViewer.tsx - Layer segmentation & thickness maps
🔨 IOLPowerCalculator.tsx - SRK-T, Barrett, Hill-RBF formulas
🔨 BiometryDataEntry.tsx - Axial length, K1/K2, ACD inputs (integrates with KeratometryEntry)
🔨 VisualFieldAnalyzer.tsx - Perimetry progression charts (integrates with VisualFieldScreening)
🔨 IOPTrendChart.tsx - Glaucoma IOP tracking graph (integrates with TonometryRecorder)
🔨 SurgeryScheduler.tsx - OT slot booking calendar
🔨 PreOpChecklist.tsx - Anesthesia clearance, consent, NBM status
🔨 AntiVEGFScheduler.tsx - Injection appointment tracker
🔨 CornealTopographyViewer.tsx - Keratoconus progression maps (integrates with PachymetryRecorder)
🔨 OrthopticExerciseLog.tsx - Amblyopia therapy tracking
🔨 LowVisionDeviceRegistry.tsx - Magnification aids inventory
```

#### Diagnostic Components
```
🔨 ERGVEPWaveformViewer.tsx - Electrophysiology test results
🔨 FluoresceinAngiographyViewer.tsx - FA image timeline
🔨 AScanBScanViewer.tsx - Ultrasound imaging display
🔨 RetinopathyGradingForm.tsx - ETDRS classification interface
🔨 BiometryCalculator.tsx - IOL formula integration
```

#### Operational Components
```
🔨 IOLInventoryDashboard.tsx - Stock levels, expiry alerts
🔨 OTEquipmentTracker.tsx - Sterilization cycle logging
🔨 CampPlanningCalendar.tsx - Eye camp scheduling
🔨 AmbulanceTripScheduler.tsx - Patient transport logistics
🔨 CharityCareApplication.tsx - Free surgery approval workflow
🔨 GeneticPedigreeChart.tsx - Family history visualization
```

### Component Architecture Pattern
```
📁 apps/hospital-portal-web/src/
  📁 components/
    📁 clinical/              ← NEW: Clinical specialty components
      📁 retina/
        - FundusViewer.tsx
        - AntiVEGFScheduler.tsx
        - OCTIntegration.tsx
      📁 cornea/
        - TopographyViewer.tsx
        - TraA: Core Examination Suite** (Weeks 1-2) - **HIGHEST PRIORITY**
**Goal**: Build the 12 core optometry modules that ALL doctors need  
**Effort**: 10 FE developer-weeks

| Week | Modules | Components | Roles Enabled |
|------|---------|------------|---------------|
| **Week 1** | Visual Acuity Testing<br>Retinoscopy<br>Refractometry (Manual)<br>Auto-Refractometry<br>Keratometry<br>Pachymetry | VisualAcuityChart, RetinoscopyWorksheet, RefractionForm, AutoRefractorImport, KeratometryEntry, PachymetryRecorder | **ALL 43 CLINICAL ROLES** (partial) |
| **Week 2** | Tonometry (IOP)<br>Color Vision Testing<br>Contrast Sensitivity<br>Visual Field Screening<br>Spectacle Dispensing<br>Contact Lens Services | TonometryRecorder, ColorVisionTest, ContrastSensitivityChart, VisualFieldScreening, SpectacleDispensing, ContactLensFitting | **ALL 43 CLINICAL ROLES** (complete core) |

**Deliverables**:
- 12 core examination modules (shared by ALL doctors)
- 25+ optometry components
- **Foundation for all clinical workflows**
- OPTOMETRIST role 100% enabled

---

### **PHASE 1B: Clinical Specialty Departments** (Weeks 3-5)
**Goal**: Add specialty-specific modules on top of core suite  
**Effort**: 18 FE developer-weeks

| Week | Modules | Components | Roles Enabled |
|------|---------|------------|---------------|
| **Week 3** | Retina Department<br>Cornea Department | FundusViewer, AntiVEGFScheduler, TopographyViewer, TransplantRegistry | RETINA_SPECIALIST, VITREORETINAL_SURGEON, CORNEA_SPECIALIST |
| **Week 4** | Glaucoma Department<br>Cataract Surgery | IOPTrendChart, VisualFieldAnalysis, IOLCalculator, BiometryIntegration | GLAUCOMA_SPECIALIST, CATARACT_SURGEON |
| **Week 5** | Pediatric Ophthalmology<br>Neuro-Ophthalmology<br>Oculoplasty<br>Low Vision | OrthopticExerciseLog, StrabismusAssessment, CranialNerveExam, EyelidSurgeryRegistry, LowVisionDevices | PEDIATRIC_OPHTHALMOLOGIST, ORTHOPTIST, NEURO_OPHTHALMOLOGIST, OCULOPLASTY_SURGEON, LOW_VISION_SPECIALIST |

**Deliverables**:
- 8 clinical department dashboards
- 20+ specialty components
- 35+ role-specific workflows (all using core 12 modules as foundation) ← NEW: Hospital operations
      - OTScheduler.tsx
      - IOLInventory.tsx
      - CampCoordination.tsx
      - AmbulanceDispatch.tsx
    📁 shared/               ← Reusable across modules
      - ImageViewer.tsx      (for fundus, OCT, slit lamp)
      - ChartWidget.tsx      (for IOP, VA, progression)
      - CalculatorDialog.tsx (for IOL, biometry)
```

---

## 6. Phased Implementation Roadmap

### **PHASE 1: Clinical Specialty Departments** (Weeks 1-3)
**Goal**: Enable 43 clinical roles with specialty dash6-8)
**Goal**: Connect imaging workflows to clinical modules  
**Effort**: 12 FE developer-weeks

| Week | Modules | Components | Roles Enabled |
|------|---------|------------|---------------|
| **Week 6** | IOL Inventory<br>Fundus Imaging | IOLInventoryDashboard, FundusPhotographyWorkflow, ImageArchival | IOL_COORDINATOR, FUNDUS_PHOTOGRAPHER, CLINICAL_PHOTOGRAPHER, INVENTORY_MANAGER |
| **Week 7** | Retinopathy Screening<br>Biometry & IOL Calculations | RetinopathyGradingForm, BiometryCalculator, IOLFormulaSelector | RETINOPATHY_SCREENER, BIOMETRY_TECHNICIAN |
| **Week 8** | OCT Imaging<br>Electrophysiology Lab | OCTScanManagement, ERGVEPWorkflow | IMAGING_TECHNICIAN, ELECTROPHYSIOLOGY_TECH |

**Deliverables**:
- 6 diagnostic modules
- Integration with clinical modules (retina ↔ fundus, cataract ↔ biometry, glaucoma ↔ OCT)
- Integration with Core Suite (auto-refractometer data → refractometry module
- Permission-based access control for all modules

---

### **PHASE 2: Diagnostic & Imaging Services** (Weeks 49-11)
**Goal**: Complete operational workflows for hospital management  
**Effort**: 10 FE developer-weeks

| Week | Modules | Components | Roles Enabled |
|------|---------|------------|---------------|
| **Week 9** | OT Management<br>CSSD | OTScheduler, SterilizationTracker, EquipmentLog | OT_COORDINATOR, OT_MANAGER, OT_TECHNICIAN, CSSD_SUPERVISOR, CSSD_TECHNICIAN |
| **Week 10** | Eye Camp Coordination<br>Ambulance Services | CampPlanningCalendar, ScreeningDataEntry, AmbulanceTripScheduler | EYE_CAMP_COORDINATOR, OUTREACH_COORDINATOR, AMBULANCE_COORDINATOR, AMBULANCE_DRIVER |
| **Week 11** | Genetic Counseling<br>Ocular Prosthetics<br>Social Services | GeneticPedigreeChart, ProstheticsFittingLog, CharityCareApplication | GENETIC_COUNSELOR, OCULAR_PROSTHETICS_SPECIALIST, SOCIAL_WORKER |

**Deliverables**:
- 7 operational modules
- Eye camp workflow (critical for outreach hospitals)
- Integration with Core Suite (camp screening uses VA, IOP, basic refraction, cataract ↔ biometry)
- AI-assisted DR screening integration
- 12+ diagnostic role workflows

---

### **PHASE 3: Operations & Hospital Services** (Weeks 7-9)
**Goal**: Complete operational workflows for hospital management  
**Effort**: 10 FE developer-weeks

| Week | Modules | Components | Roles Enabled |
|------|---------|------------|---------------|
| **Week 7** | OT Management<br>CSSD | OTScheduler, SterilizationTracker, EquipmentLog | OT_COORDINATOR, OT_MANAGER, OT_TECHNICIAN, CSSD_SUPERVISOR, CSSD_TECHNICIAN |
| **Week 8** | Eye Camp Coordination<br>Ambulance Services | CampPlanningCalendar, ScreeningDataEntry, AmbulanceTripScheduler | EYE_CAMP_COORDINATOR, OUTREACH_COORDINATOR, AMBULANCE_COORDINATOR, AMBULANCE_DRIVER |
| **Week 9** | Genetic Counseling<br>Ocular Prosthetics<br>Social Services | GeneticPedigreeChart, ProstheticsFittingLog, CharityCareApplication | GENETIC_COUNSELOR, OCULAR_PROSTHETICS_SPECIALIST, SOCIAL_WORKER |

**Deliverables**:
- 7 operational modules
- Eye camp workflow (critical for outreach hospitals)
- 15+ operational role workflows

---2-14)
**Goal**: Modern digital health capabilities  
**Effort**: 8 FE developer-weeks

| Week | Modules | Components | Roles Enabled |
|------|---------|------------|---------------|
| **Week 12** | Tele-Ophthalmology<br>Medical Coding | TeleConsultationPortal, RemoteScreeningUpload, ICDCPTCodingInterface | TELE_OPHTHALMOLOGIST, RURAL_VISION_TECHNICIAN, MEDICAL_CODER |
| **Week 13** | Infection Control<br>Quality & Accreditation | InfectionTrackingDashboard, EndophthalmitisRegistry, NABHComplianceChecklists | INFECTION_CONTROL_NURSE, QUALITY_MANAGER |
| **Week 14** | Diet & Nutrition<br>Clinical Photography (Advanced) | DietPlanningModule, FluoresceinAngiographyViewer | DIETITIAN, CLINICAL_PHOTOGRAPHER |

**Deliverables**:
- 6 advanced modules
- Tele-ophthalmology portal (store-and-forward + video) **using Core Suite modules remotely**
- 6 advanced modules
- Tele-ophthalmology portal (store-and-forward + video)
- NABH accreditation support
- 12+ specialized role workflows

---

## 7. Technical Implementation Details

### Database Integration
**Backend APIs**: ✅ All 162 endpoints operational  
**Connection**: Existing API client at `apps/hospital-portal-web/src/lib/api.ts`

```typescript
// Example API call for Retina Department
const retinaApi = {
  getFundusImages: (patientId: string) => 
    getApi().get(`/clinical/retina/fundus-images/${patientId}`),
  
  scheduleAntiVEGFInjection: (data: AntiVEGFAppointment) =>
    getApi().post('/clinical/retina/anti-vegf-schedule', data),
  
  getOCTScans: (patientId: string) =>
    getApi().get(`/diagnostic/oct/scans/${patientId}`)
};
```
examination/                  ← NEW (CORE SUITE - Highest Priority)
    visual-acuity/page.tsx
    retinoscopy/page.tsx
    refraction/page.tsx
    auto-refraction/page.tsx
    keratometry/page.tsx
    pachymetry/page.tsx
    tonometry/page.tsx
    color-vision/page.tsx
    contrast-sensitivity/page.tsx
    visual-field-screening/page.tsx
    spectacle-dispensing/page.tsx
    contact-lens/page.tsx
  clinical/                     ← NEW (Specialty Departments)
    retina/page.tsx
    cornea/page.tsx
    glaucoma/page.tsx
    cataract/page.tsx
    pediatric/page.tsx
    neuro-ophthalmology/page.tsx
    oculoplasty/page.tsx
    low-vision/page.tsx
  diagnostic/                   ← NEW (Advanced Imaging)
    iol-inventory/page.tsx
    fundus-imaging/page.tsx
    retinopathy-screening/page.tsx
    biometry/page.tsx
    oct-imaging/page.tsx
    electrophysiology
    cornea/page.tsx
    glaucoma/page.tsx
    cataract/page.tsx
    pediatric/page.tsx
    neuro-ophthalmology/page.tsx
    oculoplasty/page.tsx
    low-vision/page.tsx
  diagnostic/                   ← NEW
    iol-inventory/page.tsx
    fundus-imaging/page.tsx
    retinopathy-screening/page.tsx
    biometry/page.tsx
    oct-imaging/page.tsx
    electrophysiology/page.tsx
    optical-services/page.tsx
  operations/                   ← NEW
    ot-management/page.tsx
    cssd/page.tsx
    eye-camps/page.tsx
    ambulance/page.tsx
    stores-iEye Examination',  // ← NEW - CORE SUITE (Visible to ALL doctors + optometrists)
    icon: Eye, 
    permission: 'CLINICAL:EXAMINATION:VIEW',
    items: [
      { name: 'Visual Acuity', href: '/dashboard/examination/visual-acuity', permission: 'CLINICAL:EXAMINATION:VIEW' },
      { name: 'Retinoscopy', href: '/dashboard/examination/retinoscopy', permission: 'CLINICAL:EXAMINATION:VIEW' },
      { name: 'Refraction', href: '/dashboard/examination/refraction', permission: 'CLINICAL:EXAMINATION:VIEW' },
      { name: 'Auto-Refraction', href: '/dashboard/examination/auto-refraction', permission: 'CLINICAL:EXAMINATION:VIEW' },
      { name: 'Keratometry', href: '/dashboard/examination/keratometry', permission: 'CLINICAL:EXAMINATION:VIEW' },
      { name: 'Pachymetry', href: '/dashboard/examination/pachymetry', permission: 'CLINICAL:EXAMINATION:VIEW' },
      { name: 'Tonometry (IOP)', href: '/dashboard/examination/tonometry', permission: 'CLINICAL:EXAMINATION:VIEW' },
      { name: 'Color Vision', href: '/dashboard/examination/color-vision', permission: 'CLINICAL:EXAMINATION:VIEW' },
      { name: 'Contrast Sensitivity', href: '/dashboard/examination/contrast-sensitivity', permission: 'CLINICAL:EXAMINATION:VIEW' },
      { name: 'Visual Field Screening', href: '/dashboard/examination/visual-field-screening', permission: 'CLINICAL:EXAMINATION:VIEW' },
      { name: 'Spectacle Dispensing', href: '/dashboard/examination/spectacle-dispensing', permission: 'CLINICAL:OPTICAL:VIEW' },
      { name: 'Contact Lens Services', href: '/dashboard/examination/contact-lens', permission: 'CLINICAL:OPTICAL:VIEW' }
    ]
  },
  { 
    title: 'Clinical Departments',  // ← NEW - SPECIALTY MODULES
    genetic-counseling/page.tsx
    prosthetics/page.tsx
    social-services/page.tsx
  advanced/                     ← NEW
    tele-ophthalmology/page.tsx
  
    infection-control/page.tsx
    quality-accreditation/page.tsx
    diet-nutrition/page.tsx
    clinical-photography/page.tsx
```

### Sidebar Navigation Update
**Current**: Only Admin section  
**Required**: Add Clinical, Diagnostic, Operations, Advanced sections

```tsx
// apps/hospital-portal-web/src/components/Sidebar.tsx
const navigationSections = [
  { 
    title: 'Admin Management', 
    icon: Settings, 
    permission: 'ADMIN:SYSTEM:VIEW',
    items: [...existing 24 items...]
  },
  { 
    title: 'Clinical Departments',  // ← NEW
    icon: Stethoscope, 
    permission: 'CLINICAL:ANY:VIEW',
    items: [
      { name: 'Retina', href: '/dashboard/clinical/retina', permission: 'CLINICAL:RETINA:VIEW' },
      { name: 'Cornea', href: '/dashboard/clinical/cornea', permission: 'CLINICAL:CORNEA:VIEW' },
      { name: 'Glaucoma', href: '/dashboard/clinical/glaucoma', permission: 'CLINICAL:GLAUCOMA:VIEW' },
      { name: 'Cataract Surgery', href: '/dashboard/clinical/cataract', permission: 'CLINICAL:SURGERY:VIEW' },
      { name: 'Pediatric', href: '/dashboard/clinical/pediatric', permission: 'CLINICAL:PEDIATRIC:VIEW' },
      { name: 'Neuro-Ophthalmology', href: '/dashboard/clinical/neuro-ophthalmology', permission: 'CLINICAL:NEURO:VIEW' },
      { name: 'Oculoplasty', href: '/dashboard/clinical/oculoplasty', permission: 'CLINICAL:OCULOPLASTY:VIEW' },
      { name: 'Low Vision', href: '/dashboard/clinical/low-vision', permission: 'CLINICAL:LOW_VISION:VIEW' }
    ]
  },
  { 
    title: 'Diagnostic Services',  // ← NEW
    icon: Microscope, 
    permission: 'DIAGNOSTIC:ANY:VIEW',
    items: [
      { name: 'IOL Inventory', href: '/dashboard/diagnostic/iol-inventory', permission: 'CLINICAL:IOL:VIEW' },
      { name: 'Fundus Imaging', href: '/dashboard/diagnostic/fundus-imaging', permission: 'DIAGNOSTIC:FUNDUS:VIEW' },
      { name: 'Retinopathy Screening', href: '/dashboard/diagnostic/retinopathy-screening', permission: 'DIAGNOSTIC:RETINOPATHY:VIEW' },
      { name: 'Biometry & IOL Calc', href: '/dashboard/diagnostic/biometry', permission: 'DIAGNOSTIC:BIOMETRY:VIEW' },
      { name: 'OCT Imaging', href: '/dashboard/diagnostic/oct-imaging', permission: 'DIAGNOSTIC:OCT:VIEW' },
      { name: 'Electrophysiology Lab', href: '/dashboard/diagnostic/electrophysiology', permission: 'DIAGNOSTIC:ELECTROPHYSIOLOGY:VIEW' },
      { name: 'Optical Services', href: '/dashboard/diagnostic/optical-services', permission: 'CLINICAL:OPTICAL:VIEW' }
    ]
  },
  { 
    title: 'Operations',  // ← NEW
    icon: Wrench, 
    permission: 'OPERATIONS:ANY:VIEW',
    items: [
      { name: 'OT Management', href: '/dashboard/operations/ot-management', permission: 'OPERATIONS:OT:VIEW' },
      { name: 'CSSD', href: '/dashboard/operations/cssd', permission: 'OPERATIONS:CSSD:VIEW' },
      { name: 'Eye Camps', href: '/dashboard/operations/eye-camps', permission: 'HOSPITAL_OPS:EYE_CAMP:VIEW' },
      { name: 'Ambulance Services', href: '/dashboard/operations/ambulance', permission: 'HOSPITAL_OPS:AMBULANCE:VIEW' },
      { name: 'Stores & Inventory', href: '/dashboard/operations/stores-inventory', permission: 'OPERATIONS:INVENTORY:VIEW' },
      { name: 'Genetic Counseling', href: '/dashboard/operations/genetic-counseling', permission: 'CLINICAL:GENETIC:VIEW' },
      { name: 'Ocular Prosthetics', href: '/dashboard/operations/prosthetics', permission: 'CLINICAL:PROSTHETICS:VIEW' },
      { name: 'Social Services', href: '/dashboard/operations/social-services', permission: 'HOSPITAL_OPS:SOCIAL:VIEW' }
    ]
  },
  { 
    title: 'Advanced Services',  // ← NEW
    icon: Zap, 
    permission: 'ADVANCED:ANY:VIEW',
    items: [
      { name: 'Tele-Ophthalmology', href: '/dashboard/advanced/tele-ophthalmology', permission: 'ADVANCED:TELE_OPHTH:VIEW' },
      { name: 'Medical Coding', href: '/dashboard/advanced/medical-coding', permission: 'ADMIN:MEDICAL_CODING:VIEW' },
      { name: 'Infection Control', href: '/dashboard/advanced/infection-control', permission: 'ADMIN:INFECTION_CONTROL:VIEW' },
      { name: 'Quality & Accreditation', href: '/dashboard/advanced/quality-accreditation', permission: 'ADMIN:QUALITY:VIEW' },
      { name: 'Diet & Nutrition', href: '/dashboard/advanced/diet-nutrition', permission: 'CLINICAL:DIET:VIEW' },
      { name: 'Clinical Photography', href: '/dashboard/advanced/clinical-photography', permission: 'DIAGNOSTIC:PHOTOGRAPHY:VIEW' }
    ]
  }
];
```

---

## 8. Testing & Validation Plan

### Unit Testing (Per Module)
```bash
# Test components in isolation
npm run test -- apps/hospital-portal-web/src/components/clinical/retina/FundusViewer.test.tsx
npm run test -- apps/hospital-portal-web/src/components/diagnostic/IOLCalculator.test.tsx
```

### Integration Testing (Per Phase)
```bash
# Phase 1: Clinical Departments
npm run test:integration -- retina-department-workflow
npm run test:integration -- glaucoma-iop-tracking
npm run test:integration -- cataract-iol-calculation

# Phase 2: Diagnostic Services
npm run test:integration -- fundus-to-retina-dashboard
npm run test:integration -- biometry-to-cataract-surgery
npm run test:integration -- oct-to-glaucoma-tracking

# Phase 3: Operations
npm run test:integration -- ot-scheduling-workflow
npm run test:integration -- eye-camp-patient-flow
npm run test:integration -- ambulance-dispatch

# Phase 4: Advanced Services
npm run test:integration -- tele-ophth-consultation
npm run test:integration -- nabh-compliance-audit
```

### Permission Testing
```typescript
// Test permission enforcement for each new module
describe('Retina Department Permissions', () => {
  it('should allow RETINA_SPECIALIST to view fundus images', async () => {
    const user = { permissions: ['CLINICAL:RETINA:VIEW'] };
    // Test...
  });

  it('should block unauthorized users from scheduling anti-VEGF', async () => {
    const user = { permissions: ['CLINICAL:RETINA:VIEW'] }; // Missing SCHEDULE permission
    // Test rejection...
  });
});
```

### Role-Based Workflow Testing
```
✅ Test all 102 roles have access to assigned modules
✅ Test cross-department access (e.g., RETINA_SPECIALIST accessing Fundus Imaging)
✅ Test permission overrides (hospital-level customization)
✅ Test department-specific workflows (OPD vs. Surgery vs. Camp)
```

---

## 9. Deployment Strategy

### Development Environment
```bash
# Start FE development server
cd apps/hospital-portal-web
pnpm dev  # localhost:3000

# Backend already running on localhost:5073
# Database: Azure PostgreSQL 17.6 (already seeded)
```

### Staging Environment (Phase-wise)
```
Phase 1 → Staging 1: Clinical modules only
Phase 2 → Staging 2: Clinical + Diagnostic
Phase 3 → Staging 3: Clinical + Diagnostic + Operations
Phase 4 → Staging 4: Full stack (all modules)
```

### Production Rollout
```5: Soft launch (pilot hospital - 50 users) - Focus: Core Suite testing by OPTOMETRIST, GENERAL_OPHTHALMOLOGIST
Week 16: Limited rollout (3 hospitals - 500 users) - Focus: Specialty modules testing by RETINA_SPECIALIST, GLAUCOMA_SPECIALIST, CATARACT_SURGEON
Week 17: Full production (all tenants - 15,000+ users) - All modules live
Week 15: Full production (all tenants - 15,000+ users)
```

---

## 10. Timeline & Resource Allocation
70+ (12 Core + 8 Specialty + 6 Diagnostic + 7 Operational + 6 Advanced)
- **Total Components**: 100+ new components (25 core + 75 specialty/diagnostic/operational)
- **Total Effort**: 58 FE developer-weeks (10+18+12+10+8 = ~14 weeks with + 6 Phase 4)
- **Total Components**: 80+ new components
- **Total Effort**: 45 FE developer-weeks (~3 months with 3-4 developers)

### Team Structure (Recommended)
```
Team Lead (1 FE Architect)
├─ Clinical Team (2 FE Developers) → Phase 1 & 2
├─ Operations Team (1 FE Developer) → Phase 3
└─ Advanced Team (1 FE Developer) → Phase 4

Backend Support: 1 .NET Developer (API adjustments if needed)
QA: 2 QA Engineers (parallel testing)
UX/UI Designer: 1 Designer (clinical workflow UX)
```

### Milestones
| Milestone | Date | Deliverables |
|----0** | Week 2 | **CRITICAL**: Core Examination Suite complete (12 modules) - ALL doctors can now perform basic eye exams |
| **M1** | Week 5 | Phase 1B complete (8 clinical department dashboards + specialty modules) |
| **M2** | Week 8 | Phase 2 complete (6 diagnostic modules + integration with Core Suite) |
| **M3** | Week 11 | Phase 3 complete (7 operational modules + eye camp workflows) |
| **M4** | Week 14 | Phase 4 complete (6 advanced modules + tele-ophthalmology) |
| **M5** | Week 15 | Staging testing & bug fixes |
| **M6** | Week 17 | Staging testing & bug fixes |
| **M6** | Week 15 | Production deployment & monitoring |

---

## 11. Success Metrics

### Coverage Metrics
- **Role Coverage**: 100% (all 102 roles have dedicated workflows)
- **Department Coverage**: 100% (all 182 department types supported)
- **Permission Coverage**: 100% (all 145 permissions enforced in FE)

### User Adoption Metrics (Post-Launch)
- **Clinical Staff Login Rate**: >85% within first month
- **Module Usage**: Each clinical module used by >70% of assigned roles
- **Diagnostic Module Integration**: >90% of fundus images linked to retina dashboard
- **OT Scheduling Adoption**: >80% of cataract surgeries pre-booked via OT module
- **Eye Camp Coordination**: 100% of camps tracked in system (replace Excel)

### Performance Metrics
- **Page Load Time**: <2 seconds for clinical dashboards
- **Image Load Time**: Fundus photos <3 seconds, OCT scans <5 seconds
- **API Response Time**: <500ms for GET requests, <1s for POST
- **Concurrent Users**: Support 500+ simultaneous users (peak OPD hours)

### Quality Metrics
- **Bug Density**: <2 critical bugs per module
- **Permission Accuracy**: 0 unauthorized access incidents
- **HIPAA Compliance**: 100% PHI access logged (PHIAccessTracker integration)
- **Data Integrity**: 0 data loss incidents in clinical workflows

---

## 12. Risk Assessment & Mitigation

### High Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Clinical workflow mismatch (e.g., IOL calculator formula not matching hospital practice) | High | Medium | Pre-development consultation with ophthalmologists, configurable formulas |
| Fundus/OCT image viewer performance issues (large DICOM files) | High | Medium | Lazy loading, thumbnail previews, CDN for image storage |
| Complex permission matrix causing unauthorized access | Critical | Low | Automated permission tests, manual security audit per phase |
| Eye camp module not adopted (staff prefer Excel) | Medium | Medium | User training, mobile-friendly UI for camp coordinators |
| 102 roles overwhelming sidebar navigation | Medium | High | Collapsible sections with search, role-based menu filtering |

### Medium Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| IOL inventory sync issues (manual stock updates lag) | Medium | Medium | Barcode scanning integration, real-time alerts |
| OT schedule conflicts (double-booking surgeries) | Medium | Low | Conflict detection algorithm, admin approval for overrides |
| Tele-ophthalmology bandwidth issues in rural areas | Medium | High | Offline mode with sync, low-resolution image upload option |

---

## 13. Next Steps (Immediate Actions)

### Week 1 Kickoff
1. ✅ **Review this plan** with stakeholders (Hospital Admin, Chief Ophthalmologist, IT Head)
2. ✅ **Assign FE team** (2-4 developers)
3. ✅ **Conduct clinical workflow workshops** (Retina, Cornea, Glaucoma specialists) to validate UI mockups
4. 🔨 **Create UI mockups** for Phase 1 modules (Figma/Sketch)
5. 🔨 **Set up development environment** (ensure backend APIs accessible)
6. 🔨 **Start Phase 1 development** (Retina + Cornea dashboards)

### Developer Onboarding Checklist
- [ ] Clone repository: `git clone <repo-url>`
- [ ] Install dependencies: `pnpm install`
- [ ] Start backend: `cd microservices/auth-service/AuthService && dotnet run`
- [ ] Start frontend: `cd apps/hospital-portal-web && pnpm dev`
- [ ] Review existing components: `src/components/admin/`, `src/components/ui/`
- [ ] Review permission system: `src/hooks/use-permissions.ts`, `src/components/ProtectedRoute.tsx`
- [ ] Test API connectivity: `http://localhost:5073/swagger`
- [ ] Test database connection: `psql -h hospitalportal-db-server.postgres.database.azure.com -U postgres -d hospitalportal`

### Clinical Workflow Validation Sessions (Required)
| Session | Participants | Agenda | Duration |
|---------|--------------|--------|----------|
| **Retina Workflow** | Retina Specialist, Fundus Photographer, Retinopathy Screener | Review fundus viewer, DR grading UI, anti-VEGF scheduler | 2 hours |
| **Cataract Surgery** | Cataract Surgeon, Biometry Technician, OT Coordinator, IOL Coordinator | Review IOL calculator, biometry integration, OT scheduler | 2 hours |
| **Glaucoma Workflow** | Glaucoma Specialist, Optometrist, Imaging Technician | Review IOP tracking, visual field analysis, OCT integration | 1.5 hours |
| **Eye Camp Coordination** | Eye Camp Coordinator, Outreach Coordinator, Social Worker | Review camp planning calendar, screening workflow, transportation | 2 hours |
| **OT Management** | OT Manager, OT Coordinator, CSSD Supervisor, Anesthesiologist | Review surgery scheduler, equipment tracking, sterilization logs | 2 hours |

---

## 14. Appendices

### A. Complete Role List (102 Roles)
See `MASTER_DATA_COMPLETE_SEED.sql` for full list. Summary:
- **Clinical (43)**: Ophthalmologists (10 specialties), Nurses (5 types), Allied Health (12 roles)
- **Administrative (20)**: Hospital Admin, HR, Finance, Compliance, Security
- **Diagnostic (12)**: Lab, Imaging, Screening, Biometry, Electrophysiology
- **Operations (15)**: OT, Pharmacy, CSSD, Stores, Ambulance, Eye Camps
- **Support (12)**: IT, Training, Facilities, Housekeeping, Legal

### B. Complete 70+ clinical/operational modules missing)
- **Impact**: 65% of roles (67 out of 102) have <10% FE support
- **CRITICAL ABSENCE #1**: **Core Examination Suite (12 optometry modules)** - ALL doctors need this but it's 0% implemented
- **CRITICAL ABSENCE #2
SELECT permission_code, permission_name, module FROM permission ORDER BY module, permission_code;
```4 weeks (10+18+12+10+8 = 58 developer-weeks)
2. **CORE-FIRST STRATEGY**: Start with 12 core examination modules (Weeks 1-2) that ALL 43 clinical roles need
3. **Then Specialty-Specific**: Build specialty modules (Retina, Cornea, Glaucoma, Cataract) on top of core (Weeks 3-5)
4. **Parallel Development**: 2 FE developers on core suite, 2 on specialty modules, then shift to diagnostic/operations
5. **Continuous Testing**: Per-phase integration tests, permission audits, clinical validation sessions
6. **Pilot Launch**: Week 15 soft launch with 50 users (focus: OPTOMETRIST, GENERAL_OPHTHALMOLOGIST testing core suite)

### Expected Outcome (Week 17)
- ✅ **100% Role Coverage**: All 102 roles have dedicated FE workflows
- ✅ **100% Department Coverage**: All 182 department types supported
- ✅ **100% Permission Enforcement**: All 145 permissions integrated
- ✅ **Core Examination Suite**: All doctors can perform visual acuity, refraction, IOP, keratometry, pachymetry, color vision, contrast sensitivity, visual field screening, spectacle dispensing, contact lens fitting
- ✅ **Eye Hospital-Specific Workflows**: Retina, Cornea, Glaucoma, Cataract (all integrated with Core Suite), IOL, OT, Eye Camps, Tele-ophthalmology
- ✅ **User Adoption**: >85% clinical staff actively using core +
- **Total Endpoints**: 162 (all operational)
- **Key API Groups**:
  - `/api/clinical/*` - Clinical data (examinations, diagnoses, prescriptions)
  - `/api/diagnostic/*` - Imaging, lab tests, screening
  - `/api/operations/*` - OT, inventory, pharmacy, ambulance
  - `/api/admin/*` - Users, roles, permissions, departments, branches

### E. Database Schema Reference
- **Tables**: 96 (all seeded)
- **Key Clinical Tables**:
  - `clinical_examination` - Eye exam records
  - `clinical_diagnosis` - Diagnoses (ICD-10 codes)
  - `clinical_prescription` - Medications (eye drops, systemic)
  - `surgery` - Surgery records (cataract, retina, glaucoma)
  - `iol_inventory` - IOL stock management
  - `fundus_image` - Fundus photography archive
  - `oct_scan` - OCT imaging records
  - `visual_field_test` - Perimetry results

### F. Industry Compliance References
- **NABH Standards**: Quality indicators, patient safety, infection control
- **HIPAA**: PHI access tracking, audit logs, soft deletes
- **WHO Eye Care Guidelines**: Diabetic retinopathy screening, cataract surgical rate benchmarks
- **NPCB (National Programme for Control of Blindness)**: Eye camp reporting, outreach targets

---

## 15. Conclusion

### Summary
- **Current FE Coverage**: 40% (Admin-heavy)
- **Gap**: 60% (60+ clinical/operational modules missing)
- **Impact**: 65% of roles (67 out of 102) have <10% FE support
- **Critical Absence**: Eye hospital specialty workflows (retina, cornea, glaucoma, cataract, IOL, OT, eye camps)

### Recommended Approach
1. **Phased Implementation**: 4 phases over 12 weeks (15+12+10+8 = 45 developer-weeks)
2. **Clinical-First**: Start with Retina, Cornea, Glaucoma, Cataract (highest user count)
3. **Parallel Development**: 2 FE developers on clinical modules, 1 on operations, 1 on advanced
4. **Continuous Testing**: Per-phase integration tests, permission audits, clinical validation sessions
5. **Pilot Launch**: Week 13 soft launch with 50 users before full rollout

### Expected Outcome (Week 15)
- ✅ **100% Role Coverage**: All 102 roles have dedicated FE workflows
- ✅ **100% Department Coverage**: All 182 department types supported
- ✅ **100% Permission Enforcement**: All 145 permissions integrated
- ✅ **Eye Hospital-Specific Workflows**: Retina, Cornea, Glaucoma, Cataract, IOL, OT, Eye Camps, Tele-ophthalmology
- ✅ **User Adoption**: >85% clinical staff actively using specialty modules
- ✅ **Operational Efficiency**: Eye camps tracked digitally (no Excel), OT schedules centralized, IOL inventory real-time

---

**Document Version**: 1.0  
**Last Updated**: January 25, 2026  
**Next Review**: After Phase 1 completion (Week 3)

---

**Approval Required From**:
- [ ] Hospital Administrator
- [ ] Chief Ophthalmologist
- [ ] IT Head
- [ ] FE Development Lead
- [ ] Clinical Department Heads (Retina, Cornea, Glaucoma, Cataract)
