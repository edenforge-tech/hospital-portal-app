'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Plus,
  Code,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Book,
  List,
  Filter,
  Download,
  Copy,
  Star,
  Clock,
  Tag,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  RefreshCw,
  Eye,
  Stethoscope,
  Heart,
  Activity,
  DollarSign,
  Clipboard,
  History
} from 'lucide-react';

// Types
interface ICDCode {
  code: string;
  description: string;
  category: string;
  chapter: string;
  laterality?: 'bilateral' | 'right' | 'left' | 'unspecified';
  isFavorite?: boolean;
}

interface CPTCode {
  code: string;
  description: string;
  category: string;
  baseRVU: number;
  globalPeriod: number;
  modifiers?: string[];
  isFavorite?: boolean;
}

interface CodingEncounter {
  id: string;
  patientName: string;
  mrn: string;
  encounterDate: string;
  encounterType: 'outpatient' | 'surgery' | 'procedure';
  provider: string;
  diagnoses: ICDCode[];
  procedures: CPTCode[];
  status: 'pending' | 'coded' | 'verified' | 'billed';
  codedBy?: string;
  verifiedBy?: string;
}

// Mock ICD-10 Codes - Ophthalmology
const mockICDCodes: ICDCode[] = [
  { code: 'H25.11', description: 'Age-related nuclear cataract, right eye', category: 'Cataract', chapter: 'H25', laterality: 'right' },
  { code: 'H25.12', description: 'Age-related nuclear cataract, left eye', category: 'Cataract', chapter: 'H25', laterality: 'left' },
  { code: 'H25.13', description: 'Age-related nuclear cataract, bilateral', category: 'Cataract', chapter: 'H25', laterality: 'bilateral' },
  { code: 'H40.1111', description: 'Primary open-angle glaucoma, right eye, mild stage', category: 'Glaucoma', chapter: 'H40' },
  { code: 'H40.1112', description: 'Primary open-angle glaucoma, right eye, moderate stage', category: 'Glaucoma', chapter: 'H40' },
  { code: 'H40.1113', description: 'Primary open-angle glaucoma, right eye, severe stage', category: 'Glaucoma', chapter: 'H40' },
  { code: 'H40.1121', description: 'Primary open-angle glaucoma, left eye, mild stage', category: 'Glaucoma', chapter: 'H40' },
  { code: 'H52.11', description: 'Myopia, right eye', category: 'Refractive', chapter: 'H52', laterality: 'right' },
  { code: 'H52.12', description: 'Myopia, left eye', category: 'Refractive', chapter: 'H52', laterality: 'left' },
  { code: 'H52.13', description: 'Myopia, bilateral', category: 'Refractive', chapter: 'H52', laterality: 'bilateral' },
  { code: 'H35.3211', description: 'Exudative age-related macular degeneration, right eye, with active choroidal neovascularization', category: 'Retina', chapter: 'H35' },
  { code: 'H35.3212', description: 'Exudative age-related macular degeneration, left eye, with active choroidal neovascularization', category: 'Retina', chapter: 'H35' },
  { code: 'E11.3211', description: 'Type 2 diabetes mellitus with mild nonproliferative diabetic retinopathy with macular edema, right eye', category: 'Diabetic Eye', chapter: 'E11' },
  { code: 'E11.3212', description: 'Type 2 diabetes mellitus with mild nonproliferative diabetic retinopathy with macular edema, left eye', category: 'Diabetic Eye', chapter: 'E11' },
  { code: 'H26.011', description: 'Infantile and juvenile cortical, lamellar, or zonular cataract, right eye', category: 'Cataract', chapter: 'H26' },
  { code: 'H33.001', description: 'Unspecified retinal detachment with retinal break, right eye', category: 'Retina', chapter: 'H33' }
];

