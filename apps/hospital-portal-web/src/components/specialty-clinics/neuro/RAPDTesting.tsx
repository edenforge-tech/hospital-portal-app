'use client';

import React, { useState } from 'react';
import { Activity, Eye, CheckCircle, AlertCircle } from 'lucide-react';

interface RAPDTestingProps {
  patientId: string;
  rapdPresent: boolean;
  affectedEye: 'OD' | 'OS' | null;
  rapdGrade: number;
  canEdit?: boolean;
  onSave?: (data: any) => void;
}

export default function RAPDTesting({
  patientId,
  rapdPresent,
  affectedEye,
  rapdGrade,
  canEdit = true,
  onSave,
}: RAPDTestingProps) {
  const [testResult, setTestResult] = useState(rapdPresent ? 'Positive' : 'Negative');
  const [defectEye, setDefectEye] = useState<'OD' | 'OS' | 'None'>(affectedEye || 'None');
  const [grade, setGrade] = useState(rapdGrade || 0);
  const [testMethod, setTestMethod] = useState('Swinging Flashlight Test');

  // Pupil responses
  const [directResponse, setDirectResponse] = useState({
    OD: 'Sluggish',
    OS: 'Brisk',
  });

  const [consensualResponse, setConsensualResponse] = useState({
    OD: 'Brisk',
    OS: 'Sluggish',
  });

  // Assess RAPD significance
  const assessRAPD = (): {
    interpretation: string;
    significance: string;
    differentials: string[];
    color: string;
  } => {
    if (testResult === 'Negative' || defectEye === 'None') {
      return {
        interpretation: 'No RAPD detected',
        significance: 'Normal afferent pupillary pathway bilaterally',
        differentials: ['No optic nerve or retinal disease', 'Symmetric bilateral disease'],
        color: 'bg-green-50 border-green-300 text-green-900',
      };
    }

    if (grade < 0.6) {
      return {
        interpretation: `Mild RAPD ${defectEye} (${grade} log units)`,
        significance: 'Subtle asymmetric optic nerve or retinal dysfunction',
        differentials: [
          'Mild optic neuritis',
          'Early NAION',
          'Asymmetric glaucoma',
          'Large retinal detachment',
          'Central retinal vein occlusion',
        ],
        color: 'bg-yellow-50 border-yellow-300 text-yellow-900',
      };
    } else if (grade < 1.5) {
      return {
        interpretation: `Moderate RAPD ${defectEye} (${grade} log units)`,
        significance: 'Significant unilateral optic nerve or retinal disease',
        differentials: [
          'Optic neuritis',
          'NAION/AION',
          'Moderate to severe glaucoma',
          'Central retinal artery occlusion (CRAO)',
          'Optic nerve tumor/compression',
        ],
        color: 'bg-orange-50 border-orange-300 text-orange-900',
      };
    } else {
      return {
        interpretation: `Severe RAPD ${defectEye} (${grade} log units)`,
        significance: 'Profound unilateral optic nerve damage - near complete afferent defect',
        differentials: [
          'Severe AION (arteritic)',
          'Complete CRAO',
          'Optic nerve transection/trauma',
          'Late-stage optic nerve tumor',
          'Endstage glaucoma (unilateral)',
        ],
        color: 'bg-red-50 border-red-300 text-red-900',
      };
    }
  };

  const assessment = assessRAPD();

  const handleSave = () => {
    if (onSave) {
      onSave({
        testResult,
        defectEye,
        grade,
        testMethod,
        directResponse,
        consensualResponse,
        assessment,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gray-900">
          RAPD Testing (Relative Afferent Pupillary Defect)
        </h3>
        <p className="text-sm text-gray-600">
          Swinging flashlight test - detects asymmetric optic nerve or retinal disease
        </p>
      </div>

      {/* Test Methodology */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">RAPD Test Methodology</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Test Method</label>
            <select
              value={testMethod}
              onChange={(e) => setTestMethod(e.target.value)}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option>Swinging Flashlight Test</option>
              <option>Neutral Density Filter Test</option>
              <option>Automated Pupillometry</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Result</label>
            <select
              value={testResult}
              onChange={(e) => setTestResult(e.target.value)}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option>Positive</option>
              <option>Negative</option>
              <option>Equivocal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Affected Eye (if positive)
            </label>
            <select
              value={defectEye}
              onChange={(e) => setDefectEye(e.target.value as 'OD' | 'OS' | 'None')}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option>None</option>
              <option>OD (Right eye)</option>
              <option>OS (Left eye)</option>
            </select>
          </div>
        </div>
      </div>

      {/* RAPD Grading */}
      {testResult !== 'Negative' && defectEye !== 'None' && (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
          <h4 className="text-lg font-bold text-blue-900 mb-4">
            RAPD Grading (Neutral Density Filters)
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">
                RAPD Grade (log units)
              </label>
              <input
                type="number"
                min="0"
                max="3.0"
                step="0.1"
                value={grade}
                onChange={(e) => setGrade(parseFloat(e.target.value) || 0)}
                disabled={!canEdit}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg"
              />
              <p className="text-xs text-blue-700 mt-1">
                Mild: 0.3-0.6, Moderate: 0.6-1.5, Severe: 1.5-3.0 log units
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-900 mb-2">
                <strong>Grading Scale:</strong>
              </p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 0.3 log units: Minimal RAPD (just detectable)</li>
                <li>• 0.6 log units: Mild RAPD (pupil dilates slightly)</li>
                <li>• 1.2 log units: Moderate RAPD (pupil dilates noticeably)</li>
                <li>• 1.8 log units: Severe RAPD (pupil dilates significantly)</li>
                <li>• 2.4-3.0 log units: Profound RAPD (near-complete afferent defect)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Pupil Response Details */}
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <h4 className="text-lg font-bold text-purple-900 mb-4">Pupil Response Details</h4>
        <div className="grid grid-cols-2 gap-6">
          {/* Direct Response */}
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <h5 className="font-semibold text-purple-900 mb-3">
              Direct Light Response (light shined directly into eye)
            </h5>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-purple-700 mb-1">OD (Right Eye)</label>
                <select
                  value={directResponse.OD}
                  onChange={(e) =>
                    setDirectResponse((prev) => ({ ...prev, OD: e.target.value }))
                  }
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm"
                >
                  <option>Brisk (normal)</option>
                  <option>Sluggish (reduced)</option>
                  <option>Absent</option>
                  <option>Paradoxical dilation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-purple-700 mb-1">OS (Left Eye)</label>
                <select
                  value={directResponse.OS}
                  onChange={(e) =>
                    setDirectResponse((prev) => ({ ...prev, OS: e.target.value }))
                  }
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm"
                >
                  <option>Brisk (normal)</option>
                  <option>Sluggish (reduced)</option>
                  <option>Absent</option>
                  <option>Paradoxical dilation</option>
                </select>
              </div>
            </div>
          </div>

          {/* Consensual Response */}
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <h5 className="font-semibold text-purple-900 mb-3">
              Consensual Light Response (light shined into opposite eye)
            </h5>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-purple-700 mb-1">
                  OD (when light shined into OS)
                </label>
                <select
                  value={consensualResponse.OD}
                  onChange={(e) =>
                    setConsensualResponse((prev) => ({ ...prev, OD: e.target.value }))
                  }
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm"
                >
                  <option>Brisk (normal)</option>
                  <option>Sluggish (reduced)</option>
                  <option>Absent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-purple-700 mb-1">
                  OS (when light shined into OD)
                </label>
                <select
                  value={consensualResponse.OS}
                  onChange={(e) =>
                    setConsensualResponse((prev) => ({ ...prev, OS: e.target.value }))
                  }
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm"
                >
                  <option>Brisk (normal)</option>
                  <option>Sluggish (reduced)</option>
                  <option>Absent</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RAPD Assessment */}
      <div className={`border-2 rounded-lg p-6 ${assessment.color}`}>
        <div className="flex items-start space-x-3">
          {testResult === 'Negative' || defectEye === 'None' ? (
            <CheckCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1">
            <h4 className="text-lg font-bold mb-3">{assessment.interpretation}</h4>
            <p className="text-sm mb-4">{assessment.significance}</p>

            <div>
              <p className="text-sm font-semibold mb-2">Differential Diagnosis:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {assessment.differentials.map((differential, index) => (
                  <li key={index}>{differential}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Guidelines */}
      <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
        <h5 className="font-semibold text-orange-900 mb-3">RAPD Testing Guidelines</h5>
        <div className="space-y-2 text-sm text-orange-800">
          <p>
            <strong>Swinging Flashlight Test:</strong> Dim room, bright penlight. Swing light from
            eye to eye every 3 seconds. Watch for pupil dilation when light moves TO affected eye
            (paradoxical dilation = Marcus Gunn pupil).
          </p>
          <p>
            <strong>Interpretation:</strong> RAPD indicates asymmetric afferent pathway disease
            (optic nerve or extensive retinal damage). Normal efferent pathway (both pupils
            constrict equally to light in either eye).
          </p>
          <p>
            <strong>Grading:</strong> Use neutral density filters to quantify. Place filters over
            NORMAL eye until pupil responses equalize. Filter strength (log units) = RAPD grade.
          </p>
          <p>
            <strong>Optic Nerve vs Retinal:</strong> Optic nerve disease causes larger RAPD than
            retinal disease. Complete optic nerve damage = 3.0 log units. Large CRVO or macula-off
            RD = 1.0-1.5 log units.
          </p>
          <p>
            <strong>Bilateral Disease:</strong> No RAPD if symmetric bilateral optic nerve disease
            (e.g., bilateral optic neuritis, papilledema). Pupil responses equally poor both eyes.
          </p>
          <p>
            <strong>Clinical Significance:</strong> RAPD presence confirms organic optic nerve or
            retinal disease (rules out functional vision loss). Grade correlates with visual acuity
            and visual field loss severity.
          </p>
        </div>
      </div>

      {/* Save Button */}
      {canEdit && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Save RAPD Assessment</span>
          </button>
        </div>
      )}
    </div>
  );
}
