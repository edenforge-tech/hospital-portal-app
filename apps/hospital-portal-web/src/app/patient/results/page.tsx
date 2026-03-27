'use client';

import { useState } from 'react';
import {
  TestTube,
  Search,
  Filter,
  Download,
  Eye,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  Share2,
  Printer,
  ChevronDown,
  ChevronUp,
  Activity,
  Heart,
  Droplets,
  Beaker,
} from 'lucide-react';

interface TestResult {
  id: string;
  testName: string;
  testCode: string;
  category: string;
  orderedBy: string;
  orderedDate: string;
  collectedDate?: string;
  resultDate?: string;
  status: 'pending' | 'in-progress' | 'available' | 'cancelled';
  priority: 'routine' | 'urgent' | 'stat';
  results?: TestParameter[];
  summary?: string;
  labNotes?: string;
}

interface TestParameter {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'high' | 'low' | 'critical';
}

// Mock data
const mockResults: TestResult[] = [
  {
    id: 'LAB-001',
    testName: 'Complete Blood Count (CBC)',
    testCode: 'CBC-001',
    category: 'Hematology',
    orderedBy: 'Dr. Arun Mehta',
    orderedDate: '2026-01-25',
    collectedDate: '2026-01-25',
    resultDate: '2026-01-26',
    status: 'available',
    priority: 'routine',
    results: [
      { name: 'Hemoglobin (Hb)', value: '14.2', unit: 'g/dL', referenceRange: '13.5-17.5', status: 'normal' },
      { name: 'RBC Count', value: '4.8', unit: 'million/μL', referenceRange: '4.5-5.5', status: 'normal' },
      { name: 'WBC Count', value: '11.5', unit: 'x10³/μL', referenceRange: '4.5-11.0', status: 'high' },
      { name: 'Platelet Count', value: '245', unit: 'x10³/μL', referenceRange: '150-400', status: 'normal' },
      { name: 'Hematocrit', value: '42', unit: '%', referenceRange: '38-50', status: 'normal' },
      { name: 'MCV', value: '88', unit: 'fL', referenceRange: '80-100', status: 'normal' },
    ],
    summary: 'Mild leukocytosis noted. May be related to post-operative status. Recommend follow-up if symptoms persist.',
  },
  {
    id: 'LAB-002',
    testName: 'OCT Scan - Right Eye',
    testCode: 'OCT-RE',
    category: 'Eye Imaging',
    orderedBy: 'Dr. Arun Mehta',
    orderedDate: '2026-01-28',
    status: 'pending',
    priority: 'routine',
  },
  {
    id: 'LAB-003',
    testName: 'Blood Sugar Fasting',
    testCode: 'BSF-001',
    category: 'Biochemistry',
    orderedBy: 'Dr. Priya Nair',
    orderedDate: '2026-01-20',
    collectedDate: '2026-01-21',
    resultDate: '2026-01-21',
    status: 'available',
    priority: 'routine',
    results: [
      { name: 'Fasting Blood Sugar', value: '95', unit: 'mg/dL', referenceRange: '70-100', status: 'normal' },
    ],
    summary: 'Fasting blood sugar within normal limits.',
  },
  {
    id: 'LAB-004',
    testName: 'Lipid Profile',
    testCode: 'LIP-001',
    category: 'Biochemistry',
    orderedBy: 'Dr. Priya Nair',
    orderedDate: '2026-01-20',
    collectedDate: '2026-01-21',
    resultDate: '2026-01-21',
    status: 'available',
    priority: 'routine',
    results: [
      { name: 'Total Cholesterol', value: '210', unit: 'mg/dL', referenceRange: '<200', status: 'high' },
      { name: 'HDL Cholesterol', value: '55', unit: 'mg/dL', referenceRange: '>40', status: 'normal' },
      { name: 'LDL Cholesterol', value: '130', unit: 'mg/dL', referenceRange: '<100', status: 'high' },
      { name: 'Triglycerides', value: '145', unit: 'mg/dL', referenceRange: '<150', status: 'normal' },
      { name: 'VLDL Cholesterol', value: '29', unit: 'mg/dL', referenceRange: '<30', status: 'normal' },
    ],
    summary: 'Borderline high cholesterol. Recommend dietary modifications and lifestyle changes. Consider repeat testing in 3 months.',
  },
  {
    id: 'LAB-005',
    testName: 'Visual Field Test',
    testCode: 'VFT-001',
    category: 'Eye Function',
    orderedBy: 'Dr. Arun Mehta',
    orderedDate: '2026-01-15',
    collectedDate: '2026-01-15',
    resultDate: '2026-01-15',
    status: 'available',
    priority: 'routine',
    summary: 'Visual field testing shows no significant defects. Normal central and peripheral vision.',
  },
];

// Helper functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getStatusBadge = (status: TestResult['status']) => {
  switch (status) {
    case 'available': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'in-progress': return 'bg-blue-100 text-blue-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getParameterStatusIcon = (status: TestParameter['status']) => {
  switch (status) {
    case 'high': return <TrendingUp className="h-4 w-4 text-red-500" />;
    case 'low': return <TrendingDown className="h-4 w-4 text-orange-500" />;
    case 'critical': return <AlertCircle className="h-4 w-4 text-red-600" />;
    default: return <Minus className="h-4 w-4 text-green-500" />;
  }
};

const getParameterColor = (status: TestParameter['status']) => {
  switch (status) {
    case 'high': return 'text-red-600 font-semibold';
    case 'low': return 'text-orange-600 font-semibold';
    case 'critical': return 'text-red-700 font-bold';
    default: return 'text-gray-900';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'hematology': return <Droplets className="h-5 w-5 text-red-500" />;
    case 'biochemistry': return <Beaker className="h-5 w-5 text-blue-500" />;
    case 'eye imaging':
    case 'eye function': return <Eye className="h-5 w-5 text-purple-500" />;
    default: return <TestTube className="h-5 w-5 text-gray-500" />;
  }
};

