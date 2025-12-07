# Bulk Department Assignment Script
# Reads user_department_mappings.csv and assigns departments to all 70 users via API

$baseUrl = "http://localhost:5072/api"

# Login to get JWT token
Write-Host "Logging in as admin..." -ForegroundColor Cyan
$loginBody = @{
    email = "admin@test.com"
    password = "Admin@123456"
    tenantId = "11111111-1111-1111-1111-111111111111"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.accessToken
$tenantId = "11111111-1111-1111-1111-111111111111"

Write-Host "✓ Logged in successfully" -ForegroundColor Green
Write-Host ""

# Read CSV file
$csvPath = "c:\Users\Sam Aluri\Downloads\Hospital Portal\user_department_mappings.csv"
if (!(Test-Path $csvPath)) {
    Write-Host "❌ CSV file not found: $csvPath" -ForegroundColor Red
    exit
}

$mappings = Import-Csv $csvPath
Write-Host "Found $($mappings.Count) user-department mappings in CSV" -ForegroundColor Cyan
Write-Host ""

# Group by user to create department arrays for each user
$userGroups = $mappings | Group-Object -Property UserId

Write-Host "Processing $($userGroups.Count) unique users..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failCount = 0
$results = @()

foreach ($group in $userGroups) {
    $userId = $group.Name
    $userName = $group.Group[0].UserName
    
    # Build departments array for this user
    $departments = @()
    foreach ($mapping in $group.Group) {
        $departments += @{
            departmentId = $mapping.DepartmentId
            departmentName = $mapping.Department
            isPrimary = $true  # First department is primary, rest are false
            accessLevel = "Full"
        }
        # Set only first department as primary
        if ($departments.Count -gt 1) {
            $departments[$departments.Count - 1].isPrimary = $false
        }
    }
    
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
            "X-Tenant-ID" = $tenantId
        }
        
        $body = $departments | ConvertTo-Json -Depth 5
        
        $response = Invoke-RestMethod -Uri "$baseUrl/users/$userId/departments" `
            -Method Post `
            -Headers $headers `
            -Body $body
        
        $successCount++
        $results += [PSCustomObject]@{
            UserName = $userName
            UserId = $userId
            Departments = $departments.Count
            Status = "✓ Success"
        }
        
        Write-Host "✓ $userName" -ForegroundColor Green -NoNewline
        Write-Host " → $($departments.Count) department(s)" -ForegroundColor Gray
    }
    catch {
        $failCount++
        $errorMsg = $_.Exception.Message
        if ($_.ErrorDetails.Message) {
            $errorMsg = ($_.ErrorDetails.Message | ConvertFrom-Json).message
        }
        
        $results += [PSCustomObject]@{
            UserName = $userName
            UserId = $userId
            Departments = $departments.Count
            Status = "✗ Failed: $errorMsg"
        }
        
        Write-Host "✗ $userName" -ForegroundColor Red -NoNewline
        Write-Host " → Error: $errorMsg" -ForegroundColor Yellow
    }
    
    Start-Sleep -Milliseconds 100  # Rate limiting
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BULK DEPARTMENT ASSIGNMENT SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total users processed: $($userGroups.Count)" -ForegroundColor White
Write-Host "Successful: $successCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($failCount -gt 0) {
    Write-Host "Failed assignments:" -ForegroundColor Yellow
    $results | Where-Object { $_.Status -like "✗*" } | Format-Table -AutoSize
}

# Export detailed results
$resultsPath = "c:\Users\Sam Aluri\Downloads\Hospital Portal\department_assignment_results.csv"
$results | Export-Csv -Path $resultsPath -NoTypeInformation
Write-Host "Detailed results exported to: $resultsPath" -ForegroundColor Cyan

Write-Host ""
Write-Host "✓ Bulk department assignment complete!" -ForegroundColor Green
