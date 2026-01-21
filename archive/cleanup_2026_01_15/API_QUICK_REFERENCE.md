# Advanced Access Management API - Quick Reference

## 🔐 Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer {your-jwt-token}
```

## 🏢 Tenant Context
All endpoints automatically filter by tenant using the `X-Tenant-ID` header set by the frontend API client.

---

## 📋 Department Access Rules API

**Base URL:** `/api/admin/department-rules`

### 1. Get All Rules
```http
GET /api/admin/department-rules
```

**Query Parameters:**
- `search` (string, optional): Search by department code or name
- `isActive` (boolean, optional): Filter by active/inactive status
- `requiresApproval` (boolean, optional): Filter by approval requirement
- `requiresSupervisor` (boolean, optional): Filter by supervisor requirement
- `departmentType` (string, optional): Filter by department type

**Response 200:**
```json
[
  {
    "id": "uuid",
    "departmentId": "uuid",
    "departmentCode": "STD_DOCTOR",
    "departmentName": "Doctor",
    "departmentType": "Clinical",
    "requiresApproval": true,
    "approverRoles": "HOD, Admin",
    "requiresSupervisor": true,
    "supervisorRoles": "Senior Doctor, Consultant",
    "enableAutoExpiration": true,
    "maxAccessDurationDays": 30,
    "restrictedPermissions": "[\"CanDelete\",\"CanApprove\"]",
    "requiresJustification": true,
    "allowEmergencyAccess": true,
    "isActive": true,
    "status": "Active",
    "updatedAt": "2025-12-09T10:30:00Z",
    "updatedByName": "John Doe"
  }
]
```

### 2. Get Rule by ID
```http
GET /api/admin/department-rules/{ruleId}
```

**Response 200:**
```json
{
  "id": "uuid",
  "departmentId": "uuid",
  "departmentCode": "STD_DOCTOR",
  "departmentName": "Doctor",
  "departmentType": "Clinical",
  "requiresApproval": true,
  "approverRoles": [
    { "id": "uuid", "name": "HOD", "description": "Head of Department" },
    { "id": "uuid", "name": "Admin", "description": "System Administrator" }
  ],
  "requiresSupervisor": true,
  "supervisorRoles": [
    { "id": "uuid", "name": "Senior Doctor", "description": "Senior physician" }
  ],
  "enableAutoExpiration": true,
  "maxAccessDurationDays": 30,
  "restrictedPermissions": ["CanDelete", "CanApprove"],
  "requiresJustification": true,
  "minJustificationLength": 100,
  "allowEmergencyAccess": true,
  "emergencyRoles": [
    { "id": "uuid", "name": "Emergency Admin", "description": "Emergency access admin" }
  ],
  "isActive": true,
  "status": "Active",
  "createdAt": "2025-12-01T08:00:00Z",
  "createdByName": "Jane Smith",
  "updatedAt": "2025-12-09T10:30:00Z",
  "updatedByName": "John Doe"
}
```

### 3. Get Rule by Department ID
```http
GET /api/admin/department-rules/by-department/{departmentId}
```

**Response:** Same as Get Rule by ID

### 4. Create Rule
```http
POST /api/admin/department-rules
Content-Type: application/json
```

**Request Body:**
```json
{
  "departmentId": "uuid",
  "requiresApproval": true,
  "approverRoleIds": ["uuid1", "uuid2"],
  "requiresSupervisor": true,
  "supervisorRoleIds": ["uuid3"],
  "enableAutoExpiration": true,
  "maxAccessDurationDays": 30,
  "restrictedPermissions": ["CanDelete", "CanApprove"],
  "requiresJustification": true,
  "minJustificationLength": 100,
  "allowEmergencyAccess": true,
  "emergencyRoleIds": ["uuid4"],
  "isActive": true
}
```

**Response 201:** Same as Get Rule by ID

**Validation Rules:**
- `maxAccessDurationDays`: Must be between 1 and 90
- `departmentId`: Must exist in database
- One rule per department per tenant

### 5. Update Rule
```http
PUT /api/admin/department-rules/{ruleId}
Content-Type: application/json
```

**Request Body:** Same as Create Rule

**Response 200:** Same as Get Rule by ID

### 6. Delete Rule
```http
DELETE /api/admin/department-rules/{ruleId}
```

**Response 204:** No Content (soft delete)

### 7. Get Statistics
```http
GET /api/admin/department-rules/stats
```

**Response 200:**
```json
{
  "totalRules": 15,
  "activeRules": 12,
  "inactiveRules": 3,
  "rulesRequiringApproval": 8,
  "rulesRequiringSupervisor": 5,
  "rulesWithAutoExpiration": 10,
  "rulesByDepartmentType": {
    "Clinical": 8,
    "Diagnostics": 3,
    "Administrative": 4
  }
}
```

---

## 👨‍⚕️ Supervised Access API

**Base URL:** `/api/admin/supervised-access`

### 1. Get All Supervised Users
```http
GET /api/admin/supervised-access/users
```

**Query Parameters:**
- `search` (string, optional): Search by name, email, username
- `supervisorId` (uuid, optional): Filter by assigned supervisor
- `oversightLevel` (string, optional): Filter by oversight level (Close, Moderate, Light)
- `requiresCoSignature` (boolean, optional): Filter by co-signature requirement
- `status` (string, optional): Filter by status (Active, On Leave, Graduated, Inactive)
- `minComplianceScore` (integer, optional): Filter by minimum compliance score (0-100)

**Response 200:**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "userName": "dr.smith",
    "fullName": "Dr. John Smith",
    "email": "john.smith@hospital.com",
    "qualification": "MBBS",
    "yearsOfExperience": 2,
    "assignedSupervisorId": "uuid",
    "supervisorName": "Dr. Jane Doe",
    "oversightLevel": "Close",
    "requiresCoSignature": true,
    "complianceScore": 95,
    "pendingApprovals": 3,
    "status": "Active",
    "supervisionStartDate": "2025-01-01T00:00:00Z",
    "supervisionEndDate": "2026-01-01T00:00:00Z"
  }
]
```

