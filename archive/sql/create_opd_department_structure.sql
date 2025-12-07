-- =============================================
-- CREATE OUTPATIENT (OPD) DEPARTMENT STRUCTURE
-- Phase 1, Day 1: Critical Clinical Departments
-- Generated: November 11, 2025
-- =============================================
-- Inserts parent OPD department and 3 sub-departments

DO $$
DECLARE
    v_tenant_id UUID := '11111111-1111-1111-1111-111111111111';
    v_admin_user_id UUID := 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4';
    v_branch_id UUID;
    v_opd_parent_id UUID;
BEGIN
    -- Get any branch for this tenant
    SELECT id INTO v_branch_id 
    FROM branch 
    WHERE tenant_id = v_tenant_id 
      AND deleted_at IS NULL
    LIMIT 1;
    IF v_branch_id IS NULL THEN
        RAISE EXCEPTION 'No branch found for tenant %', v_tenant_id;
    END IF;

    -- Insert parent OPD department
    v_opd_parent_id := gen_random_uuid();
    INSERT INTO department (
        id, tenant_id, branch_id, department_code, department_name, department_type,
        description, status, parent_department_id,
        operating_hours_start, operating_hours_end, is_24x7, requires_approval,
        created_at, created_by, updated_at, updated_by
    ) VALUES (
        v_opd_parent_id,
        v_tenant_id,
        v_branch_id,
        'OPD',
        'Outpatient Department',
        'Clinical',
        'General outpatient services and consultations',
        'Active',
        NULL,
        INTERVAL '8 hours',
        INTERVAL '18 hours',
        TRUE,
        FALSE,
        NOW(), v_admin_user_id, NOW(), v_admin_user_id
    );

    -- Insert sub-departments
    INSERT INTO department (
        id, tenant_id, branch_id, department_code, department_name, department_type,
        description, status, parent_department_id,
        operating_hours_start, operating_hours_end, is_24x7, requires_approval,
        created_at, created_by, updated_at, updated_by
    ) VALUES
        (gen_random_uuid(), v_tenant_id, v_branch_id, 'OPD-REG', 'New Registration Desk', 'Clinical', 'Patient registration and onboarding', 'Active', v_opd_parent_id, INTERVAL '8 hours', INTERVAL '18 hours', TRUE, FALSE, NOW(), v_admin_user_id, NOW(), v_admin_user_id),
        (gen_random_uuid(), v_tenant_id, v_branch_id, 'OPD-FOLLOWUP', 'Follow-Up/Review Desk', 'Clinical', 'Follow-up and review appointments', 'Active', v_opd_parent_id, INTERVAL '8 hours', INTERVAL '18 hours', TRUE, FALSE, NOW(), v_admin_user_id, NOW(), v_admin_user_id),
        (gen_random_uuid(), v_tenant_id, v_branch_id, 'OPD-TRIAGE', 'Triage / Preliminary Assessment', 'Clinical', 'Initial patient assessment and triage', 'Active', v_opd_parent_id, INTERVAL '8 hours', INTERVAL '18 hours', TRUE, FALSE, NOW(), v_admin_user_id, NOW(), v_admin_user_id);
END $$;
