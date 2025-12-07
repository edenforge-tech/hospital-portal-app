using System;
using System.Collections.Generic;

namespace AuthService.Models
{
    public class LoginResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public int ExpiresIn { get; set; }
        public UserDto User { get; set; }
        public List<string> Roles { get; set; }
        public List<string> Permissions { get; set; }
        public bool MustChangePassword { get; set; }
    }

    public class UserDto
    {
        public Guid Id { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string UserType { get; set; }
        public Guid TenantId { get; set; }
    }
}