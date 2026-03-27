'use client';

import React, { useState } from 'react';
import type { ReactElement } from 'react';
import { getApi } from '@/lib/api';
import { Search, Calendar, DollarSign, MapPin, User, Clock, CheckCircle, XCircle } from 'lucide-react';

interface DoctorAvailability {
  id: string;
  name: string;
  specialization: string;
  department: string;
  available: boolean;
  nextAvailableSlot?: string;
  roomNumber?: string;
  currentPatientCount?: number;
}

interface AppointmentSlot {
  date: string;
  time: string;
  available: boolean;
  doctorName: string;
  roomNumber: string;
}

interface ProcedurePricing {
  id: string;
  procedureName: string;
  category: string;
  basePrice: number;
  discountedPrice?: number;
  duration: string;
  description: string;
}

type TabType = 'doctor-availability' | 'appointment-calendar' | 'procedure-pricing' | 'department-location';

export default function InquiryPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('doctor-availability');
  const [loading, setLoading] = useState(false);

  // Doctor Availability Search
  const [doctorSearch, setDoctorSearch] = useState('');
  const [doctorResults, setDoctorResults] = useState<DoctorAvailability[]>([]);

  // Appointment Calendar
  const [appointmentDate, setAppointmentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [appointmentDepartment, setAppointmentDepartment] = useState('');
  const [appointmentSlots, setAppointmentSlots] = useState<AppointmentSlot[]>([]);

  // Procedure Pricing
  const [procedureSearch, setProcedureSearch] = useState('');
  const [procedureResults, setProcedureResults] = useState<ProcedurePricing[]>([]);

  // Search doctor availability
  const handleDoctorSearch = async () => {
    if (!doctorSearch.trim()) return;
    
    setLoading(true);
    try {
      const api = getApi();
      const response = await api.get(`/users/doctors/availability?search=${doctorSearch}`);
      setDoctorResults(response.data || []);
    } catch (error) {
      console.error('Failed to fetch doctor availability:', error);
      setDoctorResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Search appointment slots
  const handleAppointmentSearch = async () => {
    setLoading(true);
    try {
      const api = getApi();
      const response = await api.get(
        `/appointments/availability?date=${appointmentDate}&department=${appointmentDepartment}`
      );
      setAppointmentSlots(response.data || []);
    } catch (error) {
      console.error('Failed to fetch appointment slots:', error);
      setAppointmentSlots([]);
    } finally {
      setLoading(false);
    }
  };

  // Search procedure pricing
  const handleProcedureSearch = async () => {
    if (!procedureSearch.trim()) return;
    
    setLoading(true);
    try {
      const api = getApi();
      const response = await api.get(`/procedures/pricing?search=${procedureSearch}`);
      setProcedureResults(response.data || []);
    } catch (error) {
      console.error('Failed to fetch procedure pricing:', error);
      setProcedureResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="bg-white rounded-lg border border-slate-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">Inquiry Panel</h2>
        <p className="text-sm text-slate-600 mt-0.5">Quick information lookup for patients and visitors</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 px-6">
        <button
          onClick={() => setActiveTab('doctor-availability')}
          className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'doctor-availability'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Doctor Availability
        </button>
        <button
          onClick={() => setActiveTab('appointment-calendar')}
          className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'appointment-calendar'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Appointment Calendar
        </button>
        <button
          onClick={() => setActiveTab('procedure-pricing')}
          className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'procedure-pricing'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Procedure Pricing
        </button>
        <button
          onClick={() => setActiveTab('department-location')}
          className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'department-location'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Department Locations
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Doctor Availability Tab */}
        {activeTab === 'doctor-availability' && (
          <div>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleDoctorSearch()}
                placeholder="Search by doctor name or specialization..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <button
                onClick={handleDoctorSearch}
                disabled={loading || !doctorSearch.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {loading && (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm text-slate-600">Searching...</p>
              </div>
            )}

            {!loading && doctorResults.length > 0 && (
              <div className="space-y-3">
                {doctorResults.map((doctor) => (
                  <div key={doctor.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {doctor.specialization} | {doctor.department}
                        </p>
                        {doctor.roomNumber && (
                          <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            Room: {doctor.roomNumber}
                          </p>
                        )}
                        {doctor.currentPatientCount !== undefined && (
                          <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                            <User className="w-4 h-4" />
                            Patients waiting: {doctor.currentPatientCount}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {doctor.available ? (
                          <div className="flex items-center gap-2 text-emerald-700 bg-emerald-100 px-3 py-2 rounded-lg">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-semibold">Available Now</span>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2 text-red-700 bg-red-100 px-3 py-2 rounded-lg mb-2">
                              <XCircle className="w-5 h-5" />
                              <span className="font-semibold">Not Available</span>
                            </div>
                            {doctor.nextAvailableSlot && (
                              <p className="text-sm text-gray-600">
                                Next available: {new Date(doctor.nextAvailableSlot).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && doctorSearch && doctorResults.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <User className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p className="text-lg">No doctors found matching "{doctorSearch}"</p>
              </div>
            )}
          </div>
        )}

        {/* Appointment Calendar Tab */}
        {activeTab === 'appointment-calendar' && (
          <div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <select
                value={appointmentDepartment}
                onChange={(e) => setAppointmentDepartment(e.target.value)}
                className="border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">All Departments</option>
                <option value="Ophthalmology">Ophthalmology</option>
                <option value="Optometry">Optometry</option>
                <option value="Cataract">Cataract</option>
                <option value="Retina">Retina</option>
                <option value="Glaucoma">Glaucoma</option>
              </select>
              <button
                onClick={handleAppointmentSearch}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Search className="inline w-4 h-4 mr-2" />
                {loading ? 'Searching...' : 'Search Slots'}
              </button>
            </div>

            {loading && (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm text-slate-600">Loading appointment slots...</p>
              </div>
            )}

            {!loading && appointmentSlots.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {appointmentSlots.map((slot, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-3 text-center ${
                      slot.available ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300 bg-slate-50'
                    }`}
                  >
                    <div className="text-base font-bold mb-2">{slot.time}</div>
                    <div className="text-sm text-slate-700 mb-1">{slot.doctorName}</div>
                    <div className="text-xs text-slate-600">Room: {slot.roomNumber}</div>
                    <div className={`mt-2 text-xs font-semibold ${slot.available ? 'text-emerald-700' : 'text-slate-700'}`}>
                      {slot.available ? '✓ Available' : '✗ Booked'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && appointmentSlots.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <Calendar className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p className="text-base">No appointment slots available for selected date and department</p>
              </div>
            )}
          </div>
        )}

        {/* Procedure Pricing Tab */}
        {activeTab === 'procedure-pricing' && (
          <div>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={procedureSearch}
                onChange={(e) => setProcedureSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleProcedureSearch()}
                placeholder="Search procedure name or category..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <button
                onClick={handleProcedureSearch}
                disabled={loading || !procedureSearch.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {loading && (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm text-slate-600">Searching procedures...</p>
              </div>
            )}

            {!loading && procedureResults.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Procedure Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Duration</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Base Price</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Discounted Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {procedureResults.map((procedure) => (
                      <tr key={procedure.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{procedure.procedureName}</div>
                          {procedure.description && (
                            <div className="text-sm text-slate-600 mt-1">{procedure.description}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">{procedure.category}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {procedure.duration}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-slate-700">₹{procedure.basePrice.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">
                          {procedure.discountedPrice ? (
                            <div>
                              <div className="text-sm font-semibold text-emerald-700">
                                ₹{procedure.discountedPrice.toLocaleString()}
                              </div>
                              <div className="text-xs text-slate-500 line-through">
                                ₹{procedure.basePrice.toLocaleString()}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-500">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && procedureSearch && procedureResults.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <DollarSign className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p className="text-base">No procedures found matching "{procedureSearch}"</p>
              </div>
            )}
          </div>
        )}

        {/* Department Locations Tab */}
        {activeTab === 'department-location' && (
          <div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
              <MapPin className="w-16 h-16 text-amber-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Department Location Map</h3>
              <p className="text-sm text-slate-600 mb-4">Interactive hospital floor map showing department locations</p>
              <p className="text-sm text-amber-700 font-medium">🚧 Coming Soon - Feature under development</p>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
