-- =============================================
-- Phase 3: Prescriptions Module - Database Schema
-- Created: January 28, 2026
-- Description: Prescription management with drug interactions and medication database
-- =============================================

-- Table 1: prescription
-- Main prescription table with patient, doctor, and prescription details
CREATE TABLE IF NOT EXISTS prescription (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    doctor_id UUID NOT NULL,
    prescription_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    diagnosis TEXT NOT NULL,
    instructions TEXT,
    duration_days INT,
    follow_up_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, completed, cancelled, expired
    pharmacy_id UUID, -- If dispensed from a specific pharmacy
    dispensed_date TIMESTAMPTZ,
    dispensed_by_user_id UUID,
    notes TEXT,
    is_printed BOOLEAN DEFAULT FALSE,
    printed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ
);

-- Table 2: prescription_medication
-- Individual medications within a prescription
CREATE TABLE IF NOT EXISTS prescription_medication (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    prescription_id UUID NOT NULL REFERENCES prescription(id) ON DELETE CASCADE,
    medication_name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(200),
    dosage VARCHAR(100) NOT NULL, -- e.g., "0.5%", "500mg"
    form VARCHAR(50) NOT NULL, -- tablet, capsule, syrup, eye drops, injection
    route VARCHAR(50) NOT NULL, -- oral, topical, ocular, intramuscular, intravenous
    frequency VARCHAR(100) NOT NULL, -- e.g., "4 times daily", "Every 6 hours", "As needed"
    duration_days INT NOT NULL,
    quantity INT NOT NULL, -- Total quantity prescribed
    instructions TEXT, -- Special instructions for this medication
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE, -- Auto-calculated from start_date + duration_days
    refills_allowed INT DEFAULT 0,
    refills_remaining INT DEFAULT 0,
    is_critical BOOLEAN DEFAULT FALSE, -- Critical medication (e.g., antibiotics post-surgery)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Table 3: drug_interaction
-- Database of drug-drug interactions
CREATE TABLE IF NOT EXISTS drug_interaction (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drug1_name VARCHAR(200) NOT NULL,
    drug2_name VARCHAR(200) NOT NULL,
    interaction_type VARCHAR(50) NOT NULL, -- major, moderate, minor
    severity VARCHAR(50) NOT NULL, -- high, medium, low
    description TEXT NOT NULL,
    clinical_effects TEXT,
    mechanism TEXT,
    management TEXT,
    reference_sources TEXT, -- Renamed from 'references' (PostgreSQL reserved word)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(drug1_name, drug2_name)
);

-- Table 4: medication_master
-- Master medication database with common ophthalmology medications
CREATE TABLE IF NOT EXISTS medication_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL UNIQUE,
    generic_name VARCHAR(200),
    brand_names TEXT[], -- Array of brand names
    category VARCHAR(100) NOT NULL, -- antibiotic, anti-inflammatory, glaucoma, mydriatic, etc.
    form VARCHAR(50) NOT NULL, -- tablet, eye drops, ointment, injection
    standard_dosages TEXT[], -- Array of common dosages
    route VARCHAR(50) NOT NULL,
    contraindications TEXT,
    side_effects TEXT,
    pregnancy_category VARCHAR(10),
    requires_prescription BOOLEAN DEFAULT TRUE,
    is_controlled_substance BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES for Performance Optimization
-- =============================================

-- Prescription indexes
CREATE INDEX IF NOT EXISTS idx_prescription_tenant ON prescription(tenant_id);
CREATE INDEX IF NOT EXISTS idx_prescription_patient ON prescription(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescription_doctor ON prescription(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescription_date ON prescription(prescription_date);
CREATE INDEX IF NOT EXISTS idx_prescription_status ON prescription(status);
CREATE INDEX IF NOT EXISTS idx_prescription_deleted ON prescription(deleted_at);

-- Prescription Medication indexes
CREATE INDEX IF NOT EXISTS idx_prescription_medication_tenant ON prescription_medication(tenant_id);
CREATE INDEX IF NOT EXISTS idx_prescription_medication_prescription ON prescription_medication(prescription_id);
CREATE INDEX IF NOT EXISTS idx_prescription_medication_name ON prescription_medication(medication_name);
CREATE INDEX IF NOT EXISTS idx_prescription_medication_dates ON prescription_medication(start_date, end_date);

-- Drug Interaction indexes
CREATE INDEX IF NOT EXISTS idx_drug_interaction_drug1 ON drug_interaction(drug1_name);
CREATE INDEX IF NOT EXISTS idx_drug_interaction_drug2 ON drug_interaction(drug2_name);
CREATE INDEX IF NOT EXISTS idx_drug_interaction_type ON drug_interaction(interaction_type);
CREATE INDEX IF NOT EXISTS idx_drug_interaction_severity ON drug_interaction(severity);

-- Medication Master indexes
CREATE INDEX IF NOT EXISTS idx_medication_master_name ON medication_master(name);
CREATE INDEX IF NOT EXISTS idx_medication_master_generic ON medication_master(generic_name);
CREATE INDEX IF NOT EXISTS idx_medication_master_category ON medication_master(category);
CREATE INDEX IF NOT EXISTS idx_medication_master_active ON medication_master(is_active);

-- Full-text search index for medication search
CREATE INDEX IF NOT EXISTS idx_medication_master_search ON medication_master USING gin(to_tsvector('english', name || ' ' || COALESCE(generic_name, '')));

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on prescription
ALTER TABLE prescription ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_prescription ON prescription
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Enable RLS on prescription_medication
ALTER TABLE prescription_medication ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_prescription_medication ON prescription_medication
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Note: drug_interaction and medication_master are global tables, no RLS needed

-- =============================================
-- AUDIT TRIGGERS (HIPAA Compliance)
-- =============================================

-- Trigger for prescription changes
CREATE OR REPLACE FUNCTION audit_prescription_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, changed_at, changed_by)
        VALUES ('prescription', OLD.id, 'DELETE', row_to_json(OLD), NULL, NOW(), OLD.updated_by_user_id);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, changed_at, changed_by)
        VALUES ('prescription', NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), NOW(), NEW.updated_by_user_id);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, changed_at, changed_by)
        VALUES ('prescription', NEW.id, 'INSERT', NULL, row_to_json(NEW), NOW(), NEW.created_by_user_id);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prescription_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON prescription
