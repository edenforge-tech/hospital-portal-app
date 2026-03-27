'use client';

import { useState } from 'react';
import { Eye, AlertTriangle, Info } from 'lucide-react';

type AngleGrade = '0' | '1' | '2' | '3' | '4';
type IrisConfiguration = 'Steep' | 'Regular' | 'Plateau';
type Pigmentation = 'None' | 'Mild' | 'Moderate' | 'Heavy';

interface QuadrantData {
  grade: AngleGrade;
  pigmentation: Pigmentation;
  pas: boolean;
  pasClockHours: string;
}

interface GonioscopyData {
  OD: {
    superior: QuadrantData;
    inferior: QuadrantData;
    nasal: QuadrantData;
    temporal: QuadrantData;
    irisConfiguration: IrisConfiguration;
    nva: boolean;
    schwalbeLineVisible: boolean;
    angleRecession: boolean;
  };
  OS: {
    superior: QuadrantData;
    inferior: QuadrantData;
    nasal: QuadrantData;
    temporal: QuadrantData;
    irisConfiguration: IrisConfiguration;
    nva: boolean;
    schwalbeLineVisible: boolean;
    angleRecession: boolean;
  };
  notes: string;
}

interface GonioscopyAssessmentProps {
  patientId: string;
  glaucomaType: string;
  onSave?: (data: any) => void;
  canEdit?: boolean;
}

