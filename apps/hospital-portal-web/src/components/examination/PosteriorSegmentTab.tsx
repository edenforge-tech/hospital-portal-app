'use client';

import { useState, useEffect } from 'react';
import { ExamCard, ExamInput, ExamSelect, StatusBadge, ActionButton } from './ExamCard';
import { Eye, Target, Aperture, Waves, GitBranch } from 'lucide-react';

// Type definitions for Posterior Segment examination
interface PosteriorSegmentExamData {
  // Fundus Overview - OD
  mediaClarityOD?: string;
  isDilatedOD?: boolean;
  dilationDrug?: string;
  dilationTime?: string;
  overallFindingOD?: string;
  
  // Fundus Overview - OS
  mediaClarityOS?: string;
  isDilatedOS?: boolean;
  overallFindingOS?: string;
}

interface FundusExamData {
  // Optic Disc - OD
  cupDiscRatioOD?: string;
  discColorOD?: string;
  discMarginsOD?: string;
  discNvOD?: string;
  discHemorrhageOD?: string;
  peripapillaryAtrophyOD?: string;
  discNotesOD?: string;
  
  // Optic Disc - OS
  cupDiscRatioOS?: string;
  discColorOS?: string;
  discMarginsOS?: string;
  discNvOS?: string;
  discHemorrhageOS?: string;
  peripapillaryAtrophyOS?: string;
  discNotesOS?: string;
  
  // Macula - OD
  fovealReflexOD?: string;
  macularEdemaOD?: string;
  macularHemorrhageOD?: string;
  macularExudatesOD?: string;
  drusenOD?: string;
  macularScarOD?: string;
  maculaNotesOD?: string;
  
  // Macula - OS
  fovealReflexOS?: string;
  macularEdemaOS?: string;
  macularHemorrhageOS?: string;
  macularExudatesOS?: string;
  drusenOS?: string;
  macularScarOS?: string;
  maculaNotesOS?: string;
  
  // Retina - OD
  retinaConfigOD?: string;
  retinalTearsOD?: string;
  retinalHemorrhageOD?: string;
  retinalExudatesOD?: string;
  diabeticRetinopathyOD?: string;
  peripheralDegenerationOD?: string;
  retinaNotesOD?: string;
  
  // Retina - OS
  retinaConfigOS?: string;
  retinalTearsOS?: string;
  retinalHemorrhageOS?: string;
  retinalExudatesOS?: string;
  diabeticRetinopathyOS?: string;
  peripheralDegenerationOS?: string;
  retinaNotesOS?: string;
  
  // Vessels - OD
  avRatioOD?: string;
  arterialChangesOD?: string[];
  venousChangesOD?: string[];
  avCrossingOD?: string;
  vesselNvOD?: string;
  vesselNotesOD?: string;
  
  // Vessels - OS
  avRatioOS?: string;
  arterialChangesOS?: string[];
  venousChangesOS?: string[];
  avCrossingOS?: string;
  vesselNvOS?: string;
  vesselNotesOS?: string;
}

interface PosteriorSegmentTabProps {
  posteriorSegmentData: PosteriorSegmentExamData | null;
  fundusExamData: FundusExamData | null;
  canEdit: boolean;
  onSavePosteriorSegment: (data: PosteriorSegmentExamData) => void;
  onSaveFundusExam: (data: FundusExamData) => void;
}

