using System;

namespace AuthService.Models.Domain
{
    /// <summary>
    /// System-wide alerts for monitoring and notifications
    /// </summary>
    public class SystemAlert
    {
        public Guid Id { get; set; }
        public string AlertType { get; set; } = string.Empty; // e.g., "security", "performance", "compliance"
        public string Severity { get; set; } = string.Empty; // "info", "warning", "error", "critical"
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int Count { get; set; } = 0;
        public bool IsDismissed { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? DismissedAt { get; set; }
    }
}
