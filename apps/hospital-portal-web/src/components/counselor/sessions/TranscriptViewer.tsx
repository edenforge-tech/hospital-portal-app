'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Globe, 
  Edit, 
  Check, 
  X, 
  Download, 
  Search, 
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useTranscripts,
  useTranscriptionStatus,
  useStartTranscription,
  useStartTranslation,
  useEditTranscript,
} from '@/hooks/use-transcription';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TranscriptViewerProps {
  /** Recording ID to load transcripts for */
  recordingId: string;
  
  /** Session ID for context */
  sessionId: string;
  
  /** Optional audio element ref for syncing with playback */
  audioRef?: React.RefObject<HTMLAudioElement>;
  
  /** Callback when transcript is clicked with timestamp */
  onSeek?: (timeInSeconds: number) => void;
  
  /** Custom class name */
  className?: string;
}

/**
 * TranscriptViewer Component
 * 
 * Features:
 * - Multi-language tab view (English, Hindi, Telugu)
 * - Timestamped segments with click-to-seek
 * - Confidence score badges (color-coded)
 * - Edit mode for manual corrections
 * - Search within transcript
 * - Download as TXT/VTT/SRT
 * - Real-time status polling during transcription
 * - Translation trigger
 * 
 * @example
 * ```tsx
 * <TranscriptViewer 
 *   recordingId={recording.id}
 *   sessionId={session.id}
 *   onSeek={(time) => audioRef.current.currentTime = time}
 * />
 * ```
 */
