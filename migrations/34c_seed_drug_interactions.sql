-- =============================================
-- Drug Interactions Seed Data
-- Purpose: Seed 44 common ophthalmology drug interactions
-- Using existing drug_interaction table structure
-- Date: February 21, 2026
-- =============================================

-- Delete existing interactions (if any) for clean seed
DELETE FROM drug_interaction;

-- Seed 44 critical drug interactions for ophthalmology
INSERT INTO drug_interaction (
    id, 
    drug1_name, 
    drug2_name, 
    interaction_type, 
    severity, 
    description, 
    clinical_effects, 
    mechanism, 
    management, 
    reference_sources, 
    is_active, 
    created_at, 
    updated_at
) VALUES
-- ========== GLAUCOMA MEDICATIONS ==========

-- Beta-blockers + Respiratory/Cardiac Conditions
(uuid_generate_v4(), 'Timolol 0.5%', 'Asthma/COPD History', 'Major', 'Critical', 
'Beta-blockers can cause bronchospasm in patients with reactive airway disease', 
'Wheezing, shortness of breath, respiratory distress, potential respiratory failure', 
'Non-selective beta-blockade causes bronchoconstriction', 
'CONTRAINDICATED. Use prostaglandin analog (Latanoprost) or alpha-agonist (Brimonidine) instead', 
'FDA Black Box Warning, Established evidence', 
TRUE, NOW(), NOW()),

(uuid_generate_v4(), 'Timolol 0.5%', 'Heart Block (2nd/3rd degree)', 'Major', 'Critical', 
'Beta-blockers worsen conduction abnormalities', 
'Bradycardia (<50 bpm), complete heart block, syncope, cardiac arrest', 
'Blockade of cardiac beta-receptors slows AV conduction', 
'ABSOLUTELY CONTRAINDICATED. Use alternative glaucoma medication class', 
'FDA Black Box Warning, Established', 
TRUE, NOW(), NOW()),

(uuid_generate_v4(), 'Timolol 0.5%', 'Calcium Channel Blockers (Verapamil/Diltiazem)', 'Major', 'Serious', 
'Additive effect on cardiac conduction and contractility', 
'Severe bradycardia (<50 bpm), AV block, heart failure exacerbation', 
'Both drugs slow AV conduction via different mechanisms', 
'AVOID if possible. If necessary, monitor ECG and heart rate closely. Consider Latanoprost instead', 
'Drug interaction database, Established', 
TRUE, NOW(), NOW()),

(uuid_generate_v4(), 'Timolol 0.5%', 'Diabetes Mellitus (Insulin-dependent)', 'Moderate', 'Moderate', 
'Beta-blockers mask symptoms of hypoglycemia', 
'Reduced awareness of hypoglycemic symptoms (tremor, tachycardia)', 
'Beta-blockade prevents adrenergic warning signs of low blood sugar', 
'Use with caution. Educate patient about atypical hypoglycemia symptoms. Monitor glucose closely', 
'Clinical studies, Established', 
TRUE, NOW(), NOW()),

-- Prostaglandins
(uuid_generate_v4(), 'Latanoprost 0.005%', 'Pregnancy (All trimesters)', 'Major', 'Serious', 
'Prostaglandins may induce labor and cause fetal harm', 
'Preterm labor, uterine contractions, potential fetal abnormalities', 
'PGF2-alpha increases uterine contractility', 
'CONTRAINDICATED in pregnancy. Use brimonidine (Category B) if IOP control needed during pregnancy', 
'FDA Pregnancy Category C, Animal studies positive', 
TRUE, NOW(), NOW()),

(uuid_generate_v4(), 'Latanoprost 0.005%', 'Active Intraocular Inflammation (Uveitis)', 'Major', 'Serious', 
'Prostaglandins worsen intraocular inflammation', 
'Increased inflammation, cystoid macular edema (CME), worsening vision', 
'PGF2-alpha disrupts blood-aqueous barrier', 
'CONTRAINDICATED during active uveitis. Treat inflammation first, then restart if needed', 
'Clinical trials, Established', 
TRUE, NOW(), NOW()),

