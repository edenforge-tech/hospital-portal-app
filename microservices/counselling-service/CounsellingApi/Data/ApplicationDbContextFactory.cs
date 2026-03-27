using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using System.Text.Json;

namespace CounsellingApi.Data;

/// <summary>
/// Design-time factory that enables <c>dotnet ef migrations add</c> to run without
/// the Azure Functions host being available. Reads the PostgreSQL connection string
/// from <c>local.settings.json</c> (local dev) or the
/// <c>ConnectionStrings__DefaultConnection</c> environment variable (CI / Azure).
/// </summary>
public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql(ResolveConnectionString())
            .Options;

        return new ApplicationDbContext(options);
    }

    private static string ResolveConnectionString()
    {
        // 1. Environment variable — takes precedence (works in CI and Azure deployment)
        var envConn = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");
        if (!string.IsNullOrWhiteSpace(envConn)) return envConn;

        // 2. local.settings.json — Azure Functions local development convention
        var settingsPath = Path.Combine(Directory.GetCurrentDirectory(), "local.settings.json");
        if (File.Exists(settingsPath))
        {
            using var doc = JsonDocument.Parse(File.ReadAllText(settingsPath));
            if (doc.RootElement.TryGetProperty("Values", out var values) &&
                values.TryGetProperty("ConnectionStrings__DefaultConnection", out var connProp))
            {
                var conn = connProp.GetString();
                if (!string.IsNullOrWhiteSpace(conn)) return conn;
            }
        }

        throw new InvalidOperationException(
            "PostgreSQL connection string not found. " +
            "Set 'ConnectionStrings__DefaultConnection' in local.settings.json Values " +
            "or as an environment variable.");
    }
}
