# FINAL EXAMINATION TAB STRUCTURE - Production Ready

## 🎯 Overview
Based on reference screenshots and clinical requirements, we need **11 MAIN TABS**, each containing **multiple sections as cards** within the same page.

**Database Integration**: All fields map to existing backend tables in the `clinical_examination` module and related tables.

---

## 📋 FINAL TAB STRUCTURE (11 TABS)

### **Tab 1: Medical History** ❤️
**Route**: `/exam?tab=medical-history`
**Database Table**: `medical_history`, `medical_condition`, `medication`, `allergy`, `surgery_history`, `family_history`

**Sections (Cards)**:
1. Chronic Medical Conditions
2. Current Medications  
3. Known Allergies
4. Past Surgeries
5. Family Medical History
6. Immunization Records
7. Lifestyle Factors
8. Disability & Special Needs

**Layout**: Single column, each section is a card
**Status**: ✅ Already implemented with modern UI

---

### **Tab 2: Visual Acuity** 👁️
**Route**: `/exam?tab=visual-acuity`
**Database Tables**: `refraction_test`, `visual_acuity_test`, `keratometry_test`, `color_vision_test`, `contrast_sensitivity_test`

**Sections (Cards)** - ALL IN ONE TAB:

#### **Section 1: Old Glass vs New Prescription** 🔄
**Purpose**: Compare current prescription with new findings
- **Layout**: 2 columns side-by-side (Old Glass | New Prescription)
- **Each column shows**: OD and OS data
- **Fields per eye**:
  - Spherical (e.g., -2.00 D)
  - Cylindrical (e.g., -0.75 D)
  - Axis (e.g., 180°)
  - Visual Acuity achieved (e.g., 6/6)
- **Auto-calculate**: Power change, Axis rotation
- **Database**: `refraction_test` (old_prescription_sph, old_prescription_cyl, old_prescription_axis, new_prescription_sph, etc.)

#### **Section 2: Refraction**
- **Layout**: OD | OS side-by-side
- **Fields per eye**:
  - Spherical (dropdown: -20.00 to +20.00, step 0.25D)
  - Cylindrical (dropdown: 0 to -6.00, step 0.25D)
  - Axis (dropdown: 0° to 180°, step 1°)
- **Database**: `refraction_test` table (sphere_od, cylinder_od, axis_od, sphere_os, cylinder_os, axis_os)

#### **Section 3: Distance Vision**
- **Layout**: OD | OS side-by-side
- **Fields per eye**:
  - Uncorrected (dropdown: 6/6, 6/9, 6/12, 6/18, 6/24, 6/36, 6/60, CF, HM, PL, NPL)
  - Corrected (same options)
  - **Visual Perception Diagram**: Interactive arrows (Top, Right, Bottom, Left) - shows projection of rays
- **Database**: `visual_acuity_test` table (distance_uncorrected_od, distance_corrected_od, distance_uncorrected_os, distance_corrected_os)

#### **Section 4: Near Vision**
- **Layout**: OD | OS side-by-side
- **Fields per eye**:
  - Uncorrected (dropdown: N6, N8, N10, N12, N18, N24, N36)
  - Corrected (same options)
- **Database**: `visual_acuity_test` table (near_uncorrected_od, near_corrected_od, near_uncorrected_os, near_corrected_os)

#### **Section 5: Keratometry**
- **Layout**: OD | OS side-by-side
- **Fields per eye**:
  - K1 (Flat) - input with D suffix (e.g., 42.50 D)
  - K2 (Steep) - input with D suffix (e.g., 44.00 D)
  - Axis (e.g., 180°)
  - **Auto-calculated**: Average K = (K1 + K2) / 2, Astigmatism = K2 - K1
- **Database**: `keratometry_test` table (k1_od, k2_od, axis_od, k1_os, k2_os, axis_os, avg_k_od, avg_k_os)

#### **Section 6: Color Vision**
- **Layout**: Single form (binocular test typically)
- **Fields**:
  - Test Type (dropdown: Ishihara, D-15, HRR, Farnsworth-Munsell 100)
  - Result (dropdown: Normal, Protan defect, Deutan defect, Tritan defect, Total color blindness)
  - Plates Missed (if Ishihara - e.g., "3, 7, 12")
- **Database**: `color_vision_test` table (test_type, result, plates_missed, notes)

#### **Section 7: Contrast Sensitivity**
- **Layout**: OD | OS side-by-side
- **Fields per eye**:
  - Test Type (dropdown: Pelli-Robson, MARS, CSV-1000)
  - Score (input: e.g., "1.65 log units")
  - Interpretation (auto-filled: Normal, Borderline, Reduced)
- **Database**: `contrast_sensitivity_test` table (test_type, score_od, score_os, interpretation_od, interpretation_os)

**Status**: ⚠️ Needs consolidation (currently 4 separate tabs) + add Old vs New section

---

### **Tab 3: IOP (Intraocular Pressure)** 📊
**Route**: `/exam?tab=iop`
**Database Tables**: `tonometry_test`, `pachymetry_test`, `visual_field_test`, `schirmer_test`

**Sections (Cards)** - ALL IN ONE TAB:

#### **Section 1: Non-Contact Tonometry (NCT)**
- **Header**: "Non-Contact Tonometry (NCT)"
- **Subsections**:
  
  **Before Dilatation**:
  - Layout: OD | OS side-by-side
  - Fields per eye: Value (input: e.g., "14 mmHg"), Time (time picker: e.g., "10:30 AM")
  
  **After Dilatation**:
  - Layout: OD | OS side-by-side
  - Fields per eye: Value, Time

- **Database**: `tonometry_test` table (method='NCT', iop_od_predilation, time_od_predilation, iop_od_postdilation, time_od_postdilation, same for OS)

#### **Section 2: Applanation Tonometry (ATN)**
- **Header**: "Applanation Tonometry (ATN)"
- **Subsections**:
  
  **Before Dilatation**:
  - Layout: OD | OS side-by-side
  - Fields per eye: Value, Time
  
  **After Dilatation**:
  - Layout: OD | OS side-by-side
  - Fields per eye: Value, Time

