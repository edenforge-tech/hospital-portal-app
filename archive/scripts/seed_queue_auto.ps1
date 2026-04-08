# Auto-seed counselor queue using database credentials
# No prompts - runs directly

$DbHost = "hospitalportal-db-server.postgres.database.azure.com"
$DbPort = "5432"
$DbName = "hospitalportal"
$DbUser = "postgres"
$DbPassword = "NewPass@2026!"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Counselor Queue Auto-Seeder" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Connecting to: $DbHost" -ForegroundColor Gray
Write-Host "Database: $DbName" -ForegroundColor Gray
Write-Host ""

# Set PostgreSQL environment variable
$env:PGPASSWORD = $DbPassword

Write-Host "[1/5] Fetching tenant..." -ForegroundColor Yellow
$tenantQuery = "SELECT id, name FROM tenant WHERE deleted_at IS NULL LIMIT 1;"
$tenantResult = & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -t -A -F ',' -c $tenantQuery 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Database connection failed!" -ForegroundColor Red
    Write-Host $tenantResult
    $env:PGPASSWORD = ""
    exit 1
}

$tenantParts = $tenantResult.Trim() -split ','
$tenantId = $tenantParts[0]
$tenantName = if ($tenantParts.Length -gt 1) { $tenantParts[1] } else { "Unknown" }
Write-Host "   Found: $tenantName" -ForegroundColor Green

Write-Host "[2/5] Fetching branch..." -ForegroundColor Yellow
$branchQuery = "SELECT id, name FROM branch WHERE deleted_at IS NULL LIMIT 1;"
$branchResult = & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -t -A -F ',' -c $branchQuery 2>&1
$branchParts = $branchResult.Trim() -split ','
$branchId = $branchParts[0]
$branchName = if ($branchParts.Length -gt 1) { $branchParts[1] } else { "Unknown" }
Write-Host "   Found: $branchName" -ForegroundColor Green

Write-Host "[3/5] Fetching user (counselor)..." -ForegroundColor Yellow
$userQuery = 'SELECT id, user_name FROM "AspNetUsers" LIMIT 1;'
$userResult = & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -t -A -F ',' -c $userQuery 2>&1
if ($userResult -is [string]) {
    $userParts = $userResult.Trim() -split ','
    $userId = $userParts[0]
    $userName = if ($userParts.Length -gt 1) { $userParts[1] } else { "Unknown" }
} else {
    # Error occurred, use first result
    $userId = ($userResult | Select-Object -First 1).ToString().Trim() -split ',' | Select-Object -First 1
    $userName = "User"
}
Write-Host "   Found: $userName" -ForegroundColor Green

Write-Host "[4/5] Fetching patients..." -ForegroundColor Yellow
$patientsQuery = "SELECT id, first_name, last_name, medical_record_number FROM patient WHERE deleted_at IS NULL AND status = 'active' LIMIT 6;"
$patientsResult = & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -t -A -F ',' -c $patientsQuery 2>&1

$patients = @()
if ($patientsResult -is [array]) {
    foreach ($line in $patientsResult) {
        if ($line -is [string]) {
            $line = $line.Trim()
            if (![string]::IsNullOrWhiteSpace($line) -and $line -match '^[a-f0-9-]{36}') {
                $parts = $line -split ','
                if ($parts.Length -ge 4) {
                    $patients += @{
                        Id = $parts[0]
                        FirstName = $parts[1]
                        LastName = $parts[2]
                        MRN = $parts[3]
                    }
                }
            }
        }
    }
} elseif ($patientsResult -is [string]) {
    $line = $patientsResult.Trim()
    if (![string]::IsNullOrWhiteSpace($line) -and $line -match '^[a-f0-9-]{36}') {
        $parts = $line -split ','
        if ($parts.Length -ge 4) {
            $patients += @{
                Id = $parts[0]
                FirstName = $parts[1]
                LastName = $parts[2]
                MRN = $parts[3]
            }
        }
    }
}

Write-Host "   Found: $($patients.Count) patients" -ForegroundColor Green
if ($patients.Count -eq 0) {
    Write-Host "[ERROR] No patients found!" -ForegroundColor Red
    $env:PGPASSWORD = ""
    exit 1
}

Write-Host "[5/5] Creating queue entries..." -ForegroundColor Yellow

$queueItems = @(
    @{ Referral="DoctorReferral"; Urgency="Critical"; Priority=95; SessionType="PreSurgery"; PatientType="Insurance"; FinancialC=$true; SurgicalC=$true; Notes="Urgent cataract surgery consent needed" },
    @{ Referral="Emergency"; Urgency="High"; Priority=85; SessionType="Financial"; PatientType="Cash"; FinancialC=$true; SurgicalC=$false; Notes="Emergency case - needs immediate financial counseling" },
    @{ Referral="OptometryReferral"; Urgency="High"; Priority=75; SessionType="Initial"; PatientType="CoPay"; FinancialC=$true; SurgicalC=$false; Notes="Optometry referred for glasses selection" },
    @{ Referral="DoctorReferral"; Urgency="Medium"; Priority=55; SessionType="Followup"; PatientType="Insurance"; FinancialC=$false; SurgicalC=$false; Notes="Follow-up post-operative counseling" },
    @{ Referral="Scheduled"; Urgency="Medium"; Priority=50; SessionType="Initial"; PatientType="GovernmentScheme"; FinancialC=$true; SurgicalC=$false; Notes="Scheduled consultation for scheme benefits" },
    @{ Referral="WalkIn"; Urgency="Low"; Priority=30; SessionType="General"; PatientType="Cash"; FinancialC=$false; SurgicalC=$false; Notes="Walk-in patient for general inquiry" }
)

$successCount = 0
$failCount = 0

for ($i = 0; $i -lt [Math]::Min($queueItems.Count, $patients.Count); $i++) {
    $item = $queueItems[$i]
    $patient = $patients[$i]
    $patientName = "$($patient.FirstName) $($patient.LastName)"
    
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
        Write-Host "   [OK] Added: $patientName ($($item.Urgency))" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "   [FAIL] $patientName : $result" -ForegroundColor Red
        $failCount++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Seeding Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[OK] Added: $successCount patients" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "[WARN] Failed: $failCount patients" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "View Queue: http://localhost:3001/dashboard/counselor/queue" -ForegroundColor Cyan
Write-Host ""

# Verify
Write-Host "Verifying queue entries..." -ForegroundColor Yellow
$verifyQuery = @"
SELECT 
    cq.token_number,
    p.first_name || ' ' || p.last_name as patient_name,
    cq.urgency_level,
    cq.priority_score,
    cq.status
FROM counselor_queue cq
JOIN patient p ON p.id = cq.patient_id
WHERE cq.deleted_at IS NULL
AND cq.created_at > NOW() - INTERVAL '1 minute'
ORDER BY cq.priority_score DESC;
"@

$verifyResult = & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -c $verifyQuery 2>&1
Write-Host $verifyResult

# Clear password
$env:PGPASSWORD = ""
