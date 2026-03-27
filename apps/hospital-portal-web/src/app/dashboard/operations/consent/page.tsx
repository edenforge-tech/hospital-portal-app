'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  FileSignature,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Plus,
  Eye,
  Edit,
  AlertCircle,
  Calendar,
  User,
  Users,
  Download,
  Upload,
  Filter,
  RefreshCw,
  Send,
  Printer,
  Shield,
  Video,
  Camera,
  Stethoscope,
  Syringe,
  Heart,
  AlertTriangle,
  History,
  Paperclip,
  Check,
  Pen,
  UserCheck,
  ClipboardCheck,
  FileWarning,
} from 'lucide-react';

// Types
interface ConsentForm {
  id: string;
  consentNumber: string;
  patientName: string;
  patientMRN: string;
  patientAge: number;
  patientGender: 'male' | 'female' | 'other';
  procedure: string;
  procedureCode?: string;
  surgeon: string;
  surgeonDesignation: string;
  consentType: 'surgical' | 'anesthesia' | 'photography' | 'research' | 'treatment' | 'blood-transfusion' | 'high-risk';
  language: 'english' | 'hindi' | 'telugu' | 'tamil' | 'kannada' | 'marathi';
  status: 'draft' | 'explained' | 'signed' | 'witnessed' | 'verified' | 'expired' | 'revoked';
  scheduledDate?: string;
  createdDate: string;
  explainedDate?: string;
  signedDate?: string;
  witnessedDate?: string;
  expiryDate?: string;
  
  // Checklist items
  diagnosisExplained: boolean;
  procedureExplained: boolean;
  risksExplained: boolean;
  benefitsExplained: boolean;
  alternativesDiscussed: boolean;
  expectedOutcomeDiscussed: boolean;
  questionsAnswered: boolean;
  patientUnderstands: boolean;
  
  // Signatures
  patientSignature?: string;
  witnessName?: string;
  witnessSignature?: string;
  counselorName?: string;
  counselorSignature?: string;
  
  // Additional info
  specialInstructions?: string;
  patientConcerns?: string;
  interpreter?: string;
  guardianName?: string;
  guardianRelationship?: string;
  guardianSignature?: string;
  
  // Audit
  createdBy: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
  auditTrail: AuditEntry[];
}

interface AuditEntry {
  date: string;
  action: string;
  user: string;
  details?: string;
}

interface ConsentTemplate {
  id: string;
  name: string;
  type: ConsentForm['consentType'];
  procedure: string;
  risksList: string[];
  benefitsList: string[];
  alternativesList: string[];
  specialInstructions?: string;
  version: string;
  lastUpdated: string;
  isActive: boolean;
}

interface ConsentStats {
  totalToday: number;
  pendingSignature: number;
  pendingWitness: number;
  completed: number;
  expiringSoon: number;
  revoked: number;
}

