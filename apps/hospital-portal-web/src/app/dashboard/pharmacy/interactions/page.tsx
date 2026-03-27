'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Shield, 
  Pill,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Plus,
  FileText,
  Clock,
  User,
  Activity,
  List,
  Filter,
  Download,
  RefreshCw,
  Zap,
  Heart,
  Brain,
  Eye,
  Droplets
} from 'lucide-react';

// Types
interface Drug {
  id: string;
  name: string;
  genericName: string;
  class: string;
  route: string;
}

interface DrugInteraction {
  id: string;
  drug1: Drug;
  drug2: Drug;
  severity: 'contraindicated' | 'major' | 'moderate' | 'minor';
  mechanism: string;
  clinicalEffect: string;
  management: string;
  documentation: 'excellent' | 'good' | 'fair';
}

interface PatientMedication {
  id: string;
  patientName: string;
  mrn: string;
  age: number;
  currentMedications: Drug[];
  newPrescription?: Drug;
  interactions: DrugInteraction[];
  checkedAt: string;
  checkedBy: string;
}

// Mock Data
const commonDrugs: Drug[] = [
  { id: 'D001', name: 'Timolol 0.5%', genericName: 'Timolol Maleate', class: 'Beta Blocker', route: 'Ophthalmic' },
  { id: 'D002', name: 'Latanoprost 0.005%', genericName: 'Latanoprost', class: 'Prostaglandin Analog', route: 'Ophthalmic' },
  { id: 'D003', name: 'Prednisolone 1%', genericName: 'Prednisolone Acetate', class: 'Corticosteroid', route: 'Ophthalmic' },
  { id: 'D004', name: 'Moxifloxacin 0.5%', genericName: 'Moxifloxacin', class: 'Fluoroquinolone', route: 'Ophthalmic' },
  { id: 'D005', name: 'Pilocarpine 2%', genericName: 'Pilocarpine HCl', class: 'Miotic', route: 'Ophthalmic' },
  { id: 'D006', name: 'Brimonidine 0.2%', genericName: 'Brimonidine Tartrate', class: 'Alpha Agonist', route: 'Ophthalmic' },
  { id: 'D007', name: 'Dorzolamide 2%', genericName: 'Dorzolamide HCl', class: 'CAI', route: 'Ophthalmic' },
  { id: 'D008', name: 'Atenolol 50mg', genericName: 'Atenolol', class: 'Beta Blocker', route: 'Oral' },
  { id: 'D009', name: 'Metformin 500mg', genericName: 'Metformin HCl', class: 'Antidiabetic', route: 'Oral' },
  { id: 'D010', name: 'Warfarin 5mg', genericName: 'Warfarin Sodium', class: 'Anticoagulant', route: 'Oral' },
  { id: 'D011', name: 'Aspirin 75mg', genericName: 'Acetylsalicylic Acid', class: 'Antiplatelet', route: 'Oral' },
  { id: 'D012', name: 'Amlodipine 5mg', genericName: 'Amlodipine Besylate', class: 'CCB', route: 'Oral' }
];

