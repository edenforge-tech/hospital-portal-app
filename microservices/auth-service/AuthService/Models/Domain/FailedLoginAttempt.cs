using System;

namespace AuthService.Models.Domain
{
    public class FailedLoginAttempt
    {
        public Guid Id { get; set; }
        public string EmailOrUsername { get; set; }
        public Guid? TenantId { get; set; }
        public string IpAddress { get; set; }
        public DateTime AttemptedAt { get; set; } = DateTime.UtcNow;
        public string Reason { get; set; }
    }
}