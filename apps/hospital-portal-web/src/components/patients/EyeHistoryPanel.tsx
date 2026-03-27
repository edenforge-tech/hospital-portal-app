'use client';

import { useState, useEffect } from 'react';
import { Eye, TrendingUp, TrendingDown, AlertTriangle, Activity, Calendar, FileText } from 'lucide-react';

// ============================================================================
// INTERFACES
// ============================================================================

interface VisualAcuityRecord {
  id: string;
  date: string;
  rightEye: { uncorrected: string; corrected: string };
  leftEye: { uncorrected: string; corrected: string };
  method: string; // Snellen, LogMAR, ETDRS
}

interface IOPRecord {
  id: string;
  date: string;
  rightEye: number;
  leftEye: number;
  method: string; // Goldmann, NCT, iCare
  pachymetryOD?: number;
  pachymetryOS?: number;
}

interface RefractionRecord {
  id: string;
  date: string;
  rightEye: { sphere: number; cylinder: number; axis: number; add?: number };
  leftEye: { sphere: number; cylinder: number; axis: number; add?: number };
  pd: number;
  type: string; // manifest, cycloplegic
}

interface DRGradingRecord {
  id: string;
  date: string;
  rightEye: { dr: string; dme: boolean; laser: boolean };
  leftEye: { dr: string; dme: boolean; laser: boolean };
  hba1c?: number;
  recommendation: string;
}

interface SurgeryRecord {
  id: string;
  date: string;
  eye: 'OD' | 'OS' | 'OU';
  procedure: string;
  surgeon: string;
  iol?: { model: string; power: string };
  outcome: string;
  complications?: string;
}

interface FundusRecord {
  id: string;
  date: string;
  rightEye: {
    opticDisc: string;
    cdRatio: string;
    macula: string;
    vessels: string;
    periphery: string;
  };
  leftEye: {
    opticDisc: string;
    cdRatio: string;
    macula: string;
    vessels: string;
    periphery: string;
  };
}