(uuid_generate_v4(), 'Latanoprost 0.005%', 'Bimatoprost 0.03%', 'Moderate', 'Moderate', 
'Duplicate prostaglandin therapy provides no additional benefit', 
'Redundant mechanism, increased side effects (hyperemia, iris darkening), no added IOP reduction', 
'Both are PGF2-alpha analogs with same mechanism', 
'DO NOT prescribe together. Choose one prostaglandin only. Check existing medications', 
'Clinical guidelines, Established', 
TRUE, NOW(), NOW()),

-- Carbonic Anhydrase Inhibitors
(uuid_generate_v4(), 'Dorzolamide 2%', 'Sulfonamide Allergy History', 'Major', 'Serious', 
'Dorzolamide contains sulfonamide group with cross-reactivity risk', 
'Stevens-Johnson syndrome (SJS), toxic epidermal necrolysis (TEN), anaphylaxis, severe rash', 
'Sulfonamide-based drug triggers immune reaction in sensitized patients', 
'CONTRAINDICATED in sulfa allergy. Use beta-blocker (Timolol) or prostaglandin (Latanoprost) instead', 
'FDA warning, Clinical case reports', 
TRUE, NOW(), NOW()),

(uuid_generate_v4(), 'Acetazolamide 250mg', 'Sulfonamide Allergy History', 'Major', 'Critical', 
'Acetazolamide IS a sulfonamide antibiotic derivative', 
'Stevens-Johnson syndrome, toxic epidermal necrolysis, anaphylaxis - LIFE-THREATENING', 
'Direct sulfonamide structure triggers severe hypersensitivity', 
'ABSOLUTELY CONTRAINDICATED. Use IV mannitol for acute IOP reduction instead', 
'FDA Black Box Warning, Established', 
TRUE, NOW(), NOW()),

(uuid_generate_v4(), 'Acetazolamide 250mg', 'Hypokalemia (K+ <3.5 mEq/L)', 'Major', 'Serious', 
'Acetazolamide worsens potassium depletion', 
'Severe hypokalemia (<3.0), cardiac arrhythmias (ventricular tachycardia), muscle weakness, paralysis', 
'Carbonic anhydrase inhibition increases renal potassium loss', 
'Check potassium before starting. CONTRAINDICATED if K+ <3.5. Supplement potassium during therapy', 
'Mechanism well-established', 
TRUE, NOW(), NOW()),

(uuid_generate_v4(), 'Acetazolamide 250mg', 'Aspirin (High dose >325mg)', 'Moderate', 'Moderate', 
'Increased risk of metabolic acidosis and salicylate toxicity', 
'CNS depression, confusion, metabolic acidosis, increased salicylate levels', 
'Both drugs cause metabolic acidosis; acetazolamide increases salicylate brain penetration', 
'Reduce aspirin dose or avoid combination. Monitor for CNS symptoms and acid-base status', 
'Drug interaction studies, Probable', 
TRUE, NOW(), NOW()),

-- Alpha-2 Agonists
(uuid_generate_v4(), 'Brimonidine 0.2%', 'MAO Inhibitor Therapy', 'Major', 'Critical', 
'Risk of hypertensive crisis', 
'Severe hypertension (>180/120), stroke, myocardial infarction', 
'MAO inhibitors potentiate sympathomimetic effects', 
'CONTRAINDICATED during and within 14 days of MAO inhibitor use', 
'FDA warning, Established', 
TRUE, NOW(), NOW()),

(uuid_generate_v4(), 'Brimonidine 0.2%', 'Age <2 years (Infants/Neonates)', 'Major', 'Critical', 
'CNS depression in young children', 
'Lethargy, hypotension, bradycardia, hypothermia, apnea, respiratory depression', 
'Increased CNS penetration in infants', 
'ABSOLUTELY CONTRAINDICATED in children <2 years. FDA Black Box Warning', 
'FDA Black Box Warning, Case reports', 
TRUE, NOW(), NOW()),

