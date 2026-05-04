<#
.SYNOPSIS
    Run all Bill Transfer / Invoice Settlement / Vendor Bank Account
    database migrations against the Azure PostgreSQL database.

.DESCRIPTION
    Executes schema migrations 20 and 26-33 which create/alter the tables
    required by the BillTransfer, InvoiceSettlement, and VendorBankAccount
    backend features in the inventory service.

    Migrations applied (in order):
        20  - inv_bill_transfers, inv_invoice_settlements, inv_settlement_payments
        26  - inv_bill_transfer_policy, inv_bill_transfer_event_log, version_no columns
        27  - inv_bt_reason_catalog + seed reason codes
        28  - inv_request_idempotency
        29  - SLA columns on inv_bill_transfers + inv_bt_escalation_queue
        30  - inv_settlement_event_logs
        31  - ALTER inv_vendor_payments  (per-payment-method detail columns)
        32  - inv_vendor_bank_accounts
        33  - ALTER inv_vendor_payments  (attachment columns)

.PARAMETER DbHost
    PostgreSQL host. Defaults to the Azure PostgreSQL server used by this project.

.PARAMETER DbUser
    Database user. Defaults to 'postgres'.

.PARAMETER DbName
    Database name. Defaults to 'hospitalportal'.

.PARAMETER DbPort
    Port. Defaults to 5432.

.EXAMPLE
    # Interactive (prompts for password)
    .\run_bill_transfer_migrations.ps1

    # With explicit password via env var (CI/CD)
    $env:PGPASSWORD = "yourpassword"
    .\run_bill_transfer_migrations.ps1

.NOTES
    Requires psql (PostgreSQL client tools) on PATH.
    All migration files are idempotent - safe to run multiple times.
#>

param(
    [string]$DbHost = "",
    [string]$DbUser = "",
    [string]$DbName = "",
    [string]$DbPort = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Apply defaults for empty params (PowerShell 5.1 compatible)
if (-not $DbHost) { $DbHost = if ($env:DB_HOST) { $env:DB_HOST } else { "hospitalportal-db-server.postgres.database.azure.com" } }
if (-not $DbUser) { $DbUser = if ($env:DB_USER) { $env:DB_USER } else { "postgres" } }
if (-not $DbName) { $DbName = if ($env:DB_NAME) { $env:DB_NAME } else { "hospitalportal" } }
if (-not $DbPort) { $DbPort = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" } }

$ScriptRoot  = $PSScriptRoot
$SchemaDir   = Join-Path $ScriptRoot "database_migrations\schema"

# ─── Ordered list of migrations to apply ────────────────────────────────────
$Migrations = @(
    "20_bill_transfer_settlement.sql",
    "26_bill_transfer_governance_foundation.sql",
    "27_bt_reason_catalog.sql",
    "28_request_idempotency.sql",
    "29_bt_sla_escalation.sql",
    "30_settlement_event_log.sql",
    "31_vendor_payment_method_fields.sql",
    "32_vendor_bank_accounts.sql",
    "33_payment_proof_attachments.sql"
)

# ─── Verify psql is available ────────────────────────────────────────────────
if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] psql not found on PATH. Install PostgreSQL client tools first." -ForegroundColor Red
    Write-Host "  Download: https://www.postgresql.org/download/" -ForegroundColor Yellow
    exit 1
}

# ─── Verify all migration files exist ───────────────────────────────────────
foreach ($file in $Migrations) {
    $fullPath = Join-Path $SchemaDir $file
    if (-not (Test-Path $fullPath)) {
        Write-Host "[ERROR] Migration file not found: $fullPath" -ForegroundColor Red
        exit 1
    }
}

# ─── Prompt for password if not in env ──────────────────────────────────────
if (-not $env:PGPASSWORD) {
    Write-Host ""
    Write-Host "PostgreSQL password for user '$DbUser' on $DbHost" -ForegroundColor Yellow
    Write-Host "(Set `$env:PGPASSWORD to skip this prompt)" -ForegroundColor DarkGray
    $securePass = Read-Host -AsSecureString "Password"
    $env:PGPASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePass))
}

