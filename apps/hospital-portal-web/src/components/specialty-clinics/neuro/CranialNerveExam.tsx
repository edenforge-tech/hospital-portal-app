'use client';

import React, { useState } from 'react';
import { Brain, Eye, CheckCircle, AlertTriangle } from 'lucide-react';

interface CranialNerveExamProps {
  patientId: string;
  diagnosis: string;
  canEdit?: boolean;
  onSave?: (data: any) => void;
}

export default function CranialNerveExam({
  patientId,
  diagnosis,
  canEdit = true,
  onSave,
}: CranialNerveExamProps) {
  const [affectedNerve, setAffectedNerve] = useState('CN VI (Abducens)');
  const [affectedEye, setAffectedEye] = useState('OS');
  const [onset, setOnset] = useState('Acute (days)');

  // Extraocular movements (9 positions of gaze)
  const [ductions, setDuctions] = useState({
    OD: {
      primary: 'Normal',
      upgaze: 'Normal',
      downgaze: 'Normal',
      abduction: 'Normal',
      adduction: 'Normal',
      upRight: 'Normal',
      upLeft: 'Normal',
      downRight: 'Normal',
      downLeft: 'Normal',
    },
    OS: {
      primary: 'Normal',
      upgaze: 'Normal',
      downgaze: 'Normal',
      abduction: 'Limited (-3)',
      adduction: 'Normal',
      upRight: 'Normal',
      upLeft: 'Limited (-2)',
      downRight: 'Normal',
      downLeft: 'Limited (-2)',
    },
  });

  // Ptosis assessment
  const [ptosis, setPtosis] = useState({
    present: true,
    eye: 'OD',
    mrd1: 2.0, // Normal: 4-5mm
    mrd2: 5.0,
    levatorFunction: 8, // Normal: 12-15mm
  });

  // Pupil involvement
  const [pupilInvolvement, setPupilInvolvement] = useState({
    OD: 'Dilated (6mm), non-reactive',
    OS: 'Normal (3mm), reactive',
  });

  // Diplopia
  const [diplopia, setDiplopia] = useState({
    present: true,
    type: 'Horizontal',
    direction: 'Looking right (towards affected lateral rectus)',
    separation: 'Increases in direction of action of paralyzed muscle',
  });

  // Assess cranial nerve palsy
  const assessCranialNerve = (): {
    nerve: string;
    muscles: string[];
    findings: string[];
    etiology: string[];
    imaging: string;
    color: string;
  } => {
    if (affectedNerve.includes('III')) {
      const pupilSparing = !pupilInvolvement.OD.includes('Dilated');
      return {
        nerve: 'CN III Palsy (Oculomotor)',
        muscles: [
          'Medial rectus (adduction)',
          'Superior rectus (upgaze)',
          'Inferior rectus (downgaze)',
          'Inferior oblique (upgaze, extorsion)',
          'Levator palpebrae (eyelid elevation)',
          'Pupil constrictor (parasympathetic)',
        ],
        findings: [
          'Ptosis (levator palsy)',
          'Eye "down and out" (lateral rectus and superior oblique unopposed)',
          'Limited adduction, upgaze, downgaze',
          pupilSparing
            ? 'Pupil-sparing (microvascular - diabetes, HTN)'
            : 'Pupil-involved (compressive - aneurysm, URGENT)',
        ],
        etiology: pupilSparing
          ? [
              'Microvascular ischemia (diabetes, HTN) - pupil-sparing',
              'Usually resolves in 3-6 months',
              'MRI brain to rule out structural lesion',
            ]
          : [
              'Posterior communicating artery aneurysm - EMERGENCY',
              'Uncal herniation (increased ICP)',
              'Cavernous sinus lesion',
              'URGENT MRI/MRA brain',
            ],
        imaging: pupilSparing
          ? 'MRI brain (rule out compressive lesion)'
          : 'URGENT MRI/MRA brain (rule out aneurysm)',
        color: pupilSparing
          ? 'bg-yellow-50 border-yellow-300 text-yellow-900'
          : 'bg-red-50 border-red-300 text-red-900',
      };
    } else if (affectedNerve.includes('IV')) {
      return {
        nerve: 'CN IV Palsy (Trochlear)',
        muscles: ['Superior oblique (depression in adduction, intorsion)'],
        findings: [
          'Vertical diplopia (worse looking down and in)',
          'Head tilt away from affected side (compensatory)',
          'Hypertropia of affected eye (Parks-Bielschowsky 3-step test)',
          'Excyclotorsion on fundus exam',
        ],
        etiology: [
          'Trauma (most common - superior orbital fissure)',
          'Congenital (decompensation in adulthood)',
          'Microvascular (diabetes, HTN)',
          'Rarely: Brainstem lesion (midbrain)',
        ],
        imaging: 'MRI brain if non-traumatic, bilateral, or other neuro signs',
        color: 'bg-blue-50 border-blue-300 text-blue-900',
      };
    } else if (affectedNerve.includes('VI')) {
      return {
        nerve: 'CN VI Palsy (Abducens)',
        muscles: ['Lateral rectus (abduction)'],
        findings: [
          'Limited abduction (eye cannot look outward)',
          'Esotropia (eye turns inward)',
          'Horizontal diplopia (worse looking towards affected side)',
          'No ptosis, pupil normal',
        ],
        etiology: [
          'Microvascular ischemia (diabetes, HTN) - most common in adults',
          'Increased intracranial pressure (false localizing sign)',
          'Brainstem lesion (pons) - associated with other neuro signs',
          'Trauma, cavernous sinus lesion',
        ],
        imaging: 'MRI brain (brainstem, cavernous sinus), rule out mass/ICP',
        color: 'bg-orange-50 border-orange-300 text-orange-900',
      };
    } else {
      return {
        nerve: 'Multiple Cranial Nerves',
        muscles: ['Multiple muscle involvement'],
        findings: ['Requires detailed assessment'],
        etiology: [
          'Cavernous sinus syndrome (CN III, IV, V1, VI)',
          'Superior orbital fissure syndrome',
          'Orbital apex syndrome',
          'Myasthenia gravis (fatigable)',
        ],
        imaging: 'MRI orbits, brain with contrast',
        color: 'bg-purple-50 border-purple-300 text-purple-900',
      };
    }
  };

  const assessment = assessCranialNerve();

  const handleSave = () => {
    if (onSave) {
      onSave({
        affectedNerve,
        affectedEye,
        onset,
        ductions,
        ptosis,
        pupilInvolvement,
        diplopia,
        assessment,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gray-900">Cranial Nerve Examination</h3>
        <p className="text-sm text-gray-600">
          CN III, IV, VI assessment - extraocular movements, diplopia, ptosis
        </p>
      </div>

      {/* Classification */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">Cranial Nerve Palsy Classification</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Affected Nerve</label>
            <select
              value={affectedNerve}
              onChange={(e) => setAffectedNerve(e.target.value)}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option>CN III (Oculomotor)</option>
              <option>CN IV (Trochlear)</option>
              <option>CN VI (Abducens)</option>
              <option>Multiple nerves</option>
              <option>Myasthenia Gravis (pseudo-palsy)</option>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Onset</label>
            <select
              value={onset}
              onChange={(e) => setOnset(e.target.value)}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option>Acute (days)</option>
              <option>Subacute (weeks)</option>
              <option>Chronic (months to years)</option>
              <option>Congenital (decompensated)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Extraocular Movements (9 Positions of Gaze) */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <h4 className="text-lg font-bold text-blue-900 mb-4">
          Extraocular Movements (9 Positions of Gaze)
        </h4>
        <div className="grid grid-cols-2 gap-6">
          {/* OD */}
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h5 className="font-semibold text-blue-900 mb-3">OD (Right Eye)</h5>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Up-Left</p>
                <select
                  value={ductions.OD.upLeft}
                  onChange={(e) =>
                    setDuctions((prev) => ({
                      ...prev,
                      OD: { ...prev.OD, upLeft: e.target.value },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-2 py-1 border border-blue-300 rounded text-xs"
                >
                  <option>Normal</option>
                  <option>Limited (-1)</option>
                  <option>Limited (-2)</option>
                  <option>Limited (-3)</option>
                  <option>Limited (-4)</option>
                </select>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Up</p>
                <select
                  value={ductions.OD.upgaze}
                  onChange={(e) =>
                    setDuctions((prev) => ({
                      ...prev,
                      OD: { ...prev.OD, upgaze: e.target.value },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-2 py-1 border border-blue-300 rounded text-xs"
                >
                  <option>Normal</option>
                  <option>Limited (-1)</option>
                  <option>Limited (-2)</option>
                  <option>Limited (-3)</option>
                  <option>Limited (-4)</option>
                </select>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Up-Right</p>
                <select
                  value={ductions.OD.upRight}
                  onChange={(e) =>
                    setDuctions((prev) => ({
                      ...prev,
                      OD: { ...prev.OD, upRight: e.target.value },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-2 py-1 border border-blue-300 rounded text-xs"
                >
                  <option>Normal</option>
                  <option>Limited (-1)</option>
                  <option>Limited (-2)</option>
                  <option>Limited (-3)</option>
                  <option>Limited (-4)</option>
                </select>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Left (Adduction)</p>
                <select
                  value={ductions.OD.adduction}
                  onChange={(e) =>
                    setDuctions((prev) => ({
                      ...prev,
                      OD: { ...prev.OD, adduction: e.target.value },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-2 py-1 border border-blue-300 rounded text-xs"
                >
                  <option>Normal</option>
                  <option>Limited (-1)</option>
                  <option>Limited (-2)</option>
                  <option>Limited (-3)</option>
                  <option>Limited (-4)</option>
                </select>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Primary</p>
                <select
                  value={ductions.OD.primary}
                  onChange={(e) =>
                    setDuctions((prev) => ({
                      ...prev,
                      OD: { ...prev.OD, primary: e.target.value },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-2 py-1 border border-blue-300 rounded text-xs"
                >
                  <option>Normal</option>
                  <option>Esotropia</option>
                  <option>Exotropia</option>
                  <option>Hypertropia</option>
                </select>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Right (Abduction)</p>
                <select
                  value={ductions.OD.abduction}
                  onChange={(e) =>
                    setDuctions((prev) => ({
                      ...prev,
                      OD: { ...prev.OD, abduction: e.target.value },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-2 py-1 border border-blue-300 rounded text-xs"
                >
                  <option>Normal</option>
                  <option>Limited (-1)</option>
                  <option>Limited (-2)</option>
                  <option>Limited (-3)</option>
                  <option>Limited (-4)</option>
                </select>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Down-Left</p>
                <select
                  value={ductions.OD.downLeft}
                  onChange={(e) =>
                    setDuctions((prev) => ({
                      ...prev,
                      OD: { ...prev.OD, downLeft: e.target.value },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-2 py-1 border border-blue-300 rounded text-xs"
                >
                  <option>Normal</option>
                  <option>Limited (-1)</option>
                  <option>Limited (-2)</option>
                  <option>Limited (-3)</option>
                  <option>Limited (-4)</option>
                </select>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Down</p>
                <select
                  value={ductions.OD.downgaze}
                  onChange={(e) =>
                    setDuctions((prev) => ({
                      ...prev,
                      OD: { ...prev.OD, downgaze: e.target.value },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-2 py-1 border border-blue-300 rounded text-xs"
                >
                  <option>Normal</option>
                  <option>Limited (-1)</option>
                  <option>Limited (-2)</option>
                  <option>Limited (-3)</option>
                  <option>Limited (-4)</option>
                </select>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Down-Right</p>
                <select
                  value={ductions.OD.downRight}
                  onChange={(e) =>
                    setDuctions((prev) => ({
                      ...prev,
                      OD: { ...prev.OD, downRight: e.target.value },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-2 py-1 border border-blue-300 rounded text-xs"
                >
                  <option>Normal</option>
                  <option>Limited (-1)</option>
                  <option>Limited (-2)</option>
                  <option>Limited (-3)</option>
                  <option>Limited (-4)</option>
                </select>
              </div>
            </div>
          </div>

          {/* OS - Same structure */}
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h5 className="font-semibold text-blue-900 mb-3">OS (Left Eye)</h5>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Up-Left</p>
                <select
                  value={ductions.OS.upLeft}
                  onChange={(e) =>
                    setDuctions((prev) => ({
                      ...prev,
                      OS: { ...prev.OS, upLeft: e.target.value },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-2 py-1 border border-blue-300 rounded text-xs"
                >
                  <option>Normal</option>
                  <option>Limited (-1)</option>
                  <option>Limited (-2)</option>
                  <option>Limited (-3)</option>
                  <option>Limited (-4)</option>
                </select>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Up</p>
                <select
                  value={ductions.OS.upgaze}
                  onChange={(e) =>
                    setDuctions((prev) => ({
                      ...prev,
                      OS: { ...prev.OS, upgaze: e.target.value },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-2 py-1 border border-blue-300 rounded text-xs"
                >
                  <option>Normal</option>
                  <option>Limited (-1)</option>
                  <option>Limited (-2)</option>
                  <option>Limited (-3)</option>
                  <option>Limited (-4)</option>
                </select>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Up-Right</p>
                <select
                  value={ductions.OS.upRight}
                  onChange={(e) =>
                    setDuctions((prev) => ({
                      ...prev,
                      OS: { ...prev.OS, upRight: e.target.value },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-2 py-1 border border-blue-300 rounded text-xs"
                >
                  <option>Normal</option>
                  <option>Limited (-1)</option>
                  <option>Limited (-2)</option>
                  <option>Limited (-3)</option>
                  <option>Limited (-4)</option>
                </select>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Left (Abduction)</p>
                <select
                  value={ductions.OS.abduction}
                  onChange={(e) =>
                    setDuctions((prev) => ({
                      ...prev,
                      OS: { ...prev.OS, abduction: e.target.value },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-2 py-1 border border-blue-300 rounded text-xs"
                >
                  <option>Normal</option>
                  <option>Limited (-1)</option>
                  <option>Limited (-2)</option>
                  <option>Limited (-3)</option>
                  <option>Limited (-4)</option>
                </select>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Primary</p>
                <select
                  value={ductions.OS.primary}
                  onChange={(e) =>
                    setDuctions((prev) => ({
                      ...prev,
                      OS: { ...prev.OS, primary: e.target.value },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-2 py-1 border border-blue-300 rounded text-xs"
                >
                  <option>Normal</option>
                  <option>Esotropia</option>
                  <option>Exotropia</option>
                  <option>Hypertropia</option>
                </select>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Right (Adduction)</p>
                <select
                  value={ductions.OS.adduction}
                  onChange={(e) =>
                    setDuctions((prev) => ({
                      ...prev,
                      OS: { ...prev.OS, adduction: e.target.value },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-2 py-1 border border-blue-300 rounded text-xs"
                >
                  <option>Normal</option>
                  <option>Limited (-1)</option>
                  <option>Limited (-2)</option>
                  <option>Limited (-3)</option>
                  <option>Limited (-4)</option>
                </select>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Down-Left</p>
                <select
                  value={ductions.OS.downLeft}
                  onChange={(e) =>
                    setDuctions((prev) => ({
                      ...prev,
                      OS: { ...prev.OS, downLeft: e.target.value },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-2 py-1 border border-blue-300 rounded text-xs"
                >
                  <option>Normal</option>
                  <option>Limited (-1)</option>
                  <option>Limited (-2)</option>
                  <option>Limited (-3)</option>
                  <option>Limited (-4)</option>
                </select>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Down</p>
                <select
                  value={ductions.OS.downgaze}
                  onChange={(e) =>
                    setDuctions((prev) => ({
                      ...prev,
                      OS: { ...prev.OS, downgaze: e.target.value },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-2 py-1 border border-blue-300 rounded text-xs"
                >
                  <option>Normal</option>
                  <option>Limited (-1)</option>
                  <option>Limited (-2)</option>
                  <option>Limited (-3)</option>
                  <option>Limited (-4)</option>
                </select>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Down-Right</p>
                <select
                  value={ductions.OS.downRight}
                  onChange={(e) =>
                    setDuctions((prev) => ({
                      ...prev,
                      OS: { ...prev.OS, downRight: e.target.value },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-2 py-1 border border-blue-300 rounded text-xs"
                >
                  <option>Normal</option>
                  <option>Limited (-1)</option>
                  <option>Limited (-2)</option>
                  <option>Limited (-3)</option>
                  <option>Limited (-4)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Diplopia Assessment */}
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <h4 className="text-lg font-bold text-purple-900 mb-4">Diplopia (Double Vision)</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">Type</label>
            <select
              value={diplopia.type}
              onChange={(e) => setDiplopia((prev) => ({ ...prev, type: e.target.value }))}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-purple-300 rounded-lg"
            >
              <option>Horizontal</option>
              <option>Vertical</option>
              <option>Oblique</option>
              <option>None</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">
              Direction of Maximum Separation
            </label>
            <input
              type="text"
              value={diplopia.direction}
              onChange={(e) => setDiplopia((prev) => ({ ...prev, direction: e.target.value }))}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-purple-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Cranial Nerve Assessment */}
      <div className={`border-2 rounded-lg p-6 ${assessment.color}`}>
        <div className="flex items-start space-x-3">
          <Brain className="w-6 h-6 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-lg font-bold mb-3">{assessment.nerve}</h4>

            <div className="mb-4">
              <p className="text-sm font-semibold mb-2">Affected Muscles:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {assessment.muscles.map((muscle, index) => (
                  <li key={index}>{muscle}</li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <p className="text-sm font-semibold mb-2">Clinical Findings:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {assessment.findings.map((finding, index) => (
                  <li key={index}>{finding}</li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <p className="text-sm font-semibold mb-2">Differential Diagnosis & Management:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {assessment.etiology.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white/50 rounded-lg p-3">
              <p className="text-sm font-semibold">Imaging Required:</p>
              <p className="text-sm mt-1">{assessment.imaging}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Guidelines */}
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
        <h5 className="font-semibold text-green-900 mb-3">Cranial Nerve Palsy Guidelines</h5>
        <div className="space-y-2 text-sm text-green-800">
          <p>
            <strong>CN III Palsy:</strong> Pupil-involved (dilated, non-reactive) = compressive
            lesion (aneurysm) - EMERGENCY MRI/MRA. Pupil-sparing = microvascular (diabetes, HTN) -
            resolves in 3-6 months.
          </p>
          <p>
            <strong>CN VI Palsy:</strong> Most common. Limited abduction, horizontal diplopia
            (worse looking towards affected side). Microvascular in adults, ICP in children. MRI
            brain.
          </p>
          <p>
            <strong>CN IV Palsy:</strong> Vertical diplopia worse looking down and in (reading,
            stairs). Head tilt away from affected side. Parks-Bielschowsky 3-step test confirms.
            Trauma most common.
          </p>
          <p>
            <strong>Imaging Protocol:</strong> MRI brain with contrast. Include orbits, cavernous
            sinus. MRA if CN III with pupil involvement (rule out aneurysm). Repeat imaging if no
            improvement in 3 months.
          </p>
          <p>
            <strong>Workup:</strong> HbA1c (diabetes), BP monitoring (HTN), ESR/CRP if age {'>'}50
            (GCA). If multiple nerves involved → cavernous sinus syndrome (tumor, thrombosis,
            inflammation).
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
            <span>Save Cranial Nerve Exam</span>
          </button>
        </div>
      )}
    </div>
  );
}
