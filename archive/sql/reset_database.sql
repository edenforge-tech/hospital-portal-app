-- Reset database: Drop all tables and reset migrations
-- WARNING: This will delete all data!

-- Drop all tables in the correct order (reverse dependencies)
DROP TABLE IF EXISTS user_department_access CASCADE;
DROP TABLE IF EXISTS user_access_audit CASCADE;
DROP TABLE IF EXISTS document_access_audit CASCADE;
DROP TABLE IF EXISTS patient_document_uploads CASCADE;
DROP TABLE IF EXISTS document_access_rules CASCADE;
DROP TABLE IF EXISTS document_types CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS admin_configurations CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;

-- Drop ASP.NET Identity tables
DROP TABLE IF EXISTS "AspNetUserRoles" CASCADE;
DROP TABLE IF EXISTS "AspNetUserClaims" CASCADE;
DROP TABLE IF EXISTS "AspNetUserLogins" CASCADE;
DROP TABLE IF EXISTS "AspNetUserTokens" CASCADE;
DROP TABLE IF EXISTS "AspNetRoles" CASCADE;
DROP TABLE IF EXISTS "AspNetRoleClaims" CASCADE;
DROP TABLE IF EXISTS "AspNetUsers" CASCADE;

-- Reset migration history
TRUNCATE TABLE "__EFMigrationsHistory" CASCADE;

-- Verify clean state
SELECT 'Database reset complete - all tables dropped' as status;