'use client';

import React, { useState } from 'react';
import { Eye, TrendingUp, AlertCircle, CheckCircle, Minus } from 'lucide-react';

interface CycloplegicRefractionProps {
  patientId: string;
  ageMonths: number;
  currentRefractionOD?: { sphere: number; cylinder: number; axis: number };
  currentRefractionOS?: { sphere: number; cylinder: number; axis: number };
  canEdit?: boolean;
  onSave?: (data: any) => void;
}

export default function CycloplegicRefraction({
  patientId,
  ageMonths,
  currentRefractionOD,
  currentRefractionOS,
  canEdit = true,
  onSave,
}: CycloplegicRefractionProps) {
  const [cycloplegicAgent, setCycloplegicAgent] = useState('Cyclopentolate 1%');
  const [cycloplegicDate, setCycloplegicDate] = useState('2026-01-27');

  // Pre-cycloplegic refraction (manifest refraction)
  const [preRefractionOD, setPreRefractionOD] = useState({
    sphere: +0.50,
    cylinder: -0.25,
    axis: 85,
    va: '6/12',
  });

  const [preRefractionOS, setPreRefractionOS] = useState({
    sphere: +2.50,
    cylinder: -0.50,
    axis: 92,
    va: '6/60',
  });

  // Post-cycloplegic refraction (true refractive error)
  const [postRefractionOD, setPostRefractionOD] = useState({
    sphere: +1.00,
    cylinder: -0.50,
    axis: 85,
    va: '6/9',
  });

  const [postRefractionOS, setPostRefractionOS] = useState({
    sphere: +4.50,
    cylinder: -1.00,
    axis: 92,
    va: '6/36',
  });

  // Calculate latent hyperopia (difference between cycloplegic and manifest)
  const calculateLatentHyperopia = (eye: 'OD' | 'OS'): number => {
    const pre = eye === 'OD' ? preRefractionOD : preRefractionOS;
    const post = eye === 'OD' ? postRefractionOD : postRefractionOS;
    return post.sphere - pre.sphere;
  };

  const latentHyperopiaOD = calculateLatentHyperopia('OD');
  const latentHyperopiaOS = calculateLatentHyperopia('OS');

  // Assess need for spectacles based on age and refraction
  const assessSpectacleNeed = (): {
    needed: boolean;
    reason: string;
    color: string;
  } => {
    const ageYears = ageMonths / 12;
    const sphereOD = postRefractionOD.sphere;
    const sphereOS = postRefractionOS.sphere;
    const anisometropia = Math.abs(sphereOD - sphereOS);

    // High hyperopia (>3.00D) - always needs correction
    if (sphereOD > 3.0 || sphereOS > 3.0) {
      return {
        needed: true,
        reason: 'High hyperopia (>+3.00D) detected - spectacles REQUIRED to prevent amblyopia',
        color: 'bg-red-50 border-red-300 text-red-900',
      };
    }

    // Significant anisometropia (>1.00D difference) - high amblyopia risk
    if (anisometropia > 1.0) {
      return {
        needed: true,
        reason: `Anisometropia ${anisometropia.toFixed(2)}D - spectacles REQUIRED to prevent amblyopia`,
        color: 'bg-red-50 border-red-300 text-red-900',
      };
    }

    // Moderate hyperopia (>2.00D) with symptoms or reduced vision
    if ((sphereOD > 2.0 || sphereOS > 2.0) && ageYears < 8) {
      return {
        needed: true,
        reason: 'Moderate hyperopia - spectacles recommended for comfort and visual development',
        color: 'bg-orange-50 border-orange-300 text-orange-900',
      };
    }

    // Astigmatism >1.50D
    const cylinderOD = Math.abs(postRefractionOD.cylinder);
    const cylinderOS = Math.abs(postRefractionOS.cylinder);
    if (cylinderOD > 1.5 || cylinderOS > 1.5) {
      return {
        needed: true,
        reason: 'Significant astigmatism - spectacles recommended',
        color: 'bg-orange-50 border-orange-300 text-orange-900',
      };
    }

    return {
      needed: false,
      reason: 'Low refractive error - observation without spectacles acceptable',
      color: 'bg-green-50 border-green-300 text-green-900',
    };
  };

  const spectacleAssessment = assessSpectacleNeed();

  // Recommended cycloplegic agent based on age
  const getRecommendedAgent = (): string => {
    const ageYears = ageMonths / 12;
    if (ageYears < 1) {
      return 'Cyclopentolate 0.5% (safer for infants)';
    } else if (ageYears < 3) {
      return 'Cyclopentolate 1% (standard for toddlers)';
    } else if (ageYears < 8) {
      return 'Cyclopentolate 1% or Tropicamide 1%';
    } else {
      return 'Tropicamide 1% (sufficient for older children)';
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        cycloplegicAgent,
        cycloplegicDate,
        preRefractionOD,
        preRefractionOS,
        postRefractionOD,
        postRefractionOS,
        latentHyperopiaOD,
        latentHyperopiaOS,
        spectacleAssessment,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gray-900">Cycloplegic Refraction</h3>
        <p className="text-sm text-gray-600">
          Gold standard for pediatric refraction - eliminates accommodation to reveal true
          refractive error
        </p>
      </div>

      {/* Cycloplegic Agent Selection */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
        <h4 className="text-lg font-bold text-blue-900 mb-3">Cycloplegic Protocol</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cycloplegic Agent
            </label>
            <select
              value={cycloplegicAgent}
              onChange={(e) => setCycloplegicAgent(e.target.value)}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option>Cyclopentolate 0.5%</option>
              <option>Cyclopentolate 1%</option>
              <option>Tropicamide 1%</option>
              <option>Atropine 1% (3 days protocol)</option>
              <option>Homatropine 2%</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Examination Date
            </label>
            <input
              type="date"
              value={cycloplegicDate}
              onChange={(e) => setCycloplegicDate(e.target.value)}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="mt-3 bg-blue-100 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Recommended:</strong> {getRecommendedAgent()}
          </p>
        </div>
      </div>

      {/* Refraction Comparison - OD */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
          <span>OD (Right Eye) - Refraction Comparison</span>
        </h4>

        <div className="grid grid-cols-2 gap-6">
          {/* Pre-Cycloplegic */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <Minus className="w-5 h-5 text-gray-600" />
              <span>Pre-Cycloplegic (Manifest)</span>
            </h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sphere</span>
                <span className="font-bold text-gray-900">
                  {preRefractionOD.sphere >= 0 ? '+' : ''}
                  {preRefractionOD.sphere.toFixed(2)} D
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cylinder</span>
                <span className="font-bold text-gray-900">
                  {preRefractionOD.cylinder.toFixed(2)} D
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Axis</span>
                <span className="font-bold text-gray-900">{preRefractionOD.axis}°</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Visual Acuity</span>
                <span className="font-bold text-gray-900">{preRefractionOD.va}</span>
              </div>
            </div>
          </div>

          {/* Post-Cycloplegic */}
          <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-300">
            <h5 className="font-semibold text-blue-900 mb-3 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span>Post-Cycloplegic (True Error)</span>
            </h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">Sphere</span>
                <span className="font-bold text-blue-900">
                  {postRefractionOD.sphere >= 0 ? '+' : ''}
                  {postRefractionOD.sphere.toFixed(2)} D
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">Cylinder</span>
                <span className="font-bold text-blue-900">
                  {postRefractionOD.cylinder.toFixed(2)} D
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">Axis</span>
                <span className="font-bold text-blue-900">{postRefractionOD.axis}°</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">Visual Acuity</span>
                <span className="font-bold text-blue-900">{postRefractionOD.va}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Latent Hyperopia - OD */}
        <div
          className={`mt-4 p-3 rounded-lg border ${
            latentHyperopiaOD > 1.5
              ? 'bg-orange-50 border-orange-300'
              : 'bg-green-50 border-green-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">Latent Hyperopia (OD)</span>
            <span
              className={`text-lg font-bold ${
                latentHyperopiaOD > 1.5 ? 'text-orange-900' : 'text-green-900'
              }`}
            >
              +{latentHyperopiaOD.toFixed(2)} D
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {latentHyperopiaOD > 1.5
              ? 'Significant accommodation - cycloplegia essential for accurate prescription'
              : 'Minimal accommodation - manifest refraction reasonably accurate'}
          </p>
        </div>
      </div>

      {/* Refraction Comparison - OS */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-600 rounded-full"></div>
          <span>OS (Left Eye) - Refraction Comparison</span>
        </h4>

        <div className="grid grid-cols-2 gap-6">
          {/* Pre-Cycloplegic */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <Minus className="w-5 h-5 text-gray-600" />
              <span>Pre-Cycloplegic (Manifest)</span>
            </h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sphere</span>
                <span className="font-bold text-gray-900">
                  {preRefractionOS.sphere >= 0 ? '+' : ''}
                  {preRefractionOS.sphere.toFixed(2)} D
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cylinder</span>
                <span className="font-bold text-gray-900">
                  {preRefractionOS.cylinder.toFixed(2)} D
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Axis</span>
                <span className="font-bold text-gray-900">{preRefractionOS.axis}°</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Visual Acuity</span>
                <span className="font-bold text-gray-900">{preRefractionOS.va}</span>
              </div>
            </div>
          </div>

          {/* Post-Cycloplegic */}
          <div className="bg-green-50 rounded-lg p-4 border-2 border-green-300">
            <h5 className="font-semibold text-green-900 mb-3 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Post-Cycloplegic (True Error)</span>
            </h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">Sphere</span>
                <span className="font-bold text-green-900">
                  {postRefractionOS.sphere >= 0 ? '+' : ''}
                  {postRefractionOS.sphere.toFixed(2)} D
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">Cylinder</span>
                <span className="font-bold text-green-900">
                  {postRefractionOS.cylinder.toFixed(2)} D
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">Axis</span>
                <span className="font-bold text-green-900">{postRefractionOS.axis}°</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">Visual Acuity</span>
                <span className="font-bold text-green-900">{postRefractionOS.va}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Latent Hyperopia - OS */}
        <div
          className={`mt-4 p-3 rounded-lg border ${
            latentHyperopiaOS > 1.5
              ? 'bg-orange-50 border-orange-300'
              : 'bg-green-50 border-green-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">Latent Hyperopia (OS)</span>
            <span
              className={`text-lg font-bold ${
                latentHyperopiaOS > 1.5 ? 'text-orange-900' : 'text-green-900'
              }`}
            >
              +{latentHyperopiaOS.toFixed(2)} D
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {latentHyperopiaOS > 1.5
              ? 'Significant accommodation - cycloplegia essential for accurate prescription'
              : 'Minimal accommodation - manifest refraction reasonably accurate'}
          </p>
        </div>
      </div>

      {/* Spectacle Prescription Recommendation */}
      <div className={`border-2 rounded-lg p-6 ${spectacleAssessment.color}`}>
        <div className="flex items-start space-x-3">
          {spectacleAssessment.needed ? (
            <AlertCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <h4 className="text-lg font-bold mb-2">
              {spectacleAssessment.needed ? 'Spectacles REQUIRED' : 'Spectacles Optional'}
            </h4>
            <p className="text-sm">{spectacleAssessment.reason}</p>
          </div>
        </div>
      </div>

      {/* Clinical Guidelines */}
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
        <h5 className="font-semibold text-purple-900 mb-3">Pediatric Cycloplegic Guidelines</h5>
        <div className="space-y-2 text-sm text-purple-800">
          <p>
            <strong>Cyclopentolate 1%:</strong> Most common. 30-45 min onset, 6-24h duration.
            Instill 2 drops 5 min apart.
          </p>
          <p>
            <strong>Atropine 1%:</strong> Gold standard for high hyperopia or accommodative
            esotropia. 3-day protocol (1 drop BID for 3 days before exam).
          </p>
          <p>
            <strong>Spectacle Prescription:</strong> Undercorrect hyperopia by 0.50-1.00D in young
            children. Full correction for anisometropia, astigmatism, or amblyopia.
          </p>
          <p>
            <strong>Recheck:</strong> Annual cycloplegic refraction until age 8-10 years (refractive
            error stabilization).
          </p>
        </div>
      </div>

      {/* Save Button */}
      {canEdit && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-colors flex items-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Save Cycloplegic Refraction</span>
          </button>
        </div>
      )}
    </div>
  );
}
