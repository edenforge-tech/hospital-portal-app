using Microsoft.EntityFrameworkCore;
using AuthService.Context;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;
using AuthService.Models.Domain;
using AuthService.Models;

var configuration = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json")
    .Build();

var connectionString = configuration.GetConnectionString("DefaultConnection");

var httpContextAccessor = new HttpContextAccessor();
var options = new DbContextOptionsBuilder<AppDbContext>()
    .UseNpgsql(connectionString)
    .Options;

using var context = new AppDbContext(options, httpContextAccessor);

Console.WriteLine("================================================");
Console.WriteLine("DATABASE UPDATE WITH REAL-TIME DATA");
Console.WriteLine("================================================\n");

var tenantId = Guid.Parse("11111111-1111-1111-1111-111111111111");

// Step 1: Update Tenant
Console.WriteLine("Step 1: Updating tenant...");
var tenant = await context.Tenants.FindAsync(tenantId);
if (tenant != null)
{
    tenant.Name = "India Eye Hospital Network";
    tenant.TenantCode = "INDIA_EYE_NET";
    tenant.CompanyEmail = "contact@indiaeye.com";
    tenant.CompanyPhone = "+91-98765-43210";
    tenant.PrimaryRegion = "India";
    tenant.DefaultCurrency = "INR";
    tenant.NabhAccredited = true;
    tenant.MaxBranches = 20;
    tenant.MaxUsers = 300;
    tenant.UpdatedAt = DateTime.UtcNow;
    Console.WriteLine($"  Updated tenant: {tenant.Name}");
}

// Step 2: Update Organizations
Console.WriteLine("\nStep 2: Updating organizations...");
var org1 = await context.Organizations.FirstOrDefaultAsync(o => o.OrganizationCode == "EYE_CARE_NET");
if (org1 != null)
{
    org1.Name = "India Eye Hospital - Main Network";
    org1.OrganizationCode = "IEHN_MAIN";
    org1.Status = "Active";
    org1.UpdatedAt = DateTime.UtcNow;
    Console.WriteLine($"  Updated org: {org1.Name}");
}

var org2 = await context.Organizations.FirstOrDefaultAsync(o => o.OrganizationCode == "ORG-DEFAULT");
if (org2 != null)
{
    org2.Name = "India Eye Hospital - Regional Centers";
    org2.OrganizationCode = "IEHN_REGIONAL";
    org2.Status = "Active";
    org2.UpdatedAt = DateTime.UtcNow;
    Console.WriteLine($"  Updated org: {org2.Name}");
}

await context.SaveChangesAsync();

// Step 3: Create Branches
Console.WriteLine("\nStep 3: Creating branches...");

var orgMain = await context.Organizations.FirstOrDefaultAsync(o => o.OrganizationCode == "IEHN_MAIN");
var orgRegional = await context.Organizations.FirstOrDefaultAsync(o => o.OrganizationCode == "IEHN_REGIONAL");