# ─── Header banner ───────────────────────────────────────────────────────────
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Bill Transfer / Settlement DB Migrations" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Host : $DbHost" -ForegroundColor Gray
Write-Host "  DB   : $DbName" -ForegroundColor Gray
Write-Host "  User : $DbUser" -ForegroundColor Gray
Write-Host "  Files: $($Migrations.Count) migration(s)" -ForegroundColor Gray
Write-Host ""

# ─── Preamble: ensure set_updated_at() exists (required by migration 20) ─────
# Write to a temp file to avoid dollar-sign escaping issues in PowerShell heredocs
$preambleFile = Join-Path $env:TEMP "set_updated_at_preamble.sql"
Set-Content -Path $preambleFile -Value @'
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;
'@

Write-Host "  ▶ Ensuring set_updated_at() function exists..." -NoNewline -ForegroundColor Yellow
# Use $ErrorActionPreference = Continue around psql calls so stderr NOTICEs
# don't trigger PowerShell's error machinery — rely on $LASTEXITCODE instead.
$prevEAP = $ErrorActionPreference
$ErrorActionPreference = "Continue"
& psql -h $DbHost -U $DbUser -d $DbName -p $DbPort -v ON_ERROR_STOP=1 -f $preambleFile 2>$null
$exitPreamble = $LASTEXITCODE
$ErrorActionPreference = $prevEAP

if ($exitPreamble -ne 0) {
    Write-Host " ❌ FAILED (exit $exitPreamble)" -ForegroundColor Red
    exit 1
}
Write-Host " ✅ OK" -ForegroundColor Green

# ─── Run each migration ──────────────────────────────────────────────────────
$succeeded = 0
$failed    = 0

foreach ($file in $Migrations) {
    $fullPath = Join-Path $SchemaDir $file
    Write-Host "  ▶ $file" -NoNewline -ForegroundColor Yellow

    $prevEAP = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    & psql -h $DbHost -U $DbUser -d $DbName -p $DbPort -v ON_ERROR_STOP=1 -f $fullPath 2>$null
    $exitCode = $LASTEXITCODE
    $ErrorActionPreference = $prevEAP

    if ($exitCode -eq 0) {
        Write-Host " ✅ OK" -ForegroundColor Green
        $succeeded++
    } else {
        Write-Host " ❌ FAILED (exit $exitCode)" -ForegroundColor Red
        Write-Host ""
        Write-Host "    Re-run with verbose output to see errors:" -ForegroundColor Yellow
        Write-Host "    psql -h $DbHost -U $DbUser -d $DbName -p $DbPort -f `"$fullPath`"" -ForegroundColor DarkGray
        $failed++
        Write-Host ""
        Write-Host "[ABORT] Fix the error above and re-run this script." -ForegroundColor Red

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  $succeeded migration(s) applied successfully." -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Tables created / altered:" -ForegroundColor Cyan
Write-Host "  inv_bill_transfers         (primary workflow table)" -ForegroundColor Gray
Write-Host "  inv_invoice_settlements    (post-approval payment tracking)" -ForegroundColor Gray
Write-Host "  inv_settlement_payments    (payment installment lines)" -ForegroundColor Gray
Write-Host "  inv_bill_transfer_policy   (per-tenant SoD thresholds)" -ForegroundColor Gray
Write-Host "  inv_bill_transfer_event_log (immutable audit trail)" -ForegroundColor Gray
Write-Host "  inv_bt_reason_catalog      (reject/override reasons)" -ForegroundColor Gray
Write-Host "  inv_request_idempotency    (duplicate-request guard)" -ForegroundColor Gray
Write-Host "  inv_bt_escalation_queue    (SLA breach notifications)" -ForegroundColor Gray
Write-Host "  inv_settlement_event_logs  (settlement audit trail)" -ForegroundColor Gray
Write-Host "  inv_vendor_bank_accounts   (multi-bank per vendor)" -ForegroundColor Gray
Write-Host "  inv_vendor_payments        (payment method detail + attachment columns)" -ForegroundColor Gray
Write-Host ""
Write-Host "Next step: start the inventory service and test the purchase-query page." -ForegroundColor Yellow
Write-Host "  cd microservices/inventory-service/InventoryApi && func start" -ForegroundColor DarkGray