// Mock CPT Codes - Ophthalmology
const mockCPTCodes: CPTCode[] = [
  { code: '66984', description: 'Extracapsular cataract removal with insertion of intraocular lens prosthesis', category: 'Cataract Surgery', baseRVU: 9.45, globalPeriod: 90, modifiers: ['RT', 'LT'] },
  { code: '66982', description: 'Extracapsular cataract removal with IOL, complex', category: 'Cataract Surgery', baseRVU: 11.28, globalPeriod: 90, modifiers: ['RT', 'LT'] },
  { code: '66821', description: 'Discission of secondary membranous cataract (YAG laser capsulotomy)', category: 'Laser', baseRVU: 3.85, globalPeriod: 0, modifiers: ['RT', 'LT'] },
  { code: '65855', description: 'Trabeculoplasty by laser surgery (SLT/ALT)', category: 'Laser', baseRVU: 4.02, globalPeriod: 10, modifiers: ['RT', 'LT'] },
  { code: '66170', description: 'Trabeculectomy ab externo (glaucoma filtering surgery)', category: 'Glaucoma Surgery', baseRVU: 14.72, globalPeriod: 90, modifiers: ['RT', 'LT'] },
  { code: '67028', description: 'Intravitreal injection of a pharmacologic agent', category: 'Retina', baseRVU: 1.86, globalPeriod: 0, modifiers: ['RT', 'LT'] },
  { code: '92134', description: 'Scanning computerized ophthalmic diagnostic imaging, posterior segment (OCT)', category: 'Diagnostic', baseRVU: 0.66, globalPeriod: 0 },
  { code: '92083', description: 'Visual field examination, unilateral or bilateral, with interpretation and report', category: 'Diagnostic', baseRVU: 0.71, globalPeriod: 0 },
  { code: '92250', description: 'Fundus photography with interpretation and report', category: 'Diagnostic', baseRVU: 0.42, globalPeriod: 0 },
  { code: '65756', description: 'Keratoplasty (corneal transplant); endothelial', category: 'Cornea', baseRVU: 17.23, globalPeriod: 90, modifiers: ['RT', 'LT'] },
  { code: '92004', description: 'Ophthalmological services: comprehensive exam, new patient', category: 'E&M', baseRVU: 2.17, globalPeriod: 0 },
  { code: '92014', description: 'Ophthalmological services: comprehensive exam, established patient', category: 'E&M', baseRVU: 1.65, globalPeriod: 0 },
  { code: '65780', description: 'Ocular surface reconstruction; amniotic membrane transplantation', category: 'Cornea', baseRVU: 8.45, globalPeriod: 90, modifiers: ['RT', 'LT'] },
  { code: '67108', description: 'Vitrectomy, mechanical, pars plana approach', category: 'Retina', baseRVU: 18.95, globalPeriod: 90, modifiers: ['RT', 'LT'] }
];

// Mock Encounters
const mockEncounters: CodingEncounter[] = [
  {
    id: 'ENC001',
    patientName: 'Ravi Kumar',
    mrn: 'MRN-2024-4001',
    encounterDate: '2026-01-28',
    encounterType: 'surgery',
    provider: 'Dr. Amit Verma',
    diagnoses: [mockICDCodes[0]], // H25.11 Cataract OD
    procedures: [mockCPTCodes[0]], // 66984 Phaco
    status: 'coded',
    codedBy: 'Priya (Coder)'
  },
  {
    id: 'ENC002',
    patientName: 'Lakshmi Narayanan',
    mrn: 'MRN-2024-4002',
    encounterDate: '2026-01-28',
    encounterType: 'procedure',
    provider: 'Dr. Kavita Singh',
    diagnoses: [mockICDCodes[4]], // H40.1112 Glaucoma moderate
    procedures: [mockCPTCodes[4]], // 66170 Trabeculectomy
    status: 'pending'
  },
  {
    id: 'ENC003',
    patientName: 'Gopal Menon',
    mrn: 'MRN-2024-4003',
    encounterDate: '2026-01-27',
    encounterType: 'outpatient',
    provider: 'Dr. Priya Sharma',
    diagnoses: [mockICDCodes[10]], // Wet AMD
    procedures: [mockCPTCodes[5], mockCPTCodes[6]], // Intravitreal + OCT
    status: 'verified',
    codedBy: 'Priya (Coder)',
    verifiedBy: 'Dr. Priya Sharma'
  },
  {
    id: 'ENC004',
    patientName: 'Saroja Devi',
    mrn: 'MRN-2024-4004',
    encounterDate: '2026-01-27',
    encounterType: 'procedure',
    provider: 'Dr. Ravi Menon',
    diagnoses: [],
    procedures: [],
    status: 'pending'
  }
];

