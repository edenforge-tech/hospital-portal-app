'use client';

import { useState } from 'react';
import { Eye, Save, AlertCircle } from 'lucide-react';

interface DRGradingFormProps {
  patientId: string;
  previousGrade?: string;
  onSave: (data: any) => void;
  canEdit: boolean;
}

export default function DRGradingForm({
  patientId,
  previousGrade,
  onSave,
  canEdit,
}: DRGradingFormProps) {
  // DR Grading - OD (Right Eye)
  const [drGradeOD, setDrGradeOD] = useState('No DR');
  const [dmeOD, setDmeOD] = useState('Absent');
  const [drDetailsOD, setDrDetailsOD] = useState({
    microaneurysms: false,
    hemorrhages: false,
    hardExudates: false,
    cottonWoolSpots: false,
    iRMA: false,
    vb: false,
    neovascularization: false,
    nvd: false,
    nve: false,
    vitreousHemorrhage: false,
    tractionDetachment: false,
  });

  // DR Grading - OS (Left Eye)
  const [drGradeOS, setDrGradeOS] = useState('No DR');
  const [dmeOS, setDmeOS] = useState('Absent');
  const [drDetailsOS, setDrDetailsOS] = useState({
    microaneurysms: false,
    hemorrhages: false,
    hardExudates: false,
    cottonWoolSpots: false,
    iRMA: false,
    vb: false,
    neovascularization: false,
    nvd: false,
    nve: false,
    vitreousHemorrhage: false,
    tractionDetachment: false,
  });

  // Additional Findings
  const [fundusFindings, setFundusFindings] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState({
    observation: false,
    medicalManagement: false,
    antiVEGF: false,
    laserPRP: false,
    focalLaser: false,
    vitrectomy: false,
  });
  const [followUpInterval, setFollowUpInterval] = useState('3 months');
  const [notes, setNotes] = useState('');

  const drGradeOptions = [
    'No DR',
    'Mild NPDR',
    'Moderate NPDR',
    'Severe NPDR',
    'PDR (Proliferative DR)',
    'Advanced PDR',
  ];

  const dmeOptions = [
    'Absent',
    'Present - Non-Center Involving',
    'Present - Center Involving',
  ];

  const followUpOptions = [
    '1 week',
    '2 weeks',
    '1 month',
    '2 months',
    '3 months',
    '6 months',
    '1 year',
  ];

  const handleSave = () => {
    const formData = {
      patientId,
      examinationDate: new Date().toISOString(),
      OD: {
        drGrade: drGradeOD,
        dme: dmeOD,
        details: drDetailsOD,
      },
      OS: {
        drGrade: drGradeOS,
        dme: dmeOS,
        details: drDetailsOS,
      },
      fundusFindings,
      treatmentPlan,
      followUpInterval,
      notes,
    };

    onSave(formData);
  };

  const getDRSeverityColor = (grade: string) => {
    if (grade === 'No DR') return 'text-green-900';
    if (grade.includes('Mild')) return 'text-yellow-900';
    if (grade.includes('Moderate')) return 'text-orange-900';
    if (grade.includes('Severe') || grade.includes('PDR')) return 'text-red-900';
    return 'text-gray-900';
  };

  return (
    <div className="space-y-6">
      {/* Previous Grade Alert */}
      {previousGrade && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-blue-400 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">Previous DR Grade</h3>
              <p className="mt-1 text-sm text-blue-700">
                Last examination: <span className="font-bold">{previousGrade}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <Eye className="w-6 h-6 mr-2 text-red-600" />
        Diabetic Retinopathy Grading (ETDRS Classification)
      </h3>

      {/* OD (Right Eye) */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-blue-900 mb-4">OD (Right Eye)</h4>

        <div className="space-y-4">
          {/* DR Grade */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Diabetic Retinopathy Grade
            </label>
            <select
              value={drGradeOD}
              onChange={(e) => setDrGradeOD(e.target.value)}
              disabled={!canEdit}
              className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-500 text-lg font-bold"
            >
              {drGradeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <p className={`mt-2 text-sm font-semibold ${getDRSeverityColor(drGradeOD)}`}>
              {drGradeOD === 'No DR' && '✓ No diabetic retinopathy detected'}
              {drGradeOD === 'Mild NPDR' && '⚠️ Microaneurysms only'}
              {drGradeOD === 'Moderate NPDR' &&
                '⚠️ More than microaneurysms but less than severe NPDR'}
              {drGradeOD === 'Severe NPDR' &&
                '⚠️⚠️ 4-2-1 Rule: Hemorrhages in 4 quadrants, Venous beading in 2+ quadrants, IRMA in 1+ quadrant'}
              {drGradeOD.includes('PDR') && '🚨 CRITICAL: Proliferative diabetic retinopathy'}
            </p>
          </div>

          {/* DME Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Diabetic Macular Edema (DME)
            </label>
            <select
              value={dmeOD}
              onChange={(e) => setDmeOD(e.target.value)}
              disabled={!canEdit}
              className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-500"
            >
              {dmeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* DR Details Checkboxes */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Retinal Findings (OD)</p>
            <div className="grid grid-cols-3 gap-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={drDetailsOD.microaneurysms}
                  onChange={(e) =>
                    setDrDetailsOD({ ...drDetailsOD, microaneurysms: e.target.checked })
                  }
                  disabled={!canEdit}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">Microaneurysms</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={drDetailsOD.hemorrhages}
                  onChange={(e) =>
                    setDrDetailsOD({ ...drDetailsOD, hemorrhages: e.target.checked })
                  }
                  disabled={!canEdit}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">Dot/Blot Hemorrhages</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={drDetailsOD.hardExudates}
                  onChange={(e) =>
                    setDrDetailsOD({ ...drDetailsOD, hardExudates: e.target.checked })
                  }
                  disabled={!canEdit}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">Hard Exudates</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={drDetailsOD.cottonWoolSpots}
                  onChange={(e) =>
                    setDrDetailsOD({ ...drDetailsOD, cottonWoolSpots: e.target.checked })
                  }
                  disabled={!canEdit}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">Cotton Wool Spots</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={drDetailsOD.iRMA}
                  onChange={(e) => setDrDetailsOD({ ...drDetailsOD, iRMA: e.target.checked })}
                  disabled={!canEdit}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">IRMA</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={drDetailsOD.vb}
                  onChange={(e) => setDrDetailsOD({ ...drDetailsOD, vb: e.target.checked })}
                  disabled={!canEdit}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">Venous Beading</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={drDetailsOD.neovascularization}
                  onChange={(e) =>
                    setDrDetailsOD({ ...drDetailsOD, neovascularization: e.target.checked })
                  }
                  disabled={!canEdit}
                  className="w-4 h-4 text-red-600"
                />
                <span className="text-sm font-bold text-red-900">Neovascularization</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={drDetailsOD.nvd}
                  onChange={(e) => setDrDetailsOD({ ...drDetailsOD, nvd: e.target.checked })}
                  disabled={!canEdit}
                  className="w-4 h-4 text-red-600"
                />
                <span className="text-sm font-bold text-red-900">NVD (Disc)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={drDetailsOD.nve}
                  onChange={(e) => setDrDetailsOD({ ...drDetailsOD, nve: e.target.checked })}
                  disabled={!canEdit}
                  className="w-4 h-4 text-red-600"
                />
                <span className="text-sm font-bold text-red-900">NVE (Elsewhere)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={drDetailsOD.vitreousHemorrhage}
                  onChange={(e) =>
                    setDrDetailsOD({ ...drDetailsOD, vitreousHemorrhage: e.target.checked })
                  }
                  disabled={!canEdit}
                  className="w-4 h-4 text-red-600"
                />
                <span className="text-sm font-bold text-red-900">Vitreous Hemorrhage</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={drDetailsOD.tractionDetachment}
                  onChange={(e) =>
                    setDrDetailsOD({ ...drDetailsOD, tractionDetachment: e.target.checked })
                  }
                  disabled={!canEdit}
                  className="w-4 h-4 text-red-600"
                />
                <span className="text-sm font-bold text-red-900">Traction Detachment</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* OS (Left Eye) */}
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-green-900 mb-4">OS (Left Eye)</h4>

        <div className="space-y-4">
          {/* DR Grade */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Diabetic Retinopathy Grade
            </label>
            <select
              value={drGradeOS}
              onChange={(e) => setDrGradeOS(e.target.value)}
              disabled={!canEdit}
              className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-500 text-lg font-bold"
            >
              {drGradeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <p className={`mt-2 text-sm font-semibold ${getDRSeverityColor(drGradeOS)}`}>
              {drGradeOS === 'No DR' && '✓ No diabetic retinopathy detected'}
              {drGradeOS === 'Mild NPDR' && '⚠️ Microaneurysms only'}
              {drGradeOS === 'Moderate NPDR' &&
                '⚠️ More than microaneurysms but less than severe NPDR'}
              {drGradeOS === 'Severe NPDR' &&
                '⚠️⚠️ 4-2-1 Rule: Hemorrhages in 4 quadrants, Venous beading in 2+ quadrants, IRMA in 1+ quadrant'}
              {drGradeOS.includes('PDR') && '🚨 CRITICAL: Proliferative diabetic retinopathy'}
            </p>
          </div>

          {/* DME Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Diabetic Macular Edema (DME)
            </label>
            <select
              value={dmeOS}
              onChange={(e) => setDmeOS(e.target.value)}
              disabled={!canEdit}
              className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-500"
            >
              {dmeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* DR Details Checkboxes - OS */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Retinal Findings (OS)</p>
            <div className="grid grid-cols-3 gap-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={drDetailsOS.microaneurysms}
                  onChange={(e) =>
                    setDrDetailsOS({ ...drDetailsOS, microaneurysms: e.target.checked })
                  }
                  disabled={!canEdit}
                  className="w-4 h-4 text-green-600"
                />
                <span className="text-sm">Microaneurysms</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={drDetailsOS.hemorrhages}
                  onChange={(e) =>
                    setDrDetailsOS({ ...drDetailsOS, hemorrhages: e.target.checked })
                  }
                  disabled={!canEdit}
                  className="w-4 h-4 text-green-600"
                />
                <span className="text-sm">Dot/Blot Hemorrhages</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={drDetailsOS.hardExudates}
                  onChange={(e) =>
                    setDrDetailsOS({ ...drDetailsOS, hardExudates: e.target.checked })
                  }
                  disabled={!canEdit}
                  className="w-4 h-4 text-green-600"
                />
                <span className="text-sm">Hard Exudates</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={drDetailsOS.cottonWoolSpots}
                  onChange={(e) =>
                    setDrDetailsOS({ ...drDetailsOS, cottonWoolSpots: e.target.checked })
                  }
                  disabled={!canEdit}
                  className="w-4 h-4 text-green-600"
                />
                <span className="text-sm">Cotton Wool Spots</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={drDetailsOS.iRMA}
                  onChange={(e) => setDrDetailsOS({ ...drDetailsOS, iRMA: e.target.checked })}
                  disabled={!canEdit}
                  className="w-4 h-4 text-green-600"
                />
                <span className="text-sm">IRMA</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={drDetailsOS.vb}
                  onChange={(e) => setDrDetailsOS({ ...drDetailsOS, vb: e.target.checked })}
                  disabled={!canEdit}
                  className="w-4 h-4 text-green-600"
                />
                <span className="text-sm">Venous Beading</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={drDetailsOS.neovascularization}
                  onChange={(e) =>
                    setDrDetailsOS({ ...drDetailsOS, neovascularization: e.target.checked })
                  }
                  disabled={!canEdit}
                  className="w-4 h-4 text-red-600"
                />
                <span className="text-sm font-bold text-red-900">Neovascularization</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={drDetailsOS.nvd}
                  onChange={(e) => setDrDetailsOS({ ...drDetailsOS, nvd: e.target.checked })}
                  disabled={!canEdit}
                  className="w-4 h-4 text-red-600"
                />
                <span className="text-sm font-bold text-red-900">NVD (Disc)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={drDetailsOS.nve}
                  onChange={(e) => setDrDetailsOS({ ...drDetailsOS, nve: e.target.checked })}
                  disabled={!canEdit}
                  className="w-4 h-4 text-red-600"
                />
                <span className="text-sm font-bold text-red-900">NVE (Elsewhere)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={drDetailsOS.vitreousHemorrhage}
                  onChange={(e) =>
                    setDrDetailsOS({ ...drDetailsOS, vitreousHemorrhage: e.target.checked })
                  }
                  disabled={!canEdit}
                  className="w-4 h-4 text-red-600"
                />
                <span className="text-sm font-bold text-red-900">Vitreous Hemorrhage</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={drDetailsOS.tractionDetachment}
                  onChange={(e) =>
                    setDrDetailsOS({ ...drDetailsOS, tractionDetachment: e.target.checked })
                  }
                  disabled={!canEdit}
                  className="w-4 h-4 text-red-600"
                />
                <span className="text-sm font-bold text-red-900">Traction Detachment</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Fundus Findings */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Additional Fundus Findings
        </label>
        <textarea
          value={fundusFindings}
          onChange={(e) => setFundusFindings(e.target.value)}
          rows={4}
          disabled={!canEdit}
          className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          placeholder="Describe optic disc, macula, vessels, periphery findings..."
        />
      </div>

      {/* Treatment Plan */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-yellow-900 mb-4">Treatment Plan</h4>
        <div className="grid grid-cols-3 gap-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={treatmentPlan.observation}
              onChange={(e) =>
                setTreatmentPlan({ ...treatmentPlan, observation: e.target.checked })
              }
              disabled={!canEdit}
              className="w-5 h-5 text-yellow-600"
            />
            <span className="font-semibold">Observation Only</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={treatmentPlan.medicalManagement}
              onChange={(e) =>
                setTreatmentPlan({ ...treatmentPlan, medicalManagement: e.target.checked })
              }
              disabled={!canEdit}
              className="w-5 h-5 text-yellow-600"
            />
            <span className="font-semibold">Medical Management</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={treatmentPlan.antiVEGF}
              onChange={(e) =>
                setTreatmentPlan({ ...treatmentPlan, antiVEGF: e.target.checked })
              }
              disabled={!canEdit}
              className="w-5 h-5 text-purple-600"
            />
            <span className="font-semibold text-purple-900">Anti-VEGF Injection</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={treatmentPlan.laserPRP}
              onChange={(e) =>
                setTreatmentPlan({ ...treatmentPlan, laserPRP: e.target.checked })
              }
              disabled={!canEdit}
              className="w-5 h-5 text-red-600"
            />
            <span className="font-semibold text-red-900">Laser PRP</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={treatmentPlan.focalLaser}
              onChange={(e) =>
                setTreatmentPlan({ ...treatmentPlan, focalLaser: e.target.checked })
              }
              disabled={!canEdit}
              className="w-5 h-5 text-orange-600"
            />
            <span className="font-semibold text-orange-900">Focal/Grid Laser</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={treatmentPlan.vitrectomy}
              onChange={(e) =>
                setTreatmentPlan({ ...treatmentPlan, vitrectomy: e.target.checked })
              }
              disabled={!canEdit}
              className="w-5 h-5 text-red-600"
            />
            <span className="font-semibold text-red-900">Vitrectomy Referral</span>
          </label>
        </div>
      </div>

      {/* Follow-up Interval */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Follow-up Interval
          </label>
          <select
            value={followUpInterval}
            onChange={(e) => setFollowUpInterval(e.target.value)}
            disabled={!canEdit}
            className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-500"
          >
            {followUpOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clinical Notes */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Clinical Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          disabled={!canEdit}
          className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          placeholder="Additional clinical notes, patient counseling, referrals..."
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={!canEdit}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          <span>Save DR Grading</span>
        </button>
      </div>
    </div>
  );
}