- **Database**: `tonometry_test` table (method='Applanation', same fields as NCT)

#### **Section 3: Schirmer Tear Test (Dry Eye Test)**
- **Layout**: OD | OS side-by-side
- **Fields per eye**:
  - Measurement (input: e.g., "12 mm")
  - Time (input: e.g., "5 minutes")
  - Interpretation (auto: Normal >10mm, Mild dry eye 5-10mm, Severe <5mm)
- **Database**: `schirmer_test` table (measurement_od, time_duration, measurement_os, interpretation_od, interpretation_os)

#### **Section 4: Pachymetry** (CCT for IOP correction)
- **Layout**: OD | OS side-by-side
- **Fields per eye**:
  - Central Corneal Thickness (μm) - input e.g., "545 μm"
  - Corrected IOP (auto-calculated based on CCT - formula: thinner cornea = higher true IOP)
- **Database**: `pachymetry_test` table (cct_od, cct_os, corrected_iop_od, corrected_iop_os)

#### **Section 5: Visual Field Test** (Glaucoma screening)
- **Layout**: OD | OS side-by-side
- **Fields per eye**:
  - Test Type (dropdown: Confrontation, Automated Perimetry)
  - MD (Mean Deviation) - if automated (e.g., "-2.5 dB")
  - PSD (Pattern Standard Deviation) - if automated (e.g., "3.2 dB")
  - Reliability (dropdown: Good, Fair, Poor)
  - Defects (textarea: describe field defects)
- **Database**: `visual_field_test` table (test_type, md_od, psd_od, reliability_od, defects_od, same for OS)

**Status**: ⚠️ Needs consolidation + add Schirmer Test

---

### **Tab 4: Retinoscopy** 🔍
**Route**: `/exam?tab=retinoscopy`
**Database Table**: `retinoscopy_test`, `subjective_refraction_test`

**Sections (Cards)** - ALL IN ONE TAB:

#### **Section 1: Wet Retinoscopy**
- **Header**: "Wet Retinoscopy (with Cycloplegic Drug)"
- **Top Fields** (full width):
  - Drug (dropdown: "Select drug", Tropicamide 1%, Cyclopentolate 1%, Atropine 1%, Homatropine 2%)
  - Time Duration (dropdown: "Select duration", 15 min, 20 min, 30 min, 45 min, 60 min)
  - Time Administered (time picker: e.g., "10:30 AM")
  
- **Layout**: OD | OS side-by-side
- **Fields per eye**:
  - Spherical (dropdown: -20.00 to +20.00, step 0.25D)
  - Cylindrical (dropdown: 0 to -6.00, step 0.25D)
  - Axis (dropdown: 0° to 180°)
  - Working Distance (dropdown: 67cm, 50cm, 33cm - auto-adjusts sphere)
  
- **Action**: "+ Add Reading" button (orange) on right side of each eye column - allows multiple readings
- **Database**: `retinoscopy_test` table (type='wet', drug_used, duration_minutes, time_administered, sphere_od, cylinder_od, axis_od, working_distance, same for OS)

#### **Section 2: Dry Retinoscopy**
- **Header**: "Dry Retinoscopy (without Cycloplegic)"
- **Layout**: OD | OS side-by-side
- **Fields per eye**:
  - Spherical
  - Cylindrical
  - Axis
  - Working Distance
- **Action**: "+ Add Reading" button
- **Database**: `retinoscopy_test` table (type='dry', same sphere/cylinder/axis fields)

#### **Section 3: Subjective Refraction (after Wet/Dry Retinoscopy)**
- **Header**: "Subjective Refraction (after Wet/Dry Retinoscopy)"
- **Multiple entries allowed** (can add multiple progressive refinement readings)
- **Layout**: Each entry shows | OD | OS | VA Achieved | Action |
- **Columns**:
  - **Entry #** (auto: 1, 2, 3...)
  - **OD**: Sph/Cyl/Axis (compact display: e.g., "-2.00 / -0.75 x 180")
  - **OS**: Sph/Cyl/Axis
  - **VA Achieved**: Visual acuity with this prescription (e.g., "6/6 OD, 6/6 OS")
  - **Action**: Edit/Delete buttons
  
- **Add Button**: "+ Add Refinement" - opens modal/inline form to add new reading
- **Final Selection**: Radio button to mark which reading is the final prescription
- **Database**: `subjective_refraction_test` table (entry_number, sphere_od, cylinder_od, axis_od, sphere_os, cylinder_os, axis_os, va_achieved_od, va_achieved_os, is_final boolean)

**Status**: ⚠️ Needs to add Wet/Dry sections + multiple entry Subjective Refraction

---

### **Tab 5: Anterior Segment** 🔬
**Route**: `/exam?tab=anterior`
**Database Table**: `anterior_segment_exam`, `pupil_exam`

**Sections (Cards)** - ALL IN ONE TAB:

#### **Section 1: Pupil Examination** 👁️
- **Layout**: OD | OS side-by-side
- **Fields per eye**:
  - **Size (in light)**: Dropdown/Input: 1mm to 8mm (e.g., "3mm")
  - **Size (in dark)**: Dropdown/Input: 1mm to 8mm (e.g., "6mm")
  - **Shape**: Dropdown: Round, Irregular, Fixed dilated, Fixed constricted
  - **Direct Light Reaction**: Dropdown: Brisk, Sluggish, Absent, Fixed
  - **Consensual Light Reaction**: Dropdown: Brisk, Sluggish, Absent
  - **RAPD (Relative Afferent Pupillary Defect)**: Dropdown: Absent, Present (specify which eye)
- **Database**: `pupil_exam` table (size_light_od, size_dark_od, shape_od, direct_reaction_od, consensual_reaction_od, rapd_present, rapd_eye)

