'use client';

/**
 * SendDeptRequestModal
 * Opens when counselor clicks "Send Request" for a specific department.
 * Submits to POST /api/dept-coordination and optionally to lab-orders API.
 */

import React, { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  useSendDeptRequest,
  type DeptCoordinationDepartment,
} from '@/hooks/use-dept-coordination';
import { cn } from '@/lib/utils';

const DEPARTMENTS: DeptCoordinationDepartment[] = [
  'Admissions',
  'Billing',
  'Lab',
  'Surgeon',
  'Anesthesia',
];

interface SendDeptRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: string;
  sessionId?: string;
  patientId: string;
  /** Pre-select a department */
  department?: DeptCoordinationDepartment;
  onSuccess?: () => void;
}

export function SendDeptRequestModal({
  isOpen,
  onClose,
  scheduleId,
  sessionId,
  patientId,
  department: defaultDept,
  onSuccess,
}: SendDeptRequestModalProps) {
  const [dept, setDept] = useState<DeptCoordinationDepartment>(
    defaultDept ?? 'Admissions'
  );
  const [message, setMessage] = useState('');
  const [labTests, setLabTests] = useState('');

  const sendMutation = useSendDeptRequest(scheduleId);
  const qc = useQueryClient();

  // Mutation to also create lab order items when Lab dept is selected
  const labOrderMutation = useMutation({
    mutationFn: async (tests: string[]) => {
      const api = getApi();
      await Promise.all(
        tests.map(testName =>
          api.post('/preoptests/lab-order', {
            patientId,
            sessionId,
            testName,
            urgency: 'Routine',
          })
        )
      );
    },
    onError: () => toast.error('Lab order saved in coord. request but direct lab-order API failed'),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTests = dept === 'Lab' && labTests.trim()
      ? labTests.split('\n').map(t => t.trim()).filter(Boolean)
      : [];

    const requestData: Record<string, unknown> = {};
    if (parsedTests.length) requestData.labTests = parsedTests;

    await sendMutation.mutateAsync({
      patientId,
      sessionId,
      scheduleId,
      department: dept,
      requestMessage: message.trim() || undefined,
      requestData: Object.keys(requestData).length ? requestData : undefined,
    });

    // G8: also fire lab-order API for each test when Lab dept
    if (parsedTests.length) {
      await labOrderMutation.mutateAsync(parsedTests);
    }

    setMessage('');
    setLabTests('');
    onSuccess?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Send Department Request</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Department selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Department
            </label>
            <div className="flex flex-wrap gap-2">
              {DEPARTMENTS.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDept(d)}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-lg border font-medium transition-colors',
                    dept === d
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-400 hover:text-emerald-700'
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Message / Instructions
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              placeholder={
                dept === 'Billing'
                  ? 'e.g. Patient is insured under XYZ. Please prepare pre-auth'
                  : dept === 'Admissions'
                  ? 'e.g. Patient needs IPD bed on surgery day'
                  : dept === 'Surgeon'
                  ? 'e.g. Please confirm surgeon availability for this date'
                  : dept === 'Anesthesia'
                  ? 'e.g. Patient has asthma – please review pre-op clearance'
                  : 'Additional instructions for the department'
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Lab-specific: test list */}
          {dept === 'Lab' && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Tests Required <span className="text-gray-400 font-normal">(one per line)</span>
              </label>
              <textarea
                value={labTests}
                onChange={e => setLabTests(e.target.value)}
                rows={4}
                placeholder={'CBC\nBlood Sugar (Fasting)\nSerum Creatinine\nECG'}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none font-mono"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sendMutation.isPending || labOrderMutation.isPending}
              className="flex-1 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {sendMutation.isPending || labOrderMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
              ) : (
                <><Send className="w-4 h-4" /> Send Request</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
