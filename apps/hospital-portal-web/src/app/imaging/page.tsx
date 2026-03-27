// Medical Imaging Module - Phase 7 Complete Integration
// Professional implementation with all Phase 1-8 features

'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import {
  Printer,
  Activity,
  TrendingUp,
  Calendar,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore} from '@/lib/auth-store';
import { getApi } from '@/lib/api';

// Simple icon components for fallback
const UploadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const GridIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth={2} />
    <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth={2} />
    <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth={2} />
    <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth={2} />
  </svg>
);

const CompareIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
  </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

// Dynamic imports for client-side only components
const ImageUploadDialog = dynamic(() => import('@/components/imaging/ImageUploadDialog'), { ssr: false });
const ImageGallery = dynamic(() => import('@/components/imaging/ImageGallery'), { ssr: false });
const SimpleDICOMViewer = dynamic(() => import('@/components/imaging/SimpleDICOMViewer'), { ssr: false });
const DICOMViewer = dynamic(() => import('@/components/imaging/DICOMViewer'), { ssr: false });
const ComparisonViewer = dynamic(() => import('@/components/imaging/ComparisonViewer'), { ssr: false });
const ExportDialog = dynamic(() => import('@/components/imaging/ExportDialog'), { ssr: false });
const OCTLayerSegmentation = dynamic(() => import('@/components/imaging/OCTLayerSegmentation'), { ssr: false });
const OCTProgressionDashboard = dynamic(() => import('@/components/imaging/OCTProgressionDashboard'), { ssr: false });
const TimelineView = dynamic(() => import('@/components/imaging/TimelineView'), { ssr: false });

type ViewMode = 'viewer' | 'gallery' | 'comparison' | 'segmentation' | 'progression' | 'timeline';

interface ImagingOrder {
  id: string;
  patientId: string;
  patientName: string;
  orderDate: Date;
  modality: string;
  eye?: 'OD' | 'OS';
  description: string;
  status: string;
  imageCount?: number;
}

