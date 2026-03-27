'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Droplet, Grid, Eye, Activity, Target, Save } from 'lucide-react';
import { useHasPermission } from '@/hooks/use-permissions';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { toast } from 'react-hot-toast';
import IOPTrackingChart from '@/components/specialty-clinics/glaucoma/IOPTrackingChart';
import VisualFieldAnalysis from '@/components/specialty-clinics/glaucoma/VisualFieldAnalysis';
import GonioscopyAssessment from '@/components/specialty-clinics/glaucoma/GonioscopyAssessment';
import GlaucomaMedicationTracker from '@/components/specialty-clinics/glaucoma/GlaucomaMedicationTracker';

function GlaucomaExaminationPageContent() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState<any>(null);
  const [glaucomaData, setGlaucomaData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('iop-tracking');

  const canEdit = useHasPermission('CLINICAL:GLAUCOMA:EDIT');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // TODO: Replace with actual API calls
        const mockPatient = {
          id: patientId,
          name: 'Suresh Babu',
          mrn: 'MRN004567',
          age: 72,
          gender: 'Male',
          dateOfBirth: '1954-05-20',
          diagnosis: 'Primary Open Angle Glaucoma',
          glaucomaType: 'POAG',
          yearsDiagnosed: 8,
          familyHistory: 'Father had glaucoma',
        };

        const mockGlaucomaData = {
          currentIOP: { OD: 38, OS: 36 },
          targetIOP: 14,
          previousIOP: { OD: 42, OS: 40, date: '2026-01-20' },
          cdRatio: { OD: 0.8, OS: 0.7 },
          md: { OD: -12.5, OS: -8.3 },
          medications: 3,
          surgeries: ['Trabeculectomy OD (2022)'],
        };

        setPatientData(mockPatient);
        setGlaucomaData(mockGlaucomaData);
      } catch (error) {
        console.error('Failed to load glaucoma examination data:', error);
        toast.error('Failed to load patient data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId]);

  const handleSave = async (data: any) => {
    try {
      // TODO: Save glaucoma examination data
      toast.success('Glaucoma examination saved successfully');
      router.push('/dashboard/specialty-clinics/glaucoma');
    } catch (error) {
      console.error('Failed to save glaucoma examination:', error);
      toast.error('Failed to save examination');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
    { id: 'iop-tracking', label: 'IOP Tracking', icon: Droplet },
    { id: 'visual-fields', label: 'Visual Fields', icon: Grid },
    { id: 'gonioscopy', label: 'Gonioscopy', icon: Eye },
    { id: 'medications', label: 'Medications', icon: Activity },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/dashboard/specialty-clinics/glaucoma')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Droplet className="w-7 h-7 mr-3 text-blue-600" />
              Glaucoma Examination
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              IOP Management, Visual Field Analysis & Medication Monitoring
            </p>
          </div>
        </div>
      </div>

      {/* Patient Information Card */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
            {patientData.name
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-blue-900 mb-3">{patientData.name}</h2>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-blue-600 font-semibold mb-1">MRN</p>
                <p className="text-sm text-blue-900 font-mono">{patientData.mrn}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold mb-1">Age / Gender</p>
                <p className="text-sm text-blue-900">
                  {patientData.age} years / {patientData.gender}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold mb-1">Diagnosis</p>
                <p className="text-sm text-blue-900 font-semibold">{patientData.diagnosis}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold mb-1">Years Diagnosed</p>
                <p className="text-sm text-blue-900 font-bold">{patientData.yearsDiagnosed} years</p>
              </div>
            </div>

            {/* Family History */}
            <div className="mt-4 pt-4 border-t-2 border-blue-200">
              <p className="text-sm font-semibold text-blue-900 mb-2">Family History:</p>
              <p className="text-sm text-blue-800 bg-white rounded-md p-3 border border-blue-200">
                {patientData.familyHistory}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Glaucoma Status */}
      {glaucomaData && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Current Glaucoma Status
          </h3>

          <div className="grid grid-cols-5 gap-4">
            <div className="bg-white rounded-md p-4 border border-purple-200">
              <p className="text-sm font-semibold text-purple-900 mb-2">Current IOP</p>
              <p className={`text-lg font-bold ${
                Math.max(glaucomaData.currentIOP.OD, glaucomaData.currentIOP.OS) > 21
                  ? 'text-red-900'
                  : 'text-green-900'
              }`}>
                OD: {glaucomaData.currentIOP.OD} mmHg
              </p>
              <p className={`text-lg font-bold ${
                Math.max(glaucomaData.currentIOP.OD, glaucomaData.currentIOP.OS) > 21
                  ? 'text-red-900'
                  : 'text-green-900'
              }`}>
                OS: {glaucomaData.currentIOP.OS} mmHg
              </p>
            </div>

            <div className="bg-white rounded-md p-4 border border-purple-200">
              <p className="text-sm font-semibold text-purple-900 mb-2">Target IOP</p>
              <p className="text-lg font-bold text-green-900">≤{glaucomaData.targetIOP} mmHg</p>
              <p className="text-xs text-purple-700 mt-2">
                {Math.max(glaucomaData.currentIOP.OD, glaucomaData.currentIOP.OS) <=
                glaucomaData.targetIOP
                  ? '✓ At target'
                  : '⚠️ Above target'}
              </p>
            </div>

            <div className="bg-white rounded-md p-4 border border-purple-200">
              <p className="text-sm font-semibold text-purple-900 mb-2">C/D Ratio</p>
              <p className="text-sm font-bold text-purple-900">OD: {glaucomaData.cdRatio.OD}</p>
              <p className="text-sm font-bold text-purple-900">OS: {glaucomaData.cdRatio.OS}</p>
            </div>

            <div className="bg-white rounded-md p-4 border border-purple-200">
              <p className="text-sm font-semibold text-purple-900 mb-2">MD (dB)</p>
              <p className="text-sm font-bold text-purple-900">OD: {glaucomaData.md.OD}</p>
              <p className="text-sm font-bold text-purple-900">OS: {glaucomaData.md.OS}</p>
            </div>

            <div className="bg-white rounded-md p-4 border border-purple-200">
              <p className="text-sm font-semibold text-purple-900 mb-2">Medications</p>
              <p className="text-2xl font-bold text-purple-900">{glaucomaData.medications}</p>
              <p className="text-xs text-purple-700 mt-1">Active drugs</p>
            </div>
          </div>

          {/* Previous Surgeries */}
          {glaucomaData.surgeries && glaucomaData.surgeries.length > 0 && (
            <div className="mt-4 pt-4 border-t-2 border-purple-200">
              <p className="text-sm font-semibold text-purple-900 mb-2">Previous Surgeries:</p>
              <div className="flex flex-wrap gap-2">
                {glaucomaData.surgeries.map((surgery: string, index: number) => (
                  <span
                    key={index}
                    className="bg-white border border-purple-300 rounded-full px-4 py-2 text-sm text-purple-900"
                  >
                    {surgery}
                  </span>
                ))}
              </div>
            </div>
          )}
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
                    ? 'bg-blue-600 text-white border-b-4 border-blue-800'
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
          {activeTab === 'iop-tracking' && (
            <IOPTrackingChart
              patientId={patientId}
              currentIOP={glaucomaData?.currentIOP}
              targetIOP={glaucomaData?.targetIOP}
              onSave={handleSave}
              canEdit={canEdit}
            />
          )}

          {activeTab === 'visual-fields' && (
            <VisualFieldAnalysis
              patientId={patientId}
              currentMD={glaucomaData?.md}
              onSave={handleSave}
              canEdit={canEdit}
            />
          )}

          {activeTab === 'gonioscopy' && (
            <GonioscopyAssessment
              patientId={patientId}
              glaucomaType={patientData?.glaucomaType}
              onSave={handleSave}
              canEdit={canEdit}
            />
          )}

          {activeTab === 'medications' && (
            <GlaucomaMedicationTracker
              patientId={patientId}
              activeMedications={glaucomaData?.medications}
              onSave={handleSave}
              canEdit={canEdit}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function GlaucomaExaminationPage() {
  return (
    <ProtectedRoute requiredPermission="CLINICAL:GLAUCOMA:VIEW">
      <GlaucomaExaminationPageContent />
    </ProtectedRoute>
  );
}
