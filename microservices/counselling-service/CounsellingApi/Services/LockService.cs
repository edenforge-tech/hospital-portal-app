using CounsellingApi.Repositories;

namespace CounsellingApi.Services;

/// <summary>
/// Manages optimistic locks on counselling records to prevent concurrent edits.
/// Locks expire automatically after <see cref="LockTimeout"/> (15 minutes) based on
/// <c>UpdatedAt</c> — if the counsellor is actively saving data, the timer resets.
/// </summary>
public class LockService
{
    private static readonly TimeSpan LockTimeout = TimeSpan.FromMinutes(15);

    private readonly ICounsellingRepository _repo;

    public LockService(ICounsellingRepository repo)
    {
        _repo = repo;
    }

    public async Task LockRecord(Guid id, string user)
    {
        var record = await _repo.Get(id)
            ?? throw new KeyNotFoundException($"Counselling record {id} not found.");

        record.IsLocked        = true;
        record.LockedBy        = user;
        record.UpdatedByUserId = user;
        record.UpdatedAt       = DateTime.UtcNow;

        await _repo.Update(record);
    }

    public async Task UnlockRecord(Guid id, string user)
    {
        var record = await _repo.Get(id)
            ?? throw new KeyNotFoundException($"Counselling record {id} not found.");

        record.IsLocked        = false;
        record.LockedBy        = null;
        record.UpdatedByUserId = user;
        record.UpdatedAt       = DateTime.UtcNow;

        await _repo.Update(record);
    }

    /// <summary>
    /// Returns <c>true</c> when a record is locked by someone other than
    /// <paramref name="requestingUser"/> and the lock has not yet expired.
    /// Stale locks (older than 15 minutes) are cleared automatically.
    /// </summary>
    public async Task<bool> IsEffectivelyLocked(Guid id, string requestingUser)
    {
        var record = await _repo.Get(id);
        if (record is null || !record.IsLocked) return false;
        if (record.LockedBy == requestingUser) return false;

        // Soft timeout: auto-expire locks that have been inactive for 15+ minutes.
        if (DateTime.UtcNow - record.UpdatedAt > LockTimeout)
        {
            record.IsLocked        = false;
            record.LockedBy        = null;
            record.UpdatedByUserId = "system:lock-expiry";
            record.UpdatedAt       = DateTime.UtcNow;
            await _repo.Update(record);
            return false;
        }

        return true;
    }
}
