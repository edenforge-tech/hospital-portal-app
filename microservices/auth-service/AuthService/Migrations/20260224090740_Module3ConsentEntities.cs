using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuthService.Migrations
{
    /// <inheritdoc />
    public partial class Module3ConsentEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AIProgressionAnalyses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    PatientId = table.Column<Guid>(type: "uuid", nullable: false),
                    BaselineImageId = table.Column<Guid>(type: "uuid", nullable: false),
                    FollowupImageId = table.Column<Guid>(type: "uuid", nullable: false),
                    AnalyzedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ProgressionDetected = table.Column<bool>(type: "boolean", nullable: false),
                    ConfidenceScore = table.Column<double>(type: "double precision", nullable: false),
                    ClinicalSignificance = table.Column<string>(type: "text", nullable: false),
                    DetectedRegions = table.Column<string>(type: "text", nullable: true),
                    ProgressionMetrics = table.Column<string>(type: "text", nullable: true),
                    ModelVersion = table.Column<string>(type: "text", nullable: false),
                    ProcessingTimeMs = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AIProgressionAnalyses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "anesthesia_types",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    anesthesia_name = table.Column<string>(type: "text", nullable: false),
                    anesthesia_code = table.Column<string>(type: "text", nullable: false),
                    anesthesia_category = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    typical_duration_minutes = table.Column<int>(type: "integer", nullable: true),
                    recovery_time_minutes = table.Column<int>(type: "integer", nullable: true),
                    additional_cost = table.Column<decimal>(type: "numeric", nullable: true),
                    contraindications = table.Column<string>(type: "text", nullable: true),
                    special_requirements = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    display_order = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_anesthesia_types", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "bed_reservations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    admission_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    bed_id = table.Column<Guid>(type: "uuid", nullable: false),
                    ward_id = table.Column<Guid>(type: "uuid", nullable: true),
                    room_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    reservation_start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    reservation_end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    reservation_status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    auto_release_after_hours = table.Column<int>(type: "integer", nullable: false),
                    auto_released_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    cancellation_reason = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_bed_reservations", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "consent_form_templates",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    template_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    consent_category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    template_html = table.Column<string>(type: "text", nullable: false),
                    requires_patient_signature = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    requires_witness_signature = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    requires_guardian_signature = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    compliance_standards = table.Column<string[]>(type: "text[]", nullable: true),
                    version = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    effective_from = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    effective_to = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_consent_form_templates", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "counseling_consents",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    template_id = table.Column<Guid>(type: "uuid", nullable: false),
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    package_id = table.Column<Guid>(type: "uuid", nullable: true),
                    rendered_html = table.Column<string>(type: "text", nullable: false),
                    patient_signature_base64 = table.Column<string>(type: "text", nullable: true),
                    patient_signed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    witness_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    witness_signature_base64 = table.Column<string>(type: "text", nullable: true),
                    witness_signed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    guardian_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    guardian_relation = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    guardian_signature_base64 = table.Column<string>(type: "text", nullable: true),
                    guardian_signed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    pdf_url = table.Column<string>(type: "text", nullable: true),
                    pdf_generated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    consent_status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Draft"),
                    revoked_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    revocation_reason = table.Column<string>(type: "text", nullable: true),
                    revoked_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_counseling_consents", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "counseling_sessions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: true),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    visit_id = table.Column<Guid>(type: "uuid", nullable: true),
                    referred_by_doctor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    counselor_id = table.Column<Guid>(type: "uuid", nullable: true),
                    session_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    session_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    session_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    session_start_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    session_end_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    duration_minutes = table.Column<int>(type: "integer", nullable: true),
                    patient_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    clinical_summary = table.Column<string>(type: "jsonb", nullable: true),
                    recommended_surgery = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    recommended_iol = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    iol_power = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    urgency = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    package_discussed = table.Column<bool>(type: "boolean", nullable: false),
                    patient_agreed_to_surgery = table.Column<bool>(type: "boolean", nullable: false),
                    pending_decision = table.Column<bool>(type: "boolean", nullable: false),
                    decision_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    reasons_for_delay = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_counseling_sessions", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "counseling_workflow_state",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    current_state = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    stages_completed = table.Column<string[]>(type: "text[]", nullable: true),
                    stages_pending = table.Column<string[]>(type: "text[]", nullable: true),
                    stages_blocked = table.Column<string[]>(type: "text[]", nullable: true),
                    dependencies_check = table.Column<string>(type: "jsonb", nullable: true),
                    blocking_reasons = table.Column<string>(type: "jsonb", nullable: true),
                    progress_percentage = table.Column<int>(type: "integer", nullable: false),
                    milestones_achieved = table.Column<int>(type: "integer", nullable: false),
                    total_milestones = table.Column<int>(type: "integer", nullable: false),
                    assessment_completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    package_built_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    documents_collected_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    tests_ordered_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    tests_completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    fitness_obtained_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ot_booked_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    payment_initiated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    payment_completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    insurance_processed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    consents_signed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    admission_scheduled_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ready_for_surgery_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    session_completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    has_blocking_issues = table.Column<bool>(type: "boolean", nullable: false),
                    blocking_issue_count = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_counseling_workflow_state", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "government_scheme_claims",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    package_id = table.Column<Guid>(type: "uuid", nullable: true),
                    claim_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    scheme_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    beneficiary_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    beneficiary_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    surgery_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    procedure_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    total_bill_amount = table.Column<decimal>(type: "numeric", nullable: false),
                    scheme_covered_amount = table.Column<decimal>(type: "numeric", nullable: true),
                    patient_copay_amount = table.Column<decimal>(type: "numeric", nullable: false),
                    submitted_to_authority_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    submitted_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    submission_reference_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    claim_status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    authority_approval_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    authority_approval_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    approved_amount = table.Column<decimal>(type: "numeric", nullable: true),
                    rejection_reason = table.Column<string>(type: "text", nullable: true),
                    payment_received_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    payment_reference_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    payment_mode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    required_documents = table.Column<string[]>(type: "text[]", nullable: true),
                    submitted_documents_urls = table.Column<string[]>(type: "text[]", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_government_scheme_claims", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "government_schemes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    scheme_name = table.Column<string>(type: "text", nullable: false),
                    scheme_code = table.Column<string>(type: "text", nullable: false),
                    scheme_type = table.Column<string>(type: "text", nullable: false),
                    implementing_authority = table.Column<string>(type: "text", nullable: true),
                    scheme_description = table.Column<string>(type: "text", nullable: true),
                    eligibility_criteria = table.Column<string>(type: "text", nullable: true),
                    coverage_details = table.Column<string>(type: "text", nullable: true),
                    max_coverage_amount = table.Column<decimal>(type: "numeric", nullable: true),
                    requires_beneficiary_id = table.Column<bool>(type: "boolean", nullable: false),
                    beneficiary_id_type = table.Column<string>(type: "text", nullable: true),
                    claim_submission_url = table.Column<string>(type: "text", nullable: true),
                    helpline_number = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    effective_from = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    effective_until = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    display_order = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_government_schemes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "imaging_images",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    imaging_order_id = table.Column<Guid>(type: "uuid", nullable: false),
                    image_url = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    thumbnail_url = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    file_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    file_size = table.Column<long>(type: "bigint", nullable: false),
                    content_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    width = table.Column<int>(type: "integer", nullable: true),
                    height = table.Column<int>(type: "integer", nullable: true),
                    modality = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    dicom_metadata = table.Column<string>(type: "jsonb", nullable: true),
                    uploaded_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    uploaded_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_imaging_images", x => x.id);
                    table.ForeignKey(
                        name: "FK_imaging_images_imaging_orders_imaging_order_id",
                        column: x => x.imaging_order_id,
                        principalTable: "imaging_orders",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "insurance_providers",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    provider_name = table.Column<string>(type: "text", nullable: false),
                    provider_code = table.Column<string>(type: "text", nullable: false),
                    provider_type = table.Column<string>(type: "text", nullable: false),
                    contact_number = table.Column<string>(type: "text", nullable: true),
                    contact_email = table.Column<string>(type: "text", nullable: true),
                    website_url = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    display_order = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_insurance_providers", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "ot_theaters",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    theater_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    theater_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    floor_number = table.Column<int>(type: "integer", nullable: true),
                    location_description = table.Column<string>(type: "text", nullable: true),
                    specialization = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    surgery_types_supported = table.Column<string[]>(type: "text[]", nullable: true),
                    equipment_list = table.Column<string>(type: "jsonb", nullable: true),
                    max_surgeries_per_day = table.Column<int>(type: "integer", nullable: false),
                    standard_surgery_duration_minutes = table.Column<int>(type: "integer", nullable: false),
                    cleaning_time_between_surgeries_minutes = table.Column<int>(type: "integer", nullable: false),
                    operation_start_time = table.Column<TimeSpan>(type: "interval", nullable: false),
                    operation_end_time = table.Column<TimeSpan>(type: "interval", nullable: false),
                    operating_days = table.Column<string[]>(type: "text[]", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    is_operational = table.Column<bool>(type: "boolean", nullable: false),
                    maintenance_mode = table.Column<bool>(type: "boolean", nullable: false),
                    maintenance_reason = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ot_theaters", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "patient_admissions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    ot_schedule_id = table.Column<Guid>(type: "uuid", nullable: true),
                    admission_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    admission_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    admission_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    admission_time = table.Column<TimeSpan>(type: "interval", nullable: true),
                    surgery_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    surgery_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    eye_operated = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    bed_id = table.Column<Guid>(type: "uuid", nullable: true),
                    bed_assigned_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    bed_released_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    scheduled_discharge_time = table.Column<TimeSpan>(type: "interval", nullable: true),
                    admission_status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    actual_discharge_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    actual_discharge_time = table.Column<TimeSpan>(type: "interval", nullable: true),
                    discharge_summary_url = table.Column<string>(type: "text", nullable: true),
                    discharge_instructions = table.Column<string>(type: "text", nullable: true),
                    discharged_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    attendant_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    attendant_phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    attendant_relation = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    admitting_doctor_id = table.Column<Guid>(type: "uuid", nullable: true),
                    primary_nurse_id = table.Column<Guid>(type: "uuid", nullable: true),
                    admission_deposit_paid = table.Column<decimal>(type: "numeric", nullable: false),
                    final_bill_amount = table.Column<decimal>(type: "numeric", nullable: true),
                    final_settlement_status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    cancelled_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    cancelled_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    cancellation_reason = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_patient_admissions", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "patient_type_configurations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    display_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    configuration_json = table.Column<string>(type: "jsonb", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_patient_type_configurations", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "payment_links",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    transaction_id = table.Column<Guid>(type: "uuid", nullable: false),
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    payment_link_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    short_url = table.Column<string>(type: "text", nullable: true),
                    full_url = table.Column<string>(type: "text", nullable: true),
                    qr_code_url = table.Column<string>(type: "text", nullable: true),
                    link_amount = table.Column<decimal>(type: "numeric", nullable: false),
                    currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    sent_via = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    recipient_phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    recipient_email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    sent_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    link_status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    paid_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    payment_transaction_id = table.Column<Guid>(type: "uuid", nullable: true),
                    reminder_sent_count = table.Column<int>(type: "integer", nullable: false),
                    last_reminder_sent_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_payment_links", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "payment_transactions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    package_id = table.Column<Guid>(type: "uuid", nullable: true),
                    transaction_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    transaction_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    total_bill_amount = table.Column<decimal>(type: "numeric", nullable: false),
                    discount_amount = table.Column<decimal>(type: "numeric", nullable: false),
                    net_payable_amount = table.Column<decimal>(type: "numeric", nullable: false),
                    amount_paid = table.Column<decimal>(type: "numeric", nullable: false),
                    balance_due = table.Column<decimal>(type: "numeric", nullable: true),
                    payment_method = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    payment_breakdown = table.Column<string>(type: "jsonb", nullable: true),
                    razorpay_order_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    razorpay_payment_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    razorpay_signature = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    gateway_response = table.Column<string>(type: "jsonb", nullable: true),
                    card_last_four = table.Column<string>(type: "character varying(4)", maxLength: 4, nullable: true),
                    card_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    card_approval_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    upi_transaction_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    upi_vpa = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    cheque_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    cheque_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    cheque_bank_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    cheque_clearance_status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    cheque_cleared_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    bank_reference_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    bank_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    transfer_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    government_scheme_claim_id = table.Column<Guid>(type: "uuid", nullable: true),
                    insurance_pre_auth_id = table.Column<Guid>(type: "uuid", nullable: true),
                    payment_status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    receipt_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    receipt_generated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    receipt_url = table.Column<string>(type: "text", nullable: true),
                    refund_amount = table.Column<decimal>(type: "numeric", nullable: false),
                    refund_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    refund_reason = table.Column<string>(type: "text", nullable: true),
                    refund_reference_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    reconciled = table.Column<bool>(type: "boolean", nullable: false),
                    reconciled_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    reconciled_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_payment_transactions", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "preop_test_protocols",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    protocol_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    protocol_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    surgery_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    required_tests = table.Column<string>(type: "jsonb", nullable: false),
                    test_validity_days = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    version = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_preop_test_protocols", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "surgery_package_items_catalog",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    item_name = table.Column<string>(type: "text", nullable: false),
                    item_code = table.Column<string>(type: "text", nullable: true),
                    item_category = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    default_price = table.Column<decimal>(type: "numeric", nullable: false),
                    cost_price = table.Column<decimal>(type: "numeric", nullable: true),
                    currency = table.Column<string>(type: "text", nullable: false),
                    specifications = table.Column<string>(type: "jsonb", nullable: true),
                    unit_of_measure = table.Column<string>(type: "text", nullable: false),
                    is_optional = table.Column<bool>(type: "boolean", nullable: false),
                    requires_prescription = table.Column<bool>(type: "boolean", nullable: false),
                    requires_authorization = table.Column<bool>(type: "boolean", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_surgery_package_items_catalog", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "surgery_package_templates",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    package_name = table.Column<string>(type: "text", nullable: false),
                    package_code = table.Column<string>(type: "text", nullable: true),
                    package_category = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    base_price = table.Column<decimal>(type: "numeric", nullable: false),
                    currency = table.Column<string>(type: "text", nullable: false),
                    max_discount_percent = table.Column<decimal>(type: "numeric", nullable: false),
                    requires_approval_for_custom = table.Column<bool>(type: "boolean", nullable: false),
                    applicable_surgery_types = table.Column<string[]>(type: "text[]", nullable: true),
                    included_services = table.Column<string[]>(type: "text[]", nullable: true),
                    validity_days = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_surgery_package_templates", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "surgery_types",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    surgery_name = table.Column<string>(type: "text", nullable: false),
                    surgery_code = table.Column<string>(type: "text", nullable: false),
                    surgery_category = table.Column<string>(type: "text", nullable: false),
                    procedure_type = table.Column<string>(type: "text", nullable: true),
                    typical_duration_minutes = table.Column<int>(type: "integer", nullable: true),
                    requires_admission = table.Column<bool>(type: "boolean", nullable: false),
                    typical_admission_type = table.Column<string>(type: "text", nullable: true),
                    estimated_cost_min = table.Column<decimal>(type: "numeric", nullable: true),
                    estimated_cost_max = table.Column<decimal>(type: "numeric", nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    risks = table.Column<string>(type: "text", nullable: true),
                    prerequisites = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    display_order = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_surgery_types", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tpa_providers",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    tpa_name = table.Column<string>(type: "text", nullable: false),
                    tpa_code = table.Column<string>(type: "text", nullable: false),
                    contact_number = table.Column<string>(type: "text", nullable: true),
                    contact_email = table.Column<string>(type: "text", nullable: true),
                    website_url = table.Column<string>(type: "text", nullable: true),
                    helpline_number = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    display_order = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tpa_providers", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "workflow_stage_transitions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    workflow_id = table.Column<Guid>(type: "uuid", nullable: false),
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    from_state = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    to_state = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    triggered_by = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    trigger_details = table.Column<string>(type: "text", nullable: true),
                    transition_notes = table.Column<string>(type: "text", nullable: true),
                    transitioned_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    transitioned_by_user_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_workflow_stage_transitions", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "counseling_session_documents",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    document_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    document_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    document_description = table.Column<string>(type: "text", nullable: true),
                    file_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    file_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    file_size_bytes = table.Column<long>(type: "bigint", nullable: true),
                    is_verified = table.Column<bool>(type: "boolean", nullable: false),
                    verified_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    verified_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    verification_notes = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_counseling_session_documents", x => x.id);
                    table.ForeignKey(
                        name: "FK_counseling_session_documents_counseling_sessions_session_id",
                        column: x => x.session_id,
                        principalTable: "counseling_sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "counseling_session_notes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    note_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    note_text = table.Column<string>(type: "text", nullable: false),
                    is_confidential = table.Column<bool>(type: "boolean", nullable: false),
                    tags = table.Column<string[]>(type: "text[]", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_counseling_session_notes", x => x.id);
                    table.ForeignKey(
                        name: "FK_counseling_session_notes_counseling_sessions_session_id",
                        column: x => x.session_id,
                        principalTable: "counseling_sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "counselor_queue",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    token_number = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    queue_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    queue_position = table.Column<int>(type: "integer", nullable: false),
                    priority_score = table.Column<decimal>(type: "numeric", nullable: false),
                    urgency_level = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    added_to_queue_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    estimated_wait_minutes = table.Column<int>(type: "integer", nullable: true),
                    called_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    started_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    actual_wait_minutes = table.Column<int>(type: "integer", nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_counselor_queue", x => x.id);
                    table.ForeignKey(
                        name: "FK_counselor_queue_counseling_sessions_session_id",
                        column: x => x.session_id,
                        principalTable: "counseling_sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "patient_type_document_checklist",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    document_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    document_description = table.Column<string>(type: "text", nullable: true),
                    is_mandatory = table.Column<bool>(type: "boolean", nullable: false),
                    is_uploaded = table.Column<bool>(type: "boolean", nullable: false),
                    uploaded_file_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    uploaded_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    uploaded_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    is_verified = table.Column<bool>(type: "boolean", nullable: false),
                    verified_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    verified_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    verification_notes = table.Column<string>(type: "text", nullable: true),
                    rejection_reason = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_patient_type_document_checklist", x => x.id);
                    table.ForeignKey(
                        name: "FK_patient_type_document_checklist_counseling_sessions_session~",
                        column: x => x.session_id,
                        principalTable: "counseling_sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "imaging_annotations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    imaging_image_id = table.Column<Guid>(type: "uuid", nullable: false),
                    annotation_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    tool_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    coordinates = table.Column<string>(type: "jsonb", nullable: false),
                    measurement_value = table.Column<decimal>(type: "numeric(12,3)", nullable: true),
                    measurement_unit = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    text_content = table.Column<string>(type: "text", nullable: true),
                    color = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    line_width = table.Column<int>(type: "integer", nullable: false),
                    font_size = table.Column<int>(type: "integer", nullable: false),
                    annotation_metadata = table.Column<string>(type: "jsonb", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_imaging_annotations", x => x.id);
                    table.ForeignKey(
                        name: "FK_imaging_annotations_imaging_images_imaging_image_id",
                        column: x => x.imaging_image_id,
                        principalTable: "imaging_images",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "imaging_comparisons",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    baseline_image_id = table.Column<Guid>(type: "uuid", nullable: false),
                    followup_image_id = table.Column<Guid>(type: "uuid", nullable: false),
                    comparison_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    time_interval_days = table.Column<int>(type: "integer", nullable: true),
                    findings = table.Column<string>(type: "text", nullable: true),
                    change_percentage = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    clinical_significance = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    quantitative_metrics = table.Column<string>(type: "jsonb", nullable: true),
                    reviewed_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    reviewed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_imaging_comparisons", x => x.id);
                    table.ForeignKey(
                        name: "FK_imaging_comparisons_imaging_images_baseline_image_id",
                        column: x => x.baseline_image_id,
                        principalTable: "imaging_images",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_imaging_comparisons_imaging_images_followup_image_id",
                        column: x => x.followup_image_id,
                        principalTable: "imaging_images",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_imaging_comparisons_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ot_equipment_availability",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    theater_id = table.Column<Guid>(type: "uuid", nullable: false),
                    equipment_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    equipment_model = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    equipment_serial_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    is_functional = table.Column<bool>(type: "boolean", nullable: false),
                    current_status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    last_serviced_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    next_service_due = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    maintenance_schedule = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    service_provider = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    total_usage_hours = table.Column<decimal>(type: "numeric", nullable: false),
                    last_used_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ot_equipment_availability", x => x.id);
                    table.ForeignKey(
                        name: "FK_ot_equipment_availability_ot_theaters_theater_id",
                        column: x => x.theater_id,
                        principalTable: "ot_theaters",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ot_schedules",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    theater_id = table.Column<Guid>(type: "uuid", nullable: false),
                    session_id = table.Column<Guid>(type: "uuid", nullable: true),
                    booking_id = table.Column<Guid>(type: "uuid", nullable: true),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: true),
                    schedule_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    scheduled_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    start_time = table.Column<TimeSpan>(type: "interval", nullable: false),
                    end_time = table.Column<TimeSpan>(type: "interval", nullable: false),
                    duration_minutes = table.Column<int>(type: "integer", nullable: false),
                    surgery_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    procedure_description = table.Column<string>(type: "text", nullable: true),
                    eye_operated = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    surgeon_id = table.Column<Guid>(type: "uuid", nullable: false),
                    anesthesiologist_id = table.Column<Guid>(type: "uuid", nullable: true),
                    ot_technician_id = table.Column<Guid>(type: "uuid", nullable: true),
                    nursing_staff_ids = table.Column<Guid[]>(type: "uuid[]", nullable: true),
                    equipment_reserved = table.Column<string>(type: "jsonb", nullable: true),
                    iol_reserved_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    booking_confirmed_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    confirmation_timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    cancelled_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    cancelled_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    cancellation_reason = table.Column<string>(type: "text", nullable: true),
                    surgery_started_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    surgery_completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    actual_duration_minutes = table.Column<int>(type: "integer", nullable: true),
                    complications = table.Column<string>(type: "text", nullable: true),
                    outcome = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ot_schedules", x => x.id);
                    table.ForeignKey(
                        name: "FK_ot_schedules_counseling_sessions_session_id",
                        column: x => x.session_id,
                        principalTable: "counseling_sessions",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_ot_schedules_ot_theaters_theater_id",
                        column: x => x.theater_id,
                        principalTable: "ot_theaters",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "preop_test_orders",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: true),
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    protocol_id = table.Column<Guid>(type: "uuid", nullable: false),
                    lab_order_id = table.Column<Guid>(type: "uuid", nullable: true),
                    order_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ordered_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    ordered_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    results_received = table.Column<bool>(type: "boolean", nullable: false),
                    results_received_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    results_within_normal = table.Column<bool>(type: "boolean", nullable: true),
                    cleared_for_surgery = table.Column<bool>(type: "boolean", nullable: false),
                    special_instructions = table.Column<string>(type: "text", nullable: true),
                    counselor_notes = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_preop_test_orders", x => x.id);
                    table.ForeignKey(
                        name: "FK_preop_test_orders_counseling_sessions_session_id",
                        column: x => x.session_id,
                        principalTable: "counseling_sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_preop_test_orders_preop_test_protocols_protocol_id",
                        column: x => x.protocol_id,
                        principalTable: "preop_test_protocols",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "counselor_packages",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: true),
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    source_type = table.Column<string>(type: "text", nullable: false),
                    template_id = table.Column<Guid>(type: "uuid", nullable: true),
                    package_name = table.Column<string>(type: "text", nullable: false),
                    package_description = table.Column<string>(type: "text", nullable: true),
                    base_price = table.Column<decimal>(type: "numeric", nullable: false),
                    discount_percent = table.Column<decimal>(type: "numeric", nullable: false),
                    discount_amount = table.Column<decimal>(type: "numeric", nullable: false),
                    discount_reason = table.Column<string>(type: "text", nullable: true),
                    tax_percent = table.Column<decimal>(type: "numeric", nullable: false),
                    tax_amount = table.Column<decimal>(type: "numeric", nullable: false),
                    final_price = table.Column<decimal>(type: "numeric", nullable: false),
                    discount_approval_status = table.Column<string>(type: "text", nullable: false),
                    approved_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    approved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    rejection_reason = table.Column<string>(type: "text", nullable: true),
                    valid_from = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    valid_until = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_counselor_packages", x => x.id);
                    table.ForeignKey(
                        name: "FK_counselor_packages_surgery_package_templates_template_id",
                        column: x => x.template_id,
                        principalTable: "surgery_package_templates",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "ot_booking_validations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    schedule_id = table.Column<Guid>(type: "uuid", nullable: false),
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    validation_timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    validated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    checks_passed = table.Column<string>(type: "jsonb", nullable: false),
                    blocking_issues = table.Column<string[]>(type: "text[]", nullable: true),
                    warning_issues = table.Column<string[]>(type: "text[]", nullable: true),
                    can_proceed = table.Column<bool>(type: "boolean", nullable: false),
                    requires_attention = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ot_booking_validations", x => x.id);
                    table.ForeignKey(
                        name: "FK_ot_booking_validations_counseling_sessions_session_id",
                        column: x => x.session_id,
                        principalTable: "counseling_sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ot_booking_validations_ot_schedules_schedule_id",
                        column: x => x.schedule_id,
                        principalTable: "ot_schedules",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ot_collision_logs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    theater_id = table.Column<Guid>(type: "uuid", nullable: false),
                    collision_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    collision_time = table.Column<TimeSpan>(type: "interval", nullable: false),
                    existing_schedule_id = table.Column<Guid>(type: "uuid", nullable: true),
                    attempted_schedule_data = table.Column<string>(type: "jsonb", nullable: true),
                    collision_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    detected_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    detected_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    resolved = table.Column<bool>(type: "boolean", nullable: false),
                    resolved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    resolution_action = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    resolution_notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ot_collision_logs", x => x.id);
                    table.ForeignKey(
                        name: "FK_ot_collision_logs_ot_schedules_existing_schedule_id",
                        column: x => x.existing_schedule_id,
                        principalTable: "ot_schedules",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_ot_collision_logs_ot_theaters_theater_id",
                        column: x => x.theater_id,
                        principalTable: "ot_theaters",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "preop_fitness_clearances",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: true),
                    order_id = table.Column<Guid>(type: "uuid", nullable: false),
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    clearance_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    abnormal_tests = table.Column<string>(type: "text", nullable: true),
                    reason_for_clearance = table.Column<string>(type: "text", nullable: false),
                    referred_to_specialty = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    referred_to_doctor_id = table.Column<Guid>(type: "uuid", nullable: true),
                    referral_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    clearance_obtained = table.Column<bool>(type: "boolean", nullable: false),
                    cleared_by_doctor_id = table.Column<Guid>(type: "uuid", nullable: true),
                    cleared_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    clearance_notes = table.Column<string>(type: "text", nullable: true),
                    clearance_valid_until = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    surgery_clearance_conditions = table.Column<string>(type: "text", nullable: true),
                    anesthesia_precautions = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    priority = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_preop_fitness_clearances", x => x.id);
                    table.ForeignKey(
                        name: "FK_preop_fitness_clearances_counseling_sessions_session_id",
                        column: x => x.session_id,
                        principalTable: "counseling_sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_preop_fitness_clearances_preop_test_orders_order_id",
                        column: x => x.order_id,
                        principalTable: "preop_test_orders",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "preop_test_results",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    order_id = table.Column<Guid>(type: "uuid", nullable: false),
                    lab_test_result_id = table.Column<Guid>(type: "uuid", nullable: true),
                    test_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    test_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    result_value = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    result_unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    normal_range = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    is_abnormal = table.Column<bool>(type: "boolean", nullable: false),
                    severity = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    requires_clearance = table.Column<bool>(type: "boolean", nullable: false),
                    interpretation = table.Column<string>(type: "text", nullable: true),
                    clinical_significance = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_preop_test_results", x => x.id);
                    table.ForeignKey(
                        name: "FK_preop_test_results_preop_test_orders_order_id",
                        column: x => x.order_id,
                        principalTable: "preop_test_orders",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "counselor_package_items",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    package_id = table.Column<Guid>(type: "uuid", nullable: false),
                    catalog_item_id = table.Column<Guid>(type: "uuid", nullable: true),
                    item_name = table.Column<string>(type: "text", nullable: false),
                    item_category = table.Column<string>(type: "text", nullable: true),
                    item_description = table.Column<string>(type: "text", nullable: true),
                    unit_price = table.Column<decimal>(type: "numeric", nullable: false),
                    quantity = table.Column<decimal>(type: "numeric", nullable: false),
                    total_price = table.Column<decimal>(type: "numeric", nullable: false),
                    is_included = table.Column<bool>(type: "boolean", nullable: false),
                    is_mandatory = table.Column<bool>(type: "boolean", nullable: false),
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_counselor_package_items", x => x.id);
                    table.ForeignKey(
                        name: "FK_counselor_package_items_counselor_packages_package_id",
                        column: x => x.package_id,
                        principalTable: "counselor_packages",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_counselor_package_items_surgery_package_items_catalog_catal~",
                        column: x => x.catalog_item_id,
                        principalTable: "surgery_package_items_catalog",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "insurance_pre_authorizations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    pre_auth_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    insurance_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    insurance_provider = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    tpa_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    policy_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    policy_holder_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    surgery_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    planned_procedure = table.Column<string>(type: "text", nullable: true),
                    diagnosis_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    procedure_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    eye_operated = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    requested_amount = table.Column<decimal>(type: "numeric", nullable: false),
                    approved_amount = table.Column<decimal>(type: "numeric", nullable: true),
                    copay_amount = table.Column<decimal>(type: "numeric", nullable: false),
                    deductible_amount = table.Column<decimal>(type: "numeric", nullable: false),
                    patient_payable = table.Column<decimal>(type: "numeric", nullable: true),
                    package_id = table.Column<Guid>(type: "uuid", nullable: true),
                    itemized_breakdown = table.Column<string>(type: "jsonb", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    submitted_to_tpa_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    submitted_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    expected_approval_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    actual_approval_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    tpa_approval_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    tpa_approval_letter_url = table.Column<string>(type: "text", nullable: true),
                    tpa_response_notes = table.Column<string>(type: "text", nullable: true),
                    tpa_denial_reason = table.Column<string>(type: "text", nullable: true),
                    queries_raised = table.Column<string[]>(type: "text[]", nullable: true),
                    query_responses = table.Column<string[]>(type: "text[]", nullable: true),
                    valid_from = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    valid_until = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    cancelled_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    cancelled_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    cancellation_reason = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_insurance_pre_authorizations", x => x.id);
                    table.ForeignKey(
                        name: "FK_insurance_pre_authorizations_counseling_sessions_session_id",
                        column: x => x.session_id,
                        principalTable: "counseling_sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_insurance_pre_authorizations_counselor_packages_package_id",
                        column: x => x.package_id,
                        principalTable: "counselor_packages",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "package_discount_approvals",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: true),
                    package_id = table.Column<Guid>(type: "uuid", nullable: false),
                    request_number = table.Column<string>(type: "text", nullable: true),
                    requested_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    discount_percent = table.Column<decimal>(type: "numeric", nullable: false),
                    discount_amount = table.Column<decimal>(type: "numeric", nullable: false),
                    original_price = table.Column<decimal>(type: "numeric", nullable: false),
                    final_price = table.Column<decimal>(type: "numeric", nullable: false),
                    justification = table.Column<string>(type: "text", nullable: false),
                    approval_level = table.Column<int>(type: "integer", nullable: false),
                    assigned_to_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    assigned_to_role = table.Column<string>(type: "text", nullable: true),
                    reviewed_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    reviewed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    review_notes = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    priority = table.Column<string>(type: "text", nullable: false),
                    sla_deadline = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    sla_breached = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_package_discount_approvals", x => x.id);
                    table.ForeignKey(
                        name: "FK_package_discount_approvals_counselor_packages_package_id",
                        column: x => x.package_id,
                        principalTable: "counselor_packages",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "insurance_approval_workflow",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    pre_auth_id = table.Column<Guid>(type: "uuid", nullable: false),
                    stage_name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    stage_sequence = table.Column<int>(type: "integer", nullable: false),
                    approver_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    approver_role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    action_taken = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    action_timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    comments = table.Column<string>(type: "text", nullable: true),
                    documents_uploaded = table.Column<string[]>(type: "text[]", nullable: true),
                    is_current_stage = table.Column<bool>(type: "boolean", nullable: false),
                    completed = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_insurance_approval_workflow", x => x.id);
                    table.ForeignKey(
                        name: "FK_insurance_approval_workflow_insurance_pre_authorizations_pr~",
                        column: x => x.pre_auth_id,
                        principalTable: "insurance_pre_authorizations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "insurance_documents",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    pre_auth_id = table.Column<Guid>(type: "uuid", nullable: false),
                    document_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    document_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    file_url = table.Column<string>(type: "text", nullable: false),
                    file_size_bytes = table.Column<long>(type: "bigint", nullable: true),
                    mime_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    uploaded_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    uploaded_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    verified_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    verified_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_verified = table.Column<bool>(type: "boolean", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_insurance_documents", x => x.id);
                    table.ForeignKey(
                        name: "FK_insurance_documents_insurance_pre_authorizations_pre_auth_id",
                        column: x => x.pre_auth_id,
                        principalTable: "insurance_pre_authorizations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tpa_communication_log",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    pre_auth_id = table.Column<Guid>(type: "uuid", nullable: false),
                    communication_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    communication_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    direction = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    hospital_contact_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    tpa_contact_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    tpa_contact_phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    tpa_contact_email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    subject = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    message = table.Column<string>(type: "text", nullable: true),
                    requires_response = table.Column<bool>(type: "boolean", nullable: false),
                    response_received = table.Column<bool>(type: "boolean", nullable: false),
                    response_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    response_text = table.Column<string>(type: "text", nullable: true),
                    attachments_urls = table.Column<string[]>(type: "text[]", nullable: true),
                    follow_up_required = table.Column<bool>(type: "boolean", nullable: false),
                    follow_up_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    follow_up_completed = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tpa_communication_log", x => x.id);
                    table.ForeignKey(
                        name: "FK_tpa_communication_log_insurance_pre_authorizations_pre_auth~",
                        column: x => x.pre_auth_id,
                        principalTable: "insurance_pre_authorizations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_consent_form_templates_consent_category",
                table: "consent_form_templates",
                column: "consent_category");

            migrationBuilder.CreateIndex(
                name: "IX_consent_form_templates_is_active",
                table: "consent_form_templates",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "IX_consent_form_templates_tenant_id",
                table: "consent_form_templates",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_counseling_consents_consent_status",
                table: "counseling_consents",
                column: "consent_status");

            migrationBuilder.CreateIndex(
                name: "IX_counseling_consents_patient_id",
                table: "counseling_consents",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_counseling_consents_session_id",
                table: "counseling_consents",
                column: "session_id");

            migrationBuilder.CreateIndex(
                name: "IX_counseling_consents_template_id",
                table: "counseling_consents",
                column: "template_id");

            migrationBuilder.CreateIndex(
                name: "IX_counseling_consents_tenant_id",
                table: "counseling_consents",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "IX_counseling_session_documents_session_id",
                table: "counseling_session_documents",
                column: "session_id");

            migrationBuilder.CreateIndex(
                name: "IX_counseling_session_notes_session_id",
                table: "counseling_session_notes",
                column: "session_id");

            migrationBuilder.CreateIndex(
                name: "IX_counselor_package_items_catalog_item_id",
                table: "counselor_package_items",
                column: "catalog_item_id");

            migrationBuilder.CreateIndex(
                name: "IX_counselor_package_items_package_id",
                table: "counselor_package_items",
                column: "package_id");

            migrationBuilder.CreateIndex(
                name: "IX_counselor_packages_template_id",
                table: "counselor_packages",
                column: "template_id");

            migrationBuilder.CreateIndex(
                name: "IX_counselor_queue_session_id",
                table: "counselor_queue",
                column: "session_id");

            migrationBuilder.CreateIndex(
                name: "IX_imaging_annotations_imaging_image_id",
                table: "imaging_annotations",
                column: "imaging_image_id");

            migrationBuilder.CreateIndex(
                name: "IX_imaging_comparisons_baseline_image_id",
                table: "imaging_comparisons",
                column: "baseline_image_id");

            migrationBuilder.CreateIndex(
                name: "IX_imaging_comparisons_followup_image_id",
                table: "imaging_comparisons",
                column: "followup_image_id");

            migrationBuilder.CreateIndex(
                name: "IX_imaging_comparisons_patient_id",
                table: "imaging_comparisons",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_imaging_images_imaging_order_id",
                table: "imaging_images",
                column: "imaging_order_id");

            migrationBuilder.CreateIndex(
                name: "IX_insurance_approval_workflow_pre_auth_id",
                table: "insurance_approval_workflow",
                column: "pre_auth_id");

            migrationBuilder.CreateIndex(
                name: "IX_insurance_documents_pre_auth_id",
                table: "insurance_documents",
                column: "pre_auth_id");

            migrationBuilder.CreateIndex(
                name: "IX_insurance_pre_authorizations_package_id",
                table: "insurance_pre_authorizations",
                column: "package_id");

            migrationBuilder.CreateIndex(
                name: "IX_insurance_pre_authorizations_session_id",
                table: "insurance_pre_authorizations",
                column: "session_id");

            migrationBuilder.CreateIndex(
                name: "IX_ot_booking_validations_schedule_id",
                table: "ot_booking_validations",
                column: "schedule_id");

            migrationBuilder.CreateIndex(
                name: "IX_ot_booking_validations_session_id",
                table: "ot_booking_validations",
                column: "session_id");

            migrationBuilder.CreateIndex(
                name: "IX_ot_collision_logs_existing_schedule_id",
                table: "ot_collision_logs",
                column: "existing_schedule_id");

            migrationBuilder.CreateIndex(
                name: "IX_ot_collision_logs_theater_id",
                table: "ot_collision_logs",
                column: "theater_id");

            migrationBuilder.CreateIndex(
                name: "IX_ot_equipment_availability_theater_id",
                table: "ot_equipment_availability",
                column: "theater_id");

            migrationBuilder.CreateIndex(
                name: "IX_ot_schedules_session_id",
                table: "ot_schedules",
                column: "session_id");

            migrationBuilder.CreateIndex(
                name: "IX_ot_schedules_theater_id",
                table: "ot_schedules",
                column: "theater_id");

            migrationBuilder.CreateIndex(
                name: "IX_package_discount_approvals_package_id",
                table: "package_discount_approvals",
                column: "package_id");

            migrationBuilder.CreateIndex(
                name: "IX_patient_type_document_checklist_session_id",
                table: "patient_type_document_checklist",
                column: "session_id");

            migrationBuilder.CreateIndex(
                name: "IX_preop_fitness_clearances_order_id",
                table: "preop_fitness_clearances",
                column: "order_id");

            migrationBuilder.CreateIndex(
                name: "IX_preop_fitness_clearances_session_id",
                table: "preop_fitness_clearances",
                column: "session_id");

            migrationBuilder.CreateIndex(
                name: "IX_preop_test_orders_protocol_id",
                table: "preop_test_orders",
                column: "protocol_id");

            migrationBuilder.CreateIndex(
                name: "IX_preop_test_orders_session_id",
                table: "preop_test_orders",
                column: "session_id");

            migrationBuilder.CreateIndex(
                name: "IX_preop_test_results_order_id",
                table: "preop_test_results",
                column: "order_id");

            migrationBuilder.CreateIndex(
                name: "IX_tpa_communication_log_pre_auth_id",
                table: "tpa_communication_log",
                column: "pre_auth_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AIProgressionAnalyses");

            migrationBuilder.DropTable(
                name: "anesthesia_types");

            migrationBuilder.DropTable(
                name: "bed_reservations");

            migrationBuilder.DropTable(
                name: "consent_form_templates");

            migrationBuilder.DropTable(
                name: "counseling_consents");

            migrationBuilder.DropTable(
                name: "counseling_session_documents");

            migrationBuilder.DropTable(
                name: "counseling_session_notes");

            migrationBuilder.DropTable(
                name: "counseling_workflow_state");

            migrationBuilder.DropTable(
                name: "counselor_package_items");

            migrationBuilder.DropTable(
                name: "counselor_queue");

            migrationBuilder.DropTable(
                name: "government_scheme_claims");

            migrationBuilder.DropTable(
                name: "government_schemes");

            migrationBuilder.DropTable(
                name: "imaging_annotations");

            migrationBuilder.DropTable(
                name: "imaging_comparisons");

            migrationBuilder.DropTable(
                name: "insurance_approval_workflow");

            migrationBuilder.DropTable(
                name: "insurance_documents");

            migrationBuilder.DropTable(
                name: "insurance_providers");

            migrationBuilder.DropTable(
                name: "ot_booking_validations");

            migrationBuilder.DropTable(
                name: "ot_collision_logs");

            migrationBuilder.DropTable(
                name: "ot_equipment_availability");

            migrationBuilder.DropTable(
                name: "package_discount_approvals");

            migrationBuilder.DropTable(
                name: "patient_admissions");

            migrationBuilder.DropTable(
                name: "patient_type_configurations");

            migrationBuilder.DropTable(
                name: "patient_type_document_checklist");

            migrationBuilder.DropTable(
                name: "payment_links");

            migrationBuilder.DropTable(
                name: "payment_transactions");

            migrationBuilder.DropTable(
                name: "preop_fitness_clearances");

            migrationBuilder.DropTable(
                name: "preop_test_results");

            migrationBuilder.DropTable(
                name: "surgery_types");

            migrationBuilder.DropTable(
                name: "tpa_communication_log");

            migrationBuilder.DropTable(
                name: "tpa_providers");

            migrationBuilder.DropTable(
                name: "workflow_stage_transitions");

            migrationBuilder.DropTable(
                name: "surgery_package_items_catalog");

            migrationBuilder.DropTable(
                name: "imaging_images");

            migrationBuilder.DropTable(
                name: "ot_schedules");

            migrationBuilder.DropTable(
                name: "preop_test_orders");

            migrationBuilder.DropTable(
                name: "insurance_pre_authorizations");

            migrationBuilder.DropTable(
                name: "ot_theaters");

            migrationBuilder.DropTable(
                name: "preop_test_protocols");

            migrationBuilder.DropTable(
                name: "counseling_sessions");

            migrationBuilder.DropTable(
                name: "counselor_packages");

            migrationBuilder.DropTable(
                name: "surgery_package_templates");
        }
    }
}
