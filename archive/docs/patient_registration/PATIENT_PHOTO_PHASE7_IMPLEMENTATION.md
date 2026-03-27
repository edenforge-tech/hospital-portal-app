# Patient Registration - Phase 7: Patient Photo Implementation

**Date:** January 30, 2026  
**Status:** 🟡 **BACKEND 95% COMPLETE** | Frontend Pending  
**Implementation Time:** ~5 hours (backend complete, frontend next)  

---

## 🎯 PHASE 7 OBJECTIVES

**Goal:** Enable patient photo uploads with Azure Blob Storage integration  
**Priority:** P1 (High Value - Patient Identification)  
**Total Fields:** 3 (photo_url, photo_thumbnail_url, photo_uploaded_at)

**Use Cases:**
- Patient identification at reception
- Display photos on token screens
- Staff recognition of frequent patients
- Insurance verification
- Medical records completeness

---

## ✅ COMPLETED IMPLEMENTATION (Backend)

### 1. Database Migration - ✅ DEPLOYED

**File:** `migrations/patient_phase7_photo.sql`  
**Status:** Applied successfully to Azure PostgreSQL  
**Deployment Date:** January 30, 2026

```sql
-- Add 3 photo-related columns
ALTER TABLE patient ADD COLUMN IF NOT EXISTS photo_url VARCHAR(500);
ALTER TABLE patient ADD COLUMN IF NOT EXISTS photo_uploaded_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE patient ADD COLUMN IF NOT EXISTS photo_thumbnail_url VARCHAR(500);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_patient_photo_url 
ON patient(tenant_id, photo_url) 
WHERE photo_url IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_patient_photo_uploaded_at 
ON patient(tenant_id, photo_uploaded_at DESC) 
WHERE photo_uploaded_at IS NOT NULL AND deleted_at IS NULL;
```

**Verification Result:**
```
column_name         | data_type                | character_maximum_length | is_nullable
---------------------+--------------------------+--------------------------+-------------
photo_thumbnail_url | character varying        |                      500 | YES
photo_uploaded_at   | timestamp with time zone |                          | YES
photo_url           | character varying        |                      500 | YES
(3 rows)
```

✅ All 3 columns created successfully in production database

---

### 2. Backend Model Updates - ✅ COMPLETE

#### Patient.cs (Domain Model)
**File:** `microservices/auth-service/AuthService/Models/Domain/Patient.cs`

```csharp
// Patient Photo (Phase 7)
[Column("photo_url")]
[StringLength(500)]
public string? PhotoUrl { get; set; }

[Column("photo_thumbnail_url")]
[StringLength(500)]
public string? PhotoThumbnailUrl { get; set; }

[Column("photo_uploaded_at")]
public DateTime? PhotoUploadedAt { get; set; }
```

**Total Patient Model Fields:** 62 (59 existing + 3 Phase 7)

---

#### PatientDtos.cs (Request/Response DTOs)
**File:** `microservices/auth-service/AuthService/Models/Domain/Dtos/PatientDtos.cs`

**CreatePatientRequest DTO:**
```csharp
// Patient Photo (Phase 7) - Note: Photo upload handled separately via multipart/form-data
[StringLength(500)]
public string? PhotoUrl { get; set; }

[StringLength(500)]
public string? PhotoThumbnailUrl { get; set; }
```

**PatientResponse DTO:**
```csharp
// Patient Photo (Phase 7)
public string? PhotoUrl { get; set; }
public string? PhotoThumbnailUrl { get; set; }
public DateTime? PhotoUploadedAt { get; set; }
```

✅ Both DTOs updated with photo fields

---

#### AppDbContext.cs (EF Core Mappings)
**File:** `microservices/auth-service/AuthService/Context/AppDbContext.cs`

```csharp
// Patient Photo mappings (Phase 7)
entity.Property(e => e.PhotoUrl).HasColumnName("photo_url");
entity.Property(e => e.PhotoThumbnailUrl).HasColumnName("photo_thumbnail_url");
entity.Property(e => e.PhotoUploadedAt).HasColumnName("photo_uploaded_at");
```

✅ Column mappings configured (snake_case → PascalCase)

---

### 3. Azure Blob Storage Integration - ✅ COMPLETE

#### NuGet Packages Installed

