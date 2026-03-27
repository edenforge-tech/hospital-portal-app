-- =====================================================================
-- Counseling Sessions Seed Data
-- Version: 56
-- Purpose: Populate counseling_sessions with 30 realistic sessions
-- Distribution: Cash (8), Insurance (7), CoPay (4), ESH (3), CGHS (3), Arogyashree (3), SGHS (2)
-- Status: Completed (12), InProgress (6), Scheduled (8), Cancelled (2), NoShow (2)
-- =====================================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_user_id UUID;
    v_branch_id UUID;
    v_patient_ids UUID[];
    v_doctor_ids UUID[];
BEGIN
    -- Get first available tenant
    SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
    
    -- Get first available user for created_by
    SELECT id INTO v_user_id FROM users LIMIT 1;
    
    -- Get first available branch
    SELECT id INTO v_branch_id FROM branch LIMIT 1;
    
    -- Get 30 patient IDs
    SELECT ARRAY_AGG(id) INTO v_patient_ids FROM (SELECT id FROM patient LIMIT 30) p;
    
    -- Get 10 doctor/user IDs for referring doctors
    SELECT ARRAY_AGG(id) INTO v_doctor_ids FROM (SELECT id FROM users LIMIT 10) u;
    
    RAISE NOTICE 'Using Tenant ID: %', v_tenant_id;
    RAISE NOTICE 'Found % patients, % doctors', ARRAY_LENGTH(v_patient_ids, 1), ARRAY_LENGTH(v_doctor_ids, 1);
    
    -- =====================================================================
    -- PART 1: COMPLETED SESSIONS (12 sessions - Recent past)
    -- =====================================================================
    
    -- Session 1: Cash Patient - Cataract PHACO - Completed
    INSERT INTO counseling_sessions (
        id, tenant_id, branch_id, patient_id, referred_by_doctor_id, counselor_id,
        session_number, session_type, session_date, session_start_time, session_end_time, duration_minutes,
        patient_type, clinical_summary, recommended_surgery, recommended_iol, iol_power, urgency,
        package_discussed, patient_agreed_to_surgery, pending_decision, decision_date,
        status, created_by_user_id, updated_by_user_id, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_ids[1], v_doctor_ids[1], v_doctor_ids[2],
        'CS-2024-001', 'Initial', '2024-02-10'::date, 
        '2024-02-10 10:00:00+00'::timestamptz, '2024-02-10 10:45:00+00'::timestamptz, 45,
        'Cash',
        '{"diagnosis": "Senile Cataract RE", "chiefComplaint": "Blurred vision", "visualAcuity": {"RE": "6/60", "LE": "6/9"}, "iop": {"RE": 14, "LE": 15}}'::jsonb,
        'Phacoemulsification with IOL', 'Monofocal IOL', '+22.0D', 'Routine',
        true, true, false, '2024-02-11'::date,
        'Completed', v_user_id, v_user_id, '2024-02-10 09:45:00+00'::timestamptz, '2024-02-10 10:50:00+00'::timestamptz
    );
    
    -- Session 2: Insurance Patient - Trabeculectomy - Completed
    INSERT INTO counseling_sessions (
        id, tenant_id, branch_id, patient_id, referred_by_doctor_id, counselor_id,
        session_number, session_type, session_date, session_start_time, session_end_time, duration_minutes,
        patient_type, clinical_summary, recommended_surgery, recommended_iol, urgency,
        package_discussed, patient_agreed_to_surgery, pending_decision, decision_date,
        status, created_by_user_id, updated_by_user_id, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_ids[2], v_doctor_ids[2], v_doctor_ids[3],
        'CS-2024-002', 'Initial', '2024-02-11'::date,
        '2024-02-11 11:00:00+00'::timestamptz, '2024-02-11 11:50:00+00'::timestamptz, 50,
        'Insurance',
        '{"diagnosis": "POAG BE", "chiefComplaint": "Progressive vision loss", "visualAcuity": {"RE": "6/18", "LE": "6/24"}, "iop": {"RE": 32, "LE": 28}, "cupDiscRatio": {"RE": 0.8, "LE": 0.75}}'::jsonb,
        'Trabeculectomy', NULL, 'Urgent',
        true, true, false, '2024-02-12'::date,
        'Completed', v_user_id, v_user_id, '2024-02-11 10:45:00+00'::timestamptz, '2024-02-11 12:00:00+00'::timestamptz
    );
    
    -- Session 3: CoPay Patient - LASIK - Completed
    INSERT INTO counseling_sessions (
        id, tenant_id, branch_id, patient_id, referred_by_doctor_id, counselor_id,
        session_number, session_type, session_date, session_start_time, session_end_time, duration_minutes,
        patient_type, clinical_summary, recommended_surgery, urgency,
        package_discussed, patient_agreed_to_surgery, pending_decision, decision_date,
        status, created_by_user_id, updated_by_user_id, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_ids[3], v_doctor_ids[1], v_doctor_ids[2],
        'CS-2024-003', 'Initial', '2024-02-12'::date,
        '2024-02-12 14:00:00+00'::timestamptz, '2024-02-12 14:40:00+00'::timestamptz, 40,
        'CoPay',
        '{"diagnosis": "Myopia BE", "chiefComplaint": "Wants freedom from glasses", "refraction": {"RE": "-4.50D", "LE": "-4.75D"}, "cornealThickness": 540}'::jsonb,
        'LASIK', 'Routine',
        true, true, false, '2024-02-13'::date,
        'Completed', v_user_id, v_user_id, '2024-02-12 13:45:00+00'::timestamptz, '2024-02-12 14:45:00+00'::timestamptz
    );
    
    -- Session 4: ESH Patient - Vitrectomy - Completed
    INSERT INTO counseling_sessions (
        id, tenant_id, branch_id, patient_id, referred_by_doctor_id, counselor_id,
        session_number, session_type, session_date, session_start_time, session_end_time, duration_minutes,
        patient_type, clinical_summary, recommended_surgery, urgency,
        package_discussed, patient_agreed_to_surgery, pending_decision, decision_date, reasons_for_delay,
        status, created_by_user_id, updated_by_user_id, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_ids[4], v_doctor_ids[3], v_doctor_ids[1],
        'CS-2024-004', 'Initial', '2024-02-13'::date,
        '2024-02-13 15:00:00+00'::timestamptz, '2024-02-13 16:00:00+00'::timestamptz, 60,
        'ESH',
        '{"diagnosis": "Vitreous Hemorrhage LE", "chiefComplaint": "Sudden vision loss left eye", "visualAcuity": {"RE": "6/6", "LE": "PL+"}, "underlying": "Diabetic Retinopathy"}'::jsonb,
        'Vitrectomy', 'Urgent',
        true, false, true, NULL, 'Patient needs to stabilize blood sugar before surgery',
        'Completed', v_user_id, v_user_id, '2024-02-13 14:45:00+00'::timestamptz, '2024-02-13 16:05:00+00'::timestamptz
    );
    
    -- Session 5: CGHS Patient - ECCE - Completed
    INSERT INTO counseling_sessions (
        id, tenant_id, branch_id, patient_id, referred_by_doctor_id, counselor_id,
        session_number, session_type, session_date, session_start_time, session_end_time, duration_minutes,
        patient_type, clinical_summary, recommended_surgery, recommended_iol, iol_power, urgency,
        package_discussed, patient_agreed_to_surgery, pending_decision, decision_date,
        status, created_by_user_id, updated_by_user_id, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_ids[5], v_doctor_ids[2], v_doctor_ids[3],
        'CS-2024-005', 'Initial', '2024-02-14'::date,
        '2024-02-14 09:30:00+00'::timestamptz, '2024-02-14 10:15:00+00'::timestamptz, 45,
        'CGHS',
        '{"diagnosis": "Mature Cataract LE", "chiefComplaint": "Poor vision left eye", "visualAcuity": {"RE": "6/12", "LE": "HMCF"}, "iop": {"RE": 14, "LE": 16}}'::jsonb,
        'ECCE (Extracapsular Cataract Extraction)', 'Standard PMMA IOL', '+21.5D', 'Routine',
        true, true, false, '2024-02-15'::date,
        'Completed', v_user_id, v_user_id, '2024-02-14 09:15:00+00'::timestamptz, '2024-02-14 10:20:00+00'::timestamptz
    );
    
    -- Sessions 6-12: Additional Completed Sessions (vary patient types)
    INSERT INTO counseling_sessions (
        id, tenant_id, branch_id, patient_id, referred_by_doctor_id, counselor_id,
        session_number, session_type, session_date, session_start_time, session_end_time, duration_minutes,
        patient_type, clinical_summary, recommended_surgery, recommended_iol, iol_power, urgency,
        package_discussed, patient_agreed_to_surgery, pending_decision,
        status, created_by_user_id, updated_by_user_id, created_at, updated_at
    ) VALUES 
    -- Session 6: Arogyashree - PKP
    (gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_ids[6], v_doctor_ids[1], v_doctor_ids[2],
     'CS-2024-006', 'Initial', '2024-02-15'::date, '2024-02-15 11:00:00+00'::timestamptz, '2024-02-15 11:55:00+00'::timestamptz, 55,
     'Arograshree', '{"diagnosis": "Corneal Opacity LE", "cause": "Chemical injury", "visualAcuity": {"LE": "HMCF"}}'::jsonb,
     'Penetrating Keratoplasty (PKP)', NULL, NULL, 'Urgent', true, true, false, 'Completed', v_user_id, v_user_id, '2024-02-15 10:45:00+00'::timestamptz, '2024-02-15 12:00:00+00'::timestamptz),
    
    -- Session 7: Cash - Squint Surgery
    (gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_ids[7], v_doctor_ids[2], v_doctor_ids[3],
     'CS-2024-007', 'Initial', '2024-02-16'::date, '2024-02-16 10:00:00+00'::timestamptz, '2024-02-16 10:35:00+00'::timestamptz, 35,
     'Cash', '{"diagnosis": "Esotropia", "chiefComplaint": "Child has crossed eyes", "age": 8, "squintAngle": 35}'::jsonb,
     'Squint Surgery', NULL, NULL, 'Routine', true, true, false, 'Completed', v_user_id, v_user_id, '2024-02-16 09:45:00+00'::timestamptz, '2024-02-16 10:40:00+00'::timestamptz),
    
    -- Session 8: Insurance - Ahmed Valve
    (gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_ids[8], v_doctor_ids[3], v_doctor_ids[1],
     'CS-2024-008', 'Initial', '2024-02-17'::date, '2024-02-17 14:30:00+00'::timestamptz, '2024-02-17 15:20:00+00'::timestamptz, 50,
     'Insurance', '{"diagnosis": "Neovascular Glaucoma RE", "iop": {"RE": 45}, "priorSurgery": "Failed trabeculectomy"}'::jsonb,
     'Ahmed Glaucoma Valve', NULL, NULL, 'Urgent', true, true, false, 'Completed', v_user_id, v_user_id, '2024-02-17 14:15:00+00'::timestamptz, '2024-02-17 15:25:00+00'::timestamptz),
    
    -- Session 9: Cash - Follow-up Cataract
    (gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_ids[9], v_doctor_ids[1], v_doctor_ids[2],
     'CS-2024-009', 'Followup', '2024-02-18'::date, '2024-02-18 11:00:00+00'::timestamptz, '2024-02-18 11:25:00+00'::timestamptz, 25,
     'Cash', '{"previousSession": "CS-2024-001", "status": "Patient ready for surgery"}'::jsonb,
     'Phacoemulsification with IOL', 'Toric IOL', '+23.0D', 'Routine', true, true, false, 'Completed', v_user_id, v_user_id, '2024-02-18 10:50:00+00'::timestamptz, '2024-02-18 11:30:00+00'::timestamptz),
    
    -- Session 10: SGHS - Scleral Buckle
    (gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_ids[10], v_doctor_ids[2], v_doctor_ids[3],
     'CS-2024-010', 'Initial', '2024-02-19'::date, '2024-02-19 09:00:00+00'::timestamptz, '2024-02-19 09:50:00+00'::timestamptz, 50,
     'SGHS', '{"diagnosis": "Rhegmatogenous RD LE", "chiefComplaint": "Curtain-like shadow", "macula": "On"}'::jsonb,
     'Scleral Buckle for RD', NULL, NULL, 'Urgent', true, true, false, 'Completed', v_user_id, v_user_id, '2024-02-19 08:45:00+00'::timestamptz, '2024-02-19 09:55:00+00'::timestamptz),
    
    -- Session 11: CoPay - PRK
    (gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_ids[11], v_doctor_ids[1], v_doctor_ids[2],
     'CS-2024-011', 'Initial', '2024-02-20'::date, '2024-02-20 15:00:00+00'::timestamptz, '2024-02-20 15:35:00+00'::timestamptz, 35,
     'CoPay', '{"diagnosis": "Myopia BE", "refraction": {"RE": "-3.50D", "LE": "-3.75D"}, "cornealThickness": 485, "note": "Thin cornea, PRK preferred"}'::jsonb,
     'PRK (Photorefractive Keratectomy)', NULL, NULL, 'Routine', true, true, false, 'Completed', v_user_id, v_user_id, '2024-02-20 14:45:00+00'::timestamptz, '2024-02-20 15:40:00+00'::timestamptz),
    
    -- Session 12: Insurance - DSEK
    (gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_ids[12], v_doctor_ids[3], v_doctor_ids[1],
     'CS-2024-012', 'Initial', '2024-02-21'::date, '2024-02-21 10:30:00+00'::timestamptz, '2024-02-21 11:25:00+00'::timestamptz, 55,
     'Insurance', '{"diagnosis": "Pseudophakic Bullous Keratopathy LE", "visualAcuity": {"LE": "6/60"}, "endothelialCount": 450}'::jsonb,
     'DSEK/DMEK', NULL, NULL, 'Routine', true, true, false, 'Completed', v_user_id, v_user_id, '2024-02-21 10:15:00+00'::timestamptz, '2024-02-21 11:30:00+00'::timestamptz);
    
    -- =====================================================================
    -- PART 2: IN-PROGRESS SESSIONS (6 sessions - Today)
    -- =====================================================================
    
    INSERT INTO counseling_sessions (
        id, tenant_id, branch_id, patient_id, referred_by_doctor_id, counselor_id,
        session_number, session_type, session_date, session_start_time, duration_minutes,
        patient_type, clinical_summary, recommended_surgery, recommended_iol, iol_power, urgency,
        package_discussed, patient_agreed_to_surgery, pending_decision,
        status, created_by_user_id, created_at
    ) VALUES 
    -- Session 13: Cash - Cataract (In Progress)
    (gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_ids[13], v_doctor_ids[1], v_doctor_ids[2],
     'CS-2024-013', 'Initial', CURRENT_DATE, CURRENT_TIMESTAMP - INTERVAL '30 minutes', NULL,
     'Cash', '{"diagnosis": "Immature Cataract RE", "visualAcuity": {"RE": "6/36"}}'::jsonb,
     'Phacoemulsification with IOL', 'Multifocal IOL', '+21.0D', 'Routine', true, NULL, true,
     'InProgress', v_user_id, CURRENT_TIMESTAMP - INTERVAL '35 minutes'),
    
    -- Session 14: Insurance - Cataract (In Progress)
    (gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_ids[14], v_doctor_ids[2], v_doctor_ids[3],
     'CS-2024-014', 'Initial', CURRENT_DATE, CURRENT_TIMESTAMP - INTERVAL '20 minutes', NULL,
     'Insurance', '{"diagnosis": "Senile Cataract BE", "visualAcuity": {"RE": "6/60", "LE": "6/60"}}'::jsonb,
     'Phacoemulsification with IOL', 'Monofocal IOL', '+22.5D', 'Routine', true, NULL, true,
     'InProgress', v_user_id, CURRENT_TIMESTAMP - INTERVAL '25 minutes'),
    
    -- Session 15: ESH - Trabeculectomy (In Progress)
    (gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_ids[15], v_doctor_ids[3], v_doctor_ids[1],
     'CS-2024-015', 'Initial', CURRENT_DATE, CURRENT_TIMESTAMP - INTERVAL '15 minutes', NULL,
     'ESH', '{"diagnosis": "POAG RE", "iop": {"RE": 28}, "maxMedications": true}'::jsonb,
     'Trabeculectomy', NULL, NULL, 'Urgent', false, NULL, true,
     'InProgress', v_user_id, CURRENT_TIMESTAMP - INTERVAL '18 minutes'),
    
    -- Session 16: CGHS - Cataract (In Progress)
    (gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_ids[16], v_doctor_ids[1], v_doctor_ids[2],
     'CS-2024-016', 'Initial', CURRENT_DATE, CURRENT_TIMESTAMP - INTERVAL '10 minutes', NULL,
     'CGHS', '{"diagnosis": "Nuclear Sclerosis Grade 3 LE"}'::jsonb,
     'Phacoemulsification with IOL', 'Monofocal IOL', '+20.5D', 'Routine', true, NULL, true,
     'InProgress', v_user_id, CURRENT_TIMESTAMP - INTERVAL '12 minutes'),
    
    -- Session 17: Cash - Follow-up (In Progress)
    (gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_ids[17], v_doctor_ids[2], v_doctor_ids[3],
     'CS-2024-017', 'Followup', CURRENT_DATE, CURRENT_TIMESTAMP - INTERVAL '5 minutes', NULL,
     'Cash', '{"previousSession": "CS-2024-007", "status": "Reviewing package details"}'::jsonb,
     'Squint Surgery', NULL, NULL, 'Routine', true, NULL, true,
     'InProgress', v_user_id, CURRENT_TIMESTAMP - INTERVAL '8 minutes'),
    
    -- Session 18: Arogyashree - Vitrectomy (In Progress)
    (gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_ids[18], v_doctor_ids[3], v_doctor_ids[1],
     'CS-2024-018', 'Initial', CURRENT_DATE, CURRENT_TIMESTAMP - INTERVAL '2 minutes', NULL,
     'Arograshree', '{"diagnosis": "Proliferative Diabetic Retinopathy LE"}'::jsonb,
     'Vitrectomy', NULL, NULL, 'Urgent', false, NULL, true,
     'InProgress', v_user_id, CURRENT_TIMESTAMP - INTERVAL '3 minutes');
    
    -- =====================================================================
    -- PART 3: SCHEDULED SESSIONS (8 sessions - Future dates)
    -- =====================================================================
    
    INSERT INTO counseling_sessions (
        id, tenant_id, branch_id, patient_id, referred_by_doctor_id,
        session_number, session_type, session_date,
        patient_type, clinical_summary, recommended_surgery, recommended_iol, iol_power, urgency,
        package_discussed, patient_agreed_to_surgery, pending_decision,
        status, created_by_user_id, created_at
    ) VALUES 
    -- Session 19: Insurance - Scheduled Tomorrow
    (gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_ids[19], v_doctor_ids[1],
     'CS-2024-019', 'Initial', CURRENT_DATE + INTERVAL '1 day',
     'Insurance', '{"diagnosis": "Cataract RE", "scheduledBy": "Online booking"}'::jsonb,
     'Phacoemulsification with IOL', 'Toric IOL', '+23.5D', 'Routine', false, NULL, true,
     'Scheduled', v_user_id, CURRENT_TIMESTAMP),
    
    -- Session 20: Cash - Scheduled Tomorrow
    (gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_ids[20], v_doctor_ids[2],
     'CS-2024-020', 'Initial', CURRENT_DATE + INTERVAL '1 day',
     'Cash', '{"diagnosis": "High Myopia BE", "interested": "LASIK"}'::jsonb,
     'LASIK', NULL, NULL, 'Routine', false, NULL, true,
     'Scheduled', v_user_id, CURRENT_TIMESTAMP),
    
    -- Session 21: CoPay - Scheduled +2 days
    (gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_ids[21], v_doctor_ids[3],
     'CS-2024-021', 'Initial', CURRENT_DATE + INTERVAL '2 days',
     'CoPay', '{"diagnosis": "Cataract LE", "referredFrom": "ER"}'::jsonb,
     'Phacoemulsification with IOL', 'Monofocal IOL', '+21.5D', 'Routine', false, NULL, true,
     'Scheduled', v_user_id, CURRENT_TIMESTAMP),
    
    -- Session 22: ESH - Scheduled +2 days
    (gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_ids[22], v_doctor_ids[1],
     'CS-2024-022', 'Followup', CURRENT_DATE + INTERVAL '2 days',
     'ESH', '{"previousSession": "CS-2024-004", "note": "Blood sugar stabilized"}'::jsonb,
     'Vitrectomy', NULL, NULL, 'Urgent', false, NULL, true,
     'Scheduled', v_user_id, CURRENT_TIMESTAMP),
    
    -- Session 23: CGHS - Scheduled +3 days
    (gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_ids[23], v_doctor_ids[2],
     'CS-2024-023', 'Initial', CURRENT_DATE + INTERVAL '3 days',
     'CGHS', '{"diagnosis": "Posterior Capsular Opacification RE", "priorSurgery": "Cataract 2 years ago"}'::jsonb,
     'YAG Laser Capsulotomy', NULL, NULL, 'Routine', false, NULL, true,
     'Scheduled', v_user_id, CURRENT_TIMESTAMP),
    
    -- Session 24: Arogyashree - Scheduled +3 days
    (gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_ids[24], v_doctor_ids[3],
     'CS-2024-024', 'Initial', CURRENT_DATE + INTERVAL '3 days',
     'Arograshree', '{"diagnosis": "Corneal Ulcer BE healed with opacity"}'::jsonb,
     'Penetrating Keratoplasty (PKP)', NULL, NULL, 'Routine', false, NULL, true,
     'Scheduled', v_user_id, CURRENT_TIMESTAMP),
    
    -- Session 25: SGHS - Scheduled +4 days
    (gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_ids[25], v_doctor_ids[1],
     'CS-2024-025', 'Initial', CURRENT_DATE + INTERVAL '4 days',
     'SGHS', '{"diagnosis": "Pterygium RE", "chiefComplaint": "Cosmetic concern and irritation"}'::jsonb,
     'Pterygium Excision with Graft', NULL, NULL, 'Routine', false, NULL, true,
     'Scheduled', v_user_id, CURRENT_TIMESTAMP),
    
    -- Session 26: Cash - Scheduled +5 days
    (gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_ids[26], v_doctor_ids[2],
     'CS-2024-026', 'Followup', CURRENT_DATE + INTERVAL '5 days',
     'Cash', '{"previousSession": "CS-2024-009", "note": "Pre-operative counseling"}'::jsonb,
     'Phacoemulsification with IOL', 'EDOF IOL', '+22.0D', 'Routine', false, NULL, true,
     'Scheduled', v_user_id, CURRENT_TIMESTAMP);
    
    -- =====================================================================
    -- PART 4: CANCELLED & NO-SHOW SESSIONS (4 sessions)
    -- =====================================================================
    
    INSERT INTO counseling_sessions (
        id, tenant_id, branch_id, patient_id, referred_by_doctor_id,
        session_number, session_type, session_date,
        patient_type, clinical_summary, recommended_surgery, urgency,
        package_discussed, patient_agreed_to_surgery, pending_decision, reasons_for_delay,
        status, created_by_user_id, updated_by_user_id, created_at, updated_at
    ) VALUES 
    -- Session 27: Cancelled - Patient requested postponement
    (gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_ids[27], v_doctor_ids[3],
     'CS-2024-027', 'Initial', '2024-02-22'::date,
     'Insurance', '{"diagnosis": "Cataract LE"}'::jsonb,
     'Phacoemulsification with IOL', 'Routine', false, NULL, true, 'Patient traveling, will reschedule',
     'Cancelled', v_user_id, v_user_id, '2024-02-20 14:00:00+00'::timestamptz, '2024-02-22 09:00:00+00'::timestamptz),
    
    -- Session 28: No Show
    (gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_ids[28], v_doctor_ids[1],
     'CS-2024-028', 'Initial', '2024-02-22'::date,
     'Cash', '{"diagnosis": "Pterygium RE"}'::jsonb,
     'Pterygium Excision with Graft', 'Routine', false, NULL, true, NULL,
     'NoShow', v_user_id, v_user_id, '2024-02-20 10:00:00+00'::timestamptz, '2024-02-22 10:30:00+00'::timestamptz),
    
    -- Session 29: Cancelled - Doctor unavailable
    (gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_ids[29], v_doctor_ids[2],
     'CS-2024-029', 'Followup', '2024-02-23'::date,
     'CoPay', '{"previousSession": "CS-2024-021"}'::jsonb,
     'Phacoemulsification with IOL', 'Routine', false, NULL, true, 'Rescheduled due to counselor emergency',
     'Cancelled', v_user_id, v_user_id, '2024-02-21 15:00:00+00'::timestamptz, '2024-02-23 08:00:00+00'::timestamptz),
    
    -- Session 30: No Show
    (gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_ids[30], v_doctor_ids[3],
     'CS-2024-030', 'Initial', CURRENT_DATE - INTERVAL '1 day',
     'Insurance', '{"diagnosis": "POAG RE"}'::jsonb,
     'Trabeculectomy', 'Urgent', false, NULL, true, NULL,
     'NoShow', v_user_id, v_user_id, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '1 day');
    
    RAISE NOTICE 'Counseling sessions seeded successfully!';

END $$;

-- Verification Queries
SELECT 'Counseling Sessions' as table_name, COUNT(*) as row_count FROM counseling_sessions;
SELECT patient_type, COUNT(*) as count FROM counseling_sessions GROUP BY patient_type ORDER BY count DESC;
SELECT status, COUNT(*) as count FROM counseling_sessions GROUP BY status ORDER BY count DESC;
SELECT session_type, COUNT(*) as count FROM counseling_sessions GROUP BY session_type ORDER BY count DESC;