var branches = new List<Branch>
{
    new Branch
    {
        Id = Guid.NewGuid(),
        TenantId = tenantId,
        OrganizationId = orgMain!.Id,
        Name = "Delhi Eye Center - Connaught Place",
        BranchCode = "DELHI_CP",
        Region = "North India",
        Timezone = "Asia/Kolkata",
        CurrencyCode = "INR",
        LanguagePrimary = "en",
        AddressLine1 = "Connaught Place, Block A",
        City = "Delhi",
        StateProvince = "Delhi",
        PostalCode = "110001",
        Country = "India",
        Phone = "+91-11-2345-6789",
        Email = "delhi.cp@indiaeye.com",
        OperationalHoursStart = new TimeSpan(9, 0, 0),
        OperationalHoursEnd = new TimeSpan(20, 0, 0),
        EmergencySupport247 = true,
        Status = "Active"
    },
    new Branch
    {
        Id = Guid.NewGuid(),
        TenantId = tenantId,
        OrganizationId = orgMain.Id,
        Name = "Mumbai Eye Center - Andheri",
        BranchCode = "MUMBAI_ANDHERI",
        Region = "West India",
        Timezone = "Asia/Kolkata",
        CurrencyCode = "INR",
        LanguagePrimary = "en",
        AddressLine1 = "Andheri West, Link Road",
        City = "Mumbai",
        StateProvince = "Maharashtra",
        PostalCode = "400053",
        Country = "India",
        Phone = "+91-22-2345-6789",
        Email = "mumbai.andheri@indiaeye.com",
        OperationalHoursStart = new TimeSpan(8, 30, 0),
        OperationalHoursEnd = new TimeSpan(21, 0, 0),
        EmergencySupport247 = true,
        Status = "Active"
    },
    new Branch
    {
        Id = Guid.NewGuid(),
        TenantId = tenantId,
        OrganizationId = orgMain.Id,
        Name = "Bangalore Eye Hospital - Koramangala",
        BranchCode = "BANGALORE_KRM",
        Region = "South India",
        Timezone = "Asia/Kolkata",
        CurrencyCode = "INR",
        LanguagePrimary = "en",
        AddressLine1 = "Koramangala 4th Block",
        City = "Bangalore",
        StateProvince = "Karnataka",
        PostalCode = "560034",
        Country = "India",
        Phone = "+91-80-4567-8901",
        Email = "bangalore.krm@indiaeye.com",
        OperationalHoursStart = new TimeSpan(9, 0, 0),
        OperationalHoursEnd = new TimeSpan(20, 0, 0),
        EmergencySupport247 = true,
        Status = "Active"
    },
    new Branch
    {
        Id = Guid.NewGuid(),
        TenantId = tenantId,
        OrganizationId = orgRegional!.Id,
        Name = "Chennai Eye Care - T Nagar",
        BranchCode = "CHENNAI_TNAGAR",
        Region = "South India",
        Timezone = "Asia/Kolkata",
        CurrencyCode = "INR",
        LanguagePrimary = "en",
        AddressLine1 = "T Nagar, Usman Road",
        City = "Chennai",
        StateProvince = "Tamil Nadu",
        PostalCode = "600017",
        Country = "India",
        Phone = "+91-44-2345-6789",
        Email = "chennai.tnagar@indiaeye.com",
        OperationalHoursStart = new TimeSpan(9, 0, 0),
        OperationalHoursEnd = new TimeSpan(19, 0, 0),
        EmergencySupport247 = true,
        Status = "Active"
    },
    new Branch
    {
        Id = Guid.NewGuid(),
        TenantId = tenantId,
        OrganizationId = orgRegional.Id,
        Name = "Hyderabad Eye Clinic - Banjara Hills",
        BranchCode = "HYDERABAD_BH",
        Region = "South India",
        Timezone = "Asia/Kolkata",
        CurrencyCode = "INR",
        LanguagePrimary = "en",
        AddressLine1 = "Banjara Hills, Road No 12",
        City = "Hyderabad",
        StateProvince = "Telangana",
        PostalCode = "500034",
        Country = "India",
        Phone = "+91-40-2345-6789",
        Email = "hyderabad.bh@indiaeye.com",
        OperationalHoursStart = new TimeSpan(9, 0, 0),
        OperationalHoursEnd = new TimeSpan(20, 0, 0),
        EmergencySupport247 = true,
        Status = "Active"
    },
    new Branch
    {
        Id = Guid.NewGuid(),
        TenantId = tenantId,
        OrganizationId = orgRegional.Id,
        Name = "Pune Eye Center - Koregaon Park",
        BranchCode = "PUNE_KP",
        Region = "West India",
        Timezone = "Asia/Kolkata",
        CurrencyCode = "INR",
        LanguagePrimary = "en",
        AddressLine1 = "Koregaon Park, North Main Road",
        City = "Pune",
        StateProvince = "Maharashtra",
        PostalCode = "411001",
        Country = "India",
        Phone = "+91-20-2345-6789",
        Email = "pune.kp@indiaeye.com",
        OperationalHoursStart = new TimeSpan(9, 0, 0),
        OperationalHoursEnd = new TimeSpan(19, 0, 0),
        EmergencySupport247 = false,
        Status = "Active"
    }
};

foreach (var branch in branches)
{
    var existing = await context.Branches
        .FirstOrDefaultAsync(b => b.OrganizationId == branch.OrganizationId && b.BranchCode == branch.BranchCode);
    
    if (existing == null)
    {
        context.Branches.Add(branch);
        Console.WriteLine($"  Added branch: {branch.Name}");
    }
    else
    {
        Console.WriteLine($"  Branch already exists: {branch.Name}");
    }
}

await context.SaveChangesAsync();

Console.WriteLine("\n================================================");
Console.WriteLine("VERIFICATION");
Console.WriteLine("================================================\n");

var totalBranches = await context.Branches.CountAsync(b => b.TenantId == tenantId && b.DeletedAt == null);
Console.WriteLine($"Total Branches: {totalBranches}");

var branchesByOrg = await context.Branches
    .Where(b => b.TenantId == tenantId && b.DeletedAt == null)
    .GroupBy(b => b.OrganizationId)
    .Select(g => new { OrgId = g.Key, Count = g.Count() })
    .ToListAsync();

Console.WriteLine("\nBranches by Organization:");
foreach (var item in branchesByOrg)
{
    var org = await context.Organizations.FindAsync(item.OrgId);
    Console.WriteLine($"  {org?.Name}: {item.Count} branches");
}

Console.WriteLine("\n================================================");
Console.WriteLine("COMPLETED SUCCESSFULLY");
Console.WriteLine("================================================");
Console.WriteLine("\nRefresh Organization Management page to see changes!");