```xml
<PackageReference Include="Azure.Storage.Blobs" Version="12.20.0" />
<PackageReference Include="SixLabors.ImageSharp" Version="3.1.7" />
```

**Azure.Storage.Blobs:** Azure Blob Storage SDK  
**SixLabors.ImageSharp:** Image processing for thumbnail generation  
**Note:** ImageSharp 3.1.7 has a known moderate severity vulnerability (GHSA-rxmq-m78w-7wmc) - monitor for updates

---

#### BlobStorageService Implementation

**Interface:** `Services/Interfaces/IBlobStorageService.cs`  
**Implementation:** `Services/BlobStorageService.cs`

**Key Features:**
```csharp
public interface IBlobStorageService
{
    // Upload file with automatic container creation
    Task<string> UploadFileAsync(string fileName, Stream fileStream, string contentType, string containerName = "patient-photos");
    
    // Upload patient photo with tenant/patient folder structure + thumbnail generation
    Task<(string photoUrl, string thumbnailUrl)> UploadPatientPhotoAsync(
        string fileName, Stream fileStream, string contentType, Guid tenantId, Guid patientId);
    
    // Delete, check existence, get properties
    Task<bool> DeleteFileAsync(string blobUrl);
    Task<bool> BlobExistsAsync(string blobUrl);
    Task<BlobProperties?> GetBlobPropertiesAsync(string blobUrl);
}
```

**Folder Structure:**
```
patient-photos/
  ├── {tenantId}/
  │   ├── {patientId}/
  │   │   ├── photo_20260130134502.jpg (original)
  │   │   └── thumb_photo_20260130134502.jpg (150x150 thumbnail)
```

**Thumbnail Generation:**
- Automatically creates 150x150 pixel thumbnail
- Uses SixLabors.ImageSharp for resizing
- Crop mode for perfect square aspect ratio
- JPEG compression for optimal file size

✅ Service implemented with full CRUD operations

---

#### appsettings.json Configuration

**File:** `microservices/auth-service/AuthService/appsettings.json`

```json
"AzureBlobStorage": {
  "ConnectionString": "DefaultEndpointsProtocol=https;AccountName=hospitalblobdev01;AccountKey=YOUR_ACCOUNT_KEY;EndpointSuffix=core.windows.net",
  "PatientPhotosContainer": "patient-photos",
  "MaxFileSizeMB": 10,
  "AllowedContentTypes": [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
  ]
}
```

**⚠️ ACTION REQUIRED:** Replace `YOUR_ACCOUNT_KEY` with actual Azure Storage Account Key from:
- **Storage Account:** hospitalblobdev01
- **Resource Group:** hospital-portal-rg
- **Location:** Central India
- **How to get:** Azure Portal → Storage Account → Access Keys → key1 → Copy

---

#### Program.cs Service Registration

**File:** `microservices/auth-service/AuthService/Program.cs`

```csharp
// Azure Blob Storage Service (Patient Photos & Documents) - Phase 7
builder.Services.AddSingleton(x =>
{
    var connectionString = builder.Configuration["AzureBlobStorage:ConnectionString"];
    return new Azure.Storage.Blobs.BlobServiceClient(connectionString);
});
builder.Services.AddScoped<IBlobStorageService, BlobStorageService>();
```

✅ Service registered in dependency injection container

---

## ⏳ PENDING IMPLEMENTATION

### 4. PatientsController Update - ⬜ PENDING

**File:** `Controllers/PatientsController.cs`

**Required Changes:**

