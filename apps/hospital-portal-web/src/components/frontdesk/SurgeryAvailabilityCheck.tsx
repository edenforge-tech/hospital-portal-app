'use client';

import React, { useState, useEffect } from 'react';
import { getApi } from '@/lib/api';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Send } from 'lucide-react';

interface Surgeon {
  id: string;
  name: string;
  specialization: string;
  email: string;
  phone: string;
}

interface OTSlot {
  id: string;
  otNumber: string;
  startTime: string;
  endTime: string;
  available: boolean;
  surgeonName?: string;
  procedureName?: string;
  patientName?: string;
  duration: number; // minutes
}

type ModeType = 'quick-note' | 'direct-support';

export default function SurgeryAvailabilityCheck() {
  const [surgeons, setSurgeons] = useState<Surgeon[]>([]);
  const [selectedSurgeonId, setSelectedSurgeonId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [otSlots, setOtSlots] = useState<OTSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<ModeType>('quick-note');
  
  // Quick Note Form
  const [quickNoteData, setQuickNoteData] = useState({
    patientName: '',
    patientMobile: '',
    procedureType: '',
    urgency: 'routine',
    notes: '',
  });
  
  // Direct Support Form
  const [directSupportData, setDirectSupportData] = useState({
    patientName: '',
    patientMobile: '',
    procedureType: '',
    preferredDate: new Date().toISOString().split('T')[0],
    preferredTime: '',
    specialInstructions: '',
  });

  useEffect(() => {
    fetchSurgeons();
  }, []);

  useEffect(() => {
    if (selectedSurgeonId && selectedDate) {
      fetchOTAvailability();
    }
  }, [selectedSurgeonId, selectedDate]);

  const fetchSurgeons = async () => {
    try {
      const api = getApi();
      const response = await api.get('/users/surgeons'); // Backend API to implement
      setSurgeons(response.data || []);
    } catch (error) {
      console.error('Failed to fetch surgeons:', error);
    }
  };

  const fetchOTAvailability = async () => {
    setLoading(true);
    try {
      const api = getApi();
      const response = await api.get(`/ot/availability?surgeonId=${selectedSurgeonId}&date=${selectedDate}`);
      setOtSlots(response.data || []);
    } catch (error) {
      console.error('Failed to fetch OT availability:', error);
      setOtSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickNoteToCounselor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const api = getApi();
      await api.post('/surgery/quick-note', {
        ...quickNoteData,
        surgeonId: selectedSurgeonId,
        requestDate: new Date().toISOString(),
      });
      
      alert('Quick note sent to counselor successfully!');
      setQuickNoteData({
        patientName: '',
        patientMobile: '',
        procedureType: '',
        urgency: 'routine',
        notes: '',
      });
    } catch (error) {
      console.error('Failed to send quick note:', error);
      alert('Failed to send quick note. Please try again.');
    }
  };

  const handleDirectDoctorSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const api = getApi();
      await api.post('/surgery/direct-request', {
        ...directSupportData,
        surgeonId: selectedSurgeonId,
        requestDate: new Date().toISOString(),
      });
      
      alert('Surgery request sent to doctor successfully!');
      setDirectSupportData({
        patientName: '',
        patientMobile: '',
        procedureType: '',
        preferredDate: new Date().toISOString().split('T')[0],
        preferredTime: '',
        specialInstructions: '',
      });
    } catch (error) {
      console.error('Failed to send direct request:', error);
      alert('Failed to send request. Please try again.');
    }
  };

  const selectedSurgeon = surgeons.find((s) => s.id === selectedSurgeonId);
  const availableSlots = otSlots.filter((slot) => slot.available);
  const bookedSlots = otSlots.filter((slot) => !slot.available);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6 rounded-t-lg">
        <h2 className="text-2xl font-bold mb-1">Surgery Availability Check</h2>
        <p className="text-teal-100">Check OT schedule and request surgery appointments</p>
      </div>

      <div className="p-6">
        {/* Surgeon & Date Selection */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Surgeon <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedSurgeonId}
              onChange={(e) => setSelectedSurgeonId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Choose a surgeon...</option>
              {surgeons.map((surgeon) => (
                <option key={surgeon.id} value={surgeon.id}>
                  {surgeon.name} - {surgeon.specialization}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Surgeon Info */}
        {selectedSurgeon && (
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-4">
              <User className="w-10 h-10 text-teal-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{selectedSurgeon.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedSurgeon.specialization}</p>
                <div className="flex items-center gap-6 mt-2 text-sm text-gray-600">
                  <span>📧 {selectedSurgeon.email}</span>
                  <span>📞 {selectedSurgeon.phone}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OT Schedule */}
        {selectedSurgeonId && selectedDate && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              OT Schedule - {new Date(selectedDate).toLocaleDateString()}
            </h3>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading OT schedule...</p>
              </div>
            ) : otSlots.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p className="text-lg">No OT slots available for this date</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {otSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`border rounded-lg p-4 ${
                      slot.available
                        ? 'border-emerald-300 bg-emerald-50'
                        : 'border-red-300 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-slate-900">OT {slot.otNumber}</span>
                      {slot.available ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Clock className="w-4 h-4" />
                        {slot.startTime} - {slot.endTime}
                      </div>
                      <div className="text-slate-600">Duration: {slot.duration} min</div>
                      {!slot.available && (
                        <div className="mt-3 pt-3 border-t border-red-200">
                          <div className="text-xs text-slate-600">
                            <div className="font-semibold text-slate-900">{slot.procedureName}</div>
                            <div className="mt-1">Patient: {slot.patientName}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            {otSlots.length > 0 && (
              <div className="mt-4 flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                  <span className="text-slate-700">Available: {availableSlots.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-slate-700">Booked: {bookedSlots.length}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mode Selector */}
        {selectedSurgeonId && (
          <>
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Surgery Appointment</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setMode('quick-note')}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    mode === 'quick-note'
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-gray-200 hover:border-teal-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Send className="w-6 h-6 text-teal-600" />
                    <h4 className="font-semibold text-gray-900">Quick Note to Counselor</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Send a brief note to counselor for follow-up and scheduling
                  </p>
                </button>

                <button
                  onClick={() => setMode('direct-support')}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    mode === 'direct-support'
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-gray-200 hover:border-teal-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-6 h-6 text-teal-600" />
                    <h4 className="font-semibold text-gray-900">Direct Doctor Support</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Send detailed request directly to doctor for urgent cases
                  </p>
                </button>
              </div>
            </div>

            {/* Quick Note Form */}
            {mode === 'quick-note' && (
              <form onSubmit={handleQuickNoteToCounselor} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">Quick Note to Counselor</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={quickNoteData.patientName}
                      onChange={(e) => setQuickNoteData({ ...quickNoteData, patientName: e.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={quickNoteData.patientMobile}
                      onChange={(e) => setQuickNoteData({ ...quickNoteData, patientMobile: e.target.value })}
                      required
                      pattern="[0-9]{10}"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Procedure Type <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={quickNoteData.procedureType}
                      onChange={(e) => setQuickNoteData({ ...quickNoteData, procedureType: e.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Urgency <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={quickNoteData.urgency}
                      onChange={(e) => setQuickNoteData({ ...quickNoteData, urgency: e.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="routine">Routine</option>
                      <option value="urgent">Urgent</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                    <textarea
                      value={quickNoteData.notes}
                      onChange={(e) => setQuickNoteData({ ...quickNoteData, notes: e.target.value })}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-4 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Send to Counselor
                </button>
              </form>
            )}

            {/* Direct Support Form */}
            {mode === 'direct-support' && (
              <form onSubmit={handleDirectDoctorSupport} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">Direct Doctor Support Request</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={directSupportData.patientName}
                      onChange={(e) => setDirectSupportData({ ...directSupportData, patientName: e.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={directSupportData.patientMobile}
                      onChange={(e) => setDirectSupportData({ ...directSupportData, patientMobile: e.target.value })}
                      required
                      pattern="[0-9]{10}"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Procedure Type <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={directSupportData.procedureType}
                      onChange={(e) => setDirectSupportData({ ...directSupportData, procedureType: e.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={directSupportData.preferredDate}
                      onChange={(e) => setDirectSupportData({ ...directSupportData, preferredDate: e.target.value })}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time (Optional)</label>
                    <input
                      type="time"
                      value={directSupportData.preferredTime}
                      onChange={(e) => setDirectSupportData({ ...directSupportData, preferredTime: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      value={directSupportData.specialInstructions}
                      onChange={(e) =>
                        setDirectSupportData({ ...directSupportData, specialInstructions: e.target.value })
                      }
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <strong>Note:</strong> This request will be sent directly to the doctor. Please ensure all details
                    are accurate and complete.
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-4 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Send to Doctor
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
