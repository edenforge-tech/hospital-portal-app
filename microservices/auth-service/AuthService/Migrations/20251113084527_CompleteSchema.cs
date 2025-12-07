using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace AuthService.Migrations
{
    /// <inheritdoc />
    public partial class CompleteSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "admin_configurations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    config_key = table.Column<string>(type: "text", nullable: true),
                    config_value = table.Column<string>(type: "text", nullable: true),
                    config_type = table.Column<string>(type: "text", nullable: true),
                    config_category = table.Column<string>(type: "text", nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    display_name = table.Column<string>(type: "text", nullable: true),
                    editable_by_roles = table.Column<List<string>>(type: "text[]", nullable: true),
                    visible_to_roles = table.Column<List<string>>(type: "text[]", nullable: true),
                    is_system_config = table.Column<bool>(type: "boolean", nullable: false),
                    is_sensitive = table.Column<bool>(type: "boolean", nullable: false),
                    validation_rules = table.Column<string>(type: "text", nullable: true),
                    allowed_values = table.Column<List<string>>(type: "text[]", nullable: true),
                    min_value = table.Column<decimal>(type: "numeric", nullable: true),
                    max_value = table.Column<decimal>(type: "numeric", nullable: true),
                    previous_value = table.Column<string>(type: "text", nullable: true),
                    change_reason = table.Column<string>(type: "text", nullable: true),
                    requires_restart = table.Column<bool>(type: "boolean", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by_user_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_admin_configurations", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "app_roles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    RoleCode = table.Column<string>(type: "text", nullable: true),
                    RoleType = table.Column<string>(type: "text", nullable: true),
                    RoleLevel = table.Column<int>(type: "integer", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    ParentRoleId = table.Column<Guid>(type: "uuid", nullable: true),
                    DepartmentId = table.Column<Guid>(type: "uuid", nullable: true),
                    Settings = table.Column<string>(type: "text", nullable: true),
                    IsSystemRole = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_app_roles", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "audit_log",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    UserName = table.Column<string>(type: "text", nullable: true),
                    action = table.Column<string>(type: "text", nullable: false),
                    resource_type = table.Column<string>(type: "text", nullable: false),
                    resource_id = table.Column<Guid>(type: "uuid", nullable: true),
                    EntityType = table.Column<string>(type: "text", nullable: true),
                    EntityId = table.Column<Guid>(type: "uuid", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    old_values = table.Column<string>(type: "text", nullable: true),
                    new_values = table.Column<string>(type: "text", nullable: true),
                    Changes = table.Column<string>(type: "text", nullable: true),
                    ip_address = table.Column<string>(type: "text", nullable: true),
                    user_agent = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "text", nullable: true),
                    reason = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_audit_log", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "document_access_audit",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_email = table.Column<string>(type: "text", nullable: true),
                    user_role = table.Column<string>(type: "text", nullable: true),
                    document_id = table.Column<Guid>(type: "uuid", nullable: false),
                    document_type = table.Column<string>(type: "text", nullable: true),
                    document_title = table.Column<string>(type: "text", nullable: true),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: true),
                    action = table.Column<string>(type: "text", nullable: true),
                    action_result = table.Column<string>(type: "text", nullable: true),
                    access_granted = table.Column<bool>(type: "boolean", nullable: false),
                    denial_reason = table.Column<string>(type: "text", nullable: true),
                    permission_used = table.Column<string>(type: "text", nullable: true),
                    ip_address = table.Column<string>(type: "text", nullable: true),
                    user_agent = table.Column<string>(type: "text", nullable: true),
                    request_path = table.Column<string>(type: "text", nullable: true),
                    request_method = table.Column<string>(type: "text", nullable: true),
                    response_time_ms = table.Column<int>(type: "integer", nullable: true),
                    accessed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_document_access_audit", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "failed_login_attempt",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    email_or_username = table.Column<string>(type: "text", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: true),
                    ip_address = table.Column<string>(type: "text", nullable: false),
                    attempted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    reason = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_failed_login_attempt", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "patient",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    medical_record_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    first_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    last_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    date_of_birth = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    gender = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    contact_number = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    blood_group = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    allergies = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_patient", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "patient_document_uploads",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    document_type = table.Column<string>(type: "text", nullable: true),
                    document_title = table.Column<string>(type: "text", nullable: true),
                    file_url = table.Column<string>(type: "text", nullable: true),
                    file_size = table.Column<long>(type: "bigint", nullable: true),
                    mime_type = table.Column<string>(type: "text", nullable: true),
                    uploaded_by = table.Column<Guid>(type: "uuid", nullable: false),
                    uploaded_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    shared_to_departments = table.Column<List<string>>(type: "text[]", nullable: true),
                    shared_to_roles = table.Column<List<string>>(type: "text[]", nullable: true),
                    is_public = table.Column<bool>(type: "boolean", nullable: false),
                    data_classification = table.Column<string>(type: "text", nullable: true),
                    retention_days = table.Column<int>(type: "integer", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by_user_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_patient_document_uploads", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "permissions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: true),
                    Name = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Module = table.Column<string>(type: "text", nullable: true),
                    Action = table.Column<string>(type: "text", nullable: true),
                    ResourceType = table.Column<string>(type: "text", nullable: true),
                    ResourceName = table.Column<string>(type: "text", nullable: true),
                    Scope = table.Column<string>(type: "text", nullable: true),
                    DataClassification = table.Column<string>(type: "text", nullable: true),
                    IsSystemPermission = table.Column<bool>(type: "boolean", nullable: true),
                    DepartmentSpecific = table.Column<bool>(type: "boolean", nullable: true),
                    IsCustom = table.Column<bool>(type: "boolean", nullable: true),
                    Dependencies = table.Column<string>(type: "text", nullable: true),
                    ConflictsWith = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_permissions", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tenant",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: true),
                    tenant_code = table.Column<string>(type: "text", nullable: true),
                    company_email = table.Column<string>(type: "text", nullable: true),
                    company_phone = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "text", nullable: true),
                    subscription_type = table.Column<string>(type: "text", nullable: true),
                    max_branches = table.Column<int>(type: "integer", nullable: false),
                    max_users = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    primary_region = table.Column<string>(type: "text", nullable: true),
                    default_currency = table.Column<string>(type: "text", nullable: true),
                    hipaa_compliant = table.Column<bool>(type: "boolean", nullable: false),
                    nabh_accredited = table.Column<bool>(type: "boolean", nullable: false),
                    gdpr_compliant = table.Column<bool>(type: "boolean", nullable: false),
                    dpa_compliant = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tenant", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    FirstName = table.Column<string>(type: "text", nullable: true),
                    LastName = table.Column<string>(type: "text", nullable: true),
                    DateOfBirth = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Gender = table.Column<string>(type: "text", nullable: true),
                    Qualifications = table.Column<string>(type: "text", nullable: true),
                    Specialization = table.Column<string>(type: "text", nullable: true),
                    EmployeeId = table.Column<string>(type: "text", nullable: true),
                    Designation = table.Column<string>(type: "text", nullable: true),
                    LicenseNumber = table.Column<string>(type: "text", nullable: true),
                    ProfessionalRegistrationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: true),
                    BranchId = table.Column<Guid>(type: "uuid", nullable: true),
                    UserType = table.Column<string>(type: "text", nullable: false),
                    UserStatus = table.Column<string>(type: "text", nullable: false),
                    InitialPasswordCreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastPasswordChangeAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PasswordExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastLoginAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    MustChangePasswordOnLogin = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    user_name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: true),
                    SecurityStamp = table.Column<string>(type: "text", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "text", nullable: true),
                    PhoneNumber = table.Column<string>(type: "text", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "app_role_claims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RoleId = table.Column<Guid>(type: "uuid", nullable: false),
                    ClaimType = table.Column<string>(type: "text", nullable: true),
                    ClaimValue = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_app_role_claims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_app_role_claims_app_roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "app_roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "role_permission",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    RoleId = table.Column<Guid>(type: "uuid", nullable: false),
                    PermissionId = table.Column<Guid>(type: "uuid", nullable: false),
                    ValidFrom = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ValidUntil = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ConditionType = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_role_permission", x => x.id);
                    table.ForeignKey(
                        name: "FK_role_permission_app_roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "app_roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_role_permission_permissions_PermissionId",
                        column: x => x.PermissionId,
                        principalTable: "permissions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "organization",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    organization_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    organization_code = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: true),
                    country_code = table.Column<string>(type: "character varying(4)", maxLength: 4, nullable: true),
                    state_province = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    currency_code = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: true),
                    language_code = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: true),
                    timezone = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false, defaultValue: "UTC"),
                    status = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false, defaultValue: "Active")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_organization", x => x.id);
                    table.ForeignKey(
                        name: "FK_organization_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "app_user_claims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ClaimType = table.Column<string>(type: "text", nullable: true),
                    ClaimValue = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_app_user_claims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_app_user_claims_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "app_user_logins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "text", nullable: false),
                    ProviderKey = table.Column<string>(type: "text", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "text", nullable: true),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_app_user_logins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_app_user_logins_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "app_user_roles",
                columns: table => new
                {
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    role_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AssignedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_app_user_roles", x => new { x.user_id, x.role_id });
                    table.ForeignKey(
                        name: "FK_app_user_roles_app_roles_role_id",
                        column: x => x.role_id,
                        principalTable: "app_roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_app_user_roles_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "app_user_tokens",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LoginProvider = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Value = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_app_user_tokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_app_user_tokens_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "appointment",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    doctor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    appointment_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    appointment_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    duration_minutes = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    cancellation_reason = table.Column<string>(type: "text", nullable: true),
                    reminder_sent = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_appointment", x => x.id);
                    table.ForeignKey(
                        name: "FK_appointment_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_appointment_users_doctor_id",
                        column: x => x.doctor_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "clinical_examination",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    examination_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    chief_complaint = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    examination_notes = table.Column<string>(type: "text", nullable: true),
                    diagnosis = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    treatment_plan = table.Column<string>(type: "text", nullable: true),
                    prescription = table.Column<string>(type: "text", nullable: true),
                    follow_up_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    examining_doctor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_clinical_examination", x => x.id);
                    table.ForeignKey(
                        name: "FK_clinical_examination_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_clinical_examination_users_examining_doctor_id",
                        column: x => x.examining_doctor_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_attribute",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    AttributeKey = table.Column<string>(type: "text", nullable: false),
                    AttributeValue = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_attribute", x => x.id);
                    table.ForeignKey(
                        name: "FK_user_attribute_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "branch",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    branch_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    branch_code = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false, defaultValue: "Active"),
                    operational_status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "Operational"),
                    region = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    is_virtual = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    is_main_branch = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    license_number = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    address = table.Column<string>(type: "jsonb", nullable: true),
                    address_line_1 = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    address_line_2 = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    city = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    state_province = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    postal_code = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: true),
                    country = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    country_code = table.Column<string>(type: "character varying(4)", maxLength: 4, nullable: true),
                    latitude = table.Column<decimal>(type: "numeric", nullable: true),
                    longitude = table.Column<decimal>(type: "numeric", nullable: true),
                    phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    fax = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    contact_info = table.Column<string>(type: "jsonb", nullable: true),
                    timezone = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    currency_code = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: true),
                    language_primary = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "en"),
                    operational_hours_start = table.Column<TimeSpan>(type: "interval", nullable: true),
                    operational_hours_end = table.Column<TimeSpan>(type: "interval", nullable: true),
                    operating_hours = table.Column<string>(type: "jsonb", nullable: true),
                    emergency_support_24_7 = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    total_departments = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    total_staff = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    facilities = table.Column<string>(type: "jsonb", nullable: true),
                    capacity_info = table.Column<string>(type: "jsonb", nullable: true),
                    branch_settings = table.Column<string>(type: "jsonb", nullable: true),
                    hipaa_covered_entity = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    business_associate = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    phi_storage_approved = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    encryption_at_rest = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    encryption_in_transit = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    access_control_level = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "Standard"),
                    last_security_audit_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    next_security_audit_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    hipaa_compliance_status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "Pending"),
                    hipaa_certification_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    hipaa_certification_expiry = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    privacy_officer_id = table.Column<Guid>(type: "uuid", nullable: true),
                    security_officer_id = table.Column<Guid>(type: "uuid", nullable: true),
                    nabh_accredited = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    nabh_accreditation_level = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    nabh_certificate_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    nabh_accreditation_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    nabh_accreditation_expiry = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    nabh_last_audit_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    nabh_next_audit_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    iso_certified = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    iso_certificate_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    jci_accredited = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    quality_certifications = table.Column<string>(type: "jsonb", nullable: true),
                    infection_control_certified = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    patient_safety_certified = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    fire_safety_certified = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    disaster_preparedness_plan = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    gdpr_compliant = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    dpa_registered = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    data_protection_officer_id = table.Column<Guid>(type: "uuid", nullable: true),
                    data_retention_policy = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "7years"),
                    right_to_erasure_enabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    wheelchair_accessible = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    accessibility_features = table.Column<string>(type: "jsonb", nullable: true),
                    emergency_services_available = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    trauma_center_level = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ambulance_services = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    helipad_available = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    medical_specialties = table.Column<string>(type: "jsonb", nullable: true),
                    telemedicine_enabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    pharmacy_on_site = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    laboratory_services = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    imaging_services = table.Column<string>(type: "jsonb", nullable: true),
                    bed_capacity_total = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    bed_capacity_icu = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    bed_capacity_general = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    bed_capacity_emergency = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    current_occupancy_rate = table.Column<decimal>(type: "numeric(5,2)", nullable: false, defaultValue: 0.00m),
                    accepts_new_patients = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    insurance_providers_accepted = table.Column<string>(type: "jsonb", nullable: true),
                    billing_types_accepted = table.Column<string>(type: "jsonb", nullable: true),
                    payment_plans_available = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    branch_manager_id = table.Column<Guid>(type: "uuid", nullable: true),
                    medical_director_id = table.Column<Guid>(type: "uuid", nullable: true),
                    nursing_supervisor_id = table.Column<Guid>(type: "uuid", nullable: true),
                    total_physicians = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    total_nurses = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    total_administrative_staff = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_branch", x => x.id);
                    table.ForeignKey(
                        name: "FK_branch_organization_organization_id",
                        column: x => x.organization_id,
                        principalTable: "organization",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_branch_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "department",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    department_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    department_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    department_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "Active"),
                    parent_department_id = table.Column<Guid>(type: "uuid", nullable: true),
                    department_head_id = table.Column<Guid>(type: "uuid", nullable: true),
                    operating_hours_start = table.Column<TimeSpan>(type: "interval", nullable: true),
                    operating_hours_end = table.Column<TimeSpan>(type: "interval", nullable: true),
                    days_of_operation = table.Column<string>(type: "text", nullable: true),
                    is_24x7 = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    annual_budget = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    budget_currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    requires_approval = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    approval_level = table.Column<int>(type: "integer", nullable: true),
                    auto_approval_threshold = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    max_concurrent_patients = table.Column<int>(type: "integer", nullable: true),
                    waiting_room_capacity = table.Column<int>(type: "integer", nullable: true),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<Guid>(type: "uuid", nullable: true),
                    change_reason = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_department", x => x.id);
                    table.ForeignKey(
                        name: "FK_department_branch_branch_id",
                        column: x => x.branch_id,
                        principalTable: "branch",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_department_department_parent_department_id",
                        column: x => x.parent_department_id,
                        principalTable: "department",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_department_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_branch_access",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    is_primary = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    access_level = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "Full"),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "active"),
                    valid_from = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    valid_until = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    assigned_on = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    assigned_by = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_branch_access", x => x.id);
                    table.ForeignKey(
                        name: "FK_user_branch_access_branch_branch_id",
                        column: x => x.branch_id,
                        principalTable: "branch",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_user_branch_access_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_department_access",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    department_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sub_department_id = table.Column<Guid>(type: "uuid", nullable: true),
                    role_id = table.Column<Guid>(type: "uuid", nullable: false),
                    is_primary = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    access_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "Full Access"),
                    effective_from = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    effective_to = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Active"),
                    granted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    granted_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    revoked_by_user_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_department_access", x => x.id);
                    table.ForeignKey(
                        name: "FK_user_department_access_department_department_id",
                        column: x => x.department_id,
                        principalTable: "department",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_user_department_access_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_user_department_access_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_admin_configurations_tenant_id_config_key",
                table: "admin_configurations",
                columns: new[] { "tenant_id", "config_key" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_app_role_claims_RoleId",
                table: "app_role_claims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "app_roles",
                column: "NormalizedName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_app_user_claims_UserId",
                table: "app_user_claims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_app_user_logins_UserId",
                table: "app_user_logins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_app_user_roles_role_id",
                table: "app_user_roles",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "IX_appointment_doctor_id",
                table: "appointment",
                column: "doctor_id");

            migrationBuilder.CreateIndex(
                name: "IX_appointment_patient_id",
                table: "appointment",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_branch_accepts_new_patients",
                table: "branch",
                column: "accepts_new_patients");

            migrationBuilder.CreateIndex(
                name: "IX_branch_branch_code",
                table: "branch",
                column: "branch_code");

            migrationBuilder.CreateIndex(
                name: "IX_branch_deleted_at",
                table: "branch",
                column: "deleted_at");

            migrationBuilder.CreateIndex(
                name: "IX_branch_emergency_services_available",
                table: "branch",
                column: "emergency_services_available");

            migrationBuilder.CreateIndex(
                name: "IX_branch_hipaa_compliance_status",
                table: "branch",
                column: "hipaa_compliance_status");

            migrationBuilder.CreateIndex(
                name: "IX_branch_nabh_accredited",
                table: "branch",
                column: "nabh_accredited");

            migrationBuilder.CreateIndex(
                name: "IX_branch_operational_status",
                table: "branch",
                column: "operational_status");

            migrationBuilder.CreateIndex(
                name: "IX_branch_organization_id",
                table: "branch",
                column: "organization_id");

            migrationBuilder.CreateIndex(
                name: "IX_branch_status",
                table: "branch",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_branch_tenant_id",
                table: "branch",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_clinical_examination_examining_doctor_id",
                table: "clinical_examination",
                column: "examining_doctor_id");

            migrationBuilder.CreateIndex(
                name: "IX_clinical_examination_patient_id",
                table: "clinical_examination",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_department_branch_id",
                table: "department",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "IX_department_deleted_at",
                table: "department",
                column: "deleted_at");

            migrationBuilder.CreateIndex(
                name: "IX_department_department_code",
                table: "department",
                column: "department_code");

            migrationBuilder.CreateIndex(
                name: "IX_department_parent_department_id",
                table: "department",
                column: "parent_department_id");

            migrationBuilder.CreateIndex(
                name: "IX_department_status",
                table: "department",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_department_tenant_id",
                table: "department",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_document_access_audit_tenant_id_user_id_accessed_at",
                table: "document_access_audit",
                columns: new[] { "tenant_id", "user_id", "accessed_at" });

            migrationBuilder.CreateIndex(
                name: "IX_organization_organization_code",
                table: "organization",
                column: "organization_code");

            migrationBuilder.CreateIndex(
                name: "IX_organization_status",
                table: "organization",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_organization_tenant_id",
                table: "organization",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_patient_document_uploads_tenant_id_patient_id",
                table: "patient_document_uploads",
                columns: new[] { "tenant_id", "patient_id" });

            migrationBuilder.CreateIndex(
                name: "IX_permissions_TenantId_Code",
                table: "permissions",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_role_permission_PermissionId",
                table: "role_permission",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_role_permission_RoleId",
                table: "role_permission",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_user_attribute_UserId",
                table: "user_attribute",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_user_branch_access_branch_id",
                table: "user_branch_access",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_branch_access_tenant_id_user_id_branch_id",
                table: "user_branch_access",
                columns: new[] { "tenant_id", "user_id", "branch_id" });

            migrationBuilder.CreateIndex(
                name: "IX_user_branch_access_user_id",
                table: "user_branch_access",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_department_access_department_id",
                table: "user_department_access",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_department_access_tenant_id_user_id_department_id",
                table: "user_department_access",
                columns: new[] { "tenant_id", "user_id", "department_id" });

            migrationBuilder.CreateIndex(
                name: "IX_user_department_access_user_id",
                table: "user_department_access",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "users",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "IX_users_tenant_id_user_name",
                table: "users",
                columns: new[] { "tenant_id", "user_name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "users",
                column: "NormalizedUserName",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "admin_configurations");

            migrationBuilder.DropTable(
                name: "app_role_claims");

            migrationBuilder.DropTable(
                name: "app_user_claims");

            migrationBuilder.DropTable(
                name: "app_user_logins");

            migrationBuilder.DropTable(
                name: "app_user_roles");

            migrationBuilder.DropTable(
                name: "app_user_tokens");

            migrationBuilder.DropTable(
                name: "appointment");

            migrationBuilder.DropTable(
                name: "audit_log");

            migrationBuilder.DropTable(
                name: "clinical_examination");

            migrationBuilder.DropTable(
                name: "document_access_audit");

            migrationBuilder.DropTable(
                name: "failed_login_attempt");

            migrationBuilder.DropTable(
                name: "patient_document_uploads");

            migrationBuilder.DropTable(
                name: "role_permission");

            migrationBuilder.DropTable(
                name: "user_attribute");

            migrationBuilder.DropTable(
                name: "user_branch_access");

            migrationBuilder.DropTable(
                name: "user_department_access");

            migrationBuilder.DropTable(
                name: "patient");

            migrationBuilder.DropTable(
                name: "app_roles");

            migrationBuilder.DropTable(
                name: "permissions");

            migrationBuilder.DropTable(
                name: "department");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "branch");

            migrationBuilder.DropTable(
                name: "organization");

            migrationBuilder.DropTable(
                name: "tenant");
        }
    }
}
