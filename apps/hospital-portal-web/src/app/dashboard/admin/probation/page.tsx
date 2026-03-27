'use client';

import React, { useState } from 'react';
import { 
  Clock, 
  Search, 
  Filter,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp,
  Star,
  MessageSquare,
  Edit,
  Eye,
  Building,
  Timer,
  ClipboardCheck,
  Target,
  BarChart3
} from 'lucide-react';

// Types
interface ProbationRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  designation: string;
  branch: string;
  joiningDate: string;
  probationStartDate: string;
  probationEndDate: string;
  probationPeriod: number;
  extendedUntil?: string;
  extensionReason?: string;
  status: 'in-probation' | 'review-pending' | 'extended' | 'confirmed' | 'terminated';
  supervisor: string;
  reviews: ProbationReview[];
  performanceScore?: number;
  attendanceScore?: number;
  skillScore?: number;
  overallRating?: 'excellent' | 'good' | 'satisfactory' | 'needs-improvement' | 'poor';
}

interface ProbationReview {
  id: string;
  reviewDate: string;
  reviewType: 'monthly' | 'mid-term' | 'final';
  reviewer: string;
  performanceScore: number;
  attendanceScore: number;
  skillScore: number;
  overallScore: number;
  strengths: string[];
  areasForImprovement: string[];
  recommendation: 'confirm' | 'extend' | 'terminate' | 'continue';
  comments: string;
}

