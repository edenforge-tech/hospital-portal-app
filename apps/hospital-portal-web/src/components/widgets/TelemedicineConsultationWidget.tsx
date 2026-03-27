/**
 * Telemedicine Consultation Widget
 * Video consultation interface with call controls
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, MessageSquare, Clock } from 'lucide-react';
import { WidgetProps } from '@/lib/widgets/widget-types';
import { widgetsApi } from '@/lib/api/widgets.api';

const TelemedicineConsultationWidget: React.FC<WidgetProps> = ({ patientId, sessionId }) => {
  const [callActive, setCallActive] = useState(false);
  const [callId, setCallId] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (callActive) {
      timer = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callActive]);

  const handleStartCall = async () => {
    if (!sessionId) return;
    
    try {
      setLoading(true);
      const response = await widgetsApi.startTelemedicineCall(sessionId);
      setCallId(response.callId);
      setCallActive(true);
      setDuration(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEndCall = async () => {
    if (!callId) return;

    try {
      await widgetsApi.endTelemedicineCall(callId, duration);
      setCallActive(false);
      setCallId(null);
      setDuration(0);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (!callActive) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 space-y-4">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
          <Video className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold">Video Consultation</h3>
        <p className="text-sm text-gray-600 text-center">
          Start a secure video call with your healthcare provider
        </p>
        <button
          onClick={handleStartCall}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center"
        >
          <Video className="w-5 h-5 mr-2" />
          Start Video Call
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      {/* Video Area */}
      <div className="flex-1 bg-gray-900 rounded-lg relative overflow-hidden">
        {/* Simulated video feed */}
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-white text-center">
            <Video className="w-16 h-16 mx-auto mb-2 opacity-50" />
            <p className="text-sm opacity-75">Video feed would appear here</p>
            <p className="text-xs opacity-50 mt-1">(WebRTC integration required)</p>
          </div>
        </div>

        {/* Duration Timer */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg">
          <div className="flex items-center text-white">
            <Clock className="w-4 h-4 mr-2" />
            <span className="font-mono">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Self View */}
        <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-700 rounded-lg border-2 border-white/20 flex items-center justify-center">
          <span className="text-white text-xs">Your Video</span>
        </div>
      </div>

      {/* Call Controls */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setMicEnabled(!micEnabled)}
          className={`p-4 rounded-full ${micEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'} text-white`}
        >
          {micEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>

        <button
          onClick={() => setVideoEnabled(!videoEnabled)}
          className={`p-4 rounded-full ${videoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'} text-white`}
        >
          {videoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>

        <button
          onClick={handleEndCall}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white"
        >
          <PhoneOff className="w-6 h-6" />
        </button>

        <button className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white">
          <MessageSquare className="w-6 h-6" />
        </button>
      </div>

      {/* Call Info */}
      <div className="bg-blue-50 rounded-lg p-3">
        <p className="text-sm text-gray-700">
          <strong>Secure Connection:</strong> End-to-end encrypted
        </p>
      </div>
    </div>
  );
};

export default TelemedicineConsultationWidget;
