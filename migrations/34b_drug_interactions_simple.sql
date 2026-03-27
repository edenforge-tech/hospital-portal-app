-- Quick drug interaction table creation (simplified)
CREATE TABLE IF NOT EXISTS drug_interaction (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medication_a_name VARCHAR(255) NOT NULL,
    medication_b_name VARCHAR(255) NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('Critical', 'Serious', 'Moderate', 'Minor')),
    description TEXT NOT NULL,
    management TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed critical interactions (simplified)
INSERT INTO drug_interaction (medication_a_name, medication_b_name, severity, description, management) VALUES
('Timolol', 'Asthma', 'Critical', 'Beta-blockers cause bronchospasm', 'CONTRAINDICATED - use Latanoprost instead'),
('Timolol', 'Heart Block', 'Critical', 'Worsens cardiac conduction', 'CONTRAINDICATED - use alternative'),
('Prednisolone', 'Herpes Keratitis', 'Critical', 'Can cause corneal perforation', 'CONTRAINDICATED - treat with antiviral first'),
('Latanoprost', 'Pregnancy', 'Serious', 'May induce labor', 'CONTRAINDICATED in pregnancy'),
('Tropicamide', 'Narrow Angles', 'Critical', 'Precipitates angle-closure', 'Check angles first'),
('Phenylephrine', 'Hypertension', 'Critical', 'Hypertensive crisis risk', 'Use 2.5% only, monitor BP'),
('Dorzolamide', 'Sulfa Allergy', 'Serious', 'Cross-reactivity possible', 'Use beta-blocker instead'),
('Acetazolamide', 'Sulfa Allergy', 'Critical', 'Stevens-Johnson syndrome risk', 'CONTRAINDICATED'),
('Ketorolac', 'Warfarin', 'Serious', 'Increased bleeding risk', 'Use with extreme caution'),
('Warfarin', 'Eye Surgery', 'Serious', 'Suprachoroidal hemorrhage risk', 'Consider holding if INR >3');

SELECT 'Drug interaction table created with ' || COUNT(*) || ' interactions' AS status 
FROM drug_interaction;
