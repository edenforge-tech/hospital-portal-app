# Hospital Portal - AI Coding Agent Instructions

## Project Overview
**Hospital Portal** is a multi-tenant healthcare management SaaS platform built with ASP.NET Core 8.0 backend and Next.js frontend. The system implements **hybrid RBAC + ABAC** security with Row-Level Security (RLS), targeting **HIPAA compliance** for healthcare data.

## Architecture

### Monorepo Structure (pnpm + Turbo)
- **Backend**: `microservices/auth-service/AuthService/` - ASP.NET Core 8.0 service with 162 endpoints
- **Frontend**: `apps/hospital-portal-web/` - Next.js 13.5.1 with App Router (~40% complete)
- **Packages**: `packages/*` - Shared code (currently empty)
- **Root**: Workspace configuration + SQL migration scripts

### Key Technology Decisions
- **Database**: Azure PostgreSQL 17.6 with snake_case for custom tables, MixedCase for ASP.NET Identity tables
- **ORM**: Entity Framework Core 9.0 with explicit column mappings via `HasColumnName()`
- **Auth**: ASP.NET Core Identity + JWT (see `appsettings.json` for config)
- **Multi-tenancy**: Tenant isolation via PostgreSQL RLS policies + `current_tenant_id()` function
- **Package Manager**: pnpm workspaces (NOT npm/yarn)

## Critical Build & Run Commands

### Backend (PowerShell on Windows)
```powershell
cd "microservices/auth-service/AuthService"
dotnet build                    # Build service
dotnet run                      # Run on http://localhost:5073 (HTTP) or https://localhost:7285 (HTTPS)
dotnet ef migrations add Name   # Add EF Core migration
dotnet ef database update       # Apply migrations
```

### Frontend
```powershell
cd apps/hospital-portal-web
pnpm install                    # Install deps (NOT npm install!)
pnpm dev                        # Dev server on localhost:3000
pnpm build                      # Production build
```

### Workspace Root
```powershell
pnpm install                    # Install all workspace deps
turbo dev                       # Run all dev servers
turbo build                     # Build all apps
```

### Database Operations
```powershell
# Use the consolidated script at the root for database operations
pwsh -ExecutionPolicy Bypass -File .\consolidated\run_all.ps1 -RunMigrations    # Execute all SQL migrations (Azure PostgreSQL)
## Database Conventions

- **Identity tables**: MixedCase (`AspNetUsers`, `AspNetRoles`) but aliased to lowercase in EF
- **ALL entities** require explicit column mapping in `AppDbContext.OnModelCreating()`:
  ```csharp
  entity.ToTable("tenant");
  entity.Property(e => e.Id).HasColumnName("id");
  entity.Property(e => e.Name).HasColumnName("name");
  // etc. - NEVER skip column mappings!
### Standard Columns (96 tables comply)
Every custom table must include:
- `id` (UUID, primary key)
- `tenant_id` (UUID, foreign key - multi-tenancy)
- `created_at`, `updated_at` (timestamps)
- `created_by_user_id`, `updated_by_user_id` (audit trail)
- `deleted_at` (soft delete - HIPAA requirement)
- `status` (e.g., "active", "inactive", "archived")

### RLS Pattern
All queries automatically filter by tenant via:
```sql
CREATE POLICY tenant_isolation ON table_name
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));
```
Set tenant context via custom header `X-Tenant-ID` in API requests (see `apps/hospital-portal-web/src/lib/api.ts`).

## Database Conventions

### Critical Migration Pattern
**NEVER** modify database directly. All schema changes via SQL scripts in root directory:
- Run migrations with `consolidated/run_all.ps1 -RunMigrations` (automated execution)
- Test compliance with `consolidated/run_all.ps1 -RunTests`
- See `MASTER_DATABASE_MIGRATIONS.sql` for consolidated reference

### Table Naming & Column Mapping
- **Custom tables**: snake_case (`tenant`, `branch`, `clinical_examination`)
- **Identity tables**: MixedCase (`AspNetUsers`, `AspNetRoles`) but aliased to lowercase in EF
- **ALL entities** require explicit column mapping in `AppDbContext.OnModelCreating()`:
  ```csharp
  entity.ToTable("tenant");
  entity.Property(e => e.Id).HasColumnName("id");
  entity.Property(e => e.Name).HasColumnName("name");
  // etc. - NEVER skip column mappings!
  ```

### Standard Columns (96 tables comply)
Every custom table must include:
- `id` (UUID, primary key)
- `tenant_id` (UUID, foreign key - multi-tenancy)
- `created_at`, `updated_at` (timestamps)
- `created_by_user_id`, `updated_by_user_id` (audit trail)
- `deleted_at` (soft delete - HIPAA requirement)
- `status` (e.g., "active", "inactive", "archived")

### RLS Pattern
All queries automatically filter by tenant via:
```sql
CREATE POLICY tenant_isolation ON table_name
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));
```
Set tenant context via custom header `X-Tenant-ID` in API requests (see `apps/hospital-portal-web/src/lib/api.ts`).

## Code Patterns

### Backend Service Layer
All controllers delegate to services. Example structure:
- **Controller**: `Controllers/TenantsController.cs` - handles HTTP, auth, validation
- **Service**: `Services/TenantService.cs` (interface: `ITenantService`) - business logic
- **Registration**: Add to `Program.cs`:
  ```csharp
  builder.Services.AddScoped<ITenantService, TenantService>();
  ```

