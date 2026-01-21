using System.ComponentModel.DataAnnotations.Schema;

namespace NotificationService.Data.Entities;

/// <summary>
/// Minimal User entity for querying ASP.NET Identity users table
/// Maps to the same table as AppUser in AuthService
/// </summary>
[Table("users")]
public class User
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("tenant_id")]
    public Guid TenantId { get; set; }

    [Column("email")]
    public string? Email { get; set; }

    [Column("user_name")]
    public string? UserName { get; set; }
}
