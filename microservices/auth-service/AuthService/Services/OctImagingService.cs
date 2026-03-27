using AuthService.Context;
using AuthService.DTOs;
using AuthService.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace AuthService.Services
{
    public class OctImagingService : IOctImagingService
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public OctImagingService(AppDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        private Guid GetCurrentTenantId()
        {
            var tenantIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("TenantId")?.Value;
            return tenantIdClaim != null ? Guid.Parse(tenantIdClaim) : Guid.Empty;
        }

        public async Task<(List<OctImagingScanDto> Scans, int TotalCount)> GetAllAsync(
            int page = 1,
            int pageSize = 10,
            string? search = null,
            string? scanType = null,
            Guid? patientId = null,
            Guid? branchId = null)
        {
            var tenantId = GetCurrentTenantId();

            var query = _context.OctImagingScans
                .Include(s => s.Patient)
                .Where(s => s.TenantId == tenantId && s.DeletedAt == null);

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(s =>
                    s.Patient!.FirstName.Contains(search) ||
                    s.Patient.LastName.Contains(search) ||
                    s.Patient.MedicalRecordNumber.Contains(search));
            }

            if (!string.IsNullOrEmpty(scanType))
            {
                query = query.Where(s => s.ScanType == scanType);
            }

            if (patientId.HasValue)
            {
                query = query.Where(s => s.PatientId == patientId.Value);
            }

            if (branchId.HasValue)
            {
                query = query.Where(s => s.BranchId == branchId.Value);
            }

            var totalCount = await query.CountAsync();

            var scans = await query
                .OrderByDescending(s => s.ScanDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var scanDtos = scans.Select(s => new OctImagingScanDto
            {
                Id = s.Id,
                TenantId = s.TenantId,
                BranchId = s.BranchId,
                PatientId = s.PatientId,
                PatientName = s.Patient != null ? $"{s.Patient.FirstName} {s.Patient.LastName}" : "Unknown",
                PatientMRN = s.Patient?.MedicalRecordNumber ?? "N/A",
                TechnicianId = s.TechnicianId,
                ScanDate = s.ScanDate,
                Eye = s.Eye,
                Device = s.Device,
                ScanType = s.ScanType,
                ScanPattern = s.ScanPattern,
                ScanSize = s.ScanSize,
                CentralThickness = s.CentralThickness,
                AverageThickness = s.AverageThickness,
                Volume = s.Volume,
                RnflAverage = s.RnflAverage,
                GclThickness = s.GclThickness,
                PathologyDetected = s.PathologyDetected,
                PathologyType = s.PathologyType,
                FluidDetected = s.FluidDetected,
                FluidType = s.FluidType,
                SignalStrength = s.SignalStrength,
                QualityScore = s.QualityScore,
                ImagePaths = string.IsNullOrEmpty(s.ImagePaths)
                    ? new List<string>()
                    : JsonSerializer.Deserialize<List<string>>(s.ImagePaths) ?? new List<string>(),
                DataFilePath = s.DataFilePath,
                ThumbnailPath = s.ThumbnailPath,
                Notes = s.Notes,
                Status = s.Status,
                CreatedAt = s.CreatedAt
            }).ToList();

            return (scanDtos, totalCount);
        }

        public async Task<OctImagingScanDto?> GetByIdAsync(Guid id)
        {
            var tenantId = GetCurrentTenantId();

            var scan = await _context.OctImagingScans
                .Include(s => s.Patient)
                .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId && s.DeletedAt == null);

            if (scan == null) return null;

            return new OctImagingScanDto
            {
                Id = scan.Id,
                TenantId = scan.TenantId,
                BranchId = scan.BranchId,
                PatientId = scan.PatientId,
                PatientName = scan.Patient != null ? $"{scan.Patient.FirstName} {scan.Patient.LastName}" : "Unknown",
                PatientMRN = scan.Patient?.MedicalRecordNumber ?? "N/A",
                TechnicianId = scan.TechnicianId,
                ScanDate = scan.ScanDate,
                Eye = scan.Eye,
                Device = scan.Device,
                ScanType = scan.ScanType,
                ScanPattern = scan.ScanPattern,
                ScanSize = scan.ScanSize,
                CentralThickness = scan.CentralThickness,
                AverageThickness = scan.AverageThickness,
                Volume = scan.Volume,
                RnflAverage = scan.RnflAverage,
                GclThickness = scan.GclThickness,
                PathologyDetected = scan.PathologyDetected,
                PathologyType = scan.PathologyType,
                FluidDetected = scan.FluidDetected,
                FluidType = scan.FluidType,
                SignalStrength = scan.SignalStrength,
                QualityScore = scan.QualityScore,
                ImagePaths = string.IsNullOrEmpty(scan.ImagePaths)
                    ? new List<string>()
                    : JsonSerializer.Deserialize<List<string>>(scan.ImagePaths) ?? new List<string>(),
                DataFilePath = scan.DataFilePath,
                ThumbnailPath = scan.ThumbnailPath,
                Notes = scan.Notes,
                Status = scan.Status,
                CreatedAt = scan.CreatedAt
            };
        }

        public async Task<List<OctImagingScanDto>> GetByPatientAsync(Guid patientId)
        {
            var tenantId = GetCurrentTenantId();

            var scans = await _context.OctImagingScans
                .Include(s => s.Patient)
                .Where(s => s.PatientId == patientId && s.TenantId == tenantId && s.DeletedAt == null)
                .OrderByDescending(s => s.ScanDate)
                .ToListAsync();

            return scans.Select(s => new OctImagingScanDto
            {
                Id = s.Id,
                TenantId = s.TenantId,
                BranchId = s.BranchId,
                PatientId = s.PatientId,
                PatientName = s.Patient != null ? $"{s.Patient.FirstName} {s.Patient.LastName}" : "Unknown",
                PatientMRN = s.Patient?.MedicalRecordNumber ?? "N/A",
                TechnicianId = s.TechnicianId,
                ScanDate = s.ScanDate,
                Eye = s.Eye,
                Device = s.Device,
                ScanType = s.ScanType,
                ScanPattern = s.ScanPattern,
                ScanSize = s.ScanSize,
                CentralThickness = s.CentralThickness,
                AverageThickness = s.AverageThickness,
                Volume = s.Volume,
                RnflAverage = s.RnflAverage,
                GclThickness = s.GclThickness,
                PathologyDetected = s.PathologyDetected,
                PathologyType = s.PathologyType,
                FluidDetected = s.FluidDetected,
                FluidType = s.FluidType,
                SignalStrength = s.SignalStrength,
                QualityScore = s.QualityScore,
                ImagePaths = string.IsNullOrEmpty(s.ImagePaths)
                    ? new List<string>()
                    : JsonSerializer.Deserialize<List<string>>(s.ImagePaths) ?? new List<string>(),
                DataFilePath = s.DataFilePath,
                ThumbnailPath = s.ThumbnailPath,
                Notes = s.Notes,
                Status = s.Status,
                CreatedAt = s.CreatedAt
            }).ToList();
        }

        public async Task<OctStatisticsDto> GetStatisticsAsync(Guid? branchId = null)
        {
            var tenantId = GetCurrentTenantId();

            var query = _context.OctImagingScans
                .Where(s => s.TenantId == tenantId && s.DeletedAt == null);

            if (branchId.HasValue)
            {
                query = query.Where(s => s.BranchId == branchId.Value);
            }

            var totalScans = await query.CountAsync();
            var thisWeek = await query.CountAsync(s => s.ScanDate >= DateTime.UtcNow.AddDays(-7));

            var maculaScans = await query.CountAsync(s => s.ScanType == "Macula");
            var opticDiscScans = await query.CountAsync(s => s.ScanType == "Optic Disc");
            var anteriorSegmentScans = await query.CountAsync(s => s.ScanType == "Anterior Segment");
            var widefieldScans = await query.CountAsync(s => s.ScanType == "Widefield");

            var pathologyDetectedCount = await query.CountAsync(s => s.PathologyDetected);
            var pathologyRate = totalScans > 0
                ? (decimal)pathologyDetectedCount / totalScans * 100
                : 0;

            var scansWithSignalStrength = await query
                .Where(s => s.SignalStrength.HasValue)
                .Select(s => s.SignalStrength!.Value)
                .ToListAsync();

            var averageSignalStrength = scansWithSignalStrength.Any()
                ? scansWithSignalStrength.Average()
                : 0;

            return new OctStatisticsDto
            {
                TotalScans = totalScans,
                ThisWeek = thisWeek,
                MaculaScans = maculaScans,
                OpticDiscScans = opticDiscScans,
                AnteriorSegmentScans = anteriorSegmentScans,
                WidefieldScans = widefieldScans,
                PathologyDetectedCount = pathologyDetectedCount,
                PathologyRate = pathologyRate,
                AverageSignalStrength = (decimal)averageSignalStrength
            };
        }

        public async Task<OctImagingScanDto> CreateAsync(OctImagingScanDto dto)
        {
            var tenantId = GetCurrentTenantId();

            var scan = new OctImagingScan
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                BranchId = dto.BranchId,
                PatientId = dto.PatientId,
                TechnicianId = dto.TechnicianId,
                ScanDate = dto.ScanDate,
                Eye = dto.Eye,
                Device = dto.Device,
                ScanType = dto.ScanType,
                ScanPattern = dto.ScanPattern,
                ScanSize = dto.ScanSize,
                CentralThickness = dto.CentralThickness,
                AverageThickness = dto.AverageThickness,
                Volume = dto.Volume,
                RnflAverage = dto.RnflAverage,
                GclThickness = dto.GclThickness,
                PathologyDetected = dto.PathologyDetected,
                PathologyType = dto.PathologyType,
                FluidDetected = dto.FluidDetected,
                FluidType = dto.FluidType,
                SignalStrength = dto.SignalStrength,
                QualityScore = dto.QualityScore,
                ImagePaths = dto.ImagePaths != null && dto.ImagePaths.Any()
                    ? JsonSerializer.Serialize(dto.ImagePaths)
                    : null,
                DataFilePath = dto.DataFilePath,
                ThumbnailPath = dto.ThumbnailPath,
                Notes = dto.Notes,
                Status = "active",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.OctImagingScans.Add(scan);
            await _context.SaveChangesAsync();

            dto.Id = scan.Id;
            dto.TenantId = scan.TenantId;
            dto.Status = scan.Status;
            dto.CreatedAt = scan.CreatedAt;

            return dto;
        }

        public async Task<OctImagingScanDto> UpdateAsync(Guid id, OctImagingScanDto dto)
        {
            var tenantId = GetCurrentTenantId();

            var scan = await _context.OctImagingScans
                .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId && s.DeletedAt == null);

            if (scan == null)
                throw new KeyNotFoundException($"OCT scan with ID {id} not found");

            scan.BranchId = dto.BranchId;
            scan.PatientId = dto.PatientId;
            scan.TechnicianId = dto.TechnicianId;
            scan.ScanDate = dto.ScanDate;
            scan.Eye = dto.Eye;
            scan.Device = dto.Device;
            scan.ScanType = dto.ScanType;
            scan.ScanPattern = dto.ScanPattern;
            scan.ScanSize = dto.ScanSize;
            scan.CentralThickness = dto.CentralThickness;
            scan.AverageThickness = dto.AverageThickness;
            scan.Volume = dto.Volume;
            scan.RnflAverage = dto.RnflAverage;
            scan.GclThickness = dto.GclThickness;
            scan.PathologyDetected = dto.PathologyDetected;
            scan.PathologyType = dto.PathologyType;
            scan.FluidDetected = dto.FluidDetected;
            scan.FluidType = dto.FluidType;
            scan.SignalStrength = dto.SignalStrength;
            scan.QualityScore = dto.QualityScore;
            scan.ImagePaths = dto.ImagePaths != null && dto.ImagePaths.Any()
                ? JsonSerializer.Serialize(dto.ImagePaths)
                : null;
            scan.DataFilePath = dto.DataFilePath;
            scan.ThumbnailPath = dto.ThumbnailPath;
            scan.Notes = dto.Notes;
            scan.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return dto;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var tenantId = GetCurrentTenantId();

            var scan = await _context.OctImagingScans
                .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId && s.DeletedAt == null);

            if (scan == null) return false;

            scan.DeletedAt = DateTime.UtcNow;
            scan.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<OctImagingScanDto>> SearchAsync(string query)
        {
            var tenantId = GetCurrentTenantId();

            var scans = await _context.OctImagingScans
                .Include(s => s.Patient)
                .Where(s => s.TenantId == tenantId && s.DeletedAt == null &&
                    (s.Patient!.FirstName.Contains(query) ||
                     s.Patient.LastName.Contains(query) ||
                     s.Patient.MedicalRecordNumber.Contains(query) ||
                     s.ScanType!.Contains(query)))
                .OrderByDescending(s => s.ScanDate)
                .Take(20)
                .ToListAsync();

            return scans.Select(s => new OctImagingScanDto
            {
                Id = s.Id,
                TenantId = s.TenantId,
                BranchId = s.BranchId,
                PatientId = s.PatientId,
                PatientName = s.Patient != null ? $"{s.Patient.FirstName} {s.Patient.LastName}" : "Unknown",
                PatientMRN = s.Patient?.MedicalRecordNumber ?? "N/A",
                TechnicianId = s.TechnicianId,
                ScanDate = s.ScanDate,
                Eye = s.Eye,
                Device = s.Device,
                ScanType = s.ScanType,
                ScanPattern = s.ScanPattern,
                ScanSize = s.ScanSize,
                CentralThickness = s.CentralThickness,
                AverageThickness = s.AverageThickness,
                Volume = s.Volume,
                RnflAverage = s.RnflAverage,
                GclThickness = s.GclThickness,
                PathologyDetected = s.PathologyDetected,
                PathologyType = s.PathologyType,
                FluidDetected = s.FluidDetected,
                FluidType = s.FluidType,
                SignalStrength = s.SignalStrength,
                QualityScore = s.QualityScore,
                ImagePaths = string.IsNullOrEmpty(s.ImagePaths)
                    ? new List<string>()
                    : JsonSerializer.Deserialize<List<string>>(s.ImagePaths) ?? new List<string>(),
                DataFilePath = s.DataFilePath,
                ThumbnailPath = s.ThumbnailPath,
                Notes = s.Notes,
                Status = s.Status,
                CreatedAt = s.CreatedAt
            }).ToList();
        }
    }
}
