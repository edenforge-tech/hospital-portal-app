# Complete Azure Email Migration Guide

## Overview
This guide walks you through migrating from Resend to Azure Communication Services Email for the Hospital Portal notification system.

## Benefits of Azure Communication Services
✅ **Free Tier**: 5,000 emails/month FREE forever  
✅ **Cost-Effective**: $0.00025 per email after free tier (~$0.25 per 1,000 emails)  
✅ **Azure Integration**: Same subscription, unified billing  
✅ **HIPAA Compliant**: Meets healthcare data regulations  
✅ **High Deliverability**: Microsoft's email infrastructure  
✅ **Free Domain**: No need to purchase/verify custom domain - use *.azurecomm.net  

## Cost Comparison
| Service | Free Tier | Cost After Free Tier | 10K Emails/Month | 50K Emails/Month |
|---------|-----------|---------------------|------------------|------------------|
| **Azure Communication Services** | 5,000/month | $0.00025/email | ~$1.25 | ~$11.25 |
| Resend | 100/month | $10/month + volume | $10+ | $20+ |
| SendGrid | 100/day | $19.95/month | $19.95+ | $89.95+ |

## Prerequisites
- Azure CLI installed ([Download](https://aka.ms/installazurecliwindows))
- Azure account with active subscription
- PowerShell 5.1 or later

## Step 1: Install Azure Communication Email Package

```powershell
cd "c:\Users\Sam Aluri\Downloads\Hospital Portal\microservices\notification-service\NotificationService"
dotnet add package Azure.Communication.Email
```

Expected output:
```
info : PackageReference for 'Azure.Communication.Email' version 'X.X.X' added to file '...'
```

## Step 2: Setup Azure Communication Services (Automated)

Run the automated setup script:

```powershell
cd "c:\Users\Sam Aluri\Downloads\Hospital Portal"
.\setup_azure_email.ps1
```

The script will:
1. Login to Azure
2. List your resource groups
3. Create Communication Services resource
4. Create Email Communication Service
5. Provision free Azure subdomain (*.azurecomm.net)
6. Output configuration for local.settings.json

**Important**: Copy the output configuration - you'll need it in Step 3.

### Manual Setup (Alternative)

If the automated script fails, follow these manual steps:

#### 2.1 Create Communication Services Resource

```powershell
# Login to Azure
az login

# Create Communication Services
az communication create `
    --name hospital-portal-email-service `
    --resource-group <your-resource-group> `
    --location global `
    --data-location UnitedStates

# Get connection string
az communication list-key `
    --name hospital-portal-email-service `
    --resource-group <your-resource-group> `
    --query "primaryConnectionString"
```

#### 2.2 Create Email Domain via Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your Communication Services resource
3. Click **"Email"** → **"Domains"** in left menu
4. Click **"Provision domains"**
5. Select **"Quick create an Azure Managed Domain"**
6. Click **"Add a free Azure subdomain"**
7. Wait 5-10 minutes for provisioning
8. Copy your domain: `<uniqueid>.azurecomm.net`

#### 2.3 Link Domain to Communication Service

1. In Communication Services resource
2. Go to **"Email"** → **"Domains"**
3. Click **"Connect domain"**
4. Select your Azure Managed Domain
5. Click **"Connect"**

## Step 3: Update local.settings.json

Open `microservices/notification-service/NotificationService/local.settings.json` and:

### 3.1 Remove Resend Configuration

Delete these lines:
```json
"Resend__ApiKey": "re_XrDUVMV8_CEdimRyNRh3USqxNmMJtKeGJ",
"Resend__FromEmail": "edenforgedemo@gmail.com",
"Resend__FromName": "Hospital Portal",
```

### 3.2 Add Azure Communication Services Configuration

Add these lines (replace with values from setup script):
```json
"AzureCommunication__ConnectionString": "endpoint=https://hospital-portal-email-XXXX.communication.azure.com/;accesskey=YOUR_ACCESS_KEY",
"AzureCommunication__FromEmail": "DoNotReply@<your-id>.azurecomm.net",
"AzureCommunication__FromName": "Hospital Portal",
```

### 3.3 Complete Configuration Example

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    
    "ConnectionStrings__DefaultConnection": "Host=hospital-db.postgres.database.azure.com;Port=5432;Database=hospital_portal;Username=postgres;Password=Sriinfotech123;SSL Mode=Require;Trust Server Certificate=true",
    
    "AzureCommunication__ConnectionString": "endpoint=https://hospital-portal-email-XXXX.communication.azure.com/;accesskey=YOUR_ACCESS_KEY",
    "AzureCommunication__FromEmail": "DoNotReply@<your-id>.azurecomm.net",
    "AzureCommunication__FromName": "Hospital Portal",
    
    "Twilio__AccountSid": "AC5275ee8b38d76b3a0a7f00cc647201e1",
    "Twilio__AuthToken": "1dae121e49e2dd4377bfed90ad1ebd06",
    "Twilio__FromNumber": "+17622474127",
    
    "Otp__Length": "6",
    "Otp__ActivationExpiryHours": "48",
    "Otp__MfaExpiryMinutes": "5",
    "Otp__MaxAttempts": "5",
    "Otp__ResendCooldownMinutes": "5",
    "Otp__MaxSendsPerDay": "3"
  }
}
```

## Step 4: Verify Code Changes

All code changes are already complete! The following files have been updated:

✅ `Services/Email/AzureEmailService.cs` - New Azure email implementation  
✅ `Program.cs` - Registered AzureEmailService instead of ResendEmailService  
✅ `Functions/Activation/SendActivationOtp.cs` - Provider updated to "azure"  

No additional code changes needed!

## Step 5: Restart Notification Service

```powershell
# Stop current service (press Ctrl+C in terminal running func start)

# Navigate to notification service
cd "c:\Users\Sam Aluri\Downloads\Hospital Portal\microservices\notification-service\NotificationService"

# Start service
func start
```

Expected output:
```
Azure Functions Core Tools
Core Tools Version: 4.x.x
Function Runtime Version: 4.x.x

Functions:
  SendActivationOtp: [POST] http://localhost:7071/api/activation/send-otp
  ...

For detailed output, run func with --verbose flag.
[2026-01-13T...] AzureEmailService initialized - From: DoNotReply@XXXX.azurecomm.net (Hospital Portal)
```

Look for the `AzureEmailService initialized` log - this confirms Azure email is configured correctly.

## Step 6: Test Email Sending

### 6.1 Login to Frontend
1. Open http://localhost:3001
2. Login with: `admin@test.com` / `Admin123!`

### 6.2 Send Activation Email
1. Go to **Users** section
2. Find user: **sam@test.com** (emp-sta-9518)
3. Click **Activate** button
4. Select delivery method: **Email**
5. Click **Generate OTP & Send Email**

### 6.3 Expected Results

**Success Indicators:**
- ✅ Frontend shows success message
- ✅ Notification service logs: `Email queued successfully - MessageId: ...`
- ✅ Database `notification_logs` table has record with `status='sent'`, `provider='azure'`
- ✅ Email arrives at sam@test.com within 1-2 minutes

**Check Logs:**
```powershell
# Notification service terminal should show:
[2026-01-13T...] Sending email via Azure Communication Services - To: sam@test.com, Subject: Your Activation Code - Hospital Portal
[2026-01-13T...] Email queued successfully - MessageId: <message-id>, To: sam@test.com
```

**Verify Database:**
```sql
SELECT 
    id, 
    recipient, 
    provider, 
    provider_message_id, 
    status, 
    error_message,
    sent_at
FROM notification_logs 
WHERE recipient = 'sam@test.com' 
ORDER BY sent_at DESC 
LIMIT 1;
```

Expected result:
- `provider = 'azure'`
- `status = 'sent'`
- `provider_message_id` has value (Azure message ID)
- `error_message` is NULL

## Troubleshooting

### Issue: "AzureCommunication:ConnectionString not configured"
**Solution**: Verify `local.settings.json` has correct `AzureCommunication__ConnectionString` (double underscore)

### Issue: "Email domain not verified"
**Solution**: 
1. Go to Azure Portal → Communication Services → Email → Domains
2. Wait for domain status to show "Verified" (may take 5-10 minutes)
3. Ensure domain is connected to Communication Services resource

### Issue: Package not found - Azure.Communication.Email
**Solution**:
```powershell
dotnet add package Azure.Communication.Email --version 1.0.0
dotnet restore
```

### Issue: Emails not arriving
**Solution**:
1. Check spam/junk folder
2. Verify sender address matches format: `DoNotReply@<your-id>.azurecomm.net`
3. Check Azure Portal → Communication Services → Email → Insights for delivery status
4. Review `notification_logs.error_message` in database

### Issue: 403 Forbidden from Azure Communication Services
**Solution**: 
1. Verify connection string is correct (not expired)
2. Ensure domain is provisioned and connected
3. Check Azure Portal → Communication Services → Keys for valid access keys

## Cost Monitoring

### View Usage in Azure Portal
1. Go to Communication Services resource
2. Click **"Cost Management"** → **"Cost analysis"**
3. Filter by service: "Communication Services"
4. View breakdown by email sends

### Set Budget Alerts
1. Go to **"Cost Management"** → **"Budgets"**
2. Create new budget
3. Set amount: $5/month (covers ~20,000 emails after free tier)
4. Configure alerts at 80% and 100% thresholds

## Production Deployment

### For Production Environment
1. Create separate Communication Services resource for production
2. Consider using custom domain instead of *.azurecomm.net:
   - Better branding (e.g., `noreply@yourhospital.com`)
   - Improved deliverability
   - Professional appearance
3. Setup monitoring and alerts
4. Enable diagnostic logs
5. Configure connection string in Azure App Configuration or Key Vault

### Custom Domain Setup (Optional)
1. Azure Portal → Communication Services → Email → Domains
2. Click **"Add domain"** → **"Add custom domain"**
3. Enter your domain (e.g., `yourhospital.com`)
4. Add DNS records (TXT, SPF, DKIM) to your DNS provider
5. Wait for verification (24-48 hours)
6. Update `AzureCommunication__FromEmail` to use custom domain

## Removing Resend Completely

Once Azure Communication Services is working:

### 1. Remove Resend NuGet Package (Optional)
```powershell
cd "microservices/notification-service/NotificationService"
dotnet remove package Resend  # If package was installed
```

### 2. Delete Old Email Service Files (Optional)
```powershell
# Backup first!
Remove-Item "Services/Email/ResendEmailService.cs" -Confirm
```

### 3. Update Documentation
- Update `README.md` to mention Azure Communication Services
- Remove references to Resend from setup guides

## Summary

✅ **Total Setup Time**: ~15 minutes  
✅ **Monthly Cost**: FREE for first 5,000 emails  
✅ **Production Ready**: Yes (HIPAA compliant)  
✅ **Scalability**: Azure infrastructure, handles millions of emails  
✅ **Support**: Microsoft Azure support available  

## Next Steps

1. ✅ Complete setup using this guide
2. ✅ Test activation flow end-to-end
3. ⏳ Test MFA login OTP emails
4. ⏳ Test password reset emails (when implemented)
5. ⏳ Setup production environment with custom domain
6. ⏳ Configure monitoring and alerts
7. ⏳ Setup automated cost tracking

## Support & Resources

- [Azure Communication Services Documentation](https://learn.microsoft.com/en-us/azure/communication-services/)
- [Email Quickstart Guide](https://learn.microsoft.com/en-us/azure/communication-services/quickstarts/email/send-email)
- [Pricing Calculator](https://azure.microsoft.com/en-us/pricing/details/communication-services/)
- [Service Limits](https://learn.microsoft.com/en-us/azure/communication-services/concepts/service-limits)

---

**Questions or Issues?** Check the troubleshooting section or review Azure Communication Services logs in Azure Portal.
