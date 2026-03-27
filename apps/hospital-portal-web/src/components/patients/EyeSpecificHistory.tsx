'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  TrendingUp, 
  Activity, 
  AlertCircle, 
  Plus,
  X,
  Calendar,
  Glasses,
  Droplets
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface EyeHistory {
  // Refractive Error History
  hasRefractiveError: boolean;
  refractiveErrorType?: ('Myopia' | 'Hyperopia' | 'Astigmatism' | 'Presbyopia')[];
  wearingGlasses: boolean;
  glassesSince?: string;
  wearingContactLenses: boolean;
  contactLensesSince?: string;
  
  // Intraocular Pressure History
  hasGlaucomaHistory: boolean;
  glaucomaType?: 'POAG' | 'Angle-Closure' | 'Normal-Tension' | 'Secondary' | 'Congenital';
  glaucomaDiagnosis?: string;
  currentIOPControlMedication?: string;
  
  // Diabetic Retinopathy Screening
  isDiabetic: boolean;
  diabetesDuration?: number; // years
  lastRetinopathyScreening?: string;
  retinopathySeverity?: 'No DR' | 'Mild NPDR' | 'Moderate NPDR' | 'Severe NPDR' | 'PDR';
  hasDiabeticMacularEdema: boolean;
  
  // Cataract History
  hasCataract: boolean;
  cataractEye?: 'OD' | 'OS' | 'OU';
  cataractGrade?: 'Nuclear' | 'Cortical' | 'Posterior Subcapsular' | 'Mixed';
  
  // Surgical History
  previousEyeSurgeries: {
    id: string;
    surgeryType: string;
    eye: 'OD' | 'OS';
    date: string;
    iolPower?: string;
    iolModel?: string;
    surgeon?: string;
    complications?: string;
  }[];
  
  // Other Eye Conditions
  otherConditions: string[];
  familyHistoryEyeDisease: string;
  
  // Current Medications (Eye-related)
  currentEyeDrops: {
    id: string;
    name: string;
    eye: 'OD' | 'OS' | 'OU';
    frequency: string;
    indication: string;
  }[];
}

interface EyeSpecificHistoryProps {
  data: EyeHistory;
  onChange: (data: EyeHistory) => void;
}

