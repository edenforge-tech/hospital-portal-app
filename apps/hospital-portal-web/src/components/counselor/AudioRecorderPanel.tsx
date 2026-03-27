'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Mic, Pause, Play, Square, CheckCircle, AlertCircle, RotateCcw, Upload } from 'lucide-react';
import { useAudioRecorder, formatDuration } from '@/hooks/use-audio-recorder';
import { useUploadSessionAudio } from '@/hooks/use-counseling-sessions';
import { toast } from 'sonner';

interface AudioRecorderPanelProps {
  sessionId: string;
  sessionNumber?: string;
  autoStart?: boolean;
  onRecordingComplete?: (audioUrl: string) => void;
  onError?: (error: string) => void;
}

type PanelPhase = 'idle' | 'recording' | 'paused' | 'review' | 'saving' | 'saved';

export function AudioRecorderPanel({
  sessionId,
  sessionNumber,
  autoStart = false,
  onRecordingComplete,
  onError,
}: AudioRecorderPanelProps) {
  const {
    state: recState,
    duration,
    audioBlob,
    audioUrl,
    audioLevel,
    error: recorderError,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    reset,
    isSupported,
  } = useAudioRecorder({
    mimeType: 'audio/webm;codecs=opus',
    audioBitsPerSecond: 128000,
    onError: (err) => {
      toast.error(`Recording error: ${err.message}`);
      onError?.(err.message);
    },
  });

  const uploadMutation = useUploadSessionAudio();
  const [phase, setPhase] = useState<PanelPhase>('idle');
  const [savedDuration, setSavedDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  // Sync recorder state to panel phase
  useEffect(() => {
    if (recState === 'recording') setPhase('recording');
    else if (recState === 'paused') setPhase('paused');
    else if (recState === 'stopped' && audioBlob) setPhase('review');
  }, [recState, audioBlob]);

  // Create a fresh, panel-owned object URL from the blob for reliable playback.
  // The hook's audioUrl can be revoked too early by the hook's own cleanup.
  useEffect(() => {
    if (audioBlob && phase === 'review') {
      const url = URL.createObjectURL(audioBlob);
      setLocalAudioUrl(url);
      return () => {
        URL.revokeObjectURL(url);
        setLocalAudioUrl(null);
      };
    }
  }, [audioBlob, phase]);

  // Force the audio element to reload whenever the src URL changes
  useEffect(() => {
    if (localAudioUrl && audioRef.current) {
      audioRef.current.load();
    }
  }, [localAudioUrl]);

  // Auto-start on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (autoStart && isSupported) {
      handleStart();
    }
  }, []);

  // Stop mic when unmounting (navigating away)
  useEffect(() => {
    return () => {
      if (recState === 'recording' || recState === 'paused') {
        stopRecording();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recState]);

  const handleStart = async () => {
    try {
      await startRecording();
    } catch {
      toast.error('Microphone access denied - please allow mic permissions in your browser.');
    }
  };

  const handleStop = () => {
    setSavedDuration(duration);
    stopRecording();
  };

  const handleSave = async () => {
    if (!audioBlob) return;
    setPhase('saving');
    const fileName = `session-${sessionNumber || sessionId}-${Date.now()}.webm`;
    try {
      await uploadMutation.mutateAsync({ sessionId, audioBlob, fileName });
      onRecordingComplete?.(localAudioUrl ?? audioUrl ?? '');
      setPhase('saved');
      toast.success('Recording saved to session');
    } catch {
      toast.error('Failed to save recording - please try again');
      setPhase('review');
    }
  };

  const handleRedo = () => {
    reset();
    setSavedDuration(0);
    setIsPlaying(false);
    setAudioCurrentTime(0);
    setAudioDuration(0);
    setPhase('idle');
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleNewRecording = () => {
    reset();
    setSavedDuration(0);
    setPhase('idle');
  };

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
        Mic not supported
      </div>
    );
  }

  if (recorderError) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
        <span>Mic error</span>
        <button onClick={handleStart} className="underline ml-0.5">retry</button>
      </div>
    );
  }

  // IDLE
  if (phase === 'idle') {
    return (
      <button
        onClick={handleStart}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all shadow-sm"
      >
        <Mic className="h-3.5 w-3.5" />
        Record Session
      </button>
    );
  }

  // RECORDING
  if (phase === 'recording') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-red-200 rounded-xl shadow-sm">
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
        <span className="text-xs font-bold text-red-600 tracking-wide flex-shrink-0">REC</span>
        <span className="text-sm font-mono font-semibold text-gray-900 tabular-nums min-w-[42px]">
          {formatDuration(duration)}
        </span>
        {/* Waveform level bars */}
        <div className="flex items-center gap-0.5 h-4 flex-shrink-0">
          {[0.3, 0.7, 1, 0.5, 0.8].map((base, i) => (
            <div
              key={i}
              className="w-0.5 rounded-full bg-red-400 transition-all duration-75"
              style={{ height: `${Math.max(20, Math.min(100, audioLevel * base + 10))}%` }}
            />
          ))}
        </div>
        <button onClick={pauseRecording} title="Pause" className="p-1 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors">
          <Pause className="h-3.5 w-3.5" />
        </button>
        <button onClick={handleStop} title="Stop recording" className="p-1 rounded-lg hover:bg-red-50 text-red-600 transition-colors">
          <Square className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  // PAUSED
  if (phase === 'paused') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-amber-200 rounded-lg shadow-sm">
        <div className="w-2 h-2 bg-amber-400 rounded-full flex-shrink-0" />
        <span className="text-xs font-semibold text-amber-700 flex-shrink-0">Paused</span>
        <span className="text-sm font-mono font-semibold text-gray-900 tabular-nums min-w-[42px]">
          {formatDuration(duration)}
        </span>
        <button
          onClick={resumeRecording}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium transition-colors"
        >
          <Play className="h-3 w-3" /> Resume
        </button>
        <button
          onClick={handleStop}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium transition-colors"
        >
          <Square className="h-3 w-3" /> Stop
        </button>
      </div>
    );
  }

  // REVIEW - user listens before saving
  if (phase === 'review' && (localAudioUrl || audioBlob)) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-200 rounded-xl shadow-sm">
        {/* Duration badge */}
        <div className="flex items-center gap-1.5 pr-2 border-r border-gray-100 flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-xs font-semibold text-blue-700 tabular-nums">
            {formatDuration(savedDuration || duration)}
          </span>
        </div>

        {/* Hidden audio element with event handlers */}
        <audio
          key={localAudioUrl ?? 'pending'}
          ref={audioRef}
          src={localAudioUrl ?? undefined}
          preload="auto"
          className="hidden"
          onTimeUpdate={(e) => setAudioCurrentTime((e.target as HTMLAudioElement).currentTime)}
          onLoadedMetadata={(e) => setAudioDuration((e.target as HTMLAudioElement).duration)}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Play/Pause */}
        <button
          onClick={togglePlayback}
          className="w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors flex-shrink-0 shadow-sm"
        >
          {isPlaying
            ? <Pause className="h-3 w-3" />
            : <Play className="h-3 w-3 ml-0.5" />}
        </button>

        {/* Progress bar */}
        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
          <div
            className="h-full bg-blue-500 transition-all duration-100 rounded-full"
            style={{ width: `${audioDuration > 0 ? (audioCurrentTime / audioDuration) * 100 : 0}%` }}
          />
        </div>
        <span className="text-[10px] text-gray-400 tabular-nums flex-shrink-0 min-w-[28px]">
          {formatDuration(Math.floor(audioCurrentTime))}
        </span>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition-colors flex-shrink-0 shadow-sm"
        >
          <Upload className="h-3 w-3" /> Save
        </button>

        {/* Redo button */}
        <button
          onClick={handleRedo}
          title="Discard and re-record"
          className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 transition-colors flex-shrink-0"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      </div>
    );
  }

  // SAVING
  if (phase === 'saving') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 shadow-sm">
        <Upload className="h-3.5 w-3.5 animate-pulse flex-shrink-0" />
        Saving recording...
      </div>
    );
  }

  // SAVED
  if (phase === 'saved') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-xl shadow-sm">
        <CheckCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
        <span className="text-xs font-semibold text-green-700">
          Saved ({formatDuration(savedDuration || duration)})
        </span>
        <button
          onClick={handleNewRecording}
          className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-green-300 hover:bg-green-100 text-green-700 text-xs font-medium transition-colors flex-shrink-0"
        >
          <Mic className="h-3 w-3" /> New
        </button>
      </div>
    );
  }

  return null;
}