### Frontend API Integration
- **Base URL**: `NEXT_PUBLIC_API_URL=http://localhost:5073/api` (configured in `.env.local`)
- **HTTP Client**: Axios with interceptors for tenant ID + JWT in `src/lib/api.ts`
- **Auth Store**: Zustand store in `src/lib/auth-store.ts` manages token/tenant state
- **API Calls Pattern**:
  ```typescript
  const api = getApi();
  const response = await api.get('/tenants');
  // Automatically includes X-Tenant-ID header and Bearer token
  ```

### Phase 4 Disabled Files
Some advanced features are disabled via `.csproj`:
```xml
<Compile Remove="Services/_Phase4_Disabled\**" />
<Compile Remove="Controllers/_Phase4_Disabled\**" />
```
Do NOT reference these files. See `PHASE4_DISABLED_STATUS.md` for rationale.

## Testing & Validation

### API Endpoints
- **Swagger UI**: `http://localhost:5073/swagger` when backend running
- **Implemented**: 162 endpoints across 4 phases (100% backend complete)
- **Authentication**: POST `/api/auth/login` → copy token → click "Authorize" in Swagger → `Bearer {token}`

### Database Testing
```powershell
.\run_tests.ps1   # Runs test_database_compliance.sql
# Validates: UUID keys, timestamps, soft deletes, RLS, audit trails, status columns
# Target: 10/10 compliance score (currently achieved)
```

## Documentation - SINGLE SOURCE OF TRUTH

**📚 Read This ONE File**:
- **`README.md`** ⭐⭐⭐ - **EVERYTHING is here**
  - What the project is
  - Current status (162 endpoints complete, ~40% frontend)
  - Getting started (build, run, test)
  - Backend architecture (162 endpoints)
  - Frontend architecture (40% done)
  - Database architecture (96 tables, HIPAA)
  - Sequential development plan (week-by-week)
  - How to develop (patterns, examples)
  - Troubleshooting guide

**🤖 For AI Agents**:
- `.github/copilot-instructions.md` - This file (quick reference)

**💾 Database Scripts**:
- `MASTER_DATABASE_MIGRATIONS.sql` - All migrations
- `run_migrations.ps1` - Execute migrations
- `run_tests.ps1` - Validate compliance (10/10 score)
- `sample_data_complete.sql` - Sample data

**That's it. Everything else was consolidated into README.md.**

## Current Development Status

### ✅ COMPLETE (100%)
- **Backend API**: 162 endpoints across 4 phases
- **Database**: 96 tables, HIPAA compliant, RLS enabled
- **Security**: Hybrid RBAC + ABAC, JWT auth, multi-tenancy

### ⏳ IN PROGRESS (~40%)
- **Frontend**: Auth, Dashboard, Users, Branches, Tenants UI
- **Testing**: Unit tests, integration tests
- **Deployment**: Azure infrastructure setup

### 📋 NEXT PRIORITIES
- Complete remaining frontend components (Roles, Permissions, Departments, Patients, Appointments)
- End-to-end testing and validation
- Production deployment and CI/CD

## Troubleshooting Common Issues

### Backend Won't Start
- Check if port 5073/7285 is available: `netstat -ano | findstr :5073`
- Kill process if needed: `Stop-Process -Id <PID> -Force`
- Verify database connection in `appsettings.json`

### Frontend API Connection Issues
- Confirm backend is running on `http://localhost:5073`
- Check `.env.local` has correct `NEXT_PUBLIC_API_URL=http://localhost:5073/api`
- Verify tenant ID is set in auth store for API calls

### Database Migration Failures
- Run `.\run_migrations.ps1` from project root
- Check Azure PostgreSQL connection credentials
- Verify RLS policies are correctly applied

## Common Pitfalls

1. **Port Configuration**: Backend runs on `http://localhost:5073` (HTTP) and `https://localhost:7285` (HTTPS), not 5000 or 7001
2. **Column Name Mismatches**: Always check `AppDbContext.cs` for exact `HasColumnName()` mappings. Database uses snake_case but C# uses PascalCase.
3. **Missing Tenant Context**: API calls fail with 403 if `X-Tenant-ID` header missing. Check `api.ts` interceptor.
4. **Package Manager**: Use `pnpm`, NOT `npm`. Running `npm install` breaks workspace links.
5. **Database Connection**: Uses Azure PostgreSQL - check `appsettings.json` for connection string.
6. **SQL Scripts**: Migration scripts are in root directory, executed via `run_migrations.ps1`.
7. **Identity Table Names**: `AspNetUsers` → mapped to `users` table in DB. Use lowercase in raw SQL queries.
8. **Frontend API URL**: Configured in `.env.local` as `http://localhost:5073/api`.
9. **Documentation**: Everything consolidated into `README.md`. No more scattered docs!

## Security Notes

- **JWT Secret**: Change `Jwt:Key` in `appsettings.json` before production (currently: `your-secret-key-min-32-characters-change-this`)
- **Password Policy**: Enforced in `Program.cs` Identity config (12 chars minimum, upper, lower, digit, symbol)
- **RLS Bypass**: `rls_admin` role can bypass tenant isolation for system operations
- **Soft Deletes**: NEVER hard delete - use `deleted_at` timestamp for HIPAA audit trail
- **Audit Logs**: 28 triggers auto-log changes to critical tables (patients, appointments, clinical data)

## Next Development Steps

See `README.md` "What's Pending (Sequential Plan)" section for complete 12-week roadmap.

**Priority Summary**:
- **Weeks 1-2**: Appointments calendar, Departments UI, Roles, Permissions
- **Weeks 3-4**: Organizations, Patients
- **Weeks 5-6**: Document Sharing, Bulk Ops, System Settings, Audit Logs
- **Weeks 7-8**: Backend + Frontend Testing
- **Weeks 9-10**: Azure deployment + CI/CD
- **Weeks 11-12**: Documentation + polish
