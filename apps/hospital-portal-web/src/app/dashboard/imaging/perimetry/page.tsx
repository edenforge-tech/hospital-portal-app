'use client';

import React, { useState } from 'react';
import { 
  Eye, 
  Target,
  Clock,
  Save,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Layers,
  Search,
  TrendingDown,
  Grid3X3,
  Download
} from 'lucide-react';

type TestType = 'humphrey' | 'goldmann' | 'octopus' | 'frequency-doubling';
type Strategy = 'sita-standard' | 'sita-fast' | 'full-threshold' | 'screening';
type EyeSide = 'OD' | 'OS';

interface VisualFieldResult {
  md: number; // Mean Deviation
  psd: number; // Pattern Standard Deviation
  vfi: number; // Visual Field Index (%)
  fovealThreshold: number;
  falsePosRate: number;
  falseNegRate: number;
  fixationLosses: number;
  testDuration: string;
  reliability: 'good' | 'borderline' | 'poor';
}

const mockPatients = [
  { id: 'P001', name: 'Venkatesh Iyer', mrn: 'MRN-2024-001', age: 58, diagnosis: 'Primary Open Angle Glaucoma' },
  { id: 'P002', name: 'Lakshmi Devi', mrn: 'MRN-2024-002', age: 62, diagnosis: 'Suspect Glaucoma' },
  { id: 'P003', name: 'Rajesh Kumar', mrn: 'MRN-2024-003', age: 45, diagnosis: 'Normal Tension Glaucoma' },
];

