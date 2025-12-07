using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services
{
    public class LocalizationSettings
    {
        public string Timezone { get; set; } = "UTC";
        public string DateFormat { get; set; } = "DD-MM-YYYY";
        public string TimeFormat { get; set; } = "24h";
        public string NumberFormat { get; set; } = "en-US";
        public string Currency { get; set; } = "USD";
        public string CurrencySymbol { get; set; } = "$";
        public string Language { get; set; } = "en";
    }

    public interface ILocalizationService
    {
        Task<DateTime> ConvertToUserTimezoneAsync(DateTime utcTime, Guid userId);
        Task<DateTime> ConvertFromUserTimezoneAsync(DateTime localTime, Guid userId);
        Task<string> FormatCurrencyAsync(decimal amount, Guid userId);
        Task<string> FormatDateAsync(DateTime date, Guid userId);
        Task<string> FormatTimeAsync(DateTime time, Guid userId);
        Task<string> FormatNumberAsync(decimal number, Guid userId);
        Task<LocalizationSettings> GetOrganizationLocalizationAsync(Guid organizationId);
        Task<LocalizationSettings> GetBranchLocalizationAsync(Guid branchId);
        Task<LocalizationSettings> GetUserLocalizationAsync(Guid userId);
        Task<LocalizationSettings> GetEffectiveLocalizationAsync(Guid userId);
    }

    public class LocalizationService : ILocalizationService
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public LocalizationService(AppDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        private Guid GetCurrentTenantId()
        {
            var tenantId = _httpContextAccessor?.HttpContext?.Items["TenantId"] as Guid?;
            return tenantId ?? Guid.Parse("11111111-1111-1111-1111-111111111111");
        }

        public async Task<DateTime> ConvertToUserTimezoneAsync(DateTime utcTime, Guid userId)
        {
            var settings = await GetEffectiveLocalizationAsync(userId);

            try
            {
                var timezone = TimeZoneInfo.FindSystemTimeZoneById(settings.Timezone);
                return TimeZoneInfo.ConvertTimeFromUtc(utcTime, timezone);
            }
            catch
            {
                // If timezone conversion fails, return UTC time
                return utcTime;
            }
        }

        public async Task<DateTime> ConvertFromUserTimezoneAsync(DateTime localTime, Guid userId)
        {
            var settings = await GetEffectiveLocalizationAsync(userId);

            try
            {
                var timezone = TimeZoneInfo.FindSystemTimeZoneById(settings.Timezone);
                return TimeZoneInfo.ConvertTimeToUtc(localTime, timezone);
            }
            catch
            {
                // If timezone conversion fails, assume input is already UTC
                return localTime;
            }
        }

        public async Task<string> FormatCurrencyAsync(decimal amount, Guid userId)
        {
            var settings = await GetEffectiveLocalizationAsync(userId);

            try
            {
                var culture = new System.Globalization.CultureInfo(settings.NumberFormat);
                return amount.ToString("C", culture);
            }
            catch
            {
                // Fallback to simple formatting
                return $"{settings.CurrencySymbol}{amount:N2}";
            }
        }

        public async Task<string> FormatDateAsync(DateTime date, Guid userId)
        {
            var settings = await GetEffectiveLocalizationAsync(userId);

            // Convert UTC to user's timezone
            var localDate = await ConvertToUserTimezoneAsync(date, userId);

            // Map custom format to .NET format
            var format = settings.DateFormat switch
            {
                "DD-MM-YYYY" => "dd-MM-yyyy",
                "MM-DD-YYYY" => "MM-dd-yyyy",
                "YYYY-MM-DD" => "yyyy-MM-dd",
                "DD/MM/YYYY" => "dd/MM/yyyy",
                "MM/DD/YYYY" => "MM/dd/yyyy",
                _ => "dd-MM-yyyy"
            };

            return localDate.ToString(format);
        }

        public async Task<string> FormatTimeAsync(DateTime time, Guid userId)
        {
            var settings = await GetEffectiveLocalizationAsync(userId);

            // Convert UTC to user's timezone
            var localTime = await ConvertToUserTimezoneAsync(time, userId);

            // Map time format
            var format = settings.TimeFormat switch
            {
                "12h" => "hh:mm tt",
                "24h" => "HH:mm",
                _ => "HH:mm"
            };

            return localTime.ToString(format);
        }

        public async Task<string> FormatNumberAsync(decimal number, Guid userId)
        {
            var settings = await GetEffectiveLocalizationAsync(userId);

            try
            {
                var culture = new System.Globalization.CultureInfo(settings.NumberFormat);
                return number.ToString("N2", culture);
            }
            catch
            {
                // Fallback to default formatting
                return number.ToString("N2");
            }
        }

        public async Task<LocalizationSettings> GetOrganizationLocalizationAsync(Guid organizationId)
        {
            var organization = await _context.Organizations
                .FirstOrDefaultAsync(o => o.Id == organizationId);

            if (organization == null)
                return GetDefaultSettings();

            return new LocalizationSettings
            {
                Timezone = organization.Timezone ?? "UTC",
                DateFormat = organization.DateFormat ?? "DD-MM-YYYY",
                TimeFormat = organization.TimeFormat ?? "24h",
                NumberFormat = organization.NumberFormat ?? "en-US",
                Currency = "USD",
                CurrencySymbol = "$",
                Language = "en"
            };
        }

        public async Task<LocalizationSettings> GetBranchLocalizationAsync(Guid branchId)
        {
            var branch = await _context.Branches
                .Include(b => b.Organization)
                .FirstOrDefaultAsync(b => b.Id == branchId);

            if (branch == null)
                return GetDefaultSettings();

            // Branch settings override organization settings
            var settings = await GetOrganizationLocalizationAsync(branch.OrganizationId);

            // Override with branch-specific settings if available
            if (!string.IsNullOrEmpty(branch.Timezone))
                settings.Timezone = branch.Timezone;

            return settings;
        }

        public async Task<LocalizationSettings> GetUserLocalizationAsync(Guid userId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return GetDefaultSettings();

            // Check if user has custom preferences stored in UserAttributes
            var preferences = await _context.UserAttributes
                .Where(ua => ua.UserId == userId)
                .ToDictionaryAsync(ua => ua.AttributeKey, ua => ua.AttributeValue);

            var settings = GetDefaultSettings();

            if (preferences.ContainsKey("Timezone"))
                settings.Timezone = preferences["Timezone"] ?? "UTC";

            if (preferences.ContainsKey("DateFormat"))
                settings.DateFormat = preferences["DateFormat"] ?? "DD-MM-YYYY";

            if (preferences.ContainsKey("TimeFormat"))
                settings.TimeFormat = preferences["TimeFormat"] ?? "24h";

            if (preferences.ContainsKey("NumberFormat"))
                settings.NumberFormat = preferences["NumberFormat"] ?? "en-US";

            if (preferences.ContainsKey("Language"))
                settings.Language = preferences["Language"] ?? "en";

            return settings;
        }

        public async Task<LocalizationSettings> GetEffectiveLocalizationAsync(Guid userId)
        {
            // Priority: User preferences → Branch settings → Organization settings → System default

            // 1. Get user preferences
            var userSettings = await GetUserLocalizationAsync(userId);

            // If user has timezone preference, check if it's custom or default
            if (userSettings.Timezone != "UTC")
                return userSettings;

            // 2. Get user's branch
            var userDepartment = await _context.UserDepartments
                .Where(ud => ud.UserId == userId && ud.AccessType == "Primary")
                .FirstOrDefaultAsync();

            if (userDepartment != null && userDepartment.BranchId.HasValue)
            {
                var branchSettings = await GetBranchLocalizationAsync(userDepartment.BranchId.Value);
                
                // Merge user preferences with branch settings
                return MergeSettings(userSettings, branchSettings);
            }

            // 3. Get organization settings (if user has no branch)
            // 3. Return system default (tenant doesn't have direct organization link)
            return GetDefaultSettings();
        }

        private LocalizationSettings MergeSettings(LocalizationSettings userSettings, LocalizationSettings baseSettings)
        {
            // User settings take precedence, but fall back to base settings
            return new LocalizationSettings
            {
                Timezone = userSettings.Timezone != "UTC" ? userSettings.Timezone : baseSettings.Timezone,
                DateFormat = userSettings.DateFormat != "DD-MM-YYYY" ? userSettings.DateFormat : baseSettings.DateFormat,
                TimeFormat = userSettings.TimeFormat != "24h" ? userSettings.TimeFormat : baseSettings.TimeFormat,
                NumberFormat = userSettings.NumberFormat != "en-US" ? userSettings.NumberFormat : baseSettings.NumberFormat,
                Currency = baseSettings.Currency,
                CurrencySymbol = baseSettings.CurrencySymbol,
                Language = userSettings.Language != "en" ? userSettings.Language : baseSettings.Language
            };
        }

        private LocalizationSettings GetDefaultSettings()
        {
            return new LocalizationSettings
            {
                Timezone = "UTC",
                DateFormat = "DD-MM-YYYY",
                TimeFormat = "24h",
                NumberFormat = "en-US",
                Currency = "USD",
                CurrencySymbol = "$",
                Language = "en"
            };
        }

        private string GetCurrencySymbol(string currency)
        {
            return currency switch
            {
                "USD" => "$",
                "EUR" => "€",
                "GBP" => "£",
                "INR" => "₹",
                "JPY" => "¥",
                "CNY" => "¥",
                "AUD" => "A$",
                "CAD" => "C$",
                _ => "$"
            };
        }
    }
}
