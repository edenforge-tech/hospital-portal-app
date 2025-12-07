START TRANSACTION;
ALTER TABLE user_department_access DROP CONSTRAINT "FK_user_department_access_department_department_id";

ALTER TABLE user_department_access DROP CONSTRAINT "FK_user_department_access_tenant_tenant_id";

ALTER TABLE user_department_access DROP CONSTRAINT "FK_user_department_access_users_user_id";

ALTER TABLE user_department_access DROP CONSTRAINT "PK_user_department_access";

ALTER TABLE user_department_access DROP COLUMN effective_from;

ALTER TABLE user_department_access DROP COLUMN granted_at;

ALTER TABLE user_department_access DROP COLUMN role_id;

ALTER TABLE user_department_access RENAME TO department_access;

ALTER TABLE department_access RENAME COLUMN sub_department_id TO updated_by_user_id;

ALTER TABLE department_access RENAME COLUMN is_primary TO can_export;

ALTER TABLE department_access RENAME COLUMN granted_by_user_id TO branch_id;

ALTER TABLE department_access RENAME COLUMN effective_to TO approved_at;

ALTER INDEX "IX_user_department_access_user_id" RENAME TO "IX_department_access_user_id";

ALTER INDEX "IX_user_department_access_tenant_id_user_id_department_id" RENAME TO "IX_department_access_tenant_id_user_id_department_id";

ALTER INDEX "IX_user_department_access_department_id" RENAME TO "IX_department_access_department_id";

ALTER TABLE organization ADD "AccreditationStatus" text;

ALTER TABLE organization ADD "Address" text;

ALTER TABLE organization ADD "City" text;

ALTER TABLE organization ADD "DateFormat" text;

ALTER TABLE organization ADD "Email" text;

ALTER TABLE organization ADD "LicenseNumber" text;

ALTER TABLE organization ADD "LogoUrl" text;

ALTER TABLE organization ADD "NumberFormat" text;

ALTER TABLE organization ADD "OrganizationName" text;

ALTER TABLE organization ADD "Phone" text;

ALTER TABLE organization ADD "PostalCode" text;

ALTER TABLE organization ADD "PrimaryColor" text;

ALTER TABLE organization ADD "RegulatoryBody" text;

ALTER TABLE organization ADD "SecondaryColor" text;

ALTER TABLE organization ADD "TimeFormat" text;

ALTER TABLE department ADD can_have_subdepartments boolean NOT NULL DEFAULT FALSE;

ALTER TABLE department ADD color character varying(20);

ALTER TABLE department ADD department_level integer NOT NULL DEFAULT 0;

ALTER TABLE department ADD display_order integer;

ALTER TABLE department ADD icon character varying(100);

ALTER TABLE department ADD inherit_permissions boolean NOT NULL DEFAULT FALSE;

ALTER TABLE department ADD is_standard_department boolean NOT NULL DEFAULT FALSE;

ALTER TABLE branch ADD "OrganizationId1" uuid;

ALTER TABLE audit_log ADD "ComplianceFlags" text;

ALTER TABLE audit_log ADD "DataClassification" text;

ALTER TABLE audit_log ADD "EventHash" text;

ALTER TABLE audit_log ADD "IsImmutable" boolean NOT NULL DEFAULT FALSE;

ALTER TABLE audit_log ADD "IsSystemGenerated" boolean NOT NULL DEFAULT FALSE;

ALTER TABLE audit_log ADD "PreviousEventHash" text;

ALTER TABLE audit_log ADD "RetentionDays" integer NOT NULL DEFAULT 0;

ALTER TABLE audit_log ADD "RetentionExpiry" timestamp with time zone;

ALTER TABLE audit_log ADD "RiskLevel" text;

ALTER TABLE audit_log ADD "SequenceNumber" bigint;

ALTER TABLE audit_log ADD "SessionId" text;

ALTER TABLE department_access ADD access_end_date timestamp with time zone;

ALTER TABLE department_access ADD access_start_date timestamp with time zone;

ALTER TABLE department_access ADD approval_notes character varying(500);

ALTER TABLE department_access ADD approved_by uuid;

ALTER TABLE department_access ADD can_approve boolean NOT NULL DEFAULT FALSE;

