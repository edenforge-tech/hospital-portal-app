'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { Camera, Eye, AlertTriangle, CheckCircle } from 'lucide-react';

interface RetinopathyScreeningData {
  id?: string;
  patientId: string;
  examinationDate: Date;
  examinerId: string;
  isDiabeticPatient: boolean;
  diabetesType?: '1' | '2' | 'Gestational';
  diabetesDuration?: number;
  hba1c?: number;
  fundusCamera: {
    type: 'Non-mydriatic' | 'Mydriatic' | 'Ultra-wide field' | 'Smartphone';
    manufacturer: string;
  };
  OD: {
    drSeverity: 'No DR' | 'Mild NPDR' | 'Moderate NPDR' | 'Severe NPDR' | 'PDR';
    dmeSeverity: 'No DME' | 'Mild DME' | 'Moderate DME' | 'Severe DME';
    microaneurysms: number;
    hemorrhages: 'None' | 'Few' | 'Moderate' | 'Severe';
    hardExudates: boolean;
    cottonWoolSpots: boolean;
    venousBeading: boolean;
    IRMA: boolean;
    neovascularization: boolean;
    referralNeeded: boolean;
  };
  OS: {
    drSeverity: 'No DR' | 'Mild NPDR' | 'Moderate NPDR' | 'Severe NPDR' | 'PDR';
    dmeSeverity: 'No DME' | 'Mild DME' | 'Moderate DME' | 'Severe DME';
    microaneurysms: number;
    hemorrhages: 'None' | 'Few' | 'Moderate' | 'Severe';
    hardExudates: boolean;
    cottonWoolSpots: boolean;
    venousBeading: boolean;
    IRMA: boolean;
    neovascularization: boolean;
    referralNeeded: boolean;
  };
  notes?: string;
}

interface RetinopathyScreeningFormProps {
  initialData: RetinopathyScreeningData | null;
  patientId: string;
  onSave: (data: RetinopathyScreeningData) => void;
  canEdit: boolean;
}

