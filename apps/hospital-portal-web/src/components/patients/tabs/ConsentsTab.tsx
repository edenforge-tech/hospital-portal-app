'use client';

import React, { useState, useEffect } from 'react';
import { FileSignature, CheckCircle2, XCircle, Clock, Shield } from 'lucide-react';
import { patientConsentsApi, PatientConsent } from '@/lib/api/patient-consents.api';

interface ConsentsTabProps {
  patientId: string;
}

export function ConsentsTab({ patientId }: ConsentsTabProps) {
  const [consents, setConsents] = useState<PatientConsent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConsents();
  }, [patientId]);

  const loadConsents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await patientConsentsApi.getByPatient(patientId);
      setConsents(response.data || []);
    } catch (err: any) {
      console.error('Error loading consents:', err);
      setError('Failed to load consent records.');
      setConsents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Revoke this consent?')) return;
    try {
      await patientConsentsApi.revoke(id);
      loadConsents();
    } catch (err) {
      console.error('Error revoking consent:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Loading consents...</span>
      </div>
    );
  }

  const activeConsents = consents.filter(c => c.status === 'active' && c.isGranted);
  const pendingConsents = consents.filter(c => c.status === 'active' && !c.isGranted);
  const expiredOrRevoked = consents.filter(c => c.status === 'expired' || c.status === 'revoked');

  const statusIcon = (consent: PatientConsent) => {
    if (consent.status === 'revoked') return <XCircle className="w-5 h-5 text-red-500" />;
    if (consent.status === 'expired') return <Clock className="w-5 h-5 text-yellow-500" />;
    if (consent.isGranted) return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    return <Clock className="w-5 h-5 text-gray-400" />;
  };

  const ConsentCard = ({ consent }: { consent: PatientConsent }) => (
    <div className={`border rounded-lg p-4 ${
      consent.status === 'revoked' ? 'bg-red-50 border-red-200' :
      consent.status === 'expired' ? 'bg-yellow-50 border-yellow-200' :
      consent.isGranted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {statusIcon(consent)}
          <div>
            <h4 className="font-semibold text-gray-900">{consent.consentName}</h4>
            <p className="text-sm text-gray-600 capitalize">{consent.consentType?.replace(/_/g, ' ')}</p>
            {consent.description && <p className="text-sm text-gray-500 mt-1">{consent.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            consent.status === 'active' && consent.isGranted ? 'bg-green-100 text-green-800' :
            consent.status === 'revoked' ? 'bg-red-100 text-red-800' :
            consent.status === 'expired' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {consent.status === 'active' && consent.isGranted ? 'Signed' :
             consent.status === 'active' && !consent.isGranted ? 'Pending' :
             consent.status}
          </span>
          {consent.status === 'active' && consent.isGranted && (
            <button onClick={() => handleRevoke(consent.id)} className="text-xs text-red-600 hover:underline">Revoke</button>
          )}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
        {consent.grantedAt && <p>Signed: {new Date(consent.grantedAt).toLocaleDateString()}</p>}
        {consent.expiresAt && <p>Expires: {new Date(consent.expiresAt).toLocaleDateString()}</p>}
        {consent.witnessName && <p>Witness: {consent.witnessName}</p>}
        {consent.revokedAt && <p className="text-red-600">Revoked: {new Date(consent.revokedAt).toLocaleDateString()}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-700">{error}</p>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{activeConsents.length}</p>
          <p className="text-sm text-green-600">Active</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-700">{pendingConsents.length}</p>
          <p className="text-sm text-yellow-600">Pending</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-gray-700">{expiredOrRevoked.length}</p>
          <p className="text-sm text-gray-600">Expired/Revoked</p>
        </div>
      </div>

      {/* Active Consents */}
      {activeConsents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" /> Active Consents
          </h3>
          <div className="space-y-3">
            {activeConsents.map(c => <ConsentCard key={c.id} consent={c} />)}
          </div>
        </div>
      )}

      {/* Pending */}
      {pendingConsents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Pending Consents</h3>
          <div className="space-y-3">
            {pendingConsents.map(c => <ConsentCard key={c.id} consent={c} />)}
          </div>
        </div>
      )}

      {/* Expired/Revoked */}
      {expiredOrRevoked.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Expired / Revoked</h3>
          <div className="space-y-3">
            {expiredOrRevoked.map(c => <ConsentCard key={c.id} consent={c} />)}
          </div>
        </div>
      )}

      {consents.length === 0 && !error && (
        <div className="text-center py-12 text-gray-500">
          <FileSignature className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No consent records found for this patient.</p>
        </div>
      )}
    </div>
  );
}
