'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Eye, Activity, Image, Layers, Calendar, Save } from 'lucide-react';
import { useHasPermission } from '@/hooks/use-permissions';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { toast } from 'react-hot-toast';
import DRGradingForm from '@/components/specialty-clinics/retina/DRGradingForm';
import AntiVEGFManagement from '@/components/specialty-clinics/retina/AntiVEGFManagement';
import FundusImageGallery from '@/components/specialty-clinics/retina/FundusImageGallery';

function RetinaExaminationPageContent() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState<any>(null);
  const [retinaData, setRetinaData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dr-grading');

  const canEdit = useHasPermission('CLINICAL:RETINA:EDIT');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // TODO: Replace with actual API calls
        // const patient = await patientsApi.get(patientId);
        // const retina = await retinaApi.getExamination(patientId);
        
        // Mock data
        const mockPatient = {
          id: patientId,
          name: 'Ramesh Kumar',
          mrn: 'MRN001234',
          age: 65,
          gender: 'Male',
          dateOfBirth: '1961-03-15',
          diagnosis: 'Proliferative Diabetic Retinopathy',
          systemicHistory: 'Type 2 Diabetes Mellitus (15 years), Hypertension',
          hba1c: 8.2,
        };

        const mockRetinaData = {
          previousDRGrade: 'Severe NPDR',
          previousVisit: '2026-01-15',
          totalInjections: 12,
          lastInjection: {
            date: '2026-01-15',
            drug: 'Ranibizumab (Lucentis)',
            eye: 'OU',
            dose: '0.5mg',
          },
        };

        setPatientData(mockPatient);
        setRetinaData(mockRetinaData);
      } catch (error) {
        console.error('Failed to load retina examination data:', error);
        toast.error('Failed to load patient data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId]);

  const handleSave = async (data: any) => {
    try {
      // TODO: Save retina examination data
      // await retinaApi.saveExamination(patientId, data);
      
      toast.success('Retina examination saved successfully');
      router.push('/dashboard/specialty-clinics/retina');
    } catch (error) {
      console.error('Failed to save retina examination:', error);
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
    { id: 'dr-grading', label: 'DR Grading', icon: Eye },
    { id: 'anti-vegf', label: 'Anti-VEGF', icon: Activity },
    { id: 'fundus-images', label: 'Fundus Images', icon: Image },
    { id: 'oct-scans', label: 'OCT Scans', icon: Layers },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/dashboard/specialty-clinics/retina')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Eye className="w-7 h-7 mr-3 text-red-600" />
              Retina Examination
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Diabetic Retinopathy Grading & Anti-VEGF Management
            </p>
          </div>
        </div>
      </div>

      {/* Patient Information Card */}
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
        <div className="flex items-start space-x-6">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
            {patientData.name
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-red-900 mb-3">{patientData.name}</h2>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-red-600 font-semibold mb-1">MRN</p>
                <p className="text-sm text-red-900 font-mono">{patientData.mrn}</p>
              </div>
              <div>
                <p className="text-xs text-red-600 font-semibold mb-1">Age / Gender</p>
                <p className="text-sm text-red-900">
                  {patientData.age} years / {patientData.gender}
                </p>
              </div>
              <div>
                <p className="text-xs text-red-600 font-semibold mb-1">Diagnosis</p>
                <p className="text-sm text-red-900 font-semibold">{patientData.diagnosis}</p>
              </div>
              <div>
                <p className="text-xs text-red-600 font-semibold mb-1">HbA1c</p>
                <p
                  className={`text-sm font-bold ${
                    patientData.hba1c > 7 ? 'text-red-900' : 'text-green-900'
                  }`}
                >
                  {patientData.hba1c}%{' '}
                  {patientData.hba1c > 7 ? '(Poor Control ⚠️)' : '(Good Control ✓)'}
                </p>
              </div>
            </div>

            {/* Systemic History */}
            <div className="mt-4 pt-4 border-t-2 border-red-200">
              <p className="text-sm font-semibold text-red-900 mb-2">Systemic History:</p>
              <p className="text-sm text-red-800 bg-white rounded-md p-3 border border-red-200">
                {patientData.systemicHistory}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Previous Examination Summary */}
      {retinaData && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Previous Retina Examination Summary
          </h3>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-md p-4 border border-purple-200">
              <p className="text-sm font-semibold text-purple-900 mb-2">Previous DR Grade</p>
              <p className="text-lg font-bold text-purple-900">{retinaData.previousDRGrade}</p>
              <p className="text-xs text-purple-700 mt-1">
                {new Date(retinaData.previousVisit).toLocaleDateString()}
              </p>
            </div>

            <div className="bg-white rounded-md p-4 border border-purple-200">
              <p className="text-sm font-semibold text-purple-900 mb-2">Total Injections</p>
              <p className="text-lg font-bold text-purple-900">{retinaData.totalInjections}</p>
              <p className="text-xs text-purple-700 mt-1">Lifetime count</p>
            </div>

            <div className="bg-white rounded-md p-4 border border-purple-200">
              <p className="text-sm font-semibold text-purple-900 mb-2">Last Injection</p>
              <p className="text-sm font-bold text-purple-900">{retinaData.lastInjection.drug}</p>
              <p className="text-xs text-purple-700 mt-1">
                {new Date(retinaData.lastInjection.date).toLocaleDateString()} •{' '}
                {retinaData.lastInjection.eye}
              </p>
            </div>

            <div className="bg-white rounded-md p-4 border border-purple-200">
              <p className="text-sm font-semibold text-purple-900 mb-2">Injection Schedule</p>
              <p className="text-sm font-bold text-purple-900">Monthly PRN</p>
              <p className="text-xs text-purple-700 mt-1">Based on response</p>
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
                    ? 'bg-red-600 text-white border-b-4 border-red-800'
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
          {activeTab === 'dr-grading' && (
            <DRGradingForm
              patientId={patientId}
              previousGrade={retinaData?.previousDRGrade}
              onSave={handleSave}
              canEdit={canEdit}
            />
          )}

          {activeTab === 'anti-vegf' && (
            <AntiVEGFManagement
              patientId={patientId}
              injectionHistory={retinaData?.lastInjection}
              totalInjections={retinaData?.totalInjections}
              onSave={handleSave}
              canEdit={canEdit}
            />
          )}

          {activeTab === 'fundus-images' && (
            <FundusImageGallery
              patientId={patientId}
              canEdit={canEdit}
            />
          )}

          {activeTab === 'oct-scans' && (
            <div className="text-center py-12">
              <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">OCT Imaging Module - Phase 2</p>
              <p className="text-sm text-gray-400 mt-2">
                OCT scans and retinal thickness maps will be available in Phase 2
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RetinaExaminationPage() {
  return (
    <ProtectedRoute requiredPermission="CLINICAL:RETINA:VIEW">
      <RetinaExaminationPageContent />
    </ProtectedRoute>
  );
}
