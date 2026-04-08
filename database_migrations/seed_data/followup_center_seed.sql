-- ============================================================================
-- Seed: Follow-up Center data for all 3 tabs
-- Tenant: 155fe198-6ae5-4a01-9254-ead5b427247e
-- ============================================================================

DO $$
DECLARE
    v_tenant UUID := '155fe198-6ae5-4a01-9254-ead5b427247e'::UUID;
    v_branch UUID;
    v_count  INT;
BEGIN
    PERFORM set_config('app.current_tenant_id', v_tenant::text, false);

    -- Grab any active branch for this tenant
    SELECT id INTO v_branch
    FROM branch
    WHERE tenant_id = v_tenant AND deleted_at IS NULL
    ORDER BY created_at
    LIMIT 1;

    IF v_branch IS NULL THEN
        RAISE EXCEPTION 'No branch found for tenant %', v_tenant;
    END IF;

    RAISE NOTICE 'Using branch: %', v_branch;

    -- ────────────────────────────────────────────────────────────────────────
    -- TAB 1: Active Follow-ups (5 sessions with "willing/undecided/waiting" intentions)
    -- ────────────────────────────────────────────────────────────────────────
    SELECT COUNT(*) INTO v_count
    FROM counseling_sessions
    WHERE tenant_id = v_tenant AND deleted_at IS NULL
      AND patient_intention IN (
          'WillingWeek','WillingMonth','WillingQuarter',
          'WillingCallToConfirm','Undecided','WaitingFinancial','WaitingFear');

    IF v_count < 3 THEN
        UPDATE counseling_sessions
        SET patient_intention     = intentions.val,
            escalation_status     = escalations.val,
            last_contact_date     = CURRENT_DATE - (rn::int * 4),
            contact_attempt_count = rn::int,
            last_contact_outcome  = 'NoAnswer',
            updated_at            = NOW()
        FROM (
            SELECT id,
                   ROW_NUMBER() OVER (ORDER BY created_at) AS rn
            FROM counseling_sessions
            WHERE tenant_id = v_tenant AND deleted_at IS NULL
              AND (patient_intention IS NULL OR patient_intention = ''
                   OR patient_intention NOT IN (
                       'WillingWeek','WillingMonth','WillingQuarter',
                       'WillingCallToConfirm','Undecided','WaitingFinancial','WaitingFear',
                       'Declined','ReferredElsewhere'))
            ORDER BY created_at
            LIMIT 5
        ) sub
        JOIN LATERAL (
            SELECT CASE sub.rn
                WHEN 1 THEN 'WillingWeek'
                WHEN 2 THEN 'WillingCallToConfirm'
                WHEN 3 THEN 'WaitingFinancial'
                WHEN 4 THEN 'Undecided'
                ELSE        'WillingMonth'
            END AS val
        ) intentions ON TRUE
        JOIN LATERAL (
            SELECT CASE sub.rn
                WHEN 1 THEN 'Normal'
                WHEN 2 THEN 'Overdue'
                WHEN 3 THEN 'Escalated'
                WHEN 4 THEN 'Normal'
                ELSE        'Overdue'
            END AS val
        ) escalations ON TRUE
        WHERE counseling_sessions.id = sub.id;

        GET DIAGNOSTICS v_count = ROW_COUNT;
        RAISE NOTICE 'Active follow-ups seeded: % rows', v_count;
    ELSE
        RAISE NOTICE 'Active follow-ups already present (%), skipping.', v_count;
    END IF;

    -- ────────────────────────────────────────────────────────────────────────
    -- TAB 2: Cold Leads (3 sessions with "Declined / ReferredElsewhere")
    -- ────────────────────────────────────────────────────────────────────────
    SELECT COUNT(*) INTO v_count
    FROM counseling_sessions
    WHERE tenant_id = v_tenant AND deleted_at IS NULL
      AND patient_intention IN ('Declined','ReferredElsewhere');

    IF v_count < 2 THEN
        UPDATE counseling_sessions
        SET patient_intention     = CASE sub.rn
                                        WHEN 1 THEN 'Declined'
                                        WHEN 2 THEN 'ReferredElsewhere'
                                        ELSE        'Declined'
                                    END,
            escalation_status     = 'Closed',
            last_contact_date     = CURRENT_DATE - 30,
            contact_attempt_count = 3,
            last_contact_outcome  = 'Declined',
            updated_at            = NOW()
        FROM (
            SELECT id,
                   ROW_NUMBER() OVER (ORDER BY created_at DESC) AS rn
            FROM counseling_sessions
            WHERE tenant_id = v_tenant AND deleted_at IS NULL
              AND (patient_intention IS NULL OR patient_intention = ''
                   OR patient_intention NOT IN (
                       'WillingWeek','WillingMonth','WillingQuarter',
                       'WillingCallToConfirm','Undecided','WaitingFinancial','WaitingFear',
                       'Declined','ReferredElsewhere'))
            ORDER BY created_at DESC
            LIMIT 3
        ) sub
        WHERE counseling_sessions.id = sub.id;

        GET DIAGNOSTICS v_count = ROW_COUNT;
        RAISE NOTICE 'Cold leads seeded: % rows', v_count;
    ELSE
        RAISE NOTICE 'Cold leads already present (%), skipping.', v_count;
    END IF;

    -- ────────────────────────────────────────────────────────────────────────
    -- TAB 3: Post-Surgery (5 discharged patient_journey rows)
    -- ────────────────────────────────────────────────────────────────────────
    SELECT COUNT(*) INTO v_count
    FROM patient_journey
    WHERE tenant_id = v_tenant AND deleted_at IS NULL AND is_discharged = TRUE;

    IF v_count < 3 THEN
        INSERT INTO patient_journey (
            id, tenant_id, branch_id, patient_id, uhid,
            clinical_state, is_discharged, discharged_at,
            procedure_name,
            status, created_at, updated_at
        )
        SELECT
            gen_random_uuid(),
            v_tenant,
            v_branch,
            p.id,
            p.medical_record_number,
            'Discharged',
            TRUE,
            NOW() - (n.days_ago || ' days')::INTERVAL,
            n.proc_name,
            'active',
            NOW() - (n.days_ago || ' days')::INTERVAL,
            NOW()
        FROM (
            SELECT id, medical_record_number,
                   ROW_NUMBER() OVER (ORDER BY created_at) AS rn
            FROM patient
            WHERE tenant_id = v_tenant AND deleted_at IS NULL
            LIMIT 10
        ) p
        JOIN (VALUES
            (1, 5,  'Phacoemulsification OD'),
            (2, 8,  'Phacoemulsification OS'),
            (3, 12, 'LASIK Both Eyes'),
            (4, 18, 'Vitrectomy OD'),
            (5, 25, 'Trabeculectomy OS')
        ) n(rn, days_ago, proc_name) ON p.rn = n.rn
        WHERE NOT EXISTS (
            SELECT 1
            FROM patient_journey pj
            WHERE pj.patient_id = p.id
              AND pj.tenant_id  = v_tenant
              AND pj.is_discharged = TRUE
              AND pj.deleted_at IS NULL
        );

        GET DIAGNOSTICS v_count = ROW_COUNT;
        RAISE NOTICE 'Post-surgery journeys inserted: % rows', v_count;
    ELSE
        RAISE NOTICE 'Post-surgery journeys already present (%), skipping.', v_count;
    END IF;

    RAISE NOTICE 'Seed complete.';
END;
$$;