// Helper Functions
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'coded': 'bg-blue-100 text-blue-800',
    'verified': 'bg-green-100 text-green-800',
    'billed': 'bg-purple-100 text-purple-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export default function MedicalCodingPage() {
  const [activeTab, setActiveTab] = useState<'encounters' | 'icd10' | 'cpt' | 'favorites'>('encounters');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedEncounter, setSelectedEncounter] = useState<string | null>(null);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);

  // Filter ICD codes
  const filteredICDCodes = mockICDCodes.filter(code => {
    const matchesSearch = 
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || code.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter CPT codes
  const filteredCPTCodes = mockCPTCodes.filter(code => {
    const matchesSearch = 
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || code.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter encounters
  const filteredEncounters = mockEncounters.filter(enc => {
    const matchesSearch = 
      enc.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enc.mrn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || enc.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Code className="h-7 w-7 text-purple-600" />
            Medical Coding (ICD-10 / CPT)
          </h1>
          <p className="text-gray-600 mt-1">
            Diagnosis and procedure coding for billing and documentation
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Sync Codes
          </button>
          <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">12</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Coded Today</p>
              <p className="text-2xl font-bold text-blue-600">28</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Verified</p>
              <p className="text-2xl font-bold text-green-600">45</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Billed (Month)</p>
              <p className="text-2xl font-bold text-purple-600">892</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">ICD-10 Codes</p>
              <p className="text-2xl font-bold text-gray-900">72,000+</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <Book className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">CPT Codes</p>
              <p className="text-2xl font-bold text-gray-900">10,000+</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <List className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'encounters', label: 'Encounters', icon: <Clipboard className="h-4 w-4" /> },
              { id: 'icd10', label: 'ICD-10 Lookup', icon: <Tag className="h-4 w-4" /> },
              { id: 'cpt', label: 'CPT Lookup', icon: <Activity className="h-4 w-4" /> },
              { id: 'favorites', label: 'Favorites', icon: <Star className="h-4 w-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Encounters Tab */}
        {activeTab === 'encounters' && (
          <div className="p-6">
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by patient name or MRN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="coded">Coded</option>
                <option value="verified">Verified</option>
                <option value="billed">Billed</option>
              </select>
              <input
                type="date"
                defaultValue="2026-01-28"
                className="px-4 py-2 border border-gray-200 rounded-lg"
              />
            </div>

            <div className="space-y-3">
              {filteredEncounters.map(encounter => (
                <div key={encounter.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div 
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedEncounter(selectedEncounter === encounter.id ? null : encounter.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Stethoscope className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{encounter.patientName}</span>
                            <span className="text-sm text-gray-500">({encounter.mrn})</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                            <span>{formatDate(encounter.encounterDate)}</span>
                            <span className="text-gray-300">•</span>
                            <span className="capitalize">{encounter.encounterType}</span>
                            <span className="text-gray-300">•</span>
                            <span>{encounter.provider}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(encounter.status)}`}>
                          {encounter.status}
                        </span>
                        {selectedEncounter === encounter.id ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedEncounter === encounter.id && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Diagnoses */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                              <Tag className="h-4 w-4 text-blue-600" />
                              Diagnoses (ICD-10)
                            </h4>
                            <button className="text-sm text-purple-600 hover:underline flex items-center gap-1">
                              <Plus className="h-4 w-4" />
                              Add
                            </button>
                          </div>
                          {encounter.diagnoses.length > 0 ? (
                            <div className="space-y-2">
                              {encounter.diagnoses.map((dx, idx) => (
                                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <span className="font-mono text-blue-600 font-medium">{dx.code}</span>
                                      <p className="text-sm text-gray-700 mt-1">{dx.description}</p>
                                    </div>
                                    <button 
                                      onClick={() => copyToClipboard(dx.code)}
                                      className="p-1 hover:bg-gray-100 rounded"
                                    >
                                      <Copy className="h-4 w-4 text-gray-400" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No diagnoses coded yet</p>
                          )}
                        </div>

                        {/* Procedures */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                              <Activity className="h-4 w-4 text-green-600" />
                              Procedures (CPT)
                            </h4>
                            <button className="text-sm text-purple-600 hover:underline flex items-center gap-1">
                              <Plus className="h-4 w-4" />
                              Add
                            </button>
                          </div>
                          {encounter.procedures.length > 0 ? (
                            <div className="space-y-2">
                              {encounter.procedures.map((proc, idx) => (
                                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <span className="font-mono text-green-600 font-medium">{proc.code}</span>
                                      <p className="text-sm text-gray-700 mt-1">{proc.description}</p>
                                      <p className="text-xs text-gray-500 mt-1">RVU: {proc.baseRVU} • Global: {proc.globalPeriod} days</p>
                                    </div>
                                    <button 
                                      onClick={() => copyToClipboard(proc.code)}
                                      className="p-1 hover:bg-gray-100 rounded"
                                    >
                                      <Copy className="h-4 w-4 text-gray-400" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No procedures coded yet</p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex gap-2 pt-4 border-t border-gray-200">
                        {encounter.status === 'pending' && (
                          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                            Submit Coding
                          </button>
                        )}
                        {encounter.status === 'coded' && (
                          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                            Verify Codes
                          </button>
                        )}
                        {encounter.status === 'verified' && (
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                            Send to Billing
                          </button>
                        )}
                        <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-1">
                          <History className="h-4 w-4" />
                          Coding History
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ICD-10 Lookup Tab */}
        {activeTab === 'icd10' && (
          <div className="p-6">
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search ICD-10 code or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Categories</option>
                <option value="Cataract">Cataract</option>
                <option value="Glaucoma">Glaucoma</option>
                <option value="Retina">Retina</option>
                <option value="Refractive">Refractive</option>
                <option value="Diabetic Eye">Diabetic Eye Disease</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredICDCodes.map(code => (
                <div 
                  key={code.code}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg font-semibold text-blue-600">{code.code}</span>
                        {code.laterality && (
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600 capitalize">
                            {code.laterality === 'right' ? 'OD' : code.laterality === 'left' ? 'OS' : code.laterality === 'bilateral' ? 'OU' : 'Unspec'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{code.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                          {code.category}
                        </span>
                        <span className="text-xs text-gray-500">Chapter {code.chapter}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => copyToClipboard(code.code)}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Copy code"
                      >
                        <Copy className="h-4 w-4 text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded" title="Add to favorites">
                        <Star className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CPT Lookup Tab */}
        {activeTab === 'cpt' && (
          <div className="p-6">
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search CPT code or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Categories</option>
                <option value="Cataract Surgery">Cataract Surgery</option>
                <option value="Glaucoma Surgery">Glaucoma Surgery</option>
                <option value="Laser">Laser Procedures</option>
                <option value="Retina">Retina</option>
                <option value="Cornea">Cornea</option>
                <option value="Diagnostic">Diagnostic</option>
                <option value="E&M">E&M</option>
              </select>
            </div>

            <div className="space-y-3">
              {filteredCPTCodes.map(code => (
                <div 
                  key={code.code}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div 
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedCode(expandedCode === code.code ? null : code.code)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-xl font-semibold text-green-600">{code.code}</span>
                        <div>
                          <p className="text-gray-900">{code.description}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                              {code.category}
                            </span>
                            <span className="text-xs text-gray-500">RVU: {code.baseRVU}</span>
                            <span className="text-xs text-gray-500">Global: {code.globalPeriod} days</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(code.code);
                          }}
                          className="p-2 hover:bg-gray-100 rounded"
                        >
                          <Copy className="h-4 w-4 text-gray-400" />
                        </button>
                        {expandedCode === code.code ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {expandedCode === code.code && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Base RVU</p>
                          <p className="text-lg font-semibold text-gray-900">{code.baseRVU}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Global Period</p>
                          <p className="text-lg font-semibold text-gray-900">{code.globalPeriod} days</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Common Modifiers</p>
                          <div className="flex gap-2 mt-1">
                            {code.modifiers ? code.modifiers.map((mod, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-sm">
                                -{mod}
                              </span>
                            )) : (
                              <span className="text-gray-500 text-sm">None specified</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button className="px-3 py-1.5 text-sm text-purple-600 border border-purple-200 rounded hover:bg-purple-50 flex items-center gap-1">
                          <Plus className="h-4 w-4" />
                          Add to Encounter
                        </button>
                        <button className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded hover:bg-gray-50 flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          Add to Favorites
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Frequently Used ICD-10 Codes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {mockICDCodes.slice(0, 6).map(code => (
                  <div 
                    key={code.code}
                    className="border border-gray-200 rounded-lg p-3 hover:border-yellow-300 hover:bg-yellow-50/50 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono text-blue-600 font-medium">{code.code}</span>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{code.description}</p>
                      </div>
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Frequently Used CPT Codes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {mockCPTCodes.slice(0, 6).map(code => (
                  <div 
                    key={code.code}
                    className="border border-gray-200 rounded-lg p-3 hover:border-yellow-300 hover:bg-yellow-50/50 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono text-green-600 font-medium">{code.code}</span>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{code.description}</p>
                        <p className="text-xs text-gray-500 mt-1">RVU: {code.baseRVU}</p>
                      </div>
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
