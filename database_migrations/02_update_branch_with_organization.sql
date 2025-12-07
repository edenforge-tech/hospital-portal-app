-- =====================================================
-- MIGRATION: UPDATE BRANCH TABLE WITH ORGANIZATION_ID
-- =====================================================
-- Purpose: Add organization_id foreign key to branch table
-- Links: Branch → Organization → Tenant
-- Date: December 7, 2025
-- =====================================================

BEGIN;

-- =====================================================
-- ADD ORGANIZATION_ID COLUMN TO BRANCH
-- =====================================================

ALTER TABLE branch ADD COLUMN IF NOT EXISTS organization_id UUID;

-- Add foreign key constraint
ALTER TABLE branch 
    ADD CONSTRAINT fk_branch_organization 
    FOREIGN KEY (organization_id) 
    REFERENCES organization(id) 
    ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_branch_organization_id ON branch(organization_id);

-- =====================================================
-- UPDATE BRANCH TABLE - ADD LOCALIZATION COLUMNS
-- =====================================================

-- Add branch-level localization overrides (optional, inherits from organization)
ALTER TABLE branch ADD COLUMN IF NOT EXISTS timezone VARCHAR(100);
ALTER TABLE branch ADD COLUMN IF NOT EXISTS currency VARCHAR(3);
ALTER TABLE branch ADD COLUMN IF NOT EXISTS language VARCHAR(10);
ALTER TABLE branch ADD COLUMN IF NOT EXISTS date_format VARCHAR(20);
ALTER TABLE branch ADD COLUMN IF NOT EXISTS time_format VARCHAR(10);

-- Add branch contact info if not exists
ALTER TABLE branch ADD COLUMN IF NOT EXISTS email VARCHAR(200);
ALTER TABLE branch ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE branch ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE branch ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);

-- =====================================================
-- CREATE DEFAULT ORGANIZATIONS FOR EXISTING TENANTS
-- =====================================================

-- For each existing tenant, create a default organization
-- This ensures existing branches can be linked to an organization

INSERT INTO organization (
    id,
    tenant_id,
    name,
    organization_code,
    organization_name,
    country_code,
    timezone,
    currency_code,
    language_code,
    date_format,
    time_format,
    status,
    is_active,
    created_at
)
SELECT 
    gen_random_uuid(),
    t.id,
    t.name || ' - Default',
    'ORG-DEFAULT',
    t.name || ' - Default Organization',
    'IND', -- Default to India, can be updated later
    'Asia/Kolkata',
    'INR',
    'en',
    'DD-MM-YYYY',
    '24h',
    'Active',
    true,
    CURRENT_TIMESTAMP
FROM tenant t
WHERE NOT EXISTS (
    SELECT 1 
    FROM organization o 
    WHERE o.tenant_id = t.id 
    AND o.organization_code = 'ORG-DEFAULT'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- LINK EXISTING BRANCHES TO DEFAULT ORGANIZATIONS
-- =====================================================

-- Update branches without organization_id to link to default organization
UPDATE branch b
SET organization_id = o.id
FROM organization o
WHERE b.tenant_id = o.tenant_id
  AND o.organization_code = 'ORG-DEFAULT'
  AND b.organization_id IS NULL;

-- =====================================================
-- MAKE ORGANIZATION_ID NOT NULL
-- =====================================================

-- Now that all branches are linked, make organization_id required
ALTER TABLE branch ALTER COLUMN organization_id SET NOT NULL;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON COLUMN branch.organization_id IS 'Parent organization - regional/state-level entity';
COMMENT ON COLUMN branch.timezone IS 'Branch-specific timezone override (inherits from organization if null)';
COMMENT ON COLUMN branch.currency IS 'Branch-specific currency override (inherits from organization if null)';
COMMENT ON COLUMN branch.language IS 'Branch-specific language override (inherits from organization if null)';

COMMIT;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check branch table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'branch'
AND column_name IN ('organization_id', 'timezone', 'currency', 'language')
ORDER BY ordinal_position;

-- Verify all branches have organizations
SELECT 
    COUNT(*) as total_branches,
    COUNT(organization_id) as branches_with_org,
    COUNT(*) FILTER (WHERE organization_id IS NULL) as branches_without_org
FROM branch;

-- Show organization-branch relationships
SELECT 
    o.organization_name,
    o.country_code,
    COUNT(b.id) as branch_count
FROM organization o
LEFT JOIN branch b ON b.organization_id = o.id
GROUP BY o.id, o.organization_name, o.country_code
ORDER BY o.organization_name;
