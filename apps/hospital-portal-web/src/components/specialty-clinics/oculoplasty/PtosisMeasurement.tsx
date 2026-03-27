'use client';

import React, { useState } from 'react';
import { Eye, Ruler, CheckCircle } from 'lucide-react';

interface PtosisMeasurementProps {
  patientId: string;
  odMrd1?: number;
  osMrd1?: number;
  canEdit?: boolean;
  onSave?: (data: any) => void;
}

export default function PtosisMeasurement({
  patientId,
  odMrd1 = 4.0,
  osMrd1 = 4.0,
  canEdit = true,
  onSave,
}: PtosisMeasurementProps) {
  const [measurements, setMeasurements] = useState({
    OD: {
      mrd1: odMrd1, // Margin-reflex distance 1 (normal: 4-5mm)
      mrd2: 5.0, // Margin-reflex distance 2 (normal: 5mm)
      levatorFunction: 12, // Normal: 12-15mm
      palpebralFissure: 9, // Normal: 9-10mm
    },
    OS: {
      mrd1: osMrd1,
      mrd2: 5.0,
      levatorFunction: 12,
      palpebralFissure: 9,
    },
  });

  const [bellsPhenomenon, setBellsPhenomenon] = useState({ OD: 'Good', OS: 'Good' });
  const [lagophthalmos, setLagophthalmos] = useState({ OD: 'None', OS: 'None' });

  const assessPtosis = (eye: 'OD' | 'OS') => {
    const m = measurements[eye];
    let severity = '';
    let surgicalApproach = '';
    
    if (m.mrd1 >= 4) {
      severity = 'None';
      surgicalApproach = 'No surgery needed';
    } else if (m.mrd1 >= 3) {
      severity = 'Mild';
      surgicalApproach = m.levatorFunction >= 8 ? 'Levator advancement' : 'Consider observation';
    } else if (m.mrd1 >= 2) {
      severity = 'Moderate';
      surgicalApproach = m.levatorFunction >= 5 ? 'Levator advancement' : 'Frontalis sling';
    } else {
      severity = 'Severe';
      surgicalApproach = m.levatorFunction >= 4 ? 'Levator advancement' : 'Frontalis sling (poor levator)';
    }

    return { severity, surgicalApproach, mrd1: m.mrd1, levatorFunction: m.levatorFunction };
  };

  const odAssessment = assessPtosis('OD');
  const osAssessment = assessPtosis('OS');

  return (
    <div className="space-y-6 p-6">
      <h3 className="text-xl font-bold">Ptosis Measurement & Assessment</h3>

      <div className="grid grid-cols-2 gap-6">
        {['OD', 'OS'].map((eye) => (
          <div key={eye} className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
            <h4 className="text-lg font-bold text-blue-900 mb-4">{eye} (Right Eye)</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">MRD1 (mm) - Normal: 4-5mm</label>
                <input
                  type="number"
                  step="0.5"
                  value={measurements[eye as 'OD' | 'OS'].mrd1}
                  onChange={(e) => setMeasurements({
                    ...measurements,
                    [eye]: { ...measurements[eye as 'OD' | 'OS'], mrd1: parseFloat(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Levator Function (mm) - Normal: 12-15mm</label>
                <input
                  type="number"
                  step="1"
                  value={measurements[eye as 'OD' | 'OS'].levatorFunction}
                  onChange={(e) => setMeasurements({
                    ...measurements,
                    [eye]: { ...measurements[eye as 'OD' | 'OS'], levatorFunction: parseFloat(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className={`p-4 rounded-lg ${
                assessPtosis(eye as 'OD' | 'OS').severity === 'Severe' ? 'bg-red-100 border-red-300' :
                assessPtosis(eye as 'OD' | 'OS').severity === 'Moderate' ? 'bg-orange-100 border-orange-300' :
                assessPtosis(eye as 'OD' | 'OS').severity === 'Mild' ? 'bg-yellow-100 border-yellow-300' :
                'bg-green-100 border-green-300'
              } border-2`}>
                <p className="font-bold text-sm mb-1">Severity: {assessPtosis(eye as 'OD' | 'OS').severity}</p>
                <p className="text-sm">Surgical Approach: {assessPtosis(eye as 'OD' | 'OS').surgicalApproach}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
        <h5 className="font-semibold text-green-900 mb-3">Clinical Guidelines</h5>
        <div className="space-y-2 text-sm text-green-800">
          <p><strong>MRD1:</strong> Distance from upper lid margin to corneal light reflex. Normal: 4-5mm. Ptosis if &lt;4mm.</p>
          <p><strong>Levator Function:</strong> Good ≥8mm → Levator advancement. Poor &lt;4mm → Frontalis sling.</p>
          <p><strong>Surgery:</strong> Severe ptosis blocking visual axis requires urgent correction to prevent amblyopia in children.</p>
        </div>
      </div>

      {canEdit && (
        <button
          onClick={() => onSave && onSave({ measurements, odAssessment, osAssessment })}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 flex items-center space-x-2"
        >
          <CheckCircle className="w-5 h-5" />
          <span>Save Ptosis Assessment</span>
        </button>
      )}
    </div>
  );
}
