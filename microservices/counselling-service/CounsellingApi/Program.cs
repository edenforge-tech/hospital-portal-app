using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Azure.Functions.Worker;
using CounsellingApi.Services;
using CounsellingApi.Repositories;
using CounsellingApi.Data;
using Microsoft.EntityFrameworkCore;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults(workerOptions =>
    {
        workerOptions.EnableUserCodeException = true;
    })
    .ConfigureAppConfiguration((context, config) =>
    {
        config.AddJsonFile("local.settings.json", optional: true, reloadOnChange: false);
    })
    .ConfigureServices((context, services) =>
    {
        // Check ConnectionStrings section first (local.settings.json ConnectionStrings block),
        // then fall back to Values-style env var format.
        var connectionString = context.Configuration.GetConnectionString("DefaultConnection")
            ?? context.Configuration["ConnectionStrings:DefaultConnection"]
            ?? throw new InvalidOperationException("DefaultConnection is not configured.");

        // EF Core with Npgsql (PostgreSQL). Scoped lifetime is required — DbContext is not
        // thread-safe and Azure Functions v4 isolated worker supports scoped services per invocation.
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(connectionString));

        // Named HTTP client for the notification microservice.
        var notificationBaseUrl = context.Configuration["NotificationService:BaseUrl"]
            ?? "http://localhost:7071";
        services.AddHttpClient("notifications", client =>
        {
            client.BaseAddress = new Uri(notificationBaseUrl);
            client.DefaultRequestHeaders.Add("Accept", "application/json");
        });

        services.AddScoped<ICounsellingRepository, EfCounsellingRepository>();
        services.AddScoped<StateMachineService>();
        services.AddScoped<AuditService>();
        services.AddScoped<LockService>();
        services.AddScoped<INotificationSender, HttpNotificationSender>();
        services.AddScoped<CounsellingService>();
    })
    .Build();

host.Run();
