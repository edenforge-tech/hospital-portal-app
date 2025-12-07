using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;

namespace AuthService.SeedData
{
    public static class PermissionSeeder
    {
        public static async Task SeedPermissionsAsync(AppDbContext context)
        {
            var tenantId = Guid.Parse("00000000-0000-0000-0000-000000000000");
            
            var permissions = new List<Permission>
            {
                // Patient Management (24 permissions)
                new Permission { Id = Guid.NewGuid(), TenantId = tenantId, Code = "patient.patient_record.create", Name = "Create Patient Record", Module = "patient_management", Action = "create", ResourceType = "patient_record", Scope = "branch", Description = "Create new patient records in the system", IsSystemPermission = true, DepartmentSpecific = false, IsCustom = false, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Permission { Id = Guid.NewGuid(), TenantId = tenantId, Code = "patient.patient_record.read", Name = "View Patient Record", Module = "patient_management", Action = "read", ResourceType = "patient_record", Scope = "own", Description = "View patient records with department-level access", IsSystemPermission = true, DepartmentSpecific = true, IsCustom = false, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Permission { Id = Guid.NewGuid(), TenantId = tenantId, Code = "patient.patient_record.update", Name = "Update Patient Record", Module = "patient_management", Action = "update", ResourceType = "patient_record", Scope = "own", Description = "Update patient records with department-level access", IsSystemPermission = true, DepartmentSpecific = true, IsCustom = false, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Permission { Id = Guid.NewGuid(), TenantId = tenantId, Code = "patient.patient_record.delete", Name = "Delete Patient Record", Module = "patient_management", Action = "delete", ResourceType = "patient_record", Scope = "branch", Description = "Soft delete patient records", IsSystemPermission = true, DepartmentSpecific = false, IsCustom = false, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                
                new Permission { Id = Guid.NewGuid(), TenantId = tenantId, Code = "patient.patient_demographics.create", Name = "Create Patient Demographics", Module = "patient_management", Action = "create", ResourceType = "patient_demographics", Scope = "branch", Description = "Create patient demographic information", IsSystemPermission = true, DepartmentSpecific = false, IsCustom = false, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Permission { Id = Guid.NewGuid(), TenantId = tenantId, Code = "patient.patient_demographics.read", Name = "View Patient Demographics", Module = "patient_management", Action = "read", ResourceType = "patient_demographics", Scope = "own", Description = "View patient demographic information", IsSystemPermission = true, DepartmentSpecific = true, IsCustom = false, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Permission { Id = Guid.NewGuid(), TenantId = tenantId, Code = "patient.patient_demographics.update", Name = "Update Patient Demographics", Module = "patient_management", Action = "update", ResourceType = "patient_demographics", Scope = "own", Description = "Update patient demographic information", IsSystemPermission = true, DepartmentSpecific = true, IsCustom = false, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Permission { Id = Guid.NewGuid(), TenantId = tenantId, Code = "patient.patient_demographics.delete", Name = "Delete Patient Demographics", Module = "patient_management", Action = "delete", ResourceType = "patient_demographics", Scope = "branch", Description = "Delete patient demographic information", IsSystemPermission = true, DepartmentSpecific = false, IsCustom = false, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                
                new Permission { Id = Guid.NewGuid(), TenantId = tenantId, Code = "patient.patient_contact.create", Name = "Create Patient Contact", Module = "patient_management", Action = "create", ResourceType = "patient_contact", Scope = "branch", Description = "Create patient contact information", IsSystemPermission = true, DepartmentSpecific = false, IsCustom = false, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Permission { Id = Guid.NewGuid(), TenantId = tenantId, Code = "patient.patient_contact.read", Name = "View Patient Contact", Module = "patient_management", Action = "read", ResourceType = "patient_contact", Scope = "own", Description = "View patient contact information", IsSystemPermission = true, DepartmentSpecific = true, IsCustom = false, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Permission { Id = Guid.NewGuid(), TenantId = tenantId, Code = "patient.patient_contact.update", Name = "Update Patient Contact", Module = "patient_management", Action = "update", ResourceType = "patient_contact", Scope = "own", Description = "Update patient contact information", IsSystemPermission = true, DepartmentSpecific = true, IsCustom = false, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Permission { Id = Guid.NewGuid(), TenantId = tenantId, Code = "patient.patient_contact.delete", Name = "Delete Patient Contact", Module = "patient_management", Action = "delete", ResourceType = "patient_contact", Scope = "branch", Description = "Delete patient contact information", IsSystemPermission = true, DepartmentSpecific = false, IsCustom = false, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                
                new Permission { Id = Guid.NewGuid(), TenantId = tenantId, Code = "patient.patient_consent.create", Name = "Create Patient Consent", Module = "patient_management", Action = "create", ResourceType = "patient_consent", Scope = "branch", Description = "Create patient consent forms", IsSystemPermission = true, DepartmentSpecific = false, IsCustom = false, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Permission { Id = Guid.NewGuid(), TenantId = tenantId, Code = "patient.patient_consent.read", Name = "View Patient Consent", Module = "patient_management", Action = "read", ResourceType = "patient_consent", Scope = "own", Description = "View patient consent forms", IsSystemPermission = true, DepartmentSpecific = true, IsCustom = false, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Permission { Id = Guid.NewGuid(), TenantId = tenantId, Code = "patient.patient_consent.update", Name = "Update Patient Consent", Module = "patient_management", Action = "update", ResourceType = "patient_consent", Scope = "own", Description = "Update patient consent forms", IsSystemPermission = true, DepartmentSpecific = true, IsCustom = false, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Permission { Id = Guid.NewGuid(), TenantId = tenantId, Code = "patient.patient_consent.delete", Name = "Delete Patient Consent", Module = "patient_management", Action = "delete", ResourceType = "patient_consent", Scope = "branch", Description = "Delete patient consent forms", IsSystemPermission = true, DepartmentSpecific = false, IsCustom = false, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                
                new Permission { Id = Guid.NewGuid(), TenantId = tenantId, Code = "patient.patient_document.upload", Name = "Upload Patient Document", Module = "patient_management", Action = "upload", ResourceType = "patient_document", Scope = "own", Description = "Upload patient documents and records", IsSystemPermission = true, DepartmentSpecific = true, IsCustom = false, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Permission { Id = Guid.NewGuid(), TenantId = tenantId, Code = "patient.patient_document.read", Name = "View Patient Document", Module = "patient_management", Action = "read", ResourceType = "patient_document", Scope = "own", Description = "View patient documents", IsSystemPermission = true, DepartmentSpecific = true, IsCustom = false, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Permission { Id = Guid.NewGuid(), TenantId = tenantId, Code = "patient.patient_document.download", Name = "Download Patient Document", Module = "patient_management", Action = "download", ResourceType = "patient_document", Scope = "own", Description = "Download patient documents", IsSystemPermission = true, DepartmentSpecific = true, IsCustom = false, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Permission { Id = Guid.NewGuid(), TenantId = tenantId, Code = "patient.patient_document.delete", Name = "Delete Patient Document", Module = "patient_management", Action = "delete", ResourceType = "patient_document", Scope = "branch", Description = "Delete patient documents", IsSystemPermission = true, DepartmentSpecific = false, IsCustom = false, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                
                new Permission { Id = Guid.NewGuid(), TenantId = tenantId, Code = "patient.patient_preferences.create", Name = "Create Patient Preferences", Module = "patient_management", Action = "create", ResourceType = "patient_preferences", Scope = "own", Description = "Create patient preferences and settings", IsSystemPermission = true, DepartmentSpecific = false, IsCustom = false, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Permission { Id = Guid.NewGuid(), TenantId = tenantId, Code = "patient.patient_preferences.read", Name = "View Patient Preferences", Module = "patient_management", Action = "read", ResourceType = "patient_preferences", Scope = "own", Description = "View patient preferences", IsSystemPermission = true, DepartmentSpecific = true, IsCustom = false, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Permission { Id = Guid.NewGuid(), TenantId = tenantId, Code = "patient.patient_preferences.update", Name = "Update Patient Preferences", Module = "patient_management", Action = "update", ResourceType = "patient_preferences", Scope = "own", Description = "Update patient preferences", IsSystemPermission = true, DepartmentSpecific = true, IsCustom = false, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Permission { Id = Guid.NewGuid(), TenantId = tenantId, Code = "patient.patient_preferences.delete", Name = "Delete Patient Preferences", Module = "patient_management", Action = "delete", ResourceType = "patient_preferences", Scope = "own", Description = "Delete patient preferences", IsSystemPermission = true, DepartmentSpecific = false, IsCustom = false, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            };
            
            // Add permissions that don't exist
            foreach (var permission in permissions)
            {
                var exists = await context.Permissions
                    .AnyAsync(p => p.TenantId == permission.TenantId && p.Code == permission.Code);
                
                if (!exists)
                {
                    await context.Permissions.AddAsync(permission);
                }
            }
            
            await context.SaveChangesAsync();
            
            Console.WriteLine($"✓ Seeded {permissions.Count} patient management permissions");
        }
    }
}
