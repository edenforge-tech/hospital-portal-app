using AuthService.Context;
using AuthService.DTOs;
using AuthService.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace AuthService.Services
{
    public class ElectrophysiologyService : IElectrophysiologyService
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ElectrophysiologyService(AppDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        private Guid GetCurrentTenantId()
        {
            var tenantIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("TenantId")?.Value;
            return tenantIdClaim != null ? Guid.Parse(tenantIdClaim) : Guid.Empty;
        }

        public async Task<(List<ElectrophysiologyTestDto> Tests, int TotalCount)> GetAllAsync(
            int page = 1,
            int pageSize = 10,
            string? search = null,
            string? testType = null,
            Guid? patientId = null,
            Guid? branchId = null)
        {
            var tenantId = GetCurrentTenantId();

            var query = _context.ElectrophysiologyTests
                .Include(t => t.Patient)
                .Where(t => t.TenantId == tenantId && t.DeletedAt == null);

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(t =>
                    t.Patient!.FirstName.Contains(search) ||
                    t.Patient.LastName.Contains(search) ||
                    t.Patient.MedicalRecordNumber.Contains(search));
            }

            if (!string.IsNullOrEmpty(testType))
            {
                query = query.Where(t => t.TestType == testType);
            }

            if (patientId.HasValue)
            {
                query = query.Where(t => t.PatientId == patientId.Value);
            }

            if (branchId.HasValue)
            {
                query = query.Where(t => t.BranchId == branchId.Value);
            }

            var totalCount = await query.CountAsync();

            var tests = await query
                .OrderByDescending(t => t.TestDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var testDtos = tests.Select(t => new ElectrophysiologyTestDto
            {
                Id = t.Id,
                TenantId = t.TenantId,
                BranchId = t.BranchId,
                PatientId = t.PatientId,
                PatientName = t.Patient != null ? $"{t.Patient.FirstName} {t.Patient.LastName}" : "Unknown",
                PatientMRN = t.Patient?.MedicalRecordNumber ?? "N/A",
                TechnicianId = t.TechnicianId,
                TestDate = t.TestDate,
                TestType = t.TestType,
                Eye = t.EyeTested,
                EyeTested = t.EyeTested,
                Device = t.Device,
                ScotopicAWave = t.ScotopicAWave,
                ScotopicBWave = t.ScotopicBWave,
                PhotopicAWave = t.PhotopicAWave,
                PhotopicBWave = t.PhotopicBWave,
                FlickerResponse = t.FlickerResponse,
                P100Latency = t.P100Latency,
                P100Amplitude = t.P100Amplitude,
                ArdenRatio = t.ArdenRatio,
                LightPeak = t.LightPeak,
                DarkTrough = t.DarkTrough,
                Interpretation = t.Interpretation,
                AbnormalityType = t.AbnormalityType,
                WaveformData = string.IsNullOrEmpty(t.WaveformData)
                    ? null
                    : t.WaveformData,
                ImagePaths = string.IsNullOrEmpty(t.ImagePaths)
                    ? new List<string>()
                    : JsonSerializer.Deserialize<List<string>>(t.ImagePaths) ?? new List<string>(),
                Notes = t.Notes,
                Status = t.Status,
                CreatedAt = t.CreatedAt
            }).ToList();

            return (testDtos, totalCount);
        }

        public async Task<ElectrophysiologyTestDto?> GetByIdAsync(Guid id)
        {
            var tenantId = GetCurrentTenantId();

            var test = await _context.ElectrophysiologyTests
                .Include(t => t.Patient)
                .FirstOrDefaultAsync(t => t.Id == id && t.TenantId == tenantId && t.DeletedAt == null);

            if (test == null) return null;

            return new ElectrophysiologyTestDto
            {
                Id = test.Id,
                TenantId = test.TenantId,
                BranchId = test.BranchId,
                PatientId = test.PatientId,
                PatientName = test.Patient != null ? $"{test.Patient.FirstName} {test.Patient.LastName}" : "Unknown",
                PatientMRN = test.Patient?.MedicalRecordNumber ?? "N/A",
                TechnicianId = test.TechnicianId,
                TestDate = test.TestDate,
                TestType = test.TestType,
                Eye = test.EyeTested,
                EyeTested = test.EyeTested,
                Device = test.Device,
                ScotopicAWave = test.ScotopicAWave,
                ScotopicBWave = test.ScotopicBWave,
                PhotopicAWave = test.PhotopicAWave,
                PhotopicBWave = test.PhotopicBWave,
                FlickerResponse = test.FlickerResponse,
                P100Latency = test.P100Latency,
                P100Amplitude = test.P100Amplitude,
                ArdenRatio = test.ArdenRatio,
                LightPeak = test.LightPeak,
                DarkTrough = test.DarkTrough,
                Interpretation = test.Interpretation,
                AbnormalityType = test.AbnormalityType,
                WaveformData = test.WaveformData,
                ImagePaths = string.IsNullOrEmpty(test.ImagePaths)
                    ? new List<string>()
                    : JsonSerializer.Deserialize<List<string>>(test.ImagePaths) ?? new List<string>(),
                Notes = test.Notes,
                Status = test.Status,
                CreatedAt = test.CreatedAt
            };
        }

        public async Task<List<ElectrophysiologyTestDto>> GetByPatientAsync(Guid patientId)
        {
            var tenantId = GetCurrentTenantId();

            var tests = await _context.ElectrophysiologyTests
                .Include(t => t.Patient)
                .Where(t => t.PatientId == patientId && t.TenantId == tenantId && t.DeletedAt == null)
                .OrderByDescending(t => t.TestDate)
                .ToListAsync();

            return tests.Select(t => new ElectrophysiologyTestDto
            {
                Id = t.Id,
                TenantId = t.TenantId,
                BranchId = t.BranchId,
                PatientId = t.PatientId,
                PatientName = t.Patient != null ? $"{t.Patient.FirstName} {t.Patient.LastName}" : "Unknown",
                PatientMRN = t.Patient?.MedicalRecordNumber ?? "N/A",
                TechnicianId = t.TechnicianId,
                TestDate = t.TestDate,
                TestType = t.TestType,
                Eye = t.EyeTested,
                EyeTested = t.EyeTested,
                Device = t.Device,
                ScotopicAWave = t.ScotopicAWave,
                ScotopicBWave = t.ScotopicBWave,
                PhotopicAWave = t.PhotopicAWave,
                PhotopicBWave = t.PhotopicBWave,
                FlickerResponse = t.FlickerResponse,
                P100Latency = t.P100Latency,
                P100Amplitude = t.P100Amplitude,
                ArdenRatio = t.ArdenRatio,
                LightPeak = t.LightPeak,
                DarkTrough = t.DarkTrough,
                Interpretation = t.Interpretation,
                AbnormalityType = t.AbnormalityType,
                WaveformData = t.WaveformData,
                ImagePaths = string.IsNullOrEmpty(t.ImagePaths)
                    ? new List<string>()
                    : JsonSerializer.Deserialize<List<string>>(t.ImagePaths) ?? new List<string>(),
                Notes = t.Notes,
                Status = t.Status,
                CreatedAt = t.CreatedAt
            }).ToList();
        }

        public async Task<ElectrophysiologyStatisticsDto> GetStatisticsAsync(Guid? branchId = null)
        {
            var tenantId = GetCurrentTenantId();

            var query = _context.ElectrophysiologyTests
                .Where(t => t.TenantId == tenantId && t.DeletedAt == null);

            if (branchId.HasValue)
            {
                query = query.Where(t => t.BranchId == branchId.Value);
            }

            var totalTests = await query.CountAsync();
            var thisWeek = await query.CountAsync(t => t.TestDate >= DateTime.UtcNow.AddDays(-7));

            var ergTests = await query.CountAsync(t => t.TestType == "ERG");
            var vepTests = await query.CountAsync(t => t.TestType == "VEP");
            var eogTests = await query.CountAsync(t => t.TestType == "EOG");

            var normalCount = await query.CountAsync(t => t.Interpretation == "Normal");
            var abnormalCount = await query.CountAsync(t => t.Interpretation == "Abnormal");

            var abnormalRate = totalTests > 0
                ? (decimal)abnormalCount / totalTests * 100
                : 0;

            return new ElectrophysiologyStatisticsDto
            {
                TotalTests = totalTests,
                ThisWeek = thisWeek,
                ErgTests = ergTests,
                VepTests = vepTests,
                EogTests = eogTests,
                NormalCount = normalCount,
                AbnormalCount = abnormalCount,
                AbnormalRate = abnormalRate
            };
        }

        public async Task<ElectrophysiologyTestDto> CreateAsync(ElectrophysiologyTestDto dto)
        {
            var tenantId = GetCurrentTenantId();

            var test = new ElectrophysiologyTest
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                BranchId = dto.BranchId,
                PatientId = dto.PatientId,
                TechnicianId = dto.TechnicianId,
                TestDate = dto.TestDate,
                TestType = dto.TestType,
                EyeTested = dto.EyeTested,
                Device = dto.Device,
                ScotopicAWave = dto.ScotopicAWave,
                ScotopicBWave = dto.ScotopicBWave,
                PhotopicAWave = dto.PhotopicAWave,
                PhotopicBWave = dto.PhotopicBWave,
                FlickerResponse = dto.FlickerResponse,
                P100Latency = dto.P100Latency,
                P100Amplitude = dto.P100Amplitude,
                ArdenRatio = dto.ArdenRatio,
                LightPeak = dto.LightPeak,
                DarkTrough = dto.DarkTrough,
                Interpretation = dto.Interpretation,
                AbnormalityType = dto.AbnormalityType,
                WaveformData = dto.WaveformData,
                ImagePaths = dto.ImagePaths != null && dto.ImagePaths.Any()
                    ? JsonSerializer.Serialize(dto.ImagePaths)
                    : null,
                Notes = dto.Notes,
                Status = "active",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.ElectrophysiologyTests.Add(test);
            await _context.SaveChangesAsync();

            dto.Id = test.Id;
            dto.TenantId = test.TenantId;
            dto.Status = test.Status;
            dto.CreatedAt = test.CreatedAt;

            return dto;
        }

        public async Task<ElectrophysiologyTestDto> UpdateAsync(Guid id, ElectrophysiologyTestDto dto)
        {
            var tenantId = GetCurrentTenantId();

            var test = await _context.ElectrophysiologyTests
                .FirstOrDefaultAsync(t => t.Id == id && t.TenantId == tenantId && t.DeletedAt == null);

            if (test == null)
                throw new KeyNotFoundException($"Electrophysiology test with ID {id} not found");

            test.BranchId = dto.BranchId;
            test.PatientId = dto.PatientId;
            test.TechnicianId = dto.TechnicianId;
            test.TestDate = dto.TestDate;
            test.TestType = dto.TestType;
            test.EyeTested = dto.EyeTested;
            test.Device = dto.Device;
            test.ScotopicAWave = dto.ScotopicAWave;
            test.ScotopicBWave = dto.ScotopicBWave;
            test.PhotopicAWave = dto.PhotopicAWave;
            test.PhotopicBWave = dto.PhotopicBWave;
            test.FlickerResponse = dto.FlickerResponse;
            test.P100Latency = dto.P100Latency;
            test.P100Amplitude = dto.P100Amplitude;
            test.ArdenRatio = dto.ArdenRatio;
            test.LightPeak = dto.LightPeak;
            test.DarkTrough = dto.DarkTrough;
            test.Interpretation = dto.Interpretation;
            test.AbnormalityType = dto.AbnormalityType;
            test.WaveformData = dto.WaveformData;
            test.ImagePaths = dto.ImagePaths != null && dto.ImagePaths.Any()
                ? JsonSerializer.Serialize(dto.ImagePaths)
                : null;
            test.Notes = dto.Notes;
            test.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return dto;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var tenantId = GetCurrentTenantId();

            var test = await _context.ElectrophysiologyTests
                .FirstOrDefaultAsync(t => t.Id == id && t.TenantId == tenantId && t.DeletedAt == null);

            if (test == null) return false;

            test.DeletedAt = DateTime.UtcNow;
            test.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<ElectrophysiologyTestDto>> SearchAsync(string query)
        {
            var tenantId = GetCurrentTenantId();

            var tests = await _context.ElectrophysiologyTests
                .Include(t => t.Patient)
                .Where(t => t.TenantId == tenantId && t.DeletedAt == null &&
                    (t.Patient!.FirstName.Contains(query) ||
                     t.Patient.LastName.Contains(query) ||
                     t.Patient.MedicalRecordNumber.Contains(query) ||
                     t.TestType!.Contains(query)))
                .OrderByDescending(t => t.TestDate)
                .Take(20)
                .ToListAsync();

            return tests.Select(t => new ElectrophysiologyTestDto
            {
                Id = t.Id,
                TenantId = t.TenantId,
                BranchId = t.BranchId,
                PatientId = t.PatientId,
                PatientName = t.Patient != null ? $"{t.Patient.FirstName} {t.Patient.LastName}" : "Unknown",
                PatientMRN = t.Patient?.MedicalRecordNumber ?? "N/A",
                TechnicianId = t.TechnicianId,
                TestDate = t.TestDate,
                TestType = t.TestType,
                Eye = t.EyeTested,
                EyeTested = t.EyeTested,
                Device = t.Device,
                ScotopicAWave = t.ScotopicAWave,
                ScotopicBWave = t.ScotopicBWave,
                PhotopicAWave = t.PhotopicAWave,
                PhotopicBWave = t.PhotopicBWave,
                FlickerResponse = t.FlickerResponse,
                P100Latency = t.P100Latency,
                P100Amplitude = t.P100Amplitude,
                ArdenRatio = t.ArdenRatio,
                LightPeak = t.LightPeak,
                DarkTrough = t.DarkTrough,
                Interpretation = t.Interpretation,
                AbnormalityType = t.AbnormalityType,
                WaveformData = t.WaveformData,
                ImagePaths = string.IsNullOrEmpty(t.ImagePaths)
                    ? new List<string>()
                    : JsonSerializer.Deserialize<List<string>>(t.ImagePaths) ?? new List<string>(),
                Notes = t.Notes,
                Status = t.Status,
                CreatedAt = t.CreatedAt
            }).ToList();
        }
    }
}
