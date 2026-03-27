'use client';

import React, { useState } from 'react';
import { Baby, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

interface DevelopmentalMilestonesProps {
  patientId: string;
  ageMonths: number;
  canEdit?: boolean;
  onSave?: (data: any) => void;
}

export default function DevelopmentalMilestones({
  patientId,
  ageMonths,
  canEdit = true,
  onSave,
}: DevelopmentalMilestonesProps) {
  const ageYears = ageMonths / 12;

  // Age-appropriate milestones based on patient's age
  const getMilestonesByAge = () => {
    if (ageMonths < 3) {
      return {
        category: 'Newborn (0-3 months)',
        milestones: [
          { id: 1, milestone: 'Fixates on faces', achieved: true, expected: '0-2 months' },
          {
            id: 2,
            milestone: 'Follows moving object to 180°',
            achieved: true,
            expected: '2-3 months',
          },
          {
            id: 3,
            milestone: 'Pupillary light response',
            achieved: true,
            expected: 'Birth',
          },
          {
            id: 4,
            milestone: 'Blink reflex to bright light',
            achieved: true,
            expected: 'Birth',
          },
          { id: 5, milestone: 'Regards hands', achieved: false, expected: '3 months' },
        ],
      };
    } else if (ageMonths < 6) {
      return {
        category: 'Early Infant (3-6 months)',
        milestones: [
          {
            id: 1,
            milestone: 'Reaches for objects (hand-eye coordination)',
            achieved: true,
            expected: '3-4 months',
          },
          {
            id: 2,
            milestone: 'Color discrimination developing',
            achieved: true,
            expected: '3-4 months',
          },
          {
            id: 3,
            milestone: 'Binocular vision (both eyes together)',
            achieved: true,
            expected: '4-6 months',
          },
          {
            id: 4,
            milestone: 'Recognizes familiar faces at distance',
            achieved: true,
            expected: '5-6 months',
          },
          {
            id: 5,
            milestone: 'Depth perception developing',
            achieved: false,
            expected: '5-6 months',
          },
        ],
      };
    } else if (ageMonths < 12) {
      return {
        category: 'Late Infant (6-12 months)',
        milestones: [
          {
            id: 1,
            milestone: 'Crawls/cruises without bumping objects',
            achieved: true,
            expected: '6-10 months',
          },
          {
            id: 2,
            milestone: 'Object permanence (searches for hidden toys)',
            achieved: true,
            expected: '8-9 months',
          },
          {
            id: 3,
            milestone: 'Fine depth perception (picks up small objects)',
            achieved: true,
            expected: '8-12 months',
          },
          {
            id: 4,
            milestone: 'Visual-motor coordination (stacks blocks)',
            achieved: true,
            expected: '10-12 months',
          },
          {
            id: 5,
            milestone: 'Points to objects when named',
            achieved: true,
            expected: '12 months',
          },
        ],
      };
    } else if (ageMonths < 24) {
      return {
        category: 'Toddler (1-2 years)',
        milestones: [
          {
            id: 1,
            milestone: 'Walks/runs without bumping',
            achieved: true,
            expected: '12-18 months',
          },
          {
            id: 2,
            milestone: 'Scribbles with crayon',
            achieved: true,
            expected: '12-18 months',
          },
          {
            id: 3,
            milestone: 'Stacks 4-6 blocks',
            achieved: true,
            expected: '18-24 months',
          },
          {
            id: 4,
            milestone: 'Throws/catches large ball',
            achieved: true,
            expected: '18-24 months',
          },
          {
            id: 5,
            milestone: 'Matches shapes/colors',
            achieved: false,
            expected: '24 months',
          },
        ],
      };
    } else if (ageMonths < 36) {
      return {
        category: 'Preschool (2-3 years)',
        milestones: [
          {
            id: 1,
            milestone: 'Draws circles and lines',
            achieved: true,
            expected: '2-3 years',
          },
          {
            id: 2,
            milestone: 'Completes simple puzzles (3-4 pieces)',
            achieved: true,
            expected: '2-3 years',
          },
          {
            id: 3,
            milestone: 'Identifies colors',
            achieved: true,
            expected: '2-3 years',
          },
          {
            id: 4,
            milestone: 'Rides tricycle',
            achieved: true,
            expected: '3 years',
          },
          {
            id: 5,
            milestone: 'Catches bounced ball',
            achieved: true,
            expected: '3 years',
          },
        ],
      };
    } else if (ageMonths < 60) {
      return {
        category: 'Preschool (3-5 years)',
        milestones: [
          {
            id: 1,
            milestone: 'Colors within lines',
            achieved: true,
            expected: '3-4 years',
          },
          {
            id: 2,
            milestone: 'Copies shapes (circle, square, triangle)',
            achieved: true,
            expected: '3-5 years',
          },
          {
            id: 3,
            milestone: 'Recognizes letters/numbers',
            achieved: true,
            expected: '4-5 years',
          },
          {
            id: 4,
            milestone: 'Catches small ball',
            achieved: true,
            expected: '4-5 years',
          },
          {
            id: 5,
            milestone: 'Rides bicycle with training wheels',
            achieved: true,
            expected: '4-5 years',
          },
        ],
      };
    } else if (ageMonths < 96) {
      return {
        category: 'School Age (5-8 years)',
        milestones: [
          {
            id: 1,
            milestone: 'Reading fluency (age-appropriate)',
            achieved: true,
            expected: '5-7 years',
          },
          {
            id: 2,
            milestone: 'Handwriting legible',
            achieved: true,
            expected: '6-8 years',
          },
          {
            id: 3,
            milestone: 'Copies from blackboard without difficulty',
            achieved: true,
            expected: '6-8 years',
          },
          {
            id: 4,
            milestone: 'Sports participation (catches, throws accurately)',
            achieved: true,
            expected: '6-8 years',
          },
          {
            id: 5,
            milestone: 'Sustained near work (reading 30+ minutes)',
            achieved: false,
            expected: '7-8 years',
          },
        ],
      };
    } else if (ageMonths < 144) {
      return {
        category: 'Late Childhood (8-12 years)',
        milestones: [
          {
            id: 1,
            milestone: 'Academic performance at grade level',
            achieved: true,
            expected: '8-12 years',
          },
          {
            id: 2,
            milestone: 'Sustained reading/computer work (1+ hours)',
            achieved: true,
            expected: '8-12 years',
          },
          {
            id: 3,
            milestone: 'Organized sports (hand-eye coordination)',
            achieved: true,
            expected: '8-12 years',
          },
          {
            id: 4,
            milestone: 'No squinting at distance (blackboard)',
            achieved: true,
            expected: '8-12 years',
          },
          {
            id: 5,
            milestone: 'Screen time tolerance without eye strain',
            achieved: true,
            expected: '8-12 years',
          },
        ],
      };
    } else {
      return {
        category: 'Adolescent (12-18 years)',
        milestones: [
          {
            id: 1,
            milestone: 'Academic performance - high school level',
            achieved: true,
            expected: '12-18 years',
          },
          {
            id: 2,
            milestone: 'Driving readiness (vision 6/12 or better)',
            achieved: true,
            expected: '16+ years',
          },
          {
            id: 3,
            milestone: 'Career visual demands assessment',
            achieved: true,
            expected: '16-18 years',
          },
          {
            id: 4,
            milestone: 'Digital device use without eye strain',
            achieved: true,
            expected: '12-18 years',
          },
          {
            id: 5,
            milestone: 'Sports/extracurricular activities',
            achieved: true,
            expected: '12-18 years',
          },
        ],
      };
    }
  };

  const milestoneData = getMilestonesByAge();

  // Visual acuity norms by age
  const getExpectedVA = (): {
    expectedOD: string;
    expectedOS: string;
    interpretation: string;
  } => {
    if (ageMonths < 6) {
      return {
        expectedOD: '6/60 or better',
        expectedOS: '6/60 or better',
        interpretation: 'Fixates, follows faces',
      };
    } else if (ageMonths < 12) {
      return {
        expectedOD: '6/36',
        expectedOS: '6/36',
        interpretation: 'Preferential looking, CSM',
      };
    } else if (ageMonths < 24) {
      return {
        expectedOD: '6/24',
        expectedOS: '6/24',
        interpretation: 'Cardiff cards, preferential looking',
      };
    } else if (ageMonths < 36) {
      return {
        expectedOD: '6/18',
        expectedOS: '6/18',
        interpretation: 'Lea symbols, Allen figures',
      };
    } else if (ageMonths < 48) {
      return {
        expectedOD: '6/12',
        expectedOS: '6/12',
        interpretation: 'HOTV, Lea symbols',
      };
    } else if (ageMonths < 60) {
      return {
        expectedOD: '6/9',
        expectedOS: '6/9',
        interpretation: 'HOTV, Snellen E',
      };
    } else {
      return {
        expectedOD: '6/6',
        expectedOS: '6/6',
        interpretation: 'Adult-level acuity (Snellen)',
      };
    }
  };

  const expectedVA = getExpectedVA();

  // Red flags assessment
  const redFlags = [
    {
      id: 1,
      flag: 'No eye contact by 3 months',
      present: false,
      severity: 'High',
    },
    {
      id: 2,
      flag: 'Constant eye turn by 6 months',
      present: false,
      severity: 'High',
    },
    {
      id: 3,
      flag: 'No interest in faces/colorful toys',
      present: false,
      severity: 'Moderate',
    },
    {
      id: 4,
      flag: 'White reflex in pupil (leukocoria)',
      present: false,
      severity: 'Critical',
    },
    {
      id: 5,
      flag: 'Photophobia (extreme light sensitivity)',
      present: false,
      severity: 'Moderate',
    },
    {
      id: 6,
      flag: 'Persistent head tilt or turn',
      present: false,
      severity: 'Moderate',
    },
    {
      id: 7,
      flag: 'Poor hand-eye coordination for age',
      present: false,
      severity: 'Low',
    },
    {
      id: 8,
      flag: 'Squinting or closing one eye',
      present: false,
      severity: 'Moderate',
    },
    {
      id: 9,
      flag: 'Frequent falls/clumsiness',
      present: false,
      severity: 'Low',
    },
    {
      id: 10,
      flag: 'Rubbing eyes excessively',
      present: false,
      severity: 'Low',
    },
  ];

  const handleSave = () => {
    if (onSave) {
      onSave({
        ageMonths,
        milestones: milestoneData,
        expectedVA,
        redFlags,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gray-900">Developmental Milestones Assessment</h3>
        <p className="text-sm text-gray-600">
          Age-appropriate vision development tracking - 0 to 18 years
        </p>
      </div>

      {/* Patient Age & Category */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <Baby className="w-8 h-8" />
          <div>
            <h4 className="text-2xl font-bold">
              {ageYears < 1
                ? `${ageMonths} months`
                : `${ageYears.toFixed(1)} years (${ageMonths} months)`}
            </h4>
            <p className="text-pink-100">{milestoneData.category}</p>
          </div>
        </div>
      </div>

      {/* Expected Visual Acuity by Age */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <h4 className="text-lg font-bold text-blue-900 mb-4">Expected Visual Acuity for Age</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-sm text-blue-700 mb-1">Expected OD</p>
            <p className="text-2xl font-bold text-blue-900">{expectedVA.expectedOD}</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-sm text-blue-700 mb-1">Expected OS</p>
            <p className="text-2xl font-bold text-blue-900">{expectedVA.expectedOS}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-blue-700 mb-1">Testing Method</p>
            <p className="text-sm font-semibold text-blue-900">{expectedVA.interpretation}</p>
          </div>
        </div>
      </div>

      {/* Milestones Checklist */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <span>Vision-Related Developmental Milestones</span>
        </h4>

        <div className="space-y-3">
          {milestoneData.milestones.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                item.achieved
                  ? 'bg-green-50 border-green-300'
                  : 'bg-yellow-50 border-yellow-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.achieved ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                )}
                <div>
                  <p
                    className={`font-semibold ${
                      item.achieved ? 'text-green-900' : 'text-yellow-900'
                    }`}
                  >
                    {item.milestone}
                  </p>
                  <p
                    className={`text-sm ${
                      item.achieved ? 'text-green-700' : 'text-yellow-700'
                    }`}
                  >
                    Expected: {item.expected}
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  item.achieved
                    ? 'bg-green-200 text-green-900'
                    : 'bg-yellow-200 text-yellow-900'
                }`}
              >
                {item.achieved ? 'Achieved' : 'Delayed'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Red Flags Screening */}
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
        <h4 className="text-lg font-bold text-red-900 mb-4">Red Flags - Early Warning Signs</h4>
        <div className="space-y-2">
          {redFlags.map((flag) => (
            <div
              key={flag.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                flag.present ? 'bg-red-100 border-2 border-red-400' : 'bg-white border border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                {flag.present && <AlertTriangle className="w-5 h-5 text-red-600" />}
                <p className={`text-sm ${flag.present ? 'font-bold text-red-900' : 'text-gray-700'}`}>
                  {flag.flag}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    flag.severity === 'Critical'
                      ? 'bg-red-200 text-red-900'
                      : flag.severity === 'High'
                      ? 'bg-orange-200 text-orange-900'
                      : flag.severity === 'Moderate'
                      ? 'bg-yellow-200 text-yellow-900'
                      : 'bg-blue-200 text-blue-900'
                  }`}
                >
                  {flag.severity}
                </span>
                <input
                  type="checkbox"
                  checked={flag.present}
                  disabled={!canEdit}
                  className="w-5 h-5 text-red-600"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clinical Guidelines */}
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
        <h5 className="font-semibold text-purple-900 mb-3">
          Pediatric Vision Development Guidelines
        </h5>
        <div className="space-y-2 text-sm text-purple-800">
          <p>
            <strong>Critical Period:</strong> Birth to 8-9 years. Visual system is most plastic
            (adaptable) during this time. Amblyopia treatment MUST occur before critical period
            closes.
          </p>
          <p>
            <strong>Visual Acuity Maturation:</strong> Newborn = 6/240 (20/800), 6 months = 6/60,
            1 year = 6/36, 2 years = 6/24, 3 years = 6/18, 5 years = 6/9, 6+ years = 6/6
            (adult level).
          </p>
          <p>
            <strong>Age-Appropriate Testing:</strong> 0-6 months (fix & follow), 6-24 months
            (preferential looking, CSM), 2-3 years (Lea symbols, Allen figures), 3-5 years (HOTV,
            Lea), 5+ years (Snellen).
          </p>
          <p>
            <strong>Red Flags - Urgent Referral:</strong> Leukocoria (white reflex) = rule out
            retinoblastoma, Constant eye turn by 6 months, No fixation by 3 months, Nystagmus
            (shaking eyes), Photophobia + tearing (congenital glaucoma).
          </p>
          <p>
            <strong>Screening Schedule:</strong> Newborn (red reflex), 6 months (alignment,
            fixation), 3 years (visual acuity), 5 years (full exam before school), Annual during
            school years.
          </p>
          <p>
            <strong>Hand-Eye Coordination:</strong> Milestones indicate visual-motor integration.
            Delays may suggest vision problems. Examples: Reaches for objects (3-4 months), Stacks
            blocks (12 months), Catches ball (2-3 years), Copies shapes (3-5 years).
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
            <span>Save Developmental Assessment</span>
          </button>
        </div>
      )}
    </div>
  );
}
