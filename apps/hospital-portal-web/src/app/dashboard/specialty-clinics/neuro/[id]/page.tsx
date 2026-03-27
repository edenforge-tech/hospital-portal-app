'use client';

import React, { useState } from 'react';
import { Brain, Activity, Eye, Target, Droplet } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import OpticNeuropathyAssessment from '@/components/specialty-clinics/neuro/OpticNeuropathyAssessment';
import RAPDTesting from '@/components/specialty-clinics/neuro/RAPDTesting';
import CranialNerveExam from '@/components/specialty-clinics/neuro/CranialNerveExam';
import NeuroVisualField from '@/components/specialty-clinics/neuro/NeuroVisualField';
import PupilReactions from '@/components/specialty-clinics/neuro/PupilReactions';

export default function NeuroExaminationPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('optic-neuropathy');

  // Mock patient data (would come from API)
  const patientData = {
    id: params.id,
    name: 'Rajesh Kumar',
    age: 45,
    gender: 'M' as const,
    mrn: 'NEURO-2026-001',
    chiefComplaint: 'Sudden vision loss OD, headache',
    diagnosis: 'Anterior Ischemic Optic Neuropathy (AION) - Arteritic',
    visionOD: 'CF 1m',
    visionOS: '6/6',
    rapd: 'OD' as const,
    rapdGrade: 2.4,
    visualField: 'Altitudinal defect OD (inferior)',
    opticDisc: 'OD: Pale, swollen. OS: Normal',
  };

  const tabs = [
    {
      id: 'optic-neuropathy',
      label: 'Optic Neuropathy',
      icon: <Eye className="w-4 h-4" />,
    },
    {
      id: 'rapd',
      label: 'RAPD Testing',
      icon: <Activity className="w-4 h-4" />,
    },
    {
      id: 'cranial-nerve',
      label: 'Cranial Nerve Exam',
      icon: <Brain className="w-4 h-4" />,
    },
    {
      id: 'visual-field',
      label: 'Visual Field Defects',
      icon: <Target className="w-4 h-4" />,
    },
    {
      id: 'pupils',
      label: 'Pupil Reactions',
      icon: <Droplet className="w-4 h-4" />,
    },
  ];

  return (
    <ProtectedRoute requiredPermission="CLINICAL:NEURO:VIEW">
      <div className="p-6 space-y-6">
        {/* Patient Demographics */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{patientData.name}</h1>
              <div className="flex items-center space-x-4 mt-2 text-purple-100">
                <span>
                  {patientData.age} years • {patientData.gender === 'M' ? 'Male' : 'Female'}
                </span>
                <span>MRN: {patientData.mrn}</span>
              </div>
            </div>
            <Brain className="w-16 h-16 opacity-50" />
          </div>
        </div>

        {/* Current Neuro Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4 border-2 border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Chief Complaint</p>
            <p className="font-semibold text-gray-900">{patientData.chiefComplaint}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-2 border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Diagnosis</p>
            <p className="font-semibold text-gray-900">{patientData.diagnosis}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-2 border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Vision</p>
            <p className="font-semibold text-gray-900">
              OD: {patientData.visionOD} | OS: {patientData.visionOS}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-2 border-red-300">
            <p className="text-sm text-red-600 mb-1">RAPD</p>
            <p className="font-bold text-red-900">
              {patientData.rapd} ({patientData.rapdGrade} log units)
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md border-2 border-gray-200">
          <div className="border-b-2 border-gray-200">
            <div className="flex space-x-1 p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'optic-neuropathy' && (
              <OpticNeuropathyAssessment
                patientId={patientData.id}
                visionOD={patientData.visionOD}
                visionOS={patientData.visionOS}
                diagnosis={patientData.diagnosis}
              />
            )}
            {activeTab === 'rapd' && (
              <RAPDTesting
                patientId={patientData.id}
                rapdPresent={patientData.rapd !== 'None'}
                affectedEye={patientData.rapd === 'None' ? null : patientData.rapd}
                rapdGrade={patientData.rapdGrade}
              />
            )}
            {activeTab === 'cranial-nerve' && (
              <CranialNerveExam patientId={patientData.id} diagnosis={patientData.diagnosis} />
            )}
            {activeTab === 'visual-field' && (
              <NeuroVisualField
                patientId={patientData.id}
                defectPattern={patientData.visualField}
              />
            )}
            {activeTab === 'pupils' && (
              <PupilReactions
                patientId={patientData.id}
                rapdPresent={patientData.rapd !== 'None'}
                diagnosis={patientData.diagnosis}
              />
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
