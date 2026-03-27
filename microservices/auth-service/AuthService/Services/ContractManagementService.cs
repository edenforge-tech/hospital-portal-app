using AuthService.Data;
using AuthService.Models;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AuthService.Services
{
    public interface IContractManagementService
    {
        Task<List<EmploymentContract>> GetContractsByTenantAsync(Guid tenantId);
        Task<List<EmploymentContract>> GetContractsByEmployeeIdAsync(Guid employeeId, Guid tenantId);
        Task<EmploymentContract?> GetContractByIdAsync(Guid contractId, Guid tenantId);
        Task<EmploymentContract> CreateContractAsync(EmploymentContract contract, Guid currentUserId);
        Task<EmploymentContract> UpdateContractAsync(EmploymentContract contract, Guid currentUserId);
        Task DeleteContractAsync(Guid contractId, Guid tenantId, Guid currentUserId);
        Task<EmploymentContract> SignContractAsync(Guid contractId, Guid tenantId, bool isEmployee, Guid signedByUserId);
        Task<List<EmploymentContract>> GetExpiringContractsAsync(Guid tenantId, int daysAhead = 90);
        Task<List<EmploymentContract>> GetExpiredContractsAsync(Guid tenantId);
        Task AutoRenewContractsAsync(Guid tenantId);
        Task<EmploymentContract> RenewContractAsync(Guid contractId, DateTime newEndDate, Guid tenantId, Guid currentUserId);
        Task SendExpiryAlertsAsync(Guid tenantId);
    }

    public class ContractManagementService : IContractManagementService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ContractManagementService> _logger;

        public ContractManagementService(AppDbContext context, ILogger<ContractManagementService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<EmploymentContract>> GetContractsByTenantAsync(Guid tenantId)
        {
            return await _context.EmploymentContracts
                .Where(c => c.TenantId == tenantId && c.DeletedAt == null)
                .Include(c => c.Employee)
                    .ThenInclude(e => e.User)
                .OrderByDescending(c => c.StartDate)
                .ToListAsync();
        }

        public async Task<List<EmploymentContract>> GetContractsByEmployeeIdAsync(Guid employeeId, Guid tenantId)
        {
            return await _context.EmploymentContracts
                .Where(c => c.EmployeeId == employeeId && c.TenantId == tenantId && c.DeletedAt == null)
                .OrderByDescending(c => c.StartDate)
                .ToListAsync();
        }

        public async Task<EmploymentContract?> GetContractByIdAsync(Guid contractId, Guid tenantId)
        {
            return await _context.EmploymentContracts
                .Where(c => c.Id == contractId && c.TenantId == tenantId && c.DeletedAt == null)
                .Include(c => c.Employee)
                    .ThenInclude(e => e.User)
                .FirstOrDefaultAsync();
        }

        public async Task<EmploymentContract> CreateContractAsync(EmploymentContract contract, Guid currentUserId)
        {
            contract.Id = Guid.NewGuid();
            contract.CreatedAt = DateTime.UtcNow;
            contract.UpdatedAt = DateTime.UtcNow;
            contract.CreatedByUserId = currentUserId;
            contract.UpdatedByUserId = currentUserId;
            contract.Status = "active";
            contract.ContractStatus = "draft";

            // Generate contract number if not provided
            if (string.IsNullOrEmpty(contract.ContractNumber))
            {
                var lastContract = await _context.EmploymentContracts
                    .Where(c => c.TenantId == contract.TenantId)
                    .OrderByDescending(c => c.ContractNumber)
                    .FirstOrDefaultAsync();

                int nextNumber = 1;
                if (lastContract != null && !string.IsNullOrEmpty(lastContract.ContractNumber))
                {
                    var numberPart = lastContract.ContractNumber.Replace("CON-", "");
                    if (int.TryParse(numberPart, out int currentNumber))
                    {
                        nextNumber = currentNumber + 1;
                    }
                }
                contract.ContractNumber = $"CON-{nextNumber:D5}";
            }

            // Set renewal date if auto-renew is enabled
            if (contract.AutoRenew && contract.EndDate.HasValue && contract.RenewalNoticePeriodDays.HasValue)
            {
                contract.RenewalDate = contract.EndDate.Value.AddDays(-contract.RenewalNoticePeriodDays.Value);
            }

            _context.EmploymentContracts.Add(contract);
            await _context.SaveChangesAsync();

            return await GetContractByIdAsync(contract.Id, contract.TenantId) ?? contract;
        }

        public async Task<EmploymentContract> UpdateContractAsync(EmploymentContract contract, Guid currentUserId)
        {
            var existing = await _context.EmploymentContracts
                .FirstOrDefaultAsync(c => c.Id == contract.Id && c.TenantId == contract.TenantId && c.DeletedAt == null);

            if (existing == null)
                throw new InvalidOperationException("Contract not found");

            existing.ContractType = contract.ContractType;
            existing.StartDate = contract.StartDate;
            existing.EndDate = contract.EndDate;
            existing.AutoRenew = contract.AutoRenew;
            existing.RenewalNoticePeriodDays = contract.RenewalNoticePeriodDays;
            existing.ContractTerms = contract.ContractTerms;
            existing.JobDescription = contract.JobDescription;
            existing.ReportingTo = contract.ReportingTo;
            existing.WorkLocation = contract.WorkLocation;
            existing.AgreedSalary = contract.AgreedSalary;
            existing.Currency = contract.Currency;
            existing.PaymentTerms = contract.PaymentTerms;
            existing.BenefitsSummary = contract.BenefitsSummary;
            existing.ContractDocumentUrl = contract.ContractDocumentUrl;
            existing.SignedDocumentUrl = contract.SignedDocumentUrl;
            existing.TerminationClause = contract.TerminationClause;
            existing.TerminationNoticePeriodDays = contract.TerminationNoticePeriodDays;
            existing.UpdatedAt = DateTime.UtcNow;
            existing.UpdatedByUserId = currentUserId;

            // Recalculate renewal date
            if (contract.AutoRenew && contract.EndDate.HasValue && contract.RenewalNoticePeriodDays.HasValue)
            {
                existing.RenewalDate = contract.EndDate.Value.AddDays(-contract.RenewalNoticePeriodDays.Value);
            }

            // Update status based on dates
            if (existing.EndDate.HasValue && existing.EndDate.Value < DateTime.UtcNow.Date)
            {
                existing.ContractStatus = "expired";
            }

            await _context.SaveChangesAsync();

            return await GetContractByIdAsync(existing.Id, existing.TenantId) ?? existing;
        }

        public async Task DeleteContractAsync(Guid contractId, Guid tenantId, Guid currentUserId)
        {
            var contract = await _context.EmploymentContracts
                .FirstOrDefaultAsync(c => c.Id == contractId && c.TenantId == tenantId && c.DeletedAt == null);

            if (contract == null)
                throw new InvalidOperationException("Contract not found");

            contract.DeletedAt = DateTime.UtcNow;
            contract.DeletedBy = currentUserId;
            contract.Status = "deleted";

            await _context.SaveChangesAsync();
        }

        public async Task<EmploymentContract> SignContractAsync(Guid contractId, Guid tenantId, bool isEmployee, Guid signedByUserId)
        {
            var contract = await _context.EmploymentContracts
                .FirstOrDefaultAsync(c => c.Id == contractId && c.TenantId == tenantId && c.DeletedAt == null);

            if (contract == null)
                throw new InvalidOperationException("Contract not found");

            if (isEmployee)
            {
                contract.SignedByEmployee = true;
                contract.EmployeeSignatureDate = DateTime.UtcNow.Date;
            }
            else
            {
                contract.SignedByEmployer = true;
                contract.EmployerSignatureDate = DateTime.UtcNow.Date;
            }

            // If both parties have signed, activate the contract
            if (contract.SignedByEmployee && contract.SignedByEmployer)
            {
                contract.ContractStatus = "active";
            }

            contract.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetContractByIdAsync(contract.Id, contract.TenantId) ?? contract;
        }

        public async Task<List<EmploymentContract>> GetExpiringContractsAsync(Guid tenantId, int daysAhead = 90)
        {
            var today = DateTime.UtcNow.Date;
            var futureDate = today.AddDays(daysAhead);

            return await _context.EmploymentContracts
                .Where(c => c.TenantId == tenantId 
                    && c.DeletedAt == null 
                    && c.EndDate.HasValue
                    && c.EndDate.Value >= today 
                    && c.EndDate.Value <= futureDate
                    && c.ContractStatus == "active")
                .Include(c => c.Employee)
                    .ThenInclude(e => e.User)
                .OrderBy(c => c.EndDate)
                .ToListAsync();
        }

        public async Task<List<EmploymentContract>> GetExpiredContractsAsync(Guid tenantId)
        {
            var today = DateTime.UtcNow.Date;

            return await _context.EmploymentContracts
                .Where(c => c.TenantId == tenantId 
                    && c.DeletedAt == null 
                    && c.EndDate.HasValue
                    && c.EndDate.Value < today
                    && c.ContractStatus != "renewed"
                    && c.ContractStatus != "terminated")
                .Include(c => c.Employee)
                    .ThenInclude(e => e.User)
                .OrderBy(c => c.EndDate)
                .ToListAsync();
        }

        public async Task AutoRenewContractsAsync(Guid tenantId)
        {
            var today = DateTime.UtcNow.Date;

            var contractsToRenew = await _context.EmploymentContracts
                .Where(c => c.TenantId == tenantId 
                    && c.DeletedAt == null 
                    && c.AutoRenew
                    && c.EndDate.HasValue
                    && c.EndDate.Value <= today
                    && c.ContractStatus == "active")
                .ToListAsync();

            foreach (var contract in contractsToRenew)
            {
                // Mark old contract as renewed
                contract.ContractStatus = "renewed";
                contract.UpdatedAt = DateTime.UtcNow;

                // Create new contract (1 year extension by default)
                var newContract = new EmploymentContract
                {
                    Id = Guid.NewGuid(),
                    TenantId = contract.TenantId,
                    EmployeeId = contract.EmployeeId,
                    ContractType = contract.ContractType,
                    StartDate = contract.EndDate.Value.AddDays(1),
                    EndDate = contract.EndDate.Value.AddYears(1),
                    AutoRenew = contract.AutoRenew,
                    RenewalNoticePeriodDays = contract.RenewalNoticePeriodDays,
                    ContractTerms = contract.ContractTerms,
                    JobDescription = contract.JobDescription,
                    ReportingTo = contract.ReportingTo,
                    WorkLocation = contract.WorkLocation,
                    AgreedSalary = contract.AgreedSalary,
                    Currency = contract.Currency,
                    PaymentTerms = contract.PaymentTerms,
                    BenefitsSummary = contract.BenefitsSummary,
                    TerminationClause = contract.TerminationClause,
                    TerminationNoticePeriodDays = contract.TerminationNoticePeriodDays,
                    ContractStatus = "active",
                    Status = "active",
                    SignedByEmployee = false,
                    SignedByEmployer = false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.EmploymentContracts.Add(newContract);
            }

            await _context.SaveChangesAsync();
        }

        public async Task<EmploymentContract> RenewContractAsync(Guid contractId, DateTime newEndDate, Guid tenantId, Guid currentUserId)
        {
            var contract = await _context.EmploymentContracts
                .FirstOrDefaultAsync(c => c.Id == contractId && c.TenantId == tenantId && c.DeletedAt == null);

            if (contract == null)
                throw new InvalidOperationException("Contract not found");

            if (!contract.EndDate.HasValue)
                throw new InvalidOperationException("Cannot renew a contract without an end date");

            // Mark old contract as renewed
            contract.ContractStatus = "renewed";
            contract.UpdatedAt = DateTime.UtcNow;
            contract.UpdatedByUserId = currentUserId;

            // Create new renewed contract
            var renewedContract = new EmploymentContract
            {
                Id = Guid.NewGuid(),
                TenantId = contract.TenantId,
                EmployeeId = contract.EmployeeId,
                ContractType = contract.ContractType,
                StartDate = contract.EndDate.Value.AddDays(1),
                EndDate = newEndDate,
                AutoRenew = contract.AutoRenew,
                RenewalNoticePeriodDays = contract.RenewalNoticePeriodDays,
                ContractTerms = contract.ContractTerms,
                JobDescription = contract.JobDescription,
                ReportingTo = contract.ReportingTo,
                WorkLocation = contract.WorkLocation,
                AgreedSalary = contract.AgreedSalary,
                Currency = contract.Currency,
                PaymentTerms = contract.PaymentTerms,
                BenefitsSummary = contract.BenefitsSummary,
                TerminationClause = contract.TerminationClause,
                TerminationNoticePeriodDays = contract.TerminationNoticePeriodDays,
                ContractStatus = "draft", // Requires signatures again
                Status = "active",
                SignedByEmployee = false,
                SignedByEmployer = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedByUserId = currentUserId,
                UpdatedByUserId = currentUserId
            };

            // Generate new contract number
            var lastContract = await _context.EmploymentContracts
                .Where(c => c.TenantId == tenantId)
                .OrderByDescending(c => c.ContractNumber)
                .FirstOrDefaultAsync();

            int nextNumber = 1;
            if (lastContract != null && !string.IsNullOrEmpty(lastContract.ContractNumber))
            {
                var numberPart = lastContract.ContractNumber.Replace("CON-", "");
                if (int.TryParse(numberPart, out int currentNumber))
                {
                    nextNumber = currentNumber + 1;
                }
            }
            renewedContract.ContractNumber = $"CON-{nextNumber:D5}";

            _context.EmploymentContracts.Add(renewedContract);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Contract {ContractId} renewed. New contract: {NewContractId}", contractId, renewedContract.Id);

            return await GetContractByIdAsync(renewedContract.Id, tenantId) ?? renewedContract;
        }

        public async Task SendExpiryAlertsAsync(Guid tenantId)
        {
            var today = DateTime.UtcNow.Date;

            // 90, 60, 30, 7 day alerts
            var alertThresholds = new[] { 90, 60, 30, 7 };

            foreach (var days in alertThresholds)
            {
                var alertDate = today.AddDays(days);

                var contractsExpiringOnDate = await _context.EmploymentContracts
                    .Where(c => c.TenantId == tenantId
                        && c.DeletedAt == null
                        && c.EndDate.HasValue
                        && c.EndDate.Value.Date == alertDate
                        && c.ContractStatus == "active")
                    .Include(c => c.Employee)
                        .ThenInclude(e => e.User)
                    .ToListAsync();

                foreach (var contract in contractsExpiringOnDate)
                {
                    // Create system alert for HR
                    var alert = new SystemAlert
                    {
                        Id = Guid.NewGuid(),
                        TenantId = tenantId,
                        AlertType = "contract_expiry",
                        Severity = days <= 30 ? "high" : "medium",
                        Title = $"Contract Expiring in {days} Days",
                        Message = $"Employment contract for {contract.Employee?.User?.FirstName} {contract.Employee?.User?.LastName} (Contract: {contract.ContractNumber}) expires on {contract.EndDate:yyyy-MM-dd}. Please review and take action.",
                        IsRead = false,
                        TriggeredAt = DateTime.UtcNow,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        Status = "active"
                    };

                    _context.SystemAlerts.Add(alert);

                    _logger.LogInformation("Created {Days}-day expiry alert for contract {ContractNumber}",
                        days, contract.ContractNumber);
                }
            }

            await _context.SaveChangesAsync();
        }
    }
}
