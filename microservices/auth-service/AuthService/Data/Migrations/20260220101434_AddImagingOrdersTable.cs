using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuthService.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddImagingOrdersTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "diagnosis_code",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    laterality = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: true),
                    billable = table.Column<bool>(type: "boolean", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    icd_version = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_diagnosis_code", x => x.id);
                    table.ForeignKey(
                        name: "FK_diagnosis_code_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "imaging_orders",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    examination_id = table.Column<Guid>(type: "uuid", nullable: true),
                    imaging_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    laterality = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    urgency = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    clinical_indication = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ordering_doctor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ordered_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    reviewed_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    reviewed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    result_summary = table.Column<string>(type: "text", nullable: true),
                    dicom_study_id = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    image_storage_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_imaging_orders", x => x.id);
                    table.ForeignKey(
                        name: "FK_imaging_orders_clinical_examination_examination_id",
                        column: x => x.examination_id,
                        principalTable: "clinical_examination",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_imaging_orders_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ophth_medication",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    generic_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    brand_names = table.Column<string[]>(type: "text[]", nullable: true),
                    drug_class = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    indications = table.Column<string>(type: "text", nullable: false),
                    contraindications = table.Column<string>(type: "text", nullable: true),
                    warnings = table.Column<string>(type: "text", nullable: true),
                    pregnancy_category = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    route = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    common_side_effects = table.Column<string[]>(type: "text[]", nullable: true),
                    serious_side_effects = table.Column<string[]>(type: "text[]", nullable: true),
                    monitoring_requirements = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ophth_medication", x => x.id);
                    table.ForeignKey(
                        name: "FK_ophth_medication_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "patient_diagnosis",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    diagnosis_code_id = table.Column<Guid>(type: "uuid", nullable: false),
                    visit_id = table.Column<Guid>(type: "uuid", nullable: true),
                    examination_id = table.Column<Guid>(type: "uuid", nullable: true),
                    diagnosis_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    eye_specificity = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: true),
                    diagnosed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    diagnosed_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    clinical_notes = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_patient_diagnosis", x => x.id);
                    table.ForeignKey(
                        name: "FK_patient_diagnosis_diagnosis_code_diagnosis_code_id",
                        column: x => x.diagnosis_code_id,
                        principalTable: "diagnosis_code",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_patient_diagnosis_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_patient_diagnosis_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_diagnosis_code_tenant_id",
                table: "diagnosis_code",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_imaging_orders_examination_id",
                table: "imaging_orders",
                column: "examination_id");

            migrationBuilder.CreateIndex(
                name: "IX_imaging_orders_patient_id",
                table: "imaging_orders",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_ophth_medication_tenant_id",
                table: "ophth_medication",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_patient_diagnosis_diagnosis_code_id",
                table: "patient_diagnosis",
                column: "diagnosis_code_id");

            migrationBuilder.CreateIndex(
                name: "IX_patient_diagnosis_patient_id",
                table: "patient_diagnosis",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_patient_diagnosis_tenant_id",
                table: "patient_diagnosis",
                column: "tenant_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "imaging_orders");

            migrationBuilder.DropTable(
                name: "ophth_medication");

            migrationBuilder.DropTable(
                name: "patient_diagnosis");

            migrationBuilder.DropTable(
                name: "diagnosis_code");
        }
    }
}
