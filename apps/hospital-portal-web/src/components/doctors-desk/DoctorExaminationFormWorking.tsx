'use client';

import { useState, useMemo } from 'react';
import { Save, History, Eye, Droplet, Target, Stethoscope } from 'lucide-react';
import AlertBanner, { Alert } from './AlertBanner';
import OptometrySummaryPanel from './OptometrySummaryPanel';

interface DoctorExaminationFormProps {
  patientId: string;
  patientData: any;
  optometryData: any;
  onSave: (data: any) => void;
  canEdit: boolean;
}

export default function DoctorExaminationFormWorking({
  patientId,
  patientData,
  optometryData,
  onSave,
  canEdit,
}: DoctorExaminationFormProps) {
  const [activeSection, setActiveSection] = useState('history');
  const [chiefComplaint, setChiefComplaint] = useState(patientData?.chiefComplaint || '');
  const [historyPresentIllness, setHistoryPresentIllness] = useState('');
  
  // Slit Lamp state
  const [slitLampOD, setSlitLampOD] = useState({
    lids: 'Normal',
    conjunctiva: 'Normal',
    cornea: 'Clear',
    lens: 'Clear',
  });
  
  const [slitLampOS, setSlitLampOS] = useState({
    lids: 'Normal',
    conjunctiva: 'Normal',
    cornea: 'Clear',
    lens: 'Clear',
  });
  
  // Fundus state
  const [fundusOD, setFundusOD] = useState({
    opticDisc: 'Normal',
    macula: 'Normal',
    vessels: 'Normal',
    retina: 'Normal',
  });
  
  const [fundusOS, setFundusOS] = useState({
    opticDisc: 'Normal',
    macula: 'Normal',
    vessels: 'Normal',
    retina: 'Normal',
  });
  
  // Diagnosis state
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('');
  const [icd10Code, setIcd10Code] = useState('');
  const [secondaryDiagnoses, setSecondaryDiagnoses] = useState('');
  const [differentialDiagnoses, setDifferentialDiagnoses] = useState('');
  const [severity, setSeverity] = useState('Moderate');
  
  // Treatment state
  const [medications, setMedications] = useState('');
  const [opticalPrescription, setOpticalPrescription] = useState(false);
  const [specialtyReferral, setSpecialtyReferral] = useState('');
  const [surgeryRecommended, setSurgeryRecommended] = useState(false);
  const [surgeryDetails, setSurgeryDetails] = useState('');
  const [investigations, setInvestigations] = useState<string[]>([]);
  const [followUpDate, setFollowUpDate] = useState('');
  const [treatmentNotes, setTreatmentNotes] = useState('');

  // Generate alerts based on optometry data
  const alerts = useMemo(() => {
    if (!optometryData) return [];
    const generatedAlerts: Alert[] = [];

    // High IOP alert
    if (optometryData.iop) {
      if (optometryData.iop.od && optometryData.iop.od > 21) {
        generatedAlerts.push({
          id: 'high-iop-od',
          severity: 'critical',
          message: `High IOP detected in right eye: ${optometryData.iop.od} mmHg`,
          details: 'Immediate evaluation required.',
        });
      }
      if (optometryData.iop.os && optometryData.iop.os > 21) {
        generatedAlerts.push({
          id: 'high-iop-os',
          severity: 'critical',
          message: `High IOP detected in left eye: ${optometryData.iop.os} mmHg`,
          details: 'Immediate evaluation required.',
        });
      }
    }

    return generatedAlerts;
  }, [optometryData]);

  const sections = [
    { id: 'history', label: 'History', icon: History },
    { id: 'slit-lamp', label: 'Slit Lamp', icon: Eye },
    { id: 'fundus', label: 'Fundus', icon: Droplet },
    { id: 'diagnosis', label: 'Diagnosis', icon: Target },
    { id: 'treatment', label: 'Treatment', icon: Stethoscope },
  ];

  const handleSave = () => {
    onSave({ 
      patientId, 
      chiefComplaint, 
      historyPresentIllness,
      slitLampOD,
      slitLampOS,
      fundusOD,
      fundusOS,
      primaryDiagnosis,
      icd10Code,
      secondaryDiagnoses,
      differentialDiagnoses,
      severity,
      medications,
      opticalPrescription,
      specialtyReferral,
      surgeryRecommended,
      surgeryDetails,
      investigations,
      followUpDate,
      treatmentNotes,
    });
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
      {alerts.length > 0 && (
        <div className="p-6 pb-0">
          <AlertBanner alerts={alerts} />
        </div>
      )}

      {optometryData && (
        <div className="p-6 pb-0">
          <OptometrySummaryPanel
            data={optometryData}
            onEdit={() => console.log('Edit optometry data')}
            editable={false}
          />
        </div>
      )}

      <div className="flex border-b-2 border-gray-200 bg-gray-50">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex-1 flex items-center justify-center space-x-2 p-4 font-semibold transition-colors ${
                activeSection === section.id
                  ? 'bg-blue-600 text-white border-b-4 border-blue-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{section.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-6">
        {activeSection === 'history' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">History & Presenting Complaint</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Chief Complaint</label>
              <textarea
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Describe the main complaint..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">History of Present Illness</label>
              <textarea
                value={historyPresentIllness}
                onChange={(e) => setHistoryPresentIllness(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={5}
                placeholder="Detailed history..."
              />
            </div>
          </div>
        )}

        {activeSection === 'slit-lamp' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Slit Lamp Examination</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
                <h4 className="font-semibold text-blue-900 mb-3">OD (Right Eye)</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Lids</label>
                    <select
                      value={slitLampOD.lids}
                      onChange={(e) => setSlitLampOD({...slitLampOD, lids: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    >
                      <option>Normal</option>
                      <option>Blepharitis</option>
                      <option>Ptosis</option>
                      <option>Chalazion</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Conjunctiva</label>
                    <select
                      value={slitLampOD.conjunctiva}
                      onChange={(e) => setSlitLampOD({...slitLampOD, conjunctiva: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    >
                      <option>Normal</option>
                      <option>Injection</option>
                      <option>Chemosis</option>
                      <option>Pterygium</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Cornea</label>
                    <select
                      value={slitLampOD.cornea}
                      onChange={(e) => setSlitLampOD({...slitLampOD, cornea: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    >
                      <option>Clear</option>
                      <option>Edema</option>
                      <option>Opacity</option>
                      <option>Ulcer</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Lens</label>
                    <select
                      value={slitLampOD.lens}
                      onChange={(e) => setSlitLampOD({...slitLampOD, lens: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    >
                      <option>Clear</option>
                      <option>Nuclear Sclerosis</option>
                      <option>Cortical Cataract</option>
                      <option>PSC</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50">
                <h4 className="font-semibold text-green-900 mb-3">OS (Left Eye)</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Lids</label>
                    <select
                      value={slitLampOS.lids}
                      onChange={(e) => setSlitLampOS({...slitLampOS, lids: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    >
                      <option>Normal</option>
                      <option>Blepharitis</option>
                      <option>Ptosis</option>
                      <option>Chalazion</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Conjunctiva</label>
                    <select
                      value={slitLampOS.conjunctiva}
                      onChange={(e) => setSlitLampOS({...slitLampOS, conjunctiva: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    >
                      <option>Normal</option>
                      <option>Injection</option>
                      <option>Chemosis</option>
                      <option>Pterygium</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Cornea</label>
                    <select
                      value={slitLampOS.cornea}
                      onChange={(e) => setSlitLampOS({...slitLampOS, cornea: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    >
                      <option>Clear</option>
                      <option>Edema</option>
                      <option>Opacity</option>
                      <option>Ulcer</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Lens</label>
                    <select
                      value={slitLampOS.lens}
                      onChange={(e) => setSlitLampOS({...slitLampOS, lens: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    >
                      <option>Clear</option>
                      <option>Nuclear Sclerosis</option>
                      <option>Cortical Cataract</option>
                      <option>PSC</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'fundus' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Fundus Examination</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
                <h4 className="font-semibold text-blue-900 mb-3">OD (Right Eye)</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Optic Disc</label>
                    <select
                      value={fundusOD.opticDisc}
                      onChange={(e) => setFundusOD({...fundusOD, opticDisc: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    >
                      <option>Normal</option>
                      <option>Cupping</option>
                      <option>Pallor</option>
                      <option>Edema</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Macula</label>
                    <select
                      value={fundusOD.macula}
                      onChange={(e) => setFundusOD({...fundusOD, macula: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    >
                      <option>Normal</option>
                      <option>Drusen</option>
                      <option>Edema</option>
                      <option>Hemorrhage</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Vessels</label>
                    <select
                      value={fundusOD.vessels}
                      onChange={(e) => setFundusOD({...fundusOD, vessels: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    >
                      <option>Normal</option>
                      <option>Narrowing</option>
                      <option>Tortuosity</option>
                      <option>Hemorrhages</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Retina</label>
                    <select
                      value={fundusOD.retina}
                      onChange={(e) => setFundusOD({...fundusOD, retina: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    >
                      <option>Normal</option>
                      <option>Detachment</option>
                      <option>Tears</option>
                      <option>Diabetic Retinopathy</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50">
                <h4 className="font-semibold text-green-900 mb-3">OS (Left Eye)</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Optic Disc</label>
                    <select
                      value={fundusOS.opticDisc}
                      onChange={(e) => setFundusOS({...fundusOS, opticDisc: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    >
                      <option>Normal</option>
                      <option>Cupping</option>
                      <option>Pallor</option>
                      <option>Edema</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Macula</label>
                    <select
                      value={fundusOS.macula}
                      onChange={(e) => setFundusOS({...fundusOS, macula: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    >
                      <option>Normal</option>
                      <option>Drusen</option>
                      <option>Edema</option>
                      <option>Hemorrhage</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Vessels</label>
                    <select
                      value={fundusOS.vessels}
                      onChange={(e) => setFundusOS({...fundusOS, vessels: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    >
                      <option>Normal</option>
                      <option>Narrowing</option>
                      <option>Tortuosity</option>
                      <option>Hemorrhages</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Retina</label>
                    <select
                      value={fundusOS.retina}
                      onChange={(e) => setFundusOS({...fundusOS, retina: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    >
                      <option>Normal</option>
                      <option>Detachment</option>
                      <option>Tears</option>
                      <option>Diabetic Retinopathy</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'diagnosis' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Diagnosis & Assessment</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Primary Diagnosis *</label>
                <input
                  type="text"
                  value={primaryDiagnosis}
                  onChange={(e) => setPrimaryDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter primary diagnosis..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">ICD-10 Code</label>
                <input
                  type="text"
                  value={icd10Code}
                  onChange={(e) => setIcd10Code(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., H40.11"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Severity</label>
              <div className="flex space-x-4">
                {['Mild', 'Moderate', 'Severe'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSeverity(level)}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      severity === level
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Secondary Diagnoses</label>
              <textarea
                value={secondaryDiagnoses}
                onChange={(e) => setSecondaryDiagnoses(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Additional diagnoses (one per line)..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Differential Diagnoses</label>
              <textarea
                value={differentialDiagnoses}
                onChange={(e) => setDifferentialDiagnoses(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Consider these alternative diagnoses..."
              />
            </div>
          </div>
        )}

        {activeSection === 'treatment' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Treatment Plan</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Medications & Prescriptions</label>
              <textarea
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="e.g., Latanoprost 0.005% - 1 drop OD/OS at bedtime&#10;Timolol 0.5% - 1 drop OD/OS BID"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={opticalPrescription}
                    onChange={(e) => setOpticalPrescription(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">Optical Prescription Required</span>
                </label>
              </div>
              
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={surgeryRecommended}
                    onChange={(e) => setSurgeryRecommended(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">Surgery Recommended</span>
                </label>
              </div>
            </div>
            
            {surgeryRecommended && (
              <div>
                <label className="block text-sm font-medium mb-2">Surgery Details</label>
                <textarea
                  value={surgeryDetails}
                  onChange={(e) => setSurgeryDetails(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Procedure name, eye(s), urgency, pre-op requirements..."
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-2">Specialty Referral</label>
              <select
                value={specialtyReferral}
                onChange={(e) => setSpecialtyReferral(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No referral needed</option>
                <option value="Retina Specialist">Retina Specialist</option>
                <option value="Glaucoma Specialist">Glaucoma Specialist</option>
                <option value="Cornea Specialist">Cornea Specialist</option>
                <option value="Pediatric Ophthalmologist">Pediatric Ophthalmologist</option>
                <option value="Oculoplasty">Oculoplasty</option>
                <option value="Neuro-Ophthalmologist">Neuro-Ophthalmologist</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Investigations Required</label>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {['OCT', 'Visual Field', 'Fundus Photo', 'A-Scan', 'B-Scan', 'Pachymetry', 'Gonioscopy', 'Angiography'].map((inv) => (
                  <label key={inv} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={investigations.includes(inv)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setInvestigations([...investigations, inv]);
                        } else {
                          setInvestigations(investigations.filter(i => i !== inv));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm">{inv}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Follow-up Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Additional Treatment Notes</label>
              <textarea
                value={treatmentNotes}
                onChange={(e) => setTreatmentNotes(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Special instructions, patient education, lifestyle modifications..."
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-50 border-t-2 border-gray-200 p-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={!canEdit}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          <span>Save & Route Patient</span>
        </button>
      </div>
    </div>
  );
}
