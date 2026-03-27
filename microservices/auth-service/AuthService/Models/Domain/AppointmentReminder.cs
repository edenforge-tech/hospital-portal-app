using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Models.Domain
{
    public class AppointmentReminder
    {
        [Key]
        public Guid Id { get; set; }
        
        [Required]
        public Guid TenantId { get; set; }
        
        [Required]
        public Guid AppointmentId { get; set; }
        
        [Required]
        [MaxLength(20)]
        public string ReminderType { get; set; } = "email"; // email, sms, both, push
        
        [Required]
        public DateTime ScheduledTime { get; set; }
        
        public DateTime? SentAt { get; set; }
        
        [MaxLength(20)]
        public string DeliveryStatus { get; set; } = "pending"; // pending, sent, failed, delivered, bounced
        
        public string? ErrorMessage { get; set; }
        
        public int RetryCount { get; set; } = 0;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        [MaxLength(20)]
        public string Status { get; set; } = "active";
        
        // Navigation properties
        public virtual Appointment? Appointment { get; set; }
    }
}