export default function PosteriorSegmentTab({
  posteriorSegmentData,
  fundusExamData,
  canEdit,
  onSavePosteriorSegment,
  onSaveFundusExam,
}: PosteriorSegmentTabProps) {
  // ========== POSTERIOR SEGMENT STATE (FUNDUS OVERVIEW) ==========
  const [posteriorData, setPosteriorData] = useState<PosteriorSegmentExamData>({
    mediaClarityOD: 'Clear',
    isDilatedOD: false,
    dilationDrug: undefined,
    dilationTime: undefined,
    overallFindingOD: 'Normal',
    mediaClarityOS: 'Clear',
    isDilatedOS: false,
    overallFindingOS: 'Normal',
  });
  const [posteriorHasChanges, setPosteriorHasChanges] = useState(false);
  const [posteriorSaving, setPosteriorSaving] = useState(false);

  // ========== FUNDUS EXAM STATE ==========
  const [fundusData, setFundusData] = useState<FundusExamData>({
    // Optic Disc defaults
    cupDiscRatioOD: '0.3',
    discColorOD: 'Pink',
    discMarginsOD: 'Distinct',
    discNvOD: 'Absent',
    discHemorrhageOD: 'Absent',
    peripapillaryAtrophyOD: 'Absent',
    discNotesOD: undefined,
    cupDiscRatioOS: '0.3',
    discColorOS: 'Pink',
    discMarginsOS: 'Distinct',
    discNvOS: 'Absent',
    discHemorrhageOS: 'Absent',
    peripapillaryAtrophyOS: 'Absent',
    discNotesOS: undefined,
    // Macula defaults
    fovealReflexOD: 'Present',
    macularEdemaOD: 'Absent',
    macularHemorrhageOD: 'Absent',
    macularExudatesOD: 'Absent',
    drusenOD: 'Absent',
    macularScarOD: 'Absent',
    maculaNotesOD: undefined,
    fovealReflexOS: 'Present',
    macularEdemaOS: 'Absent',
    macularHemorrhageOS: 'Absent',
    macularExudatesOS: 'Absent',
    drusenOS: 'Absent',
    macularScarOS: 'Absent',
    maculaNotesOS: undefined,
    // Retina defaults
    retinaConfigOD: 'Normal/Attached',
    retinalTearsOD: 'Absent',
    retinalHemorrhageOD: 'Absent',
    retinalExudatesOD: 'Absent',
    diabeticRetinopathyOD: 'None',
    peripheralDegenerationOD: 'Absent',
    retinaNotesOD: undefined,
    retinaConfigOS: 'Normal/Attached',
    retinalTearsOS: 'Absent',
    retinalHemorrhageOS: 'Absent',
    retinalExudatesOS: 'Absent',
    diabeticRetinopathyOS: 'None',
    peripheralDegenerationOS: 'Absent',
    retinaNotesOS: undefined,
    // Vessels defaults
    avRatioOD: '2:3',
    arterialChangesOD: [],
    venousChangesOD: [],
    avCrossingOD: 'None',
    vesselNvOD: 'Absent',
    vesselNotesOD: undefined,
    avRatioOS: '2:3',
    arterialChangesOS: [],
    venousChangesOS: [],
    avCrossingOS: 'None',
    vesselNvOS: 'Absent',
    vesselNotesOS: undefined,
  });
  const [fundusHasChanges, setFundusHasChanges] = useState(false);
  const [fundusSaving, setFundusSaving] = useState(false);

  // Load initial data
  useEffect(() => {
    if (posteriorSegmentData) {
      setPosteriorData(posteriorSegmentData);
    }
    if (fundusExamData) {
      setFundusData(fundusExamData);
    }
  }, [posteriorSegmentData, fundusExamData]);

  // ========== HANDLERS ==========
  const handlePosteriorChange = (field: keyof PosteriorSegmentExamData, value: any) => {
    setPosteriorData({ ...posteriorData, [field]: value });
    setPosteriorHasChanges(true);
  };

  const handleFundusChange = (field: keyof FundusExamData, value: any) => {
    setFundusData({ ...fundusData, [field]: value });
    setFundusHasChanges(true);
  };

  const handleCheckboxChange = (field: keyof FundusExamData, value: string, checked: boolean) => {
    const currentValues = (fundusData[field] as string[]) || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((v) => v !== value);
    handleFundusChange(field, newValues);
  };

  const handleSavePosterior = async () => {
    setPosteriorSaving(true);
    await onSavePosteriorSegment(posteriorData);
    setPosteriorHasChanges(false);
    setPosteriorSaving(false);
  };

  const handleSaveFundus = async () => {
    setFundusSaving(true);
    await onSaveFundusExam(fundusData);
    setFundusHasChanges(false);
    setFundusSaving(false);
  };

  // ========== STATUS HELPERS ==========
  const getPosteriorStatus = () => {
    const hasODData = posteriorData.mediaClarityOD || posteriorData.overallFindingOD;
    const hasOSData = posteriorData.mediaClarityOS || posteriorData.overallFindingOS;
    if (hasODData && hasOSData) return { text: 'Completed', variant: 'success' as const };
    if (hasODData || hasOSData) return { text: 'Partial', variant: 'info' as const };
    return { text: 'Pending', variant: 'pending' as const };
  };

  const getFundusStatus = () => {
    const hasDiscData = fundusData.cupDiscRatioOD || fundusData.cupDiscRatioOS;
    const hasMaculaData = fundusData.fovealReflexOD || fundusData.fovealReflexOS;
    const hasRetinaData = fundusData.retinaConfigOD || fundusData.retinaConfigOS;
    if (hasDiscData && hasMaculaData && hasRetinaData) return { text: 'Completed', variant: 'success' as const };
    if (hasDiscData || hasMaculaData || hasRetinaData) return { text: 'Partial', variant: 'info' as const };
    return { text: 'Pending', variant: 'pending' as const };
  };

  // ========== RENDER ==========
  return (
    <ExamCard
      title="Posterior Segment Examination"
      icon={<Eye className="w-5 h-5" />}
      badge={getFundusStatus()}
    >
      <div className="space-y-4">
        {/* Dilatation Status - Full Width Banner */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ExamSelect
              label="Dilatation Status"
              value={posteriorData.isDilatedOD || posteriorData.isDilatedOS ? 'dilated' : 'undilated'}
              onChange={(value) => {
                const isDilated = value === 'dilated';
                handlePosteriorChange('isDilatedOD', isDilated);
                handlePosteriorChange('isDilatedOS', isDilated);
                if (!isDilated) {
                  handlePosteriorChange('dilationDrug', undefined);
                  handlePosteriorChange('dilationTime', undefined);
                }
              }}
              disabled={!canEdit}
            >
              <option value="undilated">Undilated</option>
              <option value="dilated">Dilated</option>
            </ExamSelect>

            {(posteriorData.isDilatedOD || posteriorData.isDilatedOS) && (
              <>
                <ExamSelect
                  label="Dilatation Drug"
                  value={posteriorData.dilationDrug || ''}
                  onChange={(value) => handlePosteriorChange('dilationDrug', value || undefined)}
                  disabled={!canEdit}
                >
                  <option value="">Select drug...</option>
                  <option value="Tropicamide 1%">Tropicamide 1%</option>
                  <option value="Phenylephrine 2.5%">Phenylephrine 2.5%</option>
                  <option value="Combination">Combination (Tropic + Phenyl)</option>
                </ExamSelect>

                <ExamInput
                  label="Dilatation Time"
                  type="time"
                  value={posteriorData.dilationTime || ''}
                  onChange={(e) => handlePosteriorChange('dilationTime', e.target.value || undefined)}
                  disabled={!canEdit}
                />
              </>
            )}
          </div>
        </div>

        {/* Compact 3-Column Grid: Label | OD | OS */}
        <div className="grid grid-cols-[220px_1fr_1fr] gap-x-4 gap-y-3 text-sm">
          {/* Column Headers */}
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide"></div>
          <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide text-center py-2 border-b border-blue-300">
            Right / OD
          </div>
          <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide text-center py-2 border-b border-emerald-300">
            Left / OS
          </div>

          {/* ========== FUNDUS OVERVIEW ========== */}
          <div className="col-span-3 pt-2 pb-1 border-b-2 border-blue-200 bg-blue-50 px-3 -mx-1">
            <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Fundus Overview
            </h4>
          </div>

          <label className="text-gray-600 font-medium py-2">Media Clarity</label>
          <ExamSelect
            value={posteriorData.mediaClarityOD || ''}
            onChange={(value) => handlePosteriorChange('mediaClarityOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Clear">Clear</option>
            <option value="Hazy">Hazy</option>
            <option value="Opaque">Opaque</option>
          </ExamSelect>
          <ExamSelect
            value={posteriorData.mediaClarityOS || ''}
            onChange={(value) => handlePosteriorChange('mediaClarityOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Clear">Clear</option>
            <option value="Hazy">Hazy</option>
            <option value="Opaque">Opaque</option>
          </ExamSelect>

          <label className="text-gray-600 font-medium py-2">Overall Finding</label>
          <ExamSelect
            value={posteriorData.overallFindingOD || ''}
            onChange={(value) => handlePosteriorChange('overallFindingOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Normal">Normal</option>
            <option value="Abnormal - specify below">Abnormal (specify below)</option>
          </ExamSelect>
          <ExamSelect
            value={posteriorData.overallFindingOS || ''}
            onChange={(value) => handlePosteriorChange('overallFindingOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Normal">Normal</option>
            <option value="Abnormal - specify below">Abnormal (specify below)</option>
          </ExamSelect>

          {/* ========== OPTIC DISC ========== */}
          <div className="col-span-3 pt-2 pb-1 border-b-2 border-purple-200 bg-purple-50 px-3 -mx-1 mt-2">
            <h4 className="text-sm font-semibold text-purple-900 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Optic Disc
            </h4>
          </div>

          <label className="text-gray-600 font-medium py-2">Cup/Disc Ratio</label>
          <ExamSelect
            value={fundusData.cupDiscRatioOD || ''}
            onChange={(value) => handleFundusChange('cupDiscRatioOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="0.1">0.1</option>
            <option value="0.2">0.2</option>
            <option value="0.3">0.3 (Normal)</option>
            <option value="0.4">0.4</option>
            <option value="0.5">0.5</option>
            <option value="0.6">0.6</option>
            <option value="0.7">0.7</option>
            <option value="0.8">0.8</option>
            <option value="0.9">0.9</option>
          </ExamSelect>
          <ExamSelect
            value={fundusData.cupDiscRatioOS || ''}
            onChange={(value) => handleFundusChange('cupDiscRatioOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="0.1">0.1</option>
            <option value="0.2">0.2</option>
            <option value="0.3">0.3 (Normal)</option>
            <option value="0.4">0.4</option>
            <option value="0.5">0.5</option>
            <option value="0.6">0.6</option>
            <option value="0.7">0.7</option>
            <option value="0.8">0.8</option>
            <option value="0.9">0.9</option>
          </ExamSelect>

          <label className="text-gray-600 font-medium py-2">Disc Color</label>
          <ExamSelect
            value={fundusData.discColorOD || ''}
            onChange={(value) => handleFundusChange('discColorOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Pink">Pink (Normal)</option>
            <option value="Pale">Pale</option>
            <option value="Hyperemic">Hyperemic</option>
            <option value="Atrophic">Atrophic</option>
          </ExamSelect>
          <ExamSelect
            value={fundusData.discColorOS || ''}
            onChange={(value) => handleFundusChange('discColorOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Pink">Pink (Normal)</option>
            <option value="Pale">Pale</option>
            <option value="Hyperemic">Hyperemic</option>
            <option value="Atrophic">Atrophic</option>
          </ExamSelect>

          <label className="text-gray-600 font-medium py-2">Disc Margins</label>
          <ExamSelect
            value={fundusData.discMarginsOD || ''}
            onChange={(value) => handleFundusChange('discMarginsOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Distinct">Distinct (Normal)</option>
            <option value="Blurred">Blurred</option>
            <option value="Indistinct">Indistinct</option>
          </ExamSelect>
          <ExamSelect
            value={fundusData.discMarginsOS || ''}
            onChange={(value) => handleFundusChange('discMarginsOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Distinct">Distinct (Normal)</option>
            <option value="Blurred">Blurred</option>
            <option value="Indistinct">Indistinct</option>
          </ExamSelect>

          <label className="text-gray-600 font-medium py-2">Disc Neovascularization</label>
          <ExamSelect
            value={fundusData.discNvOD || ''}
            onChange={(value) => handleFundusChange('discNvOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Absent">Absent</option>
            <option value="Present">Present</option>
          </ExamSelect>
          <ExamSelect
            value={fundusData.discNvOS || ''}
            onChange={(value) => handleFundusChange('discNvOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Absent">Absent</option>
            <option value="Present">Present</option>
          </ExamSelect>

          <label className="text-gray-600 font-medium py-2">Disc Hemorrhage</label>
          <ExamSelect
            value={fundusData.discHemorrhageOD || ''}
            onChange={(value) => handleFundusChange('discHemorrhageOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Absent">Absent</option>
            <option value="Present">Present</option>
          </ExamSelect>
          <ExamSelect
            value={fundusData.discHemorrhageOS || ''}
            onChange={(value) => handleFundusChange('discHemorrhageOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Absent">Absent</option>
            <option value="Present">Present</option>
          </ExamSelect>

          <label className="text-gray-600 font-medium py-2">Peripapillary Atrophy</label>
          <ExamSelect
            value={fundusData.peripapillaryAtrophyOD || ''}
            onChange={(value) => handleFundusChange('peripapillaryAtrophyOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Absent">Absent</option>
            <option value="Present">Present</option>
          </ExamSelect>
          <ExamSelect
            value={fundusData.peripapillaryAtrophyOS || ''}
            onChange={(value) => handleFundusChange('peripapillaryAtrophyOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Absent">Absent</option>
            <option value="Present">Present</option>
          </ExamSelect>

          {/* ========== MACULA ========== */}
          <div className="col-span-3 pt-2 pb-1 border-b-2 border-amber-200 bg-amber-50 px-3 -mx-1 mt-2">
            <h4 className="text-sm font-semibold text-amber-900 flex items-center gap-2">
              <Aperture className="w-4 h-4" />
              Macula
            </h4>
          </div>

          <label className="text-gray-600 font-medium py-2">Foveal Reflex</label>
          <ExamSelect
            value={fundusData.fovealReflexOD || ''}
            onChange={(value) => handleFundusChange('fovealReflexOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Present">Present (Normal)</option>
            <option value="Absent">Absent</option>
            <option value="Diminished">Diminished</option>
          </ExamSelect>
          <ExamSelect
            value={fundusData.fovealReflexOS || ''}
            onChange={(value) => handleFundusChange('fovealReflexOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Present">Present (Normal)</option>
            <option value="Absent">Absent</option>
            <option value="Diminished">Diminished</option>
          </ExamSelect>

          <label className="text-gray-600 font-medium py-2">Macular Edema</label>
          <ExamSelect
            value={fundusData.macularEdemaOD || ''}
            onChange={(value) => handleFundusChange('macularEdemaOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Absent">Absent</option>
            <option value="Mild">Mild</option>
            <option value="Moderate">Moderate</option>
            <option value="Severe">Severe</option>
          </ExamSelect>
          <ExamSelect
            value={fundusData.macularEdemaOS || ''}
            onChange={(value) => handleFundusChange('macularEdemaOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Absent">Absent</option>
            <option value="Mild">Mild</option>
            <option value="Moderate">Moderate</option>
            <option value="Severe">Severe</option>
          </ExamSelect>

          <label className="text-gray-600 font-medium py-2">Macular Hemorrhage</label>
          <ExamSelect
            value={fundusData.macularHemorrhageOD || ''}
            onChange={(value) => handleFundusChange('macularHemorrhageOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Absent">Absent</option>
            <option value="Present">Present</option>
          </ExamSelect>
          <ExamSelect
            value={fundusData.macularHemorrhageOS || ''}
            onChange={(value) => handleFundusChange('macularHemorrhageOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Absent">Absent</option>
            <option value="Present">Present</option>
          </ExamSelect>

          <label className="text-gray-600 font-medium py-2">Macular Exudates</label>
          <ExamSelect
            value={fundusData.macularExudatesOD || ''}
            onChange={(value) => handleFundusChange('macularExudatesOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Absent">Absent</option>
            <option value="Present">Present</option>
          </ExamSelect>
          <ExamSelect
            value={fundusData.macularExudatesOS || ''}
            onChange={(value) => handleFundusChange('macularExudatesOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Absent">Absent</option>
            <option value="Present">Present</option>
          </ExamSelect>

          <label className="text-gray-600 font-medium py-2">Drusen</label>
          <ExamSelect
            value={fundusData.drusenOD || ''}
            onChange={(value) => handleFundusChange('drusenOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Absent">Absent</option>
            <option value="Hard">Hard</option>
            <option value="Soft">Soft</option>
            <option value="Confluent">Confluent</option>
          </ExamSelect>
          <ExamSelect
            value={fundusData.drusenOS || ''}
            onChange={(value) => handleFundusChange('drusenOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Absent">Absent</option>
            <option value="Hard">Hard</option>
            <option value="Soft">Soft</option>
            <option value="Confluent">Confluent</option>
          </ExamSelect>

          <label className="text-gray-600 font-medium py-2">Macular Scar</label>
          <ExamSelect
            value={fundusData.macularScarOD || ''}
            onChange={(value) => handleFundusChange('macularScarOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Absent">Absent</option>
            <option value="Present">Present</option>
          </ExamSelect>
          <ExamSelect
            value={fundusData.macularScarOS || ''}
            onChange={(value) => handleFundusChange('macularScarOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Absent">Absent</option>
            <option value="Present">Present</option>
          </ExamSelect>

          {/* ========== RETINA ========== */}
          <div className="col-span-3 pt-2 pb-1 border-b-2 border-emerald-200 bg-emerald-50 px-3 -mx-1 mt-2">
            <h4 className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
              <Waves className="w-4 h-4" />
              Retina
            </h4>
          </div>

          <label className="text-gray-600 font-medium py-2">Configuration</label>
          <ExamSelect
            value={fundusData.retinaConfigOD || ''}
            onChange={(value) => handleFundusChange('retinaConfigOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Normal/Attached">Normal/Attached</option>
            <option value="Detached">Detached</option>
            <option value="Thinning">Thinning</option>
          </ExamSelect>
          <ExamSelect
            value={fundusData.retinaConfigOS || ''}
            onChange={(value) => handleFundusChange('retinaConfigOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Normal/Attached">Normal/Attached</option>
            <option value="Detached">Detached</option>
            <option value="Thinning">Thinning</option>
          </ExamSelect>

          <label className="text-gray-600 font-medium py-2">Retinal Tears</label>
          <ExamSelect
            value={fundusData.retinalTearsOD || ''}
            onChange={(value) => handleFundusChange('retinalTearsOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Absent">Absent</option>
            <option value="Present">Present</option>
          </ExamSelect>
          <ExamSelect
            value={fundusData.retinalTearsOS || ''}
            onChange={(value) => handleFundusChange('retinalTearsOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Absent">Absent</option>
            <option value="Present">Present</option>
          </ExamSelect>

          <label className="text-gray-600 font-medium py-2">Retinal Hemorrhage</label>
          <ExamSelect
            value={fundusData.retinalHemorrhageOD || ''}
            onChange={(value) => handleFundusChange('retinalHemorrhageOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Absent">Absent</option>
            <option value="Dot & Blot">Dot & Blot</option>
            <option value="Flame-shaped">Flame-shaped</option>
            <option value="Preretinal">Preretinal</option>
          </ExamSelect>
          <ExamSelect
            value={fundusData.retinalHemorrhageOS || ''}
            onChange={(value) => handleFundusChange('retinalHemorrhageOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Absent">Absent</option>
            <option value="Dot & Blot">Dot & Blot</option>
            <option value="Flame-shaped">Flame-shaped</option>
            <option value="Preretinal">Preretinal</option>
          </ExamSelect>

          <label className="text-gray-600 font-medium py-2">Retinal Exudates</label>
          <ExamSelect
            value={fundusData.retinalExudatesOD || ''}
            onChange={(value) => handleFundusChange('retinalExudatesOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Absent">Absent</option>
            <option value="Hard">Hard</option>
            <option value="Soft">Soft (Cotton-wool)</option>
          </ExamSelect>
          <ExamSelect
            value={fundusData.retinalExudatesOS || ''}
            onChange={(value) => handleFundusChange('retinalExudatesOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Absent">Absent</option>
            <option value="Hard">Hard</option>
            <option value="Soft">Soft (Cotton-wool)</option>
          </ExamSelect>

          <label className="text-gray-600 font-medium py-2">Diabetic Retinopathy</label>
          <ExamSelect
            value={fundusData.diabeticRetinopathyOD || ''}
            onChange={(value) => handleFundusChange('diabeticRetinopathyOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="None">None</option>
            <option value="Mild NPDR">Mild NPDR</option>
            <option value="Moderate NPDR">Moderate NPDR</option>
            <option value="Severe NPDR">Severe NPDR</option>
            <option value="PDR">PDR (Proliferative)</option>
          </ExamSelect>
          <ExamSelect
            value={fundusData.diabeticRetinopathyOS || ''}
            onChange={(value) => handleFundusChange('diabeticRetinopathyOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="None">None</option>
            <option value="Mild NPDR">Mild NPDR</option>
            <option value="Moderate NPDR">Moderate NPDR</option>
            <option value="Severe NPDR">Severe NPDR</option>
            <option value="PDR">PDR (Proliferative)</option>
          </ExamSelect>

          <label className="text-gray-600 font-medium py-2">Peripheral Degeneration</label>
          <ExamSelect
            value={fundusData.peripheralDegenerationOD || ''}
            onChange={(value) => handleFundusChange('peripheralDegenerationOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Absent">Absent</option>
            <option value="Lattice">Lattice</option>
            <option value="Paving Stone">Paving Stone</option>
            <option value="Other">Other</option>
          </ExamSelect>
          <ExamSelect
            value={fundusData.peripheralDegenerationOS || ''}
            onChange={(value) => handleFundusChange('peripheralDegenerationOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Absent">Absent</option>
            <option value="Lattice">Lattice</option>
            <option value="Paving Stone">Paving Stone</option>
            <option value="Other">Other</option>
          </ExamSelect>

          {/* ========== VESSELS ========== */}
          <div className="col-span-3 pt-2 pb-1 border-b-2 border-rose-200 bg-rose-50 px-3 -mx-1 mt-2">
            <h4 className="text-sm font-semibold text-rose-900 flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Retinal Vessels
            </h4>
          </div>

          <label className="text-gray-600 font-medium py-2">A/V Ratio</label>
          <ExamSelect
            value={fundusData.avRatioOD || ''}
            onChange={(value) => handleFundusChange('avRatioOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="2:3">2:3 (Normal)</option>
            <option value="1:2">1:2 (Narrowed)</option>
            <option value="1:3">1:3 (Severely narrowed)</option>
            <option value="1:1">1:1 (Dilated)</option>
          </ExamSelect>
          <ExamSelect
            value={fundusData.avRatioOS || ''}
            onChange={(value) => handleFundusChange('avRatioOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="2:3">2:3 (Normal)</option>
            <option value="1:2">1:2 (Narrowed)</option>
            <option value="1:3">1:3 (Severely narrowed)</option>
            <option value="1:1">1:1 (Dilated)</option>
          </ExamSelect>

          {/* Arterial Changes - Checkboxes */}
          <label className="text-gray-600 font-medium py-2">Arterial Changes</label>
          <div className="space-y-1">
            {['Narrowing', 'Tortuosity', 'Sheathing', 'Occlusion'].map((change) => (
              <label key={change} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(fundusData.arterialChangesOD || []).includes(change)}
                  onChange={(e) => handleCheckboxChange('arterialChangesOD', change, e.target.checked)}
                  disabled={!canEdit}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{change}</span>
              </label>
            ))}
          </div>
          <div className="space-y-1">
            {['Narrowing', 'Tortuosity', 'Sheathing', 'Occlusion'].map((change) => (
              <label key={change} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(fundusData.arterialChangesOS || []).includes(change)}
                  onChange={(e) => handleCheckboxChange('arterialChangesOS', change, e.target.checked)}
                  disabled={!canEdit}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">{change}</span>
              </label>
            ))}
          </div>

          {/* Venous Changes - Checkboxes */}
          <label className="text-gray-600 font-medium py-2">Venous Changes</label>
          <div className="space-y-1">
            {['Dilation', 'Tortuosity', 'Beading', 'Occlusion'].map((change) => (
              <label key={change} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(fundusData.venousChangesOD || []).includes(change)}
                  onChange={(e) => handleCheckboxChange('venousChangesOD', change, e.target.checked)}
                  disabled={!canEdit}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{change}</span>
              </label>
            ))}
          </div>
          <div className="space-y-1">
            {['Dilation', 'Tortuosity', 'Beading', 'Occlusion'].map((change) => (
              <label key={change} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(fundusData.venousChangesOS || []).includes(change)}
                  onChange={(e) => handleCheckboxChange('venousChangesOS', change, e.target.checked)}
                  disabled={!canEdit}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">{change}</span>
              </label>
            ))}
          </div>

          <label className="text-gray-600 font-medium py-2">AV Crossing Changes</label>
          <ExamSelect
            value={fundusData.avCrossingOD || ''}
            onChange={(value) => handleFundusChange('avCrossingOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="None">None</option>
            <option value="Nicking">Nicking</option>
            <option value="Banking">Banking</option>
            <option value="Deflection">Deflection</option>
          </ExamSelect>
          <ExamSelect
            value={fundusData.avCrossingOS || ''}
            onChange={(value) => handleFundusChange('avCrossingOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="None">None</option>
            <option value="Nicking">Nicking</option>
            <option value="Banking">Banking</option>
            <option value="Deflection">Deflection</option>
          </ExamSelect>

          <label className="text-gray-600 font-medium py-2">Neovascularization</label>
          <ExamSelect
            value={fundusData.vesselNvOD || ''}
            onChange={(value) => handleFundusChange('vesselNvOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Absent">Absent</option>
            <option value="NVD (Disc)">NVD (On Disc)</option>
            <option value="NVE (Elsewhere)">NVE (Elsewhere)</option>
            <option value="Both">Both</option>
          </ExamSelect>
          <ExamSelect
            value={fundusData.vesselNvOS || ''}
            onChange={(value) => handleFundusChange('vesselNvOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Absent">Absent</option>
            <option value="NVD (Disc)">NVD (On Disc)</option>
            <option value="NVE (Elsewhere)">NVE (Elsewhere)</option>
            <option value="Both">Both</option>
          </ExamSelect>
        </div>

        {/* Save Buttons - Always visible */}
        <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-gray-200">
          {(posteriorHasChanges || fundusHasChanges) && (
            <p className="text-sm text-amber-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              Unsaved changes
            </p>
          )}
          <div className="flex gap-2 ml-auto">
            <ActionButton 
              variant="secondary" 
              onClick={handleSavePosterior} 
              disabled={!canEdit || posteriorSaving || !posteriorHasChanges}
            >
              {posteriorSaving ? 'Saving...' : 'Save Overview'}
            </ActionButton>
            <ActionButton 
              variant="primary" 
              onClick={handleSaveFundus} 
              disabled={!canEdit || fundusSaving || !fundusHasChanges}
            >
              {fundusSaving ? 'Saving...' : 'Save Fundus Exam'}
            </ActionButton>
          </div>
        </div>
      </div>
    </ExamCard>
  );
}
