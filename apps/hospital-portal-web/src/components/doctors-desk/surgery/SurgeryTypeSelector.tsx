'use client';

import { RadioGroup } from '@headlessui/react';
import { Eye, Activity, Droplet, Grid } from 'lucide-react';
import type { DiagnosisCode } from '@/types/diagnosis';

interface SurgeryTypeSelectorProps {
  diagnosis: DiagnosisCode;
  selectedType: 'Cataract' | 'Glaucoma' | 'Vitreoretinal' | 'Corneal' | null;
  selectedSubType: string;
  selectedEye: 'OD' | 'OS' | 'OU';
  onTypeChange: (type: 'Cataract' | 'Glaucoma' | 'Vitreoretinal' | 'Corneal') => void;
  onSubTypeChange: (subType: string) => void;
  onEyeChange: (eye: 'OD' | 'OS' | 'OU') => void;
}

const SURGERY_TYPES = {
  Cataract: {
    icon: Eye,
    color: 'blue',
    subTypes: [
      { value: 'Phaco + IOL', label: 'Phacoemulsification + IOL Implantation', common: true },
      { value: 'SICS', label: 'Small Incision Cataract Surgery (SICS)', common: true },
      { value: 'ECCE + IOL', label: 'Extracapsular Cataract Extraction + IOL', common: false },
      { value: 'Phaco + Toric IOL', label: 'Phaco + Toric IOL (Astigmatism Correction)', common: true },
      { value: 'Phaco + Multifocal IOL', label: 'Phaco + Multifocal IOL (Premium)', common: false },
    ],
    description: 'Removal of cloudy lens and IOL implantation',
  },
  Glaucoma: {
    icon: Activity,
    color: 'green',
    subTypes: [
      { value: 'Trabeculectomy', label: 'Trabeculectomy with MMC', common: true },
      { value: 'Tube Shunt', label: 'Glaucoma Drainage Device (Ahmed/Baerveldt)', common: true },
      { value: 'Laser Trabeculoplasty', label: 'Selective Laser Trabeculoplasty (SLT)', common: true },
      { value: 'Laser Iridotomy', label: 'Laser Peripheral Iridotomy (LPI)', common: true },
      { value: 'Cyclodiode', label: 'Cyclophotocoagulation (Diode Laser)', common: false },
    ],
    description: 'IOP reduction procedures',
  },
  Vitreoretinal: {
    icon: Droplet,
    color: 'purple',
    subTypes: [
      { value: 'PPV', label: 'Pars Plana Vitrectomy (PPV)', common: true },
      { value: 'PPV + SB', label: 'PPV + Scleral Buckling', common: false },
      { value: 'SB Alone', label: 'Scleral Buckling (SB) Alone', common: false },
      { value: 'Membrane Peel', label: 'Membrane Peeling (ERM/ILM)', common: true },
      { value: 'Anti-VEGF + PPV', label: 'Anti-VEGF Injection + PPV', common: false },
    ],
    description: 'Vitreous and retinal surgery',
  },
  Corneal: {
    icon: Grid,
    color: 'yellow',
    subTypes: [
      { value: 'PKP', label: 'Penetrating Keratoplasty (Full Thickness)', common: true },
      { value: 'DALK', label: 'Deep Anterior Lamellar Keratoplasty (DALK)', common: true },
      { value: 'DSEK', label: 'Descemet Stripping Endothelial Keratoplasty (DSEK)', common: false },
      { value: 'DMEK', label: 'Descemet Membrane Endothelial Keratoplasty (DMEK)', common: false },
      { value: 'Pterygium', label: 'Pterygium Excision + Conjunctival Autograft', common: true },
    ],
    description: 'Corneal transplant and surface surgery',
  },
};

