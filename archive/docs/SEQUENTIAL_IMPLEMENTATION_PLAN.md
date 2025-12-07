# SEQUENTIAL IMPLEMENTATION PLAN
**Hospital Portal RBAC-ABAC Complete Implementation**

**Based On**: RBAC-ABAC-Complete-Permissions.md (Version 3.0)  
**Gap Analysis**: RBAC_ABAC_GAP_ANALYSIS.md  
**Start Date**: November 11, 2025  
**Target Completion**: January 31, 2026 (12 weeks)

---

## 🎯 IMPLEMENTATION STRATEGY

### Phased Approach
1. **Phase 0** (Week 1): Foundation - Enable existing, create permissions/roles
2. **Phase 1** (Weeks 2-3): Database + Backend APIs
3. **Phase 2** (Weeks 4-7): Frontend UI (RBAC/ABAC)
4. **Phase 3** (Weeks 8-9): Document Sharing + Multi-Dept
5. **Phase 4** (Weeks 10-11): Testing + Validation
6. **Phase 5** (Week 12): Polish + Documentation

### Work Order Principles
- ✅ Enable what's already coded FIRST (quick wins)
- ✅ Database changes BEFORE APIs
- ✅ APIs BEFORE UI
- ✅ Test after EACH major step
- ✅ One step at a time (no skipping)

---

## 📅 WEEK-BY-WEEK PLAN

## WEEK 1: FOUNDATION (Quick Wins)

### Day 1-2: Enable Phase 4 APIs ⚡ QUICK WIN

**STEP 1: Move DocumentSharingController out of _Phase4_Disabled**
```powershell
# PowerShell commands
cd "c:\Users\Sam Aluri\Downloads\Hospital Portal\microservices\auth-service\AuthService"
mv "Controllers\_Phase4_Disabled\DocumentSharingController.cs" "Controllers\DocumentSharingController.cs"
```

**STEP 2: Move DocumentSharingService out of _Phase4_Disabled**
```powershell
mv "Services\_Phase4_Disabled\DocumentSharingService.cs" "Services\DocumentSharingService.cs"
mv "Services\_Phase4_Disabled\IDocumentSharingService.cs" "Services\IDocumentSharingService.cs"
```

**STEP 3: Register DocumentSharingService in Program.cs**
```csharp
// Add to Program.cs (around line 100 with other services)
builder.Services.AddScoped<IDocumentSharingService, DocumentSharingService>();
```

**STEP 4: Test all 16 endpoints in Swagger**
- Run backend: `dotnet run`
- Open: `https://localhost:7001/swagger`
- Test:
  - GET /api/documentsharing/document-types
  - POST /api/documentsharing/document-types
  - POST /api/documentsharing/access-rules
  - POST /api/documentsharing/access-rules/check-access

**Expected Result**: ✅ 16 new endpoints working (162 → 178 total)

---

### Day 3-5: Create 297 Permissions Seed Script

**STEP 5: Create SQL seed script for Patient Management permissions (24)**

Create file: `seed_permissions_patient_management.sql`

```sql
-- Patient Management Permissions (24)
INSERT INTO permissions (id, tenant_id, permission_name, permission_code, module_name, resource_name, "Action", scope, status, created_at) VALUES
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Create Patient Record', 'patient.patient_record.create', 'patient', 'patient_record', 'create', 'department', 'active', CURRENT_TIMESTAMP),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Read Patient Record', 'patient.patient_record.read', 'patient', 'patient_record', 'read', 'department', 'active', CURRENT_TIMESTAMP),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Update Patient Record', 'patient.patient_record.update', 'patient', 'patient_record', 'update', 'department', 'active', CURRENT_TIMESTAMP),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Delete Patient Record', 'patient.patient_record.delete', 'patient', 'patient_record', 'delete', 'department', 'active', CURRENT_TIMESTAMP),

(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Create Patient Demographics', 'patient.patient_demographics.create', 'patient', 'patient_demographics', 'create', 'department', 'active', CURRENT_TIMESTAMP),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Read Patient Demographics', 'patient.patient_demographics.read', 'patient', 'patient_demographics', 'read', 'department', 'active', CURRENT_TIMESTAMP),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Update Patient Demographics', 'patient.patient_demographics.update', 'patient', 'patient_demographics', 'update', 'department', 'active', CURRENT_TIMESTAMP),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Delete Patient Demographics', 'patient.patient_demographics.delete', 'patient', 'patient_demographics', 'delete', 'department', 'active', CURRENT_TIMESTAMP),

(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Create Patient Contact', 'patient.patient_contact.create', 'patient', 'patient_contact', 'create', 'department', 'active', CURRENT_TIMESTAMP),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Read Patient Contact', 'patient.patient_contact.read', 'patient', 'patient_contact', 'read', 'department', 'active', CURRENT_TIMESTAMP),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Update Patient Contact', 'patient.patient_contact.update', 'patient', 'patient_contact', 'update', 'department', 'active', CURRENT_TIMESTAMP),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Delete Patient Contact', 'patient.patient_contact.delete', 'patient', 'patient_contact', 'delete', 'department', 'active', CURRENT_TIMESTAMP),

(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Create Patient Consent', 'patient.patient_consent.create', 'patient', 'patient_consent', 'create', 'department', 'active', CURRENT_TIMESTAMP),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Read Patient Consent', 'patient.patient_consent.read', 'patient', 'patient_consent', 'read', 'department', 'active', CURRENT_TIMESTAMP),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Update Patient Consent', 'patient.patient_consent.update', 'patient', 'patient_consent', 'update', 'department', 'active', CURRENT_TIMESTAMP),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Delete Patient Consent', 'patient.patient_consent.delete', 'patient', 'patient_consent', 'delete', 'department', 'active', CURRENT_TIMESTAMP),

(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Upload Patient Document', 'patient.patient_document.upload', 'patient', 'patient_document', 'upload', 'department', 'active', CURRENT_TIMESTAMP),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Read Patient Document', 'patient.patient_document.read', 'patient', 'patient_document', 'read', 'department', 'active', CURRENT_TIMESTAMP),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Update Patient Document', 'patient.patient_document.update', 'patient', 'patient_document', 'update', 'department', 'active', CURRENT_TIMESTAMP),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Delete Patient Document', 'patient.patient_document.delete', 'patient', 'patient_document', 'delete', 'department', 'active', CURRENT_TIMESTAMP),

(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Create Patient Preferences', 'patient.patient_preferences.create', 'patient', 'patient_preferences', 'create', 'department', 'active', CURRENT_TIMESTAMP),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Read Patient Preferences', 'patient.patient_preferences.read', 'patient', 'patient_preferences', 'read', 'department', 'active', CURRENT_TIMESTAMP),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Update Patient Preferences', 'patient.patient_preferences.update', 'patient', 'patient_preferences', 'update', 'department', 'active', CURRENT_TIMESTAMP),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Delete Patient Preferences', 'patient.patient_preferences.delete', 'patient', 'patient_preferences', 'delete', 'department', 'active', CURRENT_TIMESTAMP);
```