ALTER TABLE department_access ADD can_create boolean NOT NULL DEFAULT FALSE;

ALTER TABLE department_access ADD can_delete boolean NOT NULL DEFAULT FALSE;

ALTER TABLE department_access ADD can_edit boolean NOT NULL DEFAULT FALSE;

ALTER TABLE department_access ADD can_view boolean NOT NULL DEFAULT TRUE;

ALTER TABLE department_access ADD is_active boolean NOT NULL DEFAULT FALSE;

ALTER TABLE department_access ADD CONSTRAINT "PK_department_access" PRIMARY KEY (id);

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

CREATE INDEX "IX_branch_OrganizationId1" ON branch ("OrganizationId1");

CREATE INDEX "IX_department_access_approved_by" ON department_access (approved_by);

CREATE INDEX "IX_department_access_branch_id" ON department_access (branch_id);

CREATE INDEX "IX_department_access_created_by_user_id" ON department_access (created_by_user_id);

CREATE INDEX "IX_access_policy_created_by_user_id" ON access_policy (created_by_user_id);

CREATE INDEX "IX_access_policy_policy_code" ON access_policy (policy_code);

CREATE INDEX "IX_access_policy_priority" ON access_policy (priority);

CREATE INDEX "IX_access_policy_tenant_id_is_active" ON access_policy (tenant_id, is_active);

CREATE INDEX "IX_access_policy_updated_by_user_id" ON access_policy (updated_by_user_id);

CREATE INDEX "IX_device_device_id" ON device (device_id);

CREATE INDEX "IX_device_tenant_id_user_id" ON device (tenant_id, user_id);

CREATE INDEX "IX_device_user_id_is_blocked" ON device (user_id, is_blocked);

CREATE INDEX "IX_emergency_access_access_code" ON emergency_access (access_code);

CREATE INDEX "IX_emergency_access_approved_by" ON emergency_access (approved_by);

CREATE INDEX "IX_emergency_access_rejected_by" ON emergency_access (rejected_by);

CREATE INDEX "IX_emergency_access_reviewed_by" ON emergency_access (reviewed_by);

CREATE INDEX "IX_emergency_access_revoked_by" ON emergency_access (revoked_by);

CREATE INDEX "IX_emergency_access_start_time_end_time" ON emergency_access (start_time, end_time);

CREATE INDEX "IX_emergency_access_tenant_id_status" ON emergency_access (tenant_id, status);

CREATE INDEX "IX_emergency_access_user_id_status" ON emergency_access (user_id, status);

CREATE INDEX "IX_user_session_device_id" ON user_session (device_id);

CREATE INDEX "IX_user_session_expires_at" ON user_session (expires_at);

CREATE INDEX "IX_user_session_session_id" ON user_session (session_id);

CREATE INDEX "IX_user_session_tenant_id_user_id" ON user_session (tenant_id, user_id);

CREATE INDEX "IX_user_session_terminated_by" ON user_session (terminated_by);

CREATE INDEX "IX_user_session_user_id_is_active" ON user_session (user_id, is_active);

ALTER TABLE branch ADD CONSTRAINT "FK_branch_organization_OrganizationId1" FOREIGN KEY ("OrganizationId1") REFERENCES organization (id);

ALTER TABLE department_access ADD CONSTRAINT "FK_department_access_branch_branch_id" FOREIGN KEY (branch_id) REFERENCES branch (id);

ALTER TABLE department_access ADD CONSTRAINT "FK_department_access_department_department_id" FOREIGN KEY (department_id) REFERENCES department (id) ON DELETE CASCADE;

ALTER TABLE department_access ADD CONSTRAINT "FK_department_access_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE;

ALTER TABLE department_access ADD CONSTRAINT "FK_department_access_users_approved_by" FOREIGN KEY (approved_by) REFERENCES users (id);

ALTER TABLE department_access ADD CONSTRAINT "FK_department_access_users_created_by_user_id" FOREIGN KEY (created_by_user_id) REFERENCES users (id);

ALTER TABLE department_access ADD CONSTRAINT "FK_department_access_users_user_id" FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20251207145732_Add4NewTables_Device_Session_Policy_Emergency', '9.0.10');

COMMIT;

