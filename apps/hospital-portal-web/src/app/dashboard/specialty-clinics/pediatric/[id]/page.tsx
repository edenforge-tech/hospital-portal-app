'use client';

import React, { useState } from 'react';
import { Baby, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CycloplegicRefraction from '@/components/specialty-clinics/pediatric/CycloplegicRefraction';
import AmbliopiaScreening from '@/components/specialty-clinics/pediatric/AmbliopiaScreening';
import StrabismusAssessment from '@/components/specialty-clinics/pediatric/StrabismusAssessment';
import DevelopmentalMilestones from '@/components/specialty-clinics/pediatric/DevelopmentalMilestones';

export default function PediatricExaminationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('cycloplegic');

  // Mock patient data
  const patient = {
    id: params.id,
    name: 'Aarav Kumar',
    age: '7 years 3 months',
    ageMonths: 87,
    gender: 'Male',
    mrn: 'PED-2026-001',
    dateOfBirth: '2018-10-15',
    chiefComplaint: 'Failed school vision screening',
    currentCondition: 'Anisometropic amblyopia OS',
    visionOD: '6/12',
    visionOS: '6/60',
    amblyopia: true,
    strabismus: null,
    refractionOD: { sphere: +1.00, cylinder: -0.50, axis: 85 },
    refractionOS: { sphere: +4.50, cylinder: -1.00, axis: 92 },
    developmentalAge: 'On track',
  };

  const tabs = [
    { id: 'cycloplegic', label: 'Cycloplegic Refraction', icon: '🔬' },
    { id: 'amblyopia', label: 'Amblyopia Screening', icon: '👁️' },
    { id: 'strabismus', label: 'Strabismus Assessment', icon: '🎯' },
    { id: 'developmental', label: 'Developmental Milestones', icon: '📊' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push('/dashboard/specialty-clinics/pediatric')}
        className="flex items-center space-x-2 text-pink-600 hover:text-pink-700 font-semibold transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Pediatric Clinic</span>
      </button>

      {/* Patient Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="bg-white rounded-full p-3">
              <Baby className="w-8 h-8 text-pink-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{patient.name}</h1>
              <div className="flex items-center space-x-4 mt-2 text-pink-100">
                <span>
                  {patient.age} ({patient.gender})
                </span>
                <span>•</span>
                <span>MRN: {patient.mrn}</span>
                <span>•</span>
                <span>DOB: {patient.dateOfBirth}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Condition Summary */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Current Pediatric Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-600 mb-1">Chief Complaint</p>
            <p className="font-bold text-purple-900">{patient.chiefComplaint}</p>
          </div>
          <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
            <p className="text-sm text-pink-600 mb-1">Current Condition</p>
            <p className="font-bold text-pink-900">{patient.currentCondition}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 mb-1">Vision OD</p>
            <p className="text-2xl font-bold text-blue-900">{patient.visionOD}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-600 mb-1">Vision OS</p>
            <p className="text-2xl font-bold text-green-900">{patient.visionOS}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
        <div className="flex border-b-2 border-gray-200 bg-gray-50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-6 font-semibold transition-all flex items-center justify-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-pink-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'cycloplegic' && (
            <CycloplegicRefraction
              patientId={patient.id}
              ageMonths={patient.ageMonths}
              currentRefractionOD={patient.refractionOD}
              currentRefractionOS={patient.refractionOS}
            />
          )}
          {activeTab === 'amblyopia' && (
            <AmbliopiaScreening
              patientId={patient.id}
              ageMonths={patient.ageMonths}
              visionOD={patient.visionOD}
              visionOS={patient.visionOS}
              hasAmblyopia={patient.amblyopia}
            />
          )}
          {activeTab === 'strabismus' && (
            <StrabismusAssessment
              patientId={patient.id}
              ageMonths={patient.ageMonths}
              hasStrabismus={patient.strabismus !== null}
              strabismusType={patient.strabismus}
            />
          )}
          {activeTab === 'developmental' && (
            <DevelopmentalMilestones patientId={patient.id} ageMonths={patient.ageMonths} />
          )}
        </div>
      </div>
    </div>
  );
}
