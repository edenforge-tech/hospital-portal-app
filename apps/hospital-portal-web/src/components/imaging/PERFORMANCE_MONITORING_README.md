# Performance Monitoring System - Medical Imaging Module

## Overview
Real-time performance monitoring for DICOM file processing, memory usage, Web Worker efficiency, and viewport rendering performance.

## Components

### 1. **PerformanceMonitor.tsx** - Main UI Component
Full-featured modal interface displaying real-time performance metrics.

**Location**: `apps/hospital-portal-web/src/components/imaging/PerformanceMonitor.tsx`

**Features**:
- **DICOM File Metrics**: File name, size, load time, parse time
- **Memory Usage**: Heap usage with visual progress bar, alerts on >90% usage
- **Web Worker Stats**: Active workers, tasks processed, avg processing time
- **Viewport Rendering**: FPS, render calls, average render time
- **Recording**: Start/stop recording with history tracking
- **Export**: Download metrics as JSON for analysis

**Usage**:
```tsx
import PerformanceMonitor from '@/components/imaging/PerformanceMonitor';

<PerformanceMonitor
  isOpen={showMonitor}
  onClose={() => setShowMonitor(false)}
  viewerId="imaging-order-abc123"
/>
```

### 2. **usePerformanceTracking.ts** - Tracking Hook
Custom React hook for measuring performance across the application.

**Location**: `apps/hospital-portal-web/src/hooks/usePerformanceTracking.ts`

**API Methods**:

#### `startMeasure(name: string)`
Start measuring a performance metric.
```typescript
startMeasure('dicom-load-chest-ct');
```

#### `endMeasure(name: string): number`
End measurement and return duration in milliseconds.
```typescript
const duration = endMeasure('dicom-load-chest-ct');
console.log(`Load time: ${duration}ms`);
```

#### `trackDicomLoad(loadFn: () => Promise<any>, fileName: string)`
Wrap DICOM loading function with automatic performance tracking.
```typescript
const image = await trackDicomLoad(
  () => cornerstone.loadImage(imageId),
  'chest-ct-001.dcm'
);
```

#### `trackViewportRender(renderFn: () => void)`
Track viewport rendering performance with slow render detection.
```typescript
trackViewportRender(() => {
  cornerstone.updateImage(element);
});
```

#### `trackWorkerTask(task: () => Promise<any>, taskName: string)`
Monitor Web Worker task execution time.
```typescript
const result = await trackWorkerTask(
  () => decodeWorker.decode(buffer),
  'decode-dicom-slice'
);
```

#### `trackAnnotationCreation(creationFn: () => void, annotationType: string)`
Measure annotation creation performance.
```typescript
trackAnnotationCreation(() => {
  addAnnotation(newAnnotation);
}, 'length-measurement');
```

#### `getPerformanceEntries(filterName?: string)`
Retrieve recorded performance measurements.
```typescript
const dicomLoads = getPerformanceEntries('dicom-load');
```

#### `clearPerformanceData()`
Clear all recorded metrics.
```typescript
clearPerformanceData();
```

#### `getMemoryUsage()`
Get current memory usage (Chrome only).
```typescript
const memory = getMemoryUsage();
console.log(`Used: ${memory.usedJSHeapSize / 1024 / 1024}MB`);
```

#### `logPerformanceSummary()`
Print comprehensive performance summary to console.
```typescript
logPerformanceSummary();
// Output:
// [Performance Summary]
// DICOM Loads: { count: 5, avgDuration: 234ms, totalDuration: 1170ms }
// Viewport Renders: { count: 120, avgDuration: 16ms, fps: 62 }
// Memory Usage: { usedMB: 145.23, limitMB: 2048.00, percentage: 7.09% }
```

## Integration with DICOMViewer

### Access Performance Monitor
Click the **Activity (📊)** button in the viewer toolbar to open the performance monitor.

**Button location**: Bottom toolbar → Utilities section (next to Download button)

### Automatic Tracking
The DICOMViewer automatically tracks:
- DICOM file loading (via Performance API)
- Viewport rendering (custom measurements)
- Annotation creation (custom measurements)
- Memory usage (polled every 1 second)

## Performance Metrics Explained

### DICOM File Metrics