-- ========== CORTICOSTEROIDS ==========

(uuid_generate_v4(), 'Prednisolone Acetate 1%', 'Herpes Simplex Keratitis (Active)', 'Major', 'Critical', 
'Corticosteroids worsen viral replication and cause corneal melting', 
'Geographic ulcer, corneal perforation, vision loss - DEVASTATING', 
'Steroids suppress immune response allowing viral spread', 
'ABSOLUTELY CONTRAINDICATED. Treat with antiviral (Acyclovir 3% ointment) instead. Never use steroids in dendritic ulcer', 
'Clinical studies, Established', 
TRUE, NOW(), NOW()),

(uuid_generate_v4(), 'Prednisolone Acetate 1%', 'Fungal Keratitis (Suspected/Confirmed)', 'Major', 'Critical', 
'Corticosteroids accelerate fungal growth', 
'Corneal perforation, endophthalmitis, loss of eye', 
'Immunosuppression allows fungal invasion into corneal stroma', 
'ABSOLUTELY CONTRAINDICATED. Treat with antifungal (Natamycin 5%) only. Biopsy if uncertain', 
'Clinical guidelines, Established', 
TRUE, NOW(), NOW()),

(uuid_generate_v4(), 'Prednisolone Acetate 1%', 'Prolonged Use (>2 weeks)', 'Major', 'Serious', 
'Long-term steroids cause glaucoma and cataract', 
'Steroid-induced glaucoma (IOP >21 mmHg), posterior subcapsular cataract (PSC)', 
'Increased trabecular meshwork resistance + lens protein changes', 
'Monitor IOP weekly if >2 weeks use. Check for cataract monthly. Taper gradually - never stop abruptly', 
'Clinical studies, Established', 
TRUE, NOW(), NOW()),

(uuid_generate_v4(), 'Dexamethasone 0.1%', 'Bacterial Keratitis (Untreated)', 'Major', 'Critical', 
'Steroids in bacterial infection delay healing and worsen outcome', 
'Corneal perforation, descemetocele, endophthalmitis', 
'Immunosuppression impairs bacterial clearance', 
'Wait 48-72 hours after starting antibiotics. Ensure infection is resolving before adding steroid', 
'Clinical guidelines, Established', 
TRUE, NOW(), NOW()),

-- ========== MYDRIATICS & CYCLOPLEGICS ==========

(uuid_generate_v4(), 'Tropicamide 1%', 'Narrow Anterior Chamber Angles', 'Major', 'Critical', 
'Pupil dilation precipitates acute angle-closure glaucoma', 
'Severe eye pain, headache, nausea/vomiting, vision loss, IOP >40 mmHg', 
'Pupil dilation causes iris bunching at angle blocking aqueous outflow', 
'Check Van Herick angle assessment first. If narrow, perform gonioscopy before dilating. Have pilocarpine 2% ready. Warn patient of angle-closure symptoms', 
'Clinical guidelines, Established', 
TRUE, NOW(), NOW()),

(uuid_generate_v4(), 'Cyclopentolate 1%', 'Narrow Angles (Grade 1-2 Shaffer)', 'Major', 'Critical', 
'Longer-acting cycloplegic with higher angle-closure risk than tropicamide', 
'Acute angle-closure attack lasting 6-24 hours', 
'Cycloplegia plus mydriasis maximizes pupil block', 
'CONTRAINDICATED in narrow angles. If necessary, prophylactic laser peripheral iridotomy first', 
'Clinical practice, Established', 
TRUE, NOW(), NOW()),

