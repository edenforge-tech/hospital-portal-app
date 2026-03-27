using CounsellingApi.Models.Entities;

namespace CounsellingApi.Services;

/// <summary>
/// Sends finalization notifications to staff members who requested a price override.
/// Called only when the counselling session reaches the "Done" state (patient Interested).
/// </summary>
public interface INotificationSender
{
    /// <summary>
    /// Notifies the requesting staff member that the counselling session has been finalized
    /// and the overridden price was confirmed.
    /// </summary>
    Task SendFinalizationNotice(PatientCounselling session, SessionPriceOverride priceOverride);
}
