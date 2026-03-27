'use client';

import { useEffect, useState } from 'react';
import { X, User, Clock, MapPin } from 'lucide-react';
import QRCode from 'qrcode';

interface TokenDisplayProps {
  token: {
    tokenNumber: string;
    patientName: string;
    doctorName?: string;
    appointmentTime?: string;
    queueType?: string;
    roomNumber?: string;
  };
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number; // seconds
}

export default function TokenDisplay({ 
  token, 
  onClose, 
  autoClose = true, 
  autoCloseDelay = 10 
}: TokenDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [countdown, setCountdown] = useState(autoCloseDelay);

  // Generate QR code
  useEffect(() => {
    QRCode.toDataURL(token.tokenNumber, {
      width: 200,
      margin: 2,
      color: {
        dark: '#1F2937',
        light: '#FFFFFF',
      },
    })
      .then(setQrCodeUrl)
      .catch(console.error);
  }, [token.tokenNumber]);

  // Auto-close countdown
  useEffect(() => {
    if (!autoClose) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoClose, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6 text-gray-500" />
        </button>

        {/* Token Display */}
        <div className="text-center space-y-6">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-emerald-600" />
          </div>

          {/* Title */}
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Check-In Successful!</h2>
            <p className="text-slate-600">Your token number is:</p>
          </div>

          {/* Token Number - Large Display */}
          <div className="bg-emerald-600 rounded-xl p-8 shadow-lg">
            <div className="text-8xl font-bold text-white tracking-wider">
              {token.tokenNumber}
            </div>
          </div>

          {/* Patient Information */}
          <div className="bg-slate-50 rounded-lg p-6 space-y-3">
            <div className="flex items-center justify-center gap-3 text-xl font-semibold text-slate-900">
              <User className="w-6 h-6 text-slate-600" />
              {token.patientName}
            </div>
            
            {token.doctorName && (
              <div className="flex items-center justify-center gap-3 text-slate-700">
                <span className="text-sm">Doctor:</span>
                <span className="font-medium">{token.doctorName}</span>
              </div>
            )}
            
            {token.appointmentTime && (
              <div className="flex items-center justify-center gap-3 text-slate-700">
                <Clock className="w-5 h-5 text-slate-500" />
                <span className="font-medium">{token.appointmentTime}</span>
              </div>
            )}
            
            {token.roomNumber && (
              <div className="flex items-center justify-center gap-3 text-slate-700">
                <MapPin className="w-5 h-5 text-slate-500" />
                <span className="font-medium">Room {token.roomNumber}</span>
              </div>
            )}
          </div>

          {/* QR Code */}
          {qrCodeUrl && (
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <img src={qrCodeUrl} alt="Token QR Code" className="w-48 h-48" />
                <p className="text-xs text-slate-500 text-center mt-2">Scan for tracking</p>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-sm text-slate-800 font-medium mb-2">Next Steps:</p>
            <ol className="text-sm text-slate-700 text-left space-y-1 pl-5 list-decimal">
              {token.queueType === 'Optometry' ? (
                <>
                  <li>Proceed to Optometry for preliminary eye examination</li>
                  <li>Wait for your token to be called</li>
                  <li>After optometry, proceed to doctor consultation</li>
                </>
              ) : (
                <>
                  <li>Please wait in the waiting area</li>
                  <li>Watch the display screen for your token number</li>
                  <li>Proceed to the consultation room when called</li>
                </>
              )}
            </ol>
          </div>

          {/* Auto-close countdown */}
          {autoClose && (
            <div className="text-sm text-slate-500">
              Closing automatically in <span className="font-semibold text-emerald-600">{countdown}</span> seconds
            </div>
          )}

          {/* Manual close button */}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-lg"
          >
            Close
          </button>
        </div>

        {/* Print Note (removed as per requirement) */}
        {/* NO PRINT BUTTON - Display only */}
      </div>
    </div>
  );
}
