'use client';

import { useState } from 'react';
import { Activity, Calendar, Save, TrendingUp } from 'lucide-react';

interface AntiVEGFManagementProps {
  patientId: string;
  injectionHistory?: any;
  totalInjections?: number;
  onSave: (data: any) => void;
  canEdit: boolean;
}

export default function AntiVEGFManagement({
  patientId,
  injectionHistory,
  totalInjections,
  onSave,
  canEdit,
}: AntiVEGFManagementProps) {
  const [injectionData, setInjectionData] = useState({
    drugOD: '',
    drugOS: '',
    doseOD: '0.5mg',
    doseOS: '0.5mg',
    eyeInjected: 'OD',
    vaPreInjectionOD: '',
    vaPreInjectionOS: '',
    vaPostInjectionOD: '',
    vaPostInjectionOS: '',
    iopPreInjectionOD: '',
    iopPreInjectionOS: '',
    iopPostInjectionOD: '',
    iopPostInjectionOS: '',
    nextInjectionDate: '',
    protocol: 'Monthly PRN',
    complications: '',
    notes: '',
  });

  const drugOptions = [
    'Ranibizumab (Lucentis)',
    'Bevacizumab (Avastin)',
    'Aflibercept (Eylea)',
    'Brolucizumab (Beovu)',
    'Faricimab (Vabysmo)',
  ];

  const eyeOptions = ['OD', 'OS', 'OU'];
  const protocolOptions = ['Monthly PRN', 'Treat and Extend', 'Fixed Monthly', 'Bimonthly'];

  const handleSave = () => {
    onSave({ patientId, ...injectionData });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <Activity className="w-6 h-6 mr-2 text-purple-600" />
        Anti-VEGF Injection Management
      </h3>

      {/* Injection History Summary */}
      {totalInjections && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-purple-900 mb-2">
            Total Lifetime Injections: <span className="text-2xl font-bold">{totalInjections}</span>
          </p>
          {injectionHistory && (
            <p className="text-sm text-purple-800">
              Last Injection: {injectionHistory.drug} - {injectionHistory.eye} -{' '}
              {new Date(injectionHistory.date).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* Eye Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Eye to Inject</label>
        <div className="flex space-x-4">
          {eyeOptions.map((eye) => (
            <label key={eye} className="flex items-center space-x-2">
              <input
                type="radio"
                value={eye}
                checked={injectionData.eyeInjected === eye}
                onChange={(e) =>
                  setInjectionData({ ...injectionData, eyeInjected: e.target.value })
                }
                disabled={!canEdit}
                className="w-5 h-5 text-purple-600"
              />
              <span className="font-semibold text-lg">{eye}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Drug Selection - OD/OS */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <h4 className="text-lg font-bold text-blue-900 mb-3">OD (Right Eye)</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Drug</label>
              <select
                value={injectionData.drugOD}
                onChange={(e) => setInjectionData({ ...injectionData, drugOD: e.target.value })}
                disabled={!canEdit}
                className="w-full border-2 border-gray-300 rounded-lg p-2 focus:border-blue-500"
              >
                <option value="">Select drug...</option>
                {drugOptions.map((drug) => (
                  <option key={drug} value={drug}>
                    {drug}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Dose</label>
              <input
                type="text"
                value={injectionData.doseOD}
                onChange={(e) => setInjectionData({ ...injectionData, doseOD: e.target.value })}
                disabled={!canEdit}
                className="w-full border-2 border-gray-300 rounded-lg p-2 focus:border-blue-500"
                placeholder="0.5mg"
              />
            </div>
          </div>
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <h4 className="text-lg font-bold text-green-900 mb-3">OS (Left Eye)</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Drug</label>
              <select
                value={injectionData.drugOS}
                onChange={(e) => setInjectionData({ ...injectionData, drugOS: e.target.value })}
                disabled={!canEdit}
                className="w-full border-2 border-gray-300 rounded-lg p-2 focus:border-green-500"
              >
                <option value="">Select drug...</option>
                {drugOptions.map((drug) => (
                  <option key={drug} value={drug}>
                    {drug}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Dose</label>
              <input
                type="text"
                value={injectionData.doseOS}
                onChange={(e) => setInjectionData({ ...injectionData, doseOS: e.target.value })}
                disabled={!canEdit}
                className="w-full border-2 border-gray-300 rounded-lg p-2 focus:border-green-500"
                placeholder="0.5mg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pre-Injection Assessment */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-yellow-900 mb-4">Pre-Injection Assessment</h4>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              VA OD (Pre)
            </label>
            <input
              type="text"
              value={injectionData.vaPreInjectionOD}
              onChange={(e) =>
                setInjectionData({ ...injectionData, vaPreInjectionOD: e.target.value })
              }
              disabled={!canEdit}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              placeholder="6/12"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              VA OS (Pre)
            </label>
            <input
              type="text"
              value={injectionData.vaPreInjectionOS}
              onChange={(e) =>
                setInjectionData({ ...injectionData, vaPreInjectionOS: e.target.value })
              }
              disabled={!canEdit}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              placeholder="6/9"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              IOP OD (Pre)
            </label>
            <input
              type="number"
              value={injectionData.iopPreInjectionOD}
              onChange={(e) =>
                setInjectionData({ ...injectionData, iopPreInjectionOD: e.target.value })
              }
              disabled={!canEdit}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              placeholder="16"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              IOP OS (Pre)
            </label>
            <input
              type="number"
              value={injectionData.iopPreInjectionOS}
              onChange={(e) =>
                setInjectionData({ ...injectionData, iopPreInjectionOS: e.target.value })
              }
              disabled={!canEdit}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              placeholder="15"
            />
          </div>
        </div>
      </div>

      {/* Post-Injection Assessment */}
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-green-900 mb-4">Post-Injection Assessment (1 week)</h4>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              VA OD (Post)
            </label>
            <input
              type="text"
              value={injectionData.vaPostInjectionOD}
              onChange={(e) =>
                setInjectionData({ ...injectionData, vaPostInjectionOD: e.target.value })
              }
              disabled={!canEdit}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              placeholder="6/9"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              VA OS (Post)
            </label>
            <input
              type="text"
              value={injectionData.vaPostInjectionOS}
              onChange={(e) =>
                setInjectionData({ ...injectionData, vaPostInjectionOS: e.target.value })
              }
              disabled={!canEdit}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              placeholder="6/6"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              IOP OD (Post)
            </label>
            <input
              type="number"
              value={injectionData.iopPostInjectionOD}
              onChange={(e) =>
                setInjectionData({ ...injectionData, iopPostInjectionOD: e.target.value })
              }
              disabled={!canEdit}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              placeholder="18"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              IOP OS (Post)
            </label>
            <input
              type="number"
              value={injectionData.iopPostInjectionOS}
              onChange={(e) =>
                setInjectionData({ ...injectionData, iopPostInjectionOS: e.target.value })
              }
              disabled={!canEdit}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              placeholder="17"
            />
          </div>
        </div>
      </div>

      {/* Injection Protocol & Follow-up */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Injection Protocol
          </label>
          <select
            value={injectionData.protocol}
            onChange={(e) => setInjectionData({ ...injectionData, protocol: e.target.value })}
            disabled={!canEdit}
            className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-purple-500"
          >
            {protocolOptions.map((protocol) => (
              <option key={protocol} value={protocol}>
                {protocol}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Next Injection Date
          </label>
          <input
            type="date"
            value={injectionData.nextInjectionDate}
            onChange={(e) =>
              setInjectionData({ ...injectionData, nextInjectionDate: e.target.value })
            }
            disabled={!canEdit}
            className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-purple-500"
          />
        </div>
      </div>

      {/* Complications */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Complications</label>
        <textarea
          value={injectionData.complications}
          onChange={(e) => setInjectionData({ ...injectionData, complications: e.target.value })}
          rows={3}
          disabled={!canEdit}
          className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-500"
          placeholder="Endophthalmitis, retinal detachment, subconjunctival hemorrhage, etc."
        />
      </div>

      {/* Clinical Notes */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Clinical Notes</label>
        <textarea
          value={injectionData.notes}
          onChange={(e) => setInjectionData({ ...injectionData, notes: e.target.value })}
          rows={4}
          disabled={!canEdit}
          className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-500"
          placeholder="Injection technique, patient response, counseling provided..."
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={!canEdit}
          className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          <span>Save Injection Record</span>
        </button>
      </div>
    </div>
  );
}
