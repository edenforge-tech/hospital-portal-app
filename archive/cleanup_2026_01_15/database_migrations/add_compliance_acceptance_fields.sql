-- =============================================
-- Add HIPAA Compliance Acceptance Fields to AspNetUsers
-- Purpose: Track terms, privacy, and HIPAA acknowledgment during activation
-- HIPAA Requirement: Must maintain audit trail of all compliance acceptances
-- =============================================

-- Add compliance acceptance columns
ALTER TABLE "AspNetUsers" 
ADD COLUMN IF NOT EXISTS accepted_terms BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS accepted_terms_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS accepted_privacy BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS accepted_privacy_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS accepted_hipaa BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS accepted_hipaa_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS compliance_acceptance_ip VARCHAR(50);

-- Create index for compliance auditing queries
CREATE INDEX IF NOT EXISTS idx_aspnetusers_compliance 
ON "AspNetUsers"(accepted_terms, accepted_privacy, accepted_hipaa, accepted_terms_at);

-- Add comment for documentation
COMMENT ON COLUMN "AspNetUsers".accepted_terms IS 'User accepted Terms of Service - required for activation';
COMMENT ON COLUMN "AspNetUsers".accepted_privacy IS 'User accepted Privacy Policy - required for GDPR compliance';
COMMENT ON COLUMN "AspNetUsers".accepted_hipaa IS 'User acknowledged HIPAA Security Training - required for PHI access';
COMMENT ON COLUMN "AspNetUsers".compliance_acceptance_ip IS 'IP address where compliance was accepted - audit trail';

-- Audit log entry
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_log') THEN
        INSERT INTO audit_log (
            id, tenant_id, table_name, operation, 
            new_values, changed_by, changed_at, ip_address
        ) VALUES (
            gen_random_uuid(),
            '00000000-0000-0000-0000-000000000000'::uuid,
            'AspNetUsers',
            'ALTER_TABLE',
            jsonb_build_object(
                'change', 'Added HIPAA compliance acceptance fields',
                'columns', ARRAY['accepted_terms', 'accepted_privacy', 'accepted_hipaa'],
                'reason', 'HIPAA compliance requirement for activation flow'
            ),
            'SYSTEM',
            NOW(),
            'DATABASE_MIGRATION'
        );
    END IF;
END $$;

-- Verification query (run this to confirm migration)
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'AspNetUsers' 
-- AND column_name LIKE '%accepted%'
-- ORDER BY column_name;
