# 🚀 FRONTEND TESTING - QUICK START GUIDE

**Status**: ✅ Backend Running | ✅ Frontend Running  
**Date**: February 23, 2026

---

## 🎯 IMMEDIATE ACTIONS

### 1. Open Frontend
```
http://localhost:3000
```

### 2. Login Credentials
- **Email**: `admin@test.com`
- **Password**: `Admin@123456`

### 3. Navigate to Counselor Module
- Look for **"Counselor"** in sidebar
- Should see 6 sub-sections:
  - 📋 Sessions
  - 🏥 Insurance  
  - 💰 Payments
  - 🛏️ Admissions
  - 📄 Consents
  - 🔄 Workflow

---

## ✅ QUICK TEST CHECKLIST (30 min)

### Test 1: Sessions (5 min)
**Path**: Counselor → Sessions

- [ ] **View** table loads

**Retinal Conditions** (Vitreoretinal Surgery):
- `H33.0` - Retinal detachment with retinal break
- `H33.2` - Serous retinal detachment
- `H33.3` - Retinal breaks without detachment
- `H35.3` - Degeneration of macula and posterior pole
- `H35.5` - Hereditary retinal dystrophy

**Corneal Conditions**:
- `H16.0` - Corneal ulcer
- `H17.0` - Adherent leukoma
- `H18.0` - Corneal pigmentations and deposits
- `H18.1` - Bullous keratopathy
- `H18.6` - Keratoconus

#### Step 3: See the Scissor Icon ✂️
1. In the **Diagnosis Tab**, click "+ Add Diagnosis"
2. Search for and add any diagnosis from the list above (e.g., "H25.1")
3. Save the diagnosis
4. **Look for the purple scissor icon** next to the diagnosis in the list
5. If you don't see it, the ICD-10 code doesn't qualify for surgery

### 🎯 Testing the Surgery Recommendation Dialog

When you click the **scissor icon (✂️)**, you'll see a **5-Step Wizard**:

#### **Step 1: Surgery Type Selection**
- Pre-filled based on diagnosis
- Options: Cataract, Glaucoma, Vitreoretinal, Corneal
- Sub-type dropdown (e.g., Phacoemulsification, ECCE, ICCE for cataract)

#### **Step 2: IOL Calculator** (Cataract Only)
- Input biometry values:
  - Axial Length (15-35mm)
  - K1/K2 readings (35-52D)
  - Anterior Chamber Depth
- Select formula: **Barrett Universal II** (recommended), SRK/T, Haigis, Holladay, Hoffer Q
- Click "Calculate IOL Power"
- See recommended IOL powers for each formula

#### **Step 3: Package Selection**
- Standard Package (₹25,000)
- Premium Package (₹50,000)
- Custom Package (enter amount)

#### **Step 4: Pre-Op Checklist**
- Auto-generated based on surgery type
- Add/remove custom items
- Examples: "Complete blood count", "ECG", "COVID-19 RT-PCR"

#### **Step 5: Actions**
- Refer to Counselor (checkbox)
- Schedule Pre-Op Tests (checkbox)
- Surgery Date/Time picker
- Urgency: Routine, Urgent, Emergency
- Notes field

#### **Submit**
- Creates surgery recommendation
- API call to: `POST /api/surgery/recommend`
- Shows success toast
- Refers to counselor if selected

---

## 🔬 Where to Test Task 7: OCT Viewer

### 📍 Location in Frontend
**Navigation Path**:
```
Login → Patient Management → Select Patient → Check In → Examination Desk → Imaging Tab
```

### 🔍 Step-by-Step Instructions

#### Step 1: Order Imaging Study
1. Navigate to **Imaging Tab** in Examination Desk
2. Click **"Order New Imaging Study"** button
3. Select imaging type: **"OCT Macula"**, **"OCT RNFL"**, or **"OCT Anterior Segment"**
4. Select eye: OD, OS, or OU
5. Select urgency: Routine, Urgent, or Stat
6. Add clinical indication (optional)
7. Click **"Order Imaging"**

#### Step 2: Simulate Completed Scan
For testing purposes, you'll need to:
1. Create a mock imaging order with `status: 'completed'`
2. Add a `dicomUrl` property to the image object
3. Example:
   ```json
   {
     "id": "oct-001",
     "imagingType": "OCT Macula",
     "status": "completed",
     "images": [{
       "id": "img-001",
       "thumbnailUrl": "/oct-thumb.png",
       "fullUrl": "/oct-full.png",
       "dicomUrl": "https://cornerstonejs.org/images/CornerstoneWADOImageLoaderDataSet.dcm",
       "modality": "OCT",
       "captureDate": "2026-02-21T10:30:00Z",
       "seriesDescription": "Macular Cube 512x128"
     }]
   }
   ```

#### Step 3: View OCT Scan
1. In **Imaging Tab**, find the completed OCT order
2. Look for the **🔍 Maximize2 icon** on hover over the thumbnail
3. Click the icon or the thumbnail
4. **OCT Viewer opens in fullscreen!**

### 🎮 Testing OCT Viewer Tools

Once the viewer opens, test these features:

#### **Pan Tool** (✋ Move icon)
- Click the Pan button in the left toolbar
- Drag the image to move it around
- Toast notification: "Pan tool activated (drag to move)"

#### **Zoom In/Out** (🔍 ZoomIn/ZoomOut icons)
- Click **Zoom In** → image scales to 125%, 150%, 200%, up to 400%
- Click **Zoom Out** → image scales down to 75%, 50%, minimum 25%
- Current zoom shows in top-left overlay (e.g., "Zoom: 150%")

