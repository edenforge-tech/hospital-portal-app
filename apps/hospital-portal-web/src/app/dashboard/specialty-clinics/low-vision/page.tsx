'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, User, Activity, BookOpen, ArrowRight } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function LowVisionClinicPage() {
  const patients = [
    {
      id: 'LV-2026-001',
      name: 'Sarita Devi',
      age: 78,
      gender: 'Female',
      diagnosis: 'Dry AMD (Geographic Atrophy) OU',
      vision: { OD: '6/60', OS: '6/120' },
      contrast: 'Severely reduced (0.5 log units)',
      reading: 'Unable to read newsprint',
      goals: 'Reading books, managing medications independently',
      recommendedAids: ['4x Handheld magnifier', 'Task lighting', 'Large print books'],
      priority: 'Routine'
    },
    {
      id: 'LV-2026-002',
      name: 'Ravi Kumar',
      age: 65,
      gender: 'Male',
      diagnosis: 'End-stage Glaucoma OU',
      vision: { OD: '6/60', OS: 'HM' },
      visualField: 'Central island OD (10° remaining), OS blind',
      mobility: 'Difficulty navigating outdoors',
      goals: 'Safe mobility, recognize faces',
      recommendedAids: ['White cane training', 'High-contrast environment', 'Orientation & Mobility training'],
      priority: 'Urgent'
    },
    {
      id: 'LV-2026-003',
      name: 'Meena Sharma',
      age: 55,
      gender: 'Female',
      diagnosis: 'Proliferative Diabetic Retinopathy (end-stage) OU',
      vision: { OD: '6/120', OS: '6/60' },
      reading: 'Extremely slow (20 wpm, normal 200+)',
      glare: 'Severe photophobia',
      goals: 'Continue working (office job), computer use',
      recommendedAids: ['CCTV magnifier', 'Screen reading software', 'Anti-glare filters'],
      priority: 'Urgent'
    },
    {
      id: 'LV-2026-004',
      name: 'Arjun Patel',
      age: 82,
      gender: 'Male',
      diagnosis: 'Wet AMD (scarred) OU',
      vision: { OD: 'CF 2m', OS: '6/60' },
      eccentricViewing: 'Poor (needs training)',
      goals: 'Watch TV, see grandchildren\'s faces',
      recommendedAids: ['Bioptic telescope 2.2x', 'Large screen TV', 'Eccentric viewing training'],
      priority: 'Routine'
    }
  ];

  const stats = [
    { label: 'Total Patients', value: patients.length, icon: User, color: 'text-blue-600 bg-blue-100' },
    { label: 'AMD Cases', value: patients.filter(p => p.diagnosis.includes('AMD')).length, icon: Eye, color: 'text-purple-600 bg-purple-100' },
    { label: 'Mobility Training Needed', value: patients.filter(p => p.recommendedAids.some(a => a.includes('Mobility'))).length, icon: Activity, color: 'text-orange-600 bg-orange-100' },
    { label: 'Reading Goals', value: patients.filter(p => p.goals.toLowerCase().includes('read')).length, icon: BookOpen, color: 'text-green-600 bg-green-100' }
  ];

  return (
    <ProtectedRoute requiredPermission="CLINICAL:LOW_VISION:VIEW">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Low Vision Clinic</h1>
            <p className="text-gray-600 mt-1">Visual rehabilitation, low vision aids, ADL training</p>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg">
            <Eye className="h-5 w-5" />
            <span className="font-semibold">{patients.length} Patients Today</span>
          </div>
        </div>

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

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Patient Queue</h2>
          <div className="space-y-4">
            {patients.map((patient) => (
              <Link
                key={patient.id}
                href={`/dashboard/specialty-clinics/low-vision/${patient.id}`}
                className="block border-2 border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow bg-white"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${patient.gender === 'Male' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{patient.name}</h3>
                        <p className="text-sm text-gray-600">{patient.age} years • {patient.gender} • {patient.id}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Diagnosis</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{patient.diagnosis}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Vision</p>
                        <p className="text-sm text-gray-900 mt-1">OD: {patient.vision.OD} | OS: {patient.vision.OS}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Goals</p>
                        <p className="text-sm text-gray-900 mt-1">{patient.goals}</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-blue-900 mb-2">Recommended Low Vision Aids:</p>
                      <div className="flex flex-wrap gap-2">
                        {patient.recommendedAids.map((aid, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-200 text-blue-900 rounded text-xs">{aid}</span>
                        ))}
                      </div>
                    </div>
                  </div>
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
