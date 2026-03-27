'use client';

import React, { useState } from 'react';
import { Target, Check } from 'lucide-react';

interface RehabilitationPlanProps {
  patientId: string;
  canEdit?: boolean;
  onSave?: (data: any) => void;
}

export default function RehabilitationPlan({ patientId, canEdit = true, onSave }: RehabilitationPlanProps) {
  const [adlGoals, setAdlGoals] = useState<string[]>(['Reading', 'Managing medications']);
  const [orientationMobility, setOrientationMobility] = useState(false);
  const [occupationalTherapy, setOccupationalTherapy] = useState(true);
  const [eccentricViewing, setEccentricViewing] = useState(true);

  const adlOptions = [
    'Reading (books, labels)',
    'Managing medications',
    'Writing (signatures, forms)',
    'Cooking safely',
    'Personal grooming',
    'Money management',
    'Using telephone/computer',
    'Watching TV',
    'Recognizing faces',
    'Indoor navigation',
    'Outdoor mobility'
  ];

  const toggleADL = (goal: string) => {
    if (adlGoals.includes(goal)) {
      setAdlGoals(adlGoals.filter(g => g !== goal));
    } else {
      setAdlGoals([...adlGoals, goal]);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h3 className="text-xl font-bold">Rehabilitation Plan</h3>

      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <h4 className="text-lg font-bold text-purple-900 mb-4">Activities of Daily Living (ADL) Goals</h4>
        <div className="grid grid-cols-3 gap-2">
          {adlOptions.map((option) => (
            <button
              key={option}
              onClick={() => toggleADL(option)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                adlGoals.includes(option)
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold mb-4">Rehabilitation Services</h4>
        <div className="space-y-4">
          <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={orientationMobility}
              onChange={(e) => setOrientationMobility(e.target.checked)}
              className="w-5 h-5"
            />
            <div>
              <p className="font-semibold">Orientation & Mobility Training</p>
              <p className="text-sm text-gray-600">White cane training, safe navigation, spatial awareness</p>
            </div>
          </label>

          <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={occupationalTherapy}
              onChange={(e) => setOccupationalTherapy(e.target.checked)}
              className="w-5 h-5"
            />
            <div>
              <p className="font-semibold">Occupational Therapy</p>
              <p className="text-sm text-gray-600">ADL training, home modifications, adaptive techniques</p>
            </div>
          </label>

          <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={eccentricViewing}
              onChange={(e) => setEccentricViewing(e.target.checked)}
              className="w-5 h-5"
            />
            <div>
              <p className="font-semibold">Eccentric Viewing Training (AMD patients)</p>
              <p className="text-sm text-gray-600">Develop Preferred Retinal Locus (PRL), improve reading speed</p>
            </div>
          </label>
        </div>
      </div>

      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <h4 className="text-lg font-bold text-blue-900 mb-4">Rehabilitation Plan Summary</h4>
        <div className="space-y-3">
          <div>
            <p className="font-semibold text-sm text-blue-900 mb-1">Primary Goals ({adlGoals.length} selected):</p>
            <div className="flex flex-wrap gap-2">
              {adlGoals.map((goal, idx) => (
                <span key={idx} className="px-2 py-1 bg-blue-200 text-blue-900 rounded text-xs">{goal}</span>
              ))}
            </div>
          </div>
          
          <div>
            <p className="font-semibold text-sm text-blue-900 mb-1">Services Recommended:</p>
            <ul className="text-sm text-blue-800 space-y-1">
              {orientationMobility && <li>✓ Orientation & Mobility Training (6-12 sessions)</li>}
              {occupationalTherapy && <li>✓ Occupational Therapy (8-10 sessions)</li>}
              {eccentricViewing && <li>✓ Eccentric Viewing Training (4-6 sessions)</li>}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
        <h5 className="font-semibold text-green-900 mb-3">Rehabilitation Guidelines</h5>
        <div className="space-y-2 text-sm text-green-800">
          <p><strong>Duration:</strong> Low vision rehab typically 3-6 months. Ongoing support may be needed.</p>
          <p><strong>Medicare Coverage:</strong> Covers O&M, OT for visually impaired (diagnosis code required).</p>
          <p><strong>Eccentric Viewing:</strong> Critical for AMD. Training improves reading speed 2-3x over 4-6 weeks.</p>
          <p><strong>Home Modifications:</strong> Increase lighting (300-500 lux), high-contrast marking, remove fall hazards.</p>
          <p><strong>Psychosocial Support:</strong> Depression common (30-40%). Support groups, counseling reduce isolation.</p>
        </div>
      </div>

      {canEdit && (
        <button
          onClick={() => onSave && onSave({ adlGoals, orientationMobility, occupationalTherapy, eccentricViewing })}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center space-x-2"
        >
          <Check className="w-5 h-5" />
          <span>Save Rehabilitation Plan</span>
        </button>
      )}
    </div>
  );
}