// Mock Data
const mockConsents: ConsentForm[] = [
  {
    id: '1',
    consentNumber: 'CON-2026-001234',
    patientName: 'Rajesh Kumar',
    patientMRN: 'MRN-2024-001',
    patientAge: 58,
    patientGender: 'male',
    procedure: 'Cataract Surgery (Phaco + Premium Toric IOL)',
    procedureCode: 'CPT-66984',
    surgeon: 'Dr. Arun Mehta',
    surgeonDesignation: 'Senior Consultant - Cataract & Refractive',
    consentType: 'surgical',
    language: 'english',
    status: 'explained',
    scheduledDate: '2026-02-01',
    createdDate: '2026-01-28',
    explainedDate: '2026-01-28',
    expiryDate: '2026-02-28',
    diagnosisExplained: true,
    procedureExplained: true,
    risksExplained: true,
    benefitsExplained: true,
    alternativesDiscussed: true,
    expectedOutcomeDiscussed: true,
    questionsAnswered: true,
    patientUnderstands: true,
    counselorName: 'Priya Sharma',
    specialInstructions: 'Toric IOL requires precise axis alignment. Patient aware of potential rotation.',
    createdBy: 'Priya Sharma',
    auditTrail: [
      { date: '2026-01-28 09:00', action: 'Created', user: 'Priya Sharma' },
      { date: '2026-01-28 09:30', action: 'Explained to patient', user: 'Priya Sharma' },
    ],
  },
  {
    id: '2',
    consentNumber: 'CON-2026-001235',
    patientName: 'Sunita Devi',
    patientMRN: 'MRN-2024-002',
    patientAge: 35,
    patientGender: 'female',
    procedure: 'LASIK Surgery (Both Eyes)',
    procedureCode: 'CPT-65760',
    surgeon: 'Dr. Priya Nair',
    surgeonDesignation: 'Consultant - Refractive Surgery',
    consentType: 'surgical',
    language: 'hindi',
    status: 'signed',
    scheduledDate: '2026-01-30',
    createdDate: '2026-01-27',
    explainedDate: '2026-01-27',
    signedDate: '2026-01-28',
    expiryDate: '2026-02-27',
    diagnosisExplained: true,
    procedureExplained: true,
    risksExplained: true,
    benefitsExplained: true,
    alternativesDiscussed: true,
    expectedOutcomeDiscussed: true,
    questionsAnswered: true,
    patientUnderstands: true,
    patientSignature: 'signed_sunita.png',
    witnessName: 'Rahul Verma',
    counselorName: 'Priya Sharma',
    interpreter: 'Meena Singh (Hindi)',
    createdBy: 'Priya Sharma',
    lastModifiedBy: 'Rahul Verma',
    lastModifiedDate: '2026-01-28 10:00',
    auditTrail: [
      { date: '2026-01-27 14:00', action: 'Created', user: 'Priya Sharma' },
      { date: '2026-01-27 14:30', action: 'Explained with interpreter', user: 'Priya Sharma' },
      { date: '2026-01-28 10:00', action: 'Patient signed', user: 'Rahul Verma' },
    ],
  },
  {
    id: '3',
    consentNumber: 'CON-2026-001236',
    patientName: 'Vikram Reddy',
    patientMRN: 'MRN-2024-005',
    patientAge: 62,
    patientGender: 'male',
    procedure: 'Vitrectomy (Retinal Detachment Repair)',
    procedureCode: 'CPT-67036',
    surgeon: 'Dr. Suresh Rao',
    surgeonDesignation: 'Senior Consultant - Vitreoretinal Surgery',
    consentType: 'high-risk',
    language: 'telugu',
    status: 'witnessed',
    scheduledDate: '2026-01-29',
    createdDate: '2026-01-27',
    explainedDate: '2026-01-27',
    signedDate: '2026-01-28',
    witnessedDate: '2026-01-28',
    expiryDate: '2026-02-27',
    diagnosisExplained: true,
    procedureExplained: true,
    risksExplained: true,
    benefitsExplained: true,
    alternativesDiscussed: true,
    expectedOutcomeDiscussed: true,
    questionsAnswered: true,
    patientUnderstands: true,
    patientSignature: 'signed_vikram.png',
    witnessName: 'Lakshmi Reddy',
    witnessSignature: 'signed_witness_lakshmi.png',
    counselorName: 'Rahul Verma',
    guardianName: 'Lakshmi Reddy',
    guardianRelationship: 'Spouse',
    guardianSignature: 'signed_guardian_lakshmi.png',
    specialInstructions: 'High-risk procedure. Face-down positioning required post-op. Family counseled.',
    patientConcerns: 'Worried about vision recovery timeline',
    createdBy: 'Rahul Verma',
    lastModifiedBy: 'Dr. Suresh Rao',
    lastModifiedDate: '2026-01-28 11:00',
    auditTrail: [
      { date: '2026-01-27 11:00', action: 'Created', user: 'Rahul Verma' },
      { date: '2026-01-27 11:45', action: 'Explained with Telugu interpreter', user: 'Rahul Verma' },
      { date: '2026-01-28 09:30', action: 'Patient signed', user: 'Rahul Verma' },
      { date: '2026-01-28 09:45', action: 'Witness signed', user: 'Rahul Verma' },
      { date: '2026-01-28 11:00', action: 'Verified by surgeon', user: 'Dr. Suresh Rao' },
    ],
  },
  {
    id: '4',
    consentNumber: 'CON-2026-001237',
    patientName: 'Amit Singh',
    patientMRN: 'MRN-2024-003',
    patientAge: 45,
    patientGender: 'male',
    procedure: 'Trabeculectomy (Glaucoma Surgery)',
    procedureCode: 'CPT-66170',
    surgeon: 'Dr. Arun Mehta',
    surgeonDesignation: 'Senior Consultant - Glaucoma',
    consentType: 'surgical',
    language: 'english',
    status: 'draft',
    scheduledDate: '2026-02-03',
    createdDate: '2026-01-28',
    diagnosisExplained: false,
    procedureExplained: false,
    risksExplained: false,
    benefitsExplained: false,
    alternativesDiscussed: false,
    expectedOutcomeDiscussed: false,
    questionsAnswered: false,
    patientUnderstands: false,
    createdBy: 'System',
    auditTrail: [
      { date: '2026-01-28 08:00', action: 'Auto-created from surgery schedule', user: 'System' },
    ],
  },
  {
    id: '5',
    consentNumber: 'CON-2026-001238',
    patientName: 'Meera Patel',
    patientMRN: 'MRN-2024-004',
    patientAge: 7,
    patientGender: 'female',
    procedure: 'Strabismus Surgery (Squint Correction)',
    procedureCode: 'CPT-67311',
    surgeon: 'Dr. Priya Nair',
    surgeonDesignation: 'Consultant - Pediatric Ophthalmology',
    consentType: 'surgical',
    language: 'english',
    status: 'signed',
    scheduledDate: '2026-01-31',
    createdDate: '2026-01-26',
    explainedDate: '2026-01-27',
    signedDate: '2026-01-28',
    witnessedDate: '2026-01-28',
    expiryDate: '2026-02-26',
    diagnosisExplained: true,
    procedureExplained: true,
    risksExplained: true,
    benefitsExplained: true,
    alternativesDiscussed: true,
    expectedOutcomeDiscussed: true,
    questionsAnswered: true,
    patientUnderstands: true,
    witnessName: 'Nursing Staff',
    counselorName: 'Priya Sharma',
    guardianName: 'Ramesh Patel',
    guardianRelationship: 'Father',
    guardianSignature: 'signed_guardian_ramesh.png',
    specialInstructions: 'Minor patient. Parent/guardian consent obtained. Child assent documented.',
    createdBy: 'Priya Sharma',
    auditTrail: [
      { date: '2026-01-26 15:00', action: 'Created', user: 'Priya Sharma' },
      { date: '2026-01-27 10:00', action: 'Explained to parent', user: 'Priya Sharma' },
      { date: '2026-01-28 09:00', action: 'Guardian signed', user: 'Priya Sharma' },
      { date: '2026-01-28 09:15', action: 'Witnessed', user: 'Nursing Staff' },
    ],
  },
];

