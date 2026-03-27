'use client';

import { useEffect, useState } from 'react';
import { Mic, Square, Pause, Play, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { useAudioRecorder, formatDuration } from '@/hooks/use-audio-recorder';
import { useUploadSessionAudio } from '@/hooks/use-counseling-sessions';
import { toast } from 'sonner';

interface AudioRecorderProps {
  /** Session ID for uploading the recording */
  sessionId: string;
  
  /** Auto-start recording when component mounts */
  autoStart?: boolean;
  
  /** Callback when recording is successfully uploaded */
  onUploadSuccess?: (documentId: string) => void;
  
  /** Callback when recording fails to upload */
  onUploadError?: (error: Error) => void;
  
  /** Custom class name for styling */
  className?: string;
}

/**
 * Audio Recorder Component for Counseling Sessions
 * 
 * Features:
 * - Start/Stop/Pause recording
 * - Real-time audio level visualization
 * - Duration timer
 * - Auto-upload to backend after recording
 * - Browser compatibility detection
 * 
 * @example
 * ```tsx
 * <AudioRecorder 
 *   sessionId={session.id} 
 *   autoStart={true}
 *   onUploadSuccess={(docId) => console.log('Uploaded:', docId)}
 * />
 * ```
 */
export default function AudioRecorder({
  sessionId,
  autoStart = false,
  onUploadSuccess,
  onUploadError,
  className = '',
}: AudioRecorderProps) {
  const {
    state,
    duration,
    audioBlob,
    audioLevel,
    error: recordingError,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    reset,
    isSupported,
  } = useAudioRecorder({
    mimeType: 'audio/webm;codecs=opus',
    audioBitsPerSecond: 128000,
    onStateChange: (newState) => {
      console.log('Recording state changed:', newState);
    },
    onError: (err) => {
      toast.error(`Recording error: ${err.message}`);
    },
  });

  const uploadMutation = useUploadSessionAudio();
  const [uploadFailed, setUploadFailed] = useState(false);

  // Auto-start recording if requested
  useEffect(() => {
    if (autoStart && isSupported && state === 'idle') {
      startRecording();
    }
  }, [autoStart, isSupported, state, startRecording]);

  // Auto-upload when recording stops
  useEffect(() => {
    if (state === 'stopped' && audioBlob) {
      handleUpload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, audioBlob]);

  const handleUpload = async () => {
    if (!audioBlob) {
      toast.error('No audio recording available');
      return;
    }
setUploadFailed(false);

    try {
      const fileName = `session_${sessionId}_${Date.now()}.webm`;
      
      toast.promise(
        uploadMutation.mutateAsync({
          sessionId,
          audioBlob,
          fileName,
        }),
        {
          loading: 'Uploading recording...',
          success: (data) => {
            onUploadSuccess?.(data.id);
            reset(); // Reset recorder for potential next recording
            setUploadFailed(false);
            return 'Recording uploaded successfully';
          },
          error: (err) => {
            setUploadFailed(true);
            onUploadError?.(err as Error);
            return `Upload failed: ${(err as Error).message}`;
          },
        }
      );
    } catch (err) {
      console.error('Upload error:', err);
      setUploadFailed(true);
    }
  };

  const handleStart = async () => {
    try {
      await startRecording();
      toast.success('Recording started');
    } catch (err) {
      toast.error('Failed to start recording');
    }
  };

  const handleStop = () => {
    stopRecording();
    toast.info('Recording stopped. Uploading...');
  };

  const handlePause = () => {
    pauseRecording();
    toast.info('Recording paused');
  };

  const handleResume = () => {
    resumeRecording();
    toast.success('Recording resumed');
  };

  // Browser not supported
  if (!isSupported) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Audio Recording Not Supported</p>
            <p className="text-xs text-yellow-700 mt-1">
              Your browser does not support audio recording. Please use Chrome, Edge, Firefox, or Safari.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Recording error
  if (recordingError) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Recording Error</p>
            <p className="text-xs text-red-700 mt-1">{recordingError}</p>
            <button
              onClick={reset}
              className="text-xs text-red-600 underline mt-2 hover:text-red-800"
            >
              Reset and try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Mic className={`h-5 w-5 ${state === 'recording' ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
          <span className="text-sm font-medium text-gray-700">
            {state === 'idle' && 'Audio Recording'}
            {state === 'recording' && 'Recording...'}
            {state === 'paused' && 'Paused'}
            {state === 'stopped' && 'Processing...'}
          </span>
        </div>
        
        {/* Duration */}
        <div className="text-lg font-mono font-semibold text-gray-900">
          {formatDuration(duration)}
        </div>
      </div>

      {/* Audio Level Visualization */}
      {(state === 'recording' || state === 'paused') && (
        <div className="mb-4">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-100 ease-out"
              style={{ width: `${audioLevel}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">
            {audioLevel > 10 ? 'Audio detected' : 'Listening...'}
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2">
        {state === 'idle' && (
          <button
            onClick={handleStart}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            <Mic className="h-4 w-4" />
            Start Recording
          </button>
        )}

        {state === 'recording' && (
          <>
            <button
              onClick={handlePause}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
            >
              <Pause className="h-4 w-4" />
              Pause
            </button>
            <button
              onClick={handleStop}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              <Square className="h-4 w-4" />
              Stop
            </button>
          </>
        )}

        {state === 'paused' && (
          <>
            <button
              onClick={handleResume}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Play className="h-4 w-4" />
              Resume
            </button>
            <button
              onClick={handleStop}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              <Square className="h-4 w-4" />
              Stop
            </button>
          </>
        )}

        {state === 'stopped' && uploadMutation.isPending && (
          <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-blue-700">Uploading...</span>
          </div>
        )}

        {state === 'stopped' && uploadFailed && !uploadMutation.isPending && (
          <button
            onClick={handleUpload}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Upload
          </button>
        )}
      </div>

      {/* Info text */}
      <p className="text-xs text-gray-500 mt-3 text-center">
        {state === 'idle' && 'Click to start recording your counseling session'}
        {state === 'recording' && 'Recording in progress. Click pause or stop when done.'}
        {state === 'paused' && 'Recording paused. Click resume to continue.'}
        {state === 'stopped' && uploadMutation.isPending && 'Uploading your recording to the server...'}
        {state === 'stopped' && uploadFailed && !uploadMutation.isPending && 'Upload failed. Click retry to try again.'}
      </p>
    </div>
  );
}
