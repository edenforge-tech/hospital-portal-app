using System;
using System.Threading.Tasks;
using Npgsql;

class Program
{
    static async Task Main(string[] args)
    {
        var connectionString = "Host=hospitalportal-db-server.postgres.database.azure.com;Port=5432;Database=hospitalportal;Username=postgres;Password=Eden@#$0606;SSL Mode=Require;Trust Server Certificate=true;Timeout=30;";
        
        try
        {
            await using var conn = new NpgsqlConnection(connectionString);
            await conn.OpenAsync();
            Console.WriteLine("Connected to database successfully!");
            
            // Add tenant_type column if it doesn't exist
            var addColumnSql = @"
                ALTER TABLE tenant 
                ADD COLUMN IF NOT EXISTS tenant_type TEXT DEFAULT 'Hospital';
                
                UPDATE tenant 
                SET tenant_type = 'Hospital' 
                WHERE tenant_type IS NULL;
            ";
            
            await using (var addColCmd = new NpgsqlCommand(addColumnSql, conn))
            {
                await addColCmd.ExecuteNonQueryAsync();
                Console.WriteLine("Ensured tenant_type column exists!");
            }
            
            // Update all inactive tenants
            var updateSql = @"
                UPDATE tenant 
                SET status = 'Active', 
                    is_active = true, 
                    updated_at = CURRENT_TIMESTAMP 
                WHERE status != 'Active' OR is_active = false;
            ";
            
            await using var cmd = new NpgsqlCommand(updateSql, conn);
            var rowsAffected = await cmd.ExecuteNonQueryAsync();
            Console.WriteLine($"Updated {rowsAffected} tenant(s) to Active status!");
            
            // Display current tenants
            var selectSql = "SELECT id, name, tenant_code, status, is_active FROM tenant";
            await using (var selectCmd = new NpgsqlCommand(selectSql, conn))
            {
                await using var reader = await selectCmd.ExecuteReaderAsync();
                
                Console.WriteLine("\nCurrent Tenants:");
                Console.WriteLine("----------------------------------------");
                while (await reader.ReadAsync())
                {
                    var id = reader.GetGuid(0);
                    var name = reader.IsDBNull(1) ? "NULL" : reader.GetString(1);
                    var code = reader.IsDBNull(2) ? "NULL" : reader.GetString(2);
                    var status = reader.IsDBNull(3) ? "NULL" : reader.GetString(3);
                    var isActive = reader.GetBoolean(4);
                    Console.WriteLine($"ID: {id}\nName: {name}\nCode: {code}\nStatus: {status}\nActive: {isActive}\n");
                }
            }
            
            Console.WriteLine("SUCCESS! Tenants are Active.");
            
            // Now check users
            Console.WriteLine("\n=== CHECKING USERS ===");
            var userSql = @"
                SELECT u.id, u.email, u.user_name, u.email_confirmed, u.lockout_enabled, u.access_failed_count
                FROM users u
                WHERE u.email LIKE '%admin%' OR u.email LIKE '%hospital%'
                ORDER BY u.email;
            ";
            
            await using var userCmd = new NpgsqlCommand(userSql, conn);
            await using var userReader = await userCmd.ExecuteReaderAsync();
            
            Console.WriteLine("\nAdmin Users:");
            Console.WriteLine("----------------------------------------");
            while (await userReader.ReadAsync())
            {
                var id = userReader.GetGuid(0);
                var email = userReader.IsDBNull(1) ? "NULL" : userReader.GetString(1);
                var userName = userReader.IsDBNull(2) ? "NULL" : userReader.GetString(2);
                var emailConfirmed = userReader.GetBoolean(3);
                var lockoutEnabled = userReader.GetBoolean(4);
                var failedCount = userReader.GetInt32(5);
                Console.WriteLine($"Email: {email}\nUsername: {userName}\nEmailConfirmed: {emailConfirmed}\nLockoutEnabled: {lockoutEnabled}\nFailedLogins: {failedCount}\n");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            Console.WriteLine($"Stack Trace: {ex.StackTrace}");
        }
    }
}
