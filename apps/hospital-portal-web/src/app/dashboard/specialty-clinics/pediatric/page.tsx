'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHasPermission } from '@/hooks/use-permissions';
import {
  Baby,
  Users,
  Activity,
  Eye,
  Glasses,
  Target,
  Calendar,
  TrendingUp,
} from 'lucide-react';

interface PediatricPatient {
  id: string;
  name: string;
  age: string; // "2 years 6 months"
  ageMonths: number; // for calculations
  gender: string;
  mrn: string;
  chiefComplaint: string;
  visionOD: string;
  visionOS: string;
  amblyopia: boolean;
  strabismus: string | null; // "Esotropia", "Exotropia", null
  refractionStatus: 'Not Done' | 'Cycloplegic Pending' | 'Cycloplegic Done';
  lastVisit: string;
  nextAction: string;
  priority: 'ROUTINE' | 'URGENT' | 'FOLLOW-UP';
  developmentalAge: string; // "On track", "Delayed"
}

export default function PediatricClinicPage() {
  const router = useRouter();
  const hasPermission = useHasPermission('CLINICAL:PEDIATRIC:VIEW');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock pediatric patients - diverse age groups and conditions
  const patients: PediatricPatient[] = [
    {
      id: '1',
      name: 'Aarav Kumar',
      age: '7 years 3 months',
      ageMonths: 87,
      gender: 'Male',
      mrn: 'PED-2026-001',
      chiefComplaint: 'Failed school vision screening',
      visionOD: '6/12',
      visionOS: '6/60',
      amblyopia: true,
      strabismus: null,
      refractionStatus: 'Cycloplegic Pending',
      lastVisit: '2026-01-27',
      nextAction: 'Cycloplegic refraction + amblyopia assessment',
      priority: 'URGENT',
      developmentalAge: 'On track',
    },
    {
      id: '2',
      name: 'Ananya Sharma',
      age: '3 years 9 months',
      ageMonths: 45,
      gender: 'Female',
      mrn: 'PED-2026-002',
      chiefComplaint: 'Intermittent eye turn (noticed by parents)',
      visionOD: '6/9',
      visionOS: '6/9',
      amblyopia: false,
      strabismus: 'Intermittent Exotropia',
      refractionStatus: 'Cycloplegic Done',
      lastVisit: '2026-01-20',
      nextAction: 'Strabismus surgery evaluation',
      priority: 'FOLLOW-UP',
      developmentalAge: 'On track',
    },
    {
      id: '3',
      name: 'Rohan Patel',
      age: '5 years 0 months',
      ageMonths: 60,
      gender: 'Male',
      mrn: 'PED-2026-003',
      chiefComplaint: 'Constant inward eye turn (left eye)',
      visionOD: '6/6',
      visionOS: '6/18',
      amblyopia: true,
      strabismus: 'Esotropia (constant)',
      refractionStatus: 'Cycloplegic Done',
      lastVisit: '2026-01-15',
      nextAction: 'Patch therapy compliance check + consider surgery',
      priority: 'URGENT',
      developmentalAge: 'On track',
    },
    {
      id: '4',
      name: 'Diya Reddy',
      age: '9 months',
      ageMonths: 9,
      gender: 'Female',
      mrn: 'PED-2026-004',
      chiefComplaint: 'White reflex noticed in photos (leukocoria)',
      visionOD: 'Fix & Follow',
      visionOS: 'No response',
      amblyopia: false,
      strabismus: null,
      refractionStatus: 'Not Done',
      lastVisit: '2026-01-27',
      nextAction: 'URGENT: Rule out retinoblastoma - dilated exam + imaging',
      priority: 'URGENT',
      developmentalAge: 'On track',
    },
    {
      id: '5',
      name: 'Arjun Singh',
      age: '12 years 6 months',
      ageMonths: 150,
      gender: 'Male',
      mrn: 'PED-2026-005',
      chiefComplaint: 'Progressive myopia (can\'t see blackboard)',
      visionOD: '6/60',
      visionOS: '6/60',
      amblyopia: false,
      strabismus: null,
      refractionStatus: 'Cycloplegic Done',
      lastVisit: '2026-01-22',
      nextAction: 'Spectacle prescription + myopia control (Atropine 0.01%)',
      priority: 'ROUTINE',
      developmentalAge: 'On track',
    },
    {
      id: '6',
      name: 'Kavya Iyer',
      age: '4 years 2 months',
      ageMonths: 50,
      gender: 'Female',
      mrn: 'PED-2026-006',
      chiefComplaint: 'High hyperopia detected at screening',
      visionOD: '6/18',
      visionOS: '6/18',
      amblyopia: false,
      strabismus: 'Accommodative Esotropia (controlled with glasses)',
      refractionStatus: 'Cycloplegic Done',
      lastVisit: '2025-12-10',
      nextAction: 'Spectacle compliance check + visual acuity',
      priority: 'FOLLOW-UP',
      developmentalAge: 'On track',
    },
  ];

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistics
  const totalPatients = patients.length;
  const amblyopiaCases = patients.filter((p) => p.amblyopia).length;
  const strabismusCases = patients.filter((p) => p.strabismus !== null).length;
  const cycloplegicPending = patients.filter((p) => p.refractionStatus === 'Cycloplegic Pending')
    .length;

  const handlePatientClick = (patientId: string) => {
    router.push(`/dashboard/specialty-clinics/pediatric/${patientId}`);
  };

  if (!hasPermission) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          You don't have permission to view the Pediatric Clinic.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
          <Baby className="w-8 h-8 text-pink-600" />
          <span>Pediatric Ophthalmology Clinic</span>
        </h1>
        <p className="text-gray-600 mt-2">
          Comprehensive pediatric eye care - vision screening, amblyopia, strabismus, refractive
          errors
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm font-medium">Total Patients</p>
              <p className="text-4xl font-bold mt-2">{totalPatients}</p>
            </div>
            <Users className="w-12 h-12 text-pink-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Amblyopia Cases</p>
              <p className="text-4xl font-bold mt-2">{amblyopiaCases}</p>
            </div>
            <Eye className="w-12 h-12 text-purple-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Strabismus Cases</p>
              <p className="text-4xl font-bold mt-2">{strabismusCases}</p>
            </div>
            <Target className="w-12 h-12 text-blue-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Cycloplegic Pending</p>
              <p className="text-4xl font-bold mt-2">{cycloplegicPending}</p>
            </div>
            <Activity className="w-12 h-12 text-orange-200 opacity-80" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl p-4 shadow-lg transition-all hover:scale-105 flex items-center justify-center space-x-2">
          <Glasses className="w-5 h-5" />
          <span className="font-semibold">Vision Screening</span>
        </button>
        <button className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl p-4 shadow-lg transition-all hover:scale-105 flex items-center justify-center space-x-2">
          <Eye className="w-5 h-5" />
          <span className="font-semibold">Amblyopia Tracker</span>
        </button>
        <button className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl p-4 shadow-lg transition-all hover:scale-105 flex items-center justify-center space-x-2">
          <Target className="w-5 h-5" />
          <span className="font-semibold">Strabismus Queue</span>
        </button>
        <button className="bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl p-4 shadow-lg transition-all hover:scale-105 flex items-center justify-center space-x-2">
          <Calendar className="w-5 h-5" />
          <span className="font-semibold">Follow-up Schedule</span>
        </button>
      </div>

      {/* Search Bar */}
      <div>
        <input
          type="text"
          placeholder="Search by name, MRN, or chief complaint..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
        />
      </div>

      {/* Patient Queue */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Users className="w-6 h-6 text-pink-600" />
          <span>Patient Queue ({filteredPatients.length})</span>
        </h2>

        <div className="space-y-4">
          {filteredPatients.map((patient) => {
            const priorityColors = {
              ROUTINE: 'border-blue-300 bg-blue-50',
              URGENT: 'border-orange-300 bg-orange-50',
              'FOLLOW-UP': 'border-green-300 bg-green-50',
            };

            const priorityBadgeColors = {
              ROUTINE: 'bg-blue-600',
              URGENT: 'bg-orange-600',
              'FOLLOW-UP': 'bg-green-600',
            };

            const refractionStatusColors = {
              'Not Done': 'bg-gray-100 text-gray-700',
              'Cycloplegic Pending': 'bg-orange-100 text-orange-700',
              'Cycloplegic Done': 'bg-green-100 text-green-700',
            };

            return (
              <div
                key={patient.id}
                onClick={() => handlePatientClick(patient.id)}
                className={`border-2 rounded-xl p-6 cursor-pointer hover:shadow-xl transition-all ${
                  priorityColors[patient.priority]
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-white rounded-full p-3 shadow-md">
                      <Baby
                        className={`w-8 h-8 ${
                          patient.gender === 'Male' ? 'text-blue-600' : 'text-pink-600'
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{patient.name}</h3>
                      <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                        <span className="font-medium">
                          {patient.age} ({patient.gender})
                        </span>
                        <span className="text-gray-400">•</span>
                        <span>MRN: {patient.mrn}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${
                        priorityBadgeColors[patient.priority]
                      }`}
                    >
                      {patient.priority}
                    </span>
                  </div>
                </div>

                {/* Chief Complaint */}
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-1">Chief Complaint</p>
                  <p className="font-semibold text-gray-900">{patient.chiefComplaint}</p>
                </div>

                {/* Clinical Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {/* Vision OD */}
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-600 mb-1">Vision OD</p>
                    <p className="text-lg font-bold text-blue-900">{patient.visionOD}</p>
                  </div>

                  {/* Vision OS */}
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="text-xs text-green-600 mb-1">Vision OS</p>
                    <p className="text-lg font-bold text-green-900">{patient.visionOS}</p>
                  </div>

                  {/* Refraction Status */}
                  <div className={`p-3 rounded-lg ${refractionStatusColors[patient.refractionStatus]}`}>
                    <p className="text-xs mb-1">Cycloplegic Refraction</p>
                    <p className="text-sm font-bold">{patient.refractionStatus}</p>
                  </div>

                  {/* Developmental Age */}
                  <div
                    className={`p-3 rounded-lg ${
                      patient.developmentalAge === 'On track'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-orange-50 border border-orange-200'
                    }`}
                  >
                    <p
                      className={`text-xs mb-1 ${
                        patient.developmentalAge === 'On track' ? 'text-green-600' : 'text-orange-600'
                      }`}
                    >
                      Development
                    </p>
                    <p
                      className={`text-sm font-bold ${
                        patient.developmentalAge === 'On track' ? 'text-green-900' : 'text-orange-900'
                      }`}
                    >
                      {patient.developmentalAge}
                    </p>
                  </div>
                </div>

                {/* Conditions */}
                <div className="flex items-center space-x-2 mb-4">
                  {patient.amblyopia && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>Amblyopia</span>
                    </span>
                  )}
                  {patient.strabismus && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold flex items-center space-x-1">
                      <Target className="w-4 h-4" />
                      <span>{patient.strabismus}</span>
                    </span>
                  )}
                </div>

                {/* Next Action */}
                <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-pink-500">
                  <p className="text-xs text-gray-600 mb-1">Next Action</p>
                  <p className="font-semibold text-gray-900">{patient.nextAction}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
