'use client';

import React, { useState } from 'react';
import { Target, Eye, CheckCircle, AlertCircle } from 'lucide-react';

interface StrabismusAssessmentProps {
  patientId: string;
  ageMonths: number;
  hasStrabismus: boolean;
  strabismusType: string | null;
  canEdit?: boolean;
  onSave?: (data: any) => void;
}

export default function StrabismusAssessment({
  patientId,
  ageMonths,
  hasStrabismus,
  strabismusType,
  canEdit = true,
  onSave,
}: StrabismusAssessmentProps) {
  const [alignment, setAlignment] = useState('Esotropia');
  const [frequency, setFrequency] = useState('Intermittent');
  const [magnitude, setMagnitude] = useState(20); // prism diopters

  // Cover Test Results
  const [coverTest, setCoverTest] = useState({
    distance: {
      type: 'Esotropia',
      amount: 25,
      eye: 'OS',
    },
    near: {
      type: 'Esotropia',
      amount: 30,
      eye: 'OS',
    },
  });

  // Hirschberg Test
  const [hirschberg, setHirschberg] = useState({
    od: 'Central',
    os: 'Temporal (nasal displacement)',
    estimate: '20-25 PD esotropia',
  });

  // Krimsky Test (prism measurement)
  const [krimsky, setKrimsky] = useState({
    distance: 25,
    near: 30,
  });

  // Stereopsis (depth perception)
  const [stereopsis, setStereopsis] = useState({
    test: 'Titmus Fly Test',
    result: 'Nil',
    score: 0, // seconds of arc (40-3000)
  });

  // AC/A Ratio (Accommodative Convergence / Accommodation)
  const [acaRatio, setAcaRatio] = useState({
    calculated: 5.0, // High AC/A ratio
    normal: '3-5:1',
  });

  // Assess surgery candidacy
  const assessSurgeryCandidacy = (): {
    candidate: boolean;
    reason: string;
    color: string;
  } => {
    const ageYears = ageMonths / 12;

    // Large constant deviation - surgery candidate
    if (coverTest.distance.amount > 30 && frequency === 'Constant') {
      return {
        candidate: true,
        reason: 'Large constant deviation (>30 PD) - strong surgical candidate',
        color: 'bg-orange-50 border-orange-300 text-orange-900',
      };
    }

    // Accommodative esotropia - glasses first
    if (alignment === 'Accommodative Esotropia' && coverTest.distance.amount < 10) {
      return {
        candidate: false,
        reason:
          'Accommodative esotropia well-controlled with spectacles - continue observation',
        color: 'bg-green-50 border-green-300 text-green-900',
      };
    }

    // Intermittent exotropia - observation vs surgery
    if (alignment.includes('Exotropia') && frequency === 'Intermittent') {
      if (coverTest.distance.amount > 20) {
        return {
          candidate: true,
          reason:
            'Intermittent exotropia >20 PD with decreasing control - consider surgery',
          color: 'bg-yellow-50 border-yellow-300 text-yellow-900',
        };
      } else {
        return {
          candidate: false,
          reason: 'Small intermittent exotropia - observation, exercises',
          color: 'bg-blue-50 border-blue-300 text-blue-900',
        };
      }
    }

    // Constant strabismus
    if (frequency === 'Constant' && coverTest.distance.amount > 15) {
      return {
        candidate: true,
        reason: `Constant ${alignment} - surgery to improve alignment and prevent/treat amblyopia`,
        color: 'bg-orange-50 border-orange-300 text-orange-900',
      };
    }

    return {
      candidate: false,
      reason: 'Continue observation and non-surgical management',
      color: 'bg-green-50 border-green-300 text-green-900',
    };
  };

  const surgeryAssessment = assessSurgeryCandidacy();

  const handleSave = () => {
    if (onSave) {
      onSave({
        alignment,
        frequency,
        magnitude,
        coverTest,
        hirschberg,
        krimsky,
        stereopsis,
        acaRatio,
        surgeryAssessment,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gray-900">Strabismus Assessment</h3>
        <p className="text-sm text-gray-600">
          Comprehensive eye alignment evaluation - cover test, prism measurement, stereopsis
        </p>
      </div>

      {/* Strabismus Classification */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">Strabismus Classification</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={alignment}
              onChange={(e) => setAlignment(e.target.value)}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option>Esotropia (convergent - inward turn)</option>
              <option>Exotropia (divergent - outward turn)</option>
              <option>Hypertropia (vertical - upward)</option>
              <option>Hypotropia (vertical - downward)</option>
              <option>Accommodative Esotropia</option>
              <option>Duane Syndrome</option>
              <option>Brown Syndrome</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option>Constant (always present)</option>
              <option>Intermittent (comes and goes)</option>
              <option>Phoria (latent - only with cover test)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Magnitude (Prism Diopters)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={magnitude}
              onChange={(e) => setMagnitude(parseInt(e.target.value) || 0)}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <p className="text-xs text-gray-600 mt-1">Small: &lt;15, Moderate: 15-30, Large: &gt;30</p>
          </div>
        </div>
      </div>

      {/* Cover Test Results */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center space-x-2">
          <Target className="w-5 h-5" />
          <span>Cover Test Results (Gold Standard)</span>
        </h4>

        <div className="grid grid-cols-2 gap-6">
          {/* Distance Fixation (6 meters) */}
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h5 className="font-semibold text-blue-900 mb-3">Distance Fixation (6m)</h5>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-blue-700 mb-1">Deviation Type</label>
                <select
                  value={coverTest.distance.type}
                  onChange={(e) =>
                    setCoverTest((prev) => ({
                      ...prev,
                      distance: { ...prev.distance, type: e.target.value },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm"
                >
                  <option>Orthophoria (aligned)</option>
                  <option>Esotropia</option>
                  <option>Exotropia</option>
                  <option>Hypertropia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-blue-700 mb-1">Amount (PD)</label>
                <input
                  type="number"
                  value={coverTest.distance.amount}
                  onChange={(e) =>
                    setCoverTest((prev) => ({
                      ...prev,
                      distance: { ...prev.distance, amount: parseInt(e.target.value) || 0 },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-blue-700 mb-1">Deviating Eye</label>
                <select
                  value={coverTest.distance.eye}
                  onChange={(e) =>
                    setCoverTest((prev) => ({
                      ...prev,
                      distance: { ...prev.distance, eye: e.target.value },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm"
                >
                  <option>OD</option>
                  <option>OS</option>
                  <option>Alternating</option>
                </select>
              </div>
            </div>
          </div>

          {/* Near Fixation (33 cm) */}
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h5 className="font-semibold text-blue-900 mb-3">Near Fixation (33cm)</h5>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-blue-700 mb-1">Deviation Type</label>
                <select
                  value={coverTest.near.type}
                  onChange={(e) =>
                    setCoverTest((prev) => ({
                      ...prev,
                      near: { ...prev.near, type: e.target.value },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm"
                >
                  <option>Orthophoria (aligned)</option>
                  <option>Esotropia</option>
                  <option>Exotropia</option>
                  <option>Hypertropia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-blue-700 mb-1">Amount (PD)</label>
                <input
                  type="number"
                  value={coverTest.near.amount}
                  onChange={(e) =>
                    setCoverTest((prev) => ({
                      ...prev,
                      near: { ...prev.near, amount: parseInt(e.target.value) || 0 },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-blue-700 mb-1">Deviating Eye</label>
                <select
                  value={coverTest.near.eye}
                  onChange={(e) =>
                    setCoverTest((prev) => ({
                      ...prev,
                      near: { ...prev.near, eye: e.target.value },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm"
                >
                  <option>OD</option>
                  <option>OS</option>
                  <option>Alternating</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Distance-Near Comparison */}
        <div className="mt-4 bg-blue-100 rounded-lg p-3">
          <p className="text-sm text-blue-900">
            <strong>Distance vs Near:</strong>{' '}
            {coverTest.distance.amount === coverTest.near.amount
              ? 'Comitant (same deviation at all distances)'
              : coverTest.near.amount > coverTest.distance.amount
              ? `Convergence excess type (${coverTest.near.amount - coverTest.distance.amount} PD more at near)`
              : `Divergence excess type (${coverTest.distance.amount - coverTest.near.amount} PD more at distance)`}
          </p>
        </div>
      </div>

      {/* Hirschberg Test */}
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <h4 className="text-lg font-bold text-purple-900 mb-4">
          Hirschberg Test (Corneal Light Reflex)
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-purple-700 mb-2">OD Reflex Position</p>
            <p className="font-bold text-purple-900">{hirschberg.od}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-purple-700 mb-2">OS Reflex Position</p>
            <p className="font-bold text-purple-900">{hirschberg.os}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-purple-700 mb-2">Estimated Deviation</p>
            <p className="font-bold text-purple-900">{hirschberg.estimate}</p>
          </div>
        </div>
        <div className="mt-3 bg-purple-100 rounded-lg p-3 text-sm text-purple-800">
          <strong>Hirschberg Scale:</strong> Pupil edge = 15 PD, Iris edge = 30 PD, Limbus = 45
          PD, Beyond limbus = &gt;60 PD
        </div>
      </div>

      {/* Stereopsis (3D Vision) */}
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <h4 className="text-lg font-bold text-green-900 mb-4 flex items-center space-x-2">
          <Eye className="w-5 h-5" />
          <span>Stereopsis (Depth Perception)</span>
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">Test Used</label>
            <select
              value={stereopsis.test}
              onChange={(e) =>
                setStereopsis((prev) => ({ ...prev, test: e.target.value }))
              }
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-green-300 rounded-lg"
            >
              <option>Titmus Fly Test</option>
              <option>Random Dot E Test</option>
              <option>Lang Stereo Test</option>
              <option>TNO Test</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">
              Result (seconds of arc)
            </label>
            <input
              type="number"
              min="0"
              max="3000"
              value={stereopsis.score}
              onChange={(e) =>
                setStereopsis((prev) => ({ ...prev, score: parseInt(e.target.value) || 0 }))
              }
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-green-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">Interpretation</label>
            <select
              value={stereopsis.result}
              onChange={(e) =>
                setStereopsis((prev) => ({ ...prev, result: e.target.value }))
              }
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-green-300 rounded-lg"
            >
              <option>Excellent (40-60")</option>
              <option>Good (60-100")</option>
              <option>Fair (100-400")</option>
              <option>Poor (400-3000")</option>
              <option>Nil (no stereopsis)</option>
            </select>
          </div>
        </div>
        <div className="mt-3 bg-green-100 rounded-lg p-3 text-sm text-green-800">
          <strong>Clinical Significance:</strong> Normal stereopsis = 40-60 seconds of arc. Nil
          stereopsis in constant strabismus. Reduced stereopsis = amblyopia or intermittent
          alignment.
        </div>
      </div>

      {/* Surgery Candidacy Assessment */}
      <div className={`border-2 rounded-lg p-6 ${surgeryAssessment.color}`}>
        <div className="flex items-start space-x-3">
          {surgeryAssessment.candidate ? (
            <AlertCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <h4 className="text-lg font-bold mb-2">
              {surgeryAssessment.candidate
                ? 'Surgical Candidate'
                : 'Non-Surgical Management'}
            </h4>
            <p className="text-sm">{surgeryAssessment.reason}</p>
          </div>
        </div>
      </div>

      {/* Clinical Guidelines */}
      <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
        <h5 className="font-semibold text-orange-900 mb-3">Strabismus Management Guidelines</h5>
        <div className="space-y-2 text-sm text-orange-800">
          <p>
            <strong>Cover Test:</strong> Gold standard. Unilateral (cover-uncover) detects tropias,
            Alternating (cross-cover) measures total deviation including phorias.
          </p>
          <p>
            <strong>Esotropia:</strong> Accommodative type (high hyperopia, high AC/A) - treat with
            spectacles first. Infantile esotropia (&lt;6 months) - surgery by age 2 years.
          </p>
          <p>
            <strong>Exotropia:</strong> Intermittent - observe if small (&lt;20 PD), surgery if
            large/progressive/decreasing control. Constant - surgery indicated.
          </p>
          <p>
            <strong>Surgical Timing:</strong> Congenital esotropia - 6-24 months. Acquired
            esotropia - after spectacle trial. Intermittent exotropia - when control deteriorates.
          </p>
          <p>
            <strong>Amblyopia Risk:</strong> HIGH in constant strabismus with fixation preference.
            Treat amblyopia BEFORE surgery. Patching good eye forces amblyopic eye to work.
          </p>
          <p>
            <strong>Prism Measurement:</strong> 1 PD = 1 cm deviation at 1 meter. Prism bars or
            Krimsky test. Measure at distance AND near (AC/A ratio assessment).
          </p>
        </div>
      </div>

      {/* Save Button */}
      {canEdit && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Save Strabismus Assessment</span>
          </button>
        </div>
      )}
    </div>
  );
}