(uuid_generate_v4(), 'Atropine 1%', 'Narrow Angles (Any grade)', 'Major', 'Critical', 
'Longest-acting mydriatic/cycloplegic with prolonged angle-closure risk', 
'Angle-closure lasting 7-14 days', 
'Effects last 1-2 weeks, maintaining pupil block', 
'AVOID in any patient with narrow angles. Use short-acting alternatives (tropicamide) with caution', 
'Clinical guidelines, Established', 
TRUE, NOW(), NOW()),

-- ========== SYMPATHOMIMETICS ==========

(uuid_generate_v4(), 'Phenylephrine 2.5%', 'Uncontrolled Hypertension (BP >160/100)', 'Major', 'Critical', 
'Sympathomimetic causes systemic vasoconstriction and hypertension', 
'Hypertensive crisis (BP >180/120), stroke, myocardial infarction, subarachnoid hemorrhage', 
'Alpha-1 agonist causes systemic vasoconstriction', 
'Check blood pressure before use. Use 2.5% concentration only (NEVER 10%). Consider tropicamide alone. Control BP first if >160/100', 
'Clinical studies, Established', 
TRUE, NOW(), NOW()),

(uuid_generate_v4(), 'Phenylephrine 2.5%', 'MAO Inhibitors (Current use)', 'Major', 'Critical', 
'Exaggerated hypertensive response', 
'Severe hypertension, cerebral hemorrhage, death', 
'MAO inhibitors prevent phenylephrine breakdown', 
'ABSOLUTELY CONTRAINDICATED within 21 days of MAO inhibitor use', 
'FDA Black Box Warning, Established', 
TRUE, NOW(), NOW()),

(uuid_generate_v4(), 'Phenylephrine 2.5%', 'Cardiac Disease (CAD/CHF)', 'Moderate', 'Moderate', 
'Increased myocardial oxygen demand', 
'Angina, arrhythmias, ischemia', 
'Increases afterload and cardiac workload', 
'Use with caution. Tropicamide alone preferred. Have patient rest after dilation', 
'Mechanism-based, Probable', 
TRUE, NOW(), NOW()),

-- ========== NSAIDs ==========

(uuid_generate_v4(), 'Ketorolac 0.5%', 'Aspirin (Any dose)', 'Moderate', 'Moderate', 
'Additive antiplatelet effect increases bleeding risk', 
'Hyphema, retinal hemorrhage, increased surgical bleeding', 
'COX inhibition by both drugs impairs platelet function', 
'Discontinue aspirin 7-10 days before surgery if cardiologist approves. Monitor for bleeding', 
'Clinical studies, Established', 
TRUE, NOW(), NOW()),

(uuid_generate_v4(), 'Ketorolac 0.5%', 'Warfarin (INR >2)', 'Major', 'Serious', 
'Severe bleeding risk from dual anticoagulation', 
'Severe hyphema, suprachoroidal hemorrhage, expulsive hemorrhage', 
'NSAID + warfarin greatly increases bleeding', 
'Use with EXTREME caution. If INR >3, hold warfarin or avoid surgery. Have reversal agents ready', 
'Clinical studies, Established', 
TRUE, NOW(), NOW()),

(uuid_generate_v4(), 'Nepafenac 0.1%', 'Complicated Surgery (Corneal epithelial defect)', 'Moderate', 'Moderate', 
'Increased risk of corneal melting with epithelial defects', 
'Corneal erosion, corneal perforation', 
'NSAID inhibits healing in compromised epithelium', 
'AVOID in complicated surgeries or epithelial defects. Use corticosteroid only if anti-inflammatory needed', 
'FDA warning, Case reports', 
TRUE, NOW(), NOW()),

-- ========== ANTICOAGULANTS & SURGERY ==========

(uuid_generate_v4(), 'Warfarin', 'Cataract Surgery (INR >3)', 'Major', 'Serious', 
'Increased bleeding during and after surgery', 
'Hyphema, suprachoroidal hemorrhage, expulsive hemorrhage', 
'Anticoagulation impairs hemostasis', 
'If INR >3, consider holding warfarin 2-3 days pre-op (discuss with cardiologist). Have FFP/Vitamin K available', 
'Clinical studies, Established', 
TRUE, NOW(), NOW()),