#### **Section 2: External Eye & Adnexa**
- **Layout**: OD | OS side-by-side
- **Fields per eye** (all dropdowns with "Select finding..." default):
  - **Lids**: Normal, Ptosis, Blepharitis, Chalazion, Stye, Ectropion, Entropion, Trichiasis, Lagophthalmos, Other
  - **Conjunctiva**: Normal, Hyperemia, Chemosis, Pterygium, Pinguecula, Subconjunctival Hemorrhage, Follicles, Papillae, Other
  - **Sclera**: Normal, Icterus, Inflammation, Blue Sclera, Nodule, Other
  - **Lacrimal System**: Normal, Epiphora (watering), Dacryocystitis, Blocked duct
- **Database**: `anterior_segment_exam` table (lids_od, conjunctiva_od, sclera_od, lacrimal_od, same for OS)

#### **Section 3: Cornea & Anterior Chamber**
- **Layout**: OD | OS side-by-side
- **Fields per eye** (all dropdowns):
  - **Cornea**: Clear, Opaque, Edema, Abrasion, Ulcer, Foreign Body, Scar, KP (Keratic Precipitates), Vascularization, Infiltrate, Other
  - **Anterior Chamber**: Normal Depth, Shallow, Deep, Cells, Flare, Hyphema, Hypopyon, Fibrin, Other
  - **AC Depth Assessment**: Van Herick Grade (Grade 4/Wide, Grade 3/Moderate, Grade 2/Narrow, Grade 1/Very Narrow, Closed)
- **Database**: `anterior_segment_exam` table (cornea_od, ac_od, ac_depth_od, same for OS)

#### **Section 4: Iris & Lens**
- **Layout**: OD | OS side-by-side
- **Fields per eye** (all dropdowns):
  - **Iris**: Normal, Neovascularization, Atrophy, Posterior Synechiae, Anterior Synechiae, Iridodialysis, Heterochromia, Other
  - **Lens**: Clear, Cortical Cataract, Nuclear Cataract (Grade 1-4), PSC (Posterior Subcapsular Cataract), Anterior Subcapsular, Pseudophakia, Aphakia, Subluxation, Other
  - **Lens Opacity Grading** (if cataract): Grade 1 (Mild), Grade 2 (Moderate), Grade 3 (Moderate-Severe), Grade 4 (Severe)
- **Database**: `anterior_segment_exam` table (iris_od, lens_od, lens_opacity_grade_od, same for OS)

**Status**: ❌ NEW - Needs to be created + add Pupil Examination section

---

### **Tab 6: Posterior Segment** 🫀
**Route**: `/exam?tab=posterior`
**Database Table**: `posterior_segment_exam`, `fundus_exam`

**Sections (Cards)** - ALL IN ONE TAB:

#### **Section 1: Fundus Overview**
- **Layout**: OD | OS side-by-side
- **Fields per eye**:
  - Media Clarity (dropdown: Clear, Hazy, Opaque)
  - Dilatation Status (checkbox: Dilated/Undilated)
  - Dilatation Drug (if dilated): Dropdown: Tropicamide 1%, Phenylephrine 2.5%, Combination
  - Dilatation Time (if dilated): Time picker
  - Overall Finding (dropdown: Normal, Abnormal - specify below)
- **Database**: `posterior_segment_exam` table (media_clarity_od, is_dilated, dilation_drug, dilation_time, overall_finding_od, same for OS)

#### **Section 2: Optic Disc**
- **Layout**: OD | OS side-by-side
- **Fields per eye**:
  - Cup/Disc Ratio (dropdown: 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0)
  - Color (dropdown: Pink (Normal), Pale, Hyperemic, Atrophic)
  - Margins (dropdown: Sharp, Blurred, Swollen)
  - Neovascularization (dropdown: Absent, Present)
  - Hemorrhages (dropdown: Absent, Present)
  - Peripapillary Atrophy (dropdown: Absent, Zone Alpha, Zone Beta, Both)
  - Notes (textarea)
- **Database**: `fundus_exam` table (cup_disc_ratio_od, disc_color_od, disc_margins_od, disc_nv_od, disc_hemorrhage_od, peripapillary_atrophy_od, disc_notes_od, same for OS)

#### **Section 3: Macula**
- **Layout**: OD | OS side-by-side
- **Fields per eye**:
  - Foveal Reflex (dropdown: Present, Absent, Dull)
  - Edema (dropdown: None, CME (Cystoid Macular Edema), Diffuse, Focal)
  - Hemorrhages (dropdown: Absent, Present)
  - Exudates (dropdown: None, Hard, Soft, Both)
  - Drusen (dropdown: Absent, Small, Intermediate, Large)
  - Scarring (dropdown: Absent, Present - describe)
  - Notes (textarea)
- **Database**: `fundus_exam` table (foveal_reflex_od, macular_edema_od, macular_hemorrhage_od, macular_exudates_od, drusen_od, macular_scar_od, macula_notes_od, same for OS)

#### **Section 4: Retina**
- **Layout**: OD | OS side-by-side
- **Fields per eye**:
  - Configuration (dropdown: Attached, Detached - specify quadrant)
  - Tears (dropdown: Absent, Present - specify location)
  - Hemorrhages (dropdown: None, Dot-Blot, Flame, Pre-retinal, Vitreous)
  - Exudates (dropdown: None, Hard, Cotton-wool spots (Soft), Both)
  - Diabetic Changes (dropdown: None, Mild NPDR, Moderate NPDR, Severe NPDR, PDR)
  - Peripheral Degenerations (dropdown: None, Lattice, Snail track, Pavingstone, Other)
  - Notes (textarea)
- **Database**: `fundus_exam` table (retina_config_od, retinal_tears_od, retinal_hemorrhage_od, retinal_exudates_od, diabetic_retinopathy_od, peripheral_degeneration_od, retina_notes_od, same for OS)

#### **Section 5: Vessels**
- **Layout**: OD | OS side-by-side
- **Fields per eye**:
  - A:V Ratio (dropdown: 2:3 (Normal), 1:2, 1:3, 1:4, Other)
  - Arterial Changes (checkboxes: Narrowing, Silver Wiring, Copper Wiring, Tortuosity, Sheathing)
  - Venous Changes (checkboxes: Dilation, Tortuosity, Beading, Occlusion)
  - AV Crossing Changes (dropdown: None, Nicking, Banking, Deflection)
  - Neovascularization (dropdown: Absent, NVD (Disc), NVE (Elsewhere), Both)
  - Notes (textarea)