FOR EACH ROW EXECUTE FUNCTION audit_prescription_changes();

-- Trigger for prescription_medication changes
CREATE OR REPLACE FUNCTION audit_prescription_medication_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, changed_at, changed_by)
        VALUES ('prescription_medication', OLD.id, 'DELETE', row_to_json(OLD), NULL, NOW(), NULL);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, changed_at, changed_by)
        VALUES ('prescription_medication', NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), NOW(), NULL);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, changed_at, changed_by)
        VALUES ('prescription_medication', NEW.id, 'INSERT', NULL, row_to_json(NEW), NOW(), NULL);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prescription_medication_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON prescription_medication
FOR EACH ROW EXECUTE FUNCTION audit_prescription_medication_changes();

-- =============================================
-- SEED DATA: Ophthalmology Medications
-- =============================================

INSERT INTO medication_master (name, generic_name, brand_names, category, form, standard_dosages, route, contraindications, side_effects, pregnancy_category, requires_prescription, is_controlled_substance)
VALUES
-- Antibiotics (Eye Drops)
('Moxifloxacin', 'Moxifloxacin', ARRAY['Vigamox', 'Moxeza'], 'Antibiotic', 'eye drops', ARRAY['0.5%'], 'ocular', 'Hypersensitivity to fluoroquinolones', 'Burning, stinging, eye irritation', 'C', TRUE, FALSE),
('Gatifloxacin', 'Gatifloxacin', ARRAY['Zymar', 'Zymaxid'], 'Antibiotic', 'eye drops', ARRAY['0.3%', '0.5%'], 'ocular', 'Hypersensitivity to fluoroquinolones', 'Eye irritation, taste disturbance', 'C', TRUE, FALSE),
('Ofloxacin', 'Ofloxacin', ARRAY['Ocuflox'], 'Antibiotic', 'eye drops', ARRAY['0.3%'], 'ocular', 'Hypersensitivity to fluoroquinolones', 'Burning, stinging', 'C', TRUE, FALSE),
('Ciprofloxacin', 'Ciprofloxacin', ARRAY['Ciloxan'], 'Antibiotic', 'eye drops', ARRAY['0.3%'], 'ocular', 'Hypersensitivity to fluoroquinolones', 'Corneal deposits, burning', 'C', TRUE, FALSE),
('Tobramycin', 'Tobramycin', ARRAY['Tobrex'], 'Antibiotic', 'eye drops', ARRAY['0.3%'], 'ocular', 'Hypersensitivity to aminoglycosides', 'Eye irritation, lid itching', 'B', TRUE, FALSE),

