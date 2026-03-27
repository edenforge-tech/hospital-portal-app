using System;

namespace AuthService.Models.Domain
{
    /// <summary>
    /// Tracks all changes made to system settings for audit purposes
    /// </summary>
    public class SettingsChangeHistory
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public string Category { get; set; } = string.Empty;
        public string SettingKey { get; set; } = string.Empty;
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }
        public Guid ChangedByUserId { get; set; }
        public DateTime ChangedAt { get; set; }
        public string? ChangeReason { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; } = "active";
    }
}
