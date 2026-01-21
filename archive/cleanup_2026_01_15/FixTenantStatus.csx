using Npgsql;

var connectionString = "Host=hospitalportal-db-server.postgres.database.azure.com;Port=5432;Database=hospitalportal;Username=postgres;Password=Eden@#$0606;SSL Mode=Require;Trust Server Certificate=true;Timeout=30;";

await using var conn = new NpgsqlConnection(connectionString);
await conn.OpenAsync();

var updateSql = "UPDATE tenant SET status = 'Active', is_active = true, updated_at = CURRENT_TIMESTAMP WHERE status = 'Inactive' OR is_active = false";
await using var cmd = new NpgsqlCommand(updateSql, conn);
var rowsAffected = await cmd.ExecuteNonQueryAsync();

Console.WriteLine($"Updated {rowsAffected} tenant(s) to Active status");

var selectSql = "SELECT id, name, tenant_code, status, is_active FROM tenant";
await using var selectCmd = new NpgsqlCommand(selectSql, conn);
await using var reader = await selectCmd.ExecuteReaderAsync();

Console.WriteLine("\nCurrent Tenants:");
Console.WriteLine("----------------------------------------");
while (await reader.ReadAsync())
{
    Console.WriteLine($"Name: {reader.GetString(1)}, Code: {reader.GetString(2)}, Status: {reader.GetString(3)}, Active: {reader.GetBoolean(4)}");
}