-- Anti-inflammatory (Steroids)
('Prednisolone Acetate', 'Prednisolone', ARRAY['Pred Forte', 'Omnipred'], 'Steroid', 'eye drops', ARRAY['1%'], 'ocular', 'Viral/fungal infections, open wounds', 'Increased IOP, cataract formation', 'C', TRUE, FALSE),
('Dexamethasone', 'Dexamethasone', ARRAY['Maxidex'], 'Steroid', 'eye drops', ARRAY['0.1%'], 'ocular', 'Viral/fungal infections', 'Increased IOP, delayed healing', 'C', TRUE, FALSE),
('Loteprednol', 'Loteprednol', ARRAY['Lotemax', 'Alrex'], 'Steroid', 'eye drops', ARRAY['0.2%', '0.5%'], 'ocular', 'Viral/fungal infections', 'Lower IOP risk than pred', 'C', TRUE, FALSE),

-- NSAIDs
('Ketorolac', 'Ketorolac', ARRAY['Acular'], 'NSAID', 'eye drops', ARRAY['0.4%', '0.5%'], 'ocular', 'Aspirin sensitivity, bleeding disorders', 'Burning, stinging', 'C', TRUE, FALSE),
('Nepafenac', 'Nepafenac', ARRAY['Nevanac'], 'NSAID', 'eye drops', ARRAY['0.1%', '0.3%'], 'ocular', 'Aspirin sensitivity', 'Reduced corneal healing risk', 'C', TRUE, FALSE),
('Bromfenac', 'Bromfenac', ARRAY['Prolensa', 'BromSite'], 'NSAID', 'eye drops', ARRAY['0.07%', '0.075%', '0.09%'], 'ocular', 'Aspirin sensitivity', 'Eye irritation', 'C', TRUE, FALSE),

-- Glaucoma Medications (Prostaglandin Analogs)
('Latanoprost', 'Latanoprost', ARRAY['Xalatan'], 'Glaucoma', 'eye drops', ARRAY['0.005%'], 'ocular', 'Hypersensitivity', 'Iris pigmentation, lash growth', 'C', TRUE, FALSE),
('Travoprost', 'Travoprost', ARRAY['Travatan'], 'Glaucoma', 'eye drops', ARRAY['0.004%'], 'ocular', 'Hypersensitivity', 'Iris pigmentation, hyperemia', 'C', TRUE, FALSE),
('Bimatoprost', 'Bimatoprost', ARRAY['Lumigan'], 'Glaucoma', 'eye drops', ARRAY['0.01%', '0.03%'], 'ocular', 'Hypersensitivity', 'Iris pigmentation, lash growth', 'C', TRUE, FALSE),
('Tafluprost', 'Tafluprost', ARRAY['Zioptan'], 'Glaucoma', 'eye drops', ARRAY['0.0015%'], 'ocular', 'Hypersensitivity', 'Conjunctival hyperemia', 'C', TRUE, FALSE),