const mockInteractions: DrugInteraction[] = [
  {
    id: 'INT001',
    drug1: commonDrugs[0], // Timolol
    drug2: commonDrugs[7], // Atenolol
    severity: 'major',
    mechanism: 'Additive beta-blocking effects',
    clinicalEffect: 'Increased risk of bradycardia, hypotension, and AV block. Combined ophthalmic and systemic beta-blockers can cause significant cardiovascular effects.',
    management: 'Monitor heart rate and blood pressure. Consider alternative glaucoma therapy (prostaglandin, alpha agonist). If combination necessary, start with lower doses.',
    documentation: 'excellent'
  },
  {
    id: 'INT002',
    drug1: commonDrugs[2], // Prednisolone
    drug2: commonDrugs[8], // Metformin
    severity: 'moderate',
    mechanism: 'Corticosteroids may increase blood glucose levels',
    clinicalEffect: 'Systemic absorption of ophthalmic corticosteroids can elevate blood glucose, potentially reducing efficacy of antidiabetic medications.',
    management: 'Monitor blood glucose more frequently. Adjust antidiabetic dosage if needed. Usually minimal with short-term ophthalmic use.',
    documentation: 'good'
  },
  {
    id: 'INT003',
    drug1: commonDrugs[3], // Moxifloxacin
    drug2: commonDrugs[9], // Warfarin
    severity: 'moderate',
    mechanism: 'Fluoroquinolones may enhance anticoagulant effect',
    clinicalEffect: 'Potential increase in INR and bleeding risk. Ophthalmic absorption is minimal but caution warranted in anticoagulated patients.',
    management: 'Monitor INR more frequently during concomitant use. Watch for signs of bleeding.',
    documentation: 'fair'
  },
  {
    id: 'INT004',
    drug1: commonDrugs[5], // Brimonidine
    drug2: { id: 'D013', name: 'MAO Inhibitors', genericName: 'Various', class: 'Antidepressant', route: 'Oral' },
    severity: 'contraindicated',
    mechanism: 'MAO inhibitors interfere with metabolism of alpha agonists',
    clinicalEffect: 'Risk of severe hypertensive crisis. Concurrent use is contraindicated.',
    management: 'Do NOT use brimonidine in patients on MAO inhibitors. Use alternative glaucoma therapy.',
    documentation: 'good'
  },
  {
    id: 'INT005',
    drug1: commonDrugs[10], // Aspirin
    drug2: commonDrugs[9], // Warfarin
    severity: 'major',
    mechanism: 'Additive anticoagulant/antiplatelet effects',
    clinicalEffect: 'Significantly increased risk of bleeding, including GI and intracranial hemorrhage.',
    management: 'Avoid combination unless specifically indicated (e.g., mechanical heart valve). If used together, monitor closely for bleeding.',
    documentation: 'excellent'
  }
];

const mockPatientChecks: PatientMedication[] = [
  {
    id: 'PC001',
    patientName: 'Ravi Kumar',
    mrn: 'MRN-2024-4001',
    age: 65,
    currentMedications: [commonDrugs[7], commonDrugs[8]], // Atenolol, Metformin
    newPrescription: commonDrugs[0], // Timolol
    interactions: [mockInteractions[0]],
    checkedAt: '2026-01-28 09:30',
    checkedBy: 'Dr. Priya Sharma'
  },
  {
    id: 'PC002',
    patientName: 'Lakshmi Narayanan',
    mrn: 'MRN-2024-4002',
    age: 58,
    currentMedications: [commonDrugs[9], commonDrugs[10]], // Warfarin, Aspirin
    newPrescription: commonDrugs[3], // Moxifloxacin
    interactions: [mockInteractions[2], mockInteractions[4]],
    checkedAt: '2026-01-28 10:15',
    checkedBy: 'Dr. Amit Verma'
  },
  {
    id: 'PC003',
    patientName: 'Gopal Menon',
    mrn: 'MRN-2024-4003',
    age: 70,
    currentMedications: [commonDrugs[8], commonDrugs[11]], // Metformin, Amlodipine
    newPrescription: commonDrugs[2], // Prednisolone
    interactions: [mockInteractions[1]],
    checkedAt: '2026-01-28 11:00',
    checkedBy: 'Dr. Kavita Singh'
  }
];

// Helper Functions
const getSeverityColor = (severity: string) => {
  const colors: Record<string, string> = {
    'contraindicated': 'bg-red-600 text-white',
    'major': 'bg-orange-500 text-white',
    'moderate': 'bg-yellow-500 text-white',
    'minor': 'bg-blue-500 text-white'
  };
  return colors[severity] || 'bg-gray-500 text-white';
};

