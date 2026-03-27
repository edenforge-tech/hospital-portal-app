'use client';

import React, { useRef } from 'react';
import { X, Printer, Download, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface TokenSlipProps {
  isOpen: boolean;
  onClose: () => void;
  tokenData: {
    visitId: string;
    tokenNumber: string;
    tokenSequence: number;
    patientName: string;
    appointmentType: string;
    checkedInAt: string;
    branchName: string;
    status: string;
    currentStation?: string;
  };
}

export const TokenSlip: React.FC<TokenSlipProps> = ({ isOpen, onClose, tokenData }) => {
  const slipRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (slipRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Token Slip - ${tokenData.tokenNumber}</title>
            <style>
              @media print {
                @page {
                  size: 80mm auto;
                  margin: 0;
                }
                body {
                  margin: 0;
                  padding: 10mm;
                  font-family: Arial, sans-serif;
                }
              }
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                max-width: 300px;
              }
              .slip-container {
                border: 2px dashed #333;
                padding: 20px;
                text-align: center;
              }
              .hospital-name {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .branch-name {
                font-size: 14px;
                color: #666;
                margin-bottom: 20px;
              }
              .token-number {
                font-size: 48px;
                font-weight: bold;
                color: #2563eb;
                margin: 20px 0;
                letter-spacing: 2px;
              }
              .patient-name {
                font-size: 16px;
                font-weight: bold;
                margin: 15px 0;
              }
              .detail-row {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
                font-size: 12px;
              }
              .label {
                color: #666;
              }
              .value {
                font-weight: 600;
              }
              .qr-container {
                margin: 20px auto;
                padding: 10px;
                background: white;
                display: inline-block;
              }
              .footer {
                margin-top: 20px;
                font-size: 10px;
                color: #999;
                border-top: 1px dashed #ccc;
                padding-top: 10px;
              }
            </style>
          </head>
          <body>
            ${slipRef.current.innerHTML}
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
  };

  if (!isOpen) return null;

  const checkedInTime = new Date(tokenData.checkedInAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const checkedInDate = new Date(tokenData.checkedInAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <QrCode className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Check-In Successful</h2>
              <p className="text-sm text-gray-600">Your token has been generated</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Token Slip Content */}
        <div className="p-6">
          <div ref={slipRef} className="slip-container border-2 border-dashed border-gray-300 rounded-lg p-6">
            {/* Hospital Header */}
            <div className="hospital-name text-lg font-bold text-gray-900">
              Eye Hospital Management System
            </div>
            <div className="branch-name text-sm text-gray-600 mb-6">
              {tokenData.branchName}
            </div>

            {/* Token Number */}
            <div className="token-number text-5xl font-bold text-blue-600 my-6 tracking-wider">
              {tokenData.tokenNumber}
            </div>

            {/* Patient Name */}
            <div className="patient-name text-lg font-semibold text-gray-900 mb-4">
              {tokenData.patientName}
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm">
              <div className="detail-row flex justify-between">
                <span className="label text-gray-600">Type:</span>
                <span className="value font-semibold text-gray-900">{tokenData.appointmentType}</span>
              </div>
              <div className="detail-row flex justify-between">
                <span className="label text-gray-600">Date:</span>
                <span className="value font-semibold text-gray-900">{checkedInDate}</span>
              </div>
              <div className="detail-row flex justify-between">
                <span className="label text-gray-600">Time:</span>
                <span className="value font-semibold text-gray-900">{checkedInTime}</span>
              </div>
              <div className="detail-row flex justify-between">
                <span className="label text-gray-600">Sequence:</span>
                <span className="value font-semibold text-gray-900">#{tokenData.tokenSequence}</span>
              </div>
              {tokenData.currentStation && (
                <div className="detail-row flex justify-between">
                  <span className="label text-gray-600">Station:</span>
                  <span className="value font-semibold text-gray-900">{tokenData.currentStation}</span>
                </div>
              )}
            </div>

            {/* QR Code */}
            <div className="qr-container my-6">
              <QRCodeSVG
                value={JSON.stringify({
                  visitId: tokenData.visitId,
                  tokenNumber: tokenData.tokenNumber,
                  patientName: tokenData.patientName,
                  checkedInAt: tokenData.checkedInAt
                })}
                size={120}
                level="M"
                includeMargin={true}
              />
            </div>

            {/* Footer */}
            <div className="footer text-xs text-gray-500 border-t border-dashed border-gray-300 pt-3 mt-4">
              <p>Please keep this token slip for reference</p>
              <p>Visit ID: {tokenData.visitId.substring(0, 8)}...</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handlePrint}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" />
              Print Token
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Close
            </button>
          </div>

          {/* Info Message */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Your token number will be displayed on the screen. Please wait in the waiting area until your number is called.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenSlip;
