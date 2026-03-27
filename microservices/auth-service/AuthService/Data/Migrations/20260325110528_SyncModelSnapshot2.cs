using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuthService.Data.Migrations
{
    /// <inheritdoc />
    public partial class SyncModelSnapshot2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_opd_bill_items_service_catalog_service_catalog_id",
                table: "opd_bill_items");

            migrationBuilder.DropTable(
                name: "iol_catalog_master");

            migrationBuilder.DropTable(
                name: "service_catalog");

            migrationBuilder.DropTable(
                name: "surgery_types");

            migrationBuilder.DropIndex(
                name: "IX_opd_bill_items_service_catalog_id",
                table: "opd_bill_items");

            migrationBuilder.DropColumn(
                name: "service_catalog_id",
                table: "opd_bill_items");

            migrationBuilder.RenameColumn(
                name: "sample_type",
                table: "lab_test_catalog",
                newName: "specimen_type");

            migrationBuilder.AddColumn<string>(
                name: "document_url",
                table: "preop_test_orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "workflow_hold_reason",
                table: "ot_schedules",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "workflow_last_updated_at",
                table: "ot_schedules",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "workflow_on_hold",
                table: "ot_schedules",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "workflow_steps_completed",
                table: "ot_schedules",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "workflow_total_steps",
                table: "ot_schedules",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "iol_master_id",
                table: "ot_booking_validations",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "iol_model",
                table: "ot_booking_validations",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "iol_power",
                table: "ot_booking_validations",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "iol_side",
                table: "ot_booking_validations",
                type: "character varying(5)",
                maxLength: 5,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "preop_instructions_given",
                table: "ot_booking_validations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "preop_instructions_given_at",
                table: "ot_booking_validations",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "preop_instructions_given_by",
                table: "ot_booking_validations",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "stock_check_status",
                table: "ot_booking_validations",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "stock_confirmed_at",
                table: "ot_booking_validations",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "stock_confirmed_by",
                table: "ot_booking_validations",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "stock_notes",
                table: "ot_booking_validations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "service_variant_id",
                table: "opd_bill_items",
                type: "uuid",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "tenant_id",
                table: "lab_test_catalog",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<string>(
                name: "test_type",
                table: "lab_test_catalog",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "auto_created",
                table: "dept_coordination_requests",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "confirmed_at",
                table: "dept_coordination_requests",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "confirmed_by",
                table: "dept_coordination_requests",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "external_ref",
                table: "dept_coordination_requests",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "priority",
                table: "dept_coordination_requests",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "request_type",
                table: "dept_coordination_requests",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "workflow_step",
                table: "dept_coordination_requests",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "test_type",
                table: "counselor_lab_order_items",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "contact_attempt_count",
                table: "counseling_sessions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "escalated_at",
                table: "counseling_sessions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "escalated_to_user_id",
                table: "counseling_sessions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "escalation_notes",
                table: "counseling_sessions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "escalation_status",
                table: "counseling_sessions",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "last_contact_date",
                table: "counseling_sessions",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "last_contact_outcome",
                table: "counseling_sessions",
                type: "character varying(60)",
                maxLength: 60,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "overdue_since_date",
                table: "counseling_sessions",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "sla_breach_at",
                table: "counseling_sessions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "communication_message_templates",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: true),
                    template_name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    template_category = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    channel = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    subject = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    body = table.Column<string>(type: "text", nullable: false),
                    delay_reason_target = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: true),
                    patient_type_target = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    estimated_read_time_sec = table.Column<int>(type: "integer", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    is_global = table.Column<bool>(type: "boolean", nullable: false),
                    requires_approval = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_communication_message_templates", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "counselor_callback_requests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    assigned_to_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    callback_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    channel = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    callback_date = table.Column<DateTime>(type: "date", nullable: false),
                    callback_time = table.Column<TimeSpan>(type: "interval", nullable: true),
                    callback_notes = table.Column<string>(type: "text", nullable: true),
                    patient_preferred_time = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: true),
                    callback_status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    completed_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    outcome_notes = table.Column<string>(type: "text", nullable: true),
                    outcome = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: true),
                    rescheduled_to_id = table.Column<Guid>(type: "uuid", nullable: true),
                    rescheduled_from_id = table.Column<Guid>(type: "uuid", nullable: true),
                    reminder_sent_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    patient_reminder_sent_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    priority = table.Column<short>(type: "smallint", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_counselor_callback_requests", x => x.id);
                    table.ForeignKey(
                        name: "FK_counselor_callback_requests_counseling_sessions_session_id",
                        column: x => x.session_id,
                        principalTable: "counseling_sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "counselor_communication_log",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    counselor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    channel = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    direction = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    communication_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    outcome = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    call_duration_minutes = table.Column<int>(type: "integer", nullable: true),
                    message_body = table.Column<string>(type: "text", nullable: true),
                    response_summary = table.Column<string>(type: "text", nullable: true),
                    next_action = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: true),
                    next_action_date = table.Column<DateTime>(type: "date", nullable: true),
                    template_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_counselor_communication_log", x => x.id);
                    table.ForeignKey(
                        name: "FK_counselor_communication_log_counseling_sessions_session_id",
                        column: x => x.session_id,
                        principalTable: "counseling_sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "insurance_preauth_requests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    schedule_id = table.Column<Guid>(type: "uuid", nullable: true),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: true),
                    insurance_provider = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    tpa_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    policy_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    member_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    group_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    preauth_request_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    insurer_reference_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    proposed_surgery_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    proposed_icd_code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    proposed_cpt_codes = table.Column<string>(type: "jsonb", nullable: true),
                    estimated_cost = table.Column<decimal>(type: "numeric", nullable: true),
                    requested_amount = table.Column<decimal>(type: "numeric", nullable: true),
                    preauth_status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    applied_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    last_status_change_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    responded_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    expiry_date = table.Column<DateTime>(type: "date", nullable: true),
                    approved_amount = table.Column<decimal>(type: "numeric", nullable: true),
                    approved_procedures = table.Column<string>(type: "jsonb", nullable: true),
                    rejection_reason = table.Column<string>(type: "text", nullable: true),
                    rejection_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    pending_docs_list = table.Column<string>(type: "jsonb", nullable: true),
                    documents_submitted = table.Column<string>(type: "jsonb", nullable: false),
                    insurer_contact_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    insurer_contact_phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    insurer_contact_email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    initial_approval_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    initial_approved_amount = table.Column<decimal>(type: "numeric", nullable: true),
                    initial_approved_by = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    final_approval_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    final_approved_amount = table.Column<decimal>(type: "numeric", nullable: true),
                    final_approved_by = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    discharge_hold = table.Column<bool>(type: "boolean", nullable: false),
                    schedule_override = table.Column<bool>(type: "boolean", nullable: true),
                    override_reason = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_insurance_preauth_requests", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "iol_master",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    model_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    brand_manufacturer = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    iol_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    origin = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    material = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    a_constant = table.Column<decimal>(type: "numeric", nullable: true),
                    power_range_min = table.Column<decimal>(type: "numeric", nullable: true),
                    power_range_max = table.Column<decimal>(type: "numeric", nullable: true),
                    power_increment = table.Column<decimal>(type: "numeric", nullable: true),
                    currency_code = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    product_code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_iol_master", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "ot_admission_checklist_completions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    schedule_id = table.Column<Guid>(type: "uuid", nullable: false),
                    item_id = table.Column<Guid>(type: "uuid", nullable: false),
                    template_id = table.Column<Guid>(type: "uuid", nullable: false),
                    is_complete = table.Column<bool>(type: "boolean", nullable: false),
                    completed_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    completed_by_dept = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    document_url = table.Column<string>(type: "text", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ot_admission_checklist_completions", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "patient_upload_links",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: true),
                    schedule_id = table.Column<Guid>(type: "uuid", nullable: true),
                    session_id = table.Column<Guid>(type: "uuid", nullable: true),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    link_token = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    link_url = table.Column<string>(type: "text", nullable: false),
                    purpose = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    used_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    uploaded_files = table.Column<string>(type: "jsonb", nullable: false),
                    file_count = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_patient_upload_links", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "pre_admission_checklist_items",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    template_id = table.Column<Guid>(type: "uuid", nullable: false),
                    item_key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    item_label = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    department_owner = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    department_color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    is_mandatory = table.Column<bool>(type: "boolean", nullable: false),
                    is_blocking = table.Column<bool>(type: "boolean", nullable: false),
                    applies_if_age_below = table.Column<int>(type: "integer", nullable: true),
                    requires_document = table.Column<bool>(type: "boolean", nullable: false),
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    workflow_step = table.Column<int>(type: "integer", nullable: true),
                    step_title = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    step_widget_component = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    requires_dept_notification = table.Column<bool>(type: "boolean", nullable: false),
                    notification_department = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_pre_admission_checklist_items", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "pre_admission_checklist_templates",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    template_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    patient_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    surgery_category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    min_patient_age = table.Column<int>(type: "integer", nullable: true),
                    max_patient_age = table.Column<int>(type: "integer", nullable: true),
                    applies_to_eye = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_pre_admission_checklist_templates", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "service_categories",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    display_order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_service_categories", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "iol_prices",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    iol_master_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: true),
                    amount = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    effective_from = table.Column<DateOnly>(type: "date", nullable: true),
                    effective_to = table.Column<DateOnly>(type: "date", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "active")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_iol_prices", x => x.id);
                    table.ForeignKey(
                        name: "FK_iol_prices_iol_master_iol_master_id",
                        column: x => x.iol_master_id,
                        principalTable: "iol_master",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "catalog_services",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    category_id = table.Column<Guid>(type: "uuid", nullable: false),
                    service_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    service_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    display_order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_catalog_services", x => x.id);
                    table.ForeignKey(
                        name: "FK_catalog_services_service_categories_category_id",
                        column: x => x.category_id,
                        principalTable: "service_categories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "service_variants",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    catalog_service_id = table.Column<Guid>(type: "uuid", nullable: false),
                    variant_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    variant_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    price_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "FIXED"),
                    has_iol_options = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    display_order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    sub_options = table.Column<string[]>(type: "text[]", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_service_variants", x => x.id);
                    table.ForeignKey(
                        name: "FK_service_variants_catalog_services_catalog_service_id",
                        column: x => x.catalog_service_id,
                        principalTable: "catalog_services",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "variant_iol_mapping",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    variant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    iol_master_id = table.Column<Guid>(type: "uuid", nullable: false),
                    is_default = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_variant_iol_mapping", x => x.id);
                    table.ForeignKey(
                        name: "FK_variant_iol_mapping_iol_master_iol_master_id",
                        column: x => x.iol_master_id,
                        principalTable: "iol_master",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_variant_iol_mapping_service_variants_variant_id",
                        column: x => x.variant_id,
                        principalTable: "service_variants",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "variant_prices",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    variant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: true),
                    amount = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    effective_from = table.Column<DateOnly>(type: "date", nullable: true),
                    effective_to = table.Column<DateOnly>(type: "date", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "active")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_variant_prices", x => x.id);
                    table.ForeignKey(
                        name: "FK_variant_prices_service_variants_variant_id",
                        column: x => x.variant_id,
                        principalTable: "service_variants",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ot_booking_validations_iol_master_id",
                table: "ot_booking_validations",
                column: "iol_master_id");

            migrationBuilder.CreateIndex(
                name: "IX_opd_bill_items_service_variant_id",
                table: "opd_bill_items",
                column: "service_variant_id");

            migrationBuilder.CreateIndex(
                name: "IX_catalog_services_category_id",
                table: "catalog_services",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "IX_catalog_services_service_code",
                table: "catalog_services",
                column: "service_code");

            migrationBuilder.CreateIndex(
                name: "IX_counselor_callback_requests_session_id",
                table: "counselor_callback_requests",
                column: "session_id");

            migrationBuilder.CreateIndex(
                name: "IX_counselor_communication_log_session_id",
                table: "counselor_communication_log",
                column: "session_id");

            migrationBuilder.CreateIndex(
                name: "IX_iol_master_iol_type",
                table: "iol_master",
                column: "iol_type");

            migrationBuilder.CreateIndex(
                name: "IX_iol_prices_iol_master_id",
                table: "iol_prices",
                column: "iol_master_id");

            migrationBuilder.CreateIndex(
                name: "IX_iol_prices_iol_master_id_branch_id_effective_to",
                table: "iol_prices",
                columns: new[] { "iol_master_id", "branch_id", "effective_to" });

            migrationBuilder.CreateIndex(
                name: "IX_service_categories_code",
                table: "service_categories",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_service_variants_catalog_service_id",
                table: "service_variants",
                column: "catalog_service_id");

            migrationBuilder.CreateIndex(
                name: "IX_service_variants_variant_code",
                table: "service_variants",
                column: "variant_code");

            migrationBuilder.CreateIndex(
                name: "IX_variant_iol_mapping_iol_master_id",
                table: "variant_iol_mapping",
                column: "iol_master_id");

            migrationBuilder.CreateIndex(
                name: "IX_variant_iol_mapping_variant_id_iol_master_id",
                table: "variant_iol_mapping",
                columns: new[] { "variant_id", "iol_master_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_variant_prices_variant_id",
                table: "variant_prices",
                column: "variant_id");

            migrationBuilder.CreateIndex(
                name: "IX_variant_prices_variant_id_branch_id_effective_to",
                table: "variant_prices",
                columns: new[] { "variant_id", "branch_id", "effective_to" });

            migrationBuilder.AddForeignKey(
                name: "FK_opd_bill_items_service_variants_service_variant_id",
                table: "opd_bill_items",
                column: "service_variant_id",
                principalTable: "service_variants",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ot_booking_validations_iol_master_iol_master_id",
                table: "ot_booking_validations",
                column: "iol_master_id",
                principalTable: "iol_master",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_opd_bill_items_service_variants_service_variant_id",
                table: "opd_bill_items");

            migrationBuilder.DropForeignKey(
                name: "FK_ot_booking_validations_iol_master_iol_master_id",
                table: "ot_booking_validations");

            migrationBuilder.DropTable(
                name: "communication_message_templates");

            migrationBuilder.DropTable(
                name: "counselor_callback_requests");

            migrationBuilder.DropTable(
                name: "counselor_communication_log");

            migrationBuilder.DropTable(
                name: "insurance_preauth_requests");

            migrationBuilder.DropTable(
                name: "iol_prices");

            migrationBuilder.DropTable(
                name: "ot_admission_checklist_completions");

            migrationBuilder.DropTable(
                name: "patient_upload_links");

            migrationBuilder.DropTable(
                name: "pre_admission_checklist_items");

            migrationBuilder.DropTable(
                name: "pre_admission_checklist_templates");

            migrationBuilder.DropTable(
                name: "variant_iol_mapping");

            migrationBuilder.DropTable(
                name: "variant_prices");

            migrationBuilder.DropTable(
                name: "iol_master");

            migrationBuilder.DropTable(
                name: "service_variants");

            migrationBuilder.DropTable(
                name: "catalog_services");

            migrationBuilder.DropTable(
                name: "service_categories");

            migrationBuilder.DropIndex(
                name: "IX_ot_booking_validations_iol_master_id",
                table: "ot_booking_validations");

            migrationBuilder.DropIndex(
                name: "IX_opd_bill_items_service_variant_id",
                table: "opd_bill_items");

            migrationBuilder.DropColumn(
                name: "document_url",
                table: "preop_test_orders");

            migrationBuilder.DropColumn(
                name: "workflow_hold_reason",
                table: "ot_schedules");

            migrationBuilder.DropColumn(
                name: "workflow_last_updated_at",
                table: "ot_schedules");

            migrationBuilder.DropColumn(
                name: "workflow_on_hold",
                table: "ot_schedules");

            migrationBuilder.DropColumn(
                name: "workflow_steps_completed",
                table: "ot_schedules");

            migrationBuilder.DropColumn(
                name: "workflow_total_steps",
                table: "ot_schedules");

            migrationBuilder.DropColumn(
                name: "iol_master_id",
                table: "ot_booking_validations");

            migrationBuilder.DropColumn(
                name: "iol_model",
                table: "ot_booking_validations");

            migrationBuilder.DropColumn(
                name: "iol_power",
                table: "ot_booking_validations");

            migrationBuilder.DropColumn(
                name: "iol_side",
                table: "ot_booking_validations");

            migrationBuilder.DropColumn(
                name: "preop_instructions_given",
                table: "ot_booking_validations");

            migrationBuilder.DropColumn(
                name: "preop_instructions_given_at",
                table: "ot_booking_validations");

            migrationBuilder.DropColumn(
                name: "preop_instructions_given_by",
                table: "ot_booking_validations");

            migrationBuilder.DropColumn(
                name: "stock_check_status",
                table: "ot_booking_validations");

            migrationBuilder.DropColumn(
                name: "stock_confirmed_at",
                table: "ot_booking_validations");

            migrationBuilder.DropColumn(
                name: "stock_confirmed_by",
                table: "ot_booking_validations");

            migrationBuilder.DropColumn(
                name: "stock_notes",
                table: "ot_booking_validations");

            migrationBuilder.DropColumn(
                name: "service_variant_id",
                table: "opd_bill_items");

            migrationBuilder.DropColumn(
                name: "test_type",
                table: "lab_test_catalog");

            migrationBuilder.DropColumn(
                name: "auto_created",
                table: "dept_coordination_requests");

            migrationBuilder.DropColumn(
                name: "confirmed_at",
                table: "dept_coordination_requests");

            migrationBuilder.DropColumn(
                name: "confirmed_by",
                table: "dept_coordination_requests");

            migrationBuilder.DropColumn(
                name: "external_ref",
                table: "dept_coordination_requests");

            migrationBuilder.DropColumn(
                name: "priority",
                table: "dept_coordination_requests");

            migrationBuilder.DropColumn(
                name: "request_type",
                table: "dept_coordination_requests");

            migrationBuilder.DropColumn(
                name: "workflow_step",
                table: "dept_coordination_requests");

            migrationBuilder.DropColumn(
                name: "test_type",
                table: "counselor_lab_order_items");

            migrationBuilder.DropColumn(
                name: "contact_attempt_count",
                table: "counseling_sessions");

            migrationBuilder.DropColumn(
                name: "escalated_at",
                table: "counseling_sessions");

            migrationBuilder.DropColumn(
                name: "escalated_to_user_id",
                table: "counseling_sessions");

            migrationBuilder.DropColumn(
                name: "escalation_notes",
                table: "counseling_sessions");

            migrationBuilder.DropColumn(
                name: "escalation_status",
                table: "counseling_sessions");

            migrationBuilder.DropColumn(
                name: "last_contact_date",
                table: "counseling_sessions");

            migrationBuilder.DropColumn(
                name: "last_contact_outcome",
                table: "counseling_sessions");

            migrationBuilder.DropColumn(
                name: "overdue_since_date",
                table: "counseling_sessions");

            migrationBuilder.DropColumn(
                name: "sla_breach_at",
                table: "counseling_sessions");

            migrationBuilder.RenameColumn(
                name: "specimen_type",
                table: "lab_test_catalog",
                newName: "sample_type");

            migrationBuilder.AddColumn<Guid>(
                name: "service_catalog_id",
                table: "opd_bill_items",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AlterColumn<Guid>(
                name: "tenant_id",
                table: "lab_test_catalog",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "iol_catalog_master",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    a_constant = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    brand_manufacturer = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    currency_code = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "INR"),
                    default_price = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    display_order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    distance_range = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    iol_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    is_featured = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    lens_category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    manufacturer_part_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    material = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    model_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    origin = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    power_increment = table.Column<decimal>(type: "numeric(4,2)", nullable: false),
                    power_range_max = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    power_range_min = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    product_code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    regulatory_approval = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    shelf_life_months = table.Column<int>(type: "integer", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "active"),
                    unit_of_measure = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "Per Lens"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_iol_catalog_master", x => x.id);
                    table.ForeignKey(
                        name: "FK_iol_catalog_master_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "service_catalog",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    department_id = table.Column<Guid>(type: "uuid", nullable: true),
                    base_price = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    is_taxable = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    requires_approval = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    service_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    service_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    specialty = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    tax_percentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false, defaultValue: 0m),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_service_catalog", x => x.id);
                    table.ForeignKey(
                        name: "FK_service_catalog_department_department_id",
                        column: x => x.department_id,
                        principalTable: "department",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "surgery_types",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    anesthesia_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    default_price = table.Column<decimal>(type: "numeric", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    display_order = table.Column<int>(type: "integer", nullable: true),
                    estimated_cost_max = table.Column<decimal>(type: "numeric", nullable: true),
                    estimated_cost_min = table.Column<decimal>(type: "numeric", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    pre_op_tests_required = table.Column<string>(type: "text", nullable: true),
                    prerequisites = table.Column<string>(type: "text", nullable: true),
                    procedure_code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    procedure_type = table.Column<string>(type: "text", nullable: true),
                    requires_admission = table.Column<bool>(type: "boolean", nullable: false),
                    requires_iol = table.Column<bool>(type: "boolean", nullable: false),
                    risks = table.Column<string>(type: "text", nullable: true),
                    surgery_category = table.Column<string>(type: "text", nullable: false),
                    surgery_code = table.Column<string>(type: "text", nullable: false),
                    surgery_name = table.Column<string>(type: "text", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    typical_admission_type = table.Column<string>(type: "text", nullable: true),
                    typical_duration_minutes = table.Column<int>(type: "integer", nullable: true),
                    typical_iol_types = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    unit_of_measure = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_surgery_types", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_opd_bill_items_service_catalog_id",
                table: "opd_bill_items",
                column: "service_catalog_id");

            migrationBuilder.CreateIndex(
                name: "IX_iol_catalog_master_iol_type_origin",
                table: "iol_catalog_master",
                columns: new[] { "iol_type", "origin" });

            migrationBuilder.CreateIndex(
                name: "IX_iol_catalog_master_is_active_display_order",
                table: "iol_catalog_master",
                columns: new[] { "is_active", "display_order" });

            migrationBuilder.CreateIndex(
                name: "IX_iol_catalog_master_product_code",
                table: "iol_catalog_master",
                column: "product_code");

            migrationBuilder.CreateIndex(
                name: "IX_iol_catalog_master_tenant_id",
                table: "iol_catalog_master",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_service_catalog_category",
                table: "service_catalog",
                column: "category");

            migrationBuilder.CreateIndex(
                name: "IX_service_catalog_department_id",
                table: "service_catalog",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "IX_service_catalog_service_code",
                table: "service_catalog",
                column: "service_code");

            migrationBuilder.CreateIndex(
                name: "IX_service_catalog_tenant_id",
                table: "service_catalog",
                column: "tenant_id");

            migrationBuilder.AddForeignKey(
                name: "FK_opd_bill_items_service_catalog_service_catalog_id",
                table: "opd_bill_items",
                column: "service_catalog_id",
                principalTable: "service_catalog",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
