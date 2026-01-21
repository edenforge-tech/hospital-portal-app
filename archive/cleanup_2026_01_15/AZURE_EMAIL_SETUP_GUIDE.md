# Azure Communication Services Email Setup Guide

## Step 1: Create Azure Communication Services Resource

1. **Azure Portal**:
   - Go to portal.azure.com
   - Click "Create a resource"
   - Search for "Communication Services"
   - Click "Create"

2. **Configure**:
   - Resource group: Use existing (same as your database)
   - Name: `hospital-portal-email-service`
   - Data location: United States
   - Click "Review + Create"

## Step 2: Provision Email Domain

1. After resource is created, open it
2. Go to "Email" → "Domains"
3. Click "Provision domains" → "Quick create Azure Managed Domain"
4. Click "Add a free Azure subdomain"
5. Your domain will be: `<uniqueid>.azurecomm.net`
6. Wait ~5 minutes for provisioning

## Step 3: Get Connection String

1. In Communication Services resource
2. Go to "Keys" in left menu
3. Copy "Connection string" (Primary or Secondary)
4. Example format: `endpoint=https://...;accesskey=...`

## Step 4: Update local.settings.json

Replace Resend configuration with Azure Communication Services:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    
    "ConnectionStrings__DefaultConnection": "Host=hospital-db.postgres.database.azure.com;...",
    
    "AzureCommunication__ConnectionString": "<YOUR_CONNECTION_STRING>",
    "AzureCommunication__FromEmail": "DoNotReply@<your-domain>.azurecomm.net",
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

## Step 5: Install NuGet Package

```powershell
cd "microservices/notification-service/NotificationService"
dotnet add package Azure.Communication.Email
```

## Step 6: Test Email Sending

After code changes are deployed, test with:
```powershell
# The activation flow will now use Azure Communication Services
# Email will be sent from: DoNotReply@<your-id>.azurecomm.net
```

## Benefits of Azure Communication Services

✅ **Free Tier**: 5,000 emails/month free forever  
✅ **Azure Integration**: Same subscription, unified billing  
✅ **HIPAA Compliant**: Meets healthcare regulations  
✅ **High Deliverability**: Microsoft infrastructure  
✅ **No Domain Required**: Free .azurecomm.net subdomain  
✅ **Cost-Effective**: $0.25 per 1,000 emails after free tier  

## Estimated Costs (after free tier)

- 10,000 OTPs/month: ~$1.25/month
- 50,000 OTPs/month: ~$11.25/month
- 100,000 OTPs/month: ~$23.75/month

Much cheaper than Resend ($10/month base + volume pricing)!
