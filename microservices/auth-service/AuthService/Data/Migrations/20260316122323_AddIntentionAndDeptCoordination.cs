using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuthService.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddIntentionAndDeptCoordination : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "session_id",
                table: "imaging_orders",
                type: "uuid",
                nullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "session_date",
                table: "counseling_sessions",
                type: "date",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddColumn<string>(
                name: "additional_notes",
                table: "counseling_sessions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "anesthesia_consent",
                table: "counseling_sessions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "anesthesia_type_choice",
                table: "counseling_sessions",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "attender_is_decision_maker",
                table: "counseling_sessions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "attender_name",
                table: "counseling_sessions",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "attender_notes",
                table: "counseling_sessions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "attender_phone",
                table: "counseling_sessions",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "attender_relation",
                table: "counseling_sessions",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "consent_forms_status",
                table: "counseling_sessions",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "consent_witness_name",
                table: "counseling_sessions",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "consent_witness_relation",
                table: "counseling_sessions",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "patient_intention",
                table: "counseling_sessions",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "patient_present",
                table: "counseling_sessions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "surgery_tentative_date",
                table: "counseling_sessions",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "surgery_tentative_eye",
                table: "counseling_sessions",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "surgery_tentative_surgeon_id",
                table: "counseling_sessions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "surgery_tentative_time_slot",
                table: "counseling_sessions",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "surgery_timeline",
                table: "counseling_sessions",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "video_consent_recorded",
                table: "counseling_sessions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "counselor_lab_order_items",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    ordered_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    lab_test_catalog_id = table.Column<Guid>(type: "uuid", nullable: true),
                    test_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    test_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    price = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: true),
                    urgency = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    ordered_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_counselor_lab_order_items", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "dept_coordination_requests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: true),
                    session_id = table.Column<Guid>(type: "uuid", nullable: true),
                    schedule_id = table.Column<Guid>(type: "uuid", nullable: true),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    department = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    request_status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    request_message = table.Column<string>(type: "text", nullable: true),
                    response_message = table.Column<string>(type: "text", nullable: true),
                    response_data = table.Column<string>(type: "jsonb", nullable: true),
                    requested_by = table.Column<Guid>(type: "uuid", nullable: true),
                    responded_by = table.Column<Guid>(type: "uuid", nullable: true),
                    requested_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    responded_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_dept_coordination_requests", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "lab_test_catalog",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    test_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    test_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    price = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: true),
                    turnaround_hours = table.Column<int>(type: "integer", nullable: true),
                    sample_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    is_pre_operative = table.Column<bool>(type: "boolean", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_lab_test_catalog", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "patient_medical_history",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    source = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    recorded_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    condition_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    condition_category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    details = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    recorded_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_patient_medical_history", x => x.id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "counselor_lab_order_items");

            migrationBuilder.DropTable(
                name: "dept_coordination_requests");

            migrationBuilder.DropTable(
                name: "lab_test_catalog");

            migrationBuilder.DropTable(
                name: "patient_medical_history");

            migrationBuilder.DropColumn(
                name: "session_id",
                table: "imaging_orders");

            migrationBuilder.DropColumn(
                name: "additional_notes",
                table: "counseling_sessions");

            migrationBuilder.DropColumn(
                name: "anesthesia_consent",
                table: "counseling_sessions");

            migrationBuilder.DropColumn(
                name: "anesthesia_type_choice",
                table: "counseling_sessions");

            migrationBuilder.DropColumn(
                name: "attender_is_decision_maker",
                table: "counseling_sessions");

            migrationBuilder.DropColumn(
                name: "attender_name",
                table: "counseling_sessions");

            migrationBuilder.DropColumn(
                name: "attender_notes",
                table: "counseling_sessions");

            migrationBuilder.DropColumn(
                name: "attender_phone",
                table: "counseling_sessions");

            migrationBuilder.DropColumn(
                name: "attender_relation",
                table: "counseling_sessions");

            migrationBuilder.DropColumn(
                name: "consent_forms_status",
                table: "counseling_sessions");

            migrationBuilder.DropColumn(
                name: "consent_witness_name",
                table: "counseling_sessions");

            migrationBuilder.DropColumn(
                name: "consent_witness_relation",
                table: "counseling_sessions");

            migrationBuilder.DropColumn(
                name: "patient_intention",
                table: "counseling_sessions");

            migrationBuilder.DropColumn(
                name: "patient_present",
                table: "counseling_sessions");

            migrationBuilder.DropColumn(
                name: "surgery_tentative_date",
                table: "counseling_sessions");

            migrationBuilder.DropColumn(
                name: "surgery_tentative_eye",
                table: "counseling_sessions");

            migrationBuilder.DropColumn(
                name: "surgery_tentative_surgeon_id",
                table: "counseling_sessions");

            migrationBuilder.DropColumn(
                name: "surgery_tentative_time_slot",
                table: "counseling_sessions");

            migrationBuilder.DropColumn(
                name: "surgery_timeline",
                table: "counseling_sessions");

            migrationBuilder.DropColumn(
                name: "video_consent_recorded",
                table: "counseling_sessions");

            migrationBuilder.AlterColumn<DateTime>(
                name: "session_date",
                table: "counseling_sessions",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "date");
        }
    }
}
