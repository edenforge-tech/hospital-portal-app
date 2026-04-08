namespace IpManagementService.Models.Dtos;

public record IolCatalogItemDto(
    Guid     Id,
    string   ModelName,
    string   Brand,
    string   IolType,
    string?  Origin,
    string?  LensCategory,
    decimal? PowerRangeMin,
    decimal? PowerRangeMax,
    decimal? PowerIncrement,
    decimal? AConstant,
    decimal  DefaultPrice,
    string?  ProductCode
);
