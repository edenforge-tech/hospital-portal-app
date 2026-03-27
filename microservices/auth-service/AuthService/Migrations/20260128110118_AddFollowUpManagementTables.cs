using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuthService.Migrations
{
    /// <inheritdoc />
    public partial class AddFollowUpManagementTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Designation",
                table: "users",
                newName: "designation");

            migrationBuilder.RenameColumn(
                name: "ProfessionalRegistrationDate",
                table: "users",
                newName: "professional_registration_date");

            migrationBuilder.RenameColumn(
                name: "NpiNumber",
                table: "users",
                newName: "npi_number");

            migrationBuilder.RenameColumn(
                name: "LicenseNumber",
                table: "users",
                newName: "license_number");

            migrationBuilder.RenameColumn(
                name: "RoleLevel",
                table: "app_roles",
                newName: "hierarchy_level");

            migrationBuilder.RenameColumn(
                name: "ParentRoleId",
                table: "app_roles",
                newName: "parent_role_id");

            migrationBuilder.AddColumn<Guid>(
                name: "department_id",
                table: "appointment",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "end_time",
                table: "appointment",
                type: "interval",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_recurring",
                table: "appointment",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "parent_appointment_id",
                table: "appointment",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "patient_email",
                table: "appointment",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "patient_phone",
                table: "appointment",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "priority",
                table: "appointment",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "reason_for_visit",
                table: "appointment",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "recurring_pattern",
                table: "appointment",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "start_time",
                table: "appointment",
                type: "interval",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AccessLevelConfigurations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Level = table.Column<int>(type: "integer", nullable: false),
                    LevelName = table.Column<string>(type: "text", nullable: false),
                    PermissionCodes = table.Column<List<string>>(type: "text[]", nullable: false),
                    DaysFromStart = table.Column<int>(type: "integer", nullable: false),
                    RequiresApproval = table.Column<bool>(type: "boolean", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccessLevelConfigurations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "appointment_conflicts",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    appointment_id = table.Column<Guid>(type: "uuid", nullable: true),
                    conflict_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    conflicting_appointment_id = table.Column<Guid>(type: "uuid", nullable: true),
                    conflict_message = table.Column<string>(type: "text", nullable: true),
                    detected_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    resolved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    resolution_notes = table.Column<string>(type: "text", nullable: true),
                    severity = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_appointment_conflicts", x => x.id);
                    table.ForeignKey(
                        name: "FK_appointment_conflicts_appointment_appointment_id",
                        column: x => x.appointment_id,
                        principalTable: "appointment",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_appointment_conflicts_appointment_conflicting_appointment_id",
                        column: x => x.conflicting_appointment_id,
                        principalTable: "appointment",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "appointment_reminders",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    appointment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    reminder_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    scheduled_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    sent_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    delivery_status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    error_message = table.Column<string>(type: "text", nullable: true),
                    retry_count = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_appointment_reminders", x => x.id);
                    table.ForeignKey(
                        name: "FK_appointment_reminders_appointment_appointment_id",
                        column: x => x.appointment_id,
                        principalTable: "appointment",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "appointment_statistics",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    date_range_start = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    date_range_end = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    doctor_id = table.Column<Guid>(type: "uuid", nullable: true),
                    department_id = table.Column<Guid>(type: "uuid", nullable: true),
                    total_appointments = table.Column<int>(type: "integer", nullable: false),
                    completed_appointments = table.Column<int>(type: "integer", nullable: false),
                    cancelled_appointments = table.Column<int>(type: "integer", nullable: false),
                    no_show_appointments = table.Column<int>(type: "integer", nullable: false),
                    average_duration_minutes = table.Column<decimal>(type: "numeric", nullable: true),
                    most_booked_time_slot = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    utilization_rate = table.Column<decimal>(type: "numeric", nullable: true),
                    calculated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_appointment_statistics", x => x.id);
                    table.ForeignKey(
                        name: "FK_appointment_statistics_department_department_id",
                        column: x => x.department_id,
                        principalTable: "department",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_appointment_statistics_users_doctor_id",
                        column: x => x.doctor_id,
                        principalTable: "users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "bed_inventory",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    bed_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    bed_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    bed_status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    floor_number = table.Column<int>(type: "integer", nullable: true),
                    room_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ward_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: true),
                    assigned_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    expected_discharge_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    equipment_available = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    is_isolation_bed = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_bed_inventory", x => x.id);
                    table.ForeignKey(
                        name: "FK_bed_inventory_branch_branch_id",
                        column: x => x.branch_id,
                        principalTable: "branch",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_bed_inventory_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "biometry_records",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: true),
                    eye = table.Column<string>(type: "character varying(2)", maxLength: 2, nullable: false),
                    axial_length = table.Column<decimal>(type: "numeric", nullable: false),
                    k1 = table.Column<decimal>(type: "numeric", nullable: false),
                    k2 = table.Column<decimal>(type: "numeric", nullable: false),
                    k1_axis = table.Column<int>(type: "integer", nullable: false),
                    acd = table.Column<decimal>(type: "numeric", nullable: false),
                    lens_thickness = table.Column<decimal>(type: "numeric", nullable: true),
                    white_to_white = table.Column<decimal>(type: "numeric", nullable: true),
                    snr = table.Column<decimal>(type: "numeric", nullable: true),
                    device = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    device_model = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    target_refraction = table.Column<decimal>(type: "numeric", nullable: false),
                    calculated_iol = table.Column<decimal>(type: "numeric", nullable: true),
                    selected_formula = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    iol_calculations = table.Column<string>(type: "text", nullable: true),
                    examination_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    examiner_id = table.Column<Guid>(type: "uuid", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_biometry_records", x => x.id);
                    table.ForeignKey(
                        name: "FK_biometry_records_branch_branch_id",
                        column: x => x.branch_id,
                        principalTable: "branch",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_biometry_records_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_biometry_records_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "branch_capacity_history",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    snapshot_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    total_beds = table.Column<int>(type: "integer", nullable: false),
                    general_beds_occupied = table.Column<int>(type: "integer", nullable: false),
                    icu_beds_occupied = table.Column<int>(type: "integer", nullable: false),
                    emergency_beds_occupied = table.Column<int>(type: "integer", nullable: false),
                    available_beds = table.Column<int>(type: "integer", nullable: false),
                    occupancy_percentage = table.Column<decimal>(type: "numeric", nullable: false),
                    capacity_alert_level = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_branch_capacity_history", x => x.id);
                    table.ForeignKey(
                        name: "FK_branch_capacity_history_branch_branch_id",
                        column: x => x.branch_id,
                        principalTable: "branch",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "bulk_operation_job",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    operation_type = table.Column<int>(type: "integer", nullable: false),
                    entity_type = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    total_records = table.Column<int>(type: "integer", nullable: false),
                    processed_records = table.Column<int>(type: "integer", nullable: false),
                    successful_records = table.Column<int>(type: "integer", nullable: false),
                    failed_records = table.Column<int>(type: "integer", nullable: false),
                    output_file_url = table.Column<string>(type: "text", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    started_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_bulk_operation_job", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "doctor_availability",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    doctor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    day_of_week = table.Column<int>(type: "integer", nullable: true),
                    specific_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    start_time = table.Column<TimeSpan>(type: "interval", nullable: false),
                    end_time = table.Column<TimeSpan>(type: "interval", nullable: false),
                    availability_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    reason = table.Column<string>(type: "text", nullable: true),
                    is_recurring = table.Column<bool>(type: "boolean", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_doctor_availability", x => x.id);
                    table.ForeignKey(
                        name: "FK_doctor_availability_users_doctor_id",
                        column: x => x.doctor_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "electrophysiology_tests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: true),
                    test_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    technician_id = table.Column<Guid>(type: "uuid", nullable: true),
                    device = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    test_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    test_protocol = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    eye_tested = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    scotopic_a_wave = table.Column<decimal>(type: "numeric", nullable: true),
                    scotopic_b_wave = table.Column<decimal>(type: "numeric", nullable: true),
                    photopic_a_wave = table.Column<decimal>(type: "numeric", nullable: true),
                    photopic_b_wave = table.Column<decimal>(type: "numeric", nullable: true),
                    flicker_response = table.Column<decimal>(type: "numeric", nullable: true),
                    p100_latency = table.Column<decimal>(type: "numeric", nullable: true),
                    p100_amplitude = table.Column<decimal>(type: "numeric", nullable: true),
                    arden_ratio = table.Column<decimal>(type: "numeric", nullable: true),
                    light_peak = table.Column<decimal>(type: "numeric", nullable: true),
                    dark_trough = table.Column<decimal>(type: "numeric", nullable: true),
                    interpretation = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    abnormality_type = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    waveform_data = table.Column<string>(type: "text", nullable: true),
                    image_paths = table.Column<string>(type: "text", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_electrophysiology_tests", x => x.id);
                    table.ForeignKey(
                        name: "FK_electrophysiology_tests_branch_branch_id",
                        column: x => x.branch_id,
                        principalTable: "branch",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_electrophysiology_tests_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_electrophysiology_tests_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "employee",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    department_id = table.Column<Guid>(type: "uuid", nullable: true),
                    manager_id = table.Column<Guid>(type: "uuid", nullable: true),
                    employee_number = table.Column<string>(type: "text", nullable: true),
                    hire_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    job_title = table.Column<string>(type: "text", nullable: true),
                    emergency_contact_name = table.Column<string>(type: "text", nullable: true),
                    emergency_contact_relationship = table.Column<string>(type: "text", nullable: true),
                    emergency_contact_phone = table.Column<string>(type: "text", nullable: true),
                    salary_grade = table.Column<string>(type: "text", nullable: true),
                    base_salary = table.Column<decimal>(type: "numeric", nullable: true),
                    benefits_package = table.Column<string>(type: "text", nullable: true),
                    work_schedule = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_employee", x => x.id);
                    table.ForeignKey(
                        name: "FK_employee_department_department_id",
                        column: x => x.department_id,
                        principalTable: "department",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_employee_employee_manager_id",
                        column: x => x.manager_id,
                        principalTable: "employee",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_employee_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "employment_category_lookup",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    category_code = table.Column<string>(type: "text", nullable: false),
                    category_name = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_employment_category_lookup", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "employment_type_lookup",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    type_code = table.Column<string>(type: "text", nullable: false),
                    type_name = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_employment_type_lookup", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "follow_up_appointments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    follow_up_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    related_procedure = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    procedure_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    scheduled_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    scheduled_time = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    priority = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    assigned_doctor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    department_id = table.Column<Guid>(type: "uuid", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    reminders_sent = table.Column<int>(type: "integer", nullable: false),
                    last_reminder_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    completed_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    outcome = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_follow_up_appointments", x => x.id);
                    table.ForeignKey(
                        name: "FK_follow_up_appointments_department_department_id",
                        column: x => x.department_id,
                        principalTable: "department",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_follow_up_appointments_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_follow_up_appointments_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_follow_up_appointments_users_assigned_doctor_id",
                        column: x => x.assigned_doctor_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "iol_inventory",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: true),
                    model = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    manufacturer = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    sku = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    material = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    a_constant = table.Column<decimal>(type: "numeric", nullable: false),
                    power_range_min = table.Column<decimal>(type: "numeric", nullable: false),
                    power_range_max = table.Column<decimal>(type: "numeric", nullable: false),
                    power_increment = table.Column<decimal>(type: "numeric", nullable: false),
                    optic_diameter = table.Column<decimal>(type: "numeric", nullable: false),
                    overall_diameter = table.Column<decimal>(type: "numeric", nullable: false),
                    cylinder_power_range = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    toricity = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    current_stock = table.Column<int>(type: "integer", nullable: false),
                    minimum_stock = table.Column<int>(type: "integer", nullable: false),
                    reorder_quantity = table.Column<int>(type: "integer", nullable: false),
                    location = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    unit_price = table.Column<decimal>(type: "numeric", nullable: false),
                    supplier_cost = table.Column<decimal>(type: "numeric", nullable: true),
                    supplier_id = table.Column<Guid>(type: "uuid", nullable: true),
                    supplier_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    lead_time_days = table.Column<int>(type: "integer", nullable: true),
                    total_used = table.Column<int>(type: "integer", nullable: false),
                    last_used_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    expiry_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    batch_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_iol_inventory", x => x.id);
                    table.ForeignKey(
                        name: "FK_iol_inventory_branch_branch_id",
                        column: x => x.branch_id,
                        principalTable: "branch",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_iol_inventory_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "oct_imaging_scans",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: true),
                    eye = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    scan_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    technician_id = table.Column<Guid>(type: "uuid", nullable: true),
                    device = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    device_model = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    scan_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    scan_pattern = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    scan_size = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    central_thickness = table.Column<decimal>(type: "numeric", nullable: true),
                    average_thickness = table.Column<decimal>(type: "numeric", nullable: true),
                    volume = table.Column<decimal>(type: "numeric", nullable: true),
                    rnfl_average = table.Column<decimal>(type: "numeric", nullable: true),
                    gcl_thickness = table.Column<decimal>(type: "numeric", nullable: true),
                    pathology_detected = table.Column<bool>(type: "boolean", nullable: false),
                    pathology_type = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    fluid_detected = table.Column<bool>(type: "boolean", nullable: false),
                    fluid_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    image_paths = table.Column<string>(type: "text", nullable: true),
                    data_file_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    thumbnail_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    signal_strength = table.Column<int>(type: "integer", nullable: true),
                    quality_score = table.Column<int>(type: "integer", nullable: true),
                    diagnosis = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_oct_imaging_scans", x => x.id);
                    table.ForeignKey(
                        name: "FK_oct_imaging_scans_branch_branch_id",
                        column: x => x.branch_id,
                        principalTable: "branch",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_oct_imaging_scans_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_oct_imaging_scans_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OnboardingChecklistItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkflowId = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false),
                    IsRequired = table.Column<bool>(type: "boolean", nullable: false),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    CompletionNotes = table.Column<string>(type: "text", nullable: true),
                    Category = table.Column<string>(type: "text", nullable: false),
                    DaysFromStart = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OnboardingChecklistItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OnboardingWorkflows",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserName = table.Column<string>(type: "text", nullable: false),
                    WorkflowName = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpectedCompletionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ActualCompletionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ProgressPercentage = table.Column<int>(type: "integer", nullable: false),
                    MentorId = table.Column<Guid>(type: "uuid", nullable: true),
                    MentorName = table.Column<string>(type: "text", nullable: true),
                    CurrentAccessLevel = table.Column<int>(type: "integer", nullable: false),
                    Day1AccessGrantedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Day7AccessGrantedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Day30AccessGrantedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OnboardingWorkflows", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "patient_reminders",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    reminder_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    message = table.Column<string>(type: "text", nullable: false),
                    scheduled_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    channels = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    sent_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    acknowledged = table.Column<bool>(type: "boolean", nullable: false),
                    acknowledged_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    failure_reason = table.Column<string>(type: "text", nullable: true),
                    retry_count = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_patient_reminders", x => x.id);
                    table.ForeignKey(
                        name: "FK_patient_reminders_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_patient_reminders_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PerformanceReviews",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    EmployeeId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReviewerId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReviewType = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ReviewPeriodStart = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReviewPeriodEnd = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    QualityOfWorkScore = table.Column<int>(type: "integer", nullable: true),
                    ProductivityScore = table.Column<int>(type: "integer", nullable: true),
                    TechnicalSkillsScore = table.Column<int>(type: "integer", nullable: true),
                    CommunicationScore = table.Column<int>(type: "integer", nullable: true),
                    TeamworkScore = table.Column<int>(type: "integer", nullable: true),
                    InitiativeScore = table.Column<int>(type: "integer", nullable: true),
                    ProblemSolvingScore = table.Column<int>(type: "integer", nullable: true),
                    AdaptabilityScore = table.Column<int>(type: "integer", nullable: true),
                    AttendancePunctualityScore = table.Column<int>(type: "integer", nullable: true),
                    ProfessionalismScore = table.Column<int>(type: "integer", nullable: true),
                    LearningDevelopmentScore = table.Column<int>(type: "integer", nullable: true),
                    PolicyComplianceScore = table.Column<int>(type: "integer", nullable: true),
                    CustomerServiceScore = table.Column<int>(type: "integer", nullable: true),
                    WeightedScore = table.Column<double>(type: "double precision", nullable: true),
                    StrengthsComments = table.Column<string>(type: "text", nullable: true),
                    AreasForImprovementComments = table.Column<string>(type: "text", nullable: true),
                    GoalsForNextPeriod = table.Column<string>(type: "text", nullable: true),
                    ReviewerComments = table.Column<string>(type: "text", nullable: true),
                    EmployeeComments = table.Column<string>(type: "text", nullable: true),
                    ProbationDecision = table.Column<int>(type: "integer", nullable: true),
                    ProbationExtensionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ProbationNotes = table.Column<string>(type: "text", nullable: true),
                    Level1ApproverId = table.Column<Guid>(type: "uuid", nullable: true),
                    Level1ApprovedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Level1Comments = table.Column<string>(type: "text", nullable: true),
                    Level2ApproverId = table.Column<Guid>(type: "uuid", nullable: true),
                    Level2ApprovedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Level2Comments = table.Column<string>(type: "text", nullable: true),
                    Level3ApproverId = table.Column<Guid>(type: "uuid", nullable: true),
                    Level3ApprovedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Level3Comments = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status_Audit = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PerformanceReviews", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "post_op_care_schedules",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    surgery_id = table.Column<Guid>(type: "uuid", nullable: true),
                    surgery_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    surgery_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    surgery_eye = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    surgeon_id = table.Column<Guid>(type: "uuid", nullable: false),
                    instructions = table.Column<string>(type: "text", nullable: true),
                    restrictions = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_post_op_care_schedules", x => x.id);
                    table.ForeignKey(
                        name: "FK_post_op_care_schedules_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_post_op_care_schedules_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_post_op_care_schedules_users_surgeon_id",
                        column: x => x.surgeon_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "professional_license",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    license_type = table.Column<string>(type: "text", nullable: false),
                    license_category = table.Column<string>(type: "text", nullable: true),
                    license_number = table.Column<string>(type: "text", nullable: true),
                    issuing_authority = table.Column<string>(type: "text", nullable: true),
                    issuing_country = table.Column<string>(type: "text", nullable: true),
                    issuing_state = table.Column<string>(type: "text", nullable: true),
                    issue_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    expiry_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    verification_status = table.Column<string>(type: "text", nullable: false),
                    verified_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    verified_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    verification_notes = table.Column<string>(type: "text", nullable: true),
                    document_url = table.Column<string>(type: "text", nullable: true),
                    renewal_document_url = table.Column<string>(type: "text", nullable: true),
                    scope_of_practice = table.Column<string>(type: "text", nullable: true),
                    restrictions = table.Column<string>(type: "text", nullable: true),
                    specializations = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_professional_license", x => x.id);
                    table.ForeignKey(
                        name: "FK_professional_license_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_professional_license_users_verified_by_user_id",
                        column: x => x.verified_by_user_id,
                        principalTable: "users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "retinopathy_screenings",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: true),
                    eye = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    screening_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    screener_id = table.Column<Guid>(type: "uuid", nullable: true),
                    device = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    device_model = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    dr_grade = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    macular_edema = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    hemorrhages_count = table.Column<int>(type: "integer", nullable: true),
                    microaneurysms_count = table.Column<int>(type: "integer", nullable: true),
                    hard_exudates = table.Column<bool>(type: "boolean", nullable: false),
                    soft_exudates = table.Column<bool>(type: "boolean", nullable: false),
                    neovascularization = table.Column<bool>(type: "boolean", nullable: false),
                    venous_beading = table.Column<bool>(type: "boolean", nullable: false),
                    irma = table.Column<bool>(type: "boolean", nullable: false),
                    image_paths = table.Column<string>(type: "text", nullable: true),
                    thumbnail_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    referral_required = table.Column<bool>(type: "boolean", nullable: false),
                    follow_up_months = table.Column<int>(type: "integer", nullable: true),
                    treatment_recommended = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    ai_grade = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ai_confidence = table.Column<decimal>(type: "numeric", nullable: true),
                    grader_agreement = table.Column<bool>(type: "boolean", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_retinopathy_screenings", x => x.id);
                    table.ForeignKey(
                        name: "FK_retinopathy_screenings_branch_branch_id",
                        column: x => x.branch_id,
                        principalTable: "branch",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_retinopathy_screenings_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_retinopathy_screenings_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "role_hierarchy",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    parent_role_id = table.Column<Guid>(type: "uuid", nullable: false),
                    child_role_id = table.Column<Guid>(type: "uuid", nullable: false),
                    level = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    inheritance_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "inherit_all"),
                    inheritance_config = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "{}"),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_by = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "active")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_role_hierarchy", x => x.id);
                    table.ForeignKey(
                        name: "FK_role_hierarchy_app_roles_child_role_id",
                        column: x => x.child_role_id,
                        principalTable: "app_roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_role_hierarchy_app_roles_parent_role_id",
                        column: x => x.parent_role_id,
                        principalTable: "app_roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "role_template",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    role_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    template_category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    priority = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    configuration = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "{}"),
                    metadata = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "{}"),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    is_system_template = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_by = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "active")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_role_template", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "SavedSearches",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    SearchName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Criteria = table.Column<string>(type: "text", nullable: false),
                    Scope = table.Column<int>(type: "integer", nullable: false),
                    IsGlobal = table.Column<bool>(type: "boolean", nullable: false),
                    IsFavorite = table.Column<bool>(type: "boolean", nullable: false),
                    ExecutionCount = table.Column<int>(type: "integer", nullable: false),
                    LastExecutedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SavedSearches", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TrainingAssignments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CourseId = table.Column<Guid>(type: "uuid", nullable: false),
                    AssignedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TrainingStatus = table.Column<int>(type: "integer", nullable: false),
                    CompletionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletionCertificateUrl = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    AssignedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrainingAssignments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TrainingCourses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CourseName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IsMandatory = table.Column<bool>(type: "boolean", nullable: false),
                    ValidityPeriodDays = table.Column<int>(type: "integer", nullable: false),
                    CourseProvider = table.Column<string>(type: "text", nullable: true),
                    DurationHours = table.Column<int>(type: "integer", nullable: true),
                    CourseUrl = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrainingCourses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "treatment_adherence",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    condition = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    treatment_plan = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    scheduled_appointments = table.Column<int>(type: "integer", nullable: false),
                    completed_appointments = table.Column<int>(type: "integer", nullable: false),
                    missed_appointments = table.Column<int>(type: "integer", nullable: false),
                    adherence_rate = table.Column<decimal>(type: "numeric", nullable: false),
                    risk_level = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    recommendations = table.Column<string>(type: "text", nullable: true),
                    last_review_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_treatment_adherence", x => x.id);
                    table.ForeignKey(
                        name: "FK_treatment_adherence_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_treatment_adherence_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_role_history",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    role_id = table.Column<Guid>(type: "uuid", nullable: false),
                    action = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    action_timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    effective_from = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    effective_until = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    assigned_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: true),
                    metadata = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "{}"),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "active")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_role_history", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "UserCredentials",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CredentialName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CredentialType = table.Column<string>(type: "text", nullable: true),
                    IssuingAuthority = table.Column<string>(type: "text", nullable: true),
                    CredentialNumber = table.Column<string>(type: "text", nullable: true),
                    IssuedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CredentialStatus = table.Column<int>(type: "integer", nullable: false),
                    IsRequired = table.Column<bool>(type: "boolean", nullable: false),
                    DocumentUrl = table.Column<string>(type: "text", nullable: true),
                    SuspendedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SuspendedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    SuspensionReason = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCredentials", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "patient_transfer_request",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    from_branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    to_branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    requested_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    request_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    transfer_reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    required_bed_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    transfer_status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    approved_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    approved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    rejected_reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    transferred_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    assigned_bed_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_patient_transfer_request", x => x.id);
                    table.ForeignKey(
                        name: "FK_patient_transfer_request_bed_inventory_assigned_bed_id",
                        column: x => x.assigned_bed_id,
                        principalTable: "bed_inventory",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_patient_transfer_request_branch_from_branch_id",
                        column: x => x.from_branch_id,
                        principalTable: "branch",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_patient_transfer_request_branch_to_branch_id",
                        column: x => x.to_branch_id,
                        principalTable: "branch",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_patient_transfer_request_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "employment_contract",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    employee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    contract_type = table.Column<string>(type: "text", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    contract_terms = table.Column<string>(type: "text", nullable: true),
                    document_url = table.Column<string>(type: "text", nullable: true),
                    auto_renewal = table.Column<bool>(type: "boolean", nullable: false),
                    renewal_notice_days = table.Column<int>(type: "integer", nullable: true),
                    renewal_status = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_employment_contract", x => x.id);
                    table.ForeignKey(
                        name: "FK_employment_contract_employee_employee_id",
                        column: x => x.employee_id,
                        principalTable: "employee",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "probation_tracking",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    employee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    probation_start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    probation_end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    probation_status = table.Column<string>(type: "text", nullable: false),
                    confirmation_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    reviewed_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    review_notes = table.Column<string>(type: "text", nullable: true),
                    extension_days = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_probation_tracking", x => x.id);
                    table.ForeignKey(
                        name: "FK_probation_tracking_employee_employee_id",
                        column: x => x.employee_id,
                        principalTable: "employee",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_probation_tracking_users_reviewed_by_user_id",
                        column: x => x.reviewed_by_user_id,
                        principalTable: "users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "iol_stock_adjustments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    item_id = table.Column<Guid>(type: "uuid", nullable: false),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    reason = table.Column<string>(type: "text", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: true),
                    surgery_id = table.Column<Guid>(type: "uuid", nullable: true),
                    batch_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    expiry_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_iol_stock_adjustments", x => x.id);
                    table.ForeignKey(
                        name: "FK_iol_stock_adjustments_iol_inventory_item_id",
                        column: x => x.item_id,
                        principalTable: "iol_inventory",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "post_op_medications",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    post_op_care_schedule_id = table.Column<Guid>(type: "uuid", nullable: false),
                    medication_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    dosage = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    frequency = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    adherence = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    last_refill_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_post_op_medications", x => x.id);
                    table.ForeignKey(
                        name: "FK_post_op_medications_post_op_care_schedules_post_op_care_sch~",
                        column: x => x.post_op_care_schedule_id,
                        principalTable: "post_op_care_schedules",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_post_op_medications_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "post_op_visits",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    post_op_care_schedule_id = table.Column<Guid>(type: "uuid", nullable: false),
                    visit_name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    scheduled_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    completed = table.Column<bool>(type: "boolean", nullable: false),
                    completed_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    findings = table.Column<string>(type: "text", nullable: true),
                    visual_acuity = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    iop = table.Column<decimal>(type: "numeric", nullable: true),
                    complications = table.Column<string>(type: "text", nullable: true),
                    examiner_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_post_op_visits", x => x.id);
                    table.ForeignKey(
                        name: "FK_post_op_visits_post_op_care_schedules_post_op_care_schedule~",
                        column: x => x.post_op_care_schedule_id,
                        principalTable: "post_op_care_schedules",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_post_op_visits_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_post_op_visits_users_examiner_id",
                        column: x => x.examiner_id,
                        principalTable: "users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "medication_adherence",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    treatment_adherence_id = table.Column<Guid>(type: "uuid", nullable: false),
                    medication_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    prescribed_dosage = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    adherence_percentage = table.Column<decimal>(type: "numeric", nullable: false),
                    missed_doses = table.Column<int>(type: "integer", nullable: false),
                    last_taken_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_medication_adherence", x => x.id);
                    table.ForeignKey(
                        name: "FK_medication_adherence_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_medication_adherence_treatment_adherence_treatment_adherenc~",
                        column: x => x.treatment_adherence_id,
                        principalTable: "treatment_adherence",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_appointment_department_id",
                table: "appointment",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "IX_appointment_parent_appointment_id",
                table: "appointment",
                column: "parent_appointment_id");

            migrationBuilder.CreateIndex(
                name: "IX_appointment_conflicts_appointment_id",
                table: "appointment_conflicts",
                column: "appointment_id");

            migrationBuilder.CreateIndex(
                name: "IX_appointment_conflicts_conflicting_appointment_id",
                table: "appointment_conflicts",
                column: "conflicting_appointment_id");

            migrationBuilder.CreateIndex(
                name: "IX_appointment_reminders_appointment_id",
                table: "appointment_reminders",
                column: "appointment_id");

            migrationBuilder.CreateIndex(
                name: "IX_appointment_statistics_department_id",
                table: "appointment_statistics",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "IX_appointment_statistics_doctor_id",
                table: "appointment_statistics",
                column: "doctor_id");

            migrationBuilder.CreateIndex(
                name: "IX_bed_inventory_branch_id",
                table: "bed_inventory",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "IX_bed_inventory_patient_id",
                table: "bed_inventory",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_biometry_records_branch_id",
                table: "biometry_records",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "IX_biometry_records_patient_id",
                table: "biometry_records",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_biometry_records_tenant_id",
                table: "biometry_records",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_branch_capacity_history_branch_id",
                table: "branch_capacity_history",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "IX_bulk_operation_job_created_at",
                table: "bulk_operation_job",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_bulk_operation_job_operation_type",
                table: "bulk_operation_job",
                column: "operation_type");

            migrationBuilder.CreateIndex(
                name: "IX_bulk_operation_job_status",
                table: "bulk_operation_job",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_bulk_operation_job_tenant_id",
                table: "bulk_operation_job",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_doctor_availability_doctor_id",
                table: "doctor_availability",
                column: "doctor_id");

            migrationBuilder.CreateIndex(
                name: "IX_electrophysiology_tests_branch_id",
                table: "electrophysiology_tests",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "IX_electrophysiology_tests_patient_id",
                table: "electrophysiology_tests",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_electrophysiology_tests_tenant_id",
                table: "electrophysiology_tests",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_employee_department_id",
                table: "employee",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "IX_employee_employee_number",
                table: "employee",
                column: "employee_number");

            migrationBuilder.CreateIndex(
                name: "IX_employee_manager_id",
                table: "employee",
                column: "manager_id");

            migrationBuilder.CreateIndex(
                name: "IX_employee_tenant_id",
                table: "employee",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_employee_user_id",
                table: "employee",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_employment_contract_employee_id",
                table: "employment_contract",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_employment_contract_tenant_id",
                table: "employment_contract",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_follow_up_appointments_assigned_doctor_id",
                table: "follow_up_appointments",
                column: "assigned_doctor_id");

            migrationBuilder.CreateIndex(
                name: "IX_follow_up_appointments_department_id",
                table: "follow_up_appointments",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "IX_follow_up_appointments_patient_id",
                table: "follow_up_appointments",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_follow_up_appointments_tenant_id",
                table: "follow_up_appointments",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_iol_inventory_branch_id",
                table: "iol_inventory",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "IX_iol_inventory_tenant_id",
                table: "iol_inventory",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_iol_stock_adjustments_item_id",
                table: "iol_stock_adjustments",
                column: "item_id");

            migrationBuilder.CreateIndex(
                name: "IX_medication_adherence_tenant_id",
                table: "medication_adherence",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_medication_adherence_treatment_adherence_id",
                table: "medication_adherence",
                column: "treatment_adherence_id");

            migrationBuilder.CreateIndex(
                name: "IX_oct_imaging_scans_branch_id",
                table: "oct_imaging_scans",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "IX_oct_imaging_scans_patient_id",
                table: "oct_imaging_scans",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_oct_imaging_scans_tenant_id",
                table: "oct_imaging_scans",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_patient_reminders_patient_id",
                table: "patient_reminders",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_patient_reminders_tenant_id",
                table: "patient_reminders",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_patient_transfer_request_assigned_bed_id",
                table: "patient_transfer_request",
                column: "assigned_bed_id");

            migrationBuilder.CreateIndex(
                name: "IX_patient_transfer_request_from_branch_id",
                table: "patient_transfer_request",
                column: "from_branch_id");

            migrationBuilder.CreateIndex(
                name: "IX_patient_transfer_request_patient_id",
                table: "patient_transfer_request",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_patient_transfer_request_to_branch_id",
                table: "patient_transfer_request",
                column: "to_branch_id");

            migrationBuilder.CreateIndex(
                name: "IX_post_op_care_schedules_patient_id",
                table: "post_op_care_schedules",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_post_op_care_schedules_surgeon_id",
                table: "post_op_care_schedules",
                column: "surgeon_id");

            migrationBuilder.CreateIndex(
                name: "IX_post_op_care_schedules_tenant_id",
                table: "post_op_care_schedules",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_post_op_medications_post_op_care_schedule_id",
                table: "post_op_medications",
                column: "post_op_care_schedule_id");

            migrationBuilder.CreateIndex(
                name: "IX_post_op_medications_tenant_id",
                table: "post_op_medications",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_post_op_visits_examiner_id",
                table: "post_op_visits",
                column: "examiner_id");

            migrationBuilder.CreateIndex(
                name: "IX_post_op_visits_post_op_care_schedule_id",
                table: "post_op_visits",
                column: "post_op_care_schedule_id");

            migrationBuilder.CreateIndex(
                name: "IX_post_op_visits_tenant_id",
                table: "post_op_visits",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_probation_tracking_employee_id",
                table: "probation_tracking",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_probation_tracking_reviewed_by_user_id",
                table: "probation_tracking",
                column: "reviewed_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_probation_tracking_tenant_id",
                table: "probation_tracking",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_professional_license_expiry_date",
                table: "professional_license",
                column: "expiry_date");

            migrationBuilder.CreateIndex(
                name: "IX_professional_license_tenant_id",
                table: "professional_license",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_professional_license_user_id",
                table: "professional_license",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_professional_license_verification_status",
                table: "professional_license",
                column: "verification_status");

            migrationBuilder.CreateIndex(
                name: "IX_professional_license_verified_by_user_id",
                table: "professional_license",
                column: "verified_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_retinopathy_screenings_branch_id",
                table: "retinopathy_screenings",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "IX_retinopathy_screenings_patient_id",
                table: "retinopathy_screenings",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_retinopathy_screenings_tenant_id",
                table: "retinopathy_screenings",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_role_hierarchy_child_role_id",
                table: "role_hierarchy",
                column: "child_role_id");

            migrationBuilder.CreateIndex(
                name: "IX_role_hierarchy_parent_role_id",
                table: "role_hierarchy",
                column: "parent_role_id");

            migrationBuilder.CreateIndex(
                name: "IX_role_hierarchy_parent_role_id_child_role_id",
                table: "role_hierarchy",
                columns: new[] { "parent_role_id", "child_role_id" });

            migrationBuilder.CreateIndex(
                name: "IX_role_hierarchy_tenant_id",
                table: "role_hierarchy",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_role_hierarchy_tenant_id_child_role_id",
                table: "role_hierarchy",
                columns: new[] { "tenant_id", "child_role_id" });

            migrationBuilder.CreateIndex(
                name: "IX_role_hierarchy_tenant_id_parent_role_id",
                table: "role_hierarchy",
                columns: new[] { "tenant_id", "parent_role_id" });

            migrationBuilder.CreateIndex(
                name: "IX_role_template_role_type",
                table: "role_template",
                column: "role_type");

            migrationBuilder.CreateIndex(
                name: "IX_role_template_template_category",
                table: "role_template",
                column: "template_category");

            migrationBuilder.CreateIndex(
                name: "IX_role_template_tenant_id",
                table: "role_template",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_role_template_tenant_id_is_active",
                table: "role_template",
                columns: new[] { "tenant_id", "is_active" });

            migrationBuilder.CreateIndex(
                name: "IX_role_template_tenant_id_name",
                table: "role_template",
                columns: new[] { "tenant_id", "name" });

            migrationBuilder.CreateIndex(
                name: "IX_treatment_adherence_patient_id",
                table: "treatment_adherence",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_treatment_adherence_tenant_id",
                table: "treatment_adherence",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_role_history_action_timestamp",
                table: "user_role_history",
                column: "action_timestamp");

            migrationBuilder.CreateIndex(
                name: "IX_user_role_history_role_id",
                table: "user_role_history",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_role_history_tenant_id",
                table: "user_role_history",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_role_history_tenant_id_role_id",
                table: "user_role_history",
                columns: new[] { "tenant_id", "role_id" });

            migrationBuilder.CreateIndex(
                name: "IX_user_role_history_tenant_id_user_id",
                table: "user_role_history",
                columns: new[] { "tenant_id", "user_id" });

            migrationBuilder.CreateIndex(
                name: "IX_user_role_history_user_id",
                table: "user_role_history",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_role_history_user_id_role_id",
                table: "user_role_history",
                columns: new[] { "user_id", "role_id" });

            migrationBuilder.AddForeignKey(
                name: "FK_appointment_appointment_parent_appointment_id",
                table: "appointment",
                column: "parent_appointment_id",
                principalTable: "appointment",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_appointment_department_department_id",
                table: "appointment",
                column: "department_id",
                principalTable: "department",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_appointment_appointment_parent_appointment_id",
                table: "appointment");

            migrationBuilder.DropForeignKey(
                name: "FK_appointment_department_department_id",
                table: "appointment");

            migrationBuilder.DropTable(
                name: "AccessLevelConfigurations");

            migrationBuilder.DropTable(
                name: "appointment_conflicts");

            migrationBuilder.DropTable(
                name: "appointment_reminders");

            migrationBuilder.DropTable(
                name: "appointment_statistics");

            migrationBuilder.DropTable(
                name: "biometry_records");

            migrationBuilder.DropTable(
                name: "branch_capacity_history");

            migrationBuilder.DropTable(
                name: "bulk_operation_job");

            migrationBuilder.DropTable(
                name: "doctor_availability");

            migrationBuilder.DropTable(
                name: "electrophysiology_tests");

            migrationBuilder.DropTable(
                name: "employment_category_lookup");

            migrationBuilder.DropTable(
                name: "employment_contract");

            migrationBuilder.DropTable(
                name: "employment_type_lookup");

            migrationBuilder.DropTable(
                name: "follow_up_appointments");

            migrationBuilder.DropTable(
                name: "iol_stock_adjustments");

            migrationBuilder.DropTable(
                name: "medication_adherence");

            migrationBuilder.DropTable(
                name: "oct_imaging_scans");

            migrationBuilder.DropTable(
                name: "OnboardingChecklistItems");

            migrationBuilder.DropTable(
                name: "OnboardingWorkflows");

            migrationBuilder.DropTable(
                name: "patient_reminders");

            migrationBuilder.DropTable(
                name: "patient_transfer_request");

            migrationBuilder.DropTable(
                name: "PerformanceReviews");

            migrationBuilder.DropTable(
                name: "post_op_medications");

            migrationBuilder.DropTable(
                name: "post_op_visits");

            migrationBuilder.DropTable(
                name: "probation_tracking");

            migrationBuilder.DropTable(
                name: "professional_license");

            migrationBuilder.DropTable(
                name: "retinopathy_screenings");

            migrationBuilder.DropTable(
                name: "role_hierarchy");

            migrationBuilder.DropTable(
                name: "role_template");

            migrationBuilder.DropTable(
                name: "SavedSearches");

            migrationBuilder.DropTable(
                name: "TrainingAssignments");

            migrationBuilder.DropTable(
                name: "TrainingCourses");

            migrationBuilder.DropTable(
                name: "user_role_history");

            migrationBuilder.DropTable(
                name: "UserCredentials");

            migrationBuilder.DropTable(
                name: "iol_inventory");

            migrationBuilder.DropTable(
                name: "treatment_adherence");

            migrationBuilder.DropTable(
                name: "bed_inventory");

            migrationBuilder.DropTable(
                name: "post_op_care_schedules");

            migrationBuilder.DropTable(
                name: "employee");

            migrationBuilder.DropIndex(
                name: "IX_appointment_department_id",
                table: "appointment");

            migrationBuilder.DropIndex(
                name: "IX_appointment_parent_appointment_id",
                table: "appointment");

            migrationBuilder.DropColumn(
                name: "department_id",
                table: "appointment");

            migrationBuilder.DropColumn(
                name: "end_time",
                table: "appointment");

            migrationBuilder.DropColumn(
                name: "is_recurring",
                table: "appointment");

            migrationBuilder.DropColumn(
                name: "parent_appointment_id",
                table: "appointment");

            migrationBuilder.DropColumn(
                name: "patient_email",
                table: "appointment");

            migrationBuilder.DropColumn(
                name: "patient_phone",
                table: "appointment");

            migrationBuilder.DropColumn(
                name: "priority",
                table: "appointment");

            migrationBuilder.DropColumn(
                name: "reason_for_visit",
                table: "appointment");

            migrationBuilder.DropColumn(
                name: "recurring_pattern",
                table: "appointment");

            migrationBuilder.DropColumn(
                name: "start_time",
                table: "appointment");

            migrationBuilder.RenameColumn(
                name: "designation",
                table: "users",
                newName: "Designation");

            migrationBuilder.RenameColumn(
                name: "professional_registration_date",
                table: "users",
                newName: "ProfessionalRegistrationDate");

            migrationBuilder.RenameColumn(
                name: "npi_number",
                table: "users",
                newName: "NpiNumber");

            migrationBuilder.RenameColumn(
                name: "license_number",
                table: "users",
                newName: "LicenseNumber");

            migrationBuilder.RenameColumn(
                name: "parent_role_id",
                table: "app_roles",
                newName: "ParentRoleId");

            migrationBuilder.RenameColumn(
                name: "hierarchy_level",
                table: "app_roles",
                newName: "RoleLevel");
        }
    }
}
