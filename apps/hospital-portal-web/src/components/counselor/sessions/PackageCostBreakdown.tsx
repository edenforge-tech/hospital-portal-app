'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Calculator, TrendingUp, Loader2, IndianRupee, CheckCircle, AlertCircle, Package, Sparkles,
  Printer, Download, Mail, MessageSquare, Share2, Send, X
} from 'lucide-react';
import { toast } from 'sonner';
import { usePackageCost } from '@/hooks/use-master-data';
import { 
  generateCostEstimatePDF, 
  downloadPDF, 
  pdfBlobToBase64,
  CostEstimatePDFData 
} from '@/lib/pdf-generator';
import { shareCostEstimate, ShareCostEstimateRequest } from '@/lib/api/cost-sharing.api';
import { generalSettingsApi } from '@/lib/api/settings.api';

interface PackageCostBreakdownProps {
  branchId: string;
  surgeryTypeId?: string;
  iolCatalogId?: string;
  doctorId?: string;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  patientMRN?: string;
  doctorName?: string;
  onCostCalculated?: (totalCost: number) => void;
}

export default function PackageCostBreakdown({
  branchId,
  surgeryTypeId,
  iolCatalogId,
  doctorId,
  patientName = 'Patient',
  patientEmail,
  patientPhone,
  patientMRN,
  doctorName,
  onCostCalculated,
}: PackageCostBreakdownProps) {
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [isSharingInProgress, setIsSharingInProgress] = useState(false);
  const [shareMethod, setShareMethod] = useState<'email' | 'sms' | 'whatsapp' | null>(null);
  
  const shouldFetch = !!branchId && !!surgeryTypeId;

  // Fetch hospital info from general settings
  const { data: generalSettings } = useQuery({
    queryKey: ['general-settings'],
    queryFn: () => generalSettingsApi.get(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const hospitalName = generalSettings?.organizationName ?? 'Eye Hospital';
  const hospitalPhone = generalSettings?.supportPhone ?? '';
  const hospitalAddress = generalSettings?.address
    ? [generalSettings.address.street, generalSettings.address.city, generalSettings.address.state]
        .filter(Boolean)
        .join(', ')
    : '';

  const { data: packageCost, isLoading, isError, error } = usePackageCost(
    {
      branchId,
      surgeryTypeId: surgeryTypeId || '',
      iolCatalogId,
      doctorId,
    },
    {
      enabled: shouldFetch,
    }
  );

  // Notify parent component of total cost
  useEffect(() => {
    if (packageCost && onCostCalculated) {
      onCostCalculated(packageCost.totalCost);
    }
  }, [packageCost, onCostCalculated]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Generate PDF data from packageCost
  const generatePDFData = (): CostEstimatePDFData | null => {
    if (!packageCost) return null;

    return {
      patientName: patientName || 'Patient',
      patientMRN,
      patientEmail,
      patientPhone,
      doctorName,
      hospitalName: hospitalName,
      hospitalAddress: hospitalAddress,
      hospitalPhone: hospitalPhone,
      surgeryName: packageCost.surgeryName || 'Selected Surgery',
      surgeryCost: packageCost.surgeryCost,
      iolName: packageCost.iolName,
      iolCost: packageCost.iolCost,
      consultationFee: packageCost.consultationFee,
      totalCost: packageCost.totalCost,
      discount: packageCost.savingsAmount,
      finalCost: packageCost.matchedPackagePrice || packageCost.totalCost,
      packageName: packageCost.matchedPackageName,
      validityDays: 30,
      estimateDate: new Date().toLocaleDateString('en-IN'),
      estimateNumber: `EST-${Date.now()}`,
      termsAndConditions: 'By accepting this estimate, you agree to the hospital\'s standard terms and conditions for treatment and billing. All charges are subject to change based on actual services rendered. Payment is due as per hospital policy.',
    };
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle PDF download
  const handleDownloadPDF = async () => {
    try {
      const pdfData = generatePDFData();
      if (!pdfData) {
        toast.error('No cost data available to generate PDF');
        return;
      }

      setIsSharingInProgress(true);
      const pdfBlob = await generateCostEstimatePDF(pdfData);
      downloadPDF(pdfBlob, `cost-estimate-${pdfData.estimateNumber}.pdf`);
      
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsSharingInProgress(false);
    }
  };

  // Handle share via email/SMS/WhatsApp
  const handleShare = async (method: 'email' | 'sms' | 'whatsapp') => {
    try {
      const pdfData = generatePDFData();
      if (!pdfData) {
        toast.error('No cost data available');
        return;
      }

      // Validation
      if (method === 'email' && !patientEmail) {
        toast.error('Patient email address is not available');
        return;
      }

      if ((method === 'sms' || method === 'whatsapp') && !patientPhone) {
        toast.error('Patient phone number is not available');
        return;
      }

      setIsSharingInProgress(true);
      setShareMethod(method);

      // Generate PDF and convert to base64 for email/WhatsApp
      let pdfBase64: string | undefined;
      if (method === 'email' || method === 'whatsapp') {
        const pdfBlob = await generateCostEstimatePDF(pdfData);
        pdfBase64 = await pdfBlobToBase64(pdfBlob);
      }

      // Prepare share request
      const shareRequest: ShareCostEstimateRequest = {
        patientName: pdfData.patientName,
        patientEmail: patientEmail,
        patientPhone: patientPhone,
        totalCost: pdfData.totalCost,
        surgeryName: pdfData.surgeryName,
        doctorName: pdfData.doctorName,
        estimateNumber: pdfData.estimateNumber,
        method,
        pdfBase64,
        pdfFilename: `cost-estimate-${pdfData.estimateNumber}.pdf`,
      };

      // Send via API
      const result = await shareCostEstimate(shareRequest);

      if (result.success) {
        toast.success(`Cost estimate sent via ${method.toUpperCase()} successfully`);
        setIsShareMenuOpen(false);
      } else {
        toast.error(result.error || `Failed to send via ${method.toUpperCase()}`);
      }
    } catch (error) {
      console.error(`Error sharing via ${method}:`, error);
      toast.error(`Failed to send cost estimate via ${method.toUpperCase()}`);
    } finally {
      setIsSharingInProgress(false);
      setShareMethod(null);
    }
  };

  if (!shouldFetch) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
        <Calculator className="w-10 h-10 mx-auto mb-3 text-gray-400" />
        <p className="text-sm text-gray-600">
          {!branchId 
            ? 'Select a patient to see cost breakdown' 
            : 'Select a surgery to see cost breakdown'}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 bg-white border-2 border-blue-200 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calculator className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Package Cost</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
          <p className="text-sm text-center text-gray-500">Calculating package cost...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-red-50 border-2 border-red-200 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-red-900">Cost Calculation Error</h3>
        </div>
        <p className="text-sm text-red-600">
          {error instanceof Error ? error.message : 'Failed to calculate package cost'}
        </p>
      </div>
    );
  }

  if (!packageCost) {
    return null;
  }

  const costItems = [
    {
      label: 'Surgery',
      name: packageCost.surgeryName || 'Selected Surgery',
      amount: packageCost.surgeryCost,
      icon: TrendingUp,
      color: 'blue',
    },
    ...(packageCost.iolCost > 0
      ? [
          {
            label: 'IOL',
            name: packageCost.iolName || 'Intraocular Lens',
            amount: packageCost.iolCost,
            icon: TrendingUp,
            color: 'purple' as const,
          },
        ]
      : []),
    {
      label: 'Consultation',
      name: 'Consultation Fee',
      amount: packageCost.consultationFee,
      icon: TrendingUp,
      color: 'green' as const,
    },
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Package Cost Breakdown</h3>
            <p className="text-xs text-gray-600">Real-time pricing calculation</p>
          </div>
        </div>
        {packageCost.hasBranchOverrides && (
          <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Branch Pricing
          </span>
        )}
      </div>

      {/* Cost Items */}
      <div className="space-y-3 mb-6">
        {costItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  item.color === 'blue'
                    ? 'bg-blue-100'
                    : item.color === 'purple'
                    ? 'bg-purple-100'
                    : 'bg-green-100'
                }`}
              >
                <item.icon
                  className={`w-4 h-4 ${
                    item.color === 'blue'
                      ? 'text-blue-600'
                      : item.color === 'purple'
                      ? 'text-purple-600'
                      : 'text-green-600'
                  }`}
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{item.label}</p>
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
              </div>
            </div>
            <p className="text-base font-semibold text-gray-900">
              {formatCurrency(item.amount)}
            </p>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="pt-4 border-t-2 border-blue-300">
        <div className="flex items-center justify-between p-4 bg-blue-600 rounded-lg">
          <div>
            <p className="text-xs text-blue-100 uppercase tracking-wide mb-1">
              Total Package Cost
            </p>
            <p className="text-sm text-blue-100">
              {costItems.length} {costItems.length === 1 ? 'item' : 'items'} included
            </p>
          </div>
          <p className="text-3xl font-bold text-white">
            {formatCurrency(packageCost.totalCost)}
          </p>
        </div>
      </div>

      {/* Share Actions */}
      <div className="mt-6 flex flex-wrap gap-2">
        {/* Print Button */}
        <button
          type="button"
          onClick={handlePrint}
          className="flex-1 min-w-[120px] px-4 py-2.5 bg-white border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 rounded-lg font-medium transition-all flex items-center justify-center gap-2 print:hidden"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>

        {/* Download PDF Button */}
        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={isSharingInProgress}
          className="flex-1 min-w-[120px] px-4 py-2.5 bg-white border-2 border-gray-300 hover:border-green-500 text-gray-700 hover:text-green-600 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed print:hidden"
        >
          {isSharingInProgress && shareMethod === null ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Download PDF
        </button>

        {/* Share Dropdown */}
        <div className="relative flex-1 min-w-[120px] print:hidden">
          <button
            type="button"
            onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
            disabled={isSharingInProgress}
            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>

          {/* Dropdown Menu */}
          {isShareMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border-2 border-gray-200 z-10">
              <div className="p-2">
                <button
                  type="button"
                  onClick={() => handleShare('email')}
                  disabled={isSharingInProgress || !patientEmail}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isSharingInProgress && shareMethod === 'email' ? (
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  ) : (
                    <Mail className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">Email</div>
                    <div className="text-xs text-gray-500">
                      {patientEmail || 'No email available'}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleShare('sms')}
                  disabled={isSharingInProgress || !patientPhone}
                  className="w-full px-4 py-3 text-left hover:bg-green-50 rounded-lg transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-started group mt-1"
                >
                  {isSharingInProgress && shareMethod === 'sms' ? (
                    <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                  ) : (
                    <MessageSquare className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">SMS</div>
                    <div className="text-xs text-gray-500">
                      {patientPhone || 'No phone available'}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleShare('whatsapp')}
                  disabled={isSharingInProgress || !patientPhone}
                  className="w-full px-4 py-3 text-left hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group mt-1"
                >
                  {isSharingInProgress && shareMethod === 'whatsapp' ? (
                    <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">WhatsApp</div>
                    <div className="text-xs text-gray-500">
                      {patientPhone || 'No phone available'}
                    </div>
                  </div>
                </button>
              </div>

              <div className="border-t border-gray-200 p-2">
                <button
                  type="button"
                  onClick={() => setIsShareMenuOpen(false)}
                  className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Print-only styles */}
      <style jsx>{`
        @media print {
          /* Hide everything except this component */
          body * {
            visibility: hidden;
          }
          
          .print\\:block, .print\\:block * {
            visibility: visible;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          /* Optimize for printing */
          @page {
            margin: 1cm;
            size: A4;
          }
          
          /* Remove backgrounds to save ink */
          * {
            background: white !important;
            color: black !important;
          }
          
          /* Keep borders for tables */
          .border, .border-t-2, .border-blue-300 {
            border-color: #000 !important;
          }
        }
      `}</style>

      {/* Package Template Comparison (Phase 3 Enhancement) */}
      {packageCost.hasMatchingPackage && packageCost.savingsAmount && packageCost.savingsAmount > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" />
              <h4 className="text-base font-semibold text-green-900">Package Deal Available</h4>
            </div>
            <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full flex items-center gap-1 animate-pulse">
              <Sparkles className="w-3 h-3" />
              SAVE {packageCost.savingsPercentage}%
            </span>
          </div>
          
          <div className="bg-white rounded-lg p-4 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{packageCost.matchedPackageName}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Pre-configured package with all services included
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(packageCost.matchedPackagePrice || 0)}
                </p>
                <p className="text-xs text-gray-500">Package price</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">
                You save {formatCurrency(packageCost.savingsAmount)} with this package
              </span>
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
              onClick={() => {
                toast.success(`Package "${packageCost.matchedPackageName}" selected`, {
                  description: `Package price: ${formatCurrency(packageCost.matchedPackagePrice || 0)} — saves ${formatCurrency(packageCost.savingsAmount)}`,
                });
                if (onCostCalculated && packageCost.matchedPackagePrice) {
                  onCostCalculated(packageCost.matchedPackagePrice);
                }
              }}
            >
              Use This Package
            </button>
          </div>
        </div>
      )}

      {/* Footer Note */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-yellow-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            This is an estimated cost. Actual charges may vary based on patient condition,
            additional procedures, and hospital policies. Please confirm with billing before
            finalizing.
          </span>
        </p>
      </div>
    </div>
  );
}