#### **Window/Level** (🎨 Contrast icon)
- Click the Window/Level button
- Drag to adjust brightness (window center) and contrast (window width)
- Values displayed in top-left: "W/C: 50", "W/W: 100"
- Toast: "Window/Level tool activated (drag to adjust)"

#### **Measurement Ruler** (📏 Ruler icon)
- Click the Measurement button
- Click and drag on the image to measure distances
- Shows measurement overlay
- Toast: "Measurement tool activated (click and drag)"

#### **Reset View** (🔄 RotateCw icon)
- Resets zoom to 100%
- Resets window/level to defaults
- Re-centers the image
- Toast: "View reset"

#### **Download DICOM** (⬇️ Download icon)
- Downloads the DICOM file
- Toast: "Downloading DICOM file..."

#### **Slice Navigation** (◀️ ▶️ Previous/Next)
- For multi-frame OCT scans (128 B-scans typical)
- Bottom navigation shows: "1 / 128"
- Click Previous/Next to scroll through slices
- Keyboard: Arrow keys (when implemented)

#### **Close Viewer** (✖️ X icon - top right)
- Closes fullscreen viewer
- Returns to Imaging Tab

---

## 🎯 Quick Test Scenarios

### Scenario 1: Complete Surgery Workflow
1. Add diagnosis **H25.1** (Age-related nuclear cataract)
2. Click scissor icon ✂️
3. Wizard opens → **Step 1**: Confirm "Cataract" selected
4. **Step 2**: IOL Calculator
   - Axial Length: 23.5mm
   - K1: 43.5D, K2: 44.0D
   - ACD: 3.2mm
   - Formula: Barrett Universal II
   - Click "Calculate" → See recommended IOL power (e.g., +21.5D)
5. **Step 3**: Select "Premium Package" (₹50,000)
6. **Step 4**: Review pre-op checklist (auto-generated)
7. **Step 5**: 
   - Check "Refer to Counselor"
   - Set surgery date: 7 days from today
   - Urgency: Routine
8. Click "Submit Surgery Recommendation"
9. ✅ Success toast: "Surgery recommendation created successfully! Referred to counselor."

### Scenario 2: OCT Viewer Test
1. **Order OCT scan**: Imaging Tab → Order → OCT Macula → OD → Routine
2. **Simulate completion**: Backend marks status as "completed" with DICOM URL
3. **View scan**: Click thumbnail or 🔍 icon
4. **Test tools**:
   - Zoom in 3 times → 175%
   - Pan tool → drag image around
   - Window/Level → adjust contrast
   - Zoom out 2 times → 125%
   - Reset view → back to 100%
5. **Navigate slices**: Click Next 5 times → "6 / 128"
6. **Close viewer** → Return to Imaging Tab

---

## 🐛 Troubleshooting

### Issue: Scissor Icon Not Showing
**Cause**: Diagnosis ICD-10 code doesn't qualify for surgery
**Solution**: 
- Check ICD-10 code starts with: H25, H26, H40, H33, H35, H16, H17, or H18
- Try adding **H25.1** (guaranteed to show icon)

### Issue: Surgery Dialog Doesn't Open
**Cause**: JavaScript error or missing component
**Solution**: 
- Check browser console (F12)
- Verify `SurgeryRecommendationDialog.tsx` exists
- Check for TypeScript errors

### Issue: IOL Calculator Shows No Results
**Cause**: Invalid biometry values
**Solution**:
- Axial Length: 15-35mm (typical: 22-25mm)
- K readings: 35-52D (typical: 42-45D)
- ACD: 1.5-5.0mm (typical: 3.0-3.5mm)

### Issue: OCT Viewer Shows Black Screen
**Cause**: DICOM file not loading (Cornerstone not initialized yet)
**Solution**:
- This is EXPECTED in current version (Week 1)
- Cornerstone integration pending (2-3 hours in Week 2)
- Viewer UI is complete, DICOM rendering needs wiring

### Issue: OCT Viewer Not Opening
**Cause**: No `dicomUrl` property on image
**Solution**:
- Verify imaging order has `images` array
- Check image object has `dicomUrl` property
- For non-DICOM images, regular image viewer opens in new tab

---

## 📊 Expected Behavior Summary

### Task 6: Surgery Request API ✅
- **Scissor icon appears** next to qualifying diagnoses (H25, H26, H40, H33, H35, H16-H18)
- **5-step wizard opens** with pre-filled surgery type
- **IOL calculator works** for cataract surgeries (5 formulas)
- **Pre-op checklist auto-generates** based on surgery type + patient comorbidities
- **Submission creates surgery recommendation** via `POST /api/surgery/recommend`
- **Toast notification confirms** successful submission
- **Counselor referral** sent if checkbox selected

### Task 7: OCT Viewer ✅
- **Imaging orders display** in Imaging Tab with thumbnails
- **🔍 Maximize2 icon** appears on hover for DICOM images
- **Click opens fullscreen viewer** with black background
- **7 tools available** in left toolbar (pan, zoom in/out, window/level, measure, reset, download)
- **Slice navigation** works for multi-frame scans (128 B-scans typical)
- **Patient metadata displays** in top-right corner (name, eye, date)
- **Image metadata displays** in top-left (zoom %, window/center, window/width)
- **Close button** returns to Imaging Tab
- **DICOM rendering** pending Cornerstone integration (Week 2)

---

## 🎉 Ready to Test!

Both features are live in the frontend. The surgery recommendation is **fully functional end-to-end**, while the OCT viewer has a **complete UI structure** with DICOM rendering pending 2-3 hours of Cornerstone.js integration.

**Start Testing**: `http://localhost:3000/dashboard/doctors-desk`

