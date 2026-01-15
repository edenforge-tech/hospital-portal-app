-- ============================================================================
-- PERMISSIONS MANAGEMENT BACKEND - REQUIRED ENDPOINTS
-- ============================================================================
-- This file documents the backend API endpoints needed for the unified
-- permissions management system to function completely.
--
-- Status: Many endpoints already exist, some need to be created
-- ============================================================================

-- ============================================================================
-- SECTION 1: EXISTING ENDPOINTS (Already Implemented ✅)
-- ============================================================================

-- 1.1 Permissions API
GET    /api/permissions                          -- Get all permissions
GET    /api/permissions/{id}                     -- Get specific permission
POST   /api/permissions                          -- Create permission (admin only)
PUT    /api/permissions/{id}                     -- Update permission
DELETE /api/permissions/{id}                     -- Delete permission

-- 1.2 Roles API
GET    /api/roles                                -- Get all roles
GET    /api/roles/with-user-count                -- Get roles with user counts
GET    /api/roles/{roleId}                       -- Get specific role
POST   /api/roles                                -- Create role
PUT    /api/roles/{roleId}                       -- Update role
DELETE /api/roles/{roleId}                       -- Delete role

-- 1.3 Role Permissions API
GET    /api/roles/{roleId}/permissions           -- Get permissions for a role
POST   /api/roles/{roleId}/permissions           -- Assign permissions to role
     -- Request body: { "permissionIds": ["guid1", "guid2", ...] }
DELETE /api/roles/{roleId}/permissions           -- Remove permissions from role
     -- Request body: { "permissionIds": ["guid1", "guid2", ...] }

-- 1.4 Users API
GET    /api/users                                -- Get all users (with pagination)
     -- Query params: pageNumber, pageSize
GET    /api/users/with-details                   -- Get users with role/dept info
GET    /api/users/{userId}                       -- Get specific user
POST   /api/users                                -- Create user
PUT    /api/users/{userId}                       -- Update user
POST   /api/users/{userId}/deactivate            -- Deactivate user

-- 1.5 Departments API
GET    /api/departments                          -- Get all departments
GET    /api/departments/with-staff-count         -- Get departments with staff counts
GET    /api/departments/{deptId}                 -- Get specific department


-- ============================================================================
-- SECTION 2: NEW ENDPOINTS REQUIRED (Need to be Implemented ❌)
-- ============================================================================

-- 2.1 User Permission Overrides
-- Purpose: Allow individual users to have additional permissions or revoke inherited ones

GET    /api/users/{userId}/permissions/overrides
-- Response: {
--   "userId": "guid",
--   "added": ["perm-guid-1", "perm-guid-2"],      -- Additional permissions
--   "revoked": ["perm-guid-3", "perm-guid-4"]     -- Revoked from role
-- }

POST   /api/users/{userId}/permissions/overrides
-- Request body: {
--   "added": ["perm-guid-1", "perm-guid-2"],
--   "revoked": ["perm-guid-3", "perm-guid-4"]
-- }
-- Response: { "success": true, "message": "Permission overrides updated" }


-- 2.2 User Department Access
-- Purpose: Manage which departments a user can access

GET    /api/users/{userId}/departments
-- Response: [
--   {
--     "id": "guid",
--     "userId": "guid",
--     "departmentId": "guid",
--     "departmentName": "Cardiology",
--     "subDepartmentId": null,
--     "isPrimary": true,
--     "accessType": "Full Access",
--     "effectiveFrom": "2025-01-01T00:00:00Z",
--     "effectiveTo": null,
--     "status": "Active"
--   }
-- ]

POST   /api/departments/{deptId}/users/{userId}/access
-- Request body: {
--   "isPrimary": false,
--   "accessType": "Full Access",  -- or "Read Only", "Limited"
--   "effectiveFrom": "2025-01-01T00:00:00Z",
--   "effectiveTo": null,
--   "subDepartmentIds": ["guid1", "guid2"]  -- Optional
-- }
-- Response: { "success": true, "accessId": "guid" }

DELETE /api/departments/{deptId}/users/{userId}/access
-- Response: { "success": true, "message": "Access revoked" }

PUT    /api/departments/{deptId}/users/{userId}/access
-- Request body: {
--   "isPrimary": true,
--   "accessType": "Full Access",
--   "effectiveTo": "2025-12-31T23:59:59Z"
-- }
-- Response: { "success": true }


-- 2.3 Bulk Operations
-- Purpose: Perform operations on multiple users/roles at once