- **Database**: `fundus_exam` table (av_ratio_od, arterial_changes_od, venous_changes_od, av_crossing_od, vessel_nv_od, vessel_notes_od, same for OS)

**Status**: ❌ NEW - Needs to be created

---

### **Tab 7: Medications** 💊
**Route**: `/exam?tab=medications`
**Database Tables**: `medication` (current from medical history), `prescription`, `prescription_item`

**Sections (Cards)**:

#### **Section 1: Current Medications Review**
- Shows medications from Medical History (Tab 1)
- Read-only summary with medication name, dosage, frequency
- **Database**: Fetches from `medication` table filtered by patient_id

#### **Section 2: New Prescription**
- **Layout**: Single form with Add functionality
- **Fields**:
  - **Medication Name** (autocomplete from drug database)
    - Search by generic or brand name
    - Common suggestions: Timolol, Latanoprost, Prednisolone, Moxifloxacin, etc.
  - **Type** (dropdown): Eye Drops, Tablets, Capsules, Ointment, Injection, Gel
  - **Dosage** (input): e.g., "1 drop", "500mg", "5ml"
  - **Frequency** (dropdown): 
    - Once daily (OD)
    - Twice daily (BD)
    - Thrice daily (TDS)
    - Four times daily (QID)
    - Every hour
    - PRN (as needed)
    - Custom (specify)
  - **Route** (dropdown): 
    - Both Eyes (OU)
    - OD only (Right Eye)
    - OS only (Left Eye)
    - Oral
    - Topical
    - Intravitreal
  - **Duration** (input + dropdown): 
    - Number input + unit (Days/Weeks/Months/Ongoing)
    - e.g., "7 Days", "2 Weeks", "1 Month", "Ongoing"
  - **Instructions** (textarea): 
    - e.g., "Take with food", "Apply at bedtime", "Shake well before use", "Refrigerate"
  - **Start Date** (date picker): Default today
  - **Refills Allowed** (number): Default 0
  
  - **Action**: "+ Add Medication" button (orange/emerald)

- **Database**: Stores in `prescription_item` table linked to `prescription` (prescription_id, drug_name, drug_type, dosage, frequency, route, duration_value, duration_unit, instructions, start_date, refills_allowed)

#### **Section 3: Prescribed Medications (This Visit)**
- **List of medications prescribed today**
- Each row shows:
  - Medication Name
  - Dosage + Frequency + Route (e.g., "Timolol 0.5% - 1 drop BD - OU")
  - Duration (e.g., "30 Days")
  - Instructions (truncated, show full on hover)
  - Actions: Edit (pencil icon), Remove (trash icon)
  
- **Bottom Actions**:
  - **Print Prescription** button (primary) - generates PDF with clinic header, doctor signature
  - **Email to Patient** button - sends prescription to patient's email
  - **Save Draft** - save without printing

- **Database**: Fetches from `prescription_item` where prescription_id = current exam prescription

**Status**: ❌ NEW - Needs to be created (separate from Medical History medications)

---

### **Tab 8: Contact Lens** 👓
**Route**: `/exam?tab=contact-lens`
**Database Table**: `contact_lens_prescription`, `contact_lens_fitting`

**Sections (Cards)**:

#### **Section 1: Contact Lens Assessment**
- **Layout**: Single column (general questions)
- **Fields**:
  - **Current CL Wearer?** (radio): Yes / No / Previously (discontinued)
  - **If Yes - Current CL Details**:
    - Brand (input/autocomplete: e.g., "Acuvue Oasys", "Biofinity", "Air Optix")
    - Type (dropdown: Daily Disposable, Monthly, Bi-weekly, RGP, Scleral, Toric, Multifocal)
    - Wearing Schedule (dropdown: Daily wear, Extended wear, Overnight)
    - Years of wear (input: e.g., "3 years")
  - **Reason for CL Exam** (checkboxes):
    - New fit
    - Refill existing prescription
    - Change brand/type
    - Discomfort/Problems
    - Follow-up
- **Database**: `contact_lens_prescription` table (is_current_wearer, current_brand, current_type, wearing_schedule, years_wearing, exam_reason)

#### **Section 2: Contact Lens Prescription**
- **Layout**: OD | OS side-by-side
- **Fields per eye**:
  - **Base Curve (BC)**: Input (e.g., "8.4 mm", "8.6 mm")
  - **Diameter (DIA)**: Input (e.g., "14.0 mm", "14.2 mm")
  - **Power (SPH)**: Dropdown (-20.00 to +20.00, step 0.25D)
  - **Cylinder (CYL)**: Dropdown (0 to -6.00, step 0.25D) - for toric lenses
  - **Axis**: Dropdown (0° to 180°) - for toric lenses
  - **Add Power**: Dropdown (+0.75 to +2.50) - for multifocal lenses
  - **Brand Recommended**: Input/autocomplete
  - **Replacement Schedule**: Dropdown (Daily, 2-weekly, Monthly)
  
- **Database**: `contact_lens_prescription` table (base_curve_od, diameter_od, power_od, cylinder_od, axis_od, add_power_od, brand_od, replacement_schedule, same for OS)

#### **Section 3: Contact Lens Fitting Assessment**
- **Layout**: OD | OS side-by-side
- **Fields per eye**:
  - **Centration**: Dropdown (Good, Slight decentration, Poor)
  - **Movement**: Dropdown (Optimal (0.5-1mm), Excessive, Tight)
  - **Coverage**: Dropdown (Adequate, Inadequate - specify)
  - **Comfort**: Dropdown (Comfortable, Mild discomfort, Uncomfortable)
  - **Visual Acuity with CL**: Input (e.g., "6/6")
  - **Over-refraction** (if needed): SPH/CYL/AXIS
  