const getSeverityBorder = (severity: string) => {
  const colors: Record<string, string> = {
    'contraindicated': 'border-red-500 bg-red-50',
    'major': 'border-orange-500 bg-orange-50',
    'moderate': 'border-yellow-500 bg-yellow-50',
    'minor': 'border-blue-500 bg-blue-50'
  };
  return colors[severity] || 'border-gray-300 bg-gray-50';
};

const getSeverityIcon = (severity: string) => {
  switch(severity) {
    case 'contraindicated': return <XCircle className="h-5 w-5 text-red-600" />;
    case 'major': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
    case 'moderate': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    case 'minor': return <Info className="h-5 w-5 text-blue-600" />;
    default: return <Info className="h-5 w-5 text-gray-600" />;
  }
};

export default function DrugInteractionPage() {
  const [activeTab, setActiveTab] = useState<'checker' | 'database' | 'alerts'>('checker');
  const [searchDrug1, setSearchDrug1] = useState('');
  const [searchDrug2, setSearchDrug2] = useState('');
  const [selectedDrug1, setSelectedDrug1] = useState<Drug | null>(null);
  const [selectedDrug2, setSelectedDrug2] = useState<Drug | null>(null);
  const [checkResult, setCheckResult] = useState<DrugInteraction | null>(null);
  const [expandedInteraction, setExpandedInteraction] = useState<string | null>(null);
  const [showDrugDropdown1, setShowDrugDropdown1] = useState(false);
  const [showDrugDropdown2, setShowDrugDropdown2] = useState(false);

  const filteredDrugs1 = commonDrugs.filter(d => 
    d.name.toLowerCase().includes(searchDrug1.toLowerCase()) ||
    d.genericName.toLowerCase().includes(searchDrug1.toLowerCase())
  );

  const filteredDrugs2 = commonDrugs.filter(d => 
    d.name.toLowerCase().includes(searchDrug2.toLowerCase()) ||
    d.genericName.toLowerCase().includes(searchDrug2.toLowerCase())
  );

  const handleCheckInteraction = () => {
    if (selectedDrug1 && selectedDrug2) {
      // Find matching interaction
      const found = mockInteractions.find(i => 
        (i.drug1.id === selectedDrug1.id && i.drug2.id === selectedDrug2.id) ||
        (i.drug1.id === selectedDrug2.id && i.drug2.id === selectedDrug1.id)
      );
      setCheckResult(found || null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-7 w-7 text-blue-600" />
            Drug Interaction Checker
          </h1>
          <p className="text-gray-600 mt-1">
            Check for drug-drug interactions and contraindications
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Update Database
          </button>
          <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Drugs in DB</p>
              <p className="text-2xl font-bold text-gray-900">2,450</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Pill className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Interactions</p>
              <p className="text-2xl font-bold text-gray-900">18,200</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Alerts Today</p>
              <p className="text-2xl font-bold text-orange-600">12</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Contraindicated</p>
              <p className="text-2xl font-bold text-red-600">2</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Checks Today</p>
              <p className="text-2xl font-bold text-green-600">156</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'checker', label: 'Interaction Checker', icon: <Zap className="h-4 w-4" /> },
              { id: 'database', label: 'Interaction Database', icon: <List className="h-4 w-4" /> },
              { id: 'alerts', label: 'Recent Alerts', icon: <AlertTriangle className="h-4 w-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Interaction Checker Tab */}
        {activeTab === 'checker' && (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              {/* Drug Selection */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Check Drug Interaction</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Drug 1 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Drug 1</label>
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search drug..."
                          value={searchDrug1}
                          onChange={(e) => {
                            setSearchDrug1(e.target.value);
                            setShowDrugDropdown1(true);
                            setSelectedDrug1(null);
                          }}
                          onFocus={() => setShowDrugDropdown1(true)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      {showDrugDropdown1 && searchDrug1 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredDrugs1.map(drug => (
                            <button
                              key={drug.id}
                              onClick={() => {
                                setSelectedDrug1(drug);
                                setSearchDrug1(drug.name);
                                setShowDrugDropdown1(false);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                            >
                              <p className="font-medium text-gray-900">{drug.name}</p>
                              <p className="text-sm text-gray-500">{drug.genericName} • {drug.class}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {selectedDrug1 && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="font-medium text-blue-800">{selectedDrug1.name}</p>
                        <p className="text-sm text-blue-600">{selectedDrug1.genericName}</p>
                        <p className="text-xs text-blue-500 mt-1">{selectedDrug1.class} • {selectedDrug1.route}</p>
                      </div>
                    )}
                  </div>

                  {/* Drug 2 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Drug 2</label>
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search drug..."
                          value={searchDrug2}
                          onChange={(e) => {
                            setSearchDrug2(e.target.value);
                            setShowDrugDropdown2(true);
                            setSelectedDrug2(null);
                          }}
                          onFocus={() => setShowDrugDropdown2(true)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      {showDrugDropdown2 && searchDrug2 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredDrugs2.map(drug => (
                            <button
                              key={drug.id}
                              onClick={() => {
                                setSelectedDrug2(drug);
                                setSearchDrug2(drug.name);
                                setShowDrugDropdown2(false);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                            >
                              <p className="font-medium text-gray-900">{drug.name}</p>
                              <p className="text-sm text-gray-500">{drug.genericName} • {drug.class}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {selectedDrug2 && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="font-medium text-blue-800">{selectedDrug2.name}</p>
                        <p className="text-sm text-blue-600">{selectedDrug2.genericName}</p>
                        <p className="text-xs text-blue-500 mt-1">{selectedDrug2.class} • {selectedDrug2.route}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={handleCheckInteraction}
                    disabled={!selectedDrug1 || !selectedDrug2}
                    className={`px-8 py-3 rounded-lg font-medium text-white flex items-center gap-2 mx-auto ${
                      selectedDrug1 && selectedDrug2
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Zap className="h-5 w-5" />
                    Check Interaction
                  </button>
                </div>
              </div>

              {/* Result */}
              {selectedDrug1 && selectedDrug2 && (
                <div className="mt-6">
                  {checkResult ? (
                    <div className={`rounded-xl border-2 p-6 ${getSeverityBorder(checkResult.severity)}`}>
                      <div className="flex items-start gap-4">
                        {getSeverityIcon(checkResult.severity)}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">Interaction Found</h4>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(checkResult.severity)}`}>
                              {checkResult.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-4">
                            <span className="font-medium">{checkResult.drug1.name}</span>
                            {' + '}
                            <span className="font-medium">{checkResult.drug2.name}</span>
                          </p>

                          <div className="space-y-4">
                            <div>
                              <h5 className="text-sm font-semibold text-gray-700 mb-1">Mechanism</h5>
                              <p className="text-gray-600">{checkResult.mechanism}</p>
                            </div>
                            <div>
                              <h5 className="text-sm font-semibold text-gray-700 mb-1">Clinical Effect</h5>
                              <p className="text-gray-600">{checkResult.clinicalEffect}</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h5 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                                <Shield className="h-4 w-4 text-blue-600" />
                                Management Recommendation
                              </h5>
                              <p className="text-gray-600">{checkResult.management}</p>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>Documentation: <span className="font-medium capitalize">{checkResult.documentation}</span></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 rounded-xl border-2 border-green-200 p-6">
                      <div className="flex items-center gap-4">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                        <div>
                          <h4 className="text-lg font-semibold text-green-800">No Interaction Found</h4>
                          <p className="text-green-600 mt-1">
                            No known clinically significant interaction between these medications.
                          </p>
                          <p className="text-sm text-green-500 mt-2">
                            Note: Always consider patient-specific factors and consult references for complete information.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Reference */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Severity Levels</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="font-semibold text-red-800">Contraindicated</span>
                    </div>
                    <p className="text-sm text-red-600">Combination should never be used. Risk outweighs any benefit.</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <span className="font-semibold text-orange-800">Major</span>
                    </div>
                    <p className="text-sm text-orange-600">Significant clinical risk. Avoid combination or use with close monitoring.</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <span className="font-semibold text-yellow-800">Moderate</span>
                    </div>
                    <p className="text-sm text-yellow-600">Use with caution. May require dose adjustment or monitoring.</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-blue-800">Minor</span>
                    </div>
                    <p className="text-sm text-blue-600">Limited clinical significance. Usually safe to use together.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Database Tab */}
        {activeTab === 'database' && (
          <div className="p-6">
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search interactions by drug name..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <select className="px-4 py-2 border border-gray-200 rounded-lg">
                <option value="all">All Severities</option>
                <option value="contraindicated">Contraindicated</option>
                <option value="major">Major</option>
                <option value="moderate">Moderate</option>
                <option value="minor">Minor</option>
              </select>
              <select className="px-4 py-2 border border-gray-200 rounded-lg">
                <option value="all">All Drug Classes</option>
                <option value="ophthalmic">Ophthalmic</option>
                <option value="cardiovascular">Cardiovascular</option>
                <option value="anticoagulant">Anticoagulants</option>
              </select>
            </div>

            <div className="space-y-3">
              {mockInteractions.map(interaction => (
                <div key={interaction.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div 
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedInteraction(expandedInteraction === interaction.id ? null : interaction.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getSeverityIcon(interaction.severity)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{interaction.drug1.name}</span>
                            <span className="text-gray-400">+</span>
                            <span className="font-medium text-gray-900">{interaction.drug2.name}</span>
                          </div>
                          <p className="text-sm text-gray-500">{interaction.mechanism}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(interaction.severity)}`}>
                          {interaction.severity}
                        </span>
                        {expandedInteraction === interaction.id ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  {expandedInteraction === interaction.id && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-semibold text-gray-700 mb-1">Clinical Effect</h5>
                          <p className="text-sm text-gray-600">{interaction.clinicalEffect}</p>
                        </div>
                        <div>
                          <h5 className="text-sm font-semibold text-gray-700 mb-1">Management</h5>
                          <p className="text-sm text-gray-600">{interaction.management}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                        <span>Documentation: <span className="font-medium capitalize">{interaction.documentation}</span></span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="p-6">
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by patient name or MRN..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <input
                type="date"
                defaultValue="2026-01-28"
                className="px-4 py-2 border border-gray-200 rounded-lg"
              />
            </div>

            <div className="space-y-4">
              {mockPatientChecks.map(check => (
                <div key={check.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-full">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{check.patientName}</p>
                        <p className="text-sm text-gray-500">{check.mrn} • {check.age} years</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{check.checkedAt}</p>
                      <p className="text-xs text-gray-500">by {check.checkedBy}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Pill className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Current Medications:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {check.currentMedications.map(med => (
                        <span key={med.id} className="px-2 py-1 bg-white border border-gray-200 rounded text-sm text-gray-700">
                          {med.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {check.newPrescription && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">New Prescription:</span>
                        <span className="text-sm text-blue-800">{check.newPrescription.name}</span>
                      </div>
                    </div>
                  )}

                  {check.interactions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Interactions Detected:</p>
                      <div className="space-y-2">
                        {check.interactions.map(int => (
                          <div key={int.id} className={`p-3 rounded-lg border-l-4 ${getSeverityBorder(int.severity)}`}>
                            <div className="flex items-center gap-2 mb-1">
                              {getSeverityIcon(int.severity)}
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(int.severity)}`}>
                                {int.severity}
                              </span>
                              <span className="text-sm font-medium text-gray-800">
                                {int.drug1.name} + {int.drug2.name}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 ml-7">{int.mechanism}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