// Mock Data
const mockProbationRecords: ProbationRecord[] = [
  {
    id: 'PRB001',
    employeeId: 'EMP015',
    employeeName: 'Ravi Kumar',
    employeeCode: 'EMP-2024-015',
    department: 'Optometry',
    designation: 'Optometrist',
    branch: 'Main Hospital - Koramangala',
    joiningDate: '2025-11-01',
    probationStartDate: '2025-11-01',
    probationEndDate: '2026-05-01',
    probationPeriod: 6,
    status: 'in-probation',
    supervisor: 'Dr. Priya Sharma',
    performanceScore: 78,
    attendanceScore: 92,
    skillScore: 75,
    overallRating: 'good',
    reviews: [
      {
        id: 'REV001',
        reviewDate: '2025-12-01',
        reviewType: 'monthly',
        reviewer: 'Dr. Priya Sharma',
        performanceScore: 75,
        attendanceScore: 90,
        skillScore: 72,
        overallScore: 79,
        strengths: ['Quick learner', 'Good patient rapport', 'Punctual'],
        areasForImprovement: ['Equipment handling', 'Documentation speed'],
        recommendation: 'continue',
        comments: 'Good progress in first month. Needs more practice with advanced equipment.'
      },
      {
        id: 'REV002',
        reviewDate: '2026-01-01',
        reviewType: 'monthly',
        reviewer: 'Dr. Priya Sharma',
        performanceScore: 78,
        attendanceScore: 92,
        skillScore: 75,
        overallScore: 82,
        strengths: ['Improved equipment handling', 'Consistent performance', 'Team player'],
        areasForImprovement: ['Complex case handling'],
        recommendation: 'continue',
        comments: 'Steady improvement. On track for confirmation.'
      }
    ]
  },
  {
    id: 'PRB002',
    employeeId: 'EMP018',
    employeeName: 'Sunita Reddy',
    employeeCode: 'EMP-2024-018',
    department: 'Front Office',
    designation: 'Patient Coordinator',
    branch: 'Main Hospital - Koramangala',
    joiningDate: '2025-10-15',
    probationStartDate: '2025-10-15',
    probationEndDate: '2026-04-15',
    probationPeriod: 6,
    status: 'review-pending',
    supervisor: 'Anita Menon',
    performanceScore: 88,
    attendanceScore: 95,
    skillScore: 85,
    overallRating: 'excellent',
    reviews: [
      {
        id: 'REV003',
        reviewDate: '2025-11-15',
        reviewType: 'monthly',
        reviewer: 'Anita Menon',
        performanceScore: 85,
        attendanceScore: 95,
        skillScore: 82,
        overallScore: 87,
        strengths: ['Excellent communication', 'Patient handling', 'Multi-tasking'],
        areasForImprovement: ['Software proficiency'],
        recommendation: 'continue',
        comments: 'Exceptional start. Very promising candidate.'
      },
      {
        id: 'REV004',
        reviewDate: '2026-01-15',
        reviewType: 'mid-term',
        reviewer: 'Anita Menon',
        performanceScore: 88,
        attendanceScore: 95,
        skillScore: 85,
        overallScore: 89,
        strengths: ['Software proficiency improved', 'Leadership qualities', 'Initiative'],
        areasForImprovement: ['Handling difficult patients'],
        recommendation: 'confirm',
        comments: 'Strongly recommend early confirmation. Outstanding performance.'
      }
    ]
  },
  {
    id: 'PRB003',
    employeeId: 'EMP020',
    employeeName: 'Vikram Singh',
    employeeCode: 'EMP-2024-020',
    department: 'Pharmacy',
    designation: 'Pharmacist',
    branch: 'Branch - Whitefield',
    joiningDate: '2025-09-01',
    probationStartDate: '2025-09-01',
    probationEndDate: '2026-03-01',
    probationPeriod: 6,
    extendedUntil: '2026-06-01',
    extensionReason: 'Needs additional training on inventory management system',
    status: 'extended',
    supervisor: 'Rajesh Gupta',
    performanceScore: 62,
    attendanceScore: 88,
    skillScore: 58,
    overallRating: 'needs-improvement',
    reviews: [
      {
        id: 'REV005',
        reviewDate: '2025-12-01',
        reviewType: 'mid-term',
        reviewer: 'Rajesh Gupta',
        performanceScore: 60,
        attendanceScore: 85,
        skillScore: 55,
        overallScore: 67,
        strengths: ['Good knowledge of medications', 'Patient counseling'],
        areasForImprovement: ['System usage', 'Inventory tracking', 'Speed of dispensing'],
        recommendation: 'extend',
        comments: 'Good pharmaceutical knowledge but struggles with systems. Recommend 3-month extension.'
      }
    ]
  },
  {
    id: 'PRB004',
    employeeId: 'EMP022',
    employeeName: 'Meera Nair',
    employeeCode: 'EMP-2024-022',
    department: 'Nursing',
    designation: 'Staff Nurse',
    branch: 'Main Hospital - Koramangala',
    joiningDate: '2025-07-01',
    probationStartDate: '2025-07-01',
    probationEndDate: '2026-01-01',
    probationPeriod: 6,
    status: 'confirmed',
    supervisor: 'Sr. Nurse Lakshmi',
    performanceScore: 92,
    attendanceScore: 98,
    skillScore: 90,
    overallRating: 'excellent',
    reviews: [
      {
        id: 'REV006',
        reviewDate: '2025-10-01',
        reviewType: 'mid-term',
        reviewer: 'Sr. Nurse Lakshmi',
        performanceScore: 90,
        attendanceScore: 98,
        skillScore: 88,
        overallScore: 92,
        strengths: ['Clinical skills', 'Patient care', 'Documentation', 'Team collaboration'],
        areasForImprovement: [],
        recommendation: 'confirm',
        comments: 'Exceptional nurse. Recommend early confirmation.'
      },
      {
        id: 'REV007',
        reviewDate: '2026-01-01',
        reviewType: 'final',
        reviewer: 'Sr. Nurse Lakshmi',
        performanceScore: 92,
        attendanceScore: 98,
        skillScore: 90,
        overallScore: 93,
        strengths: ['Leadership potential', 'Crisis handling', 'Continuous learning'],
        areasForImprovement: [],
        recommendation: 'confirm',
        comments: 'Successfully completed probation. Confirmed as permanent employee.'
      }
    ]
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
    'in-probation': 'bg-blue-100 text-blue-800',
    'review-pending': 'bg-yellow-100 text-yellow-800',
    'extended': 'bg-orange-100 text-orange-800',
    'confirmed': 'bg-green-100 text-green-800',
    'terminated': 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getRatingColor = (rating: string) => {
  const colors: Record<string, string> = {
    'excellent': 'text-green-600',
    'good': 'text-blue-600',
    'satisfactory': 'text-yellow-600',
    'needs-improvement': 'text-orange-600',
    'poor': 'text-red-600'
  };
  return colors[rating] || 'text-gray-600';
};

const getScoreColor = (score: number) => {
  if (score >= 85) return 'text-green-600 bg-green-100';
  if (score >= 70) return 'text-blue-600 bg-blue-100';
  if (score >= 60) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};

const getDaysRemaining = (endDate: string) => {
  const end = new Date(endDate);
  const today = new Date();
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export default function ProbationTrackingPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'reviews'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<ProbationRecord | null>(null);

  // Filter records
  const filteredRecords = mockProbationRecords.filter(record => {
    const matchesSearch = 
      record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'pending' && (record.status === 'review-pending' || record.status === 'in-probation'));
    return matchesSearch && matchesStatus && matchesTab;
  });

  // Pending reviews count
  const pendingReviewsCount = mockProbationRecords.filter(r => r.status === 'review-pending').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Timer className="h-7 w-7 text-orange-600" />
            Probation Tracking
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor employee probation periods, reviews, and confirmations
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowReviewModal(true)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
          >
            <ClipboardCheck className="h-4 w-4" />
            New Review
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">In Probation</p>
              <p className="text-2xl font-bold text-blue-600">
                {mockProbationRecords.filter(r => r.status === 'in-probation').length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Review Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingReviewsCount}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Extended</p>
              <p className="text-2xl font-bold text-orange-600">
                {mockProbationRecords.filter(r => r.status === 'extended').length}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Confirmed (YTD)</p>
              <p className="text-2xl font-bold text-green-600">
                {mockProbationRecords.filter(r => r.status === 'confirmed').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg. Rating</p>
              <p className="text-2xl font-bold text-purple-600">82%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'all', label: 'All Records', count: mockProbationRecords.length },
              { id: 'pending', label: 'Active/Pending', count: mockProbationRecords.filter(r => ['in-probation', 'review-pending'].includes(r.status)).length },
              { id: 'reviews', label: 'Review History', count: null }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {(activeTab === 'all' || activeTab === 'pending') && (
          <div className="p-6">
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, code, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg"
              >
                <option value="all">All Status</option>
                <option value="in-probation">In Probation</option>
                <option value="review-pending">Review Pending</option>
                <option value="extended">Extended</option>
                <option value="confirmed">Confirmed</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>

            <div className="space-y-3">
              {filteredRecords.map(record => {
                const daysRemaining = record.extendedUntil 
                  ? getDaysRemaining(record.extendedUntil) 
                  : getDaysRemaining(record.probationEndDate);

                return (
                  <div key={record.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="p-3 bg-orange-100 rounded-lg">
                              <User className="h-5 w-5 text-orange-600" />
                            </div>
                            {record.status === 'review-pending' && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{record.employeeName}</span>
                              <span className="text-sm text-gray-500">({record.employeeCode})</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                              <span>{record.designation}</span>
                              <span className="text-gray-300">•</span>
                              <span>{record.department}</span>
                              <span className="text-gray-300">•</span>
                              <span>Supervisor: {record.supervisor}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {record.overallRating && (
                            <div className={`text-center ${getRatingColor(record.overallRating)}`}>
                              <p className="text-xl font-bold">{Math.round((record.performanceScore! + record.attendanceScore! + record.skillScore!) / 3)}%</p>
                              <p className="text-xs capitalize">{record.overallRating.replace('-', ' ')}</p>
                            </div>
                          )}
                          <div className="text-right">
                            {record.status !== 'confirmed' && record.status !== 'terminated' && (
                              <>
                                <p className={`text-lg font-bold ${daysRemaining <= 30 ? 'text-red-600' : 'text-gray-700'}`}>
                                  {daysRemaining > 0 ? `${daysRemaining} days` : 'Expired'}
                                </p>
                                <p className="text-xs text-gray-500">remaining</p>
                              </>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                            {record.status.replace('-', ' ')}
                          </span>
                          {expandedRecord === record.id ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {expandedRecord === record.id && (
                      <div className="p-4 border-t border-gray-100 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          <div>
                            <h4 className="font-medium text-gray-800 mb-3">Probation Details</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Joining Date:</span>
                                <span className="font-medium">{formatDate(record.joiningDate)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Probation Start:</span>
                                <span className="font-medium">{formatDate(record.probationStartDate)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Probation End:</span>
                                <span className="font-medium">{formatDate(record.probationEndDate)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Duration:</span>
                                <span className="font-medium">{record.probationPeriod} months</span>
                              </div>
                              {record.extendedUntil && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Extended Until:</span>
                                  <span className="font-medium text-orange-600">{formatDate(record.extendedUntil)}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-800 mb-3">Performance Scores</h4>
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-600">Performance</span>
                                  <span className="font-medium">{record.performanceScore}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div className={`h-2 rounded-full ${record.performanceScore! >= 70 ? 'bg-green-500' : 'bg-orange-500'}`} style={{width: `${record.performanceScore}%`}}></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-600">Attendance</span>
                                  <span className="font-medium">{record.attendanceScore}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div className={`h-2 rounded-full ${record.attendanceScore! >= 70 ? 'bg-green-500' : 'bg-orange-500'}`} style={{width: `${record.attendanceScore}%`}}></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-600">Skills</span>
                                  <span className="font-medium">{record.skillScore}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div className={`h-2 rounded-full ${record.skillScore! >= 70 ? 'bg-green-500' : 'bg-orange-500'}`} style={{width: `${record.skillScore}%`}}></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="md:col-span-2">
                            <h4 className="font-medium text-gray-800 mb-3">Recent Reviews ({record.reviews.length})</h4>
                            {record.reviews.length > 0 ? (
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {record.reviews.slice(-2).reverse().map(review => (
                                  <div key={review.id} className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium text-gray-800 capitalize">{review.reviewType} Review</span>
                                      <span className="text-xs text-gray-500">{formatDate(review.reviewDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                      <span className={`px-2 py-0.5 rounded ${getScoreColor(review.overallScore)}`}>
                                        Score: {review.overallScore}%
                                      </span>
                                      <span className={`px-2 py-0.5 rounded text-xs ${
                                        review.recommendation === 'confirm' ? 'bg-green-100 text-green-700' :
                                        review.recommendation === 'extend' ? 'bg-orange-100 text-orange-700' :
                                        review.recommendation === 'continue' ? 'bg-blue-100 text-blue-700' :
                                        'bg-red-100 text-red-700'
                                      }`}>
                                        {review.recommendation}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">{review.comments}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 italic">No reviews yet</p>
                            )}
                          </div>
                        </div>

                        {record.extensionReason && (
                          <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <p className="text-sm">
                              <span className="font-medium text-orange-800">Extension Reason:</span>
                              <span className="text-orange-700 ml-2">{record.extensionReason}</span>
                            </p>
                          </div>
                        )}

                        <div className="mt-4 flex gap-2 pt-4 border-t border-gray-200">
                          {record.status !== 'confirmed' && record.status !== 'terminated' && (
                            <>
                              <button 
                                onClick={() => { setSelectedEmployee(record); setShowReviewModal(true); }}
                                className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 flex items-center gap-1"
                              >
                                <ClipboardCheck className="h-4 w-4" />
                                Add Review
                              </button>
                              <button className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-1">
                                <CheckCircle2 className="h-4 w-4" />
                                Confirm
                              </button>
                              <button className="px-3 py-1.5 border border-orange-200 text-orange-700 text-sm rounded-lg hover:bg-orange-50 flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Extend
                              </button>
                            </>
                          )}
                          <button className="px-3 py-1.5 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            View Full History
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">All Probation Reviews</h3>
            <div className="space-y-3">
              {mockProbationRecords.flatMap(record => 
                record.reviews.map(review => ({
                  ...review,
                  employeeName: record.employeeName,
                  employeeCode: record.employeeCode,
                  department: record.department
                }))
              ).sort((a, b) => new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime())
              .map((review, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FileText className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{review.employeeName}</p>
                        <p className="text-sm text-gray-500">{review.department} • {review.reviewType} review</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(review.overallScore)}`}>
                        {review.overallScore}%
                      </span>
                      <span className="text-sm text-gray-500">{formatDate(review.reviewDate)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{review.comments}</p>
                  <div className="mt-3 flex gap-2">
                    {review.strengths.slice(0, 3).map((s, i) => (
                      <span key={i} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Probation Review</h2>
                <button onClick={() => { setShowReviewModal(false); setSelectedEmployee(null); }} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg" defaultValue={selectedEmployee?.id || ''}>
                    <option value="">Select Employee</option>
                    {mockProbationRecords.filter(r => r.status !== 'confirmed').map(r => (
                      <option key={r.id} value={r.id}>{r.employeeName} ({r.employeeCode})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Review Type</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                    <option value="monthly">Monthly Review</option>
                    <option value="mid-term">Mid-Term Review</option>
                    <option value="final">Final Review</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Performance Score</label>
                  <input type="number" min="0" max="100" className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="0-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attendance Score</label>
                  <input type="number" min="0" max="100" className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="0-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skill Score</label>
                  <input type="number" min="0" max="100" className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="0-100" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Strengths</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="Enter strengths (comma separated)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Areas for Improvement</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="Enter areas for improvement (comma separated)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recommendation</label>
                <select className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                  <option value="continue">Continue Probation</option>
                  <option value="confirm">Confirm Employment</option>
                  <option value="extend">Extend Probation</option>
                  <option value="terminate">Terminate Employment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                <textarea rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="Detailed review comments..." />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => { setShowReviewModal(false); setSelectedEmployee(null); }} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
