using Microsoft.AspNetCore.Identity;
using AuthService.Models.Identity;

public class HashGenerator
{
    public static void Main(string[] args)
    {
        var hasher = new PasswordHasher<AppUser>();
        var hash = hasher.HashPassword(null!, "Admin@123");
        Console.WriteLine("Hash for 'Admin@123':");
        Console.WriteLine(hash);
    }
}
