-- Add user activation and password reset columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS activation_status VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS one_time_password_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS must_reset_password BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_sent_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_ip TEXT;

-- Update existing users
UPDATE users 
SET activation_status = 'Active', 
    email_verified = true,
    last_password_change = NOW()
WHERE "PasswordHash" IS NOT NULL 
  AND activation_status IS NULL;

-- Create user_branches table
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
    
    CONSTRAINT fk_user_branches_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_branches_user FOREIGN KEY (user_id) REFERENCES users("Id") ON DELETE CASCADE,
    CONSTRAINT fk_user_branches_branch FOREIGN KEY (branch_id) REFERENCES branch(id) ON DELETE CASCADE
);

-- Create user_activation_log table
CREATE TABLE IF NOT EXISTS user_activation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    activation_method VARCHAR(50) NOT NULL,
    otp_sent_at TIMESTAMP,
    activated_at TIMESTAMP,
    activated_by_user_id UUID,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_user_activation_log_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_activation_log_user FOREIGN KEY (user_id) REFERENCES users("Id") ON DELETE CASCADE
);

-- Create password_reset_requests table
CREATE TABLE IF NOT EXISTS password_reset_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    request_token TEXT NOT NULL,
    requested_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    ip_address TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_password_reset_requests_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_password_reset_requests_user FOREIGN KEY (user_id) REFERENCES users("Id") ON DELETE CASCADE
);
