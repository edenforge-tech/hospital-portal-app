# Execute Sample Data Script for Counselor Queue
# This script inserts test data so you can see the counselor workspace in action

$ErrorActionPreference = "Stop"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Inserting Sample Counselor Queue Data" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Database connection details
$dbHost = "sam.postgres.database.azure.com"
$dbPort = "5432"
$dbName = "hospital_portal_db"
$dbUser = "sam"
$dbPassword = "Pass@123"

$connectionString = "Host=$dbHost;Port=$dbPort;Database=$dbName;Username=$dbUser;Password=$dbPassword;SSL Mode=Require;Trust Server Certificate=true"

Write-Host "📊 Reading SQL script..." -ForegroundColor Yellow
$sqlScript = Get-Content "insert_sample_counselor_queue_data.sql" -Raw

Write-Host "🔌 Connecting to Azure PostgreSQL..." -ForegroundColor Yellow
Write-Host "   Host: $dbHost" -ForegroundColor Gray
Write-Host "   Database: $dbName" -ForegroundColor Gray
Write-Host ""

try {
    # Load Npgsql assembly
    Add-Type -Path "C:\Program Files\Microsoft SQL Server Management Studio 19\Common7\IDE\Extensions\Microsoft\SQLDB\DAC\Npgsql.dll" -ErrorAction SilentlyContinue
    
    # Create connection
    $conn = New-Object Npgsql.NpgsqlConnection($connectionString)
    $conn.Open()
    
    Write-Host "✅ Connected successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Execute the script
    Write-Host "🚀 Executing SQL script..." -ForegroundColor Yellow
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = $sqlScript
    $cmd.CommandTimeout = 60
    
    $result = $cmd.ExecuteNonQuery()
    
    Write-Host "✅ Script executed successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Query to check results
    Write-Host "📋 Verifying inserted data..." -ForegroundColor Yellow
    $verifyCmd = $conn.CreateCommand()
    $verifyCmd.CommandText = @"
SELECT 
    COUNT(*) as total_waiting,
    COUNT(DISTINCT patient_id) as unique_patients,
    COUNT(CASE WHEN urgency_level = 'High' THEN 1 END) as high_urgency,
    COUNT(CASE WHEN urgency_level = 'Medium' THEN 1 END) as medium_urgency
FROM counselor_queue 
WHERE deleted_at IS NULL AND status = 'Waiting';
"@
    
    $reader = $verifyCmd.ExecuteReader()
    if ($reader.Read()) {
        Write-Host ""
        Write-Host "✨ Sample Data Summary:" -ForegroundColor Cyan
        Write-Host "   • Total in Queue: $($reader['total_waiting'])" -ForegroundColor White
        Write-Host "   • Unique Patients: $($reader['unique_patients'])" -ForegroundColor White
        Write-Host "   • High Urgency: $($reader['high_urgency'])" -ForegroundColor Yellow
        Write-Host "   • Medium Urgency: $($reader['medium_urgency'])" -ForegroundColor White
    }
    $reader.Close()
    
    $conn.Close()
    
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "  ✅ Sample Data Created Successfully!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Refresh your browser to see the data!" -ForegroundColor Cyan
    Write-Host "   URL: http://localhost:3000/dashboard/counselor/workspace" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠️  Alternative: Use Swagger UI to add queue items" -ForegroundColor Yellow
    Write-Host "   1. Go to: http://localhost:5073/swagger" -ForegroundColor Gray
    Write-Host "   2. Login and get token" -ForegroundColor Gray
    Write-Host "   3. Use POST /api/counseling/queue endpoint" -ForegroundColor Gray
    Write-Host ""
    exit 1
}
