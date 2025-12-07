using System;
using AuthService.Models.Identity;

namespace AuthService.Models.Domain
{
    public class UserAttribute
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string AttributeKey { get; set; } // e.g., "can_access_branches"
        public string AttributeValue { get; set; } // JSON or comma-separated
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public AppUser User { get; set; }
    }
}