-- Beta-Blockers
('Timolol', 'Timolol', ARRAY['Timoptic'], 'Glaucoma', 'eye drops', ARRAY['0.25%', '0.5%'], 'ocular', 'Asthma, COPD, heart block', 'Bradycardia, bronchospasm', 'C', TRUE, FALSE),
('Betaxolol', 'Betaxolol', ARRAY['Betoptic'], 'Glaucoma', 'eye drops', ARRAY['0.25%', '0.5%'], 'ocular', 'Heart block, sinus bradycardia', 'Less respiratory effects', 'C', TRUE, FALSE),
('Levobunolol', 'Levobunolol', ARRAY['Betagan'], 'Glaucoma', 'eye drops', ARRAY['0.25%', '0.5%'], 'ocular', 'Asthma, COPD', 'Bradycardia', 'C', TRUE, FALSE),

-- Alpha-Agonists
('Brimonidine', 'Brimonidine', ARRAY['Alphagan'], 'Glaucoma', 'eye drops', ARRAY['0.1%', '0.15%', '0.2%'], 'ocular', 'MAO inhibitor use', 'Dry mouth, fatigue, allergy', 'B', TRUE, FALSE),
('Apraclonidine', 'Apraclonidine', ARRAY['Iopidine'], 'Glaucoma', 'eye drops', ARRAY['0.5%', '1%'], 'ocular', 'MAO inhibitor use', 'Tachyphylaxis common', 'C', TRUE, FALSE),

-- Carbonic Anhydrase Inhibitors
('Dorzolamide', 'Dorzolamide', ARRAY['Trusopt'], 'Glaucoma', 'eye drops', ARRAY['2%'], 'ocular', 'Sulfa allergy', 'Bitter taste, burning', 'C', TRUE, FALSE),
('Brinzolamide', 'Brinzolamide', ARRAY['Azopt'], 'Glaucoma', 'eye drops', ARRAY['1%'], 'ocular', 'Sulfa allergy', 'Blurred vision', 'C', TRUE, FALSE),
('Acetazolamide', 'Acetazolamide', ARRAY['Diamox'], 'Glaucoma', 'tablet', ARRAY['250mg', '500mg'], 'oral', 'Sulfa allergy, kidney/liver disease', 'Paresthesias, metabolic acidosis', 'C', TRUE, FALSE),

-- Mydriatics/Cycloplegics
('Tropicamide', 'Tropicamide', ARRAY['Mydriacyl'], 'Mydriatic', 'eye drops', ARRAY['0.5%', '1%'], 'ocular', 'Narrow-angle glaucoma', 'Photophobia, blurred vision', 'C', TRUE, FALSE),
('Cyclopentolate', 'Cyclopentolate', ARRAY['Cyclogyl'], 'Cycloplegic', 'eye drops', ARRAY['0.5%', '1%', '2%'], 'ocular', 'Narrow-angle glaucoma', 'Blurred vision, photophobia', 'C', TRUE, FALSE),
('Phenylephrine', 'Phenylephrine', ARRAY['Neo-Synephrine'], 'Mydriatic', 'eye drops', ARRAY['2.5%', '10%'], 'ocular', 'Narrow-angle glaucoma, hypertension', 'Hypertension, rebound miosis', 'C', TRUE, FALSE),
('Atropine', 'Atropine', ARRAY['Isopto Atropine'], 'Cycloplegic', 'eye drops', ARRAY['0.5%', '1%'], 'ocular', 'Narrow-angle glaucoma', 'Prolonged cycloplegia', 'C', TRUE, FALSE),

