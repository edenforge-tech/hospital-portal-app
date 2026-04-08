# ComparisonViewer Integration Guide

## Overview
The ComparisonViewer component provides side-by-side medical image comparison with synchronized controls for progression tracking, treatment response evaluation, and bilateral comparisons.

## Features

### Core Functionality
- **Split-screen layout**: Adjustable divider (20-80% range) with drag-to-resize
- **Synchronized controls**: Toggle to enable/disable sync between viewers
  - Zoom levels
  - Pan position
  - Brightness/Contrast
  - Rotation
  - Color inversion
- **Baseline vs Follow-up**: Clear visual indicators with dates
- **Annotation support**: Full annotation tools available on both images
- **Comparison notes**: Structured documentation with:
  - Comparison type (Progression, Treatment Response, Bilateral, Other)
  - Clinical significance (None, Mild, Moderate, Significant, Critical)
  - Free-text findings
- **API integration**: Automatic save to backend `/Imaging/comparisons` endpoint

## Installation

The component is located at:
```
apps/hospital-portal-web/src/components/imaging/ComparisonViewer.tsx
```

### Dependencies
- React 18+
- lucide-react (X, CheckCircle icons)
- react-hot-toast (notifications)
- SimpleDICOMViewer component
- @/lib/api (backend API integration)

## Usage

### Basic Example

```tsx
import ComparisonViewer from '@/components/imaging/ComparisonViewer';

function MyImagingPage() {
  const [showComparison, setShowComparison] = useState(false);

  const baseline = {
    id: 'img-baseline-123',
    url: 'https://storage.azure.com/images/baseline.dcm',
    patientName: 'John Doe',
    studyDate: '2025-12-01',
    studyDescription: 'Fundus Photography',
  };

  const followup = {
    id: 'img-followup-456',
    url: 'https://storage.azure.com/images/followup.dcm',
    patientName: 'John Doe',
    studyDate: '2026-02-15',
    studyDescription: 'Fundus Photography - 3mo F/U',
  };

  return (
    <>
      <button onClick={() => setShowComparison(true)}>
        Compare Images
      </button>

      {showComparison && (
        <ComparisonViewer
          baselineImage={baseline}
          followupImage={followup}
          patientId="patient-789"
          onClose={() => setShowComparison(false)}
        />
      )}
    </>
  );
}
```

### Integration with ImageGallery

To integrate with the existing ImageGallery component:

```tsx
// In ImageGallery.tsx or parent component
const [comparisonMode, setComparisonMode] = useState({
  enabled: false,
  baseline: null,
  followup: null,
});

const handleSelectForComparison = (image: ImagingImage) => {
  if (!comparisonMode.baseline) {
    setComparisonMode({ ...comparisonMode, baseline: image });
    toast.success('Baseline image selected. Select follow-up image.');
  } else {
    setComparisonMode({ 
      enabled: true, 
      baseline: comparisonMode.baseline, 
      followup: image 
    });
  }
};

// In gallery grid
<div className="grid grid-cols-4 gap-4">
  {images.map(image => (
    <div key={image.id} className="relative group">
      <img src={image.thumbnailUrl} />
      <button 
        onClick={() => handleSelectForComparison(image)}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
      >
        Compare
      </button>
    </div>
  ))}
</div>

{comparisonMode.enabled && (
  <ComparisonViewer
    baselineImage={comparisonMode.baseline}
    followupImage={comparisonMode.followup}
    onClose={() => setComparisonMode({ enabled: false, baseline: null, followup: null })}
  />
)}
```

### Custom Save Handler

Override the default save behavior:

```tsx
const handleCustomSave = async (data) => {
  // Add custom logic before/after saving
  console.log('Custom pre-save logic', data);
  
  // Call your own API endpoint
  const response = await fetch('/api/custom/comparisons', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (response.ok) {
    // Trigger custom post-save actions
    sendNotificationToDoctor(data);
    updatePatientTimeline(data);
  }
};

<ComparisonViewer
  baselineImage={baseline}
  followupImage={followup}
  onSaveComparison={handleCustomSave}
/>
```

## Props Reference

### ComparisonViewerProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `baselineImage` | `ImageData` | Yes | Earlier/baseline image configuration |
| `followupImage` | `ImageData` | Yes | Later/follow-up image configuration |
| `patientId` | `string` | No | Patient ID for comparison record |
| `onClose` | `() => void` | No | Callback when user closes viewer |
| `onSaveComparison` | `(data: ComparisonData) => Promise<void>` | No | Custom save handler (overrides default API) |

### ImageData Interface

```typescript
interface ImageData {
  id: string;                  // Unique image identifier
  url: string;                 // Image URL (Azure Blob or DICOM endpoint)
  patientName?: string;        // Patient name for header display
  studyDate?: string;          // Study acquisition date
  studyDescription?: string;   // Study/series description
}
```

### ComparisonData Interface

```typescript
interface ComparisonData {
  patientId?: string;
  baselineImageId: string;
  followupImageId: string;
  comparisonType: 'progression' | 'treatment_response' | 'bilateral' | 'other';
  findings: string;            // Free-text clinical observations
  clinicalSignificance: 'none' | 'mild' | 'moderate' | 'significant' | 'critical';
}
```

## Backend API Endpoint

