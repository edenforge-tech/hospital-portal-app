<parameter name="content"># Phase 3 Prescriptions Module - Testing Helper Script
# This script helps verify database state during testing

$ErrorActionPreference = "Stop"

# Database connection parameters
$env:PGPASSWORD = 'NewPass@2026!'
$PG_HOST = "hospitalportal-db-server.postgres.database.azure.com"
$PG_USER = "postgres"
$PG_DB = "hospitalportal"

# Colors for output
function Write-Success { param([string]$Message) Write-Host "✓ $Message" -ForegroundColor Green }
function Write-Error { param([string]$Message) Write-Host "✗ $Message" -ForegroundColor Red }
function Write-Info { param([string]$Message) Write-Host "ℹ $Message" -ForegroundColor Cyan }
function Write-Warning { param([string]$Message) Write-Host "⚠ $Message" -ForegroundColor Yellow }

# Main menu
function Show-Menu {
    Clear-Host
    Write-Host "`n=== Phase 3 Prescriptions Testing Helper ===" -ForegroundColor Cyan
    Write-Host "`n1. Verify Database Schema (prescriptions tables)"
    Write-Host "2. Count Medications in Database"
    Write-Host "3. Count Drug Interactions"
    Write-Host "4. Test Medication Search (Full-Text)"
    Write-Host "5. View Recent Prescriptions"
    Write-Host "6. Check Prescription by ID"
    Write-Host "7. Verify RLS Policies"
    Write-Host "8. View Audit Logs for Prescriptions"
    Write-Host "9. Run All Verification Tests"
    Write-Host "0. Exit"
    Write-Host "`n"
}

# Test 1: Verify schema
function Test-Schema {
    Write-Info "Testing prescription tables schema..."
    
    $query = @"
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('prescription', 'prescription_medication', 'medication_master', 'drug_interaction')
ORDER BY table_name;
"@
    
    $result = psql -h $PG_HOST -U $PG_USER -d $PG_DB -c $query
    
    if ($result -match "prescription") {
        Write-Success "All 4 prescription tables exist"
        Write-Host $result
    } else {
        Write-Error "Some tables are missing!"
    }
}

# Test 2: Count medications
function Test-Medications {
    Write-Info "Counting medications in database..."
    
    $query = @"
SELECT 
    COUNT(*) as total_medications,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_medications,
    COUNT(DISTINCT category) as categories
FROM medication_master;
"@
    
    $result = psql -h $PG_HOST -U $PG_USER -d $PG_DB -c $query
    Write-Host $result
    
    $categoryQuery = @"
SELECT category, COUNT(*) as count
FROM medication_master
WHERE is_active = true
GROUP BY category
ORDER BY count DESC;
"@
    
    Write-Info "`nMedications by category:"
    $catResult = psql -h $PG_HOST -U $PG_USER -d $PG_DB -c $categoryQuery
    Write-Host $catResult
}

# Test 3: Count interactions
function Test-Interactions {
    Write-Info "Counting drug interactions..."
    
    $query = @"
SELECT 
    severity,
    COUNT(*) as count
FROM drug_interaction
GROUP BY severity
ORDER BY 
    CASE severity
        WHEN 'high' THEN 1
        WHEN 'medium' THEN 2
        WHEN 'low' THEN 3
    END;
"@
    
    $result = psql -h $PG_HOST -U $PG_USER -d $PG_DB -c $query
    Write-Host $result
    
    Write-Info "`nSample high-severity interactions:"
    $sampleQuery = @"
SELECT drug1_name, drug2_name, description
FROM drug_interaction
WHERE severity = 'high'
LIMIT 3;
"@
    
    $sample = psql -h $PG_HOST -U $PG_USER -d $PG_DB -c $sampleQuery
    Write-Host $sample
}

# Test 4: Search medications
function Test-MedicationSearch {
    Write-Info "Testing full-text medication search..."
    
    $searchTerm = Read-Host "Enter search term (e.g., 'moxi')"
    
    $query = @"
SELECT name, generic_name, category, form
FROM medication_master
WHERE to_tsvector('english', name || ' ' || generic_name) @@ to_tsquery('english', '$searchTerm:*')
  AND is_active = true
ORDER BY name
LIMIT 10;
"@
    
    $result = psql -h $PG_HOST -U $PG_USER -d $PG_DB -c $query
    Write-Host $result
}

