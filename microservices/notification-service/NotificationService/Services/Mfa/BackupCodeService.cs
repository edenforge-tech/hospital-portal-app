using System.Text.Json;

namespace NotificationService.Services.Mfa;

public class BackupCodeService : IBackupCodeService
{
    public List<string> GenerateBackupCodes(int count = 8, int length = 8)
    {
        var codes = new List<string>();
        var random = new Random();
        
        for (int i = 0; i < count; i++)
        {
            var code = "";
            for (int j = 0; j < length; j++)
            {
                code += random.Next(0, 10).ToString();
            }
            codes.Add(code);
        }
        
        return codes;
    }

    public string HashBackupCode(string code)
    {
        return BCrypt.Net.BCrypt.HashPassword(code);
    }

    public bool VerifyBackupCode(string code, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(code, hash);
    }

    public string SerializeBackupCodes(List<(string hash, bool used, DateTime? usedAt)> codes)
    {
        var data = codes.Select(c => new
        {
            hash = c.hash,
            used = c.used,
            usedAt = c.usedAt?.ToString("O") // ISO 8601 format
        }).ToList();

        return JsonSerializer.Serialize(data);
    }

    public List<(string hash, bool used, DateTime? usedAt)> DeserializeBackupCodes(string json)
    {
        var data = JsonSerializer.Deserialize<List<BackupCodeData>>(json);
        
        if (data == null) return new List<(string hash, bool used, DateTime? usedAt)>();

        return data.Select<BackupCodeData, (string hash, bool used, DateTime? usedAt)>(d => (
            d.Hash,
            d.Used,
            string.IsNullOrEmpty(d.UsedAt) ? null : DateTime.Parse(d.UsedAt)
        )).ToList();
    }

    private class BackupCodeData
    {
        public string Hash { get; set; } = string.Empty;
        public bool Used { get; set; }
        public string? UsedAt { get; set; }
    }
}
