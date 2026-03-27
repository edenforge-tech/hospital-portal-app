'use client';

import { useRef, useEffect } from 'react';
import QRCodeSVG from 'react-qr-code';
import JsBarcode from 'jsbarcode';

interface Patient {
  id?: string;
  medicalRecordNumber?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  contactNumber?: string;
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  photoUrl?: string;
  address?: string;
}

interface RegistrationCardPreviewProps {
  patient: Patient;
}

export default function RegistrationCardPreview({ patient }: RegistrationCardPreviewProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);

  // Debug logging for photo URL
  useEffect(() => {
    console.log('🎴 RegistrationCardPreview - Patient data:', patient);
    console.log('🖼️ RegistrationCardPreview - Photo URL:', patient.photoUrl);
  }, [patient]);

  useEffect(() => {
    if (barcodeRef.current && patient.medicalRecordNumber) {
      try {
        JsBarcode(barcodeRef.current, patient.medicalRecordNumber, {
          format: 'CODE128',
          width: 1.5,
          height: 40,
          displayValue: true,
          fontSize: 12,
          margin: 5,
        });
      } catch (err) {
        console.error('Error generating barcode:', err);
      }
    }
  }, [patient.medicalRecordNumber]);

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="registration-card-container">
      {/* Print Button (hidden during print) */}
      <div className="no-print mb-4 flex justify-center">
        <button
          onClick={handlePrint}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-lg"
        >
          🖨️ Print Registration Card
        </button>
      </div>

      {/* Registration Card (3.5" x 2" business card size) */}
      <div className="registration-card bg-white border-2 border-gray-300 rounded-lg shadow-lg mx-auto p-4 print-card">
        <div className="grid grid-cols-3 gap-3 h-full">
          {/* Left Column - Photo & QR Code */}
          <div className="flex flex-col items-center justify-between">
            {/* Patient Photo */}
            {patient.photoUrl ? (
              <img 
                src={patient.photoUrl} 
                alt={`${patient.firstName} ${patient.lastName}`}
                className="w-20 h-20 rounded-lg object-cover border-2 border-gray-300"
                onError={(e) => {
                  console.error('❌ Failed to load photo:', patient.photoUrl);
                  console.error('❌ Image error event:', e);
                  // Hide broken image
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={() => {
                  console.log('✅ Photo loaded successfully:', patient.photoUrl);
                }}
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                <span className="text-3xl text-gray-400">👤</span>
              </div>
            )}
            
            {/* QR Code */}
            <div className="bg-white p-1">
              <QRCodeSVG 
                value={patient.medicalRecordNumber || patient.id || 'UNKNOWN'} 
                size={60}
              />
            </div>
          </div>

          {/* Middle Column - Patient Details */}
          <div className="col-span-2 flex flex-col justify-between">
            {/* Hospital Header */}
            <div className="border-b border-gray-300 pb-1 mb-1">
              <h3 className="text-xs font-bold text-blue-900">HOSPITAL PORTAL</h3>
              <p className="text-[0.5rem] text-gray-600">Patient Registration Card</p>
            </div>

            {/* Patient Info */}
            <div className="space-y-0.5 flex-1">
              <div>
                <p className="text-xs font-bold text-gray-900 leading-tight">
                  {patient.firstName} {patient.lastName}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-x-2 text-[0.55rem]">
                <div>
                  <span className="text-gray-600">MRN:</span>
                  <span className="font-semibold ml-1">{patient.medicalRecordNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Blood:</span>
                  <span className="font-semibold ml-1 text-red-600">{patient.bloodGroup || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">DOB:</span>
                  <span className="font-medium ml-1">{formatDate(patient.dateOfBirth)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Gender:</span>
                  <span className="font-medium ml-1">{patient.gender}</span>
                </div>
              </div>

              <div className="text-[0.55rem]">
                <span className="text-gray-600">Contact:</span>
                <span className="font-medium ml-1">{patient.contactNumber || 'N/A'}</span>
              </div>

              {/* Emergency Contact */}
              {patient.emergencyContactName && (
                <div className="text-[0.5rem] bg-red-50 p-0.5 rounded mt-1">
                  <span className="text-red-700 font-semibold">Emergency:</span>
                  <span className="ml-1 text-gray-800">{patient.emergencyContactName}</span>
                  {patient.emergencyContactPhone && (
                    <span className="ml-1 text-gray-700">({patient.emergencyContactPhone})</span>
                  )}
                </div>
              )}
            </div>

            {/* Barcode at bottom */}
            <div className="flex justify-center mt-1">
              <svg ref={barcodeRef} className="barcode-svg"></svg>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-[0.45rem] text-gray-500 text-center mt-2 pt-1 border-t border-gray-200">
          Keep this card safe. Present at every visit.
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          /* Hide everything except the card */
          body,
          html {
            margin: 0;
            padding: 0;
            overflow: hidden;
            height: 2.5in;
          }
          
          body * {
            visibility: hidden;
          }
          
          .registration-card-container,
          .registration-card-container * {
            visibility: visible;
          }
          
          .registration-card-container {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
          
          .no-print {
            display: none !important;
            visibility: hidden !important;
          }
          
          .print-card {
            width: 3.5in !important;
            height: 2in !important;
            max-width: 3.5in !important;
            max-height: 2in !important;
            page-break-after: auto;
            page-break-before: auto;
            page-break-inside: avoid;
            margin: 0 auto;
            box-shadow: none !important;
            border: 1px solid #000;
            overflow: hidden;
          }
          
          @page {
            size: 3.5in 2in;
            margin: 0.25in;
          }
        }
        
        .registration-card {
          width: 3.5in;
          height: 2in;
          box-sizing: border-box;
        }
        
        .barcode-svg {
          max-width: 100%;
          height: auto;
        }
      `}</style>
    </div>
  );
}
