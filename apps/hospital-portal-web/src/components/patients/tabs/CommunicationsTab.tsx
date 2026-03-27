'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Mail, Phone, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { patientCommunicationsApi, PatientCommunication } from '@/lib/api/patient-communications.api';

interface CommunicationsTabProps {
  patientId: string;
}

export function CommunicationsTab({ patientId }: CommunicationsTabProps) {
  const [communications, setCommunications] = useState<PatientCommunication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    loadCommunications();
  }, [patientId, filter]);

  const loadCommunications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await patientCommunicationsApi.getByPatient(patientId, filter || undefined);
      setCommunications(response.data || []);
    } catch (err: any) {
      console.error('Error loading communications:', err);
      setError('Failed to load communications.');
      setCommunications([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Loading communications...</span>
      </div>
    );
  }

  const typeIcon = (type: string) => {
    switch (type) {
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'delivered': case 'read': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'failed': case 'bounced': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-700">{error}</p>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Filter:</span>
        {['', 'sms', 'email', 'phone', 'portal_message'].map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1 text-sm rounded-full border ${
              filter === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {t === '' ? 'All' : t === 'portal_message' ? 'Portal' : t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Communication List */}
      <div className="space-y-3">
        {communications.map(comm => (
          <div key={comm.id} className={`border rounded-lg p-4 ${
            comm.direction === 'inbound' ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${comm.direction === 'inbound' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  {typeIcon(comm.communicationType)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">
                      {comm.subject || comm.communicationType.toUpperCase()}
                    </h4>
                    {comm.direction === 'inbound' ? (
                      <ArrowDownLeft className="w-4 h-4 text-blue-500" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{comm.message}</p>
                  {comm.recipient && <p className="text-xs text-gray-400 mt-1">To: {comm.recipient}</p>}
                  {comm.sender && <p className="text-xs text-gray-400">From: {comm.sender}</p>}
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor(comm.status)}`}>
                  {comm.status}
                </span>
                <p className="text-xs text-gray-400 mt-2">
                  {comm.sentAt ? new Date(comm.sentAt).toLocaleString() : new Date(comm.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {communications.length === 0 && !error && (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No communications recorded for this patient.</p>
        </div>
      )}
    </div>
  );
}
