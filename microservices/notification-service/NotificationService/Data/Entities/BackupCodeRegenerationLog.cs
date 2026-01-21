using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NotificationService.Data.Entities;

[Table("backup_code_regeneration_log")]
public class BackupCodeRegenerationLog
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("regenerated_by_admin_id")]
    public Guid? RegeneratedByAdminId { get; set; }

    [Column("reason")]
    public string? Reason { get; set; }

    [Column("old_codes_invalidated")]
    public int OldCodesInvalidated { get; set; }

    [Column("new_codes_generated")]
    public int NewCodesGenerated { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