POST   /api/permissions/bulk/assign-to-users
-- Request body: {
--   "userIds": ["guid1", "guid2", "guid3"],
--   "permissionIds": ["perm-guid-1", "perm-guid-2"],
--   "action": "add"  -- or "remove"
-- }
-- Response: {
--   "success": true,
--   "affectedUsers": 3,
--   "details": [
--     { "userId": "guid1", "success": true },
--     { "userId": "guid2", "success": true },
--     { "userId": "guid3", "success": false, "error": "User not found" }
--   ]
-- }

POST   /api/departments/bulk/grant-access
-- Request body: {
--   "userIds": ["guid1", "guid2"],
--   "departmentIds": ["dept-guid-1", "dept-guid-2"],
--   "accessType": "Full Access",
--   "effectiveFrom": "2025-01-01T00:00:00Z",
--   "includeSubDepartments": true
-- }
-- Response: {
--   "success": true,
--   "affectedUsers": 2,
--   "affectedDepartments": 2,
--   "totalAccessRecordsCreated": 4
-- }

POST   /api/users/copy-access
-- Request body: {
--   "sourceUserId": "guid-source",
--   "targetUserIds": ["guid1", "guid2", "guid3"],
--   "copyRole": true,
--   "copyPermissionOverrides": true,
--   "copyDepartmentAccess": true,
--   "copyPrimaryDepartment": false
-- }
-- Response: {
--   "success": true,
--   "affectedUsers": 3,
--   "copiedItems": {
--     "role": true,
--     "permissionOverrides": 5,
--     "departmentAccess": 3
--   }
-- }


-- 2.4 Permission Matrix
-- Purpose: Get complete view of all permissions and role assignments

GET    /api/permissions/matrix
-- Response: {
--   "permissions": [...],  -- All permissions
--   "roles": [...],        -- All roles
--   "assignments": {
--     "role-guid-1": ["perm-guid-1", "perm-guid-2"],
--     "role-guid-2": ["perm-guid-3", "perm-guid-4"]
--   }
-- }


-- 2.5 Department Access Matrix
-- Purpose: Get overview of which users have access to which departments

GET    /api/departments/{deptId}/users/access
-- Response: [
--   {
--     "userId": "guid",
--     "userName": "Dr. Sarah Johnson",
--     "email": "sarah@hospital.com",
--     "roleName": "Doctor",
--     "isPrimary": true,
--     "accessType": "Full Access",
--     "subDepartmentAccess": ["guid1", "guid2"]
--   }
-- ]

GET    /api/departments/access-matrix
-- Response: {
--   "departments": [...],
--   "users": [...],
--   "accessMatrix": {
--     "user-guid-1": {
--       "dept-guid-1": { "isPrimary": true, "accessType": "Full Access" },
--       "dept-guid-2": { "isPrimary": false, "accessType": "Read Only" }
--     }
--   }
-- }


-- ============================================================================
-- SECTION 3: DATABASE TABLES USED
-- ============================================================================

-- These tables must exist and have proper relationships:

-- 1. permissions (154 records)
-- 2. app_roles (21 records)
-- 3. role_permissions (junction table for many-to-many)
-- 4. user_department_access (22 records currently)
-- 5. department (14 main + 75 sub = 89 total)
-- 6. AspNetUsers (user accounts)