-- Combination Glaucoma Medications
('Dorzolamide/Timolol', 'Dorzolamide/Timolol', ARRAY['Cosopt'], 'Glaucoma Combination', 'eye drops', ARRAY['2%/0.5%'], 'ocular', 'Asthma, COPD, sulfa allergy', 'Combined side effects', 'C', TRUE, FALSE),
('Brimonidine/Timolol', 'Brimonidine/Timolol', ARRAY['Combigan'], 'Glaucoma Combination', 'eye drops', ARRAY['0.2%/0.5%'], 'ocular', 'Asthma, COPD, MAO use', 'Combined side effects', 'C', TRUE, FALSE),
('Brinzolamide/Brimonidine', 'Brinzolamide/Brimonidine', ARRAY['Simbrinza'], 'Glaucoma Combination', 'eye drops', ARRAY['1%/0.2%'], 'ocular', 'Sulfa allergy, MAO use', 'Combined side effects', 'C', TRUE, FALSE),

-- Artificial Tears and Lubricants
('Carboxymethylcellulose', 'Carboxymethylcellulose', ARRAY['Refresh Tears', 'Systane'], 'Lubricant', 'eye drops', ARRAY['0.5%', '1%'], 'ocular', 'None', 'Temporary blurred vision', 'N/A', FALSE, FALSE),
('Sodium Hyaluronate', 'Sodium Hyaluronate', ARRAY['Blink', 'Hylo'], 'Lubricant', 'eye drops', ARRAY['0.1%', '0.2%', '0.4%'], 'ocular', 'None', 'Temporary blurred vision', 'N/A', FALSE, FALSE),

-- Anti-VEGF (Intravitreal Injections)
('Bevacizumab', 'Bevacizumab', ARRAY['Avastin'], 'Anti-VEGF', 'injection', ARRAY['1.25mg/0.05ml'], 'intravitreal', 'Active infection', 'Endophthalmitis, retinal detachment', 'C', TRUE, FALSE),
('Ranibizumab', 'Ranibizumab', ARRAY['Lucentis'], 'Anti-VEGF', 'injection', ARRAY['0.5mg/0.05ml'], 'intravitreal', 'Active infection', 'Endophthalmitis, increased IOP', 'C', TRUE, FALSE),
('Aflibercept', 'Aflibercept', ARRAY['Eylea'], 'Anti-VEGF', 'injection', ARRAY['2mg/0.05ml'], 'intravitreal', 'Active infection', 'Endophthalmitis, conjunctival hemorrhage', 'C', TRUE, FALSE),
('Brolucizumab', 'Brolucizumab', ARRAY['Beovu'], 'Anti-VEGF', 'injection', ARRAY['6mg/0.05ml'], 'intravitreal', 'Active infection', 'Retinal vasculitis risk', 'C', TRUE, FALSE),

-- Steroid Injections
('Triamcinolone Acetonide', 'Triamcinolone', ARRAY['Kenalog'], 'Steroid', 'injection', ARRAY['40mg/ml'], 'intravitreal', 'Active infection', 'Increased IOP, cataract', 'C', TRUE, FALSE),
('Dexamethasone Implant', 'Dexamethasone', ARRAY['Ozurdex'], 'Steroid', 'implant', ARRAY['0.7mg'], 'intravitreal', 'Active infection', 'Increased IOP, cataract', 'C', TRUE, FALSE),

-- Antihistamines/Mast Cell Stabilizers
('Olopatadine', 'Olopatadine', ARRAY['Pataday', 'Patanol'], 'Antihistamine', 'eye drops', ARRAY['0.1%', '0.2%', '0.7%'], 'ocular', 'None', 'Headache, burning', 'C', TRUE, FALSE),
('Ketotifen', 'Ketotifen', ARRAY['Zaditor', 'Alaway'], 'Antihistamine', 'eye drops', ARRAY['0.025%', '0.035%'], 'ocular', 'None', 'Conjunctival injection', 'C', FALSE, FALSE),
('Azelastine', 'Azelastine', ARRAY['Optivar'], 'Antihistamine', 'eye drops', ARRAY['0.05%'], 'ocular', 'None', 'Bitter taste', 'C', TRUE, FALSE),

