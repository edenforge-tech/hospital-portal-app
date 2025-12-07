using AuthService.Context;
using AuthService.Middleware;
using AuthService.Models;
using AuthService.Models.Identity;
using AuthService.Models.Domain;
using AuthService.Services;
using AuthService.Authorization;
using AuthService.Authorization.Policies;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

async Task SeedBasicDataForTestingAsync(AppDbContext context)
{
    try
    {
        Console.WriteLine("Starting data seeding...");

        // Create a test tenant
        var tenant = new Tenant
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Name = "Test Hospital",
            TenantCode = "TEST-HOSP",
            Status = "Active",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (!context.Tenants.Any(t => t.Id == tenant.Id))
        {
            context.Tenants.Add(tenant);
            await context.SaveChangesAsync();
            Console.WriteLine("✓ Test tenant created");
        }

        // Create real hospital tenants
        var realTenants = new[]
        {
            new Tenant
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                Name = "USA Healthcare Hospital",
                TenantCode = "USA_HEALTH_HOSP",
                Status = "Active",
                SubscriptionTier = "Professional",
                PrimaryRegion = "US",
                DefaultCurrency = "USD",
                Email = "contact@usahealthcare.com",
                Phone = "+1-555-0100",
                HipaaCompliant = true,
                MaxUsers = 500,
                MaxBranches = 50,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Tenant
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                Name = "India Eye Hospital Network",
                TenantCode = "INDIA_EYE_NET",
                Status = "Active",
                SubscriptionTier = "Professional",
                PrimaryRegion = "INDIA",
                DefaultCurrency = "INR",
                Email = "contact@indiaeye.com",
                Phone = "+91-98765-43210",
                NabhAccredited = true,
                MaxUsers = 300,
                MaxBranches = 20,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Tenant
            {
                Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
                Name = "UAE Medical Center",
                TenantCode = "UAE_MED_CENTER",
                Status = "Active",
                SubscriptionTier = "Professional",
                PrimaryRegion = "UAE",
                DefaultCurrency = "AED",
                Email = "contact@uaemedical.ae",
                Phone = "+971-4-999-0000",
                DpaCompliant = true,
                MaxUsers = 200,
                MaxBranches = 10,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };

        foreach (var realTenant in realTenants)
        {
            if (!context.Tenants.Any(t => t.Id == realTenant.Id))
            {
                context.Tenants.Add(realTenant);
                await context.SaveChangesAsync();
                Console.WriteLine($"✓ Real tenant created: {realTenant.Name}");
            }
        }

        // Create test admin user directly
        var adminUser = new AppUser
        {
            Id = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd"),
            UserName = "admin@test.com",
            NormalizedUserName = "ADMIN@TEST.COM",
            Email = "admin@test.com",
            NormalizedEmail = "ADMIN@TEST.COM",
            EmailConfirmed = true,
            PasswordHash = "AQAAAAEAACcQAAAAEJGjLkT2QH8Q2VzGv5Q2VzGv5Q2VzGv5Q2VzGv5Q2VzGv5Q==", // Password: Admin123!
            SecurityStamp = Guid.NewGuid().ToString(),
            ConcurrencyStamp = Guid.NewGuid().ToString(),
            PhoneNumber = "+1234567890",
            PhoneNumberConfirmed = true,
            TenantId = tenant.Id,
            UserType = "Admin",
            UserStatus = "Active",
            MustChangePasswordOnLogin = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (!context.Users.Any(u => u.Id == adminUser.Id))
        {
            context.Users.Add(adminUser);
            await context.SaveChangesAsync();
            Console.WriteLine("✓ Test admin user created");
        }

        // Create Admin role if it doesn't exist
        var adminRole = new AppRole
        {
            Id = Guid.Parse("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"),
            Name = "Admin",
            NormalizedName = "ADMIN",
            ConcurrencyStamp = Guid.NewGuid().ToString(),
            TenantId = tenant.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (!context.Roles.Any(r => r.Id == adminRole.Id))
        {
            context.Roles.Add(adminRole);
            await context.SaveChangesAsync();
            Console.WriteLine("✓ Admin role created");
        }

        // Assign user to Admin role
        var userRole = new AppUserRole
        {
            UserId = adminUser.Id,
            RoleId = adminRole.Id
        };

        if (!context.UserRoles.Any(ur => ur.UserId == userRole.UserId && ur.RoleId == userRole.RoleId))
        {
            context.UserRoles.Add(userRole);
            await context.SaveChangesAsync();
            Console.WriteLine("✓ User assigned to Admin role");
        }

        Console.WriteLine("✓ Test admin user created: admin@test.com / Admin123!");

        // Seed some basic departments for the test tenant if none exist
        var testTenantId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        if (!context.Departments.Any(d => d.TenantId == testTenantId))
        {
            var departments = new List<Department>
            {
                new Department { Id = Guid.NewGuid(), TenantId = testTenantId, DepartmentCode = "OPD", DepartmentName = "Outpatient Department", DepartmentType = "Clinical", Description = "Main OPD", Status = "Active", Is24x7 = true, RequiresApproval = false, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Department { Id = Guid.NewGuid(), TenantId = testTenantId, DepartmentCode = "RETINA", DepartmentName = "Retina & Vitreous", DepartmentType = "Clinical", Description = "Retinal diseases", Status = "Active", Is24x7 = false, RequiresApproval = false, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Department { Id = Guid.NewGuid(), TenantId = testTenantId, DepartmentCode = "GLAUCOMA", DepartmentName = "Glaucoma", DepartmentType = "Clinical", Description = "Glaucoma care", Status = "Active", Is24x7 = false, RequiresApproval = false, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Department { Id = Guid.NewGuid(), TenantId = testTenantId, DepartmentCode = "CATARACT", DepartmentName = "Cataract", DepartmentType = "Clinical", Description = "Cataract surgery", Status = "Active", Is24x7 = false, RequiresApproval = false, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Department { Id = Guid.NewGuid(), TenantId = testTenantId, DepartmentCode = "CORNEA", DepartmentName = "Cornea", DepartmentType = "Clinical", Description = "Corneal diseases", Status = "Active", Is24x7 = false, RequiresApproval = false, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Department { Id = Guid.NewGuid(), TenantId = testTenantId, DepartmentCode = "PEDIATRIC", DepartmentName = "Pediatric Ophthalmology", DepartmentType = "Clinical", Description = "Pediatric eye care", Status = "Active", Is24x7 = false, RequiresApproval = false, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Department { Id = Guid.NewGuid(), TenantId = testTenantId, DepartmentCode = "OPTOMETRY", DepartmentName = "Optometry", DepartmentType = "Clinical", Description = "Refraction services", Status = "Active", Is24x7 = true, RequiresApproval = false, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Department { Id = Guid.NewGuid(), TenantId = testTenantId, DepartmentCode = "EMERGENCY", DepartmentName = "Emergency & Trauma", DepartmentType = "Clinical", Description = "24/7 emergency care", Status = "Active", Is24x7 = true, RequiresApproval = false, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Department { Id = Guid.NewGuid(), TenantId = testTenantId, DepartmentCode = "OCT", DepartmentName = "OCT Imaging", DepartmentType = "Diagnostic", Description = "OCT scans", Status = "Active", Is24x7 = true, RequiresApproval = false, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Department { Id = Guid.NewGuid(), TenantId = testTenantId, DepartmentCode = "PHARMACY", DepartmentName = "Pharmacy", DepartmentType = "Support", Description = "Hospital pharmacy", Status = "Active", Is24x7 = true, RequiresApproval = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Department { Id = Guid.NewGuid(), TenantId = testTenantId, DepartmentCode = "BILLING", DepartmentName = "Billing", DepartmentType = "Administrative", Description = "Patient billing", Status = "Active", Is24x7 = true, RequiresApproval = false, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Department { Id = Guid.NewGuid(), TenantId = testTenantId, DepartmentCode = "IT", DepartmentName = "IT & Systems", DepartmentType = "Support", Description = "IT support", Status = "Active", Is24x7 = false, RequiresApproval = false, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
            };

            context.Departments.AddRange(departments);
            await context.SaveChangesAsync();
            Console.WriteLine($"✓ Seeded {departments.Count} departments for test tenant");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"!!! Error during seeding: {ex.Message}");
        Console.WriteLine($"!!! Stack trace: {ex.StackTrace}");
        throw;
    }
}

Console.WriteLine("=== BACKEND STARTUP: Starting application ===");

try
{
    var builder = WebApplication.CreateBuilder(args);
    Console.WriteLine("✓ WebApplication builder created");

    // Add services to the container
    Console.WriteLine("Adding controllers...");
    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();
    Console.WriteLine("✓ Controllers configured");

    // Configure database: use Postgres when connection string provided, otherwise fall back to InMemory for local dev
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    Console.WriteLine($"Database configuration: PostgreSQL");
    
    builder.Services.AddDbContext<AppDbContext>(options =>
    {
        options.UseNpgsql(connectionString);
        // Suppress pending model changes warning to allow startup while tables are being created
        options.ConfigureWarnings(warnings => 
            warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
    });
    Console.WriteLine("✓ PostgreSQL DbContext configured");

    // Configure Identity
    Console.WriteLine("Configuring Identity...");
    builder.Services.AddIdentity<AppUser, AppRole>(options =>
    {
        // Password settings
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = true;
        options.Password.RequiredLength = 8;

        // Lockout settings
        options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
        options.Lockout.MaxFailedAccessAttempts = 5;
        options.Lockout.AllowedForNewUsers = true;

        // User settings
        options.User.RequireUniqueEmail = true;
    })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();
    Console.WriteLine("✓ Identity configured");

    // Configure JWT Authentication
    Console.WriteLine("Configuring JWT Authentication...");
    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.SaveToken = true;
        options.RequireHttpsMetadata = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "default-key-min-32-characters-long")),
            ClockSkew = TimeSpan.Zero
        };
    });
    Console.WriteLine("✓ JWT Authentication configured");

    // Configure Authorization with Permission-Based Policies
    Console.WriteLine("Configuring Authorization...");
    builder.Services.AddHttpContextAccessor();
    
    // Register custom authorization policy provider for dynamic permission policies
    builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionAuthorizationPolicyProvider>();
    
    // Register the existing permission authorization handler
    builder.Services.AddScoped<IAuthorizationHandler, AuthService.Services.PermissionAuthorizationHandler>();
    
    builder.Services.AddAuthorization(options =>
    {
        // Keep existing policies for backwards compatibility
        options.AddPolicy("RequireAdminRole", policy => policy.RequireRole("Admin"));
        
        // Permission policies are now dynamically created by PermissionAuthorizationPolicyProvider
        // No need to register individual permission policies here
    });
    Console.WriteLine("✓ Authorization configured with permission-based policies");

    // Add HttpContextAccessor (needed for DbContext)
    // TEMPORARILY DISABLED FOR TESTING
    // builder.Services.AddHttpContextAccessor();
    
    // Register custom authorization policy provider for dynamic permission policies
    // TEMPORARILY DISABLED FOR TESTING
    /*
    builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionAuthorizationPolicyProvider>();
    
    // Register the existing permission authorization handler
    builder.Services.AddScoped<IAuthorizationHandler, AuthService.Services.PermissionAuthorizationHandler>();
    
    builder.Services.AddAuthorization(options =>
    {
        // Keep existing policies for backwards compatibility
        options.AddPolicy("RequireAdminRole", policy => policy.RequireRole("Admin"));
        
        // Permission policies are now dynamically created by PermissionAuthorizationPolicyProvider
        // No need to register individual permission policies here
    });
    Console.WriteLine("✓ Authorization configured with permission-based policies");
    */

    // Register services
    Console.WriteLine("Registering services...");
    builder.Services.AddScoped<IJwtService, JwtService>();
    builder.Services.AddScoped<IPermissionService, PermissionService>();
    builder.Services.AddScoped<IUserService, UserService>();
    builder.Services.AddScoped<IUserDepartmentAccessService, UserDepartmentAccessService>();
    builder.Services.AddScoped<ITenantService, TenantService>();
    builder.Services.AddScoped<IOrganizationService, OrganizationService>();
    builder.Services.AddScoped<IBranchService, BranchService>();
    builder.Services.AddScoped<IDepartmentService, DepartmentService>();
    builder.Services.AddScoped<IRoleService, RoleService>();
    builder.Services.AddScoped<IPermissionManagementService, PermissionManagementService>();
    builder.Services.AddScoped<IDashboardService, DashboardService>();
    builder.Services.AddScoped<AppointmentService>();
    // builder.Services.AddScoped<IAppointmentService, CachedAppointmentService>(); // Disabled - interface mismatch
    builder.Services.AddScoped<IAppointmentService, AppointmentService>();
    builder.Services.AddScoped<INotificationService, NotificationService>();
    
    // Device & Session Management Services (Backend Enhancements)
    builder.Services.AddScoped<IDeviceManagementService, DeviceManagementService>();
    builder.Services.AddScoped<ISessionManagementService, SessionManagementService>();
    
    // Enhanced Audit Service (Blockchain-like Hash Chain)
    builder.Services.AddScoped<IAuditService, AuditService>();
    
    // ABAC Policy Handler (Attribute-Based Access Control)
    builder.Services.AddScoped<IAbacPolicyHandler, AbacPolicyHandler>();
    
    // Localization Service (Cascading Timezone/Format Conversion)
    builder.Services.AddScoped<ILocalizationService, LocalizationService>();
    
    // Emergency Access Service (Break-the-Glass)
    builder.Services.AddScoped<IEmergencyAccessService, EmergencyAccessService>();
    
    // Phase 4 Services - DISABLED (Schema Mismatch - 248 errors)
    // builder.Services.AddScoped<IDocumentSharingService, DocumentSharingService>();
    // builder.Services.AddScoped<ISystemSettingsService, SystemSettingsService>();
    // builder.Services.AddScoped<IBulkOperationsService, BulkOperationsService>();
    
    builder.Services.AddMemoryCache();
    Console.WriteLine("✓ Services registered");

    // Add SignalR
    Console.WriteLine("Configuring SignalR...");
    builder.Services.AddSignalR(options =>
    {
        options.EnableDetailedErrors = builder.Environment.IsDevelopment();
        options.MaximumReceiveMessageSize = 102400; // 100 KB
    });
    Console.WriteLine("✓ SignalR configured");

    // CORS configuration
    Console.WriteLine("Configuring CORS...");
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowAll", builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
    });
    Console.WriteLine("✓ CORS configured");

    Console.WriteLine("Building application...");
    var app = builder.Build();
    Console.WriteLine("✓ Application built successfully");

    // TODO Week 1: Seed permissions after fixing table name mapping
    // The database has 216 permissions but table name mismatch (permission vs permissions)
    // See COMPLETE_RBAC_IMPLEMENTATION_PLAN.md for manual approach

    // Configure the HTTP request pipeline
    Console.WriteLine("Configuring HTTP pipeline...");
    if (!app.Environment.IsDevelopment())
    {
        app.UseHttpsRedirection();
    }
    app.UseCors("AllowAll");
    Console.WriteLine("✓ CORS applied");

    // Add tenant resolution middleware before authentication
    app.UseTenantResolution();
    Console.WriteLine("✓ Tenant resolution middleware applied");

    app.UseAuthentication();
    app.UseAuthorization();
    Console.WriteLine("✓ Authentication/Authorization configured");

    app.MapControllers();
    Console.WriteLine("✓ Controllers mapped");

    // Map SignalR hubs
    app.MapHub<AuthService.Hubs.NotificationHub>("/notificationHub");
    Console.WriteLine("✓ SignalR hubs mapped");

    // Ensure database is created and migrations are applied when using a relational provider
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        var context = services.GetRequiredService<AppDbContext>();
        
        // Apply migrations
        context.Database.Migrate();
        Console.WriteLine("✓ Database migrations applied");
        
        // Seed basic data for testing
        await SeedBasicDataForTestingAsync(context);
        Console.WriteLine("✓ Database initialization completed");
    }

    // Attach application lifetime and global exception handlers to help diagnose unexpected shutdowns
    try
    {
        var lifetime = app.Lifetime;
        lifetime.ApplicationStarted.Register(() => Console.WriteLine("EVENT: ApplicationStarted"));
        lifetime.ApplicationStopping.Register(() => Console.WriteLine("EVENT: ApplicationStopping"));
        lifetime.ApplicationStopped.Register(() => Console.WriteLine("EVENT: ApplicationStopped"));

        AppDomain.CurrentDomain.ProcessExit += (s, e) => Console.WriteLine($"EVENT: ProcessExit - ExitCode={Environment.ExitCode}");
        AppDomain.CurrentDomain.UnhandledException += (s, e) => Console.WriteLine($"EVENT: UnhandledException - {e.ExceptionObject}");
    }
    catch
    {
        // Swallow any diagnostic wiring failure to avoid impacting normal startup
    }

    Console.WriteLine("=== BACKEND STARTUP: Starting server ===");
    try
    {
        app.Run();
    }
    catch (Exception runEx)
    {
        Console.WriteLine($"!!! FATAL ERROR during app.Run(): {runEx.Message}");
        Console.WriteLine($"!!! Stack trace: {runEx.StackTrace}");
        throw;
    }
    Console.WriteLine("=== BACKEND SHUTDOWN: Server stopped ===");
}
catch (Exception ex)
{
    Console.WriteLine($"!!! FATAL ERROR during startup: {ex.Message}");
    Console.WriteLine($"!!! Stack Trace: {ex.StackTrace}");
    if (ex.InnerException != null)
    {
        Console.WriteLine($"!!! Inner Exception: {ex.InnerException.Message}");
        Console.WriteLine($"!!! Inner Stack Trace: {ex.InnerException.StackTrace}");
    }
    throw;
}
