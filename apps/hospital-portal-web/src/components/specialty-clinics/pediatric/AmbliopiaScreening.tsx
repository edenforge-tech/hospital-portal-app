'use client';

import React, { useState } from 'react';
import { Eye, TrendingUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface AmbliopiaScreeningProps {
  patientId: string;
  ageMonths: number;
  visionOD: string;
  visionOS: string;
  hasAmblyopia: boolean;
  canEdit?: boolean;
  onSave?: (data: any) => void;
}

export default function AmbliopiaScreening({
  patientId,
  ageMonths,
  visionOD,
  visionOS,
  hasAmblyopia,
  canEdit = true,
  onSave,
}: AmbliopiaScreeningProps) {
  const [amblyopiaType, setAmblyopiaType] = useState('Anisometropic');
  const [affectedEye, setAffectedEye] = useState('OS');
  const [severity, setSeverity] = useState('Moderate');

  // Visual acuity tracking (serial measurements)
  const [vaHistory] = useState([
    {
      date: '2025-08-15',
      od: '6/12',
      os: '6/60',
      treatment: 'Baseline (spectacles prescribed)',
      compliance: 'N/A',
    },
    {
      date: '2025-10-20',
      od: '6/12',
      os: '6/48',
      treatment: 'Patching OD 2h/day',
      compliance: 'Good (90%)',
    },
    {
      date: '2025-12-18',
      od: '6/12',
      os: '6/36',
      treatment: 'Patching OD 2h/day',
      compliance: 'Fair (70%)',
    },
    {
      date: '2026-01-27',
      od: '6/12',
      os: '6/24',
      treatment: 'Patching OD 3h/day (increased)',
      compliance: 'Excellent (95%)',
    },
  ]);

  // Occlusion therapy tracking
  const [occlusionTherapy, setOcclusionTherapy] = useState({
    prescribed: true,
    method: 'Patching',
    eye: 'OD',
    hoursPerDay: 3,
    startDate: '2025-10-01',
    compliance: 'Excellent (95%)',
  });

  // Calculate improvement
  const calculateImprovement = (): {
    linesImproved: number;
    percentImproved: number;
    status: string;
    color: string;
  } => {
    const baseline = vaHistory[0];
    const latest = vaHistory[vaHistory.length - 1];

    // Convert Snellen to logMAR for calculation
    const snellenToLogMAR = (va: string): number => {
      const conversions: { [key: string]: number } = {
        '6/6': 0.0,
        '6/9': 0.18,
        '6/12': 0.3,
        '6/18': 0.48,
        '6/24': 0.6,
        '6/36': 0.78,
        '6/48': 0.9,
        '6/60': 1.0,
      };
      return conversions[va] || 1.0;
    };

    const baselineLogMAR = snellenToLogMAR(baseline.os);
    const latestLogMAR = snellenToLogMAR(latest.os);
    const improvement = baselineLogMAR - latestLogMAR;
    const linesImproved = improvement / 0.1; // Each 0.1 logMAR = 1 line
    const percentImproved = (improvement / baselineLogMAR) * 100;

    if (linesImproved >= 2) {
      return {
        linesImproved,
        percentImproved,
        status: 'Excellent response',
        color: 'bg-green-50 border-green-300 text-green-900',
      };
    } else if (linesImproved >= 1) {
      return {
        linesImproved,
        percentImproved,
        status: 'Good response',
        color: 'bg-blue-50 border-blue-300 text-blue-900',
      };
    } else if (linesImproved > 0) {
      return {
        linesImproved,
        percentImproved,
        status: 'Minimal response',
        color: 'bg-yellow-50 border-yellow-300 text-yellow-900',
      };
    } else {
      return {
        linesImproved: 0,
        percentImproved: 0,
        status: 'No response - review treatment',
        color: 'bg-red-50 border-red-300 text-red-900',
      };
    }
  };

  const improvement = calculateImprovement();

  // Critical age assessment
  const assessCriticalAge = (): { critical: boolean; message: string; color: string } => {
    const ageYears = ageMonths / 12;

    if (ageYears < 3) {
      return {
        critical: false,
        message: 'Excellent age for amblyopia treatment - high success rate expected',
        color: 'bg-green-50 border-green-300 text-green-900',
      };
    } else if (ageYears < 7) {
      return {
        critical: false,
        message: 'Good age for treatment - visual plasticity still present',
        color: 'bg-blue-50 border-blue-300 text-blue-900',
      };
    } else if (ageYears < 10) {
      return {
        critical: true,
        message:
          'Critical period closing - URGENT treatment needed. Success rate decreases after age 8-9',
        color: 'bg-orange-50 border-orange-300 text-orange-900',
      };
    } else {
      return {
        critical: true,
        message:
          'Past critical period - treatment success limited. Consider maintenance therapy only',
        color: 'bg-red-50 border-red-300 text-red-900',
      };
    }
  };

  const ageAssessment = assessCriticalAge();

  const handleSave = () => {
    if (onSave) {
      onSave({
        amblyopiaType,
        affectedEye,
        severity,
        vaHistory,
        occlusionTherapy,
        improvement,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gray-900">Amblyopia Screening & Treatment</h3>
        <p className="text-sm text-gray-600">
          "Lazy eye" assessment - early detection and treatment critical before age 8-9
        </p>
      </div>

      {/* Critical Age Assessment */}
      <div className={`border-2 rounded-lg p-4 ${ageAssessment.color}`}>
        <div className="flex items-start space-x-3">
          {ageAssessment.critical ? (
            <AlertTriangle className="w-6 h-6 mt-0.5 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <h4 className="text-lg font-bold mb-2">
              Age: {(ageMonths / 12).toFixed(1)} years
              {ageAssessment.critical ? ' - CRITICAL PERIOD' : ''}
            </h4>
            <p className="text-sm">{ageAssessment.message}</p>
          </div>
        </div>
      </div>

      {/* Amblyopia Classification */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">Amblyopia Classification</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={amblyopiaType}
              onChange={(e) => setAmblyopiaType(e.target.value)}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option>Anisometropic</option>
              <option>Strabismic</option>
              <option>Deprivation (congenital cataract, ptosis)</option>
              <option>Refractive (bilateral high hyperopia)</option>
              <option>Mixed (anisometropic + strabismic)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Affected Eye</label>
            <select
              value={affectedEye}
              onChange={(e) => setAffectedEye(e.target.value)}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option>OD</option>
              <option>OS</option>
              <option>OU (bilateral)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option>Mild (6/12 to 6/18)</option>
              <option>Moderate (6/24 to 6/36)</option>
              <option>Severe (&lt;6/60)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visual Acuity Tracking */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <span>Visual Acuity Progress Tracking</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  VA OD
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  VA OS
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Treatment
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Compliance
                </th>
              </tr>
            </thead>
            <tbody>
              {vaHistory.map((entry, index) => (
                <tr
                  key={index}
                  className={`border-b border-gray-200 ${
                    index === vaHistory.length - 1 ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-sm text-gray-900">{entry.date}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm font-semibold">
                      {entry.od}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-3 py-1 bg-green-100 text-green-900 rounded-full text-sm font-semibold">
                      {entry.os}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{entry.treatment}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        entry.compliance.includes('Excellent')
                          ? 'bg-green-100 text-green-800'
                          : entry.compliance.includes('Good')
                          ? 'bg-blue-100 text-blue-800'
                          : entry.compliance.includes('Fair')
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {entry.compliance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Treatment Response Assessment */}
      <div className={`border-2 rounded-lg p-6 ${improvement.color}`}>
        <div className="flex items-start space-x-3">
          <TrendingUp className="w-6 h-6 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-lg font-bold mb-3">{improvement.status}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm mb-1">Lines Improved</p>
                <p className="text-3xl font-bold">{improvement.linesImproved.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-sm mb-1">Percent Improvement</p>
                <p className="text-3xl font-bold">{improvement.percentImproved.toFixed(0)}%</p>
              </div>
            </div>
            <p className="text-sm mt-3">
              Baseline: {vaHistory[0].os} → Current: {vaHistory[vaHistory.length - 1].os}
            </p>
          </div>
        </div>
      </div>

      {/* Occlusion Therapy Details */}
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <h4 className="text-lg font-bold text-purple-900 mb-4 flex items-center space-x-2">
          <Eye className="w-5 h-5" />
          <span>Occlusion (Patching) Therapy</span>
        </h4>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">Method</label>
              <select
                value={occlusionTherapy.method}
                onChange={(e) =>
                  setOcclusionTherapy((prev) => ({ ...prev, method: e.target.value }))
                }
                disabled={!canEdit}
                className="w-full px-3 py-2 border border-purple-300 rounded-lg"
              >
                <option>Patching (adhesive patch)</option>
                <option>Atropine penalization (1% drops in good eye)</option>
                <option>Bangerter foil (translucent filter)</option>
                <option>Combined (patching + atropine)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">
                Occluded Eye
              </label>
              <select
                value={occlusionTherapy.eye}
                onChange={(e) =>
                  setOcclusionTherapy((prev) => ({ ...prev, eye: e.target.value }))
                }
                disabled={!canEdit}
                className="w-full px-3 py-2 border border-purple-300 rounded-lg"
              >
                <option>OD (Right eye - good eye)</option>
                <option>OS (Left eye - good eye)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">
                Hours Per Day
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={occlusionTherapy.hoursPerDay}
                onChange={(e) =>
                  setOcclusionTherapy((prev) => ({
                    ...prev,
                    hoursPerDay: parseInt(e.target.value) || 0,
                  }))
                }
                disabled={!canEdit}
                className="w-full px-3 py-2 border border-purple-300 rounded-lg"
              />
              <p className="text-xs text-purple-700 mt-1">
                Mild amblyopia: 2h/day, Moderate: 3-6h/day, Severe: Full-time
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">Start Date</label>
              <input
                type="date"
                value={occlusionTherapy.startDate}
                onChange={(e) =>
                  setOcclusionTherapy((prev) => ({ ...prev, startDate: e.target.value }))
                }
                disabled={!canEdit}
                className="w-full px-3 py-2 border border-purple-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">
                Compliance Assessment
              </label>
              <select
                value={occlusionTherapy.compliance}
                onChange={(e) =>
                  setOcclusionTherapy((prev) => ({ ...prev, compliance: e.target.value }))
                }
                disabled={!canEdit}
                className="w-full px-3 py-2 border border-purple-300 rounded-lg"
              >
                <option>Excellent (95-100%)</option>
                <option>Good (80-94%)</option>
                <option>Fair (60-79%)</option>
                <option>Poor (&lt;60%)</option>
              </select>
            </div>

            <div className="bg-purple-100 rounded-lg p-3">
              <p className="text-sm text-purple-900 font-semibold mb-1">Current Prescription:</p>
              <p className="text-sm text-purple-800">
                Patch {occlusionTherapy.eye} for {occlusionTherapy.hoursPerDay} hours daily
              </p>
              <p className="text-xs text-purple-700 mt-2">
                Compliance: {occlusionTherapy.compliance}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Guidelines */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
        <h5 className="font-semibold text-blue-900 mb-3">Amblyopia Treatment Guidelines</h5>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            <strong>Critical Period:</strong> Treatment most effective before age 7-8 years. Visual
            plasticity decreases significantly after age 9-10.
          </p>
          <p>
            <strong>Patching Regimen:</strong> Dosage depends on severity. Mild: 2h/day, Moderate:
            3-6h/day, Severe: 6h-full time. Monitor for reverse amblyopia in patched eye.
          </p>
          <p>
            <strong>Atropine Penalization:</strong> Alternative for poor patch compliance. 1%
            atropine in good eye QD or twice weekly. Effective but slower than patching.
          </p>
          <p>
            <strong>Spectacle Correction:</strong> MUST correct refractive error FIRST. Full
            anisometropia correction essential. Allow 12-18 weeks for spectacle adaptation.
          </p>
          <p>
            <strong>Follow-up:</strong> Every 4-8 weeks during active treatment. Taper once vision
            equalizes. Recurrence risk 25% - maintain surveillance.
          </p>
          <p>
            <strong>Success Rate:</strong> 70-90% with good compliance if treated before age 8.
            Factors: Age, severity, compliance, cause (strabismic worse than refractive).
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
            <span>Save Amblyopia Assessment</span>
          </button>
        </div>
      )}
    </div>
  );
}
