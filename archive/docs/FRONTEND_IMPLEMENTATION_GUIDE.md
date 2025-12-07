# Frontend Implementation Guide - Step 9
**Project**: Hospital Portal
**Date**: 2025-01-20
**Status**: Step 9 - Frontend Updates for Roles, Departments, Branches

---

## Overview

This document outlines the frontend changes required to display user roles, departments, branches, and staff counts in the Admin Portal. All data is ready in the database - now we surface it in the UI.

---

## Database Status ✅

### Completed:
1. ✅ **Role Assignments**: 70 users → 31 roles (71 total assignments, admin has 2 roles)
2. ✅ **Department Mappings**: 70 users → 13 departments (SQL ready: `insert_department_mappings.sql`)
3. ✅ **Sub-Department Hierarchy**: 20 sub-departments under 8 parents (SQL ready: `create_subdepartments.sql`)
4. ✅ **Branch Assignments**: 70 users → 6 branches (SQL ready: `insert_branch_assignments.sql`)

### Pending Execution:
```sql
-- Execute in PostgreSQL (psql):
\i insert_department_mappings.sql   -- 70 dept mappings
\i create_subdepartments.sql        -- 20 sub-depts
\i insert_branch_assignments.sql    -- 70 branch mappings
```

---

## Frontend Changes Required

### A. `/admin/users` Page Updates

**File**: `apps/hospital-portal-web/src/app/(dashboard)/admin/users/page.tsx`

#### 1. Update User Data Fetching

**Current**: Basic user list
**Required**: Include roles, departments, branches in API response

```typescript
// Add to UserDTO or create enriched response
interface UserWithDetails {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: string;
  status: string;
  roles: string[];              // NEW: Array of role names
  primaryDepartment: string;     // NEW: Primary dept name
  departments: string[];         // NEW: All dept names
  branch: string;                // NEW: Primary branch name
}
```

#### 2. Update Table Columns

```tsx
<DataTable
  columns={[
    { header: 'User Name', accessor: 'userName' },
    { header: 'Name', accessor: row => `${row.firstName} ${row.lastName}` },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Roles', 
      accessor: row => row.roles.map(r => (
        <Badge key={r} variant="secondary">{r}</Badge>
      ))
    },
    { 
      header: 'Department', 
      accessor: row => row.primaryDepartment 
    },
    { 
      header: 'Branch', 
      accessor: row => row.branch 
    },
    { 
      header: 'Status', 
      accessor: row => (
        <Badge variant={row.status === 'Active' ? 'success' : 'default'}>
          {row.status}
        </Badge>
      )
    }
  ]}
  data={users}
/>
```

#### 3. Add Filters

```tsx
const [filters, setFilters] = useState({
  role: '',
  department: '',
  branch: '',
  status: 'all'
});

<div className="flex gap-4 mb-4">
  <Select
    label="Filter by Role"
    value={filters.role}
    onChange={(value) => setFilters({ ...filters, role: value })}
    options={roles.map(r => ({ value: r.id, label: r.name }))}
  />
  <Select
    label="Filter by Department"
    value={filters.department}
    onChange={(value) => setFilters({ ...filters, department: value })}
    options={departments.map(d => ({ value: d.id, label: d.name }))}
  />
  <Select
    label="Filter by Branch"
    value={filters.branch}
    onChange={(value) => setFilters({ ...filters, branch: value })}
    options={branches.map(b => ({ value: b.id, label: b.name }))}
  />
</div>
```

#### 4. Backend API Enhancement

**File**: `microservices/auth-service/AuthService/Controllers/UsersController.cs`

Add new endpoint:

