using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CounsellingApi.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "counselling_audit_log",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    counselling_id = table.Column<Guid>(type: "uuid", nullable: false),
                    action = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    performed_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    performed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_counselling_audit_log", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "patient_counselling",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    previous_status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    is_locked = table.Column<bool>(type: "boolean", nullable: false),
                    locked_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    decision_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    decision_timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    scheduled_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    package_id = table.Column<Guid>(type: "uuid", nullable: true),
                    package_details = table.Column<string>(type: "jsonb", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    updated_by_user_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    record_status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_patient_counselling", x => x.id);
                    table.ForeignKey(
                        name: "FK_patient_counselling_patients_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patients",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "idx_cal_counselling_id",
                table: "counselling_audit_log",
                column: "counselling_id");

            migrationBuilder.CreateIndex(
                name: "idx_cal_performed_at",
                table: "counselling_audit_log",
                column: "performed_at",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "idx_pc_patient_id",
                table: "patient_counselling",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "idx_pc_status",
                table: "patient_counselling",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "idx_pc_tenant_id",
                table: "patient_counselling",
                column: "tenant_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "counselling_audit_log");

            migrationBuilder.DropTable(
                name: "patient_counselling");
        }
    }
}