**STEP 6: Create scripts for remaining modules**

Repeat STEP 5 pattern for:
- Clinical Assessment (20 permissions) → `seed_permissions_clinical.sql`
- Prescriptions (16) → `seed_permissions_pharmacy.sql`
- Laboratory (18) → `seed_permissions_laboratory.sql`
- Imaging (16) → `seed_permissions_imaging.sql`
- Appointments (16) → `seed_permissions_appointments.sql`
- Billing (20) → `seed_permissions_billing.sql`
- Insurance (18) → `seed_permissions_insurance.sql`
- Pharmacy (20) → `seed_permissions_pharmacy_inventory.sql`
- Ward/IPD (18) → `seed_permissions_ward.sql`
- Operating Theatre (18) → `seed_permissions_surgery.sql`
- Optical Shop (16) → `seed_permissions_optical.sql`
- Medical Records (12) → `seed_permissions_mrd.sql`
- Administration (15) → `seed_permissions_admin.sql`
- Reporting (12) → `seed_permissions_reporting.sql`
- Quality (12) → `seed_permissions_quality.sql`

**STEP 7: Create master seed script**

Create file: `MASTER_PERMISSIONS_SEED.sql`

```sql
-- Master Permissions Seed Script - 297 Permissions
-- Execute in order

\i seed_permissions_patient_management.sql
\i seed_permissions_clinical.sql
\i seed_permissions_pharmacy.sql
-- ... (include all 16 module scripts)

-- Verification
SELECT module_name, COUNT(*) as permission_count
FROM permissions
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
GROUP BY module_name
ORDER BY module_name;

-- Expected output:
-- patient: 24
-- clinical: 20
-- pharmacy: 16
-- ... (16 modules)
-- Total: 297
```

**STEP 8: Execute seed script**

```powershell
# Via psql
psql -U postgres -d hospitalportal -f "MASTER_PERMISSIONS_SEED.sql"

# OR via backend API
POST https://localhost:7001/api/permissions/seed
```

**STEP 9: Verify permissions created**

```sql
SELECT COUNT(*) FROM permissions; -- Should be 297+
SELECT * FROM permissions WHERE module_name = 'patient' ORDER BY permission_code;
```

**Expected Result**: ✅ 297 permissions in database

---

## WEEK 2: ROLES + PERMISSION MAPPINGS

### Day 1-2: Create 20 Roles

**STEP 10: Create SQL seed script for roles**

Create file: `seed_roles.sql`