export default function PerimetryPage() {
  const [selectedPatient, setSelectedPatient] = useState<typeof mockPatients[0] | null>(null);
  const [selectedEye, setSelectedEye] = useState<EyeSide>('OD');
  const [testType, setTestType] = useState<TestType>('humphrey');
  const [strategy, setStrategy] = useState<Strategy>('sita-standard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Mock results
  const mockResults: Record<EyeSide, VisualFieldResult> = {
    OD: {
      md: -4.25,
      psd: 3.82,
      vfi: 89,
      fovealThreshold: 34,
      falsePosRate: 2,
      falseNegRate: 5,
      fixationLosses: 1,
      testDuration: '6:42',
      reliability: 'good'
    },
    OS: {
      md: -7.18,
      psd: 5.91,
      vfi: 78,
      fovealThreshold: 32,
      falsePosRate: 4,
      falseNegRate: 8,
      fixationLosses: 3,
      testDuration: '7:15',
      reliability: 'borderline'
    }
  };

  const currentResult = mockResults[selectedEye];

  const getMDSeverity = (md: number) => {
    if (md > -2) return { label: 'Normal', color: 'text-green-600 bg-green-100' };
    if (md > -6) return { label: 'Mild', color: 'text-yellow-600 bg-yellow-100' };
    if (md > -12) return { label: 'Moderate', color: 'text-orange-600 bg-orange-100' };
    return { label: 'Severe', color: 'text-red-600 bg-red-100' };
  };

  const getReliabilityColor = (reliability: string) => {
    switch (reliability) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'borderline': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Generate mock grayscale pattern for visual field
  const generateVFPattern = () => {
    const pattern = [];
    for (let i = 0; i < 54; i++) {
      const value = Math.floor(Math.random() * 100);
      pattern.push(value);
    }
    return pattern;
  };

  const vfPattern = generateVFPattern();

  const renderPatientSearch = () => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Patient</h2>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or MRN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="space-y-2">
        {mockPatients
          .filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.mrn.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map(patient => (
            <button
              key={patient.id}
              onClick={() => setSelectedPatient(patient)}
              className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">{patient.name}</p>
                  <p className="text-sm text-gray-500">{patient.mrn} • Age: {patient.age}</p>
                </div>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                  {patient.diagnosis}
                </span>
              </div>
            </button>
          ))}
      </div>
    </div>
  );

  const renderTestConfiguration = () => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Configuration</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Eye</label>
          <div className="flex gap-2">
            {(['OD', 'OS'] as EyeSide[]).map(eye => (
              <button
                key={eye}
                onClick={() => setSelectedEye(eye)}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  selectedEye === eye
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {eye} ({eye === 'OD' ? 'Right' : 'Left'})
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
          <select
            value={testType}
            onChange={(e) => setTestType(e.target.value as TestType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="humphrey">Humphrey (HVF 24-2)</option>
            <option value="goldmann">Goldmann Kinetic</option>
            <option value="octopus">Octopus</option>
            <option value="frequency-doubling">FDT (Frequency Doubling)</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Strategy</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'sita-standard', label: 'SITA Standard' },
            { value: 'sita-fast', label: 'SITA Fast' },
            { value: 'full-threshold', label: 'Full Threshold' },
            { value: 'screening', label: 'Screening' }
          ].map(s => (
            <button
              key={s.value}
              onClick={() => setStrategy(s.value as Strategy)}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                strategy === s.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => setShowResults(true)}
        className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2"
      >
        <Target className="w-5 h-5" />
        Start Test / Load Results
      </button>
    </div>
  );

  const renderResults = () => (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Visual Field Results - {selectedEye}
            </h3>
            <p className="text-sm text-gray-500">
              {testType.toUpperCase()} • {strategy.replace('-', ' ').toUpperCase()} • Duration: {currentResult.testDuration}
            </p>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getReliabilityColor(currentResult.reliability)}`}>
              {currentResult.reliability.toUpperCase()} Reliability
            </span>
          </div>
        </div>

        {/* Key Indices */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Mean Deviation (MD)</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-gray-900">{currentResult.md} dB</p>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getMDSeverity(currentResult.md).color}`}>
                {getMDSeverity(currentResult.md).label}
              </span>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Pattern SD (PSD)</p>
            <p className="text-2xl font-bold text-gray-900">{currentResult.psd} dB</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">VFI</p>
            <p className="text-2xl font-bold text-gray-900">{currentResult.vfi}%</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Foveal Threshold</p>
            <p className="text-2xl font-bold text-gray-900">{currentResult.fovealThreshold} dB</p>
          </div>
        </div>
      </div>

      {/* Visual Field Map */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-gray-500" />
            Grayscale Pattern
          </h4>
          <div className="aspect-square bg-black rounded-lg p-4">
            <div className="grid grid-cols-9 gap-1 h-full">
              {vfPattern.map((value, idx) => (
                <div
                  key={idx}
                  className="rounded-sm"
                  style={{
                    backgroundColor: `rgb(${Math.floor(value * 2.55)}, ${Math.floor(value * 2.55)}, ${Math.floor(value * 2.55)})`
                  }}
                />
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Lighter = Better sensitivity • Darker = Reduced sensitivity
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-gray-500" />
            Pattern Deviation
          </h4>
          <div className="aspect-square bg-gray-100 rounded-lg p-4">
            <div className="grid grid-cols-9 gap-1 h-full">
              {vfPattern.map((value, idx) => {
                const deviation = value - 70;
                const color = deviation > 10 ? 'bg-green-500' : 
                             deviation > -10 ? 'bg-yellow-500' : 
                             deviation > -20 ? 'bg-orange-500' : 'bg-red-500';
                return (
                  <div key={idx} className={`rounded-sm ${color}`} />
                );
              })}
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-2 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded" /> p &lt; 5%</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-500 rounded" /> p &lt; 2%</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-500 rounded" /> p &lt; 1%</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded" /> p &lt; 0.5%</span>
          </div>
        </div>
      </div>

      {/* Reliability Indices */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h4 className="font-medium text-gray-900 mb-4">Reliability Indices</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Fixation Losses</span>
            <span className={`font-medium ${currentResult.fixationLosses > 2 ? 'text-orange-600' : 'text-green-600'}`}>
              {currentResult.fixationLosses}/15 ({Math.round(currentResult.fixationLosses / 15 * 100)}%)
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">False Positive Errors</span>
            <span className={`font-medium ${currentResult.falsePosRate > 15 ? 'text-red-600' : 'text-green-600'}`}>
              {currentResult.falsePosRate}%
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">False Negative Errors</span>
            <span className={`font-medium ${currentResult.falseNegRate > 20 ? 'text-red-600' : 'text-green-600'}`}>
              {currentResult.falseNegRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
          <Save className="w-5 h-5" />
          Save Results
        </button>
        <button className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2">
          <Download className="w-5 h-5" />
          Export PDF
        </button>
        <button
          onClick={() => setShowResults(false)}
          className="py-3 px-6 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
        >
          New Test
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Automated Perimetry</h1>
          </div>
          <p className="text-gray-500">Visual Field Testing - Humphrey/Goldmann for Glaucoma Screening & Monitoring</p>
        </div>

        {!selectedPatient ? (
          renderPatientSearch()
        ) : (
          <div className="space-y-6">
            {/* Patient Banner */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedPatient.name}</p>
                  <p className="text-sm text-gray-500">{selectedPatient.mrn} • Age: {selectedPatient.age}</p>
                  <p className="text-xs text-purple-600">{selectedPatient.diagnosis}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedPatient(null);
                  setShowResults(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Change Patient
              </button>
            </div>

            {!showResults ? (
              renderTestConfiguration()
            ) : (
              renderResults()
            )}
          </div>
        )}
      </div>
    </div>
  );
}

