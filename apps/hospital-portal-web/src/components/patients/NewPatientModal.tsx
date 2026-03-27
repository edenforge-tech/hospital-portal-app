'use client';

import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { patientApi } from '@/lib/api/patients.api';

interface PatientFormData {
  // Phase 6: Extended Demographics
  title: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  age: string; // NEW: Direct age entry
  nationality: string;
  occupation: string;
  maritalStatus: string;
  religion: string;
  languagePreference: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  bloodGroup: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  emergencyContactEmail: string;
  emergencyContactAddress: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  insuranceGroupNumber: string;
  insuranceValidFrom: string;
  insuranceValidTo: string;
  // Phase 2: Identity Documents
  healthId: string;
  aadhaarNumber: string;
  nationalId: string;
  passportNumber: string;
  drivingLicense: string;
  idProofType: string;
  // Phase 3: Guardian Information
  guardianName: string;
  guardianRelationship: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianAddress: string;
  guardianIdProof: string;
  disabilityStatus: string;
  // Phase 7: Patient Photo
  photoFile: File | null;
  photoPreview: string | null;
  // Phase 5: Structured Address
  addressLine1: string;
  addressLine2: string;
  country: string;
  district: string;
  landmark: string;
  pinCode: string;
}

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientCreated: () => void;
}