```sql
-- 20 Flat Roles for Hospital Portal
INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "TenantId", "Description", "IsSystemRole", "IsActive") VALUES
('00000000-0000-0000-0000-000000000001', 'System Admin', 'SYSTEM ADMIN', '00000000-0000-0000-0000-000000000001', 'Full system access', true, true),
('00000000-0000-0000-0000-000000000002', 'Hospital Administrator', 'HOSPITAL ADMINISTRATOR', '00000000-0000-0000-0000-000000000001', 'Hospital-wide admin', true, true),
('00000000-0000-0000-0000-000000000003', 'Finance Manager', 'FINANCE MANAGER', '00000000-0000-0000-0000-000000000001', 'Financial operations', true, true),
('00000000-0000-0000-0000-000000000004', 'HR Manager', 'HR MANAGER', '00000000-0000-0000-0000-000000000001', 'Human resources', true, true),
('00000000-0000-0000-0000-000000000005', 'IT Manager', 'IT MANAGER', '00000000-0000-0000-0000-000000000001', 'IT and systems', true, true),
('00000000-0000-0000-0000-000000000006', 'Quality Manager', 'QUALITY MANAGER', '00000000-0000-0000-0000-000000000001', 'Quality and compliance', true, true),
('00000000-0000-0000-0000-000000000007', 'Doctor', 'DOCTOR', '00000000-0000-0000-0000-000000000001', 'Medical doctor', false, true),
('00000000-0000-0000-0000-000000000008', 'Nurse', 'NURSE', '00000000-0000-0000-0000-000000000001', 'Nursing staff', false, true),
('00000000-0000-0000-0000-000000000009', 'Pharmacist', 'PHARMACIST', '00000000-0000-0000-0000-000000000001', 'Pharmacy operations', false, true),
('00000000-0000-0000-0000-00000000000A', 'Technician', 'TECHNICIAN', '00000000-0000-0000-0000-000000000001', 'Technical staff', false, true),
('00000000-0000-0000-0000-00000000000B', 'Receptionist', 'RECEPTIONIST', '00000000-0000-0000-0000-000000000001', 'Front desk staff', false, true),
('00000000-0000-0000-0000-00000000000C', 'Counselor', 'COUNSELOR', '00000000-0000-0000-0000-000000000001', 'Patient counseling', false, true),
('00000000-0000-0000-0000-00000000000D', 'Admin Staff', 'ADMIN STAFF', '00000000-0000-0000-0000-000000000001', 'Administrative staff', false, true),
('00000000-0000-0000-0000-00000000000E', 'Finance Officer', 'FINANCE OFFICER', '00000000-0000-0000-0000-000000000001', 'Finance operations', false, true),
('00000000-0000-0000-0000-00000000000F', 'Department Head', 'DEPARTMENT HEAD', '00000000-0000-0000-0000-000000000001', 'Department leadership', false, true),
('00000000-0000-0000-0000-000000000010', 'Lab Manager', 'LAB MANAGER', '00000000-0000-0000-0000-000000000001', 'Laboratory management', false, true),
('00000000-0000-0000-0000-000000000011', 'Ward Manager', 'WARD MANAGER', '00000000-0000-0000-0000-000000000001', 'Ward management', false, true),
('00000000-0000-0000-0000-000000000012', 'OT Manager', 'OT MANAGER', '00000000-0000-0000-0000-000000000001', 'Operating theatre management', false, true),
('00000000-0000-0000-0000-000000000013', 'Insurance Officer', 'INSURANCE OFFICER', '00000000-0000-0000-0000-000000000001', 'Insurance operations', false, true),
('00000000-0000-0000-0000-000000000014', 'Patient', 'PATIENT', '00000000-0000-0000-0000-000000000001', 'Patient access', false, true);
```

**STEP 11: Execute role seed script**

```powershell
psql -U postgres -d hospitalportal -f "seed_roles.sql"
```

**STEP 12: Verify roles created**

```sql
SELECT "Id", "Name", "Description" FROM "AspNetRoles" ORDER BY "Name";
-- Should show 20 roles
```

---

### Day 3-5: Assign Permissions to Roles

**STEP 13: Create role-permission mappings for Doctor**

Create file: `seed_role_permissions_doctor.sql`

```sql
-- Doctor Role Permissions (15 permissions)
-- Role ID: 00000000-0000-0000-0000-000000000007

INSERT INTO role_permissions ("RoleId", "PermissionId", status, created_at)
SELECT 
    '00000000-0000-0000-0000-000000000007'::uuid,
    p.id,
    'active',
    CURRENT_TIMESTAMP
FROM permissions p
WHERE p.permission_code IN (
    -- Patient Management (Read only)
    'patient.patient_record.read',
    'patient.patient_demographics.read',
    'patient.patient_document.read',
    
    -- Clinical Assessment (Full CRUD)
    'clinical.assessment.create',
    'clinical.assessment.read',
    'clinical.assessment.update',
    'clinical.assessment.delete',
    
    -- Prescriptions (Full CRUD)
    'pharmacy.prescription.create',
    'pharmacy.prescription.read',
    'pharmacy.prescription.update',
    'pharmacy.prescription.delete',
    
    -- Laboratory (Create orders, Read results)
    'laboratory.test_order.create',
    'laboratory.test_result.read',
    
    -- Reports (Read, Export)
    'report.clinical_report.read',
    'report.clinical_report.export'
);
```

**STEP 14: Create mappings for all 20 roles**

Repeat STEP 13 pattern for:
- Nurse (12 permissions)
- Pharmacist (10 permissions)
- Receptionist (8 permissions)
- Admin Staff (9 permissions)
- Finance Manager (15 permissions)
- Finance Officer (10 permissions)
- Department Head (20 permissions)
- Insurance Officer (18 permissions)
- Quality Manager (12 permissions)
- IT Manager (12 permissions)
- Patient (8 permissions)
- Hospital Administrator (25 permissions)
- System Admin (ALL 297 permissions)
- ... (remaining roles)

**STEP 15: Create master role-permission seed script**

Create file: `MASTER_ROLE_PERMISSIONS_SEED.sql`

```sql
-- Master Role-Permission Mappings
\i seed_role_permissions_doctor.sql
\i seed_role_permissions_nurse.sql
\i seed_role_permissions_pharmacist.sql
-- ... (all 20 roles)

-- Verification
SELECT r."Name", COUNT(rp."PermissionId") as permission_count
FROM "AspNetRoles" r
LEFT JOIN role_permissions rp ON r."Id" = rp."RoleId"
WHERE rp.status = 'active'
GROUP BY r."Name"
ORDER BY r."Name";

-- Expected output:
-- Doctor: 15
-- Nurse: 12
-- Pharmacist: 10
-- System Admin: 297
-- etc.
```

**STEP 16: Execute role-permission mappings**

```powershell
psql -U postgres -d hospitalportal -f "MASTER_ROLE_PERMISSIONS_SEED.sql"
```

**Expected Result**: ✅ 20 roles with appropriate permissions assigned

---

## WEEK 3: DATABASE ENHANCEMENTS

