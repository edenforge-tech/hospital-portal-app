using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuthService.Migrations
{
    /// <inheritdoc />
    public partial class PatientEmergencyContactInsurance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_opd_bill_payments_users_created_by_user_id",
                table: "opd_bill_payments");

            migrationBuilder.DropForeignKey(
                name: "FK_opd_bill_payments_users_updated_by_user_id",
                table: "opd_bill_payments");

            migrationBuilder.DropForeignKey(
                name: "FK_opd_bills_users_consultant_id",
                table: "opd_bills");

            migrationBuilder.DropForeignKey(
                name: "FK_opd_bills_users_discount_authorized_by",
                table: "opd_bills");

            migrationBuilder.DropForeignKey(
                name: "FK_opd_bills_users_finalized_by",
                table: "opd_bills");

            migrationBuilder.DropIndex(
                name: "IX_opd_bills_consultant_id",
                table: "opd_bills");

            migrationBuilder.DropIndex(
                name: "IX_opd_bills_discount_authorized_by",
                table: "opd_bills");

            migrationBuilder.DropIndex(
                name: "IX_opd_bills_finalized_by",
                table: "opd_bills");

            migrationBuilder.DropIndex(
                name: "IX_opd_bill_payments_created_by_user_id",
                table: "opd_bill_payments");

            migrationBuilder.DropIndex(
                name: "IX_opd_bill_payments_status",
                table: "opd_bill_payments");

            migrationBuilder.DropIndex(
                name: "IX_opd_bill_payments_updated_by_user_id",
                table: "opd_bill_payments");

            migrationBuilder.DropColumn(
                name: "consultant_id",
                table: "opd_bills");

            migrationBuilder.DropColumn(
                name: "corporate_account_id",
                table: "opd_bills");

            migrationBuilder.DropColumn(
                name: "corporate_authorization_doc",
                table: "opd_bills");

            migrationBuilder.DropColumn(
                name: "discount_authorized_by",
                table: "opd_bills");

            migrationBuilder.DropColumn(
                name: "discount_reason",
                table: "opd_bills");

            migrationBuilder.DropColumn(
                name: "finalized_at",
                table: "opd_bills");

            migrationBuilder.DropColumn(
                name: "insurance_approved_amount",
                table: "opd_bills");

            migrationBuilder.DropColumn(
                name: "insurance_preauth_number",
                table: "opd_bills");

            migrationBuilder.DropColumn(
                name: "is_corporate",
                table: "opd_bills");

            migrationBuilder.DropColumn(
                name: "tax_percentage",
                table: "opd_bills");

            migrationBuilder.DropColumn(
                name: "visit_type",
                table: "opd_bills");

            migrationBuilder.DropColumn(
                name: "card_transaction_id",
                table: "opd_bill_payments");

            migrationBuilder.DropColumn(
                name: "deleted_at",
                table: "opd_bill_payments");

            migrationBuilder.DropColumn(
                name: "gateway_name",
                table: "opd_bill_payments");

            migrationBuilder.DropColumn(
                name: "insurance_settlement_amount",
                table: "opd_bill_payments");

            migrationBuilder.DropColumn(
                name: "receipt_printed",
                table: "opd_bill_payments");

            migrationBuilder.RenameColumn(
                name: "service_charges",
                table: "opd_bills",
                newName: "registration_fee");

            migrationBuilder.RenameColumn(
                name: "other_charges",
                table: "opd_bills",
                newName: "insurance_claim_amount");

            migrationBuilder.RenameColumn(
                name: "investigation_charges",
                table: "opd_bills",
                newName: "additional_charges");

            migrationBuilder.RenameColumn(
                name: "finalized_by",
                table: "opd_bills",
                newName: "billing_rule_id");

            migrationBuilder.RenameColumn(
                name: "upi_vpa",
                table: "opd_bill_payments",
                newName: "upi_id");

            migrationBuilder.RenameColumn(
                name: "receipt_sent_via",
                table: "opd_bill_payments",
                newName: "insurance_claim_id");

            migrationBuilder.RenameColumn(
                name: "notes",
                table: "opd_bill_payments",
                newName: "insurance_response");

            migrationBuilder.RenameColumn(
                name: "insurance_claim_number",
                table: "opd_bill_payments",
                newName: "cheque_number");

            migrationBuilder.RenameColumn(
                name: "gateway_transaction_id",
                table: "opd_bill_payments",
                newName: "bank_name");

            migrationBuilder.AddColumn<Guid>(
                name: "created_by_user_id",
                table: "patient",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "deceased_date",
                table: "patient",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "emergency_contact_address",
                table: "patient",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "emergency_contact_email",
                table: "patient",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "emergency_contact_name",
                table: "patient",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "emergency_contact_phone",
                table: "patient",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "emergency_contact_relationship",
                table: "patient",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "insurance_group_number",
                table: "patient",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "insurance_policy_number",
                table: "patient",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "insurance_provider",
                table: "patient",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "insurance_status",
                table: "patient",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "insurance_valid_from",
                table: "patient",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "insurance_valid_to",
                table: "patient",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "status",
                table: "patient",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "updated_by_user_id",
                table: "patient",
                type: "uuid",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "insurance_provider",
                table: "opd_bills",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "insurance_policy_number",
                table: "opd_bills",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "bill_number",
                table: "opd_bills",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(30)",
                oldMaxLength: 30);

            migrationBuilder.AddColumn<DateTime>(
                name: "bill_date",
                table: "opd_bills",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "generated_by",
                table: "opd_bills",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AlterColumn<string>(
                name: "receipt_number",
                table: "opd_bill_payments",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(30)",
                oldMaxLength: 30,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "card_type",
                table: "opd_bill_payments",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "card_network",
                table: "opd_bill_payments",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_opd_bills_generated_by",
                table: "opd_bills",
                column: "generated_by");

            migrationBuilder.AddForeignKey(
                name: "FK_opd_bills_users_generated_by",
                table: "opd_bills",
                column: "generated_by",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_opd_bills_users_generated_by",
                table: "opd_bills");

            migrationBuilder.DropIndex(
                name: "IX_opd_bills_generated_by",
                table: "opd_bills");

            migrationBuilder.DropColumn(
                name: "created_by_user_id",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "deceased_date",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "emergency_contact_address",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "emergency_contact_email",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "emergency_contact_name",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "emergency_contact_phone",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "emergency_contact_relationship",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "insurance_group_number",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "insurance_policy_number",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "insurance_provider",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "insurance_status",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "insurance_valid_from",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "insurance_valid_to",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "status",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "updated_by_user_id",
                table: "patient");

            migrationBuilder.DropColumn(
                name: "bill_date",
                table: "opd_bills");

            migrationBuilder.DropColumn(
                name: "generated_by",
                table: "opd_bills");

            migrationBuilder.DropColumn(
                name: "card_network",
                table: "opd_bill_payments");

            migrationBuilder.RenameColumn(
                name: "registration_fee",
                table: "opd_bills",
                newName: "service_charges");

            migrationBuilder.RenameColumn(
                name: "insurance_claim_amount",
                table: "opd_bills",
                newName: "other_charges");

            migrationBuilder.RenameColumn(
                name: "billing_rule_id",
                table: "opd_bills",
                newName: "finalized_by");

            migrationBuilder.RenameColumn(
                name: "additional_charges",
                table: "opd_bills",
                newName: "investigation_charges");

            migrationBuilder.RenameColumn(
                name: "upi_id",
                table: "opd_bill_payments",
                newName: "upi_vpa");

            migrationBuilder.RenameColumn(
                name: "insurance_response",
                table: "opd_bill_payments",
                newName: "notes");

            migrationBuilder.RenameColumn(
                name: "insurance_claim_id",
                table: "opd_bill_payments",
                newName: "receipt_sent_via");

            migrationBuilder.RenameColumn(
                name: "cheque_number",
                table: "opd_bill_payments",
                newName: "insurance_claim_number");

            migrationBuilder.RenameColumn(
                name: "bank_name",
                table: "opd_bill_payments",
                newName: "gateway_transaction_id");

            migrationBuilder.AlterColumn<string>(
                name: "insurance_provider",
                table: "opd_bills",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "insurance_policy_number",
                table: "opd_bills",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "bill_number",
                table: "opd_bills",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AddColumn<Guid>(
                name: "consultant_id",
                table: "opd_bills",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "corporate_account_id",
                table: "opd_bills",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "corporate_authorization_doc",
                table: "opd_bills",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "discount_authorized_by",
                table: "opd_bills",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "discount_reason",
                table: "opd_bills",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "finalized_at",
                table: "opd_bills",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "insurance_approved_amount",
                table: "opd_bills",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "insurance_preauth_number",
                table: "opd_bills",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_corporate",
                table: "opd_bills",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "tax_percentage",
                table: "opd_bills",
                type: "numeric(5,2)",
                precision: 5,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "visit_type",
                table: "opd_bills",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "receipt_number",
                table: "opd_bill_payments",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "card_type",
                table: "opd_bill_payments",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(30)",
                oldMaxLength: 30,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "card_transaction_id",
                table: "opd_bill_payments",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "deleted_at",
                table: "opd_bill_payments",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "gateway_name",
                table: "opd_bill_payments",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "insurance_settlement_amount",
                table: "opd_bill_payments",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "receipt_printed",
                table: "opd_bill_payments",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_opd_bills_consultant_id",
                table: "opd_bills",
                column: "consultant_id");

            migrationBuilder.CreateIndex(
                name: "IX_opd_bills_discount_authorized_by",
                table: "opd_bills",
                column: "discount_authorized_by");

            migrationBuilder.CreateIndex(
                name: "IX_opd_bills_finalized_by",
                table: "opd_bills",
                column: "finalized_by");

            migrationBuilder.CreateIndex(
                name: "IX_opd_bill_payments_created_by_user_id",
                table: "opd_bill_payments",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_opd_bill_payments_status",
                table: "opd_bill_payments",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_opd_bill_payments_updated_by_user_id",
                table: "opd_bill_payments",
                column: "updated_by_user_id");

            migrationBuilder.AddForeignKey(
                name: "FK_opd_bill_payments_users_created_by_user_id",
                table: "opd_bill_payments",
                column: "created_by_user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_opd_bill_payments_users_updated_by_user_id",
                table: "opd_bill_payments",
                column: "updated_by_user_id",
                principalTable: "users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_opd_bills_users_consultant_id",
                table: "opd_bills",
                column: "consultant_id",
                principalTable: "users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_opd_bills_users_discount_authorized_by",
                table: "opd_bills",
                column: "discount_authorized_by",
                principalTable: "users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_opd_bills_users_finalized_by",
                table: "opd_bills",
                column: "finalized_by",
                principalTable: "users",
                principalColumn: "id");
        }
    }
}
