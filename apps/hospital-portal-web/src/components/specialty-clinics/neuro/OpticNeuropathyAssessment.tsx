'use client';

import React, { useState } from 'react';
import { Eye, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

interface OpticNeuropathyAssessmentProps {
  patientId: string;
  visionOD: string;
  visionOS: string;
  diagnosis: string;
  canEdit?: boolean;
  onSave?: (data: any) => void;
}

export default function OpticNeuropathyAssessment({
  patientId,
  visionOD,
  visionOS,
  diagnosis,
  canEdit = true,
  onSave,
}: OpticNeuropathyAssessmentProps) {
  const [neuropathyType, setNeuropathyType] = useState('AION - Arteritic');
  const [onset, setOnset] = useState('Sudden (hours to days)');
  const [affectedEye, setAffectedEye] = useState('OD');

  // Optic disc appearance
  const [discOD, setDiscOD] = useState({
    swelling: true,
    pallor: true,
    hemorrhages: false,
    cupping: false,
    neovascularization: false,
  });

  const [discOS, setDiscOS] = useState({
    swelling: false,
    pallor: false,
    hemorrhages: false,
    cupping: false,
    neovascularization: false,
  });

  // Color vision
  const [colorVision, setColorVision] = useState({
    OD: 'Severely impaired (0/17 Ishihara plates)',
    OS: 'Normal (17/17 Ishihara plates)',
  });

  // Visual field
  const [visualFieldDefect, setVisualFieldDefect] = useState('Altitudinal (inferior) OD');

  // Differential diagnosis assessment
  const assessNeuropathyType = (): {
    type: string;
    features: string[];
    urgency: string;
    management: string[];
    color: string;
  } => {
    if (neuropathyType.includes('Arteritic')) {
      return {
        type: 'AION - Arteritic (Giant Cell Arteritis)',
        features: [
          'Age >50 years (average 70)',
          'Sudden profound vision loss (often counting fingers or worse)',
          'Pale, swollen disc (chalky white edema)',
          'Altitudinal visual field defect',
          'Jaw claudication, temporal headache, scalp tenderness',
          'Elevated ESR (>50 mm/hr) and CRP',
        ],
        urgency: 'EMERGENCY',
        management: [
          'IMMEDIATE IV methylprednisolone 1g daily × 3 days',
          'ESR, CRP, platelet count (STAT)',
          'Temporal artery biopsy (within 1 week)',
          'High-dose oral prednisone 60-80mg daily after IV',
          'Protect fellow eye (50% risk without treatment)',
          'Rheumatology consult',
        ],
        color: 'bg-red-50 border-red-300 text-red-900',
      };
    } else if (neuropathyType.includes('NAION')) {
      return {
        type: 'NAION - Non-Arteritic Anterior Ischemic Optic Neuropathy',
        features: [
          'Age 50-70 years',
          'Moderate vision loss (6/18 to 6/60)',
          'Hyperemic, swollen disc',
          'Small cup-to-disc ratio ("disc at risk")',
          'Vascular risk factors (HTN, DM, sleep apnea)',
          'Morning vision loss (nocturnal hypotension)',
        ],
        urgency: 'URGENT',
        management: [
          'Rule out GCA (ESR, CRP if age >50)',
          'Control vascular risk factors (BP, glucose, lipids)',
          'CPAP for sleep apnea',
          'Aspirin 81mg daily',
          'No proven treatment (steroids NOT indicated)',
          'Monitor fellow eye (15% risk over 5 years)',
        ],
        color: 'bg-orange-50 border-orange-300 text-orange-900',
      };
    } else if (neuropathyType.includes('Optic Neuritis')) {
      return {
        type: 'Optic Neuritis (Demyelinating)',
        features: [
          'Age 20-45 years (young adults)',
          'Subacute vision loss (days to 2 weeks)',
          'Pain with eye movements (90%)',
          'Central scotoma, dyschromatopsia',
          'RAPD (Marcus Gunn pupil)',
          'Normal or mildly swollen disc (2/3 retrobulbar)',
        ],
        urgency: 'URGENT',
        management: [
          'MRI brain and orbits with gadolinium',
          'High-dose IV methylprednisolone 1g daily × 3-5 days',
          'Oral prednisone taper (optional)',
          'Neurology referral (rule out MS)',
          'Vision recovery expected (95% recover to 6/12 or better)',
          'Consider disease-modifying therapy if MS diagnosed',
        ],
        color: 'bg-blue-50 border-blue-300 text-blue-900',
      };
    } else if (neuropathyType.includes('Papilledema')) {
      return {
        type: 'Papilledema (Increased Intracranial Pressure)',
        features: [
          'Bilateral disc edema',
          'Transient visual obscurations (seconds)',
          'Headache worse with Valsalva, morning',
          'Preserved visual acuity (early)',
          'Enlarged blind spots',
          'Pulsatile tinnitus, CN VI palsy',
        ],
        urgency: 'URGENT',
        management: [
          'MRI/MRV brain (rule out mass, venous sinus thrombosis)',
          'Lumbar puncture with opening pressure (>250 mm H2O)',
          'Acetazolamide 500mg-1g BID',
          'Weight loss if obese (IIH association)',
          'Neurology/Neurosurgery consult',
          'Optic nerve sheath fenestration or VP shunt if refractory',
        ],
        color: 'bg-purple-50 border-purple-300 text-purple-900',
      };
    } else {
      return {
        type: 'Other Optic Neuropathy',
        features: ['Requires further evaluation'],
        urgency: 'ROUTINE',
        management: ['Complete neuro-ophthalmic workup'],
        color: 'bg-gray-50 border-gray-300 text-gray-900',
      };
    }
  };

  const assessment = assessNeuropathyType();

  const handleSave = () => {
    if (onSave) {
      onSave({
        neuropathyType,
        onset,
        affectedEye,
        discOD,
        discOS,
        colorVision,
        visualFieldDefect,
        assessment,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gray-900">Optic Neuropathy Assessment</h3>
        <p className="text-sm text-gray-600">
          Systematic evaluation of optic nerve disorders (AION, NAION, optic neuritis, papilledema)
        </p>
      </div>

      {/* Classification */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">Optic Neuropathy Classification</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={neuropathyType}
              onChange={(e) => setNeuropathyType(e.target.value)}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option>AION - Arteritic (Giant Cell Arteritis)</option>
              <option>NAION (Non-Arteritic)</option>
              <option>Optic Neuritis (Demyelinating)</option>
              <option>Papilledema (Increased ICP)</option>
              <option>Compressive Optic Neuropathy</option>
              <option>Toxic Optic Neuropathy (Methanol, Ethambutol)</option>
              <option>Hereditary (Leber's, Dominant Optic Atrophy)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Onset</label>
            <select
              value={onset}
              onChange={(e) => setOnset(e.target.value)}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option>Sudden (hours to days)</option>
              <option>Subacute (days to weeks)</option>
              <option>Gradual (weeks to months)</option>
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
              <option>OD (Right eye)</option>
              <option>OS (Left eye)</option>
              <option>OU (Both eyes)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Optic Disc Appearance */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <h4 className="text-lg font-bold text-blue-900 mb-4">Optic Disc Appearance</h4>
        <div className="grid grid-cols-2 gap-6">
          {/* OD */}
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h5 className="font-semibold text-blue-900 mb-3">OD (Right Eye)</h5>
            <div className="space-y-2">
              {[
                { key: 'swelling', label: 'Disc Swelling/Edema' },
                { key: 'pallor', label: 'Pallor (pale disc)' },
                { key: 'hemorrhages', label: 'Hemorrhages' },
                { key: 'cupping', label: 'Cupping' },
                { key: 'neovascularization', label: 'Neovascularization' },
              ].map((item) => (
                <label key={item.key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={discOD[item.key as keyof typeof discOD]}
                    onChange={(e) =>
                      setDiscOD((prev) => ({ ...prev, [item.key]: e.target.checked }))
                    }
                    disabled={!canEdit}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-900">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* OS */}
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h5 className="font-semibold text-blue-900 mb-3">OS (Left Eye)</h5>
            <div className="space-y-2">
              {[
                { key: 'swelling', label: 'Disc Swelling/Edema' },
                { key: 'pallor', label: 'Pallor (pale disc)' },
                { key: 'hemorrhages', label: 'Hemorrhages' },
                { key: 'cupping', label: 'Cupping' },
                { key: 'neovascularization', label: 'Neovascularization' },
              ].map((item) => (
                <label key={item.key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={discOS[item.key as keyof typeof discOS]}
                    onChange={(e) =>
                      setDiscOS((prev) => ({ ...prev, [item.key]: e.target.checked }))
                    }
                    disabled={!canEdit}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-900">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Color Vision & Visual Field */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
          <h4 className="text-lg font-bold text-green-900 mb-4">Color Vision (Ishihara)</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-green-700 mb-1">OD (Right Eye)</label>
              <input
                type="text"
                value={colorVision.OD}
                onChange={(e) => setColorVision((prev) => ({ ...prev, OD: e.target.value }))}
                disabled={!canEdit}
                className="w-full px-3 py-2 border border-green-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-green-700 mb-1">OS (Left Eye)</label>
              <input
                type="text"
                value={colorVision.OS}
                onChange={(e) => setColorVision((prev) => ({ ...prev, OS: e.target.value }))}
                disabled={!canEdit}
                className="w-full px-3 py-2 border border-green-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
          <h4 className="text-lg font-bold text-purple-900 mb-4">Visual Field Defect Pattern</h4>
          <select
            value={visualFieldDefect}
            onChange={(e) => setVisualFieldDefect(e.target.value)}
            disabled={!canEdit}
            className="w-full px-3 py-2 border border-purple-300 rounded-lg"
          >
            <option>Altitudinal (inferior) OD</option>
            <option>Altitudinal (superior) OD</option>
            <option>Central scotoma</option>
            <option>Arcuate defect</option>
            <option>Enlarged blind spot</option>
            <option>Hemianopia</option>
            <option>No defect detected</option>
          </select>
        </div>
      </div>

      {/* Differential Diagnosis Assessment */}
      <div className={`border-2 rounded-lg p-6 ${assessment.color}`}>
        <div className="flex items-start space-x-3">
          {assessment.urgency === 'EMERGENCY' ? (
            <AlertTriangle className="w-6 h-6 mt-0.5 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
          )}
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

            <div>
              <p className="text-sm font-semibold mb-2">Management Protocol:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                {assessment.management.map((step, index) => (
                  <li key={index} className="font-medium">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Guidelines */}
      <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
        <h5 className="font-semibold text-orange-900 mb-3">Optic Neuropathy Guidelines</h5>
        <div className="space-y-2 text-sm text-orange-800">
          <p>
            <strong>AION vs NAION:</strong> Arteritic AION is EMERGENCY (GCA) - profound vision
            loss, age {'>'}50, ESR {'>'}50, jaw claudication. Immediate IV steroids prevent fellow eye
            involvement (50% risk).
          </p>
          <p>
            <strong>Optic Neuritis:</strong> Young adults, pain with eye movement, central scotoma.
            MRI brain for MS lesions. IV methylprednisolone speeds recovery but doesn't improve
            final vision.
          </p>
          <p>
            <strong>Papilledema:</strong> Bilateral disc edema from raised ICP. Transient visual
            obscurations (TVOs), headache. MRI/MRV + LP with opening pressure. Acetazolamide to
            lower ICP.
          </p>
          <p>
            <strong>RAPD (Relative Afferent Pupillary Defect):</strong> Swinging flashlight test.
            Present in unilateral or asymmetric optic nerve disease. Grade 0.3-3.0 log units with
            neutral density filters.
          </p>
          <p>
            <strong>Red Flags:</strong> Sudden vision loss + headache (GCA), bilateral disc edema
            (ICP), pain with movement (optic neuritis), progressive vision loss (compressive,
            tumor).
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
            <span>Save Optic Neuropathy Assessment</span>
          </button>
        </div>
      )}
    </div>
  );
}
