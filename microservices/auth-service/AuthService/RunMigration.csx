using Npgsql;

var connectionString = "Host=20.244.11.113;Database=hospital_portal;Username=postgres;Password=Psk!1821;Port=5432";
var sqlFile = "add_user_columns.sql";

try
{
    var sql = File.ReadAllText(sqlFile);
    
    using var connection = new NpgsqlConnection(connectionString);
    await connection.OpenAsync();
    
    Console.WriteLine("✓ Connected to database");
    
    using var command = new NpgsqlCommand(sql, connection);
    command.CommandTimeout = 120;
    
    await command.ExecuteNonQueryAsync();
    
    Console.WriteLine("✓ Migration executed successfully");
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Error: {ex.Message}");
    return 1;
}

return 0;
