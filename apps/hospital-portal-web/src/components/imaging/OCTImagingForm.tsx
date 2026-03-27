'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { Scan, Eye, Activity, AlertCircle, TrendingUp } from 'lucide-react';

interface OCTImagingData {
  id?: string;
  patientId: string;
  examinationDate: Date;
  examinerId: string;
  device: {
    manufacturer: 'Zeiss' | 'Topcon' | 'Heidelberg' | 'Optovue' | 'Nidek';
    model: string;
  };
  scanProtocol: 'Macula' | 'ONH' | 'Wide Field' | 'Glaucoma' | 'Anterior Segment';
  OD: {
    centralRetinalThickness: number;
    averageRNFLThickness?: number;
    ganglionCellLayer?: number;
    findings: string[];
    imageQuality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  };
  OS: {
    centralRetinalThickness: number;
    averageRNFLThickness?: number;
    ganglionCellLayer?: number;
    findings: string[];
    imageQuality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  };
  notes?: string;
}

interface OCTImagingFormProps {
  initialData: OCTImagingData | null;
  patientId: string;
  onSave: (data: OCTImagingData) => void;
  canEdit: boolean;
}

export default function OCTImagingForm({ initialData, patientId, onSave, canEdit }: OCTImagingFormProps) {
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState<OCTImagingData>({
    patientId,
    examinationDate: initialData?.examinationDate ? new Date(initialData.examinationDate) : new Date(),
    examinerId: user?.id || '',
    device: initialData?.device || {
      manufacturer: 'Zeiss',
      model: 'Cirrus HD-OCT 5000',
    },
    scanProtocol: initialData?.scanProtocol || 'Macula',
    OD: initialData?.OD || {
      centralRetinalThickness: 0,
      averageRNFLThickness: 0,
      ganglionCellLayer: 0,
      findings: [],
      imageQuality: 'Good',
    },
    OS: initialData?.OS || {
      centralRetinalThickness: 0,
      averageRNFLThickness: 0,
      ganglionCellLayer: 0,
      findings: [],
      imageQuality: 'Good',
    },
    notes: initialData?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const commonFindings = [
    'Normal retinal architecture',
    'Epiretinal membrane',
    'Macular edema (DME)',
    'Cystoid macular edema (CME)',
    'Subretinal fluid',
    'Intraretinal fluid',
    'Drusen',
    'Geographic atrophy',
    'Retinal pigment epithelium detachment',
    'Choroidal neovascularization',
    'Vitreomacular traction',
    'Macular hole - full thickness',
    'Macular hole - lamellar',
    'Central serous retinopathy',
    'RNFL thinning (glaucoma)',
    'Cup-to-disc ratio abnormal',
    'Ganglion cell layer thinning',
  ];

  const toggleFinding = (eye: 'OD' | 'OS', finding: string) => {
    setFormData(prev => ({
      ...prev,
      [eye]: {
        ...prev[eye],
        findings: prev[eye].findings.includes(finding)
          ? prev[eye].findings.filter(f => f !== finding)
          : [...prev[eye].findings, finding]
      }
    }));
  };

  const getCRTInterpretation = (crt: number) => {
    if (crt === 0) return { text: 'Not measured', color: 'text-gray-500' };
    if (crt < 200) return { text: 'Thin - possible atrophy', color: 'text-orange-600' };
    if (crt >= 200 && crt <= 300) return { text: 'Normal', color: 'text-green-600' };
    if (crt > 300 && crt <= 400) return { text: 'Mild thickening', color: 'text-yellow-600' };
    if (crt > 400) return { text: 'Significant edema', color: 'text-red-600' };
    return { text: 'Unknown', color: 'text-gray-500' };
  };

  const getRNFLInterpretation = (rnfl: number) => {
    if (!rnfl || rnfl === 0) return { text: 'Not measured', color: 'text-gray-500' };
    if (rnfl < 70) return { text: 'Severe thinning', color: 'text-red-600' };
    if (rnfl >= 70 && rnfl < 85) return { text: 'Borderline thin', color: 'text-yellow-600' };
    if (rnfl >= 85 && rnfl <= 120) return { text: 'Normal', color: 'text-green-600' };
    if (rnfl > 120) return { text: 'Thickened', color: 'text-orange-600' };
    return { text: 'Unknown', color: 'text-gray-500' };
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Device Configuration */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="text-md font-semibold text-purple-900 mb-3 flex items-center">
          <Scan className="h-5 w-5 mr-2" />
          OCT Device & Protocol
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OCT Device
            </label>
            <select
              value={`${formData.device.manufacturer} ${formData.device.model}`}
              onChange={(e) => {
                const [manufacturer, ...modelParts] = e.target.value.split(' ');
                setFormData({ 
                  ...formData, 
                  device: { 
                    manufacturer: manufacturer as any,
                    model: modelParts.join(' ')
                  }
                });
              }}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
            >
              <optgroup label="Zeiss">
                <option value="Zeiss Cirrus HD-OCT 5000">Cirrus HD-OCT 5000</option>
                <option value="Zeiss Cirrus HD-OCT 6000">Cirrus HD-OCT 6000</option>
                <option value="Zeiss PLEX Elite 9000">PLEX Elite 9000 (SS-OCT)</option>
              </optgroup>
              <optgroup label="Heidelberg">
                <option value="Heidelberg Spectralis">Spectralis OCT</option>
                <option value="Heidelberg Spectralis OCT2">Spectralis OCT2</option>
              </optgroup>
              <optgroup label="Topcon">
                <option value="Topcon 3D OCT-1 Maestro2">3D OCT-1 Maestro2</option>
                <option value="Topcon Triton DRI OCT">Triton DRI OCT (SS-OCT)</option>
              </optgroup>
              <optgroup label="Optovue">
                <option value="Optovue iVue">iVue OCT</option>
                <option value="Optovue AngioVue">AngioVue (OCTA)</option>
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scan Protocol
            </label>
            <select
              value={formData.scanProtocol}
              onChange={(e) => setFormData({ ...formData, scanProtocol: e.target.value as any })}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
            >
              <option value="Macula">Macula (Retinal thickness)</option>
              <option value="ONH">ONH (Optic Nerve Head)</option>
              <option value="Glaucoma">Glaucoma (RNFL + GCL)</option>
              <option value="Wide Field">Wide Field (12mm scan)</option>
              <option value="Anterior Segment">Anterior Segment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Examination Date & Time
            </label>
            <input
              type="datetime-local"
              value={formData.examinationDate.toISOString().slice(0, 16)}
              onChange={(e) => setFormData({ ...formData, examinationDate: new Date(e.target.value) })}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
            />
          </div>
        </div>
      </div>

      {/* OD (Right Eye) */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
        <h3 className="text-md font-semibold text-blue-900 mb-4 flex items-center">
          <Eye className="h-5 w-5 mr-2" />
          OD (Right Eye) - OCT Measurements
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Central Retinal Thickness (μm)
            </label>
            <input
              type="number"
              step="1"
              min="0"
              max="1000"
              value={formData.OD.centralRetinalThickness}
              onChange={(e) => setFormData({ 
                ...formData, 
                OD: { ...formData.OD, centralRetinalThickness: parseInt(e.target.value) || 0 }
              })}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 font-mono text-lg"
            />
            <p className={`text-xs mt-1 font-medium ${getCRTInterpretation(formData.OD.centralRetinalThickness).color}`}>
              {getCRTInterpretation(formData.OD.centralRetinalThickness).text}
            </p>
            <p className="text-xs text-gray-500">Normal: 200-300 μm</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Average RNFL Thickness (μm)
            </label>
            <input
              type="number"
              step="1"
              min="0"
              max="200"
              value={formData.OD.averageRNFLThickness || 0}
              onChange={(e) => setFormData({ 
                ...formData, 
                OD: { ...formData.OD, averageRNFLThickness: parseInt(e.target.value) || 0 }
              })}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 font-mono text-lg"
            />
            <p className={`text-xs mt-1 font-medium ${getRNFLInterpretation(formData.OD.averageRNFLThickness || 0).color}`}>
              {getRNFLInterpretation(formData.OD.averageRNFLThickness || 0).text}
            </p>
            <p className="text-xs text-gray-500">Normal: 85-120 μm</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ganglion Cell Layer (μm)
            </label>
            <input
              type="number"
              step="1"
              min="0"
              max="150"
              value={formData.OD.ganglionCellLayer || 0}
              onChange={(e) => setFormData({ 
                ...formData, 
                OD: { ...formData.OD, ganglionCellLayer: parseInt(e.target.value) || 0 }
              })}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 font-mono text-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Normal: 70-90 μm</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image Quality
            </label>
            <select
              value={formData.OD.imageQuality}
              onChange={(e) => setFormData({ 
                ...formData, 
                OD: { ...formData.OD, imageQuality: e.target.value as any }
              })}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="Excellent">Excellent (Signal {'>'}9)</option>
              <option value="Good">Good (Signal 7-9)</option>
              <option value="Fair">Fair (Signal 5-6)</option>
              <option value="Poor">Poor (Signal {'<'}5)</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Findings (Select all that apply)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {commonFindings.map((finding) => (
              <label key={finding} className="flex items-center cursor-pointer hover:bg-blue-100 p-2 rounded">
                <input
                  type="checkbox"
                  checked={formData.OD.findings.includes(finding)}
                  onChange={() => toggleFinding('OD', finding)}
                  disabled={!canEdit}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{finding}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* OS (Left Eye) - Similar structure */}
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
        <h3 className="text-md font-semibold text-green-900 mb-4 flex items-center">
          <Eye className="h-5 w-5 mr-2" />
          OS (Left Eye) - OCT Measurements
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Central Retinal Thickness (μm)
            </label>
            <input
              type="number"
              step="1"
              min="0"
              max="1000"
              value={formData.OS.centralRetinalThickness}
              onChange={(e) => setFormData({ 
                ...formData, 
                OS: { ...formData.OS, centralRetinalThickness: parseInt(e.target.value) || 0 }
              })}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 font-mono text-lg"
            />
            <p className={`text-xs mt-1 font-medium ${getCRTInterpretation(formData.OS.centralRetinalThickness).color}`}>
              {getCRTInterpretation(formData.OS.centralRetinalThickness).text}
            </p>
            <p className="text-xs text-gray-500">Normal: 200-300 μm</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Average RNFL Thickness (μm)
            </label>
            <input
              type="number"
              step="1"
              min="0"
              max="200"
              value={formData.OS.averageRNFLThickness || 0}
              onChange={(e) => setFormData({ 
                ...formData, 
                OS: { ...formData.OS, averageRNFLThickness: parseInt(e.target.value) || 0 }
              })}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 font-mono text-lg"
            />
            <p className={`text-xs mt-1 font-medium ${getRNFLInterpretation(formData.OS.averageRNFLThickness || 0).color}`}>
              {getRNFLInterpretation(formData.OS.averageRNFLThickness || 0).text}
            </p>
            <p className="text-xs text-gray-500">Normal: 85-120 μm</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ganglion Cell Layer (μm)
            </label>
            <input
              type="number"
              step="1"
              min="0"
              max="150"
              value={formData.OS.ganglionCellLayer || 0}
              onChange={(e) => setFormData({ 
                ...formData, 
                OS: { ...formData.OS, ganglionCellLayer: parseInt(e.target.value) || 0 }
              })}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 font-mono text-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Normal: 70-90 μm</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image Quality
            </label>
            <select
              value={formData.OS.imageQuality}
              onChange={(e) => setFormData({ 
                ...formData, 
                OS: { ...formData.OS, imageQuality: e.target.value as any }
              })}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
            >
              <option value="Excellent">Excellent (Signal {'>'}9)</option>
              <option value="Good">Good (Signal 7-9)</option>
              <option value="Fair">Fair (Signal 5-6)</option>
              <option value="Poor">Poor (Signal {'<'}5)</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Findings (Select all that apply)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {commonFindings.map((finding) => (
              <label key={finding} className="flex items-center cursor-pointer hover:bg-green-100 p-2 rounded">
                <input
                  type="checkbox"
                  checked={formData.OS.findings.includes(finding)}
                  onChange={() => toggleFinding('OS', finding)}
                  disabled={!canEdit}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">{finding}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Clinical Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Clinical Notes & Interpretation
        </label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          disabled={!canEdit}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
          placeholder="Enter detailed interpretation, clinical correlation, recommendations for follow-up..."
        />
      </div>

      {/* Submit Button */}
      {canEdit && (
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Save OCT Scan
          </button>
        </div>
      )}
    </form>
  );
}