- **Database**: `contact_lens_fitting` table (centration_od, movement_od, coverage_od, comfort_od, va_with_cl_od, overrefraction_sph_od, overrefraction_cyl_od, overrefraction_axis_od, same for OS)

#### **Section 4: Corneal Health & Suitability**
- **Layout**: OD | OS side-by-side
- **Fields per eye**:
  - **Corneal Curvature** (auto-filled from Keratometry tab): Display K1, K2, Avg K
  - **Corneal Integrity**: Dropdown (Normal, Staining present, Neovascularization, Edema, Warpage, Contraindicated)
  - **Tear Film Quality**: Dropdown (Normal, Marginal, Dry eye - not recommended)
  - **Suitability for CL**: Dropdown (Excellent, Good, Fair, Poor - advise against)

- **Database**: `contact_lens_fitting` table (corneal_integrity_od, tear_film_od, suitability_od, same for OS)

#### **Section 5: Patient Instructions & Follow-up**
- **Layout**: Single column
- **Fields**:
  - **Wearing Instructions** (template chips + textarea):
    - "Start with 4 hours, increase by 2 hours daily"
    - "Daily disposable - discard after use"
    - "Clean lenses with recommended solution only"
    - "Remove lenses if redness/pain occurs"
    - Custom instructions (textarea)
  
  - **Recommended Solution**: Input/autocomplete (e.g., "Opti-Free", "Biotrue", "Clear Care")
  
  - **Follow-up Schedule**:
    - First follow-up (date picker): Default 1 week for new fits
    - Routine follow-up (dropdown): 3 months, 6 months, 12 months
  
  - **Precautions/Warnings** (checkboxes):
    - Never sleep in lenses (unless approved extended wear)
    - Remove lenses before swimming/showering
    - Replace case every 3 months
    - Wash hands before handling lenses
    - Stop use if eyes become red or painful
  
  - **Trial Lenses Dispensed** (checkbox + details):
    - Brand/Power dispensed for trial
    - Return date for follow-up
  
- **Database**: `contact_lens_prescription` table (wearing_instructions, recommended_solution, first_followup_date, routine_followup_interval, precautions_json, trial_dispensed boolean, trial_details)

#### **Section 6: Print & Actions**
- **Buttons**:
  - **Print CL Prescription** (primary button)
  - **Email to Patient**
  - **Order Lenses** (if integrated with supplier) - future feature
  - **Save Draft**

**Status**: ❌ NEW - Needs to be created

---

### **Tab 9: Referral & Orders** 🔗
**Route**: `/exam?tab=referral`
**Database Tables**: `referral`, `imaging_order`

**Sections (Cards)**:

#### **Section 1: Refer to Doctor/Specialist**
- **Layout**: Single column
- **Fields**:
  - **Referral Type** (dropdown):
    - Same hospital - different department
    - External specialist
    - Emergency referral
  
  - **Refer To** (dropdown/autocomplete):
    - If same hospital: List of doctors/departments (Ophthalmologist, Glaucoma Specialist, Retina Specialist, Oculoplasty, etc.)
    - If external: Input specialist name + clinic
  
  - **Reason for Referral** (textarea): 
    - Clinical findings requiring specialist attention
    - Auto-suggest based on diagnosis (e.g., if Glaucoma diagnosed → suggest Glaucoma specialist)
  
  - **Priority** (dropdown):
    - Routine (within 1 month)
    - Urgent (within 1 week)
    - Emergency (same day/next day)
  
  - **Relevant Findings** (textarea):
    - Summary of key examination findings
    - Can auto-populate from diagnosis/exam data
  
  - **Attach Reports** (file upload/checkboxes):
    - Include Visual Field report
    - Include OCT images
    - Include Fundus photos
    - Include full examination summary
  
  - **Action**: "+ Add Referral" button

- **Database**: `referral` table (referral_type, refer_to_doctor_id or external_specialist_name, reason, priority, relevant_findings, attachments_json, status: pending/completed)

#### **Section 2: Imaging & Diagnostic Orders**
- **Layout**: Single column with list
- **Fields**:
  - **Order Type** (checkboxes - can select multiple):
    - OCT (Optical Coherence Tomography)
    - Fundus Photography
    - FFA (Fundus Fluorescein Angiography)
    - ICG (Indocyanine Green Angiography)
    - Corneal Topography
    - Pachymetry
    - Automated Visual Field
    - OCT Angiography
    - Ultrasound B-scan
    - UBM (Ultrasound Biomicroscopy)
    - Anterior Segment OCT
  
  - **For each selected order**:
    - Eye(s) (dropdown: OD, OS, Both)
    - Indication (textarea: why this test is needed)
    - Priority (dropdown: Routine, Urgent, ASAP)
  
  - **Special Instructions** (textarea):
    - e.g., "Focus on macula", "Include wide-field", "Compare with previous from [date]"
  
  - **Action**: "+ Add Order" button

- **Database**: `imaging_order` table (order_type, eye, indication, priority, special_instructions, status: pending/completed/cancelled, ordered_date, completed_date)

#### **Section 3: Refer to Reception**
- **Layout**: Single column
- **Purpose**: Flag patient for reception to handle appointments, billing, additional services
- **Fields**:
  - **Referral Reason** (checkboxes - can select multiple):
    - Schedule follow-up appointment
    - Book imaging appointment (link to Section 2 orders)
    - Payment/billing clarification
    - Collect reports
    - Schedule surgery consultation
    - Insurance authorization needed
    - Other (specify)
  
  - **Follow-up Timeframe** (if scheduling appointment):
    - Dropdown: 1 week, 2 weeks, 1 month, 3 months, 6 months, 12 months, Custom
    - Date picker (optional): Specific date if known
  
  - **Notes for Reception** (textarea):
    - Additional instructions or information
  
  - **Priority Flag** (checkbox): Mark as priority for immediate attention
  
  - **Action**: "Send to Reception Queue" button

- **Database**: `referral` table (type='reception', reason_json array, followup_timeframe, reception_notes, priority_flag boolean, status: pending/completed)

