# Hospital Portal - Complete Project Guide

**Last Updated**: November 10, 2025  
**Version**: 2.0 - Consolidated Master Document

---

## 🎯 Quick Navigation

1. [What This Project Is](#what-this-project-is)
2. [Current Status](#current-status)
3. [Getting Started](#getting-started)
4. [Backend Architecture](#backend-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [Database Architecture](#database-architecture)
7. [What's Implemented (Complete)](#whats-implemented-complete)
8. [What's Pending (Sequential Plan)](#whats-pending-sequential-plan)
9. [How to Develop](#how-to-develop)
10. [Troubleshooting](#troubleshooting)

---

## What This Project Is

**Hospital Portal** is a multi-tenant healthcare management SaaS platform.

### Core Features
- **Multi-Tenant Architecture**: Complete tenant isolation with Row-Level Security (RLS)
- **Hybrid RBAC + ABAC**: Role-Based + Attribute-Based Access Control
- **HIPAA Compliant**: Soft deletes, audit logs, encryption-ready
- **Full Healthcare Management**: Patients, Appointments, Clinical Records, Departments
- **Admin Portal**: Users, Roles, Permissions, Branches, Organizations

### Technology Stack
- **Backend**: ASP.NET Core 8.0 (C#) | Entity Framework Core 9.0
- **Frontend**: Next.js 13.5.1 (App Router) | React 18 | TypeScript
- **Database**: Azure PostgreSQL 17.6
- **Auth**: ASP.NET Core Identity + JWT tokens
- **Package Manager**: pnpm workspaces (NOT npm)

---

## Current Status

### ✅ COMPLETE
- **Backend API**: 162 endpoints (100%)
- **Database**: 85 tables, HIPAA compliant (100%)
- **Frontend**: ~40% (Auth, Dashboard, Users, Branches, Tenants)

### ⏳ PENDING
- **Frontend**: 60% remaining (Roles, Permissions, Departments, Patients, Appointments, etc.)
- **Testing**: 95% (Unit, Integration, E2E)
- **Deployment**: 100% (Azure setup, CI/CD)

**Timeline**: 8-12 weeks to production-ready

---

## Getting Started

### Prerequisites
- .NET 8.0 SDK
- Node.js 18+ with pnpm
- PostgreSQL client (optional)
- VS Code or Visual Studio

### Quick Start Commands

```powershell
# Backend (runs on https://localhost:7001)
cd microservices/auth-service/AuthService
dotnet build
dotnet run

# Frontend (runs on http://localhost:3000)
cd apps/hospital-portal-web
pnpm install
pnpm dev

# Use consolidated scripts for database migration, seeding and testing
# Examples:
# - Quick full setup: run_all.ps1 -QuickSeed
# - Run migrations only: run_all.ps1 -RunMigrations
# - Run tests only: run_all.ps1 -RunTests
# - Seed permissions: run_all.ps1 -SeedPermissions
pwsh -ExecutionPolicy Bypass -File .\consolidated\run_all.ps1 -QuickSeed
```

### First Login
- Open `https://localhost:7001/swagger` for API docs
- Login with admin credentials (check database)
- Copy JWT token → Click "Authorize" → Enter `Bearer {token}`

---

## Backend Architecture

### Project Structure
```
microservices/auth-service/AuthService/
├── Controllers/          # API endpoints (162 total)
├── Services/            # Business logic layer
├── Models/              # DTOs and domain models
├── Context/             # EF Core DbContext
├── Middleware/          # Custom middleware
└── Program.cs           # App configuration
```

### Key Patterns

**Service Layer Pattern**:
```csharp
// 1. Define interface in Services/
public interface ITenantService {
    Task<List<TenantDto>> GetAllAsync();
}

// 2. Implement in Services/
public class TenantService : ITenantService {
    private readonly AppDbContext _context;
    // Implementation...
}

// 3. Register in Program.cs
builder.Services.AddScoped<ITenantService, TenantService>();
```

**Column Mapping (CRITICAL)**:
```csharp
// Database uses snake_case, C# uses PascalCase
// MUST map explicitly in AppDbContext.OnModelCreating()
entity.ToTable("tenant");
entity.Property(e => e.Id).HasColumnName("id");
entity.Property(e => e.Name).HasColumnName("name");
entity.Property(e => e.TenantCode).HasColumnName("tenant_code");
// etc. - NEVER skip mappings!
```

### API Endpoints Summary (162 Total)

**Phase 1 - Core (24 endpoints)**:
- Auth (6): register, login, refresh-token, logout, verify-email, forgot-password
- Tenants (5): CRUD + list with pagination
- Patients (6): CRUD + search
- Appointments (7): CRUD + status management + doctor schedule

**Phase 2 - RBAC (40 endpoints)**:
- Users (8): CRUD + search + status + reset password
- Roles (13): CRUD + clone + user assignment + permissions + bulk ops + stats
- Permissions (19): CRUD + categories + bulk assign/remove + check + matrix + seed

**Phase 3 - Organization (50 endpoints)**:
- Organizations (12): CRUD + branches + hierarchy + statistics
- Branches (13): CRUD + departments + users + stats + operational metrics
- Departments (15): CRUD + hierarchy + sub-departments + staff + budget
- Dashboard (10): overview + appointments + patients + staff + financial + clinical

**Phase 4 - Advanced (48 endpoints)**:
- Document Sharing (16): ABAC - document types + access rules + bulk + check-access
- System Settings (14): configurations + bulk update + groups + import/export + history
- Bulk Operations (18): users + roles + permissions + status + import/export + jobs

---

## Frontend Architecture

### Project Structure
```
apps/hospital-portal-web/src/
├── app/                  # Next.js App Router pages
│   ├── auth/            # Login, forgot password
│   ├── dashboard/       # Main app pages
│   │   ├── admin/       # Admin pages (users, branches, etc.)
│   │   └── page.tsx     # Dashboard home
│   └── layout.tsx       # Root layout
├── components/          # React components
│   └── ui/              # Reusable UI components
├── lib/                 # Utilities
│   ├── api.ts           # Axios HTTP client
│   ├── api/             # API service layer
│   └── auth-store.ts    # Zustand auth state
└── hooks/               # Custom React hooks
```

### Key Patterns

**API Integration**:
```typescript
// 1. HTTP client auto-includes tenant ID + JWT
import { getApi } from '@/lib/api';

const api = getApi();
const response = await api.get('/tenants');
// Headers added automatically:
// - X-Tenant-ID: {current tenant}
// - Authorization: Bearer {token}
```

**State Management**:
- **Auth**: Zustand store (`auth-store.ts`) - token, tenant, user
- **Data Fetching**: React Query (planned)
- **Forms**: React Hook Form (planned)

**Component Structure**:
```typescript
// Reusable components in components/ui/
- StatCard.tsx          // Dashboard stat cards
- StatusBadge.tsx       // Color-coded status badges
- SearchFilter.tsx      // Search + multi-filter component
- EmptyState.tsx        // Empty list placeholder
```

---

## Database Architecture

### Multi-Tenant Architecture
- **RLS (Row-Level Security)** on all 96 tables
- Automatic tenant filtering via `current_tenant_id()` function
- Set via `X-Tenant-ID` header in API requests

### Standard Columns (All Tables)
```sql
id UUID PRIMARY KEY
tenant_id UUID NOT NULL  -- Multi-tenancy
created_at TIMESTAMP
updated_at TIMESTAMP
created_by_user_id UUID  -- Audit trail
updated_by_user_id UUID
deleted_at TIMESTAMP     -- Soft delete (HIPAA)
status VARCHAR           -- Active/Inactive/etc.
```

### Key Tables (96 Total)
**Identity** (ASP.NET): users, roles, AspNetUserRoles, etc.  
**Core**: tenant, organization, branch, department  
**Healthcare**: patient, appointment, clinical_examination, consent  
**Admin**: permission, role_permission, document_type, document_access_rule  
**System**: audit_log, system_configuration, failed_login_attempt

### Compliance (10/10 Score)
✅ UUID Keys: 95%  
✅ Timestamps: 89%  
✅ **Soft Deletes: 100%** (HIPAA requirement)  
✅ **RLS: 100%** (tenant isolation)  
✅ **Audit Trail: 100%** (28 triggers)  
✅ **Status: 100%**  
✅ Encryption Ready: 100% (pgcrypto)  
✅ Performance Indexes: 555 indexes

---

## What's Implemented (Complete)

### Backend - 162 API Endpoints ✅

All endpoints fully implemented, tested via Swagger, production-ready.

**See API endpoint list in "Backend Architecture" section above.**

Key Services:
- `JwtService` - Token generation/validation
- `TenantService` - Multi-tenant management
- `UserService` - User CRUD + enhancement
- `RoleService` - Role management
- `PermissionService` - Permission checking
- `PermissionManagementService` - Permission CRUD
- `OrganizationService` - Organization management
- `BranchService` - Branch management
- `DepartmentService` - Department management
- `PatientService` - Patient management
- `AppointmentService` - Appointment management
- `DashboardService` - Analytics
- `DocumentSharingService` - ABAC rules
- `SystemSettingsService` - Configuration
- `BulkOperationsService` - Bulk operations

### Database - 96 Tables ✅

All tables created, RLS enabled, audit triggers active, HIPAA compliant.

**Migration Scripts**:
- `MASTER_DATABASE_MIGRATIONS.sql` - All migrations consolidated
- `consolidated/run_all.ps1 -RunMigrations` - Automated execution
- `consolidated/run_all.ps1 -RunTests` - Validation (10/10 score achieved)
  
---

## Consolidation Summary
All primary setup and schema commands are consolidated in `consolidated/run_all.ps1` and `consolidated/ALL_DATABASE_SCRIPT.sql` to simplify on-boarding and reduce duplicated scripts.

If you need to inspect older or duplicated scripts (for debugging or history), they are preserved under `archive/ps1/` and `archive/sql/` and `archive/docs/`.

To run a one-command installation (migrations, seed, and tests):

```powershell
powershell -ExecutionPolicy Bypass -File .\consolidated\run_all.ps1 -QuickSeed
```

To run consolidated DB script directly via psql:

```bash
pSQL -U postgres -d hospitalportal -f consolidated/ALL_DATABASE_SCRIPT.sql
```

### Frontend - 40% Complete ✅

**Implemented Pages**:
- ✅ Login + Auth flow
- ✅ Dashboard with stats, activities, alerts
- ✅ User Management (list, create/edit, assign roles, reset password, suspend)
- ✅ Branch Management (list, create/edit multi-step form, filters)
- ✅ Tenant Management (list, create/edit, details)

**Reusable Components**:
- ✅ StatCard - Dashboard metrics
- ✅ StatusBadge - Status indicators
- ✅ SearchFilter - Search + multi-filter
- ✅ EmptyState - Empty list placeholder

---

## What's Pending (Sequential Plan)

### 🎯 **OPTION 3: HYBRID APPROACH (8 WEEKS) - SELECTED** ⭐

**Start Date**: November 11, 2025  
**Target Launch**: January 6, 2026  
**Strategy**: Focus on healthcare core + essential admin features

**📋 Quick Links**:
- **[IMPLEMENTATION_PLAN_8WEEKS.md](IMPLEMENTATION_PLAN_8WEEKS.md)** - Complete 8-week plan with daily tasks
- **[PENDING_IMPLEMENTATIONS.md](PENDING_IMPLEMENTATIONS.md)** - Detailed cross-check of what's done vs pending
- **[DAY1_APPOINTMENTS_GUIDE.md](DAY1_APPOINTMENTS_GUIDE.md)** - Day 1-2 quick start guide
- **[PROGRESS_TRACKER.md](PROGRESS_TRACKER.md)** - Daily progress tracking template

### Week-by-Week Summary

**WEEK 1-2: Healthcare Core (10 days)**
1. **Appointments Calendar** (2 days) - FullCalendar integration, month/week/day views
2. **Complete Patients** (3 days) - Multi-step form, medical history, documents
3. **Complete Examinations** (3 days) - Clinical workflow, diagnoses, treatment plans
4. **Buffer & Polish** (2 days)

**WEEK 3-4: Critical Admin Features (10 days)**
5. **Complete Roles** (2 days) - Permission assignment grid, role cloning
6. **Permissions Management** (3 days) - Permission matrix, bulk assignment
7. **System Settings** (3 days) - 6 tabs (general, email, security, HIPAA, backup, integrations)
8. **Buffer & Polish** (2 days)

**WEEK 5-6: Compliance & Security (10 days)**
9. **Audit Logs** (3 days) - Viewer, filters, export, compliance reports
10. **Document Sharing** (2 days) - ABAC policy builder, access management
11. **MFA & Profile** (2 days) - MFA enrollment wizard, profile settings
12. **Polish & Integration** (3 days)

**WEEK 7: Testing (5 days)**
13. **Backend Tests** (2 days) - 50+ unit tests, 60%+ coverage
14. **Frontend Tests** (2 days) - 30+ component tests
15. **E2E Tests** (1 day) - 5-8 critical flow tests

**WEEK 8: Deployment & Launch (5 days)**
16. **Azure Infrastructure** (2 days) - App Service, Static Web App, PostgreSQL, Key Vault
17. **CI/CD Pipelines** (2 days) - GitHub Actions, automated deployments
18. **Monitoring & Launch** (1 day) - Application Insights, docs, **🚀 PRODUCTION LAUNCH**

### Deferred Features (Post-Launch)
- Bulk operations (can do manually initially)
- Advanced reports builder (use basic queries)
- Notifications center (email fallback)
- Advanced analytics dashboard

### What's Already Complete ✅
- ✅ Backend: 162 API endpoints (100%)
- ✅ Database: 96 tables with HIPAA compliance (100%)
- ✅ Frontend: Login, Dashboard, Users, Branches, Tenants, Departments, Organizations (36%)

**See detailed breakdown in**:
- **[IMPLEMENTATION_PLAN_8WEEKS.md](IMPLEMENTATION_PLAN_8WEEKS.md)** for complete daily tasks
- **[PENDING_IMPLEMENTATIONS.md](PENDING_IMPLEMENTATIONS.md)** for comprehensive status report
    - Key Vault for secrets
    - Application Insights
    - CDN setup

14. **CI/CD Pipelines** (2 days)
    - GitHub Actions workflows
    - Build + Test + Deploy
    - Environment separation (Dev/Staging/Prod)
    - Database migrations automation

15. **Security Hardening** (2 days)
    - HTTPS enforcement
    - CORS lockdown
    - Rate limiting
    - JWT secret rotation
    - Database encryption

**WEEK 11-12: Documentation & Polish**
16. **Documentation** (1 week)
    - API documentation with examples
    - User manuals per module
    - Admin guide
    - Video tutorials

17. **Bug Fixes & Polish** (1 week)
    - Fix TypeScript warnings
    - Add loading states
    - Improve error handling
    - Performance optimization
    - Accessibility fixes

---

## How to Develop

### Adding a New API Endpoint

```csharp
// 1. Create DTO in Models/
public class NewEntityDto {
    public Guid Id { get; set; }
    public string Name { get; set; }
}

// 2. Add to DbContext
public DbSet<NewEntity> NewEntities { get; set; }

// 3. Map columns in OnModelCreating()
entity.ToTable("new_entity");
entity.Property(e => e.Id).HasColumnName("id");
entity.Property(e => e.Name).HasColumnName("name");

// 4. Create Service Interface
public interface INewEntityService {
    Task<List<NewEntityDto>> GetAllAsync(Guid tenantId);
}

// 5. Implement Service
public class NewEntityService : INewEntityService {
    // Implementation
}

// 6. Register in Program.cs
builder.Services.AddScoped<INewEntityService, NewEntityService>();

// 7. Create Controller
[ApiController]
[Route("api/[controller]")]
public class NewEntitiesController : ControllerBase {
    [HttpGet]
    public async Task<ActionResult<List<NewEntityDto>>> GetAll() {
        // Implementation
    }
}
```

### Adding a New Frontend Page

```typescript
// 1. Create page in app/dashboard/admin/new-entity/page.tsx
export default function NewEntityPage() {
  const [entities, setEntities] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      const api = getApi();
      const response = await api.get('/new-entities');
      setEntities(response.data);
    };
    fetchData();
  }, []);
  
  return (
    <div>
      <h1>New Entities</h1>
      {/* Implementation */}
    </div>
  );
}

// 2. Add API service in lib/api/new-entity.api.ts
export const newEntityApi = {
  getAll: async () => {
    const api = getApi();
    return api.get('/new-entities');
  },
  getById: async (id: string) => {
    const api = getApi();
    return api.get(`/new-entities/${id}`);
  },
  // etc.
};

// 3. Add navigation link in layout
<Link href="/dashboard/admin/new-entity">
  New Entities
</Link>
```

### Database Migrations

```powershell
# Add migration
cd microservices/auth-service/AuthService
dotnet ef migrations add AddNewEntityTable

# Apply migrations
dotnet ef database update

# Or use consolidated script
pwsh -ExecutionPolicy Bypass -File .\consolidated\run_all.ps1 -RunMigrations
```

---

## Testing

### End-to-End Permission Testing

**Quick Start**:
```powershell
# 1. Run setup helper
.\START_TESTING.ps1

# 2. Create test users in database
psql -U postgres -d hospitalportal -f create_test_users_for_testing.sql

# 3. Start backend
cd microservices\auth-service\AuthService
dotnet run

# 4. Open Swagger UI
# https://localhost:7001/swagger
```

**Test Users** (Password: `Test@123456`):
| Email | Role | Expected Access |
|-------|------|----------------|
| `admin@test.com` | System Admin | ✅ All 115 endpoints |
| `doctor@test.com` | Doctor | ✅ Medical, ❌ Admin |
| `nurse@test.com` | Nurse | ✅ Clinical, ❌ Admin |
| `receptionist@test.com` | Receptionist | ✅ Front Desk, ❌ Clinical/Admin |
| `labtech@test.com` | Lab Technician | ✅ Lab, ❌ Others |

**Testing Workflow**:
1. Login with test user → Get JWT token
2. Click "Authorize" in Swagger → Enter `Bearer {token}`
3. Test endpoints → Verify 200 OK or 403 Forbidden
4. Document results

**📚 Complete Guide**: [END_TO_END_TESTING_GUIDE.md](./END_TO_END_TESTING_GUIDE.md)

**Verification Scripts**:
- `verify_testing_readiness.sql` - Check environment setup
- `create_test_users_for_testing.sql` - Create 5 test users
- `START_TESTING.ps1` - Quick start helper

**Success Criteria**:
- ✅ Admin: 115/115 endpoints = 200 OK
- ✅ Doctor: Medical endpoints = 200, Admin = 403
- ✅ Receptionist: Front desk = 200, Others = 403
- ✅ Unauthenticated: All protected = 401

---

## Troubleshooting

### Common Issues

**1. Backend won't start**
- Check `appsettings.json` for valid connection string
- Verify PostgreSQL is accessible
- Check `dotnet --version` (need 8.0+)

**2. Frontend API calls fail (403)**
- Missing `X-Tenant-ID` header → Check `api.ts` interceptor
- Invalid JWT token → Re-login to get new token
- Check browser console for errors

**3. Database column mismatch errors**
- **Problem**: EF Core can't find column
- **Solution**: Check `AppDbContext.OnModelCreating()` for `HasColumnName()` mapping
- Database = snake_case, C# = PascalCase

**4. `npm install` breaks workspace**
- **Problem**: Used npm instead of pnpm
- **Solution**: Delete `node_modules`, `package-lock.json`, run `pnpm install`

**5. InMemory database used instead of PostgreSQL**
- **Problem**: Empty connection string in `appsettings.json`
- **Solution**: Add valid connection string to `DefaultConnection`

**6. Multi-tenant RLS not working**
- **Problem**: `X-Tenant-ID` header not set
- **Solution**: Ensure frontend `api.ts` includes tenant ID from auth store

**7. Soft delete not working**
- **Problem**: Using `RemoveRange()` or `ExecuteDeleteAsync()`
- **Solution**: Set `deleted_at = DateTime.UtcNow` instead

### Getting Help

1. Check `.github/copilot-instructions.md` for AI agent guidance
2. Review phase completion reports for implementation details
3. Check Swagger UI (`https://localhost:7001/swagger`) for API docs
4. Search `MASTER_DOCUMENTATION.md` for database architecture

---

## Important Files Reference

**Must Read First**:
- `.github/copilot-instructions.md` - AI agent quick start

**Database**:
- `MASTER_DATABASE_MIGRATIONS.sql` - All migrations
- `run_migrations.ps1` - Execute migrations
- `run_tests.ps1` - Validate compliance

**Backend**:
- `microservices/auth-service/AuthService/Program.cs` - App config
- `microservices/auth-service/AuthService/Context/AppDbContext.cs` - Database context
- `microservices/auth-service/AuthService/appsettings.json` - Configuration

**Frontend**:
- `apps/hospital-portal-web/src/lib/api.ts` - HTTP client
- `apps/hospital-portal-web/src/lib/auth-store.ts` - Auth state
- `apps/hospital-portal-web/package.json` - Dependencies

**Root**:
- `turbo.json` - Monorepo build config
- `pnpm-workspace.yaml` - Workspace definition
- `Hospital Portal.sln` - Visual Studio solution

---

**Last Updated**: November 10, 2025  
**Next Review**: After completing each development sprint  
**Status**: Production-Ready Backend | Frontend 40% | 8-12 weeks to completion
