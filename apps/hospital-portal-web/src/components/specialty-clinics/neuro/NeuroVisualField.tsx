'use client';

import React, { useState } from 'react';
import { Target, Brain, AlertTriangle, CheckCircle } from 'lucide-react';

interface NeuroVisualFieldProps {
  patientId: string;
  defectPattern: string;
  canEdit?: boolean;
  onSave?: (data: any) => void;
}

export default function NeuroVisualField({
  patientId,
  defectPattern,
  canEdit = true,
  onSave,
}: NeuroVisualFieldProps) {
  const [pattern, setPattern] = useState('Bitemporal hemianopia');
  const [affectedEye, setAffectedEye] = useState('OU');
  const [respectsVerticalMidline, setRespectsVerticalMidline] = useState(true);

  // Visual field defect characteristics
  const [characteristics, setCharacteristics] = useState({
    homonymous: false,
    heteronymous: true,
    complete: false,
    congruous: true,
    maculaSpared: false,
  });

  // Localization
  const [localization, setLocalization] = useState('Optic chiasm');

  // Assess neurological localization
  const assessLocalization = (): {
    location: string;
    anatomy: string;
    defectType: string;
    features: string[];
    causes: string[];
    imaging: string;
    urgency: string;
    color: string;
  } => {
    if (pattern.includes('Bitemporal')) {
      return {
        location: 'Optic Chiasm',
        anatomy: 'Crossing fibers from nasal retina (temporal field)',
        defectType: 'Bitemporal Hemianopia (heteronymous)',
        features: [
          'Both temporal fields affected',
          'Respects vertical midline',
          'Usually incomplete initially',
          'May be asymmetric',
          'Visual acuity often preserved early',
        ],
        causes: [
          'Pituitary adenoma (most common - 80%)',
          'Craniopharyngioma',
          'Meningioma (tuberculum sellae)',
          'Aneurysm (anterior communicating artery)',
          'Glioma (optic chiasm)',
        ],
        imaging: 'MRI pituitary with dedicated views, contrast',
        urgency: 'Urgent',
        color: 'bg-orange-50 border-orange-300 text-orange-900',
      };
    } else if (pattern.includes('Homonymous hemianopia')) {
      const right = pattern.includes('right');
      return {
        location: 'Optic Tract / Optic Radiation / Visual Cortex',
        anatomy: 'Post-chiasmal pathway (contralateral to field defect)',
        defectType: `${right ? 'Right' : 'Left'} Homonymous Hemianopia`,
        features: [
          'Same side of visual field affected in both eyes',
          'Right hemianopia = left brain lesion (and vice versa)',
          'Congruous (similar shape) = posterior lesion (occipital)',
          'Incongruous (different shape) = anterior lesion (optic tract)',
          'Macula sparing = occipital cortex (dual blood supply)',
        ],
        causes: [
          'Stroke (MCA, PCA) - most common',
          'Tumor (temporal, parietal, occipital lobe)',
          'Trauma',
          'Demyelination (MS)',
          'Abscess',
        ],
        imaging: 'MRI brain with DWI (stroke protocol), MRA',
        urgency: 'Emergency (if acute)',
        color: 'bg-red-50 border-red-300 text-red-900',
      };
    } else if (pattern.includes('Quadrantanopia')) {
      const superior = pattern.includes('superior');
      return {
        location: superior ? 'Temporal Lobe (Meyer\'s Loop)' : 'Parietal Lobe',
        anatomy: superior
          ? 'Inferior optic radiations (temporal lobe)'
          : 'Superior optic radiations (parietal lobe)',
        defectType: `${superior ? 'Superior' : 'Inferior'} Quadrantanopia`,
        features: [
          superior
            ? '"Pie in the sky" defect (superior quadrant loss)'
            : 'Inferior quadrant loss',
          'Homonymous (same side both eyes)',
          'Congruous (similar shape)',
          superior ? 'Temporal lobe lesion' : 'Parietal lobe lesion',
        ],
        causes: [
          'Stroke (MCA territory)',
          'Tumor (temporal or parietal lobe)',
          'Trauma',
          'Surgical resection (temporal lobectomy)',
        ],
        imaging: 'MRI brain with contrast',
        urgency: 'Urgent',
        color: 'bg-orange-50 border-orange-300 text-orange-900',
      };
    } else if (pattern.includes('Altitudinal')) {
      return {
        location: 'Optic Nerve (AION, NAION)',
        anatomy: 'Optic nerve head infarction',
        defectType: 'Altitudinal Defect (superior or inferior)',
        features: [
          'Horizontal line dividing field',
          'Respects horizontal midline',
          'Usually unilateral',
          'Associated with optic disc swelling/pallor',
          'RAPD present',
        ],
        causes: [
          'AION - Arteritic (Giant Cell Arteritis)',
          'NAION - Non-Arteritic',
          'Branch retinal artery occlusion',
          'Optic nerve compression (rare)',
        ],
        imaging: 'MRI orbits with fat suppression, ESR/CRP if age >50',
        urgency: 'Emergency (if AION)',
        color: 'bg-red-50 border-red-300 text-red-900',
      };
    } else if (pattern.includes('Central scotoma')) {
      return {
        location: 'Optic Nerve (Optic Neuritis, Compression)',
        anatomy: 'Papillomacular bundle',
        defectType: 'Central Scotoma',
        features: [
          'Central vision loss (blind spot in center of vision)',
          'Preserved peripheral vision',
          'Color vision severely affected (dyschromatopsia)',
          'RAPD present',
          'Usually unilateral',
        ],
        causes: [
          'Optic neuritis (demyelinating)',
          'Nutritional optic neuropathy (B12, folate)',
          'Toxic optic neuropathy (methanol, ethambutol)',
          'Leber hereditary optic neuropathy',
          'Compressive lesion (meningioma)',
        ],
        imaging: 'MRI brain and orbits with contrast (gadolinium)',
        urgency: 'Urgent',
        color: 'bg-yellow-50 border-yellow-300 text-yellow-900',
      };
    } else {
      return {
        location: 'Variable',
        anatomy: 'Requires detailed mapping',
        defectType: 'Other Pattern',
        features: ['Requires formal perimetry'],
        causes: ['Multiple etiologies'],
        imaging: 'MRI brain and orbits',
        urgency: 'Routine to Urgent',
        color: 'bg-gray-50 border-gray-300 text-gray-900',
      };
    }
  };

  const assessment = assessLocalization();

  const handleSave = () => {
    if (onSave) {
      onSave({
        pattern,
        affectedEye,
        respectsVerticalMidline,
        characteristics,
        localization,
        assessment,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gray-900">Neuro-Ophthalmic Visual Field Defects</h3>
        <p className="text-sm text-gray-600">
          Visual pathway localization - chiasm, tract, radiation, cortex
        </p>
      </div>

      {/* Visual Field Defect Pattern */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">Visual Field Defect Pattern</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pattern</label>
            <select
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option>Bitemporal hemianopia</option>
              <option>Homonymous hemianopia (right)</option>
              <option>Homonymous hemianopia (left)</option>
              <option>Superior quadrantanopia (homonymous)</option>
              <option>Inferior quadrantanopia (homonymous)</option>
              <option>Altitudinal defect (superior)</option>
              <option>Altitudinal defect (inferior)</option>
              <option>Central scotoma</option>
              <option>Enlarged blind spot</option>
              <option>Arcuate defect</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Affected Eye(s)</label>
            <select
              value={affectedEye}
              onChange={(e) => setAffectedEye(e.target.value)}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option>OD only</option>
              <option>OS only</option>
              <option>OU (both eyes)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Respects Vertical Midline?
            </label>
            <select
              value={respectsVerticalMidline ? 'Yes' : 'No'}
              onChange={(e) => setRespectsVerticalMidline(e.target.value === 'Yes')}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option>Yes (neurological)</option>
              <option>No (retinal)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Field Defect Characteristics */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <h4 className="text-lg font-bold text-blue-900 mb-4">Defect Characteristics</h4>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={characteristics.homonymous}
              onChange={(e) =>
                setCharacteristics((prev) => ({ ...prev, homonymous: e.target.checked }))
              }
              disabled={!canEdit}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-blue-900">
              Homonymous (same side of field in both eyes)
            </span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={characteristics.heteronymous}
              onChange={(e) =>
                setCharacteristics((prev) => ({ ...prev, heteronymous: e.target.checked }))
              }
              disabled={!canEdit}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-blue-900">
              Heteronymous (opposite sides - binasal, bitemporal)
            </span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={characteristics.complete}
              onChange={(e) =>
                setCharacteristics((prev) => ({ ...prev, complete: e.target.checked }))
              }
              disabled={!canEdit}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-blue-900">Complete (entire hemifield lost)</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={characteristics.congruous}
              onChange={(e) =>
                setCharacteristics((prev) => ({ ...prev, congruous: e.target.checked }))
              }
              disabled={!canEdit}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-blue-900">
              Congruous (similar shape in both eyes - posterior lesion)
            </span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={characteristics.maculaSpared}
              onChange={(e) =>
                setCharacteristics((prev) => ({ ...prev, maculaSpared: e.target.checked }))
              }
              disabled={!canEdit}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-blue-900">
              Macula spared (occipital cortex - dual blood supply)
            </span>
          </label>
        </div>
      </div>

      {/* Neurological Localization */}
      <div className={`border-2 rounded-lg p-6 ${assessment.color}`}>
        <div className="flex items-start space-x-3">
          <Brain className="w-6 h-6 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-lg font-bold mb-3">
              Neurological Localization: {assessment.location}
              {assessment.urgency === 'Emergency' && (
                <span className="ml-3 px-3 py-1 bg-red-600 text-white rounded-full text-sm font-bold">
                  EMERGENCY
                </span>
              )}
            </h4>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-semibold mb-1">Anatomical Pathway:</p>
                <p className="text-sm">{assessment.anatomy}</p>
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">Defect Type:</p>
                <p className="text-sm">{assessment.defectType}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-semibold mb-2">Key Features:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {assessment.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <p className="text-sm font-semibold mb-2">Differential Diagnosis:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {assessment.causes.map((cause, index) => (
                  <li key={index}>{cause}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white/50 rounded-lg p-3">
              <p className="text-sm font-semibold">Imaging Protocol:</p>
              <p className="text-sm mt-1">{assessment.imaging}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Pathway Anatomy Guide */}
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <h4 className="text-lg font-bold text-purple-900 mb-4">Visual Pathway Anatomy</h4>
        <div className="space-y-3 text-sm text-purple-800">
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <p className="font-semibold text-purple-900 mb-1">
              1. Optic Nerve (Pre-chiasmal)
            </p>
            <p>Unilateral defects: Central scotoma, altitudinal, arcuate. RAPD present.</p>
          </div>

          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <p className="font-semibold text-purple-900 mb-1">2. Optic Chiasm</p>
            <p>
              Bitemporal hemianopia (crossing nasal fibers). Pituitary adenoma most common (80%).
            </p>
          </div>

          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <p className="font-semibold text-purple-900 mb-1">3. Optic Tract (Post-chiasmal)</p>
            <p>
              Incongruous homonymous hemianopia (contralateral). RAPD in eye with temporal field
              loss.
            </p>
          </div>

          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <p className="font-semibold text-purple-900 mb-1">
              4. Optic Radiation - Temporal Lobe (Meyer's Loop)
            </p>
            <p>
              Superior quadrantanopia ("pie in the sky"). Congruous. Temporal lobe stroke/tumor.
            </p>
          </div>

          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <p className="font-semibold text-purple-900 mb-1">
              5. Optic Radiation - Parietal Lobe
            </p>
            <p>Inferior quadrantanopia. Congruous. Parietal lobe stroke/tumor.</p>
          </div>

          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <p className="font-semibold text-purple-900 mb-1">6. Visual Cortex (Occipital)</p>
            <p>
              Complete congruous homonymous hemianopia. Macula often spared (dual blood supply -
              MCA + PCA). PCA stroke.
            </p>
          </div>
        </div>
      </div>

      {/* Clinical Guidelines */}
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
        <h5 className="font-semibold text-green-900 mb-3">
          Neuro-Ophthalmic Visual Field Guidelines
        </h5>
        <div className="space-y-2 text-sm text-green-800">
          <p>
            <strong>Rule of Thumb:</strong> Defects respect vertical midline = neurological (post-
            retinal). Defects do NOT respect midline = retinal/choroidal.
          </p>
          <p>
            <strong>Bitemporal Hemianopia:</strong> Chiasm compression. Pituitary adenoma 80%
            (headache, endocrine symptoms). MRI pituitary URGENT. May need neurosurgery.
          </p>
          <p>
            <strong>Homonymous Hemianopia:</strong> Post-chiasmal lesion. RIGHT field loss = LEFT
            brain. Stroke most common (MCA, PCA). EMERGENCY if acute. MRI brain with DWI/MRA.
          </p>
          <p>
            <strong>Congruity:</strong> More congruous (similar shape) = more posterior lesion.
            Occipital cortex = highly congruous. Optic tract = incongruous.
          </p>
          <p>
            <strong>Macula Sparing:</strong> Homonymous hemianopia with central vision preserved =
            occipital cortex (dual blood supply from MCA + PCA).
          </p>
          <p>
            <strong>Formal Perimetry:</strong> Goldmann or Humphrey visual field testing required
            for precise mapping. Confrontation fields are screening only.
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
            <span>Save Visual Field Assessment</span>
          </button>
        </div>
      )}
    </div>
  );
}
