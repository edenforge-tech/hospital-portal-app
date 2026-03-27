'use client';

import React, { useState } from 'react';
import { Droplet, Eye, CheckCircle, AlertTriangle } from 'lucide-react';

interface PupilReactionsProps {
  patientId: string;
  diagnosis: string;
  canEdit?: boolean;
  onSave?: (data: any) => void;
}

export default function PupilReactions({
  patientId,
  diagnosis,
  canEdit = true,
  onSave,
}: PupilReactionsProps) {
  // Pupil size
  const [pupilSize, setPupilSize] = useState({
    OD: 3.0, // mm (normal: 2-4mm in light, 3-8mm in dark)
    OS: 3.0,
    anisocoria: 0.0, // Difference (>1mm = significant)
  });

  // Light reactions
  const [directLight, setDirectLight] = useState({
    OD: 'Brisk',
    OS: 'Brisk',
  });

  const [consensualLight, setConsensualLight] = useState({
    OD: 'Brisk', // OD when light shined into OS
    OS: 'Brisk', // OS when light shined into OD
  });

  // Near response
  const [nearResponse, setNearResponse] = useState({
    OD: 'Brisk',
    OS: 'Brisk',
    lightNearDissociation: false,
  });

  // Pupil abnormality type
  const [abnormalityType, setAbnormalityType] = useState('Adie\'s Tonic Pupil');
  const [affectedEye, setAffectedEye] = useState('OS');

  // Pharmacological testing
  const [pharmacologicalTests, setPharmacologicalTests] = useState({
    pilocarpine0125: 'Not performed',
    cocaine4: 'Not performed',
    apraclonidine05: 'Not performed',
  });

  // Assess pupil abnormality
  const assessPupilAbnormality = (): {
    type: string;
    features: string[];
    mechanism: string;
    testing: string[];
    management: string[];
    urgency: string;
    color: string;
  } => {
    if (abnormalityType.includes('Adie')) {
      return {
        type: 'Adie\'s Tonic Pupil (Holmes-Adie Syndrome)',
        features: [
          'Unilateral dilated pupil (5-6mm)',
          'Slow, tonic constriction to light (takes 30+ seconds)',
          'Light-near dissociation (better response to near than light)',
          'Denervation supersensitivity',
          'Decreased deep tendon reflexes (Holmes-Adie syndrome)',
          'Benign condition (ciliary ganglion denervation)',
        ],
        mechanism:
          'Parasympathetic denervation of iris sphincter (ciliary ganglion damage). Aberrant regeneration to ciliary muscle → light-near dissociation.',
        testing: [
          'Pilocarpine 0.125% test: Tonic pupil constricts (denervation supersensitivity)',
          'Normal pupil does NOT constrict to 0.125% (too weak)',
          'Both pupils constrict to 1% pilocarpine (control)',
        ],
        management: [
          'Reassurance - benign condition',
          'Pilocarpine 0.125% PRN for photophobia (dilated pupil)',
          'Reading glasses if accommodative paresis symptomatic',
          'Rule out other causes (syphilis, herpes zoster)',
        ],
        urgency: 'Routine',
        color: 'bg-blue-50 border-blue-300 text-blue-900',
      };
    } else if (abnormalityType.includes('Horner')) {
      return {
        type: 'Horner\'s Syndrome',
        features: [
          'Triad: Miosis (small pupil 1-2mm), Ptosis (1-2mm), Anhidrosis',
          'Pupil dilation lag in dark (takes 15-20 seconds)',
          'Light and near responses normal (just smaller)',
          'Iris heterochromia if congenital (lighter affected side)',
        ],
        mechanism:
          'Sympathetic pathway disruption (hypothalamus → brainstem → spinal cord → superior cervical ganglion → carotid → eye).',
        testing: [
          'Cocaine 4-10% test: Normal pupil dilates, Horner\'s does NOT',
          'Apraclonidine 0.5% test: Reverses anisocoria (Horner\'s pupil dilates)',
          'Hydroxyamphetamine 1% test: Localizes lesion (3rd order lesion = no dilation)',
        ],
        management: [
          '1st order (central): MRI brain/cervical cord (stroke, MS, tumor)',
          '2nd order (preganglionic): CT chest/neck (Pancoast tumor, thyroid, lymphoma)',
          '3rd order (postganglionic): MRI/MRA neck (carotid dissection, cluster headache)',
          'Pediatric congenital: Reassurance if isolated',
        ],
        urgency: 'Urgent (rule out serious causes)',
        color: 'bg-orange-50 border-orange-300 text-orange-900',
      };
    } else if (abnormalityType.includes('Argyll Robertson')) {
      return {
        type: 'Argyll Robertson Pupil',
        features: [
          'Small, irregular pupils (1-2mm)',
          'Light-near dissociation (no light response, brisk near)',
          'Bilateral (usually)',
          'No dilation to mydriatics (fixed)',
          'Classic sign of neurosyphilis (tertiary)',
        ],
        mechanism: 'Pretectal nucleus damage (syphilis, diabetes). Spares Edinger-Westphal.',
        testing: [
          'Serology: RPR, VDRL, FTA-ABS (syphilis)',
          'Lumbar puncture if positive (neurosyphilis workup)',
        ],
        management: [
          'Treat neurosyphilis: IV penicillin G 4 million units Q4H × 14 days',
          'Neurology consult',
          'CSF VDRL if CNS involvement suspected',
        ],
        urgency: 'Urgent',
        color: 'bg-red-50 border-red-300 text-red-900',
      };
    } else if (abnormalityType.includes('Third nerve')) {
      return {
        type: 'CN III Palsy with Pupil Involvement',
        features: [
          'Dilated pupil (6-8mm), non-reactive',
          'Ptosis (complete)',
          'Eye "down and out"',
          'Limited adduction, upgaze, downgaze',
        ],
        mechanism:
          'Compressive lesion affecting pupillomotor fibers (superficial on CN III). Aneurysm most concerning.',
        testing: [
          'URGENT MRI/MRA brain (rule out posterior communicating artery aneurysm)',
          'CTA if MRA contraindicated',
        ],
        management: [
          'EMERGENCY if pupil-involved (aneurysm)',
          'Neurosurgery consult STAT',
          'Blood pressure control',
        ],
        urgency: 'EMERGENCY',
        color: 'bg-red-50 border-red-300 text-red-900',
      };
    } else {
      return {
        type: 'Other Pupil Abnormality',
        features: ['Requires detailed assessment'],
        mechanism: 'Variable',
        testing: ['Based on clinical presentation'],
        management: ['Individualized'],
        urgency: 'Routine to Urgent',
        color: 'bg-gray-50 border-gray-300 text-gray-900',
      };
    }
  };

  const assessment = assessPupilAbnormality();

  // Calculate anisocoria
  React.useEffect(() => {
    const diff = Math.abs(pupilSize.OD - pupilSize.OS);
    setPupilSize((prev) => ({ ...prev, anisocoria: parseFloat(diff.toFixed(1)) }));
  }, [pupilSize.OD, pupilSize.OS]);

  const handleSave = () => {
    if (onSave) {
      onSave({
        pupilSize,
        directLight,
        consensualLight,
        nearResponse,
        abnormalityType,
        affectedEye,
        pharmacologicalTests,
        assessment,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gray-900">Pupil Reactions & Abnormalities</h3>
        <p className="text-sm text-gray-600">
          Direct/consensual light reflex, near response, Adie's, Horner's, pharmacological testing
        </p>
      </div>

      {/* Pupil Size Measurement */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">Pupil Size Measurement</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OD Size (mm) - Normal: 2-4mm light, 3-8mm dark
            </label>
            <input
              type="number"
              step="0.5"
              min="1"
              max="9"
              value={pupilSize.OD}
              onChange={(e) =>
                setPupilSize((prev) => ({ ...prev, OD: parseFloat(e.target.value) }))
              }
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OS Size (mm) - Normal: 2-4mm light, 3-8mm dark
            </label>
            <input
              type="number"
              step="0.5"
              min="1"
              max="9"
              value={pupilSize.OS}
              onChange={(e) =>
                setPupilSize((prev) => ({ ...prev, OS: parseFloat(e.target.value) }))
              }
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anisocoria (Difference) - Significant if &gt;1mm
            </label>
            <input
              type="number"
              value={pupilSize.anisocoria}
              disabled
              className={`w-full px-3 py-2 border rounded-lg ${
                pupilSize.anisocoria > 1
                  ? 'border-red-500 bg-red-50 text-red-900 font-bold'
                  : 'border-green-500 bg-green-50'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Light Reactions */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <h4 className="text-lg font-bold text-blue-900 mb-4">Light Reactions</h4>

        <div className="grid grid-cols-2 gap-6">
          {/* Direct Light Response */}
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h5 className="font-semibold text-blue-900 mb-3">
              Direct Light Response (Light shined directly into eye)
            </h5>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  OD Response
                </label>
                <select
                  value={directLight.OD}
                  onChange={(e) => setDirectLight((prev) => ({ ...prev, OD: e.target.value }))}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg"
                >
                  <option>Brisk (normal)</option>
                  <option>Sluggish (reduced)</option>
                  <option>Absent (no response)</option>
                  <option>Paradoxical dilation (RAPD)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  OS Response
                </label>
                <select
                  value={directLight.OS}
                  onChange={(e) => setDirectLight((prev) => ({ ...prev, OS: e.target.value }))}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg"
                >
                  <option>Brisk (normal)</option>
                  <option>Sluggish (reduced)</option>
                  <option>Absent (no response)</option>
                  <option>Paradoxical dilation (RAPD)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Consensual Light Response */}
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h5 className="font-semibold text-blue-900 mb-3">
              Consensual Light Response (Opposite eye constriction)
            </h5>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  OD Response (when light shined into OS)
                </label>
                <select
                  value={consensualLight.OD}
                  onChange={(e) =>
                    setConsensualLight((prev) => ({ ...prev, OD: e.target.value }))
                  }
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg"
                >
                  <option>Brisk (normal)</option>
                  <option>Sluggish (reduced)</option>
                  <option>Absent (no response)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  OS Response (when light shined into OD)
                </label>
                <select
                  value={consensualLight.OS}
                  onChange={(e) =>
                    setConsensualLight((prev) => ({ ...prev, OS: e.target.value }))
                  }
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg"
                >
                  <option>Brisk (normal)</option>
                  <option>Sluggish (reduced)</option>
                  <option>Absent (no response)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Near Response */}
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <h4 className="text-lg font-bold text-purple-900 mb-4">
          Near Response (Accommodation-Convergence)
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">OD Near</label>
            <select
              value={nearResponse.OD}
              onChange={(e) => setNearResponse((prev) => ({ ...prev, OD: e.target.value }))}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-purple-300 rounded-lg"
            >
              <option>Brisk (normal)</option>
              <option>Sluggish (reduced)</option>
              <option>Absent (no response)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">OS Near</label>
            <select
              value={nearResponse.OS}
              onChange={(e) => setNearResponse((prev) => ({ ...prev, OS: e.target.value }))}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-purple-300 rounded-lg"
            >
              <option>Brisk (normal)</option>
              <option>Sluggish (reduced)</option>
              <option>Absent (no response)</option>
            </select>
          </div>

          <div>
            <label className="flex items-center space-x-2 mt-8">
              <input
                type="checkbox"
                checked={nearResponse.lightNearDissociation}
                onChange={(e) =>
                  setNearResponse((prev) => ({
                    ...prev,
                    lightNearDissociation: e.target.checked,
                  }))
                }
                disabled={!canEdit}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-sm text-purple-900 font-medium">
                Light-Near Dissociation (Better near than light)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Pupil Abnormality Classification */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">Pupil Abnormality Classification</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Abnormality Type</label>
            <select
              value={abnormalityType}
              onChange={(e) => setAbnormalityType(e.target.value)}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option>Adie's Tonic Pupil (Holmes-Adie)</option>
              <option>Horner's Syndrome</option>
              <option>Argyll Robertson Pupil (neurosyphilis)</option>
              <option>Third nerve palsy (pupil-involved)</option>
              <option>Pharmacological (atropine, pilocarpine)</option>
              <option>Traumatic mydriasis</option>
              <option>None (normal pupils)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Affected Eye</label>
            <select
              value={affectedEye}
              onChange={(e) => setAffectedEye(e.target.value)}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option>OD</option>
              <option>OS</option>
              <option>OU (both)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pharmacological Testing */}
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
        <h4 className="text-lg font-bold text-yellow-900 mb-4">Pharmacological Testing</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-yellow-700 mb-2">
              Pilocarpine 0.125% (Adie's test)
            </label>
            <select
              value={pharmacologicalTests.pilocarpine0125}
              onChange={(e) =>
                setPharmacologicalTests((prev) => ({ ...prev, pilocarpine0125: e.target.value }))
              }
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-yellow-300 rounded-lg"
            >
              <option>Not performed</option>
              <option>Tonic pupil constricted (Adie's confirmed)</option>
              <option>Both pupils no response (normal)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-yellow-700 mb-2">
              Cocaine 4% (Horner's test)
            </label>
            <select
              value={pharmacologicalTests.cocaine4}
              onChange={(e) =>
                setPharmacologicalTests((prev) => ({ ...prev, cocaine4: e.target.value }))
              }
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-yellow-300 rounded-lg"
            >
              <option>Not performed</option>
              <option>Normal pupil dilated, Horner's did NOT (confirmed)</option>
              <option>Both pupils dilated (not Horner's)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-yellow-700 mb-2">
              Apraclonidine 0.5% (Horner's test)
            </label>
            <select
              value={pharmacologicalTests.apraclonidine05}
              onChange={(e) =>
                setPharmacologicalTests((prev) => ({ ...prev, apraclonidine05: e.target.value }))
              }
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-yellow-300 rounded-lg"
            >
              <option>Not performed</option>
              <option>Reversed anisocoria (Horner's pupil dilated)</option>
              <option>No effect</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pupil Abnormality Assessment */}
      <div className={`border-2 rounded-lg p-6 ${assessment.color}`}>
        <div className="flex items-start space-x-3">
          <Droplet className="w-6 h-6 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-lg font-bold mb-3">
              {assessment.type}
              {assessment.urgency === 'EMERGENCY' && (
                <span className="ml-3 px-3 py-1 bg-red-600 text-white rounded-full text-sm font-bold">
                  EMERGENCY
                </span>
              )}
            </h4>

            <div className="mb-4">
              <p className="text-sm font-semibold mb-2">Key Features:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {assessment.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white/50 rounded-lg p-3 mb-4">
              <p className="text-sm font-semibold mb-1">Mechanism:</p>
              <p className="text-sm">{assessment.mechanism}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm font-semibold mb-2">Diagnostic Testing:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {assessment.testing.map((test, index) => (
                  <li key={index}>{test}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">Management:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {assessment.management.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Guidelines */}
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
        <h5 className="font-semibold text-green-900 mb-3">Pupil Abnormality Guidelines</h5>
        <div className="space-y-2 text-sm text-green-800">
          <p>
            <strong>Adie's Tonic Pupil:</strong> Dilated pupil, slow tonic constriction, light-near
            dissociation. Pilocarpine 0.125% causes constriction (denervation supersensitivity).
            Benign condition.
          </p>
          <p>
            <strong>Horner's Syndrome:</strong> Triad - miosis (small pupil), ptosis (1-2mm),
            anhidrosis. Cocaine 4% test: normal pupil dilates, Horner's does NOT. Apraclonidine
            reverses anisocoria.
          </p>
          <p>
            <strong>Horner's Localization:</strong> 1st order (central - stroke, MS), 2nd order
            (preganglionic - Pancoast tumor), 3rd order (postganglionic - carotid dissection).
            Imaging based on suspected level.
          </p>
          <p>
            <strong>Light-Near Dissociation:</strong> Near response better than light response.
            Causes: Adie's tonic pupil, Argyll Robertson (neurosyphilis), dorsal midbrain syndrome,
            diabetes.
          </p>
          <p>
            <strong>CN III Palsy:</strong> Pupil-involved (dilated, non-reactive) = compressive
            (aneurysm) - EMERGENCY. Pupil-sparing = microvascular (diabetes) - resolves 3-6 months.
          </p>
          <p>
            <strong>Anisocoria Greater in Light:</strong> Abnormal pupil is LARGER (can't
            constrict). Causes: Adie's, CN III palsy, pharmacologic (atropine), trauma.
          </p>
          <p>
            <strong>Anisocoria Greater in Dark:</strong> Abnormal pupil is SMALLER (can't dilate).
            Causes: Horner's syndrome, Argyll Robertson, pharmacologic (pilocarpine).
          </p>
        </div>
      </div>

      {/* Save Button */}
      {canEdit && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Save Pupil Assessment</span>
          </button>
        </div>
      )}
    </div>
  );
}
