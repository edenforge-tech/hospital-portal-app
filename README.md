# Hospital Portal - Healthcare Management SaaS

> Multi-tenant healthcare management platform with HIPAA-compliant security

**Status**: ✅ Clean & Organized (Cleanup completed Dec 9, 2025)  
**See**: [CLEANUP_COMPLETE.md](CLEANUP_COMPLETE.md) for project organization details

## 🚀 Quick Start

### Prerequisites
- .NET 8.0 SDK
- Node.js 18+ and pnpm
- Azure PostgreSQL database

### Backend
```powershell
cd microservices/auth-service/AuthService
dotnet build
dotnet run  # Runs on http://localhost:5073
```

### Frontend
```powershell
cd apps/hospital-portal-web
pnpm install
pnpm dev  # Runs on http://localhost:3000
```

### Database Setup
```powershell
cd consolidated
.\run_all.ps1 -RunMigrations
```

## 📚 Documentation

- **[GUIDE.md](GUIDE.md)** - Complete project guide (architecture, development, troubleshooting)
- **[.github/copilot-instructions.md](.github/copilot-instructions.md)** - AI agent quick reference
- **[consolidated/MASTER_DOCS.md](consolidated/MASTER_DOCS.md)** - Consolidated documentation

## 🏗️ Architecture

- **Backend**: ASP.NET Core 8.0 with 162 REST API endpoints
- **Frontend**: Next.js 13.5.1 with App Router (~40% complete)
- **Database**: Azure PostgreSQL 17.6 with 96 HIPAA-compliant tables
- **Security**: Hybrid RBAC + ABAC with Row-Level Security (RLS)

## 🔧 Key Technologies

- ASP.NET Core 8.0 + Entity Framework Core 9.0
- Next.js 13.5.1 + React 18 + TypeScript
- Azure PostgreSQL 17.6
- pnpm workspaces + Turbo monorepo
- ASP.NET Core Identity + JWT authentication

## 📂 Project Structure (Clean & Organized ✅)

```
Hospital Portal/
├── README.md                          ⭐ Main documentation (single source of truth)
├── CLEANUP_COMPLETE.md                📋 Cleanup details and file organization
├── MASTER_DATABASE_MIGRATIONS.sql     🗄️ Consolidated database migrations
├── MASTER_PERMISSIONS_SEED.sql        🔐 Permission seeding script
├── run_database_migrations.ps1        ⚙️ Migration runner
├── test_database_compliance.sql       ✅ Database validation script
├── .github/copilot-instructions.md    🤖 AI coding guidelines
├── apps/
│   └── hospital-portal-web/          # Next.js frontend
├── microservices/
│   └── auth-service/
│       └── AuthService/               # .NET 8.0 backend
├── database_migrations/               # All database migration scripts (organized)
├── consolidated/
│   └── run_all.ps1                    # Unified runner (migrations + seeding + tests)
└── archive/                           # Historical files (docs, ps1, sql, logs)
```

**Essential Files**:
- `README.md` - Main documentation (you are here!)
- `CLEANUP_COMPLETE.md` - Project organization and cleanup details
- `run_database_migrations.ps1` - Database setup script
- `test_database_compliance.sql` - HIPAA compliance validator
```

## ✅ Current Status

**Backend**: ✅ 100% Complete (162 endpoints across 4 phases)  
**Database**: ✅ 100% Complete (96 tables, HIPAA compliant)  
**Frontend**: ⏳ ~50% Complete (Auth, Dashboard, Users, Branches, Tenants, Departments, Roles, Permissions, Audit Logs, **Front Desk/OPD** ✨)  
**Module 4 (Front Desk/OPD)**: ✅ **100% Complete** - Check-in, Queue Management, Walk-in Booking, SignalR Real-time Updates  
**Admin Features**: ✅ 70% Complete (7/10 tasks) - See [ADMIN_GAP_CLOSING_FINAL_STATUS.md](ADMIN_GAP_CLOSING_FINAL_STATUS.md)  
**Technical Debt**: 3 tasks deferred to Phase 5 - See [PHASE5_TECHNICAL_DEBT_BACKLOG.md](PHASE5_TECHNICAL_DEBT_BACKLOG.md)

## 🧪 Testing

**Login Credentials**:
- Email: `admin@test.com`
- Password: `Admin123!`
- Tenant ID: `11111111-1111-1111-1111-111111111111`

**API Documentation**: http://localhost:5073/swagger

## 🐛 Common Issues

1. **Port conflicts**: Backend uses 5073, frontend uses 3000
2. **Package manager**: Use `pnpm` NOT `npm`
3. **Database connection**: Check `appsettings.json` for connection string
4. **Tenant context**: API calls need `X-Tenant-ID` header

See [GUIDE.md](GUIDE.md) for detailed troubleshooting.

## 📝 License

Copyright © 2025 Sam Aluri. All rights reserved.
