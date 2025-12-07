# Generate Branch Assignments for 70 Users
# Distributes staff across 6 branches (~12 per branch)

$csvPath = "c:\Users\Sam Aluri\Downloads\Hospital Portal\user_department_mappings.csv"
$outputPath = "c:\Users\Sam Aluri\Downloads\Hospital Portal\insert_branch_assignments.sql"

$tenantId = "11111111-1111-1111-1111-111111111111"
$adminUserId = "fc6b9fc9-2b6d-4166-b844-471d5dc47aa4"

# Branch IDs from database
$branches = @(
    @{ Id = "4fb10088-b825-4a53-8e91-b7b66bad46bc"; Name = "Sankara Nethralaya - Chennai Main" }
    @{ Id = "5e0e2c22-4df8-4981-b43f-c2c789d12e4d"; Name = "Sankara Nethralaya - Chennai Nungambakkam" }
    @{ Id = "7c3f9a5b-2e4d-4c78-9f0a-d4e8f1a2b3c4"; Name = "Aravind Eye Hospital - Madurai" }
    @{ Id = "8d4g0b6c-3f5e-5d89-0g1b-e5f9g2b4d5e6"; Name = "Aravind Eye Hospital - Pondicherry" }
    @{ Id = "9e5h1c7d-4g6f-6e90-1h2c-f6g0h3c5e7f8"; Name = "LVPEI - Hyderabad Banjara Hills" }
    @{ Id = "0f6i2d8e-5h7g-7f01-2i3d-g7h1i4d6f8g9"; Name = "LVPEI - Hyderabad Kallam Anji Reddy" }
)

Write-Host "Reading user mappings..." -ForegroundColor Cyan
$mappings = Import-Csv $csvPath

Write-Host "Found $($mappings.Count) users" -ForegroundColor Green
Write-Host "Distributing across $($branches.Count) branches..." -ForegroundColor Cyan

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$totalUsers = $mappings.Count
$totalBranches = $branches.Count

$sqlHeader = @"
-- =============================================
-- Insert User-Branch Assignments
-- Generated: $timestamp
-- Total Users: $totalUsers
-- Total Branches: $totalBranches
-- =============================================

SET app.current_tenant_id = '$tenantId';

BEGIN;


"@

$sql = New-Object System.Text.StringBuilder
$null = $sql.Append($sqlHeader)

# Distribute users round-robin across branches
$branchIndex = 0
$branchCounts = @{}
foreach ($branch in $branches) {
    $branchCounts[$branch.Id] = 0
}

foreach ($mapping in $mappings) {
    $userId = $mapping.UserId
    $userName = $mapping.UserName.Replace("'", "''")
    $branch = $branches[$branchIndex]
    $branchId = $branch.Id
    $branchName = $branch.Name
    
    $id = [guid]::NewGuid()
    
    $insertSql = @"

-- $userName -> $branchName
INSERT INTO user_branch_access (
    id,
    tenant_id,
    user_id,
    branch_id,
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
    '$branchId',
    true,
    'Full',
    'active',
    NOW(),
    NOW(),
    '$adminUserId',
    NOW(),
    '$adminUserId',
    NOW(),
    '$adminUserId'
);

"@
    
    $null = $sql.Append($insertSql)
    $branchCounts[$branchId]++
    $branchIndex = ($branchIndex + 1) % $branches.Count
}

$sqlFooter = @"

COMMIT;

-- Verification Query
SELECT 
    b.name as branch_name,
    u.user_name,
    u.first_name || ' ' || u.last_name as full_name,
    uba.access_level,
    uba.is_primary,
    uba.status
FROM user_branch_access uba
INNER JOIN "AspNetUsers" u ON uba.user_id = u."Id"
INNER JOIN branch b ON uba.branch_id = b.id
WHERE uba.tenant_id = '$tenantId'
    AND uba.deleted_at IS NULL
ORDER BY b.name, u.first_name;

-- Summary Count by Branch
SELECT 
    b.name as branch_name,
    COUNT(*) as staff_count
FROM user_branch_access uba
INNER JOIN branch b ON uba.branch_id = b.id
WHERE uba.tenant_id = '$tenantId'
    AND uba.deleted_at IS NULL
GROUP BY b.name
ORDER BY staff_count DESC, b.name;

SELECT COUNT(*) as total_assignments
FROM user_branch_access
WHERE tenant_id = '$tenantId' AND deleted_at IS NULL;
"@

$null = $sql.Append($sqlFooter)

# Save SQL file
$sql.ToString() | Out-File -FilePath $outputPath -Encoding UTF8

Write-Host ""
Write-Host "SQL script generated successfully!" -ForegroundColor Green
Write-Host "Output: $outputPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "Branch Distribution:" -ForegroundColor Yellow
foreach ($branch in $branches) {
    $count = $branchCounts[$branch.Id]
    Write-Host "  $($branch.Name): $count staff" -ForegroundColor White
}
Write-Host ""
Write-Host "Total assignments: $totalUsers" -ForegroundColor Green