#### **Section 4: Referral Summary**
- **Shows all referrals/orders created in this visit**
- **List view with**:
  - Type (Doctor/Imaging/Reception)
  - Details (who/what/why)
  - Priority
  - Status
  - Actions: Edit, Cancel, Print referral letter

**Status**: ❌ NEW - Needs to be created

---

### **Tab 10: Diagnosis** 🏥
**Route**: `/exam?tab=diagnosis`
**Database Table**: `diagnosis`, `icd10_code`

### **Tab 10: Diagnosis** 🏥
**Route**: `/exam?tab=diagnosis`
**Database Tables**: `diagnosis`, `icd10_codes` (reference table)

**Sections (Cards)**:

#### **Section 1: Clinical Diagnosis**
- **Layout**: Single column
- **Fields**:
  - **ICD-10 Search** (autocomplete input):
    - Search by code or description
    - **Common Eye Conditions** (quick select chips):
      - H40.11 (Primary Open-Angle Glaucoma)
      - H25.9 (Unspecified Age-Related Cataract)
      - H52.0 (Hyperopia)
      - H52.1 (Myopia)
      - H52.2 (Astigmatism)
      - H43.1 (Vitreous Hemorrhage)
      - H35.3 (Degeneration of Macula and Posterior Pole)
      - E10.3 / E11.3 (Diabetic Retinopathy)
      - H16.0 (Corneal Ulcer)
      - H10.1 (Acute Conjunctivitis)
    
    - Typing shows autocomplete suggestions from `icd10_codes` table
  
  - **Diagnosis Entry Form** (appears when ICD code selected):
    - **ICD-10 Code** (auto-filled from search, display-only)
    - **Description** (auto-filled from search, editable if needed)
    - **Laterality** (dropdown): 
      - Both Eyes (Bilateral)
      - OD only (Right Eye)
      - OS only (Left Eye)
      - Not Applicable (systemic condition affecting eyes)
    - **Severity** (dropdown): Mild, Moderate, Severe, Not Applicable
    - **Status** (dropdown):
      - New (newly diagnosed today)
      - Existing (previously diagnosed, current)
      - Worsening (existing condition getting worse)
      - Improving (existing condition improving)
      - Resolved
    - **Primary Diagnosis** (checkbox): 
      - Only ONE diagnosis can be marked as primary
      - Auto-unchecks others when selected
    - **Clinical Notes** (textarea):
      - Additional details about this diagnosis
      - e.g., "Nuclear cataract Grade 3, affecting daily activities, surgery advised"
    
    - **Action**: "+ Add Diagnosis" button (can add multiple diagnoses)

- **Database**: `diagnosis` table (patient_id, exam_id, icd10_code, description, laterality, severity, status, is_primary boolean, clinical_notes, diagnosed_date, diagnosed_by_user_id)

#### **Section 2: Diagnosis Summary (This Visit)**
- **List of all diagnoses added**
- **Display**:
  - **Primary diagnosis** highlighted (gold/star icon + different background color)
  - Each diagnosis shows:
    - ICD-10 Code + Description
    - Laterality badge (OD/OS/OU) with eye icon
    - Severity (color-coded: mild=green, moderate=yellow, severe=red)
    - Status badge (new=blue, existing=gray, worsening=orange, improving=green)
    - Clinical notes (collapsed, expand on click)
  
  - **Grouped by Laterality**:
    - Both Eyes section
    - Right Eye (OD) section
    - Left Eye (OS) section
    - Systemic section
  
  - **Actions per diagnosis**:
    - Edit (pencil icon)
    - Remove (trash icon)
    - Mark as Primary (star icon - toggles)

- **Bottom Actions**:
  - **Copy Previous Diagnoses** button: Import diagnoses from patient's last visit
  - **Print Diagnosis Summary** button

**Database Query**: Fetches from `diagnosis` table where exam_id = current examination id, ordered by is_primary DESC, then laterality

**Status**: ❌ NEW - Needs to be created

---

### **Tab 11: Advice & Patient Education** 📋
**Route**: `/exam?tab=advice`
**Database Tables**: `patient_advice`, `patient_education_material`

### **Tab 11: Advice & Patient Education** 📋
**Route**: `/exam?tab=advice`
**Database Tables**: `patient_advice`, `patient_education_material`, `patient_instruction`

**Sections (Cards)**:

#### **Section 1: Patient Instructions**
- **Quick Templates** (clickable chips - multi-select):
  - "Avoid water contact for 24 hours"
  - "Use sunglasses when outdoors"
  - "Avoid rubbing eyes"
  - "Complete full medication course"
  - "Apply warm compress 3x daily"
  - "Apply cold compress for 10 mins 4x daily"
  - "Return if symptoms worsen"
  - "Avoid contact lenses for [X] days"
  - "No heavy lifting for 1 week"
  - "Sleep with head elevated"
  - "Use protective eyewear"
  
- **Custom Instructions** (textarea):
  - Free text for specific patient advice
  - Can add multiple custom instruction blocks
  
- **Database**: `patient_instruction` table (exam_id, instruction_text, is_template boolean, template_name if applicable, created_date)

#### **Section 2: Follow-up Schedule**
- **Fields**:
  - **Next Visit Date** (date picker)
    - Quick select buttons: 1 week, 2 weeks, 1 month, 3 months, 6 months, 1 year
  
  - **Follow-up Reason** (dropdown):
    - Routine check-up
    - Treatment review (medication effectiveness)
    - Test results review
    - Pre-operative assessment
    - Post-operative check
    - Emergency / As needed
  
  - **Specific Tests Needed at Follow-up** (checkboxes):
    - Visual Field test
    - OCT scan
    - Fundus Photography
    - IOP check
    - Refraction
    - Contact Lens follow-up
    - Blood tests (HbA1c for diabetics, etc.)
    - Other (specify)
  
  - **Remind Patient** (checkboxes):
    - SMS reminder (1 day before)
    - Email reminder (1 day before)
    - WhatsApp reminder (if applicable)
  
