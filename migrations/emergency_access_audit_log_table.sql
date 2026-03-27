-- Emergency Access Audit Log Table Migration
-- Tracks all actions performed during emergency access sessions for HIPAA compliance

DO $$ 
BEGIN
    -- Create emergency_access_audit_log table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'emergency_access_audit_log') THEN
        CREATE TABLE emergency_access_audit_log (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            emergency_access_id UUID NOT NULL,
            user_id UUID NOT NULL,
            action VARCHAR(200) NOT NULL,
            resource_type VARCHAR(100) NOT NULL,
            resource_id VARCHAR(100) NOT NULL,
            details TEXT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            ip_address VARCHAR(45),
            user_agent TEXT,
            tenant_id UUID NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            created_by_user_id UUID,
            
            -- Foreign keys
            CONSTRAINT fk_emergency_access_audit_emergency_access 
                FOREIGN KEY (emergency_access_id) 
                REFERENCES emergency_access(id) 
                ON DELETE CASCADE,
            CONSTRAINT fk_emergency_access_audit_user 
                FOREIGN KEY (user_id) 
                REFERENCES "AspNetUsers"(id) 
                ON DELETE CASCADE,
            CONSTRAINT fk_emergency_access_audit_tenant 
                FOREIGN KEY (tenant_id) 
                REFERENCES tenant(id) 
                ON DELETE CASCADE
        );

        -- Create indexes for performance
        CREATE INDEX idx_emergency_access_audit_emergency_access_id 
            ON emergency_access_audit_log(emergency_access_id);
        CREATE INDEX idx_emergency_access_audit_user_id 
            ON emergency_access_audit_log(user_id);
        CREATE INDEX idx_emergency_access_audit_timestamp 
            ON emergency_access_audit_log(timestamp DESC);
        CREATE INDEX idx_emergency_access_audit_tenant_id 
            ON emergency_access_audit_log(tenant_id);
        
        RAISE NOTICE 'Created emergency_access_audit_log table with indexes';
    ELSE
        RAISE NOTICE 'emergency_access_audit_log table already exists';
    END IF;
END $$;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON emergency_access_audit_log TO PUBLIC;

COMMENT ON TABLE emergency_access_audit_log IS 'Audit trail of all actions performed during emergency access sessions - HIPAA compliance requirement';
COMMENT ON COLUMN emergency_access_audit_log.emergency_access_id IS 'Reference to the emergency access session';
COMMENT ON COLUMN emergency_access_audit_log.action IS 'Action performed (e.g., VIEW_PATIENT, EDIT_RECORD, ACCESS_PHI)';
COMMENT ON COLUMN emergency_access_audit_log.resource_type IS 'Type of resource accessed (Patient, Record, Document)';
COMMENT ON COLUMN emergency_access_audit_log.resource_id IS 'ID of the resource accessed';
COMMENT ON COLUMN emergency_access_audit_log.timestamp IS 'When the action was performed';
