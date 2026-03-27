'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Tent } from 'lucide-react';
import { counsellorsDeskApi } from '@/lib/api/counsellors-desk.api';
import { StatusBadge } from '@/components/counsellors-desk/StatusBadge';
import type { WardPatient, WardStatus } from '@/types/counsellors-desk';

const STATUS_TABS: { key: WardStatus | 'All'; label: string }[] = [
  { key: 'All', label: 'All' },
  { key: 'Expected', label: 'Expected' },
  { key: 'Admitted', label: 'Admitted' },
  { key: 'ReadyForSurgery', label: 'Ready for Surgery' },
  { key: 'SurgeryDone', label: 'Surgery Done' },
  { key: 'Discharged', label: 'Discharged' },
];

const STAT_CARDS: { key: WardStatus | 'All'; label: string; bg: string; icon: string }[] = [
  { key: 'Expected', label: 'Expected', bg: 'bg-sky-50 text-sky-700', icon: '🕐' },
  { key: 'Admitted', label: 'Admitted', bg: 'bg-cyan-50 text-cyan-700', icon: '🛏️' },
  { key: 'ReadyForSurgery', label: 'Ready for Surgery', bg: 'bg-teal-50 text-teal-700', icon: '✅' },
  { key: 'SurgeryDone', label: 'Surgery Done', bg: 'bg-green-50 text-green-700', icon: '🩺' },
  { key: 'Discharged', label: 'Discharged', bg: 'bg-gray-50 text-gray-700', icon: '🚪' },
];

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100">
      {Array.from({ length: 12 }).map((_, i) => (
        <td key={i} className="px-3 py-3">
          <div className="h-3 bg-gray-200 rounded animate-pulse" style={{ width: `${50 + Math.random() * 35}%` }} />
        </td>
      ))}
    </tr>
  );
}

export default function WardManagementPage() {
  const [patients, setPatients] = useState<WardPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<WardStatus | 'All'>('All');
  const [filters, setFilters] = useState({ surgeryDate: '', showDischarged: false });
  const [appliedFilters, setAppliedFilters] = useState({ surgeryDate: '', showDischarged: false });

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const data = await counsellorsDeskApi.getWardPatients(appliedFilters);
        setPatients(data);
      } catch {
        // tolerate API failure; data is empty
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSearch = async () => {
    setAppliedFilters(filters);
    setIsLoading(true);
    try {
      const data = await counsellorsDeskApi.getWardPatients(filters);
      setPatients(data);
    } catch {
      // tolerate
    } finally {
      setIsLoading(false);
    }
  };

  const displayPatients = useMemo(() => {
    let list = patients;
    if (!appliedFilters.showDischarged) list = list.filter(p => p.status !== 'Discharged');
    if (activeTab !== 'All') list = list.filter(p => p.status === activeTab);
    return list;
  }, [patients, activeTab, appliedFilters.showDischarged]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    STATUS_TABS.forEach(({ key }) => {
      map[key] = key === 'All' ? patients.length : patients.filter(p => p.status === key).length;
    });
    return map;
  }, [patients]);

  const statCounts = useMemo(() => {
    const map: Record<string, number> = {};
    STAT_CARDS.forEach(({ key }) => {
      map[key] = patients.filter(p => p.status === key).length;
    });
    return map;
  }, [patients]);

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Tent className="h-5 w-5 text-blue-600" />
          Ward Management
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Monitor all inpatient ward activity</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {STAT_CARDS.map(({ key, label, bg, icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`
              rounded-xl p-4 text-left border transition-all
              ${activeTab === key ? `${bg} border-current shadow-sm` : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'}
            `}
          >
            <div className="text-2xl mb-1">{icon}</div>
            <p className="text-2xl font-bold">{statCounts[key] ?? 0}</p>
            <p className="text-xs font-medium mt-0.5 text-gray-600">{label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Surgery Date</label>
            <input
              type="date"
              value={filters.surgeryDate}
              onChange={(e) => setFilters(f => ({ ...f, surgeryDate: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none pb-2">
            <div
              onClick={() => setFilters(f => ({ ...f, showDischarged: !f.showDischarged }))}
              className={`relative w-10 h-5 rounded-full transition-colors ${filters.showDischarged ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${filters.showDischarged ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm text-gray-700 font-medium">Show Discharged</span>
          </label>
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Status Tabs */}
        <div className="flex items-center px-4 pt-4 pb-0 overflow-x-auto gap-1">
          {STATUS_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`
                flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap border-b-2 transition-colors
                ${activeTab === key
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
              `}
            >
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${activeTab === key ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {counts[key] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Sl No</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">MR No</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Patient Name</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Diagnosis</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Procedure</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Surgeon</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Package</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Room</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Admission Time</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                : displayPatients.length === 0
                ? (
                  <tr>
                    <td colSpan={11} className="py-14 text-center text-gray-400">
                      <Tent className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No patients found in this category</p>
                    </td>
                  </tr>
                )
                : displayPatients.map((p, idx) => (
                  <tr
                    key={p.id}
                    className={`
                      transition-colors
                      ${p.status === 'SurgeryDone' ? 'bg-green-50 border-l-4 border-l-green-500' : 'hover:bg-gray-50'}
                    `}
                  >
                    <td className="px-3 py-3"><StatusBadge status={p.status} size="sm" /></td>
                    <td className="px-3 py-3 text-gray-500 text-xs">{idx + 1}</td>
                    <td className="px-3 py-3 font-mono text-xs text-blue-700 font-medium">{p.mrNo}</td>
                    <td className="px-3 py-3 font-medium text-gray-900 whitespace-nowrap">{p.patientName}</td>
                    <td className="px-3 py-3 text-gray-600 text-xs">{p.diagnosis}</td>
                    <td className="px-3 py-3 text-gray-700 text-xs whitespace-nowrap">{p.procedureName}</td>
                    <td className="px-3 py-3 text-gray-700 text-xs whitespace-nowrap">{p.surgeon}</td>
                    <td className="px-3 py-3 text-gray-600 text-xs whitespace-nowrap">{p.package}</td>
                    <td className="px-3 py-3 text-gray-600 text-xs">{p.room}</td>
                    <td className="px-3 py-3 text-gray-500 text-xs whitespace-nowrap">{p.admissionTime}</td>
                    <td className="px-3 py-3 text-gray-500 text-xs max-w-[160px] truncate" title={p.remarks}>{p.remarks}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!isLoading && displayPatients.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Showing <span className="font-medium">{displayPatients.length}</span> of <span className="font-medium">{patients.length}</span> patients
            </p>
            <div className="flex gap-1">
              <button className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40" disabled>← Prev</button>
              <span className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg font-medium">1</span>
              <button className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40" disabled>Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