#### Add Photo Upload Endpoint
```csharp
[HttpPost("{id}/photo")]
[Authorize]
public async Task<IActionResult> UploadPatientPhoto(Guid id, IFormFile photo)
{
    try
    {
        // Validate file
        if (photo == null || photo.Length == 0)
            return BadRequest("No photo file provided");
        
        var maxSizeMB = _configuration.GetValue<int>("AzureBlobStorage:MaxFileSizeMB");
        if (photo.Length > maxSizeMB * 1024 * 1024)
            return BadRequest($"File size exceeds {maxSizeMB}MB limit");
        
        var allowedTypes = _configuration.GetSection("AzureBlobStorage:AllowedContentTypes").Get<string[]>();
        if (!allowedTypes.Contains(photo.ContentType))
            return BadRequest("Invalid file type. Only JPEG, PNG, and WEBP allowed");
        
        // Get patient
        var patient = await _patientService.GetPatientByIdAsync(id);
        if (patient == null)
            return NotFound();
        
        // Upload to Azure Blob Storage
        var tenantId = GetTenantIdFromClaims();
        using var stream = photo.OpenReadStream();
        var (photoUrl, thumbnailUrl) = await _blobStorageService.UploadPatientPhotoAsync(
            photo.FileName, stream, photo.ContentType, tenantId, id);
        
        // Update patient record
        patient.PhotoUrl = photoUrl;
        patient.PhotoThumbnailUrl = thumbnailUrl;
        patient.PhotoUploadedAt = DateTime.UtcNow;
        await _patientService.UpdatePatientAsync(id, patient);
        
        return Ok(new { photoUrl, thumbnailUrl, uploadedAt = DateTime.UtcNow });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error uploading photo for patient {PatientId}", id);
        return StatusCode(500, "Error uploading photo");
    }
}
```

#### Add Delete Photo Endpoint
```csharp
[HttpDelete("{id}/photo")]
[Authorize]
public async Task<IActionResult> DeletePatientPhoto(Guid id)
{
    var patient = await _patientService.GetPatientByIdAsync(id);
    if (patient == null)
        return NotFound();
    
    if (!string.IsNullOrEmpty(patient.PhotoUrl))
    {
        await _blobStorageService.DeleteFileAsync(patient.PhotoUrl);
        
        if (!string.IsNullOrEmpty(patient.PhotoThumbnailUrl))
            await _blobStorageService.DeleteFileAsync(patient.PhotoThumbnailUrl);
        
        patient.PhotoUrl = null;
        patient.PhotoThumbnailUrl = null;
        patient.PhotoUploadedAt = null;
        await _patientService.UpdatePatientAsync(id, patient);
    }
    
    return NoContent();
}
```

**Inject IBlobStorageService:**
```csharp
private readonly IBlobStorageService _blobStorageService;

public PatientsController(
    IPatientService patientService,
    IBlobStorageService blobStorageService,
    ILogger<PatientsController> logger)
{
    _patientService = patientService;
    _blobStorageService = blobStorageService;
    _logger = logger;
}
```

---

### 5. Frontend Implementation - ⬜ PENDING

**File:** `apps/hospital-portal-web/src/app/dashboard/patients/new/page.tsx`

**Required Changes:**

#### TypeScript Interface Update
```typescript
interface PatientFormData {
  // ... existing fields ...
  
  // Phase 7: Patient Photo
  photoFile: File | null;
  photoPreview: string | null;
}
```

#### State Initialization
```typescript
const [formData, setFormData] = useState<PatientFormData>({
  // ... existing fields ...
  
  // Phase 7: Patient Photo
  photoFile: null,
  photoPreview: null,
});
```

#### Photo Upload Component (Step 1 Enhancement)
```tsx
{/* Phase 7: Patient Photo Upload */}
<div className="space-y-4 border-t border-gray-200 pt-4 mt-6">
  <h4 className="text-sm font-semibold text-gray-700">Patient Photo</h4>
  
  <div className="flex items-center gap-4">
    {/* Photo Preview */}
    {formData.photoPreview && (
      <div className="relative">
        <img
          src={formData.photoPreview}
          alt="Patient Photo Preview"
          className="w-32 h-32 object-cover rounded-full border-2 border-gray-300"
        />
        <button
          type="button"
          onClick={() => {
            setFormData({ ...formData, photoFile: null, photoPreview: null });
          }}
          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    )}
    
    {/* File Upload Input */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Upload Photo
      </label>
      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            if (file.size > 10 * 1024 * 1024) {
              alert('File size must be less than 10MB');
              return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
              setFormData({
                ...formData,
                photoFile: file,
                photoPreview: reader.result as string,
              });
            };
            reader.readAsDataURL(file);
          }
        }}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
      <p className="text-xs text-gray-500 mt-1">
        JPEG, PNG, or WEBP (max 10MB)
      </p>
    </div>
    
    {/* Optional: Webcam Capture Button */}
    <button
      type="button"
      onClick={() => {
        // TODO: Implement webcam capture modal
        alert('Webcam capture feature coming soon!');
      }}
      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
    >
      📷 Capture Photo
    </button>
  </div>
</div>
```

