// Audio Recording Hook - Browser MediaRecorder API for audio recording
import { useState, useRef, useCallback, useEffect } from 'react';

export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

export interface AudioRecorderOptions {
  /**
   * MIME type for recording (default: audio/webm)
   * Browser support: webm (Chrome/Edge), mp4 (Safari), ogg (Firefox)
   */
  mimeType?: string;
  
  /**
   * Audio bitrate in bits per second (default: 128000 = 128kbps)
   */
  audioBitsPerSecond?: number;
  
  /**
   * Time slice for ondataavailable events in milliseconds
   * Lower = more frequent events, higher memory usage
   */
  timeSlice?: number;

  /**
   * Callback when recording state changes
   */
  onStateChange?: (state: RecordingState) => void;

  /**
   * Callback when recording error occurs
   */
  onError?: (error: Error) => void;
}

export interface UseAudioRecorderResult {
  /** Current recording state */
  state: RecordingState;
  
  /** Recording duration in seconds */
  duration: number;
  
  /** Audio blob after recording is stopped */
  audioBlob: Blob | null;
  
  /** Audio URL for playback (revoke when done) */
  audioUrl: string | null;
  
  /** Audio level (0-100) for visualization */
  audioLevel: number;
  
  /** MediaRecorder instance */
  mediaRecorder: MediaRecorder | null;
  
  /** MediaStream instance (for cleanup) */
  mediaStream: MediaStream | null;
  
  /** Error message if recording failed */
  error: string | null;
  
  /** Start recording */
  startRecording: () => Promise<void>;
  
  /** Stop recording */
  stopRecording: () => void;
  
  /** Pause recording */
  pauseRecording: () => void;
  
  /** Resume recording */
  resumeRecording: () => void;
  
  /** Reset recorder to idle state */
  reset: () => void;
  
  /** Check if browser supports audio recording */
  isSupported: boolean;
}

/**
 * Custom hook for audio recording using MediaRecorder API
 * 
 * @example
 * ```tsx
 * const {
 *   state,
 *   duration,
 *   audioBlob,
 *   audioLevel,
 *   startRecording,
 *   stopRecording,
 *   pauseRecording,
 *   resumeRecording,
 * } = useAudioRecorder({
 *   mimeType: 'audio/webm;codecs=opus',
 *   audioBitsPerSecond: 128000,
 * });
 * 
 * // Start recording
 * await startRecording();
 * 
 * // Stop and get blob
 * stopRecording();
 * // audioBlob is now available
 * ```
 */
export function useAudioRecorder(options: AudioRecorderOptions = {}): UseAudioRecorderResult {
  const {
    mimeType = 'audio/webm;codecs=opus',
    audioBitsPerSecond = 128000,
    timeSlice = 100,
    onStateChange,
    onError,
  } = options;

  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Check browser support
  const isSupported = !!(navigator?.mediaDevices?.getUserMedia && window.MediaRecorder);

  // Update state with callback
  const updateState = useCallback((newState: RecordingState) => {
    setState(newState);
    onStateChange?.(newState);
  }, [onStateChange]);

  // Handle errors
  const handleError = useCallback((err: Error) => {
    setError(err.message);
    onError?.(err);
    console.error('Audio recording error:', err);
  }, [onError]);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!isSupported) {
      handleError(new Error('MediaRecorder API not supported in this browser'));
      return;
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      mediaStreamRef.current = stream;

      // Determine best supported MIME type
      let selectedMimeType = mimeType;
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
      ];

      if (!MediaRecorder.isTypeSupported(mimeType)) {
        selectedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';
        if (!selectedMimeType) {
          throw new Error('No supported audio MIME type found');
        }
      }

      // Create MediaRecorder
      const recorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        audioBitsPerSecond,
      });

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      // Setup audio level monitoring
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Monitor audio level
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateAudioLevel = () => {
        if (analyserRef.current && (state === 'recording')) {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          setAudioLevel(Math.min(100, (average / 255) * 100));
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };

      // Handle data available
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: selectedMimeType });
        setAudioBlob(blob);
        
        // Create URL for playback
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Stop tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Cleanup audio context
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        
        updateState('stopped');
      };

      // Handle errors
      recorder.onerror = (event: any) => {
        handleError(new Error(event.error?.message || 'Recording error'));
      };

      // Start recording
      recorder.start(timeSlice);
      startTimeRef.current = Date.now();
      updateState('recording');
      setError(null);

      // Start duration counter
      durationIntervalRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

      // Start audio level monitoring
      updateAudioLevel();

    } catch (err) {
      handleError(err instanceof Error ? err : new Error('Failed to start recording'));
    }
  }, [isSupported, mimeType, audioBitsPerSecond, timeSlice, handleError, updateState, state]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state !== 'idle' && state !== 'stopped') {
      mediaRecorderRef.current.stop();
      
      // Clear duration interval
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      // Cancel animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      setAudioLevel(0);
    }
  }, [state]);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.pause();
      updateState('paused');
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }
  }, [state, updateState]);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === 'paused') {
      mediaRecorderRef.current.resume();
      updateState('recording');
      
      // Resume duration counter
      const pausedDuration = duration;
      startTimeRef.current = Date.now() - (pausedDuration * 1000);
      durationIntervalRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    }
  }, [state, duration, updateState]);

  // Reset recorder
  const reset = useCallback(() => {
    // Stop recording if active
    if (mediaRecorderRef.current && state !== 'idle') {
      stopRecording();
    }

    // Cleanup
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    // Reset state
    setState('idle');
    setDuration(0);
    setAudioBlob(null);
    setAudioUrl(null);
    setAudioLevel(0);
    setError(null);
    mediaRecorderRef.current = null;
    mediaStreamRef.current = null;
    audioChunksRef.current = [];
  }, [state, audioUrl, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioUrl]);

  return {
    state,
    duration,
    audioBlob,
    audioUrl,
    audioLevel,
    mediaRecorder: mediaRecorderRef.current,
    mediaStream: mediaStreamRef.current,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    reset,
    isSupported,
  };
}

/**
 * Format duration in MM:SS format
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
