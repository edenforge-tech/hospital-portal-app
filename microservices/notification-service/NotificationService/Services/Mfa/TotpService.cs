using OtpNet;

namespace NotificationService.Services.Mfa;

public class TotpService : ITotpService
{
    public string GenerateSecret()
    {
        var key = KeyGeneration.GenerateRandomKey(20); // 160 bits
        return Base32Encoding.ToString(key);
    }

    public string GenerateCode(string secret)
    {
        var key = Base32Encoding.ToBytes(secret);
        var totp = new Totp(key);
        return totp.ComputeTotp();
    }

    public bool VerifyCode(string secret, string code, int windowSeconds = 30)
    {
        try
        {
            // Validate inputs
            if (string.IsNullOrWhiteSpace(secret) || string.IsNullOrWhiteSpace(code))
            {
                return false;
            }

            // Remove any whitespace from code
            code = code.Trim().Replace(" ", "");

            // Validate code format (6 digits)
            if (!System.Text.RegularExpressions.Regex.IsMatch(code, @"^\d{6}$"))
            {
                return false;
            }

            var key = Base32Encoding.ToBytes(secret);
            var totp = new Totp(key, step: windowSeconds);
            
            // Use extended window to account for clock drift (±1 time step = ±30 seconds)
            long timeStepMatched;
            bool isValid = totp.VerifyTotp(code, out timeStepMatched, VerificationWindow.RfcSpecifiedNetworkDelay);
            
            return isValid;
        }
        catch (Exception)
        {
            return false;
        }
    }

    public string GetTotpUri(string secret, string accountName, string issuer)
    {
        // Format: otpauth://totp/Issuer:AccountName?secret=SECRET&issuer=Issuer
        return $"otpauth://totp/{Uri.EscapeDataString(issuer)}:{Uri.EscapeDataString(accountName)}?" +
               $"secret={secret}&issuer={Uri.EscapeDataString(issuer)}&digits=6&period=30";
    }
}