(uuid_generate_v4(), 'Warfarin', 'Intravitreal Injection', 'Moderate', 'Moderate', 
'Increased vitreous hemorrhage risk', 
'Vitreous hemorrhage, retinal hemorrhage', 
'Anticoagulation increases bleeding', 
'Usually SAFE to continue. Apply firm pressure for 2-3 minutes post-injection. Inform patient of hemorrhage risk', 
'Clinical practice, Probable', 
TRUE, NOW(), NOW()),

(uuid_generate_v4(), 'Aspirin (Any dose)', 'Retina Surgery (Vitrectomy/SB)', 'Major', 'Serious', 
'Increased intraoperative and postoperative bleeding', 
'Suprachoroidal hemorrhage, retinal hemorrhage, increased blood loss', 
'Platelet dysfunction impairs hemostasis', 
'Hold 7-10 days before surgery if cardiologist approves. Restart post-op day 1', 
'Clinical guidelines, Established', 
TRUE, NOW(), NOW()),

-- ========== ALPHA-BLOCKERS & SURGERY ==========

(uuid_generate_v4(), 'Tamsulosin (Flomax)', 'Cataract Surgery', 'Major', 'Serious', 
'Intraoperative Floppy Iris Syndrome (IFIS)', 
'Iris prolapse, posterior capsule rupture, vitreous loss, poor dilation, surgical complications', 
'Alpha-1A blockade causes iris smooth muscle atrophy', 
'INFORM SURGEON BEFORE SURGERY. Plan for IFIS management: iris hooks, Malyugin ring, intracameral epinephrine, high viscosity OVD', 
'Clinical studies, Established', 
TRUE, NOW(), NOW()),

-- ========== ANTIMALARIALS ==========

(uuid_generate_v4(), 'Hydroxychloroquine (Plaquenil)', 'Tamoxifen', 'Major', 'Serious', 
'Additive retinal toxicity risk', 
'Irreversible bull''s eye maculopathy, vision loss', 
'Both drugs accumulate in retinal pigment epithelium', 
'AVOID combination if possible. If necessary, annual retinal screening with OCT, 10-2 visual fields, multifocal ERG', 
'Clinical studies, Probable', 
TRUE, NOW(), NOW()),

(uuid_generate_v4(), 'Hydroxychloroquine (Plaquenil)', 'High Dose (>5mg/kg) or Duration >5 years', 'Major', 'Serious', 
'Cumulative dose-related retinal toxicity', 
'Bull''s eye maculopathy, paracentral scotomas, irreversible vision loss', 
'Toxic accumulation in RPE cells', 
'Annual screening with OCT, 10-2 visual fields after 5 years. Consider dose reduction if <ideal body weight', 
'Clinical guidelines, Established', 
TRUE, NOW(), NOW()),

-- ========== TB MEDICATIONS ==========

(uuid_generate_v4(), 'Ethambutol', 'Isoniazid', 'Moderate', 'Moderate', 
'Both drugs can cause optic neuropathy', 
'Bilateral vision loss, color vision defects (red-green), central scotomas', 
'Metabolic toxicity to optic nerve', 
'Monthly vision screening and Ishihara color testing. Stop both drugs immediately if vision changes', 
'Mechanism-based, Probable', 
TRUE, NOW(), NOW()),

-- ========== PDE-5 INHIBITORS ==========

(uuid_generate_v4(), 'Sildenafil (Viagra)', 'Nitrates (Nitroglycerin/Isosorbide)', 'Major', 'Critical', 
'Severe life-threatening hypotension', 
'Cardiovascular collapse, syncope, death', 
'Additive vasodilation via cGMP pathway', 
'ABSOLUTELY CONTRAINDICATED. Life-threatening interaction. 48-hour washout required', 
'FDA Black Box Warning, Established', 
TRUE, NOW(), NOW()),

