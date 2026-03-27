// Web Worker for image difference processing
// Runs pixel-by-pixel comparison in background thread to avoid UI blocking

self.addEventListener('message', (event) => {
  const { baselineData, followupData, mode, sensitivity, opacity, colorMap } = event.data;

  try {
    const result = processDifference(baselineData, followupData, mode, sensitivity, opacity, colorMap);
    self.postMessage({ success: true, result });
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
});

function processDifference(baselineData, followupData, mode, sensitivity, opacity, colorMap) {
  const width = baselineData.width;
  const height = baselineData.height;
  const outputData = new ImageData(width, height);
  
  const baseline = baselineData.data;
  const followup = followupData.data;
  const output = outputData.data;

  let totalDiff = 0;
  let maxDiff = 0;
  let pixelsChanged = 0;

  // Calculate differences pixel by pixel
  for (let i = 0; i < baseline.length; i += 4) {
    const rDiff = Math.abs(baseline[i] - followup[i]);
    const gDiff = Math.abs(baseline[i + 1] - followup[i + 1]);
    const bDiff = Math.abs(baseline[i + 2] - followup[i + 2]);
    
    // Perceptual difference (weighted for human vision)
    const diff = 0.299 * rDiff + 0.587 * gDiff + 0.114 * bDiff;
    totalDiff += diff;
    maxDiff = Math.max(maxDiff, diff);

    // Apply sensitivity threshold
    const threshold = (100 - sensitivity) * 2.55; // Map 0-100 to 255-0
    
    if (diff > threshold) {
      pixelsChanged++;
      
      switch (mode) {
        case 'difference':
          // Grayscale difference
          output[i] = diff;
          output[i + 1] = diff;
          output[i + 2] = diff;
          output[i + 3] = opacity * 255;
          break;

        case 'heatmap':
          // Apply color map
          const color = applyColorMap(diff / 255, colorMap);
          output[i] = color.r;
          output[i + 1] = color.g;
          output[i + 2] = color.b;
          output[i + 3] = opacity * 255;
          break;

        case 'edge':
          // Edge detection (Sobel-like)
          const edgeValue = diff > threshold ? 255 : 0;
          output[i] = edgeValue;
          output[i + 1] = edgeValue;
          output[i + 2] = 0; // Green channel = 0 for red/black edges
          output[i + 3] = opacity * 255;
          break;

        case 'threshold':
          // Binary threshold
          output[i] = 255; // Red
          output[i + 1] = 0;
          output[i + 2] = 0;
          output[i + 3] = opacity * 255;
          break;

        default:
          output[i + 3] = 0; // Transparent
      }
    } else {
      // No significant change
      output[i + 3] = 0; // Transparent
    }
  }

  // Calculate statistics
  const avgDiff = totalDiff / (baseline.length / 4);
  const changePercentage = (avgDiff / 255) * 100;

  return {
    imageData: outputData,
    statistics: {
      totalPixels: baseline.length / 4,
      pixelsChanged,
      changePercentage: parseFloat(changePercentage.toFixed(2)),
      averageDifference: avgDiff,
      maxDifference: maxDiff
    }
  };
}

function applyColorMap(intensity, colorMapType) {
  // Clamp intensity to [0, 1]
  const t = Math.max(0, Math.min(1, intensity));

  switch (colorMapType) {
    case 'hot':
      // Black → Red → Yellow → White
      if (t < 0.33) {
        return { r: t * 3 * 255, g: 0, b: 0 };
      } else if (t < 0.67) {
        return { r: 255, g: (t - 0.33) * 3 * 255, b: 0 };
      } else {
        return { r: 255, g: 255, b: (t - 0.67) * 3 * 255 };
      }

    case 'jet':
      // Blue → Cyan → Green → Yellow → Red
      if (t < 0.25) {
        return { r: 0, g: 0, b: 255 * (0.5 + 2 * t) };
      } else if (t < 0.5) {
        return { r: 0, g: 255 * (4 * t - 1), b: 255 };
      } else if (t < 0.75) {
        return { r: 255 * (4 * t - 2), g: 255, b: 255 * (3 - 4 * t) };
      } else {
        return { r: 255, g: 255 * (4 - 4 * t), b: 0 };
      }

    case 'gray':
      // Black → White
      return { r: t * 255, g: t * 255, b: t * 255 };

    case 'cool':
      // Cyan → Magenta
      return { r: t * 255, g: 255 * (1 - t), b: 255 };

    default:
      return { r: t * 255, g: 0, b: 0 };
  }
}
