'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, User, Activity, AlertCircle, ArrowRight, Droplet, Layers } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function OculoplastyClinicPage() {
  // Mock patients with diverse oculoplasty conditions
  const patients = [
    {
      id: 'OCULO-2026-001',
      name: 'Ramesh Patel',
      age: 68,
      gender: 'Male',
      chiefComplaint: 'Droopy eyelids, difficulty seeing',
      diagnosis: 'Bilateral Ptosis (Involutional)',
      od: {
        mrd1: 1.5, // Normal: 4-5mm
        mrd2: 5.0,
        levatorFunction: 8, // Normal: 12-15mm
        severity: 'Severe'
      },
      os: {
        mrd1: 1.0,
        mrd2: 5.0,
        levatorFunction: 7,
        severity: 'Severe'
      },
      surgicalCandidate: true,
      procedure: 'Bilateral levator advancement',
      priority: 'Routine',
      nextAction: 'Ptosis surgery consultation'
    },
    {
      id: 'OCULO-2026-002',
      name: 'Lakshmi Reddy',
      age: 72,
      gender: 'Female',
      chiefComplaint: 'Right lower eyelid turning outward, tearing',
      diagnosis: 'Right Ectropion (Involutional)',
      od: {
        ectropionGrade: 'Grade 3 (severe)',
        snapTest: 'Delayed return (lax)',
        distractibility: '>8mm (severe laxity)'
      },
      os: {
        normal: true
      },
      epiphora: 'Moderate (OD)',
      surgicalCandidate: true,
      procedure: 'Lateral tarsal strip (OD)',
      priority: 'Urgent',
      nextAction: 'Ectropion repair within 2 weeks'
    },
    {
      id: 'OCULO-2026-003',
      name: 'Suresh Kumar',
      age: 65,
      gender: 'Male',
      chiefComplaint: 'Left lower eyelid turning inward, irritation',
      diagnosis: 'Left Entropion (Involutional)',
      od: {
        normal: true
      },
      os: {
        entropionType: 'Involutional',
        trichiasis: 'Present (lashes rubbing cornea)',
        cornealAbrasion: 'Mild inferior SPK'
      },
      surgicalCandidate: true,
      procedure: 'Quickert sutures + lateral tarsal strip (OS)',
      priority: 'Urgent',
      nextAction: 'Entropion repair (prevent corneal damage)'
    },
    {
      id: 'OCULO-2026-004',
      name: 'Anjali Sharma',
      age: 42,
      gender: 'Female',
      chiefComplaint: 'Recurrent swelling right upper eyelid',
      diagnosis: 'Recurrent Chalazion OD',
      od: {
        lesionLocation: 'Right upper lid, nasal',
        size: '8mm diameter',
        inflammation: 'Moderate',
        previousTreatment: 'Warm compresses, tobramycin ointment (failed)'
      },
      os: {
        normal: true
      },
      surgicalCandidate: true,
      procedure: 'Incision & curettage (I&C) OD',
      priority: 'Routine',
      nextAction: 'Minor procedure - I&C with steroid injection'
    },
    {
      id: 'OCULO-2026-005',
      name: 'Vijay Menon',
      age: 55,
      gender: 'Male',
      chiefComplaint: 'Excessive tearing both eyes, worse left',
      diagnosis: 'Bilateral Epiphora (Nasolacrimal Duct Obstruction)',
      od: {
        epiphora: 'Moderate',
        dyeDisappearance: '30% retention at 5 min (abnormal)',
        probing: 'Hard stop at lacrimal sac (NLD obstruction)'
      },
      os: {
        epiphora: 'Severe',
        dyeDisappearance: '80% retention at 5 min (severe)',
        probing: 'Hard stop at lacrimal sac (NLD obstruction)',
        dacryocystitis: 'Chronic (mucocele present)'
      },
      surgicalCandidate: true,
      procedure: 'Bilateral DCR (Dacryocystorhinostomy)',
      priority: 'Urgent',
      nextAction: 'DCR surgery (OS first, OD later)'
    },
    {
      id: 'OCULO-2026-006',
      name: 'Priya Iyer',
      age: 58,
      gender: 'Female',
      chiefComplaint: 'Growing lump left upper eyelid',
      diagnosis: 'Left Upper Lid Mass (? Sebaceous Cell Carcinoma)',
      od: {
        normal: true
      },
      os: {
        lesionLocation: 'Left upper lid, central',
        size: '12mm x 10mm',
        characteristics: 'Nodular, irregular borders, loss of lashes',
        duration: '6 months (slowly growing)',
        clinicalSuspicion: 'HIGH for malignancy (sebaceous cell carcinoma)'
      },
      surgicalCandidate: true,
      procedure: 'Excisional biopsy with frozen section (OS)',
      priority: 'Urgent',
      nextAction: 'Urgent biopsy - rule out malignancy'
    }
  ];

  const stats = [
    {
      label: 'Total Patients',
      value: patients.length,
      icon: User,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      label: 'Ptosis Cases',
      value: patients.filter(p => p.diagnosis.includes('Ptosis')).length,
      icon: Eye,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      label: 'Surgical Candidates',
      value: patients.filter(p => p.surgicalCandidate).length,
      icon: Activity,
      color: 'text-green-600 bg-green-100'
    },
    {
      label: 'Urgent Cases',
      value: patients.filter(p => p.priority === 'Urgent').length,
      icon: AlertCircle,
      color: 'text-orange-600 bg-orange-100'
    }
  ];

  const quickActions = [
    {
      label: 'Ptosis Measurement',
      icon: Eye,
      color: 'from-purple-500 to-pink-500',
      description: 'MRD1/MRD2, Levator function'
    },
    {
      label: 'Ectropion/Entropion',
      icon: Layers,
      color: 'from-blue-500 to-cyan-500',
      description: 'Eyelid malposition assessment'
    },
    {
      label: 'Lacrimal Assessment',
      icon: Droplet,
      color: 'from-green-500 to-teal-500',
      description: 'Epiphora workup, DCR candidacy'
    },
    {
      label: 'Lid Lesion Biopsy',
      icon: AlertCircle,
      color: 'from-red-500 to-orange-500',
      description: 'Chalazion, tumor evaluation'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'border-orange-500 bg-orange-50';
      case 'Routine':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  return (
    <ProtectedRoute requiredPermission="CLINICAL:OCULOPLASTY:VIEW">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Oculoplasty Clinic</h1>
            <p className="text-gray-600 mt-1">
              Ptosis, eyelid malposition, lacrimal, orbital surgery
            </p>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg">
            <Eye className="h-5 w-5" />
            <span className="font-semibold">{patients.length} Patients Today</span>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white border-2 border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                className={`bg-gradient-to-r ${action.color} text-white rounded-lg p-4 hover:shadow-lg transition-shadow`}
              >
                <Icon className="h-6 w-6 mb-2" />
                <p className="font-semibold">{action.label}</p>
                <p className="text-xs opacity-90 mt-1">{action.description}</p>
              </button>
            );
          })}
        </div>

        {/* Patient Queue */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Patient Queue</h2>
          <div className="space-y-4">
            {patients.map((patient) => (
              <Link
                key={patient.id}
                href={`/dashboard/specialty-clinics/oculoplasty/${patient.id}`}
                className={`block border-2 rounded-lg p-5 hover:shadow-lg transition-shadow ${getPriorityColor(
                  patient.priority
                )}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Patient Header */}
                    <div className="flex items-center space-x-4 mb-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                          patient.gender === 'Male' ? 'bg-blue-500' : 'bg-pink-500'
                        }`}
                      >
                        {patient.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{patient.name}</h3>
                        <p className="text-sm text-gray-600">
                          {patient.age} years • {patient.gender} • {patient.id}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          patient.priority === 'Urgent'
                            ? 'bg-orange-200 text-orange-900'
                            : 'bg-blue-200 text-blue-900'
                        }`}
                      >
                        {patient.priority}
                      </div>
                    </div>

                    {/* Clinical Information */}
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">
                          Chief Complaint
                        </p>
                        <p className="text-sm text-gray-900 mt-1">{patient.chiefComplaint}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Diagnosis</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {patient.diagnosis}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">
                          Planned Procedure
                        </p>
                        <p className="text-sm text-gray-900 mt-1">{patient.procedure}</p>
                      </div>
                    </div>

                    {/* Condition-Specific Details */}
                    {patient.diagnosis.includes('Ptosis') && (
                      <div className="bg-purple-50 rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-purple-900 mb-2">
                          Ptosis Measurements
                        </p>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="font-semibold">OD:</span> MRD1 {patient.od.mrd1}mm,
                            Levator {patient.od.levatorFunction}mm ({patient.od.severity})
                          </div>
                          <div>
                            <span className="font-semibold">OS:</span> MRD1 {patient.os.mrd1}mm,
                            Levator {patient.os.levatorFunction}mm ({patient.os.severity})
                          </div>
                        </div>
                      </div>
                    )}

                    {patient.diagnosis.includes('Ectropion') && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-blue-900 mb-2">
                          Ectropion Assessment
                        </p>
                        <div className="text-xs space-y-1">
                          <p>
                            <span className="font-semibold">Grade:</span>{' '}
                            {patient.od.ectropionGrade}
                          </p>
                          <p>
                            <span className="font-semibold">Snap Test:</span> {patient.od.snapTest}
                          </p>
                          <p>
                            <span className="font-semibold">Epiphora:</span> {patient.epiphora}
                          </p>
                        </div>
                      </div>
                    )}

                    {patient.diagnosis.includes('Entropion') && (
                      <div className="bg-green-50 rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-green-900 mb-2">
                          Entropion Assessment
                        </p>
                        <div className="text-xs space-y-1">
                          <p>
                            <span className="font-semibold">Type:</span> {patient.os.entropionType}
                          </p>
                          <p>
                            <span className="font-semibold">Trichiasis:</span> {patient.os.trichiasis}
                          </p>
                          <p>
                            <span className="font-semibold">Corneal Status:</span>{' '}
                            {patient.os.cornealAbrasion}
                          </p>
                        </div>
                      </div>
                    )}

                    {patient.diagnosis.includes('Chalazion') && (
                      <div className="bg-yellow-50 rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-yellow-900 mb-2">Lesion Details</p>
                        <div className="text-xs space-y-1">
                          <p>
                            <span className="font-semibold">Location:</span>{' '}
                            {patient.od.lesionLocation}
                          </p>
                          <p>
                            <span className="font-semibold">Size:</span> {patient.od.size}
                          </p>
                          <p>
                            <span className="font-semibold">Previous Treatment:</span>{' '}
                            {patient.od.previousTreatment}
                          </p>
                        </div>
                      </div>
                    )}

                    {patient.diagnosis.includes('Epiphora') && (
                      <div className="bg-cyan-50 rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-cyan-900 mb-2">
                          Lacrimal Assessment
                        </p>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="font-semibold mb-1">OD:</p>
                            <p>Epiphora: {patient.od.epiphora}</p>
                            <p>Dye test: {patient.od.dyeDisappearance}</p>
                          </div>
                          <div>
                            <p className="font-semibold mb-1">OS:</p>
                            <p>Epiphora: {patient.os.epiphora}</p>
                            <p>Dye test: {patient.os.dyeDisappearance}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {patient.diagnosis.includes('Mass') && (
                      <div className="bg-red-50 rounded-lg p-3 mb-3 border-2 border-red-300">
                        <p className="text-xs font-semibold text-red-900 mb-2">
                          ⚠️ SUSPICIOUS LESION - URGENT EVALUATION
                        </p>
                        <div className="text-xs space-y-1">
                          <p>
                            <span className="font-semibold">Location:</span>{' '}
                            {patient.os.lesionLocation}
                          </p>
                          <p>
                            <span className="font-semibold">Size:</span> {patient.os.size}
                          </p>
                          <p>
                            <span className="font-semibold">Features:</span>{' '}
                            {patient.os.characteristics}
                          </p>
                          <p>
                            <span className="font-semibold">Clinical Suspicion:</span>{' '}
                            {patient.os.clinicalSuspicion}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Next Action */}
                    <div className="flex items-center space-x-2 text-sm">
                      <Activity className="h-4 w-4 text-gray-600" />
                      <span className="font-semibold text-gray-700">Next Action:</span>
                      <span className="text-gray-900">{patient.nextAction}</span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="h-5 w-5 text-gray-400 ml-4 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