export default function TranscriptViewer({
  recordingId,
  sessionId,
  audioRef,
  onSeek,
  className = '',
}: TranscriptViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSegment, setEditingSegment] = useState<{
    transcriptId: string;
    segmentIndex: number;
    originalText: string;
  } | null>(null);
  const [editedText, setEditedText] = useState('');
  const [editReason, setEditReason] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');

  // Queries
  const { data: status, isLoading: statusLoading } = useTranscriptionStatus(recordingId);
  const { data: transcripts = [], isLoading: transcriptsLoading, refetch } = useTranscripts(recordingId);

  // Mutations
  const startTranscription = useStartTranscription();
  const startTranslation = useStartTranslation();
  const editTranscript = useEditTranscript();

  // Auto-select first available transcript language
  useEffect(() => {
    if (transcripts.length > 0 && !transcripts.find(t => t.languageCode === selectedLanguage)) {
      setSelectedLanguage(transcripts[0].languageCode);
    }
  }, [transcripts, selectedLanguage]);

  // Handle start transcription
  const handleStartTranscription = async () => {
    try {
      await startTranscription.mutateAsync({
        recordingId,
        request: { sourceLanguage: 'en-US' },
      });
      toast.success('Transcription started! This may take a few minutes.');
    } catch (error: any) {
      toast.error(`Failed to start transcription: ${error.message}`);
    }
  };

  // Handle start translation
  const handleStartTranslation = async () => {
    const originalTranscript = transcripts.find(t => t.isOriginalLanguage);
    if (!originalTranscript) {
      toast.error('No original transcript found');
      return;
    }

    try {
      await startTranslation.mutateAsync({
        recordingId,
        sourceTranscriptId: originalTranscript.id,
        targetLanguages: ['hi-IN', 'te-IN'],
      });
      toast.success('Translation started!');
      setTimeout(() => refetch(), 2000); // Refetch after 2 seconds
    } catch (error: any) {
      toast.error(`Failed to start translation: ${error.message}`);
    }
  };

  // Handle segment edit
  const handleEditSegment = (transcriptId: string, segmentIndex: number, currentText: string) => {
    setEditingSegment({ transcriptId, segmentIndex, originalText: currentText });
    setEditedText(currentText);
    setEditReason('');
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingSegment) return;

    try {
      await editTranscript.mutateAsync({
        transcriptId: editingSegment.transcriptId,
        segmentIndex: editingSegment.segmentIndex,
        editedText,
        editReason: editReason || undefined,
      });
      toast.success('Transcript updated successfully');
      setShowEditDialog(false);
      setEditingSegment(null);
    } catch (error: any) {
      toast.error(`Failed to save edit: ${error.message}`);
    }
  };

  // Handle segment click (seek audio)
  const handleSegmentClick = (startTime: number) => {
    if (onSeek) {
      onSeek(startTime);
    } else if (audioRef?.current) {
      audioRef.current.currentTime = startTime;
      audioRef.current.play();
    }
  };

  // Download transcript
  const handleDownload = (format: 'txt' | 'vtt' | 'srt') => {
    const currentTranscript = transcripts.find(t => t.languageCode === selectedLanguage);
    if (!currentTranscript) return;

    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'txt':
        content = currentTranscript.transcriptText;
        filename = `transcript-${sessionId}-${currentTranscript.languageCode}.txt`;
        mimeType = 'text/plain';
        break;
      case 'vtt':
        content = generateVTT(currentTranscript);
        filename = `transcript-${sessionId}-${currentTranscript.languageCode}.vtt`;
        mimeType = 'text/vtt';
        break;
      case 'srt':
        content = generateSRT(currentTranscript);
        filename = `transcript-${sessionId}-${currentTranscript.languageCode}.srt`;
        mimeType = 'text/srt';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${format.toUpperCase()} file`);
  };

  // Generate VTT subtitle format
  const generateVTT = (transcript: any): string => {
    let vtt = 'WEBVTT\n\n';
    transcript.segments?.forEach((segment: any, idx: number) => {
      vtt += `${idx + 1}\n`;
      vtt += `${formatVTTTime(segment.start)} --> ${formatVTTTime(segment.end)}\n`;
      vtt += `${segment.text}\n\n`;
    });
    return vtt;
  };

  // Generate SRT subtitle format
  const generateSRT = (transcript: any): string => {
    let srt = '';
    transcript.segments?.forEach((segment: any, idx: number) => {
      srt += `${idx + 1}\n`;
      srt += `${formatSRTTime(segment.start)} --> ${formatSRTTime(segment.end)}\n`;
      srt += `${segment.text}\n\n`;
    });
    return srt;
  };

  const formatVTTTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  const formatSRTTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get confidence color
  const getConfidenceColor = (confidence?: number): string => {
    if (!confidence) return 'bg-gray-500';
    if (confidence > 0.8) return 'bg-green-500';
    if (confidence > 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Filter segments by search term
  const filterSegments = (segments: any[]) => {
    if (!searchTerm) return segments;
    return segments.filter(seg =>
      seg.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Loading state
  if (statusLoading || transcriptsLoading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading transcripts...</span>
        </CardContent>
      </Card>
    );
  }

  // Not started state
  if (!status || status.status === 'NotStarted' || status.status === 'Pending') {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Audio Transcription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            No transcript available yet. Start transcription to convert the audio recording to text.
          </p>
          <Button onClick={handleStartTranscription} disabled={startTranscription.isPending}>
            {startTranscription.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start Transcription
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // In progress state
  if (status.status === 'InProgress' || status.status === 'Running') {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Transcription in Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Clock className="h-5 w-5" />
            <p>Transcribing audio... This may take a few minutes.</p>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }} />
          </div>
          <p className="text-sm text-muted-foreground">
            The transcript will appear here automatically when ready.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Failed state
  if (status.status === 'Failed') {
    return (
      <Card className={cn('w-full border-destructive', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Transcription Failed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            An error occurred during transcription. Please try again.
          </p>
          <Button variant="outline" onClick={handleStartTranscription} disabled={startTranscription.isPending}>
            <Play className="mr-2 h-4 w-4" />
            Retry Transcription
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Not configured state
  if (status.status === 'NotConfigured') {
    return (
      <Card className={cn('w-full border-yellow-500', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-600">
            <AlertCircle className="h-5 w-5" />
            Azure Service Not Configured
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Azure Speech Service is not configured. Please contact your system administrator.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Completed state - show transcripts
  const currentTranscript = transcripts.find(t => t.languageCode === selectedLanguage);
  const hasTranslations = transcripts.some(t => !t.isOriginalLanguage);

  return (
    <>
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Transcript Available
            </CardTitle>
            <div className="flex items-center gap-2">
              {!hasTranslations && transcripts.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartTranslation}
                  disabled={startTranslation.isPending}
                >
                  {startTranslation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    <>
                      <Globe className="mr-2 h-4 w-4" />
                      Translate
                    </>
                  )}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload('txt')}
                disabled={!currentTranscript}
              >
                <Download className="mr-2 h-4 w-4" />
                TXT
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload('vtt')}
                disabled={!currentTranscript}
              >
                <Download className="mr-2 h-4 w-4" />
                VTT
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transcript..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Language Tabs */}
          <Tabs value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <TabsList>
              {transcripts.map((transcript) => (
                <TabsTrigger key={transcript.id} value={transcript.languageCode}>
                  {transcript.languageName}
                  {transcript.isOriginalLanguage && (
                    <Badge variant="secondary" className="ml-2 text-xs">Original</Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {transcripts.map((transcript) => (
              <TabsContent key={transcript.id} value={transcript.languageCode} className="space-y-2 mt-4">
                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span>{transcript.wordCount} words</span>
                  {transcript.confidenceScore && (
                    <span>Confidence: {transcript.confidenceScore.toFixed(1)}%</span>
                  )}
                  {transcript.segments && (
                    <span>{transcript.segments.length} segments</span>
                  )}
                </div>

                {/* Segments */}
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {transcript.segments && filterSegments(transcript.segments).map((segment, idx) => (
                    <div
                      key={idx}
                      className="group hover:bg-accent/50 p-3 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-border"
                      onClick={() => handleSegmentClick(segment.start)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs font-mono text-primary"
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(segment.start)}
                          </Button>
                          {segment.confidence && (
                            <Badge
                              variant="outline"
                              className={cn('text-white', getConfidenceColor(segment.confidence))}
                            >
                              {(segment.confidence * 100).toFixed(0)}%
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 h-6 px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSegment(transcript.id, idx, segment.text);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm leading-relaxed">
                        {searchTerm ? (
                          <span
                            dangerouslySetInnerHTML={{
                              __html: segment.text.replace(
                                new RegExp(`(${searchTerm})`, 'gi'),
                                '<mark class="bg-yellow-200">$1</mark>'
                              ),
                            }}
                          />
                        ) : (
                          segment.text
                        )}
                      </p>
                    </div>
                  ))}
                </div>

                {filterSegments(transcript.segments || []).length === 0 && searchTerm && (
                  <div className="text-center py-8 text-muted-foreground">
                    No segments found matching &quot;{searchTerm}&quot;
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transcript Segment</DialogTitle>
            <DialogDescription>
              Make manual corrections to improve transcript accuracy.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Original Text</label>
              <p className="mt-1 text-sm p-3 bg-muted rounded-md">
                {editingSegment?.originalText}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Edited Text</label>
              <Textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Reason for Edit (optional)</label>
              <Input
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="e.g., Corrected medical term"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={editTranscript.isPending || !editedText}>
              {editTranscript.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
