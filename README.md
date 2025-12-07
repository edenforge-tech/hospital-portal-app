# Hospital Portal - Healthcare Management SaaS

> Multi-tenant healthcare management platform with HIPAA-compliant security

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

## 📂 Project Structure

```
Hospital Portal/
├── apps/
│   └── hospital-portal-web/          # Next.js frontend
├── microservices/
│   └── auth-service/
│       └── AuthService/               # .NET 8.0 backend
├── consolidated/
│   ├── run_all.ps1                    # Unified script for migrations/seeding/tests
│   └── MASTER_DOCS.md                 # Consolidated documentation
├── archive/                           # Archived old files
├── GUIDE.md                           # Complete project guide
└── README.md                          # This file
```

## ✅ Current Status

**Backend**: ✅ 100% Complete (162 endpoints across 4 phases)  
**Database**: ✅ 100% Complete (96 tables, HIPAA compliant)  
**Frontend**: ⏳ ~40% Complete (Auth, Dashboard, Users, Branches, Tenants)

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
