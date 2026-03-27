-- Fix audit trigger to include ALL required columns including "Timestamp"
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_log (
            id,
            tenant_id,
            user_id,
            resource_type,
            action,
            resource_id,
            old_values,
            created_at,
            "Timestamp"
        ) VALUES (
            gen_random_uuid(),
            OLD.tenant_id,
            COALESCE(current_setting('app.current_user_id', true)::uuid, '00000000-0000-0000-0000-000000000000'::uuid),
            TG_TABLE_NAME,
            TG_OP,
            OLD.id,
            row_to_json(OLD)::text,
            NOW(),
            NOW()
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_log (
            id,
            tenant_id,
            user_id,
            resource_type,
            action,
            resource_id,
            old_values,
            new_values,
            created_at,
            "Timestamp"
        ) VALUES (
            gen_random_uuid(),
            NEW.tenant_id,
            COALESCE(current_setting('app.current_user_id', true)::uuid, '00000000-0000-0000-0000-000000000000'::uuid),
            TG_TABLE_NAME,
            TG_OP,
            NEW.id,
            row_to_json(OLD)::text,
            row_to_json(NEW)::text,
            NOW(),
            NOW()
        );
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_log (
            id,
            tenant_id,
            user_id,
            resource_type,
            action,
            resource_id,
            new_values,
            created_at,
            "Timestamp"
        ) VALUES (
            gen_random_uuid(),
            NEW.tenant_id,
            COALESCE(current_setting('app.current_user_id', true)::uuid, '00000000-0000-0000-0000-000000000000'::uuid),
            TG_TABLE_NAME,
            TG_OP,
            NEW.id,
            row_to_json(NEW)::text,
            NOW(),
            NOW()
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
