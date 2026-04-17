'use client';

/**
 * BarcodeScanner
 * ──────────────
 * Dual-mode barcode input component:
 *
 *  Mode 1 — HID keyboard burst (always active)
 *    HID barcode scanners emulate a USB keyboard and type the code
 *    very fast (all chars in < 80 ms). This component distinguishes
 *    human typing from HID bursts by measuring inter-keystroke delay.
 *    When a burst completes (ended by Enter or silence > 120 ms),
 *    onScan() is called with the accumulated code.
 *
 *  Mode 2 — Camera (BarcodeDetector API, Chromium ≥ 83)
 *    Optional. Activated via the camera-icon toggle. Draws video frames
 *    to an off-screen canvas and feeds them to the native BarcodeDetector.
 *    Falls back gracefully when the API is unavailable.
 *
 * Props:
 *   onScan   — called with the decoded string on every successful scan
 *   disabled — greys out the input; stops camera if running
 *   placeholder — input placeholder text
 *   className — extra CSS for the wrapper div
 *   autoFocus — passed to the text input (default true)
 */

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Camera, CameraOff, ScanLine, X } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface BarcodeScannerProps {
  onScan: (code: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

// Extended window type for BarcodeDetector (experimental browser API)
declare global {
  interface Window {
    BarcodeDetector?: new (opts?: { formats?: string[] }) => {
      detect(source: CanvasElement | HTMLVideoElement | ImageBitmap): Promise<Array<{ rawValue: string }>>;
    };
  }
  type CanvasElement = HTMLCanvasElement;
}

// ── Constants ──────────────────────────────────────────────────────────────────

/** Maximum inter-keystroke delay (ms) to still be considered a HID burst */
const HID_BURST_GAP_MS = 80;
/** Minimum code length to auto-submit on silence (avoids single-char accidents) */
const MIN_HID_LENGTH = 4;
/** Camera frame scan interval (ms) */
const CAMERA_SCAN_INTERVAL_MS = 300;

// ── Component ──────────────────────────────────────────────────────────────────

export function BarcodeScanner({
  onScan,
  disabled = false,
  placeholder = 'Scan barcode…',
  className = '',
  autoFocus = true,
}: BarcodeScannerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<InstanceType<NonNullable<typeof window.BarcodeDetector>> | null>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // HID burst state
  const hidBufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // UI state
  const [inputValue, setInputValue] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  // ── Check browser support ────────────────────────────────────────────────────
  useEffect(() => {
    const supported =
      !!navigator.mediaDevices?.getUserMedia &&
      typeof window.BarcodeDetector !== 'undefined';
    setCameraSupported(supported);

    if (supported && window.BarcodeDetector) {
      detectorRef.current = new window.BarcodeDetector({
        formats: [
          'code_128', 'code_39', 'ean_13', 'ean_8',
          'qr_code', 'data_matrix', 'upc_a', 'upc_e',
        ],
      });
    }
  }, []);

  // ── Emit scan ────────────────────────────────────────────────────────────────
  const emitScan = useCallback(
    (raw: string) => {
      const code = raw.trim();
      if (!code || disabled) return;
      setLastScanned(code);
      setInputValue('');
      onScan(code);
    },
    [disabled, onScan],
  );

  // ── HID burst detection ──────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const now = Date.now();
      const gap = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // Enter key always submits
      if (e.key === 'Enter') {
        e.preventDefault();
        const buf = hidBufferRef.current || inputRef.current?.value || '';
        hidBufferRef.current = '';
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (buf.length >= MIN_HID_LENGTH) {
          emitScan(buf);
        }
        return;
      }

      // Accumulate HID burst characters
      if (e.key.length === 1) {
        if (gap < HID_BURST_GAP_MS) {
          // Fast keystrokes — HID burst in progress
          hidBufferRef.current += e.key;
        } else {
          // Slow keystroke — could be human typing; reset burst buffer
          hidBufferRef.current = e.key;
        }

        // Reset silence timer
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          const buf = hidBufferRef.current;
          hidBufferRef.current = '';
          // Only auto-submit if this looked like a HID burst (≥ MIN_HID_LENGTH)
          if (buf.length >= MIN_HID_LENGTH && gap < HID_BURST_GAP_MS) {
            emitScan(buf);
          }
        }, HID_BURST_GAP_MS + 40);
      }
    },
    [emitScan],
  );

  // ── Camera helpers ───────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    scanIntervalRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    if (!cameraSupported || disabled) return;
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);

      // Start scanning loop
      scanIntervalRef.current = setInterval(async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const detector = detectorRef.current;
        if (!video || !canvas || !detector || video.readyState < 2) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        try {
          const results = await detector.detect(canvas);
          if (results.length > 0) {
            emitScan(results[0].rawValue);
          }
        } catch {
          // Detection frame error — non-fatal, continue scanning
        }
      }, CAMERA_SCAN_INTERVAL_MS);
    } catch (err) {
      setCameraError(
        err instanceof Error
          ? err.message.includes('Permission')
            ? 'Camera permission denied'
            : err.message
          : 'Camera unavailable',
      );
    }
  }, [cameraSupported, disabled, emitScan]);

  const toggleCamera = useCallback(() => {
    if (cameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  }, [cameraActive, startCamera, stopCamera]);

  // Stop camera when disabled or unmounted
  useEffect(() => {
    if (disabled) stopCamera();
  }, [disabled, stopCamera]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  // ── Clear button ─────────────────────────────────────────────────────────────
  const handleClear = () => {
    setInputValue('');
    hidBufferRef.current = '';
    setLastScanned(null);
    inputRef.current?.focus();
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Input row */}
      <div className="flex items-center gap-2">
        {/* Barcode icon indicator */}
        <ScanLine className="h-4 w-4 text-gray-400 flex-shrink-0" />

        {/* Text input for both HID and manual entry */}
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            autoFocus={autoFocus}
            disabled={disabled}
            placeholder={placeholder}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       disabled:bg-gray-100 disabled:cursor-not-allowed"
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Camera toggle (only when BarcodeDetector is available) */}
        {cameraSupported && (
          <button
            type="button"
            disabled={disabled}
            onClick={toggleCamera}
            title={cameraActive ? 'Stop camera' : 'Scan with camera'}
            className={`p-2 rounded-lg border transition-colors ${
              cameraActive
                ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                : 'border-gray-300 text-gray-500 hover:bg-gray-50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {cameraActive ? (
              <CameraOff className="h-4 w-4" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Camera viewfinder */}
      {cameraActive && (
        <div className="relative w-full aspect-video max-h-48 bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
          {/* Aim overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-28 border-2 border-green-400 rounded-lg opacity-70" />
          </div>
          {/* Hidden canvas used by BarcodeDetector */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Status messages */}
      {cameraError && (
        <p className="text-xs text-red-600">{cameraError}</p>
      )}
      {lastScanned && !cameraActive && (
        <p className="text-xs text-green-700 font-medium">
          ✓ Scanned: <code className="bg-green-50 px-1 rounded">{lastScanned}</code>
        </p>
      )}
    </div>
  );
}