export default function GonioscopyAssessment({
  patientId,
  glaucomaType,
  onSave,
  canEdit = false,
}: GonioscopyAssessmentProps) {
  const [selectedEye, setSelectedEye] = useState<'OD' | 'OS'>('OD');
  
  const defaultQuadrant: QuadrantData = {
    grade: '3',
    pigmentation: 'None',
    pas: false,
    pasClockHours: '',
  };

  const [gonioscopyData, setGonioscopyData] = useState<GonioscopyData>({
    OD: {
      superior: defaultQuadrant,
      inferior: defaultQuadrant,
      nasal: defaultQuadrant,
      temporal: defaultQuadrant,
      irisConfiguration: 'Regular',
      nva: false,
      schwalbeLineVisible: true,
      angleRecession: false,
    },
    OS: {
      superior: defaultQuadrant,
      inferior: defaultQuadrant,
      nasal: defaultQuadrant,
      temporal: defaultQuadrant,
      irisConfiguration: 'Regular',
      nva: false,
      schwalbeLineVisible: true,
      angleRecession: false,
    },
    notes: '',
  });

  const updateQuadrant = (eye: 'OD' | 'OS', quadrant: 'superior' | 'inferior' | 'nasal' | 'temporal', field: keyof QuadrantData, value: any) => {
    setGonioscopyData((prev) => ({
      ...prev,
      [eye]: {
        ...prev[eye],
        [quadrant]: {
          ...prev[eye][quadrant],
          [field]: value,
        },
      },
    }));
  };

  const updateEyeData = (eye: 'OD' | 'OS', field: string, value: any) => {
    setGonioscopyData((prev) => ({
      ...prev,
      [eye]: {
        ...prev[eye],
        [field]: value,
      },
    }));
  };

  const getGradeColor = (grade: AngleGrade) => {
    switch (grade) {
      case '0': return 'bg-red-100 border-red-300 text-red-900';
      case '1': return 'bg-orange-100 border-orange-300 text-orange-900';
      case '2': return 'bg-yellow-100 border-yellow-300 text-yellow-900';
      case '3': return 'bg-green-100 border-green-300 text-green-900';
      case '4': return 'bg-blue-100 border-blue-300 text-blue-900';
      default: return 'bg-gray-100 border-gray-300 text-gray-900';
    }
  };

  const getGradeDescription = (grade: AngleGrade) => {
    switch (grade) {
      case '0': return 'Closed - 0°';
      case '1': return 'Extremely Narrow - 10°';
      case '2': return 'Moderately Narrow - 20°';
      case '3': return 'Open - 30°';
      case '4': return 'Wide Open - 40°';
      default: return '';
    }
  };

  const calculateRisk = () => {
    const eye = gonioscopyData[selectedEye];
    const quadrants = [eye.superior, eye.inferior, eye.nasal, eye.temporal];
    
    const closedCount = quadrants.filter(q => q.grade === '0').length;
    const narrowCount = quadrants.filter(q => q.grade === '1' || q.grade === '2').length;
    const pasPresent = quadrants.some(q => q.pas);

    if (closedCount >= 2 || (closedCount >= 1 && pasPresent)) {
      return {
        level: 'High Risk - Angle Closure',
        color: 'bg-red-100 border-red-400 text-red-900',
        recommendation: 'Urgent laser peripheral iridotomy (LPI) indicated. Consider prophylactic LPI in fellow eye.',
      };
    } else if (narrowCount >= 3 || (narrowCount >= 2 && eye.irisConfiguration === 'Plateau')) {
      return {
        level: 'Moderate Risk - Narrow Angles',
        color: 'bg-orange-100 border-orange-400 text-orange-900',
        recommendation: 'Consider laser peripheral iridotomy (LPI) especially if dark room provocative test positive. Monitor closely.',
      };
    } else if (eye.nva) {
      return {
        level: 'High Risk - Neovascular Glaucoma',
        color: 'bg-red-100 border-red-400 text-red-900',
        recommendation: 'Urgent panretinal photocoagulation (PRP) + anti-VEGF therapy. Consider glaucoma drainage device if IOP uncontrolled.',
      };
    } else {
      return {
        level: 'Low Risk - Open Angles',
        color: 'bg-green-100 border-green-400 text-green-900',
        recommendation: 'No angle-closure risk. Continue routine glaucoma management.',
      };
    }
  };

  const risk = calculateRisk();

  const quadrants: Array<'superior' | 'inferior' | 'nasal' | 'temporal'> = ['superior', 'inferior', 'nasal', 'temporal'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <Eye className="w-5 h-5 mr-2 text-green-600" />
            Gonioscopy Assessment
          </h3>
          <p className="text-sm text-gray-600 mt-1">Anterior Chamber Angle Evaluation (Shaffer Grading)</p>
        </div>

        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setSelectedEye('OD')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              selectedEye === 'OD' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            OD (Right Eye)
          </button>
          <button
            onClick={() => setSelectedEye('OS')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              selectedEye === 'OS' ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            OS (Left Eye)
          </button>
        </div>
      </div>

      {/* Shaffer Grading Reference */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-blue-900 mb-2">Shaffer Grading System</h4>
            <div className="grid grid-cols-5 gap-2 text-xs">
              <div className="bg-red-100 border border-red-300 rounded px-2 py-1">
                <strong>Grade 0:</strong> Closed (0°)
              </div>
              <div className="bg-orange-100 border border-orange-300 rounded px-2 py-1">
                <strong>Grade 1:</strong> Extremely Narrow (10°)
              </div>
              <div className="bg-yellow-100 border border-yellow-300 rounded px-2 py-1">
                <strong>Grade 2:</strong> Moderately Narrow (20°)
              </div>
              <div className="bg-green-100 border border-green-300 rounded px-2 py-1">
                <strong>Grade 3:</strong> Open (30°)
              </div>
              <div className="bg-blue-100 border border-blue-300 rounded px-2 py-1">
                <strong>Grade 4:</strong> Wide Open (40°)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quadrant Grading */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-sm font-bold text-gray-900 mb-4">Angle Assessment by Quadrant - {selectedEye}</h4>
        
        <div className="space-y-4">
          {quadrants.map((quadrant) => {
            const quadrantData = gonioscopyData[selectedEye][quadrant];
            
            return (
              <div key={quadrant} className="border-2 border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-bold text-gray-900 capitalize">{quadrant} Quadrant</h5>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getGradeColor(quadrantData.grade)}`}>
                    Grade {quadrantData.grade} - {getGradeDescription(quadrantData.grade)}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {/* Angle Grade */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Angle Grade</label>
                    <select
                      value={quadrantData.grade}
                      onChange={(e) => updateQuadrant(selectedEye, quadrant, 'grade', e.target.value)}
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="0">Grade 0 (Closed)</option>
                      <option value="1">Grade 1 (10°)</option>
                      <option value="2">Grade 2 (20°)</option>
                      <option value="3">Grade 3 (30°)</option>
                      <option value="4">Grade 4 (40°)</option>
                    </select>
                  </div>

                  {/* Pigmentation */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Pigmentation</label>
                    <select
                      value={quadrantData.pigmentation}
                      onChange={(e) => updateQuadrant(selectedEye, quadrant, 'pigmentation', e.target.value)}
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="None">None</option>
                      <option value="Mild">Mild</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Heavy">Heavy</option>
                    </select>
                  </div>

                  {/* PAS Present */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">PAS Present</label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={quadrantData.pas}
                        onChange={(e) => updateQuadrant(selectedEye, quadrant, 'pas', e.target.checked)}
                        disabled={!canEdit}
                        className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">Yes</span>
                    </label>
                  </div>

                  {/* PAS Clock Hours */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">PAS Clock Hours</label>
                    <input
                      type="text"
                      value={quadrantData.pasClockHours}
                      onChange={(e) => updateQuadrant(selectedEye, quadrant, 'pasClockHours', e.target.value)}
                      disabled={!canEdit || !quadrantData.pas}
                      placeholder="e.g., 2-4"
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Findings */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-sm font-bold text-gray-900 mb-4">Additional Findings - {selectedEye}</h4>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Iris Configuration */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Iris Configuration</label>
            <select
              value={gonioscopyData[selectedEye].irisConfiguration}
              onChange={(e) => updateEyeData(selectedEye, 'irisConfiguration', e.target.value)}
              disabled={!canEdit}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="Steep">Steep</option>
              <option value="Regular">Regular</option>
              <option value="Plateau">Plateau</option>
            </select>
          </div>

          {/* NVA */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Neovascularization of Angle (NVA)</label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={gonioscopyData[selectedEye].nva}
                onChange={(e) => updateEyeData(selectedEye, 'nva', e.target.checked)}
                disabled={!canEdit}
                className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
              />
              <span className="text-sm text-gray-700">NVA Present</span>
            </label>
          </div>

          {/* Schwalbe's Line */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Schwalbe's Line Visible</label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={gonioscopyData[selectedEye].schwalbeLineVisible}
                onChange={(e) => updateEyeData(selectedEye, 'schwalbeLineVisible', e.target.checked)}
                disabled={!canEdit}
                className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Visible</span>
            </label>
          </div>

          {/* Angle Recession */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Angle Recession (Trauma)</label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={gonioscopyData[selectedEye].angleRecession}
                onChange={(e) => updateEyeData(selectedEye, 'angleRecession', e.target.checked)}
                disabled={!canEdit}
                className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">Present</span>
            </label>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className={`border-l-4 p-4 rounded-md ${risk.color}`}>
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold mb-1">{risk.level}</h4>
            <p className="text-sm">{risk.recommendation}</p>
          </div>
        </div>
      </div>

      {/* Clinical Notes */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Clinical Notes</label>
        <textarea
          value={gonioscopyData.notes}
          onChange={(e) => setGonioscopyData((prev) => ({ ...prev, notes: e.target.value }))}
          disabled={!canEdit}
          rows={4}
          placeholder="Additional observations, lens used (Goldmann, Zeiss, etc.), indentation gonioscopy findings..."
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {/* Save Button */}
      {canEdit && (
        <div className="flex justify-end">
          <button
            onClick={() => onSave?.(gonioscopyData)}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <span>Save Gonioscopy Assessment</span>
          </button>
        </div>
      )}
    </div>
  );
}
