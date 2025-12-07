using Microsoft.AspNetCore.Identity;
using System;

namespace AuthService.Models.Identity
{
    public class AppUserRole : IdentityUserRole<Guid>
    {
        public Guid BranchId { get; set; }
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
        public Guid? AssignedBy { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public bool IsActive { get; set; } = true;

        // Navigation properties
        public AppUser User { get; set; }
        public AppRole Role { get; set; }
    }
}