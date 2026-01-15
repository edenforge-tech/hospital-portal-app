using Microsoft.EntityFrameworkCore;
using NotificationService.Data.Entities;

namespace NotificationService.Data;

public class NotificationDbContext : DbContext
{
    public NotificationDbContext(DbContextOptions<NotificationDbContext> options)
        : base(options)
    {
    }

    public DbSet<OtpActivation> OtpActivations => Set<OtpActivation>();
    public DbSet<UserMfaSetting> UserMfaSettings => Set<UserMfaSetting>();
    public DbSet<NotificationLog> NotificationLogs => Set<NotificationLog>();
    public DbSet<BackupCodeRegenerationLog> BackupCodeRegenerationLogs => Set<BackupCodeRegenerationLog>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User entity configuration - read-only mapping to ASP.NET Identity users table
        modelBuilder.Entity<User>()
            .ToTable("users")
            .HasKey(u => u.Id);
        
        modelBuilder.Entity<User>()
            .Property(u => u.Id)
            .HasColumnName("id");
        
        modelBuilder.Entity<User>()
            .Property(u => u.TenantId)
            .HasColumnName("tenant_id");
        
        modelBuilder.Entity<User>()
            .Property(u => u.Email)
            .HasColumnName("email");
        
        modelBuilder.Entity<User>()
            .Property(u => u.UserName)
            .HasColumnName("user_name");

        // OtpActivation indexes
        modelBuilder.Entity<OtpActivation>()
            .HasIndex(o => new { o.UserId, o.Status })
            .HasDatabaseName("idx_user_status");

        modelBuilder.Entity<OtpActivation>()
            .HasIndex(o => o.ExpiresAt)
            .HasDatabaseName("idx_expires_at");

        // UserMfaSetting unique constraint
        modelBuilder.Entity<UserMfaSetting>()
            .HasIndex(u => u.UserId)
            .IsUnique()
            .HasDatabaseName("idx_user_id_unique");

        // NotificationLog indexes
        modelBuilder.Entity<NotificationLog>()
            .HasIndex(n => new { n.UserId, n.SentAt })
            .HasDatabaseName("idx_user_sent");

        modelBuilder.Entity<NotificationLog>()
            .HasIndex(n => n.Status)
            .HasDatabaseName("idx_status");

        modelBuilder.Entity<NotificationLog>()
            .HasIndex(n => n.Recipient)
            .HasDatabaseName("idx_recipient");
    }
}
