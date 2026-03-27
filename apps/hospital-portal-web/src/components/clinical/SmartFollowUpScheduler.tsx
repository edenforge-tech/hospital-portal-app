'use client';

import { useState, useEffect } from 'react';
import { Calendar, Brain, Plus, Trash2, AlertCircle } from 'lucide-react';
import { ExamCard, ActionButton, StatusBadge } from '../examination/ExamCard';

interface FollowUpSuggestion {
  condition: string;
  recommendedDays: number;
  reason: string;
  priority: 'routine' | 'important' | 'critical';
}

interface FollowUpSchedule {
  date: string;
  type: string;
  reason: string;
  autoScheduled: boolean;
}

interface SmartFollowUpSchedulerProps {
  diagnoses: Array<{ icd10Code: string; description: string }>;
  procedures: string[];
  onScheduleFollowUp?: (schedule: FollowUpSchedule) => void;
  canEdit: boolean;
}

export default function SmartFollowUpScheduler({
  diagnoses,
  procedures,
  onScheduleFollowUp,
  canEdit,
}: SmartFollowUpSchedulerProps) {
  const [suggestions, setSuggestions] = useState<FollowUpSuggestion[]>([]);
  const [scheduledFollowUps, setScheduledFollowUps] = useState<FollowUpSchedule[]>([]);
  const [customDate, setCustomDate] = useState('');
  const [customReason, setCustomReason] = useState('');

  // Smart suggester based on ICD-10 codes and procedures
  useEffect(() => {
    generateSuggestions();
  }, [diagnoses, procedures]);

  const generateSuggestions = () => {
    const newSuggestions: FollowUpSuggestion[] = [];

    diagnoses.forEach((diagnosis) => {
      const code = diagnosis.icd10Code.toUpperCase();

      // POAG - Primary Open-Angle Glaucoma (H40.11)
      if (code.startsWith('H40.11')) {
        newSuggestions.push({
          condition: 'Primary Open-Angle Glaucoma',
          recommendedDays: 30,
          reason: 'IOP monitoring and medication adjustment',
          priority: 'important',
        });
      }

      // Cataract (H25/H26)
      if (code.startsWith('H25') || code.startsWith('H26')) {
        // If surgery mentioned in procedures
        if (procedures.some((p) => p.toLowerCase().includes('cataract'))) {
          // Post-op follow-up schedule
          newSuggestions.push({
            condition: 'Post-op Cataract Surgery',
            recommendedDays: 1,
            reason: 'Day 1 post-op check (wound, IOP, inflammation)',
            priority: 'critical',
          });
          newSuggestions.push({
            condition: 'Post-op Cataract Surgery',
            recommendedDays: 7,
            reason: 'Week 1 post-op check (refraction, complication screening)',
            priority: 'important',
          });
          newSuggestions.push({
            condition: 'Post-op Cataract Surgery',
            recommendedDays: 30,
            reason: 'Month 1 post-op check (final refraction, PCO screening)',
            priority: 'routine',
          });
        } else {
          // Pre-op cataract monitoring
          newSuggestions.push({
            condition: 'Cataract (pre-op)',
            recommendedDays: 90,
            reason: 'Monitor cataract progression, assess surgery readiness',
            priority: 'routine',
          });
        }
      }

      // Diabetic Retinopathy (E10.3, E11.3, H35.0)
      if (
        code.startsWith('E10.3') ||
        code.startsWith('E11.3') ||
        code.startsWith('H35.0')
      ) {
        if (code.includes('E10.35') || code.includes('E11.35')) {
          // Proliferative DR
          newSuggestions.push({
            condition: 'Proliferative Diabetic Retinopathy',
            recommendedDays: 30,
            reason: 'Close monitoring for neovascularization and vitreous hemorrhage',
            priority: 'critical',
          });
        } else if (code.includes('E10.34') || code.includes('E11.34')) {
          // Severe NPDR
          newSuggestions.push({
            condition: 'Severe Non-Proliferative Diabetic Retinopathy',
            recommendedDays: 60,
            reason: 'Monitor progression to PDR, assess laser photocoagulation need',
            priority: 'important',
          });
        } else {
          // Mild/Moderate DR
          newSuggestions.push({
            condition: 'Diabetic Retinopathy',
            recommendedDays: 90,
            reason: 'Monitor DR progression, HbA1c control',
            priority: 'important',
          });
        }
      }

      // Age-related Macular Degeneration (H35.31, H35.32)
      if (code.startsWith('H35.31')) {
        // Dry AMD
        newSuggestions.push({
          condition: 'Dry Age-Related Macular Degeneration',
          recommendedDays: 180,
          reason: 'Monitor AMD progression, Amsler grid, AREDS supplementation',
          priority: 'routine',
        });
      } else if (code.startsWith('H35.32')) {
        // Wet AMD
        newSuggestions.push({
          condition: 'Wet Age-Related Macular Degeneration',
          recommendedDays: 30,
          reason: 'Anti-VEGF injection monitoring, OCT macula assessment',
          priority: 'critical',
        });
      }

      // Retinal Detachment (H33)
      if (code.startsWith('H33')) {
        if (procedures.some((p) => p.toLowerCase().includes('vitrectomy') || p.toLowerCase().includes('scleral buckle'))) {
          newSuggestions.push({
            condition: 'Post-op Retinal Detachment Surgery',
            recommendedDays: 1,
            reason: 'Day 1 post-op check (IOP, positioning, retinal attachment)',
            priority: 'critical',
          });
          newSuggestions.push({
            condition: 'Post-op Retinal Detachment Surgery',
            recommendedDays: 7,
            reason: 'Week 1 post-op check (retinal attachment confirmation)',
            priority: 'critical',
          });
        } else {
          newSuggestions.push({
            condition: 'Retinal Detachment (pre-op)',
            recommendedDays: 1,
            reason: 'URGENT: Pre-op evaluation for emergency surgery',
            priority: 'critical',
          });
        }
      }

      // Corneal Ulcer (H16.0)
      if (code.startsWith('H16.0')) {
        newSuggestions.push({
          condition: 'Corneal Ulcer',
          recommendedDays: 2,
          reason: 'Monitor healing, medication response, culture results',
          priority: 'critical',
        });
      }

      // Dry Eye (H04.12)
      if (code.startsWith('H04.12')) {
        newSuggestions.push({
          condition: 'Dry Eye Syndrome',
          recommendedDays: 60,
          reason: 'Assess treatment response, tear film evaluation',
          priority: 'routine',
        });
      }

      // Uveitis (H20)
      if (code.startsWith('H20')) {
        newSuggestions.push({
          condition: 'Uveitis',
          recommendedDays: 7,
          reason: 'Monitor inflammation, steroid taper, complication screening',
          priority: 'important',
        });
      }
    });

    // Remove duplicates and sort by priority
    const uniqueSuggestions = newSuggestions.filter(
      (s, index, self) =>
        index === self.findIndex((t) => t.condition === s.condition && t.recommendedDays === s.recommendedDays)
    );

    const priorityOrder = { critical: 0, important: 1, routine: 2 };
    uniqueSuggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    setSuggestions(uniqueSuggestions);
  };

  const handleAcceptSuggestion = (suggestion: FollowUpSuggestion) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + suggestion.recommendedDays);

    const schedule: FollowUpSchedule = {
      date: futureDate.toISOString().split('T')[0],
      type: suggestion.condition,
      reason: suggestion.reason,
      autoScheduled: true,
    };

    setScheduledFollowUps([...scheduledFollowUps, schedule]);

    if (onScheduleFollowUp) {
      onScheduleFollowUp(schedule);
    }

    // Remove accepted suggestion
    setSuggestions(suggestions.filter((s) => s !== suggestion));
  };

  const handleAddCustomFollowUp = () => {
    if (!customDate || !customReason.trim()) {
      alert('Please enter date and reason');
      return;
    }

    const schedule: FollowUpSchedule = {
      date: customDate,
      type: 'Custom Follow-up',
      reason: customReason.trim(),
      autoScheduled: false,
    };

    setScheduledFollowUps([...scheduledFollowUps, schedule]);

    if (onScheduleFollowUp) {
      onScheduleFollowUp(schedule);
    }

    setCustomDate('');
    setCustomReason('');
  };

  const handleRemoveFollowUp = (index: number) => {
    setScheduledFollowUps(scheduledFollowUps.filter((_, i) => i !== index));
  };

  const getPriorityColor = (priority: string): 'red' | 'amber' | 'gray' => {
    switch (priority) {
      case 'critical':
        return 'red';
      case 'important':
        return 'amber';
      default:
        return 'gray';
    }
  };

  return (
    <div className="space-y-4">
      {/* Smart Suggestions */}
      {suggestions.length > 0 && (
        <ExamCard
          title="Smart Follow-up Recommendations"
          icon={<Brain className="w-5 h-5" />}
          badge={{ text: `${suggestions.length} Suggestion(s)`, variant: 'info' }}
        >
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Based on diagnosis codes and procedures, we recommend the following follow-up schedule:
            </p>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-4 border-2 border-indigo-200 rounded-lg bg-indigo-50 hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{suggestion.condition}</h4>
                      <StatusBadge
                        text={suggestion.priority.toUpperCase()}
                        variant={getPriorityColor(suggestion.priority)}
                      />
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{suggestion.reason}</p>
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium text-indigo-900">
                        {suggestion.recommendedDays === 1
                          ? 'Next day'
                          : `${suggestion.recommendedDays} days from today`}
                      </span>
                      <span className="text-gray-600">
                        (
                        {new Date(
                          Date.now() + suggestion.recommendedDays * 24 * 60 * 60 * 1000
                        ).toLocaleDateString()}
                        )
                      </span>
                    </div>
                  </div>
                  <ActionButton
                    variant="primary"
                    onClick={() => handleAcceptSuggestion(suggestion)}
                    disabled={!canEdit}
                    className="ml-4"
                  >
                    Accept
                  </ActionButton>
                </div>
              </div>
            ))}
          </div>
        </ExamCard>
      )}

      {/* Scheduled Follow-ups */}
      <ExamCard
        title="Scheduled Follow-up Appointments"
        icon={<Calendar className="w-5 h-5" />}
        badge={
          scheduledFollowUps.length > 0
            ? { text: `${scheduledFollowUps.length} Scheduled`, variant: 'success' }
            : { text: 'None', variant: 'neutral' }
        }
      >
        <div className="space-y-3">
          {scheduledFollowUps.length === 0 ? (
            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No follow-up appointments scheduled</p>
              <p className="text-xs text-gray-400 mt-1">
                Accept smart suggestions or add custom follow-up below
              </p>
            </div>
          ) : (
            scheduledFollowUps.map((schedule, index) => (
              <div
                key={index}
                className="p-3 border border-gray-200 rounded-lg bg-white hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h5 className="font-semibold text-gray-900">{schedule.type}</h5>
                      {schedule.autoScheduled && (
                        <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded">
                          Auto-scheduled
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{schedule.reason}</p>
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <span className="font-medium text-emerald-900">
                        {new Date(schedule.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => handleRemoveFollowUp(index)}
                      className="text-red-600 hover:text-red-700 p-2"
                      title="Remove follow-up"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Add Custom Follow-up */}
          {canEdit && (
            <div className="pt-4 border-t border-gray-200">
              <h5 className="text-sm font-semibold text-gray-900 mb-3">Add Custom Follow-up</h5>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="e.g., Routine check-up, medication review..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <ActionButton
                  variant="primary"
                  onClick={handleAddCustomFollowUp}
                  icon={<Plus className="w-4 h-4" />}
                  disabled={!customDate || !customReason.trim()}
                  className="w-full"
                >
                  Add Custom Follow-up
                </ActionButton>
              </div>
            </div>
          )}
        </div>
      </ExamCard>

      {/* Information Notice */}
      {suggestions.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900">
            <strong>Smart Scheduler:</strong> Follow-up recommendations are based on clinical guidelines
            for ophthalmology conditions. Adjust as needed based on patient-specific factors.
          </p>
        </div>
      )}
    </div>
  );
}