-- Oral Antibiotics (Post-Surgery)
('Amoxicillin', 'Amoxicillin', ARRAY['Amoxil'], 'Antibiotic', 'tablet', ARRAY['250mg', '500mg'], 'oral', 'Penicillin allergy', 'Diarrhea, rash', 'B', TRUE, FALSE),
('Doxycycline', 'Doxycycline', ARRAY['Vibramycin'], 'Antibiotic', 'tablet', ARRAY['100mg'], 'oral', 'Pregnancy, children <8', 'Photosensitivity, GI upset', 'D', TRUE, FALSE),
('Azithromycin', 'Azithromycin', ARRAY['Zithromax'], 'Antibiotic', 'tablet', ARRAY['250mg', '500mg'], 'oral', 'Macrolide allergy', 'GI upset, QT prolongation', 'B', TRUE, FALSE)

ON CONFLICT (name) DO NOTHING;

-- =============================================
-- SEED DATA: Common Drug Interactions
-- =============================================

INSERT INTO drug_interaction (drug1_name, drug2_name, interaction_type, severity, description, clinical_effects, mechanism, management, reference_sources)
VALUES
-- Glaucoma medication interactions
('Timolol', 'Verapamil', 'major', 'high', 'Beta-blocker and calcium channel blocker interaction', 'Increased risk of heart block, bradycardia, hypotension', 'Additive cardiac depressant effects', 'Monitor cardiac function. Consider alternative glaucoma therapy.', 'American Academy of Ophthalmology 2024'),
('Timolol', 'Diltiazem', 'major', 'high', 'Beta-blocker and calcium channel blocker interaction', 'Increased risk of bradycardia and heart failure', 'Additive negative chronotropic effects', 'Monitor pulse and BP. Use with caution.', 'FDA Drug Interactions Database'),
('Brimonidine', 'Tricyclic Antidepressants', 'moderate', 'medium', 'Alpha-agonist and TCA interaction', 'Reduced IOP-lowering effect of brimonidine', 'TCAs block alpha-2 receptors', 'Monitor IOP closely. May need dose adjustment.', 'Clinical Pharmacology 2024'),
('Acetazolamide', 'Aspirin', 'moderate', 'medium', 'Carbonic anhydrase inhibitor and salicylate interaction', 'Increased risk of metabolic acidosis', 'Both can cause metabolic acidosis', 'Monitor acid-base status. Reduce acetazolamide dose if needed.', 'Pharmacotherapy Journal 2023'),

-- Steroid interactions
('Prednisolone Acetate', 'NSAIDs', 'moderate', 'medium', 'Steroid and NSAID combination', 'Increased risk of corneal healing problems', 'Additive anti-inflammatory effects delay healing', 'Use together cautiously post-surgery. Monitor healing.', 'Cornea Journal 2024'),
('Dexamethasone', 'Ketoconazole', 'major', 'high', 'Steroid metabolism inhibition', 'Increased steroid levels, more side effects', 'CYP3A4 inhibition by ketoconazole', 'Avoid combination. Monitor for increased IOP.', 'Drug Metabolism Reviews 2023'),

-- Anti-VEGF interactions
('Bevacizumab', 'Anticoagulants', 'moderate', 'medium', 'Anti-VEGF and blood thinner interaction', 'Increased bleeding risk during injection', 'Anti-VEGF affects vascular integrity', 'Hold anticoagulants if possible before injection. Monitor carefully.', 'Retina 2024'),
('Ranibizumab', 'Warfarin', 'moderate', 'medium', 'Anti-VEGF and anticoagulant interaction', 'Increased intraocular bleeding risk', 'Both affect coagulation pathways', 'Monitor INR. Consider risks vs benefits.', 'JAMA Ophthalmology 2023'),

