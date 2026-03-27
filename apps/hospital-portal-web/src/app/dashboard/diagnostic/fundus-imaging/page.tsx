'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { 
  Plus, Search, Camera, Eye, Upload, Calendar, User, 
  Download, ZoomIn, ZoomOut, RotateCw, Grid, ImagePlus,
  AlertTriangle, CheckCircle, Clock
} from 'lucide-react';

interface FundusImage {
  id: string;
  patientMRN: string;
  patientName: string;
  captureDate: string;
  eye: 'OD' | 'OS' | 'OU';
  imageType: 'color' | 'red-free' | 'autofluorescence' | 'wide-field';
  drGrading?: {
    level: 'No DR' | 'Mild NPDR' | 'Moderate NPDR' | 'Severe NPDR' | 'PDR';
    dme: boolean;
    findings: string[];
  };
  quality: 'good' | 'acceptable' | 'poor';
  photographer: string;
  interpretedBy?: string;
  interpretedAt?: string;
  status: 'pending-review' | 'reviewed' | 'requires-followup';
  thumbnailUrl?: string;
  notes?: string;
}

const mockImages: FundusImage[] = [
  {
    id: '1',
    patientMRN: 'MRN-2024-0456',
    patientName: 'Rajesh Kumar',
    captureDate: '2024-01-15T09:30:00',
    eye: 'OD',
    imageType: 'color',
    drGrading: {
      level: 'Moderate NPDR',
      dme: true,
      findings: ['Microaneurysms', 'Hard exudates', 'Macular edema'],
    },
    quality: 'good',
    photographer: 'Suresh Tech',
    interpretedBy: 'Dr. Sharma',
    interpretedAt: '2024-01-15T10:15:00',
    status: 'requires-followup',
    notes: 'Patient needs anti-VEGF evaluation',
  },
  {
    id: '2',
    patientMRN: 'MRN-2024-0456',
    patientName: 'Rajesh Kumar',
    captureDate: '2024-01-15T09:32:00',
    eye: 'OS',
    imageType: 'color',
    drGrading: {
      level: 'Mild NPDR',
      dme: false,
      findings: ['Few microaneurysms'],
    },
    quality: 'good',
    photographer: 'Suresh Tech',
    interpretedBy: 'Dr. Sharma',
    interpretedAt: '2024-01-15T10:18:00',
    status: 'reviewed',
  },
  {
    id: '3',
    patientMRN: 'MRN-2024-0789',
    patientName: 'Sunita Devi',
    captureDate: '2024-01-15T11:00:00',
    eye: 'OU',
    imageType: 'wide-field',
    quality: 'acceptable',
    photographer: 'Amit Tech',
    status: 'pending-review',
    notes: 'Wide-field imaging for peripheral retina evaluation',
  },
  {
    id: '4',
    patientMRN: 'MRN-2024-0234',
    patientName: 'Mohammed Ali',
    captureDate: '2024-01-14T14:30:00',
    eye: 'OD',
    imageType: 'autofluorescence',
    drGrading: {
      level: 'No DR',
      dme: false,
      findings: [],
    },
    quality: 'good',
    photographer: 'Priya Tech',
    interpretedBy: 'Dr. Patel',
    interpretedAt: '2024-01-14T15:00:00',
    status: 'reviewed',
  },
];