export default function SurgeryTypeSelector({
  diagnosis,
  selectedType,
  selectedSubType,
  selectedEye,
  onTypeChange,
  onSubTypeChange,
  onEyeChange,
}: SurgeryTypeSelectorProps) {
  // Auto-suggest surgery type based on diagnosis ICD-10 code
  const getSuggestedType = (): 'Cataract' | 'Glaucoma' | 'Vitreoretinal' | 'Corneal' | null => {
    const code = diagnosis.icdCode || diagnosis.code;
    if (code.startsWith('H25') || code.startsWith('H26')) return 'Cataract';
    if (code.startsWith('H40')) return 'Glaucoma';
    if (code.startsWith('H33') || code.startsWith('H35')) return 'Vitreoretinal';
    if (code.startsWith('H16') || code.startsWith('H17') || code.startsWith('H18')) return 'Corneal';
    return null;
  };

  const suggestedType = getSuggestedType();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Surgery Type</h3>
        <p className="text-sm text-gray-600 mb-4">
          Based on diagnosis: <span className="font-medium">{diagnosis.description}</span>
          {suggestedType && (
            <span className="ml-2 text-indigo-600 font-medium">
              (Suggested: {suggestedType})
            </span>
          )}
        </p>
      </div>

      {/* Surgery Type Selection */}
      <RadioGroup value={selectedType} onChange={onTypeChange}>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(SURGERY_TYPES).map(([type, config]) => {
            const Icon = config.icon;
            const isSelected = selectedType === type;
            const isSuggested = suggestedType === type;

            return (
              <RadioGroup.Option
                key={type}
                value={type}
                className={({ checked }) =>
                  `relative flex cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    checked
                      ? `border-${config.color}-500 bg-${config.color}-50 ring-2 ring-${config.color}-500`
                      : isSuggested
                      ? `border-${config.color}-300 bg-${config.color}-25`
                      : 'border-gray-200 hover:border-gray-300'
                  }`
                }
              >
                {({ checked }) => (
                  <div className="flex w-full items-start space-x-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        checked ? `bg-${config.color}-500` : `bg-${config.color}-100`
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${checked ? 'text-white' : `text-${config.color}-600`}`} />
                    </div>
                    <div className="flex-1">
                      <RadioGroup.Label as="p" className="font-semibold text-gray-900">
                        {type}
                        {isSuggested && (
                          <span className="ml-2 text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">
                            Suggested
                          </span>
                        )}
                      </RadioGroup.Label>
                      <RadioGroup.Description as="span" className="text-sm text-gray-600">
                        {config.description}
                      </RadioGroup.Description>
                    </div>
                  </div>
                )}
              </RadioGroup.Option>
            );
          })}
        </div>
      </RadioGroup>

      {/* Sub-Type Selection */}
      {selectedType && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-900">
            Specific Procedure
          </label>
          <select
            value={selectedSubType}
            onChange={(e) => onSubTypeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select procedure...</option>
            {SURGERY_TYPES[selectedType].subTypes.map((subType) => (
              <option key={subType.value} value={subType.value}>
                {subType.label} {subType.common ? '(Common)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Eye Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-900">
          Surgical Eye
        </label>
        <RadioGroup value={selectedEye} onChange={onEyeChange}>
          <div className="grid grid-cols-3 gap-3">
            {(['OD', 'OS', 'OU'] as const).map((eye) => (
              <RadioGroup.Option
                key={eye}
                value={eye}
                className={({ checked }) =>
                  `flex cursor-pointer items-center justify-center rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                    checked
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`
                }
              >
                <RadioGroup.Label as="span">
                  {eye === 'OD' ? 'Right Eye (OD)' : eye === 'OS' ? 'Left Eye (OS)' : 'Both Eyes (OU)'}
                </RadioGroup.Label>
              </RadioGroup.Option>
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* Validation Message */}
      {!selectedType && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Please select a surgery type to continue
          </p>
        </div>
      )}

      {selectedType && !selectedSubType && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Please select a specific procedure to continue
          </p>
        </div>
      )}
    </div>
  );
}
