# DATABASE MIGRATION REQUIRED

**Status**: Backend is running but will fail on `/api/users/with-details` endpoint.

**Problem**: Database missing 13 columns in `users` table.

**Error**: `42703: column u.activation_status does not exist`

---

## ✅ SOLUTION: Execute SQL Migration

### Network Connection Issue
Direct psql connection to Azure PostgreSQL (20.244.11.113:5432) is **timing out** due to firewall rules.

### You MUST use one of these tools to execute the migration:

### Option 1: Azure Portal Query Editor (RECOMMENDED - if using Azure PostgreSQL)
1. Go to https://portal.azure.com
2. Navigate to your PostgreSQL server
3. Click **"Query editor"** in the left menu
4. Login with database credentials
5. Copy/paste the SQL below
6. Click **"Run"**

###Option 2: Azure Data Studio
1. Download: https://aka.ms/azuredatastudio
2. Install PostgreSQL extension (if not already installed)
3. Create connection:
   - Server: `20.244.11.113`
   - Port: `5432`
   - Database: `hospital_portal`
   - Username: `postgres`
   - Password: `Conga@12345`
4. Open new query
5. Paste SQL below
6. Execute (F5 or click Run button)

### Option 3: pgAdmin
1. Download: https://www.pgadmin.org/download/
2. Install and open pgAdmin
3. Right-click "Servers" → "Register" → "Server"
   - Name: Hospital Portal Azure DB
   - Host: `20.244.11.113`
   - Port: `5432`
   - Database: `hospital_portal`
   - Username: `postgres`
   - Password: `Conga@12345`
4. Right-click database → "Query Tool"
5. Paste SQL below
6. Execute (F5)

### Option 4: Configure Azure Firewall (if you have Azure access)
1. Azure Portal → PostgreSQL Server → Connection Security
2. Add your client IP address to allowed IPs
3. Save changes
4. Re-run: `.\run_migration.ps1`

---

## 📋 SQL MIGRATION SCRIPT

```sql
-- ================================================================
-- USER ACTIVATION & PASSWORD RESET COLUMNS (13 new columns)
-- ================================================================

-- Add columns for user activation
ALTER TABLE users ADD COLUMN IF NOT EXISTS activation_status VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS one_time_password_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS must_reset_password BOOLEAN DEFAULT false;

-- Add columns for password reset
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP;

-- Add columns for email verification
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_sent_at TIMESTAMP;

-- Add columns for security
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_ip TEXT;

-- ================================================================
-- UPDATE EXISTING USERS
-- ================================================================
UPDATE users 
SET 
    activation_status = 'Active', 
    email_verified = true,
    last_password_change = NOW()
WHERE "PasswordHash" IS NOT NULL 
  AND activation_status IS NULL;

-- ================================================================
-- CREATE SUPPORTING TABLES
-- ================================================================

-- Table: user_branches (multi-branch assignment)
CREATE TABLE IF NOT EXISTS user_branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    is_default BOOLEAN DEFAULT false,
    assigned_at TIMESTAMP DEFAULT NOW(),
    assigned_by_user_id UUID,
    effective_from TIMESTAMP DEFAULT NOW(),
    effective_until TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by_user_id UUID,
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by_user_id UUID,
    deleted_at TIMESTAMP,
    deleted_by_user_id UUID,
    FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (branch_id) REFERENCES branch(id)
);

-- Table: user_activation_log (audit trail)
CREATE TABLE IF NOT EXISTS user_activation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by_user_id UUID,
    FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: password_reset_requests (password reset tracking)
CREATE TABLE IF NOT EXISTS password_reset_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    reset_token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ================================================================
-- VERIFICATION QUERY
-- ================================================================
SELECT 
    'Migration completed!' AS status,
    COUNT(*) AS users_updated
FROM users 
WHERE activation_status = 'Active';
```

---

## 🔄 After Migration

1. **Restart Backend**:
   ```powershell
   cd "C:\Users\Sam Aluri\Downloads\Hospital Portal\microservices\auth-service\AuthService"
   dotnet run
   ```

2. **Test Users Endpoint**:
   - Frontend: http://localhost:3000/dashboard/admin/users
   - Should load without 500 error
   - Or test directly: `Invoke-WebRequest http://localhost:5073/api/users/with-details`

3. **Verify Migration**:
   ```sql
   -- Check column exists
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'users' 
     AND column_name = 'activation_status';
   
   -- Check data
   SELECT id, user_name, activation_status 
   FROM users 
   LIMIT 5;
   ```

---

## 📊 What This Migration Does

1. **Adds 13 columns** to `users` table:
   - `activation_status` (VARCHAR) - User account status
   - `one_time_password_hash` (TEXT) - OTP hash
   - `otp_expires_at` (TIMESTAMP) - OTP expiration
   - `must_reset_password` (BOOLEAN) - Force password reset flag
   - `password_reset_token` (TEXT) - Reset token
   - `reset_token_expires_at` (TIMESTAMP) - Token expiration
   - `last_password_change` (TIMESTAMP) - Last password update
   - `email_verified` (BOOLEAN) - Email verification status
   - `email_verification_token` (TEXT) - Verification token
   - `email_verification_sent_at` (TIMESTAMP) - Token send time
   - `failed_login_attempts` (INT) - Failed login counter
   - `locked_until` (TIMESTAMP) - Account lock expiration
   - `last_login_ip` (TEXT) - Last login IP address

2. **Updates existing users**:
   - Sets `activation_status = 'Active'`
   - Sets `email_verified = true`
   - Sets `last_password_change = NOW()`

3. **Creates 3 new tables**:
   - `user_branches` - Multi-branch user assignments
   - `user_activation_log` - Activation audit trail
   - `password_reset_requests` - Password reset tracking

---

## ⚠️ IMPORTANT

- **DO NOT** modify the SQL - it's designed to be idempotent (safe to run multiple times)
- **DO NOT** skip this migration - backend will crash on user endpoints
- **FILE REFERENCE**: Full SQL available at:  
  `C:\Users\Sam Aluri\Downloads\Hospital Portal\microservices\auth-service\AuthService\add_user_columns.sql`

---

**Current Status**: Backend running on port 5073, but users endpoint fails with database error.

**Next Action**: Execute SQL via Azure Portal, Azure Data Studio, or pgAdmin as shown above.