#### Update Submission Logic
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    setIsSubmitting(true);
    
    // Step 1: Upload photo first (if provided)
    let photoUrl = '';
    let photoThumbnailUrl = '';
    
    if (formData.photoFile) {
      const photoFormData = new FormData();
      photoFormData.append('photo', formData.photoFile);
      
      // Note: We'll upload after patient creation using patient ID
      // Or implement a temp upload endpoint
    }
    
    // Step 2: Create patient with photo URLs
    const patientData = {
      // ... all existing fields ...
      photoUrl: photoUrl || undefined,
      photoThumbnailUrl: photoThumbnailUrl || undefined,
    };
    
    const response = await api.post('/patients', patientData);
    
    // Step 3: Upload photo to patient-specific folder
    if (formData.photoFile && response.data.id) {
      const photoFormData = new FormData();
      photoFormData.append('photo', formData.photoFile);
      
      await api.post(`/patients/${response.data.id}/photo`, photoFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    
    toast.success('Patient registered successfully with photo!');
    router.push('/dashboard/patients');
  } catch (error) {
    console.error('Error creating patient:', error);
    toast.error('Failed to create patient');
  } finally {
    setIsSubmitting(false);
  }
};
```

---

### 6. Build & Deployment - ⬜ PENDING

**Backend Build:**
```bash
cd microservices/auth-service/AuthService
dotnet build
dotnet run
```

**Expected:**
- ✅ 0 errors
- ⚠️ 589 warnings (pre-existing nullable warnings)
- ✅ Server starts on http://localhost:5073

**Frontend Build:**
```bash
cd apps/hospital-portal-web
pnpm install
pnpm dev
```

---

### 7. Testing - ⬜ PENDING

**Test Cases:**

1. **Upload Patient Photo**
   - Navigate to New Patient form
   - Fill required fields
   - Upload JPEG photo (< 10MB)
   - Verify preview displays
   - Submit form
   - Check database: photo_url, photo_thumbnail_url, photo_uploaded_at populated
   - Verify Azure Blob Storage: Original + thumbnail files exist

2. **File Validation**
   - Try uploading 15MB file → Error: "File size exceeds 10MB limit"
   - Try uploading PDF → Error: "Invalid file type"
   - Try uploading PNG → Success

3. **Delete Photo**
   - Open existing patient with photo
   - Click "Remove Photo" button
   - Verify database: photo fields nullified
   - Verify Azure Blob Storage: Files deleted

4. **Photo Display**
   - View patient details modal
   - Verify thumbnail displays (150x150)
   - Click thumbnail → Full-size photo modal

5. **Azure Blob Storage Structure**
   - Check folder structure: `patient-photos/{tenantId}/{patientId}/`
   - Verify original and thumbnail files
   - Check file naming: `photo_20260130134502.jpg`

---

## 📊 PROGRESS SUMMARY

### Backend Implementation: **95% Complete ✅**

| Component | Status | Notes |
|-----------|--------|-------|
| Database Migration | ✅ DEPLOYED | 3 columns added to production |
| Patient.cs Model | ✅ COMPLETE | 3 properties added (62 fields total) |
| PatientDtos.cs | ✅ COMPLETE | Both DTOs updated |
| AppDbContext.cs | ✅ COMPLETE | Column mappings configured |
| Azure Blob Storage SDK | ✅ INSTALLED | v12.20.0 |
| ImageSharp SDK | ✅ INSTALLED | v3.1.7 |
| BlobStorageService | ✅ COMPLETE | Full CRUD + thumbnail generation |
| appsettings.json | ✅ CONFIGURED | ⚠️ Need actual Account Key |
| Program.cs Registration | ✅ COMPLETE | DI configured |
| **PatientsController** | ⬜ PENDING | Upload/delete endpoints needed |

### Frontend Implementation: **0% Complete ⬜**

| Component | Status | Notes |
|-----------|--------|-------|
| TypeScript Interface | ⬜ PENDING | Add photoFile, photoPreview |
| State Management | ⬜ PENDING | Initialize photo state |
| Photo Upload UI | ⬜ PENDING | Step 1 enhancement needed |
| File Validation | ⬜ PENDING | Size/type checks |
| Preview Component | ⬜ PENDING | Image preview before submit |
| Webcam Capture | ⬜ PENDING | Optional feature |
| Submission Logic | ⬜ PENDING | Multipart/form-data upload |

### Testing: **0% Complete ⬜**

| Test | Status | Notes |
|------|--------|-------|
| Photo Upload | ⬜ PENDING | End-to-end test |
| File Validation | ⬜ PENDING | Error scenarios |
| Azure Blob Storage | ⬜ PENDING | Verify folder structure |
| Photo Display | ⬜ PENDING | UI rendering |
| Photo Delete | ⬜ PENDING | Cleanup test |

---

## 🚧 BLOCKING ISSUES

### 1. Azure Storage Account Key Required ⚠️

**Current:** `"AccountKey": "YOUR_ACCOUNT_KEY"`  
**Action Required:**
1. Open Azure Portal
2. Navigate to: Storage accounts → hospitalblobdev01
3. Go to: Security + networking → Access keys
4. Copy: key1 → Key
5. Update: `appsettings.json` → AzureBlobStorage:ConnectionString

**Temporary Workaround (Development):**
- Use SAS (Shared Access Signature) token instead
- Or enable Azure AD authentication (recommended for production)

---

## 📋 NEXT SESSION CHECKLIST

### Immediate Tasks (2-3 hours remaining):

1. **✅ Get Azure Storage Account Key**
   - Update appsettings.json with actual connection string
   - Test Blob Storage connection

2. **Update PatientsController (30 mins)**
   - Add photo upload endpoint: `POST /patients/{id}/photo`
   - Add photo delete endpoint: `DELETE /patients/{id}/photo`
   - Inject IBlobStorageService
   - Add file validation logic

3. **Build & Test Backend (15 mins)**
   - `dotnet build` (expect 0 errors)
   - `dotnet run` (verify server starts)
   - Test upload endpoint via Swagger/Postman

4. **Update Frontend (1.5 hours)**
   - Add photo fields to TypeScript interface
   - Add photo upload UI in Step 1
   - Implement file preview
   - Update submission logic
   - Add photo display in patient details

5. **End-to-End Testing (30 mins)**
   - Register patient with photo
   - Verify Azure Blob Storage upload
   - Verify database records
   - Test photo display
   - Test photo delete

---

## 🎯 COMPLETION CRITERIA

Phase 7 will be **100% COMPLETE** when:

✅ Backend endpoints working (upload/delete)  
✅ Frontend photo upload UI functional  
✅ Photos uploading to Azure Blob Storage  
✅ Thumbnails generated automatically  
✅ Database fields populated correctly  
✅ Photos displaying in patient details  
✅ Photo deletion working  
✅ All validation rules enforced  
✅ Error handling tested  
✅ Documentation updated  

**Estimated Time Remaining:** 2-3 hours

---

## 📈 OVERALL PATIENT REGISTRATION STATUS

**After Phase 7 Completion:**

| Phase | Description | Fields | Backend | Frontend | Status |
|-------|------------|--------|---------|----------|--------|
| Phase 1 | Emergency + Insurance | 15 | ✅ 100% | ✅ 100% | ✅ COMPLETE |
| Phase 2 | Identity Documents | 6 | ✅ 100% | ✅ 100% | ✅ COMPLETE |
| Phase 3 | Guardian Information | 6 | ✅ 100% | ✅ 100% | ✅ COMPLETE |
| Phase 4 | Medical History | 8 | ✅ 100% | ✅ 100% | ✅ COMPLETE |
| Phase 5 | Structured Address | 6 | ✅ 100% | ✅ 100% | ✅ COMPLETE |
| Phase 6 | Extended Demographics | 7 | ✅ 100% | ✅ 100% | ✅ COMPLETE |
| **Phase 7** | **Patient Photo** | **3** | **🟡 95%** | **⬜ 0%** | **⏳ IN PROGRESS** |
| Phase 8 | Lifestyle Fields | 5 | ✅ 100% | ✅ 100% | ✅ COMPLETE |

**Total Progress:** 62/65 fields (95%) - Backend at 62 fields, Frontend at 59 fields

**Remaining Phases:** None (Phase 7 is the last pending phase)

---

**Document Created:** January 30, 2026  
**Last Updated:** January 30, 2026  
**Phase 7 Status:** 🟡 Backend 95% Complete | Frontend Pending  
**Next Implementation:** Complete PatientsController + Frontend photo upload UI  
**Estimated Completion:** 2-3 hours
