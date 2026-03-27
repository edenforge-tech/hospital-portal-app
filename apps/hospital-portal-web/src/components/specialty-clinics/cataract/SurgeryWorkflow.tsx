'use client';

import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Eye,
  Activity,
  FileText,
  Zap,
  TrendingUp,
} from 'lucide-react';

interface PreOpChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  required: boolean;
}

interface SurgerySchedule {
  surgeryDate: string;
  surgeryTime: string;
  otRoom: string;
  surgeon: string;
  anesthetist: string;
  otNurse: string;
  duration: number; // minutes
  equipmentChecked: boolean;
}

interface IntraOpNotes {
  surgeryType: string;
  iolImplanted: {
    manufacturer: string;
    model: string;
    power: number;
    serialNumber: string;
  };
  incisionType: string;
  complications: string[];
  notes: string;
  surgeryDuration: number; // minutes
}

interface PostOpReview {
  day1: { completed: boolean; date: string; va: string; iop: number; notes: string };
  week1: { completed: boolean; date: string; va: string; iop: number; notes: string };
  month1: { completed: boolean; date: string; va: string; refraction: string; notes: string };
  month3: { completed: boolean; date: string; va: string; refraction: string; notes: string };
}

interface PostOpComplication {
  type: string;
  detected: boolean;
  date: string;
  severity: string;
  treatment: string;
}

interface YAGCapsulotomy {
  performed: boolean;
  date: string;
  energyLevel: number; // mJ
  numberOfShots: number;
  preYagVA: string;
  postYagVA: string;
  complications: string;
}

interface SurgeryWorkflowData {
  preOpChecklist: PreOpChecklistItem[];
  schedule: SurgerySchedule;
  intraOp: IntraOpNotes;
  postOpReviews: PostOpReview;
  complications: PostOpComplication[];
  yagCapsulotomy: YAGCapsulotomy;
  surgicalEye: 'OD' | 'OS' | 'OU';
}

interface SurgeryWorkflowProps {
  initialData?: SurgeryWorkflowData;
  onSave?: (data: SurgeryWorkflowData) => void;
  canEdit?: boolean;
  surgicalEye?: 'OD' | 'OS' | 'OU';
}

