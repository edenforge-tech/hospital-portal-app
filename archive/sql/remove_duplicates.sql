-- ============================================
-- Remove Duplicate Permissions
-- Keep only ONE instance per unique Code
-- Priority: Keep newest (largest id) entry
-- ============================================

-- Step 1: Identify duplicates to DELETE (keep the newest one)
WITH ranked_permissions AS (
    SELECT 
        id,
        "Code",
        "TenantId",
        ROW_NUMBER() OVER (PARTITION BY "Code" ORDER BY "CreatedAt" DESC, id DESC) as rn
    FROM permissions
)
DELETE FROM permissions
WHERE id IN (
    SELECT id 
    FROM ranked_permissions 
    WHERE rn > 1
);

-- Step 2: Verify cleanup
SELECT 
    COUNT(*) as total_rows,
    COUNT(DISTINCT "Code") as unique_codes,
    COUNT(*) - COUNT(DISTINCT "Code") as remaining_duplicates
FROM permissions;

-- Step 3: Show remaining permission counts by module
SELECT "Module", COUNT(*) as count
FROM permissions
GROUP BY "Module"
ORDER BY "Module";

-- Step 4: Show which codes still have duplicates (should be 0)
SELECT "Code", COUNT(*) as duplicate_count
FROM permissions
GROUP BY "Code"
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, "Code";