interface Props {
  patientId: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockVARecords: VisualAcuityRecord[] = [
  {
    id: '1',
    date: '2026-01-28',
    rightEye: { uncorrected: '6/36', corrected: '6/9' },
    leftEye: { uncorrected: '6/24', corrected: '6/6' },
    method: 'Snellen'
  },
  {
    id: '2',
    date: '2025-10-15',
    rightEye: { uncorrected: '6/24', corrected: '6/6' },
    leftEye: { uncorrected: '6/18', corrected: '6/6' },
    method: 'Snellen'
  },
  {
    id: '3',
    date: '2025-07-01',
    rightEye: { uncorrected: '6/18', corrected: '6/6' },
    leftEye: { uncorrected: '6/12', corrected: '6/6' },
    method: 'Snellen'
  }
];

const mockIOPRecords: IOPRecord[] = [
  { id: '1', date: '2026-01-28', rightEye: 18, leftEye: 16, method: 'Goldmann', pachymetryOD: 545, pachymetryOS: 548 },
  { id: '2', date: '2025-10-15', rightEye: 16, leftEye: 15, method: 'NCT' },
  { id: '3', date: '2025-07-01', rightEye: 14, leftEye: 14, method: 'NCT' },
  { id: '4', date: '2025-04-10', rightEye: 15, leftEye: 16, method: 'Goldmann' },
  { id: '5', date: '2025-01-05', rightEye: 17, leftEye: 15, method: 'NCT' },
];

const mockRefractionRecords: RefractionRecord[] = [
  {
    id: '1',
    date: '2026-01-28',
    rightEye: { sphere: -2.50, cylinder: -1.25, axis: 180, add: 2.00 },
    leftEye: { sphere: -1.75, cylinder: -0.75, axis: 175, add: 2.00 },
    pd: 64,
    type: 'manifest'
  },
  {
    id: '2',
    date: '2025-01-15',
    rightEye: { sphere: -2.25, cylinder: -1.00, axis: 180, add: 1.75 },
    leftEye: { sphere: -1.50, cylinder: -0.50, axis: 170, add: 1.75 },
    pd: 64,
    type: 'manifest'
  }
];

const mockDRRecords: DRGradingRecord[] = [
  {
    id: '1',
    date: '2026-01-28',
    rightEye: { dr: 'Moderate NPDR', dme: true, laser: false },
    leftEye: { dr: 'Mild NPDR', dme: false, laser: false },
    hba1c: 7.8,
    recommendation: 'Anti-VEGF injection recommended for OD. Review in 3 months.'
  },
  {
    id: '2',
    date: '2025-07-01',
    rightEye: { dr: 'Mild NPDR', dme: false, laser: false },
    leftEye: { dr: 'No DR', dme: false, laser: false },
    hba1c: 7.2,
    recommendation: 'Good control. Continue current management. Review in 6 months.'
  }
];

const mockSurgeries: SurgeryRecord[] = [
  {
    id: '1',
    date: '2024-03-15',
    eye: 'OS',
    procedure: 'Phacoemulsification + PCIOL',
    surgeon: 'Dr. Rajesh Kumar',
    iol: { model: 'Acrysof IQ SN60WF', power: '+21.0D' },
    outcome: 'Uneventful, BCVA 6/6'
  },
  {
    id: '2',
    date: '2020-08-22',
    eye: 'OD',
    procedure: 'YAG Laser Capsulotomy',
    surgeon: 'Dr. Priya Sharma',
    outcome: 'Successful, vision improved'
  }
];

const mockFundusRecords: FundusRecord[] = [
  {
    id: '1',
    date: '2026-01-28',
    rightEye: {
      opticDisc: 'Pink, healthy margins',
      cdRatio: '0.4',
      macula: 'DME present, hard exudates',
      vessels: 'Microaneurysms, dot hemorrhages',
      periphery: 'Clear'
    },
    leftEye: {
      opticDisc: 'Pink, healthy margins',
      cdRatio: '0.3',
      macula: 'Normal foveal reflex',
      vessels: 'Few microaneurysms',
      periphery: 'Clear'
    }
  }
];

// ============================================================================
// COMPONENT
// ============================================================================

export function EyeHistoryPanel({ patientId }: Props) {
  const [activeSection, setActiveSection] = useState<'va' | 'iop' | 'refraction' | 'dr' | 'surgery' | 'fundus'>('va');
  const [vaRecords, setVARecords] = useState<VisualAcuityRecord[]>(mockVARecords);
  const [iopRecords, setIOPRecords] = useState<IOPRecord[]>(mockIOPRecords);
  const [refractionRecords, setRefractionRecords] = useState<RefractionRecord[]>(mockRefractionRecords);
  const [drRecords, setDRRecords] = useState<DRGradingRecord[]>(mockDRRecords);
  const [surgeries, setSurgeries] = useState<SurgeryRecord[]>(mockSurgeries);
  const [fundusRecords, setFundusRecords] = useState<FundusRecord[]>(mockFundusRecords);

  // Calculate trends
  const getIOPTrend = () => {
    if (iopRecords.length < 2) return 'stable';
    const recent = (iopRecords[0].rightEye + iopRecords[0].leftEye) / 2;
    const previous = (iopRecords[1].rightEye + iopRecords[1].leftEye) / 2;
    if (recent > previous + 2) return 'increasing';
    if (recent < previous - 2) return 'decreasing';
    return 'stable';
  };

  const getVATrend = () => {
    if (vaRecords.length < 2) return 'stable';
    // Simple comparison - in reality would use LogMAR values
    const recent = vaRecords[0].rightEye.corrected;
    const previous = vaRecords[1].rightEye.corrected;
    if (recent > previous) return 'declining'; // Higher fraction = worse vision
    if (recent < previous) return 'improving';
    return 'stable';
  };

  const formatRefraction = (r: { sphere: number; cylinder: number; axis: number; add?: number }) => {
    const sph = r.sphere >= 0 ? `+${r.sphere.toFixed(2)}` : r.sphere.toFixed(2);
    const cyl = r.cylinder >= 0 ? `+${r.cylinder.toFixed(2)}` : r.cylinder.toFixed(2);
    let str = `${sph} / ${cyl} x ${r.axis}°`;
    if (r.add) str += ` Add ${r.add > 0 ? '+' : ''}${r.add.toFixed(2)}`;
    return str;
  };

  const getDRBadgeColor = (grade: string) => {
    switch (grade) {
      case 'No DR': return 'bg-green-100 text-green-800';
      case 'Mild NPDR': return 'bg-yellow-100 text-yellow-800';
      case 'Moderate NPDR': return 'bg-orange-100 text-orange-800';
      case 'Severe NPDR': return 'bg-red-100 text-red-800';
      case 'PDR': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const sections = [
    { id: 'va', label: 'Visual Acuity', icon: Eye, count: vaRecords.length },
    { id: 'iop', label: 'IOP History', icon: Activity, count: iopRecords.length },
    { id: 'refraction', label: 'Refraction', icon: Eye, count: refractionRecords.length },
    { id: 'dr', label: 'DR Grading', icon: AlertTriangle, count: drRecords.length },
    { id: 'surgery', label: 'Surgeries', icon: FileText, count: surgeries.length },
    { id: 'fundus', label: 'Fundus', icon: Eye, count: fundusRecords.length },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Latest VA</span>
          </div>
          <div className="text-lg font-bold text-blue-900">
            OD: {vaRecords[0]?.rightEye.corrected || '-'} / OS: {vaRecords[0]?.leftEye.corrected || '-'}
          </div>
          <div className="flex items-center gap-1 text-xs text-blue-700 mt-1">
            {getVATrend() === 'improving' && <><TrendingUp className="h-3 w-3" /> Improving</>}
            {getVATrend() === 'declining' && <><TrendingDown className="h-3 w-3" /> Declining</>}
            {getVATrend() === 'stable' && 'Stable'}
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Latest IOP</span>
          </div>
          <div className="text-lg font-bold text-green-900">
            OD: {iopRecords[0]?.rightEye || '-'} / OS: {iopRecords[0]?.leftEye || '-'} mmHg
          </div>
          <div className="flex items-center gap-1 text-xs text-green-700 mt-1">
            {getIOPTrend() === 'increasing' && <><TrendingUp className="h-3 w-3 text-red-500" /> Rising</>}
            {getIOPTrend() === 'decreasing' && <><TrendingDown className="h-3 w-3" /> Decreasing</>}
            {getIOPTrend() === 'stable' && 'Stable'}
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">DR Status</span>
          </div>
          <div className="space-y-1">
            <div className={`text-xs px-2 py-0.5 rounded inline-block ${getDRBadgeColor(drRecords[0]?.rightEye.dr || 'No DR')}`}>
              OD: {drRecords[0]?.rightEye.dr || 'No DR'}
            </div>
            <div className={`text-xs px-2 py-0.5 rounded inline-block ml-2 ${getDRBadgeColor(drRecords[0]?.leftEye.dr || 'No DR')}`}>
              OS: {drRecords[0]?.leftEye.dr || 'No DR'}
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">Surgeries</span>
          </div>
          <div className="text-lg font-bold text-orange-900">{surgeries.length}</div>
          <div className="text-xs text-orange-700">
            {surgeries.length > 0 ? `Last: ${new Date(surgeries[0].date).toLocaleDateString()}` : 'No surgeries'}
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 flex-wrap border-b pb-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              activeSection === section.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <section.icon className="h-4 w-4" />
            {section.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeSection === section.id ? 'bg-blue-500' : 'bg-gray-200'
            }`}>
              {section.count}
            </span>
          </button>
        ))}
      </div>

      {/* Section Content */}
      <div className="bg-white rounded-lg border">
        {/* Visual Acuity Section */}
        {activeSection === 'va' && (
          <div className="p-4">
            <h4 className="font-semibold mb-4">Visual Acuity History</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-center">OD Uncorrected</th>
                    <th className="px-4 py-2 text-center">OD Corrected</th>
                    <th className="px-4 py-2 text-center">OS Uncorrected</th>
                    <th className="px-4 py-2 text-center">OS Corrected</th>
                    <th className="px-4 py-2 text-left">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {vaRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{new Date(record.date).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-center font-mono">{record.rightEye.uncorrected}</td>
                      <td className="px-4 py-2 text-center font-mono font-bold text-green-700">{record.rightEye.corrected}</td>
                      <td className="px-4 py-2 text-center font-mono">{record.leftEye.uncorrected}</td>
                      <td className="px-4 py-2 text-center font-mono font-bold text-green-700">{record.leftEye.corrected}</td>
                      <td className="px-4 py-2 text-gray-600">{record.method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* IOP Section */}
        {activeSection === 'iop' && (
          <div className="p-4">
            <h4 className="font-semibold mb-4">Intraocular Pressure History</h4>
            
            {/* IOP Chart - Simple bar representation */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h5 className="text-sm font-medium text-gray-700 mb-3">IOP Trend (Last 5 Readings)</h5>
              <div className="flex items-end gap-2 h-32">
                {iopRecords.slice(0, 5).reverse().map((record, idx) => (
                  <div key={record.id} className="flex-1 flex flex-col items-center gap-1">
                    <div className="flex gap-1 w-full justify-center">
                      <div 
                        className="w-4 bg-blue-500 rounded-t"
                        style={{ height: `${(record.rightEye / 30) * 100}px` }}
                        title={`OD: ${record.rightEye}`}
                      />
                      <div 
                        className="w-4 bg-green-500 rounded-t"
                        style={{ height: `${(record.leftEye / 30) * 100}px` }}
                        title={`OS: ${record.leftEye}`}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-4 mt-2 text-xs">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded" /> OD</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded" /> OS</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-center">OD (mmHg)</th>
                    <th className="px-4 py-2 text-center">OS (mmHg)</th>
                    <th className="px-4 py-2 text-left">Method</th>
                    <th className="px-4 py-2 text-center">CCT OD (μm)</th>
                    <th className="px-4 py-2 text-center">CCT OS (μm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {iopRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{new Date(record.date).toLocaleDateString()}</td>
                      <td className={`px-4 py-2 text-center font-mono font-bold ${record.rightEye > 21 ? 'text-red-600' : 'text-green-700'}`}>
                        {record.rightEye}
                      </td>
                      <td className={`px-4 py-2 text-center font-mono font-bold ${record.leftEye > 21 ? 'text-red-600' : 'text-green-700'}`}>
                        {record.leftEye}
                      </td>
                      <td className="px-4 py-2 text-gray-600">{record.method}</td>
                      <td className="px-4 py-2 text-center text-gray-600">{record.pachymetryOD || '-'}</td>
                      <td className="px-4 py-2 text-center text-gray-600">{record.pachymetryOS || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Refraction Section */}
        {activeSection === 'refraction' && (
          <div className="p-4">
            <h4 className="font-semibold mb-4">Refraction History</h4>
            <div className="space-y-4">
              {refractionRecords.map((record) => (
                <div key={record.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-sm text-gray-500">{new Date(record.date).toLocaleDateString()}</span>
                      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded capitalize">{record.type}</span>
                    </div>
                    <span className="text-sm text-gray-600">PD: {record.pd}mm</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded">
                      <div className="text-xs text-blue-600 font-medium mb-1">Right Eye (OD)</div>
                      <div className="font-mono text-lg">{formatRefraction(record.rightEye)}</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <div className="text-xs text-green-600 font-medium mb-1">Left Eye (OS)</div>
                      <div className="font-mono text-lg">{formatRefraction(record.leftEye)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DR Grading Section */}
        {activeSection === 'dr' && (
          <div className="p-4">
            <h4 className="font-semibold mb-4">Diabetic Retinopathy Tracking</h4>
            <div className="space-y-4">
              {drRecords.map((record) => (
                <div key={record.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{new Date(record.date).toLocaleDateString()}</span>
                    </div>
                    {record.hba1c && (
                      <div className={`px-3 py-1 rounded ${record.hba1c > 7 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        HbA1c: {record.hba1c}%
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-xs text-gray-600 font-medium mb-2">Right Eye (OD)</div>
                      <div className={`inline-block px-3 py-1 rounded text-sm font-medium ${getDRBadgeColor(record.rightEye.dr)}`}>
                        {record.rightEye.dr}
                      </div>
                      <div className="flex gap-2 mt-2">
                        {record.rightEye.dme && (
                          <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded">DME Present</span>
                        )}
                        {record.rightEye.laser && (
                          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded">Laser Done</span>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-xs text-gray-600 font-medium mb-2">Left Eye (OS)</div>
                      <div className={`inline-block px-3 py-1 rounded text-sm font-medium ${getDRBadgeColor(record.leftEye.dr)}`}>
                        {record.leftEye.dr}
                      </div>
                      <div className="flex gap-2 mt-2">
                        {record.leftEye.dme && (
                          <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded">DME Present</span>
                        )}
                        {record.leftEye.laser && (
                          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded">Laser Done</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {record.recommendation && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r">
                      <div className="text-xs text-blue-600 font-medium mb-1">Recommendation</div>
                      <div className="text-sm text-blue-900">{record.recommendation}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Surgeries Section */}
        {activeSection === 'surgery' && (
          <div className="p-4">
            <h4 className="font-semibold mb-4">Surgical History</h4>
            <div className="space-y-4">
              {surgeries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No surgical history</div>
              ) : (
                surgeries.map((surgery) => (
                  <div key={surgery.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h5 className="font-medium text-lg">{surgery.procedure}</h5>
                        <p className="text-sm text-gray-600">{surgery.surgeon}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded text-sm font-medium ${
                          surgery.eye === 'OD' ? 'bg-blue-100 text-blue-800' :
                          surgery.eye === 'OS' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {surgery.eye}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">{new Date(surgery.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {surgery.iol && (
                      <div className="bg-gray-50 p-3 rounded mb-3">
                        <div className="text-xs text-gray-600 font-medium mb-1">IOL Details</div>
                        <div className="text-sm">
                          <span className="font-medium">{surgery.iol.model}</span>
                          <span className="ml-2 text-gray-600">Power: {surgery.iol.power}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs text-gray-500">Outcome:</span>
                        <span className="ml-2 text-sm text-green-700">{surgery.outcome}</span>
                      </div>
                      {surgery.complications && (
                        <span className="text-xs text-red-600">⚠ {surgery.complications}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Fundus Section */}
        {activeSection === 'fundus' && (
          <div className="p-4">
            <h4 className="font-semibold mb-4">Fundus Examination Findings</h4>
            <div className="space-y-4">
              {fundusRecords.map((record) => (
                <div key={record.id} className="border rounded-lg p-4">
                  <div className="mb-4">
                    <span className="text-sm text-gray-500">{new Date(record.date).toLocaleDateString()}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded">
                      <div className="text-sm text-blue-600 font-medium mb-3">Right Eye (OD)</div>
                      <div className="space-y-2 text-sm">
                        <div><span className="text-gray-600">Optic Disc:</span> {record.rightEye.opticDisc}</div>
                        <div><span className="text-gray-600">C/D Ratio:</span> <span className="font-mono">{record.rightEye.cdRatio}</span></div>
                        <div><span className="text-gray-600">Macula:</span> {record.rightEye.macula}</div>
                        <div><span className="text-gray-600">Vessels:</span> {record.rightEye.vessels}</div>
                        <div><span className="text-gray-600">Periphery:</span> {record.rightEye.periphery}</div>
                      </div>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <div className="text-sm text-green-600 font-medium mb-3">Left Eye (OS)</div>
                      <div className="space-y-2 text-sm">
                        <div><span className="text-gray-600">Optic Disc:</span> {record.leftEye.opticDisc}</div>
                        <div><span className="text-gray-600">C/D Ratio:</span> <span className="font-mono">{record.leftEye.cdRatio}</span></div>
                        <div><span className="text-gray-600">Macula:</span> {record.leftEye.macula}</div>
                        <div><span className="text-gray-600">Vessels:</span> {record.leftEye.vessels}</div>
                        <div><span className="text-gray-600">Periphery:</span> {record.leftEye.periphery}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EyeHistoryPanel;
