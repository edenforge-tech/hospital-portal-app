using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuthService.Migrations
{
    /// <inheritdoc />
    public partial class AddHipaaComplianceColumnsToUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_user_branch_access_branch_branch_id",
                table: "user_branch_access");

            migrationBuilder.DropForeignKey(
                name: "FK_user_branch_access_users_user_id",
                table: "user_branch_access");

            migrationBuilder.DropForeignKey(
                name: "FK_user_department_access_department_department_id",
                table: "user_department_access");

            migrationBuilder.DropForeignKey(
                name: "FK_user_department_access_tenant_tenant_id",
                table: "user_department_access");

            migrationBuilder.DropForeignKey(
                name: "FK_user_department_access_users_user_id",
                table: "user_department_access");

            migrationBuilder.DropPrimaryKey(
                name: "PK_user_department_access",
                table: "user_department_access");

            migrationBuilder.DropPrimaryKey(
                name: "PK_user_branch_access",
                table: "user_branch_access");

            migrationBuilder.DropColumn(
                name: "effective_from",
                table: "user_department_access");

            migrationBuilder.DropColumn(
                name: "granted_at",
                table: "user_department_access");

            migrationBuilder.DropColumn(
                name: "role_id",
                table: "user_department_access");

            migrationBuilder.DropColumn(
                name: "access_level",
                table: "user_branch_access");

            migrationBuilder.DropColumn(
                name: "deleted_at",
                table: "user_branch_access");

            migrationBuilder.DropColumn(
                name: "valid_from",
                table: "user_branch_access");

            migrationBuilder.RenameTable(
                name: "user_department_access",
                newName: "department_access");

            migrationBuilder.RenameTable(
                name: "user_branch_access",
                newName: "user_branches");

            migrationBuilder.RenameColumn(
                name: "created_by_user_id",
                table: "department_access",
                newName: "created_by");

            migrationBuilder.RenameColumn(
                name: "sub_department_id",
                table: "department_access",
                newName: "updated_by");

            migrationBuilder.RenameColumn(
                name: "revoked_by_user_id",
                table: "department_access",
                newName: "deleted_by");

            migrationBuilder.RenameColumn(
                name: "is_primary",
                table: "department_access",
                newName: "can_export");

            migrationBuilder.RenameColumn(
                name: "granted_by_user_id",
                table: "department_access",
                newName: "branch_id");

            migrationBuilder.RenameColumn(
                name: "effective_to",
                table: "department_access",
                newName: "approved_at");

            migrationBuilder.RenameIndex(
                name: "IX_user_department_access_user_id",
                table: "department_access",
                newName: "IX_department_access_user_id");

            migrationBuilder.RenameIndex(
                name: "IX_user_department_access_tenant_id_user_id_department_id",
                table: "department_access",
                newName: "IX_department_access_tenant_id_user_id_department_id");

            migrationBuilder.RenameIndex(
                name: "IX_user_department_access_department_id",
                table: "department_access",
                newName: "IX_department_access_department_id");

            migrationBuilder.RenameColumn(
                name: "valid_until",
                table: "user_branches",
                newName: "effective_until");

            migrationBuilder.RenameColumn(
                name: "updated_by",
                table: "user_branches",
                newName: "updated_by_user_id");

            migrationBuilder.RenameColumn(
                name: "is_primary",
                table: "user_branches",
                newName: "is_default");

            migrationBuilder.RenameColumn(
                name: "created_by",
                table: "user_branches",
                newName: "created_by_user_id");

            migrationBuilder.RenameColumn(
                name: "assigned_on",
                table: "user_branches",
                newName: "effective_from");

            migrationBuilder.RenameColumn(
                name: "assigned_by",
                table: "user_branches",
                newName: "assigned_by_user_id");

            migrationBuilder.RenameIndex(
                name: "IX_user_branch_access_user_id",
                table: "user_branches",
                newName: "IX_user_branches_user_id");

            migrationBuilder.RenameIndex(
                name: "IX_user_branch_access_tenant_id_user_id_branch_id",
                table: "user_branches",
                newName: "IX_user_branches_tenant_id_user_id_branch_id");

            migrationBuilder.RenameIndex(
                name: "IX_user_branch_access_branch_id",
                table: "user_branches",
                newName: "IX_user_branches_branch_id");

            migrationBuilder.AddColumn<string>(
                name: "NpiNumber",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "accepted_hipaa",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "accepted_hipaa_at",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "accepted_privacy",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "accepted_privacy_at",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "accepted_terms",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "accepted_terms_at",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "activation_status",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "compliance_acceptance_ip",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "email_verification_sent_at",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "email_verification_token",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "email_verified",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "failed_login_attempts",
                table: "users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "last_login_ip",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "last_password_change",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "locked_until",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "must_reset_password",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "one_time_password_hash",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "otp_expires_at",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "password_reset_token",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "reset_token_expires_at",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "address",
                table: "tenant",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "city",
                table: "tenant",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "country",
                table: "tenant",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "pincode",
                table: "tenant",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "state",
                table: "tenant",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "tenant_type",
                table: "tenant",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "accreditation_status",
                table: "organization",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "address",
                table: "organization",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "city",
                table: "organization",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "date_format",
                table: "organization",
                type: "character varying(32)",
                maxLength: 32,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "description",
                table: "organization",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "email",
                table: "organization",
                type: "character varying(128)",
                maxLength: 128,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "license_number",
                table: "organization",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "logo_url",
                table: "organization",
                type: "character varying(512)",
                maxLength: 512,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "number_format",
                table: "organization",
                type: "character varying(32)",
                maxLength: 32,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "operational_since",
                table: "organization",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "organization_name",
                table: "organization",
                type: "character varying(128)",
                maxLength: 128,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "phone",
                table: "organization",
                type: "character varying(32)",
                maxLength: 32,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "postal_code",
                table: "organization",
                type: "character varying(16)",
                maxLength: 16,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "primary_color",
                table: "organization",
                type: "character varying(16)",
                maxLength: 16,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "primary_contact_email",
                table: "organization",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "primary_contact_name",
                table: "organization",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "primary_contact_phone",
                table: "organization",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "regulatory_body",
                table: "organization",
                type: "character varying(128)",
                maxLength: 128,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "secondary_color",
                table: "organization",
                type: "character varying(16)",
                maxLength: 16,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "time_format",
                table: "organization",
                type: "character varying(16)",
                maxLength: 16,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "website",
                table: "organization",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "can_have_subdepartments",
                table: "department",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "color",
                table: "department",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "department_level",
                table: "department",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "display_order",
                table: "department",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "icon",
                table: "department",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "inherit_permissions",
                table: "department",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_standard_department",
                table: "department",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "branch_type",
                table: "branch",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "website",
                table: "branch",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ComplianceFlags",
                table: "audit_log",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DataClassification",
                table: "audit_log",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EventHash",
                table: "audit_log",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsImmutable",
                table: "audit_log",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsSystemGenerated",
                table: "audit_log",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PreviousEventHash",
                table: "audit_log",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RetentionDays",
                table: "audit_log",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "RetentionExpiry",
                table: "audit_log",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RiskLevel",
                table: "audit_log",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "SequenceNumber",
                table: "audit_log",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SessionId",
                table: "audit_log",
                type: "text",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "branch_id",
                table: "app_user_roles",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<string>(
                name: "status",
                table: "department_access",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "Active",
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20,
                oldDefaultValue: "Active");

            migrationBuilder.AlterColumn<DateTime>(
                name: "created_at",
                table: "department_access",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<string>(
                name: "access_type",
                table: "department_access",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Secondary",
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldDefaultValue: "Full Access");

            migrationBuilder.AddColumn<DateTime>(
                name: "access_end_date",
                table: "department_access",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "access_start_date",
                table: "department_access",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "approval_notes",
                table: "department_access",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "approved_by",
                table: "department_access",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "can_approve",
                table: "department_access",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "can_create",
                table: "department_access",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "can_delete",
                table: "department_access",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "can_edit",
                table: "department_access",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "can_view",
                table: "department_access",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_active",
                table: "department_access",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "updated_at",
                table: "user_branches",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "assigned_at",
                table: "user_branches",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "notes",
                table: "user_branches",
                type: "text",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_department_access",
                table: "department_access",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_user_branches",
                table: "user_branches",
                column: "id");

            migrationBuilder.CreateTable(
                name: "access_policy",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    policy_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    policy_code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    policy_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    conditions = table.Column<string>(type: "jsonb", nullable: true),
                    actions = table.Column<string>(type: "jsonb", nullable: true),
                    resources = table.Column<string>(type: "jsonb", nullable: true),
                    effect = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "Deny"),
                    priority = table.Column<int>(type: "integer", nullable: false, defaultValue: 100),
                    applies_to_roles = table.Column<string>(type: "jsonb", nullable: true),
                    applies_to_departments = table.Column<string>(type: "jsonb", nullable: true),
                    applies_to_users = table.Column<string>(type: "jsonb", nullable: true),
                    effective_from = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    effective_until = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    time_of_day_start = table.Column<TimeSpan>(type: "interval", nullable: true),
                    time_of_day_end = table.Column<TimeSpan>(type: "interval", nullable: true),
                    days_of_week = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    is_system_policy = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "active"),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    evaluation_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    last_evaluated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_access_policy", x => x.id);
                    table.ForeignKey(
                        name: "FK_access_policy_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_access_policy_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_access_policy_users_updated_by_user_id",
                        column: x => x.updated_by_user_id,
                        principalTable: "users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "activation_audit_log",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    activation_step = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    error_message = table.Column<string>(type: "text", nullable: true),
                    ip_address = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: false),
                    user_agent = table.Column<string>(type: "text", nullable: true),
                    device_info = table.Column<string>(type: "text", nullable: true),
                    geolocation_info = table.Column<string>(type: "text", nullable: true),
                    timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    request_data = table.Column<string>(type: "text", nullable: true),
                    response_data = table.Column<string>(type: "text", nullable: true),
                    response_time_ms = table.Column<int>(type: "integer", nullable: true),
                    suspicious_activity = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    compliance_notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_activation_audit_log", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "department_access_audit_log",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    audit_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    department_id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: true),
                    department_access_id = table.Column<Guid>(type: "uuid", nullable: true),
                    action = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    action_category = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    previous_state = table.Column<string>(type: "jsonb", nullable: true),
                    new_state = table.Column<string>(type: "jsonb", nullable: true),
                    changes_summary = table.Column<string>(type: "text", nullable: true),
                    justification = table.Column<string>(type: "text", nullable: true),
                    approval_request_id = table.Column<Guid>(type: "uuid", nullable: true),
                    performed_by = table.Column<Guid>(type: "uuid", nullable: false),
                    performed_by_role = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    performed_by_ip = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    user_agent = table.Column<string>(type: "text", nullable: true),
                    compliance_flags = table.Column<string>(type: "jsonb", nullable: true),
                    compliance_note = table.Column<string>(type: "text", nullable: true),
                    security_classification = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    is_emergency_access = table.Column<bool>(type: "boolean", nullable: false),
                    was_approved = table.Column<bool>(type: "boolean", nullable: true),
                    approved_by = table.Column<Guid>(type: "uuid", nullable: true),
                    approved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    session_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    correlation_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_department_access_audit_log", x => x.id);
                    table.ForeignKey(
                        name: "FK_department_access_audit_log_department_department_id",
                        column: x => x.department_id,
                        principalTable: "department",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_department_access_audit_log_users_performed_by",
                        column: x => x.performed_by,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_department_access_audit_log_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "department_access_request",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    request_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    department_id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: true),
                    request_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    justification = table.Column<string>(type: "text", nullable: false),
                    requested_access_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    requested_can_view = table.Column<bool>(type: "boolean", nullable: false),
                    requested_can_create = table.Column<bool>(type: "boolean", nullable: false),
                    requested_can_edit = table.Column<bool>(type: "boolean", nullable: false),
                    requested_can_delete = table.Column<bool>(type: "boolean", nullable: false),
                    requested_can_approve = table.Column<bool>(type: "boolean", nullable: false),
                    requested_can_export = table.Column<bool>(type: "boolean", nullable: false),
                    requested_access_start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    requested_access_end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    priority = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    reviewed_by = table.Column<Guid>(type: "uuid", nullable: true),
                    reviewed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    reviewer_role = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    review_notes = table.Column<string>(type: "text", nullable: true),
                    rejection_reason = table.Column<string>(type: "text", nullable: true),
                    auto_approved = table.Column<bool>(type: "boolean", nullable: false),
                    auto_approval_reason = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_department_access_request", x => x.id);
                    table.ForeignKey(
                        name: "FK_department_access_request_department_department_id",
                        column: x => x.department_id,
                        principalTable: "department",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_department_access_request_users_reviewed_by",
                        column: x => x.reviewed_by,
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_department_access_request_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DepartmentAccessRules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    BranchId = table.Column<Guid>(type: "uuid", nullable: true),
                    DepartmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    DepartmentCode = table.Column<string>(type: "text", nullable: false),
                    DepartmentName = table.Column<string>(type: "text", nullable: false),
                    RequiresApproval = table.Column<bool>(type: "boolean", nullable: false),
                    ApproverRoleIds = table.Column<string>(type: "text", nullable: true),
                    ApproverRoleNames = table.Column<string>(type: "text", nullable: true),
                    RequiresSupervisor = table.Column<bool>(type: "boolean", nullable: false),
                    SupervisorRoleIds = table.Column<string>(type: "text", nullable: true),
                    SupervisorRoleNames = table.Column<string>(type: "text", nullable: true),
                    EnableAutoExpiration = table.Column<bool>(type: "boolean", nullable: false),
                    MaxAccessDurationDays = table.Column<int>(type: "integer", nullable: true),
                    RestrictedPermissions = table.Column<string>(type: "text", nullable: true),
                    RequiresJustification = table.Column<bool>(type: "boolean", nullable: false),
                    MinJustificationLength = table.Column<int>(type: "integer", nullable: true),
                    AllowEmergencyAccess = table.Column<bool>(type: "boolean", nullable: false),
                    EmergencyRoleIds = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DepartmentAccessRules", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "device",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    device_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    device_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    device_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    operating_system = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    os_version = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    browser = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    browser_version = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ip_address = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    location = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    user_agent = table.Column<string>(type: "text", nullable: true),
                    trust_level = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Untrusted"),
                    is_blocked = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    block_reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    is_primary_device = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    registered_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    last_seen_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    last_login_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    total_logins = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "active")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_device", x => x.id);
                    table.ForeignKey(
                        name: "FK_device_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_device_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "emergency_access",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    access_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    reason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    emergency_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: true),
                    granted_permissions = table.Column<string>(type: "jsonb", nullable: true),
                    scope = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "Limited"),
                    start_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    duration_minutes = table.Column<int>(type: "integer", nullable: false, defaultValue: 60),
                    auto_revoke_enabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    requires_approval = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    approved_by = table.Column<Guid>(type: "uuid", nullable: true),
                    approved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    approval_notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    rejected_by = table.Column<Guid>(type: "uuid", nullable: true),
                    rejected_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    rejection_reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    revoked_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    revoked_by = table.Column<Guid>(type: "uuid", nullable: true),
                    revocation_reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "pending"),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    audit_trail = table.Column<string>(type: "jsonb", nullable: true),
                    actions_performed = table.Column<string>(type: "jsonb", nullable: true),
                    notification_sent = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    notified_users = table.Column<string>(type: "jsonb", nullable: true),
                    requires_review = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    reviewed_by = table.Column<Guid>(type: "uuid", nullable: true),
                    reviewed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    review_notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    review_status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    risk_level = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "High"),
                    suspicious_activity = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_emergency_access", x => x.id);
                    table.ForeignKey(
                        name: "FK_emergency_access_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_emergency_access_users_approved_by",
                        column: x => x.approved_by,
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_emergency_access_users_rejected_by",
                        column: x => x.rejected_by,
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_emergency_access_users_reviewed_by",
                        column: x => x.reviewed_by,
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_emergency_access_users_revoked_by",
                        column: x => x.revoked_by,
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_emergency_access_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "password_reset_requests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    reset_token_hash = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    requested_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    requested_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    used_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ip_address = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    user_agent = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_password_reset_requests", x => x.id);
                    table.ForeignKey(
                        name: "FK_password_reset_requests_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SupervisedUsers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    BranchId = table.Column<Guid>(type: "uuid", nullable: true),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserName = table.Column<string>(type: "text", nullable: false),
                    FirstName = table.Column<string>(type: "text", nullable: false),
                    LastName = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Qualification = table.Column<string>(type: "text", nullable: true),
                    YearsOfExperience = table.Column<int>(type: "integer", nullable: true),
                    AssignedSupervisorId = table.Column<Guid>(type: "uuid", nullable: true),
                    SupervisorName = table.Column<string>(type: "text", nullable: true),
                    OversightLevel = table.Column<string>(type: "text", nullable: false),
                    RequiresCoSignature = table.Column<bool>(type: "boolean", nullable: false),
                    SupervisionStartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SupervisionEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ComplianceScore = table.Column<int>(type: "integer", nullable: false),
                    LastComplianceCheck = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ComplianceNotes = table.Column<string>(type: "text", nullable: true),
                    TotalActivities = table.Column<int>(type: "integer", nullable: false),
                    SupervisedActivities = table.Column<int>(type: "integer", nullable: false),
                    PendingApprovals = table.Column<int>(type: "integer", nullable: false),
                    LastActivityDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupervisedUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SupervisorAssignments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    BranchId = table.Column<Guid>(type: "uuid", nullable: true),
                    SupervisorUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    SupervisorName = table.Column<string>(type: "text", nullable: false),
                    Specialty = table.Column<string>(type: "text", nullable: true),
                    MaxSupervisees = table.Column<int>(type: "integer", nullable: false),
                    CurrentSupervisees = table.Column<int>(type: "integer", nullable: false),
                    AvailableSlots = table.Column<int>(type: "integer", nullable: false),
                    TotalSupervised = table.Column<int>(type: "integer", nullable: false),
                    ActiveSupervisions = table.Column<int>(type: "integer", nullable: false),
                    CompletedSupervisions = table.Column<int>(type: "integer", nullable: false),
                    AverageComplianceScore = table.Column<decimal>(type: "numeric", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupervisorAssignments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "system_alert",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    alert_type = table.Column<string>(type: "text", nullable: false),
                    severity = table.Column<string>(type: "text", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    count = table.Column<int>(type: "integer", nullable: false),
                    is_dismissed = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    dismissed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_system_alert", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "system_settings",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    category = table.Column<string>(type: "text", nullable: false),
                    key = table.Column<string>(type: "text", nullable: false),
                    value = table.Column<string>(type: "text", nullable: false),
                    data_type = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_system_settings", x => x.id);
                    table.ForeignKey(
                        name: "FK_system_settings_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_activation_log",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    activation_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    activated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    activated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    otp_sent_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    otp_used_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ip_address = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    user_agent = table.Column<string>(type: "text", nullable: true),
                    delivery_method = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    credential_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_activation_log", x => x.id);
                    table.ForeignKey(
                        name: "FK_user_activation_log_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_session",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    device_id = table.Column<Guid>(type: "uuid", nullable: true),
                    session_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    token_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    refresh_token = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    login_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    last_activity_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    logout_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    ip_address = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    user_agent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    location = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    session_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Web"),
                    login_method = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    suspicious_activity = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    termination_reason = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    terminated_by = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_session", x => x.id);
                    table.ForeignKey(
                        name: "FK_user_session_device_device_id",
                        column: x => x.device_id,
                        principalTable: "device",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_user_session_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_user_session_users_terminated_by",
                        column: x => x.terminated_by,
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_user_session_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_department_access_approved_by",
                table: "department_access",
                column: "approved_by");

            migrationBuilder.CreateIndex(
                name: "IX_department_access_branch_id",
                table: "department_access",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "IX_department_access_created_by",
                table: "department_access",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "IX_access_policy_created_by_user_id",
                table: "access_policy",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_access_policy_policy_code",
                table: "access_policy",
                column: "policy_code");

            migrationBuilder.CreateIndex(
                name: "IX_access_policy_priority",
                table: "access_policy",
                column: "priority");

            migrationBuilder.CreateIndex(
                name: "IX_access_policy_tenant_id_is_active",
                table: "access_policy",
                columns: new[] { "tenant_id", "is_active" });

            migrationBuilder.CreateIndex(
                name: "IX_access_policy_updated_by_user_id",
                table: "access_policy",
                column: "updated_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_activation_audit_log_tenant_id_user_id",
                table: "activation_audit_log",
                columns: new[] { "tenant_id", "user_id" });

            migrationBuilder.CreateIndex(
                name: "IX_activation_audit_log_timestamp",
                table: "activation_audit_log",
                column: "timestamp");

            migrationBuilder.CreateIndex(
                name: "IX_department_access_audit_log_department_id",
                table: "department_access_audit_log",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "IX_department_access_audit_log_performed_by",
                table: "department_access_audit_log",
                column: "performed_by");

            migrationBuilder.CreateIndex(
                name: "IX_department_access_audit_log_user_id",
                table: "department_access_audit_log",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_department_access_request_department_id",
                table: "department_access_request",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "IX_department_access_request_reviewed_by",
                table: "department_access_request",
                column: "reviewed_by");

            migrationBuilder.CreateIndex(
                name: "IX_department_access_request_user_id",
                table: "department_access_request",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_device_device_id",
                table: "device",
                column: "device_id");

            migrationBuilder.CreateIndex(
                name: "IX_device_tenant_id_user_id",
                table: "device",
                columns: new[] { "tenant_id", "user_id" });

            migrationBuilder.CreateIndex(
                name: "IX_device_user_id_is_blocked",
                table: "device",
                columns: new[] { "user_id", "is_blocked" });

            migrationBuilder.CreateIndex(
                name: "IX_emergency_access_access_code",
                table: "emergency_access",
                column: "access_code");

            migrationBuilder.CreateIndex(
                name: "IX_emergency_access_approved_by",
                table: "emergency_access",
                column: "approved_by");

            migrationBuilder.CreateIndex(
                name: "IX_emergency_access_rejected_by",
                table: "emergency_access",
                column: "rejected_by");

            migrationBuilder.CreateIndex(
                name: "IX_emergency_access_reviewed_by",
                table: "emergency_access",
                column: "reviewed_by");

            migrationBuilder.CreateIndex(
                name: "IX_emergency_access_revoked_by",
                table: "emergency_access",
                column: "revoked_by");

            migrationBuilder.CreateIndex(
                name: "IX_emergency_access_start_time_end_time",
                table: "emergency_access",
                columns: new[] { "start_time", "end_time" });

            migrationBuilder.CreateIndex(
                name: "IX_emergency_access_tenant_id_status",
                table: "emergency_access",
                columns: new[] { "tenant_id", "status" });

            migrationBuilder.CreateIndex(
                name: "IX_emergency_access_user_id_status",
                table: "emergency_access",
                columns: new[] { "user_id", "status" });

            migrationBuilder.CreateIndex(
                name: "IX_password_reset_requests_tenant_id",
                table: "password_reset_requests",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_system_settings_tenant_id_category_key",
                table: "system_settings",
                columns: new[] { "tenant_id", "category", "key" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_user_activation_log_tenant_id",
                table: "user_activation_log",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_session_device_id",
                table: "user_session",
                column: "device_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_session_expires_at",
                table: "user_session",
                column: "expires_at");

            migrationBuilder.CreateIndex(
                name: "IX_user_session_session_id",
                table: "user_session",
                column: "session_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_session_tenant_id_user_id",
                table: "user_session",
                columns: new[] { "tenant_id", "user_id" });

            migrationBuilder.CreateIndex(
                name: "IX_user_session_terminated_by",
                table: "user_session",
                column: "terminated_by");

            migrationBuilder.CreateIndex(
                name: "IX_user_session_user_id_is_active",
                table: "user_session",
                columns: new[] { "user_id", "is_active" });

            migrationBuilder.AddForeignKey(
                name: "FK_department_access_branch_branch_id",
                table: "department_access",
                column: "branch_id",
                principalTable: "branch",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_department_access_department_department_id",
                table: "department_access",
                column: "department_id",
                principalTable: "department",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_department_access_tenant_tenant_id",
                table: "department_access",
                column: "tenant_id",
                principalTable: "tenant",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_department_access_users_approved_by",
                table: "department_access",
                column: "approved_by",
                principalTable: "users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_department_access_users_created_by",
                table: "department_access",
                column: "created_by",
                principalTable: "users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_department_access_users_user_id",
                table: "department_access",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_user_branches_branch_branch_id",
                table: "user_branches",
                column: "branch_id",
                principalTable: "branch",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_user_branches_users_user_id",
                table: "user_branches",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_department_access_branch_branch_id",
                table: "department_access");

            migrationBuilder.DropForeignKey(
                name: "FK_department_access_department_department_id",
                table: "department_access");

            migrationBuilder.DropForeignKey(
                name: "FK_department_access_tenant_tenant_id",
                table: "department_access");

            migrationBuilder.DropForeignKey(
                name: "FK_department_access_users_approved_by",
                table: "department_access");

            migrationBuilder.DropForeignKey(
                name: "FK_department_access_users_created_by",
                table: "department_access");

            migrationBuilder.DropForeignKey(
                name: "FK_department_access_users_user_id",
                table: "department_access");

            migrationBuilder.DropForeignKey(
                name: "FK_user_branches_branch_branch_id",
                table: "user_branches");

            migrationBuilder.DropForeignKey(
                name: "FK_user_branches_users_user_id",
                table: "user_branches");

            migrationBuilder.DropTable(
                name: "access_policy");

            migrationBuilder.DropTable(
                name: "activation_audit_log");

            migrationBuilder.DropTable(
                name: "department_access_audit_log");

            migrationBuilder.DropTable(
                name: "department_access_request");

            migrationBuilder.DropTable(
                name: "DepartmentAccessRules");

            migrationBuilder.DropTable(
                name: "emergency_access");

            migrationBuilder.DropTable(
                name: "password_reset_requests");

            migrationBuilder.DropTable(
                name: "SupervisedUsers");

            migrationBuilder.DropTable(
                name: "SupervisorAssignments");

            migrationBuilder.DropTable(
                name: "system_alert");

            migrationBuilder.DropTable(
                name: "system_settings");

            migrationBuilder.DropTable(
                name: "user_activation_log");

            migrationBuilder.DropTable(
                name: "user_session");

            migrationBuilder.DropTable(
                name: "device");

            migrationBuilder.DropPrimaryKey(
                name: "PK_user_branches",
                table: "user_branches");

            migrationBuilder.DropPrimaryKey(
                name: "PK_department_access",
                table: "department_access");

            migrationBuilder.DropIndex(
                name: "IX_department_access_approved_by",
                table: "department_access");

            migrationBuilder.DropIndex(
                name: "IX_department_access_branch_id",
                table: "department_access");

            migrationBuilder.DropIndex(
                name: "IX_department_access_created_by",
                table: "department_access");

            migrationBuilder.DropColumn(
                name: "NpiNumber",
                table: "users");

            migrationBuilder.DropColumn(
                name: "accepted_hipaa",
                table: "users");

            migrationBuilder.DropColumn(
                name: "accepted_hipaa_at",
                table: "users");

            migrationBuilder.DropColumn(
                name: "accepted_privacy",
                table: "users");

            migrationBuilder.DropColumn(
                name: "accepted_privacy_at",
                table: "users");

            migrationBuilder.DropColumn(
                name: "accepted_terms",
                table: "users");

            migrationBuilder.DropColumn(
                name: "accepted_terms_at",
                table: "users");

            migrationBuilder.DropColumn(
                name: "activation_status",
                table: "users");

            migrationBuilder.DropColumn(
                name: "compliance_acceptance_ip",
                table: "users");

            migrationBuilder.DropColumn(
                name: "email_verification_sent_at",
                table: "users");

            migrationBuilder.DropColumn(
                name: "email_verification_token",
                table: "users");

            migrationBuilder.DropColumn(
                name: "email_verified",
                table: "users");

            migrationBuilder.DropColumn(
                name: "failed_login_attempts",
                table: "users");

            migrationBuilder.DropColumn(
                name: "last_login_ip",
                table: "users");

            migrationBuilder.DropColumn(
                name: "last_password_change",
                table: "users");

            migrationBuilder.DropColumn(
                name: "locked_until",
                table: "users");

            migrationBuilder.DropColumn(
                name: "must_reset_password",
                table: "users");

            migrationBuilder.DropColumn(
                name: "one_time_password_hash",
                table: "users");

            migrationBuilder.DropColumn(
                name: "otp_expires_at",
                table: "users");

            migrationBuilder.DropColumn(
                name: "password_reset_token",
                table: "users");

            migrationBuilder.DropColumn(
                name: "reset_token_expires_at",
                table: "users");

            migrationBuilder.DropColumn(
                name: "address",
                table: "tenant");

            migrationBuilder.DropColumn(
                name: "city",
                table: "tenant");

            migrationBuilder.DropColumn(
                name: "country",
                table: "tenant");

            migrationBuilder.DropColumn(
                name: "pincode",
                table: "tenant");

            migrationBuilder.DropColumn(
                name: "state",
                table: "tenant");

            migrationBuilder.DropColumn(
                name: "tenant_type",
                table: "tenant");

            migrationBuilder.DropColumn(
                name: "accreditation_status",
                table: "organization");

            migrationBuilder.DropColumn(
                name: "address",
                table: "organization");

            migrationBuilder.DropColumn(
                name: "city",
                table: "organization");

            migrationBuilder.DropColumn(
                name: "date_format",
                table: "organization");

            migrationBuilder.DropColumn(
                name: "description",
                table: "organization");

            migrationBuilder.DropColumn(
                name: "email",
                table: "organization");

            migrationBuilder.DropColumn(
                name: "license_number",
                table: "organization");

            migrationBuilder.DropColumn(
                name: "logo_url",
                table: "organization");

            migrationBuilder.DropColumn(
                name: "number_format",
                table: "organization");

            migrationBuilder.DropColumn(
                name: "operational_since",
                table: "organization");

            migrationBuilder.DropColumn(
                name: "organization_name",
                table: "organization");

            migrationBuilder.DropColumn(
                name: "phone",
                table: "organization");

            migrationBuilder.DropColumn(
                name: "postal_code",
                table: "organization");

            migrationBuilder.DropColumn(
                name: "primary_color",
                table: "organization");

            migrationBuilder.DropColumn(
                name: "primary_contact_email",
                table: "organization");

            migrationBuilder.DropColumn(
                name: "primary_contact_name",
                table: "organization");

            migrationBuilder.DropColumn(
                name: "primary_contact_phone",
                table: "organization");

            migrationBuilder.DropColumn(
                name: "regulatory_body",
                table: "organization");

            migrationBuilder.DropColumn(
                name: "secondary_color",
                table: "organization");

            migrationBuilder.DropColumn(
                name: "time_format",
                table: "organization");

            migrationBuilder.DropColumn(
                name: "website",
                table: "organization");

            migrationBuilder.DropColumn(
                name: "can_have_subdepartments",
                table: "department");

            migrationBuilder.DropColumn(
                name: "color",
                table: "department");

            migrationBuilder.DropColumn(
                name: "department_level",
                table: "department");

            migrationBuilder.DropColumn(
                name: "display_order",
                table: "department");

            migrationBuilder.DropColumn(
                name: "icon",
                table: "department");

            migrationBuilder.DropColumn(
                name: "inherit_permissions",
                table: "department");

            migrationBuilder.DropColumn(
                name: "is_standard_department",
                table: "department");

            migrationBuilder.DropColumn(
                name: "branch_type",
                table: "branch");

            migrationBuilder.DropColumn(
                name: "website",
                table: "branch");

            migrationBuilder.DropColumn(
                name: "ComplianceFlags",
                table: "audit_log");

            migrationBuilder.DropColumn(
                name: "DataClassification",
                table: "audit_log");

            migrationBuilder.DropColumn(
                name: "EventHash",
                table: "audit_log");

            migrationBuilder.DropColumn(
                name: "IsImmutable",
                table: "audit_log");

            migrationBuilder.DropColumn(
                name: "IsSystemGenerated",
                table: "audit_log");

            migrationBuilder.DropColumn(
                name: "PreviousEventHash",
                table: "audit_log");

            migrationBuilder.DropColumn(
                name: "RetentionDays",
                table: "audit_log");

            migrationBuilder.DropColumn(
                name: "RetentionExpiry",
                table: "audit_log");

            migrationBuilder.DropColumn(
                name: "RiskLevel",
                table: "audit_log");

            migrationBuilder.DropColumn(
                name: "SequenceNumber",
                table: "audit_log");

            migrationBuilder.DropColumn(
                name: "SessionId",
                table: "audit_log");

            migrationBuilder.DropColumn(
                name: "assigned_at",
                table: "user_branches");

            migrationBuilder.DropColumn(
                name: "notes",
                table: "user_branches");

            migrationBuilder.DropColumn(
                name: "access_end_date",
                table: "department_access");

            migrationBuilder.DropColumn(
                name: "access_start_date",
                table: "department_access");

            migrationBuilder.DropColumn(
                name: "approval_notes",
                table: "department_access");

            migrationBuilder.DropColumn(
                name: "approved_by",
                table: "department_access");

            migrationBuilder.DropColumn(
                name: "can_approve",
                table: "department_access");

            migrationBuilder.DropColumn(
                name: "can_create",
                table: "department_access");

            migrationBuilder.DropColumn(
                name: "can_delete",
                table: "department_access");

            migrationBuilder.DropColumn(
                name: "can_edit",
                table: "department_access");

            migrationBuilder.DropColumn(
                name: "can_view",
                table: "department_access");

            migrationBuilder.DropColumn(
                name: "is_active",
                table: "department_access");

            migrationBuilder.RenameTable(
                name: "user_branches",
                newName: "user_branch_access");

            migrationBuilder.RenameTable(
                name: "department_access",
                newName: "user_department_access");

            migrationBuilder.RenameColumn(
                name: "updated_by_user_id",
                table: "user_branch_access",
                newName: "updated_by");

            migrationBuilder.RenameColumn(
                name: "is_default",
                table: "user_branch_access",
                newName: "is_primary");

            migrationBuilder.RenameColumn(
                name: "effective_until",
                table: "user_branch_access",
                newName: "valid_until");

            migrationBuilder.RenameColumn(
                name: "effective_from",
                table: "user_branch_access",
                newName: "assigned_on");

            migrationBuilder.RenameColumn(
                name: "created_by_user_id",
                table: "user_branch_access",
                newName: "created_by");

            migrationBuilder.RenameColumn(
                name: "assigned_by_user_id",
                table: "user_branch_access",
                newName: "assigned_by");

            migrationBuilder.RenameIndex(
                name: "IX_user_branches_user_id",
                table: "user_branch_access",
                newName: "IX_user_branch_access_user_id");

            migrationBuilder.RenameIndex(
                name: "IX_user_branches_tenant_id_user_id_branch_id",
                table: "user_branch_access",
                newName: "IX_user_branch_access_tenant_id_user_id_branch_id");

            migrationBuilder.RenameIndex(
                name: "IX_user_branches_branch_id",
                table: "user_branch_access",
                newName: "IX_user_branch_access_branch_id");

            migrationBuilder.RenameColumn(
                name: "created_by",
                table: "user_department_access",
                newName: "created_by_user_id");

            migrationBuilder.RenameColumn(
                name: "updated_by",
                table: "user_department_access",
                newName: "sub_department_id");

            migrationBuilder.RenameColumn(
                name: "deleted_by",
                table: "user_department_access",
                newName: "revoked_by_user_id");

            migrationBuilder.RenameColumn(
                name: "can_export",
                table: "user_department_access",
                newName: "is_primary");

            migrationBuilder.RenameColumn(
                name: "branch_id",
                table: "user_department_access",
                newName: "granted_by_user_id");

            migrationBuilder.RenameColumn(
                name: "approved_at",
                table: "user_department_access",
                newName: "effective_to");

            migrationBuilder.RenameIndex(
                name: "IX_department_access_user_id",
                table: "user_department_access",
                newName: "IX_user_department_access_user_id");

            migrationBuilder.RenameIndex(
                name: "IX_department_access_tenant_id_user_id_department_id",
                table: "user_department_access",
                newName: "IX_user_department_access_tenant_id_user_id_department_id");

            migrationBuilder.RenameIndex(
                name: "IX_department_access_department_id",
                table: "user_department_access",
                newName: "IX_user_department_access_department_id");

            migrationBuilder.AlterColumn<Guid>(
                name: "branch_id",
                table: "app_user_roles",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "updated_at",
                table: "user_branch_access",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddColumn<string>(
                name: "access_level",
                table: "user_branch_access",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "Full");

            migrationBuilder.AddColumn<DateTime>(
                name: "deleted_at",
                table: "user_branch_access",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "valid_from",
                table: "user_branch_access",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "status",
                table: "user_department_access",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Active",
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldDefaultValue: "Active");

            migrationBuilder.AlterColumn<DateTime>(
                name: "created_at",
                table: "user_department_access",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AlterColumn<string>(
                name: "access_type",
                table: "user_department_access",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "Full Access",
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20,
                oldDefaultValue: "Secondary");

            migrationBuilder.AddColumn<DateTime>(
                name: "effective_from",
                table: "user_department_access",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "granted_at",
                table: "user_department_access",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "role_id",
                table: "user_department_access",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddPrimaryKey(
                name: "PK_user_branch_access",
                table: "user_branch_access",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_user_department_access",
                table: "user_department_access",
                column: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_user_branch_access_branch_branch_id",
                table: "user_branch_access",
                column: "branch_id",
                principalTable: "branch",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_user_branch_access_users_user_id",
                table: "user_branch_access",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_user_department_access_department_department_id",
                table: "user_department_access",
                column: "department_id",
                principalTable: "department",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_user_department_access_tenant_tenant_id",
                table: "user_department_access",
                column: "tenant_id",
                principalTable: "tenant",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_user_department_access_users_user_id",
                table: "user_department_access",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