The component expects the following endpoint (already implemented in Phase 2):

```
POST /api/Imaging/comparisons
Content-Type: application/json

{
  "patientId": "uuid",
  "baselineImageId": "uuid",
  "followupImageId": "uuid",
  "comparisonType": "progression",
  "findings": "Progressive retinal thinning observed in macular region...",
  "clinicalSignificance": "moderate"
}

Response: 200 OK
{
  "id": "comparison-uuid",
  "createdAt": "2026-02-21T10:30:00Z",
  ...
}
```

## Keyboard Shortcuts (Future Enhancement)

Plan for Phase 8 - UX Polish:
- `S` - Toggle sync mode
- `D` - Drag divider (hold and use arrow keys)
- `Escape` - Exit comparison viewer
- `Ctrl+S` - Save comparison

## Accessibility

### Current Implementation
- High contrast color coding (blue=baseline, green=follow-up)
- Clear text labels with dates
- Draggable divider with visual feedback
- Disabled state for save button when incomplete

### Phase 8 Improvements
- Keyboard navigation for divider
- Screen reader announcements for sync toggle
- ARIA labels for all interactive elements
- Focus trap while comparison viewer is open

## Performance Considerations

### Optimization Tips
1. **Lazy loading**: Load comparison viewer component only when needed
   ```tsx
   const ComparisonViewer = dynamic(() => import('./ComparisonViewer'), {
     ssr: false,
     loading: () => <LoadingSkeleton />
   });
   ```

2. **Image preloading**: Preload follow-up image while user reviews baseline
   ```tsx
   useEffect(() => {
     const img = new Image();
     img.src = followupImage.url;
   }, [followupImage.url]);
   ```

3. **State management**: Use React Context for shared viewport state if adding more viewers
   ```tsx
   const ViewportContext = createContext();
   // Move sharedViewport state to context provider
   ```

## Common Use Cases

### 1. Disease Progression Tracking
```tsx
// Ophthalmology: Compare OCT scans 6 months apart
<ComparisonViewer
  baselineImage={{ id: 'oct-baseline', url: '...', studyDate: '2025-08-01' }}
  followupImage={{ id: 'oct-6mo', url: '...', studyDate: '2026-02-01' }}
  comparisonType="progression"
/>
```

### 2. Treatment Response Evaluation
```tsx
// Pre-injection vs Post-injection fundus photos
<ComparisonViewer
  baselineImage={{ id: 'pre-treatment', studyDate: '2026-01-15' }}
  followupImage={{ id: 'post-treatment', studyDate: '2026-02-20' }}
  comparisonType="treatment_response"
/>
```

### 3. Bilateral Comparison
```tsx
// Left eye vs Right eye (same date)
<ComparisonViewer
  baselineImage={{ id: 'od-fundus', studyDescription: 'Right Eye' }}
  followupImage={{ id: 'os-fundus', studyDescription: 'Left Eye' }}
  comparisonType="bilateral"
/>
```

## Troubleshooting

### Images not loading
- Verify Azure Blob Storage URLs are accessible
- Check CORS configuration (`Access-Control-Allow-Origin`)
- Ensure image IDs match backend records

### Sync not working
- SimpleDICOMViewer must support shared viewport props (future enhancement)
- Currently, sync indicator shows but requires Phase 6 backend implementation

### Comparison not saving
- Check backend API is running on `localhost:5073`
- Verify `/api/Imaging/comparisons` endpoint exists (Phase 2)
- Check browser console for network errors
- Ensure `patientId`, `baselineImageId`, `followupImageId` are valid UUIDs

### Divider not dragging
- Ensure containerRef has dimensions (check parent height/width)
- Verify no conflicting CSS on `.cursor-col-resize`
- Test with `isDraggingDivider` state in React DevTools

## Next Steps (Phase 6+)

- **Phase 6**: Export comparison as PDF with side-by-side images
- **Phase 7**: Difference overlay (pixel-by-pixel subtraction)
- **Phase 7**: Timeline scrubber for multi-image progression
- **Phase 8**: Synchronized viewport implementation in SimpleDICOMViewer
- **Phase 8**: Keyboard shortcuts and full accessibility audit

## Example Screenshots

```
┌─────────────────────────────────────────────────────┐
│  Image Comparison          🔗 Synced         ✕      │
│  John Doe • Fundus Photography                      │
├─────────────────────┬───────────────────────────────┤
│  ◀ Baseline         │        Follow-up ▶            │
│  2025-12-01         │        2026-02-15             │
│                     │                               │
│  [Baseline Image]   │   [Follow-up Image]           │
│                     │                               │
│                     ║                               │
│  [Annotations]      ║   [Annotations]               │
│                     ║                               │
├─────────────────────┴───────────────────────────────┤
│ Comparison Type: [Progression ▼]                    │
│ Clinical Significance: [Moderate ▼]                 │
│ Findings: [Progressive thinning observed...]        │
│                                       [Save]        │
└─────────────────────────────────────────────────────┘
```

## Support

For issues or feature requests:
1. Check `README.md` for project overview
2. Review backend API documentation (Phase 2)
3. Test with `ComparisonViewerExample.tsx` component
4. Check browser console for errors
5. Verify all dependencies are installed (`pnpm install`)

## License

Internal use only. Part of Hospital Portal SaaS platform.
