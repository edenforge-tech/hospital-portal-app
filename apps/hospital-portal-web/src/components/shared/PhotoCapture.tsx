'use client';

import { useState, useRef } from 'react';

interface PhotoCaptureProps {
  onPhotoCapture: (file: File, preview: string) => void;
  currentPreview?: string | null;
  optional?: boolean;
  label?: string;
}

export default function PhotoCapture({ 
  onPhotoCapture, 
  currentPreview, 
  optional = true,
  label = "Patient Photo"
}: PhotoCaptureProps) {
  const [showWebcam, setShowWebcam] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startWebcam = async () => {
    try {
      setShowWebcam(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 } 
      });
      setStream(mediaStream);
      
      // Wait for next tick to ensure video element is rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(err => {
            console.error('Error playing video:', err);
          });
        }
      }, 100);
    } catch (error) {
      console.error('Error accessing webcam:', error);
      alert('Could not access webcam. Please check permissions.');
      setShowWebcam(false);
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowWebcam(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        // Flip the image horizontally to fix mirror effect
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `webcam-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
            const reader = new FileReader();
            reader.onloadend = () => {
              onPhotoCapture(file, reader.result as string);
            };
            reader.readAsDataURL(file);
            stopWebcam();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        onPhotoCapture(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    onPhotoCapture(null as any, null as any);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label} {optional && <span className="text-gray-500">(Optional)</span>}
      </label>

      {/* Photo Preview */}
      {currentPreview && (
        <div className="relative inline-block">
          <img 
            src={currentPreview} 
            alt="Preview" 
            className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
          />
          <button
            type="button"
            onClick={removePhoto}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
          >
            ×
          </button>
        </div>
      )}

      {/* Webcam View */}
      {showWebcam && (
        <div className="space-y-4">
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full max-w-md rounded-lg border-2 border-blue-500"
              autoPlay
              playsInline
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={capturePhoto}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              📸 Capture Photo
            </button>
            <button
              type="button"
              onClick={stopWebcam}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Upload Buttons */}
      {!showWebcam && !currentPreview && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={startWebcam}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            📷 Open Webcam
          </button>
          <label className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer">
            📁 Upload Photo
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}

      {!showWebcam && currentPreview && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={startWebcam}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            📷 Retake with Webcam
          </button>
          <label className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer">
            📁 Upload New Photo
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
}
