CREATE OR REPLACE FUNCTION generate_pre_auth_number()
RETURNS TRIGGER AS $$
DECLARE
    v_branch_code VARCHAR(50);
    v_sequence INTEGER;
BEGIN
    SELECT branch_code INTO v_branch_code FROM branch WHERE id = NEW.branch_id;
    v_branch_code := COALESCE(v_branch_code, 'HQ');
    
    SELECT COUNT(*) + 1 INTO v_sequence
    FROM insurance_pre_authorizations
    WHERE branch_id = NEW.branch_id
    AND DATE(created_at) = CURRENT_DATE
    AND deleted_at IS NULL;
    
    NEW.pre_auth_number := 'PREAUTH-' || v_branch_code || '-' || 
        TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
        LPAD(v_sequence::TEXT, 4, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