export default function NewPatientModal({ isOpen, onClose, onPatientCreated }: NewPatientModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-gray-900">Register New Patient</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Registration Form Content */}
          <div className="p-6">
            <NewPatientForm onClose={onClose} onPatientCreated={onPatientCreated} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Separate form component for better organization
function NewPatientForm({ onClose, onPatientCreated }: { onClose: () => void, onPatientCreated: () => void }) {
  const [formData, setFormData] = useState<PatientFormData>({
    title: '',
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    age: '',
    nationality: '',
    occupation: '',
    maritalStatus: '',
    religion: '',
    languagePreference: '',
    gender: 'Male',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    bloodGroup: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    emergencyContactEmail: '',
    emergencyContactAddress: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    insuranceGroupNumber: '',
    insuranceValidFrom: '',
    insuranceValidTo: '',
    healthId: '',
    aadhaarNumber: '',
    nationalId: '',
    passportNumber: '',
    drivingLicense: '',
    idProofType: '',
    guardianName: '',
    guardianRelationship: '',
    guardianPhone: '',
    guardianEmail: '',
    guardianAddress: '',
    guardianIdProof: '',
    disabilityStatus: '',
    photoFile: null,
    photoPreview: null,
    addressLine1: '',
    addressLine2: '',
    country: '',
    district: '',
    landmark: '',
    pinCode: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PatientFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [calculatedAge, setCalculatedAge] = useState<string>('');
  const [showWebcam, setShowWebcam] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate age from DOB in format: X years, Y months, Z days
  const calculateAge = (dob: string): string => {
    if (!dob) return '';
    
    const birthDate = new Date(dob);
    const today = new Date();
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();
    
    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    const parts = [];
    if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} month${months !== 1 ? 's' : ''}`);
    if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    
    return parts.join(', ') || '0 days';
  };

  // Calculate approximate DOB from age (in years)
  const calculateDOBFromAge = (ageYears: string): string => {
    if (!ageYears || isNaN(parseInt(ageYears))) return '';
    
    const age = parseInt(ageYears);
    const today = new Date();
    const approximateDOB = new Date(today.getFullYear() - age, today.getMonth(), today.getDate());
    
    return approximateDOB.toISOString().split('T')[0];
  };

  // Handle DOB change
  const handleDOBChange = (value: string) => {
    setFormData({ ...formData, dateOfBirth: value, age: '' });
    setCalculatedAge(calculateAge(value));
  };

  // Handle direct age entry
  const handleAgeChange = (value: string) => {
    setFormData({ ...formData, age: value, dateOfBirth: '' });
    const dob = calculateDOBFromAge(value);
    if (dob) {
      setFormData(prev => ({ ...prev, dateOfBirth: dob, age: value }));
      setCalculatedAge(calculateAge(dob));
    }
  };

  // Get numeric age for conditional logic
  const getNumericAge = (): number | null => {
    if (!formData.dateOfBirth) return null;
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Check if Guardian step should be shown (age < 18 OR age >= 65)
  const shouldShowGuardianStep = (): boolean => {
    const age = getNumericAge();
    if (age === null) return false;
    return age < 18 || age >= 65;
  };

  // Get total steps based on conditional guardian step
  const getTotalSteps = (): number => {
    return shouldShowGuardianStep() ? 6 : 5;
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof PatientFormData, string>> = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.dateOfBirth && !formData.age) newErrors.dateOfBirth = 'Date of birth or age is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
    }

    if (step === 2) {
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
      if (formData.phone && !/^\+?[\d\s()-]+$/.test(formData.phone)) {
        newErrors.phone = 'Invalid phone format';
      }
    }

    if (step === 3) {
      if (formData.aadhaarNumber && !/^\d{12}$/.test(formData.aadhaarNumber)) {
        newErrors.aadhaarNumber = 'Aadhaar must be exactly 12 digits';
      }
    }

    if (step === 4 && shouldShowGuardianStep()) {
      const age = getNumericAge();
      if (age !== null && (age < 18 || age >= 65)) {
        if (!formData.guardianName.trim()) {
          newErrors.guardianName = 'Guardian name is required';
        }
        if (!formData.guardianPhone.trim()) {
          newErrors.guardianPhone = 'Guardian phone is required';
        }
      }
      if (formData.guardianEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guardianEmail)) {
        newErrors.guardianEmail = 'Invalid guardian email format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      const nextStep = currentStep + 1;
      // Skip guardian step if not needed
      if (nextStep === 4 && !shouldShowGuardianStep()) {
        setCurrentStep(5);
      } else {
        setCurrentStep(nextStep);
      }
    }
  };

  const handlePrevious = () => {
    const prevStep = currentStep - 1;
    // Skip guardian step if not needed
    if (prevStep === 4 && !shouldShowGuardianStep()) {
      setCurrentStep(3);
    } else {
      setCurrentStep(prevStep);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { photoFile, photoPreview, age, ...patientData } = formData;
      
      const cleanPayload = Object.entries(patientData).reduce((acc, [key, value]) => {
        if (key === 'email' || key === 'guardianEmail') {
          acc[key] = value?.trim() || null;
        } else {
          acc[key] = value === '' ? null : value;
        }
        return acc;
      }, {} as any);
      
      const payload = {
        ...cleanPayload,
        status: 'Active'
      };

      const response = await patientApi.create(payload);
      const patientId = response.data.id;

      if (formData.photoFile && patientId) {
        try {
          const photoFormData = new FormData();
          photoFormData.append('photo', formData.photoFile);
          await patientApi.uploadPhoto(patientId, photoFormData);
        } catch (photoErr) {
          console.error('Failed to upload photo:', photoErr);
        }
      }

      alert('Patient created successfully!');
      onPatientCreated();
      onClose();
    } catch (err: any) {
      alert('Failed to create patient: ' + (err.response?.data?.message || 'Unknown error'));
      console.error('Error creating patient:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Webcam functions
  const startWebcam = async () => {
    try {
      setShowWebcam(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 } 
      });
      setStream(mediaStream);
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(err => console.error('Error playing video:', err));
        }
      }, 100);
    } catch (error) {
      console.error('Error accessing webcam:', error);
      alert('Could not access webcam. Please check permissions.');
      setShowWebcam(false);
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowWebcam(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        // Mirror correction
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `webcam-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
            const reader = new FileReader();
            reader.onloadend = () => {
              setFormData({
                ...formData,
                photoFile: file,
                photoPreview: reader.result as string
              });
            };
            reader.readAsDataURL(file);
            stopWebcam();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const renderStepIndicator = () => {
    const totalSteps = getTotalSteps();
    const steps = [];
    for (let i = 1; i <= totalSteps; i++) {
      steps.push(i);
    }

    return (
      <div className="flex justify-between items-center mb-8">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep === step
                  ? 'bg-blue-600 text-white'
                  : currentStep > step
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {currentStep > step ? '✓' : step}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  currentStep > step ? 'bg-green-600' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderStepTitle = () => {
    const titles: { [key: number]: string } = shouldShowGuardianStep() 
      ? {
          1: 'Personal Information',
          2: 'Contact Information',
          3: 'Identity Documents',
          4: 'Guardian Information',
          5: 'Emergency Contact',
          6: 'Insurance Information'
        }
      : {
          1: 'Personal Information',
          2: 'Contact Information',
          3: 'Identity Documents',
          4: 'Emergency Contact',
          5: 'Insurance Information'
        };
    
    return (
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {titles[currentStep]}
      </h2>
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      {renderStepIndicator()}
      {renderStepTitle()}

      {/* Form steps */}
      <div className="min-h-[400px]">
        {/* FORM STEPS WILL BE ADDED IN PART 2 DUE TO CHARACTER LIMIT */}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className={`px-6 py-2 rounded-md ${
            currentStep === 1
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          Previous
        </button>

        <div className="flex gap-2">
          {currentStep < getTotalSteps() ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => handleSubmit(e)}
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-md ${
                isSubmitting
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {isSubmitting ? 'Creating...' : 'Create Patient'}
            </button>
          )}
        </div>
      </div>

      {/* Hidden canvas for webcam capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </form>
  );
}
