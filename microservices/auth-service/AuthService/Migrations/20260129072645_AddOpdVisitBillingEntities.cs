using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuthService.Migrations
{
    /// <inheritdoc />
    public partial class AddOpdVisitBillingEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "billing_rules",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: true),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    visit_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    free_days = table.Column<int>(type: "integer", nullable: false),
                    free_visits = table.Column<int>(type: "integer", nullable: false),
                    condition = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    default_fee = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    priority = table.Column<int>(type: "integer", nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_billing_rules", x => x.id);
                    table.ForeignKey(
                        name: "FK_billing_rules_branch_branch_id",
                        column: x => x.branch_id,
                        principalTable: "branch",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_billing_rules_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_billing_rules_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_billing_rules_users_updated_by_user_id",
                        column: x => x.updated_by_user_id,
                        principalTable: "users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "drug_interaction",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    drug1_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    drug2_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    interaction_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    severity = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    clinical_effects = table.Column<string>(type: "text", nullable: true),
                    mechanism = table.Column<string>(type: "text", nullable: true),
                    management = table.Column<string>(type: "text", nullable: true),
                    reference_sources = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_drug_interaction", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "medication_master",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    generic_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    brand_names = table.Column<string[]>(type: "text[]", nullable: true),
                    category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    form = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    standard_dosages = table.Column<string[]>(type: "text[]", nullable: true),
                    route = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    contraindications = table.Column<string>(type: "text", nullable: true),
                    side_effects = table.Column<string>(type: "text", nullable: true),
                    pregnancy_category = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    requires_prescription = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    is_controlled_substance = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_medication_master", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "opd_bills",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    bill_number = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    appointment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    visit_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    consultant_id = table.Column<Guid>(type: "uuid", nullable: true),
                    consultation_fee = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    service_charges = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    investigation_charges = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    other_charges = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    gross_amount = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    discount_amount = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    discount_percentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    discount_reason = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    discount_authorized_by = table.Column<Guid>(type: "uuid", nullable: true),
                    tax_amount = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    tax_percentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    net_amount = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    amount_paid = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    balance_due = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    is_free_visit = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    free_visit_reason = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    is_credit = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    credit_approved_by = table.Column<Guid>(type: "uuid", nullable: true),
                    credit_approved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    credit_notes = table.Column<string>(type: "text", nullable: true),
                    is_insurance = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    insurance_provider = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    insurance_policy_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    insurance_preauth_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    insurance_approved_amount = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: true),
                    is_corporate = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    corporate_account_id = table.Column<Guid>(type: "uuid", nullable: true),
                    corporate_authorization_doc = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    bill_items = table.Column<string>(type: "jsonb", nullable: true),
                    finalized_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    finalized_by = table.Column<Guid>(type: "uuid", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_opd_bills", x => x.id);
                    table.ForeignKey(
                        name: "FK_opd_bills_appointment_appointment_id",
                        column: x => x.appointment_id,
                        principalTable: "appointment",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_opd_bills_branch_branch_id",
                        column: x => x.branch_id,
                        principalTable: "branch",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_opd_bills_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_opd_bills_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_opd_bills_users_consultant_id",
                        column: x => x.consultant_id,
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_opd_bills_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_opd_bills_users_credit_approved_by",
                        column: x => x.credit_approved_by,
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_opd_bills_users_discount_authorized_by",
                        column: x => x.discount_authorized_by,
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_opd_bills_users_finalized_by",
                        column: x => x.finalized_by,
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_opd_bills_users_updated_by_user_id",
                        column: x => x.updated_by_user_id,
                        principalTable: "users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "prescription",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    doctor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    prescription_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    diagnosis = table.Column<string>(type: "text", nullable: false),
                    instructions = table.Column<string>(type: "text", nullable: true),
                    duration_days = table.Column<int>(type: "integer", nullable: true),
                    follow_up_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "active"),
                    pharmacy_id = table.Column<Guid>(type: "uuid", nullable: true),
                    pharmacy_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    pharmacy_contact = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    dispensed_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    dispensed_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    is_printed = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    printed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_prescription", x => x.id);
                    table.ForeignKey(
                        name: "FK_prescription_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_prescription_users_dispensed_by_user_id",
                        column: x => x.dispensed_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_prescription_users_doctor_id",
                        column: x => x.doctor_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "token_sequences",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sequence_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    current_sequence = table.Column<int>(type: "integer", nullable: false),
                    branch_prefix = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_token_sequences", x => x.id);
                    table.ForeignKey(
                        name: "FK_token_sequences_branch_branch_id",
                        column: x => x.branch_id,
                        principalTable: "branch",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_token_sequences_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "opd_bill_payments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    opd_bill_id = table.Column<Guid>(type: "uuid", nullable: false),
                    payment_reference = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    payment_mode = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    amount = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    card_last_four = table.Column<string>(type: "character varying(4)", maxLength: 4, nullable: true),
                    card_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    card_transaction_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    upi_transaction_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    upi_vpa = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    insurance_claim_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    insurance_settlement_amount = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: true),
                    gateway_transaction_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    gateway_name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    payment_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    received_by = table.Column<Guid>(type: "uuid", nullable: true),
                    receipt_number = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    receipt_printed = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    receipt_sent_via = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_opd_bill_payments", x => x.id);
                    table.ForeignKey(
                        name: "FK_opd_bill_payments_opd_bills_opd_bill_id",
                        column: x => x.opd_bill_id,
                        principalTable: "opd_bills",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_opd_bill_payments_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_opd_bill_payments_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_opd_bill_payments_users_received_by",
                        column: x => x.received_by,
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_opd_bill_payments_users_updated_by_user_id",
                        column: x => x.updated_by_user_id,
                        principalTable: "users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "visits",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    appointment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    opd_bill_id = table.Column<Guid>(type: "uuid", nullable: true),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    consultant_id = table.Column<Guid>(type: "uuid", nullable: true),
                    department_id = table.Column<Guid>(type: "uuid", nullable: true),
                    visit_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    visit_category = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    token_number = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    token_sequence = table.Column<int>(type: "integer", nullable: false),
                    checked_in_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    checked_in_by = table.Column<Guid>(type: "uuid", nullable: true),
                    current_station = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    assigned_to = table.Column<Guid>(type: "uuid", nullable: true),
                    assigned_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    completed_by = table.Column<Guid>(type: "uuid", nullable: true),
                    outcome = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    outcome_notes = table.Column<string>(type: "text", nullable: true),
                    is_emergency = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    emergency_authorized_by = table.Column<Guid>(type: "uuid", nullable: true),
                    emergency_reason = table.Column<string>(type: "text", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_visits", x => x.id);
                    table.ForeignKey(
                        name: "FK_visits_appointment_appointment_id",
                        column: x => x.appointment_id,
                        principalTable: "appointment",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_visits_branch_branch_id",
                        column: x => x.branch_id,
                        principalTable: "branch",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_visits_department_department_id",
                        column: x => x.department_id,
                        principalTable: "department",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_visits_opd_bills_opd_bill_id",
                        column: x => x.opd_bill_id,
                        principalTable: "opd_bills",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_visits_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_visits_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_visits_users_assigned_to",
                        column: x => x.assigned_to,
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_visits_users_checked_in_by",
                        column: x => x.checked_in_by,
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_visits_users_completed_by",
                        column: x => x.completed_by,
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_visits_users_consultant_id",
                        column: x => x.consultant_id,
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_visits_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_visits_users_emergency_authorized_by",
                        column: x => x.emergency_authorized_by,
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_visits_users_updated_by_user_id",
                        column: x => x.updated_by_user_id,
                        principalTable: "users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "prescription_medication",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    prescription_id = table.Column<Guid>(type: "uuid", nullable: false),
                    medication_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    generic_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    dosage = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    form = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    route = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    frequency = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    duration_days = table.Column<int>(type: "integer", nullable: false),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    instructions = table.Column<string>(type: "text", nullable: true),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    refills_allowed = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    refills_remaining = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    is_critical = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_prescription_medication", x => x.id);
                    table.ForeignKey(
                        name: "FK_prescription_medication_prescription_prescription_id",
                        column: x => x.prescription_id,
                        principalTable: "prescription",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_billing_rules_branch_id",
                table: "billing_rules",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "IX_billing_rules_created_by_user_id",
                table: "billing_rules",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_billing_rules_is_active",
                table: "billing_rules",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "IX_billing_rules_tenant_id",
                table: "billing_rules",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_billing_rules_updated_by_user_id",
                table: "billing_rules",
                column: "updated_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_billing_rules_visit_type",
                table: "billing_rules",
                column: "visit_type");

            migrationBuilder.CreateIndex(
                name: "IX_drug_interaction_drug1_name",
                table: "drug_interaction",
                column: "drug1_name");

            migrationBuilder.CreateIndex(
                name: "IX_drug_interaction_drug2_name",
                table: "drug_interaction",
                column: "drug2_name");

            migrationBuilder.CreateIndex(
                name: "IX_drug_interaction_interaction_type",
                table: "drug_interaction",
                column: "interaction_type");

            migrationBuilder.CreateIndex(
                name: "IX_drug_interaction_severity",
                table: "drug_interaction",
                column: "severity");

            migrationBuilder.CreateIndex(
                name: "IX_medication_master_category",
                table: "medication_master",
                column: "category");

            migrationBuilder.CreateIndex(
                name: "IX_medication_master_generic_name",
                table: "medication_master",
                column: "generic_name");

            migrationBuilder.CreateIndex(
                name: "IX_medication_master_is_active",
                table: "medication_master",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "IX_medication_master_name",
                table: "medication_master",
                column: "name");

            migrationBuilder.CreateIndex(
                name: "IX_opd_bill_payments_created_by_user_id",
                table: "opd_bill_payments",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_opd_bill_payments_opd_bill_id",
                table: "opd_bill_payments",
                column: "opd_bill_id");

            migrationBuilder.CreateIndex(
                name: "IX_opd_bill_payments_payment_reference",
                table: "opd_bill_payments",
                column: "payment_reference",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_opd_bill_payments_received_by",
                table: "opd_bill_payments",
                column: "received_by");

            migrationBuilder.CreateIndex(
                name: "IX_opd_bill_payments_status",
                table: "opd_bill_payments",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_opd_bill_payments_tenant_id",
                table: "opd_bill_payments",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_opd_bill_payments_updated_by_user_id",
                table: "opd_bill_payments",
                column: "updated_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_opd_bills_appointment_id",
                table: "opd_bills",
                column: "appointment_id");

            migrationBuilder.CreateIndex(
                name: "IX_opd_bills_bill_number",
                table: "opd_bills",
                column: "bill_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_opd_bills_branch_id",
                table: "opd_bills",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "IX_opd_bills_consultant_id",
                table: "opd_bills",
                column: "consultant_id");

            migrationBuilder.CreateIndex(
                name: "IX_opd_bills_created_by_user_id",
                table: "opd_bills",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_opd_bills_credit_approved_by",
                table: "opd_bills",
                column: "credit_approved_by");

            migrationBuilder.CreateIndex(
                name: "IX_opd_bills_discount_authorized_by",
                table: "opd_bills",
                column: "discount_authorized_by");

            migrationBuilder.CreateIndex(
                name: "IX_opd_bills_finalized_by",
                table: "opd_bills",
                column: "finalized_by");

            migrationBuilder.CreateIndex(
                name: "IX_opd_bills_patient_id",
                table: "opd_bills",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_opd_bills_status",
                table: "opd_bills",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_opd_bills_tenant_id",
                table: "opd_bills",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_opd_bills_updated_by_user_id",
                table: "opd_bills",
                column: "updated_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_prescription_deleted_at",
                table: "prescription",
                column: "deleted_at");

            migrationBuilder.CreateIndex(
                name: "IX_prescription_dispensed_by_user_id",
                table: "prescription",
                column: "dispensed_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_prescription_doctor_id",
                table: "prescription",
                column: "doctor_id");

            migrationBuilder.CreateIndex(
                name: "IX_prescription_patient_id",
                table: "prescription",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_prescription_prescription_date",
                table: "prescription",
                column: "prescription_date");

            migrationBuilder.CreateIndex(
                name: "IX_prescription_status",
                table: "prescription",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_prescription_tenant_id",
                table: "prescription",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_prescription_medication_medication_name",
                table: "prescription_medication",
                column: "medication_name");

            migrationBuilder.CreateIndex(
                name: "IX_prescription_medication_prescription_id",
                table: "prescription_medication",
                column: "prescription_id");

            migrationBuilder.CreateIndex(
                name: "IX_prescription_medication_start_date_end_date",
                table: "prescription_medication",
                columns: new[] { "start_date", "end_date" });

            migrationBuilder.CreateIndex(
                name: "IX_prescription_medication_tenant_id",
                table: "prescription_medication",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_token_sequences_branch_id_sequence_date",
                table: "token_sequences",
                columns: new[] { "branch_id", "sequence_date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_token_sequences_tenant_id",
                table: "token_sequences",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_visits_appointment_id",
                table: "visits",
                column: "appointment_id");

            migrationBuilder.CreateIndex(
                name: "IX_visits_assigned_to",
                table: "visits",
                column: "assigned_to");

            migrationBuilder.CreateIndex(
                name: "IX_visits_branch_id",
                table: "visits",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "IX_visits_branch_id_token_sequence_created_at",
                table: "visits",
                columns: new[] { "branch_id", "token_sequence", "created_at" });

            migrationBuilder.CreateIndex(
                name: "IX_visits_checked_in_by",
                table: "visits",
                column: "checked_in_by");

            migrationBuilder.CreateIndex(
                name: "IX_visits_completed_by",
                table: "visits",
                column: "completed_by");

            migrationBuilder.CreateIndex(
                name: "IX_visits_consultant_id",
                table: "visits",
                column: "consultant_id");

            migrationBuilder.CreateIndex(
                name: "IX_visits_created_by_user_id",
                table: "visits",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_visits_department_id",
                table: "visits",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "IX_visits_emergency_authorized_by",
                table: "visits",
                column: "emergency_authorized_by");

            migrationBuilder.CreateIndex(
                name: "IX_visits_opd_bill_id",
                table: "visits",
                column: "opd_bill_id");

            migrationBuilder.CreateIndex(
                name: "IX_visits_patient_id",
                table: "visits",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_visits_status",
                table: "visits",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_visits_tenant_id",
                table: "visits",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_visits_token_number",
                table: "visits",
                column: "token_number");

            migrationBuilder.CreateIndex(
                name: "IX_visits_updated_by_user_id",
                table: "visits",
                column: "updated_by_user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "billing_rules");

            migrationBuilder.DropTable(
                name: "drug_interaction");

            migrationBuilder.DropTable(
                name: "medication_master");

            migrationBuilder.DropTable(
                name: "opd_bill_payments");

            migrationBuilder.DropTable(
                name: "prescription_medication");

            migrationBuilder.DropTable(
                name: "token_sequences");

            migrationBuilder.DropTable(
                name: "visits");

            migrationBuilder.DropTable(
                name: "prescription");

            migrationBuilder.DropTable(
                name: "opd_bills");
        }
    }
}
