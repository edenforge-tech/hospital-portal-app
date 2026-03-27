'use client';

import { useState, useEffect } from 'react';
import { ExamCard, ActionButton, StatusBadge } from './ExamCard';
import { Download, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import OrderImagingDialog from '@/components/clinical/OrderImagingDialog';
import OCTViewerDialog from '@/components/clinical/OCTViewerDialog';
import ImageUploadDialog from '@/components/imaging/ImageUploadDialog';
import ImageGallery from '@/components/imaging/ImageGallery';
import { imagingApi } from '@/lib/api/imaging.api';
import toast from 'react-hot-toast';

// Type definitions
interface ImagingOrder {
  id: string;
  orderDate: string;
  imagingType: string;
  laterality: 'OD' | 'OS' | 'OU';
  urgency: 'routine' | 'urgent' | 'stat';
  status: 'pending' | 'in-progress' | 'completed' | 'reviewed';
  orderedBy: string;
  notes?: string;
  images?: ImagingImage[];
  reportUrl?: string;
  completedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

interface ImagingImage {
  id: string;
  thumbnailUrl: string;
  fullUrl: string;
  dicomUrl?: string;
  modality: string;
  captureDate: string;
  seriesDescription?: string;
}

interface ImagingTabProps {
  patientId: string;
  canEdit: boolean;
  onOrderImaging?: (order: Partial<ImagingOrder>) => void;
  onViewImage?: (imageId: string) => void;
  onDownloadImage?: (imageId: string) => void;
}

export default function ImagingTab({
  patientId,
  canEdit,
  onOrderImaging,
  onViewImage,
  onDownloadImage,
}: ImagingTabProps) {
  // ========== STATE ==========
  const [orders, setOrders] = useState<ImagingOrder[]>([]);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ImagingOrder | null>(null);
  const [loading, setLoading] = useState(false);
  
  // OCT Viewer state
  const [showOCTViewer, setShowOCTViewer] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImagingImage | null>(null);
  const [patientName, setPatientName] = useState('Patient'); // TODO: Get from patient context

  // Upload state
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadOrderId, setUploadOrderId] = useState<string | null>(null);

  // ========== IMAGING TYPES ==========
  const imagingTypes = [
    { value: 'OCT Macula', label: 'OCT Macula', icon: '🔬' },
    { value: 'OCT RNFL', label: 'OCT RNFL (Glaucoma)', icon: '📊' },
    { value: 'OCT Anterior Segment', label: 'OCT Anterior Segment', icon: '🔍' },
    { value: 'Fundus Photography', label: 'Fundus Photography', icon: '📷' },
    { value: 'Fundus Fluorescein Angiography (FFA)', label: 'FFA', icon: '💉' },
    { value: 'Fundus Autofluorescence', label: 'Fundus Autofluorescence', icon: '✨' },
    { value: 'Visual Field Test', label: 'Visual Field (Humphrey)', icon: '🎯' },
    { value: 'Corneal Topography', label: 'Corneal Topography', icon: '🗺️' },
    { value: 'Pachymetry', label: 'Pachymetry', icon: '📏' },
    { value: 'B-Scan Ultrasound', label: 'B-Scan Ultrasound', icon: '🔊' },
    { value: 'A-Scan Biometry', label: 'A-Scan Biometry', icon: '📐' },
    { value: 'Specular Microscopy', label: 'Specular Microscopy', icon: '🔬' },
    { value: 'IOPGonioscopy', label: 'IOP/Gonioscopy', icon: '👁️' },
  ];

  // ========== EFFECTS ==========
  useEffect(() => {
    loadOrders();
  }, [patientId]);

  // ========== HANDLERS ==========
  const loadOrders = async () => {
    setLoading(true);
    try {
      // Fetch imaging orders from backend API
      const response = await imagingApi.getPatientOrders(patientId);
      
      // Map backend response to frontend structure
      const mappedOrders: ImagingOrder[] = response.map(order => ({
        id: order.id,
        orderDate: order.orderedAt,
        imagingType: order.imagingType,
        laterality: (order.laterality as 'OD' | 'OS' | 'OU') || 'OU',
        urgency: (order.urgency.toLowerCase() as 'routine' | 'urgent' | 'stat'),
        status: mapBackendStatus(order.status),
        orderedBy: order.orderingDoctorName,
        notes: order.notes,
        completedAt: order.completedAt,
        reviewedBy: order.reviewedByUserId ? 'Reviewed' : undefined,
        reviewedAt: order.reviewedAt,
        // TODO: Load actual images from DICOM storage
        images: order.imageStoragePath ? [{
          id: order.id + '-img',
          thumbnailUrl: order.imageStoragePath,
          fullUrl: order.imageStoragePath,
          dicomUrl: order.dicomStudyId ? `/dicom/${order.dicomStudyId}` : undefined,
          modality: order.imagingType,
          captureDate: order.completedAt || order.orderedAt,
          seriesDescription: order.resultSummary,
        }] : [],
      }));
      
      setOrders(mappedOrders);
    } catch (error) {
      console.error('Error loading imaging orders:', error);
      toast.error('Failed to load imaging orders');
      // Set empty array on error
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to map backend status to frontend status
  const mapBackendStatus = (backendStatus: string): 'pending' | 'in-progress' | 'completed' | 'reviewed' => {
    const status = backendStatus.toLowerCase();
    if (status === 'pending') return 'pending';
    if (status === 'in progress' || status === 'in-progress') return 'in-progress';
    if (status === 'completed') return 'completed';
    if (status === 'reviewed') return 'reviewed';
    return 'pending'; // default
  };

  const handleOrderSubmit = async (order: Partial<ImagingOrder>) => {
    try {
      // Create imaging order via backend API
      await imagingApi.createOrder({
        patientId: patientId,
        imagingType: order.imagingType || '',
        laterality: order.laterality,
        urgency: order.urgency?.charAt(0).toUpperCase() + order.urgency?.slice(1) as 'Routine' | 'Urgent' | 'Stat',
        clinicalIndication: order.notes,
        notes: order.notes,
      });
      
      toast.success('Imaging order created successfully');
      setShowOrderDialog(false);
      loadOrders(); // Reload orders
      
      if (onOrderImaging) {
        onOrderImaging(order);
      }
    } catch (error) {
      console.error('Error creating imaging order:', error);
      toast.error('Failed to create imaging order');
    }
  };

  const handleViewImage = (imageId: string) => {
    // Find the image and its parent order
    let foundImage: ImagingImage | null = null;
    let foundOrder: ImagingOrder | null = null;
    
    for (const order of orders) {
      if (order.images) {
        const image = order.images.find(img => img.id === imageId);
        if (image) {
          foundImage = image;
          foundOrder = order;
          break;
        }
      }
    }
    
    if (foundImage && foundImage.dicomUrl) {
      // Open DICOM viewer for OCT scans
      setSelectedImage(foundImage);
      setSelectedOrder(foundOrder);
      setShowOCTViewer(true);
    } else if (foundImage) {
      // Open regular image viewer for non-DICOM images (e.g., fundus photos)
      window.open(foundImage.fullUrl, '_blank');
    }
    
    if (onViewImage) {
      onViewImage(imageId);
    }
  };

  const handleDownloadImage = (imageId: string) => {
    if (onDownloadImage) {
      onDownloadImage(imageId);
    }
    toast.success('Image download started');
  };

  const handleOpenUploadDialog = (orderId: string) => {
    setUploadOrderId(orderId);
    setShowUploadDialog(true);
  };

  const handleUploadComplete = (images: any[]) => {
    toast.success(`${images.length} image(s) uploaded successfully`);
    setShowUploadDialog(false);
    setUploadOrderId(null);
    loadOrders(); // Reload orders to show new images
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'reviewed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'pending' => {
    switch (status) {
      case 'pending':
        return 'pending';
      case 'in-progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'reviewed':
        return 'info';
      default:
        return 'neutral';
    }
  };

  const getUrgencyColor = (urgency: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'pending' => {
    switch (urgency) {
      case 'routine':
        return 'neutral';
      case 'urgent':
        return 'warning';
      case 'stat':
        return 'error';
      default:
        return 'neutral';
    }
  };

  // ========== RENDER ==========
  return (
    <div className="space-y-4">
      {/* ========== SECTION 1: ORDER NEW IMAGING ========== */}
      <ExamCard
        title="Order Imaging Studies"
        icon={<span className="text-xl">🔬</span>}
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Order diagnostic imaging studies (OCT, Visual Fields, Fundus Photography, etc.)
          </p>
          <div className="flex gap-2">
            <ActionButton
              variant="primary"
              onClick={() => setShowOrderDialog(true)}
              icon={<span className="text-base">+</span>}
              disabled={!canEdit}
            >
              Order New Imaging Study
            </ActionButton>
            <ActionButton
              variant="secondary"
              onClick={() => window.open('/imaging', '_blank')}
              icon={<span className="text-base">⛶</span>}
            >
              Open Full Imaging Module
            </ActionButton>
          </div>
          <p className="text-xs text-blue-600 border-l-2 border-blue-300 pl-2 bg-blue-50 p-2 rounded">
            💡 <strong>Tip:</strong> Use the Full Imaging Module for detailed DICOM viewing, OCT layer segmentation, 
            progression analysis, and advanced imaging tools.
          </p>
        </div>
      </ExamCard>

      {/* ========== SECTION 2: IMAGING ORDERS LIST ========== */}
      <ExamCard
        title="Imaging Orders & Results"
        icon={<span className="text-xl">🔬</span>}
        badge={
          orders.length > 0
            ? { text: `${orders.length} Order(s)`, variant: 'info' }
            : { text: 'None', variant: 'neutral' }
        }
      >
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="text-sm text-gray-600 mt-2">Loading imaging orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <span className="text-4xl mb-2 block">🔬</span>
            <p className="text-sm">No imaging orders yet</p>
            <p className="text-xs text-gray-400 mt-1">Order imaging studies using the button above</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors bg-white"
              >
                {/* Order Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {order.imagingType}
                      </h4>
                      <StatusBadge
                        text={order.laterality}
                        variant={order.laterality === 'OU' ? 'info' : 'neutral'}
                      />
                      <StatusBadge
                        text={order.urgency.toUpperCase()}
                        variant={getUrgencyColor(order.urgency)}
                      />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>
                        Ordered: {new Date(order.orderDate).toLocaleDateString()}
                      </span>
                      <span>By: {order.orderedBy}</span>
                      {order.completedAt && (
                        <span>
                          Completed: {new Date(order.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {order.notes && (
                      <p className="text-sm text-gray-700 mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                        {order.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <StatusBadge
                      text={order.status.toUpperCase()}
                      variant={getStatusColor(order.status)}
                    />
                  </div>
                </div>

                {/* Upload Images Button */}
                <div className="mb-4">
                  <ActionButton
                    variant="secondary"
                    onClick={() => handleOpenUploadDialog(order.id)}
                    icon={<span className="text-base">⬆️</span>}
                    disabled={!canEdit || order.status === 'reviewed'}
                  >
                    Upload Images
                  </ActionButton>
                </div>

                {/* Images Gallery */}
                <ImageGallery
                  orderId={order.id}
                  onImageSelect={(image) => {
                    // Handle image selection - could open DICOM viewer
                    console.log('Image selected:', image);
                  }}
                />

                {/* Report Link */}
                {order.reportUrl && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <a
                      href={order.reportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Download Report
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ExamCard>

      {/* Order Imaging Dialog */}
      <OrderImagingDialog
        isOpen={showOrderDialog}
        onClose={() => setShowOrderDialog(false)}
        onSubmit={handleOrderSubmit}
        imagingTypes={imagingTypes}
      />

      {/* OCT Viewer Dialog */}
      {showOCTViewer && selectedImage && (
        <OCTViewerDialog
          isOpen={showOCTViewer}
          onClose={() => {
            setShowOCTViewer(false);
            setSelectedImage(null);
            setSelectedOrder(null);
          }}
          patientName={patientName}
          dicomUrl={selectedImage.dicomUrl || selectedImage.fullUrl}
          studyDescription={selectedOrder?.imagingType}
          scanDate={selectedImage.captureDate}
          eye={selectedOrder?.laterality}
          scanType={selectedImage.seriesDescription}
        />
      )}

      {/* Image Upload Dialog */}
      {showUploadDialog && uploadOrderId && (
        <ImageUploadDialog
          orderId={uploadOrderId}
          onUploadComplete={handleUploadComplete}
          onClose={() => {
            setShowUploadDialog(false);
            setUploadOrderId(null);
          }}
          isOpen={showUploadDialog}
        />
      )}
    </div>
  );
}
