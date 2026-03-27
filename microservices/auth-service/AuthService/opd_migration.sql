START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE user_branch_access DROP CONSTRAINT "FK_user_branch_access_branch_branch_id";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE user_branch_access DROP CONSTRAINT "FK_user_branch_access_users_user_id";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE user_department_access DROP CONSTRAINT "FK_user_department_access_department_department_id";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE user_department_access DROP CONSTRAINT "FK_user_department_access_tenant_tenant_id";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE user_department_access DROP CONSTRAINT "FK_user_department_access_users_user_id";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE user_department_access DROP CONSTRAINT "PK_user_department_access";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE user_branch_access DROP CONSTRAINT "PK_user_branch_access";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE user_department_access DROP COLUMN effective_from;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE user_department_access DROP COLUMN granted_at;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE user_department_access DROP COLUMN role_id;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE user_branch_access DROP COLUMN access_level;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE user_branch_access DROP COLUMN deleted_at;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE user_branch_access DROP COLUMN valid_from;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE user_department_access RENAME TO department_access;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE user_branch_access RENAME TO user_branches;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department_access RENAME COLUMN created_by_user_id TO created_by;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department_access RENAME COLUMN sub_department_id TO updated_by;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department_access RENAME COLUMN revoked_by_user_id TO deleted_by;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department_access RENAME COLUMN is_primary TO can_export;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department_access RENAME COLUMN granted_by_user_id TO branch_id;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department_access RENAME COLUMN effective_to TO approved_at;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER INDEX "IX_user_department_access_user_id" RENAME TO "IX_department_access_user_id";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER INDEX "IX_user_department_access_tenant_id_user_id_department_id" RENAME TO "IX_department_access_tenant_id_user_id_department_id";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER INDEX "IX_user_department_access_department_id" RENAME TO "IX_department_access_department_id";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE user_branches RENAME COLUMN valid_until TO effective_until;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE user_branches RENAME COLUMN updated_by TO updated_by_user_id;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE user_branches RENAME COLUMN is_primary TO is_default;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE user_branches RENAME COLUMN created_by TO created_by_user_id;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE user_branches RENAME COLUMN assigned_on TO effective_from;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE user_branches RENAME COLUMN assigned_by TO assigned_by_user_id;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER INDEX "IX_user_branch_access_user_id" RENAME TO "IX_user_branches_user_id";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER INDEX "IX_user_branch_access_tenant_id_user_id_branch_id" RENAME TO "IX_user_branches_tenant_id_user_id_branch_id";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER INDEX "IX_user_branch_access_branch_id" RENAME TO "IX_user_branches_branch_id";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE users ADD "NpiNumber" text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE users ADD accepted_hipaa boolean NOT NULL DEFAULT FALSE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE users ADD accepted_hipaa_at timestamp with time zone;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE users ADD accepted_privacy boolean NOT NULL DEFAULT FALSE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE users ADD accepted_privacy_at timestamp with time zone;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE users ADD accepted_terms boolean NOT NULL DEFAULT FALSE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE users ADD accepted_terms_at timestamp with time zone;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE users ADD activation_status text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE users ADD compliance_acceptance_ip text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE users ADD email_verification_sent_at timestamp with time zone;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE users ADD email_verification_token text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE users ADD email_verified boolean NOT NULL DEFAULT FALSE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE users ADD failed_login_attempts integer NOT NULL DEFAULT 0;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE users ADD last_login_ip text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE users ADD last_password_change timestamp with time zone;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE users ADD locked_until timestamp with time zone;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE users ADD must_reset_password boolean NOT NULL DEFAULT FALSE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE users ADD one_time_password_hash text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE users ADD otp_expires_at timestamp with time zone;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE users ADD password_reset_token text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE users ADD reset_token_expires_at timestamp with time zone;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE tenant ADD address text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE tenant ADD city text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE tenant ADD country text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE tenant ADD pincode text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE tenant ADD state text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE tenant ADD tenant_type text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE organization ADD accreditation_status character varying(64);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE organization ADD address character varying(255);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE organization ADD city character varying(64);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE organization ADD date_format character varying(32);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE organization ADD description text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE organization ADD email character varying(128);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE organization ADD license_number character varying(64);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE organization ADD logo_url character varying(512);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE organization ADD number_format character varying(32);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE organization ADD operational_since timestamp with time zone;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE organization ADD organization_name character varying(128);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE organization ADD phone character varying(32);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE organization ADD postal_code character varying(16);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE organization ADD primary_color character varying(16);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE organization ADD primary_contact_email character varying(200);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE organization ADD primary_contact_name character varying(200);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE organization ADD primary_contact_phone character varying(50);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE organization ADD regulatory_body character varying(128);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE organization ADD secondary_color character varying(16);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE organization ADD time_format character varying(16);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE organization ADD website character varying(500);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department ADD can_have_subdepartments boolean NOT NULL DEFAULT FALSE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department ADD color character varying(20);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department ADD department_level integer NOT NULL DEFAULT 0;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department ADD display_order integer;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department ADD icon character varying(100);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department ADD inherit_permissions boolean NOT NULL DEFAULT FALSE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department ADD is_standard_department boolean NOT NULL DEFAULT FALSE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE branch ADD branch_type character varying(50);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE branch ADD website character varying(500);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE audit_log ADD "ComplianceFlags" text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE audit_log ADD "DataClassification" text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE audit_log ADD "EventHash" text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE audit_log ADD "IsImmutable" boolean NOT NULL DEFAULT FALSE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE audit_log ADD "IsSystemGenerated" boolean NOT NULL DEFAULT FALSE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE audit_log ADD "PreviousEventHash" text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE audit_log ADD "RetentionDays" integer NOT NULL DEFAULT 0;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE audit_log ADD "RetentionExpiry" timestamp with time zone;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE audit_log ADD "RiskLevel" text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE audit_log ADD "SequenceNumber" bigint;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE audit_log ADD "SessionId" text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE app_user_roles ALTER COLUMN branch_id DROP NOT NULL;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department_access ALTER COLUMN status TYPE character varying(50);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department_access ALTER COLUMN created_at SET DEFAULT (NOW());
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department_access ALTER COLUMN access_type TYPE character varying(20);
    ALTER TABLE department_access ALTER COLUMN access_type SET DEFAULT 'Secondary';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department_access ADD access_end_date timestamp with time zone;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department_access ADD access_start_date timestamp with time zone;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department_access ADD approval_notes character varying(500);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department_access ADD approved_by uuid;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department_access ADD can_approve boolean NOT NULL DEFAULT FALSE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department_access ADD can_create boolean NOT NULL DEFAULT FALSE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department_access ADD can_delete boolean NOT NULL DEFAULT FALSE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department_access ADD can_edit boolean NOT NULL DEFAULT FALSE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department_access ADD can_view boolean NOT NULL DEFAULT TRUE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department_access ADD is_active boolean NOT NULL DEFAULT TRUE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    UPDATE user_branches SET updated_at = TIMESTAMPTZ '-infinity' WHERE updated_at IS NULL;
    ALTER TABLE user_branches ALTER COLUMN updated_at SET NOT NULL;
    ALTER TABLE user_branches ALTER COLUMN updated_at SET DEFAULT TIMESTAMPTZ '-infinity';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE user_branches ADD assigned_at timestamp with time zone NOT NULL DEFAULT TIMESTAMPTZ '-infinity';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE user_branches ADD notes text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department_access ADD CONSTRAINT "PK_department_access" PRIMARY KEY (id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE user_branches ADD CONSTRAINT "PK_user_branches" PRIMARY KEY (id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE TABLE access_policy (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        policy_name character varying(200) NOT NULL,
        policy_code character varying(100),
        description character varying(500),
        policy_type character varying(50) NOT NULL,
        conditions jsonb,
        actions jsonb,
        resources jsonb,
        effect character varying(10) NOT NULL DEFAULT 'Deny',
        priority integer NOT NULL DEFAULT 100,
        applies_to_roles jsonb,
        applies_to_departments jsonb,
        applies_to_users jsonb,
        effective_from timestamp with time zone,
        effective_until timestamp with time zone,
        time_of_day_start interval,
        time_of_day_end interval,
        days_of_week character varying(100),
        is_active boolean NOT NULL DEFAULT TRUE,
        is_system_policy boolean NOT NULL DEFAULT FALSE,
        status character varying(20) NOT NULL DEFAULT 'active',
        created_at timestamp with time zone NOT NULL,
        created_by_user_id uuid,
        updated_at timestamp with time zone,
        updated_by_user_id uuid,
        deleted_at timestamp with time zone,
        evaluation_count integer NOT NULL DEFAULT 0,
        last_evaluated_at timestamp with time zone,
        CONSTRAINT "PK_access_policy" PRIMARY KEY (id),
        CONSTRAINT "FK_access_policy_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE,
        CONSTRAINT "FK_access_policy_users_created_by_user_id" FOREIGN KEY (created_by_user_id) REFERENCES users (id),
        CONSTRAINT "FK_access_policy_users_updated_by_user_id" FOREIGN KEY (updated_by_user_id) REFERENCES users (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE TABLE activation_audit_log (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        user_id uuid NOT NULL,
        activation_step character varying(50) NOT NULL,
        status character varying(20) NOT NULL,
        error_message text,
        ip_address character varying(45) NOT NULL,
        user_agent text,
        device_info text,
        geolocation_info text,
        timestamp timestamp with time zone NOT NULL,
        completed_at timestamp with time zone,
        request_data text,
        response_data text,
        response_time_ms integer,
        suspicious_activity boolean NOT NULL DEFAULT FALSE,
        compliance_notes text,
        created_at timestamp with time zone NOT NULL,
        CONSTRAINT "PK_activation_audit_log" PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE TABLE department_access_audit_log (
        id uuid NOT NULL,
        audit_number character varying(50) NOT NULL,
        user_id uuid NOT NULL,
        department_id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        branch_id uuid,
        department_access_id uuid,
        action character varying(50) NOT NULL,
        action_category character varying(30) NOT NULL,
        previous_state jsonb,
        new_state jsonb,
        changes_summary text,
        justification text,
        approval_request_id uuid,
        performed_by uuid NOT NULL,
        performed_by_role character varying(100),
        performed_by_ip character varying(45),
        user_agent text,
        compliance_flags jsonb,
        compliance_note text,
        security_classification character varying(30),
        is_emergency_access boolean NOT NULL,
        was_approved boolean,
        approved_by uuid,
        approved_at timestamp with time zone,
        timestamp timestamp with time zone NOT NULL,
        session_id character varying(100),
        correlation_id character varying(100),
        CONSTRAINT "PK_department_access_audit_log" PRIMARY KEY (id),
        CONSTRAINT "FK_department_access_audit_log_department_department_id" FOREIGN KEY (department_id) REFERENCES department (id) ON DELETE CASCADE,
        CONSTRAINT "FK_department_access_audit_log_users_performed_by" FOREIGN KEY (performed_by) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT "FK_department_access_audit_log_users_user_id" FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE TABLE department_access_request (
        id uuid NOT NULL,
        request_number character varying(50) NOT NULL,
        user_id uuid NOT NULL,
        department_id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        branch_id uuid,
        request_type character varying(20) NOT NULL,
        justification text NOT NULL,
        requested_access_type character varying(20) NOT NULL,
        requested_can_view boolean NOT NULL,
        requested_can_create boolean NOT NULL,
        requested_can_edit boolean NOT NULL,
        requested_can_delete boolean NOT NULL,
        requested_can_approve boolean NOT NULL,
        requested_can_export boolean NOT NULL,
        requested_access_start_date timestamp with time zone,
        requested_access_end_date timestamp with time zone,
        status character varying(20) NOT NULL,
        priority character varying(20) NOT NULL,
        reviewed_by uuid,
        reviewed_at timestamp with time zone,
        reviewer_role character varying(100),
        review_notes text,
        rejection_reason text,
        auto_approved boolean NOT NULL,
        auto_approval_reason text,
        created_at timestamp with time zone NOT NULL,
        created_by uuid NOT NULL,
        updated_at timestamp with time zone,
        updated_by uuid,
        deleted_at timestamp with time zone,
        deleted_by uuid,
        CONSTRAINT "PK_department_access_request" PRIMARY KEY (id),
        CONSTRAINT "FK_department_access_request_department_department_id" FOREIGN KEY (department_id) REFERENCES department (id) ON DELETE CASCADE,
        CONSTRAINT "FK_department_access_request_users_reviewed_by" FOREIGN KEY (reviewed_by) REFERENCES users (id),
        CONSTRAINT "FK_department_access_request_users_user_id" FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE TABLE "DepartmentAccessRules" (
        "Id" uuid NOT NULL,
        "TenantId" uuid NOT NULL,
        "BranchId" uuid,
        "DepartmentId" uuid NOT NULL,
        "DepartmentCode" text NOT NULL,
        "DepartmentName" text NOT NULL,
        "RequiresApproval" boolean NOT NULL,
        "ApproverRoleIds" text,
        "ApproverRoleNames" text,
        "RequiresSupervisor" boolean NOT NULL,
        "SupervisorRoleIds" text,
        "SupervisorRoleNames" text,
        "EnableAutoExpiration" boolean NOT NULL,
        "MaxAccessDurationDays" integer,
        "RestrictedPermissions" text,
        "RequiresJustification" boolean NOT NULL,
        "MinJustificationLength" integer,
        "AllowEmergencyAccess" boolean NOT NULL,
        "EmergencyRoleIds" text,
        "IsActive" boolean NOT NULL,
        "Status" text NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "CreatedByUserId" uuid,
        "UpdatedAt" timestamp with time zone NOT NULL,
        "UpdatedByUserId" uuid,
        "DeletedAt" timestamp with time zone,
        CONSTRAINT "PK_DepartmentAccessRules" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE TABLE device (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        user_id uuid NOT NULL,
        device_id character varying(255) NOT NULL,
        device_name character varying(200),
        device_type character varying(50),
        operating_system character varying(100),
        os_version character varying(50),
        browser character varying(100),
        browser_version character varying(50),
        ip_address character varying(45),
        location character varying(200),
        user_agent text,
        trust_level character varying(20) NOT NULL DEFAULT 'Untrusted',
        is_blocked boolean NOT NULL DEFAULT FALSE,
        block_reason character varying(500),
        is_primary_device boolean NOT NULL DEFAULT FALSE,
        registered_at timestamp with time zone NOT NULL,
        last_seen_at timestamp with time zone,
        last_login_at timestamp with time zone,
        total_logins integer NOT NULL DEFAULT 0,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone,
        deleted_at timestamp with time zone,
        status character varying(20) NOT NULL DEFAULT 'active',
        CONSTRAINT "PK_device" PRIMARY KEY (id),
        CONSTRAINT "FK_device_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE,
        CONSTRAINT "FK_device_users_user_id" FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE TABLE emergency_access (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        user_id uuid NOT NULL,
        access_code character varying(50),
        reason character varying(1000) NOT NULL,
        emergency_type character varying(100),
        patient_id uuid,
        granted_permissions jsonb,
        scope character varying(50) NOT NULL DEFAULT 'Limited',
        start_time timestamp with time zone NOT NULL,
        end_time timestamp with time zone NOT NULL,
        duration_minutes integer NOT NULL DEFAULT 60,
        auto_revoke_enabled boolean NOT NULL DEFAULT TRUE,
        requires_approval boolean NOT NULL DEFAULT TRUE,
        approved_by uuid,
        approved_at timestamp with time zone,
        approval_notes character varying(500),
        rejected_by uuid,
        rejected_at timestamp with time zone,
        rejection_reason character varying(500),
        revoked_at timestamp with time zone,
        revoked_by uuid,
        revocation_reason character varying(500),
        status character varying(20) NOT NULL DEFAULT 'pending',
        is_active boolean NOT NULL,
        audit_trail jsonb,
        actions_performed jsonb,
        notification_sent boolean NOT NULL DEFAULT FALSE,
        notified_users jsonb,
        requires_review boolean NOT NULL DEFAULT TRUE,
        reviewed_by uuid,
        reviewed_at timestamp with time zone,
        review_notes character varying(500),
        review_status character varying(50),
        risk_level character varying(20) NOT NULL DEFAULT 'High',
        suspicious_activity boolean NOT NULL DEFAULT FALSE,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone,
        CONSTRAINT "PK_emergency_access" PRIMARY KEY (id),
        CONSTRAINT "FK_emergency_access_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE,
        CONSTRAINT "FK_emergency_access_users_approved_by" FOREIGN KEY (approved_by) REFERENCES users (id),
        CONSTRAINT "FK_emergency_access_users_rejected_by" FOREIGN KEY (rejected_by) REFERENCES users (id),
        CONSTRAINT "FK_emergency_access_users_reviewed_by" FOREIGN KEY (reviewed_by) REFERENCES users (id),
        CONSTRAINT "FK_emergency_access_users_revoked_by" FOREIGN KEY (revoked_by) REFERENCES users (id),
        CONSTRAINT "FK_emergency_access_users_user_id" FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE TABLE password_reset_requests (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        user_id uuid NOT NULL,
        reset_token_hash character varying(500) NOT NULL,
        requested_at timestamp with time zone NOT NULL,
        requested_by_user_id uuid,
        expires_at timestamp with time zone NOT NULL,
        used_at timestamp with time zone,
        ip_address character varying(45),
        user_agent text,
        status character varying(20) NOT NULL,
        CONSTRAINT "PK_password_reset_requests" PRIMARY KEY (id),
        CONSTRAINT "FK_password_reset_requests_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE TABLE "SupervisedUsers" (
        "Id" uuid NOT NULL,
        "TenantId" uuid NOT NULL,
        "BranchId" uuid,
        "UserId" uuid NOT NULL,
        "UserName" text NOT NULL,
        "FirstName" text NOT NULL,
        "LastName" text NOT NULL,
        "Email" text NOT NULL,
        "Qualification" text,
        "YearsOfExperience" integer,
        "AssignedSupervisorId" uuid,
        "SupervisorName" text,
        "OversightLevel" text NOT NULL,
        "RequiresCoSignature" boolean NOT NULL,
        "SupervisionStartDate" timestamp with time zone,
        "SupervisionEndDate" timestamp with time zone,
        "ComplianceScore" integer NOT NULL,
        "LastComplianceCheck" timestamp with time zone,
        "ComplianceNotes" text,
        "TotalActivities" integer NOT NULL,
        "SupervisedActivities" integer NOT NULL,
        "PendingApprovals" integer NOT NULL,
        "LastActivityDate" timestamp with time zone,
        "Status" text NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "CreatedByUserId" uuid,
        "UpdatedAt" timestamp with time zone NOT NULL,
        "UpdatedByUserId" uuid,
        "DeletedAt" timestamp with time zone,
        CONSTRAINT "PK_SupervisedUsers" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE TABLE "SupervisorAssignments" (
        "Id" uuid NOT NULL,
        "TenantId" uuid NOT NULL,
        "BranchId" uuid,
        "SupervisorUserId" uuid NOT NULL,
        "SupervisorName" text NOT NULL,
        "Specialty" text,
        "MaxSupervisees" integer NOT NULL,
        "CurrentSupervisees" integer NOT NULL,
        "AvailableSlots" integer NOT NULL,
        "TotalSupervised" integer NOT NULL,
        "ActiveSupervisions" integer NOT NULL,
        "CompletedSupervisions" integer NOT NULL,
        "AverageComplianceScore" numeric NOT NULL,
        "IsActive" boolean NOT NULL,
        "Status" text NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_SupervisorAssignments" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE TABLE system_alert (
        id uuid NOT NULL,
        alert_type text NOT NULL,
        severity text NOT NULL,
        title text NOT NULL,
        description text,
        count integer NOT NULL,
        is_dismissed boolean NOT NULL,
        created_at timestamp with time zone NOT NULL,
        dismissed_at timestamp with time zone,
        CONSTRAINT "PK_system_alert" PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE TABLE system_settings (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        category text NOT NULL,
        key text NOT NULL,
        value text NOT NULL,
        data_type text NOT NULL,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        created_by_user_id uuid NOT NULL,
        updated_by_user_id uuid NOT NULL,
        CONSTRAINT "PK_system_settings" PRIMARY KEY (id),
        CONSTRAINT "FK_system_settings_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE TABLE user_activation_log (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        user_id uuid NOT NULL,
        activation_type character varying(50) NOT NULL,
        activated_at timestamp with time zone NOT NULL,
        activated_by_user_id uuid,
        otp_sent_at timestamp with time zone,
        otp_used_at timestamp with time zone,
        ip_address character varying(45),
        user_agent text,
        delivery_method character varying(20),
        credential_type character varying(20),
        created_at timestamp with time zone NOT NULL,
        created_by_user_id uuid,
        notes text,
        CONSTRAINT "PK_user_activation_log" PRIMARY KEY (id),
        CONSTRAINT "FK_user_activation_log_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE TABLE user_session (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        user_id uuid NOT NULL,
        device_id uuid,
        session_id character varying(255) NOT NULL,
        token_id character varying(255),
        refresh_token character varying(500),
        login_time timestamp with time zone NOT NULL,
        last_activity_time timestamp with time zone NOT NULL,
        expires_at timestamp with time zone NOT NULL,
        logout_time timestamp with time zone,
        is_active boolean NOT NULL DEFAULT TRUE,
        ip_address character varying(45),
        user_agent character varying(500),
        location character varying(200),
        session_type character varying(20) NOT NULL DEFAULT 'Web',
        login_method character varying(50),
        suspicious_activity boolean NOT NULL DEFAULT FALSE,
        termination_reason character varying(200),
        terminated_by uuid,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone,
        status character varying(20) NOT NULL,
        CONSTRAINT "PK_user_session" PRIMARY KEY (id),
        CONSTRAINT "FK_user_session_device_device_id" FOREIGN KEY (device_id) REFERENCES device (id),
        CONSTRAINT "FK_user_session_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE,
        CONSTRAINT "FK_user_session_users_terminated_by" FOREIGN KEY (terminated_by) REFERENCES users (id),
        CONSTRAINT "FK_user_session_users_user_id" FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_department_access_approved_by" ON department_access (approved_by);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_department_access_branch_id" ON department_access (branch_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_department_access_created_by" ON department_access (created_by);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_access_policy_created_by_user_id" ON access_policy (created_by_user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_access_policy_policy_code" ON access_policy (policy_code);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_access_policy_priority" ON access_policy (priority);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_access_policy_tenant_id_is_active" ON access_policy (tenant_id, is_active);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_access_policy_updated_by_user_id" ON access_policy (updated_by_user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_activation_audit_log_tenant_id_user_id" ON activation_audit_log (tenant_id, user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_activation_audit_log_timestamp" ON activation_audit_log (timestamp);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_department_access_audit_log_department_id" ON department_access_audit_log (department_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_department_access_audit_log_performed_by" ON department_access_audit_log (performed_by);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_department_access_audit_log_user_id" ON department_access_audit_log (user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_department_access_request_department_id" ON department_access_request (department_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_department_access_request_reviewed_by" ON department_access_request (reviewed_by);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_department_access_request_user_id" ON department_access_request (user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_device_device_id" ON device (device_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_device_tenant_id_user_id" ON device (tenant_id, user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_device_user_id_is_blocked" ON device (user_id, is_blocked);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_emergency_access_access_code" ON emergency_access (access_code);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_emergency_access_approved_by" ON emergency_access (approved_by);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_emergency_access_rejected_by" ON emergency_access (rejected_by);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_emergency_access_reviewed_by" ON emergency_access (reviewed_by);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_emergency_access_revoked_by" ON emergency_access (revoked_by);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_emergency_access_start_time_end_time" ON emergency_access (start_time, end_time);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_emergency_access_tenant_id_status" ON emergency_access (tenant_id, status);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_emergency_access_user_id_status" ON emergency_access (user_id, status);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_password_reset_requests_tenant_id" ON password_reset_requests (tenant_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE UNIQUE INDEX "IX_system_settings_tenant_id_category_key" ON system_settings (tenant_id, category, key);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_user_activation_log_tenant_id" ON user_activation_log (tenant_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_user_session_device_id" ON user_session (device_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_user_session_expires_at" ON user_session (expires_at);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_user_session_session_id" ON user_session (session_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_user_session_tenant_id_user_id" ON user_session (tenant_id, user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_user_session_terminated_by" ON user_session (terminated_by);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    CREATE INDEX "IX_user_session_user_id_is_active" ON user_session (user_id, is_active);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department_access ADD CONSTRAINT "FK_department_access_branch_branch_id" FOREIGN KEY (branch_id) REFERENCES branch (id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department_access ADD CONSTRAINT "FK_department_access_department_department_id" FOREIGN KEY (department_id) REFERENCES department (id) ON DELETE CASCADE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department_access ADD CONSTRAINT "FK_department_access_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department_access ADD CONSTRAINT "FK_department_access_users_approved_by" FOREIGN KEY (approved_by) REFERENCES users (id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department_access ADD CONSTRAINT "FK_department_access_users_created_by" FOREIGN KEY (created_by) REFERENCES users (id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE department_access ADD CONSTRAINT "FK_department_access_users_user_id" FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE user_branches ADD CONSTRAINT "FK_user_branches_branch_branch_id" FOREIGN KEY (branch_id) REFERENCES branch (id) ON DELETE CASCADE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    ALTER TABLE user_branches ADD CONSTRAINT "FK_user_branches_users_user_id" FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260113154156_AddHipaaComplianceColumnsToUsers', '9.0.10');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    ALTER TABLE users RENAME COLUMN "Designation" TO designation;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    ALTER TABLE users RENAME COLUMN "ProfessionalRegistrationDate" TO professional_registration_date;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    ALTER TABLE users RENAME COLUMN "NpiNumber" TO npi_number;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    ALTER TABLE users RENAME COLUMN "LicenseNumber" TO license_number;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    ALTER TABLE app_roles RENAME COLUMN "RoleLevel" TO hierarchy_level;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    ALTER TABLE app_roles RENAME COLUMN "ParentRoleId" TO parent_role_id;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    ALTER TABLE appointment ADD department_id uuid;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    ALTER TABLE appointment ADD end_time interval;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    ALTER TABLE appointment ADD is_recurring boolean NOT NULL DEFAULT FALSE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    ALTER TABLE appointment ADD parent_appointment_id uuid;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    ALTER TABLE appointment ADD patient_email character varying(255);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    ALTER TABLE appointment ADD patient_phone character varying(20);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    ALTER TABLE appointment ADD priority character varying(20) NOT NULL DEFAULT '';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    ALTER TABLE appointment ADD reason_for_visit text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    ALTER TABLE appointment ADD recurring_pattern character varying(50);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    ALTER TABLE appointment ADD start_time interval;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE "AccessLevelConfigurations" (
        "Id" uuid NOT NULL,
        "TenantId" uuid NOT NULL,
        "Level" integer NOT NULL,
        "LevelName" text NOT NULL,
        "PermissionCodes" text[] NOT NULL,
        "DaysFromStart" integer NOT NULL,
        "RequiresApproval" boolean NOT NULL,
        "Description" text NOT NULL,
        "IsActive" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_AccessLevelConfigurations" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE appointment_conflicts (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        appointment_id uuid,
        conflict_type character varying(50) NOT NULL,
        conflicting_appointment_id uuid,
        conflict_message text,
        detected_at timestamp with time zone NOT NULL,
        resolved_at timestamp with time zone,
        resolution_notes text,
        severity character varying(20) NOT NULL,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        status character varying(20) NOT NULL,
        CONSTRAINT "PK_appointment_conflicts" PRIMARY KEY (id),
        CONSTRAINT "FK_appointment_conflicts_appointment_appointment_id" FOREIGN KEY (appointment_id) REFERENCES appointment (id) ON DELETE CASCADE,
        CONSTRAINT "FK_appointment_conflicts_appointment_conflicting_appointment_id" FOREIGN KEY (conflicting_appointment_id) REFERENCES appointment (id) ON DELETE RESTRICT
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE appointment_reminders (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        appointment_id uuid NOT NULL,
        reminder_type character varying(20) NOT NULL,
        scheduled_time timestamp with time zone NOT NULL,
        sent_at timestamp with time zone,
        delivery_status character varying(20) NOT NULL,
        error_message text,
        retry_count integer NOT NULL,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        status character varying(20) NOT NULL,
        CONSTRAINT "PK_appointment_reminders" PRIMARY KEY (id),
        CONSTRAINT "FK_appointment_reminders_appointment_appointment_id" FOREIGN KEY (appointment_id) REFERENCES appointment (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE appointment_statistics (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        date_range_start timestamp with time zone NOT NULL,
        date_range_end timestamp with time zone NOT NULL,
        doctor_id uuid,
        department_id uuid,
        total_appointments integer NOT NULL,
        completed_appointments integer NOT NULL,
        cancelled_appointments integer NOT NULL,
        no_show_appointments integer NOT NULL,
        average_duration_minutes numeric,
        most_booked_time_slot character varying(20),
        utilization_rate numeric,
        calculated_at timestamp with time zone NOT NULL,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        CONSTRAINT "PK_appointment_statistics" PRIMARY KEY (id),
        CONSTRAINT "FK_appointment_statistics_department_department_id" FOREIGN KEY (department_id) REFERENCES department (id),
        CONSTRAINT "FK_appointment_statistics_users_doctor_id" FOREIGN KEY (doctor_id) REFERENCES users (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE bed_inventory (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        branch_id uuid NOT NULL,
        bed_number character varying(50) NOT NULL,
        bed_type character varying(50) NOT NULL,
        bed_status character varying(50) NOT NULL,
        floor_number integer,
        room_number character varying(50),
        ward_name character varying(100),
        patient_id uuid,
        assigned_at timestamp with time zone,
        expected_discharge_at timestamp with time zone,
        equipment_available character varying(500),
        is_isolation_bed boolean NOT NULL,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone,
        created_by_user_id uuid,
        updated_by_user_id uuid,
        deleted_at timestamp with time zone,
        status character varying(50) NOT NULL,
        CONSTRAINT "PK_bed_inventory" PRIMARY KEY (id),
        CONSTRAINT "FK_bed_inventory_branch_branch_id" FOREIGN KEY (branch_id) REFERENCES branch (id) ON DELETE CASCADE,
        CONSTRAINT "FK_bed_inventory_patient_patient_id" FOREIGN KEY (patient_id) REFERENCES patient (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE biometry_records (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        patient_id uuid NOT NULL,
        branch_id uuid,
        eye character varying(2) NOT NULL,
        axial_length numeric NOT NULL,
        k1 numeric NOT NULL,
        k2 numeric NOT NULL,
        k1_axis integer NOT NULL,
        acd numeric NOT NULL,
        lens_thickness numeric,
        white_to_white numeric,
        snr numeric,
        device character varying(100) NOT NULL,
        device_model character varying(100),
        target_refraction numeric NOT NULL,
        calculated_iol numeric,
        selected_formula character varying(50),
        iol_calculations text,
        examination_date timestamp with time zone NOT NULL,
        examiner_id uuid NOT NULL,
        notes text,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        created_by_user_id uuid,
        updated_by_user_id uuid,
        deleted_at timestamp with time zone,
        status character varying(50) NOT NULL,
        CONSTRAINT "PK_biometry_records" PRIMARY KEY (id),
        CONSTRAINT "FK_biometry_records_branch_branch_id" FOREIGN KEY (branch_id) REFERENCES branch (id),
        CONSTRAINT "FK_biometry_records_patient_patient_id" FOREIGN KEY (patient_id) REFERENCES patient (id) ON DELETE CASCADE,
        CONSTRAINT "FK_biometry_records_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE branch_capacity_history (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        branch_id uuid NOT NULL,
        snapshot_time timestamp with time zone NOT NULL,
        total_beds integer NOT NULL,
        general_beds_occupied integer NOT NULL,
        icu_beds_occupied integer NOT NULL,
        emergency_beds_occupied integer NOT NULL,
        available_beds integer NOT NULL,
        occupancy_percentage numeric NOT NULL,
        capacity_alert_level character varying(50) NOT NULL,
        created_at timestamp with time zone NOT NULL,
        CONSTRAINT "PK_branch_capacity_history" PRIMARY KEY (id),
        CONSTRAINT "FK_branch_capacity_history_branch_branch_id" FOREIGN KEY (branch_id) REFERENCES branch (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE bulk_operation_job (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        operation_type integer NOT NULL,
        entity_type integer NOT NULL,
        status text NOT NULL,
        total_records integer NOT NULL,
        processed_records integer NOT NULL,
        successful_records integer NOT NULL,
        failed_records integer NOT NULL,
        output_file_url text,
        created_by_user_id uuid NOT NULL,
        created_at timestamp with time zone NOT NULL,
        started_at timestamp with time zone,
        completed_at timestamp with time zone,
        CONSTRAINT "PK_bulk_operation_job" PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE doctor_availability (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        doctor_id uuid NOT NULL,
        day_of_week integer,
        specific_date timestamp with time zone,
        start_time interval NOT NULL,
        end_time interval NOT NULL,
        availability_type character varying(50) NOT NULL,
        reason text,
        is_recurring boolean NOT NULL,
        is_active boolean NOT NULL,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        created_by_user_id uuid,
        updated_by_user_id uuid,
        "DeletedAt" timestamp with time zone,
        "Status" character varying(20) NOT NULL,
        CONSTRAINT "PK_doctor_availability" PRIMARY KEY (id),
        CONSTRAINT "FK_doctor_availability_users_doctor_id" FOREIGN KEY (doctor_id) REFERENCES users (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE electrophysiology_tests (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        patient_id uuid NOT NULL,
        branch_id uuid,
        test_date timestamp with time zone NOT NULL,
        technician_id uuid,
        device character varying(100),
        test_type character varying(50) NOT NULL,
        test_protocol character varying(100),
        eye_tested character varying(10) NOT NULL,
        scotopic_a_wave numeric,
        scotopic_b_wave numeric,
        photopic_a_wave numeric,
        photopic_b_wave numeric,
        flicker_response numeric,
        p100_latency numeric,
        p100_amplitude numeric,
        arden_ratio numeric,
        light_peak numeric,
        dark_trough numeric,
        interpretation character varying(100),
        abnormality_type character varying(200),
        waveform_data text,
        image_paths text,
        notes text,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        deleted_at timestamp with time zone,
        created_by_user_id uuid,
        updated_by_user_id uuid,
        status character varying(50) NOT NULL,
        CONSTRAINT "PK_electrophysiology_tests" PRIMARY KEY (id),
        CONSTRAINT "FK_electrophysiology_tests_branch_branch_id" FOREIGN KEY (branch_id) REFERENCES branch (id),
        CONSTRAINT "FK_electrophysiology_tests_patient_patient_id" FOREIGN KEY (patient_id) REFERENCES patient (id) ON DELETE CASCADE,
        CONSTRAINT "FK_electrophysiology_tests_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE employee (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        user_id uuid NOT NULL,
        department_id uuid,
        manager_id uuid,
        employee_number text,
        hire_date timestamp with time zone NOT NULL,
        job_title text,
        emergency_contact_name text,
        emergency_contact_relationship text,
        emergency_contact_phone text,
        salary_grade text,
        base_salary numeric,
        benefits_package text,
        work_schedule text,
        status text NOT NULL,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone,
        deleted_at timestamp with time zone,
        created_by_user_id uuid,
        updated_by_user_id uuid,
        CONSTRAINT "PK_employee" PRIMARY KEY (id),
        CONSTRAINT "FK_employee_department_department_id" FOREIGN KEY (department_id) REFERENCES department (id),
        CONSTRAINT "FK_employee_employee_manager_id" FOREIGN KEY (manager_id) REFERENCES employee (id),
        CONSTRAINT "FK_employee_users_user_id" FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE employment_category_lookup (
        id uuid NOT NULL,
        category_code text NOT NULL,
        category_name text NOT NULL,
        description text NOT NULL,
        is_active boolean NOT NULL,
        display_order integer NOT NULL,
        created_at timestamp with time zone NOT NULL,
        created_by_user_id uuid,
        CONSTRAINT "PK_employment_category_lookup" PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE employment_type_lookup (
        id uuid NOT NULL,
        type_code text NOT NULL,
        type_name text NOT NULL,
        description text NOT NULL,
        is_active boolean NOT NULL,
        display_order integer NOT NULL,
        created_at timestamp with time zone NOT NULL,
        created_by_user_id uuid,
        CONSTRAINT "PK_employment_type_lookup" PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE follow_up_appointments (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        patient_id uuid NOT NULL,
        follow_up_type character varying(50) NOT NULL,
        related_procedure character varying(200),
        procedure_date timestamp with time zone,
        scheduled_date timestamp with time zone NOT NULL,
        scheduled_time character varying(10),
        status character varying(20) NOT NULL,
        priority character varying(20) NOT NULL,
        assigned_doctor_id uuid NOT NULL,
        department_id uuid NOT NULL,
        notes text,
        reminders_sent integer NOT NULL,
        last_reminder_date timestamp with time zone,
        completed_date timestamp with time zone,
        outcome text,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone,
        created_by_user_id uuid NOT NULL,
        updated_by_user_id uuid,
        deleted_at timestamp with time zone,
        CONSTRAINT "PK_follow_up_appointments" PRIMARY KEY (id),
        CONSTRAINT "FK_follow_up_appointments_department_department_id" FOREIGN KEY (department_id) REFERENCES department (id) ON DELETE CASCADE,
        CONSTRAINT "FK_follow_up_appointments_patient_patient_id" FOREIGN KEY (patient_id) REFERENCES patient (id) ON DELETE CASCADE,
        CONSTRAINT "FK_follow_up_appointments_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE,
        CONSTRAINT "FK_follow_up_appointments_users_assigned_doctor_id" FOREIGN KEY (assigned_doctor_id) REFERENCES users (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE iol_inventory (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        branch_id uuid,
        model character varying(200) NOT NULL,
        manufacturer character varying(100) NOT NULL,
        sku character varying(100) NOT NULL,
        type character varying(50) NOT NULL,
        material character varying(100) NOT NULL,
        a_constant numeric NOT NULL,
        power_range_min numeric NOT NULL,
        power_range_max numeric NOT NULL,
        power_increment numeric NOT NULL,
        optic_diameter numeric NOT NULL,
        overall_diameter numeric NOT NULL,
        cylinder_power_range character varying(50),
        toricity character varying(50),
        current_stock integer NOT NULL,
        minimum_stock integer NOT NULL,
        reorder_quantity integer NOT NULL,
        location character varying(100),
        unit_price numeric NOT NULL,
        supplier_cost numeric,
        supplier_id uuid,
        supplier_name character varying(200),
        lead_time_days integer,
        total_used integer NOT NULL,
        last_used_date timestamp with time zone,
        notes text,
        expiry_date timestamp with time zone,
        batch_number character varying(100),
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        created_by_user_id uuid,
        updated_by_user_id uuid,
        deleted_at timestamp with time zone,
        status character varying(50) NOT NULL,
        CONSTRAINT "PK_iol_inventory" PRIMARY KEY (id),
        CONSTRAINT "FK_iol_inventory_branch_branch_id" FOREIGN KEY (branch_id) REFERENCES branch (id),
        CONSTRAINT "FK_iol_inventory_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE oct_imaging_scans (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        patient_id uuid NOT NULL,
        branch_id uuid,
        eye character varying(10) NOT NULL,
        scan_date timestamp with time zone NOT NULL,
        technician_id uuid,
        device character varying(100),
        device_model character varying(100),
        scan_type character varying(50) NOT NULL,
        scan_pattern character varying(50),
        scan_size character varying(50),
        central_thickness numeric,
        average_thickness numeric,
        volume numeric,
        rnfl_average numeric,
        gcl_thickness numeric,
        pathology_detected boolean NOT NULL,
        pathology_type character varying(200),
        fluid_detected boolean NOT NULL,
        fluid_type character varying(100),
        image_paths text,
        data_file_path character varying(500),
        thumbnail_path character varying(500),
        signal_strength integer,
        quality_score integer,
        diagnosis character varying(500),
        notes text,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        deleted_at timestamp with time zone,
        created_by_user_id uuid,
        updated_by_user_id uuid,
        status character varying(50) NOT NULL,
        CONSTRAINT "PK_oct_imaging_scans" PRIMARY KEY (id),
        CONSTRAINT "FK_oct_imaging_scans_branch_branch_id" FOREIGN KEY (branch_id) REFERENCES branch (id),
        CONSTRAINT "FK_oct_imaging_scans_patient_patient_id" FOREIGN KEY (patient_id) REFERENCES patient (id) ON DELETE CASCADE,
        CONSTRAINT "FK_oct_imaging_scans_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE "OnboardingChecklistItems" (
        "Id" uuid NOT NULL,
        "WorkflowId" uuid NOT NULL,
        "TenantId" uuid NOT NULL,
        "Title" text NOT NULL,
        "Description" text NOT NULL,
        "Status" integer NOT NULL,
        "OrderIndex" integer NOT NULL,
        "IsRequired" boolean NOT NULL,
        "DueDate" timestamp with time zone,
        "CompletedAt" timestamp with time zone,
        "CompletedByUserId" uuid,
        "CompletionNotes" text,
        "Category" text NOT NULL,
        "DaysFromStart" integer NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_OnboardingChecklistItems" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE "OnboardingWorkflows" (
        "Id" uuid NOT NULL,
        "TenantId" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "UserName" text NOT NULL,
        "WorkflowName" text NOT NULL,
        "Status" integer NOT NULL,
        "StartDate" timestamp with time zone NOT NULL,
        "ExpectedCompletionDate" timestamp with time zone,
        "ActualCompletionDate" timestamp with time zone,
        "ProgressPercentage" integer NOT NULL,
        "MentorId" uuid,
        "MentorName" text,
        "CurrentAccessLevel" integer NOT NULL,
        "Day1AccessGrantedAt" timestamp with time zone,
        "Day7AccessGrantedAt" timestamp with time zone,
        "Day30AccessGrantedAt" timestamp with time zone,
        "Notes" text NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "CreatedByUserId" uuid NOT NULL,
        "UpdatedAt" timestamp with time zone,
        "UpdatedByUserId" uuid,
        CONSTRAINT "PK_OnboardingWorkflows" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE patient_reminders (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        patient_id uuid NOT NULL,
        reminder_type character varying(50) NOT NULL,
        message text NOT NULL,
        scheduled_date timestamp with time zone NOT NULL,
        channels text NOT NULL,
        status character varying(20) NOT NULL,
        sent_date timestamp with time zone,
        acknowledged boolean NOT NULL,
        acknowledged_date timestamp with time zone,
        failure_reason text,
        retry_count integer NOT NULL,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone,
        created_by_user_id uuid NOT NULL,
        updated_by_user_id uuid,
        deleted_at timestamp with time zone,
        CONSTRAINT "PK_patient_reminders" PRIMARY KEY (id),
        CONSTRAINT "FK_patient_reminders_patient_patient_id" FOREIGN KEY (patient_id) REFERENCES patient (id) ON DELETE CASCADE,
        CONSTRAINT "FK_patient_reminders_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE "PerformanceReviews" (
        "Id" uuid NOT NULL,
        "TenantId" uuid NOT NULL,
        "EmployeeId" uuid NOT NULL,
        "ReviewerId" uuid NOT NULL,
        "ReviewType" integer NOT NULL,
        "Status" integer NOT NULL,
        "ReviewPeriodStart" timestamp with time zone NOT NULL,
        "ReviewPeriodEnd" timestamp with time zone NOT NULL,
        "SubmittedAt" timestamp with time zone,
        "ApprovedAt" timestamp with time zone,
        "QualityOfWorkScore" integer,
        "ProductivityScore" integer,
        "TechnicalSkillsScore" integer,
        "CommunicationScore" integer,
        "TeamworkScore" integer,
        "InitiativeScore" integer,
        "ProblemSolvingScore" integer,
        "AdaptabilityScore" integer,
        "AttendancePunctualityScore" integer,
        "ProfessionalismScore" integer,
        "LearningDevelopmentScore" integer,
        "PolicyComplianceScore" integer,
        "CustomerServiceScore" integer,
        "WeightedScore" double precision,
        "StrengthsComments" text,
        "AreasForImprovementComments" text,
        "GoalsForNextPeriod" text,
        "ReviewerComments" text,
        "EmployeeComments" text,
        "ProbationDecision" integer,
        "ProbationExtensionDate" timestamp with time zone,
        "ProbationNotes" text,
        "Level1ApproverId" uuid,
        "Level1ApprovedAt" timestamp with time zone,
        "Level1Comments" text,
        "Level2ApproverId" uuid,
        "Level2ApprovedAt" timestamp with time zone,
        "Level2Comments" text,
        "Level3ApproverId" uuid,
        "Level3ApprovedAt" timestamp with time zone,
        "Level3Comments" text,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        "CreatedByUserId" uuid NOT NULL,
        "UpdatedByUserId" uuid NOT NULL,
        "DeletedAt" timestamp with time zone,
        "Status_Audit" text NOT NULL,
        CONSTRAINT "PK_PerformanceReviews" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE post_op_care_schedules (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        patient_id uuid NOT NULL,
        surgery_id uuid,
        surgery_type character varying(100) NOT NULL,
        surgery_date timestamp with time zone NOT NULL,
        surgery_eye character varying(10) NOT NULL,
        surgeon_id uuid NOT NULL,
        instructions text,
        restrictions text,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone,
        created_by_user_id uuid NOT NULL,
        updated_by_user_id uuid,
        deleted_at timestamp with time zone,
        CONSTRAINT "PK_post_op_care_schedules" PRIMARY KEY (id),
        CONSTRAINT "FK_post_op_care_schedules_patient_patient_id" FOREIGN KEY (patient_id) REFERENCES patient (id) ON DELETE CASCADE,
        CONSTRAINT "FK_post_op_care_schedules_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE,
        CONSTRAINT "FK_post_op_care_schedules_users_surgeon_id" FOREIGN KEY (surgeon_id) REFERENCES users (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE professional_license (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        user_id uuid,
        license_type text NOT NULL,
        license_category text,
        license_number text,
        issuing_authority text,
        issuing_country text,
        issuing_state text,
        issue_date timestamp with time zone,
        expiry_date timestamp with time zone,
        verification_status text NOT NULL,
        verified_at timestamp with time zone,
        verified_by_user_id uuid,
        verification_notes text,
        document_url text,
        renewal_document_url text,
        scope_of_practice text,
        restrictions text,
        specializations text,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone,
        created_by_user_id uuid,
        updated_by_user_id uuid,
        deleted_at timestamp with time zone,
        status text NOT NULL,
        CONSTRAINT "PK_professional_license" PRIMARY KEY (id),
        CONSTRAINT "FK_professional_license_users_user_id" FOREIGN KEY (user_id) REFERENCES users (id),
        CONSTRAINT "FK_professional_license_users_verified_by_user_id" FOREIGN KEY (verified_by_user_id) REFERENCES users (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE retinopathy_screenings (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        patient_id uuid NOT NULL,
        branch_id uuid,
        eye character varying(10) NOT NULL,
        screening_date timestamp with time zone NOT NULL,
        screener_id uuid,
        device character varying(100),
        device_model character varying(100),
        dr_grade character varying(50) NOT NULL,
        macular_edema character varying(50),
        hemorrhages_count integer,
        microaneurysms_count integer,
        hard_exudates boolean NOT NULL,
        soft_exudates boolean NOT NULL,
        neovascularization boolean NOT NULL,
        venous_beading boolean NOT NULL,
        irma boolean NOT NULL,
        image_paths text,
        thumbnail_path character varying(500),
        referral_required boolean NOT NULL,
        follow_up_months integer,
        treatment_recommended character varying(200),
        notes text,
        ai_grade character varying(50),
        ai_confidence numeric,
        grader_agreement boolean,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        deleted_at timestamp with time zone,
        created_by_user_id uuid,
        updated_by_user_id uuid,
        status character varying(50) NOT NULL,
        CONSTRAINT "PK_retinopathy_screenings" PRIMARY KEY (id),
        CONSTRAINT "FK_retinopathy_screenings_branch_branch_id" FOREIGN KEY (branch_id) REFERENCES branch (id),
        CONSTRAINT "FK_retinopathy_screenings_patient_patient_id" FOREIGN KEY (patient_id) REFERENCES patient (id) ON DELETE CASCADE,
        CONSTRAINT "FK_retinopathy_screenings_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE role_hierarchy (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        parent_role_id uuid NOT NULL,
        child_role_id uuid NOT NULL,
        level integer NOT NULL DEFAULT 1,
        path character varying(500) NOT NULL,
        inheritance_type character varying(50) NOT NULL DEFAULT 'inherit_all',
        inheritance_config jsonb NOT NULL DEFAULT '{}',
        is_active boolean NOT NULL DEFAULT TRUE,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        deleted_at timestamp with time zone,
        created_by_user_id uuid,
        updated_by_user_id uuid,
        deleted_by uuid,
        status character varying(50) NOT NULL DEFAULT 'active',
        CONSTRAINT "PK_role_hierarchy" PRIMARY KEY (id),
        CONSTRAINT "FK_role_hierarchy_app_roles_child_role_id" FOREIGN KEY (child_role_id) REFERENCES app_roles (id) ON DELETE RESTRICT,
        CONSTRAINT "FK_role_hierarchy_app_roles_parent_role_id" FOREIGN KEY (parent_role_id) REFERENCES app_roles (id) ON DELETE RESTRICT
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE role_template (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        name character varying(100) NOT NULL,
        description character varying(500) NOT NULL,
        role_type character varying(50) NOT NULL,
        template_category character varying(50) NOT NULL,
        priority integer NOT NULL DEFAULT 0,
        configuration jsonb NOT NULL DEFAULT '{}',
        metadata jsonb NOT NULL DEFAULT '{}',
        is_active boolean NOT NULL DEFAULT TRUE,
        is_system_template boolean NOT NULL DEFAULT FALSE,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        deleted_at timestamp with time zone,
        created_by_user_id uuid,
        updated_by_user_id uuid,
        deleted_by uuid,
        status character varying(50) NOT NULL DEFAULT 'active',
        CONSTRAINT "PK_role_template" PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE "SavedSearches" (
        "Id" uuid NOT NULL,
        "TenantId" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "SearchName" character varying(200) NOT NULL,
        "Criteria" text NOT NULL,
        "Scope" integer NOT NULL,
        "IsGlobal" boolean NOT NULL,
        "IsFavorite" boolean NOT NULL,
        "ExecutionCount" integer NOT NULL,
        "LastExecutedAt" timestamp with time zone,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        "CreatedByUserId" uuid NOT NULL,
        "UpdatedByUserId" uuid NOT NULL,
        "DeletedAt" timestamp with time zone,
        CONSTRAINT "PK_SavedSearches" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE "TrainingAssignments" (
        "Id" uuid NOT NULL,
        "TenantId" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "CourseId" uuid NOT NULL,
        "AssignedDate" timestamp with time zone NOT NULL,
        "DueDate" timestamp with time zone,
        "TrainingStatus" integer NOT NULL,
        "CompletionDate" timestamp with time zone,
        "ExpiryDate" timestamp with time zone,
        "CompletionCertificateUrl" text,
        "Notes" text,
        "AssignedByUserId" uuid,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        "CreatedByUserId" uuid NOT NULL,
        "UpdatedByUserId" uuid NOT NULL,
        "DeletedAt" timestamp with time zone,
        "Status" text NOT NULL,
        CONSTRAINT "PK_TrainingAssignments" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE "TrainingCourses" (
        "Id" uuid NOT NULL,
        "TenantId" uuid NOT NULL,
        "CourseName" character varying(200) NOT NULL,
        "Description" text,
        "IsMandatory" boolean NOT NULL,
        "ValidityPeriodDays" integer NOT NULL,
        "CourseProvider" text,
        "DurationHours" integer,
        "CourseUrl" text,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        "CreatedByUserId" uuid NOT NULL,
        "UpdatedByUserId" uuid NOT NULL,
        "DeletedAt" timestamp with time zone,
        "Status" text NOT NULL,
        CONSTRAINT "PK_TrainingCourses" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE treatment_adherence (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        patient_id uuid NOT NULL,
        condition character varying(200) NOT NULL,
        treatment_plan character varying(500) NOT NULL,
        start_date timestamp with time zone NOT NULL,
        end_date timestamp with time zone,
        scheduled_appointments integer NOT NULL,
        completed_appointments integer NOT NULL,
        missed_appointments integer NOT NULL,
        adherence_rate numeric NOT NULL,
        risk_level character varying(20) NOT NULL,
        recommendations text,
        last_review_date timestamp with time zone,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone,
        created_by_user_id uuid NOT NULL,
        updated_by_user_id uuid,
        deleted_at timestamp with time zone,
        CONSTRAINT "PK_treatment_adherence" PRIMARY KEY (id),
        CONSTRAINT "FK_treatment_adherence_patient_patient_id" FOREIGN KEY (patient_id) REFERENCES patient (id) ON DELETE CASCADE,
        CONSTRAINT "FK_treatment_adherence_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE user_role_history (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        user_id uuid NOT NULL,
        role_id uuid NOT NULL,
        action character varying(50) NOT NULL,
        reason character varying(500) NOT NULL,
        action_timestamp timestamp with time zone NOT NULL,
        effective_from timestamp with time zone,
        effective_until timestamp with time zone,
        assigned_by_user_id uuid NOT NULL,
        branch_id uuid,
        metadata jsonb NOT NULL DEFAULT '{}',
        created_at timestamp with time zone NOT NULL,
        status character varying(50) NOT NULL DEFAULT 'active',
        CONSTRAINT "PK_user_role_history" PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE "UserCredentials" (
        "Id" uuid NOT NULL,
        "TenantId" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "CredentialName" character varying(200) NOT NULL,
        "CredentialType" text,
        "IssuingAuthority" text,
        "CredentialNumber" text,
        "IssuedDate" timestamp with time zone NOT NULL,
        "ExpiryDate" timestamp with time zone,
        "CredentialStatus" integer NOT NULL,
        "IsRequired" boolean NOT NULL,
        "DocumentUrl" text,
        "SuspendedAt" timestamp with time zone,
        "SuspendedByUserId" uuid,
        "SuspensionReason" text,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        "CreatedByUserId" uuid NOT NULL,
        "UpdatedByUserId" uuid NOT NULL,
        "DeletedAt" timestamp with time zone,
        "Status" text NOT NULL,
        CONSTRAINT "PK_UserCredentials" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE patient_transfer_request (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        patient_id uuid NOT NULL,
        from_branch_id uuid NOT NULL,
        to_branch_id uuid NOT NULL,
        requested_by_user_id uuid NOT NULL,
        request_date timestamp with time zone NOT NULL,
        transfer_reason character varying(500) NOT NULL,
        required_bed_type character varying(50),
        transfer_status character varying(50) NOT NULL,
        approved_by_user_id uuid,
        approved_at timestamp with time zone,
        rejected_reason character varying(500),
        transferred_at timestamp with time zone,
        assigned_bed_id uuid,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone,
        created_by_user_id uuid,
        updated_by_user_id uuid,
        deleted_at timestamp with time zone,
        status character varying(50) NOT NULL,
        CONSTRAINT "PK_patient_transfer_request" PRIMARY KEY (id),
        CONSTRAINT "FK_patient_transfer_request_bed_inventory_assigned_bed_id" FOREIGN KEY (assigned_bed_id) REFERENCES bed_inventory (id),
        CONSTRAINT "FK_patient_transfer_request_branch_from_branch_id" FOREIGN KEY (from_branch_id) REFERENCES branch (id) ON DELETE CASCADE,
        CONSTRAINT "FK_patient_transfer_request_branch_to_branch_id" FOREIGN KEY (to_branch_id) REFERENCES branch (id) ON DELETE CASCADE,
        CONSTRAINT "FK_patient_transfer_request_patient_patient_id" FOREIGN KEY (patient_id) REFERENCES patient (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE employment_contract (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        employee_id uuid NOT NULL,
        contract_type text NOT NULL,
        start_date timestamp with time zone NOT NULL,
        end_date timestamp with time zone,
        contract_terms text,
        document_url text,
        auto_renewal boolean NOT NULL,
        renewal_notice_days integer,
        renewal_status text NOT NULL,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone,
        created_by_user_id uuid,
        updated_by_user_id uuid,
        deleted_at timestamp with time zone,
        deleted_by_user_id uuid,
        status text NOT NULL,
        CONSTRAINT "PK_employment_contract" PRIMARY KEY (id),
        CONSTRAINT "FK_employment_contract_employee_employee_id" FOREIGN KEY (employee_id) REFERENCES employee (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE probation_tracking (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        employee_id uuid NOT NULL,
        probation_start_date timestamp with time zone NOT NULL,
        probation_end_date timestamp with time zone NOT NULL,
        probation_status text NOT NULL,
        confirmation_date timestamp with time zone,
        reviewed_by_user_id uuid,
        review_notes text,
        extension_days integer,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone,
        created_by_user_id uuid,
        updated_by_user_id uuid,
        deleted_at timestamp with time zone,
        deleted_by_user_id uuid,
        status text NOT NULL,
        CONSTRAINT "PK_probation_tracking" PRIMARY KEY (id),
        CONSTRAINT "FK_probation_tracking_employee_employee_id" FOREIGN KEY (employee_id) REFERENCES employee (id) ON DELETE CASCADE,
        CONSTRAINT "FK_probation_tracking_users_reviewed_by_user_id" FOREIGN KEY (reviewed_by_user_id) REFERENCES users (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE iol_stock_adjustments (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        item_id uuid NOT NULL,
        quantity integer NOT NULL,
        type character varying(50) NOT NULL,
        reason text NOT NULL,
        patient_id uuid,
        surgery_id uuid,
        batch_number character varying(100),
        expiry_date timestamp with time zone,
        created_at timestamp with time zone NOT NULL,
        created_by_user_id uuid NOT NULL,
        CONSTRAINT "PK_iol_stock_adjustments" PRIMARY KEY (id),
        CONSTRAINT "FK_iol_stock_adjustments_iol_inventory_item_id" FOREIGN KEY (item_id) REFERENCES iol_inventory (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE post_op_medications (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        post_op_care_schedule_id uuid NOT NULL,
        medication_name character varying(200) NOT NULL,
        dosage character varying(100) NOT NULL,
        frequency character varying(100) NOT NULL,
        start_date timestamp with time zone NOT NULL,
        end_date timestamp with time zone NOT NULL,
        adherence character varying(20) NOT NULL,
        last_refill_date timestamp with time zone,
        notes text,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone,
        created_by_user_id uuid NOT NULL,
        updated_by_user_id uuid,
        deleted_at timestamp with time zone,
        CONSTRAINT "PK_post_op_medications" PRIMARY KEY (id),
        CONSTRAINT "FK_post_op_medications_post_op_care_schedules_post_op_care_sch~" FOREIGN KEY (post_op_care_schedule_id) REFERENCES post_op_care_schedules (id) ON DELETE CASCADE,
        CONSTRAINT "FK_post_op_medications_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE post_op_visits (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        post_op_care_schedule_id uuid NOT NULL,
        visit_name character varying(50) NOT NULL,
        scheduled_date timestamp with time zone NOT NULL,
        completed boolean NOT NULL,
        completed_date timestamp with time zone,
        findings text,
        visual_acuity character varying(50),
        iop numeric,
        complications text,
        examiner_id uuid,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone,
        created_by_user_id uuid NOT NULL,
        updated_by_user_id uuid,
        deleted_at timestamp with time zone,
        CONSTRAINT "PK_post_op_visits" PRIMARY KEY (id),
        CONSTRAINT "FK_post_op_visits_post_op_care_schedules_post_op_care_schedule~" FOREIGN KEY (post_op_care_schedule_id) REFERENCES post_op_care_schedules (id) ON DELETE CASCADE,
        CONSTRAINT "FK_post_op_visits_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE,
        CONSTRAINT "FK_post_op_visits_users_examiner_id" FOREIGN KEY (examiner_id) REFERENCES users (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE TABLE medication_adherence (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        treatment_adherence_id uuid NOT NULL,
        medication_name character varying(200) NOT NULL,
        prescribed_dosage character varying(100) NOT NULL,
        adherence_percentage numeric NOT NULL,
        missed_doses integer NOT NULL,
        last_taken_date timestamp with time zone,
        notes text,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone,
        created_by_user_id uuid NOT NULL,
        updated_by_user_id uuid,
        deleted_at timestamp with time zone,
        CONSTRAINT "PK_medication_adherence" PRIMARY KEY (id),
        CONSTRAINT "FK_medication_adherence_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE,
        CONSTRAINT "FK_medication_adherence_treatment_adherence_treatment_adherenc~" FOREIGN KEY (treatment_adherence_id) REFERENCES treatment_adherence (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_appointment_department_id" ON appointment (department_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_appointment_parent_appointment_id" ON appointment (parent_appointment_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_appointment_conflicts_appointment_id" ON appointment_conflicts (appointment_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_appointment_conflicts_conflicting_appointment_id" ON appointment_conflicts (conflicting_appointment_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_appointment_reminders_appointment_id" ON appointment_reminders (appointment_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_appointment_statistics_department_id" ON appointment_statistics (department_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_appointment_statistics_doctor_id" ON appointment_statistics (doctor_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_bed_inventory_branch_id" ON bed_inventory (branch_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_bed_inventory_patient_id" ON bed_inventory (patient_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_biometry_records_branch_id" ON biometry_records (branch_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_biometry_records_patient_id" ON biometry_records (patient_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_biometry_records_tenant_id" ON biometry_records (tenant_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_branch_capacity_history_branch_id" ON branch_capacity_history (branch_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_bulk_operation_job_created_at" ON bulk_operation_job (created_at);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_bulk_operation_job_operation_type" ON bulk_operation_job (operation_type);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_bulk_operation_job_status" ON bulk_operation_job (status);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_bulk_operation_job_tenant_id" ON bulk_operation_job (tenant_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_doctor_availability_doctor_id" ON doctor_availability (doctor_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_electrophysiology_tests_branch_id" ON electrophysiology_tests (branch_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_electrophysiology_tests_patient_id" ON electrophysiology_tests (patient_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_electrophysiology_tests_tenant_id" ON electrophysiology_tests (tenant_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_employee_department_id" ON employee (department_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_employee_employee_number" ON employee (employee_number);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_employee_manager_id" ON employee (manager_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_employee_tenant_id" ON employee (tenant_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_employee_user_id" ON employee (user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_employment_contract_employee_id" ON employment_contract (employee_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_employment_contract_tenant_id" ON employment_contract (tenant_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_follow_up_appointments_assigned_doctor_id" ON follow_up_appointments (assigned_doctor_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_follow_up_appointments_department_id" ON follow_up_appointments (department_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_follow_up_appointments_patient_id" ON follow_up_appointments (patient_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_follow_up_appointments_tenant_id" ON follow_up_appointments (tenant_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_iol_inventory_branch_id" ON iol_inventory (branch_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_iol_inventory_tenant_id" ON iol_inventory (tenant_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_iol_stock_adjustments_item_id" ON iol_stock_adjustments (item_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_medication_adherence_tenant_id" ON medication_adherence (tenant_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_medication_adherence_treatment_adherence_id" ON medication_adherence (treatment_adherence_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_oct_imaging_scans_branch_id" ON oct_imaging_scans (branch_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_oct_imaging_scans_patient_id" ON oct_imaging_scans (patient_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_oct_imaging_scans_tenant_id" ON oct_imaging_scans (tenant_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_patient_reminders_patient_id" ON patient_reminders (patient_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_patient_reminders_tenant_id" ON patient_reminders (tenant_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_patient_transfer_request_assigned_bed_id" ON patient_transfer_request (assigned_bed_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_patient_transfer_request_from_branch_id" ON patient_transfer_request (from_branch_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_patient_transfer_request_patient_id" ON patient_transfer_request (patient_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_patient_transfer_request_to_branch_id" ON patient_transfer_request (to_branch_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_post_op_care_schedules_patient_id" ON post_op_care_schedules (patient_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_post_op_care_schedules_surgeon_id" ON post_op_care_schedules (surgeon_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_post_op_care_schedules_tenant_id" ON post_op_care_schedules (tenant_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_post_op_medications_post_op_care_schedule_id" ON post_op_medications (post_op_care_schedule_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_post_op_medications_tenant_id" ON post_op_medications (tenant_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_post_op_visits_examiner_id" ON post_op_visits (examiner_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_post_op_visits_post_op_care_schedule_id" ON post_op_visits (post_op_care_schedule_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_post_op_visits_tenant_id" ON post_op_visits (tenant_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_probation_tracking_employee_id" ON probation_tracking (employee_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_probation_tracking_reviewed_by_user_id" ON probation_tracking (reviewed_by_user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_probation_tracking_tenant_id" ON probation_tracking (tenant_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_professional_license_expiry_date" ON professional_license (expiry_date);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_professional_license_tenant_id" ON professional_license (tenant_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_professional_license_user_id" ON professional_license (user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_professional_license_verification_status" ON professional_license (verification_status);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_professional_license_verified_by_user_id" ON professional_license (verified_by_user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_retinopathy_screenings_branch_id" ON retinopathy_screenings (branch_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_retinopathy_screenings_patient_id" ON retinopathy_screenings (patient_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_retinopathy_screenings_tenant_id" ON retinopathy_screenings (tenant_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_role_hierarchy_child_role_id" ON role_hierarchy (child_role_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_role_hierarchy_parent_role_id" ON role_hierarchy (parent_role_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_role_hierarchy_parent_role_id_child_role_id" ON role_hierarchy (parent_role_id, child_role_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_role_hierarchy_tenant_id" ON role_hierarchy (tenant_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_role_hierarchy_tenant_id_child_role_id" ON role_hierarchy (tenant_id, child_role_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_role_hierarchy_tenant_id_parent_role_id" ON role_hierarchy (tenant_id, parent_role_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_role_template_role_type" ON role_template (role_type);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_role_template_template_category" ON role_template (template_category);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_role_template_tenant_id" ON role_template (tenant_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_role_template_tenant_id_is_active" ON role_template (tenant_id, is_active);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_role_template_tenant_id_name" ON role_template (tenant_id, name);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_treatment_adherence_patient_id" ON treatment_adherence (patient_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_treatment_adherence_tenant_id" ON treatment_adherence (tenant_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_user_role_history_action_timestamp" ON user_role_history (action_timestamp);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_user_role_history_role_id" ON user_role_history (role_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_user_role_history_tenant_id" ON user_role_history (tenant_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_user_role_history_tenant_id_role_id" ON user_role_history (tenant_id, role_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_user_role_history_tenant_id_user_id" ON user_role_history (tenant_id, user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_user_role_history_user_id" ON user_role_history (user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    CREATE INDEX "IX_user_role_history_user_id_role_id" ON user_role_history (user_id, role_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    ALTER TABLE appointment ADD CONSTRAINT "FK_appointment_appointment_parent_appointment_id" FOREIGN KEY (parent_appointment_id) REFERENCES appointment (id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    ALTER TABLE appointment ADD CONSTRAINT "FK_appointment_department_department_id" FOREIGN KEY (department_id) REFERENCES department (id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260128110118_AddFollowUpManagementTables', '9.0.10');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE TABLE billing_rules (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        branch_id uuid,
        name character varying(100) NOT NULL,
        visit_type character varying(30) NOT NULL,
        free_days integer NOT NULL,
        free_visits integer NOT NULL,
        condition character varying(30) NOT NULL,
        default_fee numeric(10,2) NOT NULL,
        is_active boolean NOT NULL DEFAULT TRUE,
        priority integer NOT NULL,
        description character varying(500),
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone,
        created_by_user_id uuid NOT NULL,
        updated_by_user_id uuid,
        deleted_at timestamp with time zone,
        CONSTRAINT "PK_billing_rules" PRIMARY KEY (id),
        CONSTRAINT "FK_billing_rules_branch_branch_id" FOREIGN KEY (branch_id) REFERENCES branch (id),
        CONSTRAINT "FK_billing_rules_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE,
        CONSTRAINT "FK_billing_rules_users_created_by_user_id" FOREIGN KEY (created_by_user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT "FK_billing_rules_users_updated_by_user_id" FOREIGN KEY (updated_by_user_id) REFERENCES users (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE TABLE drug_interaction (
        id uuid NOT NULL,
        drug1_name character varying(200) NOT NULL,
        drug2_name character varying(200) NOT NULL,
        interaction_type character varying(50) NOT NULL,
        severity character varying(50) NOT NULL,
        description text NOT NULL,
        clinical_effects text,
        mechanism text,
        management text,
        reference_sources text,
        is_active boolean NOT NULL DEFAULT TRUE,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        CONSTRAINT "PK_drug_interaction" PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE TABLE medication_master (
        id uuid NOT NULL,
        name character varying(200) NOT NULL,
        generic_name character varying(200),
        brand_names text[],
        category character varying(100) NOT NULL,
        form character varying(50) NOT NULL,
        standard_dosages text[],
        route character varying(50) NOT NULL,
        contraindications text,
        side_effects text,
        pregnancy_category character varying(10),
        requires_prescription boolean NOT NULL DEFAULT TRUE,
        is_controlled_substance boolean NOT NULL DEFAULT FALSE,
        is_active boolean NOT NULL DEFAULT TRUE,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        CONSTRAINT "PK_medication_master" PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE TABLE opd_bills (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        bill_number character varying(30) NOT NULL,
        patient_id uuid NOT NULL,
        appointment_id uuid NOT NULL,
        branch_id uuid NOT NULL,
        visit_type character varying(30) NOT NULL,
        consultant_id uuid,
        consultation_fee numeric(10,2) NOT NULL,
        service_charges numeric(10,2) NOT NULL,
        investigation_charges numeric(10,2) NOT NULL,
        other_charges numeric(10,2) NOT NULL,
        gross_amount numeric(10,2) NOT NULL,
        discount_amount numeric(10,2) NOT NULL,
        discount_percentage numeric(5,2) NOT NULL,
        discount_reason character varying(200),
        discount_authorized_by uuid,
        tax_amount numeric(10,2) NOT NULL,
        tax_percentage numeric(5,2) NOT NULL,
        net_amount numeric(10,2) NOT NULL,
        amount_paid numeric(10,2) NOT NULL,
        balance_due numeric(10,2) NOT NULL,
        status character varying(30) NOT NULL,
        is_free_visit boolean NOT NULL DEFAULT FALSE,
        free_visit_reason character varying(200),
        is_credit boolean NOT NULL DEFAULT FALSE,
        credit_approved_by uuid,
        credit_approved_at timestamp with time zone,
        credit_notes text,
        is_insurance boolean NOT NULL DEFAULT FALSE,
        insurance_provider character varying(100),
        insurance_policy_number character varying(50),
        insurance_preauth_number character varying(50),
        insurance_approved_amount numeric(10,2),
        is_corporate boolean NOT NULL DEFAULT FALSE,
        corporate_account_id uuid,
        corporate_authorization_doc character varying(500),
        bill_items jsonb,
        finalized_at timestamp with time zone,
        finalized_by uuid,
        notes text,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone,
        created_by_user_id uuid NOT NULL,
        updated_by_user_id uuid,
        deleted_at timestamp with time zone,
        CONSTRAINT "PK_opd_bills" PRIMARY KEY (id),
        CONSTRAINT "FK_opd_bills_appointment_appointment_id" FOREIGN KEY (appointment_id) REFERENCES appointment (id) ON DELETE CASCADE,
        CONSTRAINT "FK_opd_bills_branch_branch_id" FOREIGN KEY (branch_id) REFERENCES branch (id) ON DELETE CASCADE,
        CONSTRAINT "FK_opd_bills_patient_patient_id" FOREIGN KEY (patient_id) REFERENCES patient (id) ON DELETE CASCADE,
        CONSTRAINT "FK_opd_bills_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE,
        CONSTRAINT "FK_opd_bills_users_consultant_id" FOREIGN KEY (consultant_id) REFERENCES users (id),
        CONSTRAINT "FK_opd_bills_users_created_by_user_id" FOREIGN KEY (created_by_user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT "FK_opd_bills_users_credit_approved_by" FOREIGN KEY (credit_approved_by) REFERENCES users (id),
        CONSTRAINT "FK_opd_bills_users_discount_authorized_by" FOREIGN KEY (discount_authorized_by) REFERENCES users (id),
        CONSTRAINT "FK_opd_bills_users_finalized_by" FOREIGN KEY (finalized_by) REFERENCES users (id),
        CONSTRAINT "FK_opd_bills_users_updated_by_user_id" FOREIGN KEY (updated_by_user_id) REFERENCES users (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE TABLE prescription (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        patient_id uuid NOT NULL,
        doctor_id uuid NOT NULL,
        prescription_date timestamp with time zone NOT NULL,
        diagnosis text NOT NULL,
        instructions text,
        duration_days integer,
        follow_up_date timestamp with time zone,
        status character varying(50) NOT NULL DEFAULT 'active',
        pharmacy_id uuid,
        pharmacy_name character varying(200),
        pharmacy_contact character varying(100),
        dispensed_date timestamp with time zone,
        dispensed_by_user_id uuid,
        notes text,
        is_printed boolean NOT NULL DEFAULT FALSE,
        printed_at timestamp with time zone,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        created_by_user_id uuid,
        updated_by_user_id uuid,
        deleted_at timestamp with time zone,
        CONSTRAINT "PK_prescription" PRIMARY KEY (id),
        CONSTRAINT "FK_prescription_patient_patient_id" FOREIGN KEY (patient_id) REFERENCES patient (id) ON DELETE RESTRICT,
        CONSTRAINT "FK_prescription_users_dispensed_by_user_id" FOREIGN KEY (dispensed_by_user_id) REFERENCES users (id) ON DELETE SET NULL,
        CONSTRAINT "FK_prescription_users_doctor_id" FOREIGN KEY (doctor_id) REFERENCES users (id) ON DELETE RESTRICT
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE TABLE token_sequences (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        branch_id uuid NOT NULL,
        sequence_date timestamp with time zone NOT NULL,
        current_sequence integer NOT NULL,
        branch_prefix character varying(10) NOT NULL,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone,
        CONSTRAINT "PK_token_sequences" PRIMARY KEY (id),
        CONSTRAINT "FK_token_sequences_branch_branch_id" FOREIGN KEY (branch_id) REFERENCES branch (id) ON DELETE CASCADE,
        CONSTRAINT "FK_token_sequences_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE TABLE opd_bill_payments (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        opd_bill_id uuid NOT NULL,
        payment_reference character varying(50) NOT NULL,
        payment_mode character varying(30) NOT NULL,
        amount numeric(10,2) NOT NULL,
        card_last_four character varying(4),
        card_type character varying(20),
        card_transaction_id character varying(100),
        upi_transaction_id character varying(100),
        upi_vpa character varying(100),
        insurance_claim_number character varying(50),
        insurance_settlement_amount numeric(10,2),
        gateway_transaction_id character varying(100),
        gateway_name character varying(50),
        status character varying(20) NOT NULL,
        payment_date timestamp with time zone NOT NULL,
        received_by uuid,
        receipt_number character varying(30),
        receipt_printed boolean NOT NULL DEFAULT FALSE,
        receipt_sent_via character varying(100),
        notes text,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone,
        created_by_user_id uuid NOT NULL,
        updated_by_user_id uuid,
        deleted_at timestamp with time zone,
        CONSTRAINT "PK_opd_bill_payments" PRIMARY KEY (id),
        CONSTRAINT "FK_opd_bill_payments_opd_bills_opd_bill_id" FOREIGN KEY (opd_bill_id) REFERENCES opd_bills (id) ON DELETE CASCADE,
        CONSTRAINT "FK_opd_bill_payments_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE,
        CONSTRAINT "FK_opd_bill_payments_users_created_by_user_id" FOREIGN KEY (created_by_user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT "FK_opd_bill_payments_users_received_by" FOREIGN KEY (received_by) REFERENCES users (id),
        CONSTRAINT "FK_opd_bill_payments_users_updated_by_user_id" FOREIGN KEY (updated_by_user_id) REFERENCES users (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE TABLE visits (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        patient_id uuid NOT NULL,
        appointment_id uuid NOT NULL,
        opd_bill_id uuid,
        branch_id uuid NOT NULL,
        consultant_id uuid,
        department_id uuid,
        visit_type character varying(30) NOT NULL,
        visit_category character varying(30) NOT NULL,
        status character varying(30) NOT NULL,
        token_number character varying(20) NOT NULL,
        token_sequence integer NOT NULL,
        checked_in_at timestamp with time zone,
        checked_in_by uuid,
        current_station character varying(50),
        assigned_to uuid,
        assigned_at timestamp with time zone,
        completed_at timestamp with time zone,
        completed_by uuid,
        outcome character varying(50),
        outcome_notes text,
        is_emergency boolean NOT NULL DEFAULT FALSE,
        emergency_authorized_by uuid,
        emergency_reason text,
        notes text,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone,
        created_by_user_id uuid NOT NULL,
        updated_by_user_id uuid,
        deleted_at timestamp with time zone,
        CONSTRAINT "PK_visits" PRIMARY KEY (id),
        CONSTRAINT "FK_visits_appointment_appointment_id" FOREIGN KEY (appointment_id) REFERENCES appointment (id) ON DELETE CASCADE,
        CONSTRAINT "FK_visits_branch_branch_id" FOREIGN KEY (branch_id) REFERENCES branch (id) ON DELETE CASCADE,
        CONSTRAINT "FK_visits_department_department_id" FOREIGN KEY (department_id) REFERENCES department (id),
        CONSTRAINT "FK_visits_opd_bills_opd_bill_id" FOREIGN KEY (opd_bill_id) REFERENCES opd_bills (id),
        CONSTRAINT "FK_visits_patient_patient_id" FOREIGN KEY (patient_id) REFERENCES patient (id) ON DELETE CASCADE,
        CONSTRAINT "FK_visits_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE,
        CONSTRAINT "FK_visits_users_assigned_to" FOREIGN KEY (assigned_to) REFERENCES users (id),
        CONSTRAINT "FK_visits_users_checked_in_by" FOREIGN KEY (checked_in_by) REFERENCES users (id),
        CONSTRAINT "FK_visits_users_completed_by" FOREIGN KEY (completed_by) REFERENCES users (id),
        CONSTRAINT "FK_visits_users_consultant_id" FOREIGN KEY (consultant_id) REFERENCES users (id),
        CONSTRAINT "FK_visits_users_created_by_user_id" FOREIGN KEY (created_by_user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT "FK_visits_users_emergency_authorized_by" FOREIGN KEY (emergency_authorized_by) REFERENCES users (id),
        CONSTRAINT "FK_visits_users_updated_by_user_id" FOREIGN KEY (updated_by_user_id) REFERENCES users (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE TABLE prescription_medication (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        prescription_id uuid NOT NULL,
        medication_name character varying(200) NOT NULL,
        generic_name character varying(200),
        dosage character varying(100) NOT NULL,
        form character varying(50) NOT NULL,
        route character varying(50) NOT NULL,
        frequency character varying(100) NOT NULL,
        duration_days integer NOT NULL,
        quantity integer NOT NULL,
        instructions text,
        start_date timestamp with time zone NOT NULL,
        end_date timestamp with time zone,
        refills_allowed integer NOT NULL DEFAULT 0,
        refills_remaining integer NOT NULL DEFAULT 0,
        is_critical boolean NOT NULL DEFAULT FALSE,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        deleted_at timestamp with time zone,
        CONSTRAINT "PK_prescription_medication" PRIMARY KEY (id),
        CONSTRAINT "FK_prescription_medication_prescription_prescription_id" FOREIGN KEY (prescription_id) REFERENCES prescription (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_billing_rules_branch_id" ON billing_rules (branch_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_billing_rules_created_by_user_id" ON billing_rules (created_by_user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_billing_rules_is_active" ON billing_rules (is_active);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_billing_rules_tenant_id" ON billing_rules (tenant_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_billing_rules_updated_by_user_id" ON billing_rules (updated_by_user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_billing_rules_visit_type" ON billing_rules (visit_type);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_drug_interaction_drug1_name" ON drug_interaction (drug1_name);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_drug_interaction_drug2_name" ON drug_interaction (drug2_name);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_drug_interaction_interaction_type" ON drug_interaction (interaction_type);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_drug_interaction_severity" ON drug_interaction (severity);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_medication_master_category" ON medication_master (category);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_medication_master_generic_name" ON medication_master (generic_name);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_medication_master_is_active" ON medication_master (is_active);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_medication_master_name" ON medication_master (name);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_opd_bill_payments_created_by_user_id" ON opd_bill_payments (created_by_user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_opd_bill_payments_opd_bill_id" ON opd_bill_payments (opd_bill_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE UNIQUE INDEX "IX_opd_bill_payments_payment_reference" ON opd_bill_payments (payment_reference);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_opd_bill_payments_received_by" ON opd_bill_payments (received_by);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_opd_bill_payments_status" ON opd_bill_payments (status);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_opd_bill_payments_tenant_id" ON opd_bill_payments (tenant_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_opd_bill_payments_updated_by_user_id" ON opd_bill_payments (updated_by_user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_opd_bills_appointment_id" ON opd_bills (appointment_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE UNIQUE INDEX "IX_opd_bills_bill_number" ON opd_bills (bill_number);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_opd_bills_branch_id" ON opd_bills (branch_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_opd_bills_consultant_id" ON opd_bills (consultant_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_opd_bills_created_by_user_id" ON opd_bills (created_by_user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_opd_bills_credit_approved_by" ON opd_bills (credit_approved_by);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_opd_bills_discount_authorized_by" ON opd_bills (discount_authorized_by);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_opd_bills_finalized_by" ON opd_bills (finalized_by);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_opd_bills_patient_id" ON opd_bills (patient_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_opd_bills_status" ON opd_bills (status);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_opd_bills_tenant_id" ON opd_bills (tenant_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_opd_bills_updated_by_user_id" ON opd_bills (updated_by_user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_prescription_deleted_at" ON prescription (deleted_at);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_prescription_dispensed_by_user_id" ON prescription (dispensed_by_user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_prescription_doctor_id" ON prescription (doctor_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_prescription_patient_id" ON prescription (patient_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_prescription_prescription_date" ON prescription (prescription_date);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_prescription_status" ON prescription (status);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_prescription_tenant_id" ON prescription (tenant_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_prescription_medication_medication_name" ON prescription_medication (medication_name);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_prescription_medication_prescription_id" ON prescription_medication (prescription_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_prescription_medication_start_date_end_date" ON prescription_medication (start_date, end_date);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_prescription_medication_tenant_id" ON prescription_medication (tenant_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE UNIQUE INDEX "IX_token_sequences_branch_id_sequence_date" ON token_sequences (branch_id, sequence_date);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_token_sequences_tenant_id" ON token_sequences (tenant_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_visits_appointment_id" ON visits (appointment_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_visits_assigned_to" ON visits (assigned_to);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_visits_branch_id" ON visits (branch_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_visits_branch_id_token_sequence_created_at" ON visits (branch_id, token_sequence, created_at);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_visits_checked_in_by" ON visits (checked_in_by);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_visits_completed_by" ON visits (completed_by);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_visits_consultant_id" ON visits (consultant_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_visits_created_by_user_id" ON visits (created_by_user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_visits_department_id" ON visits (department_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_visits_emergency_authorized_by" ON visits (emergency_authorized_by);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_visits_opd_bill_id" ON visits (opd_bill_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_visits_patient_id" ON visits (patient_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_visits_status" ON visits (status);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_visits_tenant_id" ON visits (tenant_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_visits_token_number" ON visits (token_number);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    CREATE INDEX "IX_visits_updated_by_user_id" ON visits (updated_by_user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260129072645_AddOpdVisitBillingEntities', '9.0.10');
    END IF;
END $EF$;
COMMIT;

