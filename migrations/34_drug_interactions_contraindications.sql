-- =============================================
-- Migration: Drug Interactions and Contraindications Database
-- Purpose: Create ophthalmology medication database with drug interactions and contraindications
-- Author: Hospital Portal Team
-- Date: February 19, 2026
-- =============================================

-- Create ophthalmology medication master table
CREATE TABLE IF NOT EXISTS ophth_medication (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    generic_name VARCHAR(255) NOT NULL,
    brand_names TEXT[], -- Array of brand names
    drug_class VARCHAR(100) NOT NULL,
    indications TEXT NOT NULL,
    contraindications TEXT,
    warnings TEXT,
    pregnancy_category VARCHAR(10),
    route VARCHAR(50) CHECK (route IN ('Topical', 'Oral', 'Injectable', 'IV', 'Subconjunctival', 'Intravitreal')),
    common_side_effects TEXT[],
    serious_side_effects TEXT[],
    monitoring_requirements TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ
);

-- Create drug interaction table
CREATE TABLE IF NOT EXISTS drug_interaction (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    medication_a_name VARCHAR(255) NOT NULL,
    medication_b_name VARCHAR(255) NOT NULL,
    interaction_type VARCHAR(50) CHECK (interaction_type IN ('Major', 'Moderate', 'Minor')),
    severity VARCHAR(20) CHECK (severity IN ('Critical', 'Serious', 'Moderate', 'Minor')),
    description TEXT NOT NULL,
    clinical_effects TEXT,
    management TEXT,
    evidence_level VARCHAR(20) CHECK (evidence_level IN ('Established', 'Probable', 'Theoretical')),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX idx_ophth_med_generic_name ON ophth_medication(generic_name) WHERE deleted_at IS NULL;
CREATE INDEX idx_ophth_med_drug_class ON ophth_medication(drug_class) WHERE deleted_at IS NULL;
CREATE INDEX idx_ophth_med_tenant ON ophth_medication(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_drug_interaction_med_a ON drug_interaction(medication_a_name) WHERE deleted_at IS NULL;
CREATE INDEX idx_drug_interaction_med_b ON drug_interaction(medication_b_name) WHERE deleted_at IS NULL;
CREATE INDEX idx_drug_interaction_severity ON drug_interaction(severity) WHERE deleted_at IS NULL;

-- Seed ophthalmology medications for India Eye Hospital Network
DO $$
DECLARE
    v_tenant_id UUID := '155fe198-6ae5-4a01-9254-ead5b427247e';
BEGIN
    -- GLAUCOMA MEDICATIONS
    INSERT INTO ophth_medication (tenant_id, generic_name, brand_names, drug_class, indications, contraindications, warnings, pregnancy_category, route, common_side_effects, serious_side_effects) VALUES
    (v_tenant_id, 'Timolol 0.5%', ARRAY['Timoptic', 'Betimol'], 'Beta-blocker', 'Primary open-angle glaucoma, Ocular hypertension', 'Asthma, COPD, Heart block, Severe cardiac failure', 'Monitor heart rate and blood pressure. May mask signs of hypoglycemia in diabetics.', 'C', 'Topical', ARRAY['Stinging', 'Blurred vision', 'Eye irritation'], ARRAY['Bradycardia', 'Bronchospasm', 'Heart failure', 'Syncope']),
    (v_tenant_id, 'Latanoprost 0.005%', ARRAY['Xalatan'], 'Prostaglandin analog', 'Primary open-angle glaucoma, Ocular hypertension', 'Pregnancy, Active intraocular inflammation', 'May cause iris darkening, eyelash changes. Use in evening only.', 'C', 'Topical', ARRAY['Eye redness', 'Iris darkening', 'Eyelash growth'], ARRAY['Macular edema', 'Iritis', 'Uveitis']),
    (v_tenant_id, 'Brimonidine 0.2%', ARRAY['Alphagan'], 'Alpha-2 agonist', 'Ocular hypertension, Open-angle glaucoma', 'MAO inhibitor therapy, Age <2 years', 'Avoid in neonates and infants. May cause CNS depression in children.', 'B', 'Topical', ARRAY['Dry mouth', 'Eye allergy', 'Drowsiness'], ARRAY['Hypotension', 'Bradycardia', 'CNS depression']),
    (v_tenant_id, 'Dorzolamide 2%', ARRAY['Trusopt'], 'Carbonic anhydrase inhibitor', 'Open-angle glaucoma, Ocular hypertension', 'Severe renal impairment, Sulfa allergy', 'Contains sulfonamide. Monitor for signs of Stevens-Johnson syndrome.', 'C', 'Topical', ARRAY['Bitter taste', 'Burning', 'Blurred vision'], ARRAY['Stevens-Johnson syndrome', 'Toxic epidermal necrolysis']),
    (v_tenant_id, 'Acetazolamide 250mg', ARRAY['Diamox'], 'Carbonic anhydrase inhibitor', 'Acute angle-closure glaucoma', 'Sulfa allergy, Severe renal/hepatic disease, Hypokalemia', 'Monitor electrolytes, especially potassium. Risk of metabolic acidosis.', 'C', 'Oral', ARRAY['Tingling in extremities', 'Frequent urination', 'Taste changes'], ARRAY['Stevens-Johnson syndrome', 'Severe metabolic acidosis', 'Aplastic anemia']),
    
    -- ANTI-INFLAMMATORY MEDICATIONS
    (v_tenant_id, 'Prednisolone Acetate 1%', ARRAY['Pred Forte'], 'Corticosteroid', 'Uveitis, Post-operative inflammation, Allergic conjunctivitis', 'Viral eye infections, Fungal eye diseases, Mycobacterial eye infections', 'Prolonged use may cause glaucoma, cataract, delayed wound healing.', 'C', 'Topical', ARRAY['Burning', 'Stinging', 'Blurred vision'], ARRAY['Increased IOP', 'Cataract formation', 'Secondary infections', 'Corneal perforation']),
    (v_tenant_id, 'Dexamethasone 0.1%', ARRAY['Maxidex'], 'Corticosteroid', 'Allergic conjunctivitis, Uveitis, Post-operative inflammation', 'Viral infections, Fungal eye disease', 'Monitor IOP with prolonged use. Taper gradually.', 'C', 'Topical', ARRAY['Burning', 'Stinging'], ARRAY['Glaucoma', 'Cataract', 'Secondary infection']),
    (v_tenant_id, 'Ketorolac 0.5%', ARRAY['Acular'], 'NSAID', 'Post-operative inflammation, Seasonal allergic conjunctivitis', 'Aspirin sensitivity, Bleeding disorders', 'May slow wound healing after surgery. Risk of corneal complications.', 'C', 'Topical', ARRAY['Stinging', 'Burning'], ARRAY['Corneal erosion', 'Corneal perforation', 'Bleeding']),
    (v_tenant_id, 'Nepafenac 0.1%', ARRAY['Nevanac'], 'NSAID', 'Post-operative inflammation (cataract surgery)', 'Aspirin allergy', 'Use with caution in complicated surgeries. Monitor for corneal complications.', 'C', 'Topical', ARRAY['Eye discomfort', 'Photophobia'], ARRAY['Corneal erosion', 'Corneal thinning']),
    
    -- ANTIBIOTICS
    (v_tenant_id, 'Moxifloxacin 0.5%', ARRAY['Vigamox'], 'Fluoroquinolone antibiotic', 'Bacterial conjunctivitis, Corneal ulcer prophylaxis', 'Fluoroquinolone hypersensitivity', 'Do not use with contact lenses. Avoid prolonged use.', 'C', 'Topical', ARRAY['Eye irritation', 'Tearing'], ARRAY['Corneal perforation (with ulcer)', 'Hypersensitivity reactions']),
    (v_tenant_id, 'Ciprofloxacin 0.3%', ARRAY['Ciloxan'], 'Fluoroquinolone antibiotic', 'Bacterial keratitis, Corneal ulcer', 'Fluoroquinolone allergy', 'May produce white crystalline precipitate. Resume after precipitate resolves.', 'C', 'Topical', ARRAY['White crystals', 'Burning'], ARRAY['Corneal perforation', 'Tendon rupture (systemic)']),
    (v_tenant_id, 'Tobramycin 0.3%', ARRAY['Tobrex'], 'Aminoglycoside antibiotic', 'External ocular infections', 'Aminoglycoside hypersensitivity', 'Prolonged use may result in overgrowth of non-susceptible organisms.', 'B', 'Topical', ARRAY['Eye irritation', 'Redness'], ARRAY['Ototoxicity (systemic use)', 'Nephrotoxicity (systemic)']),
    (v_tenant_id, 'Azithromycin 1%', ARRAY['AzaSite'], 'Macrolide antibiotic', 'Bacterial conjunctivitis', 'Macrolide hypersensitivity', 'Well tolerated. Unique dosing schedule.', 'B', 'Topical', ARRAY['Eye irritation'], ARRAY['Rare hypersensitivity']),
    
    -- ANTI-VIRAL MEDICATIONS
    (v_tenant_id, 'Acyclovir 3%', ARRAY['Zovirax'], 'Antiviral', 'Herpes simplex keratitis', 'Hypersensitivity to acyclovir', 'Complete treatment course. Monitor for recurrence.', 'B', 'Topical', ARRAY['Mild burning', 'Stinging'], ARRAY['Hypersensitivity reactions']),
    (v_tenant_id, 'Ganciclovir 0.15%', ARRAY['Zirgan'], 'Antiviral', 'Acute herpetic keratitis', 'Hypersensitivity', 'More effective than acyclovir for herpes keratitis.', 'C', 'Topical', ARRAY['Blurred vision', 'Eye irritation'], ARRAY['Bone marrow suppression (systemic)']),
    
    -- ANTI-FUNGAL MEDICATIONS
    (v_tenant_id, 'Natamycin 5%', ARRAY['Natacyn'], 'Antifungal', 'Fungal keratitis, Fungal conjunctivitis', 'Hypersensitivity', 'Only antifungal eye drop available. May need compounded alternatives.', 'C', 'Topical', ARRAY['Eye irritation', 'Tearing'], ARRAY['Rare hypersensitivity']),
    
    -- MYDRIATICS/CYCLOPLEGICS
    (v_tenant_id, 'Tropicamide 1%', ARRAY['Mydriacyl'], 'Mydriatic/Cycloplegic', 'Pupil dilation for examination, Cycloplegic refraction', 'Angle-closure glaucoma, Hypersensitivity', 'Short-acting. Warn patients about temporary vision blur and light sensitivity.', 'C', 'Topical', ARRAY['Stinging', 'Photophobia', 'Blurred vision'], ARRAY['Angle-closure glaucoma attack', 'Tachycardia']),
    (v_tenant_id, 'Cyclopentolate 1%', ARRAY['Cyclogyl'], 'Cycloplegic/Mydriatic', 'Cycloplegic refraction, Uveitis', 'Angle-closure glaucoma', 'More potent cycloplegia than tropicamide. Use with caution in children.', 'C', 'Topical', ARRAY['Burning', 'Photophobia', 'Blurred vision'], ARRAY['CNS disturbances in children', 'Angle-closure attack']),
    (v_tenant_id, 'Atropine 1%', ARRAY['Isopto Atropine'], 'Cycloplegic/Mydriatic', 'Cycloplegic refraction in children, Uveitis, Amblyopia therapy', 'Angle-closure glaucoma', 'Long-acting (7-14 days). May cause systemic anticholinergic effects.', 'C', 'Topical', ARRAY['Photophobia', 'Blurred vision', 'Dry mouth'], ARRAY['Fever', 'Tachycardia', 'CNS effects', 'Urinary retention']),
    (v_tenant_id, 'Phenylephrine 2.5%', ARRAY['Mydfrin'], 'Mydriatic', 'Pupil dilation for examination', 'Angle-closure glaucoma, Cardiovascular disease', 'Avoid 10% concentration in elderly. Monitor blood pressure.', 'C', 'Topical', ARRAY['Stinging', 'Rebound miosis'], ARRAY['Hypertensive crisis', 'Myocardial infarction', 'Stroke']),
    
    -- DRY EYE MEDICATIONS
    (v_tenant_id, 'Cyclosporine 0.05%', ARRAY['Restasis'], 'Immunomodulator', 'Chronic dry eye disease', 'Active eye infection', 'Takes 3-6 months for full effect. Very expensive.', 'C', 'Topical', ARRAY['Burning', 'Eye redness'], ARRAY['Rare hypersensitivity']),
    (v_tenant_id, 'Lifitegrast 5%', ARRAY['Xiidra'], 'Integrin antagonist', 'Dry eye disease', 'Hypersensitivity', 'Newer agent. Alternative to cyclosporine.', 'C', 'Topical', ARRAY['Dysgeusia (bad taste)', 'Eye irritation'], ARRAY['Hypersensitivity reactions']),
    (v_tenant_id, 'Artificial Tears', ARRAY['Systane', 'Refresh', 'GenTeal'], 'Lubricant', 'Dry eye, Contact lens comfort', 'Hypersensitivity to preservatives', 'Preservative-free formulations preferred for frequent use.', 'N/A', 'Topical', ARRAY['Temporary blurred vision'], ARRAY['None']),
    
    -- ANTI-VEGF INTRAVITREAL INJECTIONS
    (v_tenant_id, 'Ranibizumab', ARRAY['Lucentis'], 'Anti-VEGF', 'Wet AMD, Diabetic macular edema, RVO', 'Ocular/periocular infection, Intraocular inflammation', 'Risk of endophthalmitis, retinal detachment, increased IOP.', 'C', 'Intravitreal', ARRAY['Eye pain', 'Floaters', 'Conjunctival hemorrhage'], ARRAY['Endophthalmitis', 'Retinal detachment', 'Stroke', 'MI']),
    (v_tenant_id, 'Aflibercept', ARRAY['Eylea'], 'Anti-VEGF', 'Wet AMD, Diabetic macular edema, DME, RVO', 'Ocular/periocular infection', 'Less frequent dosing than ranibizumab.', 'C', 'Intravitreal', ARRAY['Conjunctival hemorrhage', 'Eye pain'], ARRAY['Endophthalmitis', 'Retinal detachment', 'Thromboembolic events']),
    (v_tenant_id, 'Bevacizumab', ARRAY['Avastin'], 'Anti-VEGF', 'Off-label: Wet AMD, DME, RVO', 'Active infection', 'Off-label use but widely used. Much less expensive than ranibizumab/aflibercept.', 'C', 'Intravitreal', ARRAY['Eye pain', 'Floaters'], ARRAY['Endophthalmitis', 'Retinal detachment', 'Stroke']),
    
    -- CORTICOSTEROID INTRAVITREAL INJECTIONS
    (v_tenant_id, 'Triamcinolone', ARRAY['Triesence', 'Trivaris'], 'Corticosteroid', 'Macular edema, Uveitis', 'Ocular infections', 'Risk of cataract and glaucoma with repeated injections.', 'C', 'Intravitreal', ARRAY['Increased IOP', 'Eye pain'], ARRAY['Cataract', 'Glaucoma', 'Endophthalmitis']),
    (v_tenant_id, 'Dexamethasone implant', ARRAY['Ozurdex'], 'Corticosteroid implant', 'Macular edema (RVO, DME), Non-infectious uveitis', 'Glaucoma, Ocular infections', 'Sustained-release implant lasting ~6 months. Monitor IOP closely.', 'C', 'Intravitreal', ARRAY['Increased IOP', 'Cataract progression'], ARRAY['Severe glaucoma', 'Endophthalmitis', 'Retinal detachment']),
    
    -- MIOTICS
    (v_tenant_id, 'Pilocarpine 2%', ARRAY['Isopto Carpine'], 'Miotic/Cholinergic', 'Angle-closure glaucoma, Post-mydriasis', 'Acute iritis, Pupillary block glaucoma', 'Causes miosis and blurred vision. Warn patients about night driving.', 'C', 'Topical', ARRAY['Brow ache', 'Blurred vision', 'Myopia'], ARRAY['Retinal detachment', 'Lens-iris diaphragm retropulsion']),
    
    -- ANTIHISTAMINE/MAST CELL STABILIZERS
    (v_tenant_id, 'Olopatadine 0.2%', ARRAY['Pataday', 'Patanol'], 'Antihistamine/Mast cell stabilizer', 'Allergic conjunctivitis', 'Hypersensitivity', 'Very effective for allergic eye symptoms. Once daily dosing.', 'C', 'Topical', ARRAY['Mild burning'], ARRAY['Rare hypersensitivity']),
    (v_tenant_id, 'Ketotifen 0.025%', ARRAY['Zaditor'], 'Antihistamine/Mast cell stabilizer', 'Allergic conjunctivitis', 'Hypersensitivity', 'Available over-the-counter. Good for seasonal allergies.', 'C', 'Topical', ARRAY['Mild irritation'], ARRAY['Rare hypersensitivity']),
    (v_tenant_id, 'Cromolyn 4%', ARRAY['Crolom'], 'Mast cell stabilizer', 'Allergic conjunctivitis', 'Hypersensitivity', 'Prevents histamine release. Less effective than dual-action drugs.', 'B', 'Topical', ARRAY['Stinging'], ARRAY['Rare']),
    
    -- SYSTEMIC MEDICATIONS (Common interactions)
    (v_tenant_id, 'Aspirin 75-325mg', ARRAY['Ecosprin', 'Disprin'], 'Antiplatelet', 'Cardiovascular disease prevention', 'Bleeding disorders, Active GI bleeding', 'Increases bleeding risk perioperatively. Hold 7-10 days before eye surgery.', 'D', 'Oral', ARRAY['GI upset', 'Bruising'], ARRAY['GI bleeding', 'Hemorrhagic stroke', 'Reye syndrome']),
    (v_tenant_id, 'Warfarin', ARRAY['Coumadin'], 'Anticoagulant', 'Atrial fibrillation, DVT/PE prevention', 'Active bleeding, Pregnancy', 'Requires INR monitoring. High bleeding risk with ocular procedures.', 'X', 'Oral', ARRAY['Bruising', 'Bleeding'], ARRAY['Intracranial hemorrhage', 'Retinal hemorrhage', 'Hyphema']),
    (v_tenant_id, 'Tamsulosin', ARRAY['Flomax'], 'Alpha-blocker', 'Benign prostatic hyperplasia', 'Severe hepatic impairment', 'Causes Intraoperative Floppy Iris Syndrome (IFIS) during cataract surgery.', 'B', 'Oral', ARRAY['Dizziness', 'Rhinitis'], ARRAY['IFIS', 'Hypotension', 'Syncope']),
    (v_tenant_id, 'Hydroxychloroquine', ARRAY['Plaquenil'], 'Antimalarial/DMARD', 'Rheumatoid arthritis, Lupus, Malaria', 'Retinal/visual field changes', 'Requires baseline and annual retinal screening due to risk of retinal toxicity.', 'C', 'Oral', ARRAY['Nausea', 'Headache'], ARRAY['Retinal toxicity (bull\'s eye maculopathy)', 'Cardiomyopathy']),
    (v_tenant_id, 'Ethambutol', ARRAY['Myambutol'], 'Antimycobacterial', 'Tuberculosis', 'Optic neuritis', 'Monitor visual acuity and color vision monthly. Stop if vision changes.', 'B', 'Oral', ARRAY['Nausea', 'Headache'], ARRAY['Optic neuritis', 'Vision loss', 'Color blindness']),
    (v_tenant_id, 'Sildenafil', ARRAY['Viagra'], 'PDE-5 inhibitor', 'Erectile dysfunction', 'Nitrate use, Recent MI/stroke', 'May cause transient blue vision. Avoid in NAION.', 'B', 'Oral', ARRAY['Headache', 'Flushing', 'Blue tinge to vision'], ARRAY['NAION', 'Priapism', 'Sudden hearing loss']),
    (v_tenant_id, 'Amiodarone', ARRAY['Cordarone'], 'Antiarrhythmic', 'Atrial fibrillation, Ventricular arrhythmias', 'Severe sinus node dysfunction', 'Causes corneal deposits (vortex keratopathy) in nearly all patients on long-term therapy.', 'D', 'Oral', ARRAY['Corneal deposits', 'Photosensitivity'], ARRAY['Optic neuropathy', 'Vision loss', 'Thyroid dysfunction']),
    (v_tenant_id, 'Isotretinoin', ARRAY['Accutane', 'Roaccutane'], 'Retinoid', 'Severe acne', 'Pregnancy, Vitamin A supplementation', 'Causes severe dry eyes and blepharitis. Avoid contact lenses during treatment.', 'X', 'Oral', ARRAY['Dry eyes', 'Blepharitis', 'Photophobia'], ARRAY['Intracranial hypertension', 'Corneal opacities', 'Vision changes']);

    RAISE NOTICE '✅ Successfully seeded % ophthalmology medications', (SELECT COUNT(*) FROM ophth_medication WHERE tenant_id = v_tenant_id);
END $$;

-- Seed common drug interactions for ophthalmology
DO $$
DECLARE
    v_tenant_id UUID := '155fe198-6ae5-4a01-9254-ead5b427247e';
BEGIN
    INSERT INTO drug_interaction (tenant_id, medication_a_name, medication_b_name, interaction_type, severity, description, clinical_effects, management, evidence_level) VALUES
    -- Beta-blocker + respiratory conditions
    (v_tenant_id, 'Timolol 0.5%', 'Asthma/COPD History', 'Major', 'Critical', 'Beta-blockers can cause bronchospasm in patients with reactive airway disease', 'Wheezing, shortness of breath, respiratory distress', 'CONTRAINDICATED. Use prostaglandin analog (Latanoprost) or alpha-agonist (Brimonidine) instead', 'Established'),
    
    -- Beta-blocker + cardiac conditions
    (v_tenant_id, 'Timolol 0.5%', 'Heart Block', 'Major', 'Critical', 'Beta-blockers worsen conduction abnormalities', 'Bradycardia, complete heart block, syncope', 'CONTRAINDICATED. Use alternative glaucoma medication', 'Established'),
    (v_tenant_id, 'Timolol 0.5%', 'Calcium Channel Blockers', 'Major', 'Serious', 'Additive effect on cardiac conduction and contractility', 'Severe bradycardia, AV block, heart failure', 'Monitor heart rate and blood pressure. Consider alternative glaucoma therapy', 'Established'),
    
    -- Corticosteroid + infections
    (v_tenant_id, 'Prednisolone Acetate 1%', 'Herpes Simplex Keratitis', 'Major', 'Critical', 'Corticosteroids can worsen viral infections and delay healing', 'Corneal perforation, vision loss, geographic ulcer', 'ABSOLUTELY CONTRAINDICATED. Treat with antiviral (Acyclovir) instead', 'Established'),
    (v_tenant_id, 'Prednisolone Acetate 1%', 'Fungal Keratitis', 'Major', 'Critical', 'Corticosteroids exacerbate fungal infections', 'Corneal perforation, endophthalmitis, vision loss', 'CONTRAINDICATED. Treat with antifungal (Natamycin) only', 'Established'),
    
    -- Corticosteroid long-term risks
    (v_tenant_id, 'Prednisolone Acetate 1%', 'Prolonged Use >2 weeks', 'Major', 'Serious', 'Long-term steroids cause glaucoma and cataract', 'Steroid-induced glaucoma, posterior subcapsular cataract', 'Monitor IOP weekly. Taper gradually. Consider steroid-sparing agents', 'Established'),
    
    -- Fluoroquinolone + corneal ulcer
    (v_tenant_id, 'Moxifloxacin 0.5%', 'Corticosteroid Use in Bacterial Keratitis', 'Major', 'Serious', 'Steroids used too early can worsen bacterial infections', 'Corneal perforation, endophthalmitis', 'Wait 48-72 hours after antibiotics before adding steroid. Ensure infection is resolving', 'Established'),
    
    -- Prostaglandin + pregnancy
    (v_tenant_id, 'Latanoprost 0.005%', 'Pregnancy', 'Major', 'Serious', 'Prostaglandins may induce labor and are teratogenic', 'Preterm labor, fetal abnormalities', 'CONTRAINDICATED in pregnancy. Use brimonidine (Category B) if needed', 'Probable'),
    
    -- Mydriatics + angle-closure risk
    (v_tenant_id, 'Tropicamide 1%', 'Narrow Angles', 'Major', 'Critical', 'Pupil dilation precipitates acute angle-closure glaucoma', 'Severe eye pain, headache, nausea, vision loss', 'Check anterior chamber depth first. Have pilocarpine ready. Warn patient of symptoms', 'Established'),
    (v_tenant_id, 'Cyclopentolate 1%', 'Narrow Angles', 'Major', 'Critical', 'Cycloplegics precipitate angle-closure glaucoma', 'Acute angle-closure attack', 'Check angles before use. Contraindicated in shallow AC', 'Established'),
    (v_tenant_id, 'Atropine 1%', 'Narrow Angles', 'Major', 'Critical', 'Long-acting mydriatic with high angle-closure risk', 'Prolonged angle-closure lasting days', 'AVOID in narrow angles. Use short-acting alternatives', 'Established'),
    
    -- Phenylephrine + hypertension
    (v_tenant_id, 'Phenylephrine 2.5%', 'Uncontrolled Hypertension', 'Major', 'Critical', 'Sympathomimetic causes systemic vasoconstriction and hypertension', 'Hypertensive crisis, stroke, myocardial infarction', 'Use 2.5% concentration only (not 10%). Check blood pressure. Use tropicamide alone if possible', 'Established'),
    (v_tenant_id, 'Phenylephrine 2.5%', 'MAO Inhibitors', 'Major', 'Critical', 'Exaggerated hypertensive response', 'Severe hypertension, cerebral hemorrhage', 'CONTRAINDICATED within 21 days of MAO inhibitor use', 'Established'),
    
    -- Carbonic anhydrase inhibitors + sulfa allergy
    (v_tenant_id, 'Dorzolamide 2%', 'Sulfa Allergy', 'Major', 'Serious', 'Cross-reactivity with sulfonamide antibiotics', 'Stevens-Johnson syndrome, toxic epidermal necrolysis, anaphylaxis', 'CONTRAINDICATED. Use beta-blocker or prostaglandin instead', 'Probable'),
    (v_tenant_id, 'Acetazolamide 250mg', 'Sulfa Allergy', 'Major', 'Critical', 'Contains sulfonamide group', 'Severe allergic reactions, Stevens-Johnson syndrome', 'ABSOLUTELY CONTRAINDICATED. Use IV mannitol for acute IOP reduction instead', 'Established'),
    
    -- Acetazolamide + electrolytes
    (v_tenant_id, 'Acetazolamide 250mg', 'Hypokalemia', 'Major', 'Serious', 'Worsens existing hypokalemia', 'Cardiac arrhythmias, muscle weakness', 'Check and correct potassium before starting. Monitor electrolytes', 'Established'),
    (v_tenant_id, 'Acetazolamide 250mg', 'Aspirin High Dose', 'Moderate', 'Moderate', 'Increased risk of metabolic acidosis and salicylate toxicity', 'CNS depression, metabolic acidosis', 'Monitor for signs of salicylate toxicity', 'Probable'),
    
    -- NSAIDs + bleeding risk
    (v_tenant_id, 'Ketorolac 0.5%', 'Aspirin', 'Moderate', 'Moderate', 'Increased bleeding risk perioperatively', 'Hyphema, retinal hemorrhage', 'Discontinue aspirin 7-10 days before surgery if possible. Monitor closely', 'Established'),
    (v_tenant_id, 'Ketorolac 0.5%', 'Warfarin', 'Major', 'Serious', 'Additive bleeding risk', 'Severe hyphema, suprachoroidal hemorrhage', 'Use with extreme caution. Monitor INR. Consider alternative', 'Established'),
    (v_tenant_id, 'Nepafenac 0.1%', 'Complicated Surgery', 'Moderate', 'Moderate', 'Increased risk of corneal melting in compromised eyes', 'Corneal erosion, perforation', 'Avoid in epithelial defects or complicated surgeries', 'Probable'),
    
    -- Anticoagulants + ocular procedures
    (v_tenant_id, 'Warfarin', 'Cataract Surgery', 'Major', 'Serious', 'Increased bleeding during and after surgery', 'Hyphema, suprachoroidal hemorrhage, expulsive hemorrhage', 'Consider holding if INR >3. Discuss with cardiologist. Have reversal agents ready', 'Established'),
    (v_tenant_id, 'Warfarin', 'Intravitreal Injection', 'Moderate', 'Moderate', 'Increased vitreous hemorrhage risk', 'Vitreous hemorrhage, retinal hemorrhage', 'Usually safe to continue. Apply firm pressure post-injection', 'Probable'),
    (v_tenant_id, 'Aspirin 75-325mg', 'Retina Surgery', 'Major', 'Serious', 'Increased intraoperative and postoperative bleeding', 'Suprachoroidal hemorrhage, increased blood loss', 'Hold 7-10 days before surgery if cardiologist approves', 'Established'),
    
    -- Alpha-blockers + cataract surgery
    (v_tenant_id, 'Tamsulosin', 'Cataract Surgery', 'Major', 'Serious', 'Intraoperative Floppy Iris Syndrome (IFIS)', 'Iris prolapse, posterior capsule rupture, vitreous loss, poor dilation', 'Inform surgeon before surgery. Plan for IFIS management (iris hooks, Malyugin ring)', 'Established'),
    
    -- Antimalarial + retinal toxicity
    (v_tenant_id, 'Hydroxychloroquine', 'Tamoxifen', 'Major', 'Serious', 'Additive retinal toxicity risk', 'Irreversible retinal damage, vision loss', 'Annual retinal exam mandatory. Monitor with OCT and visual fields', 'Probable'),
    (v_tenant_id, 'Hydroxychloroquine', 'High Dose or Duration >5 years', 'Major', 'Serious', 'Cumulative dose-related retinal toxicity', 'Bull\'s eye maculopathy, irreversible vision loss', 'Annual screening with OCT, visual fields, multifocal ERG. Consider dose reduction', 'Established'),
    
    -- Ethambutol + optic neuropathy
    (v_tenant_id, 'Ethambutol', 'Isoniazid', 'Moderate', 'Moderate', 'Both can cause optic neuropathy', 'Bilateral vision loss, color vision defects', 'Monthly vision and color vision screening. Stop if any vision change', 'Probable'),
    
    -- PDE-5 inhibitors + nitrates
    (v_tenant_id, 'Sildenafil', 'Nitrates', 'Major', 'Critical', 'Severe hypotension', 'Cardiovascular collapse, death', 'ABSOLUTELY CONTRAINDICATED. Life-threatening interaction', 'Established'),
    (v_tenant_id, 'Sildenafil', 'NAION History', 'Major', 'Serious', 'May precipitate non-arteritic anterior ischemic optic neuropathy', 'Sudden vision loss', 'Avoid in patients with prior NAION. RELATIVE CONTRAINDICATION', 'Probable'),
    
    -- Amiodarone + corneal deposits
    (v_tenant_id, 'Amiodarone', 'Vortex Keratopathy', 'Minor', 'Minor', 'Causes corneal deposits in >90% of patients', 'Usually asymptomatic, rarely affects vision', 'Monitor with slit lamp. Deposits resolve after stopping drug', 'Established'),
    (v_tenant_id, 'Amiodarone', 'Optic Neuropathy Risk', 'Major', 'Serious', 'Rare but serious optic nerve damage', 'Bilateral vision loss, optic disc edema', 'Baseline and periodic optic nerve evaluation. Stop drug if optic neuropathy develops', 'Probable'),
    
    -- Isotretinoin + dry eye
    (v_tenant_id, 'Isotretinoin', 'Contact Lens Wear', 'Moderate', 'Moderate', 'Severe dry eyes preclude contact lens wear', 'Corneal abrasion, discomfort, intolerance', 'Discontinue contact lenses during treatment. Use preservative-free artificial tears frequently', 'Established'),
    (v_tenant_id, 'Isotretinoin', 'Vitamin A Supplements', 'Major', 'Serious', 'Risk of vitamin A toxicity', 'Intracranial hypertension, papilledema', 'CONTRAINDICATED. Stop all vitamin A supplements', 'Established'),
    
    -- Same drug duplicate prescriptions
    (v_tenant_id, 'Latanoprost 0.005%', 'Latanoprost 0.005%', 'Major', 'Moderate', 'Duplicate prescription for same medication', 'Overdose, increased side effects', 'Check existing prescriptions before prescribing. May have OD/OS vs OU overlap', 'N/A'),
    (v_tenant_id, 'Timolol 0.5%', 'Timolol 0.5%', 'Major', 'Serious', 'Duplicate beta-blocker prescription', 'Severe bradycardia, bronchospasm', 'Verify not already prescribed. Check for combination drops (Cosopt, Combigan)', 'N/A');

    RAISE NOTICE '✅ Successfully seeded % drug interactions', (SELECT COUNT(*) FROM drug_interaction WHERE tenant_id = v_tenant_id);
END $$;

-- Create function to check drug interactions
CREATE OR REPLACE FUNCTION check_drug_interactions(
    p_tenant_id UUID,
    p_patient_id UUID,
    p_new_medication VARCHAR(255)
)
RETURNS TABLE (
    interaction_id UUID,
    existing_medication VARCHAR(255),
    severity VARCHAR(20),
    description TEXT,
    clinical_effects TEXT,
    management TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        di.id AS interaction_id,
        pr.medication_name AS existing_medication,
        di.severity,
        di.description,
        di.clinical_effects,
        di.management
    FROM prescription pr
    JOIN drug_interaction di ON (
        (LOWER(pr.medication_name) LIKE '%' || LOWER(di.medication_a_name) || '%' AND LOWER(p_new_medication) LIKE '%' || LOWER(di.medication_b_name) || '%')
        OR
        (LOWER(pr.medication_name) LIKE '%' || LOWER(di.medication_b_name) || '%' AND LOWER(p_new_medication) LIKE '%' || LOWER(di.medication_a_name) || '%')
    )
    WHERE pr.patient_id = p_patient_id
        AND pr.tenant_id = p_tenant_id
        AND di.tenant_id = p_tenant_id
        AND pr.deleted_at IS NULL
        AND pr.status = 'active'
        AND (pr.end_date IS NULL OR pr.end_date > NOW())
        AND di.deleted_at IS NULL
    ORDER BY 
        CASE di.severity
            WHEN 'Critical' THEN 1
            WHEN 'Serious' THEN 2
            WHEN 'Moderate' THEN 3
            ELSE 4
        END;
END;
$$ LANGUAGE plpgsql;

-- Create function to get medication information
CREATE OR REPLACE FUNCTION get_medication_info(
    p_tenant_id UUID,
    p_medication_name VARCHAR(255)
)
RETURNS TABLE (
    generic_name VARCHAR(255),
    brand_names TEXT[],
    drug_class VARCHAR(100),
    contraindications TEXT,
    warnings TEXT,
    pregnancy_category VARCHAR(10),
    route VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        om.generic_name,
        om.brand_names,
        om.drug_class,
        om.contraindications,
        om.warnings,
        om.pregnancy_category,
        om.route
    FROM ophth_medication om
    WHERE om.tenant_id = p_tenant_id
        AND om.deleted_at IS NULL
        AND om.status = 'active'
        AND (
            LOWER(om.generic_name) LIKE '%' || LOWER(p_medication_name) || '%'
            OR LOWER(p_medication_name) = ANY(SELECT LOWER(unnest(om.brand_names)))
        )
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE ophth_medication IS 'Master table of ophthalmology medications with contraindications and warnings';
COMMENT ON TABLE drug_interaction IS 'Drug-drug interactions specific to ophthalmology practice';
COMMENT ON FUNCTION check_drug_interactions IS 'Check for drug interactions between new medication and patient''s active prescriptions';
COMMENT ON FUNCTION get_medication_info IS 'Get detailed information about a medication including contraindications';

SELECT '✅ Migration 34: Drug Interactions and Contraindications completed successfully' AS status;
