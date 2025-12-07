CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20251023161827_InitialCreate') THEN
    CREATE TABLE audit_logs (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        user_id uuid,
        action text NOT NULL,
        resource_type text NOT NULL,
        resource_id uuid,
        old_values text NOT NULL,
        new_values text NOT NULL,
        ip_address text NOT NULL,
        user_agent text NOT NULL,
        status text NOT NULL,
        reason text NOT NULL,
        created_at timestamp with time zone NOT NULL,
        CONSTRAINT "PK_audit_logs" PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20251023161827_InitialCreate') THEN
    CREATE TABLE failed_login_attempts (
        id uuid NOT NULL,
        email_or_username text NOT NULL,
        tenant_id uuid,
        ip_address text NOT NULL,
        attempted_at timestamp with time zone NOT NULL,
        reason text NOT NULL,
        CONSTRAINT "PK_failed_login_attempts" PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20251023161827_InitialCreate') THEN
    CREATE TABLE permissions (
        id uuid NOT NULL,
        "TenantId" uuid NOT NULL,
        "Code" text,
        "Name" text,
        "Description" text,
        "Module" text,
        "Action" text,
        "ResourceType" text,
        "IsActive" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_permissions" PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20251023161827_InitialCreate') THEN
    CREATE TABLE roles (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        "Description" text,
        "RoleLevel" integer NOT NULL,
        "IsSystemRole" boolean NOT NULL,
        "IsActive" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        "CreatedBy" uuid,
        name character varying(256),
        "NormalizedName" character varying(256),
        "ConcurrencyStamp" text,
        CONSTRAINT "PK_roles" PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20251023161827_InitialCreate') THEN
    CREATE TABLE tenants (
        id uuid NOT NULL,
        "Name" text,
        "RegistrationNumber" text,
        "Email" text,
        "Phone" text,
        "Address" text,
        "City" text,
        "State" text,
        "Pincode" text,
        "Country" text,
        "SubscriptionTier" text,
        "MaxBranches" integer NOT NULL,
        "MaxUsers" integer NOT NULL,
        "IsActive" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        "CreatedBy" uuid,
        "UpdatedBy" uuid,
        CONSTRAINT "PK_tenants" PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20251023161827_InitialCreate') THEN
    CREATE TABLE users (
        id uuid NOT NULL,
        tenant_id uuid NOT NULL,
        "FirstName" text,
        "LastName" text,
        "DateOfBirth" timestamp with time zone,
        "Gender" text NOT NULL,
        "Qualifications" text NOT NULL,
        "Specialization" text NOT NULL,
        "EmployeeId" text NOT NULL,
        "UserType" text NOT NULL,
        "UserStatus" text NOT NULL,
        "InitialPasswordCreatedAt" timestamp with time zone,
        "LastPasswordChangeAt" timestamp with time zone,
        "PasswordExpiresAt" timestamp with time zone,
        "LastLoginAt" timestamp with time zone,
        "MustChangePasswordOnLogin" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        "CreatedBy" uuid,
        "UpdatedBy" uuid,
        user_name character varying(256),
        "NormalizedUserName" character varying(256),
        "Email" character varying(256),
        "NormalizedEmail" character varying(256),
        "EmailConfirmed" boolean NOT NULL,
        "PasswordHash" text,
        "SecurityStamp" text,
        "ConcurrencyStamp" text,
        "PhoneNumber" text,
        "PhoneNumberConfirmed" boolean NOT NULL,
        "TwoFactorEnabled" boolean NOT NULL,
        "LockoutEnd" timestamp with time zone,
        "LockoutEnabled" boolean NOT NULL,
        "AccessFailedCount" integer NOT NULL,
        CONSTRAINT "PK_users" PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20251023161827_InitialCreate') THEN
    CREATE TABLE "AspNetRoleClaims" (
        "Id" integer GENERATED BY DEFAULT AS IDENTITY,
        "RoleId" uuid NOT NULL,
        "ClaimType" text,
        "ClaimValue" text,
        CONSTRAINT "PK_AspNetRoleClaims" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_AspNetRoleClaims_roles_RoleId" FOREIGN KEY ("RoleId") REFERENCES roles (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20251023161827_InitialCreate') THEN
    CREATE TABLE role_permissions (
        id uuid NOT NULL,
        "RoleId" uuid NOT NULL,
        "PermissionId" uuid NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_role_permissions" PRIMARY KEY (id),
        CONSTRAINT "FK_role_permissions_permissions_PermissionId" FOREIGN KEY ("PermissionId") REFERENCES permissions (id) ON DELETE CASCADE,
        CONSTRAINT "FK_role_permissions_roles_RoleId" FOREIGN KEY ("RoleId") REFERENCES roles (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20251023161827_InitialCreate') THEN
    CREATE TABLE branches (
        id uuid NOT NULL,
        "TenantId" uuid NOT NULL,
        "Name" text,
        "LocationCode" text,
        "Address" text,
        "City" text,
        "Phone" text,
        "Email" text,
        "BranchManagerId" uuid,
        "IsActive" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_branches" PRIMARY KEY (id),
        CONSTRAINT "FK_branches_tenants_TenantId" FOREIGN KEY ("TenantId") REFERENCES tenants (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20251023161827_InitialCreate') THEN
    CREATE TABLE "AspNetUserClaims" (
        "Id" integer GENERATED BY DEFAULT AS IDENTITY,
        "UserId" uuid NOT NULL,
        "ClaimType" text,
        "ClaimValue" text,
        CONSTRAINT "PK_AspNetUserClaims" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_AspNetUserClaims_users_UserId" FOREIGN KEY ("UserId") REFERENCES users (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20251023161827_InitialCreate') THEN
    CREATE TABLE "AspNetUserLogins" (
        "LoginProvider" text NOT NULL,
        "ProviderKey" text NOT NULL,
        "ProviderDisplayName" text,
        "UserId" uuid NOT NULL,
        CONSTRAINT "PK_AspNetUserLogins" PRIMARY KEY ("LoginProvider", "ProviderKey"),
        CONSTRAINT "FK_AspNetUserLogins_users_UserId" FOREIGN KEY ("UserId") REFERENCES users (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20251023161827_InitialCreate') THEN
    CREATE TABLE "AspNetUserTokens" (
        "UserId" uuid NOT NULL,
        "LoginProvider" text NOT NULL,
        "Name" text NOT NULL,
        "Value" text,
        CONSTRAINT "PK_AspNetUserTokens" PRIMARY KEY ("UserId", "LoginProvider", "Name"),
        CONSTRAINT "FK_AspNetUserTokens_users_UserId" FOREIGN KEY ("UserId") REFERENCES users (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20251023161827_InitialCreate') THEN
    CREATE TABLE user_attributes (
        id uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "AttributeKey" text NOT NULL,
        "AttributeValue" text NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_user_attributes" PRIMARY KEY (id),
        CONSTRAINT "FK_user_attributes_users_UserId" FOREIGN KEY ("UserId") REFERENCES users (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20251023161827_InitialCreate') THEN
    CREATE TABLE user_roles (
        user_id uuid NOT NULL,
        role_id uuid NOT NULL,
        branch_id uuid NOT NULL,
        "AssignedAt" timestamp with time zone NOT NULL,
        "AssignedBy" uuid,
        "ExpiresAt" timestamp with time zone,
        "IsActive" boolean NOT NULL,
        CONSTRAINT "PK_user_roles" PRIMARY KEY (user_id, role_id),
        CONSTRAINT "FK_user_roles_roles_role_id" FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
        CONSTRAINT "FK_user_roles_users_user_id" FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20251023161827_InitialCreate') THEN
    CREATE INDEX "IX_AspNetRoleClaims_RoleId" ON "AspNetRoleClaims" ("RoleId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20251023161827_InitialCreate') THEN
    CREATE INDEX "IX_AspNetUserClaims_UserId" ON "AspNetUserClaims" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20251023161827_InitialCreate') THEN
    CREATE INDEX "IX_AspNetUserLogins_UserId" ON "AspNetUserLogins" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20251023161827_InitialCreate') THEN
    CREATE INDEX "IX_branches_TenantId" ON branches ("TenantId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20251023161827_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_permissions_TenantId_Code" ON permissions ("TenantId", "Code");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20251023161827_InitialCreate') THEN
    CREATE INDEX "IX_role_permissions_PermissionId" ON role_permissions ("PermissionId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20251023161827_InitialCreate') THEN
    CREATE INDEX "IX_role_permissions_RoleId" ON role_permissions ("RoleId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20251023161827_InitialCreate') THEN
    CREATE UNIQUE INDEX "RoleNameIndex" ON roles ("NormalizedName");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20251023161827_InitialCreate') THEN
    CREATE INDEX "IX_user_attributes_UserId" ON user_attributes ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20251023161827_InitialCreate') THEN
    CREATE INDEX "IX_user_roles_role_id" ON user_roles (role_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20251023161827_InitialCreate') THEN
    CREATE INDEX "EmailIndex" ON users ("NormalizedEmail");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20251023161827_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_users_tenant_id_user_name" ON users (tenant_id, user_name);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20251023161827_InitialCreate') THEN
    CREATE UNIQUE INDEX "UserNameIndex" ON users ("NormalizedUserName");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20251023161827_InitialCreate') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20251023161827_InitialCreate', '9.0.10');
    END IF;
END $EF$;
COMMIT;

