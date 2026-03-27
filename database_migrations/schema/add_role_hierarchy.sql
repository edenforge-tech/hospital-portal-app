-- ============================================
-- ROLE HIERARCHY IMPLEMENTATION
-- Add parent_role_id column to app_roles table
-- Created: January 26, 2026
-- ============================================

\echo ''
\echo '🔧 Adding Role Hierarchy Support...'
\echo ''

-- Step 1: Check if column already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'app_roles' AND column_name = 'parent_role_id'
    ) THEN
        -- Add parent_role_id column
        ALTER TABLE app_roles 
        ADD COLUMN parent_role_id UUID NULL;
        
        RAISE NOTICE '✓ Added parent_role_id column to app_roles table';
    ELSE
        RAISE NOTICE '⚠ parent_role_id column already exists, skipping...';
    END IF;
END $$;

-- Step 2: Add foreign key constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'FK_app_roles_parent_role'
    ) THEN
        ALTER TABLE app_roles
        ADD CONSTRAINT FK_app_roles_parent_role 
        FOREIGN KEY (parent_role_id) REFERENCES app_roles(id) 
        ON DELETE SET NULL;
        
        RAISE NOTICE '✓ Added foreign key constraint FK_app_roles_parent_role';
    ELSE
        RAISE NOTICE '⚠ Foreign key constraint already exists, skipping...';
    END IF;
END $$;

-- Step 3: Add index for performance
CREATE INDEX IF NOT EXISTS IX_app_roles_parent_role_id 
ON app_roles(parent_role_id);

RAISE NOTICE '✓ Added index on parent_role_id';

-- Step 4: Add hierarchy_level column (for easier querying)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'app_roles' AND column_name = 'hierarchy_level'
    ) THEN
        ALTER TABLE app_roles 
        ADD COLUMN hierarchy_level INTEGER DEFAULT 0;
        
        RAISE NOTICE '✓ Added hierarchy_level column to app_roles table';
    ELSE
        RAISE NOTICE '⚠ hierarchy_level column already exists, skipping...';
    END IF;
END $$;

-- Step 5: Create function to calculate hierarchy level
CREATE OR REPLACE FUNCTION calculate_role_hierarchy_level(role_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    parent_uuid UUID;
    level_count INTEGER := 0;
    max_depth INTEGER := 10; -- Prevent infinite loops
BEGIN
    -- Get parent role ID
    SELECT parent_role_id INTO parent_uuid
    FROM app_roles
    WHERE id = role_uuid;
    
    -- Traverse up the hierarchy
    WHILE parent_uuid IS NOT NULL AND level_count < max_depth LOOP
        level_count := level_count + 1;
        
        SELECT parent_role_id INTO parent_uuid
        FROM app_roles
        WHERE id = parent_uuid;
    END LOOP;
    
    RETURN level_count;
END;
$$ LANGUAGE plpgsql;

\echo '✓ Created calculate_role_hierarchy_level function'

-- Step 6: Create trigger to auto-update hierarchy_level
CREATE OR REPLACE FUNCTION update_role_hierarchy_level()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate and set hierarchy level
    NEW.hierarchy_level := calculate_role_hierarchy_level(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_role_hierarchy_level ON app_roles;

CREATE TRIGGER trg_update_role_hierarchy_level
BEFORE INSERT OR UPDATE OF parent_role_id ON app_roles
FOR EACH ROW
EXECUTE FUNCTION update_role_hierarchy_level();

\echo '✓ Created trigger trg_update_role_hierarchy_level'

-- Step 7: Update existing roles to have hierarchy_level = 0
UPDATE app_roles
SET hierarchy_level = 0
WHERE parent_role_id IS NULL AND hierarchy_level IS NULL;

\echo '✓ Updated existing roles with hierarchy_level = 0'

-- Step 8: Create view for role hierarchy
CREATE OR REPLACE VIEW v_role_hierarchy AS
WITH RECURSIVE role_tree AS (
    -- Base case: root roles (no parent)
    SELECT 
        id,
        name,
        parent_role_id,
        hierarchy_level,
        ARRAY[name] AS path,
        name AS root_role
    FROM app_roles
    WHERE parent_role_id IS NULL AND deleted_at IS NULL
    
    UNION ALL
    
    -- Recursive case: child roles
    SELECT 
        r.id,
        r.name,
        r.parent_role_id,
        r.hierarchy_level,
        rt.path || r.name,
        rt.root_role
    FROM app_roles r
    INNER JOIN role_tree rt ON r.parent_role_id = rt.id
    WHERE r.deleted_at IS NULL
)
SELECT 
    id,
    name,
    parent_role_id,
    hierarchy_level,
    path,
    root_role,
    array_to_string(path, ' → ') AS full_path
FROM role_tree
ORDER BY path;

\echo '✓ Created v_role_hierarchy view'

-- Step 9: Verification query
\echo ''
\echo '📊 Verification Results:'
\echo ''

SELECT 
    'app_roles' AS table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'app_roles' 
    AND column_name IN ('parent_role_id', 'hierarchy_level')
ORDER BY ordinal_position;

\echo ''
\echo '✅ Role Hierarchy Database Changes Complete!'
\echo ''
\echo 'New Features:'
\echo '  - parent_role_id column (UUID, nullable)'
\echo '  - hierarchy_level column (INTEGER, auto-calculated)'
\echo '  - FK constraint with ON DELETE SET NULL'
\echo '  - Index on parent_role_id'
\echo '  - Auto-update trigger for hierarchy_level'
\echo '  - v_role_hierarchy view for querying hierarchy'
\echo ''
