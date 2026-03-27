using AuthService.Context;
using AuthService.Models.Branch;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using AuthService.Hubs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AuthService.Services
{
    public interface IBranchCapacityService
    {
        // Capacity Summary
        Task<BranchCapacitySummaryDto> GetCapacitySummaryAsync(Guid branchId, Guid tenantId);
        Task<List<BranchCapacitySummaryDto>> GetAllBranchesCapacitySummaryAsync(Guid tenantId);
        
        // Bed Inventory
        Task<List<BedInventoryDto>> GetBedInventoryAsync(Guid branchId, Guid tenantId, string? bedType = null, string? bedStatus = null);
        Task<List<BedInventoryDto>> GetAvailableBedsAsync(Guid branchId, Guid tenantId, string? bedType = null);
        Task<BedInventory> UpdateBedStatusAsync(Guid bedId, string bedStatus, Guid? patientId, DateTime? expectedDischarge, Guid tenantId, Guid updatedByUserId);
        Task<BedInventory> CreateBedAsync(BedInventory bed, Guid currentUserId);
        
        // Transfer Requests
        Task<PatientTransferRequest> CreateTransferRequestAsync(CreateTransferRequestDto request, Guid tenantId, Guid requestedByUserId);
        Task<List<PatientTransferRequest>> GetPendingTransferRequestsAsync(Guid tenantId, Guid? branchId = null);
        Task<PatientTransferRequest> ApproveTransferRequestAsync(Guid requestId, Guid approvedByUserId, Guid? assignedBedId, Guid tenantId);
        Task<PatientTransferRequest> RejectTransferRequestAsync(Guid requestId, string rejectedReason, Guid approvedByUserId, Guid tenantId);
        Task<PatientTransferRequest> CompleteTransferAsync(Guid requestId, Guid tenantId, Guid completedByUserId);
        
        // Capacity History & Analytics
        Task<List<BranchCapacityHistory>> GetCapacityHistoryAsync(Guid branchId, Guid tenantId, DateTime? startDate = null, DateTime? endDate = null);
        Task CreateCapacitySnapshotAsync(Guid branchId, Guid tenantId);
        Task<string> CalculateCapacityAlertLevelAsync(Guid branchId, Guid tenantId);
    }

    public class BranchCapacityService : IBranchCapacityService
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<CapacityHub> _hubContext;

        public BranchCapacityService(AppDbContext context, IHubContext<CapacityHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        #region Capacity Summary

        public async Task<BranchCapacitySummaryDto> GetCapacitySummaryAsync(Guid branchId, Guid tenantId)
        {
            var branch = await _context.Branches
                .Where(b => b.Id == branchId && b.TenantId == tenantId && b.DeletedAt == null)
                .FirstOrDefaultAsync();

            if (branch == null)
                throw new KeyNotFoundException($"Branch with ID {branchId} not found");

            var beds = await _context.Set<BedInventory>()
                .Where(b => b.BranchId == branchId && b.TenantId == tenantId && b.DeletedAt == null)
                .ToListAsync();

            var totalBeds = beds.Count;
            var availableBeds = beds.Count(b => b.BedStatus == "Available");
            var occupiedBeds = beds.Count(b => b.BedStatus == "Occupied");
            var occupancyPercentage = totalBeds > 0 ? Math.Round((decimal)occupiedBeds / totalBeds * 100, 2) : 0;

            // Calculate alert level
            string alertLevel = "normal";
            if (occupancyPercentage >= 90) alertLevel = "critical";
            else if (occupancyPercentage >= 75) alertLevel = "warning";

            return new BranchCapacitySummaryDto
            {
                BranchId = branchId,
                BranchName = branch.Name ?? "Unknown",
                TotalBeds = totalBeds,
                AvailableBeds = availableBeds,
                OccupiedBeds = occupiedBeds,
                OccupancyPercentage = occupancyPercentage,
                CapacityAlertLevel = alertLevel,
                GeneralBeds = GetBedTypeCapacity(beds, "General"),
                IcuBeds = GetBedTypeCapacity(beds, "ICU"),
                EmergencyBeds = GetBedTypeCapacity(beds, "Emergency"),
                LastUpdated = DateTime.UtcNow
            };
        }

        public async Task<List<BranchCapacitySummaryDto>> GetAllBranchesCapacitySummaryAsync(Guid tenantId)
        {
            var branches = await _context.Branches
                .Where(b => b.TenantId == tenantId && b.DeletedAt == null)
                .ToListAsync();

            var summaries = new List<BranchCapacitySummaryDto>();

            foreach (var branch in branches)
            {
                try
                {
                    var summary = await GetCapacitySummaryAsync(branch.Id, tenantId);
                    summaries.Add(summary);
                }
                catch (Exception)
                {
                    // Skip branches with errors
                    continue;
                }
            }

            return summaries;
        }

        private BedTypeCapacity GetBedTypeCapacity(List<BedInventory> beds, string bedType)
        {
            var typeBeds = beds.Where(b => b.BedType == bedType).ToList();
            
            return new BedTypeCapacity
            {
                Total = typeBeds.Count,
                Available = typeBeds.Count(b => b.BedStatus == "Available"),
                Occupied = typeBeds.Count(b => b.BedStatus == "Occupied"),
                UnderMaintenance = typeBeds.Count(b => b.BedStatus == "Under_Maintenance"),
                Reserved = typeBeds.Count(b => b.BedStatus == "Reserved")
            };
        }

        #endregion

        #region Bed Inventory

        public async Task<List<BedInventoryDto>> GetBedInventoryAsync(Guid branchId, Guid tenantId, string? bedType = null, string? bedStatus = null)
        {
            var query = _context.Set<BedInventory>()
                .Where(b => b.BranchId == branchId && b.TenantId == tenantId && b.DeletedAt == null);

            if (!string.IsNullOrEmpty(bedType))
                query = query.Where(b => b.BedType == bedType);

            if (!string.IsNullOrEmpty(bedStatus))
                query = query.Where(b => b.BedStatus == bedStatus);

            var beds = await query
                .Include(b => b.Patient)
                .OrderBy(b => b.BedNumber)
                .ToListAsync();

            return beds.Select(b => new BedInventoryDto
            {
                Id = b.Id,
                BedNumber = b.BedNumber,
                BedType = b.BedType,
                BedStatus = b.BedStatus,
                FloorNumber = b.FloorNumber,
                RoomNumber = b.RoomNumber,
                WardName = b.WardName,
                PatientId = b.PatientId,
                PatientName = b.Patient != null ? $"{b.Patient.FirstName} {b.Patient.LastName}" : null,
                AssignedAt = b.AssignedAt,
                ExpectedDischargeAt = b.ExpectedDischargeAt,
                EquipmentAvailable = b.EquipmentAvailable,
                IsIsolationBed = b.IsIsolationBed
            }).ToList();
        }

        public async Task<List<BedInventoryDto>> GetAvailableBedsAsync(Guid branchId, Guid tenantId, string? bedType = null)
        {
            return await GetBedInventoryAsync(branchId, tenantId, bedType, "Available");
        }

        public async Task<BedInventory> UpdateBedStatusAsync(Guid bedId, string bedStatus, Guid? patientId, DateTime? expectedDischarge, Guid tenantId, Guid updatedByUserId)
        {
            var bed = await _context.Set<BedInventory>()
                .Where(b => b.Id == bedId && b.TenantId == tenantId && b.DeletedAt == null)
                .FirstOrDefaultAsync();

            if (bed == null)
                throw new KeyNotFoundException($"Bed with ID {bedId} not found");

            bed.BedStatus = bedStatus;
            bed.PatientId = patientId;
            bed.ExpectedDischargeAt = expectedDischarge;
            bed.UpdatedAt = DateTime.UtcNow;
            bed.UpdatedByUserId = updatedByUserId;

            if (bedStatus == "Occupied" && patientId.HasValue)
            {
                bed.AssignedAt = DateTime.UtcNow;
            }
            else if (bedStatus == "Available")
            {
                bed.PatientId = null;
                bed.AssignedAt = null;
                bed.ExpectedDischargeAt = null;
            }

            await _context.SaveChangesAsync();

            // Trigger capacity recalculation (database trigger will handle this)
            await CreateCapacitySnapshotAsync(bed.BranchId, tenantId);

            // Broadcast bed status change via SignalR to all clients monitoring this branch
            await _hubContext.Clients.Group($"Branch_{bed.BranchId}").SendAsync("BedStatusChanged", new
            {
                branchId = bed.BranchId,
                bedId = bed.Id,
                bedNumber = bed.BedNumber,
                bedType = bed.BedType,
                newStatus = bedStatus,
                patientId,
                timestamp = DateTime.UtcNow
            });

            // Broadcast updated capacity summary
            var summary = await GetCapacitySummaryAsync(bed.BranchId, tenantId);
            await _hubContext.Clients.Group($"Branch_{bed.BranchId}").SendAsync("CapacityUpdated", new
            {
                branchId = bed.BranchId,
                summary,
                timestamp = DateTime.UtcNow
            });

            // Send alert if capacity reaches warning/critical thresholds
            if (summary.CapacityAlertLevel == "critical" || summary.CapacityAlertLevel == "warning")
            {
                await _hubContext.Clients.Group($"Branch_{bed.BranchId}").SendAsync("CapacityAlert", new
                {
                    branchId = bed.BranchId,
                    alertLevel = summary.CapacityAlertLevel,
                    occupancyPercentage = summary.OccupancyPercentage,
                    availableBeds = summary.AvailableBeds,
                    totalBeds = summary.TotalBeds,
                    timestamp = DateTime.UtcNow
                });
            }

            return bed;
        }

        public async Task<BedInventory> CreateBedAsync(BedInventory bed, Guid currentUserId)
        {
            bed.Id = Guid.NewGuid();
            bed.CreatedAt = DateTime.UtcNow;
            bed.CreatedByUserId = currentUserId;
            bed.Status = "active";

            _context.Set<BedInventory>().Add(bed);
            await _context.SaveChangesAsync();

            // Trigger capacity recalculation
            await CreateCapacitySnapshotAsync(bed.BranchId, bed.TenantId);

            return bed;
        }

        #endregion

        #region Transfer Requests

        public async Task<PatientTransferRequest> CreateTransferRequestAsync(CreateTransferRequestDto request, Guid tenantId, Guid requestedByUserId)
        {
            // Validate branches exist
            var fromBranch = await _context.Branches.FindAsync(request.FromBranchId);
            var toBranch = await _context.Branches.FindAsync(request.ToBranchId);

            if (fromBranch == null || toBranch == null)
                throw new KeyNotFoundException("One or both branches not found");

            if (request.FromBranchId == request.ToBranchId)
                throw new InvalidOperationException("Cannot transfer patient to the same branch");

            // Check if target branch has available beds
            var availableBeds = await GetAvailableBedsAsync(request.ToBranchId, tenantId, request.RequiredBedType);
            if (availableBeds.Count == 0)
                throw new InvalidOperationException($"No available {request.RequiredBedType ?? "beds"} at target branch");

            var transferRequest = new PatientTransferRequest
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                PatientId = request.PatientId,
                FromBranchId = request.FromBranchId,
                ToBranchId = request.ToBranchId,
                RequestedByUserId = requestedByUserId,
                RequestDate = DateTime.UtcNow,
                TransferReason = request.TransferReason,
                RequiredBedType = request.RequiredBedType,
                TransferStatus = "pending",
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = requestedByUserId,
                Status = "active"
            };

            _context.Set<PatientTransferRequest>().Add(transferRequest);
            await _context.SaveChangesAsync();

            return transferRequest;
        }

        public async Task<List<PatientTransferRequest>> GetPendingTransferRequestsAsync(Guid tenantId, Guid? branchId = null)
        {
            var query = _context.Set<PatientTransferRequest>()
                .Where(t => t.TenantId == tenantId && t.TransferStatus == "pending" && t.DeletedAt == null);

            if (branchId.HasValue)
            {
                query = query.Where(t => t.FromBranchId == branchId.Value || t.ToBranchId == branchId.Value);
            }

            return await query
                .Include(t => t.Patient)
                .Include(t => t.FromBranch)
                .Include(t => t.ToBranch)
                .OrderBy(t => t.RequestDate)
                .ToListAsync();
        }

        public async Task<PatientTransferRequest> ApproveTransferRequestAsync(Guid requestId, Guid approvedByUserId, Guid? assignedBedId, Guid tenantId)
        {
            var request = await _context.Set<PatientTransferRequest>()
                .Where(t => t.Id == requestId && t.TenantId == tenantId && t.DeletedAt == null)
                .FirstOrDefaultAsync();

            if (request == null)
                throw new KeyNotFoundException($"Transfer request {requestId} not found");

            if (request.TransferStatus != "pending")
                throw new InvalidOperationException($"Cannot approve transfer request with status {request.TransferStatus}");

            request.TransferStatus = "approved";
            request.ApprovedByUserId = approvedByUserId;
            request.ApprovedAt = DateTime.UtcNow;
            request.AssignedBedId = assignedBedId;
            request.UpdatedAt = DateTime.UtcNow;
            request.UpdatedByUserId = approvedByUserId;

            await _context.SaveChangesAsync();

            // Broadcast transfer approval to both branches via SignalR
            await _hubContext.Clients.Groups($"Branch_{request.FromBranchId}", $"Branch_{request.ToBranchId}").SendAsync("TransferUpdated", new
            {
                fromBranchId = request.FromBranchId,
                toBranchId = request.ToBranchId,
                patientId = request.PatientId,
                status = "approved",
                assignedBedId = request.AssignedBedId,
                approvedAt = request.ApprovedAt,
                timestamp = DateTime.UtcNow
            });

            return request;
        }

        public async Task<PatientTransferRequest> RejectTransferRequestAsync(Guid requestId, string rejectedReason, Guid approvedByUserId, Guid tenantId)
        {
            var request = await _context.Set<PatientTransferRequest>()
                .Where(t => t.Id == requestId && t.TenantId == tenantId && t.DeletedAt == null)
                .FirstOrDefaultAsync();

            if (request == null)
                throw new KeyNotFoundException($"Transfer request {requestId} not found");

            if (request.TransferStatus != "pending")
                throw new InvalidOperationException($"Cannot reject transfer request with status {request.TransferStatus}");

            request.TransferStatus = "rejected";
            request.RejectedReason = rejectedReason;
            request.ApprovedByUserId = approvedByUserId;
            request.ApprovedAt = DateTime.UtcNow;
            request.UpdatedAt = DateTime.UtcNow;
            request.UpdatedByUserId = approvedByUserId;

            await _context.SaveChangesAsync();

            return request;
        }

        public async Task<PatientTransferRequest> CompleteTransferAsync(Guid requestId, Guid tenantId, Guid completedByUserId)
        {
            var request = await _context.Set<PatientTransferRequest>()
                .Where(t => t.Id == requestId && t.TenantId == tenantId && t.DeletedAt == null)
                .FirstOrDefaultAsync();

            if (request == null)
                throw new KeyNotFoundException($"Transfer request {requestId} not found");

            if (request.TransferStatus != "approved")
                throw new InvalidOperationException($"Cannot complete transfer request with status {request.TransferStatus}");

            // NOTE: Patient entity doesn't have BranchId field in the current schema
            // Patient's current branch is determined by which bed they occupy (bed_inventory table)
            // This design allows tracking patient location through bed assignments

            // Mark old bed as available
            var oldBed = await _context.Set<BedInventory>()
                .Where(b => b.BranchId == request.FromBranchId && b.PatientId == request.PatientId && b.DeletedAt == null)
                .FirstOrDefaultAsync();

            if (oldBed != null)
            {
                await UpdateBedStatusAsync(oldBed.Id, "Available", null, null, tenantId, completedByUserId);
            }

            // Mark new bed as occupied
            if (request.AssignedBedId.HasValue)
            {
                await UpdateBedStatusAsync(request.AssignedBedId.Value, "Occupied", request.PatientId, null, tenantId, completedByUserId);
            }

            request.TransferStatus = "completed";
            request.TransferredAt = DateTime.UtcNow;
            request.UpdatedAt = DateTime.UtcNow;
            request.UpdatedByUserId = completedByUserId;

            await _context.SaveChangesAsync();

            return request;
        }

        #endregion

        #region Capacity History & Analytics

        public async Task<List<BranchCapacityHistory>> GetCapacityHistoryAsync(Guid branchId, Guid tenantId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var query = _context.Set<BranchCapacityHistory>()
                .Where(h => h.BranchId == branchId && h.TenantId == tenantId);

            if (startDate.HasValue)
                query = query.Where(h => h.SnapshotTime >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(h => h.SnapshotTime <= endDate.Value);

            return await query
                .OrderByDescending(h => h.SnapshotTime)
                .Take(100) // Limit to last 100 snapshots
                .ToListAsync();
        }

        public async Task CreateCapacitySnapshotAsync(Guid branchId, Guid tenantId)
        {
            var summary = await GetCapacitySummaryAsync(branchId, tenantId);

            var snapshot = new BranchCapacityHistory
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                BranchId = branchId,
                SnapshotTime = DateTime.UtcNow,
                TotalBeds = summary.TotalBeds,
                GeneralBedsOccupied = summary.GeneralBeds.Occupied,
                IcuBedsOccupied = summary.IcuBeds.Occupied,
                EmergencyBedsOccupied = summary.EmergencyBeds.Occupied,
                AvailableBeds = summary.AvailableBeds,
                OccupancyPercentage = summary.OccupancyPercentage,
                CapacityAlertLevel = summary.CapacityAlertLevel,
                CreatedAt = DateTime.UtcNow
            };

            _context.Set<BranchCapacityHistory>().Add(snapshot);
            await _context.SaveChangesAsync();
        }

        public async Task<string> CalculateCapacityAlertLevelAsync(Guid branchId, Guid tenantId)
        {
            var summary = await GetCapacitySummaryAsync(branchId, tenantId);
            return summary.CapacityAlertLevel;
        }

        #endregion
    }
}