export default function FundusImagingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [imageTypeFilter, setImageTypeFilter] = useState<string>('ALL');
  const [selectedImage, setSelectedImage] = useState<FundusImage | null>(null);

  const filteredImages = mockImages.filter(img => {
    const matchesSearch = img.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          img.patientMRN.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || img.status === statusFilter;
    const matchesType = imageTypeFilter === 'ALL' || img.imageType === imageTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending-review':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending Review</span>;
      case 'reviewed':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Reviewed</span>;
      case 'requires-followup':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Requires Follow-up</span>;
      default:
        return null;
    }
  };

  const getDRBadge = (level?: string) => {
    if (!level) return null;
    const colors: Record<string, string> = {
      'No DR': 'bg-green-100 text-green-800',
      'Mild NPDR': 'bg-yellow-100 text-yellow-800',
      'Moderate NPDR': 'bg-orange-100 text-orange-800',
      'Severe NPDR': 'bg-red-100 text-red-800',
      'PDR': 'bg-red-200 text-red-900',
    };
    return <span className={`px-2 py-1 text-xs rounded-full font-medium ${colors[level]}`}>{level}</span>;
  };

  const getQualityBadge = (quality: string) => {
    const colors: Record<string, string> = {
      'good': 'bg-green-100 text-green-800',
      'acceptable': 'bg-yellow-100 text-yellow-800',
      'poor': 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-1 text-xs rounded-full ${colors[quality]}`}>{quality}</span>;
  };

  // Statistics
  const totalImages = mockImages.length;
  const pendingReview = mockImages.filter(i => i.status === 'pending-review').length;
  const drPositive = mockImages.filter(i => i.drGrading && i.drGrading.level !== 'No DR').length;
  const dmePositive = mockImages.filter(i => i.drGrading?.dme).length;

  return (
    <ProtectedRoute requiredPermission="DIAGNOSTIC:IMAGING:VIEW">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Camera className="h-8 w-8 text-blue-600" />
              Fundus Imaging & Photography
            </h1>
            <p className="text-gray-600 mt-1">
              Capture, grade, and manage retinal imaging for diabetic retinopathy screening
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/diagnostic/fundus-imaging/new')}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ImagePlus className="h-5 w-5" />
            Capture New Image
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Images</p>
                <p className="text-2xl font-bold text-blue-900">{totalImages}</p>
              </div>
              <Camera className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-900">{pendingReview}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">DR Positive</p>
                <p className="text-2xl font-bold text-orange-900">{drPositive}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">DME Present</p>
                <p className="text-2xl font-bold text-red-900">{dmePositive}</p>
              </div>
              <Eye className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Normal</p>
                <p className="text-2xl font-bold text-green-900">{totalImages - drPositive}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name or MRN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="pending-review">Pending Review</option>
            <option value="reviewed">Reviewed</option>
            <option value="requires-followup">Requires Follow-up</option>
          </select>
          <select
            value={imageTypeFilter}
            onChange={(e) => setImageTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Image Types</option>
            <option value="color">Color</option>
            <option value="red-free">Red-Free</option>
            <option value="autofluorescence">Autofluorescence</option>
            <option value="wide-field">Wide-Field</option>
          </select>
        </div>

        {/* Images Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredImages.map((img) => (
            <div 
              key={img.id} 
              className={`bg-white rounded-lg shadow border p-4 cursor-pointer transition-all hover:shadow-lg ${
                img.status === 'requires-followup' ? 'border-l-4 border-l-red-500' : ''
              }`}
              onClick={() => setSelectedImage(img)}
            >
              <div className="flex gap-4">
                {/* Image Placeholder */}
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Camera className="h-12 w-12 text-gray-400" />
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{img.patientName}</h3>
                      <p className="text-sm text-gray-500">{img.patientMRN}</p>
                    </div>
                    {getStatusBadge(img.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span className="text-gray-500">Eye:</span>
                      <span className="ml-1 font-medium">{img.eye}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <span className="ml-1 font-medium capitalize">{img.imageType.replace('-', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <span className="ml-1">{new Date(img.captureDate).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Quality:</span>
                      <span className="ml-1">{getQualityBadge(img.quality)}</span>
                    </div>
                  </div>

                  {img.drGrading && (
                    <div className="bg-gray-50 rounded p-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-500">DR Grading:</span>
                        {getDRBadge(img.drGrading.level)}
                        {img.drGrading.dme && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800">DME+</span>
                        )}
                      </div>
                      {img.drGrading.findings.length > 0 && (
                        <p className="text-xs text-gray-600">
                          Findings: {img.drGrading.findings.join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t flex justify-between items-center text-sm">
                <div>
                  <span className="text-gray-500">Captured by:</span>
                  <span className="ml-1 text-gray-700">{img.photographer}</span>
                  {img.interpretedBy && (
                    <>
                      <span className="mx-2 text-gray-300">|</span>
                      <span className="text-gray-500">Reviewed by:</span>
                      <span className="ml-1 text-gray-700">{img.interpretedBy}</span>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="p-1.5 text-gray-400 hover:text-blue-600 rounded">
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-blue-600 rounded">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredImages.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Upload className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Images Found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || statusFilter !== 'ALL' || imageTypeFilter !== 'ALL' 
                ? 'No images match your search criteria' 
                : 'Start by capturing fundus photographs'}
            </p>
            <button
              onClick={() => router.push('/dashboard/diagnostic/fundus-imaging/new')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Capture New Image
            </button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
