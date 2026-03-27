'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface EyelidLesionsProps {
  patientId: string;
  canEdit?: boolean;
  onSave?: (data: any) => void;
}

export default function EyelidLesions({ patientId, canEdit = true, onSave }: EyelidLesionsProps) {
  const [lesionType, setLesionType] = useState('Chalazion');
  const [location, setLocation] = useState('Upper lid, nasal');
  const [size, setSize] = useState('8mm');
  const [characteristics, setCharacteristics] = useState({
    nodular: true,
    ulcerated: false,
    lossOfLashes: false,
    vascularization: false,
  });

  const assessLesion = () => {
    if (lesionType === 'Chalazion') {
      return {
        diagnosis: 'Chalazion (Meibomian Gland Lipogranuloma)',
        management: size.includes('mm') && parseInt(size) < 5
          ? 'Conservative: Warm compresses + lid hygiene'
          : 'Incision & Curettage (I&C) + steroid injection',
        urgency: 'Routine',
        color: 'bg-blue-50 border-blue-300 text-blue-900',
      };
    } else if (lesionType.includes('Sebaceous')) {
      return {
        diagnosis: 'Sebaceous Cell Carcinoma (MALIGNANT)',
        management: 'URGENT: Excisional biopsy with frozen section margins',
        urgency: 'URGENT - Rule out malignancy',
        color: 'bg-red-50 border-red-300 text-red-900',
      };
    }
    return {
      diagnosis: lesionType,
      management: 'Clinical assessment',
      urgency: 'Routine',
      color: 'bg-gray-50 border-gray-300 text-gray-900',
    };
  };

  const assessment = assessLesion();

  return (
    <div className="space-y-6 p-6">
      <h3 className="text-xl font-bold">Eyelid Lesion Assessment</h3>

      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Lesion Type</label>
          <select
            value={lesionType}
            onChange={(e) => setLesionType(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option>Chalazion</option>
            <option>Hordeolum (Stye)</option>
            <option>Sebaceous Cell Carcinoma</option>
            <option>Basal Cell Carcinoma</option>
            <option>Squamous Cell Carcinoma</option>
            <option>Benign Nevus</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Size</label>
            <input
              type="text"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className={`border-2 rounded-lg p-6 ${assessment.color}`}>
        <h4 className="text-lg font-bold mb-3">{assessment.diagnosis}</h4>
        <p className="text-sm mb-2"><strong>Management:</strong> {assessment.management}</p>
        <p className="text-sm"><strong>Urgency:</strong> {assessment.urgency}</p>
      </div>

      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
        <h5 className="font-semibold text-green-900 mb-2">Red Flags for Malignancy</h5>
        <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
          <li>Loss of eyelashes (madarosis)</li>
          <li>Ulceration, bleeding</li>
          <li>Irregular borders</li>
          <li>Recurrence after treatment</li>
          <li>Duration &gt;6 months</li>
        </ul>
      </div>

      {canEdit && (
        <button
          onClick={() => onSave && onSave({ lesionType, location, size, assessment })}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 flex items-center space-x-2"
        >
          <CheckCircle className="w-5 h-5" />
          <span>Save Lesion Assessment</span>
        </button>
      )}
    </div>
  );
}