### Day 1-2: Create Missing Tables

**STEP 17: Create patient_document_uploads table**

Create file: `migration_patient_document_uploads.sql`

```sql
CREATE TABLE IF NOT EXISTS patient_document_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    patient_id UUID NOT NULL REFERENCES users(id),
    
    document_type VARCHAR(50) NOT NULL, -- insurance_health_card, lab_report, etc.
    document_title VARCHAR(255),
    file_url VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(50),
    
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Departments that can see this document
    shared_to_departments VARCHAR(50)[],
    shared_to_roles VARCHAR(50)[],
    
    -- Standard columns
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ,
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_patient_uploads_patient ON patient_document_uploads(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_patient_uploads_date ON patient_document_uploads(uploaded_at);
CREATE INDEX idx_patient_uploads_type ON patient_document_uploads(document_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_patient_uploads_tenant ON patient_document_uploads(tenant_id) WHERE deleted_at IS NULL;

-- RLS Policy
ALTER TABLE patient_document_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_patient_document_uploads ON patient_document_uploads
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));
```

**STEP 18: Create document_access_audit table**

Create file: `migration_document_access_audit.sql`

```sql
CREATE TABLE IF NOT EXISTS document_access_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    
    user_id UUID NOT NULL REFERENCES users(id),
    document_id UUID NOT NULL,
    document_type VARCHAR(50),
    
    action VARCHAR(50) NOT NULL, -- read, update, delete, download, share, unshare
    
    access_granted BOOLEAN NOT NULL,
    denial_reason VARCHAR(255),
    
    ip_address INET,
    user_agent TEXT,
    
    accessed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_audit_user ON document_access_audit(user_id);
CREATE INDEX idx_audit_document ON document_access_audit(document_id);
CREATE INDEX idx_audit_timestamp ON document_access_audit(accessed_at);
CREATE INDEX idx_audit_tenant ON document_access_audit(tenant_id);

-- RLS Policy
ALTER TABLE document_access_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_document_access_audit ON document_access_audit
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));
```

**STEP 19: Create admin_configurations table**

Create file: `migration_admin_configurations.sql`

```sql
CREATE TABLE IF NOT EXISTS admin_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    
    config_key VARCHAR(100) NOT NULL,
    config_value TEXT,
    config_type VARCHAR(50) NOT NULL, -- string, number, boolean, json, array
    
    description TEXT,
    editable_by VARCHAR(50)[], -- Array of role codes that can edit
    
    is_system_config BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ,
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES users(id)
);

-- Indexes
CREATE UNIQUE INDEX idx_admin_config_key ON admin_configurations(tenant_id, config_key) WHERE deleted_at IS NULL;
CREATE INDEX idx_admin_config_type ON admin_configurations(config_type) WHERE deleted_at IS NULL;

-- RLS Policy
ALTER TABLE admin_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_admin_configurations ON admin_configurations
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));
```

**STEP 20: Execute all table migrations**

```powershell
psql -U postgres -d hospitalportal -f "migration_patient_document_uploads.sql"
psql -U postgres -d hospitalportal -f "migration_document_access_audit.sql"
psql -U postgres -d hospitalportal -f "migration_admin_configurations.sql"
```

**STEP 21: Verify tables created**

```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE '%document%' OR tablename LIKE '%admin_config%';
-- Should show: patient_document_uploads, document_access_audit, admin_configurations
```

---

### Day 3: Enhance Existing Tables

**STEP 22: Add columns to permissions table**

Create file: `migration_enhance_permissions.sql`

```sql
-- Add data classification if not exists
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS data_classification VARCHAR(50);

-- Update existing permissions
UPDATE permissions SET data_classification = 'internal' WHERE data_classification IS NULL;
```

**STEP 23: Add columns to role_permissions table**

Create file: `migration_enhance_role_permissions.sql`

```sql
-- Add conditional permissions support (for future ABAC)
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS "Condition" JSONB;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS effective_from TIMESTAMPTZ;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS effective_until TIMESTAMPTZ;
```

**STEP 24: Execute enhancement migrations**

```powershell
psql -U postgres -d hospitalportal -f "migration_enhance_permissions.sql"
psql -U postgres -d hospitalportal -f "migration_enhance_role_permissions.sql"
```

**Expected Result**: ✅ All database changes complete (99 tables now)

---

## WEEK 4: BACKEND APIS (Multi-Dept + Patient Upload)

### Day 1-3: Multi-Department User Access APIs

**STEP 25: Create UserDepartmentAccessService**

Create file: `Services/UserDepartmentAccessService.cs`

```csharp
public interface IUserDepartmentAccessService {
    Task<List<UserDepartmentAccessDto>> GetUserDepartmentsAsync(Guid userId);
    Task<UserDepartmentAccessDto> AssignDepartmentAsync(Guid userId, AssignDepartmentRequest request);
    Task<bool> RemoveDepartmentAccessAsync(Guid userId, Guid departmentId);
    Task<bool> SetPrimaryDepartmentAsync(Guid userId, Guid departmentId);
}

public class UserDepartmentAccessService : IUserDepartmentAccessService {
    private readonly AppDbContext _context;
    
    public async Task<UserDepartmentAccessDto> AssignDepartmentAsync(Guid userId, AssignDepartmentRequest request) {
        var access = new UserDepartmentAccess {
            UserId = userId,
            DepartmentId = request.DepartmentId,
            RoleId = request.RoleId,
            IsPrimary = request.IsPrimary,
            AccessLevel = request.AccessLevel, // full, read_only, approval_only
            ValidFrom = request.ValidFrom ?? DateTime.UtcNow,
            Status = "active"
        };
        
        _context.UserDepartmentAccess.Add(access);
        await _context.SaveChangesAsync();
        
        return MapToDto(access);
    }
    
    // ... implement other methods
}
```

