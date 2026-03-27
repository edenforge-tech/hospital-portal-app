using System;
using System.Linq;
using System.Threading.Tasks;
using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace AuthService
{
    public static class PatientTypeSeedData
    {
        public static async Task SeedPatientTypeConfigurationsAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

            var tenantId = Guid.Parse("155fe198-6ae5-4a01-9254-ead5b427247e");

            try
            {
                logger.LogInformation("🌱 Starting patient type configurations seed for tenant {TenantId}", tenantId);

                // Check if configs already exist for this tenant
                var existing = await context.PatientTypeConfigurations
                    .Where(c => c.TenantId == tenantId)
                    .ToListAsync();

                if (existing.Any())
                {
                    logger.LogInformation("Found {Count} existing patient type configurations. Deleting...", existing.Count);
                    context.PatientTypeConfigurations.RemoveRange(existing);
                    await context.SaveChangesAsync();
                }

                // Create 8 patient type configurations
                var configs = new[]
                {
                    new PatientTypeConfiguration
                    {
                        TenantId = tenantId,
                        PatientType = "Cash",
                        DisplayName = "Cash Patient",
                        Description = "Direct payment by patient",
                        ConfigurationJson = "{\"requires_advance_payment\": true, \"advance_percentage\": 50, \"required_documents\": [\"ID Proof\", \"Address Proof\"], \"skip_insurance\": true, \"billing_mode\": \"direct\"}",
                        IsActive = true,
                        DisplayOrder = 1
                    },
                    new PatientTypeConfiguration
                    {
                        TenantId = tenantId,
                        PatientType = "Insurance",
                        DisplayName = "Insurance Patient",
                        Description = "Insurance company cashless treatment",
                        ConfigurationJson = "{\"requires_pre_authorization\": true, \"max_pre_auth_wait_hours\": 72, \"required_documents\": [\"Insurance Card\", \"Policy Document\", \"ID Proof\", \"Employer Letter\"], \"skip_advance_if_approved\": true, \"billing_mode\": \"cashless\"}",
                        IsActive = true,
                        DisplayOrder = 2
                    },
                    new PatientTypeConfiguration
                    {
                        TenantId = tenantId,
                        PatientType = "CoPay",
                        DisplayName = "Co-Pay Patient",
                        Description = "Insurance with patient co-payment",
                        ConfigurationJson = "{\"requires_pre_authorization\": true, \"patient_pays_percentage\": 20, \"required_documents\": [\"Insurance Card\", \"ID Proof\"], \"copay_due_at\": \"admission\", \"billing_mode\": \"split\"}",
                        IsActive = true,
                        DisplayOrder = 3
                    },
                    new PatientTypeConfiguration
                    {
                        TenantId = tenantId,
                        PatientType = "ESH",
                        DisplayName = "ESH (Employee State Health)",
                        Description = "ESH government scheme",
                        ConfigurationJson = "{\"requires_claim_form\": true, \"claim_forms\": [\"ESH Form 1\", \"ESH Form 2\"], \"required_documents\": [\"ESH Card\", \"Employee ID\", \"Salary Slip\"], \"zero_advance_payment\": true, \"billing_mode\": \"direct_billing\"}",
                        IsActive = true,
                        DisplayOrder = 4
                    },
                    new PatientTypeConfiguration
                    {
                        TenantId = tenantId,
                        PatientType = "CGHS",
                        DisplayName = "CGHS (Central Govt Health Scheme)",
                        Description = "CGHS government scheme",
                        ConfigurationJson = "{\"requires_pre_approval\": true, \"approval_authority\": \"CGHS Wellness Center\", \"required_documents\": [\"CGHS Card\", \"Referral from CGHS Dispensary\"], \"zero_advance_payment\": true, \"billing_mode\": \"reimbursement\"}",
                        IsActive = true,
                        DisplayOrder = 5
                    },
                    new PatientTypeConfiguration
                    {
                        TenantId = tenantId,
                        PatientType = "Arograshree",
                        DisplayName = "Arograshree (Karnataka State Scheme)",
                        Description = "Karnataka state health scheme for BPL families",
                        ConfigurationJson = "{\"requires_pre_approval\": true, \"approval_authority\": \"District Health Officer\", \"income_certificate_required\": true, \"required_documents\": [\"Income Certificate\", \"Ration Card\", \"ID Proof\"], \"zero_advance_payment\": true, \"billing_mode\": \"government_reimbursement\"}",
                        IsActive = true,
                        DisplayOrder = 6
                    },
                    new PatientTypeConfiguration
                    {
                        TenantId = tenantId,
                        PatientType = "SGHS",
                        DisplayName = "SGHS (State Govt Health Scheme)",
                        Description = "State government employee health scheme",
                        ConfigurationJson = "{\"requires_departmental_approval\": true, \"required_documents\": [\"SGHS Card\", \"Employee ID\"], \"zero_advance_payment\": true, \"billing_mode\": \"direct_billing\"}",
                        IsActive = true,
                        DisplayOrder = 7
                    },
                    new PatientTypeConfiguration
                    {
                        TenantId = tenantId,
                        PatientType = "Camp",
                        DisplayName = "Camp Patient (Sponsored)",
                        Description = "Free surgery camp sponsored by NGO/CSR",
                        ConfigurationJson = "{\"zero_cost_surgery\": true, \"sponsor\": \"NGO/CSR\", \"required_documents\": [\"Camp Registration Form\", \"Income Certificate\"], \"zero_advance_payment\": true, \"billing_mode\": \"sponsored\"}",
                        IsActive = true,
                        DisplayOrder = 8
                    },
                    new PatientTypeConfiguration
                    {
                        TenantId = tenantId,
                        PatientType = "Railway",
                        DisplayName = "Railway (RELHS)",
                        Description = "Railway Employees Liberal Health Scheme",
                        ConfigurationJson = "{\"scheme\": \"RELHS\", \"requires_referral_letter\": true, \"required_documents\": [\"Railway Beneficiary Card\", \"RELHS Referral Letter\", \"Employee ID\"], \"zero_advance_payment\": true, \"billing_mode\": \"direct_billing\", \"requires_preauth\": true, \"pre_auth_authority\": \"Chief Medical Director\"}",
                        IsActive = true,
                        DisplayOrder = 9
                    },
                    new PatientTypeConfiguration
                    {
                        TenantId = tenantId,
                        PatientType = "Free",
                        DisplayName = "Free / Charity",
                        Description = "Hospital charity / indigent care patients — waived fees",
                        ConfigurationJson = "{\"zero_cost_surgery\": true, \"requires_social_worker_approval\": true, \"required_documents\": [\"Income Certificate\", \"BPL Card or Charity Approval Form\"], \"zero_advance_payment\": true, \"billing_mode\": \"charity\", \"notes\": \"Approval from hospital management mandatory before scheduling\"}",
                        IsActive = true,
                        DisplayOrder = 10
                    }
                };

                context.PatientTypeConfigurations.AddRange(configs);
                await context.SaveChangesAsync();

                logger.LogInformation("✅ Successfully seeded {Count} patient type configurations for tenant {TenantId}", configs.Length, tenantId);
                logger.LogInformation("Patient Types: {Types}", string.Join(", ", configs.Select(c => c.PatientType)));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "❌ Error seeding patient type configurations for tenant {TenantId}", tenantId);
                throw;
            }
        }
    }
}
