namespace IpManagementService.Models.Dtos;

// ─── Ward ────────────────────────────────────────────────────────────────────

public record WardDto(
    Guid    Id,
    Guid    TenantId,
    Guid    BranchId,
    string  WardName,
    string  WardType,
    string? Floor,
    int     TotalBeds,
    bool    IsActive
);

public record CreateWardRequest(
    string  WardName,
    string  WardType,
    string? Floor,
    int     TotalBeds
);

public record UpdateWardRequest(
    string? WardName,
    string? WardType,
    string? Floor,
    int?    TotalBeds,
    bool?   IsActive
);

public record WardStatsDto(
    Guid                    WardId,
    string                  WardName,
    string                  WardType,
    int                     TotalBeds,
    int                     OccupiedBeds,
    int                     AvailableBeds,
    Dictionary<string, int> ByState
);

public record WardBedDto(
    string BedId,
    string Description,
    string RoomNo,
    int    Capacity,
    int    CurrentOccupancy,
    bool   IsAvailable
);
