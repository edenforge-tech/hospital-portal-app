-- =============================================
-- Migration 52: Master Data Seed Values
-- Created: April 22, 2026
-- Purpose: Default values for all 53 entity types
--          System-locked values cannot be deleted by tenant admins
-- NOTE: This seeds only for the FIRST existing tenant.
--       New tenants get defaults via MasterDataService.SeedDefaultsForTenantAsync()
-- =============================================

DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    -- Get the primary tenant (run per tenant in production via API)
    SELECT id INTO v_tenant_id FROM public.tenant LIMIT 1;
    IF v_tenant_id IS NULL THEN
        RAISE NOTICE 'No tenant found - skipping master data seed';
        RETURN;
    END IF;

    -- Set RLS context
    PERFORM set_config('app.current_tenant_id', v_tenant_id::text, false);

    -- =============================================
    -- GROUP 1: Patient Setup
    -- =============================================

    -- patient.title
    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'patient_setup', 'patient.title', 'MR',   'Mr.',     1),
        (v_tenant_id, 'patient_setup', 'patient.title', 'MRS',  'Mrs.',    2),
        (v_tenant_id, 'patient_setup', 'patient.title', 'MS',   'Ms.',     3),
        (v_tenant_id, 'patient_setup', 'patient.title', 'DR',   'Dr.',     4),
        (v_tenant_id, 'patient_setup', 'patient.title', 'PROF', 'Prof.',   5),
        (v_tenant_id, 'patient_setup', 'patient.title', 'BABY', 'Baby',    6),
        (v_tenant_id, 'patient_setup', 'patient.title', 'MASTER','Master', 7)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    -- patient.blood_group (system-locked - biological constants)
    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, is_system_locked, sort_order) VALUES
        (v_tenant_id, 'patient_setup', 'patient.blood_group', 'A_POS',  'A+',  true, 1),
        (v_tenant_id, 'patient_setup', 'patient.blood_group', 'A_NEG',  'A-',  true, 2),
        (v_tenant_id, 'patient_setup', 'patient.blood_group', 'B_POS',  'B+',  true, 3),
        (v_tenant_id, 'patient_setup', 'patient.blood_group', 'B_NEG',  'B-',  true, 4),
        (v_tenant_id, 'patient_setup', 'patient.blood_group', 'AB_POS', 'AB+', true, 5),
        (v_tenant_id, 'patient_setup', 'patient.blood_group', 'AB_NEG', 'AB-', true, 6),
        (v_tenant_id, 'patient_setup', 'patient.blood_group', 'O_POS',  'O+',  true, 7),
        (v_tenant_id, 'patient_setup', 'patient.blood_group', 'O_NEG',  'O-',  true, 8),
        (v_tenant_id, 'patient_setup', 'patient.blood_group', 'UNKNOWN','Unknown', true, 9)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    -- patient.patient_type
    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'patient_setup', 'patient.patient_type', 'CASH',       'Cash',               1),
        (v_tenant_id, 'patient_setup', 'patient.patient_type', 'INSURANCE',  'Insurance',          2),
        (v_tenant_id, 'patient_setup', 'patient.patient_type', 'COPAY',      'Co-Pay',             3),
        (v_tenant_id, 'patient_setup', 'patient.patient_type', 'ESH',        'ESH',                4),
        (v_tenant_id, 'patient_setup', 'patient.patient_type', 'CGHS',       'CGHS',               5),
        (v_tenant_id, 'patient_setup', 'patient.patient_type', 'AROGYASHREE','Arogyashree',        6),
        (v_tenant_id, 'patient_setup', 'patient.patient_type', 'SGHS',       'SGHS',               7),
        (v_tenant_id, 'patient_setup', 'patient.patient_type', 'CAMP',       'Camp',               8),
        (v_tenant_id, 'patient_setup', 'patient.patient_type', 'RAILWAY',    'Railway',            9),
        (v_tenant_id, 'patient_setup', 'patient.patient_type', 'FREE',       'Free / Charity',     10),
        (v_tenant_id, 'patient_setup', 'patient.patient_type', 'TPA',        'TPA',                11)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    -- patient.gender (system-locked)
    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, is_system_locked, sort_order) VALUES
        (v_tenant_id, 'patient_setup', 'patient.gender', 'MALE',   'Male',   true, 1),
        (v_tenant_id, 'patient_setup', 'patient.gender', 'FEMALE', 'Female', true, 2),
        (v_tenant_id, 'patient_setup', 'patient.gender', 'OTHER',  'Other',  true, 3)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    -- patient.marital_status
    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'patient_setup', 'patient.marital_status', 'SINGLE',   'Single',    1),
        (v_tenant_id, 'patient_setup', 'patient.marital_status', 'MARRIED',  'Married',   2),
        (v_tenant_id, 'patient_setup', 'patient.marital_status', 'DIVORCED', 'Divorced',  3),
        (v_tenant_id, 'patient_setup', 'patient.marital_status', 'WIDOWED',  'Widowed',   4),
        (v_tenant_id, 'patient_setup', 'patient.marital_status', 'SEPARATED','Separated', 5)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    -- patient.religion
    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'patient_setup', 'patient.religion', 'HINDU',     'Hindu',      1),
        (v_tenant_id, 'patient_setup', 'patient.religion', 'MUSLIM',    'Muslim',     2),
        (v_tenant_id, 'patient_setup', 'patient.religion', 'CHRISTIAN', 'Christian',  3),
        (v_tenant_id, 'patient_setup', 'patient.religion', 'SIKH',      'Sikh',       4),
        (v_tenant_id, 'patient_setup', 'patient.religion', 'BUDDHIST',  'Buddhist',   5),
        (v_tenant_id, 'patient_setup', 'patient.religion', 'JAIN',      'Jain',       6),
        (v_tenant_id, 'patient_setup', 'patient.religion', 'OTHER',     'Other',      7)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    -- patient.id_proof_type
    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'patient_setup', 'patient.id_proof_type', 'AADHAAR',    'Aadhaar Card',      1),
        (v_tenant_id, 'patient_setup', 'patient.id_proof_type', 'PAN',        'PAN Card',          2),
        (v_tenant_id, 'patient_setup', 'patient.id_proof_type', 'PASSPORT',   'Passport',          3),
        (v_tenant_id, 'patient_setup', 'patient.id_proof_type', 'VOTER_ID',   'Voter ID',          4),
        (v_tenant_id, 'patient_setup', 'patient.id_proof_type', 'DL',         'Driving License',   5),
        (v_tenant_id, 'patient_setup', 'patient.id_proof_type', 'EMPLOYEE_ID','Employee ID',       6),
        (v_tenant_id, 'patient_setup', 'patient.id_proof_type', 'CGHS_CARD',  'CGHS Card',         7)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    -- patient.relationship
    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'patient_setup', 'patient.relationship', 'SELF',    'Self',    1),
        (v_tenant_id, 'patient_setup', 'patient.relationship', 'SPOUSE',  'Spouse',  2),
        (v_tenant_id, 'patient_setup', 'patient.relationship', 'CHILD',   'Child',   3),
        (v_tenant_id, 'patient_setup', 'patient.relationship', 'PARENT',  'Parent',  4),
        (v_tenant_id, 'patient_setup', 'patient.relationship', 'SIBLING', 'Sibling', 5),
        (v_tenant_id, 'patient_setup', 'patient.relationship', 'GUARDIAN','Guardian',6),
        (v_tenant_id, 'patient_setup', 'patient.relationship', 'OTHER',   'Other',   7)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    -- =============================================
    -- GROUP 2: Clinical
    -- =============================================

    -- clinical.surgery_type
    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, metadata, sort_order) VALUES
        (v_tenant_id, 'clinical', 'clinical.surgery_type', 'PHACO',       'Phacoemulsification (Phaco)',   '{"category":"Cataract"}', 1),
        (v_tenant_id, 'clinical', 'clinical.surgery_type', 'SICS',        'SICS',                          '{"category":"Cataract"}', 2),
        (v_tenant_id, 'clinical', 'clinical.surgery_type', 'ECCE',        'ECCE',                          '{"category":"Cataract"}', 3),
        (v_tenant_id, 'clinical', 'clinical.surgery_type', 'TRAB',        'Trabeculectomy',                '{"category":"Glaucoma"}', 4),
        (v_tenant_id, 'clinical', 'clinical.surgery_type', 'AHMED_VALVE', 'Ahmed Valve Implant',           '{"category":"Glaucoma"}', 5),
        (v_tenant_id, 'clinical', 'clinical.surgery_type', 'VITRECTOMY',  'Vitrectomy',                    '{"category":"Retina"}',   6),
        (v_tenant_id, 'clinical', 'clinical.surgery_type', 'SCLERAL_BUCKLE','Scleral Buckling',            '{"category":"Retina"}',   7),
        (v_tenant_id, 'clinical', 'clinical.surgery_type', 'PKP',         'Penetrating Keratoplasty (PKP)','{"category":"Cornea"}',   8),
        (v_tenant_id, 'clinical', 'clinical.surgery_type', 'DSEK',        'DSEK',                          '{"category":"Cornea"}',   9),
        (v_tenant_id, 'clinical', 'clinical.surgery_type', 'LASIK',       'LASIK',                         '{"category":"Refractive"}',10),
        (v_tenant_id, 'clinical', 'clinical.surgery_type', 'PRK',         'PRK',                           '{"category":"Refractive"}',11),
        (v_tenant_id, 'clinical', 'clinical.surgery_type', 'PTOSIS',      'Ptosis Correction',             '{"category":"Oculoplasty"}',12),
        (v_tenant_id, 'clinical', 'clinical.surgery_type', 'DCR',         'DCR (Dacryocystorhinostomy)',   '{"category":"Oculoplasty"}',13),
        (v_tenant_id, 'clinical', 'clinical.surgery_type', 'SQUINT',      'Squint Correction',             '{"category":"Strabismus"}',14),
        (v_tenant_id, 'clinical', 'clinical.surgery_type', 'CHALAZION',   'Chalazion Removal',             '{"category":"General"}',  15)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    -- clinical.anesthesia_type
    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, metadata, sort_order) VALUES
        (v_tenant_id, 'clinical', 'clinical.anesthesia_type', 'TOPICAL',   'Topical',             '{"category":"Topical"}',  1),
        (v_tenant_id, 'clinical', 'clinical.anesthesia_type', 'LOCAL',     'Local Infiltration',  '{"category":"Local"}',    2),
        (v_tenant_id, 'clinical', 'clinical.anesthesia_type', 'PERIBULBAR','Peribulbar Block',    '{"category":"Regional"}', 3),
        (v_tenant_id, 'clinical', 'clinical.anesthesia_type', 'RETROBULBAR','Retrobulbar Block',  '{"category":"Regional"}', 4),
        (v_tenant_id, 'clinical', 'clinical.anesthesia_type', 'GENERAL',   'General Anesthesia',  '{"category":"General"}',  5),
        (v_tenant_id, 'clinical', 'clinical.anesthesia_type', 'SEDATION',  'Conscious Sedation',  '{"category":"Combined"}', 6)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    -- clinical.surgical_procedure (intra-operative)
    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'clinical', 'clinical.surgical_procedure', 'PHACO_FOLDABLE',  'Phaco + Foldable IOL',      1),
        (v_tenant_id, 'clinical', 'clinical.surgical_procedure', 'PHACO_RIGID',     'Phaco + Rigid IOL',         2),
        (v_tenant_id, 'clinical', 'clinical.surgical_procedure', 'SICS_IOL',        'SICS + IOL',                3),
        (v_tenant_id, 'clinical', 'clinical.surgical_procedure', 'TRABECULECTOMY',  'Trabeculectomy with MMC',   4),
        (v_tenant_id, 'clinical', 'clinical.surgical_procedure', 'VITRECTOMY_23G',  '23G Vitrectomy',            5),
        (v_tenant_id, 'clinical', 'clinical.surgical_procedure', 'VITRECTOMY_25G',  '25G Vitrectomy',            6),
        (v_tenant_id, 'clinical', 'clinical.surgical_procedure', 'LASER_ENDO',      'Endolaser Photocoagulation',7),
        (v_tenant_id, 'clinical', 'clinical.surgical_procedure', 'SF6_GAS',         'SF6 Gas Tamponade',         8),
        (v_tenant_id, 'clinical', 'clinical.surgical_procedure', 'C3F8_GAS',        'C3F8 Gas Tamponade',        9),
        (v_tenant_id, 'clinical', 'clinical.surgical_procedure', 'SILICON_OIL',     'Silicon Oil Injection',     10)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    -- clinical.intraop_finding
    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'clinical', 'clinical.intraop_finding', 'POSTERIOR_CAP_RUPTURE', 'Posterior Capsule Rupture', 1),
        (v_tenant_id, 'clinical', 'clinical.intraop_finding', 'VITREOUS_LOSS',         'Vitreous Loss',             2),
        (v_tenant_id, 'clinical', 'clinical.intraop_finding', 'DROPPED_NUCLEUS',       'Dropped Nucleus',           3),
        (v_tenant_id, 'clinical', 'clinical.intraop_finding', 'IRIS_PROLAPSE',         'Iris Prolapse',             4),
        (v_tenant_id, 'clinical', 'clinical.intraop_finding', 'CORNEAL_EDEMA',         'Corneal Edema',             5),
        (v_tenant_id, 'clinical', 'clinical.intraop_finding', 'DENSE_NUCLEUS',         'Dense Nucleus',             6),
        (v_tenant_id, 'clinical', 'clinical.intraop_finding', 'ZONULAR_WEAKNESS',      'Zonular Weakness',          7),
        (v_tenant_id, 'clinical', 'clinical.intraop_finding', 'SMALL_PUPIL',           'Small Pupil',               8),
        (v_tenant_id, 'clinical', 'clinical.intraop_finding', 'BLEEDING',              'Intra-op Bleeding',         9),
        (v_tenant_id, 'clinical', 'clinical.intraop_finding', 'NORMAL',                'Normal Procedure',          10)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    -- clinical.complication
    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'clinical', 'clinical.complication', 'NONE',              'None',                         1),
        (v_tenant_id, 'clinical', 'clinical.complication', 'ENDOPHTHALMITIS',   'Endophthalmitis',              2),
        (v_tenant_id, 'clinical', 'clinical.complication', 'RETINAL_DETACH',    'Retinal Detachment',           3),
        (v_tenant_id, 'clinical', 'clinical.complication', 'ELEVATED_IOP',      'Elevated IOP',                 4),
        (v_tenant_id, 'clinical', 'clinical.complication', 'WOUND_LEAK',        'Wound Leak',                   5),
        (v_tenant_id, 'clinical', 'clinical.complication', 'HYPHEMA',           'Hyphema',                      6),
        (v_tenant_id, 'clinical', 'clinical.complication', 'IOL_DISLOCATION',   'IOL Dislocation',              7),
        (v_tenant_id, 'clinical', 'clinical.complication', 'UVEITIS',           'Post-op Uveitis',              8),
        (v_tenant_id, 'clinical', 'clinical.complication', 'CME',               'Cystoid Macular Edema (CME)',  9),
        (v_tenant_id, 'clinical', 'clinical.complication', 'REFRACTIVE_ERROR',  'Significant Refractive Error', 10)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    -- clinical.eye_notation (system-locked)
    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, is_system_locked, sort_order) VALUES
        (v_tenant_id, 'clinical', 'clinical.eye_notation', 'OD',  'OD (Right Eye)',  true, 1),
        (v_tenant_id, 'clinical', 'clinical.eye_notation', 'OS',  'OS (Left Eye)',   true, 2),
        (v_tenant_id, 'clinical', 'clinical.eye_notation', 'OU',  'OU (Both Eyes)',  true, 3),
        (v_tenant_id, 'clinical', 'clinical.eye_notation', 'OD_OS','OD/OS',          true, 4)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    -- clinical.scan_type
    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'clinical', 'clinical.scan_type', 'OCT',         'OCT (Optical Coherence Tomography)', 1),
        (v_tenant_id, 'clinical', 'clinical.scan_type', 'FUNDUS',      'Fundus Photography',                 2),
        (v_tenant_id, 'clinical', 'clinical.scan_type', 'FLUORESCEIN', 'Fluorescein Angiography',            3),
        (v_tenant_id, 'clinical', 'clinical.scan_type', 'BIOMETRY',    'Biometry (IOL Master)',               4),
        (v_tenant_id, 'clinical', 'clinical.scan_type', 'TOPOGRAPHY',  'Corneal Topography',                 5),
        (v_tenant_id, 'clinical', 'clinical.scan_type', 'ULTRASOUND',  'B-Scan Ultrasound',                  6),
        (v_tenant_id, 'clinical', 'clinical.scan_type', 'VF',          'Visual Field Test',                  7),
        (v_tenant_id, 'clinical', 'clinical.scan_type', 'ERG',         'Electroretinography (ERG)',           8),
        (v_tenant_id, 'clinical', 'clinical.scan_type', 'VEP',         'Visual Evoked Potential (VEP)',       9)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    -- =============================================
    -- GROUP 3: Appointments
    -- =============================================

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'appointments', 'appointment.type', 'OPD',        'OPD Consultation', 1),
        (v_tenant_id, 'appointments', 'appointment.type', 'REVIEW',     'Review',           2),
        (v_tenant_id, 'appointments', 'appointment.type', 'SURGERY',    'Surgery',          3),
        (v_tenant_id, 'appointments', 'appointment.type', 'CAMP',       'Camp',             4),
        (v_tenant_id, 'appointments', 'appointment.type', 'TELECONSULT','Tele-Consultation', 5)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'appointments', 'appointment.consultation_type', 'FIRST_VISIT',  'First Visit',    1),
        (v_tenant_id, 'appointments', 'appointment.consultation_type', 'FOLLOW_UP',    'Follow-Up',      2),
        (v_tenant_id, 'appointments', 'appointment.consultation_type', 'POST_OP',      'Post-Op',        3),
        (v_tenant_id, 'appointments', 'appointment.consultation_type', 'EMERGENCY',    'Emergency',      4),
        (v_tenant_id, 'appointments', 'appointment.consultation_type', 'SECOND_OPINION','Second Opinion', 5)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'appointments', 'appointment.priority', 'ROUTINE',   'Routine',   1),
        (v_tenant_id, 'appointments', 'appointment.priority', 'URGENT',    'Urgent',    2),
        (v_tenant_id, 'appointments', 'appointment.priority', 'EMERGENCY', 'Emergency', 3)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'appointments', 'appointment.cancel_reason', 'PATIENT_REQUEST',  'Patient Request',      1),
        (v_tenant_id, 'appointments', 'appointment.cancel_reason', 'DOCTOR_UNAVAIL',   'Doctor Unavailable',   2),
        (v_tenant_id, 'appointments', 'appointment.cancel_reason', 'NO_SHOW',          'No Show',              3),
        (v_tenant_id, 'appointments', 'appointment.cancel_reason', 'DUPLICATE',        'Duplicate Appointment',4),
        (v_tenant_id, 'appointments', 'appointment.cancel_reason', 'RESCHEDULED',      'Rescheduled',          5),
        (v_tenant_id, 'appointments', 'appointment.cancel_reason', 'OTHER',            'Other',                6)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    -- =============================================
    -- GROUP 4: Counsellor
    -- =============================================

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'counsellor', 'counsellor.session_type', 'INITIAL',   'Initial Counseling',   1),
        (v_tenant_id, 'counsellor', 'counsellor.session_type', 'FOLLOW_UP', 'Follow-Up',            2),
        (v_tenant_id, 'counsellor', 'counsellor.session_type', 'PRE_OP',    'Pre-Op Counseling',    3),
        (v_tenant_id, 'counsellor', 'counsellor.session_type', 'POST_OP',   'Post-Op Counseling',   4),
        (v_tenant_id, 'counsellor', 'counsellor.session_type', 'PACKAGE',   'Package Finalization',  5)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'counsellor', 'counsellor.callback_type', 'SCHEDULED',   'Scheduled Callback',   1),
        (v_tenant_id, 'counsellor', 'counsellor.callback_type', 'REMINDER',    'Reminder Call',        2),
        (v_tenant_id, 'counsellor', 'counsellor.callback_type', 'FOLLOW_UP',   'Follow-Up Call',       3),
        (v_tenant_id, 'counsellor', 'counsellor.callback_type', 'NO_SHOW',     'No-Show Follow-Up',    4),
        (v_tenant_id, 'counsellor', 'counsellor.callback_type', 'URGENT',      'Urgent Callback',      5)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'counsellor', 'counsellor.comm_channel', 'PHONE',    'Phone Call',   1),
        (v_tenant_id, 'counsellor', 'counsellor.comm_channel', 'SMS',      'SMS',          2),
        (v_tenant_id, 'counsellor', 'counsellor.comm_channel', 'WHATSAPP', 'WhatsApp',     3),
        (v_tenant_id, 'counsellor', 'counsellor.comm_channel', 'EMAIL',    'Email',        4),
        (v_tenant_id, 'counsellor', 'counsellor.comm_channel', 'IN_PERSON','In Person',    5)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    -- =============================================
    -- GROUP 5: Billing & Finance
    -- =============================================

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'billing_finance', 'billing.payment_mode', 'CASH',       'Cash',           1),
        (v_tenant_id, 'billing_finance', 'billing.payment_mode', 'CARD',       'Card (Debit/Credit)',2),
        (v_tenant_id, 'billing_finance', 'billing.payment_mode', 'UPI',        'UPI',            3),
        (v_tenant_id, 'billing_finance', 'billing.payment_mode', 'NEFT',       'NEFT/RTGS',      4),
        (v_tenant_id, 'billing_finance', 'billing.payment_mode', 'CHEQUE',     'Cheque',         5),
        (v_tenant_id, 'billing_finance', 'billing.payment_mode', 'INSURANCE',  'Insurance',      6),
        (v_tenant_id, 'billing_finance', 'billing.payment_mode', 'DD',         'Demand Draft',   7),
        (v_tenant_id, 'billing_finance', 'billing.payment_mode', 'ONLINE',     'Online Transfer', 8)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'billing_finance', 'billing.bill_item_type', 'CONSULTATION', 'Consultation Fee',  1),
        (v_tenant_id, 'billing_finance', 'billing.bill_item_type', 'PROCEDURE',    'Procedure',         2),
        (v_tenant_id, 'billing_finance', 'billing.bill_item_type', 'MEDICATION',   'Medication',        3),
        (v_tenant_id, 'billing_finance', 'billing.bill_item_type', 'DIAGNOSTIC',   'Diagnostic Test',   4),
        (v_tenant_id, 'billing_finance', 'billing.bill_item_type', 'ROOM_CHARGE',  'Room Charge',       5),
        (v_tenant_id, 'billing_finance', 'billing.bill_item_type', 'NURSING',      'Nursing Charge',    6),
        (v_tenant_id, 'billing_finance', 'billing.bill_item_type', 'SURGICAL',     'Surgical Charge',   7),
        (v_tenant_id, 'billing_finance', 'billing.bill_item_type', 'ANESTHESIA',   'Anesthesia Charge', 8),
        (v_tenant_id, 'billing_finance', 'billing.bill_item_type', 'MISC',         'Miscellaneous',     9)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'billing_finance', 'billing.transaction_type', 'PAYMENT',  'Payment',    1),
        (v_tenant_id, 'billing_finance', 'billing.transaction_type', 'ADVANCE',  'Advance',    2),
        (v_tenant_id, 'billing_finance', 'billing.transaction_type', 'REFUND',   'Refund',     3),
        (v_tenant_id, 'billing_finance', 'billing.transaction_type', 'DISCOUNT', 'Discount',   4),
        (v_tenant_id, 'billing_finance', 'billing.transaction_type', 'WRITE_OFF','Write-Off',  5)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    -- =============================================
    -- GROUP 6: Insurance
    -- =============================================

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, metadata, sort_order) VALUES
        (v_tenant_id, 'insurance', 'insurance.type', 'MEDICLAIM',  'Mediclaim',    '{"isCashless":false}', 1),
        (v_tenant_id, 'insurance', 'insurance.type', 'CASHLESS',   'Cashless',     '{"isCashless":true}',  2),
        (v_tenant_id, 'insurance', 'insurance.type', 'REIMBURSEMENT','Reimbursement','{"isCashless":false}',3),
        (v_tenant_id, 'insurance', 'insurance.type', 'COPAY',      'Co-Payment',   '{"isCashless":true}',  4),
        (v_tenant_id, 'insurance', 'insurance.type', 'GOVT',       'Government Scheme','{"isCashless":true}',5)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    -- =============================================
    -- GROUP 7: Inventory
    -- =============================================

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'inventory', 'inventory.item_type', 'MEDICINE',     'Medicine',          1),
        (v_tenant_id, 'inventory', 'inventory.item_type', 'SURGICAL',     'Surgical Supply',   2),
        (v_tenant_id, 'inventory', 'inventory.item_type', 'EQUIPMENT',    'Equipment',         3),
        (v_tenant_id, 'inventory', 'inventory.item_type', 'CONSUMABLE',   'Consumable',        4),
        (v_tenant_id, 'inventory', 'inventory.item_type', 'IMPLANT',      'Implant',           5),
        (v_tenant_id, 'inventory', 'inventory.item_type', 'STATIONERY',   'Stationery',        6),
        (v_tenant_id, 'inventory', 'inventory.item_type', 'LINEN',        'Linen',             7)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'inventory', 'inventory.uom', 'NOS',   'Nos (Numbers)',  1),
        (v_tenant_id, 'inventory', 'inventory.uom', 'BOX',   'Box',           2),
        (v_tenant_id, 'inventory', 'inventory.uom', 'STRIP', 'Strip',         3),
        (v_tenant_id, 'inventory', 'inventory.uom', 'VIAL',  'Vial',          4),
        (v_tenant_id, 'inventory', 'inventory.uom', 'AMPOULE','Ampoule',      5),
        (v_tenant_id, 'inventory', 'inventory.uom', 'ML',    'ml',            6),
        (v_tenant_id, 'inventory', 'inventory.uom', 'L',     'Litre',         7),
        (v_tenant_id, 'inventory', 'inventory.uom', 'MG',    'mg',            8),
        (v_tenant_id, 'inventory', 'inventory.uom', 'GM',    'gm',            9),
        (v_tenant_id, 'inventory', 'inventory.uom', 'KG',    'kg',            10),
        (v_tenant_id, 'inventory', 'inventory.uom', 'PAIR',  'Pair',          11),
        (v_tenant_id, 'inventory', 'inventory.uom', 'SET',   'Set',           12)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, metadata, sort_order) VALUES
        (v_tenant_id, 'inventory', 'inventory.gst_rate', 'GST_0',    '0% GST',   '{"rate":0}',   1),
        (v_tenant_id, 'inventory', 'inventory.gst_rate', 'GST_5',    '5% GST',   '{"rate":5}',   2),
        (v_tenant_id, 'inventory', 'inventory.gst_rate', 'GST_12',   '12% GST',  '{"rate":12}',  3),
        (v_tenant_id, 'inventory', 'inventory.gst_rate', 'GST_18',   '18% GST',  '{"rate":18}',  4),
        (v_tenant_id, 'inventory', 'inventory.gst_rate', 'GST_28',   '28% GST',  '{"rate":28}',  5)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, metadata, sort_order) VALUES
        (v_tenant_id, 'inventory', 'inventory.payment_term', 'IMMEDIATE',  'Immediate (0 days)',   '{"days":0}',  1),
        (v_tenant_id, 'inventory', 'inventory.payment_term', 'NET_15',     'Net 15 days',          '{"days":15}', 2),
        (v_tenant_id, 'inventory', 'inventory.payment_term', 'NET_30',     'Net 30 days',          '{"days":30}', 3),
        (v_tenant_id, 'inventory', 'inventory.payment_term', 'NET_45',     'Net 45 days',          '{"days":45}', 4),
        (v_tenant_id, 'inventory', 'inventory.payment_term', 'NET_60',     'Net 60 days',          '{"days":60}', 5),
        (v_tenant_id, 'inventory', 'inventory.payment_term', 'NET_90',     'Net 90 days',          '{"days":90}', 6)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    -- =============================================
    -- GROUP 8: Pharmacy
    -- =============================================

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'pharmacy', 'pharmacy.drug_form', 'TABLET',    'Tablet',         1),
        (v_tenant_id, 'pharmacy', 'pharmacy.drug_form', 'CAPSULE',   'Capsule',        2),
        (v_tenant_id, 'pharmacy', 'pharmacy.drug_form', 'SYRUP',     'Syrup',          3),
        (v_tenant_id, 'pharmacy', 'pharmacy.drug_form', 'DROPS',     'Eye Drops',      4),
        (v_tenant_id, 'pharmacy', 'pharmacy.drug_form', 'OINTMENT',  'Ointment',       5),
        (v_tenant_id, 'pharmacy', 'pharmacy.drug_form', 'INJECTION', 'Injection',      6),
        (v_tenant_id, 'pharmacy', 'pharmacy.drug_form', 'PATCH',     'Patch',          7),
        (v_tenant_id, 'pharmacy', 'pharmacy.drug_form', 'INHALER',   'Inhaler',        8),
        (v_tenant_id, 'pharmacy', 'pharmacy.drug_form', 'GEL',       'Gel',            9),
        (v_tenant_id, 'pharmacy', 'pharmacy.drug_form', 'SUSPENSION','Suspension',     10)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'pharmacy', 'pharmacy.drug_route', 'ORAL',        'Oral (PO)',            1),
        (v_tenant_id, 'pharmacy', 'pharmacy.drug_route', 'TOPICAL_EYE', 'Topical - Eye',        2),
        (v_tenant_id, 'pharmacy', 'pharmacy.drug_route', 'INTRAVITREAL','Intravitreal (IVT)',    3),
        (v_tenant_id, 'pharmacy', 'pharmacy.drug_route', 'IV',          'Intravenous (IV)',      4),
        (v_tenant_id, 'pharmacy', 'pharmacy.drug_route', 'IM',          'Intramuscular (IM)',    5),
        (v_tenant_id, 'pharmacy', 'pharmacy.drug_route', 'SC',          'Subcutaneous (SC)',     6),
        (v_tenant_id, 'pharmacy', 'pharmacy.drug_route', 'SUBCONJ',     'Subconjunctival',       7)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, metadata, sort_order) VALUES
        (v_tenant_id, 'pharmacy', 'pharmacy.dosage_frequency', 'OD',     'Once Daily (OD)',          '{"timesPerDay":1}', 1),
        (v_tenant_id, 'pharmacy', 'pharmacy.dosage_frequency', 'BD',     'Twice Daily (BD)',          '{"timesPerDay":2}', 2),
        (v_tenant_id, 'pharmacy', 'pharmacy.dosage_frequency', 'TDS',    'Three Times Daily (TDS)',   '{"timesPerDay":3}', 3),
        (v_tenant_id, 'pharmacy', 'pharmacy.dosage_frequency', 'QID',    'Four Times Daily (QID)',    '{"timesPerDay":4}', 4),
        (v_tenant_id, 'pharmacy', 'pharmacy.dosage_frequency', 'HS',     'At Bedtime (HS)',           '{"timesPerDay":1}', 5),
        (v_tenant_id, 'pharmacy', 'pharmacy.dosage_frequency', 'SOS',    'As Needed (SOS)',           '{"timesPerDay":0}', 6),
        (v_tenant_id, 'pharmacy', 'pharmacy.dosage_frequency', 'WEEKLY', 'Weekly',                    '{"timesPerDay":0}', 7),
        (v_tenant_id, 'pharmacy', 'pharmacy.dosage_frequency', 'MONTHLY','Monthly',                   '{"timesPerDay":0}', 8)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'pharmacy', 'pharmacy.drug_schedule', 'H',    'Schedule H (Prescription)',  1),
        (v_tenant_id, 'pharmacy', 'pharmacy.drug_schedule', 'H1',   'Schedule H1 (Controlled)',   2),
        (v_tenant_id, 'pharmacy', 'pharmacy.drug_schedule', 'X',    'Schedule X (Narcotic)',       3),
        (v_tenant_id, 'pharmacy', 'pharmacy.drug_schedule', 'OTC',  'OTC (Over the Counter)',     4),
        (v_tenant_id, 'pharmacy', 'pharmacy.drug_schedule', 'G',    'Schedule G',                  5)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    -- =============================================
    -- GROUP 9: Lab & Diagnostics
    -- =============================================

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'lab_diagnostics', 'lab.specimen_type', 'BLOOD',   'Blood',         1),
        (v_tenant_id, 'lab_diagnostics', 'lab.specimen_type', 'URINE',   'Urine',         2),
        (v_tenant_id, 'lab_diagnostics', 'lab.specimen_type', 'TISSUE',  'Tissue Biopsy', 3),
        (v_tenant_id, 'lab_diagnostics', 'lab.specimen_type', 'FLUID',   'Aqueous Fluid', 4),
        (v_tenant_id, 'lab_diagnostics', 'lab.specimen_type', 'SWAB',    'Conjunctival Swab',5),
        (v_tenant_id, 'lab_diagnostics', 'lab.specimen_type', 'TEARS',   'Tear Sample',   6)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'lab_diagnostics', 'lab.imaging_modality', 'OCT',       'OCT',                  1),
        (v_tenant_id, 'lab_diagnostics', 'lab.imaging_modality', 'FUNDUS',    'Fundus Camera',        2),
        (v_tenant_id, 'lab_diagnostics', 'lab.imaging_modality', 'FA',        'Fluorescein Angiography',3),
        (v_tenant_id, 'lab_diagnostics', 'lab.imaging_modality', 'BSCAN',     'B-Scan Ultrasound',    4),
        (v_tenant_id, 'lab_diagnostics', 'lab.imaging_modality', 'TOPOGRAPHY','Corneal Topography',   5),
        (v_tenant_id, 'lab_diagnostics', 'lab.imaging_modality', 'PENTACAM',  'Pentacam',             6)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'lab_diagnostics', 'lab.ep_type', 'ERG',  'Electroretinography (ERG)',     1),
        (v_tenant_id, 'lab_diagnostics', 'lab.ep_type', 'VEP',  'Visual Evoked Potential (VEP)', 2),
        (v_tenant_id, 'lab_diagnostics', 'lab.ep_type', 'EOG',  'Electro-oculography (EOG)',     3)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    -- =============================================
    -- GROUP 10: Ward & IP
    -- =============================================

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'ward_ip', 'ward.ward_type', 'GENERAL',      'General Ward',         1),
        (v_tenant_id, 'ward_ip', 'ward.ward_type', 'SEMI_PRIVATE', 'Semi-Private',         2),
        (v_tenant_id, 'ward_ip', 'ward.ward_type', 'PRIVATE',      'Private Room',         3),
        (v_tenant_id, 'ward_ip', 'ward.ward_type', 'ICU',          'ICU',                  4),
        (v_tenant_id, 'ward_ip', 'ward.ward_type', 'DAY_CARE',     'Day Care',             5),
        (v_tenant_id, 'ward_ip', 'ward.ward_type', 'PEDIATRIC',    'Pediatric Ward',       6)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'ward_ip', 'ward.bed_type', 'REGULAR',   'Regular Bed',    1),
        (v_tenant_id, 'ward_ip', 'ward.bed_type', 'OT',        'OT Table',       2),
        (v_tenant_id, 'ward_ip', 'ward.bed_type', 'RECLINER',  'Recliner Chair', 3),
        (v_tenant_id, 'ward_ip', 'ward.bed_type', 'STRETCHER', 'Stretcher',      4)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'ward_ip', 'ward.admission_type', 'ELECTIVE',   'Elective',   1),
        (v_tenant_id, 'ward_ip', 'ward.admission_type', 'EMERGENCY',  'Emergency',  2),
        (v_tenant_id, 'ward_ip', 'ward.admission_type', 'DAY_CARE',   'Day Care',   3),
        (v_tenant_id, 'ward_ip', 'ward.admission_type', 'REFERRAL',   'Referral',   4)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    -- =============================================
    -- GROUP 11: HR & Staff
    -- =============================================

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'hr_staff', 'hr.employment_type', 'PERMANENT',    'Permanent',       1),
        (v_tenant_id, 'hr_staff', 'hr.employment_type', 'CONTRACT',     'Contract',        2),
        (v_tenant_id, 'hr_staff', 'hr.employment_type', 'PART_TIME',    'Part-Time',       3),
        (v_tenant_id, 'hr_staff', 'hr.employment_type', 'CONSULTANT',   'Consultant',      4),
        (v_tenant_id, 'hr_staff', 'hr.employment_type', 'INTERN',       'Intern',          5),
        (v_tenant_id, 'hr_staff', 'hr.employment_type', 'VISITING',     'Visiting Doctor', 6)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'hr_staff', 'hr.leave_type', 'CASUAL',    'Casual Leave',          1),
        (v_tenant_id, 'hr_staff', 'hr.leave_type', 'SICK',      'Sick Leave',            2),
        (v_tenant_id, 'hr_staff', 'hr.leave_type', 'EARNED',    'Earned Leave',          3),
        (v_tenant_id, 'hr_staff', 'hr.leave_type', 'MATERNITY', 'Maternity Leave',       4),
        (v_tenant_id, 'hr_staff', 'hr.leave_type', 'PATERNITY', 'Paternity Leave',       5),
        (v_tenant_id, 'hr_staff', 'hr.leave_type', 'COMP_OFF',  'Compensatory Off',      6),
        (v_tenant_id, 'hr_staff', 'hr.leave_type', 'LWP',       'Leave Without Pay',     7)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'hr_staff', 'hr.shift_type', 'MORNING',   'Morning Shift',     1),
        (v_tenant_id, 'hr_staff', 'hr.shift_type', 'AFTERNOON', 'Afternoon Shift',   2),
        (v_tenant_id, 'hr_staff', 'hr.shift_type', 'NIGHT',     'Night Shift',       3),
        (v_tenant_id, 'hr_staff', 'hr.shift_type', 'GENERAL',   'General Shift',     4),
        (v_tenant_id, 'hr_staff', 'hr.shift_type', 'SPLIT',     'Split Shift',       5)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'hr_staff', 'hr.performance_rating', 'EXCELLENT',   'Excellent (5)',     1),
        (v_tenant_id, 'hr_staff', 'hr.performance_rating', 'GOOD',        'Good (4)',          2),
        (v_tenant_id, 'hr_staff', 'hr.performance_rating', 'SATISFACTORY','Satisfactory (3)',  3),
        (v_tenant_id, 'hr_staff', 'hr.performance_rating', 'NEEDS_IMPROV','Needs Improvement', 4),
        (v_tenant_id, 'hr_staff', 'hr.performance_rating', 'POOR',        'Poor (1)',          5)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    -- =============================================
    -- GROUP 12: System
    -- =============================================

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, sort_order) VALUES
        (v_tenant_id, 'system', 'system.department', 'ADMISSIONS',   'Admissions',        1),
        (v_tenant_id, 'system', 'system.department', 'BILLING',      'Billing',           2),
        (v_tenant_id, 'system', 'system.department', 'LAB',          'Laboratory',        3),
        (v_tenant_id, 'system', 'system.department', 'OT',           'Operation Theatre', 4),
        (v_tenant_id, 'system', 'system.department', 'PHARMACY',     'Pharmacy',          5),
        (v_tenant_id, 'system', 'system.department', 'RADIOLOGY',    'Radiology',         6),
        (v_tenant_id, 'system', 'system.department', 'NURSING',      'Nursing',           7),
        (v_tenant_id, 'system', 'system.department', 'ANESTHESIA',   'Anesthesia',        8),
        (v_tenant_id, 'system', 'system.department', 'COUNSELLING',  'Counselling',       9),
        (v_tenant_id, 'system', 'system.department', 'OPTICAL',      'Optical',           10),
        (v_tenant_id, 'system', 'system.department', 'HR',           'HR / Admin',        11),
        (v_tenant_id, 'system', 'system.department', 'IT',           'IT',                12)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, metadata, sort_order) VALUES
        (v_tenant_id, 'system', 'system.timezone', 'IST',   'India Standard Time (IST)',  '{"offset":"+05:30","tz":"Asia/Kolkata"}',      1),
        (v_tenant_id, 'system', 'system.timezone', 'UTC',   'UTC',                        '{"offset":"+00:00","tz":"UTC"}',               2),
        (v_tenant_id, 'system', 'system.timezone', 'EST',   'Eastern Standard Time (EST)','{"offset":"-05:00","tz":"America/New_York"}',  3),
        (v_tenant_id, 'system', 'system.timezone', 'PST',   'Pacific Standard Time (PST)','{"offset":"-08:00","tz":"America/Los_Angeles"}',4),
        (v_tenant_id, 'system', 'system.timezone', 'GST',   'Gulf Standard Time (GST)',   '{"offset":"+04:00","tz":"Asia/Dubai"}',        5)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, metadata, sort_order) VALUES
        (v_tenant_id, 'system', 'system.currency', 'INR', 'Indian Rupee (₹)', '{"symbol":"₹","iso":"INR"}', 1),
        (v_tenant_id, 'system', 'system.currency', 'USD', 'US Dollar ($)',     '{"symbol":"$","iso":"USD"}', 2),
        (v_tenant_id, 'system', 'system.currency', 'AED', 'UAE Dirham (AED)', '{"symbol":"AED","iso":"AED"}',3)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    INSERT INTO master.master_value (tenant_id, group_key, entity_type, code, label, metadata, sort_order) VALUES
        (v_tenant_id, 'system', 'system.language', 'EN', 'English',    '{"locale":"en"}',    1),
        (v_tenant_id, 'system', 'system.language', 'HI', 'Hindi',      '{"locale":"hi"}',    2),
        (v_tenant_id, 'system', 'system.language', 'TE', 'Telugu',     '{"locale":"te"}',    3),
        (v_tenant_id, 'system', 'system.language', 'TA', 'Tamil',      '{"locale":"ta"}',    4),
        (v_tenant_id, 'system', 'system.language', 'KN', 'Kannada',    '{"locale":"kn"}',    5),
        (v_tenant_id, 'system', 'system.language', 'ML', 'Malayalam',  '{"locale":"ml"}',    6)
    ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

    RAISE NOTICE 'Master data seed complete for tenant: %', v_tenant_id;
END;
$$;
