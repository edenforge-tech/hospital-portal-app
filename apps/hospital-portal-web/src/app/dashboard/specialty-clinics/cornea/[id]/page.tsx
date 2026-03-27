'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Eye, Layers, TrendingUp, Activity, FileText, AlertCircle } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import TopographyAnalysis from '@/components/specialty-clinics/cornea/TopographyAnalysis';
import KeratoconusTracker from '@/components/specialty-clinics/cornea/KeratoconusTracker';
import CornealUlcerManagement from '@/components/specialty-clinics/cornea/CornealUlcerManagement';
import KeratoplastyPlanning from '@/components/specialty-clinics/cornea/KeratoplastyPlanning';

type TabType = 'topography' | 'keratoconus' | 'ulcer' | 'keratoplasty';

function CorneaExaminationPageContent() {
  const params = useParams();
  const patientId = params.id as string;

  const [activeTab, setActiveTab] = useState<TabType>('topography');

  // Mock patient data - In production, fetch from API based on patientId
  const patient = {
    id: patientId,
    name: 'Rahul Mehta',
    mrn: 'MRN-789456',
    age: 24,
    gender: 'M',
    cornealCondition: 'Keratoconus OU',
    keratoconusStage: 'Stage 2 (Moderate)',
    lastVisit: '2026-01-20',
    OD: {
      keratometry: { K1: 48.5, K2: 52.3, axis: 85 },
      pachymetry: 465,
      status: 'Progression detected',
    },
    OS: {
      keratometry: { K1: 47.8, K2: 51.5, axis: 88 },
      pachymetry: 478,
      status: 'Stable',
    },
  };

  const tabs = [
    {
      id: 'topography' as TabType,
      label: 'Topography Analysis',
      icon: Layers,
      description: 'Corneal topography and keratoconus screening',
    },
    {
      id: 'keratoconus' as TabType,
      label: 'Keratoconus Tracker',
      icon: TrendingUp,
      description: 'Progression tracking and cross-linking',
    },
    {
      id: 'ulcer' as TabType,
      label: 'Corneal Ulcer',
      icon: Activity,
      description: 'Infectious keratitis management',
    },
    {
      id: 'keratoplasty' as TabType,
      label: 'Keratoplasty Planning',
      icon: FileText,
      description: 'PKP/DALK/DSEK surgery planning',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Patient Demographics */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{patient.name}</h1>
            <div className="flex items-center space-x-4 mt-2 text-purple-100">
              <span>
                <strong>MRN:</strong> {patient.mrn}
              </span>
              <span>
                <strong>Age:</strong> {patient.age}
              </span>
              <span>
                <strong>Gender:</strong> {patient.gender}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-purple-100 text-sm">Last Visit</p>
            <p className="text-xl font-bold">{patient.lastVisit}</p>
          </div>
        </div>
      </div>

      {/* Current Corneal Status Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-purple-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Current Corneal Status</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Corneal Condition</p>
            <p className="text-xl font-bold text-gray-900">{patient.cornealCondition}</p>
          </div>
          {patient.keratoconusStage && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Keratoconus Stage</p>
              <p className="text-xl font-bold text-orange-700">{patient.keratoconusStage}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600 mb-1">Pachymetry (Thinnest)</p>
            <p
              className={`text-xl font-bold ${
                Math.min(patient.OD.pachymetry, patient.OS.pachymetry) < 500
                  ? 'text-orange-700'
                  : 'text-green-700'
              }`}
            >
              {Math.min(patient.OD.pachymetry, patient.OS.pachymetry)} μm
            </p>
          </div>
        </div>

        {/* Keratometry Summary */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-blue-100 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-blue-900">OD (Right Eye)</span>
            </div>
            <p className="text-sm text-gray-700">
              K: {patient.OD.keratometry.K1.toFixed(2)} / {patient.OD.keratometry.K2.toFixed(2)} D
              @ {patient.OD.keratometry.axis}°
            </p>
            <p className="text-sm text-gray-700">Pachymetry: {patient.OD.pachymetry} μm</p>
          </div>

          <div className="bg-green-100 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Eye className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-green-900">OS (Left Eye)</span>
            </div>
            <p className="text-sm text-gray-700">
              K: {patient.OS.keratometry.K1.toFixed(2)} / {patient.OS.keratometry.K2.toFixed(2)} D
              @ {patient.OS.keratometry.axis}°
            </p>
            <p className="text-sm text-gray-700">Pachymetry: {patient.OS.pachymetry} μm</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'topography' && (
            <TopographyAnalysis
              patientId={patientId}
              odData={{
                keratometry: patient.OD.keratometry,
                pachymetry: patient.OD.pachymetry,
              }}
              osData={{
                keratometry: patient.OS.keratometry,
                pachymetry: patient.OS.pachymetry,
              }}
            />
          )}

          {activeTab === 'keratoconus' && (
            <KeratoconusTracker
              patientId={patientId}
              currentStage={patient.keratoconusStage || 'No keratoconus detected'}
              odPachymetry={patient.OD.pachymetry}
              osPachymetry={patient.OS.pachymetry}
            />
          )}

          {activeTab === 'ulcer' && (
            <CornealUlcerManagement patientId={patientId} />
          )}

          {activeTab === 'keratoplasty' && (
            <KeratoplastyPlanning
              patientId={patientId}
              cornealCondition={patient.cornealCondition}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function CorneaExaminationPage() {
  return (
    <ProtectedRoute requiredPermission="CLINICAL:CORNEA:VIEW">
      <CorneaExaminationPageContent />
    </ProtectedRoute>
  );
}