- **Database**: `patient_advice` table (exam_id, followup_date, followup_reason, tests_needed_json array, reminder_preferences_json)

#### **Section 3: Precautions & Warnings**
- **Condition-Specific Templates** (auto-suggest based on diagnosis - checkboxes):
  - **If Glaucoma**: "Regular IOP monitoring essential - vision loss is permanent if untreated"
  - **If Diabetic**: "Annual dilated eye exam required - report any sudden vision changes immediately"
  - **If Cataract**: "Surgery may be needed when vision affects daily activities"
  - **If Contact Lens User**: "Proper hygiene essential - never sleep in lenses unless approved"
  - **If Dry Eye**: "Avoid smoke, wind, AC - use lubricating drops frequently"
  - **If Retinal Issue**: "Avoid vigorous exercise - report flashes/floaters immediately"
  - **If Post-surgery**: "Avoid swimming, eye makeup, rubbing eyes as per surgeon's advice"
  
- **Custom Precautions** (textarea):
  - Additional warnings or precautions specific to patient
  
- **Red Flags - Return Immediately If** (checkboxes):
  - Sudden vision loss
  - Severe eye pain
  - Flashes of light or new floaters
  - Eye injury
  - Discharge with redness
  - Headache with blurred vision
  - Seeing halos around lights
  
- **Database**: `patient_advice` table (precautions_json array, red_flags_json array, custom_precautions text)

#### **Section 4: Patient Education Materials** 📚
**Purpose**: Provide educational resources about diagnosed conditions

- **Auto-Recommended Based on Diagnosis**:
  - If Glaucoma diagnosed → Show "Understanding Glaucoma" handout
  - If Cataract → "Cataract Surgery: What to Expect"
  - If Diabetic Retinopathy → "Diabetes and Your Eyes"
  - If Dry Eye → "Managing Dry Eye Syndrome"
  - If Contact Lens → "Contact Lens Care Guide"
  
- **Available Materials** (checkboxes - can select multiple):
  - **Condition-Specific**:
    - Understanding Glaucoma (PDF/Video)
    - Cataract: Causes and Treatment (PDF/Video)
    - Diabetic Retinopathy Explained (PDF/Video)
    - Age-Related Macular Degeneration (PDF/Video)
    - Refractive Errors: Myopia, Hyperopia, Astigmatism (PDF)
    - Dry Eye Syndrome Management (PDF)
    - Conjunctivitis (Pink Eye) Care (PDF)
  
  - **Procedure-Specific**:
    - Preparing for Cataract Surgery (PDF/Video)
    - Post-LASIK Care Instructions (PDF)
    - Intravitreal Injection: What to Expect (PDF/Video)
  
  - **General Eye Health**:
    - Protecting Your Vision (PDF)
    - Nutrition for Eye Health (PDF)
    - Computer Eye Strain Prevention (PDF)
    - UV Protection and Sunglasses (PDF)
    - When to See an Eye Doctor (PDF)
  
  - **Pediatric** (if child patient):
    - Amblyopia (Lazy Eye) in Children (PDF)
    - Vision Screening for Children (PDF)
    - Protect Your Child's Eyes (PDF)

- **Delivery Method** (checkboxes):
  - Print and give physical handout
  - Email PDF to patient
  - Send download link via SMS
  - Add to patient portal for download
  
- **Language Preference** (dropdown):
  - English (default)
  - Hindi
  - Telugu
  - Tamil
  - Kannada
  - ... (other regional languages)

- **Database**: `patient_education_material` table (exam_id, material_type, material_name, delivery_method, language, sent_date, patient_id)

#### **Section 5: Print Summary & Actions**
- **Buttons**:
  - **Print Patient Instructions** (primary button - emerald)
    - Generates PDF with:
      - Patient name, date, doctor name
      - All instructions from Section 1
      - Follow-up schedule from Section 2
      - Precautions from Section 3
      - Red flags to watch for
      - Clinic contact information
  
  - **Print Full Report** (secondary button)
    - Complete examination summary including:
      - Chief complaint
      - Examination findings (all tabs)
      - Diagnosis
      - Medications prescribed
      - Advice and follow-up
  
  - **Email All to Patient** (secondary button)
    - Sends:
      - Patient instructions PDF
      - Prescription PDF
      - Selected educational materials
      - Follow-up appointment details
  
  - **Send SMS Reminder** (ghost button)
    - Quick SMS to patient's mobile with follow-up date and key instructions

- **Preview Panel** (optional - collapsed by default):
  - Shows preview of what will be printed/sent
  - Allows editing before finalizing

**Database**: Generates from all `patient_advice`, `patient_instruction`, `patient_education_material` tables for current exam_id

**Status**: ❌ NEW - Needs to be created + add Patient Education section

---

## 🔄 Migration Plan

### **Current 11 Tabs → New 11 Tabs (Reorganized & Enhanced)**

