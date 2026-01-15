using System;
using OtpNet;

class TestTotpVerification
{
    static void Main(string[] args)
    {
        var secret = "ZUNA3GT35363PAKDGY3EH7GR4DQEWFTU";
        
        try
        {
            var key = Base32Encoding.ToBytes(secret);
            var totp = new Totp(key, step: 30);
            
            Console.WriteLine("=== TOTP Verification Test ===");
            Console.WriteLine($"Secret: {secret}");
            Console.WriteLine($"Current UTC Time: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}");
            Console.WriteLine();
            
            // Generate current code
            var currentCode = totp.ComputeTotp();
            Console.WriteLine($"Current TOTP Code: {currentCode}");
            Console.WriteLine();
            
            // Test the user's code
            if (args.Length > 0)
            {
                var userCode = args[0];
                Console.WriteLine($"Testing user code: {userCode}");
                
                long timeStepMatched;
                bool isValid = totp.VerifyTotp(userCode, out timeStepMatched, VerificationWindow.RfcSpecifiedNetworkDelay);
                
                Console.WriteLine($"Is Valid: {isValid}");
                Console.WriteLine($"Time Step Matched: {timeStepMatched}");
                Console.WriteLine();
                
                if (!isValid)
                {
                    Console.WriteLine("Verification failed. Possible reasons:");
                    Console.WriteLine("1. Code expired (wait for new code)");
                    Console.WriteLine("2. Time sync issue between server and phone");
                    Console.WriteLine("3. Wrong account in authenticator app");
                }
            }
            else
            {
                Console.WriteLine("To test a code, run: dotnet run <code>");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}
