'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  X, 
  Scissors, 
  Calculator, 
  Package, 
  ClipboardList,
  Users,
  FileText,
  ArrowRight,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import SurgeryTypeSelector from './surgery/SurgeryTypeSelector';
import IOLCalculatorIntegration from './surgery/IOLCalculatorIntegration';
import PackageSelector from './surgery/PackageSelector';
import PreOpChecklistGenerator from './surgery/PreOpChecklistGenerator';
import type { DiagnosisCode } from '@/types/diagnosis';
import { toast } from 'react-hot-toast';

export interface SurgeryRecommendation {
  surgeryType: 'Cataract' | 'Glaucoma' | 'Vitreoretinal' | 'Corneal';
  subType?: string; // e.g., "Phaco + IOL", "Trabeculectomy"
  eye: 'OD' | 'OS' | 'OU';
  iolPower?: number;
  iolFormula?: string;
  packageType: 'Standard' | 'Premium' | 'Custom';
  packagePrice?: number;
  preOpChecklist: string[];
  sendToCounselor: boolean;
  counselorNotes?: string;
  generatePreOpOrders: boolean;
  scheduleSurgery: boolean;
  surgeryDate?: Date;
  urgency: 'Routine' | 'Urgent' | 'Emergency';
  notes?: string;
}

interface SurgeryRecommendationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  diagnosis: DiagnosisCode;
  onRefer: (surgeryData: SurgeryRecommendation) => void;
}

const STEPS = [
  { id: 1, name: 'Surgery Type', icon: Scissors },
  { id: 2, name: 'IOL Calculator', icon: Calculator },
  { id: 3, name: 'Package', icon: Package },
  { id: 4, name: 'Pre-op Checklist', icon: ClipboardList },
  { id: 5, name: 'Actions', icon: Users },
];

