'use client';

import React, { useState } from 'react';
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Eye,
  Calendar,
  Users,
  Activity,
  TrendingUp,
} from 'lucide-react';

interface DonorTissue {
  tissueId: string;
  donorAge: number;
  deathToDonation: number; // hours
  endothelialCellCount: number; // cells/mm²
  tissueDiameter: number; // mm
  preservationMethod: string;
  expiryDate: string;
  tissueBank: string;
}

interface PreOpAssessment {
  va: string;
  iop: number;
  cornealThickness: number;
  anteriorChamberDepth: number;
  lensStatus: string;
  retinalStatus: string;
  contraindications: string[];
}

interface SurgeryPlan {
  surgeryType: string; // PKP, DALK, DSEK, DMEK
  indication: string;
  surgeryDate: string;
  surgeon: string;
  anesthesia: string;
  graftSize: number; // mm
  hostSize: number; // mm
  sutureType: string;
  additionalProcedures: string[];
}

interface PostOpFollow {
  day1: { completed: boolean; date: string; va: string; graftStatus: string; notes: string };
  week1: { completed: boolean; date: string; va: string; graftStatus: string; notes: string };
  month1: { completed: boolean; date: string; va: string; graftStatus: string; sutures: string };
  month3: { completed: boolean; date: string; va: string; refraction: string; rejection: boolean };
  month6: { completed: boolean; date: string; va: string; endothelialCount: number };
  year1: { completed: boolean; date: string; va: string; graftClarity: string };
}

interface KeratoplastyPlanningProps {
  patientId: string;
  cornealCondition: string;
  onSave?: (data: any) => void;
  canEdit?: boolean;
}