const mockTemplates: ConsentTemplate[] = [
  {
    id: '1',
    name: 'Cataract Surgery Consent',
    type: 'surgical',
    procedure: 'Cataract Surgery',
    risksList: [
      'Infection (endophthalmitis)',
      'Bleeding',
      'Retinal detachment',
      'Posterior capsule rupture',
      'Corneal edema',
      'Increased eye pressure',
      'Droopy eyelid (ptosis)',
      'Need for additional surgery',
    ],
    benefitsList: [
      'Improved vision',
      'Better quality of life',
      'Reduced dependence on glasses',
      'Improved color perception',
    ],
    alternativesList: [
      'Glasses or contact lenses',
      'No treatment (vision will continue to decline)',
      'Different IOL options',
    ],
    version: '2.1',
    lastUpdated: '2026-01-01',
    isActive: true,
  },
  {
    id: '2',
    name: 'LASIK Surgery Consent',
    type: 'surgical',
    procedure: 'LASIK',
    risksList: [
      'Dry eyes',
      'Glare and halos',
      'Under/over correction',
      'Flap complications',
      'Infection',
      'Regression',
      'Need for enhancement',
    ],
    benefitsList: [
      'Reduced dependence on glasses',
      'Quick recovery',
      'Long-lasting results',
    ],
    alternativesList: [
      'PRK/LASEK',
      'ICL (Implantable Collamer Lens)',
      'Glasses or contact lenses',
    ],
    version: '3.0',
    lastUpdated: '2025-12-15',
    isActive: true,
  },
  {
    id: '3',
    name: 'Anesthesia Consent',
    type: 'anesthesia',
    procedure: 'Anesthesia Administration',
    risksList: [
      'Allergic reaction',
      'Nausea and vomiting',
      'Respiratory complications',
      'Cardiovascular complications',
      'Nerve damage',
      'Awareness during surgery',
    ],
    benefitsList: [
      'Pain-free procedure',
      'Patient comfort',
      'Enables complex surgeries',
    ],
    alternativesList: [
      'Local anesthesia',
      'Regional block',
      'General anesthesia',
    ],
    version: '1.5',
    lastUpdated: '2025-11-01',
    isActive: true,
  },
];

