using AuthService.Context;
using AuthService.Models.Domain;
using AuthService.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services
{
    public class ProcedureService : IProcedureService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ProcedureService> _logger;

        public ProcedureService(AppDbContext context, ILogger<ProcedureService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<object>> SearchProcedurePricingAsync(Guid tenantId, string? searchQuery)
        {
            // Query ServiceVariants (new catalog) for procedure pricing
            var query = _context.ServiceVariants
                .Include(v => v.CatalogService)
                    .ThenInclude(s => s.Category)
                .Where(v => v.IsActive &&
                            v.CatalogService.IsActive &&
                            v.CatalogService.Category.IsActive &&
                            (v.CatalogService.Category.Code != "DIAGNOSTICS" &&
                             v.CatalogService.Category.Code != "INVESTIGATIONS"));

            if (!string.IsNullOrWhiteSpace(searchQuery))
            {
                var search = searchQuery.ToLower();
                query = query.Where(v =>
                    v.VariantName.ToLower().Contains(search) ||
                    (v.VariantCode != null && v.VariantCode.ToLower().Contains(search)) ||
                    (v.Description != null && v.Description.ToLower().Contains(search))
                );
            }

            var procedures = await query
                .OrderBy(v => v.VariantName)
                .Select(v => new
                {
                    v.Id,
                    Code = v.VariantCode ?? "N/A",
                    Name = v.VariantName,
                    v.Description,
                    Category = v.CatalogService.Category.Name,
                })
                .Take(50)
                .ToListAsync();

            // Load global prices separately (DefaultPrice was removed during price normalisation)
            var ids = procedures.Select(p => p.Id).ToList();
            var priceMap = (await _context.VariantPrices
                .Where(p => ids.Contains(p.VariantId)
                         && p.BranchId == null
                         && p.EffectiveTo == null
                         && p.IsActive
                         && p.DeletedAt == null)
                .ToListAsync())
                .GroupBy(p => p.VariantId)
                .ToDictionary(g => g.Key,
                              g => g.OrderByDescending(p => p.EffectiveFrom).First().Amount);

            return procedures.Select(v => (object)new
            {
                v.Id,
                v.Code,
                v.Name,
                v.Description,
                v.Category,
                Price = priceMap.GetValueOrDefault(v.Id, 0m),
                TaxRate = 0m,
                TotalPrice = priceMap.GetValueOrDefault(v.Id, 0m)
            }).ToList();
        }

        public async Task<List<object>> GetOTAvailabilityAsync(Guid branchId, Guid? surgeonId, DateTime? date)
        {
            var targetDate = date?.Date ?? DateTime.UtcNow.Date;
            var startOfDay = targetDate;
            var endOfDay = targetDate.AddDays(1);

            // Get all appointments for OT on the target date (note: Appointment doesn't have BranchId)
            var otAppointments = await _context.Appointments
                .Where(a => a.AppointmentDate >= startOfDay &&
                           a.AppointmentDate < endOfDay &&
                           a.AppointmentType == "Surgery")
                .ToListAsync();

            if (surgeonId.HasValue)
            {
                otAppointments = otAppointments.Where(a => a.DoctorId == surgeonId.Value).ToList();
            }

            // Define OT hours (8 AM to 6 PM)
            var otSlots = new List<object>();
            for (int hour = 8; hour < 18; hour++)
            {
                var slotTime = targetDate.AddHours(hour);
                var isBooked = otAppointments.Any(a => 
                    a.AppointmentDate.Hour == hour || 
                    (a.AppointmentDate.Hour < hour && a.AppointmentDate.AddMinutes(a.DurationMinutes).Hour >= hour)
                );

                otSlots.Add(new
                {
                    Time = slotTime.ToString("HH:mm"),
                    DateTime = slotTime,
                    Available = !isBooked,
                    Status = isBooked ? "Booked" : "Available"
                });
            }

            return otSlots;
        }

        public async Task<object> CreateQuickNoteAsync(Guid tenantId, Guid branchId, string patientName, string patientMobile, string procedureType, string notes, Guid createdByUserId)
        {
            var surgeryRequest = new SurgeryRequest
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                BranchId = branchId,
                SurgeonId = Guid.Empty, // Will be assigned by counselor
                PatientName = patientName,
                PatientMobile = patientMobile,
                ProcedureType = procedureType,
                RequestType = "quick-note",
                Urgency = "routine",
                Notes = notes,
                Status = "pending",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedByUserId = createdByUserId,
                UpdatedByUserId = createdByUserId
            };

            _context.SurgeryRequests.Add(surgeryRequest);
            await _context.SaveChangesAsync();

            return new
            {
                surgeryRequest.Id,
                surgeryRequest.PatientName,
                surgeryRequest.PatientMobile,
                surgeryRequest.ProcedureType,
                surgeryRequest.RequestType,
                surgeryRequest.Status,
                Message = "Quick note sent to counselor successfully"
            };
        }

        public async Task<object> CreateDirectRequestAsync(Guid tenantId, Guid branchId, Guid surgeonId, string patientName, string patientMobile, string procedureType, string urgency, DateTime? preferredDate, Guid createdByUserId)
        {
            var surgeryRequest = new SurgeryRequest
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                BranchId = branchId,
                SurgeonId = surgeonId,
                PatientName = patientName,
                PatientMobile = patientMobile,
                ProcedureType = procedureType,
                RequestType = "direct-support",
                Urgency = urgency,
                PreferredDate = preferredDate,
                Status = "pending",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedByUserId = createdByUserId,
                UpdatedByUserId = createdByUserId
            };

            _context.SurgeryRequests.Add(surgeryRequest);
            await _context.SaveChangesAsync();

            return new
            {
                surgeryRequest.Id,
                surgeryRequest.PatientName,
                surgeryRequest.PatientMobile,
                surgeryRequest.ProcedureType,
                surgeryRequest.RequestType,
                surgeryRequest.Urgency,
                PreferredDate = surgeryRequest.PreferredDate?.ToString("yyyy-MM-dd"),
                surgeryRequest.Status,
                Message = "Direct request sent to surgeon successfully"
            };
        }
    }
}
