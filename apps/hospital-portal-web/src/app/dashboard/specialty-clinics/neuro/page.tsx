'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Brain, Eye, AlertTriangle, Activity, Target, ChevronRight } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface NeuroPatient {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F';
  mrn: string;
  chiefComplaint: string;
  diagnosis: string;
  visionOD: string;
  visionOS: string;
  rapd: 'None' | 'OD' | 'OS';
  rapdGrade?: string;
  visualField: string;
  opticDisc: string;
  urgency: 'Routine' | 'Urgent' | 'Emergency';
  lastVisit: string;
  nextAction: string;
}

export default function NeuroClinicPage() {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  const patients: NeuroPatient[] = [
    {
      id: 'neuro-001',
      name: 'Rajesh Kumar',
      age: 45,
      gender: 'M',
      mrn: 'NEURO-2026-001',
      chiefComplaint: 'Sudden vision loss OD, headache',
      diagnosis: 'Anterior Ischemic Optic Neuropathy (AION) - Arteritic',
      visionOD: 'CF 1m',
      visionOS: '6/6',
      rapd: 'OD',
      rapdGrade: '2.4 log units',
      visualField: 'Altitudinal defect OD (inferior)',
      opticDisc: 'OD: Pale, swollen. OS: Normal',
      urgency: 'Emergency',
      lastVisit: '2026-01-26',
      nextAction: 'URGENT: ESR/CRP, Temporal artery biopsy, IV methylprednisolone',
    },
    {
      id: 'neuro-002',
      name: 'Priya Sharma',
      age: 28,
      gender: 'F',
      mrn: 'NEURO-2026-002',
      chiefComplaint: 'Blurred vision OS, pain with eye movement',
      diagnosis: 'Optic Neuritis (Demyelinating)',
      visionOD: '6/6',
      visionOS: '6/24',
      rapd: 'OS',
      rapdGrade: '1.2 log units',
      visualField: 'Central scotoma OS',
      opticDisc: 'OD: Normal. OS: Mild swelling',
      urgency: 'Urgent',
      lastVisit: '2026-01-25',
      nextAction: 'MRI brain/orbits with contrast, IV methylprednisolone, Neurology referral',
    },
    {
      id: 'neuro-003',
      name: 'Arun Patel',
      age: 52,
      gender: 'M',
      mrn: 'NEURO-2026-003',
      chiefComplaint: 'Double vision when looking right',
      diagnosis: 'Left VI Nerve Palsy (Abducens)',
      visionOD: '6/6',
      visionOS: '6/6',
      rapd: 'None',
      visualField: 'Full OU',
      opticDisc: 'Normal OU',
      urgency: 'Urgent',
      lastVisit: '2026-01-24',
      nextAction: 'MRI brain, HbA1c, rule out microvascular ischemia vs SOF mass',
    },
    {
      id: 'neuro-004',
      name: 'Deepa Reddy',
      age: 62,
      gender: 'F',
      mrn: 'NEURO-2026-004',
      chiefComplaint: 'Headache, transient vision loss OU',
      diagnosis: 'Papilledema (Idiopathic Intracranial Hypertension)',
      visionOD: '6/9',
      visionOS: '6/9',
      rapd: 'None',
      visualField: 'Enlarged blind spots OU',
      opticDisc: 'Bilateral disc edema, Frisen grade 3',
      urgency: 'Urgent',
      lastVisit: '2026-01-23',
      nextAction: 'MRI/MRV brain, Lumbar puncture (opening pressure), Neurology consult',
    },
    {
      id: 'neuro-005',
      name: 'Vikram Singh',
      age: 38,
      gender: 'M',
      mrn: 'NEURO-2026-005',
      chiefComplaint: 'Ptosis OD, double vision',
      diagnosis: 'Right III Nerve Palsy (Oculomotor) - Pupil sparing',
      visionOD: '6/6',
      visionOS: '6/6',
      rapd: 'None',
      visualField: 'Full OU',
      opticDisc: 'Normal OU',
      urgency: 'Urgent',
      lastVisit: '2026-01-22',
      nextAction: 'MRI/MRA brain, rule out aneurysm vs microvascular (diabetic)',
    },
    {
      id: 'neuro-006',
      name: 'Anjali Iyer',
      age: 34,
      gender: 'F',
      mrn: 'NEURO-2026-006',
      chiefComplaint: 'Peripheral vision loss temporal fields',
      diagnosis: 'Bitemporal Hemianopia (Pituitary Adenoma)',
      visionOD: '6/6',
      visionOS: '6/6',
      rapd: 'None',
      visualField: 'Bitemporal hemianopia',
      opticDisc: 'Mild temporal pallor OU',
      urgency: 'Urgent',
      lastVisit: '2026-01-21',
      nextAction: 'MRI pituitary with dedicated views, Endocrinology consult, Neurosurgery',
    },
    {
      id: 'neuro-007',
      name: 'Suresh Menon',
      age: 56,
      gender: 'M',
      mrn: 'NEURO-2026-007',
      chiefComplaint: 'Small pupil OD, droopy eyelid',
      diagnosis: "Horner's Syndrome (Right)",
      visionOD: '6/6',
      visionOS: '6/6',
      rapd: 'None',
      visualField: 'Full OU',
      opticDisc: 'Normal OU',
      urgency: 'Routine',
      lastVisit: '2026-01-20',
      nextAction: 'Cocaine test, Apraclonidine test, MRI neck/chest (rule out Pancoast tumor)',
    },
    {
      id: 'neuro-008',
      name: 'Kavita Desai',
      age: 48,
      gender: 'F',
      mrn: 'NEURO-2026-008',
      chiefComplaint: 'Large pupil OS, photophobia',
      diagnosis: "Adie's Tonic Pupil (Left)",
      visionOD: '6/6',
      visionOS: '6/6',
      rapd: 'None',
      visualField: 'Full OU',
      opticDisc: 'Normal OU',
      urgency: 'Routine',
      lastVisit: '2026-01-19',
      nextAction: 'Pilocarpine 0.125% test (denervation supersensitivity), Reassurance',
    },
  ];

  const statistics = [
    {
      label: 'Total Patients',
      value: patients.length,
      icon: <Brain className="w-6 h-6 text-purple-600" />,
      color: 'bg-purple-100',
    },
    {
      label: 'Optic Neuropathy',
      value: patients.filter((p) => p.diagnosis.toLowerCase().includes('optic')).length,
      icon: <Eye className="w-6 h-6 text-orange-600" />,
      color: 'bg-orange-100',
    },
    {
      label: 'RAPD Positive',
      value: patients.filter((p) => p.rapd !== 'None').length,
      icon: <Activity className="w-6 h-6 text-red-600" />,
      color: 'bg-red-100',
    },
    {
      label: 'Cranial Nerve Palsies',
      value: patients.filter((p) => p.diagnosis.toLowerCase().includes('nerve palsy')).length,
      icon: <Target className="w-6 h-6 text-blue-600" />,
      color: 'bg-blue-100',
    },
  ];

  const quickActions = [
    {
      label: 'RAPD Testing',
      icon: <Activity className="w-5 h-5" />,
      gradient: 'from-red-500 to-orange-600',
      action: () => console.log('RAPD Testing'),
    },
    {
      label: 'Visual Field Defects',
      icon: <Target className="w-5 h-5" />,
      gradient: 'from-blue-500 to-cyan-600',
      action: () => console.log('Visual Field Defects'),
    },
    {
      label: 'Cranial Nerve Exam',
      icon: <Brain className="w-5 h-5" />,
      gradient: 'from-purple-500 to-pink-600',
      action: () => console.log('Cranial Nerve Exam'),
    },
    {
      label: 'Imaging Orders',
      icon: <Eye className="w-5 h-5" />,
      gradient: 'from-green-500 to-teal-600',
      action: () => console.log('Imaging Orders'),
    },
  ];

  const getPriorityColor = (urgency: string) => {
    switch (urgency) {
      case 'Emergency':
        return 'bg-red-100 text-red-900 border-red-300';
      case 'Urgent':
        return 'bg-orange-100 text-orange-900 border-orange-300';
      default:
        return 'bg-blue-100 text-blue-900 border-blue-300';
    }
  };

  return (
    <ProtectedRoute requiredPermission="CLINICAL:NEURO:VIEW">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <Brain className="w-8 h-8 text-purple-600" />
              <span>Neuro-Ophthalmology Clinic</span>
            </h1>
            <p className="text-gray-600 mt-1">
              Optic nerve disorders, cranial nerve palsies, visual pathway lesions
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">
              New Patient
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statistics.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`p-4 rounded-lg bg-gradient-to-r ${action.gradient} text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2`}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>

        {/* Patient Queue */}
        <div className="bg-white rounded-lg shadow-md border-2 border-gray-200">
          <div className="p-6 border-b-2 border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Patient Queue</h2>
            <p className="text-sm text-gray-600">Neuro-ophthalmic cases requiring assessment</p>
          </div>

          <div className="divide-y divide-gray-200">
            {patients.map((patient) => (
              <Link
                key={patient.id}
                href={`/dashboard/specialty-clinics/neuro/${patient.id}`}
                className="block p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  {/* Patient Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-bold text-gray-900">{patient.name}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          patient.gender === 'M'
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-pink-100 text-pink-900'
                        }`}
                      >
                        {patient.gender === 'M' ? '♂' : '♀'} {patient.age}y
                      </span>
                      <span className="text-sm text-gray-600">MRN: {patient.mrn}</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getPriorityColor(
                          patient.urgency
                        )}`}
                      >
                        {patient.urgency.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Chief Complaint</p>
                        <p className="text-sm text-gray-900">{patient.chiefComplaint}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Diagnosis</p>
                        <p className="text-sm text-gray-900">{patient.diagnosis}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-600">Vision OD</p>
                        <p className="font-semibold text-blue-900">{patient.visionOD}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Vision OS</p>
                        <p className="font-semibold text-green-900">{patient.visionOS}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">RAPD</p>
                        <p
                          className={`font-semibold ${
                            patient.rapd === 'None' ? 'text-green-700' : 'text-red-700'
                          }`}
                        >
                          {patient.rapd}
                          {patient.rapdGrade && ` (${patient.rapdGrade})`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Visual Field</p>
                        <p className="font-semibold text-purple-900">{patient.visualField}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600">Optic Disc Appearance</p>
                        <p className="text-sm text-gray-900">{patient.opticDisc}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Next Action</p>
                        <p
                          className={`text-sm font-semibold ${
                            patient.urgency === 'Emergency' ? 'text-red-700' : 'text-gray-900'
                          }`}
                        >
                          {patient.nextAction}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-6 h-6 text-gray-400 mt-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
