'use client';

import React, { useState } from 'react';
import { Eye, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface LOCSIIIGrade {
  NO: number; // Nuclear Opalescence (0.1-6.9)
  NC: number; // Nuclear Color (0.1-6.9)
  C: number;  // Cortical (0.1-5.9)
  P: number;  // Posterior Subcapsular (0.1-5.9)
}

interface LOCSIIIData {
  OD: LOCSIIIGrade;
  OS: LOCSIIIGrade;
  pupilDilated: boolean;
  surgicalIndication: boolean;
  clinicalNotes: string;
  gradedDate: string;
  gradedBy: string;
}

interface LOCSIIIGradingFormProps {
  initialData?: LOCSIIIData;
  onSave?: (data: LOCSIIIData) => void;
  canEdit?: boolean;
}

export default function LOCSIIIGradingForm({
  initialData,
  onSave,
  canEdit = true,
}: LOCSIIIGradingFormProps) {
  const [locsData, setLocsData] = useState<LOCSIIIData>(
    initialData || {
      OD: { NO: 0, NC: 0, C: 0, P: 0 },
      OS: { NO: 0, NC: 0, C: 0, P: 0 },
      pupilDilated: false,
      surgicalIndication: false,
      clinicalNotes: '',
      gradedDate: new Date().toISOString().split('T')[0],
      gradedBy: 'Current User',
    }
  );

  const [activeEye, setActiveEye] = useState<'OD' | 'OS'>('OD');

  // Update grade for specific category and eye
  const updateGrade = (eye: 'OD' | 'OS', category: keyof LOCSIIIGrade, value: number) => {
    // Validate based on category
    const maxValue = category === 'NO' || category === 'NC' ? 6.9 : 5.9;
    const validatedValue = Math.max(0, Math.min(maxValue, value));

    setLocsData((prev) => ({
      ...prev,
      [eye]: {
        ...prev[eye],
        [category]: validatedValue,
      },
    }));
  };

  // Calculate overall severity for an eye
  const calculateSeverity = (grades: LOCSIIIGrade): { level: string; color: string } => {
    const maxGrade = Math.max(grades.NO, grades.NC, grades.C, grades.P);

    if (maxGrade < 2.0) {
      return { level: 'Early Cataract', color: 'text-green-600 bg-green-50' };
    } else if (maxGrade < 4.0) {
      return { level: 'Moderate Cataract', color: 'text-yellow-600 bg-yellow-50' };
    } else if (maxGrade < 5.5) {
      return { level: 'Advanced Cataract', color: 'text-orange-600 bg-orange-50' };
    } else {
      return { level: 'Mature/Dense Cataract', color: 'text-red-600 bg-red-50' };
    }
  };

  // Get color coding for individual grade
  const getGradeColor = (value: number): string => {
    if (value < 2.0) return 'text-green-700 font-semibold';
    if (value < 4.0) return 'text-yellow-700 font-semibold';
    if (value < 5.5) return 'text-orange-700 font-semibold';
    return 'text-red-700 font-bold';
  };

  // Get background color for grade input
  const getGradeBgColor = (value: number): string => {
    if (value < 2.0) return 'bg-green-50 border-green-300';
    if (value < 4.0) return 'bg-yellow-50 border-yellow-300';
    if (value < 5.5) return 'bg-orange-50 border-orange-300';
    return 'bg-red-50 border-red-300';
  };

  const handleSave = () => {
    if (onSave) {
      onSave(locsData);
    }
  };

  const categoryDescriptions = {
    NO: {
      name: 'Nuclear Opalescence',
      description: 'Cloudiness/opacity of the lens nucleus',
      range: '0.1 - 6.9',
      icon: '⚪',
    },
    NC: {
      name: 'Nuclear Color',
      description: 'Brunescence (yellowing/browning) of nucleus',
      range: '0.1 - 6.9',
      icon: '🟡',
    },
    C: {
      name: 'Cortical Cataract',
      description: 'Spoke-like opacities in lens cortex',
      range: '0.1 - 5.9',
      icon: '☀️',
    },
    P: {
      name: 'Posterior Subcapsular',
      description: 'Opacity at posterior lens capsule',
      range: '0.1 - 5.9',
      icon: '🎯',
    },
  };

  const severityOD = calculateSeverity(locsData.OD);
  const severityOS = calculateSeverity(locsData.OS);

  return (
    <div className="space-y-6">
      {/* Header with dilated pupil status */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-900">LOCS III Grading</h3>
          <p className="text-sm text-gray-600">
            Lens Opacities Classification System III - Standardized cataract grading
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={locsData.pupilDilated}
              onChange={(e) =>
                setLocsData((prev) => ({ ...prev, pupilDilated: e.target.checked }))
              }
              disabled={!canEdit}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className="text-sm font-medium text-gray-700">Pupil Dilated</span>
          </label>
          {!locsData.pupilDilated && (
            <div className="flex items-center space-x-1 text-orange-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Dilation required for accurate grading</span>
            </div>
          )}
        </div>
      </div>

      {/* Eye Selection Toggle */}
      <div className="flex space-x-2">
        <button
          onClick={() => setActiveEye('OD')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            activeEye === 'OD'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>OD (Right Eye)</span>
          </div>
        </button>
        <button
          onClick={() => setActiveEye('OS')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            activeEye === 'OS'
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>OS (Left Eye)</span>
          </div>
        </button>
      </div>

      {/* Overall Severity Summary for both eyes */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-4 rounded-lg border-2 ${severityOD.color}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">OD (Right Eye)</p>
              <p className="text-lg font-bold">{severityOD.level}</p>
            </div>
            <Eye className="w-8 h-8 text-blue-500" />
          </div>
          <div className="mt-2 text-sm">
            <span className="font-medium">Max Grade:</span>{' '}
            <span className={getGradeColor(Math.max(locsData.OD.NO, locsData.OD.NC, locsData.OD.C, locsData.OD.P))}>
              {Math.max(locsData.OD.NO, locsData.OD.NC, locsData.OD.C, locsData.OD.P).toFixed(1)}
            </span>
          </div>
        </div>

        <div className={`p-4 rounded-lg border-2 ${severityOS.color}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">OS (Left Eye)</p>
              <p className="text-lg font-bold">{severityOS.level}</p>
            </div>
            <Eye className="w-8 h-8 text-green-500" />
          </div>
          <div className="mt-2 text-sm">
            <span className="font-medium">Max Grade:</span>{' '}
            <span className={getGradeColor(Math.max(locsData.OS.NO, locsData.OS.NC, locsData.OS.C, locsData.OS.P))}>
              {Math.max(locsData.OS.NO, locsData.OS.NC, locsData.OS.C, locsData.OS.P).toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* LOCS III Grading Form for Active Eye */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <div className="mb-4">
          <h4 className="text-lg font-bold text-gray-900 mb-2">
            {activeEye === 'OD' ? 'OD (Right Eye)' : 'OS (Left Eye)'} Grading
          </h4>
          <p className="text-sm text-gray-600">
            Grade each category from 0.1 to maximum value using 0.1 increments
          </p>
        </div>

        <div className="space-y-6">
          {(Object.keys(categoryDescriptions) as Array<keyof LOCSIIIGrade>).map((category) => {
            const info = categoryDescriptions[category];
            const currentValue = locsData[activeEye][category];

            return (
              <div key={category} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-2xl">{info.icon}</span>
                      <h5 className="text-md font-bold text-gray-900">
                        {category} - {info.name}
                      </h5>
                    </div>
                    <p className="text-sm text-gray-600">{info.description}</p>
                    <p className="text-xs text-gray-500 mt-1">Range: {info.range}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Current Grade</p>
                    <p className={`text-3xl font-bold ${getGradeColor(currentValue)}`}>
                      {currentValue.toFixed(1)}
                    </p>
                  </div>
                </div>

                {/* Slider */}
                <div className="mb-3">
                  <input
                    type="range"
                    min="0"
                    max={category === 'NO' || category === 'NC' ? 6.9 : 5.9}
                    step="0.1"
                    value={currentValue}
                    onChange={(e) => updateGrade(activeEye, category, parseFloat(e.target.value))}
                    disabled={!canEdit}
                    className="w-full h-2 bg-gradient-to-r from-green-200 via-yellow-200 via-orange-200 to-red-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      accentColor: currentValue < 2.0 ? '#10b981' : currentValue < 4.0 ? '#f59e0b' : '#ef4444',
                    }}
                  />
                </div>

                {/* Numeric Input */}
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-medium text-gray-700">Precise Grade:</label>
                  <input
                    type="number"
                    min="0"
                    max={category === 'NO' || category === 'NC' ? 6.9 : 5.9}
                    step="0.1"
                    value={currentValue}
                    onChange={(e) => updateGrade(activeEye, category, parseFloat(e.target.value) || 0)}
                    disabled={!canEdit}
                    className={`w-24 px-3 py-2 border-2 rounded-lg text-center font-bold text-lg ${getGradeBgColor(
                      currentValue
                    )}`}
                  />
                  <div className="flex-1">
                    {currentValue < 2.0 && (
                      <span className="text-sm text-green-700 font-medium">Early opacity</span>
                    )}
                    {currentValue >= 2.0 && currentValue < 4.0 && (
                      <span className="text-sm text-yellow-700 font-medium">Moderate opacity</span>
                    )}
                    {currentValue >= 4.0 && currentValue < 5.5 && (
                      <span className="text-sm text-orange-700 font-medium">Advanced opacity</span>
                    )}
                    {currentValue >= 5.5 && (
                      <span className="text-sm text-red-700 font-bold">Dense/Mature opacity</span>
                    )}
                  </div>
                </div>

                {/* Quick preset buttons */}
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => updateGrade(activeEye, category, 0)}
                    disabled={!canEdit}
                    className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => updateGrade(activeEye, category, 1.0)}
                    disabled={!canEdit}
                    className="px-2 py-1 text-xs bg-green-100 hover:bg-green-200 rounded disabled:opacity-50"
                  >
                    1.0
                  </button>
                  <button
                    onClick={() => updateGrade(activeEye, category, 2.0)}
                    disabled={!canEdit}
                    className="px-2 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 rounded disabled:opacity-50"
                  >
                    2.0
                  </button>
                  <button
                    onClick={() => updateGrade(activeEye, category, 3.0)}
                    disabled={!canEdit}
                    className="px-2 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 rounded disabled:opacity-50"
                  >
                    3.0
                  </button>
                  <button
                    onClick={() => updateGrade(activeEye, category, 4.0)}
                    disabled={!canEdit}
                    className="px-2 py-1 text-xs bg-orange-100 hover:bg-orange-200 rounded disabled:opacity-50"
                  >
                    4.0
                  </button>
                  <button
                    onClick={() => updateGrade(activeEye, category, 5.0)}
                    disabled={!canEdit}
                    className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 rounded disabled:opacity-50"
                  >
                    5.0
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Reference Guide */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h5 className="font-semibold text-blue-900 mb-2">LOCS III Grading Reference</h5>
            <div className="text-sm text-blue-800 space-y-1">
              <p>
                <strong>NO (Nuclear Opalescence):</strong> Assess cloudiness of nucleus on slit-lamp retroillumination
              </p>
              <p>
                <strong>NC (Nuclear Color):</strong> Assess brunescence using direct focal illumination
              </p>
              <p>
                <strong>C (Cortical):</strong> Estimate percentage of cortical area involved (360° assessment)
              </p>
              <p>
                <strong>P (Posterior Subcapsular):</strong> Estimate percentage of central 3-5mm zone involved
              </p>
            </div>
            <p className="text-xs text-blue-700 mt-3">
              📚 Use standard LOCS III reference photographs for accurate grading comparison
            </p>
          </div>
        </div>
      </div>

      {/* Surgical Indication */}
      <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={locsData.surgicalIndication}
            onChange={(e) =>
              setLocsData((prev) => ({ ...prev, surgicalIndication: e.target.checked }))
            }
            disabled={!canEdit}
            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 mt-0.5"
          />
          <div className="flex-1">
            <p className="font-semibold text-purple-900">Surgical Indication Present</p>
            <p className="text-sm text-purple-700 mt-1">
              Check if cataract meets surgical criteria:
            </p>
            <ul className="text-sm text-purple-700 ml-4 mt-1 list-disc">
              <li>Visual acuity &lt;6/18 (worse than 6/12 in some guidelines)</li>
              <li>Significant glare/contrast sensitivity affecting daily activities</li>
              <li>Patient reports functional visual disability</li>
              <li>Cataract preventing fundus examination or treatment of retinal disease</li>
              <li>Lens-induced glaucoma or inflammation</li>
            </ul>
          </div>
        </label>
      </div>

      {/* Clinical Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Clinical Notes</label>
        <textarea
          value={locsData.clinicalNotes}
          onChange={(e) => setLocsData((prev) => ({ ...prev, clinicalNotes: e.target.value }))}
          disabled={!canEdit}
          rows={4}
          placeholder="Additional observations (e.g., cortical spoke pattern, PSC location, anterior/posterior polar cataract, traumatic cataract, etc.)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
        />
      </div>

      {/* Grading Information */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-600">Graded Date</p>
          <p className="font-semibold text-gray-900">{locsData.gradedDate}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-600">Graded By</p>
          <p className="font-semibold text-gray-900">{locsData.gradedBy}</p>
        </div>
      </div>

      {/* Save Button */}
      {canEdit && (
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Save LOCS III Grading</span>
          </button>
        </div>
      )}

      {/* Automated Surgical Decision Support */}
      {(Math.max(locsData.OD.NO, locsData.OD.NC, locsData.OD.C, locsData.OD.P) >= 4.0 ||
        Math.max(locsData.OS.NO, locsData.OS.NC, locsData.OS.C, locsData.OS.P) >= 4.0) && (
        <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <p className="font-semibold text-orange-900">Advanced Cataract Detected</p>
              <p className="text-sm text-orange-800 mt-1">
                LOCS III grade ≥4.0 indicates significant lens opacity. Consider:
              </p>
              <ul className="text-sm text-orange-800 ml-4 mt-1 list-disc">
                <li>Assessing visual acuity and functional impact</li>
                <li>Discussing surgical options with patient</li>
                <li>Evaluating surgical risk factors (dense nucleus may require phaco modifications)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
