# Test Fixtures for Imaging E2E Tests

## Required DICOM Files

This directory should contain sample DICOM files for end-to-end testing.

### File List:

1. **sample-ct.dcm** (Required)
   - Type: Single CT slice
   - Size: ~512KB
   - Use: Basic upload and annotation tests
   - Source: https://www.dicomlibrary.com/

2. **mri-slice-001.dcm, mri-slice-002.dcm, mri-slice-003.dcm** (Required)
   - Type: MRI series (3 slices)
   - Size: ~256KB each
   - Use: Multi-file upload tests
   - Source: https://www.dicomlibrary.com/

3. **large-ct-series.dcm** (Optional)
   - Type: Full CT series
   - Size: 100MB+
   - Use: Performance testing
   - Source: https://www.cancerimagingarchive.net/

4. **corrupted.dcm** (Required)
   - Type: Intentionally corrupted DICOM
   - Size: ~100KB
   - Use: Error handling tests
   - Creation: Modify header of valid DICOM file

5. **invalid-image.jpg** (Required)
   - Type: Regular JPEG image
   - Size: ~50KB
   - Use: File type validation tests
   - Creation: Any JPEG file

## How to Obtain Test Files

### Option 1: Public DICOM Libraries
```powershell
# Download sample files from DICOM Library
Invoke-WebRequest -Uri "https://www.dicomlibrary.com/dicom/samples/sample-ct.dcm" -OutFile "sample-ct.dcm"
```

### Option 2: Medical Imaging Archive
Visit: https://www.cancerimagingarchive.net/
- Browse collections
- Download anonymized datasets
- Extract DICOM files

### Option 3: Generate Synthetic DICOMs
```powershell
# Install DICOM generator
pip install pydicom

# Run generator script (create generate_test_dicoms.py first)
python generate_test_dicoms.py
```

### Option 4: Use Existing Hospital Data (HIPAA Compliant)
**⚠️ IMPORTANT: Only use fully de-identified data**
- Remove all patient identifiers
- Use synthetic demographics
- Ensure HIPAA compliance

## Verify DICOM Files

### Check File Validity
```powershell
# Install DCMTK (DICOM toolkit)
choco install dcmtk

# Verify DICOM file
dcmdump sample-ct.dcm
```

### Verify File Size
```powershell
Get-ChildItem -Path . -Filter "*.dcm" | Select-Object Name, Length
```

Expected output:
```
Name                 Length
----                 ------
sample-ct.dcm        524288
mri-slice-001.dcm    262144
mri-slice-002.dcm    262144
mri-slice-003.dcm    262144
large-ct-series.dcm  104857600
corrupted.dcm        102400
```

## Create Corrupted DICOM for Testing

```powershell
# Copy valid DICOM
Copy-Item sample-ct.dcm corrupted.dcm

# Corrupt the file (modify header)
$bytes = [System.IO.File]::ReadAllBytes("corrupted.dcm")
$bytes[0] = 0xFF
$bytes[1] = 0xFF
[System.IO.File]::WriteAllBytes("corrupted.dcm", $bytes)
```

## Create Invalid Image for Testing

```powershell
# Any JPEG will work
Copy-Item "C:\Path\To\Any\Image.jpg" invalid-image.jpg
```

## Security & Privacy

### HIPAA Compliance Checklist
- [ ] All patient names removed
- [ ] All dates shifted or removed
- [ ] All location information removed
- [ ] All unique identifiers removed
- [ ] Files stored securely
- [ ] No real patient data used

### Best Practices
1. **Never use real patient data** in test fixtures
2. **Always use synthetic or anonymized data**
3. **Verify de-identification** using DICOM viewers
4. **Store fixtures in .gitignore** if containing sensitive data
5. **Use public datasets** when possible

## Gitignore Configuration

Add to `.gitignore`:
```
# Exclude large DICOM files from version control
apps/hospital-portal-web/tests/fixtures/*.dcm
apps/hospital-portal-web/tests/fixtures/large-*

# Include small test files
!apps/hospital-portal-web/tests/fixtures/sample-ct.dcm
!apps/hospital-portal-web/tests/fixtures/corrupted.dcm
```

## Alternative: Mock DICOM Data

For CI/CD pipelines, use mock data instead of real DICOM files:

```typescript
// In tests, mock the DICOM loader
vi.mock('@cornerstonejs/dicom-image-loader', () => ({
  wadouri: {
    loadImage: vi.fn(() => Promise.resolve({
      imageId: 'mock-image-id',
      data: new Uint8Array(512 * 512),
      width: 512,
      height: 512,
    })),
  },
}));
```

## File Status

| File | Status | Size | Notes |
|------|--------|------|-------|
| sample-ct.dcm | ⏳ Pending | 512KB | Download from DICOM Library |
| mri-slice-001.dcm | ⏳ Pending | 256KB | Download from DICOM Library |
| mri-slice-002.dcm | ⏳ Pending | 256KB | Download from DICOM Library |
| mri-slice-003.dcm | ⏳ Pending | 256KB | Download from DICOM Library |
| large-ct-series.dcm | ⏳ Pending | 100MB+ | Optional - for performance tests |
| corrupted.dcm | ⏳ Pending | 100KB | Create from valid DICOM |
| invalid-image.jpg | ⏳ Pending | 50KB | Any JPEG file |

## Next Steps

1. Download sample DICOM files from public sources
2. Verify files are valid using DCMTK
3. Create corrupted and invalid files
4. Run E2E tests to verify fixtures work
5. Update this README with actual file sizes

---

**Note**: Tests will skip DICOM-dependent scenarios if fixtures are not found.
