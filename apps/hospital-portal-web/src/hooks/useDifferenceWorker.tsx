// Hook for using Web Workers for difference overlay processing
// Offloads CPU-intensive pixel comparison to background thread

import { useEffect, useRef, useState } from 'react';

export interface DifferenceOptions {
  mode: 'difference' | 'heatmap' | 'edge' | 'threshold';
  sensitivity: number; // 0-100
  opacity: number; // 0-1
  colorMap: 'hot' | 'jet' | 'gray' | 'cool';
}

export interface DifferenceResult {
  imageData: ImageData;
  statistics: {
    totalPixels: number;
    pixelsChanged: number;
    changePercentage: number;
    averageDifference: number;
    maxDifference: number;
  };
}

export function useDifferenceWorker() {
  const workerRef = useRef<Worker | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Web Worker
    if (typeof window !== 'undefined' && window.Worker) {
      try {
        workerRef.current = new Worker('/workers/differenceWorker.js');
      } catch (err) {
        console.error('Failed to initialize Web Worker:', err);
        setError('Web Worker not supported');
      }
    }

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const processDifference = (
    baselineData: ImageData,
    followupData: ImageData,
    options: DifferenceOptions
  ): Promise<DifferenceResult> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Web Worker not initialized'));
        return;
      }

      if (baselineData.width !== followupData.width || 
          baselineData.height !== followupData.height) {
        reject(new Error('Image dimensions must match'));
        return;
      }

      setIsProcessing(true);
      setError(null);

      // Set up one-time message handler
      const handleMessage = (event: MessageEvent) => {
        setIsProcessing(false);
        
        if (event.data.success) {
          resolve(event.data.result);
        } else {
          const errorMsg = event.data.error || 'Unknown error';
          setError(errorMsg);
          reject(new Error(errorMsg));
        }

        workerRef.current?.removeEventListener('message', handleMessage);
      };

      workerRef.current.addEventListener('message', handleMessage);

      // Send processing request to worker
      workerRef.current.postMessage({
        baselineData: {
          data: baselineData.data,
          width: baselineData.width,
          height: baselineData.height
        },
        followupData: {
          data: followupData.data,
          width: followupData.width,
          height: followupData.height
        },
        ...options
      });
    });
  };

  return {
    processDifference,
    isProcessing,
    error,
    isSupported: !!workerRef.current
  };
}

// Fallback for non-Worker environments (server-side or old browsers)
export function processDifferenceSync(
  baselineData: ImageData,
  followupData: ImageData,
  options: DifferenceOptions
): DifferenceResult {
  const { mode, sensitivity, opacity, colorMap } = options;
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
          output[i] = diff;
          output[i + 1] = diff;
          output[i + 2] = diff;
          output[i + 3] = opacity * 255;
          break;

        case 'heatmap':
          const color = applyColorMapSync(diff / 255, colorMap);
          output[i] = color.r;
          output[i + 1] = color.g;
          output[i + 2] = color.b;
          output[i + 3] = opacity * 255;
          break;

        case 'edge':
          const edgeValue = diff > threshold ? 255 : 0;
          output[i] = edgeValue;
          output[i + 1] = edgeValue;
          output[i + 2] = 0;
          output[i + 3] = opacity * 255;
          break;

        case 'threshold':
          output[i] = 255; // Red
          output[i + 1] = 0;
          output[i + 2] = 0;
          output[i + 3] = opacity * 255;
          break;
      }
    } else {
      output[i + 3] = 0; // Transparent
    }
  }

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

function applyColorMapSync(intensity: number, colorMapType: string) {
  const t = Math.max(0, Math.min(1, intensity));

  switch (colorMapType) {
    case 'hot':
      if (t < 0.33) {
        return { r: t * 3 * 255, g: 0, b: 0 };
      } else if (t < 0.67) {
        return { r: 255, g: (t - 0.33) * 3 * 255, b: 0 };
      } else {
        return { r: 255, g: 255, b: (t - 0.67) * 3 * 255 };
      }

    case 'jet':
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
      return { r: t * 255, g: t * 255, b: t * 255 };

    case 'cool':
      return { r: t * 255, g: 255 * (1 - t), b: 255 };

    default:
      return { r: t * 255, g: 0, b: 0 };
  }
}
