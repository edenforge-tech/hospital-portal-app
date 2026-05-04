namespace InventoryApi.Models.Entities;

/// <summary>
/// Idempotency guard for mutating BT endpoints.
/// Unique key: (tenant_id, endpoint_key, idempotency_key).
/// Cached responses are served from here on duplicate retries.
/// </summary>
public class RequestIdempotency
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }

    /// <summary>Short identifier for the endpoint, e.g. "l1-approve".</summary>
    public string EndpointKey { get; set; } = null!;

    /// <summary>Client-supplied Idempotency-Key header value.</summary>
    public string IdempotencyKey { get; set; } = null!;

    /// <summary>HTTP status code returned on the original request.</summary>
    public int ResponseStatus { get; set; }

    /// <summary>JSON body of the original response, cached for replay.</summary>
    public string? ResponseBody { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddHours(24);
}
