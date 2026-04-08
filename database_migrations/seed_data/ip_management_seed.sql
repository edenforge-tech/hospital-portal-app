-- ============================================================
-- IP MANAGEMENT SEED — patient_journey rows for all clinical states
-- Re-runnable: DELETE + INSERT with fixed UUIDs.
-- Tenant : 155fe198-6ae5-4a01-9254-ead5b427247e
-- Branch : 74c014cf-9570-4824-bdf9-b369ea11a8f4
-- ============================================================

DO $$
DECLARE
    v_tenant  UUID := '155fe198-6ae5-4a01-9254-ead5b427247e'::uuid;
    v_branch  UUID := '74c014cf-9570-4824-bdf9-b369ea11a8f4'::uuid;
    v_admin   UUID := (
        SELECT id FROM users
        WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'::uuid
          AND email ILIKE '%admin%'
        LIMIT 1
    );
BEGIN
    RAISE NOTICE 'IP Management Seed — removing previous seed rows...';

    -- Clean up previous seed rows (fixed UUIDs only)
    DELETE FROM patient_journey
     WHERE id IN (
        'dd000001-4444-4444-4444-000000000001'::uuid,
        'dd000001-4444-4444-4444-000000000002'::uuid,
        'dd000001-4444-4444-4444-000000000003'::uuid,
        'dd000001-4444-4444-4444-000000000004'::uuid,
        'dd000001-4444-4444-4444-000000000005'::uuid,
        'dd000001-4444-4444-4444-000000000006'::uuid,
        'dd000001-4444-4444-4444-000000000007'::uuid,
        'dd000001-4444-4444-4444-000000000008'::uuid
     );

    RAISE NOTICE 'IP Management Seed — inserting patient_journey rows...';

    INSERT INTO patient_journey (
        id, tenant_id, branch_id, patient_id, uhid,
        clinical_state, ot_state, financial_state, post_op_state,
        procedure_name, eye_operated,
        surgery_scheduled_at,
        package_amount, total_advances, total_paid,
        is_locked, is_billing_locked, is_clinical_locked, is_discharged,
        emergency_fc_applied, government_approval_submitted,
        insurance_preauth_submitted, is_camp_patient, discharge_override_applied,
        iol_issued_from_ip, iol_barcode_verified,
        status, created_at, updated_at, created_by_user_id
    ) VALUES
    -- 1. ReadyForSurgery — FRESH-003 (Suresh Babu), tomorrow
    (
        'dd000001-4444-4444-4444-000000000001'::uuid,
        v_tenant, v_branch,
        'aa000001-1111-1111-1111-000000000003'::uuid, 'FRESH-003',
        'ReadyForSurgery', 'NotSent', 'Confirmed', 'NotStarted',
        'Phacoemulsification OD', 'OD',
        NOW() + INTERVAL '1 day',
        35000.00, 10000.00, 10000.00,
        FALSE, FALSE, FALSE, FALSE,
        FALSE, FALSE, FALSE, FALSE, FALSE,
        FALSE, FALSE,
        'active', NOW(), NOW(), v_admin
    ),
    -- 2. ReadyForSurgery — FRESH-004 (Vasantha Kumari), day after tomorrow
    (
        'dd000001-4444-4444-4444-000000000002'::uuid,
        v_tenant, v_branch,
        'aa000001-1111-1111-1111-000000000004'::uuid, 'FRESH-004',
        'ReadyForSurgery', 'NotSent', 'PartiallyPaid', 'NotStarted',
        'LASIK Both Eyes', 'OU',
        NOW() + INTERVAL '2 days',
        55000.00, 20000.00, 20000.00,
        FALSE, FALSE, FALSE, FALSE,
        FALSE, FALSE, FALSE, FALSE, FALSE,
        FALSE, FALSE,
        'active', NOW(), NOW(), v_admin
    ),
    -- 3. SentToOT — FRESH-005 (Ravi Shankar), today
    (
        'dd000001-4444-4444-4444-000000000003'::uuid,
        v_tenant, v_branch,
        'aa000001-1111-1111-1111-000000000005'::uuid, 'FRESH-005',
        'SentToOT', 'SentToOT', 'Confirmed', 'NotStarted',
        'Trabeculectomy OS', 'OS',
        NOW(),
        40000.00, 40000.00, 40000.00,
        FALSE, FALSE, FALSE, FALSE,
        FALSE, FALSE, FALSE, FALSE, FALSE,
        FALSE, FALSE,
        'active', NOW(), NOW(), v_admin
    ),
    -- 4. InOT — FRESH-006 (Meenakshi Iyer), today (surgery started 30 min ago)
    (
        'dd000001-4444-4444-4444-000000000004'::uuid,
        v_tenant, v_branch,
        'aa000001-1111-1111-1111-000000000006'::uuid, 'FRESH-006',
        'InOT', 'InProgress', 'Paid', 'NotStarted',
        'Vitrectomy OD', 'OD',
        NOW(),
        65000.00, 65000.00, 65000.00,
        FALSE, TRUE, FALSE, FALSE,
        FALSE, FALSE, FALSE, FALSE, FALSE,
        TRUE, TRUE,
        'active', NOW() - INTERVAL '30 minutes', NOW(), v_admin
    ),
    -- 5. SurgeryCompleted — FRESH-007 (Gopalkrishnan Pillai), completed 1 hour ago
    (
        'dd000001-4444-4444-4444-000000000005'::uuid,
        v_tenant, v_branch,
        'aa000001-1111-1111-1111-000000000007'::uuid, 'FRESH-007',
        'SurgeryCompleted', 'Completed', 'Paid', 'NotStarted',
        'Phacoemulsification LE with IOL', 'OS',
        NOW() - INTERVAL '2 hours',
        42000.00, 42000.00, 42000.00,
        FALSE, TRUE, FALSE, FALSE,
        FALSE, FALSE, FALSE, FALSE, FALSE,
        TRUE, TRUE,
        'active', NOW() - INTERVAL '2 hours', NOW(), v_admin
    ),
    -- 6. Expected — FRESH-008 (Annapurna Devi), surgery in 3 days
    (
        'dd000001-4444-4444-4444-000000000006'::uuid,
        v_tenant, v_branch,
        'aa000001-1111-1111-1111-000000000008'::uuid, 'FRESH-008',
        'Expected', 'NotSent', 'Estimated', 'NotStarted',
        'Cataract Surgery RE', 'OD',
        NOW() + INTERVAL '3 days',
        30000.00, 0.00, 0.00,
        FALSE, FALSE, FALSE, FALSE,
        FALSE, FALSE, FALSE, FALSE, FALSE,
        FALSE, FALSE,
        'active', NOW(), NOW(), v_admin
    ),
    -- 7. Expected — FRESH-009 (Venkatesh Murthy), surgery in 5 days
    (
        'dd000001-4444-4444-4444-000000000007'::uuid,
        v_tenant, v_branch,
        'aa000001-1111-1111-1111-000000000009'::uuid, 'FRESH-009',
        'Expected', 'NotSent', 'Draft', 'NotStarted',
        'Pterygium Excision OD', 'OD',
        NOW() + INTERVAL '5 days',
        12000.00, 0.00, 0.00,
        FALSE, FALSE, FALSE, FALSE,
        FALSE, FALSE, FALSE, FALSE, FALSE,
        FALSE, FALSE,
        'active', NOW(), NOW(), v_admin
    ),
    -- 8. Admitted — FRESH-010 (Lakshmidevi Krishnan), admitted this morning
    (
        'dd000001-4444-4444-4444-000000000008'::uuid,
        v_tenant, v_branch,
        'aa000001-1111-1111-1111-000000000010'::uuid, 'FRESH-010',
        'Admitted', 'NotSent', 'Confirmed', 'NotStarted',
        'LASIK Advanced Treatment', 'OU',
        NOW() + INTERVAL '1 day',
        75000.00, 25000.00, 25000.00,
        FALSE, FALSE, FALSE, FALSE,
        FALSE, FALSE, FALSE, FALSE, FALSE,
        FALSE, FALSE,
        'active', NOW() - INTERVAL '3 hours', NOW(), v_admin
    );

    RAISE NOTICE 'IP Management Seed — inserted 8 patient_journey rows.';
    RAISE NOTICE 'Coverage: Expected x2, Admitted x1 (new), ReadyForSurgery x2, SentToOT x1, InOT x1, SurgeryCompleted x1';
END $$;
