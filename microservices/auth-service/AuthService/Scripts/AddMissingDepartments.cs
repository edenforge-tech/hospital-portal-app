// Script to add 8 missing departments via DbContext
// Run this through the backend service

using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Scripts
{
    public class AddMissingDepartments
    {
        public static async Task ExecuteAsync(AppDbContext context)
        {
            Console.WriteLine("🚀 Adding 8 Missing Departments...\n");
            
            // Get all tenants
            var tenants = await context.Tenants.ToListAsync();
            Console.WriteLine($"Found {tenants.Count} tenants");
            
            if (!tenants.Any())
            {
                Console.WriteLine("❌ No tenants found. Please create tenants first.");
                return;
            }
            
            int addedCount = 0;
            
            var newDepartments = new List<(string Code, string Name, string Type, string Description)>
            {
                ("PATIENT_SERVICES", "Patient Services", "Administrative", "Patient registration, admission, and discharge services"),
                ("SCM_AUDIT", "SCM Audit", "Audit & Compliance", "Supply Chain Management audit and compliance"),
                ("MARKETING", "Marketing", "Administrative", "Hospital marketing and patient outreach"),
                ("CENTRAL_HUB", "Central Hub", "Support", "Central coordination and communication hub"),
                ("STATIONERY", "Stationery", "Specialized Storage", "Stationery inventory and distribution"),
                ("OT_STORE", "OT Store", "Support", "Operating Theatre supplies and equipment storage"),
                ("CLINICAL_AUDIT", "Clinical Audit", "Audit & Compliance", "Clinical practice audit and quality assurance"),
                ("FINANCE_AUDIT", "Finance Audit", "Audit & Compliance", "Financial audit and compliance verification")
            };
            
            foreach (var tenant in tenants)
            {
                // Get first branch for this tenant (or create departments without branch)
                var branch = await context.Branches
                    .Where(b => b.TenantId == tenant.Id && b.DeletedAt == null)
                    .FirstOrDefaultAsync();
                
                foreach (var (code, name, type, description) in newDepartments)
                {
                    // Check if department already exists
                    var exists = await context.Departments
                        .AnyAsync(d => d.TenantId == tenant.Id && 
                                      d.DepartmentCode == code && 
                                      d.DeletedAt == null);
                    
                    if (!exists)
                    {
                        var department = new Department
                        {
                            Id = Guid.NewGuid(),
                            TenantId = tenant.Id,
                            BranchId = branch?.Id,
                            DepartmentCode = code,
                            DepartmentName = name,
                            DepartmentType = type,
                            Description = description,
                            Status = "Active",
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow,
                            CreatedBy = null, // System-created
                            UpdatedBy = null
                        };
                        
                        context.Departments.Add(department);
                        addedCount++;
                        Console.WriteLine($"✅ Added {name} for tenant {tenant.Name}");
                    }
                    else
                    {
                        Console.WriteLine($"⏭️  Skipped {name} (already exists for tenant {tenant.Name})");
                    }
                }
            }
            
            if (addedCount > 0)
            {
                await context.SaveChangesAsync();
                Console.WriteLine($"\n✅ SUCCESS: Added {addedCount} departments");
            }
            else
            {
                Console.WriteLine("\n✅ All departments already exist");
            }
            
            // Verify total count
            var totalDepts = await context.Departments
                .Where(d => d.DeletedAt == null)
                .CountAsync();
            Console.WriteLine($"📊 Total active departments in database: {totalDepts}");
        }
    }
}