| Metric | Description | Good Value | Warning Value |
|--------|-------------|------------|---------------|
| **File Size** | Size of DICOM file in bytes | N/A | N/A |
| **Load Time** | Total time to fetch file from server | < 2s | > 5s |
| **Parse Time** | Time to parse DICOM headers | < 500ms | > 2s |
| **Render Time** | Time to render on canvas | < 100ms | > 500ms |

### Memory Metrics

| Metric | Description | Good Value | Warning Value |
|--------|-------------|------------|---------------|
| **Heap Used** | Current JavaScript memory usage | < 50% of limit | > 90% of limit |
| **Heap Limit** | Maximum available memory | N/A | N/A |
| **Percentage** | Usage as percentage of limit | < 70% | > 90% |

**Note**: High memory usage (>90%) triggers automatic alert toast.

### Web Worker Metrics

| Metric | Description | Expected Value |
|--------|-------------|----------------|
| **Active Workers** | Number of Web Workers running | 4 (default) |
| **Tasks Processed** | Total tasks completed | Increases over time |
| **Avg Processing** | Average task execution time | < 50ms per task |

### Viewport Metrics

| Metric | Description | Good Value | Warning Value |
|--------|-------------|------------|---------------|
| **FPS** | Frames per second | ≥ 30 FPS | < 15 FPS |
| **Render Calls** | Total viewport updates | Increases over time | N/A |
| **Avg Render Time** | Average render duration | < 33ms (30 FPS) | > 66ms (15 FPS) |

## Performance Recording

### Start Recording
Click **"Start Recording"** button to begin capturing metrics history.
- Captures snapshots every 1 second
- Stores in browser memory (no backend storage)
- Displays data point count in real-time

### Stop Recording
Click **"Stop Recording"** to end capture.

### Export Metrics
After recording, click **"Export Metrics"** to download JSON file containing:
- Recording start/end timestamps
- Duration
- All captured metric snapshots
- Summary statistics (avg memory, avg FPS, total renders)

**Example export file**:
```json
{
  "viewerId": "imaging-order-abc123",
  "recordingStart": 1708617600000,
  "recordingEnd": 1708617660000,
  "duration": 60,
  "metrics": [
    {
      "timestamp": 1708617600000,
      "metrics": {
        "dicom": {
          "fileName": "chest-ct-001.dcm",
          "fileSize": 524288,
          "loadTime": 234.5,
          "parseTime": 45.2,
          "renderTime": 12.8
        },
        "memory": {
          "used": 145.23,
          "limit": 2048.00,
          "percentage": 7.09
        },
        "webWorkers": {
          "count": 4,
          "tasksProcessed": 12,
          "avgProcessingTime": 23.4
        },
        "viewport": {
          "fps": 60,
          "renderCalls": 120,
          "avgRenderTime": 16.2
        }
      }
    }
    // ... more snapshots
  ],
  "summary": {
    "avgMemoryUsage": 8.45,
    "avgFPS": 58,
    "totalRenders": 3600
  }
}
```

## Performance Optimization Tips

### Based on Metrics

#### High Load Time (> 5s)
- **Cause**: Slow network, large file, server congestion
- **Solutions**:
  - Compress DICOM files on server
  - Implement progressive loading
  - Use CDN for file delivery
  - Check network connection

#### High Parse Time (> 2s)
- **Cause**: Complex DICOM structure, large metadata
- **Solutions**:
  - Use Web Workers for parsing (already implemented)
  - Optimize DICOM tag reading
  - Cache parsed metadata

#### High Memory Usage (> 90%)
- **Cause**: Large images, memory leaks, too many cached images
- **Solutions**:
  - Clear image cache: `cornerstone.imageCache.purgeCache()`
  - Close unused viewer instances
  - Reduce rendered image resolution
  - Enable garbage collection

#### Low FPS (< 30)
- **Cause**: Slow rendering, complex annotations, large canvas
- **Solutions**:
  - Reduce canvas resolution
  - Optimize annotation rendering
  - Use hardware acceleration
  - Limit simultaneous viewports

#### Slow Worker Processing (> 50ms)
- **Cause**: CPU bottleneck, complex decoding
- **Solutions**:
  - Increase worker count (default: 4)
  - Use faster decoding library
  - Upgrade browser
  - Use dedicated hardware

## Browser Support

