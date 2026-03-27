'use client';

import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  Droplet,
  FileText,
  Calendar,
} from 'lucide-react';

interface UlcerMeasurement {
  date: string;
  size: { length: number; width: number }; // in mm
  depth: string; // Superficial, Stromal, Deep stromal, Descemetoce

le
  infiltrate: string;
  hypopyon: boolean;
  epithelialDefect: number; // percentage
  response: string; // Improving, Stable, Worsening
}

interface CultureResult {
  specimen: string;
  organism: string;
  sensitivity: string[];
  resistance: string[];
  reportDate: string;
}

interface TreatmentRegimen {
  medication: string;
  concentration: string;
  frequency: string;
  duration: string;
  route: string; // Topical, Intracameral, Intravitreal
}

interface CornealUlcerManagementProps {
  patientId: string;
  onSave?: (data: any) => void;
  canEdit?: boolean;
}

export default function CornealUlcerManagement({
  patientId,
  onSave,
  canEdit = true,
}: CornealUlcerManagementProps) {
  const [activeEye, setActiveEye] = useState<'OD' | 'OS'>('OS');

  // Mock data
  const [ulcerData, setUlcerData] = useState({
    OD: {
      present: false,
      location: '',
      measurements: [] as UlcerMeasurement[],
    },
    OS: {
      present: true,
      location: 'Central (paracentral - 2mm from visual axis)',
      measurements: [
        {
          date: '2026-01-24',
          size: { length: 4.5, width: 3.8 },
          depth: 'Deep stromal (>50%)',
          infiltrate: 'Dense white stromal infiltrate with feathery edges',
          hypopyon: true,
          epithelialDefect: 80,
          response: 'Worsening',
        },
        {
          date: '2026-01-25',
          size: { length: 4.2, width: 3.5 },
          depth: 'Deep stromal',
          infiltrate: 'Dense infiltrate, slightly less dense at edges',
          hypopyon: true,
          epithelialDefect: 75,
          response: 'Stable',
        },
        {
          date: '2026-01-27',
          size: { length: 3.8, width: 3.2 },
          depth: 'Deep stromal',
          infiltrate: 'Improving - infiltrate becoming more demarcated',
          hypopyon: false,
          epithelialDefect: 65,
          response: 'Improving',
        },
      ],
    },
  });

  const [cultureResults, setCultureResults] = useState<CultureResult[]>([
    {
      specimen: 'Corneal scraping (OS)',
      organism: 'Pseudomonas aeruginosa',
      sensitivity: [
        'Ciprofloxacin',
        'Ofloxacin',
        'Moxifloxacin',
        'Tobramycin',
        'Gentamicin',
        'Ceftazidime',
      ],
      resistance: ['Penicillin'],
      reportDate: '2026-01-26',
    },
  ]);

  const [treatmentRegimen, setTreatmentRegimen] = useState<TreatmentRegimen[]>([
    {
      medication: 'Moxifloxacin',
      concentration: '0.5%',
      frequency: 'Every 1 hour (around the clock)',
      duration: 'Until culture results',
      route: 'Topical',
    },
    {
      medication: 'Tobramycin',
      concentration: '1.4% (fortified)',
      frequency: 'Every 1 hour (around the clock)',
      duration: 'Until culture results',
      route: 'Topical',
    },
    {
      medication: 'Cycloplegic (Homatropine)',
      concentration: '2%',
      frequency: 'TID',
      duration: '2 weeks',
      route: 'Topical',
    },
  ]);

  const currentEyeData = ulcerData[activeEye];
  const latestMeasurement =
    currentEyeData.measurements.length > 0
      ? currentEyeData.measurements[currentEyeData.measurements.length - 1]
      : null;

  // Treatment response assessment
  const assessTreatmentResponse = (): {
    status: string;
    color: string;
    recommendation: string;
  } => {
    if (!latestMeasurement) {
      return {
        status: 'No measurements available',
        color: 'bg-gray-50 border-gray-300 text-gray-900',
        recommendation: 'Begin ulcer size tracking',
      };
    }

    if (currentEyeData.measurements.length < 2) {
      return {
        status: 'Baseline established',
        color: 'bg-blue-50 border-blue-300 text-blue-900',
        recommendation: 'Continue intensive therapy, reassess in 24 hours',
      };
    }

    const previous = currentEyeData.measurements[currentEyeData.measurements.length - 2];
    const sizeReduction =
      (previous.size.length * previous.size.width -
        latestMeasurement.size.length * latestMeasurement.size.width) /
      (previous.size.length * previous.size.width);

    if (latestMeasurement.response === 'Improving' && sizeReduction > 0.1) {
      return {
        status: 'Responding to treatment',
        color: 'bg-green-50 border-green-300 text-green-900',
        recommendation: 'Continue current regimen, taper frequency as improvement continues',
      };
    } else if (latestMeasurement.response === 'Stable') {
      return {
        status: 'Stable - no improvement',
        color: 'bg-yellow-50 border-yellow-300 text-yellow-900',
        recommendation:
          'Review culture results. Consider changing antibiotics if no improvement in 48-72h',
      };
    } else {
      return {
        status: 'Worsening - treatment failure',
        color: 'bg-red-50 border-red-300 text-red-900',
        recommendation:
          'URGENT: Modify treatment based on culture. Consider admission, fortified antibiotics, or surgical intervention',
      };
    }
  };

  const responseAssessment = assessTreatmentResponse();

  const handleSave = () => {
    if (onSave) {
      onSave({ ulcerData, cultureResults, treatmentRegimen });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gray-900">Corneal Ulcer Management</h3>
        <p className="text-sm text-gray-600">Infectious keratitis monitoring and treatment</p>
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
          OD (Right Eye)
        </button>
        <button
          onClick={() => setActiveEye('OS')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            activeEye === 'OS'
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          OS (Left Eye)
        </button>
      </div>

      {!currentEyeData.present && (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <p className="text-lg font-semibold text-green-900">No corneal ulcer detected in {activeEye}</p>
        </div>
      )}

      {currentEyeData.present && (
        <>
          {/* Treatment Response Status */}
          <div className={`p-4 rounded-lg border-2 ${responseAssessment.color}`}>
            <div className="flex items-start space-x-3">
              {responseAssessment.status.includes('Responding') ? (
                <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
              ) : responseAssessment.status.includes('Worsening') ? (
                <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" />
              ) : (
                <Activity className="w-6 h-6 flex-shrink-0 mt-1" />
              )}
              <div className="flex-1">
                <h4 className="text-lg font-bold mb-2">
                  Treatment Response: {responseAssessment.status}
                </h4>
                <p className="text-sm font-medium">{responseAssessment.recommendation}</p>
              </div>
            </div>
          </div>

          {/* Current Ulcer Status */}
          {latestMeasurement && (
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Current Ulcer Status ({activeEye})</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Size</p>
                  <p className="text-2xl font-bold text-red-900">
                    {latestMeasurement.size.length} × {latestMeasurement.size.width} mm
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Length × Width</p>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Depth</p>
                  <p className="text-lg font-bold text-orange-900">{latestMeasurement.depth}</p>
                </div>

                <div
                  className={`p-4 rounded-lg ${
                    latestMeasurement.hypopyon ? 'bg-red-50' : 'bg-green-50'
                  }`}
                >
                  <p className="text-sm text-gray-600 mb-1">Hypopyon</p>
                  <p
                    className={`text-2xl font-bold ${
                      latestMeasurement.hypopyon ? 'text-red-900' : 'text-green-900'
                    }`}
                  >
                    {latestMeasurement.hypopyon ? 'Present' : 'Absent'}
                  </p>
                  {latestMeasurement.hypopyon && (
                    <p className="text-xs text-red-700 mt-1">⚠️ Severe infection</p>
                  )}
                </div>

                <div className="col-span-3 bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Location</p>
                  <p className="text-lg font-bold text-purple-900">{currentEyeData.location}</p>
                </div>

                <div className="col-span-3 bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Infiltrate Description</p>
                  <p className="text-sm text-blue-900">{latestMeasurement.infiltrate}</p>
                </div>
              </div>
            </div>
          )}

          {/* Size Tracking Table */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <TrendingDown className="w-5 h-5 text-green-600" />
              <span>Ulcer Size Progression</span>
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="text-left p-3 font-semibold">Date</th>
                    <th className="text-center p-3 font-semibold">Size (L × W mm)</th>
                    <th className="text-center p-3 font-semibold">Area (mm²)</th>
                    <th className="text-center p-3 font-semibold">Depth</th>
                    <th className="text-center p-3 font-semibold">Hypopyon</th>
                    <th className="text-center p-3 font-semibold">Epithelial Defect</th>
                    <th className="text-center p-3 font-semibold">Response</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEyeData.measurements.map((measurement, index) => {
                    const area = measurement.size.length * measurement.size.width;
                    const isLatest = index === currentEyeData.measurements.length - 1;

                    return (
                      <tr
                        key={index}
                        className={`border-b border-gray-200 ${
                          isLatest ? 'bg-purple-50 font-semibold' : ''
                        }`}
                      >
                        <td className="p-3">{measurement.date}</td>
                        <td className="p-3 text-center">
                          {measurement.size.length} × {measurement.size.width}
                        </td>
                        <td className="p-3 text-center">{area.toFixed(1)}</td>
                        <td className="p-3 text-center text-xs">{measurement.depth}</td>
                        <td className="p-3 text-center">
                          {measurement.hypopyon ? (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                              Yes
                            </span>
                          ) : (
                            <span className="text-gray-500">No</span>
                          )}
                        </td>
                        <td className="p-3 text-center">{measurement.epithelialDefect}%</td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              measurement.response === 'Improving'
                                ? 'bg-green-100 text-green-800'
                                : measurement.response === 'Stable'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {measurement.response}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Culture Results */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Culture & Sensitivity Results</span>
            </h4>
            {cultureResults.map((culture, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Specimen</p>
                    <p className="font-semibold text-gray-900">{culture.specimen}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Report Date</p>
                    <p className="font-semibold text-gray-900">{culture.reportDate}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Organism Identified</p>
                    <p className="text-lg font-bold text-red-900">{culture.organism}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Sensitive To</p>
                    <div className="flex flex-wrap gap-2">
                      {culture.sensitivity.map((drug) => (
                        <span
                          key={drug}
                          className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                        >
                          {drug}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Resistant To</p>
                    <div className="flex flex-wrap gap-2">
                      {culture.resistance.map((drug) => (
                        <span
                          key={drug}
                          className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium"
                        >
                          {drug}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Treatment Regimen */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Droplet className="w-5 h-5 text-purple-600" />
              <span>Current Treatment Regimen</span>
            </h4>
            <div className="space-y-3">
              {treatmentRegimen.map((med, index) => (
                <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-lg font-bold text-purple-900">
                        {med.medication} {med.concentration}
                      </p>
                      <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                        <div>
                          <span className="text-gray-600">Route:</span>
                          <span className="ml-2 font-medium">{med.route}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Frequency:</span>
                          <span className="ml-2 font-medium">{med.frequency}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Duration:</span>
                          <span className="ml-2 font-medium">{med.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <p className="text-sm text-orange-800">
                <strong>Critical Care:</strong> Intensive "around the clock" dosing for first
                24-72 hours. Patient should be seen daily until improving, then every 2-3 days.
              </p>
            </div>
          </div>

          {/* Clinical Guidelines */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h5 className="font-semibold text-blue-900 mb-3">Bacterial Keratitis Management</h5>
            <div className="space-y-2 text-sm text-blue-800">
              <p>
                <strong>Initial Therapy:</strong> Broad-spectrum coverage (fluoroquinolone +
                fortified aminoglycoside)
              </p>
              <p>
                <strong>Corneal Scraping:</strong> Mandatory for culture before starting treatment
              </p>
              <p>
                <strong>Admission Criteria:</strong> Central ulcer &gt;2mm, hypopyon, poor
                compliance, worsening on treatment
              </p>
              <p>
                <strong>Surgical Intervention:</strong> Consider if perforation risk, no response
                in 5-7 days
              </p>
              <p>
                <strong>Follow-up:</strong> Daily until improving, then every 2-3 days. Ulcer
                should decrease 10-15% per day when responding
              </p>
            </div>
          </div>
        </>
      )}

      {/* Save Button */}
      {canEdit && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Save Ulcer Management Data</span>
          </button>
        </div>
      )}
    </div>
  );
}