```csharp
[HttpGet]
[RequirePermission("user.view")]
public async Task<IActionResult> GetUsersWithDetails()
{
    var users = await _context.Users
        .Where(u => u.TenantId == TenantId && u.DeletedAt == null)
        .Select(u => new {
            u.Id,
            u.UserName,
            u.FirstName,
            u.LastName,
            u.Email,
            u.UserType,
            u.Status,
            Roles = _context.UserRoles
                .Where(ur => ur.UserId == u.Id)
                .Join(_context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name)
                .ToList(),
            Departments = _context.UserDepartments
                .Where(ud => ud.UserId == u.Id && ud.DeletedAt == null)
                .Join(_context.Departments, ud => ud.DepartmentId, d => d.Id, (ud, d) => new {
                    d.DepartmentName,
                    ud.IsPrimary
                })
                .ToList(),
            Branch = _context.UserBranches
                .Where(ub => ub.UserId == u.Id && ub.IsPrimary && ub.DeletedAt == null)
                .Join(_context.Branches, ub => ub.BranchId, b => b.Id, (ub, b) => b.Name)
                .FirstOrDefault()
        })
        .ToListAsync();

    return Ok(users);
}
```

---

### B. `/admin/departments` Page Updates

**File**: `apps/hospital-portal-web/src/app/(dashboard)/admin/departments/page.tsx`

#### 1. Add Staff Count Column

```tsx
<DataTable
  columns={[
    { header: 'Department Code', accessor: 'departmentCode' },
    { header: 'Department Name', accessor: 'departmentName' },
    { header: 'Type', accessor: 'departmentType' },
    { 
      header: 'Staff Count', 
      accessor: row => (
        <Badge variant="info">{row.staffCount} staff</Badge>
      )
    },
    { 
      header: 'Parent Department', 
      accessor: row => row.parentDepartmentName || '-' 
    },
    { header: 'Status', accessor: 'status' }
  ]}
  data={departments}
/>
```

#### 2. Hierarchical Display

```tsx
// Group by parent
const parentDepts = departments.filter(d => !d.parentDepartmentId);
const subDepts = departments.filter(d => d.parentDepartmentId);

<Accordion>
  {parentDepts.map(parent => (
    <AccordionItem key={parent.id} title={`${parent.departmentName} (${parent.staffCount} staff)`}>
      <ul>
        {subDepts
          .filter(sub => sub.parentDepartmentId === parent.id)
          .map(sub => (
            <li key={sub.id}>
              {sub.departmentName} ({sub.staffCount} staff)
            </li>
          ))
        }
      </ul>
    </AccordionItem>
  ))}
</Accordion>
```

#### 3. Backend API Enhancement

```csharp
[HttpGet]
[RequirePermission("department.view")]
public async Task<IActionResult> GetDepartmentsWithStaffCount()
{
    var departments = await _context.Departments
        .Where(d => d.TenantId == TenantId && d.DeletedAt == null)
        .Select(d => new {
            d.Id,
            d.DepartmentCode,
            d.DepartmentName,
            d.DepartmentType,
            d.Status,
            d.ParentDepartmentId,
            ParentDepartmentName = _context.Departments
                .Where(p => p.Id == d.ParentDepartmentId)
                .Select(p => p.DepartmentName)
                .FirstOrDefault(),
            StaffCount = _context.UserDepartments
                .Count(ud => ud.DepartmentId == d.Id && ud.DeletedAt == null)
        })
        .OrderBy(d => d.DepartmentName)
        .ToListAsync();

    return Ok(departments);
}
```

---

### C. `/admin/roles` Page Updates

**File**: `apps/hospital-portal-web/src/app/(dashboard)/admin/roles/page.tsx`

#### 1. Add User Count Column

```tsx
<DataTable
  columns={[
    { header: 'Role Name', accessor: 'name' },
    { header: 'Description', accessor: 'description' },
    { 
      header: 'Users Assigned', 
      accessor: row => (
        <Badge variant="info">{row.userCount} users</Badge>
      )
    },
    { header: 'Status', accessor: 'status' }
  ]}
  data={roles}
/>
```

#### 2. Expandable User List

```tsx
<Accordion>
  {roles.map(role => (
    <AccordionItem 
      key={role.id} 
      title={`${role.name} (${role.userCount} users)`}
    >
      <ul>
        {role.users.map(user => (
          <li key={user.id}>
            {user.firstName} {user.lastName} ({user.email})
          </li>
        ))}
      </ul>
    </AccordionItem>
  ))}
</Accordion>
```

#### 3. Backend API Enhancement

