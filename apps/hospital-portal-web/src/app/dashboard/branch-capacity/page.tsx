'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import CapacityDashboard from '@/components/branch/CapacityDashboard';

const BranchMapView = dynamic(() => import('@/components/branch/BranchMapView'), { ssr: false });

export default function BranchCapacityPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'map'>('dashboard');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Branch Capacity Management</h1>
          <p className="text-gray-600 mt-2">
            Real-time monitoring of bed availability across all hospital branches
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Dashboard</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'map'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>Map View</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'dashboard' ? (
            <CapacityDashboard />
          ) : (
            <BranchMapView />
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900">Real-time Updates Enabled</h3>
              <p className="text-sm text-blue-700 mt-1">
                This page uses SignalR WebSocket technology to provide live capacity updates. 
                Changes to bed status, patient transfers, and capacity alerts are broadcast instantly to all connected users.
              </p>
              <ul className="mt-2 space-y-1 text-sm text-blue-600">
                <li>• <strong>Green markers/badges:</strong> Normal capacity (&lt;75% occupancy)</li>
                <li>• <strong>Yellow markers/badges:</strong> Warning level (75-89% occupancy)</li>
                <li>• <strong>Red markers/badges:</strong> Critical capacity (≥90% occupancy)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
