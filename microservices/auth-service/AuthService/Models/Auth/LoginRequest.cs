using System.ComponentModel.DataAnnotations;

namespace AuthService.Models
{
    public class LoginRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; }

        [Required]
        public string TenantId { get; set; } // Tenant identification
    }
}