export function EyeSpecificHistory({ data, onChange }: EyeSpecificHistoryProps) {
  const [showSurgeryForm, setShowSurgeryForm] = useState(false);
  const [showMedicationForm, setShowMedicationForm] = useState(false);

  const handleFieldChange = (field: keyof EyeHistory, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addSurgery = () => {
    const newSurgery = {
      id: Date.now().toString(),
      surgeryType: '',
      eye: 'OD' as const,
      date: '',
      iolPower: '',
      iolModel: '',
      surgeon: '',
      complications: ''
    };
    handleFieldChange('previousEyeSurgeries', [...data.previousEyeSurgeries, newSurgery]);
    setShowSurgeryForm(true);
  };

  const removeSurgery = (id: string) => {
    handleFieldChange(
      'previousEyeSurgeries',
      data.previousEyeSurgeries.filter(s => s.id !== id)
    );
  };

  const updateSurgery = (id: string, field: string, value: any) => {
    handleFieldChange(
      'previousEyeSurgeries',
      data.previousEyeSurgeries.map(s => s.id === id ? { ...s, [field]: value } : s)
    );
  };

  const addMedication = () => {
    const newMed = {
      id: Date.now().toString(),
      name: '',
      eye: 'OU' as const,
      frequency: '',
      indication: ''
    };
    handleFieldChange('currentEyeDrops', [...data.currentEyeDrops, newMed]);
    setShowMedicationForm(true);
  };

  const removeMedication = (id: string) => {
    handleFieldChange(
      'currentEyeDrops',
      data.currentEyeDrops.filter(m => m.id !== id)
    );
  };

  const updateMedication = (id: string, field: string, value: any) => {
    handleFieldChange(
      'currentEyeDrops',
      data.currentEyeDrops.map(m => m.id === id ? { ...m, [field]: value } : m)
    );
  };

  const refractiveErrorTypes: ('Myopia' | 'Hyperopia' | 'Astigmatism' | 'Presbyopia')[] = [
    'Myopia', 'Hyperopia', 'Astigmatism', 'Presbyopia'
  ];

  const eyeConditions = [
    'Age-related Macular Degeneration (AMD)',
    'Retinal Detachment',
    'Keratoconus',
    'Dry Eye Syndrome',
    'Corneal Ulcer',
    'Uveitis',
    'Amblyopia',
    'Strabismus',
    'Retinitis Pigmentosa',
    'Optic Neuritis'
  ];

  return (
    <div className="space-y-6">
      {/* Refractive Error Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Glasses className="h-5 w-5 text-blue-500" />
            Refractive Error & Vision Correction
          </CardTitle>
          <CardDescription>
            Patient's current vision correction methods and refractive history
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasRefractiveError"
              checked={data.hasRefractiveError}
              onCheckedChange={(checked) => handleFieldChange('hasRefractiveError', checked)}
            />
            <Label htmlFor="hasRefractiveError" className="cursor-pointer">
              Has Refractive Error (Myopia, Hyperopia, Astigmatism, Presbyopia)
            </Label>
          </div>

          {data.hasRefractiveError && (
            <div className="ml-6 space-y-4 border-l-2 border-blue-200 pl-4">
              <div>
                <Label>Type of Refractive Error</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {refractiveErrorTypes.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`ref-${type}`}
                        checked={data.refractiveErrorType?.includes(type)}
                        onCheckedChange={(checked) => {
                          const current = data.refractiveErrorType || [];
                          const updated = checked
                            ? [...current, type]
                            : current.filter(t => t !== type);
                          handleFieldChange('refractiveErrorType', updated);
                        }}
                      />
                      <Label htmlFor={`ref-${type}`} className="cursor-pointer">
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="wearingGlasses"
                    checked={data.wearingGlasses}
                    onCheckedChange={(checked) => handleFieldChange('wearingGlasses', checked)}
                  />
                  <Label htmlFor="wearingGlasses" className="cursor-pointer">
                    Currently wearing glasses
                  </Label>
                </div>
                {data.wearingGlasses && (
                  <div>
                    <Label htmlFor="glassesSince">Since (year)</Label>
                    <Input
                      id="glassesSince"
                      type="number"
                      placeholder="e.g., 2015"
                      value={data.glassesSince || ''}
                      onChange={(e) => handleFieldChange('glassesSince', e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="wearingContactLenses"
                    checked={data.wearingContactLenses}
                    onCheckedChange={(checked) => handleFieldChange('wearingContactLenses', checked)}
                  />
                  <Label htmlFor="wearingContactLenses" className="cursor-pointer">
                    Currently wearing contact lenses
                  </Label>
                </div>
                {data.wearingContactLenses && (
                  <div>
                    <Label htmlFor="contactLensesSince">Since (year)</Label>
                    <Input
                      id="contactLensesSince"
                      type="number"
                      placeholder="e.g., 2018"
                      value={data.contactLensesSince || ''}
                      onChange={(e) => handleFieldChange('contactLensesSince', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Glaucoma & IOP History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-500" />
            Glaucoma & Intraocular Pressure History
          </CardTitle>
          <CardDescription>
            History of elevated IOP, glaucoma diagnosis, and current medications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasGlaucomaHistory"
              checked={data.hasGlaucomaHistory}
              onCheckedChange={(checked) => handleFieldChange('hasGlaucomaHistory', checked)}
            />
            <Label htmlFor="hasGlaucomaHistory" className="cursor-pointer">
              History of Glaucoma or Ocular Hypertension
            </Label>
          </div>

          {data.hasGlaucomaHistory && (
            <div className="ml-6 space-y-4 border-l-2 border-purple-200 pl-4">
              <div>
                <Label htmlFor="glaucomaType">Type of Glaucoma</Label>
                <Select
                  value={data.glaucomaType}
                  onValueChange={(value) => handleFieldChange('glaucomaType', value)}
                >
                  <SelectTrigger id="glaucomaType">
                    <SelectValue placeholder="Select glaucoma type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POAG">Primary Open-Angle Glaucoma (POAG)</SelectItem>
                    <SelectItem value="Angle-Closure">Angle-Closure Glaucoma</SelectItem>
                    <SelectItem value="Normal-Tension">Normal-Tension Glaucoma</SelectItem>
                    <SelectItem value="Secondary">Secondary Glaucoma</SelectItem>
                    <SelectItem value="Congenital">Congenital Glaucoma</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="glaucomaDiagnosis">Date of Diagnosis</Label>
                <Input
                  id="glaucomaDiagnosis"
                  type="date"
                  value={data.glaucomaDiagnosis || ''}
                  onChange={(e) => handleFieldChange('glaucomaDiagnosis', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="currentIOPControlMedication">Current IOP-Lowering Medications</Label>
                <Textarea
                  id="currentIOPControlMedication"
                  placeholder="e.g., Latanoprost 0.005% OD nightly, Timolol 0.5% OU BD"
                  value={data.currentIOPControlMedication || ''}
                  onChange={(e) => handleFieldChange('currentIOPControlMedication', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diabetic Retinopathy Screening */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-red-500" />
            Diabetic Retinopathy Screening
          </CardTitle>
          <CardDescription>
            Diabetes status and retinopathy screening history
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDiabetic"
              checked={data.isDiabetic}
              onCheckedChange={(checked) => handleFieldChange('isDiabetic', checked)}
            />
            <Label htmlFor="isDiabetic" className="cursor-pointer">
              Patient has Diabetes Mellitus
            </Label>
          </div>

          {data.isDiabetic && (
            <div className="ml-6 space-y-4 border-l-2 border-red-200 pl-4">
              <div>
                <Label htmlFor="diabetesDuration">Duration of Diabetes (years)</Label>
                <Input
                  id="diabetesDuration"
                  type="number"
                  placeholder="e.g., 5"
                  value={data.diabetesDuration || ''}
                  onChange={(e) => handleFieldChange('diabetesDuration', parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label htmlFor="lastRetinopathyScreening">Last Retinopathy Screening Date</Label>
                <Input
                  id="lastRetinopathyScreening"
                  type="date"
                  value={data.lastRetinopathyScreening || ''}
                  onChange={(e) => handleFieldChange('lastRetinopathyScreening', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="retinopathySeverity">Retinopathy Severity (if diagnosed)</Label>
                <Select
                  value={data.retinopathySeverity}
                  onValueChange={(value) => handleFieldChange('retinopathySeverity', value)}
                >
                  <SelectTrigger id="retinopathySeverity">
                    <SelectValue placeholder="Select severity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No DR">No Diabetic Retinopathy</SelectItem>
                    <SelectItem value="Mild NPDR">Mild Non-Proliferative DR</SelectItem>
                    <SelectItem value="Moderate NPDR">Moderate Non-Proliferative DR</SelectItem>
                    <SelectItem value="Severe NPDR">Severe Non-Proliferative DR</SelectItem>
                    <SelectItem value="PDR">Proliferative Diabetic Retinopathy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasDiabeticMacularEdema"
                  checked={data.hasDiabeticMacularEdema}
                  onCheckedChange={(checked) => handleFieldChange('hasDiabeticMacularEdema', checked)}
                />
                <Label htmlFor="hasDiabeticMacularEdema" className="cursor-pointer">
                  Has Diabetic Macular Edema (DME)
                </Label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cataract History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-amber-500" />
            Cataract History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasCataract"
              checked={data.hasCataract}
              onCheckedChange={(checked) => handleFieldChange('hasCataract', checked)}
            />
            <Label htmlFor="hasCataract" className="cursor-pointer">
              Patient has Cataract
            </Label>
          </div>

          {data.hasCataract && (
            <div className="ml-6 space-y-4 border-l-2 border-amber-200 pl-4">
              <div>
                <Label htmlFor="cataractEye">Affected Eye</Label>
                <Select
                  value={data.cataractEye}
                  onValueChange={(value) => handleFieldChange('cataractEye', value)}
                >
                  <SelectTrigger id="cataractEye">
                    <SelectValue placeholder="Select eye" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OD">Right Eye (OD)</SelectItem>
                    <SelectItem value="OS">Left Eye (OS)</SelectItem>
                    <SelectItem value="OU">Both Eyes (OU)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cataractGrade">Cataract Type/Grade</Label>
                <Select
                  value={data.cataractGrade}
                  onValueChange={(value) => handleFieldChange('cataractGrade', value)}
                >
                  <SelectTrigger id="cataractGrade">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nuclear">Nuclear Sclerotic</SelectItem>
                    <SelectItem value="Cortical">Cortical</SelectItem>
                    <SelectItem value="Posterior Subcapsular">Posterior Subcapsular</SelectItem>
                    <SelectItem value="Mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Surgical History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              Previous Eye Surgeries
            </div>
            <Button type="button" size="sm" onClick={addSurgery}>
              <Plus className="h-4 w-4 mr-1" />
              Add Surgery
            </Button>
          </CardTitle>
          <CardDescription>
            Record all previous eye surgeries including cataract with IOL details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.previousEyeSurgeries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No previous eye surgeries recorded. Click "Add Surgery" to add one.
            </p>
          ) : (
            data.previousEyeSurgeries.map((surgery) => (
              <Card key={surgery.id} className="border border-green-200">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Surgery #{data.previousEyeSurgeries.indexOf(surgery) + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSurgery(surgery.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Surgery Type</Label>
                      <Input
                        placeholder="e.g., Phacoemulsification with IOL"
                        value={surgery.surgeryType}
                        onChange={(e) => updateSurgery(surgery.id, 'surgeryType', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Eye</Label>
                      <Select
                        value={surgery.eye}
                        onValueChange={(value) => updateSurgery(surgery.id, 'eye', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OD">Right Eye (OD)</SelectItem>
                          <SelectItem value="OS">Left Eye (OS)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Surgery Date</Label>
                      <Input
                        type="date"
                        value={surgery.date}
                        onChange={(e) => updateSurgery(surgery.id, 'date', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Surgeon Name</Label>
                      <Input
                        placeholder="Dr. Name"
                        value={surgery.surgeon || ''}
                        onChange={(e) => updateSurgery(surgery.id, 'surgeon', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>IOL Power (if applicable)</Label>
                      <Input
                        placeholder="e.g., +22.0 D"
                        value={surgery.iolPower || ''}
                        onChange={(e) => updateSurgery(surgery.id, 'iolPower', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>IOL Model</Label>
                      <Input
                        placeholder="e.g., Alcon AcrySof IQ SN60WF"
                        value={surgery.iolModel || ''}
                        onChange={(e) => updateSurgery(surgery.id, 'iolModel', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Complications (if any)</Label>
                    <Textarea
                      placeholder="e.g., Posterior capsule rupture, managed with anterior vitrectomy"
                      value={surgery.complications || ''}
                      onChange={(e) => updateSurgery(surgery.id, 'complications', e.target.value)}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Current Eye Medications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-500" />
              Current Eye Drops & Medications
            </div>
            <Button type="button" size="sm" onClick={addMedication}>
              <Plus className="h-4 w-4 mr-1" />
              Add Medication
            </Button>
          </CardTitle>
          <CardDescription>
            Active eye drop prescriptions and ocular medications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.currentEyeDrops.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No current eye medications recorded. Click "Add Medication" to add one.
            </p>
          ) : (
            data.currentEyeDrops.map((med) => (
              <Card key={med.id} className="border border-blue-200">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Medication #{data.currentEyeDrops.indexOf(med) + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMedication(med.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Medication Name</Label>
                      <Input
                        placeholder="e.g., Latanoprost 0.005%"
                        value={med.name}
                        onChange={(e) => updateMedication(med.id, 'name', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Eye</Label>
                      <Select
                        value={med.eye}
                        onValueChange={(value) => updateMedication(med.id, 'eye', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OD">Right Eye (OD)</SelectItem>
                          <SelectItem value="OS">Left Eye (OS)</SelectItem>
                          <SelectItem value="OU">Both Eyes (OU)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Frequency</Label>
                      <Input
                        placeholder="e.g., Once daily at bedtime"
                        value={med.frequency}
                        onChange={(e) => updateMedication(med.id, 'frequency', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Indication</Label>
                      <Input
                        placeholder="e.g., IOP control for POAG"
                        value={med.indication}
                        onChange={(e) => updateMedication(med.id, 'indication', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Other Eye Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Other Eye Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select any other eye conditions</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {eyeConditions.map(condition => (
                <div key={condition} className="flex items-center space-x-2">
                  <Checkbox
                    id={`condition-${condition}`}
                    checked={data.otherConditions.includes(condition)}
                    onCheckedChange={(checked) => {
                      const updated = checked
                        ? [...data.otherConditions, condition]
                        : data.otherConditions.filter(c => c !== condition);
                      handleFieldChange('otherConditions', updated);
                    }}
                  />
                  <Label htmlFor={`condition-${condition}`} className="cursor-pointer text-sm">
                    {condition}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="familyHistoryEyeDisease">Family History of Eye Disease</Label>
            <Textarea
              id="familyHistoryEyeDisease"
              placeholder="e.g., Mother has glaucoma, Father had retinal detachment at age 65"
              value={data.familyHistoryEyeDisease}
              onChange={(e) => handleFieldChange('familyHistoryEyeDisease', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
