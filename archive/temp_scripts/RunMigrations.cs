using Microsoft.EntityFrameworkCore;
using Npgsql;
using System;
using System.IO;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var connectionString = "Host=hospitalportal-db-server.postgres.database.azure.com;Port=5432;Database=hospitalportal;Username=postgres;Password=Eden@#$0606;SSL Mode=Require;Trust Server Certificate=true;Timeout=30;Command Timeout=30;";
        
        var migrationFiles = new[]
        {
            @"c:\Users\Sam Aluri\Downloads\Hospital Portal\database_migrations\01_create_organization_table.sql",
            @"c:\Users\Sam Aluri\Downloads\Hospital Portal\database_migrations\02_update_branch_with_organization.sql",
            @"c:\Users\Sam Aluri\Downloads\Hospital Portal\database_migrations\03_restructure_departments_14_standards.sql",
            @"c:\Users\Sam Aluri\Downloads\Hospital Portal\database_migrations\04_convert_75_to_subdepartments.sql"
        };

        Console.WriteLine("============================================");
        Console.WriteLine("HOSPITAL PORTAL - DATABASE MIGRATION");
        Console.WriteLine("============================================\n");

        try
        {
            await using var connection = new NpgsqlConnection(connectionString);
            await connection.OpenAsync();
            Console.WriteLine("✓ Connected to database\n");

            foreach (var file in migrationFiles)
            {
                var fileName = Path.GetFileName(file);
                Console.WriteLine($"Executing: {fileName}");
                
                try
                {
                    var sql = await File.ReadAllTextAsync(file);
                    await using var cmd = new NpgsqlCommand(sql, connection);
                    cmd.CommandTimeout = 300; // 5 minutes
                    await cmd.ExecuteNonQueryAsync();
                    Console.WriteLine($"✓ {fileName} completed successfully\n");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"✗ {fileName} failed: {ex.Message}\n");
                    // Continue with next migration
                }
            }

            Console.WriteLine("============================================");
            Console.WriteLine("MIGRATION PROCESS COMPLETED");
            Console.WriteLine("============================================");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"✗ Database connection failed: {ex.Message}");
        }
    }
}
