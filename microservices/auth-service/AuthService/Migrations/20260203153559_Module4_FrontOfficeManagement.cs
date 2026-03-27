using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuthService.Migrations
{
    /// <inheritdoc />
    public partial class Module4_FrontOfficeManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "override_authorized_by",
                table: "visits",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "override_reason",
                table: "visits",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "walkout_at",
                table: "visits",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "walkout_reason",
                table: "visits",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "aadhaar_number",
                table: "patient",
                type: "character varying(12)",
                maxLength: 12,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "address_line_1",
                table: "patient",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "address_line_2",
                table: "patient",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "alcohol_use",
                table: "patient",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "chronic_conditions",
                table: "patient",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "country",
                table: "patient",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "current_medications",
                table: "patient",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "diet_type",
                table: "patient",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "disability_status",
                table: "patient",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "district",
                table: "patient",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "driving_license",
                table: "patient",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "exercise_habits",
                table: "patient",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "family_medical_history",
                table: "patient",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "guardian_address",
                table: "patient",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "guardian_email",
                table: "patient",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "guardian_id_proof",
                table: "patient",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "guardian_name",
                table: "patient",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "guardian_phone",
                table: "patient",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "guardian_relationship",
                table: "patient",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "health_id",
                table: "patient",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "id_proof_type",
                table: "patient",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "immunization_records",
                table: "patient",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "known_allergies_details",
                table: "patient",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "landmark",
                table: "patient",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "language_preference",
                table: "patient",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "lifestyle_notes",
                table: "patient",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "marital_status",
                table: "patient",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "middle_name",
                table: "patient",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "national_id",
                table: "patient",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "nationality",
                table: "patient",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "occupation",
                table: "patient",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "passport_number",
                table: "patient",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "past_surgeries",
                table: "patient",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "photo_thumbnail_url",
                table: "patient",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "photo_uploaded_at",
                table: "patient",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "photo_url",
                table: "patient",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "pin_code",
                table: "patient",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "religion",
                table: "patient",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "smoking_status",
                table: "patient",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "special_needs",
                table: "patient",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "title",
                table: "patient",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "finalized_at",
                table: "opd_bills",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "finalized_by_user_id",
                table: "opd_bills",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_finalized",
                table: "opd_bills",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_locked",
                table: "opd_bills",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "locked_at",
                table: "opd_bills",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "locked_by_user_id",
                table: "opd_bills",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "refund_amount",
                table: "opd_bills",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "refund_reason",
                table: "opd_bills",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "refund_status",
                table: "opd_bills",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "none");

            migrationBuilder.AddColumn<string>(
                name: "unlock_reason",
                table: "opd_bills",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "unlocked_at",
                table: "opd_bills",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "unlocked_by_user_id",
                table: "opd_bills",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "queue_item",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    department_id = table.Column<Guid>(type: "uuid", nullable: true),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    appointment_id = table.Column<Guid>(type: "uuid", nullable: true),
                    visit_id = table.Column<Guid>(type: "uuid", nullable: true),
                    token_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    queue_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    priority = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    checked_in_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    called_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    doctor_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    room_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_queue_item", x => x.id);
                    table.ForeignKey(
                        name: "FK_queue_item_appointment_appointment_id",
                        column: x => x.appointment_id,
                        principalTable: "appointment",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_queue_item_branch_branch_id",
                        column: x => x.branch_id,
                        principalTable: "branch",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_queue_item_department_department_id",
                        column: x => x.department_id,
                        principalTable: "department",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_queue_item_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_queue_item_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_queue_item_visits_visit_id",
                        column: x => x.visit_id,
                        principalTable: "visits",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "refunds",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    bill_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    visit_id = table.Column<Guid>(type: "uuid", nullable: true),
                    refund_amount = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    refund_reason = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    refund_mode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    requested_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    requested_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    authorized_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    authorized_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "pending"),
                    notes = table.Column<string>(type: "text", nullable: true),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_refunds", x => x.id);
                    table.ForeignKey(
                        name: "FK_refunds_opd_bills_bill_id",
                        column: x => x.bill_id,
                        principalTable: "opd_bills",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_refunds_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_refunds_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_refunds_users_authorized_by_user_id",
                        column: x => x.authorized_by_user_id,
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_refunds_users_requested_by_user_id",
                        column: x => x.requested_by_user_id,
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_refunds_visits_visit_id",
                        column: x => x.visit_id,
                        principalTable: "visits",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "service_catalog",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    service_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    service_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    base_price = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    tax_percentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false, defaultValue: 0m),
                    is_taxable = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    department_id = table.Column<Guid>(type: "uuid", nullable: true),
                    specialty = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    requires_approval = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
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
                name: "surgery_request",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    surgeon_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    patient_mobile = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    procedure_type = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    request_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    urgency = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    preferred_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    preferred_time = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    special_instructions = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    surgeon_response = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    scheduled_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    request_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_surgery_request", x => x.id);
                    table.ForeignKey(
                        name: "FK_surgery_request_branch_branch_id",
                        column: x => x.branch_id,
                        principalTable: "branch",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_surgery_request_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "visitor_log",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    visitor_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    mobile_number = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: true),
                    patient_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    patient_room_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    purpose = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    pass_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    check_in_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    check_out_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_visitor_log", x => x.id);
                    table.ForeignKey(
                        name: "FK_visitor_log_branch_branch_id",
                        column: x => x.branch_id,
                        principalTable: "branch",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_visitor_log_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_visitor_log_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "opd_bill_items",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    opd_bill_id = table.Column<Guid>(type: "uuid", nullable: false),
                    service_catalog_id = table.Column<Guid>(type: "uuid", nullable: false),
                    service_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    service_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ServiceCategory = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    quantity = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    unit_price = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    subtotal = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    discount_amount = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false, defaultValue: 0m),
                    discount_percentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false, defaultValue: 0m),
                    DiscountReason = table.Column<string>(type: "text", nullable: true),
                    tax_amount = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false, defaultValue: 0m),
                    tax_percentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false, defaultValue: 0m),
                    total_amount = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    performed_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    performed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    department_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "active"),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_opd_bill_items", x => x.id);
                    table.ForeignKey(
                        name: "FK_opd_bill_items_department_department_id",
                        column: x => x.department_id,
                        principalTable: "department",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_opd_bill_items_opd_bills_opd_bill_id",
                        column: x => x.opd_bill_id,
                        principalTable: "opd_bills",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_opd_bill_items_service_catalog_service_catalog_id",
                        column: x => x.service_catalog_id,
                        principalTable: "service_catalog",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_visits_override_authorized_by",
                table: "visits",
                column: "override_authorized_by");

            migrationBuilder.CreateIndex(
                name: "IX_opd_bills_finalized_by_user_id",
                table: "opd_bills",
                column: "finalized_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_opd_bills_is_locked",
                table: "opd_bills",
                column: "is_locked");

            migrationBuilder.CreateIndex(
                name: "IX_opd_bills_locked_by_user_id",
                table: "opd_bills",
                column: "locked_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_opd_bills_unlocked_by_user_id",
                table: "opd_bills",
                column: "unlocked_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_opd_bill_items_department_id",
                table: "opd_bill_items",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "IX_opd_bill_items_opd_bill_id",
                table: "opd_bill_items",
                column: "opd_bill_id");

            migrationBuilder.CreateIndex(
                name: "IX_opd_bill_items_service_catalog_id",
                table: "opd_bill_items",
                column: "service_catalog_id");

            migrationBuilder.CreateIndex(
                name: "IX_opd_bill_items_status",
                table: "opd_bill_items",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_opd_bill_items_tenant_id",
                table: "opd_bill_items",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_queue_item_appointment_id",
                table: "queue_item",
                column: "appointment_id");

            migrationBuilder.CreateIndex(
                name: "IX_queue_item_branch_id",
                table: "queue_item",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "IX_queue_item_department_id",
                table: "queue_item",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "IX_queue_item_patient_id",
                table: "queue_item",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_queue_item_tenant_id",
                table: "queue_item",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_queue_item_visit_id",
                table: "queue_item",
                column: "visit_id");

            migrationBuilder.CreateIndex(
                name: "IX_refunds_authorized_by_user_id",
                table: "refunds",
                column: "authorized_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_refunds_bill_id",
                table: "refunds",
                column: "bill_id");

            migrationBuilder.CreateIndex(
                name: "IX_refunds_patient_id",
                table: "refunds",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_refunds_requested_by_user_id",
                table: "refunds",
                column: "requested_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_refunds_tenant_id",
                table: "refunds",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_refunds_visit_id",
                table: "refunds",
                column: "visit_id");

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

            migrationBuilder.CreateIndex(
                name: "IX_surgery_request_branch_id",
                table: "surgery_request",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "IX_surgery_request_tenant_id",
                table: "surgery_request",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_visitor_log_branch_id",
                table: "visitor_log",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "IX_visitor_log_patient_id",
                table: "visitor_log",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_visitor_log_tenant_id",
                table: "visitor_log",
                column: "tenant_id");

            migrationBuilder.AddForeignKey(
                name: "FK_opd_bills_users_finalized_by_user_id",
                table: "opd_bills",
                column: "finalized_by_user_id",
                principalTable: "users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_opd_bills_users_locked_by_user_id",
                table: "opd_bills",
                column: "locked_by_user_id",
                principalTable: "users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_opd_bills_users_unlocked_by_user_id",
                table: "opd_bills",
                column: "unlocked_by_user_id",
                principalTable: "users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_visits_users_override_authorized_by",
                table: "visits",
                column: "override_authorized_by",
                principalTable: "users",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_opd_bills_users_finalized_by_user_id",
                table: "opd_bills");

            migrationBuilder.DropForeignKey(
                name: "FK_opd_bills_users_locked_by_user_id",
                table: "opd_bills");

            migrationBuilder.DropForeignKey(
                name: "FK_opd_bills_users_unlocked_by_user_id",
                table: "opd_bills");

            migrationBuilder.DropForeignKey(
                name: "FK_visits_users_override_authorized_by",
                table: "visits");

            migrationBuilder.DropTable(
                name: "opd_bill_items");

            migrationBuilder.DropTable(
                name: "queue_item");

            migrationBuilder.DropTable(
                name: "refunds");

            migrationBuilder.DropTable(
                name: "surgery_request");

            migrationBuilder.DropTable(
                name: "visitor_log");

            migrationBuilder.DropTable(
                name: "service_catalog");

            migrationBuilder.DropIndex(
                name: "IX_visits_override_authorized_by",
                table: "visits");

            migrationBuilder.DropIndex(
                name: "IX_opd_bills_finalized_by_user_id",
                table: "opd_bills");

            migrationBuilder.DropIndex(
                name: "IX_opd_bills_is_locked",
                table: "opd_bills");

            migrationBuilder.DropIndex(
                name: "IX_opd_bills_locked_by_user_id",
                table: "opd_bills");

            migrationBuilder.DropIndex(
                name: "IX_opd_bills_unlocked_by_user_id",
                table: "opd_bills");

            migrationBuilder.DropColumn(
                name: "override_authorized_by",
                table: "visits");

            migrationBuilder.DropColumn(
                name: "override_reason",
                table: "visits");

            migrationBuilder.DropColumn(
                name: "walkout_at",
                table: "visits");

            migrationBuilder.DropColumn(
                name: "walkout_reason",
                table: "visits");

            migrationBuilder.DropColumn(
                name: "aadhaar_number",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "address_line_1",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "address_line_2",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "alcohol_use",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "chronic_conditions",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "country",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "current_medications",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "diet_type",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "disability_status",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "district",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "driving_license",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "exercise_habits",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "family_medical_history",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "guardian_address",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "guardian_email",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "guardian_id_proof",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "guardian_name",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "guardian_phone",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "guardian_relationship",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "health_id",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "id_proof_type",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "immunization_records",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "known_allergies_details",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "landmark",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "language_preference",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "lifestyle_notes",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "marital_status",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "middle_name",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "national_id",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "nationality",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "occupation",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "passport_number",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "past_surgeries",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "photo_thumbnail_url",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "photo_uploaded_at",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "photo_url",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "pin_code",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "religion",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "smoking_status",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "special_needs",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "title",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "finalized_at",
                table: "opd_bills");

            migrationBuilder.DropColumn(
                name: "finalized_by_user_id",
                table: "opd_bills");

            migrationBuilder.DropColumn(
                name: "is_finalized",
                table: "opd_bills");

            migrationBuilder.DropColumn(
                name: "is_locked",
                table: "opd_bills");

            migrationBuilder.DropColumn(
                name: "locked_at",
                table: "opd_bills");

            migrationBuilder.DropColumn(
                name: "locked_by_user_id",
                table: "opd_bills");

            migrationBuilder.DropColumn(
                name: "refund_amount",
                table: "opd_bills");

            migrationBuilder.DropColumn(
                name: "refund_reason",
                table: "opd_bills");

            migrationBuilder.DropColumn(
                name: "refund_status",
                table: "opd_bills");

            migrationBuilder.DropColumn(
                name: "unlock_reason",
                table: "opd_bills");

            migrationBuilder.DropColumn(
                name: "unlocked_at",
                table: "opd_bills");

            migrationBuilder.DropColumn(
                name: "unlocked_by_user_id",
                table: "opd_bills");
        }
    }
}
