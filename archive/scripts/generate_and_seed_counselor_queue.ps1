# ========================================
# Generate Counselor Queue SQL Seeding Script
# ========================================
# This script queries the database to get actual IDs
# and generates a ready-to-run SQL script

param(
    [string]$DbHost = "localhost",
    [string]$DbPort = "5432",
    [string]$DbName = "hospital_portal",
    [string]$DbUser = "postgres",
    [string]$DbPassword = ""
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Counselor Queue SQL Generator" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if psql is available
try {
    $psqlVersion = & psql --version 2>&1
    Write-Host "[OK] PostgreSQL client found: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] psql command not found. Please install PostgreSQL client tools." -ForegroundColor Red
    Write-Host "   Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Prompt for database password if not provided
if ([string]::IsNullOrEmpty($DbPassword)) {
    $DbPasswordSecure = Read-Host "Enter PostgreSQL password" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($DbPasswordSecure)
    $DbPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
}

# Set PostgreSQL environment variable
$env:PGPASSWORD = $DbPassword

Write-Host "[INFO] Fetching system data..." -ForegroundColor Yellow

# Fetch tenant
$tenantQuery = "SELECT id, name FROM tenant WHERE deleted_at IS NULL LIMIT 1;"
$tenantResult = & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -t -A -F ',' -c $tenantQuery 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Database connection failed!" -ForegroundColor Red
    Write-Host $tenantResult
    exit 1
}

$tenantId, $tenantName = $tenantResult.Split(',')
Write-Host "   Tenant: $tenantName ($tenantId)" -ForegroundColor Gray

# Fetch branch
$branchQuery = "SELECT id, name FROM branch WHERE deleted_at IS NULL LIMIT 1;"
$branchResult = & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -t -A -F ',' -c $branchQuery
$branchId, $branchName = $branchResult.Split(',')
Write-Host "   Branch: $branchName ($branchId)" -ForegroundColor Gray

# Fetch counselor (or any user)
$userQuery = 'SELECT id, user_name FROM "AspNetUsers" WHERE NOT EXISTS (SELECT 1 FROM "AspNetUsers" deleted WHERE deleted.id = "AspNetUsers".id AND deleted.normalized_email LIKE ''%DELETED%'') LIMIT 1;'
$userResult = & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -t -A -F ',' -c $userQuery
$userId, $userName = $userResult.Split(',')
Write-Host "   User (counselor): $userName ($userId)" -ForegroundColor Gray

# Fetch patients (up to 6)
$patientsQuery = "SELECT id, full_name, mrn FROM patient WHERE deleted_at IS NULL AND status = 'active' LIMIT 6;"
$patientsResult = & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -t -A -F ',' -c $patientsQuery

$patients = @()
foreach ($line in $patientsResult) {
    if (![string]::IsNullOrWhiteSpace($line)) {
        $parts = $line.Split(',')
        $patients += @{
            Id = $parts[0]
            Name = $parts[1]
            MRN = $parts[2]
        }
    }
}

Write-Host "   Patients found: $($patients.Count)" -ForegroundColor Gray
foreach ($p in $patients) {
    Write-Host "      - $($p.Name) (MRN: $($p.MRN))" -ForegroundColor DarkGray
}

if ($patients.Count -eq 0) {
    Write-Host ""
    Write-Host "[ERROR] No patients found in database. Please create patients first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[OK] Data fetched successfully!" -ForegroundColor Green
Write-Host ""

# Generate SQL script
Write-Host "[INFO] Generating SQL script..." -ForegroundColor Yellow

$sqlScript = @"
-- ========================================
-- Counselor Queue Test Data Seeding
-- ========================================
-- Auto-generated on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
--
-- Tenant: $tenantName
-- Branch: $branchName 
-- Counselor: $userName
-- Patients: $($patients.Count)

BEGIN;

"@

$queueItems = @(
    @{ Idx=1; Referral="DoctorReferral"; Urgency="Critical"; Priority=95; SessionType="PreSurgery"; PatientType="Insurance"; FinancialC=$true; SurgicalC=$true; Notes="Urgent cataract surgery consent needed - surgery scheduled for tomorrow" },
    @{ Idx=2; Referral="Emergency"; Urgency="High"; Priority=85; SessionType="Financial"; PatientType="Cash"; FinancialC=$true; SurgicalC=$false; Notes="Emergency case - needs immediate financial counseling for treatment" },
    @{ Idx=3; Referral="OptometryReferral"; Urgency="High"; Priority=75; SessionType="Initial"; PatientType="CoPay"; FinancialC=$true; SurgicalC=$false; Notes="Optometry referred for glasses and lens selection" },
    @{ Idx=4; Referral="DoctorReferral"; Urgency="Medium"; Priority=55; SessionType="Followup"; PatientType="Insurance"; FinancialC=$false; SurgicalC=$false; Notes="Follow-up post-operative counseling" },
    @{ Idx=5; Referral="Scheduled"; Urgency="Medium"; Priority=50; SessionType="Initial"; PatientType="GovernmentScheme"; FinancialC=$true; SurgicalC=$false; Notes="Scheduled consultation for government scheme benefits" },
    @{ Idx=6; Referral="WalkIn"; Urgency="Low"; Priority=30; SessionType="General"; PatientType="Cash"; FinancialC=$false; SurgicalC=$false; Notes="Walk-in patient for general inquiry" }
)

$insertedCount = 0
foreach ($item in $queueItems) {
    if ($item.Idx -le $patients.Count) {
        $patient = $patients[$item.Idx - 1]
        $sqlScript += @"

-- Patient: $($patient.Name) (MRN: $($patient.MRN)) - $($item.Urgency)
INSERT INTO counselor_queue (
    id, tenant_id, branch_id, patient_id,
    assigned_counselor_id, referred_by_user_id,
    referral_source, referral_notes,
    urgency_level, priority_score,
    session_type, patient_type,
    requires_financial_counseling, requires_surgical_consent,
    queue_status, added_to_queue_at,
    created_at, updated_at,
    created_by_user_id, updated_by_user_id,
    status
) VALUES (
    gen_random_uuid(),
    '$tenantId'::uuid,
    '$branchId'::uuid,
    '$($patient.Id)'::uuid,
    '$userId'::uuid,
    '$userId'::uuid,
    '$($item.Referral)',
    '$($item.Notes)',
    '$($item.Urgency)',
    $($item.Priority),
    '$($item.SessionType)',
    '$($item.PatientType)',
    $($item.FinancialC.ToString().ToLower()),
    $($item.SurgicalC.ToString().ToLower()),
    'Waiting',
    NOW(),
    NOW(),
    NOW(),
    '$userId'::uuid,
    '$userId'::uuid,
    'active'
);

"@
        $insertedCount++
    }
}

$sqlScript += @"

COMMIT;

-- Verify inserted data
SELECT 
    cq.id,
    cq.token_number,
    p.full_name as patient_name,
    p.mrn,
    cq.referral_source,
    cq.urgency_level,
    cq.priority_score,
    cq.queue_status,
    cq.created_at
FROM counselor_queue cq
JOIN patient p ON p.id = cq.patient_id
WHERE cq.deleted_at IS NULL
AND cq.created_at > NOW() - INTERVAL '1 minute'
ORDER BY cq.priority_score DESC, cq.created_at;
"@

# Save to file
$outputFile = "seed_counselor_queue_GENERATED.sql"
$sqlScript | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host "[OK] SQL script generated: $outputFile" -ForegroundColor Green
Write-Host "   Patients to add: $insertedCount" -ForegroundColor Gray
Write-Host ""

# Ask to execute
$execute = Read-Host "Execute script now? (y/n)"
if ($execute -eq 'y' -or $execute -eq 'Y') {
    Write-Host ""
    Write-Host "[RUN] Executing SQL script..." -ForegroundColor Yellow
    
    $result = & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -f $outputFile 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "Seeding Complete!" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "[OK] Successfully added $insertedCount patients to queue" -ForegroundColor Green
        Write-Host ""
        Write-Host "[URL] View Queue at: http://localhost:3001/dashboard/counselor/queue" -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "[ERROR] Failed to execute script" -ForegroundColor Red
        Write-Host $result
    }
} else {
    Write-Host ""
    Write-Host "[INFO] Script saved. Execute manually with:" -ForegroundColor Cyan
    Write-Host "   psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -f $outputFile" -ForegroundColor Gray
    Write-Host ""
}

# Clear password
$env:PGPASSWORD = ""