export default function SurgeryWorkflow({
  initialData,
  onSave,
  canEdit = true,
  surgicalEye = 'OD',
}: SurgeryWorkflowProps) {
  const defaultChecklist: PreOpChecklistItem[] = [
    { id: '1', label: 'Visual Acuity documented', completed: false, required: true },
    { id: '2', label: 'LOCS III grading completed', completed: false, required: true },
    { id: '3', label: 'Biometry completed and verified', completed: false, required: true },
    { id: '4', label: 'IOL power calculated (multi-formula)', completed: false, required: true },
    { id: '5', label: 'IOL ordered and in stock', completed: false, required: true },
    { id: '6', label: 'Dilated fundus examination done', completed: false, required: true },
    { id: '7', label: 'IOP measured', completed: false, required: true },
    { id: '8', label: 'Informed consent signed', completed: false, required: true },
    { id: '9', label: 'Anesthesia clearance obtained', completed: false, required: true },
    { id: '10', label: 'Pre-op medications prescribed', completed: false, required: true },
  ];

  const [workflowData, setWorkflowData] = useState<SurgeryWorkflowData>(
    initialData || {
      preOpChecklist: defaultChecklist,
      schedule: {
        surgeryDate: '',
        surgeryTime: '',
        otRoom: '',
        surgeon: '',
        anesthetist: '',
        otNurse: '',
        duration: 30,
        equipmentChecked: false,
      },
      intraOp: {
        surgeryType: 'Phacoemulsification',
        iolImplanted: {
          manufacturer: 'Alcon',
          model: 'SA60AT',
          power: 22.0,
          serialNumber: '',
        },
        incisionType: 'Clear Corneal',
        complications: [],
        notes: '',
        surgeryDuration: 0,
      },
      postOpReviews: {
        day1: { completed: false, date: '', va: '', iop: 0, notes: '' },
        week1: { completed: false, date: '', va: '', iop: 0, notes: '' },
        month1: { completed: false, date: '', va: '', refraction: '', notes: '' },
        month3: { completed: false, date: '', va: '', refraction: '', notes: '' },
      },
      complications: [],
      yagCapsulotomy: {
        performed: false,
        date: '',
        energyLevel: 0,
        numberOfShots: 0,
        preYagVA: '',
        postYagVA: '',
        complications: '',
      },
      surgicalEye: surgicalEye,
    }
  );

  const [activeTab, setActiveTab] = useState<'preop' | 'schedule' | 'intraop' | 'postop' | 'complications' | 'yag'>('preop');

  const toggleChecklistItem = (id: string) => {
    setWorkflowData((prev) => ({
      ...prev,
      preOpChecklist: prev.preOpChecklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    }));
  };

  const getChecklistProgress = (): number => {
    const completed = workflowData.preOpChecklist.filter((item) => item.completed).length;
    return (completed / workflowData.preOpChecklist.length) * 100;
  };

  const isSurgeryReady = (): boolean => {
    return workflowData.preOpChecklist.every((item) => item.completed);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(workflowData);
    }
  };

  const complicationOptions = [
    'PCO (Posterior Capsule Opacification)',
    'CME (Cystoid Macular Edema)',
    'Endophthalmitis',
    'Retinal Detachment',
    'Refractive Surprise',
    'Corneal Edema',
    'IOL Dislocation',
    'Wound Leak',
    'Iris Prolapse',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Surgery Workflow</h3>
          <p className="text-sm text-gray-600">
            Pre-op to post-op cataract surgery management
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Surgical Eye</p>
          <p className="text-2xl font-bold text-purple-600">{workflowData.surgicalEye}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b-2 border-gray-200">
        {[
          { id: 'preop', label: 'Pre-Op Checklist', icon: CheckCircle },
          { id: 'schedule', label: 'Schedule', icon: Calendar },
          { id: 'intraop', label: 'Intra-Op', icon: Activity },
          { id: 'postop', label: 'Post-Op', icon: TrendingUp },
          { id: 'complications', label: 'Complications', icon: AlertTriangle },
          { id: 'yag', label: 'YAG Laser', icon: Zap },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-3 font-medium transition-all ${
              activeTab === tab.id
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-sm">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Pre-Op Checklist Tab */}
      {activeTab === 'preop' && (
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Checklist Progress</span>
              <span className="text-sm font-bold text-purple-600">
                {getChecklistProgress().toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-purple-600 h-4 rounded-full transition-all"
                style={{ width: `${getChecklistProgress()}%` }}
              />
            </div>
          </div>

          {/* Surgery Ready Status */}
          {isSurgeryReady() ? (
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-bold text-green-900">Patient Ready for Surgery</p>
                <p className="text-sm text-green-700">All pre-operative requirements completed</p>
              </div>
            </div>
          ) : (
            <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4 flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              <div>
                <p className="font-bold text-orange-900">Pre-Op Incomplete</p>
                <p className="text-sm text-orange-700">
                  Complete all checklist items before scheduling surgery
                </p>
              </div>
            </div>
          )}

          {/* Checklist Items */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-4 space-y-3">
            {workflowData.preOpChecklist.map((item) => (
              <label
                key={item.id}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  item.completed ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleChecklistItem(item.id)}
                  disabled={!canEdit}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <span
                  className={`flex-1 font-medium ${
                    item.completed ? 'text-green-900 line-through' : 'text-gray-900'
                  }`}
                >
                  {item.label}
                  {item.required && <span className="text-red-500 ml-1">*</span>}
                </span>
                {item.completed && <CheckCircle className="w-5 h-5 text-green-600" />}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Surgery Scheduling</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Surgery Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={workflowData.schedule.surgeryDate}
                  onChange={(e) =>
                    setWorkflowData((prev) => ({
                      ...prev,
                      schedule: { ...prev.schedule, surgeryDate: e.target.value },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Surgery Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={workflowData.schedule.surgeryTime}
                  onChange={(e) =>
                    setWorkflowData((prev) => ({
                      ...prev,
                      schedule: { ...prev.schedule, surgeryTime: e.target.value },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">OT Room</label>
                <select
                  value={workflowData.schedule.otRoom}
                  onChange={(e) =>
                    setWorkflowData((prev) => ({
                      ...prev,
                      schedule: { ...prev.schedule, otRoom: e.target.value },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select OT</option>
                  <option>OT 1</option>
                  <option>OT 2</option>
                  <option>OT 3</option>
                  <option>OT 4</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Surgeon</label>
                <input
                  type="text"
                  value={workflowData.schedule.surgeon}
                  onChange={(e) =>
                    setWorkflowData((prev) => ({
                      ...prev,
                      schedule: { ...prev.schedule, surgeon: e.target.value },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Anesthetist</label>
                <input
                  type="text"
                  value={workflowData.schedule.anesthetist}
                  onChange={(e) =>
                    setWorkflowData((prev) => ({
                      ...prev,
                      schedule: { ...prev.schedule, anesthetist: e.target.value },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">OT Nurse</label>
                <input
                  type="text"
                  value={workflowData.schedule.otNurse}
                  onChange={(e) =>
                    setWorkflowData((prev) => ({
                      ...prev,
                      schedule: { ...prev.schedule, otNurse: e.target.value },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={workflowData.schedule.duration}
                  onChange={(e) =>
                    setWorkflowData((prev) => ({
                      ...prev,
                      schedule: { ...prev.schedule, duration: parseInt(e.target.value) || 0 },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={workflowData.schedule.equipmentChecked}
                  onChange={(e) =>
                    setWorkflowData((prev) => ({
                      ...prev,
                      schedule: { ...prev.schedule, equipmentChecked: e.target.checked },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Equipment checklist verified (Phaco machine, IOL, viscoelastic, BSS, instruments)
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Intra-Op Tab */}
      {activeTab === 'intraop' && (
        <div className="space-y-4">
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Intra-Operative Notes</h4>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Surgery Type</label>
                <select
                  value={workflowData.intraOp.surgeryType}
                  onChange={(e) =>
                    setWorkflowData((prev) => ({
                      ...prev,
                      intraOp: { ...prev.intraOp, surgeryType: e.target.value },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option>Phacoemulsification</option>
                  <option>ECCE (Extracapsular)</option>
                  <option>SICS (Small Incision)</option>
                  <option>Femto-assisted</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Incision Type</label>
                <select
                  value={workflowData.intraOp.incisionType}
                  onChange={(e) =>
                    setWorkflowData((prev) => ({
                      ...prev,
                      intraOp: { ...prev.intraOp, incisionType: e.target.value },
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option>Clear Corneal</option>
                  <option>Scleral Tunnel</option>
                  <option>Limbal</option>
                </select>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg mb-4">
              <h5 className="font-semibold text-purple-900 mb-3">IOL Implanted</h5>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={workflowData.intraOp.iolImplanted.manufacturer}
                    onChange={(e) =>
                      setWorkflowData((prev) => ({
                        ...prev,
                        intraOp: {
                          ...prev.intraOp,
                          iolImplanted: { ...prev.intraOp.iolImplanted, manufacturer: e.target.value },
                        },
                      }))
                    }
                    disabled={!canEdit}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    value={workflowData.intraOp.iolImplanted.model}
                    onChange={(e) =>
                      setWorkflowData((prev) => ({
                        ...prev,
                        intraOp: {
                          ...prev.intraOp,
                          iolImplanted: { ...prev.intraOp.iolImplanted, model: e.target.value },
                        },
                      }))
                    }
                    disabled={!canEdit}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IOL Power (D)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={workflowData.intraOp.iolImplanted.power}
                    onChange={(e) =>
                      setWorkflowData((prev) => ({
                        ...prev,
                        intraOp: {
                          ...prev.intraOp,
                          iolImplanted: { ...prev.intraOp.iolImplanted, power: parseFloat(e.target.value) || 0 },
                        },
                      }))
                    }
                    disabled={!canEdit}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={workflowData.intraOp.iolImplanted.serialNumber}
                    onChange={(e) =>
                      setWorkflowData((prev) => ({
                        ...prev,
                        intraOp: {
                          ...prev.intraOp,
                          iolImplanted: { ...prev.intraOp.iolImplanted, serialNumber: e.target.value },
                        },
                      }))
                    }
                    disabled={!canEdit}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Surgery Duration (minutes)</label>
              <input
                type="number"
                value={workflowData.intraOp.surgeryDuration}
                onChange={(e) =>
                  setWorkflowData((prev) => ({
                    ...prev,
                    intraOp: { ...prev.intraOp, surgeryDuration: parseInt(e.target.value) || 0 },
                  }))
                }
                disabled={!canEdit}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Surgeon Notes</label>
              <textarea
                value={workflowData.intraOp.notes}
                onChange={(e) =>
                  setWorkflowData((prev) => ({
                    ...prev,
                    intraOp: { ...prev.intraOp, notes: e.target.value },
                  }))
                }
                disabled={!canEdit}
                rows={4}
                placeholder="Surgery details, techniques used, any intra-operative findings..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Post-Op Tab */}
      {activeTab === 'postop' && (
        <div className="space-y-4">
          {['day1', 'week1', 'month1', 'month3'].map((visit) => {
            const visitData = workflowData.postOpReviews[visit as keyof PostOpReview];
            const labels = {
              day1: 'Day 1 Post-Op',
              week1: 'Week 1 Post-Op',
              month1: 'Month 1 Post-Op',
              month3: 'Month 3 Post-Op',
            };

            return (
              <div
                key={visit}
                className={`bg-white border-2 rounded-lg p-4 ${
                  visitData.completed ? 'border-green-300 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-bold text-gray-900">{labels[visit as keyof typeof labels]}</h4>
                  {visitData.completed && (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={visitData.date}
                      onChange={(e) =>
                        setWorkflowData((prev) => ({
                          ...prev,
                          postOpReviews: {
                            ...prev.postOpReviews,
                            [visit]: { ...visitData, date: e.target.value },
                          },
                        }))
                      }
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Visual Acuity</label>
                    <input
                      type="text"
                      value={visitData.va}
                      onChange={(e) =>
                        setWorkflowData((prev) => ({
                          ...prev,
                          postOpReviews: {
                            ...prev.postOpReviews,
                            [visit]: { ...visitData, va: e.target.value },
                          },
                        }))
                      }
                      disabled={!canEdit}
                      placeholder="6/6"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  {(visit === 'day1' || visit === 'week1') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">IOP (mmHg)</label>
                      <input
                        type="number"
                        value={visitData.iop}
                        onChange={(e) =>
                          setWorkflowData((prev) => ({
                            ...prev,
                            postOpReviews: {
                              ...prev.postOpReviews,
                              [visit]: { ...visitData, iop: parseInt(e.target.value) || 0 },
                            },
                          }))
                        }
                        disabled={!canEdit}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  )}

                  {(visit === 'month1' || visit === 'month3') && 'refraction' in visitData && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Refraction</label>
                      <input
                        type="text"
                        value={visitData.refraction}
                        onChange={(e) =>
                          setWorkflowData((prev) => ({
                            ...prev,
                            postOpReviews: {
                              ...prev.postOpReviews,
                              [visit]: { ...visitData, refraction: e.target.value },
                            },
                          }))
                        }
                        disabled={!canEdit}
                        placeholder="-0.50 DS"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={visitData.notes}
                    onChange={(e) =>
                      setWorkflowData((prev) => ({
                        ...prev,
                        postOpReviews: {
                          ...prev.postOpReviews,
                          [visit]: { ...visitData, notes: e.target.value },
                        },
                      }))
                    }
                    disabled={!canEdit}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div className="mt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visitData.completed}
                      onChange={(e) =>
                        setWorkflowData((prev) => ({
                          ...prev,
                          postOpReviews: {
                            ...prev.postOpReviews,
                            [visit]: { ...visitData, completed: e.target.checked },
                          },
                        }))
                      }
                      disabled={!canEdit}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Mark as completed</span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Complications Tab */}
      {activeTab === 'complications' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
            <p className="text-sm text-blue-800">
              Track post-operative complications for quality assurance and patient management
            </p>
          </div>

          {complicationOptions.map((comp) => (
            <div key={comp} className="bg-white border-2 border-gray-200 rounded-lg p-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-red-600 rounded"
                  disabled={!canEdit}
                />
                <span className="flex-1 font-medium text-gray-900">{comp}</span>
              </label>
            </div>
          ))}
        </div>
      )}

      {/* YAG Laser Tab */}
      {activeTab === 'yag' && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start space-x-2">
            <Zap className="w-5 h-5 text-yellow-600 mt-0.5" />
            <p className="text-sm text-yellow-800">
              YAG laser capsulotomy for PCO (Posterior Capsule Opacification) treatment
            </p>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={workflowData.yagCapsulotomy.performed}
                    onChange={(e) =>
                      setWorkflowData((prev) => ({
                        ...prev,
                        yagCapsulotomy: { ...prev.yagCapsulotomy, performed: e.target.checked },
                      }))
                    }
                    disabled={!canEdit}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span className="font-medium text-gray-900">YAG Laser Capsulotomy Performed</span>
                </label>
              </div>

              {workflowData.yagCapsulotomy.performed && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={workflowData.yagCapsulotomy.date}
                      onChange={(e) =>
                        setWorkflowData((prev) => ({
                          ...prev,
                          yagCapsulotomy: { ...prev.yagCapsulotomy, date: e.target.value },
                        }))
                      }
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Energy Level (mJ)
                    </label>
                    <input
                      type="number"
                      value={workflowData.yagCapsulotomy.energyLevel}
                      onChange={(e) =>
                        setWorkflowData((prev) => ({
                          ...prev,
                          yagCapsulotomy: {
                            ...prev.yagCapsulotomy,
                            energyLevel: parseInt(e.target.value) || 0,
                          },
                        }))
                      }
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Shots
                    </label>
                    <input
                      type="number"
                      value={workflowData.yagCapsulotomy.numberOfShots}
                      onChange={(e) =>
                        setWorkflowData((prev) => ({
                          ...prev,
                          yagCapsulotomy: {
                            ...prev.yagCapsulotomy,
                            numberOfShots: parseInt(e.target.value) || 0,
                          },
                        }))
                      }
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pre-YAG VA</label>
                    <input
                      type="text"
                      value={workflowData.yagCapsulotomy.preYagVA}
                      onChange={(e) =>
                        setWorkflowData((prev) => ({
                          ...prev,
                          yagCapsulotomy: { ...prev.yagCapsulotomy, preYagVA: e.target.value },
                        }))
                      }
                      disabled={!canEdit}
                      placeholder="6/18"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Post-YAG VA</label>
                    <input
                      type="text"
                      value={workflowData.yagCapsulotomy.postYagVA}
                      onChange={(e) =>
                        setWorkflowData((prev) => ({
                          ...prev,
                          yagCapsulotomy: { ...prev.yagCapsulotomy, postYagVA: e.target.value },
                        }))
                      }
                      disabled={!canEdit}
                      placeholder="6/6"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complications
                    </label>
                    <textarea
                      value={workflowData.yagCapsulotomy.complications}
                      onChange={(e) =>
                        setWorkflowData((prev) => ({
                          ...prev,
                          yagCapsulotomy: { ...prev.yagCapsulotomy, complications: e.target.value },
                        }))
                      }
                      disabled={!canEdit}
                      rows={3}
                      placeholder="IOP spike, retinal detachment, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      {canEdit && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Save Surgery Workflow</span>
          </button>
        </div>
      )}
    </div>
  );
}
