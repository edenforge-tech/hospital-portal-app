-- Insert 10 patient type configurations for current tenant
-- Tenant ID: 155fe198-6ae5-4a01-9254-ead5b427247e

DO $$
DECLARE
    v_tenant_id UUID := '155fe198-6ae5-4a01-9254-ead5b427247e';
BEGIN
    -- Delete existing configs for this tenant (if any)
    DELETE FROM patient_type_configurations WHERE tenant_id = v_tenant_id;
    
    -- Insert 10 patient types (Cash, Insurance, CoPay, ESH, CGHS, Arograshree, SGHS, Camp, Railway, Free)
    INSERT INTO patient_type_configurations (tenant_id, patient_type, display_name, description, configuration_json, is_active, display_order) VALUES
    (v_tenant_id, 'Cash', 'Cash Patient', 'Direct payment by patient', 
     '{"requires_advance_payment": true, "advance_percentage": 50, "required_documents": ["ID Proof", "Address Proof"], "skip_insurance": true, "billing_mode": "direct"}'::JSONB, 
     TRUE, 1),
    
    (v_tenant_id, 'Insurance', 'Insurance Patient', 'Insurance company cashless treatment', 
     '{"requires_pre_authorization": true, "max_pre_auth_wait_hours": 72, "required_documents": ["Insurance Card", "Policy Document", "ID Proof", "Employer Letter"], "skip_advance_if_approved": true, "billing_mode": "cashless"}'::JSONB, 
     TRUE, 2),
    
    (v_tenant_id, 'CoPay', 'Co-Pay Patient', 'Insurance with patient co-payment', 
     '{"requires_pre_authorization": true, "patient_pays_percentage": 20, "required_documents": ["Insurance Card", "ID Proof"], "copay_due_at": "admission", "billing_mode": "split"}'::JSONB, 
     TRUE, 3),
    
    (v_tenant_id, 'ESH', 'ESH (Employee State Health)', 'ESH government scheme', 
     '{"requires_claim_form": true, "claim_forms": ["ESH Form 1", "ESH Form 2"], "required_documents": ["ESH Card", "Employee ID", "Salary Slip"], "zero_advance_payment": true, "billing_mode": "direct_billing"}'::JSONB, 
     TRUE, 4),
    
    (v_tenant_id, 'CGHS', 'CGHS (Central Govt Health Scheme)', 'CGHS government scheme', 
     '{"requires_pre_approval": true, "approval_authority": "CGHS Wellness Center", "required_documents": ["CGHS Card", "Referral from CGHS Dispensary"], "zero_advance_payment": true, "billing_mode": "reimbursement"}'::JSONB, 
     TRUE, 5),
    
    (v_tenant_id, 'Arograshree', 'Arograshree (Karnataka State Scheme)', 'Karnataka state health scheme for BPL families', 
     '{"requires_pre_approval": true, "approval_authority": "District Health Officer", "income_certificate_required": true, "required_documents": ["Income Certificate", "Ration Card", "ID Proof"], "zero_advance_payment": true, "billing_mode": "government_reimbursement"}'::JSONB, 
     TRUE, 6),
    
    (v_tenant_id, 'SGHS', 'SGHS (State Govt Health Scheme)', 'State government employee health scheme', 
     '{"requires_departmental_approval": true, "required_documents": ["SGHS Card", "Employee ID"], "zero_advance_payment": true, "billing_mode": "direct_billing"}'::JSONB, 
     TRUE, 7),
    
    (v_tenant_id, 'Camp', 'Camp Patient (Sponsored)', 'Free surgery camp sponsored by NGO/CSR', 
     '{"zero_cost_surgery": true, "sponsor": "NGO/CSR", "required_documents": ["Camp Registration Form", "Income Certificate"], "zero_advance_payment": true, "billing_mode": "sponsored"}'::JSONB, 
     TRUE, 8),
    
    (v_tenant_id, 'Railway', 'Railway (ECHS)', 'Ex-Servicemen Contributory Health Scheme via Railway Board', 
     '{"requires_pre_approval": true, "approval_authority": "Railway Board Medical Officer", "required_documents": ["ECHS Card", "Railway Employee ID", "Referral Letter"], "zero_advance_payment": true, "billing_mode": "direct_billing"}'::JSONB, 
     TRUE, 9),
    
    (v_tenant_id, 'Free', 'Free / Subsidised', 'Free or highly subsidised treatment for economically weaker sections', 
     '{"zero_advance_payment": true, "total_amount_zero": true, "requires_income_proof": true, "required_documents": ["Income Certificate", "Ration Card / BPL Card", "Aadhaar Card"], "billing_mode": "free"}'::JSONB, 
     TRUE, 10);
    
    RAISE NOTICE 'Successfully inserted 10 patient type configurations for tenant %', v_tenant_id;
END $$;

-- Verify the insert
SELECT patient_type, display_name, is_active 
FROM patient_type_configurations 
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
ORDER BY display_order;
