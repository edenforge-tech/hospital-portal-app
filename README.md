# Hospital Portal App

A multi-tenant healthcare management SaaS platform built with ASP.NET Core backend and Next.js frontend.

## Features

- **Multi-tenant Architecture**: Complete data isolation between different healthcare organizations
- **Patient Management**: Track patient records, medical history, and personal information
- **Doctor Management**: Manage healthcare provider profiles and availability
- **Appointment Scheduling**: Schedule and track patient appointments
- **RESTful API**: Well-structured API with Swagger documentation
- **Modern Frontend**: Responsive Next.js UI with TypeScript and Tailwind CSS

## Architecture

### Backend (ASP.NET Core 8.0)
- **ASP.NET Core Web API** with Entity Framework Core
- **Multi-tenancy** via custom middleware and query filters
- **In-Memory Database** for easy development (can be swapped for SQL Server)
- **Swagger/OpenAPI** documentation at `/swagger`
- **CORS** configured for frontend integration

### Frontend (Next.js 16)
- **Next.js** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Client-side rendering** with API integration

## Project Structure

```
hospital-portal-app/
├── backend/
│   ├── HospitalPortal.Api/         # ASP.NET Core Web API
│   │   ├── Controllers/            # API Controllers
│   │   ├── Data/                   # Database Context
│   │   ├── Middleware/             # Tenant Middleware
│   │   └── Services/               # Business Services
│   └── HospitalPortal.Core/        # Domain Models
│       └── Models/                 # Entity Models
├── frontend/
│   ├── app/                        # Next.js App Router
│   ├── components/                 # React Components
│   ├── lib/                        # API Client
│   └── types/                      # TypeScript Types
└── docker-compose.yml              # Docker Compose Configuration

```

## Getting Started

### Prerequisites
- .NET 8.0 SDK
- Node.js 20+ and npm
- Docker (optional)

### Running Locally

#### Backend
```bash
cd backend/HospitalPortal.Api
dotnet restore
dotnet run
```

The API will be available at `http://localhost:5000`
Swagger documentation: `http://localhost:5000/swagger`

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Using Docker

```bash
docker-compose up --build
```

This will start both the backend and frontend services.

## Multi-Tenant Usage

The system uses a header-based multi-tenancy approach. To access tenant-specific data:

1. **Create a Tenant** (via API):
```bash
curl -X POST http://localhost:5000/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "City Hospital",
    "tenantIdentifier": "city-hospital",
    "contactEmail": "admin@cityhospital.com",
    "contactPhone": "+1234567890"
  }'
```

2. **Access Tenant Data**: Include the tenant identifier in the `X-Tenant-ID` header:
```bash
curl -X GET http://localhost:5000/api/patients \
  -H "X-Tenant-ID: city-hospital"
```

The frontend automatically includes this header when the tenant ID is set.

## API Endpoints

### Tenants
- `GET /api/tenants` - List all active tenants
- `GET /api/tenants/{id}` - Get tenant by ID
- `POST /api/tenants` - Create new tenant
- `PUT /api/tenants/{id}` - Update tenant

### Patients (Tenant-scoped)
- `GET /api/patients` - List all patients
- `GET /api/patients/{id}` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PUT /api/patients/{id}` - Update patient
- `DELETE /api/patients/{id}` - Delete patient

### Doctors (Tenant-scoped)
- `GET /api/doctors` - List all doctors
- `GET /api/doctors/{id}` - Get doctor by ID
- `POST /api/doctors` - Create new doctor
- `PUT /api/doctors/{id}` - Update doctor
- `DELETE /api/doctors/{id}` - Delete doctor

### Appointments (Tenant-scoped)
- `GET /api/appointments` - List all appointments
- `GET /api/appointments/{id}` - Get appointment by ID
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/{id}` - Update appointment
- `DELETE /api/appointments/{id}` - Delete appointment

## Development

### Building the Backend
```bash
cd /home/runner/work/hospital-portal-app/hospital-portal-app
dotnet build
```

### Building the Frontend
```bash
cd frontend
npm run build
```

### Running Tests
Tests can be added to the backend using xUnit and to the frontend using Jest/React Testing Library.

## Environment Variables

### Backend
Configure in `appsettings.json` or environment variables:
- `ConnectionStrings__DefaultConnection` - Database connection string (when using SQL Server)

### Frontend
Configure in `.env.local`:
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: `http://localhost:5000/api`)

## Technology Stack

### Backend
- ASP.NET Core 8.0
- Entity Framework Core 8.0
- Swashbuckle (Swagger/OpenAPI)
- Microsoft.EntityFrameworkCore.InMemory

### Frontend
- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS 3
- ESLint

## Security Considerations

- Multi-tenant data isolation enforced at the database level
- Query filters prevent cross-tenant data access
- CORS configured for frontend domain
- API authentication can be added via JWT Bearer tokens

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.