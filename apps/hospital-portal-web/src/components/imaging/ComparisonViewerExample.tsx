// Example usage of ComparisonViewer component
'use client';

import { useState } from 'react';
import ComparisonViewer from './ComparisonViewer';
import toast from 'react-hot-toast';

interface ComparisonViewerExampleProps {
  patientId?: string;
}

export default function ComparisonViewerExample({ patientId }: ComparisonViewerExampleProps) {
  const [showComparison, setShowComparison] = useState(false);

  // Example image data - replace with actual data from your API
  const baselineImage = {
    id: 'baseline-001',
    url: '/api/placeholder-image-1.jpg', // Replace with actual image URL
    patientName: 'John Doe',
    studyDate: '2025-12-01',
    studyDescription: 'Fundus Photography - Baseline',
  };

  const followupImage = {
    id: 'followup-001',
    url: '/api/placeholder-image-2.jpg', // Replace with actual image URL
    patientName: 'John Doe',
    studyDate: '2026-02-15',
    studyDescription: 'Fundus Photography - 3 Month Follow-up',
  };

  const handleSaveComparison = async (comparisonData: any) => {
    // Custom save logic - called when user clicks "Save Comparison"
    console.log('Saving comparison:', comparisonData);
    
    // Example API call:
    // const api = (await import('@/lib/api')).getApi();
    // await api.post('/Imaging/comparisons', comparisonData);
    
    toast.success('Comparison saved successfully');
  };

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-4">
          Comparison Viewer Example
        </h1>
        
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <p className="text-gray-300">
            This example demonstrates the ComparisonViewer component for side-by-side
            image comparison with synchronized controls.
          </p>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">Features:</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Split-screen view with adjustable divider</li>
              <li>Synchronized zoom, pan, brightness controls (toggle on/off)</li>
              <li>Baseline (left) and Follow-up (right) image labels</li>
              <li>Comparison notes with type and clinical significance</li>
              <li>Save comparison to backend API</li>
            </ul>
          </div>

          <button
            onClick={() => setShowComparison(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Open Comparison Viewer
          </button>
        </div>

        {showComparison && (
          <ComparisonViewer
            baselineImage={baselineImage}
            followupImage={followupImage}
            patientId={patientId}
            onClose={() => setShowComparison(false)}
            onSaveComparison={handleSaveComparison}
          />
        )}
      </div>
    </div>
  );
}