export default function RetinopathyScreeningForm({ initialData, patientId, onSave, canEdit }: RetinopathyScreeningFormProps) {
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState<RetinopathyScreeningData>({
    patientId,
    examinationDate: initialData?.examinationDate ? new Date(initialData.examinationDate) : new Date(),
    examinerId: user?.id || '',
    isDiabeticPatient: initialData?.isDiabeticPatient ?? true,
    diabetesType: initialData?.diabetesType || '2',
    diabetesDuration: initialData?.diabetesDuration || 0,
    hba1c: initialData?.hba1c || 0,
    fundusCamera: initialData?.fundusCamera || {
      type: 'Non-mydriatic',
      manufacturer: 'Topcon TRC-NW400',
    },
    OD: initialData?.OD || {
      drSeverity: 'No DR',
      dmeSeverity: 'No DME',
      microaneurysms: 0,
      hemorrhages: 'None',
      hardExudates: false,
      cottonWoolSpots: false,
      venousBeading: false,
      IRMA: false,
      neovascularization: false,
      referralNeeded: false,
    },
    OS: initialData?.OS || {
      drSeverity: 'No DR',
      dmeSeverity: 'No DME',
      microaneurysms: 0,
      hemorrhages: 'None',
      hardExudates: false,
      cottonWoolSpots: false,
      venousBeading: false,
      IRMA: false,
      neovascularization: false,
      referralNeeded: false,
    },
    notes: initialData?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'No DR':
      case 'No DME':
        return 'bg-green-100 text-green-800';
      case 'Mild NPDR':
      case 'Mild DME':
        return 'bg-yellow-100 text-yellow-800';
      case 'Moderate NPDR':
      case 'Moderate DME':
        return 'bg-orange-100 text-orange-800';
      case 'Severe NPDR':
      case 'Severe DME':
      case 'PDR':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Patient Diabetes Information */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-md font-semibold text-yellow-900 mb-3 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Patient Diabetes Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isDiabeticPatient}
                onChange={(e) => setFormData({ ...formData, isDiabeticPatient: e.target.checked })}
                disabled={!canEdit}
                className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Diabetic Patient</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diabetes Type
            </label>
            <select
              value={formData.diabetesType || ''}
              onChange={(e) => setFormData({ ...formData, diabetesType: e.target.value as any })}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:bg-gray-100"
            >
              <option value="1">Type 1 (IDDM)</option>
              <option value="2">Type 2 (NIDDM)</option>
              <option value="Gestational">Gestational</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diabetes Duration (years)
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="80"
              value={formData.diabetesDuration || 0}
              onChange={(e) => setFormData({ ...formData, diabetesDuration: parseFloat(e.target.value) || 0 })}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              HbA1c (%) - Latest
            </label>
            <input
              type="number"
              step="0.1"
              min="4"
              max="15"
              value={formData.hba1c || 0}
              onChange={(e) => setFormData({ ...formData, hba1c: parseFloat(e.target.value) || 0 })}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">Target: {'<'}7%</p>
          </div>
        </div>
      </div>

      {/* Fundus Camera Configuration */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="text-md font-semibold text-purple-900 mb-3 flex items-center">
          <Camera className="h-5 w-5 mr-2" />
          Fundus Camera Configuration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Camera Type
            </label>
            <select
              value={formData.fundusCamera.type}
              onChange={(e) => setFormData({ 
                ...formData, 
                fundusCamera: { ...formData.fundusCamera, type: e.target.value as any }
              })}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
            >
              <option value="Non-mydriatic">Non-mydriatic (No dilation needed)</option>
              <option value="Mydriatic">Mydriatic (With dilation)</option>
              <option value="Ultra-wide field">Ultra-wide field (Optos)</option>
              <option value="Smartphone">Smartphone-based (D-Eye, Paxos)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Manufacturer/Model
            </label>
            <select
              value={formData.fundusCamera.manufacturer}
              onChange={(e) => setFormData({ 
                ...formData, 
                fundusCamera: { ...formData.fundusCamera, manufacturer: e.target.value }
              })}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
            >
              <option value="Topcon TRC-NW400">Topcon TRC-NW400 (Non-mydriatic)</option>
              <option value="Canon CR-2">Canon CR-2 (Non-mydriatic)</option>
              <option value="Zeiss Visucam">Zeiss Visucam 500</option>
              <option value="Optos California">Optos California (Ultra-wide)</option>
              <option value="Optos Silverstone">Optos Silverstone (Ultra-wide)</option>
              <option value="Kowa VX-20">Kowa VX-20</option>
            </select>
          </div>
        </div>
      </div>

      {/* OD (Right Eye) - DR Grading */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
        <h3 className="text-md font-semibold text-blue-900 mb-4 flex items-center">
          <Eye className="h-5 w-5 mr-2" />
          OD (Right Eye) - ETDRS Grading
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DR Severity (ETDRS)
            </label>
            <select
              value={formData.OD.drSeverity}
              onChange={(e) => setFormData({ 
                ...formData, 
                OD: { ...formData.OD, drSeverity: e.target.value as any }
              })}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="No DR">No DR (No retinopathy)</option>
              <option value="Mild NPDR">Mild NPDR (Microaneurysms only)</option>
              <option value="Moderate NPDR">Moderate NPDR (More than just MAs)</option>
              <option value="Severe NPDR">Severe NPDR (4-2-1 rule)</option>
              <option value="PDR">PDR (Neovascularization)</option>
            </select>
            <div className={`mt-2 px-3 py-2 rounded-lg text-sm font-medium ${getSeverityColor(formData.OD.drSeverity)}`}>
              {formData.OD.drSeverity}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DME Severity
            </label>
            <select
              value={formData.OD.dmeSeverity}
              onChange={(e) => setFormData({ 
                ...formData, 
                OD: { ...formData.OD, dmeSeverity: e.target.value as any }
              })}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="No DME">No DME</option>
              <option value="Mild DME">Mild DME (Retinal thickening)</option>
              <option value="Moderate DME">Moderate DME (Near macula)</option>
              <option value="Severe DME">Severe DME (Center involving)</option>
            </select>
            <div className={`mt-2 px-3 py-2 rounded-lg text-sm font-medium ${getSeverityColor(formData.OD.dmeSeverity)}`}>
              {formData.OD.dmeSeverity}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Microaneurysms Count
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.OD.microaneurysms}
              onChange={(e) => setFormData({ 
                ...formData, 
                OD: { ...formData.OD, microaneurysms: parseInt(e.target.value) || 0 }
              })}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hemorrhages
            </label>
            <select
              value={formData.OD.hemorrhages}
              onChange={(e) => setFormData({ 
                ...formData, 
                OD: { ...formData.OD, hemorrhages: e.target.value as any }
              })}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="None">None</option>
              <option value="Few">Few</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe">Severe (â‰¥20 in all 4 quadrants)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <label className="flex items-center cursor-pointer hover:bg-blue-100 p-2 rounded">
            <input
              type="checkbox"
              checked={formData.OD.hardExudates}
              onChange={(e) => setFormData({ 
                ...formData, 
                OD: { ...formData.OD, hardExudates: e.target.checked }
              })}
              disabled={!canEdit}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Hard Exudates</span>
          </label>

          <label className="flex items-center cursor-pointer hover:bg-blue-100 p-2 rounded">
            <input
              type="checkbox"
              checked={formData.OD.cottonWoolSpots}
              onChange={(e) => setFormData({ 
                ...formData, 
                OD: { ...formData.OD, cottonWoolSpots: e.target.checked }
              })}
              disabled={!canEdit}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Cotton Wool Spots</span>
          </label>

          <label className="flex items-center cursor-pointer hover:bg-blue-100 p-2 rounded">
            <input
              type="checkbox"
              checked={formData.OD.venousBeading}
              onChange={(e) => setFormData({ 
                ...formData, 
                OD: { ...formData.OD, venousBeading: e.target.checked }
              })}
              disabled={!canEdit}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Venous Beading</span>
          </label>

          <label className="flex items-center cursor-pointer hover:bg-blue-100 p-2 rounded">
            <input
              type="checkbox"
              checked={formData.OD.IRMA}
              onChange={(e) => setFormData({ 
                ...formData, 
                OD: { ...formData.OD, IRMA: e.target.checked }
              })}
              disabled={!canEdit}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">IRMA</span>
          </label>

          <label className="flex items-center cursor-pointer hover:bg-blue-100 p-2 rounded">
            <input
              type="checkbox"
              checked={formData.OD.neovascularization}
              onChange={(e) => setFormData({ 
                ...formData, 
                OD: { ...formData.OD, neovascularization: e.target.checked }
              })}
              disabled={!canEdit}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <span className="ml-2 text-sm text-gray-700 font-semibold">Neovascularization</span>
          </label>
        </div>

        <div className="mt-4">
          <label className="flex items-center cursor-pointer bg-red-50 hover:bg-red-100 p-3 rounded border-2 border-red-300">
            <input
              type="checkbox"
              checked={formData.OD.referralNeeded}
              onChange={(e) => setFormData({ 
                ...formData, 
                OD: { ...formData.OD, referralNeeded: e.target.checked }
              })}
              disabled={!canEdit}
              className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <span className="ml-3 text-sm font-bold text-red-800">
              Urgent Referral to Retina Specialist Needed
            </span>
          </label>
        </div>
      </div>

      {/* OS (Left Eye) - Similar structure */}
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
        <h3 className="text-md font-semibold text-green-900 mb-4 flex items-center">
          <Eye className="h-5 w-5 mr-2" />
          OS (Left Eye) - ETDRS Grading
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DR Severity (ETDRS)
            </label>
            <select
              value={formData.OS.drSeverity}
              onChange={(e) => setFormData({ 
                ...formData, 
                OS: { ...formData.OS, drSeverity: e.target.value as any }
              })}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
            >
              <option value="No DR">No DR (No retinopathy)</option>
              <option value="Mild NPDR">Mild NPDR (Microaneurysms only)</option>
              <option value="Moderate NPDR">Moderate NPDR (More than just MAs)</option>
              <option value="Severe NPDR">Severe NPDR (4-2-1 rule)</option>
              <option value="PDR">PDR (Neovascularization)</option>
            </select>
            <div className={`mt-2 px-3 py-2 rounded-lg text-sm font-medium ${getSeverityColor(formData.OS.drSeverity)}`}>
              {formData.OS.drSeverity}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DME Severity
            </label>
            <select
              value={formData.OS.dmeSeverity}
              onChange={(e) => setFormData({ 
                ...formData, 
                OS: { ...formData.OS, dmeSeverity: e.target.value as any }
              })}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
            >
              <option value="No DME">No DME</option>
              <option value="Mild DME">Mild DME (Retinal thickening)</option>
              <option value="Moderate DME">Moderate DME (Near macula)</option>
              <option value="Severe DME">Severe DME (Center involving)</option>
            </select>
            <div className={`mt-2 px-3 py-2 rounded-lg text-sm font-medium ${getSeverityColor(formData.OS.dmeSeverity)}`}>
              {formData.OS.dmeSeverity}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Microaneurysms Count
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.OS.microaneurysms}
              onChange={(e) => setFormData({ 
                ...formData, 
                OS: { ...formData.OS, microaneurysms: parseInt(e.target.value) || 0 }
              })}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hemorrhages
            </label>
            <select
              value={formData.OS.hemorrhages}
              onChange={(e) => setFormData({ 
                ...formData, 
                OS: { ...formData.OS, hemorrhages: e.target.value as any }
              })}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
            >
              <option value="None">None</option>
              <option value="Few">Few</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe">Severe (â‰¥20 in all 4 quadrants)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <label className="flex items-center cursor-pointer hover:bg-green-100 p-2 rounded">
            <input
              type="checkbox"
              checked={formData.OS.hardExudates}
              onChange={(e) => setFormData({ 
                ...formData, 
                OS: { ...formData.OS, hardExudates: e.target.checked }
              })}
              disabled={!canEdit}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="ml-2 text-sm text-gray-700">Hard Exudates</span>
          </label>

          <label className="flex items-center cursor-pointer hover:bg-green-100 p-2 rounded">
            <input
              type="checkbox"
              checked={formData.OS.cottonWoolSpots}
              onChange={(e) => setFormData({ 
                ...formData, 
                OS: { ...formData.OS, cottonWoolSpots: e.target.checked }
              })}
              disabled={!canEdit}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="ml-2 text-sm text-gray-700">Cotton Wool Spots</span>
          </label>

          <label className="flex items-center cursor-pointer hover:bg-green-100 p-2 rounded">
            <input
              type="checkbox"
              checked={formData.OS.venousBeading}
              onChange={(e) => setFormData({ 
                ...formData, 
                OS: { ...formData.OS, venousBeading: e.target.checked }
              })}
              disabled={!canEdit}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="ml-2 text-sm text-gray-700">Venous Beading</span>
          </label>

          <label className="flex items-center cursor-pointer hover:bg-green-100 p-2 rounded">
            <input
              type="checkbox"
              checked={formData.OS.IRMA}
              onChange={(e) => setFormData({ 
                ...formData, 
                OS: { ...formData.OS, IRMA: e.target.checked }
              })}
              disabled={!canEdit}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="ml-2 text-sm text-gray-700">IRMA</span>
          </label>

          <label className="flex items-center cursor-pointer hover:bg-green-100 p-2 rounded">
            <input
              type="checkbox"
              checked={formData.OS.neovascularization}
              onChange={(e) => setFormData({ 
                ...formData, 
                OS: { ...formData.OS, neovascularization: e.target.checked }
              })}
              disabled={!canEdit}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <span className="ml-2 text-sm text-gray-700 font-semibold">Neovascularization</span>
          </label>
        </div>

        <div className="mt-4">
          <label className="flex items-center cursor-pointer bg-red-50 hover:bg-red-100 p-3 rounded border-2 border-red-300">
            <input
              type="checkbox"
              checked={formData.OS.referralNeeded}
              onChange={(e) => setFormData({ 
                ...formData, 
                OS: { ...formData.OS, referralNeeded: e.target.checked }
              })}
              disabled={!canEdit}
              className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <span className="ml-3 text-sm font-bold text-red-800">
              Urgent Referral to Retina Specialist Needed
            </span>
          </label>
        </div>
      </div>

      {/* Clinical Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Clinical Notes & Management Plan
        </label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          disabled={!canEdit}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
          placeholder="Enter screening results, referral notes, follow-up recommendations..."
        />
      </div>

      {/* Submit Button */}
      {canEdit && (
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Save DR Screening
          </button>
        </div>
      )}
    </form>
  );
}
