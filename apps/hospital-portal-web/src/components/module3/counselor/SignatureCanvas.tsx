'use client';

import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eraser, Pen } from 'lucide-react';

export interface SignatureCanvasProps {
  onSignatureChange: (signature: string | null) => void;
  width?: number;
  height?: number;
  label?: string;
  required?: boolean;
}

export function SignatureCanvas({
  onSignatureChange,
  width = 400,
  height = 200,
  label,
  required,
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Set default styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000000';

    // Draw signature line
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10, height - 20);
    ctx.lineTo(width - 10, height - 20);
    ctx.stroke();

    // Reset stroke style
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
  }, [width, height]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();

    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    updateSignature();
  };

  const updateSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (hasSignature) {
      // Convert canvas to base64 PNG
      const dataUrl = canvas.toDataURL('image/png');
      // Remove the data:image/png;base64, prefix
      const base64 = dataUrl.split(',')[1];
      onSignatureChange(base64);
    } else {
      onSignatureChange(null);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw signature line
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10, height - 20);
    ctx.lineTo(width - 10, height - 20);
    ctx.stroke();

    // Reset stroke style
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;

    setHasSignature(false);
    onSignatureChange(null);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Card className="p-4">
        <div className="relative">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="border border-gray-200 rounded-md cursor-crosshair touch-none"
            style={{ width: `${width}px`, height: `${height}px` }}
          />
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 pointer-events-none">
            Sign above this line
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearSignature}
            disabled={!hasSignature}
          >
            <Eraser className="w-4 h-4 mr-1" />
            Clear
          </Button>
          {hasSignature && (
            <div className="flex items-center text-sm text-green-600">
              <Pen className="w-4 h-4 mr-1" />
              Signature captured
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
