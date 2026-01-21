namespace NotificationService.Services.Mfa;

public interface ITotpService
{
    string GenerateSecret();
    string GenerateCode(string secret);
    bool VerifyCode(string secret, string code, int windowSeconds = 30);
    string GetTotpUri(string secret, string accountName, string issuer);
}

public interface IBackupCodeService
{
    List<string> GenerateBackupCodes(int count = 8, int length = 8);
    string HashBackupCode(string code);
    bool VerifyBackupCode(string code, string hash);
    string SerializeBackupCodes(List<(string hash, bool used, DateTime? usedAt)> codes);
    List<(string hash, bool used, DateTime? usedAt)> DeserializeBackupCodes(string json);
}

public interface IQrCodeService
{
    string GenerateQrCodeDataUrl(string totpUri);
}