// Helper functions
const getConsentStatusColor = (status: ConsentForm['status']) => {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800';
    case 'explained': return 'bg-blue-100 text-blue-800';
    case 'signed': return 'bg-yellow-100 text-yellow-800';
    case 'witnessed': return 'bg-green-100 text-green-800';
    case 'verified': return 'bg-emerald-100 text-emerald-800';
    case 'expired': return 'bg-red-100 text-red-800';
    case 'revoked': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getConsentTypeIcon = (type: ConsentForm['consentType']) => {
  switch (type) {
    case 'surgical': return <Stethoscope className="h-4 w-4" />;
    case 'anesthesia': return <Syringe className="h-4 w-4" />;
    case 'photography': return <Camera className="h-4 w-4" />;
    case 'research': return <FileText className="h-4 w-4" />;
    case 'treatment': return <Heart className="h-4 w-4" />;
    case 'blood-transfusion': return <Heart className="h-4 w-4" />;
    case 'high-risk': return <AlertTriangle className="h-4 w-4" />;
    default: return <FileSignature className="h-4 w-4" />;
  }
};

const getConsentTypeBadge = (type: ConsentForm['consentType']) => {
  switch (type) {
    case 'surgical': return 'bg-blue-100 text-blue-800';
    case 'anesthesia': return 'bg-purple-100 text-purple-800';
    case 'photography': return 'bg-cyan-100 text-cyan-800';
    case 'research': return 'bg-orange-100 text-orange-800';
    case 'treatment': return 'bg-green-100 text-green-800';
    case 'blood-transfusion': return 'bg-red-100 text-red-800';
    case 'high-risk': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function ConsentManagementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'consents' | 'templates' | 'pending'>('consents');
  const [consents, setConsents] = useState<ConsentForm[]>(mockConsents);
  const [templates, setTemplates] = useState<ConsentTemplate[]>(mockTemplates);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState<ConsentForm | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [stats, setStats] = useState<ConsentStats>({
    totalToday: 5,
    pendingSignature: 1,
    pendingWitness: 1,
    completed: 2,
    expiringSoon: 1,
    revoked: 0,
  });

  // Filter consents
  const filteredConsents = consents.filter(consent => {
    const matchesSearch = 
      consent.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consent.patientMRN.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consent.consentNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || consent.status === statusFilter;
    const matchesType = typeFilter === 'all' || consent.consentType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pending consents
  const pendingConsents = consents.filter(c => 
    c.status === 'draft' || c.status === 'explained' || c.status === 'signed'
  );

  const handleOpenSignature = (consent: ConsentForm) => {
    setSelectedConsent(consent);
    setShowSignatureModal(true);
  };

  const handleViewDetail = (consent: ConsentForm) => {
    setSelectedConsent(consent);
    setShowDetailModal(true);
  };

  const getChecklistProgress = (consent: ConsentForm) => {
    const items = [
      consent.diagnosisExplained,
      consent.procedureExplained,
      consent.risksExplained,
      consent.benefitsExplained,
      consent.alternativesDiscussed,
      consent.expectedOutcomeDiscussed,
      consent.questionsAnswered,
      consent.patientUnderstands,
    ];
    return items.filter(Boolean).length;
  };

  return (
    <ProtectedRoute requiredPermissions={['consent.view']}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Consent Management</h1>
            <p className="text-gray-600 mt-1">
              Digital consent forms, signatures, and compliance tracking
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowConsentModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Consent
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">Today's Total</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.totalToday}</p>
              </div>
              <FileSignature className="h-8 w-8 text-blue-500 opacity-30" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">Pending Signature</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pendingSignature}</p>
              </div>
              <Pen className="h-8 w-8 text-yellow-500 opacity-30" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">Pending Witness</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{stats.pendingWitness}</p>
              </div>
              <UserCheck className="h-8 w-8 text-orange-500 opacity-30" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-30" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">Expiring Soon</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.expiringSoon}</p>
              </div>
              <Clock className="h-8 w-8 text-red-500 opacity-30" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-gray-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">Revoked</p>
                <p className="text-2xl font-bold text-gray-600 mt-1">{stats.revoked}</p>
              </div>
              <XCircle className="h-8 w-8 text-gray-500 opacity-30" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('consents')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'consents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileSignature className="h-4 w-4" />
              All Consents
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Clock className="h-4 w-4" />
              Pending Action
              {pendingConsents.length > 0 && (
                <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingConsents.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="h-4 w-4" />
              Templates
            </button>
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient, MRN, or consent number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="explained">Explained</option>
            <option value="signed">Signed</option>
            <option value="witnessed">Witnessed</option>
            <option value="verified">Verified</option>
            <option value="expired">Expired</option>
            <option value="revoked">Revoked</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="surgical">Surgical</option>
            <option value="anesthesia">Anesthesia</option>
            <option value="photography">Photography</option>
            <option value="research">Research</option>
            <option value="treatment">Treatment</option>
            <option value="high-risk">High Risk</option>
          </select>

          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* All Consents Tab */}
        {(activeTab === 'consents' || activeTab === 'pending') && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient / Consent #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Procedure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Checklist
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheduled
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(activeTab === 'pending' ? pendingConsents : filteredConsents).map((consent) => (
                  <tr key={consent.id} className={`hover:bg-gray-50 ${consent.consentType === 'high-risk' ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <FileSignature className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{consent.patientName}</div>
                          <div className="text-sm text-gray-500">{consent.patientMRN}</div>
                          <div className="text-xs text-blue-600 font-mono">{consent.consentNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{consent.procedure}</div>
                      <div className="text-xs text-gray-500">{consent.surgeon}</div>
                      <div className="text-xs text-gray-400">{consent.language}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getConsentTypeBadge(consent.consentType)}`}>
                        {getConsentTypeIcon(consent.consentType)}
                        {consent.consentType.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                          <div 
                            className={`h-2 rounded-full ${getChecklistProgress(consent) === 8 ? 'bg-green-500' : 'bg-yellow-500'}`}
                            style={{ width: `${(getChecklistProgress(consent) / 8) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">{getChecklistProgress(consent)}/8</span>
                      </div>
                      {consent.guardianName && (
                        <div className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Guardian: {consent.guardianName}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {consent.scheduledDate ? (
                        <div className="flex items-center gap-1 text-gray-900">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formatDate(consent.scheduledDate)}
                        </div>
                      ) : (
                        <span className="text-gray-400">Not scheduled</span>
                      )}
                      {consent.expiryDate && (
                        <div className={`text-xs mt-1 ${
                          new Date(consent.expiryDate) < new Date() ? 'text-red-600' :
                          new Date(consent.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? 'text-orange-600' :
                          'text-gray-500'
                        }`}>
                          Expires: {formatDate(consent.expiryDate)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConsentStatusColor(consent.status)}`}>
                        {consent.status === 'witnessed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {consent.status === 'signed' && <Pen className="h-3 w-3 mr-1" />}
                        {consent.status}
                      </span>
                      {consent.signedDate && (
                        <div className="text-xs text-gray-500 mt-1">
                          Signed: {formatDate(consent.signedDate)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {consent.status === 'draft' && (
                          <button className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                            <ClipboardCheck className="h-4 w-4" />
                            Explain
                          </button>
                        )}
                        {consent.status === 'explained' && (
                          <button 
                            onClick={() => handleOpenSignature(consent)}
                            className="text-emerald-600 hover:text-emerald-900 flex items-center gap-1"
                          >
                            <Pen className="h-4 w-4" />
                            Get Signature
                          </button>
                        )}
                        {consent.status === 'signed' && (
                          <button className="text-orange-600 hover:text-orange-900 flex items-center gap-1">
                            <UserCheck className="h-4 w-4" />
                            Witness
                          </button>
                        )}
                        <button 
                          onClick={() => handleViewDetail(consent)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Printer className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredConsents.length === 0 && (
              <div className="text-center py-12">
                <FileSignature className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No consent forms found</p>
              </div>
            )}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getConsentTypeBadge(template.type)}`}>
                    {template.type}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{template.procedure}</p>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Risks ({template.risksList.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {template.risksList.slice(0, 3).map((risk, idx) => (
                        <span key={idx} className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded">
                          {risk.length > 20 ? risk.substring(0, 20) + '...' : risk}
                        </span>
                      ))}
                      {template.risksList.length > 3 && (
                        <span className="text-xs text-gray-500">+{template.risksList.length - 3} more</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Benefits ({template.benefitsList.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {template.benefitsList.slice(0, 2).map((benefit, idx) => (
                        <span key={idx} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">
                          {benefit.length > 25 ? benefit.substring(0, 25) + '...' : benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    v{template.version} • {formatDate(template.lastUpdated)}
                  </div>
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add Template Card */}
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <Plus className="h-12 w-12 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Add New Template</span>
            </div>
          </div>
        )}

        {/* Quick Actions Panel */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Stethoscope className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm text-gray-700">Surgical Consent</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Syringe className="h-8 w-8 text-purple-600 mb-2" />
              <span className="text-sm text-gray-700">Anesthesia Consent</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Camera className="h-8 w-8 text-cyan-600 mb-2" />
              <span className="text-sm text-gray-700">Photography Consent</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <AlertTriangle className="h-8 w-8 text-red-600 mb-2" />
              <span className="text-sm text-gray-700">High-Risk Consent</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <FileText className="h-8 w-8 text-orange-600 mb-2" />
              <span className="text-sm text-gray-700">Research Consent</span>
            </button>
          </div>
        </div>

        {/* New Consent Modal */}
        {showConsentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">New Consent Form</h2>
                <button onClick={() => setShowConsentModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name *</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient MRN *</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                  <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Consent Type *</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select type</option>
                    <option value="surgical">Surgical</option>
                    <option value="anesthesia">Anesthesia</option>
                    <option value="photography">Photography/Recording</option>
                    <option value="research">Research Participation</option>
                    <option value="treatment">Treatment</option>
                    <option value="blood-transfusion">Blood Transfusion</option>
                    <option value="high-risk">High Risk Procedure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select template</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Procedure *</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g., Cataract Surgery (Phaco + IOL)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surgeon *</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select surgeon</option>
                    <option value="dr-mehta">Dr. Arun Mehta</option>
                    <option value="dr-nair">Dr. Priya Nair</option>
                    <option value="dr-rao">Dr. Suresh Rao</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language *</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="english">English</option>
                    <option value="hindi">Hindi</option>
                    <option value="telugu">Telugu</option>
                    <option value="tamil">Tamil</option>
                    <option value="kannada">Kannada</option>
                    <option value="marathi">Marathi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Counselor</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select counselor</option>
                    <option value="priya">Priya Sharma</option>
                    <option value="rahul">Rahul Verma</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="text-sm font-medium text-yellow-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Minor Patient / Guardian Consent
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Name</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="">Select relationship</option>
                      <option value="father">Father</option>
                      <option value="mother">Mother</option>
                      <option value="spouse">Spouse</option>
                      <option value="sibling">Sibling</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowConsentModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Create Consent
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Signature Modal */}
        {showSignatureModal && selectedConsent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Capture Signature</h2>
                <button onClick={() => setShowSignatureModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Patient:</span> {selectedConsent.patientName} ({selectedConsent.patientMRN})
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Procedure:</span> {selectedConsent.procedure}
                  </p>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg h-48 flex items-center justify-center bg-white cursor-crosshair">
                  <div className="text-center">
                    <Pen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Sign here</p>
                    <p className="text-xs text-gray-400">Use mouse or touch to sign</p>
                  </div>
                </div>

                <div className="flex justify-center gap-4 mt-4">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Clear
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-6">
                <input type="checkbox" id="confirm-read" className="rounded text-blue-600" />
                <label htmlFor="confirm-read" className="text-sm text-gray-700">
                  I confirm that I have read and understood all information provided about the procedure, including risks, benefits, and alternatives.
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowSignatureModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowSignatureModal(false)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Save Signature
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedConsent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Consent Details</h2>
                  <p className="text-sm text-gray-500">{selectedConsent.consentNumber}</p>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Patient Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Patient Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Name:</span> {selectedConsent.patientName}</p>
                    <p><span className="text-gray-500">MRN:</span> {selectedConsent.patientMRN}</p>
                    <p><span className="text-gray-500">Age/Gender:</span> {selectedConsent.patientAge} / {selectedConsent.patientGender}</p>
                    {selectedConsent.guardianName && (
                      <p><span className="text-gray-500">Guardian:</span> {selectedConsent.guardianName} ({selectedConsent.guardianRelationship})</p>
                    )}
                  </div>
                </div>

                {/* Procedure Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Procedure Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Procedure:</span> {selectedConsent.procedure}</p>
                    <p><span className="text-gray-500">Surgeon:</span> {selectedConsent.surgeon}</p>
                    <p><span className="text-gray-500">Scheduled:</span> {selectedConsent.scheduledDate ? formatDate(selectedConsent.scheduledDate) : 'Not scheduled'}</p>
                    <p><span className="text-gray-500">Language:</span> {selectedConsent.language}</p>
                  </div>
                </div>

                {/* Checklist */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Pre-Consent Checklist</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Diagnosis explained', value: selectedConsent.diagnosisExplained },
                      { label: 'Procedure explained', value: selectedConsent.procedureExplained },
                      { label: 'Risks explained', value: selectedConsent.risksExplained },
                      { label: 'Benefits explained', value: selectedConsent.benefitsExplained },
                      { label: 'Alternatives discussed', value: selectedConsent.alternativesDiscussed },
                      { label: 'Expected outcome discussed', value: selectedConsent.expectedOutcomeDiscussed },
                      { label: 'Questions answered', value: selectedConsent.questionsAnswered },
                      { label: 'Patient understands', value: selectedConsent.patientUnderstands },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {item.value ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                        <span className={`text-sm ${item.value ? 'text-gray-700' : 'text-gray-400'}`}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Signatures */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Signatures</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Patient Signature</span>
                      {selectedConsent.patientSignature ? (
                        <span className="text-green-600 text-sm flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" /> Signed
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Pending</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Witness</span>
                      {selectedConsent.witnessSignature ? (
                        <span className="text-green-600 text-sm flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" /> {selectedConsent.witnessName}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Pending</span>
                      )}
                    </div>
                    {selectedConsent.guardianName && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Guardian</span>
                        {selectedConsent.guardianSignature ? (
                          <span className="text-green-600 text-sm flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" /> {selectedConsent.guardianName}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">Pending</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Audit Trail */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Audit Trail</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date/Time</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Action</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">User</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedConsent.auditTrail.map((entry, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 text-sm text-gray-600">{entry.date}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{entry.action}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{entry.user}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Print
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
