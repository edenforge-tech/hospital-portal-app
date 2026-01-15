# Notification Service

Azure Functions-based microservice for Hospital Portal handling:
- User activation (Email/SMS OTP)
- Multi-Factor Authentication (TOTP, SMS, Email)
- Backup codes management
- Admin recovery features

## 🚀 Quick Start

### Prerequisites
- .NET 8.0 SDK
- Azure Functions Core Tools (`npm install -g azure-functions-core-tools@4`)
- PostgreSQL 17.6
- Resend API Key (free tier: https://resend.com)
- Twilio Account (trial: https://twilio.com)

### Local Development

1. **Install Dependencies**
   ```powershell
   cd NotificationService
   dotnet restore
   ```

2. **Configure Settings**
   
   Update `local.settings.json`:
   ```json
   {
     "ConnectionStrings__DefaultConnection": "Host=localhost;Database=hospital_portal;...",
     "Resend__ApiKey": "re_YOUR_API_KEY",
     "Twilio__AccountSid": "YOUR_ACCOUNT_SID",
     "Twilio__AuthToken": "YOUR_AUTH_TOKEN",
     "Twilio__FromNumber": "+1234567890"
   }
   ```

3. **Run Database Migrations**
   ```powershell
   cd ../../database_migrations
   psql -U postgres -d hospital_portal -f 09_notification_service_tables.sql
   ```

4. **Start Functions**
   ```powershell
   cd ../microservices/notification-service/NotificationService
   func start
   ```

   Functions will be available at: `http://localhost:7071/api`

## 📋 API Endpoints

### User Activation
- `POST /api/activation/send-otp` - Send activation code
- `POST /api/activation/verify-otp` - Verify code & activate user

### MFA Enrollment
- `POST /api/mfa/enroll/totp` - Generate QR code (TODO)
- `POST /api/mfa/enroll/verify` - Verify enrollment (TODO)

### MFA Login
- `POST /api/mfa/send-login-otp` - Send login OTP (TODO)
- `POST /api/mfa/verify-login` - Verify MFA code (TODO)

## 🗂️ Project Structure

```
NotificationService/
├── Functions/
│   ├── Activation/         # User activation endpoints
│   ├── Mfa/               # MFA enrollment & verification
│   ├── Admin/             # Admin recovery features
│   └── Maintenance/       # Cleanup jobs
├── Services/
│   ├── Email/             # Resend integration
│   ├── Sms/               # Twilio integration
│   ├── Otp/               # OTP generation & verification
│   └── Mfa/               # TOTP, backup codes, QR codes
├── Data/
│   ├── Entities/          # Database models
│   └── NotificationDbContext.cs
├── Models/
│   ├── Requests/          # API request DTOs
│   └── Responses/         # API response DTOs
└── Program.cs             # DI configuration
```

## 💰 Cost Estimate

| Service | Free Tier | Cost After |
|---------|-----------|------------|
| Resend (Email) | 3,000/month | $20/mo (50K) |
| Twilio (SMS) | $15 trial | $0.0075/SMS |
| Azure Functions | 1M executions | FREE (consumption) |

**Monthly Total**: ~$1 for 1000 users (mostly SMS, email free)

## 🔐 Security Features

- **OTP**: Bcrypt hashed, 48-hour expiry (activation)
- **MFA**: 5-minute expiry (login), 30-second TOTP window
- **Rate Limiting**: Max 3 sends per day per user
- **Backup Codes**: 8 single-use, bcrypt hashed
- **Audit Trail**: All actions logged with IP/timestamp

## 📦 Database Tables

1. **otp_activations** - OTP codes (activation & MFA login)
2. **user_mfa_settings** - User MFA configuration
3. **notification_logs** - Email/SMS delivery audit
4. **backup_code_regeneration_log** - Admin recovery audit

## 🧪 Testing

```powershell
# Test activation OTP
curl -X POST http://localhost:7071/api/activation/send-otp \
  -H "Content-Type: application/json" \
  -d '{"userId":"uuid","deliveryMethod":"email","recipient":"test@test.com"}'

# Verify OTP
curl -X POST http://localhost:7071/api/activation/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"recipient":"test@test.com","otp":"123456"}'
```

## 📝 TODO

- [ ] Complete MFA enrollment functions
- [ ] Complete MFA login verification
- [ ] Add admin backup code regeneration
- [ ] Add cleanup timer trigger (hourly)
- [ ] Integrate with auth-service JWT
- [ ] Add unit tests
- [ ] Deploy to Azure

## 🔗 Related Services

- **auth-service** (Port 5073) - Handles login, JWT, user management
- **frontend** (Port 3000) - Next.js UI

## 📚 Documentation

See main README.md for complete implementation plan and architecture diagrams.
