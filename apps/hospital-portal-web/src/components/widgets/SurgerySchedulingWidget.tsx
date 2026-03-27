/**
 * Surgery Scheduling Widget — Redesigned for best-in-class healthcare UX
 * Month-by-month calendar navigation, surgeon cards, grouped time slots,
 * live selection summary, and step-aware confirmation flow.
 */

'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Sun,
  Sunset,
  Info,
  CheckCheck,
  Search,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/lib/widgets/widget-types';
import { widgetsApi, type Surgeon as SurgeonAPI } from '@/lib/api/widgets.api';

type SurgeonOption = SurgeonAPI & { available: boolean };

interface TimeSlot {
  id: string;
  time: string;
  label: string;
  available: boolean;
  period: 'morning' | 'afternoon';
}

const EYE_OPTIONS = [
  { value: 'RE' as const, label: 'Right Eye', sub: 'OD', color: 'blue' },
  { value: 'LE' as const, label: 'Left Eye', sub: 'OS', color: 'blue' },
  { value: 'BOTH' as const, label: 'Both Eyes', sub: 'OU', color: 'orange' },
];

const PRE_SURGERY_INSTRUCTIONS = [
  { icon: '🚫', text: 'Fast for 6 hours — no food or water before surgery' },
  { icon: '💧', text: 'Continue prescribed eye drops until the day of surgery' },
  { icon: '🚗', text: 'Arrange an escort — no self-driving post-surgery' },
  { icon: '👕', text: 'Wear loose, comfortable clothing on the day' },
  { icon: '💊', text: 'Bring all current medications for review' },
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function SurgerySchedulingWidget({
  widgetId,
  patientId,
  sessionId,
  size,
  isMinimized,
  data,
  onAction,
  onDataChange,
}: WidgetProps) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // State
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    (data as any)?.surgeryDate ? new Date((data as any).surgeryDate) : null
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>((data as any)?.timeSlot || '');
  const [selectedSurgeon, setSelectedSurgeon] = useState<string>((data as any)?.surgeonId || '');
  const [selectedEye, setSelectedEye] = useState<'RE' | 'LE' | 'BOTH'>((data as any)?.eye || 'RE');
  const [surgeons, setSurgeons] = useState<SurgeonOption[]>([]);
  const [availability, setAvailability] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [surgeonSearch, setSurgeonSearch] = useState('');
  const [surgeonDropdownOpen, setSurgeonDropdownOpen] = useState(false);
  const [wantToSchedule, setWantToSchedule] = useState<boolean>(
    !!((data as any)?.surgeryDate || (data as any)?.surgeonId)
  );
  const surgeonInputRef = useRef<HTMLInputElement>(null);
  const surgeonDropdownRef = useRef<HTMLDivElement>(null);
  // Stable ref to latest onDataChange — prevents the auto-save effect from
  // re-triggering on every parent re-render (onDataChange is a new fn reference each render)
  const onDataChangeRef = useRef(onDataChange);
  useEffect(() => { onDataChangeRef.current = onDataChange; });

  // Calendar: start at current month
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  // Max 3 months ahead
  const maxMonth = useMemo(() => {
    const d = new Date(today);
    d.setMonth(d.getMonth() + 3);
    return { year: d.getFullYear(), month: d.getMonth() };
  }, [today]);

  const canGoPrev = calendarMonth.year > today.getFullYear() ||
    (calendarMonth.year === today.getFullYear() && calendarMonth.month > today.getMonth());

  const canGoNext = calendarMonth.year < maxMonth.year ||
    (calendarMonth.year === maxMonth.year && calendarMonth.month < maxMonth.month);

  // Sync state when parent seeds data after mount (e.g. from DB on session load)
  useEffect(() => {
    if ((data as any)?.surgeryDate) {
      setSelectedDate(new Date((data as any).surgeryDate));
      setWantToSchedule(true);
    }
    if ((data as any)?.timeSlot) setSelectedTimeSlot((data as any).timeSlot);
    if ((data as any)?.surgeonId) {
      setSelectedSurgeon((data as any).surgeonId);
      setWantToSchedule(true);
    }
    if ((data as any)?.eye) setSelectedEye((data as any).eye);
  }, [(data as any)?.surgeryDate, (data as any)?.timeSlot, (data as any)?.surgeonId, (data as any)?.eye]);

  // Load surgeons on mount
  useEffect(() => {
    loadSurgeons();
  }, []);

  // Load availability when surgeon or calendar month changes
  useEffect(() => {
    if (selectedSurgeon) {
      loadAvailability(calendarMonth.year, calendarMonth.month);
    }
  }, [selectedSurgeon, calendarMonth]);

  // Auto-save on complete selection
  useEffect(() => {
    if (selectedDate && selectedTimeSlot && selectedSurgeon) {
      onDataChangeRef.current?.({
        surgeryDate: selectedDate.toISOString(),
        timeSlot: selectedTimeSlot,
        surgeonId: selectedSurgeon,
        surgeonName: surgeonSearch,
        eye: selectedEye,
      });
    }
  }, [selectedDate, selectedTimeSlot, selectedSurgeon, selectedEye, surgeonSearch]);

  const loadSurgeons = async () => {
    try {
      setLoading(true);
      setError(null);
      const surgeonsData = await widgetsApi.getSurgeons();
      const mapped = surgeonsData.map(s => ({ ...s, available: true })) as SurgeonOption[];
      setSurgeons(mapped);
      // Restore previously selected surgeon name for search field
      if ((data as any)?.surgeonId) {
        const prev = mapped.find(s => s.id === (data as any).surgeonId);
        if (prev) setSurgeonSearch(prev.name);
      }
    } catch (err: any) {
      // Don't block the widget on surgeon load failure — calendar still usable
      console.warn('Surgeon list unavailable:', err.message);
      setSurgeons([]);
    } finally {
      setLoading(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        surgeonDropdownRef.current &&
        !surgeonDropdownRef.current.contains(e.target as Node) &&
        !surgeonInputRef.current?.contains(e.target as Node)
      ) {
        setSurgeonDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredSurgeons = useMemo(() => {
    const q = surgeonSearch.trim().toLowerCase();
    if (!q) return surgeons;
    return surgeons.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        s.specialization.toLowerCase().includes(q)
    );
  }, [surgeons, surgeonSearch]);

  const handleSurgeonSelect = (surgeon: SurgeonOption) => {
    setSelectedSurgeon(surgeon.id);
    setSurgeonSearch(surgeon.name);
    setSurgeonDropdownOpen(false);
  };

  const handleSurgeonClear = () => {
    setSelectedSurgeon('');
    setSurgeonSearch('');
    setSurgeonDropdownOpen(false);
    surgeonInputRef.current?.focus();
  };

  const loadAvailability = async (year: number, month: number) => {
    if (!selectedSurgeon) return;
    try {
      const monthYear = `${year}-${String(month + 1).padStart(2, '0')}`;
      const availabilityData = await widgetsApi.getSurgeryAvailability(selectedSurgeon, monthYear);
      setAvailability(availabilityData);
    } catch {
      // Silently ignore availability load errors
    }
  };

  const navigateMonth = (dir: -1 | 1) => {
    setCalendarMonth(prev => {
      let m = prev.month + dir;
      let y = prev.year;
      if (m < 0) { m = 11; y--; }
      if (m > 11) { m = 0; y++; }
      return { year: y, month: m };
    });
    // Clear selected date if it's not in the new visible month
    setSelectedDate(d => {
      if (d) {
        const newMonth = (calendarMonth.month + dir + 12) % 12;
        if (d.getMonth() !== newMonth) return null;
      }
      return d;
    });
  };

  // Build calendar grid for current month
  const calendarGrid = useMemo(() => {
    const { year, month } = calendarMonth;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(year, month, d));
    }
    // Pad to complete last row
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [calendarMonth]);

  // Availability status per day (mock: weekends blocked, random limited/full)
  const getDayStatus = (date: Date): 'available' | 'limited' | 'full' | 'closed' => {
    const dow = date.getDay();
    if (dow === 0) return 'closed'; // Sunday
    if (availability?.unavailableDates?.includes(date.toISOString().split('T')[0])) return 'full';
    // Deterministic mock based on date number for demo
    const n = date.getDate();
    if (n % 7 === 0) return 'full';
    if (n % 5 === 0) return 'limited';
    return 'available';
  };

  // Time slots with period grouping
  const timeSlots: TimeSlot[] = useMemo(() =>
    availability?.slots || [
      { id: 'morning-1', time: '08:00 AM', label: 'OT-1 · Slot A', available: true, period: 'morning' },
      { id: 'morning-2', time: '10:00 AM', label: 'OT-1 · Slot B', available: true, period: 'morning' },
      { id: 'afternoon-1', time: '02:00 PM', label: 'OT-2 · Slot A', available: false, period: 'afternoon' },
      { id: 'afternoon-2', time: '04:00 PM', label: 'OT-2 · Slot B', available: true, period: 'afternoon' },
    ],
    [availability]
  );

  const morningSlots = timeSlots.filter(s => s.period === 'morning');
  const afternoonSlots = timeSlots.filter(s => s.period === 'afternoon');

  const selectedSurgeonObj = surgeons.find(s => s.id === selectedSurgeon);
  const selectedTimeSlotObj = timeSlots.find(s => s.id === selectedTimeSlot);
  const isScheduleComplete = !!(selectedDate && selectedTimeSlot && selectedSurgeon);
  const completedSteps = [
    !!selectedEye,
    !!selectedSurgeon,
    !!selectedDate,
    !!selectedTimeSlot,
  ].filter(Boolean).length;

  // ── Loading / Error / Empty states ──────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-3">
        <div className="relative">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
        </div>
        <p className="text-sm text-gray-500">Loading available surgeons…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-3 text-center px-6">
        <AlertCircle className="h-10 w-10 text-red-400" />
        <p className="text-sm text-red-600 font-medium">{error}</p>
        <button onClick={loadSurgeons} className="text-xs text-blue-600 hover:underline font-medium">
          Try again
        </button>
      </div>
    );
  }

  if (!patientId) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
        <Calendar className="h-10 w-10 opacity-30" />
        <p className="text-sm">Select a patient to schedule surgery</p>
      </div>
    );
  }

  // ── Compact (small) view ────────────────────────────────────────────────
  if (size === 'small') {
    return (
      <div className="space-y-2 px-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Surgery Schedule</p>
        {selectedDate && selectedTimeSlotObj ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <span className="text-sm font-semibold text-gray-900">
                {selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
              <span className="text-xs text-gray-600">{selectedTimeSlotObj.time} — {selectedTimeSlotObj.label}</span>
            </div>
            {selectedSurgeonObj && (
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                <span className="text-xs text-gray-600">{selectedSurgeonObj.name}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">Not scheduled yet</p>
        )}
      </div>
    );
  }

  // ── Full view ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full p-3 gap-3">

      <div className="flex flex-1 min-h-0 gap-3">
      {/* ══ LEFT PANEL: Progress + Summary + Eye + Surgeon ══════════════════ */}
      <div className="w-1/2 flex flex-col gap-3 overflow-y-auto hide-scrollbar">

        {/* Progress bar */}
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500">Booking progress</span>
            <span className="text-xs font-semibold text-blue-600">{completedSteps}/4 steps</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${(completedSteps / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Live Selection Summary */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-xl p-3">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Selection</p>
          <div className="grid grid-cols-2 gap-2">
            <SummaryChip
              icon={<Eye className="h-3 w-3" />}
              label="Eye"
              value={selectedEye === 'RE' ? 'Right Eye (OD)' : selectedEye === 'LE' ? 'Left Eye (OS)' : 'Both Eyes (OU)'}
              done={true}
            />
            <SummaryChip
              icon={<User className="h-3 w-3" />}
              label="Surgeon"
              value={selectedSurgeonObj?.name ?? '—'}
              done={!!selectedSurgeonObj}
            />
            <SummaryChip
              icon={<Calendar className="h-3 w-3" />}
              label="Date"
              value={selectedDate ? selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
              done={!!selectedDate}
            />
            <SummaryChip
              icon={<Clock className="h-3 w-3" />}
              label="Time"
              value={selectedTimeSlotObj?.time ?? '—'}
              done={!!selectedTimeSlotObj}
            />
          </div>
        </div>

        {/* ── Section 1: Eye for Surgery ───────────────────────────────────── */}
        <Section icon={<Eye className="h-4 w-4 text-blue-600" />} title="Eye for Surgery" done={!!selectedEye}>
          <div className="grid grid-cols-3 gap-2">
            {EYE_OPTIONS.map(opt => {
              const active = selectedEye === opt.value;
              const isWarning = opt.value === 'BOTH';
              return (
                <button
                  key={opt.value}
                  onClick={() => setSelectedEye(opt.value)}
                  className={cn(
                    'relative flex flex-col items-center justify-center py-3 px-2 rounded-xl border-2 transition-all duration-200 group',
                    active && !isWarning && 'border-blue-500 bg-blue-600 shadow-lg shadow-blue-100',
                    active && isWarning && 'border-orange-400 bg-orange-500 shadow-lg shadow-orange-100',
                    !active && 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50',
                  )}
                >
                  <span className={cn(
                    'text-sm font-bold leading-tight',
                    active ? 'text-white' : 'text-gray-800'
                  )}>{opt.label}</span>
                  <span className={cn(
                    'text-[10px] font-mono font-semibold mt-0.5',
                    active ? 'text-white/75' : 'text-gray-400'
                  )}>{opt.sub}</span>
                  {active && (
                    <span className="absolute top-1.5 right-1.5">
                      <CheckCircle2 className={cn('h-3 w-3', isWarning ? 'text-orange-100' : 'text-blue-200')} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {selectedEye === 'BOTH' && (
            <div className="flex items-start gap-2 mt-2 bg-orange-50 border border-orange-200 rounded-lg p-2.5">
              <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-orange-700 leading-relaxed">
                <span className="font-semibold">Bilateral surgery selected.</span> Clinical protocol recommends
                a 1–2 week interval between procedures for patient safety.
              </p>
            </div>
          )}
        </Section>

        {/* ── Section 2: Operating Surgeon ─────────────────────────────────── */}
        <Section icon={<User className="h-4 w-4 text-blue-600" />} title="Operating Surgeon" done={!!selectedSurgeon}>
          {/* Search input */}
          <div className={cn(
            'flex items-center gap-2 px-3 py-2.5 border-2 rounded-xl bg-white transition-colors',
            surgeonDropdownOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-blue-300'
          )}>
            <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <input
              ref={surgeonInputRef}
              type="text"
              value={surgeonSearch}
              onChange={e => {
                setSurgeonSearch(e.target.value);
                setSurgeonDropdownOpen(true);
                if (!e.target.value) setSelectedSurgeon('');
              }}
              onFocus={() => setSurgeonDropdownOpen(true)}
              placeholder="Search surgeon by name or specialization…"
              className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 bg-transparent outline-none min-w-0"
            />
            {surgeonSearch && (
              <button
                onMouseDown={e => { e.preventDefault(); handleSurgeonClear(); }}
                className="flex-shrink-0 p-0.5 hover:bg-gray-100 rounded-full"
              >
                <X className="h-3.5 w-3.5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Inline expanding list */}
          {surgeonDropdownOpen && (
            <div
              ref={surgeonDropdownRef}
              className="mt-1 border border-gray-200 rounded-xl bg-white overflow-hidden"
            >
              {filteredSurgeons.length === 0 ? (
                <div className="px-4 py-5 text-center">
                  <User className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    {surgeons.length === 0
                      ? 'No surgeons configured — contact administrator'
                      : `No match for "${surgeonSearch}"`}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {filteredSurgeons.map(surgeon => {
                    const active = selectedSurgeon === surgeon.id;
                    const initials = surgeon.name.trim().split(/\s+/).slice(0, 2).map((n: string) => n[0]).join('').toUpperCase();
                    return (
                      <li key={surgeon.id}>
                        <button
                          onMouseDown={e => { e.preventDefault(); handleSurgeonSelect(surgeon); }}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
                            active ? 'bg-blue-50' : 'hover:bg-gray-50'
                          )}
                        >
                          <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                            active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                          )}>
                            {initials || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn('text-sm font-semibold truncate', active ? 'text-blue-700' : 'text-gray-900')}>
                              {surgeon.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{surgeon.specialization}</p>
                          </div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex-shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            Available
                          </span>
                          {active && <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {/* Selected surgeon chip shown when dropdown is closed */}
          {selectedSurgeon && !surgeonDropdownOpen && (() => {
            const s = surgeons.find(x => x.id === selectedSurgeon);
            if (!s) return null;
            const initials = s.name.trim().split(/\s+/).slice(0, 2).map((n: string) => n[0]).join('').toUpperCase();
            return (
              <div className="mt-2 flex items-center gap-2.5 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-blue-800 truncate">{s.name}</p>
                  <p className="text-xs text-blue-500 truncate">{s.specialization}</p>
                </div>
                <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
              </div>
            );
          })()}
        </Section>

      </div>

      {/* ══ RIGHT PANEL: Calendar + Time Slots + Instructions + Confirm ══════ */}
      <div className="w-1/2 flex flex-col gap-3 overflow-y-auto hide-scrollbar">

        {/* ── Section 3: Calendar ──────────────────────────────────────────── */}
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-b border-gray-200">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-800 flex-1">Surgery Date</span>
            {selectedDate && wantToSchedule && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            <span className="text-[11px] text-gray-400 mr-1.5">Optional</span>
            <button
              onClick={() => {
                setWantToSchedule(v => !v);
                if (wantToSchedule) { setSelectedDate(null); setSelectedTimeSlot(''); }
              }}
              className={`relative flex-shrink-0 w-10 h-5 rounded-full transition-colors duration-200 ${wantToSchedule ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${wantToSchedule ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="p-3">
          {!wantToSchedule ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2 text-gray-400">
              <Calendar className="w-10 h-10 text-gray-200" />
              <p className="text-xs font-medium text-gray-400">Enable toggle to schedule a date</p>
            </div>
          ) : (
            <>
          {/* Month navigator */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => canGoPrev && navigateMonth(-1)}
              disabled={!canGoPrev}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                canGoPrev ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-gray-900">
              {MONTH_NAMES[calendarMonth.month]} {calendarMonth.year}
            </span>
            <button
              onClick={() => canGoNext && navigateMonth(1)}
              disabled={!canGoNext}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                canGoNext ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-center text-[11px] font-semibold text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {calendarGrid.map((date, idx) => {
              if (!date) return <div key={`e-${idx}`} />;

              const isPast = date < today;
              const isToday = date.getTime() === today.getTime();
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              const isSunday = date.getDay() === 0;
              const status = isPast || isSunday ? 'closed' : getDayStatus(date);

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => status !== 'closed' && !isPast && setSelectedDate(date)}
                  disabled={status === 'closed' || isPast}
                  className={cn(
                    'relative flex flex-col items-center justify-center py-1.5 rounded-lg transition-all duration-150 group',
                    isSelected && 'bg-blue-600 shadow-md shadow-blue-200',
                    !isSelected && !isPast && status !== 'closed' && 'hover:bg-blue-50',
                    isToday && !isSelected && 'ring-2 ring-inset ring-blue-400',
                    (isPast || status === 'closed') && 'cursor-not-allowed opacity-35',
                  )}
                >
                  <span className={cn(
                    'text-xs font-semibold leading-none',
                    isSelected ? 'text-white' : isPast || isSunday ? 'text-gray-400' : 'text-gray-800'
                  )}>
                    {date.getDate()}
                  </span>
                  {/* Availability dot */}
                  {!isPast && status !== 'closed' && (
                    <span className={cn(
                      'mt-0.5 w-1 h-1 rounded-full',
                      isSelected ? 'bg-white/60' :
                        status === 'available' ? 'bg-green-500' :
                          status === 'limited' ? 'bg-amber-400' :
                            'bg-red-400'
                    )} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-100">
            <LegendItem color="bg-green-500" label="Available" />
            <LegendItem color="bg-amber-400" label="Limited" />
            <LegendItem color="bg-red-400" label="Full" />
            <LegendItem color="bg-gray-200" label="Closed" />
          </div>
            </>
          )}
          </div>
        </div>

        {/* ── Section 4: Time Slots (only after date selected & toggle on) ─── */}
        {wantToSchedule && selectedDate && (
          <Section icon={<Clock className="h-4 w-4 text-blue-600" />} title="Operating Time Slot" done={!!selectedTimeSlot}>
            {/* Morning */}
            {morningSlots.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sun className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Morning</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {morningSlots.map(slot => (
                    <TimeSlotButton
                      key={slot.id}
                      slot={slot}
                      selected={selectedTimeSlot === slot.id}
                      onClick={() => slot.available && setSelectedTimeSlot(slot.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Afternoon */}
            {afternoonSlots.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Sunset className="h-3.5 w-3.5 text-orange-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Afternoon</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {afternoonSlots.map(slot => (
                    <TimeSlotButton
                      key={slot.id}
                      slot={slot}
                      selected={selectedTimeSlot === slot.id}
                      onClick={() => slot.available && setSelectedTimeSlot(slot.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </Section>
        )}

        {/* ── Pre-Surgery Instructions (collapsible) ───────────────────────── */}
        <div className="border border-amber-200 bg-amber-50 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowInstructions(v => !v)}
            className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-amber-100/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800">Pre-Surgery Patient Instructions</span>
            </div>
            <ChevronRight className={cn(
              'h-4 w-4 text-amber-500 transition-transform duration-200',
              showInstructions && 'rotate-90'
            )} />
          </button>
          {showInstructions && (
            <div className="px-3 pb-3 space-y-2 border-t border-amber-200">
              {PRE_SURGERY_INSTRUCTIONS.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 pt-2">
                  <span className="text-base leading-none flex-shrink-0">{item.icon}</span>
                  <span className="text-xs text-amber-900 leading-relaxed">{item.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Confirm / Status ─────────────────────────────────────────────── */}
        <div className="mt-auto">
          {isScheduleComplete ? (
            <button
              onClick={() => onDataChange?.({
                surgeryDate: selectedDate!.toISOString(),
                timeSlot: selectedTimeSlot,
                surgeonId: selectedSurgeon,
                surgeonName: surgeonSearch,
                eye: selectedEye,
                confirmed: true,
              })}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
            >
              <CheckCheck className="h-4 w-4" />
              Confirm Surgery Date &amp; Time
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-gray-50 border border-dashed border-gray-300 rounded-xl px-3 py-2.5">
              <AlertCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <p className="text-xs text-gray-500">
                {!selectedDate && !selectedTimeSlot
                  ? 'Select a surgery date and time slot to continue'
                  : !selectedTimeSlot
                  ? 'Select a time slot to continue'
                  : 'Select a surgeon to continue'}
              </p>
            </div>
          )}
        </div>

      </div>

      </div>
    </div>
  );
}

// ── Helper sub-components ────────────────────────────────────────────────────

function Section({
  icon,
  title,
  done,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-b border-gray-200">
        {icon}
        <span className="text-sm font-semibold text-gray-800 flex-1">{title}</span>
        {done && <CheckCircle2 className="h-4 w-4 text-green-500" />}
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

function SummaryChip({
  icon,
  label,
  value,
  done,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  done: boolean;
}) {
  return (
    <div className={cn(
      'flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-left',
      done && value !== '—' ? 'border-blue-200 bg-white' : 'border-dashed border-gray-200 bg-white/60'
    )}>
      <span className={done && value !== '—' ? 'text-blue-500' : 'text-gray-300'}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400 leading-none mb-0.5">{label}</p>
        <p className={cn(
          'text-[11px] font-semibold truncate leading-tight',
          done && value !== '—' ? 'text-gray-800' : 'text-gray-300'
        )}>{value}</p>
      </div>
    </div>
  );
}

function TimeSlotButton({
  slot,
  selected,
  onClick,
}: {
  slot: TimeSlot;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!slot.available}
      className={cn(
        'relative flex flex-col items-center justify-center py-3 px-2 rounded-xl border-2 transition-all duration-200',
        selected && 'border-blue-500 bg-blue-600 shadow-md shadow-blue-100',
        !selected && slot.available && 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50',
        !slot.available && 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50',
      )}
    >
      <span className={cn('text-sm font-bold', selected ? 'text-white' : 'text-gray-800')}>
        {slot.time}
      </span>
      <span className={cn('text-[11px] mt-0.5', selected ? 'text-blue-100' : 'text-gray-400')}>
        {slot.label}
      </span>
      {!slot.available && (
        <span className="absolute top-1 right-1 text-[9px] font-bold text-red-400 bg-red-50 px-1 rounded">
          FULL
        </span>
      )}
      {selected && (
        <span className="absolute top-1.5 right-1.5">
          <CheckCircle2 className="h-3 w-3 text-blue-200" />
        </span>
      )}
    </button>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className={cn('w-2 h-2 rounded-full flex-shrink-0', color)} />
      <span className="text-[10px] text-gray-500">{label}</span>
    </div>
  );
}
