namespace InventoryApi.Services;

/// <summary>
/// Thrown when a mutation request carries a stale version_no that no longer
/// matches the row currently in the database.
/// Maps to HTTP 409 Conflict in function handlers.
/// </summary>
public sealed class VersionConflictException : Exception
{
    public Guid ResourceId { get; }
    public long ClientVersion { get; }
    public long ServerVersion { get; }

    public VersionConflictException(Guid resourceId, long clientVersion, long serverVersion)
        : base($"Version conflict on resource {resourceId}: client={clientVersion}, server={serverVersion}. Reload and retry.")
    {
        ResourceId     = resourceId;
        ClientVersion  = clientVersion;
        ServerVersion  = serverVersion;
    }
}
