// DifferenceOverlay - Visual difference detection between baseline and follow-up images
'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface DifferenceOverlayProps {
  baselineImageUrl: string;
  followupImageUrl: string;
  mode: 'difference' | 'heatmap' | 'edge' | 'threshold';
  sensitivity: number; // 0-100 (sensitivity of difference detection)
  opacity: number; // 0-1 (overlay opacity)
  colorMap?: 'hot' | 'jet' | 'gray' | 'cool'; // Color mapping for heatmap
  onProcessingComplete?: (hasChanges: boolean) => void;
  className?: string;
}

type ColorMapType = 'hot' | 'jet' | 'gray' | 'cool';

export default function DifferenceOverlay({
  baselineImageUrl,
  followupImageUrl,
  mode,
  sensitivity,
  opacity,
  colorMap = 'hot',
  onProcessingComplete,
  className = '',
}: DifferenceOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [changePercentage, setChangePercentage] = useState<number>(0);

  useEffect(() => {
    processDifference();
  }, [baselineImageUrl, followupImageUrl, mode, sensitivity, opacity, colorMap]);

  const processDifference = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Load both images
      const baselineImg = await loadImage(baselineImageUrl);
      const followupImg = await loadImage(followupImageUrl);

      // Validate dimensions
      if (baselineImg.width !== followupImg.width || baselineImg.height !== followupImg.height) {
        // Resize to match
        const { width, height } = getMatchingDimensions(baselineImg, followupImg);
        const resizedBaseline = resizeImage(baselineImg, width, height);
        const resizedFollowup = resizeImage(followupImg, width, height);
        
        await generateDifferenceOverlay(resizedBaseline, resizedFollowup);
      } else {
        await generateDifferenceOverlay(baselineImg, followupImg);
      }
    } catch (err: any) {
      console.error('Error processing difference overlay:', err);
      setError(err.message || 'Failed to generate difference overlay');
    } finally {
      setIsProcessing(false);
    }
  };

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Enable CORS
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  };

  const getMatchingDimensions = (
    img1: HTMLImageElement,
    img2: HTMLImageElement
  ): { width: number; height: number } => {
    // Use the smaller dimensions to avoid upscaling
    return {
      width: Math.min(img1.width, img2.width),
      height: Math.min(img1.height, img2.height),
    };
  };

  const resizeImage = (
    img: HTMLImageElement,
    width: number,
    height: number
  ): HTMLImageElement => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, width, height);

    const resizedImg = new Image();
    resizedImg.src = canvas.toDataURL();
    return resizedImg;
  };

  const generateDifferenceOverlay = async (
    baselineImg: HTMLImageElement,
    followupImg: HTMLImageElement
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = baselineImg.width;
    canvas.height = baselineImg.height;
    const ctx = canvas.getContext('2d')!;

    // Create temporary canvases for pixel data extraction
    const baselineCanvas = document.createElement('canvas');
    baselineCanvas.width = baselineImg.width;
    baselineCanvas.height = baselineImg.height;
    const baselineCtx = baselineCanvas.getContext('2d')!;
    baselineCtx.drawImage(baselineImg, 0, 0);

    const followupCanvas = document.createElement('canvas');
    followupCanvas.width = followupImg.width;
    followupCanvas.height = followupImg.height;
    const followupCtx = followupCanvas.getContext('2d')!;
    followupCtx.drawImage(followupImg, 0, 0);

    const baselineData = baselineCtx.getImageData(0, 0, canvas.width, canvas.height);
    const followupData = followupCtx.getImageData(0, 0, canvas.width, canvas.height);
    const outputData = ctx.createImageData(canvas.width, canvas.height);

    let totalDiff = 0;
    let maxDiff = 0;

    // Calculate differences pixel by pixel
    for (let i = 0; i < baselineData.data.length; i += 4) {
      const rDiff = Math.abs(baselineData.data[i] - followupData.data[i]);
      const gDiff = Math.abs(baselineData.data[i + 1] - followupData.data[i + 1]);
      const bDiff = Math.abs(baselineData.data[i + 2] - followupData.data[i + 2]);
      
      // Calculate perceptual difference (weighted for human vision)
      const diff = 0.299 * rDiff + 0.587 * gDiff + 0.114 * bDiff;
      totalDiff += diff;
      maxDiff = Math.max(maxDiff, diff);

      // Apply sensitivity threshold
      const threshold = (100 - sensitivity) * 2.55; // Convert 0-100 to 0-255
      if (diff > threshold) {
        switch (mode) {
          case 'difference':
            // Show raw difference (grayscale)
            outputData.data[i] = diff;
            outputData.data[i + 1] = diff;
            outputData.data[i + 2] = diff;
            outputData.data[i + 3] = opacity * 255;
            break;

          case 'heatmap':
            // Apply color map to difference intensity
            const color = applyColorMap(diff / 255, colorMap);
            outputData.data[i] = color.r;
            outputData.data[i + 1] = color.g;
            outputData.data[i + 2] = color.b;
            outputData.data[i + 3] = opacity * 255;
            break;

          case 'edge':
            // Highlight edges of changes (Sobel-like)
            const edgeValue = diff > threshold ? 255 : 0;
            outputData.data[i] = edgeValue;
            outputData.data[i + 1] = edgeValue;
            outputData.data[i + 2] = 0;
            outputData.data[i + 3] = opacity * 255;
            break;

          case 'threshold':
            // Binary threshold: changed vs unchanged
            outputData.data[i] = 255;
            outputData.data[i + 1] = 0;
            outputData.data[i + 2] = 0;
            outputData.data[i + 3] = opacity * 255;
            break;
        }
      } else {
        // No significant change
        outputData.data[i + 3] = 0; // Transparent
      }
    }

    ctx.putImageData(outputData, 0, 0);

    // Calculate percentage of pixels with changes
    const avgDiff = totalDiff / (baselineData.data.length / 4);
    const percentage = (avgDiff / 255) * 100;
    setChangePercentage(parseFloat(percentage.toFixed(2)));

    if (onProcessingComplete) {
      onProcessingComplete(percentage > 0.5); // Threshold for "has changes"
    }
  };

  const applyColorMap = (
    intensity: number,
    colorMapType: ColorMapType
  ): { r: number; g: number; b: number } => {
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
  };

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain"
        style={{ imageRendering: 'crisp-edges' }}
      />

      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 dark:bg-black/90">
          <div className="flex flex-col items-center gap-2 text-white dark:text-gray-100">
            <div className="w-8 h-8 border-4 border-gray-600 dark:border-gray-500 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin"></div>
            <span className="text-sm">Processing difference overlay...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 dark:bg-black/90">
          <div className="flex items-center gap-2 text-red-400 dark:text-red-300 bg-gray-800 dark:bg-gray-900 px-4 py-2 rounded-lg border border-red-900/20 dark:border-red-800/30">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {!isProcessing && !error && changePercentage > 0 && (
        <div className="absolute top-2 right-2 bg-blue-600/90 dark:bg-blue-700/95 px-3 py-1 rounded-lg shadow-lg">
          <span className="text-xs font-medium text-white">
            {changePercentage}% Change Detected
          </span>
        </div>
      )}
    </div>
  );
}
