'use client';

import React, { useState } from 'react';
import { Droplet, CheckCircle } from 'lucide-react';

interface LacrimalAssessmentProps {
  patientId: string;
  canEdit?: boolean;
  onSave?: (data: any) => void;
}

export default function LacrimalAssessment({ patientId, canEdit = true, onSave }: LacrimalAssessmentProps) {
  const [epiphoraSeverity, setEpiphoraSeverity] = useState({ OD: 'Moderate', OS: 'Severe' });
  const [dyeTest, setDyeTest] = useState({ OD: 30, OS: 80 }); // % retention at 5 min
  const [probing, setProbing] = useState({
    OD: 'Hard stop at lacrimal sac',
    OS: 'Hard stop at lacrimal sac',
  });
  const [irrigation, setIrrigation] = useState({
    OD: 'Reflux through punctum',
    OS: 'Reflux through punctum + mucopurulent discharge',
  });

  const assessDCR = (eye: 'OD' | 'OS') => {
    const dye = dyeTest[eye];
    const epiphora = epiphoraSeverity[eye];
    
    if (dye > 50 && (epiphora === 'Severe' || epiphora === 'Moderate')) {
      return {
        candidate: 'Yes - Strong candidate',
        reason: 'Significant NLD obstruction with symptomatic epiphora',
        urgency: 'Urgent (within 3-6 months)',
        color: 'bg-orange-50 border-orange-300 text-orange-900',
      };
    } else if (dye > 25) {
      return {
        candidate: 'Yes - Candidate',
        reason: 'Partial NLD obstruction',
        urgency: 'Routine (6-12 months)',
        color: 'bg-yellow-50 border-yellow-300 text-yellow-900',
      };
    }
    return {
      candidate: 'Conservative management',
      reason: 'Minimal obstruction',
      urgency: 'Observation',
      color: 'bg-green-50 border-green-300 text-green-900',
    };
  };

  const odAssessment = assessDCR('OD');
  const osAssessment = assessDCR('OS');

  return (
    <div className="space-y-6 p-6">
      <h3 className="text-xl font-bold">Lacrimal System Assessment</h3>

      <div className="grid grid-cols-2 gap-6">
        {(['OD', 'OS'] as const).map((eye) => (
          <div key={eye} className="bg-cyan-50 border-2 border-cyan-300 rounded-lg p-6">
            <h4 className="text-lg font-bold text-cyan-900 mb-4">{eye}</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Epiphora Severity</label>
                <select
                  value={epiphoraSeverity[eye]}
                  onChange={(e) => setEpiphoraSeverity({ ...epiphoraSeverity, [eye]: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option>None</option>
                  <option>Mild</option>
                  <option>Moderate</option>
                  <option>Severe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Dye Disappearance Test (% retained at 5 min)</label>
                <input
                  type="number"
                  value={dyeTest[eye]}
                  onChange={(e) => setDyeTest({ ...dyeTest, [eye]: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className={`p-4 rounded-lg border-2 ${assessDCR(eye).color}`}>
                <p className="font-bold text-sm mb-1">DCR Candidacy: {assessDCR(eye).candidate}</p>
                <p className="text-xs">{assessDCR(eye).reason}</p>
                <p className="text-xs mt-1"><strong>Timing:</strong> {assessDCR(eye).urgency}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
        <h5 className="font-semibold text-green-900 mb-3">DCR (Dacryocystorhinostomy) Guidelines</h5>
        <div className="space-y-2 text-sm text-green-800">
          <p><strong>Indications:</strong> Nasolacrimal duct obstruction (NLD) with symptomatic epiphora, recurrent dacryocystitis.</p>
          <p><strong>Dye Test:</strong> Normal &lt;10% retention. Obstruction if &gt;25% at 5 minutes.</p>
          <p><strong>Success Rate:</strong> 90-95% for external DCR, 85-90% for endoscopic DCR.</p>
          <p><strong>Contraindications:</strong> Active dacryocystitis (treat first), bleeding disorders, severe nasal pathology.</p>
        </div>
      </div>

      {canEdit && (
        <button
          onClick={() => onSave && onSave({ epiphoraSeverity, dyeTest, odAssessment, osAssessment })}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 flex items-center space-x-2"
        >
          <CheckCircle className="w-5 h-5" />
          <span>Save Lacrimal Assessment</span>
        </button>
      )}
    </div>
  );
}