**STEP 26: Create UserDepartmentAccessController**

Create file: `Controllers/UserDepartmentAccessController.cs`

```csharp
[ApiController]
[Route("api/users/{userId}/department-access")]
[Authorize]
public class UserDepartmentAccessController : ControllerBase {
    private readonly IUserDepartmentAccessService _service;
    
    [HttpGet]
    public async Task<IActionResult> GetUserDepartments(Guid userId) {
        var departments = await _service.GetUserDepartmentsAsync(userId);
        return Ok(departments);
    }
    
    [HttpPost]
    public async Task<IActionResult> AssignDepartment(Guid userId, [FromBody] AssignDepartmentRequest request) {
        var result = await _service.AssignDepartmentAsync(userId, request);
        return CreatedAtAction(nameof(GetUserDepartments), new { userId }, result);
    }
    
    [HttpDelete("{departmentId}")]
    public async Task<IActionResult> RemoveDepartmentAccess(Guid userId, Guid departmentId) {
        await _service.RemoveDepartmentAccessAsync(userId, departmentId);
        return NoContent();
    }
    
    [HttpPut("{departmentId}/set-primary")]
    public async Task<IActionResult> SetPrimaryDepartment(Guid userId, Guid departmentId) {
        await _service.SetPrimaryDepartmentAsync(userId, departmentId);
        return NoContent();
    }
}
```

**STEP 27: Register service in Program.cs**

```csharp
builder.Services.AddScoped<IUserDepartmentAccessService, UserDepartmentAccessService>();
```

**STEP 28: Test multi-department APIs**

```powershell
# Start backend
cd microservices/auth-service/AuthService
dotnet run

# Test in Swagger
POST /api/users/{userId}/department-access
{
  "departmentId": "...",
  "roleId": "...",
  "isPrimary": true,
  "accessLevel": "full"
}
```

---

### Day 4-5: Patient Document Upload APIs

**STEP 29: Create PatientDocumentUploadService**

Create file: `Services/PatientDocumentUploadService.cs`

```csharp
public interface IPatientDocumentUploadService {
    Task<PatientDocumentUploadDto> UploadDocumentAsync(UploadDocumentRequest request);
    Task<List<PatientDocumentUploadDto>> GetPatientDocumentsAsync(Guid patientId);
    Task<PatientDocumentUploadDto> GetDocumentByIdAsync(Guid documentId);
}

public class PatientDocumentUploadService : IPatientDocumentUploadService {
    private readonly AppDbContext _context;
    
    public async Task<PatientDocumentUploadDto> UploadDocumentAsync(UploadDocumentRequest request) {
        // Determine auto-sharing rules based on document type
        var sharedToDepartments = GetAutoShareDepartments(request.DocumentType);
        var sharedToRoles = GetAutoShareRoles(request.DocumentType);
        
        var upload = new PatientDocumentUpload {
            PatientId = request.PatientId,
            DocumentType = request.DocumentType,
            DocumentTitle = request.DocumentTitle,
            FileUrl = request.FileUrl,
            FileSize = request.FileSize,
            MimeType = request.MimeType,
            UploadedBy = request.UploadedBy,
            SharedToDepartments = sharedToDepartments,
            SharedToRoles = sharedToRoles,
            Status = "active"
        };
        
        _context.PatientDocumentUploads.Add(upload);
        await _context.SaveChangesAsync();
        
        // Log access
        await LogDocumentAccessAsync(upload.Id, request.UploadedBy, "upload", true);
        
        return MapToDto(upload);
    }
    
    private string[] GetAutoShareDepartments(string documentType) {
        return documentType switch {
            "insurance_health_card" => new[] { "insurance", "front_office", "mrd", "billing" },
            "lab_report" => new[] { "clinical", "mrd" },
            "prescription" => new[] { "pharmacy", "mrd" },
            _ => new[] { "mrd" }
        };
    }
}
```

**STEP 30: Create PatientDocumentsController**

```csharp
[ApiController]
[Route("api/patients/{patientId}/documents")]
[Authorize]
public class PatientDocumentsController : ControllerBase {
    private readonly IPatientDocumentUploadService _service;
    
    [HttpPost("upload")]
    public async Task<IActionResult> UploadDocument(Guid patientId, [FromBody] UploadDocumentRequest request) {
        request.PatientId = patientId;
        var result = await _service.UploadDocumentAsync(request);
        return Ok(result);
    }
    
    [HttpGet]
    public async Task<IActionResult> GetDocuments(Guid patientId) {
        var documents = await _service.GetPatientDocumentsAsync(patientId);
        return Ok(documents);
    }
}
```

**STEP 31: Test patient document upload APIs**

```powershell
POST /api/patients/{patientId}/documents/upload
{
  "documentType": "insurance_health_card",
  "documentTitle": "Insurance Card.pdf",
  "fileUrl": "https://storage.azure.com/...",
  "fileSize": 1024000,
  "mimeType": "application/pdf"
}
```

**Expected Result**: ✅ 8 new APIs (multi-dept + patient upload)

---

## WEEK 5-7: FRONTEND UI (RBAC Management)

### Week 5, Day 1-3: Permission Management UI

**STEP 32: Create Permission List Page**

