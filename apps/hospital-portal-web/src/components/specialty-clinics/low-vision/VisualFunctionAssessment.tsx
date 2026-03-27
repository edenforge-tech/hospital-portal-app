'use client';

import React, { useState } from 'react';
import { Activity, Check } from 'lucide-react';

interface VisualFunctionAssessmentProps {
  patientId: string;
  canEdit?: boolean;
  onSave?: (data: any) => void;
}

export default function VisualFunctionAssessment({ patientId, canEdit = true, onSave }: VisualFunctionAssessmentProps) {
  const [readingSpeed, setReadingSpeed] = useState(20); // words per minute (normal: 200+)
  const [contrastSensitivity, setContrastSensitivity] = useState(0.5); // log units (normal: 1.5-2.0)
  const [glare, setGlare] = useState('Severe');
  const [preferredRetinalLocus, setPreferredRetinalLocus] = useState('Superior (eccentric)');

  const assessFunction = () => {
    let readingCategory = '';
    let contrastCategory = '';
    
    if (readingSpeed >= 80) {
      readingCategory = 'Functional (slow but adequate)';
    } else if (readingSpeed >= 40) {
      readingCategory = 'Marginal (needs aids)';
    } else {
      readingCategory = 'Severely impaired (needs high magnification/audio)';
    }

    if (contrastSensitivity >= 1.2) {
      contrastCategory = 'Good';
    } else if (contrastSensitivity >= 0.8) {
      contrastCategory = 'Reduced (needs contrast enhancement)';
    } else {
      contrastCategory = 'Severely reduced (high-contrast materials essential)';
    }

    return { readingCategory, contrastCategory };
  };

  const assessment = assessFunction();

  return (
    <div className="space-y-6 p-6">
      <h3 className="text-xl font-bold">Visual Function Assessment</h3>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
          <h4 className="text-lg font-bold text-blue-900 mb-4">Reading Performance</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Reading Speed (words/min) - Normal: 200+</label>
              <input
                type="number"
                value={readingSpeed}
                onChange={(e) => setReadingSpeed(parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className={`p-4 rounded-lg ${readingSpeed < 40 ? 'bg-red-100 border-red-300' : readingSpeed < 80 ? 'bg-yellow-100 border-yellow-300' : 'bg-green-100 border-green-300'} border-2`}>
              <p className="font-bold text-sm">Category: {assessment.readingCategory}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
          <h4 className="text-lg font-bold text-purple-900 mb-4">Contrast Sensitivity</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Contrast (log units) - Normal: 1.5-2.0</label>
              <input
                type="number"
                step="0.1"
                value={contrastSensitivity}
                onChange={(e) => setContrastSensitivity(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className={`p-4 rounded-lg ${contrastSensitivity < 0.8 ? 'bg-red-100 border-red-300' : contrastSensitivity < 1.2 ? 'bg-yellow-100 border-yellow-300' : 'bg-green-100 border-green-300'} border-2`}>
              <p className="font-bold text-sm">Status: {assessment.contrastCategory}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Glare Disability</label>
          <select value={glare} onChange={(e) => setGlare(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
            <option>None</option>
            <option>Mild</option>
            <option>Moderate</option>
            <option>Severe</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Preferred Retinal Locus (PRL)</label>
          <select value={preferredRetinalLocus} onChange={(e) => setPreferredRetinalLocus(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
            <option>Central (foveal)</option>
            <option>Superior (eccentric)</option>
            <option>Inferior (eccentric)</option>
            <option>Temporal (eccentric)</option>
            <option>Nasal (eccentric)</option>
            <option>Poorly established</option>
          </select>
        </div>
      </div>

      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
        <h5 className="font-semibold text-green-900 mb-3">Functional Vision Guidelines</h5>
        <div className="space-y-2 text-sm text-green-800">
          <p><strong>Reading Speed:</strong> &lt;40 wpm = severely impaired. 40-80 wpm = marginal (needs aids). &gt;80 wpm = functional.</p>
          <p><strong>Contrast Sensitivity:</strong> Essential for face recognition, mobility. Reduced contrast = increased fall risk.</p>
          <p><strong>PRL Training:</strong> AMD patients develop eccentric viewing. Training improves reading speed 2-3x.</p>
          <p><strong>Glare:</strong> Photophobia common in retinal disease. Tinted lenses, task lighting reduce disability.</p>
        </div>
      </div>

      {canEdit && (
        <button
          onClick={() => onSave && onSave({ readingSpeed, contrastSensitivity, glare, assessment })}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center space-x-2"
        >
          <Check className="w-5 h-5" />
          <span>Save Function Assessment</span>
        </button>
      )}
    </div>
  );
}