-- New table needed (if doesn't exist):
CREATE TABLE IF NOT EXISTS user_permission_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES "AspNetUsers"(Id),
    permission_id UUID NOT NULL REFERENCES permissions(id),
    override_type VARCHAR(20) NOT NULL CHECK (override_type IN ('add', 'revoke')),
    granted_by_user_id UUID REFERENCES "AspNetUsers"(Id),
    granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_user_permission_override UNIQUE (user_id, permission_id, override_type)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_permission_overrides_user 
ON user_permission_overrides(user_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_permission_overrides_tenant 
ON user_permission_overrides(tenant_id) WHERE deleted_at IS NULL;


-- ============================================================================
-- SECTION 4: BACKEND IMPLEMENTATION NOTES (C#)
-- ============================================================================

/*
Controller: UserPermissionOverridesController.cs

[HttpGet("users/{userId}/permissions/overrides")]
public async Task<ActionResult<UserPermissionOverridesDto>> GetUserPermissionOverrides(Guid userId)
{
    var overrides = await _context.UserPermissionOverrides
        .Where(o => o.UserId == userId && o.Status == "Active" && o.DeletedAt == null)
        .ToListAsync();
    
    var dto = new UserPermissionOverridesDto
    {
        UserId = userId,
        Added = overrides.Where(o => o.OverrideType == "add").Select(o => o.PermissionId).ToList(),
        Revoked = overrides.Where(o => o.OverrideType == "revoke").Select(o => o.PermissionId).ToList()
    };
    
    return Ok(dto);
}

[HttpPost("users/{userId}/permissions/overrides")]
public async Task<ActionResult> UpdateUserPermissionOverrides(
    Guid userId, 
    [FromBody] UpdatePermissionOverridesRequest request)
{
    using var transaction = await _context.Database.BeginTransactionAsync();
    
    try
    {
        // Remove existing overrides
        var existing = await _context.UserPermissionOverrides
            .Where(o => o.UserId == userId)
            .ToListAsync();
        
        _context.UserPermissionOverrides.RemoveRange(existing);
        
        // Add new "added" permissions
        foreach (var permId in request.Added)
        {
            _context.UserPermissionOverrides.Add(new UserPermissionOverride
            {
                UserId = userId,
                PermissionId = permId,
                OverrideType = "add",
                TenantId = _tenantContext.TenantId,
                GrantedByUserId = _currentUserService.UserId,
                GrantedAt = DateTime.UtcNow,
                Status = "Active"
            });
        }
        
        // Add new "revoked" permissions
        foreach (var permId in request.Revoked)
        {
            _context.UserPermissionOverrides.Add(new UserPermissionOverride
            {
                UserId = userId,
                PermissionId = permId,
                OverrideType = "revoke",
                TenantId = _tenantContext.TenantId,
                GrantedByUserId = _currentUserService.UserId,
                GrantedAt = DateTime.UtcNow,
                Status = "Active"
            });
        }
        
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
        
        return Ok(new { success = true, message = "Permission overrides updated" });
    }
    catch (Exception ex)
    {
        await transaction.RollbackAsync();
        _logger.LogError(ex, "Failed to update permission overrides for user {UserId}", userId);
        return StatusCode(500, new { error = "Failed to update permission overrides" });
    }
}
*/


-- ============================================================================
-- SECTION 5: AUTHORIZATION CHECKS
-- ============================================================================

-- All endpoints must verify:
-- 1. User is authenticated (JWT token valid)
-- 2. User has permission to perform the operation
-- 3. Tenant context is correct (RLS enforced)
-- 4. User cannot modify their own permissions (except via admin)

-- Required permissions for each endpoint:
-- GET operations: permission.view
-- POST/PUT operations: permission.manage
-- DELETE operations: permission.delete
-- Bulk operations: permission.bulk_manage (special permission)


-- ============================================================================
-- SECTION 6: TESTING CHECKLIST
-- ============================================================================

-- Unit Tests:
-- [ ] Get user permission overrides returns correct data
-- [ ] Add permission override creates record
-- [ ] Revoke permission override creates record
-- [ ] Bulk assign permissions affects all target users
-- [ ] Copy user access copies all selected items
-- [ ] Department access grant creates correct records
-- [ ] Permission matrix returns complete data

-- Integration Tests:
-- [ ] Frontend can save role permissions
-- [ ] Frontend can save user department access
-- [ ] Frontend can add/remove permission overrides
-- [ ] Bulk operations update database correctly
-- [ ] RLS policies enforce tenant isolation

-- Performance Tests:
-- [ ] Bulk assign to 100 users completes in <5 seconds
-- [ ] Permission matrix loads in <2 seconds
-- [ ] Department access matrix loads in <3 seconds

-- Security Tests:
-- [ ] Cannot modify permissions without permission.manage
-- [ ] Cannot access other tenant's data
-- [ ] Cannot bypass RLS policies
-- [ ] Audit trails created for all changes


-- ============================================================================
-- SECTION 7: DEPLOYMENT PLAN
-- ============================================================================

-- Phase 1: Create new table (if needed)
-- Execute: user_permission_overrides table creation script

-- Phase 2: Deploy backend controllers
-- Deploy: UserPermissionOverridesController
-- Deploy: BulkOperationsController
-- Deploy: DepartmentAccessController

-- Phase 3: Test endpoints
-- Run: Postman collection or automated tests
-- Verify: All endpoints return expected responses

-- Phase 4: Deploy frontend
-- Deploy: Updated permissions-new page
-- Test: End-to-end flows

-- Phase 5: Monitor and iterate
-- Monitor: API performance and error rates
-- Collect: User feedback
-- Iterate: Fix bugs and add improvements


-- ============================================================================
-- END OF DOCUMENT
-- ============================================================================