Create file: `apps/hospital-portal-web/src/app/dashboard/admin/permissions/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { getApi } from '@/lib/api';

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState([]);
  const [groupedPermissions, setGroupedPermissions] = useState({});
  const [selectedModule, setSelectedModule] = useState('all');
  
  useEffect(() => {
    fetchPermissions();
  }, []);
  
  const fetchPermissions = async () => {
    const api = getApi();
    const response = await api.get('/permissions');
    setPermissions(response.data.items);
    
    // Group by module
    const grouped = response.data.items.reduce((acc, perm) => {
      const module = perm.moduleName || 'other';
      if (!acc[module]) acc[module] = [];
      acc[module].push(perm);
      return acc;
    }, {});
    setGroupedPermissions(grouped);
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Permission Management</h1>
      
      {/* Module Filter */}
      <div className="mb-4">
        <select 
          value={selectedModule} 
          onChange={(e) => setSelectedModule(e.target.value)}
          className="border rounded px-4 py-2"
        >
          <option value="all">All Modules</option>
          {Object.keys(groupedPermissions).map(module => (
            <option key={module} value={module}>{module}</option>
          ))}
        </select>
      </div>
      
      {/* Permission List */}
      <div className="bg-white rounded shadow">
        {Object.entries(groupedPermissions)
          .filter(([module]) => selectedModule === 'all' || module === selectedModule)
          .map(([module, perms]) => (
            <div key={module} className="p-4 border-b">
              <h3 className="font-bold text-lg mb-2 capitalize">{module}</h3>
              <div className="grid grid-cols-4 gap-4">
                {perms.map(perm => (
                  <div key={perm.id} className="flex items-center gap-2">
                    <input type="checkbox" id={perm.id} />
                    <label htmlFor={perm.id} className="text-sm">{perm.name}</label>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
```

**STEP 33: Create Permission Matrix View**

Create file: `apps/hospital-portal-web/src/app/dashboard/admin/permissions/matrix/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { getApi } from '@/lib/api';

export default function PermissionMatrixPage() {
  const [matrix, setMatrix] = useState(null);
  
  useEffect(() => {
    fetchMatrix();
  }, []);
  
  const fetchMatrix = async () => {
    const api = getApi();
    const response = await api.get('/permissions/matrix');
    setMatrix(response.data);
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Permission Matrix</h1>
      
      {matrix && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Role</th>
                {matrix.permissions.map(perm => (
                  <th key={perm.id} className="px-4 py-2 border text-sm rotate-90 whitespace-nowrap">
                    {perm.code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.roles.map(role => (
                <tr key={role.id}>
                  <td className="px-4 py-2 border font-medium">{role.name}</td>
                  {matrix.permissions.map(perm => (
                    <td key={`${role.id}-${perm.id}`} className="px-4 py-2 border text-center">
                      {matrix.assignments[`${role.id}-${perm.id}`] ? '✓' : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

**STEP 34: Test Permission UI**

```powershell
cd apps/hospital-portal-web
pnpm dev