```csharp
[HttpGet]
[RequirePermission("role.view")]
public async Task<IActionResult> GetRolesWithUserCount()
{
    var roles = await _context.Roles
        .Where(r => r.TenantId == TenantId && r.DeletedAt == null)
        .Select(r => new {
            r.Id,
            r.Name,
            r.Description,
            r.Status,
            UserCount = _context.UserRoles.Count(ur => ur.RoleId == r.Id),
            Users = _context.UserRoles
                .Where(ur => ur.RoleId == r.Id)
                .Join(_context.Users, ur => ur.UserId, u => u.Id, (ur, u) => new {
                    u.Id,
                    u.FirstName,
                    u.LastName,
                    u.Email
                })
                .Take(10) // Limit to 10 for performance
                .ToList()
        })
        .OrderBy(r => r.Name)
        .ToListAsync();

    return Ok(roles);
}
```

---

### D. Dashboard Widget Updates

**File**: `apps/hospital-portal-web/src/app/(dashboard)/page.tsx`

#### Replace Hardcoded Counts

```tsx
// Before:
<StatsCard title="Total Staff" value="70" />

// After:
const [stats, setStats] = useState({
  totalStaff: 0,
  totalDepartments: 0,
  totalRoles: 0,
  totalBranches: 0
});

useEffect(() => {
  const fetchStats = async () => {
    const api = getApi();
    const response = await api.get('/dashboard/stats');
    setStats(response.data);
  };
  fetchStats();
}, []);

<StatsCard title="Total Staff" value={stats.totalStaff.toString()} />
```

#### Add Distribution Charts

```tsx
<Card title="Staff by Department">
  <BarChart
    data={departmentStats.map(d => ({
      name: d.departmentName,
      value: d.staffCount
    }))}
  />
</Card>

<Card title="Staff by Role">
  <PieChart
    data={roleStats.map(r => ({
      name: r.roleName,
      value: r.userCount
    }))}
  />
</Card>

<Card title="Staff by Branch">
  <BarChart
    data={branchStats.map(b => ({
      name: b.branchName,
      value: b.staffCount
    }))}
  />
</Card>
```

#### Backend Dashboard API

```csharp
[HttpGet("dashboard/stats")]
[RequirePermission("dashboard.view")]
public async Task<IActionResult> GetDashboardStats()
{
    var tenantId = TenantId;

    var stats = new {
        TotalStaff = await _context.Users
            .CountAsync(u => u.TenantId == tenantId && u.DeletedAt == null),
        TotalDepartments = await _context.Departments
            .CountAsync(d => d.TenantId == tenantId && d.DeletedAt == null),
        TotalRoles = await _context.Roles
            .CountAsync(r => r.TenantId == tenantId && r.DeletedAt == null),
        TotalBranches = await _context.Branches
            .CountAsync(b => b.TenantId == tenantId && b.DeletedAt == null),
        DepartmentStats = await _context.Departments
            .Where(d => d.TenantId == tenantId && d.DeletedAt == null)
            .Select(d => new {
                d.DepartmentName,
                StaffCount = _context.UserDepartments
                    .Count(ud => ud.DepartmentId == d.Id && ud.DeletedAt == null)
            })
            .ToListAsync(),
        RoleStats = await _context.Roles
            .Where(r => r.TenantId == tenantId && r.DeletedAt == null)
            .Select(r => new {
                r.Name,
                UserCount = _context.UserRoles.Count(ur => ur.RoleId == r.Id)
            })
            .ToListAsync(),
        BranchStats = await _context.Branches
            .Where(b => b.TenantId == tenantId && b.DeletedAt == null)
            .Select(b => new {
                b.Name,
                StaffCount = _context.UserBranches
                    .Count(ub => ub.BranchId == b.Id && ub.DeletedAt == null)
            })
            .ToListAsync()
    };

    return Ok(stats);
}
```

---

## Implementation Checklist

