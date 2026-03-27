'use client';

import { useState, useEffect } from 'react';
import { Activity, AlertCircle, CheckCircle, Plus, Trash2, DollarSign } from 'lucide-react';

interface Medication {
  id: string;
  drugName: string;
  drugClass: 'Prostaglandin' | 'Beta-blocker' | 'Alpha-agonist' | 'CAI' | 'Combination';
  eye: 'OD' | 'OS' | 'OU';
  dosage: string;
  frequency: 'QD' | 'BID' | 'TID' | 'QID';
  startDate: string;
  iopReduction: number;
  sideEffects: string[];
  compliance: number; // 0-100%
  active: boolean;
}

interface GlaucomaMedicationTrackerProps {
  patientId: string;
  activeMedications: number;
  onSave?: (data: any) => void;
  canEdit?: boolean;
}

export default function GlaucomaMedicationTracker({
  patientId,
  activeMedications,
  onSave,
  canEdit = false,
}: GlaucomaMedicationTrackerProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const loadMedications = async () => {
      try {
        setLoading(true);
        
        // TODO: Replace with actual API call
        const mockMedications: Medication[] = [
          {
            id: '1',
            drugName: 'Latanoprost',
            drugClass: 'Prostaglandin',
            eye: 'OU',
            dosage: '0.005% 1 drop',
            frequency: 'QD',
            startDate: '2023-06-15',
            iopReduction: 8,
            sideEffects: ['Hyperemia', 'Eyelash growth'],
            compliance: 85,
            active: true,
          },
          {
            id: '2',
            drugName: 'Timolol',
            drugClass: 'Beta-blocker',
            eye: 'OU',
            dosage: '0.5% 1 drop',
            frequency: 'BID',
            startDate: '2024-03-20',
            iopReduction: 6,
            sideEffects: ['Bradycardia'],
            compliance: 90,
            active: true,
          },
          {
            id: '3',
            drugName: 'Brimonidine',
            drugClass: 'Alpha-agonist',
            eye: 'OU',
            dosage: '0.2% 1 drop',
            frequency: 'TID',
            startDate: '2025-01-10',
            iopReduction: 5,
            sideEffects: ['Drowsiness', 'Dry mouth'],
            compliance: 70,
            active: true,
          },
        ];

        setMedications(mockMedications);
      } catch (error) {
        console.error('Failed to load medications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMedications();
  }, [patientId]);

  const drugOptions = {
    Prostaglandin: ['Latanoprost', 'Travoprost', 'Bimatoprost', 'Tafluprost'],
    'Beta-blocker': ['Timolol', 'Betaxolol', 'Levobunolol', 'Carteolol'],
    'Alpha-agonist': ['Brimonidine', 'Apraclonidine'],
    CAI: ['Dorzolamide', 'Brinzolamide', 'Acetazolamide (Oral)'],
    Combination: ['Cosopt (Timolol + Dorzolamide)', 'Combigan (Timolol + Brimonidine)', 'Simbrinza (Brinzolamide + Brimonidine)'],
  };

  const sideEffectOptions = [
    'Hyperemia', 'Eyelash growth', 'Iris darkening', 'Periorbital pigmentation',
    'Bradycardia', 'Bronchospasm', 'Fatigue',
    'Drowsiness', 'Dry mouth', 'Allergic conjunctivitis',
    'Bitter taste', 'Stinging', 'Blurred vision',
    'Kidney stones', 'Paresthesias', 'Fatigue (systemic)',
  ];

  const activeMeds = medications.filter(m => m.active);
  const isMMT = activeMeds.length >= 3;

  const avgCompliance = activeMeds.length > 0
    ? Math.round(activeMeds.reduce((sum, med) => sum + med.compliance, 0) / activeMeds.length)
    : 0;

  const totalIOPReduction = activeMeds.reduce((sum, med) => sum + med.iopReduction, 0);

  const estimateMonthlyCost = () => {
    const costs: Record<string, number> = {
      Prostaglandin: 180,
      'Beta-blocker': 25,
      'Alpha-agonist': 150,
      CAI: 200,
      Combination: 250,
    };

    return activeMeds.reduce((total, med) => {
      const baseCost = costs[med.drugClass] || 0;
      const multiplier = med.eye === 'OU' ? 1 : 0.5;
      return total + (baseCost * multiplier);
    }, 0);
  };

  const getComplianceColor = (compliance: number) => {
    if (compliance >= 80) return 'text-green-900 bg-green-50 border-green-300';
    if (compliance >= 60) return 'text-yellow-900 bg-yellow-50 border-yellow-300';
    return 'text-red-900 bg-red-50 border-red-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-orange-600" />
            Glaucoma Medication Management
          </h3>
          <p className="text-sm text-gray-600 mt-1">Current medications, compliance tracking & side effects monitoring</p>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medication</span>
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <h4 className="text-xs font-semibold text-blue-900 mb-1">Active Medications</h4>
          <p className="text-3xl font-bold text-blue-900">{activeMeds.length}</p>
          {isMMT && (
            <p className="text-xs text-red-700 font-semibold mt-2">⚠️ Maximum Medical Therapy</p>
          )}
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <h4 className="text-xs font-semibold text-green-900 mb-1">Avg Compliance</h4>
          <p className="text-3xl font-bold text-green-900">{avgCompliance}%</p>
          <p className="text-xs text-green-700 mt-2">
            {avgCompliance >= 80 ? '✓ Good adherence' : '⚠️ Poor adherence'}
          </p>
        </div>

        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
          <h4 className="text-xs font-semibold text-purple-900 mb-1">Total IOP Reduction</h4>
          <p className="text-3xl font-bold text-purple-900">~{totalIOPReduction} mmHg</p>
          <p className="text-xs text-purple-700 mt-2">Estimated effect</p>
        </div>

        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
          <h4 className="text-xs font-semibold text-orange-900 mb-1">Monthly Cost</h4>
          <p className="text-3xl font-bold text-orange-900">₹{estimateMonthlyCost()}</p>
          <p className="text-xs text-orange-700 mt-2">Approximate</p>
        </div>
      </div>

      {/* MMT Alert */}
      {isMMT && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-red-900 mb-1">Maximum Medical Therapy (MMT) Reached</h4>
              <p className="text-sm text-red-800">
                Patient is on {activeMeds.length} medications. If IOP remains above target, consider:
              </p>
              <ul className="text-sm text-red-800 list-disc list-inside mt-2 space-y-1">
                <li>Selective Laser Trabeculoplasty (SLT)</li>
                <li>Trabeculectomy (filtering surgery)</li>
                <li>Glaucoma Drainage Device (tube shunt)</li>
                <li>Minimally Invasive Glaucoma Surgery (MIGS)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Medications Table */}
      <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b-2 border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Drug Name</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Class</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Eye</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Dosage</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Frequency</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Start Date</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">IOP ↓</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Compliance</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Side Effects</th>
              {canEdit && <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {activeMeds.map((med, index) => (
              <tr key={med.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">{med.drugName}</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    med.drugClass === 'Prostaglandin' ? 'bg-purple-100 text-purple-900' :
                    med.drugClass === 'Beta-blocker' ? 'bg-blue-100 text-blue-900' :
                    med.drugClass === 'Alpha-agonist' ? 'bg-green-100 text-green-900' :
                    med.drugClass === 'CAI' ? 'bg-orange-100 text-orange-900' :
                    'bg-pink-100 text-pink-900'
                  }`}>
                    {med.drugClass}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-mono font-bold text-gray-900">{med.eye}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{med.dosage}</td>
                <td className="px-4 py-3 text-sm font-mono font-bold text-gray-900">{med.frequency}</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {new Date(med.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-green-700">~{med.iopReduction} mmHg</td>
                <td className="px-4 py-3">
                  <div className={`px-2 py-1 rounded-full text-xs font-bold border-2 text-center ${getComplianceColor(med.compliance)}`}>
                    {med.compliance}%
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {med.sideEffects.length > 0 ? (
                    <div className="space-y-1">
                      {med.sideEffects.map((effect, idx) => (
                        <span key={idx} className="block text-xs text-red-700">• {effect}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-green-700 text-xs">✓ None reported</span>
                  )}
                </td>
                {canEdit && (
                  <td className="px-4 py-3">
                    <button className="text-red-600 hover:text-red-800 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {activeMeds.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="font-semibold">No active medications</p>
            <p className="text-sm mt-1">Add medications to start tracking</p>
          </div>
        )}
      </div>

      {/* Medication Timeline */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-sm font-bold text-gray-900 mb-4">Medication Timeline</h4>
        <div className="space-y-3">
          {activeMeds.map((med, index) => {
            const monthsSinceStart = Math.floor(
              (new Date().getTime() - new Date(med.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
            );

            return (
              <div key={med.id} className="flex items-center space-x-4">
                <div className="w-32 text-sm text-gray-700 font-mono">
                  {new Date(med.startDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                </div>
                <div className="flex-1 bg-gradient-to-r from-orange-200 to-orange-100 rounded-full h-8 flex items-center px-4 border-2 border-orange-300">
                  <span className="text-sm font-semibold text-orange-900">
                    {med.drugName} - {monthsSinceStart} months
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Medication Suggestions */}
      {!isMMT && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-blue-900 mb-1">Suggested Next Steps</h4>
              <p className="text-sm text-blue-800">
                {activeMeds.length === 0 && 'Start with prostaglandin analog (first-line therapy) - Best IOP reduction with QD dosing.'}
                {activeMeds.length === 1 && 'Add beta-blocker or alpha-agonist for additional IOP reduction.'}
                {activeMeds.length === 2 && 'Consider adding carbonic anhydrase inhibitor or combination drop.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Drug Interaction Checker */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-bold text-yellow-900 mb-2 flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          Contraindications & Warnings
        </h4>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li><strong>Beta-blockers:</strong> Avoid in asthma, COPD, bradycardia, heart block</li>
          <li><strong>Alpha-agonists:</strong> Use caution in cardiovascular disease, avoid in infants</li>
          <li><strong>CAIs (systemic):</strong> Monitor for kidney stones, electrolyte imbalance</li>
          <li><strong>Prostaglandins:</strong> May cause iris/periocular pigmentation (permanent)</li>
        </ul>
      </div>

      {/* Save Button */}
      {canEdit && (
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => onSave?.(medications)}
            className="px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
          >
            Save Medication Updates
          </button>
        </div>
      )}
    </div>
  );
}