export default function PatientResultsPage() {
  const [results, setResults] = useState<TestResult[]>(mockResults);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedResults, setExpandedResults] = useState<string[]>([]);

  const filteredResults = results.filter(result => {
    const matchesSearch = 
      result.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.orderedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || result.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || result.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = [...new Set(results.map(r => r.category))];
  const availableResults = results.filter(r => r.status === 'available');
  const pendingResults = results.filter(r => r.status === 'pending' || r.status === 'in-progress');
  const abnormalResults = availableResults.filter(r => 
    r.results?.some(p => p.status !== 'normal')
  );

  const toggleExpand = (id: string) => {
    setExpandedResults(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Test Results</h1>
          <p className="text-gray-500">View your lab reports and diagnostic test results</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download All
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{availableResults.length}</p>
              <p className="text-xs text-gray-500">Available Results</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingResults.length}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{abnormalResults.length}</p>
              <p className="text-xs text-gray-500">Need Attention</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TestTube className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{results.length}</p>
              <p className="text-xs text-gray-500">Total Tests</p>
            </div>
          </div>
        </div>
      </div>

      {/* Abnormal Results Alert */}
      {abnormalResults.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Results Need Attention</p>
              <p className="text-sm text-red-700 mt-1">
                {abnormalResults.length} test result(s) have values outside the normal range. 
                Please review and consult your doctor if you have concerns.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by test name or doctor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {filteredResults.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <TestTube className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No test results found</p>
          </div>
        ) : (
          filteredResults.map((result) => {
            const isExpanded = expandedResults.includes(result.id);
            const hasAbnormal = result.results?.some(p => p.status !== 'normal');

            return (
              <div key={result.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
                hasAbnormal && result.status === 'available' ? 'border-red-200' : 'border-gray-100'
              }`}>
                {/* Result Header */}
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleExpand(result.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        result.status === 'available' 
                          ? hasAbnormal ? 'bg-red-100' : 'bg-green-100'
                          : 'bg-yellow-100'
                      }`}>
                        {getCategoryIcon(result.category)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{result.testName}</h3>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(result.status)}`}>
                            {result.status}
                          </span>
                          {hasAbnormal && result.status === 'available' && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              Needs Review
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{result.category} • {result.testCode}</p>
                        <p className="text-sm text-gray-400 mt-1">Ordered by {result.orderedBy}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                          <span className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            Ordered: {formatDate(result.orderedDate)}
                          </span>
                          {result.resultDate && (
                            <span className="flex items-center gap-1 text-sm text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              Result: {formatDate(result.resultDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.status === 'available' && (
                        <>
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                            <Download className="h-5 w-5" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                            <Share2 className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && result.status === 'available' && (
                  <div className="border-t border-gray-100 p-4">
                    {/* Result Parameters */}
                    {result.results && result.results.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-3">Test Parameters</p>
                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Parameter</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Result</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Unit</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Reference Range</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {result.results.map((param, idx) => (
                                <tr key={idx} className={param.status !== 'normal' ? 'bg-red-50' : ''}>
                                  <td className="px-4 py-2 text-sm text-gray-900">{param.name}</td>
                                  <td className={`px-4 py-2 text-sm ${getParameterColor(param.status)}`}>
                                    {param.value}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-600">{param.unit}</td>
                                  <td className="px-4 py-2 text-sm text-gray-500">{param.referenceRange}</td>
                                  <td className="px-4 py-2">
                                    <div className="flex items-center gap-1">
                                      {getParameterStatusIcon(param.status)}
                                      <span className={`text-xs ${
                                        param.status === 'normal' ? 'text-green-600' :
                                        param.status === 'critical' ? 'text-red-600' :
                                        'text-orange-600'
                                      }`}>
                                        {param.status}
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Summary */}
                    {result.summary && (
                      <div className={`p-3 rounded-lg ${
                        hasAbnormal ? 'bg-yellow-50' : 'bg-green-50'
                      }`}>
                        <p className={`text-sm font-medium ${
                          hasAbnormal ? 'text-yellow-800' : 'text-green-800'
                        }`}>
                          <FileText className="h-4 w-4 inline-block mr-1" />
                          Doctor's Notes
                        </p>
                        <p className={`text-sm mt-1 ${
                          hasAbnormal ? 'text-yellow-700' : 'text-green-700'
                        }`}>
                          {result.summary}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Download PDF
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2">
                        <Printer className="h-4 w-4" />
                        Print
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2">
                        <Share2 className="h-4 w-4" />
                        Share with Doctor
                      </button>
                    </div>
                  </div>
                )}

                {/* Pending Status Message */}
                {isExpanded && (result.status === 'pending' || result.status === 'in-progress') && (
                  <div className="border-t border-gray-100 p-4">
                    <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
                      <Clock className="h-6 w-6 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-800">Results Processing</p>
                        <p className="text-sm text-yellow-700">
                          Your test results are being processed. Expected availability within 24-48 hours.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Information Card */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Understanding Your Results</h3>
        <p className="text-sm text-blue-800 mb-4">
          Your test results are compared against standard reference ranges. Values outside these ranges 
          may not always indicate a problem - your doctor will interpret results in the context of your 
          overall health.
        </p>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Minus className="h-4 w-4 text-green-500" />
            <span className="text-sm text-blue-800">Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-red-500" />
            <span className="text-sm text-blue-800">Above Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-blue-800">Below Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-blue-800">Critical - Contact Doctor</span>
          </div>
        </div>
      </div>
    </div>
  );
}