export default function KeratoplastyPlanning({
  patientId,
  cornealCondition,
  onSave,
  canEdit = true,
}: KeratoplastyPlanningProps) {
  const [activeEye, setActiveEye] = useState<'OD' | 'OS'>('OD');
  const [surgeryPlanned, setSurgeryPlanned] = useState(true);

  const [donorTissue, setDonorTissue] = useState<DonorTissue>({
    tissueId: 'KPT-2026-0147',
    donorAge: 42,
    deathToDonation: 6,
    endothelialCellCount: 2850,
    tissueDiameter: 8.5,
    preservationMethod: 'Optisol-GS',
    expiryDate: '2026-02-10',
    tissueBank: 'National Eye Bank',
  });

  const [preOpAssessment, setPreOpAssessment] = useState<PreOpAssessment>({
    va: '6/60',
    iop: 14,
    cornealThickness: 625,
    anteriorChamberDepth: 2.8,
    lensStatus: 'Phakic (clear lens)',
    retinalStatus: 'Normal on B-scan',
    contraindications: [],
  });

  const [surgeryPlan, setSurgeryPlan] = useState<SurgeryPlan>({
    surgeryType: 'PKP (Penetrating Keratoplasty)',
    indication: "Fuchs' Endothelial Dystrophy with corneal edema",
    surgeryDate: '2026-02-05',
    surgeon: 'Dr. Sharma',
    anesthesia: 'General Anesthesia',
    graftSize: 8.0,
    hostSize: 7.75,
    sutureType: '10-0 Nylon interrupted + running',
    additionalProcedures: [],
  });

  const [postOpFollow, setPostOpFollow] = useState<PostOpFollow>({
    day1: { completed: false, date: '', va: '', graftStatus: '', notes: '' },
    week1: { completed: false, date: '', va: '', graftStatus: '', notes: '' },
    month1: { completed: false, date: '', va: '', graftStatus: '', sutures: '' },
    month3: { completed: false, date: '', va: '', refraction: '', rejection: false },
    month6: { completed: false, date: '', va: '', endothelialCount: 0 },
    year1: { completed: false, date: '', va: '', graftClarity: '' },
  });

  // Assess donor tissue quality
  const assessDonorQuality = (): { grade: string; color: string; notes: string } => {
    const { endothelialCellCount, donorAge, deathToDonation } = donorTissue;

    if (endothelialCellCount >= 2500 && donorAge < 60 && deathToDonation <= 12) {
      return {
        grade: 'Excellent',
        color: 'text-green-700 bg-green-50 border-green-300',
        notes: 'Optimal donor tissue parameters',
      };
    } else if (endothelialCellCount >= 2000 && donorAge < 75 && deathToDonation <= 24) {
      return {
        grade: 'Good',
        color: 'text-blue-700 bg-blue-50 border-blue-300',
        notes: 'Acceptable donor tissue',
      };
    } else if (endothelialCellCount >= 1500) {
      return {
        grade: 'Fair',
        color: 'text-yellow-700 bg-yellow-50 border-yellow-300',
        notes: 'Marginal tissue - higher failure risk',
      };
    } else {
      return {
        grade: 'Poor',
        color: 'text-red-700 bg-red-50 border-red-300',
        notes: 'Suboptimal tissue - consider alternative donor',
      };
    }
  };

  const donorQuality = assessDonorQuality();

  // Recommend surgery type based on condition
  const recommendSurgeryType = (): string => {
    const condition = cornealCondition.toLowerCase();

    if (condition.includes('fuchs') || condition.includes('endothelial')) {
      return 'DSEK/DMEK - Selective endothelial replacement (faster recovery, less astigmatism)';
    } else if (condition.includes('keratoconus') && condition.includes('advanced')) {
      return 'DALK - Deep Anterior Lamellar (preserves endothelium, no rejection risk)';
    } else if (condition.includes('scar') || condition.includes('dystrophy')) {
      return 'PKP - Full thickness replacement (standard approach)';
    } else {
      return 'PKP - Penetrating Keratoplasty (full thickness)';
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave({ donorTissue, preOpAssessment, surgeryPlan, postOpFollow });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gray-900">Keratoplasty Planning</h3>
        <p className="text-sm text-gray-600">Corneal transplant surgery planning and tracking</p>
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

      {/* Surgery Type Recommendation */}
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FileText className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-lg font-bold text-purple-900 mb-2">
              Recommended Surgery Type
            </h4>
            <p className="text-sm text-purple-800">{recommendSurgeryType()}</p>
          </div>
        </div>
      </div>

      {/* Surgical Indication */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">Surgical Indication</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Surgery Type</label>
            <select
              value={surgeryPlan.surgeryType}
              onChange={(e) =>
                setSurgeryPlan((prev) => ({ ...prev, surgeryType: e.target.value }))
              }
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option>PKP (Penetrating Keratoplasty)</option>
              <option>DALK (Deep Anterior Lamellar Keratoplasty)</option>
              <option>DSEK (Descemet's Stripping Endothelial Keratoplasty)</option>
              <option>DMEK (Descemet's Membrane Endothelial Keratoplasty)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Indication</label>
            <input
              type="text"
              value={surgeryPlan.indication}
              onChange={(e) =>
                setSurgeryPlan((prev) => ({ ...prev, indication: e.target.value }))
              }
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Surgery Date</label>
            <input
              type="date"
              value={surgeryPlan.surgeryDate}
              onChange={(e) =>
                setSurgeryPlan((prev) => ({ ...prev, surgeryDate: e.target.value }))
              }
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Surgeon</label>
            <input
              type="text"
              value={surgeryPlan.surgeon}
              onChange={(e) =>
                setSurgeryPlan((prev) => ({ ...prev, surgeon: e.target.value }))
              }
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Donor Tissue Details */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Eye className="w-5 h-5 text-blue-600" />
          <span>Donor Tissue Details</span>
        </h4>

        {/* Donor Quality Badge */}
        <div className={`mb-4 p-4 rounded-lg border-2 ${donorQuality.color}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Tissue Quality</p>
              <p className="text-2xl font-bold">{donorQuality.grade}</p>
            </div>
            <p className="text-sm">{donorQuality.notes}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Tissue ID</p>
            <p className="text-lg font-bold text-blue-900">{donorTissue.tissueId}</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Donor Age</p>
            <p className="text-2xl font-bold text-purple-900">{donorTissue.donorAge} years</p>
            <p className="text-xs text-gray-600">Ideal: &lt;60 years</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Death to Donation</p>
            <p className="text-2xl font-bold text-green-900">{donorTissue.deathToDonation} hours</p>
            <p className="text-xs text-gray-600">Ideal: &lt;12 hours</p>
          </div>

          <div
            className={`p-4 rounded-lg ${
              donorTissue.endothelialCellCount >= 2500 ? 'bg-green-50' : 'bg-yellow-50'
            }`}
          >
            <p className="text-sm text-gray-600 mb-1">Endothelial Cell Count</p>
            <p
              className={`text-2xl font-bold ${
                donorTissue.endothelialCellCount >= 2500 ? 'text-green-900' : 'text-yellow-900'
              }`}
            >
              {donorTissue.endothelialCellCount} cells/mm²
            </p>
            <p className="text-xs text-gray-600">Minimum: 2000, Ideal: &gt;2500</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Tissue Diameter</p>
            <p className="text-2xl font-bold text-blue-900">{donorTissue.tissueDiameter} mm</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Preservation</p>
            <p className="text-lg font-bold text-purple-900">{donorTissue.preservationMethod}</p>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Expiry Date</p>
            <p className="text-lg font-bold text-orange-900">{donorTissue.expiryDate}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg col-span-2">
            <p className="text-sm text-gray-600 mb-1">Tissue Bank</p>
            <p className="text-lg font-bold text-green-900">{donorTissue.tissueBank}</p>
          </div>
        </div>
      </div>

      {/* Pre-Operative Assessment */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">Pre-Operative Assessment</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Visual Acuity</p>
            <p className="text-xl font-bold text-gray-900">{preOpAssessment.va}</p>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">IOP</p>
            <p className="text-xl font-bold text-gray-900">{preOpAssessment.iop} mmHg</p>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Central Pachymetry</p>
            <p className="text-xl font-bold text-gray-900">{preOpAssessment.cornealThickness} μm</p>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">ACD</p>
            <p className="text-xl font-bold text-gray-900">{preOpAssessment.anteriorChamberDepth} mm</p>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg col-span-2">
            <p className="text-sm text-gray-600">Lens Status</p>
            <p className="text-lg font-bold text-gray-900">{preOpAssessment.lensStatus}</p>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg col-span-3">
            <p className="text-sm text-gray-600 mb-2">Retinal Status</p>
            <p className="font-medium text-gray-900">{preOpAssessment.retinalStatus}</p>
          </div>
        </div>

        {preOpAssessment.contraindications.length > 0 && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="font-semibold text-red-900 mb-2">⚠️ Contraindications / Risk Factors:</p>
            <ul className="list-disc ml-5 text-sm text-red-800">
              {preOpAssessment.contraindications.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Surgical Details */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">Surgical Details</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Graft Size (mm)
            </label>
            <input
              type="number"
              step="0.25"
              value={surgeryPlan.graftSize}
              onChange={(e) =>
                setSurgeryPlan((prev) => ({ ...prev, graftSize: parseFloat(e.target.value) || 0 }))
              }
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <p className="text-xs text-gray-600 mt-1">Standard: 7.5-8.5mm</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Host Size (mm)</label>
            <input
              type="number"
              step="0.25"
              value={surgeryPlan.hostSize}
              onChange={(e) =>
                setSurgeryPlan((prev) => ({ ...prev, hostSize: parseFloat(e.target.value) || 0 }))
              }
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <p className="text-xs text-gray-600 mt-1">
              Typically 0.25mm smaller than graft (0.25mm step for myopia, 0.5mm for hyperopia)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Suture Type</label>
            <select
              value={surgeryPlan.sutureType}
              onChange={(e) =>
                setSurgeryPlan((prev) => ({ ...prev, sutureType: e.target.value }))
              }
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option>10-0 Nylon interrupted + running</option>
              <option>10-0 Nylon interrupted only (16 sutures)</option>
              <option>11-0 Nylon continuous</option>
              <option>10-0 Nylon single continuous</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Anesthesia</label>
            <select
              value={surgeryPlan.anesthesia}
              onChange={(e) =>
                setSurgeryPlan((prev) => ({ ...prev, anesthesia: e.target.value }))
              }
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option>General Anesthesia</option>
              <option>Peribulbar Block</option>
              <option>Retrobulbar Block</option>
              <option>Topical + Sedation</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Procedures
          </label>
          <div className="space-y-2">
            {['Cataract extraction + IOL', 'Anterior vitrectomy', 'Synechiolysis', 'Iris repair'].map(
              (proc) => (
                <label key={proc} className="flex items-center space-x-2">
                  <input type="checkbox" className="w-4 h-4 text-purple-600 rounded" />
                  <span className="text-sm text-gray-700">{proc}</span>
                </label>
              )
            )}
          </div>
        </div>
      </div>

      {/* Post-Op Follow-up Schedule */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-green-600" />
          <span>Post-Operative Follow-up Schedule</span>
        </h4>
        <div className="space-y-3">
          {(['day1', 'week1', 'month1', 'month3', 'month6', 'year1'] as const).map((visit) => {
            const visitData = postOpFollow[visit];
            const labels = {
              day1: 'Day 1',
              week1: 'Week 1',
              month1: 'Month 1',
              month3: 'Month 3',
              month6: 'Month 6',
              year1: 'Year 1',
            };

            return (
              <div
                key={visit}
                className={`p-3 rounded-lg border ${
                  visitData.completed ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">{labels[visit]} Post-Op</span>
                  {visitData.completed && <CheckCircle className="w-5 h-5 text-green-600" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-2">
          <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
          <p className="text-sm text-blue-800">
            <strong>Critical Monitoring:</strong> Watch for graft rejection signs (redness, pain,
            decreased vision, photophobia). Day 1 is critical for wound leak, shallow AC, or IOP
            spike. Specular microscopy at 6 months and yearly to monitor endothelial cell loss.
          </p>
        </div>
      </div>

      {/* Clinical Guidelines */}
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
        <h5 className="font-semibold text-purple-900 mb-3">Keratoplasty Success Factors</h5>
        <div className="space-y-2 text-sm text-purple-800">
          <p>
            <strong>PKP Success Rate:</strong> 90% at 1 year, 70-80% at 5 years (varies by
            indication)
          </p>
          <p>
            <strong>DSEK/DMEK:</strong> Faster visual recovery (weeks vs months), less astigmatism,
            stronger wound
          </p>
          <p>
            <strong>Rejection Risk:</strong> Highest in first year (10-20%), treat immediately with
            topical steroids
          </p>
          <p>
            <strong>Suture Removal:</strong> Begin at 3-6 months for PKP, complete removal at 12-18
            months
          </p>
          <p>
            <strong>Immunosuppression:</strong> Topical steroids for 1-2 years minimum, longer for
            high-risk cases
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
            <span>Save Keratoplasty Plan</span>
          </button>
        </div>
      )}
    </div>
  );
}