# Navigate to http://localhost:3000/dashboard/admin/permissions
# Navigate to http://localhost:3000/dashboard/admin/permissions/matrix
```

---

### Week 5, Day 4-5 + Week 6: Role Management UI

**STEP 35: Create Role List Page**

Create file: `apps/hospital-portal-web/src/app/dashboard/admin/roles/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { getApi } from '@/lib/api';
import Link from 'next/link';

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchRoles();
  }, []);
  
  const fetchRoles = async () => {
    const api = getApi();
    const response = await api.get('/roles');
    setRoles(response.data);
  };
  
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Role Management</h1>
        <Link href="/dashboard/admin/roles/create" className="bg-blue-600 text-white px-4 py-2 rounded">
          Create Role
        </Link>
      </div>
      
      <input 
        type="text"
        placeholder="Search roles..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 border rounded px-4 py-2 w-full"
      />
      
      <div className="bg-white rounded shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Role Name</th>
              <th className="px-6 py-3 text-left">Description</th>
              <th className="px-6 py-3 text-left">Permissions</th>
              <th className="px-6 py-3 text-left">Users</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoles.map(role => (
              <tr key={role.id} className="border-t">
                <td className="px-6 py-4">{role.name}</td>
                <td className="px-6 py-4">{role.description}</td>
                <td className="px-6 py-4">{role.permissionCount || 0}</td>
                <td className="px-6 py-4">{role.userCount || 0}</td>
                <td className="px-6 py-4">
                  <Link href={`/dashboard/admin/roles/${role.id}`} className="text-blue-600">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

**STEP 36: Create Role Edit Page with Permission Assignment**

Create file: `apps/hospital-portal-web/src/app/dashboard/admin/roles/[id]/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { getApi } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';

export default function RoleEditPage() {
  const params = useParams();
  const router = useRouter();
  const roleId = params.id;
  
  const [role, setRole] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  
  useEffect(() => {
    fetchRole();
    fetchPermissions();
  }, []);
  
  const fetchRole = async () => {
    const api = getApi();
    const response = await api.get(`/roles/${roleId}`);
    setRole(response.data);
    setSelectedPermissions(response.data.permissions.map(p => p.id));
  };
  
  const fetchPermissions = async () => {
    const api = getApi();
    const response = await api.get('/permissions');
    setAllPermissions(response.data.items);
  };
  
  const handleSavePermissions = async () => {
    const api = getApi();
    await api.post(`/roles/${roleId}/assign-permissions`, {
      permissionIds: selectedPermissions
    });
    router.push('/dashboard/admin/roles');
  };
  
  const togglePermission = (permId) => {
    setSelectedPermissions(prev => 
      prev.includes(permId) 
        ? prev.filter(id => id !== permId)
        : [...prev, permId]
    );
  };
  
  if (!role) return <div>Loading...</div>;
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Role: {role.name}</h1>
      
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-lg font-bold mb-4">Assign Permissions</h2>
        
        {/* Group permissions by module */}
        {Object.entries(
          allPermissions.reduce((acc, perm) => {
            const module = perm.moduleName || 'other';
            if (!acc[module]) acc[module] = [];
            acc[module].push(perm);
            return acc;
          }, {})
        ).map(([module, perms]) => (
          <div key={module} className="mb-6">
            <h3 className="font-bold mb-2 capitalize">{module}</h3>
            <div className="grid grid-cols-3 gap-4">
              {perms.map(perm => (
                <label key={perm.id} className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    checked={selectedPermissions.includes(perm.id)}
                    onChange={() => togglePermission(perm.id)}
                  />
                  <span className="text-sm">{perm.name}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        
        <button 
          onClick={handleSavePermissions}
          className="bg-blue-600 text-white px-6 py-2 rounded mt-4"
        >
          Save Permissions
        </button>
      </div>
    </div>
  );
}
```

**STEP 37: Test Role Management UI**

```powershell
# Navigate to http://localhost:3000/dashboard/admin/roles
# Click "Edit" on Doctor role
# Assign 15 permissions per document specification
# Click "Save Permissions"
```

---

### Week 7: Document Sharing UI

**STEP 38: Create Document Type Management Page**

Create file: `apps/hospital-portal-web/src/app/dashboard/admin/document-sharing/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { getApi } from '@/lib/api';

export default function DocumentSharingPage() {
  const [documentTypes, setDocumentTypes] = useState([]);
  
  useEffect(() => {
    fetchDocumentTypes();
  }, []);
  
  const fetchDocumentTypes = async () => {
    const api = getApi();
    const response = await api.get('/documentsharing/document-types');
    setDocumentTypes(response.data.items);
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Document Sharing Management</h1>
      
      <div className="grid grid-cols-3 gap-4">
        {documentTypes.map(docType => (
          <div key={docType.id} className="bg-white rounded shadow p-4">
            <h3 className="font-bold">{docType.typeName}</h3>
            <p className="text-sm text-gray-600">{docType.description}</p>
            <p className="text-sm mt-2">Access Rules: {docType.accessRuleCount || 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**STEP 39: Create Access Rule Management Page**

Similar pattern to roles/permissions UI - create/edit access rules.

---

## WEEK 8-9: DOCUMENT SHARING DATA + MULTI-DEPT

### Week 8: Seed Document Types and Access Rules

**STEP 40: Create document types seed script**

Create file: `seed_document_types.sql`

```sql
-- 9 Document Types
INSERT INTO document_types (id, tenant_id, type_code, type_name, description, source_system, auto_share, status) VALUES
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'insurance_health_card', 'Insurance Health Card', 'Patient insurance card uploaded from portal', 'patient_portal', true, 'active'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'lab_report', 'Laboratory Report', 'Lab test results', 'laboratory_system', true, 'active'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'prescription', 'Prescription', 'Doctor prescription', 'clinical_system', true, 'active'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'pharmacy_record', 'Pharmacy Record', 'Medicine dispensing record', 'pharmacy_system', true, 'active'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'bill_invoice', 'Bill/Invoice', 'Patient billing document', 'billing_system', true, 'active'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'medical_test_result', 'Medical Test Result', 'Imaging or lab result', 'imaging_system', true, 'active'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'insurance_claim', 'Insurance Claim', 'Insurance claim document', 'insurance_system', true, 'active'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'patient_consent', 'Patient Consent Form', 'Patient consent document', 'patient_portal', true, 'active'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'medical_record', 'Medical Record/Discharge Summary', 'Clinical medical record', 'clinical_system', true, 'active');
```

**STEP 41: Create access rules for Insurance Health Card**

```sql
-- Insurance Health Card → Insurance, Front Office, MRD, Billing
INSERT INTO document_access_rules (id, tenant_id, document_type_id, target_role, permission_codes, scope, is_active)
SELECT 
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    dt.id,
    'patient',
    ARRAY['read'],
    'own_records_only',
    true
FROM document_types dt WHERE dt.type_code = 'insurance_health_card'

UNION ALL

SELECT 
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    dt.id,
    'Insurance Officer',
    ARRAY['read', 'update'],
    'all',
    true
FROM document_types dt WHERE dt.type_code = 'insurance_health_card'

-- ... (continue for front_office, mrd, billing)
```

**STEP 42: Repeat for all 9 document types**

Create access rules per document specification (from RBAC-ABAC document).

**STEP 43: Execute document sharing seed scripts**

```powershell
psql -U postgres -d hospitalportal -f "seed_document_types.sql"
psql -U postgres -d hospitalportal -f "seed_access_rules_insurance_card.sql"
# ... (all 9)
```

---

### Week 9: Test Multi-Department + Document Sharing

**STEP 44: Create test user with multi-department access**

```sql
-- Assign Doctor to Ophthalmology (primary) + Optometry (secondary)
INSERT INTO user_department_access (id, tenant_id, user_id, department_id, role_id, is_primary, access_level, status)
VALUES 
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', '{doctor_user_id}', '{ophthalmology_dept_id}', '00000000-0000-0000-0000-000000000007', true, 'full', 'active'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', '{doctor_user_id}', '{optometry_dept_id}', '00000000-0000-0000-0000-000000000007', false, 'full', 'active');
```

**STEP 45: Test document access checking**

```powershell
# Patient uploads insurance card
POST /api/patients/{patientId}/documents/upload
{
  "documentType": "insurance_health_card",
  "fileUrl": "..."
}

