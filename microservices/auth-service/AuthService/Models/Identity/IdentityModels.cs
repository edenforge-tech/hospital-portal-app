using Microsoft.AspNetCore.Identity;
using System;

namespace AuthService.Models.Identity
{
    public class AppUserClaim : IdentityUserClaim<Guid>
    {
    }

    public class AppUserLogin : IdentityUserLogin<Guid>
    {
    }

    public class AppRoleClaim : IdentityRoleClaim<Guid>
    {
    }

    public class AppUserToken : IdentityUserToken<Guid>
    {
    }
}