### 2. Get Supervised User by ID
```http
GET /api/admin/supervised-access/users/{id}
```

**Response 200:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "userName": "dr.smith",
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@hospital.com",
  "qualification": "MBBS",
  "yearsOfExperience": 2,
  "assignedSupervisorId": "uuid",
  "supervisorName": "Dr. Jane Doe",
  "supervisorEmail": "jane.doe@hospital.com",
  "supervisorSpecialty": "General Surgery",
  "oversightLevel": "Close",
  "requiresCoSignature": true,
  "supervisionStartDate": "2025-01-01T00:00:00Z",
  "supervisionEndDate": "2026-01-01T00:00:00Z",
  "complianceScore": 95,
  "lastComplianceCheck": "2025-12-09T10:00:00Z",
  "complianceNotes": "Excellent supervision compliance",
  "totalActivities": 100,
  "supervisedActivities": 95,
  "pendingApprovals": 3,
  "lastActivityDate": "2025-12-09T09:30:00Z",
  "status": "Active",
  "createdAt": "2025-01-01T08:00:00Z",
  "updatedAt": "2025-12-09T10:00:00Z"
}
```

### 3. Create Supervised User
```http
POST /api/admin/supervised-access/users
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "uuid",
  "assignedSupervisorId": "uuid",
  "oversightLevel": "Close",
  "requiresCoSignature": true,
  "supervisionStartDate": "2025-12-09T00:00:00Z",
  "supervisionEndDate": "2026-12-09T00:00:00Z",
  "complianceNotes": "Initial assignment for junior doctor"
}
```

**Response 201:** Same as Get Supervised User by ID

**Validation Rules:**
- `userId`: Must exist in database
- One supervision record per user per tenant
- Supervisor capacity validated (max 5 supervisees)
- Oversight level: "Close", "Moderate", or "Light"

### 4. Update Supervised User
```http
PUT /api/admin/supervised-access/users/{id}
Content-Type: application/json
```

**Request Body:** Same as Create Supervised User

**Response 200:** Same as Get Supervised User by ID

### 5. Delete Supervised User
```http
DELETE /api/admin/supervised-access/users/{id}
```

**Response 204:** No Content (soft delete, updates supervisor capacity)

### 6. Get Supervisor Capacities
```http
GET /api/admin/supervised-access/supervisors/capacity
```

**Response 200:**
```json
[
  {
    "supervisorUserId": "uuid",
    "supervisorName": "Dr. Jane Doe",
    "specialty": "General Surgery",
    "maxSupervisees": 5,
    "currentSupervisees": 3,
    "availableSlots": 2,
    "utilizationPercentage": 60.0,
    "averageComplianceScore": 92.5,
    "isActive": true,
    "status": "Active",
    "currentSupervisedUsers": [
      {
        "id": "uuid",
        "userId": "uuid",
        "userName": "dr.smith",
        "fullName": "Dr. John Smith",
        "email": "john.smith@hospital.com",
        "qualification": "MBBS",
        "complianceScore": 95,
        "oversightLevel": "Close",
        "status": "Active"
      }
    ]
  }
]
```

### 7. Get Statistics
```http
GET /api/admin/supervised-access/stats
```

**Response 200:**
```json
{
  "totalSupervisedUsers": 25,
  "activeSupervisedUsers": 20,
  "totalSupervisors": 8,
  "activeSupervisors": 7,
  "totalPendingApprovals": 12,
  "averageComplianceScore": 91.5,
  "usersRequiringCoSignature": 15,
  "usersByOversightLevel": {
    "Close": 10,
    "Moderate": 8,
    "Light": 2
  },
  "usersByQualification": {
    "MBBS": 15,
    "BDS": 5,
    "Intern": 5
  }
}
```

### 8. Recalculate Compliance Score
```http
POST /api/admin/supervised-access/users/{id}/recalculate-compliance
```

**Response 200:**
```json
{
  "message": "Compliance score recalculated successfully"
}
```

**Algorithm:**
```
compliance_score = (supervised_activities / total_activities) * 100
```

---

## 🚨 Error Responses

### 400 Bad Request
```json
{
  "message": "Max access duration must be between 1 and 90 days"
}
```

### 404 Not Found
```json
{
  "message": "Department access rule not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "An error occurred while processing the request"
}
```

---

## 📊 Data Types

### Oversight Levels
- `"Close"` - Every case requires supervision
- `"Moderate"` - Selected cases require supervision
- `"Light"` - Review only, minimal direct supervision

### Supervised User Status
- `"Active"` - Currently under supervision
- `"On Leave"` - Temporarily not working
- `"Graduated"` - Completed supervision program
- `"Inactive"` - Supervision ended or paused

### Supervisor Status
- `"Active"` - Currently supervising
- `"On Leave"` - Temporarily unavailable
- `"Full Capacity"` - Maximum supervisees reached
- `"Inactive"` - Not supervising

### Department Types
- `"Clinical"` - Direct patient care departments
- `"Diagnostics"` - Diagnostic and testing departments
- `"Administrative"` - Non-clinical support departments
- `"Pharmacy"` - Medication management
- `"Support"` - Support services

---

## 🔄 Typical Workflows

### Department Rule Management
1. GET `/api/admin/department-rules` - List all rules
2. GET `/api/admin/department-rules/by-department/{id}` - Check if rule exists
3. POST `/api/admin/department-rules` - Create rule if not exists
4. PUT `/api/admin/department-rules/{id}` - Update rule
5. GET `/api/admin/department-rules/stats` - View statistics

### Supervised User Management
1. GET `/api/admin/supervised-access/supervisors/capacity` - Check supervisor availability
2. POST `/api/admin/supervised-access/users` - Assign supervision
3. GET `/api/admin/supervised-access/users?supervisorId={id}` - View supervisor's supervisees
4. POST `/api/admin/supervised-access/users/{id}/recalculate-compliance` - Update compliance
5. PUT `/api/admin/supervised-access/users/{id}` - Reassign supervisor
6. GET `/api/admin/supervised-access/stats` - View overall statistics

---

## 🎯 Testing with cURL

### Test Department Rules
```bash
# Login
curl -X POST http://localhost:5073/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin123!"}'

