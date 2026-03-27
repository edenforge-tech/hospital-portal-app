using System;
using System.ComponentModel.DataAnnotations;
using AuthService.Models.Identity;

namespace AuthService.Models.Domain
{
    public class DoctorAvailability
    {
        [Key]
        public Guid Id { get; set; }
        
        [Required]
        public Guid TenantId { get; set; }
        
        [Required]
        public Guid DoctorId { get; set; }
        
        /// <summary>
        /// Day of week for recurring availability (0=Sunday, 6=Saturday). Null for specific dates.
        /// </summary>
        public int? DayOfWeek { get; set; }
        
        /// <summary>
        /// Specific date for one-time blocks/changes. Null for recurring availability.
        /// </summary>
        public DateTime? SpecificDate { get; set; }
        
        [Required]
        public TimeSpan StartTime { get; set; }
        
        [Required]
        public TimeSpan EndTime { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string AvailabilityType { get; set; } = "working_hours"; // working_hours, break, blocked, emergency, meeting, personal
        
        public string? Reason { get; set; }
        
        public bool IsRecurring { get; set; } = false;
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public Guid? CreatedByUserId { get; set; }
        
        public Guid? UpdatedByUserId { get; set; }
        
        public DateTime? DeletedAt { get; set; }
        
        [MaxLength(20)]
        public string Status { get; set; } = "active";
        
        // Navigation properties
        public virtual AppUser? Doctor { get; set; }
    }
}
