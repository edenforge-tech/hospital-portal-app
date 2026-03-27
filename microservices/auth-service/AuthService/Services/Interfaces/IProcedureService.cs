namespace AuthService.Services.Interfaces
{
    public interface IProcedureService
    {
        Task<List<object>> SearchProcedurePricingAsync(Guid tenantId, string? searchQuery);
        Task<List<object>> GetOTAvailabilityAsync(Guid branchId, Guid? surgeonId, DateTime? date);
        Task<object> CreateQuickNoteAsync(Guid tenantId, Guid branchId, string patientName, string patientMobile, string procedureType, string notes, Guid createdByUserId);
        Task<object> CreateDirectRequestAsync(Guid tenantId, Guid branchId, Guid surgeonId, string patientName, string patientMobile, string procedureType, string urgency, DateTime? preferredDate, Guid createdByUserId);
    }
}
