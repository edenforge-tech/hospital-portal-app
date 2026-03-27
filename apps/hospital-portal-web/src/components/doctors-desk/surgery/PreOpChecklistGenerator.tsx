'use client';

import { useState, useEffect } from 'react';
import { ClipboardList, Check, Plus, Trash2 } from 'lucide-react';

interface PreOpChecklistGeneratorProps {
  surgeryType: 'Cataract' | 'Glaucoma' | 'Vitreoretinal' | 'Corneal';
  checklist: string[];
  onChecklistChange: (checklist: string[]) => void;
}

const DEFAULT_CHECKLISTS = {
  Cataract: [
    'Biometry (IOLMaster or A-scan)',
    'Dilated fundus examination',
    'ECG (if patient age >60 years)',
    'Blood tests: CBC, RBS, HbA1c (if diabetic)',
    'Blood pressure check',
    'Physician clearance (if systemic disease)',
    'Informed consent - surgery risks & benefits',
    'Informed consent - IOL type and refractive target',
    'Stop anticoagulants (if on Warfarin/Aspirin - as per physician advice)',
    'Fasting 6 hours before surgery',
  ],
  Glaucoma: [
    'Visual field testing (Humphrey 24-2)',
    'OCT RNFL analysis',
    'Gonioscopy (angle assessment)',
    'Pachymetry (corneal thickness)',
    'Dilated fundus examination',
    'Blood tests: CBC, PT/INR (if on anticoagulants)',
    'Blood pressure check',
    'ECG (if patient age >60 years)',
    'Physician clearance (if systemic disease)',
    'Informed consent - surgery risks including vision loss, infection',
    'Stop anticoagulants as per physician advice (high bleeding risk)',
    'Fasting 6 hours before surgery',
  ],
  Vitreoretinal: [
    'B-scan ultrasonography',
    'OCT macula (high resolution)',
    'Fundus photography (wide-field if available)',
    'Fluorescein angiography (if needed)',
    'Visual field testing (if needed)',
    'Blood tests: CBC, RBS, HbA1c (if diabetic)',
    'Blood pressure check (critical for diabetic retinopathy)',
    'ECG (if patient age >60 years)',
    'Physician clearance (especially for diabetics)',
    'Informed consent - surgery risks including vision loss, retinal detachment',
    'Stop anticoagulants as per physician advice (high bleeding risk)',
    'Fasting 8 hours before surgery (longer surgery duration)',
  ],
  Corneal: [
    'Corneal topography',
    'Specular microscopy (endothelial cell count)',
    'Pachymetry (corneal thickness)',
    'Anterior segment OCT (if available)',
    'Dilated fundus examination',
    'Blood tests: CBC, HIV, HBsAg, HCV (donor tissue screening)',
    'ECG (if patient age >60 years)',
    'Physician clearance (if systemic disease)',
    'Informed consent - graft rejection risks, prolonged recovery',
    'Informed consent - immune suppression medications',
    'Stop contact lens wear (2 weeks before topography)',
    'Fasting 6 hours before surgery',
  ],
};

export default function PreOpChecklistGenerator({
  surgeryType,
  checklist,
  onChecklistChange,
}: PreOpChecklistGeneratorProps) {
  const [customItem, setCustomItem] = useState('');

  // Auto-generate checklist when surgery type changes
  useEffect(() => {
    if (checklist.length === 0) {
      onChecklistChange(DEFAULT_CHECKLISTS[surgeryType]);
    }
  }, [surgeryType]);

  const handleToggleItem = (item: string) => {
    if (checklist.includes(item)) {
      onChecklistChange(checklist.filter((i) => i !== item));
    } else {
      onChecklistChange([...checklist, item]);
    }
  };

  const handleAddCustomItem = () => {
    if (customItem.trim() && !checklist.includes(customItem.trim())) {
      onChecklistChange([...checklist, customItem.trim()]);
      setCustomItem('');
    }
  };

  const handleRemoveItem = (item: string) => {
    onChecklistChange(checklist.filter((i) => i !== item));
  };

  const defaultItems = DEFAULT_CHECKLISTS[surgeryType];
  const customItems = checklist.filter((item) => !defaultItems.includes(item));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Pre-operative Checklist
        </h3>
        <p className="text-sm text-gray-600">
          These investigations and preparations will be ordered before surgery
        </p>
      </div>

      {/* Auto-generated Items */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
          <ClipboardList className="h-4 w-4 text-indigo-600" />
          <span>Standard Pre-operative Requirements</span>
        </h4>
        <div className="border rounded-lg divide-y">
          {defaultItems.map((item, index) => {
            const isChecked = checklist.includes(item);

            return (
              <label
                key={index}
                className={`flex items-start space-x-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isChecked ? 'bg-green-50' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggleItem(item)}
                  className="mt-0.5 w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <div className="flex-1">
                  <span className={`text-sm ${isChecked ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                    {item}
                  </span>
                  {isChecked && (
                    <div className="mt-1 flex items-center space-x-1 text-xs text-green-700">
                      <Check className="h-3 w-3" />
                      <span>Will be ordered</span>
                    </div>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Custom Items */}
      {customItems.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">Custom Items</h4>
          <div className="border rounded-lg divide-y">
            {customItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <Check className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span className="text-sm text-gray-900">{item}</span>
                </div>
                <button
                  onClick={() => handleRemoveItem(item)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                  title="Remove custom item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Item */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">
          Add Custom Investigation or Requirement
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={customItem}
            onChange={(e) => setCustomItem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCustomItem()}
            placeholder="e.g., Cardiologist consultation, Chest X-ray..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            onClick={handleAddCustomItem}
            disabled={!customItem.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-900">
              Total Items: {checklist.length}
            </p>
            <p className="text-xs text-indigo-700 mt-0.5">
              These will be automatically added to the patient's investigation orders
            </p>
          </div>
          {checklist.length > 0 && (
            <Check className="h-6 w-6 text-green-600" />
          )}
        </div>
      </div>

      {/* Important Note */}
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-yellow-900">
          <strong>Important:</strong> Ensure all critical investigations are completed before surgery day. 
          Abnormal results (high BP, uncontrolled diabetes, cardiac issues) may require surgery postponement 
          and physician clearance.
        </p>
      </div>
    </div>
  );
}
