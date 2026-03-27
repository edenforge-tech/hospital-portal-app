using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Models.Domain
{
    public class AppointmentConflict
    {
        [Key]
        public Guid Id { get; set; }
        
        [Required]
        public Guid TenantId { get; set; }
        
        public Guid? AppointmentId { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string ConflictType { get; set; } = string.Empty; // doctor_busy, patient_busy, room_unavailable, outside_hours, break_time
        
        public Guid? ConflictingAppointmentId { get; set; }
        
        public string? ConflictMessage { get; set; }
        
        public DateTime DetectedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? ResolvedAt { get; set; }
        
        public string? ResolutionNotes { get; set; }
        
        [MaxLength(20)]
        public string Severity { get; set; } = "medium"; // low, medium, high, critical
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        [MaxLength(20)]
        public string Status { get; set; } = "active";
        
        // Navigation properties
        public virtual Appointment? Appointment { get; set; }
        public virtual Appointment? ConflictingAppointment { get; set; }
    }
}