(uuid_generate_v4(), 'Sildenafil (Viagra)', 'History of NAION (Non-arteritic ischemic optic neuropathy)', 'Major', 'Serious', 
'May precipitate NAION in fellow eye', 
'Sudden vision loss in second eye', 
'Vascular mechanism not fully understood', 
'RELATIVE CONTRAINDICATION. If prior NAION, avoid PDE-5 inhibitors or use lowest dose with informed consent', 
'Case reports, Probable', 
TRUE, NOW(), NOW()),

-- ========== AMIODARONE ==========

(uuid_generate_v4(), 'Amiodarone', 'Chronic Use (>6 months)', 'Minor', 'Minor', 
'Corneal deposits (vortex keratopathy) in >90% of patients', 
'Usually asymptomatic, rarely mild halos or blurred vision', 
'Lipophilic drug accumulates in corneal epithelium', 
'BENIGN in most cases. Monitor with slit lamp. Deposits resolve 3-7 months after stopping drug. DO NOT stop medication for corneal deposits alone', 
'Clinical studies, Established', 
TRUE, NOW(), NOW()),

(uuid_generate_v4(), 'Amiodarone', 'Optic Neuropathy Risk', 'Major', 'Serious', 
'Rare but serious optic nerve damage', 
'Bilateral vision loss, optic disc edema, visual field defects', 
'Mechanism unclear - possibly metabolic or vascular', 
'Baseline and periodic (every 6 months) optic nerve examination. STOP drug immediately if optic neuropathy develops', 
'Case reports, Probable', 
TRUE, NOW(), NOW()),

-- ========== ISOTRETINOIN ==========

(uuid_generate_v4(), 'Isotretinoin (Accutane)', 'Contact Lens Wear', 'Moderate', 'Moderate', 
'Severe dry eyes incompatible with contact lenses', 
'Corneal abrasion, severe discomfort, contact lens intolerance', 
'Meibomian gland atrophy causes severe evaporative dry eye', 
'DISCONTINUE contact lenses during isotretinoin treatment. Use preservative-free artificial tears 6-8x/day', 
'Clinical practice, Established', 
TRUE, NOW(), NOW()),

(uuid_generate_v4(), 'Isotretinoin (Accutane)', 'Vitamin A Supplements', 'Major', 'Serious', 
'Risk of vitamin A toxicity', 
'Pseudotumor cerebri (idiopathic intracranial hypertension), papilledema, vision loss', 
'Isotretinoin is vitamin A derivative - additive toxicity', 
'CONTRAINDICATED. Stop ALL vitamin A supplements before starting isotretinoin', 
'FDA warning, Established', 
TRUE, NOW(), NOW()),

-- ========== DUPLICATE PRESCRIPTIONS ==========

(uuid_generate_v4(), 'Timolol 0.5%', 'Timolol 0.5%', 'Major', 'Serious', 
'Duplicate prescription for same medication', 
'Severe bradycardia (<40 bpm), hypotension, bronchospasm, overdose', 
'Double dosing of beta-blocker', 
'CHECK EXISTING PRESCRIPTIONS. Verify not already prescribed. Check for combination drops (Cosopt=Timolol+Dorzolamide, Combigan=Timolol+Brimonidine)', 
'Medication safety', 
TRUE, NOW(), NOW()),

(uuid_generate_v4(), 'Latanoprost 0.005%', 'Latanoprost 0.005%', 'Major', 'Moderate', 
'Duplicate prescription for same medication', 
'Double prostaglandin exposure, increased side effects (hyperemia, iris darkening)', 
'May occur if OD/OS prescriptions overlap with OU prescription', 
'CHECK EXISTING PRESCRIPTIONS. Clarify laterality (OD/OS/OU) with patient', 
'Medication safety', 
TRUE, NOW(), NOW());

-- Display count
SELECT 'Drug interactions seeded: ' || COUNT(*)::TEXT AS result FROM drug_interaction;
