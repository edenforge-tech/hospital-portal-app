'use client';

/**
 * NoShowDialog
 * Shown when a counselor marks a surgery-confirmed patient as a no-show.
 * Options: Reschedule OT | Put On Hold | Cancel Surgery
 */

import React, { useState } from 'react';
import { X, Calendar, PauseCircle, XCircle, AlertTriangle } from 'lucide-react';

interface NoShowDialogProps {
  patientName: string;
  surgeryDate: string;
  onReschedule: (notes: string) => void;
  onHold: (notes: string) => void;
  onCancel: (notes: string) => void;
  onDismiss: () => void;
}

type Action = 'reschedule' | 'hold' | 'cancel' | null;

const ACTIONS = [
  {
    id: 'reschedule' as Action,
    label: 'Reschedule OT',
    description: 'Patient will come on a new date. Keep the booking.',
    icon: Calendar,
    color: 'text-blue-600',
    borderColor: 'border-blue-400',
    bg: 'bg-blue-50',
    buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  {
    id: 'hold' as Action,
    label: 'Put On Hold',
    description: 'Temporarily suspend until patient confirms.',
    icon: PauseCircle,
    color: 'text-amber-600',
    borderColor: 'border-amber-400',
    bg: 'bg-amber-50',
    buttonClass: 'bg-amber-500 hover:bg-amber-600 text-white',
  },
  {
    id: 'cancel' as Action,
    label: 'Cancel Surgery',
    description: 'Patient has declined or procedure is no longer required.',
    icon: XCircle,
    color: 'text-red-600',
    borderColor: 'border-red-400',
    bg: 'bg-red-50',
    buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
  },
] as const;

export function NoShowDialog({
  patientName,
  surgeryDate,
  onReschedule,
  onHold,
  onCancel,
  onDismiss,
}: NoShowDialogProps) {
  const [selected, setSelected] = useState<Action>(null);
  const [notes, setNotes] = useState('');
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = () => {
    if (!selected) return;
    setConfirming(true);
    try {
      if (selected === 'reschedule') onReschedule(notes);
      else if (selected === 'hold') onHold(notes);
      else onCancel(notes);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base">Patient No-Show</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                <strong>{patientName}</strong> did not arrive for surgery on{' '}
                <strong>{new Date(surgeryDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</strong>
              </p>
            </div>
          </div>
          <button onClick={onDismiss} className="p-1 hover:bg-gray-100 rounded-md">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Action chips */}
        <div className="px-5 pb-3 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">How would you like to proceed?</p>
          {ACTIONS.map(({ id, label, description, icon: Icon, color, borderColor, bg }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSelected(id)}
              className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                selected === id ? `${borderColor} ${bg}` : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${color}`} />
              <div>
                <p className="font-semibold text-sm text-gray-800">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Notes */}
        <div className="px-5 pb-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            placeholder="Reason for no-show, next contact date, etc."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 pb-5 pt-2 border-t border-gray-100">
          <button onClick={onDismiss} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Dismiss
          </button>
          {selected && (
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                ACTIONS.find(a => a.id === selected)?.buttonClass ?? ''
              }`}
            >
              {confirming ? 'Saving…' : `Confirm — ${ACTIONS.find(a => a.id === selected)?.label}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
