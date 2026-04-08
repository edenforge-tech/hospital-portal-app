# Testing New Audio Recording & Document Upload Features

## 🧪 Testing Without Backend (Mock Data Mode)

The new features can be tested **without the backend running** using built-in mock data.

### What's Been Implemented

✅ **Auto-Start Audio Recording**
- Triggers when counselor selects a patient from queue
- Shows waveform visualization with audio level
- Session timer in MM:SS format
- Pause/Resume/Stop controls
- Auto-uploads to backend (or mocks upload when backend down)

✅ **Optional Document Upload**
- Opens after payment mode confirmation
- 3 capture methods: Camera, File Upload, Mobile Photo
- Shows required documents list
- Auto-approves uploaded documents
- Skip button for optional flow

✅ **Queue Integration**
- Clickable patient cards with hover states
- "Start Next Session" button
- Mock queue data with 3 patients when backend unavailable

✅ **Session Controls in Header**
- Recording panel with live audio level
- Session number display
- "View Session" button

---

## 📋 Testing Steps

### 1. Start Frontend (Backend Optional)

```powershell
cd apps/hospital-portal-web
pnpm dev
```

Open browser: `http://localhost:3000`

### 2. Navigate to Counselor Workspace

Go to: `/dashboard/counselor/workspace`

**Expected:** You should see:
- Header with connection status
- Queue widget showing 3 mock patients:
  - Ramesh Kumar (T-001) - Insurance, High Priority
  - Priya Sharma (T-002) - Cash, Medium Priority  
  - Ahmed Khan (T-003) - Government Scheme, Low Priority
- Queue stats: 3 Waiting, 0 In Progress
- Quick Actions, Follow-ups, Recent Sessions widgets

### 3. Test Audio Recording

1. **Click on first patient card** (Ramesh Kumar) OR click "Start Next Session" button
2. **Check Browser Console** (F12) for logs:
   ```
   🎬 Starting session for queue item: mock-queue-001
   📋 Queue item details: {id: 'mock-queue-001', ...}
   ⚠️ Backend unavailable. Using mock session data for testing.
   ✅ Session start result: {success: true, sessionId: 'mock-session-...'}
   🎙️ Recording activated for session: mock-session-1234567890
   🎙️ AudioRecorderPanel mounted: {autoStart: true, ...}
   🎬 Auto-starting recording...
   ```

3. **Grant Microphone Permission** (browser will prompt)

4. **AudioRecorderPanel appears in header**:
   - Red pulsing dot + "REC" indicator
   - Timer: 00:00 → 00:01 → 00:02...
   - Waveform bar animating (cyan, 0-100%)
   - Pause and Stop buttons visible

5. **Test Controls**:
   - Click **Pause** → Status changes to "PAUSED" (amber indicator)
   - Click **Play** → Resumes recording
   - Click **Stop (red square)** → Recording stops

6. **Auto-Upload** (mocked):
   - Status changes to "Uploading recording..." (blue spinner)
   - Status changes to "Recording saved" (green checkmark)
   - Panel disappears after 3 seconds

### 4. Test Document Upload

1. **Navigate to workflow page**:
   - Either click "View Session" button in header
   - Or manually go to: `/dashboard/counselor/workflow?sessionId=mock-session-1234567890`

2. **Select Payment Mode**:
   - Scroll to "Payment Mode Selection" widget
   - Click **"Insurance Patient"** card (blue shield icon)
   - Click **"Confirm Payment Mode"** button

3. **Document Upload Modal Opens**:
   - Title: "Upload Documents (Optional)"
   - Shows required documents:
     - Insurance Card
     - Policy Document
     - ID Proof
     - Employer Letter
   - 3 upload buttons displayed:
     - 📷 Use Camera
     - 📤 Upload Files
     - 🖼️ Mobile Photo

4. **Test Camera Capture**:
   - Click "Use Camera" button
   - Grant camera permission
   - PhotoCapture component shows webcam feed
   - Click capture button → Photo added to upload list
   - Preview thumbnail shows captured image

5. **Test File Upload**:
   - Click "Upload Files" button
   - Select PDF or images (max 10MB each)
   - Files added to upload list with preview

6. **Test Upload**:
   - Click "Upload 2 Documents" button (or however many selected)
   - Each document shows "Uploading..." spinner
   - Changes to green checkmark on success
   - Modal auto-closes after 1.5 seconds
   - **Without Backend**: Upload will complete instantly (mocked)

7. **Test Skip**:
   - Close modal → Click "Skip for Now" button
   - Modal closes, payment mode remains confirmed
   - Workflow continues normally