# Get all rules (replace TOKEN)
curl -X GET http://localhost:5073/api/admin/department-rules \
  -H "Authorization: Bearer TOKEN" \
  -H "X-Tenant-ID: 11111111-1111-1111-1111-111111111111"

# Create rule
curl -X POST http://localhost:5073/api/admin/department-rules \
  -H "Authorization: Bearer TOKEN" \
  -H "X-Tenant-ID: 11111111-1111-1111-1111-111111111111" \
  -H "Content-Type: application/json" \
  -d '{
    "departmentId": "your-dept-uuid",
    "requiresApproval": true,
    "requiresSupervisor": true,
    "enableAutoExpiration": true,
    "maxAccessDurationDays": 30,
    "isActive": true
  }'
```

### Test Supervised Access
```bash
# Get all supervised users
curl -X GET http://localhost:5073/api/admin/supervised-access/users \
  -H "Authorization: Bearer TOKEN" \
  -H "X-Tenant-ID: 11111111-1111-1111-1111-111111111111"

# Get supervisor capacities
curl -X GET http://localhost:5073/api/admin/supervised-access/supervisors/capacity \
  -H "Authorization: Bearer TOKEN" \
  -H "X-Tenant-ID: 11111111-1111-1111-1111-111111111111"

# Create supervised user
curl -X POST http://localhost:5073/api/admin/supervised-access/users \
  -H "Authorization: Bearer TOKEN" \
  -H "X-Tenant-ID: 11111111-1111-1111-1111-111111111111" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "assignedSupervisorId": "supervisor-uuid",
    "oversightLevel": "Close",
    "requiresCoSignature": true
  }'
```

---

## 📚 Additional Resources

- **Swagger UI:** http://localhost:5073/swagger
- **Backend Summary:** BACKEND_IMPLEMENTATION_SUMMARY.md
- **Frontend Docs:** ADVANCED_ACCESS_MANAGEMENT_FEATURES.md
- **Database Schema:** migrations/advanced_access_management_tables.sql