export default function SurgeryRecommendationDialog({
  isOpen,
  onClose,
  patientId,
  patientName,
  diagnosis,
  onRefer,
}: SurgeryRecommendationDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [surgeryType, setSurgeryType] = useState<'Cataract' | 'Glaucoma' | 'Vitreoretinal' | 'Corneal' | null>(null);
  const [subType, setSubType] = useState<string>('');
  const [eye, setEye] = useState<'OD' | 'OS' | 'OU'>('OD');
  const [iolPower, setIolPower] = useState<number | undefined>();
  const [iolFormula, setIolFormula] = useState<string>('');
  const [packageType, setPackageType] = useState<'Standard' | 'Premium' | 'Custom'>('Standard');
  const [packagePrice, setPackagePrice] = useState<number | undefined>();
  const [preOpChecklist, setPreOpChecklist] = useState<string[]>([]);
  const [sendToCounselor, setSendToCounselor] = useState(true);
  const [counselorNotes, setCounselorNotes] = useState('');
  const [generatePreOpOrders, setGeneratePreOpOrders] = useState(true);
  const [scheduleSurgery, setScheduleSurgery] = useState(false);
  const [surgeryDate, setSurgeryDate] = useState<Date | undefined>();
  const [urgency, setUrgency] = useState<'Routine' | 'Urgent' | 'Emergency'>('Routine');
  const [notes, setNotes] = useState('');

  const handleClose = () => {
    // Reset all state
    setCurrentStep(1);
    setSurgeryType(null);
    setSubType('');
    setEye('OD');
    setIolPower(undefined);
    setIolFormula('');
    setPackageType('Standard');
    setPackagePrice(undefined);
    setPreOpChecklist([]);
    setSendToCounselor(true);
    setCounselorNotes('');
    setGeneratePreOpOrders(true);
    setScheduleSurgery(false);
    setSurgeryDate(undefined);
    setUrgency('Routine');
    setNotes('');
    onClose();
  };

  const canProceedToStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return true;
      case 2:
        return surgeryType !== null && subType !== '';
      case 3:
        // If cataract, need IOL power; otherwise can skip
        if (surgeryType === 'Cataract') {
          return iolPower !== undefined;
        }
        return true;
      case 4:
        return packageType !== null;
      case 5:
        return preOpChecklist.length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceedToStep(currentStep + 1)) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.error('Please complete current step before proceeding');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!surgeryType) {
      toast.error('Please select surgery type');
      return;
    }

    const recommendation: SurgeryRecommendation = {
      surgeryType,
      subType,
      eye,
      iolPower,
      iolFormula,
      packageType,
      packagePrice,
      preOpChecklist,
      sendToCounselor,
      counselorNotes: counselorNotes || undefined,
      generatePreOpOrders,
      scheduleSurgery,
      surgeryDate: surgeryDate || undefined,
      urgency,
      notes: notes || undefined,
    };

    onRefer(recommendation);
    toast.success('Surgery recommendation saved');
    handleClose();
  };

  // Skip IOL calculator step if not cataract surgery
  const getNextStep = () => {
    if (currentStep === 1 && surgeryType !== 'Cataract') {
      return 3; // Skip IOL calculator
    }
    return currentStep + 1;
  };

  const getPreviousStep = () => {
    if (currentStep === 3 && surgeryType !== 'Cataract') {
      return 1; // Skip IOL calculator backwards
    }
    return currentStep - 1;
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Scissors className="h-6 w-6 text-white" />
                      <div>
                        <Dialog.Title className="text-xl font-semibold text-white">
                          Surgery Recommendation
                        </Dialog.Title>
                        <p className="text-sm text-indigo-100">
                          Patient: {patientName} • Diagnosis: {diagnosis.description}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleClose}
                      className="rounded-full p-1 hover:bg-indigo-500 transition-colors"
                    >
                      <X className="h-5 w-5 text-white" />
                    </button>
                  </div>

                  {/* Steps Progress */}
                  <div className="mt-4 flex items-center justify-between">
                    {STEPS.map((step, index) => {
                      const StepIcon = step.icon;
                      const isActive = currentStep === step.id;
                      const isCompleted = currentStep > step.id;
                      const isSkipped = step.id === 2 && surgeryType !== 'Cataract';

                      return (
                        <div key={step.id} className="flex items-center flex-1">
                          <div className="flex flex-col items-center">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                                isActive
                                  ? 'border-white bg-white text-indigo-600'
                                  : isCompleted
                                  ? 'border-green-300 bg-green-300 text-green-700'
                                  : isSkipped
                                  ? 'border-indigo-300 bg-indigo-400 text-indigo-200'
                                  : 'border-indigo-300 bg-indigo-500 text-indigo-200'
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : (
                                <StepIcon className="h-5 w-5" />
                              )}
                            </div>
                            <span
                              className={`mt-1 text-xs font-medium ${
                                isActive ? 'text-white' : 'text-indigo-200'
                              }`}
                            >
                              {step.name}
                            </span>
                          </div>
                          {index < STEPS.length - 1 && (
                            <div
                              className={`flex-1 h-0.5 mx-2 ${
                                currentStep > step.id ? 'bg-green-300' : 'bg-indigo-400'
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
                  {currentStep === 1 && (
                    <SurgeryTypeSelector
                      diagnosis={diagnosis}
                      selectedType={surgeryType}
                      selectedSubType={subType}
                      selectedEye={eye}
                      onTypeChange={setSurgeryType}
                      onSubTypeChange={setSubType}
                      onEyeChange={setEye}
                    />
                  )}

                  {currentStep === 2 && surgeryType === 'Cataract' && (
                    <IOLCalculatorIntegration
                      patientId={patientId}
                      eye={eye}
                      onIOLPowerCalculated={(power, formula) => {
                        setIolPower(power);
                        setIolFormula(formula);
                      }}
                    />
                  )}

                  {currentStep === 3 && (
                    <PackageSelector
                      surgeryType={surgeryType || 'Cataract'}
                      selectedPackage={packageType}
                      onPackageChange={(pkg, price) => {
                        setPackageType(pkg);
                        setPackagePrice(price);
                      }}
                    />
                  )}

                  {currentStep === 4 && (
                    <PreOpChecklistGenerator
                      surgeryType={surgeryType || 'Cataract'}
                      checklist={preOpChecklist}
                      onChecklistChange={setPreOpChecklist}
                    />
                  )}

                  {currentStep === 5 && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Actions & Scheduling
                      </h3>

                      {/* Send to Counselor */}
                      <div className="border rounded-lg p-4 space-y-3">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sendToCounselor}
                            onChange={(e) => setSendToCounselor(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                          <div className="flex items-center space-x-2">
                            <Users className="h-5 w-5 text-indigo-600" />
                            <span className="font-medium text-gray-900">
                              Send to Counselor
                            </span>
                          </div>
                        </label>
                        {sendToCounselor && (
                          <textarea
                            value={counselorNotes}
                            onChange={(e) => setCounselorNotes(e.target.value)}
                            placeholder="Notes for counselor (package discussion, financial counseling, etc.)"
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        )}
                      </div>

                      {/* Generate Pre-op Orders */}
                      <div className="border rounded-lg p-4">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={generatePreOpOrders}
                            onChange={(e) => setGeneratePreOpOrders(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                          <div className="flex items-center space-x-2">
                            <FileText className="h-5 w-5 text-indigo-600" />
                            <span className="font-medium text-gray-900">
                              Generate Pre-op Investigation Orders
                            </span>
                          </div>
                        </label>
                        <p className="ml-7 mt-1 text-sm text-gray-600">
                          Automatically add pre-op investigations to billing
                        </p>
                      </div>

                      {/* Schedule Surgery */}
                      <div className="border rounded-lg p-4 space-y-3">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={scheduleSurgery}
                            onChange={(e) => setScheduleSurgery(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                          <span className="font-medium text-gray-900">
                            Schedule Surgery Now (Optional)
                          </span>
                        </label>
                        {scheduleSurgery && (
                          <div className="ml-7 space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Surgery Date
                              </label>
                              <input
                                type="date"
                                value={surgeryDate?.toISOString().split('T')[0] || ''}
                                onChange={(e) => setSurgeryDate(new Date(e.target.value))}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Urgency
                              </label>
                              <select
                                value={urgency}
                                onChange={(e) => setUrgency(e.target.value as any)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="Routine">Routine</option>
                                <option value="Urgent">Urgent</option>
                                <option value="Emergency">Emergency</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Additional Notes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Additional Notes (Optional)
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Any additional surgical notes, special considerations, or instructions..."
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t bg-gray-50 px-6 py-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Step {currentStep} of {STEPS.length}
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setCurrentStep(getPreviousStep())}
                      disabled={currentStep === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Previous</span>
                    </button>

                    {currentStep < STEPS.length ? (
                      <button
                        onClick={() => setCurrentStep(getNextStep())}
                        disabled={!canProceedToStep(getNextStep())}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        <span>Next</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Submit Recommendation</span>
                      </button>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