# Check if Insurance Officer can access
POST /api/documentsharing/access-rules/check-access
{
  "documentTypeId": "...",
  "userId": "{insurance_officer_id}",
  "userRole": "Insurance Officer",
  "requiredPermissions": ["read"]
}

# Expected: hasAccess = true
```

**STEP 46: Verify audit logging**

```sql
SELECT * FROM document_access_audit WHERE document_id = '{uploaded_doc_id}' ORDER BY accessed_at DESC;
-- Should show upload event + access checks
```

---

## WEEK 10-11: TESTING + VALIDATION

### Week 10: Backend Testing

**STEP 47: Test all 297 permissions**

```powershell
# Create test script
$permissions = @(
    "patient.patient_record.create",
    "patient.patient_record.read",
    # ... (all 297)
)

foreach ($perm in $permissions) {
    $response = Invoke-RestMethod -Uri "https://localhost:7001/api/permissions/code/$perm" -Headers @{Authorization="Bearer $token"}
    if ($response -eq $null) {
        Write-Host "MISSING: $perm" -ForegroundColor Red
    } else {
        Write-Host "OK: $perm" -ForegroundColor Green
    }
}
```

**STEP 48: Test role-permission mappings**

```sql
-- Verify Doctor has 15 permissions
SELECT r."Name", COUNT(rp."PermissionId") 
FROM "AspNetRoles" r
JOIN role_permissions rp ON r."Id" = rp."RoleId"
WHERE r."Name" = 'Doctor' AND rp.status = 'active'
GROUP BY r."Name";
-- Expected: 15

-- Verify System Admin has all 297
-- Expected: 297
```

**STEP 49: Performance testing**

```powershell
# Load test permission checking
ab -n 1000 -c 10 -H "Authorization: Bearer $token" "https://localhost:7001/api/permissions/check?code=patient.patient_record.read"
# Expected: < 100ms average
```

---

### Week 11: Frontend Testing + Integration

**STEP 50: E2E test - Full RBAC flow**

```typescript
// Playwright test
test('Complete RBAC flow', async ({ page }) => {
  // 1. Login as admin
  await page.goto('http://localhost:3000/auth/login');
  await page.fill('[name=username]', 'admin');
  await page.fill('[name=password]', 'password');
  await page.click('button[type=submit]');
  
  // 2. Navigate to roles
  await page.click('text=Roles');
  await expect(page).toHaveURL('/dashboard/admin/roles');
  
  // 3. Edit Doctor role
  await page.click('text=Doctor >> .. >> text=Edit');
  
  // 4. Verify 15 permissions assigned
  const checkedPermissions = await page.$$('input[type=checkbox]:checked');
  expect(checkedPermissions.length).toBe(15);
  
  // 5. Add new permission
  await page.click('text=patient.patient_preferences.read');
  await page.click('text=Save Permissions');
  
  // 6. Verify saved
  await expect(page.locator('text=Permissions updated')).toBeVisible();
});
```

---

## WEEK 12: POLISH + DOCUMENTATION

**STEP 51: Update README.md**

Add RBAC/ABAC implementation details, 297 permissions list, 20 roles.

**STEP 52: Create API documentation**

Document all new endpoints in Swagger/OpenAPI.

**STEP 53: Create user guide**

PDF guide: "How to manage permissions and roles in Hospital Portal"

**STEP 54: Performance optimization**

- Cache permission lookups
- Optimize document access checks
- Index tuning

**STEP 55: Final validation**

Run through all 50 test cases from RBAC-ABAC document (STEP 48-55).

---

## 📊 SUMMARY

### Total Work Breakdown

| Phase | Steps | Duration | Deliverables |
|-------|-------|----------|--------------|
| **Week 1** | 1-9 | 5 days | Phase 4 enabled, 297 permissions created |
| **Week 2** | 10-16 | 5 days | 20 roles created, permissions assigned |
| **Week 3** | 17-24 | 5 days | 4 new tables, enhancements |
| **Week 4** | 25-31 | 5 days | Multi-dept + Patient upload APIs |
| **Week 5-7** | 32-39 | 15 days | Complete RBAC UI (Permissions, Roles, Docs) |
| **Week 8-9** | 40-46 | 10 days | Document types + access rules seeded |
| **Week 10-11** | 47-50 | 10 days | Testing + validation |
| **Week 12** | 51-55 | 5 days | Polish + documentation |

**Total**: **55 Steps** | **12 Weeks** | **60 Days**

### Final Deliverables

✅ **297 Permissions** - All granular CRUD permissions created  
✅ **20 Roles** - All roles with appropriate permission mappings  
✅ **99 Tables** - 4 new tables + enhancements  
✅ **186 APIs** - 178 (Phase 4 enabled) + 8 new (multi-dept + patient upload)  
✅ **Complete RBAC UI** - Permission, Role, Document Sharing management  
✅ **9 Document Types** - With cross-department access rules  
✅ **Multi-Department Access** - Users can belong to multiple departments  
✅ **Audit Logging** - All document access tracked  
✅ **Testing** - All 50+ test cases validated  
✅ **Documentation** - Complete user guides + API docs

---

**Implementation Plan Version**: 1.0  
**Based On**: RBAC-ABAC-Complete-Permissions.md V3.0  
**Created**: November 10, 2025  
**Status**: READY TO START - Begin with STEP 1 (Day 1)
