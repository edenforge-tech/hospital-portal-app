# Test TOTP Code Generation - Server Side Test
# This script generates the CURRENT valid TOTP code using the same logic as the server

$secret = "ZUNA3GT35363PAKDGY3EH7GR4DQEWFTU"

# Get current UTC time
$utcNow = [DateTime]::UtcNow
$unixTime = [long](($utcNow - [DateTime]::new(1970, 1, 1, 0, 0, 0, [DateTimeKind]::Utc)).TotalSeconds)

Write-Host "=== TOTP Diagnostic Tool ===" -ForegroundColor Cyan
Write-Host "Secret: $secret"
Write-Host "UTC Time: $utcNow"
Write-Host "Unix Time: $unixTime"
Write-Host ""

# Base32 decode function
function ConvertFrom-Base32 {
    param([string]$base32)
    
    $base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
    $bits = ""
    
    foreach ($char in $base32.ToUpper().ToCharArray()) {
        $val = $base32Chars.IndexOf($char)
        if ($val -ge 0) {
            $bits += [Convert]::ToString($val, 2).PadLeft(5, '0')
        }
    }
    
    $bytes = @()
    for ($i = 0; $i -lt $bits.Length - 7; $i += 8) {
        $bytes += [Convert]::ToByte($bits.Substring($i, 8), 2)
    }
    
    return [byte[]]$bytes
}

# HMAC-SHA1 function
function Get-TOTP {
    param(
        [byte[]]$key,
        [long]$timeStep
    )
    
    # Convert time step to 8-byte array (big-endian)
    $timeBytes = [byte[]]::new(8)
    for ($i = 7; $i -ge 0; $i--) {
        $timeBytes[$i] = [byte]($timeStep -band 0xFF)
        $timeStep = $timeStep -shr 8
    }
    
    # HMAC-SHA1
    $hmac = [System.Security.Cryptography.HMACSHA1]::new($key)
    $hash = $hmac.ComputeHash($timeBytes)
    
    # Dynamic truncation
    $offset = $hash[$hash.Length - 1] -band 0x0F
    $code = (($hash[$offset] -band 0x7F) -shl 24) -bor
            (($hash[$offset + 1] -band 0xFF) -shl 16) -bor
            (($hash[$offset + 2] -band 0xFF) -shl 8) -bor
            ($hash[$offset + 3] -band 0xFF)
    
    # 6-digit code
    $code = $code % 1000000
    
    return $code.ToString("D6")
}

try {
    # Decode Base32 secret
    $keyBytes = ConvertFrom-Base32 -base32 $secret
    Write-Host "Key bytes decoded: $($keyBytes.Length) bytes" -ForegroundColor Green
    
    # Calculate time steps (30-second intervals)
    $timeStep = [Math]::Floor($unixTime / 30)
    
    # Generate codes for current, previous, and next time step
    $prevCode = Get-TOTP -key $keyBytes -timeStep ($timeStep - 1)
    $currentCode = Get-TOTP -key $keyBytes -timeStep $timeStep
    $nextCode = Get-TOTP -key $keyBytes -timeStep ($timeStep + 1)
    
    Write-Host "=== VALID CODES (±30 seconds) ===" -ForegroundColor Yellow
    Write-Host "Previous (-30s): $prevCode" -ForegroundColor Gray
    Write-Host "CURRENT:         $currentCode" -ForegroundColor Green
    Write-Host "Next (+30s):     $nextCode" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Try entering: $currentCode" -ForegroundColor Cyan
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
