using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuthService.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddExaminationDraftsAndClinicalExaminationFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "examination_type",
                table: "clinical_examination",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_signed",
                table: "clinical_examination",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "signed_at",
                table: "clinical_examination",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "signed_by_user_id",
                table: "clinical_examination",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "examination_drafts",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    doctor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    data = table.Column<string>(type: "jsonb", nullable: false),
                    completion_percentage = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_examination_drafts", x => x.id);
                    table.ForeignKey(
                        name: "FK_examination_drafts_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_examination_drafts_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_examination_drafts_users_doctor_id",
                        column: x => x.doctor_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "lab_reports",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    visit_id = table.Column<Guid>(type: "uuid", nullable: true),
                    test_name = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    test_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    test_category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ordered_by_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ordered_by_id = table.Column<Guid>(type: "uuid", nullable: true),
                    ordered_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    sample_collected_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    result_value = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    result_unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    reference_range = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    interpretation = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    lab_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    technician_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    verified_by_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    specimen_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    priority = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    report_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_lab_reports", x => x.id);
                    table.ForeignKey(
                        name: "FK_lab_reports_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "optical_orders",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    visit_id = table.Column<Guid>(type: "uuid", nullable: true),
                    order_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    order_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    od_sphere = table.Column<decimal>(type: "numeric", nullable: true),
                    od_cylinder = table.Column<decimal>(type: "numeric", nullable: true),
                    od_axis = table.Column<int>(type: "integer", nullable: true),
                    od_add = table.Column<decimal>(type: "numeric", nullable: true),
                    od_prism = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    od_va = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    os_sphere = table.Column<decimal>(type: "numeric", nullable: true),
                    os_cylinder = table.Column<decimal>(type: "numeric", nullable: true),
                    os_axis = table.Column<int>(type: "integer", nullable: true),
                    os_add = table.Column<decimal>(type: "numeric", nullable: true),
                    os_prism = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    os_va = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    pd = table.Column<decimal>(type: "numeric", nullable: true),
                    pd_right = table.Column<decimal>(type: "numeric", nullable: true),
                    pd_left = table.Column<decimal>(type: "numeric", nullable: true),
                    seg_height = table.Column<decimal>(type: "numeric", nullable: true),
                    frame_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    frame_brand = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    frame_model = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    frame_color = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    lens_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    lens_material = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    lens_coating = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    tint = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    order_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    estimated_delivery = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    delivered_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    amount = table.Column<decimal>(type: "numeric", nullable: true),
                    paid_amount = table.Column<decimal>(type: "numeric", nullable: true),
                    prescribed_by_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    prescribed_by_id = table.Column<Guid>(type: "uuid", nullable: true),
                    notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_optical_orders", x => x.id);
                    table.ForeignKey(
                        name: "FK_optical_orders_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "patient_allergies",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    allergen_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    allergen_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    severity = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    reaction = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    onset_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    verified = table.Column<bool>(type: "boolean", nullable: false),
                    verified_by = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_patient_allergies", x => x.id);
                    table.ForeignKey(
                        name: "FK_patient_allergies_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "patient_communications",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    communication_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    direction = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    subject = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    message = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    recipient = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    sender = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    sent_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    delivered_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    read_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    sent_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    priority = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_patient_communications", x => x.id);
                    table.ForeignKey(
                        name: "FK_patient_communications_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "patient_consents",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    consent_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    consent_name = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    is_granted = table.Column<bool>(type: "boolean", nullable: false),
                    granted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    revoked_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    witness_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    document_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    signature_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ip_address = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_patient_consents", x => x.id);
                    table.ForeignKey(
                        name: "FK_patient_consents_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "patient_insurance",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    provider_name = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    policy_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    group_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    policy_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    plan_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    subscriber_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    subscriber_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    subscriber_relation = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    copay_amount = table.Column<decimal>(type: "numeric", nullable: true),
                    deductible_amount = table.Column<decimal>(type: "numeric", nullable: true),
                    deductible_met = table.Column<decimal>(type: "numeric", nullable: true),
                    out_of_pocket_max = table.Column<decimal>(type: "numeric", nullable: true),
                    out_of_pocket_met = table.Column<decimal>(type: "numeric", nullable: true),
                    coverage_details = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    pre_auth_required = table.Column<bool>(type: "boolean", nullable: false),
                    pre_auth_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    contact_phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_patient_insurance", x => x.id);
                    table.ForeignKey(
                        name: "FK_patient_insurance_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "patient_notes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    visit_id = table.Column<Guid>(type: "uuid", nullable: true),
                    note_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    title = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    content = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: false),
                    is_flagged = table.Column<bool>(type: "boolean", nullable: false),
                    flag_reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    priority = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    author_id = table.Column<Guid>(type: "uuid", nullable: true),
                    author_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    is_confidential = table.Column<bool>(type: "boolean", nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_patient_notes", x => x.id);
                    table.ForeignKey(
                        name: "FK_patient_notes_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_examination_drafts_doctor_id",
                table: "examination_drafts",
                column: "doctor_id");

            migrationBuilder.CreateIndex(
                name: "IX_examination_drafts_patient_id",
                table: "examination_drafts",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_examination_drafts_tenant_id",
                table: "examination_drafts",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_lab_reports_patient_id",
                table: "lab_reports",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_lab_reports_status",
                table: "lab_reports",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_lab_reports_tenant_id_patient_id",
                table: "lab_reports",
                columns: new[] { "tenant_id", "patient_id" });

            migrationBuilder.CreateIndex(
                name: "IX_optical_orders_patient_id",
                table: "optical_orders",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_optical_orders_status",
                table: "optical_orders",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_optical_orders_tenant_id_patient_id",
                table: "optical_orders",
                columns: new[] { "tenant_id", "patient_id" });

            migrationBuilder.CreateIndex(
                name: "IX_patient_allergies_patient_id",
                table: "patient_allergies",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_patient_allergies_tenant_id_patient_id",
                table: "patient_allergies",
                columns: new[] { "tenant_id", "patient_id" });

            migrationBuilder.CreateIndex(
                name: "IX_patient_communications_patient_id",
                table: "patient_communications",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_patient_communications_sent_at",
                table: "patient_communications",
                column: "sent_at");

            migrationBuilder.CreateIndex(
                name: "IX_patient_communications_tenant_id_patient_id",
                table: "patient_communications",
                columns: new[] { "tenant_id", "patient_id" });

            migrationBuilder.CreateIndex(
                name: "IX_patient_consents_patient_id",
                table: "patient_consents",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_patient_consents_tenant_id_patient_id",
                table: "patient_consents",
                columns: new[] { "tenant_id", "patient_id" });

            migrationBuilder.CreateIndex(
                name: "IX_patient_insurance_patient_id",
                table: "patient_insurance",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_patient_insurance_policy_number",
                table: "patient_insurance",
                column: "policy_number");

            migrationBuilder.CreateIndex(
                name: "IX_patient_insurance_tenant_id_patient_id",
                table: "patient_insurance",
                columns: new[] { "tenant_id", "patient_id" });

            migrationBuilder.CreateIndex(
                name: "IX_patient_notes_note_type",
                table: "patient_notes",
                column: "note_type");

            migrationBuilder.CreateIndex(
                name: "IX_patient_notes_patient_id",
                table: "patient_notes",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_patient_notes_tenant_id_patient_id",
                table: "patient_notes",
                columns: new[] { "tenant_id", "patient_id" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "examination_drafts");

            migrationBuilder.DropTable(
                name: "lab_reports");

            migrationBuilder.DropTable(
                name: "optical_orders");

            migrationBuilder.DropTable(
                name: "patient_allergies");

            migrationBuilder.DropTable(
                name: "patient_communications");

            migrationBuilder.DropTable(
                name: "patient_consents");

            migrationBuilder.DropTable(
                name: "patient_insurance");

            migrationBuilder.DropTable(
                name: "patient_notes");

            migrationBuilder.DropColumn(
                name: "examination_type",
                table: "clinical_examination");

            migrationBuilder.DropColumn(
                name: "is_signed",
                table: "clinical_examination");

            migrationBuilder.DropColumn(
                name: "signed_at",
                table: "clinical_examination");

            migrationBuilder.DropColumn(
                name: "signed_by_user_id",
                table: "clinical_examination");
        }
    }
}
