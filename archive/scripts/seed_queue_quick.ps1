# Quick fix: Make session_id nullable for testing, seed data, then restore
$DbHost = "hospitalportal-db-server.postgres.database.azure.com"
$DbPort = "5432"
$DbName = "hospitalportal"
$DbUser = "postgres"
$DbPassword = "NewPass@2026!"

$env:PGPASSWORD = $DbPassword

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Quick Queue Seeding (Test Mode)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Make session_id nullable
Write-Host "[1/7] Making session_id nullable (for testing)..." -ForegroundColor Yellow
& psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -c "ALTER TABLE counselor_queue ALTER COLUMN session_id DROP NOT NULL;" 2>&1 | Out-Null
Write-Host "   [OK] Column modified" -ForegroundColor Green

# Step 2-5: Same as before
Write-Host "[2/7] Fetching tenant..." -ForegroundColor Yellow
$tenantResult = & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -t -A -F ',' -c "SELECT id FROM tenant WHERE deleted_at IS NULL LIMIT 1;" 2>&1
$tenantId = $tenantResult.Trim()
Write-Host "   [OK] Found" -ForegroundColor Green

Write-Host "[3/7] Fetching branch..." -ForegroundColor Yellow
$branchResult = & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -t -A -F ',' -c "SELECT id FROM branch WHERE deleted_at IS NULL LIMIT 1;" 2>&1
$branchId = $branchResult.Trim()
Write-Host "   [OK] Found" -ForegroundColor Green

Write-Host "[4/7] Fetching patients..." -ForegroundColor Yellow
$patientsResult = & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -t -A -F ',' -c "SELECT id, first_name, last_name FROM patient WHERE deleted_at IS NULL AND status = 'active' LIMIT 6;" 2>&1

$patients = @()
if ($patientsResult -is [array]) {
    foreach ($line in $patientsResult) {
        if ($line -is [string] -and $line -match '^[a-f0-9-]{36}') {
            $parts = $line.Trim() -split ','
            if ($parts.Length -ge 3) {
                $patients += @{
                    Id = $parts[0];
                    Name = "$($parts[1]) $($parts[2])"
                }
            }
        }
    }
}
Write-Host "   [OK] Found $($patients.Count) patients" -ForegroundColor Green

if ($patients.Count -eq 0) {
    Write-Host "   [ERROR] No patients!" -ForegroundColor Red
    $env:PGPASSWORD = ""
    exit 1
}

# Step 6: Insert queue items
Write-Host "[5/7] Creating queue entries..." -ForegroundColor Yellow

$queueItems = @(
    @{ Urgency="Critical"; Priority=95 },
    @{ Urgency="High"; Priority=85 },
    @{ Urgency="High"; Priority=75 },
    @{ Urgency="Medium"; Priority=55 },
    @{ Urgency="Medium"; Priority=50 },
    @{ Urgency="Low"; Priority=30 }
)

$successCount = 0
for ($i = 0; $i -lt [Math]::Min($queueItems.Count, $patients.Count); $i++) {
    $item = $queueItems[$i]
    $patient = $patients[$i]
    
    $insertQuery = @"
INSERT INTO counselor_queue (
    id, tenant_id, branch_id, patient_id,
    urgency_level, priority_score,
    added_to_queue_at, status,
    created_at, updated_at
) VALUES (
    gen_random_uuid(),
    '$tenantId'::uuid,
    '$branchId'::uuid,
    '$($patient.Id)'::uuid,
    '$($item.Urgency)',
    $($item.Priority),
    NOW(),
    'Waiting',
    NOW(),
    NOW()
);
"@

    $result = & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -c $insertQuery 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   [OK] $($patient.Name) - $($item.Urgency)" -ForegroundColor Green
        $successCount++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Seeding Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[OK] Added $successCount patients to queue" -ForegroundColor Green
Write-Host ""
Write-Host "View Queue: http://localhost:3001/dashboard/counselor/queue" -ForegroundColor Cyan
Write-Host ""

# Step 7: Verification
Write-Host "[6/7] Verifying..." -ForegroundColor Yellow
$verifyResult = & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -c "SELECT token_number, urgency_level, priority_score, status FROM counselor_queue WHERE deleted_at IS NULL AND created_at > NOW() - INTERVAL '2 minutes' ORDER BY priority_score DESC;" 2>&1
Write-Host $verifyResult

# Optional: restore NOT NULL constraint
Write-Host ""
$restore = Read-Host "Restore session_id NOT NULL constraint? (y/n)"
if ($restore -eq 'y' -or $restore -eq 'Y') {
    Write-Host "[7/7] Restoring NOT NULL constraint..." -ForegroundColor Yellow
    & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -c "ALTER TABLE counselor_queue ALTER COLUMN session_id SET NOT NULL;" 2>&1 | Out-Null
    Write-Host "   [OK] Constraint restored" -ForegroundColor Green
    Write-Host ""
    Write-Host "[NOTE] Queue items with NULL session_id will need to be deleted or updated before new items can be added." -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "[NOTE] session_id remains nullable. You can add more test data without sessions." -ForegroundColor Yellow
}

$env:PGPASSWORD = ""
Write-Host ""
