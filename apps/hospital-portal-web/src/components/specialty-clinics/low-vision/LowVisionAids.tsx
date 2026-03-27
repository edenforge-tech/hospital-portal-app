'use client';

import React, { useState } from 'react';
import { Glasses, Check } from 'lucide-react';

interface LowVisionAidsProps {
  patientId: string;
  diagnosis: string;
  canEdit?: boolean;
  onSave?: (data: any) => void;
}

export default function LowVisionAids({ patientId, diagnosis, canEdit = true, onSave }: LowVisionAidsProps) {
  const [selectedAids, setSelectedAids] = useState<string[]>(['4x Handheld magnifier', 'Task lighting']);
  const [magnificationNeeded, setMagnificationNeeded] = useState(4);

  const aids = [
    { category: 'Optical Magnifiers', items: ['2x Handheld magnifier', '4x Handheld magnifier', '8x Stand magnifier', 'Dome magnifier', 'Spectacle-mounted magnifiers'] },
    { category: 'Electronic Aids', items: ['CCTV magnifier (desktop)', 'Portable electronic magnifier', 'Screen reading software', 'Text-to-speech apps'] },
    { category: 'Telescopes', items: ['Bioptic telescope 2.2x', 'Galilean telescope 4x', 'Hand-held monocular 8x'] },
    { category: 'Non-Optical', items: ['Task lighting (LED)', 'High-contrast materials', 'Large print books', 'Bold-line paper', 'Signature guide'] },
    { category: 'Filters', items: ['Yellow-amber tint (glare)', 'Polarized (outdoor)', 'UV protection', 'Side shields'] }
  ];

  const recommendAids = () => {
    const recommendations = [];
    
    if (magnificationNeeded <= 3) {
      recommendations.push('Handheld or spectacle-mounted magnifiers sufficient');
      recommendations.push('Large print materials');
    } else if (magnificationNeeded <= 8) {
      recommendations.push('Stand magnifiers or low-power CCTV');
      recommendations.push('Task lighting essential');
    } else {
      recommendations.push('High-power CCTV or electronic magnifier');
      recommendations.push('Consider audio books for extended reading');
    }
    
    if (diagnosis.toLowerCase().includes('glaucoma')) {
      recommendations.push('High-contrast materials (central vision preserved)');
      recommendations.push('Mobility training (peripheral loss)');
    } else if (diagnosis.toLowerCase().includes('amd')) {
      recommendations.push('Eccentric viewing training');
      recommendations.push('Yellow-amber filters for glare');
    }
    
    return recommendations;
  };

  const recommendations = recommendAids();

  const toggleAid = (aid: string) => {
    if (selectedAids.includes(aid)) {
      setSelectedAids(selectedAids.filter(a => a !== aid));
    } else {
      setSelectedAids([...selectedAids, aid]);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h3 className="text-xl font-bold">Low Vision Aids Prescription</h3>

      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <h4 className="text-lg font-bold text-blue-900 mb-4">Magnification Required</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Magnification Power (X)</label>
            <input
              type="number"
              step="1"
              value={magnificationNeeded}
              onChange={(e) => setMagnificationNeeded(parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <p className="text-xs text-blue-700 mt-1">Based on visual acuity and reading goals</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-bold">Available Low Vision Aids</h4>
        {aids.map((category) => (
          <div key={category.category} className="bg-white border-2 border-gray-200 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 mb-3">{category.category}</h5>
            <div className="grid grid-cols-3 gap-2">
              {category.items.map((item) => (
                <button
                  key={item}
                  onClick={() => toggleAid(item)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedAids.includes(item)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <h4 className="text-lg font-bold text-green-900 mb-4">Personalized Recommendations</h4>
        <ul className="space-y-2">
          {recommendations.map((rec, idx) => (
            <li key={idx} className="flex items-start space-x-2 text-sm text-green-800">
              <span className="text-green-600">✓</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
        <h5 className="font-semibold text-yellow-900 mb-2">Prescribing Guidelines</h5>
        <div className="space-y-1 text-sm text-yellow-800">
          <p><strong>Magnification:</strong> 6/60 vision needs ~4x. 6/120 needs ~8x. Trial multiple devices.</p>
          <p><strong>CCTV:</strong> Best for reading &gt;8x magnification. Expensive but Medicare/insurance coverage available.</p>
          <p><strong>Training:</strong> All aids require training period (2-4 weeks). Follow-up essential.</p>
        </div>
      </div>

      {canEdit && (
        <button
          onClick={() => onSave && onSave({ selectedAids, magnificationNeeded, recommendations })}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center space-x-2"
        >
          <Check className="w-5 h-5" />
          <span>Save Aid Prescription</span>
        </button>
      )}
    </div>
  );
}
