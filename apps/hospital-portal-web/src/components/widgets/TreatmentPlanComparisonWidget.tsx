/**
 * Treatment Plan Comparison Widget
 * Side-by-side comparison of treatment options
 */

'use client';

import React, { useState, useEffect } from 'react';
import { GitCompare, CheckCircle, AlertTriangle, DollarSign, Clock, Award } from 'lucide-react';
import { WidgetProps } from '@/lib/widgets/widget-types';
import type { TreatmentPlan } from '@/lib/api/widgets.api';
import { widgetsApi } from '@/lib/api/widgets.api';

const TreatmentPlanComparisonWidget: React.FC<WidgetProps> = ({ patientId, sessionId }) => {
  const [plans, setPlans] = useState<TreatmentPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) loadPlans();
  }, [sessionId]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await widgetsApi.getTreatmentOptions(sessionId!);
      setPlans(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    if (!sessionId) return;

    try {
      await widgetsApi.selectTreatmentPlan(sessionId, planId);
      await loadPlans();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (plans.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <GitCompare className="w-12 h-12 text-gray-400 mb-2" />
        <p className="text-gray-500">No treatment plans available</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 space-y-4 overflow-auto">
      <h3 className="text-lg font-semibold flex items-center">
        <GitCompare className="w-5 h-5 mr-2 text-blue-600" />
        Compare Treatment Options
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map(plan => (
          <div
            key={plan.id}
            className={`border-2 rounded-lg p-4 ${
              plan.recommended
                ? 'border-green-500 bg-green-50'
                : plan.selected
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white'
            } hover:shadow-lg transition-shadow`}
          >
            {/* Header */}
            <div className="mb-4">
              <div className="flex items-start justify-between">
                <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                {plan.recommended && (
                  <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center">
                    <Award className="w-3 h-3 mr-1" />
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
            </div>

            {/* Cost */}
            <div className="bg-white border rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Estimated Cost</span>
                <span className="text-lg font-bold text-gray-900">₹{plan.estimatedCost.toLocaleString()}</span>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                  Success Rate
                </span>
                <span className="font-medium">{plan.successRate}%</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center">
                  <Clock className="w-4 h-4 mr-1 text-blue-600" />
                  Recovery Time
                </span>
                <span className="font-medium">{plan.recoveryTime}</span>
              </div>
            </div>

            {/* Benefits */}
            {plan.benefits && plan.benefits.length > 0 && (
              <div className="mb-3">
                <h5 className="text-xs font-medium text-gray-700 mb-1">Benefits</h5>
                <ul className="space-y-1">
                  {plan.benefits.map((benefit, idx) => (
                    <li key={idx} className="text-xs text-gray-600 flex items-start">
                      <CheckCircle className="w-3 h-3 mr-1 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risks */}
            {plan.risks && plan.risks.length > 0 && (
              <div className="mb-4">
                <h5 className="text-xs font-medium text-gray-700 mb-1">Considerations</h5>
                <ul className="space-y-1">
                  {plan.risks.map((risk, idx) => (
                    <li key={idx} className="text-xs text-gray-600 flex items-start">
                      <AlertTriangle className="w-3 h-3 mr-1 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Button */}
            {plan.selected ? (
              <div className="w-full py-2 bg-blue-600 text-white rounded text-center text-sm font-medium">
                ✓ Selected
              </div>
            ) : (
              <button
                onClick={() => handleSelectPlan(plan.id)}
                className="w-full py-2 bg-gray-900 text-white rounded hover:bg-gray-800 text-sm font-medium"
              >
                Select This Plan
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Comparison Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Your doctor will help you choose the best option based on your individual needs and medical history.
        </p>
      </div>
    </div>
  );
};

export default TreatmentPlanComparisonWidget;