-- Mydriatic interactions
('Phenylephrine', 'MAO Inhibitors', 'major', 'high', 'Sympathomimetic and MAO inhibitor interaction', 'Severe hypertension, hypertensive crisis', 'MAOIs prevent phenylephrine breakdown', 'Contraindicated. Do not use phenylephrine if patient on MAOIs.', 'FDA Safety Alert 2022'),
('Atropine', 'Anticholinergics', 'moderate', 'medium', 'Additive anticholinergic effects', 'Increased systemic anticholinergic symptoms', 'Additive parasympathetic blockade', 'Use lower atropine dose. Monitor for confusion, dry mouth.', 'Clinical Toxicology 2024'),

-- Antibiotic interactions
('Ciprofloxacin', 'Theophylline', 'major', 'high', 'Fluoroquinolone and theophylline interaction', 'Increased theophylline toxicity', 'Ciprofloxacin inhibits theophylline metabolism', 'Monitor theophylline levels. Reduce dose by 50%.', 'Antimicrobial Agents Chemother 2023'),
('Moxifloxacin', 'QT-prolonging drugs', 'major', 'high', 'Additive QT prolongation', 'Increased risk of arrhythmias', 'Both prolong cardiac repolarization', 'Avoid combination. Get baseline ECG if must use together.', 'Cardiology Journal 2024'),

-- Oral antibiotic interactions
('Doxycycline', 'Antacids', 'moderate', 'medium', 'Tetracycline and metal cation interaction', 'Reduced doxycycline absorption', 'Chelation with calcium, magnesium, aluminum', 'Separate doses by 2-3 hours. Take doxycycline on empty stomach.', 'Pharmacokinetics Review 2023'),
('Azithromycin', 'Digoxin', 'moderate', 'medium', 'Macrolide and digoxin interaction', 'Increased digoxin levels', 'Azithromycin alters gut flora that metabolize digoxin', 'Monitor digoxin levels. Watch for toxicity signs.', 'Clinical Pharmacokinetics 2024')

ON CONFLICT (drug1_name, drug2_name) DO NOTHING;

-- =============================================
-- PERMISSIONS for Prescription Module
-- =============================================

INSERT INTO permission (id, code, name, description, module, resource, action, scope, is_system, is_active)
VALUES
    (gen_random_uuid(), 'prescription.create', 'Create Prescriptions', 'Create new prescriptions for patients', 'Prescriptions', 'prescription', 'create', 'tenant', TRUE, TRUE),
    (gen_random_uuid(), 'prescription.read', 'View Prescriptions', 'View prescription details', 'Prescriptions', 'prescription', 'read', 'tenant', TRUE, TRUE),
    (gen_random_uuid(), 'prescription.update', 'Update Prescriptions', 'Modify existing prescriptions', 'Prescriptions', 'prescription', 'update', 'tenant', TRUE, TRUE),
    (gen_random_uuid(), 'prescription.delete', 'Delete Prescriptions', 'Cancel or delete prescriptions', 'Prescriptions', 'prescription', 'delete', 'tenant', TRUE, TRUE),
    (gen_random_uuid(), 'prescription.print', 'Print Prescriptions', 'Print prescription documents', 'Prescriptions', 'prescription', 'print', 'tenant', TRUE, TRUE),
    (gen_random_uuid(), 'prescription.dispense', 'Dispense Medications', 'Mark prescriptions as dispensed', 'Prescriptions', 'prescription', 'dispense', 'tenant', TRUE, TRUE),
    (gen_random_uuid(), 'medication.search', 'Search Medications', 'Search medication database', 'Prescriptions', 'medication_master', 'read', 'global', TRUE, TRUE),
    (gen_random_uuid(), 'druginteraction.check', 'Check Drug Interactions', 'Check for drug-drug interactions', 'Prescriptions', 'drug_interaction', 'read', 'global', TRUE, TRUE),
    (gen_random_uuid(), 'medication.admin', 'Administer Medication Database', 'Manage medication master data', 'Prescriptions', 'medication_master', 'admin', 'global', TRUE, TRUE)
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

SELECT 'Phase 3 Prescriptions tables created successfully!' as result;