### Backend Tasks:
- [ ] Add `GetUsersWithDetails()` endpoint to `UsersController.cs`
- [ ] Add `GetDepartmentsWithStaffCount()` endpoint to `DepartmentsController.cs`
- [ ] Add `GetRolesWithUserCount()` endpoint to `RolesController.cs`
- [ ] Add `GetDashboardStats()` endpoint to `DashboardController.cs` (or create new controller)
- [ ] Test all endpoints in Swagger
- [ ] Rebuild backend: `dotnet build`

### Frontend Tasks:
- [ ] Update `/admin/users/page.tsx`:
  - Fetch enriched user data
  - Add Roles, Department, Branch columns
  - Add filters for role, department, branch
- [ ] Update `/admin/departments/page.tsx`:
  - Add Staff Count column
  - Implement hierarchical display (accordion)
  - Add click-to-view staff list
- [ ] Update `/admin/roles/page.tsx`:
  - Add User Count column
  - Implement expandable user list
- [ ] Update `/page.tsx` (Dashboard):
  - Replace hardcoded counts with API data
  - Add department distribution chart
  - Add role distribution chart
  - Add branch staffing overview
- [ ] Test all pages with real data

### Database Tasks:
- [ ] Execute `insert_department_mappings.sql` (70 dept mappings)
- [ ] Execute `create_subdepartments.sql` (20 sub-depts)
- [ ] Execute `insert_branch_assignments.sql` (70 branch mappings)
- [ ] Verify data with SQL queries

---

## SQL Execution Commands

```powershell
# Connect to PostgreSQL
$env:PGPASSWORD = "your-password"
psql -h localhost -U postgres -d hospitalportal

# Execute scripts
\i insert_department_mappings.sql
\i create_subdepartments.sql
\i insert_branch_assignments.sql

# Verify counts
SELECT COUNT(*) FROM user_department_access WHERE deleted_at IS NULL;  -- Should be 70
SELECT COUNT(*) FROM department WHERE parent_department_id IS NOT NULL; -- Should be 20
SELECT COUNT(*) FROM user_branch_access WHERE deleted_at IS NULL;      -- Should be 70
```

---

## Expected Results

### Users Page:
- 70 users displayed with roles, departments, branches
- Filters working for role, department, branch
- Status badges showing active/inactive

### Departments Page:
- 33 total departments (13 parent + 20 sub)
- Staff counts showing actual assignments (e.g., Optical Shop: 22, Cataract Surgery: 21)
- Hierarchical view with expandable sub-departments

### Roles Page:
- 31 active roles with user counts
- Top roles: Ophthalmologist (10), Optometrist (8), Ophthalmic Nurse (6)
- Expandable user lists for each role

### Dashboard:
- Total Staff: 70
- Total Departments: 33
- Total Roles: 50
- Total Branches: 6
- Charts showing distribution across departments, roles, branches

---

## Notes

1. **Performance**: For large datasets (100+ users), implement pagination and lazy loading for user lists
2. **Caching**: Cache department/role/branch lists since they change infrequently
3. **Real-time Updates**: Consider WebSocket for live staff count updates
4. **Export**: Add CSV export for user lists with all details
5. **Bulk Actions**: Implement bulk assign/revoke for roles, departments, branches

---

## Next Steps After Frontend Completion

1. **Testing**: Test all filters, searches, and bulk actions
2. **Permissions**: Verify RBAC permissions for all endpoints
3. **Audit Logs**: Implement audit logging for assignment changes
4. **Notifications**: Add email notifications for role/dept/branch changes
5. **Documentation**: Update user manual with new features
6. **Deployment**: Deploy to staging for UAT

---

## Files Generated

- ✅ `insert_department_mappings.sql` - 70 user-department assignments
- ✅ `create_subdepartments.sql` - 20 sub-department hierarchy
- ✅ `insert_branch_assignments.sql` - 70 user-branch assignments
- ✅ `DEPARTMENT_ASSIGNMENT_SUMMARY.md` - Step 6 documentation
- ✅ `FRONTEND_IMPLEMENTATION_GUIDE.md` - This file (Step 9)

---

**Status**: Ready for Frontend Implementation
**Estimated Time**: 4-6 hours for full implementation
**Priority**: High - Completes Phase 2 user management features
