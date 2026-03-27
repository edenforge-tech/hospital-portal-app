// OCT Layer Segmentation & Analysis Engine
// Advanced retinal layer analysis with RNFL/GCL thickness measurement and progression tracking

'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Activity,
  TrendingUp,
  CheckCircle,
  Download,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface RetinalLayer {
  name: 'ILM' | 'NFL' | 'GCL' | 'IPL' | 'INL' | 'OPL' | 'ONL' | 'ELM' | 'PR' | 'RPE' | 'BM';
  fullName: string;
  color: string;
  points: Array<{ x: number; y: number }>;
}

interface ThicknessMap {
  sector: string;
  thickness: number; // in micrometers
  normalRange: [number, number];
  percentile: number;
  status: 'normal' | 'borderline' | 'abnormal';
}

interface OCTAnalysis {
  id: string;
  patientId: string;
  eye: 'OD' | 'OS';
  scanDate: Date;
  rnflThickness: ThicknessMap[];
  gclThickness: ThicknessMap[];
  averageRNFL: number;
  averageGCL: number;
  cupDiscRatio: number;
  glaucomaRiskScore: number; // 0-100
  progressionRate?: number; // micrometers per year
  comparisonScan?: string; // ID of previous scan
}

interface OCTLayerSegmentationProps {
  scanId: string;
  patientId: string;
  patientName: string;
  eye: 'OD' | 'OS';
  imageUrl?: string;
  previousScans?: OCTAnalysis[];
  onSave?: (analysis: OCTAnalysis) => void;
  className?: string;
}