| Current Tab | Action | New Location | Notes |
|-------------|--------|--------------|-------|
| Medical History | ✅ Keep | Tab 1: Medical History | Already complete with modern UI |
| Visual Acuity | 🔄 Expand | Tab 2: Visual Acuity (Section 2-4) | Add Old vs New comparison + merge others |
| Refraction | 🔀 Merge | Tab 2: Visual Acuity (Section 1-2) | Part of Old vs New + Refraction section |
| Auto Refraction | 🔀 Merge | Tab 2: Visual Acuity (Section 2 option) | Alternative input method for refraction |
| Retinoscopy | ✅ Expand | Tab 4: Retinoscopy (3 sections) | Add Wet/Dry/Subjective sections |
| Keratometry | 🔀 Merge | Tab 2: Visual Acuity (Section 5) | Becomes section within Visual Acuity |
| Tonometry | 🔀 Merge | Tab 3: IOP (Section 1-2) | NCT + ATN sections |
| Pachymetry | 🔀 Merge | Tab 3: IOP (Section 4) | CCT for IOP correction |
| Visual Field | 🔀 Merge | Tab 3: IOP (Section 5) | Glaucoma screening |
| Color Vision | 🔀 Merge | Tab 2: Visual Acuity (Section 6) | Becomes section within Visual Acuity |
| Contrast Sensitivity | 🔀 Merge | Tab 2: Visual Acuity (Section 7) | Becomes section within Visual Acuity |
| *(Missing)* | ➕ Create | Tab 2: Visual Acuity - Old vs New (Section 1) | **NEW: Prescription comparison** |
| *(Missing)* | ➕ Create | Tab 3: IOP - Schirmer Test (Section 3) | **NEW: Dry eye assessment** |
| *(Missing)* | ➕ Create | Tab 4: Retinoscopy - Wet/Dry/Subjective | **NEW: Expand retinoscopy sections** |
| *(Missing)* | ➕ Create | Tab 5: Anterior Segment | **NEW: Complete anterior exam with Pupil** |
| *(Missing)* | ➕ Create | Tab 6: Posterior Segment | **NEW: Complete fundus examination** |
| *(Missing)* | ➕ Create | Tab 7: Medications | **NEW: Prescription module** |
| *(Missing)* | ➕ Create | Tab 8: Contact Lens | **NEW: CL prescription & fitting** |
| *(Missing)* | ➕ Create | Tab 9: Referral & Orders | **NEW: Doctor/Scan/Reception referrals** |
| *(Missing)* | ➕ Create | Tab 10: Diagnosis | **NEW: ICD-10 diagnosis entry** |
| *(Missing)* | ➕ Create | Tab 11: Advice & Patient Education | **NEW: Instructions + Education materials** |

### **New Features Added**
1. **Old Glass vs New Prescription** - Comparison view showing prescription changes
2. **Pupil Examination** - Complete pupil assessment with RAPD
3. **Schirmer Test** - Dry eye assessment in IOP tab
4. **Contact Lens Module** - Complete CL prescription and fitting assessment
5. **Referral System** - Comprehensive referral to doctors, imaging, reception
6. **Patient Education** - Educational materials based on diagnosis
7. **Multiple Entry Subjective Refraction** - Progressive refinement tracking

---

## 📐 Universal Layout Pattern

### **For ALL Cards with OD/OS Data**:

```tsx
<ExamCard title="Section Name" description="What this measures">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* OD Column */}
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
        Right Eye (OD)
      </h4>
      <ExamInput label="Field Name" />
      <ExamSelect label="Field Name">...</ExamSelect>
      {/* More fields */}
    </div>
    
    {/* OS Column */}
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
        Left Eye (OS)
      </h4>
      <ExamInput label="Field Name" />
      <ExamSelect label="Field Name">...</ExamSelect>
      {/* More fields */}
    </div>
  </div>
</ExamCard>
```

### **For Sections within a Tab**:
- Use `<SectionDivider title="Section Name" />` between major sections
- OR use separate `<ExamCard>` for each logical section

---

## ✅ Implementation Checklist

### **Phase 1: Fix Existing (Week 1)**
- [ ] Convert all existing forms to OD/OS side-by-side layout
- [ ] Create Visual Acuity mega-tab (includes Old vs New + Refraction + Distance + Near + Keratometry + Color + Contrast)
- [ ] Create IOP mega-tab (NCT + ATN + Schirmer + Pachymetry + Visual Field)
- [ ] Expand Retinoscopy tab (Wet + Dry + Subjective Refraction with multiple entries)
- [ ] Update exam page tab navigation (reorganize current 11 tabs → new consolidated 11-tab structure)

### **Phase 2: Create Missing (Week 2)**
- [ ] Create Anterior Segment Examination (Pupil + External + Cornea/AC + Iris/Lens - all dropdown findings)
- [ ] Create Posterior Segment Examination (Dilatation + Fundus + Optic Disc + Macula + Retina + Vessels)
- [ ] Create Medications/Prescription module (Current + New Prescription + Prescribed List)
- [ ] Create Contact Lens module (Assessment + Prescription + Fitting + Corneal Health + Instructions + Print)
- [ ] Create Referral & Orders module (Doctor + Imaging + Reception + Summary)
- [ ] Create Diagnosis module (ICD-10 search + Clinical diagnosis + Summary view)
- [ ] Create Advice & Patient Education module (Instructions + Follow-up + Precautions + Education Materials + Print)

### **Phase 3: Polish & Integration (Week 3)**
- [ ] Add Visual Perception diagrams (interactive arrows - Top/Right/Bottom/Left projection)
- [ ] Add auto-calculation helpers (K-average, Astigmatism, IOP correction with CCT, prescription change detection)
- [ ] Add print functionality for prescriptions, reports, patient instructions, education materials
- [ ] Implement form validation and error handling (required fields, value ranges, logical checks)
- [ ] Add save progress indicators and auto-save functionality
- [ ] Integrate with backend APIs for all 11 tabs
- [ ] Add email/SMS delivery for prescriptions and appointments
- [ ] Test all workflows end-to-end with real clinical data

---

## 🎯 Success Criteria

✅ **11 main tabs** with consolidated sections (reorganized from current fragmented structure)
✅ **ALL OD/OS data side-by-side** (not stacked vertically)
✅ **Multiple sections within tabs** (organized as cards with SectionDividers)
✅ **All components from reference screenshots** implemented (including Old vs New, Contact Lens, Referral, Patient Education, Pupil exam, Schirmer test)
✅ **Consistent ExamCard + ExamInput/ExamSelect** design throughout
✅ **Gray page background (bg-gray-50), white cards** with shadows and hover effects
✅ **Emerald color scheme** (emerald-600 primary, not blue)
✅ **Mobile responsive** (grid-cols-1 lg:grid-cols-2 - stacks to single column on small screens)
✅ **Complete database integration** with all backend tables mapped
✅ **Print/Email/SMS functionality** for prescriptions and patient materials
✅ **ICD-10 diagnosis search** with autocomplete
✅ **Visual perception diagrams** for patient education

---

**This is the FINAL structure. Confirm approval to proceed with implementation.**