### Full Support (All Features)
- ✅ **Chrome**: Performance API, Memory API, Web Workers
- ✅ **Edge**: Performance API, Memory API, Web Workers

### Partial Support
- ⚠️ **Firefox**: Performance API, Web Workers (no Memory API)
- ⚠️ **Safari**: Performance API, Web Workers (no Memory API)

### Graceful Degradation
- Memory metrics show "0" if API unavailable
- Performance measurements fall back to `Date.now()` if Performance API missing
- No errors thrown, just reduced functionality

## Troubleshooting

### "Memory metrics showing 0"
**Issue**: `performance.memory` API not available
**Solution**: Use Chrome/Edge browser, or ignore memory metrics

### "No DICOM metrics visible"
**Issue**: DICOM files not tracked by Performance API
**Solution**: Ensure DICOM URLs include `.dcm` or `dicom` in path

### "FPS showing 0"
**Issue**: No viewport renders detected
**Solution**: Ensure `trackViewportRender()` is called during updates

### "Export button disabled"
**Issue**: No recording history collected
**Solution**: Click "Start Recording" first, wait a few seconds, then export

### "High memory alert constantly"
**Issue**: Memory leak or insufficient browser memory
**Solution**:
1. Close other tabs/applications
2. Restart browser
3. Check for memory leaks in DevTools
4. Reduce image cache size

## Advanced Usage

### Custom Performance Marks
```typescript
performance.mark('custom-operation-start');
// ... your code
performance.mark('custom-operation-end');
performance.measure('custom-operation', 'custom-operation-start', 'custom-operation-end');

const entries = performance.getEntriesByName('custom-operation');
console.log(`Duration: ${entries[0].duration}ms`);
```

### Monitoring in Production
```typescript
// Send metrics to analytics service
const metrics = getPerformanceEntries();
analytics.track('imaging_performance', {
  avgLoadTime: metrics.filter(m => m.name.includes('dicom-load'))
    .reduce((sum, m) => sum + m.duration, 0) / metrics.length,
  fps: /* calculate FPS */,
  viewerId: 'imaging-order-abc123',
});
```

### Performance Testing
```typescript
// Automated performance test
test('DICOM loading performance', async () => {
  const { trackDicomLoad, getPerformanceEntries } = usePerformanceTracking();
  
  await trackDicomLoad(() => loadImage(imageId), 'test-image.dcm');
  
  const entries = getPerformanceEntries('dicom-load');
  expect(entries[0].duration).toBeLessThan(5000); // Max 5 seconds
});
```

## Performance Benchmarks

### Expected Performance (Reference Hardware)

**Hardware**: Intel i7-9700K, 16GB RAM, GTX 1660 Ti
**Browser**: Chrome 120+

| Operation | Average Time | 95th Percentile |
|-----------|--------------|------------------|
| Load 512×512 CT slice | 150ms | 300ms |
| Load 1024×1024 CT slice | 400ms | 800ms |
| Parse DICOM metadata | 30ms | 60ms |
| Render viewport (512×512) | 16ms (60 FPS) | 33ms (30 FPS) |
| Create annotation | 5ms | 10ms |
| Web Worker decode (per slice) | 25ms | 50ms |

### Performance Targets

- **User Action → Feedback**: < 100ms (perceived as instant)
- **DICOM Load**: < 2s (acceptable)
- **Viewport Render**: ≥ 30 FPS (smooth animation)
- **Memory Usage**: < 70% heap (comfortable headroom)
- **Worker Tasks**: < 50ms per task (responsive)

## Future Enhancements

- [ ] Real-time performance graphs (line charts)
- [ ] Performance comparison between sessions
- [ ] Automatic performance issue detection
- [ ] Backend integration for historical tracking
- [ ] Performance regression alerts
- [ ] Network waterfall visualization
- [ ] GPU utilization metrics (if API available)
- [ ] Automatic optimization suggestions

## Related Documentation

- [DICOMViewer Component](./DICOMViewer.tsx)
- [CornerstoneJS Documentation](https://www.cornerstonejs.org/)
- [Performance API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)

---

**Status**: ✅ Production Ready  
**Last Updated**: February 2026  
**Components**: PerformanceMonitor.tsx (399 lines), usePerformanceTracking.ts (215 lines)  
**Features**: 8 metrics tracked, Recording & export, Real-time alerts