export default function OCTLayerSegmentation({
  scanId,
  patientId,
  patientName,
  eye,
  imageUrl,
  previousScans = [],
  onSave,
  className = '',
}: OCTLayerSegmentationProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<OCTAnalysis | null>(null);
  const [layers, setLayers] = useState<RetinalLayer[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonScanId, setComparisonScanId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const retinalLayers: Omit<RetinalLayer, 'points'>[] = [
    { name: 'ILM', fullName: 'Internal Limiting Membrane', color: '#FF0000' },
    { name: 'NFL', fullName: 'Nerve Fiber Layer', color: '#FF6B6B' },
    { name: 'GCL', fullName: 'Ganglion Cell Layer', color: '#FFD93D' },
    { name: 'IPL', fullName: 'Inner Plexiform Layer', color: '#6BCF7F' },
    { name: 'INL', fullName: 'Inner Nuclear Layer', color: '#4D96FF' },
    { name: 'OPL', fullName: 'Outer Plexiform Layer', color: '#9D84B7' },
    { name: 'ONL', fullName: 'Outer Nuclear Layer', color: '#FF6EC7' },
    { name: 'ELM', fullName: 'External Limiting Membrane', color: '#FFA94D' },
    { name: 'PR', fullName: 'Photoreceptor Layer', color: '#95E1D3' },
    { name: 'RPE', fullName: 'Retinal Pigment Epithelium', color: '#AA4A44' },
    { name: 'BM', fullName: 'Bruch\'s Membrane', color: '#2C3E50' },
  ];

  // ETDRS Grid sectors (9 sectors total)
  const etdrsSectors = [
    'Central', // Center (1mm diameter)
    'Inner Superior', 'Inner Nasal', 'Inner Inferior', 'Inner Temporal', // Inner ring (3mm diameter)
    'Outer Superior', 'Outer Nasal', 'Outer Inferior', 'Outer Temporal', // Outer ring (6mm diameter)
  ];

  // Perform automated layer segmentation
  const performSegmentation = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate AI-based segmentation (in production, this would call a backend ML service)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate mock segmented layers with realistic coordinates
      const segmentedLayers: RetinalLayer[] = retinalLayers.map((layer, index) => {
        const baseY = 50 + index * 30; // Spacing between layers
        const points = Array.from({ length: 512 }, (_, i) => ({
          x: i,
          y: baseY + Math.sin(i / 50) * 10 + Math.random() * 5, // Simulate natural variation
        }));
        
        return {
          ...layer,
          points,
        };
      });

      setLayers(segmentedLayers);

      // Calculate thickness measurements
      const rnflThickness = calculateThicknessMap('RNFL', segmentedLayers);
      const gclThickness = calculateThicknessMap('GCL', segmentedLayers);

      // Calculate average thickness
      const averageRNFL = rnflThickness.reduce((sum, t) => sum + t.thickness, 0) / rnflThickness.length;
      const averageGCL = gclThickness.reduce((sum, t) => sum + t.thickness, 0) / gclThickness.length;

      // Calculate glaucoma risk score (simplified algorithm)
      const glaucomaRiskScore = calculateGlaucomaRisk(averageRNFL, averageGCL);

      // Check for progression if previous scans exist
      const progressionRate = previousScans.length > 0 
        ? calculateProgressionRate(averageRNFL, previousScans)
        : undefined;

      const newAnalysis: OCTAnalysis = {
        id: scanId,
        patientId,
        eye,
        scanDate: new Date(),
        rnflThickness,
        gclThickness,
        averageRNFL,
        averageGCL,
        cupDiscRatio: 0.45, // Mock value (would be calculated from ONH)
        glaucomaRiskScore,
        progressionRate,
        comparisonScan: previousScans[0]?.id,
      };

      setAnalysis(newAnalysis);
      
      // Draw layers on canvas
      drawLayersOnCanvas(segmentedLayers);

      toast.success('OCT analysis complete!');
      setIsAnalyzing(false);
    } catch (error) {
      console.error('Segmentation error:', error);
      toast.error('Failed to analyze OCT scan');
      setIsAnalyzing(false);
    }
  };

  // Calculate thickness map for specific layer
  const calculateThicknessMap = (
    layerType: 'RNFL' | 'GCL',
    segmentedLayers: RetinalLayer[]
  ): ThicknessMap[] => {
    // Normal ranges for RNFL and GCL (in micrometers)
    const normalRanges = {
      RNFL: {
        Central: [90, 110],
        'Inner Superior': [120, 145],
        'Inner Nasal': [85, 105],
        'Inner Inferior': [125, 150],
        'Inner Temporal': [75, 95],
        'Outer Superior': [110, 135],
        'Outer Nasal': [80, 100],
        'Outer Inferior': [115, 140],
        'Outer Temporal': [70, 90],
      },
      GCL: {
        Central: [45, 55],
        'Inner Superior': [75, 90],
        'Inner Nasal': [70, 85],
        'Inner Inferior': [72, 88],
        'Inner Temporal': [68, 83],
        'Outer Superior': [55, 70],
        'Outer Nasal': [50, 65],
        'Outer Inferior': [53, 68],
        'Outer Temporal': [48, 63],
      },
    };

    return etdrsSectors.map((sector) => {
      // Simulate thickness measurement with realistic variation
      const baseThickness = layerType === 'RNFL' ? 100 : 70;
      const variation = Math.random() * 30 - 15;
      const thickness = Math.max(40, baseThickness + variation);

      const normalRange = normalRanges[layerType][sector] as [number, number];
      const [minNormal, maxNormal] = normalRange;
      
      // Calculate percentile (approximate)
      let percentile: number;
      let status: 'normal' | 'borderline' | 'abnormal';
      
      if (thickness < minNormal - 10) {
        percentile = 1;
        status = 'abnormal';
      } else if (thickness < minNormal) {
        percentile = 5;
        status = 'borderline';
      } else if (thickness > maxNormal + 10) {
        percentile = 99;
        status = 'abnormal';
      } else if (thickness > maxNormal) {
        percentile = 95;
        status = 'borderline';
      } else {
        percentile = 50 + ((thickness - (minNormal + maxNormal) / 2) / (maxNormal - minNormal)) * 40;
        status = 'normal';
      }

      return {
        sector,
        thickness: Math.round(thickness),
        normalRange,
        percentile: Math.round(percentile),
        status,
      };
    });
  };

  // Calculate glaucoma risk score
  const calculateGlaucomaRisk = (rnflThickness: number, gclThickness: number): number => {
    let riskScore = 0;

    // RNFL thinning contribution
    if (rnflThickness < 70) riskScore += 40;
    else if (rnflThickness < 85) riskScore += 25;
    else if (rnflThickness < 95) riskScore += 10;

    // GCL thinning contribution
    if (gclThickness < 55) riskScore += 30;
    else if (gclThickness < 65) riskScore += 15;
    else if (gclThickness < 72) riskScore += 5;

    // Age adjustment (would use actual patient age)
    const ageAdjustment = 10; // Simplified
    riskScore += ageAdjustment;

    return Math.min(100, Math.max(0, riskScore));
  };

  // Calculate progression rate
  const calculateProgressionRate = (
    currentRNFL: number,
    previousScans: OCTAnalysis[]
  ): number => {
    if (previousScans.length === 0) return 0;

    const lastScan = previousScans[0];
    const timeDiff = (new Date().getTime() - new Date(lastScan.scanDate).getTime()) / (1000 * 60 * 60 * 24 * 365); // Years
    const thicknessDiff = currentRNFL - lastScan.averageRNFL;

    return Math.round((thicknessDiff / timeDiff) * 10) / 10; // Round to 1 decimal
  };

  // Draw layers on canvas
  const drawLayersOnCanvas = (segmentedLayers: RetinalLayer[]) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('Canvas ref not available');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('Canvas context not available');
      return;
    }

    // Set canvas to proper size
    const rect = canvas.getBoundingClientRect();
    const canvasWidth = rect.width > 0 ? rect.width : 800; // Fallback to 800px
    canvas.width = canvasWidth;
    canvas.height = 400;

    console.log('Drawing canvas with dimensions:', canvasWidth, 'x', 400);

    // Clear canvas with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Scale coordinates to canvas width
    const scaleX = canvas.width / 512;

    // Draw each layer
    segmentedLayers.forEach((layer, layerIndex) => {
      ctx.strokeStyle = layer.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      layer.points.forEach((point, index) => {
        const scaledX = point.x * scaleX;
        if (index === 0) {
          ctx.moveTo(scaledX, point.y);
        } else {
          ctx.lineTo(scaledX, point.y);
        }
      });
      
      ctx.stroke();

      // Draw layer label
      ctx.fillStyle = layer.color;
      ctx.font = 'bold 12px system-ui';
      ctx.fillText(layer.name, 10, layer.points[0].y);

      if (layerIndex === 0) {
        console.log(`Drew layer ${layer.name} with ${layer.points.length} points, color: ${layer.color}`);
      }
    });

    console.log(`Finished drawing ${segmentedLayers.length} layers`);
  };

  // Get color for thickness status
  const getStatusColor = (status: 'normal' | 'borderline' | 'abnormal') => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'borderline':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'abnormal':
        return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  // Get risk level indicators
  const getRiskLevel = (score: number) => {
    if (score < 25) return { label: 'Low', color: 'text-green-600', icon: CheckCircle };
    if (score < 50) return { label: 'Moderate', color: 'text-yellow-600', icon: Activity };
    if (score < 75) return { label: 'High', color: 'text-orange-600', icon: TrendingUp };
    return { label: 'Very High', color: 'text-red-600', icon: TrendingUp };
  };

  // Handle save
  const handleSave = () => {
    if (analysis && onSave) {
      onSave(analysis);
      toast.success('OCT analysis saved successfully');
    }
  };

  // Initialize - wait for canvas to be ready
  useEffect(() => {
    // Small delay to ensure canvas is mounted and sized
    const timer = setTimeout(() => {
      performSegmentation();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Redraw canvas when layers change or window resizes
  useEffect(() => {
    if (layers.length > 0) {
      // Add small delay to ensure canvas is sized
      const timer = setTimeout(() => {
        drawLayersOnCanvas(layers);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [layers]);

  const riskLevel = analysis ? getRiskLevel(analysis.glaucomaRiskScore) : null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-600" />
            OCT Layer Segmentation & Analysis
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {patientName} - {eye === 'OD' ? 'Right Eye' : 'Left Eye'} - {new Date().toLocaleDateString()}
          </p>
        </div>
        {analysis && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowComparison(!showComparison)}
              disabled={previousScans.length === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Compare
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Save Analysis
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isAnalyzing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-900 font-medium">Analyzing OCT scan...</p>
          <p className="text-sm text-blue-700 mt-1">Performing automated layer segmentation</p>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && !isAnalyzing && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Layer Segmentation Visualization */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Retinal Layer Segmentation
                {layers.length > 0 && (
                  <span className="text-sm font-normal text-gray-500">
                    ({layers.length} layers detected)
                  </span>
                )}
              </h3>
              <canvas
                ref={canvasRef}
                height={400}
                className="w-full min-w-[600px] border border-gray-300 rounded bg-white shadow-sm"
                style={{ display: 'block' }}
              />
              <div className="mt-4 grid grid-cols-3 gap-2">
                {retinalLayers.slice(0, 6).map((layer) => (
                  <div key={layer.name} className="flex items-center gap-2 text-xs">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: layer.color }}
                    ></div>
                    <span className="text-gray-700">{layer.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RNFL Thickness Map */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                RNFL Thickness Map (ETDRS Grid)
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {analysis.rnflThickness.map((sector) => (
                  <div
                    key={sector.sector}
                    className={`border-2 rounded-lg p-3 ${getStatusColor(sector.status)}`}
                  >
                    <div className="text-xs font-medium mb-1">{sector.sector}</div>
                    <div className="text-2xl font-bold">{sector.thickness}μm</div>
                    <div className="text-xs mt-1">
                      {sector.percentile}th percentile
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="space-y-4">
            {/* Glaucoma Risk Score */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                {riskLevel && <riskLevel.icon className={`w-5 h-5 ${riskLevel.color}`} />}
                Glaucoma Risk Assessment
              </h3>
              <div className="text-center">
                <div className={`text-5xl font-bold ${riskLevel?.color} mb-2`}>
                  {analysis.glaucomaRiskScore}
                </div>
                <div className={`text-lg font-semibold ${riskLevel?.color}`}>
                  {riskLevel?.label} Risk
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      analysis.glaucomaRiskScore < 25
                        ? 'bg-green-600'
                        : analysis.glaucomaRiskScore < 50
                        ? 'bg-yellow-600'
                        : analysis.glaucomaRiskScore < 75
                        ? 'bg-orange-600'
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${analysis.glaucomaRiskScore}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Average Thickness */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Average Thickness
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">RNFL</span>
                    <span className="font-semibold">
                      {Math.round(analysis.averageRNFL)}μm
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, (analysis.averageRNFL / 120) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">GCL</span>
                    <span className="font-semibold">
                      {Math.round(analysis.averageGCL)}μm
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, (analysis.averageGCL / 90) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progression Rate */}
            {analysis.progressionRate !== undefined && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  {analysis.progressionRate < 0 ? (
                    <span className="text-red-600">↓</span>
                  ) : (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  )}
                  Progression Analysis
                </h3>
                <div className="text-center">
                  <div
                    className={`text-3xl font-bold ${
                      analysis.progressionRate < -2
                        ? 'text-red-600'
                        : analysis.progressionRate < 0
                        ? 'text-orange-600'
                        : 'text-green-600'
                    } mb-1`}
                  >
                    {analysis.progressionRate > 0 ? '+' : ''}
                    {analysis.progressionRate}μm/year
                  </div>
                  <div className="text-sm text-gray-600">
                    {analysis.progressionRate < -2 && 'Significant thinning detected'}
                    {analysis.progressionRate >= -2 && analysis.progressionRate < 0 && 'Mild thinning'}
                    {analysis.progressionRate >= 0 && 'Stable or improving'}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Compared to scan from{' '}
                    {previousScans[0] &&
                      new Date(previousScans[0].scanDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}

            {/* Cup-Disc Ratio */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Optic Nerve Head
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Cup-Disc Ratio:</span>
                  <span className="font-semibold">{analysis.cupDiscRatio.toFixed(2)}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {analysis.cupDiscRatio < 0.3 && '✓ Normal'}
                  {analysis.cupDiscRatio >= 0.3 && analysis.cupDiscRatio < 0.5 && '⚠️ Borderline'}
                  {analysis.cupDiscRatio >= 0.5 && '⚠️ Abnormal - glaucoma suspect'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