export default function ImagingModulePage() {
  const { tenantId } = useAuthStore();
  const [patientId, setPatientId] = useState<string>('P001'); // Default patient
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [currentOrder, setCurrentOrder] = useState<ImagingOrder | null>(null);
  const [orders, setOrders] = useState<ImagingOrder[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [comparisonImageIds, setComparisonImageIds] = useState<{ baseline: string; followup: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Fetch patient's imaging orders
  useEffect(() => {
    // TODO: Get patientId from route params or context
    fetchPatientOrders(patientId);
  }, [tenantId, patientId]);

  const fetchPatientOrders = async (patientId: string) => {
    setIsLoading(true);
    try {
      const api = getApi();
      const response = await api.get(`/Imaging/patient/${patientId}`);
      setOrders(response.data);
      if (response.data.length > 0) {
        setCurrentOrder(response.data[0]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch imaging orders:', error);
      
      // Fallback to demo data for testing
      const demoOrders: ImagingOrder[] = [
        {
          id: 'demo-oct-001',
          patientId: patientId,
          patientName: 'John Smith',
          orderDate: new Date('2026-02-22'),
          modality: 'OCT',
          eye: 'OD',
          description: 'Macular OCT - Glaucoma Follow-up',
          status: 'completed',
          imageCount: 4,
        },
        {
          id: 'demo-fundus-001',
          patientId: patientId,
          patientName: 'John Smith',
          orderDate: new Date('2026-02-20'),
          modality: 'Fundus',
          eye: 'OS',
          description: 'Color Fundus Photography - Diabetic Retinopathy Screening',
          status: 'completed',
          imageCount: 2,
        },
        {
          id: 'demo-vf-001',
          patientId: patientId,
          patientName: 'John Smith',
          orderDate: new Date('2026-02-15'),
          modality: 'Visual Field',
          eye: 'OD',
          description: '24-2 Visual Field Test',
          status: 'completed',
          imageCount: 2,
        },
      ];
      
      toast('Using demo data - Backend API not available', { icon: 'ℹ️', duration: 3000 });
      setOrders(demoOrders);
      setCurrentOrder(demoOrders[0]);
      setIsLoading(false);
    }
  };

  const handleUploadComplete = (images: any[]) => {
    toast.success(`Successfully uploaded ${images.length} images`);
    setShowUploadDialog(false);
    // Refresh orders
    if (currentOrder) {
      fetchPatientOrders(currentOrder.patientId);
    }
  };

  const handleImageSelect = (image: any) => {
    setSelectedImageId(image.id);
    setSelectedImage(image);
    setViewMode('viewer');
  };

  const handleCompare = (baseline: any, followup: any) => {
    setComparisonImageIds({
      baseline: baseline.id,
      followup: followup.id,
    });
    setViewMode('comparison');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <span className="text-2xl">📷</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Medical Imaging
                </h1>
                <p className="text-sm text-slate-600 mt-0.5 font-medium">
                  {currentOrder ? (
                    <span className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md text-xs font-semibold">{currentOrder.modality}</span>
                      {currentOrder.patientName}
                    </span>
                  ) : 'Select a study to begin'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {currentOrder && (
                <>
                  <button
                    onClick={() => setShowUploadDialog(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 font-medium"
                  >
                    <UploadIcon className="w-4 h-4" />
                    Upload Images
                  </button>
                  <button
                    onClick={() => setShowExportDialog(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 font-medium"
                  >
                    <Printer className="w-4 h-4" />
                    Export/Print
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          {currentOrder && (
            <div className="flex items-center gap-2 mt-5 border-t border-gray-200/50 pt-4">
              <button
                onClick={() => setViewMode('gallery')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-medium ${
                  viewMode === 'gallery'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200'
                    : 'text-slate-600 hover:bg-white/60 hover:shadow-md'
                }`}
              >
                <GridIcon className="w-4 h-4" />
                Gallery
              </button>
              <button
                onClick={() => setViewMode('viewer')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-medium ${
                  viewMode === 'viewer'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200'
                    : 'text-slate-600 hover:bg-white/60 hover:shadow-md'
                } ${!selectedImageId ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!selectedImageId}
              >
                <EyeIcon className="w-4 h-4" />
                Viewer
              </button>
              <button
                onClick={() => setViewMode('comparison')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-medium ${
                  viewMode === 'comparison'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200'
                    : 'text-slate-600 hover:bg-white/60 hover:shadow-md'
                }`}
              >
                <CompareIcon className="w-4 h-4" />
                Compare
              </button>
              {currentOrder.modality === 'OCT' && (
                <>
                  <button
                    onClick={() => setViewMode('segmentation')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-medium ${
                      viewMode === 'segmentation'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200'
                        : 'text-slate-600 hover:bg-white/60 hover:shadow-md'
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                    Segmentation
                  </button>
                  <button
                    onClick={() => setViewMode('progression')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-medium ${
                      viewMode === 'progression'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200'
                        : 'text-slate-600 hover:bg-white/60 hover:shadow-md'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    Progression
                  </button>
                </>
              )}
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-medium ${
                  viewMode === 'timeline'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200'
                    : 'text-slate-600 hover:bg-white/60 hover:shadow-md'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Timeline
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* No Orders State */}
        {!isLoading && orders.length === 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 p-16 text-center shadow-xl shadow-slate-200/50">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">
              No Imaging Orders
            </h3>
            <p className="text-slate-600 max-w-md mx-auto">
              No imaging studies found for this patient. Upload images to get started.
            </p>
          </div>
        )}

        {/* Content Grid with Sidebar */}
        {!isLoading && orders.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Orders List */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 p-5 sticky top-24 shadow-xl shadow-slate-200/50">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></span>
                  Recent Studies
                </h2>
                <div className="space-y-3">
                  {orders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => setCurrentOrder(order)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        currentOrder?.id === order.id
                          ? 'border-indigo-400 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg shadow-indigo-100'
                          : 'border-gray-200/50 hover:border-indigo-300 bg-white/50 hover:bg-white hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-slate-800">
                          {order.patientName}
                        </span>
                        {order.eye && (
                          <span className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg font-semibold">
                            {order.eye}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-indigo-600 mb-1.5">{order.modality}</div>
                      <div className="text-xs text-slate-600 line-clamp-2 mb-2">{order.description}</div>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200/50">
                        <span className="text-xs text-slate-500 font-medium">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </span>
                        {order.imageCount !== undefined && (
                        <span className="text-xs bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-2.5 py-1 rounded-lg font-bold">
                          {order.imageCount} 🖼️
                        </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className={`${viewMode === 'viewer' || viewMode === 'comparison' ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
              {currentOrder && (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 p-6 shadow-xl shadow-slate-200/50">
                  {/* Gallery View */}
                  {viewMode === 'gallery' && (
                    <Suspense fallback={<div>Loading Gallery...</div>}>
                      <ImageGallery
                        orderId={currentOrder.id}
                        onImageSelect={handleImageSelect}
                      />
                    </Suspense>
                  )}

                  {/* Viewer View */}
                  {viewMode === 'viewer' && (
                    <Suspense fallback={<div>Loading Viewer...</div>}>
                      {selectedImageId && selectedImage ? (
                        <SimpleDICOMViewer
                          imageId={selectedImageId}
                          imageUrl={selectedImage.imageUrl}
                          patientName={patientId}
                          studyDescription={selectedImage.modality?.toUpperCase() || 'Medical Image'}
                          seriesDescription={selectedImage.fileName}
                          onAnnotationCreate={(annotation) => {
                            console.log('Annotation created:', annotation);
                            toast.success('Annotation created');
                          }}
                          onAnnotationUpdate={(id, updates) => {
                            console.log('Annotation updated:', id, updates);
                            toast.success('Annotation updated');
                          }}
                          onAnnotationDelete={(id) => {
                            console.log('Annotation deleted:', id);
                            toast.success('Annotation deleted');
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-96 text-center p-8">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-6">
                            <EyeIcon className="w-10 h-10 text-indigo-600" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-800 mb-2">No Image Selected</h3>
                          <p className="text-slate-600 max-w-sm">Please select an image from the Gallery first to view and annotate</p>
                          <button
                            onClick={() => setViewMode('gallery')}
                            className="mt-6 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg font-medium"
                          >
                            Go to Gallery
                          </button>
                        </div>
                      )}
                    </Suspense>
                  )}

                  {/* Comparison View */}
                  {viewMode === 'comparison' && (
                    <Suspense fallback={<div>Loading Comparison...</div>}>
                      {comparisonImageIds ? (
                        <ComparisonViewer
                          baselineImage={{
                            id: comparisonImageIds.baseline,
                            url: '',
                            patientName: currentOrder.patientName,
                            studyDate: currentOrder.orderDate.toISOString(),
                            studyDescription: 'Baseline Study'
                          }}
                          followupImage={{
                            id: comparisonImageIds.followup,
                            url: '',
                            patientName: currentOrder.patientName,
                            studyDate: currentOrder.orderDate.toISOString(),
                            studyDescription: 'Follow-up Study'
                          }}
                          patientId={currentOrder.patientId}
                          enableTimeline={true}
                          enableDifferenceOverlay={true}
                          onClose={() => setViewMode('gallery')}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-96 text-center p-8">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-6">
                            <CompareIcon className="w-10 h-10 text-indigo-600" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-800 mb-2">No Images Selected for Comparison</h3>
                          <p className="text-slate-600 max-w-sm">Select multiple images from the Timeline view to compare them side-by-side</p>
                          <button
                            onClick={() => setViewMode('timeline')}
                            className="mt-6 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg font-medium"
                          >
                            Go to Timeline
                          </button>
                        </div>
                      )}
                    </Suspense>
                  )}

                  {/* OCT Segmentation */}
                  {viewMode === 'segmentation' && currentOrder.modality === 'OCT' && (
                    <Suspense fallback={<div>Loading Segmentation...</div>}>
                      <OCTLayerSegmentation
                        scanId={selectedImageId || currentOrder.id}
                        patientId={currentOrder.patientId}
                        patientName={currentOrder.patientName}
                        eye={currentOrder.eye || 'OD'}
                        imageUrl=""
                        onSave={(analysis) => toast.success('Analysis saved successfully')}
                      />
                    </Suspense>
                  )}

                  {/* OCT Progression Dashboard */}
                  {viewMode === 'progression' && currentOrder.modality === 'OCT' && (
                    <Suspense fallback={<div>Loading Progression...</div>}>
                      <OCTProgressionDashboard
                        patientId={currentOrder.patientId}
                        patientName={currentOrder.patientName}
                        eye={currentOrder.eye || 'OD'}
                        dateOfBirth={new Date(1975, 5, 15)}
                        onExportReport={() => setShowExportDialog(true)}
                      />
                    </Suspense>
                  )}

                  {/* Timeline View */}
                  {viewMode === 'timeline' && (
                    <Suspense fallback={<div>Loading Timeline...</div>}>
                      <TimelineView
                        patientId={currentOrder.patientId}
                        onStudySelect={(study) => {
                          const order = orders.find(o => o.id === study.id);
                          if (order) setCurrentOrder(order);
                          setViewMode('gallery');
                        }}
                        onCompare={(baseline, followup) => handleCompare(baseline, followup)}
                      />
                    </Suspense>
                  )}
                </div>
              )}
            </div>

            {/* Side Panel - Annotations (placeholder) */}
            {(viewMode === 'viewer' || viewMode === 'comparison') && selectedImageId && (
              <div className="lg:col-span-1">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 p-5 shadow-xl shadow-slate-200/50">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Annotations</h3>
                  <p className="text-sm text-slate-600">Select an image to view annotations</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      {showUploadDialog && currentOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl">
            <ImageUploadDialog
              orderId={currentOrder.id}
              onUploadComplete={handleUploadComplete}
              onClose={() => setShowUploadDialog(false)}
              isOpen={showUploadDialog}
            />
          </div>
        </div>
      )}

      {/* Export Dialog */}
      {showExportDialog && currentOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl">
            <ExportDialog
              orderId={currentOrder.id}
              exportType="order"
              onClose={() => setShowExportDialog(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
