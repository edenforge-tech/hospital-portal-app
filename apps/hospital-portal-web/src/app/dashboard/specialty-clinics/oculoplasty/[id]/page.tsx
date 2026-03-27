'use client';

import React, { useState } from 'react';
import { Eye, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import PtosisMeasurement from '@/components/specialty-clinics/oculoplasty/PtosisMeasurement';
import EyelidLesions from '@/components/specialty-clinics/oculoplasty/EyelidLesions';
import LacrimalAssessment from '@/components/specialty-clinics/oculoplasty/LacrimalAssessment';

export default function OculoplastyExaminationPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('ptosis');

  // Mock patient data
  const patient = {
    id: params.id,
    name: 'Ramesh Patel',
    age: 68,
    gender: 'Male',
    mrn: 'OCULO-2026-001',
    diagnosis: 'Bilateral Ptosis (Involutional)',
    chiefComplaint: 'Droopy eyelids, difficulty seeing',
    od: {
      mrd1: 1.5,
      mrd2: 5.0,
      levatorFunction: 8,
      severity: 'Severe'
    },
    os: {
      mrd1: 1.0,
      mrd2: 5.0,
      levatorFunction: 7,
      severity: 'Severe'
    }
  };

  const tabs = [
    { id: 'ptosis', label: 'Ptosis Measurement', icon: '👁️' },
    { id: 'lesions', label: 'Eyelid Lesions', icon: '🔍' },
    { id: 'lacrimal', label: 'Lacrimal Assessment', icon: '💧' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <Link
        href="/dashboard/specialty-clinics/oculoplasty"
        className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Oculoplasty Clinic</span>
      </Link>

      {/* Patient Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <Eye className="h-12 w-12" />
          <div>
            <h1 className="text-2xl font-bold">{patient.name}</h1>
            <p className="text-purple-100">
              {patient.age} years • {patient.gender} • MRN: {patient.mrn}
            </p>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-gray-600">Chief Complaint</p>
          <p className="text-lg text-gray-900 mt-1">{patient.chiefComplaint}</p>
        </div>
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-gray-600">Diagnosis</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">{patient.diagnosis}</p>
        </div>
        <div className="bg-white border-2 border-purple-300 rounded-lg p-4">
          <p className="text-sm font-semibold text-purple-600">Ptosis Severity</p>
          <p className="text-lg font-semibold text-purple-900 mt-1">
            OD: {patient.od.severity} | OS: {patient.os.severity}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-semibold rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg">
        {activeTab === 'ptosis' && (
          <PtosisMeasurement
            patientId={patient.id}
            odMrd1={patient.od.mrd1}
            osMrd1={patient.os.mrd1}
          />
        )}
        {activeTab === 'lesions' && <EyelidLesions patientId={patient.id} />}
        {activeTab === 'lacrimal' && <LacrimalAssessment patientId={patient.id} />}
      </div>
    </div>
  );
}
