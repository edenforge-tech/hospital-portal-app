using QRCoder;

namespace NotificationService.Services.Mfa;

public class QrCodeService : IQrCodeService
{
    public string GenerateQrCodeDataUrl(string totpUri)
    {
        using var qrGenerator = new QRCodeGenerator();
        using var qrCodeData = qrGenerator.CreateQrCode(totpUri, QRCodeGenerator.ECCLevel.Q);
        using var qrCode = new PngByteQRCode(qrCodeData);
        
        var qrCodeBytes = qrCode.GetGraphic(20);
        var base64 = Convert.ToBase64String(qrCodeBytes);
        
        return $"data:image/png;base64,{base64}";
    }
}
