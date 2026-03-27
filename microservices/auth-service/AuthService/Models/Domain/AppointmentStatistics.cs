using System;
using System.ComponentModel.DataAnnotations;
using AuthService.Models.Identity;

namespace AuthService.Models.Domain
{
    public class AppointmentStatistics
    {
        [Key]
        public Guid Id { get; set; }
        
        [Required]
        public Guid TenantId { get; set; }
        
        [Required]
        public DateTime DateRangeStart { get; set; }
        
        [Required]
        public DateTime DateRangeEnd { get; set; }
        
        public Guid? DoctorId { get; set; }
        
        public Guid? DepartmentId { get; set; }
        
        public int TotalAppointments { get; set; } = 0;
        
        public int CompletedAppointments { get; set; } = 0;
        
        public int CancelledAppointments { get; set; } = 0;
        
        public int NoShowAppointments { get; set; } = 0;
        
        public decimal? AverageDurationMinutes { get; set; }
        
        [MaxLength(20)]
        public string? MostBookedTimeSlot { get; set; }
        
        /// <summary>
        /// Utilization rate as a percentage (0-100)
        /// </summary>
        public decimal? UtilizationRate { get; set; }
        
        public DateTime CalculatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual AppUser? Doctor { get; set; }
        public virtual Department? Department { get; set; }
    }
}
