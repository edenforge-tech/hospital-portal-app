-- Fix the audit trigger function to properly cast user_id to UUID
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (
        tenant_id,
        table_name,
        record_id,
        operation,
        old_values,
        new_values,
        changed_fields,
        user_id,
        user_name,
        session_id,
        transaction_id
    ) VALUES (
        COALESCE(NEW.tenant_id, OLD.tenant_id, '550e8400-e29b-41d4-a716-446655440000'),
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
        '{"fields": []}'::jsonb,
        NULLIF(current_setting('app.user_id', true), '')::uuid,
        NULLIF(current_setting('app.user_name', true), ''),
        NULLIF(current_setting('app.session_id', true), ''),
        txid_current()::TEXT
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;