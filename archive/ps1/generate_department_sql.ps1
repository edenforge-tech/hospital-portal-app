# Generate SQL INSERT statements for user_department_access from CSV
# This script reads user_department_mappings.csv and generates SQL to insert into PostgreSQL

$csvPath = "c:\Users\Sam Aluri\Downloads\Hospital Portal\user_department_mappings.csv"
$outputPath = "c:\Users\Sam Aluri\Downloads\Hospital Portal\insert_department_mappings.sql"

$tenantId = "11111111-1111-1111-1111-111111111111"
$adminUserId = "fc6b9fc9-2b6d-4166-b844-471d5dc47aa4"  # System Administrator

Write-Host "Reading CSV file..." -ForegroundColor Cyan
$mappings = Import-Csv $csvPath

Write-Host "Found $($mappings.Count) mappings" -ForegroundColor Green
Write-Host "Generating SQL INSERT statements..." -ForegroundColor Cyan

$sql = @"
-- =============================================
-- Insert User-Department Mappings
-- Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
-- Total Mappings: $($mappings.Count)
-- =============================================

-- Set tenant context for RLS
SET app.current_tenant_id = '$tenantId';

-- Begin transaction
BEGIN;

"@

foreach ($mapping in $mappings) {
    $id = [guid]::NewGuid().ToString()
    $userId = $mapping.UserId
    $departmentId = $mapping.DepartmentId
    $roleId = $mapping.RoleId
    $userName = $mapping.UserName.Replace("'", "''")  # Escape single quotes
    $departmentName = $mapping.Department.Replace("'", "''")
    
    $sql += @"

-- $userName → $departmentName
INSERT INTO user_department_access (
    id,
    tenant_id,
    user_id,
    department_id,
    role_id,
    is_primary,
    access_level,
    status,
    valid_from,
    assigned_on,
    assigned_by,
    created_at,
    created_by,
    updated_at,
    updated_by
) VALUES (
    '$id',
    '$tenantId',
    '$userId',
    '$departmentId',
    '$roleId',
    true,  -- is_primary
    'Full',  -- access_level
    'active',
    NOW(),  -- valid_from
    NOW(),  -- assigned_on
    '$adminUserId',  -- assigned_by
    NOW(),  -- created_at
    '$adminUserId',  -- created_by
    NOW(),  -- updated_at
    '$adminUserId'  -- updated_by
);

"@
}

$sql += @"

-- Commit transaction
COMMIT;

-- Verification Query
SELECT 
    u.user_name,
    u.first_name || ' ' || u.last_name as full_name,
    d.department_name,
    r.name as role_name,
    uda.access_level,
    uda.is_primary,
    uda.status
FROM user_department_access uda
INNER JOIN "AspNetUsers" u ON uda.user_id = u."Id"
INNER JOIN department d ON uda.department_id = d.id
INNER JOIN "AspNetRoles" r ON uda.role_id = r."Id"
WHERE uda.tenant_id = '$tenantId'
    AND uda.deleted_at IS NULL
ORDER BY d.department_name, u.first_name;

-- Summary Count
SELECT 
    d.department_name,
    COUNT(*) as staff_count
FROM user_department_access uda
INNER JOIN department d ON uda.department_id = d.id
WHERE uda.tenant_id = '$tenantId'
    AND uda.deleted_at IS NULL
GROUP BY d.department_name
ORDER BY staff_count DESC, d.department_name;

SELECT 'Total user-department mappings: ' || COUNT(*) as summary
FROM user_department_access
WHERE tenant_id = '$tenantId' AND deleted_at IS NULL;
"@

# Save SQL file
$sql | Out-File -FilePath $outputPath -Encoding UTF8

Write-Host ""
Write-Host "✓ SQL script generated successfully!" -ForegroundColor Green
Write-Host "Output: $outputPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "To execute in Azure Data Studio or psql:" -ForegroundColor Yellow
Write-Host "  \i $outputPath" -ForegroundColor White
Write-Host ""
Write-Host "Or using psql command line:" -ForegroundColor Yellow
Write-Host "  psql -h HOST -U USER -d hospitalportal -f insert_department_mappings.sql" -ForegroundColor White
