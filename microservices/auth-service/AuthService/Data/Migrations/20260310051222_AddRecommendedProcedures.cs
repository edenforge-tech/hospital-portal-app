using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuthService.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddRecommendedProcedures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "guardian_relation",
                table: "counseling_consents",
                newName: "guardian_relationship");

            migrationBuilder.AddColumn<string>(
                name: "anesthesia_type",
                table: "surgery_types",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "default_price",
                table: "surgery_types",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "pre_op_tests_required",
                table: "surgery_types",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "procedure_code",
                table: "surgery_types",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "requires_iol",
                table: "surgery_types",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "typical_iol_types",
                table: "surgery_types",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "unit_of_measure",
                table: "surgery_types",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "branch_id",
                table: "patient",
                type: "uuid",
                nullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "patient_agreed_to_surgery",
                table: "counseling_sessions",
                type: "boolean",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "boolean");

            migrationBuilder.AddColumn<string>(
                name: "current_stage",
                table: "counseling_sessions",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "package_addons_json",
                table: "counseling_sessions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "package_amount",
                table: "counseling_sessions",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "recommended_procedures",
                table: "counseling_sessions",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "selected_package_id",
                table: "counseling_sessions",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "branch_pricing_overrides",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    item_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    item_id = table.Column<Guid>(type: "uuid", nullable: false),
                    override_price = table.Column<decimal>(type: "numeric(15,2)", nullable: true),
                    discount_percentage = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    pricing_strategy = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "Fixed"),
                    effective_from = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    effective_to = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    reason = table.Column<string>(type: "text", nullable: true),
                    approved_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    approved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("PK_branch_pricing_overrides", x => x.id);
                    table.ForeignKey(
                        name: "FK_branch_pricing_overrides_branch_branch_id",
                        column: x => x.branch_id,
                        principalTable: "branch",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_branch_pricing_overrides_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_branch_pricing_overrides_users_approved_by_user_id",
                        column: x => x.approved_by_user_id,
                        principalTable: "users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "consultation_charges",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    charge_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    doctor_id = table.Column<Guid>(type: "uuid", nullable: true),
                    department_id = table.Column<Guid>(type: "uuid", nullable: true),
                    specialty = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    consultation_fee = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    follow_up_fee = table.Column<decimal>(type: "numeric(15,2)", nullable: true),
                    emergency_consultation_fee = table.Column<decimal>(type: "numeric(15,2)", nullable: true),
                    home_visit_fee = table.Column<decimal>(type: "numeric(15,2)", nullable: true),
                    validity_days = table.Column<int>(type: "integer", nullable: false, defaultValue: 30),
                    free_follow_ups_count = table.Column<int>(type: "integer", nullable: true),
                    accepts_cash = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    accepts_card = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    accepts_insurance = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    effective_from = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    effective_to = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("PK_consultation_charges", x => x.id);
                    table.ForeignKey(
                        name: "FK_consultation_charges_branch_branch_id",
                        column: x => x.branch_id,
                        principalTable: "branch",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_consultation_charges_department_department_id",
                        column: x => x.department_id,
                        principalTable: "department",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_consultation_charges_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_consultation_charges_users_doctor_id",
                        column: x => x.doctor_id,
                        principalTable: "users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "counseling_session_audit_log",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    change_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    old_value = table.Column<string>(type: "text", nullable: true),
                    new_value = table.Column<string>(type: "text", nullable: true),
                    reason = table.Column<string>(type: "text", nullable: true),
                    changed_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    changed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_counseling_session_audit_log", x => x.id);
                    table.ForeignKey(
                        name: "FK_counseling_session_audit_log_counseling_sessions_session_id",
                        column: x => x.session_id,
                        principalTable: "counseling_sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "filter_preset",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    filters = table.Column<string>(type: "jsonb", nullable: false),
                    entity_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    is_default = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_filter_preset", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "iol_catalog_master",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    model_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    brand_manufacturer = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    iol_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    origin = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    lens_category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    material = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    power_range_min = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    power_range_max = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    power_increment = table.Column<decimal>(type: "numeric(4,2)", nullable: false),
                    distance_range = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    a_constant = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    default_price = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    currency_code = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "INR"),
                    unit_of_measure = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "Per Lens"),
                    description = table.Column<string>(type: "text", nullable: true),
                    product_code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    manufacturer_part_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    regulatory_approval = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    shelf_life_months = table.Column<int>(type: "integer", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    display_order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    is_featured = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "active")
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
                name: "session_recordings",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    document_id = table.Column<Guid>(type: "uuid", nullable: true),
                    recording_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Audio"),
                    file_url = table.Column<string>(type: "text", nullable: false),
                    file_name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    file_size_bytes = table.Column<long>(type: "bigint", nullable: true),
                    duration_seconds = table.Column<int>(type: "integer", nullable: true),
                    mime_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    transcription_status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "Pending"),
                    transcription_started_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    transcription_completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    transcription_error = table.Column<string>(type: "text", nullable: true),
                    translation_status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "Pending"),
                    translation_started_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    translation_completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    translation_error = table.Column<string>(type: "text", nullable: true),
                    azure_job_id = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    processing_duration_ms = table.Column<int>(type: "integer", nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "active"),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_session_recordings", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "session_transcripts",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    recording_id = table.Column<Guid>(type: "uuid", nullable: false),
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    language_code = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    language_name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    is_original_language = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    transcript_text = table.Column<string>(type: "text", nullable: false),
                    vtt_file_url = table.Column<string>(type: "text", nullable: true),
                    srt_file_url = table.Column<string>(type: "text", nullable: true),
                    confidence_score = table.Column<decimal>(type: "numeric(5,4)", precision: 5, scale: 4, nullable: true),
                    word_count = table.Column<int>(type: "integer", nullable: true),
                    character_count = table.Column<int>(type: "integer", nullable: true),
                    segments = table.Column<string>(type: "jsonb", nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "active"),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_session_transcripts", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "transcript_edits",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    transcript_id = table.Column<Guid>(type: "uuid", nullable: false),
                    segment_index = table.Column<int>(type: "integer", nullable: false),
                    original_text = table.Column<string>(type: "text", nullable: false),
                    edited_text = table.Column<string>(type: "text", nullable: false),
                    edit_reason = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_transcript_edits", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_branch_pricing_overrides_approved_by_user_id",
                table: "branch_pricing_overrides",
                column: "approved_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_branch_pricing_overrides_branch_id",
                table: "branch_pricing_overrides",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "IX_branch_pricing_overrides_branch_id_item_type_item_id_effect~",
                table: "branch_pricing_overrides",
                columns: new[] { "branch_id", "item_type", "item_id", "effective_from" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_branch_pricing_overrides_is_active_effective_from_effective~",
                table: "branch_pricing_overrides",
                columns: new[] { "is_active", "effective_from", "effective_to" });

            migrationBuilder.CreateIndex(
                name: "IX_branch_pricing_overrides_item_type_item_id",
                table: "branch_pricing_overrides",
                columns: new[] { "item_type", "item_id" });

            migrationBuilder.CreateIndex(
                name: "IX_branch_pricing_overrides_tenant_id",
                table: "branch_pricing_overrides",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_consultation_charges_branch_id",
                table: "consultation_charges",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "IX_consultation_charges_charge_type",
                table: "consultation_charges",
                column: "charge_type");

            migrationBuilder.CreateIndex(
                name: "IX_consultation_charges_department_id",
                table: "consultation_charges",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "IX_consultation_charges_department_id_branch_id",
                table: "consultation_charges",
                columns: new[] { "department_id", "branch_id" },
                unique: true,
                filter: "department_id IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_consultation_charges_doctor_id",
                table: "consultation_charges",
                column: "doctor_id");

            migrationBuilder.CreateIndex(
                name: "IX_consultation_charges_doctor_id_branch_id",
                table: "consultation_charges",
                columns: new[] { "doctor_id", "branch_id" },
                unique: true,
                filter: "doctor_id IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_consultation_charges_specialty",
                table: "consultation_charges",
                column: "specialty");

            migrationBuilder.CreateIndex(
                name: "IX_consultation_charges_tenant_id",
                table: "consultation_charges",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_counseling_session_audit_log_session_id",
                table: "counseling_session_audit_log",
                column: "session_id");

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
                name: "IX_session_recordings_created_at",
                table: "session_recordings",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_session_recordings_session_id",
                table: "session_recordings",
                column: "session_id");

            migrationBuilder.CreateIndex(
                name: "IX_session_recordings_tenant_id",
                table: "session_recordings",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_session_recordings_transcription_status",
                table: "session_recordings",
                column: "transcription_status");

            migrationBuilder.CreateIndex(
                name: "IX_session_transcripts_language_code",
                table: "session_transcripts",
                column: "language_code");

            migrationBuilder.CreateIndex(
                name: "IX_session_transcripts_recording_id",
                table: "session_transcripts",
                column: "recording_id");

            migrationBuilder.CreateIndex(
                name: "IX_session_transcripts_recording_id_language_code",
                table: "session_transcripts",
                columns: new[] { "recording_id", "language_code" },
                unique: true,
                filter: "deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_session_transcripts_session_id",
                table: "session_transcripts",
                column: "session_id");

            migrationBuilder.CreateIndex(
                name: "IX_session_transcripts_tenant_id",
                table: "session_transcripts",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_transcript_edits_created_at",
                table: "transcript_edits",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_transcript_edits_created_by_user_id",
                table: "transcript_edits",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_transcript_edits_tenant_id",
                table: "transcript_edits",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_transcript_edits_transcript_id",
                table: "transcript_edits",
                column: "transcript_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "branch_pricing_overrides");

            migrationBuilder.DropTable(
                name: "consultation_charges");

            migrationBuilder.DropTable(
                name: "counseling_session_audit_log");

            migrationBuilder.DropTable(
                name: "filter_preset");

            migrationBuilder.DropTable(
                name: "iol_catalog_master");

            migrationBuilder.DropTable(
                name: "session_recordings");

            migrationBuilder.DropTable(
                name: "session_transcripts");

            migrationBuilder.DropTable(
                name: "transcript_edits");

            migrationBuilder.DropColumn(
                name: "anesthesia_type",
                table: "surgery_types");

            migrationBuilder.DropColumn(
                name: "default_price",
                table: "surgery_types");

            migrationBuilder.DropColumn(
                name: "pre_op_tests_required",
                table: "surgery_types");

            migrationBuilder.DropColumn(
                name: "procedure_code",
                table: "surgery_types");

            migrationBuilder.DropColumn(
                name: "requires_iol",
                table: "surgery_types");

            migrationBuilder.DropColumn(
                name: "typical_iol_types",
                table: "surgery_types");

            migrationBuilder.DropColumn(
                name: "unit_of_measure",
                table: "surgery_types");

            migrationBuilder.DropColumn(
                name: "branch_id",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "current_stage",
                table: "counseling_sessions");

            migrationBuilder.DropColumn(
                name: "package_addons_json",
                table: "counseling_sessions");

            migrationBuilder.DropColumn(
                name: "package_amount",
                table: "counseling_sessions");

            migrationBuilder.DropColumn(
                name: "recommended_procedures",
                table: "counseling_sessions");

            migrationBuilder.DropColumn(
                name: "selected_package_id",
                table: "counseling_sessions");

            migrationBuilder.RenameColumn(
                name: "guardian_relationship",
                table: "counseling_consents",
                newName: "guardian_relation");

            migrationBuilder.AlterColumn<bool>(
                name: "patient_agreed_to_surgery",
                table: "counseling_sessions",
                type: "boolean",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldNullable: true);
        }
    }
}