# Test 5: Recent prescriptions
function Test-RecentPrescriptions {
    Write-Info "Fetching recent prescriptions..."
    
    $query = @"
SELECT 
    p.id,
    p.diagnosis,
    p.status,
    p.is_printed,
    p.created_at,
    COUNT(pm.id) as medication_count
FROM prescription p
LEFT JOIN prescription_medication pm ON p.id = pm.prescription_id
WHERE p.deleted_at IS NULL
GROUP BY p.id
ORDER BY p.created_at DESC
LIMIT 10;
"@
    
    $result = psql -h $PG_HOST -U $PG_USER -d $PG_DB -c $query
    Write-Host $result
}

# Test 6: Check specific prescription
function Test-PrescriptionById {
    $prescriptionId = Read-Host "Enter prescription ID (UUID)"
    
    Write-Info "Fetching prescription details..."
    
    $query = @"
SELECT 
    id,
    diagnosis,
    status,
    is_printed,
    printed_at,
    dispensed_date,
    pharmacy_name,
    created_at,
    created_by_user_id,
    updated_at,
    updated_by_user_id
FROM prescription
WHERE id = '$prescriptionId';
"@
    
    $result = psql -h $PG_HOST -U $PG_USER -d $PG_DB -c $query
    Write-Host $result
    
    Write-Info "`nMedications in this prescription:"
    $medQuery = @"
SELECT 
    medication_name,
    dosage,
    frequency,
    duration_days,
    quantity
FROM prescription_medication
WHERE prescription_id = '$prescriptionId';
"@
    
    $medResult = psql -h $PG_HOST -U $PG_USER -d $PG_DB -c $medQuery
    Write-Host $medResult
}

# Test 7: Verify RLS
function Test-RLS {
    Write-Info "Testing Row-Level Security policies..."
    
    $query = @"
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies
WHERE tablename IN ('prescription', 'prescription_medication', 'medication_master', 'drug_interaction')
ORDER BY tablename, policyname;
"@
    
    $result = psql -h $PG_HOST -U $PG_USER -d $PG_DB -c $query
    Write-Host $result
}

# Test 8: Audit logs
function Test-AuditLogs {
    Write-Info "Fetching recent prescription audit logs..."
    
    $query = @"
SELECT 
    table_name,
    operation_type,
    changed_at,
    changed_by_user_id,
    old_values::text,
    new_values::text
FROM audit_log
WHERE table_name = 'prescription'
ORDER BY changed_at DESC
LIMIT 5;
"@
    
    $result = psql -h $PG_HOST -U $PG_USER -d $PG_DB -c $query
    Write-Host $result
}

# Test 9: Run all tests
function Test-All {
    Write-Host "`n=== Running All Verification Tests ===" -ForegroundColor Cyan
    
    Write-Host "`n--- Test 1: Schema ---"
    Test-Schema
    
    Write-Host "`n--- Test 2: Medications ---"
    Test-Medications
    
    Write-Host "`n--- Test 3: Drug Interactions ---"
    Test-Interactions
    
    Write-Host "`n--- Test 5: Recent Prescriptions ---"
    Test-RecentPrescriptions
    
    Write-Host "`n--- Test 7: RLS Policies ---"
    Test-RLS
    
    Write-Success "`nAll verification tests completed!"
}

# Main loop
do {
    Show-Menu
    $choice = Read-Host "Select an option (0-9)"
    
    switch ($choice) {
        "1" { Test-Schema; Read-Host "`nPress Enter to continue" }
        "2" { Test-Medications; Read-Host "`nPress Enter to continue" }
        "3" { Test-Interactions; Read-Host "`nPress Enter to continue" }
        "4" { Test-MedicationSearch; Read-Host "`nPress Enter to continue" }
        "5" { Test-RecentPrescriptions; Read-Host "`nPress Enter to continue" }
        "6" { Test-PrescriptionById; Read-Host "`nPress Enter to continue" }
        "7" { Test-RLS; Read-Host "`nPress Enter to continue" }
        "8" { Test-AuditLogs; Read-Host "`nPress Enter to continue" }
        "9" { Test-All; Read-Host "`nPress Enter to continue" }
        "0" { Write-Info "Exiting..."; break }
        default { Write-Warning "Invalid choice. Please try again."; Start-Sleep -Seconds 1 }
    }
} while ($choice -ne "0")
