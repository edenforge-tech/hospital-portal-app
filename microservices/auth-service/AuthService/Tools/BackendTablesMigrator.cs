using AuthService.Context;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Tools
{
    /// <summary>
    /// Database migration tool for creating backend enhancement tables
    /// </summary>
    public class BackendTablesMigrator
    {
        private readonly AppDbContext _context;

        public BackendTablesMigrator(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> CreateTablesAsync()
        {
            Console.WriteLine("\n========================================");
            Console.WriteLine("Creating Backend Enhancement Tables");
            Console.WriteLine("========================================\n");

            try
            {
                // Create device table
                await CreateDeviceTableAsync();
                
                // Create user_session table
                await CreateUserSessionTableAsync();
                
                // Create access_policy table
                await CreateAccessPolicyTableAsync();
                
                // Create emergency_access table
                await CreateEmergencyAccessTableAsync();

                Console.WriteLine("\n========================================");
                Console.WriteLine("✓ All tables created successfully!");
                Console.WriteLine("========================================\n");
                
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"\n✗ Error: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner: {ex.InnerException.Message}");
                }
                return false;
            }
        }

        private async Task CreateDeviceTableAsync()
        {
            Console.WriteLine("Creating device table...");
            var sql = @"
                CREATE TABLE IF NOT EXISTS device (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    tenant_id UUID NOT NULL REFERENCES tenant(id),
                    user_id UUID NOT NULL REFERENCES users(id),
                    device_name VARCHAR(255) NOT NULL,
                    device_type VARCHAR(50) DEFAULT 'Desktop',
                    device_fingerprint VARCHAR(500) NOT NULL,
                    os VARCHAR(100),
                    browser VARCHAR(100),
                    ip_address VARCHAR(50),
                    user_agent TEXT,
                    trust_level VARCHAR(20) DEFAULT 'Untrusted',
                    is_primary BOOLEAN DEFAULT FALSE,
                    is_blocked BOOLEAN DEFAULT FALSE,
                    blocked_reason TEXT,
                    last_seen_at TIMESTAMP,
                    first_seen_at TIMESTAMP DEFAULT NOW(),
                    verified_at TIMESTAMP,
                    blocked_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW(),
                    deleted_at TIMESTAMP,
                    status VARCHAR(20) DEFAULT 'active'
                );
                
                CREATE INDEX IF NOT EXISTS idx_device_tenant ON device(tenant_id);
                CREATE INDEX IF NOT EXISTS idx_device_user ON device(user_id);
                CREATE INDEX IF NOT EXISTS idx_device_fingerprint ON device(device_fingerprint);
                CREATE INDEX IF NOT EXISTS idx_device_trust_level ON device(trust_level);
            ";

            await _context.Database.ExecuteSqlRawAsync(sql);
            Console.WriteLine("  ✓ device table created");
        }

        private async Task CreateUserSessionTableAsync()
        {
            Console.WriteLine("Creating user_session table...");
            var sql = @"
                CREATE TABLE IF NOT EXISTS user_session (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    tenant_id UUID NOT NULL REFERENCES tenant(id),
                    user_id UUID NOT NULL REFERENCES users(id),
                    device_id UUID REFERENCES device(id),
                    session_token VARCHAR(500) UNIQUE NOT NULL,
                    refresh_token VARCHAR(500),
                    ip_address VARCHAR(50),
                    user_agent TEXT,
                    login_time TIMESTAMP DEFAULT NOW(),
                    last_activity_time TIMESTAMP DEFAULT NOW(),
                    logout_time TIMESTAMP,
                    expiry_time TIMESTAMP NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    login_location VARCHAR(255),
                    security_score INT DEFAULT 100,
                    is_suspicious BOOLEAN DEFAULT FALSE,
                    suspicious_reason TEXT,
                    terminated_by_user_id UUID REFERENCES users(id),
                    terminated_reason VARCHAR(500),
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW(),
                    deleted_at TIMESTAMP,
                    status VARCHAR(20) DEFAULT 'active'
                );
                
                CREATE INDEX IF NOT EXISTS idx_user_session_tenant ON user_session(tenant_id);
                CREATE INDEX IF NOT EXISTS idx_user_session_user ON user_session(user_id);
                CREATE INDEX IF NOT EXISTS idx_user_session_device ON user_session(device_id);
                CREATE INDEX IF NOT EXISTS idx_user_session_token ON user_session(session_token);
                CREATE INDEX IF NOT EXISTS idx_user_session_is_active ON user_session(is_active);
            ";

            await _context.Database.ExecuteSqlRawAsync(sql);
            Console.WriteLine("  ✓ user_session table created");
        }

        private async Task CreateAccessPolicyTableAsync()
        {
            Console.WriteLine("Creating access_policy table...");
            var sql = @"
                CREATE TABLE IF NOT EXISTS access_policy (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    tenant_id UUID NOT NULL REFERENCES tenant(id),
                    policy_name VARCHAR(255) NOT NULL,
                    policy_code VARCHAR(100),
                    description TEXT,
                    policy_type VARCHAR(50) DEFAULT 'ContextBased',
                    conditions JSONB,
                    actions JSONB,
                    resources JSONB,
                    effect VARCHAR(20) DEFAULT 'Allow',
                    priority INT DEFAULT 100,
                    applies_to_roles JSONB,
                    applies_to_departments JSONB,
                    applies_to_users JSONB,
                    effective_from TIMESTAMP,
                    effective_until TIMESTAMP,
                    time_of_day_start TIME,
                    time_of_day_end TIME,
                    days_of_week VARCHAR(50),
                    is_active BOOLEAN DEFAULT TRUE,
                    is_system_policy BOOLEAN DEFAULT FALSE,
                    evaluation_count INT DEFAULT 0,
                    last_evaluated_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW(),
                    deleted_at TIMESTAMP,
                    status VARCHAR(20) DEFAULT 'active'
                );
                
                CREATE INDEX IF NOT EXISTS idx_access_policy_tenant ON access_policy(tenant_id);
                CREATE INDEX IF NOT EXISTS idx_access_policy_priority ON access_policy(priority);
                CREATE INDEX IF NOT EXISTS idx_access_policy_effect ON access_policy(effect);
                CREATE INDEX IF NOT EXISTS idx_access_policy_is_active ON access_policy(is_active);
            ";

            await _context.Database.ExecuteSqlRawAsync(sql);
            Console.WriteLine("  ✓ access_policy table created");
        }

        private async Task CreateEmergencyAccessTableAsync()
        {
            Console.WriteLine("Creating emergency_access table...");
            var sql = @"
                CREATE TABLE IF NOT EXISTS emergency_access (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    tenant_id UUID NOT NULL REFERENCES tenant(id),
                    requester_user_id UUID NOT NULL REFERENCES users(id),
                    approved_by_user_id UUID REFERENCES users(id),
                    revoked_by_user_id UUID REFERENCES users(id),
                    reviewed_by_user_id UUID REFERENCES users(id),
                    patient_id UUID,
                    reason TEXT NOT NULL,
                    emergency_type VARCHAR(50) DEFAULT 'Medical',
                    access_code VARCHAR(20),
                    granted_permissions JSONB DEFAULT '[]',
                    scope VARCHAR(50) DEFAULT 'Full',
                    duration_minutes INT DEFAULT 60,
                    requested_at TIMESTAMP DEFAULT NOW(),
                    approved_at TIMESTAMP,
                    rejected_at TIMESTAMP,
                    revoked_at TIMESTAMP,
                    expires_at TIMESTAMP,
                    reviewed_at TIMESTAMP,
                    rejection_reason TEXT,
                    revocation_reason TEXT,
                    review_notes TEXT,
                    review_status VARCHAR(50) DEFAULT 'pending',
                    requires_approval BOOLEAN DEFAULT TRUE,
                    approval_status VARCHAR(20) DEFAULT 'pending',
                    risk_level VARCHAR(20) DEFAULT 'High',
                    audit_trail JSONB DEFAULT '[]',
                    actions_performed JSONB DEFAULT '[]',
                    notified_users JSONB DEFAULT '[]',
                    is_active BOOLEAN DEFAULT FALSE,
                    auto_revoke_enabled BOOLEAN DEFAULT TRUE,
                    requires_review BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW(),
                    deleted_at TIMESTAMP,
                    status VARCHAR(20) DEFAULT 'pending'
                );
                
                CREATE INDEX IF NOT EXISTS idx_emergency_access_tenant ON emergency_access(tenant_id);
                CREATE INDEX IF NOT EXISTS idx_emergency_access_requester ON emergency_access(requester_user_id);
                CREATE INDEX IF NOT EXISTS idx_emergency_access_approver ON emergency_access(approved_by_user_id);
                CREATE INDEX IF NOT EXISTS idx_emergency_access_status ON emergency_access(status);
                CREATE INDEX IF NOT EXISTS idx_emergency_access_is_active ON emergency_access(is_active);
                CREATE INDEX IF NOT EXISTS idx_emergency_access_expires_at ON emergency_access(expires_at);
            ";

            await _context.Database.ExecuteSqlRawAsync(sql);
            Console.WriteLine("  ✓ emergency_access table created");
        }
    }
}
