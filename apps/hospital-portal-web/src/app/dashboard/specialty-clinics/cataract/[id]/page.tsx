'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Layers, Eye, Calculator, FileText, Calendar, Save } from 'lucide-react';
import { useHasPermission } from '@/hooks/use-permissions';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { toast } from 'react-hot-toast';
import LOCSIIIGradingForm from '@/components/specialty-clinics/cataract/LOCSIIIGradingForm';
import IOLCalculator from '@/components/specialty-clinics/cataract/IOLCalculator';
import BiometryIntegration from '@/components/specialty-clinics/cataract/BiometryIntegration';
import SurgeryWorkflow from '@/components/specialty-clinics/cataract/SurgeryWorkflow';

function CataractExaminationPageContent() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState<any>(null);
  const [cataractData, setCataractData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('locs-grading');

  const canEdit = useHasPermission('CLINICAL:CATARACT:EDIT');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // TODO: Replace with actual API calls
        const mockPatient = {
          id: patientId,
          name: 'Lakshmi Devi',
          mrn: 'MRN006789',
          age: 68,
          gender: 'Female',
          dateOfBirth: '1957-08-15',
          surgicalEye: 'OS',
        };

        const mockCataractData = {
          locsGradeOD: { NO: 3.5, NC: 3.2, C: 2.1, P: 0 },
          locsGradeOS: { NO: 4.2, NC: 3.8, C: 1.8, P: 0.5 },
          vaOD: '6/60',
          vaOS: 'CF at 2m',
          biometry: {
            OD: { AL: 23.45, K1: 43.25, K2: 44.50, ACD: 3.12, LT: 4.65, WTW: 11.8 },
            OS: { AL: 23.52, K1: 43.50, K2: 44.75, ACD: 3.05, LT: 4.72, WTW: 11.9 },
          },
          iolPowerOD: 22.0,
          iolPowerOS: 21.5,
          surgeryDate: '2026-02-05',
        };

        setPatientData(mockPatient);
        setCataractData(mockCataractData);
      } catch (error) {
        console.error('Failed to load cataract examination data:', error);
        toast.error('Failed to load patient data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId]);

  const handleSave = async (data: any) => {
    try {
      // TODO: Save cataract examination data
      toast.success('Cataract examination saved successfully');
      router.push('/dashboard/specialty-clinics/cataract');
    } catch (error) {
      console.error('Failed to save cataract examination:', error);
      toast.error('Failed to save examination');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <p className="text-yellow-800">Patient not found</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'locs-grading', label: 'LOCS III Grading', icon: Eye },
    { id: 'iol-calculator', label: 'IOL Calculator', icon: Calculator },
    { id: 'biometry', label: 'Biometry', icon: Layers },
    { id: 'surgery-workflow', label: 'Surgery Workflow', icon: Calendar },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/dashboard/specialty-clinics/cataract')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Layers className="w-7 h-7 mr-3 text-purple-600" />
              Cataract Examination
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              LOCS III Grading, IOL Calculation & Surgery Planning
            </p>
          </div>
        </div>
      </div>

      {/* Patient Information Card */}
      <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
        <div className="flex items-start space-x-6">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
            {patientData.name
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-purple-900 mb-3">{patientData.name}</h2>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-purple-600 font-semibold mb-1">MRN</p>
                <p className="text-sm text-purple-900 font-mono">{patientData.mrn}</p>
              </div>
              <div>
                <p className="text-xs text-purple-600 font-semibold mb-1">Age / Gender</p>
                <p className="text-sm text-purple-900">
                  {patientData.age} years / {patientData.gender}
                </p>
              </div>
              <div>
                <p className="text-xs text-purple-600 font-semibold mb-1">Surgical Eye</p>
                <p className="text-sm text-purple-900 font-bold text-lg">{patientData.surgicalEye}</p>
              </div>
              <div>
                <p className="text-xs text-purple-600 font-semibold mb-1">Surgery Date</p>
                <p className="text-sm text-purple-900 font-semibold">
                  {cataractData?.surgeryDate
                    ? new Date(cataractData.surgeryDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Not scheduled'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Cataract Status */}
      {cataractData && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Current Cataract Status
          </h3>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-md p-4 border border-blue-200">
              <p className="text-sm font-semibold text-blue-900 mb-2">LOCS III - OD</p>
              <p className="text-sm font-mono font-bold text-blue-900">
                NO{cataractData.locsGradeOD.NO} NC{cataractData.locsGradeOD.NC}
              </p>
              <p className="text-sm font-mono font-bold text-blue-900">
                C{cataractData.locsGradeOD.C} P{cataractData.locsGradeOD.P}
              </p>
            </div>

            <div className="bg-white rounded-md p-4 border border-blue-200">
              <p className="text-sm font-semibold text-blue-900 mb-2">LOCS III - OS</p>
              <p className="text-sm font-mono font-bold text-blue-900">
                NO{cataractData.locsGradeOS.NO} NC{cataractData.locsGradeOS.NC}
              </p>
              <p className="text-sm font-mono font-bold text-blue-900">
                C{cataractData.locsGradeOS.C} P{cataractData.locsGradeOS.P}
              </p>
            </div>

            <div className="bg-white rounded-md p-4 border border-blue-200">
              <p className="text-sm font-semibold text-blue-900 mb-2">Visual Acuity</p>
              <p className="text-sm font-mono font-bold text-blue-900">OD: {cataractData.vaOD}</p>
              <p className="text-sm font-mono font-bold text-blue-900">OS: {cataractData.vaOS}</p>
            </div>

            <div className="bg-white rounded-md p-4 border border-blue-200">
              <p className="text-sm font-semibold text-blue-900 mb-2">IOL Power</p>
              {cataractData.iolPowerOD ? (
                <>
                  <p className="text-sm font-mono font-bold text-green-900">OD: +{cataractData.iolPowerOD}D</p>
                  <p className="text-sm font-mono font-bold text-green-900">OS: +{cataractData.iolPowerOS}D</p>
                </>
              ) : (
                <p className="text-sm text-red-700">⚠️ Not calculated</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
        <div className="flex border-b-2 border-gray-200 bg-gray-50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-6 font-semibold text-sm transition-all flex items-center justify-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white border-b-4 border-purple-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'locs-grading' && (
            <LOCSIIIGradingForm
              patientId={patientId}
              currentGrade={cataractData?.locsGradeOD}
              onSave={handleSave}
              canEdit={canEdit}
            />
          )}

          {activeTab === 'iol-calculator' && (
            <IOLCalculator
              patientId={patientId}
              biometry={cataractData?.biometry}
              surgicalEye={patientData?.surgicalEye}
              onSave={handleSave}
              canEdit={canEdit}
            />
          )}

          {activeTab === 'biometry' && (
            <BiometryIntegration
              patientId={patientId}
              currentBiometry={cataractData?.biometry}
              onSave={handleSave}
              canEdit={canEdit}
            />
          )}

          {activeTab === 'surgery-workflow' && (
            <SurgeryWorkflow
              patientId={patientId}
              surgicalEye={patientData?.surgicalEye}
              surgeryDate={cataractData?.surgeryDate}
              onSave={handleSave}
              canEdit={canEdit}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function CataractExaminationPage() {
  return (
    <ProtectedRoute requiredPermission="CLINICAL:CATARACT:VIEW">
      <CataractExaminationPageContent />
    </ProtectedRoute>
  );
}