---

## 🔍 Debugging Console Logs

Open Browser Console (F12) to see detailed logs:

### Queue Widget Logs:
```
🧪 Mock queue loaded: 3 items
🏥 QueueWidget render: {queueItemsCount: 3, nextPatientsCount: 3, ...}
```

### Session Start Logs:
```
🎬 Starting session for queue item: mock-queue-001
📋 Queue item details: {id: 'mock-queue-001', patientName: 'Ramesh Kumar', ...}
⚠️ Backend unavailable. Using mock session data for testing.
✅ Session start result: {success: true, sessionId: 'mock-session-1234567890', ...}
🎙️ Recording activated for session: mock-session-1234567890
```

### Audio Recorder Logs:
```
🎙️ AudioRecorderPanel mounted: {autoStart: true, isSupported: true, state: 'idle', ...}
🎬 Auto-starting recording...
```

### Document Upload Logs:
```
⚠️ Using mock document upload (backend unavailable)
✅ Document uploaded: Insurance Card
```

---

## 🐛 Troubleshooting

### Issue: Queue Shows "No patients waiting"

**Cause**: Mock data not loading due to API error not being caught

**Solution**: 
1. Check browser console for errors
2. Verify `counseling-queue.api.ts` has mock fallback:
   ```typescript
   catch (error) {
     console.warn('⚠️ Backend unavailable. Using mock queue data');
     return getMockQueueData();
   }
   ```

### Issue: AudioRecorderPanel doesn't appear

**Check**:
1. Console logs show "🎙️ Recording activated for session: ..."
2. State values in workspace page:
   ```typescript
   console.log({ activeSessionId, recordingActive });
   // Should be: {activeSessionId: 'mock-session-...', recordingActive: true}
   ```
3. Microphone permission granted (check browser address bar)

### Issue: "Microphone permission denied"

**Solution**:
1. Click lock icon in browser address bar
2. Allow microphone access
3. Refresh page
4. Try starting session again

### Issue: Document modal doesn't open

**Check**:
1. Payment mode confirmed successfully (toast appears)
2. Console shows: `setShowDocumentModal(true)`
3. Modal component imported correctly in `PaymentModeSelectionWidget.tsx`

### Issue: TypeScript errors in editor

**Cause**: Stale type cache or duplicate function errors

**Solution**:
1. Restart TypeScript server: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
2. Reload VS Code window: `Ctrl+Shift+P` → "Developer: Reload Window"
3. Clear Next.js cache:
   ```powershell
   cd apps/hospital-portal-web
   rm -rf .next
   pnpm dev
   ```

---

## ✅ Expected Results Summary

| Feature | Expected Behavior |
|---------|------------------|
| **Queue Widget** | Shows 3 mock patients with names, tokens, wait times |
| **Patient Card Click** | Toast appears, AudioRecorderPanel shows in header |
| **Recording Start** | Red "REC" indicator, timer counts, waveform animates |
| **Recording Stop** | Blue "Uploading...", green "Recording saved", panel disappears |
| **Payment Confirm** | Document modal opens automatically |
| **Camera Capture** | Webcam feed shows, capture button adds photo to list |
| **File Upload** | Files added with preview thumbnails |
| **Upload Click** | Spinners → Checkmarks → Modal auto-closes |
| **Skip Button** | Modal closes, no upload required |

---

## 🚀 With Backend Running

If backend starts successfully (`dotnet run` on port 5073):

1. **Real API calls replace mocks**:
   - Queue fetches from `GET /api/counseling/queue`
   - Session start calls `POST /api/counseling/queue/{id}/start`
   - Audio upload calls `POST /api/counseling/sessions/{id}/upload-audio`
   - Document upload calls `POST /api/counseling/documents`

2. **TranscriptionService activates**:
   - Audio files uploaded to Azure Blob Storage
   - Azure Speech-to-Text job started
   - Transcription status tracked in database

3. **Database records created**:
   - `counseling_sessions` table
   - `session_recordings` table (with FileUrl, TranscriptionStatus)
   - `counseling_session_documents` table

---

## 📝 Notes

- Mock data **automatically activates** when backend is unavailable
- All features work **identically** in mock mode vs real backend
- **No code changes needed** to switch between mock and real data
- Console logs use **emoji prefixes** for easy filtering:
  - 🧪 = Mock data
  - ✅ = Success
  - ❌ = Error
  - ⚠️ = Warning/Fallback
  - 🎬 = Action started
  - 🎙️ = Recording-related
  - 🏥 = Queue-related
  - 📋 = Data display

