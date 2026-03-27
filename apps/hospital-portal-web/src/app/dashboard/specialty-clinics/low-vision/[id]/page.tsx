'use client';

import React, { useState } from 'react';
import { Eye, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import VisualFunctionAssessment from '@/components/specialty-clinics/low-vision/VisualFunctionAssessment';
import LowVisionAids from '@/components/specialty-clinics/low-vision/LowVisionAids';
import RehabilitationPlan from '@/components/specialty-clinics/low-vision/RehabilitationPlan';

export default function LowVisionExaminationPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('function');

  const patient = {
    id: params.id,
    name: 'Sarita Devi',
    age: 78,
    gender: 'Female',
    mrn: 'LV-2026-001',
    diagnosis: 'Dry AMD (Geographic Atrophy) OU',
    vision: { OD: '6/60', OS: '6/120' }
  };

  const tabs = [
    { id: 'function', label: 'Visual Function', icon: '👁️' },
    { id: 'aids', label: 'Low Vision Aids', icon: '🔍' },
    { id: 'rehab', label: 'Rehabilitation', icon: '🎯' }
  ];

  return (
    <div className="p-6 space-y-6">
      <Link href="/dashboard/specialty-clinics/low-vision" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Low Vision Clinic</span>
      </Link>

      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <Eye className="h-12 w-12" />
          <div>
            <h1 className="text-2xl font-bold">{patient.name}</h1>
            <p className="text-blue-100">{patient.age} years • {patient.gender} • MRN: {patient.mrn}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-gray-600">Diagnosis</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">{patient.diagnosis}</p>
        </div>
        <div className="bg-white border-2 border-blue-300 rounded-lg p-4">
          <p className="text-sm font-semibold text-blue-600">Best Corrected Vision</p>
          <p className="text-lg font-semibold text-blue-900 mt-1">OD: {patient.vision.OD} | OS: {patient.vision.OS}</p>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-semibold rounded-t-lg transition-colors ${
                activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg">
        {activeTab === 'function' && <VisualFunctionAssessment patientId={patient.id} />}
        {activeTab === 'aids' && <LowVisionAids patientId={patient.id} diagnosis={patient.diagnosis} />}
        {activeTab === 'rehab' && <RehabilitationPlan patientId={patient.id} />}
      </div>
    </div>
  );
}
