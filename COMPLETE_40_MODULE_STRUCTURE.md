# Hospital Portal - Complete 40-Module Structure & Workflows

**Date**: January 31, 2026  
**Approach**: Hybrid (27-30 main modules with minimal grouping)  
**Target**: Comprehensive eye hospital management system

---

## 📊 Module Overview

**Total Modules**: 40 main modules  
**Implementation Status**:
- ✅ **Implemented** (Backend + Frontend complete)
- 🟡 **Partial** (Backend exists, Frontend incomplete)
- ❌ **Missing** (Not implemented)

---

## 🏠 Module 0: Dashboard (Central Hub)

**Status**: ✅ Implemented  
**Role Access**: All roles (customized widgets per role)

### **Features**:
- **Today's Summary**
  - Total OPD patients (today)
  - Total IPD patients (admitted)
  - Pending surgeries (today)
  - Revenue summary (OPD + IPD + Pharmacy + Optical)
  - Critical alerts (emergency cases, expired medications, equipment due for maintenance)

- **Quick Actions** (Role-based)
  - Front Desk: Quick Registration, Check-In Patient, Print Token
  - Doctor: View My Queue, Start Consultation, View Surgery Schedule
  - Billing: Generate Invoice, Receive Payment, View Outstanding Bills
  - Pharmacy: Dispense Medicine, Check Stock Alerts
  - Admin: User Management, Generate Reports

- **Real-Time Widgets**
  - OPD Queue Status (waiting, in-consultation, completed)
  - OT Schedule Today (upcoming surgeries with surgeon, patient, time)
  - Bed Occupancy (total beds, occupied, available, under maintenance)
  - Critical Inventory Alerts (medicines expiring in 7 days, low stock items)
  - Recent Alerts & Notifications

- **Analytics at a Glance**
  - Patient flow trends (week/month)
  - Revenue trends (week/month)
  - Department-wise patient distribution
  - Top 10 procedures (this month)

---

## 👨‍⚕️ Module 1: Doctor Desk (Senior Doctors)

**Status**: 🟡 Partial (Basic examination exists, advanced features missing)  
**Role Access**: Senior Doctors, Consultants, Specialists

### **Complete Workflow**:

#### **1. Patient Queue View**
- **My Queue Today**
  - List of patients assigned to doctor (OPD + IPD + Follow-up)
  - Token number, patient name, MRN, appointment type, waiting time
  - Priority indicator (normal, urgent, emergency)
  - Previous visit summary (one-click access)
  
- **Queue Actions**
  - Call Next Patient (updates patient status to "In Consultation")
  - Skip Patient (moves to end of queue with reason)
  - Mark Absent (patient didn't show up)
  - Transfer to Another Doctor (with reason)

#### **2. Patient Medical Summary (Auto-loaded)**
- **Patient Demographics** (name, age, gender, contact, MRN)
- **Visit History** (last 5 visits with dates, diagnoses, prescriptions)
- **Chronic Conditions** (diabetes, hypertension, allergies)
- **Current Medications** (ongoing prescriptions)
- **Previous Surgical History** (eye surgeries, general surgeries)
- **Allergies & Alerts** (drug allergies, special precautions)

#### **3. Chief Complaint & History**
- **Chief Complaint** (free text + voice-to-text)
- **History of Present Illness** (HPI)
- **Past Ocular History** (previous eye conditions, treatments)
- **Family History** (hereditary eye conditions)
- **Systemic History** (diabetes, hypertension, other conditions)

#### **4. Examination Findings**
- **General Examination**
  - Vital signs (BP, pulse, temperature, SpO2) - auto-populated from optometrist
  - Height, weight, BMI
  
- **Ophthalmology Examination** (Auto-populated from Optometrist)
  - Visual Acuity (distance, near) - OD/OS
  - Refraction (objective, subjective) - OD/OS
  - IOP (tonometry) - OD/OS
  - Anterior Segment (slit lamp findings)
  - Posterior Segment (fundus findings)
  - Color Vision, Contrast Sensitivity
  
- **Doctor's Clinical Examination**
  - Detailed anterior segment examination
  - Detailed posterior segment examination
  - Gonioscopy findings
  - Additional tests ordered (if needed)

#### **5. Imaging & Diagnostics Review**
- **View Reports** (integrated viewer)
  - OCT scans (with measurements, annotations)
  - Fundus photos (with AI-assisted findings)
  - Visual field reports
  - Corneal topography
  - Ultrasound (A-scan, B-scan)
  - Lab reports (blood tests, ECG)
  
- **Order New Tests**
  - Select test type (OCT, Fundus, VF, Lab tests)
  - Priority (routine, urgent, stat)
  - Clinical indication (reason for test)

#### **6. Diagnosis & Treatment Plan**
- **Provisional Diagnosis** (ICD-10 coded)
- **Final Diagnosis** (ICD-10 coded, multiple diagnoses supported)
- **Treatment Plan**
  - Medical management (prescriptions)
  - Surgical management (surgery recommendation)
  - Conservative management (observation, lifestyle changes)
  
- **Plan**
  - Medications (e-prescription)
  - Surgery recommendation (if applicable) → triggers Counselor workflow
  - Follow-up date (auto-schedule appointment)
  - Patient education (handouts, videos)

#### **7. E-Prescription**
- **Medicine Selection**
  - Drug name (auto-complete from formulary)
  - Dosage (strength, form)
  - Frequency (OD, BD, TDS, QID, custom)
  - Duration (days, weeks, months)
  - Route (oral, topical, IV)
  - Instructions (before/after food, warnings)
  
- **Eye Drops Prescription** (Specialized)
  - OD/OS/OU selection
  - Frequency per eye
  - Tapering schedule (if steroid)
  
- **Prescription Actions**
  - Print Prescription
  - Send to Pharmacy (electronic)
  - Send to Patient (SMS/Email/WhatsApp)
  - Save as Template (for recurring conditions)

#### **8. Surgery Recommendation**
- **Surgery Details**
  - Procedure name (CPT coded)
  - Eye (OD/OS/OU)
  - Urgency (elective, urgent, emergency)
  - Preferred date range
  - Special requirements (IOL type, anesthesia preference)
  
- **Auto-trigger Counselor Workflow**
  - Patient automatically added to Counselor queue
  - Doctor's notes shared with Counselor
  - Surgery details pre-filled in Counselor module

#### **9. Referrals & Consultations**
- **Internal Referral** (to another specialist)
  - Select specialist (retina, glaucoma, cornea, etc.)
  - Reason for referral
  - Urgency
  
- **External Referral** (to other hospital/specialist)
  - Referral letter generation
  - Patient summary export

#### **10. Documentation & Sign-off**
- **Clinical Notes** (auto-saved draft every 30 seconds)
- **Voice Notes** (optional voice recording)
- **Attachments** (upload clinical photos, documents)
- **Digital Signature** (e-sign to finalize consultation)
- **Print Summary** (patient copy)

#### **11. Follow-up Management**
- **Schedule Follow-up**
  - Date selection (specific date or after X weeks)
  - Auto-book appointment slot
  - Send reminder to patient (SMS/Email)
  
- **Mark for Review**
  - Flag patient for specific review (post-op day 1, post-injection follow-up)
  - Set reminder for doctor

#### **12. Junior Doctor Review** (If applicable)
- **View Junior Doctor's Notes**
  - Chief complaint, examination, provisional diagnosis by junior doctor
  
- **Review & Approve**
  - Confirm diagnosis
  - Modify treatment plan (if needed)
  - Add senior doctor notes
  - Digital signature (senior approval)

### **Integration Points**:
- ← **From Optometrist**: Visual acuity, refraction, IOP, preliminary findings
- ← **From Scan/Imaging**: OCT, fundus, VF reports
- ← **From Diagnostics Lab**: Blood tests, ECG, pre-op clearance
- → **To Counselor**: Surgery recommendation, treatment plan
- → **To Pharmacy**: E-prescription
- → **To Billing**: Consultation fee (auto-posted)
- → **To Medical Records**: Complete consultation note

---

## 👓 Module 2: Optometrist Examination

**Status**: 🟡 Partial (Basic refraction exists, advanced features missing)  
**Role Access**: Optometrists, Optometry Technicians

### **Complete Workflow**:

#### **1. Patient Queue**
- **Optometry Queue**
  - Patients from OPD check-in (token-based)
  - Walk-ins for refraction only
  - Post-op patients for vision check
  
- **Call Next Patient** (updates queue status)

#### **2. Patient Identification**
- **Scan Token** OR **Enter MRN** OR **Search by Name**
- **Verify Patient** (name, age, photo)
- **Previous Refraction History** (auto-displayed)

#### **3. Visual Acuity Testing**
- **Distance Vision** (6 meters / 20 feet)
  - OD (right eye): Unaided, Pinhole, Best Corrected
  - OS (left eye): Unaided, Pinhole, Best Corrected
  - OU (both eyes)
  - Chart type (Snellen, LogMAR, E-chart for illiterate)
  
- **Near Vision** (40 cm / 16 inches)
  - OD, OS, OU
  - Chart type (N-notation, Jaeger)

#### **4. Retinoscopy (Objective Refraction)**
- **OD (Right Eye)**
  - Sphere, Cylinder, Axis
  - Working distance correction
  
- **OS (Left Eye)**
  - Sphere, Cylinder, Axis
  
- **Findings** (media clarity, red reflex quality)

#### **5. Auto-Refractometry** (If available)
- **Import from Auto-Refractor**
  - OD: Sphere, Cylinder, Axis
  - OS: Sphere, Cylinder, Axis
  - PD (Pupillary Distance)
  
- **Manual Entry** (if auto-refractor not available)

#### **6. Subjective Refraction (Manual)**
- **OD Refraction**
  - Starting point (from retinoscopy/auto-refraction)
  - Sphere refinement (JCC/duochrome)
  - Cylinder refinement (JCC)
  - Axis refinement
  - Final acceptance (visual acuity check)
  
- **OS Refraction** (same steps)
  
- **Binocular Balancing** (OU refinement)

#### **7. Keratometry**
- **OD (Right Eye)**
  - K1 (flattest meridian): Power, Axis
  - K2 (steepest meridian): Power, Axis
  - Average K
  
- **OS (Left Eye)** (same parameters)

#### **8. Pachymetry (Corneal Thickness)**
- **OD**: Central corneal thickness (CCT) in microns
- **OS**: Central corneal thickness (CCT) in microns
- **IOP Correction** (if needed based on CCT)

#### **9. Tonometry (IOP Measurement)**
- **OD**: Intraocular pressure (mmHg)
- **OS**: Intraocular pressure (mmHg)
- **Method**: NCT (Non-Contact), Goldmann, Icare
- **Time of Measurement** (important for glaucoma cases)

#### **10. Color Vision Testing**
- **Ishihara Test**
  - Plates shown: X/38
  - Result: Normal / Red-Green deficiency / Total color blindness
  
- **D-15 Test** (if abnormal Ishihara)

#### **11. Contrast Sensitivity**
- **Pelli-Robson Chart** OR **CSV-1000**
- **Result**: Log units / Normal-Abnormal

#### **12. Visual Field Screening**
- **Confrontation Test** (basic screening)
- **Amsler Grid** (for macular diseases)
- **Flag for Formal Perimetry** (if abnormal)

#### **13. Spectacle Prescription Recommendation**
- **Distance Glasses**
  - OD: Sphere, Cylinder, Axis
  - OS: Sphere, Cylinder, Axis
  - PD (Pupillary Distance)
  
- **Reading Glasses** (if needed)
  - Near Add power
  
- **Bifocal/Progressive** (if needed)
  - Distance + Near prescription

#### **14. Contact Lens Trial** (If applicable)
- **Trial Lens Selection**
  - OD: Power, Base Curve, Diameter
  - OS: Power, Base Curve, Diameter
  
- **Over-Refraction** (fine-tuning)
- **Fit Assessment** (movement, centration, comfort)
- **Final CL Prescription**

#### **15. Patient Education**
- **Spectacle Recommendation**
  - When to wear (full-time, distance only, reading only)
  - Lens type (single vision, bifocal, progressive)
  - Coating (anti-reflective, photochromic, blue-cut)
  
- **Send to Optical Shop** (if patient wants to purchase)

#### **16. Referral to Doctor**
- **Complete Optometry Report**
  - All findings documented
  - Alerts flagged (high IOP, significant refractive error, abnormal findings)
  
- **Send to Doctor Queue**
  - Patient added to doctor's queue with complete optometry data
  - Doctor receives notification

### **Integration Points**:
- ← **From Front Desk/OPD**: Patient check-in, token
- → **To Doctor Desk**: Complete refraction data, alerts
- → **To Optical Shop**: Spectacle prescription
- → **To Scan/Imaging**: Referral for detailed tests (if abnormal findings)

---

## 🗣️ Module 3: Counselor Management

**Status**: ❌ Missing (Not implemented)  
**Role Access**: Patient Counselors, Financial Counselors

### **Complete Workflow**:

#### **1. Counselor Queue**
- **Surgery Referrals** (from Doctor Desk)
  - Auto-populated when doctor recommends surgery
  - Patient name, MRN, procedure, eye, urgency
  
- **Direct Walk-ins**
  - Patients seeking information about procedures
  - Package pricing inquiries
  
- **Follow-up Counseling**
  - Post-op guidance sessions
  - Treatment plan discussions

#### **2. Patient Clinical Summary**
- **Auto-loaded from Doctor's Notes**
  - Diagnosis (ICD-10)
  - Recommended procedure (CPT)
  - Eye (OD/OS/OU)
  - Urgency level
  - Special requirements (IOL type, etc.)

#### **3. Treatment Plan Discussion**
- **Clinical Counseling**
  - Explain diagnosis in patient-friendly language
  - Treatment options (medical vs surgical)
  - Procedure details (steps, duration, anesthesia)
  - Expected outcomes
  - Risks & complications
  - Alternative treatments
  
- **Pre-Operative Guidance**
  - Pre-op instructions (fasting, medication adjustments)
  - Pre-op tests required (blood tests, ECG, physician clearance)
  - Admission process
  - Day of surgery timeline
  
- **Post-Operative Guidance**
  - Recovery timeline
  - Activity restrictions
  - Medication schedule
  - Follow-up appointments
  - Warning signs to watch for

#### **4. Package & Pricing Discussion**
- **Financial Counseling**
  - **Package Selection**
    - Standard Package: Procedure + basic IOL + 1 night stay
    - Premium Package: Procedure + premium IOL + 2 nights stay
    - Deluxe Package: Procedure + toric/multifocal IOL + private room
    
  - **Itemized Breakdown**
    - Surgeon fee
    - Anesthesia fee
    - OT charges
    - IOL cost (with options)
    - Room charges
    - Pre-op tests
    - Post-op medications
    - Follow-up visits (included or extra)
    
  - **Total Cost Estimate**
    - Base package price
    - Optional add-ons
    - Total estimated cost
    - Tax breakdown

#### **5. Payment Options**
- **Payment Plans**
  - Full payment (discount applicable)
  - Installments (3/6/12 months)
  - EMI options (credit card, loan)
  - Advance payment requirement
  
- **Insurance Coverage**
  - Check insurance eligibility
  - Estimated insurance coverage
  - Patient's out-of-pocket estimate
  - Pre-authorization required? (Yes/No)

#### **6. Insurance Pre-Authorization Initiation**
- **Collect Patient Documents**
  - Insurance card (photo/scan)
  - Policy number
  - TPA details (if applicable)
  - Employee ID (if corporate insurance)
  - Photo ID proof
  
- **Collect Clinical Documents**
  - Doctor's prescription/surgery recommendation
  - Diagnosis reports
  - Recent investigations (OCT, fundus photos, blood tests)
  - Previous treatment records (if available)
  
- **Fill Pre-Auth Form**
  - Patient details
  - Insurance details
  - Procedure details (CPT code, eye, urgency)
  - Estimated cost
  - Proposed surgery date
  - Hospital details
  
- **Submit to Insurance Management**
  - Create pre-auth request in system
  - Upload all documents
  - Assign to Insurance team
  - Track status (pending, approved, rejected)
  
- **Patient Notification**
  - Pre-auth submitted (acknowledgment)
  - Expected timeline for approval
  - Next steps

#### **7. Surgery Availability Check**
- **Check Surgeon Availability**
  - Surgeon's OT schedule
  - Preferred dates (from patient)
  - Available slots (next 7/14/30 days)
  
- **Check OT Availability**
  - OT booking calendar
  - Proposed date/time
  - OT room allocation
  
- **Check IOL Availability**
  - IOL type required (monofocal, toric, multifocal)
  - Current stock
  - Order if not in stock
  - Expected arrival date
  
- **Check Anesthesiologist Availability**
  - Anesthesia type required (local, general)
  - Anesthesiologist schedule
  
- **Check Nursing Staff Availability**
  - OT nurses
  - Ward nurses (if admission required)
  
- **Tentative Surgery Date**
  - Propose 2-3 date options to patient
  - Get patient preference
  - Block tentative slot (pending confirmation)

#### **8. Consent Management**
- **Surgery Consent Form**
  - Explain procedure risks
  - Patient/guardian signature
  - Witness signature
  - Digital consent (e-sign supported)
  
- **Anesthesia Consent Form**
  - Anesthesia risks explained
  - Patient signature
  
- **Blood Transfusion Consent** (if applicable)
  
- **Photography/Video Consent** (for academic/research purposes)

#### **9. Pre-Surgery Preparation Checklist**
- **Patient Instructions Given**
  - [ ] Pre-op fasting instructions
  - [ ] Medication adjustment (stop blood thinners, continue BP meds)
  - [ ] Pre-op tests list provided
  - [ ] Admission time informed
  - [ ] Bring attendant (mandatory)
  - [ ] Post-op care instructions (handout given)
  
- **Documents Collected**
  - [ ] Insurance documents
  - [ ] Photo ID
  - [ ] Previous medical records
  - [ ] Consent forms signed
  
- **Financial Clearance**
  - [ ] Advance payment collected (if required)
  - [ ] Insurance pre-auth approved (if applicable)
  - [ ] Payment plan confirmed

#### **10. Counseling Session Recording**
- **Session Notes**
  - Counselor name
  - Session date & time
  - Duration
  - Topics discussed (checkboxes)
  - Patient questions & answers
  - Decisions made
  - Follow-up actions
  
- **Audio/Video Recording** (optional, with consent)
  - Record counseling session
  - Store securely
  - Playback for quality review

#### **11. Package Booking**
- **Confirm Surgery Booking**
  - Surgery date confirmed
  - Surgeon confirmed
  - OT slot confirmed
  - Package confirmed
  - Total cost confirmed
  
- **Generate Booking Receipt**
  - Booking confirmation number
  - Surgery details
  - Financial summary
  - Pre-op instructions
  - Contact information for queries
  
- **Send Notifications**
  - SMS to patient (booking confirmation)
  - Email to patient (detailed PDF)
  - WhatsApp message (if opted in)
  
- **Update OT Schedule**
  - Block OT slot
  - Assign surgeon, anesthesiologist
  - Reserve IOL from inventory
  - Allocate bed (if IPD required)

#### **12. Follow-up Scheduling**
- **Schedule Pre-Op Visit** (if needed)
  - Date (usually 1-2 days before surgery)
  - Purpose (final checks, clearances)
  
- **Schedule Admission** (if IPD required)
  - Admission date & time
  - Ward allocation
  
- **Schedule Post-Op Follow-ups**
  - Day 1 post-op
  - Week 1 post-op
  - Month 1 post-op

### **Integration Points**:
- ← **From Doctor Desk**: Surgery recommendation, clinical notes
- → **To Insurance Management**: Pre-auth request, documents
- → **To OT Management**: Surgery booking, slot reservation
- → **To Pharmacy**: IOL reservation, pre-op medication list
- → **To Billing**: Package booking, advance payment
- → **To IPD**: Bed reservation (if required)
- → **To Patient**: SMS/Email/WhatsApp notifications

---

## 🏥 Module 4: Front Office/OPD Management

**Status**: ✅ Implemented (Days 1-10 OPD workflow complete)  
**Role Access**: Front Desk Staff, Receptionists

### **Complete Workflow**:

#### **1. Patient Registration** (New Patient)
- **Capture Patient Details**
  - First name, Last name, Middle name
  - Date of birth / Age
  - Gender (Male, Female, Other)
  - Mobile number (primary, secondary)
  - Email address
  - Photo (webcam capture or upload)
  
- **Address Details**
  - Current address
  - Permanent address
  - City, State, PIN code
  
- **Identity Proof**
  - ID type (Aadhaar, PAN, Passport, Driving License)
  - ID number
  - Upload scanned copy
  
- **Emergency Contact**
  - Name, Relationship
  - Mobile number
  
- **Insurance Details** (optional)
  - Insurance provider
  - Policy number
  - TPA details
  - Corporate name (if applicable)
  
- **Auto-generate MRN** (Medical Record Number)
  - Format: Branch code + Sequential number
  - Unique per tenant
  - Printed on registration slip
  
- **Print Registration Card**
  - MRN barcode/QR code
  - Patient photo
  - Basic details

#### **2. Appointment Scheduling**
- **Search Existing Patient** OR **New Registration**
  
- **Select Appointment Type**
  - New Consultation
  - Follow-up
  - Post-operative review
  - Refraction only
  - Specific procedure (laser, injection)
  
- **Select Doctor/Specialty**
  - List of doctors with specialties
  - Doctor availability calendar
  - Preferred doctor (if patient has preference)
  
- **Select Date & Time Slot**
  - View available slots (Day 9 implementation: real-time slot availability)
  - Slot duration (15/30/45 min based on appointment type)
  - Check conflicts (Day 9: conflict detection)
  
- **Walk-In Booking** (Day 9 implementation)
  - Simplified booking for walk-ins
  - Urgent priority option
  - Patient waiting in reception
  
- **Confirm Appointment**
  - Appointment number generated
  - Send confirmation (SMS/Email)
  - Add to calendar (patient's email calendar)
  
- **Print Appointment Slip**
  - Appointment number, date, time
  - Doctor name
  - Reporting instructions

#### **3. Check-In Process** (Day 1-2 implementation)
- **Scan Patient** (MRN card / Mobile number / Search)
  
- **Verify Appointment** OR **Walk-In Check-In**
  
- **Collect Basic Information**
  - Chief complaint (reason for visit)
  - Referring doctor (if any)
  - Update contact details (if changed)
  
- **Hard Gate Validation** (Day 2-3 implementation)
  - Insurance verification (if applicable)
  - Previous outstanding bills (if any)
  - Emergency override option (with reason logging)
  
- **Generate Token** (Day 6 implementation)
  - Sequential token number (daily reset)
  - Token format: Branch-Date-Sequence (e.g., BLR-20260131-045)
  - QR code generation
  - Print token slip (thermal printer support)
  - Display on TV screen in waiting area
  
- **Route Patient**
  - Optometry first (if new patient or refraction needed)
  - Direct to doctor (if follow-up or emergency)
  - Assign to specific queue

#### **4. Queue Management Display**
- **Waiting Area TV Display**
  - Current token being served
  - Next 5 tokens
  - Doctor name, room number
  - Estimated wait time
  
- **Reception Dashboard**
  - Real-time queue status
  - Waiting patients count
  - Average wait time
  - Patients in consultation
  - Completed consultations

#### **5. Patient Flow Monitoring**
- **Track Patient Status**
  - Checked In → Waiting
  - In Optometry → Waiting for Doctor
  - In Consultation
  - Consultation Complete → Billing
  - Billing Complete → Exit
  
- **Update Status Manually** (if needed)
  - Mark patient as called
  - Mark patient as absent
  - Transfer to another queue

#### **6. Reception Services**
- **Handle Inquiries**
  - Doctor availability
  - Appointment availability
  - Procedure pricing (general information)
  - Department locations
  
- **Phone Management**
  - Incoming calls (appointment booking, inquiries)
  - Call transfer to departments
  - Call logs
  
- **Visitor Management**
  - IPD patient visitors
  - Vendor/supplier visits
  - Issue visitor passes
  
- **Document Handover**
  - Receive reports from labs/imaging
  - Hand over to patients
  - Track document delivery

#### **7. Surgery Availability Check** (as per user requirement)
- **Quick Check** (for counselor support)
  - Surgeon schedule
  - OT availability
  - Tentative dates
  - Inform patient/counselor

#### **8. Reports & Analytics**
- **Daily OPD Report**
  - Total registrations (new + returning)
  - Total check-ins
  - Doctor-wise patient count
  - Department-wise distribution
  - Peak hours analysis
  
- **Appointment Reports**
  - Booked appointments
  - Kept appointments
  - No-shows
  - Cancellations

### **Integration Points**:
- → **To Optometry Queue**: Route patient after check-in
- → **To Doctor Queue**: Route patient (if direct consultation)
- → **To Billing**: Consultation fee, registration fee
- → **To Medical Records**: New patient registration
- ← **From Appointments**: Scheduled appointments for the day

---

## 🔬 Module 5: Scan/Imaging

**Status**: 🟡 Partial (Ophthalmology imaging exists, general imaging missing)  
**Role Access**: Imaging Technicians, Radiographers

### **Complete Workflow**:

#### **A. OPHTHALMOLOGY IMAGING**

##### **1. Fundus Photography**
- **Patient Preparation**
  - Pupil dilation (if required)
  - Wait time (15-20 minutes)
  - Patient positioning
  
- **Image Capture**
  - OD (Right eye): Color fundus, Red-free, Autofluorescence
  - OS (Left eye): Same protocols
  - Multiple fields (if wide-field imaging)
  
- **Image Quality Check**
  - Focus, clarity, illumination
  - Retake if poor quality
  
- **Annotation & Findings**
  - Mark pathology (hemorrhages, exudates, drusen)
  - Preliminary findings (by technician)
  - AI-assisted analysis (if available)
  
- **Report Generation**
  - Images with annotations
  - Technical notes
  - Send to doctor for interpretation

##### **2. OCT Imaging (Optical Coherence Tomography)**
- **Scan Selection**
  - Macular OCT (standard, wide-field)
  - Optic disc OCT
  - RNFL (Retinal Nerve Fiber Layer)
  - Anterior segment OCT
  
- **Scan Acquisition**
  - OD scans
  - OS scans
  - Ensure good signal strength (>6/10)
  
- **Measurements**
  - Central macular thickness (CMT)
  - Retinal layers segmentation
  - RNFL thickness (quadrants, clock hours)
  - Optic disc parameters (area, volume, C/D ratio)
  
- **Report Generation**
  - B-scans with annotations
  - Thickness maps (color-coded)
  - Comparison with normative database
  - Progression analysis (if previous scans available)

##### **3. Corneal Topography**
- **Scan Acquisition**
  - OD: Anterior surface, Posterior surface
  - OS: Anterior surface, Posterior surface
  
- **Measurements**
  - Keratometry (K1, K2, average K)
  - Astigmatism (magnitude, axis)
  - Corneal aberrations
  - Pachymetry map
  
- **Analysis**
  - Normal vs Abnormal pattern
  - Keratoconus screening
  - Refractive surgery suitability

##### **4. Visual Field / Perimetry**
- **Test Selection**
  - Threshold test (24-2, 30-2, 10-2)
  - Screening test
  - Glaucoma progression analysis
  
- **Patient Instruction**
  - Fixation importance
  - Response button usage
  - Test duration (~5-8 min per eye)
  
- **Test Execution**
  - OD test
  - OS test
  - Reliability indices (fixation losses, false positives, false negatives)
  
- **Report Generation**
  - Grayscale, pattern deviation, total deviation
  - Indices (MD, PSD, VFI)
  - Comparison with previous tests

##### **5. Biometry (IOL Calculation)**
- **Measurements**
  - Axial length (OD, OS)
  - Keratometry (K1, K2)
  - Anterior chamber depth
  - Lens thickness (if available)
  - White-to-white diameter
  
- **IOL Power Calculation**
  - Formula selection (SRK/T, Haigis, Barrett, Kane)
  - Target refraction (emmetropia, -1.0D, etc.)
  - Recommended IOL powers (primary, backup)
  
- **Report**
  - IOL power recommendations
  - Expected post-op refraction
  - Send to surgeon

##### **6. Electrophysiology (ERG, VEP)**
- **Test Selection**
  - ERG (full-field, multifocal)
  - VEP (pattern, flash)
  
- **Patient Preparation**
  - Skin cleaning, electrode placement
  - Pupil dilation (for ERG)
  
- **Test Execution**
  - Stimulus presentation
  - Waveform recording
  
- **Analysis**
  - Amplitude, latency measurements
  - Comparison with normative data
  - Interpretation

##### **7. Ultrasound (A-Scan, B-Scan)**
- **A-Scan (Axial Length)**
  - OD, OS measurements
  - IOL power calculation (if biometry not available)
  
- **B-Scan (Ocular Ultrasound)**
  - Indications (media opacity, retinal detachment, intraocular mass)
  - OD, OS imaging
  - Findings documentation

##### **8. Diabetic Retinopathy Screening**
- **Automated Screening**
  - Fundus photo capture
  - AI-based analysis
  - Grading (no DR, mild, moderate, severe, PDR)
  
- **Report**
  - Screening result
  - Referral recommendation (if DR detected)

#### **B. GENERAL IMAGING (NEW - Currently Missing)**

##### **9. X-Ray**
- **Exam Types**
  - Chest X-ray (pre-op clearance)
  - PNS X-ray (paranasal sinuses)
  - Orbit X-ray
  
- **Patient Preparation**
  - Remove metal objects
  - Positioning
  
- **Image Acquisition**
  - Appropriate views (AP, lateral, etc.)
  
- **Report**
  - Radiologist interpretation
  - Send to referring doctor

##### **10. Ultrasound (General)**
- **Exam Types**
  - Abdomen ultrasound
  - Thyroid ultrasound
  - Carotid Doppler (for vascular assessment)
  
- **Image Acquisition & Report**

##### **11. CT Scan**
- **Indications**
  - Orbit CT (trauma, tumors, orbital fractures)
  - Brain CT (neurological symptoms)
  
- **Protocol**
  - Plain vs Contrast
  - Slice thickness
  
- **Report**
  - Radiologist interpretation
  - 3D reconstruction (if needed)

##### **12. MRI**
- **Indications**
  - Brain MRI (optic neuritis, neuro-ophthalmology cases)
  - Orbit MRI (soft tissue imaging)
  
- **Protocol**
  - T1, T2, FLAIR sequences
  - Contrast enhancement (if indicated)
  
- **Report**
  - Radiologist interpretation
  - Send to referring doctor

#### **C. WORKFLOW COMMON TO ALL IMAGING**

##### **Order Verification**
- Receive order from doctor/optometrist
- Verify patient identity (MRN, name, DOB)
- Check order details (test type, eye, clinical indication)

##### **Patient Preparation**
- Explain procedure
- Obtain consent (if invasive)
- Check contraindications (pregnancy for X-ray, metal implants for MRI)

##### **Image Acquisition**
- Follow standard protocols
- Ensure quality standards
- Retake if poor quality

##### **Quality Control**
- Check image quality before patient leaves
- Archive images in PACS
- Ensure DICOM compliance

##### **Reporting**
- Technician preliminary findings (where applicable)
- Send to radiologist/ophthalmologist for interpretation
- Final report generation
- Send report to referring doctor
- Notify patient when ready

##### **Image Archival**
- Store in PACS (Picture Archiving and Communication System)
- Backup to cloud/server
- Retention as per regulations (minimum 5 years)

### **Integration Points**:
- ← **From Doctor/Optometrist**: Test orders
- → **To Doctor Desk**: Reports, images
- → **To Medical Records**: Archive images and reports
- → **To Billing**: Imaging charges

---

## ⚕️ Module 6: Operation Theatre / Ward Management

**Status**: 🟡 Partial (Basic OT schedule exists, ward management missing)  
**Role Access**: OT Staff, Nurses, Anesthesiologists, Surgeons

### **Complete Workflow**:

#### **A. PRE-OPERATIVE PHASE**

##### **1. Surgery Booking (from Counselor)**
- **Receive Booking**
  - Patient details, MRN
  - Procedure (CPT code)
  - Surgeon, Anesthesiologist
  - Proposed date/time
  - Special requirements (IOL type, equipment)
  
- **OT Schedule Management**
  - View OT calendar
  - Available OT rooms
  - Available time slots
  - Assign OT room
  - Confirm booking
  
- **Resource Allocation**
  - Surgeon (availability confirmed)
  - Anesthesiologist (assign from roster)
  - OT nurses (assign primary + assistant)
  - Equipment (phaco machine, microscope, etc.)
  - IOL reservation (ensure in stock)

##### **2. Pre-Op Checklist (1-2 days before surgery)**
- **Patient Assessment**
  - Pre-op visit scheduled
  - Vitals checked (BP, pulse, temperature, SpO2)
  - Physician clearance (if required)
  - Anesthesia evaluation
  
- **Investigations**
  - Blood tests (CBC, Blood sugar, RFT if diabetic)
  - ECG (if >50 years or cardiac history)
  - Chest X-ray (if indicated)
  - COVID test (as per protocol)
  - All reports uploaded
  
- **Medications**
  - Review current medications
  - Stop blood thinners (as per protocol)
  - Continue BP/diabetes medications
  - Pre-op eye drops started (if applicable)
  
- **Consent Verification**
  - Surgery consent signed
  - Anesthesia consent signed
  - IOL consent signed (if cataract surgery)
  - Photography consent (if applicable)
  
- **Fasting Instructions**
  - NBM (Nothing by mouth) from midnight (or 6 hours for clear liquids)
  - Medication instructions (which to take, which to skip)
  
- **Admission (if IPD)**
  - Admit patient to ward
  - Assign bed
  - Pre-op preparations start

##### **3. Day of Surgery Preparation**
- **Patient Arrival**
  - Admission (if day-care/OPD surgery)
  - Verify patient identity (MRN, name, DOB, wristband)
  - Verify surgery details (eye, procedure)
  
- **Pre-Op Area Preparation**
  - Patient changes into OT gown
  - Remove jewelry, contact lenses, dentures
  - Vital signs recorded
  - IV line insertion (if general anesthesia)
  
- **Pre-Op Medications**
  - Anxiolytics (if needed)
  - Antibiotic prophylaxis
  - Eye drops (mydriatic, anesthetic)
  
- **Surgical Site Marking**
  - Surgeon marks the eye to be operated (OD/OS)
  - Patient confirms
  
- **Time-Out / WHO Checklist**
  - Patient identity verified by team
  - Surgical site confirmed (which eye)
  - Procedure confirmed
  - Consent verified
  - Anesthesia plan confirmed
  - Equipment checked
  - Team introductions

#### **B. INTRA-OPERATIVE PHASE**

##### **4. OT Setup**
- **Sterility Preparation**
  - OT room cleaned, disinfected
  - Sterile drapes prepared
  - Instruments sterilized (CSSD)
  
- **Equipment Setup**
  - Phaco machine (for cataract surgery)
  - Microscope (focus, alignment)
  - Laser (if needed)
  - Monitors, vitals equipment
  - Emergency drugs, equipment ready
  
- **IOL & Supplies**
  - Correct IOL power verified
  - IOL opened (sterile technique)
  - Viscoelastic, BSS, medications ready

##### **5. Anesthesia Administration**
- **Anesthesia Type**
  - Local (topical, peribulbar, retrobulbar)
  - General (if needed)
  
- **Monitoring**
  - Vitals (BP, pulse, SpO2, ECG)
  - Continuous monitoring during surgery
  
- **Anesthesia Record**
  - Drugs administered
  - Dosages, time
  - Vitals charting

##### **6. Surgical Procedure**
- **Surgeon Scrubbing & Gowning**
- **Patient Draping** (sterile field)
  
- **Procedure Steps** (documented in real-time)
  - Incisions made
  - Key steps (phacoemulsification, IOL implantation, etc.)
  - Intra-operative findings
  - Complications (if any)
  - IOL details (power, type, position)
  
- **Intra-Op Notes** (by surgeon or assistant)
  - Step-by-step documentation
  - Time stamps
  - Instruments used
  - Medications given (intra-cameral antibiotics, etc.)

##### **7. Surgery Completion**
- **Wound Closure**
- **Eye Dressing/Shield Application**
- **Final Check**
  - Instrument count (ensure nothing left inside)
  - Swab count (match with initial count)
  - Equipment check
  
- **Patient Handover to Recovery**
  - Transfer to recovery area
  - Vitals stable
  - Anesthesia reversal (if general)

#### **C. POST-OPERATIVE PHASE**

##### **8. Recovery Room**
- **Post-Op Monitoring**
  - Vitals every 15 min for 1 hour
  - Pain assessment
  - Nausea/vomiting
  - Alertness level
  
- **Post-Op Medications**
  - Pain relief (if needed)
  - Anti-emetics (if nausea)
  - Eye drops (antibiotic, steroid)
  
- **Discharge Criteria (Day-Care Surgery)**
  - Vitals stable
  - Able to walk
  - No active bleeding
  - Pain controlled
  - Attendant available

##### **9. Ward Management (if IPD Admission)**
- **Bed Allocation**
  - General ward / Semi-private / Private room
  - Bed number assigned
  - Transfer from OT to ward
  
- **Ward Nursing Care**
  - Vitals monitoring (4-6 hourly)
  - Eye dressing check
  - Medications (IV, oral, eye drops)
  - Food & hydration
  - Mobility assistance
  
- **Doctor Rounds**
  - Post-op day 1 review
  - Vision check
  - IOP check (if applicable)
  - Dressing change
  - Continue/modify medications
  
- **Patient Education**
  - Eye drop schedule
  - Activity restrictions
  - Warning signs
  - Follow-up appointments

##### **10. Discharge Planning**
- **Discharge Criteria**
  - Medically stable
  - Vision satisfactory (or as expected)
  - Pain controlled
  - Patient understands post-op instructions
  - Follow-up scheduled
  
- **Discharge Summary**
  - Admission date, discharge date
  - Diagnosis
  - Procedure performed
  - Surgeon, anesthesiologist
  - IOL details (if applicable)
  - Post-op course
  - Medications prescribed
  - Follow-up appointments
  - Discharge instructions
  
- **Discharge Medications**
  - Eye drops (antibiotic, steroid, lubricant)
  - Oral medications (pain relief, antibiotic if needed)
  - Prescription printed
  - Sent to pharmacy (if in-house)
  
- **Discharge Process**
  - Billing clearance (ensure all bills paid)
  - Collect discharge summary
  - Medication collection
  - Final instructions given
  - Discharge completed in system

#### **D. OT MANAGEMENT & ADMINISTRATION**

##### **11. OT Schedule Dashboard**
- **Daily Schedule View**
  - All surgeries for the day
  - OT room, surgeon, procedure, patient
  - Scheduled time vs actual time
  - Status (upcoming, in-progress, completed)
  
- **Weekly/Monthly View**
  - Surgeon-wise schedule
  - OT utilization rate
  - Cancellations, rescheduling

##### **12. OT Utilization**
- **Real-Time Status**
  - OT 1: In Use (Cataract surgery, Dr. X, 10:00-10:45 AM)
  - OT 2: Cleaning (Next surgery at 11:00 AM)
  - OT 3: Available
  
- **Turnover Time Tracking**
  - Time between surgeries
  - Cleaning time
  - Setup time

##### **13. Equipment Management**
- **Equipment Availability**
  - Phaco machines (available/in-use/under maintenance)
  - Microscopes, lasers, vitrectomy machines
  
- **Maintenance Scheduling**
  - Preventive maintenance
  - Calibration
  - Service contracts

##### **14. CSSD (Central Sterile Supply Department)**
- **Instrument Sterilization**
  - Receive dirty instruments from OT
  - Cleaning, decontamination
  - Sterilization (autoclave, ETO)
  - Packing, labeling
  - Sterile stock management
  
- **Instrument Tracking**
  - Instrument sets (cataract set, vitrectomy set)
  - Check-in/check-out
  - Sterilization indicators
  - Expiry tracking (sterile packs valid for 30 days)

##### **15. OT Reports & Analytics**
- **Surgery Statistics**
  - Total surgeries (daily, weekly, monthly)
  - Procedure-wise breakdown
  - Surgeon-wise breakdown
  
- **OT Efficiency**
  - OT utilization rate
  - Average surgery duration
  - Turnover time
  - Cancellation rate, reasons
  
- **Complication Tracking**
  - Intra-operative complications
  - Post-operative complications
  - Infection rates (SSI - Surgical Site Infection)

### **Integration Points**:
- ← **From Counselor**: Surgery bookings
- ← **From Diagnostics Lab**: Pre-op test reports
- ← **From Pharmacy**: IOL, medications, surgical supplies
- → **To IPD Ward**: Patient admission, bed allocation
- → **To Billing**: Surgery charges, OT charges, IOL charges
- → **To Medical Records**: Operative notes, discharge summary
- → **To Doctor Desk**: Post-op follow-up scheduling

---

## 👨‍⚕️ Module 7: Junior Doctor

**Status**: ❌ Missing (Role exists, but dedicated module missing)  
**Role Access**: Resident Doctors, Medical Interns, Doctors in Training

### **Complete Workflow**:

#### **1. Junior Doctor Queue**
- **Assigned Patients**
  - OPD patients (new, follow-up)
  - IPD patients (ward rounds)
  - Emergency cases (first assessment)
  
- **Queue Management**
  - Same as Doctor Desk (Module 1)
  - Call next patient

#### **2. Patient Consultation** (Similar to Doctor Desk)
- **All features from Module 1** (Doctor Desk) available
  - Patient history
  - Examination
  - Diagnosis
  - Treatment plan
  - E-prescription
  
- **Differences from Senior Doctor**:
  - **Provisional Diagnosis Only**
    - Cannot finalize diagnosis without senior approval
    - Mark as "Pending Senior Review"
  
  - **Limited Prescription Authority**
    - Can prescribe basic medications
    - Cannot prescribe controlled substances without approval
    - Cannot prescribe expensive medications without approval
  
  - **Cannot Recommend Surgery Independently**
    - Can suggest surgery need
    - Senior doctor must confirm
  
  - **Cannot Sign Discharge Summaries**
    - Can draft discharge summary
    - Senior doctor must review and sign

#### **3. Senior Doctor Review Workflow**
- **Submit for Review**
  - After completing consultation, junior doctor clicks "Submit for Senior Review"
  - Patient added to senior doctor's review queue
  - All junior doctor's notes visible to senior
  
- **Senior Doctor Approval**
  - Senior doctor reviews case
  - Options:
    - **Approve**: Confirms diagnosis, treatment plan (auto-signed)
    - **Modify**: Changes diagnosis or treatment, adds notes
    - **Reject**: Sends back to junior doctor with feedback
  
- **Feedback Loop**
  - If rejected, junior doctor receives notification
  - Revise and resubmit
  - Learning opportunity

#### **4. Training & Learning Features**
- **Case Log**
  - All cases seen by junior doctor
  - Diagnoses made
  - Procedures observed/assisted
  - Senior feedback received
  
- **Learning Modules**
  - Access to clinical guidelines
  - Standard treatment protocols
  - Common diagnoses flowcharts
  
- **Performance Tracking**
  - Cases reviewed by senior
  - Approval rate
  - Common mistakes/feedback themes
  - Improvement over time

#### **5. Ward Rounds (IPD)**
- **Morning Rounds**
  - Visit all assigned IPD patients
  - Check vitals, progress
  - Update treatment plan
  - Present cases to senior during rounds
  
- **Progress Notes**
  - Daily progress note for each patient
  - Subjective, Objective, Assessment, Plan (SOAP format)
  - Senior doctor co-signs

#### **6. Emergency First Response**
- **Initial Assessment**
  - Triage emergency patients
  - Vital signs, quick examination
  - Stabilize patient
  - Call senior doctor for severe cases
  
- **Emergency Log**
  - All emergency cases handled
  - Time of arrival, initial findings
  - Actions taken, senior notified

### **Integration Points**:
- ← **Same as Doctor Desk** (Module 1)
- → **To Senior Doctor**: Cases for review, approval
- ← **From Senior Doctor**: Feedback, approvals

---

## 💊 Module 8: Pharmacy Management

**Status**: 🟡 Partial (Basic pharmacy exists, advanced features missing)  
**Role Access**: Pharmacists, Pharmacy Assistants

### **Complete Workflow**:

#### **A. PRESCRIPTION DISPENSING**

##### **1. Receive Prescription**
- **Electronic Prescription** (from Doctor Desk)
  - Automatically appears in pharmacy queue
  - Patient name, MRN, doctor name
  - Medication list with dosages
  
- **Paper Prescription** (external or old patients)
  - Scan/upload prescription
  - Manual entry (if needed)

##### **2. Prescription Verification**
- **Pharmacist Review**
  - Check drug-drug interactions
  - Check drug-allergy alerts
  - Verify dosages (age-appropriate, indication-appropriate)
  - Check contraindications
  
- **Clarification** (if needed)
  - Call doctor for illegible handwriting
  - Confirm dosage if unusual
  - Suggest alternatives (if drug out of stock)

##### **3. Medication Dispensing**
- **Check Stock Availability**
  - Search drug in inventory
  - Check available quantity
  - Check expiry date (FEFO - First Expiry First Out)
  
- **If Out of Stock**:
  - Check alternative brands (same generic)
  - Check alternative strengths (can split/combine)
  - Inform patient (partial dispensing or wait for stock)
  - Generate purchase requisition (auto-order)
  
- **Pick Medication**
  - Retrieve from shelf
  - Verify drug name, strength, expiry
  - Count/measure quantity
  
- **Labeling**
  - Patient name, MRN
  - Drug name, strength
  - Dosage instructions
  - Frequency
  - Duration
  - Warnings (take with food, avoid sunlight, etc.)
  - Expiry date
  - Pharmacist name
  
- **Patient Counseling**
  - Explain how to take each medication
  - Side effects to watch for
  - Storage instructions (refrigeration, protect from light)
  - Importance of compliance
  - Answer patient questions

##### **4. Special Handling**

###### **Eye Drops Dispensing**
- **Special Instructions**
  - Which eye (OD/OS/OU)
  - Number of drops per application
  - Interval between different drops (5 minutes)
  - Tapering schedule (for steroids)
  
- **Patient Education**
  - How to instill eye drops
  - Storage (some need refrigeration)
  - Shake well before use (suspensions)
  - Discard after 1 month of opening

###### **Controlled Substances**
- **Narcotic Register**
  - Document dispensing
  - Patient ID, doctor name, quantity
  - Signature
  
- **Restricted Dispensing**
  - Maximum quantity per prescription
  - Require original prescription (no photocopy)

###### **Refrigerated Medications**
- **Cold Chain Maintenance**
  - Store at 2-8°C
  - Temperature monitoring
  - Provide ice pack if patient travels long distance

##### **5. Billing & Payment**
- **Generate Bill**
  - Itemized list (each drug with price)
  - Quantity dispensed
  - Total amount
  - Tax breakdown
  
- **Payment Collection**
  - Cash, Card, UPI, Insurance
  - Issue receipt
  
- **Insurance Claims**
  - If insurance coverage, submit claim
  - Patient pays co-pay (if applicable)

##### **6. Record Keeping**
- **Update Inventory**
  - Deduct dispensed quantity from stock
  - Update stock level
  - Trigger reorder if below minimum stock
  
- **Dispensing Record**
  - Patient MRN
  - Prescription number
  - Drugs dispensed
  - Quantity, batch number, expiry date
  - Pharmacist name, date/time

#### **B. INVENTORY MANAGEMENT**

##### **7. Stock Management**
- **Current Stock View**
  - Drug name, generic name
  - Available quantity
  - Unit (tablets, bottles, vials)
  - Expiry date
  - Batch number
  - Location (shelf number)
  
- **Stock Levels**
  - Minimum stock level (reorder point)
  - Maximum stock level
  - Current stock
  - Stock status (adequate, low, critical, overstock)
  
- **Expiry Tracking**
  - Drugs expiring in 30/60/90 days
  - Alert system
  - Return to supplier (if possible)
  - Disposal (if expired)

##### **8. Purchase Management**
- **Purchase Requisition**
  - Generated automatically (when stock < minimum)
  - OR manual requisition (for new drugs)
  
- **Requisition Details**
  - Drug name, strength, form
  - Quantity required
  - Urgency (routine, urgent)
  - Preferred supplier
  
- **Send to Inventory Management Module** (Module 12)

##### **9. Goods Receipt**
- **Receive Stock** (from supplier)
  - Verify against purchase order
  - Check quantity, drug name, strength
  - Check batch number, expiry date
  - Check physical condition (no damage)
  
- **GRN (Goods Receipt Note)**
  - Document receipt
  - Supplier name, invoice number
  - Date of receipt
  - Items received (with batch, expiry)
  - Received by (pharmacist name)
  
- **Quality Check**
  - Visual inspection
  - Check for counterfeits (if suspicious)
  - Temperature-sensitive items (check cold chain maintained)
  
- **Update Inventory**
  - Add received quantity to stock
  - Update batch numbers, expiry dates
  - Label and store in appropriate location

##### **10. Stock Adjustment**
- **Reasons for Adjustment**
  - Expired drugs (write-off)
  - Damaged drugs (breakage, leakage)
  - Pilferage/theft
  - Return from wards (unused)
  
- **Adjustment Entry**
  - Drug name, batch, quantity
  - Reason for adjustment
  - Approved by (pharmacy manager)
  
- **Update Inventory**

##### **11. Stock Transfer**
- **Transfer to Other Locations**
  - Transfer to branch pharmacy
  - Transfer to IPD pharmacy
  - Transfer to OT pharmacy
  
- **Transfer Note**
  - From location, to location
  - Drug name, quantity
  - Date, authorized by

##### **12. IOL & Surgical Supplies Management**
- **IOL Inventory**
  - IOL type (monofocal, toric, multifocal)
  - Power range (-10 to +30D)
  - Manufacturer, model
  - Current stock by power
  - Expiry date
  
- **IOL Reservation** (from Counselor)
  - Reserve specific IOL for surgery
  - Hold stock until surgery date
  - Release if surgery canceled
  
- **IOL Dispensing to OT**
  - Issue IOL to OT (on surgery day)
  - Record IOL details (patient, surgeon, eye, power)
  - Implantation confirmation (from OT)
  - Unused IOL return (if not implanted)

#### **C. WARD/IPD PHARMACY**

##### **13. Ward Medication Orders**
- **Receive Orders**
  - From IPD doctors (electronic or paper)
  - Patient name, bed number, ward
  - Medication with dosages
  
- **Prepare Medication Carts**
  - Organize by patient
  - Label each medication
  - Send to ward (twice daily or as needed)
  
- **Medication Administration Record (MAR)**
  - Nurse confirms administration
  - Track compliance

##### **14. IV Admixture Preparation**
- **Prepare IV Medications**
  - Antibiotics, fluids
  - Sterile compounding
  
- **Label & Dispatch to Ward**

#### **D. REPORTING & ANALYTICS**

##### **15. Pharmacy Reports**
- **Sales Reports**
  - Daily, weekly, monthly sales
  - Revenue by drug category
  - Top 10 selling drugs
  
- **Inventory Reports**
  - Stock valuation
  - Expiry report (near-expiry, expired)
  - Slow-moving items
  - Out-of-stock items
  
- **Consumption Reports**
  - Drug utilization patterns
  - Doctor-wise prescription patterns
  - Generic vs branded prescribing
  
- **Financial Reports**
  - Revenue, cost, margin
  - Outstanding payments (insurance, credit)

### **Integration Points**:
- ← **From Doctor Desk**: E-prescriptions
- ← **From OT Management**: IOL requirements, surgical supply orders
- ← **From IPD**: Ward medication orders
- ← **From Inventory Management**: Purchase orders, stock receipts
- → **To Billing**: Medication charges
- → **To Inventory Management**: Stock requisitions

---

## 👓 Module 9: Optical Management

**Status**: 🟡 Partial (Basic optical exists, advanced features missing)  
**Role Access**: Optical Shop Staff, Opticians

### **Complete Workflow**:

#### **A. SPECTACLE SALES**

##### **1. Receive Prescription**
- **From Optometrist** (electronic)
  - Auto-populated prescription
  - Patient details
  
- **From Patient** (paper prescription)
  - External prescription
  - Manual entry

##### **2. Frame Selection**
- **Frame Catalog**
  - Display all available frames
  - Filter by: Brand, Material, Shape, Color, Size, Price range
  - Virtual try-on (if available)
  
- **Patient Assistance**
  - Suggest frames based on face shape
  - Suggest frames based on prescription (high power needs smaller frames)
  - Suggest frames based on budget
  
- **Frame Try-On**
  - Patient tries multiple frames
  - Check fit (bridge, temples, alignment)
  - Check aesthetics
  
- **Frame Selection Confirmation**
  - Selected frame details (brand, model, size, color, price)

##### **3. Lens Selection**
- **Lens Type**
  - Single Vision (distance OR reading)
  - Bifocal (distance + reading)
  - Progressive/Multifocal (seamless)
  
- **Lens Material**
  - Glass (heavy, scratch-resistant)
  - CR-39 Plastic (standard)
  - Polycarbonate (impact-resistant, lightweight)
  - High-Index (1.67, 1.74 for high power - thinner lenses)
  - Trivex (lightweight, impact-resistant)
  
- **Lens Coatings**
  - Anti-Reflective (AR) coating (reduces glare)
  - Scratch-Resistant coating
  - UV Protection
  - Blue-Light Filter (for digital device users)
  - Photochromic (transitions - darken in sunlight)
  - Polarized (for sunglasses - reduce glare)
  
- **Lens Tint** (optional)
  - Clear
  - Tinted (gradient, solid)
  - Sunglasses (dark tint + UV protection)

##### **4. Measurements**
- **PD (Pupillary Distance)**
  - Distance PD (for distance glasses)
  - Near PD (for reading glasses)
  - Monocular PD (OD, OS separately for progressive lenses)
  
- **Segment Height** (for bifocals/progressives)
  - Height of bifocal line / progressive corridor
  - Measured with patient wearing frame
  
- **Frame Measurements**
  - A (lens width)
  - B (lens height)
  - DBL (distance between lenses)
  - Temple length

##### **5. Quotation & Pricing**
- **Itemized Quote**
  - Frame: ₹X
  - Lenses (pair): ₹Y
  - Coatings: ₹Z
  - Total: ₹(X+Y+Z)
  - Tax
  - Grand Total
  
- **Discounts** (if applicable)
  - Insurance coverage
  - Corporate discount
  - Seasonal offers
  
- **Payment Options**
  - Full payment
  - Advance (50%) + Balance on delivery
  - EMI options

##### **6. Order Placement**
- **In-House Lab** (if available)
  - Send order to in-house lab
  - Lens cutting, edging, fitting
  - Estimated delivery: 1-2 days
  
- **External Lab**
  - Send prescription to external lab
  - Lens processing
  - Estimated delivery: 3-7 days
  
- **Order Confirmation**
  - Order number generated
  - Expected delivery date
  - Advance payment collected
  - Receipt issued

##### **7. Quality Check (on Delivery from Lab)**
- **Visual Inspection**
  - Check lens power (lensometer)
  - Check optical center alignment
  - Check lens coating (no bubbles, defects)
  - Check frame fit (lenses properly fitted in frame)
  
- **Verify Against Prescription**
  - OD power matches prescription
  - OS power matches prescription
  - PD, segment height correct
  
- **Reject if Defective**
  - Return to lab
  - Remake order

##### **8. Dispensing to Patient**
- **Notify Patient** (SMS/call when ready)
  
- **Final Fitting**
  - Patient tries on spectacles
  - Adjust temple, nose pads for comfort
  - Check vision (patient should see clearly)
  
- **Patient Education**
  - How to clean lenses (microfiber cloth, lens cleaner)
  - How to wear (avoid touching lenses)
  - Adjustment period (for new prescriptions, especially progressives)
  - When to wear (full-time, distance only, reading only)
  - Storage (hard case when not wearing)
  
- **Warranty**
  - Frame warranty (6 months / 1 year)
  - Lens warranty (scratch, coating defects)
  - Free adjustments for lifetime
  
- **Collect Balance Payment** (if advance paid earlier)
  
- **Issue Invoice & Warranty Card**

##### **9. After-Sales Service**
- **Adjustments**
  - Nose pads, temple adjustment
  - Alignment (if frames bent)
  - Free service
  
- **Repairs**
  - Broken frame (soldering, replacement)
  - Loose screws (tightening)
  - Nose pad replacement
  - May charge for parts
  
- **Lens Replacement**
  - Power change (new prescription)
  - Scratched lenses
  - Broken lenses
  - Charge for new lenses
  
- **Warranty Claims**
  - If within warranty period
  - Manufacturing defects
  - Free replacement

#### **B. CONTACT LENS SALES**

##### **10. Contact Lens Fitting** (First-time users)
- **Contact Lens Trial**
  - Trial lenses provided (various brands, base curves)
  - Patient wears for 15-30 minutes
  - Check fit (movement, centration, comfort)
  
- **Over-Refraction** (by optometrist)
  - Fine-tune power while wearing CL
  
- **Finalize CL Prescription**
  - OD: Power, Base Curve, Diameter, Brand
  - OS: Same parameters
  - Replacement schedule (daily, monthly, yearly)

##### **11. Contact Lens Dispensing**
- **Patient Education** (critical for first-time users)
  - How to insert CL (demonstration + patient practice)
  - How to remove CL
  - Cleaning & storage (solution, case)
  - Wearing schedule (8-10 hours/day max)
  - Do's and Don'ts (no swimming, no sleeping with CL unless extended wear)
  - Warning signs (redness, pain, discharge → stop use, see doctor)
  
- **Provide CL Care Kit**
  - Contact lens case
  - Multipurpose solution (travel size)
  - Instructions booklet
  
- **Follow-up**
  - Schedule review after 1 week
  - Check for complications

##### **12. Contact Lens Reorders**
- **Verify Prescription** (check if expired, usually 1 year validity)
  
- **Check Stock**
  - Order from supplier if not in stock
  
- **Dispense & Bill**

#### **C. SUNGLASSES & ACCESSORIES**

##### **13. Sunglasses Sales**
- **Prescription Sunglasses** (same process as spectacles, with dark tint + UV + polarized)
  
- **Non-Prescription Sunglasses**
  - Ready-made (no power)
  - UV protection
  - Polarized option
  - Fashion brands

##### **14. Accessories Sales**
- **Lens Cleaning Solutions**
- **Microfiber Cloths**
- **Spectacle Cases** (hard, soft, branded)
- **Lens Cleaning Spray**
- **Anti-Fog Wipes**
- **Sports Straps** (for active users)

#### **D. INVENTORY MANAGEMENT**

##### **15. Frame Inventory**
- **Stock Management**
  - Frame brand, model, size, color
  - Quantity in stock
  - Reorder level
  
- **Receive New Stock**
  - GRN (Goods Receipt Note)
  - Verify against invoice
  - Update inventory
  
- **Stock Valuation**

##### **16. Lens Inventory** (if in-house lab)
- **Lens Blanks** (uncut lenses)
  - Material (CR-39, polycarbonate, high-index)
  - Power range (stock lenses for common powers)
  - Coatings
  
- **Stock Management**

##### **17. Contact Lens Inventory**
- **Stock by Brand, Power, Base Curve**
- **Expiry Tracking**
- **Reorder Management**

#### **E. REPORTING & ANALYTICS**

##### **18. Optical Reports**
- **Sales Reports**
  - Daily, weekly, monthly revenue
  - Frame sales vs CL sales vs accessories
  - Top-selling brands
  
- **Inventory Reports**
  - Stock valuation
  - Slow-moving frames
  - Expiry report (contact lenses)
  
- **Customer Reports**
  - New customers vs repeat customers
  - Customer purchase history

### **Integration Points**:
- ← **From Optometrist**: Spectacle prescription, CL prescription
- → **To Billing**: Optical sales charges
- → **To Inventory Management**: Frame orders, lens orders, CL orders

---

## 🏥 Module 10: Insurance Management

**Status**: 🟡 Partial (Basic insurance exists, TPA integration missing)  
**Role Access**: Insurance Desk Staff, TPA Coordinators

### **Complete Workflow**:

#### **A. INSURANCE VERIFICATION**

##### **1. Patient Insurance Check** (at Check-In/Admission)
- **Collect Insurance Details**
  - Insurance company name
  - Policy number
  - TPA (Third Party Administrator) name
  - Employee ID (if corporate insurance)
  - Validity dates (policy start, end)
  - Insurance card (photo/scan)
  
- **Verify Eligibility**
  - Call TPA helpline OR use online portal
  - Verify active policy
  - Check coverage amount (sum insured, balance available)
  - Check co-payment percentage (if applicable)
  - Check exclusions (waiting periods, pre-existing conditions)
  
- **Eligibility Status**
  - **Eligible**: Proceed with treatment
  - **Not Eligible**: Patient pays out-of-pocket
  - **Partial Coverage**: Explain co-pay, exclusions

##### **2. Corporate Insurance Verification**
- **Corporate Tie-ups**
  - Verify employee belongs to corporate
  - Check coverage type (OPD covered? IPD covered? Surgery covered?)
  - Check annual limit
  - Check family coverage (if dependent)
  
- **Approval Matrix**
  - Some corporates require HR approval for high-value claims
  - Obtain approval before proceeding

#### **B. PRE-AUTHORIZATION (from Counselor)**

##### **3. Receive Pre-Auth Request** (from Counselor Module)
- **Pre-Auth Details**
  - Patient details (name, policy number, MRN)
  - Diagnosis (ICD-10 code)
  - Proposed procedure (CPT code)
  - Surgeon name
  - Proposed date of surgery
  - Estimated cost (itemized breakdown)
  - Clinical documents (doctor's prescription, investigation reports)

##### **4. Complete Pre-Auth Application**
- **Fill TPA Pre-Auth Form**
  - Patient details
  - Insurance details
  - Hospital details
  - Diagnosis & procedure details
  - Estimated cost (room rent, surgeon fee, OT charges, IOL, medications, investigations)
  - Supporting documents attached
  
- **Submit to TPA**
  - Upload to TPA portal OR email OR fax
  - Obtain acknowledgment number
  - Track submission
  
- **Missing Documents** (if TPA asks)
  - Contact patient/doctor for additional documents
  - Submit within deadline (usually 24-48 hours)

##### **5. Pre-Auth Approval/Rejection**
- **Approved**
  - Approval number received
  - Approved amount (may be less than estimated)
  - Validity period (usually 7-15 days)
  - Inform patient, counselor, OT team
  - Proceed with surgery scheduling
  
- **Rejected**
  - Rejection reason (waiting period, exclusion, insufficient documents)
  - Options:
    - Appeal (submit additional documents, justification)
    - Patient pays out-of-pocket
  - Inform patient, counselor
  
- **Query Raised**
  - TPA needs clarification (medical necessity, alternative treatment)
  - Coordinate with doctor for response
  - Resubmit

##### **6. Pre-Auth Enhancement** (if required)
- **If Actual Cost > Approved Amount**
  - During surgery, if additional procedures needed
  - Submit enhancement request to TPA
  - Provide justification
  - Wait for approval OR patient pays difference

#### **C. INSURANCE CLAIMS (Post-Treatment)**

##### **7. Claim Preparation** (OPD/IPD)
- **Collect Documents**
  - **Patient Documents**:
    - Insurance card (copy)
    - Photo ID proof (Aadhaar, PAN)
    - Policy document
  
  - **Clinical Documents**:
    - Discharge summary (for IPD)
    - Consultation notes (for OPD)
    - Investigation reports (blood tests, OCT, fundus photos, etc.)
    - Prescription
    - Operative notes (if surgery)
    - Anesthesia notes
    - IOL sticker (if cataract surgery)
  
  - **Financial Documents**:
    - Final bill (itemized)
    - Payment receipts
    - Pharmacy bills
    - Investigation bills (if separate)

##### **8. Fill Claim Form**
- **Claim Form Details**
  - Patient details
  - Insurance/policy details
  - Diagnosis (ICD-10)
  - Treatment/procedure (CPT)
  - Admission date, discharge date (for IPD)
  - Consultation date (for OPD)
  - Total bill amount
  - Amount claimed
  
- **Patient/Guardian Signature**
- **Hospital Stamp & Signature**

##### **9. Submit Claim**
- **Cashless Claims** (for IPD, with pre-auth)
  - Submit claim to TPA within 7 days of discharge
  - TPA processes and pays hospital directly
  - Patient pays only co-pay + non-covered items
  
- **Reimbursement Claims** (for OPD or non-empaneled hospitals)
  - Patient pays hospital full amount
  - Patient submits claim to insurance company directly
  - OR insurance desk assists patient (VAS - Value Added Service)
  - Insurance reimburses patient

##### **10. Claim Tracking**
- **Track Claim Status**
  - TPA portal check
  - Call TPA helpline
  - Status: Submitted, Under Process, Query Raised, Approved, Rejected, Paid
  
- **Query Resolution** (if TPA raises query)
  - Missing documents (submit immediately)
  - Medical clarification (get from doctor)
  - Billing clarification (correct itemized bill)
  
- **Claim Approval**
  - Approved amount (may be less than claimed)
  - Payment timeline (usually 15-30 days)
  
- **Claim Rejection**
  - Rejection reason
  - Appeal process (if genuine claim)

##### **11. Payment Settlement**
- **Receive Payment from TPA**
  - Bank transfer (NEFT/RTGS)
  - Verify amount
  - Reconcile with claim amount
  
- **Shortfall Handling** (if TPA pays less than claimed)
  - Analyze reason (disallowance, reduction)
  - Bill patient for shortfall OR write off (as per policy)

##### **12. Patient Communication**
- **Claim Submitted** (acknowledgment)
- **Query Raised** (inform patient to submit docs)
- **Claim Approved** (inform expected payment timeline)
- **Claim Rejected** (inform reason, next steps)
- **Payment Received** (inform settlement complete)

#### **D. TPA COORDINATION**

##### **13. TPA Empanelment**
- **List of Empaneled TPAs**
  - TPA name, contact, email, portal
  - Tariff agreement (room rent limits, package rates)
  - Turnaround time (TAT) for pre-auth, claims
  
- **New TPA Empanelment**
  - Submit hospital documents
  - Negotiate tariff
  - Sign agreement
  - Get empanelment letter

##### **14. TPA Audits**
- **Periodic Audits by TPA**
  - Review medical records
  - Verify billing accuracy
  - Ensure compliance
  
- **Audit Findings**
  - Discrepancies (overbilling, wrong coding)
  - Corrective actions
  - Penalties (if fraud detected)

##### **15. TPA Reconciliation**
- **Monthly Reconciliation**
  - Claims submitted vs claims paid
  - Outstanding claims
  - Shortfalls
  - Follow-up on pending claims

#### **E. REPORTING & ANALYTICS**

##### **16. Insurance Reports**
- **Claim Statistics**
  - Total claims (count, value)
  - Approval rate, rejection rate
  - Average claim amount
  - Average settlement time
  
- **TPA-wise Reports**
  - Claims by TPA
  - Approval rate by TPA
  - Payment delays by TPA
  
- **Patient-wise Reports**
  - Insurance vs non-insurance patients
  - Insurance utilization

### **Integration Points**:
- ← **From Counselor**: Pre-auth requests
- ← **From Billing**: Bill amount, itemized charges
- ← **From Doctor Desk**: Clinical notes, discharge summary
- ← **From OT**: Operative notes
- → **To Billing**: Insurance approval amount, shortfall
- → **To Patient**: SMS/Email (claim status updates)

---

## 💰 Module 11: Billing & Invoicing Management

**Status**: ✅ Implemented (Days 4-8 OPD billing complete)  
**Role Access**: Billing Staff, Cashiers, Finance Team

### **Complete Workflow**:

#### **A. OPD BILLING (Days 4-8 Implementation)**

##### **1. Visit-Based Billing**
- **Auto-Capture Charges**
  - Registration fee (if new patient)
  - Consultation fee (based on doctor type: senior, junior, specialist)
  - Auto-posted when patient checked in
  
- **Service-Based Charges**
  - Optometry examination
  - Investigations (OCT, fundus, VF, blood tests)
  - Procedures (laser, injection, minor procedures)
  - Each service auto-posts to bill when performed

##### **2. Itemized Billing (Day 7 Implementation)**
- **Bill Generation**
  - Visit ID, Patient MRN, Name
  - Date of service
  - Doctor name
  
- **Line Items**
  - Service code, Service name
  - Quantity (usually 1, but can be multiple for investigations)
  - Unit price
  - Discount % (if applicable)
  - Discount amount (calculated)
  - Tax rate (GST %)
  - Tax amount (calculated)
  - Total amount (unit price × qty - discount + tax)
  
- **Bill Summary**
  - Subtotal (sum of all items before discount)
  - Total discount
  - Taxable amount
  - Total tax (CGST + SGST or IGST)
  - **Net Amount** (final payable amount)

##### **3. Discount Application**
- **Discount Types**
  - Senior citizen (%)
  - Staff discount (%)
  - Corporate discount (%)
  - Promotional discount (%)
  - Emergency discount (%)
  
- **Approval Workflow**
  - Discounts > 10% require supervisor approval
  - Discounts > 25% require manager approval
  - Emergency override with reason logging

##### **4. Payment Collection (Day 7: 6 Payment Modes)**
- **Cash Payment**
  - Amount tendered
  - Change returned
  - Cash drawer management
  
- **Card Payment**
  - Credit card / Debit card
  - Swipe/tap/chip
  - Card type, last 4 digits
  - Network (Visa, Mastercard, RuPay)
  - Transaction ID
  - Bank approval code
  - Card holder signature (if required)
  
- **UPI Payment**
  - UPI ID (patient's)
  - QR code scan
  - Transaction ID
  - UTR number
  - Auto-verification
  
- **Net Banking**
  - Bank selection
  - Payment gateway redirect
  - Transaction ID
  - Payment confirmation
  
- **Insurance**
  - Insurance approval number
  - Approved amount
  - Co-pay (patient pays)
  - Claim submitted to TPA
  
- **Credit** (Due Payment Later)
  - Corporate credit (for empaneled companies)
  - Credit approval required
  - Credit limit check
  - Due date (usually 30/45/60 days)
  - Credit terms documented

##### **5. Partial Payments**
- **Multiple Payment Modes in One Bill**
  - Cash ₹500 + Card ₹1000 (total ₹1500)
  - Track each payment separately
  
- **Installment Payments**
  - Total bill ₹10,000
  - Advance ₹5,000 (today)
  - Balance ₹5,000 (due date: 15 days)
  - Track installments

##### **6. Bill Locking (Day 5 Implementation)**
- **Lock Bill** (after payment complete OR for auditing)
  - is_locked = true
  - locked_at timestamp
  - locked_by_user_id
  - Cannot edit/delete locked bill
  
- **Unlock Bill** (with proper authorization)
  - Unlock reason (mandatory)
  - Approval required (supervisor/manager)
  - Unlock logged to audit trail
  - Can now edit bill
  
- **Use Cases for Unlocking**
  - Billing error (wrong service code, wrong amount)
  - Additional service to be added
  - Patient dispute resolution

##### **7. Auto-Billing Validation (Day 8 Implementation)**
- **Billing Status Check** (before visit completion)
  - GET `/api/OpdBills/visit-billing-status/{visitId}`
  - Returns: `{ hasBill, isPaid, isLocked, isFreeVisit, isCredit, balanceDue, canComplete }`
  
- **Hard Gate**
  - If `canComplete = false`, show billing prompt
  - Patient cannot leave without:
    - Full payment OR
    - Insurance approval OR
    - Credit approval OR
    - Free visit approval
  
- **Emergency Override**
  - Allow exit without payment (with reason)
  - Flag for follow-up collection
  - Log to audit trail

##### **8. Receipt Generation**
- **Print Receipt**
  - Hospital logo, name, address
  - Receipt number (unique, sequential)
  - Date, time
  - Patient name, MRN
  - Itemized bill (services, amounts)
  - Payment details (mode, amount, transaction ID)
  - Balance due (if partial payment)
  - Tax invoice (GST details)
  - Authorized signatory
  
- **Digital Receipt**
  - Email PDF to patient
  - SMS with receipt link
  - WhatsApp (if opted in)

##### **9. Refunds**
- **Refund Request**
  - Reason (duplicate payment, cancellation, overpayment)
  - Amount to refund
  - Original payment mode
  
- **Refund Approval**
  - Supervisor approval required
  - Verify original transaction
  
- **Refund Processing**
  - Cash refund (immediate)
  - Card refund (initiate reversal, 5-7 days)
  - UPI refund (initiate, 1-2 days)
  
- **Refund Receipt**
  - Document refund transaction
  - Update original bill (refunded status)

#### **B. IPD BILLING**

##### **10. IPD Bill Components**
- **Room Charges**
  - Room type (general ward, semi-private, private, deluxe)
  - Per day rate
  - Number of days (admission date to discharge date)
  - Total room charges
  
- **Surgery Charges**
  - Surgeon fee (per procedure)
  - Anesthesia charges
  - OT charges (per hour)
  - Consumables (surgical instruments, gloves, drapes)
  - Implants (IOL, sutures, etc.)
  
- **Nursing Charges**
  - Per day nursing care
  - Special nursing (if needed)
  
- **Medications**
  - All medicines given during stay
  - IV fluids, injections, tablets
  - From pharmacy records
  
- **Investigations**
  - Blood tests, X-rays, scans
  - ECG, other diagnostics
  
- **Doctor Visit Charges**
  - Consultation fee (per visit)
  - ICU charges (if applicable)
  
- **Miscellaneous**
  - Food charges (if extra)
  - Attendant charges
  - Medical certificate
  - Ambulance (if used)

##### **11. Interim Billing**
- **Daily Bill Updates**
  - All services/charges added daily
  - Running total visible to patient
  
- **Advance Deposit**
  - Collected at admission (₹5,000 - ₹20,000)
  - Adjusted against final bill
  
- **Additional Advance** (if bill exceeds initial deposit)
  - Request more advance
  - Prevent bill escalation

##### **12. Final IPD Bill (at Discharge)**
- **Bill Preparation**
  - Consolidate all charges (room, surgery, meds, investigations)
  - Apply discounts (insurance, corporate, staff)
  - Calculate taxes
  - Net payable amount
  
- **Insurance Adjustment**
  - If pre-auth approved: Deduct approved amount
  - Patient pays: Co-pay + non-covered items + excess charges
  
- **Final Settlement**
  - Total bill amount
  - Less: Advance deposit paid
  - Less: Insurance approved amount
  - **Balance Due** (patient to pay) OR **Refund** (if advance > bill)
  
- **Payment & Discharge**
  - Collect balance OR refund excess
  - Issue final receipt
  - Allow discharge

##### **13. Package Billing** (from Counselor Module)
- **Pre-defined Packages**
  - Cataract Surgery Package: ₹25,000 (includes surgeon fee, anesthesia, OT, IOL, 1-day room, meds, follow-up)
  - LASIK Package: ₹40,000 per eye
  - Retinal Surgery Package: ₹60,000
  
- **Package Billing**
  - Single line item (package name, amount)
  - No itemization (all-inclusive)
  - Simpler for patient understanding
  
- **Additional Charges Outside Package**
  - Extra days of admission
  - Complications requiring extra treatment
  - Premium IOL upgrade (if not in package)

##### **14. Credit Note / Debit Note**
- **Credit Note** (bill reduction)
  - Reason: Billing error, service not provided, discount applied later
  - Create credit note
  - Adjust against original bill
  
- **Debit Note** (bill increase)
  - Reason: Missed charges, additional service
  - Create debit note
  - Add to original bill

#### **C. BILLING ADMINISTRATION**

##### **15. Outstanding Bills Management**
- **Outstanding Bills Report**
  - List of unpaid/partially paid bills
  - Patient name, MRN, bill number
  - Bill date, due date
  - Outstanding amount
  - Days overdue
  
- **Payment Reminders**
  - SMS/Email reminders (7 days before due, on due date, 7/15/30 days overdue)
  - Phone calls for high-value overdue bills
  
- **Payment Collection**
  - Follow-up with patient
  - Collect payment (cash, online transfer, cheque)
  - Update bill status

##### **16. Bad Debt Write-Off**
- **Criteria**
  - Outstanding > 180 days
  - All collection efforts exhausted
  - Patient untraceable
  
- **Approval**
  - Finance manager approval
  - Write-off documented
  - Tax implications handled

##### **17. Cashier Management**
- **Cash Drawer**
  - Opening balance (start of shift)
  - Cash received during shift
  - Expected closing balance
  - Actual closing balance
  - Variance (over/short)
  
- **Shift Reconciliation**
  - Cash count
  - Card transactions (match with POS report)
  - UPI transactions (match with UTR numbers)
  - Total collection
  - Deposit to bank (or safe)

##### **18. Day-End Closing**
- **Daily Collection Summary**
  - Total OPD bills (count, amount)
  - Total IPD bills (count, amount)
  - Payment mode breakdown (cash, card, UPI, insurance, credit)
  - Total collection
  
- **Bank Deposit**
  - Cash deposited
  - Cheques deposited
  - Deposit slip
  
- **Reconciliation**
  - System total vs actual collection
  - Variance analysis
  - Corrections (if needed)

#### **D. REPORTING & ANALYTICS**

##### **19. Billing Reports**
- **Daily Collection Report**
  - OPD revenue
  - IPD revenue
  - Pharmacy revenue (if integrated)
  - Optical revenue (if integrated)
  - Total revenue
  
- **Payment Mode Report**
  - Cash, Card, UPI, Net Banking, Insurance, Credit
  - Trend analysis
  
- **Doctor-wise Revenue Report**
  - Revenue generated by each doctor
  - Incentive calculation (if commission-based)
  
- **Department-wise Revenue Report**
  - Ophthalmology, Diagnostics, Pharmacy, Optical
  
- **Outstanding Reports**
  - Aging analysis (0-30 days, 31-60 days, 61-90 days, >90 days)
  - Recovery rate

##### **20. GST Reports**
- **GSTR-1** (Outward Supplies)
  - All taxable invoices
  - GST collected
  
- **GSTR-3B** (Monthly Return)
  - Tax liability
  - Input tax credit
  
- **HSN/SAC Code-wise Summary**
  - Services grouped by HSN/SAC codes
  - Tax rates

### **Integration Points**:
- ← **From All Modules**: Service charges (OPD, IPD, Pharmacy, Optical, Diagnostics)
- ← **From Insurance**: Approved amounts, co-pay
- → **To Finance**: Daily collections, revenue data
- → **To Patients**: Receipts, bills (SMS/Email)

---

## 📦 Module 12: Inventory Management

**Status**: 🟡 Partial (Basic inventory exists, advanced features missing)  
**Role Access**: Inventory Manager, Store Keeper, Purchase Officer

### **Complete Workflow**:

#### **A. INVENTORY SETUP**

##### **1. Item Master**
- **Item Creation**
  - Item code (unique identifier)
  - Item name
  - Generic name (for medicines)
  - Category (Medicine, Surgical Supply, Consumable, Equipment, IOL, Optical)
  - Sub-category (Antibiotic, Anti-inflammatory, Gloves, Syringes, etc.)
  - Unit of Measure (UOM): Tablet, Bottle, Box, Piece, Meter, etc.
  - HSN/SAC code (for GST)
  - Tax rate (5%, 12%, 18%, 28%)
  - Manufacturer
  - Supplier
  
- **Inventory Parameters**
  - Minimum stock level (reorder point)
  - Maximum stock level
  - Reorder quantity
  - Lead time (days to receive after ordering)
  - Storage conditions (room temperature, refrigerated, freezer)
  
- **Pricing**
  - Purchase price (cost)
  - MRP (Maximum Retail Price)
  - Selling price (to patients)
  - Margin %

##### **2. Warehouse/Location Setup**
- **Multiple Locations**
  - Main Warehouse
  - Branch 1 Pharmacy
  - Branch 2 Pharmacy
  - OT Store
  - Central Store
  
- **Bin Locations**
  - Within each location, specific bin/shelf numbers
  - Example: Warehouse > Aisle 3 > Shelf B > Bin 12

##### **3. Supplier Master**
- **Supplier Details**
  - Supplier name
  - Contact person
  - Phone, email, address
  - GST number
  - Payment terms (credit days, advance %)
  - Lead time
  - Preferred items (what they supply)

#### **B. PURCHASE MANAGEMENT**

##### **4. Purchase Requisition (PR)**
- **Auto-generated PR** (when stock < minimum)
  - System alerts
  - PR created automatically
  - Pending approval
  
- **Manual PR**
  - Department requests item
  - Fill PR form (item, quantity, urgency)
  - Submit for approval
  
- **PR Approval**
  - Store keeper reviews
  - Approves OR rejects (with reason)

##### **5. Request for Quotation (RFQ)**
- **Select Suppliers**
  - Choose 3-5 suppliers for competitive pricing
  
- **Send RFQ**
  - List of items, quantities
  - Specifications
  - Delivery timeline required
  - Send via email
  
- **Receive Quotations**
  - Supplier submits quote (price, taxes, delivery time)
  - Upload quotation document

##### **6. Quotation Comparison**
- **Compare Quotes**
  - Item-wise price comparison (Supplier A, B, C)
  - Best price highlighted
  - Quality consideration
  - Delivery time consideration
  
- **Select Supplier**
  - Best value (not always lowest price)
  - Approve selected quote

##### **7. Purchase Order (PO)**
- **Generate PO**
  - PO number (unique, sequential)
  - Supplier details
  - Item list (name, quantity, unit price, total)
  - Taxes (CGST, SGST, IGST)
  - Total PO value
  - Delivery address
  - Expected delivery date
  - Payment terms
  
- **Approve PO**
  - Purchase manager approval (if > threshold)
  - Finance approval (if high value)
  
- **Send PO to Supplier**
  - Email PO
  - Supplier acknowledgment

##### **8. PO Tracking**
- **Track PO Status**
  - Created, Sent, Acknowledged, Partially Received, Fully Received, Closed
  
- **Delivery Reminders**
  - Follow-up with supplier if delayed

#### **C. GOODS RECEIPT**

##### **9. Goods Receipt Note (GRN)**
- **Receive Goods from Supplier**
  - Verify against PO (item, quantity)
  - Physical inspection (no damage, correct item)
  - Check expiry date (minimum 12 months remaining for medicines)
  - Check batch number, manufacturing date
  
- **GRN Creation**
  - GRN number (unique)
  - PO reference
  - Supplier invoice number, invoice date
  - Received items (item code, quantity received, batch, expiry, MRP)
  - Discrepancy (if any): Quantity short, wrong item, damaged
  
- **Quality Check**
  - Visual inspection
  - Check for counterfeits (especially medicines)
  - Temperature check (for cold chain items)
  - Accept OR reject
  
- **GRN Approval**
  - Store keeper approves
  - If discrepancy: Contact supplier, return/replace
  
- **Update Inventory**
  - Add received quantity to stock
  - Update batch details, expiry dates

##### **10. Three-Way Matching**
- **Match 3 Documents**
  - Purchase Order (what was ordered)
  - GRN (what was received)
  - Supplier Invoice (what is being billed)
  
- **Verify**
  - Quantities match
  - Prices match
  - Taxes calculated correctly
  
- **Approve for Payment** (if all match)
- **Query if Mismatch** (resolve before payment)

#### **D. STOCK MANAGEMENT**

##### **11. Stock Ledger**
- **Transaction Log**
  - Date, transaction type (GRN, issue, return, adjustment)
  - Item code, item name
  - Batch number
  - Quantity in, quantity out
  - Balance quantity
  - Location
  
- **Real-Time Stock Balance**
  - Current stock = Opening stock + Receipts - Issues + Returns - Adjustments

##### **12. Stock Issuance**
- **Issue to Departments**
  - Pharmacy issues items to OT, IPD, OPD
  - Store issues to all departments
  
- **Issue Note**
  - Issue number
  - Issued to (department, person)
  - Item code, quantity, batch
  - Purpose
  - Authorized by
  
- **Update Stock**
  - Deduct from issuing location
  - Add to receiving location (if inter-department transfer)

##### **13. Stock Returns**
- **Return from Department**
  - Unused items (returned to store/pharmacy)
  - Expired items (for disposal)
  - Damaged items (for return to supplier OR disposal)
  
- **Return Note**
  - Document return transaction
  - Update stock (add back to inventory if usable)

##### **14. Stock Adjustment**
- **Reasons for Adjustment**
  - Physical stock count discrepancy
  - Expired items (write-off)
  - Damaged items (write-off)
  - Pilferage/theft
  - Breakage
  
- **Adjustment Entry**
  - Item code, quantity (positive for increase, negative for decrease)
  - Reason
  - Approved by (manager)
  
- **Update Stock**

##### **15. Stock Transfer**
- **Transfer Between Locations**
  - From: Main Warehouse
  - To: Branch Pharmacy
  - Item, quantity, batch
  
- **Transfer Note**
  - Document transfer
  - Update both locations (deduct from source, add to destination)

##### **16. Batch Tracking & FEFO**
- **Batch-wise Stock**
  - Each GRN creates a new batch entry
  - Track quantity, expiry date by batch
  
- **FEFO (First Expiry First Out)**
  - When issuing stock, issue from batch with earliest expiry date
  - Reduce wastage due to expiry

##### **17. Expiry Management**
- **Expiry Alerts**
  - Items expiring in 30/60/90 days
  - Daily alert emails
  
- **Expiry Actions**
  - Return to supplier (if within return period)
  - Liquidate (sell at discount before expiry, if allowed)
  - Dispose (if expired)
  
- **Expired Item Write-Off**
  - Document expired items
  - Remove from usable stock
  - Proper disposal (as per regulations for medicines, bio-hazard items)

#### **E. STOCK TAKING & AUDITS**

##### **18. Physical Stock Count (Cycle Count)**
- **Periodic Counts**
  - Monthly (high-value items, medicines)
  - Quarterly (all items)
  - Annual (complete inventory audit)
  
- **Count Process**
  - Select items/categories to count
  - Print count sheets
  - Physical count by team (2-person verification)
  - Enter counted quantities in system
  
- **Variance Analysis**
  - System stock vs physical stock
  - Identify discrepancies
  - Investigate reasons (shrinkage, data entry errors, theft)
  
- **Stock Adjustment** (after approval)
  - Adjust system stock to match physical count

##### **19. ABC Analysis**
- **Classify Items**
  - A items: High value (80% of inventory value, 20% of items)
  - B items: Medium value
  - C items: Low value (20% of inventory value, 80% of items)
  
- **Management Focus**
  - Tight control on A items (frequent counts, strict issuance)
  - Moderate control on B items
  - Loose control on C items (bulk ordering, less frequent counts)

##### **20. Dead Stock Identification**
- **Non-Moving Items**
  - No consumption in last 6/12 months
  
- **Actions**
  - Return to supplier (if possible)
  - Liquidate (sell to other hospitals)
  - Donate (if near expiry)
  - Write-off

#### **F. VENDOR MANAGEMENT**

##### **21. Vendor Performance Tracking**
- **Track Metrics**
  - On-time delivery rate (%)
  - Order accuracy (correct items, quantities)
  - Quality (rejection rate)
  - Pricing competitiveness
  
- **Vendor Scorecard**
  - Monthly/quarterly evaluation
  - Rating (1-5 stars)
  
- **Preferred Vendor List**
  - Based on performance

##### **22. Vendor Payments**
- **Payment Terms**
  - Credit period (30/45/60 days from GRN date)
  - Advance payment (if required)
  
- **Payment Processing**
  - Generate payment list (due invoices)
  - Verify three-way match
  - Approve payments
  - Make payment (bank transfer, cheque)
  - Record payment in system

#### **G. REPORTING & ANALYTICS**

##### **23. Inventory Reports**
- **Stock Summary Report**
  - Item-wise current stock
  - Location-wise stock
  - Stock valuation (quantity × cost)
  
- **Reorder Report**
  - Items below minimum stock level
  - Suggested reorder quantity
  
- **Expiry Report**
  - Items expiring in 30/60/90 days
  - Action required
  
- **Consumption Report**
  - Item-wise consumption (daily, monthly, yearly)
  - Trend analysis
  - Forecasting
  
- **Stock Movement Report**
  - Fast-moving items
  - Slow-moving items
  - Dead stock
  
- **Variance Report**
  - Stock count variance
  - Reasons
  
- **Purchase Reports**
  - PO summary (count, value)
  - Supplier-wise purchases
  - Category-wise purchases
  
- **Stock Valuation Report**
  - Total inventory value
  - Category-wise valuation
  - FIFO/Weighted average valuation

### **Integration Points**:
- ← **From Pharmacy**: Stock requisitions, item issuance
- ← **From OT**: Surgical supplies, IOL requisitions
- ← **From Optical**: Frame, lens, CL orders
- ← **From All Departments**: Stock requests
- → **To Finance**: Purchase expenses, stock valuation
- → **To Vendors**: Purchase orders
- ← **From Vendors**: Invoices, goods delivery

---

## ⚙️ Module 13: Admin Management

**Status**: 🟡 Partial (Basic admin exists, advanced features missing)  
**Role Access**: System Admin, Hospital Admin, IT Admin

### **Complete Workflow**:

#### **A. ORGANIZATIONAL HIERARCHY**

##### **1. Tenant Management**
- **Multi-Tenancy**
  - Hospital chain with multiple entities
  - Each tenant = separate database context
  - Complete data isolation (RLS - Row Level Security)
  
- **Tenant CRUD**
  - Create tenant (hospital name, location, license)
  - Edit tenant details
  - Activate/deactivate tenant
  - Tenant statistics (users, patients, revenue)

##### **2. Organization Management**
- **Hospital/Clinic Setup**
  - Organization name
  - Type (Hospital, Clinic, Eye Center, Multi-specialty)
  - Registration number
  - Tax ID (GST number, PAN)
  - Logo, branding
  - Contact details (phone, email, website)
  - Address (street, city, state, country, PIN)
  
- **Multi-branch Support**
  - Main branch + sub-branches
  - Branch hierarchy

##### **3. Branch Management**
- **Branch Details**
  - Branch code (unique)
  - Branch name
  - Branch type (Main, Sub-branch)
  - Address
  - Phone, email
  - Branch manager
  - Operational status (active, inactive, under maintenance)
  
- **Branch Capacity**
  - Total OPD capacity (patients per day)
  - Total IPD beds
  - OT count
  - Diagnostic facility availability

##### **4. Department Management**
- **Department Setup**
  - Department code
  - Department name (Ophthalmology, Optometry, Pharmacy, Diagnostics, Admin, IT, Housekeeping)
  - Department head
  - Location (floor, wing)
  - Staff count
  
- **Sub-departments**
  - Retina Unit (under Ophthalmology)
  - Glaucoma Unit
  - Cataract Unit

##### **5. Hierarchy Viewer**
- **Visual Organization Chart**
  - Tenant → Organization → Branches → Departments
  - Interactive tree view
  - Drill-down capability
  - Export as PDF

#### **B. USER MANAGEMENT**

##### **6. User CRUD**
- **Create User**
  - Username (unique)
  - Email (unique)
  - Password (complexity requirements: 12+ chars, upper, lower, digit, symbol)
  - First name, last name
  - Employee ID (optional)
  - Department
  - Designation (Doctor, Nurse, Admin, Billing, etc.)
  - Profile photo
  - Phone number
  
- **User Activation**
  - Active/Inactive status
  - Activation email (welcome email with login link)
  
- **Password Management**
  - Force password change on first login
  - Password expiry (90 days)
  - Password reset (by admin)
  - Forgot password (self-service)

##### **7. Role-Based Access Control (RBAC)**
- **Preset Roles**
  - System Admin (full access)
  - Hospital Admin (tenant-level admin)
  - Doctor (clinical access)
  - Nurse (IPD, OT access)
  - Front Desk (OPD, registration access)
  - Billing (billing, payment access)
  - Pharmacist (pharmacy access)
  - Optician (optical access)
  - Lab Technician (diagnostics access)
  - Radiographer (imaging access)
  - Security (limited access)
  
- **Custom Roles**
  - Create custom role
  - Define role name, description
  - Assign permissions (granular)
  
- **Assign Roles to Users**
  - User can have multiple roles
  - Role hierarchy (inherit permissions)

##### **8. Permission Management**
- **Permission Structure**
  - Resource.Entity.Action
  - Examples:
    - PATIENT:VIEW
    - PATIENT:CREATE
    - BILLING:VIEW
    - BILLING:EDIT
    - ADMIN:USER:DELETE
  
- **Permission Scope**
  - Tenant-level (across all branches)
  - Branch-level (specific branch only)
  - Department-level (specific department only)
  
- **Assign Permissions to Roles**
  - Select role
  - Assign permissions (checkbox list)
  - Save

##### **9. Department-Level Access Control**
- **Department Access**
  - User assigned to specific department(s)
  - Can only view/edit data from assigned departments
  - Example: Dr. A can only see patients from Retina Clinic
  
- **Cross-Department Access** (if needed)
  - Special permission for multi-department users
  - Example: Admin can see all departments

##### **10. Access Requests**
- **Request Access**
  - User requests access to specific module/permission
  - Reason (why needed)
  - Submit request
  
- **Approval Workflow**
  - Request goes to department head OR admin
  - Approve OR reject (with reason)
  - If approved, permission granted automatically

#### **C. HUMAN RESOURCES (HR)**

##### **11. Employee Management**
- **Employee Onboarding**
  - Employee details (name, DOB, gender, contact, address)
  - Employment details (employee ID, joining date, designation, department, reporting manager)
  - Salary details (basic, allowances, deductions)
  - Bank account (for salary transfer)
  - Documents (resume, ID proof, address proof, certificates)
  - User account creation (link to user management)
  
- **Employee Profile**
  - View/edit employee details
  - Employment history
  - Leave balance
  - Attendance record
  - Performance reviews

##### **12. Attendance Management**
- **Attendance Marking**
  - Biometric punch (in/out)
  - Manual entry (by admin/manager)
  - Geofencing (mobile app attendance with location)
  
- **Attendance Log**
  - Employee ID, name
  - Date
  - In-time, out-time
  - Total hours worked
  - Status (present, absent, half-day, leave)
  
- **Late Coming/Early Leaving**
  - Track violations
  - Penalty/deduction rules (if applicable)
  
- **Overtime**
  - Hours beyond scheduled shift
  - Overtime pay calculation

##### **13. Leave Management**
- **Leave Types**
  - Casual Leave (CL)
  - Sick Leave (SL)
  - Earned Leave (EL)
  - Maternity Leave
  - Paternity Leave
  - Comp-off (compensatory off for working on holiday)
  
- **Leave Balance**
  - Annual allocation (12 CL, 12 SL, 15 EL per year)
  - Accrual (monthly basis)
  - Balance carry-forward (or lapse)
  
- **Leave Application**
  - Employee applies (leave type, from date, to date, reason)
  - Submit to manager
  
- **Leave Approval**
  - Manager reviews
  - Approve OR reject (with reason)
  - If approved, leave balance deducted
  
- **Leave Calendar**
  - View all employees' leave
  - Avoid clashing leaves (ensure coverage)

##### **14. Payroll Management**
- **Salary Structure**
  - Basic salary
  - HRA (House Rent Allowance)
  - DA (Dearness Allowance)
  - Medical Allowance
  - Conveyance Allowance
  - Special Allowance
  - Gross salary (sum of all allowances)
  
- **Deductions**
  - PF (Provident Fund)
  - ESI (Employee State Insurance)
  - Professional Tax
  - TDS (Tax Deducted at Source)
  - Advance deductions
  - Loan deductions
  
- **Net Salary** = Gross salary - Deductions
  
- **Payroll Processing**
  - Monthly salary run
  - Calculate salary for each employee (based on attendance, leaves, overtime)
  - Generate payslips
  - Bank transfer (salary disbursement)
  
- **Payslip**
  - Employee details
  - Salary month
  - Earnings (basic, allowances)
  - Deductions
  - Net pay
  - YTD (Year-to-Date) earnings, deductions

##### **15. Performance Management**
- **Performance Review Cycle**
  - Annual (or bi-annual)
  
- **Performance Appraisal**
  - Self-assessment (employee rates themselves)
  - Manager assessment (manager rates employee)
  - KPIs (Key Performance Indicators)
  - Achievements
  - Areas of improvement
  - Training needs
  
- **Performance Rating**
  - Scale (1-5, A-E, or custom)
  - Final rating
  - Feedback discussion
  
- **Performance-based Incentives**
  - Bonus calculation (based on rating)
  - Increment (salary hike based on performance)

##### **16. Training & Development**
- **Training Programs**
  - Internal training (conducted by hospital)
  - External training (conferences, workshops)
  - Online courses (CME - Continuing Medical Education)
  
- **Training Calendar**
  - Upcoming training sessions
  - Registration
  
- **Training Records**
  - Employee-wise training history
  - Certificates earned
  - CPD (Continuing Professional Development) points

##### **17. Staff Scheduling**
- **Roster Management**
  - Doctor roster (OPD timings, OT days, off days)
  - Nurse roster (shift: morning, evening, night)
  - Support staff roster
  
- **Shift Planning**
  - Create shifts (start time, end time)
  - Assign employees to shifts
  - Rotation (weekly/monthly)
  
- **On-Call Duty**
  - Emergency on-call roster (doctors, technicians)
  - Compensation for on-call hours

#### **D. LICENSING & SYSTEM CONFIGURATION**

##### **18. System License Management**
- **License Details**
  - License type (Starter, Professional, Enterprise)
  - User count limit
  - Expiry date
  - Features enabled (OPD, IPD, Pharmacy, etc.)
  
- **License Validation**
  - Check license validity on system start
  - Enforce user limits (block new user creation if limit reached)
  
- **License Renewal**
  - Renewal request
  - Payment
  - New license key
  - Update in system

##### **19. Feature Flags**
- **Enable/Disable Features**
  - Toggle features on/off per tenant
  - Examples:
    - Telemedicine (enabled/disabled)
    - Patient Portal (enabled/disabled)
    - SMS notifications (enabled/disabled)
  
- **Beta Features**
  - Test new features with select tenants
  - Gradual rollout

##### **20. User Licenses**
- **Named User Licenses**
  - Each user consumes 1 license
  - Track active users vs license limit
  
- **Concurrent User Licenses**
  - Multiple users, but limited concurrent logins
  - Example: 100 users, 50 concurrent sessions allowed

#### **E. MASTER DATA MANAGEMENT**

##### **21. Service Catalog**
- **Service Master**
  - Service code (unique)
  - Service name (Consultation, OCT Scan, Cataract Surgery, etc.)
  - Service category (OPD, IPD, Diagnostics, Procedure)
  - CPT code (procedure code)
  - HSN/SAC code (for GST)
  - Price (standard rate)
  - Tax rate
  - Department
  
- **Service Activation**
  - Active/inactive services
  - Archive old services

##### **22. ICD-10 Codes**
- **Diagnosis Master**
  - ICD-10 code (international standard)
  - Diagnosis description
  - Examples:
    - H25.11 - Age-related nuclear cataract, right eye
    - H40.11 - Primary open-angle glaucoma, right eye
    - E11.31 - Type 2 diabetes with diabetic retinopathy
  
- **Auto-complete in Doctor Module**
  - Type diagnosis, get ICD code suggestions
  - Select and add to patient record

##### **23. CPT Codes**
- **Procedure Master**
  - CPT code (Current Procedural Terminology)
  - Procedure description
  - Examples:
    - 66984 - Cataract surgery with IOL implantation
    - 67028 - Intravitreal injection
    - 92004 - Comprehensive eye exam, new patient
  
- **Insurance Billing**
  - CPT codes required for insurance claims
  - Auto-populate from service catalog

##### **24. Drug Formulary**
- **Drug Master**
  - Generic name (Timolol, Latanoprost, Moxifloxacin)
  - Brand names (multiple brands for same generic)
  - Dosage forms (eye drops, tablets, injection)
  - Strengths (0.5%, 5mg, 10mg)
  - Route (oral, topical, IV)
  - Therapeutic class (Antiglaucoma, Antibiotic, Anti-inflammatory)
  
- **Prescription Auto-complete**
  - Doctor types drug name, get suggestions from formulary
  - Standardized prescriptions

##### **25. Insurance Plans**
- **Insurance Provider Master**
  - Insurance company name
  - TPA (Third Party Administrator)
  - Contact details
  - Policy types (individual, family, corporate)
  
- **Insurance Plan Details**
  - Plan name
  - Coverage (sum insured)
  - Co-payment %
  - Exclusions
  - Network hospitals (empaneled/non-empaneled)

#### **F. SYSTEM SETTINGS**

##### **26. General Settings**
- **Hospital Information**
  - Name, logo, tagline
  - Contact (phone, email, website)
  - Address
  
- **Date/Time Settings**
  - Time zone
  - Date format (DD/MM/YYYY or MM/DD/YYYY)
  - Time format (12-hour or 24-hour)
  
- **Currency Settings**
  - Currency (INR, USD, etc.)
  - Currency symbol
  - Decimal places

##### **27. Notification Settings**
- **Email Settings**
  - SMTP server configuration
  - Sender email, sender name
  - Email templates (appointment reminder, bill receipt, etc.)
  
- **SMS Settings**
  - SMS gateway configuration
  - Sender ID
  - SMS templates
  - SMS credits (balance check)
  
- **WhatsApp Settings**
  - WhatsApp Business API integration
  - Templates

##### **28. Appointment Settings**
- **Slot Duration**
  - Default slot (15 min, 30 min)
  - Doctor-specific slot durations
  
- **Buffer Time**
  - Between appointments (5 min buffer)
  
- **Booking Lead Time**
  - Advance booking allowed (up to 30/60/90 days)
  
- **Cancellation Policy**
  - Cancellation allowed up to X hours before appointment
  - Refund policy

##### **29. Billing Settings**
- **Tax Configuration**
  - GST rates (5%, 12%, 18%)
  - CGST/SGST split (for intra-state) or IGST (for inter-state)
  
- **Invoice Numbering**
  - Prefix (INV-, BILL-)
  - Sequential number
  - Reset frequency (yearly, never)
  
- **Payment Modes**
  - Enable/disable payment modes (Cash, Card, UPI, etc.)
  
- **Discount Authorization**
  - Who can approve discounts
  - Maximum discount % limits

##### **30. Security Settings**
- **Password Policy**
  - Minimum length (12 chars)
  - Complexity (upper, lower, digit, symbol)
  - Password expiry (90 days)
  - Password history (cannot reuse last 5 passwords)
  
- **Session Management**
  - Session timeout (idle timeout: 30 min)
  - Maximum concurrent sessions per user
  
- **Two-Factor Authentication (2FA)**
  - Enable 2FA (mandatory for admin roles)
  - OTP via SMS/Email/Authenticator app

### **Integration Points**:
- → **To All Modules**: Users, roles, permissions, master data
- ← **From All Modules**: User activity logs, system usage stats

---

## 🔬 Module 14: Laboratory Management

**Status**: 🟡 Partial (Basic lab exists, advanced features missing)  
**Role Access**: Lab Technicians, Pathologists, Lab Manager

### **Complete Workflow**:

#### **A. LAB TEST ORDERING**

##### **1. Test Requisition** (from Doctor)
- **Doctor Orders Lab Test**
  - Patient MRN, name
  - Test selection (from test catalog)
  - Clinical indication (reason for test)
  - Priority (Routine, Urgent, Stat)
  - Special instructions (fasting required, timing, etc.)
  
- **Pre-Surgery Tests** (common package)
  - CBC (Complete Blood Count)
  - Blood Sugar (Fasting, Random)
  - RFT (Renal Function Test) - if diabetic/hypertensive
  - ECG
  - Chest X-ray (if > 50 years)
  - COVID test (as per protocol)

##### **2. Test Catalog**
- **Test Master**
  - Test code, test name
  - Department (Hematology, Biochemistry, Microbiology, etc.)
  - Sample type (blood, urine, sputum, swab)
  - Sample volume required
  - Container type (EDTA tube, plain tube, urine container)
  - Processing time (TAT - Turnaround Time)
  - Reference ranges (normal values by age, gender)
  - Price
  
- **Test Packages**
  - Pre-op Package (CBC + Blood Sugar + RFT + ECG)
  - Diabetes Package (FBS, PPBS, HbA1c)
  - Lipid Profile (Total cholesterol, HDL, LDL, Triglycerides)

#### **B. SAMPLE COLLECTION**

##### **3. Sample Collection Area**
- **Patient Check-In**
  - Verify patient (MRN, name, DOB)
  - Verify test ordered
  - Check fasting status (if required)
  
- **Sample Collection**
  - Blood collection (phlebotomy)
  - Urine collection (patient provides sample)
  - Other samples (swab, sputum, etc.)
  
- **Sample Labeling**
  - Patient MRN, name
  - Sample type
  - Collection date/time
  - Collector name
  - Barcode label (if available)
  
- **Sample Handling**
  - Store in appropriate conditions (room temp, refrigerated, frozen)
  - Transport to lab within specified time

##### **4. Sample Acceptance/Rejection**
- **Lab Receives Sample**
  - Check label (correct patient, test ordered)
  - Check sample quality (not hemolyzed, not clotted if shouldn't be)
  - Check volume (adequate for testing)
  
- **Accept Sample**
  - Register in LIS (Laboratory Information System)
  - Assign accession number
  
- **Reject Sample** (if unsuitable)
  - Reason (hemolyzed, insufficient volume, unlabeled, mislabeled)
  - Notify doctor/patient
  - Request re-collection

#### **C. LAB TESTING**

##### **5. Test Processing**
- **Hematology Tests**
  - CBC (automated cell counter)
  - Hemoglobin, RBC count, WBC count, Platelet count
  - Differential count
  - ESR (Erythrocyte Sedimentation Rate)
  
- **Biochemistry Tests**
  - Blood sugar (FBS, RBS, PPBS, HbA1c)
  - RFT (Blood Urea, Serum Creatinine)
  - LFT (Liver Function Test)
  - Lipid Profile
  - Electrolytes (Sodium, Potassium, Chloride)
  
- **Microbiology Tests**
  - Culture & Sensitivity (bacterial infection identification)
  - Gram staining
  - AFB staining (for TB)
  
- **Serology**
  - HIV, HBsAg, HCV (Hepatitis C Virus)
  - Dengue, Malaria tests
  
- **Urine Tests**
  - Routine urine analysis (color, appearance, pH, sugar, protein, RBC, WBC)
  - Urine culture

##### **6. Quality Control**
- **Internal QC**
  - Daily QC samples (known values)
  - Ensure instrument accuracy
  - Document QC results
  
- **External QC (Proficiency Testing)**
  - Periodic external samples (from accreditation body)
  - Compare results with other labs
  - Ensure standardization

##### **7. Result Entry**
- **Automated Results**
  - Instrument directly uploads results to LIS
  - Technician reviews for abnormalities
  
- **Manual Entry**
  - Technician enters results (for manual tests)
  - Double-check for accuracy
  
- **Critical Values**
  - Values outside normal range (very high/very low)
  - Alert system (notify doctor immediately)
  - Example: Hemoglobin < 7 g/dL, Blood sugar > 400 mg/dL

##### **8. Result Verification**
- **Technician Verification**
  - Review results for accuracy
  - Flag abnormal results
  
- **Pathologist Review**
  - For complex tests (culture reports, blood smears)
  - Add interpretation notes
  - Digital signature

#### **D. RESULT REPORTING**

##### **9. Report Generation**
- **Lab Report Format**
  - Patient details (name, MRN, age, gender)
  - Test name
  - Result value
  - Unit (mg/dL, cells/μL, etc.)
  - Reference range (normal values)
  - Flags (High, Low, Normal)
  - Test date, report date
  - Technician name, pathologist signature
  - Lab stamp
  
- **Graphical Representation** (for trends)
  - Blood sugar chart (if multiple tests)
  - HbA1c trend

##### **10. Result Delivery**
- **Electronic Delivery**
  - Upload to patient portal
  - Email to patient (PDF)
  - SMS notification (report ready)
  - Available in Doctor Desk module
  
- **Physical Delivery**
  - Print report
  - Hand over at reception
  - Patient signature (acknowledgment)
  
- **Critical Result Notification**
  - Phone call to doctor (immediate)
  - Documented in system

#### **E. ECG**

##### **11. ECG Testing**
- **Patient Preparation**
  - Remove clothing from chest
  - Clean skin (for electrode placement)
  - Rest for 5 minutes
  
- **ECG Recording**
  - 12-lead ECG
  - Standard limb leads (I, II, III, aVR, aVL, aVF)
  - Chest leads (V1-V6)
  - Recording duration (10 seconds)
  
- **ECG Interpretation**
  - Technician records
  - Cardiologist/physician interprets
  - Findings: Normal, Abnormal (specify: arrhythmia, ischemia, LVH, etc.)
  
- **ECG Report**
  - ECG strip (paper printout)
  - Interpretation note
  - Physician signature
  
- **Critical Findings**
  - Acute MI (Myocardial Infarction)
  - Severe arrhythmia
  - Immediate doctor notification

#### **F. LAB ADMINISTRATION**

##### **12. Instrument Management**
- **Instrument Master**
  - Instrument name (Hematology Analyzer, Biochemistry Analyzer, etc.)
  - Model, serial number
  - Purchase date, warranty
  - Calibration schedule
  - Maintenance schedule
  
- **Calibration**
  - Periodic calibration (monthly/quarterly)
  - Calibration certificate
  - Next due date
  
- **Maintenance**
  - Preventive maintenance (as per schedule)
  - Service calls (if breakdown)
  - Service provider contact
  
- **Downtime Tracking**
  - If instrument fails, log downtime
  - Escalate if prolonged
  - Send samples to outside lab (if necessary)

##### **13. Reagent Management**
- **Reagent Inventory**
  - Reagent name, lot number
  - Quantity, expiry date
  - Storage conditions
  
- **Reagent Consumption**
  - Track usage per test
  - Auto-deduction from inventory
  
- **Reorder**
  - Low stock alerts
  - Purchase requisition (to Inventory Module)

##### **14. Outside Lab Referrals**
- **Send Sample to Reference Lab**
  - Specialized tests (not available in-house)
  - Example: Genetic testing, advanced serology
  - Send sample with referral form
  
- **Receive Results**
  - Upload to patient record
  - Forward to doctor

#### **G. REPORTING & ANALYTICS**

##### **15. Lab Reports**
- **Test Volume Report**
  - Daily, weekly, monthly test count
  - Test-wise breakdown
  
- **TAT Report** (Turnaround Time)
  - Average time from sample collection to result
  - Target TAT vs actual TAT
  - Identify delays
  
- **Abnormal Results Report**
  - List of abnormal results (for quality review)
  
- **Critical Results Report**
  - All critical results (with notification proof)
  
- **Workload Report**
  - Department-wise workload (Hematology, Biochemistry, etc.)
  - Technician productivity

### **Integration Points**:
- ← **From Doctor Desk**: Lab test orders
- → **To Doctor Desk**: Lab results
- ← **From Billing**: Payment confirmation
- → **To Billing**: Lab test charges
- → **To Patient**: Lab reports (via portal, email, SMS)

---

## 📊 Module 15: Queue Management

**Status**: ❌ Missing (Not implemented as standalone module)  
**Role Access**: Front Desk, Doctors, OT Staff, Department Heads

### **Complete Workflow**:

#### **A. OPD QUEUE MANAGEMENT**

##### **1. Queue Types**
- **Doctor Queue**
  - Patients assigned to specific doctor
  - Organized by appointment time + walk-ins
  
- **Optometry Queue**
  - Patients for refraction testing
  - Separate from doctor queue
  
- **Pharmacy Queue** (optional)
  - Patients waiting for medication dispensing
  
- **Billing Queue** (optional)
  - Patients waiting for bill payment

##### **2. Queue Entry**
- **Patient Check-In** (from Front Office Module)
  - Patient added to queue automatically
  - Token number assigned (Day 6 implementation)
  - Queue position determined
  
- **Queue Position Factors**
  - Appointment time (scheduled patients first)
  - Priority (emergency > urgent > normal)
  - Check-in time (walk-ins by FCFS - First Come First Served)

##### **3. Queue Display** (For Patients)**
- **Waiting Area TV Screen**
  - Current token being served
  - Doctor name, room number
  - Next 5 tokens in queue
  - Estimated wait time (based on average consultation time)
  
- **Real-Time Updates**
  - Auto-refresh every 30 seconds
  - Call token (visual + audio announcement: "Token 45, please proceed to Room 3")

##### **4. Queue Display** (For Staff)**
- **Front Desk Dashboard**
  - All queues overview
  - Queue length (waiting count)
  - Average wait time
  - Patients in consultation
  - Completed consultations (today)
  
- **Doctor Dashboard** (in Doctor Desk Module)
  - My queue (patients assigned to me)
  - Current patient (in consultation)
  - Next patient (ready to call)
  - Remaining patients (waiting)

##### **5. Queue Actions**
- **Call Next Patient**
  - Doctor clicks "Call Next"
  - Next patient in queue is called
  - Token displays on screen, audio announcement
  - Patient status: Waiting → In Consultation
  
- **Skip Patient**
  - If patient not present when called
  - Move to end of queue
  - Mark reason (absent when called)
  
- **Mark Absent**
  - Patient didn't show up (after multiple calls)
  - Remove from queue
  - Update appointment status (no-show)
  
- **Transfer Patient**
  - Transfer to another doctor's queue (with reason)
  - Example: Dr. A on emergency leave, transfer patients to Dr. B

##### **6. Queue Monitoring & Alerts**
- **Long Wait Alerts**
  - If average wait time > 45 min, alert front desk + admin
  - Action: Inform patients, adjust schedule, call additional doctor
  
- **Queue Bottleneck Detection**
  - If queue length > X (e.g., 20 patients), alert
  - Action: Divert new patients to another doctor/branch
  
- **Doctor Delays**
  - If doctor late, notify waiting patients
  - Update estimated wait time

#### **B. OT QUEUE MANAGEMENT**

##### **7. OT Surgery Queue**
- **Daily Surgery Schedule**
  - List of surgeries for the day
  - OT room, surgeon, patient, procedure, time
  - Ordered by scheduled start time
  
- **Surgery Status**
  - Scheduled (not started)
  - Pre-op Preparation (patient in pre-op area)
  - In Progress (surgery ongoing)
  - Completed (surgery done, patient in recovery)
  - Canceled (if surgery canceled)

##### **8. Pre-Op Queue**
- **Pre-Op Holding Area**
  - Patients waiting for surgery
  - Queue by scheduled time
  
- **Pre-Op Checklist** (from OT Module)
  - Fasting verified
  - Consent signed
  - Pre-op medications given
  - IV line inserted
  - Ready for surgery (marked in queue)

##### **9. OT Room Status**
- **Real-Time OT Status**
  - OT 1: In Use (Cataract surgery, Dr. X, Patient Y, Started 10:00 AM, Est. End 10:45 AM)
  - OT 2: Cleaning (Next surgery at 11:00 AM)
  - OT 3: Available
  
- **Turnover Time Tracking**
  - Time between surgeries (cleaning + setup)
  - Target: < 30 min

##### **10. Post-Op Queue** (Recovery)**
- **Recovery Room Queue**
  - Patients in recovery (post-surgery)
  - Vitals monitoring
  - Discharge readiness check
  
- **Recovery Time**
  - Average time in recovery
  - Ready for discharge OR transfer to ward

##### **11. OT Queue Display**
- **OT Department Screen**
  - Current surgery in each OT
  - Next surgery details
  - Pre-op patients ready
  
- **Surgeon Dashboard**
  - My surgeries today
  - Current surgery
  - Next surgery details
  - Estimated start time

##### **12. OT Queue Adjustments**
- **Emergency Surgery**
  - Insert emergency case (bypasses queue)
  - Reschedule elective surgeries (if needed)
  
- **Surgery Delay**
  - If previous surgery takes longer
  - Auto-adjust subsequent surgery times
  - Notify patients (SMS/call)
  
- **Surgery Cancellation**
  - Cancel surgery (reason: patient request, medical issue, no-show)
  - Remove from queue
  - Reschedule (if needed)

#### **C. QUEUE ANALYTICS**

##### **13. OPD Queue Analytics**
- **Average Wait Time**
  - Per doctor
  - Per department
  - Per time slot (morning vs afternoon)
  
- **Queue Length Trends**
  - Peak hours (when queue longest)
  - Off-peak hours
  - Day-wise trends (Monday busiest, Friday slowest?)
  
- **Patient Flow Analysis**
  - Average consultation time per doctor
  - Patients per hour (throughput)
  - Bottleneck identification

##### **14. OT Queue Analytics**
- **Surgery Volume**
  - Daily, weekly, monthly surgery count
  - Procedure-wise breakdown
  - Surgeon-wise breakdown
  
- **OT Utilization**
  - Total OT hours available vs used
  - Utilization % (target: > 80%)
  - Idle time (OT available but not used)
  
- **Turnover Time**
  - Average time between surgeries
  - Target vs actual
  
- **Surgery Delays**
  - Delay frequency
  - Delay reasons (previous surgery overran, patient late, equipment issue)
  - Delay impact (subsequent surgeries affected)

##### **15. Queue Performance Metrics**
- **Patient Satisfaction**
  - Wait time < 30 min: 80% patients
  - Wait time 30-60 min: 15% patients
  - Wait time > 60 min: 5% patients (needs improvement)
  
- **No-Show Rate**
  - % of scheduled appointments where patient didn't show
  - Target: < 10%
  
- **On-Time Start Rate** (OT)
  - % of surgeries starting on scheduled time
  - Target: > 90%

### **Integration Points**:
- ← **From Front Office**: OPD check-ins, token generation
- ← **From Doctor Desk**: Call next patient, patient status updates
- ← **From OT Management**: Surgery schedule, OT status
- → **To Patients**: Queue display (TV screen), wait time estimates

---

## 🏥 Module 16: IPD Management

**Status**: ❌ Missing (Not implemented)  
**Role Access**: IPD Nurses, Doctors, Ward In-charge

### **Complete Workflow**:

#### **A. PATIENT ADMISSION**

##### **1. Admission Request**
- **From Doctor** (after diagnosis)
  - Admission required (medical OR surgical)
  - Diagnosis
  - Expected duration of stay
  - Room type required (general ward, semi-private, private, ICU)
  
- **From Emergency**
  - Emergency admission (direct from ER)
  - Immediate bed allocation

##### **2. Bed Availability Check**
- **Check Available Beds** (from Bed Management Module)
  - Filter by room type, gender (male/female ward)
  - Available beds list
  
- **Bed Reservation**
  - Reserve bed for patient
  - Hold time: 30 min (patient must arrive)

##### **3. Admission Process**
- **Patient Arrival**
  - Verify patient (MRN, name, DOB)
  - Admission paperwork
  
- **Admission Details Entry**
  - Admission date/time
  - Admission type (emergency, planned)
  - Primary diagnosis (ICD-10)
  - Admitting doctor
  - Bed assigned (ward, room, bed number)
  - Expected discharge date (tentative)
  
- **Admission Deposit Collection** (from Billing Module)
  - Advance deposit (₹5,000 - ₹20,000 based on room type, condition)
  - Receipt issued
  
- **Generate Admission ID**
  - Unique admission number
  - Link to patient MRN

##### **4. Patient Identification**
- **Wristband**
  - Patient name, MRN, admission ID
  - Barcode/QR code
  - Allergy alerts (red band if drug allergy)
  - DNR (Do Not Resuscitate) indicator if applicable

##### **5. Admission Orders** (from Doctor)
- **Doctor's Admission Orders**
  - Diagnosis
  - Diet (regular, diabetic, liquid, NPO)
  - Activity (bed rest, bathroom privileges, ambulate)
  - Vitals frequency (every 4 hours, every 6 hours)
  - IV fluids (type, rate)
  - Medications (see Medication Orders below)
  - Investigations (blood tests, X-ray, ECG)
  - Special instructions (oxygen, catheter, wound dressing)

##### **6. Bed Transfer** (to Ward)
  - Transfer patient to assigned bed
  - Handover to ward nurse
  - Admission complete

#### **B. WARD NURSING CARE**

##### **7. Nursing Assessment** (on Admission)
- **Initial Assessment**
  - Vital signs (BP, pulse, temp, SpO2, RR)
  - Height, weight, BMI
  - General condition
  - Allergies (confirm)
  - Fall risk assessment (especially elderly)
  - Pressure ulcer risk (Braden scale)
  
- **Nursing Care Plan**
  - Nursing diagnoses
  - Care goals
  - Interventions

##### **8. Vital Signs Monitoring**
- **Regular Vitals**
  - As per doctor's orders (every 4/6/8 hours)
  - Nurse records: BP, Pulse, Temp, SpO2, RR
  - Enter in system (charting)
  
- **Vital Signs Chart**
  - Graphical view (temperature curve, BP trends)
  - Alert if abnormal (high fever, low BP, low SpO2)

##### **9. Medication Administration**
- **Medication Orders** (from Doctor)
  - Drug name, dose, route, frequency, duration
  - Example: Tab. Moxifloxacin 400mg, PO (oral), OD (once daily), 5 days
  
- **Medication Administration Record (MAR)**
  - List of all medications for patient
  - Schedule (8 AM, 2 PM, 8 PM doses)
  - Nurse administers medication
  - Mark as given (checkbox + nurse signature)
  - If not given, document reason (patient NPO, patient refused, drug not available)
  
- **Medication Safety**
  - 5 Rights: Right patient, Right drug, Right dose, Right route, Right time
  - Scan patient wristband + medication barcode (if available)

##### **10. IV Fluid Management**
- **IV Fluid Orders**
  - Fluid type (Normal Saline, Ringer's Lactate, Dextrose)
  - Volume, rate (e.g., 1 liter over 8 hours)
  
- **IV Administration**
  - Start IV line
  - Hang IV bag, set flow rate
  - Monitor infusion
  
- **IV Charting**
  - Fluid input (volume given)
  - Monitor for complications (infiltration, phlebitis)

##### **11. Intake & Output (I/O) Monitoring**
- **Intake**
  - Oral fluids (water, juice, soup)
  - IV fluids
  - Total intake (mL)
  
- **Output**
  - Urine output (mL)
  - Drain output (if surgical drains)
  - Vomitus
  - Total output (mL)
  
- **Fluid Balance**
  - Intake - Output = Balance
  - Monitor for fluid overload or dehydration

##### **12. Wound Care** (if surgical patient)
- **Dressing Changes**
  - As per doctor's orders (daily, alternate day)
  - Inspect wound (redness, swelling, discharge, dehiscence)
  - Clean wound, apply new dressing
  - Document in nursing notes

##### **13. Patient Hygiene & Comfort**
- **Daily Activities**
  - Bed bath (if patient bed-ridden)
  - Oral care
  - Positioning (turn every 2 hours to prevent bed sores)
  - Linen change
  
- **Ambulation**
  - Assist patient to walk (if allowed)
  - Fall precautions

##### **14. Diet & Nutrition**
- **Meal Service**
  - As per diet order (regular, diabetic, liquid, soft, NPO)
  - Meal times (breakfast, lunch, dinner, snacks)
  
- **Feeding Assistance** (if needed)
  - Assist elderly or weak patients
  
- **Diet Intake Monitoring**
  - Document intake (full meal, half, quarter, refused)

##### **15. Nursing Handover** (Shift Change)
- **Shift Report**
  - Nurse-to-nurse handover (bedside OR nursing station)
  - Patient condition, medications given, pending tasks
  - Special alerts (confused patient, fall risk, critical vitals)

#### **C. DOCTOR ROUNDS**

##### **16. Daily Ward Rounds**
- **Morning Rounds**
  - Doctor visits all admitted patients
  - Review overnight events
  - Check vitals, examination
  - Review investigations
  - Modify treatment plan (if needed)
  
- **Progress Notes**
  - Doctor documents daily note (SOAP format)
  - Subjective (patient complaints)
  - Objective (examination findings, vitals, lab reports)
  - Assessment (current diagnosis, progress)
  - Plan (continue meds, order new tests, prepare for discharge)

##### **17. Investigations**
- **Order Investigations**
  - Blood tests, X-ray, ECG, etc.
  - Mark priority (routine, urgent, stat)
  
- **Sample Collection**
  - Nurse OR phlebotomist collects sample
  - Send to lab
  
- **Results**
  - Lab uploads results
  - Doctor reviews
  - Document in patient record

##### **18. Medication Adjustments**
- **Modify Orders**
  - Change dose, frequency
  - Add new medication
  - Discontinue medication (D/C)
  
- **Update MAR**
  - New orders reflect in MAR
  - Nurse aware of changes

##### **19. Consultant Reviews** (if needed)
- **Specialist Consultation**
  - Physician (if medical clearance needed for surgery)
  - Cardiologist (if cardiac issue)
  - Anesthesiologist (pre-op anesthesia evaluation)
  
- **Consultant Notes**
  - Consultant reviews, adds note
  - Recommendations

#### **D. PATIENT TRANSFER**

##### **20. Transfer Within Hospital**
- **Ward-to-Ward Transfer**
  - Reason (need different room type, gender-specific ward)
  - New bed allocation
  - Transfer patient, belongings
  - Update bed occupancy
  
- **Ward-to-ICU Transfer**
  - Patient condition deteriorates
  - Requires intensive care
  - ICU bed allocation
  - Handover to ICU team
  
- **ICU-to-Ward Transfer**
  - Patient stable
  - Downgrade from ICU
  - Ward bed allocation

##### **21. Transfer to Another Hospital**
- **Referral Transfer**
  - Need specialty not available
  - Higher level of care
  
- **Transfer Process**
  - Arrange ambulance
  - Prepare transfer summary (diagnosis, treatment given, vitals)
  - Send medical records
  - Discharge from current hospital

#### **E. DISCHARGE MANAGEMENT**

##### **22. Discharge Planning**
- **Discharge Criteria**
  - Medically stable
  - Investigations complete
  - Complication-free (or managed)
  - Doctor approval
  
- **Discharge Orders** (from Doctor)
  - Discharge date/time
  - Discharge status (improved, cured, LAMA - Left Against Medical Advice)
  - Discharge medications (list with duration)
  - Activity restrictions
  - Follow-up appointments
  - Special instructions

##### **23. Discharge Summary** (from Discharge Management Module - Module 22)
- Detailed discharge summary created
  
##### **24. Discharge Clearance**
- **Billing Clearance** (from Billing Module)
  - Final bill generated
  - Balance payment collected OR refund given
  - "No Dues" certificate
  
- **Pharmacy Clearance**
  - Discharge medications dispensed
  - Patient counseling on medications
  
- **Investigations Clearance**
  - All reports handed over to patient

##### **25. Patient Discharge**
- **Final Checks**
  - Remove IV line
  - Remove catheter (if any)
  - Return patient belongings
  
- **Discharge Instructions** (verbal + written)
  - Medications
  - Diet, activity
  - Wound care (if applicable)
  - Warning signs (when to return to ER)
  - Follow-up appointments
  
- **Discharge from System**
  - Update admission status (Discharged)
  - Discharge date/time recorded
  - Free bed (mark available in Bed Management)

#### **F. IPD ADMINISTRATION**

##### **26. Bed Occupancy Report**
- **Daily Bed Status**
  - Total beds, occupied, available
  - Occupancy rate (%)
  - Average length of stay (ALOS)
  
- **Ward-wise Occupancy**
  - General ward, semi-private, private, ICU

##### **27. IPD Census**
- **Daily Census**
  - Total admitted patients (current count)
  - New admissions (today)
  - Discharges (today)
  - Transfers (in/out)
  
- **Diagnosis-wise Census**
  - Cataract surgery post-op: 10 patients
  - Retinal detachment: 5 patients
  - Glaucoma: 3 patients

##### **28. Nursing Workload**
- **Nurse-to-Patient Ratio**
  - General ward: 1:6
  - ICU: 1:2
  - Target: Meet recommended ratios
  
- **Workload Balancing**
  - Distribute patients evenly among nurses

##### **29. Adverse Events Tracking**
- **Incident Reporting**
  - Falls
  - Medication errors
  - Hospital-acquired infections (HAI)
  - Pressure ulcers
  
- **Root Cause Analysis**
  - Investigate incident
  - Preventive measures

### **Integration Points**:
- ← **From Doctor Desk**: Admission orders, daily progress notes
- ← **From OT Management**: Post-surgery admissions, transfer to ward
- ← **From Bed Management**: Bed allocation, occupancy tracking
- ← **From Pharmacy**: Medication dispensing (to ward)
- ← **From Laboratory**: Investigation orders, results
- → **To Billing**: IPD charges (room, nursing, meds, investigations)
- → **To Discharge Management**: Discharge summary, final bills

---

## 📝 Module 17: Consent Management

**Status**: ❌ Missing (Not implemented)  
**Role Access**: Doctors, Nurses, Counselors, Front Desk

### **Complete Workflow**:

#### **A. CONSENT TYPES**

##### **1. Surgery Consent**
- **Purpose**: Informed consent for surgical procedures
- **Content**:
  - Patient details (name, MRN, age)
  - Diagnosis
  - Procedure name (e.g., Cataract surgery with IOL implantation, Vitrectomy)
  - Surgeon name
  - Risks explained (infection, bleeding, vision loss, anesthesia complications)
  - Benefits explained
  - Alternative treatment options discussed
  - Patient questions answered
  - Right to refuse
  
- **Signatures Required**:
  - Patient signature (or guardian if minor/incompetent)
  - Witness signature (nurse or family member)
  - Doctor signature (explaining physician)
  - Date, time

##### **2. Anesthesia Consent**
- **Purpose**: Consent for anesthesia administration
- **Content**:
  - Type of anesthesia (local, regional, general)
  - Risks (allergic reaction, respiratory depression, cardiac issues)
  - Anesthesiologist name
  
- **Signatures**: Patient, Anesthesiologist, Witness

##### **3. Blood Transfusion Consent**
- **Purpose**: If blood transfusion might be needed
- **Content**:
  - Risks (transfusion reaction, infection)
  - Alternatives (cell saver, synthetic blood products)
  
- **Signatures**: Patient, Doctor, Witness

##### **4. Photography/Video Consent**
- **Purpose**: For clinical documentation, teaching, or publication
- **Content**:
  - Purpose (clinical records, academic presentation, research)
  - How images will be used
  - Anonymity preserved (or not)
  - Right to withdraw consent
  
- **Signatures**: Patient, Photographer/Doctor

##### **5. Diagnostic Procedure Consent**
- **Purpose**: For invasive diagnostics (FFA - Fluorescein Angiography, invasive imaging)
- **Content**:
  - Procedure details
  - Risks (allergic reaction to dye, nausea)
  
- **Signatures**: Patient, Technician/Doctor

##### **6. General Treatment Consent** (on Admission)
- **Purpose**: Blanket consent for routine care
- **Content**:
  - Routine examinations, blood tests, medications
  - Release of medical information (to insurance, referring doctors)
  
- **Signatures**: Patient

##### **7. Research Consent** (if applicable)
- **Purpose**: Participation in clinical trials
- **Content**:
  - Study purpose, procedures
  - Risks, benefits
  - Voluntary participation, right to withdraw
  - Confidentiality
  
- **Signatures**: Patient, Principal Investigator, IRB approval attached

#### **B. CONSENT WORKFLOW**

##### **8. Consent Form Selection**
- **Select Appropriate Form**
  - Based on procedure type
  - Pre-filled templates available
  
- **Auto-populate Patient Details**
  - From patient record (MRN, name, DOB)

##### **9. Consent Explanation** (by Doctor/Counselor)
- **Verbal Explanation**
  - Explain procedure in patient-friendly language
  - Explain risks (material risks that reasonable person would want to know)
  - Explain benefits
  - Explain alternatives
  - Answer all patient questions
  
- **Document Counseling**
  - Counseling date, time
  - Counselor name
  - Topics discussed (checkboxes)
  - Patient understanding confirmed

##### **10. Consent Signing**
- **Physical Signature**
  - Patient signs paper consent form
  - Witness signs
  - Doctor signs
  
- **Digital Signature** (if e-consent enabled)
  - Patient signs on tablet/touchscreen
  - Digital signature captured
  - Timestamp, IP address recorded
  - Legally valid (as per Electronic Signatures Act)

##### **11. Consent Storage**
- **Paper Consent**
  - Scan and upload to patient record
  - Original filed in medical records
  
- **Digital Consent**
  - Stored in system
  - PDF generated with signatures
  - Audit trail (who signed, when)

##### **12. Consent Verification** (before Procedure)
- **Pre-Procedure Checklist**
  - Verify consent signed
  - Verify correct procedure on consent
  - Verify patient signature + witness
  
- **Time-Out** (in OT)
  - Re-verify consent before surgery starts
  - Part of WHO Surgical Safety Checklist

##### **13. Consent Withdrawal**
- **Patient Withdraws Consent**
  - Patient has right to withdraw consent anytime before procedure
  - Document withdrawal (date, time, reason)
  - Cancel procedure
  - Inform team (surgeon, OT, etc.)

##### **14. Emergency Consent Override**
- **Life-threatening Emergency**
  - If patient unconscious/unable to consent
  - If immediate intervention needed to save life
  - Proceed without consent (legal provision)
  - Document emergency, clinical justification
  - Inform family ASAP

#### **C. CONSENT TEMPLATES**

##### **15. Template Management**
- **Standard Templates**
  - Pre-approved consent forms for each procedure
  - Legal review completed
  - Hospital branding, legal disclaimers
  
- **Customize Templates**
  - Add hospital-specific risks
  - Update based on new regulations
  
- **Multi-language Support**
  - Consent forms in local languages (Hindi, regional languages)
  - Patient selects preferred language

##### **16. Version Control**
- **Template Versions**
  - Track template changes (v1.0, v1.1, etc.)
  - Effective date (new template applies from date X)
  - Archive old versions
  
- **Legal Compliance**
  - Ensure templates comply with medical council regulations
  - Periodic legal review (annual)

#### **D. CONSENT REPORTING**

##### **17. Consent Audit**
- **Compliance Check**
  - All surgeries have signed consent (target: 100%)
  - Consent signed before procedure (not after)
  - All required signatures present
  
- **Audit Report**
  - Missing consents (follow-up required)
  - Incomplete consents (missing signatures)

##### **18. Consent Analytics**
- **Consent Withdrawal Rate**
  - % of patients who withdraw consent after initial signing
  - Reasons for withdrawal
  
- **Time to Consent**
  - Average time between consent signing and procedure
  - Ensure adequate time for patient to consider (not rushed)

### **Integration Points**:
- ← **From Counselor**: Surgery consent (during pre-op counseling)
- ← **From Doctor Desk**: Procedure orders requiring consent
- ← **From OT Management**: Pre-op verification of consent
- → **To Medical Records**: Consent storage, archival
- → **To Audit Logs**: Consent signing events, withdrawals

---

## 🗂️ Module 18: Master Data Management

**Status**: 🟡 Partial (Some masters exist, many missing)  
**Role Access**: System Admin, Data Admin, Department Heads

### **Complete Workflow**:

#### **A. CLINICAL MASTERS**

##### **1. ICD-10 Diagnosis Codes** (Covered in Module 13 Admin)
- Import ICD-10 database (ophthalmology subset + general codes)
- Search, filter by category
- Regular updates (ICD-10-CM annual updates)

##### **2. CPT Procedure Codes** (Covered in Module 13 Admin)
- Import CPT database (ophthalmology procedures + general)
- Map to services in Service Catalog

##### **3. Drug Formulary** (Covered in Module 13 Admin)
- Comprehensive drug database
- Generic + Brand names
- Dosage forms, strengths
- Therapeutic classifications

##### **4. Ophthalmology-Specific Masters**

- **IOL Master**
  - IOL types (Monofocal, Multifocal, Toric, Premium)
  - Manufacturers (Alcon, AMO, Bausch & Lomb, etc.)
  - Models (SN60WF, Tecnis, Acrysof, etc.)
  - Power range (-10D to +30D)
  - A-constant (for IOL calculation)
  
- **Eye Conditions Master**
  - Common diagnoses (Cataract types, Glaucoma types, Retinal conditions)
  - Severity grading (Mild, Moderate, Severe)
  
- **Visual Acuity Notations**
  - Snellen (6/6, 6/9, 6/12, ..., 6/60)
  - LogMAR (0.0, 0.1, 0.2, ..., 1.0)
  - Decimal (1.0, 0.8, 0.6, ...)
  - Conversion table
  
- **Eye Drop Formulary**
  - Categories (Antiglaucoma, Antibiotic, Steroid, NSAID, Mydriatic, Cycloplegic, Lubricant)
  - Tapering schedules (for post-op steroids)
  - Side effects (specific to eye drops)

##### **5. Allergy Master**
- **Drug Allergies**
  - Common allergens (Penicillin, Sulfa drugs, NSAIDs)
  - Reaction severity (Mild rash, Anaphylaxis)
  
- **Other Allergies**
  - Latex (for surgical gloves)
  - Iodine (for pre-op skin prep)
  - Tape/adhesive

#### **B. OPERATIONAL MASTERS**

##### **6. Service Catalog** (Covered in Module 13 Admin)
- All billable services
- Pricing, tax rates

##### **7. Room Types**
- **OPD Room Types**
  - Consultation room, Examination room, Procedure room
  
- **IPD Room Types**
  - General Ward, Semi-Private, Private, Deluxe, ICU
  - Bed capacity per room type
  - Pricing (per day)

##### **8. Appointment Types**
- New Patient, Follow-up, Post-op Review, Refraction Only, Emergency

##### **9. Visit Types**
- OPD, IPD, Emergency, Telemedicine

##### **10. Payment Modes**
- Cash, Credit Card, Debit Card, UPI, Net Banking, Cheque, Insurance, Credit (Due Payment)

##### **11. Discount Types**
- Senior Citizen (10%), Staff (20%), Corporate, Promotional, Emergency

##### **12. Referral Sources**
- Self (Walk-in), Doctor Referral (specify doctor), Advertisement, Internet Search, Word of Mouth, Insurance Panel

#### **C. HR & ADMIN MASTERS**

##### **13. Designations**
- Medical Staff (Doctor, Specialist, Consultant, Resident, Intern)
- Nursing Staff (Nursing Superintendent, Staff Nurse, Junior Nurse)
- Allied Health (Optometrist, Pharmacist, Lab Technician, Radiographer)
- Admin Staff (Manager, Supervisor, Clerk, Receptionist)
- Support Staff (Housekeeping, Security, Driver)

##### **14. Departments** (Covered in Module 13 Admin)
- Ophthalmology, Optometry, Pharmacy, Diagnostics, etc.

##### **15. Employment Types**
- Full-time, Part-time, Contractual, Consultant, Intern

##### **16. Leave Types**
- Casual Leave, Sick Leave, Earned Leave, Maternity, Paternity, Comp-off

##### **17. Shift Types**
- Morning (8 AM - 4 PM), Evening (4 PM - 12 AM), Night (12 AM - 8 AM)

#### **D. INSURANCE MASTERS**

##### **18. Insurance Companies**
- Company name, contact, TPA
- Empanelment status

##### **19. TPA (Third Party Administrators)**
- TPA name, contact, portal URL
- Preferred providers

##### **20. Insurance Plan Types**
- Individual, Family Floater, Corporate, Senior Citizen, Government schemes (CGHS, ECHS, Ayushman Bharat)

#### **E. LOCATION MASTERS**

##### **21. Country, State, City**
- Standard location hierarchy
- PIN code database

##### **22. Nationality Master**
- List of countries (for patient nationality)

#### **F. MASTER DATA OPERATIONS**

##### **23. CRUD Operations**
- **Create**: Add new master data entry
- **Read**: View, search, filter
- **Update**: Edit existing entry
- **Delete**: Soft delete (mark inactive, don't hard delete)

##### **24. Data Import/Export**
- **Import**
  - Bulk upload via CSV/Excel
  - Validate data before import
  - Error report (invalid entries)
  
- **Export**
  - Download master data (for backup, analysis)
  - Formats: CSV, Excel, PDF

##### **25. Data Validation**
- **Duplicate Check**
  - Prevent duplicate entries (e.g., same drug added twice)
  
- **Data Integrity**
  - Mandatory fields (name, code)
  - Format validation (email, phone)

##### **26. Master Data Versioning**
- **Track Changes**
  - Who changed what, when
  - Audit trail
  
- **Effective Dating**
  - New price effective from date X
  - Historical data preserved

##### **27. Master Data Sync** (Multi-branch)
- **Central Master**
  - Maintained at corporate level
  
- **Branch Sync**
  - Branches receive updates
  - Can override (if branch-specific pricing)

#### **G. REPORTING**

##### **28. Master Data Reports**
- **Active Masters Report**
  - All active entries in each master
  
- **Inactive/Archived Report**
  - Old data (for reference)
  
- **Master Data Audit Report**
  - Recent changes (last 30 days)
  - Change summary

### **Integration Points**:
- → **To All Modules**: Master data used across entire system
- ← **From All Modules**: Requests for new master data entries

---

## 🛏️ Module 19: Bed Management

**Status**: ❌ Missing (Not implemented)  
**Role Access**: IPD Nurses, Ward In-charge, Admissions Desk

### **Complete Workflow**:

#### **A. BED SETUP**

##### **1. Ward Configuration**
- **Ward Details**
  - Ward name (General Ward, Semi-Private, Private, ICU, NICU, Maternity)
  - Ward code (unique)
  - Floor, wing
  - Gender (Male, Female, Mixed)
  - Specialty (General, Ophthalmology, Surgical, Medical)
  - Total bed capacity
  
- **Ward In-charge**
  - Nurse assigned as in-charge

##### **2. Room Configuration**
- **Room Details**
  - Room number (101, 102, etc.)
  - Room type (General ward, Semi-private, Private, Deluxe, ICU)
  - Bed capacity (1-6 beds per room)
  - Amenities (AC, TV, attached bathroom, attendant bed)
  
- **Room Pricing**
  - Per day rate (varies by room type)
  - General ward: ₹500/day
  - Semi-private: ₹1,500/day
  - Private: ₹2,500/day
  - Deluxe: ₹5,000/day
  - ICU: ₹8,000/day

##### **3. Bed Configuration**
- **Bed Details**
  - Bed number (unique within hospital: 101-A, 101-B, 202-A)
  - Room assignment
  - Bed type (Standard, Electric, ICU bed with monitor)
  - Status (Available, Occupied, Blocked, Under Maintenance)

#### **B. BED ALLOCATION**

##### **4. Bed Availability Check**
- **Search Available Beds**
  - Filter by room type, gender, specialty
  - Real-time availability
  
- **Bed Status**
  - **Available**: Ready for patient
  - **Occupied**: Patient admitted
  - **Blocked**: Reserved for patient (arrival pending)
  - **Under Maintenance**: Cleaning, repair
  - **Isolated**: Infection control (patient in isolation)

##### **5. Bed Reservation** (from IPD Admission)
- **Reserve Bed for Patient**
  - Patient name, MRN
  - Expected admission date/time
  - Duration of reservation (default: 30 min, can extend)
  
- **Reservation Expiry**
  - If patient doesn't arrive within time, auto-release bed
  - Notify admission desk

##### **6. Bed Assignment** (Patient Admitted)
- **Assign Patient to Bed**
  - Patient details (MRN, name, age, gender, diagnosis)
  - Admission date/time
  - Admitting doctor
  - Expected discharge date (tentative)
  
- **Bed Status Update**: Available → Occupied

##### **7. Bed Transfer** (Patient Moved)
- **Transfer Reasons**
  - Patient request (different room type)
  - Medical requirement (upgrade to ICU, downgrade to ward)
  - Gender-specific ward (if wrongly assigned)
  - Infection control (isolate patient)
  
- **Transfer Process**
  - Select new bed (check availability)
  - Transfer patient physically
  - Update system (old bed → Available, new bed → Occupied)
  - Update billing (if room type changed, adjust charges)

##### **8. Bed Release** (Patient Discharged)
- **Discharge from Bed**
  - Patient discharge date/time
  - Bed status: Occupied → Under Maintenance (for cleaning)
  
- **Bed Cleaning**
  - Housekeeping notified
  - Clean bed, change linen
  - Sanitize (especially if infectious patient)
  - Mark as Available (after cleaning complete)

##### **9. Bed Blocking** (Temporary Unavailability)
- **Block Bed**
  - Reason (maintenance, repair, renovation, infection control)
  - Blocked by (user)
  - Expected availability date
  
- **Unblock Bed**
  - After issue resolved
  - Mark as Available

#### **C. BED MONITORING**

##### **10. Bed Occupancy Dashboard**
- **Real-Time View**
  - Visual bed map (ward-wise, floor-wise)
  - Color-coded (Green: Available, Red: Occupied, Yellow: Blocked, Gray: Maintenance)
  
- **Occupancy Statistics**
  - Total beds: 100
  - Occupied: 75
  - Available: 20
  - Blocked/Maintenance: 5
  - **Occupancy Rate**: 75% (Target: 70-80% for optimal utilization)

##### **11. Ward-wise Occupancy**
- **General Ward**: 30 beds, 25 occupied (83%)
- **Semi-Private**: 20 beds, 15 occupied (75%)
- **Private**: 15 beds, 10 occupied (67%)
- **ICU**: 10 beds, 8 occupied (80%)

##### **12. Gender Distribution**
- **Male Ward**: 25 occupied / 40 total
- **Female Ward**: 20 occupied / 40 total
- **Pediatric**: 5 occupied / 20 total

##### **13. Specialty-wise Occupancy**
- **Ophthalmology**: 30 patients
- **General Surgery**: 20 patients
- **General Medicine**: 15 patients

##### **14. Average Length of Stay (ALOS)**
- Overall ALOS: 3.5 days
- Cataract surgery: 1-2 days (day-care or overnight)
- Retinal surgery: 3-5 days
- Medical admissions: 4-7 days

#### **D. BED ALLOCATION RULES**

##### **15. Allocation Priority**
- **Emergency Patients**: Highest priority (admit to any available bed, transfer later if needed)
- **Surgery Patients**: Reserved beds (as per surgery schedule)
- **Routine Admissions**: Standard allocation

##### **16. Overflow Management**
- **No Beds Available**
  - Waiting list (prioritize by urgency)
  - Arrange transfer to other branch (if multi-branch)
  - Arrange extra beds (temporary beds in corridor, if permitted)
  - Refer to other hospital (if no alternative)

##### **17. Bed Allocation Rules**
- **Gender Matching**: Male patient → Male ward (unless single-occupancy room)
- **Infection Control**: Infectious patient → Isolation room
- **Room Type Matching**: Patient paid for private → assign private room

#### **E. BED TURNOVER**

##### **18. Bed Turnover Time**
- **Turnover Process**
  - Discharge → Cleaning → Available
  
- **Target Turnover Time**: < 2 hours
  
- **Delays**
  - Housekeeping delay (staff shortage)
  - Deep cleaning required (infectious patient)
  - Bed/equipment repair

##### **19. Housekeeping Integration**
- **Cleaning Request**
  - Auto-notify housekeeping when bed vacated
  - Assign cleaning staff
  
- **Cleaning Checklist**
  - Remove soiled linen
  - Clean bed, mattress
  - Sanitize bed frame, bedside table, bathroom
  - Replace fresh linen
  - Check equipment (call bell, oxygen, suction)
  
- **Cleaning Completion**
  - Housekeeping marks as complete
  - Bed status: Under Maintenance → Available

#### **F. REPORTING & ANALYTICS**

##### **20. Bed Utilization Report**
- **Daily Bed Census**
  - Total admissions (today)
  - Total discharges (today)
  - Current occupancy (end of day)
  
- **Monthly Bed Utilization**
  - Average occupancy rate (%)
  - Peak occupancy date
  - Lowest occupancy date
  
- **Revenue per Bed**
  - Total bed revenue / Total bed days
  - Compare by room type (Private beds generate more revenue per day)

##### **21. Bed Blocking Report**
- **Blocked Beds Analysis**
  - Total blocked bed days (lost opportunity)
  - Reasons for blocking (maintenance, repair, etc.)
  - Action: Reduce maintenance downtime

##### **22. ALOS Report**
- **Diagnosis-wise ALOS**
  - Cataract surgery: 1.5 days
  - Glaucoma surgery: 3 days
  - Vitrectomy: 4 days
  
- **Doctor-wise ALOS**
  - Compare doctors (identify outliers)

##### **23. Bed Turnover Report**
- **Average Turnover Time**
  - By ward
  - Identify delays
  - Improve efficiency

### **Integration Points**:
- ← **From IPD Management**: Bed allocation requests, discharge notifications
- → **To IPD Management**: Bed assignments, availability status
- ← **From Housekeeping**: Bed cleaning completion
- → **To Billing**: Room charges (based on bed type, days occupied)

---

## 📅 Module 20: Staff Scheduling Management

**Status**: ❌ Missing (Basic roster exists in HR, advanced scheduling missing)  
**Role Access**: HR Manager, Department Heads, Nurses, Doctors

### **Complete Workflow**:

#### **A. SHIFT MANAGEMENT**

##### **1. Shift Definition**
- **Shift Types**
  - Morning (8 AM - 4 PM)
  - Evening (4 PM - 12 AM)
  - Night (12 AM - 8 AM)
  - Custom shifts (e.g., 10 AM - 6 PM for OPD)
  
- **Shift Duration**
  - 8 hours (standard)
  - 12 hours (for nurses in some setups)
  
- **Shift Breaks**
  - Lunch break (30 min)
  - Tea breaks (15 min × 2)

##### **2. Shift Pattern/Rotation**
- **Rotation Cycle**
  - Weekly rotation (Week 1: Morning, Week 2: Evening, Week 3: Night)
  - Monthly rotation
  - Fixed shifts (some staff prefer permanent night shift)
  
- **Rest Days**
  - After night shift: mandatory rest (1-2 days)
  - Weekly off (1-2 days per week)

#### **B. DOCTOR SCHEDULING**

##### **3. OPD Schedule**
- **Doctor OPD Timings**
  - Dr. A: Monday-Friday, 9 AM - 1 PM
  - Dr. B: Tuesday, Thursday, Saturday, 2 PM - 6 PM
  - Specialist clinics: Specific days/times
  
- **OPD Capacity**
  - Patients per session (e.g., 20 patients in 4-hour slot = 12 min per patient)
  
- **OPD Leaves**
  - Doctor on leave → Block OPD slots, reschedule appointments

##### **4. OT Schedule** (Covered in Module 6 OT Management)
- **Surgery Days**
  - Dr. A: OT on Monday, Wednesday (full day)
  - Dr. B: OT on Tuesday, Friday
  
- **OT Booking**
  - Surgeries booked as per surgeon's OT days

##### **5. IPD Ward Rounds**
- **Ward Visiting Hours**
  - Morning rounds (8-10 AM)
  - Evening rounds (4-6 PM)
  
- **On-Call Duty**
  - Night on-call roster (for emergencies)
  - Weekend on-call

##### **6. Doctor Leave Management**
- **Leave Application** (Covered in Module 13 HR)
  - Doctor applies for leave
  - Find replacement (another doctor covers OPD/OT)
  - Update schedule, inform patients

#### **C. NURSE SCHEDULING**

##### **7. Nurse Roster**
- **Ward Allocation**
  - Assign nurses to specific wards (General Ward, ICU, OT)
  
- **Shift Allocation**
  - Morning: Nurse A, B, C (Ward 1)
  - Evening: Nurse D, E, F (Ward 1)
  - Night: Nurse G, H, I (Ward 1)
  
- **Nurse-to-Patient Ratio**
  - General ward: 1 nurse : 6 patients (day), 1:10 (night)
  - ICU: 1 nurse : 2 patients
  - OT: 2 nurses per OT (scrub nurse + circulating nurse)

##### **8. Nurse Rotation**
- **Rotate Between Wards**
  - Month 1: General Ward
  - Month 2: ICU
  - Month 3: OT
  - Ensures skill diversity, prevents burnout in high-stress areas

##### **9. Special Duty Assignment**
- **Isolation Duty** (for infectious patients)
  - Dedicated nurse
  - Extra precautions
  
- **One-to-One Nursing** (for critical patients)
  - Dedicated nurse for single patient

#### **D. ALLIED HEALTH STAFF SCHEDULING**

##### **10. Optometrist Schedule**
- **OPD Hours**
  - 9 AM - 5 PM (Monday-Saturday)
  - Refraction clinic timings
  
- **Rotation** (if multiple optometrists)
  - Rotate between branches

##### **11. Lab Technician Schedule**
- **Lab Hours**
  - 8 AM - 8 PM (12-hour coverage)
  - 24x7 (for ICU/emergency labs)
  
- **Shift Rotation**
  - Morning, evening, night shifts

##### **12. Pharmacist Schedule**
- **Pharmacy Hours**
  - OPD pharmacy: 9 AM - 6 PM
  - IPD pharmacy: 24x7 coverage
  
- **Shift Rotation**
  - As per pharmacy needs

##### **13. Housekeeping Schedule**
- **Cleaning Shifts**
  - Morning shift: General cleaning (all areas)
  - Evening shift: OPD areas, light cleaning
  - Night shift: IPD floors, ICU
  
- **Deep Cleaning Schedule**
  - OT: After each surgery + weekly deep clean
  - Wards: Daily mopping + weekly deep clean

#### **E. SCHEDULE CREATION**

##### **14. Auto-Scheduling**
- **Input Parameters**
  - Staff list, availability, preferences
  - Shift requirements (how many staff per shift)
  - Leave calendar
  - Constraints (max consecutive night shifts, mandatory rest days)
  
- **Auto-Generate Roster**
  - Algorithm creates optimal schedule
  - Balances workload, ensures coverage
  
- **Manual Adjustments**
  - Manager can override, swap shifts

##### **15. Manual Scheduling**
- **Drag-and-Drop Interface**
  - Calendar view
  - Drag staff to shifts
  - Visual conflicts (if over-assigned or under-assigned)

##### **16. Template-Based Scheduling**
- **Save Template**
  - Create roster for Month 1
  - Save as template
  - Replicate for Month 2 (with minor adjustments)

#### **F. SHIFT SWAPPING & CHANGES**

##### **17. Staff Requests**
- **Shift Swap Request**
  - Nurse A (scheduled for night) wants to swap with Nurse B
  - Send request
  - Nurse B accepts/declines
  - Manager approves
  - Schedule updated
  
- **Leave Request**
  - Staff applies for leave
  - Manager approves
  - Find replacement (assign another staff member)

##### **18. Emergency Changes**
- **Staff Absence** (sick, emergency)
  - Call substitute staff (from on-call pool)
  - Reassign shifts
  - Overtime for existing staff (if no replacement)

##### **19. Overtime Management**
- **Overtime Tracking**
  - Staff works beyond scheduled hours
  - Log overtime hours
  - Overtime pay calculation (1.5x or 2x hourly rate)
  
- **Comp-off**
  - Instead of overtime pay, give compensatory off
  - Staff works extra hours → earns comp-off days

#### **G. SCHEDULE COMMUNICATION**

##### **20. Roster Publication**
- **Publish Schedule**
  - Monthly roster published (1 week before month starts)
  - Staff can view their shifts
  
- **Notifications**
  - Email/SMS: "Your schedule for February is ready"
  - Push notification (mobile app)

##### **21. Schedule Access**
- **Staff Portal**
  - Login to view personal schedule
  - See upcoming shifts (next 7 days, next 30 days)
  - Download as PDF
  
- **Mobile App**
  - View schedule on phone
  - Set reminders (shift starts in 1 hour)

##### **22. Shift Reminders**
- **Automated Reminders**
  - SMS/Email: 24 hours before shift
  - Push notification: 2 hours before shift
  
- **On-Call Alerts**
  - If on-call duty tonight, receive alert

#### **H. ATTENDANCE INTEGRATION**

##### **23. Attendance Marking** (from Module 13 HR)
- **Biometric Punch**
  - Staff punches in/out
  - Compare with schedule (on-time, late, absent)
  
- **Mismatch Alerts**
  - Scheduled but absent → Alert manager
  - Present but not scheduled → Query (extra hours or error?)

##### **24. Attendance vs Schedule Report**
- **Compliance Report**
  - % of shifts attended (target: >95%)
  - Absenteeism rate
  - Late arrivals

#### **I. REPORTING & ANALYTICS**

##### **25. Staff Utilization Report**
- **Hours Worked**
  - Per staff member (monthly)
  - Compare against scheduled hours
  
- **Overtime Report**
  - Total overtime hours (department-wise, staff-wise)
  - Overtime cost

##### **26. Coverage Report**
- **Shift Coverage**
  - All shifts adequately covered (target: 100%)
  - Gaps (shifts with insufficient staff)
  
- **On-Call Coverage**
  - On-call roster compliance

##### **27. Staff Workload Report**
- **Consecutive Shifts**
  - Staff working >5 consecutive days → Fatigue risk
  - Ensure adequate rest
  
- **Night Shift Frequency**
  - Fair rotation (no one staff stuck in night shift always)

##### **28. Absenteeism Report**
- **Absence Trends**
  - Frequent absentees (counseling needed)
  - Seasonal trends (higher sick leave in flu season)

### **Integration Points**:
- ← **From HR Management**: Staff list, leave applications, employment details
- ← **From Attendance Module**: Punch-in/out records
- → **To Payroll**: Overtime hours, shift differentials (night shift allowance)
- → **To Departments**: Staff availability for scheduling appointments, surgeries

---

## 🧪 Module 21: Diagnostics Lab Management

**Status**: 🟡 Partial (Basic lab in Module 14, Diagnostics-specific features missing)  
**Role Access**: Lab Manager, Biochemistry Staff, Pathology Staff, Microbiology Staff

### **Complete Workflow**:

**(Note: This module extends Module 14 Laboratory Management with diagnostics-specific features like pre-op clearance packages, departmental workflow, and advanced reporting)**

#### **A. DIAGNOSTICS DEPARTMENT STRUCTURE**

##### **1. Lab Departments**
- **Hematology**
  - CBC, Hemoglobin, Platelet count, ESR, Bleeding/Clotting time
  
- **Biochemistry**
  - Blood Sugar, RFT, LFT, Lipid Profile, Electrolytes, Enzymes
  
- **Microbiology**
  - Culture & Sensitivity, Gram stain, AFB stain
  
- **Serology/Immunology**
  - HIV, HBsAg, HCV, Thyroid (T3, T4, TSH), Dengue, Malaria
  
- **Clinical Pathology**
  - Urine analysis, Stool analysis, Semen analysis
  
- **Histopathology** (if available)
  - Biopsy, FNAC (Fine Needle Aspiration Cytology)
  
- **Cytology**
  - PAP smear, body fluid cytology

##### **2. Lab Workflow by Department**
- **Sample Reception**
  - Centralized OR department-specific
  
- **Sample Processing**
  - Each department processes own samples
  
- **Result Entry**
  - Department-wise result entry
  
- **Result Approval**
  - Department head/pathologist reviews

#### **B. PRE-OPERATIVE CLEARANCE PACKAGES**

##### **3. Pre-Op Package 1** (Basic - for minor surgery, low-risk patients)
- **Tests Included**:
  - CBC (Complete Blood Count)
  - Blood Sugar (Fasting or Random)
  - ECG (if age > 40 years)
  
- **Price**: ₹800 (package discount vs individual tests)

##### **4. Pre-Op Package 2** (Standard - for cataract surgery, medium-risk)
- **Tests Included**:
  - CBC
  - Blood Sugar (Fasting + Post-Prandial if diabetic)
  - RFT (if diabetic or hypertensive)
  - ECG (age > 40)
  - COVID test (as per protocol)
  
- **Price**: ₹1,500

##### **5. Pre-Op Package 3** (Comprehensive - for major surgery, high-risk patients)
- **Tests Included**:
  - All from Package 2
  - LFT (Liver Function Test)
  - PT/INR (Prothrombin Time - if on blood thinners)
  - Chest X-ray (if age > 50 or respiratory symptoms)
  - Viral markers (HIV, HBsAg, HCV - for major surgeries)
  
- **Price**: ₹3,000

##### **6. Custom Pre-Op Panel**
- **Doctor-Specific Requirements**
  - Doctor can customize (add/remove tests)
  - Example: Add Thyroid profile for specific patient

##### **7. Pre-Op Clearance Workflow**
- **Order Pre-Op Package** (from Counselor or Doctor)
  - Select patient, surgery details
  - Select package (Package 1/2/3 or custom)
  - Order sent to lab
  
- **Sample Collection**
  - Patient comes to lab
  - Collect all samples (blood, ECG)
  - Process same day (priority)
  
- **Results & Clearance**
  - All results compiled
  - Physician reviews (especially ECG, abnormal values)
  - **Clearance Certificate Issued**:
    - "Fit for surgery under local/general anesthesia"
    - OR "Not fit - reason: uncontrolled diabetes, abnormal ECG, etc."
  - Send to surgeon

##### **8. Abnormal Pre-Op Results**
- **Critical Values** (surgery hold)
  - Hemoglobin < 10 g/dL (anemia - may need transfusion or postpone)
  - Blood sugar > 200 mg/dL (uncontrolled diabetes - optimize before surgery)
  - Abnormal ECG (cardiac clearance needed)
  
- **Action**
  - Notify doctor immediately
  - Optimize patient (treat anemia, control sugar, get cardiology clearance)
  - Repeat tests after treatment
  - Reschedule surgery if needed

#### **C. SPECIALIZED DIAGNOSTICS**

##### **9. Diabetic Panel**
- **Tests**:
  - Fasting Blood Sugar (FBS)
  - Post-Prandial Blood Sugar (PPBS)
  - HbA1c (3-month average sugar control)
  - Microalbuminuria (kidney damage screening)
  
- **Price**: ₹1,200
- **Target Patients**: Diabetics (annual screening or before surgery)

##### **10. Lipid Profile**
- **Tests**:
  - Total Cholesterol
  - HDL (good cholesterol)
  - LDL (bad cholesterol)
  - VLDL
  - Triglycerides
  - Cholesterol/HDL ratio
  
- **Price**: ₹600
- **Target**: Cardiovascular risk assessment

##### **11. Thyroid Profile**
- **Tests**:
  - T3, T4, TSH
  
- **Price**: ₹500
- **Target**: Thyroid disorder screening

##### **12. Anemia Profile**
- **Tests**:
  - CBC with peripheral smear
  - Serum Iron, TIBC (Total Iron Binding Capacity), Ferritin
  - Vitamin B12, Folate
  
- **Price**: ₹1,000
- **Target**: Anemia workup

#### **D. STAT/URGENT TESTING**

##### **13. STAT Lab Orders**
- **Definition**: Urgent tests needed within 1 hour
- **Examples**:
  - Emergency surgery patient (CBC, Blood Sugar, PT/INR)
  - Critical patient in ICU (Electrolytes, Blood Gas)
  
- **Workflow**:
  - Order marked as STAT
  - Lab prioritizes (interrupt routine work)
  - Dedicated STAT technician (in large labs)
  - Results within 1 hour (target: 30 min)

##### **14. STAT Reporting**
- **Critical Value Notification**
  - Phone call to doctor (don't wait for report)
  - Example: Potassium 6.5 mEq/L (critical high), Blood sugar 40 mg/dL (critical low)
  
- **Document Notification**
  - Time called, doctor name, acknowledgment

#### **E. EXTERNAL LAB INTEGRATION**

##### **15. Send Out Tests** (Covered in Module 14)
- **Specialized Tests Not Available In-House**:
  - Genetic testing
  - Advanced immunology
  - Molecular diagnostics (PCR)
  
- **Workflow**:
  - Collect sample locally
  - Send to reference lab (courier, cold chain if needed)
  - Track shipment
  - Receive results (upload to patient record)
  - Mark up cost (hospital charges patient more than reference lab cost)

##### **16. Reference Lab Agreements**
- **Partner Labs**
  - SRL, Dr. Lal PathLabs, Thyrocare, etc.
  
- **Pricing Agreement**
  - Negotiated rates (hospital gets discount)
  
- **TAT Agreement**
  - Guaranteed turnaround time

#### **F. LAB ACCREDITATION & QUALITY**

##### **17. NABL Accreditation** (National Accreditation Board for Testing and Calibration Laboratories)
- **Standards Compliance**
  - ISO 15189 (Medical laboratories)
  - Standard Operating Procedures (SOPs) for each test
  - Quality manual
  
- **Periodic Audits**
  - NABL audits (annual surveillance + renewal every 2 years)
  
- **Benefits**
  - Accredited lab reports accepted worldwide
  - Insurance preferred (some insurers require NABL reports)

##### **18. Internal Quality Control** (IQC)
- **Daily QC Samples**
  - Run known samples (normal, high, low) on instrument
  - Results should match expected values (±2 SD)
  - If QC fails, don't report patient results (troubleshoot instrument)
  
- **Levy-Jennings Chart**
  - Plot daily QC values
  - Identify trends (instrument drift, reagent issue)

##### **19. External Quality Assurance** (EQA/EQAS)
- **Proficiency Testing**
  - Quarterly samples from external agency (CAP, CMC Vellore, etc.)
  - Test and report results
  - Compare with other labs (peer comparison)
  - Score (>80% acceptable)
  
- **Corrective Action** (if poor performance)
  - Investigate (instrument, reagent, technique)
  - Retrain staff
  - Re-validate

##### **20. Pre-Analytic, Analytic, Post-Analytic Quality**
- **Pre-Analytic** (70% of errors occur here)
  - Correct sample collection (hemolysis, wrong tube, insufficient volume)
  - Proper labeling
  - Timely transport
  
- **Analytic**
  - Instrument calibration
  - QC compliance
  - Skilled technician
  
- **Post-Analytic**
  - Correct data entry
  - Timely reporting
  - Critical value notification

#### **G. LAB INFORMATION SYSTEM (LIS)**

##### **21. LIS Features**
- **Order Management**
  - Electronic test orders from doctors
  - Barcode generation (for sample tracking)
  
- **Sample Tracking**
  - Scan barcode at each step (collection, received in lab, processing, result entry)
  - Real-time status
  
- **Result Entry**
  - Auto-import from instruments (interfacing)
  - Manual entry (with validation)
  
- **Result Reporting**
  - Auto-generate PDF report
  - Digital signature
  - Send via email, upload to EMR
  
- **Billing Integration**
  - Auto-post charges to billing module

##### **22. Instrument Interfacing**
- **Bi-Directional Interface**
  - LIS → Instrument: Send test orders
  - Instrument → LIS: Send results automatically
  
- **Supported Instruments**
  - Hematology analyzers, Biochemistry analyzers, etc.
  
- **Benefits**
  - Reduce manual entry errors
  - Faster result turnaround

#### **H. REPORTING & ANALYTICS**

##### **23. Lab Performance Metrics**
- **TAT (Turnaround Time)**
  - Sample collection to result (target: <4 hours routine, <1 hour STAT)
  - Track by department, by test
  
- **Test Volume**
  - Tests per day, per month
  - Most requested tests (top 10)
  
- **Sample Rejection Rate**
  - % of samples rejected (target: <2%)
  - Rejection reasons (hemolyzed, clotted, mislabeled)

##### **24. Revenue Reports**
- **Lab Revenue**
  - Test-wise revenue
  - Department-wise revenue (Hematology, Biochemistry, etc.)
  - Outside referrals vs in-patients
  
- **Cost Analysis**
  - Cost per test (reagent + labor + overheads)
  - Profit margin

##### **25. Clinical Utility Reports**
- **Abnormal Results Frequency**
  - % of tests with abnormal values
  - Common abnormalities (anemia, hyperglycemia, etc.)
  
- **Doctor Utilization**
  - Which doctors order most tests
  - Rational vs irrational test ordering

### **Integration Points**:
- ← **From Doctor Desk**: Lab test orders
- ← **From Counselor**: Pre-op package orders
- → **To Doctor Desk**: Lab results
- ← **From Billing**: Payment confirmation
- → **To Billing**: Lab test charges

---

## 📋 Module 22: Discharge Management

**Status**: ❌ Missing (Not implemented)  
**Role Access**: Doctors, IPD Nurses, Billing, Medical Records

### **Complete Workflow**:

#### **A. DISCHARGE PLANNING**

##### **1. Discharge Readiness Assessment**
- **Clinical Criteria**
  - Patient medically stable
  - No fever, infection, complications
  - Vitals stable (BP, pulse, SpO2 normal)
  - Surgical wound healing well (if post-op)
  - Pain controlled
  - Able to eat, drink, walk (if applicable)
  
- **Doctor Approval**
  - Ward round assessment
  - Doctor declares fit for discharge

##### **2. Discharge Date Planning**
- **Expected Discharge Date** (EDD)
  - Set on admission (tentative)
  - Update as patient progresses
  
- **Early Discharge**
  - Patient requests early discharge (Against Medical Advice possible)
  
- **Delayed Discharge**
  - Complications, need more recovery time

#### **B. DISCHARGE ORDERS**

##### **3. Doctor's Discharge Orders**
- **Discharge Summary Creation**
  - Patient details (name, MRN, age, gender, admission ID)
  - Admission date, discharge date
  - Length of stay (total days)
  - Admitting diagnosis
  - Final diagnosis (ICD-10 coded)
  - **Brief History**: Chief complaint, history of present illness
  - **Examination Findings** (on admission): Vitals, systemic examination
  - **Investigations Done**: Lab reports, imaging, ECG (with results)
  - **Treatment Given**:
    - Medications administered (IV antibiotics, pain meds, etc.)
    - Procedures (surgery details, if any)
    - Other interventions
  - **Course in Hospital**: Day-wise progress notes (summarized)
  - **Condition on Discharge**: Improved, cured, stable, LAMA (Left Against Medical Advice)
  
- **Discharge Medications**
  - Drug name, dose, frequency, duration
  - Example:
    - Tab. Moxifloxacin 400mg, 1 tablet daily, 5 days
    - Eye drops Moxifloxacin 0.5%, 1 drop OD (right eye), 4 times daily, 7 days
    - Eye drops Prednisolone 1%, 1 drop OU (both eyes), tapering schedule (6 times × 1 week, 4 times × 1 week, 2 times × 1 week, then stop)
  
- **Discharge Instructions**
  - **Activity**: Bed rest for 2 days, avoid heavy lifting for 1 month, no swimming for 2 weeks
  - **Diet**: Regular diet, diabetic diet if diabetic, avoid spicy food
  - **Wound Care** (if surgical): Keep dressing dry, change dressing on Day 3, watch for signs of infection (redness, swelling, pus, fever)
  - **Eye Care** (for ophthalmic surgery): Wear eye shield at night, avoid rubbing eye, avoid water splashes
  - **Warning Signs** (when to return to ER):
    - High fever (>101°F)
    - Severe pain not relieved by medications
    - Sudden vision loss or severe redness (for eye surgery)
    - Bleeding, pus discharge from wound
    - Difficulty breathing, chest pain
  
- **Follow-up Appointments**
  - Post-op Day 1 (tomorrow) - Doctor review
  - Post-op Week 1 (7 days from surgery)
  - Post-op Month 1 (30 days)
  - Annual review (if chronic condition)
  
- **Fitness to Work Certificate** (if patient employed)
  - Fit to resume work after X days
  - Light duty recommended (if applicable)
  
- **Sick Leave Certificate**
  - Medical leave for X days (as per employer requirement)

##### **4. Discharge Summary Approval**
- **Doctor Reviews and Signs**
  - Digital signature
  - Date, time of discharge
  
- **Junior Doctor Drafts, Senior Approves** (in teaching hospitals)
  - Resident creates summary
  - Consultant reviews and co-signs

#### **C. DISCHARGE CLEARANCES**

##### **5. Billing Clearance**
- **Final Bill Generation** (from Billing Module 11)
  - All IPD charges compiled (room, surgery, meds, investigations)
  - Advance adjusted
  - Insurance adjusted (if applicable)
  - **Balance Due**: ₹X (patient to pay) OR **Refund**: ₹Y (if overpaid)
  
- **Payment Collection**
  - Patient pays balance OR
  - Receives refund
  
- **"No Dues" Certificate**
  - Billing department confirms payment complete
  - Issue clearance

##### **6. Pharmacy Clearance**
- **Discharge Medications Dispensing**
  - Discharge prescription sent to pharmacy
  - Pharmacy prepares medications (pack for 5/7/10 days as per prescription)
  - **Patient Counseling**:
    - Explain each medication (what it's for)
    - How to take (with food, empty stomach, timing)
    - Side effects to watch
    - Eye drop instillation technique (demonstrate)
    - Tapering schedule (for steroids - critical!)
  
- **Medication Reconciliation**
  - Compare admission medications vs discharge medications
  - Ensure critical home medications continued (BP meds, diabetes meds)
  
- **Pharmacy Bill**
  - Add to final bill OR
  - Separate payment (if not included in package)

##### **7. Investigation Reports Clearance**
- **Collect All Reports**
  - Lab reports (blood tests, etc.)
  - Imaging reports (X-ray, CT, MRI)
  - ECG report
  - Pathology report (if biopsy done)
  
- **Hand Over to Patient**
  - Original reports (or certified copies)
  - Patient signs acknowledgment (received all reports)

##### **8. Medical Records Clearance**
- **Discharge Summary Printing**
  - Print 2 copies (1 for patient, 1 for medical records)
  - Patient signature (acknowledgment of receipt)
  
- **Medical Certificates**
  - Fitness certificate, sick leave certificate (if requested)
  - Medical necessity certificate (for insurance)

##### **9. Valuables Return**
- **Patient Belongings**
  - Jewelry, wallet, phone (if kept in hospital safe)
  - Patient signs receipt (acknowledgment of return)

#### **D. DISCHARGE PROCESS**

##### **10. Pre-Discharge Nursing Tasks**
- **Remove Medical Devices**
  - IV line removal (flush, apply pressure, bandage)
  - Urinary catheter removal (if present)
  - NG tube removal (if present)
  - Oxygen discontinue (if on oxygen)
  
- **Vital Signs Check** (final)
  - BP, pulse, temp, SpO2 (ensure stable before discharge)
  
- **Wound Dressing Check**
  - Inspect surgical wound (ensure clean, dry, no signs of infection)
  - Apply fresh dressing (if needed)

##### **11. Patient & Family Education**
- **Verbal Instructions**
  - Go through discharge summary with patient/family
  - Explain medications, activity, diet, follow-up
  - Answer questions
  - Ensure understanding (ask patient to repeat key instructions)
  
- **Written Instructions**
  - Give printed discharge summary
  - Medication list (with schedule)
  - Follow-up appointment slip
  - Emergency contact number (hospital 24x7 number)

##### **12. Discharge from Ward**
- **Update System**
  - Discharge status: Admitted → Discharged
  - Discharge date/time recorded
  - Discharge type (Routine, LAMA, Referred, Death)
  
- **Bed Release** (to Bed Management Module)
  - Mark bed as vacated
  - Trigger housekeeping (for bed cleaning)
  
- **Patient Exit**
  - Escort patient to exit (wheelchair if needed)
  - Arrange transport (hospital ambulance, family car, taxi)

##### **13. Post-Discharge Follow-Up Call** (optional, for quality care)
- **24-Hour Call**
  - Nurse calls patient (next day)
  - Check: Feeling okay? Pain controlled? Any questions about medications?
  - Remind follow-up appointment
  
- **Document Call**
  - Patient condition, any concerns raised

#### **E. SPECIAL DISCHARGE SCENARIOS**

##### **14. Discharge Against Medical Advice (DAMA/LAMA)**
- **Patient Wants to Leave** (despite doctor advising against)
  - Reasons: Financial, family issues, dissatisfaction, other
  
- **Counseling**
  - Doctor explains risks of early discharge
  - Explain potential complications
  - Document counseling in notes
  
- **LAMA Form**
  - Patient signs "Left Against Medical Advice" form
  - Acknowledges risks explained
  - Releases hospital from liability
  - Witness signature
  
- **Discharge Summary**
  - Still provide discharge summary (with LAMA status)
  - Offer follow-up (if patient returns)

##### **15. Death in Hospital**
- **Death Certificate**
  - Doctor certifies death (date, time, cause)
  - Issue death certificate (as per legal requirements)
  
- **Body Handover**
  - Hand over body to family
  - Post-mortem (if suspicious death or legal requirement)
  
- **Final Bill**
  - All charges up to death
  - Settle with family

##### **16. Transfer to Another Hospital**
- **Referral Transfer**
  - Need higher level of care (specialty not available, ICU full, etc.)
  
- **Transfer Summary**
  - Similar to discharge summary (but patient still under treatment)
  - Include: Current condition, treatment given so far, pending investigations, recommendations
  
- **Ambulance Arrangement**
  - Hospital arranges ambulance (basic or advanced life support)
  - Handover to receiving hospital team
  
- **Discharge from Current Hospital**
  - Update status: Transferred
  - Close admission (billing till transfer date)

#### **F. DISCHARGE DOCUMENTATION**

##### **17. Discharge Summary Repository**
- **Store in Medical Records**
  - Electronic copy (in EMR)
  - Physical copy (in patient file)
  
- **Retention Period**
  - Medical records retention: Minimum 5 years (as per MCI guidelines)
  - Permanent retention for medico-legal cases

##### **18. Discharge Summary Format**
- **Standard Template**
  - Hospital-approved format
  - Sections: Patient details, Diagnosis, History, Examination, Investigations, Treatment, Discharge medications, Instructions, Follow-up
  
- **Electronic Discharge Summary**
  - Auto-populate from EMR data
  - Doctor reviews and edits
  - E-sign
  - Email to patient (PDF)

#### **G. DISCHARGE ANALYTICS**

##### **19. Discharge Metrics**
- **Average Length of Stay (ALOS)**
  - Overall: 3.5 days
  - Diagnosis-specific (cataract: 1.5 days, vitrectomy: 4 days)
  - Target: Optimize (reduce unnecessary stays, but don't compromise care)
  
- **Discharge Volume**
  - Discharges per day, per month
  - Bed turnover rate

##### **20. Readmission Rate**
- **30-Day Readmission**
  - Patient discharged, readmitted within 30 days (for same condition or complication)
  - Target: <5%
  - High readmission = quality issue (inadequate treatment, premature discharge, poor patient education)
  
- **Readmission Analysis**
  - Reasons (infection, uncontrolled sugar, medication non-compliance)
  - Corrective actions

##### **21. LAMA Rate**
- **% of Discharges as LAMA**
  - Target: <2%
  - High LAMA = patient dissatisfaction, financial issues, communication gaps
  
- **LAMA Reasons**
  - Financial constraints (most common)
  - Dissatisfaction with care
  - Family pressure
  - Actions: Financial counseling, improved communication

##### **22. Discharge Summary Timeliness**
- **Time to Summary Completion**
  - From discharge to summary signed (target: within 24 hours)
  - Delays: Doctor overload, junior doctor backlog
  
- **Summary Quality Audit**
  - Random audit (check completeness, accuracy)
  - Feedback to doctors

### **Integration Points**:
- ← **From IPD Management**: Patient admission details, daily progress notes
- ← **From Doctor Desk**: Final diagnosis, discharge orders
- ← **From Billing**: Final bill, payment clearance
- ← **From Pharmacy**: Discharge medications dispensed
- ← **From Laboratory**: All investigation reports
- → **To Medical Records**: Discharge summary archival
- → **To Bed Management**: Bed release notification
- → **To Patient**: Discharge summary (email/print), follow-up appointments

---

## 📊 Module 23: Health Records (EMR/EHR)

**Status**: 🟡 Partial (Basic EMR exists across modules, centralized EHR missing)  
**Role Access**: All clinical staff, Medical Records Department, Auditors

### **Complete Workflow**:

#### **A. ELECTRONIC MEDICAL RECORD (EMR)**

##### **1. EMR Definition**
- **Hospital-Centric**: Patient records within single hospital/system
- **Covers**: All clinical encounters, diagnoses, treatments, tests

##### **2. Patient Medical Record Structure**
- **Demographics**
  - Name, MRN, DOB, Age, Gender
  - Contact (phone, email, address)
  - Emergency contact
  - Insurance details
  - Photo ID
  
- **Medical History**
  - **Past Medical History**: Diabetes, Hypertension, Asthma, etc.
  - **Past Surgical History**: Previous surgeries (dates, procedures)
  - **Ocular History** (for ophthalmology):
    - Previous eye surgeries (cataract, LASIK, etc.)
    - Eye trauma history
    - Chronic eye conditions (glaucoma, AMD)
  - **Medication History**: Current medications (ongoing)
  - **Allergy History**: Drug allergies, food allergies (severity, reaction type)
  - **Family History**: Hereditary conditions (glaucoma, diabetes, retinitis pigmentosa)
  - **Social History**: Smoking, alcohol, occupation
  
- **Visit History** (Chronological)
  - All OPD visits (dates, doctors, diagnoses, prescriptions)
  - All IPD admissions (dates, diagnoses, procedures, discharge summaries)
  - Emergency visits
  
- **Diagnoses** (Problem List)
  - Active diagnoses (current conditions)
  - Resolved diagnoses (past conditions)
  - ICD-10 coded
  
- **Medications** (Medication List)
  - Current medications (active)
  - Past medications (discontinued)
  - Drug name, dose, frequency, start date, end date
  
- **Allergies & Alerts**
  - Drug allergies (prominent display - red alert)
  - Other allergies
  - Special alerts (DNR, fall risk, infectious disease)
  
- **Immunizations** (if applicable)
  - Vaccines received (dates)
  
- **Vital Signs** (Trends)
  - BP, Pulse, Weight, BMI (over time)
  - Graphical view (trends)
  
- **Laboratory Results** (All Tests)
  - Chronological list of all lab tests
  - Trend view (Blood Sugar over 6 months)
  - Abnormal values highlighted
  
- **Imaging Results**
  - All radiology, ophthalmology imaging
  - DICOM viewer integration
  - Reports attached
  
- **Clinical Documents**
  - Doctor's notes (SOAP notes)
  - Discharge summaries
  - Operative notes
  - Consultation notes (specialist referrals)
  - Consent forms
  
- **Billing History**
  - All bills, payments (financial record)

##### **3. EMR Access**
- **Role-Based Access**
  - Doctors: Full clinical access (view + edit)
  - Nurses: View clinical + enter vitals, medications
  - Billing: View demographics + billing only
  - Pharmacist: View prescriptions
  - Radiographer: View imaging orders + upload results
  
- **Audit Trail**
  - Log all access (who viewed patient record, when)
  - HIPAA compliance

##### **4. EMR Interoperability** (Within Hospital)
- **Modules Integrated**:
  - Doctor Desk → EMR (clinical notes)
  - Optometry → EMR (refraction data)
  - Pharmacy → EMR (medication dispensing)
  - Lab → EMR (test results)
  - Imaging → EMR (scans, reports)
  - Billing → EMR (financial data)
  
- **Single Patient View**
  - All data aggregated in one EMR interface

#### **B. ELECTRONIC HEALTH RECORD (EHR)**

##### **5. EHR Definition**
- **Longitudinal, Lifetime Record**: Patient's health data across multiple healthcare providers
- **Interoperability**: Shareable between hospitals, clinics, labs, pharmacies

##### **6. EHR vs EMR**
- **EMR**: Hospital-specific (cannot share outside)
- **EHR**: Comprehensive, shareable (across healthcare ecosystem)

##### **7. EHR Features** (if implemented)
- **Health Information Exchange (HIE)**
  - Share patient data with other hospitals (with consent)
  - Receive patient data from referring hospitals
  
- **Continuity of Care Document (CCD)**
  - Standardized summary (demographics, diagnoses, medications, allergies, immunizations)
  - XML format (HL7 CDA standard)
  - Import/export to other EHR systems
  
- **Patient Portal Integration** (Module 39)
  - Patient access to own EHR
  - View records, download reports

##### **8. ABDM Integration** (Ayushman Bharat Digital Mission - India)
- **Health ID** (Unique Health Identifier for each citizen)
  - Link patient MRN to ABDM Health ID
  
- **Upload Records to PHR** (Personal Health Records)
  - Discharge summaries, prescriptions, lab reports
  - Patient can access via ABDM app
  
- **Fetch Records from ABDM**
  - If patient treated elsewhere, fetch previous records (with consent)

#### **C. CLINICAL DOCUMENTATION**

##### **9. SOAP Notes** (Subjective, Objective, Assessment, Plan)
- **Subjective**: Patient complaints (in patient's words)
- **Objective**: Examination findings, vitals, test results
- **Assessment**: Doctor's diagnosis
- **Plan**: Treatment plan (medications, investigations, follow-up)
  
- **Template Support**
  - Quick templates for common conditions (cataract consult template, glaucoma follow-up template)
  
- **Voice-to-Text**
  - Doctor dictates, system transcribes
  - Review and edit

##### **10. Progress Notes** (IPD Daily Notes)
- **Daily Ward Round Notes**
  - Date, time
  - Patient condition (improving, stable, worsening)
  - Vitals, examination
  - Plan for the day
  - Doctor signature

##### **11. Operative Notes** (Surgery Documentation)
- **Pre-Op Note**: Diagnosis, planned procedure, consent
- **Intra-Op Note**:
  - Surgeon name, anesthesiologist, assistants
  - Anesthesia type
  - Procedure performed (step-by-step)
  - Findings (intra-op)
  - Complications (if any)
  - Implants used (IOL details: power, type, manufacturer, lot number)
  - Blood loss (if significant)
  - Duration
  - Surgeon signature
  
- **Post-Op Note**: Immediate post-op condition, orders

##### **12. Consultation Notes** (Specialist Referrals)
- **Referral Request**: Primary doctor refers to specialist
- **Consultant Note**: Specialist's findings, recommendations
- **Reply to Referring Doctor**: Consultant sends note back

##### **13. Nursing Documentation**
- **Nursing Assessment** (on admission)
- **Nursing Care Plan**
- **Nursing Flow Sheets**: Vitals, I/O, medications administered
- **Nursing Notes**: Narrative notes (patient condition, interventions)

#### **D. MEDICAL RECORDS MANAGEMENT**

##### **14. Record Creation**
- **New Patient**: Create medical record on registration
- **Unique MRN**: Master Record Number (never reused, even if patient inactive)

##### **15. Record Maintenance**
- **Update Records**: Add new visits, diagnoses, tests
- **Merge Records** (if duplicates created)
  - Identify duplicates (same name, DOB, phone)
  - Merge into one MRN (preserve all data)
  
- **Correct Errors**
  - Edit capability (with audit trail)
  - Cannot delete (only mark as error + addendum)

##### **16. Record Retrieval**
- **Search Patient**
  - By MRN, name, phone, DOB
  - Fuzzy search (handle typos)
  
- **Quick Access**
  - Recently viewed patients (for doctors)
  - Favorites (mark frequent patients)

##### **17. Record Archival**
- **Active Records**: Patients seen in last 3 years
- **Archived Records**: Patients not seen in >3 years (move to archive storage)
- **Retention Policy**: Minimum 5 years (as per regulations), longer for medico-legal cases

##### **18. Record Destruction** (after retention period)
- **Legal Compliance**: Follow regulations (in India: MCI guidelines, hospital policy)
- **Secure Destruction**: Shred paper, wipe digital media (ensure PHI not recoverable)

#### **E. CLINICAL DECISION SUPPORT**

##### **19. Alerts & Reminders**
- **Drug-Drug Interactions**
  - When doctor prescribes, check against current medications
  - Alert if interaction (e.g., don't prescribe Drug A with Drug B)
  
- **Drug-Allergy Alerts**
  - If patient allergic to Penicillin, alert when prescribing Amoxicillin
  
- **Duplicate Therapy Alerts**
  - Patient already on similar medication (avoid overdose)
  
- **Dose Range Alerts**
  - Pediatric/geriatric dose adjustments
  - Renal dose adjustments (if RFT abnormal)

##### **20. Order Sets** (Pre-defined Order Bundles)
- **Pre-Op Order Set**
  - CBC, Blood Sugar, ECG, Chest X-ray (auto-select all)
  
- **Post-Cataract Surgery Order Set**
  - Standard post-op medications (antibiotic + steroid eye drops, oral pain med)

##### **21. Clinical Guidelines**
- **Embedded Guidelines**
  - Glaucoma treatment algorithm (if IOP > 21, consider treatment)
  - Diabetic Retinopathy screening (annual for diabetics)
  
- **Links to References**
  - AAO (American Academy of Ophthalmology) guidelines, NICE guidelines

#### **F. REPORTING & ANALYTICS**

##### **22. Clinical Reports**
- **Disease Registry**
  - All patients with specific diagnosis (Diabetes, Glaucoma, Cataract)
  - Track prevalence
  
- **Quality Metrics**
  - HbA1c control in diabetics (% patients with HbA1c < 7%)
  - IOP control in glaucoma (% patients with IOP < 18 mmHg)
  
- **Outcome Tracking**
  - Post-cataract surgery visual outcomes (% patients achieving 6/12 or better)

### **Integration Points**:
- ← **From All Clinical Modules**: Patient data, clinical notes, test results
- → **To All Clinical Modules**: Comprehensive patient record access
- → **To Reporting/Analytics**: Clinical data for population health analysis

---

## 💬 Module 24: Communication

**Status**: ❌ Missing (Not implemented)  
**Role Access**: All Staff, Patients

### **Complete Workflow**:

#### **A. INTERNAL MESSAGING**

##### **1. Staff-to-Staff Messaging**
- **Direct Messages**
  - One-on-one chat (Doctor to Nurse, Nurse to Lab Tech)
  - Real-time messaging
  - Read receipts
  
- **Group Chat**
  - Department groups (Ophthalmology team, OT team)
  - Case discussion groups
  
- **Patient-Centric Chat**
  - All providers for a specific patient
  - Discuss care plan, test results
  
- **Message Features**
  - Text, voice notes
  - Attach files (images, PDFs)
  - Mark urgent

##### **2. Announcements**
- **Hospital-Wide Announcements**
  - Admin broadcasts (new policy, holiday notice)
  - All staff receive
  
- **Department Announcements**
  - Department head sends to team

##### **3. Task Assignment**
- **Assign Tasks**
  - Doctor assigns task to nurse: "Check patient in Bed 5, update vitals"
  - Nurse marks as complete
  
- **Task List**
  - My Tasks (pending, completed)
  - Task due dates, priorities

##### **4. Notification Center**
- **Centralized Notifications**
  - Lab result ready (for doctor)
  - Appointment reminder (for front desk)
  - Bill pending (for billing)
  
- **Notification Preferences**
  - Email, SMS, Push notification, In-app
  - Frequency (real-time, daily digest)

#### **B. PATIENT COMMUNICATION**

##### **5. Appointment Reminders** (Automated)
- **SMS Reminder**
  - 24 hours before: "Reminder: Your appointment with Dr. A tomorrow at 10 AM. MRN: 12345"
  - 2 hours before: "Your appointment is in 2 hours. Please arrive 15 min early."
  
- **Email Reminder**
  - Appointment details, doctor name, location
  
- **WhatsApp Reminder** (if opted in)

##### **6. Prescription Delivery Notifications**
- **Pharmacy Ready SMS**
  - "Your medications are ready for pickup at Pharmacy Counter 2."

##### **7. Lab Results Notifications**
- **Result Ready SMS**
  - "Your lab reports are ready. Collect from reception or view online at [link]."

##### **8. Billing Notifications**
- **Bill Generated SMS**
  - "Your bill is ready. Amount: ₹5,000. Pay at billing counter or online."
  
- **Payment Confirmation SMS**
  - "Payment received. Receipt #12345. Thank you!"

##### **9. Follow-Up Reminders**
- **Post-Op Follow-Up SMS**
  - 1 day before follow-up: "Reminder: Post-op review with Dr. A tomorrow at 11 AM."

##### **10. Health Tips & Education** (Optional)
- **Automated Health Tips**
  - Diabetic patients: Weekly tips on diet, exercise, sugar monitoring
  - Post-cataract patients: Eye care tips (avoid rubbing, wear sunglasses)

##### **11. Birthday/Anniversary Wishes** (Optional)
- **Automated Wishes**
  - SMS on patient birthday: "Happy Birthday from [Hospital Name]! Wishing you good health."

#### **C. EMERGENCY COMMUNICATION**

##### **12. Emergency Alerts**
- **Code Blue** (Cardiac Arrest)
  - Alert all emergency team members (doctors, nurses, code blue team)
  - Location (Ward 2, Bed 5)
  
- **Code Red** (Fire)
  - Alert all staff, security
  - Evacuation instructions

##### **13. On-Call Alerts**
- **On-Call Doctor Notification**
  - Emergency patient arrived
  - Urgent consultation needed
  - SMS + Phone call

#### **D. EXTERNAL COMMUNICATION**

##### **14. Referral Communication**
- **Refer Patient to External Specialist**
  - Send referral letter via email/fax
  - Patient info, diagnosis, reason for referral
  
- **Receive Specialist Report**
  - Specialist sends back consultation note
  - Upload to patient EMR

##### **15. Insurance/TPA Communication**
- **Send Pre-Auth Request**
  - Email pre-auth form + documents to TPA
  - Track email delivery
  
- **Receive Approval**
  - TPA sends approval via email
  - Auto-import to system

##### **16. Lab/Vendor Communication**
- **Send Out Lab Samples**
  - Email test request to reference lab
  - Track status
  
- **Purchase Orders to Suppliers**
  - Email PO
  - Receive acknowledgment

#### **E. TELEMEDICINE COMMUNICATION** (If Module 28 Advanced Services includes Telemedicine)

##### **17. Video Consultation**
- **Schedule Video Appointment**
  - Patient books online
  - Receive video link (Zoom, Google Meet, custom platform)
  
- **Video Call**
  - Doctor-patient video consultation
  - Screen sharing (view reports)
  
- **Post-Consult**
  - E-prescription sent via email
  - Follow-up scheduling

##### **18. Tele-Triage**
- **Patient Calls Helpline**
  - Nurse answers, triages
  - Advise: Come to ER, Schedule appointment, Home care instructions

#### **F. COMMUNICATION TEMPLATES**

##### **19. SMS Templates**
- **Pre-defined Templates**
  - Appointment confirmation, reminder, cancellation
  - Billing, payment
  - Lab results ready
  - Follow-up reminder
  
- **Dynamic Variables**
  - {PatientName}, {AppointmentDate}, {DoctorName}, {Amount}
  - Auto-populate from system

##### **20. Email Templates**
- **Professional Email Templates**
  - Appointment details (HTML formatted)
  - Discharge summary (PDF attachment)
  - Health tips newsletters

##### **21. WhatsApp Templates**
- **WhatsApp Business API**
  - Pre-approved templates (as per WhatsApp policy)
  - Rich media (images, PDFs)

#### **G. COMMUNICATION LOG**

##### **22. Audit Trail**
- **Log All Communications**
  - SMS sent (to whom, when, content)
  - Emails sent
  - Calls made (if integrated with phone system)
  
- **Compliance**
  - Patient consent for communications (TCPA compliance)
  - Opt-out mechanism (patient can unsubscribe)

##### **23. Communication Failures**
- **Failed Delivery Tracking**
  - SMS failed (invalid number)
  - Email bounced
  - Retry OR mark patient for manual call

#### **H. COMMUNICATION ANALYTICS**

##### **24. Delivery Reports**
- **SMS Delivery Rate**
  - Total sent, delivered, failed
  - Reasons for failure
  
- **Email Open Rate**
  - % of emails opened by patients
  
- **WhatsApp Read Rate**
  - % of messages read

##### **25. Patient Engagement**
- **Response Rate**
  - Appointment reminders → % patients who confirmed/rescheduled
  - Health tips → % patients who read/clicked

### **Integration Points**:
- ← **From All Modules**: Trigger events (appointment booked → send SMS, lab result ready → send notification)
- → **To Patients**: SMS, Email, WhatsApp, Voice calls
- → **To Staff**: In-app notifications, task assignments

---

## 🧹 Module 25: Housekeeping Management

**Status**: ❌ Missing (Not implemented)  
**Role Access**: Housekeeping Supervisor, Housekeeping Staff, Facility Manager

### **Complete Workflow**:

#### **A. HOUSEKEEPING TASK MANAGEMENT**

##### **1. Routine Cleaning Schedule**
- **Daily Cleaning Tasks**
  - **OPD Areas**: Mopping, dusting, trash removal (after OPD hours)
  - **IPD Wards**: Mopping (twice daily: morning + evening), bathroom cleaning
  - **OT**: Deep cleaning after each surgery, terminal cleaning (end of day)
  - **Common Areas**: Reception, waiting areas, corridors, restrooms (multiple times daily)
  - **Administrative Offices**: Dusting, trash removal (evening)
  
- **Weekly Cleaning Tasks**
  - Deep cleaning (scrubbing floors, windows, high dusting)
  - Specific areas each day (Monday: OT, Tuesday: ICU, etc.)
  
- **Monthly Cleaning Tasks**
  - Intensive cleaning (carpets, upholstery, AC vents)
  - Exterior areas (parking, landscaping)

##### **2. Task Assignment**
- **Auto-Assignment** (based on schedule)
  - Ward 1 → Cleaner A (morning shift)
  - OT → Cleaner B (after each surgery)
  
- **Manual Assignment**
  - Supervisor assigns ad-hoc tasks (spill cleanup, urgent deep clean)

##### **3. Task Execution**
- **Checklist Approach**
  - Cleaner receives task list (on mobile app or printed)
  - Checkbox: Floor mopped, Trash removed, Bathroom cleaned, etc.
  
- **Completion Marking**
  - Cleaner marks task as complete (date, time, signature)
  
- **Supervisor Inspection**
  - Supervisor inspects (spot check)
  - Approve OR send back for rework

##### **4. Ad-Hoc Requests**
- **Request from Staff**
  - Nurse requests: "Spill in Ward 2, Bed 10 - urgent cleanup"
  - System notifies housekeeping
  
- **Priority Levels**
  - Emergency (spill, infectious material): Immediate (< 15 min)
  - Urgent (trash overflow, restroom needs cleaning): < 1 hour
  - Routine: Within shift
  
- **Task Completion Notification**
  - Requester receives notification: "Task completed"

#### **B. BED CLEANING** (Post-Discharge)

##### **5. Bed Cleaning Workflow** (Integrated with Bed Management Module 19)
- **Trigger**: Patient discharged
- **Auto-Notify Housekeeping**
  - Ward, Room, Bed number
  - Isolation patient (infectious): Flag for enhanced cleaning
  
- **Cleaning Checklist**
  - Remove soiled linen (bed sheets, pillowcases)
  - Clean mattress (wipe with disinfectant, check for damage)
  - Clean bed frame, bedside table, over-bed table
  - Clean bathroom (toilet, sink, shower)
  - Mop floor around bed area
  - Replace fresh linen
  - Check equipment (call bell working, oxygen outlet functional, IV pole present)
  
- **Disinfection** (for infectious patients)
  - Use hospital-grade disinfectant (as per infection control protocol)
  - Fogging (if required)
  
- **Completion Marking**
  - Cleaner marks as complete
  - Bed status: Under Maintenance → Available (updated in Bed Management)

#### **C. OT CLEANING** (Integrated with OT Management Module 6)

##### **6. OT Cleaning Levels**
- **Between Surgeries** (Turnover Cleaning)
  - Remove used instruments, drapes
  - Mop floor (wet mop with disinfectant)
  - Wipe surfaces (OT table, equipment)
  - Target time: 15-20 min
  
- **End of Day** (Terminal Cleaning)
  - Deep cleaning (walls, ceilings, lights, AC vents)
  - Disinfect all surfaces
  - Mop floor (double mopping)
  - UV sterilization (if available)
  - Prepare OT for next day
  
- **Weekly Deep Clean**
  - High dusting, equipment cleaning
  - Autoclave cleaning, sterilizer maintenance

##### **7. OT Sterility Verification**
- **Air Quality Monitoring**
  - Settle plates (culture plates left open to check bacterial count)
  - Target: <10 CFU (Colony Forming Units) per plate
  
- **Surface Swabbing**
  - Random swab of OT surfaces, send to microbiology
  - Ensure sterility

#### **D. WASTE MANAGEMENT**

##### **8. Waste Segregation**
- **Biomedical Waste** (as per Biomedical Waste Management Rules)
  - **Yellow Bag**: Infectious waste (soiled dressings, body fluids, pathological waste)
  - **Red Bag**: Contaminated plastics (IV sets, catheters, gloves)
  - **Blue/White Bag**: Glass vials, ampoules, sharps (needles, blades)
  - **Black Bag**: General waste (non-infectious, like paper, food waste)
  
- **Segregation at Source**
  - Color-coded bins in each ward, OT, lab
  - Staff trained to segregate

##### **9. Waste Collection**
- **Collection Rounds**
  - Twice daily (morning, evening) or more if needed
  - Housekeeping collects from all bins
  
- **Temporary Storage**
  - Biomedical waste stored in dedicated area (secured, locked)
  - Separate from general waste

##### **10. Waste Disposal**
- **Biomedical Waste Disposal**
  - Contract with authorized vendor (as per govt regulations)
  - Vendor collects (daily or alternate day)
  - Incineration or other approved methods
  
- **Waste Manifest**
  - Log each disposal (date, quantity, waste type, vendor signature)
  - Regulatory compliance

##### **11. Sharps Disposal**
- **Sharps Containers**
  - Puncture-proof containers (in OT, IPD, OPD)
  - Replace when 3/4 full
  
- **Disposal**
  - Send to biomedical waste vendor (do not overfill)

#### **E. LINEN MANAGEMENT**

##### **12. Linen Inventory**
- **Linen Types**
  - Bed sheets, pillowcases, blankets
  - Patient gowns, OT drapes
  - Towels
  
- **Stock Management**
  - Total stock, in-use, soiled, in-laundry
  - Reorder if stock low

##### **13. Linen Collection**
- **Soiled Linen Collection**
  - Collect from wards (daily)
  - Use separate trolleys (don't mix clean + soiled)
  - Transport to laundry area

##### **14. Laundry Process**
- **In-House Laundry** OR **Outsourced**
  - Wash, disinfect (hospital-grade detergent + disinfectant)
  - High-temperature wash (for infection control)
  - Dry, iron, fold
  
- **Quality Check**
  - Check for stains, tears
  - Discard damaged linen

##### **15. Clean Linen Distribution**
- **Store Clean Linen**
  - Dedicated clean linen storage (separate from soiled)
  - Organized by type
  
- **Distribute to Wards**
  - Supply to each ward (daily or as needed)

#### **F. PEST CONTROL**

##### **16. Pest Control Schedule**
- **Routine Pest Control**
  - Quarterly pest control (entire hospital)
  - Focus areas: Kitchen, waste storage, basements
  
- **Emergency Pest Control**
  - If infestation spotted (rodents, cockroaches, bedbugs)
  - Immediate treatment

##### **17. Pest Control Vendor**
- **Licensed Vendor**
  - Contract with pest control service
  - Use hospital-safe chemicals (non-toxic to patients)
  
- **Documentation**
  - Pest control report (date, areas treated, chemicals used)

#### **G. FACILITY MAINTENANCE** (Overlap with Operations Module 27)

##### **18. Preventive Maintenance**
- **HVAC (Heating, Ventilation, Air Conditioning)**
  - AC filter cleaning (monthly)
  - AC servicing (quarterly)
  
- **Plumbing**
  - Check for leaks, clogs
  - Water quality testing
  
- **Electrical**
  - Check lights, switches, outlets
  - Generator testing (monthly)

##### **19. Breakdown Maintenance**
- **Complaint Logging**
  - Staff reports issue (AC not working in Ward 3)
  - Create ticket
  
- **Technician Assignment**
  - Assign electrician/plumber/HVAC tech
  
- **Resolution**
  - Fix issue
  - Close ticket

#### **H. REPORTING & COMPLIANCE**

##### **20. Housekeeping Reports**
- **Daily Task Completion Report**
  - Tasks assigned, completed, pending
  - Identify delays
  
- **Infection Control Compliance**
  - OT cleaning compliance (100% target)
  - Hand hygiene compliance (observe staff)
  
- **Waste Disposal Report**
  - Biomedical waste quantity (kg per month)
  - Disposal dates, vendor receipts
  
- **Linen Inventory Report**
  - Stock levels, usage, losses (theft, damage)

##### **21. Quality Audits**
- **Cleanliness Audits**
  - Surprise inspections (by infection control team or external auditor)
  - Scoring (cleanliness standards)
  
- **Corrective Actions**
  - If audit fails, identify gaps, retrain staff

### **Integration Points**:
- ← **From Bed Management**: Bed discharge notifications (trigger bed cleaning)
- ← **From OT Management**: Surgery completion (trigger OT cleaning)
- ← **From All Departments**: Ad-hoc cleaning requests
- → **To Bed Management**: Bed cleaning completion (mark bed available)
- → **To Infection Control**: Waste disposal logs, OT sterility reports

---

## 📢 Module 26: Feedback & Surveys

**Status**: ❌ Missing (Not implemented)  
**Role Access**: Quality Team, Admin, Patients

### **Complete Workflow**:

#### **A. PATIENT FEEDBACK COLLECTION**

##### **1. Feedback Channels**
- **Post-Visit Feedback** (OPD)
  - SMS with feedback link (after consultation)
  - QR code at exit (scan & rate)
  
- **Post-Discharge Feedback** (IPD)
  - Email survey (1-2 days after discharge)
  - Phone call (quality team calls patient)
  
- **Feedback Kiosk**
  - Tablet/touchscreen at reception
  - Rate experience before leaving

##### **2. Feedback Form**
- **Rating Scale** (1-5 stars or 1-10)
  - Overall experience
  - Doctor rating (knowledge, communication, time spent)
  - Nurse rating (care, responsiveness)
  - Front desk rating (courtesy, wait time)
  - Facility rating (cleanliness, comfort)
  - Billing rating (transparency, ease)
  
- **Open-Ended Questions**
  - What did you like most?
  - What can we improve?
  - Any specific complaints?
  
- **NPS (Net Promoter Score)**
  - "How likely are you to recommend our hospital to friends/family?" (0-10)
  - Promoters (9-10), Passives (7-8), Detractors (0-6)

##### **3. Feedback Submission**
- **Anonymous OR Identified**
  - Option to provide name/contact OR anonymous
  
- **Incentive** (optional)
  - Discount on next visit, gift voucher (to encourage feedback)

#### **B. FEEDBACK MANAGEMENT**

##### **4. Feedback Collection**
- **Auto-Collect**
  - All feedback stored in system
  - Tagged with patient MRN (if identified), date, department, doctor
  
- **Real-Time Alerts**
  - If feedback rating < 3 (negative): Alert quality team + department head

##### **5. Feedback Review**
- **Quality Team Reviews**
  - Daily review of feedback (especially negative)
  
- **Categorization**
  - Positive (rating > 4)
  - Neutral (rating 3-4)
  - Negative (rating < 3)
  
- **Tagging**
  - Issue categories (long wait time, rude staff, billing dispute, cleanliness issue)

##### **6. Complaint Resolution**
- **Negative Feedback Handling**
  - Contact patient (if contact provided)
  - Apologize, investigate
  - Resolve issue (refund, free consultation, etc.)
  - Document resolution
  
- **Escalation**
  - Severe complaints → escalate to management
  - Medico-legal issues → involve legal team

##### **7. Positive Feedback Recognition**
- **Appreciate Staff**
  - Doctor/Nurse received excellent rating → send appreciation email
  - Monthly awards (Best Doctor, Best Nurse based on feedback)
  
- **Testimonials**
  - With patient permission, use positive feedback as testimonials (website, marketing)

#### **C. SURVEYS**

##### **8. Patient Satisfaction Surveys**
- **HCAHPS** (Hospital Consumer Assessment of Healthcare Providers and Systems) - US standard
- **Custom Surveys** (adapted for India)
  - Doctor communication
  - Nurse communication
  - Hospital cleanliness
  - Quietness
  - Discharge instructions
  - Overall rating

##### **9. Employee Satisfaction Surveys**
- **Annual Survey**
  - Job satisfaction
  - Work-life balance
  - Management support
  - Career growth opportunities
  
- **Anonymous**
  - Encourage honest feedback
  
- **Action Plan**
  - Analyze results, identify issues (high turnover department, low morale)
  - Implement improvements

##### **10. Vendor/Supplier Surveys**
- **Vendor Performance Rating**
  - Quality of supplies
  - Delivery timeliness
  - Pricing, service
  
- **Annual Evaluation**
  - Decide whether to continue contract

#### **D. FEEDBACK ANALYTICS**

##### **11. Feedback Dashboard**
- **Overall Satisfaction Score**
  - Average rating (target: > 4.5 out of 5)
  
- **Trend Analysis**
  - Monthly trends (improving or declining?)
  - Compare departments (Ophthalmology vs General Medicine)
  
- **Doctor-Wise Ratings**
  - Identify top performers, underperformers
  - Coaching for low-rated doctors

##### **12. NPS Calculation**
- **Net Promoter Score**
  - % Promoters - % Detractors = NPS (-100 to +100)
  - NPS > 50: Excellent
  - NPS 0-50: Good
  - NPS < 0: Needs improvement

##### **13. Word Cloud** (from Open-Ended Responses)
- **Common Themes**
  - Positive: "excellent doctor", "caring staff", "clean hospital"
  - Negative: "long wait", "expensive", "rude receptionist"

##### **14. Issue Frequency Analysis**
- **Top 5 Complaints**
  - Long wait time (40%)
  - Billing issues (20%)
  - Parking problems (15%)
  - Cleanliness (10%)
  - Staff behavior (10%)
  
- **Root Cause Analysis**
  - Long wait: Overbooking? Doctor delays? Inefficient process?
  - Action: Improve appointment scheduling, add more doctors

##### **15. Benchmarking**
- **Compare with Industry Standards**
  - National average patient satisfaction: 75%
  - Our hospital: 82% (performing well)
  
- **Compare Branches**
  - Branch A: 85%, Branch B: 78% (investigate why B is lower)

#### **E. QUALITY IMPROVEMENT**

##### **16. Quality Improvement Projects**
- **Based on Feedback**
  - Issue identified: Long OPD wait time
  - Project: Implement queue management, optimize scheduling
  - Measure: Wait time reduced from 60 min to 30 min
  - Patient satisfaction improved

##### **17. Continuous Monitoring**
- **Track Improvements**
  - After implementing changes, monitor feedback
  - Verify improvement (wait time complaints reduced?)

#### **F. REPORTING**

##### **18. Monthly Feedback Report**
- **Executive Summary**
  - Overall satisfaction score
  - NPS
  - Top complaints, top compliments
  - Improvement actions taken
  
- **Distribution**
  - To senior management, department heads

##### **19. Public Reporting** (optional)
- **Publish Ratings**
  - Website, Google reviews
  - Transparency (builds trust)

### **Integration Points**:
- ← **From All Modules**: Trigger feedback requests (after consultation, discharge, billing)
- → **To Quality Team**: Feedback alerts, complaints
- → **To Staff**: Positive feedback recognition
- → **To Management**: Quality improvement reports

---

## ⚙️ Module 27: Operations

**Status**: 🟡 Partial (Some operational features exist across modules)  
**Role Access**: Operations Manager, Admin, IT, Facility Manager

### **Complete Workflow**:

#### **A. FACILITY OPERATIONS** (Extends Housekeeping Module 25)

##### **1. Building Maintenance**
- **Preventive Maintenance Schedule**
  - HVAC systems (monthly servicing)
  - Elevators (quarterly inspection)
  - Fire safety equipment (annual certification)
  - Electrical panels, UPS, generators (monthly checks)
  - Plumbing (leak checks, water quality)
  
- **Maintenance Contracts**
  - AMC (Annual Maintenance Contract) with vendors
  - Track contract expiry, renewal

##### **2. Asset Management**
- **Hospital Assets**
  - Medical equipment (phaco machines, OCT, microscopes, ventilators)
  - IT equipment (servers, computers, printers)
  - Furniture (beds, chairs, tables)
  - Vehicles (ambulances, staff transport)
  
- **Asset Tagging**
  - Unique asset ID (barcode/RFID)
  - Asset register (purchase date, warranty, location, custodian)
  
- **Asset Tracking**
  - Track location (prevent loss/theft)
  - Transfer between departments (log movement)
  
- **Depreciation Tracking**
  - Calculate depreciation (accounting)

##### **3. Equipment Maintenance** (Extends Lab Module 14 Instrument Management)
- **Medical Equipment Calibration**
  - Annual calibration (as per manufacturer specs)
  - Calibration certificate
  
- **Preventive Maintenance**
  - As per schedule (monthly, quarterly, annual)
  - Service logs
  
- **Breakdown Maintenance**
  - Log complaint, assign technician
  - Downtime tracking (equipment unavailable)
  - Repair OR replace

##### **4. Utility Management**
- **Electricity**
  - Monitor consumption (kWh per month)
  - Target: Reduce by X% (energy efficiency initiatives)
  
- **Water**
  - Water consumption tracking
  - Water quality testing (potable water)
  
- **Generator Management**
  - Backup power (for critical areas: OT, ICU)
  - Diesel stock, consumption
  - Monthly load testing

##### **5. Fire Safety & Disaster Preparedness**
- **Fire Safety**
  - Fire extinguishers (check monthly, refill annually)
  - Fire alarms, smoke detectors (test quarterly)
  - Fire drills (semi-annual)
  - Fire exits (clear, marked)
  
- **Disaster Plan**
  - Earthquake, flood, epidemic preparedness
  - Evacuation plan
  - Emergency supplies (water, food, medical supplies for 72 hours)

#### **B. AMBULANCE OPERATIONS**

##### **6. Ambulance Fleet**
- **Fleet Details**
  - Vehicle number, type (Basic Life Support, Advanced Life Support)
  - Driver assigned
  - Medical equipment onboard (oxygen, defibrillator, stretcher)
  
- **Availability Tracking**
  - Real-time status (Available, On Duty, Under Maintenance)

##### **7. Ambulance Booking**
- **Request Ambulance**
  - From (hospital to patient home for pickup OR patient home to hospital)
  - To (destination)
  - Urgency (Emergency, Scheduled transfer)
  
- **Dispatch**
  - Assign nearest available ambulance
  - Notify driver, paramedic
  
- **Trip Tracking**
  - GPS tracking (real-time location)
  - Trip log (start time, end time, distance, patient details)

##### **8. Ambulance Charges**
- **Billing**
  - Base charge + per km charge
  - Emergency surcharge (if applicable)
  - Add to patient bill

##### **9. Ambulance Maintenance**
- **Vehicle Maintenance**
  - Regular servicing (as per km or schedule)
  - Insurance, permits (up to date)
  
- **Medical Equipment Check**
  - Oxygen cylinders (check level, refill)
  - Defibrillator (battery check, test)

#### **C. SECURITY OPERATIONS**

##### **10. Access Control**
- **Entry/Exit Management**
  - Main gate, side gates
  - Visitor log (name, purpose, whom to meet, in-time, out-time)
  
- **Restricted Areas**
  - OT, ICU, Pharmacy, Server Room (access card required)
  - Log access (who entered, when)

##### **11. CCTV Surveillance**
- **Camera Coverage**
  - All entry/exit points, corridors, parking, critical areas
  - 24x7 recording
  
- **Monitoring**
  - Security room monitors live feeds
  
- **Incident Review**
  - In case of theft, vandalism: Review footage

##### **12. Security Personnel**
- **Guard Deployment**
  - Main gate, ER entrance, IPD floors, parking
  - Shift-wise roster
  
- **Patrol Rounds**
  - Hourly rounds (check all areas)
  - Log patrol (time, location, observations)

##### **13. Incident Management**
- **Security Incidents**
  - Theft, assault, trespassing, medical emergency (patient collapse in public area)
  
- **Incident Logging**
  - Incident report (date, time, location, description, action taken)
  
- **Escalation**
  - Serious incidents → inform police, hospital management

#### **D. PARKING MANAGEMENT**

##### **14. Parking Allocation**
- **Parking Zones**
  - Staff parking (separate area)
  - Patient/Visitor parking
  - Ambulance parking (near ER)
  - VIP parking
  
- **Parking Slots**
  - Total slots, available, occupied
  - Real-time display (at entrance)

##### **15. Parking Charges** (if applicable)
- **Hourly Charges**
  - First hour free, ₹20/hour after
  - Daily maximum cap
  
- **Payment**
  - Pay at exit (cash, card, UPI)
  
- **Validation**
  - Patient/visitor: Free parking (with appointment slip)
  - Staff: Parking pass (no charge)

#### **E. TRANSPORT OPERATIONS** (Staff Transport)

##### **16. Staff Transport**
- **Shuttle Service**
  - For staff (especially night shift nurses)
  - Fixed routes, timings
  
- **Transport Schedule**
  - Morning shift pickup, evening shift drop

#### **F. CANTEEN/CAFETERIA OPERATIONS**

##### **17. Canteen Management**
- **Menu**
  - Daily menu (breakfast, lunch, dinner, snacks)
  - Subsidized rates for staff
  
- **Hygiene Standards**
  - Food safety compliance
  - Regular inspections (health department)
  
- **Feedback**
  - Staff/patient feedback on food quality

#### **G. OPERATIONS REPORTING**

##### **18. Operational KPIs**
- **Uptime**
  - Equipment uptime (% time operational, target: >95%)
  - Elevator uptime, HVAC uptime
  
- **Response Time**
  - Maintenance request to resolution time (target: <4 hours for urgent)
  
- **Utility Costs**
  - Electricity, water costs per month
  - Track trends, optimize
  
- **Ambulance Utilization**
  - Trips per ambulance per month
  - Revenue vs cost

##### **19. Incident Reports**
- **Security Incidents**: Count, type, resolution
- **Safety Incidents**: Fires, equipment failures
- **Patient Safety Events**: Falls, medication errors (overlap with Quality/NABH)

### **Integration Points**:
- ← **From All Modules**: Maintenance requests, incident reports
- → **To Finance**: Utility costs, maintenance expenses
- → **To Housekeeping**: Facility maintenance coordination
- → **To Bed Management**: Bed availability (if maintenance affects rooms)

---

## 🚀 Module 28: Advanced Services

**Status**: ❌ Missing (Not implemented)  
**Role Access**: Specialized staff based on service type

### **Complete Workflow**:

#### **A. TELEMEDICINE**

##### **1. Telemedicine Setup**
- **Platform**
  - Video conferencing (Zoom, Google Meet, or proprietary platform)
  - HIPAA-compliant (encrypted, secure)
  
- **Doctor Enrollment**
  - Doctors opt-in for tele-consults
  - Set availability (tele-consult slots)

##### **2. Patient Booking**
- **Online Booking**
  - Patient books tele-consult via website/app
  - Select doctor, date, time
  - Payment (advance payment for tele-consult)
  
- **Appointment Confirmation**
  - Email/SMS with video link

##### **3. Tele-Consultation**
- **Pre-Consult**
  - Patient uploads reports (if any) via portal
  - Doctor reviews prior to call
  
- **Video Consultation**
  - Doctor-patient video call
  - Screen sharing (view reports together)
  - Diagnosis, advice
  
- **E-Prescription**
  - Doctor generates prescription (in system)
  - Send via email/SMS
  
- **Follow-Up**
  - Schedule in-person visit (if needed) OR next tele-consult

##### **4. Tele-Triage**
- **Helpline**
  - Patient calls hospital helpline
  - Nurse answers, triages (emergency → come to ER, non-urgent → schedule appointment, home care → advise)

##### **5. Remote Monitoring** (for chronic patients)
- **Patient Uploads Vitals**
  - Diabetic patient uploads blood sugar readings (daily)
  - Glaucoma patient uploads IOP (if self-tonometer available)
  
- **Doctor Reviews**
  - Weekly review of data
  - Adjust medications remotely (if needed)
  - Alert if values concerning

##### **6. Tele-Radiology** (if applicable)
- **Remote Reporting**
  - Scans taken at hospital, sent to radiologist (in another city/country)
  - Radiologist reports remotely
  - Report sent back (faster turnaround)

#### **B. HOME HEALTHCARE**

##### **7. Home Visit Services**
- **Services Offered**
  - Post-operative home care (nurse visits for dressing change, medication administration)
  - Elderly care (regular vitals check, medication management)
  - Sample collection at home (blood tests)
  
- **Booking**
  - Patient requests home visit (via call, website)
  - Schedule nurse/phlebotomist
  
- **Home Visit**
  - Nurse/tech visits patient home
  - Provide care, collect samples
  - Document in system
  
- **Charges**
  - Service fee + travel charges

##### **8. Home ICU** (Advanced)
- **Critical Care at Home**
  - For terminally ill patients (prefer home over hospital)
  - Setup: Hospital bed, oxygen, monitoring equipment
  - Nurse (24x7 or shift-wise)
  - Doctor visits (daily or as needed)

#### **C. PREVENTIVE HEALTH CHECKUPS**

##### **9. Health Checkup Packages**
- **Basic Health Checkup**
  - CBC, Blood Sugar, Lipid Profile, ECG
  - Price: ₹1,500
  
- **Comprehensive Health Checkup**
  - All from Basic + RFT, LFT, Thyroid, Chest X-ray, Ultrasound Abdomen
  - Doctor consultation (review results)
  - Price: ₹5,000
  
- **Executive Health Checkup**
  - All from Comprehensive + Stress Test, 2D Echo, Ophthalmology exam (fundus, IOP)
  - Dietician consultation
  - Price: ₹10,000

##### **10. Corporate Health Checkups**
- **Tie-Ups with Companies**
  - Annual health checkup for employees
  - Discounted rates (bulk)
  
- **Onsite Camps**
  - Mobile health unit visits company
  - Conduct checkups onsite

##### **11. Wellness Programs**
- **Diabetes Management Program**
  - 3-month program (doctor, dietician, exercise coach)
  - Regular monitoring, lifestyle modification
  
- **Weight Loss Program**
  - Diet, exercise, counseling

#### **D. MEDICAL TOURISM** (if applicable)

##### **12. International Patient Services**
- **Visa Assistance**
  - Help with medical visa application
  
- **Travel Arrangements**
  - Airport pickup, hotel booking
  
- **Language Support**
  - Interpreters (if needed)
  
- **Treatment Package**
  - All-inclusive (surgery, stay, follow-up)
  - International pricing

##### **13. Medical Tourism Coordinator**
- **Dedicated Coordinator**
  - Single point of contact for international patient
  - Handle all logistics

#### **E. REHABILITATION SERVICES**

##### **14. Physiotherapy** (if applicable - limited in pure eye hospital)
- For general hospital: Post-op physiotherapy
  
##### **15. Low Vision Rehabilitation** (for eye hospital)
- **Services**
  - Low vision aids (magnifiers, telescopes)
  - Vision training (maximize remaining vision)
  - Occupational therapy (adapt to vision loss)
  
- **Low Vision Clinic**
  - Specialized clinic (once/twice a week)
  - Low vision specialist

#### **F. RESEARCH & CLINICAL TRIALS**

##### **16. Clinical Trials**
- **Trial Enrollment**
  - Patients enrolled in trials (new drugs, procedures)
  - IRB (Institutional Review Board) approval
  - Informed consent
  
- **Data Collection**
  - Standardized data collection (trial protocol)
  - Monitoring, reporting
  
- **Trial Management**
  - Track enrolled patients, visits, outcomes

##### **17. Research Projects**
- **Academic Research**
  - Doctors conduct research (publish papers)
  - Data extraction from EMR (de-identified)

#### **G. SPECIALTY CLINICS** (Advanced Sub-Specialty Services)

##### **18. Retina Clinic**
- **Services**
  - Medical retina (diabetic retinopathy, AMD)
  - Surgical retina (vitrectomy, retinal detachment surgery)
  - Intravitreal injections (anti-VEGF)
  
- **Advanced Equipment**
  - Fundus camera, OCT, FFA (Fundus Fluorescein Angiography)
  - Vitrectomy machine, laser

##### **19. Glaucoma Clinic**
- **Services**
  - Glaucoma diagnosis (IOP, VF, OCT RNFL)
  - Medical management (eye drops)
  - Surgical management (trabeculectomy, tube shunt, laser)

##### **20. Cornea & Refractive Surgery Clinic**
- **Services**
  - LASIK, PRK, SMILE (refractive surgery)
  - Corneal transplant (keratoplasty)
  - Cross-linking (for keratoconus)

##### **21. Pediatric Ophthalmology & Strabismus**
- **Services**
  - Pediatric eye exams
  - Strabismus surgery (squint correction)
  - Amblyopia treatment (patching)

##### **22. Oculoplasty**
- **Services**
  - Eyelid surgery (ptosis, ectropion, entropion)
  - Orbital surgery (fracture repair, tumor removal)
  - Tear duct surgery (DCR)

##### **23. Neuro-Ophthalmology**
- **Services**
  - Optic nerve disorders
  - Visual pathway lesions
  - Coordination with neurologist

### **Integration Points**:
- ← **From Doctor Desk**: Referrals to specialty clinics
- ← **From Patients**: Telemedicine bookings, health checkup bookings
- → **To Billing**: Service charges
- → **To EMR**: Tele-consult notes, trial data

---

## 📂 Module 29: Medical Record Management

**Status**: 🟡 Partial (Digital records exist in Module 23 EMR, physical records management missing)  
**Role Access**: Medical Records Staff, Doctors, Auditors

### **Complete Workflow**:

**(Note: This module extends Module 23 Health Records with focus on document management, archival, retrieval)**

#### **A. PHYSICAL MEDICAL RECORDS** (Paper-Based)

##### **1. Medical Record File Creation**
- **New Patient**
  - Create paper file (folder)
  - MRN on cover
  - Alphabetical/numerical filing
  
- **File Contents**
  - Registration form
  - Consent forms
  - Doctor's notes
  - Lab reports (original/copies)
  - Imaging reports
  - Prescription copies
  - Discharge summaries

##### **2. File Storage**
- **Active Files** (patients seen in last 2 years)
  - Easily accessible (shelves in medical records room)
  - Organized by MRN
  
- **Semi-Active Files** (2-5 years)
  - Stored in archive room
  
- **Inactive Files** (>5 years)
  - Deep archive (off-site storage OR dedicated archive area)

##### **3. File Retrieval**
- **Request for File**
  - Doctor/billing/audit needs file
  - Request via system (MRN)
  
- **Locate File**
  - Medical records staff locates (barcode scan if available)
  
- **Issue File**
  - Log: File issued to (doctor name), date, purpose
  
- **Return File**
  - Doctor returns after use
  - Log return
  - Re-file

##### **4. File Tracking**
- **Out-Slip System**
  - When file removed, insert "Out" slip (mentions who took, when)
  - Helps locate missing files

##### **5. Missing Files**
- **Search Protocol**
  - Check all recent users
  - Search common locations (doctor desks, billing)
  
- **Declare Lost**
  - If not found after X days
  - Recreate from digital copies (if available)

#### **B. DIGITAL MEDICAL RECORDS** (Covered in Module 23 EMR)

##### **6. Document Scanning**
- **Scan Paper Documents**
  - Old paper records (for patients converting to digital)
  - New paper forms (consent, referral letters)
  
- **Index Scanning**
  - Tag scanned documents (patient MRN, document type, date)
  
- **OCR** (Optical Character Recognition)
  - Convert scanned images to searchable text (optional)

##### **7. Document Management System (DMS)**
- **Features**
  - Upload, store, retrieve documents
  - Version control (if document updated)
  - Access control (who can view)
  
- **Document Types**
  - Lab reports, imaging reports, discharge summaries, consent forms, insurance documents

##### **8. PACS Integration** (Picture Archiving and Communication System)
- **Imaging Storage**
  - All radiology, ophthalmology imaging (OCT, fundus, X-ray, CT, MRI)
  - DICOM format (standard for medical imaging)
  
- **PACS Viewer**
  - Integrated with EMR
  - Doctors view images in EMR (no separate login)

##### **9. E-Signature**
- **Digital Signature**
  - Doctors e-sign documents (discharge summaries, consents, prescriptions)
  - Legally valid (as per IT Act)
  - Timestamp, audit trail

#### **C. MEDICAL RECORD COMPLETION**

##### **10. Incomplete Records Tracking**
- **Deficiency List**
  - Records missing signatures, dates, diagnoses
  - Example: Discharge summary drafted but not signed
  
- **Notify Doctor**
  - Email/notification: "You have 5 pending signatures"
  
- **Deadline**
  - Complete within 7 days (as per hospital policy)

##### **11. Suspension of Privileges** (if non-compliance)
- **Persistent Non-Compliance**
  - Doctor repeatedly doesn't complete records
  - Suspend OPD/OT privileges (until records completed)

#### **D. MEDICAL RECORD CODING**

##### **12. ICD-10 Coding** (Diagnosis Coding)
- **Coder Reviews Discharge Summary**
  - Extracts all diagnoses
  - Assigns ICD-10 codes
  
- **Principal Diagnosis**
  - Main reason for admission
  
- **Secondary Diagnoses**
  - Comorbidities, complications

##### **13. CPT Coding** (Procedure Coding)
- **Coder Reviews Operative Notes**
  - Extracts all procedures
  - Assigns CPT codes
  
- **Billing**
  - Codes used for insurance billing

##### **14. Coding Quality**
- **Coding Accuracy**
  - Audit coding (random sample)
  - Ensure correct codes (impacts billing, statistics)
  
- **Coder Training**
  - Regular updates (ICD-10 revisions)

#### **E. MEDICAL RECORD AUDITS**

##### **15. Internal Audits**
- **Completeness Audit**
  - All required fields filled (diagnosis, signature, date)
  - Target: 95% completeness
  
- **Accuracy Audit**
  - Information consistent (diagnosis matches treatment)
  
- **Timeliness Audit**
  - Discharge summary completed within 24 hours

##### **16. External Audits**
- **NABH Audit** (Module 34)
  - Check medical record standards
  
- **Insurance Audit**
  - TPA audits records (verify claims)
  
- **Legal Audit**
  - Medico-legal cases (court-ordered review)

#### **F. RELEASE OF INFORMATION**

##### **17. Patient Request**
- **Patient Requests Own Records**
  - Right to medical records (legal)
  - Patient fills request form, pays copying charges
  - Issue certified copies (within 72 hours as per law)

##### **18. Third-Party Request**
- **Insurance Company**
  - Patient authorization required (consent form)
  - Release only relevant documents
  
- **Legal/Court Request**
  - Subpoena, court order
  - Legal review before release

##### **19. Employer Request** (Fitness Certificate)
- **Patient Authorization Required**
  - Release only fitness info (not detailed medical history)

#### **G. MEDICAL RECORD RETENTION & DESTRUCTION**

##### **20. Retention Policy**
- **Minimum Retention**
  - 5 years (as per MCI guidelines, India)
  - Longer for minors (till adulthood + 5 years)
  - Permanent for medico-legal cases
  
- **Storage Media**
  - Paper (physical storage) OR digital (servers, cloud)

##### **21. Archival**
- **Microfilm/Microfiche** (old method)
  - Scan old records to microfilm (space-saving)
  
- **Digital Archive**
  - Scan to PDF, store on servers
  - Backup (cloud storage)

##### **22. Destruction**
- **Post-Retention Destruction**
  - After retention period (5+ years), destroy
  
- **Destruction Method**
  - Paper: Shredding (cross-cut shredder)
  - Digital: Secure wipe (DOD 5220.22-M standard)
  
- **Destruction Log**
  - Document what was destroyed, when, by whom

#### **H. MEDICAL RECORD SECURITY**

##### **23. Physical Security**
- **Locked Storage**
  - Medical records room locked (authorized access only)
  
- **Access Log**
  - Log who entered, when

##### **24. Digital Security** (Covered in Module 40 Security)
- **Encryption**
  - Data encrypted at rest, in transit
  
- **Access Control**
  - Role-based (doctors see clinical, billing sees financial)
  
- **Audit Trail**
  - Log all access (who viewed, edited, printed records)

#### **I. REPORTING**

##### **25. Medical Records Reports**
- **Record Completion Rate**
  - % of records completed within deadline (target: >95%)
  
- **Coding Accuracy**
  - % of codes correct on audit
  
- **Retrieval Time**
  - Average time to locate & deliver file (target: <15 min)
  
- **Storage Utilization**
  - Shelf space used, remaining capacity

### **Integration Points**:
- ← **From All Clinical Modules**: Medical documents (notes, reports, consents)
- → **To Billing**: Coded diagnoses, procedures (for billing)
- → **To Insurance**: Medical records (for claims)
- → **To Legal**: Medical records (for court cases)
- → **To Patients**: Copies of medical records (on request)

---

## 🗂️ Module 30: Patient Directory Hub

**Status**: ❌ Missing (Not implemented)  
**Role Access**: All clinical staff, Front desk

### **Complete Workflow**:

**(Note: This is a comprehensive, single-page view of patient with 12+ tabs aggregating all patient data)**

#### **A. PATIENT DIRECTORY STRUCTURE**

##### **1. Patient Search & Selection**
- **Quick Search Bar**
  - Search by MRN, Name, Phone, DOB
  - Autocomplete suggestions
  
- **Advanced Search**
  - Filter by: Age, Gender, City, Diagnosis, Last visit date
  
- **Recent Patients** (for doctors)
  - Last 10 patients seen

##### **2. Patient Summary Header** (Always Visible)
- **Patient Photo**
- **Demographics**: Name, MRN, Age, Gender, DOB, Phone, Email
- **Alerts**: Allergies (red flag), Infectious disease (yellow flag), VIP (star)
- **Active Diagnoses**: Diabetes, Hypertension, Glaucoma (chips/badges)
- **Last Visit**: Date of last OPD visit
- **Quick Actions**: Book Appointment, Create Bill, View Full Record

#### **B. 12+ TABS** (Comprehensive Patient View)

##### **Tab 1: Overview/Summary**
- **At-a-Glance**
  - Active diagnoses (problem list)
  - Current medications (active prescriptions)
  - Recent vitals (last BP, weight, IOP)
  - Upcoming appointments
  - Outstanding bills
  - Recent documents (last 3 discharge summaries, reports)

##### **Tab 2: Demographics & Contact**
- **Personal Details**
  - Full name, MRN, DOB, Age, Gender
  - Marital status, Occupation, Education
  - Nationality, Language preference
  
- **Contact Information**
  - Phone (primary, secondary)
  - Email
  - Address (current, permanent)
  - Emergency contact (name, relation, phone)
  
- **Identity Documents**
  - Aadhar, PAN, Passport (scanned copies)
  - Photo ID
  
- **Insurance Details**
  - Insurance company, Policy number, Validity
  - TPA, Employee ID (if corporate)

##### **Tab 3: Medical History**
- **Past Medical History**
  - Systemic conditions (Diabetes, Hypertension, Asthma, etc.)
  - Onset date, status (active, resolved)
  
- **Past Surgical History**
  - All surgeries (date, procedure, hospital, surgeon)
  - Ocular surgeries (cataract, LASIK, etc.)
  
- **Ocular History**
  - Chronic eye conditions (glaucoma, AMD)
  - Eye trauma history
  
- **Family History**
  - Hereditary conditions (glaucoma, diabetes, retinitis pigmentosa)
  - Family tree (if detailed)
  
- **Social History**
  - Smoking (packs per day, years)
  - Alcohol consumption
  - Occupation (occupational hazards?)
  
- **Allergy History**
  - Drug allergies (penicillin, sulfa, NSAIDs) - with severity
  - Food allergies
  - Environmental allergies

##### **Tab 4: Visits (OPD + IPD + Emergency)**
- **Visit List** (Chronological, latest first)
  - Date, Type (OPD, IPD, Emergency)
  - Doctor, Department
  - Chief complaint
  - Diagnosis (ICD-10)
  - Status (completed, ongoing)
  
- **Click to Expand Visit**
  - Full SOAP note
  - Examination findings
  - Prescriptions
  - Investigations ordered
  - Follow-up plan

##### **Tab 5: Diagnoses (Problem List)**
- **Active Diagnoses**
  - ICD-10 code, description
  - Onset date
  - Status (active, chronic, resolved)
  
- **Resolved Diagnoses**
  - Past conditions (no longer active)

##### **Tab 6: Medications**
- **Current Medications** (Active)
  - Drug name, dose, frequency, route
  - Start date, end date (if applicable)
  - Prescribing doctor
  - Indication (what it's for)
  
- **Past Medications** (Discontinued)
  - Medication history
  - Reason for discontinuation
  
- **Medication Reconciliation**
  - Compare home medications vs hospital medications (on admission/discharge)

##### **Tab 7: Allergies & Alerts**
- **Drug Allergies**
  - Drug name, Reaction (rash, anaphylaxis), Severity (mild, severe)
  - Date reported
  
- **Other Allergies**
  - Food, latex, iodine
  
- **Special Alerts**
  - DNR (Do Not Resuscitate)
  - Fall risk (elderly, unsteady gait)
  - Infectious disease (TB, COVID - isolation needed)
  - VIP (handle with extra care)

##### **Tab 8: Vitals & Measurements** (Trends)
- **Vital Signs Table**
  - Date, BP, Pulse, Temp, SpO2, Weight, Height, BMI
  
- **Graphical Trends**
  - BP over last 6 months (line graph)
  - Weight trend (if monitoring weight loss/gain)
  - IOP trend (for glaucoma patients)
  
- **Ophthalmology-Specific Measurements**
  - Visual Acuity (OD, OS) over time
  - IOP (OD, OS) over time
  - Refraction (sphere, cylinder, axis) over time

##### **Tab 9: Laboratory Results**
- **Lab Test List** (Chronological)
  - Date, Test name, Result, Reference range, Status (Normal, High, Low)
  
- **Click to View Full Report**
  - Detailed lab report (PDF)
  
- **Trend View**
  - Blood Sugar over 6 months (line graph)
  - HbA1c trend (quarterly)
  - Creatinine trend (kidney function)
  
- **Critical Values** (Highlighted)
  - Hemoglobin < 7 g/dL, Blood Sugar > 400 mg/dL

##### **Tab 10: Imaging & Diagnostics**
- **Imaging List**
  - Date, Type (OCT, Fundus, VF, X-ray, CT, MRI)
  - Body part (OD, OS, chest, brain)
  - Ordering doctor
  
- **View Images**
  - Integrated DICOM viewer (for radiology)
  - Image viewer (for ophthalmology scans)
  
- **Reports**
  - Radiologist report, Ophthalmologist report
  
- **Compare Images**
  - Side-by-side comparison (baseline vs follow-up)

##### **Tab 11: Procedures & Surgeries**
- **Procedure List**
  - Date, Procedure (ICD/CPT code), Surgeon, Anesthesia type
  - Hospital/Location
  
- **Operative Notes**
  - Full operative note (step-by-step)
  - Findings, complications (if any)
  - Implants used (IOL details)
  
- **Post-Op Follow-Up**
  - Post-op visits (Day 1, Week 1, Month 1)
  - Outcomes (visual acuity improvement, complications)

##### **Tab 12: Documents**
- **Document Library**
  - All scanned/uploaded documents
  - Categories:
    - Consent forms
    - Discharge summaries
    - Referral letters
    - Insurance documents
    - Lab reports (if not integrated)
    - External records (from other hospitals)
  
- **Upload Documents**
  - Drag-and-drop upload
  - Tag document (type, date, description)
  
- **Download/Print**
  - Download individual documents OR batch download

##### **Tab 13: Billing & Payments**
- **Bill List**
  - Date, Bill number, Amount, Payment status (paid, pending, partial)
  
- **Click to View Bill**
  - Itemized bill (services, charges, taxes)
  
- **Payment History**
  - Date, Amount, Payment mode, Receipt number
  
- **Outstanding Balance**
  - Total due (if any)
  - Payment reminders sent

##### **Tab 14: Appointments**
- **Upcoming Appointments**
  - Date, Time, Doctor, Department, Type (new, follow-up)
  - Status (scheduled, confirmed, canceled)
  
- **Past Appointments**
  - Appointment history
  - Status (kept, no-show, rescheduled)
  
- **Book New Appointment**
  - Quick link to appointment scheduling

##### **Tab 15: Insurance & Claims**
- **Insurance Details**
  - Insurance company, Policy number, Validity
  - Coverage (sum insured, balance)
  
- **Claims List**
  - Date, Claim amount, Status (submitted, approved, rejected, paid)
  - TPA approval number
  
- **Pre-Authorizations**
  - Pre-auth requests (date, procedure, status)

##### **Tab 16: Communication Log**
- **All Communications**
  - SMS sent (appointment reminders, bill notifications)
  - Emails sent (reports, discharge summaries)
  - Phone calls (if logged)
  
- **Patient Preferences**
  - Preferred communication method (SMS, email, WhatsApp)
  - Opt-in/opt-out

##### **Tab 17: Consent Forms**
- **All Consents**
  - Surgery consent, Anesthesia consent, Blood transfusion, Photography
  - Date signed, signatures (patient, witness, doctor)
  
- **View Consent**
  - PDF with signatures
  
- **New Consent**
  - Generate new consent (for upcoming procedure)

##### **Tab 18: Referrals & Consultations**
- **Referrals Sent** (Outgoing)
  - Referred to (specialist, external hospital)
  - Reason for referral
  - Referral letter
  
- **Consultations Received** (Incoming)
  - Consultant's note
  - Recommendations
  
- **Referring Doctors** (Who referred this patient to us)
  - Referring doctor name, contact

##### **Tab 19: Clinical Notes**
- **All Clinical Notes** (SOAP Notes, Progress Notes, Operative Notes)
  - Date, Author (doctor, nurse), Type
  
- **Search Notes**
  - Full-text search (find specific terms in notes)
  
- **Add New Note**
  - Quick note entry

##### **Tab 20: Timeline** (Visual Timeline)
- **Chronological Event Timeline**
  - All events (visits, diagnoses, medications started/stopped, procedures, lab tests, imaging)
  - Visual representation (like Facebook timeline)
  - Filter by event type
  
- **Milestones**
  - First visit, First surgery, Major complication, Discharge, etc.

#### **C. PATIENT DIRECTORY FEATURES**

##### **Quick Actions Toolbar**
- **Book Appointment**
- **Create Bill**
- **Print Summary**
- **Send Message** (SMS/Email)
- **Upload Document**
- **Add Note**
- **Mark Favorite** (for frequently seen patients)

##### **Patient Comparison** (Advanced)
- **Compare Two Patients**
  - Side-by-side view (for research, case studies)

##### **Export Patient Data**
- **Download Patient Summary** (PDF)
  - Comprehensive report (all tabs summarized)
  
- **Export for Referral**
  - Continuity of Care Document (CCD) - XML format

##### **Patient Merge**
- **Merge Duplicate Records**
  - If same patient has 2 MRNs (data entry error)
  - Merge into one, preserve all data

### **Integration Points**:
- ← **From All Modules**: Aggregates all patient data
- → **To All Modules**: Single source of truth for patient information
- → **To Doctors**: Comprehensive patient view (for informed clinical decisions)

---

## ⛺ Module 31: Eye Camps (Community Outreach)

**Status**: ❌ Missing (Not implemented)  
**Role Access**: Camp Coordinator, Doctors, Nurses, Admin

### **Complete Workflow**:

#### **A. CAMP PLANNING**

##### **1. Camp Identification**
- **Target Locations**
  - Rural areas, underserved communities
  - Slums, tribal areas, old age homes
  
- **Needs Assessment**
  - Survey (prevalence of eye problems)
  - Partner with local NGOs, panchayats

##### **2. Camp Scheduling**
- **Select Date**
  - Coordinate with local authorities, doctors, community
  
- **Duration**
  - 1-day camp (screening only) OR multi-day (screening + surgery)

##### **3. Camp Team Formation**
- **Medical Team**
  - Ophthalmologists (1-2)
  - Optometrists (2-3)
  - Nurses (2-4)
  
- **Support Staff**
  - Counselors (explain procedures, costs)
  - Registrars (patient registration)
  - Pharmacists (dispense meds/glasses)
  
- **Logistics Team**
  - Drivers, equipment handlers

##### **4. Equipment & Supplies**
- **Medical Equipment**
  - Portable slit lamp, tonometer
  - Auto-refractometer (portable)
  - Fundus camera (if available)
  - Vision chart
  
- **Consumables**
  - Eye drops (mydriatic, antibiotic)
  - Cotton, gauze
  - Disposable gloves
  
- **Spectacles Stock**
  - Ready-made reading glasses (+1.0 to +3.5D)
  - Basic frames + lenses (for on-the-spot dispensing)
  
- **Medications**
  - Common eye drops (for distribution)
  
- **Administrative**
  - Registration forms, pens
  - Patient education pamphlets
  - Banners, tent, chairs, tables

##### **5. Logistics**
- **Transport**
  - Van/bus for team + equipment
  
- **Camp Site**
  - Community hall, school, temple (shaded, spacious)
  - Electricity (for equipment) OR generator
  
- **Food & Accommodation** (if multi-day)
  - Arrange for team

##### **6. Publicity**
- **Community Awareness**
  - Posters, announcements (local leaders, temple, mosque, church)
  - Radio, local cable TV
  - Door-to-door campaign (volunteers)

#### **B. CAMP EXECUTION**

##### **7. Camp Setup** (Day Before or Morning)
- **Registration Desk**
  - Tables, chairs, forms
  
- **Screening Stations**
  - Visual acuity testing (outdoor, good light)
  - Refraction (indoor, dark room)
  - Slit lamp examination (indoor)
  - IOP measurement (if tonometer available)
  
- **Counseling Area**
  - Separate area for surgery counseling
  
- **Pharmacy/Optical Dispensing**
  - Stock of glasses, medicines

##### **8. Patient Registration**
- **Collect Details**
  - Name, Age, Gender, Village, Phone (if available)
  - Chief complaint (blurred vision, pain, redness, etc.)
  
- **Assign Number**
  - Camp registration number (sequential)
  
- **Create Camp Card**
  - Patient carries card through stations

##### **9. Screening Process**

**Station 1: Visual Acuity**
- **Check Vision** (Snellen chart)
  - Unaided VA (without glasses)
  - With pinhole (if VA poor)
  - OD, OS separately
  
- **Refer to Next Station** (based on VA)
  - Good VA (6/6 or 6/9): No further action OR minor refraction
  - Reduced VA: Proceed to refraction

**Station 2: Refraction (Optometrist)**
- **Auto-refraction** (if equipment available)
- **Subjective Refraction**
  - Trial frame + lenses
  - Determine prescription
  
- **Outcome**:
  - Refractive error only → Dispense glasses (if available) OR refer to hospital optical
  - Cataract/other pathology → Refer to doctor

**Station 3: Doctor Examination**
- **Slit Lamp Exam**
  - Anterior segment (cornea, lens, iris)
  - Cataract grading (if present)
  
- **IOP Measurement** (if tonometer available)
  
- **Dilated Fundus Exam** (if mydriatic drops used)
  - Retina, optic disc examination
  
- **Diagnosis**:
  - Cataract → Counseling for surgery
  - Glaucoma → Refer to hospital
  - Diabetic retinopathy → Refer to hospital
  - Refractive error only → Glasses dispensed
  - Normal → Reassure patient

##### **10. Counseling & Surgery Planning**
- **For Cataract Patients**
  - Explain cataract, surgery (simple language)
  - Surgery at hospital (transport arranged) OR surgical camp (if equipped)
  - Free OR subsidized (depending on sponsorship)
  - Collect consent (if patient agrees)

##### **11. Spectacle Dispensing**
- **Ready-Made Glasses**
  - Reading glasses (for presbyopia)
  - Approximate power (±0.25D tolerance)
  
- **Custom Glasses**
  - If prescription complex, refer to hospital optical (order glasses, patient collects later)

##### **12. Medication Dispensing**
- **Eye Drops/Ointments** (for minor conditions)
  - Conjunctivitis → Antibiotic eye drops
  - Dry eyes → Lubricant drops
  
- **Patient Education**
  - How to instill drops, dosage

##### **13. Data Collection**
- **Log All Patients**
  - Total screened
  - Diagnoses (cataract, refractive error, glaucoma, diabetic retinopathy, normal)
  - Glasses dispensed
  - Referred for surgery
  - Referred to hospital (for further investigation)

#### **C. POST-CAMP SURGERY** (if applicable)

##### **14. Surgery Camp** (at hospital or mobile surgical unit)
- **Transport Patients**
  - Free bus to hospital
  - Pre-op preparation (as per Module 6)
  
- **Cataract Surgeries**
  - Batch surgeries (10-50 patients per day)
  - SICS (Small Incision Cataract Surgery) or Phaco
  - IOL implantation
  
- **Post-Op Care**
  - Eye patch, medications
  - Follow-up next day (at camp site or hospital)

##### **15. Follow-Up Camp**
- **Post-Op Day 1 Review**
  - Check vision, wound, IOP
  - Remove eye patch
  - Continue medications
  
- **1-Month Follow-Up**
  - Final visual outcome

#### **D. CAMP REPORTING**

##### **16. Camp Report**
- **Screening Statistics**
  - Total screened (by age, gender)
  - Diagnoses breakdown
  - Spectacles dispensed
  - Medications given
  
- **Surgical Statistics**
  - Total surgeries performed
  - Complications (if any)
  - Visual outcomes (% patients achieving 6/12 or better)
  
- **Costs**
  - Camp expenses (transport, food, medications, IOLs, spectacles)
  - Sponsorship/funding sources
  
- **Impact**
  - Lives impacted (vision restored)
  - Testimonials (patient stories)

##### **17. Photo Documentation**
- **Before/After Photos** (with consent)
  - Patient testimonials (video/text)
  
- **Camp Photos**
  - Team, setup, patient screening (for reports, social media)

##### **18. Sponsor Report**
- **For Funders/NGOs**
  - Detailed report (how funds utilized)
  - Impact metrics
  - Gratitude letter

#### **E. CAMP MANAGEMENT SYSTEM**

##### **19. Camp Module Features**
- **Camp Planning**
  - Create camp (location, date, team, equipment checklist)
  
- **Patient Registration** (Digital)
  - Mobile app OR laptop (offline capable)
  - Register patients on-site
  
- **Screening Data Entry**
  - VA, refraction, diagnosis (enter during camp)
  
- **Sync to Main System**
  - After camp, sync data to hospital EMR
  - Create patient records (if new patients)

##### **20. Camp Analytics**
- **Camp Performance**
  - Compare camps (which locations had more cataract cases?)
  - Identify high-need areas (for future camps)
  
- **Surgeon Productivity**
  - Surgeries per surgeon per day
  
- **Cost per Patient**
  - Total camp cost / patients screened

### **Integration Points**:
- ← **From Admin**: Team allocation, equipment inventory
- → **To EMR**: Camp patient records (create new patients or link to existing)
- → **To OT Management**: Surgery scheduling (for camp patients)
- → **To Billing**: Subsidized/free billing (track sponsorship)

---

## 💰 Module 32: Finance Management

**Status**: 🟡 Partial (Basic billing exists in Module 11, comprehensive finance missing)  
**Role Access**: Finance Manager, Accountants, CFO, Auditors

### **Complete Workflow**:

#### **A. ACCOUNTS RECEIVABLE** (Money Coming In)

##### **1. Patient Billing** (Covered in Module 11 Billing)
- **Revenue Recognition**
  - Recognize revenue when service rendered (accrual accounting)
  - OPD consultation, IPD final bill, pharmacy, diagnostics

##### **2. Insurance Claims** (Accounts Receivable from TPA)
- **Claim Submission**
  - Submit claims to TPA (with supporting documents)
  
- **Claim Tracking**
  - Claim status (submitted, under review, approved, rejected, paid)
  
- **Claim Follow-Up**
  - Pending claims (>30 days): Follow up with TPA
  
- **Claim Payment**
  - TPA pays hospital (via bank transfer)
  - Match payment with claim (reconciliation)
  
- **Rejected Claims**
  - Analyze reason (incomplete documentation, non-covered service)
  - Resubmit with corrections OR write off

##### **3. Corporate Billing** (B2B Receivables)
- **Monthly Invoicing**
  - Consolidate all employee visits (for month)
  - Generate invoice (send to corporate HR)
  
- **Credit Period**
  - 30/45/60 days (as per contract)
  
- **Payment Collection**
  - Follow up before due date
  - Overdue: Send reminders, escalate
  
- **Aging Analysis**
  - 0-30 days, 31-60 days, 61-90 days, >90 days
  - High-risk accounts (>90 days overdue)

##### **4. Outstanding Management**
- **Patient Dues** (Unpaid Bills)
  - Daily follow-up (calls, SMS, email)
  - Payment plans (negotiate installments)
  - Write-off (if uncollectable after exhaustive follow-up, with management approval)
  
- **Bad Debt Provision**
  - Estimate % of receivables that won't be collected
  - Accounting provision (reduce revenue)

##### **5. Advance Payments**
- **Advance Received** (Liability)
  - Patient pays advance for surgery
  - Record as liability (until service rendered)
  
- **Advance Utilization**
  - Adjust against final bill
  - Refund excess (if any)

#### **B. ACCOUNTS PAYABLE** (Money Going Out)

##### **6. Vendor Payments**
- **Purchase Invoices**
  - Receive invoice from supplier (pharmaceutical, equipment, consumables)
  - Verify against GRN (Goods Receipt Note)
  - Enter in system (invoice date, amount, due date)
  
- **Payment Terms**
  - Immediate, 15 days, 30 days, 60 days (as per vendor contract)
  
- **Payment Processing**
  - Generate payment voucher
  - Approval (finance manager, CFO for large amounts)
  - Pay via bank transfer, cheque, cash
  
- **Payment Tracking**
  - Due payments (upcoming this week)
  - Overdue payments (penalize with late fee?)

##### **7. Salary & Payroll** (Covered more in Module 33 HR)
- **Monthly Payroll**
  - Salary calculation (basic + allowances - deductions)
  - Statutory deductions (PF, ESI, TDS)
  
- **Salary Disbursement**
  - Bank transfer (salary accounts)
  - Salary slip generation

##### **8. Statutory Payments**
- **GST Payment**
  - Monthly GST liability (output GST - input GST)
  - Pay to government (GSTR-3B)
  
- **TDS Payment**
  - Tax deducted at source (from salaries, vendor payments)
  - Deposit to government (quarterly)
  
- **PF, ESI Payment**
  - Employee + employer contribution
  - Monthly deposit

##### **9. Operational Expenses**
- **Utilities**
  - Electricity, water, internet, phone
  - Monthly bills, payments
  
- **Rent** (if applicable)
  - Monthly rent for leased property
  
- **Maintenance & Repairs**
  - Equipment servicing, building maintenance
  
- **Marketing & Advertising**
  - Campaigns, social media ads

##### **10. Capital Expenditure**
- **Asset Purchase**
  - Medical equipment (phaco machine ₹50 lakhs), building renovation
  - Approval (board level for large capex)
  
- **Asset Capitalization**
  - Record as asset (not expense)
  - Depreciate over useful life

#### **C. CASH MANAGEMENT**

##### **11. Cash & Bank Balances**
- **Bank Accounts**
  - Current account (operations)
  - Savings account (reserves)
  - Multiple branches (separate accounts OR pooled)
  
- **Cash on Hand**
  - Petty cash (small expenses: tea, courier)
  - Billing counters (daily collections)

##### **12. Cash Flow Management**
- **Cash Inflows**
  - Patient collections, insurance payments, corporate payments
  
- **Cash Outflows**
  - Vendor payments, salaries, utilities, taxes
  
- **Cash Flow Forecast**
  - Next 30 days: Projected inflows vs outflows
  - Identify shortfalls (arrange overdraft, delay payments)

##### **13. Bank Reconciliation**
- **Monthly Reconciliation**
  - Match bank statement with books
  - Identify discrepancies (unrecorded transactions, bank charges)
  - Adjust books

##### **14. Petty Cash Management**
- **Petty Cash Fund**
  - Fixed amount (₹10,000)
  - Used for small expenses
  
- **Reimbursement**
  - When fund depleted, reimburse with receipts
  - Replenish to ₹10,000

#### **D. FINANCIAL ACCOUNTING**

##### **15. Chart of Accounts**
- **Account Categories**
  - **Assets**: Cash, Bank, Receivables, Inventory, Equipment, Building
  - **Liabilities**: Payables, Loans, Advances from patients, Accrued expenses
  - **Equity**: Capital, Retained earnings
  - **Revenue**: Patient revenue (OPD, IPD, diagnostics, pharmacy), insurance revenue, other income
  - **Expenses**: Salaries, medicines, consumables, utilities, depreciation, marketing

##### **16. Journal Entries**
- **Double-Entry Accounting**
  - Every transaction: Debit = Credit
  - Example: Patient pays bill ₹5,000
    - Debit: Cash ₹5,000
    - Credit: Revenue ₹5,000

##### **17. General Ledger**
- **Ledger Accounts**
  - Summary of all transactions (by account)
  - Example: Cash account (all debits/credits to cash)

##### **18. Trial Balance**
- **Monthly Trial Balance**
  - List all accounts with balances
  - Total Debits = Total Credits (if balanced)
  - Identify errors if not balanced

##### **19. Financial Statements**

**Income Statement (P&L - Profit & Loss)**
- **Revenue**
  - Patient revenue (OPD, IPD, diagnostics, pharmacy)
  - Other income (interest, rental income if renting out space)
  
- **Expenses**
  - Direct costs (medications, consumables, IOLs)
  - Salaries & benefits
  - Utilities
  - Depreciation
  - Marketing
  - Administrative expenses
  
- **Net Profit/Loss**
  - Revenue - Expenses

**Balance Sheet**
- **Assets**
  - Current assets (cash, receivables, inventory)
  - Fixed assets (equipment, building, furniture)
  
- **Liabilities**
  - Current liabilities (payables, short-term loans, advances from patients)
  - Long-term liabilities (bank loans, mortgages)
  
- **Equity**
  - Shareholders' equity, retained earnings
  
- **Equation**: Assets = Liabilities + Equity

**Cash Flow Statement**
- **Operating Activities**: Cash from operations
- **Investing Activities**: Asset purchases, sales
- **Financing Activities**: Loans taken, repaid

##### **20. Month-End Closing**
- **Accruals**
  - Record expenses incurred but not paid (electricity bill for month-end, received next month)
  
- **Prepayments**
  - Expenses paid in advance (insurance premium for year)
  
- **Depreciation**
  - Monthly depreciation charge
  
- **Close Period**
  - Lock accounting period (prevent further edits)

##### **21. Year-End Closing**
- **Annual Audit** (External Auditor)
  - Statutory audit (as per Companies Act, India)
  - Auditor reviews financial statements, issues audit report
  
- **Tax Filing**
  - Income tax return (for hospital)
  - GST annual return

#### **E. BUDGETING & FORECASTING**

##### **22. Annual Budget**
- **Revenue Budget**
  - Projected OPD visits, IPD admissions, surgeries
  - Average revenue per visit, per surgery
  - Total revenue target
  
- **Expense Budget**
  - Salaries (assume X% increment)
  - Medications, consumables (based on projected volume)
  - Utilities, marketing
  
- **Capital Budget**
  - Planned equipment purchases (next year: buy new OCT ₹60 lakhs)

##### **23. Budget vs Actual**
- **Monthly Comparison**
  - Actual revenue vs budgeted revenue (variance analysis)
  - Actual expenses vs budgeted (overspending? underspending?)
  
- **Corrective Actions**
  - If revenue below budget: Increase marketing, add services
  - If expenses above budget: Cost control measures

##### **24. Rolling Forecast**
- **Quarterly Update**
  - Revise forecast based on YTD actuals
  - More accurate than annual budget (adjust for market changes)

#### **F. COSTING & PROFITABILITY**

##### **25. Service Costing**
- **Cost per Service**
  - Cataract surgery cost: Surgeon fee + IOL + OT time + anesthesia + nursing + overheads
  - Compare cost vs revenue (profit margin per surgery)

##### **26. Department Profitability**
- **Profit Centers**
  - OPD Ophthalmology: Revenue - Direct costs = Profit
  - Diagnostics: Revenue - Costs = Profit
  - Pharmacy: Revenue - COGS (Cost of Goods Sold) = Profit
  
- **Loss-Making Departments**
  - Identify (subsidized by profitable departments?)
  - Improve efficiency OR discontinue

##### **27. Patient Profitability**
- **High-Value Patients**
  - Corporate employees (bulk volume)
  - Insurance patients (higher reimbursements?)
  
- **Low-Value Patients**
  - Charity cases (CSR obligation, not profit-driven)

##### **28. Break-Even Analysis**
- **Fixed Costs**: Rent, salaries (regardless of patient volume)
- **Variable Costs**: Medications, consumables (per patient)
- **Break-Even Point**: Minimum patient volume to cover costs

#### **G. FINANCIAL REPORTING**

##### **29. Management Reports** (Monthly)
- **Revenue Report**
  - Total revenue (month, YTD)
  - Revenue by department (OPD, IPD, diagnostics, pharmacy)
  - Revenue by doctor
  - Revenue trends (growing? declining?)
  
- **Expense Report**
  - Total expenses (by category)
  - Expense trends
  
- **Profitability Report**
  - Net profit (month, YTD)
  - Profit margin (%)
  
- **Cash Flow Report**
  - Opening balance, inflows, outflows, closing balance
  
- **Receivables & Payables Aging**
  - Overdue receivables, payables

##### **30. Executive Dashboard** (for CEO, Board)
- **KPIs** (Key Performance Indicators)
  - Total Revenue (MTD, YTD)
  - Net Profit (MTD, YTD)
  - Profit Margin (%)
  - EBITDA (Earnings Before Interest, Tax, Depreciation, Amortization)
  - Receivables Days (average days to collect payment)
  - Payables Days
  - Current Ratio (current assets / current liabilities - liquidity measure)
  
- **Visualizations**
  - Revenue trend (line chart)
  - Department-wise revenue (pie chart)
  - Profit margin trend

##### **31. Regulatory Reports**
- **GST Returns** (Monthly/Quarterly)
  - GSTR-1 (sales), GSTR-3B (summary, payment)
  
- **TDS Returns** (Quarterly)
  - Form 24Q (salary TDS), 26Q (other TDS)
  
- **Income Tax Return** (Annual)
  
- **Companies Act Compliance** (if company)
  - Board meetings, AGM, financial statement filing with MCA (Ministry of Corporate Affairs)

#### **H. AUDIT & COMPLIANCE**

##### **32. Internal Audit**
- **Monthly/Quarterly**
  - Internal auditor reviews transactions
  - Check compliance with policies
  - Identify fraud, errors
  
- **Audit Findings**
  - Report to management
  - Corrective actions

##### **33. External Audit** (Statutory)
- **Annual Audit**
  - Chartered Accountant audits financial statements
  - Issues audit report (unqualified, qualified, adverse)
  
- **Tax Audit** (if turnover > threshold)
  - Auditor verifies tax compliance

##### **34. Compliance**
- **Accounting Standards**
  - Ind AS (Indian Accounting Standards) or IFRS (if applicable)
  
- **Tax Compliance**
  - GST, Income Tax, TDS, PF, ESI (timely filing, payment)
  
- **Legal Compliance**
  - Companies Act, shops & establishments act, labor laws

#### **I. INTEGRATION WITH BANKING**

##### **35. Bank Integration**
- **Auto Bank Feed**
  - Bank transactions auto-imported to accounting system
  - Reconcile automatically
  
- **Payment Gateway Integration**
  - Online payments (patient portal)
  - Auto-record in accounts

##### **36. Cheque Management**
- **Cheque Issued**
  - Record cheque number, payee, amount, date
  - Track clearance status
  
- **Cheque Received**
  - From patient/corporate
  - Deposit, track clearance
  - If bounced, follow up with issuer

### **Integration Points**:
- ← **From Billing (Module 11)**: Patient revenue, collections
- ← **From Inventory (Module 12)**: Purchase invoices, stock valuation
- ← **From HR (Module 33)**: Payroll data, salary expenses
- ← **From Insurance**: TPA payments, claim status
- → **To Management**: Financial reports, dashboards
- → **To Government**: Tax filings, statutory returns

---

## 👥 Module 33: HR Management (Human Resources)

**Status**: 🟡 Partial (User management exists in Module 13, comprehensive HR missing)  
**Role Access**: HR Manager, HR Staff, Employees, Management

### **Complete Workflow**:

#### **A. RECRUITMENT & ONBOARDING**

##### **1. Manpower Planning**
- **Workforce Planning**
  - Project hiring needs (next quarter: need 2 ophthalmologists, 5 nurses)
  - Based on: Patient volume, service expansion, attrition
  
- **Job Requisition**
  - Department head requests headcount
  - HR approval, budget approval

##### **2. Job Posting**
- **Job Description**
  - Role, responsibilities, qualifications, experience, salary range
  
- **Posting Channels**
  - Hospital website (careers page)
  - Job portals (Naukri, LinkedIn)
  - Medical associations (for doctors)
  - Walk-in interviews (for support staff)

##### **3. Application Screening**
- **CV Review**
  - Shortlist candidates (match qualifications, experience)
  
- **Applicant Tracking System (ATS)**
  - Store all applications
  - Status: Applied, Shortlisted, Rejected, Interview Scheduled

##### **4. Interview Process**
- **Screening Call** (HR)
  - Basic verification (availability, salary expectation)
  
- **Technical Interview** (Department Head)
  - Assess clinical/technical skills
  - For doctors: Case-based questions, practical exam
  
- **HR Interview**
  - Cultural fit, attitude, motivation
  
- **Final Interview** (Director/CEO for senior roles)

##### **5. Background Verification**
- **Verify**
  - Educational qualifications (degree certificates)
  - Previous employment (experience letters, relieving letter)
  - Criminal record check (police verification)
  - Medical registration (for doctors: MCI/state council registration)

##### **6. Offer Letter**
- **Generate Offer**
  - Position, salary, joining date, terms
  
- **Candidate Acceptance**
  - Candidate signs offer, returns

##### **7. Onboarding**
- **Pre-Joining**
  - Send onboarding documents (ID proof, address proof, bank details, photos)
  
- **Day 1**
  - Welcome, ID card, login credentials
  - Orientation (hospital tour, introduction to team)
  - Policy handbook (code of conduct, leave policy, etc.)
  
- **First Week**
  - Department induction
  - System training (EMR, hospital software)
  
- **Probation Period**
  - 3 months (for new hires)
  - Performance review at end, confirm OR extend OR terminate

#### **B. EMPLOYEE MASTER DATA**

##### **8. Employee Profile**
- **Personal Details**
  - Name, DOB, Gender, Marital Status
  - Contact (phone, email, address)
  - Emergency contact
  
- **Employment Details**
  - Employee ID, Department, Designation, Joining Date
  - Employment Type (Full-time, Part-time, Consultant)
  - Reporting Manager
  
- **Professional Details** (for clinical staff)
  - Qualifications (MBBS, MD, DNB, etc.)
  - Specialization
  - Registration number (MCI, state council)
  - License validity
  
- **Bank Details**
  - Account number, IFSC (for salary transfer)
  
- **Statutory Details**
  - PAN, Aadhar, UAN (PF number), ESI number

##### **9. Employee Documents**
- **Document Repository**
  - Resume, certificates (degree, experience)
  - ID proofs, address proofs
  - Offer letter, appointment letter
  - Annual appraisals, increment letters
  - Resignation, relieving letter (when applicable)

#### **C. ATTENDANCE & LEAVE MANAGEMENT**

##### **10. Attendance Tracking**
- **Biometric/RFID**
  - Punch in/out (clock in, clock out)
  - Daily attendance (present, absent, half-day, late)
  
- **Manual Entry** (for field staff, outstation)
  - Supervisor marks attendance

##### **11. Shift Management** (Covered in Module 20 Staff Scheduling)
- **Roster**
  - Weekly/monthly shift schedule
  - Nurses, support staff (rotating shifts)

##### **12. Leave Management**
- **Leave Types**
  - **Earned Leave (EL)**: Accrued annually (X days per year)
  - **Casual Leave (CL)**: For short absences
  - **Sick Leave (SL)**: For illness (may require medical certificate)
  - **Maternity Leave**: 26 weeks (as per law, India)
  - **Paternity Leave**: 5 days
  - **Compensatory Off (Comp Off)**: If worked on holiday, get day off
  - **Leave Without Pay (LWP)**: If leave balance exhausted
  
- **Leave Balance**
  - Track accrued, utilized, balance (per employee, per leave type)
  
- **Leave Application**
  - Employee applies (dates, reason)
  - Manager approves/rejects
  
- **Leave Approval Workflow**
  - Auto-approve (if balance available + manager approves)
  - If balance exhausted, convert to LWP OR reject

##### **13. Holiday Calendar** (Covered in Module 13 Admin)
- **Public Holidays**
  - National, regional, hospital-specific
  - OPD closed? OT operational? (decide per holiday)

#### **D. PAYROLL MANAGEMENT**

##### **14. Salary Structure**
- **Components**
  - **Basic Salary** (40-50% of CTC)
  - **Allowances**
    - HRA (House Rent Allowance)
    - Conveyance Allowance
    - Medical Allowance
    - Special Allowance
  - **Gross Salary** = Basic + Allowances
  
- **Deductions**
  - **PF (Provident Fund)**: 12% of basic (employee) + 12% (employer)
  - **ESI (Employee State Insurance)**: If salary < threshold
  - **Professional Tax**: State-specific
  - **TDS (Tax Deducted at Source)**: Income tax deduction (as per IT slab)
  - **Loan Repayment**: If employee has taken loan from hospital
  
- **Net Salary** = Gross - Deductions

##### **15. Monthly Payroll Processing**
- **Attendance Integration**
  - Import attendance (days present, absent, LWP)
  - Deduct salary for LWP, late arrivals (if policy)
  
- **Variable Pay** (if applicable)
  - Incentives (for doctors: based on patient volume, surgeries)
  - Overtime pay (for nurses, support staff)
  
- **Salary Calculation**
  - Auto-calculate (system)
  
- **Approval**
  - HR verifies, management approves
  
- **Salary Disbursement**
  - Bank transfer (on fixed date: 1st of month, 30th, etc.)
  
- **Salary Slip**
  - Generate, send via email OR print
  - Breakdown: Earnings, deductions, net pay

##### **16. Statutory Compliance**
- **PF Payment**
  - Monthly deposit (employee + employer contribution)
  - File ECR (Electronic Challan cum Return)
  
- **ESI Payment**
  - Monthly deposit, file return
  
- **TDS Deposit & Filing**
  - Deposit TDS (monthly via challan)
  - Quarterly TDS return (Form 24Q)
  
- **Form 16** (Annual)
  - TDS certificate (issue to employees for IT filing)

##### **17. Year-End Processing**
- **Tax Declarations**
  - Employees submit tax-saving investments (80C, HRA proofs)
  - HR verifies, adjust TDS for remaining months
  
- **Annual Bonuses**
  - Performance bonus, festive bonus (Diwali, etc.)
  
- **Full & Final Settlement** (for resignations)
  - Calculate dues (pending salary, leave encashment, bonus)
  - Deduct (notice period shortfall, loan recovery)
  - Issue final payment

#### **E. PERFORMANCE MANAGEMENT**

##### **18. Goal Setting**
- **Annual Goals** (at year start)
  - Employee + manager set goals (SMART goals: Specific, Measurable, Achievable, Relevant, Time-bound)
  - Example (doctor): "Perform 200 cataract surgeries with <1% complication rate"
  - Example (nurse): "Achieve 100% medication administration accuracy"

##### **19. Continuous Feedback**
- **Regular Check-ins**
  - Monthly/quarterly 1:1 meetings (manager + employee)
  - Discuss progress, challenges, support needed

##### **20. Performance Appraisal** (Annual)
- **Self-Appraisal**
  - Employee rates own performance, lists achievements
  
- **Manager Appraisal**
  - Manager rates employee (against goals)
  - Rating scale (1-5: Outstanding, Exceeds, Meets, Needs Improvement, Unsatisfactory)
  
- **Appraisal Discussion**
  - Manager + employee discuss (feedback, development areas)
  
- **Normalization** (HR)
  - Ensure consistent ratings across departments (not all "Outstanding")

##### **21. Compensation Review**
- **Increments**
  - Based on performance rating (Outstanding: 15%, Exceeds: 10%, Meets: 5%)
  - Budget constraints
  
- **Promotions**
  - If ready for next level (Nurse → Senior Nurse → Nurse Manager)
  - Title change, salary increase, added responsibilities
  
- **Bonus**
  - Performance-linked bonus (annual)

##### **22. Performance Improvement Plan (PIP)**
- **For Underperformers**
  - If rating "Needs Improvement" OR "Unsatisfactory"
  - PIP: 90-day plan with specific improvement targets
  - Support: Training, mentoring
  - Review at end: Improved → continue, Not improved → terminate

#### **F. TRAINING & DEVELOPMENT**

##### **23. Training Needs Analysis**
- **Identify Gaps**
  - From performance appraisals (skills lacking)
  - New equipment (train staff on new phaco machine)
  - Regulatory (NABH training, fire safety)

##### **24. Training Programs**
- **Induction Training** (for new joiners)
  - Hospital policies, systems, safety
  
- **Clinical Training** (for clinical staff)
  - CME (Continuing Medical Education) for doctors
  - Nursing skills updates
  - Hands-on training (new surgical technique)
  
- **Soft Skills Training**
  - Communication, patient handling, teamwork
  
- **Compliance Training**
  - HIPAA, NABH, infection control, fire safety

##### **25. External Training**
- **Conferences, Workshops**
  - Send doctors to ophthalmology conferences (national, international)
  - Reimburse fees, travel (as per policy)
  
- **Certification Courses**
  - Sponsor employees (MBA, fellowship programs)

##### **26. Training Records**
- **Track Training**
  - Employee training history (courses attended, dates, certificates)
  - Compliance training (mandatory annually)

#### **G. EMPLOYEE ENGAGEMENT & RETENTION**

##### **27. Employee Satisfaction Surveys**
- **Annual Survey**
  - Gauge morale, satisfaction
  - Anonymous feedback
  - Analyze results, action plan

##### **28. Grievance Redressal**
- **Grievance Mechanism**
  - Employee raises concern (harassment, unfair treatment, salary issue)
  - HR investigates, resolves
  
- **Escalation**
  - If unresolved, escalate to grievance committee

##### **29. Employee Welfare**
- **Health Insurance**
  - Group health insurance (employee + family)
  
- **Life Insurance**
  - Group term life insurance
  
- **Cafeteria Subsidy**
  - Subsidized meals for staff
  
- **Transport**
  - Shuttle service (for night shift nurses)
  
- **Childcare** (if available)
  - Daycare facility

##### **30. Recognition & Rewards**
- **Employee of the Month**
  - Based on performance, patient feedback
  - Certificate, monetary reward
  
- **Long Service Awards**
  - Recognize tenure (5 years, 10 years, 25 years)
  - Gift, appreciation letter
  
- **Spot Awards**
  - Immediate recognition (exceptional service)

#### **H. SEPARATION & EXIT**

##### **31. Resignation**
- **Resignation Letter**
  - Employee submits (notice period: 30/60/90 days as per policy)
  
- **Exit Interview**
  - HR conducts (understand reason for leaving)
  - Feedback (for organizational improvement)

##### **32. Notice Period**
- **Serve Notice**
  - Employee works notice period OR pays in lieu (buy out)
  
- **Knowledge Transfer**
  - Handover responsibilities to colleague/replacement

##### **33. Full & Final Settlement**
- **Clear Dues**
  - Pending salary, leave encashment, bonus
  - Deduct: Notice period shortfall, loans, assets not returned
  
- **Final Payment**
  - Within 45 days of last working day (as per law)

##### **34. Exit Formalities**
- **Asset Return**
  - ID card, laptop, keys, uniforms
  
- **No Dues Certificate**
  - From all departments (IT, Admin, Finance)
  
- **Relieving Letter**
  - Issue on last working day (confirms employment, dates, designation)
  
- **Experience Certificate**
  - Issue (if requested)
  
- **Form 16** (if resigned mid-year)
  - TDS certificate (for tax filing)

##### **35. Termination** (Employer-Initiated)
- **Reasons**
  - Performance (post-PIP, no improvement)
  - Misconduct (fraud, violation of code of conduct)
  - Redundancy (role no longer needed)
  
- **Termination Process**
  - Show cause notice (opportunity to explain)
  - Inquiry (if misconduct)
  - Termination letter
  
- **Severance Pay** (if applicable)
  - As per labor laws, company policy

#### **I. HR ANALYTICS & REPORTING**

##### **36. HR Metrics**
- **Headcount**
  - Total employees (by department, designation, location)
  - Trend (growing? shrinking?)
  
- **Attrition Rate**
  - (Resignations + Terminations) / Average Headcount × 100
  - Target: <15% annually
  
- **Retention Rate**
  - % employees who stay (100 - Attrition)
  
- **Time to Hire**
  - Average days (from job posting to offer acceptance)
  - Target: <30 days
  
- **Cost per Hire**
  - Recruitment costs / Number of hires
  
- **Training Hours**
  - Average training hours per employee per year
  
- **Employee Satisfaction Score**
  - From surveys (1-5 scale, target: >4)

##### **37. Dashboards**
- **HR Dashboard**
  - Headcount, attrition, pending appraisals, leave balance summary, training compliance

##### **38. Compliance Reports**
- **PF/ESI Returns**
  - Monthly returns filed
  
- **TDS Reports**
  - Form 24Q (quarterly)
  
- **Labor Law Compliance**
  - Minimum wages, working hours, overtime (ensure compliance)

### **Integration Points**:
- ← **From Admin (Module 13)**: User creation (sync with employee master)
- ← **From Staff Scheduling (Module 20)**: Attendance data
- → **To Finance (Module 32)**: Payroll data, salary expenses
- → **To Staff Scheduling (Module 20)**: Employee availability, shifts
- → **To All Modules**: Employee data (for user assignment, doctor scheduling)

---

## 🏥 Module 34: NABH Management (Accreditation Compliance)

**Status**: ❌ Missing (Not implemented)  
**Role Access**: Quality Team, NABH Coordinator, Department Heads, Auditors

### **Complete Workflow**:

**(Note: NABH = National Accreditation Board for Hospitals & Healthcare Providers, India)**

#### **A. NABH OVERVIEW**

##### **1. NABH Accreditation**
- **Purpose**
  - Quality certification for hospitals
  - Patient safety, clinical excellence, ethical practices
  
- **Levels**
  - Entry Level (pre-NABH)
  - Full Accreditation (3-year validity)
  - Re-Accreditation (renewal every 3 years)

##### **2. NABH Standards**
- **10 Patient-Centric Standards**
  1. Access, Assessment & Continuity of Care (AAC)
  2. Care of Patients (COP)
  3. Management of Medication (MOM)
  4. Patient Rights & Education (PRE)
  5. Hospital Infection Control (HIC)
  6. Continuous Quality Improvement (CQI)
  7. Responsibilities of Management (ROM)
  8. Facility Management & Safety (FMS)
  9. Human Resource Management (HRM)
  10. Information Management System (IMS)

#### **B. NABH IMPLEMENTATION**

##### **3. Gap Analysis**
- **Initial Assessment**
  - Compare current practices vs NABH standards
  - Identify gaps (missing policies, documentation)
  
- **Gap List**
  - Spreadsheet: Standard, Objective Element, Current Status, Gap, Action Plan

##### **4. Policy & Procedure Development**
- **Document Policies**
  - For each NABH requirement (patient admission policy, medication policy, infection control policy, etc.)
  - Format: Purpose, Scope, Definitions, Procedure, Responsibilities
  
- **Standard Operating Procedures (SOPs)**
  - Step-by-step instructions (how to perform tasks)
  - Example: SOP for Medication Administration, SOP for Hand Hygiene

##### **5. Training & Awareness**
- **NABH Sensitization**
  - Train all staff (what is NABH, why important)
  
- **Role-Specific Training**
  - Doctors: Documentation standards, patient rights
  - Nurses: Infection control, medication safety
  - Housekeeping: Cleaning protocols, biomedical waste
  
- **Mock Drills**
  - Fire safety, disaster management (as per FMS standard)

##### **6. Documentation System**
- **Document Control**
  - Master list of all policies, SOPs
  - Version control (track revisions)
  
- **Document Access**
  - All staff can access policies (intranet, physical copies in departments)

#### **C. NABH COMPLIANCE TRACKING**

##### **7. Checklist Management**
- **Standard-Wise Checklists**
  - AAC checklist (patient assessment done within X hours, care plan documented, discharge summary complete)
  - MOM checklist (medication orders legible, high-alert drugs labeled, double-check before administration)
  
- **Regular Audits**
  - Monthly internal audits (using checklists)
  - Score compliance (%)

##### **8. Objective Evidence**
- **Collect Evidence**
  - Documents, records, logs (to prove compliance)
  - Example: Hand hygiene compliance → hand hygiene audit log (observations, compliance %)

##### **9. Quality Indicators** (QIs)
- **NABH Mandates**
  - Hospital must track specific QIs (infection rates, medication errors, patient falls, readmission rates, etc.)
  
- **Monthly Data Collection**
  - Collect data for each QI
  - Example: Surgical Site Infection (SSI) rate = (SSI cases / Total surgeries) × 100
  
- **Benchmark**
  - Compare with NABH benchmarks (if SSI rate > 2%, investigate)

##### **10. Incident Reporting** (Covered in Audit Module 36)
- **Adverse Events**
  - Medication errors, patient falls, hospital-acquired infections
  - Log all incidents
  
- **Root Cause Analysis (RCA)**
  - For serious incidents, conduct RCA
  - Identify root cause, implement corrective actions

#### **D. PATIENT SAFETY INITIATIVES**

##### **11. Patient Identification**
- **Wristbands**
  - All IPD patients wear wristbands (name, MRN, DOB)
  
- **Two-Identifier Verification**
  - Before any procedure, verify patient using 2 identifiers (name + MRN, NOT room number)

##### **12. Medication Safety** (Covered in Module 8 Pharmacy)
- **High-Alert Medications**
  - List of high-risk meds (insulin, heparin, KCl)
  - Special labeling, double-check before administration
  
- **LASA (Look-Alike, Sound-Alike) Drugs**
  - Identify LASA drugs (confusing names)
  - Separate storage, tall-man lettering (hydrOXYzine vs hydrALAZINE)

##### **13. Infection Control** (Covered in HIC Standard)
- **Hand Hygiene Compliance**
  - WHO 5 Moments (before patient contact, before aseptic procedure, after body fluid exposure, after patient contact, after touching patient surroundings)
  - Target: >90% compliance
  - Audit monthly (direct observation)
  
- **Isolation Precautions**
  - Standard precautions (all patients)
  - Contact/Droplet/Airborne precautions (for infectious patients)

##### **14. Fall Prevention**
- **Fall Risk Assessment**
  - Assess all patients (on admission, if elderly/neurological issues)
  - High-risk: Bed rails, fall alert sign, frequent monitoring

##### **15. Surgical Safety Checklist** (WHO Checklist)
- **Pre-Op**, **Intra-Op**, **Post-Op** checklists
  - Verify patient, procedure, site, consent, equipment
  - Team briefing before surgery
  - Sign-Out before patient leaves OT

#### **E. NABH PRE-ASSESSMENT & ASSESSMENT**

##### **16. Internal Mock Assessment**
- **Before NABH Visit**
  - Conduct internal mock assessment (simulate NABH audit)
  - Identify last-minute gaps, fix

##### **17. Pre-Assessment Visit** (NABH Team)
- **NABH Sends Team**
  - Preliminary visit (before full assessment)
  - High-level review
  - Feedback: Ready OR need more work

##### **18. Full Assessment** (On-Site Audit)
- **NABH Assessors Visit** (3-5 days)
  - Review documents (policies, SOPs, QI data)
  - Interview staff (ask about policies, procedures)
  - Observe practices (patient care, infection control, OT)
  - Check infrastructure (safety, cleanliness)
  
- **Exit Meeting**
  - Assessors present findings (strengths, non-conformities)

##### **19. Non-Conformities**
- **Major NC**: Critical gaps (patient safety risk)
- **Minor NC**: Lesser gaps
- **Observations**: Suggestions (not gaps)
  
- **Corrective Action**
  - Submit corrective action plan (within 30 days)
  - Address all NCs

##### **20. Accreditation Decision**
- **NABH Committee Reviews**
  - Based on assessment report, corrective actions
  
- **Decision**
  - **Accredited**: Issue certificate (valid 3 years)
  - **Deferred**: Need more improvements, reassessment
  - **Not Accredited**: Major gaps

#### **F. POST-ACCREDITATION MAINTENANCE**

##### **21. Sustaining Compliance**
- **Continuous Monitoring**
  - Don't relax after accreditation
  - Continue audits, QI tracking
  
- **Mid-Term Review** (18 months post-accreditation)
  - NABH may conduct surprise visit (check if standards maintained)

##### **22. Re-Accreditation** (Every 3 Years)
- **Renewal Process**
  - Apply before expiry
  - Full assessment again
  - Updated compliance to new NABH standards (if revised)

#### **G. NABH MODULE FEATURES**

##### **23. NABH Dashboard**
- **Compliance Overview**
  - 10 standards: Compliance % per standard (color-coded: green >80%, yellow 60-80%, red <60%)
  
- **Quality Indicators**
  - Monthly QI data (graphs, trends)
  - Alerts if QI crosses threshold
  
- **Audit Schedule**
  - Upcoming audits (department, date, auditor)
  
- **Non-Conformities Tracker**
  - Open NCs, due dates for corrective actions, status

##### **24. Document Repository**
- **All NABH Documents**
  - Policies, SOPs (searchable)
  - Version-controlled
  - Access by staff (read-only, editable for quality team)

##### **25. Audit Module**
- **Plan Audits**
  - Schedule (department, date, auditor, standard)
  
- **Conduct Audit**
  - Checklist-based (on mobile/tablet)
  - Score, observations, NCs
  
- **Audit Report**
  - Auto-generate report
  - Share with department head

##### **26. Training Tracker**
- **Mandatory Training**
  - NABH training, infection control, fire safety
  - Track completion % (by department, by employee)
  - Reminders for pending training

##### **27. Incident Management** (Overlap with Module 36 Audit)
- **Log Incidents**
  - Medication errors, falls, infections, equipment failures
  
- **Investigate**
  - RCA for serious incidents
  
- **Track Corrective Actions**
  - Prevent recurrence

### **Integration Points**:
- ← **From All Clinical Modules**: Quality indicator data, incident data
- → **To Quality Team**: Compliance dashboards, audit reports
- → **To Management**: NABH compliance status, accreditation readiness

---

## 🔒 Module 35: HIPAA Management (Privacy & Security Compliance)

**Status**: ❌ Missing (Not implemented)  
**Role Access**: Privacy Officer, Security Officer, IT, Compliance Team, All Staff

### **Complete Workflow**:

**(Note: HIPAA = Health Insurance Portability and Accountability Act, USA. For India, adapt to DISHA (Digital Information Security in Healthcare Act) when enacted, or general data privacy laws)**

#### **A. HIPAA OVERVIEW**

##### **1. HIPAA Rules**
- **Privacy Rule**: Protects patient health information (PHI)
- **Security Rule**: Safeguards electronic PHI (ePHI)
- **Breach Notification Rule**: Notify if data breach occurs

##### **2. Protected Health Information (PHI)**
- **Covers**
  - Name, Address, DOB, MRN, Phone, Email
  - Medical history, diagnoses, treatments, test results
  - Billing, insurance information
  
- **ePHI**: Electronic PHI (in EMR, databases, emails)

#### **B. PRIVACY COMPLIANCE**

##### **3. Patient Rights**
- **Right to Access**
  - Patient can request own medical records
  - Hospital must provide (within 30 days, may charge copying fees)
  
- **Right to Amend**
  - Patient can request corrections (if error)
  - Hospital reviews, accepts OR denies (with reason)
  
- **Right to Accounting of Disclosures**
  - Patient can ask: "Who accessed my records in last 6 years?"
  - Hospital must provide list (excluding treatment, payment, operations disclosures)
  
- **Right to Restrict**
  - Patient can request restrictions (don't share with specific person)
  - Hospital can agree OR deny
  
- **Right to Confidential Communications**
  - Patient can request alternate contact (send reports to work email, not home)

##### **4. Consent & Authorization**
- **General Consent** (for treatment)
  - Implied consent (patient presenting for care)
  
- **Authorization** (for non-routine disclosures)
  - Specific consent required (sharing records with employer, research, marketing)
  - Written authorization form (patient signs)

##### **5. Minimum Necessary Rule**
- **Limit PHI Disclosure**
  - Only disclose minimum PHI needed (for purpose)
  - Example: Billing needs diagnosis code, NOT full medical history

##### **6. De-Identification**
- **Remove Identifiers**
  - For research, statistics (remove name, MRN, DOB, etc.)
  - Safe to use (no privacy risk)

#### **C. SECURITY COMPLIANCE** (ePHI Safeguards)

##### **7. Administrative Safeguards**

**Security Officer**
- Designate Security Officer (responsible for security)

**Risk Assessment**
- Identify risks to ePHI (unauthorized access, hacking, data loss)
- Mitigation plan

**Policies & Procedures**
- Security policies (password policy, access control policy, incident response)

**Workforce Training**
- Annual HIPAA training (all staff)
- Quiz, certificate of completion

**Sanctions**
- Disciplinary policy (if staff violates HIPAA, consequences: warning, suspension, termination)

##### **8. Physical Safeguards**

**Facility Access Control**
- Restrict access to server room, medical records room
- Biometric/card access, CCTV

**Workstation Security**
- Lock computers when unattended (auto-lock after 5 min inactivity)
- Privacy screens (prevent shoulder surfing)

**Device & Media Controls**
- Encrypt laptops, USB drives
- Secure disposal (wipe hard drives before discarding, shred printed PHI)

##### **9. Technical Safeguards**

**Access Control**
- **User Authentication**: Username + strong password (or 2FA)
- **Role-Based Access**: Doctors see clinical data, billing sees financial, pharmacist sees prescriptions ONLY
- **Audit Controls**: Log all ePHI access (who, when, what)

**Encryption**
- **Data at Rest**: Encrypt databases, files (AES-256)
- **Data in Transit**: HTTPS, VPN, encrypted email

**Integrity Controls**
- Prevent unauthorized alteration (checksums, digital signatures)

**Automatic Logoff**
- Auto-logout after 15 min inactivity

**Disaster Recovery & Backup**
- Regular backups (daily)
- Offsite storage, cloud backup
- Test restore (ensure backups work)

#### **D. BREACH NOTIFICATION**

##### **10. Breach Detection**
- **Monitor**
  - Intrusion detection systems (IDS)
  - Audit logs (unusual access patterns)
  
- **Report**
  - Staff reports suspected breach (lost laptop, unauthorized access)

##### **11. Breach Assessment**
- **Is it a Breach?**
  - Unauthorized access, use, or disclosure of PHI
  
- **Risk Assessment** (4 Factors)
  - Nature & extent of PHI (how many patients, what data)
  - Who accessed (malicious? accidental?)
  - Was PHI acquired/viewed?
  - Risk of harm to patients
  
- **Decision**: Breach (notify) OR Low Risk (document, no notification)

##### **12. Breach Notification** (if breach confirmed)

**Notify Patients**
- Within 60 days
- Letter OR email (explain breach, what data, steps taken, patient actions)

**Notify Media** (if >500 patients affected in single state)
- Press release (prominent media outlets)

**Notify HHS** (Health & Human Services, USA - adapt for India: notify CERT-In or health ministry)
- Within 60 days (if >500 patients)
- Annual report (if <500 patients, aggregate all small breaches)

##### **13. Breach Investigation**
- **Root Cause Analysis**
  - How did breach occur? (phishing email, lost device, hacking)
  
- **Corrective Actions**
  - Fix vulnerability (patch software, enhance training, improve access controls)
  
- **Document**
  - Breach report (for auditors, regulators)

#### **E. HIPAA AUDITS**

##### **14. Internal Audits**
- **Quarterly/Annual**
  - Audit access logs (random sample: 100 patient records, check who accessed, was access legitimate?)
  - Audit physical security (server room access logs, workstation locks)
  - Audit policies (are policies followed?)

##### **15. External Audits** (HHS/OCR - Office for Civil Rights)
- **Random Audits**
  - HHS may audit hospitals (random selection)
  - Desk audit (submit documents) OR on-site audit
  
- **Complaint-Driven Audits**
  - If patient complains (my privacy violated), HHS investigates

##### **16. Audit Findings**
- **Compliant**: No issues
- **Non-Compliant**: Violations found
  - Corrective Action Plan (CAP) required
  - Fines (if serious violations: $100 to $50,000 per violation, max $1.5 million per year)
  - Criminal penalties (if willful neglect)

#### **F. HIPAA MODULE FEATURES**

##### **17. HIPAA Dashboard**
- **Compliance Scorecard**
  - Privacy compliance (%), Security compliance (%)
  - Risk areas (red flags)
  
- **Training Status**
  - % staff completed HIPAA training (target: 100%)
  
- **Breach Tracker**
  - Open breaches, investigations, notifications sent

##### **18. Access Log Auditing**
- **Audit Tool**
  - Search access logs (by patient, by user, by date)
  - Filter: Unusual access (access outside working hours, high volume access, access to VIP patients)
  
- **Alerts**
  - Auto-alert if unusual pattern (employee accessed 500 records in 1 hour - potential data theft)

##### **19. Patient Request Management**
- **Request Tracker**
  - Patient requests (access records, amend, accounting of disclosures)
  - Status (pending, completed, denied)
  - Deadlines (30 days, auto-reminders)

##### **20. Policy Repository**
- **HIPAA Policies**
  - Privacy policy, Security policy, Breach notification policy
  - Accessible to all staff

##### **21. Training Module**
- **Online HIPAA Training**
  - Interactive course (videos, scenarios, quiz)
  - Certificate on completion
  - Track completions (by employee, by department)
  - Annual refresher (auto-assign yearly)

##### **22. Incident Reporting** (Overlap with Module 36 Audit)
- **Report Suspected Breach**
  - Form (what happened, when, who involved, PHI affected)
  - Auto-notify Privacy Officer
  
- **Investigation Workflow**
  - Assign investigator, track progress, document findings, corrective actions

##### **23. Business Associate Management**
- **Business Associates** (Third-party vendors who handle PHI: EMR vendor, cloud hosting, billing company)
  - List all BAs
  - BAA (Business Associate Agreement) - contract requiring BA to protect PHI
  - Track BAA expiry, renewal

### **Integration Points**:
- ← **From All Modules**: Access logs, PHI transactions
- → **To Security (Module 40)**: Access control, encryption, monitoring
- → **To HR (Module 33)**: Training compliance
- → **To Legal**: Breach notifications, compliance reports

---

## 📋 Module 36: Audit Management

**Status**: 🟡 Partial (Basic audit trails exist, comprehensive audit module missing)  
**Role Access**: Auditors, Quality Team, Compliance Team, Management

### **Complete Workflow**:

#### **A. AUDIT TYPES**

##### **1. Internal Audits**
- **Operational Audits**
  - Review processes (billing, inventory, patient care)
  - Efficiency, compliance with SOPs
  
- **Clinical Audits**
  - Medical record audits (documentation completeness)
  - Medication audits (prescription compliance)
  - Infection control audits
  
- **Financial Audits** (Covered in Module 32)
  - Review financial transactions
  
- **IT Audits**
  - System access logs, data security

##### **2. External Audits**
- **Regulatory Audits**
  - Government inspections (health dept, drug controller)
  - NABH assessment (Module 34)
  
- **Insurance/TPA Audits**
  - Review claims, verify treatment provided
  
- **ISO Audits** (if ISO certified)
  - Quality management system audit

##### **3. Compliance Audits**
- **HIPAA Compliance** (Module 35)
- **NABH Compliance** (Module 34)
- **Labor Law Compliance**
- **Tax Compliance**

#### **B. AUDIT PLANNING**

##### **4. Annual Audit Plan**
- **Risk-Based Approach**
  - High-risk areas (OT, pharmacy, billing) → frequent audits (monthly)
  - Low-risk areas → less frequent (quarterly, annual)
  
- **Audit Calendar**
  - Schedule all audits (month, department, auditor, type)

##### **5. Audit Team Selection**
- **Internal Auditors**
  - Quality team, designated staff (trained in auditing)
  
- **Independence**
  - Auditor should not audit own department (conflict of interest)
  
- **External Auditors** (for statutory audits)
  - Chartered Accountants (financial audit)
  - NABH assessors (NABH audit)

#### **C. AUDIT EXECUTION**

##### **6. Pre-Audit**
- **Notify Department**
  - Inform department head (1-2 weeks notice) OR surprise audit (for fraud detection)
  
- **Audit Checklist**
  - Prepare checklist (based on standards, SOPs, regulations)

##### **7. Audit Fieldwork**
- **Opening Meeting**
  - Auditor + department team
  - Explain audit scope, timeline
  
- **Document Review**
  - Review records, logs, reports
  - Example: Medical record audit → review 30 patient files (random sample)
  
- **Interviews**
  - Ask staff (understand processes, check knowledge)
  
- **Observations**
  - Observe actual practices (hand hygiene compliance, medication administration)
  
- **Testing**
  - Test controls (try accessing system with wrong password, verify access denied)

##### **8. Audit Findings**
- **Categorize Findings**
  - **Compliant**: No issues (green)
  - **Observation**: Minor gaps, suggestions (yellow)
  - **Non-Conformity (NC)**: Violation of standard/SOP (red)
    - **Minor NC**: Low risk
    - **Major NC**: High risk, patient safety concern
  
- **Document Findings**
  - Finding statement (clear, specific)
  - Evidence (what was observed, which documents)
  - Standard/SOP violated

##### **9. Closing Meeting**
- **Present Findings**
  - Auditor presents to department team
  - Discuss, clarify
  
- **Department Response**
  - Accept findings OR dispute (if disagree, provide evidence)

#### **D. AUDIT REPORTING**

##### **10. Audit Report**
- **Structure**
  - **Executive Summary**: Overall assessment, score, major findings
  - **Scope**: What was audited
  - **Methodology**: How audit conducted
  - **Findings**: Detailed list (compliant, observations, NCs)
  - **Recommendations**: Corrective actions suggested
  
- **Scoring** (if applicable)
  - Compliance % = (Compliant items / Total items) × 100
  - Example: 85% compliant (15% gaps)

##### **11. Report Distribution**
- **To Department Head**: For corrective actions
- **To Quality Team**: Track compliance
- **To Management**: Overall compliance status

#### **E. CORRECTIVE & PREVENTIVE ACTIONS (CAPA)**

##### **12. Corrective Action Plan (CAP)**
- **For Each NC**
  - **Root Cause Analysis**: Why did NC occur? (lack of training, unclear SOP, system issue)
  - **Corrective Action**: Fix immediate issue (retrain staff, update SOP, fix system)
  - **Responsibility**: Who will do (assign owner)
  - **Timeline**: By when (deadline: 30 days, 60 days)
  
- **Preventive Action**
  - Prevent recurrence (systemic fix)
  - Example: If NC due to unclear SOP → revise SOP for all departments (not just audited one)

##### **13. CAP Submission**
- **Department Submits CAP**
  - Within 15 days of audit report
  - Quality team reviews, approves

##### **14. CAP Implementation**
- **Department Implements**
  - Complete actions by deadline
  - Provide evidence (photos, updated documents, training records)

##### **15. CAP Verification**
- **Auditor Verifies**
  - Follow-up audit (check if actions completed, effective)
  - Close NC if satisfied OR keep open if not resolved

#### **F. AUDIT TRACKING & FOLLOW-UP**

##### **16. Audit Register**
- **Log All Audits**
  - Audit ID, Date, Department, Auditor, Type, Score, Findings count

##### **17. NC Tracker**
- **Open NCs**
  - List all NCs (from all audits)
  - Status: Open, CAP submitted, CAP under implementation, Closed
  - Overdue NCs (highlighted red)

##### **18. Follow-Up Audits**
- **Re-Audit**
  - For departments with major NCs (re-audit after 3 months)
  - Verify improvements

#### **G. AUDIT ANALYTICS**

##### **19. Audit Dashboards**
- **Compliance Trends**
  - Monthly compliance % (line graph)
  - Improving OR declining?
  
- **Department-Wise Compliance**
  - Which departments score high (>90%), which need improvement (<70%)
  
- **Audit Frequency**
  - Audits conducted vs planned (target: 100% of planned audits)

##### **20. Finding Analysis**
- **Top 5 NCs**
  - Most common NCs (across all audits)
  - Example: "Incomplete medication orders" - recurring issue
  - Action: Hospital-wide training, system enhancement (force mandatory fields)

##### **21. Audit Cost**
- **Cost of Auditing**
  - Auditor time, external auditor fees
  - Cost of non-compliance (fines, corrective actions)
  
- **ROI**
  - Audits prevent bigger issues (patient harm, regulatory penalties)

#### **H. INCIDENT MANAGEMENT** (Adverse Events)

##### **22. Incident Reporting**
- **Staff Reports Incident**
  - Medication error, patient fall, equipment failure, near-miss
  - Online form OR paper form (anonymous OR identified)
  
- **Incident Categories**
  - Patient safety (falls, medication errors, hospital-acquired infections)
  - Staff safety (needle stick injury, assault)
  - Security (theft, trespassing)
  - Facility (fire, power failure, equipment breakdown)

##### **23. Incident Investigation**
- **Severity Grading**
  - **Level 1**: No harm (near-miss, caught in time)
  - **Level 2**: Minor harm (temporary discomfort)
  - **Level 3**: Moderate harm (extended stay, additional treatment)
  - **Level 4**: Major harm (permanent disability)
  - **Level 5**: Death
  
- **Investigation**
  - Level 1-2: Departmental investigation (quick review)
  - Level 3-5: Root Cause Analysis (RCA) - detailed investigation

##### **24. Root Cause Analysis (RCA)**
- **RCA Team**
  - Quality team, department head, involved staff
  
- **5 Whys Technique**
  - Ask "Why?" repeatedly (till root cause found)
  - Example: Medication error
    - Why error? Nurse gave wrong dose
    - Why wrong dose? Misread prescription
    - Why misread? Handwriting illegible
    - Why illegible? No electronic prescribing
    - Root cause: Lack of e-prescribing system
  
- **Fishbone Diagram** (Ishikawa)
  - Identify contributing factors (Man, Machine, Method, Material, Environment)
  
- **RCA Report**
  - Root cause, contributing factors, corrective actions, preventive actions

##### **25. Incident Closure**
- **Implement CAPA**
  - Corrective actions (train staff, fix system)
  - Preventive actions (prevent similar incidents hospital-wide)
  
- **Close Incident**
  - After verification, close
  
- **Share Learnings**
  - Hospital-wide alert (anonymized case study, prevent others from same error)

#### **I. AUDIT MODULE FEATURES**

##### **26. Audit Planning Module**
- **Create Audit Plan**
  - Annual plan (calendar view)
  - Assign auditors, departments, dates
  
- **Reminders**
  - Upcoming audits (auto-notify auditor, department)

##### **27. Audit Execution Module**
- **Mobile Audit App**
  - Checklist on tablet/phone
  - Offline capable (sync later)
  - Take photos (evidence)
  
- **Real-Time Scoring**
  - Auto-calculate compliance %

##### **28. Finding & CAPA Management**
- **Log Findings**
  - Category, severity, evidence, standard violated
  
- **CAP Workflow**
  - Assign to department, set deadline
  - Track progress, reminders
  - Verify, close

##### **29. Incident Management System**
- **Report Incident**
  - Online form (easy access)
  
- **Incident Workflow**
  - Auto-assign investigator (based on severity)
  - Investigation, RCA, CAPA
  - Close incident

##### **30. Reporting & Analytics**
- **Audit Reports**
  - Generate audit report (PDF, Excel)
  - Send to stakeholders
  
- **Dashboards**
  - Compliance trends, NC tracker, incident tracker
  
- **Regulatory Reports**
  - For NABH, ISO (export data in required format)

### **Integration Points**:
- ← **From All Modules**: Audit trails, logs, transaction data
- → **To Quality Team**: Compliance status, findings, CAPAs
- → **To Management**: Audit summary, risk areas
- → **To NABH/HIPAA Modules**: Compliance data

---

## 📊 Module 37: Reports

**Status**: 🟡 Partial (Basic reports exist across modules, comprehensive reporting missing)  
**Role Access**: All Roles (based on access permissions)

### **Complete Workflow**:

**(Note: This module aggregates all reporting capabilities across the hospital system)**

#### **A. CLINICAL REPORTS**

##### **1. Patient Reports**
- **Patient List**
  - All patients (filter by date range, department, doctor)
  - Export to Excel
  
- **Patient Demographics**
  - Age distribution, gender distribution, location (city-wise)
  
- **New Patient vs Repeat Patient**
  - Monthly trend (new registrations vs follow-up visits)

##### **2. OPD Reports**
- **Daily OPD Summary**
  - Total patients seen (by department, by doctor)
  - Average patients per doctor
  
- **OPD Revenue**
  - Consultation revenue (by doctor, by department)
  
- **Appointment Statistics**
  - Appointments scheduled, kept, no-shows, cancellations

##### **3. IPD Reports**
- **Daily Census**
  - Total admissions, discharges, current occupancy
  - Occupancy rate (% beds occupied)
  
- **Average Length of Stay (ALOS)**
  - By department, by diagnosis, by doctor
  
- **Readmission Rate**
  - 30-day readmissions (same diagnosis)

##### **4. OT Reports**
- **Surgery Statistics**
  - Total surgeries (by procedure, by surgeon, by OT room)
  - Emergency vs elective
  
- **OT Utilization**
  - OT hours used vs available (utilization %)
  - Average surgery duration
  
- **Surgical Outcomes**
  - Complications rate, infection rate

##### **5. Pharmacy Reports** (Covered in Module 8)
- **Dispensing Report**
  - Total prescriptions, medications dispensed
  - Revenue
  
- **Drug Utilization**
  - Top 10 drugs (by quantity, by value)
  
- **Inventory Reports** (Covered in Module 12)

##### **6. Laboratory Reports** (Covered in Module 14)
- **Test Volume**
  - Tests performed (by type, by day)
  
- **TAT Compliance**
  - % tests completed within TAT
  
- **Critical Values**
  - All critical results reported

##### **7. Diagnostics Reports** (Covered in Module 21)
- **Imaging Volume**
  - Scans performed (X-ray, CT, MRI, OCT, fundus)
  
- **Equipment Utilization**
  - Per equipment (CT machine used X hours per day)

##### **8. Disease Registry**
- **Diagnosis-Wise Patient Count**
  - Total patients with diabetes, hypertension, glaucoma, cataract, etc.
  
- **ICD-10 Code Report**
  - Top diagnoses (by frequency)

##### **9. Doctor Performance**
- **Patient Volume**
  - Patients seen per doctor (OPD, IPD, surgeries)
  
- **Revenue per Doctor**
  - Consultation revenue, surgery revenue
  
- **Patient Satisfaction**
  - Average rating per doctor (from feedback)

#### **B. FINANCIAL REPORTS** (Covered in Module 32)

##### **10. Revenue Reports**
- **Daily Collection Report**
  - Total collection (by mode: cash, card, UPI, insurance)
  
- **Revenue by Service**
  - OPD, IPD, diagnostics, pharmacy, surgery
  
- **Revenue Trends**
  - Month-over-month, year-over-year

##### **11. Outstanding Reports**
- **Accounts Receivable Aging**
  - 0-30 days, 31-60, 61-90, >90 days
  
- **Insurance Claims Pending**
  - Claims submitted, approved, pending payment

##### **12. Expense Reports**
- **Expense by Category**
  - Salaries, medications, utilities, marketing
  
- **Budget vs Actual**
  - Variance analysis

##### **13. Profitability Reports**
- **P&L Statement** (Profit & Loss)
  - Revenue, expenses, net profit
  
- **Department Profitability**
  - Which departments profitable, which loss-making

##### **14. Cash Flow Reports**
- **Cash Flow Statement**
  - Inflows, outflows, net cash flow

#### **C. OPERATIONAL REPORTS**

##### **15. Bed Management Reports** (Covered in Module 19)
- **Bed Occupancy**
  - Daily/monthly occupancy rate
  
- **Bed Turnover**
  - Average time bed vacant to next admission

##### **16. Queue Management Reports** (Covered in Module 15)
- **Average Wait Time**
  - By department, by doctor
  
- **Queue Performance**
  - Patients processed per hour

##### **17. Appointment Reports**
- **Appointment Utilization**
  - Slots booked vs slots available
  
- **No-Show Rate**
  - % appointments not kept

##### **18. Inventory Reports** (Covered in Module 12)
- **Stock Status**
  - Current stock levels, stock value
  
- **Stock Movement**
  - Consumption by department
  
- **Expiry Report**
  - Items expiring soon

##### **19. Equipment Reports**
- **Equipment Downtime**
  - Hours unavailable (due to breakdown, maintenance)
  
- **Equipment Utilization**
  - Usage hours per equipment

##### **20. Housekeeping Reports** (Covered in Module 25)
- **Cleaning Compliance**
  - Tasks completed on time
  
- **Waste Disposal**
  - Biomedical waste quantity (monthly)

#### **D. HR REPORTS** (Covered in Module 33)

##### **21. Headcount Reports**
- **Employee Strength**
  - Total employees (by department, by designation)
  
- **Attrition Report**
  - Resignations, terminations (monthly, YTD)

##### **22. Attendance Reports**
- **Attendance Summary**
  - Present, absent, leave (by employee, by department)
  
- **Leave Balance Report**
  - Leave accrued, utilized, balance (per employee)

##### **23. Payroll Reports**
- **Salary Summary**
  - Total payroll cost (monthly)
  
- **Statutory Reports**
  - PF, ESI, TDS returns

#### **E. QUALITY & COMPLIANCE REPORTS**

##### **24. NABH Reports** (Covered in Module 34)
- **Quality Indicators**
  - Infection rates, medication errors, patient falls
  
- **Audit Compliance**
  - % compliance per standard

##### **25. HIPAA Reports** (Covered in Module 35)
- **Access Logs**
  - PHI access audit (who accessed what, when)
  
- **Training Compliance**
  - % staff completed HIPAA training

##### **26. Audit Reports** (Covered in Module 36)
- **Audit Summary**
  - Audits conducted, findings, NCs
  
- **Incident Reports**
  - Total incidents, by category, by severity

##### **27. Patient Safety Reports**
- **Adverse Events**
  - Medication errors, falls, hospital-acquired infections
  
- **Near-Miss Reports**
  - Incidents caught before harm

#### **F. PATIENT FEEDBACK REPORTS** (Covered in Module 26)

##### **28. Satisfaction Reports**
- **Overall Satisfaction Score**
  - Average rating (1-5 scale)
  
- **NPS (Net Promoter Score)**
  - Promoters, passives, detractors
  
- **Feedback Summary**
  - Top complaints, top compliments

#### **G. INSURANCE & CLAIMS REPORTS**

##### **29. Insurance Reports**
- **Claim Submission**
  - Claims submitted (by TPA, by month)
  
- **Claim Approval Rate**
  - % claims approved vs rejected
  
- **Claim TAT**
  - Average days from submission to payment

##### **30. Corporate Billing Reports**
- **Corporate Revenue**
  - By corporate client
  
- **Outstanding by Corporate**
  - Overdue invoices

#### **H. REGULATORY & STATUTORY REPORTS**

##### **31. Government Reports**
- **Disease Notification**
  - Notifiable diseases (TB, HIV, COVID - report to health dept)
  
- **Birth & Death Register**
  - If deliveries/deaths at hospital (mandatory reporting)

##### **32. Medical Council Reports**
- **Doctor Registration**
  - List of doctors, registration numbers, validity

##### **33. Drug Controller Reports**
- **Narcotic Register**
  - Controlled substances (purchase, consumption, balance)

#### **I. EXECUTIVE REPORTS**

##### **34. Executive Dashboard** (Real-Time)
- **KPIs**
  - Total Revenue (MTD, YTD)
  - Profit Margin
  - Patient Volume (OPD, IPD)
  - Bed Occupancy
  - Outstanding Receivables
  
- **Visualizations**
  - Graphs, charts (revenue trend, patient trend)

##### **35. Board Reports** (Monthly/Quarterly)
- **Comprehensive Report**
  - Financial performance (P&L, balance sheet, cash flow)
  - Operational performance (patient volume, OT utilization, bed occupancy)
  - Quality metrics (patient satisfaction, infection rates, NABH compliance)
  - HR metrics (headcount, attrition)
  
- **Strategic Insights**
  - Trends, risks, opportunities

#### **J. AD-HOC REPORTS**

##### **36. Custom Reports**
- **Report Builder**
  - User can create custom reports (drag-and-drop fields)
  - Filter, sort, group by
  
- **Saved Reports**
  - Save frequently used reports (for quick access)

##### **37. Scheduled Reports**
- **Auto-Generate**
  - Schedule reports (daily, weekly, monthly)
  - Auto-email to recipients (CEO gets monthly report every 1st)

#### **K. REPORT EXPORT & SHARING**

##### **38. Export Formats**
- **PDF**: For printing, sharing
- **Excel**: For further analysis
- **CSV**: For data import to other systems

##### **39. Email Reports**
- **Auto-Email**
  - Send reports to stakeholders (on schedule OR on-demand)

##### **40. Report Access Control**
- **Role-Based**
  - Doctors see clinical reports, finance sees financial reports
  - Sensitive reports (salaries, profitability) - restricted to senior management

### **Integration Points**:
- ← **From All Modules**: Data for reporting (patient data, financial data, operational data, quality data)
- → **To All Users**: Reports accessible based on role
- → **To Management**: Executive dashboards, board reports

---

## 📈 Module 38: Analytics (Business Intelligence)

**Status**: ❌ Missing (Not implemented)  
**Role Access**: Analysts, Management, Decision-Makers

### **Complete Workflow**:

**(Note: Analytics extends Module 37 Reports with advanced data analysis, predictive models, AI/ML)**

#### **A. DESCRIPTIVE ANALYTICS** (What Happened?)

##### **1. Historical Data Analysis**
- **Trends**
  - Patient volume trends (last 3 years)
  - Revenue trends
  - Seasonal patterns (more cataract surgeries in winter?)

##### **2. KPI Dashboards** (Real-Time)
- **Operational KPIs**
  - Bed occupancy rate, OT utilization, average wait time
  
- **Financial KPIs**
  - Revenue, profit margin, receivables days
  
- **Clinical KPIs**
  - Average length of stay, readmission rate, infection rate
  
- **HR KPIs**
  - Headcount, attrition rate, training compliance

##### **3. Benchmarking**
- **Internal Benchmarking**
  - Compare branches (Branch A vs Branch B: which performs better?)
  - Compare doctors (who has better outcomes?)
  
- **External Benchmarking**
  - Compare with industry standards (NABH benchmarks, national averages)

#### **B. DIAGNOSTIC ANALYTICS** (Why Did It Happen?)

##### **4. Root Cause Analysis**
- **Identify Drivers**
  - Revenue declined 10% last month → Why?
    - Fewer OPD visits? Lower surgery volume? Increase in discounts?
  
- **Drill-Down**
  - Click on metric → drill down (revenue → by department → by doctor → by service)

##### **5. Variance Analysis**
- **Budget vs Actual**
  - Why expenses 15% over budget?
    - Which categories overspent? (salaries, medications, utilities)

##### **6. Correlation Analysis**
- **Identify Relationships**
  - Patient satisfaction score vs wait time (negative correlation: longer wait → lower satisfaction)
  - Marketing spend vs new patient acquisition (positive correlation)

#### **C. PREDICTIVE ANALYTICS** (What Will Happen?)

##### **7. Forecasting**
- **Revenue Forecast**
  - Predict next quarter revenue (based on historical trends, seasonality)
  
- **Patient Volume Forecast**
  - Predict OPD visits, IPD admissions (for capacity planning)
  
- **Inventory Demand Forecast**
  - Predict medication consumption (to optimize stock levels)

##### **8. Predictive Models** (Machine Learning)
- **Patient Readmission Prediction**
  - ML model: Predict which patients likely to be readmitted (based on diagnosis, age, comorbidities, previous admissions)
  - Intervention: Intensive discharge planning for high-risk patients
  
- **No-Show Prediction**
  - Predict which appointment likely no-show (based on past behavior, time of day, weather)
  - Action: Overbooking, send extra reminders
  
- **Disease Progression Prediction**
  - Glaucoma progression (predict based on IOP trends, VF trends)
  - Early intervention

##### **9. Churn Prediction**
- **Patient Attrition**
  - Predict which patients likely to switch hospitals (based on satisfaction scores, complaints, missed appointments)
  - Retention strategy: Call patient, offer incentive (discount on next visit)

#### **D. PRESCRIPTIVE ANALYTICS** (What Should We Do?)

##### **10. Optimization**
- **OT Scheduling Optimization**
  - Algorithm: Optimize OT schedule (minimize idle time, balance surgeon workload, reduce patient wait)
  
- **Staff Scheduling Optimization**
  - Optimal nurse shifts (meet coverage needs, minimize overtime, respect preferences)
  
- **Inventory Optimization**
  - Optimal stock levels (minimize stockouts + minimize carrying cost)

##### **11. Recommendation Engine**
- **Treatment Recommendations** (Clinical Decision Support)
  - Based on patient data, suggest optimal treatment (from clinical guidelines, historical outcomes)
  
- **Personalized Marketing**
  - Recommend services to patients (diabetic patients → recommend annual retinal exam)

##### **12. Scenario Analysis** (What-If)
- **Simulate Scenarios**
  - What if we add 10 more beds? (impact on revenue, costs, occupancy)
  - What if we hire 2 more ophthalmologists? (patient wait time reduction, revenue increase)
  
- **Decision Support**
  - Compare scenarios, choose best option

#### **E. DATA VISUALIZATION**

##### **13. Interactive Dashboards**
- **Drag-and-Drop Builder**
  - Users create custom dashboards (no coding)
  - Widgets: Charts, tables, KPI cards, maps
  
- **Filters**
  - Date range, department, doctor, location (dynamic filtering)

##### **14. Chart Types**
- **Line Charts**: Trends over time
- **Bar Charts**: Comparisons (revenue by department)
- **Pie Charts**: Proportions (revenue mix)
- **Heat Maps**: Patterns (busiest hours, days)
- **Scatter Plots**: Correlations
- **Maps**: Geographic distribution (patient locations)

##### **15. Drill-Down & Drill-Through**
- **Drill-Down**
  - Click on total revenue → see by department → see by doctor → see by service
  
- **Drill-Through**
  - Click on data point → see underlying transactions

#### **F. DATA MINING**

##### **16. Pattern Recognition**
- **Identify Patterns**
  - Patients who book appointments on Mondays have 20% higher no-show rate
  - Diabetic patients aged 60+ have 3× higher risk of readmission
  
- **Actionable Insights**
  - Send extra reminders for Monday appointments
  - Intensive care for diabetic elderly patients

##### **17. Segmentation**
- **Patient Segmentation**
  - High-value patients (frequent visits, high spending)
  - Chronic disease patients (diabetes, glaucoma - need regular monitoring)
  - At-risk patients (poor compliance, high no-show)
  
- **Targeted Interventions**
  - High-value: VIP treatment, loyalty program
  - Chronic: Automated reminders, health tips
  - At-risk: Call before appointment, flexible scheduling

##### **18. Market Basket Analysis**
- **Service Bundling**
  - Patients who get cataract surgery also often get IOL upgrade (premium IOL)
  - Patients who get refraction also often buy glasses
  
- **Cross-Selling**
  - Recommend related services (patient getting diabetic checkup → recommend eye exam)

#### **G. AI & MACHINE LEARNING**

##### **19. AI-Powered Insights**
- **Anomaly Detection**
  - AI detects unusual patterns (sudden spike in infection rate, unusual billing pattern)
  - Alert management
  
- **Natural Language Processing (NLP)**
  - Analyze patient feedback (text reviews) → extract sentiment (positive, negative), topics (long wait, rude staff, excellent doctor)
  
- **Image Analysis** (for ophthalmology)
  - AI detects diabetic retinopathy from fundus images (screening tool)
  - AI grading of cataract severity

##### **20. Chatbot for Analytics**
- **Ask Questions in Plain English**
  - "What was our revenue last month?"
  - "Which doctor performed the most surgeries in Q1?"
  - System answers (shows chart, table)

#### **H. REPORTING & ALERTS**

##### **21. Automated Insights**
- **Daily Insights Email**
  - System auto-generates insights (revenue up 5% vs yesterday, 3 patients readmitted within 30 days, bed occupancy at 95% - consider adding beds)

##### **22. Threshold Alerts**
- **Set Thresholds**
  - If bed occupancy >90%, alert admin (capacity issue)
  - If medication error rate >1%, alert quality team
  
- **Proactive Alerts**
  - Early warning (before problem escalates)

#### **I. ANALYTICS MODULE FEATURES**

##### **23. Data Warehouse**
- **Centralized Data Repository**
  - Aggregate data from all modules (EMR, billing, pharmacy, lab, OT, etc.)
  - ETL (Extract, Transform, Load) process (nightly sync)
  
- **Data Model**
  - Star schema (fact tables, dimension tables) for fast querying

##### **24. OLAP (Online Analytical Processing)**
- **Multi-Dimensional Analysis**
  - Slice & dice data (revenue by department, by doctor, by month, by service)
  - Pivot tables

##### **25. Self-Service BI**
- **Empower Users**
  - Users create own reports, dashboards (without IT help)
  - Report builder, dashboard builder

##### **26. Mobile Analytics**
- **Mobile App**
  - Executives access dashboards on phone (iOS, Android)
  - Real-time KPIs

##### **27. Export & Integration**
- **Export Analytics**
  - Export data to Excel, PowerPoint (for presentations)
  
- **API Integration**
  - External systems can query analytics (via API)

### **Integration Points**:
- ← **From All Modules**: All transaction data, master data
- ← **From Data Warehouse**: Historical data
- → **To Management**: Insights, dashboards, forecasts
- → **To All Users**: Self-service analytics

---

## 📱 Module 39: Patient Portal (Patient-Facing App/Website)

**Status**: ❌ Missing (Not implemented)  
**Role Access**: Patients (registered users)

### **Complete Workflow**:

#### **A. PATIENT REGISTRATION & LOGIN**

##### **1. Self-Registration**
- **Sign Up**
  - Patient creates account (name, DOB, phone, email, password)
  - Verify phone (OTP) OR email
  
- **Link to Hospital Record**
  - Enter MRN (if existing patient) OR auto-create on first visit

##### **2. Login**
- **Credentials**
  - Username (phone/email) + password
  
- **2FA (Two-Factor Authentication)** (optional)
  - OTP for added security

##### **3. Profile Management**
- **Update Profile**
  - Contact details, address, emergency contact
  - Upload profile photo
  
- **Family Members**
  - Add family members (link to same account for easy access)
  - Parent manages kids' health records

#### **B. APPOINTMENTS**

##### **4. Book Appointment**
- **Select Doctor**
  - Browse doctors (by specialty, name, location)
  - View doctor profile (qualifications, experience, rating, available slots)
  
- **Select Date & Time**
  - Calendar view (available slots green, booked slots gray)
  
- **Appointment Type**
  - New patient, Follow-up, Video consultation
  
- **Payment** (if advance payment required)
  - Pay online (card, UPI, wallet)
  
- **Confirmation**
  - Appointment confirmed (email + SMS)

##### **5. View Appointments**
- **Upcoming Appointments**
  - List (date, time, doctor, location)
  
- **Past Appointments**
  - History (with visit summaries)

##### **6. Reschedule/Cancel Appointment**
- **Reschedule**
  - Select new date/time (if available)
  
- **Cancel**
  - Cancel appointment (cancellation policy: 24 hours notice, else fee forfeit)

##### **7. Appointment Reminders**
- **Auto-Reminders**
  - 24 hours before, 2 hours before (SMS, email, push notification)

#### **C. MEDICAL RECORDS**

##### **8. View Health Records**
- **Summary**
  - Active diagnoses, current medications, allergies
  
- **Visits**
  - All past visits (doctor notes, prescriptions)
  
- **Lab Results**
  - All lab reports (viewable, downloadable)
  - Trend charts (blood sugar over 6 months)
  
- **Imaging Reports**
  - Radiology, ophthalmology scans (view images if DICOM viewer integrated, OR download PDFs)
  
- **Discharge Summaries**
  - All IPD admissions (discharge summary, operative notes)

##### **9. Download Records**
- **Export**
  - Download individual reports (PDF)
  - Download comprehensive health summary (all records in one PDF)

##### **10. Share Records**
- **Share with Doctor** (outside hospital)
  - Generate shareable link (time-limited, password-protected)
  - Email reports to another doctor
  
- **Print**
  - Print records (for insurance, visa, etc.)

#### **D. PRESCRIPTIONS & MEDICATIONS**

##### **11. View Prescriptions**
- **Current Prescriptions**
  - Active medications (drug, dose, frequency, duration)
  
- **Past Prescriptions**
  - History (all prescriptions ever received)

##### **12. Medication Reminders**
- **Set Reminders** (optional)
  - App sends reminder (time to take medication)
  - Track adherence (mark "taken")

##### **13. Order Medications** (if hospital offers home delivery)
- **Upload Prescription**
  - Order from hospital pharmacy
  - Home delivery (pay online)

#### **E. BILLING & PAYMENTS**

##### **14. View Bills**
- **All Bills**
  - Date, bill number, amount, status (paid, pending)
  
- **Bill Details**
  - Itemized bill (services, charges, taxes)

##### **15. Pay Bills Online**
- **Payment Gateway**
  - Pay pending bills (card, UPI, net banking, wallet)
  
- **Payment Confirmation**
  - Receipt emailed + SMS

##### **16. Download Receipts**
- **All Receipts**
  - Download receipts (for insurance claims, reimbursement)

##### **17. Insurance Claims**
- **Submit Claim**
  - Upload bills, reports
  - Track claim status (if hospital processes via portal)

#### **F. VIDEO CONSULTATION** (Telemedicine)

##### **18. Book Video Consult**
- **Select Doctor**
  - Doctors offering tele-consults
  
- **Schedule**
  - Date, time
  
- **Payment**
  - Pay in advance

##### **19. Video Call**
- **Join Video Session**
  - At appointment time, click "Join Call"
  - Integrated video (WebRTC) OR external link (Zoom)
  
- **Upload Reports**
  - Share lab reports, images during call (screen share)

##### **20. Post-Consult**
- **E-Prescription**
  - Doctor sends prescription (via portal)
  - Patient views, downloads

#### **G. HEALTH TRACKING**

##### **21. Manual Entry** (Patient Self-Tracking)
- **Vitals**
  - Blood pressure, blood sugar, weight (enter manually)
  - Track trends (line graphs)
  
- **Symptoms**
  - Log symptoms (headache, blurred vision, pain)
  - Share with doctor on next visit

##### **22. Wearable Integration** (Advanced)
- **Sync Wearables**
  - Fitbit, Apple Watch, glucose monitors
  - Auto-import data (steps, heart rate, blood sugar)

##### **23. Health Goals**
- **Set Goals**
  - Lose 5 kg in 3 months, walk 10,000 steps/day
  - Track progress

#### **H. HEALTH EDUCATION**

##### **24. Health Library**
- **Articles**
  - Eye health tips, disease information (cataract, glaucoma, diabetic retinopathy)
  - Videos (how to instill eye drops, post-surgery care)
  
- **FAQs**
  - Common questions (when to see eye doctor, what is cataract, etc.)

##### **25. Personalized Health Tips**
- **Based on Profile**
  - Diabetic patients: Tips on diet, sugar monitoring, annual eye exam
  - Post-surgery patients: Recovery tips, warning signs

##### **26. Newsletters**
- **Email Newsletters**
  - Monthly health tips, hospital news, promotions

#### **I. COMMUNICATION**

##### **27. Secure Messaging**
- **Message Doctor/Hospital**
  - Non-urgent queries (send message to doctor, nurse, front desk)
  - Response within 24-48 hours (not for emergencies)

##### **28. Notifications**
- **Push Notifications**
  - Appointment reminders, lab results ready, bill generated
  
- **SMS, Email**
  - Backup notifications

##### **29. Feedback**
- **Rate Experience**
  - After visit, rate doctor (1-5 stars), facility, service
  - Write review
  
- **Surveys**
  - Patient satisfaction surveys (receive via portal)

#### **J. FAMILY HEALTH MANAGEMENT**

##### **30. Family Accounts**
- **Add Family Members**
  - Spouse, kids, parents (link to same portal login)
  
- **Switch Profiles**
  - View/manage health records for each family member
  - Book appointments for kids, parents

##### **31. Caregiver Access**
- **Grant Access**
  - Elderly parent grants access to adult child (view records, book appointments on behalf)

#### **K. LOYALTY & REWARDS** (Optional)

##### **32. Loyalty Program**
- **Earn Points**
  - Every visit, procedure, referral (earn points)
  
- **Redeem Points**
  - Discounts on future services, free health checkup

##### **33. Referral Program**
- **Refer Friends**
  - Share referral code
  - Both get discount (if friend books appointment)

#### **L. PATIENT PORTAL FEATURES**

##### **34. Multi-Platform**
- **Web Portal**
  - Desktop, laptop (full-featured)
  
- **Mobile App**
  - iOS, Android (native apps)
  - Responsive web (works on mobile browser)

##### **35. Accessibility**
- **Multiple Languages**
  - English, Hindi, regional languages
  
- **Voice Commands** (Advanced)
  - "Book appointment with Dr. A"
  
- **Large Text** (for elderly)
  - Adjustable font size

##### **36. Security**
- **Data Encryption**
  - All data encrypted (HTTPS, at rest)
  
- **HIPAA Compliant** (if applicable)
  - Secure PHI handling

##### **37. Offline Access** (Mobile App)
- **Download Records**
  - View offline (useful if no internet during travel)

##### **38. Integration with Wearables & Devices**
- **Sync Health Data**
  - Apple Health, Google Fit integration

### **Integration Points**:
- ← **From EMR (Module 23)**: Patient health records
- ← **From Billing (Module 11)**: Bills, payments
- ← **From Appointments (Module 1)**: Appointment scheduling
- ← **From Pharmacy (Module 8)**: Prescriptions
- ← **From Laboratory (Module 14)**: Lab results
- → **To Patients**: Self-service access to health information, appointment booking, communication

---

## 🔐 Module 40: Security & Compliance

**Status**: 🟡 Partial (Basic security exists, comprehensive security module missing)  
**Role Access**: Security Officer, IT Team, Compliance Team, Management

### **Complete Workflow**:

#### **A. ACCESS CONTROL**

##### **1. Authentication**
- **User Login**
  - Username + password (strong password policy: min 12 chars, upper, lower, digit, special char)
  - Password expiry (90 days), force change
  
- **Multi-Factor Authentication (MFA)**
  - OTP via SMS/email (for admin, finance, sensitive roles)
  - Authenticator app (Google Authenticator, Microsoft Authenticator)
  
- **Biometric Authentication** (Advanced)
  - Fingerprint, facial recognition (for mobile apps)

##### **2. Authorization (Role-Based Access Control - RBAC)**
- **Roles**
  - Doctor, Nurse, Admin, Billing, Pharmacist, Lab Tech, Management
  - Granular permissions (view, add, edit, delete, approve) per module
  
- **Principle of Least Privilege**
  - Users have minimum access needed (billing staff can't access clinical notes, doctors can't edit billing)

##### **3. Session Management**
- **Session Timeout**
  - Auto-logout after 15 min inactivity (security)
  
- **Concurrent Session Limit**
  - One user, one active session (prevent credential sharing)

##### **4. Access Logs (Audit Trail)**
- **Log All Access**
  - Who accessed what (patient record, module), when, from where (IP address)
  - Immutable logs (cannot be deleted, tampered)
  
- **Audit Review**
  - Periodic review (random sample, or targeted if suspicious activity)

#### **B. DATA SECURITY**

##### **5. Encryption**
- **Data at Rest**
  - Database encryption (AES-256)
  - File storage encryption
  
- **Data in Transit**
  - HTTPS (SSL/TLS) for web traffic
  - VPN for remote access
  - Encrypted email (if sending PHI via email)

##### **6. Data Masking**
- **Mask Sensitive Data**
  - Display partial data (phone: ***-***-1234, credit card: ****-****-****-1234)
  - For support staff (don't need full details)

##### **7. Data Backup**
- **Regular Backups**
  - Daily full backup (database, files)
  - Incremental backups (hourly)
  
- **Backup Storage**
  - Onsite (local server, NAS)
  - Offsite (cloud, remote data center)
  
- **Backup Encryption**
  - Encrypted backups (prevent unauthorized access to backup media)
  
- **Backup Testing**
  - Quarterly restore test (ensure backups work)

##### **8. Disaster Recovery**
- **Disaster Recovery Plan (DRP)**
  - Procedures for recovery (in case of fire, flood, cyberattack, system failure)
  
- **RTO (Recovery Time Objective)**
  - Target: System back online within X hours (e.g., 4 hours)
  
- **RPO (Recovery Point Objective)**
  - Maximum data loss tolerable (e.g., 1 hour - restore from last backup)
  
- **Failover**
  - Standby server (hot standby, warm standby, cold standby)
  - Auto-failover (if primary server fails, switch to standby)

#### **C. NETWORK SECURITY**

##### **9. Firewall**
- **Network Firewall**
  - Filter traffic (allow/block based on IP, port, protocol)
  - Perimeter security (between internet and hospital network)
  
- **Web Application Firewall (WAF)**
  - Protect web apps (block SQL injection, XSS attacks)

##### **10. Intrusion Detection/Prevention (IDS/IPS)**
- **Monitor Network**
  - Detect suspicious activity (port scanning, brute force attacks)
  
- **Alerts**
  - Alert security team (in real-time)
  
- **Block Attacks**
  - IPS auto-blocks malicious traffic

##### **11. VPN (Virtual Private Network)**
- **Remote Access**
  - Doctors, staff working from home (connect via VPN for secure access)
  - Encrypted tunnel

##### **12. Network Segmentation**
- **Separate Networks**
  - Clinical network (EMR, patient data) separate from guest Wi-Fi
  - IoT devices (medical equipment) on separate VLAN
  - Prevent lateral movement (if one network compromised, others safe)

#### **D. ENDPOINT SECURITY**

##### **13. Antivirus & Anti-Malware**
- **Install on All Devices**
  - Desktops, laptops, servers
  
- **Auto-Update**
  - Virus definitions updated daily
  
- **Regular Scans**
  - Scheduled scans (weekly full scan)

##### **14. Patch Management**
- **OS & Software Updates**
  - Regular patching (Windows updates, software updates)
  - Critical patches (apply within 7 days)
  
- **Vulnerability Scanning**
  - Scan systems for vulnerabilities (quarterly)
  - Remediate (patch, configure)

##### **15. Endpoint Detection & Response (EDR)**
- **Advanced Threat Protection**
  - Detect sophisticated attacks (ransomware, zero-day exploits)
  - Automated response (isolate infected device, kill malicious process)

##### **16. Device Control**
- **USB Port Control**
  - Disable USB ports (prevent data theft via USB drives)
  - Whitelist authorized devices only
  
- **Mobile Device Management (MDM)**
  - Manage hospital-issued phones, tablets
  - Remote wipe (if device lost)

#### **E. APPLICATION SECURITY**

##### **17. Secure Development**
- **Secure Coding Practices**
  - Developers follow OWASP Top 10 (prevent common vulnerabilities)
  - Code review, security testing
  
- **Input Validation**
  - Prevent SQL injection, XSS (validate all user inputs)

##### **18. Penetration Testing**
- **Annual Pen Test**
  - Ethical hackers test system (identify vulnerabilities)
  - Remediate findings

##### **19. Vulnerability Assessment**
- **Automated Scanning**
  - Scan applications for vulnerabilities (quarterly)
  - CVSS scoring (prioritize high-risk vulnerabilities)

#### **F. PHYSICAL SECURITY**

##### **20. Server Room Security**
- **Access Control**
  - Biometric/card access (only authorized IT staff)
  - CCTV monitoring
  
- **Environmental Controls**
  - Fire suppression (gas-based, not water - prevents equipment damage)
  - Temperature control (AC, prevent overheating)
  - UPS (Uninterruptible Power Supply), generator (backup power)

##### **21. Workstation Security**
- **Lock Screens**
  - Users must lock when leaving desk (policy)
  - Auto-lock after 5 min
  
- **Clean Desk Policy**
  - No PHI left on desk (printed reports locked in drawer)

##### **22. Disposal of Equipment**
- **Secure Disposal**
  - Hard drives: Wipe (DOD 5220.22-M) OR physically destroy (shred)
  - Paper: Shred (cross-cut shredder)

#### **G. INCIDENT RESPONSE**

##### **23. Security Incident Types**
- **Cyberattacks**: Hacking, ransomware, phishing, DDoS
- **Data Breach**: Unauthorized access, data theft, lost device
- **Insider Threats**: Malicious employee, negligent employee
- **Physical Security**: Theft, vandalism

##### **24. Incident Response Plan (IRP)**
- **Preparation**
  - Incident response team (IT, security, legal, management)
  - Playbooks (step-by-step procedures for each incident type)
  
- **Detection & Analysis**
  - Identify incident (alerts, reports)
  - Assess severity (critical, high, medium, low)
  
- **Containment**
  - Short-term: Isolate infected systems (prevent spread)
  - Long-term: Patch vulnerability
  
- **Eradication**
  - Remove malware, close backdoors
  
- **Recovery**
  - Restore systems (from backups)
  - Verify clean (no malware residue)
  
- **Post-Incident**
  - Lessons learned (what went wrong, how to prevent)
  - Update IRP

##### **25. Breach Notification** (Covered in Module 35 HIPAA)
- **Notify Patients, Authorities** (if PHI breach)

#### **H. COMPLIANCE MONITORING**

##### **26. Compliance Dashboard**
- **Compliance Status**
  - HIPAA compliance, NABH compliance, DISHA compliance (when enacted)
  - Color-coded (green compliant, red non-compliant)
  
- **Compliance Gaps**
  - List of open gaps (from audits, assessments)

##### **27. Policy Management**
- **Security Policies**
  - Acceptable Use Policy, Password Policy, Remote Access Policy, Incident Response Policy
  - Version control (track revisions)
  
- **Policy Acknowledgment**
  - All staff must read, acknowledge (sign) policies (annually)
  - Track acknowledgments

##### **28. Training & Awareness**
- **Security Awareness Training**
  - Annual training (all staff)
  - Topics: Phishing, password hygiene, social engineering, physical security
  - Quiz, certificate
  
- **Phishing Simulation**
  - Send fake phishing emails (test staff)
  - Track who clicks (retrain high-risk users)

##### **29. Audit Logs Review**
- **Regular Review**
  - Monthly review of access logs (random sample)
  - Look for anomalies (access at odd hours, mass downloads, unauthorized access)
  
- **Automated Alerts**
  - Alert if unusual pattern (user accessed 500 patient records in 1 hour)

##### **30. Compliance Reporting**
- **Management Reports**
  - Monthly security report (incidents, compliance status, risks)
  
- **Regulatory Reports**
  - For HIPAA/DISHA/NABH (as required)

#### **I. THIRD-PARTY RISK MANAGEMENT**

##### **31. Vendor Security Assessment**
- **Evaluate Vendors**
  - Before contract: Assess vendor security (questionnaire, audit reports)
  - Example: Cloud provider, EMR vendor, payment gateway
  
- **Business Associate Agreements (BAA)**
  - For vendors handling PHI (require BAA as per HIPAA)

##### **32. Ongoing Monitoring**
- **Annual Review**
  - Re-assess vendor security (annually)
  - Verify compliance with BAA

#### **J. SECURITY TOOLS & TECHNOLOGIES**

##### **33. SIEM (Security Information & Event Management)**
- **Centralized Logging**
  - Aggregate logs from all systems (servers, firewalls, applications)
  
- **Correlation & Analysis**
  - Detect threats (correlate events from multiple sources)
  - Example: Failed login + successful login from different country (suspicious)
  
- **Alerts**
  - Real-time alerts (security team responds)

##### **34. DLP (Data Loss Prevention)**
- **Monitor Data Movement**
  - Prevent PHI from leaving hospital (via email, USB, print)
  
- **Policies**
  - Block email with PHI (unless encrypted)
  - Alert if user tries to copy 1000 patient records to USB

##### **35. Identity & Access Management (IAM)**
- **Centralized User Management**
  - Single sign-on (SSO) - one login for all systems
  - Directory service (Active Directory, LDAP)
  
- **Provisioning/De-provisioning**
  - Auto-create account (when employee joins)
  - Auto-disable account (when employee leaves)

### **Integration Points**:
- ← **From All Modules**: Audit logs, access logs, transaction logs
- → **To All Modules**: Access control, authentication, authorization
- → **To HIPAA (Module 35)**: Audit logs, breach notifications
- → **To IT**: Security incidents, vulnerabilities
- → **To Management**: Security posture, compliance status, risk reports

---

## 🎯 **COMPLETE 40-MODULE STRUCTURE SUMMARY**

### **Module Status Overview**:

- ✅ **Fully Implemented** (13 modules): 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
- 🟡 **Partially Implemented** (9 modules): 13, 14, 18, 21, 23, 27, 29, 32, 33, 37, 40
- ❌ **Not Implemented** (19 modules): 15, 16, 17, 19, 20, 22, 24, 25, 26, 28, 30, 31, 34, 35, 36, 38, 39

### **Implementation Priority** (Suggested):

**Phase 1 (Critical - Next 4 weeks):**
1. Module 15: Queue Management (OPD flow optimization)
2. Module 16: IPD Management (inpatient care)
3. Module 19: Bed Management (capacity management)
4. Module 17: Consent Management (regulatory compliance)
5. Module 22: Discharge Management (IPD completion)

**Phase 2 (High Priority - Weeks 5-8):**
6. Module 20: Staff Scheduling (operational efficiency)
7. Module 30: Patient Directory Hub (comprehensive patient view)
8. Module 36: Audit Management (quality & compliance)
9. Module 34: NABH Management (accreditation)
10. Module 35: HIPAA Management (data privacy)

**Phase 3 (Medium Priority - Weeks 9-12):**
11. Module 24: Communication (patient engagement)
12. Module 26: Feedback & Surveys (quality improvement)
13. Module 39: Patient Portal (patient empowerment)
14. Module 25: Housekeeping (facility management)
15. Module 38: Analytics (business intelligence)

**Phase 4 (Enhancement - Weeks 13-16):**
16. Module 28: Advanced Services (telemedicine, specialty clinics)
17. Module 31: Eye Camps (community outreach)
18. Module 37: Reports (enhanced reporting - extends existing)
19. Complete enhancements to partial modules (13, 14, 18, 21, 23, 27, 29, 32, 33, 40)

---

**✨ ALL 40 MODULES NOW COMPLETELY DOCUMENTED! ✨**

This comprehensive structure covers every aspect of a modern, HIPAA-compliant, NABH-ready eye hospital management system.
